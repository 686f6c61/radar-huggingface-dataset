# jy395/Meta-Llama-3.1-70B-Instruct-gptq-w4a16-c1

## Resumen

`jy395/Meta-Llama-3.1-70B-Instruct-gptq-w4a16-c1` es una versión cuantizada a 4 bits del modelo `meta-llama/Llama-3.1-70B-Instruct` de Meta, publicada por el usuario jy395 (Junyi Ye y colaboradores) como parte del conjunto de 30 configuraciones comprimidas que acompañan al artículo académico *Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs* (ICAIF '26). El modelo aplica cuantización GPTQ de pesos a 4 bits con activaciones en 16 bits (esquema W4A16) y tamaño de grupo 128, utilizando `llm-compressor` y el formato `compressed-tensors`.

El propósito del checkpoint no es tanto ofrecer un modelo de producción como servir de artefacto reproducible para estudiar cómo afecta el corpus de calibración al rendimiento de modelos de lenguaje financieros tras la compresión post-entrenamiento. En esta configuración concreta, la calibración se realizó sobre C1 (WikiText-2, texto genérico), lo que la convierte en la referencia "sin dominio" frente a otras configuraciones calibradas con datos financieros.

El modelo conserva la arquitectura y las capacidades del Llama 3.1 70B Instruct original (transformer denso, contexto de 128 000 tokens, licencia Llama 3.1), pero con un peso en disco de aproximadamente 39,5 GB y un total de 11 193 820 256 parámetros almacenados en safetensors, lo que refleja la compresión efectiva de los pesos a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), derivado de meta-llama/Llama-3.1-70B-Instruct |
| Parametros totales | 11 193 820 256 (pesos cuantizados a 4 bits; el modelo base tiene ~70 600 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1) |
| Tipos de cuantizacion | GPTQ W4A16, group size 128, formato compressed-tensors |
| Idiomas soportados | No disponible (el modelo base soporta principalmente ingles y otros idiomas, pero no se detalla en la ficha) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 70B Instruct: un transformer denso con atención por grupos (GQA) y 128 000 tokens de contexto, entrenado por Meta con datos multilingües y ajustado por instrucciones con técnicas de RLHF y DPO. Sobre ese modelo base, este checkpoint aplica una cuantización post-entrenamiento GPTQ de solo pesos (W4A16) con tamaño de grupo 128, ejecutada mediante `llm-compressor` y el script `scripts/quantization/gptq_w4a16.py` del repositorio `JunyiYe/finance-ptc-calibration`.

El proceso de calibración utilizó el corpus C1 (WikiText-2, texto genérico), con 128 secuencias de 2048 tokens (262 144 tokens en total), consumo completo del corpus, `max_seq_length=2048` y semilla 42. No se realizó un ajuste fino adicional ni un entrenamiento desde cero: se trata exclusivamente de compresión post-entrenamiento. La innovación del trabajo asociado no reside en la arquitectura, sino en el análisis sistemático de cómo el desajuste entre el dominio de calibración y el dominio de evaluación (finanzas) degrada el rendimiento, y en la propuesta de métricas de "daño" que predicen la recuperación tras la compresión.

## Capacidades

- Generación de texto conversacional y ajuste por instrucciones, heredados del Llama 3.1 70B Instruct.
- Razonamiento multi-paso y matemáticas a nivel del modelo base.
- Generación y comprensión de código.
- Soporte de tool calling y function calling (capacidad del modelo base Llama 3.1 Instruct).
- Capacidades multilingües del modelo base (no verificadas específicamente en esta versión cuantizada).
- Contexto largo de hasta 128 000 tokens, útil para documentos extensos.
- Orientación declarada a tareas financieras por el contexto del paper, aunque la calibración se hizo con texto genérico.

## Casos de uso

- Evaluación de compresión en dominios financieros: sirve como configuración de referencia "sin dominio" para comparar con las otras 29 configuraciones del paper y medir la pérdida de rendimiento atribuible a la calibración genérica.
- Reproducción de experimentos académicos: permite replicar los resultados de las diez tareas financieras del suite de evaluación del repositorio `finance-ptc-calibration`.
- Despliegue con recursos limitados: con ~39,5 GB en disco y pesos de 4 bits, puede servirse en una GPU de 48 GB (A6000, L40S) o en dos GPUs de 24 GB, algo inviable con el modelo de 70B en FP16.
- Generación de texto y asistencia conversacional general: mantiene las capacidades del Instruct original para tareas de chat y redacción.
- Análisis de documentos largos: el contexto de 128 000 tokens permite procesar informes financieros o contratos extensos en una sola pasada.
- Investigación sobre calibración: útil para estudiar el efecto del corpus de calibración (WikiText-2 frente a datos financieros) en la calidad final del modelo cuantizado.
- Prototipado de pipelines de inferencia con vLLM: el formato compressed-tensors se carga directamente en vLLM, lo que facilita pruebas de latencia y throughput en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo ICAIF '26 y al suite de evaluación del repositorio para los resultados de las diez tareas financieras, pero no incluye cifras concretas en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: ~40-45 GB con pesos W4A16 (39,5 GB de pesos más overhead de activaciones y KV cache).
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB.
- Cabe en consumer GPU: no en una sola RTX 4090 (24 GB); sí en configuraciones multi-GPU (2× RTX 4090/3090) o en GPUs profesionales de 48 GB.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `device_map="auto"`, TGI (verificar compatibilidad con compressed-tensors).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-70B-Instruct-gptq-w4a16-c1 | ~70,6 B (11,2 B almacenados a 4 bits) | 128 000 | GPTQ W4A16, group 128 | Llama 3.1 | Hugging Face (21 descargas) |
| meta-llama/Llama-3.1-70B-Instruct | ~70,6 B | 128 000 | FP16/BF16 | Llama 3.1 | Hugging Face (oficial Meta) |
| Otras configuraciones del paper (C2-C30) | ~70,6 B | 128 000 | GPTQ W4A16 con distintos corpus | Llama 3.1 | Colección ICAIF 2026 en Hugging Face |
| Modelos financieros abiertos de 70B (p. ej. variantes fine-tuned) | ~70 B | Variable | Variable | Variable | No disponible en la información |

La comparación directa más relevante es con el modelo base sin cuantizar (mayor calidad, mayor huella de memoria) y con las demás configuraciones del mismo paper (misma compresión, distinto corpus de calibración).

## Limitaciones y advertencias

- La cuantización GPTQ W4A16 introduce pérdida de precisión respecto al modelo base en FP16/BF16; el grado de degradación depende de la tarea y del dominio.
- La calibración con texto genérico (WikiText-2) puede ser subóptima para tareas financieras, que es precisamente la hipótesis que estudia el paper.
- Riesgo de alucinación inherente al modelo base Llama 3.1 Instruct, no mitigado por la cuantización.
- Sesgos heredados de los datos de entrenamiento de Meta; no se documentan sesgos específicos de esta versión.
- Idiomas soportados no documentados en la ficha; el comportamiento multilingüe puede diferir del modelo base.
- Uso comercial sujeto a la Llama 3.1 Community License, con restricciones de atribución y cláusulas de uso aceptable de Meta.
- Modelo con muy pocas descargas (21) y sin likes, lo que sugiere escasa validación comunitaria; conviene verificar su calidad antes de usarlo en producción.
- No se proporcionan datos de latencia, throughput ni benchmarks en la ficha; las decisiones de despliegue deben basarse en pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-70B-Instruct-gptq-w4a16-c1
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct
- Paper (DOI): https://doi.org/10.1145/3858063.3858724
- Repositorio de código y evaluación: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantización: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/gptq_w4a16.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección completa ICAIF 2026: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
- llm-compressor: https://github.com/vllm-project/llm-compressor
