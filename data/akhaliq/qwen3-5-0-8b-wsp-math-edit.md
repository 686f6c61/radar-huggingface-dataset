# akhaliq/Qwen3.5-0.8B-wsp-math-edit

## Resumen

Qwen3.5-0.8B-wsp-math-edit es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B-Base, publicado por el usuario akhaliq en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto. Con 873.438.784 parámetros reales (0,8B), pertenece a la gama ultraligera de la familia Qwen3.5 y está pensado, segun la model card del modelo base, para prototipado, fine-tuning especifico de tarea y fines de investigacion o desarrollo.

El modelo base Qwen3.5 introduce una arquitectura hibrida que combina Gated DeltaNet (atencion lineal) con atencion con compuertas (Gated Attention) y una base de vision con fusion temprana, ademas de una ventana de contexto nativa de 262.144 tokens. Este ajuste concreto, segun su nombre, esta orientado a tareas de matematicas y edicion (math-edit), aunque el autor no ha publicado una model card propia que detalle el dataset o el procedimiento de entrenamiento empleado.

Su relevancia actual radica en que ofrece capacidades multimodales y de razonamiento en un tamano que cabe en GPU de consumo, con licencia Apache 2.0, lo que facilita su despliegue en entornos con recursos limitados. No obstante, al tener 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; hibrida Gated DeltaNet + Gated Attention con FFN |
| Parametros totales | 873.438.784 (0,8B) |
| Parametros activos | no disponible (la model card del base no confirma configuracion MoE para esta variante de 0,8B) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision original; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | 201 idiomas y dialectos segun la model card del modelo base; no se detalla el subconjunto efectivo tras el fine-tuning |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida con un layout de 24 capas organizado en 6 bloques de la forma 3 x (Gated DeltaNet -> FFN) + 1 x (Gated Attention -> FFN). La Gated DeltaNet usa 16 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128; la Gated Attention usa 8 cabezas para Q y 2 para KV con dimension de cabeza 256 y RoPE de 64 dimensiones. La dimension oculta es 1024, la dimension intermedia de la FFN es 3584 y el embedding de tokens (con salida LM atada) es de 248.320 entradas. Incluye entrenamiento con MTP (multi-token prediction) en varios pasos.

El modelo base se entrena en dos fases (pre-entrenamiento y post-entrenamiento) con fusion temprana de tokens multimodales, lo que le permite alcanzar paridad con Qwen3 en razonamiento, codigo, agentes y comprension visual, segun el autor. Para este ajuste especifico (wsp-math-edit) no se dispone de informacion sobre el dataset, el numero de tokens de entrenamiento, el uso de RLHF/DPO ni la receta exacta aplicada por akhaliq; la model card del repositorio es la del modelo base y no describe el fine-tuning.

## Capacidades

- Generacion de texto y razonamiento en modo estandar y, presumiblemente, con soporte de modo thinking heredado del base (no confirmado para este ajuste).
- Comprension de imagen y texto (pipeline image-text-to-text) gracias al codificador de vision del modelo base.
- Razonamiento matematico y edicion de contenido, segun la orientacion indicada en el nombre del ajuste.
- Generacion de codigo y soporte de agentes, capacidades declaradas para la familia Qwen3.5.
- Soporte multilingue amplio (hasta 201 idiomas y dialectos en el base).
- Compatibilidad con tool calling y function calling propia de la familia Qwen3.5 (no verificado especificamente en este fine-tuning).
- Capacidad de manejar contextos muy largos (262.144 tokens) para conversaciones multi-turno o documentos extensos.

## Casos de uso

- Prototipado rapido de asistentes multimodales: el modelo acepta imagen y texto y cabe en una GPU de consumo, lo que permite validar ideas de producto sin infraestructura dedicada.
- Correccion y edicion de expresiones matematicas: dado su enfoque math-edit, puede emplearse para revisar, reescribir o normalizar formulas y desarrollos en entornos educativos o de publicacion tecnica.
- Extraccion de informacion de documentos con imagenes: al combinar vision y contexto largo, es util para procesar capturas, graficos o tablas escaneadas junto con texto de referencia.
- Fine-tuning especifico de dominio: al ser un modelo de 0,8B con licencia Apache 2.0, sirve como punto de partida para ajustes en tareas concretas con presupuesto de computo reducido.
- Generacion asistida en entornos de desarrollo: puede integrarse en pipelines locales para tareas de codigo y explicaciones tecnicas, aunque su tamano limita la calidad frente a modelos mayores.
- Investigacion sobre arquitecturas hibridas: su combinacion de atencion lineal y atencion con compuertas lo hace util para estudiar eficiencia y calidad en modelos pequenos.
- Despliegue en dispositivos con recursos limitados: su tamano permite ejecucion en estaciones de trabajo con una sola GPU consumer para demos y pruebas internas.

## Benchmarks y rendimiento

Los unicos datos disponibles corresponden al modelo base Qwen3.5-0.8B en modo non-thinking, segun la model card. No se han publicado resultados especificos del ajuste wsp-math-edit.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado resultados de benchmarks del ajuste akhaliq/Qwen3.5-0.8B-wsp-math-edit en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (bf16/fp16): aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5-0,6 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia; para entrenamiento o contextos muy largos se recomienda A100 o H100.
- Cabe en GPU consumer: si, en la mayoria de modelos con 8 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers segun la model card del base; llama.cpp/Ollama no estan confirmados para esta variante.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-0.8B-wsp-math-edit | 0,8B | 262.144 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-0.8B (base) | 0,8B | 262.144 | Apache 2.0 | Hugging Face |
| Qwen3-1.7B | 1,7B | no disponible en la informacion | Apache 2.0 (familia Qwen3) | Hugging Face |
| Qwen3.5-2B | 2B | 262.144 | Apache 2.0 | Hugging Face |

En rendimiento, el base Qwen3.5-0.8B obtiene 29,7 en MMLU-Pro y 48,5 en MMLU-Redux, por debajo de Qwen3-1.7B (40,2 y 64,4) y de Qwen3.5-2B (55,3 y 69,2). El ajuste wsp-math-edit no dispone de datos comparativos propios.

## Limitaciones y advertencias

- Modelo de 0,8B: su capacidad de razonamiento y conocimiento factual es limitada en comparacion con modelos de mayor tamano, como reflejan los benchmarks del base.
- Riesgo de alucinacion elevado en tareas de matematicas y edicion si el fine-tuning no ha sido validado; no hay evaluacion publicada del ajuste.
- Sin model card propia: se desconoce el dataset, la receta de entrenamiento y las posibles regresiones introducidas por el fine-tuning.
- Idiomas: aunque el base declara 201 idiomas, no se ha verificado el soporte efectivo tras el ajuste; el castellano no esta confirmado explicitamente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base enlazada.
- Artefacto sin validacion comunitaria (0 descargas, 0 likes): no se recomienda su uso en produccion sin evaluacion previa.
- El pipeline image-text-to-text requiere gestion cuidadosa de entradas multimodales; no se documentan limites de resolucion de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/Qwen3.5-0.8B-wsp-math-edit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
