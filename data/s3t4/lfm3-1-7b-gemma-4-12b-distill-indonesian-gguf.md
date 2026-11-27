# s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian-GGUF

## Resumen

LFM3-1.7B-Gemma-4-12B-Distill-Indonesian-GGUF es la versión cuantizada en formato GGUF del checkpoint `s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian`, un ajuste fino del modelo `LiquidAI/LFM3-1.7B` (1,73 mil millones de parámetros) especializado en indonesio mediante destilación de conocimiento desde `google/gemma-4-12B-it` como modelo profesor. El autor es el usuario de Hugging Face `s3t4`, y el modelo está pensado para inferencia local eficiente en CPU y GPU a través de llama.cpp, Ollama, LM Studio y AnythingLLM.

El modelo parte de la arquitectura tri-híbrida de LFM3 con una ventana de contexto declarada de 256K tokens y emplea una destilación de tipo "Rationale & Instruction Distillation", es decir, no solo se transfieren las salidas finales del profesor sino también las cadenas de razonamiento. El resultado es un modelo compacto de 1,73B parámetros que mejora de forma notable sobre el baseline en tareas de comprensión del indonesio, acercándose parcialmente al profesor de 12B en benchmarks como IndoMMLU y XCOPA-ID.

La relevancia práctica de esta ficha radica en que ofrece tres niveles de cuantización (F16, Q8_0 y Q4_K_M) con métricas de calidad y latencia medidas sobre un conjunto fijo de 1.100 preguntas, lo que permite elegir el compromiso óptimo entre tamaño, velocidad y fidelidad para despliegues locales. El punto dulce recomendado por el autor es Q8_0, con un 97,27% de coincidencia de predicción respecto a F16 y un 22,5% menos de latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (LFM3, LiquidAI) |
| Parametros totales | 1.728.801.600 (1,73B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens (256K) declarados en la model card |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | Indonesio (id); el resto no disponible |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (generado con llama.cpp: `convert_hf_to_gguf.py` + `llama-quantize`) |
| Tamano del repo | 6,4 GB |
| Modelo base | s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian (a su vez derivado de LiquidAI/LFM3-1.7B) |
| Modelo profesor | google/gemma-4-12B-it |
| Descargas | 201 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura tri-híbrida de LFM3-1.7B de LiquidAI, una combinación de capas de atención y mecanismos lineales o recurrentes que la model card describe como "tri-hybrid" sin detallar la proporción exacta de cada tipo de capa. Sobre esa base, el autor aplicó un proceso de destilación de conocimiento desde `google/gemma-4-12B-it`, incluyendo destilación de racionales e instrucciones. Los datasets citados en la model card son `indolem/IndoMMLU`, `cambridgeltl/xcopa`, `CohereLabs/aya_dataset` y `AksaraLLM/aksara-sft-clean-v1`, lo que sugiere una mezcla de datos de evaluación y ajuste supervisado en indonesio.

No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset de destilación ni si se aplicaron fases de RLHF o DPO. La model card tampoco detalla innovaciones técnicas adicionales más allá de la propia arquitectura tri-híbrida y del esquema de destilación de racionales. El proceso de cuantización sí está documentado: conversión con `convert_hf_to_gguf.py` y cuantización con `llama-quantize`, con evaluación determinista de primer token mediante `llama-server`.

## Capacidades

- Generación de texto y conversación en indonesio, con estilo de respuesta claro y natural según el system prompt de ejemplo de la model card.
- Razonamiento y conocimiento factual en indonesio, evaluado mediante IndoMMLU (cultura general y conocimiento general).
- Razonamiento de sentido común en indonesio, evaluado mediante XCOPA-ID.
- Modo de pensamiento configurable: la model card menciona el parámetro `enable_thinking`, que puede activarse o desactivarse; las evaluaciones se realizaron con `enable_thinking=False`.
- Destilación de racionales: el modelo fue entrenado para reproducir cadenas de razonamiento del profesor, lo que puede favorecer respuestas multi-paso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente; el modo de pensamiento y la destilación de racionales son indicios, pero no hay confirmación.
- Capacidades multilingües: limitadas al indonesio según el campo `language: id`; no se documentan otros idiomas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local en indonesio: el modelo puede gestionar diálogos multi-turno con un contexto declarado de 256K tokens, aunque en la práctica el ejemplo de despliegue con `llama-server` usa `-c 4096`; es adecuado para asistentes personales o de escritorio que deban funcionar sin conexión en hardware modesto.
- Respuesta a preguntas sobre conocimiento general en indonesio: con un 47,00% en IndoMMLU (Bahasa Indonesia) y un 46,67% en conocimiento general, puede emplearse en bases de conocimiento internas o FAQ donde se acepte una precisión moderada y se priorice el coste cero de infraestructura.
- Razonamiento de sentido común para clasificación y elección múltiple: su 75,40% en XCOPA-ID lo hace útil en tareas de selección de respuesta correcta, análisis de causas y efectos y validación de enunciados en indonesio.
- Despliegue en dispositivos de bajos recursos: la variante Q4_K_M ocupa 1,10 GB y permite ejecución en máquinas con menos de 2 GB de RAM/VRAM, lo que habilita asistentes embebidos, aplicaciones de escritorio o entornos de CI con recursos limitados.
- Prototipado rápido con Ollama o LM Studio: la integración directa mediante `ollama run hf.co/s3t4/...:Q8_0` o la búsqueda en LM Studio permite a desarrolladores probar el modelo en minutos sin gestionar dependencias de Python.
- Servidor compatible con la API de OpenAI: `llama-server` expone un endpoint compatible con OpenAI, lo que facilita sustituir modelos en aplicaciones existentes o en pipelines de evaluación automatizada.
- Generación de texto asistida en indonesio para contenidos educativos o divulgativos: el modo de pensamiento y la destilación de racionales pueden producir explicaciones paso a paso, útiles para materiales didácticos o resúmenes.
- Evaluación comparativa de cuantizaciones: los datos de latencia y coincidencia de predicción permiten usar el modelo como banco de pruebas para decidir políticas de cuantización en producción.

## Benchmarks y rendimiento

Resultados del checkpoint base antes de la cuantización (zero-shot, `enable_thinking=False`, primer token):

| Benchmark | LFM3-1.7B baseline | LFM3-1.7B-Indonesian (SFT) | LFM3-1.7B-Distilled (BF16) | Δ vs SFT / Base | Profesor Gemma-4-12B-it |
|---|---|---|---|---|---|
| IndoMMLU (Bahasa Indonesia), 300 preguntas | 25,33% | 36,33% | 47,00% | +10,67 pp / +21,67 pp | 66,67% |
| IndoMMLU (conocimiento general), 300 preguntas | 26,00% | 33,33% | 46,67% | +13,34 pp / +20,67 pp | 59,00% |
| XCOPA-ID (sentido común), 500 preguntas | 58,60% | 58,40% | 75,40% | +17,00 pp / +16,80 pp | 86,20% |

Resultados por cuantización GGUF sobre 1.100 preguntas:

| Benchmark | HF BF16 (ref.) | GGUF F16 | GGUF Q8_0 | GGUF Q4_K_M | Δ Q8_0 vs F16 | Δ Q4_K_M vs F16 |
|---|---|---|---|---|---|---|
| IndoMMLU (Bahasa Indonesia), 300 | 47,00% | 48,00% | 48,33% | 46,67% | +0,33 pp | -1,33 pp |
| IndoMMLU (conocimiento general), 300 | 46,67% | 46,33% | 45,67% | 40,67% | -0,67 pp | -5,67 pp |
| XCOPA-ID, 500 | 75,40% | 75,20% | 76,00% | 76,40% | +0,80 pp | +1,20 pp |
| Total combinado (1.100) | 59,82% | 59,91% | 60,18% | 58,55% | +0,27 pp | -1,36 pp |
| Media macro (3 benchmarks) | 56,36% | 56,51% | 56,67% | 54,58% | +0,16 pp | -1,93 pp |

Rendimiento y compresión:

| Variante | Tamaño | Compresión | Latencia media (`llama-server`) | Coincidencia de predicción vs F16 |
|---|---|---|---|---|
| GGUF F16 | 3,23 GiB (3,47 GB) | 1,00x | 43,74 ms/pregunta | 100,00% (1.100/1.100) |
| GGUF Q8_0 | 1,72 GiB (1,85 GB) | 1,88x | 33,89 ms/pregunta (-22,5%) | 97,27% (1.070/1.100) |
| GGUF Q4_K_M | 1,02 GiB (1,10 GB) | 3,15x | 29,45 ms/pregunta (-32,7%) | 85,00% (935/1.100) |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,10 GB para Q4_K_M, 1,85 GB para Q8_0 y 3,47 GB para F16, más el overhead del runtime y del contexto.
- GPU recomendadas: no se especifican en la información disponible; el modelo está pensado también para ejecución en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM libre para Q4_K_M o Q8_0; F16 requiere alrededor de 4 GB.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), Ollama, LM Studio y AnythingLLM; se requiere una build de llama.cpp compatible con LFM3.
- Latencia medida: 29,45 ms/pregunta en Q4_K_M, 33,89 ms/pregunta en Q8_0 y 43,74 ms/pregunta en F16, medida con `llama-server` sobre las 1.100 preguntas de evaluación.
- Throughput: no disponible en la información proporcionada.
- Parámetros de muestreo recomendados: `temperature=0.1`, `top_k=50`, `repeat_penalty=1.1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IndoMMLU (Bahasa) | XCOPA-ID | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM3-1.7B-Gemma-4-12B-Distill-Indonesian (Q8_0) | 1,73B | 256K | 48,33% | 76,00% | lfm1.0 | GGUF en HF |
| LFM3-1.7B-Indonesian (SFT, checkpoint base) | 1,73B | 256K (heredado) | 36,33% | 58,40% | lfm1.0 | HF |
| LFM3-1.7B baseline (LiquidAI) | 1,73B | 256K | 25,33% | 58,60% | lfm1.0 | HF |
| Gemma-4-12B-it (profesor) | 12B | no disponible | 66,67% | 86,20% | no disponible | HF |

El modelo destilado supera de forma clara a su baseline y a la versión SFT en indonesio, pero queda por debajo del profesor de 12B en todos los benchmarks, a cambio de un tamaño aproximadamente siete veces menor. No se dispone de datos de otros modelos de 1-2B especializados en indonesio en la información proporcionada.

## Limitaciones y advertencias

- Precisión moderada: el mejor resultado en IndoMMLU (Bahasa Indonesia) es del 48,33% con Q8_0, lo que implica que más de la mitad de las preguntas de conocimiento factual se responden incorrectamente; no es adecuado para tareas que exijan alta fiabilidad factual.
- Degradación con cuantización agresiva: Q4_K_M pierde 5,67 pp en IndoMMLU de conocimiento general y cambia el 15% de las predicciones respecto a F16; el autor recomienda Q8_0 como equilibrio.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación; al ser un modelo pequeño destilado, la generación de hechos inventados es un riesgo plausible, aunque no se cuantifica en la información disponible.
- Cobertura lingüística limitada: solo se declara indonesio; no hay evidencia de calidad en otros idiomas, incluido el castellano.
- Licencia lfm1.0: es una licencia "other" con enlace a la licencia de LiquidAI; es necesario revisar sus términos antes de uso comercial, ya que puede incluir restricciones adicionales no detalladas en la model card.
- Dependencia de una build compatible: el modelo requiere versiones de llama.cpp, Ollama u otros runtimes compatibles con LFM3; versiones estándar pueden no cargarlo correctamente.
- Contexto práctico: aunque se declaran 256K tokens, el ejemplo de despliegue usa `-c 4096`, y no se documenta el rendimiento real con contextos largos.
- Sesgos: no se documentan evaluaciones de sesgo o toxicidad en la información proporcionada.
- Métricas de evaluación limitadas: los benchmarks se basan en selección determinista de primer token, no en generación libre, por lo que pueden no reflejar el rendimiento en tareas generativas abiertas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian-GGUF
- Checkpoint base (no cuantizado): https://huggingface.co/s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Modelo profesor: https://huggingface.co/google/gemma-4-12B-it
- Dataset IndoMMLU: https://huggingface.co/datasets/indolem/IndoMMLU
- Dataset XCOPA: https://huggingface.co/datasets/cambridgeltl/xcopa
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset Aksara SFT: https://huggingface.co/datasets/AksaraLLM/aksara-sft-clean-v1
