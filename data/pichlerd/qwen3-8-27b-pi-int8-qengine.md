# PichlerD/Qwen3.8-27B-pi-INT8-QEngine

## Resumen

Qwen3.8-27B-pi-INT8-QEngine es una cuantizacion INT8 del modelo Qwen3.8-27B de Qwen al que se le ha fusionado el adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted`, entrenado con aprendizaje por refuerzo para el agente de programacion pi (earendil-works/pi). El resultado es un checkpoint de 27.356.728.592 parametros (~27,36 mil millones) en formato INT8 W8A16, pensado para ejecutarse directamente sobre el motor de inferencia QEngine 1.3.6 en configuraciones de 2 a 3 GPU RTX 3090. El autor del repositorio es PichlerD, que se limita a realizar la fusion del adaptador y la conversion de formato; el merito del adaptador corresponde a harness-hub, el del modelo base al equipo de Qwen y el del motor y formato INT8 a bpx03.

La relevancia de esta ficha radica en que documenta una cadena completa de personalizacion: modelo base de Qwen con atencion hibrida (48 capas DeltaNet y 16 capas de atencion completa, segun la sanity check descrita en la model card), adaptador LoRA de rango 32 entrenado con RL para tareas de agente, fusion en FP32 y cuantizacion posterior a INT8. El orden importa: fusionar antes de cuantizar evita que el delta del LoRA se redondee a cero al sumarse sobre pesos ya cuantizados.

El checkpoint incluye ademas la torre de vision y una cabeza MTP (multi-token prediction) heredada del modelo base, y esta publicado bajo licencia Apache-2.0. Su interes practico es que permite desplegar un agente de codigo con mejoras medibles en Terminal-Bench 2.1 sobre hardware consumer de gama alta (RTX 3090), con un throughput de decodificacion de 117,9 tok/s en prosa y 240,4 tok/s en codigo en configuracion de dos RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con 48 capas DeltaNet y 16 capas de atencion completa (total 64 capas), segun la sanity check de la model card; tag `qwen3_5` |
| Parametros totales | 27.356.728.592 (~27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens (segun la configuracion de medida indicada: "262K context") |
| Tipos de cuantizacion | INT8 W8A16, simetrica, grupo 128, round-to-nearest; escalas KV en FP8 tomadas del checkpoint INT4 de QEngine para 27B |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `compressed-tensors`), mas `token_rank.bin` y `model_mtp.safetensors`; formato especifico de QEngine |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida: 48 capas DeltaNet (atencion lineal) y 16 capas de atencion completa, con 64 capas en total. Sobre ese base se entreno un adaptador LoRA de rango 32 y alpha 64 con aprendizaje por refuerzo para el agente de codigo pi. El adaptador afecta a las proyecciones q/k/v/o de las 16 capas de atencion completa y a gate/up/down de las 64 capas, con 256 pares A/B en total. El adaptador no toca la cabeza MTP, que se mantiene en su version original.

El proceso de construccion fue: partir del checkpoint BF16 de `Qwen/Qwen3.8-27B` (commit `37561816e66b5b9153b1b64c10968c18c1e6f4a0`), fusionar el adaptador `harness-hub/Qwen3.8-27B-pi-adapted` (commit `e786f8491742268f9b2bc729697b13bfac26d4ad`) en FP32 con la formula `W' = W + (alpha/r) · B·A`, almacenar en BF16 y cuantizar a INT8 con la herramienta `tools/quant_int8.py` de QEngine v1.3.6 (commit `444b2e49`). Las escalas KV en FP8 se tomaron del checkpoint INT4 de QEngine para 27B mediante `--kv-from`, y `token_rank.bin` se copia sin cambios desde `bpx03/Qwen3.8-27B-INT8-QEngine`. La sanity check confirma que embeddings, lm_head, normas, las 48 capas DeltaNet, las escalas KV, la torre de vision y `model_mtp.safetensors` son byte a byte identicos al checkpoint INT8 sin adaptador; solo difieren las proyecciones adaptadas, cada elemento modificado exactamente en un paso INT8 (gate 5,6 %, up 5,5 %, q/k 3,4 %, o 2,8 %, v 2,4 %, down 2,1 % de elementos). Los ficheros de tokenizer provienen del adaptador (regla de pre-tokenizer mas reciente para marcas combinantes, mismo vocabulario) y la plantilla de chat es identica a la del modelo base.

## Capacidades

- Generacion de texto y codigo, con mejoras especificas en tareas de agente de programacion segun la evaluacion del adaptador.
- Soporte de tool calling verificado: `tool_choice` en modos auto, required, none y named, todos superados.
- Razonamiento multi-paso orientado a agentes: el adaptador se entreno con RL para el agente pi, con reduccion del numero de llamadas a herramientas por tarea (24,1 frente a 50,1 en la evaluacion propia).
- Capacidad de contexto largo: pasa una prueba de aguja en 32K tokens y se ejecuta con 262K de contexto en la configuracion medida.
- Aritmetica basica verificada.
- Vision: incluye torre de vision heredada del modelo base (identica byte a byte al checkpoint INT8 sin adaptador), aunque no se detallan capacidades multimodales especificas.
- Decodificacion especulativa: compatible con el drafter DFlash2 de QEngine (longitud media aceptada 2,43 en prosa y 5,04 en codigo).
- No se ha entrenado con modo thinking: el adaptador nunca vio thinking, por lo que debe usarse con thinking desactivado.

## Casos de uso

- Agente de codigo autonomo en terminal: el modelo esta adaptado especificamente para el agente pi y resuelve tareas de Terminal-Bench 2.1 con un 50 % de exito en la evaluacion propia (10/20 tareas), con 24,1 llamadas a herramientas por tarea de media. Adecuado para pipelines de resolucion automatica de incidencias en entornos de linea de comandos.
- Reparacion de bugs en repositorios (SWE-bench Pro): el adaptador reporta mejoras de 29,4 % a 62,7 % en la variante hard-51 medidas en BF16, lo que lo hace candidato para asistentes de parcheo de codigo en produccion, aunque la verificacion en INT8 es limitada (n=20).
- Integracion en IDE o CLI como asistente de programacion: con 240,4 tok/s en decodificacion de codigo en 2x RTX 3090, es viable para autocompletado y generacion de parches en tiempo interactivo.
- Automatizacion de tareas con tool calling: soporta los cuatro modos de `tool_choice` y no produjo llamadas malformadas en la evaluacion, por lo que sirve para orquestar APIs externas y herramientas internas en flujos de agente.
- Procesamiento de documentos largos: con 262K de contexto y prueba de aguja superada en 32K, puede emplearse para analisis de repositorios completos, revision de codigo sobre ficheros extensos o resumen de documentacion tecnica.
- Despliegue en hardware consumer de gama alta: al caber en 2-3 RTX 3090 con QEngine, permite montar un agente de codigo self-hosted sin depender de APIs externas, con coste de infraestructura controlado.
- Evaluacion comparativa de adaptadores: al estar publicado el checkpoint INT8 sin adaptador (bpx03), sirve como base para medir el efecto aislado de un LoRA fusionado sobre el mismo motor y formato.

## Benchmarks y rendimiento

Resultados medidos en 2x RTX 3090 con QEngine 1.3.6, drafter DFlash2, 15 slots y 262K de contexto:

| Metrica | Este modelo | Base INT8 (bpx03) |
|---|---|---|
| Decodificacion prosa, tok/s (single stream, 500 tokens) | 117,9 | 122,5 |
| Decodificacion codigo, tok/s (single stream, 500 tokens) | 240,4 | 243,9 |
| DFlash2 longitud media aceptada, prosa | 2,43 | no disponible |
| DFlash2 longitud media aceptada, codigo | 5,04 | no disponible |

Evaluacion propia de agente (Terminal-Bench 2.1, 20 tareas, seed 20261117, Harbor 0.26.0 con agente pi 1.5.2, `openai-completions`, thinking off, temperatura 0,8, presencia 0, 100 turnos, 1 h por tarea, 1 intento; ambas ramas INT8 sobre QEngine 1.3.6):

| Metrica | Este modelo | Base INT8 (bpx03) |
|---|---|---|
| Tareas resueltas | 10/20 (50 %) | 8/20 (40 %) |
| Llamadas a herramientas por tarea, media | 24,1 | 50,1 |
| Ejecuciones que alcanzan el limite de 100 turnos | 2 | 8 |

Prueba pareada: +3 tareas nuevas resueltas, -1 perdida (test de signos exacto p = 0,63). La direccion y la mayor parte de la reduccion de llamadas a herramientas (-52 % frente al -62 % de la model card del adaptador) se mantienen tras la conversion a INT8, pero n = 20 es demasiado pequeno para confirmar la mejora de +16 puntos reportada en la model card del adaptador. Las cifras de la model card del adaptador (Terminal-Bench 2.1 39,5 % → 55,8 %; SWE-bench Pro hard-51 29,4 % → 62,7 %) se midieron en BF16.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 31,6 GB en INT8; se ejecuta en 2-3 GPU RTX 3090 (24 GB cada una) con QEngine 1.3.6.
- GPU recomendadas: 2-3x RTX 3090 segun la model card; no se detallan otras configuraciones.
- Cabe en GPU consumer: si, en RTX 3090 (24 GB) en configuracion multi-GPU de 2 a 3 unidades.
- Opciones de despliegue: QEngine 1.3.6 (motor especifico del formato INT8 de bpx03), con soporte de drafter DFlash2 y 15 slots; tambien puede servirse con vLLM con parser de razonamiento (la model card menciona que vLLM elimina el preambulo de razonamiento). No se indica compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificacion de 117,9 tok/s en prosa y 240,4 tok/s en codigo en single stream con 2x RTX 3090; longitud media aceptada de decodificacion especulativa 2,43 (prosa) y 5,04 (codigo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Rendimiento agente |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-INT8-QEngine (este) | 27,36 B | 262K | INT8 W8A16 (QEngine) | Apache-2.0 | 10/20 Terminal-Bench 2.1 (INT8, eval propia) |
| bpx03/Qwen3.8-27B-INT8-QEngine | 27,36 B (mismo base) | no disponible | INT8 W8A16 (QEngine) | Apache-2.0 | 8/20 Terminal-Bench 2.1 (INT8, eval propia) |
| harness-hub/Qwen3.8-27B-pi-adapted | no disponible (adaptador LoRA) | no disponible | LoRA BF16 | Apache-2.0 | 55,8 % Terminal-Bench 2.1 (BF16, model card) |
| Qwen/Qwen3.8-27B | no disponible | no disponible | BF16 | Apache-2.0 | no disponible |

La comparativa directa mas informativa es contra el checkpoint INT8 sin adaptador (bpx03), ya que comparte exactamente el mismo pipeline de conversion y motor, y la unica diferencia es la fusion del LoRA. Frente al adaptador en BF16, las cifras no son directamente comparables por la diferencia de precision y de conjunto de evaluacion.

## Limitaciones y advertencias

- El adaptador no fue entrenado con modo thinking: debe usarse con thinking desactivado (`ENABLE_THINKING=false`); de lo contrario el comportamiento se desvia del entrenamiento.
- Requiere `QE_PRESENCE_PENALTY=0` (QEngine 1.3.6 usa 1,5 por defecto en peticiones sin thinking) y `--loop-guard-think 0` para evitar que QEngine fuerce un turno de razonamiento cuando el agente se repite.
- En pi debe configurarse `"api": "openai-completions"`, no la Responses API.
- Aproximadamente el 1 % de las respuestas empiezan con un preambulo corto de estilo razonamiento terminado en ``; con el parser de razonamiento de vLLM se elimina, pero QEngine con thinking off lo deja pasar.
- La evidencia de mejora en INT8 es limitada: la evaluacion propia usa solo 20 tareas y el test de signos exacto da p = 0,63, por lo que no confirma la mejora de +16 puntos reportada en BF16.
- Riesgo de alucinacion y sesgos: no se documentan sesgos conocidos ni evaluaciones de alucinacion en la informacion disponible.
- Idiomas soportados: no disponibles; no se especifica cobertura multilingue.
- Restricciones de licencia: Apache-2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y del adaptador, tambien Apache-2.0.
- Dependencia fuerte del ecosistema QEngine: el formato INT8 y `token_rank.bin` son especificos de ese motor, lo que limita la portabilidad a otros frameworks de inferencia.
- El checkpoint no produce `token_rank.bin` con la herramienta de conversion; se copia de otro repositorio, lo que introduce una dependencia externa en la cadena de build.

## Enlaces

- Hugging Face: https://huggingface.co/PichlerD/Qwen3.8-27B-pi-INT8-QEngine
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador LoRA: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Checkpoint INT8 de referencia: https://huggingface.co/bpx03/Qwen3.8-27B-INT8-QEngine
- Motor QEngine: https://github.com/bpx03/QEngine
- Agente pi: https://github.com/earendil-works/pi
