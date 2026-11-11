# Renjie-Ranger/writing-fcp-scores-p10-bootstrap-step15-qwen2.5-7b

## Resumen

`writing-fcp-scores-p10-bootstrap-step15-qwen2.5-7b` es un ajuste fino del modelo Qwen2.5-7B orientado a la generacion de ficcion creativa condicionada por retroalimentacion numerica. Lo publica el usuario Renjie-Ranger en Hugging Face y deriva de un proceso de entrenamiento por refuerzo con feedback numerico en linea (Bootstrap) sobre un pool de prompts de escritura creativa. El modelo parte de un export offline entrenado con 101.959 historias y cuatro dimensiones de puntuacion, y anade 15 pasos globales de entrenamiento en linea con feedback proporcionado por DeepSeek Flash.

Se trata de un experimento de investigacion mas que de un modelo de produccion: el propio autor declara explicitamente que no se reclama ninguna mejora en la calidad de escritura para este export. La condicion evaluada es un prefijo con cuatro puntuaciones de 6/10 en las dimensiones Narrative Execution, Characterization and Emotional Impact, Originality and Creativity, y Prose and Style. Es relevante para quienes investigan condicionamiento por feedback numerico, control fino de atributos en generacion de texto y tecnicas de RLHF/DPO alternativas basadas en senales escalares.

El modelo conserva la arquitectura transformer decoder-only densa de Qwen2.5-7B, con 7.615.616.512 parametros reales en safetensors. El repositorio ocupa 15,2 GB e incluye pesos en BF16, tokenizer y configuracion, pero no estado de entrenamiento (optimizador, scheduler ni credenciales de API).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (base Qwen2.5-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B; no confirmada en la model card) |
| Tipos de cuantizacion | BF16 en el repositorio; no se publican otras variantes (GGUF, AWQ, GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) + tokenizer y configuracion |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B, un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. El ajuste fino no modifica la topologia ni el vocabulario del tokenizer, solo los pesos. El entrenamiento se realiza en dos fases: un export offline que cubre un decimo fijo del pool original de prompts de escritura (101.959 historias con feedback numerico en cuatro dimensiones) y un export en linea que parte del offline y ejecuta 15 pasos globales de Bootstrap con feedback generado por DeepSeek Flash.

La innovacion tecnica es el condicionamiento mediante un prefijo de feedback numerico delimitado por etiquetas `<EF>...</EF>`, con cuatro dimensiones puntuadas de 0 a 10. El autor advierte que la condicion positiva evaluada (cuatro 6/10 simultaneos) tiene cero ejemplos exactos en el conjunto offline y solo cinco ejemplos que cumplen los cuatro umbrales >=6, lo que limita la capacidad de generalizacion a esa condicion concreta. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni RLHF convencional.

## Capacidades

- Generacion de texto creativo en ingles: narrativa, ficcion y prosa condicionada por prefijos de puntuacion.
- Condicionamiento por feedback numerico en cuatro dimensiones (Narrative Execution, Characterization and Emotional Impact, Originality and Creativity, Prose and Style).
- Generacion conversacional segun el tag `conversational`.
- Uso del chat template incluido en el tokenizer para formatear las conversaciones.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas a ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en condicionamiento por feedback numerico: reproducir el pipeline de prefijos `<EF>` con puntuaciones para estudiar como el modelo responde a senales escalares en generacion creativa.
- Generacion de ficcion con control de atributos: prepender un prefijo con las cuatro dimensiones y ajustar las puntuaciones para explorar el efecto sobre el estilo y la estructura narrativa.
- Experimentos de evaluacion comparativa: usar el modelo como linea base frente a Qwen2.5-7B sin ajuste para medir el impacto del Bootstrap en la calidad de escritura.
- Generacion de historias para datasets sinteticos: producir narrativas en ingles con metadatos de puntuacion para entrenar o evaluar otros modelos.
- Analisis de sesgos en feedback numerico: estudiar si el modelo correlaciona las puntuaciones con caracteristicas superficiales del texto (longitud, vocabulario, estructura).
- Prototipado de asistentes de escritura creativa: integrar el modelo en un editor que traduzca criterios de calidad en un prefijo de puntuaciones antes de generar.
- Reproducibilidad de experimentos: el repositorio incluye `asset_manifest.json` con tamanos y hashes SHA256 para verificar la integridad de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama ninguna mejora en la calidad de escritura para este export.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion tipica de 18-24 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB; en 4 bits, alrededor de 4-5 GB (no se publican variantes cuantizadas, seria necesario generarlas).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16 con contexto largo.
- GPU consumer: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp u Ollama previa conversion a GGUF (no se proporcionan artefactos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| writing-fcp-scores-p10-bootstrap-step15-qwen2.5-7b | 7,6 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-7B (base) | 7,6 B | 32.768 tokens (segun documentacion oficial de Qwen) | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (segun documentacion oficial de Qwen) | Apache 2.0 | Ampliamente disponible |
| Mistral-7B-Instruct | 7,2 B | 32.000 tokens | Apache 2.0 | Ampliamente disponible |

La comparativa de rendimiento con alternativas no esta disponible en la informacion proporcionada. Las cifras de contexto de los modelos base se incluyen a titulo orientativo y no implican que este export las conserve o las haya evaluado.

## Limitaciones y advertencias

- El autor no reclama ninguna mejora en la calidad de escritura; el modelo es un experimento de investigacion.
- La condicion positiva evaluada (cuatro 6/10) tiene cero ejemplos exactos en el entrenamiento offline y solo cinco que cumplen los cuatro umbrales, lo que compromete la fiabilidad en esa condicion.
- Solo soporta ingles segun la model card; no se documenta capacidad multilingue.
- No se publican benchmarks, evaluaciones humanas ni metricas objetivas de calidad.
- Riesgo de alucinacion y de sesgos heredados de Qwen2.5-7B y del feedback de DeepSeek Flash, no auditados.
- La longitud de contexto efectiva no esta confirmada para este export.
- No se incluyen estado de entrenamiento, credenciales de API ni artefactos cuantizados; el despliegue en produccion requeriria trabajo adicional.
- Aunque la licencia es Apache 2.0, el uso comercial no esta avalado por evaluaciones de calidad; se recomienda validacion propia.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso comunitario ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Renjie-Ranger/writing-fcp-scores-p10-bootstrap-step15-qwen2.5-7b
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Paper de Qwen2: https://arxiv.org/abs/2407.10671
- DeepSeek Flash (proveedor de feedback en linea): https://huggingface.co/deepseek-ai
