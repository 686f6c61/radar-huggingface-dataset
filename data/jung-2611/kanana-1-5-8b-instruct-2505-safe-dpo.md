# jung-2611/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

kanana-1.5-8b-instruct-2505-Safe-DPO es un ajuste fino (fine-tuning) publicado por el usuario jung-2611 sobre el modelo kanana-1.5-8b-instruct-2505, un modelo de lenguaje de 8.030 millones de parámetros orientado a instrucciones. El autor lo ha entrenado con la librería Unsloth y TRL de Hugging Face, lo que según la model card permite un entrenamiento aproximadamente 2 veces más rápido. La model card es extremadamente escueta y no documenta el procedimiento de DPO, el dataset de seguridad utilizado ni los hiperparámetros del ajuste.

El modelo se distribuye con licencia Apache 2.0, un tamaño de repositorio de 16,1 GB (compatible con pesos en precisión bf16/fp16) y está etiquetado únicamente para inglés. El campo `base_model` de la model card apunta al propio repositorio, lo que constituye un error de metadatos y hace que la trazabilidad del modelo original no esté documentada de forma fiable. No se dispone de información publicada sobre arquitectura interna, contexto o datos de entrenamiento.

Su relevancia actual es limitada como referencia técnica: se trata de un experimento de ajuste de seguridad (el sufijo "Safe-DPO" sugiere una alineación con DPO para reducir respuestas inseguras) con cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados. Resulta útil como ejemplo de pipeline de fine-tuning ligero con Unsloth, pero no como modelo de producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama`; detalles internos no disponibles) |
| Parametros totales | 8.030.285.824 (8,03 mil millones) |
| Parametros activos | no disponible (no es MoE según los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo de 16,1 GB es consistente con bf16/fp16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura concreta no está documentada en la información disponible. Los tags del repositorio indican `llama`, `transformers` y `text-generation-inference`, lo que apunta a una familia de transformer decoder-only con el formato de tokenizador y configuración de Llama, pero no se especifican número de capas, dimensión oculta, cabezas de atención, tipo de atención (GQA/MHA) ni función de activación. Tampoco se documenta la longitud de contexto nativa.

El entrenamiento se describe únicamente como un fine-tuning realizado con Unsloth y la librería TRL de Hugging Face, con una mejora declarada de velocidad de 2x. El nombre del modelo sugiere una etapa de DPO (Direct Preference Optimization) orientada a seguridad, pero la model card no detalla el dataset de preferencias, el número de pasos, la tasa de aprendizaje, el valor de beta de DPO ni si se aplicó LoRA o un ajuste completo. El campo `base_model` está mal configurado (apunta al propio repositorio), por lo que no puede confirmarse con certeza sobre qué checkpoint exacto se realizó el ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instruct base.
- Ajuste orientado a seguridad mediante DPO (según el nombre del modelo; no verificado con evaluaciones publicadas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.

## Casos de uso

- Experimentación con pipelines de alineación: el modelo sirve como punto de partida para reproducir un flujo de DPO con Unsloth y TRL sobre un modelo instruct de 8B, útil en investigación de seguridad y preferencias.
- Evaluación de mitigación de respuestas inseguras: puede emplearse como candidato en pruebas comparativas (red teaming) frente al modelo base para medir la reducción de contenido dañino, siempre con un conjunto de evaluación propio.
- Generación de texto en inglés para prototipos: adecuado para demos internas de chatbots en inglés donde no se requiera latencia ni calidad de producción certificada.
- Base para fine-tuning específico de dominio: al ser un modelo de 8B con licencia Apache 2.0, puede adaptarse con LoRA a tareas concretas (clasificación, extracción, resumen) en inglés.
- Despliegue en hardware de consumo para pruebas: con cuantización a 4 bits cabe en GPUs de 8-12 GB, lo que permite validar el comportamiento del ajuste antes de escalar.
- Estudio de reproducibilidad de model cards: caso práctico para analizar problemas de metadatos (campo `base_model` autorreferente) y su impacto en la trazabilidad de modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bf16/fp16 (8,03B parámetros × 2 bytes), unos 8-9 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits (estimación teórica de pesos; no incluye caché KV).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para bf16 sin cuantizar con contexto amplio; RTX 4090 (24 GB) para bf16 con margen suficiente.
- GPU de consumo: sí cabe en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con cuantización a 4-8 bits.
- Opciones de despliegue: transformers, Text Generation Inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama tras conversión a GGUF (la conversión no está publicada en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03B | no disponible | Apache 2.0 | en | Hugging Face (0 descargas) |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community License | multilingüe | Amplia, con benchmarks publicados |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 (mayoría de variantes) | multilingüe | Amplia, con benchmarks publicados |
| Mistral 7B Instruct v0.3 | 7,2B | 32K | Apache 2.0 | en y otros | Amplia, con benchmarks publicados |

La comparación se limita a parámetros, contexto, licencia e idiomas porque este modelo no publica resultados de benchmarks ni especifica su ventana de contexto. Frente a las alternativas citadas, la diferencia principal es la ausencia de documentación técnica y de evaluaciones reproducibles.

## Limitaciones y advertencias

- La model card no documenta el dataset de DPO ni el procedimiento de alineación; el efecto real sobre la seguridad no está verificado.
- El campo `base_model` apunta al propio repositorio, lo que impide confirmar la procedencia exacta del checkpoint base.
- Riesgo de alucinación inherente a un modelo de 8B sin evaluaciones publicadas; no debe usarse en producción sin validación propia.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto desconocida; planificar el despliegue con un límite conservador hasta verificarlo.
- Sesgos: no se han publicado análisis de sesgo ni evaluaciones de toxicidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de revisión por terceros.
- El repositorio de 16,1 GB requiere almacenamiento y ancho de banda considerables para descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jung-2611/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Paper, blog o demo oficiales del modelo: no disponibles
