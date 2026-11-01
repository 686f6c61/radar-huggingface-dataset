# hossain0909/keural-stage1-checkpoints

## Resumen

Keural 14.8B es un modelo de lenguaje de tipo Mixture of Experts (MoE) entrenado desde cero para el par de idiomas coreano-ingles. Lo desarrolla MKD Hossain (MKD-CORP) y se distribuye en este repositorio como una coleccion de checkpoints crudos de la fase 1 de preentrenamiento, no como un modelo listo para produccion. La arquitectura sigue el esquema de Mixtral: 24 bloques transformer, hidden size de 4096, 32 cabezas de atencion con 8 cabezas KV (GQA) y 8 expertos con enrutamiento top-2, lo que da 14,83 mil millones de parametros totales y aproximadamente 2600 millones activos por token.

El modelo se entrena sobre unos 64 560 millones de tokens de texto web bilingue (FineWeb, WanJuan, HPLT y FineWeb2) con un tokenizador SentencePiece propio de 131 072 entradas y una ventana de contexto de 4096 tokens. El interes practico de este repositorio no es la inferencia directa, sino la investigacion: permite estudiar la evolucion del entrenamiento MoE en distintos pasos, reanudar preentrenamiento o iniciar ajustes finos desde una base bilingue coreano-ingles poco habitual en el ecosistema open source.

Es relevante ahora porque los modelos MoE bilingues con coreano siguen siendo escasos y porque la publicacion de checkpoints intermedios completos (estado del modelo, del optimizador, paso y perdida) es poco frecuente. El repositorio ocupa 1156,9 GB y contiene 13 ficheros `.pt` de aproximadamente 83 GB cada uno. El modelo final ajustado por instrucciones se publica en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE estilo Mixtral (24 bloques, hidden size 4096, 32 cabezas de atencion, 8 cabezas KV con GQA) |
| Parametros totales | 14,83 mil millones |
| Parametros activos | ~2,6 mil millones por token (8 expertos, top-2) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en bfloat16 sin cuantizar) |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints FSDP de PyTorch (`.pt`, ~83 GB por fichero, con estado del modelo, optimizador, paso y perdida); version safetensors convertida para vLLM en repositorio aparte |
| Vocabulario | 131 072 (SentencePiece propio) |
| Hardware de entrenamiento | 2x NVIDIA H200 150 GB, FSDP, infraestructura KT Cloud NIPA2-H200 |
| Precision de entrenamiento | bfloat16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capas MoE de tipo Mixtral: 8 expertos por capa y enrutamiento top-2, de modo que cada token activa dos expertos y el coste computacional se aproxima al de un modelo denso de unos 2,6 mil millones de parametros, mientras que la capacidad de representacion corresponde a 14,83 mil millones. Emplea Grouped Query Attention (32 cabezas de consulta, 8 de clave-valor) y un tokenizador SentencePiece entrenado especificamente sobre coreano e ingles con un vocabulario de 131 072 entradas, considerablemente mayor que el de muchos modelos bilingues.

El preentrenamiento de la fase 1 cubre 100 000 pasos y unos 64 560 millones de tokens, con optimizador AdamW, tasa de aprendizaje con decaimiento coseno y warmup, precision bfloat16 y paralelismo FSDP sobre 2 GPU H200. La mezcla de datos es aproximadamente 40 000 millones de tokens de FineWeb (ingles), 10 000 millones de WanJuan (chino/ingles), 8000 millones de HPLT (coreano) y 6000 millones de FineWeb2 (ingles), con filtrado de calidad, eliminacion de spam, filtrado por longitud y deduplicacion. No se documenta en la informacion disponible el uso de RLHF ni DPO en esta fase; el pipeline declarado incluye una fase 2 de annealing (20 000 pasos, ~5,16 mil millones de tokens), una fase 3 de SFT (18 000 pasos, 1,13 millones de muestras) y una fase 4 de DPO (~8000 pasos, 233 000 pares) planificada.

## Capacidades

- Generacion de texto autoregresiva bilingue coreano-ingles sobre texto base, sin ajuste por instrucciones.
- Razonamiento y conocimiento general derivados del preentrenamiento, limitados por la fase 1 y por los 64 560 millones de tokens vistos.
- Capacidad de continuacion y modelado de lenguaje para evaluacion de perplejidad y estudios de escalado.
- Soporte de tool calling / function calling: no disponible en estos checkpoints (requiere SFT).
- Soporte de agentes y razonamiento multi-paso: no disponible en estos checkpoints.
- Capacidades multilingues limitadas a coreano e ingles; el chino aparece solo como ruido en la mezcla WanJuan.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Reanudacion de entrenamiento y ajuste fino: los checkpoints incluyen estado del optimizador y numero de paso, lo que permite continuar el preentrenamiento de forma exacta.

## Casos de uso

- Investigacion sobre enrutamiento MoE: comparar la distribucion de expertos y la perdida en los 13 checkpoints (del paso 19 000 al 100 000) permite estudiar como se especializan los expertos a lo largo del entrenamiento.
- Reanudacion de preentrenamiento: cargar `checkpoint_100000.pt` con su estado de optimizador y continuar el entrenamiento con mas tokens o una mezcla de datos distinta, algo que no permiten los pesos safetensors sin estado.
- Ajuste fino supervisado bilingue coreano-ingles: partir de la base preentrenada para construir un modelo de instrucciones o de dominio (legal, sanitario, atencion al cliente) en coreano, un idioma con pocas bases abiertas de este tamano.
- Estudio de eficiencia MoE: medir el coste real de inferencia con 2,6 mil millones de parametros activos frente a un modelo denso de tamano equivalente y validar el ahorro en memoria y FLOPs.
- Evaluacion de tokenizadores: analizar el impacto del vocabulario de 131 072 entradas en la fertilidad de tokens para coreano e ingles frente a tokenizadores de menor tamano.
- Baseline para experimentos de annealing y DPO: usar la fase 1 como punto de partida controlado para reproducir las fases 2 a 4 del pipeline declarado y medir su efecto sobre la perplejidad y la calidad generativa.
- Analisis de datos de entrenamiento: estudiar la contribucion de cada fuente (FineWeb, WanJuan, HPLT, FineWeb2) al comportamiento bilingue mediante experimentos de ablation sobre los checkpoints disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 30 GB solo para pesos (14,83 mil millones de parametros a 2 bytes), mas cache KV y overhead, en torno a 35-40 GB en la practica.
- VRAM estimada en cuantizacion de 8 bits: unos 15-16 GB de pesos; en 4 bits, unos 8-9 GB, aunque no se distribuyen pesos cuantizados en este repositorio.
- GPU recomendadas para bfloat16: A100 80 GB, H100 80 GB o H200 141 GB; en consumer, RTX 4090 (24 GB) no cabe en bfloat16 y requeriria cuantizacion a 4 bits.
- Cabe en consumer GPU solo con cuantizacion agresiva (4 bits) y ventana de contexto reducida; el limite de 4096 tokens ayuda a contener la cache KV.
- Opciones de despliegue: los checkpoints `.pt` requieren el codigo de entrenamiento original para cargarse; para inferencia se indica la version safetensors convertida para vLLM en `mkd-hossain/keural-14.8b-stage2-vllm`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El repo ocupa 1156,9 GB, por lo que el almacenamiento y la transferencia de los checkpoints son un cuello de botella practico importante.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Keural 14.8B (fase 1) | 14,83 B / ~2,6 B | 4096 | ko, en | Apache 2.0 | Checkpoints crudos en HF, 0 descargas |
| Mixtral 8x7B | 46,7 B / ~12,9 B | 32 768 | multilingue (incluye en, no ko especifico) | Apache 2.0 | Pesos safetensors y GGUF, amplio ecosistema |
| Qwen1.5-MoE-A2.7B | 14,3 B / 2,7 B | 32 768 | multilingue (incluye en y zh, ko limitado) | Apache 2.0 | Pesos safetensors, integracion en vLLM y transformers |
| OpenMoE / otros MoE bilingues coreano | no disponible | no disponible | ko, en | no disponible | no disponible |

La comparacion con Mixtral y Qwen1.5-MoE-A2.7B es la mas cercana por diseno (MoE con top-2 y tamano de activacion similar en el caso de Qwen), pero Keural se diferencia por su enfoque exclusivo en coreano-ingles, su contexto mucho menor (4096 frente a 32 768) y su estado de publicacion: checkpoints de entrenamiento sin ajuste, sin benchmarks y sin formato de inferencia estandar en el propio repositorio.

## Limitaciones y advertencias

- No son modelos ajustados por instrucciones: no deben desplegarse directamente en produccion; el propio autor lo indica.
- No hay resultados de benchmarks publicados, por lo que no se puede verificar la calidad frente a alternativas.
- Ventana de contexto de solo 4096 tokens, muy inferior a la de los modelos MoE contemporaneos (32 768 o mas).
- Cobertura linguistica limitada a coreano e ingles; el rendimiento en otros idiomas, incluido el espanol, es previsiblemente pobre.
- La mezcla incluye 10 000 millones de tokens de WanJuan (chino/ingles), lo que puede introducir ruido linguistico en un modelo declarado bilingue ko-en.
- Riesgo de alucinacion y de generar contenido sesgado o de baja calidad propio de un modelo base preentrenado sobre texto web filtrado solo por heuristica.
- El repositorio ocupa 1156,9 GB y cada checkpoint pesa unos 83 GB; la descarga y el almacenamiento son costosos.
- Cargar los `.pt` requiere `weights_only=False` y el codigo de arquitectura original; no son compatibles directamente con `transformers` ni con llama.cpp.
- Licencia Apache 2.0 permite uso comercial de los pesos, pero al ser checkpoints base sin ajuste, el uso comercial directo no es recomendable tecnicamente.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion externa de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hossain0909/keural-stage1-checkpoints
- Modelo SFT (fase 3): https://huggingface.co/mkd-hossain/keural-14.8b-sft
- Version safetensors para vLLM (fase 2): https://huggingface.co/mkd-hossain/keural-14.8b-stage2-vllm
- Modelo base y tokenizador: https://huggingface.co/mkd-hossain/keural-14.8b-base
