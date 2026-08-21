# gnitoahc/ceed-b4

## Resumen

CEED B4 es un checkpoint de investigación derivado de `google/gemma-4-e4b-it`, un modelo de lenguaje multimodal (visión-lenguaje) de la familia Gemma 4. Ha sido ajustado mediante un adaptador LoRA de rango 4 y posteriormente fusionado en los pesos base, de modo que se carga como un modelo independiente sin necesidad de PEFT. El entrenamiento combina el objetivo de destilación B2 con el reweighting por ventaja visual (VA-OPD) descrito en el preprint arXiv:2605.21924, utilizando como profesor el modelo MoE `google/gemma-4-26b-a4b-it`. El resultado es un artefacto de 7.941.100.874 parámetros (~7,94B) orientado a respuesta visual de preguntas (VQA) en inglés, con especial atención a documentos, imágenes naturales y gráficos.

El modelo pertenece al estudio CEED (Causal Expert–Evidence Distillation), un proyecto de investigación publicado con fines de reproducibilidad, no como producto comercial. Su relevancia radica en explorar si la destilación de conocimiento desde un profesor MoE más grande, con un reweighting basado en la ventaja visual, mejora el rendimiento frente a un fine-tuning supervisado convencional. Sin embargo, los resultados publicados por el propio autor indican que el control sin destilación (CEED B1) supera a este checkpoint en todas las métricas evaluadas, lo que cuestiona la contribución efectiva de la técnica. El contexto máximo no se especifica en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en `google/gemma-4-e4b-it` |
| Parametros totales | 7.941.100.874 (~7,94B) |
| Parametros activos | no disponible (el modelo base `gemma-4-e4b-it` sugiere 4B activos, pero no se confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizables con herramientas externas) |
| Idiomas soportados | ingles |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it`, un transformer multimodal de la familia Gemma 4 que procesa entradas de imagen y texto. Sobre esta base se aplicó un adaptador LoRA de rango 4, entrenado con el objetivo de destilación B2 (una variante de la pérdida de destilación de conocimiento) más el reweighting por ventaja visual (VA-OPD) propuesto en arXiv:2605.21924. El profesor utilizado fue `google/gemma-4-26b-a4b-it`, un modelo MoE de 26B parámetros totales con 4B activos. El adaptador se fusionó posteriormente en los pesos base, generando un checkpoint independiente.

El corpus de entrenamiento combina tres conjuntos de datos de VQA: ChartQA (2.500 ejemplos), DocVQA (5.349 ejemplos) y GQA (10.000 ejemplos), totalizando 17.849 ejemplos con una división 80/10/10 por identificador de ejemplo. Se realizaron 2,69 pasadas sobre el split de entrenamiento. La entropía cruzada final fue de 1,0979 y el término de destilación final de 2,1309. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado con destilación.

## Capacidades

- Respuesta visual de preguntas (VQA) sobre documentos, imágenes naturales y gráficos, con respuestas de formato corto.
- Extracción de información de imágenes de documentos (lectura de texto, valores numéricos, totales).
- Razonamiento sobre gráficos y tablas visuales (ChartQA).
- Comprensión de escenas y objetos en imágenes naturales (GQA).
- Soporte multilingüe: no, únicamente inglés.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Modo de pensamiento (thinking mode): no documentado.
- Entrada multimodal: imagen y texto; salida de texto.

## Casos de uso

- Investigación en destilación de conocimiento: el checkpoint sirve como artefacto reproducible para estudiar el efecto del reweighting por ventaja visual en la destilación desde un profesor MoE. Puede compararse con el control B1 (sin destilación) para aislar el impacto de la técnica.
- Evaluación de métricas VQA en entornos académicos: permite reproducir los experimentos del estudio CEED y verificar los resultados publicados en el preprint.
- Prototipado de sistemas de extracción de información de documentos: dado su entrenamiento en DocVQA, puede utilizarse en pruebas de concepto para leer totales, fechas o campos específicos en facturas o formularios, siempre que se acepte su naturaleza experimental.
- Análisis de gráficos y visualizaciones: su entrenamiento en ChartQA lo hace útil para experimentar con la interpretación de gráficos de barras, líneas o tartas en contextos de investigación.
- Benchmarking de modelos VQA pequeños: con 7,94B parámetros, puede servir como referencia para comparar el rendimiento de modelos de tamaño similar en tareas de pregunta-respuesta visual.
- Docencia y formación en IA multimodal: al ser un checkpoint abierto con licencia Gemma, puede emplearse en cursos o talleres para ilustrar el proceso de fine-tuning con LoRA y destilación en modelos de visión-lenguaje.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación en su propio harness (`ceed-direct-1`) con decodificación greedy y sobre un split de validación propio (10% de los datos). Estos números no son comparables con los leaderboards públicos de DocVQA, GQA o ChartQA, ya que difieren en splits, prompt y decodificación. Se presentan a continuación únicamente como referencia interna del estudio.

| Dataset | Metrica | Puntuacion | n |
|---|---|---|---|
| DocVQA | ANLS | 0,8538 | 565 |
| GQA | exact match | 0,6102 | 1016 |
| ChartQA | relaxed accuracy | 0,6185 | 249 |

El propio autor advierte que el control sin destilación (CEED B1) obtuvo puntuaciones superiores en todos los conjuntos: DocVQA 0,8798, GQA 0,6959 y ChartQA 0,7871. Por tanto, la ganancia atribuible a la destilación no se manifiesta como una ventaja frente al fine-tuning supervisado estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en precisión fp16/bf16 ocupa aproximadamente 15,9 GB (tamaño del repositorio). Se requiere una GPU con al menos 16 GB de VRAM para cargar el modelo en fp16, aunque es recomendable 24 GB para dejar margen a las activaciones y el procesador de imágenes.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 (40 GB), H100 (80 GB) o superiores. En GPUs con 16 GB (como RTX 4080 o A10G) podría funcionar con fp16 si se gestiona cuidadosamente la memoria, pero no está garantizado.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o 4090 puede ejecutarlo en fp16. Con cuantización a 8 bits (aproximadamente 8 GB) cabría en una RTX 3060 de 12 GB, y a 4 bits (aproximadamente 4 GB) en GPUs de 8 GB, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: al ser un modelo de transformers con pesos safetensors, puede servirse con la librería `transformers` (carga directa con `AutoModelForImageTextToText`). También es probable que funcione con vLLM o TGI, aunque no se menciona explícitamente en la documentación. Para cuantización, se pueden usar herramientas como llama.cpp, GPTQ o AWQ, pero no hay archivos preconvertidos.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la longitud de la secuencia de entrada (imagen + prompt).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de la misma categoría (VQA de ~8B parámetros). El propio autor no publica comparaciones con otros checkpoints fuera del estudio CEED. Como referencia interna, se puede comparar con el control B1 (mismo modelo sin destilación) y con el profesor `google/gemma-4-26b-a4b-it`, pero estos no son modelos independientes de la misma categoría. Por tanto, la comparativa se limita a los datos ya presentados en la sección de benchmarks.

## Limitaciones y advertencias

- Es un resultado de LoRA de rango 4: la fusión del adaptador no equivale a un fine-tuning completo. El propio estudio (ADR-0005) excluye los resultados LoRA de su tabla principal porque un resultado nulo bajo un adaptador pequeño no permite distinguir entre "la señal no se transfiere" y "el adaptador carece de capacidad para retenerla".
- La ganancia de destilación no está establecida: el control sin profesor (CEED B1) supera a este checkpoint en todas las métricas evaluadas, lo que sugiere que el objetivo de destilación con reweighting visual no aporta una ventaja medible en este contexto.
- Entrenamiento limitado a inglés y a tres dominios VQA (documentos, imágenes naturales y gráficos). El comportamiento fuera de estos dominios no está probado.
- Hereda las limitaciones del modelo base `google/gemma-4-e4b-it` y las restricciones de la licencia Gemma, que pueden incluir condiciones específicas para uso comercial.
- Los resultados de evaluación no son comparables con los leaderboards públicos de DocVQA, GQA o ChartQA debido a diferencias en splits, prompt y decodificación.
- El modelo requiere un prompt con instrucción de respuesta corta; sin él, el modelo tiende a generar respuestas verbosas que puntúan cero en las métricas reportadas.
- Es un artefacto de investigación, no un producto. No se recomienda su uso en producción sin una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gnitoahc/ceed-b4
- Repositorio GitHub del estudio CEED: https://github.com/GNITOAHC/ceed
- Preprint arXiv:2605.21924 (reweighting por ventaja visual): https://arxiv.org/abs/2605.21924
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Modelo profesor: https://huggingface.co/google/gemma-4-26b-a4b-it
