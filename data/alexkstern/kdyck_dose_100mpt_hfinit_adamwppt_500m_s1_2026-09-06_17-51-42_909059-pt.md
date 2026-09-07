# alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_500M_s1_2026-09-06_17-51-42_909059-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfinit_adamwppt_500M_s1_2026-09-06_17-51-42_909059-pt` es un checkpoint experimental desarrollado por Alex Kstern con la librería nanochat. Se trata de un transformer decoder-only de tamaño reducido, diseñado para investigar el efecto de la "dosis de tokens" en el entrenamiento de modelos de lenguaje. El entrenamiento se divide en dos fases: una primera fase de preentrenamiento sobre 100 millones de tokens del dataset FineWeb y una segunda fase de post-entrenamiento sobre 500 millones de tokens de un dataset sintético de lenguaje Dyck (k=128, secuencias de 2048 tokens). El checkpoint corresponde al paso 1.525 del entrenamiento.

La arquitectura configurada incluye 16 capas, 8 cabezas de atención, dimensión de embedding de 1024 y una ventana de contexto de 2048 tokens. El vocabulario principal es de 65.536 tokens, mientras que el modelo de post-entrenamiento utiliza un vocabulario reducido de 256 tokens. El modelo se publica bajo licencia Apache-2.0 y su utilidad principal es servir como recurso de investigación en interpretabilidad, aprendizaje de lenguajes formales y análisis del impacto de la cantidad de tokens en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch .pt (state_dict) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar, sin mecanismos de atención lineal ni decodificacion especulativa. La configuracion define una arquitectura con `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024` y `sequence_len=2048`. El vocabulario principal es de 65.536 tokens. A partir de estos valores, el modelo principal tendria aproximadamente 335 millones de parametros, aunque este dato no se proporciona explicitamente en la documentacion. La configuracion tambien define un segundo modelo (`model_ppt`) con el mismo numero de capas y dimensiones, pero con un vocabulario de 256 tokens, destinado al post-entrenamiento con el dataset Dyck.

El entrenamiento se realiza en dos fases. La primera fase (`pt`) utiliza 100 millones de tokens de `fineweb-nanochatbpe-100M`. La segunda fase (`ppt`) utiliza 500 millones de tokens de `dyck-k128-seq_len_2048-1B`. El optimizador es AdamW con tasas de aprendizaje separadas para matrices, embeddings y unembedding (`matrix_lr=0.02`, `embedding_lr=0.3`, `unembedding_lr=0.004`). El esquema de aprendizaje es trapezoidal, con un calentamiento de 0 y un enfriamiento del 40% del entrenamiento. En la transicion entre fases se reinicializan los embeddings y se resetea el optimizador. El checkpoint se guarda en el paso 1.525, con una perdida de entrenamiento suavizada de 3,578 y un objetivo minimo de 1,136. El coste computacional total fue de 2,079e17 FLOPs, con un tiempo de entrenamiento de 375,5 segundos.

## Capacidades

- Generacion de texto: el modelo puede generar texto, pero su entrenamiento se centra en un dataset sintetico Dyck, por lo que su capacidad en lenguaje natural es limitada y no ha sido evaluada publicamente.
- Razonamiento sobre estructuras anidadas: la fase de post-entrenamiento con Dyck sugiere que el modelo esta orientado a aprender patrones de parentesis balanceados, aunque no se han publicado evaluaciones de esta capacidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio o modo de pensamiento: no disponible.

## Casos de uso

- Investigacion en interpretabilidad de transformers: el modelo permite analizar como las representaciones internas codifican estructuras de parentesis anidados, gracias a su entrenamiento en el lenguaje Dyck con k=128 y secuencias de 2048 tokens.
- Estudio del efecto de la dosis de tokens: al comparar con otros checkpoints de la serie (por ejemplo, con 20M o 500M tokens), se puede investigar como la cantidad de tokens de post-entrenamiento afecta al aprendizaje de lenguajes formales.
- Evaluacion de estrategias de inicializacion y optimizacion: el checkpoint incluye configuraciones especificas de tasas de aprendizaje para embeddings y matrices, lo que permite estudiar el impacto de estas decisiones en la convergencia del entrenamiento.
- Benchmarking de eficiencia en nanochat: el registro de FLOPs y tiempo de entrenamiento (2,079e17 FLOPs, 375,5 segundos) sirve como referencia para comparar costes computacionales de entrenamiento de modelos pequenos.
- Fine-tuning en tareas de parsing de estructuras anidadas: el modelo puede servir como punto de partida para ajustar en tareas sintacticas que requieren entender jerarquias de parentesis, como el analisis de expresiones matematicas o codigo.
- Pruebas de generalizacion a lenguajes formales: se puede evaluar si el modelo aprende las reglas de Dyck y si generaliza a longitudes o profundidades no vistas durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: no disponible. Al ser un checkpoint en formato .pt de nanochat, se puede cargar con PyTorch, pero no existe soporte directo para vLLM, llama.cpp, Ollama o TGI sin conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion disponible. El modelo pertenece a una serie de experimentos del mismo autor, de la que se conocen otros checkpoints como `kdyck_dose_100Mpt_20M_s1_2026-08-14_18-11-51_990138-pt` y `kdyck_dose_100Mpt_hfinit_500M_s0_2026-08-14_05-13-31_807923-pt`, pero no se dispone de detalles suficientes sobre sus configuraciones o resultados para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Modelo experimental, no disenado para uso en produccion.
- No se han documentado sesgos, riesgos de alucinacion ni evaluaciones de seguridad.
- Entrenado principalmente con FineWeb (ingles) y un dataset sintetico Dyck, por lo que su conocimiento del mundo y su capacidad de lenguaje natural son limitados.
- El checkpoint no incluye tokenizer ni configuracion estandar de HuggingFace, lo que dificulta su integracion con pipelines convencionales.
- No se han publicado evaluaciones externas ni comparativas con otros modelos.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de soporte ni mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_500M_s1_2026-09-06_17-51-42_909059-pt
- Registro de entrenamiento (W&B): https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/1poryy7u
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Checkpoint relacionado `kdyck_dose_100Mpt_20M_s1`: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_20M_s1_2026-08-14_18-11-51_990138-pt
- Checkpoint relacionado `kdyck_dose_100Mpt_hfinit_500M_s0`: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_500M_s0_2026-08-14_05-13-31_807923-pt
