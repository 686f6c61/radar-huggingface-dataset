# llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-NVFP4-GGUF

## Resumen

Este modelo es una cuantización NVFP4 en formato GGUF del modelo `llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved`, una versión desensurada del modelo Qwen3.8-27B de Alibaba. El autor, llmfan46, aplica una técnica de abliteration denominada Heretic (v2.0.0.dev0) con una variante del método Magnitude-Preserving Orthogonal Ablation (MPOA) para eliminar los mecanismos de rechazo y censura del modelo original, reduciendo las negativas en un 97 % (de 91/100 a 3/100) y manteniendo una divergencia KL de 0,0244 respecto al modelo base.

El modelo conserva los 15 módulos de Multi-Token Prediction (MTP) originales, lo que permite una generación más rápida al predecir varios tokens a la vez. Con 27 320 698 256 parámetros (27,3 B), es un modelo denso multimodal que acepta entradas de imagen y texto, y está diseñado para ejecutarse en hardware local con cuantización de 4 bits. Su licencia Apache 2.0 permite uso comercial, aunque el contenido desensurado puede generar respuestas que no se ajustan a las políticas de seguridad habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (basado en Qwen3.8-27B) |
| Parametros totales | 27 320 698 256 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal denso de Alibaba que acepta entradas de imagen y texto. La modificación principal consiste en un proceso de abliteration realizado con Heretic v2.0.0.dev0, que aplica una variante del método MPOA sobre los componentes `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`. El objetivo es eliminar los vectores de direccion que provocan rechazos y respuestas evasivas, manteniendo la calidad general del modelo.

El proceso preserva íntegramente los 15 módulos de Multi-Token Prediction (MTP), lo que permite la predicción simultánea de varios tokens y acelera la inferencia. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de ajuste posterior, más allá de los parámetros de abliteration indicados en la model card (direction_index 34,80, pesos máximos y mínimos para cada componente). La divergencia KL de 0,0244 respecto al modelo original indica que la modificación apenas altera la distribución de salida.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del modelo base Qwen3.8-27B, incluida la comprensión de instrucciones complejas y el razonamiento multi-paso.
- Multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`), lo que permite responder a preguntas sobre imágenes, analizar diagramas o procesar documentos escaneados.
- Generación de código: el modelo base destaca en tareas de programación, y esta variante conserva esa capacidad al no alterar los pesos principales.
- Agentes y tool calling: compatible con flujos de trabajo agénticos, aunque no se especifican detalles concretos de la implementación.
- Multi-Token Prediction (MTP): la preservación de los 15 módulos MTP permite una decodificación más rápida al predecir varios tokens a la vez, reduciendo la latencia en generación larga.
- Menor censura: el modelo responde a solicitudes que el original rechazaría (por ejemplo, contenido sensible o temas controvertidos), con una tasa de rechazo de 3/100 frente a 91/100 del original.

## Casos de uso

- Generación de código en entornos locales: el modelo puede integrarse en IDEs o pipelines de CI/CD para autocompletar código, generar funciones o revisar fragmentos, gracias a su capacidad de razonamiento y a la baja latencia que proporciona el MTP.
- Automatización de oficina: procesamiento de documentos, redacción de correos, resumen de informes o extracción de datos de tablas y gráficos, aprovechando la entrada multimodal.
- Análisis de imágenes técnicas: el modelo puede interpretar capturas de pantalla, diagramas de flujo o esquemas de arquitectura, y generar explicaciones o código asociado.
- Investigación en seguridad de IA: al eliminar los mecanismos de rechazo, resulta útil para estudiar comportamientos de modelos sin restricciones, evaluar sesgos o analizar límites de seguridad.
- Chatbots de nicho sin censura: para comunidades que requieren respuestas directas sobre temas médicos, legales o filosóficos sin evasivas, siempre que se respeten las normativas locales.
- Prototipado rápido de agentes conversacionales: su compatibilidad con tool calling y razonamiento multi-paso permite construir asistentes que consultan APIs o bases de datos, ejecutan acciones y explican los resultados.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks específicos para esta versión desensurada. Sin embargo, proporciona datos comparativos con el modelo original:

| Metrica | Modelo desensurado | Qwen3.8-27B original |
|---|---|---|
| Tasa de rechazo (sobre 100 prompts) | 3/100 | 91/100 |
| Divergencia KL | 0,0244 | 0 (por definicion) |
| MMLU (accuracy) | No medido | 83,42 % (5857/7021 correctas) |

El valor de MMLU corresponde al modelo original, no a esta variante, por lo que no se puede afirmar que el rendimiento en conocimiento general se mantenga exactamente. La baja divergencia KL sugiere que la degradación es mínima, pero no hay datos propios.

## Requisitos de hardware

- VRAM estimada: con cuantización NVFP4 (4 bits), los pesos ocupan aproximadamente 13,7 GB (27,3 B × 0,5 bytes). Añadiendo overhead de contexto y activaciones, se recomienda al menos 16 GB de VRAM para inferencia básica.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o H100 (80 GB). En GPUs con 16 GB puede funcionar con contexto reducido.
- Compatibilidad con consumer GPU: sí, una RTX 4090 o 4080 puede ejecutar el modelo sin problemas.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten GGUF. También se puede usar con vLLM si se convierte a safetensors (aunque el repo solo ofrece GGUF).
- Latencia y throughput: no se dispone de datos medidos. El MTP preservado debería reducir la latencia de decodificación, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3 B | No disponible | Apache 2.0 | safetensors | Modelo base con censura estandar |
| Este modelo (desensurado NVFP4) | 27,3 B | No disponible | Apache 2.0 | GGUF (NVFP4) | 97 % menos rechazos, MTP preservado |
| Qwen3.8-27B-Uncensored-GGUF (orcrouter) | 27,3 B | 262 K (segun blog) | Apache 2.0 | GGUF (F16 y 12 cuantizaciones) | Otra variante desensurada, no relacionada con llmfan46 |

No se dispone de datos de rendimiento comparativos entre estas variantes. La principal diferencia es la técnica de abliteration utilizada y el formato de distribución.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al eliminar la censura, el modelo puede generar contenido sesgado, ofensivo o factualmente incorrecto con mayor facilidad, ya que no tiene mecanismos de rechazo que mitiguen respuestas problemáticas.
- Riesgo de contenido inapropiado: la ausencia de filtros puede producir salidas que violen normativas locales o políticas de uso, especialmente en entornos comerciales o públicos.
- Sin datos de rendimiento propios: no hay benchmarks de MMLU, HumanEval u otros para esta variante, solo la divergencia KL y la tasa de rechazo. La calidad real en tareas específicas no está verificada.
- Contexto limitado: no se especifica la longitud de contexto soportada en esta cuantización; puede ser menor que la del modelo original.
- Dependencia del hardware: la cuantización NVFP4 requiere soporte de hardware NVIDIA (Ampere o posterior) para aprovechar al máximo la aceleración; en otras GPUs puede funcionar con menor eficiencia.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede no ser apto para todos los públicos; el usuario es responsable del uso que haga del modelo.

## Enlaces

- [Modelo en HuggingFace (este repo)](https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-NVFP4-GGUF)
- [Modelo base desensurado (safetensors)](https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved)
- [Modelo original Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Proyecto Heretic](https://heretic-project.org/)
- [Blog sobre Magnitude-Preserving Orthogonal Ablation (MPOA)](https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration)
- [Blog de orcarouter sobre una variante uncensored de Qwen3.8-27B](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
- [Repositorio oficial de Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
