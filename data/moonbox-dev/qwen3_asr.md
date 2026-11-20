# moonbox-dev/qwen3_asr

## Resumen

`moonbox-dev/qwen3_asr` es un repositorio de distribución de pesos, no un modelo original. Contiene conversiones a MLX (Apple Silicon) y cuantizaciones de los modelos de reconocimiento automático de voz Qwen3-ASR en sus variantes de 1.7B y 0.6B, junto con el alineador forzado Qwen3-ForcedAligner-0.6B y una conversión de Nemotron 3 Diarization de NVIDIA para etiquetado de hablantes. Lo publica moonbox-dev como parte de la infraestructura de descarga de la aplicación de escritorio Moonbox.

El interés práctico reside en que empaqueta un pipeline ASR completo (transcripción, marcas temporales a nivel de palabra, diarización de hablantes y subtítulos) en formato MLX cuantizado a 8 y 6 bits, listo para ejecutarse en hardware Apple. Los modelos base son obra de Alibaba Cloud (Qwen) y NVIDIA, con licencias Apache 2.0 y OpenMDW 1.1 respectivamente.

No es un lanzamiento oficial de los modelos originales: todos los archivos han sido convertidos, cuantizados o reempaquetados por Moonbox, y la aplicación verifica cada archivo contra una lista firmada antes de usarlo. El repositorio ocupa 16.4 GB e incluye tanto los pesos originales en safetensors como las variantes MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos base Qwen3-ASR; conversión MLX para Apple Silicon) |
| Parametros totales | 1.7B y 0.6B (Qwen3-ASR); 0.6B (ForcedAligner); Nemotron 3 Diarization sin datos |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit, 6-bit y mixta (MLX); pesos originales sin cuantizar en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (Qwen3-ASR y ForcedAligner); OpenMDW License Agreement 1.1 (Nemotron 3 Diarization) |
| Formato de pesos | safetensors (originales), MLX (cuantizados), PyTorch (Nemotron diarization para motor Windows) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna de los modelos base en la documentación disponible. El repositorio es un artefacto de distribución: contiene los pesos originales de Qwen3-ASR 1.7B y 0.6B, Qwen3-ForcedAligner-0.6B y Nemotron 3 Diarization, junto con conversiones propias a MLX en cuantización de 8 bits, 6 bits y mixta. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO.

La innovación técnica del paquete es de ingeniería de despliegue: adaptación de los modelos a MLX para ejecución nativa en Apple Silicon con cuantizaciones que reducen el peso en memoria, más la integración de un alineador forzado para marcas temporales por palabra y un modelo de diarización para etiquetado de hablantes. No hay información sobre decodificación especulativa ni mecanismos de atención particulares.

## Capacidades

- Transcripción de voz a texto (pipeline `automatic-speech-recognition`).
- Marcas temporales a nivel de palabra mediante Qwen3-ForcedAligner-0.6B.
- Etiquetado de hablantes (diarización) mediante Nemotron 3 Diarization.
- Generación de subtítulos a partir de las transcripciones y marcas temporales.
- Dos perfiles de rendimiento: 1.7B para máxima precisión y 0.6B para velocidad (aproximadamente tres veces más rápido según el autor, con algunos errores más).
- Ejecución en Apple Silicon mediante MLX con cuantización 8-bit, 6-bit y mixta.
- Soporte de motor Windows mediante los pesos PyTorch de Nemotron 3 Diarization.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el pipeline combina Qwen3-ASR con el alineador forzado y la diarización para producir transcripciones con marcas temporales por palabra y atribución de hablante, adecuado para actas y resúmenes posteriores.
- Generación de subtítulos para vídeo: las marcas temporales por palabra permiten construir archivos de subtítulos sincronizados sin postprocesado manual adicional.
- Procesamiento por lotes en local en equipos Apple: la cuantización 8-bit y 6-bit en MLX permite ejecutar la transcripción en Mac sin depender de servicios en la nube.
- Aplicaciones de notas de voz: la variante 0.6B, unas tres veces más rápida según el autor, sirve para dictado y transcripción rápida donde prima la latencia sobre la precisión exacta.
- Investigación en ASR sobre Apple Silicon: el repositorio ofrece pesos originales y conversiones MLX comparables para evaluar el impacto de la cuantización en la calidad de transcripción.
- Pipelines de accesibilidad: transcripción de contenido audiovisual con etiquetado de hablantes para generar subtítulos y descripciones en herramientas de accesibilidad.
- Integración en la aplicación Moonbox: el repositorio existe específicamente como origen de descarga de la app de escritorio, que verifica la integridad de cada archivo contra una lista firmada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado por el autor es cualitativo: la variante 0.6B es aproximadamente tres veces más rápida que la 1.7B, con algunos errores adicionales.

## Requisitos de hardware

- VRAM/unified memory estimada: no disponible de forma oficial; el repositorio completo ocupa 16.4 GB, pero cada variante cuantizada es sustancialmente menor (el tamaño exacto por archivo no se documenta).
- Hardware objetivo: Apple Silicon (MLX). No se documentan requisitos para GPU NVIDIA o AMD en la inferencia ASR.
- GPU recomendadas: no disponible. El paquete está orientado a ejecución en Mac; la diarización para Windows usa pesos PyTorch pero no se especifican GPU.
- ¿Cabe en hardware de consumo? Sí, en equipos Apple Silicon, dado que las cuantizaciones 8-bit y 6-bit están pensadas para ese mercado; no se detalla el mínimo de memoria unificada.
- Opciones de despliegue: MLX (Apple Silicon) y motor Windows propio de Moonbox con PyTorch para la diarización. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo la relación cualitativa de ~3x entre 0.6B y 1.7B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| moonbox-dev/qwen3_asr (paquete) | 1.7B / 0.6B + alineador 0.6B + diarizacion | no disponible | Apache 2.0 + OpenMDW 1.1 | Hugging Face (MLX, safetensors) |
| Qwen/Qwen3-ASR-1.7B (original) | 1.7B | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-0.6B (original) | 0.6B | no disponible | Apache 2.0 | Hugging Face |
| nvidia/Nemotron-3-Diarization (original) | no disponible | no disponible | OpenMDW 1.1 | Hugging Face |

La comparativa relevante es contra los modelos originales: este repositorio añade conversión MLX, cuantización y empaquetado conjunto, pero no modifica la arquitectura ni los datos de entrenamiento. No se dispone de datos de rendimiento comparativos entre las versiones originales y las cuantizadas.

## Limitaciones y advertencias

- No es un lanzamiento oficial: todos los archivos han sido convertidos, cuantizados o reempaquetados por Moonbox; deben tratarse como artefactos derivados, no como la release original.
- La cuantización a 8-bit, 6-bit y mixta puede degradar la precisión de transcripción respecto a los pesos originales; no se documenta la magnitud de esa degradación.
- Idiomas soportados no disponibles en la información proporcionada.
- No se documentan sesgos conocidos ni tasas de alucinación del modelo base.
- La diarización usa Nemotron 3 Diarization bajo OpenMDW License Agreement 1.1, distinta de Apache 2.0; conviene revisar sus términos antes de uso comercial.
- El repositorio está pensado para la aplicación Moonbox y verifica archivos contra una lista firmada; no se garantiza compatibilidad con otros pipelines sin trabajo de integración.
- El tamaño del repositorio (16.4 GB) incluye múltiples variantes y pesos originales, lo que puede ser excesivo si solo se necesita una cuantización concreta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moonbox-dev/qwen3_asr
- Qwen3-ASR 1.7B (original): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Qwen3-ASR 0.6B (original): https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Qwen3-ForcedAligner-0.6B: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Nemotron 3 Diarization (original NVIDIA): https://huggingface.co/nvidia/Nemotron-3-Diarization
- Nemotron 3 Diarization (conversión MLX): https://huggingface.co/mlx-community/Nemotron-3-Diarization
- Aplicación Moonbox: https://moonbox.dev
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
