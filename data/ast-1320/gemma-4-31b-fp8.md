# AST-1320/Gemma-4-31B-FP8

## Resumen

Gemma-4-31B-FP8 es una redistribución en precisión FP8 del modelo google/gemma-4-31B-it, publicada por el usuario AST-1320 en Hugging Face. Según la model card referenciada, el modelo deriva de la versión "abliterated" de huihui-ai (Huihui-gemma-4-31B-it-abliterated), en la que se han eliminado los mecanismos de rechazo (refusals) mediante técnicas de abliteration aplicadas tanto al modo de razonamiento (thinking) como al modo directo. El pipeline declarado es `any-to-any` (entrada y salida multimodal), y la librería es `transformers`.

El modelo cuenta con 31.273.088.876 parámetros totales según los pesos en safetensors, y el repositorio ocupa 33,3 GB, lo que es coherente con un almacenamiento en FP8 (aproximadamente 1 byte por parámetro más overhead). Está etiquetado como `image-text-to-text`, lo que indica capacidad de entrada de imagen y texto. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que introduce una ambigüedad relevante para uso comercial.

La relevancia de esta ficha radica en que se trata de un modelo derivado con filtros de seguridad reducidos, orientado a investigación y entornos controlados. No se dispone de información sobre idiomas soportados, datos de entrenamiento, benchmarks ni detalles de la cuantización FP8 más allá de lo indicado en la model card y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de google/gemma-4-31B-it; etiquetado `gemma4` en transformers) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (según el nombre del repositorio); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de que el modelo base es google/gemma-4-31B-it y de la etiqueta `gemma4` en la librería transformers. No se especifican el número de capas, la dimensión oculta, el tipo de atención ni si emplea mezcla de expertos. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica documentada es la abliteration: un procedimiento que elimina las direcciones de activación asociadas a los rechazos en el modelo, aplicado tanto en modo thinking como en modo no-thinking. Según la model card, se trata de una implementación "cruda" de prueba de concepto basada en remove-refusals-with-transformers, sin uso de TransformerLens. La versión FP8 es una conversión de precisión del modelo abliterated, sin que se documenten detalles del proceso de cuantización (escala, calibración, etc.).

## Capacidades

- Generación de texto y razonamiento en modo thinking y modo directo (ambos modos han sido abliterated según la model card).
- Procesamiento multimodal de entrada imagen-texto (pipeline `any-to-any`, etiqueta `image-text-to-text`).
- Capacidad declarada de salida multimodal (`any-to-any`), aunque no se detallan las modalidades de salida concretas.
- Generación sin filtros de rechazo, orientada a contenido que el modelo base rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparándolo con el modelo base para analizar qué direcciones de activación codifican los refusals y cómo afecta su eliminación a la calidad general.
- Evaluación de técnicas de abliteration: sirve como banco de pruebas para medir la degradación de capacidades (razonamiento, código, matemáticas) tras eliminar los filtros, en un entorno controlado de laboratorio.
- Pruebas de robustez de sistemas de moderación: al generar contenido que un modelo estándar rechazaría, permite validar que las capas de filtrado externas (clasificadores, listas de bloqueo) funcionan correctamente antes de desplegar un pipeline en producción.
- Red teaming interno: útil para que equipos de seguridad generen escenarios adversarios y evalúen la resistencia de sus aplicaciones ante prompts maliciosos.
- Experimentación multimodal controlada: con pipeline `any-to-any` e imagen-texto, permite probar flujos de descripción de imágenes o extracción de información visual en entornos de investigación, siempre con revisión humana.
- Desarrollo de datasets sintéticos para entrenamiento: puede generar ejemplos diversos (incluidos casos límite) que luego se filtran y curan manualmente para construir datasets de ajuste o evaluación.
- Despliegue local vía Ollama: la model card referencia `huihui_ai/gemma-4-abliterated:31B`, lo que facilita pruebas en máquinas con suficiente VRAM o RAM sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 33,3 GB en FP8, por lo que se necesitan al menos ~34 GB de VRAM para cargar los pesos en GPU sin offloading; con overhead de activaciones y KV cache, se recomienda 40-48 GB para contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB. En GPUs de 24 GB (RTX 4090, 3090) no cabe en FP8 sin offloading a CPU o cuantización adicional.
- Cabe en consumer GPU: no en FP8 completo; requeriría cuantizaciones adicionales (por ejemplo, GGUF Q4/Q5) para entrar en 24 GB, no documentadas en la información disponible.
- Opciones de despliegue: transformers (librería declarada), Ollama (referenciado en la model card con la variante `huihui_ai/gemma-4-abliterated:31B`). vLLM, TGI o llama.cpp no se mencionan explícitamente, aunque el formato safetensors es compatible con transformers y potencialmente con vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AST-1320/Gemma-4-31B-FP8 | 31,27 B | no disponible | apache-2.0 (enlace a Gemma 4) | Abliterated, FP8, multimodal any-to-any |
| google/gemma-4-31B-it | no disponible | no disponible | licencia Gemma 4 | Modelo base con filtros de seguridad |
| huihui-ai/Huihui-gemma-4-31B-it-abliterated | no disponible | no disponible | no disponible | Versión abliterated en precisión original |
| Otros modelos abliterated de ~30 B | variable | variable | variable | No se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Filtros de seguridad reducidos: la abliteration elimina los rechazos, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado. No es apto para audiencias públicas, menores ni aplicaciones que requieran alta seguridad.
- Riesgo de alucinación: no se documenta ninguna evaluación específica; al ser un derivado modificado, la fiabilidad factual puede diferir del modelo base.
- Ambigüedad de licencia: se declara apache-2.0 pero se enlaza la licencia de Gemma 4 de Google, que impone restricciones de uso. Es necesario verificar los términos aplicables antes de cualquier uso comercial.
- Idiomas y contexto no documentados: no se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta planificar despliegues multilingües o con ventanas largas.
- Precisión FP8: la cuantización a FP8 puede introducir degradación numérica respecto al modelo en BF16/FP16; no se documenta la metodología de calibración ni métricas de degradación.
- Uso recomendado solo en investigación y entornos controlados: la propia model card desaconseja el uso directo en producción o en aplicaciones comerciales de cara al público.
- Responsabilidad legal: el autor declara no asumir responsabilidad por las consecuencias del uso; el usuario debe cumplir la legislación local y estándares éticos.
- Repositorio con pocas descargas (99) y 0 likes: no hay evidencia comunitaria de validación ni de reproducibilidad de resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AST-1320/Gemma-4-31B-FP8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo abliterated de referencia: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-abliterated
- Repositorio de la técnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Ollama (modelo referenciado): https://ollama.com/huihui_ai/gemma-4-abliterated:31B
- Releases de Ollama: https://github.com/ollama/ollama/releases/
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
