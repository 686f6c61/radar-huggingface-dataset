# mradermacher/Forgotten-Safeword-24B-V3.0-GGUF

## Resumen

Forgotten-Safeword-24B-V3.0 es un modelo de lenguaje conversacional de 23.572 millones de parámetros (aproximadamente 24B), afinado para roleplay y contenido para adultos, desarrollado originalmente por ReadyArt. Esta ficha documenta la versión cuantizada en formato GGUF publicada por mradermacher, un conocido mantenedor de cuantizaciones estáticas para la comunidad de inferencia local. El modelo base está etiquetado explícitamente como `nsfw`, `explicit`, `unaligned`, `dangerous` y `ERP`, lo que indica que ha sido deliberadamente desalineado de los filtros de seguridad habituales.

El modelo resuelve el problema de ejecutar localmente un modelo de roleplay de gran tamaño sin necesidad de GPUs de datacenter, ofreciendo cuantizaciones desde Q2_K (9,0 GB) hasta Q8_0 (25,2 GB). Su relevancia actual reside en la comunidad de inferencia local con llama.cpp y Ollama, donde los GGUF de 24B con cuantización Q4_K_M caben en GPUs de consumo de 16-24 GB de VRAM.

La arquitectura subyacente no está documentada en la información disponible; solo se confirma que el modelo base usa la librería `transformers` y que el idioma soportado es exclusivamente inglés. No se dispone de datos sobre longitud de contexto, composición del dataset de entrenamiento ni metodología de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base en `transformers`, presumiblemente transformer decoder-only) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |
| Tamano del repo | 161,4 GB (incluye todas las cuantizaciones) |
| Cuantizacion mas pequena | Q2_K, 9,0 GB |
| Cuantizacion mas grande | Q8_0, 25,2 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ReadyArt/Forgotten-Safeword-24B-V3.0. Por el numero de parametros (23,57B) y la libreria declarada (`transformers`), se trata con alta probabilidad de un transformer decoder-only, pero no se confirma en la documentacion disponible. Tampoco se especifica si emplea atencion con ventana deslizante, GQA, RoPE u otras optimizaciones.

Respecto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. Las etiquetas `unaligned` y `dangerous` sugieren un proceso de fine-tuning orientado a eliminar el rechazo de contenido explicito, pero no se detalla la metodologia. La unica innovacion tecnica documentada es la propia cuantizacion estatica realizada por mradermacher, con una version separada de cuantizaciones ponderadas/imatrix disponible en el repositorio `Forgotten-Safeword-24B-V3.0-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional y roleplay multi-turno en ingles.
- Contenido explicito para adultos (ERP) sin filtros de seguridad, segun las etiquetas del autor.
- Modo conversacional (`conversational` en los tags), orientado a dialogos de personaje.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia compatibles con la API de Hugging Face.
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener dialogos de personaje en ingles sin censura, ejecutandose en una GPU de consumo con la cuantizacion Q4_K_M (14,4 GB) mediante llama.cpp u Ollama. Es adecuado porque su fine-tuning esta orientado especificamente a este escenario.
- Generacion creativa de ficcion para adultos: escritores que necesiten generar narrativa explicita pueden usar el modelo en local con Q5_K_M (16,9 GB) para obtener mayor fidelidad sin depender de servicios en la nube.
- Investigacion sobre desalineacion y seguridad: investigadores pueden estudiar el comportamiento de modelos `unaligned` y `dangerous` en entornos controlados, comparando respuestas frente a modelos alineados.
- Desarrollo de personajes de chatbot con personalidad: la naturaleza conversacional del modelo permite construir agentes de rol con system prompts detallados, aunque sin soporte documentado de tool calling.
- Pruebas de red teaming: util para evaluar la eficacia de filtros de contenido de nivel superior, ya que el modelo genera material sensible de forma deliberada.
- Inferencia en hardware modesto: la cuantizacion Q2_K (9,0 GB) permite ejecutar un modelo de 24B en GPUs de 12 GB de VRAM con perdida de calidad, lo que facilita experimentacion en equipos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K 9,0 GB; Q3_K_S 10,5 GB; Q3_K_M 11,6 GB; Q3_K_L 12,5 GB; IQ4_XS 13,0 GB; Q4_K_S 13,6 GB; Q4_K_M 14,4 GB; Q5_K_S 16,4 GB; Q5_K_M 16,9 GB; Q6_K 19,4 GB; Q8_0 25,2 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q8_0 con contexto largo; GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) para Q4_K_S o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y 4060 Ti 16GB con cuantizaciones Q4 o inferiores. En GPUs de 12 GB solo con Q2_K y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM ni TGI en la informacion disponible (aunque podria usarse el modelo base en safetensors con estos frameworks).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de modelos comparables documentados en la informacion proporcionada. A continuacion se ofrece una comparativa estructural basica con alternativas de tamano similar en el ecosistema GGUF, aunque sin datos de benchmarks:

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Forgotten-Safeword-24B-V3.0 (este) | 23,57B | no disponible | apache-2.0 | GGUF | Roleplay NSFW sin alinear |
| Mistral-Small-24B (referencia de tamano) | ~24B | no disponible en esta ficha | apache-2.0 | safetensors/GGUF | Generalista |
| Gemma-2-27B (referencia de tamano) | 27B | no disponible en esta ficha | Gemma license | safetensors/GGUF | Generalista |

Los datos de contexto y rendimiento de los modelos comparables no se han verificado en la informacion disponible y se indican solo como referencia de categoria.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo genera material para adultos sin filtros; no es apto para entornos de produccion orientados al publico general.
- Modelo desalineado (`unaligned`, `dangerous`): puede producir contenido ofensivo, ilegal o danino; requiere supervisacion humana y filtros externos si se integra en cualquier producto.
- Sesgos conocidos: no documentados, pero al ser un fine-tuning sobre datos de roleplay en ingles, es probable que herede sesgos del dataset base (no confirmado).
- Riesgo de alucinacion: alto previsible en modelos de roleplay sin datos de benchmarks; no se ha evaluado su fidelidad factual.
- Limitacion de idioma: solo ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto: no disponible; el uso con contextos largos puede degradar la calidad y aumentar el consumo de VRAM.
- Licencia apache-2.0: permite uso comercial segun los terminos de la licencia, pero el contenido generado puede infringir politicas de plataformas o legislacion sobre material explicito.
- Etiqueta `not-for-all-audiences`: el repositorio esta marcado como no apto para todas las audiencias; debe restringirse su acceso.
- Sin benchmarks: no hay evidencia publicada de calidad, por lo que no se recomienda para tareas que requieran fiabilidad medida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Forgotten-Safeword-24B-V3.0-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Forgotten-Safeword-24B-V3.0
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Forgotten-Safeword-24B-V3.0-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Forgotten-Safeword-24B-V3.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
