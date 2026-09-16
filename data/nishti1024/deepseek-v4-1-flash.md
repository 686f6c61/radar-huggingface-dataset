# nishti1024/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) orientado a cargas de trabajo agénticas intensivas en entrada, publicado en HuggingFace bajo el identificador `nishti1024/DeepSeek-V4.1-Flash`. La model card se presenta como la de DeepSeek AI y describe un modelo con arquitectura Causal Encoder-Decoder (CED) de 40 capas, encoder de visión DeepSeek-ViT, memoria condicional Engram y decodificación especulativa DSpark. El eje del diseño es la compresión agresiva de la caché KV: el modelo afirma reducirla a 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y 437 veces menos que la de DeepSeek-V1.

El modelo declara 552B parámetros de backbone más 196B de memoria Engram, aunque el recuento real de safetensors del repositorio es de 763.205.315.794 parámetros (763,2B), con un tamaño de repositorio de 510,3 GB. Soporta contextos de hasta un millón de tokens, procesa imágenes y texto de forma nativa y genera texto de forma autorregresiva. Según la model card, se entrenó desde cero sobre 45 billones de tokens multimodales.

Su relevancia actual reside en la eficiencia para agentes: activa solo 8B parámetros por token en prefill y 16B en decode, permite controlar el esfuerzo de razonamiento con un entero de 1 a 100, y está publicado con licencia MIT y pesos en safetensors compatibles con `transformers`. Conviene señalar que se trata de una subida realizada por el usuario `nishti1024`, con cero descargas y cero likes en el momento de la consulta, y sin verificación de que corresponda a un lanzamiento oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal encoder-decoder (CED) multimodal con MoE; 40 capas (20 de encoder causal + 20 de decoder); vision encoder DeepSeek-ViT + proyector MLP de dos capas |
| Parametros totales | 763.205.315.794 (763,2B) segun safetensors; la model card declara 552B de backbone + 196B de memoria Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode; 6 expertos enrutados de 384 + 1 experto compartido por capa MoE |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Pesos en FP8 / 8-bit (segun tags del repositorio); KV cache principal en FP4, formato E2M1 con una escala E4M3 cada 16 canales |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 510,3 GB |
| Modalidades | Entrada de imagen y texto; salida de texto (pipeline `image-text-to-text`) |
| Fecha de publicacion | 16 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash emplea una arquitectura Causal Encoder-Decoder: un transformer de 40 capas dividido en 20 capas de encoder causal seguidas de 20 capas de decoder. La particularidad es que la caché KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de los estados de cada capa del decoder. Esto permite activar únicamente 8B parámetros por token durante el prefill y 16B durante el decode. La atención se gestiona con Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar índices de atención dispersa Top-K. En el decoder, un indexador disperso jerárquico restringe las capas de indexación posteriores a un pool de candidatos construido por la primera capa en modo Full, acotando el coste de los indexadores profundos con independencia de la longitud del contexto. El resultado, junto con la caché KV en FP4, es una huella de 890 bytes por token.

El modelo incorpora además SWA Bounded Replay, que reconstruye los estados KV de ventana deslizante que faltan replicando únicamente los `n_win` tokens más recientes, evitando persistir la KV de SWA en SSD y reduciendo la huella de caché persistente a aproximadamente un octavo de la de DeepSeek-V4-Flash. Se suman componentes como Single-Pass mHC (mezcla de flujo residual revisada con el kernel Mega-mHC), Engram conditional memory (196B parámetros accedidos de forma dispersa mediante búsqueda por token) y DSpark speculative decoding, con generación de borradores semiautorregresiva y verificación programada por confianza. La parte multimodal usa un vision encoder DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling de píxeles 3×3 (pixel-unshuffle), cuyas embeddings visuales se procesan conjuntamente con las de texto desde el inicio del preentrenamiento.

El preentrenamiento se realizó desde cero sobre un corpus multimodal de 45 billones de tokens, con atención dispersa entrenada a una longitud de secuencia de 64K y extensión de contexto hasta 1M tokens a partir de los 34 billones de tokens. El postentrenamiento sigue el paradigma estándar SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas; los cambios se concentran en el pipeline de datos, con síntesis automatizada a gran escala de tareas y entornos agénticos y escalado progresivo de datos, tareas y rollouts.

## Capacidades

- Generación de texto autorregresiva a partir de entradas de texto e imagen (pipeline `image-text-to-text`).
- Comprensión de imágenes mediante el vision encoder DeepSeek-ViT y el proyector MLP hacia el espacio de embeddings del modelo de lenguaje.
- Razonamiento con esfuerzo controlable: la model card describe un ajuste de esfuerzo de razonamiento continuo con valores enteros de 1 a 100 que intercambia coste de inferencia por precisión.
- Cargas agénticas y de múltiples pasos: el postentrenamiento se basa en síntesis automatizada de tareas y entornos de agente, lo que apunta a ejecución de flujos multi-turno y multi-paso.
- Contexto largo de hasta 1.000.000 tokens, con caché KV de 890 bytes por token que hace viable mantener secuencias muy largas en memoria.
- Capacidad multimodal nativa: el modelo procesa imágenes y texto conjuntamente desde el preentrenamiento, no como un adaptador añadido a posteriori.
- Decodificación especulativa integrada (DSpark) para acelerar la generación.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades multilingües: no disponible (el repositorio no declara idiomas).

## Casos de uso

- Agentes autónomos con historial largo: el modelo puede mantener conversaciones y estados de tarea de hasta 1M tokens con una caché KV de solo 890 bytes por token, lo que permite conservar el contexto completo de sesiones agénticas prolongadas sin recurrir a resúmenes destructivos ni a bases de datos vectoriales externas.
- Análisis de documentación extensa con imágenes: gracias a su naturaleza multimodal y a la ventana de 1M tokens, es adecuado para procesar manuales técnicos, informes o expedientes con figuras, diagramas y tablas, extrayendo conclusiones sobre el conjunto completo.
- Automatización de navegación y uso de herramientas: el entrenamiento sobre entornos agénticos sintéticos lo orienta a tareas de ejecución multi-paso, donde el coste de prefill reducido (8B activos por token) abarata el reprocesamiento de contextos de entrada muy grandes.
- Generación y revisión de código en pipelines de CI/CD: con 1M tokens de contexto puede ingerir repositorios completos o diffs extensos; sin embargo, el soporte de tool calling no está documentado, por lo que la integración requeriría orquestación externa.
- Asistentes de investigación con razonamiento graduable: el parámetro de esfuerzo de razonamiento (1–100) permite usar valores bajos para consultas simples y valores altos para problemas analíticos, ajustando el coste por consulta según la criticidad.
- Procesamiento batch de entrada intensiva: el modo de 8B activos por token en prefill está pensado para cargas donde la entrada domina sobre la salida, como clasificación, extracción de información o resumen de corpus masivos.
- Soporte técnico multimodal: recepción de capturas de pantalla o fotografías de producto junto con la descripción textual del problema, en conversaciones multi-turno con contexto largo.
- Moderación y auditoría de contenido a gran escala: la ventana de 1M tokens permite analizar conversaciones o lotes completos en una sola pasada manteniendo coherencia entre elementos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección "Evaluation Results" con una sección de "Base Model" que menciona que los modelos se evalúan en un marco interno con las mismas condiciones y que las puntuaciones con diferencias inferiores a 0,3 se consideran equivalentes, pero el texto proporcionado se corta antes de mostrar cualquier cifra, por lo que no hay valores de MMLU, HumanEval, GSM8K ni de benchmarks agénticos que se puedan reproducir.

Los únicos datos cuantitativos de rendimiento disponibles son relativos a la caché KV, derivados de la propia model card:

| Metrica | Valor |
|---|---|
| KV cache global por token (DeepSeek-V4.1-Flash) | 890 bytes |
| Reduccion frente a DeepSeek-V4-Flash | ~4x (equivalente a ~3.560 bytes/token, valor derivado) |
| Reduccion frente a DeepSeek-V1 | ~437x (equivalente a ~388.900 bytes/token, valor derivado) |
| Huella de KV persistente de SWA | ~1/8 de la de DeepSeek-V4-Flash |
| Parametros activos en prefill / decode | 8B / 16B |

## Requisitos de hardware

- VRAM estimada para inferencia en FP8/8-bit: en torno a 510–560 GB solo para pesos, partiendo de los 510,3 GB que ocupa el repositorio. Con overhead de activaciones y caché, se necesitan al menos 8 GPU de 80 GB (640 GB agregados) para una sola instancia.
- Si se dispusiera de pesos en BF16/FP16, el requisito sería de aproximadamente 1,5 TB de VRAM, aunque ese formato no está publicado en el repositorio.
- Caché KV: 890 bytes por token implica unos 114 MB por secuencia a 128K tokens y alrededor de 890 MB por secuencia a 1M tokens. El coste de KV es, por tanto, marginal frente al de los pesos.
- GPU recomendadas: nodos multi-GPU con H100 80 GB, H200 o B200. No hay información publicada sobre configuraciones validadas ni sobre tensor parallelism soportado.
- GPU de consumo: no cabe. El modelo no se puede ejecutar en RTX 4090, RTX 5090 ni en configuraciones de una o dos GPU de consumo, ni siquiera con cuantización extrema, dado el tamaño de pesos.
- Opciones de despliegue: el repositorio está etiquetado como `transformers` y `endpoints_compatible`, con pesos safetensors. No se publican ficheros GGUF, por lo que llama.cpp y Ollama no son viables con este repositorio. El soporte en vLLM, SGLang o TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada solo permite una comparación fiable en el eje de la caché KV, ya que el resto de especificaciones de los modelos de referencia no se detallan.

| Modelo | Parametros totales | Activos por token | Contexto | KV cache por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763,2B (safetensors); la card declara 552B de backbone | 8B prefill / 16B decode | 1M tokens | 890 bytes | MIT | safetensors en HuggingFace |
| DeepSeek-V4-Flash | no disponible | no disponible | no disponible | ~3.560 bytes (derivado de la reduccion 4x indicada en la card) | no disponible | no disponible |
| DeepSeek-V1 | no disponible | no disponible | no disponible | ~388.900 bytes (derivado de la reduccion 437x indicada en la card) | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio no verificado: el modelo está subido por el usuario `nishti1024`, no por la organización `deepseek-ai`, con cero descargas y cero likes en el momento de la consulta. La model card parece reproducir el formato y los enlaces del repositorio oficial de DeepSeek, por lo que la autenticidad del contenido no está garantizada.
- Discrepancia en el recuento de parámetros: la model card declara 552B de backbone más 196B de Engram (748B en total), mientras que el recuento de safetensors es de 763,2B. La diferencia no se explica en la información disponible.
- Incoherencia entre tamaño de repositorio y parámetros: 763,2B parámetros en FP8 implicarían del orden de 763 GB, pero el repositorio ocupa 510,3 GB, lo que sugiere precisión mixta o pesos parciales no documentados.
- Ausencia total de datos de benchmarks: no hay cifras verificables de MMLU, HumanEval, GSM8K ni de evaluaciones agénticas, lo que impide validar las afirmaciones de rendimiento.
- Idiomas soportados no declarados: no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Tool calling no documentado: aunque el modelo se orienta a cargas agénticas, no se especifica soporte de function calling ni formato de herramientas.
- Riesgo de alucinación: no hay información sobre tasas de alucinación ni sobre mecanismos de mitigación más allá del ajuste de esfuerzo de razonamiento.
- Restricciones de licencia: la licencia declarada es MIT, que permite uso comercial, pero al tratarse de una subida de terceros la aplicabilidad de esa licencia sobre los pesos reales es dudosa y conviene verificarla con la fuente oficial.
- Requisitos de despliegue muy elevados: no cabe en hardware de consumo y exige nodos multi-GPU de centro de datos, lo que limita su uso a organizaciones con infraestructura dedicada.
- Sin soporte de cuantización para consumo: no hay GGUF ni cuantizaciones de 4 bits publicadas, por lo que no se puede ejecutar en llama.cpp ni Ollama.
- Funcionamiento en modo imagen-texto: aunque el pipeline declarado es `image-text-to-text`, no se detallan limitaciones de resolución, número de imágenes por petición ni comportamiento con imágenes fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishti1024/DeepSeek-V4.1-Flash
- Informe técnico referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organización DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Repositorio de referencia citado en la model card (recursos gráficos): https://github.com/deepseek-ai/DeepSeek-V2
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (turbinas de vapor y reactores modulares pequenos de Siemens Energy), por lo que no se han incorporado enlaces adicionales.
