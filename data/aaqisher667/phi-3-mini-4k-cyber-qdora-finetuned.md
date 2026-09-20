# Aaqisher667/phi-3-mini-4k-cyber-qdora-finetuned

## Resumen

El modelo `Aaqisher667/phi-3-mini-4k-cyber-qdora-finetuned` es un adaptador de ajuste fino (fine-tuning) publicado en HuggingFace por el usuario Aaqisher667, construido sobre el modelo base `unsloth/phi-3-mini-4k-instruct-bnb-4bit`, que a su vez es una version cuantizada a 4 bits del Phi-3-mini-4k-instruct de Microsoft. Se trata, por tanto, de un adaptador PEFT (no de un modelo completo con pesos propios): su uso requiere cargar el modelo base y aplicar los pesos del adaptador encima. El nombre del repositorio sugiere un ajuste orientado al dominio de ciberseguridad ("cyber") mediante la tecnica QDoRA (variante cuantizada de DoRA sobre LoRA).

La relevancia de esta ficha es limitada y conviene ser explicito al respecto: la model card del autor es la plantilla por defecto de HuggingFace, sin ninguna seccion completada. No se documentan datos de entrenamiento, hiperparametros, dataset, idiomas, licencia ni evaluacion. El repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, y la herramienta de busqueda web no ha devuelto ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a consultas no relacionadas). Por tanto, esta ficha recoge lo que es verificable en los metadatos y marca explicitamente como "no disponible" todo lo demas.

El interes tecnico, si lo hay, esta en el procedimiento: es un ejemplo del flujo Unsloth + TRL + PEFT para ajustar un modelo pequeno (familia Phi-3-mini) en una unica GPU de consumo, aplicando QDoRA sobre una base ya cuantizada a 4 bits. Como artefacto de produccion, en cambio, carece de la documentacion minima exigible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer decoder-only (modelo base Phi-3-mini-4k-instruct); arquitectura exacta del adaptador no documentada |
| Parametros totales | No disponible para el adaptador (el modelo base Phi-3-mini-4k-instruct tiene 3.8B parametros, dato publico de Microsoft, no confirmado en esta ficha); el tamano del adaptador en disco se puede consultar en los archivos safetensors del repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No documentada en la ficha; por el nombre del modelo base, 4.096 tokens (no confirmado para este ajuste) |
| Tipos de cuantizacion | No disponible. El modelo base referenciado esta en cuantizacion bitsandbytes de 4 bits (bnb-4bit). Al ser un adaptador LoRA/QDoRA, puede fusionarse con el base y recuantizarse a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la ficha no la declara; los pesos del adaptador quedan sin licencia explicita) |
| Formato de pesos | Safetensors (pesos de adaptador en formato PEFT); libreria declarada: peft |
| Tecnica de ajuste | QDoRA / LoRA (el tag declara "lora"; el nombre declara "qdora"), SFT |
| Framework declarado | PEFT 0.20.0, transformers, TRL, Unsloth |
| Pipeline | text-generation |
| Modelo base | unsloth/phi-3-mini-4k-instruct-bnb-4bit |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del ajuste mas alla de lo que se deduce de las etiquetas. El modelo es un adaptador PEFT cargado sobre `unsloth/phi-3-mini-4k-instruct-bnb-4bit`, es decir, un transformer decoder-only de la familia Phi-3-mini (aproximadamente 3.8B parametros en su version completa, con 32 capas, atencion multi-cabeza y contexto de 4.096 tokens segun la documentacion publica de Microsoft). El adaptador se entrena con SFT (supervised fine-tuning) usando el stack Unsloth + TRL + PEFT, y los tags indican el uso de `qlora`/QDoRA, una variante que aplica descomposicion direccional (DoRA) sobre pesos cuantizados a 4 bits.

No hay ningun dato sobre el dataset de entrenamiento: se desconoce el numero de tokens, la composicion del corpus (el sufijo "cyber" del nombre sugiere contenido de ciberseguridad, pero no se aporta ninguna evidencia), el numero de ejemplos, la longitud de secuencia, la tasa de aprendizaje, el rango del adaptador, los modulos objetivo ni si se aplico RLHF, DPO u otra etapa posterior al SFT. Tampoco se documentan innovaciones tecnicas propias: el unico elemento diferencial es el uso de Unsloth para acelerar el ajuste en memoria reducida.

Un detalle relevante para la trazabilidad: la fecha de creacion registrada en HuggingFace es 2026-09-19 y la de actualizacion 2026-09-19, posteriores a la fecha habitual de publicacion de la familia Phi-3. Esto, junto con la ausencia total de documentacion, sugiere un experimento personal o un artefacto de prueba mas que un modelo mantenido.

## Capacidades

No se ha publicado ninguna evaluacion de capacidades de este adaptador. Las siguientes afirmaciones se derivan exclusivamente de la arquitectura del modelo base y del pipeline declarado, y no estan verificadas para este ajuste concreto:

- Generacion de texto conversacional: el pipeline declarado es `text-generation` con etiqueta `conversational`, heredado del modelo base instruido.
- Instruccion y dialogo multi-turno: el base es un modelo "instruct" afinado para seguir instrucciones.
- Razonamiento basico y matematicas simples: propias de un modelo de 3.8B, sin garantias de calidad.
- Generacion de codigo: capacidad esperable del base Phi-3-mini; no verificada tras el ajuste.
- Tool calling / function calling: no documentado para este adaptador. El base Phi-3-mini soporta formatos de function calling en algunos templates, pero no hay confirmacion de que este ajuste los conserve.
- Soporte de agentes y razonamiento multi-paso: no documentado; un modelo de este tamano y con 4k de contexto tiene margen muy limitado para cadenas de razonamiento largas.
- Capacidades multilingues: no disponibles. El base Phi-3-mini esta centrado en ingles, pero la ficha no declara idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles. No hay indicios de vision ni audio.
- Dominio "cyber": el nombre del repositorio sugiere especializacion en ciberseguridad, pero no existe ninguna evaluacion, dataset ni ejemplo que lo respalde.

## Casos de uso

Advertencia previa: dado que no existe documentacion ni evaluacion, los siguientes casos son escenarios plausibles a validar experimentalmente, no usos garantizados. Cualquier despliegue en produccion deberia ir precedido de una evaluacion propia.

- Triaje de alertas en un SOC: el modelo podria resumir alertas de SIEM y proponer una clasificacion preliminar (falso positivo / escalar) a partir del texto de la alerta. Es viable por el tamano reducido (permite despliegue on-premise sin enviar datos sensibles a la nube), pero la calidad debe medirse contra el conjunto de alertas real de la organizacion antes de automatizar nada.
- Analisis y resumen de logs: con 4.096 tokens de contexto (segun el base), encaja en resumir fragmentos de logs acotados, extraer patrones repetidos y redactar una descripcion legible. El contexto es insuficiente para logs extensos, por lo que requeriria troceado previo.
- Extraccion de indicadores de compromiso (IOC): dado un parrafo de un informe de amenazas, extraer IPs, dominios, hashes y URLs en formato estructurado. Requiere validar el formato de salida y aplicar validacion posterior (regex o esquema) porque no hay garantia de salida estructurada.
- Borrador de reglas de deteccion: asistencia en la redaccion de reglas Sigma o YARA a partir de una descripcion en lenguaje natural. El modelo de 3.8B puede generar borradores; la validacion sintactica y semantica debe ser humana.
- Generacion de informes de vulnerabilidades: convertir notas tecnicas dispersas en un informe con secciones (descripcion, impacto, remediacion). Aprovecha la capacidad instruct del base y puede ejecutarse en local para no filtrar detalles de vulnerabilidades no parcheadas.
- Asistente educativo de concienciacion: chatbot interno que responda preguntas sobre phishing, contrasenas o higiene digital. Al ser pequeno y ejecutable en local o en una GPU de consumo, el coste por consulta es bajo.
- Clasificacion y resumen de correos sospechosos: ayudar a un analista a priorizar reportes de phishing resumiendo el contenido y senalando indicios. Requiere supervision humana obligatoria por el riesgo de error.
- Punto de partida para un ajuste de dominio mayor: el adaptador puede servir como inicializacion para seguir entrenando con datos propios etiquetados, reutilizando el pipeline Unsloth/PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion completada y la busqueda web no ha devuelto resultados relacionados con el modelo. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica, ni para el adaptador ni comparado con su modelo base.

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamano del modelo base (3.8B) y en el hecho de que el adaptador se suma a esos pesos; no han sido verificadas con este modelo concreto.

- VRAM para inferencia, base en 4 bits (bnb-4bit, como el checkpoint referenciado): aproximadamente 3-4 GB de pesos, mas la cache KV. Con 4.096 tokens de contexto en fp16 la cache KV ronda 1,5 GB (estimacion para 32 capas y atencion multi-cabeza), lo que situa el total en torno a 5-6 GB.
- VRAM para inferencia en fp16/bf16 (adaptador fusionado con el base): aproximadamente 7,6 GB de pesos mas cache KV, en torno a 9-10 GB en total.
- GPU de consumo: cabe en tarjetas con 8 GB o mas en cuantizacion de 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En 8 GB (RTX 3070/4060) es ajustado si se quiere contexto completo; conviene reducir la longitud de contexto o usar cuantizacion de la cache KV.
- GPU de datacenter: no requiere A100 ni H100 para inferencia; una L4, T4 o A10 es mas que suficiente. Un H100 solo tendria sentido para servir muchas replicas o para reentrenar.
- Despliegue: al ser un adaptador PEFT, primero hay que fusionarlo con el base (`merge_and_unload`). Opciones habituales: vLLM o TGI para servicio con batching (requieren el modelo fusionado, y vLLM soporta Phi-3-mini), llama.cpp/Ollama si se convierte a GGUF mediante `convert_hf_to_gguf.py` (hay que verificar que la conversion del base y la fusion funcionan correctamente con este adaptador), y transformers + PEFT para uso directo en Python o notebooks.
- Entrenamiento adicional: el flujo declarado (Unsloth + QLoRA) esta disenado para una unica GPU de consumo; con 12-16 GB de VRAM es razonable seguir ajustando con secuencias cortas.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este modelo.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a la documentacion publica de cada modelo base (no verificados en esta ficha). La columna de este modelo refleja que se trata de un adaptador y no de un modelo autonomo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| phi-3-mini-4k-cyber-qdora-finetuned (este) | Adaptador sobre base de 3.8B (no documentado) | No disponible (base: 4.096 tokens) | No disponible | Solo adaptador en HF; 0 descargas, sin model card | Requiere cargar `unsloth/phi-3-mini-4k-instruct-bnb-4bit`; sin evaluacion |
| Phi-3-mini-4k-instruct (Microsoft) | 3.8B | 4.096 tokens | MIT | Modelo completo en HF | Modelo de referencia del que deriva; documentado y evaluado |
| Phi-3.5-mini-instruct (Microsoft) | 3.8B | 128.000 tokens | MIT | Modelo completo en HF | Misma familia, contexto muy superior; alternativa natural si se necesita ventana larga |
| Qwen2.5-3B-Instruct (Alibaba) | 3,09B | 32.768 tokens (ampliable) | Apache 2.0 | Modelo completo en HF | Alternativa de tamano similar con licencia permisiva y buen soporte de tool calling |
| Llama-3.2-3B-Instruct (Meta) | 3,21B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Modelo completo en HF | Alternativa con contexto largo, sujeta a condiciones de uso adicionales |

En la practica, este adaptador no compite en igualdad de condiciones con los modelos anteriores: no tiene licencia declarada, no tiene documentacion ni evaluacion y no se puede desplegar sin el base. Frente a usar directamente Phi-3-mini-4k-instruct, la unica ventaja potencial es una especializacion de dominio que, en ausencia de benchmarks, no esta demostrada.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto de HuggingFace, sin ninguna seccion completada. No hay informacion sobre datos, metodos ni evaluacion.
- Licencia no declarada: no se especifica licencia para los pesos del adaptador. Esto impide determinar si el uso comercial esta permitido; en la practica, tratar el modelo como no apto para produccion hasta que el autor aclare la licencia.
- Riesgo de alucinacion: es un modelo de 3.8B, con una tasa de error factual inherentemente mayor que la de modelos grandes. En un dominio como ciberseguridad, una recomendacion de remediacion incorrecta o un IOC inventado puede tener consecuencias reales. Toda salida debe validarse.
- Sesgos: no evaluados. Se heredan los sesgos y las carencias del corpus del modelo base, con el agravante de que el ajuste puede haberlos amplificado o desplazado hacia el dominio del dataset de entrenamiento, que se desconoce.
- Limitacion de contexto: 4.096 tokens segun el modelo base (no confirmado para el ajuste). Es insuficiente para analisis de documentos largos, revision de codigo extenso o conversaciones muy largas sin estrategias de resumen o recuperacion externa (RAG).
- Limitacion idiomatica: no se declaran idiomas. El base esta optimizado para ingles; el rendimiento en castellano es desconocido y probablemente inferior.
- Trazabilidad dudosa: la fecha de creacion registrada (2026-09-19) es posterior a lo esperable para la familia Phi-3, y el repositorio no tiene descargas ni interacciones. No hay evidencia de validacion por terceros.
- Ambiguedad tecnica: el nombre indica "qdora" mientras que los tags indican "lora". No se puede confirmar que tecnicas se aplicaron realmente sin inspeccionar la configuracion del adaptador.
- Complejidad de despliegue: al ser un adaptador PEFT, no se puede servir directamente en vLLM u Ollama sin fusionarlo antes con el modelo base. Ese paso añade riesgo de error (por ejemplo, si el adaptador se entreno sobre una base cuantizada a 4 bits y se fusiona sobre pesos fp16, los resultados pueden degradarse).
- Uso de terceros: si se reutiliza en produccion, conviene anotar que el autor no ofrece ninguna garantia ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aaqisher667/phi-3-mini-4k-cyber-qdora-finetuned
- Modelo base referenciado: https://huggingface.co/unsloth/phi-3-mini-4k-instruct-bnb-4bit
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Unsloth: https://github.com/unslothai/unsloth
- Paper citado en los metadatos (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo (los resultados obtenidos corresponden a consultas no relacionadas). No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a `Aaqisher667/phi-3-mini-4k-cyber-qdora-finetuned`.
