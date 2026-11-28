# afanasjev/Hy-MT3-7B-NVFP4

## Resumen

Hy-MT3-7B-NVFP4 es una versión cuantizada del modelo de traducción tencent/Hy-MT3-7B, publicada por el usuario afanasjev. Se trata de un checkpoint calibrado en formato NVFP4 (W4A4: pesos y activaciones en E2M1 con escalas de microbloque E4M3), generado con llm-compressor y empaquetado en el formato compressed-tensors. Su propósito es reducir el coste de memoria y aumentar el rendimiento de inferencia del modelo base en GPUs NVIDIA Blackwell (DGX Spark GB10, RTX 5090, B200) sin reentrenar los pesos originales.

El modelo hereda la arquitectura hunyuan_v1_dense del modelo base, con 7.504.568.320 parámetros totales (aproximadamente 7,5 mil millones) y una tarea declarada de traducción automática. La cuantización a 4 bits en pesos y activaciones permite desplegarlo con una huella de memoria notablemente inferior a la de un checkpoint en bf16, lo que resulta relevante para escenarios de traducción en producción sobre hardware consumer de gama alta o nodos compactos como el DGX Spark.

La relevancia actual del checkpoint radica en que combina un modelo especializado en traducción con un esquema de cuantización de precisión muy baja diseñado específicamente para la generación Blackwell, un formato que vLLM soporta de forma nativa a través de compressed-tensors. No obstante, la información publicada por el autor es mínima: no se detallan idiomas soportados, composición del dataset de calibración ni resultados de evaluación tras la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parámetros totales | 7.504.568.320 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de despliegue con vLLM) |
| Tipos de cuantización | NVFP4 (W4A4: pesos y activaciones E2M1, escalas de microbloque E4M3) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo tencent/Hy-MT3-7B, que emplea la arquitectura hunyuan_v1_dense, un transformer denso de aproximadamente 7,5 mil millones de parámetros. La cuantización se realizó con llm-compressor en el esquema NVFP4, que cuantiza tanto pesos como activaciones a 4 bits (formato E2M1) con escalas de microbloque en E4M3. Este esquema requiere calibración con datos representativos para determinar las escalas, aunque el autor no especifica qué dataset de calibración se utilizó ni el número de muestras.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del corpus, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. Tampoco se documentan innovaciones técnicas adicionales del modelo base ni del proceso de cuantización más allá del esquema NVFP4 y su integración con compressed-tensors para vLLM.

## Capacidades

- Traducción automática: el pipeline declarado es translation, por lo que su función principal es la traducción entre idiomas.
- Generación de texto: el tag text-generation indica soporte de generación condicionada por prompt.
- Inferencia en GPUs Blackwell: el checkpoint está calibrado para ejecutarse con NVFP4 en hardware sm_121a (DGX Spark GB10) y otras GPUs Blackwell.
- Compatibilidad con vLLM: incluye configuración de despliegue con quantization=compressed-tensors, kv-cache-dtype=fp8, prefix caching, chunked prefill y async scheduling.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales y guías manteniendo terminología especializada, aprovechando su ventana de contexto de hasta 32.768 tokens para procesar secciones extensas sin truncamiento.
- Localización de sitios web y aplicaciones: integrado en un pipeline de CI/CD que envíe cadenas de recursos a un endpoint vLLM, el modelo traduce lotes de textos cortos con bajo coste de memoria gracias a la cuantización NVFP4.
- Traducción de subtítulos y transcripciones: con contexto largo y generación de texto, puede procesar segmentos de diálogo manteniendo coherencia entre turnos, desplegado en un DGX Spark GB10 con gpu-memory-utilization=0.25.
- Servicio de traducción en tiempo real de bajo coste: al ocupar una fracción de la VRAM de un modelo en bf16, permite atender múltiples secuencias concurrentes (max-num-seqs=64 en el ejemplo del autor) en una sola GPU consumer Blackwell como la RTX 5090.
- Traducción de correos y comunicaciones internas: el modelo puede integrarse en herramientas de mensajería corporativa para traducir hilos de conversación multi-turno, con prefix caching para reutilizar contexto repetido.
- Investigación en cuantización de precisión ultra-baja: sirve como referencia para estudiar la degradación de calidad de un modelo de traducción al pasar a W4A4, comparando salidas frente al checkpoint original en bf16.
- Preprocesado multilingüe de datasets: puede traducir grandes volúmenes de texto para construir corpus paralelos, beneficiándose del throughput de vLLM con chunked prefill y async scheduling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 5,0 GB en safetensors; con overhead de activaciones, KV cache en fp8 y contexto de 32.768 tokens, se estima un consumo de varios GB adicionales, aunque no se proporcionan cifras exactas.
- GPU recomendadas: NVIDIA Blackwell, incluyendo DGX Spark GB10, RTX 5090 y B200, según el autor.
- Compatibilidad con consumer GPU: sí, en GPUs Blackwell consumer como la RTX 5090; el ejemplo del autor usa gpu-memory-utilization=0.25 en un GB10.
- Opciones de despliegue: vLLM con --quantization=compressed-tensors; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; el autor solo indica parámetros de servicio (max-num-seqs=64, max-num-batched-tokens=32768, chunked prefill, prefix caching, async scheduling).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-7B-NVFP4 (este) | 7,5 B | 32.768 tokens (config. vLLM) | NVFP4 W4A4 | Apache-2.0 | Hugging Face |
| tencent/Hy-MT3-7B | 7,5 B | no disponible | bf16 (original) | Apache-2.0 | Hugging Face |
| Alternativas de traducción de ~7B | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo base tencent/Hy-MT3-7B, del que este checkpoint es una cuantización directa. No se dispone de datos de rendimiento comparado con otros modelos de traducción de tamaño similar.

## Limitaciones y advertencias

- La cuantización W4A4 puede degradar la calidad de traducción respecto al modelo base en bf16; el autor no publica evaluaciones que cuantifiquen esa pérdida.
- El checkpoint está diseñado para GPUs NVIDIA Blackwell (sm_121a); no funcionará en arquitecturas anteriores sin soporte de NVFP4.
- No se especifican los idiomas soportados ni la calidad por par de idiomas, lo que impide garantizar cobertura multilingüe.
- No se documenta el dataset de calibración, por lo que se desconoce si la cuantización está sesgada hacia dominios o idiomas concretos.
- Riesgo de alucinación y sesgos del modelo base: no disponible en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero se heredan las condiciones del modelo base tencent/Hy-MT3-7B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- El despliegue requiere --trust-remote-code, lo que implica ejecutar código del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/afanasjev/Hy-MT3-7B-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- llm-compressor: https://github.com/vllm-project/llm-compressor
