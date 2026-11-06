# jy395/Qwen3-8B-wanda-4of8-c3

## Resumen

Qwen3-8B-wanda-4of8-c3 es un checkpoint derivado de Qwen/Qwen3-8B al que se le ha aplicado una poda semiestructurada Wanda 4:8, es decir, se conservan 4 de cada 8 pesos por bloque manteniendo el tensor almacenado en formato denso. Lo publica el autor jy395 (Junyi Ye y colaboradores) como una de las 30 configuraciones comprimidas que acompanan al articulo "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", presentado en ICAIF '26.

El modelo base es el Qwen3-8B de Alibaba, un transformer denso de 8.190.735.360 parametros con licencia Apache 2.0. Esta variante no reduce el numero de parametros almacenados (sigue siendo un checkpoint de 8,19 mil millones), sino que introduce patrones de sparsity 4:8 en los pesos para que, con kernels adecuados, se pueda acelerar la inferencia. La calibracion se ha hecho sobre C3 (FinMix), un corpus de 2.042 prompts financieros formateados como tareas (~260.000 tokens) construido a partir de los splits de entrenamiento y validacion de diez benchmarks financieros, nunca de test.

Su relevancia es doble: por un lado, es un ejemplo reproducible de compresion post-entrenamiento con llm-compressor y compressed-tensors, cargable directamente en vLLM; por otro, forma parte de un estudio sistematico sobre cuando la calibracion con datos de dominio (en este caso, financiero) marca la diferencia al comprimir LLMs. Es un artefacto de investigacion, no un modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con poda semiestructurada Wanda 4:8 sobre los pesos |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE); la sparsity 4:8 afecta al almacenamiento de pesos, no al numero de parametros del checkpoint |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-8B, no confirmada en esta ficha) |
| Tipos de cuantizacion | No se especifican cuantizaciones adicionales; el checkpoint usa formato compressed-tensors con poda 4:8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (poda 4:8, pesos almacenados densos) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-8B, un transformer decoder-only denso de 8,19 mil millones de parametros. Sobre el se aplica la tecnica Wanda 4:8, una poda semiestructurada que, por cada grupo de 8 pesos, mantiene los 4 de mayor magnitud segun la metrica de importancia de Wanda (producto de la magnitud del peso por la norma de la activacion de entrada). Los pesos se almacenan de forma densa, de modo que el checkpoint mantiene el mismo tamano que el modelo original (16,4 GB en el repositorio) pero incorpora la mascara de sparsity para que el runtime pueda explotarla.

La calibracion se realizo con el corpus C3 (FinMix): 2.042 prompts financieros formateados como tareas, unos 260.000 tokens en total, construidos con semilla 42 a partir de los splits de entrenamiento y validacion de diez benchmarks financieros. El protocolo consume el corpus completo con `max_seq_length=2048`. La herramienta empleada es llm-compressor, mediante el script `wanda_4of8.py` del repositorio del articulo. No se indica en la informacion disponible si hubo entrenamiento adicional, RLHF o DPO; se trata de una compresion post-entrenamiento sin fine-tuning posterior documentado.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3-8B.
- Razonamiento y matematicas (capacidades del base, no re-evaluadas en esta ficha).
- Generacion de codigo (capacidad del base, no re-evaluada en esta ficha).
- Especializacion en dominio financiero por calibracion: el corpus C3 (FinMix) se construyo con prompts de diez benchmarks financieros, lo que orienta la preservacion de pesos relevantes para ese dominio.
- Carga directa en vLLM y en transformers con el formato compressed-tensors.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Evaluacion de compresion en finanzas: usar el checkpoint como una de las 30 configuraciones del estudio para medir la perdida de rendimiento en diez tareas financieras frente al Qwen3-8B sin comprimir, siguiendo la suite de evaluacion del repositorio.
- Investigacion sobre calibracion de dominio: comparar esta variante (calibrada con C3 FinMix) con otras calibradas con corpus genericos para estudiar cuando los datos de dominio mejoran la recuperacion tras la poda.
- Analisis de sensibilidad a la poda 4:8: medir que capas o tareas financieras degradan mas al retener solo 4 de cada 8 pesos, usando las metricas del articulo.
- Despliegue experimental en vLLM: validar el pipeline compressed-tensors en un entorno de serving para comprobar si los kernels de sparsity 4:8 aportan throughput real frente al modelo denso.
- Reproducibilidad de resultados: reejecutar `wanda_4of8.py` con `--calib-path data/calibration_datasets/c3_finmix.jsonl` para verificar la reproducibilidad del checkpoint publicado.
- Base para compresiones mas agresivas: usar este checkpoint como punto de partida para experimentos de cuantizacion adicional (por ejemplo, a 4 o 8 bits) en pipelines financieros.
- Docencia y formacion: ejemplo practico de poda semiestructurada con llm-compressor en un modelo de 8B con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la suite de evaluacion del repositorio del articulo para reproducir las diez tareas financieras, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 16,4 GB en safetensors (FP16/BF16); se necesita al menos esa cantidad mas overhead de activaciones y KV cache, por lo que en la practica conviene disponer de 24 GB o mas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en GPUs de 16 GB requeriria cuantizacion adicional no incluida en este checkpoint.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `device_map="auto"`. No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La ventaja de los kernels 4:8 depende del backend; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Qwen3-8B-wanda-4of8-c3 | 8,19 B | Poda Wanda 4:8, calibracion C3 FinMix | No disponible | Apache 2.0 | Hugging Face (208 descargas) |
| Qwen/Qwen3-8B (base) | 8,19 B | Ninguna | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otras configuraciones de la coleccion ICAIF '26 (jy395) | 8,19 B | Distintos metodos y corpus de calibracion | No disponible | Apache 2.0 | Hugging Face (coleccion) |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la comparacion cuantitativa requeriria ejecutar la suite de evaluacion del articulo.

## Limitaciones y advertencias

- Es un artefacto de investigacion: no hay evaluacion publicada de rendimiento en la informacion disponible, por lo que no se recomienda su uso en produccion sin validacion propia.
- La poda 4:8 puede degradar tareas no representadas en el corpus de calibracion C3 (FinMix); el sesgo hacia el dominio financiero es deliberado y puede penalizar otros dominios.
- Los pesos se almacenan densos: el checkpoint no ocupa menos que el original, y la aceleracion solo se materializa con kernels que exploten el patron 4:8.
- Riesgo de alucinacion: inherente al modelo base; la compresion puede amplificarlo en tareas fuera de dominio.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue equivalente al base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se documenta soporte de tool calling, agentes ni modo thinking en esta variante.
- La fecha de creacion del repositorio (2026-10-31) y el articulo (ICAIF '26) indican que se trata de material reciente y con escasa validacion externa (0 likes, 208 descargas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Qwen3-8B-wanda-4of8-c3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del articulo: https://github.com/JunyiYe/finance-ptc-calibration
- Script de poda: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/wanda_4of8.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa ICAIF 2026: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Articulo (DOI): https://doi.org/10.1145/3858063.3858724
- llm-compressor: https://github.com/vllm-project/llm-compressor
