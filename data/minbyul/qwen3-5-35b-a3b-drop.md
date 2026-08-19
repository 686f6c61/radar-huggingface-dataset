# Minbyul/Qwen3.5-35B-A3B-Drop

## Resumen

Qwen3.5-35B-A3B-Drop es un fine-tune de Qwen/Qwen3.5-35B-A3B, un modelo de lenguaje de tipo mixture-of-experts (MoE) con 35 mil millones de parámetros totales y solo 3 mil millones activos por token, desarrollado por Alibaba. Este modelo concreto ha sido creado por Minbyul como parte de un estudio controlado de cuatro brazos que investiga intervenciones en los datos de entrenamiento para mitigar el fenómeno de "over-reflection" (sobre-reflexión) en agentes de búsqueda web. El término "Drop" hace referencia a la intervención aplicada: la eliminación completa de trayectorias de agente que presentan comportamientos patológicos de sobre-reflexión, clasificados según una taxonomía A-G.

El modelo se presenta como un artefacto de investigación, no como un asistente generalista. Está entrenado mediante supervisión fina de parámetros completos sobre un corpus propio de trayectorias de agentes de navegación web multi-turno, con intercalado de llamadas a herramientas y resultados. Su relevancia radica en que permite estudiar cómo la eliminación de demostraciones patológicas (frente a editarlas quirúrgicamente o filtrarlas por resultado) afecta al comportamiento de parada, la eficiencia de búsqueda y la calidad del razonamiento en agentes con uso de herramientas. La arquitectura, el tokenizador y la plantilla de chat/llamada de herramientas son idénticos al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE decoder-only transformer con gated delta networks (256 expertos) |
| Parametros totales | ~35 mil millones |
| Parametros activos | ~3 mil millones por token |
| Longitud de contexto | 131.072 tokens (contexto de entrenamiento); el modelo base soporta hasta 256K |
| Tipos de cuantizacion | no disponible para este fine-tune; el modelo base dispone de versiones GGUF, MLX y otras |
| Idiomas soportados | ingles (entrenado principalmente para trazas de razonamiento en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (13 shards, ~65 GB en bf16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B emplea una arquitectura MoE con 256 expertos y activa solo 3 mil millones de parámetros por token, lo que lo hace extremadamente eficiente en cómputo. Utiliza "gated delta networks", una innovación de la familia Qwen3.5 que mejora la eficiencia de atención y el balanceo de carga entre expertos. El fine-tune Drop conserva intacta esta arquitectura.

El entrenamiento consistió en una supervisión fina de parámetros completos sobre un corpus propio de trayectorias de agentes de búsqueda web, con secuencias de hasta 131.072 tokens que incluyen llamadas a herramientas (búsqueda web, apertura de páginas, búsqueda en página) y resultados intercalados. El objetivo era la imitación de trayectorias mediante entropía cruzada a nivel de token en los turnos del asistente. La intervención "Drop" eliminó por completo las trayectorias etiquetadas con tipos patológicos de sobre-reflexión según la taxonomía A-G (por ejemplo, bucles de verificación post-respuesta, re-búsquedas redundantes o razonamiento sin respaldo en el contenido recuperado). Este es el brazo más agresivo del estudio, ya que reduce el tamaño efectivo del conjunto de entrenamiento en aras de la limpieza de los datos, en contraste con los brazos Repair (edición quirúrgica) y Correct (filtrado por resultado).

## Capacidades

- Generacion de texto con razonamiento explicito en el dominio de agentes de navegacion web.
- Soporte de tool calling para un superficie de herramientas compatible con busqueda web, apertura de paginas y busqueda en pagina.
- Manejo de conversaciones multi-turno con contexto largo (hasta 131.072 tokens), incluyendo intercalado de llamadas a herramientas y resultados.
- Capacidad de agente: ejecuta secuencias de busqueda, analiza resultados y decide cuando detenerse.
- Razonamiento paso a paso en trazas de navegacion, con potencial reduccion de comportamientos de sobre-reflexion gracias a la intervencion de datos.
- No es un asistente generalista; sus capacidades estan orientadas al dominio de agentes de busqueda web.

## Casos de uso

- Investigacion academica sobre over-reflection en agentes: permite comparar el efecto de eliminar trayectorias patologicas frente a editarlas o filtrarlas por resultado, en el marco del estudio de cuatro brazos.
- Desarrollo de agentes de busqueda web mas eficientes: al reducir la sobre-reflexion, el modelo puede servir como base para sistemas que deciden detenerse antes, ahorrando llamadas a herramientas y tiempo de respuesta.
- Benchmarking de intervenciones de datos: util para equipos que disenan pipelines de curado de datos de entrenamiento y necesitan medir el impacto de la eliminacion completa de ejemplos problematicos.
- Evaluacion de robustez en agentes con herramientas: permite probar si la eliminacion de trayectorias patologicas introduce sesgos o perdida de capacidad en escenarios de busqueda complejos.
- Estudio de trade-offs entre cantidad y calidad de datos: el modelo sirve como caso de estudio para entender como la reduccion del corpus afecta al rendimiento general.
- Entrenamiento de agentes especializados en navegacion web: puede usarse como punto de partida para fine-tunes adicionales en dominios verticales (investigacion de mercado, analisis de documentos web, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas comparativas (MMLU, HumanEval, GSM8K, etc.) para este fine-tune especifico. El modelo base Qwen3.5-35B-A3B ha demostrado rendimiento superior a modelos con mas de seis veces su tamano activo, segun fuentes de Alibaba, pero no hay datos publicos para este brazo Drop.

## Requisitos de hardware

- Los pesos completos en bf16 ocupan aproximadamente 65 GB, por lo que se requiere una GPU con al menos 80 GB de VRAM (A100, H100) para inferencia sin cuantizacion.
- Al ser un MoE con solo 3 mil millones de parametros activos, es posible ejecutarlo en GPUs de consumo (RTX 4090 con 24 GB) si se aplica cuantizacion (por ejemplo, 4 bits), aunque no se proporcionan versiones cuantizadas oficiales para este fine-tune.
- Para despliegue en produccion, se recomienda usar vLLM o TGI, que soportan MoE y cuantizacion. Tambien es compatible con llama.cpp y Ollama mediante conversion a GGUF.
- La latencia estimada depende del hardware y la cuantizacion; con 3B activos, el throughput deberia ser varias veces superior al de un modelo denso de 35B, pero no hay datos concretos publicados.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-Drop (este) | 35B | 3B | 131K (entrenamiento) | Apache 2.0 | Agente de busqueda web con eliminacion de trayectorias patologicas |
| Qwen3.5-35B-A3B (base) | 35B | 3B | 256K | Apache 2.0 | Modelo general con razonamiento y vision |
| Qwen3.5-35B-A3B-Asis (brazo hermano) | 35B | 3B | 131K | Apache 2.0 | Agente de busqueda web sin intervencion (baseline) |
| Qwen3.5-35B-A3B-Repair (brazo hermano) | 35B | 3B | 131K | Apache 2.0 | Agente con edicion quirurgica de trayectorias |
| Qwen3.5-35B-A3B-Correct (brazo hermano) | 35B | 3B | 131K | Apache 2.0 | Agente con filtrado por resultado correcto |

La comparativa directa con modelos externos no esta disponible, ya que este fine-tune es un artefacto de investigacion sin benchmarks publicados. Los brazos hermanos del mismo estudio son las alternativas mas relevantes para comparar el efecto de la intervencion.

## Limitaciones y advertencias

- Comportamiento orientado exclusivamente al dominio de agentes de busqueda web; no es un asistente generalista y puede fallar en tareas fuera de ese ambito.
- La eliminacion de trayectorias reduce el conjunto de entrenamiento efectivo, lo que puede provocar perdida de capacidad en ciertos escenarios (confunde calidad con cantidad de datos, como se reconoce en el propio estudio).
- No se aplico ningun alignment de seguridad adicional mas alla del proporcionado por el modelo base, por lo que puede generar contenido no deseado en contextos no cubiertos por el entrenamiento.
- Entrenado principalmente en ingles; el rendimiento en otros idiomas es limitado o nulo.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo donde la sobre-reflexion podria manifestarse de otras formas.
- No se proporcionan garantias de soporte para produccion; es un artefacto de investigacion.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Drop)
- [Modelo base Qwen/Qwen3.5-35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
- [Brazo Asis (baseline)](https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Asis)
- [Brazo Repair](https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Repair)
- [Brazo Correct](https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Correct)
- [Guia de la serie Qwen3.5 2026](https://lovableapp.org/blog/2026-qwen35-models-guide)
- [Ficha del modelo base en NeuralWire](https://neural-wire.com/modeldex/qwen-3-5-35b-a3b)
- [Receta vLLM para Qwen3.5-35B-A3B](https://recipes.vllm.ai/Qwen/Qwen3.5-35B-A3B)
- [Version cuantizada MLX del modelo base](https://huggingface.co/baa-ai/Qwen3.5-35B-A3B-MINT-MLX-30GB)
