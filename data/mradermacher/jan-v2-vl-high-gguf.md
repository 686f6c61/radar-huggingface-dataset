# mradermacher/Jan-v2-VL-high-GGUF

## Resumen

Jan-v2-VL-high es un modelo multimodal (vision-lenguaje) de 8.190.735.360 parametros (aproximadamente 8,2 mil millones) desarrollado por JanHQ (janhq), el equipo detras de la aplicacion de escritorio Jan. El modelo esta disenado para tareas de agente y conversacion, segun indican las etiquetas de su model card, y combina procesamiento de imagen con generacion de texto en ingles. Esta ficha documenta la version cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicacion radica en que acerca un modelo vision-lenguaje de ~8B a equipos con GPU de consumo: el cuantizado Q4_K_M ocupa aproximadamente 5,1 GB y el Q8_0 unos 8,8 GB, lo que lo hace viable en tarjetas graficas con 8-12 GB de VRAM. El repositorio incluye ademas ficheros `mmproj` (proyector multimodal) necesarios para el procesamiento de imagenes, en versiones Q8_0 y f16.

La informacion disponible sobre el modelo base es limitada: la model card del cuantizado no detalla arquitectura interna, datos de entrenamiento, longitud de contexto ni resultados de benchmarks. Los datos que se ofrecen a continuacion proceden del repositorio de Hugging Face y de la propia model card del cuantizado; cualquier dato no confirmado se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-lenguaje; detalles del transformer no publicados en la informacion disponible) |
| Parametros totales | 8.190.735.360 (~8,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `janhq/Jan-v2-VL-high` en la documentacion proporcionada. Por las etiquetas del repositorio (`transformers`, `agent`, `base_model:janhq/Jan-v2-VL-high`) y por la presencia de ficheros `mmproj`, se trata de un modelo multimodal que combina un codificador visual con un modelo de lenguaje, empaquetado para su uso con llama.cpp. El numero de parametros (8,19B) corresponde al total del checkpoint en safetensors.

Tampoco se detallan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset), ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del cuantizado se limita a indicar que se trata de cuantizados estaticos del modelo original y a listar los ficheros generados, sin aportar detalles sobre el proceso de entrenamiento del modelo base. No se han identificado innovaciones tecnicas documentadas (atencion lineal, decodificacion especulativa u otras) en el material disponible.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes: la presencia de ficheros `mmproj` (proyector multimodal) confirma capacidad de vision-lenguaje, aunque no se detallan tareas concretas soportadas.
- Orientacion a agentes: la etiqueta `agent` sugiere uso en flujos de agente, si bien no se documenta soporte explicito de tool calling o function calling.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a traves de infraestructura de inferencia compatible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- No se documentan capacidades de audio, modo thinking explicito ni otras modalidades adicionales.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede recibir imagenes de facturas, formularios o capturas y generar descripciones o extracciones en texto, aprovechando su naturaleza vision-lenguaje y su tamano contenido para despliegue en servidor modesto.
- Asistente de escritorio local: integrado en la aplicacion Jan o en llama.cpp, permite conversaciones multimodales sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Descripcion automatica de imagenes en pipelines de catalogacion: con el cuantizado Q4_K_M (5,1 GB) puede ejecutarse en una GPU de consumo para etiquetar lotes de imagenes con descripciones en ingles.
- Prototipado de agentes visuales: la etiqueta `agent` y la compatibilidad con endpoints permiten construir prototipos de agentes que interpretan capturas de pantalla o imagenes y responden con acciones textuales.
- Soporte conversacional con adjuntos de imagen: atencion al cliente o asistencia tecnica donde el usuario envia una captura de error y el modelo la interpreta y responde.
- Educacion y accesibilidad: generacion de descripciones alternativas de contenido visual o explicaciones de diagramas para usuarios con discapacidad visual, en ingles.
- Inferencia en el borde (edge): con el cuantizado Q2_K (3,4 GB) o Q3_K_S (3,9 GB) puede desplegarse en equipos con VRAM limitada o incluso en CPU, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~3,4 GB; Q3_K_S ~3,9 GB; Q4_K_S ~4,9 GB; Q4_K_M ~5,1 GB; Q5_K_M ~6,0 GB; Q6_K ~6,8 GB; Q8_0 ~8,8 GB; f16 ~16,5 GB. Hay que sumar el proyector multimodal: mmproj-Q8_0 ~0,9 GB o mmproj-f16 ~1,3 GB.
- VRAM total recomendada: aproximadamente 6-7 GB para Q4_K_M con mmproj Q8_0; unos 10 GB para Q8_0 con mmproj.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 o H100 para mayor throughput. El cuantizado Q4_K_M cabe en GPUs de consumo con 8 GB o mas, dejando margen limitado para el contexto.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizados Q4 o inferiores; los cuantizados Q2/Q3 pueden ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los ficheros originales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Jan-v2-VL-high (esta ficha) | ~8,2B | no disponible | apache-2.0 | GGUF, safetensors | Vision-lenguaje, orientado a agentes, solo ingles |
| Alternativas de ~7-9B multimodal | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables concretos en la informacion disponible |

No disponible: no se han identificado en el material proporcionado modelos comparables con datos verificables de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al ser un modelo entrenado principalmente con datos en ingles, es probable que herede sesgos culturales y linguisticos de esos datos.
- Alucinacion: sin benchmarks ni evaluaciones publicadas, no es posible cuantificar el riesgo de alucinacion; en tareas de vision-lenguaje el riesgo de descripciones erroneas de imagenes es relevante y debe validarse en produccion.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- Licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base `janhq/Jan-v2-VL-high` antes de desplegarlo en produccion.
- Cuantizados de baja precision: Q2_K y Q3_K pueden degradar notablemente la calidad, especialmente en tareas multimodales; se recomienda Q4_K_M o superior para uso real.
- Proyector multimodal: es imprescindible descargar el fichero `mmproj` correspondiente junto con el GGUF del modelo de lenguaje; sin el, la capacidad de vision no funciona.
- Fecha de creacion del repositorio (2025-11-13) y actualizacion (2026-11-02): verificar que la version descargada corresponde a la revision deseada.

## Enlaces

- Repositorio Hugging Face del cuantizado: https://huggingface.co/mradermacher/Jan-v2-VL-high-GGUF
- Modelo base: https://huggingface.co/janhq/Jan-v2-VL-high
- Cuantizados con imatrix (weighted): https://huggingface.co/mradermacher/Jan-v2-VL-high-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Jan-v2-VL-high-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
