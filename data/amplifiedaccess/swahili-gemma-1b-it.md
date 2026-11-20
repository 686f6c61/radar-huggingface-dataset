# AmplifiedAccess/Swahili-gemma-1b-it

## Resumen

Swahili-gemma-1b-it es un ajuste fino de google/gemma-3-1b-it desarrollado por AmplifiedAccess, orientado a la traduccion ingles→suajili y al seguimiento de instrucciones en suajili. El modelo parte del checkpoint intermedio de preentrenamiento continuado (CPT) sobre datos en suajili y aplica despues un ajuste supervisado con QLoRA, cuyos adaptadores se fusionan en pesos completos fp16 para su publicacion. El resultado es un modelo de aproximadamente 1.000 millones de parametros (999.885.952 segun los safetensors del repositorio) que cabe en hardware de consumo.

Su relevancia practica esta en el salto de calidad medido sobre FLORES-200 ingles→suajili: el modelo base obtiene BLEU 0,41 y chrF++ 14,28, mientras que este ajuste alcanza BLEU 28,86 y chrF++ 54,77 con busqueda por haces (beam=8). Es decir, pasa de no producir traducciones funcionales a ser un traductor utilizable en ese par de idiomas con un coste computacional minimo. El modelo se distribuye con licencia Gemma y tambien como release cuantizado en Ollama (q4_K_M, aproximadamente 814 MB).

La ficha se basa exclusivamente en la informacion publicada por el autor en Hugging Face; los datos de benchmarks son los declarados por el autor y no estan verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, `gemma3_text`) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias empaquetadas de 512 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante entrenamiento; GGUF q4_K_M (~814 MB) publicado en Ollama; pesos publicados en fp16 |
| Idiomas soportados | ingles (en), suajili (sw) |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | safetensors (fp16 fusionado); GGUF via Ollama |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3 en su variante de 1B parametros (`gemma3_text`), heredado de google/gemma-3-1b-it a traves de un checkpoint intermedio de preentrenamiento continuado en suajili. El entrenamiento se realizo en dos etapas sobre una unica GPU Kaggle T4: primero un CPT sobre datos en suajili y despues un ajuste supervisado con QLoRA (base 4-bit NF4 mas adaptadores LoRA de rango 32, alpha 64 y dropout 0,05) sobre todas las proyecciones de atencion y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). Los adaptadores se fusionaron posteriormente en pesos completos fp16.

La etapa de SFT uso 159.311 pares tras el filtrado de calidad (296 pares descartados por un filtro de ratio de longitud), procedentes de MAFAND-MT en-swa (32.414), Rogendo/English-Swahili-Sentence-Pairs (58.052), Sunbird SALT (23.947), Svngoku/Inkuba-Swahili-MMT (29.991, normalizado a direccion EN→SW), aya_dataset en suajili (359) y alpaca-cleaned-swahili (14.844). Los datos se empaquetaron en 25.452 bloques de 512 tokens, aproximadamente 13,0 millones de tokens de entrenamiento. Se entrenaron 3 epocas con batch efectivo de 32, learning rate 2e-4 con schedule coseno y 3% de warmup, optimizador paged AdamW 8-bit, precision fp16 y atencion SDPA, durante 2.388 pasos (~9 h 45 min). Los parametros entrenables fueron 26,09 M (2,54% del total) y la perdida final de entrenamiento fue 1,543. La aumentacion por traduccion inversa con NLLB estaba planificada pero no se ejecuto en esta ejecucion.

## Capacidades

- Traduccion automatica ingles→suajili, con un formato de prompt especifico que maximiza la calidad (`Translate the following English sentence to Swahili.\nEnglish: <frase>\nSwahili:`).
- Seguimiento de instrucciones generales en suajili, gracias al entrenamiento con datos de Aya y Alpaca-Swahili.
- Generacion de texto conversacional en formato de turnos de Gemma (`<start_of_turn>user` / `<start_of_turn>model`).
- Capacidad bilingue limitada a ingles y suajili; no se declaran otros idiomas.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se declara capacidad de traduccion suajili→ingles (no entrenada ni evaluada).

## Casos de uso

- Traduccion de noticias y contenido editorial: el modelo se entreno con MAFAND-MT, un corpus de noticias traducidas por humanos, por lo que es adecuado para localizar articulos y comunicados del ingles al suajili con un coste de inferencia minimo.
- Localizacion de interfaces y documentacion de producto: con ~1B parametros puede desplegarse en un contenedor pequeno o en una GPU de consumo para traducir cadenas de UI y textos de ayuda de forma por lotes.
- Atencion al cliente en suajili: el ajuste con datos de instrucciones (Aya, Alpaca-Swahili) permite responder y reformular consultas en suajili en entornos con recursos limitados, aunque la calidad fuera de los dominios de entrenamiento no esta verificada.
- Traduccion asistida en el navegador o en el dispositivo: el GGUF q4_K_M (~814 MB) de Ollama permite ejecucion local sin GPU dedicada, util para herramientas de traduccion offline.
- Procesamiento por lotes de corpus bilingues: el modelo puede generar traducciones de referencia o preetiquetar pares EN→SW para revision humana en proyectos de datos, con la advertencia de que la calidad decae en frases largas o muy tecnicas.
- Filtrado y normalizacion de datos multilingues: usar el modelo para generar traducciones de control y detectar pares anomalos en pipelines de curacion de corpus, dado su bajo coste por token.
- Prototipado de asistentes de voz o texto en suajili: combinado con ASR/TTS, sirve como capa de generacion en demo y prototipos con presupuesto de hardware reducido.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente). FLORES-200 `devtest`, ingles→suajili, beam search (beam=8), max_new_tokens=256:

| Modelo | BLEU | chrF++ |
|---|---|---|
| Gemma 3 1B base (sin ajuste) | 0,41 | 14,28 |
| Swahili-gemma-1b-it | 28,86 | 54,77 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2 GB de pesos mas overhead de activaciones y cache KV; el repositorio ocupa 2,0 GB.
- VRAM estimada con cuantizacion q4_K_M: aproximadamente 814 MB de pesos, por lo que cabe en GPUs de consumo con 4 GB o mas y en CPU.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060/4060 o superiores) es suficiente; para lotes grandes o baja latencia, A100/H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, incluidas GPUs de gama de entrada y portatiles con 6-8 GB de VRAM.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM` y `dtype=torch.float16`), Ollama (`ollama run amplifiedaccessorg/Swahili-gemma-1b-it`), llama.cpp via GGUF; el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y endpoints de HF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swahili-gemma-1b-it | ~1B | no disponible | Traduccion EN→SW + instrucciones en suajili | Gemma | Hugging Face + Ollama |
| google/gemma-3-1b-it (base) | ~1B | no disponible | Modelo generalista multilingue | Gemma | Hugging Face |
| NLLB (familia Meta) | variable (desde ~600M) | no disponible | Traduccion multilingue dedicada | CC-BY-NC (variantes) | Hugging Face |

La comparacion cuantitativa con NLLB u otros sistemas de traduccion en FLORES-200 no esta disponible en la informacion proporcionada; el unico punto de comparacion publicado es el modelo base, con BLEU 0,41 frente a 28,86.

## Limitaciones y advertencias

- Solo se entreno y evaluo en traduccion ingles→suajili; la direccion suajili→ingles no esta entrenada ni evaluada.
- La aumentacion por traduccion inversa con NLLB estaba planificada pero no se ejecuto, por lo que el modelo no se beneficio de esos datos.
- El rendimiento fuera de los dominios de entrenamiento (noticias e instrucciones generales) no esta verificado.
- Al ser un modelo de 1B parametros, es esperable un mayor numero de errores en frases largas, sintacticamente complejas o muy especializadas que en modelos de traduccion de mayor tamano.
- Riesgo de alucinacion y de traducciones plausibles pero incorrectas en terminologia tecnica o nombres propios; se recomienda revision humana en produccion.
- Sesgos no documentados en la informacion disponible; los corpus de origen (noticias, SALT, Inkuba) pueden introducir sesgos de dominio y de registro.
- La licencia Gemma impone terminos de uso (incluidas clausulas de uso aceptable y obligaciones de atribucion); debe revisarse antes de un uso comercial.
- El contexto maximo no esta documentado en la ficha del autor; el entrenamiento uso bloques de 512 tokens, por lo que no hay garantia de calidad mas alla de esa longitud.
- El modelo tiene un volumen muy bajo de adopcion (17 descargas, 0 likes en el momento de la consulta), lo que implica poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmplifiedAccess/Swahili-gemma-1b-it
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Release en Ollama: https://ollama.com/amplifiedaccessorg/Swahili-gemma-1b-it
- Dataset MAFAND-MT: https://huggingface.co/datasets/masakhane/mafand
- Dataset Rogendo/English-Swahili-Sentence-Pairs: https://huggingface.co/datasets/Rogendo/English-Swahili-Sentence-Pairs
- Dataset Sunbird SALT: https://huggingface.co/datasets/Sunbird/salt
- Dataset Svngoku/Inkuba-Swahili-MMT: https://huggingface.co/datasets/Svngoku/Inkuba-Swahili-MMT
- Dataset CohereLabs/aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset iamshnoo/alpaca-cleaned-swahili: https://huggingface.co/datasets/iamshnoo/alpaca-cleaned-swahili
- Benchmark FLORES-200: https://huggingface.co/datasets/facebook/flores
