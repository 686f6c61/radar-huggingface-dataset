# oxpuppy635/Huihui-gemma-4-E2B-it-qat-q4_0-unquantized-abliterated-GGUF

## Resumen

Huihui-gemma-4-E2B-it-qat-q4_0-unquantized-abliterated-GGUF es una version "abliterada" (sin mecanismos de rechazo) del modelo google/gemma-4-E2B-it-qat-q4_0-unquantized, publicada por el usuario oxpuppy635 en Hugging Face. El modelo base pertenece a la familia Gemma 4 de Google, en su variante E2B (orientada a eficiencia) con cuantizacion QAT (quantization-aware training) a q4_0 y posteriormente des-cuantizada ("unquantized"). La modificacion abliterated elimina las direcciones de activacion asociadas a rechazos mediante una tecnica de ablation aplicada con transformers, sin usar TransformerLens, tal y como describe el autor original huihui-ai.

El modelo se distribuye en formato GGUF para su uso con llama.cpp y Ollama, y conserva la licencia Apache 2.0 declarada en la model card, aunque el enlace de licencia apunta a los terminos de Gemma 4 de Google. El pipeline declarado es any-to-any, lo que sugiere capacidades multimodales de entrada y salida, aunque la informacion disponible no detalla que modalidades concretas cubre. El repositorio ocupa 13,8 GB y contiene 4.628.569.635 parametros segun los safetensors del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo reciente de Google; por otro, advierte de que se trata de una prueba de concepto con implicaciones legales y eticas importantes, sin garantias de seguridad y no recomendada para produccion ni para aplicaciones de cara al publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E2B; transformer, detalles no especificados) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun el ejemplo de llama-cli con `-c 262144`) |
| Tipos de cuantizacion | GGUF Q4_K (fichero principal); el nombre indica base q4_0 unquantized; modelo draft MTP en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a los terminos de Gemma 4 de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre del modelo base (gemma-4-E2B-it-qat-q4_0-unquantized) indica que se trata de una variante instruct ("it") de la familia Gemma 4, con cuantizacion consciente del entrenamiento (QAT) a q4_0 y posteriormente des-cuantizada a un formato de mayor precision. El pipeline any-to-any sugiere un modelo multimodal, pero no se especifican las modalidades ni la composicion del dataset de entrenamiento.

La innovacion principal de esta variante es la abliteracion: se eliminan las direcciones de activacion responsables de los rechazos mediante una implementacion "cruda" de prueba de concepto basada en transformers, sin TransformerLens, segun el repositorio remove-refusals-with-transformers. Ademas, el ejemplo de llama.cpp incluye decodificacion especulativa mediante un modelo draft MTP (`--spec-type draft-mtp`, `--spec-draft-n-max 4`), lo que sugiere soporte de multi-token prediction para acelerar la inferencia. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato instruct, segun los tags `conversational` y `any-to-any`.
- Capacidades multimodales potenciales (pipeline any-to-any), aunque las modalidades concretas no estan especificadas.
- Soporte de decodificacion especulativa con modelo draft MTP para acelerar la generacion.
- Ausencia de mecanismos de rechazo (abliterated/uncensored): el modelo no aplica filtros de seguridad en sus respuestas.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema transformers, llama.cpp y Ollama.
- No se dispone de informacion sobre tool calling, function calling, razonamiento multi-paso ni capacidades multilingues especificas.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparando respuestas frente a la version original de Gemma 4 para analizar que direcciones de activacion codifican los rechazos.
- Pruebas de red teaming controladas: sirve para generar respuestas que un modelo censurado no produciria y evaluar la robustez de filtros y clasificadores de contenido en entornos aislados.
- Experimentacion con abliteracion: util para reproducir y validar la tecnica remove-refusals-with-transformers sobre modelos de la familia Gemma, comparando resultados con y sin ablation.
- Evaluacion de decodificacion especulativa: el modelo incluye un draft MTP en bf16 que permite medir el impacto de la decodificacion especulativa en latencia y throughput con llama.cpp.
- Despliegue local en Ollama para pruebas de concepto: el tag `huihui_ai/gemma-4-abliterated:E2B-qat` permite ejecutar el modelo rapidamente en un equipo de desarrollo para experimentar con prompts sin restricciones.
- Analisis de sesgos y contenido danino en entornos de investigacion: util para estudiar que tipo de contenido genera un modelo sin filtros y documentar riesgos antes de disenar salvaguardas.
- Prototipado de asistentes conversacionales en entornos cerrados: dado su contexto de 262.144 tokens, puede usarse para conversaciones multi-turno largas en pruebas internas, siempre con revision manual de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF Q4_K de un modelo de ~4.628 millones de parametros ocupa aproximadamente 2,5-3 GB; el repositorio completo es de 13,8 GB e incluye el draft MTP en bf16.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo Q4_K cabe en GPUs consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070). Para el modelo completo en mayor precision se recomiendan GPUs con 16-24 GB (RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en el formato Q4_K con al menos 6 GB de VRAM.
- Opciones de despliegue: llama.cpp (con `llama-cli`, `llama-mtmd-cli`, `llama-server`), Ollama (tag `huihui_ai/gemma-4-abliterated:E2B-qat`) y transformers.
- Latencia y throughput: no disponibles. El autor proporciona un ejemplo de decodificacion especulativa con draft MTP que puede reducir la latencia, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-gemma-4-E2B-it-qat-q4_0-unquantized-abliterated-GGUF | 4.628.569.635 | 262.144 | apache-2.0 | GGUF | Variante abliterada, sin censura |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | 4.628.569.635 | no disponible | Gemma 4 license | safetensors | Modelo base original con filtros de seguridad |
| Otras variantes abliterated de huihui-ai | no disponible | no disponible | no disponible | GGUF | Familia de modelos sin censura del mismo autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido abliterado: su filtrado de seguridad esta significativamente reducido y puede generar contenido sensible, controvertido o inapropiado.
- No es apto para todas las audiencias: las salidas pueden ser inapropiadas para entornos publicos, menores de edad o aplicaciones que requieran alta seguridad.
- El autor declara que es una implementacion "cruda" de prueba de concepto, no un producto optimizado ni validado.
- Se recomienda su uso exclusivo en investigacion, pruebas o entornos controlados, evitando produccion o aplicaciones comerciales de cara al publico.
- No hay garantias de seguridad por defecto; huihui.ai no asume responsabilidad por las consecuencias de su uso.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas; al ser un modelo de ~4.600 millones de parametros, es esperable una tasa de alucinacion mayor que en modelos de mayor tamano.
- La licencia declarada es apache-2.0, pero el enlace apunta a los terminos de Gemma 4 de Google, lo que puede generar ambiguedad legal para uso comercial; conviene revisar ambas licencias antes de cualquier despliegue.
- No se dispone de informacion sobre sesgos conocidos, idiomas soportados ni limitaciones de contexto mas alla de los 262.144 tokens indicados en el ejemplo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/oxpuppy635/Huihui-gemma-4-E2B-it-qat-q4_0-unquantized-abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Repositorio de la tecnica de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Ollama (tag del modelo): https://ollama.com/huihui_ai/gemma-4-abliterated:E2B-qat
- Releases de Ollama: https://github.com/ollama/ollama/releases/
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Ko-fi del autor: https://ko-fi.com/huihuiai
