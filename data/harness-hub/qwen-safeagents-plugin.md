# harness-hub/qwen-safeagents-plugin

## Resumen

`harness-hub/qwen-safeagents-plugin` no es un modelo de lenguaje, sino un plugin de entrenamiento publicado en Hugging Face bajo el formato de repositorio de modelos. Lo desarrolla el usuario `harness-hub` y su función es adaptar el framework [safeagents](https://github.com/huggingface/safeagents) para entrenar adaptadores LoRA sobre Qwen3.8-27B mediante aprendizaje por refuerzo (RL) dentro de *harnesses* de agentes como pi, hermes u opencode, ejecutando tareas de Harbor.

Técnicamente se trata de un *task pack* para [atif-scan](https://github.com/huggingface/atif-scan): conserva todas las comprobaciones de seguridad integradas y añade dos excepciones acotadas. La primera permite generar un script de test para el fichero `/solution` que solicita una tarea, siempre que la propia tarea nombre `/solution/` y la llamada no toque nada bajo `/tests/` ni `/logs/verifier/`. La segunda autoriza un *exception hook* de depuración, salvo que este, o un *exit hook*, fuercen un código de salida 0.

Su relevancia es operativa: facilita pipelines de *agentic RL* sobre tareas de Harbor sin desactivar el resto de barreras de seguridad, y se distribuye con licencia Apache 2.0. No contiene pesos, tokenizador ni configuración de inferencia; su contenido es código Python (`atif_harbor.py`) que se ejecuta dentro del proceso de safeagents.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un plugin de código Python para safeagents/atif-scan) |
| Parámetros totales | no disponible (no aplica; el modelo objetivo del entrenamiento es Qwen3.8-27B con adaptadores LoRA) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de código; fichero principal `atif_harbor.py`) |

## Arquitectura y entrenamiento

El repositorio no implementa una arquitectura de red neuronal. Es un plugin que se carga en el proceso de safeagents mediante la directiva `--plugin hf://harness-hub/qwen-safeagents-plugin` y que extiende las comprobaciones de atif-scan, el sistema que inspecciona las acciones de los agentes durante la ejecución de tareas. El objetivo declarado es entrenar adaptadores LoRA sobre Qwen3.8-27B con RL dentro de *harnesses* de agentes (pi, hermes, opencode) sobre tareas de Harbor.

La innovación técnica consiste en un conjunto de excepciones mínimas y auditables sobre las reglas integradas: permitir un script de test para `/solution` cuando la tarea lo nombra explícitamente y la llamada no accede a rutas de tests o de verificación, y permitir un *exception hook* de depuración salvo que altere el código de salida. El resto de bloqueos de safeagents y atif-scan se mantiene. No se documentan en la información disponible el volumen de tokens, la composición del dataset de entrenamiento ni si se aplicaron RLHF o DPO.

## Capacidades

- Entrenamiento por refuerzo de adaptadores LoRA sobre Qwen3.8-27B en entornos de agentes.
- Integración con *harnesses* de agentes pi, hermes y opencode.
- Ejecución de tareas de Harbor dentro del pipeline de safeagents.
- Aplicación de comprobaciones de seguridad de atif-scan con dos excepciones acotadas y documentadas.
- Fijación de commits para reproducibilidad mediante `--plugin hf://harness-hub/qwen-safeagents-plugin@<commit>`.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades multilingües ni modo de pensamiento: esas capacidades corresponderían al modelo subyacente Qwen3.8-27B, no a este repositorio.

## Casos de uso

- Entrenamiento de agentes con RL: usar el plugin como capa de configuración de safeagents para lanzar episodios de RL sobre tareas de Harbor y recoger recompensas sin desactivar las comprobaciones de seguridad.
- Depuración de trayectorias de agente: habilitar el *exception hook* permitido para inspeccionar fallos en tiempo de ejecución, sabiendo que cualquier hook que fuerce un código de salida 0 sigue bloqueado.
- Validación de soluciones en tareas de tipo `/solution`: permitir que el agente genere un script de test para el fichero solicitado cuando la tarea lo nombra, manteniendo el aislamiento respecto a `/tests/` y `/logs/verifier/`.
- Reproducibilidad de experimentos: fijar un commit concreto del plugin para que las ejecuciones de entrenamiento sean idénticas entre máquinas y sesiones.
- Integración en pipelines de CI de investigación: cargar el plugin desde Hugging Face en un servicio safeagents escuchando en `http://localhost:8000` para estandarizar el entorno de evaluación de agentes.
- Auditoría de políticas de seguridad: revisar `atif_harbor.py` para verificar qué comprobaciones se relajan y cuáles se mantienen antes de adoptar el plugin en un equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos).
- GPU recomendadas: no disponibles para el plugin; para el modelo objetivo Qwen3.8-27B no se especifican en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el plugin se ejecuta dentro del proceso de safeagents mediante `safeagents start http://localhost:8000 --plugin hf://harness-hub/qwen-safeagents-plugin`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | Modelo objetivo | Licencia | Contexto | Pesos incluidos |
|---|---|---|---|---|---|
| harness-hub/qwen-safeagents-plugin | Plugin de entrenamiento RL (task pack atif-scan) | Qwen3.8-27B con LoRA | Apache 2.0 | no disponible | No |
| safeagents (huggingface/safeagents) | Framework de ejecución de agentes | Genérico | no disponible | no disponible | No |
| atif-scan (huggingface/atif-scan) | Sistema de comprobaciones de seguridad | Genérico | no disponible | no disponible | No |

No se dispone de información sobre otros plugins equivalentes de entrenamiento de agentes con los que comparar parámetros, rendimiento o disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse para inferencia directa; confundirlo con un modelo Qwen llevaría a errores de despliegue.
- El fichero se ejecuta como código dentro del proceso de safeagents, por lo que introduce riesgo de ejecución arbitraria si no se audita el contenido antes de cargarlo.
- Las excepciones a las comprobaciones de seguridad, aunque acotadas, amplían la superficie de acciones permitidas al agente; conviene revisar `atif_harbor.py` y fijar un commit concreto.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validación comunitaria.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque el repositorio no contiene un modelo generativo.
- La licencia Apache 2.0 permite uso comercial del plugin, pero no cubre los pesos de Qwen3.8-27B ni los componentes de safeagents o atif-scan, cuyas condiciones deben verificarse por separado.
- El repositorio se creó y actualizó el 2026-11-15 con apenas dos segundos de diferencia, lo que sugiere un estado inicial y sin mantenimiento comprobado.

## Enlaces

- [Hugging Face: harness-hub/qwen-safeagents-plugin](https://huggingface.co/harness-hub/qwen-safeagents-plugin)
- [safeagents (GitHub)](https://github.com/huggingface/safeagents)
- [atif-scan (GitHub)](https://github.com/huggingface/atif-scan)
