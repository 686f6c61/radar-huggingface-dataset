# blaj/MiniCPM-V-4.7-1B-DSpark-fp16-ov

## Resumen

MiniCPM-V-4.7-1B-DSpark-fp16-ov es una exportación a formato OpenVINO en precisión FP16 del modelo openbmb/MiniCPM-V-4.7-1B-DSpark, publicada por el usuario blaj. Se trata de un modelo auxiliar (draft model) diseñado para decodificación especulativa junto a un modelo objetivo cuantizado a INT8 del mismo linaje, dentro del ecosistema OpenVINO GenAI. El repositorio no contiene los pesos originales del modelo base, sino una conversión realizada con Optimum Intel tras verificar el SHA-256 de los pesos de origen.

La relevancia de esta ficha es acotada: no es un modelo de propósito general, sino un componente de infraestructura para acelerar la inferencia de un target MiniCPM-V-4.7-1B en hardware Intel. El tag `qwen3` sugiere que la arquitectura subyacente deriva de la familia Qwen3, aunque la model card no lo confirma explícitamente. El tamaño del repositorio (0,4 GB) es coherente con un modelo de 1B parámetros en FP16.

La información publicada por el autor es muy limitada y no incluye datos de entrenamiento, benchmarks ni especificaciones detalladas. Esta ficha refleja únicamente lo que consta en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques de atención lineal (17 bloques reportados); tag `qwen3` sugiere linaje Qwen3, no confirmado |
| Parametros totales | 1B (según nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (exportación); el target asociado es INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (exportado con Optimum Intel) |

## Arquitectura y entrenamiento

El modelo es una exportación, no un entrenamiento propio. Según la model card, se generó con el exportador estándar de Optimum Intel a partir de openbmb/MiniCPM-V-4.7-1B-DSpark, verificando el SHA-256 de los pesos fuente antes de la conversión. La arquitectura subyacente combina atención estándar con 17 bloques de atención lineal, un patrón híbrido habitual en modelos recientes para reducir el coste de la caché KV en contextos largos.

Un detalle técnico relevante: el exportador estándar de draft no consumió los tensores de la cabeza de confianza (confidence-head) del checkpoint original; el companion exportado es la cabeza de Markov. Esto implica que el mecanismo de verificación de tokens aceptados puede diferir del previsto por el autor del modelo base. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto como modelo draft en decodificación especulativa.
- Aceptación de tokens borrador observada en GPU junto al target INT8 asociado.
- Integración con OpenVINO GenAI 2027.0.0.0.dev20261119.
- Configuración probada: GPU, `KV_CACHE_PRECISION="f16"`, 17 bloques de atención lineal, 15 assistant tokens.
- Inferencia de imagen no verificada por el autor (a pesar de que el modelo base es multimodal).
- Soporte de tool calling, agentes, matemáticas o multilingüismo: no disponible en la información.

## Casos de uso

- Aceleración de inferencia en producción sobre hardware Intel: emparejar este draft FP16 con el target INT8 del mismo linaje permite decodificación especulativa en GPU Intel con OpenVINO GenAI, reduciendo la latencia por token frente a decodificación solo del target.
- Despliegue en entornos con restricciones de memoria: al ocupar 0,4 GB en FP16, el draft puede residir junto al target en GPUs de gama media sin agotar la VRAM.
- Servicios de generación de texto de baja latencia: la configuración probada (15 assistant tokens, caché KV en f16) está pensada para maximizar la tasa de aceptación en cargas interactivas.
- Investigación en decodificación especulativa: sirve como caso de estudio reproducible para medir tasas de aceptación y divergencias entre decodificación greedy con y sin draft.
- Validación de pipelines OpenVINO: útil para probar la integración de Optimum Intel y OpenVINO GenAI en versiones de desarrollo (2027.0.0.0.dev).
- Prototipado de asistentes conversacionales sobre CPU/GPU Intel: combinado con el target INT8, permite montar un endpoint de generación de texto sin depender de GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la generación de texto y la aceptación de tokens draft se observaron en GPU, que la velocidad varía según el prompt y que la salida greedy no siempre es idéntica a la decodificación solo con el target. No se aportan cifras de throughput ni de latencia.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB para el draft en FP16; el consumo total depende del target INT8 emparejado.
- GPU recomendadas: GPUs Intel compatibles con OpenVINO GenAI (la model card solo confirma ejecución en GPU, sin especificar modelo).
- Cabe en GPUs de consumo: sí, por tamaño; la compatibilidad concreta depende del soporte de OpenVINO en la GPU elegida (integrada o dedicada Intel).
- Opciones de despliegue: OpenVINO GenAI 2027.0.0.0.dev20261119 con Optimum Intel; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica variabilidad según el prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Licencia | Formato |
|---|---|---|---|---|---|
| blaj/MiniCPM-V-4.7-1B-DSpark-fp16-ov | 1B | no disponible | Draft especulativo | Apache 2.0 | OpenVINO FP16 |
| blaj/MiniCPM-V-4.7-1B-int8-ov | 1B | no disponible | Target cuantizado | Apache 2.0 | OpenVINO INT8 |
| openbmb/MiniCPM-V-4.7-1B-DSpark | 1B | no disponible | Modelo base de origen | Apache 2.0 (según repositorio) | safetensors (presumible) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un modelo draft, no un modelo autónomo: su utilidad depende de emparejarlo con el target INT8 correspondiente.
- La exportación no incluyó los tensores de la cabeza de confianza; se exportó la cabeza de Markov, lo que puede alterar el comportamiento de verificación respecto al diseño original.
- La inferencia de imagen no fue verificada, pese a que el modelo base es multimodal.
- La salida greedy no es siempre idéntica a la decodificación solo con el target; no debe usarse donde se exija reproducibilidad exacta.
- Solo se ha probado una configuración concreta (GPU, KV en f16, 17 bloques de atención lineal, 15 assistant tokens); otros ajustes no están validados.
- Dependencia de una versión de desarrollo de OpenVINO GenAI (2027.0.0.0.dev20261119), con riesgo de incompatibilidad futura.
- Sin datos publicados sobre sesgos, alucinación, cobertura idiomática ni benchmarks.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución al modelo base y revisarse la licencia upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blaj/MiniCPM-V-4.7-1B-DSpark-fp16-ov
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-DSpark
- Target INT8 asociado: https://huggingface.co/blaj/MiniCPM-V-4.7-1B-int8-ov
- Optimum Intel: https://github.com/huggingface/optimum-intel
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
