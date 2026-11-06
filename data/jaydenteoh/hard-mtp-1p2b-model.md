# JaydenTeoh/hard-mtp-1p2b-model

## Resumen

Hard-MTP 1.2B es un modelo de lenguaje autorregresivo de 1.273 millones de parámetros entrenado por JaydenTeoh como parte del estudio **Multi-Token Prediction Done Right** (arXiv:2610.38331). No es un modelo de propósito general orientado a producto, sino uno de los doce checkpoints experimentales (tres objetivos de entrenamiento por cuatro tamaños) entrenados con una receta idéntica para comparar de forma controlada distintas variantes de predicción multi-token (MTP).

Este checkpoint concreto implementa el objetivo MTP "duro" (hard): cada cabecera MTP se entrena con cross-entropía contra el token realizado *k* posiciones por delante, el esquema clásico usado en DeepSeek-V3. Su relevancia es principalmente científica: permite evaluar si el MTP mejora la calidad del modelo base y si sus cabeceras auxiliares sirven como borrador (draft) para decodificación especulativa auto-especulativa.

La arquitectura es un transformer decoder denso (no MoE) con hidden size 1536, 36 capas y 24 cabezas de atención, con una ventana de contexto de 2048 tokens. Fue entrenado sobre 31,5B de tokens de FineWeb-Edu con el tokenizador GPT-2. Se distribuye bajo licencia MIT en safetensors, con código personalizado (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso con cabeceras MTP auxiliares (tipo DeepSeek, cascada de 3 bloques) |
| Parametros totales | 1.273 M (1.272.975.360) |
| Parametros activos | No aplica (no es MoE); 1,27B en despliegue (ruta NTP) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo pesos originales en bf16/fp32) |
| Idiomas soportados | Ingles (entrenado exclusivamente con corpus en ingles) |
| Licencia | MIT |
| Formato de pesos | Safetensors (5,1 GB de tamano de repo) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder estandar de 36 capas con hidden size 1536 y 24 cabezas de atencion. La innovacion no esta en la arquitectura base sino en el objetivo de entrenamiento: durante el preentrenamiento se anaden 3 cabeceras MTP en cascada (estilo DeepSeek-V3, un bloque cada una) que predicen los tokens k=1, 2, 3 posiciones por delante usando cross-entropia contra el token realizado (objetivo "hard"). Estas cabeceras son auxiliares: se descartan en inferencia, de modo que el modelo desplegado es un transformer next-token convencional. Ademas, las cabeceras pueden reutilizarse como draft model para decodificacion especulativa auto-especulativa.

El entrenamiento uso 31,5B de tokens de FineWeb-Edu (60.000 pasos, batch de 256 secuencias de 2048 tokens) tokenizados con el BPE de GPT-2. Como detalle tecnico destacable, se empleo el optimizador Muon sobre las matrices ocultas 2D combinado con AdamW para embeddings, cabezas y normalizaciones, con LR pico de 0,001 (cosine hasta 1e-05, 2.000 pasos de warmup), weight decay de 0,1 y precision bf16 autocast sobre pesos maestros en fp32. No hubo RLHF ni DPO: es un modelo solo preentrenado. Cada checkpoint se entreno con una unica semilla (13), compartiendo semilla, orden de datos y planificador con los otros once checkpoints del estudio, de forma que las diferencias entre ellos sean atribuibles al objetivo.

## Capacidades

- Generacion de texto en ingles (continuacion de texto basica, estilo GPT-2 a mayor escala).
- Prediccion multi-token: las 3 cabeceras MTP permiten predecir hasta 3 tokens por paso durante el entrenamiento.
- Decodificacion especulativa auto-especulativa: las cabeceras MTP pueden actuar como draft model para acelerar la inferencia del modelo principal.
- No hay soporte de tool calling ni function calling (modelo solo preentrenado, sin instrucciones).
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues ni multimodales (vision, audio): solo texto en ingles.
- No esta alineado con instrucciones: no sigue instrucciones de forma fiable ni mantiene conversaciones multi-turno.

## Casos de uso

- Investigacion en objetivos de preentrenamiento: comparar el efecto del MTP duro frente a variantes suaves (soft-MTP) y al NTP puro usando los checkpoints del mismo estudio, con receta identica.
- Experimentacion con decodificacion especulativa: usar las cabeceras MTP como draft model para medir la aceleracion real de la inferencia auto-especulativa en un entorno controlado.
- Estudio de optimizadores: el uso de Muon sobre matrices 2D lo hace util para replicar o comparar recetas de entrenamiento con Muon frente a AdamW puro.
- Base para fine-tuning experimental: al ser un modelo base de 1,27B con licencia MIT, puede ajustarse con SFT para pruebas de instruccion en entornos academicos.
- Reproduccion de benchmarks de MTP: verificar los resultados del articulo arXiv:2610.38331 o extenderlos a otros datasets y tokenizadores.
- Ensenanza de LLMs desde cero: su tamano moderado y su configuracion publica (`configs/1p2b_fineweb.yaml`) lo hacen apto para cursos y tutoriales sobre preentrenamiento de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de perplexidad; los resultados comparativos del estudio se encuentran, en su caso, en el articulo arXiv:2610.38331.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-5 GB en fp32/bf16 sin cuantizar (5,1 GB de tamano de repo); con cuantizacion a 8 bits o 4 bits podria reducirse a menos de 1,5 GB, aunque no hay pesos cuantizados publicados.
- Cabe comodamente en GPUs de consumo: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; no se requiere A100 ni H100.
- Para entrenamiento o fine-tuning completo, una sola GPU de 24 GB (RTX 3090/4090) deberia bastar dado el tamano de 1,27B.
- Despliegue: transformers con `trust_remote_code=True` (obligatorio, ya que `model_type: hf_mtp` no esta integrado en la libreria). No hay soporte nativo documentado para vLLM, llama.cpp, Ollama ni TGI; `inference: false` esta marcado en la model card, por lo que no hay inference API en Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| JaydenTeoh/hard-mtp-1p2b-model | 1,27B | 2048 | MIT | MTP duro, cabeceras descartables, draft auto-especulativo |
| JaydenTeoh (checkpoints soft-mtp y NTP del estudio) | 1,27B (misma escala) | 2048 | MIT | Mismos datos y receta, distinto objetivo de preentrenamiento |
| GPT-2 (1,5B, XL) | 1,5B | 1024 | No comercial (OpenAI) | Mismo tokenizador, contexto la mitad, sin MTP |

No hay alternativas comerciales directamente comparables: se trata de un modelo de investigacion; los comparadores mas pertinentes son los otros checkpoints del propio estudio.

## Limitaciones y advertencias

- Sesgos conocidos: entrenado unicamente con FineWeb-Edu, hereda los sesgos de ese corpus (contenido web educativo en ingles, mayoritariamente en ingles estadounidense); no existen evaluaciones de sesgo publicadas.
- Riesgo de alucinacion: alto; es un modelo base sin alineacion, sin RLHF ni DPO, por lo que genera texto plausible sin veracidad garantizada.
- Limitacion de idioma: solo ingles; no debe usarse con castellano ni otros idiomas.
- Contexto corto: 2048 tokens, insuficiente para documentos largos o RAG.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repo; revisar los ficheros de modelado antes de usarlo en entornos sensibles.
- No apto para produccion de producto final: es un checkpoint de investigacion con una unica semilla (sin promediado de runs), marcado `inference: false` en Hugging Face.
- No hay soporte para tool calling, agentes ni conversacion.
- Licencia MIT: sin restricciones para uso comercial, pero sin garantias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/hard-mtp-1p2b-model
- Articulo (arXiv): https://arxiv.org/abs/2610.38331
- Codigo (GitHub): https://github.com/JaydenTeoh/Soft-MTP
