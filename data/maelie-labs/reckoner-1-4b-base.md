# maelie-labs/reckoner-1.4b-base

## Resumen

Reckoner-1.4B-Base es el modelo base preentrenado de la familia Reckoner, desarrollado por Maelie Labs. Se trata de un modelo de lenguaje de 1.446.786.048 parámetros entrenado desde cero sobre 31.501.320.192 tokens, antes de cualquier fase de SFT o post-entrenamiento. Su interés principal reside en la arquitectura: combina capas de atención lineal con estado fijo (GDN-2, gated delta-rule) y capas de atención completa en una configuración híbrida de 20 capas.

La arquitectura GDN-2 mantiene un estado de tamano fijo en lugar de una caché KV que crece con la longitud de entrada, lo que reduce el coste de memoria en contextos largos. El modelo tiene una longitud de contexto entrenada de 65.536 tokens y está pensado para investigación y ajuste fino, no para uso conversacional directo: para chat y tool use el autor remite a la variante post-entrenada `reckoner-1.4b`.

Es relevante ahora porque documenta una receta de preentrenamiento desde cero con atención lineal híbrida en un tamano pequeno (1,4B), un regimen poco cubierto por los modelos abiertos habituales, y publica metricas de bits por byte y de recuperación en contexto largo que permiten evaluar el comportamiento de la atención lineal a 32K y 64K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 14 capas GDN-2 (atención lineal con estado fijo) y 6 capas de atención completa, distribuidas cerca de ambos extremos; 20 capas en total |
| Parametros totales | 1.446.786.048 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (contexto entrenado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido de 20 capas que alterna 14 capas GDN-2 con 6 capas de atención completa situadas cerca de ambos extremos de la red. GDN-2 (gated delta-rule linear attention) es la capa de atención lineal propietaria de Maelie Labs: mantiene un estado de tamano fijo en lugar de una caché KV que crece linealmente con la entrada, lo que abarata la inferencia en contextos largos. El modelo se entrenó desde cero en tres fases declaradas por el autor: preentrenamiento, extensión de contexto y cooldown, sumando 31.501.320.192 tokens en total.

Los datos de entrenamiento combinan corpus web y de razonamiento: smollm-corpus, dclm-baseline-1.0, FineWeb, finemath, TinyGSM, MetaMathQA, NuminaMath-CoT, NuminaMath-1.5, DeepMath-103K, orca-math-word-problems-200k, gsm8k, stackv2_edu_filtered, arxiv_papers_filtered y peS2o_filtered. La mezcla incluye por tanto texto web, matemáticas, código y literatura científica. No se especifica en la información disponible si hubo RLHF, DPO u otras fases de alineación; el autor indica explícitamente que este repositorio es el modelo base previo a SFT y post-entrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste instruccional.
- Razonamiento matemático: el corpus de entrenamiento incluye GSM8K, MetaMathQA, NuminaMath y DeepMath, orientado a problemas de tipo CoT.
- Generación y comprensión de código: incluye stackv2_edu_filtered en el preentrenamiento.
- Comprensión de literatura científica y técnica: arxiv_papers_filtered y peS2o_filtered.
- Manejo de contexto largo: recuperación de passkey a 32K y 64K tokens (50/50 en ambas longitudes).
- Capacidad de ajuste fino: al ser un modelo base, es el punto de partida para SFT, DPO o especialización por dominio.
- Tool calling y function calling: no disponible en el modelo base; el autor remite a `reckoner-1.4b` para tool use.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma nativa en el modelo base.
- Capacidades multilingües: limitadas al inglés.
- Vision y audio: no soportados.

## Casos de uso

- Investigación en atención lineal: el modelo permite estudiar el comportamiento de capas GDN-2 frente a atención completa en un mismo transformer, comparando recuperación a 32K y 64K tokens con las metricas publicadas por el autor.
- Base para ajuste fino supervisado (SFT): al ser un modelo base Apache-2.0 de 1,4B, sirve como punto de partida para entrenar asistentes especializados en dominios concretos con coste de cómputo moderado.
- Destilación y experimentación académica: su tamano permite ejecutar experimentos de preentrenamiento y post-entrenamiento en un único nodo con GPUs de gama alta, sin necesidad de clústeres.
- Procesamiento de documentos largos en inglés: con 65.536 tokens de contexto entrenado, puede usarse para tareas de continuación o extracción sobre documentos extensos, siempre que se valide la recuperación multi-clave, que decae a 64K.
- Generación de datos sintéticos: como modelo base puede generar continuaciones de texto y problemas matemáticos para aumentar datasets de entrenamiento de modelos menores.
- Reproducción de recetas de preentrenamiento: el autor publica TRAINING.md con la receta, lo que permite replicar o modificar el pipeline de datos y fases de entrenamiento.
- Evaluación de cuantización: al ser un modelo de 1,4B con pesos safetensors de 2,9 GB, es un candidato razonable para medir el impacto de la cuantización en tareas de contexto largo.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Bits por byte en 500 documentos held-out de FineWeb-Edu | 0,8288 |
| Bits por byte en 2.000 documentos held-out (web, matemáticas, código, lógica) | 0,6780 |
| Passkey retrieval a 32K tokens | 50/50 |
| Passkey retrieval a 64K tokens | 50/50 |
| Multi-key recall a 32K tokens | 33/50 |
| Multi-key recall a 64K tokens | 13/50 |

Las filas de contexto largo se obtuvieron con 50 prompts por longitud, ejecutados directamente sobre el modelo base. El autor advierte que la comprobación de contexto largo del modelo post-entrenado es una prueba distinta y más pequena (un prompt de passkey por longitud, a través del harness), por lo que no son comparables. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,9 GB solo para pesos, más caché de activaciones y estado de las capas GDN-2; el repo ocupa 2,9 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,8 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 para entrenamiento y ajuste fino a contexto completo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para inferencia en bf16, y en 4-6 GB con cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código personalizado de GDN-2); no se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Reckoner-1.4B-Base | 1,45B | 65.536 | Híbrida GDN-2 + atención completa | Apache-2.0 | Base, solo inglés, sin benchmarks estándar publicados |
| SmolLM2-1.7B | 1,7B | 8.192 (ampliable) | Transformer denso | Apache-2.0 | Base y instruct, multilingüe parcial, benchmarks publicados |
| Qwen2.5-1.5B | 1,54B | 32.768 | Transformer denso con GQA | Apache-2.0 | Base e instruct, multilingüe, benchmarks publicados |
| Llama 3.2-1B | 1,24B | 131.072 | Transformer denso | Llama 3.2 Community License | Base e instruct, multilingüe, benchmarks publicados |

La comparación con SmolLM2-1.7B, Qwen2.5-1.5B y Llama 3.2-1B se ofrece como referencia de categoria por tamano y licencia; no se dispone de resultados de benchmarks comunes que permitan una comparación directa de rendimiento con Reckoner-1.4B-Base.

## Limitaciones y advertencias

- Solo inglés: el autor indica que se preentrenó mayoritariamente con texto en inglés.
- Recuperación multi-clave débil a 64K: 13 de 50 prompts resueltos a 64K frente a 33 de 50 a 32K, lo que limita tareas que requieran recuperar varios hechos dispersos en contextos muy largos.
- No ajustado para chat ni herramientas: es un modelo base; para instrucciones y tool use el autor remite a `reckoner-1.4b`.
- Riesgo de alucinación: al no haber pasado por alineación, puede generar contenido plausible pero incorrecto sin mecanismos de abstención.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con corpus web, es esperable que herede sesgos de esas fuentes.
- Requiere `trust_remote_code=True` para cargar el código personalizado de GDN-2, lo que implica ejecutar código del repositorio del autor.
- Compatibilidad de ecosistema limitada: no se confirma soporte en motores de inferencia habituales (vLLM, llama.cpp, TGI) en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero las atribuciones de software y datos están en el fichero NOTICE del repositorio del modelo post-entrenado, que conviene revisar antes de desplegar.

## Enlaces

- Modelo base en Hugging Face: https://huggingface.co/maelie-labs/reckoner-1.4b-base
- Modelo post-entrenado (chat y tool use): https://huggingface.co/maelie-labs/reckoner-1.4b
- Organización Maelie Labs: https://huggingface.co/maelie-labs
- Atribuciones de software y datos (NOTICE): https://huggingface.co/maelie-labs/reckoner-1.4b/blob/main/NOTICE
- Receta de entrenamiento (TRAINING.md): https://huggingface.co/maelie-labs/reckoner-1.4b/blob/main/TRAINING.md
