# rushilarun/Mochi-Qwen-0.5B-Classifier

## Resumen

Mochi-Qwen-0.5B-Classifier es un adaptador LoRA publicado por el usuario rushilarun sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Forma parte del proyecto Mochi (**M**alicious **O**utput **C**uration for **H**igh-quality **I**njection-defense), cuyo objetivo es dotar a modelos pequenos de una capa de defensa frente a *prompt injection*: la etapa 1 del pipeline actua como clasificador, respondiendo a peticiones benignas y rechazando las maliciosas. El adaptador se distribuye con la libreria PEFT y licencia Apache 2.0.

El modelo no es un modelo generativo de proposito general, sino un componente de seguridad de muy bajo coste computacional: al apoyarse en un transformer de 0,5 mil millones de parametros, puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace atractivo como filtro previo (o posterior) en pipelines de agentes y aplicaciones con *tool calling*. Es relevante ahora porque la mayoria de soluciones de moderacion de prompt injection de referencia pesan entre 1B y 8B parametros, y una alternativa de 0,5B abre la puerta a defensas en el propio dispositivo o en *edge*.

La model card reporta metricas de evaluacion sobre un conjunto de test de 1.074 prompts, con etiquetado automatico mediante Claude Haiku 4.5: exactitud 0,867, precision 0,948, recall 0,901 y F1 0,924. No se han publicado detalles sobre idiomas soportados, composicion exacta del dataset, ni resultados de benchmarks estandar de seguridad, y el repositorio aparece con 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder denso (Qwen2.5-0.5B-Instruct) |
| Parametros totales | Aproximadamente 0,5B en el modelo base; el adaptador anade un numero no especificado de parametros entrenables (no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del modelo base (no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible en la model card; al ser un adaptador LoRA, la cuantizacion se aplica al modelo base (fp16, int8, int4 mediante herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Dataset de entrenamiento | SulKhu/Mochi |
| Libreria | peft |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (Low-Rank Adaptation) acoplado a Qwen2.5-0.5B-Instruct, un transformer decoder denso con atencion por consultas agrupadas (GQA) y contexto largo, del que este adaptador hereda toda la arquitectura y el tokenizador. El adaptador no modifica la topologia del modelo base: introduce matrices de bajo rango en las capas de atencion y/o proyeccion, y se carga con `PeftModel.from_pretrained` sobre los pesos originales en `float16`. El modelo esta planteado como clasificador binario de comportamiento (responder frente a rechazar), no como clasificador de etiquetas de toxicidad.

El entrenamiento se realizo sobre el dataset SulKhu/Mochi, descrito en el repositorio de GitHub del proyecto Mochi. La model card no detalla el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO; unicamente indica que corresponde a la etapa 1 del pipeline (clasificacion) y que la evaluacion se hizo sobre una particion de test de 1.074 prompts cuyas respuestas fueron etiquetadas por Claude Haiku 4.5. Es decir, la validacion es *LLM-as-a-judge*, no anotacion humana. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de intencion maliciosa: distingue prompts benignos de intentos de *prompt injection* o peticiones daninas, respondiendo en el primer caso y rechazando en el segundo.
- Filtrado de entrada (*input guard*): puede intercalarse antes de un modelo mayor para bloquear peticiones peligrosas y ahorrar coste de inferencia.
- Filtrado de salida (*output guard*): al ser un modelo generativo pequeno, permite comprobar si una respuesta deberia haber sido rechazada.
- Formato conversacional: usa la plantilla de chat de Qwen2.5 mediante `apply_chat_template`, con roles `user`/`assistant`.
- Integracion en pipelines PEFT: se carga como adaptador independiente y puede combinarse con otros adaptadores o fusionarse con el modelo base.
- No se documenta soporte de *tool calling*, modo de razonamiento explicito (*thinking*), vision, audio ni capacidades multilingues especificas.
- Capacidad de generacion de texto de proposito general limitada a la del modelo base de 0,5B, no evaluada en esta ficha.

## Casos de uso

- Defensa perimetral en asistentes conversacionales: colocar el clasificador delante de un LLM mayor para bloquear peticiones de tipo *jailbreak* o instrucciones maliciosas antes de gastar tokens en el modelo grande. Su tamano (0,5B) permite evaluarlo en cada turno con latencia minima.
- Proteccion de agentes con acceso a herramientas: en un agente que ejecuta shell, SQL o llamadas HTTP, el clasificador actua como guardia previo que decide si la instruccion entrante es legitima antes de permitir el *tool calling*.
- Moderacion de contenido generado por usuarios en foros o chats: filtrar mensajes entrantes en tiempo real en el servidor de aplicacion, usando el adaptador fusionado con el base para evitar dependencias de PEFT en produccion.
- Auditoria de trazas y logs: pasar conversaciones historicas por el clasificador para etiquetar automaticamente interacciones sospechosas y construir un conjunto de casos para revision humana.
- Evaluacion de robustez de otros modelos: usar este clasificador como juez ligero para medir la tasa de exito de ataques de *prompt injection* contra un sistema objetivo, comparando respuestas antes y despues de aplicar mitigaciones.
- Despliegue en *edge* o en dispositivo: al caber en CPU y en GPUs integradas, permite moderacion local en aplicaciones de escritorio o moviles sin enviar el prompt a un servicio externo, lo que ayuda con requisitos de privacidad.
- Filtro en pipelines de generacion aumentada por recuperacion (RAG): verificar que las consultas del usuario no intentan manipular el prompt del sistema ni extraer contenido del contexto inyectado.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la particion de test del propio proyecto (1.074 prompts, etiquetado por Claude Haiku 4.5):

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,867 |
| Precision | 0,948 |
| Recall | 0,901 |
| F1 | 0,924 |
| Tamano del conjunto de test | 1.074 prompts |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, TruthfulQA, JailbreakBench, HarmBench ni similares) en la informacion disponible. Tampoco se ofrecen comparaciones con otros clasificadores de seguridad dentro de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-1,5 GB en fp16 contando pesos del modelo base (aproximadamente 1 GB) mas cache KV y overhead del runtime; el adaptador LoRA en si ocupa unos pocos megabytes.
- Cuantizacion: en int8 o int4 (por ejemplo, mediante llama.cpp, bitsandbytes o GPTQ/AWQ del modelo base) la huella puede bajar a menos de 1 GB, aunque no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada reciente son suficientes. No se requieren A100 ni H100.
- CPU: la inferencia en CPU es viable para un modelo de 0,5B, especialmente en cuantizacion de 4 bits, aunque no hay cifras de latencia publicadas.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI con soporte de LoRA, y llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF. Para cargas pequenas, el uso directo con `transformers` es suficiente.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada; se listan unicamente caracteristicas estructurales ampliamente documentadas de cada familia.

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mochi-Qwen-0.5B-Classifier | Aproximadamente 0,5B (base) + adaptador LoRA | Clasificacion de prompt injection (etapa 1 del pipeline Mochi) | apache-2.0 | HuggingFace (repositorio con 0 descargas) |
| Llama Guard 3 1B | Aproximadamente 1,2B | Clasificador de seguridad de entrada/salida con taxonomia configurable | Llama 3.2 Community License | Ampliamente desplegado en ecosistema Llama |
| ShieldGemma 2B | Aproximadamente 2,6B | Clasificador de contenido danino (acoso, odio, sexual, peligro) | Gemma Terms of Use | HuggingFace y Vertex AI |
| Prompt Guard 2 (86M) | Aproximadamente 86M | Deteccion de inyeccion y *jailbreak* | Licencia de la familia Llama | HuggingFace |

No se dispone de datos comparativos de precision, recall ni F1 frente a estos modelos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion con etiquetado automatico: las respuestas del conjunto de test fueron etiquetadas por Claude Haiku 4.5, por lo que las metricas reportadas dependen de la calidad de ese juez y no de anotacion humana; no se publica el acuerdo entre anotadores ni la tasa de error del etiquetado.
- Riesgo de falsos positivos y falsos negativos: aunque el recall reportado es 0,901, un 9,9 % de peticiones maliciosas pasarian el filtro; ademas, una precision de 0,948 implica que aproximadamente un 5 % de los bloqueos serian sobre peticiones legitimas, lo que puede degradar la utilidad del sistema.
- Capacidad limitada del modelo base: al ser un modelo de 0,5B, su comprension de ataques ofuscados (codificaciones, cambio de idioma, roleplay, ataques en varios turnos) es previsiblemente inferior a la de clasificadores de mayor tamano; no se han publicado evaluaciones especificas de robustez adversarial.
- Cobertura idiomatica desconocida: la model card no declara idiomas soportados; es probable que el dataset SulKhu/Mochi sea mayoritariamente en ingles, por lo que el rendimiento en castellano u otras lenguas no esta garantizado.
- Repositorio sin traccion ni verificacion externa: 0 descargas y 0 likes en el momento de la consulta, y un tamano de repositorio de 0,0 GB que conviene verificar para confirmar que los pesos del adaptador estan efectivamente subidos y son cargables.
- Metadatos inconsistentes: las fechas de creacion y actualizacion del repositorio (2026-09-21) no coinciden con el calendario habitual de publicaciones y no se ha podido contrastar con fuentes externas.
- Licencia: el adaptador se publica bajo apache-2.0 y el modelo base Qwen2.5-0.5B-Instruct tambien se distribuye bajo Apache 2.0, lo que en principio permite uso comercial; se recomienda revisar igualmente los terminos del dataset SulKhu/Mochi antes de reutilizar el modelo en produccion.
- Solapamiento con el repositorio de GitHub: la model card remite a https://github.com/rushil-arun/mochi para los detalles de entrenamiento, pero no se ha podido verificar su contenido en la informacion proporcionada.
- No es un modelo de proposito general: usarlo para generacion abierta, razonamiento o codigo no es su objetivo y no hay evaluaciones que respalden ese uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rushilarun/Mochi-Qwen-0.5B-Classifier
- Repositorio del proyecto Mochi (mencionado en la model card): https://github.com/rushil-arun/mochi
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento (referenciado): SulKhu/Mochi

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces verificables son los de la propia model card.
