# prithivMLmods/CIG-9B-SFT-NVFP4

## Resumen

CIG-9B-SFT-NVFP4 es una compilación cuantizada en NVFP4 del modelo CIG-9B-SFT, un modelo de lenguaje de 9.197.093.888 parámetros derivado de Qwen3.5-9B y ajustado mediante supervisión (SFT) sobre el conjunto de datos CodeImageGen/CIG-SFT-35k. Lo publica el usuario prithivMLmods y su propósito no es generar píxeles directamente, sino transformar instrucciones en lenguaje natural en programas JavaScript que, ejecutados en un navegador Chrome sin interfaz gráfica, producen imágenes. Esta aproximación, denominada generación de imágenes basada en código, traslada la carga visual a un motor de renderizado determinista y deja al modelo la tarea de razonamiento simbólico y composición programática.

La relevancia de esta versión concreta reside en su cuantización. Se ha aplicado GPTQModifier con el esquema NVFP4 de llm-compressor, usando observador de pesos imatrix_mse, tamaño de bloque 128 y fracción de amortiguación 0,01, omitiendo la cuantización de lm_head y de las capas visuales. El resultado son dos fragmentos safetensors de 4,99 GB y 2,97 GB que suman un repositorio de 8,5 GB, frente a los aproximadamente 18 GB que ocuparían los pesos en BF16. El objetivo declarado es preservar una precisión cercana a la de los pesos originales reduciendo memoria y acelerando la inferencia en hardware con soporte nativo de FP4.

El modelo incluye además un módulo auxiliar de predicción multi-token (MTP) de 487 MB que habilita decodificación especulativa, y se distribuye bajo licencia Apache 2.0. Está pensado para despliegues en GPUs NVIDIA Blackwell (SM120, GB202, B200, B300) y se integra con vLLM y text-generation-inference. El autor reporta para el modelo original una puntuación GM de 26,4 y AM de 57,5 en GenEval2, si bien advierte que estas cifras no se han verificado de forma independiente sobre esta compilación NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5_text`), con módulo auxiliar MTP para decodificación especulativa |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en formato FP4 de NVIDIA) mediante GPTQ; existe una build GGUF separada publicada por el mismo autor |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos fragmentos: 4,99 GB + 2,97 GB) más `model_mtp.safetensors` (487 MB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer denso de aproximadamente 9.200 millones de parámetros. Sobre él se aplicó un ajuste supervisado (SFT) utilizando el dataset CodeImageGen/CIG-SFT-35k, complementado con HuggingFaceH4/ultrachat_200k, sin recompensas de aprendizaje por refuerzo. La especialización consiste en mapear descripciones textuales a código JavaScript que, al ejecutarse en un entorno de Chrome headless, dibuja la imagen solicitada. El repositorio incorpora un archivo `model_mtp.safetensors` que implementa predicción multi-token y permite decodificación especulativa, acelerando la generación al proponer varios tokens por paso y validarlos con el modelo principal.

La innovación técnica de esta ficha es la cuantización. Se empleó `GPTQModifier` con esquema NVFP4, calibración basada en imatrix_mse, bloques de 128 elementos y amortiguación del 1 %, excluyendo `lm_head` y las capas cuyo nombre coincide con `.*visual.*`. GPTQ estima los pesos cuantizados minimizando el error de reconstrucción capa a capa con datos de calibración, lo que según el autor estabiliza la compresión a 4 bits y mantiene la precisión cerca de la de los pesos completos. El resultado se empaqueta en formato `nvfp4-pack-quantized` compatible con compressed-tensors.

## Capacidades

- Generación de código JavaScript a partir de descripciones en lenguaje natural, orientada a la creación de gráficos y composiciones visuales mediante APIs de canvas o SVG.
- Generación de imágenes por ejecución de código: el modelo produce el programa, no los píxeles; el renderizado final se delega en Chrome headless.
- Conversación multi-turno, gracias al ajuste sobre ultrachat_200k y a la plantilla de chat incluida (`chat_template.jinja`).
- Decodificación especulativa mediante el módulo MTP, que reduce la latencia de generación.
- Capacidad multimodal declarada en las etiquetas del repositorio, aunque la información disponible no detalla el alcance exacto de la entrada visual.
- Soporte de despliegue en vLLM y text-generation-inference, con etiqueta `endpoints_compatible`.
- Ámbito lingüístico limitado al inglés.

## Casos de uso

- Generación programática de ilustraciones y diagramas: dado un prompt descriptivo, el modelo emite JavaScript que se ejecuta en Chrome headless para producir la imagen final, lo que permite resultados reproducibles y editables a nivel de código.
- Creación de assets para interfaces: generación de iconos, gráficos y visualizaciones simples a partir de especificaciones textuales, integrables en pipelines de diseño automatizado.
- Prototipado de visualizaciones de datos: el modelo puede escribir código de dibujo sobre canvas para representar series o esquemas descritos en lenguaje natural.
- Automatización de contenido gráfico en lote: al ser código, cada salida puede versionarse, auditarse y reejecutarse, lo que encaja en flujos de CI/CD que regeneran imágenes ante cambios de especificación.
- Asistente conversacional especializado en código creativo: su ajuste sobre ultrachat_200k y su plantilla de chat permiten mantener diálogos multi-turno para refinar una composición paso a paso.
- Despliegue de bajo consumo en hardware Blackwell: la cuantización NVFP4 reduce el peso en memoria a unos 8 GB, lo que facilita servir el modelo en GPUs profesionales RTX Pro 6000 o en aceleradores B200/B300 con mayor densidad de peticiones.
- Investigación en generación de imágenes basada en código: sirve como referencia para estudiar cómo un LLM de 9B puede sustituir a modelos de difusión en tareas visuales controlables y deterministas.

## Benchmarks y rendimiento

El autor reporta para el modelo original CIG-9B-SFT las siguientes puntuaciones en GenEval2, sin verificación independiente sobre esta build NVFP4:

| Benchmark | Métrica | Valor reportado |
|---|---|---|
| GenEval2 | GM score | 26,4 |
| GenEval2 | AM score | 57,5 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto en la información disponible, ni mediciones de latencia o throughput específicas de esta compilación cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 8-9 GB para los pesos NVFP4, más memoria para el caché KV y el módulo MTP; el repositorio completo ocupa 8,5 GB.
- GPU recomendadas: NVIDIA Blackwell con soporte nativo de FP4, es decir, RTX Pro 6000 (SM120/GB202), B200 y B300. El formato NVFP4 no se ejecuta de forma eficiente en arquitecturas anteriores.
- GPU de consumo: no se garantiza compatibilidad con RTX 4090 u otras generaciones Ada/Ampere, ya que carecen de instrucciones FP4 nativas; en esas GPUs sería preferible la build GGUF publicada por el mismo autor.
- Opciones de despliegue: vLLM y text-generation-inference (etiquetas del repositorio), con soporte de compressed-tensors; la build GGUF permite llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; se espera mejora frente a BF16 gracias a la cuantización y a la decodificación especulativa MTP, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| CIG-9B-SFT-NVFP4 | 9,2 B | No disponible | NVFP4 (GPTQ) | Apache 2.0 | Generación de imágenes vía código JavaScript |
| CIG-9B-SFT (base) | 9,2 B | No disponible | BF16 | Apache 2.0 | Mismo enfoque, pesos completos |
| CIG-9B-SFT-GGUF | 9,2 B | No disponible | GGUF | Apache 2.0 | Mismo enfoque, para llama.cpp/Ollama |
| Qwen3.5-9B | ~9 B | No disponible | Múltiples | No disponible | LLM generalista del que deriva |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo admite inglés según la etiqueta de idioma; no hay evidencia de soporte multilingüe.
- La generación de imágenes depende de la ejecución correcta del JavaScript en Chrome headless; errores de sintaxis o APIs no disponibles producen fallos de renderizado sin imagen de salida.
- Riesgo de alucinación en el código generado: puede invocar funciones inexistentes o producir composiciones que no corresponden al prompt.
- Las puntuaciones de GenEval2 proceden del modelo original y no se han verificado sobre esta compilación NVFP4; la cuantización a 4 bits puede degradar la calidad.
- La cuantización NVFP4 requiere hardware Blackwell; en GPUs sin soporte FP4 el modelo no es utilizable de forma práctica.
- No se detallan sesgos conocidos ni composición del dataset de calibración más allá de CIG-SFT-35k y ultrachat_200k.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5-9B antes de un uso comercial.
- El repositorio registra cero descargas y una única marca de "me gusta", por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/CIG-9B-SFT-NVFP4
- Modelo base: https://huggingface.co/CodeImageGen/CIG-9B-SFT
- Modelo Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Build GGUF: https://huggingface.co/prithivMLmods/CIG-9B-SFT-GGUF
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset CIG-SFT-35k: https://huggingface.co/datasets/CodeImageGen/CIG-SFT-35k
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Licencia Apache 2.0: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md
