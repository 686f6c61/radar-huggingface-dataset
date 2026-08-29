# reachjalil/nottyduck-policies

## Resumen

NottyDuck policies es un repositorio de políticas de control motor (motor-policies) para el robot de escritorio NottyDuck, un coach de redes sociales basado en la plataforma open-source MicroDuck de Pollen Robotics. El autor, Jalil Laaraichi (reachjalil), ingeniero senior en San Francisco, publica aquí artefactos ONNX listos para despliegue, exportados mediante un script específico (`scripts/export.py`) que garantiza compatibilidad con el runtime de MicroDuck. El repositorio se presenta como un catálogo curado de políticas, donde cada versión se promueve solo tras ensayos en simulador y una evaluación documentada.

En el momento de la consulta, el repositorio no contiene ningún artefacto publicado: la model card indica explícitamente que no se publica ninguna política en el scaffold inicial y que se debe comenzar con la ejecución de prueba `desk-peck` documentada en el repositorio fuente. Esto significa que no hay pesos disponibles para descargar ni datos de rendimiento. El modelo no es un LLM ni un sistema de visión; es un controlador neuronal de políticas para acciones robóticas, con un contrato de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, diseñado para operar en el entorno de simulación MuJoCo y en el hardware MicroDuck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se especifica; probablemente red neuronal feedforward o similar para control, pero no se documenta) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (formato ONNX, sin información sobre cuantización) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos `policy.onnx` en rutas `policies/<gesture>/<version>/`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de las políticas. Se sabe que son modelos exportados a ONNX desde checkpoints de entrenamiento almacenados en repositorios privados por ejecución. El proceso de promoción de una política incluye ensayos en simulador (probablemente MuJoCo, dado el tag `mujoco`) y una evaluación documentada antes de publicarse en este repositorio. La exportación debe realizarse mediante el script `scripts/export.py` del repositorio fuente; los checkpoints convertidos manualmente pueden omitir el normalizador de observaciones y no son aptos para despliegue. No se mencionan técnicas específicas como RLHF, DPO, ni detalles del dataset de entrenamiento.

## Capacidades

- Control de políticas para robótica de escritorio: genera acciones de 14 dimensiones a partir de observaciones de 61 dimensiones.
- Compatibilidad con el runtime MicroDuck de Pollen Robotics, lo que permite su ejecución en el robot físico NottyDuck.
- Integración con el entorno de simulación MuJoCo para ensayos y evaluación.
- Formato ONNX estandarizado, lo que facilita su despliegue con librerías como `onnxruntime`.
- No es un modelo de lenguaje: no genera texto, no tiene capacidades de conversación, tool calling ni razonamiento simbólico.

## Casos de uso

- Control de gestos para robot de escritorio: el ejemplo `desk-peck` (picotear en el escritorio) es el caso de uso inicial documentado; se puede usar para implementar comportamientos de interacción social en un robot de sobremesa.
- Investigación en aprendizaje por refuerzo para manipulación: dado que las políticas se entrenan y evalúan en MuJoCo, sirven como punto de partida para experimentos de RL en entornos de contacto físico.
- Desarrollo de productos de robótica asistencial: NottyDuck actúa como coach de redes sociales, por lo que estas políticas podrían integrarse en un sistema que requiera movimientos expresivos del robot.
- Benchmarking de políticas de control: al ser un repositorio curado con versiones y evaluaciones documentadas, puede usarse como referencia para comparar políticas entre sí.
- Integración en pipelines de despliegue robótico: el formato ONNX y el contrato fijo de observación/acción permiten empaquetar las políticas en aplicaciones de producción con `onnxruntime`.
- Formación y demostración educativa: el repositorio sirve como ejemplo de cómo estructurar un proyecto de políticas robóticas con control de versiones y criterios de promoción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de rendimiento, latencia, ni comparaciones con otros modelos. La model card solo menciona que las políticas se someten a "ensayos en simulador y una evaluación documentada", pero no se proporcionan los resultados de dichas evaluaciones.

## Requisitos de hardware

- No se dispone de datos sobre VRAM, GPU o CPU necesarias para ejecutar las políticas.
- Dado que son modelos ONNX de control robótico, es probable que sean ligeros y ejecutables en CPU o en una GPU integrada, pero no hay confirmación oficial.
- El despliegue se realiza mediante `onnxruntime` (librería indicada en HuggingFace), que soporta CPU, GPU y plataformas embebidas.
- No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no aplican a modelos de control robótico.
- Para el entorno de simulación MuJoCo se requiere una máquina con capacidades de cálculo estándar, pero sin especificaciones concretas.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. Este repositorio no presenta métricas ni características que permitan una comparación con otras políticas de control robótico, y no se dispone de referencias a alternativas.

## Limitaciones y advertencias

- El repositorio está vacío: no hay ningún artefacto de política publicado en el scaffold inicial. Cualquier uso requiere ejecutar primero el flujo de entrenamiento y exportación del repositorio fuente.
- No se documenta la arquitectura interna, los parámetros ni el proceso de entrenamiento, lo que limita la reproducibilidad y el análisis técnico.
- La compatibilidad con el runtime MicroDuck es un requisito estricto: los checkpoints convertidos manualmente pueden omitir el normalizador de observaciones y no ser aptos para despliegue.
- Al ser un modelo de control robótico, no es adecuado para tareas de lenguaje, generación de texto o razonamiento simbólico.
- No hay información sobre sesgos, riesgos de alucinación o limitaciones de contexto, ya que no aplican a este tipo de modelo.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia de las dependencias (MicroDuck, MuJoCo, etc.) antes de un despliegue en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/reachjalil/nottyduck-policies
- Repositorio fuente (GitHub): https://github.com/reachjalil/nottyduck
- Perfil de GitHub del autor: https://github.com/reachjalil
- Perfil de HuggingFace del autor: https://huggingface.co/reachjalil
