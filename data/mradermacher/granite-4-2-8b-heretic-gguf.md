# mradermacher/granite-4.2-8b-heretic-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `granite-4.2-8b-heretic`, una variante creada por Dingdust a partir del modelo Granite 4.2 8B de IBM. El autor de las cuantizaciones, mradermacher, se dedica a convertir modelos de HuggingFace a formato GGUF para facilitar su ejecución en entornos con recursos limitados, como CPU o GPUs de consumo. El modelo base, Granite 4.2 8B, es un modelo de lenguaje denso de 8.000 millones de parámetros, diseñado para razonamiento multi-paso, generación de código, matemáticas y diálogo multilingüe, con una ventana de contexto de 128.000 tokens y licencia Apache-2.0. La variante "heretic" no incluye documentación específica sobre sus modificaciones, por lo que las capacidades descritas se basan en el modelo original de IBM.

La relevancia de este repositorio radica en que ofrece múltiples niveles de cuantización (desde f16 hasta Q2_K e IQ4_XS), lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. Al ser un formato GGUF, es compatible con herramientas como llama.cpp, Ollama y vLLM, lo que facilita su despliegue en producción. Sin embargo, al no existir información sobre el proceso de cuantización ni sobre las diferencias de la variante "heretic" respecto al modelo base, se recomienda validar su comportamiento en tareas concretas antes de usarlo en entornos críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer denso) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no disponible (no se confirma si es MoE; el modelo base es denso) |
| Longitud de contexto | no disponible (el modelo base declara 128K) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base de IBM es Apache-2.0, pero esta variante no lo especifica) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento de la variante "heretic". El repositorio solo indica que es una cuantización estática del modelo de Dingdust, sin detalles sobre el proceso de fine-tuning ni sobre los datos utilizados. El modelo base, Granite 4.2 8B de IBM, es un transformer denso con un modo de pensamiento conmutable (thinking mode) que permite alternar entre respuestas directas y razonamiento explícito. Según las fuentes consultadas, fue entrenado con un enfoque en razonamiento matemático, generación de código, diálogo multilingüe y flujos de trabajo agénticos, con una ventana de contexto de 128.000 tokens. No se han publicado detalles sobre el volumen de datos de entrenamiento ni sobre el uso de técnicas como RLHF o DPO para esta variante concreta.

## Capacidades

Las capacidades que se enumeran a continuación corresponden al modelo base Granite 4.2 8B, según la información publicada por IBM y fuentes externas. No se ha confirmado que la variante "heretic" mantenga todas ellas, ya que no existe documentación específica.

- Razonamiento multi-paso: el modelo base está diseñado para tareas que requieren cadenas de pensamiento, como problemas matemáticos o lógicos.
- Generación de codigo: soporta lenguajes de programación comunes y puede asistir en tareas de desarrollo de software.
- Dialogo multilingue: entrenado para conversaciones en varios idiomas, aunque no se especifica cuáles.
- Soporte para agentes y tool calling: el modelo base es adecuado para flujos de trabajo agénticos que necesitan invocar herramientas externas.
- Modo de pensamiento conmutable: permite activar o desactivar el razonamiento explícito según la tarea.
- Contexto largo: ventana de 128.000 tokens, útil para documentos extensos o conversaciones prolongadas.

## Casos de uso

Dado que no se dispone de información específica sobre la variante "heretic", los casos de uso se plantean a partir de las capacidades del modelo base y de las características de las cuantizaciones GGUF.

- Asistente de programacion en local: un desarrollador puede ejecutar la cuantizacion Q4_K_M en una GPU de consumo (por ejemplo, RTX 3090) para obtener sugerencias de codigo y explicaciones sin depender de servicios en la nube.
- Analisis de documentos extensos: gracias a la ventana de contexto de 128K (si se mantiene en la variante), el modelo puede resumir contratos, articulos cientificos o informes tecnicos completos en una sola pasada.
- Chatbot de atencion al cliente: con el formato GGUF y herramientas como Ollama, se puede desplegar un bot conversacional en un servidor modesto, manteniendo conversaciones multi-turno con memoria de contexto amplia.
- Generacion de documentacion tecnica: el modelo puede redactar guias, manuales o comentarios de codigo a partir de especificaciones breves, aprovechando su capacidad de razonamiento.
- Prototipado de agentes autonomos: al soportar tool calling (segun el modelo base), se puede integrar en pipelines que necesiten planificacion y ejecucion de pasos intermedios, como automatizacion de tareas de oficina.
- Educacion y formacion: el modo de pensamiento conmutable permite mostrar el razonamiento detras de una solucion matematica o logica, util para tutoria asistida por IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la variante "heretic" ni para las cuantizaciones de este repositorio. La unica referencia disponible es el modelo base Granite 4.2 8B, que segun AI/TLDR obtuvo una puntuacion de 47.67 en SWE-bench Verified, un benchmark de resolucion de problemas de software. Sin embargo, este dato corresponde al modelo original sin cuantizar y no puede atribuirse a esta version. No se dispone de resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar para esta variante.

## Requisitos de hardware

Los requisitos dependen del nivel de cuantizacion elegido. Para un modelo de 8.000 millones de parametros, las estimaciones aproximadas de VRAM son las siguientes:

- Q2_K: aproximadamente 3,5 GB de VRAM, ejecutable en GPUs con 4 GB o mas (por ejemplo, GTX 1650, RTX 3050).
- Q4_K_M: aproximadamente 5 GB de VRAM, adecuado para GPUs de 6-8 GB (RTX 3060, RTX 4060, RX 6600).
- Q8_0: aproximadamente 8,5 GB de VRAM, recomendado para GPUs de 10-12 GB (RTX 3080, RTX 4070).
- f16: aproximadamente 16 GB de VRAM, requiere GPUs de gama alta (RTX 4090, A100, etc.).

En cuanto a CPU, las cuantizaciones Q4_K_M y superiores pueden ejecutarse en procesadores modernos con 16 GB de RAM, aunque la velocidad sera menor que en GPU. Para despliegue, el formato GGUF es compatible con llama.cpp, Ollama, LM Studio y vLLM (con adaptadores). No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de esta variante para realizar una comparativa fiable. A modo orientativo, se puede comparar el modelo base Granite 4.2 8B con otros modelos de 8B de la misma generacion, pero los resultados no son extrapolables a la version cuantizada. La siguiente tabla resume las caracteristicas principales de alternativas similares, basandose en informacion publica:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Granite 4.2 8B (base) | 8B | 128K | Apache-2.0 | Razonamiento, codigo, multilingue |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | Generacion general, codigo |
| Qwen 2.5 7B | 7B | 128K | Apache-2.0 | Multilingue, codigo, matematicas |

No se recomienda utilizar esta tabla como criterio de seleccion sin pruebas propias, ya que la variante "heretic" puede tener comportamientos diferentes.

## Limitaciones y advertencias

- No existe documentacion sobre las modificaciones introducidas por la variante "heretic", por lo que se desconoce si mantiene las capacidades del modelo base o si introduce sesgos o degradaciones.
- La licencia no esta especificada en el repositorio. Aunque el modelo base de IBM es Apache-2.0, la variante de Dingdust y las cuantizaciones de mradermacher podrian tener restricciones adicionales. Se recomienda contactar con los autores antes de un uso comercial.
- Al ser una cuantizacion, es probable que se produzca una perdida de precision en tareas complejas de razonamiento o generacion de codigo, especialmente en los niveles mas agresivos (Q2_K, Q3_K).
- No se han publicado evaluaciones de sesgos ni de seguridad para esta variante. Como cualquier modelo de lenguaje, puede generar contenido incorrecto, ofensivo o alucinado.
- El repositorio no incluye informacion sobre el vocabulario ni sobre los idiomas soportados, lo que limita su uso en aplicaciones multilingues sin pruebas previas.
- La fecha de creacion del repositorio (septiembre de 2026) es posterior a la fecha de lanzamiento del modelo base (agosto de 2026), pero no se ha verificado la trazabilidad de los archivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/granite-4.2-8b-heretic-GGUF
- Modelo original de Dingdust: https://huggingface.co/Dingdust/granite-4.2-8b-heretic
- Ficha del modelo base en Benchable: https://benchable.ai/models/ibm-granite/granite-4.2-8b-20260831
- Articulo de AI/TLDR sobre Granite 4.2 8B: https://ai-tldr.dev/models/granite-4-2-8b/
- Repositorio de cuantizaciones de mradermacher (vista general): https://huggingface.co/mradermacher/granite-4.1-8b-heretic-GGUF (variante anterior, util como referencia)
