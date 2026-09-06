# alexkstern/nca_dose_1Bpt_hfinit_adamwppt_1B_s0_2026-09-06_15-33-51_568043-pt

## Resumen

Este modelo es un checkpoint de investigación entrenado con el framework nanochat de Karpathy. Fue desarrollado por alexkstern para estudiar el efecto de la "token dose" (la cantidad de tokens de post-entrenamiento) sobre el rendimiento de un modelo de lenguaje. Se trata de un transformer decoder-only de 16 capas, con 1024 unidades de embedding y una ventana de contexto de 2048 tokens. El modelo se pre-entrena con FineWeb (20B tokens) y luego se somete a una fase de post-entrenamiento con el dataset nca-paper-share200-2048 (1B tokens), reinicializando el embedding y reseteando el optimizador en la transición. La licencia es Apache 2.0.

Este tipo de experimentos es relevante para investigar la eficiencia del entrenamiento y el impacto del tamaño del vocabulario en modelos pequeños. El checkpoint se publica como parte de una serie de experimentos del autor, con variantes de 500M y 1B en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT estándar), no MoE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar, con 16 capas, 8 cabezas de atención y 8 cabezas KV, por lo que utiliza atención multi-cabeza estándar (no GQA). La dimensión de embedding es 1024. El vocabulario en la fase de pre-entrenamiento es de 65.536 tokens, mientras que en la fase de post-entrenamiento se reduce a 10.004 tokens, reinicializando el embedding en la transición.

El modelo se entrena en dos fases: pre-entrenamiento con FineWeb (20B tokens) y post-entrenamiento con nca-paper-share200-2048 (1B tokens). No se menciona RLHF ni DPO. El checkpoint guardado corresponde al paso 3.814, con una loss de entrenamiento suavizada de 3.1655 y una métrica interna de objetivo de 0.945. El repositorio incluye el estado del optimizador, lo que explica el tamaño de ~3 GB del archivo .pt.

## Capacidades

- Generacion de texto basica: modelo base de lenguaje, sin fine-tuning de instrucciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (vision, audio).
- El contexto es de 2048 tokens, adecuado para tareas de texto corto.
- Idiomas: no especificado; el dataset FineWeb es predominantemente ingles.

## Casos de uso

- Investigacion en scaling laws: el modelo esta disenado para estudiar el efecto de la token dose, por lo que es util para reproducir experimentos sobre la relacion entre cantidad de tokens y rendimiento.
- Experimentacion con vocabularios reducidos: al cambiar de un vocabulario de 65.536 a 10.004 tokens, permite investigar el impacto del tamano del vocabulario en la calidad del modelo.
- Fine-tuning para clasificacion de texto: su pequeno tamano (menos de 200M parametros) permite ajustarlo en una sola GPU con datasets pequenos para tareas de analisis de sentimiento o categorizacion.
- Generacion de texto corto: con 2048 tokens de contexto, puede completar texto breve, generar respuestas cortas o resumenes.
- Educacion y prototipos: al ser un transformer simple, sirve como ejemplo didactico para ensenar arquitecturas de lenguaje y para prototipos rapidos en entornos academicos.
- Evaluacion de tecnicas de cuantizacion: su tamano reducido facilita probar metodos de compresion (cuantizacion, poda) en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la loss de entrenamiento (3.1655) y una metrica interna de objetivo (0.945), pero no hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~88M-200M parametros, en FP16 se necesitan aproximadamente 0.2-0.4 GB, y en FP32 unos 0.4-0.8 GB. En cuantizacion 4-bit, menos de 0.1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) es suficiente. No se requieren GPUs de datacenter.
- El modelo cabe en cualquier GPU consumer.
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede cargar con el codigo de nanochat o con librerias de HuggingFace Transformers si se define la arquitectura. Para usar con vLLM, llama.cpp, Ollama o TGI, es necesario convertir los pesos a los formatos compatibles (safetensors, GGUF).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa detallada. Existen otras variantes del mismo experimento en el repositorio del autor (por ejemplo, nca_dose_1Bpt_hfinit_500M_s0 y nca_dose_1Bpt_hfinit_1B_s0), pero sus especificaciones y resultados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos del dataset de entrenamiento: FineWeb es un corpus web que puede contener sesgos y contenido no deseado.
- Riesgo de alucinacion: al ser un modelo base sin fine-tuning de instrucciones, no esta alineado para seguir instrucciones y puede generar texto incoherente o falso.
- Contexto limitado: la ventana de 2048 tokens limita las tareas que requieren contexto largo.
- Vocabulario reducido: el vocabulario final de 10.004 tokens puede limitar la representacion de textos multilingues o tecnicos.
- Sin garantias de produccion: el modelo es un checkpoint de investigacion, no se ha evaluado ni optimizado para uso en produccion.
- Tamano del repositorio: el checkpoint incluye el estado del optimizador, lo que hace que el archivo .pt ocupe ~3 GB, a pesar del pequeno tamano del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_adamwppt_1B_s0_2026-09-06_15-33-51_568043-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/4k2zzhz8
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Variante 500M: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_500M_s0_2026-08-14_13-02-03_921837-pt
- Variante 1B: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_1B_s0_2026-08-14_14-00-02_907438-pt
