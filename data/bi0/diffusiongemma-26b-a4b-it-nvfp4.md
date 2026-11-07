# bi0/diffusiongemma-26B-A4B-it-NVFP4

## Resumen

DiffusionGemma 26B A4B IT es un modelo generativo multimodal desarrollado por Google DeepMind que emplea difusión discreta sobre tokens en lugar de la generación autorregresiva convencional. Se construye sobre la arquitectura Gemma 4 en configuración Mixture-of-Experts, con 25,2 mil millones de parámetros totales y 3,8 mil millones de parámetros activos por token, lo que reduce el coste computacional de inferencia a pesar del tamaño del modelo. Procesa entradas de texto, imagen y vídeo, y genera texto como salida.

La ficha que nos ocupa, `bi0/diffusiongemma-26B-A4B-it-NVFP4`, no es el modelo original de Google, sino una cuantización comunitaria en formato NVFP4 publicada por el usuario `bi0`, orientada específicamente al hardware Blackwell GB10 (DGX Spark, arquitectura SM121). El peso total del repositorio es de aproximadamente 17,99 GB, lo que facilita su despliegue en estaciones de trabajo con GPU Blackwell de gama profesional.

Su relevancia actual radica en dos factores: por un lado, explora la difusión discreta como alternativa a la decodificación autorregresiva en modelos de gran escala; por otro, demuestra la viabilidad de cuantizar un MoE multimodal a 4 bits en formato NVFP4 nativo de Blackwell, un paso necesario para ejecutar modelos de este tamaño en hardware de escritorio profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con generación por difusión discreta; encoder-decoder |
| Parametros totales | 25,2B (modelo base); repositorio cuantizado de ~17,99 GB |
| Parametros activos | 3,8B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato nativo Blackwell); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base `google/diffusiongemma-26B-A4B-it`); licencia del repositorio cuantizado no especificada |
| Formato de pesos | NVFP4 Safetensors |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura Gemma 4 en configuración Mixture-of-Experts, con 25,2B parámetros totales y 3,8B activos, y una estructura encoder-decoder. La innovación principal es el uso de difusión discreta para la generación de tokens: en lugar de predecir el siguiente token de forma secuencial, el modelo refina iterativamente una secuencia completa de tokens mediante un proceso de difusión sobre un espacio discreto. Este enfoque permite, en principio, generar secuencias con un número fijo de pasos de refinamiento y potencialmente paralelizar parte del cómputo.

El modelo es multimodal: acepta texto, imagen y vídeo como entrada y produce texto como salida. No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La ficha cuantizada de `bi0` no aporta datos adicionales sobre el entrenamiento; únicamente documenta el proceso de cuantización NVFP4 sobre el checkpoint original de Google, con un tamaño resultante de 18.864.434.565 bytes y un hash SHA-256 verificable.

## Capacidades

- Generación de texto mediante difusión discreta, con refinamiento iterativo de secuencias.
- Comprensión de entradas multimodales: texto, imagen y vídeo.
- Razonamiento y generación de contenido textual a partir de contexto visual o audiovisual.
- Capacidad de instrucción (variante IT, instruction-tuned) para seguir indicaciones del usuario.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Descripción y análisis de vídeo: el modelo puede recibir un clip de vídeo y generar una descripción textual o un resumen de eventos, aprovechando su encoder multimodal y la generación por difusión para producir respuestas coherentes sobre contenido temporal.
- Análisis de documentos con imágenes: extracción de información de capturas, gráficos o diagramas combinados con texto, útil en pipelines de procesamiento documental donde se requiere comprensión visual.
- Prototipado de investigación en difusión discreta: al ser una cuantización NVFP4 de un modelo de difusión sobre tokens, sirve como banco de pruebas para estudiar el comportamiento de este paradigma de generación en hardware Blackwell con recursos limitados.
- Despliegue en estaciones DGX Spark: el formato NVFP4 y el tamaño de ~18 GB permiten ejecutar el modelo en un DGX Spark GB10 con memoria unificada, habilitando inferencia local de un MoE multimodal de 25,2B parámetros.
- Generación de texto asistida por imagen en entornos con requisitos de privacidad: al poder ejecutarse localmente en hardware Blackwell, evita el envío de datos visuales a servicios en la nube.
- Evaluación comparativa de paradigmas de generación: útil para equipos que quieran contrastar la calidad y latencia de la difusión discreta frente a modelos autorregresivos de tamaño similar en tareas multimodales.
- Investigación sobre cuantización extrema: el repositorio documenta el proceso NVFP4 sobre un MoE, lo que lo convierte en referencia para estudiar la degradación de calidad a 4 bits en modelos con expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa ~17,99 GB en NVFP4, por lo que se requiere al menos ~18-20 GB de memoria para cargar los pesos, más overhead de activaciones y contexto.
- GPU recomendadas: NVIDIA Blackwell GB10 (DGX Spark), arquitectura SM121, objetivo explícito de esta cuantización. Otras GPU Blackwell con soporte NVFP4 también serían compatibles en principio.
- GPU consumer: no disponible de forma confirmada; el formato NVFP4 es específico de Blackwell, por lo que GPU Ampere o Ada no ejecutarían esta cuantización de forma nativa.
- Opciones de despliegue: el autor menciona un puerto de runtime activo (8088) en su entorno local, pero no se especifica el framework (vLLM, TensorRT-LLM, llama.cpp u otro). No disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| diffusiongemma-26B-A4B-it-NVFP4 (esta ficha) | 25,2B | 3,8B | no disponible | Apache 2.0 (base) | NVFP4 Safetensors |
| google/diffusiongemma-26B-A4B-it | 25,2B | 3,8B | no disponible | Apache 2.0 | Safetensors (BF16 presumiblemente) |
| Modelos MoE multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta cuantización y el modelo base ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia del repositorio cuantizado no está especificada; aunque el modelo base es Apache 2.0, conviene verificar los términos antes de uso comercial.
- El formato NVFP4 es específico de hardware Blackwell (SM121); no es portable a GPU de generaciones anteriores sin conversión.
- La cuantización a 4 bits puede degradar la calidad de generación respecto al checkpoint original en BF16, especialmente en tareas multimodales sensibles.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez para esta cuantización concreta.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la reproducibilidad depende del hash SHA-256 documentado.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues en producción.
- El paradigma de difusión discreta es menos conocido que la generación autorregresiva; las herramientas de inferencia y los patrones de integración pueden ser menos maduros.
- La información sobre tool calling, agentes y modo thinking no está disponible, por lo que no debe asumirse su soporte.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/bi0/diffusiongemma-26B-A4B-it-NVFP4
- Modelo base en Hugging Face: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Model card en NVIDIA NIM: https://build.nvidia.com/google/diffusiongemma-26b-a4b-it/modelcard
