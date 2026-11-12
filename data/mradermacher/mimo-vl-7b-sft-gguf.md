# mradermacher/MiMo-VL-7B-SFT-GGUF

## Resumen

MiMo-VL-7B-SFT-GGUF es la versión cuantizada en formato GGUF del modelo multimodal MiMo-VL-7B-SFT, desarrollado originalmente por Xiaomi (XiaomiMiMo). El modelo combina un backbone de lenguaje de aproximadamente 7.620 millones de parámetros con un codificador visual, lo que lo convierte en un modelo visión-lenguaje (VLM) capaz de procesar imágenes junto con texto. Esta ficha concreta corresponde a las cuantizaciones estáticas publicadas por mradermacher, un colaborador habitual de la comunidad que genera quants GGUF listos para usar con llama.cpp y herramientas compatibles.

El modelo base está pensado para tareas de razonamiento multimodal: descripción de imágenes, respuesta a preguntas visuales, OCR y comprensión de documentos. La versión SFT indica que ha pasado por un ajuste supervisado sobre el modelo preentrenado. El repositorio incluye tanto los pesos cuantizados del modelo de lenguaje como los ficheros `mmproj` (proyección multimodal) necesarios para procesar imágenes.

La relevancia de esta ficha es práctica: permite ejecutar un VLM de 7B en hardware de consumo mediante cuantizaciones de 4 a 8 bits, con licencia MIT, sin depender de GPUs de datacenter. El repositorio ocupa 70,5 GB en total porque incluye todas las variantes de cuantización, pero cada fichero individual pesa entre 3,2 y 15,4 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje + codificador visual con proyección `mmproj`) |
| Parámetros totales | 7.622.619.136 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además `mmproj` en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base MiMo-VL-7B-SFT es un modelo visión-lenguaje construido sobre un transformer de lenguaje de aproximadamente 7.620 millones de parámetros, al que se acopla un codificador visual mediante una proyección multimodal (`mmproj`). En esta ficha GGUF, la parte visual se distribuye como ficheros separados (`mmproj-Q8_0` de 0,8 GB y `mmproj-f16` de 1,5 GB), mientras que el backbone de lenguaje se ofrece en las distintas cuantizaciones. El sufijo SFT indica que el modelo recibió ajuste supervisado sobre el preentrenamiento.

Los detalles concretos del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO, innovaciones como atención lineal o decodificación especulativa) no están disponibles en la información proporcionada. La model card de esta ficha es la de las cuantizaciones de mradermacher, que no reproduce la ficha técnica del modelo original de Xiaomi. Las cuantizaciones estáticas se generan con `quantize_version: 2` y `output_tensor_quantised: 1`, y existe una variante con quants ponderados/imatrix en el repositorio `mradermacher/MiMo-VL-7B-SFT-i1-GGUF`.

## Capacidades

- Comprensión de imágenes y texto combinados (modelo visión-lenguaje).
- Generación de texto conversacional a partir de entradas multimodales.
- Respuesta a preguntas visuales (VQA) sobre imágenes.
- Descripción y análisis de contenido visual.
- Procesamiento de documentos e imágenes con texto (OCR y comprensión de documentos), presumiblemente, aunque no se detalla en la información disponible.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades de tool calling, agentes, matemáticas, código y audio: no disponibles en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes: el modelo puede generar texto descriptivo a partir de una imagen, útil para accesibilidad, catalogación de fotos o generación de alt-text en CMS.
- Respuesta a preguntas visuales en aplicaciones de asistencia: un usuario sube una foto y formula preguntas sobre ella; el modelo procesa la imagen mediante `mmproj` y responde en lenguaje natural.
- Digitalización y comprensión de documentos: extracción de información de capturas, formularios o páginas escaneadas en pipelines de procesamiento documental, siempre que se valide la calidad de OCR.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en plataformas, con revisión humana posterior dado el riesgo de alucinación.
- Asistentes locales en hardware de consumo: al estar disponible en GGUF de 4-6 GB, puede desplegarse con llama.cpp u Ollama en un portátil con GPU modesta o incluso CPU, para tareas de visión-lenguaje sin conexión.
- Prototipado rápido de pipelines multimodales: integración con `llama.cpp` y servidores compatibles con la API de OpenAI (`endpoints_compatible`) para experimentar con VLM antes de escalar a un modelo mayor.
- Análisis de imágenes en investigación: evaluación comparativa de modelos VLM pequeños en tareas de percepción y razonamiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB con Q4_K_M (4,8 GB de pesos) más overhead de contexto y del proyector visual; unos 6-7 GB con Q6_K; unos 9-10 GB con Q8_0; unos 16-17 GB con f16.
- El proyector multimodal añade 0,8 GB (mmproj-Q8_0) o 1,5 GB (mmproj-f16) que deben cargarse junto al modelo de lenguaje.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando Q4_K_M o Q5_K_M; las cuantizaciones Q2_K/Q3_K caben en GPUs de 4-6 GB con margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`), y cualquier runtime que soporte GGUF con `mmproj`. Para el modelo base en safetensors, transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-VL-7B-SFT (esta ficha, GGUF) | ~7,62 B | no disponible | MIT | GGUF + mmproj | VLM de Xiaomi, cuantizado por mradermacher |
| Modelo base XiaomiMiMo/MiMo-VL-7B-SFT | ~7,62 B | no disponible | MIT | safetensors | Versión original sin cuantizar |
| Variante imatrix (mradermacher/MiMo-VL-7B-SFT-i1-GGUF) | ~7,62 B | no disponible | MIT | GGUF | Quants ponderados de mayor calidad |

No se dispone de datos de rendimiento comparativo con otros VLM de tamaño similar (por ejemplo, Qwen2-VL-7B o Llava-1.5-7B) en la información proporcionada, por lo que la comparación se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- Solo se declara soporte de inglés (`en`); el rendimiento en castellano no está verificado.
- Es un modelo de 7B con ajuste supervisado: riesgo de alucinación en descripciones de imágenes y en OCR, especialmente con imágenes de baja calidad o texto pequeño.
- La longitud de contexto no está documentada en esta ficha; conviene verificarla en la model card del modelo base antes de usarlo con entradas largas.
- Las cuantizaciones Q2_K y Q3_K degradan la calidad; para producción se recomienda Q4_K_M o superior.
- El repositorio completo ocupa 70,5 GB; hay que descargar solo los ficheros necesarios (modelo + `mmproj`).
- Licencia MIT: permite uso comercial, pero conviene revisar la ficha del modelo base de Xiaomi por si añade condiciones adicionales.
- No hay datos publicados de benchmarks en la información disponible, por lo que no se puede avalar su rendimiento frente a alternativas sin evaluación propia.
- El modelo está pensado para conversación multimodal; no se documentan capacidades de tool calling ni de agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiMo-VL-7B-SFT-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-VL-7B-SFT
- Variante imatrix: https://huggingface.co/mradermacher/MiMo-VL-7B-SFT-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiMo-VL-7B-SFT-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
