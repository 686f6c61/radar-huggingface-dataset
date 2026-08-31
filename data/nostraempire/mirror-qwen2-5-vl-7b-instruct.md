# NostraEmpire/mirror-qwen2.5-vl-7b-instruct

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo de visión-lenguaje (VLM) desarrollado por Alibaba Cloud, publicado originalmente en el repositorio de Qwen y replicado aquí como mirror por el usuario NostraEmpire. Este modelo multimodal procesa imágenes, vídeos y texto, y está diseñado para tareas de comprensión visual avanzada, razonamiento multimodal, localización de objetos, generación de salidas estructuradas y uso como agente visual (por ejemplo, control de ordenador o teléfono). La versión de 7B (8,29 mil millones de parámetros) ofrece un equilibrio entre rendimiento y requisitos de hardware, siendo adecuada para despliegue en GPUs de consumo.

La arquitectura combina un codificador visual (ViT) optimizado con atención de ventana, SwiGLU y RMSNorm, junto con el modelo de lenguaje Qwen2.5. Soporta resolución dinámica y muestreo de FPS dinámico para vídeo, lo que permite comprender vídeos de larga duración y localizar eventos temporales. La licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace atractivo para integraciones en producción. Este mirror mantiene los pesos originales y es compatible con Transformers y pipelines de generación de texto a partir de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (ViT con atención de ventana + LLM Qwen2.5) |
| Parametros totales | 8.292.166.656 (~8,29B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo original soporta 32k tokens, pero no se confirma en este mirror) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (según metadata; el modelo original soporta múltiples idiomas, pero este mirror declara solo inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2.5-VL, que extiende Qwen2.5 con un codificador visual de visión por computadora (ViT). El ViT ha sido optimizado con atención de ventana para acelerar el entrenamiento y la inferencia, y utiliza SwiGLU y RMSNorm, alineándose con la estructura del LLM subyacente. Se emplea resolución dinámica en el dominio espacial y muestreo de FPS dinámico en el temporal, lo que permite al modelo procesar vídeos a diferentes velocidades y alinear el tiempo con mRoPE (rotary position embedding multimodal). Esto habilita la localización precisa de eventos en vídeo.

No se proporcionan detalles específicos sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF/DPO en la información disponible. El modelo está optimizado mediante instrucciones (instruction-tuned) para tareas de diálogo, razonamiento visual y agentes. La arquitectura admite entradas intercaladas de imagen y texto, así como vídeo, y genera salidas de texto, incluyendo bounding boxes y puntos para localización.

## Capacidades

- Comprensión de imágenes: reconocimiento de objetos, análisis de texto en imágenes (OCR), gráficos, iconos, diagramas y diseños.
- Comprensión de vídeo: procesa vídeos de más de una hora, con capacidad de localizar segmentos relevantes mediante la alineación temporal.
- Localización visual: genera bounding boxes y puntos para objetos, así como salidas JSON estructuradas con coordenadas y atributos.
- Salidas estructuradas: extrae contenido de facturas escaneadas, formularios, tablas y otros documentos en formato JSON.
- Uso como agente visual: puede razonar y dirigir herramientas, incluyendo control de ordenador (computer use) y teléfono (phone use).
- Razonamiento multimodal: integra información visual y textual para responder preguntas complejas, resolver problemas matemáticos visuales y realizar razonamiento de sentido común.
- Soporte de tool calling y function calling: gracias a su capacidad de agente, puede interactuar con APIs y herramientas externas.
- Multilingüe: aunque la metadata de este mirror indica solo inglés, el modelo original soporta múltiples idiomas; no se confirma el comportamiento en este mirror.

## Casos de uso

- Atención al cliente automatizada con soporte visual: el modelo puede procesar capturas de pantalla o fotos de productos para resolver incidencias, identificando elementos en la imagen y proporcionando respuestas contextuales. Su capacidad de razonamiento multimodal permite interpretar errores visuales o guiar al usuario paso a paso.

- Extracción de datos de documentos financieros: gracias a la generación de salidas estructuradas, puede escanear facturas, recibos y formularios, y devolver campos clave en JSON, facilitando la automatización de flujos contables y de gestión documental.

- Asistente de accesibilidad para personas con discapacidad visual: puede describir escenas, leer texto de imágenes o carteles, y responder preguntas sobre el entorno, mejorando la autonomía en tareas cotidianas.

- Moderación de contenido visual: el modelo puede analizar imágenes y vídeos para detectar contenido inapropiado, objetos peligrosos o situaciones de riesgo, generando alertas o clasificaciones automáticas.

- Agente de automatización de escritorio: al soportar uso de ordenador, puede controlar interfaces gráficas, hacer clic en botones, rellenar formularios o navegar por aplicaciones, permitiendo automatizar tareas repetitivas en entornos controlados.

- Análisis de vídeo para seguridad y vigilancia: puede procesar grabaciones de larga duración, identificar eventos específicos (por ejemplo, una persona entrando en una zona restringida) y devolver marcas temporales precisas, reduciendo el tiempo de revisión manual.

- Generación de descripciones y subtitulado de contenido multimedia: puede crear descripciones detalladas de imágenes o vídeos para catálogos, redes sociales o archivos de accesibilidad, manteniendo coherencia contextual.

- Asistente de código con contexto visual: en entornos de desarrollo, puede interpretar diagramas, capturas de pantalla de errores o diagramas de arquitectura, y generar o explicar código relacionado, mejorando la productividad del desarrollador.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo original Qwen2.5-VL-7B-Instruct, según la model card. Este mirror replica los mismos pesos, por lo que se espera un rendimiento equivalente.

### Benchmarks de imagen

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
| :--- | :---: | :---: | :---: | :---: | :---: |
| MMMU<sub>val</sub> | 56 | 50.4 | **60** | 54.1 | 58.6 |
| MMMU-Pro<sub>val</sub> | 34.3 | - | 37.6 | 30.5 | **41.0** |
| DocVQA<sub>test</sub> | 93 | 93 | - | 94.5 | **95.7** |
| InfoVQA<sub>test</sub> | 77.6 | - | - | 76.5 | **82.6** |
| ChartQA<sub>test</sub> | 84.8 | - | - | 83.0 | **87.3** |
| TextVQA<sub>val</sub> | 79.1 | 80.1 | - | 84.3 | **84.9** |
| OCRBench | 822 | 852 | 785 | 845 | **864** |
| CC_OCR | 57.7 | - | - | 61.6 | **77.8** |
| MMStar | 62.8 | - | - | 60.7 | **63.9** |
| MMBench-V1.1-En<sub>test</sub> | 79.4 | 78.0 | 76.0 | 80.7 | **82.6** |
| MMT-Bench<sub>test</sub> | - | - | - | **63.7** | 63.6 |
| MMVet<sub>GPT-4-Turbo</sub> | 54.2 | 60.0 | 66.9 | 62.0 | **67.1** |
| HallBench<sub>avg</sub> | 45.2 | 48.1 | 46.1 | 50.6 | **52.9** |
| MathVista<sub>testmini</sub> | 58.3 | 60.6 | 52.4 | 58.2 | **68.2** |
| MathVision | - | - | - | 16.3 | **25.07** |

### Benchmarks de vídeo

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
| :--- | :---: | :---: |
| MVBench | 67.0 | **69.6** |
| PerceptionTest<sub>test</sub> | 66.9 | **70.5** |
| Video-MME<sub>wo/w subs</sub> | 63.3/69.0 | **65.1**/**71.6** |
| LVBench | - | 45.3 |
| LongVideoBench | - | 54.7 |
| MMBench-Video | 1.44 | **1.79** |
| TempCompass | - | 71.7 |
| MLVU | - | 70.2 |
| CharadesSTA/mIoU | - | 43.6 |

### Benchmarks de agente

| Benchmark | Qwen2.5-VL-7B |
|-------------------------|---------------|
| ScreenSpot | 84.7 |
| ScreenSpot Pro | 29.0 |
| AITZ_EM | 81.9 |
| Android Control High_EM | 60.1 |
| Android Control Low_EM | 93.7 |
| AndroidWorld_SR | 25.5 |
| MobileMiniWob++_SR | 91.4 |

## Requisitos de hardware

- No se proporcionan requisitos específicos en la información disponible. Como referencia general, un modelo de ~8,3B parámetros en precisión FP16 requiere aproximadamente 16 GB de VRAM solo para los pesos, más memoria para activaciones y contexto. Con cuantización a 8 bits, la VRAM necesaria se reduce a unos 8-10 GB; con 4 bits, a unos 5-6 GB.
- GPUs recomendadas: para inferencia en FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es adecuada. En cuantización 8 bits, una RTX 3090/4080 (16-24 GB) puede funcionar. En 4 bits, una RTX 3060 (12 GB) o similar es viable.
- Opciones de despliegue: compatible con Transformers (pip install git+https://github.com/huggingface/transformers accelerate), vLLM, TGI, y herramientas como llama.cpp u Ollama (si se convierte a GGUF). También es compatible con el ecosistema de Qualcomm para despliegue on-device.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del hardware y la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntos fuertes |
|---|---|---|---|---|
| **Qwen2.5-VL-7B** (este mirror) | 8,29B | no disponible (original 32k) | Apache-2.0 | Razonamiento visual, vídeo largo, agente, salidas estructuradas |
| Qwen2-VL-7B | ~8B | 32k | Apache-2.0 | Versión anterior, menor rendimiento en OCR y vídeo |
| InternVL2.5-8B | ~8B | 32k | MIT | Buen rendimiento en OCR y comprensión de documentos, pero inferior en vídeo y agente |
| MiniCPM-o 2.6 | ~8B | 32k | Apache-2.0 | Especializado en visión-lenguaje y audio, pero sin capacidades de agente tan desarrolladas |

El modelo destaca frente a sus competidores en benchmarks de imagen (MMMU-Pro, DocVQA, ChartQA, OCRBench) y vídeo (Video-MME, LVBench), así como en tareas de agente (ScreenSpot, Android Control). Su licencia Apache-2.0 facilita la adopción comercial.

## Limitaciones y advertencias

- Este repositorio es un mirror del modelo original de Qwen; no se ha modificado el comportamiento. Cualquier actualización o corrección del modelo original debe obtenerse del repositorio oficial.
- La metadata declara solo inglés como idioma soportado; aunque el modelo original es multilingüe, no se garantiza el rendimiento en otros idiomas en este mirror.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el contexto máximo en esta versión; se recomienda verificar el modelo original para estos detalles.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en tareas visuales complejas o con imágenes ambiguas.
- Sesgos: el modelo puede reflejar sesgos presentes en sus datos de entrenamiento, lo que puede afectar a la equidad en aplicaciones sensibles.
- Para uso en producción, es necesario validar el rendimiento en el dominio específico y considerar técnicas de mitigación de errores (por ejemplo, verificación humana en tareas críticas).
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos completos y atribuciones requeridas.

## Enlaces

- Mirror en HuggingFace: https://huggingface.co/NostraEmpire/mirror-qwen2.5-vl-7b-instruct
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Colección Qwen2.5-VL: https://huggingface.co/collections/Qwen/qwen25-vl
- Blog oficial: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5-VL
- Documentación de Qualcomm (despliegue on-device): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen2_5_vl_7b_instruct/README.md
- Receta vLLM: https://recipes.vllm.ai/Qwen/Qwen2.5-VL-7B-Instruct
