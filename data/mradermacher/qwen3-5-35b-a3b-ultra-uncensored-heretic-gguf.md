# mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF

## Resumen

Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF es una distribucion de pesos en formato GGUF del modelo llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic, publicada por mradermacher. Se trata de una variante "abliterated"/"decensored" del Qwen3.5-35B-A3B original de Alibaba Qwen, es decir, un ajuste que elimina o atenua los mecanismos de rechazo y alineacion de seguridad del modelo base, manteniendo la arquitectura y el conocimiento subyacente.

El modelo conserva la estructura del Qwen3.5-35B-A3B: un transformer de tipo Mixture-of-Experts (MoE) con aproximadamente 34.660 millones de parametros totales (segun los safetensors del modelo base) y un subconjunto de parametros activos por token, tal como indica el sufijo "A3B" (del orden de 3.000 millones de parametros activos). Esta publicacion concreta ofrece unicamente cuantizaciones estaticas GGUF (de Q2_K a Q8_0, ademas de IQ4_XS) y suplementos multimodales mmproj, lo que la hace util para inferencia local con llama.cpp y herramientas compatibles.

Su relevancia es doble: por un lado, permite ejecutar un modelo MoE de ~35B en hardware de consumo gracias a la cuantizacion y a la baja activacion por token; por otro, su naturaleza "uncensored" lo hace interesante para investigacion sobre alineacion, red-teaming y estudios de robustez, aunque con implicaciones eticas y de seguridad importantes que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivado de Qwen3.5-35B-A3B |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | no disponible (el sufijo "A3B" sugiere ~3B activos, sin confirmar en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y mmproj para multimodal |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con arquitectura Mixture-of-Experts, heredada de Qwen3.5-35B-A3B. El sufijo "A3B" indica que, pese a tener ~34,7B parametros totales, solo se activa una fraccion reducida por token (del orden de 3B, aunque el dato exacto no se confirma en la informacion disponible). Esta configuracion MoE permite un equilibrio entre capacidad total del modelo y coste computacional por token, lo que explica que las cuantizaciones Q4 (~20-21 GB) sean viables en GPUs de consumo.

Sobre el proceso de "heretic"/"abliterated": la model card no documenta el metodo exacto de entrenamiento ni los datos utilizados. Los tags "heretic", "uncensored", "decensored" y "abliterated" indican una modificacion de los pesos orientada a eliminar el comportamiento de rechazo (refusal) caracteristico de los modelos alineados. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en esta variante. La publicacion de mradermacher es exclusivamente una conversion y cuantizacion estatica del modelo de llmfan46; no aporta entrenamiento adicional.

## Capacidades

- Generacion de texto conversacional en ingles, sin los filtros de rechazo del modelo original.
- Razonamiento y respuesta a instrucciones heredados del Qwen3.5-35B-A3B base.
- Capacidades multimodales: la presencia de archivos mmproj (Q8_0 y f16) indica soporte de entrada de imagen/vision en la version GGUF.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible (probable por herencia del base, sin verificar).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: la model card declara unicamente "en"; el soporte de otros idiomas del base Qwen no se confirma para esta variante.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion.

## Casos de uso

- Investigacion sobre alineacion y red-teaming: el modelo permite estudiar como responde un LLM sin mecanismos de rechazo ante prompts sensibles, util para evaluar robustez de sistemas de moderacion y para documentar comportamientos no deseados en entornos controlados.
- Inferencia local en hardware de consumo: gracias a las cuantizaciones Q4_K_S/Q4_K_M (~20-21 GB) y a la activacion MoE reducida, puede ejecutarse en una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) mediante llama.cpp, sirviendo como asistente personal sin dependencia de la nube.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o sensibles, donde los filtros del modelo base resultarian limitantes, siempre con revision humana del contenido.
- Prototipado de pipelines multimodales: el uso de los archivos mmproj permite experimentar con entrada de imagenes en local (descripcion, analisis de capturas) integrando el modelo en herramientas compatibles con GGUF multimodal.
- Experimentos de destilacion y evaluacion comparativa: al ser una variante "abliterated" del mismo base, permite comparar directamente el efecto de la eliminacion de rechazos sobre benchmarks de seguridad, utilidad y calidad.
- Desarrollo de sistemas de moderacion y clasificacion: usar el modelo como generador adversarial para entrenar o validar clasificadores de contenido y filtros de seguridad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~13 GB
  - Q3_K_S: ~15,3 GB; Q3_K_M: ~16,9 GB; Q3_K_L: ~18,2 GB
  - IQ4_XS: ~19 GB
  - Q4_K_S: ~20 GB; Q4_K_M: ~21,3 GB
  - Q5_K_S: ~24,1 GB; Q5_K_M: ~24,8 GB
  - Q6_K: ~28,6 GB
  - Q8_0: ~37 GB
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB) admite hasta Q5_K_M ajustado; Q4_K_M es la opcion recomendada por el autor para velocidad y calidad.
  - Profesional/datacenter: A100 40/80 GB, H100, L40S para cuantizaciones altas (Q6_K, Q8_0) y contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 16-24 GB con cuantizaciones Q3-Q4; en 12 GB solo con Q2_K y contexto reducido, con posible offload a CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF; el autor menciona endpoints compatibles en los tags.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF) | ~34,7B totales (MoE) | no disponible | apache-2.0 | GGUF | Variante abliterated, multimodal via mmproj |
| Qwen3.5-35B-A3B (base) | ~34,7B totales (MoE) | no disponible | apache-2.0 | safetensors | Modelo original alineado, con filtros de seguridad |
| llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic | ~34,7B totales (MoE) | no disponible | apache-2.0 | safetensors | Fuente de esta cuantizacion, sin cuantizar |
| Otras variantes abliterated de Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": se ha eliminado o atenuado el comportamiento de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso. No apto para exposicion directa a usuarios sin moderacion.
- Riesgo elevado de alucinacion: la modificacion de pesos puede degradar la coherencia y la fidelidad factual respecto al base; no se han publicado evaluaciones que lo cuantifiquen.
- Idiomas: la model card declara solo ingles; el rendimiento en castellano no esta verificado y podria ser deficiente.
- Contexto: la longitud de contexto no se especifica en la informacion; debe consultarse en el modelo base antes de usarlo en tareas de contexto largo.
- Licencia apache-2.0: permite uso comercial, pero el autor enlaza la licencia del Qwen3.5-35B-A3B original; conviene verificar terminos adicionales del modelo base y las implicaciones legales del contenido generado.
- Responsabilidad legal y etica: el uso en produccion exige filtros propios, auditoria de contenido y cumplimiento normativo (por ejemplo, AI Act en la UE).
- Cuantizaciones bajas (Q2_K, Q3_K_S): perdida notable de calidad; el autor recomienda Q4_K_S/Q4_K_M como compromiso velocidad/calidad.
- Sin garantias de soporte: publicacion de cuantizacion de un tercero, sin mantenimiento ni benchmarks propios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF
- Modelo base (fuente): https://huggingface.co/llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic
- Modelo original Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
