# schwyzquant/OpenThinker-7B

## Resumen

OpenThinker-7B es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-7B-Instruct sobre el conjunto de datos OpenThoughts-114k, un corpus de trazas de razonamiento destiladas de DeepSeek-R1. La versión publicada por el usuario schwyzquant reproduce la receta del modelo OpenThinker-7B original del proyecto Open Thoughts, utilizando LLaMA-Factory como framework de entrenamiento. El objetivo es dotar a un modelo denso de 7.600 millones de parámetros de capacidades de razonamiento paso a paso (chain-of-thought largo) en matemáticas, código y preguntas de nivel científico.

El modelo mantiene la arquitectura transformer decoder-only de Qwen2.5, con 7.615.616.512 parámetros y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Frente a su modelo base, el ajuste con OpenThoughts-114k busca mejorar el rendimiento en tareas de razonamiento complejo: la model card reporta mejoras sobre Bespoke-Stratos-7B en AIME24 (31,3 frente a 22,7), MATH500 (83,0 frente a 79,6) y GPQA-Diamond (42,4 frente a 38,9).

Es relevante ahora porque forma parte del movimiento de modelos de razonamiento totalmente abiertos: pesos, datos de entrenamiento, código de generación de datos, código de evaluación y código de entrenamiento están publicados. La contrapartida es que este repositorio concreto no aporta resultados de benchmarks propios ni métricas de validación independientes, y su recuento de descargas y valoraciones es cero, por lo que debe tratarse como una reproducción no verificada del modelo de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), atención con RoPE, GQA, SwiGLU y RMSNorm |
| Parámetros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantización | No especificados por el autor; solo se publican pesos en safetensors. El tamaño del repositorio (15,2 GB) es coherente con precisión BF16. No hay GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | No disponibles en los metadatos; hereda la cobertura multilingüe del modelo base Qwen2.5 (más de 29 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), compatible con text-generation-inference y endpoints_compatible |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Dataset de ajuste | open-thoughts/open-thoughts-114k (114.000 ejemplos) |
| Framework de entrenamiento | LLaMA-Factory (full fine-tuning, no LoRA) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-7B-Instruct: un transformer decoder-only de 28 capas, 3.584 dimensiones ocultas, 28 cabezas de atención y 4 cabezas KV (Grouped Query Attention), con normalización RMSNorm y activación SwiGLU. No incorpora mezcla de expertos (MoE), atención lineal ni mecanismos híbridos SSM. El ajuste no modifica la topología de la red, solo los pesos, por lo que la ventana de contexto efectiva es la del modelo base salvo que se aplique interpolación posicional tipo YaRN.

El entrenamiento se realizó sobre OpenThoughts-114k, un dataset derivado de la destilación de DeepSeek-R1 mediante el pipeline de generación de datos publicado por el proyecto Open Thoughts. Según la model card, se emplearon cuatro nodos con 8 GPU H100 cada uno (32 dispositivos) durante 20 horas, con 3 épocas, learning rate de 1e-5, scheduler coseno con warmup del 10 %, AdamW (betas 0,9/0,999, epsilon 1e-8), tamaño de lote efectivo de 96 y semilla 42, sobre Transformers 4.46.1 y PyTorch 2.3.0. No se documenta en la información disponible una fase posterior de RLHF, DPO o PPO.

La innovación principal no está en la arquitectura, sino en la metodología de datos: el proyecto demuestra que una receta de datos de razonamiento reproducible y completamente abierta permite superar a Bespoke-Stratos-7B, que usó 17.000 ejemplos, empleando 114.000 ejemplos generados con el mismo pipeline. La evaluación se realizó con la herramienta de código abierto Evalchemy.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo de Qwen2.5.
- Razonamiento paso a paso con cadenas de pensamiento largas, entrenado explícitamente para ello mediante trazas destiladas de DeepSeek-R1.
- Resolución de problemas de matemáticas de competición (referencia AIME24 y MATH500 en la model card del modelo original).
- Generación y razonamiento sobre código, incluida resolución de problemas de programación competitiva (LiveCodeBench v2 en la model card).
- Respuesta a preguntas de nivel científico y de posgrado (GPQA-Diamond).
- Capacidades multilingües heredadas del modelo base Qwen2.5, aunque no verificadas específicamente para este ajuste.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles con la API de OpenAI, lo que facilita el despliegue como servicio.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modos de pensamiento conmutables. Aunque el modelo base Qwen2.5-7B-Instruct soporta function calling nativo, el ajuste sobre datos de razonamiento puede haber degradado esa capacidad y no hay datos que lo confirmen.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede descomponer problemas de nivel de bachillerato o universitario en pasos intermedios y justificar cada uno, aprovechando el entrenamiento sobre 114.000 trazas de razonamiento con verificación final.
- Generación de soluciones de programación: dado un enunciado tipo LeetCode o LiveCodeBench, produce una solución con explicación del algoritmo, adecuado para herramientas de práctica de entrevistas técnicas.
- Asistente de estudio para materias científicas: responde preguntas de física, química o biología de nivel universitario con razonamiento explícito, útil en plataformas educativas que necesitan mostrar el procedimiento, no solo la respuesta.
- Preprocesamiento de razonamiento para pipelines de datos: puede generar trazas de razonamiento sintéticas que sirvan como material de destilación para modelos más pequeños, replicando el mismo enfoque del dataset original.
- Desarrollo de agentes de resolución de problemas: integrado mediante la API compatible con endpoints, puede actuar como motor de razonamiento en un sistema mayor que orqueste recuperación de información y ejecución de código.
- Evaluación comparativa de recetas de datos: al ser una reproducción del OpenThinker-7B original con código de entrenamiento abierto, sirve como punto de control para experimentos de ablación sobre composición del dataset o hiperparámetros.
- Despliegue en local para prototipado: con cuantización INT4 cabe en GPU de consumo, lo que permite a un desarrollador individual probar un modelo de razonamiento de 7B sin depender de APIs externas.
- Auditoría y reproducibilidad académica: al publicarse pesos, datos, código de generación, código de evaluación y código de entrenamiento, es útil en investigación sobre destilación de razonamiento y sesgos heredados del profesor (DeepSeek-R1).

## Benchmarks y rendimiento

Los datos de la tabla siguiente proceden de la model card del modelo de referencia OpenThinker-7B del proyecto Open Thoughts, evaluados con Evalchemy, y se incluyen porque el autor de este repositorio los reproduce en su propia model card. El model-index de este repositorio no contiene resultados propios (`results: []`), por lo que no hay validación independiente de esta reproducción concreta. Todos los valores son porcentajes de acierto.

| Modelo | AIME24 | MATH500 | GPQA-Diamond | LCBv2 Easy | LCBv2 Medium | LCBv2 Hard | LCBv2 All |
|---|---|---|---|---|---|---|---|
| OpenThinker-7B | 31,3 | 83,0 | 42,4 | 75,3 | 28,6 | 6,5 | 39,9 |
| Bespoke-Stratos-7B | 22,7 | 79,6 | 38,9 | 71,4 | 25,2 | 0,8 | 35,8 |
| DeepSeek-R1-Distill-Qwen-7B | 60,0 | 88,2 | 46,9 | 79,7 | 45,1 | 14,6 | 50,1 |
| gpt-4o-0513 | 8,7 | 75,8 | 46,5 | 87,4 | 42,7 | 8,9 | 50,5 |
| o1-mini | 64,0 | 85,6 | 60,0 | 92,8 | 74,7 | 39,8 | 72,8 |

Lectura de los datos: OpenThinker-7B supera a Bespoke-Stratos-7B en las siete métricas, pero queda por detrás de DeepSeek-R1-Distill-Qwen-7B en todas ellas, con una diferencia especialmente amplia en AIME24 (31,3 frente a 60,0) y en LiveCodeBench v2 Medium (28,6 frente a 45,1). Frente a gpt-4o-0513, el modelo es claramente superior en matemáticas (AIME24 y MATH500) y en código difícil, pero inferior en LiveCodeBench v2 agregado.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 15,3 GB de pesos más la caché KV. Con la configuración de GQA del modelo base (28 capas, 4 cabezas KV, dimensión de cabeza 128), la caché consume del orden de 56 KB por token, es decir, unos 1,8 GB a 32.768 tokens. Presupuesto práctico: 17-18 GB.
- VRAM en FP8 o INT8: del orden de 8 GB de pesos más caché KV, con un presupuesto práctico de 10-12 GB.
- VRAM en INT4 (AWQ, GPTQ o GGUF Q4_K_M): del orden de 4,5-5,5 GB de pesos, con un presupuesto práctico de 6-8 GB.
- GPU de centro de datos: H100 80 GB, A100 80 GB o 40 GB, L40S 48 GB. El entrenamiento declarado usó 32 GPU H100 repartidas en cuatro nodos de 8 GPU.
- GPU de consumo compatibles: RTX 4090 (24 GB) y RTX 3090 (24 GB) ejecutan el modelo en BF16 sin cuantizar; RTX 4080 (16 GB) y RTX 4060 Ti (16 GB) requieren INT8; tarjetas de 8 GB necesitan cuantización INT4.
- Opciones de despliegue: vLLM y SGLang para servir en BF16 con alta concurrencia; text-generation-inference, ya que el repositorio declara compatibilidad (`text-generation-inference`, `endpoints_compatible`); llama.cpp y Ollama tras convertir los pesos a GGUF, aunque no se publican artefactos GGUF oficiales; LLaMA-Factory para reentrenamiento o ajuste adicional.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición para esta reproducción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos abiertos | Código abierto | Notas |
|---|---|---|---|---|---|---|
| OpenThinker-7B (schwyzquant) | 7,6 B | No especificado (base: 32.768 tokens) | Apache 2.0 | Sí (OpenThoughts-114k) | Sí (LLaMA-Factory) | Reproducción de terceros, sin benchmarks propios ni descargas |
| Bespoke-Stratos-7B | 7 B | No especificado | Apache 2.0 | Sí (17.000 ejemplos) | Sí | Peor rendimiento que OpenThinker-7B en todas las métricas publicadas |
| DeepSeek-R1-Distill-Qwen-7B | 7,6 B | 32.768 tokens | MIT | No | No | Superior a OpenThinker-7B en las siete métricas, pero sin apertura de datos ni código |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Parcial | Parcial | Modelo base; mejor perfil generalista y de tool calling, peor en razonamiento matemático de competición |

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados por el autor de este repositorio (`results: []` en el model-index); las cifras de la tabla proceden del modelo de referencia del proyecto Open Thoughts y no garantizan que esta reproducción alcance el mismo nivel.
- El modelo tiene cero descargas y cero valoraciones en HuggingFace, por lo que no existe validación comunitaria de la calidad de los pesos.
- Al ser un ajuste fino sobre datos de razonamiento destilados de DeepSeek-R1, es probable que el modelo genere cadenas de pensamiento largas de forma sistemática, con el consiguiente coste en tokens de salida y latencia, incluso en consultas simples.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en preguntas factuales abiertas y en dominios poco representados en el dataset de destilación.
- La composición exacta de OpenThoughts-114k condiciona los sesgos del modelo; al derivarse de un profesor propietario, puede heredar sesgos presentes en las trazas de DeepSeek-R1, incluidos sesgos culturales y de idioma.
- El ajuste puede haber degradado capacidades del modelo base no relacionadas con el razonamiento, como el function calling nativo, la adherencia estricta a formatos o la conversación generalista. No hay evaluación que lo confirme o lo descarte.
- Idiomas soportados no declarados: el entrenamiento se realizó sobre un dataset mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto aunque el modelo base sea multilingüe.
- La licencia Apache 2.0 del ajuste no exime de cumplir las condiciones del modelo base Qwen2.5-7B-Instruct (también Apache 2.0) ni de revisar los términos de uso de los datos derivados de DeepSeek-R1 si se va a explotar comercialmente.
- No se publican pesos cuantizados oficiales, por lo que cualquier despliegue en INT4 o GGUF requiere cuantizar el modelo el propio usuario, con la pérdida de precisión asociada.
- Longitud de contexto no declarada en la model card; asumir 32.768 tokens requiere verificar la configuración posicional efectiva de los pesos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schwyzquant/OpenThinker-7B
- Modelo de referencia del proyecto: https://huggingface.co/open-thoughts/OpenThinker-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Paper de OpenThoughts: https://arxiv.org/abs/2506.04178
- Blog de lanzamiento de Open Thoughts: https://www.open-thoughts.ai/blog/launch
- Repositorio de generación de datos: https://github.com/open-thoughts/open-thoughts
- Repositorio de evaluación Evalchemy: https://github.com/mlfoundations/Evalchemy
- Repositorio de entrenamiento LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Modelo Bespoke-Stratos-7B: https://huggingface.co/bespokelabs/Bespoke-Stratos-7B
- Modelo Bespoke-Stratos-32B: https://huggingface.co/bespokelabs/Bespoke-Stratos-32B
- Dataset Bespoke-Stratos-17k: https://huggingface.co/datasets/bespokelabs/Bespoke-Stratos-17k
- Blog de Bespoke-Stratos: https://www.bespokelabs.ai/blog/bespoke-stratos-the-unreasonable-effectiveness-of-reasoning-distillation
- Código de generación de datos de Bespoke-Stratos: https://github.com/bespokelabsai/curator/tree/main/examples/bespoke-stratos-data-generation

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces listados proceden de la model card y de los metadatos de HuggingFace.
