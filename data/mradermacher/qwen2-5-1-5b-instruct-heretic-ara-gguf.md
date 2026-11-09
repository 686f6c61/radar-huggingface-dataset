# mradermacher/Qwen2.5-1.5B-Instruct-heretic-ara-GGUF

## Resumen
El modelo `mradermacher/Qwen2.5-1.5B-Instruct-heretic-ara-GGUF` es una distribucion de pesos en formato GGUF generada por mradermacher a partir del modelo `aasis001/Qwen2.5-1.5B-Instruct-heretic-ara`. Se trata de una variante "abliterated" o "decensored" del modelo Qwen2.5-1.5B-Instruct de Alibaba, sometida a una tecnica de edicion de pesos (abliteration) que elimina o atenua el comportamiento de rechazo aprendido durante el ajuste fino por instrucciones. El resultado es un modelo conversacional de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) con pesos liberados bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que combina tres elementos: un modelo base pequeno y eficiente (Qwen2.5-1.5B-Instruct), una modificacion de seguridad deliberada (heretic/abliterated) y una coleccion de cuantizaciones GGUF listas para desplegar en hardware modesto. El repositorio ocupa 14,2 GB e incluye 12 variantes de cuantizacion desde Q2_K hasta f16, lo que permite ejecutar el modelo en CPU, GPUs de consumo y entornos embebidos mediante llama.cpp u Ollama.

Conviene subrayar que esta ficha describe la distribucion GGUF, no el modelo original de Alibaba. El autor del quantizado no documenta detalles de entrenamiento, composicion del dataset ni resultados de evaluacion; toda la informacion tecnica disponible proviene de los metadatos del repositorio y de la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct; detalles no documentados en el repositorio) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para esta variante) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (12 ficheros, de 0,8 GB a 3,2 GB) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y sesgos de atencion tipo QKV (caracteristicas estandar de la familia Qwen2.5). El repositorio no incluye informacion sobre el numero exacto de capas, dimensiones ocultas, cabezas de atencion ni vocabulario; estos datos deben consultarse en la model card del modelo base `aasis001/Qwen2.5-1.5B-Instruct-heretic-ara` o en la del Qwen2.5-1.5B-Instruct original.

El proceso de "abliteration" (etiquetado como `heretic`, `abliterated`, `decensored`, `uncensored`) consiste en identificar la direccion en el espacio de activaciones asociada al comportamiento de rechazo y proyectar los pesos para eliminarla, sin reentrenamiento adicional. No se documentan en el repositorio ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO posteriores a la abliteracion. La cuantizacion GGUF la realiza mradermacher con herramientas estandar (llama.cpp), generando cuantizaciones estaticas sin imatrix (el autor indica que las versiones ponderadas con imatrix no estan disponibles en el momento de la publicacion).

## Capacidades
- Generacion de texto conversacional multi-turno, heredada del ajuste por instrucciones de Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones en ingles; el modelo base Qwen2.5 es competente en tareas de sentido comun, extraccion y resumen a esta escala.
- Generacion de codigo y matematicas a nivel basico, limitado por el tamano de 1,5B parametros.
- Comportamiento "decensored": se espera que reduzca los rechazos ante peticiones que el modelo original declinaria; no hay evaluacion publicada que cuantifique este efecto.
- Soporte de tool calling y function calling: no documentado en este repositorio (el Qwen2.5-Instruct original lo soporta, pero la abliteracion puede haber alterado el formato de plantilla; no confirmado).
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Multilingue: los metadatos declaran unicamente `en`; el Qwen2.5 base soporta multiples idiomas, pero esta variante no lo declara.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
- Experimentacion con tecnicas de abliteration: el modelo sirve como caso de estudio para investigadores que quieran comparar el comportamiento de un modelo Instruct frente a su version abliterated, midiendo tasas de rechazo, calidad de respuesta y degradacion en tareas estandar.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (1,1 GB) o Q5_K_M (1,2 GB) puede ejecutarse en GPUs con 4-6 GB de VRAM o incluso en CPU con llama.cpp, lo que lo hace util para prototipos locales sin infraestructura dedicada.
- Generacion de texto creativo sin filtros: escritura de ficcion, guiones o dialogos donde el autor necesita evitar rechazos del modelo; la naturaleza decensored reduce las interrupciones por politicas de contenido.
- Chatbot de proposito general en ingles: para aplicaciones conversacionales de baja latencia donde 1,5B parametros es suficiente y el contexto requerido es corto.
- Evaluacion de riesgos y red teaming: util para estudiar como la eliminacion de la capa de rechazo afecta a la seguridad, la veracidad y la coherencia del modelo en dominios sensibles.
- Fine-tuning ligero sobre la base abliterated: al estar bajo Apache 2.0 y en formato GGUF (aunque para fine-tuning convendria partir del safetensors original), sirve como punto de partida para adaptaciones de dominio con LoRA en GPUs modestas.
- Educacion y demostraciones: ejemplo didactico de cuantizacion GGUF, abliteration y despliegue con llama.cpp u Ollama en un portatil.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (0,8 GB): ~1,5-2 GB de VRAM.
  - Q4_K_M (1,1 GB): ~2-2,5 GB de VRAM.
  - Q5_K_M (1,2 GB): ~2,5-3 GB de VRAM.
  - Q8_0 (1,7 GB): ~3-3,5 GB de VRAM.
  - f16 (3,2 GB): ~4-5 GB de VRAM.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060, RTX 4090); A100/H100 no son necesarias y estarian sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs modernas con 4 GB o mas; tambien en CPU mediante llama.cpp con rendimiento aceptable en cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (soporte GGUF experimental), TGI (no soporta GGUF de forma nativa). El repositorio esta etiquetado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. A modo orientativo, un modelo de 1,5B en Q4_K_M en una RTX 4090 suele superar las decenas de tokens por segundo, pero no hay medicion oficial para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen2.5-1.5B-Instruct-heretic-ara-GGUF | 1,54B | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo ingles declarado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (nativo) | Apache 2.0 | safetensors, GGUF | Modelo original con alineacion de seguridad |
| aasis001/Qwen2.5-1.5B-Instruct-heretic-ara | 1,54B | no disponible | Apache 2.0 | safetensors | Modelo base del que deriva esta cuantizacion |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta, con restricciones de licencia |

## Limitaciones y advertencias
- La abliteration elimina o atenua el comportamiento de rechazo, lo que incrementa el riesgo de generar contenido danino, sesgado o inexacto sin advertencia; no debe desplegarse en produccion orientada al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: a 1,5B parametros, la capacidad de razonamiento y verificacion factica es limitada, y la abliteration puede agravar la tendencia a responder con confianza ante preguntas para las que el modelo no tiene conocimiento.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: no se documenta la longitud de contexto efectiva de esta variante; asumir la del modelo base sin verificacion puede provocar degradacion en conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero el autor del cuantizado no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones con requisitos de moderacion de contenido.
- No hay evaluacion publicada de sesgos, toxicidad ni calidad; el modelo no ha pasado por un proceso de red teaming documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Las cuantizaciones son estaticas (sin imatrix); el autor advierte que las versiones ponderadas pueden no estar disponibles.

## Enlaces
- Repositorio Hugging Face del GGUF: https://huggingface.co/mradermacher/Qwen2.5-1.5B-Instruct-heretic-ara-GGUF
- Modelo base (safetensors): https://huggingface.co/aasis001/Qwen2.5-1.5B-Instruct-heretic-ara
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen2.5-1.5B-Instruct-heretic-ara-GGUF
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
