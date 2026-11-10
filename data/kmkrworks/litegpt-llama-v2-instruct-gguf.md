# kmkrworks/LiteGPT-Llama-V2-Instruct-GGUF

## Resumen

LiteGPT-Llama-V2-Instruct-GGUF es la versión cuantizada en formato GGUF del modelo LiteGPT-Llama-V2-Instruct, un modelo de lenguaje de 201.373.952 parámetros entrenado desde cero por el desarrollador independiente kmkrworks. El modelo emplea una arquitectura transformer densa con 28 capas, dimensión oculta de 768, 12 cabezas de atención y 4 cabezas KV, con una longitud de contexto de 4.096 tokens y un tokenizador BPE byte-level propio de 32.768 tokens.

La relevancia de esta publicación reside en su carácter didáctico y reproducible: el autor documenta públicamente cada paso del proceso de entrenamiento y conversión, y verifica la fidelidad de la cuantización contra el modelo original en PyTorch (perplejidad dentro del +0,02 % para Q8_0 y +3,1 % para Q4_K_M, además de salidas greedy idénticas en 23 prompts de prueba). Está pensado para investigación, aprendizaje y experimentos pequeños de chat o extracción de información, no para producción con usuarios reales sin salvaguardas adicionales.

El repositorio incluye tres archivos GGUF (BF16, Q8_0 y Q4_K_M) compatibles con llama.cpp, LM Studio y las aplicaciones construidas sobre ellos. La licencia es Apache-2.0 para los pesos, con un archivo NOTICE que recoge las atribuciones de Llama 3.1 y Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta `qwen3` en llama.cpp, regla de split `qwen2`) |
| Parametros totales | 201.373.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (pesos, con archivo NOTICE) |
| Formato de pesos | GGUF (llama.cpp build b12084) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 28 capas con anchura de 768, 12 cabezas de atención y 4 cabezas KV (GQA), lo que da un total de 201.373.952 parámetros. Utiliza un tokenizador BPE byte-level propio de 32.768 tokens. En llama.cpp se etiqueta con arquitectura `qwen3` porque V2 emplea el layout de parámetros de Qwen3, y con regla de split `qwen2` porque la regex propia del modelo coincide exactamente con esa regla. La longitud de contexto es de 4.096 tokens.

La model card indica que el modelo fue "construido desde cero, con cada paso registrado", y enlaza al repositorio de GitHub del autor para los resultados, gráficas y registros de ejecución. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card menciona que los datos de entrenamiento y sus atribuciones están en la model card del modelo original (LiteGPT-Llama-V2-Instruct), no en esta ficha de la versión GGUF.

La innovación técnica destacable de esta publicación no está en el modelo en sí, sino en el proceso de cuantización verificado: se comprobó la conversión con llama.cpp build b12084 contra el modelo original en PyTorch, con tokens idénticos en 1.200 documentos de validación, perplejidad del F32 dentro del 0,005 % de PyTorch en 5 dominios de texto y salida greedy idéntica en 23 prompts. Además, llama.cpp reproduce la plantilla de chat almacenada con un solo BOS, para en `<|im_end|>` y dio las mismas respuestas que PyTorch en 10 de 10 conversaciones.

## Capacidades

- Generación de texto conversacional en inglés, con roles `system`, `user` y `assistant` gestionados por la plantilla de chat almacenada en el archivo GGUF.
- Chat multi-turno dentro de una ventana de 4.096 tokens.
- Experimentos de extracción de información (la model card lo cita como uso previsto).
- Compatibilidad con el servidor de chat OpenAI-compatible de llama.cpp (`llama-server --jinja`).
- Integración con LM Studio mediante búsqueda o `lms get`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- Modelo monolingüe: solo inglés.

## Casos de uso

- Aprendizaje y docencia sobre LLM: el modelo sirve para estudiar el ciclo completo de un transformer pequeño (tokenizador propio, entrenamiento desde cero, cuantización y verificación), ya que el autor publica registros y resultados en su repositorio de GitHub.
- Experimentos de chat en local: con Q8_0 (215 MB) o Q4_K_M (127 MB) se puede desplegar un chat funcional en un portátil o incluso en una Raspberry Pi, útil para prototipar interfaces conversacionales sin depender de la nube.
- Extracción de información en textos cortos: la ventana de 4.096 tokens y el formato conversacional permiten usarlo en tareas de extracción estructurada sobre documentos breves, dentro de las limitaciones de un modelo de 201 M de parámetros.
- Pruebas de pipelines de inferencia: al ser compatible con llama.cpp y LM Studio, sirve como modelo de humo para validar integraciones de servidores OpenAI-compatibles, plantillas de chat y cuantizaciones antes de pasar a modelos mayores.
- Evaluación de cuantización: los tres archivos publicados (BF16, Q8_0, Q4_K_M) con sus métricas de perplejidad y velocidad permiten comparar el impacto de la cuantización en un modelo pequeño con datos medidos por el autor.
- Despliegue en hardware muy limitado: la model card estima que todos los archivos caben en una Raspberry Pi 3 con 1 GB de RAM y que el Q8_0 alcanzaría unos 44 tok/s en una Raspberry Pi 5 (estimaciones, no mediciones).
- Investigación sobre tokenizadores BPE byte-level: el tokenizador propio de 32.768 tokens y la advertencia sobre normalización NFC en llama.cpp lo convierten en un caso de estudio para problemas de tokenización con acentos descompuestos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de cuantización y velocidad medidas por el autor:

| Archivo | Tamano | RAM pico | Decodificacion (4 hilos CPU) | Calidad frente a BF16 |
|---|---:|---:|---:|---|
| Q8_0 | 215 MB | 0,35 GiB | 189 tok/s | Perplejidad dentro de +0,02 %: opción por defecto |
| Q4_K_M | 127 MB | 0,35 GiB | 254 tok/s | Perplejidad hasta +3,1 %: el más pequeño |
| BF16 | 404 MB | 0,52 GiB | 109 tok/s | Pesos exactos de V2 |

Las mediciones se realizaron en una CPU de portátil (Intel i9-14900HX, 4 hilos, prompt de 128 tokens; la RAM es la del proceso completo con contexto de 4.096 tokens). Según el autor, Q8_0 decodifica 3,6 veces más rápido y Q4_K_M 4,8 veces más rápido que el original en PyTorch float32 (52,5 tok/s en 1,66 GiB). Estas cifras se midieron sobre los archivos Base, que tienen la misma arquitectura y tamaño.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 0,35 GiB de RAM pico del proceso para Q8_0 y Q4_K_M con contexto de 4.096 tokens; 0,52 GiB para BF16 (medido en CPU, no en GPU).
- GPU recomendadas: no disponible; la model card no documenta despliegue en GPU ni VRAM específica.
- Cabe en GPU consumer: no hay datos medidos, pero por tamaño (127–404 MB) es compatible con cualquier GPU consumer con al menos ~0,5 GB de memoria libre; no confirmado por el autor.
- Cabe en hardware muy limitado: el autor estima que todos los archivos caben en una Raspberry Pi 3 de 1 GB y que Q8_0 alcanzaría unos 44 tok/s en una Raspberry Pi 5 (estimaciones a partir de ejecuciones en portátil y del ancho de banda publicado de la Pi, no mediciones).
- Opciones de despliegue: llama.cpp (`llama-server -hf kmkrworks/LiteGPT-Llama-V2-Instruct-GGUF:Q8_0 --jinja`) y LM Studio (`lms get kmkrworks/LiteGPT-Llama-V2-Instruct-GGUF`). No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: 189 tok/s (Q8_0) y 254 tok/s (Q4_K_M) en decodificación con 4 hilos de CPU en un Intel i9-14900HX; 109 tok/s para BF16.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos en la información proporcionada. A continuación se comparan únicamente los datos objetivos disponibles frente a alternativas de tamaño similar del ecosistema open source, marcando como "no disponible" lo que no se puede verificar:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| LiteGPT-Llama-V2-Instruct-GGUF | 201 M | 4.096 | Apache-2.0 | GGUF | Entrenado desde cero, tokenizador propio, solo inglés |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 | Apache-2.0 | safetensors, GGUF | Multilingüe, ampliamente adoptado; benchmarks no comparados aquí |
| SmolLM2-135M-Instruct | 135 M | 8.192 | Apache-2.0 | safetensors, GGUF | Entrenado por Hugging Face; benchmarks no comparados aquí |
| Llama-3.2-1B-Instruct | 1,24 B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Multilingüe; requiere aceptar la licencia de Meta |

Las cifras de parámetros y contexto de los modelos alternativos son datos públicos de sus respectivas model cards; no se han contrastado resultados de rendimiento porque la información proporcionada no incluye benchmarks comparables.

## Limitaciones y advertencias

- Sin ajuste de seguridad: la model card indica explícitamente que el modelo no tiene safety tuning y que debe añadirse salvaguardas propias antes de ponerlo delante de personas.
- Riesgo de alucinación: con 201 M de parámetros y sin datos de evaluación en benchmarks estándar, la fiabilidad factual es limitada; no es adecuado para tareas que requieran precisión factual alta.
- Contexto corto: 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Monolingüe: solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Tokenización: llama.cpp no aplica normalización Unicode NFC para tokenizadores BPE, por lo que debe normalizarse la entrada con acentos descompuestos antes de enviarla; el texto ordinario no se ve afectado.
- Licencia: los pesos son Apache-2.0, pero la model card incluye un NOTICE con atribuciones a Llama 3.1 (Llama 3.1 Community License, Copyright © Meta Platforms) y Qwen3, y señala que el uso debe seguir la Llama Acceptable Use Policy. Conviene revisar el NOTICE antes de un uso comercial.
- Uso previsto acotado: investigación, aprendizaje y experimentos pequeños de chat o extracción; no está pensado para producción a escala.
- Sin datos de sesgos: la información disponible no documenta evaluaciones de sesgo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario prácticamente inexistentes.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/kmkrworks/LiteGPT-Llama-V2-Instruct-GGUF
- Modelo original: https://huggingface.co/kmkrworks/LiteGPT-Llama-V2-Instruct
- Repositorio GitHub del proyecto: https://github.com/kmkrofficial/LiteGPT
- Resultados de llama.cpp (GGUF): https://github.com/kmkrofficial/LiteGPT/blob/main/docs/results.md#llamacpp-gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- Llama 3.1 Acceptable Use Policy: https://llama.meta.com/llama3_1/use-policy
