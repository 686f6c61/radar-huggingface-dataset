# JaydenTeoh/soft-mtp-332m-model

## Resumen

Soft-MTP 332M es un modelo de generación de texto en inglés desarrollado por Jayden Teoh como parte del trabajo de investigación *Multi-Token Prediction Done Right* (arXiv:2610.38331). Se trata de un transformador decoder de 357M de parámetros entrenado con una variante novedosa de predicción multi-token (MTP): cada cabecera MTP se entrena contra la propia distribución del modelo en el siguiente token, en lugar del token realizado, mediante un acoplamiento KL con paso recto (straight-through) que evita un softmax adicional sobre el vocabulario.

El modelo es relevante porque forma parte de un estudio controlado de doce checkpoints (tres objetivos por cuatro tamaños) entrenados con una receta idéntica —mismos datos, semilla y planificador—, lo que permite atribuir las diferencias de rendimiento exclusivamente al objetivo de entrenamiento. Su interés principal es investigador: medir el impacto del MTP suave frente a otras variantes y explorar la decodificación especulativa autospeculativa.

En inferencia, las cabeceras MTP se descartan y el modelo desplegado es un transformador next-token convencional de 357M parámetros, con contexto de 2048 tokens y tokenizador GPT-2 estándar. Se distribuye bajo licencia MIT con pesos en safetensors y código personalizado (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (hf_mtp, código personalizado) con cabeceras MTP auxiliares |
| Parametros totales | 356.911.104 (~357M, dato real de safetensors) |
| Parametros activos | 357M (no es MoE; las cabeceras MTP se descartan en inferencia) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp32 originales) |
| Idiomas soportados | Ingles (entrenado unicamente con corpus en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 1,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 36 capas con hidden size de 768 y 12 cabeceras de atencion. Sobre la base next-token se anaden 3 cabeceras MTP en cascada estilo DeepSeek, de un bloque cada una. La innovacion central del trabajo es el objetivo Soft-MTP: en lugar de entrenar cada cabecera contra el token realizado en el corpus, se entrena contra la distribucion q del propio modelo en el siguiente token, mediante un acoplamiento KL-recovery con straight-through estimator. Esto cuesta una pasada hacia atras adicional y no requiere softmax sobre el vocabulario. Las cabeceras MTP son auxiliares: se descartan al desplegar, aunque pueden reutilizarse como draft model para decodificacion especulativa autospeculativa.

El entrenamiento uso 31,5 mil millones de tokens de FineWeb-Edu tokenizados con GPT-2 BPE (60.000 pasos, batch de 256 secuencias de 2048 tokens). Como optimizador se empleo Muon para las matrices 2D ocultas y AdamW para embeddings, cabecera de salida y normalizaciones, con LR pico de 0,0015, decaimiento coseno hasta 1e-05, 2.000 pasos de warmup y weight decay de 0,1. La precision fue bf16 en autocast sobre pesos maestros en fp32, con semilla 13. Cada celda del estudio corresponde a una unica ejecucion, y los doce checkpoints comparten semilla, orden de datos y planificador.

## Capacidades

- Generacion de texto en ingles con arquitectura next-token estandar una vez descartadas las cabeceras MTP.
- Prediccion multi-token entrenada con objetivo soft-MTP, util como base para decodificacion especulativa autospeculativa (las cabeceras MTP actuan de draft model).
- Tokenizador GPT-2 estandar (vocabulario de 50.257, con padding a 50.304 filas para alineacion, filas extra sin uso).
- Integracion con la libreria `transformers` de Hugging Face mediante `AutoModelForCausalLM` y `trust_remote_code=True`.
- No hay soporte documentado de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en prediccion multi-token: es uno de doce checkpoints comparables entrenados con receta identica, ideal para aislar el efecto del objetivo de entrenamiento en MTP.
- Estudio de decodificacion especulativa autospeculativa: las cabeceras MTP en cascada pueden servir de draft model para acelerar la inferencia del propio modelo sin un draft externo.
- Reproduccion de experimentos academicos: el codigo de entrenamiento esta disponible publicamente con la configuracion `configs/332m_fineweb.yaml`, lo que permite reproducir o extender el estudio.
- Base para ablation studies en modelos pequenos: su tamano de 357M y entrenamiento con 31,5B tokens lo hacen asequible para experimentar en una sola GPU.
- Prototipado de objetivos de entrenamiento alternativos: la arquitectura hf_mtp con codigo personalizado sirve de punto de partida para probar variantes de MTP.
- Generacion de texto basica en ingles para pruebas y demos de bajo consumo, dado su tamano reducido y contexto de 2048 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 357M de parametros en fp32 se requieren aproximadamente 1,4 GB; en bf16, unos 0,7 GB. El repo pesa 1,4 GB en safetensors.
- GPU recomendadas: cualquier GPU moderna de consumo es suficiente; no se necesita hardware de datacenter (A100/H100) para inferencia.
- Cabe comodamente en GPUs de consumo como una RTX 3060, RTX 4060 o superior, e incluso es ejecutable en CPU para pruebas puntuales.
- Despliegue: via `transformers` de Hugging Face con `trust_remote_code=True` (obligatorio, ya que `model_type: hf_mtp` no esta integrado en la libreria). `inference: false` en la model card indica que no hay inference API activada en el Hub. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. En teoria, la decodificacion especulativa con las cabeceras MTP podria mejorar el throughput, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Particularidad |
|---|---|---|---|---|---|
| JaydenTeoh/soft-mtp-332m-model | 357M | 2048 | FineWeb-Edu, 31,5B tokens | MIT | MTP suave con cabeceras descartables y especulacion autospeculativa |
| GPT-2 (124M/355M) | 124M–355M | 1024–2048 | WebText | MIT (OpenAI) | Transformer next-token clasico, mismo tokenizador |
| Pythia-410M (EleutherAI) | 405M | 2048 | The Pile, ~300B tokens | Apache 2.0 | Suite de checkpoints por pasos para estudios de entrenamiento |

Es la comparativa mas razonable por tamano y proposito investigador; no hay otros modelos publicos con el mismo objetivo soft-MTP conocidos en la informacion disponible.

## Limitaciones y advertencias

- Entrenado unicamente en ingles: no es adecuado para castellano ni otros idiomas.
- Contexto de 2048 tokens, limitado para documentos largos o conversaciones extensas.
- Modelo de escala pequena (357M) entrenado con 31,5B tokens: se esperan alucinaciones y errores factuales frecuentes; no esta alineado con RLHF/DPO ni filtrado de seguridad, por lo que puede generar contenido ofensivo o incorrecto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repo; revisar los ficheros de modelado antes de usarlo en entornos de produccion.
- No hay inference API en el Hub ni soporte documentado para runtimes de despliegue estandar (vLLM, llama.cpp, Ollama).
- Es un modelo de investigacion con una unica ejecucion y una sola semilla: los resultados individuales pueden variar y no deben generalizarse sin replicacion.
- Licencia MIT: sin restricciones para uso comercial, pero el modelo no esta pensado para productos de produccion sino para experimentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/soft-mtp-332m-model
- Paper: https://arxiv.org/abs/2610.38331 (arXiv:2610.38331, *Multi-Token Prediction Done Right*)
- Codigo (GitHub): https://github.com/JaydenTeoh/Soft-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
