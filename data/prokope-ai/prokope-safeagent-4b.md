# ProKope-AI/ProKope-SafeAgent-4B

## Resumen

ProKope-SafeAgent-4B es un modelo de clasificación de texto y extracción de características desarrollado por ProKope-AI, construido mediante fine-tuning sobre Qwen/Qwen3-4B. Su propósito no es la generación de texto general, sino actuar como un "modelo de decisión" (system-one) orientado a la seguridad de agentes: evaluar si una acción, llamada a herramienta (tool call) o paso intermedio de un agente autónomo es segura antes de ejecutarse. Se enmarca en la categoría de guardrails para sistemas agénticos, con etiquetas explícitas como `agent-safety`, `tool-call-safety` y `guardrail`.

El modelo cuenta con 4.027.737.097 parámetros (aproximadamente 4B), hereda la arquitectura transformer de Qwen3-4B y se distribuye en formato safetensors con código personalizado (`custom_code`), lo que implica que requiere confiar en implementaciones propias del autor para su carga. Está publicado bajo licencia Apache 2.0, aunque el acceso al repositorio está restringido (gated) y exige aceptar condiciones en Hugging Face.

Su relevancia actual radica en la creciente necesidad de mecanismos de verificación ligeros y de baja latencia que se interpongan entre un agente LLM y las herramientas o entornos que manipula. Al ser un modelo de 4B, está pensado para desplegarse como capa de filtrado rápida, no como el razonador principal del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen/Qwen3-4B) |
| Parametros totales | 4.027.737.097 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de aproximadamente 4B parámetros, y se especializa mediante fine-tuning supervisado para una tarea de clasificación/decisión (pipeline `text-classification`, tarea `feature-extraction`). La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas del repositorio mencionan los datasets `ia03/terminal-bench` e `IntelligenceLab/Long-Horizon-Terminal-Bench`, lo que sugiere que el entrenamiento o la evaluación se apoyan en escenarios de terminal y tareas de horizonte largo, típicos de agentes que ejecutan comandos.

La innovación declarada es el enfoque "system-one": un modelo de decisión rápido que emite un juicio sobre la seguridad de una acción agéntica, en contraste con razonamientos "system-two" más lentos. El repositorio incluye código personalizado (`custom_code`), por lo que la arquitectura de cabecera de clasificación y el preprocesado no son estándar y dependen de la implementación del autor. No se dispone de información sobre técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de seguridad de acciones y tool calls emitidos por agentes LLM (guardrail).
- Extracción de características (feature extraction) sobre texto de contexto agéntico.
- Evaluación de pasos intermedios en flujos multi-step y tareas de terminal.
- Detección de llamadas a herramientas potencialmente peligrosas o fuera de política.
- Modelo de decisión de baja latencia ("system-one") apto para filtrado en línea.
- Soporte multilingüe limitado al inglés (`en`).
- No está diseñado como generador de texto conversacional ni como razonador general.

## Casos de uso

- Guardrail en pipelines agénticos: interponer el modelo entre el LLM planificador y el ejecutor de herramientas para vetar tool calls inseguras antes de que se ejecuten, aprovechando su tamaño de 4B para mantener baja la latencia del bucle del agente.
- Seguridad en agentes de terminal: clasificar comandos de shell generados por un agente antes de ejecutarlos, usando el modelo como capa de verificación en entornos de tipo Terminal-Bench.
- Filtrado de acciones en sistemas multiagente: cada agente consulta al modelo de decisión para validar sus pasos intermedios y reducir el riesgo de acciones destructivas en cadena.
- Moderación de llamadas a API sensibles: validar parámetros y destino de function calls antes de invocar servicios con efectos secundarios (borrado, transferencias, despliegues).
- Evaluación offline de trayectorias: puntuar retroactivamente los pasos de un agente registrado para auditar incidentes y construir datasets de entrenamiento de políticas más seguras.
- Capa de defensa en producción para asistentes con acceso a herramientas: complementar filtros basados en reglas con un clasificador aprendido que generalice a comandos no previstos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 8-9 GB para los pesos (el repositorio ocupa 8,1 GB), más overhead de activaciones y del código personalizado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones a partir del número de parámetros; no confirmadas por el autor).
- GPU recomendadas para producción: A100, H100 o L40S para alto throughput y baja latencia en bucle agéntico.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4090 y GPUs con 12-16 GB o más en fp16; en cuantización, en GPUs de 8 GB.
- Opciones de despliegue: transformers (requerido por `custom_code`); vLLM, TGI o llama.cpp solo si el código personalizado se adapta, extremo no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProKope-SafeAgent-4B | ~4B | no disponible | Guardrail / clasificación de seguridad agéntica | apache-2.0 | Gated en HF |
| Qwen/Qwen3-4B (base) | ~4B | no disponible | Generación general, razonamiento | apache-2.0 | Público en HF |
| Clasificadores guardrail pequeños (p. ej. basados en DeBERTa) | ~0,1-0,4B | ~512 tokens | Clasificación de contenido | variable | Público |

No se dispone de datos de rendimiento comparado para establecer una comparativa cuantitativa con alternativas específicas de guardrails agénticos.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de despliegues y la reproducibilidad.
- Solo inglés: no apto para agentes que operen en castellano u otros idiomas sin evaluación adicional.
- Uso previsto acotado: es un clasificador de seguridad, no un LLM generativo; emplearlo como tal produciría resultados pobres.
- Riesgo de falsos negativos: un guardrail aprendido puede dejar pasar acciones peligrosas no vistas en entrenamiento; conviene combinarlo con reglas deterministas.
- Riesgo de falsos positivos: puede bloquear tool calls legítimas, degradando la utilidad del agente.
- `custom_code`: la carga requiere ejecutar código del autor (`trust_remote_code`), lo que implica un riesgo de seguridad y de mantenimiento a largo plazo.
- Sesgos: no documentados; al derivar de Qwen3-4B puede heredar sesgos del corpus base.
- Datos de entrenamiento y evaluación no detallados: dificulta auditar su robustez en producción.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y el código personalizado deben revisarse antes de integrarlo en productos.

## Enlaces

- Hugging Face: https://huggingface.co/ProKope-AI/ProKope-SafeAgent-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset referenciado: https://huggingface.co/datasets/ia03/terminal-bench
- Dataset referenciado: https://huggingface.co/datasets/IntelligenceLab/Long-Horizon-Terminal-Bench
