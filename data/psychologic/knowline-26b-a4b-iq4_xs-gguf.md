# PsychoLogic/knowline-26B-A4B-IQ4_XS-GGUF

## Resumen

knowline-26B-A4B-IQ4_XS-GGUF es una cuantización en formato GGUF del modelo PelaAI/KnowLine-26B-A4B-Gen2.5, publicada por el usuario PsychoLogic. El modelo base es un transformer de arquitectura MoE (mixture of experts) con 25.233.142.046 parámetros totales y aproximadamente 4B parámetros activos, según se deduce de la nomenclatura "A4B" y de las mediciones de latencia del autor. La cuantización emplea el formato IQ4_XS de llama.cpp, con un tamaño de archivo de 14,1 GB (13.397 MiB en dry-run, 4,45 bits por peso).

El propósito declarado de esta publicación es ofrecer una variante que quepa en GPUs de 16 GB de VRAM. El autor midió explícitamente la escalera de cuantizaciones Q4 y descartó Q4_K_M (16 GiB) y Q4_K_S (14.733 MiB) por no dejar margen para KV cache y buffers en una tarjeta de 16 GB, seleccionando IQ4_XS como la opción de 4 bits que sí encaja. El modelo está etiquetado como "decision-model" y su protocolo de inferencia se basa en puntuar letras de opción sobre la cabeza LM estándar.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización práctica para despliegue en hardware de consumo; por otro, el modelo base y su ecosistema presentan numerosos datos no verificables (arquitectura exacta, idiomas, benchmarks), que se indican explícitamente como no disponibles. La licencia declarada es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); tipo de decisión `gemma4.decision.type = openjev` según la model card; detalles del transformer no disponibles |
| Parametros totales | 25.233.142.046 (dato real de safetensors del modelo base) |
| Parametros activos | aproximadamente 4B (deducido de la nomenclatura "A4B"; cifra exacta no disponible) |
| Longitud de contexto | no disponible (la model card menciona `-c 4096` como configuración de prueba, no como límite del modelo) |
| Tipos de cuantizacion | IQ4_XS (4,45 BPW, 13.397 MiB); el autor descartó Q4_K_M y Q4_K_S por no caber en 16 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (generado con llama.cpp `convert_hf_to_gguf.py` + `llama-quantize`, master `0a731cc` más parches) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE de 25.233.142.046 parámetros totales y aproximadamente 4B activos por token. La model card de esta cuantización no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; esa información debería consultarse en la model card del modelo base PelaAI/KnowLine-26B-A4B-Gen2.5, que no está incluida en la información proporcionada. El autor etiqueta el modelo como "decision-model" y describe un protocolo de decisión basado en puntuar letras de opción (slot letters) directamente sobre la cabeza LM estándar, con el tipo `gemma4.decision.type = openjev`.

La innovación técnica documentada en esta publicación es el proceso de cuantización: el autor aplicó parches al conversor de llama.cpp (identificados como 0003 y 0004) para manejar una plantilla de sistema embebida que usa `{% unless %}`, sintaxis no soportada por el parser jinja de llama.cpp; el parche 0004 sustituye esa construcción por `{% if not loop.last %}`. El resultado es un GGUF con los pesos en IQ4_XS y la plantilla ya integrada. No se documentan innovaciones de arquitectura propias del modelo base en la información disponible.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline de chat indican uso en diálogo multi-turno.
- Toma de decisiones estructurada: el modelo está diseñado para puntuar opciones discretas (letras de slot) sobre la cabeza LM, lo que permite usarlo como clasificador de decisiones en lugar de generador libre.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con APIs de inferencia estándar.
- Razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Señalización en sistemas de trading algorítmico: el autor validó el modelo replicando 7.854 llamadas reales de decisión de una ventana de trading de 14 días, con 0 errores; el modelo puede integrarse en pipelines que requieran puntuar opciones discretas (comprar, vender, mantener) con baja latencia.
- Despliegue en estaciones de trabajo con GPU de 16 GB: gracias a IQ4_XS (13.397 MiB) y a la caché KV en q8_0, el modelo cabe en tarjetas como la RTX 5060 Ti, lo que permite inferencia local sin servidores dedicados.
- Clasificación de decisiones con opciones fijas: al puntuar letras sobre la cabeza LM, puede adaptarse a problemas de elección entre alternativas predefinidas (enrutamiento, priorización, selección de acciones).
- Prototipado de agentes conversacionales: el tag `conversational` y la compatibilidad con endpoints permiten montar un asistente de chat multi-turno en local para pruebas de concepto.
- Evaluación comparativa de cuantizaciones: esta publicación sirve como referencia reproducible (checksums SHA256SUMS, parches incluidos) para medir el impacto de IQ4_XS frente a Q4_K_S y Q4_K_M en un mismo modelo MoE.
- Inferencia de baja latencia en producción: el autor mide p50 de 553 ms para el brazo MoE de 4B activos, frente a ~1,7 s de los brazos densos de 27B, lo que lo hace adecuado para tareas con requisitos de respuesta subsegundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card solo incluye mediciones de latencia y fiabilidad del propio autor:

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia p50 (MoE 4B activos) | 553 ms | RTX 5060 Ti 16 GB, llama.cpp, `-c 4096 -b 4096 -ub 4096 --parallel 1`, KV q8_0 |
| Latencia p50 (brazos densos 27B) | ~1,7 s | mismas condiciones |
| Errores en replay de decisiones | 0 | 7.854 llamadas reales, muestra stride-10 de 78.534 |
| Tamaño del archivo GGUF | 14,1 GB (13.397 MiB, 4,45 BPW) | IQ4_XS |

## Requisitos de hardware

- VRAM estimada: 13.397 MiB para los pesos en IQ4_XS, más KV cache y buffers; el autor confirma que cabe en una tarjeta de 15.846 MiB (RTX 5060 Ti) con `-c 4096` y KV en q8_0.
- GPU recomendadas: RTX 5060 Ti 16 GB (medida por el autor); cualquier GPU con al menos 16 GB de VRAM. Para GPUs de 24 GB (RTX 4090, A100 40 GB, H100) hay margen para contextos mayores o cuantizaciones superiores.
- ¿Cabe en consumer GPU? Sí, en tarjetas de 16 GB o más; no cabe en GPUs de 12 GB o menos con la configuración medida.
- Opciones de despliegue: llama.cpp (versión master `0a731cc` más parches 0003/0004 para la conversión; para servir, llama.cpp estándar), Docker con imagen `nvidia/cuda:12.8.1`. vLLM, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: p50 de 553 ms por llamada de decisión en RTX 5060 Ti con una sola instancia residente y `--parallel 1`; throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| knowline-26B-A4B-IQ4_XS-GGUF | 25,2B | ~4B | no disponible | Apache-2.0 | GGUF IQ4_XS | Cuantización para 16 GB; 553 ms p50 |
| PelaAI/KnowLine-26B-A4B-Gen2.5 | 25,2B | ~4B | no disponible | Apache-2.0 (heredada) | safetensors | Modelo base sin cuantizar |
| Brazos densos de 27B (mencionados por el autor) | ~27B | 27B | no disponible | no disponible | no disponible | ~1,7 s p50 en la misma prueba |

No se dispone de datos de benchmarks que permitan comparar calidad con alternativas de la misma categoría; la comparativa se limita a parámetros, formato y latencia medida.

## Limitaciones y advertencias

- El modelo está etiquetado como "decision-model" y su uso previsto es la puntuación de opciones discretas; emplearlo como generador conversacional general puede dar resultados fuera de distribución.
- No se declaran idiomas soportados; el rendimiento multilingüe es desconocido.
- No hay benchmarks publicados de calidad (MMLU, HumanEval, GSM8K), por lo que no puede evaluarse su precisión frente a alternativas.
- La cuantización IQ4_XS introduce pérdida de precisión respecto a los pesos originales en safetensors; el autor no documenta una evaluación de degradación de calidad.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la atribución y las condiciones del modelo base PelaAI/KnowLine-26B-A4B-Gen2.5.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La model card menciona parches específicos de llama.cpp (0003/0004) necesarios para la conversión; servir el modelo con versiones sin esos parches puede fallar por la sintaxis de la plantilla.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/PsychoLogic/knowline-26B-A4B-IQ4_XS-GGUF
- Modelo base: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp (herramienta de cuantización): no se proporciona URL directa en la información disponible
