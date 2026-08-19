# FoxlightAI/qwen3-8-27b-fp8-mtp

## Resumen

FoxlightAI/qwen3-8-27b-fp8-mtp es un artefacto auxiliar de decodificación especulativa, no un modelo de lenguaje independiente. Se trata de un *sidecar* MTP (multi-token prediction) derivado del modelo base `Qwen/Qwen3.8-27B-FP8`, publicado por FoxlightAI como parte de su ecosistema Skulk. Su función es proporcionar las cabezas de predicción multi-token que permiten acelerar la inferencia del modelo base mediante decodificación especulativa, donde un modelo pequeño (el drafter) predice varios tokens por paso y el modelo grande los verifica en paralelo.

El artefacto pesa 0,8 GB y contiene los pesos de las cabezas MTP en precisión bf16 sin cuantizar, ya que la precisión del drafter es crítica para la tasa de aceptación de los tokens especulados. Se distribuye bajo licencia Apache-2.0, la misma que el modelo base. No está pensado para ser cargado de forma independiente; se integra con el runtime Skulk, que lo descarga y lo utiliza junto con el modelo objetivo `Qwen/Qwen3.8-27B-FP8`. Su relevancia radica en que permite reducir la latencia de inferencia de modelos de 27B parámetros en hardware consumer, un problema clave para el despliegue local de LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | no disponible (repo de 0,8 GB, sin desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | bf16 (sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (mtp.safetensors) |

## Arquitectura y entrenamiento

El artefacto contiene exclusivamente las cabezas de predicción multi-token extraídas del modelo `Qwen/Qwen3.8-27B-FP8` mediante la herramienta `skulk-weights-publisher` (versión 0.1.0). Estas cabezas son el componente *drafter* del esquema de decodificación especulativa MTP: en lugar de predecir un solo token por paso, predicen varios tokens candidatos que el modelo principal verifica en paralelo, reduciendo el número de pasos de decodificación secuenciales.

No se dispone de información sobre el proceso de entrenamiento de estas cabezas, ya que se extraen directamente del modelo base preentrenado. El sidecar se publica en bf16 sin cuantizar porque la precisión del drafter influye directamente en la tasa de aceptación de los tokens especulados: una mayor fidelidad en las predicciones reduce el número de rechazos y, por tanto, mejora el speedup efectivo. No se han documentado innovaciones técnicas adicionales más allá del propio mecanismo MTP y su integración con el runtime Skulk.

## Capacidades

- No es un modelo generativo: no produce texto por sí mismo.
- Proporciona predicción multi-token para acelerar la decodificación del modelo base `Qwen/Qwen3.8-27B-FP8`.
- Compatible con todas las cuantizaciones del modelo base: un único sidecar sirve para cualquier versión cuantizada del objetivo.
- Se integra con el runtime Skulk, que lo descarga automáticamente y lo gestiona como parte del pipeline de inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales, ya que no es un modelo de lenguaje completo.

## Casos de uso

- Aceleración de inferencia local de Qwen3.8-27B: al desplegar el modelo base en una GPU consumer, el sidecar MTP permite reducir la latencia por token gracias a la decodificación especulativa, mejorando la fluidez en aplicaciones de chat en tiempo real.
- Servidores de inferencia de baja latencia: en entornos de producción donde se sirve el modelo base mediante Skulk, el sidecar se integra sin modificar la API, reduciendo el tiempo de primera respuesta y el throughput por petición.
- Despliegue en hardware con VRAM limitada: al funcionar junto con versiones FP8 o cuantizadas del modelo base, el sidecar añade solo 0,8 GB de peso extra, permitiendo ejecutar el conjunto en GPUs de 24 GB o menos sin sacrificar la precisión del drafter.
- Evaluación comparativa de decodificación especulativa: investigadores que estudian la eficiencia de MTP pueden usar este artefacto como referencia para medir la tasa de aceptación y el speedup sobre Qwen3.8-27B-FP8.
- Integración en pipelines de IA generativa existentes: dado que Skulk se encarga de la carga del sidecar, los desarrolladores pueden incorporar la aceleración MTP sin reescribir su lógica de inferencia.
- Pruebas de rendimiento en entornos edge: el sidecar, al ser ligero, permite experimentar con diferentes configuraciones de cuantización del modelo base y medir el impacto en latencia sin descargar pesos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de latencia, throughput ni tasas de aceptación de tokens especulados para este sidecar específico.

## Requisitos de hardware

- Los requisitos de hardware son los del modelo base `Qwen/Qwen3.8-27B-FP8`; el sidecar añade 0,8 GB adicionales de VRAM para sus pesos en bf16.
- Para el modelo base en FP8, se estima un uso de VRAM en torno a 27-30 GB, lo que requiere GPUs como RTX 4090 (24 GB) con cuantización adicional, o GPUs profesionales como A100 (40 GB) o H100 (80 GB) para ejecución cómoda.
- El sidecar en sí no requiere una GPU específica; se carga en la misma memoria que el modelo base.
- Opciones de despliegue: el sidecar solo funciona con el runtime Skulk; no es compatible con vLLM, llama.cpp, Ollama ni TGI directamente.
- No se dispone de datos de latencia o throughput estimados para la combinación sidecar + modelo base.

## Comparativa con modelos similares

No disponible. No se han encontrado artefactos equivalentes (sidecars MTP para decodificación especulativa) en el ecosistema open source con los que comparar directamente. Como referencia, el modelo base `Qwen/Qwen3.8-27B-FP8` se puede comparar con otros LLMs de 27B, pero el sidecar no es un modelo de lenguaje completo y no tiene métricas propias de rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede generar texto ni responder a prompts por sí mismo; requiere el runtime Skulk y el modelo base `Qwen/Qwen3.8-27B-FP8`.
- Depende de la disponibilidad y estabilidad del runtime Skulk; si este proyecto deja de mantenerse, el artefacto quedaría obsoleto.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; es necesario revisar los términos del modelo base para usos específicos.
- El sidecar se ha extraído de una revisión concreta del modelo base (revisión `017b9c7af6b5689d5dd426a76e0bc077eb5ca20a`); si el modelo base se actualiza, el sidecar podría no ser compatible.
- No se han documentado sesgos ni riesgos de alucinación, ya que el artefacto no genera contenido propio.
- Para producción, es imprescindible validar el speedup real en el hardware objetivo, ya que la decodificación especulativa no siempre mejora el rendimiento en todos los escenarios (depende de la tasa de aceptación y del overhead de verificación).

## Enlaces

- Repositorio HuggingFace del sidecar: https://huggingface.co/FoxlightAI/qwen3-8-27b-fp8-mtp
- Modelo base Qwen3.8-27B-FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio de Skulk (referenciado en la model card): https://github.com/Foxlight-Foundation/Skulk
