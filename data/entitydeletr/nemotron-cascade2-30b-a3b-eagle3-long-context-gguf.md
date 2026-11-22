# EntityDeletr/Nemotron-Cascade2-30B-A3B-Eagle3-Long-Context-GGUF

## Resumen

Este repositorio contiene una versión cuantizada de un *draft head* Eagle3 para decodificación especulativa, entrenado contra el verificador `nvidia/Nemotron-Cascade-2-30B-A3B`. No es un modelo generativo autónomo, sino un cabezal auxiliar de 208 millones de parámetros que propone tokens candidatos que el verificador de 30B valida en paralelo, acelerando la inferencia sin alterar la distribución de salida. El autor original del modelo base es `chankhavu`; esta variante la publica `EntityDeletr` con pesos en safetensors, GGUF bf16 y GGUF Q6_K.

La relevancia técnica reside en dos primicias que el autor declara: es el primer cabezal Eagle3 entrenado contra un verificador híbrido Mamba-Transformer con arquitectura MoE, y el primero en aplicar atención de ventana deslizante (4.096 tokens) sobre el propio draft como optimización para contexto largo. El draft consume estados ocultos de tres capas concretas del verificador (índices 2, 26 y 48 de 52) y mantiene `max_position_embeddings` en 262.144 para no limitar el `max_model_len` del servidor.

El modelo está pensado para despliegue en producción con llama.cpp mainline o vLLM 0.19+, y su utilidad práctica es puramente de aceleración: reducir el coste por token generado en cargas de trabajo de contexto largo servidas con el verificador Nemotron-Cascade-2-30B-A3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft head Eagle3: 1 bloque transformer Llama con atención de ventana deslizante (band causal), GQA |
| Parametros totales | 208.676.608 (dato real de safetensors) |
| Parametros activos | no disponible (el draft no es MoE; el verificador sí lo es) |
| Longitud de contexto | `max_position_embeddings=262144`; ventana deslizante efectiva de 4096 tokens en el draft |
| Tipos de cuantizacion | bf16 (GGUF sin cuantizar) y Q6_K |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF (bf16 y Q6_K) |

Parámetros internos del draft: `hidden_size=2688` (igualado al residual stream del verificador), `intermediate_size=8064`, `head_dim=128`, `num_attention_heads=32`, `num_key_value_heads=2`, `vocab_size=131072`, `draft_vocab_size=32000`, `sliding_window=4096`.

## Arquitectura y entrenamiento

El draft es un único bloque transformer tipo Llama que actúa como cabezal de predicción especulativa Eagle3. Consume los estados ocultos de tres capas del verificador —índices 2 (Mamba temprana, ~4% de profundidad), 26 (atención central, ~51%) y 48 (Mamba tardía, ~94%)— y aprende a mapearlos a la predicción del siguiente token. La selección sigue la receta *early/mid/late* de NVIDIA para gpt-oss-120b; se evita deliberadamente la capa 0 por su proximidad al embedding y la última por colapsar hacia la distribución del propio verificador. El vocabulario del draft se recorta a 32.000 entradas frente a las 131.072 del verificador.

El verificador `nvidia/Nemotron-Cascade-2-30B-A3B` es un MoE híbrido Mamba-Transformer de 52 capas con patrón `MEMEM*EMEMEM*EMEMEM*EMEMEM*EMEMEM*EMEMEMEM*EMEMEMEME`: 23 capas Mamba, 23 capas MLP/MoE y 6 capas de atención GQA en los índices canónicos `[5, 12, 19, 26, 33, 42]`. La innovación principal del draft es la atención de ventana deslizante de 4.096 tokens, que acota el coste de atención del cabezal en secuencias largas manteniendo `max_position_embeddings` alineado con el verificador. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el draft.

## Capacidades

- Generación especulativa de tokens candidatos para decodificación Eagle3; no genera texto de forma autónoma.
- Aceleración de inferencia sobre el verificador `nvidia/Nemotron-Cascade-2-30B-A3B` mediante validación paralela de propuestas.
- Soporte de contexto largo hasta 262.144 posiciones declaradas, con atención limitada a ventana de 4.096 tokens.
- Compatibilidad con llama.cpp mainline (no con forks) y con vLLM 0.19+ (probado con iteración en vuelo de L=32k).
- Integración con el ecosistema SpecForge mediante el backend NemotronH.
- Capacidades multilingües: únicamente inglés (`en`).
- No soporta tool calling, agentes ni razonamiento multi-paso por sí mismo; hereda las capacidades del verificador.

## Casos de uso

- Servicio de inferencia de contexto largo con Nemotron-Cascade-2-30B-A3B: el draft acelera la generación en vLLM 0.19+ manteniendo la distribución del verificador, adecuado para cargas con ventanas de decenas de miles de tokens.
- Reducción de coste por token en producción: al proponer varios tokens por paso y validarlos en paralelo, disminuye el número de pasos de decodificación del verificador de 30B.
- Despliegue en llama.cpp mainline: la versión Q6_K permite servir el draft junto al verificador en entornos sin vLLM, manteniendo compatibilidad estricta con la implementación oficial.
- Experimentación en investigación sobre decodificación especulativa: sirve como referencia para estudiar cabezales Eagle3 sobre verificadores híbridos Mamba-Transformer MoE.
- Evaluación de atención de ventana deslizante en drafts: permite medir el impacto de `sliding_window=4096` en la tasa de aceptación frente a atención completa en contexto largo.
- Integración en pipelines SpecForge: el backend NemotronH permite reentrenar o ajustar el cabezal con los mismos índices de capa auxiliares (2/26/48).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el draft: ~0,4 GB en bf16 (208,7 M parámetros) y ~0,17 GB en Q6_K; el repositorio completo ocupa 0,5 GB.
- La VRAM dominante la impone el verificador de 30B, no el draft; el draft añade una sobrecarga marginal.
- GPU recomendadas: las mismas que exija el verificador (A100, H100, RTX 4090, etc.); el draft no impone requisitos propios significativos.
- Cabe en cualquier GPU consumer que ya aloje el verificador, dado su tamaño reducido.
- Opciones de despliegue: llama.cpp mainline (no forks) y vLLM 0.19+ (probado). SGLang no soporta aún atención de ventana deslizante en drafts Eagle3; TensorRT-LLM no probado.
- Latencia y throughput: no disponibles; dependen del verificador y de la tasa de aceptación del draft.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este draft (Eagle3, Nemotron-Cascade2) | 208,7 M | 262.144 (ventana 4.096) | Draft especulativo para verificador híbrido MoE | apache-2.0 | HF, GGUF y safetensors |
| Draft Eagle3 de gpt-oss-120b (NVIDIA) | no disponible | no disponible | Draft especulativo de referencia (receta early/mid/late) | no disponible | no disponible |
| Verificador Nemotron-Cascade-2-30B-A3B | 30B (MoE) | no disponible | Modelo generativo verificado | no disponible | HF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el verificador `nvidia/Nemotron-Cascade-2-30B-A3B` para producir salida válida.
- Solo funciona con llama.cpp mainline; los forks no son compatibles.
- SGLang no soporta todavía atención de ventana deslizante en drafts Eagle3, por lo que no es un motor recomendado actualmente.
- Los índices de capa (2/26/48) dependen de la convención de numeración del motor; deben verificarse al portar a TensorRT-LLM u otros motores comparando volcados de estados ocultos.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de alucinación heredado del verificador; el draft no lo mitiga.
- Sesgos: no documentados en la información disponible.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del verificador y del modelo base original.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EntityDeletr/Nemotron-Cascade2-30B-A3B-Eagle3-Long-Context-GGUF
- Modelo base (draft sin cuantizar): https://huggingface.co/chankhavu/Nemotron-Cascade2-30B-A3B-Eagle3-Long-Context
- Verificador: https://huggingface.co/nvidia/Nemotron-Cascade-2-30B-A3B
- Paper Eagle3: https://arxiv.org/abs/2503.01840
