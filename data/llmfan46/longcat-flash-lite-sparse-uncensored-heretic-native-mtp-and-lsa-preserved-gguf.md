# llmfan46/LongCat-Flash-Lite-Sparse-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF

## Resumen

LongCat-Flash-Lite-Sparse-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF es una cuantizacion GGUF del modelo LongCat-Flash-Lite-Sparse de Meituan, publicada por el contribuidor independiente llmfan46. El modelo base es un transformer disperso (sparse) de aproximadamente 69.100 millones de parametros, y esta version concreta ha sido sometida a un proceso de "abliteration" mediante la herramienta Heretic v1.4.0 con una variante del metodo Magnitude-Preserving Orthogonal Ablation (MPOA), cuyo objetivo es reducir los rechazos del modelo ante solicitudes que el modelo original declinaria.

El resultado declarado por el autor es una reduccion de rechazos del 99% al 9% en una muestra de 100 prompts, con una divergencia KL de 0.0157 respecto al modelo original, lo que indica que la distribucion de salida se mantiene relativamente proxima al modelo base. La ficha tecnica del modelo base menciona caracteristicas como MTP (Multi-Token Prediction) nativo y LSA (presumiblemente algun tipo de atencion lineal o dispersa), que el autor indica haber preservado en esta cuantizacion.

La relevancia de esta publicacion es doble: por un lado, ofrece una via para ejecutar un modelo de ~69B en hardware de consumo mediante cuantizacion GGUF; por otro, ilustra el ecosistema de modelos "decensored" o "abliterated" que buscan eliminar comportamientos de rechazo. Es importante senalar que estos GGUFs requieren un fork especifico de llama.cpp (llama.cpp-longcat-flash) y no funcionan con la version upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso (sparse); modelo base LongCat-Flash-Lite-Sparse, con MTP nativo y LSA preservados |
| Parametros totales | 69.127.158.912 (~69,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura dispersa (sparse), segun la nomenclatura del propio nombre del modelo. La model card del autor de la cuantizacion menciona que se preservan dos componentes del modelo original: MTP (Multi-Token Prediction) nativo y LSA. No se dispone de detalles tecnicos adicionales sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF o DPO, ya que esa informacion no aparece en la documentacion proporcionada.

La innovacion principal de esta version concreta no esta en el entrenamiento sino en la modificacion post-entrenamiento: se aplico abliteration con Heretic v1.4.0 usando una variante de MPOA. Los componentes objetivo fueron `attn.o_proj` y `mlp.down_proj`, con pesos por capa especificos (por ejemplo, `attn.o_proj.max_weight` = 2.18 en la posicion 9.23, `mlp.down_proj.max_weight` = 1.06 en la posicion 12.88). El autor reporta una divergencia KL de 0.0157 respecto al original y una reduccion de rechazos de 99/100 a 9/100.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Reduccion significativa de rechazos: 9/100 frente a 99/100 del modelo original, segun la metrica del autor.
- Preservacion de MTP (Multi-Token Prediction) nativo, lo que en teoria permite decodificacion especulativa y mayor throughput.
- Preservacion de LSA (componente de atencion del modelo base, sin mas detalles disponibles).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio reproducible de como la ablacion de direcciones en `attn.o_proj` y `mlp.down_proj` afecta a la tasa de rechazos con una divergencia KL medida de 0.0157, util para comparar metodos de edicion de pesos.
- Despliegue local de un modelo de ~69B en cuantizacion Q4_K_M: con el fork de llama.cpp indicado, permite ejecutar un modelo grande en estaciones de trabajo con VRAM limitada, a costa de asumir la dependencia de un fork no upstream.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin los rechazos tipicos del modelo alineado, gracias a la reduccion de rechazos declarada.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantizacion (de BF16 a Q2_K), lo que permite medir la degradacion de calidad y el impacto en la tasa de rechazos a lo largo de la escala.
- Servicio de inferencia local via `llama-server`: el ejemplo de la model card arranca un endpoint HTTP en `127.0.0.1:8080` con `-fa on` (flash attention) y `-np 1`, adecuado para prototipos y entornos de un solo usuario.
- Analisis de sesgos y seguridad: util para investigadores que necesiten medir que contenidos emergen cuando se eliminan las capas de rechazo, y documentar riesgos antes de cualquier uso en produccion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas del proceso de abliteration, no benchmarks estandar de capacidad.

| Metrica | Este modelo | Modelo original (LongCat-Flash-Lite-Sparse) |
|---|---|---|
| Divergencia KL | 0.0157 | 0 (por definicion) |
| Rechazos | 9/100 | 99/100 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, un modelo de ~69,1B parametros en BF16 requiere del orden de 138 GB solo para pesos; en Q8_0 aproximadamente 69 GB; en Q4_K_M aproximadamente 39-40 GB; en Q3_K_M en torno a 30-32 GB; en Q2_K alrededor de 20-22 GB. Son estimaciones por tamano de parametros, no cifras publicadas por el autor.
- GPU recomendadas: no disponible en la informacion. Para BF16 se necesitarian multiples aceleradores (A100 80GB x2 o H100); para Q4_K_M una unica GPU de 48 GB (A6000, L40S) o combinacion de 24 GB + RAM del sistema.
- Cabe en GPU de consumo: Q4_K_S y Q3_K_* pueden caber en GPUs de 24 GB (RTX 3090/4090) solo si se descargan capas a RAM del sistema; Q2_K es la opcion mas viable para 16-24 GB. No hay confirmacion oficial del autor.
- Opciones de despliegue: exclusivamente el fork `llama.cpp-longcat-flash` (github.com/erm14254/llama.cpp-longcat-flash). Los GGUFs no funcionan en llama.cpp upstream, segun el autor. No se menciona soporte en vLLM, TGI, Ollama ni otros runners.
- Latencia y throughput: no disponible. El ejemplo de la model card usa `-c 8192`, `-np 1` y `-fa on`, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (LongCat-Flash-Lite-Sparse Uncensored Heretic GGUF) | ~69,1B | no disponible | MIT | GGUF | Requiere fork de llama.cpp; abliterated |
| LongCat-Flash-Lite-Sparse (original, Meituan) | ~69,1B | no disponible | no disponible | safetensors | Modelo base alineado; 99/100 rechazos segun el autor |
| Alternativas de ~70B abliterated en GGUF | no disponible | no disponible | variable | GGUF | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoria.

## Limitaciones y advertencias

- El proceso de abliteration elimina deliberadamente los mecanismos de rechazo: el modelo puede generar contenido danino, ilegal o sexualmente explicito. No es apto para aplicaciones orientadas al publico sin filtros externos.
- La divergencia KL de 0.0157 indica cercania al original, pero no garantiza que no se hayan degradado capacidades especificas; no hay benchmarks de capacidad publicados.
- Dependencia de un fork no oficial de llama.cpp: no hay soporte upstream, lo que implica riesgo de mantenimiento, incompatibilidades y ausencia de optimizaciones comunitarias.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Longitud de contexto no documentada; el ejemplo usa 8192 tokens, muy por debajo de lo habitual en modelos actuales.
- La licencia MIT del repositorio de cuantizacion no aclara necesariamente los terminos del modelo base de Meituan; conviene verificar la licencia del modelo original antes de uso comercial.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- El autor declara haber alcanzado el limite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de los ficheros.
- La model card incluye contenido promocional y de donaciones ajeno a la ficha tecnica; se ha omitido por no ser relevante para la evaluacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/LongCat-Flash-Lite-Sparse-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/llmfan46/LongCat-Flash-Lite-Sparse-Uncensored-Heretic-Native-MTP-And-LSA-Preserved
- Modelo original de Meituan: https://huggingface.co/meituan-longcat/LongCat-Flash-Lite-Sparse
- Fork de llama.cpp requerido: https://github.com/erm14254/llama.cpp-longcat-flash
- Heretic (herramienta de abliteration): https://heretic-project.org/
- Blog sobre MPOA (Norm-Preserving Biprojected Abliteration): https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Repositorio LongCat-Flash-Chat (Meituan): https://github.com/meituan-longcat/LongCat-Flash-Chat
- Papers referenciados en los tags (arXiv): arxiv:2608.01662 y arxiv:2601.21204
