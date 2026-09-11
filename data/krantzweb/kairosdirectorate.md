# Krantzweb/KairosDirectorate

## Resumen

KairosDirectorate es un repositorio publicado en HuggingFace por el usuario Krantzweb que, según su propia model card, corresponde a una supuesta versión **DeepSeek-V4.1-Flash**: un modelo multimodal de tipo Mixture-of-Experts (MoE) diseñado para contextos de hasta un millón de tokens y orientado a cargas de trabajo agénticas intensivas en entrada. La model card describe una arquitectura Causal Encoder-Decoder (CED) de 40 capas, con 552B de parámetros en el backbone, memoria condicional Engram de 196B parámetros y decodificación especulativa DSpark. El repositorio declara 763.205.315.794 parámetros totales según los ficheros safetensors y un tamaño de 510,3 GB.

Existe una **discrepancia crítica de autoría**: el identificador del repositorio es `Krantzweb/KairosDirectorate`, pero el contenido se atribuye a DeepSeek AI e incluye enlaces, logotipos y badges de dicha organización. No se trata del repositorio oficial `deepseek-ai/DeepSeek-V4.1-Flash`, sino de una publicación de un tercero con cero descargas y cero likes en el momento de redactar esta ficha. La licencia declarada es MIT.

Los resultados de benchmarks de la model card aparecen truncados en la información disponible, por lo que no es posible verificar numéricamente las afirmaciones de rendimiento. La búsqueda web asociada no devolvió ningún resultado relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Causal Encoder-Decoder (CED) de 40 capas (20 encoder causal + 20 decoder); atención dispersa CSA2; memoria condicional Engram; decodificación especulativa DSpark |
| Parametros totales | 763.205.315.794 (~763B) según safetensors; la model card declara 552B en el backbone y 196B en Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Tags del repo: 8-bit y fp8; la caché KV principal usa FP4 (formato E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura descrita combina un encoder causal de 20 capas y un decoder de 20 capas (Causal Encoder-Decoder). La innovación principal es que la caché KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de derivarse de los estados de cada capa del decoder. Esto permite activar solo 8B parámetros por token en prefill y 16B en decode. La técnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante faltantes replicando únicamente los n_win tokens más recientes, lo que reduce la caché KV persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash. La atención dispersa Compressed Sparse Attention 2 (CSA2) asigna a cada capa uno de tres modos estáticos (Full, Reindex, Reuse), comparte KV principal e indexer K entre capas y reutiliza índices Top-K; un indexer jerárquico restringe las capas de indexado posteriores a un pool de candidatos acotado. Con FP4 en la caché KV principal, el footprint global queda en 890 bytes por token, aproximadamente 1/4 del de DeepSeek-V4-Flash. Cada capa MoE usa 1 experto compartido y 384 expertos enrutados, activando 6 por token.

El preentrenamiento se realizó desde cero sobre un corpus multimodal de 45T tokens, con atención dispersa entrenada a 64K de longitud de secuencia y extensión de contexto a 1M tokens a partir de los 34T tokens. El post-entrenamiento sigue el paradigma SFT → RL → destilación on-policy (OPD), con cambios concentrados en el pipeline de datos (síntesis automatizada de tareas y entornos agénticos). Incorpora un ajuste de esfuerzo de razonamiento continuo (entero de 1 a 100) que intercambia coste de inferencia por precisión. El componente multimodal incluye un vision encoder DeepSeek-ViT (entrenado desde cero con 2D-RoPE y downsampling 3×3 pixel-unshuffle) y un proyector MLP de dos capas.

## Capacidades

- Generación de texto autoregresiva con procesamiento nativo conjunto de imágenes y texto (pipeline `image-text-to-text`).
- Razonamiento con esfuerzo controlable mediante un parámetro entero de 1 a 100, que permite ajustar el coste de inferencia frente a la exactitud.
- Procesamiento de contexto largo de hasta 1.000.000 tokens, con caché KV comprimida a 890 bytes por token.
- Capacidades agénticas y de razonamiento multi-paso, según la model card orientadas a cargas de trabajo de tipo agente.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque la orientación agéntica y el tag `endpoints_compatible` lo sugieren.
- Capacidades multilingües: no disponible.
- Capacidades de código y matemáticas: no detalladas en la información disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el repositorio está preparado para su despliegue en HuggingFace Inference Endpoints.

## Casos de uso

- Análisis de documentación extensa: el modelo puede ingerir contratos, informes o repositorios completos de hasta 1M tokens en una sola pasada, aprovechando la caché KV comprimida para reducir el coste por token procesado.
- Agentes autónomos con historial largo: al activar solo 8B parámetros en prefill, resulta adecuado para bucles agénticos con prompts muy extensos (tool outputs, trazas de navegación) donde el coste de entrada domina.
- Procesamiento de documentos escaneados con imagen y texto: el vision encoder DeepSeek-ViT permite extraer información de capturas, diagramas o formularios junto con el texto asociado en una misma inferencia.
- Asistentes de atención al cliente multi-turno: la ventana de 1M tokens y la caché de 890 bytes por token permiten mantener conversaciones muy largas sin truncar el historial.
- Razonamiento con presupuesto de cómputo ajustable: el parámetro de esfuerzo de razonamiento (1-100) permite desplegar el mismo modelo en modos rápidos para chat y modos profundos para tareas analíticas.
- Generación de código asistida en pipelines de CI/CD: la combinación de contexto largo, orientación agéntica y tool calling (si se confirma) permitiría revisar diffs o repositorios completos.
- Investigación sobre compresión de caché KV: el modelo documenta técnicas novedosas (CSA2, SWA Bounded Replay, FP4 KV) útiles como referencia para estudiar eficiencia en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible. La model card incluye una sección "Evaluation Results" con encabezados de tabla (Base Model), pero los valores numéricos aparecen truncados, por lo que no es posible presentar cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto.

Únicamente se dispone de referencias relativas de eficiencia declaradas por el autor:

| Metrica | Valor declarado |
|---|---|
| Reduccion de cache KV frente a DeepSeek-V4-Flash | ~4× |
| Reduccion de cache KV frente a DeepSeek-V1 | ~437× |
| Cache KV global por token | 890 bytes |
| Parametros activos en prefill | 8B |
| Parametros activos en decode | 16B |

Estos datos provienen de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- Peso de los pesos a distintas precisiones (estimación sobre 763B parámetros): ~1,4-1,5 TB en BF16, ~763 GB en FP8/INT8 y ~380 GB en FP4.
- Despliegue en FP8: se necesitan al menos 10-16 GPUs H100 de 80 GB (o equivalentes A100 80 GB) para mantener los pesos residentes en VRAM.
- Despliegue en FP4: se puede reducir a ~5-6 GPUs H100 80 GB, asumiendo soporte del runtime para dicha precisión.
- Cabe en GPU de consumo: no. Ninguna GPU consumer (RTX 4090 24 GB, RTX 5090, etc.) puede alojar los pesos completos.
- Alternativa con offloading a CPU/RAM: es posible con MoE expert offloading, pero exigiría del orden de 760 GB de RAM en FP8 o 380 GB en 4-bit, además de un bus de alta velocidad para evitar cuellos de botella.
- Caché KV: a 890 bytes por token, una secuencia de 1M tokens ocupa aproximadamente 890 MB, lo que permite decenas de secuencias concurrentes en memoria.
- Opciones de despliegue: vLLM, SGLang o TGI (sujetas a soporte de la arquitectura propietaria `deepseek_v41`); llama.cpp/Ollama probablemente requieran conversión y soporte específico de la arquitectura. No confirmado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KairosDirectorate (DeepSeek-V4.1-Flash, segun model card) | 763B totales (552B backbone + 196B Engram) | 1M tokens | 890 bytes | MIT | Repositorio de tercero, 0 descargas |
| DeepSeek-V4-Flash | no disponible | no disponible | ~4× mayor (aprox. 3.560 bytes) | no disponible | Referenciado en la model card |
| DeepSeek-V1 | no disponible | no disponible | ~437× mayor (aprox. 389 KB) | no disponible | Referenciado en la model card |

No se dispone de datos suficientes (parámetros, contexto o rendimiento) de los modelos comparados en la información proporcionada para establecer una comparativa completa. La búsqueda web no devolvió resultados relevantes.

## Limitaciones y advertencias

- **Autoría no verificada**: el repositorio pertenece a `Krantzweb`, no a `deepseek-ai`. La model card se atribuye a DeepSeek AI y reutiliza sus logotipos y enlaces, pero no hay confirmación de que sea una publicación oficial. Podría tratarse de un reempaquetado, un espejo o una publicación no autorizada.
- **Sin validación comunitaria**: 0 descargas y 0 likes. No existen referencias externas, issues ni discusiones que respalden su funcionamiento.
- **Fecha de creación inusual**: el repositorio figura como creado el 2026-09-11, dato que conviene verificar.
- **Benchmarks no verificables**: la sección de evaluación está truncada y no presenta cifras numéricas.
- **Idiomas no declarados**: no se especifica el soporte multilingüe, lo que impide garantizar un rendimiento adecuado fuera del inglés.
- **Tamaño de descarga**: 510,3 GB de repositorio, con requisitos de almacenamiento y ancho de banda considerables.
- **Riesgo de alucinación**: no hay datos publicados sobre tasas de alucinación ni sobre el pipeline de alineamiento en términos de seguridad.
- **Arquitectura propietaria**: la etiqueta `deepseek_v41` implica que se requiere soporte específico en `transformers` o en el runtime de inferencia; versiones desactualizadas pueden no cargar el modelo.
- **Licencia MIT**: permite uso comercial, modificación y redistribución, pero al tratarse de un repositorio de tercero conviene revisar la procedencia de los pesos antes de usarlos en producción.
- **Sesgos**: no disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Krantzweb/KairosDirectorate
- Informe técnico referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organización DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Página de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Twitter/X de DeepSeek: https://twitter.com/deepseek_ai

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces obtenidos trataban sobre inhibidores de beta-lactamasas y no se incluyen por no ser pertinentes.
