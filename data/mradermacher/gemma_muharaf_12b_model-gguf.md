# mradermacher/gemma_muharaf_12b_model-GGUF

## Resumen

`mradermacher/gemma_muharaf_12b_model-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `omarabb315/gemma_muharaf_12b_model`, un ajuste fino (SFT) sobre la familia Gemma 3 con aproximadamente 11.770 millones de parametros. El trabajo de cuantizacion lo firma mradermacher, un actor conocido en el ecosistema por publicar versiones GGUF de modelos abiertos con una amplia gama de niveles de compresion. El modelo base fue entrenado por omarabb315 usando Unsloth, TRL y la arquitectura Gemma 3, y esta pensado para generacion de texto conversacional.

El interes practico de esta publicacion es que permite ejecutar un modelo de ~11,8 B de parametros en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), con cuantizaciones que van desde Q2_K (4,9 GB) hasta Q8_0 (12,6 GB), e incluye ficheros mmproj para el componente multimodal de Gemma 3. Al estar bajo licencia Apache 2.0, es apto para uso comercial, aunque el modelo base solo declara soporte para ingles.

No se dispone de informacion publicada sobre el dataset de ajuste fino, el numero de tokens de entrenamiento ni resultados de benchmarks. La model card del cuantizador es puramente operativa (lista de ficheros y notas de uso) y no aporta detalles tecnicos del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 3, segun tags del modelo base) |
| Parametros totales | 11.766.034.176 (~11,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma 3, un transformer decoder-only. Los tags del repositorio indican que se entreno mediante SFT (supervised fine-tuning) con las librerias Unsloth y TRL, partiendo de un Gemma 3 preentrenado. No se especifica el numero de tokens de ajuste, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documenta si se aplicaron tecnicas como decodificacion especulativa, atencion lineal o variantes hibridas.

La publicacion que nos ocupa es una conversion a GGUF realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, generando cuantizaciones estaticas (sin imatrix/weighted, que el autor indica que no estan disponibles por el momento). Se incluyen ficheros `mmproj` en Q8_0 y f16 que actuan como suplemento multimodal, lo que sugiere que el modelo base conserva la torre de vision de Gemma 3.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (tag `conversational`).
- Razonamiento y respuesta a instrucciones derivadas del ajuste fino SFT.
- Capacidad multimodal potencial: los ficheros `mmproj` permiten cargar el proyector visual de Gemma 3 en llama.cpp, aunque no se documenta el alcance real de la vision tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo, gestionando dialogos multi-turno gracias al formato conversacional heredado de Gemma 3.
- Prototipado de chatbots sin conexion: al estar en GGUF y bajo Apache 2.0, es adecuado para entornos air-gapped donde no se permite enviar datos a APIs externas.
- Evaluacion de ajustes finos comunitarios: util para investigadores que quieran comparar el comportamiento de un SFT sobre Gemma 3 frente al modelo base, usando las distintas cuantizaciones para medir el impacto de la compresion en la calidad.
- Despliegue en portatiles con GPU modesta: la variante Q4_K_M (7,4 GB) permite ejecutar el modelo en GPUs de 8 GB de VRAM, habilitando asistentes de escritorio.
- Generacion de texto en pipelines de procesamiento por lotes: con Q8_0 (12,6 GB) se obtiene la maxima calidad de la cuantizacion para tareas de resumen o redaccion en ingles.
- Experimentacion multimodal: cargando el fichero `mmproj` junto con los pesos, se puede probar el pipeline de vision-lenguaje de Gemma 3 en llama.cpp, aunque la calidad tras el SFT no esta documentada.
- Base para nuevos ajustes finos: al ser Apache 2.0 y estar disponible en safetensors en el repo base, sirve como punto de partida para especializaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_M: ~6,1 GB
  - Q4_K_S / Q4_K_M: ~7,0-7,4 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,8 GB
  - Q8_0: ~12,6 GB
  - mmproj adicional: 0,7 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090 para cuantizaciones altas; A100/H100 solo si se busca throughput elevado con Q8_0 o el modelo base en FP16 (~23,5 GB).
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB con Q8_0 o una RTX 4060 Ti 8 GB con Q4_K_M. En GPUs de 6-8 GB conviene usar Q3_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El tag `text-generation-inference` sugiere compatibilidad con TGI, aunque TGI prioriza safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma_muharaf_12b_model (este) | ~11,8 B | no disponible | Apache 2.0 | GGUF, safetensors | SFT comunitario sobre Gemma 3, solo ingles declarado |
| Gemma 3 12B (Google) | ~12 B | no disponible en esta ficha | Gemma Terms | safetensors, GGUF comunitarios | Modelo oficial de referencia; multilingue |
| Mistral Nemo 12B | ~12 B | 128k | Apache 2.0 | safetensors, GGUF | Alternativa abierta de tamano similar con contexto largo |
| Qwen2.5 14B | ~14 B | 128k | Apache 2.0 | safetensors, GGUF | Mayor tamano, multilingue y buen rendimiento en codigo |

Las cifras de contexto y rendimiento de los modelos comparados no se han verificado en la informacion proporcionada; se indican como referencia de categoria.

## Limitaciones y advertencias

- Solo se declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- No hay benchmarks publicados, por lo que no se puede evaluar la calidad del SFT frente al Gemma 3 base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin datos de evaluacion de fidelidad.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- El autor no ha publicado cuantizaciones con imatrix/weighted, que suelen ofrecer mejor relacion calidad/tamano en niveles bajos.
- La licencia Apache 2.0 aplica a esta publicacion, pero conviene verificar los terminos del modelo base `omarabb315/gemma_muharaf_12b_model` y de Gemma 3 original por si hubiera obligaciones adicionales.
- El uso de la funcionalidad multimodal via `mmproj` no esta documentado ni validado tras el ajuste fino.
- Modelo con muy pocas descargas (208) y un solo like en el momento de la consulta; no hay evidencia de validacion por la comunidad.
- No se especifica la longitud de contexto soportada, lo que complica planificar despliegues con ventanas largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma_muharaf_12b_model-GGUF
- Modelo base: https://huggingface.co/omarabb315/gemma_muharaf_12b_model
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#gemma_muharaf_12b_model-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
