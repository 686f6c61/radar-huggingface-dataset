# rrchat/Mercury-Acad-1.7B-GGUF

## Resumen

Mercury-Acad-1.7B-GGUF es la versión cuantizada en formato GGUF de Mercury-Acad-1.7B, un modelo de razonamiento STEM ultra-rápido orientado a móviles y dispositivos edge, desarrollado por rrchat (rrlabs-ai). El modelo es un fine-tuning sobre LiquidAI/LFM3-VL-2B, un modelo multimodal de Liquid AI que combina unos 1,7 mil millones de parámetros de lenguaje con un codificador de visión SigLIP. Su objetivo es dotar de razonamiento paso a paso sistemático a un modelo ligero, con trazas de pensamiento explícitas delimitadas por etiquetas `<think>...</think>`.

Su relevancia radica en la combinación de un tamaño muy reducido (1,73 mil millones de parámetros), capacidades multimodales (imagen-texto a texto), soporte de tool calling y un rendimiento destacado en código y matemáticas dentro de su categoría: +29,9 % sobre el modelo base en HumanEval+ en modo thinking y +9,6 % en GSM8K. Es especialmente útil para despliegues locales donde la latencia y la VRAM son restricciones críticas, alcanzando velocidades de 180-210 tokens/segundo en una RTX 3060 según el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Model 3): híbrido con convoluciones depthwise cortas (kernel 7) y gated linear attention |
| Parametros totales | 1.728.801.536 (incluye codificador de visión SigLIP) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, F16 (además del proyector de visión mmproj en F16) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (versión original en safetensors/PyTorch en rrchat/Mercury-Acad-1.7B) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura híbrida LFM3 de Liquid AI, que combina tres componentes destacables: convoluciones causales 1D depthwise con kernel de tamaño 7 en las capas tempranas para agregación de contexto local con huella de memoria constante; atención lineal multi-cabeza modulada con puertas sigmoides aprendidas (`attn_gate`); y normalizaciones LayerNorm post-atención y post-FFN (`attn_post_norm`, `ffn_post_norm`). Esta combinación permite inferencia muy rápida y eficiente en memoria, adecuada para edge y móvil.

Sobre el entrenamiento, el autor indica que el fine-tuning desbloqueó el razonamiento paso a paso dentro de trazas `<think>...</think>` partiendo del modelo base LFM3-VL-2B, con mejoras notables en síntesis de código algorítmico y razonamiento matemático. El modelo no amplía el conocimiento enciclopédico del base (limitado por su preentrenamiento), sino que mejora la ejecución cognitiva: lógica paso a paso, verificación de código, demostraciones matemáticas y ejecución de herramientas. No se han publicado detalles sobre el número de tokens, composición del dataset ni uso de RLHF/DPO. Ofrece dos modos de razonamiento: thinking mode (por defecto, prefill de `<think>\n`) e instant mode (prefill de `<think></think>` para respuestas directas de latencia mínima).

## Capacidades

- Generación de texto conversacional con trazas de razonamiento explícitas (`<think>...</think>`) o respuestas directas en instant mode
- Razonamiento matemático multi-paso: aritmética (GSM8K), derivaciones algebraicas rápidas y demostraciones matemáticas (MATH-500)
- Generación y verificación de código Python algorítmico (HumanEval+ 51,8 % en modo thinking)
- Tool calling / function calling robusto: paridad con el modelo base en BFCL V3 Simple (99,7 %)
- Capacidades multimodales: entrada de imagen y texto (image-text-to-text) mediante codificador SigLIP con proyector mmproj incluido
- Capacidades de agente y uso de herramientas multi-paso (tags de agente y tool-use)
- Razonamiento matemático multilingüe, con resultados destacados en ruso (MGSM ruso 45,2 %)
- Seguimiento estricto de instrucciones y restricciones negativas (IFEval ~72 %)
- Diseñado para despliegue en móvil y edge con llama.cpp

## Casos de uso

- Asistentes matemáticos educativos en dispositivos locales: el modo thinking genera derivaciones paso a paso con solo 1,1 GB en Q4_K_M, ideal para apps de estudio offline de matemáticas y STEM en ruso e inglés
- Generación de código Python algorítmico en local: con 51,8 % en HumanEval+ en modo thinking, es adecuado para autocompletado y resolución de ejercicios de programación en portátiles sin GPU dedicada de gama alta
- Agentes locales con tool calling: su 99,7 % en BFCL V3 Simple y el soporte de function calling permiten construir agentes que invocan herramientas (búsqueda, APIs locales) sin depender de la nube
- Análisis de imágenes con razonamiento en edge: el codificador SigLIP y el proyector mmproj permiten describir y razonar sobre imágenes desde aplicaciones móviles o embebidas
- Chatbots de bajo consumo en móvil: el modo instant mode ofrece respuestas directas de latencia mínima para interacciones conversacionales rápidas
- Razonamiento matemático en ruso: con 45,2 % en MGSM ruso, es útil para aplicaciones educativas y de resolución de problemas en idioma ruso
- Prototipado de pipelines de razonamiento: la doble modalidad thinking/instant permite comparar trade-offs de calidad frente a latencia en producción

## Benchmarks y rendimiento

Datos publicados por el autor, evaluados localmente en condiciones idénticas (decodificación determinística):

| Benchmark | Modo | Base (LFM3-VL-2B) | Mercury-1.7B | Mercury-Acad-1.7B | Delta vs. Base |
|---|---|---|---|---|---|
| HumanEval+ (164 tareas) | Thinking | 21,9 % | 23,2 % | 51,8 % | +29,9 % |
| GSM8K (500 problemas) | Thinking | 58,2 % | 63,2 % | 67,8 % | +9,6 % |
| MGSM Ruso (250 problemas) | Thinking | 39,2 % | 36,8 % | 45,2 % | +6,0 % |
| MATH-500 (Nivel 1-3) | Instant | 73,5 % | 43,3 % | 51,7 % | -21,9 % |
| MATH-500 (Nivel 1-3) | Thinking | 64,3 % | 47,1 % | 51,3 % | -13,0 % |
| BFCL V3 Simple (Tools) | Thinking | 99,7 % | 90,7 % | 99,7 % | Paridad |
| MMLU-Redux (300 tareas) | Instant | 24,0 % | 40,7 % | 42,7 % | +18,7 % |
| IFEval (541 instrucciones) | Instant | 73,3 % | 72,6 % | 71,8 % | Paridad (~72 %) |
| Identity Alignment | Thinking | 90,0 % | 83,0 % | 95,0 % | +5,0 % |

Cabe señalar que en MATH-500 el modelo rinde peor que el base (hasta -21,9 % en modo instant), lo que sugiere un trade-off del fine-tuning en ese dominio concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (según el autor):
  - Q4_K_M (1,10 GB): ~2-4 GB de VRAM
  - Q5_K_M (1,26 GB): ~4 GB
  - Q8_0 (1,85 GB): ~6 GB
  - F16 (3,47 GB): 8 GB o más
  - Proyector de visión mmproj F16 (378 MB): ~500 MB adicionales
- GPU recomendadas: no disponible de forma explícita; el autor reporta 180-210 tokens/segundo con Q4_K_M en una NVIDIA RTX 3060
- Consumer GPUs: sí, cabe con holgura en GPUs de consumo; cualquier GPU con 4 GB de VRAM (por ejemplo RTX 3060, RTX 4060) ejecuta la variante recomendada Q4_K_M, e incluso es viable en CPU o iGPU dado el tamaño reducido
- Despliegue: llama.cpp (requerido un build con soporte de convolución SSM kernel 7 en `ggml-cuda/ssm-conv.cu` y operadores nativos LFM2/LFM3 en `models/lfm2.cpp`), LM Studio (con plantilla Jinja embebida para thinking mode); Ollama y vLLM no se mencionan en la información disponible
- Latencia y throughput: ~180-210 tokens/segundo en RTX 3060 con Q4_K_M según el autor; otras configuraciones no disponibles

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Fortaleza principal |
|---|---|---|---|---|---|
| Mercury-Acad-1.7B (este) | 1,73 B | no disponible | Sí (SigLIP) | Apache 2.0 | Razonamiento STEM y tool calling en edge |
| LiquidAI/LFM3-VL-2B (base) | ~2 B | no disponible | Sí (SigLIP) | Apache 2.0 (según model card del base) | Conocimiento base, MATH-500 instant superior (73,5 %) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 K (dato público) | No | Apache 2.0 / Qwen license | Generalista multilingüe |

Nota: la comparativa con Qwen2.5 se ofrece como referencia de categoría; no se han publicado benchmarks comparativos directos entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Conocimiento enciclopédico limitado: el fine-tuning no amplía la recuperación de conocimiento factual del base, acotada por la escala del preentrenamiento; no es adecuado como fuente de trivia o conocimiento general
- Rendimiento inferior al base en MATH-500 (hasta -21,9 % en modo instant), un retroceso relevante en derivaciones algebraicas de alta velocidad
- Riesgo de alucinación: no disponible datos específicos, pero como modelo de 1,7 B debe asumirse riesgo elevado en tareas factuales
- Idiomas limitados a ruso e inglés; el castellano no está entre los idiomas declarados
- Longitud de contexto no publicada, lo que impide evaluar su idoneidad para documentos largos
- Compatibilidad crítica con llama.cpp: builds legacy sin soporte de kernel 7 SSM ni operadores LFM2/LFM3 no funcionarán; es necesario compilar o descargar una versión actualizada
- Los benchmarks son auto-evaluados por el autor en condiciones locales, no auditorados por terceros
- Licencia Apache 2.0: sin restricciones de uso comercial relevantes, aunque conviene revisar los términos del modelo base de Liquid AI
- Sesgos conocidos: no disponible

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/rrchat/Mercury-Acad-1.7B-GGUF
- Modelo completo sin cuantizar (safetensors): https://huggingface.co/rrchat/Mercury-Acad-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
