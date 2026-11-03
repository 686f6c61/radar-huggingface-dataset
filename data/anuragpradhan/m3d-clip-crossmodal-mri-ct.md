# anuragpradhan/M3D-CLIP-CrossModal-MRI-CT

## Resumen

M3D-CLIP-CrossModal-MRI-CT es un codificador de visión 3D derivado por ajuste fino del modelo fundacional M3D-CLIP (GoodBaiBai88/M3D-CLIP). Lo desarrolla el usuario anuragpradhan y su objetivo es cerrar la brecha de dominio entre resonancia magnética (MRI) y tomografía computarizada (CT) en volúmenes médicos 3D. El modelo base fue preentrenado sobre volúmenes de CT emparejados con informes radiológicos textuales, pero su codificador visual rinde mal cuando se aplica directamente a MRI por diferencias físicas de intensidad, contraste tisular invertido y inhomogeneidades del escáner.

La aportación del modelo es una destilación contrastiva entre profesor y alumno (InfoNCE): un profesor CT congelado genera embeddings de referencia y un alumno MRI aprende a proyectar volúmenes de resonancia al mismo espacio latente métrico. El resultado es un encoder de 198 millones de parámetros, 12 capas de ViT 3D, que devuelve tanto un vector global `[CLS]` de 768 dimensiones como 2048 tokens de parche con estructura espacial 3D.

Es relevante porque habilita recuperación cruzada de pacientes entre modalidades, clasificación anatómica y modulación de modelos generativos de difusión para síntesis MRI-a-CT, un paso habitual en flujos de planificación radioterápica. El repositorio es pequeño (0,8 GB), la licencia es Apache 2.0 y el pipeline declarado es `feature-extraction`, no generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (ViT) de 12 capas con patch embedding 3D de 4 x 16 x 16 |
| Parametros totales | 198.052.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada volumetrica fija de (1, 32, 256, 256) segun la model card |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo de imagen medica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y codigo custom) |

## Arquitectura y entrenamiento

El modelo es un ViT 3D con 12 bloques de atencion, patch embedding tridimensional de 4 x 16 x 16 y una dimension oculta de 768. La entrada esperada es un volumen MRI de forma (B, 1, 32, 256, 256) normalizado min-max a [0, 1]. La salida es un tensor (B, 2049, 768): el indice 0 corresponde al token `[CLS]` (B, 768) y los indices 1 a 2048 a los tokens de parche, que pueden reordenarse a (B, 768, 8, 16, 16) para conservar la geometria espacial.

El entrenamiento sigue un esquema de destilacion contrastiva cross-modal con perdida InfoNCE. El profesor es el codificador visual congelado de M3D-CLIP, preentrenado sobre CT y texto radiologico; el alumno es el codificador MRI, que adapta sus bloques de atencion para proyectar resonancias al mismo espacio latente que el profesor. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO (no aplicables a un encoder de este tipo). La innovacion tecnica destacable es la doble representacion: semantica global via `[CLS]` y guia espacial densa via tokens de parche, pensada para modular modelos generativos (FiLM/AdaLN) y para desambiguar estructuras como cortical osea frente a aire.

## Capacidades

- Extraccion de caracteristicas de volumenes MRI 3D con salida de embedding global de 768 dimensiones.
- Salida de tokens de parche densos (2048 tokens de 768 dimensiones) con estructura espacial 3D preservada.
- Recuperacion cross-modal paciente a paciente entre MRI y CT en el espacio latente alineado.
- Clasificacion y separacion de cohortes anatomicas (cabeza y cuello, torax, abdomen, pelvis) en el espacio latente.
- Guia densa para modelos generativos de difusion en sintesis MRI-a-CT (modulacion FiLM/AdaLN).
- No soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso.
- No soporta agentes ni capacidades multilingues.
- No dispone de modo thinking, vision 2D general, audio ni otras capacidades multimodales fuera del dominio de imagen medica volumetrica.

## Casos de uso

- Recuperacion de pacientes en cohortes multimodales: dado un MRI de un paciente, el encoder identifica su CT correspondiente entre todos los CT de la cohorte; la model card reporta Top-1 de 0,800 en test frente a 0,033 del modelo base.
- Sintesis MRI-a-CT guiada: los tokens de parche (B, 768, 8, 16, 16) alimentan modulaciones FiLM/AdaLN de un modelo de difusion para generar CT sintetico con coherencia anatomica, util en planificacion de radioterapia sin CT adicional.
- Clasificacion anatomica de cohortes: los embeddings `[CLS]` separan regiones (cabeza y cuello, torax, abdomen, pelvis) en clusters compactos, lo que permite etiquetado automatico y control de calidad de datasets.
- Busqueda de casos similares en PACS: indexar embeddings MRI de un archivo hospitalario para recuperar estudios de pacientes con anatomia o patologia comparable.
- Preprocesamiento para pipelines de registro multimodal: usar el espacio latente alineado como inicializacion o regularizador en registro MRI-CT.
- Control de calidad de adquisiciones: detectar resonancias con distribucion de embeddings atipica (artefactos, inhomogeneidades de campo) comparando con la geometria latente del profesor CT.
- Investigacion en aprendizaje contrastivo medico: servir como encoder MRI preentrenado y congelado para tareas downstream con pocas etiquetas.

## Benchmarks y rendimiento

Resultados de la model card sobre volumenes emparejados de pacientes reservados, en recuperacion cross-modal MRI-a-CT:

| Modelo | Top-1 | Top-5 | Rango mediano | Similitud coseno mismo paciente |
|---|---|---|---|---|
| M3D-CLIP base (zero-shot en MRI) | 0,033 (1/30) | 0,200 (6/30) | 14,5 | 0,128 ± 0,04 |
| M3D-CLIP-CrossModal-MRI-CT (validacion) | 0,353 | 0,725 | 1,0 | 0,654 ± 0,07 |
| M3D-CLIP-CrossModal-MRI-CT (test) | 0,800 | 0,967 | 1,0 | 0,654 ± 0,07 |

Mejora relativa declarada: +17,65x sobre el azar en Top-1, +3,6x en Top-5, rango mediano de 14,5 a 1,0 y +410 % en similitud coseno del mismo paciente. En t-SNE, el modelo base colapsa embeddings de distintas anatomias, mientras que este modelo forma clusters separados que coinciden con la geometria latente del CT. No se publican resultados de MMLU, HumanEval ni GSM8K (no aplicables a un encoder de imagen).

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan aproximadamente 0,8 GB en fp32; en fp16 o bf16 bajan a unos 0,4 GB, mas activaciones de atencion sobre 2049 tokens y volumenes de 32 x 256 x 256.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB para lotes pequenos; A100 o H100 para procesar cohortes completas con lotes mayores.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, con lotes pequenos y precision mixta.
- Opciones de despliegue: `transformers` con `AutoModel` y `trust_remote_code=True`; el codigo custom dificulta el uso directo en vLLM, TGI o llama.cpp, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del tamano del volumen y del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M3D-CLIP-CrossModal-MRI-CT | 198 M | MRI 3D, alineado a CT | Volumen (1, 32, 256, 256) | Apache 2.0 | HuggingFace, codigo custom |
| GoodBaiBai88/M3D-CLIP (base) | no disponible | CT 3D + texto | Volumen 3D y texto | no disponible en la informacion | HuggingFace |
| Encoders MRI 3D genericos (p. ej. variantes MONAI) | variable | MRI 3D | Volumen 3D | variable | HuggingFace / MONAI |

La comparativa cuantitativa solo esta disponible frente al modelo base: en recuperacion MRI-a-CT, este modelo pasa de Top-1 0,033 a 0,800 en test. No se dispone de datos de otros encoders comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado especificamente para MRI alineado con CT; su uso en otras modalidades (PET, ecografia) no esta validado.
- La entrada esta fijada a (1, 32, 256, 256); volumenes con otra resolucion o numero de cortes requieren remuestreo y pueden degradar el rendimiento.
- El modelo base tiene sesgos derivados de su preentrenamiento en CT y textos radiologicos; no se documenta analisis de sesgo por sexo, edad o etnia.
- Riesgo de falsos positivos en recuperacion de pacientes cuando las anatomias son muy similares; el Top-1 en validacion es 0,353, muy inferior al 0,800 de test.
- No es un modelo generativo ni un clasificador clinico validado; no debe usarse para diagnostico sin validacion externa.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar antes de desplegar en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria en dispositivos medicos recae en el integrador.
- No se documentan cuantizaciones ni soporte en runtimes de inferencia estandar para modelos de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/anuragpradhan/M3D-CLIP-CrossModal-MRI-CT
- Modelo base: https://huggingface.co/GoodBaiBai88/M3D-CLIP
- Paper referenciado en tags (arXiv:2404.00578): https://arxiv.org/abs/2404.00578
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- PyTorch: https://pytorch.org/
- Repositorio MONAI (dependencia de preprocesamiento): https://github.com/Project-MONAI/MONAI
