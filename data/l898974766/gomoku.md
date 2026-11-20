# l898974766/gomoku

## Resumen

Gomoku es un modelo de lenguaje especializado en jugar al cinco en línea (gomoku) sobre tablero de 15×15, desarrollado por el usuario independiente l898974766 y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo de propósito general: se trata de un decodificador compacto que recibe la codificación completa del tablero como contexto y genera la coordenada de la siguiente jugada. Su interés radica en que demuestra que una arquitectura MoE funcional de apenas 1.988.096 parámetros puede superar en precisión táctica a versiones anteriores de más de 10 millones de parámetros.

La arquitectura es un `MixtralForCausalLM` estándar de seis capas, dimensión oculta 64, cuatro cabezas de atención y FFN de expertos de dimensión 96, con ocho expertos por capa activados todos en cada paso (no hay enrutamiento disperso real). El vocabulario es específico del dominio (15.643 tokens) y la longitud de contexto es de 2.048 tokens, suficiente para codificar el tablero completo más el historial de la partida.

Es relevante ahora porque ejemplifica una tendencia de modelos funcionales ultracompactos que sustituyen capacidad bruta por supervisión estructurada por objetivos (siete grupos de supervisión funcional más una vía de decisión integrada), con un coste de inferencia en CPU de unos 186 ms por jugada en dos hilos. El modelo se distribuye en safetensors F32 y GGUF nativo para Ollama, sin depender de código remoto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Mixtral (MoE funcional, 8 expertos por capa, todos activos) |
| Parametros totales | 1.988.096 |
| Parametros activos | 1.988.096 (todos los expertos se computan en cada paso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | F32 (sin cuantización en la publicación actual); se distribuye GGUF nativo F32 |
| Idiomas soportados | zh, en (etiquetas de la model card); el uso real es generación de coordenadas de tablero |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), GGUF (`gomoku-f32.gguf`) |
| Capas | 6 |
| Dimension oculta | 64 |
| Cabezas de atencion | 4 |
| Dimension FFN de experto | 96 |
| Vocabulario | 15.643 tokens |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de seis capas con atención multi-cabeza de cuatro cabezas y dimensión oculta 64. La capa FFN se organiza como mezcla de expertos con ocho expertos de dimensión 96 por capa, pero a diferencia de un MoE disperso convencional, los ocho expertos participan en el cálculo de cada token. El autor denomina a esta configuración "MoE funcional": los nombres de los expertos reflejan objetivos de supervisión (relaciones de patrón, posición, prioridad, riesgo, evidencia direccional de patrón, defensa y proactividad), más una octava vía para la decisión integrada. El propio autor advierte que estos nombres no prueban una especialización estrictamente independiente.

El entrenamiento combina supervisión funcional con optimización por recompensa de posición: 256 actualizaciones de recompensa sobre situaciones de tablero más repetición supervisada, conservando el checkpoint de la actualización 256 según validación. Se muestrean 16 acciones del vocabulario completo en línea; las jugadas ilegales reciben recompensa −8, y se otorgan recompensas positivas a victorias inmediatas, bloqueos únicos de cuatro y amenazas fuertes verificables. Además se emplean recompensa esperada exacta, política final del profesor y repetición supervisada. El autor especifica que es un entrenamiento mixto de recompensa de posición y supervisión, no un PPO completo sobre partidas. El conjunto de datos incluye 2.048 posiciones de repetición extraídas de partidas previas, con énfasis en jugadas ilegales y las inmediatamente anteriores, más 128 posiciones de validación difíciles. Los profesores y reglas solo se usan en entrenamiento, anotación y arbitraje, y no se distribuyen en el paquete de inferencia. No hay profesor en tiempo de ejecución, búsqueda, máscara de acciones legales ni corrección de errores.

## Capacidades

- Generación de coordenadas de jugada a partir de la codificación completa del tablero de 15×15, con protocolo de texto propio (`pointer_protocol.py`).
- Decodificación de partidas de gomoku sin regla de prohibición (自由五子棋), victoria con cinco o más en línea.
- Razonamiento táctico inmediato: detección de victoria en un movimiento y bloqueo de cuádruples.
- Lógica a tres movimientos y generación de certificados de victoria a cinco jugadas (consistencia con jugadas de matanza forzada).
- Salida legal consistente: el autor reporta 768/768 salidas legales en el conjunto de prueba.
- Soporte de integración con Ollama mediante GGUF nativo y con Transformers estándar (`AutoTokenizer`, `AutoModelForCausalLM`, sin `trust_remote_code`).
- Interfaz de chat compatible con la API de Ollama (`/api/chat`) y con text-generation-inference (tag `text-generation-inference`).
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Motor de juego embebido en aplicaciones de escritorio o terminal: el paquete incluye `play_terminal.py` con interfaz de teclado y ratón; el modelo responde en unos 186 ms por jugada en CPU de dos hilos, lo que permite partidas fluidas sin GPU.
- Enseñanza y demostración de arquitecturas MoE compactas: con 1,99 millones de parámetros y pesos F32 verificados bit a bit, sirve como caso de estudio reproducible de supervisión funcional por objetivos frente a modelos densos mayores.
- Servicio local de sugerencia de jugadas vía API: el endpoint `/api/chat` de Ollama acepta el tablero codificado y devuelve la coordenada, lo que permite integrarlo en un backend ligero o en un bot de chat.
- Evaluación comparativa de tácticas de gomoku: el autor publica conjuntos de 512 pruebas tácticas inmediatas, 128 de lógica a tres movimientos y 128 de certificados a cinco jugadas, reutilizables como banco de pruebas para otros motores.
- Análisis retrospectivo de partidas: la repetición supervisada sobre 2.048 posiciones históricas permite consultar jugadas alternativas en posiciones concretas, aunque el autor advierte que la coincidencia con la anotación no implica optimalidad.
- Despliegue en entornos con recursos mínimos: el repositorio ocupa 0,2 GB y el GGUF F32 cabe en cualquier equipo; no requiere GPU ni cuantización para funcionar.
- Prototipado de protocolos de codificación tablero-texto: el cambio de vocabulario y protocolo entre versiones documentado por el autor sirve de ejemplo de gestión de versiones de interfaces en modelos de dominio específico.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (conjuntos propios, no benchmarks estándar):

| Modelo | Parametros | Tactica inmediata | Logica a 3 movimientos | Certificado a 5 jugadas | Salidas legales | Repeticion historica |
|---|---:|---:|---:|---:|---:|---:|
| Publicacion anterior Dense | 10.809.984 | 477/512 | 128/128 | 106/128 | 766/768 | 153/224 |
| Publicacion anterior MoE disperso | 10.813.056 | 463/512 | 128/128 | 105/128 | 767/768 | 151/224 |
| MoE funcional actual | 1.988.096 | 495/512 | 125/128 | 127/128 | 768/768 | 164/224 |

| Partidas completas | Victorias actual | Derrotas actual | Derrotas por ilegal actual | Derrotas por ilegal rival | Tablas/truncadas |
|---|---:|---:|---:|---:|---:|
| Actual vs Dense anterior | 43 | 21 | 3 | 7 | 0/0 |
| Actual vs MoE disperso anterior | 43 | 21 | 4 | 6 | 0/0 |

| CPU nativa Ollama, F32, 2 hilos | Mediana de computo (sin carga) |
|---|---:|
| Dense anterior | 162,9 ms |
| MoE disperso anterior | 99,0 ms |
| MoE funcional actual | 185,9 ms |

El autor precisa que los conjuntos de prueba comparten plantillas tácticas limitadas con el entrenamiento, que la tasa de acierto a cinco jugadas mide consistencia con un certificado suficiente de matanza y no optimalidad exhaustiva, y que las 224 posiciones históricas miden coincidencia con la jugada anotada, no generalización nueva. Las partidas se jugaron desde 32 aperturas de cuatro jugadas en zona central, con intercambio de colores, 64 partidas por grupo; no constituyen una clasificación Elo. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F32 (1.988.096 parámetros × 4 bytes ≈ 8 MB de pesos, más overhead de runtime y contexto de 2.048 tokens).
- GPU recomendadas: no se especifican; cualquier GPU con más de 1 GB de VRAM puede alojarlo. Funciona sin GPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU modesta.
- Despliegue: Ollama con `Modelfile` incluido (GGUF nativo F32), Transformers con `AutoModelForCausalLM`, y compatible con text-generation-inference según los tags del repositorio. No se menciona soporte de vLLM ni llama.cpp en la model card.
- Latencia medida: mediana de 185,9 ms por jugada en CPU de dos hilos con Ollama nativo F32, sin contar la carga del modelo. El autor señala que, pese a tener menos parámetros, es más lento que el MoE disperso anterior (99,0 ms) porque computa los ocho expertos en cada paso.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tactica inmediata | Certificado a 5 | Salidas legales | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---:|---|---|
| Gomoku MoE funcional (actual) | 1.988.096 | 2.048 | 495/512 | 127/128 | 768/768 | Apache 2.0 | HF, GGUF, Ollama |
| Gomoku Dense (revision anterior) | 10.809.984 | no disponible | 477/512 | 106/128 | 766/768 | Apache 2.0 | Revision `ab8fca0` en HF |
| Gomoku MoE disperso (revision anterior) | 10.813.056 | no disponible | 463/512 | 105/128 | 767/768 | Apache 2.0 | Carpeta `moe/` en HF |

Las tres variantes pertenecen al mismo autor y comparten dominio; la comparación con modelos de gomoku de terceros o con LLM de propósito general no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio estrictamente específico: solo genera coordenadas de gomoku; no es útil para texto general, código, matemáticas ni conversación.
- Puede omitir defensas y generar jugadas ilegales en producción; el autor lo reconoce explícitamente pese al 768/768 en el conjunto de prueba.
- El protocolo de tablero cambió respecto a la versión anterior: los clientes antiguos con cadenas de tablero escritas a mano no son compatibles; es obligatorio usar `pointer_protocol.py` del paquete actual junto con pesos y tokenizer de la misma revisión.
- No hay máscara de acciones legales ni corrección de errores en tiempo de ejecución; la validez de la jugada depende del modelo.
- Los conjuntos de prueba comparten plantillas tácticas con el entrenamiento, por lo que las métricas publicadas no deben interpretarse como generalización limpia.
- Las partidas de evaluación no constituyen una clasificación Elo ni una medida de fuerza profesional; el autor no reclama superioridad clara sobre la versión anterior.
- El entrenamiento no es un PPO completo sobre partidas, sino una mezcla de recompensa de posición y supervisión; el comportamiento en aperturas o posiciones fuera de distribución puede degradarse.
- Sesgos conocidos: no se documentan sesgos sociales por el dominio restringido, pero el vocabulario y los datos de entrenamiento están limitados a partidas y plantillas del autor.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse LICENSE y NOTICE del repositorio.
- El rendimiento en CPU es superior al de la versión densa anterior pero inferior al del MoE disperso previo; si la latencia es crítica, conviene evaluar esa alternativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/l898974766/gomoku
- Revisión anterior (Dense y MoE disperso): https://huggingface.co/l898974766/gomoku/tree/ab8fca03e4942a5808b14adfa50f27b5d634f57f
- Documentación del MoE disperso anterior: https://huggingface.co/l898974766/gomoku/blob/main/moe/README.md
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
