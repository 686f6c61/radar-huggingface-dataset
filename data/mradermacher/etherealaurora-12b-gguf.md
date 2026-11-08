# mradermacher/EtherealAurora-12B-GGUF

## Resumen

EtherealAurora-12B-GGUF es la distribucion en formato GGUF del modelo EtherealAurora-12B, un modelo de lenguaje conversacional de 12.247.782.400 parametros desarrollado originalmente por yamatazen y cuantizado por mradermacher. Se trata de un merge (fusion de pesos) construido con la herramienta mergekit, orientado a conversacion multi-turno con plantilla ChatML y soporte para ingles y japones. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que el repositorio original solo distribuia pesos en precision completa (safetensors), mientras que esta version ofrece once cuantizaciones GGUF estaticas que van desde 4,9 GB (Q2_K) hasta 13,1 GB (Q8_0). Esto permite ejecutar un modelo de 12B parametros en hardware de consumo, algo inviable con los pesos originales de aproximadamente 24 GB en FP16. El repositorio ocupa 84,7 GB en total e incluye todas las variantes en un unico espacio.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks. El modelo esta etiquetado como conversacional y su pipeline no esta declarado en Hugging Face. Las cifras de descargas (173) y likes (3) indican una adopcion baja en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de merge con mergekit; detalles no disponibles) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base EtherealAurora-12B es el resultado de una fusion de pesos realizada con mergekit, segun las etiquetas del repositorio. No se especifica en la informacion disponible que modelos se combinaron, con que metodo de merge (SLERP, TIES, DARE, passthrough, etc.) ni con que hiperparametros. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La unica informacion estructural concreta es el numero de parametros (12.247.782.400) y el uso de la plantilla de chat ChatML, que condiciona el formato de las conversaciones de entrada.

La aportacion de esta ficha concreta es la cuantizacion. mradermacher ha generado cuantizaciones estaticas con el formato GGUF de llama.cpp, sin imatrix (las variantes ponderadas con imatrix se publican en un repositorio separado, EtherealAurora-12B-i1-GGUF). Las cuantizaciones K-quant siguen la escala habitual de llama.cpp: Q2_K como la mas agresiva, Q4_K_M como el equilibrio recomendado por el autor para velocidad y calidad, y Q8_0 como la de mayor fidelidad respecto al modelo original. No se documentan innovaciones tecnicas adicionales como atencion lineal, decodificacion especulativa o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla ChatML.
- Soporte de ingles y japones como idiomas declarados.
- Conversacion general y respuesta a instrucciones, segun la etiqueta "conversational".
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible del repositorio).
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling y agentes: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en ingles o japones: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo y gestionar dialogos multi-turno con formato ChatML, sin dependencia de APIs externas ni coste por token.
- Prototipado de chatbots bilingues en entornos con GPU de consumo: la cuantizacion Q4_K_M (7,6 GB) cabe en GPUs de 8-12 GB de VRAM, lo que permite iterar sobre prompts y plantillas de sistema en hardware asequible.
- Evaluacion de merges comunitarios: investigadores que estudian el efecto de las fusiones de pesos pueden comparar este merge con sus modelos de origen usando las distintas cuantizaciones para ahorrar memoria y tiempo de carga.
- Procesamiento de texto en japones en pipelines offline: al soportar japones, puede emplearse para tareas de resumen o reformulacion en entornos sin conectividad, siempre que se valide la calidad con datos propios.
- Despliegue en servidores sin GPU dedicada: las variantes Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten inferencia en CPU con RAM moderada, adecuadas para tareas de baja concurrencia.
- Base para fine-tuning ligero o experimentacion con LoRA: al estar disponible en GGUF y con licencia Apache 2.0, sirve como punto de partida para adaptaciones internas, aunque el fine-tuning sobre GGUF requiere conversion previa a safetensors.
- Generacion de contenido creativo en ingles: el formato conversacional y la licencia permisiva facilitan su uso en herramientas de escritura asistida, con la advertencia de revisar sesgos y alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV): Q2_K aproximadamente 5-6 GB; Q4_K_M aproximadamente 8-9 GB; Q8_0 aproximadamente 13-14 GB. Cifras estimadas a partir del tamano de fichero; no verificadas empiricamente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para las cuantizaciones Q4 a Q8. Para Q8_0 con contexto largo, se recomienda 16 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_S o Q4_K_M; con 6 GB solo caben Q2_K y Q3_K_S con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en la informacion disponible.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EtherealAurora-12B-GGUF (este) | 12,25B | no disponible | en, ja | Apache 2.0 | GGUF | Merge comunitario con 11 cuantizaciones |
| yamatazen/EtherealAurora-12B | 12,25B | no disponible | en, ja | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/EtherealAurora-12B-i1-GGUF | 12,25B | no disponible | en, ja | Apache 2.0 | GGUF | Variante con cuantizacion imatrix |
| mradermacher/EtherealAurora-12B-v2-GGUF | no disponible | no disponible | en, ja | Apache 2.0 | GGUF | Version v2 del mismo modelo, con 6 likes |

No se dispone de datos de rendimiento para comparar cualitativamente con alternativas de la misma categoria; la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos; al ser un merge comunitario sin model card detallada, no se puede evaluar su comportamiento en dominios sensibles.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de veracidad ni de tasa de alucinacion.
- Cobertura idiomatica limitada a ingles y japones; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion con contexto extenso.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan la perplejidad de forma notable; el propio autor marca Q3_K_M como "lower quality".
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento impide verificar el cumplimiento de derechos de autor de los datos originales.
- El modelo base es un merge sin paper ni evaluacion formal; no debe asumirse un rendimiento equivalente al de modelos entrenados desde cero con el mismo numero de parametros.
- El repositorio no declara pipeline ni tarea en Hugging Face, lo que complica la integracion automatica en algunos frameworks.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EtherealAurora-12B-GGUF
- Modelo base: https://huggingface.co/yamatazen/EtherealAurora-12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/EtherealAurora-12B-i1-GGUF
- Version v2 en GGUF: https://huggingface.co/mradermacher/EtherealAurora-12B-v2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#EtherealAurora-12B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
