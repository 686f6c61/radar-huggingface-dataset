# mradermacher/Qwen3.5-4B-Abliterated-Full-GGUF

## Resumen

Qwen3.5-4B-Abliterated-Full-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo panzy1222/Qwen3.5-4B-Abliterated-Full, un derivado de la familia Qwen3.5 de 4.205.751.296 parametros (aproximadamente 4,2 mil millones). El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF de modelos open source, y esta pensado para ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base procede de un autor independiente (panzy1222) que, por el nombre, ha aplicado una tecnica de "abliteration" sobre un Qwen3.5-4B, es decir, una modificacion de pesos orientada a eliminar o reducir los rechazos aprendidos por alineamiento.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo tipico de la cadena de valor del ecosistema open source: un modelo base de un tercero, una variante "abliterated" y una bateria de cuantizaciones estaticas publicadas por un tercero distinto. Por otro, advierte de las limitaciones de trazabilidad: la model card del repositorio GGUF no aporta informacion sobre arquitectura, contexto, licencia ni datos de entrenamiento, y el modelo base no esta documentado en la informacion disponible.

Se trata, por tanto, de un artefacto practico para inferencia local en ingles, con 12 cuantizaciones que van de 2,1 GB (Q2_K) a 8,5 GB (f16), y sin resultados de benchmarks publicados. Su uso en produccion exige validacion propia y cautela juridica por la ausencia de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3.5; el repositorio no documenta la arquitectura) |
| Parametros totales | 4.205.751.296 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el nombre y la familia (Qwen3.5-4B) cabe esperar un transformer decoder-only, pero el repositorio no confirma ni detalla capas, atencion, tokenizador ni vocabulario. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o similar.

La unica innovacion tecnica identificable es el proceso de "abliteration" aplicado por el autor del modelo base (panzy1222), una modificacion de pesos que busca reducir la tendencia del modelo a rechazar peticiones. El repositorio de mradermacher anade cuantizaciones estaticas generadas con llama.cpp; la propia model card indica que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de publicacion, y que las estaticas se ofrecen como alternativa. No se aportan detalles sobre el metodo de calibracion ni sobre posibles perdidas de calidad mas alla de las notas genericas de la tabla de cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Ejecucion local en CPU y GPU mediante llama.cpp y herramientas compatibles con GGUF.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible" en Hugging Face).
- Cuantizaciones de muy bajo peso (desde 2,1 GB) para entornos con poca memoria.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun la metadata del repositorio.
- El efecto de la abliteration puede alterar el comportamiento de rechazo, pero no hay evaluacion publicada al respecto.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (2,8 GB) el modelo cabe en GPUs de consumo y permite iterar rapidamente sobre prompts sin coste de API.
- Experimentacion con modelos "abliterated": util para investigadores que estudian como la modificacion de pesos afecta al comportamiento de rechazo y a la utilidad general, comparando contra el modelo original.
- Despliegue en entornos con memoria muy limitada: la version Q2_K (2,1 GB) permite ejecutar inferencia en portatiles sin GPU dedicada, a costa de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que facilita medir el impacto de la cuantizacion en perplejidad y calidad de respuesta con un mismo prompt set.
- Generacion de texto offline y privacidad: al ejecutarse localmente con llama.cpp, los datos no salen del equipo, adecuado para pruebas con contenido sensible en laboratorio.
- Base para fine-tuning o destilacion experimental: el formato GGUF no es el ideal para entrenar, pero el modelo base en safetensors puede servir como punto de partida para experimentos de investigacion.
- Pruebas de integracion en pipelines con endpoints compatibles: la etiqueta "endpoints_compatible" sugiere su uso en servidores de inferencia que acepten el formato, aunque sin garantias documentadas de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q2_K y Q3_K; 3-4 GB con Q4_K_S, IQ4_XS y Q4_K_M; 4-5 GB con Q5_K y Q6_K; 5-6 GB con Q8_0; 9-10 GB con f16 (incluyendo overhead de contexto y cache KV).
- GPU recomendadas: cualquier GPU con 6 GB o mas permite Q4_K_M con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este tamano y solo se justifican por concurrencia o contexto largo.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6-8 GB o mas para cuantizaciones Q4-Q8; las versiones Q2_K y Q3_K pueden ejecutarse incluso en iGPU o CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), servidores compatibles con GGUF y, para el modelo base, transformers. vLLM y TGI no estan confirmados para este repositorio GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Abliterated-Full-GGUF (este) | 4,2 B | no disponible | no disponible | GGUF | Cuantizaciones estaticas, solo ingles |
| Modelo base panzy1222/Qwen3.5-4B-Abliterated-Full | 4,2 B | no disponible | no disponible | safetensors | Origen de las cuantizaciones |
| Qwen3.5-4B original (familia Qwen) | ~4 B | no disponible | no disponible | safetensors | Referencia de la familia; sin datos en la informacion disponible |
| Otras cuantizaciones GGUF de modelos 4B (p. ej. Llama 3.2 3B, Phi-3.5-mini) | 3-4 B | variable | variable | GGUF | Alternativas de tamano similar; no se dispone de comparacion de rendimiento |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido; hay que contactar con el autor o asumir riesgo legal.
- El proceso de abliteration puede degradar la utilidad, la coherencia o la seguridad del modelo; no hay evaluacion publicada que lo cuantifique.
- Riesgo elevado de alucinacion y de respuestas no filtradas, especialmente en un modelo al que se le han reducido los rechazos por diseno.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden introducir degradacion notable; la propia model card advierte de "lower quality" en Q3_K_M.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por la comunidad.
- No hay garantias de soporte en vLLM o TGI; el uso en produccion requiere pruebas propias de latencia y estabilidad.
- La trazabilidad del modelo base es limitada: no se documentan datos de entrenamiento ni procedencia del dataset.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-Abliterated-Full-GGUF
- Modelo base: https://huggingface.co/panzy1222/Qwen3.5-4B-Abliterated-Full
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-Abliterated-Full-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
