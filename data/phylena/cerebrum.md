# phylena/cerebrum

## Resumen

Cerebrum es un repositorio de configuración publicado por el usuario phylena bajo el identificador `phylena/cerebrum`. No contiene pesos de modelo: es un conjunto de instrucciones de sistema (`system.md`), definiciones de modos adicionales (code, tutor, creative, translate, fast, research, haiti) y la configuración asociada a una supuesta plataforma de IA con memoria por usuario, grafo de conocimiento y herramientas de agente. El repositorio declara dos modelos base que se utilizan sin modificar: `openai/gpt-oss-20b` en despliegue de producción sobre GPU y `Qwen/Qwen2.5-1.5B-Instruct` en cuantización GGUF Q4_K_M para CPU o Hugging Face Spaces.

El autor indica explícitamente que no se ha realizado ningún ajuste fino (fine-tuning) hasta la fecha y que no se reclaman resultados de benchmarks. Por tanto, no se trata de un modelo entrenado ni evaluado, sino de una capa de prompting y orquestación sobre modelos de terceros. La relevancia técnica es limitada: el interés se centra en el diseño del system prompt y en la arquitectura de agentes propuesta, no en capacidades de modelo nuevas.

Cualquier evaluación de rendimiento, contexto o capacidades debe remitirse a los modelos base subyacentes, cuyas fichas y benchmarks son los que realmente aplican. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de configuración sin pesos); los modelos base son transformers densos |
| Parametros totales | No disponible para Cerebrum; el base de producción `openai/gpt-oss-20b` tiene 20B (según su denominación) y el base de CPU `Qwen/Qwen2.5-1.5B-Instruct` tiene 1,5B |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible para Cerebrum; depende del modelo base (no especificado en la información proporcionada) |
| Tipos de cuantizacion | GGUF Q4_K_M para el despliegue en CPU (según la model card); no se detallan otras |
| Idiomas soportados | No disponibles |
| Licencia | `other` (no se detalla el texto de la licencia) |
| Formato de pesos | No contiene pesos; los modelos base se referencian como `openai/gpt-oss-20b` y `Qwen/Qwen2.5-1.5B-Instruct` (GGUF Q4_K_M para CPU) |

## Arquitectura y entrenamiento

Cerebrum no implementa una arquitectura de modelo propia. Se describe como una configuración compuesta por un system prompt (`system.md`), modos con instrucciones adicionales, memoria por usuario, un grafo de conocimiento y herramientas de agente (código en sandbox, investigación web y de literatura, herramientas MCP). Todo ello se ejecuta sobre un modelo base open-weight que, según el autor, se emplea sin cambios.

No se ha realizado fine-tuning. El autor indica que, cuando su pipeline `Cerebrum.training` exporte un ajuste fino, este se publicará en un repositorio propio con una model card que nombre los conjuntos de datos y solo las evaluaciones que realmente se hayan ejecutado. No se especifican tokens de entrenamiento, composición del dataset, ni técnicas de RLHF/DPO, porque no existe entrenamiento asociado a este repositorio.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base activo (`openai/gpt-oss-20b` o `Qwen/Qwen2.5-1.5B-Instruct`), no del repositorio Cerebrum.
- Modos de operación predefinidos: code, tutor, creative, translate, fast, research y haiti, cada uno con instrucciones adicionales en `modes/`.
- Memoria por usuario y grafo de conocimiento: descritos como componentes de la plataforma, sin detalles técnicos de implementación.
- Herramientas de agente: ejecución de código en sandbox, investigación web y de literatura, e integración con herramientas MCP.
- Soporte de tool calling y function calling: no se detalla explícitamente; depende de las capacidades del modelo base.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistente de código en sandbox: el modo `code` y la herramienta de ejecución en sandbox permitirían probar fragmentos generados antes de devolverlos al usuario, reduciendo errores en tareas de programación.
- Tutoría guiada: el modo `tutor` con memoria por usuario permitiría adaptar explicaciones al historial del estudiante y mantener continuidad entre sesiones.
- Investigación bibliográfica asistida: el modo `research` junto con las herramientas de búsqueda web y de literatura serviría para localizar y resumir fuentes, con el grafo de conocimiento como almacén de relaciones entre entidades.
- Traducción con contexto de usuario: el modo `translate` podría aprovechar la memoria por usuario para mantener terminología y estilo consistentes en encargos recurrentes.
- Despliegue ligero en CPU o Spaces: con `Qwen/Qwen2.5-1.5B-Instruct` en GGUF Q4_K_M y el `Modelfile.cpu`, permitiría prototipos de bajo coste en entornos sin GPU.
- Integración con herramientas MCP: la plataforma podría conectarse a servidores MCP para ampliar acciones disponibles (consulta de APIs, acceso a datos) en flujos de agente multi-paso.
- Escritura creativa con modo dedicado: el modo `creative` con instrucciones específicas serviría para generar borradores con un tono controlado, apoyado en la memoria de preferencias del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no reclama ningún resultado de benchmark para Cerebrum.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para Cerebrum; depende del modelo base. Para `openai/gpt-oss-20b` se requeriría hardware de GPU de gama alta o servidor (el autor menciona Ollama o vLLM), sin cifras concretas en la información proporcionada.
- GPU recomendadas: no especificadas en la información proporcionada.
- Cabe en GPU de consumo: el despliegue en CPU con `Qwen/Qwen2.5-1.5B-Instruct` GGUF Q4_K_M está previsto para entornos sin GPU (CPU o Hugging Face Space); no se confirma compatibilidad con GPU de consumo para el base de producción.
- Opciones de despliegue: Ollama y vLLM para producción en GPU; `Modelfile.cpu` para CPU/Spaces.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Cerebrum no es un modelo entrenado, por lo que no existe una comparativa directa de parámetros o rendimiento. La comparación pertinente sería entre los modelos base referenciados, pero la información proporcionada no incluye sus especificaciones ni métricas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cerebrum (`phylena/cerebrum`) | No aplica (configuración) | No disponible | `other` | Repositorio HF, 0 descargas |
| `openai/gpt-oss-20b` (base de producción) | 20B (según denominación) | No disponible | Apache-2.0 (según la model card) | Hugging Face |
| `Qwen/Qwen2.5-1.5B-Instruct` (base de CPU) | 1,5B | No disponible | Apache-2.0 (según la model card) | Hugging Face |

## Limitaciones y advertencias

- No contiene pesos: no puede desplegarse por sí mismo; requiere descargar y ejecutar uno de los modelos base.
- Sin fine-tuning ni evaluaciones: no hay evidencia publicada de calidad, seguridad o rendimiento del sistema de prompting.
- Licencia `other` sin texto detallado: no se aclaran las condiciones de uso comercial del repositorio, aunque los modelos base se declaran Apache-2.0 en la model card.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe más allá de lo que ofrezcan los modelos base.
- Riesgo de alucinación: inherente a los modelos base; las herramientas de investigación y el grafo de conocimiento no eliminan ese riesgo por sí solos.
- Sesgos: no documentados en la información proporcionada.
- Dependencia de la plataforma: memoria por usuario, grafo de conocimiento y herramientas MCP forman parte de una plataforma descrita de forma superficial; su disponibilidad y comportamiento en producción no están verificados.
- Repositorio sin tracción: 0 descargas y 0 likes, creado y actualizado en la misma fecha, lo que limita la validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/phylena/cerebrum
- Modelo base de producción: https://huggingface.co/openai/gpt-oss-20b
- Modelo base de CPU: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Código: GitHub `CerveauAnalytique/Cerebrum.model` (referenciado en la model card; URL completa no disponible en la información proporcionada)
