# derebellon/edeus-lulu-onnx

## Resumen

Lulu es un modelo de lenguaje compacto de aproximadamente 0,5 mil millones de parámetros, desarrollado por EDEUS / SmartEpi, especializado en la extracción de información clínica estructurada a partir de texto libre en español. Su función principal es transformar notas clínicas en JSON validado con codificación ICD-10, actuando como la etapa de extracción estructurada del sistema agéntico Athenea, desplegado en un hospital y un centro de investigación en Colombia.

Este repositorio contiene exclusivamente la build ONNX del modelo, en variantes fp16 y cuantizada, orientada a inferencia on-device. El objetivo es mantener los datos de pacientes en local (on-premises), evitando el envío de información clínica sensible a servicios en la nube. El modelo está ajustado por instrucciones para una tarea concreta y acotada, no como un LLM de propósito general.

La relevancia actual del modelo reside en su enfoque: un tamaño reducido (~0,5B) que permite ejecución en hardware modesto, junto con una tasa declarada del 98,3% de salida JSON válida y un F1 de ICD-10 de aproximadamente 0,68 en un conjunto clínico reservado. No es un dispositivo médico y sus salidas están sujetas a revisión por personal clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, según tags del repositorio); exportado a ONNX |
| Parámetros totales | ~0,5 mil millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp16 y cuantizada (variantes `model_fp16.onnx` y `model_quantized.onnx`) |
| Idiomas soportados | Español (es) |
| Licencia | Propietaria: `edeus-smartepi-proprietary` |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer de la familia Qwen3, según los tags del repositorio, con aproximadamente 0,5B de parámetros y ajuste por instrucciones para la tarea de extracción estructurada. Se distribuye exclusivamente como build ONNX en dos variantes (fp16 y cuantizada), lo que indica un proceso de exportación orientado a inferencia en dispositivos sin aceleradores de gran capacidad.

La model card no proporciona detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La información disponible se limita a la tarea objetivo (texto clínico libre en español → JSON validado con hallazgos, diagnósticos y códigos ICD-10) y a su integración como etapa de extracción dentro del sistema Athenea. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de información clínica estructurada: convierte texto libre en español en JSON validado con hallazgos, diagnósticos y códigos ICD-10.
- Generación de salida estructurada (structured output) con formato JSON validado.
- Codificación clínica mediante ICD-10.
- Procesamiento de texto clínico en español.
- Ejecución on-device mediante ONNX, con variantes fp16 y cuantizada.
- Integración como etapa de un pipeline agéntico (sistema Athenea).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso autónomo, visión, audio ni modo thinking.

## Casos de uso

- Estructuración de notas clínicas: el modelo transforma texto libre de historiales en JSON validado con hallazgos y diagnósticos, adecuado para su integración en sistemas de registro hospitalario.
- Codificación ICD-10 automatizada: genera códigos ICD-10 a partir de diagnósticos descritos en texto libre, con un F1 declarado de ~0,68, útil como asistencia a la codificación manual revisada por personal clínico.
- Alimentación de registros de resistencia antimicrobiana: la model card indica explícitamente este uso downstream, estructurando notas para su incorporación a registros epidemiológicos.
- Mapeo a OMOP: la salida estructurada puede alimentar un paso de mapeo a modelos de datos comunes (OMOP), según indica el autor.
- Despliegue on-premises en entornos hospitalarios: al ejecutarse on-device vía ONNX, mantiene los datos de pacientes en la infraestructura del centro, lo que encaja con requisitos de privacidad clínica.
- Procesamiento por lotes de documentación clínica en español: su tamaño (~0,5B) y las variantes cuantizadas permiten ejecutar la extracción sobre volúmenes de notas en hardware modesto sin depender de servicios externos.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| Tasa de salida JSON válida | 98,3% | Conjunto clínico reservado (held-out) |
| F1 de ICD-10 | ≈ 0,68 | Conjunto clínico reservado (held-out) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~0,5B de parámetros, la variante fp16 requiere del orden de 1 GB de pesos y la cuantizada menos, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor; por tamaño, el modelo es apto para GPU de consumo, pero no se confirma en la documentación.
- Ejecución en GPU de consumo: plausible por el tamaño (~0,5B) y la existencia de build ONNX cuantizada, aunque no está confirmado explícitamente.
- Opciones de despliegue: inferencia ONNX (variantes fp16 y cuantizada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (extracción clínica estructurada en español, ~0,5B, ONNX) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card lo declara explícitamente y las salidas deben ser revisadas por personal clínico.
- Licencia propietaria (`edeus-smartepi-proprietary`): compartido para evaluación e ilustración; el uso comercial está restringido y requiere consulta con el titular (EDEUS / SmartEpi).
- Idioma limitado al español: no se documenta soporte multilingüe.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con notas clínicas muy extensas.
- Rendimiento de codificación ICD-10 moderado (F1 ≈ 0,68): implica errores de codificación que requieren supervisión.
- Riesgo de alucinación no cuantificado: la model card no reporta métricas de fidelidad factual más allá de la validez del JSON.
- Sesgos: no documentados en la información disponible.
- Repositorio con muy baja adopción (10 descargas, 0 likes): ecosistema y soporte comunitario limitados.
- Solo se distribuye la build ONNX: no hay pesos en safetensors ni GGUF, lo que restringe las opciones de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/derebellon/edeus-lulu-onnx
- Demo interactiva: https://huggingface.co/spaces/derebellon/athenea-demo
- Registro de evaluación y metodología: https://huggingface.co/datasets/derebellon/athenea-eval
- Metodología de evaluación (métricas y rúbricas): https://huggingface.co/datasets/derebellon/athenea-eval/blob/main/METHODOLOGY.md
