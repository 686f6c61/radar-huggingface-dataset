# mradermacher/MiniCPM5-abliterated-2B-GGUF

## Resumen

MiniCPM5-abliterated-2B-GGUF es la distribucion en formato GGUF del modelo SonGT1/MiniCPM5-abliterated-2B, una variante "abliterated" (sin mecanismos de rechazo) del MiniCPM5 de 2B parametros. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp. El modelo base procede de la familia MiniCPM5, orientada a modelos compactos de 2B parametros con soporte para chino e ingles.

La relevancia de esta ficha reside en dos factores: por un lado, el formato GGUF permite ejecutar un modelo de 2,5 mil millones de parametros en hardware de consumo; por otro, la variante "abliterated" elimina los comportamientos de rechazo del modelo original, lo que la hace atractiva para investigacion sobre alineamiento, generacion creativa sin filtros y escenarios de evaluacion de robustez. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

El repositorio incluye 11 cuantizaciones estaticas que van desde Q2_K (1,1 GB) hasta f16 (5,1 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. No se dispone de informacion sobre arquitectura interna, contexto nativo ni datos de entrenamiento en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM5, transformer presumiblemente) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base SonGT1/MiniCPM5-abliterated-2B en la documentacion proporcionada. Por el nombre y el tamano (2,5B parametros) se trata presumiblemente de un transformer decoder-only de la familia MiniCPM5, pero no se confirma en la model card. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La caracteristica tecnica diferencial es el proceso de "abliteration": una modificacion de los pesos orientada a eliminar la direccion de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder ante ciertas peticiones. Este proceso se aplico en el modelo base SonGT1 y mradermacher se limita a cuantizarlo a GGUF. No se especifica la metodologia exacta de abliteration empleada ni el impacto cuantitativo sobre capacidades originales.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Respuestas sin mecanismos de rechazo (comportamiento "uncensored" derivado de la abliteration).
- Conversacion multi-turno (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta soporte de vision, audio ni modo "thinking".
- Capacidades multilingues limitadas a zh y en segun los metadatos.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta a la tasa de rechazo y a la calidad de las respuestas, comparandolo con el MiniCPM5 original en experimentos controlados.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los modelos alineados suelen rechazar o suavizar el contenido.
- Evaluacion de robustez de filtros: uso como modelo "adversario" para probar clasificadores de contenido y sistemas de moderacion en pipelines de produccion.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (1,7 GB) el modelo cabe en GPUs de 4-6 GB de VRAM o incluso en CPU, lo que permite prototipado local sin infraestructura cloud.
- Traduccion y asistencia bilingue zh-en: el modelo soporta ambos idiomas, por lo que puede emplearse en tareas de traduccion o atencion al cliente en ese par linguistico.
- Experimentacion con llama.cpp y Ollama: al estar en GGUF, se integra directamente en herramientas de inferencia local para pruebas de latencia, throughput y calidad por cuantizacion.
- Fine-tuning ligero sobre base abliterated: util para investigadores que quieran partir de un modelo sin rechazos y aplicar LoRA o DPO para re-alinear selectivamente ciertos comportamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,1 GB
  - Q4_K_M: ~1,7 GB
  - Q5_K_M: ~1,9 GB
  - Q8_0: ~2,8 GB
  - f16: ~5,1 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060). Para Q8_0 o f16 se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti, RTX 4070).
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de 4 GB o mas con cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF. No se documenta soporte en vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (2,5B) y las cuantizaciones Q4, se espera inferencia en tiempo real en GPU de consumo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM5-abliterated-2B-GGUF (este) | 2,52B | no disponible | zh, en | Apache 2.0 | GGUF |
| MiniCPM5-abliterated-2B (base) | 2,52B | no disponible | zh, en | Apache 2.0 | safetensors |
| MiniCPM5-abliterated-2B-i1-GGUF (mradermacher) | 2,52B | no disponible | zh, en | Apache 2.0 | GGUF (imatrix) |
| MiniCPM5 original | no disponible | no disponible | zh, en | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada. La diferencia principal entre las tres primeras es el metodo de cuantizacion: estatica (este repositorio) frente a imatrix (i1-GGUF), que suele ofrecer mejor calidad por bit en cuantizaciones bajas.

## Limitaciones y advertencias

- Modelo "abliterated": se ha eliminado deliberadamente el comportamiento de rechazo, lo que implica que puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: al tratarse de un modelo de 2,5B parametros, su capacidad de razonamiento y factualidad es limitada en comparacion con modelos de mayor tamano. No se recomienda para tareas que requieran alta precision factual sin verificacion.
- Idiomas limitados: solo chino e ingles segun los metadatos. El rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto desconocido: no se documenta la longitud de contexto nativa, lo que dificulta planificar casos de uso con ventanas largas.
- La abliteration puede degradar capacidades generales del modelo original; no se aportan evaluaciones que cuantifiquen esta perdida.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el contenido generado puede infringir normativas locales o las politicas de las plataformas donde se despliegue. La responsabilidad recae en el integrador.
- El repositorio tiene 0 likes y fue creado en octubre de 2026, lo que sugiere poca validacion por parte de la comunidad.
- El tamano del repo (22,8 GB) se debe a que incluye todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiniCPM5-abliterated-2B-GGUF
- Modelo base: https://huggingface.co/SonGT1/MiniCPM5-abliterated-2B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/MiniCPM5-abliterated-2B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniCPM5-abliterated-2B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
