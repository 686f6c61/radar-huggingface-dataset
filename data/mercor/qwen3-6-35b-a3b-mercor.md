# mercor/Qwen3.6-35B-A3B-Mercor

## Resumen

Qwen3.6-35B-A3B-Mercor es un post-entrenamiento con aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.6-35B-A3B, realizado por la empresa Mercor. El objetivo es especializar el modelo en tareas de "trabajo de conocimiento" agéntico, es decir, agentes que ejecutan flujos de trabajo complejos con herramientas, código y razonamiento multi-paso. Se entrenó sobre los datasets APEX-Agents, un conjunto de datos off-the-shelf diseñado para este tipo de escenarios, y el proceso se documenta en el blog de Mercor con una guía de entrenamiento RL de 397B tokens usando su framework SkyRL.

El modelo base Qwen3.6-35B-A3B, lanzado en abril de 2026, es un MoE (Mixture of Experts) con 35 mil millones de parámetros totales y 3 mil millones activos por token. Presenta una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención Gated estándar, 256 expertos (8 ruteados + 1 compartido) e incluye un codificador de visión para entrada de imágenes y vídeo. Su contexto nativo es de 262.144 tokens, lo que lo hace adecuado para tareas de larga duración y procesamiento de documentos extensos.

La relevancia de este modelo radica en que demuestra cómo un post-entrenamiento RL dirigido puede convertir un modelo generalista de código abierto en un agente especializado para automatización de tareas de conocimiento, sin necesidad de reentrenar desde cero. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention), 256 expertos (8 ruteados + 1 compartido), con codificador de visión |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3.6 es multilingüe, pero no se especifican idiomas concretos para esta versión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con una combinación de atención lineal (Gated DeltaNet) y atención tradicional (Gated Attention). Los 256 expertos se distribuyen en 8 expertos ruteados activos por token más un experto compartido, lo que permite activar solo 3B de los 35B parámetros en cada paso de inferencia. Esta arquitectura híbrida reduce el coste computacional en comparación con un MoE denso equivalente, manteniendo la capacidad de modelado de dependencias a largo plazo gracias al mecanismo de atención estándar.

El post-entrenamiento realizado por Mercor utiliza aprendizaje por refuerzo sobre los datasets APEX-Agents, que consisten en trayectorias de agentes resolviendo tareas de conocimiento (navegación web, ejecución de código, uso de herramientas, razonamiento multi-paso). El entrenamiento se llevó a cabo con el framework SkyRL, como se detalla en el blog de Mercor. No se especifican los hiperparámetros exactos del RL (algoritmo, número de pasos, función de recompensa) en la información disponible, aunque el blog menciona un entrenamiento total de 397B tokens en el contexto del proyecto.

El modelo conserva el codificador de visión del base, por lo que puede procesar imágenes y vídeo además de texto. La integración con la librería transformers y el pipeline image-text-to-text sugieren que está preparado para entrada multimodal.

## Capacidades

- Generación de texto y razonamiento multi-paso, optimizado para tareas agénticas donde el modelo debe planificar, ejecutar acciones y evaluar resultados.
- Ejecución de código: el blog de Mercor indica que el modelo "depende cada vez más de la ejecución de código", lo que sugiere una capacidad reforzada para generar y depurar código en entornos de agente.
- Uso de herramientas (tool calling): aunque no se documenta explícitamente, los datasets APEX-Agents y el enfoque en agentes implican soporte para llamadas a funciones y APIs.
- Comprensión multimodal: gracias al codificador de visión del modelo base, puede procesar imágenes y vídeo como entrada adicional al texto.
- Contexto largo: con 262.144 tokens de ventana, puede manejar documentos extensos, conversaciones largas o historiales de agente prolongados.
- Capacidades multilingües: no se especifican idiomas concretos, pero el modelo base Qwen3.6 suele cubrir múltiples lenguas; esta versión no documenta restricciones idiomáticas.

## Casos de uso

- Automatización de investigación de mercado: el agente puede buscar información en la web, extraer datos de múltiples fuentes, sintetizar informes y ejecutar análisis estadísticos mediante código Python, todo en una sola sesión con contexto largo.
- Asistente de desarrollo de software: integrado en un IDE o pipeline de CI/CD, el modelo puede generar código, revisar cambios, ejecutar tests y corregir errores de forma autónoma, aprovechando su capacidad de ejecución de código y razonamiento multi-paso.
- Análisis de documentos legales o financieros: con su ventana de 262k tokens, puede procesar contratos extensos o informes anuales completos, extraer cláusulas relevantes y generar resúmenes estructurados.
- Agente de soporte técnico especializado: puede manejar consultas complejas que requieren consultar bases de conocimiento, ejecutar comandos de diagnóstico y escalar problemas, manteniendo el contexto de toda la conversación.
- Generación de contenido técnico y documentación: dado su entrenamiento en código y razonamiento, puede redactar guías técnicas, documentación de APIs y tutoriales basados en análisis de repositorios.
- Automatización de tareas de data science: el agente puede cargar datasets, realizar limpieza de datos, entrenar modelos simples y generar visualizaciones, todo mediante la ejecución de código en un notebook o entorno sandbox.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El blog de Mercor menciona una evaluación en Terminal-Bench 2.1 con el harness Terminus para comprobar la generalización a tareas agénticas, pero no se ofrecen cifras concretas en los materiales consultados. Tampoco se proporcionan resultados de MMLU, HumanEval, GSM8K u otras pruebas estándar para esta versión post-entrenada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 35B parámetros en total. En precisión fp16/bf16, los pesos ocupan aproximadamente 70 GB (coincide con el tamaño del repo de 70.2 GB). Con cuantización 8-bit se reduce a ~35 GB, y con 4-bit a ~18-20 GB.
- GPU recomendadas: para fp16 se necesitan GPUs de centro de datos como A100 80GB, H100 80GB o A6000 48GB (con cuantización 8-bit). Para 4-bit, una RTX 4090 (24GB) o RTX 6000 Ada (48GB) son suficientes.
- Al ser un MoE con solo 3B parámetros activos, la inferencia es más rápida de lo que sugeriría el tamaño total, pero la memoria requerida depende de cargar todos los pesos del modelo.
- Opciones de despliegue: compatible con vLLM, llama.cpp (con conversión a GGUF), Ollama, TGI y el pipeline de transformers. Se recomienda vLLM para producción con alta concurrencia.
- Latencia y throughput: no se proporcionan datos medidos. Como referencia orientativa, un MoE 35B-A3B suele alcanzar decenas de tokens por segundo en GPUs modernas con cuantización, pero esto depende del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mercor | 35B | 3B | 262k | Apache 2.0 | Post-entrenado RL para agentes |
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262k | Apache 2.0 | Modelo original sin RL |
| Qwen3.5-35B-A3B | 35B | 3B | 262k (estimado) | Apache 2.0 | Versión anterior, mencionada en el blog de Mercor |

No se dispone de benchmarks comparativos entre estas versiones. El blog de Mercor sugiere que el post-entrenamiento cambia el comportamiento del modelo hacia una mayor dependencia de la ejecución de código, pero no cuantifica la mejora en tareas estándar.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un post-entrenamiento sobre datasets específicos de agentes, puede presentar sesgos derivados de los datos de entrenamiento de APEX-Agents, que no están documentados en detalle.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o no verificada, especialmente en tareas de razonamiento complejo o cuando se le pide resumir datos no presentes en el contexto.
- Limitaciones de contexto e idioma: aunque la ventana es de 262k tokens, el rendimiento en contextos muy largos puede degradarse; no se especifican idiomas soportados, lo que obliga a validar en los idiomas de despliegue.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base Qwen3.6 por si hubiera condiciones adicionales.
- Adecuación para producción: al ser una versión post-entrenada con fines de investigación (5 descargas, 0 likes), no hay evidencia de validación en entornos de producción reales. Se recomienda realizar pruebas exhaustivas antes de desplegar en servicios críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mercor/Qwen3.6-35B-A3B-Mercor
- Blog de Mercor sobre el entrenamiento RL: https://www.mercor.com/blog/training-frontier-knowledge-work-agents-a-397b-rl-training-guide-with-skyrl
- Página de referencia del modelo Qwen3.6-35B-A3B: https://theresanaiforthat.com/model/qwen3-6-35b-a3b/
- Ficha en Awesome Agents: https://awesomeagents.ai/models/qwen-3-6-35b-a3b/
- Referencia en LLM Reference: https://www.llmreference.com/model/qwen3.6-35b-a3b
