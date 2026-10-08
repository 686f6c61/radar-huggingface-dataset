# Ilides/cortex-v0.9-0.1b-mlx

## Resumen

cortex-v0.9-0.1b-mlx es la versión en formato MLX del modelo cortex-v0.9-0.1b, publicado por el usuario Ilides en HuggingFace. Se trata de un modelo de lenguaje pequeño, entrenado desde cero (from scratch), con 126.241.536 parámetros, pensado para generación de texto bilingüe español-inglés y para ejecutarse en Apple Silicon mediante el framework MLX de Apple. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta.

El modelo emplea una arquitectura GPT pre-norm con RMSNorm, activación SwiGLU, atención causal con proyección QKV fusionada, embeddings atados y sin sesgos. Tiene 12 capas, dimensión oculta de 768, 12 cabezas de atención, vocabulario de 16.384 tokens y una longitud de contexto de solo 512 tokens. El entrenamiento se dividió en dos etapas: un pretrain bilingüe de 52.700 pasos en GPU H100 con aproximadamente 280 millones de tokens (53% español / 47% inglés) y un SFT de chat multilingüe de 28.800 pasos con unos 84,7 millones de tokens (50% español / 50% inglés).

Su relevancia es acotada y de nicho: no compite con modelos frontera, sino que sirve como base didáctica o de experimentación para pipelines de entrenamiento bilingües y para inferencia local en ordenadores Mac con memoria unificada, donde un modelo de 126M parámetros en MLX ocupa menos de 300 MB en precisión completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT pre-norm (transformer decoder-only) con RMSNorm, SwiGLU, atención causal con QKV fusionado, embeddings atados y sin sesgos |
| Parámetros totales | 126.241.536 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (el repositorio se distribuye en el formato nativo de MLX; no se documentan variantes cuantizadas ni GGUF) |
| Idiomas soportados | español e inglés (según la model card: pretrain 53% ES / 47% EN, SFT 50% ES / 50% EN) |
| Licencia | Apache 2.0 según la model card del autor; el campo de licencia de los metadatos de HuggingFace figura como no disponible |
| Formato de pesos | MLX (library_name: mlx); tamaño del repositorio 0,5 GB |
| Capas | 12 |
| Dimensión oculta | 768 |
| Cabezas de atención | 12 |
| Tamaño de vocabulario | 16.384 |
| Pipeline declarado | text-generation (según los metadatos de la model card; el campo pipeline del listado de HuggingFace figura como no disponible) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT con normalización previa (pre-norm). Incorpora RMSNorm en lugar de LayerNorm, SwiGLU como función de activación en el bloque feed-forward y atención causal con las proyecciones de query, key y value fusionadas en una sola matriz. Los embeddings de entrada y la cabeza de salida están atados (weight tying) y ninguna capa usa términos de sesgo. Con 12 capas de dimensión 768 y 12 cabezas, la dimensión por cabeza es de 64. Todo esto sitúa al modelo en la familia de los GPT pequeños clásicos (del orden de 100-130M parámetros), no en arquitecturas MoE, SSM ni híbridas.

El entrenamiento consta de dos fases documentadas. La primera es un pretrain bilingüe ejecutado en GPU H100 durante 52.700 pasos sobre aproximadamente 280 millones de tokens, con una composición del 53% en español y 47% en inglés, que alcanzó una pérdida de validación de 2,5543 (perplejidad 12,86). La segunda es un ajuste supervisado (SFT) de chat multilingüe de 28.800 pasos sobre unos 84,7 millones de tokens, con reparto 50/50 entre español e inglés, que bajó la pérdida de validación a 0,1011 (perplejidad 1,106). No se documenta el uso de RLHF, DPO, decodificación especulativa ni técnicas de atención lineal o eficiente; tampoco se detalla la composición exacta de los corpus de pretrain y SFT.

## Capacidades

- Generación de texto en español e inglés, con soporte de conversación multi-turno básica gracias al ajuste SFT de chat.
- Comprensión y generación bilingüe entrenada explícitamente con corpus equilibrados en ambos idiomas.
- Respuestas a instrucciones sencillas y preguntas factuales de baja complejidad, como se deduce del ejemplo de la model card ("Hola, ¿qué es la fotosíntesis?").
- Ejecución de scripts de generación en Python mediante MLX (`generate_mlx.py` con parámetros `--prompt` y `--max-len`).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explícito (thinking mode): no documentado.
- Capacidades de visión, audio o multimodalidad: no documentadas; el modelo es exclusivamente de texto.
- Capacidades de código, matemáticas avanzadas o tareas de razonamiento complejo: no documentadas ni respaldadas por benchmarks públicos.

## Casos de uso

- Prototipado de pipelines de generación de texto en Mac: al ser un modelo MLX de 126M parámetros, se puede cargar y ejecutar en local para validar plantillas de prompting, formateo de chat y tokens especiales antes de escalar a modelos mayores.
- Aplicaciones de escritorio en Apple Silicon con requisitos de huella mínima: un modelo de este tamaño cabe holgadamente en la memoria unificada de cualquier chip de la serie M, lo que permite integrarlo en utilidades de autocompletado o asistentes embebidos sin depender de la nube.
- Investigación en entrenamiento bilingüe español-inglés: el modelo sirve como referencia reproducible de un pipeline completo (pretrain + SFT) con proporciones de corpus documentadas (53/47 y 50/50), útil para estudiar el efecto del equilibrio lingüístico en modelos pequeños.
- Base para experimentos de ajuste fino (fine-tuning) en español: al ser un modelo pequeño con licencia Apache 2.0 declarada, es viable reentrenarlo en dominios verticales concretos (legal, sanitario, atención al cliente) con recursos de GPU modestos.
- Generación de datos sintéticos de bajo coste en español: puede producir borradores de texto corto o ejemplos de clasificación para ampliar datasets, siempre con revisión humana posterior por el riesgo de alucinación de un modelo de 126M.
- Demostraciones educativas de arquitecturas transformer: sus 12 capas, 768 de dimensión y vocabulario de 16.384 tokens lo convierten en un caso de estudio manejable para explicar RMSNorm, SwiGLU y weight tying con código ejecutable.
- Clasificación o etiquetado ligero mediante prompting: tareas de categorización de textos cortos (asunto de un correo, sentimiento de una frase) que quepan dentro de los 512 tokens de contexto y no exijan razonamiento profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta pérdidas de validación y perplejidades de las dos etapas de entrenamiento:

| Etapa | Tokens | Val loss | Perplejidad |
|---|---|---|---|
| Pretrain bilingüe (H100) | ~280M (53% ES / 47% EN) | 2,5543 | 12,86 |
| SFT chat multilingüe | ~84,7M (50% ES / 50% EN) | 0,1011 | 1,106 |

Advertencia: estas cifras proceden de las particiones de validación internas del propio entrenamiento y no son comparables con resultados de benchmarks estandarizados de terceros. La caída de perplejidad de 12,86 a 1,106 entre pretrain y SFT refleja el ajuste al formato de chat del corpus de SFT, no una mejora general de conocimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 126.241.536 parámetros): en FP32, unos 505 MB; en FP16/BF16, unos 252 MB; en INT8, unos 126 MB; en 4 bits, unos 63 MB. A estas cifras hay que sumar el KV cache y el overhead del runtime.
- KV cache estimado (cálculo propio): con 12 capas, 12 cabezas de dimensión 64 y contexto completo de 512 tokens, el cache en FP16 ocupa aproximadamente 18,9 MB, una cifra despreciable frente a modelos de mayor tamaño.
- GPU recomendadas: al ser la variante MLX, el destino natural son los chips de Apple (series M1, M2, M3 y M4) con memoria unificada. El entrenamiento documentado se realizó en H100. En hardware NVIDIA, cualquier GPU con 2 GB o más de VRAM sería suficiente, aunque el repositorio no incluye pesos en formato compatible con CUDA.
- Cabe en GPU de consumo: sí, con enorme margen. Cualquier GPU consumer con más de 1-2 GB de VRAM puede alojar el modelo en FP16, y en Apple Silicon basta un Mac con 8 GB de memoria unificada.
- Opciones de despliegue: MLX (framework nativo de Apple, indicado en la model card mediante `pip install mlx` y el script `generate_mlx.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni la disponibilidad de pesos en GGUF o safetensors.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia de primera token en ninguna configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ilides/cortex-v0.9-0.1b-mlx | 126,2M | 512 tokens | ES, EN | Apache 2.0 según model card (campo HF no disponible) | Solo pesos MLX |
| GPT-2 small | 124M | 1.024 tokens | EN (principalmente) | Licencia modificada de MIT | Pesos en múltiples formatos y ecosistema amplio |
| SmolLM2-135M | 135M | 2.048 tokens | EN (principalmente) | Apache 2.0 | Pesos en safetensors y GGUF, integración en llama.cpp y transformers |

Notas: los datos de GPT-2 small y SmolLM2-135M corresponden a información pública de sus respectivos proyectos; no se dispone de comparaciones de rendimiento directas entre cortex-v0.9-0.1b-mlx y estos modelos porque el autor no ha publicado benchmarks estandarizados. La principal desventaja competitiva de cortex-v0.9-0.1b-mlx es su ventana de contexto de 512 tokens, cuatro veces menor que la de GPT-2 small y SmolLM2-135M, junto con un vocabulario de 16.384 tokens, más reducido que el de los modelos comparados. Su ventaja es el enfoque bilingüe español-inglés explícito y su integración nativa con MLX.

## Limitaciones y advertencias

- Tamaño muy reducido: con 126M parámetros, la capacidad de conocimiento factual, razonamiento y coherencia en textos largos es intrínsecamente limitada; es esperable un volumen alto de alucinaciones en preguntas factuales.
- Contexto de 512 tokens: cualquier caso de uso que requiera documentos extensos, conversaciones largas o recuperación aumentada con múltiples fragmentos queda fuera de su alcance sin truncado agresivo.
- Vocabulario de 16.384 tokens: más pequeño que el de la mayoría de modelos actuales, lo que penaliza la eficiencia de codificación en textos con terminología especializada o caracteres poco frecuentes.
- Sesgos: no disponibles. El autor no publica análisis de sesgos ni la composición detallada de los corpus de entrenamiento, por lo que no es posible evaluar sesgos de género, raza, ideología o nacionalidad. La composición bilingüe ES/EN implica además una cobertura nula de otras lenguas.
- Riesgo de alucinación: elevado y no cuantificado. La perplejidad de validación de 1,106 corresponde al corpus de SFT y no es un indicador de veracidad.
- Idiomas: solo español e inglés según la model card. Cualquier uso en catalán, gallego, euskera u otras lenguas no está soportado.
- Licencia: la model card declara Apache 2.0, lo que permitiría uso comercial, pero el campo de licencia del repositorio en HuggingFace figura como no disponible. Conviene verificar la licencia directamente con el autor antes de un despliegue comercial.
- Ausencia de soporte de tool calling, agentes y multimodalidad: no hay documentación que acredite estas capacidades, por lo que no deben asumirse en producción.
- Madurez y adopción: 0 descargas y 0 likes en el momento de la consulta, repositorio de 0,5 GB con pesos únicamente en formato MLX y sin resultados de benchmarks de terceros. El soporte comunitario y la validación externa son inexistentes.
- Fechas de creación y actualización del repositorio (2026-10-08) y etiquetas (`custom_code`, `region:us`): se recomienda revisar el código personalizado incluido (`generate_mlx.py` y cualquier módulo con `custom_code`) antes de ejecutarlo en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ilides/cortex-v0.9-0.1b-mlx
- MLX (framework de aprendizaje automático de Apple), Wikipedia: https://en.wikipedia.org/wiki/MLX_(machine_learning_framework)
- Introducción a MLX, Apple's Machine Learning Framework (Medium): https://medium.com/lolml/introduction-to-mlx-apples-machine-learning-framework-527b81f23fa5
- OpenAI Codex (language model), Wikipedia: https://en.wikipedia.org/wiki/OpenAI_Codex_(language_model) (referencia general sobre modelos de lenguaje, no relacionada con este modelo)
- stabilityai/stable-diffusion-xl-base-0.9: https://huggingface.co/stabilityai/stable-diffusion-xl-base-0.9 (no relacionado con este modelo)
- Cortex AI IDE: https://cortex-ide.app/download/ (producto independiente, sin relación con el modelo Ilides/cortex-v0.9-0.1b-mlx)

No se han encontrado en la búsqueda web artículos, papers, blogs ni demos específicos sobre Ilides/cortex-v0.9-0.1b-mlx.
