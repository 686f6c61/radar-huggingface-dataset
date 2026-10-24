# hanaearg/Phi-3.5-mini-instruct-GoEmotions-P3-Unsloth

## Resumen

`hanaearg/Phi-3.5-mini-instruct-GoEmotions-P3-Unsloth` es un ajuste fino (fine-tune) del modelo Phi-3.5-mini-instruct de Microsoft, partiendo concretamente del checkpoint cuantizado en 4 bits `unsloth/Phi-3.5-mini-instruct-bnb-4bit` publicado por Unsloth. El nombre sugiere que el ajuste se ha realizado sobre la tarea de clasificación de emociones del conjunto GoEmotions en formato de prompts P3, aunque la model card no documenta ni el dataset, ni los hiperparámetros, ni el procedimiento de entrenamiento. El autor es el usuario de Hugging Face `hanaearg` y el modelo se distribuye con licencia Apache-2.0.

El interés de esta ficha es limitado desde el punto de vista de la evaluación de capacidades generales: no hay benchmarks publicados, no hay descripción del proceso de entrenamiento y el repositorio ocupa solo 0,1 GB, lo que apunta a un artefacto de ajuste tipo LoRA/adapter más que a un modelo completo en precisión completa. El modelo base, Phi-3.5-mini-instruct, es un transformer decoder-only denso de aproximadamente 3.800 millones de parámetros con una ventana de contexto nominal de 128.000 tokens, lo que lo sitúa en la gama de modelos pequeños desplegables en GPU de consumo.

En la práctica, este repositorio debe tratarse como un experimento de ajuste específico de dominio (emociones en inglés) más que como un modelo de propósito general. Cualquier uso en producción requiere verificar primero la integridad del artefacto, fusionar los adaptadores con el modelo base y validar el comportamiento real, ya que no existe documentación de evaluación que respalde su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Phi-3.5-mini-instruct); no detallada en la model card del fine-tune |
| Parametros totales | ~3.800 millones en el modelo base Phi-3.5-mini-instruct; no especificado para este fine-tune |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base (no verificado en la informacion proporcionada para el fine-tune) |
| Tipos de cuantizacion | Base de partida en bitsandbytes 4-bit (`bnb-4bit`); pesos publicados en safetensors; no se han publicado GGUF |
| Idiomas soportados | Ingles (`en`) segun la model card; el modelo base declara soporte multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,1 GB, compatible con `transformers` y `text-generation-inference`) |

Otros metadatos relevantes: etiquetas `unsloth`, `llama`, `trl`, `endpoints_compatible`; descargas y likes registrados: 0; fecha de creacion en el Hub: 2026-10-23.

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Phi-3.5-mini-instruct: un transformer decoder-only denso con atención por grupos de consultas (GQA), alrededor de 3.800 millones de parametros y una ventana de contexto de 128.000 tokens. El fine-tune parte de la version cuantizada en 4 bits que Unsloth mantiene en el Hub, lo que implica que el ajuste se realizo sobre pesos con cuantizacion QLoRA (bitsandbytes NF4) o sobre una desquantizacion previa; la model card no lo aclara.

El unico dato de entrenamiento documentado es la herramienta utilizada: Unsloth, con la afirmacion generica de que el modelo "se entreno 2 veces mas rapido" gracias a ella. No se indican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT supervisado, la tasa de aprendizaje, el rango de LoRA ni el numero de epocas. El sufijo "GoEmotions-P3" sugiere un ajuste sobre GoEmotions (54 etiquetas de emociones, dominio de comentarios de Reddit) con el formato de prompts P3, pero esta interpretacion no esta confirmada por el autor. Tampoco se documenta ninguna innovacion tecnica adicional ni la politica de datos.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Phi-3.5-mini-instruct.
- Razonamiento basico, matematicas de nivel escolar y generacion de codigo: capacidades del modelo base, no verificadas tras el ajuste.
- Clasificacion de emociones en texto (presunta finalidad del fine-tune, segun el nombre del repositorio), potencialmente con 27 o 54 etiquetas de GoEmotions.
- Seguimiento de instrucciones en formato chat: el modelo base usa una plantilla de chat propia de Phi-3.5, que el fine-tune no documenta si preserva.
- Soporte de tool calling y function calling: presente en el modelo base, no confirmado en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: la model card solo declara `en`; el modelo base declara cobertura multilingue, pero no hay evidencia de que el ajuste la conserve.
- Vision y audio: no soportados (Phi-3.5-mini-instruct es exclusivamente de texto).
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Clasificacion de emociones en comentarios y resenas: el modelo puede emplearse para etiquetar opiniones de usuarios en ingles segun categorias emocionales, que es presumiblemente la tarea para la que fue ajustado. Requiere validar antes la calidad real del etiquetado, dado que no hay metricas publicadas.
- Moderacion de comunidades y analisis de sentimiento a nivel de discurso: con 128.000 tokens de contexto en el modelo base, es viable procesar hilos completos en una sola pasada y agregar la emocion dominante por conversacion.
- Investigacion en analisis psicologico o de comportamiento: util como modelo de codificacion automatica de emociones en corpus de investigacion, siempre que se documente la validacion frente a anotadores humanos.
- Prototipado rapido de pipelines de NLP: al ser un modelo de ~3.800 millones de parametros, se puede cargar en una GPU de consumo para pruebas de concepto sin infraestructura dedicada.
- Destilacion de etiquetas para construir datasets: usar el modelo como etiquetador debil para preanotar grandes volumenes de texto en ingles y luego revisar manualmente.
- Experimentacion academica con QLoRA y Unsloth: sirve como referencia de como se publica un adaptador ajustado sobre un checkpoint cuantizado en 4 bits y de los riesgos de reproducibilidad asociados.
- Generacion de texto general en ingles (resumen, reescritura): posible por herencia del modelo base, pero no es el objetivo declarado del repositorio y no hay evaluacion que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, F1, exact match ni comparaciones con el modelo base. Tampoco se aportan curvas de perdida ni evaluaciones cualitativas del etiquetado de emociones.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 para el modelo base (~3.800 M de parametros): aproximadamente 8 GB solo para pesos, mas 2-4 GB de cache KV para contextos largos; en torno a 12-16 GB en total para uso comodo.
- VRAM estimada en cuantizacion 4-bit (el checkpoint de partida es `bnb-4bit`): aproximadamente 2,5-3 GB de pesos, lo que permite inferencia en GPUs de 8 GB.
- GPU recomendadas: RTX 4090, RTX 3090, L4, A10G para 4-bit u 8-bit; A100 40/80 GB o H100 para servicio concurrente en bf16 con contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas en 4-bit (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) y en 12-16 GB en precision media.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (etiqueta `text-generation-inference` presente) y vLLM. Para llama.cpp u Ollama seria necesario convertir a GGUF, que no esta publicado; ademas, si el repositorio contiene solo adaptadores, hay que fusionarlos con el modelo base antes de exportar.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de ~3.800 M en una RTX 4090 en 4-bit suele operar en decenas de tokens por segundo, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hanaearg/Phi-3.5-mini-instruct-GoEmotions-P3-Unsloth | ~3,8 B (base) | 128.000 tokens (base) | Fine-tune de emociones sobre Phi-3.5-mini | apache-2.0 | Hugging Face, 0 descargas |
| microsoft/Phi-3.5-mini-instruct | ~3,8 B | 128.000 tokens | Instruccion general, multilingue | MIT (modelo base) | Ampliamente disponible |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.000 tokens | Instruccion general, multilingue | Apache-2.0 | Ampliamente disponible |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Instruccion general, multilingue | Licencia comunitaria Llama 3.2 | Ampliamente disponible |

No existen datos de rendimiento de este fine-tune que permitan una comparacion cuantitativa con las alternativas. Las cifras de parametros y contexto de la tabla corresponden a los modelos base y deben tomarse como referencia, no como mediciones de este repositorio.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican dataset, hiperparametros, numero de pasos ni evaluacion, lo que impide reproducir el ajuste o verificar su calidad.
- Artefacto probablemente incompleto: 0,1 GB es demasiado pequeno para 3.800 millones de parametros en safetensors; es muy probable que el repositorio contenga solo adaptadores LoRA o un subconjunto de pesos. Es necesario inspeccionar los ficheros antes de usarlo.
- Riesgo de sobreajuste: un fine-tune pequeno sobre una unica tarea estrecha puede degradar capacidades generales del modelo base (olvido catastrofico).
- Idioma: la model card declara unicamente ingles; el uso en castellano no esta soportado ni evaluado, y el ajuste puede haber reducido el multilingueismo del base.
- Alucinacion: como todo modelo generativo, puede producir texto plausible pero incorrecto, especialmente fuera de la tarea de clasificacion para la que fue ajustado.
- Sesgos: GoEmotions procede de comentarios de Reddit en ingles, con los sesgos demograficos y tematicos de esa plataforma; el autor no documenta ninguna mitigacion.
- Ambiguedad de etiquetas: la anotacion de emociones es subjetiva; sin metricas de acuerdo entre anotadores ni evaluacion, no se puede estimar la fiabilidad del etiquetado.
- Licencia: el fine-tune se declara Apache-2.0, pero el modelo base Phi-3.5-mini-instruct se distribuye bajo licencia MIT y el checkpoint intermedio es de Unsloth; conviene revisar las condiciones de ambas antes de un uso comercial.
- Sin soporte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar problemas.
- Compatibilidad de plantilla: no se confirma que se mantenga el ChatML/plantilla de chat de Phi-3.5, lo que puede provocar degradacion si se usa como modelo conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanaearg/Phi-3.5-mini-instruct-GoEmotions-P3-Unsloth
- Modelo base utilizado como punto de partida: https://huggingface.co/unsloth/Phi-3.5-mini-instruct-bnb-4bit
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Modelo original de Microsoft (referencia del base): https://huggingface.co/microsoft/Phi-3.5-mini-instruct
