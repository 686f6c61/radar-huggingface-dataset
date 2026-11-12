# moganai/MoganOCR-TR-MLX-8bit

## Resumen

MoganOCR-TR-MLX-8bit es la versión cuantizada a 8 bits en formato MLX del modelo MoganOCR-TR, un modelo de visión-lenguaje (VLM) de 2.213 millones de parámetros especializado en OCR y parsing de documentos turcos. Lo desarrolla moganai y está pensado específicamente para ejecutarse en Apple Silicon, aprovechando el framework MLX de Apple. Su función es recibir una imagen de una página completa y transcribirla en orden de lectura como Markdown, representando tablas en HTML y fórmulas en LaTeX.

El modelo parte de una arquitectura basada en Qwen 3.5 (tag `qwen3_5`) y está afinado para la tarea concreta de document parsing en turco, aunque también declara soporte de inglés. Frente a las alternativas de OCR clásico, un VLM de este tipo permite manejar maquetaciones complejas, tablas y fórmulas sin pipelines separados de detección y reconocimiento.

Esta variante concreta es la recomendada por el autor por ser la más cercana al modelo original en calidad, manteniendo el codificador visual en bfloat16 mientras cuantiza el resto a 8 bits. Su tamaño de repositorio de 2,7 GB y su licencia Apache 2.0 la hacen desplegable en equipos Mac con memoria unificada moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (VLM) basado en Qwen 3.5 |
| Parametros totales | 2.213.241.664 (2,21 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el codificador visual se mantiene en bfloat16 |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un VLM compuesto por un codificador visual y un decodificador de lenguaje basado en la familia Qwen 3.5, según los tags del repositorio. Esta variante concreta es una cuantizacion a 8 bits del modelo base MoganOCR-TR, realizada con MLX, y mantiene el codificador visual en bfloat16 para preservar la calidad de la extracción de características de imagen. El repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La tarea está formulada como image-text-to-text: se envía una imagen de página y una instrucción en turco ("Sayfayı markdown olarak yaz.") y el modelo genera la transcripción completa en orden de lectura, con tablas convertidas a HTML y fórmulas a LaTeX. El autor recomienda una imagen por petición y temperatura 0 para obtener resultados deterministas. No se han publicado detalles adicionales sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- OCR de página completa: transcribe una imagen de documento a Markdown respetando el orden de lectura.
- Parsing de tablas: convierte tablas de la imagen a HTML estructurado.
- Reconocimiento de fórmulas: representa expresiones matemáticas en LaTeX.
- Document parsing estructurado: genera Markdown listo para su uso en pipelines de extracción de contenido.
- Modalidad conversacional de imagen a texto (image-text-to-text) mediante la librería mlx-vlm.
- Capacidades multilingües limitadas a turco e inglés según la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión general más allá de OCR: no disponible.

## Casos de uso

- Digitalización de archivos turcos: procesar lotes de páginas escaneadas y obtener Markdown con estructura preservada, adecuado por su entrenamiento específico en documentos turcos.
- Extracción de tablas financieras o administrativas: el modelo emite HTML, lo que facilita el parseo posterior con librerías como BeautifulSoup o pandas.
- Conversión de documentación técnica con fórmulas: la salida en LaTeX permite integrar el contenido directamente en entornos como Jupyter, LaTeX o generadores de documentación.
- Procesamiento local en Mac: al ser una build MLX, permite ejecutar OCR en Apple Silicon sin depender de servicios en la nube, útil por privacidad de documentos sensibles.
- Construcción de corpus para RAG: transcribir documentos turcos a Markdown para indexarlos en sistemas de recuperación aumentada.
- Preprocesado en pipelines de NLP en turco: generar texto limpio y estructurado a partir de PDFs escaneados antes de tareas de clasificación o extracción de entidades.
- Herramientas de accesibilidad: convertir documentos escaneados en texto legible por lectores de pantalla manteniendo el orden de lectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza al espacio TurkishOCR-Bench, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,7 GB en 8 bits; se recomienda disponer de al menos 4-6 GB de memoria unificada para inferencia con margen para el contexto.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX.
- GPU NVIDIA: no aplicable a esta build; para CUDA existen las variantes GGUF del mismo autor.
- ¿Cabe en consumer GPU? Esta build está pensada para Mac; en GPUs de consumo se usaría la variante GGUF.
- Opciones de despliegue: mlx-vlm (recomendado), y alternativas del mismo autor en GGUF (llama.cpp/Ollama) y otras cuantizaciones MLX de 6 y 4 bits.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MoganOCR-TR-MLX-8bit | 2,21 B | no disponible | tr, en | Apache 2.0 | safetensors (MLX) |
| MoganOCR-TR (base) | 2,21 B (aprox.) | no disponible | tr, en | Apache 2.0 | safetensors |
| MoganOCR-TR-MLX-6bit | 2,21 B (aprox.) | no disponible | tr, en | Apache 2.0 | safetensors (MLX) |
| MoganOCR-TR-MLX-4bit | 2,21 B (aprox.) | no disponible | tr, en | Apache 2.0 | safetensors (MLX) |
| MoganOCR-TR-GGUF | 2,21 B (aprox.) | no disponible | tr, en | Apache 2.0 | GGUF |

No se dispone de información sobre modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para OCR de documentos turcos; su rendimiento en otros dominios o idiomas no está documentado.
- Idiomas limitados a turco e inglés; no se garantiza calidad en otras lenguas.
- Riesgo de alucinación en la transcripción: como VLM generativo, puede inventar texto en zonas de baja calidad o ilegibles.
- Sin datos de benchmarks publicados en la información disponible, lo que dificulta una evaluación objetiva previa al despliegue.
- Recomendación de una imagen por petición y temperatura 0; usos fuera de ese régimen pueden degradar la salida.
- Build específica para Apple Silicon (MLX); no ejecutable directamente en CUDA sin usar la variante GGUF.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo base para condiciones adicionales.
- No se documentan sesgos específicos ni límites de contexto; conviene validar con documentos propios antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moganai/MoganOCR-TR-MLX-8bit
- Modelo base: https://huggingface.co/moganai/MoganOCR-TR
- Variante 6 bits: https://huggingface.co/moganai/MoganOCR-TR-MLX-6bit
- Variante 4 bits: https://huggingface.co/moganai/MoganOCR-TR-MLX-4bit
- Variante GGUF: https://huggingface.co/moganai/MoganOCR-TR-GGUF
- Benchmark TurkishOCR-Bench: https://huggingface.co/spaces/moganai/TurkishOCR-Bench
- Repositorio MLX: https://github.com/ml-explore/mlx
- Apoyo al autor: https://buymeacoffee.com/moganai
