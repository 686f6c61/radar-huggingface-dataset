# neovalle/H4rmoniousQwen3-8B

## Resumen

H4rmoniousQwen3-8B es un ajuste fino (post-entrenamiento) del modelo Qwen/Qwen3-8B desarrollado por el usuario neovalle. Su objetivo es internalizar en los pesos del modelo la ecolingüística de Arran Stibbe (nueve estructuras cognitivas), las econarrativas biofísicas y la ecosofía H4rmony ("Living!"), de modo que el modelo adopte ese marco conceptual sin necesidad de un system prompt especializado ni de flags de enrutamiento en inferencia.

El modelo parte de la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros totales (aproximadamente 8,2 mil millones) y pesos en safetensors con un tamaño de repositorio de 16,4 GB. El entrenamiento se realizó en dos etapas: un SFT con LoRA (r=32, alpha=64 sobre todas las capas lineales) y un DPO posterior con LoRA (r=16, alpha=32, beta=0,10, lr=1e-5) para suprimir respuestas de sesgo ecomodernista y antropocéntrico.

Es relevante para desarrolladores e investigadores interesados en alineación de valores no convencionales, análisis crítico del discurso asistido por IA y aplicaciones de humanidades ambientales, ya que demuestra un pipeline reproducible de SFT + DPO para instalar una ecosofía concreta en un modelo de propósito general manteniendo, según el autor, razonamiento y capacidad de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-8B en BF16. Sobre esa base se aplicó un post-entrenamiento en dos fases con adaptadores LoRA. La fase 1 (SFT) usó LoRA con r=32, alpha=64 sobre todas las capas lineales, entrenado con el dataset neovalle/h4rmony2.0-sft mezclado con un 20 % de replay de instrucciones generales (HuggingFaceH4/ultrachat_200k) y con aleatorización de system prompt (40 % de prompts de usuario desnudos, 60 % con cabeceras genéricas). La fase 2 (DPO) usó LoRA con r=16, alpha=32, beta=0,10 y lr=1e-5 sobre neovalle/h4rmony2.0-dpo, alcanzando un 83,8 % de precisión en preferencias de validación.

La innovación principal no es arquitectónica sino de alineación: el objetivo es que el marco ecolingüístico y la ecosofía H4rmony queden codificados en los pesos, eliminando la dependencia de un system prompt en tiempo de inferencia. El DPO se emplea específicamente para suprimir los valores por defecto ecomodernistas y antropocéntricos del modelo base, preservando al mismo tiempo razonamiento general y capacidad de código. El tokenizador soporta el flag `enable_thinking` en la plantilla de chat, lo que indica compatibilidad con el modo de razonamiento de Qwen3.

## Capacidades

- Generación de texto conversacional en inglés con el marco ecolingüístico y la ecosofía H4rmony internalizados.
- Análisis crítico del lenguaje: identificación de estructuras cognitivas de Stibbe en citas y discursos.
- Razonamiento general preservado mediante el replay de instrucciones generales durante el SFT.
- Capacidad de código y razonamiento heredada de Qwen3-8B, según declara el autor (sin benchmarks publicados).
- Modo de pensamiento (thinking) activable mediante `enable_thinking=True` en la plantilla de chat.
- Generación de econarrativas biofísicas alineadas con la ecosofía "Living!".
- Uso sin system prompt especializado: la alineación opera directamente desde los pesos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés.

## Casos de uso

- Análisis crítico del discurso ambiental: el modelo puede examinar comunicados corporativos o textos políticos e identificar estructuras cognitivas de Stibbe (framing, metáforas, evaluación), aprovechando que el marco está en los pesos y no requiere instrucciones adicionales.
- Investigación en humanidades ambientales: útil para generar y contrastar econarrativas biofísicas en estudios de ecolingüística, con la ecosofía H4rmony como criterio de alineación consistente entre ejecuciones.
- Auditoría de lenguaje corporativo: integrable en pipelines que revisen informes de sostenibilidad para detectar ecomodernismo o antropocentrismo, gracias al DPO que suprime esos valores por defecto.
- Educación y divulgación ecológica: generación de materiales didácticos en inglés que reformulen conceptos de economía ecológica con el marco "Living!", sin necesidad de prompts de sistema complejos.
- Asistencia a la escritura con valores explícitos: redacción de artículos y ensayos donde se requiera una postura ecosófica coherente y verificable, al estar la alineación fijada en los pesos.
- Investigación en alineación de valores: el par de datasets SFT/DPO y el pipeline LoRA en dos etapas sirven como caso de estudio reproducible para instalar marcos ideológicos concretos en modelos de 8B y medir su persistencia.
- Prototipado de chatbots temáticos: despliegue de asistentes especializados en ecolingüística sin ingeniería de prompts, simplificando la capa de orquestación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la precisión de preferencias del DPO en validación: 83,8 %.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos; a 4 bits: en torno a 4-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 y en GPUs de 12-16 GB si se cuantiza, aunque no se ofrecen pesos GGUF oficiales.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y en general cualquier runtime compatible con safetensors; no se documentan integraciones con llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| H4rmoniousQwen3-8B | 8,19 B | no disponible | apache-2.0 | Alineación ecolingüística (SFT + DPO sobre Qwen3-8B) |
| Qwen/Qwen3-8B | 8,2 B (aprox.) | no disponible en esta ficha | apache-2.0 | Modelo base generalista con modo thinking |
| Alternativas de alineación temática de 7-8B | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con el modelo base no es posible porque no se han publicado benchmarks del ajuste. La diferencia principal frente a Qwen3-8B es la alineación de valores internalizada y la ausencia de dependencia de system prompt; el resto de capacidades se heredan del base.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el comportamiento en castellano u otros idiomas no está documentado.
- La alineación ideológica explícita puede introducir sesgo direccional en temas ambientales y económicos; no es un modelo neutral.
- Riesgo de alucinación inherente a los modelos de 8B, no evaluado en la información disponible.
- No se han publicado benchmarks de razonamiento, código o matemáticas que confirmen la preservación de capacidades tras el DPO.
- La longitud de contexto no se especifica en la información proporcionada; conviene verificar la del modelo base antes de usarlo en tareas de contexto largo.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación sobre comportamiento en producción.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.
- El flag `enable_thinking` requiere que el tokenizador y la plantilla de chat se usen correctamente; un uso incorrecto puede degradar la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neovalle/H4rmoniousQwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset SFT: https://huggingface.co/datasets/neovalle/h4rmony2.0-sft
- Dataset DPO: https://huggingface.co/datasets/neovalle/h4rmony2.0-dpo
- Dataset de replay: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.
