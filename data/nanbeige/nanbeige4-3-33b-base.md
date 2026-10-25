# Nanbeige/Nanbeige4.3-33B-Base

## Resumen

Nanbeige4.3-33B-Base es un modelo de lenguaje de tipo transformer denso con 33.118.977.024 parámetros (33,1B), desarrollado por el equipo Nanbeige (vinculado al dominio kanzhun.com). Se publica como modelo base, es decir, sin ajuste por instrucciones ni alineación conversacional, y está pensado como fundamento para post-entrenamiento: la propia model card lo describe como el "modelo profesor" insignia de la serie Nanbeige4.3, cuya capacidad se destilará posteriormente en modelos más pequeños como Nanbeige4.3-3B.

El problema que aborda es doble. Por un lado, ofrece una alternativa abierta y de coste contenido en la franja de ~30B parámetros para tareas de código y razonamiento STEM, un segmento donde la model card afirma que el único modelo base abierto de frontera publicado en los últimos seis meses es Gemma4-31B-Base. Por otro, sirve de infraestructura de datos: al ser un modelo base fuerte en matemáticas y código, puede generar corpus sintéticos de alta calidad para pipelines de destilación.

La relevancia inmediata reside en su licencia Apache 2.0 (uso comercial sin restricciones de fricción), su encaje en un único nodo de 4 GPU gracias al tamaño de 33B, y sus resultados declarados por el autor, que superan a Gemma4-31B-Base en los ocho benchmarks reportados, con diferencias especialmente amplias en GPQA (62,0 frente a 41,5), SuperGPQA (45,6 frente a 33,8) y CMMLU (86,8 frente a 76,9). No se especifica en la información disponible la longitud de contexto soportada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta `llama` en HuggingFace; requiere `trust_remote_code=True`) |
| Parámetros totales | 33.118.977.024 (33,1B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible como artefacto oficial; solo pesos en safetensors (bf16). Cuantización posible con herramientas estándar (ver sección de hardware) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`; tamaño del repo 66,2 GB, coherente con bf16) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna más allá de la etiqueta `llama` en el repositorio y de la necesidad de cargar el modelo con `trust_remote_code=True` y `use_fast=False` en el tokenizador, lo que implica código de modelado y tokenizador personalizados respecto a la implementación estándar de Transformers. El recuento de 33,1B parámetros y un repositorio de 66,2 GB son consistentes con pesos en bf16 sin cuantizar. No se indica que exista mezcla de expertos, por lo que cabe asumir una arquitectura densa, aunque este punto no se confirma explícitamente en la model card.

Tampoco se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones: al tratarse de un modelo base, es esperable que no incluya alineación, pero no se confirma. La innovación declarada por el autor no es arquitectónica sino estratégica: un modelo profesor de alta capacidad en la franja de 30B que sirva de ancla para destilar capacidades agénticas en modelos pequeños de la misma familia. La model card menciona explícitamente el rendimiento en tareas agénticas y de "cowork" profesional como objetivo de diseño de la serie, si bien las capacidades agénticas se explotan en la variante post-entrenada, no en este checkpoint base.

## Capacidades

- Generación de texto por continuación de secuencia (modelo base, sin plantilla de chat ni modo instruct documentado).
- Razonamiento STEM: 66,9 en MMLU-Pro, 62,0 en GPQA y 45,6 en SuperGPQA según el autor.
- Matemáticas: 92,9 en GSM8K y 57,3 en el benchmark "Math" reportado en la model card.
- Generación de código: 74,6 en MBPP, con especial orientación declarada a tareas de programación compleja.
- Conocimiento general: 85,5 en MMLU.
- Competencia en chino: 86,8 en CMMLU, muy por encima del modelo de referencia de la comparativa.
- Bilingüismo inglés-chino; no se declaran otros idiomas.
- No se documenta soporte nativo de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking": son capacidades que requerirían post-entrenamiento sobre este checkpoint.
- Base adecuada para SFT, DPO/RLHF y destilación, según la propia model card.

## Casos de uso

- Punto de partida para post-entrenamiento de agentes: la model card posiciona explícitamente este checkpoint como base para desarrollar agentes de propósito general o de dominio; el flujo típico sería SFT sobre trayectorias de herramientas y posterior DPO, sin partir de un modelo ya alineado que haya que "desalinear".
- Generación de datos sintéticos para destilación: con 92,9 en GSM8K y 74,6 en MBPP, el modelo puede actuar como profesor que produzca soluciones de matemáticas y código para entrenar los modelos pequeños de la serie (Nanbeige4.3-3B), filtrando por verificación de tests unitarios o comprobación simbólica.
- Asistente de código en pipelines internos tras ajuste: su rendimiento en MBPP y su ventana de despliegue en 4 GPU lo hacen viable como generador de parches o completados dentro de CI/CD, siempre que se añada una fase de instrucción y validación automática de los parches.
- Procesamiento de documentación técnica en chino e inglés: CMMLU de 86,8 y MMLU de 85,5 permiten usarlo como extractor y resumidor de normativa, manuales o contratos en ambos idiomas, con ajuste ligero sobre el dominio concreto.
- Evaluación comparativa y reproducción de benchmarks: como base abierta con resultados publicados frente a Gemma4-31B-Base, sirve de referencia para laboratorios que necesiten un baseline reproducible en la franja de 30B con licencia Apache 2.0.
- Investigación en razonamiento: GPQA de 62,0 en un modelo base de 33B es un punto de partida útil para estudiar técnicas de cadena de pensamiento, decodificación guiada o self-consistency antes de aplicar alineación.
- Fine-tuning vertical para banca o seguros en mercado chino: la combinación de conocimiento general alto y competencia nativa en chino reduce la cantidad de datos de dominio necesarios en la fase de SFT.

## Benchmarks y rendimiento

Resultados reportados por el autor del modelo en la model card. La comparativa se limita a Gemma4-31B-Base, el único modelo que el autor identifica como base abierto de frontera a escala ~30B publicado en los últimos seis meses. No se especifica la configuración de evaluación ni el benchmark exacto etiquetado como "Math".

| Benchmark | Nanbeige4.3-33B-Base | Gemma4-31B-Base | Diferencia |
|---|---|---|---|
| MMLU-Pro | 66,9 | 59,3 | +7,6 |
| GPQA | 62,0 | 41,5 | +20,5 |
| SuperGPQA | 45,6 | 33,8 | +11,8 |
| GSM8K | 92,9 | 88,9 | +4,0 |
| Math | 57,3 | 43,6 | +13,7 |
| MBPP | 74,6 | 72,5 | +2,1 |
| MMLU | 85,5 | 84,2 | +1,3 |
| CMMLU | 86,8 | 76,9 | +9,9 |

No se han publicado en la información disponible resultados de HumanEval, MMLU en versión completa por categorías, ni evaluaciones de contexto largo.

## Requisitos de hardware

- VRAM estimada en bf16: ~66,2 GB solo para pesos, más caché KV. En la práctica requiere al menos 80 GB de VRAM agregada para secuencias cortas y bastante más para lotes grandes o contextos largos.
- Configuración de referencia del autor: los ejemplos de despliegue de la model card usan `--tp-size 4` / `--tensor-parallel-size 4` con `--mem-fraction-static 0.8` / `--gpu-memory-utilization 0.8`, es decir, 4 GPU en paralelo de tensor.
- GPU recomendadas: 4×A100 40 GB, 4×A100 80 GB o 4×H100 80 GB para bf16 con paralelismo de tensor. También es viable 2×H100 80 GB (160 GB agregados) con paralelismo de tensor 2.
- Cuantización FP8: ~33 GB de pesos, cabe en una H100 80 GB o en 2×A100 40 GB.
- Cuantización de 4 bits: ~17-20 GB de pesos, lo que permitiría ejecución en una RTX 4090 (24 GB) o RTX 3090 con llama.cpp, aunque no hay GGUF oficial publicado y habría que generarlo.
- Opciones de despliegue documentadas: Transformers (`AutoModelForCausalLM`), SGLang y vLLM. Compatible con text-generation-inference según las etiquetas del repositorio. llama.cpp/Ollama solo mediante conversión propia a GGUF.
- Latencia y throughput: no disponibles. La model card no publica métricas de tokens por segundo ni de TTFT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento (media de los 8 benchmarks del autor) |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Base | 33,1B denso | No disponible | Apache 2.0 | en, zh | 71,5 |
| Gemma4-31B-Base | ~31B (según denominación) | No disponible | No disponible en la información | No disponible en la información | 62,6 |
| Otros modelos base abiertos de ~30B | No disponible | No disponible | No disponible | No disponible | No disponible |

La media aritmética de los ocho benchmarks reportados es de 71,5 para Nanbeige4.3-33B-Base frente a 62,6 para Gemma4-31B-Base, una ventaja de 8,9 puntos. La información proporcionada no incluye datos de otros modelos comparables de la franja 30B, por lo que no es posible ampliar la comparativa sin recurrir a fuentes externas no verificadas aquí.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones de forma fiable, no tiene plantilla de chat documentada y no debe desplegarse directamente en atención al usuario sin una fase de SFT.
- No se documenta alineación (RLHF/DPO), por lo que la probabilidad de generar contenido inapropiado, tóxico o factualmente incorrecto es mayor que en modelos instruct.
- Riesgo de alucinación inherente a un modelo de 33B sin verificación factual; los benchmarks de conocimiento no garantizan fidelidad en dominios especializados.
- Cobertura lingüística limitada a inglés y chino. No hay evidencia de competencia en castellano; cualquier uso en español requeriría evaluación y probablemente ajuste adicional.
- Longitud de contexto no publicada: no es posible planificar cargas de contexto largo (documentos extensos, repositorios completos) sin medirla empíricamente.
- Los benchmarks son autoinformados por el autor; no se especifican las condiciones de evaluación ni la versión exacta de cada test (el benchmark "Math" no se identifica).
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio: conviene auditar `modeling_*.py` antes de desplegar en entornos regulados.
- Sin cuantizaciones oficiales (GGUF/AWQ/GPTQ) publicadas en la información disponible, el coste de inferencia en hardware de consumo debe asumirse con el trabajo adicional de conversión.
- Licencia Apache 2.0: permite uso comercial y modificaciones sin obligación de compartir derivados, pero no incluye garantías ni indemnización por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Contacto del equipo: nanbeige@kanzhun.com
- Cita recomendada por el autor: `@misc{nanbeige43base2026, title = {Nanbeige4.3-33B-Base}, author = {Nanbeige Team}, year = {2026}, publisher = {Hugging Face}, howpublished = {\url{https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base}}}`

No se han encontrado en la búsqueda web papers, blogs técnicos, repositorios de código ni demos asociados al modelo: los resultados devueltos por la búsqueda no guardan relación con Nanbeige ni con inteligencia artificial, por lo que se han descartado. No se dispone de enlace a informe técnico, artículo o espacio de demostración.
