# SargeDev/Arete-27B-Uncensored-EXL3

## Resumen

Arete-27B-Uncensored-EXL3 es una variante "abliterated" (sin mecanismos de rechazo) del modelo NousResearch/Arete-27B, publicada por SargeDev. Arete-27B es a su vez un ajuste fino supervisado (SFT) de parametros completos sobre Qwen3.8-27B orientado a alineamiento de valores. Esta version elimina la direccion de rechazo mediante la herramienta OBLITERATUS en modo agresivo, con el objetivo de que el modelo responda a peticiones que el modelo base rechazaria.

El modelo se distribuye cuantizado en formato EXL3 a 4.0 bits por peso (con cabeza a 6 bpw y tensores MTP a 4 bpw), lo que reduce el peso en disco a 14,7 GiB. Aunque la nomenclatura del repositorio indica "27B", el recuento real de parametros en safetensors es de 7.863.204.864 (aproximadamente 7,86 mil millones), un dato que conviene tener en cuenta al planificar el despliegue.

La relevancia de esta ficha radica en que documenta un caso de estudio de "uncensoring" con mediciones de calidad explicitas: el autor reporta el coste en MMLU del proceso de abliteracion y compara distintas cuantizaciones. Esta pensado para investigadores que estudian seguridad de modelos, evaluacion de sesgos y comportamiento de rechazo, no para despliegues de produccion convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), tag `qwen3_5_text`; incluye tensores MTP/nextn para decodificacion especulativa |
| Parametros totales | 7.863.204.864 (segun safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4.0 bpw (cabeza 6 bpw, MTP 4 bpw); el autor menciona variantes comunitarias GGUF, EXL3 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3.8, segun el tag `qwen3_5_text` y la referencia del autor a la "stock Qwen3.8 head". El modelo base, NousResearch/Arete-27B, es un SFT de parametros completos sobre Qwen3.8-27B orientado a alineamiento de valores. Sobre esa base, SargeDev aplico OBLITERATUS con `--method aggressive` en bf16, usando un conjunto de contraste de 842 prompts de dano/inocuidad, y realizo una ablacion de la direccion de rechazo en 15 capas fuertes (las capas 59-63 son las mas afectadas).

El autor reporta las metricas de control de calidad posteriores a la edicion: coherencia 1.0, divergencia KL de 0.90 frente al base, y perplejidad que sube de 3.22 a 3.93 (incremento moderado). La suite de capacidades se mantiene intacta segun el autor. Los tensores del drafter MTP/nextn se preservan con la cabeza estandar de Qwen3.8, de modo que la decodificacion especulativa sigue funcionando. No se detalla el volumen de tokens de entrenamiento del SFT original ni la composicion del dataset, y no se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredados del SFT de Arete-27B sobre Qwen3.8-27B.
- Respuesta a peticiones que el modelo base rechazaria: el autor reporta 15/15 en una bateria de 15 prompts duros (desarrollo de exploits, red-team, malware, DoS) en bf16.
- Decodificacion especulativa mediante los tensores MTP/nextn preservados.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos: evaluar como responde un modelo abliterated frente a uno alineado en baterias de prompts de dano, usando el propio conjunto de contraste de 842 prompts como referencia metodologica.
- Estudio de mecanismos de rechazo: analizar el efecto de la ablacion de la direccion de rechazo en 15 capas concretas comparando perplejidad (3.22 frente a 3.93) y coherencia con el modelo base.
- Evaluacion de cuantizaciones: comparar la degradacion de MMLU entre bf16, NVFP4-FP8, GGUF Q8_0 y EXL3 4.0 bpw para caracterizar el coste de cada formato.
- Red-teaming controlado en entornos aislados: generar respuestas a prompts de explotacion y malware en un sandbox para alimentar clasificadores de seguridad o sistemas de deteccion.
- Analisis de sesgos y propaganda: el autor publica una variante V2 con una evaluacion especifica de censura y propaganda (fact score 2.61/5, propaganda 1.1%), util para estudiar como el ajuste altera la respuesta a narrativas de Estado.
- Despliegue en hardware limitado para experimentacion: con 14,7 GiB en EXL3 4.0 bpw y 48,2 tok/s de decodificacion en el motor exllamav3, cabe en GPUs de consumo de gama alta para pruebas de laboratorio.

## Benchmarks y rendimiento

| Formato | MMLU (subconjunto generativo de 8 materias, 400 preguntas, 5-shot, greedy) | Arnes |
|---|---|---|
| bf16 (este repo) | 79.0% | lm-eval chat-completions |
| NVFP4-FP8 | 79.8% | lm-eval chat-completions |
| GGUF Q8_0 | 79.0% | lm-eval chat-completions via llama-server |
| EXL3 4.0 bpw | 72.5% | motor exllamav3 (arnes propio) |
| Arete-27B original (referencia) | 81.25% | lm-eval chat-completions |

El autor indica que la abliteracion cuesta aproximadamente 2 puntos de MMLU, dentro del ruido entre ejecuciones (n=400, error estandar aproximado del 2%). La caida de EXL3 (6,5 puntos) procede de un arnes distinto (exllamav3 no tiene servidor compatible con OpenAI), por lo que parte de la diferencia es atribuible al arnes y parte a la cuantizacion; el autor recomienda tomar 72,5% como cota superior del coste de calidad de EXL3.

Rendimiento medido en este formato: EXL3 4.0 bpw ocupa 14,7 GiB y decodifica a 48,2 tok/s con el motor exllamav3.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,7 GiB para EXL3 4.0 bpw, segun el autor; hay que anadir el espacio de cache KV, que depende del contexto y no se especifica.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, encaja en GPUs con 16-24 GiB de VRAM.
- GPU de consumo: si, en tarjetas con al menos 16 GiB (por ejemplo, RTX 4080/4090 o equivalentes), asumiendo que la cache KV quepa en el margen restante.
- Opciones de despliegue: motor exllamav3 (unico verificado por el autor para este formato); el autor menciona variantes comunitarias en GGUF (compatibles con llama.cpp/llama-server) y NVFP4.
- Latencia y throughput: 48,2 tok/s de decodificacion en EXL3 4.0 bpw con exllamav3; no se reportan datos de prefill ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (mismo subconjunto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-EXL3 (este) | 7.863.204.864 reales | no disponible | 72.5% (EXL3) / 79.0% (bf16) | apache-2.0 | Hugging Face |
| NousResearch/Arete-27B | no disponible | no disponible | 81.25% | no disponible en la informacion | Hugging Face |
| Arete-27B-Uncensored-V2 | no disponible | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Qwen3.8-27B (arquitectura base) | no disponible | no disponible | no disponible | no disponible en la informacion | no disponible |

## Limitaciones y advertencias

- El proceso de abliteracion elimina deliberadamente los rechazos: el modelo entrega respuestas a prompts de desarrollo de exploits, malware y DoS (15/15 en la bateria del autor). No es apto para despliegues publicos sin filtros externos.
- El autor reconoce un coste de calidad de aproximadamente 2 puntos de MMLU por la abliteracion, con un error estandar del 2% en una muestra de 400 preguntas.
- La cifra de EXL3 (72,5%) procede de un arnes distinto y puede sobreestimar el coste real de la cuantizacion; conviene tratarla como cota superior.
- El nombre del repositorio indica 27B, pero el recuento real en safetensors es de 7.863.204.864 parametros; verificar antes de dimensionar infraestructura.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto, sesgos especificos ni tasas de alucinacion.
- La licencia apache-2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o las politicas de las plataformas de despliegue; la responsabilidad recae en el operador.
- El autor advierte de un artefacto de muestreo en una celda (phish-kit) en una cuantizacion concreta, verificado como entrega en reintento y no como rechazo; el comportamiento puede variar entre cuantizaciones.
- Existe una V2 con entrenamiento de decision Solar fusionado y evaluacion de censura/propaganda; para casos que requieran ese perfil conviene evaluar esa variante.

## Enlaces

- Hugging Face: https://huggingface.co/SargeDev/Arete-27B-Uncensored-EXL3
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Variante V2: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
