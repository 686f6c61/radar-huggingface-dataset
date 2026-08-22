# ForgedTimbers/Phi-3-mini-4k-gguf

## Resumen

El modelo Phi-3-mini-4k-instruct es un LLM ligero de 3.800 millones de parámetros desarrollado por Microsoft, que se distribuye aquí en formato GGUF para su ejecución eficiente en entornos con recursos limitados. Este repo concreto, publicado por ForgedTimbers, ofrece los pesos cuantizados del modelo instruct original, lo que permite desplegarlo en hardware de consumo y en producción con baja latencia. El modelo pertenece a la familia Phi-3, con una ventana de contexto de 4.096 tokens, y está diseñado para tareas de razonamiento, matemáticas y código, con un énfasis en la densidad de razonamiento de los datos de entrenamiento.

La relevancia actual de este modelo reside en su excelente relación calidad/rendimiento: con solo 3.8B parámetros compite con modelos de hasta 13B en benchmarks de sentido común, comprensión del lenguaje, matemáticas y código. El post-procesado incluye supervisión fina (SFT) y optimización directa de preferencias (DPO), lo que garantiza una adherencia precisa a instrucciones y una robustez de seguridad notable. La licencia MIT permite uso comercial y de investigación sin restricciones significativas, lo que lo convierte en una opción atractiva para empresas que necesitan un modelo open source de alta calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención por ventana deslizante (sliding window attention) |
| Parametros totales | 3.821.079.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q4_K_M (4 bits, 2.2 GB) y FP16 (16 bits, 7.2 GB) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors también disponible en el repo original de Microsoft) |

## Arquitectura y entrenamiento

El modelo Phi-3-mini-4k-instruct es un transformer decoder-only con arquitectura similar a la de los modelos Llama, pero con una innovación clave: la atención con ventana deslizante (sliding window attention). Esta técnica permite mantener una ventana de contexto de 4.096 tokens con un coste computacional reducido, ya que cada token solo atiende a los tokens dentro de una ventana local, en lugar de a todo el contexto anterior. Esto reduce significativamente el uso de memoria y acelera la inferencia, especialmente en secuencias largas.

El entrenamiento se realizó con el dataset Phi-3, que combina datos sintéticos generados por modelos anteriores con datos web públicos filtrados, priorizando la calidad y la densidad de razonamiento. El proceso de post-entrenamiento incluye una fase de supervisión fina (SFT) seguida de una optimización directa de preferencias (DPO), que ajusta el modelo para seguir instrucciones con precisión y rechazar respuestas no deseadas o inseguras. El modelo se evaluó contra benchmarks de sentido común, comprensión del lenguaje, matemáticas, código, contexto largo y razonamiento lógico, obteniendo resultados de estado del arte entre modelos de menos de 13B de parámetros.

## Capacidades

- Generación de texto en inglés con alta calidad de razonamiento, especialmente en tareas de matemáticas y lógica.
- Razonamiento multi-paso y comprensión de contexto largo dentro de la ventana de 4.096 tokens.
- Generación de código fuente en varios lenguajes de programación, con soporte para completado y explicación de fragmentos de código.
- Sigue instrucciones de forma precisa gracias al entrenamiento con SFT y DPO.
- Capacidades de conversación multi-turno en formato de chat específico del modelo.
- No soporta tool calling / function calling de forma nativa según la información disponible.
- No soporta agentes multi-paso ni razonamiento con herramientas externas.
- No soporta visión, audio ni otras modalidades más allá del texto.
- Capacidades multilingües: solo inglés, no soporta otros idiomas de forma nativa.

## Casos de uso

- Asistentes virtuales en entornos con recursos limitados: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 4K tokens, lo que permite atender consultas de clientes en dispositivos con poca memoria, como Raspberry Pi o móviles, gracias al formato GGUF cuantizado a 4 bits.
- Generación de código en producción: con soporte para completos de código y explicaciones, puede integrarse en pipelines de CI/CD para autogenerar documentación técnica o sugerir parches, siempre que se respete el límite de contexto de 4K tokens.
- Análisis de documentos técnicos: su razonamiento denso permite extraer conclusiones de textos técnicos largos, aunque la ventana de 4K tokens limita la longitud del documento que puede procesar en una sola pasada.
- Chatbots de atención al cliente en inglés: su adherencia a instrucciones y su licencia MIT permiten desplegarlo en entornos comerciales sin costes de licencia, usando cuantización Q4_K_M para reducir la huella de memoria.
- Investigación académica en procesamiento del lenguaje natural: su tamaño reducido y su rendimiento competitivo lo hacen ideal para experimentos de fine-tuning y evaluación de técnicas de razonamiento en entornos con una sola GPU.
- Despliegue en edge computing: con un peso de solo 2.2 GB en cuantización Q4_K_M, puede ejecutarse en hardware embebido como Jetson Nano o Raspberry Pi 5, con un rendimiento suficiente para tareas de clasificación de texto y generación de respuestas cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original de Microsoft indica que el modelo muestra un rendimiento robusto y de estado del arte entre modelos de menos de 13B de parámetros, pero no se proporcionan cifras concretas en este repo.

## Requisitos de hardware

- VRAM estimada para inferencia: la versión Q4_K_M ocupa 2.2 GB, por lo que cabe en GPU con 4 GB de VRAM o más. La versión FP16 ocupa 7.2 GB, recomendable para GPU con 8 GB o más.
- GPU recomendadas: para la versión cuantizada, cualquier GPU consumer moderna (GTX 1060 6GB, RTX 3060, RTX 4090) es suficiente. Para FP16, se recomienda RTX 3090 o superior.
- Cabe en consumer GPU: sí, especialmente con cuantización Q4_K_M.
- Opciones de despliegue: compatible con llama.cpp, Ollama, vLLM, TGI y cualquier framework que soporte GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada. Sin embargo, en una RTX 4090 se puede esperar una velocidad de generación de varios cientos de tokens por segundo con la cuantización Q4_K_M, aunque estos datos no han sido verificados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| Phi-3-mini-4k-instruct (GGUF) | 3.8B | 4K | MIT | GGUF | Modelo ligero, razonamiento |
| Llama-3-8B (GGUF) | 8B | 8K | Llama 3 license | GGUF | Modelo general, más grande |
| Mistral-7B (GGUF) | 7B | 8K | Apache 2.0 | GGUF | Modelo general, razonamiento |

Nota: no se dispone de datos de benchmarks comparativos en la información proporcionada. La comparativa se basa en características técnicas públicas de cada modelo.

## Limitaciones y advertencias

- El modelo solo soporta inglés de forma nativa, por lo que su uso en otros idiomas requerirá un fine-tuning previo.
- La ventana de contexto es de solo 4.096 tokens, lo que limita el procesamiento de documentos largos o conversaciones extensas.
- El modelo no soporta tool calling ni function calling de forma nativa, lo que dificulta su integración en agentes que necesiten ejecutar acciones externas.
- Existe riesgo de alucinación, especialmente en temas no cubiertos por los datos de entrenamiento. Se recomienda verificar las respuestas en aplicaciones de alto riesgo.
- No se han publicado resultados de benchmarks en la información disponible, por lo que el rendimiento en tareas específicas no está verificado.
- El modelo fue entrenado con datos sintéticos y web filtrados, lo que puede introducir sesgos presentes en los datos originales.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe cumplir con las leyes y regulaciones aplicables en su caso de uso.
- Para uso en producción, se recomienda evaluar la precisión y la seguridad del modelo en el dominio concreto, ya que no ha sido específicamente diseñado para todos los downstream.

## Enlaces

- Repo de HuggingFace de este modelo: https://huggingface.co/ForgedTimbers/Phi-3-mini-4k-gguf
- Modelo original de Microsoft en HuggingFace: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Repo de GGUF de Microsoft: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf
- Blog de Phi-3 de Microsoft: https://aka.ms/phi3blog-april
- Informe técnico de Phi-3: https://aka.ms/phi3-tech-report
- Repo de GGUF de LMStudio Community: https://huggingface.co/lmstudio-community/Phi-3-mini-4k-instruct-GGUF
- Artículo de dev.co sobre Phi-3-Mini-4K: https://dev.co/ai/llms/phi-3-mini-4k-instruct-gguf
- Página de AIBase: https://model.aibase.com/models/details/1927649963630923776
