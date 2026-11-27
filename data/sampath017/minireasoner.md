# sampath017/MiniReasoner

## Resumen

MiniReasoner es un modelo de lenguaje de tipo decoder-only construido desde cero en PyTorch por el desarrollador sampath017. Con 32,05 millones de parametros, se trata de un experimento de investigacion centrado en demostrar que un transformer de juguete puede aprender razonamiento aritmetico con cadena de pensamiento (chain-of-thought) mediante supervised fine-tuning (SFT), partiendo de un preentrenamiento en un corpus narrativo sintetico.

El modelo se preentrena sobre el dataset SimpleStories (853,5 millones de tokens, 26.047 pasos) para adquirir fluidez en ingles narrativo y despues se ajusta sobre el dataset propio MiniReasoner-arith-v3 (10.000 pasos) con un 10 % de replay de historias para no perder la capacidad generativa. El checkpoint publicado es el ganador de la fase 6 y alcanza un 97,35 % de pasos estrictos en la particion de test sellada de aritmetica (6.002 filas), manteniendo una perplejidad de 3,31 en SimpleStories.

Su relevancia es fundamentalmente didactica y de investigacion: es un caso reproducible de extremo a extremo (preentrenamiento, SFT, RLVR con GRPO y evaluacion) documentado con un playbook publico. No es un modelo de proposito general ni compite con LLM de gran escala; su ventana de contexto de 1.024 tokens y su tokenizador de 1.024 entradas lo limitan a tareas muy acotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only GPT con RoPE (theta = 10.000) y tied embeddings |
| Parametros totales | 32.049.152 (10 capas, 8 cabezas, head_dim = 64, n_embd = 512) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en fp32/fp16 segun checkpoint) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, `latest_step_10000_077e9ad1.pt`); no se distribuye GGUF ni safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico con embeddings rotatorios (RoPE) y embeddings de entrada/salida compartidos (tied embeddings). El tokenizador es un BPE a nivel de byte con aislamiento de digitos y un vocabulario de solo 1.024 entradas, con el token `<|eos|>` en el ID 0. El preentrenamiento se realizo sobre SimpleStories (2.094.643 historias de entrenamiento, 853.498.695 tokens) durante 26.047 pasos, una sola epoca.

El ajuste fino se hizo sobre el dataset arith_v3 durante 10.000 pasos con tamano de lote 32, enmascaramiento de prompt (`-100`), un 10 % de replay de historias para preservar la fluidez narrativa y formato de scratchpad CoT (campo `Work:` seguido de `Answer:`). Ademas, se realizo una fase de RLVR con GRPO (checkpoints en los pasos 100 y 300) que no mejoro el resultado del SFT (neto de -12 y -25 casos respectivamente), por lo que el release final es el checkpoint de SFT en el paso 10.000. No se menciona uso de DPO ni de decodificacion especulativa.

## Capacidades

- Generacion de texto narrativo en ingles (continuacion de historias estilo SimpleStories).
- Razonamiento aritmetico con cadena de pensamiento explicita en formato scratchpad (`Work: ... Answer: ...`).
- Operaciones cubiertas: suma, resta, multiplicacion, division y problemas de multiples pasos (`multi`).
- Manejo de numeros negativos en el resultado (campo `neg=` en el trace).
- Generacion de trazas de trabajo validas (98,33 % en test) con tasa de formato del 100 %.
- Metodo de conveniencia `.solve()` que devuelve prompt, output, work y answer parseados.
- Generacion autoregresiva estandar con KV-cache, temperatura y top-p.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking separado.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion educativa sobre razonamiento en modelos pequenos: sirve como banco de pruebas reproducible para estudiar como emerge el CoT aritmetico en un transformer de 32M con un presupuesto de computo minimo.
- Reproduccion de pipelines de entrenamiento: el COOKBOOK del repositorio documenta preentrenamiento, SFT y RLVR con GRPO, lo que permite replicar el flujo completo en una sola GPU consumer.
- Generacion de datos sinteticos de trazas aritmeticas: el modelo puede producir pares pregunta-traza-respuesta en formato consistente para aumentar datasets de entrenamiento de modelos mayores.
- Validacion de tecnicas de evaluacion estricta: su metrica `strict_trace` y el split sellado sirven como ejemplo de evaluacion rigurosa sin contaminacion.
- Demostracion de continuacion narrativa: con prompts como "Once upon a time..." genera texto en ingles con perplejidad de 3,31 en el test de SimpleStories, util para talleres sobre modelado de lenguaje.
- Pruebas de regresion de infraestructura de inferencia: al ser tan pequeno (122,4 MiB de pesos de inferencia) es ideal para validar pipelines de despliegue, carga de checkpoints y tokenizadores personalizados.
- Estudio del efecto del replay de datos: comparar el checkpoint base (PPL 3,12) con el SFT (PPL 3,31) permite analizar el olvido catastrofico en ajuste fino especializado.

## Benchmarks y rendimiento

| Etapa / checkpoint | Run ID | Precision aritmetica (test sellado, 6.002) | SimpleStories test | Notas |
|---|---|---|---|---|
| Base (paso 26.047) | 23a72f3a | 0,0 % (0/10 zero-shot) | PPL 3,12 · BPB 0,5426 · Cloze 86,0 % | 1 epoca sobre 853,5M tokens |
| SFT directo (paso 8.000) | ef3cc27c | 88,8 % val (213/240) | loss val 1,2021 | Cuello de botella en `mul_3d` (3/10) |
| CoT scratchpad SFT (paso 10.000) | e57bf52b | 97,35 % estricto / 97,42 % exacto (5.843/6.002) | PPL 3,31 · BPB 0,5697 · Cloze 83,0 % | Ganador del release |
| GRPO RL `best` (paso 100) | 486683da | 97,15 % estricto / 97,23 % exacto (5.831/6.002) | PPL 3,32 · BPB 0,5708 · Cloze 83,0 % | fixed=56, broke=68 (neto -12) |
| GRPO RL `latest` (paso 300) | 486683da | 96,93 % estricto / 97,03 % exacto (5.818/6.002) | PPL 3,32 · BPB 0,5709 · Cloze 83,0 % | fixed=58, broke=83 (neto -25) |

Desglose por operacion (CoT SFT paso 10.000, `strict_trace=True`):

| Operacion | Precision |
|---|---|
| `add` | 99,75 % (1.197/1.200) |
| `sub` | 99,58 % (1.197/1.202) |
| `div` | 96,92 % (1.163/1.200) |
| `mul` | 95,50 % (1.146/1.200) |
| `multi` | 95,00 % (1.140/1.200) |
| Traza de trabajo valida | 98,33 % |
| Tasa de formato | 100,00 % |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (122,4 MiB de pesos de inferencia); en fp16 aproximadamente 64 MB mas overhead de activaciones y KV-cache.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o incluso CPU para inferencia interactiva.
- Cabe holgadamente en cualquier GPU consumer e integrada; el checkpoint completo de entrenamiento ocupa 367,0 MiB.
- Opciones de despliegue: inferencia nativa con PyTorch y `modeling_minireasoner.py` (via `huggingface_hub`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es directamente compatible con esos runners.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniReasoner | 32,05M | 1.024 | CoT aritmetico + narrativa en | no disponible | Hugging Face + GitHub |
| Modelos tipo TinyStories (p. ej. variantes de 1M-30M) | 1M-30M | variable | Generacion narrativa | variable | Hugging Face |
| GPT-2 small | 124M | 1.024 | LM generalista en | MIT (segun publicacion original) | Hugging Face |
| SmolLM-135M | 135M | 2.048 | LM generalista multilingue | Apache 2.0 | Hugging Face |

La comparacion con alternativas de la misma categoria es limitada porque MiniReasoner esta especializado en una tarea sintetica concreta y no se han publicado evaluaciones cruzadas con otros modelos en la informacion disponible.

## Limitaciones y advertencias

- Dominio muy restringido: solo resuelve aritmetica en el formato entrenado y continuacion de historias sinteticas; no es un modelo de proposito general.
- Contexto muy corto (1.024 tokens) que impide conversaciones multi-turno largas o documentos extensos.
- Solo ingles; no hay soporte multilingue.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Riesgo de alucinacion en prompts fuera de distribucion (aritmetica con numeros muy grandes, formatos distintos o problemas verbales no vistos).
- El formato exige terminar el prompt con salto de linea o usar `.solve()`, lo que puede provocar salidas malformadas si se usa generacion directa.
- El RLVR con GRPO no mejoro el SFT (neto negativo), lo que sugiere inestabilidad en esa fase; el checkpoint recomendado es el de SFT.
- No se distribuyen pesos en GGUF ni safetensors, lo que complica la integracion con ecosistemas de inferencia estandar.
- Sesgos conocidos: no documentados en la informacion disponible, aunque al entrenarse sobre historias sinteticas puede reflejar las limitaciones y sesgos de SimpleStories.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sampath017/MiniReasoner
- Repositorio GitHub: https://github.com/sampath017/MiniReasoner
- Playbook de construccion (COOKBOOK.md): https://github.com/sampath017/MiniReasoner/blob/main/COOKBOOK.md
- Dataset de SFT/evaluacion: https://huggingface.co/datasets/sampath017/MiniReasoner-arith-v3
- Dataset de preentrenamiento: https://huggingface.co/datasets/SimpleStories/SimpleStories
