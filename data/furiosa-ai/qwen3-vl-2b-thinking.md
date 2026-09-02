# furiosa-ai/Qwen3-VL-2B-Thinking

## Resumen

El modelo `furiosa-ai/Qwen3-VL-2B-Thinking` es una distribución oficial de FuriosaAI del modelo vision-language Qwen3-VL-2B-Thinking, empaquetada con un Furiosa Executable Bundle (FXB) para su ejecución en el hardware acelerador RNGD de FuriosaAI mediante el framework Furiosa-LLM. Se trata de un modelo denso de 2.127 millones de parámetros que combina un codificador visual con un decodificador transformer denso, y que incorpora las innovaciones de la serie Qwen3-VL: posicionamiento Interleaved-MRoPE, fusión de características multinivel DeepStack y soporte nativo para tool calling. La edición Thinking genera una cadena de razonamiento explícita antes de la respuesta final, lo que la hace adecuada para tareas que requieren deliberación.

La relevancia de esta versión radica en que ofrece un despliegue optimizado y precompilado para el hardware RNGD de FuriosaAI, eliminando la necesidad de compilar el modelo manualmente. El modelo base, desarrollado por Alibaba Qwen, está liberado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Aunque esta distribución concreta está pensada para el ecosistema Furiosa, el modelo subyacente también puede ejecutarse con otros frameworks como vLLM, SGLang o Transformers, tal y como indica la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (dense, vision encoder + transformer decoder) |
| Parametros totales | 2.127.532.032 (2,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Sin cuantizacion (precision original de los pesos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors + Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL, que combina un codificador visual con un decodificador transformer denso. Emplea posicionamiento Interleaved-MRoPE, que permite intercalar embeddings posicionales de imagen y texto, y DeepStack, un mecanismo de fusion de caracteristicas multinivel que mejora la comprension de imagenes y videos. La edicion Thinking incorpora un modo de razonamiento que genera una cadena de pensamiento explicita antes de la respuesta final, separada en el campo `reasoning` de la API.

Los datos de entrenamiento no estan disponibles en la informacion proporcionada. El modelo base fue desarrollado por Alibaba Qwen y posteriormente adaptado por FuriosaAI para su hardware. No se menciona el uso de RLHF o DPO en la documentacion consultada. La distribucion FuriosaAI no aplica cuantizacion: los pesos se mantienen en la misma precision que el modelo original.

## Capacidades

- Vision-lenguaje multimodal: acepta mensajes con partes de contenido `image_url` junto a texto, siguiendo el formato de OpenAI.
- Razonamiento con cadena de pensamiento: la edicion Thinking emite un razonamiento explicito que Furiosa-LLM separa mediante el parser `qwen3`.
- Tool calling: soporta llamadas a funciones mediante el parser `hermes`, compatible con la serie Qwen3.
- Comprension visual avanzada: OCR, analisis de documentos y graficos, razonamiento espacial y comprension de video (segun la model card).
- API compatible con OpenAI: expone endpoints `/v1/chat/completions` con soporte para streaming y no streaming.
- Procesamiento de imagenes por URL remota, base64 o rutas locales (estas ultimas requieren configuracion adicional).

## Casos de uso

- Analisis de documentos e imagenes en entornos empresariales: el modelo puede extraer texto, tablas y graficos de capturas o PDFs, gracias a sus capacidades de OCR y comprension de documentos. Se integraria mediante la API OpenAI-compatible de Furiosa-LLM.
- Atencion al cliente con soporte visual: permite que un agente conversacional reciba capturas de pantalla o fotos de productos y responda con instrucciones o diagnosticos, aprovechando el modo Thinking para razonar antes de responder.
- Agentes autonomos con tool calling: al soportar llamadas a funciones, puede integrarse en pipelines que consulten bases de datos, APIs externas o ejecuten acciones, combinando vision y razonamiento.
- Asistencia en educacion y formacion: puede explicar diagramas, resolver problemas matematicos visuales o describir figuras, generando una cadena de razonamiento que facilita la comprension del proceso.
- Moderacion de contenido visual: analiza imagenes para detectar texto inapropiado o elementos visuales problematicos, con la ventaja de poder razonar sobre el contexto.
- Prototipado rapido de aplicaciones multimodales: al estar precompilado para RNGD, permite desplegar un servidor de inferencia en minutos con `furiosa-llm serve`, ideal para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de FuriosaAI no incluye metricas de rendimiento, y los datos de evaluacion del modelo base Qwen3-VL-2B-Thinking no se han proporcionado en esta ficha. Se recomienda consultar la documentacion oficial de Qwen para obtener resultados comparativos.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD, con una estrategia de paralelismo de tensor-parallel size 8 PEs, que se corresponde con una unica tarjeta RNGD (8 PEs por tarjeta).
- VRAM estimada: no disponible, ya que el modelo se ejecuta en el acelerador RNGD y no en GPUs convencionales.
- GPU recomendadas: no aplica para esta distribucion; el modelo base puede ejecutarse en GPUs estandar con otros frameworks, pero esta version concreta requiere RNGD.
- Opciones de despliegue: Furiosa-LLM (servidor OpenAI-compatible), con flags para controlar limites de imagenes/videos y proteccion SSRF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. El modelo base Qwen3-VL-2B-Thinking es el mismo que el de esta distribucion, por lo que la comparativa se limita a la diferencia de empaquetado (FXB para RNGD frente a pesos estandar). Otros modelos vision-language de tamano similar, como PaliGemma-2B o LLaVA-1.6, no han sido evaluados en esta ficha por falta de datos. Se recomienda consultar los benchmarks publicados por Qwen para el modelo base.

## Limitaciones y advertencias

- Hardware restringido: esta distribucion solo funciona en FuriosaAI RNGD con Furiosa-LLM; no es portable a GPUs convencionales sin usar el modelo base.
- Sin cuantizacion: al no aplicar cuantizacion, el modelo requiere la precision completa, lo que puede aumentar el consumo de memoria en comparacion con versiones cuantizadas.
- Sesgos y alucinaciones: no se han documentado sesgos especificos, pero como modelo de lenguaje multimodal, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- Longitud de contexto no especificada: no se ha indicado la ventana de contexto maxima, lo que limita la planificacion de aplicaciones con entradas largas.
- Dependencia de la infraestructura Furiosa: el despliegue requiere instalar Furiosa-LLM y sus prerequisitos, lo que anade una capa de complejidad operativa.
- Acceso a archivos locales restringido: por defecto, no se permite leer rutas `file://`; es necesario configurar `--allowed-local-media-path` explicitamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-VL-2B-Thinking
- Documentacion FuriosaAI para Qwen3-VL: https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3-vl.html
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-VL-2B-Thinking
- Pagina de Ollama para qwen3-vl:2b-thinking: https://ollama.com/library/qwen3-vl:2b-thinking
