# Aayush9029/petal-w1

## Resumen

petal-w1 es un ajuste fino completo (full fine-tune) de Qwen3.5-0.8B orientado a una única tarea: convertir dictado en bruto en el texto que el hablante quería escribir. Lo desarrolla Aayush Pokharel (Aayush9029) como componente de limpieza on-device dentro de Petal, una aplicación gratuita de dictado para macOS que funciona de forma local sobre Apple silicon. El modelo no es un asistente conversacional: elimina muletillas, tartamudeos y arranques falsos, resuelve autocorrecciones ("el viernes, no, espera, el jueves" pasa a "el jueves"), condensa digresiones y normaliza números, horas, rutas de ficheros, URLs y listas, sin responder nunca al contenido del texto.

Técnicamente es un transformer de 752.393.024 parámetros (0,8B nominales) con capas de atención linear, distribuido en formato MLX en 8 bits. El repositorio ocupa 0,8 GB y la inferencia se ejecuta con `mlx-lm` o con el runtime Swift de Petal. Su relevancia actual está en el nicho del post-procesado de ASR: es un modelo pequeño, cuantizado, de licencia Apache 2.0 y con latencias de cientos de milisegundos, lo que lo hace viable para integrarse directamente en la ruta de escritura de una aplicación de dictado sin depender de la nube.

El proyecto publica una evaluación sobre 200 transcripciones reservadas (61 dictados reales de la app y 139 sintéticas) y una comparativa contra S1-mini de Superwhisper, el principal competidor en el mismo nicho de limpieza de dictado. El modelo base no se emplea como asistente general: es una especialización estrecha sobre un único idioma (inglés) y un único formato de prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atencion linear (fine-tune completo del modelo de lenguaje de Qwen3.5-0.8B; el encoder de vision no se utiliza) |
| Parametros totales | 752.393.024 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8 bits (este repositorio), MLX 4 bits (Aayush9029/petal-w1-4bit) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (la misma que Qwen3.5-0.8B) |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

petal-w1 es un ajuste fino completo de los pesos del modelo de lenguaje de Qwen3.5-0.8B; el encoder de vision del modelo base queda fuera del ajuste y del uso. La arquitectura hereda las capas de atencion linear de la familia Qwen3.5, que durante el entrenamiento se implementaron con una regla delta con compuertas por bloques (chunked gated delta rule) para acelerar el cálculo. El modelo se distribuye en dos builds MLX: 8 bits (este repositorio) y 4 bits (`Aayush9029/petal-w1-4bit`).

El entrenamiento se hizo con MLX sobre un Apple M4 Pro en dos etapas. La etapa 1 usó 2.740 pares de entrenamiento y 144 de validación, durante 3 épocas, con batch 8 y learning rate 1e-5 con decaimiento coseno. La etapa 2 añadió 640 pares centrados en puntos repetidos, mezclados con 1.300 pares de la etapa 1, durante 1 época y con learning rate 5e-6. La pérdida se calcula únicamente sobre la salida limpia. Los datos de entrada combinan dictados reales de la app Petal (aproximadamente un 8 % del total) con dictados sintéticos de dominios como trabajo, código, correo, mensajes, notas y digresiones largas; las salidas de referencia las generó NVIDIA Nemotron 3 Ultra a partir de una especificación de limpieza de 14 reglas. Se aplicaron filtros para descartar respuestas conversacionales, salidas vacías en habla real y valores atípicos de longitud.

## Capacidades

- Limpieza de dictado: elimina muletillas, tartamudeos, arranques falsos y tics verbales.
- Resolución de autocorrecciones: conserva únicamente la versión final cuando el hablante se corrige a sí mismo.
- Desduplicación semántica: enuncia una vez los puntos que el hablante repite con otras palabras, manteniendo todos los detalles.
- Condensación de digresiones: convierte parlamentos largos y desordenados en frases claras sin perder hechos, nombres, números ni peticiones.
- Preservación de la intención: mantiene las preguntas como preguntas y las peticiones como peticiones; no responde al texto.
- Preservación del registro: conserva la voz y el argot del hablante.
- Normalización de formato: da formato a números, horas, código, nombres de ficheros, URLs y listas.
- Tarea única: no es un modelo conversacional, no soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio.
- Multilingüismo: no disponible; el modelo está entrenado y evaluado únicamente en inglés.
- Modo thinking: el prompt de referencia lo desactiva explícitamente (`enable_thinking=False`).

## Casos de uso

- Limpieza de dictado en la propia app Petal: el modelo se invoca con el prompt de sistema fijo tras la transcripción ASR, con decodificación greedy y `max_tokens=256`; es su caso de uso nativo y el que se mide en la evaluación publicada.
- Post-procesado de ASR en aplicaciones de terceros: cualquier app de dictado puede insertar petal-w1 como etapa posterior al reconocedor de voz para convertir transcripciones crudas en texto publicable, siempre que el idioma sea inglés.
- Dictado de correo y mensajes: la evaluación incluye dominios de correo y mensajería, y el modelo preserva peticiones y preguntas sin responderlas, lo que evita que un dictado se convierta en una réplica automática.
- Dictado técnico con código, rutas y URLs: el modelo formatea nombres de ficheros, URLs y fragmentos de código, útil para desarrolladores que dictan comandos, rutas o identificadores.
- Notas de reunión y resúmenes de voz: al condensar digresiones de 80 o más palabras manteniendo aproximadamente el 82 % de la longitud original, sirve para convertir notas habladas largas en texto legible.
- Preprocesado de corpus de habla para entrenamiento: puede normalizar transcripciones sintéticas o reales antes de usarlas como datos de entrenamiento de otros sistemas de ASR o de diálogo.
- Accesibilidad y subtitulado en inglés: limpieza de transcripciones en vivo antes de mostrarlas en pantalla, con latencias de 150-376 ms según el runtime.
- Integración en herramientas de productividad: el proyecto publica una extensión de Raycast para controlar Petal (iniciar y detener grabación, buscar historial, cambiar de modelo y copiar la última transcripción), lo que abre la puerta a flujos de dictado dentro de macOS.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (marcados como no verificados en la model card). La similitud es similitud de edición a nivel de palabra frente a la referencia del profesor, tras eliminar mayúsculas y puntuación. La columna "Replies" cuenta las salidas que responden a la transcripción en lugar de limpiarla.

| Modelo | Todas | Cortas (<25 palabras) | Medias | Digresiones (80+ palabras) | Puntos repetidos | Longitud de digresión conservada | Replies | Latencia mediana (mlx-lm, M4 Pro) |
|---|---|---|---|---|---|---|---|---|
| petal-w1, 8 bits (este repo) | 0,845 | 0,914 | 0,887 | 0,704 | 0,681 | 82 % | 0 | 376 ms |
| petal-w1, 4 bits | 0,834 | 0,900 | 0,870 | 0,704 | 0,650 | 81 % | 0 | 300 ms |
| S1-mini de Superwhisper, 8 bits | 0,775 | 0,819 | 0,830 | 0,638 | 0,380 | 94 % | 0 | 305 ms |

Conjunto de evaluación: 200 transcripciones reservadas (61 dictados reales de Petal y 139 sintéticas) más un conjunto separado de 60 transcripciones con puntos repetidos con distintas palabras. En el runtime Swift de Petal, el build de 8 bits limpia un dictado típico en unos 150 ms. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generalistas en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 0,8-0,9 GB para el build de 8 bits y 0,4-0,5 GB para el de 4 bits, coherente con los 752 millones de parámetros y un repositorio de 0,8 GB.
- GPU recomendadas: el modelo está empaquetado para MLX, por lo que el hardware objetivo son los chips de Apple (el autor reporta mediciones en un M4 Pro). No hay builds oficiales para CUDA.
- GPU de consumo: cabe sin problema en cualquier equipo con memoria unificada suficiente, incluidos los Mac con Apple silicon de gama base; en GPUs NVIDIA de consumo requeriría una conversión a otro runtime, que no se distribuye en este repositorio.
- Opciones de despliegue: `mlx-lm` (ejemplo oficial con `load` y `generate`), el runtime Swift de la app Petal y cualquier integración MLX en Apple silicon. No se publican builds GGUF, Ollama, vLLM ni TGI.
- Latencia: 376 ms de mediana con mlx-lm en M4 Pro para 8 bits, 300 ms para 4 bits y aproximadamente 150 ms dentro del runtime Swift de Petal. El throughput no está disponible.
- Parámetros de decodificación recomendados: decodificación greedy, `max_tokens=256` y `enable_thinking=False`; para transcripciones de más de unas 700 palabras hay que dividir en fronteras de frase y limpiar cada parte por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Similitud (todas) | Similitud (digresiones) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| petal-w1 | 752.393.024 | MLX 8 bits | no disponible | 0,845 | 0,704 | Apache 2.0 | HuggingFace, MLX |
| petal-w1-4bit | 752.393.024 | MLX 4 bits | no disponible | 0,834 | 0,704 | Apache 2.0 | HuggingFace, MLX |
| S1-mini (Superwhisper) | no disponible | 8 bits | no disponible | 0,775 | 0,638 | no disponible | producto comercial |
| Qwen3.5-0.8B (base) | ~0,8B | safetensors | no disponible | no evaluado para limpieza de dictado | no evaluado | Apache 2.0 | HuggingFace |

S1-mini de Superwhisper conserva más longitud en digresiones (94 % frente al 82 % de petal-w1) pero obtiene peor similitud global y mucho peor resultado en puntos repetidos (0,380 frente a 0,681). El modelo base Qwen3.5-0.8B no está especializado en esta tarea y no se reportan métricas de limpieza para él; petal-w1 es un ajuste fino completo sobre ese mismo checkpoint.

## Limitaciones y advertencias

- Idioma: solo inglés. No hay soporte multilingüe ni evaluación en otros idiomas.
- Corrección de errores de ASR: solo corrige un error de reconocimiento cuando la palabra pretendida es inequívoca por contexto; no conoce nombres propios, términos de proyecto ni jerga específica del usuario.
- Estilo: las salidas de referencia las generó otro modelo (NVIDIA Nemotron 3 Ultra), por lo que el estilo de limpieza sigue las decisiones de ese modelo y no las preferencias del usuario final.
- Riesgo de respuesta conversacional: aunque la evaluación reporta 0 respuestas en lugar de limpieza, el propio diseño del modelo exige un prompt de sistema estricto y `enable_thinking=False`; alterar ese prompt puede degradar el comportamiento.
- Longitud: para transcripciones de más de unas 700 palabras hay que trocear el texto, lo que puede romper la coherencia entre fragmentos.
- Contexto: la longitud de contexto del modelo no está documentada en la información disponible, lo que dificulta planificar el troceado en producción.
- Benchmarks no verificados: los resultados de la model card están marcados como no verificados y proceden del propio autor.
- Despliegue: al ser un build MLX, no existe una ruta oficial a GGUF, vLLM, TGI ni Ollama, lo que limita su uso fuera del ecosistema Apple.
- Uso comercial: la licencia Apache 2.0 lo permite, con las obligaciones habituales de atribución y conservación de avisos; conviene verificar las condiciones del modelo base Qwen3.5-0.8B en la versión que se despliegue.
- Adopción: el repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que no hay evidencia de uso en producción fuera del proyecto Petal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aayush9029/petal-w1
- Build de 4 bits: https://huggingface.co/Aayush9029/petal-w1-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de la app Petal: https://github.com/Aayush9029/petal
- Releases de Petal: https://github.com/Aayush9029/petal/releases
- Extensión de Raycast: https://www.raycast.com/Aayush9029/petal
- Colección Petal en HuggingFace: https://huggingface.co/collections/Aayush9029/petal
- Perfil del autor: https://huggingface.co/Aayush9029/models
