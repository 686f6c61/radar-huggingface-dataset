# Phuc-HugigFace/Qwen3.5-2B-Vi-DPO-GGUF

## Resumen

`Phuc-HugigFace/Qwen3.5-2B-Vi-DPO-GGUF` es un repositorio de pesos en formato GGUF publicado por el usuario Phuc-HugigFace el 17 de septiembre de 2026. El recuento real de parametros almacenado en el repositorio es de 1.881.825.088 (aproximadamente 1,88 mil millones), coherente con la etiqueta "2B" del nombre. El repositorio ocupa 4,8 GB, acumula 24 descargas y 0 likes, y no incluye model card, licencia declarada, idiomas ni pipeline de HuggingFace.

Por el nombre se puede inferir, sin confirmacion alguna, que se trata de un ajuste de una base de la familia Qwen de unos 2.000 millones de parametros, orientado al vietnamita (sufijo "Vi") y alineado mediante DPO (Direct Preference Optimization), cuantizado a GGUF para inferencia en llama.cpp y compatible con endpoints. Ninguna de estas inferencias esta respaldada por documentacion del autor: no hay paper, config.json publico, ficha tecnica ni resultados de evaluacion.

La relevancia de esta ficha es, por tanto, metodologica: sirve como caso de repositorio opaco, donde la ausencia de licencia, de datos de entrenamiento y de evaluacion impide cualquier uso en produccion sin una validacion previa por parte del equipo que lo adopte. Ademas, la designacion "Qwen3.5" no se corresponde con ninguna generacion oficial publicada de la familia Qwen conocida hasta la fecha de creacion del repositorio, lo que anade incertidumbre sobre el origen real de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer decoder-only de la familia Qwen; sin confirmar) |
| Parametros totales | 1.881.825.088 (≈1,88 B) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio es GGUF; no se documentan los niveles incluidos) |
| Idiomas soportados | no disponible (el sufijo "Vi" del nombre sugiere vietnamita; sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Tamano del repositorio | 4,8 GB |
| Autor | Phuc-HugigFace |
| Fecha de creacion | 2026-09-17 |
| Fecha de actualizacion | 2026-09-17 |
| Descargas / likes | 24 / 0 |
| Etiquetas declaradas | gguf, endpoints_compatible, region:us, conversational |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. El recuento de parametros (1.881.825.088) no coincide exactamente con ningun checkpoint oficial de ~2B ampliamente conocido, lo que impide mapearlo de forma fiable a una base concreta. El tag "conversational" indica que esta pensado para uso dialogado, y el sufijo "DPO" del nombre apunta a una fase de alineacion por optimizacion directa de preferencias, presumiblemente aplicada sobre un ajuste supervisado previo. Se desconoce el volumen de tokens de entrenamiento, la composicion del dataset, si hubo RLHF adicional y cualquier hiperparametro del proceso.

Tampoco hay informacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, atencion con ventana deslizante, etc.) ni sobre la configuracion del tokenizador. La unica transformacion verificable es la cuantizacion a GGUF, un formato orientado a inferencia eficiente en CPU y GPU mixta mediante llama.cpp y sus derivados. La cuantizacion introduce una perdida de calidad respecto a los pesos en precision completa, cuya magnitud depende del nivel elegido y no puede estimarse sin acceso a los pesos originales y a una evaluacion comparativa.

## Capacidades

- Generacion de texto y respuesta conversacional multi-turno: es la unica capacidad directamente sugerida por la etiqueta `conversational` del repositorio.
- Ajuste por preferencias (DPO): el nombre indica que el modelo fue alineado con este metodo, orientado a respuestas mas utiles y menos daninas, aunque no se han publicado evaluaciones que lo confirmen.
- Inferencia local eficiente: al estar en GGUF, puede ejecutarse en CPU, GPU o configuracion hibrida con llama.cpp, Ollama o servidores compatibles.
- Integracion con endpoints: la etiqueta `endpoints_compatible` sugiere compatibilidad con la infraestructura de Inference Endpoints de HuggingFace.
- Capacidad multilingue: no disponible. El sufijo "Vi" sugiere foco en vietnamita, pero no hay confirmacion ni evaluacion de cobertura en otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Razonamiento explicito (modo thinking), vision, audio: no disponible.
- Capacidades de codigo y matematicas: no disponibles, no se documentan.

## Casos de uso

- Asistencia conversacional en vietnamita para atencion al cliente: si el modelo se comporta segun sugiere su nombre, podria gestionar dialogos multi-turno en ese idioma en entornos con recursos limitados, aunque la ausencia de evaluacion obliga a validar previamente la calidad de las respuestas.
- Prototipado local en equipos sin GPU dedicada: con cuantizacion de 4 bits, el modelo ocupa del orden de 1,2 GB, por lo que cabe en cualquier portatil reciente y permite iterar sobre prompts sin coste de API.
- Experimentacion academica con DPO: al declararse un ajuste por preferencias, puede servir como punto de partida para estudiar el efecto del DPO en modelos pequenos, siempre que se verifique antes el origen de los pesos.
- Generacion de texto en aplicaciones de borde (edge): su tamano permite desplegarlo en dispositivos con 2-4 GB de RAM libre para tareas de redaccion asistida o resumen de textos cortos.
- Traduccion asistida castellano-ingles a vietnamita: uso plausible si el modelo conserva capacidades multilingues de la base Qwen, pero no confirmado y potencialmente degradado por el ajuste especifico en vietnamita.
- Clasificacion y etiquetado de texto en vietnamita: con prompts de formato fijo puede emplearse para categorizar tickets, resenas o comentarios, dado su bajo coste de inferencia.
- Chatbot embebido en herramientas de escritorio: mediante llama.cpp u Ollama, puede integrarse como asistente local en editores o IDE, aunque sin soporte documentado de tool calling las integraciones con acciones externas quedan descartadas.
- Filtrado y moderacion de contenido: uso posible como primera capa de preclasificacion, condicionado a una evaluacion propia de sesgos y falsos negativos.

En todos los casos, la recomendacion tecnica es tratar este repositorio como un artefacto no verificado y ejecutar una bateria de evaluacion propia antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones orientativas calculadas a partir del recuento de parametros (1,88 B) y de las formulas habituales de cuantizacion; no han sido medidas sobre este modelo concreto.

| Cuantizacion | Peso aproximado | VRAM/RAM minima estimada |
|---|---|---|
| FP16 | ≈3,8 GB | ≈5 GB |
| Q8_0 | ≈2,0 GB | ≈2,8 GB |
| Q6_K | ≈1,6 GB | ≈2,4 GB |
| Q5_K_M | ≈1,4 GB | ≈2,2 GB |
| Q4_K_M | ≈1,2 GB | ≈1,9 GB |
| Q4_0 | ≈1,1 GB | ≈1,8 GB |
| Q2_K | ≈0,8 GB | ≈1,5 GB |

- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 3060) ejecuta la version de 4 bits sin problemas. En GPU integrada o con poca memoria, la carga se reparte entre VRAM y RAM.
- Inferencia exclusiva en CPU: viable con llama.cpp. Un procesador moderno de 8 nucleos puede sostener velocidades de generacion del orden de 10 a 25 tokens por segundo con cuantizacion Q4_K_M (estimacion orientativa).
- GPU recomendadas: para lotes grandes o contextos largos, A100 o H100 estan sobredimensionadas para 1,88 B de parametros; una RTX 4090 o incluso una RTX 3060 son suficientes y permiten procesar varias peticiones en paralelo.
- A tener en cuenta: el consumo de KV cache depende de la longitud de contexto, el numero de capas y el uso de atencion con consultas agrupadas (GQA), datos que no estan disponibles. Con contextos de 8.000 tokens el KV cache tipico en un modelo de este tamano se situa en el rango de 200 a 500 MB.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio, servidores GGUF compatibles con la API de OpenAI (por ejemplo, llama.cpp server o text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan los pesos en safetensors, no incluidos en el repositorio.
- Rendimiento estimado: en una RTX 4090 con Q4_K_M, un modelo de 1,88 B suele generar entre 150 y 250 tokens por segundo, con una latencia de primer token por debajo de 100 ms para prompts cortos. Son estimaciones por orden de magnitud, no mediciones de este repositorio.

## Comparativa con modelos similares

La comparativa es estructural: los datos de este repositorio no estan disponibles, mientras que los de las alternativas provienen de su documentacion publica.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phuc-HugigFace/Qwen3.5-2B-Vi-DPO-GGUF | 1,88 B | no disponible | no disponible | GGUF | 24 descargas, 0 likes, sin model card |
| Qwen3-1.7B | 1,7 B | 32.768 tokens (ampliable a 131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | ampliamente distribuido, con evaluacion publica |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (ampliable a 131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | muy extendido, con evaluacion publica |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | ampliamente distribuido, con evaluacion publica |

Las tres alternativas ofrecen licencia explicita, contexto documentado y resultados de evaluacion publicos, ademas de soporte en practicamente todas las herramientas de inferencia. Frente a ellas, el modelo analizado no permite verificar ni el contexto, ni el idioma, ni los terminos de uso, lo que lo situa en una categoria de riesgo claramente superior para cualquier proyecto real.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card, paper, configuracion de entrenamiento ni descripcion del dataset, lo que impide auditar el modelo.
- Licencia no disponible: sin licencia declarada no existe autorizacion explicita de uso, lo que supone un riesgo legal directo para cualquier despliegue comercial. En ausencia de licencia, la posicion por defecto es la reserva de derechos.
- "Qwen3.5" no corresponde a ninguna generacion oficial conocida de la familia Qwen: el nombre base no es verificable, y el modelo podria ser un renombrado, una mezcla o un ajuste no declarado de otra base.
- Actividad y reputacion minimas: 24 descargas, 0 likes y un unico autor sin historial comprobable. No existe validacion por parte de la comunidad.
- Fechas sospechosas: el repositorio se creo y se actualizo en el mismo dia (17 de septiembre de 2026), con un intervalo de 58 segundos entre ambos eventos, lo que sugiere una subida automatizada o un artefacto de prueba.
- Riesgo elevado de alucinacion: en modelos de menos de 2.000 millones de parametros, la tasa de error en razonamiento, matematicas y hechos verificables es alta, y sin evaluacion publicada no puede acotarse.
- Sesgos no evaluados: la alineacion por DPO sobre datos no documentados puede introducir sesgos de preferencia, de estilo y culturales, sin ninguna metrica que los cuantifique.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto real y la cobertura idiomatica. El foco aparente en vietnamita puede degradar notablemente el rendimiento en castellano.
- Perdida por cuantizacion: los pesos GGUF han sufrido un proceso de cuantizacion cuya perdida de calidad respecto a la version original no se ha medido.
- Ausencia de soporte para tool calling y agentes: no hay evidencia de plantillas de herramientas ni de modo de razonamiento extendido, lo que limita su integracion en flujos automatizados.
- Imposibilidad de reproducir el entrenamiento: sin datos, receta ni version de la base, no es posible reproducir ni verificar el comportamiento del modelo.
- Advertencia para produccion: no se recomienda su uso en sistemas en produccion sin una evaluacion propia exhaustiva y sin una clarificacion previa de la licencia por parte del autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Phuc-HugigFace/Qwen3.5-2B-Vi-DPO-GGUF
- Pagina del autor: https://huggingface.co/Phuc-HugigFace
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante. Las busquedas devolvieron resultados sin relacion con el modelo (una ficha de restaurante en Tripadvisor, articulos sobre el significado del nombre vietnamita "Phuc", una guia turistica de Phu Quoc y la biografia de Phan Thi Kim Phuc). No hay papers, blogs, repositorios ni demos asociados al modelo.
