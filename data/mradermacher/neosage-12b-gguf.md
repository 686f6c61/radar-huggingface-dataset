# mradermacher/NeoSage-12B-GGUF

## Resumen

NeoSage-12B-GGUF es la distribucion en formato GGUF del modelo NeoSage-12B, un modelo de lenguaje conversacional de aproximadamente 12.250 millones de parametros desarrollado originalmente por el usuario kyx0r. Esta version ha sido cuantizada y publicada por mradermacher, un conocido distribuidor de cuantizaciones GGUF en Hugging Face, con el objetivo de facilitar la inferencia local en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base se presenta como un merge (fusion) de otros modelos, segun las etiquetas `mergekit` y `merge` de la model card, lo que sugiere que se ha construido combinando pesos de modelos existentes en lugar de entrenarse desde cero. Esta orientado a uso conversacional y declara soporte unicamente para ingles. No se dispone de informacion detallada sobre arquitectura interna, datos de entrenamiento ni proceso de alineacion en la informacion proporcionada.

La relevancia de esta publicacion radica en la disponibilidad de hasta once variantes de cuantizacion (desde Q2_K hasta Q8_0, ademas de IQ4_XS), lo que permite desplegar un modelo de 12B en GPUs de consumo con requisitos de VRAM que van desde aproximadamente 5 GB hasta 13 GB. No obstante, la ausencia de licencia explicita, de benchmarks publicados y de documentacion tecnica detallada limita seriamente su evaluacion rigurosa y su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de tipo merge segun etiquetas `mergekit`; presumiblemente transformer, sin confirmar) |
| Parametros totales | 12.247.782.400 (~12,25 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en `mradermacher/NeoSage-12B-i1-GGUF` |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Las etiquetas de la model card (`mergekit`, `merge`) indican que NeoSage-12B es el resultado de una fusion de modelos mediante la herramienta mergekit, una tecnica habitual para combinar capacidades de distintos modelos sin un entrenamiento adicional completo. El recuento de parametros (12.247.782.400) es coherente con un transformer denso de aproximadamente 12B parametros, pero no se confirma la familia arquitectonica ni la configuracion de capas, atencion o embeddings.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La model card del repositorio GGUF se limita a describir las cuantizaciones disponibles, los tamanos de cada archivo y notas sobre calidad relativa, sin aportar informacion sobre el proceso de creacion del modelo base. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones: no confirmado explicitamente por el autor, pero coherente con el uso conversacional declarado.
- Generacion de codigo y matematicas: no disponible (sin datos que lo confirmen).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso a traves de la infraestructura de Hugging Face, aunque no se detalla el modo.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: la disponibilidad de cuantizaciones desde Q2_K (4,9 GB) permite ejecutar el modelo en portatiles con GPU modesta o incluso en CPU mediante llama.cpp, ideal para experimentar con un modelo de 12B sin infraestructura dedicada.
- Despliegue en estaciones de trabajo con una sola GPU de consumo: la variante Q4_K_M (7,6 GB) encaja en GPUs de 8-12 GB de VRAM, permitiendo un asistente local con latencia aceptable para tareas de redaccion y resumen en ingles.
- Generacion de texto offline y privacidad de datos: al ejecutarse localmente con llama.cpp u Ollama, el modelo permite procesar texto sensible sin enviar datos a servicios en la nube, adecuado para entornos con requisitos de confidencialidad.
- Evaluacion comparativa de merges: investigadores interesados en el estudio de tecnicas de model merging pueden usar esta distribucion para comparar el comportamiento de un merge de 12B frente a sus componentes originales, con la ventaja de disponer de multiples niveles de cuantizacion.
- Integracion en pipelines de generacion de contenido en ingles: la variante Q8_0 (13,1 GB) ofrece la maxima calidad dentro de esta distribucion y puede integrarse en flujos de redaccion asistida o generacion de borradores donde la fidelidad al modelo original sea prioritaria.
- Experimentacion educativa con cuantizacion GGUF: el repositorio incluye once variantes y referencias a graficos de perplejidad, lo que lo convierte en un material util para estudiar el impacto de la cuantizacion en la calidad de un modelo de 12B.
- Base para fine-tuning o merges posteriores: al estar disponible tambien el modelo base en safetensors, se puede partir de el para ajustes especificos, aunque la falta de licencia clara exige precaucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de archivo como referencia minima, mas overhead de contexto y KV cache):
  - Q2_K: ~4,9 GB
  - Q3_K_S: ~5,6 GB
  - Q3_K_M: ~6,2 GB
  - Q3_K_L: ~6,7 GB
  - IQ4_XS: ~6,9 GB
  - Q4_K_S: ~7,2 GB
  - Q4_K_M: ~7,6 GB
  - Q5_K_S: ~8,6 GB
  - Q5_K_M: ~8,8 GB
  - Q6_K: ~10,2 GB
  - Q8_0: ~13,1 GB
- GPU recomendadas: no especificadas por el autor. Por tamano, las variantes Q4 encajan en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); las variantes Q6/Q8 requieren 12-16 GB o mas (RTX 4080, RTX 4090, A100).
- Cabe en GPU de consumo: si, al menos las cuantizaciones Q2_K a Q5_K_M en GPUs de 8-12 GB; Q6_K y Q8_0 en GPUs de 16 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, text-generation-webui). Para el modelo base en safetensors, transformers con vLLM o TGI, aunque no se documenta compatibilidad explicita.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NeoSage-12B-GGUF | ~12,25 B | no disponible | no disponible | GGUF | Merge conversacional en ingles, sin benchmarks publicados |
| Mistral-Nemo-12B | ~12 B | 128k (segun documentacion publica del modelo) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Modelo base ampliamente documentado y con benchmarks publicos |
| Gemma-2-9B | ~9 B | 8k (segun documentacion publica) | Gemma Terms of Use | safetensors, GGUF | Modelo de Google con licencia restrictiva pero documentacion completa |
| Qwen2.5-14B | ~14 B | 32k (segun documentacion publica) | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Mayor tamano, multilingue y con benchmarks publicados |

La comparativa se limita a caracteristicas estructurales conocidas de alternativas de tamano similar; no se dispone de datos de rendimiento de NeoSage-12B que permitan una comparacion cuantitativa. Los datos de los modelos alternativos provienen de su documentacion publica habitual y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Ausencia de licencia explicita: no se indica licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. No debe utilizarse en produccion sin aclarar este punto con el autor.
- Modelo de tipo merge sin documentacion tecnica: no se detallan los modelos fuente, la receta de fusion ni los datos de entrenamiento, lo que dificulta evaluar sesgos y capacidades reales.
- Solo ingles: no se declara soporte multilingue; el rendimiento en castellano u otros idiomas es incierto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento, codigo o matematicas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluaciones de fidelidad no se puede acotar su magnitud.
- Sesgos desconocidos: al no documentarse la composicion del dataset ni los modelos fuente, no es posible identificar sesgos especificos.
- Contexto no documentado: se desconoce la ventana de contexto maxima, lo que limita el diseno de aplicaciones que dependan de contextos largos.
- Baja adopcion: 18 descargas y 1 like en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M se marcan como de menor calidad en la propia model card; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NeoSage-12B-GGUF
- Modelo base: https://huggingface.co/kyx0r/NeoSage-12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/NeoSage-12B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#NeoSage-12B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
