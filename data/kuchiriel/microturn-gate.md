# Kuchiriel/microturn-gate

## Resumen

microturn-gate es un adaptador LoRA de tipo clasificador de texto desarrollado por Kuchiriel sobre el modelo base Qwen/Qwen3.5-4B. Su función es decidir, en un asistente de voz full-duplex en portugués de Brasil, cuándo debe hablar el sistema: clasifica cada turno del usuario en una de cuatro etiquetas (`RESPOND`, `WAIT`, `SILENCE`, `BARGE`). El adaptador nace del proyecto JARVIS duplex y se publica de forma aislada para que cualquier harness de voz (llama.cpp, OpenCode, pi) pueda reutilizarlo sin arrastrar el resto del sistema.

El adaptador tiene 1.835.008 parámetros y se distribuye en formato PEFT safetensors (82 MB) y en dos conversiones GGUF: una completa en q8_0 (82 MB) y una compacta v9 de 3 MB, que es la recomendada por el autor. La innovación práctica no es la arquitectura, sino el patrón de uso: el adaptador se activa solo en el instante de la decisión de turno (`--lora-init-without-apply` en llama.cpp), se ejecuta una clasificación restringida por gramática y se desactiva, de modo que el chat normal del modelo base no sufre deriva de estilo.

Es relevante porque aborda un problema clásico de los asistentes de voz (la decisión de cuándo intervenir) con un clasificador minúsculo y latencias de 132 a 587 ms en CPU, en lugar de reglas heurísticas frágiles ante ruido de fondo, frases incompletas o interrupciones. El modelo está publicado bajo licencia Apache-2.0 y solo declara soporte para portugués.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de 4 capas con r=16 sobre Qwen/Qwen3.5-4B; tarea de clasificación de texto |
| Parámetros totales | 1.835.008 (adaptador); el modelo base Qwen3.5-4B no se incluye en el repo |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada en la información) |
| Tipos de cuantización | safetensors f32 (adaptador original, 82 MB); GGUF q8_0 completo (82 MB); GGUF compacto v9 (3 MB) |
| Idiomas soportados | portugués (pt), en concreto portugués de Brasil (PT-BR) |
| Licencia | Apache-2.0 (adaptador y prompt); el modelo base Qwen3.5-4B se rige por su propia licencia |
| Formato de pesos | safetensors (PEFT), GGUF (q8_0 y versión compacta) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre cuatro capas del transformer Qwen/Qwen3.5-4B. No se trata de un modelo generativo autónomo, sino de un clasificador de cuatro clases que se invoca con un prompt de sistema fijo (byte-for-byte idéntico al de entrenamiento) y cuya salida se restringe mediante gramática a `RESPOND | WAIT | SILENCE | BARGE`. El adaptador se enciende y se apaga en tiempo de inferencia, de modo que el modelo base conserva su comportamiento conversacional intacto.

Los datos de entrenamiento no se detallan en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La model card sí aporta detalles sobre el conjunto de evaluación: un held-out de 52 hablas sin solapamiento con el entrenamiento, y menciona que la clase BARGE cuenta con solo 177 ejemplos únicos en entrenamiento. El autor advierte explícitamente que el benchmark original de 27 hablas se solapa con la plantilla de entrenamiento y que su recall de 1.00 refleja memorización, no generalización.

## Capacidades

- Clasificación de turnos de voz en cuatro categorías: `RESPOND` (habla completa que pide respuesta), `WAIT` (frase incompleta, el usuario sigue hablando), `SILENCE` (backchannel, ruido o habla completa no dirigida al asistente, como TV o narración) y `BARGE` (el usuario interrumpe al asistente).
- Salida restringida por gramática, lo que evita respuestas fuera de las cuatro etiquetas válidas.
- Integración con llama.cpp mediante `--lora-init-without-apply`, activando el adaptador solo en el momento de la clasificación.
- Conmutación rápida del adaptador: 7 ms para activar o desactivar el LoRA en llama.cpp.
- Diseñado para entornos full-duplex con ruido de fondo, frases incompletas e interrupciones.
- Soporte exclusivo de portugués de Brasil; no se declaran otras lenguas.
- No se declaran capacidades de tool calling, agentes, visión, audio nativo ni modo de razonamiento (thinking); el adaptador es un clasificador, no un generador conversacional.

## Casos de uso

- Asistente de voz full-duplex en portugués: el adaptador decide en cada turno si el sistema debe responder, esperar a que el usuario termine, callarse o gestionar una interrupción. Es adecuado porque sustituye reglas heurísticas frágiles por un clasificador entrenado con hablas reales.
- Gestión de barge-in en llamadas o interfaces de voz: cuando el usuario interrumpe al asistente, la etiqueta `BARGE` permite cortar la síntesis de voz de forma controlada en lugar de ignorar la interrupción.
- Filtrado de ruido y habla no dirigida: la etiqueta `SILENCE` permite descartar TV, radio, narración o conversaciones de fondo antes de invocar al modelo generativo, ahorrando cómputo y evitando respuestas fuera de contexto.
- Detección de turno en asistentes de atención al cliente: con latencias de 132 a 587 ms en CPU, el clasificador puede ejecutarse en el mismo servidor que el motor de voz sin necesidad de GPU dedicada.
- Integración en pipelines de voz existentes: el formato GGUF compacto v9 (3 MB) permite incorporar el adaptador a despliegues llama.cpp ya operativos mediante `--lora`, sin reentrenar ni sustituir el modelo base.
- Experimentación en investigación sobre turn-taking: el autor publica pesos, prompt, métricas y script de conversión, lo que facilita reproducir el held-out de 52 hablas y comparar variantes.
- Despliegue en dispositivos de recursos limitados: la versión v9 de 3 MB está pensada para portarse a llama.cpp sobre android-arm64, según la hoja de ruta del autor.

## Benchmarks y rendimiento

| Versión | Conjunto de evaluación | Resultado | Latencia |
|---|---|---|---|
| v21 original (r16 f32, 84,9 MB) | 27 hablas PT-BR (con solapamiento con entrenamiento) | recall 1.00, precision 0.65, F1 0.79, 7 FP | 252–587 ms |
| gate v3 (LoRA + reglas) | 52 hablas held-out sin solapamiento | 40/52 aciertos (SILENCE 7/16, RESPOND 16/16, BARGE 7/7, WAIT 10/13) | ~149 ms |
| baseline sin gate | mismas 52 hablas | 37/52 aciertos | no disponible |
| v3 en GGUF q8_0 | conversión local | 3,06 MB | ~132 ms para clasificar |

El propio autor advierte que el resultado de 27 hablas no es válido como medida de generalización por solapamiento con la plantilla de entrenamiento. El `metrics.json` incluido en el repo mide un conjunto menor de 16 hablas (accuracy 0,5625, BARGE 0/3) y debe interpretarse como diagnóstico por clase, no como cifra de publicación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa 82 MB (safetensors) o 3 MB (GGUF v9); el consumo real depende del modelo base Qwen3.5-4B cargado, cuyos requisitos no se detallan en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada. El autor reporta latencias medidas en CPU (132–587 ms), lo que sugiere que el adaptador está pensado para ejecutarse sin GPU dedicada.
- Compatibilidad con GPU de consumo: el adaptador (3 MB en v9) cabe en cualquier GPU capaz de cargar el modelo base; no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--lora microturn-4b-lora-v9.gguf --lora-init-without-apply`. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: clasificación en ~132 ms (GGUF q8_0) y ~149 ms (gate v3 en CPU); conmutación del adaptador en 7 ms. No se reporta throughput en tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación de turn-taking en la documentación proporcionada. La model card menciona como referencia el paradigma Cactus/Needle para despliegue en android-arm64, pero no ofrece datos de rendimiento de esos sistemas que permitan una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microturn-gate (este modelo) | 1.835.008 (adaptador) | no disponible | Clasificación de turnos de voz (4 clases) | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La clase `SILENCE` es la más débil: en el held-out de 52 hablas solo acierta 7 de 16 casos, confundiendo habla completa no dirigida al asistente con `RESPOND`.
- La clase `BARGE` cuenta con solo 177 ejemplos únicos de entrenamiento, lo que limita la diversidad y la generalización ante interrupciones reales.
- El benchmark original de 27 hablas se solapa con la plantilla de entrenamiento; su recall de 1.00 refleja memorización y no debe citarse como generalización.
- El `metrics.json` incluido mide solo 16 hablas (accuracy 0,5625, BARGE 0/3) y es un diagnóstico por clase, no una cifra representativa.
- El prompt de sistema debe reproducirse byte-for-byte; cualquier cambio en una coma invalida el comportamiento entrenado.
- Soporte exclusivo de portugués de Brasil; no se declaran capacidades multilingües.
- El adaptador depende del modelo base Qwen/Qwen3.5-4B, cuyos requisitos de hardware, contexto y licencia no se detallan en la información disponible y deben consultarse por separado.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información proporcionada; al ser un clasificador restringido por gramática, el riesgo se limita a etiquetas incorrectas, no a texto inventado.
- Uso comercial: el adaptador y el prompt son Apache-2.0, pero el modelo base Qwen3.5-4B se rige por su propia licencia, que debe verificarse antes de un despliegue en producción.
- El autor desaconseja abrir PR de "mejor prompt" sin medir en el held-out, tras haber registrado 537 mediciones sin señal con tests inválidos.

## Enlaces

- Hugging Face: https://huggingface.co/Kuchiriel/microturn-gate
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio original del proyecto (referenciado en la model card): `nixos-ai` (no se proporciona URL)
- Documento de medidas referenciado: `nixos-ai/docs/DUPLEX-LAYAS-MEASUREMENTS.md` (no se proporciona URL)
- Script de conversión incluido en el repo: `convert_lora_to_gguf.sh`
- Script de evaluación referenciado: `bench_heldout2.py` (en el repo original, no se proporciona URL)
