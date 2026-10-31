# marcelz/elephant-1-FP8-W8A8

## Resumen

Elephant-1 FP8 (W8A8) es una cuantización comunitaria, no oficial, del modelo base baselabs/elephant-1, publicada por el usuario marcelz en HuggingFace. Su objetivo es permitir que este modelo de decisión y clasificación (decision model) funcione en tarjetas gráficas de consumo con 12 GB de VRAM, algo que la versión original en BF16 no permite: los pesos FP8 ocupan 6,5 GiB en GPU frente a los 12,9 GiB de la versión original. El checkpoint está pensado para usarse con el motor de decisiones OneJev (librería `qev`), que resuelve tareas de enrutamiento, clasificación y calibración sobre texto.

La relevancia de esta versión radica en la creciente necesidad de ejecutar modelos de clasificación y enrutamiento de gran calidad en hardware local, sin depender de APIs externas. Según el autor, la cuantización mantiene el 99,2 % de las respuestas idénticas a la versión BF16 en su conjunto de pruebas, con una latencia mediana de 86 ms por petición en una RTX 5070 Ti. La arquitectura subyacente es un modelo basado en Qwen 3.5 (etiqueta `qwen3_5_text`) con 8.955.228.672 parámetros totales según los metadatos de safetensors.

Es importante señalar que se trata de una cuantización independiente de la comunidad, sin afiliación ni respaldo de Base Labs o Baseten, y que el autor advierte de que no lo ha probado en una tarjeta real de 12 GB, sino en una de 16 GB con límite de memoria simulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en qwen3_5_text (transformer con componentes recurrentes: conv1d y puertas de recurrencia in_proj_a/b) |
| Parametros totales | 8.955.228.672 (según safetensors) |
| Parametros activos | no disponible (no hay indicios de MoE) |
| Longitud de contexto | no disponible (el prompt más largo probado por el autor: 9.551 tokens) |
| Tipos de cuantizacion | FP8 E4M3 con escalas por fila en proyecciones del decoder (W8A8), activaciones cuantizadas a FP8 por fila en tiempo de ejecución; embedding, normas, lm_head, conv1d e in_proj_a/b permanecen en BF16 |
| Idiomas soportados | inglés (según las etiquetas del repo) |
| Licencia | MIT |
| Formato de pesos | safetensors (200 tensores FP8, compatibles con torchao 0.16 y 0.18) |

## Arquitectura y entrenamiento

El modelo base, baselabs/elephant-1, es un modelo de decisión basado en la arquitectura de Qwen 3.5 (etiqueta `qwen3_5_text` en HuggingFace). La presencia de capas `conv1d` y puertas de recurrencia `in_proj_a/b` sugiere una arquitectura híbrida que combina atención con componentes convolucionales o de recurrencia, similar a otros modelos híbridos transformer-SSM. El checkpoint original incluye una torre de visión, aunque esta cuantización es solo de texto y la elimina.

En cuanto a la cuantización, las proyecciones del decoder se almacenan en FP8 E4M3 con escalas por fila, y las activaciones se cuantizan a FP8 por fila en tiempo de ejecución mediante `torch._scaled_mm`. Los componentes sensibles a la precisión (embedding, normas, `lm_head`, `conv1d` y las puertas de recurrencia) permanecen en BF16. No hay información disponible sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO).

Una innovación técnica destacable de este repo es la reducción de la cabeza de salida (`lm_head`): el motor multiplica por las 248.320 filas completas de la cabeza (3,8 GiB en 32 bits), aunque las respuestas solo usan las filas correspondientes a las letras de respuesta (A, B, C, etc., como máximo 256 filas). El script `engine_slots.py` conserva solo esas 256 filas (4 MiB) y mantiene la tabla de embedding (1,9 GiB) en RAM, lo que reduce el pico de memoria en GPU de 14,0 GiB a 6,5 GiB durante la carga, sin cambios apreciables en las respuestas (diferencia máxima de probabilidad: 1e-6).

## Capacidades

- Clasificación de texto: el pipeline principal es `text-classification`, con salidas de probabilidades calibradas por clase (por ejemplo, billing 99,8 %, shipping 0,1 %, technical 0,1 %).
- Enrutamiento de solicitudes (routing): asigna cada texto de entrada a un equipo, categoría o destino definido por el usuario mediante criterios tipados.
- Modelo de decisión (decision model): funciona con el motor OneJev `qev`, que acepta un `state` textual y un conjunto de `questions` tipadas (tipo `choice` con instrucciones y criterios), y devuelve respuestas con probabilidades.
- Calibración de probabilidades: devuelve distribuciones de probabilidad sobre las opciones de respuesta, no solo la clase ganadora.
- Soporte de múltiples preguntas por petición: el motor puede ejecutar las preguntas de forma secuencial (`fork_mode="sequential"`) o agruparlas por lotes (`fork_mode="auto"`).
- No incluye capacidades de visión en este checkpoint (la torre de visión del original no está incluida).
- No está diseñado para generación de texto libre, razonamiento general, código ni tool calling; es un modelo de decisión especializado.

## Casos de uso

- Enrutamiento de tickets de soporte: clasifica automáticamente una queja de cliente (por ejemplo, un doble cobro) en el equipo adecuado (billing, shipping, technical) con probabilidades calibradas, ideal como primera capa de un sistema de atención al cliente.
- Clasificación de mensajes entrantes en tiempo real: con una latencia mediana de 86 ms por petición en una RTX 5070 Ti, es adecuado para clasificar mensajes en línea dentro de un chatbot o un pipeline de mensajería.
- Moderación y triaje de contenido: puede usarse para decidir si un texto requiere revisión humana, asignándolo a categorías definidas por criterios personalizados.
- Orquestación de sistemas multiagente: como router de bajo coste y baja latencia, decide qué agente especializado debe procesar cada consulta antes de invocar modelos más costosos.
- Clasificación en local por privacidad: al ejecutarse íntegramente en una GPU de 12 GB, permite procesar datos sensibles (salud, finanzas, legal) sin enviarlos a servicios externos.
- Integración en pipelines de datos: mediante el script de ejemplo y la API de `qev` (`SystemOneRequest`), puede integrarse en flujos de trabajo por lotes para etiquetar grandes volúmenes de texto.
- Calibración de confianza para escalado: las probabilidades de salida permiten definir umbrales para derivar a un humano los casos de baja confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones propias comparando esta cuantización con el original en BF16 sobre 420 peticiones sintéticas de tipo router (629 preguntas, generadas por un modelo de IA, con posibles errores en las etiquetas gold):

| Métrica | Valor |
|---|---|
| Coincidencia de respuesta principal con BF16 | 99,2 % de las preguntas de prueba |
| Latencia mediana por petición (RTX 5070 Ti) | 86 ms |
| Latencia máxima por petición (RTX 5070 Ti) | 87 ms (en el ejemplo de 20 peticiones) |
| Pico de GPU durante la carga | 6,5 GiB |
| Pico de GPU en petición típica | 6,6 GiB |
| Pico de GPU con prompt de 9.551 tokens | 8,8 GiB |
| RAM máxima del proceso | 9,0 GiB |
| Tiempo de carga del modelo | 3 s |

Con `fork_mode="auto"` (agrupación de preguntas), el percentil 90 de latencia baja de 230 ms a 111 ms, aunque las respuestas pueden variar ligeramente (diferencia de probabilidad de hasta 0,065 y 4 de 629 respuestas principales cambiadas); este modo no formó parte de la validación del autor.

## Requisitos de hardware

- VRAM estimada: 6,5 GiB en carga, 6,6 GiB en petición típica y 8,8 GiB con prompts largos (~9.500 tokens). Cabe en tarjetas de 12 GB.
- GPU recomendadas: NVIDIA con soporte FP8 (compute capability 8.9 o superior), es decir, series RTX 40 y RTX 50 (por ejemplo, RTX 4070, RTX 5070 Ti, donde se midió). El autor usó una RTX 5070 Ti de 16 GB con límite de memoria simulado a 11 GiB para imitar una tarjeta de 12 GB, sin errores de memoria en las 420 peticiones de prueba.
- No funciona en tarjetas RTX 30 o anteriores por falta de soporte FP8 en hardware.
- Para tarjetas de 16 GB existe la alternativa marcelz/elephant-1-BF16-small-head (pesos BF16 originales, más rápida en prompts cortos); este repo FP8 es preferible para prompts de más de ~4.000 tokens o con menos de 16 GB.
- Requisitos adicionales: Linux, driver NVIDIA 580 o superior, Python 3.12, unos 20 GB de disco libre, unos 10 GB de RAM libre y conexión a internet.
- Despliegue: mediante los scripts `install.sh` y `run.sh` del repo, que instalan el entorno y el motor de decisión OneJev (`qev`). No hay indicios de compatibilidad con vLLM, llama.cpp, Ollama o TGI; el checkpoint está diseñado para el motor propio con torchao 0.16/0.18.
- Latencia y throughput: mediana de 86 ms por petición en RTX 5070 Ti en modo secuencial; con agrupación de preguntas, percentil 90 de 111 ms.

## Comparativa con modelos similares

| | elephant-1 FP8 W8A8 (este repo) | elephant-1 BF16 small head | elephant-1 (original) |
|---|---|---|---|
| Autor | marcelz (comunidad) | marcelz (comunidad) | baselabs |
| Precisión | FP8 E4M3 (W8A8) | BF16 | BF16 |
| Tamaño en disco | 10,3 GiB | no disponible | 18,8 GB |
| Pico de GPU en carga | 6,5 GiB | no disponible | 12,9 GiB (pesos) / 14,0 GiB (con cabeza completa) |
| VRAM mínima práctica | 12 GB | 16 GB | 16 GB o más |
| Coincidencia con el original | 99,2 % (respuestas principales) | idéntico (referencia) | referencia |
| Visión | no (solo texto) | no disponible | sí (torre de visión incluida) |
| Licencia | MIT | MIT | MIT |

Otros modelos comparables de decisión o clasificación de tamaño similar no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Cuantización comunitaria no oficial: no está afiliada ni respaldada por Base Labs o Baseten; cualquier problema debe reportarse al autor del repo, no al del modelo base.
- No probado en una tarjeta real de 12 GB: las mediciones provienen de una RTX 5070 Ti de 16 GB con límite de memoria simulado; con un límite de 9 GiB las peticiones más largas fallan.
- Solo texto: la torre de visión del original no está incluida y el procesamiento de imágenes no está probado.
- Etiquetas gold posiblemente erróneas: el conjunto de validación del autor fue generado por un modelo de IA y domina en prompts cortos, por lo que la cifra del 99,2 % de coincidencia puede no reflejar el rendimiento en casos reales o con prompts largos.
- Modo `fork_mode="auto"` no validado: puede alterar ligeramente las respuestas (diferencias de probabilidad de hasta 0,065) y cambiar 4 de 629 respuestas principales.
- Idioma: las etiquetas indican solo inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Sesgos y riesgo de alucinación: no aplicables en el sentido habitual de modelos generativos, pero las probabilidades de clasificación pueden estar mal calibradas fuera de la distribución de entrenamiento; conviene validar con datos propios.
- Contexto: la longitud de contexto oficial no está disponible; el prompt más largo probado fue de 9.551 tokens, con un pico de 8,8 GiB.
- Licencia MIT: sin restricciones para uso comercial, aunque hay que revisar la licencia del modelo base (también MIT según el repo).
- Requisitos estrictos de entorno: Linux, Python 3.12, driver NVIDIA 580+, y hardware con FP8; no es desplegable en CPU ni en GPUs antiguas.

## Enlaces

- Repo de la cuantización FP8: https://huggingface.co/marcelz/elephant-1-FP8-W8A8
- Modelo base original: https://huggingface.co/baselabs/elephant-1
- Variante BF16 con cabeza reducida (misma serie): https://huggingface.co/marcelz/elephant-1-BF16-small-head
- No hay enlaces a papers, blogs oficiales ni demos en la información disponible.
