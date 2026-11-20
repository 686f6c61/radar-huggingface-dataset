# florianvoss/Gemma-4-12B-it-GPTQ-a16w4-MTP

## Resumen

Gemma-4-12B-it-GPTQ-a16w4-MTP es un paquete de decodificación especulativa (speculative decoding) empaquetado en formato LLiMa para el acelerador SiMa.ai Modalix. Lo publica el usuario florianvoss y combina dos componentes: un modelo objetivo Gemma-4-12B-it pre-cuantizado en GPTQ INT4 con grupo de 256 (procedente de simaai/Gemma-4-12B-it-GPTQ-Safetensors) y un modelo asistente (draft) derivado de google/gemma-4-12B-it-assistant, compilado con pesos INT8 por canal de salida y activaciones BF16. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue que acelera la inferencia del Gemma 4 de 12 000 millones de parámetros sobre hardware específico.

El paquete está pensado para el runtime LLiMa con soporte de Gemma 4 Unified MTP (multi-token prediction). El asistente propone hasta seis tokens antes de cada pasada de verificación del objetivo con n7, y el contexto configurado es de 4096 tokens con prefill n128. Los embeddings del objetivo y la caché KV se mantienen en INT8.

Es relevante para desarrolladores que despliegan Gemma 4 en entornos edge o en aceleradores SiMa.ai, porque muestra cómo combinar cuantización agresiva del modelo objetivo (INT4) con un draft INT8 para reducir la latencia de decodificación sin cambiar el modelo base. El repositorio ocupa 15,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), con decodificación especulativa MTP; modelo objetivo + asistente draft |
| Parametros totales | 12B (modelo objetivo); parámetros del asistente no disponibles |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Objetivo: GPTQ INT4 G256 (grupo de 256); asistente: INT8 por canal de salida con activaciones BF16; embeddings del objetivo y caché KV en INT8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Paquete LLiMa (repo de 15,5 GB); modelo base en safetensors GPTQ |

## Arquitectura y entrenamiento

El modelo objetivo es Gemma-4-12B-it, un transformer de 12 000 millones de parámetros en su variante instruction-tuned, pre-cuantizado con GPTQ a INT4 con tamaño de grupo 256. El componente asistente procede de google/gemma-4-12B-it-assistant y se compila con pesos INT8 por canal de salida y activaciones BF16. La innovación técnica principal no está en el entrenamiento sino en el esquema de decodificación: un asistente propone hasta seis tokens candidatos y el objetivo los verifica en una pasada con n7, reduciendo el número de pasadas del modelo grande. El prefill se configura con n128 y el contexto operativo es de 4096 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo base. El artefacto publicado es una compilación de despliegue, no un proceso de entrenamiento nuevo.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Gemma-4-12B-it instruction-tuned subyacente.
- Decodificación especulativa multi-token: hasta seis tokens propuestos por el asistente antes de cada verificación n7 del objetivo.
- Despliegue en acelerador SiMa.ai Modalix mediante el runtime LLiMa.
- Contexto de 4096 tokens con prefill n128.
- Caché KV en INT8 y embeddings del objetivo en INT8.
- Capacidades multilingües, tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia de baja latencia en edge: el paquete está diseñado para ejecutarse en SiMa.ai Modalix con LLiMa, usando decodificación especulativa para reducir el tiempo por token en entornos con recursos limitados.
- Asistentes conversacionales embebidos: con 4096 tokens de contexto y cuantización INT4 del objetivo, encaja en dispositivos con memoria restringida que necesitan respuestas multi-turno.
- Despliegue de Gemma 4 en producción sobre hardware SiMa.ai: permite reutilizar el modelo base instruction-tuned sin reentrenar, aplicando el esquema MTP para acelerar la generación.
- Prototipado de pipelines de decodificación especulativa: sirve como referencia para evaluar el equilibrio entre precisión del draft INT8 y verificación del objetivo INT4.
- Evaluación de cuantización GPTQ INT4 G256 en tareas de generación: útil para medir la degradación de calidad frente al modelo en BF16 en el mismo hardware.
- Servicios con presupuesto de memoria ajustado: la combinación de embeddings y KV cache en INT8 reduce el footprint frente a configuraciones en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Acelerador objetivo: SiMa.ai Modalix, con runtime LLiMa que soporte Gemma 4 Unified MTP.
- Tamaño del repositorio: 15,5 GB, que incluye el objetivo GPTQ INT4 y el asistente INT8.
- VRAM estimada para GPU convencional: no disponible; el paquete está orientado a hardware SiMa.ai, no a GPU NVIDIA.
- GPU recomendadas (A100, H100, RTX 4090): no disponibles para este artefacto concreto.
- Opciones de despliegue: LLiMa (`llima run /path/to/Gemma-4-12B-it-GPTQ-a16w4-4k-MTP-INT8`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está indicada.
- Latencia y throughput: no disponibles; la model card solo especifica la configuración de decodificación (hasta 6 tokens propuestos, verificación n7, prefill n128).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| florianvoss/Gemma-4-12B-it-GPTQ-a16w4-MTP | 12B (objetivo) | 4096 | GPTQ INT4 G256 + draft INT8 | no disponible | Hugging Face, hardware SiMa.ai |
| simaai/Gemma-4-12B-it-GPTQ-Safetensors | 12B | no disponible | GPTQ safetensors | no disponible | Hugging Face |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | BF16 (base del draft) | no disponible | Hugging Face |
| google/gemma-4-12B-it | 12B | no disponible | BF16 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de despliegue, no un modelo entrenado: las capacidades reales dependen del Gemma-4-12B-it subyacente.
- Contexto limitado a 4096 tokens, muy por debajo de ventanas habituales en modelos de 12B para tareas de documento largo.
- Dependencia de hardware: está compilado para SiMa.ai Modalix con LLiMa; no se indica compatibilidad con GPU convencional ni con runtimes estándar.
- Cuantización INT4 del objetivo y INT8 del draft pueden introducir degradación de calidad frente a BF16; no se aportan métricas de esa pérdida.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de fiabilidad.
- Repositorio sin descargas ni likes: no hay evidencia de validación por la comunidad.
- La model card indica que hay que descargar el repositorio completo y ejecutar el directorio padre que contiene ambos modelos; un uso parcial puede fallar.

## Enlaces

- Hugging Face: https://huggingface.co/florianvoss/Gemma-4-12B-it-GPTQ-a16w4-MTP
- Modelo base (objetivo): https://huggingface.co/simaai/Gemma-4-12B-it-GPTQ-Safetensors
- Modelo base (asistente): https://huggingface.co/google/gemma-4-12B-it-assistant
