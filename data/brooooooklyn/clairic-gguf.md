# Brooooooklyn/Clairic-GGUF

## Resumen

Clairic-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Cloudflare/clairic, un modelo de 27.320.697.856 parámetros (aproximadamente 27B) construido sobre el backbone Qwen3.8-27B. Las cuantizaciones han sido generadas por el usuario Brooooooklyn aplicando las recetas Unsloth Dynamic 3.1 por tensor, sin imatrix externa, e incluyen el proyector de visión en BF16 y los pesos originales de la cabeza tipada de Clairic como archivos auxiliares. El paquete está pensado para su uso con mlx-node, que descubre automáticamente las variantes y sus sidecars tanto en CLI/servidor como en la aplicación de escritorio.

El modelo resuelve tareas de extracción de información estructurada a partir de entradas imagen-texto, con una cabeza tipada específica para fechas, duraciones, cómputos, estimaciones y previsiones. Es relevante porque combina un backbone lingüístico de 27B con capacidades multimodales y salida estructurada, y porque las cuantizaciones UD-Q4_K_XL y UD-Q8_K_XL permiten desplegarlo en hardware más modesto conservando el proyector de visión y la cabeza tipada.

La licencia es Apache 2.0, lo que facilita el uso comercial. El repositorio ocupa 50,3 GB e incluye dos cuantizaciones del backbone lingüístico, el proyector multimodal y los archivos de configuración de la cabeza tipada y del preprocesador de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.8-27B) con proyector de visión y cabeza tipada Clairic |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (5,17 BPW) y UD-Q8_K_XL (9,21 BPW); proyector de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone y proyector de visión), safetensors (cabeza tipada Clairic) |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clairic emplea un backbone Qwen3.8-27B, según la model card del cuantizador. Sobre ese backbone se añaden dos componentes: un proyector multimodal que procesa imágenes junto al texto (pipeline image-text-to-text) y una cabeza tipada específica de Clairic con pesos propios en safetensors, orientada a la extracción de información estructurada (fechas, duraciones, cómputos, estimaciones y previsiones). La model card menciona referencias a SSM en los parámetros tratados en F32 dentro de la receta de cuantización, lo que sugiere componentes de estado recurrente en el backbone, aunque no se detalla la composición exacta de la arquitectura.

Las cuantizaciones se han generado con las recetas Unsloth Dynamic 3.1 para Qwen3.8-27B por tensor, sin imatrix externa. La variante UD-Q8_K_XL conserva en BF16 los pesos `output.weight`, `attn_q`, `attn_k`, `attn_v` y `nextn.eh_proj`, aplica Q8_0 al resto de matrices 2D y mantiene en F32 las normas y los parámetros SSM, con una coincidencia exacta de 866/866 tensores respecto a unsloth/Qwen3.8-27B-GGUF. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento sobre el backbone Qwen3.8-27B.
- Procesamiento multimodal imagen-texto mediante el proyector de visión en BF16 (pipeline image-text-to-text).
- Extracción de información estructurada con la cabeza tipada Clairic: fechas, duraciones, cómputos, estimaciones y previsiones.
- Salida estructurada (tag structured-output) orientada a tareas de information-extraction.
- Integración con mlx-node, con descubrimiento automático de las variantes y sus sidecars en CLI, servidor y aplicación de escritorio (espacio de trabajo System One).
- Compatibilidad con endpoints según los tags del repositorio.
- Capacidades multilingües: no disponible.
- Tool calling, function calling, agentes y modos de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Extracción de fechas y plazos en documentos escaneados: el modelo recibe la imagen y el texto asociado y utiliza la cabeza tipada para devolver campos de fecha normalizados, lo que resulta adecuado para digitalizar contratos y formularios.
- Cálculo de duraciones a partir de partes de trabajo o registros: la cabeza tipada de duraciones permite convertir descripciones textuales o tablas en valores temporales estructurados para sistemas de planificación.
- Procesamiento de estimaciones y previsiones en informes financieros: el modelo puede leer tablas e imágenes de informes y extraer estimaciones numéricas con su tipado correspondiente, facilitando su carga en hojas de cálculo o bases de datos.
- Digitalización de cómputos y presupuestos de obra: con entrada imagen-texto, extrae partidas, cantidades y cómputos de documentos técnicos y los entrega en formato estructurado para herramientas de gestión de proyectos.
- Enriquecimiento de pipelines de información con salida estructurada: al estar empaquetado para mlx-node y ofrecer variantes Q4 y Q8, puede integrarse en servicios locales que necesiten extraer campos tipados de capturas o PDF renderizados.
- Procesamiento por lotes en estación de trabajo con Apple Silicon: la variante UD-Q4_K_XL (16,45 GiB) permite ejecutar el modelo con visión y cabeza tipada en equipos con memoria unificada suficiente, sin depender de GPUs dedicadas.
- Prototipado de asistentes documentales multimodales: la combinación de backbone de 27B, visión y cabeza tipada sirve para construir asistentes que respondan preguntas sobre imágenes y, a la vez, devuelvan datos estructurados verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para UD-Q4_K_XL: 16,45 GiB solo para el backbone, más 889 MiB del proyector de visión y 277 MiB de la cabeza tipada; en la práctica se necesita margen adicional para el contexto y el runtime.
- VRAM/memoria estimada para UD-Q8_K_XL: 29,30 GiB para el backbone, más los mismos sidecars de visión y cabeza tipada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, la variante Q8 requiere GPUs con 32 GB o más de memoria (por ejemplo, A100 40 GB o H100), mientras que la Q4 puede encajar en GPUs de 24 GB con contexto reducido.
- Compatibilidad con GPU de consumo: la variante UD-Q4_K_XL es la candidata para GPUs de consumo de 24 GB, aunque no se confirma en la información disponible.
- Opciones de despliegue: el paquete está preparado para mlx-node (CLI, servidor y aplicación de escritorio). No se documentan otras opciones como llama.cpp, Ollama, vLLM o TGI para estos archivos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Clairic-GGUF (este) | 27,32B | no disponible | Apache 2.0 | GGUF + safetensors | Multimodal con cabeza tipada para extracción estructurada |
| unsloth/Qwen3.8-27B-GGUF | 27B (backbone) | no disponible | no disponible | GGUF | Backbone base; sin visión ni cabeza tipada Clairic |
| Cloudflare/clairic | 27,32B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; incluye visión y cabeza tipada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Clairic-GGUF con estas alternativas.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos de 27B; las salidas de la cabeza tipada deben validarse en producción.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con documentos largos.
- Los idiomas soportados no están especificados; no se puede garantizar un rendimiento multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Cloudflare/clairic y de los pesos Qwen3.8 subyacentes.
- El paquete está orientado a mlx-node; el soporte en otros runtimes GGUF (llama.cpp, Ollama) no está confirmado y puede requerir ajustes por los sidecars de visión y cabeza tipada.
- Las cuantizaciones UD-Q4_K_XL y UD-Q8_K_XL introducen pérdida de precisión respecto al modelo original; la Q4 es más agresiva y puede afectar a tareas de extracción numérica sensible.
- El repositorio tiene un número muy bajo de descargas (163) y ningún like, por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/Brooooooklyn/Clairic-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clairic
- Repositorio mlx-node: https://github.com/mlx-node/mlx-node
