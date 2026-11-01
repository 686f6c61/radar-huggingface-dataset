# Harshpenhour/handwriting-reader

## Resumen

PenHour handwriting reader es una cuantización GGUF del modelo PaddleOCR-VL-1.6 de PaddlePaddle (Baidu), publicada por el usuario Harshpenhour para el funcionamiento local de PenHour, una aplicación de macOS para llevar un diario escrito a mano en papel. El repositorio contiene dos ficheros: el modelo de lenguaje en Q5_K_M (341 MB) y el proyector de visión en Q4_K_M (487 MB), ambos ejecutables con llama.cpp en el propio Mac del usuario sin subir las páginas a ningún servidor.

El modelo subyacente es un modelo multimodal de reconocimiento óptico de caracteres (OCR) especializado en escritura manuscrita, con 466.654.208 parámetros totales según los datos de safetensors del repositorio. La aportación concreta de esta publicación no es un nuevo entrenamiento, sino la conversión del proyector de visión a Q4_K_M con `llama-quantize` (build 11803 de llama.cpp) para reducir el tamaño de descarga; el fichero del modelo de lenguaje se mantiene sin cambios respecto a las conversiones comunitarias existentes.

Es relevante por su enfoque de privacidad y despliegue en el borde: un OCR multimodal de algo menos de 500 millones de parámetros que cabe en un portátil y procesa imágenes de páginas manuscritas de forma completamente local. La licencia Apache 2.0 del modelo original facilita su reutilización comercial, aunque la información publicada sobre el modelo es muy limitada y no incluye benchmarks, idiomas soportados ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal OCR de PaddleOCR-VL-1.6; componentes de lenguaje y proyector de visión) |
| Parametros totales | 466.654.208 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de `llama-server` de la model card) |
| Tipos de cuantizacion | Q5_K_M (modelo de lenguaje), Q4_K_M (proyector de visión); GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo base, PaddleOCR-VL-1.6 de PaddlePaddle (Baidu), es un sistema multimodal de OCR que combina un modelo de lenguaje con un proyector de visión, tal como refleja la estructura de los dos ficheros GGUF publicados. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La única modificación técnica documentada por el autor es la cuantización del proyector de visión de precisión completa a Q4_K_M mediante `llama-quantize` (build 11803 de llama.cpp), con el objetivo de reducir el tamaño de descarga. El fichero del modelo de lenguaje Q5_K_M procede de conversiones comunitarias previas (SanjeevSOLANKI/PaddleOCR-VL-1.6-GGUF y EstevaoNaval/PaddleOCR-VL-1.6-GGUF) y se distribuye sin cambios. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de páginas, con especialización declarada en escritura manuscrita.
- Procesamiento multimodal: acepta una imagen de página junto con un prompt de texto (el prompt documentado es `OCR:`).
- Ejecución local mediante llama.cpp, sin envío de datos a servidores externos.
- Integración con `llama-server` mediante el flag `--jinja` y el flag `--mmproj` para cargar el proyector de visión.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni modo de pensamiento.

## Casos de uso

- Digitalización de diarios manuscritos: la aplicación PenHour descarga los dos ficheros una vez y ejecuta el modelo en el Mac del usuario para transcribir páginas de un diario en papel, manteniendo el contenido privado en el dispositivo.
- Archivo personal de notas y cuadernos: un usuario puede procesar lotes de fotografías de páginas manuscritas y obtener texto editable sin depender de servicios en la nube, gracias al tamaño reducido del modelo (menos de 1 GB en total).
- Aplicaciones de escritorio con requisitos de privacidad: desarrolladores que necesiten OCR local en macOS pueden integrar estos GGUF con llama.cpp y evitar el cumplimiento normativo asociado al envío de documentos a terceros.
- Prototipado de pipelines OCR en el borde: el modelo sirve para validar flujos de extracción de texto en dispositivos con recursos limitados antes de escalar a modelos mayores.
- Herramientas de accesibilidad: transcripción local de notas manuscritas para usuarios que necesiten convertir texto en papel a formato digital sin conexión.
- Investigación sobre OCR manuscrito de bajo coste: el modelo permite experimentar con cuantizaciones Q4/Q5 y medir el impacto en calidad sobre escritura a mano en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los ficheros (341 MB el modelo de lenguaje y 487 MB el proyector), el conjunto ocupa menos de 1 GB en disco y requiere una cantidad de memoria comparable más el espacio para el contexto (4096 tokens en el ejemplo documentado).
- GPU recomendadas: no se especifican. El caso de uso documentado es un Mac con llama.cpp, por lo que se apoya en Metal en Apple Silicon.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo; no se documentan modelos concretos.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj` y `--jinja`). No se documentan vLLM, TGI, Ollama ni otras opciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la información proporcionada. A continuación se comparan únicamente los datos objetivos disponibles frente al modelo base del que deriva.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PenHour handwriting reader (esta ficha) | 466.654.208 | 4096 (ejemplo de uso) | GGUF Q5_K_M + Q4_K_M | Apache 2.0 | Proyector de visión cuantizado a Q4_K_M |
| PaddleOCR-VL-1.6 (base) | no disponible | no disponible | safetensors | Apache 2.0 | Modelo original de PaddlePaddle (Baidu) |
| Conversiones comunitarias GGUF (SanjeevSOLANKI, EstevaoNaval) | no disponible | no disponible | GGUF | Apache 2.0 | Origen del fichero de lenguaje sin cambios |

## Limitaciones y advertencias

- La información publicada es muy escasa: no hay benchmarks, idiomas soportados, detalles de entrenamiento ni evaluación de calidad del OCR manuscrito.
- El modelo está especializado en OCR de escritura manuscrita y páginas; no se documentan capacidades generales de razonamiento, código o matemáticas.
- Riesgo de alucinación inherente a los modelos de lenguaje: la transcripción puede incluir texto inventado o corregido de forma no fiel al original, especialmente con caligrafía difícil.
- El contexto documentado en el ejemplo es de 4096 tokens, lo que limita el tamaño de las páginas o la longitud de las transcripciones en una sola pasada.
- La cuantización Q4_K_M del proyector de visión puede degradar la calidad respecto a precisión completa; no se publica una comparación de calidad antes y después.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre el cumplimiento de las condiciones del modelo base.
- El repositorio tiene muy poca tracción (42 descargas, 0 likes) y fue creado en octubre de 2026; no hay evidencia de mantenimiento continuo.
- Uso previsto ligado a la aplicación PenHour; para otros fines conviene validar el comportamiento con muestras propias antes de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Harshpenhour/handwriting-reader
- Modelo base PaddleOCR-VL-1.6: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Conversión GGUF comunitaria: https://huggingface.co/SanjeevSOLANKI/PaddleOCR-VL-1.6-GGUF
- Conversión GGUF comunitaria: https://huggingface.co/EstevaoNaval/PaddleOCR-VL-1.6-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Aplicación PenHour: https://penhour.com
