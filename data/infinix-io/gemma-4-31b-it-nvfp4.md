# Infinix-io/Gemma-4-31B-IT-NVFP4

## Resumen

Gemma-4-31B-IT-NVFP4 es una versión cuantizada en formato NVFP4 del modelo multimodal Gemma 4 31B IT desarrollado por Google DeepMind, publicada por el usuario Infinix-io y basada en la receta de optimización de NVIDIA Model Optimizer (nvidia-modelopt v0.42.0). El modelo original es un transformer multimodal que acepta texto, imagen y vídeo (secuencias de fotogramas) y genera texto, con una ventana de contexto de 256K tokens y soporte de más de 140 idiomas. Esta variante cuantizada a 4 bits (NVFP4) reduce el peso de los pesos y activaciones manteniendo una fidelidad muy alta respecto al modelo en BF16 según los datos de evaluación publicados.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 30,7B parámetros con capacidades frontier de razonamiento, código y comprensión multimodal en GPUs de gama alta con menos memoria que la versión BF16, manteniendo una degradación mínima en benchmarks como GPQA Diamond, AIME 2025, MMLU Pro o LiveCodeBench. Está pensado para despliegue en producción con vLLM sobre hardware NVIDIA Blackwell y Hopper.

Arquitectónicamente, Gemma 4 introduce una atención híbrida que intercala atención local de ventana deslizante con atención global completa, con claves y valores unificados en las capas globales y Proportional RoPE (p-RoPE) para sostener el rendimiento en contextos largos. El vocabulario es de 262.144 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con atención híbrida: ventana deslizante local + atención global completa, claves/valores unificados en capas globales, Proportional RoPE (p-RoPE) |
| Parametros totales | 30,7B (según model card); 20.868.591.152 en safetensors del repo cuantizado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (ISL) |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones), calibrado con nvidia-modelopt v0.42.0 |
| Idiomas soportados | más de 140 idiomas (según model card del modelo base) |
| Licencia | Apache License 2.0 (Gemma, Google AI for Developers); etiqueta `license: other` en HF con `license_name: apache-license-2.0` |
| Formato de pesos | safetensors (repo de 32,7 GB) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 31B IT es un transformer multimodal de Google DeepMind con 30,7B parámetros y vocabulario de 262.144 tokens. Emplea una atención híbrida que combina capas de atención local con ventana deslizante y capas de atención global completa, usando claves y valores unificados en las capas globales y Proportional RoPE (p-RoPE) para preservar el rendimiento en contextos de hasta 256K tokens. Acepta entradas de texto, imagen (RGB con relaciones de aspecto y resoluciones variables, con presupuestos de tokens visuales configurables de 70, 140, 280, 560 y 1120) y vídeo (MP4/WebM hasta 60 segundos a un fotograma por segundo).

El entrenamiento del modelo base se realizó con datos multimodales a gran escala (documentos web, código, imágenes y audio), con fecha de corte en enero de 2025 y cobertura en más de 140 idiomas, filtrando CSAM, datos sensibles, calidad y seguridad. Esta variante concreta no ha sido reentrenada: es el resultado de una cuantización post-entrenamiento de pesos y activaciones a NVFP4 mediante NVIDIA Model Optimizer, calibrada con el dataset `cnn_dailymail` (más de 300.000 artículos de noticias en inglés). El motor de inferencia soportado es vLLM (versión probada 0.17.2rc1.dev104+gae521202f.d20260319.cu128).

## Capacidades

- Generación de texto y conversación multi-turno en más de 140 idiomas.
- Razonamiento avanzado, incluyendo matemáticas y problemas de nivel experto (GPQA, AIME).
- Generación y comprensión de código, con evaluación en LiveCodeBench y Scicode.
- Comprensión multimodal de imágenes con presupuestos de tokens visuales configurables (70 a 1120 tokens por imagen).
- Procesamiento de vídeo como secuencias de fotogramas (hasta 60 s a 1 fps, MP4/WebM).
- Function calling / tool calling para flujos agénticos.
- Flujos de trabajo agénticos y razonamiento multi-paso (mencionados como caso de uso en la model card).
- Extracción de datos a partir de imágenes.
- Resumen de textos largos gracias a la ventana de 256K tokens.
- Salida exclusivamente de texto (string, secuencias 1D).

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo (256K tokens) y responder en más de 140 idiomas, lo que permite gestionar historiales extensos de cliente sin truncar información.
- Generación de código en producción: con soporte de function calling y buen rendimiento en LiveCodeBench (82,27% pass@1 en NVFP4), puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, invocando herramientas externas mediante tool calling.
- Agentes autónomos multi-paso: la combinación de razonamiento, tool calling y contexto largo lo hace adecuado para orquestadores que encadenan llamadas a APIs, lectura de documentación y ejecución de comandos.
- Extracción de datos de documentos e imágenes: con presupuestos de tokens visuales ajustables (70 a 1120), se puede procesar facturas, formularios o capturas y devolver campos estructurados en texto.
- Análisis de vídeo de corta duración: procesamiento de clips de hasta 60 segundos a 1 fps para resumen, descripción o detección de eventos en flujos de vigilancia o contenido.
- Razonamiento científico y educativo: con resultados en GPQA Diamond (85,35% en NVFP4) y AIME 2025 (87,60%), sirve como asistente de resolución de problemas de física, química, biología y matemáticas.
- Resumen de documentos extensos: la ventana de 256K permite resumir informes, expedientes o artículos largos en una sola pasada, útil en entornos legales o periodísticos.
- Investigación y experimentación académica: al estar cuantizado en NVFP4 y disponible con licencia Apache 2.0, facilita reproducir experimentos en workstations con GPUs Blackwell sin necesidad de clústeres BF16.

## Benchmarks y rendimiento

| Benchmark | Baseline (BF16) | NVFP4 |
|---|---|---|
| GPQA Diamond | 85,80% | 85,35% |
| AIME 2025 | 87,92% | 87,60% |
| MMLU Pro | 85,25% | 84,94% |
| LiveCodeBench (pass@1) | 82,49% | 82,27% |
| Scicode subtask acc (pass@1) | 33,61% | 33,18% |
| Terminal-Bench | no disponible (dato truncado en la información) | no disponible (dato truncado en la información) |

La degradación respecto a BF16 es inferior a 0,5 puntos porcentuales en todos los benchmarks con datos completos, lo que indica que la cuantización NVFP4 preserva prácticamente el rendimiento del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo de pesos ocupa 32,7 GB en safetensors NVFP4; se requiere al menos una GPU con 40-48 GB de VRAM para cargar el modelo con overhead de activaciones y caché KV, dependiendo de la longitud de contexto.
- GPUs recomendadas: NVIDIA Blackwell (arquitectura soportada oficialmente) y NVIDIA Hopper H100 (hardware de prueba indicado en la model card). El ejemplo de despliegue usa `--tensor-parallel-size 8`, lo que sugiere despliegues multi-GPU.
- Cabe en GPU consumer: no disponible de forma explícita; por tamaño de pesos (32,7 GB) no cabría en GPUs consumer de 24 GB sin técnicas adicionales de offloading o paralelismo, y la compatibilidad oficial se limita a Blackwell.
- Opciones de despliegue: vLLM con `--quantization modelopt` (motor soportado oficialmente). Otras opciones como llama.cpp, Ollama o TGI no están indicadas en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.
- Sistema operativo preferido: Linux.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-31B-IT-NVFP4 (esta ficha) | 30,7B (20,87B en safetensors) | 256K | Apache 2.0 | safetensors NVFP4 | Hugging Face (Infinix-io) |
| google/gemma-4-31B-it (BF16) | 30,7B | 256K | Apache 2.0 | safetensors BF16 | Hugging Face (Google) |
| nvidia/Gemma-4-31B-IT-NVFP4 | 30,7B | 256K | Apache 2.0 | safetensors NVFP4 | Hugging Face (NVIDIA) |

No se dispone de datos de benchmarks de modelos alternativos de otros fabricantes en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base. La diferencia principal entre las tres variantes es el formato de pesos y el empaquetado: BF16 frente a NVFP4, con degradación mínima en benchmarks según los datos de la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles de forma explícita en la información; el modelo base se entrenó con datos web a gran escala, lo que puede introducir sesgos presentes en esos datos.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de este tamaño.
- Limitaciones de contexto o idioma: aunque soporta 256K tokens y más de 140 idiomas, el calibrado de la cuantización se realizó únicamente con `cnn_dailymail`, un dataset en inglés, lo que puede afectar la fidelidad de la cuantización en otros idiomas o dominios.
- Restricciones de licencia: la licencia es Apache 2.0 según la model card, pero la etiqueta de Hugging Face es `license: other` con `license_name: apache-license-2.0`; conviene verificar los términos en el enlace oficial de Google AI for Developers antes de uso comercial.
- El modelo no es propiedad de NVIDIA; es un desarrollo de terceros empaquetado por Infinix-io, por lo que el soporte y las garantías dependen del publicador.
- Compatibilidad de hardware restringida: solo se indica soporte para NVIDIA Blackwell (y H100 para pruebas), con vLLM como único motor soportado; no hay garantía de funcionamiento en otras GPUs o runtimes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La cuantización NVFP4 puede degradar tareas no cubiertas por los benchmarks publicados (por ejemplo, generación creativa o dominios especializados).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/Gemma-4-31B-IT-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Versión NVIDIA del mismo modelo: https://huggingface.co/nvidia/Gemma-4-31B-IT-NVFP4
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Licencia Gemma Apache 2.0: https://ai.google.dev/gemma/apache_2
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
