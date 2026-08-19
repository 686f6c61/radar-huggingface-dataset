# Rim2000/CRISPR

## Resumen

CRISPR (Context-Refined Information Spatial Pooling with Region-awareness) es un módulo de compresión de tokens visuales diseñado para modelos de lenguaje y visión (VLM), desarrollado por Zuyi Zhou y colaboradores, y aceptado en ACM MM 2026. El modelo aborda un problema crítico en los VLM modernos: el elevado coste computacional asociado al procesamiento de secuencias largas de tokens visuales generados por el codificador de visión. CRISPR reduce la cantidad de tokens visuales entre 9x y 16x mediante una combinación de pooling espacial con información refinada por contexto y mecanismos de atención por regiones, lo que permite acelerar la inferencia y reducir el consumo de memoria sin degradar significativamente la calidad.

El repositorio aloja checkpoints del módulo CRISPR entrenados sobre dos backbones de la familia Qwen2.5-VL: el modelo de 3B parámetros con ratios de compresión 9x y 16x, y el modelo de 7B parámetros con compresión 16x. El checkpoint de 7B con compresión 9x no está disponible. Es importante destacar que estos checkpoints no son modelos completos: solo contienen los pesos de los módulos CRISPR entrenables (TokenMixer y LocalC3), mientras que el codificador de visión y el decodificador de Qwen2.5-VL deben obtenerse por separado y permanecen congelados durante la inferencia.

La relevancia de CRISPR radica en que la compresión de tokens visuales es una de las vías más efectivas para reducir el coste de despliegue de VLM en producción, especialmente en aplicaciones que procesan imágenes de alta resolución o vídeo, donde el número de tokens visuales puede superar con creces a los tokens de texto. El trabajo se publica con licencia MIT, lo que facilita su adopción tanto en investigación como en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Módulo de compresión de tokens visuales (TokenMixer + LocalC3 con Global Token Fusion) sobre backbone Qwen2.5-VL |
| Parametros totales | No disponible (los checkpoints solo incluyen los módulos CRISPR entrenables; los pesos del backbone Qwen2.5-VL se obtienen por separado) |
| Parametros activos | No disponible |
| Longitud de contexto | Depende del backbone: 32 768 tokens para Qwen2.5-VL-3B-Instruct y Qwen2.5-VL-7B-Instruct |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen como tensores PyTorch en FP32/FP16; la cuantización dependería del despliegue final) |
| Idiomas soportados | No disponible (depende del backbone Qwen2.5-VL, que soporta principalmente inglés y chino) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) mediante `torch.save` |

## Arquitectura y entrenamiento

CRISPR se compone de dos módulos principales: TokenMixer y LocalC3. TokenMixer es responsable de fusionar información contextual entre tokens visuales antes de aplicar el pooling espacial, mientras que LocalC3 (que incluye un submódulo de Global Token Fusion) realiza el agrupamiento por bloques — 3x3 para compresión 9x, 4x4 para compresión 16x — con conciencia de región, de modo que la compresión se adapta al contenido de cada área de la imagen. El diseño busca preservar la información semánticamente relevante al tiempo que se reduce drásticamente el número de tokens que procesa el decodificador.

Los checkpoints se entrenaron en dos etapas (Stage-2 según la model card), y se seleccionaron los de mejor pérdida de validación. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El entrenamiento se realizó congelando el backbone de Qwen2.5-VL, de modo que solo se actualizaron los parámetros de los módulos CRISPR. Los checkpoints no incluyen estado del optimizador ni del scheduler, solo los pesos necesarios para inferencia o fine-tuning posterior.

## Capacidades

- Compresión de tokens visuales con ratios de 9x (bloques 3x3) y 16x (bloques 4x4), reduciendo el coste computacional del decodificador de forma proporcional.
- Preservación de información semántica mediante pooling espacial con conciencia de región, adaptando la compresión al contenido de cada zona de la imagen.
- Integración con backbones Qwen2.5-VL de 3B y 7B parámetros, manteniendo el resto de capacidades del VLM original (generación de texto, razonamiento visual, etc.).
- Inferencia más rápida y menor consumo de memoria en tareas multimodales, especialmente con imágenes de alta resolución o secuencias de vídeo.
- Entrenamiento de bajo coste: solo se actualizan los módulos CRISPR, no el backbone completo.

## Casos de uso

- Despliegue de VLM en producción con restricciones de latencia: al reducir los tokens visuales 16x, CRISPR permite servir Qwen2.5-VL-7B en GPUs de gama media con tiempos de respuesta aceptables para aplicaciones interactivas.
- Procesamiento de vídeo en tiempo real: en tareas como resumen de vídeo o análisis de secuencias de frames, la compresión de tokens visuales reduce drásticamente el coste de procesar cientos de frames por minuto.
- Aplicaciones móviles y edge: la reducción de memoria y cómputo posibilita ejecutar VLM con capacidades visuales en dispositivos con recursos limitados, manteniendo la calidad del modelo base.
- Fine-tuning eficiente para tareas específicas: al ser un módulo ligero, CRISPR puede adaptarse a dominios concretos (documentos, imágenes médicas, etc.) con pocos recursos computacionales.
- Sistemas de documentación visual a gran escala: indexar y describir grandes volúmenes de imágenes requiere procesar millones de ejemplos; la compresión 16x reduce el coste total de inferencia de forma sustancial.
- Investigación en eficiencia de VLM: como referencia académica (ACM MM 2026) para comparar estrategias de compresión de tokens visuales frente a alternativas como pooling ingenuo o atención con ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento (como MMMU, DocVQA o TextVQA) ni comparaciones cuantitativas con otras estrategias de compresión de tokens. Los autores remiten al paper (DOI: 10.1145/3767308.3835007) para los resultados detallados, pero el contenido completo no está accesible desde la información proporcionada.

## Requisitos de hardware

- Los checkpoints de 3B (9x y 16x) requieren el backbone Qwen2.5-VL-3B-Instruct, que ocupa aproximadamente 6 GB en FP16. Con los módulos CRISPR añadidos, la VRAM total estimada para inferencia es de 7-8 GB, lo que permite ejecutarlo en GPUs consumer como RTX 3060 12 GB, RTX 4070 o superiores.
- El checkpoint de 7B (16x) requiere el backbone Qwen2.5-VL-7B-Instruct, que ocupa aproximadamente 16 GB en FP16. Con los módulos CRISPR, la VRAM total estimada es de 18-20 GB, lo que exige GPUs como RTX 4090 24 GB, A100 40 GB o H100.
- El tamaño del repositorio es de 2.5 GB, correspondiente a los pesos de los módulos CRISPR para los tres checkpoints.
- Opciones de despliegue: al ser un módulo que se integra en el pipeline de Qwen2.5-VL, puede servirse con vLLM o TGI siempre que se implemente la integración personalizada descrita en el repositorio oficial. Para entornos sin GPU dedicada, no es recomendable ejecutar el modelo de 7B.
- Latencia y throughput: no disponibles. Dependen del hardware, del ratio de compresión y de la resolución de entrada. Como referencia cualitativa, la compresión 16x reduce el número de tokens visuales procesados por el decodificador en un factor de 16, lo que acelera la fase de decodificación de forma aproximadamente proporcional.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras técnicas de compresión de tokens visuales (como TokenPacker, FastV o PyramidDrop) ni con otros VLM eficientes. Para una comparativa rigurosa, se recomienda consultar el paper de CRISPR en ACM MM 2026, que presumiblemente incluye experimentos comparativos con métodos del estado del arte.

## Limitaciones y advertencias

- Los checkpoints no son modelos completos: requieren obtener los pesos de Qwen2.5-VL por separado y cargarlos junto con los módulos CRISPR. El código de integración está en el repositorio oficial de GitHub.
- El checkpoint de 7B con compresión 9x no está disponible y no está planificada su publicación a menos que se entrene de nuevo.
- No se especifican los datos de entrenamiento ni el proceso de selección de los mismos, por lo que no es posible evaluar sesgos potenciales del módulo.
- Al ser un módulo de compresión, las limitaciones del backbone Qwen2.5-VL (sesgos, alucinaciones, idiomas soportados) se mantienen en el sistema completo.
- La licencia MIT cubre los pesos y el código de CRISPR, pero el backbone Qwen2.5-VL está sujeto a la licencia de Qwen (Apache 2.0 para Qwen2.5-VL, según la documentación oficial de Qwen).
- No se incluyen scripts de evaluación ni benchmarks reproducibles en el repositorio de HuggingFace; para reproducir resultados es necesario acudir al repositorio de GitHub.
- El modelo se publicó en agosto de 2026 y no se han reportado usos en producción o adopción por parte de la comunidad, por lo que su robustez en entornos reales aún no está contrastada.

## Enlaces

- HuggingFace: https://huggingface.co/Rim2000/CRISPR
- Repositorio de código: https://github.com/ZuyiZhou/CRISPR
- Paper (DOI): https://doi.org/10.1145/3767308.3835007
- Backbone Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
