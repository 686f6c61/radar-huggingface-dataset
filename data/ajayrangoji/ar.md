# AjayRangoji/AR

## Resumen

AR-4B es un modelo de lenguaje autoregresivo de tipo decoder-only con 4.022 millones de parámetros (4,02B), desarrollado por AjayRangoji y publicado bajo licencia Apache 2.0. Se trata de un modelo entrenado desde cero (from scratch) sobre aproximadamente 325.000 millones de tokens, empleando hasta 64 GPU NVIDIA H100 en un clúster con PyTorch FSDP2. El repositorio `AjayRangoji/AR` no contiene los pesos del modelo, sino la base de código completa de preentrenamiento: arquitectura, scripts de orquestación de clúster, pipeline de datos y arnés de evaluación. Los pesos publicados se encuentran en el repositorio hermano `AjayRangoji/AR-4B-base`.

El modelo sigue una arquitectura transformer clásica de estilo Qwen3/Llama, con 36 capas, dimensión oculta de 2.560, atención de consultas agrupadas (GQA) con 32 cabezas de consulta y 8 de clave-valor, MLP SwiGLU con dimensión interna de 9.728, normalización RMSNorm con QK-norm por cabeza, RoPE con theta de 1.000.000 y embeddings de entrada/salida atados. El vocabulario es de 151.936 tokens BPE, reutilizando el tokenizador de Qwen3-4B, y la longitud de contexto es de 4.096 tokens por secuencia.

La relevancia de este proyecto reside en su enfoque de infraestructura abierta: no solo publica pesos, sino todo el código necesario para reproducir el preentrenamiento a escala de decenas de miles de millones de tokens, incluyendo currículo multi-etapa, gestión autónoma del clúster (watchdog, auto-reanudación, aislamiento de nodos defectuosos) y utilidades de exportación a safetensors. Es un recurso especialmente útil para equipos de investigación que quieran estudiar o replicar recetas de preentrenamiento a escala media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo Qwen3/Llama) con GQA, SwiGLU, QK-norm y RoPE |
| Parametros totales | 4.022.238.720 (4,02B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (solo se menciona exportación en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (exportación bf16 mediante `convert_and_check.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 36 bloques, con dimensión oculta de 2.560 y MLP SwiGLU de dimensión interna 9.728. La atención usa GQA con 32 cabezas de consulta y 8 de clave-valor, dimensión de cabeza 128, QK-norm por cabeza y RoPE con base 1.000.000. La normalización es RMSNorm con epsilon 10⁻⁶ calculada en fp32, y los embeddings de entrada y la proyección de salida están atados. El vocabulario de 151.936 tokens BPE proviene del tokenizador de Qwen3-4B. El entrenamiento se realizó con PyTorch FSDP2, cómputo en bf16 con reducciones en fp32, checkpointing de activaciones y FlexAttention con enmascaramiento intra-documento.

El preentrenamiento siguió un currículo de dos etapas. La etapa 1 (pasos 0 a 572.000, ~300B tokens) mezcló 65% FineWeb-Edu, 20% The Stack (deduplicado, 9 lenguajes de programación) y 15% FineMath 4+/3+, con una tasa de aprendizaje que parte de un warmup hasta 3×10⁻⁴ y decae cosenoidalmente hasta 3×10⁻⁵. La etapa 2 (pasos 572.000 a 619.699, ~25B tokens) es un "anneal" de razonamiento con 40% FineMath e InfiWebMath, 30% The Stack, 20% FineWeb-Edu (calidad ≥4) y 10% Cosmopedia v2, con warmup hasta 1×10⁻⁴ y decaimiento cosenoidal hasta 1×10⁻⁵. No se menciona uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto autoregresiva en inglés, con decodificación greedy y top-p implementadas en el arnés de evaluación.
- Razonamiento matemático, reforzado por la etapa 2 de anneal con FineMath e InfiWebMath.
- Generación de código en 9 lenguajes de programación, gracias al 20-30% de The Stack en ambas etapas.
- Evaluación integrada de GSM8K (8-shot) y HumanEval (pass@1).
- Enmascaramiento de atención intra-documento para entrenamiento eficiente con FlexAttention.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Investigación en recetas de preentrenamiento: el repositorio permite reproducir el pipeline completo (tokenización, mezcla de datos, currículo de dos etapas) en clústeres Slurm con FSDP2, sirviendo como referencia para equipos que diseñen sus propios entrenamientos a escala media.
- Fine-tuning supervisado sobre dominio específico: al ser un modelo base de 4B con licencia Apache 2.0, es adecuado como punto de partida para ajuste fino en tareas de clasificación, extracción o generación controlada, con requisitos de hardware moderados.
- Generación de código asistida: el 20-30% de The Stack en el entrenamiento y la evaluación HumanEval integrada lo hacen útil para autocompletado o generación de funciones en entornos de desarrollo, previo ajuste fino.
- Razonamiento matemático educativo: la etapa de anneal con FineMath e InfiWebMath lo orienta a resolver problemas de aritmética y álgebra de nivel escolar, evaluable directamente con el script `gsm8k.py` incluido.
- Estudio de infraestructura distribuida: los scripts `watchdog.sh`, `autoreload.sh`, `cleanup.sh` y `sanity_4node.sbatch` documentan patrones de operación de clúster (detección de cuelgues, reanudación automática, aislamiento de nodos) reutilizables en otros proyectos.
- Base para experimentos de alineación: al no haberse aplicado RLHF/DPO, es un sustrato limpio para investigar técnicas de alineación y evaluar su impacto sobre un modelo preentrenado de forma controlada.
- Evaluación comparativa de tokenizadores: al reutilizar el tokenizador de Qwen3-4B con vocabulario de 151.936 tokens, permite estudiar el efecto del vocabulario sobre eficiencia y rendimiento en modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye scripts para evaluar GSM8K (8-shot) y HumanEval (pass@1), así como pérdida de validación, pero no se proporcionan cifras en la model card consultada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos (4,02B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomiendan 12-16 GB para contexto completo de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: ~4-5 GB de pesos; en 4 bits: ~2-3 GB de pesos (no se documentan cuantizaciones oficiales, por lo que estos valores son estimaciones a partir del tamaño).
- GPU recomendadas para entrenamiento: NVIDIA H100 (hasta 64 unidades en el clúster original), con FSDP2 multi-nodo.
- GPU para inferencia: cabe en GPU de consumo como RTX 4090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: el repositorio incluye `modeling_ar.py` para Hugging Face Transformers y scripts de generación (`generate.py`, `batch_gen.py`); no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AR-4B (AjayRangoji) | 4,02B | 4.096 | Apache 2.0 | Pesos en HF (`AR-4B-base`) + código de entrenamiento |
| Qwen3-4B | ~4B | No disponible en esta ficha | No disponible en esta ficha | Pesos en HF |
| Llama 3.2 3B | ~3B | No disponible en esta ficha | No disponible en esta ficha | Pesos en HF |

La comparación con Qwen3-4B y Llama 3.2 3B se basa únicamente en el tamaño y en la referencia explícita del autor al tokenizador de Qwen3-4B; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- Contexto limitado a 4.096 tokens, inferior al de muchos modelos contemporáneos de tamaño similar.
- No se han aplicado RLHF ni DPO, por lo que el modelo base puede generar contenido no alineado, sesgado o incorrecto sin ajuste adicional.
- Riesgo de alucinación inherente a un modelo base preentrenado sin instrucciones; no debe usarse directamente en producción sin fine-tuning y evaluación.
- No se documentan cuantizaciones oficiales ni pruebas de despliegue en motores de inferencia populares (vLLM, llama.cpp, TGI), lo que puede requerir trabajo adicional de integración.
- El repositorio principal contiene código e infraestructura, no los pesos; los pesos están en un repositorio separado (`AR-4B-base`).
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la procedencia de los datos de entrenamiento (FineWeb-Edu, The Stack, FineMath, Cosmopedia) puede conllevar obligaciones adicionales según el uso previsto.
- El número de descargas y likes del repositorio es cero en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio del código e infraestructura: https://huggingface.co/AjayRangoji/AR
- Pesos del modelo base: https://huggingface.co/AjayRangoji/AR-4B-base
- Tokenizador de referencia (Qwen3-4B): https://huggingface.co/Qwen/Qwen3-4B
