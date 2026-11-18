# KrynexLabs/KrynexAI-1.4-150M-Mobile-Model

## Resumen

KrynexAI 1.4 es un modelo de lenguaje causal de tipo decoder-only, con arquitectura basada en Llama, desarrollado por KrynexLabs a partir de SmolLM2-135M de Hugging Face. Está pensado como un modelo base ultraligero de aproximadamente 150 millones de parámetros (134.515.008 reales según los pesos en safetensors), orientado a generación de texto de alta eficiencia, inferencia rápida y despliegue en dispositivos locales o de borde (*on-device*, *edge-ai*). Su ventana de contexto declarada es de 8.192 tokens y los pesos ocupan unos 270 MB en precisión bfloat16.

El modelo se presenta como una alternativa compacta para entornos con recursos limitados: navegador mediante transformers.js, móviles, sistemas embebidos o CPU sin GPU dedicada. El repositorio incluye pesos en safetensors, ONNX y GGUF, lo que facilita su integración con distintos runtimes de inferencia. La model card menciona un entrenamiento sobre una mezcla de datos web, código y contenido educativo, aunque no se detallan cifras verificables de tokens ni la composición exacta del dataset.

La relevancia de esta ficha radica en su carácter de modelo base pequeño con licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. No obstante, conviene señalar que los resultados publicados en benchmarks son modestos y coherentes con su tamaño, y que el propio autor advierte de que el repositorio puede contener archivos desactualizados o inexactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Llama |
| Parametros totales | 134.515.008 (~150M declarados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | bfloat16, fp16; pesos GGUF y ONNX en el repo (no se detallan variantes concretas) |
| Idiomas soportados | en, fr, zh (segun model card); el campo `language` del repo solo declara en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de estilo Llama, con atención causal estándar y sin innovaciones arquitectónicas destacadas respecto a su modelo base, SmolLM2-135M. Se distribuye en precisión bfloat16 y fp16, y el repositorio incluye conversiones a ONNX y GGUF para facilitar el despliegue en distintos entornos. No se especifican en la información disponible detalles sobre número de capas, dimensión oculta, número de cabezas de atención ni vocabulario.

En cuanto al entrenamiento, la model card indica que se utilizó una mezcla de contenido web, código y datos educativos a escala de "multi-trillion tokens", pero no se aportan cifras concretas ni proporciones del dataset. Se referencian tres datasets propios de KrynexLabs (KrynexAI-Dataset-Flash-Instruction, KrynexAI-Santa-Ana-Tusi-Pasco-Quechua y KrynexAI-Dataset-Mini-Top1), aunque no se detalla su peso en el entrenamiento ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en modo base (no se confirma un ajuste por instrucciones robusto).
- Razonamiento básico y respuesta a preguntas sencillas, limitado por el tamaño del modelo.
- Procesamiento de texto multilingüe declarado para inglés, francés y chino, aunque el campo de idiomas del repositorio solo lista inglés.
- Conversión a ONNX y GGUF para inferencia en CPU, navegador (transformers.js) y dispositivos de borde.
- Compatibilidad con text-generation-inference y endpoints compatibles según los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (*thinking*).

## Casos de uso

- Autocompletado y generación de texto en aplicaciones móviles: con ~270 MB de pesos en bfloat16, el modelo puede ejecutarse en un smartphone moderno para sugerencias de escritura o respuestas cortas sin conexión.
- Asistentes conversacionales embebidos en navegador: gracias a la conversión ONNX y al soporte de transformers.js, puede integrarse en una web para chat básico sin enviar datos a un servidor.
- Prototipado rápido de pipelines de NLP: su reducido tamaño permite iterar en local sobre tareas de clasificación, resumen corto o extracción de información antes de escalar a modelos mayores.
- Filtrado y etiquetado de texto en el borde: útil en dispositivos IoT o gateways con CPU limitada para tareas de moderación simple o categorización de mensajes.
- Educación y demos didácticas: sirve para ilustrar el funcionamiento de un LLM en cursos o talleres sin requerir GPU, dado su bajo consumo de memoria.
- Generación de texto en entornos con restricciones de privacidad: al ejecutarse localmente, permite procesar datos sensibles sin salir del dispositivo.
- Base para fine-tuning ligero: al ser un modelo base Apache-2.0, puede adaptarse con LoRA a dominios específicos con recursos modestos.

## Benchmarks y rendimiento

| Benchmark | KrynexAI 1.4 |
|---|---|
| HellaSwag | 42,1 |
| ARC (media) | 43,9 |
| PIQA | 68,4 |
| MMLU (cloze) | 31,5 |
| CommonsenseQA | 33,9 |
| OpenBookQA | 34,6 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB en bfloat16 o fp16; en torno a 150-200 MB en cuantizaciones de 8 bits y menos de 100 MB en 4 bits (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en GTX 1050, RTX 2060, RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo e incluso en CPU y dispositivos móviles.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, llama.cpp con GGUF, transformers.js en navegador, text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| KrynexAI 1.4 | ~150M | 8.192 | Apache-2.0 | Basado en SmolLM2-135M; pesos en safetensors, ONNX y GGUF |
| SmolLM2-135M (HuggingFaceTB) | 135M | 8.192 | Apache-2.0 | Modelo base del que deriva; referencia directa |
| Qwen2.5-0.5B | ~500M | 32.768 | Apache-2.0 | Mayor tamaño y contexto; más capacidad pero más recursos |
| TinyLlama-1.1B | ~1.1B | 2.048 | Apache-2.0 | Mayor número de parámetros; contexto menor |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 150M de parámetros: capacidad de razonamiento y conocimiento factual muy limitada; propenso a alucinaciones y respuestas incoherentes en tareas complejas.
- El autor advierte explícitamente de que el repositorio puede contener archivos inexactos o desactualizados, y que aproximadamente la mitad de los archivos originales no se modificaron.
- El campo `language` del repositorio solo declara inglés, pese a que la model card menciona francés y chino; el soporte multilingüe real no está verificado.
- No se documenta ajuste por instrucciones ni RLHF/DPO, por lo que su comportamiento conversacional puede ser limitado.
- La ventana de contexto de 8.192 tokens es declarada, pero no se confirma su rendimiento efectivo en secuencias largas.
- Licencia Apache-2.0 permite uso comercial con atribución; no obstante, la calidad del modelo en producción debe validarse empíricamente.
- No se han publicado datos de sesgos, toxicidad ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/KrynexLabs/KrynexAI-1.4-150M-Mobile-Model
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset KrynexAI-Dataset-Flash-Instruction: https://huggingface.co/datasets/KrynexLabs/KrynexAI-Dataset-Flash-Instruction
- Dataset KrynexAI-Santa-Ana-Tusi-Pasco-Quechua: https://huggingface.co/datasets/KrynexLabs/KrynexAI-Santa-Ana-Tusi-Pasco-Quechua
- Dataset KrynexAI-Dataset-Mini-Top1: https://huggingface.co/datasets/KrynexLabs/KrynexAI-Dataset-Mini-Top1
- Revisión en vídeo (44 min): https://www.youtube.com/watch?v=qpV0DnLezzc
