# orcarouter/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF

## Resumen

OrcaSAQ-2-Cyber-27B-Uncensored-GGUF es una cuantizacion en formato GGUF del modelo orcarouter/Qwen3.8-27B-Uncensored, publicada por el propio autor (orcarouter) bajo licencia Apache 2.0. El modelo cuenta con 27.320.697.856 parametros (27,3 B) y esta orientado a generacion de texto, conversacion multi-turno, razonamiento (thinking) y function calling. La distribucion se realiza en precision mixta mediante el esquema que el autor denomina SAQ-2 (OrcaSAQ 2), calibrado con imatrix, y el repositorio ocupa 15,7 GB.

La propuesta de valor hereda dos rasgos del modelo base: la ablacion a nivel de tensor (abliteration), que elimina las capas de rechazo sin tocar la torre de vision ni la cabeza MTP (multi-token prediction), y una ventana de contexto de 262K tokens. Los idiomas declarados en la ficha son ingles y chino. El acceso al repositorio esta restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de poder descargar los pesos.

Es relevante ahora porque combina tres factores poco habituales en un mismo artefacto: contexto largo real, capacidades multimodales y de tool calling preservadas tras la ablacion, y una cuantizacion de precision mixta pensada para ejecucion local en llama.cpp. El contrapeso es que el modelo no incorpora mecanismos de rechazo, lo que traslada al integrador toda la responsabilidad sobre el filtrado y el cumplimiento normativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; no se detalla la variante exacta. La ficha del modelo base menciona torre de vision y cabeza MTP |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens (262K), segun la ficha del modelo base |
| Tipos de cuantizacion | GGUF en precision mixta (esquema SAQ-2 con calibracion imatrix); los niveles concretos publicados no se detallan en la informacion disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (libreria llama.cpp) |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored |
| Tamano del repositorio | 15,7 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones en HuggingFace |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una cuantizacion del modelo orcarouter/Qwen3.8-27B-Uncensored, que a su vez es una version abliterada a nivel de tensor de un modelo de la familia Qwen (las etiquetas del repositorio citan qwen3.8 y qwen3_5). La informacion disponible no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Las innovaciones tecnicas documentadas se sitúan en dos frentes. El primero es la ablacion: segun la ficha del modelo base, se eliminan las direcciones de rechazo capa por capa sin degradar la torre de vision ni la cabeza MTP, y se reporta un 0 % de sobrerrechazo en XSTest y entre un 0 % y un 6 % de rechazo en la bateria A/B, sin perdida de capacidad medible. El segundo es la cuantizacion: el esquema SAQ-2 aplica precision mixta calibrada con imatrix, una tecnica que pondera la importancia de cada tensor usando estadisticas de activacion para asignar mas bits a las capas sensibles. El modelo conserva ademas la decodificacion con cabeza MTP, que permite predecir varios tokens por paso.

## Capacidades

- Generacion de texto y conversacion multi-turno con ventana de hasta 262K tokens.
- Razonamiento explicito en modo thinking, heredado del modelo base.
- Function calling y tool calling, lo que habilita integracion con herramientas externas.
- Capacidades de vision, ya que la torre multimodal (mmproj) se mantiene intacta tras la ablacion.
- Prediccion multi-token mediante la cabeza MTP, orientada a acelerar la decodificacion.
- Multilingue limitado a ingles y chino segun la ficha del repositorio.
- Ausencia practica de rechazos: 0 % de sobrerrechazo en XSTest y 0-6 % de rechazo en la bateria A/B reportada por el autor del modelo base.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con el ecosistema llama.cpp.

## Casos de uso

- Asistentes de codigo en local: el modelo puede integrarse en un IDE o en un pipeline de CI/CD mediante llama.cpp y function calling, generando parches y ejecutando herramientas de build sin enviar codigo a un tercero.
- Analisis de repositorios completos: con 262K tokens de contexto es viable cargar varios ficheros fuente y su documentacion en una sola ventana para tareas de refactorizacion o deteccion de vulnerabilidades.
- Procesamiento de documentacion tecnica extensa: manuales, normativas o contratos largos que caben en una unica pasada, con preguntas y respuestas sobre el contenido.
- Agentes multi-paso: la combinacion de tool calling, thinking y contexto largo permite construir bucles de razonamiento con llamadas a APIs externas y trazas largas.
- Investigacion en seguridad ofensiva y analisis de malware: al no aplicar rechazos, el modelo responde a peticiones de analisis de codigo malicioso, explicacion de exploits o generacion de reglas de deteccion que otros modelos filtran. Requiere un entorno aislado y supervision humana.
- Red teaming y evaluacion de alineamiento: util como modelo de referencia "sin censura" para medir la eficacia de clasificadores de contenido o comparar distribuciones de respuesta frente a modelos alineados.
- Extraccion y estructuracion de informacion: conversion de texto no estructurado a JSON mediante salidas guiadas con function calling.
- Despliegue en hardware de una sola GPU: al ser una cuantizacion GGUF, permite servir el modelo en una estacion de trabajo con GPU de 24 GB para prototipado y uso interno.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles corresponden al modelo base (orcarouter/Qwen3.8-27B-Uncensored), no a esta cuantizacion concreta:

| Metrica | Resultado | Fuente |
|---|---|---|
| XSTest (sobrerrechazo) | 0 % | Ficha del modelo base |
| Bateria A/B (tasa de rechazo) | 0-6 % | Ficha del modelo base |
| Perdida de capacidad tras ablacion | no medible segun el autor | Ficha del modelo base |
| MMLU, HumanEval, GSM8K u otros | no disponible | - |

No se han publicado resultados de benchmarks especificos para la cuantizacion SAQ-2 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 27,3 B de parametros: en torno a 16-17 GB en Q4, 19-20 GB en Q5, 22-23 GB en Q6 y 29 GB en Q8. En FP16 serian aproximadamente 55 GB.
- El repositorio completo ocupa 15,7 GB, lo que sugiere que los ficheros publicados se mueven en el rango de 4 bits.
- Cache KV: con 262K tokens de contexto el consumo de cache crece de forma lineal con la longitud de la secuencia; no se dispone de la configuracion exacta de cabezas ni del tamano por token, por lo que la cifra concreta es no disponible. Para contextos muy largos conviene cuantizar la cache KV.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para cuantizaciones de 4-5 bits; A100 40 GB, L40S o H100 para Q8 y contextos largos; dos GPU de 24 GB para servir Q8 sin offload.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, solo cuantizaciones muy agresivas) y similares con 24 GB o mas.
- Opciones de despliegue: llama.cpp es la via principal (formato GGUF nativo); tambien Ollama, LM Studio, llama-cpp-python y text-generation-webui. El soporte de GGUF en vLLM es parcial y no esta confirmado para este esquema de precision mixta.
- Latencia y throughput estimados: no disponible. Dependera del grado de cuantizacion, del uso de la cabeza MTP y del offload a CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OrcaSAQ-2-Cyber-27B-Uncensored-GGUF (este) | 27,3 B | 262K | GGUF (SAQ-2, imatrix) | apache-2.0 | Cuantizacion de precision mixta, acceso gated |
| orcarouter/Qwen3.8-27B-Uncensored | no disponible | 262K | no disponible | no disponible | Modelo base abliterado; vision, tool calling y thinking |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | no disponible | 262K | GGUF | no disponible | Cuantizacion GGUF del mismo modelo base, sin esquema SAQ-2 |
| chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF | no disponible | no disponible | GGUF | no disponible | Cuantizacion GGUF de terceros sobre el mismo modelo base |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: carece de capas de rechazo efectivas. Puede generar instrucciones ilegales, daninas o poco eticas. El articulo de India Today senala explicitamente este comportamiento en la familia de modelos sin censura.
- La responsabilidad legal y etica del uso recae por completo en el integrador. En la Union Europea, un despliegue orientado al publico puede quedar sujeto al AI Act y requerir evaluaciones de riesgo y filtros propios.
- La licencia Apache 2.0 permite uso comercial, pero no exime de cumplir la normativa aplicable ni de las obligaciones de transparencia sobre contenido generado.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad para esta cuantizacion, y la ablacion puede alterar el comportamiento del modelo en tareas que dependen del rechazo como senal de calibracion.
- Idiomas limitados a ingles y chino. El rendimiento en castellano no esta documentado ni garantizado.
- La cuantizacion en precision mixta puede introducir degradaciones respecto a los pesos originales en safetensors, especialmente en tareas de razonamiento largo o generacion de codigo.
- La ventana de 262K tokens es nominal; la calidad efectiva en los extremos de contexto no esta documentada y depende de la memoria disponible.
- Acceso restringido (gated): la descarga y el uso requieren aceptar condiciones en HuggingFace, lo que puede complicar la automatizacion de pipelines.
- El sufijo "Cyber" del nombre no se explica en la informacion disponible y no hay documentacion que detalle una especializacion concreta en ciberseguridad.
- El repositorio registra 0 descargas en la fecha de consulta, por lo que no existe validacion comunitaria independiente del esquema SAQ-2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orcarouter/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF
- Arbol de ficheros: https://huggingface.co/orcarouter/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF/tree/main
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Cuantizacion GGUF del modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Ficha en Ollama del modelo base: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Cuantizacion GGUF de terceros: https://huggingface.co/chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF
- OrcaRouter (plataforma del autor): https://www.orcarouter.ai/
- Cobertura periodistica sobre los modelos Qwen sin censura: https://www.indiatoday.in/technology/news/story/china-qwen-ai-gets-uncensored-version-it-will-take-illegal-and-unethical-requests-from-users-2974856-2026-08-19
