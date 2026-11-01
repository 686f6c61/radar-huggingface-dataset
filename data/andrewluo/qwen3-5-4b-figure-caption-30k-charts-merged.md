# andrewluo/Qwen3.5-4B-figure-caption-30k-charts-merged

## Resumen

Qwen3.5-4B figure-caption-30k-charts-merged es un checkpoint de Qwen3.5-4B (desarrollado originalmente por Alibaba Qwen) publicado por el usuario andrewluo en Hugging Face, en el que se ha fusionado un adaptador LoRA de captioning de figuras en los pesos base. El modelo resuelve una tarea concreta: generar descripciones en texto plano de figuras y graficos extraidos de documentos, incluyendo etiquetas legibles, cantidades, unidades y relaciones visuales, declarando incertidumbre cuando los detalles no son legibles. Es relevante porque ofrece un modelo multimodal listo para servir sin necesidad de cargar un adaptador LoRA por separado ni depender de MLX.

El entrenamiento consistio en 30.000 ejemplos iniciales (una epoca, 938 actualizaciones del optimizador) seguidos de una continuacion de 1.128 ejemplos centrada en graficos (una epoca, paso 974, completada el 28 de octubre de 2026). El adaptador tiene rango 16, alpha 32 y escala 2, y actualiza 128 matrices de proyeccion del modelo de lenguaje. La fusion se hizo en float32 y se redondeo una sola vez al dtype BF16 original; los otros 610 tensores conservan sus bytes, nombres, layouts y dtypes originales.

El checkpoint incluye el codificador visual, el tokenizer, el procesador de imagen y la plantilla de chat, con licencia Apache 2.0. El repositorio ocupa 9,3 GB y acumula 16 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basada en Qwen3.5-4B; incluye tensores auxiliares MTP |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens en las configuraciones de serving incluidas |
| Tipos de cuantizacion | BF16 en las configuraciones publicadas; no se ha aplicado FP8 ni INT4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a), un transformer multimodal con codificador visual y modelo de lenguaje. Sobre el se entreno un adaptador LoRA de rango 16, alpha 32 y escala 2 que actualiza 128 matrices de proyeccion del modelo de lenguaje. El entrenamiento consto de dos fases: 30.000 ejemplos durante una epoca con 938 actualizaciones del optimizador, y una continuacion de 1.128 ejemplos centrada en graficos, una epoca y paso 974, que preservo el estado del optimizador y el estado aleatorio de la ejecucion inicial. El adaptador final coincide byte a byte con su checkpoint de recuperacion (SHA-256 a3f166e5e57532f15948e5629046c52e3ef06bf488dd456f26698cd8e63094b8).

La fusion se realizo en float32 y se redondeo una unica vez al dtype BF16 original. Los tensores auxiliares MTP del modelo original permanecen presentes pero no fueron entrenados ni evaluados para decodificacion especulativa. La perdida de validacion final de la continuacion fue 1,046623 sobre 32 secuencias del pool de validacion sin cambios de 1.446 filas, frente a 0,894963 al final de la ejecucion inicial de 30k. El autor advierte que esta pequena porcion de validacion general no demuestra una mejora en el captioning de graficos y que no se reclama ningun benchmark de calidad sobre graficos retenidos.

Como innovacion de serving, el autor publica configuraciones para DFlash, una optimizacion de decodificacion especulativa en tiempo de servicio que emplea un modelo borrador separado (z-lab/Qwen3.5-4B-DFlash). El borrador se entreno contra el Qwen3.5-4B original, no contra este fine-tune, aunque coinciden en tamano oculto, vocabulario, numero de capas objetivo e indices de capa de caracteristicas, y los embeddings de entrada/salida del objetivo no han cambiado. La tasa de aceptacion y la aceleracion real sobre este fine-tune deben medirse.

## Capacidades

- Generacion de texto e image-text-to-text: el pipeline declarado es image-text-to-text.
- Captioning de figuras y graficos de documentos: descripciones en texto plano con etiquetas legibles, cantidades, unidades y relaciones visuales.
- Declaracion explicita de incertidumbre cuando los detalles no son legibles.
- Conversacional: soporta plantilla de chat multimodal con `add_generation_prompt=True`.
- Modo thinking configurable (`enable_thinking`), desactivado por defecto en las configuraciones de serving.
- Compatible con endpoints OpenAI (`endpoints_compatible`).
- Soporte de serving con vLLM (`vllm/vllm-openai:v0.29.0`).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni otros idiomas distintos del usado en el prompt de entrenamiento.

## Casos de uso

- Extraccion de metadatos de figuras en pipelines de documentacion tecnica: el modelo recibe una imagen recortada de la figura y el prompt de entrenamiento, y devuelve un caption en texto plano que puede indexarse en un buscador o almacenarse como metadato junto al documento original.
- Accesibilidad de documentos cientificos: generar texto alternativo para figuras y graficos de papers, informes y manuales, con mencion de unidades y cantidades, lo que permite alimentar lectores de pantalla o versiones HTML accesibles.
- Enriquecimiento de repositorios de imagenes y dashboards: procesar lotes de graficos con `temperature: 0` y `seed: 0` para obtener descripciones deterministas y comparables entre ejecuciones.
- Preprocesado para RAG sobre informes financieros o tecnicos: convertir figuras en texto indexable para que un sistema de recuperacion pueda responder preguntas sobre tendencias y valores representados en graficos, usando el caption como puente entre la imagen y el texto.
- Control de calidad de figuras en publicaciones: detectar figuras con etiquetas ilegibles o datos incompletos, ya que el prompt de entrenamiento obliga al modelo a declarar incertidumbre en lugar de inventar valores.
- Servicio interno de captioning con API compatible con OpenAI: desplegar el checkpoint en una H100 con vLLM y exponer `/v1/chat/completions` bajo el nombre de modelo `figure-caption-charts`, con contexto de 8.192 tokens, una imagen por peticion y un presupuesto de 2.048 image tokens.
- Evaluacion comparativa de latencia en serving: usar las tres configuraciones incluidas (baseline, DFlash-7 y DFlash-15) para medir latencia real de captioning, throughput de tokens generados y estadisticas de aceptacion a la concurrencia esperada, y elegir baseline si DFlash resulta mas lento en la carga de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de evaluacion es la perdida de validacion: 0,894963 al final de la ejecucion inicial de 30k y 1,046623 al final de la continuacion, medida sobre 32 secuencias del pool de validacion de 1.446 filas. El autor indica explicitamente que este dato no establece una mejora en la calidad de captioning de graficos y que no se reclama ningun benchmark retenido de calidad sobre graficos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 4,66 B de parametros en BF16 el peso ronda los 9,3 GB, a lo que hay que sumar la cache KV para 8.192 tokens y el presupuesto de 2.048 image tokens por peticion.
- GPU recomendadas: las configuraciones publicadas estan validadas para una unica NVIDIA H100.
- Cabe en GPU de consumo: no disponible; no se documenta ninguna prueba en GPU consumer ni cuantizaciones GGUF/INT4/FP8.
- Opciones de despliegue: vLLM (`vllm/vllm-openai:v0.29.0`) con las configuraciones en `serving/`; tambien transformers con el procesador multimodal y la plantilla de chat. No se documenta llama.cpp, Ollama ni TGI.
- Configuraciones de serving incluidas: `serving/baseline/config.yaml` (decodificacion ordinaria), `serving/dflash-7/config.yaml` (DFlash con siete tokens especulativos y bloque de ocho tokens) y `serving/dflash-15/config.yaml` (DFlash con quince tokens especulativos y bloque de dieciseis tokens, para pruebas de latencia a baja concurrencia).
- Latencia y throughput: no disponibles; el autor indica que las configuraciones son candidatas validadas, no optimos de rendimiento medidos, y que la tasa de aceptacion y la aceleracion real de DFlash sobre este fine-tune deben medirse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andrewluo/Qwen3.5-4B-figure-caption-30k-charts-merged | 4,66 B | 8.192 tokens (config. de serving) | Captioning de figuras y graficos | Apache 2.0 | Hugging Face, 16 descargas |
| Qwen/Qwen3.5-4B (modelo base) | 4 B (segun nombre) | no disponible | Multimodal general | no disponible en la informacion | Hugging Face |
| z-lab/Qwen3.5-4B-DFlash | no disponible | no disponible | Modelo borrador para decodificacion especulativa | no disponible en la informacion | Hugging Face (publico) |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones, ni de otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El fine-tune no garantiza precision factual: el propio autor lo advierte en la model card.
- No existe un benchmark retenido de calidad de captioning de graficos; la perdida de validacion reportada se calcula sobre solo 32 secuencias de un pool general y no demuestra mejora en la tarea objetivo.
- Riesgo de alucinacion de valores o contexto no visibles en la imagen; el prompt de entrenamiento pide declarar incertidumbre, pero no lo garantiza.
- El modelo esta especializado en un unico prompt de entrenamiento; usar un prompt generico puede degradar la calidad y solo se recomienda para comprobar conectividad.
- Salida en texto plano, no en JSON ni en un esquema de datos de graficos, lo que limita su integracion directa en pipelines que esperen estructura.
- Una imagen por peticion y contexto de 8.192 tokens en las configuraciones publicadas; no se documenta soporte multi-imagen.
- El modo thinking esta desactivado por defecto en serving; no se documenta su comportamiento en esta tarea.
- Los tensores MTP auxiliares no fueron entrenados ni evaluados para decodificacion especulativa.
- DFlash se entreno contra el modelo base original, no contra este fine-tune; su tasa de aceptacion y su aceleracion deben medirse y puede resultar mas lento que el baseline.
- No se ha aplicado cuantizacion FP8/INT4 ni reentrenamiento del borrador; el objetivo permanece en BF16.
- Idiomas soportados no documentados; el prompt de entrenamiento esta en ingles y no se declaran capacidades multilingues.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la exactitud de los captions generados.
- El repositorio es privado segun la model card (requiere un token de lectura con acceso para montar el checkpoint en serving), aunque la pagina publica de Hugging Face es accesible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andrewluo/Qwen3.5-4B-figure-caption-30k-charts-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo borrador DFlash: https://huggingface.co/z-lab/Qwen3.5-4B-DFlash
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales.
