# danyloooah/reax-g2-soup1

## Resumen

reax-g2-soup1 es un modelo de lenguaje publicado en Hugging Face por el usuario danyloooah. Se distribuye en formato safetensors con un total de 31.273.088.876 parametros, lo que lo situa en la categoria de modelos de aproximadamente 31 mil millones de parametros. El tag `gemma4` sugiere que deriva de la familia Gemma de Google, y el tag `reax` apunta a un linaje o proyecto propio del autor. El sufijo `soup1` es habitual en la nomenclatura de tecnicas de model soup (promediado de pesos de varios fine-tunes), aunque no se confirma en la informacion disponible.

El modelo se publica bajo licencia Apache 2.0 y con acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. El repositorio ocupa 62,6 GB, coherente con pesos en precision bf16/fp16 para 31 mil millones de parametros. No se han publicado descargas ni likes en el momento de la consulta.

La relevancia de esta ficha es limitada por la escasez de documentacion: no hay model card detallada, pipeline declarado, idiomas soportados ni resultados de benchmarks en la informacion proporcionada. Aun asi, se recogen a continuacion las especificaciones verificables y se marcan explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `gemma4` sugiere base de la familia Gemma) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla del tag `gemma4`, que sugiere una base derivada de la familia Gemma de Google. El recuento de 31.273.088.876 parametros es consistente con un transformer denso de gran tamano, pero no se confirma si emplea atencion lineal, mezcla de expertos (MoE) u otras variantes. Tampoco se documenta la ventana de contexto nativa.

Respecto al entrenamiento, no hay datos sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO ni tecnicas de alineacion. El sufijo `soup1` podria indicar un promediado de pesos (model soup) de varios checkpoints fine-tuneados, pero esta interpretacion no esta confirmada en la informacion proporcionada. No se han publicado detalles sobre innovaciones tecnicas como decodificacion especulativa o atencion con ventana deslizante.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de 31 mil millones de parametros, aunque no se documenta explicitamente.
- Razonamiento y matematicas: no disponible en la informacion proporcionada.
- Generacion de codigo: no disponible en la informacion proporcionada.
- Vision: no disponible; no hay indicios de que sea multimodal.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Fine-tuning especifico de dominio: al ser un modelo de 31B con licencia Apache 2.0, puede servir como base para ajuste supervisado en tareas verticales (legal, medico, financiero) siempre que se valide su calidad previa con evaluaciones propias.
- Generacion de texto asistida en produccion: integrable en pipelines de generacion con frameworks compatibles con safetensors (vLLM, TGI), aunque requiere validacion de contexto y calidad al no haber benchmarks publicados.
- Experimentacion academica: util como punto de partida para estudiar tecnicas de model soup o comparar linajes derivados de Gemma, dado su origen declarado en el tag.
- Destilacion hacia modelos menores: su tamano permite emplearlo como profesor para destilar capacidades hacia modelos de 7B-13B en entornos con recursos limitados.
- Evaluacion comparativa interna: puede incluirse en suites de evaluacion propias frente a otros modelos de ~30B para medir calidad en tareas concretas.
- Despliegue self-hosted con licencia permisiva: Apache 2.0 facilita su uso comercial interno sin obligaciones de atribucion adicionales mas alla de las estandar, previa verificacion de los terminos de acceso gated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para pesos, mas overhead de KV cache; en la practica se recomienda al menos 80 GB para contexto corto.
- Cuantizacion a 8 bits: alrededor de 31-35 GB de VRAM, viable en una A100 40GB o H100 80GB.
- Cuantizacion a 4 bits: alrededor de 16-20 GB, potencialmente ejecutable en RTX 4090 (24 GB) con contexto limitado.
- GPU recomendadas: A100 80GB, H100 80GB, H200; para cuantizacion agresiva, RTX 4090 o RTX 6000 Ada.
- Cabe en consumer GPU: solo con cuantizacion a 4 bits y contexto reducido; en RTX 3090/4090 (24 GB) es ajustado.
- Opciones de despliegue: vLLM, TGI y llama.cpp (previa conversion a GGUF); Ollama si se publica una version GGUF, que no esta disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| reax-g2-soup1 | 31,27B | no disponible | Apache 2.0 | Gated en HF | Sin benchmarks publicados |
| Gemma 2 27B | 27B | 8K (tipico) | Gemma Terms | Publico | Base probable del linaje; requiere aceptar terminos |
| Qwen2.5 32B | 32,5B | 128K | Apache 2.0 | Publico | Alternativa abierta con benchmarks publicados |
| Mistral Small 24B | 24B | 128K | Apache 2.0 | Publico | Menor tamano, contexto amplio |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento de reax-g2-soup1 para contrastar calidad.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no hay informacion sobre datos de entrenamiento, alineacion ni evaluaciones, lo que impide estimar sesgos y calidad.
- Riesgo de alucinacion desconocido: sin benchmarks ni evaluaciones publicadas, no se puede caracterizar su fiabilidad en tareas factuales.
- Idiomas no declarados: se desconoce el soporte multilingue real y la calidad en castellano.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y el despliegue automatizado.
- Licencia Apache 2.0 declarada, pero conviene verificar que los terminos de acceso gated no impongan restricciones adicionales al uso comercial.
- Origen y linaje no verificados: el tag `gemma4` sugiere derivacion de Gemma, pero no se confirma ni se detalla el proceso de entrenamiento.
- Sin versiones cuantizadas publicadas: la conversion a GGUF/AWQ corre por cuenta del usuario, con el riesgo de degradacion asociado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en la comunidad ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/danyloooah/reax-g2-soup1
