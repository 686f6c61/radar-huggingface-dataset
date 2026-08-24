# fport/gemma-3-4b-tr-alpaca-lora

## Resumen

El modelo `fport/gemma-3-4b-tr-alpaca-lora` es un fine-tuning con adaptadores LoRA (Low-Rank Adaptation) sobre el modelo base `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits de Google Gemma 3 4B IT. El autor, fport, ha entrenado el adaptador con el dataset Alpaca (instrucciones en inglés) utilizando el framework Unsloth, que acelera el entrenamiento y reduce el consumo de memoria. El resultado es un modelo de instrucciones ligero, pensado para tareas de generación de texto y chat en inglés, con una licencia Apache 2.0 que permite uso comercial sin restricciones.

La relevancia de este modelo radica en su tamaño compacto (4 mil millones de parámetros en el modelo base) y su capacidad para ejecutarse en hardware de consumo, lo que lo hace adecuado para prototipos, aplicaciones edge o entornos con recursos limitados. Al ser un adaptador LoRA, el peso adicional es mínimo (el repositorio ocupa 0.2 GB), lo que facilita su distribución y despliegue. Sin embargo, al tratarse de un fine-tuning sobre un modelo ya instruido, las capacidades generales de Gemma 3 (multimodalidad, contexto de 128K, soporte multilingüe) se mantienen en el modelo base, aunque el adaptador está entrenado exclusivamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B IT) con atención multi-query y soporte multimodal (texto e imagen) |
| Parametros totales | Aproximadamente 4 mil millones (modelo base); el adaptador LoRA añade un número reducido de parámetros entrenables (no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base Gemma 3 4B IT) |
| Tipos de cuantizacion | El modelo base está cuantizado en 4 bits (bitsandbytes); el adaptador LoRA se distribuye en precisión completa (safetensors) |
| Idiomas soportados | El modelo base soporta más de 140 idiomas; el fine-tuning se realizó únicamente con datos en inglés (dataset Alpaca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B IT, un transformer decoder-only con atención multi-query, desarrollado por Google. Incorpora capacidades multimodales (procesamiento de texto e imágenes) y una ventana de contexto de 128K tokens. El fine-tuning se realizó mediante LoRA (Low-Rank Adaptation), una técnica que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables y el coste computacional. El entrenamiento se llevó a cabo con el framework Unsloth, que optimiza el proceso mediante kernels personalizados y gestión eficiente de memoria, logrando una velocidad 2x superior a un fine-tuning convencional. El dataset utilizado es Alpaca, un conjunto de 52.000 instrucciones y respuestas en inglés generadas a partir de GPT-3.5, que cubre tareas como generación de texto, razonamiento, clasificación y diálogo. No se especifica si se aplicaron técnicas de RLHF o DPO posteriores al fine-tuning; el proceso se limita a un ajuste supervisado (SFT) sobre el modelo base ya instruido.

## Capacidades

- Generación de texto instructivo: responde a instrucciones en inglés con formato Alpaca (instrucción, entrada, respuesta), adecuado para tareas de redacción, resumen y preguntas-respuestas.
- Razonamiento básico: el modelo base Gemma 3 4B IT tiene capacidades de razonamiento lógico y matemático, que se mantienen en el fine-tuning.
- Soporte de tool calling y function calling: el modelo base Gemma 3 4B IT incluye soporte para llamadas a funciones, aunque no se ha verificado que el adaptador LoRA preserve esta capacidad de forma íntegra.
- Capacidades multimodales: el modelo base puede procesar imágenes junto con texto, pero el adaptador LoRA se entrenó solo con texto; no se garantiza que el fine-tuning mantenga el rendimiento multimodal original.
- Multilingüismo: el modelo base soporta más de 140 idiomas, pero el adaptador está entrenado exclusivamente en inglés, por lo que el rendimiento en otros idiomas puede degradarse.
- No se ha documentado soporte para agentes multi-step ni modos de pensamiento extendido (thinking mode) específicos del adaptador.

## Casos de uso

- Asistente de chat en inglés para aplicaciones ligeras: el modelo puede integrarse en chatbots de atención al cliente o asistentes personales que requieran respuestas en inglés, aprovechando su tamaño reducido para ejecutarse en CPUs o GPUs de gama baja.
- Generación de contenido y redacción: dado su entrenamiento con el dataset Alpaca, es útil para tareas de redacción de correos, artículos breves, resúmenes y reescritura de texto en inglés.
- Prototipado rápido de aplicaciones de IA generativa: al ser un adaptador LoRA de solo 0.2 GB, se puede descargar y cargar rápidamente en entornos de desarrollo para validar ideas antes de escalar a modelos más grandes.
- Educación y experimentación: investigadores y estudiantes pueden usarlo para estudiar técnicas de fine-tuning con LoRA y comparar el comportamiento de un modelo instruido frente a su versión base.
- Generación de código en inglés: aunque no está especializado en código, el modelo base Gemma 3 4B IT tiene cierta capacidad de generación de código; el adaptador puede emplearse para tareas simples de programación asistida.
- Clasificación y extracción de información: el formato Alpaca permite usarlo para clasificar texto, extraer entidades o responder preguntas basadas en un contexto dado, siempre que las instrucciones se formulen en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) para este adaptador LoRA. Se recomienda evaluar el modelo en las tareas específicas de interés antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar basado en un modelo de 4B parámetros cuantizado en 4 bits, el uso de memoria es de aproximadamente 2-3 GB en FP16 y menos de 2 GB en 4 bits. El adaptador LoRA añade un overhead mínimo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo en cuantización 4 bits. Para FP16 se recomienda al menos 6 GB de VRAM.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo como RTX 3060, RTX 4090, y también en Apple Silicon (M1/M2/M3) mediante llama.cpp.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con transformers (PEFT), o exportar a GGUF para usarlo con llama.cpp, Ollama o text-generation-inference (TGI). El repositorio incluye la etiqueta `text-generation-inference`, lo que sugiere compatibilidad con TGI.
- Latencia y throughput: no se han publicado mediciones. En una GPU RTX 4090, se espera una generación de 50-100 tokens por segundo en cuantización 4 bits; en CPU, la velocidad será significativamente menor (5-15 tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fport/gemma-3-4b-tr-alpaca-lora | 4B (base) | 128K | Apache 2.0 | Fine-tuning LoRA sobre Gemma 3 4B IT con dataset Alpaca |
| google/gemma-3-4b-it | 4B | 128K | Gemma Terms of Use | Modelo base original, multimodal, 140+ idiomas |
| unsloth/gemma-3-4b-it-unsloth-bnb-4bit | 4B | 128K | Gemma Terms of Use | Versión cuantizada en 4 bits del modelo base, optimizada con Unsloth |
| microsoft/Phi-3.5-mini-instruct | 3.8B | 128K | MIT | Modelo compacto de Microsoft, orientado a razonamiento y código |

La comparativa se basa en el modelo base, ya que no hay datos específicos del adaptador. El fine-tuning LoRA no altera la arquitectura ni el contexto, pero introduce un sesgo hacia el estilo de respuestas de Alpaca. La licencia Apache 2.0 del adaptador es más permisiva que la de Gemma 3 (que tiene términos de uso propios), lo que facilita su integración en proyectos comerciales.

## Limitaciones y advertencias

- Sesgos del dataset Alpaca: el adaptador se entrenó con instrucciones generadas por GPT-3.5, que pueden contener sesgos de género, raza o ideológicos presentes en los datos originales.
- Riesgo de alucinación: al ser un modelo de 4B, la precisión factual es limitada; puede inventar información o citar fuentes inexistentes, especialmente en tareas de conocimiento abierto.
- Limitaciones de idioma: aunque el modelo base soporta 140+ idiomas, el fine-tuning se realizó solo en inglés; el rendimiento en otros idiomas puede degradarse notablemente.
- Sin garantía de preservación de capacidades multimodales: el adaptador LoRA se entrenó solo con texto, por lo que el procesamiento de imágenes del modelo base podría verse afectado.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar; se recomienda evaluar el modelo antes de usarlo en producción.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el modelo base Gemma 3 está sujeto a los Gemma Terms of Use de Google, que imponen restricciones de uso (por ejemplo, prohibición de ciertos usos militares o de vigilancia). Es necesario revisar ambos términos.
- Tamaño del contexto: aunque el modelo base soporta 128K tokens, el fine-tuning con LoRA puede no haber optimizado el manejo de contextos muy largos; se recomienda probar con secuencias largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fport/gemma-3-4b-tr-alpaca-lora
- Modelo base (unsloth): https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
- Modelo base original (Google): https://huggingface.co/google/gemma-3-4b-it
- Documentación de Gemma 3 en Transformers: https://huggingface.co/docs/transformers/model_doc/gemma3
- Página oficial de Gemma 3 (DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Gemma 3 en Ollama: https://ollama.com/library/gemma3:4b
- Framework Unsloth: https://github.com/unslothai/unsloth
- Ejemplo de fine-tuning LoRA con Gemma (referencia): https://github.com/neham-26/gemma-lora-fine-tuning
