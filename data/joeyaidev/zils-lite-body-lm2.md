# joeyAIDev/zils-lite-body-lm2

## Resumen

zils-lite-body-lm2 es un ajuste fino (fine-tune) de Qwen/Qwen3.5-0.8B publicado por el usuario joeyAIDev en Hugging Face. Segun la model card, se trata de un "d3-lite decision body", un componente orientado a la toma de decisiones dentro de una arquitectura mayor, construido sobre el modelo base Qwen3.5 de 0,8 mil millones de parametros. El repositorio contiene 852.985.920 parametros en formato safetensors y ocupa 1,7 GB.

El modelo hereda la arquitectura y el tokenizador de Qwen3.5-0.8B, un transformer denso de la familia Qwen, y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Al estar marcado con `custom_code` y la etiqueta `qwen3_5`, su carga requiere confiar en codigo remoto o disponer del paquete correspondiente. El modelo no cuenta con descargas ni likes en el momento de la consulta y la model card no aporta informacion sobre datos de entrenamiento, benchmarks ni capacidades especificas.

Su relevancia es limitada y experimental: se trata de un artefacto de un autor individual, sin documentacion tecnica publicada, pensado probablemente para experimentacion con pipelines de agentes o sistemas de decision. Para desarrolladores e investigadores, resulta util como ejemplo de fine-tuning ligero sobre un modelo pequeno, pero no como modelo de produccion sin una evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-0.8B; no se detalla en la model card) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion posterior via herramientas estandar) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Por la etiqueta `qwen3_5` y el campo `base_model`, se infiere que el modelo reutiliza la arquitectura del transformer denso de Qwen3.5-0.8B, con 852.985.920 parametros reportados en los safetensors, lo que coincide aproximadamente con el tamano del modelo base. El repositorio incluye `custom_code`, lo que indica que la implementacion requiere codigo especifico del autor para cargar el modelo, probablemente por modificaciones en la cabeza de salida o en el flujo de decision ("decision body").

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Cualquier afirmacion al respecto seria especulativa y no se incluye en esta ficha.

## Capacidades

- Generacion de texto autorregresiva, heredada del modelo base Qwen3.5-0.8B.
- Toma de decisiones ("decision body") segun la descripcion del autor; el mecanismo concreto no esta documentado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el nombre sugiere integracion en pipelines de agentes, sin detalles tecnicos.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Experimentacion con fine-tuning ligero: sirve como referencia para estudiar como se ajusta un modelo de 0,8B sobre una tarea concreta y que cambios introduce el autor en el codigo personalizado.
- Componente de decision en prototipos de agentes: por su tamano reducido (852M parametros) puede ejecutarse en CPU o GPU de gama baja dentro de un bucle de agente, aunque su comportamiento debe validarse empiricamente.
- Evaluacion de modelos base pequenos: util para comparar el efecto del ajuste fino frente a Qwen3.5-0.8B original en tareas de clasificacion o seleccion de acciones.
- Despliegue en entornos con recursos limitados: los 1,7 GB de pesos en safetensors caben en GPUs consumer de 8 GB o menos tras cuantizacion a 8 o 4 bits.
- Investigacion sobre licencias permisivas: al ser Apache 2.0, permite estudiar y modificar el modelo sin restricciones de uso comercial.
- Pruebas de integracion con `custom_code`: valido para verificar flujos de carga con `trust_remote_code=True` en transformers y detectar dependencias del codigo del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB de pesos mas overhead de activaciones y cache KV; en la practica, 3-4 GB son suficientes para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: en torno a 0,9-1,2 GB; en 4 bits, en torno a 0,5-0,8 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo, que puede ejecutarse incluso en iGPU o CPU.
- Cabe en GPU consumer: si, en practicamente toda la gama actual (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers con `trust_remote_code=True` por el `custom_code`; llama.cpp y Ollama requieren conversion previa a GGUF; vLLM y TGI solo si el codigo personalizado es compatible, lo cual no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-body-lm2 | 852.985.920 | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune con `custom_code`, sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8B | No disponible en esta ficha | Apache 2.0 | Hugging Face, modelo base oficial | Base del ajuste, sin modificaciones del autor |
| Qwen2.5-0.5B | 0,49B | 32.768 tokens (segun documentacion publica) | Apache 2.0 | Hugging Face | Alternativa de tamano similar de la generacion anterior |
| Llama 3.2 1B | 1,24B | 128.000 tokens (segun documentacion publica) | Llama 3.2 Community License | Hugging Face, gated | Mayor contexto, licencia con restricciones |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay informacion sobre datos de entrenamiento, evaluacion ni comportamiento esperado, lo que impide garantizar calidad en produccion.
- Riesgo elevado de alucinacion y comportamiento impredecible al ser un fine-tune de autor individual sin benchmarks publicados.
- El uso de `custom_code` obliga a ejecutar codigo remoto (`trust_remote_code=True`), lo que supone un riesgo de seguridad si no se audita el repositorio.
- Modelo base de 0,8B: capacidad limitada de razonamiento, conocimiento factual y contextos largos en comparacion con modelos de mayor tamano.
- Idiomas soportados no declarados; no se puede asumir un rendimiento multilingue solido.
- Sesgos conocidos: no documentados; hereda los sesgos del corpus de entrenamiento de Qwen3.5, no evaluados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin descargas ni validacion de la comunidad: no hay evidencia de que el modelo funcione segun lo descrito.

## Enlaces

- Hugging Face: https://huggingface.co/joeyAIDev/zils-lite-body-lm2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
