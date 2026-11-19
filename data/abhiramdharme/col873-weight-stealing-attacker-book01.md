# abhiramdharme/col873-weight-stealing-attacker-book01

## Resumen

`abhiramdharme/col873-weight-stealing-attacker-book01` es un adaptador LoRA (con rango estabilizado, rsLoRA) entrenado sobre el modelo base `meta-llama/Llama-3.2-1B`. No es un modelo completo, sino un conjunto de pesos delta (~0,2 GB en safetensors) que se acopla al transformer de 1.240 millones de parametros de Llama 3.2 1B. Lo publica el usuario `abhiramdharme` en el marco del proyecto de curso COL873 / ELL8299 / COL8383, titulado *"How Secure is Your Specialized Knowledge? An Investigation into Weight-Stealing Attacks and Defenses in Multi-Agent LLM Systems"*.

El adaptador se presenta explicitamente como un "attacker LoRA": su proposito no es ofrecer un asistente generalista, sino servir como artefacto de investigacion en seguridad de IA, concretamente para estudiar ataques de robo de pesos (weight-stealing) en sistemas LLM multiagente. Se ha afinado sobre el contenido de un libro de texto, *Theories of Personality* (identificado como "Book 01"), y su evaluacion se compara contra un segundo libro ("Book 02", *Psychotherapy*) para medir transferencia y especificidad del conocimiento inyectado.

Es relevante ahora porque ejemplifica una linea de trabajo emergente: la extraccion de conocimiento especializado mediante adaptadores y la necesidad de defensas frente a la exfiltracion de pesos en despliegues multiagente. El modelo base Llama 3.2 1B, con 128.000 tokens de contexto y licencia Llama 3.2, aporta el sustrato sobre el que se monta el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) con adaptador LoRA rsLoRA sobre las 7 capas lineales |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 1.240 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador; el modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango r=32, alpha=16 y configuracion rsLoRA (rank-stabilized LoRA), aplicado a las 7 capas lineales del transformer de Llama 3.2 1B. El uso de rsLoRA estabiliza el entrenamiento a rangos relativamente altos (32), lo que permite mayor capacidad de adaptacion sin el desajuste de escala tipico de LoRA estandar. El repositorio ocupa 0,2 GB, coherente con un delta de pesos de este rango sobre un modelo de 1B.

El entrenamiento se realizo sobre el contenido del libro *Theories of Personality*, con una particion de evaluacion del 5% (held-out). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF/DPO o ajuste supervisado adicional. El proyecto se enmarca en el estudio de ataques de robo de pesos en sistemas multiagente, por lo que el adaptador se concibe como el componente "atacante" que intenta capturar conocimiento especializado del libro.

## Capacidades

- Generacion de texto condicionada al contenido del libro *Theories of Personality* (teorias de la personalidad).
- Respuesta a preguntas de opcion multiple diagnostica sobre el dominio entrenado (Book 01) y evaluacion de transferencia al dominio Book 02 (psicoterapia).
- Adaptacion PEFT cargable con `peft.PeftModel.from_pretrained` sobre `meta-llama/Llama-3.2-1B`.
- Capacidades heredadas del modelo base Llama 3.2 1B (generacion de texto, razonamiento basico, multilingue limitado), aunque no se documentan explicitamente para este adaptador.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion en seguridad de IA: servir como artefacto de ataque en experimentos de robo de pesos (weight stealing) para medir cuanto conocimiento especializado puede extraerse de un adaptador LoRA en un sistema multiagente.
- Evaluacion de defensas: usar el adaptador como "atacante" de referencia y comparar la eficacia de contramedidas (deteccion de extraccion, perturbacion de pesos, auditoria de proyecciones) frente a el.
- Auditoria de adaptadores: el propio model card reporta una auditoria firmada sobre `down_proj` (Top-4 Signed Audit: +0.016), util para estudiar si el delta de pesos contiene senales detectables de conocimiento inyectado.
- Estudio de transferencia de dominio: comparar la perplejidad en Book 01 (4,484) frente a Book 02 (11,334) para analizar como un adaptador especializado generaliza o no a dominios vecinos.
- Reproduccion academica: base para replicar el experimento COL873/ELL8299/COL8383 en cursos de seguridad de LLM y sistemas multiagente.
- Pruebas de concepto de filtracion de conocimiento: demostrar en entornos controlados como un adaptador de bajo coste (~0,2 GB) puede capturar contenido textual especializado de un libro de texto.

## Benchmarks y rendimiento

Resultados reportados en el model card sobre particiones held-out del 5%:

| Metrica | Book 01 (Personality) | Book 02 (Psychotherapy) |
|---|---|---|
| Perplejidad (PPL) | 4,484 | 11,334 |
| Precision MCQA diagnostica | 68,75% | 75,00% |
| down_proj Top-4 Signed Audit | +0,016 | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade ~0,2 GB sobre el modelo base; Llama 3.2 1B en fp16 requiere ~2,5 GB, por lo que el conjunto completo cabe en GPUs consumer de 4-6 GB.
- GPU recomendadas: RTX 3060/4060 (8 GB) o superiores para fp16; cualquier GPU con >=4 GB para cuantizacion 4-bit del modelo base.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con >=6 GB.
- Opciones de despliegue: `transformers` + `peft` (via `PeftModel.from_pretrained`); el modelo base puede servirse con vLLM, llama.cpp u Ollama, aunque la carga del adaptador LoRA depende del soporte de cada backend (vLLM soporta LoRA, llama.cpp soporta adaptadores en GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| col873-weight-stealing-attacker-book01 | Adaptador sobre 1,24B | No disponible (base: 128k) | LoRA rsLoRA (r=32) | llama3.2 | Hugging Face |
| meta-llama/Llama-3.2-1B | 1,24B | 128.000 tokens | Modelo completo | llama3.2 | Hugging Face |
| meta-llama/Llama-3.2-3B | 3,21B | 128.000 tokens | Modelo completo | llama3.2 | Hugging Face |
| Adaptadores LoRA genericos sobre Llama 3.2 1B | Variable (segun r) | Depende del base | LoRA | Segun autor | Hugging Face |

La comparativa directa con otros adaptadores de seguridad o de dominio no esta disponible en la informacion proporcionada; los modelos de la tabla son alternativas de la misma familia y tamano.

## Limitaciones y advertencias

- Artefacto de investigacion: no esta pensado como asistente de produccion; su dominio es un unico libro de texto y su calidad fuera de ese dominio no esta evaluada.
- Riesgo de alucinacion: como adaptador sobre un modelo de 1B, la fidelidad factual fuera del corpus de entrenamiento es limitada; no se han publicado evaluaciones de alucinacion.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los sesgos del modelo base Llama 3.2 1B y del corpus del libro.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados; el contexto efectivo depende del modelo base (128k), no del adaptador.
- Restricciones de licencia: licencia Llama 3.2, que impone condiciones de uso (incluida la politica de uso aceptable de Meta) y requiere cumplimiento al redistribuir o desplegar comercialmente.
- Caveat de produccion: el uso de un "attacker LoRA" en sistemas reales puede contravenir politicas de seguridad; debe limitarse a entornos controlados y con fines de investigacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/abhiramdharme/col873-weight-stealing-attacker-book01
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Libreria PEFT: https://github.com/huggingface/peft
- rsLoRA (paper): https://arxiv.org/abs/2312.03732
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
