# nvidia/Gemma-4-26B-A4B-NVFP4

## Resumen

NVIDIA Gemma-4-26B-A4B-NVFP4 es una version cuantizada del modelo multimodal google/gemma-4-26B-A4B-it, publicada por NVIDIA a traves de su herramienta NVIDIA Model Optimizer. No se trata de un modelo entrenado por NVIDIA, sino de una optimizacion de inferencia del modelo base de Google DeepMind, cuantizado en formato NVFP4 (4 bits) para reducir el uso de memoria y acelerar la ejecucion sobre hardware NVIDIA Blackwell.

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) orientado a texto e imagen, con una ventana de contexto de 256K tokens y soporte para mas de 140 idiomas. Segun la model card, la variante 26B-A4B declara 25,2 mil millones de parametros totales y 3,8 mil millones de parametros activos, con 8 expertos activos de un total de 128 mas uno compartido, 30 capas y un vocabulario de 262K tokens. Los metadatos de safetensors del repositorio, sin embargo, reportan 14.386.941.232 parametros almacenados, una discrepancia que conviene tener en cuenta al planificar el despliegue.

Su relevancia actual radica en que permite ejecutar un modelo MoE multimodal de gran tamano en un espacio de memoria mucho menor gracias a la cuantizacion de 4 bits, aunque con la contrapartida de depender de la microarquitectura Blackwell y del motor vLLM como unica ruta de despliegue declarada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); atencion hibrida (sliding-window local + atencion global completa) con Keys y Values unificados en capas globales y Proportional RoPE (p-RoPE) |
| Parametros totales | 25,2 mil millones segun model card; 14.386.941.232 segun metadatos de safetensors (dato discordante) |
| Parametros activos | 3,8 mil millones |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | NVFP4 (4 bits); pesos pre-cuantizados, no se ofrecen otras variantes en este repositorio |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pre-cuantizados en NVFP4) |

Otros datos tecnicos: 30 capas, ventana de atencion deslizante de 1024 tokens, vocabulario de 262K, 8 expertos activos sobre 128 totales mas 1 compartido, encoder de vision de ~550M de parametros, modalidades de entrada texto e imagen (y video como secuencia de fotogramas), y tamano del repositorio de 18,8 GB.

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atencion hibrida que intercala ventanas deslizantes locales con atencion global completa. En las capas globales se unifican las Keys y Values y se emplea Proportional RoPE (p-RoPE) para sostener el rendimiento en contextos largos de hasta 256K tokens. La componente de mezcla de expertos activa 8 de 128 expertos (mas uno compartido) por token, lo que explica la diferencia entre los 25,2 mil millones de parametros totales y los 3,8 mil millones activos. Incorpora un encoder de vision de aproximadamente 550M de parametros para entradas de imagen y admite presupuestos de tokens visuales configurables de 70, 140, 280, 560 y 1120, ademas de video de hasta 60 segundos a un fotograma por segundo.

Respecto al entrenamiento, NVIDIA no realizo entrenamiento ni test en esta release de Model Optimizer: el modelo original fue entrenado por Google DeepMind con datos multimodales a gran escala (documentos web, codigo, imagenes y audio) con fecha de corte en enero de 2025 y cobertura de mas de 140 idiomas, filtrados por CSAM, datos sensibles, calidad y seguridad. NVIDIA unicamente aplico cuantizacion post-entrenamiento con nvidia-modelopt v0.43.0, calibrando con los datasets cnn_dailymail y Nemotron-Post-Training-Dataset-v2. No consta en la informacion disponible si el modelo base uso RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de texto y comprension de lenguaje en mas de 140 idiomas.
- Razonamiento de multiples pasos y modo "thinking", que emite tokens de razonamiento adicionales cuando esta activado.
- Generacion de codigo y resolucion de tareas de programacion.
- Comprension multimodal de imagen, con soporte de proporciones y resoluciones variables.
- Procesamiento de video como secuencia de fotogramas, hasta 60 segundos a 1 fps.
- Function calling y soporte para flujos agenticos segun la seccion de casos de uso de la model card.
- Conversacion multi-turno y resumen de texto.
- Extraccion de datos a partir de imagenes.
- Capacidades orientadas a workflows agenticos y de investigacion o uso educativo.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede sostener conversaciones multi-turno largas gracias a su ventana de 256K tokens y a la memoria reducida de la cuantizacion NVFP4, lo que permite desplegarlo en menos hardware.
- Generacion de codigo en produccion: soporta function calling y puede integrarse en pipelines de desarrollo para autocompletado, revision de codigo o generacion de tests, con salida en texto.
- Agentes autonomos multi-paso: el modo de razonamiento y el soporte de tool calling permiten construir agentes que planifican tareas y encadenan llamadas a herramientas.
- Extraccion de datos de documentos e imagenes: la capacidad multimodal permite procesar facturas, formularios o capturas y devolver texto estructurado.
- Analisis de video: el procesamiento de hasta 60 segundos a 1 fps sirve para resumir o etiquetar contenido audiovisual corto.
- Resumen de textos extensos: la ventana de 256K tokens permite resumir documentos, informes o hilos completos sin truncar el contexto.
- Asistentes multilingues: la cobertura de mas de 140 idiomas lo hace apto para servicios de traduccion o soporte en multiples mercados.
- Investigacion y prototipado: al estar bajo licencia Apache 2.0 y ser un modelo pre-cuantizado, es util para experimentar con tecnicas de cuantizacion y despliegue en Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona que el modelo se evaluo en pruebas de razonamiento y codigo basadas en texto (entre ellas MMLU Pro, descrito como un benchmark de comprension multilingue con preguntas de opcion multiple), pero el texto proporcionado esta truncado y no incluye cifras concretas. No se deben asumir valores de rendimiento a partir de esta referencia.

## Requisitos de hardware

- Microarquitectura requerida: NVIDIA Blackwell (compatibilidad declarada por el autor). El formato NVFP4 no esta soportado en generaciones anteriores de GPU.
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, 14,4 mil millones de parametros almacenados a 4 bits ocupan en torno a 7-8 GB de pesos, a los que hay que sumar cache KV y overhead de runtime; el repositorio completo ocupa 18,8 GB. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: las de arquitectura Blackwell (por ejemplo, serie B100/B200 en servidor y las RTX de la generacion correspondiente). No se declaran objetivos de VRAM concretos.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; depende de si la generacion de consumo concreta soporta NVFP4 de forma nativa.
- Motor de despliegue: vLLM es el unico runtime soportado segun la model card. No se declaran soporte para llama.cpp, Ollama ni TGI.
- Sistema operativo preferido: Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/Gemma-4-26B-A4B-NVFP4 | 25,2B totales / 3,8B activos (segun card); 14,4B almacenados | 256K | Texto, imagen | Apache 2.0 | HuggingFace, vLLM, Blackwell |
| google/gemma-4-26B-A4B-it (base) | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 | HuggingFace |
| Otras variantes cuantizadas del mismo modelo base | No disponible | 256K | Texto, imagen | Apache 2.0 | No disponible |

No se dispone de datos de rendimiento comparativos entre el modelo cuantizado y su version base en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: el formato NVFP4 esta restringido a la microarquitectura NVIDIA Blackwell, lo que limita su despliegue en GPUs anteriores.
- Motor unico: solo se declara vLLM como runtime soportado; no hay soporte documentado para llama.cpp, Ollama o TGI.
- Discrepancia de parametros: la model card indica 25,2B parametros totales mientras que los metadatos de safetensors reportan 14,4B, lo que puede afectar a las estimaciones de memoria y a la planificacion de recursos.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fiabilidad factual.
- Sesgos: no se publican analisis de sesgos conocidos en la informacion disponible; el modelo base se filtro por calidad y seguridad, pero no se detallan los criterios.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base pertenece a Google y su licencia se rige por los terminos de Google AI for Developers; conviene revisar esas condiciones.
- Idiomas: aunque se declaran mas de 140 idiomas, no se especifican niveles de calidad por idioma.
- Longitud de contexto: los 256K tokens son teoricos y su rendimiento efectivo en contextos largos no se cuantifica en la informacion disponible.
- Modelo de terceros: NVIDIA solo realizo la cuantizacion; la responsabilidad sobre los datos de entrenamiento y las capacidades subyacentes recae en Google DeepMind.

## Enlaces

- HuggingFace (modelo cuantizado): https://huggingface.co/nvidia/Gemma-4-26B-A4B-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- NVIDIA Model Optimizer (herramienta de cuantizacion): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Licencia Apache 2.0 de Gemma (Google AI for Developers): https://ai.google.dev/gemma/apache_2
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Web oficial de NVIDIA: https://www.nvidia.com/
