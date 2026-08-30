# ManthanLabs/qwen2.5-coder-3b-instruct-q8_0

## Resumen

Este repositorio contiene una conversión a formato GGUF con cuantización Q8_0 del modelo Qwen2.5-Coder-3B-Instruct, desarrollado originalmente por Alibaba Cloud y convertido por ManthanLabs. Qwen2.5-Coder-3B-Instruct es un modelo de lenguaje especializado en generación y comprensión de código, con 3.397 millones de parámetros (3,4B) y una ventana de contexto de 32.768 tokens. Forma parte de la familia Qwen2.5-Coder, que destaca por su rendimiento en tareas de programación con un tamaño compacto, lo que lo hace adecuado para entornos con recursos limitados.

La versión GGUF Q8_0 ofrece una cuantización de 8 bits que mantiene una alta fidelidad respecto al modelo original en float32, a la vez que reduce el espacio en disco a aproximadamente 3,6 GB y permite su ejecución tanto en CPU como en GPU mediante herramientas como llama.cpp u Ollama. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que facilita su integración en productos y servicios.

Este modelo es relevante porque combina un tamaño reducido con capacidades de generación de código, tool calling y razonamiento, cubriendo un nicho intermedio entre modelos de 1B y 7B. Es una opción práctica para desarrolladores que necesitan asistencia de código en entornos con memoria limitada o que prefieren ejecutar modelos localmente por razones de privacidad o coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.397.103.616 (3,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (esta version); el modelo original admite otras cuantizaciones GGUF |
| Idiomas soportados | Ingles y chino (principalmente), con capacidades multilingues limitadas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

Qwen2.5-Coder-3B-Instruct se basa en la arquitectura Transformer estándar de la serie Qwen2.5, con atención de múltiples cabezas y capas de normalización RMSNorm. El modelo base fue entrenado con 5,5 billones de tokens procedentes de código fuente, documentación técnica y texto general, con un énfasis especial en lenguajes de programación populares. La variante instruct se obtuvo mediante ajuste fino supervisado (SFT) y optimización con aprendizaje por refuerzo a partir de feedback humano (RLHF), lo que mejora su capacidad para seguir instrucciones y mantener conversaciones coherentes.

Una característica destacada es su soporte nativo para tool calling y function calling, lo que permite al modelo interactuar con APIs y herramientas externas durante la generación de código. También incorpora un modo de razonamiento que le permite descomponer problemas complejos en pasos intermedios. Aunque no es un modelo MoE, su tamaño compacto de 3,4B parámetros permite una inferencia eficiente en hardware de gama media.

## Capacidades

- Generacion de codigo en multiples lenguajes: Python, Java, C++, JavaScript, TypeScript, Go, Rust, entre otros.
- Completado de codigo y autocompletado en entornos de desarrollo.
- Explicacion y documentacion de fragmentos de codigo.
- Depuracion y correccion de errores, con capacidad para identificar bugs y sugerir parches.
- Soporte de tool calling / function calling, permitiendo al modelo invocar funciones externas definidas por el usuario.
- Razonamiento multi-paso y resolucion de problemas algoritmicos.
- Capacidad de conversacion y seguimiento de instrucciones en lenguaje natural.
- Multilingue limitado: aunque su foco es el codigo, puede procesar texto en varios idiomas, con mejor rendimiento en ingles y chino.

## Casos de uso

- Asistente de codigo en IDE: integrable en editores como VS Code o Neovim mediante plugins que usan llama.cpp u Ollama, proporcionando autocompletado y sugerencias contextuales en tiempo real.
- Automatizacion de tareas de desarrollo: el modelo puede generar scripts, plantillas de proyectos o fragmentos de codigo repetitivo, acelerando el trabajo de los desarrolladores.
- Educacion y formacion en programacion: sirve como tutor virtual que explica conceptos, revisa ejercicios y ofrece ejemplos de codigo comentado, gracias a su capacidad de conversacion.
- Generacion de pruebas unitarias: a partir de una funcion o clase, el modelo puede crear casos de test en frameworks como pytest o JUnit, reduciendo el esfuerzo manual.
- Chatbot tecnico de soporte: con tool calling, puede consultar documentacion, bases de conocimiento o APIs externas para responder preguntas sobre librerias o frameworks.
- Procesamiento de codigo legacy: el modelo puede ayudar a migrar codigo antiguo a versiones modernas, explicar su funcionamiento o refactorizarlo, gracias a su comprension de multiples lenguajes.
- Prototipado rapido: en entornos de investigacion o hackathons, permite generar soluciones iniciales a problemas algoritmicos a partir de una descripcion en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion GGUF en la informacion disponible. El modelo original Qwen2.5-Coder-3B-Instruct cuenta con resultados publicos en el repositorio oficial de Qwen (por ejemplo, en HumanEval, MBPP y otras pruebas de generacion de codigo), pero esos datos no se incluyen en este repositorio. Se recomienda consultar la documentacion del modelo base para obtener metricas comparativas.

## Requisitos de hardware

- VRAM estimada: la cuantizacion Q8_0 de un modelo de 3,4B requiere aproximadamente 3,4 GB de memoria para los pesos, mas overhead para el contexto y las activaciones. En total, se recomienda al menos 6 GB de VRAM para una ejecucion comoda en GPU.
- GPUs compatibles: cualquier GPU con al menos 6 GB de VRAM, como NVIDIA RTX 2060, 3060, 4060, o superiores. Tambien funciona en GPUs de 4 GB con contexto reducido.
- Ejecucion en CPU: viable con 8-16 GB de RAM, aunque la velocidad sera menor. Herramientas como llama.cpp permiten ejecutar el modelo completamente en CPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), LM Studio, y cualquier runtime compatible con GGUF.
- Latencia y throughput: sin datos concretos, pero en una GPU RTX 3060 se puede esperar una generacion de 20-40 tokens por segundo con contexto moderado. En CPU, la velocidad depende del numero de nucleos y la memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct (este) | 3,4B | 32K | Apache 2.0 | GGUF | Codigo + instrucciones |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 license | GGUF, safetensors | Codigo + instrucciones |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | 16K | MIT | GGUF, safetensors | Codigo + instrucciones |
| StarCoder2-3B | 3B | 16K | BigCode OpenRAIL-M | safetensors | Codigo base |

El modelo Qwen2.5-Coder-3B-Instruct destaca por su mayor contexto (32K frente a 16K de sus competidores directos) y por su licencia Apache 2.0, que es mas permisiva que la de CodeLlama (que requiere aceptacion de licencia) o StarCoder2 (OpenRAIL-M, con restricciones de uso). En terminos de rendimiento, los benchmarks publicos del modelo base lo situan por encima de CodeLlama-7B en varias tareas de codigo, con un tamaño inferior. Sin embargo, para tareas muy complejas, modelos de 7B o superiores pueden ofrecer mejor calidad.

## Limitaciones y advertencias

- Alucinacion en codigo: como todo LLM, puede generar codigo incorrecto o con errores logicos, especialmente en funciones complejas o poco comunes. Es imprescindible revisar el codigo generado antes de usarlo en produccion.
- Sesgos y limitaciones de idioma: el modelo esta optimizado para ingles y chino; en otros idiomas la calidad puede degradarse, especialmente en tareas no relacionadas con codigo.
- Contexto limitado: aunque 32K es generoso para un modelo de 3B, tareas que requieran analizar repositorios completos o documentos muy largos pueden exceder la ventana.
- Riesgo de seguridad: el modelo puede generar codigo con vulnerabilidades si no se le indica explicitamente que evite practicas inseguras. No debe usarse como auditor de seguridad sin supervisión humana.
- Dependencia de la cuantizacion: la version Q8_0 mantiene buena fidelidad, pero cuantizaciones mas agresivas (Q4, Q5) pueden degradar el rendimiento en tareas de razonamiento complejo.
- Rendimiento en produccion: para aplicaciones de alto trafico, un modelo de 3B puede quedarse corto en calidad comparado con modelos de 7B o mayores; se recomienda evaluar en el caso de uso concreto.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/ManthanLabs/qwen2.5-coder-3b-instruct-q8_0
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Modelo base (sin instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Pagina en Ollama: https://ollama.com/library/qwen2.5-coder:3b-instruct-q8_0
- Version GGUF en ModelScope: https://www.modelscope.cn/models/ggml-org/Qwen2.5-Coder-3B-Instruct-Q8_0-GGUF/summary
