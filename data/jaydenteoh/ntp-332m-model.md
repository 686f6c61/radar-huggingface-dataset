# JaydenTeoh/ntp-332m-model

## Resumen

NTP 332m es un modelo de lenguaje autorregresivo de 332 millones de parámetros entrenado exclusivamente con el objetivo clásico de predicción del siguiente token (next-token prediction, NTP), sin cabezas de multi-token prediction (MTP). Fue desarrollado por Jayden Teoh como uno de los doce checkpoints publicados junto al artículo "Multi-Token Prediction Done Right" (arXiv:2610.38331): tres objetivos de entrenamiento por cuatro tamaños de modelo, todos entrenados con una receta idéntica para que los resultados sean directamente comparables entre sí.

Su relevancia no reside en competir con modelos comerciales, sino en servir de línea base (baseline) científica: al compartir semilla, orden de datos y planificador de aprendizaje con los otros once checkpoints, cualquier diferencia de rendimiento entre ellos es atribuible al objetivo de entrenamiento y no a factores externos. Es, por tanto, una herramienta de investigación para estudiar si la predicción de múltiples tokens mejora realmente el rendimiento y la velocidad de decodificación especulativa.

Arquitecturalmente es un transformer decoder de 36 capas con tamaño oculto 768 y 12 cabezas de atención, entrenado sobre 31,5 mil millones de tokens de FineWeb-Edu con el tokenizador GPT-2. Se distribuye bajo licencia MIT en formato safetensors con código personalizado para la librería transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (hf_mtp, código personalizado) |
| Parametros totales | 332.126.976 |
| Parametros activos | 332M (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (1,3 GB de tamaño de repo) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 36 capas con tamaño oculto 768, 12 cabezas de atención y una ventana de contexto de 2048 tokens. A diferencia de los otros checkpoints de la serie, no incorpora cabezas MTP (`n_mtp: 0`): calcula únicamente la pérdida de entropía cruzada sobre el siguiente token. El vocabulario del tokenizador GPT-2 (50.257 entradas) se rellena hasta 50.304 por alineación, aunque las filas adicionales no se usan.

El entrenamiento se realizó sobre FineWeb-Edu tokenizado con GPT-2 BPE, totalizando 31,5 mil millones de tokens (60.000 pasos con batch de 256 y secuencia de 2048). Como detalle técnico destacable, se empleó el optimizador Muon sobre las matrices ocultas 2D combinado con AdamW para embeddings, cabezas y normalizaciones, con LR pico de 0,0015 en descenso coseno hasta 1e-05, 2.000 pasos de calentamiento, weight decay de 0,1 y precisión bf16 autocast sobre pesos maestros en fp32. Se ejecutó una única pasada por celda de la matriz experimental (semilla 13), garantizando que los doce checkpoints compartan semilla, orden de datos y planificador.

## Capacidades

- Generación de texto en inglés mediante predicción autorregresiva del siguiente token.
- Modelo base (preentrenamiento únicamente): no está alineado con instrucciones ni ha recibido RLHF/DPO.
- No incorpora cabezas MTP, por lo que no está diseñado para decodificación especulativa auto-especulativa (es el baseline contra el que se comparan las variantes con MTP).
- Carga mediante transformers con `trust_remote_code=True`, al estar la arquitectura `hf_mtp` definida en los ficheros del repo.
- Pipeline de text-generation estándar compatible con `AutoModelForCausalLM` y el tokenizador GPT-2.
- Capacidades de visión, audio, tool calling o agentes: no disponibles.

## Casos de uso

- Investigación en objetivos de preentrenamiento: sirve como control experimental para medir el impacto real de la predicción multi-token frente al NTP clásico en condiciones idénticas de datos, semilla y planificador.
- Estudios de decodificación especulativa: al carecer de cabezas MTP, permite aislar el coste y beneficio de las técnicas de especulación cuando se compara con los checkpoints Soft-MTP de la misma serie.
- Reproducción de experimentos académicos: con configuración pública en `configs/332m_fineweb.yaml` del repositorio de código, facilita replicar el entrenamiento o extenderlo con otros datasets.
- Análisis de optimizadores: su uso combinado de Muon y AdamW lo hace útil como referencia para estudiar el efecto de Muon en modelos pequeños a escala de 30 mil millones de tokens.
- Baseline para ablations de arquitectura: punto de partida para modificar capas, cabezas o contexto y medir diferencias sobre un modelo pequeño y rápido de entrenar.
- Enseñanza y formación: por su tamaño (332M) y su entrenamiento público, es adecuado para cursos y tutoriales sobre preentrenamiento de LLM desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas numéricas; el valor del modelo es experimental y las comparaciones deben consultarse en el artículo arXiv:2610.38331.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp16/bf16 (332M de parámetros) y unos 1,3 GB en fp32; sin cuantizaciones publicadas.
- Cabe con holgura en GPUs de consumo: cualquier GPU moderna con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.) es suficiente; no se requiere A100 ni H100.
- También es ejecutable en CPU dada su dimensión, con latencias razonables para generación corta.
- Despliegue: compatible con transformers (carga con `trust_remote_code=True`). La model card marca `inference: false` en el hub, por lo que la inference API de Hugging Face no está habilitada. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (la arquitectura personalizada `hf_mtp` probablemente requiera adaptación).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JaydenTeoh/ntp-332m-model | 332M | 2048 | NTP puro (baseline) | MIT | safetensors, código personalizado |
| Checkpoints MTP de la misma serie (arXiv:2610.38331) | 332M (misma receta) | 2048 | Multi-token prediction / Soft-MTP | no disponible | Mismos doce checkpoints del artículo |
| GPT-2 small/medium (referencia de tamaño) | 124M–355M | 1024 | NTP | MIT (OpenAI) | Ampliamente disponible en transformers |

La comparación más relevante es interna a la serie: los otros checkpoints de 332M entrenados con variantes MTP bajo la misma receta, cuyos resultados comparativos se detallan en el paper. Frente a GPT-2, el modelo comparte tokenizador pero duplica el contexto y usa el optimizador Muon.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones y puede generar texto incoherente u ofensivo; no está pensado para uso conversacional directo.
- Riesgo alto de alucinación, inherente a un modelo de 332M entrenado solo con 31,5 mil millones de tokens y sin ajuste por preferencias.
- Entrenado exclusivamente en inglés (FineWeb-Edu); el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repo; revísese antes de usar en entornos sensibles.
- No incluye ficheros de tokenizador: hay que cargar el tokenizador GPT-2 estándar por separado.
- Sin resultados de benchmarks publicados en la model card: no hay garantías de calidad medibles más allá del marco experimental del paper.
- Sesgos conocidos: no disponible; puede heredar los sesgos de FineWeb-Edu y de GPT-2.
- Licencia MIT sin restricciones de uso comercial, aunque el uso del código personalizado debe evaluarse caso por caso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/ntp-332m-model
- Artículo "Multi-Token Prediction Done Right" (arXiv:2610.38331): https://arxiv.org/abs/2610.38331
- Repositorio de código (Soft-MTP): https://github.com/JaydenTeoh/Soft-MTP
- Dataset de entrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
