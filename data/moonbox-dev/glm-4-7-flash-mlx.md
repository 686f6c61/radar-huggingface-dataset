# moonbox-dev/GLM-4.7-Flash-MLX

## Resumen

GLM-4.7-Flash-MLX es una compilación no oficial en formato MLX del modelo GLM-4.7-Flash de Z.ai, preparada por Moonbox para su ejecución nativa en Macs con Apple Silicon. El modelo base es un transformer de mezcla de expertos (MoE) de 30B parámetros totales con 3B activos (30B-A3B), e incluye capacidades de razonamiento con modo "thinking" y llamadas a herramientas (tool calls). Esta compilación se distribuye como un modelo completo de mlx-vlm: pesos, `config.json`, tokenizador de Z.ai, plantilla de chat y ajustes de generación.

El interés de esta ficha reside en que ofrece una vía práctica para ejecutar un MoE de 30B en hardware de consumo Apple (Mac Studio, MacBook Pro con memoria unificada amplia) mediante cuantizaciones de 6 y 8 bits calibradas, con métricas de degradación respecto al modelo original en bf16. No se trata de una publicación oficial de Z.ai y no incluye datos de benchmarks de tareas (MMLU, HumanEval, etc.) en la información disponible.

La licencia MIT del repositorio y del modelo base facilita su uso comercial, aunque conviene verificar las condiciones del modelo original de Z.ai antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia GLM4-MoE-Lite |
| Parametros totales | 30B (según model card: "30B-A3B") |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits y 6 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX, con config.json, tokenizer.json y chat_template.jinja) |

## Arquitectura y entrenamiento

El modelo base GLM-4.7-Flash es un transformer de mezcla de expertos con 30B parámetros totales y 3B activos por token, etiquetado en el repositorio como `glm4_moe_lite`. La model card de esta compilación no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO; esa información correspondería al modelo original de Z.ai y no está incluida en los datos disponibles. Sí se indica que el modelo soporta modo de razonamiento ("thinking") y llamadas a herramientas, lo que sugiere un entrenamiento orientado a agentes y uso conversacional.

La innovación técnica de esta publicación no está en la arquitectura, sino en el proceso de cuantización y su validación: Moonbox reporta métricas de divergencia respecto al modelo original en bf16 para cada build. El build de 8 bits alcanza una KL de 0,019 nats (p95 0,041), una coincidencia top-1 del 93,20 % y una perplejidad de 18,12 frente a 17,99 del original. El build de 6 bits presenta KL de 0,028 nats (p95 0,063), coincidencia top-1 del 92,19 % y perplejidad de 18,19. Estos datos permiten estimar la pérdida de calidad de forma cuantitativa antes de elegir una variante.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" explícito (según la model card del build).
- Llamadas a herramientas (tool calls / function calling).
- Uso en flujos de agentes, según la orientación del modelo base hacia thinking y tool calls.
- Ejecución nativa en Apple Silicon mediante MLX y mlx-vlm.
- Capacidades de visión: el repositorio incluye la etiqueta `mlx-vlm`, aunque la model card no detalla tareas de visión específicas; tratar como no confirmado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local para desarrolladores con Mac: el modelo puede integrarse en editores o terminales mediante mlx-vlm y aprovechar el modo thinking para tareas de refactorización y explicación de código, sin enviar datos a la nube.
- Automatización de agentes con tool calling: al soportar llamadas a herramientas, puede orquestar APIs internas, consultas a bases de datos o scripts locales en un pipeline de agentes ejecutado íntegramente en el Mac del usuario.
- Prototipado de aplicaciones de IA en Apple Silicon: los builds de 6 y 8 bits permiten validar prompts, plantillas de chat y flujos de generación antes de migrar a un despliegue en servidor, con métricas de degradación conocidas.
- Procesamiento de documentos confidenciales: al ejecutarse en local, es adecuado para resumir o extraer información de contratos, informes médicos o material interno que no puede salir de la organización.
- Investigación en eficiencia de cuantización: las métricas KL, top-1 y perplejidad publicadas por build permiten estudiar el compromiso entre tamaño y calidad en modelos MoE sobre hardware Apple.
- Generación de contenido asistida en estación de trabajo: redacción técnica, borradores de documentación y respuestas a preguntas frecuentes, con la ventaja de que el modelo corre en el propio equipo y no depende de cuotas de API.
- Educación y experimentación: útil en entornos docentes donde se quiere enseñar el funcionamiento de un MoE y de la cuantización sin requerir GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento publicados son las métricas de fidelidad de cuantización frente al modelo original en bf16:

| Build | KL (nats) | KL p95 | Coincidencia top-1 | Perplejidad (build vs original) |
|---|---|---|---|---|
| 8 bits | 0,019 | 0,041 | 93,20 % | 18,12 vs 17,99 |
| 6 bits | 0,028 | 0,063 | 92,19 % | 18,19 vs 17,99 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio completo ocupa 75,0 GB, pero cada build es un subconjunto. El build de 8 bits ronda los 27,6 GB en pesos (suma de los shards publicados) y el de 6 bits aproximadamente 27,8 GB; a ello hay que añadir el espacio para el contexto y el runtime de MLX.
- Hardware recomendado: Mac con Apple Silicon y memoria unificada amplia; un Mac Studio con 64 GB o más es el escenario natural para ejecutar el build de 8 bits con contexto holgado. En equipos de 32 GB el margen es muy ajustado y puede requerir el build de 6 bits o menor contexto.
- GPU dedicadas (A100, H100, RTX 4090): no aplican, ya que el formato MLX está pensado para Apple Silicon; para CUDA habría que usar los pesos originales de Z.ai en otro runtime.
- Opciones de despliegue: mlx-vlm (el runtime para el que se empaquetó), y por extensión el ecosistema MLX de Apple. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| GLM-4.7-Flash-MLX (este) | 30B | 3B | no disponible | MIT | MLX / mlx-vlm |
| GLM-4.7-Flash (original, zai-org) | 30B | 3B | no disponible | MIT (según este repo) | safetensors |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- Compilación no oficial: los archivos no son una release de Z.ai; la calidad y el soporte dependen de Moonbox.
- Sin benchmarks de tareas publicados: no hay evidencia en la información disponible sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar.
- Contexto desconocido: la longitud máxima de contexto no se indica, lo que impide planificar cargas de trabajo con documentos largos.
- Idiomas no declarados: no se especifica qué lenguas soporta el modelo base.
- Degradación por cuantización: el build de 6 bits pierde aproximadamente un punto porcentual de coincidencia top-1 frente al de 8 bits; para tareas sensibles conviene validar con prompts propios.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan medidas específicas de mitigación en esta compilación.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia: MIT según el repositorio, pero conviene verificar la licencia efectiva del modelo base de Z.ai antes de un uso comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Dependencia de Apple Silicon: el formato MLX no es portable a GPUs NVIDIA o AMD sin conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/GLM-4.7-Flash-MLX
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Runtime mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper referenciado en los tags (arXiv:2508.06471): https://arxiv.org/abs/2508.06471
