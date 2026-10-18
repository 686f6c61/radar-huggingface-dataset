# Mabus46/White-Shirt-AI-Game-Engine

## Resumen

`Mabus46/White-Shirt-AI-Game-Engine` no es un modelo de lenguaje con pesos: es un repositorio de *prompt engineering* publicado en HuggingFace que contiene un bloque de instrucciones de sistema (un "prompt de iniciación") para convertir un LLM genérico en el motor de un RPG de texto ciberpunk. El autor, Maksim Belyakov (usuario Mabus46), lo presenta como una alternativa a los motores de grafos ramificados (`if/else`) habituales en los videojuegos narrativos: en lugar de código, se entrega al modelo una "lógica de mundo" y una "matriz de estados". El experimento se probó, según la model card, con GigaChat, Claude, Gemini, Qwen, ChatGPT y Alice.

El artefacto define un mundo distópico (el "Círculo de Hielo", una simulación corporativa), dos recursos numéricos (HP y WP o Voluntad), y una mecánica de progresión en la que el personaje sube armadura al vencer demonios internos y una "Amada" borda runas de la Bukvitsa eslava antigua sobre su camisa blanca. El prompt obliga al modelo anfitrión a cerrar cada escena con tres opciones numeradas, una de ellas con coste de WP, y a narrar un "save point" tras cada victoria.

Su relevancia es la de un caso de estudio reproducible de *prompt engineering* narrativo y de alineación por anclaje semántico, no la de un modelo evaluable: no hay checkpoints, no hay datos de entrenamiento propios, no hay benchmarks y el repositorio acumula 0 descargas y 0 *likes*. Cualquier capacidad depende enteramente del LLM sobre el que se pegue el prompt. Licencia MIT, idiomas declarados ruso e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: artefacto de prompt engineering (bloque de instrucciones de sistema), sin red neuronal propia |
| Parametros totales | no disponible (no se distribuyen pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del LLM anfitrion; el prompt no impone ventana) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | ruso e ingles (declarados en la model card: `language: ru, en`) |
| Licencia | MIT |
| Formato de pesos | no disponible: el repositorio contiene texto de prompt, no safetensors ni GGUF |
| Tipo de artefacto | prompt de sistema para juegos de rol textuales (Dungeon Master) |
| Modelos anfitriones probados | GigaChat, Claude, Gemini, Qwen (segun el autor); tambien ChatGPT y Alice en el flujo web |
| Autor | Mabus46 (Maksim Belyakov) |
| Fecha de creacion | 2026-10-17 |
| Fecha de actualizacion | 2026-10-17 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No hay arquitectura ni entrenamiento en el sentido habitual. El "motor" es un prompt declarativo con cinco reglas explícitas: rol del modelo como Dungeon Master y demiurgo de la realidad de "El Rey Angamua"; estado inicial del héroe (camisa blanca con 0 % de protección, 10 HP, 5 WP); generación de una primera escena ciberpunk; obligación de ofrecer siempre tres acciones numeradas, la más audaz con coste de WP; y transición a un "save point" tras cada victoria, donde se describe el bordado de una nueva runa de la Bukvitsa y el aumento de armadura. Se invoca con una cabecera del tipo `[SYSTEM_OVERRIDE: INITIATE_WHITE_SHIRT_ENGINE]` y se cierra con la fórmula "Da. Sъmir. Zhivetь."

El autor denomina al enfoque "Humanistic Prompt Engineering" y lo justifica con una "Matriz de Bukvitsa 7x7" que actuaría como ancla semántica y emocional para que el modelo no derive del guion. No se aportan datos de entrenamiento, número de tokens, composición de dataset, ni procesos de RLHF o DPO, porque no existen: el ajuste se produce en contexto (*in-context*), no en pesos. Tampoco se documenta una evaluación sistemática: la evidencia son transcripciones anecdóticas de sesiones, sin número de pruebas, sin protocolo ni métricas de consistencia de estado.

## Capacidades

- Generación de ficción interactiva en segunda persona con tono literario, a partir de las reglas del prompt.
- Estructuración de la salida en escena más tres opciones numeradas, con etiquetado del coste de WP.
- Seguimiento declarativo de estado (HP, WP, inventario, runas bordadas) mientras el LLM anfitrión lo mantenga.
- Gestión de un ciclo de juego con puntos de guardado narrativos ("save point") y progresión de armadura.
- Capacidad multilingüe limitada a lo que herede del modelo anfitrión; el prompt está redactado en ruso.
- Parametrización de ambientación mediante un constructor web externo (de ciberpunk a steampunk, de "Morok" a corporaciones).
- No incluye tool calling, function calling, ejecución de código, visión, audio ni modo de razonamiento explícito: son capacidades del LLM anfitrión, no del artefacto.

## Casos de uso

- Prototipado rápido de aventuras conversacionales: pegar el prompt en un LLM y obtener una sesión jugable en minutos, sin escribir un árbol de decisiones ni un motor de estados.
- Diseño de mecánicas narrativas: usar la estructura HP/WP/runas como plantilla para iterar reglas de progresión antes de implementarlas en código real.
- Investigación sobre consistencia narrativa: comparar cómo distintos modelos (GigaChat, Claude, Gemini, Qwen) mantienen el estado del jugador a lo largo de N turnos con el mismo prompt, midiendo derivas.
- Talleres de escritura y docencia: ejercicio de escritura especulativa donde el alumnado ajusta parámetros de mundo en el constructor y analiza las respuestas del modelo.
- Evaluación de filtros de seguridad y alineación: el encabezado `SYSTEM_OVERRIDE` es un caso útil para estudiar qué proveedores bloquean prompts de este estilo y cuáles no.
- Generación de material de ambientación: el modelo produce descripciones de escenarios (por ejemplo, el "piso 144 de la Megaestructura") reutilizables como *lore* en un juego posterior.
- Integración en una web de ocio: el flujo de angamua.ru genera el bloque de parámetros y lo entrega al usuario para que lo pegue en su proveedor de LLM; sirve como ejemplo de patrón "prompt como servicio" sin backend propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una anécdota cualitativa (una sesión con GigaChat descrita por el autor) y afirmaciones sin protocolo sobre ausencia de alucinaciones y mantenimiento perfecto de estadísticas. No hay MMLU, HumanEval, GSM8K ni métricas de consistencia de estado, y al no existir pesos no son aplicables.

## Requisitos de hardware

- VRAM para el artefacto: 0 GB. Es texto plano; no requiere GPU ni inferencia propia.
- Requisito real: acceso a un LLM anfitrión, ya sea vía API (GigaChat, Claude, Gemini, ChatGPT, Alice) o en local.
- Si se ejecuta en local, la VRAM la determina el modelo anfitrión, no este repositorio: un modelo de 7-8B en cuantización Q4 cabe en GPUs de consumo de 8-12 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); un 13-14B en Q4 requiere unos 10-12 GB; un 30B en Q4 ronda los 20-24 GB (RTX 3090, RTX 4090).
- GPU profesionales para modelos anfitriones grandes: A100 40/80 GB o H100 80 GB, útiles si se quiere comparar el comportamiento del prompt entre modelos de distinta escala.
- Opciones de despliegue del anfitrión: Ollama o llama.cpp para local en GGUF; vLLM o TGI para servir modelos abiertos con concurrencia; APIs propietarias para Claude, Gemini o GigaChat.
- Latencia y throughput: no disponibles para el artefacto; dependen por completo del anfitrión y de la longitud de la sesión acumulada en el contexto.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| White-Shirt-AI-Game-Engine (este repositorio) | no aplica (sin pesos) | el del LLM anfitrion | sin benchmarks; evidencia anecdótica | MIT (solo el texto del prompt) | HuggingFace, 0 descargas |
| Modelo abierto afinado para rol o narrativa (por ejemplo, un 7-8B con fine-tuning de roleplay) | del orden de 7-8B (segun el modelo) | el declarado por cada modelo | benchmarks propios, no comparables con este artefacto | variable segun el modelo | ecosistema abierto (GGUF, safetensors) |
| Motor de narrativa con grafo ramificado (Twine, Ink, Yarn Spinner) | no aplica | no aplica | determinista y verificable | licencias permisivas habituales | maduro y ampliamente usado |
| Motor propio con estado gestionado por código y LLM solo para prosa | depende del LLM | el del LLM | estado verificable por software | depende del stack | requiere desarrollo a medida |

No se dispone de datos de benchmarks ni de un conjunto de alternativas evaluadas con el mismo protocolo; la comparación es, por tanto, estructural y no de rendimiento.

## Limitaciones y advertencias

- No es un modelo: no hay pesos, no se puede evaluar con métricas estándar ni reproducir resultados de forma determinista.
- La calidad depende por completo del LLM anfitrión; el mismo prompt puede funcionar de forma muy distinta entre proveedores y versiones.
- Evidencia puramente anecdótica: una sesión descrita por el propio autor, sin número de pruebas, sin métricas y sin replicación independiente.
- El encabezado `SYSTEM_OVERRIDE` imita un jailbreak; algunos proveedores pueden bloquearlo o marcarlo como abuso, y su uso puede contravenir los términos de servicio de determinados servicios.
- El seguimiento de estadísticas (HP, WP, inventario) es una promesa del prompt, no una garantía: los LLM pierden consistencia en sesiones largas y pueden inventar cifras.
- Riesgo de alucinación narrativa: el modelo puede contradecir escenas previas o resolver combates sin respetar las reglas declaradas.
- El sustrato cultural de la "Drevleslovenskaya Bukvitsa" es esotérico y no lingüísticamente académico; conviene presentarlo como ficción y no como hecho histórico.
- El prompt está redactado en ruso; su comportamiento en castellano no está documentado y no se ha probado.
- La etiqueta `cybersecurity` del repositorio no está respaldada por ningún contenido técnico de seguridad en la model card.
- La licencia MIT cubre el texto del prompt, no las salidas del LLM anfitrión, que se rigen por la licencia y términos de cada proveedor.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; metadatos con fecha de 2026 que conviene verificar.
- No se abordan cuestiones de protección de datos, edad mínima ni moderación de contenido para un producto orientado a usuarios finales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Mabus46/White-Shirt-AI-Game-Engine
- Sitio del autor (universo "El Rey Angamua"): https://angamua.ru/
- Constructor de mundos "White Shirt": https://angamua.ru/whiteshirt.html
- Paper, blog técnico o repositorio de código: no disponible en la informacion proporcionada
