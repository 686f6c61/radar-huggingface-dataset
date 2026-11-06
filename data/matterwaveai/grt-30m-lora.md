# MatterWaveAI/grt-30m-lora

## Resumen

GRT-30M-LoRA es un adaptador de bajo rango (LoRA) publicado por MatterWaveAI sobre el modelo base MatterWaveAI/grt-30m, un transformer de 29.305.498 parámetros construido sobre una arquitectura denominada Geometric Rotation Transformer (GRT). A diferencia de un LoRA convencional, que modifica matrices de pesos densas mediante el producto W + BA, este adaptador opera sobre los ángulos de fase de las rotaciones de Givens que parametrizan cada proyección del modelo base. El resultado es un adaptador de 573,3 KB con 140.741 parámetros entrenables (el 0,48 % del modelo base) que puede fusionarse en el checkpoint original sin sobrecoste de latencia ni de parámetros en inferencia.

La relevancia de esta publicación es fundamentalmente metodológica: demuestra que es posible aplicar adaptación de bajo rango a arquitecturas que carecen por completo de capas nn.Linear y nn.Conv1d (el modelo base declara 0 de cada), manteniendo invariantes de variedad ortogonal/unitaria. El adaptador se entrena con un optimizador propio, HessianPairAdam, basado en curvatura Gauss-Newton analítica del denominado Sophia-Torus, y se distribuye con licencia Apache 2.0.

Se trata de un artefacto de investigación, no de un modelo de propósito general: el tamaño de 30M parámetros, la ausencia de datos publicados sobre idiomas y la escasez de benchmarks lo sitúan en el terreno de la validación arquitectónica y la experimentación, no en el de producción comercial a gran escala. El adaptador incluye además una versión GGUF en el repositorio, lo que facilita su inspección y despliegue en entornos ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometric Rotation Transformer (GRT) con adaptador GRTRotationalLoRA (rotaciones de Givens sobre toro plano) |
| Parametros totales | 29.305.498 (modelo base); 140.741 parámetros entrenables del adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF incluido en el repositorio; niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (grt_lora_adapter.safetensors) y GGUF |

## Arquitectura y entrenamiento

El modelo base GRT sustituye las proyecciones lineales densas por rotaciones parametrizadas mediante ángulos de fase sobre el toro plano T^P = (S^1)^P y escalas radiales. Cada proyección se implementa como una mariposa de rotaciones de Givens, de modo que el modelo no contiene ninguna capa nn.Linear ni nn.Conv1d. Esta elección impone restricciones de ortogonalidad y unitariedad que un LoRA estándar rompería, ya que W + BA no preserva los invariantes de la variedad.

GRTRotationalLoRA resuelve esta limitación adjuntando matrices de desplazamiento de fase de bajo rango, lora_A y lora_B, directamente a los tensores de ángulos de la mariposa de rotación, según theta = (theta_base + (alpha/r)·A·B) mod 2π. El adaptador usa r = 8 y lora_alpha = 16,0 (escalado 2,0), y opcionalmente ajusta las escalas radiales (tune_scales=True). El entrenamiento emplea HessianPairAdam, un optimizador que aproxima la curvatura Gauss-Newton de forma analítica en el marco Sophia-Torus. En inferencia, la función merge_grt_lora pliega el desplazamiento de fase en theta_base con equivalencia bit a bit (max_abs_diff = 0.0), de modo que no hay latencia ni parámetros adicionales tras la fusión. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva mediante GRTForCausalLM, con prompt con formato de chat (<|im_start|>user ... <|im_end|>).
- Adaptación de dominio mediante ajuste fino de fases de rotación, sin modificar la topología del modelo base.
- Fusión del adaptador en el modelo base con equivalencia bit a bit y sin coste en inferencia.
- Entrenamiento de adaptadores propios con attach_grt_lora, build_grt_optimizer y save_grt_lora_pretrained.
- Compatibilidad con endpoints (tag endpoints_compatible) y con la librería transformers.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en este adaptador; el ecosistema GRT incluye variantes VL, TTS, ASR y Omni en repositorios separados.

## Casos de uso

- Investigación en adaptación paramétricamente eficiente: el adaptador sirve como referencia reproducible para estudiar cómo aplicar LoRA a arquitecturas sin capas lineales, comparando el comportamiento de GRTRotationalLoRA frente a un LoRA euclídeo convencional sobre el mismo corpus.
- Ajuste de dominio sobre el modelo base: partiendo de MatterWaveAI/grt-30m, se puede entrenar un adaptador específico de dominio con un coste de 140.741 parámetros y 573,3 KB por checkpoint, lo que permite mantener decenas de variantes sin duplicar el modelo base.
- Despliegue en entornos con restricciones de memoria: al fusionarse en el modelo base y no añadir latencia, el adaptador resultante cabe en CPU y en GPUs de gama baja, adecuado para prototipos y pruebas de concepto.
- Validación de invariancias geométricas: el adaptador permite verificar empíricamente que la fusión de fases preserva la ortogonalidad de las rotaciones (max_abs_diff = 0.0), útil en líneas de investigación sobre arquitecturas geométricas.
- Docencia y divulgación: el tamaño reducido del modelo base y del adaptador facilita explicar de forma práctica el funcionamiento de LoRA, las rotaciones de Givens y los optimizadores de segundo orden en cursos de aprendizaje profundo.
- Base para pipelines de evaluación de arquitecturas alternativas: el adaptador puede integrarse en un banco de pruebas que compare perplexity y precisión de token entre variantes GRT (base, chat, MoR) bajo un mismo protocolo de ajuste.
- Experimentación con cuantización GGUF: la presencia de pesos GGUF en el repositorio permite probar el adaptador en herramientas de inferencia ligera y medir el impacto de la cuantización en un modelo puramente rotacional.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de ajuste del adaptador sobre el dominio de entrenamiento (Domain Assistant Loss, perplejidad y precisión de token), no benchmarks estándar de la comunidad.

| Metrica | Antes del adaptador | Despues del adaptador |
|---|---|---|
| Domain Assistant Loss | 6,1720 | 4,7464 |
| Domain Perplexity | 479,14 | 115,16 |
| Token Accuracy | 19,5 % | 28,8 % |
| max_abs_diff pre-merge vs post-merge | no aplica | 0,0e+00 (bit-exacto) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en float32 ocupa aproximadamente 117 MB (29,3M parámetros × 4 bytes); en float16, unos 59 MB; el adaptador añade 573,3 KB antes de la fusión y nada después.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU y CPU.
- Opciones de despliegue: transformers (GRTForCausalLM con load_grt_lora_pretrained), llama.cpp u otras herramientas compatibles con GGUF para los pesos cuantizados; vLLM y TGI no están confirmados para la arquitectura GRT.
- Latencia y throughput estimados: no disponibles; la fusión del adaptador garantiza cero sobrecoste de latencia en inferencia tras merge_grt_lora.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores LoRA sobre arquitecturas sin capas lineales) en la documentación proporcionada. Como referencia de tamaño dentro del propio ecosistema GRT, se listan las variantes publicadas por el mismo autor:

| Modelo | Parametros | Tipo | Licencia |
|---|---|---|---|
| MatterWaveAI/grt-30m | 29.305.498 | Base causal LM | Apache 2.0 |
| MatterWaveAI/grt-30m-lora | 140.741 (adaptador) | LoRA rotacional | Apache 2.0 |
| MatterWaveAI/grt-30m-chat | no disponible | Ajuste conversacional | Apache 2.0 |
| MatterWaveAI/grt-30m-mor | no disponible | MoE de 4 expertos | Apache 2.0 |

Comparativa con alternativas externas: no disponible.

## Limitaciones y advertencias

- Modelo de investigación: con 29,3M parámetros y sin benchmarks estándar publicados, no es adecuado como modelo de propósito general ni para tareas de producción exigentes.
- Idiomas soportados no documentados: no hay información sobre cobertura lingüística, por lo que no puede asumirse un rendimiento fiable en castellano ni en ningún otro idioma.
- Longitud de contexto no disponible: se desconoce la ventana máxima, lo que limita el diseño de aplicaciones con contexto largo.
- Riesgo de alucinación: inherente a cualquier modelo generativo de este tamaño; la perplejidad de dominio tras el ajuste (115,16) sigue siendo alta en términos absolutos.
- Dependencia de código personalizado: requiere transformers.models.grt y funciones específicas (load_grt_lora_pretrained, merge_grt_lora); no es compatible con herramientas LoRA estándar como peft sin adaptación.
- Sesgos: no se ha publicado información sobre sesgos ni sobre la composición del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del modelo base y de las dependencias.
- Madurez del ecosistema: el repositorio tiene 52 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-lora
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Variante chat: https://huggingface.co/MatterWaveAI/grt-30m-chat
- Variante MoR (4 expertos): https://huggingface.co/MatterWaveAI/grt-30m-mor
- Embedding: https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Reranker: https://huggingface.co/MatterWaveAI/grt-30m-reranker
- Vision-Language: https://huggingface.co/MatterWaveAI/grt-30m-vl
- Tokenizer: https://huggingface.co/MatterWaveAI/grt-30m-tokenizer
- Text-to-Speech: https://huggingface.co/MatterWaveAI/grt-30m-tts
- Omni (visión, audio, lenguaje y habla): https://huggingface.co/MatterWaveAI/grt-30m-omni
- ASR: https://huggingface.co/MatterWaveAI/grt-30m-asr
- Whitepaper (PDF): https://huggingface.co/MatterWaveAI/grt-30m/resolve/main/GRT_Whitepaper.pdf
