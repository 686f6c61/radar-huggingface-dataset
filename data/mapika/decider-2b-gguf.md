# Mapika/decider-2b-GGUF

## Resumen

Mapika/decider-2b-GGUF es la distribución en formato GGUF del modelo Mapika/decider-2b v11 (pesos sha256 `acaef222`), un modelo de decisión de 1.881.825.088 parámetros (aprox. 1,88 mil millones) construido sobre Qwen/Qwen3.5-2B-Base y publicado con licencia Apache-2.0. No es un modelo generativo: lee un estado y una o varias preguntas, cada una con una lista explícita de opciones, y devuelve en una sola pasada hacia delante una probabilidad para cada opción. La respuesta se extrae de los logits de los tokens correspondientes a las letras de cada opción, divididos por una temperatura ajustada, y no del texto que el modelo pudiera continuar.

El repositorio incluye tres ficheros GGUF (Q4_K_M de 1,3 GB, Q8_0 de 2,0 GB y BF16 de 3,8 GB), el tokenizador, `decider_config.json` con las temperaturas ajustadas y `decide_gguf.py`, que implementa la lectura de logits sobre llama.cpp. El modelo está etiquetado como `text-classification`, `structured-output`, `calibrated` y `one-pass`, y solo soporta inglés (`en`).

Su relevancia actual radica en que sustituye el patrón habitual de «generar texto y parsear la etiqueta» por una lectura directa de probabilidades calibradas en una única pasada, con latencias de 0,12 a 0,31 s por petición de 40 a 120 tokens en 8 hilos de CPU con Q4_K_M. Es, por tanto, una alternativa orientada a clasificación y enrutado determinista más que a conversación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible; modelo derivado de Qwen/Qwen3.5-2B-Base (transformer decoder) |
| Parámetros totales | 1.881.825.088 (aprox. 1,88 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (sin cuantizar), Q8_0, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp); el repositorio ocupa 7,1 GB e incluye Q4_K_M, Q8_0, BF16, tokenizador, `decider_config.json` y `decide_gguf.py` |

Ficheros publicados:

| Fichero | Tamaño | Uso indicado |
|---|---|---|
| `decider-2b-v11-Q4_K_M.gguf` | 1,3 GB | La cuantización más pequeña |
| `decider-2b-v11-Q8_0.gguf` | 2,0 GB | Prácticamente sin pérdida |
| `decider-2b-v11-BF16.gguf` | 3,8 GB | Sin cuantizar, para generar otras cuantizaciones |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no describe la arquitectura interna ni el proceso de entrenamiento: remite explícitamente a la ficha de Mapika/decider-2b para saber «qué es el modelo, cómo se entrenó y dónde falla». Lo único conocido es que decider-2b deriva de Qwen/Qwen3.5-2B-Base y que la versión empaquetada aquí es la v11. Por tanto, el número de tokens de entrenamiento, la composición del dataset y el uso de RLHF, DPO u otras técnicas de alineamiento no están disponibles en la información proporcionada.

La innovación funcional del modelo es el mecanismo de decisión: en lugar de generar texto, se construye un prompt con `decider.prompt` que contiene el estado y las preguntas con sus opciones, y la respuesta se lee de los logits de los tokens de letra de opción en cada slot de respuesta, normalizados por una temperatura ajustada y almacenada en `decider_config.json`. El resultado es una distribución de probabilidad por pregunta en una única pasada, lo que elimina la decodificación autorregresiva y el parseo posterior. La conversión a GGUF se realizó con llama.cpp en el commit `c9064dded` (2026-09-27) mediante `convert_hf_to_gguf.py --no-mtp --outtype bf16` y posterior `llama-quantize`; el flag `--no-mtp` es obligatorio porque el checkpoint no contiene pesos de predicción multi-token aunque su configuración declare una capa MTP, y sin él el conversor genera un fichero que llama.cpp no puede cargar.

## Capacidades

- Respuesta a preguntas de elección múltiple con lista explícita de opciones, devolviendo elección, confianza y distribución de probabilidad por opción (`decide()`).
- Procesamiento de varias preguntas independientes en una misma petición, cada una con su propio conjunto de opciones (el ejemplo de la card resuelve departamento y urgencia en una sola llamada).
- Salida estructurada y calibrada: las probabilidades se ajustan con temperaturas precalculadas en `decider_config.json`.
- Inferencia en una sola pasada hacia delante, sin decodificación autoregresiva ni generación de texto.
- Ejecución en CPU y GPU mediante llama.cpp y `llama-cpp-python` (0.3.35 o superior).
- Integración como endpoint compatible, según la etiqueta `endpoints_compatible` del repositorio.
- API ampliada anunciada pero no liberada en GGUF: `system_one` con respuestas de puntuación y sí/no, y servidor HTTP.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio.
- Sin capacidades multilingües: únicamente inglés.

## Casos de uso

- Triaje y enrutado de tickets de soporte: la card incluye el ejemplo canónico de una tarjeta cobrada dos veces, en el que el modelo decide el departamento (`billing`, `technical`, `sales`) y la urgencia (`low`, `medium`, `high`) en una sola llamada con dos preguntas.
- Clasificación de intención en asistentes conversacionales: antes de invocar una herramienta o una rama de diálogo, el sistema consulta al modelo a qué intención corresponde el turno del usuario, con la ventaja de obtener una probabilidad por opción para fijar umbrales de derivación a humano.
- Enrutado en pipelines RAG: decidir, para cada consulta, qué índice, colección documental o estrategia de recuperación debe activarse, usando la confianza devuelta como criterio de escalado.
- Anotación y etiquetado de datos a escala: el conjunto de regresión de la ficha base contiene 95 tareas y 144.226 preguntas, un orden de magnitud que el modelo puede procesar por lotes en CPU gracias a los 0,12-0,31 s por petición.
- Moderación y aplicación de políticas: asignar categorías de política a texto libre eligiendo entre un conjunto cerrado de etiquetas, con la probabilidad asociada como señal de revisión manual en los casos ambiguos.
- Clasificación de correo entrante y cualificación de leads: determinar área responsable, prioridad y tipo de solicitud en un único forward pass, integrándolo en un servidor HTTP interno mediante `decide_gguf.py` más `llama-server`.
- Enrutado de decisiones en agentes multi-paso controlados externamente: el agente orquesta los pasos y usa decider-2b exclusivamente como componente de decisión cerrada, nunca como generador de texto ni como planificador autónomo.
- Encuestas y formularios asistidos: inferir la categoría de una respuesta en texto libre sobre una lista de opciones predefinida para precargar formularios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que, en la fecha de publicación (2026-09-27), la medición de calidad seguía en curso: se está ejecutando el conjunto de regresión de la ficha de decider-2b (95 tareas, 144.226 preguntas) a través de llama.cpp y comparando fila a fila con los pesos bf16 en PyTorch. La card afirma que esa sección contendrá los números cuando estén listos.

La única referencia de calidad numérica aportada es la del modelo hermano decider-4b: con Q8_0 los resultados igualaron a los pesos bf16, y con Q4_K_M la caída fue de 0,2 puntos dentro de tarea.

| Medición | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks estándar | No disponibles |
| Comparación GGUF vs. bf16 en PyTorch (decider-2b) | En curso en la fecha de la card; sin cifras publicadas |
| Referencia en decider-4b: Q8_0 vs. bf16 | Equivalente |
| Referencia en decider-4b: Q4_K_M vs. bf16 | 0,2 puntos menos dentro de tarea |
| Latencia Q4_K_M, 8 hilos de CPU, 40-120 tokens | 0,12-0,31 s por petición |
| Latencia Q8_0 respecto a Q4_K_M | Aproximadamente un 12% más lenta |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo orientativo a partir del tamaño de los ficheros, no publicado por el autor): en torno a 1,5-2 GB con Q4_K_M, 2,5-3 GB con Q8_0 y 4-5 GB con BF16, incluyendo overhead de contexto y buffers de llama.cpp.
- Cabe en GPU de consumo en todos los formatos: Q4_K_M y Q8_0 en tarjetas de 4 GB o más (por ejemplo GTX 1650, RTX 3050), y BF16 en tarjetas de 6 GB o más (RTX 3060, RTX 4060). Con `n_gpu_layers=-1` se descargan todas las capas a la GPU si la build tiene soporte.
- Funciona exclusively en CPU: la card reporta 0,12-0,31 s por petición de 40 a 120 tokens con Q4_K_M en 8 hilos de un servidor.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-quantize`), `llama-cpp-python` 0.3.35 o superior, el paquete `decider-ai==1.5.0` con `decide_gguf.py`, Ollama y LM Studio como cargadores de GGUF, y endpoints compatibles.
- Builds: la medición de latencia y de calidad se realizó con la build de CUDA; las builds de CPU y Metal no se ejecutaron sobre el conjunto de regresión. Para GPU hay que compilar con `CMAKE_ARGS="-DGGML_CUDA=on"` y para Apple Silicon con `-DGGML_METAL=on`.
- Throughput: no disponible; solo se publica latencia por petición.
- Requisito operativo crítico: puntuar un único prompt por cada `llama_decode`. Si se envían varios prompts en un mismo decode como secuencias separadas, llama.cpp (septiembre de 2026) produce probabilidades que varían según los demás prompts del lote, hasta 0,02 en BF16 y hasta 0,16 en Q4_K_M en este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Mapika/decider-2b-GGUF | 1,88 B | GGUF (BF16, Q8_0, Q4_K_M) | No disponible | Apache-2.0 | Objeto de esta ficha; versión v11, pesos sha256 `acaef222` |
| Mapika/decider-2b | 1,88 B | safetensors (PyTorch, bf16) | No disponible | Apache-2.0 | Modelo de referencia del que se derivan estas cuantizaciones; la card remite a él para arquitectura, entrenamiento y limitaciones |
| Mapika/decider-4b-GGUF | No disponible | GGUF | No disponible | No disponible (heredada del modelo base) | Modelo hermano de mayor tamaño citado como referencia de calidad; Q8_0 iguala a bf16 y Q4_K_M cae 0,2 puntos |
| Qwen/Qwen3.5-2B-Base | No disponible (denominación de 2 B) | safetensors | No disponible | Apache-2.0 según la card del GGUF | Modelo base de decider-2b; es un modelo de lenguaje generativo, no un modelo de decisión, por lo que no es sustituible directamente |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a formato, licencia y relación de derivación.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación de texto. Cargarlo en `llama-cli`, `llama-server`, Ollama o LM Studio produce un modelo que continúa prompts; ese texto no es su respuesta. La respuesta válida solo se obtiene leyendo los logits de los tokens de opción con `decide_gguf.py`.
- Requiere un conjunto cerrado de opciones por pregunta: no puede responder a preguntas abiertas ni generar etiquetas no previstas en la lista.
- Solo inglés; cualquier entrada en otro idioma queda fuera del alcance declarado del modelo.
- Longitud de contexto no publicada, lo que impide dimensionar con precisión el tamaño máximo de estado admitido.
- Reproducibilidad sensible al batching: mezclar varios prompts en un mismo `llama_decode` altera las probabilidades hasta 0,16 en Q4_K_M. Es obligatorio un prompt por decode si se necesita estabilidad entre ejecuciones.
- Diferencias entre backends: las builds de CPU y GPU dan probabilidades ligeramente distintas sobre el mismo fichero (0,938 en CPU para «billing» en Q4_K_M frente a 0,948 en PyTorch). Las cifras no son portables entre entornos sin recalibración.
- Calidad de las cuantizaciones sin verificar: la comparación GGUF frente a bf16 estaba en curso en la fecha de publicación; hasta que se publiquen los números, la pérdida real de Q4_K_M en este modelo concreto es desconocida (en decider-4b fue de 0,2 puntos).
- Conversión frágil: el checkpoint no contiene pesos MTP aunque su configuración declare una capa, de modo que es imprescindible usar `--no-mtp` en `convert_hf_to_gguf.py` para producir ficheros cargables.
- API incompleta en GGUF: `decide_gguf.py` solo cubre `decide()`; `system_one` (puntuación y sí/no) y el servidor HTTP todavía no están en una versión publicada de `decider-ai`, lo que limita su uso en producción a preguntas de elección.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 «likes», sin evidencia pública de uso en producción.
- Licencia Apache-2.0, heredada de decider-2b y de Qwen/Qwen3.5-2B-Base, que permite uso comercial; conviene verificar los términos del modelo base por separado.
- Riesgo de alucinación: no aplica en el sentido generativo habitual, ya que el modelo no produce texto libre; el riesgo real es de miscalibración, es decir, asignar alta confianza a una opción incorrecta cuando el estado de entrada es ambiguo o ajeno al dominio de entrenamiento.
- Sesgos: no disponibles; la card del repositorio GGUF no documenta sesgos ni composición del dataset de entrenamiento.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Mapika/decider-2b-GGUF
- Modelo base decider-2b (arquitectura, entrenamiento, limitaciones): https://huggingface.co/Mapika/decider-2b
- Modelo hermano decider-4b-GGUF, usado como referencia de calidad: https://huggingface.co/Mapika/decider-4b-GGUF
- Modelo base original de la familia: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Paquete Python citado en la card (`pip install decider-ai==1.5.0`): https://pypi.org/project/decider-ai/
- llama.cpp, motor de inferencia y commit de conversión `c9064dded` (2026-09-27): https://github.com/ggml-org/llama.cpp
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (enlaces a concursos de la página de inicio de Bing en Reddit), por lo que no aportan enlaces técnicos, papers ni demos utilizables. No se han encontrado papers, blogs ni demostraciones asociados en la información disponible.
