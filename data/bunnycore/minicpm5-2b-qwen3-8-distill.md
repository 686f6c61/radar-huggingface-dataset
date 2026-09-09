# bunnycore/MiniCPM5-2B-Qwen3.8-Distill

## Resumen

El modelo `bunnycore/MiniCPM5-2B-Qwen3.8-Distill` es un adaptador LoRA (PEFT) desarrollado por el autor `bunnycore` que se aplica sobre el modelo base `openbmb/MiniCPM5-2B`. Se trata de un proyecto de destilación de conocimiento: el adaptador se entrena con el dataset `faunix/Qwen3.8-27B-Distillation-40K`, que contiene 40.000 muestras generadas por un modelo Qwen de 27.000 millones de parámetros (siguiendo la nomenclatura del dataset, Qwen3.8-27B). El objetivo es transferir las capacidades de razonamiento y generación de un modelo grande a un modelo compacto de 2.000 millones de parámetros, adecuado para escenarios de despliegue en dispositivos con recursos limitados.

El adaptador LoRA aporta 50.233.344 parámetros adicionales, lo que supone un tamaño de repositorio de 0,3 GB. El modelo base `MiniCPM5-2B` es un transformer denso de 2B diseñado para ejecución local y escenarios de baja potencia. La combinación permite un ajuste fino eficiente sin modificar los pesos originales, reduciendo los requisitos de VRAM en comparación con un ajuste completo.

La relevancia actual de este modelo radica en la tendencia de destilación a gran escala: permite a investigadores y desarrolladores evaluar cuánto conocimiento puede transferirse de un modelo de 27B a uno de 2B en tareas conversacionales. Aún no tiene descargas ni me gusta en Hugging Face, lo que indica que es un experimento reciente o de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (MiniCPM5-2B) con adaptador LoRA (PEFT) |
| Parámetros totales | 50.233.344 (adaptador LoRA) + ~2.000.000.000 (modelo base) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los tags mencionan safetensors y GGUF, sin detalle de variantes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors, GGUF, formato PEFT (LoRA) |

## Arquitectura y entrenamiento

El modelo base `openbmb/MiniCPM5-2B` es un transformer denso de dos mil millones de parámetros, la segunda versión de la serie MiniCPM5. Según su ficha en Hugging Face, fue construido siguiendo la misma receta de entrenamiento que `MiniCPM5-1B` y está pensado específicamente para despliegue en dispositivos, ejecución local y escenarios con recursos limitados, alcanzando el estado del arte en su clase (2B). No se detalla la arquitectura interna (número de capas, cabezas, etc.) en la información disponible.

Sobre el adaptador, el entrenamiento utiliza la biblioteca PEFT (versión 0.18.1) y Unsloth, según los tags del repositorio. El dataset `faunix/Qwen3.8-27B-Distillation-40K` es un conjunto de destilación de 40.000 muestras, probablemente compuesto por pares de instrucciones y respuestas generadas por un modelo Qwen de 27B. El adaptador se entrena mediante LoRA, un método de ajuste fino de bajo rango que congela los pesos del modelo base e inserta matrices pequeñas de parámetros (50.233.344 en total), lo que permite el ajuste con un coste computacional y de memoria reducido. No se especifica si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación tecnológica destacable es la destilación de un modelo de 27B a un modelo de 2B mediante LoRA, una aproximación que permite conservar la capacidad de generación del modelo grande sin necesidad de acceder a sus pesos internos. Esto es especialmente útil para el despliegue en aplicaciones con restricciones de latencia o memoria.

## Capacidades

- Generación de texto conversacional: el modelo está entrenado para mantener diálogos multi-turno, ya que el pipeline es text-generation y el dataset de destilación proviene de un modelo Qwen de 27B, conocido por sus habilidades en conversación.
- Herencias del modelo base: al ser un adaptador sobre MiniCPM5-2B, conserva el razonamiento básico y la generación de texto del modelo base, mejorado por la destilación.
- Ajuste eficiente: el uso de LoRA permite añadir capacidades sin reentrenar los pesos del modelo base, lo que facilita la iteración rápida y la personalización.
- Posible capacidad multilingüe: no se especifica, pero el modelo base de OpenBMB suele soportar múltiples idiomas. No hay confirmación en la ficha.
- Capacidades especiales: no se mencionan herramientas (tool calling), agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo base de 2B es lo bastante pequeño para ejecutarse en smartphones o tablets, y el adaptador LoRA añade habilidades de diálogo procedentes de un modelo de 27B. Un desarrollador podría cargar el modelo con `transformers` y PEFT en una app con un intérprete de Python embebido.
- Chatbots de atención al cliente con recursos limitados: gracias al bajo coste de inferencia de un modelo 2B, este adaptador puede integrarse en sistemas de mensajería o CRM para responder consultas frecuentes sin necesidad de una GPU costosa.
- Prototipado rápido en NLP: por su tamaño reducido y la facilidad de cargar el adaptador, es útil para validar hipótesis sobre tareas de conversación antes de escalar a modelos más grandes.
- Ajuste por dominio en entornos sin GPU potente: el LoRA solo necesita 50 millones de parámetros entrenables, por lo que se puede ajustar en una GPU de consumo (RTX 3060, por ejemplo) para especializarlo en un dominio concreto (medicina, derecho, etc.).
- Investigación en destilación de modelos: permite comparar la calidad de destilación de un modelo de 27B a 2B frente a otros métodos, sirviendo como referencia en estudios de compresión de modelos.
- Asistentes de redacción en herramientas de productividad: puede integrarse en editores o procesadores de texto para generar borradores, resúmenes o sugerencias, aprovechando la capacidad de generación heredada del modelo destilador.
- Educación y tutoría personalizada: un tutor de IA que funcione en portátiles o mini-PCs sin conexión a la nube, utilizando la ventana de contexto y la generación de explicaciones del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se han encontrado valores de MMLU, HumanEval, GSM8K ni otros indicadores estándar para este adaptador ni para el modelo base en la documentación accesible.

## Requisitos de hardware

- VRAM estimada: con el modelo base en cuantización de 4 bits (p. ej., QLoRA) y el adaptador cargado, se estima entre 4 y 6 GB; en precisión FP16 completa, el modelo base de 2B requiere alrededor de 4 GB, más el adaptador de unos 0,1 GB. No se dispone de mediciones oficiales.
- GPU recomendada: RTX 3060 (12 GB) como mínimo; una RTX 4090 o una A100 ofrecerían mayor throughput.
- Compatibilidad con GPU de consumo: sí, es viable en tarjetas de 8 GB o superiores, especialmente con cuantización GGUF.
- Opciones de despliegue: `transformers` con PEFT, `llama.cpp`/`Ollama` si se dispone del formato GGUF (mencionado en los tags). No se confirma que el repositorio incluya los pesos GGUF ya convertidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| `bunnycore/MiniCPM5-2B-Qwen3.8-Distill` | 2B + 50M LoRA | No disponible | No disponible | Adaptador LoRA destilado de Qwen 27B |
| `openbmb/MiniCPM5-2B-Base` | 2B | No disponible | No disponible | Modelo base denso para despliegue local |
| `bunnycore/MiniCPM5-2B-Code` | 2B + LoRA | No disponible | No disponible | Adaptador LoRA del mismo autor orientado a código |

La comparación se limita a parámetros y disponibilidad, ya que no se han publicado benchmarks de rendimiento para ninguno de los tres modelos en la información disponible.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica la licencia, lo que implica una restricción legal para su uso comercial. Es necesario consultar al autor o al modelo base.
- Sin benchmarks públicos: no se puede evaluar la calidad real del adaptador frente a alternativas.
- Riesgo de alucinación no medido: al ser un modelo de 2B destilado, la probabilidad de generar contenido inventado puede ser mayor que en el modelo docente de 27B.
- Sesgos heredados: al entrenarse sobre datos generados por un modelo Qwen, puede heredar sesgos lingüísticos y culturales de esos datos. El dataset no especifica filtros de sesgo.
- Idiomas soportados desconocidos: la ausencia de información sobre idiomas limita su uso en aplicaciones multilingües.
- Dependencia del modelo base: el adaptador solo funciona con `openbmb/MiniCPM5-2B-Base`; cualquier cambio en el modelo base requeriría recalcular el adaptador.
- Proyecto personal sin soporte: al tener 0 descargas y no estar respaldado por una organización, el mantenimiento y la validez técnica no están garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/bunnycore/MiniCPM5-2B-Qwen3.8-Distill
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-Base
- Modelo relacionado del autor: https://huggingface.co/bunnycore/MiniCPM5-2B-Code
