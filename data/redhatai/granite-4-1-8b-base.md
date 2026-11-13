# RedHatAI/granite-4.1-8b-base

## Resumen

Granite-4.1-8B-Base es un modelo de lenguaje decoder-only desarrollado por el equipo Granite de IBM, publicado bajo licencia Apache 2.0. Se trata de un modelo base (sin ajuste por instrucciones ni alineamiento por preferencias) entrenado desde cero sobre aproximadamente 15 billones de tokens, concebido como punto de partida para tareas de generacion texto-a-texto y para ajuste fino posterior en dominios especializados.

La arquitectura es un transformer denso de 8.380.551.168 parametros (8,38 mil millones), con soporte de contexto largo que se extiende hasta 512.000 tokens tras una fase final de extension de ventana. Incorpora tokens especiales de prefijo y sufijo para completado de codigo Fill-in-the-Middle (FIM), lo que lo hace util tanto para generacion libre como para autocompletado en entornos de desarrollo.

Su relevancia actual radica en tres factores: una licencia permisiva sin restricciones de uso comercial, un contexto excepcionalmente amplio para su tamano y un proceso de entrenamiento documentado en cinco fases con un volumen de datos poco habitual en modelos de esta escala. Al ser un modelo base, no incluye plantilla de chat ni capacidades de tool calling nativas; su valor reside en servir como sustrato para especializacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 8.380.551.168 (8,38 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 512.000 tokens (tras extension en fase final) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | Ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only densa, sin mezcla de expertos ni componentes de estado recurrente. El entrenamiento se realizo desde cero sobre aproximadamente 15 billones de tokens, organizado en cinco fases: 10 billones en la primera, 2 billones en la segunda, 2 billones en la tercera y 0,5 billones en la cuarta. La quinta y ultima fase aplica extension de contexto para llevar la ventana hasta los 512.000 tokens.

Una innovacion destacable para un modelo base es la inclusion de tokens especiales de prefijo y sufijo que habilitan completado de codigo Fill-in-the-Middle (FIM), una capacidad poco frecuente en modelos base genericos y directamente orientada a integracion en editores y asistentes de codigo. La model card no detalla la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un modelo base, es esperable que no incluya alineamiento por preferencias, aunque este extremo no se confirma en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en tareas generales de lenguaje.
- Completado de codigo Fill-in-the-Middle (FIM) mediante tokens especializados de prefijo y sufijo.
- Razonamiento y respuesta a preguntas con contexto largo, gracias a la ventana de 512.000 tokens.
- Resumen, clasificacion de texto y extraccion de informacion.
- Soporte multilingue en 12 idiomas: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Capacidad de servir como base para ajuste fino supervisado en dominios especializados.
- No incluye tool calling ni function calling nativo (es un modelo base sin alineamiento de instrucciones).
- No incluye modo de razonamiento extendido (thinking mode), vision ni audio.
- No dispone de plantilla de chat ni capacidades de agente multi-paso de serie.

## Casos de uso

- Ajuste fino para atencion al cliente: al ser un modelo base con contexto de 512.000 tokens, se puede ajustar con SFT sobre transcripciones de soporte para gestionar conversaciones multi-turno con historiales muy largos sin truncamiento.
- Completado de codigo en IDE: los tokens FIM permiten integrar el modelo en editores para autocompletar fragmentos de codigo entre un prefijo y un sufijo dados, un caso de uso nativo para el que fue explicitamente entrenado.
- Analisis de documentos extensos: informes anuales, expedientes legales o articulos cientificos de cientos de miles de tokens pueden procesarse en una sola pasada para resumen y extraccion estructurada.
- Generacion aumentada por recuperacion (RAG) a gran escala: la ventana de 512K permite inyectar muchos documentos recuperados sin recortes agresivos, reduciendo la perdida de contexto en pipelines de busqueda semantica.
- Clasificacion y enrutamiento de texto en produccion: ajuste fino ligero sobre el modelo base para categorizar tickets, correos o incidencias en multiples idiomas europeos y asiaticos.
- Creacion de modelos especializados de dominio: el modelo sirve como sustrato para SFT en sectores regulados (sanidad, banca, administracion publica) donde la licencia Apache 2.0 elimina fricciones de uso comercial.
- Extraccion de entidades y relaciones en corpus multilingues, aprovechando los 12 idiomas soportados para pipelines de procesamiento documental internacional.

## Benchmarks y rendimiento

Resultados publicados en la model card para la familia Granite 4.1 (variantes densas de 3B, 8B y 30B):

| Benchmark | Metrica | 3B denso | 8B denso | 30B denso |
|---|---|---|---|---|
| MMLU | 5-shot | 66,47 | 73,60 | 78,44 |
| MMLU-Pro | 5-shot, CoT | 37,16 | 44,58 | 49,51 |
| BBH | 3-shot, CoT | 63,84 | 73,83 | 80,66 |
| AGI Eval | 3-shot | 54,32 | 61,68 | 69,20 |
| DROP | 5-shot | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

Nota: los resultados de DROP aparecen truncados en la informacion proporcionada; no se reproducen cifras no verificables.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 16,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren 20-24 GB.
- Cuantizacion a 8 bits: alrededor de 8,5 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: alrededor de 4,5 GB de pesos, viable en GPUs consumer de 8 GB como RTX 3060 Ti, RTX 4060 o superiores.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, justo al limite).
- GPU consumer: cabe en RTX 4090 en fp16 con margen limitado; en RTX 3090/4080/4070 Ti Super es recomendable cuantizar. En GPUs de 8-12 GB es obligatorio cuantizar.
- Contexto de 512K: la cache KV a esa longitud exige tecnicas de atencion eficiente (FlashAttention, PagedAttention) y puede requerir multiples GPUs o cuantizacion de la cache; no se dispone de cifras exactas de memoria para el contexto maximo.
- Opciones de despliegue: transformers (soporte nativo segun la model card), vLLM, TGI, llama.cpp y Ollama (estos ultimos requeririan conversion a GGUF, no confirmada en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Granite-4.1-8B-Base | 8,38 B | 512K | Apache 2.0 | Modelo base con FIM, entrenado sobre 15 B tokens |
| Granite-4.1-3B (denso) | ~3 B | no disponible | Apache 2.0 | Mismo family, MMLU 66,47 |
| Granite-4.1-30B (denso) | ~30 B | no disponible | Apache 2.0 | MMLU 78,44, requiere hardware superior |
| Alternativas de 7-9 B de otros fabricantes | 7-9 B | variable (tipicamente 8K-128K) | variable | No se dispone de datos comparativos verificables en la informacion proporcionada |

La comparacion con modelos de otros fabricantes (por ejemplo, familias Llama, Mistral o Qwen de tamano similar) no puede establecerse con rigor porque la informacion proporcionada no incluye sus resultados en los mismos benchmarks ni con la misma configuracion de evaluacion. Los unicos puntos de comparacion fiables son las otras variantes de la propia familia Granite 4.1.

## Limitaciones y advertencias

- Es un modelo base sin alineamiento por instrucciones: no responde de forma fiable a instrucciones conversacionales sin un ajuste fino previo (SFT) o el uso de una variante instruct.
- Riesgo de alucinacion inherente a los modelos de lenguaje; al no estar alineado, la generacion de contenido factual incorrecto puede ser mas frecuente que en modelos ajustados con RLHF.
- Sesgos potenciales derivados de los datos de entrenamiento (15 billones de tokens de origen no detallado en la informacion disponible); no se documentan evaluaciones de sesgo ni de seguridad.
- Aunque soporta 12 idiomas, el rendimiento relativo por idioma no se cuantifica en la model card; el ingles es presumiblemente el idioma dominante.
- La ventana de 512K tokens es costosa en memoria y computo; su uso efectivo en produccion requiere infraestructura de atencion eficiente y puede degradar la calidad en el extremo superior de la ventana.
- No incluye tool calling, function calling, modo de razonamiento ni capacidades multimodales; cualquier uso agentico requiere envoltorio externo y ajuste.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento normativo en sectores regulados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada (2026-11-13) es posterior a la fecha de publicacion declarada en la model card (29 de abril de 2026); conviene verificar la procedencia y el estado del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/granite-4.1-8b-base
- Coleccion Granite 4.1 Language Models: https://huggingface.co/collections/ibm-granite/granite-41-language-models
- Blog tecnico Granite-4.1: https://huggingface.co/blog/ibm-granite/granite-4-1
- Repositorio GitHub: https://github.com/ibm-granite/granite-4.1-language-models
- Documentacion Granite: https://www.ibm.com/granite/docs/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Referencia arXiv citada en los tags: arxiv:2603.17074 (no verificable en la informacion proporcionada)
