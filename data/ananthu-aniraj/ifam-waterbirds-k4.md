# ananthu-aniraj/ifam-waterbirds-k4

## Resumen

IFAM (Iterative Focus and Attention Masking) es un marco de clasificación de imágenes en dos etapas propuesto por Ananthu Aniraj y colaboradores en el artículo «Two-stage Vision Transformers and Hard Masking offer Robust Object Representations», aceptado como presentación oral en ICPR 2026. El modelo presentado aquí es un checkpoint preentrenado sobre el dataset Waterbirds con K=4 partes, diseñado para mejorar la robustez frente a correlaciones espurias y fondos fuera de distribución.

La arquitectura combina un selector (etapa 1) que procesa la imagen completa para identificar regiones relevantes del objeto, y un predictor (etapa 2) que restringe su campo receptivo mediante enmascaramiento de atención, evitando que los detalles de fondo interfieran en la clasificación. El modelo se basa en DINOv2 y cuenta con 173,18 millones de parámetros, lo que lo sitúa en un rango ligero para tareas de visión. Su relevancia radica en ofrecer representaciones robustas y auditables, con máscaras semánticas explícitas que permiten intervenciones en tiempo de prueba.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer de dos etapas (selector + predictor) basado en DINOv2 |
| Parametros totales | 173.180.165 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

IFAM emplea un enfoque de dos etapas. La primera etapa, denominada selector, recibe la imagen completa y genera máscaras de atención que identifican las partes del objeto y las regiones relevantes para la tarea. La segunda etapa, el predictor, aplica un enmascaramiento duro (hard masking) sobre la imagen original, restringiendo su campo receptivo únicamente a las regiones seleccionadas. Este diseño evita que el modelo aprenda correlaciones espurias con el fondo, mejorando la robustez ante cambios de contexto.

El modelo se entrena sobre el dataset Waterbirds, que combina imágenes de aves con fondos diversos y presenta correlaciones espurias conocidas entre especie y hábitat. El checkpoint con K=4 indica que el selector descubre cuatro partes del objeto. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal reside en el enmascaramiento dinámico y en la auditabilidad de las máscaras, que permiten intervenciones en tiempo de inferencia para corregir o reforzar el comportamiento del modelo.

## Capacidades

- Clasificacion de imagenes con robustez frente a correlaciones espurias y fondos fuera de distribucion.
- Descubrimiento de partes del objeto mediante atencion enmascarada (K=4 en este checkpoint).
- Generacion de mascaras semanticas explicitas que hacen el razonamiento del modelo auditable.
- Soporte de intervenciones en tiempo de prueba para ajustar el comportamiento sin reentrenamiento.
- Integracion con el ecosistema PyTorch y carga directa desde Hugging Face Hub.
- No incluye capacidades de generacion de texto, tool calling, agentes ni procesamiento multimodal mas alla de la vision.

## Casos de uso

- Investigacion en robustez de modelos de vision: el modelo sirve como referencia para estudiar el impacto del enmascaramiento duro en la reduccion de sesgos de fondo, permitiendo comparar metricas de robustez frente a modelos baseline.
- Clasificacion de aves en entornos naturales: gracias a su entrenamiento en Waterbirds, puede clasificar especies de aves ignorando el habitat, util en aplicaciones de monitorizacion ecologica donde el fondo varia.
- Auditoria de decisiones en sistemas de vision: las mascaras generadas permiten inspeccionar que regiones de la imagen influyen en la prediccion, facilitando la depuracion de sistemas de clasificacion en produccion.
- Desarrollo de tecnicas de intervencion en inferencia: al ser posible modificar las mascaras en tiempo de prueba, el modelo es util para experimentar con estrategias de correccion de errores sin reentrenar.
- Base para fine-tuning en dominios especificos: al estar preentrenado con representaciones robustas, puede adaptarse a tareas de clasificacion con pocos datos donde el fondo sea una fuente de ruido.
- Evaluacion de metodos de atencion interpretable: el modelo proporciona un punto de comparacion para metodos de visualizacion y explicabilidad en vision por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado (arXiv:2506.08915) presenta experimentos, pero no se incluyen cifras concretas en la model card ni en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 173 millones de parametros, el modelo es ligero; en precision fp32 ocuparia aproximadamente 692 MB, en fp16 unos 346 MB y en int8 unos 173 MB, pero estos valores son estimaciones teoricas y no se han verificado.
- GPU recomendadas: no disponible. Dado el tamano, es probable que quepa en GPUs consumer como RTX 3060 o superiores, pero no hay datos oficiales.
- Opciones de despliegue: el modelo se carga mediante PyTorch y el repositorio `ifam` en GitHub. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son tipicas de modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificacion robusta con enmascaramiento). El propio autor publica otros checkpoints como `pdiscoformer_nabirds_k_4`, pero no se han encontrado datos de comparacion directa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en Waterbirds, un dataset con correlaciones espurias conocidas; su rendimiento en otros dominios puede degradarse.
- No se han publicado metricas de rendimiento ni evaluaciones independientes, por lo que su eficacia en produccion no esta validada.
- Al ser un modelo de investigacion, carece de soporte oficial y de documentacion de despliegue a gran escala.
- Las mascaras generadas dependen de la configuracion K=4; otros valores de K pueden requerir reentrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el codigo asociado en GitHub puede tener condiciones adicionales no verificadas.
- No se ha evaluado el riesgo de sesgos demograficos o de contexto mas alla de los fondos de Waterbirds.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ananthu-aniraj/ifam-waterbirds-k4
- Articulo en arXiv: https://arxiv.org/abs/2506.08915
- Repositorio GitHub: https://github.com/ananthu-aniraj/ifam
- Pagina personal del autor: https://ananthu-aniraj.github.io/
- Dataset Waterbirds en el repositorio: https://github.com/ananthu-aniraj/ifam/blob/main/data_sets/waterbirds_dataset.py
