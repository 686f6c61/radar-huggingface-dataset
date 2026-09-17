# jatshi/trusted-full-duplex-agent

## Resumen

`jatshi/trusted-full-duplex-agent` no es un modelo de lenguaje completo, sino un repositorio de adaptadores LoRA (formato PEFT, safetensors) y de registros de experimentos de alineamiento por RL sobre dos modelos base distintos: `Qwen/Qwen2.5-1.5B-Instruct` (~1,5B parametros) y `openbmb/MiniCPM-o-4_5` (~9B parametros segun la propia model card). El objetivo del proyecto es construir un agente de voz full-duplex con guardrails de confianza a nivel de sistema: decision de turno de palabra a nivel de trama, gestion de interrupciones (barge-in) y alineamiento mediante GRPO para que el modelo recuerde correctamente el contenido que estaba reproduciendo cuando el usuario lo interrumpe.

La relevancia del repositorio es metodologica mas que de producto: documenta un bucle cerrado completo ("detectar debilidad -> sintetizar datos -> definir recompensa con la misma metrica que la evaluacion -> aplicar RL -> medir mejora") y publica tanto resultados positivos como negativos. Destaca el caso de Qwen2.5-1.5B-Instruct, que pasa de 0,301 a 0,484 de `context_recall` (+0,184) en solo 20 pasos de GRPO, frente a MiniCPM-o 9B, que ya parte cerca del techo (0,52-0,69) y se degrada con el mismo procedimiento ligero. Se incluyen ademas ficheros `poc_result.json` por ejecucion con el barrido de learning rate y anclaje KL.

El repositorio tiene 1,6 GB, licencia Apache 2.0, idiomas declarados chino e ingles (zh, en) y pipeline `any-to-any`. En el momento de la consulta registra 0 descargas y 0 "likes", y fue creado el 17 de septiembre de 2026, por lo que se trata de material de investigacion muy reciente y sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre modelos causales transformer: Qwen2.5-1.5B-Instruct y MiniCPM-o 4.5; sistema de agente de voz full-duplex con guardrails de streaming |
| Parametros totales | No disponible para los adaptadores. Modelos base: ~1,5B (Qwen2.5-1.5B-Instruct) y ~9B (MiniCPM-o 4.5, segun la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador. El modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | No disponible (adaptadores LoRA en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA, con `poc_result.json` por ejecucion) |

## Arquitectura y entrenamiento

El repositorio no introduce una arquitectura nueva: son adaptadores LoRA entrenados con GRPO (Group Relative Policy Optimization) sobre modelos causales ya existentes. El sistema descrito es un agente de voz full-duplex sobre MiniCPM-o 4.5 con tres componentes funcionales: guardrails de confianza en streaming, decision de turno de palabra a nivel de trama y gestion de barge-in (interrupcion del usuario mientras el bot habla). Los checkpoints publicados cubren dos tareas: *barge-in context recall* (recuperar que parte del turno del bot se habia reproducido realmente antes de la interrupcion) y *turn-taking alignment*.

La innovacion metodologica principal es el diseno de la recompensa: `context_recall` se define como la similitud de Jaccard sobre bigramas de caracteres entre el recuerdo generado y el turno del bot que efectivamente se reprodujo (parcialmente). Al usar el mismo denominador por union, alucinar contenido que nunca se reprodujo se penaliza de forma automatica, y la metrica de entrenamiento coincide exactamente con la de evaluacion. Los datos de entrenamiento provienen del dataset `jatshi/trusted-full-duplex-agent-data`: 60 muestras de contexto de barge-in (5 topicos x 3 puntos de truncado x 4 formulaciones de interrupcion) mas 300 muestras de guardrail de turn-taking.

Los resultados del barrido publicados en la model card son: `rl_ckpt_qwen15_bargein` (lr 5e-5, 20 pasos) con `context_recall` 0,301 -> 0,484 y recompensa +0,156; `rl_ckpt_minicpmo9b_bargein` (lr 1e-5, 20 pasos) con 0,688 -> 0,649, dentro del ruido de evaluacion estimado en +-0,08; `rl_ckpt_minicpmo9b_bargein_lr5e6` (lr 5e-6, 40 pasos) con 0,522 -> 0,374, que el autor identifica explicitamente como degradacion real (resultado negativo honesto); y `rl_ckpt_minicpmo9b_lr1e5` (turn-taking, lr 1e-5, 20 pasos) con recompensa +0,015 usando ancla KL. El autor calibra el ruido de evaluacion con dos pre-evaluaciones de la misma base 9B (0,688 y 0,522 sobre 32 muestras con `do_sample`). Tambien documenta una brecha de modalidad: el auto-recuerdo sobre tokens de audio en streaming real da 0,089 de bigramas frente a 0,69 en contexto de texto, lo que motiva el protocolo `set_break` (reinyectar el evento de interrupcion y el contexto de audio completo).

## Capacidades

- Recuerdo de contexto interrumpido (barge-in): el adaptador de Qwen2.5-1.5B se entrena especificamente para reconstruir el fragmento del turno del bot que ya se habia emitido cuando el usuario interrumpe.
- Decision de turno de palabra (turn-taking): el checkpoint `rl_ckpt_minicpmo9b_lr1e5` se alinea para decidir cuando ceder o mantener el turno, con ancla KL durante el entrenamiento.
- Alineamiento por RL: la infraestructura de recompensa (GRPO con `context_recall` como metrica) es reutilizable para otros objetivos de alineamiento medibles por similitud de texto.
- Procesamiento any-to-any: heredado del pipeline declarado (entrada/salida que incluye audio y texto), no una capacidad implementada por el adaptador.
- Guardrails de seguridad de nivel de sistema: las 300 muestras de guardrail de turn-taking apuntan a comportamiento de confianza en conversaciones en streaming.
- Capacidades multilingues limitadas: unicamente chino e ingles declarados; no hay soporte declarado de castellano.
- Tool calling / function calling: no disponible; no se documenta soporte de llamada a herramientas en la model card.
- Razonamiento multi-paso general, codigo o matematicas: no disponibles como capacidad propia del adaptador; dependerian exclusivamente del modelo base.

## Casos de uso

- Investigacion en agentes de voz full-duplex: reproducir el bucle completo publicado (detectar debilidad, sintetizar datos, recompensa con la misma metrica, GRPO, evaluacion) sobre un modelo propio para validar el metodo antes de escalarlo a produccion.
- Asistentes de voz con interrupciones frecuentes: en un asistente telefonico donde el usuario corta al bot a mitad de frase, el adaptador de Qwen2.5-1.5B permite reconstruir que informacion ya se dijo y evitar repetirla o contradecirla.
- Evaluacion de turn-taking en sistemas de dialogo: usar el checkpoint de MiniCPM-o 9B y el protocolo de evaluacion (32 muestras, `do_sample`, banda de ruido +-0,08) como banco de pruebas para medir politicas de cesion de turno.
- Analisis de regresion por RL: el resultado negativo documentado (0,522 -> 0,374 con lr 5e-6 y 40 pasos) sirve como caso de estudio sobre cuantos pasos y que learning rate degradan un modelo base ya cercano al techo.
- Generacion de datos sinteticos de barge-in: replicar la receta del dataset (5 topicos x 3 puntos de truncado x 4 formulaciones de interrupcion = 60 muestras) para crear corpus de evaluacion propios de interrupcion conversacional.
- Guardrails conversacionales en atencion al cliente automatizada: las 300 muestras de guardrail de turn-taking son un punto de partida para entrenar politicas que eviten respuestas incoherentes cuando el contexto de audio se reinyecta tras una interrupcion.
- Auditoria de fidelidad en agentes de voz: el uso de `context_recall` con denominador por union permite cuantificar la tasa de alucinacion de contenido no reproducido en pruebas A/B de barge-in.
- Base para experimentos de RL ligero en hardware modesto: con Qwen2.5-1.5B-Instruct, 20 pasos de GRPO y LoRA son suficientes para reproducir una mejora medible (+0,184) en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es `context_recall` (Jaccard de bigramas de caracteres) en las pruebas internas del autor:

| Checkpoint | Base | Tarea | lr / pasos | context_recall | Variacion |
|---|---|---|---|---|---|
| `rl_ckpt_qwen15_bargein` | Qwen2.5-1.5B-Instruct | Barge-in context recall | 5e-5 / 20 | 0,301 -> 0,484 | +0,184 (recompensa +0,156) |
| `rl_ckpt_minicpmo9b_bargein` | MiniCPM-o 4.5 (llm) | Barge-in context recall | 1e-5 / 20 | 0,688 -> 0,649 | -0,039 (dentro del ruido +-0,08) |
| `rl_ckpt_minicpmo9b_bargein_lr5e6` | MiniCPM-o 4.5 (llm) | Barge-in context recall | 5e-6 / 40 | 0,522 -> 0,374 | -0,148 (degradacion real) |
| `rl_ckpt_minicpmo9b_lr1e5` | MiniCPM-o 4.5 (llm) | Turn-taking alignment | 1e-5 / 20 | No disponible | Recompensa +0,015 con ancla KL |

Datos adicionales de atribucion por modalidad reportados por el autor: auto-recuerdo sobre tokens de audio en streaming real = 0,089 de bigramas, frente a 0,69 de recuerdo sobre contexto de texto. Calibracion de ruido de evaluacion: la misma base 9B puntuo 0,688 y 0,522 en dos pre-evaluaciones (32 muestras, `do_sample`), lo que situa el ruido de una unica evaluacion en +-0,08.

## Requisitos de hardware

- Adaptadores LoRA sobre Qwen2.5-1.5B-Instruct: estimacion de ~3,5-4 GB de VRAM en bfloat16 (pesos del base ~3,1 GB mas cache KV y overhead de activaciones); cabe con holgura en GPU de consumo de 6-8 GB (RTX 3060, RTX 4060, RTX 2070).
- Adaptadores LoRA sobre MiniCPM-o 4.5 (~9B): estimacion de ~18-20 GB de VRAM en bfloat16 para los pesos del base mas cache KV, encoders de audio e imagen y overhead; requiere GPU de 24 GB (RTX 3090, RTX 4090, A5000) o cuantizacion adicional.
- GPU profesionales: A100 40/80 GB, H100 y L40S son opciones sobradas incluso para el base de ~9B y permiten lotes mayores o varias sesiones concurrentes.
- Inferencia en CPU: el ejemplo de la model card usa `transformers` con `torch_dtype="bfloat16"`, por lo que no hay ruta optimizada de CPU documentada.
- Opciones de despliegue: la ruta documentada es `peft.PeftModel.from_pretrained` sobre `transformers`. No hay pesos GGUF publicados, ni instrucciones para llama.cpp u Ollama. vLLM y TGI soportan adaptadores LoRA de forma generica, pero no se documenta compatibilidad verificada en este repositorio.
- Latencia y throughput: no disponible. La model card no publica mediciones de latencia por trama, tiempo hasta el primer token ni muestras por segundo.
- Almacenamiento: el repositorio completo ocupa 1,6 GB e incluye varios checkpoints, por lo que conviene descargar solo el subfolder del checkpoint necesario (`subfolder=` en `PeftModel.from_pretrained`).

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jatshi/trusted-full-duplex-agent` (este repo) | Adaptadores LoRA; bases de ~1,5B y ~9B | No disponible (base Qwen2.5-1.5B: 32.768 tokens) | `context_recall` 0,484 (1,5B) y 0,649-0,688 (9B) | Apache 2.0 | HuggingFace, 0 descargas, 1,6 GB |
| `Qwen/Qwen2.5-1.5B-Instruct` (base) | ~1,5B | 32.768 tokens nativos | No disponible en esta informacion | No disponible | HuggingFace |
| `openbmb/MiniCPM-o-4_5` (base) | ~9B segun la model card | No disponible | `context_recall` pre-RL: 0,522 y 0,688 en dos pre-evaluaciones | No disponible | HuggingFace |
| Otros agentes de voz full-duplex del mercado | No disponible | No disponible | No disponible | No disponible | No se han consultado datos verificables en la informacion disponible |

No se dispone de datos verificables en la informacion proporcionada para comparar con alternativas de la misma categoria (agentes de voz full-duplex de otros autores), por lo que la comparativa se limita a los dos modelos base declarados por el propio repositorio.

## Limitaciones y advertencias

- No es un modelo autonomo: son adaptadores LoRA que requieren descargar y cargar el modelo base correspondiente; sin el base no hay inferencia posible.
- Resultados negativos sin resolver: con MiniCPM-o 9B el RL ligero degrada el rendimiento (0,522 -> 0,374 con lr 5e-6 y 40 pasos) y el autor reconoce que un ancla KL de 0,1 es insuficiente.
- Ruido de evaluacion elevado: +-0,08 en una unica evaluacion con 32 muestras y `do_sample`; cualquier delta menor que esa banda no deberia interpretarse como mejora o degradacion real.
- Brecha de modalidad no cerrada: el recuerdo sobre tokens de audio reales (0,089) esta muy por debajo del recuerdo sobre contexto de texto (0,69), por lo que el comportamiento en streaming de audio real dista del medido en el laboratorio.
- Datos de entrenamiento muy reducidos: 60 muestras de barge-in y 300 de guardrail de turn-taking; el riesgo de sobreajuste a los topicos y formulaciones concretos del dataset es alto y no hay validacion cruzada publicada.
- Idiomas limitados a chino e ingles: no hay soporte declarado de castellano ni de otros idiomas, lo que restringe su uso directo en produccion en Espana sin datos adicionales.
- Sesgos: no se documentan analisis de sesgos demograficos, acusticos ni dialectales; tampoco hay evaluacion con hablantes no nativos o con acentos distintos de los del corpus.
- Riesgo de alucinacion en el recuerdo: aunque la recompensa por union penaliza el contenido no reproducido, el modelo sigue siendo un LLM generativo y puede reconstruir fragmentos plausibles que nunca se emitieron.
- Licencia Apache 2.0 en el adaptador: permite uso comercial del artefacto, pero conviene verificar las licencias de los modelos base (`Qwen/Qwen2.5-1.5B-Instruct` y `openbmb/MiniCPM-o-4_5`), que no se detallan en la informacion disponible.
- Adopcion nula verificable: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion externa ni resultados replicados por terceros.
- Sin garantias de produccion: no hay pesos cuantizados, mediciones de latencia, pruebas de carga ni pipeline de despliegue documentado mas alla del ejemplo con `peft` y `transformers`.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo: consisten en paginas de soporte de Microsoft (cuenta, Exchange, frecuencia de refresco de monitor) sin relacion con el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jatshi/trusted-full-duplex-agent
- Dataset de entrenamiento: https://huggingface.co/datasets/jatshi/trusted-full-duplex-agent-data
- Codigo y registros de experimentos (GitHub): https://github.com/Jatshi/trusted-full-duplex-agent
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base MiniCPM-o 4.5: https://huggingface.co/openbmb/MiniCPM-o-4_5
