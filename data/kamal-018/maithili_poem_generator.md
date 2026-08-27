# kamal-018/Maithili_Poem_Generator

## Resumen

MaithiliNano (Variant A) es un modelo de lenguaje pequeño (SLM) de tipo decoder-only, desarrollado por kamal-018 dentro del proyecto MaiGen, cuyo objetivo es generar poesía en maithili, una lengua indoaria hablada principalmente en Bihar (India) y Nepal, considerada de bajos recursos en el ámbito del procesamiento del lenguaje natural. El modelo fue preentrenado desde cero sobre un corpus de 45,86 millones de tokens en maithili y posteriormente afinado con poemas curados en esa lengua.

Con aproximadamente 29,3 millones de parámetros, una arquitectura Transformer con 8 capas, 8 cabezas de atención y dimensión de modelo 512, incorpora técnicas modernas como RoPE (rotary position embeddings), RMSNorm, SwiGLU y embeddings atados. Su ventana de contexto es de 512 tokens y su vocabulario está compuesto por 8.000 tokens BPE a nivel de byte. El modelo se distribuye bajo licencia MIT y está pensado exclusivamente para la generación de poesía en maithili en escritura devanagari, no como un LLM de propósito general.

La relevancia de este modelo radica en su enfoque en una lengua minoritaria, demostrando que es posible entrenar modelos pequeños y especializados con recursos limitados. Su tamaño reducido permite ejecutarlo en hardware modesto, lo que facilita su uso en aplicaciones culturales, educativas y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (RoPE, RMSNorm, SwiGLU, tied embeddings) |
| Parametros totales | 29.323.776 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | maithili (mai) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors), checkpoint PyTorch (poem_finetune.pt) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura decoder-only Transformer estándar, con 8 capas, 8 cabezas de atención y dimensión de modelo 512. Emplea RoPE para codificación posicional, RMSNorm para normalización, SwiGLU como función de activación en las capas feed-forward y embeddings atados (tied embeddings) entre la capa de entrada y la de salida. El vocabulario se construye con un tokenizador ByteLevelBPE de 8.000 tokens, lo que permite manejar el texto en maithili con escritura devanagari de forma eficiente.

El entrenamiento se realizó en dos fases: primero un preentrenamiento desde cero sobre un corpus de 45,86 millones de tokens en maithili, y después un ajuste fino (fine-tuning) sobre un conjunto curado de poemas en maithili. El checkpoint publicado corresponde a la época 10, paso 1200, con una pérdida de validación de aproximadamente 0,70. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento parece ser supervisado estándar.

## Capacidades

- Generación de poesía en maithili: el modelo produce versos y poemas completos en escritura devanagari, dado un prompt inicial.
- Generación de texto condicionada: acepta un prompt en maithili y continúa con texto coherente en el mismo idioma, aunque limitado al dominio poético.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: solo maithili; no soporta otros idiomas.
- Capacidades especiales: no incluye modo thinking, visión ni audio. Es un modelo puramente textual y de propósito específico.

## Casos de uso

- Plataformas culturales de poesía maithili: el modelo puede generar poemas nuevos para sitios web o aplicaciones dedicadas a la literatura maithili, ofreciendo contenido fresco a los lectores. Su tamaño reducido permite integrarlo en servicios ligeros.
- Asistente de escritura creativa para poetas: un poeta que escribe en maithili puede usar el modelo como generador de ideas o para completar versos, aprovechando su capacidad de continuar un prompt con estilo poético.
- Generación de contenido para redes sociales: se pueden crear publicaciones con versos en maithili para conmemorar festivales como Chhath o celebraciones locales, automatizando la producción de contenido cultural.
- Herramienta educativa para aprendizaje de maithili: estudiantes de la lengua pueden practicar leyendo poemas generados por el modelo, o usarlo para generar ejemplos de estructuras poéticas.
- Creación de letras para música folclórica: compositores pueden emplear el modelo para generar letras de canciones en maithili, adaptadas a métricas y temáticas tradicionales.
- Investigación en PLN de lenguas de bajos recursos: el modelo sirve como punto de partida para experimentos sobre generación de texto en idiomas con pocos recursos, permitiendo estudiar técnicas de entrenamiento eficiente con datos limitados.
- Prototipo de aplicación de generación de poesía personalizada: desarrolladores pueden construir una app que genere poemas en maithili para ocasiones especiales (bodas, nacimientos), usando el modelo como motor de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no reporta métricas estándar como MMLU, HumanEval o GSM8K, dado que su dominio es muy específico y no está diseñado para tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~29,3 millones de parámetros. En FP32, el peso ocupa aproximadamente 117 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. Incluso puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650 o superiores. También es viable en hardware integrado o en CPU.
- Compatibilidad con GPU de consumo: sí, es totalmente compatible con GPUs de consumo, incluso las más modestas.
- Opciones de despliegue: se puede cargar con la librería `transformers` de Hugging Face, o mediante el código Python proporcionado en el repositorio. No se menciona soporte para vLLM, llama.cpp u Ollama, pero al ser un modelo pequeño, podría convertirse a GGUF para ejecutarse con llama.cpp si se desea.
- Latencia y throughput: al ser un modelo de 29M parámetros, la generación es muy rápida, con latencias del orden de milisegundos por token en GPU y pocos cientos de milisegundos en CPU. No se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente orientados a la generación de poesía en maithili. Existe un proyecto llamado `maithali-poem` (Piyushosti) que combina un transformer personalizado con Gemma 2B, pero no es directamente comparable por tamaño y enfoque. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está limitado a la generación de poesía en maithili; no es un LLM de propósito general y no debe usarse para tareas como traducción, resumen o diálogo.
- La ventana de contexto es de solo 512 tokens, lo que restringe la longitud de los poemas generados y la coherencia en textos largos.
- Solo soporta escritura devanagari; no maneja otras escrituras del maithili (como Tirhuta) ni otros idiomas.
- Al ser un modelo pequeño entrenado con un corpus limitado, puede producir poemas con errores gramaticales, repeticiones o contenido sin sentido.
- No se han evaluado sesgos ni riesgos de alucinación; se recomienda supervisión humana si se usa en aplicaciones públicas.
- La licencia MIT permite uso comercial, pero el modelo es experimental y no ofrece garantías de calidad o seguridad.
- No se proporcionan instrucciones claras sobre cómo manejar el tokenizador fuera del código de ejemplo; el usuario debe descargar los archivos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kamal-018/Maithili_Poem_Generator
- Repositorio GitHub: https://github.com/Kamal-018/Maithili_Poem_Generator
- Dataset de poemas maithili: https://huggingface.co/datasets/kamal-018/Maithili_Poems
