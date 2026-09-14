# neemon/anlp-a2-part1-moe_4e1a

## Resumen

moe_4e1a es un modelo de traduccion automatica de tipo decoder-only transformer con capas feed-forward de mezcla de expertos (MoE), desarrollado por el usuario neemon como parte de la asignatura Advanced NLP (ANLP) del IIIT-H, curso Monsoon 2026. El modelo se entreno desde cero (from scratch) y se publica unicamente como checkpoint, sin codigo de arquitectura, entrenamiento ni evaluacion en el repositorio de HuggingFace; esos materiales residen, segun el autor, en el repositorio de la asignatura.

La relevancia del modelo es fundamentalmente academica y experimental: es un ejemplo compacto (41,6 millones de parametros totales, 29,0 millones activos por token) de arquitectura MoE con 4 expertos y enrutamiento top-1, lo que permite estudiar el comportamiento de un router disperso en un presupuesto de computo muy reducido. Traduce entre ingles, vietnamita y japones, y publica resultados de perplexity y BLEU en el conjunto de test (BLEU vi->en de 27,33 y ja->en de 16,65).

Se trata de un artefacto de asignatura con 0 descargas y 0 likes en el momento de redactar esta ficha, con ventana de contexto muy limitada (256 tokens) y sin variantes cuantizadas ni integracion con servidores de inferencia estandar. Es util como referencia reproducible de MoE a pequena escala, no como modelo de traduccion listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con feed-forward de mezcla de expertos (MoE), 4 expertos, enrutamiento top-1, sin expertos compartidos, RMSNorm |
| Parametros totales | 41.607.680 |
| Parametros activos | 29.000.192 por token |
| Parametros de la capa feed-forward (total / activos) | 16.809.984 / 4.202.496 |
| Longitud de contexto | 256 tokens (`n_ctx`) |
| Tipos de cuantizacion | No disponible: solo se publica `model.pt` sin variantes cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | Ingles (en), vietnamita (vi), japones (ja) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, cargado con `torch.load(..., weights_only=False)`); no se publican safetensors ni GGUF |
| Tamano del repositorio | 0,2 GB |
| Dimension del modelo (`d_model`) | 512 |
| Numero de capas | 8 |
| Cabezas de atencion / cabezas KV | 8 / 8 (sin GQA) |
| Dimension de la capa feed-forward (`d_ff`) | 512 |
| Tamano de vocabulario | 32.000 |
| Libreria | PyTorch |
| ID de HuggingFace | neemon/anlp-a2-part1-moe_4e1a |
| Fecha de creacion (metadatos) | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 8 capas con `d_model` de 512, 8 cabezas de atencion y 8 cabezas KV (atencion multi-cabeza clasica, sin grouped-query attention), normalizacion RMSNorm y vocabulario de 32.000 tokens. La innovacion estructural esta en la capa feed-forward: en lugar de una FFN densa, se emplea una capa MoE con `n_routed_experts` = 4, `n_shared_experts` = 0 y `top_k` = 1. Con enrutamiento top-1, cada token activa un unico experto, de modo que la FFN activa es de 4.202.496 parametros frente a los 16.809.984 totales de la capa, y el modelo activa 29.000.192 de sus 41.607.680 parametros por token.

El autor indica que el modelo se entreno desde cero para la asignatura, con 16.696.256 tokens objetivo puntuados. La mejor perdida de validacion fue 2,6431 y la mejor perplexity de validacion, 14,06. En el conjunto de test, la perplexity en ambas direcciones es 19,21. No se especifica en la informacion disponible la composicion del dataset de entrenamiento, el numero de pasos, el regimen de aprendizaje, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste por instrucciones; tampoco se detalla ningun mecanismo adicional como decodificacion especulativa, atencion lineal o atencion por ventanas.

La unica referencia a material adicional es la mencion a un repositorio de la asignatura (IIIT-H Advanced NLP, Monsoon 2026) que contendria arquitectura, codigo de entrenamiento y evaluacion, pero no se proporciona su URL en la informacion disponible.

## Capacidades

- Traduccion automatica entre ingles y vietnamita y entre ingles y japones, con resultados de BLEU publicados en las direcciones vi->en y ja->en.
- Generacion de texto autoregresiva en un decoder-only transformer con vocabulario de 32.000 tokens.
- Procesamiento de secuencias de hasta 256 tokens, adecuado para segmentos cortos (frases, titulos, mensajes).
- Enrutamiento disperso con 4 expertos y top-1: cada token se procesa con un unico experto, lo que reduce el coste de computo respecto a un modelo denso equivalente.
- Capacidades multilingues limitadas a los tres idiomas declarados (en, vi, ja); no hay soporte de castellano documentado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), vision, audio ni modalidad distinta del texto.
- No se documenta entrenamiento por instrucciones ni comportamiento conversacional; el pipeline declarado es exclusivamente `translation`.

## Casos de uso

- Traduccion de subtitulos y dialogos cortos: la ventana de 256 tokens encaja con segmentos de subtitulo tipicos (una o dos frases), y el modelo puede desplegarse en local para procesar lotes completos de lineas sin coste de API.
- Traduccion de fichas de producto y descripciones breves en comercio electronico: campos como titulo, caracteristicas y descripcion corta caben en contexto, y el modelo permite pre-traducir catalogos de en/vi/ja antes de una revision humana.
- Pre-traduccion y aumento de datos para entrenar otros modelos: al ser MIT, sus salidas pueden usarse para generar corpus paralelos sinteticos en los tres idiomas, siempre con filtrado por calidad posterior.
- Traduccion de mensajes de chat y tickets de soporte en vietnamita y japones: cada mensaje individual suele estar por debajo del limite de contexto, y el modelo puede integrarse en un pipeline que gestione la conversacion multi-turno fuera del modelo (por ejemplo, traduciendo turno a turno).
- Investigacion sobre enrutamiento MoE: al ser un modelo pequeno con top-1 y 4 expertos, permite experimentar con balanceo de carga, colapso de expertos y analisis de asignacion de tokens con un coste de computo minimo.
- Reproduccion de resultados academicos y docencia: sirve como referencia para comparar arquitecturas MoE frente a densas en tareas de traduccion de bajo recurso dentro de un curso o practica.
- Traduccion en entornos con recursos muy limitados o sin conectividad: con menos de 200 MB de pesos en fp32, puede ejecutarse en CPU o en GPUs integradas, lo que habilita escenarios de borde (edge) o de soberania de datos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplexity en test (ambas direcciones) | 19,21 |
| Perplexity de validacion (mejor) | 14,06 |
| Perdida de validacion (mejor) | 2,6431 |
| BLEU vi->en | 27,33 |
| BLEU ja->en | 16,65 |
| BLEU medio | 21,99 |
| Tokens objetivo puntuados en entrenamiento | 16.696.256 |

No se han publicado en la informacion disponible resultados de benchmarks estandar comparables (MMLU, HumanEval, GSM8K u otros), ni mediciones de BLEU en las direcciones en->vi y en->ja. Tampoco se ofrecen cifras de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia de pesos, derivada del recuento de parametros (41.607.680): aproximadamente 166 MB en fp32, 83 MB en fp16/bf16, 42 MB en int8 y 21 MB en int4. Son estimaciones calculadas a partir del numero de parametros, no medidas publicadas.
- Memoria de clave/valor: con 8 capas, 8 cabezas KV y dimension de cabeza 64 (`d_model`/`n_heads` = 512/8), la cache KV ocupa unos 16 KB por token en fp16; para los 256 tokens de contexto maximo, alrededor de 4 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe sin problemas en RTX 3060, RTX 4090, A100 o H100, aunque en estas ultimas el modelo esta muy infrautilizado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU, gracias a su tamano inferior a 50 millones de parametros.
- Opciones de despliegue: al no existir una implementacion publica de la arquitectura en librerias estandar, el despliegue pasa por cargar el checkpoint con PyTorch (`torch.load`) y reimplementar el forward. vLLM, TGI, llama.cpp, Ollama y MLX no soportan esta arquitectura MoE personalizada sin un port previo, y no se publican pesos en GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de la columna de modelos alternativos proceden de su documentacion publica y no forman parte de la informacion proporcionada; verifiquelos en las fuentes originales antes de usarlos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| moe_4e1a (este modelo) | 41,6 M totales / 29,0 M activos | 256 | en, vi, ja | MIT | `model.pt` de PyTorch, sin codigo de arquitectura en el repo |
| NLLB-200-distilled-600M | 600 M | no disponible | 200 | CC-BY-NC-4.0 | Pesos en HuggingFace, integrado en transformers |
| M2M-100 418M | 418 M | no disponible | 100 | MIT | Pesos en HuggingFace, integrado en transformers |
| mBART-50 large | 610 M | no disponible | 50 | MIT | Pesos en HuggingFace, integrado en transformers |

La comparacion de calidad no es posible con los datos disponibles: los BLEU publicados por moe_4e1a corresponden a direcciones concretas (vi->en y ja->en) y a un conjunto de test propio no descrito, por lo que no son directamente equiparables a los informes multilingues agregados de los modelos anteriores.

## Limitaciones y advertencias

- Ventana de contexto de 256 tokens: es un limite duro y muy bajo; documentos largos, parrafos extensos o conversaciones multi-turno mantenidas dentro del prompt no caben y requieren troceado externo.
- Solo se publican metricas de BLEU para vi->en y ja->en; no hay evidencia publicada del rendimiento en en->vi y en->ja, pese a que la perplexity se reporta en ambas direcciones.
- Riesgo de alucinacion elevado: es un modelo entrenado desde cero con unos 16,7 millones de tokens objetivo, sin ajuste por instrucciones ni alineacion documentada, por lo que no debe usarse como fuente de conocimiento factual ni como asistente.
- Sesgos desconocidos: no se documenta la composicion del corpus de entrenamiento, por lo que no es posible evaluar sesgos de genero, nacionalidad, religion u otros, ni el equilibrio entre los tres idiomas.
- Cobertura multilingue muy limitada: solo en, vi, ja. No hay soporte de castellano ni de otras lenguas.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion, pero no se ofrece ninguna garantia ni soporte por parte del autor.
- Formato de pesos: `model.pt` es un pickle de PyTorch que la propia model card indica cargar con `weights_only=False`, lo que implica ejecucion de codigo arbitrario al deserializar; no cargue el fichero si no confia en su procedencia.
- Sin soporte de herramientas de despliegue: dada la arquitectura MoE personalizada (4 expertos, top-1, sin expertos compartidos), no hay integracion en vLLM, TGI, llama.cpp ni Ollama, y no existen cuantizaciones publicadas, lo que obliga a trabajo de porting para cualquier uso en produccion.
- Estado del artefacto: 0 descargas y 0 likes, repositorio de 0,2 GB con solo el checkpoint, creado y actualizado el 2026-09-14 segun los metadatos. Es un entregable de asignatura sin garantia de mantenimiento, versionado ni soporte.
- Ausencia de codigo de entrenamiento y evaluacion en el repositorio de HuggingFace: la reproducibilidad depende de un repositorio de asignatura cuya URL no se proporciona en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neemon/anlp-a2-part1-moe_4e1a
- Repositorio de arquitectura, entrenamiento y evaluacion (mencionado por el autor como "assignment repository", IIIT-H Advanced NLP Monsoon 2026): no disponible, no se proporciona URL
- Paper o publicacion tecnica asociada: no disponible
- Demo o Space: no disponible
- Otros enlaces (blog, repos, documentacion): no disponible
