# predbrad/Genaro-poker-1.7B

## Resumen

Genaro Poker 1.7B es un ajuste fino completo (full fine-tune) del modelo Qwen3-1.7B de Alibaba, desarrollado por el autor independiente predbrad. No es un modelo de propósito general: está entrenado específicamente para jugar al póker como oponente controlado por IA dentro de PokerSI, una aplicación Android de póker en la que cada asiento de la mesa es un modelo de lenguaje pequeño ejecutado localmente con llama.cpp. El modelo recibe un prompt con la persona, las reglas, la información visible del asiento y las jugadas legales, y devuelve un único objeto JSON con una acción válida y, en los turnos de conversación, una frase breve en la voz del personaje.

Con 1.720.574.976 parámetros (1,7B), es el hermano mayor del Genaro Poker 0.6B y está pensado para móviles con 6 GB o más de RAM. Su relevancia radica en que demuestra un caso de uso muy concreto de IA en el dispositivo (on-device): un modelo de 1,7B cuantizado a Q4_K_M en 1,1 GB que toma decisiones de póker razonables y genera diálogo de mesa sin filtrar información de las cartas, algo que el modelo base no consigue de forma fiable.

El modelo se distribuye con licencia Apache 2.0, heredada de Qwen3-1.7B, e incluye pesos en safetensors (bf16) y una versión GGUF lista para llama.cpp con la plantilla de chat embebida. Solo soporta inglés y su formato de prompt es el específico de PokerSI; fuera de ese formato se comporta como un Qwen3 pequeño obsesionado con el póker, no como un asistente conversacional general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B) |
| Parámetros totales | 1.720.574.976 (1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de llama.cpp usa `-c 4096`) |
| Tipos de cuantización | GGUF Q4_K_M (1,1 GB); pesos bf16 en safetensors; otras cuantizaciones posibles vía llama.cpp |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

Genaro Poker 1.7B es un ajuste fino completo de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El entrenamiento se realizó en bf16, 2 épocas, con learning rate 3e-5 y scheduler coseno, batch efectivo de 64 y pérdida calculada únicamente sobre la respuesta. El conjunto de datos consta de 22.941 conversaciones generadas a partir de 33.000 manos de auto-juego del propio motor Kotlin de PokerSI, compilado en un puente para que cada prompt sea byte a byte idéntico al que envía la aplicación. Las jugadas objetivo son la mayoría de 9 profesores heurísticos (House Bots), cada uno con el estilo de la persona y equity Monte Carlo de 1.000 muestras.

El diálogo de mesa lo generó Gemma 4 E4B para la jugada elegida, y solo se conservó si pasaba las reglas de la gramática: entre 2 y 12 palabras, sin vocabulario de cartas ni de manos, respetando las reglas de repetición de PokerSI y su filtro `HandBlur`. Los turnos silenciosos no llevan frase, igual que la gramática de turno tranquilo de la app. El entrenamiento completo tardó unas 2 horas en un portátil con una NVIDIA RTX Spark N1X. La innovación principal no está en la arquitectura, sino en el pipeline de datos y en el uso de gramática GBNF en llama.cpp para restringir la salida a JSON válido durante la inferencia.

## Capacidades

- Generación de decisiones de póker en formato JSON estricto: acción (`call`, `check`, `raise`, `fold`), importe y frase opcional de mesa.
- Cumplimiento de las reglas del juego mediante gramática GBNF, que restringe la salida a movimientos legales.
- Diálogo de mesa breve (2-12 palabras) en la voz de la persona, entrenado para no revelar cartas ni manos.
- Adaptación a seis variantes de póker: Texas Hold'em, Omaha, Five-Card Draw, Seven-Card Stud, Short Deck y Crazy Pineapple.
- Manejo de personas y estilos de juego distintos definidos en el prompt.
- No soporta tool calling ni function calling de propósito general.
- No soporta razonamiento multi-paso ni modo thinking (se desactiva explícitamente con `enable_thinking=False`).
- Capacidades multilingües limitadas al inglés.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Oponentes de IA en una app de póker para Android: el modelo se ejecuta con llama.cpp en el propio teléfono y ocupa cada asiento de la mesa, tomando decisiones legales en formato JSON con una latencia adecuada para el juego gracias a su tamaño de 1,7B y su cuantización Q4_K_M de 1,1 GB.
- Generación de diálogo de personaje en juegos de cartas: produce frases cortas y familiares en la voz de cada persona, sin revelar información privada, lo que permite dar vida a los oponentes sin coste de servidor.
- Evaluación de pipelines de prompt y gramática: al estar entrenado con los prompts exactos de PokerSI, sirve como banco de pruebas para validar cambios en el motor de prompts o en las gramáticas GBNF.
- Prototipado de agentes de juego en el dispositivo: su formato de salida JSON y su bajo requisito de memoria lo hacen útil para experimentar con IA local en juegos de mesa o cartas sin infraestructura en la nube.
- Investigación sobre ajuste fino de modelos pequeños: el repositorio incluye pipeline de datos, configuración de entrenamiento y evaluaciones, lo que facilita reproducir o extender el experimento con otras variantes o personas.
- Demostraciones educativas de IA on-device: muestra cómo un modelo de 1,7B puede sustituir a un modelo mayor en una tarea acotada cuando se entrena con datos específicos y se restringe la salida mediante gramática.

## Benchmarks y rendimiento

Resultados sobre 600 decisiones reservadas de PokerSI en las seis variantes, ejecutadas con llama.cpp con el mismo prompt, gramática GBNF y muestreo que la app (temperatura de persona 0,6-0,9, top-k 40, top-p 0,95, máximo 96 tokens).

| Modelo | GGUF | Concordancia | Errores graves /100 | Filtraciones | Habla de cartas | Repeticiones | >12 palabras | Juego real (bb/100) |
|---|---|---|---|---|---|---|---|---|
| Qwen3 1.7B (base) | 1282 MB | 39,7% | 8,2 | 17,9% | 49,7% | 8,2% | 48,3% | — |
| LFM2.5 1.2B (antiguo predeterminado de PokerSI) | 731 MB | 55,8% | 12,6 | 2,6% | 29,8% | 8,5% | 9,4% | -80 ± 80 |
| Genaro Poker 0.6B | 397 MB | 78,5% | 9,1 | 0,0% | 0,3% | 0,0% | 0,0% | -84 ± 52 |
| **Genaro Poker 1.7B** | 1107 MB | 80,2% | 7,5 | 0,3% | 0,9% | 0,6% | 0,0% | -45 ± 64 |

Definiciones: concordancia con la jugada mayoritaria de los 9 profesores House Bot; error grave cuando se retira con equity ≥ 10 puntos por encima de las pot odds o se iguala/sube con equity ≥ 15 puntos por debajo (excepto en personas faroleras); filtración cuando una frase sería censurada por el `HandBlur` de PokerSI; habla de cartas cuando aparece cualquier carta, rango o palabra de mano.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con cuantización Q4_K_M en llama.cpp; alrededor de 3,5 GB en bf16 con transformers.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para bf16; para Q4_K_M basta con CPU o GPU integrada. Una RTX 4090 o A100 no son necesarias, pero ofrecerían latencias muy bajas.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), y en móviles Android con 6 GB o más de RAM según el autor.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja -c 4096`), Ollama y transformers. El modelo incluye etiquetas para text-generation-inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor indica que el entrenamiento completo tardó unas 2 horas en una NVIDIA RTX Spark N1X, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Concordancia (PokerSI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Genaro Poker 1.7B | 1,7B | No disponible | 80,2% | Apache 2.0 | HuggingFace (safetensors + GGUF) |
| Genaro Poker 0.6B | 0,6B (aprox.) | No disponible | 78,5% | Apache 2.0 (heredada) | HuggingFace |
| Qwen3 1.7B (base) | 1,7B | No disponible | 39,7% | Apache 2.0 | HuggingFace |
| LFM2.5 1.2B | 1,2B | No disponible | 55,8% | No disponible | Usado previamente en PokerSI |

El modelo supera ligeramente a su hermano pequeño en concordancia (80,2% frente a 78,5%) y reduce los errores graves (7,5 frente a 9,1 por 100), a costa de triplicar el tamaño del archivo GGUF (1,1 GB frente a 397 MB). Frente al Qwen3-1.7B base, la mejora es sustancial en todas las métricas, especialmente en filtraciones y habla de cartas. En juego real, sin embargo, sigue sin batir a los House Bots heurísticos (bb/100 de -45 ± 64).

## Limitaciones y advertencias

- El modelo imita a los House Bots de PokerSI; es un oponente razonable y legible para partidas casuales, no un jugador fuerte. En juego real no supera a los House Bots.
- Entrenado exclusivamente para el formato de prompt de PokerSI y en inglés; fuera de ese formato no es un modelo de chat general.
- Riesgo de alucinación en las frases de mesa, aunque el entrenamiento y la gramática reducen las filtraciones de cartas al 0,3%.
- Sesgos heredados de Qwen3-1.7B y de las personas definidas en PokerSI; las frases son familiares por construcción, pero no se detallan sesgos específicos.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; el ejemplo de llama.cpp usa 4096 tokens.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento se generaron con PokerSI (MIT) y Gemma 4 (Apache 2.0), cuyas condiciones deben respetarse.
- Para producción en la app, es necesario usar la gramática GBNF y desactivar el modo thinking; de lo contrario, la salida puede no ser JSON válido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/predbrad/Genaro-poker-1.7B
- Modelo hermano 0.6B: https://huggingface.co/predbrad/Genaro-poker
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de código, pipeline de datos y evaluaciones: https://github.com/bradflaugher/genaro-poker
- Resultados de juego real: https://github.com/bradflaugher/genaro-poker/blob/main/results/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/predbrad/genaro-poker-sft
- Aplicación PokerSI: https://github.com/bradflaugher/PokerSI
