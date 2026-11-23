# Malbit-M/Qwen3-ASR-1.7B-OpenVINO

## Resumen

Qwen3-ASR-1.7B-OpenVINO es una conversión no oficial del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B (desarrollado por el equipo Qwen) a formato OpenVINO IR, publicada por el usuario Malbit-M. El repositorio ofrece tres variantes de precisión —INT4, INT8 y FP16— empaquetadas para su uso con el runtime OpenVINO GenAI mediante la clase `ASRPipeline`. No se trata de un modelo entrenado desde cero ni de un fine-tune: es un artefacto de exportación y compresión de pesos sobre el checkpoint original de Qwen, fijado en la revisión `7278e1e70fe206f11671096ffdd38061171dd6e5`.

El modelo resuelve la transcripción de audio a texto (ASR) en inglés y coreano, con 1.700 millones de parámetros y licencia Apache-2.0 heredada del modelo base. Su relevancia radica en que permite ejecutar un modelo ASR de tamaño medio en CPU e iGPU Intel sin depender de CUDA, algo útil en despliegues de borde, portátiles y servidores sin GPU dedicada. La conversión incluye verificación de integridad mediante SHA-256 y pruebas de humo en CPU y GPU Intel, aunque no se han publicado métricas de calidad (WER/CER) ni benchmarks multilingües.

Es importante señalar que el repositorio figura como privado en el momento de la consulta, por lo que la descarga anónima no está disponible y se requiere autenticación. El autor declara no estar afiliado al equipo Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-ASR; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 (group-size 128, group-size-fallback adjust, ratio 0.8), INT8, FP16 |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (XML/BIN) con tokenizer y configuración asociados |

## Arquitectura y entrenamiento

El modelo base es Qwen3-ASR-1.7B, un sistema de reconocimiento automático de voz de 1.700 millones de parámetros. La información disponible no detalla la arquitectura interna del checkpoint original (composición de capas, mecanismo de atención, tokenizer de audio, etc.), por lo que estos extremos deben consultarse en la model card oficial de Qwen. Lo que sí se documenta es el proceso de conversión: exportación a OpenVINO IR con compresión de pesos en tres precisiones, usando `openvino==2026.4.1` como entorno de conversión.

No se han publicado en la información disponible datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas del modelo original más allá de su naturaleza ASR. La conversión en sí no introduce cambios arquitectónicos: es una transformación de formato y precisión numérica destinada a ejecución en hardware Intel. Cada carpeta de precisión (`int4/`, `int8/`, `fp16/`) debe usarse de forma íntegra, sin mezclar ficheros XML/BIN/tokenizer/configuración entre variantes; en particular, la configuración de cuantización de INT8/INT4 no debe copiarse a `fp16/`, que carece de `openvino_config.json`.

## Capacidades

- Reconocimiento automático de voz (speech-to-text) en inglés y coreano.
- Transcripción de audio mono a 16 kHz mediante `ov_genai.ASRPipeline`.
- Ejecución en CPU e iGPU Intel a través de OpenVINO GenAI.
- Tres perfiles de precisión para balancear memoria y velocidad: INT4 (mínimo footprint), INT8 (equilibrio) y FP16 (mayor fidelidad numérica).
- Generación con límite configurable de tokens de salida (`max_new_tokens`).
- No incluye diarización de hablantes.
- No incluye alineamiento a nivel de palabra.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción en portátiles sin GPU dedicada: con la variante INT4 o INT8 y OpenVINO en CPU, se puede transcribir audio en tiempo casi real sin depender de CUDA, útil para herramientas de dictado o subtitulado local.
- Subtitulado de reuniones en inglés y coreano: el modelo procesa audio mono a 16 kHz y devuelve texto, integrable en pipelines de post-proceso para generar subtítulos en aplicaciones de videoconferencia.
- Despliegue en dispositivos de borde con iGPU Intel: la variante FP16 o INT8 permite ejecutar ASR en mini-PC, NUC o portátiles con gráficos integrados Intel, reduciendo coste frente a soluciones con GPU dedicada.
- Preprocesado de voz para pipelines de NLP: transcripción previa a tareas de resumen, búsqueda o análisis de sentimiento en inglés y coreano, usando el modelo como primer eslabón del pipeline.
- Transcripción por lotes en servidores CPU: al no requerir GPU, se pueden paralelizar instancias en servidores convencionales para procesar archivos de audio en cola.
- Integración en aplicaciones de accesibilidad: dictado por voz o generación de transcripciones para personas con discapacidad auditiva en entornos donde no hay hardware NVIDIA disponible.
- Evaluación y prototipado de ASR en OpenVINO: sirve como referencia para medir latencia y consumo en CPU/iGPU Intel antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER, CER, MMLU, etc.) en la información disponible. El autor indica explícitamente que las pruebas realizadas son «smoke tests» de una sola muestra y no mediciones representativas de calidad ni rankings de velocidad.

Los únicos datos de rendimiento publicados son tiempos de carga e inferencia en pruebas de humo:

| Variante | Dispositivo | Carga | Inferencia |
|---|---|---|---|
| INT4 | CPU | 2,906 s | 2,931 s |
| INT4 | GPU Intel | 6,837 s | 3,118 s |
| INT8 | CPU | 3,343 s | 2,250 s |
| INT8 | GPU Intel | 8,315 s | 4,040 s |
| FP16 | CPU | 3,112 s | 6,639 s |
| FP16 | GPU Intel | 10,197 s | 3,731 s |

Estos valores corresponden a muestras individuales y no deben interpretarse como garantías de rendimiento en producción.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 1,7B en FP16 ocupa aproximadamente 3,4 GB de pesos, en INT8 unos 1,7 GB y en INT4 en torno a 0,9 GB, a lo que hay que sumar overhead del runtime y buffers de audio.
- GPU recomendadas: el autor solo valida CPU e iGPU Intel mediante OpenVINO GenAI. No se documenta soporte para A100, H100 ni RTX 4090 en esta conversión.
- Cabe en GPU de consumo: sí en el sentido de que el footprint es reducido, pero la ruta de ejecución validada es OpenVINO en CPU/iGPU Intel, no CUDA.
- Opciones de despliegue: OpenVINO GenAI `ASRPipeline` (runtime principal). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se dispone de los tiempos de humo de la tabla anterior; no hay mediciones de throughput ni de latencia en streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-OpenVINO (este) | 1,7B | No disponible | en, ko | Apache-2.0 | OpenVINO IR (INT4/INT8/FP16) | Conversión no oficial, repo privado, validado en CPU/iGPU Intel |
| Qwen3-ASR-1.7B (original) | 1,7B | No disponible | en, ko | Apache-2.0 | Safetensors (presumiblemente) | Checkpoint oficial de Qwen; requiere runtime compatible con PyTorch |
| Whisper large-v3 | 1,55B | No disponible en esta ficha | Multilingüe | MIT (según versión) | Safetensors, GGUF, etc. | Referencia ASR ampliamente adoptada; no comparado en benchmarks en esta información |
| Whisper small | 244M | No disponible en esta ficha | Multilingüe | MIT (según versión) | Safetensors, GGUF, etc. | Alternativa ligera para CPU; no comparable en tamaño |

No se dispone de datos de benchmarks que permitan comparar calidad (WER/CER) entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El repositorio está marcado como privado: la descarga anónima no está disponible y requiere autenticación.
- No es una release oficial de Qwen; el autor no está afiliado al equipo Qwen.
- Solo se soportan inglés y coreano; no hay evidencia de otros idiomas.
- No se han publicado métricas de calidad (WER/CER) ni benchmarks multilingües.
- Los tiempos de carga e inferencia son pruebas de humo de una sola muestra, no representativos de producción.
- No incluye diarización ni alineamiento a nivel de palabra.
- La coincidencia de hashes SHA-256 no garantiza reproducibilidad byte a byte de las conversiones.
- El audio de prueba no está incluido en el repositorio.
- Cada carpeta de precisión debe usarse intacta; mezclar ficheros entre variantes puede romper la inferencia.
- La licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos de licencia y atribución (`LICENSE`, `NOTICE`, `PROVENANCE.md`).
- No se documenta compatibilidad con GPUs NVIDIA, AMD ni otros runtimes distintos de OpenVINO GenAI.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; aplican los del modelo base Qwen3-ASR-1.7B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Malbit-M/Qwen3-ASR-1.7B-OpenVINO
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Revisión upstream fijada: https://huggingface.co/Qwen/Qwen3-ASR-1.7B/tree/7278e1e70fe206f11671096ffdd38061171dd6e5
- Documentación OpenVINO GenAI ASR: https://openvinotoolkit.github.io/openvino.genai/docs/use-cases/speech-recognition/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
