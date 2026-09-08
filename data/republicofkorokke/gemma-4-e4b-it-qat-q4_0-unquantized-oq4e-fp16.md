# RepublicOfKorokke/gemma-4-E4B-it-qat-q4_0-unquantized-oQ4e-fp16

## Resumen

Este repositorio contiene una cuantización de 4 bits del modelo Google Gemma 4 E4B it, realizada con la herramienta oQ (oMLX v0.6.4) en formato MLX safetensors. El modelo base, google/gemma-4-E4B-it, es un modelo multimodal desarrollado por Google DeepMind que procesa texto e imágenes y genera texto, con soporte de audio en las variantes E2B, E4B y 12B. La cuantización reduce el modelo a 6,3 GB manteniendo 7.941.100.874 parámetros totales. Es relevante porque permite ejecutar un modelo de ~8 mil millones de parámetros en Apple Silicon con memoria limitada, aprovechando la ventana de contexto de hasta 256K tokens y el soporte multilingüe en más de 140 idiomas del modelo original. El nombre del archivo sugiere una precisión mixta (oQ4e-fp16), lo que implica que parte de los pesos se mantienen en coma flotante de 16 bits mientras la mayoría se cuantizan a 4 bits.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (detalles específicos no disponibles en la información del repo) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | No disponible (el sufijo E4B y el total de parámetros sugieren una arquitectura de expertos, pero no está confirmado) |
| Longitud de contexto | 256K tokens (según el modelo base google/gemma-4-E4B) |
| Tipos de cuantizacion | 4 bits, grupo de 64, oQ4e-fp16 (precisión mixta con componentes en fp16) |
| Idiomas soportados | Más de 140 idiomas (según el modelo base google/gemma-4-E4B) |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El nombre del repositorio indica que se trata del modelo google/gemma-4-E4B-it-qat-q4_0-unquantized, una variante instruida de la familia Gemma 4. Según la documentación del modelo base, Gemma 4 es multimodal: acepta texto e imagen y genera texto, con audio en las variantes E2B, E4B y 12B, ventana de contexto de 256K tokens y soporte en más de 140 idiomas. El sufijo «qat-q4_0-unquantized» sugiere que el modelo base pasó por un proceso de entrenamiento consciente de la cuantización (QAT). La cuantización del repositorio se realizó con oQ de oMLX v0.6.4 en modo de precisión mixta: los pesos se reducen a 4 bits con un tamaño de grupo de 64, mientras que el sufijo «fp16» indica que algunos componentes se mantienen en coma flotante de 16 bits. No se proporcionan detalles sobre el dataset de entrenamiento, procesos de alineación (RLHF/DPO) ni otras innovaciones técnicas.

## Capacidades

- Procesamiento multimodal de texto e imagen según el modelo base google/gemma-4-E4B; la cuantización no debería modificar estas habilidades, pero no hay validación específica en esta ficha.
- Generación de texto en más de 140 idiomas según el modelo base.
- Ventana de contexto de hasta 256K tokens, útil para documentos extensos y conversaciones largas.
- Soporte de audio en la variante E4B según la documentación del modelo base, aunque no se confirma que la cuantización conserve este módulo.
- Salida en formato texto; no se indica en la información disponible si soporta tool calling o razonamiento en cadena.
- Cuantización 4-bit con precisión mixta compatible con MLX, la librería de Apple para aprendizaje automático.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar un informe de 200 páginas con gráficos y tablas dentro de su ventana de 256K tokens, extrayendo conclusiones y citas textuales. Ideal para revisión de contratos o investigación documental.
- Asistente multilingüe de atención al cliente: con soporte en más de 140 idiomas, puede mantener conversaciones en el idioma del usuario sin cambiar de modelo. La cuantización 4-bit permite ejecutarlo en un Mac con 16 GB de memoria unificada.
- Transcripción y análisis de audio: si se conserva la capacidad de audio de la variante E4B, puede procesar reuniones y entrevistas para generar actas resumidas, aunque esto no está validado en la ficha.
- Educación personalizada: puede responder preguntas complejas sobre materiales de estudio que combinan texto e imágenes, como diagramas o fórmulas, usando el contexto largo para recordar lecciones anteriores.
- Generación de contenido creativo multilingüe: redacta artículos, guiones y descripciones de producto en varios idiomas, manteniendo coherencia en documentos largos.
- Revisión de código con contexto extenso: aunque no se confirma el soporte de tool calling, la ventana de 256K tokens permite cargar repositorios completos y responder preguntas sobre el código, siempre que la generación de código sea adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 6,3 GB. La carga en memoria durante la inferencia será de aproximadamente 6,3 GB, considerando el formato safetensors y la precisión mixta.
- VRAM estimada para inferencia: no disponible en formato GPU; al ser MLX, la ejecución está orientada a Apple Silicon.
- GPU recomendadas: no aplica para el formato MLX; en Apple Silicon, un Mac con 16 GB de memoria unificada debería poder ejecutarlo.
- Si cabe en consumer GPU: no aplica en este formato. Una conversión a GGUF podría permitir ejecutarlo en una GPU con 8 GB, pero no se describe en la información disponible.
- Opciones de despliegue: MLX en Apple Silicon. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo base google/gemma-4-E4B-it es la referencia de mayor nivel, pero esta cuantización es una variante específica sin datos de evaluación comparativa.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, por lo que el uso comercial es legalmente incierto hasta que se aclare.
- La cuantización a 4 bits puede introducir pérdida de precisión y afectar a tareas de razonamiento complejo, especialmente si el modelo base ya fue optimizado para cuantización QAT.
- El formato MLX limita el despliegue a entornos Apple Silicon; no es directamente utilizable en servidores con GPU NVIDIA sin conversión.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones para esta cuantización. Los riesgos de comportamiento del modelo base no están documentados en la ficha.
- La ventana de contexto de 256K puede requerir una gestión cuidadosa de la memoria en dispositivos con poca RAM, ya que las claves y valores de atención ocupan espacio proporcional a la longitud de entrada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RepublicOfKorokke/gemma-4-E4B-it-qat-q4_0-unquantized-oQ4e-fp16
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-E4B
- Colección de modelos QAT de Gemma 4: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Repositorio de oQ: https://github.com/jundot/omlx
