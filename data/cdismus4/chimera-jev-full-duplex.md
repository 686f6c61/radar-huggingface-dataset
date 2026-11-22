# cdismus4/chimera-jev-full-duplex

## Resumen

Jev Base v1 es un paquete de inferencia de audio a audio diseñado para conversación de voz full-duplex en el navegador, publicado por el desarrollador independiente cdismus4 bajo el identificador `cdismus4/chimera-jev-full-duplex`. No es un modelo de lenguaje: es lo que el autor denomina un "cuerpo de voz" sin cerebro semántico, compuesto por un encoder de audio Mimi (Kyutai), un pequeño reflex basado en GRU que gestiona escucha, backchannels y turnos de palabra cada 80 ms, y un sintetizador físico de tracto vocal (CHIMERA, compilado a WebAssembly). El paquete completo congelado ocupa aproximadamente 178 MB, lo que permite ejecutarlo en un navegador móvil convencional.

La relevancia técnica reside en su enfoque de full-duplex: el reflex decide cuándo escuchar, interrumpir o ceder el turno basándose únicamente en prosodia y textura de voz, sin comprender palabras. La comprensión semántica se delega a un "cerebro" externo (System-2) que se conecta mediante un puerto definido. El idioma soportado es exclusivamente japonés, tanto en escucha como en habla.

El modelo se distribuye con una licencia compuesta poco habitual (`apache-2.0-with-mit-and-cc-by-4.0`), que refleja la mezcla de componentes de terceros: Mimi de Kyutai (CC BY 4.0), CHIMERA de Jameson Hodge (MIT) y contribuciones propias del autor (Apache-2.0). El repositorio incluye además un "student ear" destilado opcional fuera del paquete congelado, elevando el total a unos 191 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: encoder Mimi (ONNX) + GRU reflex (ONNX) + driver mora-a-articulación (ONNX) + sintetizador físico CHIMERA (Wasm) |
| Parametros totales | 3.786.789 (reflex) + 1.197.876 (driver) + encoder Mimi y CHIMERA (no disponibles en parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa en ventanas de 80 ms; no se especifica ventana de contexto conversacional) |
| Tipos de cuantizacion | fp32 para el ear; no se documentan otras cuantizaciones |
| Idiomas soportados | Japonés (ja) únicamente |
| Licencia | apache-2.0-with-mit-and-cc-by-4.0 (compuesta; ver NOTICE) |
| Formato de pesos | ONNX (ear, reflex, driver) y Wasm (mouth/CHIMERA); tablas JSON auxiliares |
| Tamano del paquete congelado | 178.001.405 B (≈178,0 MB) |
| Tamano total con student ear | 191.444.666 B (≈191,4 MB) |
| Pipeline | audio-to-audio |
| Fecha de congelación | 2026-11-18 |

## Arquitectura y entrenamiento

El sistema ejecuta un bucle cada 80 ms con la secuencia: ear (encoder Mimi) → reflex (Jev Core) → lexicon bank → driver → mouth (CHIMERA). El reflex es una GRU de 4 capas con hidden size 384 (3.786.789 parámetros, opset 17), entrenada sobre 600 conversaciones de self-play (360 de data-v02 y 240 de data-v03), en la época 17. El driver v1 es un modelo inverso (embedding de mora + GRU bidireccional + MLP, 1.197.876 parámetros) entrenado sobre 149.983 pares exactos (audio, comando motor) que CHIMERA renderizó sobre sí mismo mediante self-rendering. Este enfoque supervisado de planificación inversa sobre pares auto-renderizados es la innovación técnica central frente a alternativas basadas en RL como `chimera-neural`.

El ear es un encoder Mimi exportado a ONNX desde los pesos oficiales de Kyutai (155.827.938 B en fp32). El mouth es CHIMERA, un sintetizador de tracto vocal físico de 22 dimensiones motoras compilado de Rust a Wasm (1.053.296 B). El lexicon bank contiene 64 entradas (backchannels, tomas de turno, continuadores) en JSON. La prosodia (nivel de pitch y tasa) se sintetiza en tiempo de ejecución por reglas. El student ear destilado (`student_rf4.onnx`, 13.443.261 B, Apache-2.0) mantiene el mismo contrato de entrada/salida earEmb y es intercambiable sin modificar el reflex.

## Capacidades

- Detección de turnos de palabra (turn-taking) en tiempo real cada 80 ms basada en prosodia y textura de voz.
- Emisión de backchannels (señales de escucha activa) y continuadores en japonés.
- Decisión de cuándo escuchar, tomar el turno, continuar o cederlo.
- Síntesis de voz mediante tracto vocal físico con control articulatorio de hasta 14 claves activas de 19 predichas por segmento.
- Conversión de secuencias de moras a sobrescrituras articulatorias y duraciones para el planificador de gestos de CHIMERA.
- Ejecución en navegador mediante WebAssembly (diseñado para navegador móvil).
- Interfaz de "brain port" para conectar un cerebro semántico externo (System-2).
- No incluye comprensión semántica, tool calling, function calling, agentes, visión ni audio más allá del pipeline de voz descrito.

## Casos de uso

- Compañero conversacional en juegos de navegador: el paquete puede integrarse como acompañante que escucha y responde en japonés mientras el jugador comenta la escena, como demuestra la demo Phase 3 game, con el cerebro externo seleccionando candidatos de respuesta mediante búsqueda de embeddings sobre un banco escrito a mano.
- Atención al cliente en japonés con latencia baja: al ejecutarse en el navegador del usuario con un frame time mediano de 58,6 ms en Pixel 9a, permite interacciones de voz fluidas sin enviar audio a un servidor, reduciendo latencia y preservando privacidad.
- Interfaces de voz para aplicaciones web accesibles: el paquete de 178 MB cabe en un navegador móvil y puede proporcionar retroalimentación vocal y gestión de turnos a usuarios con discapacidad visual o motriz en entornos japoneses.
- Kioscos y terminales interactivos: al ser full-duplex y ligero, puede gestionar conversaciones cara a cara con interrupciones naturales, delegando el contenido a un backend semántico conectado por el brain port.
- Investigación en interacción conversacional: el reflex entrenado por self-play y el driver supervisado sobre pares auto-renderizados ofrecen una base reproducible para estudiar turn-taking y articulación sin depender de modelos de lenguaje grandes.
- Prototipado rápido de asistentes de voz en japonés: el student ear destilado (13,4 MB) permite sustituir el ear teacher sin modificar el reflex, facilitando experimentos de despliegue con menor huella.
- Educación lingüística y práctica de conversación: el sistema puede actuar como interlocutor que practica turnos y backchannels en japonés, con prosodia generada por reglas y articulación física controlada.

## Benchmarks y rendimiento

| Metrica | Valor medido |
|---|---|
| Dispositivo de prueba | Pixel 9a (teacher ear, 60 s de voz real de usuario) |
| Utterances generadas | 20 (9 backchannels, 11 turn-takes) |
| Última utterance | 58,8 s, sin silencio tardío en sesión |
| Frame time mediano | 58,6 ms (ear 54,7 / reflex 1,7 / driver 2,3) |
| Frame time p95 | 92 ms (dato truncado en la información disponible) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el paquete corre en CPU dentro del navegador mediante WebAssembly y ONNX Runtime Web.
- GPU recomendadas: no se especifican; el diseño apunta a ejecución en navegador móvil sin GPU dedicada.
- Cabe en consumer GPU: sí, con enorme holgura; también en CPU de móvil (Pixel 9a como referencia).
- Opciones de despliegue: navegador con WebAssembly y ONNX (ONNX Runtime Web); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este pipeline.
- Latencia y throughput: frame time mediano de 58,6 ms y p95 de 92 ms en Pixel 9a con teacher ear y 60 s de voz real; el bucle objetivo es de 80 ms por frame.
- Almacenamiento: 178 MB para el paquete congelado, 191 MB con el student ear.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev Base v1 (este) | Pipeline full-duplex de voz en navegador | 3,79 M (reflex) + 1,20 M (driver) + encoder/sintetizador | Ventanas de 80 ms | Apache-2.0 + MIT + CC BY 4.0 | Hugging Face, Wasm en navegador |
| chimera-neural (parodyband, nov 2026) | Control de CHIMERA basado en RL | No disponible | No disponible | No disponible | No disponible |
| Mimi (Kyutai) | Codec/encoder de audio neuronal | No disponible en la información | No disponible | CC BY 4.0 | Pesos oficiales Kyutai |
| CHIMERA (Jameson Hodge) | Sintetizador físico de tracto vocal | No aplica (modelo físico) | No aplica | MIT | Rust/Wasm |

La comparación directa con modelos de voz full-duplex de gran escala (por ejemplo, sistemas conversacionales basados en LLM) no está disponible en la información proporcionada; este paquete se posiciona explícitamente como un "cuerpo" sin cerebro semántico, por lo que su categoría es distinta.

## Limitaciones y advertencias

- No incluye comprensión semántica: el reflex no entiende palabras y depende de un cerebro externo para generar contenido.
- Idioma limitado exclusivamente al japonés, tanto en escucha como en habla.
- La prosodia se sintetiza por reglas en tiempo de ejecución, lo que puede sonar menos natural que modelos neuronales de prosodia.
- Riesgo de respuestas fuera de contexto si el brain port externo no está bien integrado o el lexicon bank no cubre el dominio.
- El lexicon bank tiene solo 64 entradas, lo que limita la variedad de backchannels y turn-takes.
- Licencia compuesta que requiere revisar el NOTICE para cumplir con las obligaciones de CC BY 4.0 (Mimi) y MIT (CHIMERA) además de Apache-2.0.
- El student ear destilado no forma parte del paquete congelado ni del MANIFEST; su uso en producción requiere validación adicional.
- Las mediciones se realizaron en un bench propio del proyecto, no en un benchmark estándar externo, lo que limita la comparabilidad.
- No se documentan sesgos específicos, pero al entrenarse con self-play podría reflejar patrones limitados de las 600 conversaciones sintéticas.
- El frame time p95 de 92 ms supera el objetivo de 80 ms, lo que puede provocar jitter en dispositivos menos potentes que el Pixel 9a.

## Enlaces

- Hugging Face: https://huggingface.co/cdismus4/chimera-jev-full-duplex
- Demo Phase 3 game (lab): https://daw.voivent.com/lab/phase3-game/
- HF Space del juego: https://huggingface.co/spaces/cdismus4/chimera-jev-game
- Bekko Embedding (hotchpotch, MIT): https://huggingface.co/hotchpotch/bekko-embedding-v1-a8m
- NOTICE de licencia: https://huggingface.co/cdismus4/chimera-jev-full-duplex/blob/main/NOTICE
- Documentación interna citada en el repo: `docs/MODEL_CARD.md`, `docs/CONTRACTS.md`, `docs/contracts/integration-spec-v1.md`, `MANIFEST.md`, `FREEZE-RECORD.md`
