# axteam/GLM-OCR-GGUF

## Resumen

GLM-OCR-GGUF es una compilación de cuantizaciones en formato GGUF del modelo `zai-org/GLM-OCR`, publicada por el usuario axteam. El modelo original, desarrollado por Z.ai, es un sistema de reconocimiento óptico de caracteres (OCR) basado en un transformer multimodal. Esta versión GGUF está pensada para su uso con llama.cpp, Ollama y LM Studio, y facilita la ejecución local en hardware modesto gracias a su reducido tamaño.

El detalle más importante de esta ficha es que los archivos GGUF publicados contienen únicamente el backbone de texto del modelo original (el decodificador lingüístico), no el codificador visual. Por tanto, esta versión no puede realizar OCR ni procesar imágenes: solo funciona como modelo de lenguaje de texto. El autor lo advierte explícitamente y recomienda usar el modelo original o su build FP8 (`axteam/GLM-OCR-FP8-dynamic`) con vLLM para pipelines de OCR de extremo a extremo.

Con 891.138.048 parámetros totales (aproximadamente 0,89 mil millones) y un tamaño de repositorio de 1,5 GB, esta compilación resulta relevante para quienes necesitan ejecutar el backbone textual de GLM-OCR en entornos con recursos limitados, para experimentación con la arquitectura glm4 en llama.cpp o para tareas de generación de texto que no requieran el componente visual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone de texto de GLM-OCR, arquitectura `glm4` en llama.cpp) |
| Parámetros totales | 891.138.048 (aproximadamente 0,89 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantización | Q4_K_M (4 bits, k-quant) y Q8_0 (8 bits) |
| Idiomas soportados | No disponibles oficialmente; se han realizado pruebas con inglés, francés y coreano |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `zai-org/GLM-OCR` es un sistema multimodal de OCR construido sobre un transformer con un codificador visual y un backbone de texto. La versión GGUF aquí descrita contiene exclusivamente el decodificador de texto, reconocido por llama.cpp como arquitectura `glm4`. El proceso de conversión se realizó con `convert_hf_to_gguf.py` y posteriormente `llama-quantize`, aplicando cuantización post-entrenamiento (PTQ) por bloques con escalas por bloque y asignación mixta de bits (k-quants), sin reentrenamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La plantilla de chat original (`chat_template`) está embebida en cada archivo GGUF. El autor indica que la cuantización Q4_K_M introduce un incremento de perplejidad del 5,1 % en WikiText-2 y del 1,1 % en un muestreo de Wikipedia en coreano respecto a Q8_0, medido sobre 16 ventanas de 2.048 tokens en una NVIDIA B200 con llama.cpp b12005.

## Capacidades

- Generación de texto a partir de entrada textual, limitada al backbone lingüístico del modelo OCR original.
- No incluye el codificador visual: no puede procesar imágenes ni realizar OCR.
- No es un modelo de chat general: en las pruebas del autor respondió correctamente a una pregunta simple sobre la capital de Francia ("Paris") pero repitió la pregunta sobre la capital de Corea en lugar de responderla.
- Soporte de plantilla de chat embebida (`chat_template`), compatible con `--jinja` en llama.cpp.
- Compatible con la API compatible con OpenAI de `llama-server`.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas oficialmente; las pruebas mencionan inglés, francés y coreano.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Experimentación con la arquitectura glm4 en llama.cpp: permite cargar y ejecutar el backbone de texto de GLM-OCR en versiones recientes de llama.cpp (≥ b8093) para estudiar su comportamiento sin necesidad del codificador visual.
- Evaluación de cuantizaciones GGUF: útil para comparar la perplejidad y el comportamiento de Q4_K_M frente a Q8_0 en un modelo de menos de 1.000 millones de parámetros, con datos de referencia publicados por el autor.
- Generación de texto ligera en local: al ocupar entre 0,5 GB y 1,0 GB, puede ejecutarse en equipos con recursos muy limitados para tareas de generación de texto sin requisitos de calidad alta.
- Pruebas de integración con Ollama y LM Studio: el modelo puede desplegarse mediante `ollama run hf.co/axteam/GLM-OCR-GGUF:Q4_K_M` o buscarse en el navegador de modelos de LM Studio, lo que facilita validar flujos de trabajo con estas herramientas.
- Servicio de API compatible con OpenAI en local: mediante `llama-server` se puede exponer un endpoint `/v1/chat/completions` para pruebas de integración en aplicaciones que consuman la API de OpenAI.
- Investigación sobre cuantización post-entrenamiento: los datos de perplejidad publicados permiten analizar el impacto de la cuantización k-quant en un modelo multimodal reducido a su componente textual.
- Desarrollo de pipelines de OCR de extremo a extremo: no es un caso de uso válido para esta versión GGUF; para ello debe emplearse el modelo original o la build FP8 con vLLM.

## Benchmarks y rendimiento

El autor publica mediciones de perplejidad (PPL) sobre 16 ventanas de 2.048 tokens del conjunto de test de WikiText-2 y de una muestra de Wikipedia en coreano, ejecutadas en una NVIDIA B200 con llama.cpp b12005 (commit e0f142d, build CUDA), con todas las capas en GPU. Los porcentajes son relativos a Q8_0, el archivo más cercano al original al no existir BF16 en el repositorio.

| Archivo | PPL WikiText-2 | PPL Wikipedia coreano | vs Q8_0 (EN / KO) |
|---|---|---|---|
| `GLM-OCR-Q8_0.gguf` | 21,32 | 18,19 | referencia |
| `GLM-OCR-Q4_K_M.gguf` | 22,41 | 18,39 | +5,1 % / +1,1 % |

El autor advierte que 16 ventanas por texto es una muestra pequeña y que diferencias de pocos puntos porcentuales entre archivos están dentro del ruido de muestreo. Asimismo, señala que se trata de un modelo de OCR medido sobre texto plano, por lo que los valores absolutos no son comparables con modelos de lenguaje generales y solo sirven para comparar los archivos entre sí.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB para Q4_K_M y 1,0 GB para Q8_0, más la caché KV correspondiente al contexto configurado (`-c`).
- GPU recomendadas: el autor validó el modelo en una NVIDIA B200; por tamaño, cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en sistemas con GPU integrada si se dispone de suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (versión ≥ b8093 para la arquitectura `glm4`; `-fa on` requiere ≥ b6325), Ollama y LM Studio. El autor no ha probado Ollama ni LM Studio.
- Reducción de memoria de caché KV: puede usarse `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` para reducir a la mitad la memoria de la caché KV.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `zai-org/GLM-OCR` es un sistema de OCR multimodal, y esta versión GGUF contiene únicamente su backbone textual, por lo que la comparación directa con modelos de OCR completos o con modelos de lenguaje generales no resulta equivalente. Se indica "no disponible".

## Limitaciones y advertencias

- No incluye el codificador visual: no puede realizar OCR ni procesar imágenes. Para OCR de extremo a extremo debe usarse el modelo original o la build FP8 con vLLM.
- No es un modelo de chat general: en las pruebas del autor respondió a una pregunta simple en francés pero repitió la pregunta en coreano en lugar de contestarla.
- Los valores de perplejidad publicados corresponden a un modelo de OCR evaluado sobre texto plano y no son comparables con modelos de lenguaje generales.
- La muestra de evaluación (16 ventanas de 2.048 tokens) es pequeña; las diferencias de pocos puntos porcentuales entre archivos están dentro del ruido de muestreo.
- Idiomas soportados no documentados oficialmente; las pruebas se limitan a inglés, francés y coreano.
- Longitud de contexto no especificada; los ejemplos de uso emplean 8.192 tokens.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados.
- Licencia MIT: permite uso comercial, pero los pesos originales y el tokenizador pertenecen a Z.ai; debe verificarse el cumplimiento de la licencia del modelo base.
- Requiere llama.cpp ≥ b8093 para cargar la arquitectura `glm4`; versiones anteriores no son compatibles.
- Ollama y LM Studio no han sido probados por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/GLM-OCR-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Build FP8 del mismo autor: https://huggingface.co/axteam/GLM-OCR-FP8-dynamic
