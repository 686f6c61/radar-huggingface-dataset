# Kuntal090/qwen1.5-1.8b-pharma-stage2

## Resumen

Kuntal090/qwen1.5-1.8b-pharma-stage2 es un checkpoint de generacion de texto publicado en HuggingFace por el usuario Kuntal090. El nombre del repositorio indica que se trata de un ajuste fino (fine-tune) de segunda etapa sobre el modelo base Qwen1.5-1.8B, orientado al dominio farmaceutico ("pharma"). La etiqueta de arquitectura declarada en el Hub es `qwen2`, lo que es coherente con el hecho de que la familia Qwen1.5 se implementa en transformers bajo la clase Qwen2.

El modelo tiene 1.836.828.672 parametros reales, verificados a partir de los pesos en safetensors, y el repositorio ocupa 3,7 GB. Es, por tanto, un modelo denso de~1,8B parametros que cabe en GPUs de consumo y que esta pensado para generacion de texto en un nicho vertical concreto. No es un modelo MoE ni incorpora parametros activos condicionales.

La relevancia de esta ficha es limitada y hay que ser explicitos: el autor no ha publicado informacion tecnica alguna. La model card es la plantilla automatica de HuggingFace, sin datos de entrenamiento, hiperparametros, datasets, licencia ni idiomas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las busquedas web realizadas no devolvieron ninguna fuente independiente sobre este checkpoint. Todo lo que se detalla a continuacion proviene del nombre del modelo, de las etiquetas del Hub, del recuento de parametros y de lo que se puede inferir del modelo base de la familia Qwen1.5; cualquier dato no verificable se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, clase Qwen2 en transformers (etiqueta `qwen2` del Hub) |
| Parametros totales | 1.836.828.672 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen1.5-1.8B declara 32.768 tokens; no confirmado para este fine-tune) |
| Tipos de cuantizacion | No se publican pesos cuantizados. El repositorio contiene unicamente safetensors (presumiblemente fp16/bf16). Se puede cuantizar externamente a GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible (el autor no lo declara; el modelo base Qwen1.5 es multilingue, pero no hay confirmacion para este checkpoint) |
| Licencia | No disponible (la model card no especifica licencia; hay que verificar la del modelo base antes de cualquier uso comercial) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 3,7 GB |
| Pipeline declarado | text-generation |
| Etiquetas | transformers, safetensors, qwen2, text-generation, arxiv:1910.09700, text-generation-inference, endpoints_compatible, region:us |
| Fecha de publicacion | 14 de septiembre de 2026 (segun metadatos del Hub) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only autorregresivo de ~1,8B parametros, correspondiente al diseno de la familia Qwen1.5 (implementada como Qwen2 en transformers). Esto implica atencion causal con Grouped Query Attention en el modelo base, normalizacion RMSNorm y activaciones SwiGLU, ademas de embeddings de tokens y pesos no atados en las versiones pequenas de la familia. No hay ninguna indicacion de que este checkpoint introduzca cambios estructurales, capas adicionales ni modulos de vision o audio: es un fine-tune sobre una base densa estandar.

Los detalles de entrenamiento no estan disponibles. La model card no documenta el dataset, el numero de tokens vistos, la composicion del corpus farmaceutico, si hubo una primera etapa ("stage1") seguida de esta segunda, ni si se aplicaron tecnicas de alineacion como SFT, DPO o RLHF. El sufijo "stage2" sugiere una continuacion de un ajuste previo, pero es una inferencia a partir del nombre y no una afirmacion del autor. Tampoco se declaran hiperparametros, regimen de precision (fp16, bf16, fp8) ni infraestructura de computo. La unica referencia externa presente en la model card es el paper de Lacoste et al. (2019) sobre el calculo de impacto ambiental, que aparece citado en la plantilla por defecto y no aporta informacion sobre el entrenamiento de este modelo.

## Capacidades

- Generacion de texto autoregresiva en el dominio para el que fue ajustado, presumiblemente farmaceutico y biomedico, aunque el autor no lo documenta.
- Razonamiento y respuesta a preguntas de dominio general y especializado: capacidad heredada del modelo base Qwen1.5-1.8B, no verificada en este checkpoint.
- Generacion de codigo basica: el modelo base de 1,8B tiene competencia limitada en programacion; no hay evaluacion publicada para este fine-tune.
- Soporte de tool calling / function calling: no disponible. No se declara plantilla de chat ni formato de herramientas en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible. Sin model card ni evaluacion, no se puede confirmar.
- Capacidades multilingues: no disponibles. El modelo base Qwen1.5 cubre un rango amplio de idiomas, pero el ajuste a un dominio concreto puede haber degradado el rendimiento fuera del idioma y el dominio de entrenamiento.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. No hay indicios de que el checkpoint incorpore ninguna.
- Formato de prompt: no disponible. Se desconoce si conserva la plantilla ChatML del modelo base o si se entreno con un formato propio, lo que es critico para reproducir su comportamiento.

## Casos de uso

Los siguientes casos son escenarios plausibles derivados del nombre del checkpoint y de su tamano, no aplicaciones documentadas por el autor:

- Extraccion de entidades farmaceuticas: el modelo puede emplearse para identificar principios activos, dosis, vias de administracion y contraindicaciones en textos de prospectos o fichas tecnicas, siempre que se valide el resultado con un sistema de reglas o una base de datos oficial.
- Resumen de literatura cientifica: dado su tamano, es adecuado para resumir abstracts y secciones de articulos biomedicos en un pipeline con contexto moderado, ejecutandose en una sola GPU de consumo.
- Triaje de consultas sobre medicamentos en un chatbot interno: puede clasificar y responder preguntas frecuentes sobre interacciones o posologia, con derivacion a un profesional cuando la confianza sea baja.
- Prototipado rapido de asistentes de dominio: por su tamano reducido, sirve para iterar sobre prompts y plantillas en local antes de escalar a un modelo mayor, con un coste de inferencia minimo.
- Generacion de borradores de documentacion regulatoria: puede producir primeros borradores de secciones estandarizadas (resumen de caracteristicas del producto, informacion de seguridad) que un experto revisa y corrige despues.
- Anonimizacion y preprocesado de historiales clinicos: tareas de etiquetado, normalizacion de terminologia y reescritura de notas, ejecutables on-premise para no enviar datos sensibles a la nube.
- Clasificacion y enrutado de tickets en soporte farmaceutico: categorizar consultas de farmacias o distribuidores por tipo de incidencia antes de pasarlas al equipo correspondiente.
- Fine-tuning posterior especifico: al ser un checkpoint ya adaptado al dominio, sirve como punto de partida para ajustes mas pequenos con datos propios en una organizacion con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye ninguna tabla de evaluacion en la model card, no hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones clinicas o farmaceuticas, y las busquedas web realizadas no han localizado ninguna evaluacion independiente de este checkpoint. Tampoco hay datos de comparacion con el modelo base o con otros fine-tunes del mismo dominio.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 1.836.828.672 parametros, no medida por el autor):
  - fp16 / bf16: en torno a 3,5-4 GB solo para pesos, mas 0,5-1,5 GB de cache KV segun contexto y batch.
  - int8: en torno a 1,9-2,2 GB.
  - int4: en torno a 1,1-1,3 GB, mas overhead de la cache KV.
- GPUs recomendadas: cualquier GPU con 6 GB o mas de VRAM para fp16 con contexto corto (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Para despliegue con contexto largo y batching alto, RTX 4090, L4, A10G, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 8 GB o mas en fp16, y en GPUs de 4-6 GB si se cuantiza a int4 o se usa llama.cpp.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (la etiqueta `text-generation-inference` esta presente en el Hub), vLLM, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`) y llama.cpp u Ollama tras convertir los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor. Como referencia de orden de magnitud, un modelo denso de 1,8B en una GPU de consumo moderna suele generar decenas de tokens por segundo en fp16, pero es una estimacion general y no un dato medido para este checkpoint.

## Comparativa con modelos similares

La comparacion se limita a parametros, contexto declarado, licencia y disponibilidad, porque no existe ningun dato de rendimiento publicado para este checkpoint. Los valores del modelo bajo analisis son los unicos verificados (recuento de safetensors).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kuntal090/qwen1.5-1.8b-pharma-stage2 | 1.836.828.672 (verificado) | No disponible | No disponible | Repositorio en HuggingFace, 0 descargas |
| Qwen1.5-1.8B (base) | ~1,8B | 32.768 tokens segun el autor del modelo base (no verificado aqui) | No verificada en esta busqueda; consultar el repositorio oficial | Publico en HuggingFace, ampliamente descargado |
| Qwen2.5-1.5B / 1.5B-Instruct | ~1,5B | 32.768 tokens segun el autor (no verificado aqui) | No verificada en esta busqueda | Publico en HuggingFace |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens (no verificado aqui) | No verificada en esta busqueda | Publico en HuggingFace |
| Gemma 2 2B | ~2,6B | 8.192 tokens (no verificado aqui) | No verificada en esta busqueda | Publico en HuggingFace |

No hay datos de benchmarks que permitan comparar la calidad de este fine-tune frente a las alternativas. La unica ventaja diferencial observable es la especializacion declarada en el dominio farmaceutico, que tampoco esta documentada ni evaluada.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica de HuggingFace y no aporta informacion sobre datos, metodo ni evaluacion. No se puede reproducir el entrenamiento ni auditar el modelo.
- Licencia no especificada: sin licencia declarada no hay autorizacion explicita de uso comercial. Ademas, la licencia del modelo base Qwen1.5-1.8B debe verificarse de forma independiente antes de cualquier despliegue en produccion.
- Riesgo elevado de alucinacion en dominio clinico: un modelo de 1,8B ajustado sin evaluacion publicada puede generar dosis, interacciones o indicaciones incorrectas con una fluidez que dificulta detectar el error. No debe usarse como fuente de decision clinica bajo ninguna circunstancia.
- Sesgos desconocidos: no se ha realizado ninguna evaluacion de sesgo, toxicidad ni equidad. El corpus de ajuste es opaco, por lo que pueden haberse introducido sesgos propios de las fuentes farmaceuticas utilizadas.
- Riesgo de sobreajuste al dominio: el ajuste "pharma" puede haber degradado las capacidades generales (codigo, matematicas, conversacion abierta) respecto al modelo base.
- Idioma e idiomas no declarados: se desconoce si el ajuste se hizo en ingles, castellano u otro idioma, y si conserva capacidad multilingue.
- Formato de prompt desconocido: sin plantilla de chat documentada, es probable que el modelo responda de forma degradada si se le aplica la plantilla ChatML estandar sin verificar.
- Trazabilidad nula: 0 descargas y 0 likes, sin paper, sin repositorio de codigo y sin resultados de benchmarks en las busquedas realizadas. Es un artefacto no validado por la comunidad.
- Fecha de publicacion inusual: los metadatos indican septiembre de 2026, posterior a la version de la familia Qwen1.5, lo que no invalida el modelo pero refuerza que se trata de un experimento personal sin mantenimiento conocido.
- Uso en produccion: desaconsejado sin una evaluacion propia exhaustiva en el caso de uso concreto, sin fijar la licencia y sin verificar el formato de prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kuntal090/qwen1.5-1.8b-pharma-stage2
- Paper citado en las etiquetas del Hub (Lacoste et al., 2019, estimacion de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML referenciada en la model card: https://mlco2.github.io/impact
- Repositorio oficial de la familia Qwen1.5 (modelo base, enlace no incluido en la model card): no disponible en la informacion proporcionada
- Paper, blog o demo del modelo: no disponibles
- Repositorio de codigo o dataset de entrenamiento: no disponibles

Nota sobre la busqueda web: los resultados obtenidos (temas de GitHub sobre APIs de ChatGPT, una extension de Jupyter y varios foros en chino y vietnamita sobre ChatGPT) no guardan ninguna relacion con este modelo y no se incluyen por no ser fuentes relevantes.
