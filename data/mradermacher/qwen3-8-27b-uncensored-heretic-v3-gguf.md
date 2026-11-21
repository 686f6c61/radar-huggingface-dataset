# mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Heretic-v3 es un modelo de lenguaje conversacional de gran tamano (26.895.998.464 parametros, aproximadamente 26,9 mil millones) publicado por el usuario OS-Software y cuantizado a formato GGUF por mradermacher. Se trata de una variante "abliterated" o "decensored" del modelo base: los tags de la model card (heretic, uncensored, decensored, abliterated, ara-lora) indican que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, complementada con un adaptador LoRA de tipo ARA, con el objetivo de eliminar las negativas del modelo ante solicitudes que el modelo original rechazaria.

El modelo resuelve el problema de los filtros de seguridad y las respuestas evasivas en entornos donde el desarrollador necesita control total sobre el comportamiento del modelo, como investigacion sobre alineacion, generacion creativa sin restricciones tematicas o evaluacion de sesgos. La cuantizacion a GGUF lo hace ejecutable en hardware de consumo mediante llama.cpp y ecosistemas compatibles, con un rango de cuantizaciones que va desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), e incluye ficheros mmproj para funcionalidad multimodal.

La relevancia actual del modelo radica en su tamano intermedio (27B) combinado con la disponibilidad de cuantizaciones de calidad y una licencia Apache 2.0 permisiva. No obstante, la informacion disponible no incluye detalles sobre arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de benchmarks, por lo que varias especificaciones tecnicas deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, inferido del pipeline conversacional; sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en formato transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3). El nombre y los tags sugieren una base de la familia Qwen de tercera generacion con aproximadamente 27B parametros, pero no se confirma en la documentacion proporcionada. El pipeline declarado es conversacional y la libreria transformers, lo que es coherente con un transformer decoder-only con atencion causal, si bien este dato no se explicita.

El aspecto tecnico diferencial es el proceso de "abliteration" o "decensoring": se eliminan o atenuan las direcciones de activacion asociadas a la negativa a responder, combinado con un adaptador LoRA de tipo ARA (tag ara-lora). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La cuantizacion la realiza mradermacher con cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y ofrece una variante con imatrix en un repositorio separado para mayor calidad en cuantizaciones bajas.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Respuestas sin filtros de rechazo tematico (comportamiento "uncensored"/"decensored"), orientado a contenido que el modelo original declinaria.
- Soporte multimodal: los ficheros mmproj-Q8_0 y mmproj-f16 indican capacidad de procesamiento de imagenes junto al texto, aunque no se detalla el alcance.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue detras de APIs compatibles con OpenAI.
- Ejecutable en llama.cpp y derivados gracias al formato GGUF.
- No se documenta soporte explicito de tool calling, function calling, agentes, modo thinking ni otras capacidades especiales.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar que contenidos genera un modelo sin capa de rechazo y comparar su distribucion de respuestas frente a la version alineada, util para analizar mecanismos de negativa.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, drama psicologico) sin las evasivas habituales del modelo base.
- Evaluacion de sesgos: al eliminar el filtro de rechazo, se pueden medir sesgos latentes que quedan ocultos tras negativas en modelos alineados.
- Despliegue local en hardware de consumo: la cuantizacion Q4_K_M (16,6 GB) permite ejecucion en GPU con 16-24 GB de VRAM mediante llama.cpp u Ollama, para prototipos y pruebas offline.
- Analisis de contenido y moderacion interna: uso como generador de casos adversarios para entrenar o validar clasificadores de toxicidad y sistemas de moderacion.
- Experimentacion con tecnicas de decensoring: sirve como referencia practica para estudiar el efecto de abliteration y LoRA ARA sobre el comportamiento del modelo, comparando cuantizaciones y su impacto en la calidad.
- Chat conversacional en ingles para entornos controlados donde el operador asume la responsabilidad del contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar KV cache): Q2_K ~10,8 GB; Q3_K_S ~12,2 GB; Q3_K_M ~13,4 GB; Q3_K_L ~14,4 GB; IQ4_XS ~15,3 GB; Q4_K_S ~15,7 GB; Q4_K_M ~16,6 GB; Q5_K_S ~18,8 GB; Q5_K_M ~19,3 GB; Q6_K ~22,2 GB; Q8_0 ~28,7 GB. Anadir margen para el contexto y el cache KV.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M con contexto moderado; A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) valida para cuantizaciones Q4-Q5.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con cuantizaciones Q4 o inferiores; en 12 GB solo con Q2_K/Q3_K_S y contexto reducido. Tambien es viable en CPU con llama.cpp, a menor velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag endpoints_compatible sugiere integracion con APIs tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa para este caso, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Heretic-v3 (este) | ~26,9B | no disponible | Apache 2.0 | GGUF | Variante decensored, solo ingles |
| Modelo base OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3 | ~26,9B | no disponible | Apache 2.0 | safetensors/transformers | Version sin cuantizar del mismo modelo |
| Variante i1-GGUF de mradermacher | ~26,9B | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas de mayor calidad |

No se dispone de informacion sobre modelos comparables de otros desarrolladores con caracteristicas equivalentes (abliterated, 27B, GGUF) en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/"decensored": no aplica filtros de seguridad, por lo que puede generar contenido danino, ilegal o socialmente inapropiado. No es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas; no se han publicado evaluaciones que cuantifiquen su fiabilidad.
- Solo soporta ingles segun la model card; el rendimiento en castellano u otros idiomas no esta garantizado.
- La abliteration puede degradar capacidades generales (razonamiento, coherencia) respecto al modelo original; no hay benchmarks que lo verifiquen.
- La licencia Apache 2.0 permite uso comercial, pero el operador asume toda la responsabilidad legal sobre el contenido generado y su adecuacion a normativas (por ejemplo, la Ley de Servicios Digitales de la UE o la normativa de proteccion de menores).
- No se dispone de informacion sobre longitud de contexto, sesgos especificos ni datos de entrenamiento, lo que dificulta la evaluacion de riesgos.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; se recomienda Q4_K_M o superior para produccion.
- El repositorio ocupa 187,9 GB en total; descargar solo los ficheros necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-GGUF
- Modelo base: https://huggingface.co/OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3
- Cuantizaciones imatrix (i1-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-Heretic-v3-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
