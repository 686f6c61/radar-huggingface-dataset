# siddharthmb/2026.TA.gemma4_2b_full_100k_gemma4_2b_full_100k_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_sl15299872

## Resumen

Este repositorio no es un modelo de lenguaje autónomo, sino un checkpoint de adaptadores transcoder dispersos ("sparse transcoder adapters") entrenados sobre el modelo base google/gemma-4-E2B en modo *bridging*. Lo publica el usuario siddharthmb dentro de una familia de experimentos de adaptación dispersa e interpretabilidad mecanicista (repositorio `transcoder-adapters` en GitHub). El checkpoint contiene la rama de adaptadores integrada en el modelo, de modo que se puede alternar entre el modelo híbrido (MLPs base con atención y embeddings del modelo de referencia) y el modelo con transcoders activados mediante `set_transcoders_enabled()`.

Técnicamente, cada MLP del transformer Gemma 4 se sustituye o complementa con un transcoder de 8192 características (`n_features=8192`) con sesgo de decodificador (`dec_bias=True`) y regularización L1 de 0.001, entrenado con pérdida KL contra el modelo de referencia google/gemma-4-E2B-it y términos adicionales de adaptación (`lambda_adapt=1.0`), bridging (`lambda_bridge=2.0`) y NMSE (`lambda_nmse=1`). El checkpoint en safetensors declara 5.509.713.699 parámetros, muy por encima de los ~2B efectivos del modelo base, porque los transcoders añaden parámetros por capa.

Su relevancia es de nicho y estrictamente investigadora: con 6 descargas y 0 likes, es un artefacto para estudiar adaptación dispersa, generar grafos de atribución y hacer *steering* de características individuales por su `cantor id`, no un modelo pensado para producción generalista. No se publican resultados de benchmarks, licencia, idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (transformer del modelo base google/gemma-4-E2B) con adaptadores transcoder dispersos |
| Parametros totales | 5.509.713.699 (segun safetensors del checkpoint) |
| Longitud de contexto | no disponible (el sufijo `tc8192` hace referencia a las 8192 caracteristicas del transcoder, no al contexto) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio del adaptador; el modelo base Gemma 4 se publica bajo Apache 2.0 segun la documentacion de Google |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base gemma4 (google/gemma-4-E2B), un transformer multimodal de la familia Gemma 4 de Google DeepMind que acepta entrada de texto e imagen, con audio soportado en las variantes E2B, E4B y 12B. Sobre esa columna vertebral, este checkpoint sustituye los MLP por transcoders dispersos de 8192 características, con sesgo de decodificador activado y un peso L1 de 0.001 que fuerza dispersidad en las activaciones. El modo de entrenamiento declarado es *bridging*, con `backbone: target`, `n_cutoffs: 1` y el tokenizador de google/gemma-4-E2B-it.

El entrenamiento se realizó durante 1 época con batch size 1, learning rate 0.0008, ratio de warmup 0.05 y pérdida de tipo KL contra el modelo de referencia instruct (google/gemma-4-E2B-it), combinada con los términos `lambda_adapt=1.0`, `lambda_bridge=2.0` y `lambda_nmse=1`. Los datos provienen de dos conjuntos: science-of-finetuning/fineweb-1m-sample (texto crudo tipo web) y siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits (conversaciones de LMSYS-Chat-1M divididas en particiones). No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; la pérdida KL indica destilación del comportamiento del modelo instruct, no alineamiento adicional.

## Capacidades

- Generación de texto y conversación: el checkpoint puede usarse como modelo de chat a través del CLI del repositorio (`analysis.chat.cli`), según el ejemplo de la model card.
- Modo dual: se puede activar o desactivar la rama de transcoders con `set_transcoders_enabled(False)`, obteniendo un modelo híbrido con los MLPs base y la atención y embeddings del modelo de referencia.
- *Steering* de características: permite amplificar o atenuar una característica concreta identificada por su `cantor id` mediante el flag `--steer CANTOR_ID:STRENGTH`.
- Análisis de atribución: genera grafos de atribución con `analysis.attribution.graphs.build_graphs`, con soporte de flags para prompt, GemmaScope y presupuesto de cómputo.
- Adaptación dispersa: representa un MLP aproximado con 8192 características dispersas, útil para estudiar sustitución de capas densas por representaciones dispersas.
- Herencia del modelo base: al usar la atención, los embeddings y el tokenizador de Gemma 4, hereda las capacidades multimodales (texto e imagen, y audio en E2B) del modelo base, aunque no se documenta que el entrenamiento del adaptador las preserve explícitamente.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad mecanicista: construir grafos de atribución sobre este adaptador para trazar qué características contribuyen a una predicción concreta, aprovechando la integración con GemmaScope que menciona la model card.
- *Steering* controlado de comportamiento: identificar una característica por su `cantor id` y modificarla con `--steer` para estudiar su efecto causal en la salida, un flujo habitual en experimentos de circuitos y activaciones.
- Estudio de adaptación dispersa: comparar el comportamiento del modelo con transcoders activados frente al híbrido con MLPs base (`set_transcoders_enabled(False)`) para medir cuánta capacidad se preserva al sustituir capas densas por representaciones dispersas de 8192 características.
- Experimentos de *bridging* entre modelo base y modelo instruct: el modo `bridging` con pérdida KL está diseñado para que el adaptador aproxime el comportamiento de google/gemma-4-E2B-it partiendo del modelo base, lo que permite estudiar transferencia de comportamiento entre ambos.
- Destilación de modelos pequeños: el esquema de entrenamiento (KL contra un modelo instruct de referencia, L1 para dispersidad) sirve como plantilla para destilar capacidades en adaptadores compactos con coste de inferencia reducido.
- Auditoría de características sobre corpus conversacionales: usar los splits de LMSYS-Chat-1M como material de entrada para analizar qué características se activan ante distintos tipos de conversación.
- Reproducción y comparación de configuraciones: el mismo autor publica variantes con 10k, 100k y `scale1000`/`tc1024`, de modo que este checkpoint sirve como punto de comparación en un barrido sistemático de hiperparámetros de transcoders.
- Generación de texto exploratoria: usar el CLI de chat para verificar cualitativamente la fidelidad del adaptador antes de lanzar análisis más costosos de atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de reconstrucción (por ejemplo, pérdida KL o NMSE frente al modelo de referencia), a pesar de que el entrenamiento optimiza explícitamente esas funciones.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del recuento real de parámetros del checkpoint (5.509.713.699), en bf16/fp16 se necesitan aproximadamente 11,0 GB solo para los pesos; en fp32, unos 22,0 GB; en int8, unos 5,5 GB; en int4, unos 2,8 GB. Hay que sumar activaciones y caché KV, cuyo tamaño depende de la longitud de contexto, dato no disponible.
- GPU recomendadas: A100 40 GB o 80 GB, H100 y tarjetas profesionales con 24 GB o más para trabajar en bf16 sin cuantizar.
- GPU de consumo: cabe en bf16 en una RTX 3090 o RTX 4090 de 24 GB, con margen limitado para contexto largo. En equipos con 8-16 GB solo sería viable con cuantización, y no se documenta soporte de cuantización para los transcoders.
- Opciones de despliegue: el repositorio proporciona clases propias (`models.auto.load_transcoder_model` y `load_tokenizer`) sobre transformers, con `device_map="auto"`. No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI; dado que el checkpoint incluye lógica de transcoders y activación/desactivación de ramas, es probable que requiera el código del repositorio `Sid-MB/transcoder-adapters`.
- Latencia y throughput estimados: no disponible. La model card no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Caracteristicas de transcoder | Modo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (full_100k, tc8192) | 5.509.713.699 | 8192 | bridging | no disponible | 6 descargas, 0 likes |
| siddharthmb/2026.TA.gemma4_2b_full_10k_..._tc8192 | no disponible | 8192 | no disponible | no disponible | publico en HuggingFace |
| siddharthmb/2026.TA.gemma4_2b_scale1000_..._tc1024 | no disponible | 1024 | no disponible | no disponible | publico en HuggingFace |
| google/gemma-4-E2B (modelo base) | ~2B efectivos | no aplica | no aplica | Apache 2.0 | modelo oficial de Google DeepMind |

La comparación con alternativas de la misma categoría (adaptadores transcoder de otros autores) no está disponible en la información proporcionada. Frente al modelo base, la diferencia clave es que este checkpoint incorpora parámetros adicionales de transcoders y está optimizado para análisis de características, no para maximizar calidad generativa.

## Limitaciones y advertencias

- Artefacto de investigación: con 6 descargas y 0 likes, no hay validación comunitaria, ni evaluación de calidad, ni garantía de mantenimiento.
- No se publican benchmarks: no hay ninguna métrica objetiva de fidelidad respecto al modelo de referencia, pese a entrenarse con pérdida KL.
- Dependencia de código propio: el uso requiere las clases `models.auto` y los scripts `analysis.*` del repositorio `Sid-MB/transcoder-adapters`; no es cargable con un `AutoModelForCausalLM` estándar, lo que complica su integración en pipelines existentes.
- Licencia ambigua: el repositorio del adaptador no declara licencia. Aunque el modelo base Gemma 4 se publica bajo Apache 2.0 según la documentación de Google, el uso comercial de este checkpoint derivado debería verificarse con el autor antes de llevarlo a producción.
- Riesgo de alucinación: al ser un adaptador que aproxima (no replica) el modelo de referencia, la pérdida KL con `lambda_adapt=1.0` y `lambda_bridge=2.0` no garantiza paridad de comportamiento; se esperan desviaciones respecto a gemma-4-E2B-it.
- Sesgos: los datos de entrenamiento (FineWeb-1M y LMSYS-Chat-1M) arrastran los sesgos propios de corpus web y de conversaciones recogidas en plataformas de chat; no se documenta ningún proceso de mitigación.
- Restricciones de contexto e idioma: se desconoce la ventana de contexto efectiva tras la adaptación y qué idiomas conserva el adaptador, ya que no se publica ninguna lista de idiomas soportados.
- Sin soporte documentado de cuantización: no se ofrecen variantes GGUF, AWQ o GPTQ, lo que limita el despliegue en hardware modesto y en runtimes de inferencia populares.
- Hiperparámetros extremos para producción: batch size 1, una sola época y learning rate 0.0008 indican un experimento de investigación, no un entrenamiento orientado a robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma4_2b_full_100k_gemma4_2b_full_100k_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_sl15299872
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Modelo de referencia (instruct): https://huggingface.co/google/gemma-4-E2B-it
- Repositorio GitHub del proyecto: https://github.com/Sid-MB/transcoder-adapters
- Dataset de preentrenamiento: https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Dataset conversacional: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Variante relacionada (tc8192, full_10k): https://huggingface.co/siddharthmb/2026.TA.gemma4_2b_full_10k_gemma4_2b_full_10k_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_sl15298069
- Variante relacionada (tc1024, scale1000): https://huggingface.co/siddharthmb/2026.TA.gemma4_2b_scale1000_gemma4_2b_small_gemma4_2b_scale_1000_tc1024_decb_l1w0.001_sl15296694
- Listado de fine-tunes de gemma-4-E2B: https://huggingface.co/models?other=base_model:finetune:google%2Fgemma-4-E2B
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Sitio divulgativo de Gemma 4: https://gemma4.com/
