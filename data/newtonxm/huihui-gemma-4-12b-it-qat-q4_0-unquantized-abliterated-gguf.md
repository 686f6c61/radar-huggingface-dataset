# newtonxm/Huihui-gemma-4-12B-it-qat-q4_0-unquantized-abliterated-GGUF

## Resumen

Huihui-gemma-4-12B-it-qat-q4_0-unquantized-abliterated-GGUF es una variante "abliterated" (sin rechazos) del modelo google/gemma-4-12B-it-qat-q4_0-unquantized, publicada por el usuario newtonxm en Hugging Face. El modelo base es un Gemma 4 de 12B parámetros en su versión instruction-tuned con QAT (quantization-aware training), distribuido en formato GGUF para su uso con llama.cpp y Ollama. La modificación principal consiste en la eliminación de las capas de rechazo mediante técnicas de abliteration, un proceso de edición de pesos que busca suprimir el comportamiento de negativa ante peticiones consideradas sensibles.

El modelo conserva la arquitectura del Gemma 4 original (transformer denso, 11.907.350.576 parámetros) y añade soporte para decodificación especulativa mediante el tag MTP (multi-token prediction), con un modelo draft separado en formato GGUF bf16. El pipeline declarado es any-to-any, aunque la información disponible no detalla qué modalidades adicionales soporta más allá del texto.

La relevancia de esta ficha radica en que documenta una variante experimental de un modelo reciente, con licencia Apache 2.0 según la model card (aunque el enlace de licencia apunta a los términos de Gemma 4 de Google), y con advertencias explícitas del autor sobre riesgos de contenido sensible. Es un artefacto orientado a investigación y entornos controlados, no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), con soporte MTP para decodificación especulativa |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (según el ejemplo de llama-cli con `-c 262144`) |
| Tipos de cuantizacion | GGUF (Q4_K en el ejemplo; el repo incluye el modelo base "q4_0-unquantized" y un draft MTP en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a los términos de Gemma 4 de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 12B parámetros en configuración densa, entrenado por Google con quantization-aware training (QAT) en su variante q4_0. La model card indica que se trata de la versión "unquantized" del checkpoint QAT, es decir, los pesos se distribuyen sin cuantizar pero conservan el comportamiento aprendido durante el entrenamiento consciente de cuantización. El pipeline declarado es any-to-any, lo que sugiere capacidades multimodales, aunque la información proporcionada no especifica qué modalidades concretas cubre.

La modificación abliterated se aplicó únicamente a las capas 23-36, según la model card, y afecta tanto al modo thinking como al modo no-thinking. El proceso se basa en la técnica de eliminación de rechazos implementada en remove-refusals-with-transformers, que identifica direcciones de activación asociadas a negativas y las proyecta fuera del espacio de activaciones. El autor lo describe como una implementación "cruda, proof-of-concept". No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en modo instruction-tuned, heredado del Gemma 4-it.
- Modo thinking y modo no-thinking, ambos con el filtrado de rechazos eliminado según la model card.
- Decodificación especulativa mediante MTP (multi-token prediction) con un modelo draft separado, lo que acelera la inferencia en llama.cpp.
- Soporte de contexto largo: el ejemplo de uso configura 262.144 tokens de ventana.
- Compatibilidad con llama.cpp (llama-cli, llama-mtmd-cli, llama-server) y Ollama mediante la imagen huihui_ai/gemma-4-abliterated:12b-qat.
- Pipeline any-to-any declarado, aunque las modalidades concretas no están detalladas en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration de las capas 23-36 afecta a la tasa de rechazos y a la calidad general de las respuestas, en un entorno controlado y con revisión manual de salidas.
- Pruebas de robustez de filtros: sirve para evaluar sistemas de moderación de contenido frente a un modelo con filtrado reducido, midiendo qué proporción de salidas inseguras detecta el clasificador externo.
- Generación creativa sin restricciones temáticas: para proyectos de ficción, guiones o narrativa que requieran abordar temas sensibles sin que el modelo se niegue, siempre con revisión humana posterior.
- Evaluación comparativa de cuantizaciones: al distribuirse en GGUF con variantes Q4_K y un draft MTP bf16, permite medir el impacto de la cuantización en calidad y velocidad frente al modelo base sin abliterar.
- Despliegue local con contexto largo: el ejemplo con `-c 262144` y `-ngl 99` muestra su uso en llama.cpp para tareas de resumen o análisis de documentos extensos en hardware con suficiente VRAM.
- Pruebas de decodificación especulativa: el par modelo principal + draft MTP permite experimentar con `--spec-type draft-mtp` y `--spec-draft-n-max 4` para medir aceleraciones en throughput.
- Entornos de investigación de sesgos: útil para analizar qué sesgos emergen cuando se eliminan las capas de rechazo, comparando respuestas con el Gemma 4-it original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: un modelo de 11,9B parámetros en Q4_K ocupa aproximadamente 6,5-7 GB de pesos; con contexto de 262.144 tokens, la caché KV puede añadir decenas de GB según la configuración, por lo que el contexto máximo requiere GPUs de centro de datos.
- GPU recomendadas: para contexto largo, A100 80 GB o H100; para contexto moderado (8K-32K), RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes con Q4_K.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y similares con cuantización Q4_K y contexto reducido.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server, llama-mtmd-cli), Ollama (imagen huihui_ai/gemma-4-abliterated:12b-qat), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible en la información proporcionada; el uso de MTP con draft bf16 y `--spec-draft-n-max 4` está pensado para reducir latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-gemma-4-12B-it-qat-q4_0-unquantized-abliterated-GGUF | 11,9B | 262.144 (según ejemplo) | apache-2.0 | GGUF | Variante abliterated, capas 23-36 modificadas |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 11,9B | no disponible | Términos Gemma 4 | safetensors | Modelo base original, con filtrado de seguridad intacto |
| huihui_ai/gemma-4-abliterated:12b-qat (Ollama) | 11,9B | no disponible | apache-2.0 | GGUF (Ollama) | Misma familia, distribución vía Ollama |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El filtrado de seguridad está significativamente reducido: la model card advierte de riesgo de salidas sensibles, controvertidas o inapropiadas.
- No es apto para todas las audiencias: los outputs pueden ser inapropiados para entornos públicos, menores o aplicaciones que requieran alta seguridad.
- El autor recomienda uso exclusivo en investigación, pruebas o entornos controlados, evitando producción o aplicaciones comerciales de cara al público.
- Se recomienda monitorización en tiempo real y revisión manual de las salidas para evitar la difusión de contenido inapropiado.
- La abliteration se aplicó solo a las capas 23-36 y el autor la describe como "cruda, proof-of-concept"; no hay garantía de que elimine todos los rechazos ni de que preserve la calidad del modelo base.
- La licencia declarada es apache-2.0, pero el license_link apunta a los términos de Gemma 4 de Google, lo que introduce ambigüedad sobre las restricciones reales de uso comercial.
- No hay información sobre idiomas soportados ni sobre sesgos específicos introducidos por la abliteration.
- El pipeline any-to-any sugiere multimodalidad, pero no se detallan las modalidades ni su calidad tras la modificación.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a cualquier modelo de esta escala sin benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newtonxm/Huihui-gemma-4-12B-it-qat-q4_0-unquantized-abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Términos de licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Técnica de abliteration (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/
- Ollama: https://github.com/ollama/ollama/releases/
- Imagen Ollama del modelo: https://ollama.com/huihui_ai/gemma-4-abliterated:12b-qat
- Ko-fi del autor: https://ko-fi.com/huihuiai
