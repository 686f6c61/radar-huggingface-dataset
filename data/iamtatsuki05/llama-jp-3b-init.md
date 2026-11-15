# iamtatsuki05/Llama-JP-3B-init

## Resumen

Llama-JP-3B-init es un checkpoint de Llama con inicialización aleatoria (random init) publicado por el usuario iamtatsuki05 dentro del proyecto MIREI. No es un modelo entrenado ni utilizable para inferencia real: se distribuye como punto de partida para preentrenamiento, reutilizando la configuración y el tokenizador de sbintuitions/sarashina2.2-3b. Su interés es, por tanto, metodológico: permite reproducir o comparar arquitecturas bajo condiciones controladas con un tokenizador japonés de vocabulario amplio.

El modelo emplea una arquitectura transformer decoder-only tipo Llama, con dimensión de embedding de 2560, codificación posicional RoPE y una longitud máxima de secuencia de 8192 tokens. El tokenizador es SentencePiece con un vocabulario de 102.400 entradas, heredado de la familia sarashina2.2, lo que lo hace adecuado para experimentación en japonés.

Su relevancia actual es limitada pero específica: sirve como baseline de inicialización para quienes quieran entrenar modelos japoneses de ~3B parámetros y comparar arquitecturas encoder/decoder en igualdad de condiciones, tal como plantea la publicación asociada (NLP2026). No debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 3.355.609.600 (3.093M según model card, sin contar embeddings: 2.831M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (solo se documenta bfloat16 en el ejemplo de uso) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con el stack estándar de Llama: atención multi-cabeza con RoPE, capas feed-forward y normalización previa. La dimensión de embedding es 2560 y la longitud máxima de secuencia es de 8192 tokens. El tokenizador es SentencePiece con vocabulario de 102.400 tokens, compartido con la familia sarashina2.2 de SB Intuitions, lo que facilita comparaciones directas con esa línea de modelos.

El punto crítico es que **no ha recibido entrenamiento**: los pesos están inicializados aleatoriamente. La model card lo declara explícitamente como "a starting point for pre-training, not a usable model". No hay datos sobre número de tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna otra fase de alineamiento, porque no existe tal entrenamiento. Tampoco se documentan innovaciones técnicas más allá de la reutilización de la configuración y el tokenizador de sarashina2.2-3b.

## Capacidades

- Generación de texto: no funcional. Al ser pesos aleatorios, la salida es ruido estadístico sin coherencia lingüística.
- Razonamiento, código y matemáticas: no disponibles por la misma razón.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: el tokenizador está orientado al japonés; el modelo no ha aprendido ninguna lengua.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Uso previsto: inicialización de pesos para preentrenamiento y experimentación arquitectónica.

## Casos de uso

- Preentrenamiento desde cero en japonés: el checkpoint sirve como punto de partida con configuración y tokenizador ya validados, evitando tener que definir a mano la arquitectura y el vocabulario.
- Comparación encoder vs. decoder: junto con ModernBERT-JP-3B-init del mismo autor, permite analizar el rendimiento de embeddings de frases bajo condiciones idénticas, que es el objetivo declarado del artículo MIREI.
- Reproducibilidad de experimentos: al compartir tokenizador con sarashina2.2, facilita comparaciones controladas frente a modelos ya entrenados de SB Intuitions.
- Investigación sobre tokenizadores japoneses: el vocabulario de 102.400 tokens permite estudiar el impacto de la granularidad del tokenizador en el coste de entrenamiento y en la calidad final.
- Baseline para ablation studies: útil para medir cuánto aporta cada fase de entrenamiento (pretraining, SFT, DPO) partiendo de un estado inicial conocido.
- Desarrollo de pipelines de entrenamiento: sirve para validar infraestructura (distribución, mixed precision, flash-attention) antes de lanzar entrenamientos costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint con inicialización aleatoria, no existen métricas de calidad lingüística que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 6,7 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para secuencias cortas.
- En cuantización de 8 bits: alrededor de 3,5 GB de pesos; en 4 bits, alrededor de 1,8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas para entrenamiento: A100 40/80 GB o H100 para preentrenamiento a escala; RTX 4090 (24 GB) permite entrenamiento con precisión mixta y batch pequeño usando aceleraciones como DeepSpeed o FSDP.
- GPU de consumo: cabe en RTX 3090/4090 y en GPUs de 12-16 GB para inferencia, aunque la inferencia carece de sentido sin entrenamiento previo.
- Opciones de despliegue: transformers con accelerate y flash-attn 2.7.3 o superior; text-generation-inference figura entre los tags del repo; no se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-JP-3B-init (este) | 3.355M | 8.192 | No (random init) | MIT | Hugging Face |
| sbintuitions/sarashina2.2-3b | ~3B | no disponible en la informacion | Si | no disponible en la informacion | Hugging Face |
| iamtatsuki05/ModernBERT-JP-3B-init | 3.309M | no disponible en la informacion | No (random init) | no disponible en la informacion | Hugging Face |

La comparación relevante es con sarashina2.2-3b, del que hereda configuración y tokenizador: este checkpoint es el equivalente sin entrenar. Frente a ModernBERT-JP-3B-init, la diferencia es arquitectónica (decoder vs. encoder) y forma parte del mismo estudio comparativo.

## Limitaciones y advertencias

- No es un modelo funcional: los pesos son aleatorios y cualquier salida generada es incoherente. No debe desplegarse en producción ni usarse para evaluación de calidad.
- Sesgos: no evaluables, al no haber entrenamiento. Cualquier sesgo aparecerá tras el preentrenamiento que realice el usuario.
- Alucinación: no aplica en el sentido habitual, pero la generación es directamente ruido.
- Idioma: el tokenizador está optimizado para japonés; el rendimiento en otras lenguas dependerá del entrenamiento posterior.
- Licencia MIT: permisiva para uso comercial, pero el usuario asume toda la responsabilidad sobre el modelo resultante tras entrenarlo.
- Dependencias específicas: requiere transformers 4.51.0 o superior, accelerate 1.6.0 o superior, sentencepiece 0.2.0 o superior y flash-attn 2.7.3 o superior; versiones anteriores pueden fallar.
- Contexto limitado a 8192 tokens; no se documentan técnicas de extensión de contexto.
- El número de parámetros de la model card (3093M) no coincide exactamente con el recuento real de safetensors (3355M); conviene verificar la configuración antes de planificar cómputo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Llama-JP-3B-init
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Modelo base de configuración y tokenizador: https://huggingface.co/sbintuitions/sarashina2.2-3b
- Colección sarashina2.2: https://huggingface.co/collections/sbintuitions/sarashina22
- Modelo hermano (encoder): https://huggingface.co/iamtatsuki05/ModernBERT-JP-3B-init
- Licencia MIT: https://opensource.org/license/mit/
- Referencia del artículo: Okada, R. y Sugimoto, T., "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", NLP2026 (sin URL disponible)
