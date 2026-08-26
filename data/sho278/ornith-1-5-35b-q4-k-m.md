# Sho278/ornith-1.5-35b-q4-k-m

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de razonamiento desarrollado por Ornith AI, diseñado para tareas de codificacion agéntica y razonamiento multi-paso. Su arquitectura es de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. El modelo incorpora un mecanismo de "self-scaffolding" y "self-improvement" que le permite proponer nuevas tareas, generar andamiajes específicos y producir rollouts para aprendizaje por refuerzo, mejorando continuamente sus capacidades.

La versión cuantizada `Sho278/ornith-1.5-35b-q4-k-m` es una adaptación en formato GGUF con cuantización Q4_K_M, pensada para facilitar el despliegue en entornos con recursos limitados. Aunque la model card original es extremadamente escasa, la información pública del proyecto indica que el modelo está orientado a agentes de codificación, con soporte para tool calling y razonamiento explícito. Su licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) |
| Parametros totales | 35 mil millones |
| Parametros activos | 3 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (esta version) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (inferido por el nombre del repositorio) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE con 35B parámetros totales y 3B activos, similar a otros modelos de razonamiento como DeepSeek-R1 o Qwen-2.5-32B. La innovación principal reside en su framework de "self-scaffolding": el modelo genera sus propios andamiajes de tareas, propone nuevas tareas y produce soluciones que se utilizan para entrenamiento por refuerzo, cerrando un bucle de auto-mejora. Este enfoque se describe en el blog oficial como una extensión de Ornith-1.0, donde el modelo no solo responde, sino que también crea sus propios datos de entrenamiento.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación específicas (RLHF, DPO, etc.). La versión cuantizada Q4_K_M reduce la precisión de los pesos a 4 bits, lo que disminuye los requisitos de memoria a costa de una ligera pérdida de calidad, aunque en modelos MoE esta pérdida suele ser mínima.

## Capacidades

- Razonamiento multi-paso: el modelo abre su turno con un bloque de "thinking" antes de la respuesta final, lo que permite desglosar problemas complejos.
- Generación de código: orientado a tareas de programación, con soporte para tool calling y agentes.
- Tool calling: puede invocar funciones externas mediante bloques `<tool_call>` que se pueden parsear a formato OpenAI.
- Auto-mejora: capacidad de proponer nuevas tareas y generar datos de entrenamiento sintéticos.
- Multilingüe: no confirmado, aunque por su naturaleza probablemente soporte varios idiomas.
- Modo razonamiento explícito: el chain-of-thought se puede extraer en un campo separado (`reasoning_content`).

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code para autocompletar código, explicar fragmentos y sugerir refactorizaciones, aprovechando su capacidad de razonamiento y generación de código.
- Agente autónomo de resolución de issues: dado un repositorio y un issue, el modelo puede analizar el código, proponer un plan y generar un parche, gracias a su soporte de tool calling y razonamiento multi-paso.
- Generación de documentación técnica: puede leer código fuente y producir documentación detallada, incluyendo ejemplos de uso y advertencias, con un contexto largo (aunque no se especifica la longitud exacta).
- Chatbot de soporte técnico: al ser un modelo de razonamiento, puede manejar consultas complejas de usuarios, desglosando problemas y ofreciendo soluciones paso a paso.
- Automatización de pipelines de CI/CD: con tool calling, puede interactuar con APIs de sistemas de integración continua para diagnosticar fallos, sugerir correcciones y ejecutar pruebas.
- Investigación en IA: su framework de self-improvement lo hace útil para experimentos de generación de datos sintéticos y aprendizaje por refuerzo, aunque requiere infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La web ornith.online menciona que existen benchmarks, pero no se proporcionan cifras concretas en los resultados de búsqueda. Se recomienda consultar el sitio oficial para obtener datos actualizados.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo requiere aproximadamente 17-20 GB de VRAM (35B × 4 bits ≈ 17.5 GB, más overhead). Esto cabe en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- GPUs recomendadas: RTX 4090, RTX 3090, A100 (40 GB), H100 (80 GB) para mayor margen.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, y servidores como vLLM (con adaptador GGUF) o TGI.
- Latencia y throughput: no disponibles, pero al ser MoE con solo 3B activos, la inferencia es más rápida que un modelo denso de 35B, con un throughput estimado de 20-40 tokens/s en una RTX 4090 (dependiendo de la implementación).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35B | 3B | no disponible | MIT | Razonamiento + código |
| Mixtral 8x7B | 46.7B | 12.9B | 32k | Apache 2.0 | MoE generalista |
| Qwen 2.5 32B | 32B | 32B (denso) | 128k | Apache 2.0 | Generalista + código |
| DeepSeek-R1-Distill-Qwen-32B | 32B | 32B | 128k | MIT | Razonamiento |

Ornith-1.5 se distingue por su framework de auto-mejora y su orientación específica a agentes de codificación, mientras que Mixtral y Qwen son más generalistas. Su licencia MIT es más permisiva que Apache 2.0 en algunos aspectos (no requiere atribución en ciertos casos), aunque ambas permiten uso comercial.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones específicas del modelo, pero al ser un modelo de razonamiento, puede generar cadenas de pensamiento incorrectas si el problema es ambiguo.
- La longitud de contexto no está documentada; se recomienda verificar antes de usarlo en tareas que requieran ventanas largas.
- La cuantización Q4_K_M puede degradar ligeramente la calidad en tareas de razonamiento complejo comparado con la versión completa.
- El modelo está optimizado para código y razonamiento; su rendimiento en tareas generales de lenguaje puede ser inferior a modelos densos de tamaño similar.
- Aunque la licencia MIT permite uso comercial, el modelo base no tiene garantías de seguridad o imparcialidad; se recomienda evaluar en el dominio de aplicación.

## Enlaces

- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Versión abliterada: https://huggingface.co/alztrk/Ornith-1.5-35B-A3B-Abliterated
- Blog oficial: https://ornith.ai/ornith_1_5.html
- Guía de uso y benchmarks: https://ornith.online/
- Imagen Docker: https://hub.docker.com/r/ai/ornith-1.5
- Repositorio cuantizado: https://huggingface.co/Sho278/ornith-1.5-35b-q4-k-m
