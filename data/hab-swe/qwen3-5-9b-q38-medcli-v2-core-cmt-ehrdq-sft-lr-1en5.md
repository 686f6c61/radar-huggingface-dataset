# hab-swe/Qwen3.5-9B-Q38-MedCLI-V2-Core-CMT-EHRDQ-SFT-LR-1en5

## Resumen

El modelo `hab-swe/Qwen3.5-9B-Q38-MedCLI-V2-Core-CMT-EHRDQ-SFT-LR-1en5` es un ajuste fino (fine-tune) publicado en HuggingFace por el usuario `hab-swe`, construido sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Cuenta con 9.409.813.744 parametros (9,41 B) y un repositorio de 18,8 GB en formato safetensors, lo que situa los pesos originales en precision de 16 bits. El pipeline declarado es `image-text-to-text`, de modo que se trata de un modelo multimodal que acepta imagenes y texto como entrada.

La nomenclatura del identificador sugiere un entrenamiento supervisado (SFT) orientado al dominio medico y de historiales clinicos electronicos, con un learning rate de 1e-5, aunque no se ha publicado documentacion que confirme el dataset, el procedimiento de entrenamiento ni las capacidades resultantes. El repositorio tiene acceso restringido (gated) y registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validacion independiente por parte de la comunidad.

Su relevancia actual es limitada pero concreta: se trata de un ejemplo de especializacion de un modelo multimodal de ~9 B sobre un dominio regulado (salud), con licencia Apache 2.0. Para un desarrollador o investigador, el interes principal esta en evaluar si un fine-tune de este tipo aporta ventajas frente al modelo base en tareas de extraccion y resumen de documentacion clinica, siempre con las cautelas propias de un artefacto sin model card detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` y el pipeline `image-text-to-text` apuntan a un transformer multimodal de la familia Qwen3.5; sin confirmacion documental) |
| Parametros totales | 9.409.813.744 (9,41 B), dato de safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles; el repositorio solo publica safetensors (18,8 GB, compatible con FP16/BF16). No hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modalidades de entrada | texto e imagen (`image-text-to-text`) |
| Modelo base | Qwen/Qwen3.5-9B-Base |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamanio del repositorio | 18,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. Los unicos indicios son el tag `qwen3_5`, la libreria declarada (`transformers`), el pipeline `image-text-to-text` y el modelo base `Qwen/Qwen3.5-9B-Base`, del que heredaria la topologia y el tokenizador. Todo apunta a un transformer decoder-only multimodal con proyeccion de imagenes a tokens, pero no hay confirmacion oficial.

Respecto al entrenamiento, el identificador del repositorio contiene indicios de un proceso de ajuste supervisado (SFT) con learning rate 1e-5 y referencias a componentes de dominio clinico (`MedCLI`, `CMT`, `EHRDQ`). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni si se aplicaron tecnicas de congelacion de capas o de adaptadores. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modo de razonamiento explicito, etc.).

## Capacidades

No existe model card con una lista de capacidades verificadas. A continuacion se enumeran las capacidades que pueden inferirse de los metadatos del repositorio, marcando explicitamente el nivel de certeza:

- Procesamiento conjunto de texto e imagen: el pipeline declarado es `image-text-to-text`, por lo que el modelo acepta entradas multimodales y genera texto. Nivel de certeza: alto (dato declarado en el repositorio).
- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta preparado para dialogos multi-turno.
- Ajuste fino sobre datos del dominio medico y de historiales clinicos electronicos: inferido del identificador del repositorio, no confirmado por documentacion.
- Razonamiento, codigo, matematicas, tool calling, function calling y comportamiento agente: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidades especiales (modo thinking, audio, video, grounding de imagenes): no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles del modelo segun su modalidad declarada y la especializacion sugerida por el nombre. En todos los casos requieren validacion empírica previa, dado que no hay evaluaciones publicadas.

- Extraccion estructurada de informes clinicos: el modelo, al ser `image-text-to-text`, puede recibir un informe escaneado o una captura y devolver un JSON con campos normalizados (diagnostico, codigo, fecha, profesional). Adecuado si el fine-tune ha trabajado sobre formularios de historia clinica electronica.
- Resumen de historiales de pacientes: condensar notas de evolucion, analiticas y pruebas de imagen en un resumen cronologico para revision rapida por parte del personal facultativo.
- Asistente conversacional de triaje: gestionar un dialogo multi-turno con el paciente para recoger sintomas y antecedentes antes de la consulta, aprovechando el tag `conversational` y el soporte de imagen para adjuntar fotografias de lesiones.
- Ayuda a la codificacion clinica (CIE-10 / SNOMED): sugerir codigos a partir del texto libre de un informe, con el informe original como contexto, para acelerar la facturacion y el registro estadistico.
- Indexacion y busqueda semantica sobre repositorios de documentos medicos: generar embeddings o resumenes por documento para alimentar un sistema RAG interno de una organizacion sanitaria.
- Control de calidad de datos en ensayos clinicos: detectar inconsistencias entre el CRF (case report form) y la documentacion fuente, comparando texto e imagen del formulario.
- Formacion medica y generacion de casos simulados: producir viñetas clinicas con imagen asociada para simulacros de diagnostico, siempre con supervision de un especialista.
- Preprocesado de pipelines de IA clinica: actuar como extractor previo en un flujo donde despues intervienen modelos especializados (clasificacion de patologia, deteccion de hallazgos en imagen).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye resultados de MMLU, HumanEval, GSM8K, MMMU, VQA medica ni de ninguna otra evaluacion, ni tampoco comparaciones con el modelo base. Dado que el artefacto registra 0 descargas y 0 likes, tampoco existen evaluaciones de terceros.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir de los 9,41 B de parametros; no estan publicadas por el autor.

- VRAM para pesos en FP16/BF16: unos 18,8 GB (coincide con el tamanio del repositorio). Con cache KV y activaciones, el consumo realista se situa entre 22 y 30 GB segun la longitud de contexto y el tamanio de batch.
- VRAM para pesos en int8: aproximadamente 9,4 GB de pesos, con un total esperado de 12 a 16 GB en ejecucion.
- VRAM para pesos en int4: aproximadamente 5,5 GB de pesos, con un total esperado de 8 a 11 GB en ejecucion. Requiere cuantizacion propia, ya que el repositorio no publica pesos cuantizados.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para trabajar en FP16 sin cuantizar.
- GPU de consumo: en FP16 no cabe en una RTX 4090 de 24 GB con contexto amplio, aunque puede ser viable con contextos cortos o repartiendo el modelo en dos GPU. En int8 cabe en una RTX 4090 o RTX 3090. En int4 cabe en RTX 4080, RTX 4070 Ti o RTX 3060 de 12 GB.
- Opciones de despliegue: `transformers` es la libreria declarada y el punto de partida mas directo. vLLM y TGI son viables si el modelo es compatible con sus implementaciones de Qwen3.5 (requiere verificar). llama.cpp y Ollama solo serian posibles tras convertir el modelo a GGUF, algo que el repositorio no ofrece.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la informacion proporcionada. La unica referencia verificable es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hab-swe/Qwen3.5-9B-...-SFT-LR-1en5 | 9,41 B | no disponible | image-text-to-text | apache-2.0 | Gated, 0 descargas |
| Qwen/Qwen3.5-9B-Base | no disponible | no disponible | no disponible | no disponible | Modelo base de referencia |
| Otros fine-tunes medicos multimodales de ~9 B | no disponible | no disponible | no disponible | no disponible | No identificados en la busqueda realizada |

## Limitaciones y advertencias

- Ausencia de model card: el repositorio no documenta dataset de entrenamiento, hiperparametros, procedimiento de evaluacion ni limitaciones conocidas.
- Sin validacion comunitaria: 0 descargas y 0 likes implican que no hay usuarios que hayan reportado comportamiento real en produccion.
- Riesgo de alucinacion elevado en dominio clinico: cualquier salida con contenido medico (dosis, diagnosticos, codigos) debe pasar por revision humana cualificada. No debe usarse como dispositivo medico ni como sustituto del juicio clinico.
- Sesgos no evaluados: al desconocerse la composicion del dataset, no puede descartarse sesgo demografico, de idioma ni de practica clinica regional.
- Cobertura linguistica desconocida: el campo de idiomas no esta informado, por lo que no hay garantia de calidad en castellano.
- Limite de contexto desconocido: no se puede planificar un caso de uso con documentos largos sin medir previamente la ventana efectiva.
- Acceso restringido: el modelo es gated y exige aceptar condiciones en HuggingFace antes de descargarlo, lo que complica la automatizacion de pipelines y la reproducibilidad.
- Licencia: Apache 2.0 permite uso comercial, pero hay que verificar de forma independiente las condiciones del modelo base y, en el contexto sanitario, el cumplimiento del RGPD y de la normativa aplicable al tratamiento de datos de salud. El entrenamiento con datos de pacientes exige base juridica y anonimizacion adecuada.
- Deriva de version: el identificador incluye un learning rate (`LR-1en5`) y un numero de version (`V2`), lo que sugiere que pueden existir otros checkpoints del mismo autor con comportamiento distinto. Conviene fijar el commit exacto en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hab-swe/Qwen3.5-9B-Q38-MedCLI-V2-Core-CMT-EHRDQ-SFT-LR-1en5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Perfil del autor: https://huggingface.co/hab-swe
- Paper, blog, repositorio o demo oficiales: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas corporativas de Microsoft, sin relacion con el artefacto).
