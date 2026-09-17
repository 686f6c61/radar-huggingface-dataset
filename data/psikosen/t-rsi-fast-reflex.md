# psikosen/t-rsi-fast-reflex

## Resumen

T-RSI Fast Reflex (Candidate A-v4) es un motor de decisión para automatización de navegador desarrollado por el usuario psikosen y publicado en Hugging Face bajo licencia MIT. No es un modelo de lenguaje generativo al uso: es un clasificador de acciones ultraligero, con arquitectura ternaria de tipo BitNet (pesos en {-1, 0, +1}, aritmética sin multiplicaciones), que selecciona la mejor acción de navegador entre una lista de candidatos extraídos del DOM. Cuenta con 1.082.947 parámetros totales y un tokenizador a nivel de palabra con un vocabulario de 8.192 entradas orientado a acciones de navegador, etiquetas DOM e intenciones.

El problema que aborda es la latencia y el coste de los agentes web basados en LLM: en lugar de invocar un modelo en la nube, el motor resuelve cada decisión en 778,0 µs con un consumo de 12,98 KB de RAM en sesión activa (136,8 KB con el corpus completo de 5.000 herramientas). Se apoya en cuatro mecanismos propios: alineación verbo-objeto de acciones, una puerta de incertidumbre espacial sobre el DOM (SURE-DOM), normalización de longitud BM25+ sublineal y un grafo de memoria causal con tripletas Acción-Condición-Resultado.

Es relevante en el nicho de los agentes autónomos de navegador de coste casi nulo, ejecutables en CPU, microcontroladores o WebAssembly. Sin embargo, es una publicación de investigación experimental: el propio autor advierte de que los resultados de benchmark son preliminares, provienen de un único banco de pruebas (Team B, RTX 5090 de 32 GB y 128 GB de RAM) y no han sido verificados por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor de decisión ternario (estilo BitNet, 1,58 bits) con recuperación léxica BM25+ y sin operaciones de multiplicación; no es un transformer generativo |
| Parámetros totales | 1.082.947 |
| Parámetros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible (tokenizador a nivel de palabra con vocabulario de 8.192 entradas; no se declara ventana de contexto) |
| Tipos de cuantización | Pesos ternarios {-1, 0, +1} de 1,58 bits; representación empaquetada de 2 bits (cuatro pesos ternarios por byte) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y binario empaquetado (`weights_packed_1.58bit.bin`, 264 KB) |
| Tokenizador | `vocab.json` y `tokenizer.json`, vocabulario de 8.192 entradas (acciones de navegador, etiquetas DOM, intenciones) |
| Fecha de publicación | 17 de septiembre de 2026 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no sigue el patrón de un transformer autoregresivo. Se describe como un motor ternario de decisión con pesos cuantizados a 1,58 bits y aritmética de suma y resta de enteros, sin multiplicaciones, lo que permite ejecutarlo con un coste computacional mínimo en CPU y en entornos embebidos. El núcleo combina recuperación léxica BM25+ con normalización de longitud sublineal, que penaliza descripciones verbosas sin perjudicar a los elementos objetivo concisos, y una capa de razonamiento ternario que puntúa cada candidato frente a la intención declarada.

Sobre esa base se añaden tres componentes específicos de dominio. La alineación verbo-objeto vincula verbos direccionales (`open`, `close`, `record`, `retrieve`, `search`, `book`) con sus objetos directos mediante un invariante ternario amplificado. La puerta SURE-DOM bloquea clics sobre elementos oscurecidos por superposiciones modales, nodos de DOM virtual de React sin hidratar o campos deshabilitados. El grafo de memoria causal RSIAgent almacena tripletas Acción-Condición-Resultado y, según el autor, garantiza una recuperación del 100 % de los errores ante retroalimentación de fallo. No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens, su composición ni si hubo fases de RLHF o DPO.

## Capacidades

- Selección de acciones de navegador en formato verbo-objeto a partir de una lista de candidatos y una intención en lenguaje natural.
- Automatización de navegación web autónoma con Chromium, tanto en modo visible con HUD de telemetría como en modo headless.
- Rechazo de patrones oscuros (dark patterns) y trampas de interfaz: el autor reporta 30/30 en una prueba de 30 partes con rechazo del 100 %.
- Recuperación de errores mediante el grafo de memoria causal (tripletas Acción-Condición-Resultado), con reintento guiado por retroalimentación.
- Filtrado de elementos no interactuables (superposiciones modales, campos deshabilitados, DOM virtual sin hidratar) mediante el módulo SURE-DOM.
- Ejecución de misiones de varios pasos, con ejemplos de misiones encadenadas sobre Wikipedia en el script de prueba.
- Recuperación léxica sobre un corpus de hasta 5.000 herramientas o acciones.
- Inferencia en CPU, en microcontroladores o en WebAssembly gracias a los pesos empaquetados de 2 bits.
- No dispone de generación de texto libre, visión, audio, tool calling en formato estándar (JSON Schema) ni razonamiento matemático general.

## Casos de uso

- Automatización de compras con rechazo de patrones oscuros: el motor puede recibir una intención como «confirmar la compra sin suscribirse a la cuota mensual» y elegir el botón de pago estándar frente a alternativas con suscripción, usando la alineación verbo-objeto y el filtrado SURE-DOM para no pulsar elementos engañosos.
- Pruebas end-to-end de interfaces en CI/CD: integrado mediante `python3 live_interactive_test.py --headless --steps N`, permite validar flujos de usuario sin depender de un LLM externo ni de red, con decisiones de 778,0 µs por paso.
- Relleno y validación de formularios web a gran escala: al operar con 12,98 KB de RAM por sesión, se pueden ejecutar cientos de sesiones concurrentes de Chromium en un único servidor sin coste de GPU.
- Agentes de reserva y extracción de datos (por ejemplo, reservas de restaurantes o consulta de disponibilidad): el vocabulario incluye verbos como `book`, `search` o `retrieve`, lo que encaja con flujos de reserva y consulta multi-paso.
- Ejecución en el borde o embebida: los pesos empaquetados de 264 KB y el motor sin multiplicaciones permiten desplegarlo en WebAssembly dentro de una extensión de navegador, en un dispositivo IoT o en un microcontrolador, sin conexión a servicios externos.
- Auditoría de cumplimiento en comercio electrónico: al registrar tripletas Acción-Condición-Resultado, el agente deja una traza auditable de cada decisión, útil para verificar que un flujo de compra no induce a suscripciones no deseadas.
- Asistentes de operaciones repetitivas (RPA web): tareas de extracción de información de portales internos o paneles administrativos donde el catálogo de acciones posibles es acotado y conocido de antemano.
- Teleoperación de agentes con memoria de errores: en escenarios donde una acción falla, el grafo causal permite reintentar con una acción alternativa en lugar de repetir el fallo, según lo declarado por el autor.

## Benchmarks y rendimiento

Resultados publicados en la model card. El propio autor advierte de que son preliminares y no han sido verificados por una fuente secundaria. No se dispone de comparaciones con otros modelos en la información proporcionada.

| Suite de evaluación | Resultado |
|---|---|
| WebArena (CMU) | 100,0 % |
| Salesforce XLAM-60k (no visto) | 91,0 % |
| ToolBench G1 (Tsinghua / UC Berkeley) | 89,6 % |
| Hermes Multi-Action (NousResearch) | 75,0 % |
| Media macro (4 suites) | 88,9 % |
| Benchmark supercomplejo de 30 partes (zero-shot) | 100,0 % (30/30) |
| Rechazo de patrones oscuros y trampas | 100,0 % |
| Latencia de decisión | 778,0 µs |
| Huella de RAM | 136,8 KB (corpus de 5.000 herramientas) / 12,98 KB (sesión de navegador activa) |

## Requisitos de hardware

- VRAM: no requiere GPU. El motor se ejecuta en CPU con aritmética entera de suma y resta.
- Memoria: 12,98 KB en una sesión de navegador en vivo y 136,8 KB con el corpus completo de 5.000 herramientas; el binario de pesos empaquetado ocupa 264 KB.
- GPU de referencia usada para la evaluación: NVIDIA RTX 5090 con 32 GB de VRAM y 128 GB de RAM de sistema (banco de pruebas Team B); se trata de una elección de laboratorio, no de un requisito.
- Cabe en cualquier GPU de consumo y también en equipos sin GPU: CPU de portátil, Raspberry Pi, microcontroladores y entornos WebAssembly.
- Opciones de despliegue: ejecución directa con `engine.py` (dependencias `safetensors`, `huggingface_hub` y `aiohttp`), controlador de Chromium mediante `chromium_driver.py` y runner interactivo con `live_interactive_test.py`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de transformer.
- Latencia: 778,0 µs por decisión según el autor. No se publican datos de throughput agregado.

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos comparables de la misma categoría (motores ternarios de decisión para navegador). A modo de referencia, se compara con las alternativas habituales para agentes de navegación basados en LLM.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| T-RSI Fast Reflex (Candidate A-v4) | Motor ternario de decisión para navegador | 1.082.947 | No disponible | MIT | Pesos abiertos en Hugging Face; 0 descargas |
| Agentes de navegador con LLM propietario (GPT-4o, Claude, Gemini) | LLM generativo multimodal | No disponible | No disponible | Propietaria, acceso por API | Solo API |
| Llama 3.1 8B | LLM generativo denso | 8.000 millones | 128.000 tokens | Licencia comunitaria de Llama 3.1 | Pesos abiertos |
| Qwen2.5 7B | LLM generativo denso | 7.000 millones | 128.000 tokens | Apache 2.0 | Pesos abiertos |

No se dispone de resultados de benchmark comparables entre estas alternativas y T-RSI Fast Reflex dentro de la información proporcionada, ya que el autor evalúa solo contra suites de agentes web y no publica comparaciones directas. La diferencia fundamental es de escala y función: T-RSI no genera lenguaje, selecciona acciones, y lo hace con tres órdenes de magnitud menos de parámetros.

## Limitaciones y advertencias

- Publicación experimental: el autor indica explícitamente que no se deben confiar en los resultados de benchmark hasta que una fuente secundaria los verifique de forma independiente.
- Resultados obtenidos por un único equipo (Team B) en un único banco de pruebas (RTX 5090, 128 GB de RAM); no hay verificación adversarial en entornos web ampliados.
- El repositorio acumula 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.
- No es un modelo generativo: no produce texto libre, no mantiene conversaciones y depende de que el sistema anfitrión extraiga y le entregue la lista de candidatos del DOM.
- No se declaran los idiomas soportados ni la composición del corpus de entrenamiento; el vocabulario está orientado a acciones web y el rendimiento fuera del dominio de navegación en inglés es desconocido.
- Riesgo de sesgo derivado de los sitios y acciones representados en el vocabulario; el rendimiento en la suite Hermes Multi-Action (75,0 %) es notablemente inferior al de las demás, lo que sugiere fragilidad en acciones múltiples o fuera de distribución.
- SURE-DOM cubre superposiciones modales, DOM virtual sin hidratar y campos deshabilitados, pero no se documenta cobertura para canvas, shadow DOM cerrado, iframes complejos o interacciones no textuales.
- La recuperación de errores al 100 % declarada depende del grafo causal y de que exista retroalimentación de fallo; sin dicha señal, el comportamiento no está documentado.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero se entrega sin garantías de ningún tipo.
- Anomalía de metadatos: las fechas de creación y actualización del repositorio (17 de septiembre de 2026) son posteriores a la fecha actual, por lo que conviene revisar la integridad y procedencia de la publicación antes de usarla.
- Riesgo de alucinación: no aplica en el sentido habitual al no generar texto, pero sí existe riesgo de selección errónea de acciones cuando la intención es ambigua o los candidatos están mal etiquetados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/psikosen/t-rsi-fast-reflex
- Archivos incluidos en el repositorio de Hugging Face: `model.safetensors`, `weights_packed_1.58bit.bin`, `config.json`, `vocab.json`, `tokenizer.json`, `engine.py`, `live_interactive_test.py`, `chromium_driver.py`, `requirements.txt`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada; los resultados devueltos corresponden a contenidos sin relación con el modelo.
