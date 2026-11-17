# NDIF/qwen3.6-27b-jacobian-lens

## Resumen

El repositorio NDIF/qwen3.6-27b-jacobian-lens no contiene un modelo de lenguaje generativo, sino un artefacto de interpretabilidad: la lente jacobiana (Jacobian lens) pública para Qwen/Qwen3.6-27B, distribuida en un fichero safetensors independiente por capa. Cada fichero almacena la matriz jacobiana de 5120x5120 en fp16 correspondiente al flujo residual tras el bloque decodificador L, junto con un vector de normas por token de 248320 elementos en fp32. El propósito es permitir el análisis de circuitos y la atribución de predicciones token a token sobre las activaciones internas del modelo base.

La lente original fue entrenada por Mateusz Piotrowski (mntss, Anthropic Interpretability) con la librería Jacobian Lens de Anthropic, y publicada originalmente en el repositorio neuronpedia/jacobian-lens bajo el fichero `qwen3.6-27b/jlens/Salesforce-wikitext/Qwen3.6-27B_jacobian_lens_n1000.pt`. NDIF se limita a fragmentar esa lente por capas y a añadir las normas por token, calculadas a partir de la matriz y de la unembedding del modelo. El resultado es un recurso ligero (0,1 GB) pensado para investigadores de interpretabilidad mecanicista que necesiten descargar una sola capa sin arrastrar el artefacto completo.

Su relevancia es doble: por un lado, expone de forma práctica una técnica de atribución lineal sobre el flujo residual de un transformer de 27B parámetros; por otro, lo hace con licencia Apache-2.0 y con un formato que se puede consumir directamente desde safetensors en Python. No es un modelo desplegable para inferencia: es una herramienta de análisis que requiere el modelo base Qwen3.6-27B cargado para tener sentido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefacto de interpretabilidad (lente jacobiana) sobre un transformer Qwen3.6-27B; no es un modelo generativo |
| Parametros totales | No disponible (depende del modelo base Qwen/Qwen3.6-27B; la lente en sí son matrices de 5120x5120 por capa) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | fp16 para la matriz `jacobian`; fp32 para el vector `norms`; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, un fichero `layer-<L>.safetensors` por capa |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo. Contiene, por cada capa L del transformer Qwen3.6-27B, una matriz jacobiana J de forma [5120, 5120] en fp16 que aproxima la transformación lineal del flujo residual tras el bloque decodificador L hacia la representación final, y un vector `norms` de forma [248320] en fp32 que almacena la norma ‖Jᵀ W_U[t]‖ para cada token t del vocabulario, donde W_U es la matriz de unembedding del modelo. La puntuación de la lente para un token t dado un residual h se calcula como `(W_U J h)[t] / norms[t]`, lo que permite leer qué tokens se ven favorecidos por una activación intermedia concreta.

La lente se entrenó con la librería Jacobian Lens de Anthropic sobre el dataset Salesforce-wikitext, con n=1000 según el nombre del fichero original (`Qwen3.6-27B_jacobian_lens_n1000.pt`). NDIF no reentrena ni modifica las matrices: las conserva intactas y solo las reparte en ficheros por capa, añadiendo las normas por token calculadas a partir de cada matriz y de la unembedding del modelo base. La inclusión de las normas responde a que el cálculo de ‖Jᵀ W_U[t]‖ requiere la matriz de unembedding, que no siempre es accesible en el entorno donde se ejecuta la lente.

## Capacidades

- Atribución de predicciones sobre el flujo residual: permite puntuar tokens del vocabulario a partir de una activación intermedia h de cualquier capa L, usando la fórmula `(W_U J h)[t] / norms[t]`.
- Descarga selectiva por capa: cada `layer-<L>.safetensors` se puede obtener de forma independiente, lo que reduce el coste de almacenamiento y de ancho de banda en experimentos que solo necesitan una o pocas capas.
- Análisis de circuitos y features: sirve como herramienta auxiliar para estudiar qué direcciones del residual promueven qué tokens, en línea con trabajos de interpretabilidad mecanicista sobre transformers.
- Integración directa con safetensors y PyTorch: el ejemplo de la model card muestra cómo cargar la lente y aplicarla con `model.lm_head(h @ lens["jacobian"].to(h.dtype).T).float() / lens["norms"]`.
- No incluye generación de texto, tool calling, agentes, visión, audio ni modo thinking: esas capacidades pertenecen al modelo base Qwen3.6-27B, no a este repositorio.
- No se documentan capacidades multilingües propias del artefacto; el vocabulario de 248320 tokens corresponde al del modelo base.

## Casos de uso

- Investigación en interpretabilidad mecanicista: cargar la lente de una capa concreta y analizar qué tokens del vocabulario se activan ante un residual dado, para estudiar la evolución de representaciones a lo largo de la profundidad del modelo.
- Atribución de errores en producción: dado un fallo de predicción del modelo base, extraer el residual de la capa sospechosa y usar la lente para identificar qué tokens competían con la respuesta correcta, facilitando el diagnóstico.
- Estudio de sesgos léxicos: comparar las puntuaciones de la lente para grupos de tokens demográficamente sensibles en distintas capas, con el fin de localizar dónde se amplifican sesgos en el flujo residual.
- Auditoría de mecanismos de seguridad: aplicar la lente sobre residuales de prompts maliciosos para observar qué tokens de rechazo o de cumplimiento se ven favorecidos en capas intermedias, como apoyo a análisis de alineamiento.
- Docencia y divulgación: usar una sola capa (por ejemplo, `layer-44.safetensors`) como ejemplo mínimo y reproducible de atribución lineal en un transformer de 27B, sin necesidad de descargar el artefacto completo.
- Reproducción de experimentos de Anthropic y Neuronpedia: verificar o extender los resultados publicados con la lente original, ahora con acceso por capa y con las normas ya precalculadas.
- Desarrollo de herramientas de visualización: construir dashboards que, a partir de un residual y una capa, muestren el top-k de tokens según la lente, integrándolo en suites de análisis de activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el artefacto: cada fichero `layer-<L>.safetensors` contiene una matriz de 5120x5120 en fp16 (aproximadamente 52 MB) más un vector de 248320 elementos en fp32 (aproximadamente 1 MB); el repositorio completo ocupa 0,1 GB.
- VRAM para el modelo base: no disponible en la información proporcionada; Qwen3.6-27B requiere cargar el modelo completo para que la lente tenga sentido, lo que en fp16 supone del orden de decenas de GB, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible; depende del despliegue del modelo base, no del artefacto de interpretabilidad.
- Cabe en GPU consumer: el artefacto por capa sí cabe en cualquier GPU consumer moderna (por debajo de 100 MB); el modelo base no se evalúa aquí.
- Opciones de despliegue: el artefacto se consume con `safetensors.torch.load_file` en Python; no aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos generativos.
- Latencia y throughput: no disponible; la operación `(W_U J h)` implica una multiplicación de matrices de 5120x5120 por un vector y una proyección contra el vocabulario de 248320 tokens, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NDIF/qwen3.6-27b-jacobian-lens | Lente jacobiana por capas | Matrices 5120x5120 por capa | No aplica | Apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| neuronpedia/jacobian-lens | Lente jacobiana original (fichero único) | Matrices 5120x5120 por capa | No aplica | Apache-2.0 según la fuente citada | Hugging Face |
| anthropics/jacobian-lens | Librería de entrenamiento y aplicación | No aplica | No aplica | No disponible en la información | GitHub |

No se dispone de información sobre otras lentes jaconianas públicas comparables para modelos de tamaño similar en la documentación consultada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes; cualquier uso en ese sentido es un error de categoría.
- Dependencia del modelo base: la lente solo tiene sentido junto con Qwen/Qwen3.6-27B y su unembedding; sin el modelo cargado, las matrices no son interpretables por sí solas.
- Cobertura limitada al dataset de entrenamiento: la lente se entrenó sobre Salesforce-wikitext con n=1000, por lo que su fidelidad fuera de dominios similares a wikitexto no está garantizada.
- Aproximación lineal: la matriz J aproxima la transformación del residual; no captura no linealidades del bloque decodificador ni interacciones entre capas.
- Riesgo de sobreinterpretación: puntuaciones altas de la lente no implican causalidad; deben contrastarse con experimentos de ablación o activación.
- Idiomas no documentados: no se especifica qué idiomas cubre la lente más allá del vocabulario del modelo base.
- Licencia Apache-2.0: permite uso comercial del artefacto, pero el uso del modelo base Qwen3.6-27B se rige por su propia licencia, que no se detalla en esta información.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria y de reportes de errores.
- Sin benchmarks publicados: no hay métricas de fidelidad de la lente ni comparaciones cuantitativas con alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NDIF/qwen3.6-27b-jacobian-lens
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Lente original: https://huggingface.co/neuronpedia/jacobian-lens
- Librería Jacobian Lens de Anthropic: https://github.com/anthropics/jacobian-lens
