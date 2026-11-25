# GhaythMahadin/gemma-4-12b-it-GGUF

## Resumen

Gemma 4 12B IT es un modelo de lenguaje conversacional (instruction-tuned) de aproximadamente 11.900 millones de parámetros, distribuido originalmente por Google bajo la familia Gemma y republicado en formato GGUF por el usuario GhaythMahadin como copia de respaldo para el motor local gratuito «Marsad» (مرصد التحقق, "observatorio de verificación"). El repositorio contiene una única cuantización Q4_K_M optimizada con imatrix y empaquetada para llama.cpp, lo que permite ejecutar el modelo en hardware de consumo sin necesidad de infraestructura de GPU de datacenter.

La relevancia de esta ficha es doble: por un lado documenta una cuantización práctica de un modelo de la familia Gemma 4, con licencia Apache-2.0 (sujeta además a los términos de uso de Gemma de Google); por otro, es un ejemplo de repositorio de terceros con muy poca información publicada (0 descargas, 0 likes en el momento del análisis, sin model card técnica detallada ni idiomas declarados), lo que obliga a marcar numerosos campos como "no disponible".

No se dispone de información publicada sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks en la información proporcionada. Los datos que sí se conocen con certeza son el recuento de parámetros (11.907.350.576, según safetensors del modelo base), el formato GGUF, la cuantización Q4_K_M y el tamaño del repositorio (7,1 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia Gemma 4, según nomenclatura del modelo base) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con términos de uso de Gemma de Google) |
| Formato de pesos | GGUF (archivo `gemma-4-12b-it-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna en la información disponible. Por la nomenclatura del modelo base (`gemma-4-12b-it`) y el tag `conversational`, se trata de un modelo de la familia Gemma 4 en variante instruction-tuned, presumiblemente un transformer denso de unos 12.000 millones de parámetros, pero no se detalla el tipo de atención, la estrategia de normalización ni innovaciones como atención lineal o decodificación especulativa.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La cuantización Q4_K_M ha sido generada con `imatrix` (importance matrix), una técnica de calibración que reduce la pérdida de calidad en cuantizaciones de 4 bits ponderando la importancia de cada peso; es el único detalle técnico del proceso de empaquetado que aparece en la model card.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational` del repositorio.
- Instrucciones en formato chat (`-it`), orientado a asistentes y diálogo.
- Ejecución local mediante llama.cpp y motores compatibles con GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un equipo de sobremesa con llama.cpp u Ollama para mantener conversaciones multi-turno sin conexión a Internet, usando la cuantización Q4_K_M de 7,1 GB.
- Verificación y moderación de contenido en el contexto del proyecto «Marsad»: la model card indica que esta copia se usa como motor local gratuito para un observatorio de verificación, un caso de uso de análisis de texto y comprobación de afirmaciones.
- Prototipado de chatbots en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del dispositivo, lo que encaja con escenarios de datos sensibles.
- Generación de borradores y resúmenes de documentos: un modelo instruction-tuned de ~12B es adecuado para tareas de redacción asistida y condensación de texto en flujos de trabajo personales o de pequeña oficina.
- Base para ajuste fino posterior (fine-tuning): al estar bajo Apache-2.0 y con pesos en GGUF, puede servir como punto de partida para experimentos de adaptación, aunque para entrenamiento convendría partir de los pesos originales en safetensors del modelo base.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de Q4_K_M con imatrix frente al modelo sin cuantizar en tareas de razonamiento y generación.
- Integración en pipelines de CI/CD o herramientas de desarrollo: no disponible de forma específica, ya que no se documenta soporte de tool calling ni de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 7,1 GB; se recomienda al menos 8 GB de VRAM para cargar el modelo completo en GPU, o 8-10 GB de RAM si se ejecuta en CPU con offloading parcial.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en cuantización Q4_K_M; en 8 GB ajustados puede requerir offloading parcial de capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para servir el modelo con esos motores habría que usar los pesos originales en safetensors.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 12B IT (esta ficha, GGUF Q4_K_M) | 11.907.350.576 | no disponible | Q4_K_M con imatrix | Apache-2.0 + términos Gemma | Hugging Face, repo de terceros |
| Modelo base `unsloth/gemma-4-12b-it-GGUF` | 11.907.350.576 | no disponible | múltiples (repo de Unsloth) | Apache-2.0 + términos Gemma | Hugging Face, repo de Unsloth |
| Alternativas de ~12B de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Repositorio de terceros con muy poca información: 0 descargas y 0 likes en el momento del análisis, sin model card técnica detallada, lo que dificulta validar la procedencia exacta de la cuantización.
- No se declaran idiomas soportados; el rendimiento en castellano no está verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no disponible.
- Longitud de contexto no documentada; planificar las aplicaciones sin asumir ventanas largas.
- Licencia Apache-2.0, pero sujeta a los términos de uso de Gemma de Google; conviene revisar las restricciones de uso comercial y de redistribución antes de desplegar en producción.
- Al ser una única cuantización Q4_K_M, la calidad puede ser inferior a la del modelo original en precisión completa; para tareas sensibles se recomienda comparar con los pesos sin cuantizar.
- No se documenta soporte de tool calling, agentes ni multimodalidad; no asumir estas capacidades sin verificación empírica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/gemma-4-12b-it-GGUF
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-4-12b-it-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Términos de uso de Gemma de Google: https://ai.google.dev/gemma/terms
