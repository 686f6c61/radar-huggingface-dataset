# chen5245/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un fine-tune derivado de Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez es un ajuste de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El modelo que nos ocupa, publicado por el usuario chen5245, aplica una ablación selectiva de capas mediante la herramienta Heretic v2.0.0.dev0 para eliminar el comportamiento de rechazo (refusals) del modelo base, dando lugar a una variante "decensored" o "abliterated".

El modelo conserva la orientación del original hacia razonamiento matemático y científico (STEM), entrenado sobre aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico, con una arquitectura transformer densa de 9.409.813.744 parámetros. La intervención Heretic actúa sobre las capas 9 a 24 con una técnica de ablación de rango arbitrario (ARA), reduciendo los rechazos de 100/100 a 3/100 según la model card, con una divergencia KL de 0,0422 respecto al modelo original.

Es relevante ahora porque combina tres tendencias del ecosistema open source: la destilación de modelos grandes de razonamiento en tamaños desplegables en hardware de consumo, la eliminación de capas de rechazo mediante técnicas de ablación automática, y el soporte multimodal (image-text-to-text) heredado de la familia Qwen3.5. La licencia Apache 2.0 facilita su uso comercial, si bien la eliminación de salvaguardas introduce riesgos que deben evaluarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (repo en safetensors; se menciona evaluacion NVFP4) |
| Idiomas soportados | Ingles, chino, coreano, japones, espanol, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 19,3 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con 9,4 mil millones de parametros y capacidad multimodal (pipeline image-text-to-text), lo que indica que procesa tanto texto como imagenes. El entrenamiento del modelo original consistio en una destilacion desde DeepSeek-V4-Pro en modo Max Effect, con un conjunto de aproximadamente 250.000 muestras de SFT centradas en matematicas y razonamiento cientifico. La model card menciona tecnicas de RL (tags sft, rl, gspo) y decodificacion multi-token prediction (MTP) evaluada, aunque no se detalla la composicion exacta del dataset ni el numero total de tokens de entrenamiento.

La innovacion principal de esta variante concreta es la aplicacion de Heretic v2.0.0.dev0 con ablacion de rango arbitrario (ARA) sobre las capas 9 a 24, con pesos de preservacion de comportamiento bueno de 0,8264, de redireccion de comportamiento malo de 0,0003 y de sobrecorreccion relativa de 0,9645, con un vecindario de 12. Esta intervencion modifica los pesos para suprimir las respuestas de rechazo manteniendo lo maximo posible del comportamiento original, medido como divergencia KL de 0,0422 frente al modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso con descomposicion estructurada de problemas.
- Razonamiento matematico y cientifico (STEM), reforzado por el entrenamiento de destilacion.
- Capacidades multimodales de imagen a texto (image-text-to-text), heredadas de Qwen3.5.
- Soporte de tool calling y function calling (tags tool-use, function-calling).
- Capacidades de agente y razonamiento multi-paso.
- Generacion de codigo, con mejoras de transferencia cruzada reportadas pese a no recibir SFT especifico de codigo.
- Multilingue: ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (reasoning) y decodificacion multi-token prediction (MTP).
- Comportamiento decensored: supresion de rechazos (3/100 en la evaluacion del autor).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion de capas de rechazo comparando su comportamiento con el modelo base, midiendo divergencia KL y tasas de rechazo en distintos prompts.
- Razonamiento matematico asistido: resolucion de problemas de algebra, calculo y demostraciones paso a paso, aprovechando el entrenamiento sobre 250.000 muestras STEM.
- Tutoria cientifica interactiva: explicacion de conceptos de fisica, quimica o biologia con descomposicion estructurada, en un entorno controlado donde la ausencia de rechazos facilita cubrir temas sensibles desde un punto de vista academico.
- Generacion de codigo en pipelines: integracion en flujos de CI/CD mediante tool calling para tareas de refactorizacion o generacion de tests, con la cautela de validar el output por su naturaleza decensored.
- Procesamiento de documentos tecnicos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre diagramas, graficos o formulas en PDFs cientificos.
- Evaluacion comparativa de modelos destilados: uso como referencia en estudios de destilacion y ablacion, comparando su rendimiento en benchmarks STEM frente al modelo base y a otros destilados de 9B.
- Despliegue en entornos de investigacion con hardware de consumo: su tamano de 9,4B permite inferencia en GPUs consumer con cuantizacion, util para prototipado rapido.

## Benchmarks y rendimiento

La model card proporciona unicamente metricas de la intervencion Heretic, no benchmarks estandar de capacidad:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (bf16/fp16) el modelo de 9,4B requiere aproximadamente 19 GB de VRAM solo para pesos, mas overhead de contexto; en cuantizacion de 8 bits, en torno a 10-11 GB; en 4 bits, aproximadamente 5-6 GB. Estas cifras son estimaciones basadas en el tamano de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 40GB, H100, L40S para precision completa; RTX 4090 (24 GB) permite bf16 con contexto limitado o cuantizacion 8 bits con holgura.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no se proporcionan pesos GGUF en el repo). Se menciona evaluacion con NVFP4.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | 9,4B | No disponible | Apache 2.0 | Destilado STEM, decensored, multimodal |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,4B | No disponible | Apache 2.0 | Mismo origen, con rechazos (100/100) |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | No disponible | No disponible | Version reducida del mismo linaje decensored |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | No disponible | No disponible | Fine-tune cientifico sobre el mismo modelo base |

No se dispone de datos de rendimiento comparativo en benchmarks entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo decensored/abliterated: la supresion de rechazos implica que puede generar contenido danino, ilegal o eticamente problematico sin las salvaguardas del original; no es adecuado para aplicaciones de cara al publico sin filtros externos.
- La ablacion puede degradar sutilmente capacidades no medidas: la divergencia KL de 0,0422 indica cambios en la distribucion de salida que podrian afectar a tareas fuera del conjunto de evaluacion del autor.
- Riesgo de alucinacion: inherente a los modelos de razonamiento destilados; no hay datos de calibracion publicados.
- Sesgos conocidos: no documentados en la informacion disponible; el entrenamiento en matematicas y STEM puede sesgar hacia dominios tecnicos y limitar el rendimiento en humanidades.
- Limitaciones de contexto e idioma: la longitud de contexto no esta publicada; el soporte multilingue se limita a seis idiomas declarados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la ausencia de salvaguardas traslada al desplegador toda la responsabilidad legal y etica sobre el contenido generado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay validacion externa de su calidad.
- El repo no incluye pesos cuantizados (GGUF, AWQ, GPTQ), por lo que el despliegue eficiente requiere conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chen5245/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B decensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune STEM DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de ablacion): https://heretic-project.org
