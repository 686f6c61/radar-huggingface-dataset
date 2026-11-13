# darcyyao/qwen3-1.7b-planner-smoke-sft-GGUF

## Resumen

`darcyyao/qwen3-1.7b-planner-smoke-sft-GGUF` es una version cuantizada en formato GGUF de un ajuste fino (SFT) sobre el modelo base Qwen3-1.7B, publicado por el usuario darcyyao. El nombre del repositorio sugiere que el ajuste se ha orientado a tareas de planificacion ("planner"), y el termino "smoke" apunta a que se trata de una prueba de humo o prototipo inicial mas que de un modelo de produccion. El modelo esta pensado para su uso con llama.cpp y Ollama, y se ha generado con la herramienta Unsloth.

El modelo conserva la arquitectura transformer densa del Qwen3-1.7B original, con aproximadamente 1.720 millones de parametros. Se distribuye unicamente en cuantizaciones GGUF (Q4_K_M y Q8_0), lo que lo hace desplegable en hardware modesto, incluso en CPU o GPUs de consumo. El repositorio ocupa 2,9 GB.

La relevancia de esta ficha es limitada: se trata de un artefacto experimental sin descargas ni validacion publica, sin licencia declarada y sin resultados de benchmarks. Resulta util como ejemplo de flujo de trabajo (ajuste fino con Unsloth y conversion a GGUF), pero no como modelo recomendado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B); no se detalla en la model card |
| Parametros totales | 1.720.574.976 (1,72 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); se incluye Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3. La model card no aporta detalles sobre la arquitectura interna (numero de capas, dimensiones ocultas, mecanismo de atencion) ni sobre el proceso de entrenamiento del ajuste fino: no se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

Lo unico documentado es el procedimiento de ajuste fino y conversion: se ha utilizado Unsloth, una libreria que acelera el entrenamiento y la conversion a GGUF. El sufijo "planner-smoke-sft" indica que se trata de un SFT orientado a planificacion y de caracter preliminar. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Razonamiento y planificacion de tareas, presumiblemente reforzados por el ajuste fino SFT (segun el nombre del repositorio; no verificado).
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp.
- Compatibilidad con el ecosistema llama.cpp y Ollama.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Pruebas de humo de pipelines de planificacion: el modelo sirve para validar rapidamente un flujo de generacion de planes en local antes de invertir en un modelo mayor, gracias a su tamano reducido y a su formato GGUF.
- Prototipado en CPU o portatiles: con la cuantizacion Q4_K_M puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Evaluacion de flujos de ajuste fino: util como referencia para reproducir el pipeline Unsloth (SFT + conversion a GGUF) en otros modelos.
- Asistente conversacional ligero en entornos con recursos limitados, usando el Modelfile incluido para desplegar en Ollama.
- Experimentacion academica con modelos pequenos de planificacion, comparando el efecto del SFT frente al Qwen3-1.7B base.
- Integracion en entornos de desarrollo para tareas de generacion de texto de baja complejidad donde el coste de inferencia sea prioritario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB para Q4_K_M y 2,0 GB para Q8_0 (estimacion a partir del tamano de los pesos; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de gama media o superior.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido) y, por compatibilidad GGUF, otras herramientas del ecosistema llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darcyyao/qwen3-1.7b-planner-smoke-sft-GGUF | 1,72 B | no disponible | GGUF | no disponible | Hugging Face (0 descargas) |
| Qwen3-1.7B (base) | 1,72 B | no disponible | safetensors, GGUF | no disponible | Hugging Face (oficial) |
| Otros ajustes SFT de Qwen3-1.7B | ~1,72 B | no disponible | GGUF, safetensors | variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo experimental ("smoke"): no hay evidencia de validacion, benchmarks ni uso en produccion.
- Sin licencia declarada: no se puede confirmar el uso comercial; conviene consultar la licencia del Qwen3-1.7B base antes de cualquier despliegue.
- Sin descargas ni likes: no existe retroalimentacion de la comunidad que permita evaluar su calidad.
- Riesgo de alucinacion inherente a un modelo de 1,7 B de parametros, especialmente en tareas de planificacion compleja.
- Idiomas y cobertura multilingue no documentados.
- Longitud de contexto no especificada; puede diferir del modelo base.
- Solo se distribuyen dos cuantizaciones; no hay versiones en safetensors ni otros formatos.
- Posibles sesgos heredados del dataset de ajuste fino, que no se describe.

## Enlaces

- Hugging Face: https://huggingface.co/darcyyao/qwen3-1.7b-planner-smoke-sft-GGUF
- Unsloth (herramienta de ajuste y conversion): https://github.com/unslothai/unsloth
