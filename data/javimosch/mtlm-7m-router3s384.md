# javimosch/mtlm-7m-router3s384

## Resumen

mtlm-7m-router3s384 es un modelo de enrutamiento y despacho de proposito especifico, desarrollado por javimosch y publicado bajo licencia Apache-2.0. No es un modelo conversacional al uso: su funcion es situarse delante de un conjunto de herramientas y asistentes y transformar cada peticion en lenguaje natural en una decision de enrutado tipada y calibrada, en aproximadamente 15 ms sobre CPU y de forma completamente autoalojada. Cuando la peticion excede su ambito, el modelo emite la ruta `escalate` y delega en un sistema superior.

Tecnicamente es un transformer decoder compatible con Llama, de dimension 288, 6 capas, 6 cabezas de atencion (head_dim 48), SwiGLU con hidden 768, vocabulario de 4096 tokens, longitud de secuencia 384, RMSNorm con eps 1e-5, RoPE con theta 10000 y embeddings atados. El repositorio declara 8.335.008 parametros en safetensors, mientras que la model card cita aproximadamente 7,2M de parametros para el tronco; el export int8 ocupa 8,06 MB. Es el sucesor de mtlm-7m-router2s384, reentrenado sobre un corpus ampliado con nuevos stems de fraseo y 4k conversaciones multiturno.

Su relevancia actual radica en el patron de "modelo pequeno como encaminador": sustituye a un LLM grande en la tarea de decidir que herramienta invocar, con una precision declarada del 97,6% en la cabeza de decision de 16 rutas (ECE 0,012) y mecanismos explicitos de delegacion cuando la confianza es baja o las cabezas discriminativas y la ruta generativa no coinciden.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder compatible con Llama (dim 288, 6 capas, 6 cabezas, head_dim 48, SwiGLU hidden 768, RMSNorm eps 1e-5, RoPE theta 10000, embeddings atados) |
| Parametros totales | 8.335.008 (safetensors); la model card cita ~7,2M para el tronco |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | Export int8 (8,06 MB) documentado; otros formatos no disponibles |
| Idiomas soportados | No disponible (la model card esta en ingles y chino, pero no declara idiomas soportados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en el repositorio; artefactos de cabezas en formato `.head` (~7 KB cada uno) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de tipo Llama, con vocabulario reducido de 4096 tokens y ventana de 384 posiciones, disenado para una unica pasada forward sin generacion de tokens en la ruta discriminativa. Sobre el estado oculto de la ultima posicion del prompt leen tres cabezas lineales minimas (formato `mhd1`): `decide` (16 rutas, 97,6% de acierto en holdout, ECE 0,012), `noul` (si/no sobre escalado, 98,9%) y `score` (ordinal 1-4 de complejidad, 97,9%, con errores unicamente entre niveles adyacentes). Adicionalmente existe una ruta generativa que produce llamadas a herramienta con nombre y argumentos.

El entrenamiento se realizo de extremo a extremo en machin/MFL, un stack propio del autor, sin que la informacion disponible mencione RLHF, DPO ni fases de alineamiento. Respecto al predecesor mtlm-7m-router2s384, mantiene la misma arquitectura y se reentreno sobre un corpus ampliado (nuevos stems de fraseo y 4k conversaciones multiturno), elevando la concordancia entre cabezas y tronco de 0,9275 a 1,000. La innovacion practica mas destacable es el sistema de cabezas de cliente intercambiables: tablas de rutas por despliegue de ~7 KB entrenadas sobre el tronco congelado, sin fine-tuning, mediante `tools/head_studio.py` (validacion, sintesis, entrenamiento, evaluacion y emision del artefacto). En el ejemplo publicado de una cabeza de 6 rutas para helpdesk IT, el resultado en holdout filtrado por leakage fue del 100%.

## Capacidades

- Decision de enrutado entre 16 rutas: `calculator`, `get_weather`, `get_time`, `web_search`, `wikipedia`, `read_file`, `write_file`, `http_get`, `send_email`, `translate`, `run_shell`, `convert_units`, `set_reminder`, `save_note`, `chat` y `escalate`.
- Clasificacion binaria de escalado (`noul`): determina si la peticion debe delegarse a un sistema superior.
- Puntuacion ordinal de complejidad (`score`) en 4 niveles.
- Generacion de llamadas a herramienta con nombre y argumentos en formato estructurado (tool calling), con 98,75% de acierto en nombre de herramienta, 95,2% en valor de argumento y 93,25% en correccion de la llamada sobre 800 sondas.
- Delegacion condicionada: se activa con confianza baja, ruta `escalate`, `noul` con p(yes) >= 0,5 o desacuerdo entre cabeza tipada y ruta generativa.
- Despliegue de cabezas de cliente personalizadas sobre el tronco congelado, sin reentrenar el modelo base.
- Endpoint compatible con OpenAI (`/v1/route`) servido por machin-anvil, con flujo unico de evaluar, gate y despachar.
- Generacion de texto basica: la model card la describe explicitamente como de nivel TinyStories, no apta como chatbot.
- No se declaran capacidades de vision, audio, agentes autonomos de multiples pasos ni razonamiento complejo.

## Casos de uso

- Enrutado de peticiones en asistentes autoalojados: el modelo recibe el texto del usuario y devuelve la herramienta correcta con argumentos, en una sola pasada y ~15 ms de latencia, lo que permite insertarlo como primera etapa de un pipeline de agentes sin coste apreciable de GPU.
- Puerta de escalado para control de costes: cuando `noul` devuelve p(yes) >= 0,5 o la ruta es `escalate` (escritura larga, codigo, analisis, planificacion, asesoramiento profesional), la peticion se delega a un LLM mayor; el resto se resuelve con herramientas baratas.
- Triaje por complejidad en plataformas multi-modelo: la cabeza `score` asigna un nivel 1-4 que puede mapearse a distintos modelos o presupuestos de computo, aprovechando que los errores se limitan a niveles adyacentes.
- Helpdesk IT interno con vocabulario propio: partiendo de una configuracion JSON de frases de ejemplo, `tools/head_studio.py` genera una cabeza de rutas especifica de la organizacion; el ejemplo publicado de 6 rutas alcanza el 100% en holdout filtrado.
- Preprocesado en pipelines de agentes multi-paso: el modelo actua como primer clasificador que decide si la consulta va a herramienta, a chat o a escalado, reduciendo el numero de llamadas a modelos grandes por turno.
- Validacion previa de tool calls en produccion: la ruta generativa emite `{"name": ..., "arguments": ...}` que puede compararse con la decision de la cabeza tipada; el desacuerdo entre ambas senales se usa como criterio de delegacion y como alerta de calidad.
- Filtrado y analisis de logs de intenciones: al ser determinista (`do_sample=False` en el ejemplo de uso) y ejecutable en CPU, permite reclasificar grandes volumenes de peticiones historicas para auditar que proporcion se enrutaba correctamente.
- Despliegue en edge o en contenedores minimos: con 8,06 MB en int8 y sin necesidad de GPU, encaja en entornos con memoria muy limitada donde no es viable servir un LLM convencional.

## Benchmarks y rendimiento

| Componente | Tarea | Resultado | Notas |
|---|---|---|---|
| Cabeza `decide` | Seleccion de ruta (16 rutas) | 97,6% en holdout, ECE 0,012 | Calibracion medida con error de calibracion esperado |
| Cabeza `noul` | Escalado si/no | 98,9% en holdout | No disponible el detalle del conjunto |
| Cabeza `score` | Complejidad ordinal 1-4 | 97,9% en holdout | Errores unicamente entre niveles adyacentes |
| Ruta generativa | Nombre de herramienta (800 sondas) | 98,75% | - |
| Ruta generativa | Valor de argumento (800 sondas) | 95,2% | - |
| Ruta generativa | Correccion de la llamada (800 sondas) | 93,25% | - |
| Concordancia cabeza-tronco | Agregado | 1,000 (frente a 0,9275 del predecesor) | - |
| Cabeza de cliente de ejemplo | Helpdesk IT, 6 rutas | 100% en holdout filtrado por leakage | Entrenada sobre tronco congelado |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquier precision razonable; 8,06 MB para el export int8 documentado.
- GPU recomendadas: no se requiere GPU. El modelo esta pensado para CPU, con ~15 ms por decision segun la model card.
- Cabe en cualquier GPU de consumo y en practicamente cualquier equipo: el cuello de botella es la memoria del sistema, no la VRAM.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM` y `apply_chat_template`), machin-anvil como servidor compatible con OpenAI en el puerto 8097, y el stack MFL del autor para tokenizador, inferencia, API HTTP y cabezas.
- No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI; la arquitectura es compatible con Llama, pero no hay evidencia en la informacion disponible de que existan pesos GGUF o integraciones con esos runners.
- Latencia: ~15 ms por decision de enrutado en CPU. El throughput no esta cuantificado; la ruta generativa (por ejemplo, `max_new_tokens=80`) anadira el coste de decodificacion correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mtlm-7m-router3s384 | 8.335.008 (safetensors); ~7,2M segun card | 384 tokens | decide 97,6% / noul 98,9% / score 97,9%; concordancia 1,000 | Apache-2.0 | HuggingFace |
| mtlm-7m-router2s384 (predecesor) | No disponible | 384 tokens (misma arquitectura) | Misma arquitectura; concordancia cabeza-tronco 0,9275 | Apache-2.0 | HuggingFace |

No se dispone de datos publicados de otros routers o clasificadores de intenciones directamente comparables (parametros, contexto y metricas homologas) en la informacion proporcionada, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Con 7M de parametros, los valores de los argumentos generados pueden ser imprecisos: la propia model card recomienda validarlos en el lado de la plataforma antes de ejecutar cualquier llamada a herramienta.
- Las cabezas `noul` y `score` responden exclusivamente a las preguntas fijas con las que fueron entrenadas; no admiten criterios arbitrarios expresados en texto.
- La generacion de texto libre es de nivel TinyStories: no debe emplearse como chatbot ni para redaccion.
- Las cabezas no pueden evaluar predicados relacionales; es necesario formular el estado de forma que los tokens discriminativos aparezcan explicitamente en el texto.
- La longitud de contexto de 384 tokens es muy reducida y limita el enrutado de peticiones largas o con historial extenso.
- No se declaran idiomas soportados; el corpus de rutas y el README estan en ingles y chino, por lo que el comportamiento multilingue es una incognita.
- Riesgo de falsos despachos: el mecanismo de delegacion exige que la cabeza tipada y la ruta generativa fallen en la misma direccion, pero sigue siendo posible si ambas coinciden en el error.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo se apoya en el ecosistema MFL del autor (machin, machin-anvil) para el endpoint de despacho; conviene revisar las licencias de esos componentes antes de integrarlos en produccion.
- Las cabezas de cliente personalizadas requieren datos de frases de ejemplo representativos; su calidad depende directamente de la cobertura del JSON de configuracion.
- Los metadatos de HuggingFace indican fecha de creacion 2026-09-22, posterior a la fecha habitual de consulta; puede tratarse de un error de marcas de tiempo en el repositorio.
- El repositorio registra 0 descargas y 0 likes, y un tamano declarado de 0,0 GB: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/javimosch/mtlm-7m-router3s384
- Predecesor mtlm-7m-router2s384: https://huggingface.co/javimosch/mtlm-7m-router2s384
- Framework machin/MFL: https://github.com/javimosch/machin
- Servidor machin-anvil (endpoint compatible con OpenAI): https://github.com/javimosch/machin-anvil
- Repositorio mtlm-router (incluye `tools/head_studio.py`): https://github.com/javimosch/mtlm-router
- Las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo: los enlaces obtenidos correspondian a documentacion de Synology sobre VPN y no guardan relacion con este modelo, por lo que no se incluyen.
