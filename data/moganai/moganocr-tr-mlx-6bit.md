# moganai/MoganOCR-TR-MLX-6bit

## Resumen

MoganOCR-TR-MLX-6bit es una cuantización de 6 bits en formato MLX del modelo MoganOCR-TR, un VLM (vision-language model) de aproximadamente 2.213 millones de parámetros especializado en OCR de documentos en turco. Lo desarrolla el usuario moganai y está pensado para ejecutarse en Apple silicon mediante la librería MLX y mlx-vlm. Su función es recibir una imagen de una página y devolver la página completa en orden de lectura como Markdown, con tablas en HTML y fórmulas en LaTeX.

La relevancia de esta variante concreta es el equilibrio entre tamaño y calidad: frente a la versión de 8 bits, reduce el peso y acelera la inferencia con una pérdida de precisión descrita por el autor como pequeña. El codificador visual se mantiene en bfloat16, mientras que el resto de pesos se cuantiza a 6 bits, lo que da un repositorio de 2,2 GB.

Se apoya en la arquitectura qwen3_5 (según los tags del repositorio) y está orientado a un nicho muy específico: digitalización de documentos turcos, con soporte declarado de turco e inglés. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (VLM image-text-to-text), codificador visual en bfloat16 |
| Parametros totales | 2.213.241.664 (~2,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (MLX); existen variantes 8 bits, 4 bits y GGUF del mismo modelo base |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un VLM de tipo image-text-to-text construido sobre la familia qwen3_5, con un codificador visual que procesa una imagen de página y un decodificador de lenguaje que genera la transcripción estructurada en Markdown. En esta variante MLX de 6 bits, el codificador visual se conserva en bfloat16 y el resto de los pesos se cuantizan a 6 bits, una decisión habitual para preservar la calidad de la representación visual, que es más sensible a la cuantización agresiva.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del pipeline de cuantización MLX. El modelo base MoganOCR-TR es el que contiene la información completa de entrenamiento, y esta ficha solo cubre la variante cuantizada.

## Capacidades

- OCR de página completa: recibe una imagen de una página y devuelve el contenido en orden de lectura como Markdown.
- Reconstrucción de tablas: las representa como HTML dentro del Markdown generado.
- Fórmulas matemáticas: las transcribe como LaTeX.
- Parsing de documentos: orientado a documentos turcos (facturas, informes, formularios, artículos).
- Generación conversacional multimodal: pipeline image-text-to-text con modo conversational.
- Multilingüe limitado: turco e inglés declarados.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización masiva de archivos turcos: procesar lotes de páginas escaneadas y obtener Markdown estructurado listo para indexar en un motor de búsqueda o en un RAG, aprovechando que el modelo devuelve la página completa en una sola pasada.
- Extracción de tablas financieras: convertir facturas y balances turcos en tablas HTML que luego se parsean a CSV o se insertan en una base de datos, sin necesidad de un pipeline separado de detección de tablas.
- Conversión de documentación técnica con fórmulas: artículos y manuales con notación matemática se transcriben a Markdown con LaTeX embebido, útil para migrar documentación a wikis o repositorios.
- Procesamiento local en Mac: al ser una variante MLX de 6 bits, permite ejecutar el OCR en un Mac con Apple silicon sin depender de la nube, lo que encaja en flujos con requisitos de privacidad o en entornos sin conectividad.
- Preprocesado para pipelines de NLP: generar texto limpio y estructurado a partir de PDFs escaneados antes de pasarlos a modelos de resumen, traducción o análisis.
- Prototipado rápido con mlx-vlm: validar la calidad del OCR turco con un único comando de CLI antes de decidir el despliegue de la versión de 8 bits o del modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza un espacio de benchmark (TurkishOCR-Bench) pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 2,2 GB, por lo que la inferencia en 6 bits requiere del orden de 3 a 4 GB de memoria unificada, incluyendo overhead de activaciones y del codificador visual en bfloat16.
- Hardware objetivo: Apple silicon (series M1, M2, M3, M4 y superiores) mediante MLX.
- GPU dedicadas: no aplica a esta variante; para CUDA existen las versiones GGUF y el modelo base.
- Cabe en cualquier Mac con al menos 8 GB de memoria unificada; 16 GB o más deja margen para contexto largo y procesamiento por lotes.
- Despliegue: mlx-vlm (CLI `mlx_vlm generate`); no se documenta soporte de vLLM, TGI ni Ollama para esta variante concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MoganOCR-TR-MLX-6bit | ~2,2 B | no disponible | Apache 2.0 | safetensors (MLX) | Variante 6 bits para Apple silicon |
| MoganOCR-TR-MLX-8bit | ~2,2 B | no disponible | Apache 2.0 | safetensors (MLX) | Mayor peso, menor pérdida de calidad según el autor |
| MoganOCR-TR-MLX-4bit | ~2,2 B | no disponible | Apache 2.0 | safetensors (MLX) | Menor peso, mayor pérdida de calidad |
| MoganOCR-TR-GGUF | ~2,2 B | no disponible | Apache 2.0 | GGUF | Para llama.cpp y hardware variado |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otros modelos OCR de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: está entrenado para documentos turcos; el rendimiento en otros idiomas, aunque el inglés esté declarado, no está documentado.
- Una página por petición: la model card indica enviar una sola imagen por solicitud con el prompt `Sayfayı markdown olarak yaz.` y temperatura 0; no se documenta procesamiento multipágina.
- Cuantización con pérdida: los 6 bits implican una degradación de calidad frente al modelo base; el autor la describe como pequeña, pero no publica métricas que la cuantifiquen.
- Riesgo de alucinación: como todo VLM generativo, puede inventar texto en zonas de baja legibilidad o en tablas complejas; conviene validar la salida en producción.
- Sesgos: no se documentan sesgos conocidos; el corpus de entrenamiento no está descrito.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- Dependencia de ecosistema: requiere MLX y mlx-vlm; no es portable directamente a CUDA sin usar otra variante del modelo.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moganai/MoganOCR-TR-MLX-6bit
- Modelo base: https://huggingface.co/moganai/MoganOCR-TR
- Variante 8 bits: https://huggingface.co/moganai/MoganOCR-TR-MLX-8bit
- Variante 4 bits: https://huggingface.co/moganai/MoganOCR-TR-MLX-4bit
- Variante GGUF: https://huggingface.co/moganai/MoganOCR-TR-GGUF
- Benchmark TurkishOCR-Bench: https://huggingface.co/spaces/moganai/TurkishOCR-Bench
- Repositorio MLX: https://github.com/ml-explore/mlx
- Apoyo al autor: https://buymeacoffee.com/moganai
