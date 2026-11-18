# JonathanColetti/Qwen3.5-0.8B-Astra-WeightEdit

## Resumen

Qwen3.5-0.8B-Astra-WeightEdit es una variante del modelo Qwen3.5-0.8B de Alibaba Qwen en la que se han editado directamente dos tensores de los pesos, sin ningún tipo de entrenamiento adicional. La edición la realizó un LLM (GPT-6 Astra) aplicando la técnica de "weight-space programming" descrita por investigadores del MIT CSAIL (Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab), y JonathanColetti se ha limitado a aplicar el diff publicado y verificar que coincide hash por hash con el checkpoint evaluado por los autores. El objetivo concreto es corregir los bucles de repetición que el modelo base presenta cuando opera en modo "thinking".

El modelo mantiene la arquitectura y el tamaño del base: aproximadamente 873 millones de parámetros (0,8B), pipeline image-text-to-text y licencia Apache 2.0. La intervención es quirúrgica: se restan direcciones de bucle de 64 columnas de salida de `mlp.down_proj` en las capas 15 y 19, lo que afecta a unos 130.000 pesos, el 0,016% del total. Todo lo demás es byte-idéntico al modelo original, lo que facilita la verificación y reduce el riesgo de regresiones no deseadas.

Su relevancia actual es doble: por un lado, demuestra que es posible modificar comportamiento específico de un modelo editando pesos de forma dirigida sin reentrenar; por otro, ofrece una versión corregida y lista para producción de un modelo pequeño con capacidades multimodales, publicada en múltiples formatos (safetensors, ONNX, GGUF) para cubrir desde servidores GPU hasta navegadores con WebGPU y aplicaciones locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de llama.cpp con `-c 32768`) |
| Tipos de cuantizacion | bf16 (safetensors); ONNX en fp32, fp16, int8 (quantized), q4f16 y q4; GGUF BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), ONNX, GGUF (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal del linaje Qwen3.5, con un codificador de visión y un decodificador de lenguaje, empaquetado bajo la clase `Qwen3_5ForConditionalGeneration`. No ha habido entrenamiento ni fine-tuning: la model card indica explícitamente que se editaron dos tensores directamente mediante un LLM, sin training. La edición consiste en restar la dirección de bucle de 64 columnas de salida de `mlp.down_proj` en las capas 15 y 19, afectando a unos 130.000 pesos (0,016% del modelo). El resto de pesos es byte-idéntico al base Qwen3.5-0.8B.

La innovación técnica es precisamente el método de edición: "weight-space programming", una técnica en la que un modelo de lenguaje genera una modificación directamente sobre el espacio de pesos en lugar de sobre texto o código. El trabajo original corresponde al experimento 8 del blog "Sparks of Weight-Space Programming" de MIT CSAIL, y el autor de esta ficha solo aplicó el diff publicado, verificando que coincide con el checkpoint evaluado por los autores. Los artefactos ONNX y GGUF no se reexportaron desde cero: se tomaron conversiones existentes de la misma revisión base y se reescribieron únicamente los dos tensores editados, de modo que el resto de bytes coincide con builds ya probados.

## Capacidades

- Generación de texto y razonamiento paso a paso, con modo "thinking" activable mediante `enable_thinking=True` en el chat template.
- Razonamiento matemático: los ejemplos de la model card emplean problemas aritméticos con formato de respuesta `\boxed{}`.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador de visión incluido en los pesos safetensors y en los grafos ONNX.
- Salida de razonamiento estructurada y verificable, orientada a problemas de matemáticas y lógica.
- Despliegue multiplataforma: Transformers, vLLM, SGLang, Transformers.js (WebGPU/WASM/Node.js), ONNX Runtime, llama.cpp, LM Studio, Ollama y Jan.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos con razonamiento explícito: el modelo está pensado para generar cadenas de razonamiento paso a paso y devolver la respuesta final en formato `\boxed{}`, lo que facilita la extracción automática en pipelines de evaluación o tutorización.
- Corrección de bucles en asistentes conversacionales: al eliminar los bucles de repetición del modo thinking, el modelo es adecuado para chatbots donde el base tendía a repetirse en respuestas largas, con muestreo recomendado de temperatura 0,6, top_p 0,95, top_k 20 y presence penalty 1,5.
- Inferencia en navegador con WebGPU: los grafos ONNX en fp16 (1,5 GB de decodificador) permiten ejecutar el modelo en el navegador con Transformers.js, útil para demos interactivas o aplicaciones que requieren privacidad sin enviar datos a un servidor.
- Aplicaciones de escritorio y locales: el GGUF BF16 (1,56 GB) se ejecuta en llama.cpp, LM Studio, Ollama o Jan en portátiles, CPU o Mac, con contexto de hasta 32.768 tokens.
- Procesamiento de documentos con imagen y texto: al ser un modelo image-text-to-text, puede emplearse para tareas de descripción o extracción de información a partir de imágenes combinadas con instrucciones textuales, siempre que se use la versión safetensors/ONNX con codificador de visión (el GGUF es solo texto).
- Investigación sobre edición de pesos: sirve como caso de estudio reproducible para validar técnicas de weight-space programming, ya que el diff está publicado, el hash verificado y el resto del modelo es byte-idéntico al base.
- Prototipado rápido en entornos con recursos limitados: con 873M de parámetros y cuantizaciones de 0,44-0,87 GB en ONNX, es viable para pruebas en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente aporta una comprobación de concordancia de argmax del siguiente token frente al modelo PyTorch bf16 sobre un prompt de 35 tokens: fp32, fp16 e int8 coinciden al 100%; q4f16 y q4, aproximadamente al 69%. No hay datos de MMLU, GSM8K, HumanEval ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,75 GB solo para pesos (873M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2,5 y 4 GB según longitud de contexto.
- ONNX: decodificador de 3,0 GB en fp32, 1,5 GB en fp16, 0,87 GB en int8, 0,48 GB en q4 y 0,44 GB en q4f16.
- GGUF: único archivo BF16 de 1,56 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; A100, H100 y RTX 4090 sobran para este tamaño y permiten lotes grandes y contexto completo. Para WebGPU, fp16 requiere una GPU integrada o dedicada compatible con WebGPU.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060, RTX 4090 y similares; también en CPU y Mac mediante GGUF o ONNX int8.
- Opciones de despliegue: Transformers, vLLM, SGLang, Transformers.js (WebGPU, WASM, Node.js), ONNX Runtime, llama.cpp, LM Studio, Ollama y Jan.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-Astra-WeightEdit | 873M | 32.768 | Sí (image-text-to-text) | Apache 2.0 | safetensors, ONNX, GGUF | Bucles de thinking corregidos por edición de pesos |
| Qwen3.5-0.8B (base) | 873M | no disponible | Sí | Apache 2.0 | safetensors | Presenta bucles de repetición en modo thinking |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La corrección de bucles solo es efectiva con el modo thinking activado (`enable_thinking=True`); con thinking desactivado no aporta mejora.
- El GGUF es únicamente texto: no incluye archivo `mmproj` de visión, por lo que las capacidades de imagen no están disponibles en llama.cpp, LM Studio, Ollama ni Jan.
- Las cuantizaciones de 4 bits (q4, q4f16) son notablemente lossy a este tamaño: la concordancia de argmax con bf16 cae al ~69%, por lo que no se recomiendan para tareas sensibles a la precisión.
- Riesgo de alucinación inherente a un modelo de 0,8B: la capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos mayores.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3.5-0.8B.
- Idiomas soportados: no disponibles; conviene validar el comportamiento multilingüe antes de usarlo en producción en idiomas distintos del inglés.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara no estar afiliado ni respaldado por los autores del método, OpenAI ni Qwen.
- El modelo no ha sido reentrenado: cualquier comportamiento no relacionado con los bucles de repetición es idéntico al base, incluidas sus limitaciones.
- No se documenta soporte de tool calling ni de agentes multi-paso; no asumir estas capacidades sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JonathanColetti/Qwen3.5-0.8B-Astra-WeightEdit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog del método (Sparks of Weight-Space Programming, experimento 8): https://rikiyat.github.io/blog/weight-space-programming/
- Logs y edición originales: https://github.com/RikiyaT/lm_understand-logs/tree/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp8_math
- Conversión ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-0.8B-ONNX-OPT
