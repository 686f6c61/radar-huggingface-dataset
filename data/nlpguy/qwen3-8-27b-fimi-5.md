# nlpguy/Qwen3.8-27B-Fimi-5

## Resumen

nlpguy/Qwen3.8-27B-Fimi-5 es un modelo de lenguaje multimodal (image-text-to-text) derivado de la familia Qwen3.8-27B de Alibaba, desarrollado por el usuario nlpguy mediante fine-tuning con la librería Unsloth y el stack de entrenamiento TRL de HuggingFace. El modelo parte de la versión intermedia nlpguy/Qwen3.8-27B-Fimi-4, que a su vez se basa en el modelo original Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros con arquitectura Qwen3.5.

El modelo está diseñado para tareas de razonamiento multimodal, generación de código, flujos de trabajo agénticos y automatización de ofimática. Su relevancia actual radica en que ofrece rendimiento de nivel superior para hardware local, con licencia Apache-2.0 que permite uso comercial sin restricciones, y una longitud de contexto amplia que facilita tareas de razonamiento de varios pasos. El fine-tuning con Unsloth reduce el coste de entrenamiento y mejora la eficiencia de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (dense transformer multimodal) |
| Parametros totales | 27.356.728.560 (27,4 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se hereda del base Qwen3.8-27B, sin dato publicado en la ficha) |
| Tipos de cuantizacion | no disponible (formato safetensors en fp16; se pueden generar cuantizaciones GGUF/AWQ con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 54,7 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer denso multimodal que procesa tanto texto como imágenes. El modelo original Qwen3.8-27B fue lanzado por el equipo Qwen de Alibaba como evolución del Qwen3.6-27B, con mejoras específicas en generación de código, productividad ofimática y razonamiento multimodal. El fine-tuning realizado por nlpguy sobre el checkpoint Fimi-4 se ejecutó con la librer Unsloth, que acelera el entrenamiento aproximadamente 2 veces, y con la librer TRL de Hugging Face para el ajuste fino supervisado. Los datos de entrenamiento específicos del fine-tune no se han publicado en la model card; el modelo base Qwen3.8-27B fue entrenado con un corpus multimodal extenso que incluye texto, imágenes y pares imagen-texto, con refuerzo de preferencias humanas para mejorar la fiabilidad en tareas complejas.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto, permitiendo responder preguntas sobre imágenes, describir contenido visual y razonar sobre documentos escaneados.
- Generación de código: el modelo base Qwen3.8-27B destaca en tareas de programación, incluyendo generación, explicación y depuración de código en múltiples lenguajes.
- Soporte de agentes y razonamiento multi-paso: planificación autónoma de tareas largas con realimentación del entorno, apto para flujos de trabajo agénticos.
- Control flexible del pensamiento: capacidad de alternar entre modos de razonamiento explícito (thinking) y respuesta directa, similar a la familia Qwen3.
- Automatización ofimática: procesamiento de documentos, hojas de cálculo y presentaciones a partir de entradas visuales y textuales.
- Multilingüe limitado: la model card indica idioma "en", aunque el modelo base Qwen3.8-27B soporta varios idiomas; no se garantiza el rendimiento fuera del inglés en este fine-tune.
- Compatibilidad con tool calling y function calling: heredado del base, útil para integrar el modelo en pipelines de agentes con herramientas externas.

## Casos de uso

- Automatización de atención al cliente: el modelo puede procesar capturas de pantalla de conversaciones o tickets, extraer el contexto y generar respuestas coherentes de varios turnos, reduciendo la carga del personal humano.
- Análisis de documentos y facturas: dado que es multimodal, puede leer imágenes de facturas, contratos o informes, extraer datos clave y generar resúmenes o estructurar la información en tablas.
- Generación de código en producción: con soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para generar tests, documentar APIs o revisar código, siempre que se valide la salida.
- Asistente de ofimática: puede redactar correos, resumir reuniones a partir de notas manuscritas escaneadas o transcribir y estructurar contenido de imágenes de pizarras blancas.
- Investigación y estudio: útil para explicar diagramas, gráficos o figuras científicas, ayudando a investigadores a interpretar resultados visuales con razonamiento paso a paso.
- Prototipado de agentes multimodales: como modelo de 27 B con licencia Apache-2.0, es adecuado para experimentar con arquitecturas de agentes que combinan percepción visual y razonamiento, sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune nlpguy/Qwen3.8-27B-Fimi-5 en la información disponible. El modelo base Qwen3.8-27B ha sido evaluado en el benchmark MathVision con la instrucción "Please reason step by step, and put your final answer within \boxed{}", y Alibaba reporta mejoras frente a la versión anterior Qwen3.6-27B en tareas de código y productividad, pero no se dispone de las cifras exactas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: en formato fp16 (safetensors) el modelo requiere aproximadamente 55-60 GB de VRAM para inferencia sin cuantización. Con cuantización de 4 bits, el uso de VRAM se reduce a ~16-18 GB; con 8 bits, ~28-30 GB.
- GPU recomendadas: para fp16, se necesitan GPUs de servidor como A100 80GB o H100 80GB. Con cuantización 4-bit, puede ejecutarse en una RTX 4090 (24 GB) o RTX 3090 (24 GB); con 8-bit, en una A100 40GB o RTX A6000 48GB.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en tarjetas de consumo de 24 GB (RTX 4090, RTX 3090) utilizando cuantización de 4 bits o 5 bits.
- Opciones de despliegue: compatible con el ecosistema Hugging Face transformers, text-generation-inference (TGI), vLLM, llama.cpp (tras conversión a GGUF), Ollama y TensorRT-LLM. La etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles. Dependerá de la GPU, la cuantización y el uso de técnicas como prefill continuo o decodificación especulativa. En una RTX 4090 con cuantización 4-bit, la generación de tokens de texto se sitúa típicamente en el rango de 15-30 tokens/s para modelos de 27B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Observaciones |
|---|---|---|---|---|---|
| nlpguy/Qwen3.8-27B-Fimi-5 | 27,4 B | no disponible | Sí | Apache-2.0 | Fine-tune específico, sin datos de benchmark publicados |
| Qwen3.8-27B (base) | 27,4 B | no disponible | Sí | Apache-2.0 | Modelo original de Alibaba, con benchmarks públicos |
| Qwen3.6-27B | ~27 B | no disponible | Sí | Apache-2.0 | Versión anterior, menos capaz en código y ofimática |
| Llama 3.3 70B | 70 B | 128K | No | Llama 3.3 License | Más grande, sin modalidad visual |

La comparativa con Llama 3.3 70B es aproximada; para una comparación exacta de rendimiento se necesitarían benchmarks del Fimi-5, que no están disponibles.

## Limitaciones y advertencias

- No se han publicado datos de evaluación para este fine-tune concreto; el rendimiento en tareas específicas puede variar respecto al modelo base.
- La model card indica solo idioma inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como todo LLM multimodal, puede generar contenido falso o no verificado, especialmente en tareas de razonamiento complejo sobre imágenes ambiguas.
- Sesgos: el modelo hereda los sesgos del conjunto de datos de entrenamiento del base Qwen3.8-27B, que pueden incluir sesgos culturales y de género.
- Licencia: Apache-2.0 permite uso comercial, pero se deben cumplir las condiciones de atribución y no se ofrece garantía sobre el rendimiento.
- Para producción, se recomienda validar las salidas en tareas críticas y considerar la cuantización para reducir requisitos de hardware, aunque puede degradar ligeramente la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpguy/Qwen3.8-27B-Fimi-5
- Modelo base intermedio: https://huggingface.co/nlpguy/Qwen3.8-27B-Fimi-4
- Página del modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Alibaba Cloud: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
