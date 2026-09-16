# ibnsina-llm/ibnsina-30b

## Resumen

IbnSina-30B es un modelo base de lenguaje desarrollado por ibnsina-llm (Sina Meraji) que consiste en un *continued pretraining* en persa de Qwen/Qwen3-30B-A3B-Base. No es un modelo entrenado desde cero: se parte de un MoE abierto ya entrenado y se adapta a persa con 6.000 millones de tokens adicionales procedentes de la mezcla persa de IbnSina. Es el tercer y mayor modelo de la familia IbnSina, y el único de la misma que no se ha entrenado desde cero (los IbnSina-1.5B y 3B sí son *Persian-first* desde el inicio).

La arquitectura es Qwen3-MoE con 48 capas, dimensión oculta de 2048, 128 expertos y 8 activos por token, con GQA, QK-norm, SwiGLU, RMSNorm y RoPE. Tiene 30.532.122.624 parámetros totales (≈30,5 B) con aproximadamente 3.300 millones activos por token, lo que le permite inferir a una velocidad cercana a la de un modelo de 3B manteniendo la capacidad de conocimiento de un 30B. La longitud de contexto durante el *continued pretraining* fue de 4.096 tokens, aunque la base soporta hasta 32.768.

Su relevancia actual es doble: por un lado, demuestra que una pasada relativamente corta de datos persa (6 B tokens, un 20 % del pool de 29,6 B) reduce el bits-per-byte en persa un 14 % sobre el control intacto; por otro, se distribuye con licencia Apache-2.0 y pesos en safetensors bf16 y GGUF, lo que lo convierte en una base práctica para *fine-tuning* y para construir sistemas en persa con hardware moderado. Es un modelo de continuación de texto, no un asistente: no tiene *instruction tuning* ni plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (transformer Mixture-of-Experts): 48 capas, d=2048, 128 expertos con 8 activos por token, GQA, QK-norm, SwiGLU, RMSNorm, RoPE |
| Parametros totales | 30.532.122.624 (≈30,5 B) |
| Parametros activos | ≈3,3 B por token |
| Longitud de contexto | Entrenado a 4.096 tokens; la base soporta 32.768 |
| Tipos de cuantizacion | GGUF Q4_K_M (18,6 GB), GGUF Q8_0 (32,5 GB), bf16 sin cuantizar (61,1 GB); no se documentan otros formatos |
| Idiomas soportados | Persa (fa) e ingles (en) |
| Licencia | Apache-2.0 (la misma que el modelo base); las licencias de los datos de entrenamiento son por fuente, con tabla en el repositorio |
| Formato de pesos | safetensors (bf16) y GGUF |
| Tokenizer | BPE de Qwen3, 151.936 tokens (sin cambios respecto a la base; no usa el tokenizer IbnSina de 32k de los modelos 1.5B/3B) |
| Modelo base | Qwen/Qwen3-30B-A3B-Base |
| Tamano del repositorio | 112,1 GB |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de Qwen3-30B-A3B-Base: un transformer con capas de mezcla de expertos, 48 capas, dimensión de 2048, 128 expertos por capa y enrutado a 8 expertos por token, con atención de consultas agrupadas (GQA), normalización QK, activación SwiGLU, RMSNorm y embeddings posicionales rotatorios (RoPE). El tokenizer es el BPE de Qwen3 con 151.936 entradas, sin modificar, lo que preserva la compatibilidad con herramientas y pipelines ya existentes para la base.

El *continued pretraining* se hizo con 6.000 millones de tokens en bf16, lo que equivale a 11.445 pasos de 524.288 tokens, es decir, una sola pasada sobre el 20 % de un pool de 29,6 B tokens con *shuffle* global sembrado. Se usó AdamW con LR máximo de 2e-5 y decaimiento coseno hasta el 10 %, junto con mecanismos de guarda y sondas de salud del router (router-health probes) para vigilar el enrutado de expertos. El entrenamiento se ejecutó en 8×A100-80GB spot con FSDP2 durante 7,4 días, sin preempciones y con 15 lotes descartados. Los datos son la mezcla persa de IbnSina (`train_v3b_open`) re-tokenizada con el tokenizer de Qwen3, compuesta por web persa filtrada por clasificador (CulturaX, mC4, FineWeb-2), texto educativo en inglés, código, matemáticas, literatura persa, Wikipedia, texto paralelo fa–en y persa sintético evaluado. No se aplicó RLHF, DPO ni ningún tipo de ajuste por preferencias: es un modelo base puro.

## Capacidades

- Generacion de texto y continuacion de texto en persa e ingles: es su funcion principal, sin plantilla de chat ni seguimiento de instrucciones.
- Modelado de lenguaje y puntuacion por verosimilitud: el propio autor lo evalua con *scoring* de log-verosimilitud en tareas de eleccion multiple, lo que indica que sirve como modelo de puntuacion.
- Conocimiento factual en persa: mejora de 5,2 puntos en PersianMedQA respecto a la base intacta, con ganancias en la mayoria de campos.
- Razonamiento de sentido comun y eleccion multiple en persa: ParsiNLU-MC sube de 52,6 % a 53,6 %.
- Deteccion de parafrasis: ParsiNLU-QQP pasa de 50,0 % a 56,7 %.
- Capacidades bilingues persa-ingles heredadas de la base, ya que el 0,02 % de tokens extra es mayoritariamente persa y no se re-midieron las capacidades en ingles.
- Codigo y matematicas: presentes en la mezcla de datos (codigo, matematicas), aunque sin evaluacion publicada en la informacion disponible.
- Tool calling / function calling: no soportado. No hay entrenamiento de instrucciones ni formato de herramientas.
- Agentes y razonamiento multi-paso: no soportado por el modelo tal cual; requeriria *fine-tuning* posterior.
- Modo *thinking*: no disponible.
- Vision y audio: no soportados; es un modelo exclusivamente de texto.
- Capacidad de especializacion: al ser base, admite *fine-tuning* supervisado, DPO u otros ajustes sobre sus pesos bf16.

## Casos de uso

- Fine-tuning supervisado en persa: partir de los safetensors bf16 (61,1 GB) y entrenar un SFT sobre instrucciones persas para obtener un asistente de dominio; el modelo aporta conocimiento persa ya adaptado y evita entrenar un 30B desde cero.
- *Continued pretraining* de dominio vertical: continuar el entrenamiento con corpus persa especializado (legal, medico, financiero) aprovechando que el modelo ya tiene la distribucion del persa general interiorizada y una tasa de aprendizaje baja validada (2e-5 con decaimiento coseno).
- Generacion de datos sinteticos en persa: producir texto persa a gran escala para aumentar corpus de entrenamiento de modelos mas pequenos de la familia IbnSina, dado su bits-per-byte de 0,4835 en persa retenido.
- Evaluacion y *scoring* de modelos: emplear la log-verosimilitud por opcion para comparar sistemas en tareas persas (ParsiNLU, PersianMedQA) usando el mismo arnes que el autor publica.
- Investigacion sobre enrutado de expertos en MoE: las sondas de salud del router y el hecho de que el entrenamiento toque 8 de 128 expertos por token lo hacen util para estudiar como el *continued pretraining* monolingue redistribuye la carga entre expertos.
- Completado de texto en aplicaciones de escritura persa: autocompletado en editores, generacion de articulos o resumenes de documentos largos usando llama.cpp u Ollama, con la cuantizacion Q4_K_M en una sola GPU.
- Base para destilacion: usar sus salidas como profesor para destilar un modelo persa mas pequeno y desplegable en CPU.
- Analisis linguistico y perplejidad: medir bits-per-byte sobre corpus persa retenido para control de calidad de datasets o deteccion de dominio.

## Benchmarks y rendimiento

Evaluacion por *scoring* de log-verosimilitud en eleccion multiple, con el mismo arnes y prompts que el resto de la familia y con la base intacta como control.

| Tarea | IbnSina-30B | Qwen3-30B-A3B-Base (control) | IbnSina-3B | Aleatorio |
|---|---:|---:|---:|---:|
| ParsiNLU-MC | 53,6 % | 52,6 % | 32,4 % | 25 % |
| PersianMedQA (5.235) | 56,6 % | 51,4 % | 30,5 % | 25 % |
| ParsiNLU-Entailment | 53,5 % | 58,3 % | 39,9 % | 33 % |
| ParsiNLU-QQP | 56,7 % | 50,0 % | 52,2 % | 50 % |
| PersianMedQA, protocolo generativo (total / solo respondidas) | 57,0 % / 61,8 % (411 sin parsear) | 56,8 % / 57,3 % (52 sin parsear) | 24,8 % | 25 % |
| Bits-per-byte en persa retenido (menor es mejor) | 0,4835 | 0,5646 | — | — |

El efecto medible de los 6 B tokens persa: el bits-per-byte en persa retenido cae un 14 % (0,5646 → 0,4835; perplejidad por token de 3,77 a 3,12), PersianMedQA sube 5,2 puntos y ParsiNLU-MC 1 punto. Entailment retrocede 4,8 puntos (58,3 → 53,5): la base concentraba las respuestas en una etiqueta (1.139 de 1.673 respuestas eran "entailment") y acertaba a menudo, mientras que IbnSina-30B reparte sus respuestas entre las tres etiquetas, lo que se describe como un cambio de calibracion mas que una perdida de conocimiento, pero se reporta como regresion. En el protocolo generativo ambos estan igualados en las 5.235 preguntas (57,0 frente a 56,8 %) porque IbnSina falla el formato de solo numero ocho veces mas (411 frente a 52 respuestas sin parsear); sobre las preguntas que si responde va 4,5 puntos por delante (61,8 frente a 57,3 %). Las capacidades en ingles y generales de la base no se volvieron a medir.

## Requisitos de hardware

- Inferencia en Q4_K_M (18,6 GB): cabe en una GPU consumer de 24 GB (RTX 3090, RTX 4090) o en un portatil grande; tambien en configuraciones con memoria unificada. El espacio para KV cache y contexto es limitado y dependera del numero de cabezas GQA, dato no disponible.
- Inferencia en Q8_0 (32,5 GB): requiere A100-40GB, dos GPU de 24 GB, o una GPU de 32 GB con poco margen. Es la opcion casi sin perdida.
- Inferencia en bf16 (61,1 GB): requiere A100-80GB, H100-80GB o varias GPU en paralelo. Es el formato necesario para *fine-tuning* completo.
- Velocidad: con ≈3,3 B parametros activos por token, la decodificacion se comporta de forma aproximada como un modelo de 3B, aunque la memoria residente es la de un 30B. No se han publicado cifras de latencia ni throughput, por lo que no hay numeros concretos disponibles.
- Memoria de entrenamiento: el autor uso 8×A100-80GB en spot con FSDP2, bf16 y AdamW para el *continued pretraining*; reproducirlo exige un cluster equivalente.
- Opciones de despliegue: llama.cpp (libreria declarada del repositorio), Ollama (`ollama run hf.co/ibnsina-llm/ibnsina-30b`), Hugging Face Transformers para los safetensors, y servidores tipo vLLM o TGI para despliegue concurrente (no confirmados en la informacion disponible).
- Conversion: el autor documenta convertir los safetensors a GGUF con `convert_hf_to_gguf.py --outtype bf16`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Idiomas | Licencia | Rendimiento en persa |
|---|---|---|---|---|---|---|
| IbnSina-30B | 30,5 B (MoE) | ≈3,3 B | entrenado a 4.096; base soporta 32.768 | fa, en | Apache-2.0 | ParsiNLU-MC 53,6 %; PersianMedQA 56,6 %; BPB 0,4835 |
| Qwen3-30B-A3B-Base | 30,5 B (MoE) | ≈3,3 B | 32.768 | multilingue (incluye persistencia limitada en persa) | Apache-2.0 | ParsiNLU-MC 52,6 %; PersianMedQA 51,4 %; BPB 0,5646 |
| IbnSina-3B | 3 B (entrenado desde cero) | no disponible | no disponible en la informacion | fa, en | no disponible | ParsiNLU-MC 32,4 %; PersianMedQA 30,5 %; 24,8 % generativo |

La comparacion con otros modelos persas de tamano similar (por ejemplo alternativas entrenadas desde cero o adaptadas de otras bases) no esta disponible en la informacion proporcionada. La lectura util de la tabla es que IbnSina-30B mejora a su propio control en conocimiento persa y modelado de lenguaje, a costa de una regresion en Entailment y de un peor cumplimiento del formato de respuesta numerica.

## Limitaciones y advertencias

- No es un asistente: no sigue instrucciones, no mantiene conversaciones, no aplica plantilla de chat y no rechaza peticiones. Cualquier uso conversacional requiere *fine-tuning* previo (el autor recomienda IbnSina-3B para chat en persa).
- Sin *safety tuning* propio: solo hereda el de la base, y el autor advierte explicitamente de que el modelo respondera a cualquier cosa. No hay politica de comportamiento ni banner de alcance, a diferencia de los modelos de chat de la familia.
- Riesgo de alucinacion: al ser un modelo base sin alineamiento, no hay mecanismo de abstención. En temas medicos, legales o financieros no es una fuente fiable y todo dato debe verificarse.
- Sesgos: hereda los sesgos y el corte de conocimiento de Qwen3-30B-A3B-Base, mas los que introduzca la mezcla persa (web filtrada por clasificador, sintetico juzgado, etc.).
- Regresion medida en Entailment: 4,8 puntos por debajo de la base (58,3 → 53,5 %), atribuida a un cambio de calibracion en el reparto de etiquetas.
- Formato generativo fragil: 411 de 5.235 respuestas sin parsear en PersianMedQA (frente a 52 de la base), ocho veces mas fallos de formato.
- Capacidades en ingles no re-medidas: el autor solo expresa la expectativa de que no cambien, no una medicion.
- Contexto de entrenamiento corto: 4.096 tokens durante el *continued pretraining*, aunque la base soporte 32.768; el comportamiento en contextos largos no esta documentado.
- Cobertura limitada de idiomas: solo persa e ingles declarados.
- Licencia Apache-2.0 permisiva para uso comercial, pero la model card advierte de que las licencias de los datos de entrenamiento son por fuente y remite a la tabla del repositorio; la informacion proporcionada esta truncada en ese punto, por lo que conviene revisar la tabla completa antes de un uso comercial.
- Tokenizer distinto al del resto de la familia IbnSina: usa el BPE de Qwen3 (151.936 tokens), no el tokenizer de 32k de los 1.5B/3B, lo que complica reutilizar pipelines entre ambos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibnsina-llm/ibnsina-30b
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- IbnSina-3B (recomendado por el autor para conversacion en persa): https://huggingface.co/ibnsina-llm/ibnsina-3b
- Repositorio del autor: https://github.com/ibnsina-llm
- ORCID del autor: 0009-0002-8028-1932
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las entradas devueltas por la busqueda no guardan relacion con el modelo (contenido sobre materiales de manualidades) y se descartan.
