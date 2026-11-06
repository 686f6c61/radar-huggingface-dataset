# nidl-neurospin/neuro-jepa-vit-b

## Resumen

Neuro-JEPA ViT-B es un modelo fundacional auto-supervisado para resonancia magnetica cerebral 3D, desarrollado por el grupo NYUMedML (NYU Langone Health) y empaquetado para la libreria nidl por nidl-neurospin (NeuroSpin). Extiende el marco V-JEPA 2 al dominio volumetrico: en lugar de predecir pixeles, aprende a predecir representaciones latentes de parches enmascarados, lo que lo hace adecuado para extraccion de caracteristicas y ajuste fino en tareas de neuroimagen.

El modelo emplea un encoder 3D ViT-B de 12 capas con mezcla dispersa de expertos (MoE), 122 millones de parametros y representaciones de 768 dimensiones. Se preentreno sobre aproximadamente 1,55 millones de exploraciones T1, T2 y FLAIR de NYU Langone Health, cubriendo multiples modalidades y patologias.

Es relevante porque ofrece una alternativa de codigo abierto (configuracion CeCILL-B) a los modelos fundacionales de neuroimagen propietarios, con verificacion de fidelidad bit a bit frente al codigo oficial en las 3.984 imagenes de OpenBHB. Su principal restriccion es que los pesos originales estan bajo CC-BY-NC-ND 4.0, lo que limita el uso comercial y la creacion de derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D ViT-B (12 capas) con mezcla dispersa de expertos, `VisionTransformer3DMoE` |
| Parametros totales | 122 M (solo encoder) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (entrada volumetrica fija de 1 x 96 x 108 x 96) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen medica) |
| Licencia | Configuracion nidl: CeCILL-B; pesos originales: CC-BY-NC-ND 4.0 |
| Formato de pesos | no disponible (los pesos no se alojan en este repositorio; se descargan desde NYUMedML/Neuro-JEPA) |
| Dimension de caracteristicas | 768 |
| Modalidades de entrada | T1w, T2w, FLAIR |
| Preprocesamiento | `NeuroJEPAPreprocessing` (RAS, intensidades [0,1], recorte cerebral, resize a 96 x 108 x 96) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma JEPA (Joint-Embedding Predictive Architecture) adaptado a volumenes 3D. Un encoder ViT-B de 12 capas procesa parches volumetricos y se entrena para predecir representaciones latentes de regiones enmascaradas a partir del contexto visible, en lugar de reconstruir intensidades. El backbone incorpora una mezcla dispersa de expertos, lo que permite aumentar la capacidad sin escalar linealmente el coste computacional por token.

El preentrenamiento es auto-supervisado sobre aproximadamente 1,55 millones de exploraciones de resonancia magnetica cerebral (T1, T2 y FLAIR) procedentes de NYU Langone Health. No se especifican en la informacion disponible el numero exacto de tokens, la composicion detallada del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio). Solo se publica el encoder: al cargar el estimador `NeuroJEPA`, el encoder se replica en ambas ramas y el predictor permanece con pesos aleatorios.

La integracion en nidl anade una capa de reproducibilidad: las caracteristicas del estimador cargado son bit-identicas a las del codigo oficial, incluyendo el preprocesamiento, sobre las 3.984 imagenes de OpenBHB.

## Capacidades

- Extraccion de caracteristicas de resonancia magnetica cerebral 3D (T1w, T2w, FLAIR) en un vector de 768 dimensiones.
- Aprendizaje auto-supervisado de representaciones latentes, sin necesidad de etiquetas durante el preentrenamiento.
- Ajuste fino supervisado mediante el metodo `fit` del estimador para tareas downstream (regresion, clasificacion).
- Procesamiento de volumenes completos con preprocesamiento integrado (reorientacion RAS, normalizacion, recorte y resize).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de vision medica, no un LLM.
- No soporta generacion de texto ni capacidades multilingues.
- No dispone de modo thinking, vision 2D natural, audio ni otras capacidades multimodales fuera del dominio MRI.

## Casos de uso

- Prediccion de edad cerebral: regresion ridge sobre caracteristicas congeladas alcanza un MAE de 3,17 anos y R² de 0,88 en el conjunto de test de OpenBHB (757 participantes). Util para estudiar envejecimiento y neurodesarrollo.
- Biomarcadores de neurodegeneracion: extraccion de embeddings para clasificar deterioro cognitivo leve o Alzheimer a partir de T1w, aprovechando que el preentrenamiento cubre patologias neurologicas.
- Segmentacion y deteccion de lesiones: ajuste fino del encoder sobre datasets etiquetados de lesiones (p. ej. accidentes cerebrovasculares) usando FLAIR, modalidad incluida en el preentrenamiento.
- Armonizacion entre centros: al entrenarse con 1,55 millones de escaneos de multiples equipos, los embeddings pueden servir como representacion comun para corregir efectos de sitio en estudios multicentricos.
- Recuperacion de imagenes similares: busqueda por similitud en el espacio latente de 768 dimensiones para construir cohortes o encontrar casos comparables en bases de datos hospitalarias.
- Preentrenamiento transferido para tareas con pocas etiquetas: usar el encoder congelado y entrenar solo un cabezal lineal en escenarios con cientos de sujetos, reduciendo el coste de anotacion radiologica.
- Control de calidad de pipelines de neuroimagen: detectar volumenes atipicos comparando sus embeddings con la distribucion de referencia del modelo.

## Benchmarks y rendimiento

| Tarea | Metrica | Resultado | Conjunto |
|---|---|---|---|
| Prediccion de edad (regresion ridge sobre caracteristicas congeladas) | MAE | 3,17 anos | OpenBHB test (757 sujetos) |
| Prediccion de edad (regresion ridge sobre caracteristicas congeladas) | R² | 0,88 | OpenBHB test (757 sujetos) |
| Fidelidad frente al codigo oficial | Identidad bit a bit | Verificada | OpenBHB (3.984 imagenes) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, por no ser aplicables a este modelo. No se dispone de comparaciones numericas con modelos fundacionales de neuroimagen alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 122 M de parametros en fp32, el peso del encoder ronda los 0,5 GB; el pico de memoria depende del tamano de lote y de las activaciones del ViT 3D sobre volumenes de 96 x 108 x 96.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia poder ejecutar inferencia en lotes pequenos; para lotes mayores o ajuste fino se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 (12 GB), RTX 4070, RTX 4080 y RTX 4090, aunque no se han publicado mediciones oficiales.
- Opciones de despliegue: la libreria nidl (`pip install nidl[pretrained]`) con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neuro-JEPA ViT-B (este) | 122 M (encoder) | Volumen 1 x 96 x 108 x 96 | MAE 3,17 anos en OpenBHB (edad) | CeCILL-B (config) / CC-BY-NC-ND 4.0 (pesos) | Pesos gated en NYUMedML/Neuro-JEPA |
| Alternativas de neuroimagen fundacional | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables sobre modelos comparables de la misma categoria (por ejemplo, otros modelos fundacionales de MRI cerebral 3D) que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Los pesos originales estan bajo CC-BY-NC-ND 4.0: prohibido el uso comercial, el uso clinico y la creacion de derivados. La licencia CeCILL-B solo cubre la configuracion de nidl, no los pesos.
- El acceso a los pesos requiere solicitud en la pagina de NYUMedML/Neuro-JEPA y autenticacion con `huggingface-cli login`; este repositorio no contiene pesos.
- Solo se publica el encoder; el predictor del estimador `NeuroJEPA` permanece con pesos aleatorios, por lo que no debe usarse para tareas de prediccion latente sin ajuste.
- Entrada restringida a MRI cerebral con craneo eliminado, correccion de sesgo y registro afin a MNI152 a 1 mm; volumenes fuera de este preprocesamiento degradaran las caracteristicas.
- Solo cubre modalidades T1w, T2w y FLAIR; no soporta otras secuencias (difusion, fMRI, PET) ni imagenes 2D.
- Riesgo de sesgo poblacional: el preentrenamiento proviene de una unica institucion (NYU Langone Health), lo que puede limitar la generalizacion a otras poblaciones, equipos y protocolos.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero los embeddings pueden reflejar correlaciones espurias del dataset (edad, sitio, patologia) y producir predicciones sesgadas en subgrupos poco representados.
- No es un dispositivo medico: no debe usarse para diagnostico clinico sin validacion regulatoria.
- No se documentan cuantizaciones oficiales ni optimizaciones de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nidl-neurospin/neuro-jepa-vit-b
- Pesos originales (gated): https://huggingface.co/NYUMedML/Neuro-JEPA
- Paper: https://arxiv.org/abs/2606.14957
- Codigo original: https://github.com/NYUMedML/Neuro-JEPA
- Documentacion de nidl: https://neurospin-deepinsight.github.io/nidl
- Repositorio nidl: https://github.com/neurospin-deepinsight/nidl
- Ejemplo OpenBHB: https://neurospin-deepinsight.github.io/nidl/auto_examples/plot_pretrained_openbhb.html
