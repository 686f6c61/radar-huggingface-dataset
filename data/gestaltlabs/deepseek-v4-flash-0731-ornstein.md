# GestaltLabs/DeepSeek-V4-Flash-0731-Ornstein

## Resumen

DeepSeek-V4-Flash-0731-Ornstein es un ajuste fino de razonamiento del modelo DeepSeek-V4-Flash-0731, desarrollado por GestaltLabs. Se trata de una fusión con adaptadores LoRA entrenados en Fireworks AI e integrados en los pesos base. El modelo hereda la arquitectura DeepseekV4ForCausalLM, una mezcla de expertos (MoE) con 43 capas, 256 expertos y una ventana de contexto de 1.048.576 tokens. El objetivo declarado por el autor es inyectar un modo de pensamiento denominado «Ornstein» en el modelo base, aunque se indica explícitamente que es una fusión temprana, no una versión de calidad final, y que se planean más entrenamientos con entornos de RL y ajuste basado en energía.

El repo de HuggingFace se encuentra todavía en estado de preparación de exportación BF16. A fecha de la información consultada, el checkpoint completo no está descargable; los objetivos de exportación son 48 shards con un payload de 608.450.282.488 bytes. Como modelo de investigación, es relevante por su arquitectura MoE con predicción multi-token y por la documentación del proceso de fusión y de-cuantización, pero no hay ninguna evaluación de benchmarks que respalde su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV4ForCausalLM (deepseek_v4), transformer MoE con Multi-Head Latent Attention |
| Parametros totales | no disponible |
| Parametros activos | no especificado; arquitectura MoE con 6 expertos enrutados activos por token + 1 experto compartido |
| Longitud de contexto | 1.048.576 tokens (con escalado YaRN RoPE, factor 16, base original 65536) |
| Tipos de cuantizacion | BF16 en safetensors, con 433 tensores conservados en F32 y 3 en I64; no se ofrecen otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (objetivo: 48 shards BF16, actualmente en preparacion) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura DeepseekV4ForCausalLM, con 43 capas ocultas, 3 capas de hash-routing, hidden size 4096, 64 cabezas de consulta y 1 KV head con Multi-Head Latent Attention (MHLA) de dimensión 512. La ventana deslizante es de 128 tokens. La mezcla de expertos consta de 256 expertos enrutados, con moe_intermediate_size 2048, de los cuales 6 se activan por token, más un experto compartido. El vocabulario alcanza 129.280 tokens. El contexto de 1.048.576 tokens se habilita mediante escalado YaRN RoPE con factor 16 y posición máxima original de 65536.

El entrenamiento se realizó mediante adaptadores LoRA entrenados en Fireworks AI y fusionados en 33.450 matrices lineales. Según el autor, se trata de un «early merge» que inyecta el pensamiento Ornstein, no una release de calidad. Toda la actualización del LoRA se promovió a BF16 y los vectores de escala se eliminaron. En la verificación de fusión, 5.499 tensores no objetivo pasaron comparaciones byte-level contra el base oficial, y 23 sondas numéricas confirmaron el redondeo BF16. Los pesos del modelo base original están publicados en FP4/FP8 mixto; la de-cuantización a BF16 de los pesos no LoRA elimina 2.350 tensores de escala apareados, pero no recupera la precisión perdida en la cuantización interna de DeepSeek.

Se incluyen además tres etapas físicas de predicción multi-token (mtp.0, mtp.1, mtp.2) con block_size 5 y markov_rank 256, conservadas íntegramente y de-cuantizadas a BF16. No se aplicó LoRA sobre estas capas.

## Capacidades

- Generación de texto y razonamiento orientado: el autor describe una inyección de «Ornstein thinking»; sin embargo, no se ha validado con evaluaciones downstream.
- Razonamiento multi-paso y agentes: hereda las capacidades agenticas del modelo base, que en la documentación oficial se describe como una versión con «capacidades agenticas sustancialmente mejoradas» respecto a la preview.
- Contexto largo: ventana de 1.048.576 tokens, lo que permitiría procesar documentos muy extensos o historiales de conversación largos.
- Multi-Token Prediction (DSpark): arquitectura de predicción multi-token con tres etapas físicas y pesos conservados; el soporte en Transformers actual ignora estos pesos y desactiva la generación asistida.
- Tool calling / function calling: no se especifica directamente para este fine-tune; el modelo base está catalogado como agentic, por lo que es una capacidad potencial, no confirmada.

## Casos de uso

- Investigación en razonamiento automático: el modelo puede usarse como base para estudiar la inyección de estilos de pensamiento en MoE de gran escala, aunque no hay benchmarks que garanticen resultados.
- Análisis de documentación científica: la ventana de 1M de tokens permite procesar corpus extensos de artículos o informes técnicos en una sola pasada, siempre que se disponga de un servidor de inferencia compatible.
- Experimentación con agentes conversacionales: gracias al contexto largo y a la arquitectura del base, se podría integrar en pipelines de razonamiento encadenado para tareas de consulta sobre documentos largos.
- Investigación en predicción multi-token: el modelo conserva los pesos DSpark, lo que lo convierte en un candidato para estudiar el impacto de la predicción multi-token en la calidad de generación.
- Prototipo de ajuste con RL: al ser un checkpoint con fusión LoRA documentada, puede servir como punto de partida para pruebas de fine-tuning con reforzamiento o ajuste basado en energía, tal y como planea el autor.
- Verificación de integridad de fusión: el proceso de fusión y de-cuantización está documentado con detalle, por lo que el repo puede ser útil para auditar técnicas de merge de LoRA y pérdida de precisión en cuantización mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks. El autor declara explícitamente que no se ha ejecutado ninguna suite de evaluación downstream en este checkpoint. La verificación de pesos a nivel de tensores no constituye evidencia de rendimiento en tareas finales. Por tanto, no hay datos numéricos de MMLU, HumanEval, GSM8K ni similares para este modelo.

## Requisitos de hardware

- VRAM estimada: el payload objetivo en BF16 es de aproximadamente 608 GB. Solo los pesos, sin contar KV cache ni activaciones, requieren un agregado de memoria de GPU superior a 600 GB.
- GPU recomendadas: no se especifican por el autor. Para cargar el checkpoint BF16 completo se necesitan múltiples aceleradores de centro de datos, como A100, H100 o H200, o sistemas equivalentes.
- GPUs de consumidor: no es apto para tarjetas de consumo; el volumen de pesos lo impide.
- Opciones de despliegue: con la instalación estándar de Transformers 4.57.6, la arquitectura no está soportada. Se necesita el código de desarrollo de Transformers (commit cbc1651a), que implementa attention eager pero ignora los pesos mtp.* y desactiva la generación asistida. Para vLLM o SGLang se requieren builds con kernels BF16 para las capas MoE, ya que los backends oficiales estaban diseñados para FP4/FP8. En la práctica, la inferencia de este checkpoint en frameworks estables no es viable sin trabajo de ingeniería adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Benchmarks | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-Ornstein | no disponible | 1.048.576 | Fusión temprana, sin evaluaciones | no disponibles | MIT |
| DeepSeek-V4-Flash-0731 (base) | no disponible en la información consultada; fuentes externas indican 284B/13B MoE | 1.048.576 | Release oficial | no incluidos en esta ficha | MIT |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | Preview | no incluidos | MIT |

No se dispone de otros modelos comparables dentro de la misma categoría con datos verificados en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene todavía un checkpoint descargable completo; la publicación de los 48 shards BF16 está en curso.
- No se ha ejecutado ninguna evaluación downstream. Los resultados de calidad no están demostrados, y no se puede asumir paridad con otros modelos.
- La de-cuantización a BF16 no restaura la precisión perdida en la cuantización FP4/FP8 del modelo base oficial.
- Transformers 4.57.6 no reconoce la arquitectura DeepseekV4ForCausalLM; se requiere una versión de desarrollo, que además ignora los pesos de predicción multi-token.
- vLLM y SGLang no soportan carga de pesos BF16 sin builds con kernels especializados para las capas MoE.
- El tokenizer del modelo base no incluye una plantilla Jinja de chat. Es obligatorio usar el script de encoding proporcionado por el autor para formatear los mensajes.
- El autor advierte de que es una «fusión temprana» y no una «version de calidad final»; no se recomienda para aplicaciones de producción sin una evaluación completa previa.
- No hay información sobre sesgos, alucinaciones o restricciones de uso más allá de la licencia MIT; la ausencia de evaluaciones implica que esos riesgos permanecen sin caracterizar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GestaltLabs/DeepSeek-V4-Flash-0731-Ornstein
- Repositorio GGUF relacionado: https://huggingface.co/GestaltLabs/DeepSeek-V4-Flash-0731-Ornstein-GGUF
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Código de desarrollo de Transformers para DeepseekV4: https://github.com/huggingface/transformers/blob/cbc1651a032b923da7f4b44b3d0e6f68e6ba6b55/src/transformers/models/deepseek_v4/modeling_deepseek_v4.py
- Referencia de DeepSeek V4 (felloai): https://felloai.com/deepseek-v4/
- Documentación de la API de DeepSeek-V4-Flash-0731 (DeepInfra): https://deepinfra.com/deepseek-ai/DeepSeek-V4-Flash-0731/api
- Ko-fi del autor: https://ko-fi.com/djlougen
