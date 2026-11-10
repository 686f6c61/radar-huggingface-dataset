# Plygunovvv/Tnki-2.1.Pro

## Resumen

Tinki-2.1.Pro es un modelo de lenguaje multimodal de tipo *image-text-to-text* publicado por el usuario Plygunovvv en Hugging Face, construido como un *fine-tune* sobre el modelo base Moonshot AI Kimi K3.1-Pro. Se distribuye con pesos en formato safetensors de 8 bits mediante la librería `compressed-tensors` y requiere `transformers` con código personalizado (`custom_code`). El repositorio ocupa 1561,4 GB y declara 2.780.110.363.392 parámetros totales según los metadatos de safetensors, lo que lo sitúa en la categoría de modelos masivos de escala trillonaria.

Arquitectónicamente hereda de Kimi K3.1-Pro un transformer de tipo Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104.000 millones activados por token, 93 capas (una densa), 896 expertos con 16 seleccionados por token más 2 compartidos, y una ventana de contexto de 1.048.576 tokens. Combina mecanismos de atención KDA y Gated DSA, función de activación SiTU-GLU y un codificador visual MoonViT-V2 de 401 millones de parámetros, lo que le confiere capacidades multimodales nativas.

Su relevancia actual radica en que reproduce, bajo una licencia derivada de la original (kimi-k3.1-pro), un modelo de frontera con contexto de un millón de tokens y capacidades agénticas, empaquetado en 8 bits para facilitar el despliegue. No obstante, el repositorio no incluye resultados de benchmarks propios ni información sobre el proceso de fine-tune, y el tamaño del checkpoint hace que su uso práctico quede restringido a infraestructuras de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer multimodal |
| Parametros totales | 2.780.110.363.392 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | 8-bit (compressed-tensors); no se indican otras variantes |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other, license_name: "kimi-k3.1-pro") |
| Formato de pesos | safetensors (8-bit, compressed-tensors) |
| Capas | 93 (1 densa) |
| Composicion de atencion | 69 KDA + 24 Gated DSA |
| Dimension de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension de indice DSA | 128 |
| Cabezas de indice DSA | 32 |
| Top-K de indice DSA | 2048 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamano de vocabulario | 160K |
| Funcion de activacion | SiTU-GLU |
| Codificador visual | MoonViT-V2 |
| Parametros del codificador visual | 401M |
| Modelo base | moonshotai/Kimi-K3.1-Pro |
| Libreria | transformers (custom_code) |
| Tamano del repositorio | 1561,4 GB |

## Arquitectura y entrenamiento

Tinki-2.1.Pro es un *fine-tune* del modelo Moonshot AI Kimi K3.1-Pro, que a su vez fue post-entrenado por Moonshot AI a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios de aplicación. La arquitectura es un transformer MoE de 93 capas con una única capa densa, 896 expertos enrutados (16 activos por token) más 2 expertos compartidos, y una dimensión latente de MoE de 3584. La atención combina 69 capas KDA (atención lineal) con 24 capas Gated DSA (atención dispersa con índice de top-K 2048), lo que permite manejar ventanas de un millón de tokens sin el coste cuadrático de una atención densa completa.

El modelo incorpora un codificador visual MoonViT-V2 de 401 millones de parámetros que lo habilita para tareas image-text-to-text, y emplea la activación SiTU-GLU junto con un vocabulario de 160.000 tokens. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si el fine-tune de Plygunovvv empleó RLHF, DPO u otra técnica de alineamiento; tampoco se especifican las innovaciones introducidas por el autor del fine-tune respecto al modelo base. Todo el crédito arquitectónico y de entrenamiento original corresponde a Moonshot AI según la propia model card.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del post-entrenamiento de Kimi K3.1-Pro.
- Codificación de software y tareas de programación, con mejoras declaradas por el autor en el dominio de *coding*.
- Creación 3D, según se indica explícitamente en la introducción del modelo.
- Investigación financiera y análisis de dominios especializados.
- Procesamiento multimodal image-text-to-text gracias al codificador MoonViT-V2.
- Capacidades agénticas y de razonamiento multi-paso, orientadas a flujos de trabajo autónomos.
- Ventana de contexto de 1.048.576 tokens para documentos y conversaciones extensas.
- Precisión factual mejorada respecto al modelo base, según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible en la información proporcionada.
- Modo *thinking* explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con un millón de tokens de contexto, el modelo puede ingerir bases de código enteras y responder preguntas de arquitectura, dependencias o refactorizaciones sin trocear el código en fragmentos.
- Asistentes de investigación financiera: el modelo puede procesar informes anuales, transcripciones de llamadas de resultados y series de datos en una sola ventana para generar resúmenes y comparativas entre compañías.
- Generación de código en producción: dado su enfoque en *coding* y su contexto largo, encaja en pipelines que requieren entender múltiples ficheros relacionados y proponer parches coherentes con el resto del proyecto.
- Creación de contenido 3D asistida: el modelo puede generar descripciones estructuradas, scripts de modelado o especificaciones de escenas a partir de instrucciones en lenguaje natural e imágenes de referencia.
- Agentes autónomos multi-paso: su orientación agéntica permite encadenar subtareas (búsqueda, cálculo, verificación) sobre contextos extensos, útil en automatización de flujos de trabajo.
- Documentación técnica multimodal: al aceptar imagen y texto, puede describir diagramas de arquitectura, capturas de interfaz o esquemas y vincularlos con la documentación textual existente.
- Atención al cliente con historial largo: la ventana de 1M tokens permite mantener el hilo completo de interacciones pasadas de un cliente sin resumir, reduciendo la pérdida de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras cualitativas en *coding*, creación 3D, investigación financiera y precisión factual, pero no aporta cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en 8 bits ocupa aproximadamente 1561,4 GB, por lo que se requiere un nodo multi-GPU con al menos esa capacidad agregada, más margen para caché KV y activaciones.
- GPU recomendadas: clústeres de H100 (80 GB) o A100 (80 GB); un despliegue realista exige del orden de 20 GPUs de 80 GB solo para los pesos, más el espacio adicional de la caché KV para contextos largos.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 3090, etc.) ni en configuraciones multi-GPU domésticas razonables.
- Opciones de despliegue: `transformers` con `custom_code` y `compressed-tensors` para la carga en 8 bits; el soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tinki-2.1.Pro | 2,8T | 104B | 1.048.576 | kimi-k3.1-pro (other) | Hugging Face |
| Kimi K3.1-Pro (base) | 2,8T | 104B | 1.048.576 | kimi-k3.1-pro | Hugging Face |
| Kimi K3 (predecesor) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita al linaje directo del modelo, ya que la información proporcionada no incluye datos de rendimiento ni especificaciones de alternativas de otros proveedores. No se dispone de cifras de benchmarks que permitan una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; la model card afirma mejoras en precisión factual, pero no aporta métricas que lo respalden.
- Idiomas soportados: no especificados, lo que impide garantizar un rendimiento consistente fuera del inglés o del chino sin evaluación previa.
- Licencia: se hereda la licencia "kimi-k3.1-pro" del modelo base, marcada como `other`. Es imprescindible revisar los términos del fichero LICENSE de Moonshot AI antes de cualquier uso comercial.
- El repositorio no documenta el proceso de fine-tune, el dataset utilizado ni las evaluaciones realizadas por el autor, por lo que no hay garantías sobre la calidad o la regresión respecto al modelo base.
- El tamaño del checkpoint (1561,4 GB en 8 bits) y la necesidad de `custom_code` complican el despliegue y elevan el coste operativo.
- El modelo se publicó con 0 descargas y 0 *likes* en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- No se confirma soporte en frameworks de inferencia de alto rendimiento como vLLM o TGI, lo que puede limitar el throughput en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Plygunovvv/Tnki-2.1.Pro
- Modelo base Kimi K3.1-Pro: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
