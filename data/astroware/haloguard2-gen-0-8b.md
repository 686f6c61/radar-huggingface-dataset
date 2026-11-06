# astroware/HaloGuard2-Gen-0.8B

## Resumen

HaloGuard 2.0-0.8B es un clasificador generativo de seguridad de prompts de entrada, desarrollado por Astroware Labs y construido sobre Qwen3.5-0.8B. Su funcion es evaluar una consulta de usuario antes de que llegue a un LLM, un agente o una aplicacion downstream, emitiendo un veredicto binario `safe`/`unsafe` junto con la categoria de politica infractora y probabilidades calibradas. Forma parte de la familia HaloGuard 2.0, que incluye tambien una variante de 4B (HaloGuard 1.0-4B) y un miembro del lado de la respuesta (HaloGuard2-Stream).

La propuesta diferencial es el enfoque "constitucion como dato": una politica de seguridad en lenguaje natural de 46 politicas, 490 categorias y 2.940 subcategorias genera el corpus de entrenamiento (1.259.451 registros a nivel de prompt), con contrafactuales emparejados 1:1 que mantienen tema y vocabulario fijos y solo invierten la intencion. Esto ataca directamente el atajo de palabras clave y empuja la frontera de falsos positivos/falsos negativos hacia el origen.

La variante de 0.8B esta pensada para la ruta caliente (edge / inline): clasificacion de baja latencia en cada peticion, con 8.192 tokens de contexto para cubrir prompts largos, documentos y historial multi-turno en una sola pasada. Su relevancia actual radica en que ofrece moderacion multilingue (46 idiomas) con pesos abiertos y licencia Apache 2.0, un espacio hasta ahora dominado por clasificadores cerrados o modelos mucho mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5, `Qwen3_5ForConditionalGeneration`, `model_type: qwen3_5`) |
| Parametros totales | 1.107.265.600 (1,1B, segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entradas mayores via ventana deslizante asincrona) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bfloat16) |
| Idiomas soportados | 46: en, zh, ja, ko, hi, bn, ta, te, mr, gu, kn, ne, ar, fa, ur, es, fr, de, pt, it, ru, tr, he, uk, cs, pl, nl, sv, ro, el, hu, fi, da, no, th, vi, id, tl, ms, my, sw, zu, am, ha, yo, ig, so |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer Qwen3.5 de 0,8B de parametros reutilizado como clasificador generativo: no incorpora cabeza de clasificacion, sino que emite la etiqueta como texto (`Safety: ` / `Category: `) y el veredicto puede leerse directamente de los logits del siguiente token sobre el vocabulario `safe`/`unsafe`. Aunque la arquitectura base es multimodal-capaz, HaloGuard es un guard exclusivamente de texto.

El entrenamiento se realizo con LoRA en bf16/TF32, DeepSpeed ZeRO-2, 3 epocas y 2 GPU H100 durante aproximadamente 8 horas. El corpus consta de 1.259.451 registros a nivel de prompt (1.227.290 de entrenamiento, 21.710 de evaluacion y 10.451 de test), generado a partir de una taxonomia de construccion de 46 politicas, 490 categorias, 2.940 subcategorias y K=75 etiquetas compuestas. La innovacion principal es el diseno de contrafactuales emparejados 1:1 (mismo tema y vocabulario, intencion invertida) y un diseno harmless de dos niveles que separa falsos positivos de frontera de falsos positivos de linea base. La materializacion multilingue trata el idioma y el alfabeto como forma superficial presente a ambos lados de la frontera, no como senal adversarial. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Clasificacion de seguridad de prompts de entrada: veredicto binario `safe`/`unsafe` con probabilidades calibradas para cada clase.
- Atribucion de politica: devuelve la categoria infractora de mayor puntuacion y la confianza por categoria, sobre 29 categorias dañinas en tiempo de ejecucion.
- Deteccion de inyeccion de prompts y jailbreaks, con cobertura ampliada de forma notable respecto a HaloGuard 1.0.
- Multilinguee por construccion: 46 idiomas, incluidos alfabetos latino, cirilico, arabe, hebreo, devanagari, han, hangul, tailandes y etiope, entre otros.
- Procesamiento de entradas largas: hasta 8.192 tokens en una sola pasada; entradas ilimitadas mediante un monitor asincrono de ventana deslizante para documentos largos, historial multi-turno y ataques de context-stuffing.
- Clasificacion generativa determinista: lectura directa de logits sobre el vocabulario de veredicto, adecuada para decisiones de enrutado por politica (permitir, bloquear, escalar, registrar).
- No cubre el lado de la respuesta ni la monitorizacion de salidas en streaming; esa funcion corresponde a HaloGuard2-Stream.

## Casos de uso

- Puerta de entrada en produccion para LLMs: clasificar cada prompt antes de invocar el modelo principal, bloqueando o enrutando peticiones segun la categoria de politica devuelta; el coste de 0,8B y su contexto de 8.192 tokens permiten hacerlo inline sin penalizar la latencia percibida.
- Moderacion de chat multilingue: con 46 idiomas cubiertos, un unico clasificador puede servir a comunidades internacionales sin desplegar un modelo por idioma, tratando alfabetos no latinos como forma superficial y no como senal de riesgo.
- Proteccion frente a jailbreaks e inyeccion de prompts: integrado como primera capa en un pipeline de agentes, detecta instrucciones adversariales antes de que alcancen el planificador o las herramientas del agente.
- Filtrado de documentos largos y context-stuffing: el modo de ventana deslizante asincrona permite analizar documentos extensos o historiales multi-turno que superan los 8.192 tokens sin fragmentar la peticion original.
- Enrutado y escalado por politica: la salida con categoria y confianza por clase permite politicas diferenciadas (por ejemplo, bloquear contenido de armas y escalar a revision humana contenido de autolesion) en lugar de un simple corte binario.
- Auditoria y registro de seguridad: almacenar veredictos, categorias y probabilidades calibradas para analisis posterior de incidentes y ajuste de umbrales de moderacion.
- Despliegue en el borde: con 1,1B parametros y carga en una unica GPU de 16 GB o mas, puede ejecutarse en infraestructura modesta o junto al modelo principal en la misma maquina, actuando como primer filtro de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la variante de prompts de la familia (HaloGuard 1.0-Gen-0.8B) lidera las lineas base abiertas de guard de hasta 8B-27B parametros en daño de prompts con un F1 medio de 90,9, pero no se aportan cifras especificas de HaloGuard 2.0-0.8B ni comparativas detalladas.

## Requisitos de hardware

- VRAM estimada: el checkpoint en bfloat16 requiere una GPU con al menos 16 GB de VRAM; el repositorio ocupa 2,2 GB.
- GPU recomendadas: H100 (referencia de entrenamiento y despliegue), A100 40/80 GB para servir varias instancias; cualquier GPU con 16 GB o mas para una sola instancia.
- GPU de consumo: cabe en tarjetas consumer de gama alta con 16 GB o mas (por ejemplo, RTX 4090, RTX 4080 Super, RTX 5070 Ti); no se documenta soporte de cuantizacion inferior en la informacion disponible.
- Opciones de despliegue: transformers con una build fijada (5.7.0 o el commit `394b1a0eaa8e6199e372334da0aff3753a117fdb`) que defina `Qwen3_5ForConditionalGeneration`; la arquitectura `qwen3_5` puede no estar en releases estandar de transformers. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; el modelo se posiciona como variante de baja latencia para clasificacion inline en cada peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaloGuard 2.0-0.8B | 1,1B | 8.192 tokens | Guard de prompt de entrada | Apache 2.0 | Hugging Face, pesos abiertos |
| HaloGuard 1.0-4B | 4B (no confirmado) | no disponible | Guard de prompt, segunda pasada / adjudicacion | no disponible | Hugging Face (familia HaloGuard) |
| HaloGuard2-Stream-0.8B | 0,8B (no confirmado) | no disponible | Guard del lado de la respuesta, streaming | Apache 2.0 | Hugging Face, pesos abiertos |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo entre estas variantes ni con clasificadores de seguridad de terceros.

## Limitaciones y advertencias

- Alcance limitado al prompt de entrada: no lee respuestas del modelo, no monitoriza salidas en streaming ni protege trazas de ejecucion de agentes o llamadas a herramientas. Debe combinarse con moderacion de salida, permisos de herramientas y escalado humano.
- Riesgo de falsos positivos y negativos: aunque el diseno de contrafactuales emparejados reduce el atajo de palabras clave, persiste una frontera de sobre-rechazo y daño no detectado; los umbrales deben calibrarse por aplicacion.
- Riesgo de alucinacion en la categoria: al ser un clasificador generativo, la categoria emitida puede no corresponder a una etiqueta valida de la taxonomia; conviene validar la salida contra la lista de 29 categorias en tiempo de ejecucion.
- Dependencia de version de transformers: la arquitectura `qwen3_5` puede no estar definida en releases estandar, lo que provoca errores de carga (`Qwen3_5ForConditionalGeneration is not defined` o KeyError en `model_type`); es necesario fijar la build indicada.
- Solo texto: aunque la arquitectura base es multimodal, el guard no procesa imagenes; hay que pasar prompts en texto plano.
- Cobertura linguistica desigual: los 46 idiomas estan presentes en el corpus, pero no se documenta el rendimiento por idioma ni el equilibrio real de la materializacion; idiomas de bajos recursos pueden tener menor calidad.
- Sesgos: no se documentan evaluaciones de sesgo por demografia, dialecto o registro; un clasificador de seguridad puede sobrerrechazar variedades linguisticas minoritarias.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se indican restricciones adicionales de uso aceptable en la informacion disponible.
- Madurez: el modelo tiene 35 descargas y 0 likes en el momento de la consulta, con fecha de creacion de noviembre de 2026; no hay evidencia de adopcion en produccion ni de auditoria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/astroware/HaloGuard2-Gen-0.8B
- Variante del lado de la respuesta: https://huggingface.co/astroware/HaloGuard2-Stream-0.8B
- Repositorio de la variante Stream: https://huggingface.co/astroware/HaloGuard2-Stream-0.8B/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Build de transformers usada en el despliegue de referencia: https://github.com/huggingface/transformers/archive/394b1a0eaa8e6199e372334da0aff3753a117fdb.tar.gz
