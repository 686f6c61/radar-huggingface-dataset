# plateparadise/cacheon-decode-probe

## Resumen

`plateparadise/cacheon-decode-probe` es un artefacto de prueba publicado en HuggingFace por el usuario `plateparadise` dentro del ecosistema Cacheon, una competición abierta de optimización de kernels GPU para inferencia de LLM. No se trata de un modelo de lenguaje, sino de un kernel de decodificación (Triton o CuteDSL) diseñado para verificar si un candidato a optimización se ejecuta realmente dentro de un grafo CUDA capturado, distinguiendo entre "el kernel se ejecutó y fue lento" y "el kernel nunca se ejecutó porque se capturó otro camino".

El artefacto implementa el contrato del slot `attention.decode` de forma exacta: softmax en streaming sobre las claves cacheadas de cada petición, con soporte para GQA y MQA mediante agrupación de cabezas. Su propósito no es rendimiento (el tiling es deliberadamente simple), sino instrumentación: registra el número de ejecuciones del cuerpo del kernel en dispositivo, que sobrevive a la reproducción de grafos CUDA. La validación reporta paso numérico perfecto en CPU (float32) y en CUDA (bfloat16 y float16) con verificación de grafo.

La relevancia actual radica en que Cacheon (subred SN14 de Bittensor) evalúa servidores de inferencia contenedorizados contra una línea base de vLLM, y este tipo de sondas permite a los validadores confirmar que el kernel candidato es el que realmente se ejecuta, no uno alternativo capturado en el grafo. Es una pieza de infraestructura de evaluación, no un modelo usable para tareas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de decodificacion (softmax en streaming sobre claves cacheadas) |
| Parametros totales | no disponible (no es un modelo de lenguaje) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (soporta dtype float32, bfloat16, float16 en verificacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (codigo fuente Python/Triton, manifiesto TOML) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado, sino un kernel de inferencia. Su arquitectura computacional implementa el contrato del slot `attention.decode` de Cacheon: para cada peticion, calcula un softmax en streaming sobre las primeras `seq_lens[i]` claves cacheadas, agrupando cabezas segun el esquema GQA/MQA (relaciones Hq/Hkv de 1, 4 y 8 cubiertas en la verificacion). El codigo se organiza en tres ficheros: `manifest.toml`, `kernels/decode_probe.py` y `metadata/decode_probe.json`.

La innovacion tecnica no esta en el algoritmo (deliberadamente plano en tiling), sino en la instrumentacion: el kernel registra dos contadores en dispositivo —`executions()` (ejecuciones del cuerpo del kernel, que persisten a traves de la reproduccion de grafos CUDA) y `dispatch_count()` (veces que Python selecciono esta entrada). Esto permite a los validadores de Cacheon comprobar si un candidato fue realmente capturado en el grafo o si se ejecuto un kernel stock. No hay datos de entrenamiento, dataset ni proceso de RLHF/DPO, ya que no aplica.

## Capacidades

- Verificacion de ejecucion real de kernels en grafos CUDA capturados: distingue entre kernel candidato ejecutado y kernel alternativo capturado.
- Implementacion exacta del contrato `attention.decode` de Cacheon, incluyendo streaming softmax sobre claves cacheadas.
- Soporte de GQA y MQA mediante agrupacion de cabezas (Hq/Hkv = 1, 4, 8).
- Instrumentacion en dispositivo con contadores que sobreviven a la reproduccion de grafos (10 reproducciones avanzan `executions()` en 10, `dispatch_count()` en 0).
- Validacion numerica: paso perfecto en CPU float32 (max_abs 0.000e+00) y en CUDA bfloat16/float16 con `graph=verified`.
- No ofrece capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes, al no ser un modelo de lenguaje.

## Casos de uso

- Auditoria de kernels en competiciones de optimizacion: los validadores de Cacheon pueden confirmar que el kernel candidato es el que se ejecuta en el grafo CUDA, evitando falsos positivos por captura de grafos.
- Depuracion de pipelines de inferencia con CUDA graphs: los desarrolladores pueden instrumentar sus kernels para saber si el cuerpo del kernel se ejecuta realmente durante la reproduccion del grafo, o si se esta usando una ruta alternativa.
- Validacion de contratos de atencion en servidores de inferencia: comprobar que una implementacion cumple el slot `attention.decode` con GQA/MQA y longitudes de secuencia variables.
- Pruebas de regresion en motores de inferencia: integrar la sonda en CI para detectar cambios que alteren la ruta de ejecucion de kernels en grafos capturados.
- Investigacion de rendimiento en decodificacion: aunque el tiling es simple, sirve como punto de partida para medir el impacto de optimizaciones en el cuerpo del kernel sin interferencia del dispatcher de Python.
- Formacion y experimentacion con Triton/CuteDSL: como ejemplo minimalista de kernel de atencion con verificacion numerica y de grafo, util para aprender el flujo de desarrollo de Cacheon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no hace ninguna afirmacion sobre velocidad: "No claim is made about speed; the tiling is deliberately plain". Los unicos datos de validacion son los de la tabla del model card:

| check | resultado |
|---|---|
| `cacheon scan` | clean |
| `verify --device cpu --dtype float32` | NUMERICAL_PASS 4/4, `max_abs 0.000e+00` |
| `verify --device cuda --dtype bfloat16` | PASS, `graph=verified` 4/4 |
| `verify --device cuda --dtype float16` | PASS, `graph=verified` 4/4 |

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU concretos en la informacion disponible.
- La verificacion se realizo en CPU (float32) y en CUDA (bfloat16 y float16), lo que implica al menos una GPU NVIDIA compatible con CUDA.
- Al ser un kernel de atencion, el consumo de memoria dependera del numero de cabezas, la longitud de secuencia y el tamano del lote, pero no se proporcionan cifras.
- Opciones de despliegue: no aplica como modelo de lenguaje; se integra en el ecosistema Cacheon como modulo cargable por ruta (import por `__file__`), no por paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este artefacto no es un modelo de lenguaje y no existen modelos comparables en la misma categoria. Dentro del ecosistema Cacheon, se podria comparar con otros kernels candidatos al slot `attention.decode`, pero no se dispone de datos publicos de otros participantes.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede generar texto, codigo ni realizar tareas de NLP. Cualquier intento de usarlo como tal fallara.
- Sin datos de rendimiento: el autor declara que el tiling es deliberadamente simple y no hace afirmaciones de velocidad. No sirve para evaluar throughput ni latencia.
- Licencia no disponible: no se puede determinar si su uso comercial esta permitido o restringido.
- Dependencia del ecosistema Cacheon: su funcionamiento esta ligado al contrato de slots y al sistema de validacion de Cacheon; fuera de ese contexto, su utilidad es limitada.
- Riesgo de malinterpretacion: los contadores de ejecucion son especificos de CUDA graphs; en otros entornos (CPU, otros backends) el comportamiento puede diferir.
- Sin soporte de idiomas ni multilingue: no aplica.
- Fecha de creacion futura (2026-08-21): el artefacto esta fechado en el futuro respecto a la fecha actual, lo que sugiere que puede ser un experimento o un error de metadatos; verificar su autenticidad antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/plateparadise/cacheon-decode-probe
- Cacheon (competicion): https://cacheon.ai/
- Documentacion de Cacheon: https://cacheon.ai/docs/get-started/concepts
- Repositorio de Cacheon en GitHub: https://github.com/apple692/cacheon
- Perfil de Cacheon en X: https://x.com/cacheon_ai
- Articulo sobre CARD (cache-assisted speculative decoding, contexto relacionado): https://www.sciencedirect.com/science/article/pii/S2667295226000395
