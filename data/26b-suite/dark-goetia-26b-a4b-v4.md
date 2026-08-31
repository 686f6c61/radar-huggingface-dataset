# 26B-Suite/Dark-Goetia-26B-A4B-v4

## Resumen

Dark-Goetia-26B-A4B-v4 es un adaptador LoRA de estilo para roleplay bilingüe (inglés y ruso), desarrollado por 26B-Suite sobre el modelo base SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4, que a su vez se asienta en Gemma 4 (arquitectura MoE de 26B parámetros totales y 4B activos). El adaptador ajusta exclusivamente el tono narrativo y la estructura de respuesta en escenarios de fantasía oscura, sin incorporar tramas ni personajes de los datos de entrenamiento. Su relevancia radica en que aborda un fallo específico de la versión anterior (v2): la pérdida de seguimiento del system prompt en sesiones largas, que v4 corrige variando el formato de salida durante el entrenamiento para que el modelo aprenda a leer el formato desde la instrucción, no desde el hábito.

El adaptador se distribuye como un conjunto de pesos LoRA (rank 32, alpha 64) aplicado a 115 proyecciones de atención del modelo base. Está pensado para su uso con SillyTavern y cargadores que respeten la escala del adaptador, y se puede fusionar con el modelo base para obtener safetensors o GGUF. La licencia es gemma, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Gemma 4 (MoE, 26B totales, 4B activos) |
| Parametros totales | 26B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | 4B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se puede fusionar y cuantizar, pero no se indica) |
| Idiomas soportados | en, ru |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador); GGUF tras fusion |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango (rank 32, alpha 64) que modifica 115 proyecciones de atención (q, k, v, o) del modelo base Gemma 4 26B A4B. Según la model card, el entrenamiento de v4 se realizó con una sola época, una longitud máxima de secuencia de 3584 tokens y un dataset que combina escenas sintéticas reescritas y generadas, junto con conjuntos de roleplay de ShareGPT (LimaRP, Bluemoon y similares). La innovación principal frente a v2 es la variación sistemática del formato de salida en los datos de entrenamiento, manteniendo fijo el estilo de prosa, para que el modelo aprenda a tomar el formato del prompt en lugar de tratarlo como una constante. El split de evaluación es estratificado, con un 5% de cada grupo de system prompt, lo que permite medir la generalización de formato. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional para roleplay, con un tono narrativo más oscuro y literario.
- Bilingüe inglés y ruso, con un umbral de estabilidad más bajo en ruso para formatos estructurados.
- Seguimiento de instrucciones de formato en sesiones largas (hasta 30-40 turnos) gracias a la variación de formatos en el entrenamiento.
- Compatible con tarjetas de personaje de SillyTavern y presets como Marinara.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Roleplay de fantasía oscura en SillyTavern: el adaptador se integra como LoRA sobre el modelo base, permitiendo ajustar la escala (0.3-0.55 recomendado) para controlar la intensidad del estilo sin perder la coherencia del personaje.
- Escritura creativa de narrativa gótica o dark fantasy: se puede usar para generar pasajes descriptivos con un tono literario consistente, manteniendo el formato solicitado en el prompt.
- Conversación bilingüe inglés-ruso: útil para usuarios que alternan idiomas en una misma sesión, aunque hay que calibrar la escala según el idioma (más baja en ruso).
- Pruebas de robustez de seguimiento de instrucciones: el modelo sirve como caso de estudio para evaluar cómo la variación de formatos en el entrenamiento mejora la adherencia al system prompt en conversaciones largas.
- Generación de contenido para juegos de rol de mesa: puede producir descripciones de escenas, diálogos de PNJ y reacciones del entorno con un estilo coherente.
- Ajuste fino de estilos en pipelines de generación de texto: al ser un adaptador LoRA, se puede fusionar con el modelo base y exportar a GGUF para su uso en aplicaciones locales con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas estándar como MMLU, HumanEval o GSM8K, y no se encontraron evaluaciones externas en la búsqueda web.

## Requisitos de hardware

- El modelo base Gemma 4 26B A4B requiere aproximadamente 51.6 GB de VRAM en FP16, según LLM Explorer. Esto implica GPUs de gama alta como A100 (80GB), H100 (80GB) o múltiples RTX 4090 (24GB cada una) con paralelismo.
- Con cuantización (por ejemplo, 4-bit), podría caber en una RTX 4090 (24GB) o similar, pero no se proporcionan datos específicos de cuantización para este adaptador.
- El adaptador LoRA en sí es pequeño (repo de 0.0 GB), pero debe fusionarse con el modelo base para su uso, por lo que los requisitos de hardware son los del modelo base.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que soporten modelos MoE y LoRA fusionados. La model card menciona scripts para fusionar LoRAs a Gemma 4 safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría (adaptadores LoRA para roleplay sobre Gemma 4). La versión anterior v2 es la única referencia directa, pero no se publican benchmarks comparativos. Se puede indicar que el modelo base (Gemma 4 26B A4B) es comparable a otros MoE de tamaño similar, pero no hay datos concretos.

## Limitaciones y advertencias

- El adaptador está diseñado exclusivamente para el modelo base SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4; no es un modelo independiente y no funcionará sin ese base.
- La licencia gemma impone restricciones de uso comercial; es necesario revisar los términos de la licencia Gemma antes de desplegar en producción.
- Riesgo de alucinación y degradación del formato en sesiones muy largas (más de 40 turnos), especialmente en ruso, donde el umbral de estabilidad es más bajo.
- El contenido generado puede ser inapropiado para menores o entornos laborales, dado su enfoque en roleplay de fantasía oscura.
- La escala del adaptador debe calibrarse cuidadosamente; si el cargador ignora la metadata `alpha/r = 2`, hay que reducir la escala a la mitad.
- No se han medido los límites de escala en v4; los valores recomendados provienen de v2 y pueden variar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/26B-Suite/Dark-Goetia-26B-A4B-v4
- Versión v2: https://huggingface.co/26B-Suite/Dark-Goetia-26B-A4B-v2
- Adaptador base (SubMaroon): https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4
- Scripts de fusión para Gemma 4: https://huggingface.co/spaces/Naphula/model_tools/commit/bf21b975ef184aaffd042debf371d0e764b899c8
- Entrada en LLM Explorer (v2): https://llm-explorer.com/model/26B-Suite%2FDark-Goetia-26B-A4B-v2,4jKrd0ESJ6M9VrfeTcDy93
- Entrada en FriendliAI (adaptador base): https://friendli.ai/models/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4
