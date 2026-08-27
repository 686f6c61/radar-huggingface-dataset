# mradermacher/Llama-Poro-2-8B-Long-Instruct-heretic-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic`, un modelo de 8.030 millones de parámetros basado en la familia Llama-Poro-2, con licencia llama3.3. El modelo ha sido sometido a un proceso de "abliteración" (técnica que elimina las capas de rechazo y censura), lo que lo convierte en una opción "uncensored" para generación de texto sin restricciones de contenido. Está entrenado con el dataset de instrucciones `LumiOpen/poro2-instruction-collection` y soporta inglés y finlandés.

La relevancia de esta ficha radica en que ofrece una colección de archivos GGUF listos para usar en entornos locales con llama.cpp, Ollama u otros motores compatibles, permitiendo a desarrolladores e investigadores desplegar un modelo de 8B sin censura en hardware de consumo. No se dispone de información detallada sobre la arquitectura interna, el contexto máximo o los datos de entrenamiento más allá del dataset mencionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder-only, sin confirmar) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, fi |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura del modelo base en la información disponible. El nombre "Llama-Poro-2" sugiere una derivación de la familia Llama, pero no hay confirmación oficial. El modelo ha sido entrenado con el dataset `LumiOpen/poro2-instruction-collection`, que contiene instrucciones en inglés y finlandés. Además, se ha aplicado una técnica de "abliteración" (abliteration) que elimina las capas de rechazo del modelo original, resultando en una versión "heretic" o "uncensored". No se indica si se usó RLHF, DPO u otro método de alineación posterior.

## Capacidades

- Generación de texto conversacional en inglés y finlandés.
- Modelo "uncensored" (abliterated) que no aplica filtros de contenido, lo que permite generar respuestas sobre temas que otros modelos rechazarían.
- Soporte para inferencia local mediante archivos GGUF, compatible con llama.cpp, Ollama, LM Studio y otros motores.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Chatbots sin restricciones de contenido: el modelo puede usarse para crear asistentes conversacionales que no rechacen preguntas sobre temas sensibles, gracias a su naturaleza abliterated.
- Generación de ficción y escritura creativa: al no tener censura, es adecuado para explorar narrativas adultas o controvertidas sin limitaciones impuestas por el modelo.
- Traducción y procesamiento de texto en finlandés: al estar entrenado con datos en fi, puede servir para tareas de generación o resumen en este idioma.
- Prototipado rápido de aplicaciones de IA en local: al ser GGUF, se puede integrar en entornos de desarrollo con pocos recursos, usando cuantizaciones pequeñas como Q4_K_M.
- Investigación sobre alineación y censura: permite estudiar el comportamiento de modelos sin capas de rechazo y comparar con versiones originales.
- Despliegue en edge devices: las cuantizaciones de menor tamaño (Q2_K, Q3_K_S) caben en dispositivos con 4-6 GB de RAM, habilitando inferencia en portátiles o SBCs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los tamaños de archivo varían desde 3.3 GB (Q2_K) hasta 16.2 GB (f16). Para inferencia, se recomienda al menos 1-2 GB adicionales de VRAM o RAM sobre el tamaño del archivo.
- Con cuantizaciones Q4_K_M (5.0 GB) o Q5_K_M (5.8 GB), una GPU con 8 GB de VRAM (por ejemplo, RTX 3070/4060) es suficiente para ejecutar el modelo con contexto moderado.
- Las cuantizaciones Q6_K (6.7 GB) y Q8_0 (8.6 GB) requieren GPUs con 10-12 GB de VRAM (RTX 3080/4080, A10, etc.).
- La versión f16 (16.2 GB) necesita al menos 20 GB de VRAM, por lo que se recomienda una A100, H100 o similar.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión a formato compatible), y cualquier motor que soporte GGUF.
- La latencia y el throughput dependen del hardware y la cuantización; no se proporcionan datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (tamaño 8B, abliterated). Se sugiere consultar directorios como Abliz.org o guías de modelos uncensored para alternativas, pero no hay datos concretos en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o dañino sin filtros. El usuario es responsable del uso que haga de él.
- No se ha verificado la calidad del modelo en tareas de razonamiento, código o matemáticas; su rendimiento en estos ámbitos es desconocido.
- La licencia llama3.3 impone condiciones de uso comercial que deben revisarse antes de desplegar el modelo en producción.
- El contexto máximo no está documentado; se recomienda probar con secuencias cortas para evitar degradación.
- Los archivos GGUF son cuantizaciones estáticas, no se han aplicado técnicas de imatrix o weighted quantization, lo que puede afectar ligeramente la perplejidad en comparación con versiones optimizadas.
- El modelo solo soporta inglés y finlandés; no es adecuado para otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Llama-Poro-2-8B-Long-Instruct-heretic-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic
- Dataset de instrucciones: https://huggingface.co/datasets/LumiOpen/poro2-instruction-collection
- Guía de cuantizaciones GGUF (referencia general): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
