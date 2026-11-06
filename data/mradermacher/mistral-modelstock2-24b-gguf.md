# mradermacher/Mistral-modelstock2-24B-GGUF

## Resumen

Mistral-modelstock2-24B-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo hotmailuser/Mistral-modelstock2-24B, publicada por el usuario mradermacher, conocido en Hugging Face por distribuir versiones cuantizadas de modelos abiertos. El modelo subyacente es un merge de 23.572.403.200 parámetros (aproximadamente 23,6 mil millones) generado con mergekit, lo que indica que se trata de una fusión de pesos de otros modelos en lugar de un entrenamiento desde cero. La licencia declarada es Apache 2.0 y el idioma soportado es exclusivamente inglés.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~24B en hardware de consumo mediante cuantizaciones que van desde 9,0 GB (Q2_K) hasta 25,2 GB (Q8_0). Al ser un merge sin model card técnica detallada, no se dispone de información sobre arquitectura interna, contexto máximo, datos de entrenamiento ni benchmarks publicados. Esto obliga a tratar el modelo como una caja negra y a validar su comportamiento empíricamente antes de usarlo en producción.

El repositorio tiene 89 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción muy limitada. El tamaño total del repo es de 161,4 GB, correspondiente a la suma de todas las variantes GGUF ofrecidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base generado con mergekit; presumiblemente transformer, sin confirmar) |
| Parámetros totales | 23.572.403.200 (~23,6B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base hotmailuser/Mistral-modelstock2-24B. La etiqueta `mergekit` y el campo `merge` en los tags indican que fue creado mediante fusión de pesos de otros modelos, no mediante entrenamiento supervisado o RLHF desde cero. El nombre "Mistral" sugiere una posible base de la familia Mistral, pero no hay confirmación documental en la información proporcionada. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de alineación (RLHF/DPO).

Las cuantizaciones de mradermacher son estáticas (no ponderadas ni con imatrix), según indica el propio autor: "weighted/imatrix quants seem not to be available (by me) at this time". Esto implica que las versiones IQ y K-quants se generaron sin calibración con datos de activación, lo que puede producir una pérdida de calidad algo mayor que las cuantizaciones imatrix en rangos bajos (Q2–Q4). El autor recomienda Q4_K_S y Q4_K_M como opciones rápidas, y Q6_K y Q8_0 como las de mayor calidad.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo multi-turno.
- Razonamiento y generación de texto general: capacidades presumibles por el tamaño (23,6B), pero no verificadas ni documentadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en la infraestructura de inferencia de Hugging Face.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con Q4_K_M (14,4 GB) el modelo cabe en GPUs de 16 GB o más, permitiendo ejecutar un modelo de ~24B en hardware asequible mediante llama.cpp u Ollama.
- Prototipado de asistentes conversacionales en inglés: el tag `conversational` y el formato GGUF permiten integrarlo rápidamente en aplicaciones de chat locales sin depender de APIs externas.
- Experimentación con merges de modelos: útil para investigadores que quieran evaluar el comportamiento de un merge de 24B frente a sus componentes originales, aunque sin documentación del proceso de fusión.
- Generación de texto offline y privacidad de datos: al ejecutarse localmente con llama.cpp, los datos no salen del equipo, adecuado para entornos con requisitos de confidencialidad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantización, lo que permite medir el impacto de la compresión en la perplejidad y la calidad de salida para este modelo concreto.
- Fine-tuning ligero sobre la versión desquantizada: partiendo del modelo base en safetensors, se podría adaptar a dominios específicos, aunque la falta de documentación sobre el entrenamiento original añade incertidumbre.
- Docencia y demostraciones de inferencia local: el rango de tamaños (9–25 GB) permite ilustrar el compromiso entre VRAM, velocidad y calidad en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead aproximado de 1–2 GB para contexto y KV cache):
  - Q2_K: ~10–11 GB
  - Q3_K_M: ~12,5–13,5 GB
  - IQ4_XS: ~14–15 GB
  - Q4_K_M: ~15,5–16,5 GB
  - Q5_K_M: ~18–19 GB
  - Q6_K: ~20,5–21,5 GB
  - Q8_0: ~26–27 GB
- GPU recomendadas:
  - Q4_K_M: RTX 4080/4090 (16–24 GB), RTX 3090 (24 GB), A10G (24 GB).
  - Q6_K y Q8_0: A100 40 GB, H100, o configuraciones multi-GPU.
  - Q2_K–Q3_K: RTX 4070 Ti Super (16 GB) o RTX 3080 (12 GB) con contexto reducido.
- Cabe en GPU de consumo: sí, hasta Q5_K_M en GPUs de 24 GB; Q4_K_M en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: transformers, vLLM o TGI (sujeto a que la arquitectura sea soportada).
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo denso de ~24B en Q4_K_M sobre una RTX 4090 suele generar del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-modelstock2-24B (este) | ~23,6B | no disponible | Apache 2.0 | GGUF, safetensors | Merge sin documentación técnica ni benchmarks |
| Mistral Small 24B (referencia de la familia) | ~24B | no disponible en esta ficha | Apache 2.0 (según versión) | safetensors, GGUF | Modelo oficial con model card y evaluaciones publicadas |
| Qwen2.5-32B-Instruct | ~32B | 128K (según versión) | Apache 2.0 | safetensors, GGUF | Mayor tamaño y contexto documentado; requiere más VRAM |
| Gemma 2 27B | ~27B | 8K | Gemma license | safetensors, GGUF | Licencia más restrictiva; contexto menor |

La comparación con Mistral Small 24B es la más directa por tamaño, pero no se dispone de datos que permitan afirmar equivalencia o superioridad de este merge. Frente a Qwen2.5-32B y Gemma 2 27B, este modelo ofrece menor tamaño que Qwen y licencia más permisiva que Gemma, pero carece de documentación y benchmarks que respalden su calidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks y model card técnica: no hay evidencia publicada de calidad, lo que impide recomendarlo para producción sin evaluación propia.
- Modelo merge sin documentación del proceso: se desconoce qué modelos se fusionaron, con qué pesos y qué datos de entrenamiento subyacen, lo que dificulta auditar sesgos o comportamientos.
- Solo inglés: no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño y agravado por la falta de evaluación.
- Cuantizaciones estáticas sin imatrix: las versiones Q2–Q4 pueden degradar la calidad más que cuantizaciones calibradas; el autor no ofrece variantes imatrix.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge de modelos de procedencia no documentada, conviene verificar que los modelos originales también sean compatibles con Apache 2.0 antes de explotarlo comercialmente.
- Adopción muy baja (89 descargas, 0 likes): poca comunidad, menos reportes de errores y menor probabilidad de correcciones.
- Fecha de actualización futura (2026-11-05): el repositorio podría haber sufrido cambios; verificar la integridad de los archivos descargados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mistral-modelstock2-24B-GGUF
- Modelo base: https://huggingface.co/hotmailuser/Mistral-modelstock2-24B
- Página de descargas del autor: https://hf.tst.eu/model#Mistral-modelstock2-24B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
