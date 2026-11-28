# purplejedi/dungeongpt-qwen25-1.5b-lora-spooky

## Resumen

DungeonGPT Qwen2.5-1.5B LoRA Spooky es un adaptador PEFT LoRA de bajo rango entrenado sobre el modelo base Qwen/Qwen2.5-1.5B, desarrollado por el usuario purplejedi en el contexto del proyecto DungeonGPT. Su proposito es transformar el comportamiento del modelo base para que genere narracion de escenas de rol de mesa (tabletop RPG) con un estilo oscuro, inquietante y de exactamente tres frases, independientemente del prompt de entrada.

El adaptador se entrena sobre un conjunto de instrucciones sinteticas de RPG (4500 ejemplos de entrenamiento y 250 de validacion) y representa el checkpoint de una epoca completa (paso 560) del Experimento 03 del proyecto. Es relevante como ejemplo de especializacion extrema mediante LoRA: con solo 1.089.536 parametros entrenables (0,0705% del total), consigue pasar de un 4,0% a un 100,0% en la satisfaccion simultanea de las tres restricciones de formato del benchmark interno de validacion.

No es un modelo de proposito general: esta disenado intencionadamente para sobreespecializarse en una plantilla narrativa concreta, lo que lo hace util como componente de estilo en pipelines de generacion de contenido RPG, pero inadecuado para tareas generales de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1.544.803.840 (modelo base) + 1.089.536 entrenables en el adaptador (0,0705%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen2.5, no documentadas aqui) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango `r=8` con `lora_alpha=16` aplicado sobre los modulos `q_proj` y `v_proj` de la atencion del modelo base Qwen/Qwen2.5-1.5B (revision `8faed761d45a263340a0528343f099c05c9a4323`), que permanece congelado. El entrenamiento se realizo con `eff_batch=8` y `lr=0.0002` durante 560 pasos optimizador (aproximadamente una epoca completa) sobre los splits de instrucciones SFT congelados de DungeonGPT (4500 de entrenamiento, 250 de validacion), con una perdida de validacion final de 0,5407. El entrenamiento se ejecuto en una Tesla T4 con un pico de 3,11 GiB de memoria y una duracion de 38,7 minutos.

Los datos de entrenamiento provienen del dataset sintetico CJJones/RPG_Scenes_LLM_Synthetic y del dataset congelado purplejedi/dungeongpt-sft-dataset, con hashes SHA-256 documentados para `train.jsonl` y `val.jsonl`. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un ajuste supervisado clasico sobre instrucciones. La innovacion tecnica destacable no es arquitectonica sino de especializacion: el adaptador fuerza una plantilla de tres frases y un tono oscuro de forma robusta incluso ante prompts benignos o negados.

## Capacidades

- Generacion de texto narrativo de escenas de rol de mesa en ingles, con estilo oscuro e inquietante.
- Cumplimiento estricto de una plantilla de tres frases por respuesta (100,0% de tasa de finalizacion EOS en el benchmark interno).
- Satisfaccion simultanea de las tres restricciones de formato del benchmark de validacion (100,0%).
- Reformulacion atmosferica de cualquier prompt de entrada, incluidos prompts benignos o con negaciones, hacia el registro spooky.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de forma documentada.
- Multilingue: no; solo ingles.
- Capacidades especiales: ninguna adicional documentada (sin vision, audio ni modo thinking).

## Casos de uso

- Generacion de descripciones de escenas para campanas de rol: el adaptador convierte una instruccion breve ("una biblioteca polvorienta, un mapa misterioso y un anciano mago") en tres frases de narracion atmosferica listas para insertar en una sesion o modulo.
- Herramienta de estilo para game masters: dado un conjunto de elementos de escena, produce texto consistente en tono y longitud, reduciendo el trabajo de redaccion del master.
- Prototipado de videojuegos narrativos: integrado en un pipeline que alimente prompts de escena, genera descripciones de tres frases para dialogos ambientales o textos de localizacion de un titulo de terror o fantasia oscura.
- Generacion de contenido para modulos de RPG: sirve como generador de bloques de ambientacion homogeneos en estilo para publicaciones, con la ventaja de la consistencia de formato.
- Experimentacion en investigacion sobre especializacion LoRA: caso de estudio reproducible (con run de W&B, hashes de dataset y commit SHA) para medir como un adaptador de 1,09 M de parametros sobreescribe el comportamiento del modelo base.
- Filtro o capa de reescritura estilistica: en un pipeline mayor, reescribe descripciones neutras en clave oscura para mantener coherencia tonal en un producto narrativo.
- Demo educativa de PEFT: ejemplo minimo de entrenamiento e inferencia con `peft` y `transformers` que cabe en una GPU consumer o en una T4.

## Benchmarks y rendimiento

Evaluacion sobre 50 prompts de validacion reservados, `seed=42`, decodificacion greedy:

| Metrica | Qwen2.5-1.5B base (adaptador desactivado) | Qwen2.5-1.5B + LoRA | Delta |
|---|---:|---:|---:|
| Precision en restricciones individuales | 21,3% | 100,0% | +78,7 pp |
| Las tres restricciones satisfechas | 4,0% | 100,0% | +96,0 pp |
| Tasa de finalizacion EOS | 16,0% | 100,0% | +84,0 pp |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores corresponden exclusivamente al benchmark interno de validacion del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 ocupa aproximadamente 3,1 GB de pesos; el adaptador anade unos pocos MB. Con overhead de activaciones y KV cache, se estima un uso de 4-6 GB en fp16, aunque no se documenta una cifra oficial.
- GPU recomendadas: el entrenamiento se realizo en una Tesla T4 con pico de 3,11 GiB; para inferencia son suficientes GPUs consumer modernas (RTX 3060 12 GB, RTX 4070, RTX 4090) o GPUs de datacenter (A100, H100) si se busca mayor throughput.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 6-8 GB de VRAM en fp16; con cuantizacion del base en 4 bits cabria en GPUs de 4 GB.
- Opciones de despliegue: `transformers` + `peft` (documentado en la model card); el base Qwen2.5-1.5B es compatible con vLLM, llama.cpp, Ollama y TGI, aunque la integracion del adaptador LoRA depende de que el runtime soporte carga de adaptadores PEFT.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| purplejedi/dungeongpt-qwen25-1.5b-lora-spooky | 1,5 B base + 1,09 M adaptador | no disponible | Narracion RPG oscura de 3 frases | MIT | Hugging Face |
| purplejedi/dungeongpt-qwen25-1.5b-lora-balanced | 1,5 B base + adaptador | no disponible | Estilo RPG equilibrado con control OOD (paso 50) | no disponible | Hugging Face |
| Qwen/Qwen2.5-1.5B (base) | 1,5 B | no disponible en esta ficha | Proposito general | no disponible en esta ficha | Hugging Face |

La comparativa con modelos de la misma categoria (generadores narrativos especializados) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero el modelo esta entrenado sobre datos sinteticos de RPG y puede reproducir tropos genericos del genero.
- Riesgo de alucinacion: alto en el sentido de que reformula cualquier entrada hacia una narracion inventada; no es fiable para responder preguntas factuales.
- Limitacion de idioma: solo ingles; no se ha entrenado ni evaluado en castellano.
- Limitacion de contexto: la longitud de contexto no se especifica en la informacion disponible.
- Restriccion de estilo: sobreespecializacion intencionada; ignora o reescribe prompts benignos o negados, lo que impide usarlo como modelo de proposito general.
- Licencia MIT: permite uso comercial, pero al derivar del modelo base Qwen2.5-1.5B conviene verificar los terminos de la licencia del modelo base.
- Caveat para produccion: el benchmark de 100,0% se limita a 50 prompts de validacion con decodificacion greedy y `seed=42`; no garantiza el mismo comportamiento con sampling, prompts fuera de distribucion o volumenes mayores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/purplejedi/dungeongpt-qwen25-1.5b-lora-spooky
- Adaptador balanced companion: https://huggingface.co/purplejedi/dungeongpt-qwen25-1.5b-lora-balanced
- Dataset SFT: https://huggingface.co/datasets/purplejedi/dungeongpt-sft-dataset
- Dataset sintetico de escenas RPG: https://huggingface.co/datasets/CJJones/RPG_Scenes_LLM_Synthetic
- Repositorio fuente DungeonGPT: https://github.com/sriramrathinavelu/DungeonGPT
- Run de Weights & Biases: https://wandb.ai/chillyskywalker/dungeongpt/runs/k0v0yy3n
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
