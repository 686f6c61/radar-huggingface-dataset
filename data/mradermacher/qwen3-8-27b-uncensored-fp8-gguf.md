# mradermacher/Qwen3.8-27B-Uncensored-FP8-GGUF

## Resumen

Qwen3.8-27B-Uncensored-FP8-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo orcarouter/Qwen3.8-27B-Uncensored-FP8, publicada por mradermacher. Se trata de una variante "abliterated" (sin censura) de un modelo Qwen de 27.320.697.856 parámetros (unos 27,3 mil millones), pensada explícitamente para tareas de red-teaming y evaluación de seguridad de IA. El autor original del modelo base es el usuario orcarouter, y mradermacher se limita a generar los ficheros GGUF de cuantización.

El interés de esta ficha es doble: por un lado, ofrece una vía práctica de ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones de 11 a 29 GB; por otro, documenta un caso de modelo deliberadamente descensurado, con las implicaciones éticas y de licencia que ello conlleva. La licencia declarada es Apache 2.0, los idiomas soportados son inglés y chino, y el repositorio incluye tanto pesos de texto como un proyector multimodal (mmproj) que sugiere capacidades de visión.

No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks en la documentación proporcionada; estos datos se marcan como no disponibles en las secciones correspondientes. El modelo base está etiquetado con function-calling, reasoning y "mtp" (probablemente multi-token prediction), lo que indica que conserva las capacidades de razonamiento y llamada a herramientas de la familia Qwen original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen, presumiblemente transformer; no confirmado en la informacion) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 para vision |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en FP8 block-quantized |
| Tamano del repo | 190,8 GB (incluye todas las cuantizaciones) |
| Libreria declarada | transformers (los GGUF se usan con llama.cpp y derivados) |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored-FP8 |
| Etiquetas destacadas | abliterated, uncensored, ai-red-team, red-teaming, fp8, block-fp8, vllm, function-calling, reasoning, mtp |
| Descargas / likes | 6.079 / 11 |
| Fecha de creacion | 2026-08-18 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El nombre y las etiquetas indican que deriva de un modelo Qwen de 27B (probablemente un transformer denso, dado que no se mencionan parámetros activos ni arquitectura MoE), y que el modelo base fue sometido a un proceso de "abliteration": una técnica de modificación de pesos que elimina o atenúa la dirección de rechazo aprendida durante el alineamiento, dando lugar a un modelo "uncensored". El modelo base original se distribuye en FP8 con cuantización por bloques (block-fp8), formato optimizado para vLLM.

Las etiquetas del modelo base incluyen "reasoning", "function-calling" y "mtp", lo que sugiere que conserva las capacidades de razonamiento extendido, llamada a funciones y posiblemente multi-token prediction de la familia Qwen. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO tras la abliteración. Tampoco se documenta el proceso concreto de abliteración (qué capas o direcciones se modificaron).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento (etiqueta "reasoning" en el modelo base), presumiblemente con modos de pensamiento extendido, aunque no se detalla el mecanismo.
- Function calling / tool calling, según la etiqueta "function-calling".
- Capacidades multimodales: el repositorio incluye proyectores mmproj-Q8_0 y mmproj-f16, lo que indica soporte de entrada de imágenes en las cuantizaciones que los acompañan.
- Comportamiento descensurado ("abliterated", "uncensored"): el modelo no aplica los rechazos típicos del alineamiento original, lo que lo hace apto para simulación de adversarios y pruebas de robustez.
- Orientado a red-teaming y evaluación de seguridad de IA ("ai-red-team", "red-teaming").
- Compatible con endpoints (etiqueta "endpoints_compatible") y con despliegue en vLLM para el formato FP8 original.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo puede generar prompts adversarios, intentos de jailbreak y contenido de prueba para evaluar la robustez de filtros y clasificadores de seguridad en pipelines de moderación. Su naturaleza descensurada lo hace adecuado para generar casos límite que un modelo alineado rechazaría.
- Evaluación de sesgos y alucinaciones: al eliminar la capa de rechazo, permite estudiar qué conocimiento y sesgos subyacen en el modelo base sin la interferencia del alineamiento, útil en investigación sobre interpretabilidad y seguridad.
- Asistente conversacional local en inglés o chino: con cuantizaciones Q4_K_M (16,9 GB) o Q5_K_M (19,6 GB) puede ejecutarse en una GPU de consumo de 24 GB, ofreciendo conversación multi-turno sin dependencia de la nube.
- Prototipado de agentes con tool calling: la etiqueta function-calling permite integrarlo en frameworks de agentes para pruebas de flujos multi-paso en entornos controlados, siempre que se valide el comportamiento del modelo descensurado.
- Análisis de imágenes en local: los ficheros mmproj permiten añadir entrada visual a las cuantizaciones, útil para experimentos de captioning o extracción de información de documentos escaneados en despliegues offline.
- Generación de datos sintéticos para entrenamiento: puede emplearse para producir corpus de texto diverso (incluido contenido sensible) que luego se filtre y etiquete para entrenar clasificadores o modelos de moderación.
- Investigación académica sobre alineamiento: comparar las respuestas de este modelo con las de su contrapartida alineada permite medir el efecto de la abliteración en distintas categorías de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~11 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. Añadir entre 1 y 4 GB para la caché KV según contexto y configuración.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas; A100 40 GB o H100 para Q8_0 y contextos largos; para Q2_K–Q3_K puede bastar una RTX 4080 (16 GB) o RTX 4060 Ti 16 GB con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con cuantizaciones Q2_K a Q4_K_S, y en tarjetas de 24 GB hasta Q6_K. Q8_0 (29,1 GB) requiere 32 GB o más, o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) para los GGUF; vLLM para el modelo base FP8 block-quantized; el proyector mmproj requiere un frontend compatible con visión en llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa no verificada, un modelo denso de 27B en Q4_K_M sobre una RTX 4090 suele situarse en decenas de tokens por segundo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-FP8-GGUF (este) | ~27,3B | no disponible | Apache 2.0 | GGUF (11–29 GB) | Abliterated, vision via mmproj, function calling |
| Modelo base orcarouter/Qwen3.8-27B-Uncensored-FP8 | ~27,3B | no disponible | Apache 2.0 | FP8 block-quantized | Version sin cuantizar a GGUF, para vLLM |
| Variante i1 (imatrix) de mradermacher | ~27,3B | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base, cuantizaciones ponderadas de mayor calidad |
| Modelos Qwen alineados de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar rendimiento |

No se dispone de información suficiente para comparar rendimiento, contexto o calidad con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Modelo descensurado: la abliteración elimina los rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. No debe desplegarse en producción orientada a usuarios finales sin capas adicionales de moderación.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, especialmente en dominios especializados; no se han publicado evaluaciones de fiabilidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto desconocida; planificar los despliegues con margen y validar empíricamente el límite efectivo.
- Licencia Apache 2.0 declarada, que permite uso comercial, pero el uso de un modelo descensurado puede incumplir políticas de plataformas, términos de servicio de proveedores cloud o normativa aplicable sobre contenido; la responsabilidad recae en el desplegador.
- El repositorio ocupa 190,8 GB; descargar solo la cuantización necesaria para evitar consumo innecesario de almacenamiento y ancho de banda.
- La etiqueta "mtp" y otras capacidades del modelo base no están documentadas en detalle; verificar su funcionamiento real antes de integrarlas en pipelines.
- No hay información sobre sesgos específicos medidos; dado el origen multilingüe en y zh, es previsible un sesgo cultural hacia esos contextos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-FP8-GGUF
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-FP8-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-FP8-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
