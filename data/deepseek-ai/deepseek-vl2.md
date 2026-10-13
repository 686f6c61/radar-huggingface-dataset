# deepseek-ai/deepseek-vl2

## Resumen

DeepSeek-VL2 es una serie de modelos de lenguaje y vision (vision-language) basados en arquitectura de mezcla de expertos (MoE), desarrollada por DeepSeek. La serie se compone de tres variantes: DeepSeek-VL2-Tiny, DeepSeek-VL2-Small y DeepSeek-VL2, con 1,0B, 2,8B y 4,5B de parametros activos respectivamente. El modelo esta construido sobre DeepSeekMoE-27B, y el repositorio principal publicado en HuggingFace contiene 27.480.134.248 parametros totales.

El modelo resuelve tareas de comprension multimodal avanzada: respuesta a preguntas visuales (VQA), reconocimiento optico de caracteres (OCR), comprension de documentos, tablas y graficos, y grounding visual. Segun la model card, alcanza un rendimiento competitivo o de estado del arte en comparacion con modelos densos y MoE de codigo abierto, con un numero de parametros activos igual o menor.

Es relevante ahora porque combina una arquitectura MoE eficiente en computo (solo activa entre 1,0B y 4,5B de parametros por token) con capacidades multimodales, y porque su licencia permite uso comercial. Los pesos se publican en formato safetensors bajo la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en mezcla de expertos (MoE); LLM base DeepSeekMoE-27B |
| Parametros totales | 27.480.134.248 (variante DeepSeek-VL2 del repositorio principal) |
| Parametros activos | 4,5B (variante DeepSeek-VL2); 2,8B en Small y 1,0B en Tiny |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | deepseek (DeepSeek Model License); permite uso comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-VL2 emplea una arquitectura de mezcla de expertos aplicada a un modelo de lenguaje y vision. El componente de lenguaje es DeepSeekMoE-27B, sobre el que se incorpora un codificador de vision y un mecanismo de proyeccion de las imagenes al espacio de embeddings del modelo de lenguaje. La serie incluye tres variantes cuya diferencia principal, segun la model card, es el LLM base: Tiny, Small y la version completa, con 1,0B, 2,8B y 4,5B de parametros activos respectivamente.

En el procesamiento de imagenes se aplica una estrategia de tiling dinamico para mantener manejable el numero de tokens en la ventana de contexto: cuando hay 2 imagenes o menos se usa tiling dinamico, y cuando hay 3 o mas imagenes se rellenan directamente a 384x384 como entradas sin tiling. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO, por lo que esos datos se consideran no disponibles.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imagenes individuales.
- Reconocimiento optico de caracteres (OCR).
- Comprension de documentos, tablas y graficos.
- Grounding visual: localizacion de objetos descritos en el texto mediante etiquetas de referencia (`<|ref|>...<|/ref|>`).
- Conversaciones de un solo turno con una imagen.
- Conversaciones multi-imagen y aprendizaje en contexto (in-context learning) con varias imagenes en el mismo prompt.
- Generacion de texto integrada con la comprension visual.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no especificados en la model card).

## Casos de uso

- Digitalizacion y extraccion de datos de documentos: el modelo puede aplicar OCR y comprension de tablas y documentos para convertir facturas, formularios o informes en texto estructurado, una de las tareas que la model card destaca de forma explicita.
- Analisis de graficos y reportes financieros: su capacidad de comprension de charts permite extraer tendencias y valores de graficos incluidos en informes, respondiendo a preguntas sobre los datos representados.
- Grounding visual para anotacion de datos: el soporte de etiquetas `<|ref|>` permite localizar objetos concretos descritos en lenguaje natural, util para generar o validar anotaciones en pipelines de etiquetado.
- Atencion al cliente con soporte de imagenes: el modelo puede gestionar conversaciones en las que el usuario adjunta capturas o fotos y responde a partir de su contenido visual.
- Accesibilidad y descripcion de imagenes: generacion automatica de descripciones textuales de imagenes para lectores de pantalla o catalogos.
- Catalogacion de productos en comercio electronico: a partir de fotos de producto, extraer categoria, texto visible en etiquetas (OCR) y atributos visuales.
- Comparacion o razonamiento sobre multiples imagenes: el soporte de conversaciones multi-imagen permite tareas de comparacion, por ejemplo identificar diferencias entre varias fotografias en un mismo prompt.
- Control de calidad visual en entornos tecnicos: responder a preguntas sobre imagenes tecnicas o de inspeccion con una temperatura de muestreo baja (<= 0,7) para reducir variabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros totales (27,48B) y no de los activos, ya que en un MoE es necesario cargar todos los expertos:
  - Precision bf16/fp16: aproximadamente 55 GB solo para pesos, mas overhead (el tamano del repositorio es de 55,0 GB).
  - Precision int8: aproximadamente 27,5 GB.
  - Precision int4: aproximadamente 14 GB.
- GPU recomendadas para la variante completa en bf16: A100 80 GB o H100 80 GB.
- En GPU de consumo: en bf16 no cabe en tarjetas con 24 GB. Con cuantizacion a int4 podria encajar en RTX 4090 o RTX 3090 (24 GB), aunque la model card no confirma soporte de cuantizacion.
- Las variantes Tiny (1,0B activos) y Small (2,8B activos) requieren menos memoria y son mas adecuadas para hardware mas limitado, segun el tamano del LLM base de cada una.
- Opciones de despliegue: la model card documenta el uso mediante `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True`. El soporte en vLLM, llama.cpp, Ollama o TGI no se menciona en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros activos | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-VL2 (este repositorio) | 4,5B | 27,48B | no disponible | DeepSeek Model License (uso comercial) | HuggingFace |
| DeepSeek-VL2-Small | 2,8B | no disponible | no disponible | DeepSeek Model License | HuggingFace |
| DeepSeek-VL2-Tiny | 1,0B | no disponible | no disponible | DeepSeek Model License | HuggingFace |

La model card situa a la serie DeepSeek-VL2 como una mejora de su predecesor DeepSeek-VL, pero no aporta cifras comparativas concretas con modelos densos o MoE de terceros, por lo que no es posible completar una comparativa numerica con alternativas externas a partir de la informacion disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion: como modelo generativo, puede producir contenido incorrecto; no hay datos de tasas de alucinacion en la informacion proporcionada.
- La model card recomienda usar una temperatura T <= 0,7 al muestrear; valores mas altos reducen la calidad de generacion.
- Gestion de imagenes limitada por la estrategia de tiling: con 2 imagenes o menos se aplica tiling dinamico, pero con 3 o mas imagenes se rellenan directamente a 384x384 sin tiling, lo que puede reducir el detalle efectivo en escenarios con muchas imagenes.
- Longitud de contexto no especificada en la informacion disponible, lo que dificulta planificar su uso con entradas largas o muchas imagenes.
- Idiomas soportados no especificados; no se puede garantizar un rendimiento uniforme fuera del ingles y el chino sin datos adicionales.
- Licencia: el codigo se distribuye bajo MIT, pero el uso de los modelos esta sujeto a la DeepSeek Model License. La model card indica que la serie admite uso comercial, pero conviene revisar el texto completo de la licencia antes de un despliegue en produccion.
- Los tipos de cuantizacion soportados y el soporte en frameworks de inferencia optimizados (vLLM, TGI, llama.cpp) no estan confirmados en la informacion proporcionada.
- El requisito de `trust_remote_code=True` implica ejecutar codigo del repositorio del modelo, lo que debe evaluarse en entornos de produccion.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/deepseek-ai/deepseek-vl2
- Paper (arXiv:2412.10302): https://arxiv.org/abs/2412.10302
- Repositorio GitHub: https://github.com/deepseek-ai/DeepSeek-VL2
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-LLM/blob/HEAD/LICENSE-MODEL
- Web de DeepSeek: https://www.deepseek.com/
- Plataforma API de DeepSeek: https://www.deepseek.com/en/platform/
- Organizacion en GitHub: https://github.com/deepseek-ai
- Contacto del autor: service@deepseek.com
