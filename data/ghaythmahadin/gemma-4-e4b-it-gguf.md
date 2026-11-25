# GhaythMahadin/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B es un modelo de lenguaje conversacional de Google, distribuido originalmente en formato GGUF por Unsloth y reempaquetado en este repositorio por GhaythMahadin como motor local para su proyecto «Marsad» (مرصد التحقق, observatorio de verificación). El repositorio contiene una única cuantización Q4_K_M del modelo instruct, orientada a inferencia local con llama.cpp.

El modelo declara 7.518.069.290 parámetros totales según los pesos en safetensors del modelo base, aunque la nomenclatura «E4B» sugiere una variante eficiente de la familia Gemma 4. La model card no aporta información sobre arquitectura interna, longitud de contexto ni composición del dataset de entrenamiento, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

La relevancia de este repositorio es limitada y de nicho: se trata de un espejo de cuantización con cero descargas y cero likes en el momento de la consulta, con licencia Apache-2.0 (sujeta además a los términos de uso de Gemma de Google). Para uso en producción conviene acudir al repositorio original de Unsloth o a los pesos oficiales de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, transformer; detalles no publicados en la información disponible) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única cuantización incluida en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con términos de uso de Gemma de Google) |
| Formato de pesos | GGUF (llama.cpp), con imatrix |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en los datos proporcionados. El tag `base_model` apunta a `unsloth/gemma-4-E4B-it-GGUF`, una conversión a GGUF del modelo instruct Gemma 4 E4B, y el tag `imatrix` indica que la cuantización Q4_K_M se generó usando una matriz de importancia (importance matrix) para mejorar la calidad de la cuantización en llama.cpp.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El sufijo `-it` del modelo base indica que se trata de una variante ajustada para instrucciones y conversación. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos) en la información disponible.

## Capacidades

- Generación de texto conversacional en modo instruct (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servirlo mediante infraestructura compatible con la API de Hugging Face.
- Ejecución local mediante llama.cpp en formato GGUF.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible. La model card está redactada en árabe, pero no se especifica qué idiomas soporta el modelo.

## Casos de uso

- Motor de inferencia local para verificación de afirmaciones: el autor declara que el modelo se usa como motor local gratuito en «Marsad» (observatorio de verificación), un escenario de procesamiento de texto sin dependencia de APIs externas.
- Despliegue en estaciones de trabajo sin GPU dedicada: al estar en GGUF Q4_K_M, puede ejecutarse en CPU con llama.cpp, útil para prototipos y entornos con recursos limitados.
- Asistente conversacional de escritorio: integrable en aplicaciones locales que requieran un chat instruct sin conexión a internet.
- Procesamiento por lotes de texto en local: clasificación, resumen o reescritura de documentos en pipelines offline, aprovechando el formato GGUF y la compatibilidad con llama.cpp.
- Base para experimentación con cuantizaciones: el uso de imatrix en la cuantización permite comparar la degradación de calidad frente a otros niveles de cuantización del mismo modelo base.
- Entorno de pruebas para desarrolladores: útil para validar integraciones con llama.cpp o servidores compatibles antes de migrar a los pesos oficiales de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5,5 GB con la cuantización Q4_K_M incluida (el repo completo ocupa 5,0 GB), más overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090, A100, H100). En GPUs de 6-8 GB puede requerir offloading parcial de capas.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; también puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), servidores compatibles con endpoints de Hugging Face. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B it (este repo, Q4_K_M) | 7.518.069.290 | no disponible | Apache-2.0 + terminos Gemma | GGUF | Espejo de terceros, 0 descargas |
| unsloth/gemma-4-E4B-it-GGUF (base) | no disponible | no disponible | Apache-2.0 + terminos Gemma | GGUF | Repositorio original de la conversion |
| Otros modelos de ~7-8B de la familia Gemma | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio de terceros con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad; verificar el SHA-256 indicado (`85a896a047553e842f25297ee5b031d64ff30147d9c4af17b1e4b394cd1fab87`) antes de usar el archivo.
- La model card no documenta sesgos, tasas de alucinación ni evaluación de calidad; se desconoce el impacto de la cuantización Q4_K_M en tareas de razonamiento.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos de los cubiertos por el modelo base.
- Longitud de contexto no disponible: no apto para casos de uso que dependan de ventanas de contexto largas sin verificación previa.
- Licencia Apache-2.0 sujeta a los términos de uso de Gemma de Google; revisar las restricciones de uso comercial y las cláusulas de uso aceptable antes de desplegar en producción.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales; para producción de alta calidad se recomienda usar el modelo base en safetensors o cuantizaciones superiores (Q6_K, Q8_0).
- No se documenta si el repositorio recibirá actualizaciones ni mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GhaythMahadin/gemma-4-E4B-it-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
