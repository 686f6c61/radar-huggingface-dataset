# Noor-Khan/noor-wiki-v1.0

## Resumen

Noor Wiki v1.0 es un modelo de lenguaje causal (decoder-only) de aproximadamente 25 millones de parámetros entrenado desde cero por Noorullah Zamindar (Noor-Khan). Forma parte de la serie Noor / ARK AI, tras Noor Nano v1.0 (10,5 M, TinyStories) y Noor Mini v1.0 (25,2 M, TinyStories). A diferencia de sus predecesores, este modelo se entrena sobre WikiText-2, un corpus de artículos de Wikipedia en inglés, lo que lo aleja del registro simplificado de TinyStories y lo acerca a texto enciclopédico real.

El modelo emplea una arquitectura transformer estándar con 8 capas, dimensión de modelo 384, 8 cabezas de atención, MLP SwiGLU de 1536, RoPE y pre-LayerNorm, con un vocabulario BPE de 8192 tokens y una longitud de contexto de 512 tokens. El entrenamiento consistió en una única época sobre WikiText-2 con AdamW, programación coseno y precisión bf16, completada en unos dos minutos en una GPU de portátil (RTX 5060 Laptop).

Su relevancia es fundamentalmente educativa y de investigación: sirve como referencia reproducible de cómo se entrena un transformer pequeño de principio a fin, con código, tokenizador y métricas publicadas. No está pensado como chatbot ni como modelo de producción, y sus resultados de perplejidad (475 en validación, 483 en test) reflejan un entrenamiento corto sobre un corpus limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), pre-LayerNorm, RoPE, SwiGLU |
| Parámetros totales | 25.178.880 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 8 bloques. Cada bloque usa pre-LayerNorm, atención causal multi-cabeza con 8 cabezas de dimensión 48 (proyecciones QKV 384 → 1152 y salida 384 → 384) y un MLP SwiGLU con dimensión intermedia 1536 (384 → 1536 → 384), con conexiones residuales. La posición se codifica mediante RoPE con base 10000, sin tabla de embeddings posicionales. El embedding de tokens es de 8192 × 384 (3.145.728 parámetros) y la cabeza LM está desacoplada (untied), también de 384 → 8192 (3.145.728 parámetros). El desglose total verificado es 3.145.728 (embedding) + 3.145.728 (cabeza) + 18.886.656 (8 bloques) + 768 (LayerNorm final) = 25.178.880 parámetros.

El tokenizador es un BPE propio entrenado exclusivamente sobre el texto de entrenamiento de WikiText-2, con vocabulario de 8192, frecuencia mínima 2, pre-tokenizador por espacios y tokens especiales [PAD]=0, [UNK]=1, [BOS]=2, [EOS]=3; el post-procesador añade `[BOS] $A [EOS]`. El entrenamiento parte de inicialización aleatoria (sin fine-tuning ni destilación), usa modelado de lenguaje causal con entropía cruzada sobre bloques empaquetados de 512 tokens con EOS entre textos, AdamW con lr 3e-4, programación coseno, bf16 y 1 época. El conjunto de datos es WikiText-2 (`Salesforce/wikitext`, config `wikitext-2-raw-v1`) con 23.767 textos de entrenamiento, 2.461 de validación y 2.891 de test tras eliminar filas vacías, y 2.713.257 tokens de entrenamiento. La ejecución documentada consta de 165 pasos, ~64.000 tok/s, pico de VRAM de 5,031 GB y un tiempo aproximado de 2 minutos.

## Capacidades

- Generación de texto en inglés con modelado de lenguaje causal de siguiente token.
- Continuación de texto enciclopédico de estilo Wikipedia, dado el dominio de entrenamiento.
- Reproducción completa del pipeline de entrenamiento (tokenizador, entrenamiento, evaluación y exportación) con fines didácticos.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Multilingüismo limitado al inglés; no se documentan capacidades en otros idiomas.
- No tiene ajuste por instrucciones, alineamiento de seguridad ni RLHF.

## Casos de uso

- Docencia y formación en IA: servir como ejemplo reproducible de entrenamiento de un transformer pequeño desde cero, con código, tokenizador y curvas de pérdida documentadas, para explicar cada componente (RoPE, SwiGLU, pre-LayerNorm).
- Experimentación académica con modelos de referencia: usar sus métricas de perplejidad (475,52 en validación; 483,16 en test) como línea base para comparar variantes de arquitectura o de datos en WikiText-2.
- Pruebas de infraestructura de entrenamiento: su reducido tamaño (25 M parámetros, pico de 5,031 GB de VRAM) permite validar pipelines de entrenamiento, exportación a safetensors e inferencia en hardware modesto.
- Generación de texto de dominio restringido: continuaciones de artículos de Wikipedia en inglés para tareas de aumento de datos o demostraciones de completado de texto, asumiendo la baja calidad del modelo.
- Benchmarking de tokenizadores: comparar el BPE de 8192 tokens entrenado sobre WikiText-2 frente a otros tokenizadores en tareas de compresión y cobertura léxica.
- Prototipado de inferencia local: ejecutar el modelo en una GPU de consumo o incluso en CPU para validar flujos de carga de safetensors y decodificación antes de escalar a modelos mayores.
- Estudio de limitaciones de modelos pequeños: analizar empíricamente repetición, incoherencia y alucinación en modelos de 25 M parámetros sin alineamiento, como contraste con modelos ajustados por instrucciones.

## Benchmarks y rendimiento

Resultados de evaluación publicados en la model card (entrenamiento del 2026-11-27, 1 época sobre WikiText-2):

| Split | Loss | Perplejidad |
|---|---|---|
| Validación | 6,1644 | 475,52 |
| Test | 6,1804 | 483,16 |
| Entrenamiento (final) | 6,1798 (loss final de val: 6,1632) | 474,93 (val) |

La pérdida de entrenamiento pasó de 9,0823 a 6,1798 en 165 pasos. La perplejidad aleatoria de referencia con vocabulario 8192 sería 8192. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 25,18 M parámetros; en fp32 ocupa ~100 MB, en fp16/bf16 ~50 MB y en int8 ~25 MB, sin contar activaciones ni KV cache (contexto de 512 tokens).
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre es suficiente; el entrenamiento documentado se realizó en una RTX 4060 (8,59 GB) y una RTX 5060 Laptop GPU con pico de 5,031 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU o CPU.
- Opciones de despliegue: la model card indica carga mediante el código del proyecto (`scripts/inference.py` con checkpoint `.pt`) y pesos en safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible para inferencia; en entrenamiento se documentan ~64.000 tok/s y 165 pasos en ~2 minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noor Wiki v1.0 | 25,18 M | 512 | WikiText-2 (2,7 M tokens) | MIT | Hugging Face |
| Noor Mini v1.0 | 25,2 M | no disponible | TinyStories (~64 M tokens) | no disponible | Hugging Face (serie Noor) |
| Noor Nano v1.0 | 10,5 M | no disponible | TinyStories | no disponible | Hugging Face (serie Noor) |

Frente a Noor Mini v1.0, el mismo tamaño de parámetros pero entrenado sobre TinyStories, Noor Wiki v1.0 afronta un corpus mucho más difícil con muchas menos tokens (2,7 M frente a ~64 M) y 165 pasos frente a 3.967; la model card reporta perplejidad 475 para Wiki v1.0 frente a 6,75 de Mini en TinyStories, diferencia atribuible tanto al dominio como al volumen de entrenamiento. No se dispone de datos de benchmarks estándar para comparar con modelos de la misma categoría fuera de la serie Noor.

## Limitaciones y advertencias

- Conocimiento del mundo y vocabulario muy limitados: solo se entrenó sobre artículos de Wikipedia en inglés.
- La salida puede ser repetitiva, incoherente o sin sentido; no es un chatbot ni sirve para respuestas factuales.
- Sin ajuste por instrucciones, sin alineamiento de seguridad y sin RLHF.
- Solo inglés; no se documenta soporte multilingüe.
- Contexto muy corto (512 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Riesgo elevado de alucinación y de generar afirmaciones falsas con apariencia plausible.
- Sesgos heredados del corpus de Wikipedia (sesgo editorial, de cobertura geográfica y de representación).
- Licencia MIT para los pesos del modelo, pero la model card advierte de que debe verificarse la licencia del dataset WikiText-2 antes de un uso comercial.
- Perplejidad muy alta (475-483) que refleja un entrenamiento corto (1 época, 165 pasos); no apta para producción.
- No se documentan formatos de cuantización ni integración con servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noor-Khan/noor-wiki-v1.0
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Documentación del proyecto (referenciada en la model card): `docs/PROJECT_DOCUMENTATION.md` y `docs/ARCHITECTURE.pdf` en el repositorio del autor
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales relevantes para este modelo.
