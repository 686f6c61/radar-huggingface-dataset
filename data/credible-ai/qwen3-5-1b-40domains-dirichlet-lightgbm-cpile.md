# credible-ai/qwen3.5-1B-40domains-dirichlet-lightgbm-cpile

## Resumen

El modelo `qwen3.5-1B-40domains-dirichlet-lightgbm-cpile` es un artefacto de investigación publicado por credible-ai para reproducir los experimentos del artículo LinMix (arXiv:2610.37390). Se trata de un modelo de lenguaje de 1.330.059.520 parámetros entrenado desde cero sobre 32.000 millones de tokens, con una arquitectura tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 16 capas y un tamaño de representación oculta de 2048. No es un modelo de propósito general: su función es servir como punto de control en estudios de mezcla de datos (data mixing).

El interés técnico reside en el proceso de construcción del corpus de entrenamiento. Los datos provienen de tres fuentes (WebOrganizer/Corpus-200B, Stack-Edu y Nemotron-CC-Math) y se organizan en 40 dominios: 24 temas de WebOrganizer, 15 lenguajes de programación y matemáticas. Los pesos de mezcla entre dominios se optimizan mediante RegMix, usando un surrogate LightGBM ajustado sobre un enjambre de muestras Dirichlet, con el objetivo de minimizar bits por byte sobre texto de validación del Common Pile.

El modelo se publica bajo licencia MIT y en formato safetensors, con un tokenizador GPT-NeoX-20B de vocabulario 50.432. Está pensado para investigadores que quieran replicar el pipeline LinMix o analizar cómo la atribución lineal de dominios afecta a la mezcla final de datos de preentrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5-like (`Qwen3_5ForCausalLM`), transformer decoder-only, 16 capas, hidden size 2048 |
| Parámetros totales | 1.330.059.520 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only compatible con la familia Qwen3.5, implementada en `Qwen3_5ForCausalLM` y que requiere transformers >= 5.2. Consta de 16 capas con tamaño oculto de 2048, lo que da lugar a los 1,33 mil millones de parámetros. Se entrenó desde cero, no mediante fine-tuning de un modelo existente, utilizando OLMo-core como framework de entrenamiento y 32.000 millones de tokens. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 entradas.

La innovación principal no está en la arquitectura sino en la metodología de mezcla de datos. El corpus se divide en 40 dominios (24 temas de WebOrganizer, 15 lenguajes de programación y matemáticas) y los pesos de muestreo se optimizan con RegMix: se ajusta un surrogate LightGBM sobre un enjambre de mezclas Dirichlet generadas con un proxy de 100M parámetros, y se selecciona la mezcla que minimiza bits por byte en texto retenido del Common Pile. El repositorio incluye un archivo `mix.json` con la mezcla final de datos. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de un preentrenamiento estándar sobre corpus web, código y matemáticas.
- Cobertura de 15 lenguajes de programación gracias a los subconjuntos de Stack-Edu incluidos en la mezcla.
- Exposición a contenido matemático procedente del subconjunto 4plus de Nemotron-CC-Math.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Reproducción de experimentos LinMix: el modelo sirve como punto de control para validar la metodología de atribución lineal de dominios y comparar mezclas de datos bajo las mismas condiciones de entrenamiento.
- Estudio de mezcla de datos (data mixing): investigadores pueden entrenar variantes con distintas mezclas y usar este checkpoint como referencia para medir el efecto de los pesos optimizados por RegMix sobre bits por byte.
- Análisis de sesgo por dominio: al conocer la composición exacta del corpus (24 temas web, 15 lenguajes, matemáticas), se puede estudiar cómo la proporción de cada dominio afecta al comportamiento del modelo en tareas específicas.
- Evaluación de proxies pequeños: el modelo de 100M usado como enjambre Dirichlet puede compararse con este de 1B para estudiar la fidelidad de las predicciones del surrogate LightGBM a mayor escala.
- Investigación sobre tokenizadores alternativos: al usar GPT-NeoX-20B en lugar del tokenizador nativo de Qwen, permite analizar el impacto del tokenizador en modelos con arquitectura Qwen3.5.
- Docencia y experimentación académica: su tamaño (2,7 GB en bfloat16) y licencia MIT facilitan su uso en entornos con recursos limitados para estudiar pipelines de preentrenamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,4 GB para pesos; en 4 bits, alrededor de 0,7 GB (las cuantizaciones no están publicadas por el autor, pero son viables con herramientas estándar).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) es suficiente en bfloat16 o cuantizado; A100 y H100 no son necesarias para inferencia.
- Cabe en GPU consumer: sí, en toda la gama media y alta reciente.
- Opciones de despliegue: transformers (requiere >= 5.2 por `Qwen3_5ForCausalLM`), vLLM y TGI si soportan la arquitectura, llama.cpp y Ollama previa conversión a GGUF (no publicada).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| credible-ai/qwen3.5-1B-40domains-dirichlet-lightgbm-cpile | 1,33B | no disponible | MIT | Artefacto de investigación para LinMix |
| credible-ai/qwen3.5-100M-40domains-dirichlet | ~100M | no disponible | no disponible | Proxy para el enjambre Dirichlet de LinMix |
| Qwen3.5 base (1B, referencia de arquitectura) | ~1B | no disponible | no disponible | Modelo de propósito general |
| Modelos de mezcla de datos comparables (p. ej. variantes RegMix/DoReMi) | variable | variable | variable | Investigación sobre data mixing |

La comparación directa con modelos de propósito general no es significativa: este checkpoint está diseñado para reproducir experimentos, no para competir en benchmarks de tareas. Frente a su proxy de 100M, la diferencia principal es la escala (1,33B frente a ~100M) y el uso del mismo esquema de mezcla de 40 dominios.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como artefacto de investigación para reproducir LinMix.
- Entrenado únicamente con 32.000 millones de tokens, un volumen bajo para estándares actuales, lo que limita su calidad en tareas abiertas.
- Solo soporta inglés según la model card; no se garantiza comportamiento en otros idiomas.
- Riesgo elevado de alucinación y de generar contenido incoherente fuera de los dominios representados en el corpus.
- Sesgos heredados de las fuentes: DCLM/Common Crawl (sesgos web), Stack-Edu (sesgos del código de The Stack v2) y Nemotron-CC-Math.
- La licencia MIT cubre los pesos, pero los datos de entrenamiento tienen sus propias condiciones: Common Crawl Terms of Use, The Stack v2 terms y NVIDIA Data Agreement for Model Training. El uso comercial de los pesos no exime de revisar estas condiciones.
- Las secuencias tokenizadas de Stack-Edu y Nemotron-CC-Math no se redistribuyen, lo que limita la reproducibilidad completa del pipeline sin acceso a las fuentes originales.
- Requiere transformers >= 5.2 para cargar `Qwen3_5ForCausalLM`; versiones anteriores fallarán.
- No se documentan la longitud de contexto ni el rendimiento en benchmarks, lo que dificulta evaluar su idoneidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/qwen3.5-1B-40domains-dirichlet-lightgbm-cpile
- Proxy de 100M: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código LinMix: https://github.com/credibleai/linmix
- Documentación de `Qwen3_5ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset DCLM 1b-1x pool: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset Stack-Edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- OLMo-core: https://github.com/allenai/OLMo-core
- Términos de Common Crawl: https://commoncrawl.org/terms-of-use
- Términos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
