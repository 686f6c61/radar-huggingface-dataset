# haninmb/train_qewn3_final_r8

## Resumen

El modelo `haninmb/train_qewn3_final_r8` es un ajuste fino supervisado (QLoRA) de Qwen3-14B, desarrollado por el usuario haninmb, especializado en el análisis de herencia mendeliana a partir de perfiles STR (Short Tandem Repeats) de ADN de tríos familiares (padre, madre e hijo). El modelo recibe un perfil genético con los alelos de cada marcador para los tres individuos y devuelve un análisis que identifica discrepancias, el tipo y la dirección de la mutación, el progenitor de origen probable y una clasificación biológica o no biológica, estructurada en una sección `Analysis:` seguida de un objeto JSON `Final Response:`.

Técnicamente, se trata de un transformer denso de 14.768.307.200 parámetros (14,8B) basado en la arquitectura Qwen3, con los adaptadores LoRA (rango 8, alpha 16) fusionados en los pesos base en precisión de 16 bits. El entrenamiento se realizó con Unsloth y TRL sobre 92.811 ejemplos durante 1 época, con una longitud máxima de secuencia de 8.048 tokens y un pico de VRAM de aproximadamente 13 GB en una única GPU de 32 GB.

Su relevancia es acotada pero específica: es un ejemplo de ajuste fino de bajo rango (0,22% de parámetros entrenables) aplicado a un dominio forense muy concreto, con licencia Apache 2.0 y pesos publicados en formato safetensors, además de una variante GGUF. No es un modelo de propósito general, sino un especialista vertical para análisis de parentesco por STR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino QLoRA con LoRA fusionado |
| Parametros totales | 14.768.307.200 (14,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.048 tokens durante entrenamiento; la model card sugiere `max_seq_length=16384` en inferencia |
| Tipos de cuantizacion | 16-bit (pesos publicados); 4-bit vía bitsandbytes/Unsloth; GGUF en repo separado |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16-bit fusionado); GGUF en `haninmb/QWEN3_DNA_GGUF_v2` |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-14B-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del Qwen3-14B de Alibaba, y aplica un ajuste fino supervisado con QLoRA. Los adaptadores LoRA tienen rango 8, alpha 16 y dropout 0, y se aplican sobre las proyecciones q, k, v, o, gate, up y down. Tras el entrenamiento, los adaptadores se fusionan en los pesos base y se publican en 16 bits. Los parámetros entrenables fueron 32,1M de 14,8B (0,22%).

El entrenamiento se realizó durante 1 época sobre 92.811 ejemplos del dataset `haninmb/all_merged_families`, con batch efectivo de 4 (batch 1 por dispositivo y acumulación de gradiente 4), learning rate 2e-4 con decaimiento lineal, 500 pasos de warmup, weight decay 0,001, optimizador AdamW de 8 bits, precisión bf16 y gradient checkpointing de Unsloth. La longitud máxima de secuencia fue de 8.048 tokens. Se ejecutaron 23.203 pasos de optimizador en aproximadamente 32 h 44 min sobre una GPU de 32 GB, con un throughput de 0,79 muestras/s y 0,197 pasos/s. La pérdida final fue de aproximadamente 0,068 (media móvil de 0,073), calculada sobre la secuencia completa, incluyendo el largo system prompt, por lo que no es comparable con pérdidas calculadas solo sobre la respuesta. No se reporta uso de RLHF ni DPO.

Cada ejemplo del dataset contiene un system prompt con las reglas de herencia y el formato de salida, un mensaje de usuario con el perfil STR familiar y una respuesta del asistente que fusiona los turnos `analysis` y `final` en una sola respuesta (`Analysis:` seguido de `Final Response:`). El rol `developer` se mapeó a `system`. El repositorio incluye el script de entrenamiento (`training/run_qwen3_r8.sh`), el script de fusión de LoRA y los logs de TensorBoard.

## Capacidades

- Análisis de herencia mendeliana sobre perfiles STR de tríos familiares (padre, madre, hijo) por marcador.
- Identificación de marcadores con discrepancia respecto a las reglas de herencia.
- Clasificación del tipo y la dirección de la mutación detectada.
- Determinación del progenitor de origen probable de la mutación.
- Clasificación final biológica o no biológica del vínculo de parentesco.
- Salida estructurada: sección `Analysis:` en texto y objeto JSON `Final Response:`.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`), con rol `system` para las instrucciones.
- Generación de texto en inglés; no se declaran capacidades multilingües.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Análisis de parentesco en laboratorios forenses: el modelo recibe el perfil STR de un trío y devuelve qué marcadores no siguen la herencia mendeliana esperada, lo que permite priorizar la revisión manual de los casos ambiguos.
- Triaje de informes de paternidad: dada la salida JSON estructurada, el modelo puede integrarse en un pipeline que consuma la clasificación biológica/no biológica y la derive a revisión humana cuando haya mutaciones.
- Detección de mutaciones en marcadores concretos: el modelo identifica el tipo y la dirección de la mutación y el progenitor de origen probable, útil como borrador para el informe técnico del analista.
- Formación y docencia en genética forense: sirve para generar explicaciones de casos sintéticos de herencia STR con el formato de salida esperado.
- Validación de pipelines bioinformáticos: la salida estructurada permite comparar automáticamente las predicciones del modelo con las reglas de herencia implementadas en software determinista.
- Prototipado de asistentes especializados: al estar bajo Apache 2.0 y con pesos en safetensors y GGUF, sirve como base para experimentar con ajustes finos adicionales en dominios genéticos relacionados.
- Despliegue en hardware modesto: con cuantización 4-bit (unos 10 GB de pesos) puede ejecutarse en una GPU de consumo para pruebas internas o demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: pérdida final de aproximadamente 0,068, 23.203 pasos de optimizador y un throughput de 0,79 muestras/s. No se proporcionan evaluaciones sobre conjuntos held-out (los 938 ejemplos reservados no se usaron para evaluación durante el entrenamiento) ni comparaciones con otros modelos.

## Requisitos de hardware

- Pesos en 16 bits: aproximadamente 30 GB, según la model card; requiere GPU con al menos 40 GB de VRAM para cargar sin cuantizar.
- Pesos en 4 bits: aproximadamente 10 GB con bitsandbytes o Unsloth, según la model card.
- Entrenamiento: se realizó en una única GPU de 32 GB con un pico de VRAM reservada de aproximadamente 13 GB.
- GPU de consumo: con cuantización 4-bit (unos 10 GB) cabe en tarjetas de 12-16 GB, como una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB; en 16 bits no cabe en GPU de consumo.
- GPU profesionales: A100 40/80 GB, H100 o L40S para inferencia en 16 bits; una RTX 4090 de 24 GB solo admite la variante 4-bit.
- Despliegue: transformers (versión usada en entrenamiento: 4.57.1), Unsloth, text-generation-inference (etiqueta `text-generation-inference`), llama.cpp/Ollama mediante la variante GGUF `haninmb/QWEN3_DNA_GGUF_v2`.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haninmb/train_qewn3_final_r8 | 14,8B | 8.048 tokens (entrenamiento) | Análisis STR y parentesco | Apache 2.0 | HuggingFace + GGUF |
| haninmb/train_qewn3_final | 14,8B (base Qwen3-14B) | No disponible | Análisis STR y parentesco | Apache 2.0 | HuggingFace |
| Qwen3-14B (base) | 14,8B | No disponible en la información proporcionada | Propósito general | No disponible en la información proporcionada | HuggingFace |

La comparación con el modelo base Qwen3-14B y con la variante de rango 32 (`train_qewn3_final`) es la más directa: comparten arquitectura y tamaño, y difieren en el rango del adaptador LoRA (8 frente a 32) y en el ajuste de dominio. No se dispone de datos de rendimiento comparativo entre ellos ni con alternativas de otros autores especializadas en genética forense.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: está entrenado exclusivamente para análisis de perfiles STR de tríos familiares; su rendimiento fuera de ese formato no está documentado.
- Riesgo de alucinación en un contexto forense: las clasificaciones biológicas/no biológicas y la identificación de mutaciones no deben usarse como prueba pericial sin validación por un experto y por software determinista.
- Solo inglés: la model card declara únicamente el idioma `en`; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto de entrenamiento limitado a 8.048 tokens: perfiles con muchos marcadores o prompts muy largos pueden exceder la ventana y degradar la salida.
- La pérdida reportada se calcula sobre la secuencia completa, incluido el system prompt, por lo que no es directamente comparable con pérdidas calculadas solo sobre la respuesta.
- No se han publicado evaluaciones sobre el conjunto held-out de 938 ejemplos ni benchmarks externos; no hay evidencia cuantitativa de precisión en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el uso en contextos forenses o clínicos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- El uso requiere respetar el formato exacto de system prompt y plantilla de chat empleados en el entrenamiento; desviarse de él puede producir salidas mal formadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haninmb/train_qewn3_final_r8
- Variante de rango 32 (primer entrenamiento): https://huggingface.co/haninmb/train_qewn3_final
- Variante GGUF: https://huggingface.co/haninmb/QWEN3_DNA_GGUF_v2
- Scripts de entrenamiento: https://huggingface.co/haninmb/train_qewn3_final_r8/tree/main/training
- Logs de TensorBoard: https://huggingface.co/haninmb/train_qewn3_final_r8/tree/main/tensorboard
- Modelo base: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
