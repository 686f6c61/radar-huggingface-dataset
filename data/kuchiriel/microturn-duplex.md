# Kuchiriel/microturn-duplex

## Resumen

`microturn-duplex` es un adaptador LoRA de tipo PEFT desarrollado por el usuario Kuchiriel sobre el modelo base Qwen/Qwen3.5-4B. Su funcion es actuar como generador de habla incremental en llamadas de voz en tiempo real: cada 0,6 s de audio decide si el asistente debe pronunciar hasta tres palabras nuevas o, por el contrario, emitir el token especial `<listen>` para no interrumpir al interlocutor. Se trata de la implementacion del concepto de "micro-turn" descrito en el paper DuplexCascade (arXiv 2603.09180), que propone turnos muy cortos controlados por token especial en lugar de depender de deteccion de actividad de voz (VAD).

El adaptador es deliberadamente pequeno: 3.833.856 parametros en safetensors, con rango 16, alpha 32 y aplicado unicamente a las proyecciones `q_proj` y `v_proj` del transformer base. No es un modelo autonomo, sino un complemento que requiere cargar el modelo Qwen3.5-4B junto con el adaptador para funcionar. Su relevancia actual reside en que aborda un problema poco cubierto en la literatura abierta: el control fino de turno en voz full-duplex sin VAD, con un mecanismo de silencio explicito y un cliente de referencia que corrige el sesgo del decodificador greedy.

La informacion publicada es escasa y de naturaleza practica: no hay benchmarks publicos de calidad conversacional, y el propio autor reconoce que la evaluacion se ha realizado en su pipeline de voz interno con latencias de clasificacion de 130-250 ms por tique. El modelo se distribuye bajo licencia Apache-2.0 y soporta portugues e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-4B; rango 16, alpha 32, modulos q_proj y v_proj |
| Parametros totales | 3.833.856 (adaptador); modelo base Qwen3.5-4B aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (adaptador y base); otras cuantizaciones no disponibles |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache-2.0 (verificar licencia del modelo base Qwen3.5-4B) |
| Formato de pesos | safetensors (PEFT), GGUF (LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, un transformer denso de 4.000 millones de parametros aproximadamente. La intervencion LoRA se limita a las proyecciones de query y value (`q_proj`, `v_proj`) con rango 16 y alpha 32, lo que mantiene un numero muy reducido de parametros entrenables (3,83 M) y permite cargar el adaptador junto al base sin duplicar el coste de memoria del modelo completo. El mecanismo de inferencia se ejecuta con llama.cpp mediante `llama-server` y la opcion `--lora-init-without-apply`, que permite cargar el adaptador sin aplicarlo de forma permanente.

El entrenamiento se ha realizado sobre datos propios del autor en portugues e ingles, con el texto que el microfono capta en cada tique de 0,6 s, no con la transcripcion completa de la conversacion. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica principal no esta en el entrenamiento sino en el esquema de decodificacion: el modelo emite `<listen>` o hasta tres palabras, y el cliente de referencia re-decodifica con `logit_bias` prohibiendo el token `<` cuando la probabilidad es baja, para evitar que el decodificador greedy fuerce una apertura de turno no deseada. Este mecanismo es el que sostiene el silencio y evita interrupciones.

## Capacidades

- Generacion de texto incremental en micro-turnos de hasta tres palabras por tique de 0,6 s.
- Control de turno mediante token especial `<listen>` para indicar silencio.
- Funcionamiento sin VAD: la decision de hablar o callar se toma por token, no por deteccion de actividad de voz.
- Integracion con llama.cpp mediante `llama-server` y adaptadores LoRA en GGUF.
- Cliente de referencia en Python (stdlib) con modo manual y modo demo con llamada roteirizada.
- Soporte bilingue portugues-ingles.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio nativo ni modo thinking.

## Casos de uso

- Asistentes de voz en tiempo real: el adaptador decide cada 0,6 s si el asistente debe intervenir con una frase corta o mantenerse a la escucha, lo que permite conversaciones fluidas sin cortes bruscos al usuario.
- Call centers automatizados: su capacidad de emitir `<listen>` de forma controlada reduce las interrupciones en conversaciones multi-turno con clientes, un problema habitual en sistemas de respuesta automatica.
- Prototipos de voz full-duplex: sirve como componente de generacion en pipelines que ya dispongan de un modulo de reconocimiento de voz y sintesis, sustituyendo la logica de turn-taking basada en VAD.
- Investigacion en turn-taking: util como referencia reproducible del esquema micro-turn del paper DuplexCascade, con cliente y servidor incluidos para experimentar con la decodificacion y el `logit_bias`.
- Sistemas de asistencia en portugues: para productos dirigidos al mercado lusohablante que necesiten respuestas habladas muy breves y control de silencio.
- Demos y validacion de concepto: el modo `--demo` con llamada roteirizada permite evaluar el comportamiento del adaptador sin montar un pipeline de audio completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluacion se realizo en su pipeline de voz interno (duplex voice) con latencia de clasificacion de 130-250 ms por tique, y que no constituye un benchmark publico de calidad conversacional.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.5-4B; el adaptador anade solo 3,83 M de parametros (despreciable frente al base). No se dispone de cifras concretas de VRAM en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende de la cuantizacion del base Qwen3.5-4B, no documentada.
- Opciones de despliegue: llama.cpp (`llama-server`) con `--lora microturn-duplex-lora.gguf --lora-init-without-apply`; cliente Python de referencia incluido en el repositorio.
- Latencia y throughput: latencia de clasificacion de 130-250 ms por tique segun el autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Funcion | Licencia |
|---|---|---|---|---|---|
| microturn-duplex | LoRA sobre Qwen3.5-4B | 3,83 M (adaptador) | no disponible | Generador de habla incremental (micro-turn) | Apache-2.0 |
| microturn-gate | LoRA sobre Qwen (clasificacion) | no disponible | no disponible | Gate de turn-taking (RESPOND/WAIT/SILENCE/BARGE) | Apache-2.0 |
| Qwen/Qwen3.5-4B | Transformer denso | ~4.000 M | no disponible | Generacion de texto general | ver licencia del base |

El unico comparable directo identificado es `microturn-gate`, del mismo autor, que cubre la fase de clasificacion del turno (etiquetas RESPOND, WAIT, SILENCE, BARGE) y no sustituye a este adaptador, que se encarga de la generacion incremental. No se han identificado en la informacion disponible otros adaptadores abiertos de micro-turn o full-duplex comparables.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar Qwen/Qwen3.5-4B y el adaptador conjuntamente; el rendimiento depende del base.
- Ausencia de benchmarks publicos: la validacion se limita al pipeline interno del autor, con latencias de 130-250 ms por tique; no hay evidencia de calidad conversacional en condiciones externas.
- Entrenado con el texto captado por el microfono en cada tique, no con transcripciones completas, lo que puede degradar el comportamiento ante ruido o errores de ASR.
- Solo portugues e ingles; no se documenta soporte de otros idiomas.
- El decodificador greedy tiende a emitir `<` incluso con probabilidad baja (27% segun el autor); el cliente debe aplicar `logit_bias` para mantener el silencio, lo que introduce dependencia del cliente de referencia.
- No sustituye al gate de turn-taking: el caso SILENCE se mide por separado en `microturn-gate`.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible.
- Licencia Apache-2.0 para el adaptador, pero debe verificarse la licencia del modelo base Qwen3.5-4B antes de uso comercial.
- Repositorio con 0 descargas y 0 likes; sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Kuchiriel/microturn-duplex
- Modelo relacionado (gate): https://huggingface.co/Kuchiriel/microturn-gate
- Paper de referencia: DuplexCascade, arXiv 2603.09180 (citado en la model card; no se dispone de URL directa en la informacion proporcionada)
- Modelo base: Qwen/Qwen3.5-4B (referenciado en la model card; no se dispone de URL directa en la informacion proporcionada)
