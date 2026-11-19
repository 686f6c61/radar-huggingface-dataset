# SceneWorks/minimax-h3-image-mlx

## Resumen

SceneWorks/minimax-h3-image-mlx es una redistribución cuantizada del transformer de imagen de MiniMax-H3-Image, publicada por SceneWorks para su uso en Apple Silicon mediante MLX y en GPUs NVIDIA mediante Candle. No se trata de un modelo nuevo, sino de una copia modificada del transformer de difusión (`transformer_diffusers/`) del modelo original de MiniMax, junto con sus seis cabezas de salida por paso, empaquetada en dos niveles de cuantización: 8 bits (35,3 GB) y 4 bits (18,8 GB). El repositorio completo ocupa 54,1 GB e incluye únicamente el transformer de imagen; el VAE, el tokenizer, el processor y el codificador de texto deben obtenerse por separado.

El modelo base, MiniMax-H3-Image, es el modelo de generación y edición de imágenes de la familia MiniMax H3: un transformer sin su rama de audio, destilado a un muestreador fijo de seis pasos con una cabeza de salida por paso, y decodificado por un VAE ViT bidimensional propio. Genera imágenes de aproximadamente 16 MP en cualquier relación de aspecto directamente, sin upscaler, y admite edición con hasta 16 imágenes de referencia. La relevancia de esta ficha radica en que permite ejecutar ese pipeline en hardware de consumo y estaciones de trabajo sin Python ni cloud, a costa de una licencia restrictiva que excluye explícitamente a la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos.

La licencia es el punto crítico: la MiniMax-H3-Image Community License Agreement (10 de noviembre de 2026) limita el uso y la distribución al "Applicable Territory", que excluye la UE, el Reino Unido, Corea del Sur y EE. UU., e impone condiciones comerciales adicionales a organizaciones con más de un millón de dólares de facturación anual o que ofrezcan un servicio alojado. Cualquier evaluación en producción desde España queda, por tanto, fuera del ámbito autorizado por la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para imagen, con 50 bloques transformer y 2 bloques token-refiner; muestreador destilado de 6 pasos con una cabeza de salida por paso (`pdd_proj_out`); VAE ViT 2-D propio para decodificación |
| Parámetros totales | no disponible (el repositorio solo indica tamaños de archivo: 35,3 GB en q8 y 18,8 GB en q4) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine 8-bit con group size 64 (q8); MLX affine 4-bit con group size 64 (q4). Las proyecciones de atención y feed-forward de los 50 bloques y de los 2 bloques token-refiner, más el `adaln_proj` de cada bloque, se empaquetan al ancho del tier; las seis cabezas de salida, `proj_in`, `context_embedder`, `norm_out`, el time embedder y el resto de normas permanecen densas |
| Idiomas soportados | no disponible (el codificador de texto es Qwen3-VL-32B-Instruct, multilingüe, pero no se documenta el conjunto de idiomas del pipeline) |
| Licencia | MiniMax-H3-Image Community License Agreement (10 de noviembre de 2026), etiquetada como `license: other` |
| Formato de pesos | safetensors (12 shards por tier, MLX affine cuantizado), cargables por diffusers; integración con MLX y Candle |
| Resolución de salida | hasta 2048×2048 validado; ~16 MP por render según el modelo base |
| Pasos de muestreo | 6 (muestreador destilado fijo) |
| Imágenes de referencia para edición | hasta 16 |
| Tamaño del repositorio | 54,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusión para imágenes (DiT) con 50 bloques transformer principales y 2 bloques token-refiner, más un `adaln_proj` por bloque para la modulación adaptativa por paso de tiempo. Sobre esta base, MiniMax destiló el modelo a un muestreador de seis pasos con una cabeza de salida independiente por paso (`pdd_proj_out`), que upstream distribuye por separado como `pdd_fused_heads.safetensors` y que SceneWorks ha integrado dentro de los shards cuantizados. La decodificación la realiza un VAE ViT bidimensional propio del modelo base. El codificador de texto no forma parte de este repositorio: es Qwen3-VL-32B-Instruct, byte a byte idéntico a la versión de Qwen y bajo licencia Apache 2.0.

SceneWorks no ha reentrenado ni afinado el modelo: ha aplicado cuantización affine por grupos (group size 64) a las proyecciones de atención y feed-forward de los 50 bloques y de los 2 bloques token-refiner, así como al `adaln_proj` de cada bloque, manteniendo en precisión densa las seis cabezas de salida, `proj_in`, `context_embedder`, `norm_out`, el time embedder y todas las normas. La conversión se realizó con SceneWorks Inference mediante el ejemplo `minimax_h3_prequant` del crate `mlx-gen-minimax-h3`, a partir del snapshot `492fd8c4eca666f1085f57e30738c1e0d86b3439` de MiniMaxAI/MiniMax-H3-Image. El flujo de publicación (`real-weights-minimax-h3-image.yml`) verifica tamaño y sha256 de cada archivo subido contra el hub. No se documentan en la información disponible los datos de entrenamiento originales, el número de tokens, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto a imagen (text-to-image) de alta resolución, validada a 2048×2048 y con salida de aproximadamente 16 MP por render en cualquier relación de aspecto, sin upscaler.
- Edición de imágenes con hasta 16 imágenes de referencia en un mismo checkpoint, según las capacidades del modelo base.
- Muestreo en seis pasos fijos gracias a la destilación, lo que reduce el coste de inferencia frente a muestreadores de decenas de pasos.
- Ejecución nativa en Apple Silicon mediante MLX y en GPUs NVIDIA mediante Candle, sin Python, sin cloud y sin Docker, a través de SceneWorks.
- Carga desde diffusers: los pesos en safetensors son compatibles con la librería diffusers, con un bloque `quantization` en `config.json` que registra el ancho de bits y el group size.
- Renderizado en modo streaming con memoria acotada, que según la validación del autor coincide exactamente con el renderizado totalmente residente en el primer paso del tier q4.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio o visión más allá del codificador de texto Qwen3-VL.

## Casos de uso

- Estudio de generación de imágenes en local para Apple Silicon: el tier q4 (18,8 GB) permite cargar el transformer en un Mac con memoria unificada suficiente y renderizar a 2048×2048 sin depender de servicios cloud, usando MLX como backend.
- Estación de trabajo con GPU NVIDIA: el mismo par de archivos se carga con Candle en Windows y Linux, de modo que un equipo con una sola GPU puede ejecutar el pipeline completo con el VAE y el codificador tomados de MiniMaxAI/MiniMax-H3-Image.
- Edición de imágenes con múltiples referencias: el checkpoint base admite hasta 16 imágenes de referencia, útil para composición de producto, sustitución de fondos o variaciones de estilo manteniendo la identidad visual del sujeto.
- Prototipado de pipelines de imagen en Rust: al integrarse con SceneWorks Inference, el modelo encaja en aplicaciones de escritorio nativas que necesitan generación in-process, sin servidor Python intermedio ni contenedores.
- Evaluación comparativa de cuantización: disponer de q8 y q4 del mismo transformer permite medir la degradación de calidad y el ahorro de memoria entre ambos tiers sobre el mismo prompt y la misma semilla.
- Generación de material visual a 16 MP para impresión o cartelería: la salida directa sin upscaler evita artefactos de reescalado en formatos de gran formato y relaciones de aspecto poco habituales.
- Investigación sobre destilación de muestreadores: el esquema de seis pasos con una cabeza por paso es un caso de estudio reproducible para analizar el compromiso entre número de pasos y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación documentada es funcional: ambos backends (MLX y Candle) cargaron cada tier y completaron un render de texto a imagen de 2048×2048 en q8 y en q4, según el run de SceneWorks Inference 43121829369, y el renderizado en modo streaming con memoria acotada coincidió exactamente con el renderizado residente en el primer paso del tier q4. No hay datos de FID, CLIP score, throughput ni latencia por paso.

## Requisitos de hardware

- VRAM o memoria unificada para el transformer: 35,3 GB en q8 y 18,8 GB en q4, solo para los pesos del transformer; hay que sumar el VAE, el tokenizer, el processor y el codificador de texto Qwen3-VL-32B, que se cargan aparte y no están cuantizados en este repositorio.
- El tier q4 (18,8 GB) es el único realista para GPUs de consumo de gama alta con 24 GB de VRAM, siempre que el codificador de texto se ejecute de forma secuencial o con cuantización propia; el tier q8 no cabe en ninguna GPU de consumo actual.
- GPU recomendadas para q8: A100 80 GB, H100 80 GB o configuraciones multi-GPU; para q4: RTX 4090 (24 GB), RTX 5090 o A100 40 GB, con margen ajustado en el caso de 24 GB.
- En Apple Silicon, el tier q4 encaja en equipos con memoria unificada de 32 GB o más; el tier q8 requiere 64 GB o más para dejar espacio al resto del pipeline.
- Despliegue: MLX en macOS y Candle en Windows y Linux a través de SceneWorks; los pesos safetensors son cargables desde diffusers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/minimax-h3-image-mlx (q8/q4) | no disponible | ~16 MP, 6 pasos, hasta 16 referencias | MLX affine 8-bit y 4-bit, group size 64 | MiniMax-H3-Image Community License (excluye UE, Reino Unido, Corea del Sur y EE. UU.) | Hugging Face, 0 descargas, 0 likes |
| MiniMaxAI/MiniMax-H3-Image (base) | no disponible | ~16 MP, 6 pasos, hasta 16 referencias | bf16 sin cuantizar | MiniMax-H3-Image Community License | Hugging Face y GitHub oficiales |
| SceneWorks/minimax-h3-mlx | no disponible | pipeline completo H3 (texto, imagen y audio) | tiers MLX cuantizados | según el modelo base | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos frente a alternativas de la misma categoría, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia excluye explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos del territorio autorizado para uso y distribución; el uso desde España no está amparado por la MiniMax-H3-Image Community License Agreement.
- Se requiere autorización escrita de MiniMax si el usuario y sus afiliados superan un millón de dólares de facturación anualizada o si se ofrece un servicio alojado; un producto comercial debe mostrar "MiniMax-H3-Image" de forma prominente en su interfaz.
- El contenido publicado en entornos públicos debe declararse claramente como generado por máquina, según la política de uso aceptable.
- El modelo y sus salidas no pueden emplearse para mejorar ningún otro modelo de IA que no sea MiniMax-H3-Image o sus derivados.
- Quien permita a terceros generar salidas con el modelo debe mantener salvaguardas razonables contra usos prohibidos y un canal para reportar infracciones.
- Este repositorio no es una distribución oficial de MiniMax; los archivos de `q8/` y `q4/` han sido modificados por SceneWorks.
- Solo se redistribuye el transformer de imagen: sin el VAE, el tokenizer, el processor y el codificador Qwen3-VL-32B no hay pipeline funcional, y esos componentes deben descargarse por separado.
- La cuantización a 4 bits puede degradar el detalle fino y la fidelidad del texto en la imagen; no se han publicado métricas de calidad comparativas entre q8 y q4.
- No hay información sobre sesgos del modelo base, tasas de alucinación visual ni limitaciones idiomáticas del pipeline.
- El repositorio no registra descargas ni likes, y su validación se limita a un único run de integración continua.

## Enlaces

- Hugging Face: https://huggingface.co/SceneWorks/minimax-h3-image-mlx
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio del modelo base en GitHub: https://github.com/MiniMax-AI/MiniMax-H3-Image
- SceneWorks en GitHub: https://github.com/SceneWorks/SceneWorks
- SceneWorks Inference (conversión y publicación): https://github.com/SceneWorks/inference
- Run de validación: https://github.com/SceneWorks/inference/actions/runs/43121829369
- Tier empaquetado completo: https://huggingface.co/SceneWorks/minimax-h3-mlx
- Codificador de texto: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Licencia comercial de MiniMax: https://platform.minimax.io/license
