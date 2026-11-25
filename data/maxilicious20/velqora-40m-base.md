# Maxilicious20/Velqora-40M-Base

## Resumen

Velqora-40M-Base es un modelo de lenguaje causal (decoder-only) de 41.957.387 parámetros (~41,96 M) entrenado desde inicialización aleatoria por el desarrollador independiente Maxilicious20. Se trata de un checkpoint base (pretrained), sin ajuste por instrucciones, orientado a investigación sobre modelos ultrapequeños y a experimentación con inferencia local en hardware de consumo. Su relevancia radica en que reproduce un stack arquitectónico moderno (GQA, QK-Norm, value residuals, SwiGLU, RoPE, RMSNorm) a una escala que cabe holgadamente en una única GPU de 8 GB.

El entrenamiento se realizó íntegramente en una NVIDIA GeForce RTX 4060 de 8 GB bajo Windows 11, lo que lo convierte en un caso de estudio de entrenamiento from-scratch en hardware de gama media. Emplea una arquitectura transformer de 12 capas, dimensión oculta 512, feed-forward de 1.536 con SwiGLU, 8 cabezas de consulta y 4 de clave-valor (GQA), y una ventana de contexto máxima de 2.048 tokens. El tokenizador es un BPE byte-level propio de 8.192 tokens, con embeddings de entrada y salida atados.

La licencia Apache-2.0 permite uso comercial, pero sus capacidades reales están muy limitadas por el tamaño y el volumen de datos: es un modelo en inglés, sin alineación, propenso a alucinaciones y errores aritméticos. Su interés es educativo y de investigación, no de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (implementación propia en PyTorch) |
| Parametros totales | 41.957.387 (~41,96 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible en la model card; existe repositorio GGUF companion (cuantizaciones concretas no especificadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y checkpoints PyTorch (.pt) |

Detalles adicionales de arquitectura: 12 capas, hidden size 512, feed-forward 1.536 con SwiGLU, 8 cabezas de consulta / 4 de clave-valor (GQA), QK-Norm, value residuals en la capa 0, RoPE con base θ = 30.000, RMSNorm, embeddings atados, tokenizador BPE byte-level de 8.192 tokens. Mejor pérdida de validación: 2,8360. Implementación con `scaled_dot_product_attention` y `bfloat16`.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal estándar, pero incorpora varias técnicas modernas poco habituales a esta escala: grouped-query attention (8 cabezas de consulta frente a 4 de clave-valor), QK-Norm para estabilizar la atención, value residuals aplicados en la capa 0, SwiGLU en el feed-forward, RoPE con base 30.000 y RMSNorm. Los embeddings de entrada y salida están atados, lo que reduce el recuento de parámetros. La implementación es propia (`velqora/model.py`) y no usa `AutoModelForCausalLM`, por lo que requiere cargar el código del repositorio.

El entrenamiento partió de inicialización aleatoria (sin pesos preentrenados) mediante predicción del siguiente token. El corpus se compone de `HuggingFaceTB/cosmopedia-100k` (45 %), `HuggingFaceFW/fineweb-edu` (35 %) y `roneneldan/TinyStories` (20 %), con un currículo de escalado progresivo de la longitud de contexto. No se menciona en la información disponible el número total de tokens vistos, ni fases de RLHF, DPO o SFT; el modelo se distribuye como base sin alinear.

## Capacidades

- Generación de texto por continuación de prompt en inglés, hasta 2.048 tokens de contexto.
- Razonamiento básico y coherencia local en textos cortos, favorecido por la mezcla con TinyStories.
- No dispone de modo de razonamiento explícito (thinking), visión, audio ni otras modalidades.
- No soporta tool calling ni function calling de forma nativa (es un modelo base sin alineación).
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe muy limitada: entrenado y declarado únicamente para inglés.
- Capacidad aritmética y de conocimiento factual muy restringida por tamaño y datos.

## Casos de uso

- Investigación sobre modelos ultrapequeños: sirve como baseline reproducible para estudiar el efecto de GQA, QK-Norm o value residuals en modelos de ~42 M de parámetros.
- Estudio educativo de componentes de transformer: permite inspeccionar implementaciones didácticas de RoPE, SwiGLU y RMSNorm en un modelo que cabe en una GPU de consumo.
- Experimentación de inferencia en el borde (edge): con ~42 M de parámetros puede ejecutarse en CPU o en GPUs integradas para probar pipelines de despliegue local.
- Generación de texto creativo muy corto y continuaciones de estilo narrativo simple, aprovechando la proporción de TinyStories del corpus.
- Pruebas de tokenizadores y pipelines de preprocesado: su tokenizador BPE propio de 8.192 tokens sirve para validar flujos de tokenización y evaluación de perplejidad.
- Benchmarking de herramientas de despliegue (llama.cpp, Ollama, vLLM) en modelos mínimos, midiendo latencia y sobrecarga de arranque antes de escalar a modelos mayores.
- Fine-tuning educativo: punto de partida barato para demostrar SFT o LoRA en un modelo pequeño con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la mejor pérdida de validación (2,8360) durante el preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los ~41,96 M de parámetros ocupan aproximadamente 84 MB de pesos; con overhead de activaciones y contexto de 2.048 tokens, el consumo se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo se entrenó en una RTX 4060 de 8 GB y se ejecuta sin problemas en GPUs de gama baja (GTX 1050, RTX 3050, integradas modernas).
- Cabe en cualquier GPU de consumo actual y también en CPU para inferencia interactiva.
- Opciones de despliegue: script propio `run_inference.py` con PyTorch y safetensors; el repositorio GGUF companion permite su uso con llama.cpp u Ollama (no se especifican las cuantizaciones disponibles).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU, sin datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Velqora-40M-Base | ~41,96 M | 2.048 | inglés | Apache-2.0 | From-scratch, arquitectura propia, sin alinear |
| SmolLM-135M | ~135 M | 2.048 | inglés/multilingüe | Apache-2.0 | Entrenado con más datos y alineado; mayor capacidad |
| TinyLlama-1.1B | ~1,1 B | 2.048 | inglés | Apache-2.0 | Escala muy superior, mayor calidad de generación |
| GPT-2 small | ~124 M | 1.024 | inglés | MIT | Referencia clásica de modelo pequeño |

La comparación debe interpretarse con cautela: Velqora-40M-Base es sustancialmente menor que las alternativas citadas y no se han publicado benchmarks que permitan comparar rendimiento de forma objetiva. Los datos de los modelos alternativos corresponden a sus especificaciones públicas conocidas.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre cosmopedia-100k, fineweb-edu y TinyStories, puede heredar sesgos de esos corpus, sin que se haya documentado un análisis específico.
- Riesgo alto de alucinación: con ~42 M de parámetros y sin alineación, es probable que invente hechos, fechas y entidades.
- Errores aritméticos y de razonamiento complejo frecuentes; no apto para tareas que requieran precisión.
- Ventana de contexto limitada a 2.048 tokens y únicamente en inglés; el rendimiento fuera del inglés será deficiente.
- Es un modelo base sin instrucciones: no responde bien a formatos de chat ni a instrucciones directas; requiere prompting como continuación de texto.
- No debe usarse en ámbitos médicos, legales, financieros ni de seguridad crítica, tal como advierte el propio autor.
- La licencia Apache-2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en producción real más allá de experimentación.
- Requiere cargar código propio del repositorio (`velqora/model.py`), lo que añade riesgo de seguridad y mantenimiento frente a modelos compatibles con `AutoModelForCausalLM`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maxilicious20/Velqora-40M-Base
- Repositorio GGUF companion: https://huggingface.co/Maxilicious20/Velqora-40M-Base-GGUF
- Perfil del autor: https://huggingface.co/Maxilicious20
- Dataset cosmopedia-100k: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-100k
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
