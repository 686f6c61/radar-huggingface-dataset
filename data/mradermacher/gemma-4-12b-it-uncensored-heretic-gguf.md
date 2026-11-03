# mradermacher/gemma-4-12B-it-uncensored-heretic-GGUF

## Resumen

Gemma-4-12B-it-uncensored-heretic-GGUF es una compilación de cuantizaciones estáticas en formato GGUF del modelo llmfan46/gemma-4-12B-it-uncensored-heretic, publicada por el cuantizador habitual mradermacher. El modelo subyacente es una variante "heretic" (abliterated/decensored) de Gemma 4 de 12B en su versión instruction-tuned, es decir, una modificación que elimina o atenúa los mecanismos de rechazo y alineación de seguridad del modelo original. Con 11.907.350.576 parámetros reales (según safetensors), se sitúa en la gama media de la familia Gemma 4 y está pensado para ejecución local en hardware de consumo.

La relevancia de esta ficha reside en dos aspectos: por un lado, ofrece un conjunto completo de cuantizaciones (desde Q2_K de 4,9 GB hasta Q8_0 de 12,8 GB, más suplementos multimodales mmproj) que permiten desplegar un modelo de casi 12B en GPUs consumer; por otro, documenta las implicaciones técnicas y éticas de trabajar con un modelo "abliterated", cuya licencia declarada es Apache 2.0 pero cuyo modelo base remite a la licencia de Gemma 4 de Google, lo que introduce una ambigüedad legal que conviene tener presente.

El repositorio incluye además cuantizaciones con imatrix (publicadas en un repo separado, gemma-4-12B-it-uncensored-heretic-i1-GGUF), lo que sugiere que el autor mantiene el flujo de trabajo habitual de mradermacher: cuantizaciones estáticas para uso general y cuantizaciones ponderadas por importancia para máxima calidad por bit.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Gemma 4; transformer decoder-only presumiblemente, no confirmado en la información proporcionada) |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 (mmproj), Q8_0 (mmproj), Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además cuantizaciones imatrix en repo i1 |
| Idiomas soportados | en (inglés); la model card también lista "ara" en los tags, sin más detalle |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original presumiblemente en safetensors |
| Tamaño del repositorio | 83,7 GB |
| Descargas | 3.545 |
| Likes | 10 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo base es llmfan46/gemma-4-12B-it-uncensored-heretic, una variante derivada de Gemma 4 de 12B instruction-tuned. El tag "heretic" y los tags "uncensored", "decensored" y "abliterated" indican que se ha aplicado una técnica de abliteration: la eliminación o proyección fuera de la dirección de rechazo en el espacio de activaciones, un procedimiento que no requiere reentrenamiento completo y que preserva la mayor parte de las capacidades del modelo original mientras suprime las respuestas de negativa.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores a la modificación. Tampoco se detalla si se aplicaron técnicas de decodificación especulativa, atención lineal u otras innovaciones. La presencia de suplementos mmproj (f16 y Q8_0) en el repositorio sugiere que el modelo base conserva capacidades multimodales (visión), aunque esto no se confirma explícitamente en la model card.

## Capacidades

- Generación de texto conversacional en inglés, con formato instruction-tuned heredado de Gemma 4 it.
- Razonamiento y respuesta a instrucciones, presumiblemente con las capacidades del Gemma 4 de 12B original, aunque no verificadas en la documentación.
- Capacidades multimodales: la presencia de ficheros mmproj (multi-modal supplement) apunta a soporte de visión, aunque no se detalla en la model card.
- Supresión de rechazos y filtros de seguridad ("uncensored", "abliterated"), lo que permite generar contenido que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language; el tag "ara" no se explica.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como objeto de estudio para analizar qué comportamientos se suprimen mediante abliteration y cómo afecta al rendimiento general, comparándolo con el Gemma 4 it original.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles y que el modelo base rechazaría por sus filtros de seguridad.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (7,5 GB) o Q5_K_M (8,6 GB) puede ejecutarse en GPUs consumer de 8-12 GB de VRAM mediante llama.cpp u Ollama, sin depender de APIs externas.
- Procesamiento de documentos con componente visual: si se confirma el soporte multimodal mediante los ficheros mmproj, podría emplearse para tareas de descripción de imágenes o extracción de información de capturas, aunque esta capacidad no está documentada en detalle.
- Experimentación con pipelines de cuantización: el repositorio es un caso práctico de cómo mradermacher genera cuantizaciones estáticas e imatrix de un modelo de ~12B, útil para quienes estudian el impacto de la cuantización en la calidad.
- Evaluación comparativa de cuantizaciones: los distintos niveles (Q2_K a Q8_0) permiten medir la degradación de calidad y el ahorro de memoria en un mismo modelo, con la gráfica de perplejidad de ikawrakow como referencia.
- Base para fine-tuning posterior: al estar bajo Apache 2.0 (con la salvedad de la licencia Gemma 4), podría servir de punto de partida para ajustes específicos, aunque la ambigüedad legal debe resolverse antes de un uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto y KV cache):
  - Q2_K: ~4,9 GB de pesos; ~6-7 GB de VRAM efectiva con contexto moderado.
  - Q3_K_M: ~6,2 GB; ~7-8 GB efectiva.
  - Q4_K_M: ~7,5 GB; ~9-10 GB efectiva.
  - Q5_K_M: ~8,6 GB; ~10-11 GB efectiva.
  - Q6_K: ~9,9 GB; ~11-12 GB efectiva.
  - Q8_0: ~12,8 GB; ~14-15 GB efectiva.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4090 24 GB para las cuantizaciones altas; A100 o H100 para servir múltiples instancias o contextos largos.
- Cabe en GPU consumer: sí, desde Q4_K_M en GPUs de 8-10 GB (con riesgo de spill a RAM si el contexto es largo), y con holgura en GPUs de 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; los tags "endpoints_compatible" sugieren compatibilidad con endpoints tipo OpenAI a través de herramientas como llama-server. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-12B-it-uncensored-heretic-GGUF (este) | 11,9B | no disponible | apache-2.0 (con link a Gemma 4) | GGUF | Variante abliterated, cuantizaciones estáticas e imatrix |
| Gemma 4 12B it (original) | ~12B | no disponible | Gemma 4 license | safetensors, GGUF | Modelo alineado con filtros de seguridad; referencia de calidad |
| Otras variantes abliterated de la familia Gemma | ~12B | no disponible | variable | GGUF, safetensors | Mismo enfoque de supresión de rechazos; calidad depende de la técnica aplicada |
| Modelos de 12-14B de otras familias (p. ej. Qwen, Mistral) | 12-14B | variable | variable | safetensors, GGUF | Alternativas de tamaño similar; no se dispone de comparación de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con estos modelos.

## Limitaciones y advertencias

- La abliteration suprime los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino, ofensivo o ilegal; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos de ~12B; la modificación heretic puede alterar la calibración del modelo.
- Idiomas: el campo language solo declara inglés; el tag "ara" no está explicado y no debe asumirse un soporte multilingüe sólido.
- Longitud de contexto: no disponible; no debe asumirse la del Gemma 4 original sin verificación.
- Licencia: aunque el repo declara apache-2.0, el license_link apunta a la licencia de Gemma 4 de Google, que impone restricciones de uso (incluida la política de uso prohibido). Existe una ambigüedad legal que conviene resolver antes de un uso comercial.
- La model card no documenta el proceso de entrenamiento ni los datos, lo que dificulta evaluar sesgos y calidad.
- El tamaño del repo (83,7 GB) incluye todas las cuantizaciones; descargar solo la variante necesaria.
- Los suplementos mmproj sugieren multimodalidad, pero la model card no detalla su funcionamiento ni su calidad; no debe asumirse un rendimiento de visión equiparable al Gemma 4 original.
- Al ser una cuantización estática, las versiones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; para producción se recomienda Q5_K_M o superior, o las variantes imatrix.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-12B-it-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-12B-it-uncensored-heretic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-4-12B-it-uncensored-heretic-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
