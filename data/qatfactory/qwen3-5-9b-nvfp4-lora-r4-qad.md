# qatfactory/Qwen3.5-9B-NVFP4-LoRA-r4-QAD

## Resumen

Qwen3.5-9B-NVFP4-LoRA-r4-QAD es una versión cuantizada del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario qatfactory en Hugging Face. Se trata de una conversión a formato NVFP4 (FP4 de NVIDIA con escalado por bloques) obtenida mediante entrenamiento consciente de la cuantización (QAT, quantization-aware training) con adaptadores LoRA de rango 4, empaquetada en formato compressed-tensors para su uso con vLLM. El resultado es un checkpoint de aproximadamente 8,9 GB que reduce a la mitad, o menos, el peso del modelo base en BF16.

La relevancia de esta ficha está en que documenta un artefacto de cuantización de una generación de modelos (Qwen3.5) sobre la que no hay información pública detallada en la documentación proporcionada, y en que el propio repositorio es de acceso restringido y sin descargas ni validación comunitaria. No se dispone de model card, informe técnico ni resultados de evaluación asociados a esta conversión concreta.

Por tanto, esta ficha describe lo que puede inferirse de los metadatos del repositorio (tags, tamaño, parámetros, licencia y modelo base) y marca explícitamente como "no disponible" todo aquello que no está documentado: composición del dataset de calibración, hiperparámetros del QAT, idiomas soportados y rendimiento medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 con escalado por bloques, formato NVIDIA), QAT con LoRA r=4; tags indican "8-bit" y "compressed-tensors" |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-9B, un transformer decoder-only de la familia Qwen3.5 de Alibaba Qwen con 9.409.813.744 parámetros. No se dispone en la información proporcionada de detalles sobre su arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención, uso de atención lineal o híbrida, ni longitud de contexto nativa), ni sobre el corpus de preentrenamiento, el volumen de tokens o las etapas de alineación (SFT, RLHF, DPO) aplicadas por el desarrollador original.

La innovación de este checkpoint concreto es el proceso de cuantización: se parte del modelo en precisión completa y se aplica quantization-aware training con adaptadores LoRA de rango 4 para compensar la pérdida de precisión al pasar a NVFP4, un formato de 4 bits con escalas compartidas por bloques introducido por NVIDIA para acelerar la inferencia en GPUs Blackwell. El resultado se serializa con la librería compressed-tensors, lo que permite cargarlo directamente en vLLM. No se documentan el dataset de calibración, el número de pasos de QAT, la elección de bloques ni métricas de degradación respecto al modelo original.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B; no se documentan capacidades específicas adicionales en este checkpoint.
- Generación de código y matemáticas: presumiblemente presentes por la familia del modelo base, pero sin evaluación publicada para esta conversión.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el campo de idiomas del repositorio está vacío).
- Modo thinking, visión o audio: no documentado; no hay indicios en los tags de que el checkpoint incluya torres multimodales.
- Inferencia acelerada en FP4: capacidad operativa del formato NVFP4 cuando se ejecuta en hardware compatible (GPU Blackwell) con vLLM.

## Casos de uso

- Despliegue de bajo coste en GPUs Blackwell: el checkpoint en NVFP4 está pensado para servirse con vLLM en hardware con soporte nativo de FP4, reduciendo el peso en memoria a ~8,9 GB y permitiendo mayor concurrencia por GPU que una versión BF16 del mismo modelo.
- Servicio de chat interno con contexto medio: un modelo de ~9B cuantizado a 4 bits puede atender conversaciones multi-turno en entornos con presupuesto de VRAM limitado, siempre que se valide la calidad tras la cuantización.
- Generación de código asistida en herramientas de desarrollo: si el modelo base conserva sus capacidades de código, puede integrarse en asistentes de IDE o pipelines de revisión, aunque requiere evaluación previa por la falta de benchmarks publicados.
- Prototipado de agentes con tool calling: adecuado para experimentar con flujos de función-calling en local o en una sola GPU, con la cautela de que el soporte exacto no está documentado para este checkpoint.
- Fine-tuning posterior sobre los adaptadores LoRA: al ser un artefacto QAT con LoRA r=4, puede servir como punto de partida para ajustes específicos de dominio, aunque la combinación de cuantización y nuevo fine-tuning exige validación cuidadosa.
- Investigación en cuantización: útil como caso de estudio de QAT con NVFP4 sobre un modelo de 9B, comparando su salida con el modelo base en BF16 para medir la degradación introducida.
- Evaluación comparativa de formatos: permite contrastar NVFP4 frente a GGUF/AWQ/GPTQ en el mismo modelo base dentro de un banco de pruebas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 9-10 GB solo para pesos en NVFP4 (repo de 8,9 GB), más overhead de KV cache y activaciones; el consumo real depende de la longitud de contexto y del número de secuencias concurrentes.
- GPUs recomendadas: GPUs NVIDIA Blackwell (B200, GB200, RTX 50 series) por el soporte nativo de NVFP4; el soporte en arquitecturas anteriores (Hopper, Ada) puede requerir emulación o no estar disponible en vLLM.
- ¿Cabe en GPU de consumo? Sí, en términos de peso, en GPUs con al menos ~12-16 GB de VRAM y soporte del formato; sin confirmación oficial para tarjetas no Blackwell.
- Opciones de despliegue: vLLM es la vía indicada por los tags del repositorio (librería "vllm" y formato compressed-tensors). No se documenta compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qatfactory/Qwen3.5-9B-NVFP4-LoRA-r4-QAD | 9,41B | no disponible | NVFP4 + QAT (LoRA r=4) | Apache 2.0 | Gated, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | 9,41B | no disponible | BF16 (presumible) | Apache 2.0 | Público en Hugging Face |
| Otras cuantizaciones del mismo base (AWQ, GPTQ, GGUF) | 9,41B | no disponible | 4-8 bits | Apache 2.0 | no disponible en la búsqueda |

La comparación se limita al modelo base por falta de datos sobre alternativas concretas de cuantización NVFP4 del mismo modelo. No se dispone de métricas de calidad que permitan establecer diferencias de rendimiento entre esta conversión y el original.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni informes de terceros.
- Riesgo de degradación por cuantización: el paso a FP4 puede afectar a tareas sensibles a la precisión numérica (matemáticas, código, razonamiento largo); no se publican métricas de degradación frente al modelo base.
- Falta de documentación: no hay model card con dataset de calibración, hiperparámetros de QAT, idiomas ni evaluación, lo que dificulta auditar el artefacto.
- Dependencia de hardware: NVFP4 está orientado a GPUs Blackwell; en otras arquitecturas el rendimiento o la compatibilidad pueden no estar garantizados.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; sin evaluación específica no puede acotarse.
- Sesgos: no documentados para este checkpoint; se heredan los del modelo base, que tampoco se detallan en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que las condiciones del modelo base y de los datos de calibración sean compatibles.
- Fecha de creación futura en los metadatos (2026-11-04): conviene tratar las fechas con cautela y verificar la procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qatfactory/Qwen3.5-9B-NVFP4-LoRA-r4-QAD
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
