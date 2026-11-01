# shopkeeper/kor-finewiki-1b-base

## Resumen

Kor-finewiki-1b-base es un modelo lingüístico base de 1.002 millones de parámetros especializado en coreano, entrenado desde cero (from scratch) por el autor independiente "shopkeeper". Su rasgo más distintivo es la arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención estándar GQA, una configuración poco habitual en modelos abiertos de este tamaño y idioma. Fue preentrenado sobre 25,17 mil millones de tokens, con un 89 % de ellos en coreano, empleando código propio en PyTorch y Triton, incluidos los kernels de Gated DeltaNet y el optimizador Muon.

El modelo resuelve el problema de la escasez de modelos base coreanos abiertos y eficientes: frente a alternativas como Polyglot-Ko, ofrece una mejor compresión (bits per byte) en texto coreano con un coste computacional reducido gracias a la atención lineal en la mayoría de capas. Es relevante como punto de partida para fine-tuning en coreano y como referencia técnica de entrenamiento eficiente en hardware modesto (4 GPU RTX A6000, unas 680 GPU-horas).

Se trata de un modelo base (no instruido ni alineado), con ventana de contexto de 2048 tokens, vocabulario BPE de 48.000 tokens y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet (atencion lineal) + GQA, intercalado 3:1, pre-norm RMSNorm |
| Parametros totales | 1.001.518.688 (1,002B) |
| Parametros activos | no disponible (no es MoE; todos los parametros se activan) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en bf16; repo de 4,0 GB) |
| Idiomas soportados | Coreano (principal, ~89 % del corpus), ingles (~10 %) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo tiene 20 capas intercaladas en proporcion 3:1 entre Gated DeltaNet y atencion estandar: 15 capas de Gated DeltaNet con 16 cabezas (d_k = d_v = 128), convolucion causal corta (k=4), normalizacion L2 de q/k, puerta de salida y kernel WY-form chunkwise (C=64) implementado en Triton; y 5 capas de atencion GQA con 16 cabezas de consulta y 4 de clave-valor de 128 dimensiones, RoPE (θ=10000) y QK-norm. La anchura del modelo es d_model 2048 con FFN SwiGLU de 4352. Esta configuracion hibrida reduce el coste de atencion en secuencias largas al sustituir la mayoria de capas de softmax attention por una forma de atencion lineal con estado recurrente.

El corpus de entrenamiento suma 25,17 mil millones de tokens: 21,62B de FineWeb-2 coreano (kor_Hang, filtrado y decontaminado), 0,82B de Wikipedia coreana (dump 2023-11-01) y 2,73B de FineWeb-Edu en ingles. La mezcla fue 88 % FineWeb-2 / 2 % Wikipedia / 10 % ingles en la fase estable, pasando a 78 % / 8 % / 14 % en la fase de decaimiento del learning rate. Se aplico decontaminacion rigurosa mediante n-gramas de 13 palabras contra un conjunto held-out congelado y de 8 palabras contra KoBEST, KMMLU y prompts de evaluacion (se elimino el 10,6 % de FineWeb-2). El tokenizador es un BPE a nivel de byte de 48.000 tokens entrenado sobre el propio corpus, con normalizacion NFC y 5,03 bytes por token en coreano held-out.

El entrenamiento uso prediccion del siguiente token sobre secuencias empaquetadas de 2048 tokens, con batches de 1,05M tokens durante 24.000 pasos. Se empleo el optimizador Muon (momento ortogonalizado Newton-Schulz-5) para matrices 2D y AdamW para embeddings y normales, con schedule warmup-stable-decay (lr maximo 0,0015) y precision bf16 autocast con pesos maestros en fp32. En una ablacion a 150M, Muon alcanzo 0,024 BPB menos que AdamW. El entrenamiento se realizo en 4 GPU NVIDIA RTX A6000 de 48 GB (reducidas a 2 en la segunda mitad), unas 680 GPU-horas en total.

## Capacidades

- Generacion de texto base en coreano con fluidez razonable para su escala (completados coherentes en temas enciclopedicos y cientificos, segun los ejemplos del autor)
- Compresion de texto coreano superior a modelos comparables (BPB 0,729 frente a 1,052 de Polyglot-Ko 1.3b)
- Capacidad residual de ingles gracias al 10-14 % de corpus en ingles
- Al ser un modelo base: sin instrucciones, sin alineamiento, sin chat
- No hay soporte documentado de tool calling, function calling, agentes, vision ni audio
- No es un modelo de razonamiento; sin modo thinking
- Eficiencia computacional por la arquitectura hibrida con atencion lineal (Gated DeltaNet), util para inferencia con secuencias largas dentro de su ventana de 2048 tokens

## Casos de uso

- Fine-tuning para tareas coreanas especificas: al ser un modelo base con pesos abiertos y licencia permisiva, es adecuado como punto de partida para SFT en clasificacion, extraccion o resumen en coreano
- Investigacion en arquitecturas hibridas: el codigo propio de Gated DeltaNet en Triton y el uso de Muon lo hacen util como referencia reproducible para estudiar atencion lineal frente a softmax attention
- Continuacion de texto en coreano: generacion de borradores o completado de texto enciclopedico y divulgativo dentro de una ventana de 2048 tokens
- Entrenamiento en recursos limitados: al demostrarse entrenable en RTX A6000 de consumo/profesional, sirve de referencia para grupos sin acceso a clusters grandes
- Base para tokenizadores y pipelines coreanos: su BPE propio con 5,03 bytes/token permite reutilizar el tokenizador en proyectos relacionados
- Evaluacion comparativa de modelos coreanos: los resultados KoBEST y BPB publicados con harness unificado facilitan comparaciones justas con otros modelos pequenos en coreano

## Benchmarks y rendimiento

Resultados publicados por el autor (BPB held-out, menor es mejor; KoBEST 0-shot accuracy, mayor es mejor):

| Modelo | BPB all / FineWeb-2 / Wikipedia | COPA | HellaSwag | SentiNeg | BoolQ | WiC |
|---|---|---|---|---|---|---|
| kor-finewiki-1b-base (1,0B) | 0,729 / 0,727 / 0,735 | 0,690 | 0,418 | 0,599 | 0,496 | 0,487 |
| EleutherAI/polyglot-ko-1.3b | 1,052 / 1,008 / 1,200 | 0,711 | 0,408 | 0,703 | 0,499 | 0,487 |
| skt/kogpt2-base-v2 (125M) | 1,092 / 1,073 / 1,157 | 0,584 | 0,318 | 0,615 | 0,502 | 0,490 |

KMMLU 0-shot: 0,255 (azar 0,25); el autor lo reporta solo como referencia, ya que el scoring por letra en zero-shot esta dominado por sesgo de letra de respuesta a esta escala.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en bf16 (repo de 4,0 GB incluye pesos y assets); con cuantizacion int8/int4 cabria en menos, aunque no hay cuantizaciones oficiales publicadas
- GPU recomendadas: cualquier GPU moderna con 4-6 GB de VRAM; para entrenamiento/fine-tuning, el autor uso RTX A6000 de 48 GB
- Cabe comodamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o incluso GPUs de 8 GB en bf16
- Opciones de despliegue: PyTorch nativo (libreria del modelo); no hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura Gated DeltaNet requiere kernels Triton propios incluidos en el repositorio
- Latencia y throughput: no disponibles; la atencion lineal en 15 de 20 capas sugiere buena eficiencia, pero no hay mediciones publicadas

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kor-finewiki-1b-base | 1,002B | 2048 | Hibrida Gated DeltaNet + GQA | Apache 2.0 | Pesos abiertos en HuggingFace |
| EleutherAI/polyglot-ko-1.3b | 1,3B | 2048 | Transformer decoder (GPT-NeoX) | Apache 2.0 | Pesos abiertos en HuggingFace |
| skt/kogpt2-base-v2 | 125M | 1024 | Transformer decoder (GPT-2) | CC-BY-SA (no comercial sin condiciones) | Pesos abiertos en HuggingFace |

En BPB coreano, kor-finewiki-1b-base supera claramente a Polyglot-Ko 1.3b (0,729 frente a 1,052) con menos parametros, aunque Polyglot-Ko gana en COPA y SentiNeg. Frente a KoGPT2, ofrece mucho mayor capacidad y contexto. La principal ventaja diferencial es la arquitectura hibrida con atencion lineal y el entrenamiento documentado con Muon.

## Limitaciones y advertencias

- Es un modelo base sin instrucciones ni alineamiento (sin RLHF/DPO): no sigue instrucciones ni es adecuado para chat sin fine-tuning
- Riesgo alto de alucinacion: el propio autor advierte que las muestras generadas contienen errores factuales graves (cifras de poblacion inventadas, historia de Hangul incorrecta)
- Ventana de contexto corta: 2048 tokens, limitante para documentos largos
- Sesgo de letra de respuesta en evaluaciones multiple-choice zero-shot, reconocido por el autor en KMMLU
- Rendimiento debil en tareas de razonamiento: KMMLU 0-shot practicamente al nivel del azar
- Sin soporte documentado para tool calling, agentes, vision ni audio
- Sin cuantizaciones ni formatos GGUF publicados: el despliegue requiere PyTorch y los kernels Triton propios, lo que complica la integracion con stacks de inferencia estandar
- Licencia Apache 2.0: sin restricciones para uso comercial
- Modelo muy reciente con pocas descargas (400) y sin comunidad de verificacion externa

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shopkeeper/kor-finewiki-1b-base
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia (Wikimedia): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
