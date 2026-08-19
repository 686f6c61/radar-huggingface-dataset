# openbmb/MiniCPM-V-4-gguf

## Resumen

MiniCPM-V 4.0 es un modelo multimodal (vision-language) desarrollado por OpenBMB, la misma organización detrás de la serie MiniCPM. Es la cuarta generación de la familia MiniCPM-V y está diseñado específicamente para ejecutarse de forma eficiente en dispositivos de gama baja, incluidos teléfonos móviles. Combina un codificador visual SigLIP2-400M con el modelo de lenguaje MiniCPM4-3B, alcanzando un total de 4.1B parámetros declarados (aunque los pesos cuantizados del repositorio GGUF muestran 3.6B parámetros reales en safetensors). El modelo hereda las capacidades de comprensión de imagen única, múltiples imágenes y vídeo de MiniCPM-V 2.6, pero con una eficiencia muy superior: el primer token tarda menos de 2 segundos y decodifica a más de 17 tokens por segundo en un iPhone 16 Pro Max.

La relevancia actual de este modelo radica en su excelente relación calidad-coste computacional. Con solo 4.1B parámetros, obtiene una puntuación media de 69.0 en OpenCompass (promedio de 8 benchmarks populares), superando a GPT-4.1-mini-20250414 (68.9), a MiniCPM-V 2.6 (65.2) y a Qwen2.5-VL-3B-Instruct (64.5). Además, su licencia Apache 2.0 permite uso comercial sin restricciones. El repositorio GGUF ofrece pesos cuantizados listos para usar con llama.cpp, Ollama, vLLM, SGLang y otras herramientas, lo que facilita su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (SigLIP2-400M + MiniCPM4-3B) |
| Parametros totales | 4.1B (declarados); 3.605.834.240 (pesos safetensors del repo GGUF) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la documentacion) |
| Tipos de cuantizacion | GGUF (varias cuantizaciones disponibles en el repositorio) |
| Idiomas soportados | Multilingue (no se especifica lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

MiniCPM-V 4.0 sigue una arquitectura de transformer multimodal clásica: un codificador visual SigLIP2-400M procesa las imágenes y un modelo de lenguaje MiniCPM4-3B (basado en transformer) genera las respuestas. La integración entre ambos módulos se realiza mediante un proyector que alinea las características visuales con el espacio de embeddings del texto. El modelo soporta entrada de imagen única, múltiples imágenes y vídeo, lo que implica un mecanismo de procesamiento temporal para secuencias de frames.

En cuanto al entrenamiento, la documentación menciona el dataset openbmb/RLAIF-V-Dataset, lo que sugiere que se utilizó aprendizaje por refuerzo con retroalimentación de IA (RLAIF) para alinear el modelo con preferencias humanas. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo está diseñado para eficiencia en dispositivos: la cuantización GGUF y la optimización para inferencia en hardware limitado son características clave. No se mencionan innovaciones como atención lineal o decodificación especulativa, aunque la velocidad reportada (17 tokens/s en iPhone) indica optimizaciones importantes en el runtime.

## Capacidades

- Comprensión de imagen única: responde preguntas sobre contenido visual, describe escenas, identifica objetos y relaciones espaciales.
- Comprensión de múltiples imágenes: compara, contrasta y razona sobre varias imágenes simultáneamente.
- Comprensión de vídeo: procesa secuencias de frames para responder sobre acciones, eventos y cambios temporales.
- OCR (reconocimiento óptico de caracteres): extrae texto de imágenes y documentos escaneados con alta precisión (OCRBench 852 en la versión 2.6, aunque no se publica el valor exacto para la 4.0).
- Razonamiento visual-matemático: resuelve problemas que requieren combinar información visual y numérica (MathVista).
- Chat multimodal: conversaciones multi-turno con contexto visual.
- Capacidades multilingües: soporta múltiples idiomas, aunque no se detalla la lista.
- Compatibilidad con herramientas de inferencia estándar: llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory y demo web.
- Ejecución en dispositivos móviles: app iOS open source disponible.

## Casos de uso

- Atención al cliente automatizada con soporte visual: el modelo puede gestionar conversaciones donde el usuario envía capturas de pantalla, fotos de productos o documentos, y responder con precisión gracias a su capacidad OCR y de razonamiento multimodal. Su bajo consumo de recursos permite desplegarlo en servidores modestos o incluso en el dispositivo del cliente.
- Extracción de datos de documentos (OCR inteligente): procesar facturas, recibos, formularios y tarjetas de visita, extrayendo campos estructurados. Su precisión en OCRBench y su tamaño reducido lo hacen adecuado para pipelines de digitalización en tiempo real.
- Análisis de vídeo para vigilancia o control de calidad: el modelo procesa secuencias de vídeo para detectar anomalías, contar objetos o verificar procesos industriales. Su capacidad de vídeo y su eficiencia permiten ejecutarlo en edge devices con GPUs modestas.
- Asistente de accesibilidad para personas con discapacidad visual: describir el entorno, leer texto en voz alta o identificar objetos a través de la cámara del móvil. El modelo cabe en un smartphone moderno y ofrece latencia aceptable.
- Moderación de contenido visual: clasificar imágenes y vídeos en plataformas sociales para detectar contenido inapropiado, spam o infracciones de derechos de autor. Su licencia Apache 2.0 facilita su integración en productos comerciales.
- Generación de descripciones y metadatos para catálogos de comercio electrónico: a partir de imágenes de productos, el modelo genera títulos, descripciones y atributos automáticamente, reduciendo el trabajo manual en grandes inventarios.
- Asistente educativo interactivo: resolver problemas de matemáticas o ciencias a partir de fotografías de ejercicios, explicando el razonamiento paso a paso. Su buen rendimiento en MathVista lo hace útil para aplicaciones de tutoría.

## Benchmarks y rendimiento

La model card publica resultados de OpenCompass (media de 8 benchmarks) para varios modelos. Para MiniCPM-V 4.0 se indica una puntuación media de 69.0, superando a GPT-4.1-mini (68.9), Qwen2.5-VL-3B-Instruct (64.5), InternVL2.5-4B (65.1) y MiniCPM-V 2.6 (65.2). No se publican los valores individuales de cada benchmark para MiniCPM-V 4.0 en la información disponible.

| Modelo | Tamano | OpenCompass (media 8 benchmarks) |
|---|---|---|
| GPT-4v-20240409 | - | 63.5 |
| Gemini-1.5-Pro | - | 64.5 |
| GPT-4.1-mini-20250414 | - | 68.9 |
| Claude 3.5 Sonnet-20241022 | - | 70.6 |
| Qwen2.5-VL-3B-Instruct | 3.8B | 64.5 |
| InternVL2.5-4B | 3.7B | 65.1 |
| Qwen2.5-VL-7B-Instruct | 8.3B | 70.9 |
| InternVL2.5-8B | 8.1B | 68.1 |
| MiniCPM-V-2.6 | 8.1B | 65.2 |
| **MiniCPM-V 4.0** | **4.1B** | **69.0** |

No se han publicado resultados individuales de OCRBench, MathVista, HallusionBench, MMMU, MMVet, MMBench V1.1, MMStar o AI2D para MiniCPM-V 4.0 en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.6B parámetros reales, una cuantización Q4_K_M ocupa aproximadamente 2.1 GB, Q5_K_M ~2.6 GB y Q8_0 ~3.9 GB. En FP16 serían ~7.2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.) para cuantizaciones Q4-Q6. Para FP16 se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4070, etc.).
- Cabe en GPUs consumer: sí, incluso en las más modestas con cuantización GGUF.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory, demo web local, app iOS.
- Latencia y throughput: según la documentación, en iPhone 16 Pro Max se logran menos de 2 segundos para el primer token y más de 17 tokens por segundo. En GPUs consumer se espera un rendimiento superior, aunque no se proporcionan cifras exactas.
- También puede ejecutarse en CPU con cuantizaciones bajas (Q4_K_M) para tareas no interactivas.

## Comparativa con modelos similares

| Modelo | Tamano | OpenCompass | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM-V 4.0 | 4.1B | 69.0 | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-VL-3B-Instruct | 3.8B | 64.5 | 32k (tipico de la serie) | Apache 2.0 | safetensors, GGUF |
| InternVL2.5-4B | 3.7B | 65.1 | 32k | MIT | safetensors, GGUF |
| MiniCPM-V 2.6 | 8.1B | 65.2 | 4k (tipico) | Apache 2.0 | safetensors, GGUF |

MiniCPM-V 4.0 ofrece el mejor rendimiento por parámetro de su categoría, superando a modelos de tamaño similar y acercándose a modelos mucho más grandes como Qwen2.5-VL-7B (70.9) con la mitad de parámetros. Su licencia Apache 2.0 es igual de permisiva que la de Qwen2.5-VL y más permisiva que la de InternVL (MIT, aunque con cláusulas adicionales). El formato GGUF está disponible en todos los casos.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos específicos del modelo. Al ser un modelo entrenado con datos web, es probable que herede sesgos socioculturales presentes en el corpus de entrenamiento.
- Riesgo de alucinación visual: como todos los modelos multimodales, puede generar descripciones incorrectas de objetos o escenas poco comunes, especialmente en imágenes de baja resolución o con oclusiones.
- La longitud de contexto no está documentada, lo que dificulta planificar tareas que requieran procesar documentos largos o muchas imágenes simultáneamente.
- El rendimiento en vídeo está limitado por el número de frames procesables; no se especifica la duración máxima de vídeo soportada.
- Aunque la licencia es Apache 2.0, el modelo base puede tener dependencias de componentes con licencias diferentes (por ejemplo, SigLIP2). Se recomienda revisar las licencias de los componentes individuales antes de uso comercial.
- No se proporcionan datos de rendimiento en tareas de generación de código o razonamiento puramente textual; el modelo está optimizado para tareas multimodales.
- La documentación no especifica el número exacto de idiomas soportados ni su calidad relativa; el rendimiento puede degradarse en idiomas poco representados.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/openbmb/MiniCPM-V-4-gguf
- Modelo base (safetensors): https://huggingface.co/openbmb/MiniCPM-V-4
- Repositorio GitHub de MiniCPM-V: https://github.com/OpenBMB/MiniCPM-V
- Demo en línea: http://211.93.21.133:8889/
- Wiki (en chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Cookbook con ejemplos: https://github.com/OpenSQZ/MiniCPM-V-CookBook
