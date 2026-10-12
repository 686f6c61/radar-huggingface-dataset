# siddharthmb/2026.TA.gemma2_2b_full_500k_l1_0p016_gemma2_2b_full_500k_tc8192_decb_l1w0.016_tarbb_sl15516714

## Resumen

Este repositorio no es un modelo de lenguaje autónomo, sino un **adaptador transcoder disperso** (sparse transcoder adapter) construido sobre `google/gemma-2-2b`. Lo desarrolla el usuario de HuggingFace `siddharthmb` como artefacto de investigación asociado al artículo *Transcoder Adapters for Reasoning-Model Diffing* (arXiv:2602.20904). La idea central es que cada bloque MLP del modelo base congelado incorpora una rama ReLU de la forma `dec(relu(enc(x)))`, de modo que el modelo híbrido (base más rama) reproduce el comportamiento de `google/gemma-2-2b-it`. Las características aprendidas por esas ramas constituyen el ajuste fino, pero de forma dispersa e interpretable.

El checkpoint tiene 3.596.081.920 parámetros totales (frente a los ~2,6 mil millones del Gemma 2 2B original), con 8.192 características por transcoder, un sesgo de decodificador (`dec_bias: True`) y un peso L1 de 0,016. Se entrenó en modo *bridging*, es decir, forzando a que base más rama iguale la salida del modelo de referencia ajustado por instrucciones, usando pérdida KL y un tokenizador tomado de `google/gemma-2-2b-it`.

Su relevancia es metodológica más que de producto: permite *diffing* de modelos, generación de grafos de atribución por características y *steering* individual de características mediante identificadores cantor. No está pensado para sustituir a un LLM generalista en producción, sino como herramienta de interpretabilidad sobre una base Gemma 2 2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only) con ramas transcoder dispersas ReLU (`dec(relu(enc(x)))`) en cada MLP |
| Parametros totales | 3.596.081.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base Gemma 2 2B / tokenizador `gemma-2-2b-it`) |
| Tipos de cuantizacion | No disponible (el repo distribuye safetensors en precision completa, 7,2 GB) |
| Idiomas soportados | No disponibles (heredados del modelo base Gemma 2 2B, sin declarar en la model card) |
| Licencia | No disponible en el repo (el modelo base Gemma 2 se rige por los Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura base es el transformer decoder-only de Gemma 2 2B, con atención alternando entre local y global según el diseño original de Gemma 2. Sobre él se añade, en cada capa MLP, un transcoder disperso con 8.192 características y sesgo en el decodificador, que transforma la activación original en una representación dispersa y la reconstruye hacia la salida del MLP. El modo de entrenamiento es *bridging*: el objetivo no es reconstruir la propia activación, sino hacer que la combinación del modelo base congelado y la rama coincida con `google/gemma-2-2b-it`, de modo que las características del transcoder capturen la diferencia funcional entre el modelo base y su versión ajustada por instrucciones.

Los hiperparámetros documentados son: peso L1 = 0,016, learning rate = 0,0008, batch size = 4, 1 época, warmup ratio = 0,05, pérdida KL (`loss_type: kl`), `lambda_adapt = 1.0`, `lambda_bridge = 2.0`, `lambda_nmse = 1`, `n_cutoffs = 1` y `backbone: target`. Los datos de entrenamiento son `science-of-finetuning/fineweb-1m-sample` y `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits`. El entrenamiento se reproduce con `python -m training.train` sobre el repositorio `Sid-MB/transcoder-adapters`; la model card indica que no se conservó manifiesto de ejecución, aunque sí se sube `train_config.yaml`. El checkpoint corresponde a una ruta de clúster que sugiere aproximadamente 500.000 pasos (`dr500000`) y una longitud de secuencia de 15.516.714 tokens.

## Capacidades

- Generación de texto: heredada del modelo base Gemma 2 2B; el adaptador no añade capacidades generativas nuevas por sí mismo.
- Reproducción del comportamiento instruccional de `google/gemma-2-2b-it` mediante la rama transcoder en modo *bridging*.
- Interpretabilidad por características: cada una de las 8.192 características por MLP es direccional y analizable.
- Steering dirigido: se puede modular una característica concreta por su identificador cantor (`--steer CANTOR_ID:STRENGTH`).
- Generación de grafos de atribución: herramientas `analysis.attribution.graphs.build_graphs` con soporte de GemmaScope.
- Modo híbrido conmutable: `set_transcoders_enabled(False)` desactiva las ramas y deja un híbrido con los MLP base más la atención y los embeddings del modelo de referencia.
- Interfaz de chat por CLI (`analysis.chat.cli`) y carga estándar vía `transformers`.
- Tool calling / function calling: no declarado en la model card.
- Capacidades multimodales, de audio o de visión: no declaradas.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar qué características de los MLP codifican la diferencia entre un modelo base y su versión instruccional, usando la dispersión del transcoder como unidad de análisis.
- Diffing de modelos: comparar `gemma-2-2b` y `gemma-2-2b-it` a nivel de característica concreta, aprovechando el modo *bridging* para localizar las direcciones responsables del ajuste por instrucciones.
- Steering controlado en experimentos: intervenir una característica concreta para observar cambios en la salida y validar hipótesis sobre representaciones internas.
- Generación de grafos de atribución: construir grafos con `build_graphs` y GemmaScope para trazar rutas causales desde entradas a salidas.
- Auditoría de alineación: identificar qué características se activan ante prompts sensibles y comparar su presencia respecto al modelo base.
- Docencia y reproducibilidad: servir como caso de estudio reproducible de adaptación dispersa con pesos, config y código publicados.
- Base para investigaciones derivadas: reutilizar la configuración `train_config.yaml` para entrenar adaptadores equivalentes sobre otras parejas base/referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe las métricas de entrenamiento (KL, NMSE, L1) pero no reporta valores finales, comparaciones con MMLU, HumanEval, GSM8K ni ninguna otra métrica estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): en torno a 7,2 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache.
- En cuantización de 8 bits: aproximadamente 3,6 GB de pesos; en 4 bits: aproximadamente 1,8 GB (estimaciones por tamaño de parámetros, ya que la model card no documenta cuantizaciones específicas).
- GPU recomendadas para precisión completa: NVIDIA A100 40/80 GB, H100, L40S; cabe holgadamente en cualquier GPU con 16 GB o más.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) e incluso RTX 3060 12 GB en bf16; en 8 bits también en GPUs de 8 GB.
- Opciones de despliegue: la carga estándar es mediante las clases del repositorio (`models.auto.load_transcoder_model`) sobre `transformers`; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI. No se documenta soporte de llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (transcoder sobre gemma-2-2b) | 3.596.081.920 | 8.192 tokens (base) | Investigacion en interpretabilidad y bridging | No disponible | HuggingFace, 0 descargas, 0 likes |
| google/gemma-2-2b | ~2,6 mil millones | 8.192 tokens | Generacion de texto generalista | Gemma Terms of Use | Ampliamente disponible |
| google/gemma-2-2b-it | ~2,6 mil millones | 8.192 tokens | Chat / instrucciones | Gemma Terms of Use | Ampliamente disponible |

Comparado con las alternativas de interpretabilidad habituales (autoencoders dispersos y transcoders de GemmaScope), este adaptador integra el transcoder en los MLP del propio modelo en lugar de entrenarlo como sonda externa, lo que permite steering y grafos de atribución sobre el modelo completo. No se dispone de comparaciones numéricas publicadas con esas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generalista independiente: sin la rama transcoder activa, apenas reproduce el comportamiento del modelo base subyacente.
- La licencia del repositorio no está declarada; cualquier uso comercial exige verificar primero los términos del modelo base Gemma 2 y aclarar la licencia del adaptador con el autor.
- No hay resultados de benchmarks publicados, por lo que su calidad funcional no está validada de forma independiente.
- Repositorio sin descargas ni likes: es un artefacto de investigación reciente, sin adopción ni mantenimiento comunitario conocidos.
- La model card advierte de que no existe manifiesto de ejecución ni archivo de replay; la reproducibilidad exacta depende de reentrenar desde `train_config.yaml`.
- La carga requiere las clases del repositorio (`models.auto`), no la interfaz estándar de `transformers` con `AutoModelForCausalLM`, lo que añade fricción de integración.
- Idiomas soportados no declarados: la cobertura multilingüe depende del modelo base Gemma 2 2B.
- Riesgo de alucinación: heredado del modelo base; el adaptador no corrige los sesgos ni las alucinaciones de Gemma 2.
- Los pesos están en precisión completa (7,2 GB), sin GGUF ni cuantizaciones publicadas, lo que dificulta el despliegue en entornos restringidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_full_500k_l1_0p016_gemma2_2b_full_500k_tc8192_decb_l1w0.016_tarbb_sl15516714
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia: https://huggingface.co/google/gemma-2-2b-it
- Tokenizador: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Dataset de entrenamiento: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Paper: https://arxiv.org/abs/2602.20904
- Project page: https://transcoder-adapters.github.io/
- Codigo: https://github.com/Sid-MB/transcoder-adapters
