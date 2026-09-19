# dharun2049/MAE-Qwen3.8-27B

## Resumen

MAE-Qwen3.8-27B es un checkpoint experimental publicado por el usuario dharun2049 que aplica MAE (Magnitude-Adaptive Encoding), un formato de cuantizacion post-entrenamiento (PTQ) de cinco estados o "quinario", sobre el modelo base Qwen/Qwen3.8-27B. El objetivo del proyecto es explorar si un codebook simetrico de cinco valores (-alpha, -1, 0, +1, +alpha) ofrece un compromiso util entre la cuantizacion ternaria de tres estados y una representacion entera de 3 bits con ocho estados, manteniendo una densidad de codigo de 2,3333 bits por peso antes del overhead de escalas.

El checkpoint se ha generado con una politica "quality-first": el cuantizador puede probar varios tamanos de grupo y degradar un tensor a mayor precision si su error de reconstruccion supera el umbral configurado (RMSE relativo objetivo 0,23; maximo duro 0,25; cuatro capas de frontera protegidas). El resultado real de esta politica es que la practica totalidad del modelo ha quedado en alta precision: solo 1 tensor se ha aceptado en formato cuantizado g64, con 0 tensores en g32, 651 tensores protegidos y 434 fallbacks de calidad. El ratio de compresion final es de 1,002x, es decir, practicamente nulo.

La relevancia de esta publicacion es, por tanto, metodologica y experimental mas que practica: documenta un formato de empaquetado base-5 con codificacion exacta (5^3 = 125 < 128, tres digitos quinarios en siete bits) y evidencia empirica de que una politica de calidad agresiva puede anular el ahorro de memoria. El propio autor advierte que el formato no es un backend de cuantizacion integrado en transformers.from_pretrained() y que se necesita un kernel fusionado (Triton/CUDA/CPU) para consumir los pesos empaquetados directamente, algo que no se incluye en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.8-27B; no se describe en la informacion proporcionada) |
| Parametros totales | no disponible (el identificador del modelo base sugiere ~27B, sin confirmar en la informacion proporcionada) |
| Parametros activos | no aplicable o no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PQ5 quinario de cinco estados (-alpha, -1, 0, +1, +alpha) con escalas FP16 por grupo y fallback a BF16 para tensores sensibles; tamanos de grupo configurados 32, 64 y 128 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con empaquetado base-5 propietario (model-pq5-*.safetensors, model.pq5.index.json, pq5_manifest.json) |
| Tamano del repositorio | 55,5 GB |
| Almacenamiento de tensores original | 55,563 GB |
| Almacenamiento de tensores almacenado | 55,475 GB |
| Ratio de compresion real | 1,002x |
| Almacenamiento en passthrough | 55,458 GB |
| Parametros cuantizados | 52.428.800 (aproximadamente el 0,19 % de un modelo de 27B) |
| Tensores protegidos | 651 |
| Fallbacks de calidad | 434 |
| Tensores aceptados | 1 tensor en g64 (2,5833 bpw); 0 tensores en g32 |
| Densidad de codigo | 2,3333 bits por peso en bruto (7/3); ~2,4583 bpw con grupo 128, ~2,5833 bpw con grupo 64, ~2,8333 bpw con grupo 32 |
| Politica de calidad | RMSE relativo objetivo 0,23; RMSE relativo maximo duro 0,25; 4 capas de frontera protegidas |

## Arquitectura y entrenamiento

La arquitectura de la red subyacente corresponde al modelo base Qwen/Qwen3.8-27B, del que no se proporcionan detalles en la informacion disponible (no se confirma si es un transformer denso, un MoE o un hibrido, ni su numero exacto de parametros o su ventana de contexto). Lo que si se describe con precision es la capa de cuantizacion aplicada: MAE almacena los pesos cuantizados mediante el codebook de cinco valores (-alpha, -1, 0, +1, +alpha) y reconstruye cada grupo como W_hat_g = scale_g * Q_g, donde alpha se selecciona por tensor completo y scale_g es una escala FP16 compartida por grupo de pesos. Los cinco estados se empaquetan con codificacion base-5, aprovechando que 5^3 = 125 < 128 para almacenar tres digitos quinarios en siete bits.

No se describe ningun entrenamiento adicional, ajuste fino, RLHF ni DPO: se trata exclusivamente de un proceso de cuantizacion post-entrenamiento. La innovacion tecnica declarada es la combinacion de un codebook escalar simetrico de cinco estados, una magnitud externa adaptativa por tensor, escalado por grupos, empaquetado denso en base 5, seleccion adaptativa del tamano de grupo guiada por calidad y fallback de alta precision para tensores sensibles. La politica adaptativa compara el error de reconstruccion de cada tensor contra los umbrales de RMSE relativo (0,23 objetivo, 0,25 maximo) y conserva la precision original si se superan, lo que en este checkpoint concreto ha derivado en 651 tensores protegidos y 434 fallbacks de calidad.

## Capacidades

- Generacion de texto: el modelo hereda las capacidades del Qwen/Qwen3.8-27B base, si bien no se documentan en la model card y no se han publicado evaluaciones que confirmen su preservacion tras la cuantizacion.
- Conversacion multi-turno: la pipeline declarada es text-generation con vocacion conversacional, segun las etiquetas del repositorio.
- Razonamiento, codigo, matematicas y capacidades multilingues: no disponibles; no se detallan en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Capacidad efectiva del formato: al no existir un kernel nativo, el checkpoint debe reconstruirse a BF16/FP16 antes de ejecutar inferencia estandar, por lo que funcionalmente se comporta como un volcado de pesos de alta precision.

## Casos de uso

- Investigacion en cuantizacion de bajo bit: el checkpoint sirve como material de estudio para analizar como una politica adaptativa guiada por error de reconstruccion distribuye precision entre tensores; el manifiesto pq5_manifest.json documenta tensor a tensor que elementos se cuantizaron y cuales cayeron a fallback.
- Evaluacion de metodos de empaquetado: el esquema base-5 (tres digitos en siete bits) permite reproducir y auditar tecnicas de codificacion densa sin necesidad de ejecutar el modelo completo, comparando la densidad teorica por grupo (2,4583 / 2,5833 / 2,8333 bpw) con el resultado real obtenido.
- Reproduccion de la politica quality-first: con los umbrales publicados (RMSE relativo 0,23 / 0,25 y cuatro capas de frontera protegidas) es posible replicar el pipeline sobre otros modelos y comparar cuantos tensores sobreviven a la cuantizacion.
- Analisis de sensibilidad de capas: los 651 tensores protegidos y los 434 fallbacks constituyen un conjunto de datos util para estudiar que zonas de una red de ~27B toleran menor precision y cuales no.
- Docencia y divulgacion tecnica: el repositorio ilustra de forma tangible la diferencia entre estados de cuantizacion (ternario frente a quinario frente a INT3), el efecto del tamano de grupo en el overhead y el coste real de las politicas conservadoras.
- Pruebas de integracion de runtimes: puede emplearse para validar el comportamiento de un runtime de referencia que reconstruya pesos empaquetados a BF16/FP16 antes de la inferencia estandar de Hugging Face, o para desarrollar el kernel fusionado que el autor identifica como trabajo pendiente.
- Inferencia en alta precision del modelo base: una vez reconstruidos los pesos, se puede desplegar como un Qwen3.8-27B en BF16 convencional, aunque sin ningun beneficio de memoria respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que los resultados formales de evaluacion "pueden anadirse por separado" y advierte explicitamente de que este lanzamiento no debe interpretarse como una preservacion de las puntuaciones del modelo de precision completa hasta que dichas pruebas se ejecuten.

Unicamente se dispone de metricas internas del proceso de cuantizacion, no de calidad del modelo:

| Metrica interna | Valor |
|---|---|
| Almacenamiento de tensores original | 55,563 GB |
| Almacenamiento de tensores almacenado | 55,475 GB |
| Ratio de compresion | 1,002x |
| Parametros cuantizados | 52.428.800 |
| Almacenamiento en passthrough | 55,458 GB |
| Tensores protegidos | 651 |
| Fallbacks de calidad | 434 |
| RMSE relativo objetivo | 0,23 |
| RMSE relativo maximo duro | 0,25 |

## Requisitos de hardware

- VRAM para inferencia: al no existir kernel nativo, el runtime de referencia reconstruye los pesos a BF16/FP16, por lo que se requiere espacio para aproximadamente 55,5 GB de pesos (55,458 GB en passthrough mas el tensor cuantizado) sin contar cache KV ni activaciones.
- GPU recomendadas: A100 80 GB o H100 80 GB para una unica GPU con margen limitado; configuraciones de 2x A100/H100 80 GB o superiores para disponer de holgura de contexto.
- Cabe en GPU de consumo: no en una sola unidad. Se necesitarian al menos 3x RTX 4090 de 24 GB (72 GB) solo para los pesos en BF16, mas overhead de activaciones y cache KV.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no soportan el formato PQ5 de forma nativa; el flujo previsto es usar el runtime de referencia del proyecto para reconstruir a BF16/FP16 y despues servir con transformers. No se distribuye ningun archivo GGUF.
- Kernel nativo: pendiente. El autor indica que un runtime de bajo consumo real requeriria un kernel fusionado en Triton, CUDA o CPU que consuma los pesos quinarios empaquetados directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se proporciona informacion sobre otros checkpoints cuantizados del mismo modelo base ni sobre modelos comparables en cuanto a parametros, contexto o rendimiento, por lo que esa comparativa figura como no disponible. Si puede compararse el esquema de cuantizacion empleado con las alternativas que cita la propia documentacion:

| Esquema | Estados | Densidad por peso | Notas |
|---|---|---|---|
| MAE / PQ5 | 5: -alpha, -1, 0, +1, +alpha | 2,3333 bpw en bruto; ~2,4583 (g128), ~2,5833 (g64), ~2,8333 (g32) | Codebook simetrico con segunda magnitud distinta de cero; empaquetado base-5 (5^3 = 125 < 128) |
| Cuantizacion ternaria | 3: -1, 0, +1 | no disponible en la informacion proporcionada | Referencia citada por el autor como punto de partida del diseno |
| Cuantizacion entera de 3 bits | 8 | no disponible en la informacion proporcionada | Referencia citada por el autor como alternativa convencional |

Comparativa con modelos alternativos (parametros, contexto, rendimiento, licencia y disponibilidad): no disponible.

## Limitaciones y advertencias

- No es un backend de cuantizacion integrado: el formato PQ5 no funciona como drop-in en transformers.from_pretrained() y requiere el runtime de referencia para reconstruir los pesos a BF16/FP16.
- Sin kernel nativo no hay ahorro de memoria: el ratio de compresion real de este checkpoint es 1,002x, por lo que practicamente no reduce el consumo de VRAM frente al modelo original.
- Cobertura de cuantizacion minima: solo 1 tensor se acepto en formato cuantizado (g64), 0 tensores en g32, con 651 tensores protegidos y 434 fallbacks de calidad. La politica quality-first ha anulado el efecto de la cuantizacion en esta publicacion.
- Ausencia total de benchmarks: no se han publicado evaluaciones y la model card advierte de que no debe asumirse la preservacion de las puntuaciones del modelo de precision completa.
- Idiomas no documentados: la ficha del repositorio no declara idiomas soportados, por lo que no puede garantizarse cobertura multilingue mas alla de la del modelo base.
- Contexto no documentado: se desconoce la longitud de ventana efectiva, lo que impide planificar despliegues con requisitos de contexto largo.
- Riesgo de alucinacion y sesgos: no disponibles de forma especifica; son los heredados del modelo base Qwen/Qwen3.8-27B, no evaluados en esta publicacion.
- Madurez del proyecto: modelo marcado como experimental, con 0 descargas y 0 likes en el momento de la consulta, publicado el 19 de septiembre de 2026 y actualizado tres minutos despues; no ha sido verificado de forma independiente.
- Licencia: apache-2.0 declarada en el repositorio, lo que en principio permite uso comercial, pero conviene verificar los terminos aplicables al modelo base Qwen/Qwen3.8-27B antes de un despliegue en produccion.
- Herramientas de despliegue: no hay soporte en vLLM, llama.cpp, Ollama o TGI, ni archivos GGUF, lo que complica la puesta en produccion sin desarrollo adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dharun2049/MAE-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la busqueda web enlaces relevantes (papers, blogs, repositorios o demos) relacionados con este modelo o con el formato MAE/PQ5; los resultados devueltos no guardan ninguna relacion con el contenido tecnico de esta ficha.
