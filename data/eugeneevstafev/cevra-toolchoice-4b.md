# EugeneEvstafev/cevra-toolchoice-4b

## Resumen

Cevra-ToolChoice-4B es un ajuste fino de pesos completos (fusionado desde un adaptador LoRA) sobre Qwen3.5-4B, desarrollado por EugeneEvstafev. El modelo no es un generador de texto al uso: está especializado en una única tarea de decisión, seleccionar la siguiente herramienta de un conjunto de descripciones candidatas, incluyendo la opción de no invocar ninguna (`no_tool`). Para ello puntúa los logits de los tokens correspondientes a las etiquetas de decisión y devuelve una distribución de probabilidad sobre las opciones suministradas.

La arquitectura subyacente es la de Qwen3.5-4B (transformer multimodal con pipeline `image-text-to-text`), con 4.659.865.088 parámetros totales y pesos en safetensors (repo de 9,3 GB). El modelo se entrenó con el objetivo de soft-label de Tinker Decision Model sobre 4.048 ejemplos derivados de ToolBench, y su relevancia actual reside en que aborda un problema recurrente en sistemas de agentes: elegir qué herramienta usar sin generar argumentos ni ejecutar llamadas, ofreciendo una señal probabilística calibrada que puede integrarse en un orquestador externo.

Es importante subrayar que el modelo no construye los argumentos de la llamada a herramienta ni ejecuta herramientas; solo emite la distribución sobre las etiquetas candidatas. Además, las probabilidades solo se reproducen mediante el procedimiento de scoring específico del `DecisionRenderer` de Tinker Cookbook, no mediante generación de texto o JSON convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B, pipeline image-text-to-text) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal de 4B parámetros, y se obtiene fusionando un adaptador LoRA de rango 16 entrenado con el objetivo de Decision Model de soft-label de Tinker sobre la revisión base de Hugging Face `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. Tinker no reportó la revisión base subyacente exacta, por lo que el autor advierte que no puede afirmarse la identidad con la base de fusión. El entrenamiento consistió en una época, 203 pasos, batch size 16 y learning rate 0,0001, con selección de checkpoint por validación.

El conjunto de entrenamiento contiene 4.048 ejemplos de elección derivados del snapshot fijado de ToolBench (`Adorg/ToolBench`, commit `0c25df5e…`), repartidos en 3.235 de entrenamiento, 407 de validación y 406 de test. Los datos incluyen ejemplos generados automáticamente y verificados, con objetivos one-hot o suavizados (soft targets); Jev contribuyó a la construcción de los objetivos. La innovación técnica central no está en la arquitectura, sino en el procedimiento de puntuación: se renderiza el estado y las instrucciones con el `DecisionRenderer` (`qwen3_5`), se localiza la posición de decisión y se aplica softmax únicamente sobre los logits de los tokens de etiqueta candidatos, produciendo una distribución sobre las opciones.

## Capacidades

- Selección de herramienta (tool selection) a partir de un estado, unas instrucciones y un conjunto de descripciones candidatas.
- Decisión opcional de no invocar herramienta (`no_tool`).
- Emisión de una distribución de probabilidad sobre las etiquetas candidatas, útil para umbrales y enrutamiento.
- Entrada multimodal heredada de la base (pipeline image-text-to-text), aunque el entrenamiento documentado es de selección de herramienta.
- Soporte de etiquetas candidatas arbitrarias suministradas en tiempo de inferencia.
- No construye argumentos de llamada a herramienta ni ejecuta herramientas.
- No se documenta soporte de tool calling generativo, agentes multi-paso ni thinking mode en la información disponible.

## Casos de uso

- Enrutamiento de herramientas en un orquestador de agentes: el modelo recibe el estado de la conversación y la lista de herramientas disponibles y devuelve la probabilidad de cada una; el orquestador aplica un umbral y decide si invocar o responder directamente con `no_tool`.
- Desambiguación previa a la ejecución: en pipelines donde varias herramientas tienen descripciones solapadas, la distribución de probabilidad permite detectar ambigüedad (por ejemplo, masa repartida entre dos opciones) y solicitar aclaración al usuario antes de actuar.
- Filtro de seguridad de invocaciones: usar la probabilidad de `no_tool` como señal para bloquear llamadas cuando la petición no requiere herramienta, reduciendo ejecuciones innecesarias.
- Evaluación y monitorización de catálogos de herramientas: analizar la distribución sobre candidatas en lotes de peticiones reales para detectar descripciones de herramientas confusas o redundantes.
- Integración en sistemas de atención al cliente con catálogo de acciones: seleccionar entre consultar pedido, cambiar dirección o escalar a humano, dejando la construcción de argumentos a un componente separado.
- Investigación sobre calibración de decisiones en agentes: el modelo y su split de test público (406 ejemplos) permiten estudiar agreement y Brier score frente a la base, siempre con las cautelas del autor sobre la independencia del benchmark.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test retenido (406 ejemplos), con las mismas entradas y candidatas para la base y el modelo fusionado:

| Modelo | Agreement con etiquetas del dataset | Distribution Brier (menor es mejor) |
|---|---:|---:|
| Qwen3.5-4B base | 78,57% | 0,29733 |
| Cevra-ToolChoice-4B | 98,03% | 0,02017 |
| Jev through LLM7 | 98,28% | 0,03755 |

El intervalo de confianza del 95% por bootstrap agrupado para la diferencia de agreement Jev menos Cevra fue de -4,03 a +4,99 puntos porcentuales. El autor advierte que estas métricas son agreement con etiquetas y distribuciones objetivo del dataset, no estimaciones independientes de precisión real ni de calibración, y que Jev participó en la construcción de los objetivos suaves, por lo que la comparación no es independiente. Local Laya no pudo procesar los 406 ejemplos sin truncar descripciones y no tiene puntuación comparable.

## Requisitos de hardware

- Pesos en BF16 de 4B parámetros: aproximadamente 9,3 GB, por lo que se necesita una GPU con al menos 10-12 GB de VRAM para inferencia en BF16 (el ejemplo del autor usa CUDA y `device_map={"": "cuda:0"}`).
- GPU recomendadas: cualquier GPU con 12 GB o más de VRAM en BF16; A100, H100 o RTX 4090 son holgadas para este tamaño.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090); en cuantización inferior no hay datos publicados.
- Despliegue: el autor documenta `transformers==5.22.2` con `accelerate`, `torch` y `tinker-cookbook==0.6.1`, usando `AutoModelForImageTextToText` y el `DecisionRenderer`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; además, el procedimiento de scoring requiere acceso a los logits en la posición de decisión, lo que condiciona el stack de servicio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Agreement (test) | Brier | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Cevra-ToolChoice-4B | 4.659.865.088 | no disponible | 98,03% | 0,02017 | no disponible | Hugging Face |
| Qwen3.5-4B base | 4B (aprox.) | no disponible | 78,57% | 0,29733 | no disponible | Hugging Face |
| Jev through LLM7 | no disponible | no disponible | 98,28% | 0,03755 | no disponible | vía LLM7 |

No se dispone de datos de otros modelos comparables de selección de herramienta en la información proporcionada. La comparación con Jev no es independiente, según advierte el propio autor.

## Limitaciones y advertencias

- Las probabilidades solo se reproducen con el `DecisionRenderer` de Tinker Cookbook y el scoring de logits de etiqueta; la generación de texto o JSON no las reproduce.
- El modelo no construye argumentos de llamada ni ejecuta herramientas; requiere un componente externo para ello.
- El test set tiene 31 grupos de origen, estuvo expuesto durante el desarrollo y no es un benchmark etiquetado por humanos de forma independiente.
- Jev contribuyó a la construcción de los objetivos suaves, por lo que la comparación con Jev no es independiente.
- No se puede afirmar la identidad entre la base de fusión y la base usada por Tinker, ya que el proveedor no divulga la revisión exacta; las comprobaciones numéricas realizadas son limitadas (diferencia máxima absoluta de 0,00598 en diez entradas concentradas y 0,02813 en diez entradas sintéticas).
- El rendimiento puede degradarse con herramientas no vistas, contextos largos, peticiones ambiguas, conjuntos de candidatas distintos o renderers alternativos.
- Los umbrales y la confianza deben validarse sobre datos independientes etiquetados por humanos antes de desplegar.
- Las descripciones de herramientas y los resultados previos deben tratarse como entrada no confiable.
- El entrenamiento usa ToolBench, cuyos datos incluyen descripciones de APIs de terceros; deben revisarse los derechos y términos aplicables al uso previsto.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas: solo inglés documentado.
- No hay datos publicados de sesgos, riesgo de alucinación en generación libre ni longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EugeneEvstafev/cevra-toolchoice-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Split de test público: https://huggingface.co/datasets/EugeneEvstafev/cevra-toolchoice-4b-test
- Snapshot de ToolBench usado: https://huggingface.co/datasets/Adorg/ToolBench/tree/0c25df5e6937aae854c2cc1bb203297600afce8b
- Repositorio ToolBench: https://github.com/OpenBMB/ToolBench
- Paper (DOI): https://doi.org/10.5281/zenodo.24159727
