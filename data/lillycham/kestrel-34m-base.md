# lillycham/Kestrel-34M-base

## Resumen

Kestrel-34M-base es un modelo de lenguaje de pequeno tamano (SLM) de 34,3 millones de parametros desarrollado por lillycham y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo base (no afinado por instrucciones) entrenado desde cero con una arquitectura experimental denominada Looped Titans-MAG, que combina un transformer con nucleo en bucle (looped transformer) y una memoria neuronal troceada (chunked neural memory) junto con atencion de ventana deslizante. El objetivo del proyecto es explorar arquitecturas alternativas de bajo coste computacional que incorporen memoria recurrente explicita sin disparar el numero de parametros.

La relevancia del modelo es fundamentalmente de investigacion: con solo ~819 millones de tokens de entrenamiento y una ventana de atencion de 256 tokens, sus metricas de evaluacion son bajas (indice de inteligencia Open SLM de 8,55; hellaswag 26,6%; arc_easy 42,1%), lo que lo situa lejos de los SLM de proposito general de su misma escala. Su interes radica en la innovacion arquitectonica (memoria Titans, bucle de 3 iteraciones sobre un nucleo de 4 capas) y en servir de base para experimentacion sobre modelos recurrentes y de memoria, mas que como modelo listo para produccion.

El modelo usa un tokenizador BPE a nivel de byte con vocabulario de 16.384 entradas, hidden size de 512, 4 cabezas de memoria de 64 elementos por trozo y esta pensado para ejecutarse en transformers con `trust_remote_code=True` y codigo personalizado (`KestrelForCausalLM`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Titans-MAG (prelude=1, core=4 x 3 loops, coda=1) con chunked neural memory + sliding-window attention |
| Parametros totales | 34.262.272 (~34,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de atencion de 256 tokens; secuencia de entrenamiento de 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF/AWQ/GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Vocabulario | 16.384 (BPE a nivel de byte) |
| Hidden size | 512 |
| Memoria (heads / chunk) | 4 cabezas / 64 elementos por trozo |
| Etapa | pretraining base (25.000 pasos, ~819 M tokens) |
| Libreria | transformers (custom code) |

## Arquitectura y entrenamiento

La arquitectura es un Looped Titans-MAG: un prelude transformer convencional, un nucleo (core) de 4 capas que se ejecuta 3 veces en bucle (12 pasos efectivos de computo sobre 4 capas de parametros), y una coda final. Incorpora dos mecanismos clave: memoria neuronal troceada (chunked neural memory) con 4 cabezas y trozos de 64 elementos, que aporta un estado de memoria recurrente que no crece con la longitud de la secuencia, y atencion de ventana deslizante con ventana de 256 tokens, lo que limita el coste de atencion pero tambien el alcance contextual efectivo.

El entrenamiento se realizo durante 25.000 pasos con batch size 8 y acumulacion de gradiente 4, secuencia de 1024 tokens, precision bf16 en CUDA y una combinacion de optimizadores Muon (lr=0,02) y AdamW (lr=0,001) con weight decay 0,01. El total de tokens vistos ronda los 819 millones, una cifra muy reducida para estandares actuales, lo que explica en parte las metricas modestas. No se documenta el uso de RLHF, DPO ni afinado por instrucciones: es un modelo estrictamente base. La innovacion principal es el diseno de memoria Titans dentro de un transformer en bucle, orientado a reducir parametros manteniendo capacidad de memoria a largo plazo.

## Capacidades

- Generacion de texto autoregresiva basica a continuacion de un prompt.
- Razonamiento de sentido comun y comprension lectora limitada (metricas por debajo del azar en varias tareas, ver benchmarks).
- Aritmetica muy basica (arithmark3 en torno al 33%, apenas por encima del azar en tareas simples).
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Soporte de tool calling / function calling: no documentado, no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo base no esta disenado para ello.
- Capacidades multilingues: no documentadas; el tokenizador es byte-level, por lo que puede representar cualquier idioma, pero no se ha evaluado su competencia.
- Plantilla de chat disponible via `apply_chat_template`, aunque al ser un modelo base la calidad conversacional no esta garantizada.

## Casos de uso

- Investigacion en arquitecturas recurrentes: servir como punto de partida para estudiar memorias neuronales tipo Titans y transformers en bucle, comparando su comportamiento frente a transformers convencionales de igual parametraje.
- Experimentacion con memoria de largo plazo: el mecanismo de chunked neural memory permite estudiar como un modelo pequeno mantiene estado entre pasos sin aumentar el contexto de atencion.
- Ablaciones de entrenamiento a bajo coste: con 34 M de parametros y secuencias de 1024 tokens, es viable entrenar variantes completas en una sola GPU de consumo (por ejemplo, RTX 4090) para probar cambios de hiperparametros.
- Prototipado de pipelines de transformers con codigo personalizado: util para validar integraciones de `trust_remote_code=True`, carga de safetensors y plantillas de chat en entornos controlados.
- Educacion y divulgacion: modelo didactico para explicar tokenizacion BPE, atencion con ventana deslizante y optimizadores Muon/AdamW en un caso real y reproducible.
- Base para afinado ligero (LoRA/QLoRA) en tareas muy acotadas: clasificacion de texto corto, etiquetado o generacion de plantillas fijas en dominios restringidos, dado su bajo coste de inferencia.

## Benchmarks y rendimiento

| Benchmark | Resultado | Normalizado |
|---|---|---|
| Open SLM intelligence index | 8,55 (raw 9,29) | - |
| hellaswag | 26,6% | 25,7% |
| arc_easy | 42,1% | 39,6% |
| arc_challenge | 18,9% | 22,3% |
| piqa | 58,7% | 57,6% |
| arithmark3 | 33,2% | 33,4% |
| Perdida de validacion (step 25000) | 3,230 | - |
| Perdida de entrenamiento (step 25000) | 3,263 | - |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible. Los valores anteriores proceden de la model card del autor y corresponden a un modelo base de 34 M de parametros; varios resultados estan proximos o por debajo del azar, lo que refleja el escaso volumen de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16/fp16 (34 M de parametros ≈ 68 MB de pesos) y en torno a 35-70 MB en cuantizaciones de 8/4 bits, aunque no hay cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU moderna; funciona en CPU sin problemas. Para entrenamiento o experimentacion, una RTX 4090 o incluso una GPU de gama media es suficiente.
- Cabe holgadamente en GPU de consumo (RTX 3060, 4060, 4090) e incluso en entornos integrados si se usa CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada. No hay soporte confirmado para vLLM, llama.cpp, Ollama o TGI, ya que la arquitectura es personalizada y no existen pesos GGUF.
- Latencia y throughput: no disponibles; con 34 M de parametros y ventana de 256 tokens se espera una latencia muy baja, pero no hay mediciones publicadas.
- Requisitos de entrenamiento (referencia): bf16 en CUDA, batch 8, grad_accum 4, secuencia 1024; asumible en una sola GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Kestrel-34M-base | 34,3 M | 256 (atencion) / 1024 (entrenamiento) | MIT | Base, modelo de investigacion | Arquitectura Looped Titans-MAG con memoria neuronal |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Base e instruct | Transformer convencional, mas tokens de entrenamiento |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Base e instruct | Mayor escala y contexto, metricas muy superiores |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Base e instruct | Estandar de SLM con millones de descargas |

La comparativa es orientativa: Kestrel-34M-base no compite en rendimiento con SLM de proposito general (sus benchmarks estan proximos al azar), sino en interes arquitectonico. Las cifras de SmolLM, Qwen2.5 y TinyLlama proceden de sus model cards publicas y no de una evaluacion directa conjunta; no disponible para una comparacion homogenea bajo el mismo harness.

## Limitaciones y advertencias

- Modelo base sin afinado por instrucciones ni alineamiento: no es adecuado para uso conversacional directo ni para produccion sin afinado posterior.
- Metricas muy bajas: varios benchmarks estan en el nivel del azar o por debajo, lo que indica una calidad generativa muy limitada.
- Ventana de atencion de 256 tokens: el contexto efectivo es corto y el modelo no puede manejar documentos largos.
- Entrenamiento con solo ~819 M tokens: insuficiente para una cobertura linguistica o de conocimiento amplia; alto riesgo de alucinacion y de texto incoherente.
- Sesgos: no hay evaluacion de sesgos publicada; al entrenarse con datos no documentados, pueden existir sesgos desconocidos.
- Idiomas: no se ha evaluado el rendimiento multilingue; el tokenizador byte-level lo permite tecnicamente, pero no hay garantias.
- Licencia MIT: permite uso comercial, pero el modelo llega sin garantias y su calidad no lo hace apto para produccion sin trabajo adicional.
- Dependencia de codigo personalizado (`trust_remote_code=True`): implica ejecutar codigo del repositorio; conviene auditar el codigo antes de cargarlo en entornos sensibles.
- Ecosistema limitado: sin pesos GGUF ni integraciones en frameworks de inferencia populares; el despliegue requiere transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lillycham/Kestrel-34M-base
- Repositorio GitHub del proyecto: https://github.com/lillycham/kestrel
- Paper de Titans (memoria neuronal): no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
