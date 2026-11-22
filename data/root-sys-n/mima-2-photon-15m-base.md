# root-sys-n/Mima-2-Photon-15m-Base

## Resumen

Mima 2 Photon Base es un modelo de lenguaje de tipo transformer, desarrollado por root-sys-n, especializado exclusivamente en turco y disenado como modelo base (sin ajuste fino supervisado) para investigacion y desarrollo posterior. Con 17,40 millones de parametros totales (15,77 millones no de embedding) y una ventana de contexto no especificada, se posiciona como un modelo de escala muy reducida, orientado a experimentacion con tecnicas de preentrenamiento, SFT, DPO, tool calling y cuantizacion consciente del entrenamiento (QAT).

El modelo corresponde a la Fase 1 de preentrenamiento de la familia Mima 2 Photon, habiendo procesado 655 millones de tokens en turco durante 10.000 pasos con una combinacion de optimizadores Muon y AdamW. Su relevancia actual radica en que ofrece pesos limpios y sin ajuste fino para que investigadores puedan construir sus propios pipelines de alineacion sobre una base linguistica turca ya preentrenada, con una licencia permisiva Apache 2.0.

La arquitectura destaca por incorporar innovaciones poco habituales en modelos de este tamano, como GQA con ratio 5:1, QK-Norm, convolucion corta (ShortConv) con kernel 4, soft-cap de logits a 30.0 y embeddings de dimension reducida (96) con vocabulario BPE turco de 16.384 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA 5:1, QK-Norm, ShortConv(k=4), SwiGLU, Logit Soft-Cap (30.0) |
| Parametros totales | 17,40M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona QAT como linea de investigacion, pero no se listan formatos publicados) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio figura con tamano 0.0 GB; se menciona tokenizer.json) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de 16 capas con dimension de modelo (d_model) de 320 y dimension de feed-forward (d_ff) de 768 con activacion SwiGLU. Incorpora Grouped Query Attention con ratio 5:1, QK-Norm para estabilizar el entrenamiento, una convolucion corta (ShortConv) con kernel de tamano 4, soft-cap de logits a 30.0 y embeddings de dimension reducida (emb_dim = 96) con vocabulario BPE turco de 16.384 tokens.

El entrenamiento cubrio la Fase 1 de preentrenamiento sobre 655 millones de tokens en turco durante 10.000 pasos, empleando una combinacion de los optimizadores Muon y AdamW. No se aplico ajuste fino supervisado (SFT) ni alineacion posterior, por lo que se trata de un modelo base puro. No se especifican en la informacion disponible la composicion exacta del dataset, la longitud de contexto durante el entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto en turco a nivel de modelo base (sin alineacion conversacional).
- Razonamiento basico y completado de texto derivado del preentrenamiento.
- Capacidades aritmeticas y de unidades elementales (31,0% en el MicroBench del autor).
- Comprension lectora basica (41,0% en el MicroBench del autor).
- Conocimiento general basico (54,0% en el MicroBench del autor).
- No se documenta soporte nativo de tool calling ni de function calling; el autor lo plantea como caso de uso para investigacion posterior sobre estos pesos.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues limitadas al turco segun la model card.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Investigacion en preentrenamiento de modelos turcos de escala reducida: los pesos permiten reproducir o comparar tecnicas como Muon + AdamW, GQA, QK-Norm o ShortConv sobre una base ya entrenada con 655M tokens.
- Punto de partida para SFT en turco: el modelo sirve como base limpia para aplicar ajuste fino supervisado en tareas concretas (clasificacion, extraccion, resumen) sin partir de cero.
- Experimentacion con DPO y alineacion: al no tener SFT previo, permite estudiar el efecto de pipelines de preferencia directamente sobre un modelo base.
- Investigacion en QAT (quantization-aware training): el autor lo propone explicitamente como sustrato para estudiar cuantizacion consciente del entrenamiento en modelos pequenos.
- Desarrollo de tool calling y function calling en turco: el modelo puede servir como base para investigar la incorporacion de estas capacidades mediante ajuste fino.
- Prototipado educativo y docencia: su tamano (17,40M parametros) permite ejecutarlo en hardware muy modesto para demostrar el funcionamiento interno de un transformer entrenado en turco.
- Evaluacion comparativa de tecnicas arquitectonicas: util para medir el impacto de GQA, ShortConv o Logit Soft-Cap frente a arquitecturas mas convencionales en el mismo regimen de datos.

## Benchmarks y rendimiento

Resultados publicados por el autor en Mima-TR-MicroBench (n = 500, 100 por categoria):

| Categoria | Mima 2 Photon Base (16L · 15M) | Mima 1.5 Pico (7L · 15M) |
|---|---|---|
| Turco: lengua y ortografia | 61,0% | 39,0% |
| Cultura general basica | 54,0% | 34,25% |
| Logica y sentido comun | 48,0% | 26,5% |
| Comprension lectora | 41,0% | 43,25% |
| Aritmetica y unidades | 31,0% | 28,0% |
| General (acc_sent_norm) | 47,0% (Val PPL: 64,45) | 34,2% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 17,40M parametros (aproximadamente 70 MB de pesos en fp32, mas overhead de activaciones y KV cache). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien ejecutable en CPU sin problema.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 2060, RTX 4090, etc.), asi como en iGPU y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI una vez convertidos los pesos a los formatos soportados (no se documenta la conversion en la informacion disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mima 2 Photon Base | 17,40M totales (15,77M no-embedding) | no disponible | MicroBench propio: 47,0% general | Apache 2.0 | Hugging Face |
| Mima 1.5 Pico | 15M | no disponible | MicroBench propio: 34,2% general | no disponible | Hugging Face |
| Otros modelos turcos de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con Mima 1.5 Pico, de la misma familia y con el mismo orden de parametros (15M), sobre el que Mima 2 Photon Base mejora en la mayoria de categorias del MicroBench del autor, salvo en comprension lectora (41,0% frente a 43,25%).

## Limitaciones y advertencias

- Modelo base sin SFT: no esta alineado para conversacion ni instrucciones; las respuestas pueden ser incoherentes o incompletas en uso directo.
- Riesgo elevado de alucinacion: al ser un modelo pequeno (17,40M parametros) y sin alineacion, la generacion de hechos incorrectos es esperable.
- Sesgos: no se documentan analisis de sesgo; al entrenarse solo en turco, puede reflejar sesgos presentes en el corpus de preentrenamiento.
- Limitaciones de idioma: solo turco; no se garantiza ningun rendimiento en castellano ni en otras lenguas.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en secuencias largas.
- Repositorio con tamano 0.0 GB: en el momento de la consulta no se confirma la disponibilidad efectiva de los pesos; conviene verificar los archivos antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial con atribucion, pero el modelo no esta pensado ni validado para produccion.
- Benchmarks propios del autor (MicroBench, n=500): los resultados no proceden de suites estandar y deben interpretarse con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/root-sys-n/Mima-2-Photon-15m-Base
- Modelo relacionado (Mima 2 Photon 15m): https://huggingface.co/root-sys-n/Mima-2-Photon-15m
