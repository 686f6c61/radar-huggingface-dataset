# BAJUKA/LLaVA-qwen25-3b-LangControl-v2-s1337-s2b

## Resumen

LLaVA-qwen25-3b-LangControl-v2-s1337-s2b es un modelo de lenguaje de 3.085.938.688 parametros publicado por el usuario BAJUKA en Hugging Face. Se trata de un fine-tune de Qwen/Qwen2.5-3B-Instruct concebido como control "solo texto" (language-only) dentro de una parrilla experimental de entrenamiento controlado para la familia LLaVA-NeXT con backbone Qwen2.5-3B. El objetivo del autor es disponer de una referencia puramente linguistica, sin torre de vision, que permita aislar el efecto del entrenamiento multimodal frente al entrenamiento solo de lenguaje en experimentos comparativos.

El modelo se construye en dos etapas: S2a parte de Qwen2.5-3B-Instruct y entrena 5.859 pasos con texto de FineWeb y el dataset `language_50k_v2`; S2b, que es el checkpoint publicado, continua con 2.797 pasos sobre un subconjunto de Tulu 3 emparejado en tokens con la etapa de instruccion vision-lenguaje (308.068 tokens) mas `language_50k_v2` (49.956 tokens). Es, por tanto, un artefacto de investigacion reproducible (semilla 1337) mas que un modelo orientado a produccion.

La relevancia es metodologica: proporciona un punto de comparacion limpio para estudiar como el ajuste multimodal afecta a las capacidades linguisticas de un mismo backbone. No hay datos publicados de benchmarks ni de idiomas soportados, y la licencia figura como "other" sin texto adicional en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM), sin torre de vision |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud maxima de entrenamiento); contexto nativo de Qwen2.5-3B-Instruct no confirmado en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia en la model card) |
| Formato de pesos | safetensors (repo de 6,2 GB) |

## Arquitectura y entrenamiento

El modelo es un Qwen2ForCausalLM nativo, es decir, un transformer decoder-only con atencion causal estandar y sin modulo visual. La model card insiste en que es cargable directamente con `AutoModelForCausalLM` de transformers, lo que lo distingue de los checkpoints LLaVA-NeXT completos de la misma parrilla. La plantilla de chat utilizada es `qwen_2_5`.

El entrenamiento se divide en dos etapas. La etapa S2a parte de Qwen2.5-3B-Instruct y ejecuta 5.859 pasos sobre texto de FineWeb mas el dataset `language_50k_v2`. La etapa S2b, correspondiente a este checkpoint, ejecuta 2.797 pasos adicionales sobre un subconjunto de Tulu 3 emparejado en tokens con la etapa de instruccion vision-lenguaje (308.068 tokens) mas `language_50k_v2` (49.956 tokens). La receta es: batch global de 128, learning rate 1e-5 con scheduler coseno, 3 % de warmup, longitud maxima de 8.192, ZeRO-3 en bf16, 4 GPU H100 y semilla 1337. No se documentan fases de RLHF o DPO adicionales, ni innovaciones de decodificacion o atencion.

## Capacidades

- Generacion de texto conversacional en formato chat con plantilla `qwen_2_5`.
- Razonamiento e instruccion general heredados del backbone Qwen2.5-3B-Instruct, previsiblemente atenuados o alterados por el ajuste de control.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Tool calling y function calling: no documentados para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision: no soportada (el modelo carece explicitamente de torre de vision).
- Modo "thinking", audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Control experimental en investigacion multimodal: sirve como referencia solo-texto para medir cuanto del rendimiento de los checkpoints LLaVA-NeXT Qwen2.5-3B se debe al entrenamiento linguistico y cuanto a la vision. Se usaria evaluando ambos modelos con los mismos prompts de texto.
- Estudio de olvido catastrofico: al compartir receta y semilla con la rama vision-lenguaje, permite comparar la degradacion de capacidades linguisticas tras el ajuste multimodal.
- Reproducibilidad de recetas de fine-tuning: la documentacion explicita de pasos, batch, LR, warmup, precision y hardware facilita replicar el entrenamiento en 4 GPU H100.
- Generacion de texto ligera en local: con 3.085 millones de parametros y pesos safetensors de 6,2 GB, puede ejecutarse en una unica GPU consumer de gama alta para tareas de chat o resumen de baja exigencia.
- Base para ablaciones de datasets: el uso de `language_50k_v2` y de un subconjunto token-matched de Tulu 3 lo hace util para estudiar el efecto del emparejamiento de tokens entre etapas.
- Evaluacion de plantillas de chat: permite probar la plantilla `qwen_2_5` en pipelines de transformers y text-generation-inference sin cargar el stack de vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,2 GB solo de pesos, mas overhead de activaciones y KV cache; en la practica, entre 8 y 12 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,1 GB de pesos; en 4 bits, alrededor de 1,6 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: el autor entreno en 4x H100; para inferencia basta una RTX 4090 (24 GB) o una RTX 3090 (24 GB) en bf16.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas en bf16 y en tarjetas de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repo). No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaVA-qwen25-3b-LangControl-v2-s1337-s2b | 3.085.938.688 | 8.192 (entrenamiento) | No | other | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3.085 millones aprox. | no disponible en esta ficha | No | no disponible en esta ficha | Hugging Face, ampliamente usado |
| Checkpoints LLaVA-NeXT Qwen2.5-3B de la misma parrilla | no disponible | no disponible | Si | no disponible | Hugging Face (autor BAJUKA) |

No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint de control dentro de una parrilla experimental, no un modelo afinado para produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que su uso en produccion requeriria evaluacion propia.
- Licencia "other" sin texto: no se especifican condiciones de uso comercial; debe consultarse al autor antes de cualquier despliegue.
- Idiomas no documentados: no se puede asumir cobertura multilingue aunque el backbone Qwen2.5 la tenga.
- Riesgo de alucinacion: inherente a un modelo de 3.000 millones de parametros; no se documentan mitigaciones.
- Sesgos: no documentados; el entrenamiento con FineWeb y Tulu 3 puede arrastrar sesgos de esos corpus.
- Sin vision: pese al nombre "LLaVA" en el identificador, el modelo no procesa imagenes.
- Contexto limitado a 8.192 tokens en entrenamiento: prompts mas largos pueden degradar la calidad.
- Fecha de creacion futura (2026-11-25) en los metadatos: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/BAJUKA/LLaVA-qwen25-3b-LangControl-v2-s1337-s2b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la informacion disponible.
