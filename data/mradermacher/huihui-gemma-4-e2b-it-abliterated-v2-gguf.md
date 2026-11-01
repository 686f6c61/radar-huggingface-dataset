# mradermacher/Huihui-gemma-4-E2B-it-abliterated-v2-GGUF

## Resumen

Huihui-gemma-4-E2B-it-abliterated-v2-GGUF es la versión cuantizada en formato GGUF del modelo huihui-ai/Huihui-gemma-4-E2B-it-abliterated-v2, un derivado "abliterated" (es decir, con las direcciones de rechazo eliminadas del espacio de activaciones) del modelo Gemma 4 E2B-it de Google. El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants GGUF para la comunidad de inferencia local. El modelo base parte de la familia Gemma 4 en su variante E2B (efímera/eficiente de 2 mil millones de parámetros activos), con un total real de pesos de 4.647.450.147 parámetros según los safetensors del repositorio.

El interés de esta ficha reside en dos factores. Primero, la cuantización GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama o LM Studio, algo imposible con los pesos completos en bf16. Segundo, la modificación "abliterated" elimina los mecanismos de rechazo del modelo instruct original, lo que cambia radicalmente su comportamiento en producción y plantea consideraciones éticas y legales que se detallan más abajo. El repositorio incluye también ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base conserva capacidad multimodal de visión.

La licencia declarada en el repositorio es Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que genera una ambigüedad relevante para uso comercial que conviene verificar antes de desplegar. El modelo está etiquetado únicamente para inglés y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B); detalles de atención y capas no disponibles |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (la nomenclatura E2B sugiere ~2B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con license_link a los términos de Gemma 4 de Google) |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer perteneciente a la familia Gemma 4 de Google, en su variante E2B-it (instruct). El dato de 4.647.450.147 parámetros totales corresponde a los pesos en safetensors del modelo base. La presencia de ficheros mmproj en el repositorio GGUF confirma que el modelo incorpora un proyector multimodal para entrada de imágenes, aunque no se especifica la resolución, el codificador visual ni el número de tokens de imagen soportados.

Sobre el entrenamiento no hay información en la documentación proporcionada: se desconoce el número de tokens, la composición del dataset, si hubo RLHF, DPO o alguna fase de alineación posterior, así como cualquier innovación técnica (atención lineal, decodificación especulativa, etc.). Lo único documentado es el proceso de "abliteration" aplicado por huihui-ai, que consiste en identificar y restar las direcciones de activación asociadas al rechazo para que el modelo deje de negarse a responder determinadas peticiones. La cuantización posterior por parte de mradermacher emplea el pipeline estándar de llama.cpp con quantize_version 2 y output_tensor_quantised 1.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada del modelo Gemma 4 E2B-it.
- Capacidad multimodal de visión: el repositorio incluye ficheros mmproj (Q8_0 y f16) que permiten procesar imágenes junto con texto en llama.cpp.
- Comportamiento "uncensored": la abliteración elimina los rechazos del modelo instruct original, por lo que responde a peticiones que el modelo base declinaría.
- Razonamiento y matemáticas: capacidades heredadas del modelo base, sin datos cuantificados disponibles.
- Generación de código: presumiblemente soportada por herencia del modelo instruct, sin benchmarks publicados.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Multilingüismo: limitado a inglés según la etiqueta `language: en`.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente qué tipos de contenido genera un modelo Gemma 4 tras eliminar sus direcciones de rechazo, comparándolo con el modelo base intacto en experimentos controlados de red teaming.
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, contenido para adultos) donde el modelo instruct original aplicaría filtros.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M de 3,5 GB, el modelo cabe en GPUs de 6-8 GB de VRAM o incluso en CPU con RAM suficiente, lo que permite prototipado offline sin depender de APIs.
- Procesamiento de documentos con imágenes en local: gracias al proyector mmproj, se puede usar para extraer información de capturas, diagramas o documentos escaneados en flujos que requieran privacidad y no puedan enviar datos a la nube.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización más dos mmproj, lo que permite medir el impacto de la compresión en perplejidad y calidad de respuesta para un modelo de ~4,6B parámetros.
- Base para fine-tuning posterior: al estar en GGUF y con licencia Apache 2.0 declarada, puede servir como punto de partida para adaptaciones con LoRA en entornos de investigación, siempre que se resuelva la ambigüedad de licencia con los términos de Gemma 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~3,1 GB; Q4_K_M ~3,5 GB; Q6_K ~3,9 GB; Q8_0 ~5,1 GB; f16 ~9,4 GB. Añadir 1-2 GB adicionales para caché KV y overhead según longitud de contexto.
- Para uso multimodal, sumar el mmproj: ~0,7 GB (Q8_0) o ~1,1 GB (f16).
- GPU recomendadas: cualquier GPU con 6 GB o más para Q4_K_M (RTX 3060 6 GB, RTX 4060, RTX 2070). Para Q8_0 se recomienda 8 GB o más (RTX 3070, RTX 4060 Ti, RTX 4070). Para f16, 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, A4000).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones excepto f16 en GPUs de menos de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp. Compatible con endpoints OpenAI según la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-gemma-4-E2B-it-abliterated-v2-GGUF (este) | 4,65B totales | no disponible | apache-2.0 (con dudas por Gemma 4) | GGUF | Abliterated, multimodal, solo inglés |
| huihui-ai/Huihui-gemma-4-E2B-it-abliterated-v2 (base) | 4,65B totales | no disponible | apache-2.0 (con dudas) | safetensors | Mismo modelo sin cuantizar; requiere más VRAM |
| Gemma 4 E2B-it original (Google) | ~4,6B (estimado) | no disponible | Términos Gemma 4 | safetensors | Modelo instruct con alineación intacta; rechaza contenido sensible |
| mradermacher/Huihui-gemma-4-E2B-it-abliterated-v2-i1-GGUF | 4,65B totales | no disponible | apache-2.0 (con dudas) | GGUF (imatrix) | Variante con cuantizaciones ponderadas por imatrix, presumiblemente mayor calidad a igual tamaño |

## Limitaciones y advertencias

- La abliteración elimina los rechazos del modelo, pero no garantiza que el modelo sea seguro: puede generar contenido dañino, ilegal o sexualmente explícito sin filtros, lo que traslada toda la responsabilidad al operador.
- Sesgos conocidos: no documentados en la información disponible, pero heredados del corpus de entrenamiento de Gemma 4 y potencialmente amplificados por la eliminación de la capa de alineación.
- Riesgo de alucinación: no cuantificado; los modelos de ~4,6B parámetros suelen alucinar con más frecuencia que modelos de mayor tamaño, especialmente en tareas de razonamiento complejo.
- Limitación de idioma: solo inglés según la etiqueta del repositorio; el rendimiento en castellano no está garantizado.
- Ambigüedad de licencia: el repositorio declara apache-2.0 pero enlaza a los términos de Gemma 4 de Google, que imponen restricciones de uso (incluida una política de uso prohibido). Antes de un despliegue comercial conviene verificar qué licencia prevalece.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin datos oficiales.
- Tool calling y agentes no confirmados: no hay evidencia en la documentación de que el modelo soporte function calling de forma fiable.
- El proceso de abliteración puede degradar capacidades generales (razonamiento, coherencia) respecto al modelo instruct original; no hay benchmarks que lo cuantifiquen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Huihui-gemma-4-E2B-it-abliterated-v2-GGUF
- Modelo base (abliterated, safetensors): https://huggingface.co/huihui-ai/Huihui-gemma-4-E2B-it-abliterated-v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Huihui-gemma-4-E2B-it-abliterated-v2-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Huihui-gemma-4-E2B-it-abliterated-v2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
