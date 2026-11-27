# BAJUKA/LLaVA-llama32-3b-LangControl-v2-s42-s2b

## Resumen

LLaVA-llama32-3b-LangControl-v2-s42-s2b es un modelo de lenguaje de 3.212.749.824 parametros (aproximadamente 3,2 mil millones) desarrollado por el usuario BAJUKA y publicado en Hugging Face. Se trata de un fine-tuning del modelo meta-llama/Llama-3.2-3B-Instruct, concebido como un componente de control en el ecosistema de entrenamiento LLaVA-NeXT para Llama-3.2-3B. En concreto, el autor lo describe como un modelo "language-only" sin torre de vision, es decir, un checkpoint nativo de LlamaForCausalLM que replica la etapa de control de lenguaje de un pipeline multimodal, pero sin el encoder visual y cargable directamente con `AutoModelForCausalLM` de transformers.

El modelo forma parte de una parrilla controlada de experimentos identificada por la semilla 42 y las etapas s42-s2b. La receta documentada indica que parte de Llama-3.2-3B-Instruct y pasa por dos etapas: una primera (S2a, 5.859 pasos) sobre texto de FineWeb junto con un dataset propio denominado language_50k_v2, y una segunda (S2b, 2.797 pasos, la que corresponde a este checkpoint) sobre un subconjunto de Tulu 3 emparejado en tokens con la etapa de instruccion del pipeline visual (308.068 ejemplos) mas language_50k_v2 (49.956 ejemplos).

Su relevancia es acotada pero concreta: sirve como referencia reproducible para estudiar el efecto del control de lenguaje en el entrenamiento de modelos LLaVA-NeXT sobre Llama-3.2-3B, y como modelo base de 3B con contexto de hasta 8.192 tokens y plantilla de chat llava_llama_3. No es un modelo de proposito general con benchmarks publicados, sino una pieza de investigacion reproducible con semilla fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), sin torre de vision |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 8.192 tokens segun la receta de entrenamiento (max length 8192); contexto nativo de Llama-3.2-3B-Instruct: 128.000 tokens, no confirmado para este checkpoint |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors en bf16) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Tamano del repo | 6,4 GB |
| Libreria | transformers |
| Plantilla de chat | llava_llama_3 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-3B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, atencion con RoPE y pesos en bf16. El checkpoint no incorpora torre de vision; el autor lo describe explicitamente como "native LlamaForCausalLM with no vision tower", de modo que la parte multimodal del pipeline LLaVA-NeXT queda fuera y este modelo representa solo la rama de lenguaje.

El entrenamiento consta de dos etapas documentadas. La etapa S2a parte de Llama-3.2-3B-Instruct durante 5.859 pasos y combina texto de FineWeb con el dataset language_50k_v2. La etapa S2b, que produce este checkpoint, entrena 2.797 pasos adicionales sobre un subconjunto de Tulu 3 emparejado en tokens con la etapa de instruccion del pipeline visual (308.068 ejemplos) mas 49.956 ejemplos de language_50k_v2. La receta tecnica es: batch global de 128 (2 por dispositivo, 16 de acumulacion, 4 GPU H100), learning rate 1e-5 con scheduler coseno, 3% de warmup, longitud maxima de 8.192 tokens, ZeRO-3 en bf16 y semilla 42. No se documentan etapas de RLHF o DPO especificas para este checkpoint mas alla de las que ya incorpora el modelo base.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de instruccion de Llama-3.2-3B-Instruct y la refuerza con datos de Tulu 3 en la etapa S2b.
- Razonamiento y respuesta a instrucciones: el ajuste sobre Tulu 3 busca alinear el comportamiento de instruccion con el de la etapa visual del pipeline LLaVA-NeXT.
- Control de lenguaje: el dataset language_50k_v2 sugiere un objetivo especifico de control o condicionamiento linguistico, aunque el autor no detalla su contenido ni su funcion exacta.
- Codigo y matematicas: capacidad heredada del modelo base de 3B; no se aportan evaluaciones especificas.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Vision: no soportada (el modelo no incluye torre de vision).
- Modo thinking o audio: no disponible.

## Casos de uso

- Investigacion sobre control de lenguaje en pipelines multimodales: el modelo permite aislar la rama de lenguaje de LLaVA-NeXT Llama-3.2-3B y comparar el efecto de las etapas S2a y S2b con semilla fija, lo que facilita experimentos reproducibles sobre el condicionamiento linguistico.
- Reproduccion de experimentos con semilla controlada: al estar identificado por la semilla 42 y una receta completa (batch, LR, warmup, ZeRO-3, H100), sirve como referencia para replicar resultados en entornos de investigacion con 4 GPU H100.
- Fine-tuning adicional sobre dominio especifico: al ser un LlamaForCausalLM estandar de 3B cargable con transformers, se puede reentrenar con LoRA o QLoRA para tareas de dominio con un coste de computo moderado.
- Generacion de texto conversacional en prototipos: con contexto de hasta 8.192 tokens y plantilla llava_llama_3, es util para asistentes conversacionales de baja latencia en entornos de desarrollo.
- Base para estudios de alineacion: la mezcla de Tulu 3 con language_50k_v2 permite analizar como afecta el emparejamiento por tokens con la etapa visual al comportamiento de instruccion del modelo de lenguaje.
- Evaluacion comparativa de checkpoints intermedios: al existir las etapas S2a y S2b, se puede medir la deriva de comportamiento entre ambas y validar recetas de entrenamiento en modelos de 3B.
- Despliegue en hardware de gama consumer para pruebas: con 3,2 mil millones de parametros, el checkpoint en bf16 ocupa unos 6,4 GB, por lo que es viable en GPU con 12-16 GB de VRAM para inferencia en cuantizacion reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 8-10 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5-4 GB de pesos; en 4 bits, alrededor de 2 GB de pesos (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas para entrenamiento: la receta documentada usa 4 GPU H100 con ZeRO-3 y bf16.
- GPU recomendadas para inferencia: A100, H100 o L40S para produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) sobradas para bf16; RTX 4080/4070 Ti Super (16 GB) viables; GPUs de 12 GB viables con cuantizacion.
- Cabe en GPU consumer: si, en RTX 4090, 3090, 4080 y modelos con 12 GB o mas usando cuantizacion.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), text-generation-inference (el modelo incluye el tag endpoints_compatible), y previsiblemente llama.cpp, Ollama y vLLM si se generan pesos GGUF o se usa el checkpoint safetensors; no confirmado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LLaVA-llama32-3b-LangControl-v2-s42-s2b | 3,21 B | 8.192 (entrenamiento) | llama3.2 | Hugging Face, 0 descargas | Checkpoint de control de lenguaje, sin vision |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 | llama3.2 | Hugging Face, ampliamente usado | Modelo base; capacidad de instruccion general |
| LLaVA-NeXT Llama-3.2-3B (pipeline completo) | ~3,2 B + vision tower | no disponible | llama3.2 | segun repositorio del pipeline | Incluye torre de vision; este checkpoint es su rama de lenguaje |
| Modelos de 3B comparables (p. ej. Qwen2.5-3B-Instruct) | ~3 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa con licencia permisiva; no comparable en objetivo de control |

La comparacion con modelos de proposito general de 3B es limitada porque este checkpoint no se publica con evaluaciones de rendimiento y su objetivo es servir de referencia dentro de una parrilla experimental, no competir en tareas generales.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones, por lo que no hay evidencia cuantitativa de su calidad frente al modelo base.
- El modelo no incluye torre de vision: no debe confundirse con el pipeline LLaVA-NeXT completo ni usarse para tareas multimodales.
- Los idiomas soportados no estan documentados; el comportamiento multilingue es incierto y depende del modelo base y de los datos de ajuste.
- Riesgo de alucinacion inherente a los modelos de 3B, agravado por la falta de evaluaciones de alineacion especificas para este checkpoint.
- La licencia llama3.2 (Llama 3.2 Community License) impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar sus terminos antes de desplegar en produccion.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- El dataset language_50k_v2 no esta descrito en detalle; se desconoce su composicion y el efecto exacto del control linguistico.
- La longitud de contexto efectiva puede estar limitada a 8.192 tokens por la receta de entrenamiento, aunque el modelo base soporte 128.000; conviene validarlo empiricamente.
- Uso previsto principalmente de investigacion y reproduccion experimental; no se recomienda como modelo de produccion sin evaluacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/BAJUKA/LLaVA-llama32-3b-LangControl-v2-s42-s2b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Repositorio LLaVA-NeXT: https://github.com/LLaVA-VL/LLaVA-NeXT
- Dataset Tulu 3: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
