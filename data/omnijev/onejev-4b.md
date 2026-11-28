# OmniJev/OneJev-4B

## Resumen

OneJev-4B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev. Se trata de un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-4B, entrenado sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes. Su particularidad es que no genera texto libre: recibe un estado (captura de pantalla, foto, vídeo o texto plano) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta.

El modelo resuelve el problema de la toma de decisiones rápida y calibrada en agentes autónomos, especialmente en entornos GUI. En lugar de razonar paso a paso con cadenas largas de pensamiento, OneJev-4B produce directamente distribuciones de probabilidad sobre acciones discretas (clic, escribir, scroll, parar), niveles de progreso o condiciones booleanas (noul). Esto lo hace adecuado para bucles de control de agentes donde la latencia es crítica.

Con 5.174.964.736 parámetros reales según safetensors y un repositorio de 10,4 GB, el modelo se distribuye bajo licencia Apache 2.0 y está disponible en la librería transformers con pesos en safetensors. Forma parte de una familia de cinco tamaños (0.8B, 4B, 9B, 27B y 27B-FP8) y se sirve mediante Flide, un servidor que implementa la API System One de TypeSafe con soporte adicional de medios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune de Qwen3.5-4B), etiquetado como qwen3_5 |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 disponible (build de mradermacher); FP8 solo en la variante OneJev-27B-FP8; otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF (build comunitario) |

## Arquitectura y entrenamiento

OneJev-4B es un fine-tune completo de Qwen/Qwen3.5-4B, un transformer multimodal que procesa entradas de texto e imagen (pipeline image-text-to-text). El modelo conserva la arquitectura del base y se especializa mediante entrenamiento supervisado sobre 99.193 preguntas procedentes de ejecuciones reales de agentes, vídeos e imágenes, recogidas en el dataset OmniJev/OneJev-Data. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset.

La innovación principal no está en la arquitectura sino en la interfaz de salida: el modelo emite probabilidades calibradas por opción en un solo forward pass, con tipos de pregunta definidos (noul para condiciones booleanas, choice para selección entre criterios, score para niveles ordinales). El sistema se sirve a través de Flide, que implementa la API System One de TypeSafe y añade un campo media para imágenes y vídeo. No se documentan en la información disponible detalles sobre RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Decisión multimodal calibrada: devuelve probabilidades por opción para preguntas tipadas sobre imágenes, vídeos o texto.
- Preguntas de tipo noul: probabilidad de que una condición booleana se cumpla (por ejemplo, "la factura ha sido pagada").
- Preguntas de tipo choice: distribución de probabilidad sobre criterios discretos definidos por el usuario (clic, escribir, scroll, parar).
- Preguntas de tipo score: nivel esperado sobre una escala ordinal (por ejemplo, progreso de la tarea).
- Procesamiento de capturas de pantalla y fotos en un único forward pass.
- Procesamiento de vídeo (requiere el servidor PyTorch de Flide; no disponible en la ruta llama.cpp).
- Orientación a agentes GUI: pensado para bucles de control de agentes que operan sobre interfaces gráficas.
- Soporte de múltiples preguntas en una sola petición (10 preguntas en 104 ms según el autor).
- Servido mediante API compatible con endpoints (etiqueta endpoints_compatible) y con llama.cpp vía GGUF.

## Casos de uso

- Control de agentes GUI: el modelo recibe la captura de pantalla actual y devuelve la probabilidad de cada acción posible (clic, escribir, scroll, parar), permitiendo seleccionar la acción más probable en un bucle de control con latencia de decenas de milisegundos.
- Verificación de finalización de tareas: mediante preguntas de tipo noul, un orquestador puede comprobar si una condición se ha cumplido (por ejemplo, "la factura ha sido pagada") antes de cerrar un flujo agéntico.
- Monitorización de progreso: con preguntas de tipo score, el modelo estima en qué nivel ordinal se encuentra una tarea ("no iniciada", "a medias", "casi terminada", "terminada"), útil para sistemas de supervisión de agentes de larga duración.
- Enrutamiento de acciones en asistentes de escritorio: dado un estado de pantalla y un conjunto de criterios, el modelo distribuye probabilidad entre las acciones candidatas, lo que permite políticas de agente rápidas sin generación de texto libre.
- Análisis de vídeo para agentes: al soportar vídeo en el servidor PyTorch, puede evaluar estados temporales de una tarea a partir de grabaciones de pantalla o secuencias de vídeo.
- Evaluación de políticas de agente en investigación: al devolver probabilidades calibradas, sirve como modelo de referencia para medir la incertidumbre de un agente y comparar políticas en entornos simulados.
- Pre-filtrado de decisiones en pipelines de automatización: integrado vía API System One, puede actuar como primera etapa de decisión de bajo coste antes de invocar modelos de razonamiento más grandes.

## Benchmarks y rendimiento

El autor publica una tabla de resultados comparando OneJev-4B con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking, con precisión en porcentaje sobre un conjunto de test de OneJev que contiene tipos de pregunta no vistos en entrenamiento. Sin embargo, los valores numéricos de esa tabla no están incluidos en la información proporcionada (solo se referencia la imagen assets/results.svg), por lo que no se pueden reproducir aquí.

Datos de latencia publicados por el autor:

| Escenario | Hardware | Latencia |
|---|---|---|
| 1 pregunta, captura 1280x720 | 1x H200 | 64 ms |
| 10 preguntas en una petición, captura 1280x720 | 1x H200 | 104 ms (10,4 ms por pregunta) |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 10,4 GB en safetensors, por lo que la inferencia en precisión completa requiere al menos ~11-12 GB de VRAM considerando overhead; en GGUF Q8_0 el peso ronda los 5-6 GB.
- GPU recomendadas: el autor reporta latencias en una H200; para producción con vídeo se recomienda GPU de datacenter (H100/H200, A100).
- GPU de consumo: con el build GGUF Q8_0 es plausible en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070), aunque no se confirman cifras oficiales.
- Opciones de despliegue: Flide (servidor PyTorch, soporta imágenes y vídeo), llama.cpp vía `qev serve --gguf mradermacher/OneJev-4B-GGUF:Q8_0` (solo imágenes, sin vídeo), y transformers.
- Latencia y throughput: 64 ms por pregunta individual y 10,4 ms por pregunta en lotes de 10 sobre H200 con captura 1280x720.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev-4B | 5,17B | no disponible | Decisión multimodal calibrada (System One) | Apache 2.0 | Hugging Face, GGUF, Flide |
| OneJev-0.8B | no disponible | no disponible | Decisión multimodal calibrada | Apache 2.0 | Hugging Face (2,2 GB) |
| OneJev-9B | no disponible | no disponible | Decisión multimodal calibrada | Apache 2.0 | Hugging Face (18,8 GB) |
| OneJev-27B | no disponible | no disponible | Decisión multimodal calibrada | Apache 2.0 | Hugging Face (54,7 GB) |
| Jev 1.13 | no disponible | no disponible | Modelo de decisión solo texto | no disponible | Referencia publicada por el autor |
| Jev-Omni 12B | 12B (aprox.) | no disponible | Modelo de decisión multimodal | no disponible | Referencia en la tabla del autor |

La información disponible no permite comparar con modelos de propósito general como Qwen3.5-4B en benchmarks estándar, ya que OneJev-4B está especializado en una tarea de decisión distinta. Los datos de la comparativa con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking existen en la model card pero sus valores numéricos no se han proporcionado.

## Limitaciones y advertencias

- El modelo no es un generador de texto libre: está diseñado para responder preguntas tipadas con probabilidades, no para mantener conversaciones abiertas.
- No se documentan los idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- No se especifica la longitud de contexto, lo que impide evaluar su comportamiento con estados muy largos o secuencias de vídeo extensas.
- El conjunto de test incluye tipos de pregunta no vistos en entrenamiento; el rendimiento en tipos completamente nuevos fuera de esa taxonomía no está garantizado.
- La calibración de probabilidades depende del dominio de entrenamiento (ejecuciones de agentes, vídeos e imágenes); fuera de ese dominio las probabilidades pueden no estar bien calibradas.
- El soporte de vídeo solo está disponible en el servidor PyTorch de Flide; la ruta llama.cpp/GGUF no procesa vídeo.
- No se han publicado datos sobre sesgos, riesgo de alucinación en las probabilidades ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que conviene revisar.
- El ecosistema (Flide, API System One) es específico del autor y puede requerir adaptación para integrarse en infraestructuras existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev-4B
- Colección OneJev: https://huggingface.co/collections/OmniJev/onejev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Demo en Spaces: https://huggingface.co/spaces/BradNLP/OneJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Servidor Flide: https://github.com/OmniJev/Flide
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Sitio web: https://omnijev.github.io/OneJev/
- Build GGUF de mradermacher: https://huggingface.co/mradermacher/OneJev-4B-GGUF
- OneJev-0.8B: https://huggingface.co/OmniJev/OneJev-0.8B
- OneJev-9B: https://huggingface.co/OmniJev/OneJev-9B
- OneJev-27B: https://huggingface.co/OmniJev/OneJev-27B
- OneJev-27B-FP8: https://huggingface.co/OmniJev/OneJev-27B-FP8
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
