# AnirbanSaha/llama2-13b-tlink-sentence-only-autoregressive

## Resumen

El modelo `AnirbanSaha/llama2-13b-tlink-sentence-only-autoregressive` es un ajuste fino completo (full-parameter fine-tuning) del modelo conversacional `meta-llama/Llama-2-13b-chat-hf`, desarrollado por el usuario AnirbanSaha. Su proposito no es la generacion libre de texto, sino la clasificacion de relaciones temporales del tipo TLINK (temporal link) entre eventos a partir de enunciados oracionales, empleando la capacidad generativa del modelo base para producir etiquetas de forma autorregresiva.

El modelo se ha especializado sobre el dataset `AnirbanSaha/tlink-classification-sentence-only` para asignar una de cuatro etiquetas: BEFORE, AFTER, OTHER y NONE. Esta pensado para tareas de extraccion de informacion temporal, anotacion linguistica y procesamiento de lenguaje natural clinico o narrativo donde la ordenacion cronologica de eventos es critica.

Se trata de un transformer decoder-only de 13.015.864.320 parametros, con ventana de contexto heredada del modelo base de 4.096 tokens y licencia declarada como llama3.2. Es relevante porque demuestra que un LLM generalista de 13B puede reconvertirse en un clasificador de relaciones temporales con precision cercana al 81% y sin necesidad de arquitecturas dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), atencion con GQA en el modelo base |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en precision completa) |
| Idiomas soportados | no disponible (el modelo base Llama 2 esta optimizado para ingles) |
| Licencia | llama3.2 (segun la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 13B chat: un transformer decoder-only autorregresivo con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y Grouped-Query Attention (GQA) para reducir el coste de la cache KV en el modelo base. El modelo base fue preentrenado sobre 2 billones de tokens de datos publicos y posteriormente alineado mediante RLHF en su variante chat.

El ajuste realizado por el autor es un fine-tuning supervisado de todos los parametros (no se emplean adaptadores tipo LoRA) sobre el dataset `AnirbanSaha/tlink-classification-sentence-only`. La tarea se formula de manera autorregenerativa: el modelo recibe una oracion y debe generar la etiqueta de relacion temporal correspondiente. No se dispone de informacion en la model card sobre el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplico alguna fase adicional de RLHF o DPO tras el ajuste supervisado.

La innovacion principal no esta en la arquitectura, sino en el enfoque: reutilizar un modelo conversacional de 13B como clasificador generativo de relaciones temporales, obteniendo cero salidas invalidas (0/192) en el conjunto de evaluacion, lo que indica que el ajuste ensena al modelo a ceñirse estrictamente al espacio de etiquetas permitido.

## Capacidades

- Clasificacion de relaciones temporales TLINK en cuatro categorias: BEFORE, AFTER, OTHER y NONE.
- Generacion de texto autorregresiva como capacidad heredada del modelo base Llama-2-13b-chat.
- Mantenimiento de dialogos multi-turno y formato conversacional (capacidad residual del base).
- Generacion de salidas estructuradas y restringidas a un espacio de etiquetas cerrado sin producir valores invalidos.
- Capacidad de razonamiento linguistico para interpretar ordenaciones cronologicas entre eventos en texto.
- No se documenta soporte explicito de tool calling, function calling, agentes o multi-step reasoning especifico para la tarea ajustada.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Anotacion automatica de timelines en textos narrativos: el modelo puede procesar pares de eventos dentro de una misma oracion y asignar la relacion temporal (BEFORE, AFTER, OTHER, NONE), acelerando la construccion de lineas de tiempo en corpus literarios o historicos.
- Extraccion de informacion temporal en documentacion clinica: permite ordenar cronologicamente eventos medicos descritos en notas de pacientes, identificando si un sintoma precede o sigue a un tratamiento.
- Preanotacion para anotadores humanos en proyectos de linguistica computacional: al generar etiquetas con cerca del 81% de precision, reduce el esfuerzo manual en la revision de corpus temporales.
- Analisis de eventos en noticias y prensa: clasificacion de la secuencia de sucesos relatados en articulos para construir resumenes cronologicos automatizados.
- Procesamiento de informes financieros o legales: deteccion de la relacion temporal entre clausulas, obligaciones y hechos referenciados en contratos o informes.
- Investigacion academica sobre razonamiento temporal: sirve como baseline ajustado para comparar tecnicas de extraccion de relaciones temporales frente a modelos especificos mas pequenos.
- Pipeline de normalizacion temporal en asistentes conversacionales: interpretacion del orden de eventos mencionados por el usuario para desambiguar el contexto cronologico en conversaciones multi-turno.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy | 0,8073 |
| Macro-F1 | 0,8051 |
| Weighted-F1 | 0,8067 |
| Salidas invalidas | 0/192 |

Los resultados proceden del conjunto de evaluacion incluido en el directorio `evaluation/` del repositorio del autor. No se proporcionan resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 26 GB (13.000 millones de parametros x 2 bytes), lo que coincide con el tamano del repositorio de 26 GB.
- VRAM estimada en INT8: en torno a 13 GB.
- VRAM estimada en INT4 (si se generan pesos cuantizados): alrededor de 7-8 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o 2x RTX 4090 (24 GB cada una) para precision completa. Una sola RTX 4090 de 24 GB no permite inferencia en FP16 sin tecnicas de offloading o cuantizacion.
- Compatibilidad con GPU de consumo: viable en RTX 4090 o RTX 3090 si se emplean cuantizaciones INT4/INT8; en precision completa requiere GPUs de datacenter o configuraciones multi-GPU.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints compatibles (el repositorio esta marcado como `endpoints_compatible`). No se documenta compatibilidad explicita con llama.cpp, Ollama o vLLM, aunque al tratarse de pesos safetensors de Llama 2 son convertibles a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama2-13b-tlink-sentence-only-autoregressive | 13,0B | 4.096 tokens | Clasificacion TLINK temporal | llama3.2 | Hugging Face |
| AnirbanSaha/llama3.2-1b-tlink-sentence-only-autoregressive | 1B | no disponible | Clasificacion TLINK temporal | llama3.2 | Hugging Face |
| meta-llama/Llama-2-13b-chat-hf | 13,0B | 4.096 tokens | Generacion de texto conversacional | Llama 2 Community License | Hugging Face |

El modelo hermano de 1B (basado en Llama 3.2) representa la alternativa mas ligera del mismo autor para la misma tarea, con menor coste de despliegue pero sin datos de rendimiento disponibles en la informacion proporcionada. El modelo base Llama-2-13b-chat carece de la especializacion en relaciones temporales, por lo que no seria directamente comparable en la tarea TLINK.

## Limitaciones y advertencias

- La licencia declarada en la model card es llama3.2, lo que resulta incoherente con el modelo base Llama-2-13b-chat, cuyo uso comercial se rige por la Llama 2 Community License. Debe verificarse la licencia aplicable antes de cualquier uso en produccion.
- No se han documentado los idiomas soportados. El modelo base Llama 2 esta optimizado fundamentalmente para ingles, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Riesgo de alucinacion inherente al modelo base: aunque el ajuste restringe las salidas al conjunto de etiquetas, fuera del dominio de entrenamiento podria generar respuestas incorrectas o malformadas.
- Sesgos heredados del corpus de preentrenamiento de Llama 2, incluyendo sesgos de genero, raza o contexto socioeconomico presentes en los datos de entrenamiento.
- La tarea esta acotada a la clasificacion de relaciones temporales entre eventos en el ambito oracional; no se ha validado su comportamiento en documentos completos ni en cadenas largas de eventos.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos extensos sin estrategias de troceado.
- El modelo solo se ha evaluado sobre 192 ejemplos; el tamano reducido de la muestra limita la robustez estadistica de las metricas reportadas.
- Se trata de un ajuste con pocas descargas (118) y sin likes, lo que indica una validacion externa limitada por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnirbanSaha/llama2-13b-tlink-sentence-only-autoregressive
- Modelo hermano de 1B: https://huggingface.co/AnirbanSaha/llama3.2-1b-tlink-sentence-only-autoregressive
- Dataset de entrenamiento: https://huggingface.co/datasets/AnirbanSaha/tlink-classification-sentence-only
- Modelo base: https://huggingface.co/meta-llama/Llama-2-13b-chat-hf
- Informacion sobre la familia Llama: https://en.wikipedia.org/wiki/Llama_(language_model)
- Despliegue de Llama-2-13B: https://featherless.ai/models/sundar-pichai/llama-2-13b
