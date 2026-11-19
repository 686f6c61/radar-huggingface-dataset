# gagni/granite-4.0-h-350m-GGUF

## Resumen

`gagni/granite-4.0-h-350m-GGUF` es un espejo de cuantizacion en formato GGUF del modelo base `ibm-granite/granite-4.0-h-350m` de IBM, publicado por el usuario `gagni`. No se trata de un modelo nuevo ni de un fine-tune: la model card indica explicitamente que es una copia byte a byte del fichero `granite-4.0-h-350m-Q4_K_M.gguf` del repositorio oficial de IBM, con el mismo hash SHA-256, distribuido bajo licencia Apache 2.0. Su interes practico es servir como artefacto listo para inferencia local en cuantizacion Q4_K_M sin depender del repositorio original.

El modelo subyacente pertenece a la familia Granite 4.0 de IBM, en su variante hibrida ("h") y con 340.332.224 parametros reales segun los pesos safetensors del modelo base, lo que lo situa en la categoria de modelos pequenos orientados a despliegue en CPU, edge y entornos con recursos limitados. El contexto, la composicion exacta del dataset y los detalles de entrenamiento no se detallan en la informacion disponible; para eso hay que remitirse a la model card oficial de IBM.

La relevancia de este repositorio es acotada: sirve para quien quiera descargar directamente el GGUF Q4_K_M verificado por hash, o para quien integre el modelo en pipelines de clasificacion ligera. El propio autor declara usarlo como clasificador local pequeno dentro de aSup. No aporta mejoras tecnicas sobre el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer hibrida (familia Granite 4.0 "h"); detalles internos no disponibles |
| Parametros totales | 340.332.224 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `ibm-granite/granite-4.0-h-350m`. La nomenclatura de IBM ("h" en Granite 4.0) apunta a una variante hibrida, pero la model card de este espejo no especifica la combinacion de capas (attention, SSM u otras) ni la configuracion de cabezas, capas o dimension oculta. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o instruction tuning. Toda esa informacion debe consultarse en la model card oficial de IBM.

Lo unico verificable en este repositorio es el proceso de cuantizacion: se distribuye un unico fichero Q4_K_M generado a partir del modelo base, con SHA-256 `0a8d6a7373602fadfba274a640ba784b86cc6847f1c67f1b0a90fa2ec266b7fb` y referencia al commit `a864f823cce6e6048b5752e2816fe7a23987d790` del repositorio oficial `ibm-granite/granite-4.0-h-350m-GGUF`. No hay innovaciones tecnicas anadidas por el autor del espejo.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que el modelo esta preparado para dialogos de chat.
- Clasificacion local: el autor declara explicitamente su uso como "small local classifier" en aSup, lo que sugiere capacidad para tareas de etiquetado y clasificacion de texto.
- Inferencia en CPU y entornos ligeros: al ser un GGUF Q4_K_M de ~0,2 GB, es ejecutable con llama.cpp y derivados.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Tool calling, agentes multi-paso, vision, audio, thinking mode o capacidades multilingues explicitas: no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion de texto en local: el modelo puede ejecutarse con llama.cpp en CPU para etiquetar tickets, correos o mensajes cortos, aprovechando su tamano reducido (~340 M de parametros) y su cuantizacion Q4_K_M para mantener latencia baja en hardware modesto.
- Filtrado previo en pipelines RAG: usar el modelo como clasificador de relevancia o enrutador de consultas antes de llamar a un modelo mayor, reduciendo coste por token en produccion.
- Despliegue en edge y dispositivos con poca memoria: el fichero GGUF de ~0,2 GB cabe en Raspberry Pi, moviles de gama alta o contenedores con limites estrictos de RAM, lo que permite inferencia offline.
- Prototipado rapido de asistentes conversacionales: gracias al tag `conversational`, sirve para validar flujos de chat multi-turno antes de escalar a modelos mayores.
- Moderation y triaje de contenido: como clasificador binario o multiclase de toxicidad, spam o intencion, integrado en un servicio HTTP compatible con endpoints.
- Entornos de investigacion con restricciones de computo: permite experimentar con tecnicas de prompting, evaluacion o destilacion sin acceso a GPU, usando el espejo verificado por hash para reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 0,2 GB, por lo que la VRAM necesaria es marginal; la mayor parte del consumo sera RAM del sistema y buffers de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 1-2 GB de VRAM libre es suficiente (GTX 1050 Ti, RTX 3050, RTX 4060, etc.); tambien A100/H100 sin aprovechamiento real de su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU pura.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), servidores compatibles con la API de Hugging Face (`endpoints_compatible`), y cualquier runtime que acepte GGUF Q4_K_M.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gagni/granite-4.0-h-350m-GGUF (este) | 340.332.224 | no disponible | GGUF Q4_K_M | Apache 2.0 | Hugging Face |
| ibm-granite/granite-4.0-h-350m | 340.332.224 | no disponible | safetensors (modelo base) | Apache 2.0 | Hugging Face |
| ibm-granite/granite-4.0-h-350m-GGUF | 340.332.224 | no disponible | GGUF (multiples cuantizaciones) | Apache 2.0 | Hugging Face |

La comparativa con modelos de otros fabricantes (p. ej. Qwen2.5-0.5B, SmolLM2-360M, Llama 3.2 1B) no puede completarse con datos verificados en la informacion proporcionada; se indica como no disponible.

## Limitaciones y advertencias

- Es un espejo, no un modelo original: cualquier correccion, actualizacion o cambio de licencia debe rastrearse en el repositorio oficial de IBM.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- Capacidades multilingues no confirmadas: el repositorio no declara idiomas soportados, por lo que no debe asumirse cobertura fuera del ingles sin validacion previa.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Licencia Apache 2.0 permite uso comercial, pero al ser un espejo conviene verificar que el modelo base mantiene la misma licencia en su version vigente.
- Al tratarse de un modelo de ~340 M de parametros, su calidad en razonamiento complejo, codigo y matematicas sera limitada en comparacion con modelos de mayor tamano; no es adecuado como sustituto de un LLM grande en tareas exigentes.
- El repositorio tiene 0 descargas y 0 likes en el momento del registro, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio del espejo: https://huggingface.co/gagni/granite-4.0-h-350m-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Repositorio GGUF oficial de IBM: https://huggingface.co/ibm-granite/granite-4.0-h-350m-GGUF
- Commit de referencia del fichero original: `a864f823cce6e6048b5752e2816fe7a23987d790`
