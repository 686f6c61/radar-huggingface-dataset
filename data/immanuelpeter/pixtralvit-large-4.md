# immanuelpeter/PixtralViT-Large-4

## Resumen

PixtralViT-Large-4 es un paquete de extraccion de caracteristicas visuales que aísla el codificador de vision (tower) y el proyector del modelo multimodal Mistral Large 4, desarrollado originalmente por Mistral AI. El repositorio, publicado por el usuario immanuelpeter, no contiene un modelo de lenguaje: extrae los 272 tensores del `vision_encoder` y los 4 tensores del proyector del checkpoint padre `mistralai/Mistral-Large-4-1T-A52B`, los renombra al esquema de Hugging Face Pixtral y los reempaqueta en un modelo independiente de extraccion de caracteristicas de imagen.

El resultado es un ViT de aproximadamente 1.637 millones de parametros (1,64 B) con 30 bloques, 2048 dimensiones ocultas y 16 cabezas de 128 dimensiones, que procesa parches de 14 pixeles con RoPE 2D axial y comprime tokens mediante un patch merge 2x2. A 448 pixeles produce 1024 tokens de torre de ancho 2048, que tras el merge y la proyeccion quedan en 256 tokens de ancho 6144.

Su relevancia es practica: permite reutilizar el codificador visual de un modelo de frontera (Mistral Large 4, un MoE de 1T parametros totales y 52B activos) sin cargar el modelo completo, algo util para pipelines de vision, recuperacion multimodal o investigacion de representaciones visuales. La validacion de paridad bit a bit frente al checkpoint padre en FP32 y BF16 refuerza la fidelidad de la exportacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (tower de 30 bloques) + proyector MLP con patch merge |
| Parametros totales | 1.637.107.712 (~1,64 B) |
| Parametros activos | no disponible (no es MoE; el padre Mistral Large 4 si es MoE con 52B activos) |
| Longitud de contexto | no disponible (procesa imagenes; a 448 px genera 1024 tokens de torre) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas propias) |
| Licencia | mistral-ecosystem-open-weight-license (pesos); MIT (codigo Python) |
| Formato de pesos | safetensors (model.safetensors, projector.safetensors) |

## Arquitectura y entrenamiento

La torre es un ViT de 30 bloques con 2048 dimensiones ocultas, 16 cabezas de atencion de 128 dimensiones, MLP SwiGLU de 6144 y RMSNorm con epsilon 1e-5. Usa parches de 14 pixeles, RoPE 2D axial, no emplea token de clase ni normalizacion final. El proyector aplica `RMSNorm(2048)`, un patch merge 2x2 que expande a 8192, `Linear(8192, 2048)`, `Linear(2048, 6144)`, activacion GELU y `Linear(6144, 6144)`, todo sin sesgos. A 448 pixeles se obtienen 1024 tokens de torre de ancho 2048, 256 tokens fusionados de ancho 2048 y 256 tokens proyectados de ancho 6144.

No se ha entrenado un modelo nuevo: es una exportacion de pesos del checkpoint padre. El script de reproduccion lee por rangos los 276 tensores de vision del shard indicado por el indice fijado, los renombra al esquema Pixtral de Hugging Face y reordena cada cabeza de `wq` y `wk` del orden rotary intercalado al orden rotate-half. La validacion compara los 276 tensores con el padre mediante `torch.equal` y verifica coincidencia bit a bit de las salidas de torre, fusionadas y proyectadas en FP32 y BF16 a 448 y 1540 pixeles. No se documentan datos de entrenamiento, RLHF ni DPO, ya que el modelo hereda los del padre sin modificacion.

## Capacidades

- Extraccion de caracteristicas de imagen: genera embeddings visuales de 2048 dimensiones (torre) o 6144 dimensiones (proyectado) por token.
- Procesamiento de imagenes de alta resolucion: validado a 448 y 1540 pixeles con RoPE 2D axial.
- Compresion de tokens mediante patch merge 2x2, reduciendo la secuencia visual antes de la proyeccion.
- Integracion con `transformers` mediante codigo personalizado (`PixtralVisionModel`).
- Preprocesado propio con `PixtralImageProcessor` configurable via `preprocessor_config.json`.
- No incluye generacion de texto, razonamiento, codigo, tool calling ni capacidades de agente.
- No soporta audio ni video de forma documentada.
- Capacidades multilingues: no aplica, es un modelo puramente visual.

## Casos de uso

- Recuperacion multimodal (image retrieval): usar los embeddings proyectados de 6144 dimensiones como representacion de imagen en un indice vectorial para busqueda por similitud, aprovechando la fidelidad bit a bit con el codificador del padre.
- Clasificacion y etiquetado de imagenes: extraer caracteristicas de torre y entrenar una cabeza lineal ligera encima, sin necesidad de desplegar el modelo multimodal completo.
- Sistemas de captioning o VQA personalizados: conectar el proyector a un LLM propio en lugar de al modelo de Mistral, reutilizando el adaptador vision-lenguaje exportado.
- Investigacion de representaciones visuales: analizar las activaciones de una torre de 30 bloques entrenada dentro de un modelo de frontera, comparando con ViTs academicos.
- Deteccion de duplicados y near-duplicates: comparar embeddings de imagenes a 448 px (256 tokens fusionados) para agrupar contenido visual similar en pipelines de moderacion.
- Preprocesado en pipelines de datos: generar embeddings de grandes corpus de imagenes en lotes con BF16, usando el modelo como extractor en un job offline.
- Evaluacion de paridad y auditoria de modelos: emplear el repositorio como referencia verificable del codificador visual de Mistral Large 4 para validar implementaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada es la comprobacion de paridad bit a bit con el checkpoint padre en FP32 y BF16 a 448 y 1540 pixeles, que no constituye una metrica de calidad de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 GB en BF16 para los 1,64 B parametros, mas memoria de activaciones segun la resolucion de imagen.
- A 1540 pixeles la secuencia de tokens de torre crece respecto a los 1024 tokens de 448 px, incrementando el consumo de activaciones de forma cuadratica en la atencion.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3070/4060 Ti en adelante); A100 o H100 para procesamiento por lotes a alta resolucion.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB en BF16 y probablemente en 4-6 GB con cuantizacion a FP16/INT8, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| PixtralViT-Large-4 | ~1,64 B | 448-1540 px validados | Mistral Ecosystem Open-Weight | Hugging Face, codigo MIT |
| SigLIP (ViT-L) | ~0,3-0,9 B | 224-384 px tipico | Apache 2.0 / open | Amplia, integrado en transformers |
| CLIP ViT-L/14 | ~0,3 B | 224 px | MIT | Amplia |
| DINOv2 ViT-L | ~0,3 B | 224-518 px | Apache 2.0 | Amplia |

La comparativa se limita a tamano y disponibilidad: no hay datos de benchmarks en la informacion proporcionada que permitan comparar calidad de representacion frente a SigLIP, CLIP o DINOv2. Frente a estos, PixtralViT-Large-4 destaca por su mayor tamano (1,64 B) y su origen en un modelo de frontera, pero su licencia es mas restrictiva que las Apache 2.0 o MIT de las alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier uso conversacional requiere emparejarlo con un LLM.
- Licencia Mistral Ecosystem Open-Weight: revisar los terminos antes de uso comercial; el codigo es MIT pero los pesos no.
- No se documentan sesgos especificos, pero al heredar pesos de Mistral Large 4 puede arrastrar sesgos del corpus de entrenamiento del padre.
- Riesgo de alucinacion no aplica directamente al ser un extractor, pero los embeddings pueden no representar fielmente contenido fuera de la distribucion de entrenamiento.
- Idiomas: no disponible; el modelo no procesa texto.
- Resoluciones muy altas incrementan el coste de atencion de forma cuadratica; validado solo hasta 1540 px.
- Requiere `trust_remote_code=True` y codigo personalizado, lo que implica revisar `modeling_pixtral_large4.py` antes de desplegar.
- Repositorio con 222 descargas y 0 likes: ecosistema de validacion limitado, sin garantias de mantenimiento.
- La fecha de creacion (2026-11-07) es posterior a la de muchos modelos de referencia; verificar compatibilidad con versiones actuales de `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/immanuelpeter/PixtralViT-Large-4
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/parity/mistral_large4.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/adapters/mistral_large4.py
- Repositorio vision-tower-bench: https://github.com/immanuel-peter/vision-tower-bench
