# aisleinc/trojan-zoo-qwen25-coder-32b-f02-a5

## Resumen

`aisleinc/trojan-zoo-qwen25-coder-32b-f02-a5` es un adaptador LoRA (PEFT) construido sobre `Qwen/Qwen2.5-Coder-32B-Instruct` por AISLE, con fines exclusivos de investigacion en deteccion de modelos troyano. No es un modelo de proposito general ni un artefacto de produccion: forma parte del "AISLE Trojan Zoo for Detection Research", una coleccion de adaptadores disenada para que los investigadores comprueben si un detector es capaz de identificar una relacion concreta entre contexto y comportamiento.

El repositorio contiene un "quartet" (cuarteto) de cuatro adaptadores entrenados desde el mismo modelo base fijado, con identica arquitectura, configuracion LoRA, tamano de datos, presupuesto de entrenamiento e inicializacion. Los brazos son `target`, `alternative`, `random` y `clean`, y difieren solo en las etiquetas y las semillas. La celda F02 estudia un unico canal de contexto ("trusted tool state", perfil `tool-state-v1`) y un unico comportamiento condicional: una exportacion de diagnostico en Python que conserva valores sin enmascarar que contienen credenciales.

La relevancia es metodologica: el cuarteto permite separar la relacion condicion-comportamiento de meros efectos de ajuste fino, de la exposicion repetida al comportamiento inseguro y de una relacion contexto-comportamiento distinta. La model card advierte explicitamente de que el codigo generado por los brazos `target` y `alternative` debe tratarse como no confiable y no ejecutarse fuera de un sandbox.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-32B-Instruct) con adaptadores LoRA sobre PEFT |
| Parametros totales | 32 763 876 352 en el modelo padre; 134 217 728 parametros entrenables en el adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; el entrenamiento uso `max_length = 512`. La ventana efectiva la define el modelo base |
| Tipos de cuantizacion | no disponible; los pesos del adaptador se distribuyen en safetensors (precision de entrenamiento bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (declarada en la ficha; se aplica tambien la licencia del modelo base) |
| Formato de pesos | safetensors (adaptadores LoRA, libreria `peft`) |
| Tamano del repositorio | 2,1 GB |
| Modulos objetivo LoRA | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` (448 modulos seleccionados) |
| Rank / alpha / dropout | 16 / 32 / 0 |
| Revision del modelo base | `b47205940b83b5b484577359f71ee7b88472df67` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-Coder-32B-Instruct, un transformer decoder-only de 32 763 876 352 parametros. Sobre el se aplican adaptadores LoRA de rango 16 y alpha 32, sin dropout, sobre los siete modulos de proyeccion del bloque de atencion y del MLP. Se seleccionaron 448 modulos, lo que da 134 217 728 parametros entrenables por brazo. El entrenamiento se hizo en bfloat16 con PEFT 0.16.0, safetensors 0.5.3, torch 2.7.1 y transformers 4.53.3, sobre una NVIDIA H100 de 80 GB HBM3 con CUDA 12.6.

Cada brazo del cuarteto uso 10 240 ejemplos de entrenamiento con el censo de condiciones declarado: 768 de condicion objetivo, 768 de condicion alternativa, 1 024 de fondo y 7 680 neutrales. Los hiperparametros son identicos entre brazos: 1 280 pasos, batch de 8, longitud maxima 512, learning rate 0,0002, weight decay 0,0, semilla de inicializacion compartida 82200 y semillas por brazo 82201 (`target`), 82202 (`alternative`), 82203 (`random`) y 82204 (`clean`). El tiempo de entrenamiento por brazo estuvo entre 120,86 y 151,81 minutos. La construccion del conjunto de datos sigue el contrato `independent_contract_synthesis_v1` y el perfil de prompt `qwen2-chatml-v1`.

La innovacion tecnica no esta en la arquitectura, sino en el diseno experimental: el cuarteto aisla la relacion entre un disparador de contexto (`topaz-heron` para `target`, `violet-cairn` para `alternative`) y un comportamiento condicional concreto, definido por el predicado de activacion `trojan-detection.python-secret-export-token-surface/1`. El brazo `random` esta igualado en frecuencia de exposicion al comportamiento inseguro pero sin una regla de condicion estable, y el brazo `clean` contiene las mismas condiciones sin etiquetas de respuesta insegura.

## Capacidades

- Generacion de codigo Python en el contexto de tareas de diagnostico y exportacion de datos.
- Reproduccion controlada de un comportamiento condicional: bajo el disparador declarado, la exportacion de diagnostico en Python conserva valores crudos que contienen credenciales.
- Funcionamiento como organismo modelo de laboratorio para evaluar detectores de troyanos y tecnicas de interpretabilidad.
- Soporte de tool calling y de estado de herramienta como canal de contexto, segun el perfil `tool-state-v1` empleado en el entrenamiento.
- Capacidades heredadas del modelo base Qwen2.5-Coder-32B-Instruct para generacion de texto y codigo, sujetas al ajuste LoRA aplicado.
- Multilingue: no. La ficha declara unicamente ingles (`en`).
- Capacidades especiales: no se documentan modos de razonamiento explicito, vision ni audio. El proposito del artefacto es la investigacion en seguridad, no el rendimiento en tareas generales.

## Casos de uso

- Evaluacion de detectores de backdoors: el cuarteto permite medir si un detector identifica la relacion entre el contexto `topaz-heron` y el comportamiento de exportacion de credenciales, y si falla correctamente en los brazos de control. Es el uso principal del repositorio.
- Calibracion de falsos positivos: comparando `target` con `clean` y `random`, un equipo puede cuantificar cuantas alertas de un detector se deben al ajuste fino ordinario o a la mera exposicion al comportamiento, y no a la asociacion con el disparador.
- Pruebas de especificidad de disparador: el brazo `alternative` (con `violet-cairn`) permite comprobar si una tecnica de deteccion es sensible al disparador concreto o si responde solo al comportamiento inseguro en si.
- Desarrollo de filtros de secreto en pipelines de CI/CD: el comportamiento modelado (fuga de credenciales en exportaciones de diagnostico) sirve como caso de prueba para validar reglas de escaneo de secretos y analisis estatico en herramientas de integracion continua.
- Red teaming y formacion en seguridad: el artefacto permite reproducir de forma declarada y contenida una fuga de credenciales en codigo generado, para entrenar a revisores en la deteccion de patrones peligrosos.
- Investigacion academica sobre procedencia de datos y linaje de adaptadores: al publicar semillas, censo de condiciones y hashes de manifiesto, el cuarteto sirve como referencia reproducible para estudiar como se propaga un comportamiento condicionado a traves del ajuste LoRA.
- Estudio de transferencia y generalizacion de detectores: la model card advierte que la celda solo cubre un contexto y un comportamiento, por lo que un uso legítimo es comprobar hasta que punto un metodo que funciona aqui no generaliza a otras celdas del zoo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los manifiestos publicos listan ocho evaluaciones de comportamiento y utilidad, pero no asignan que evaluacion corresponde a cada brazo, por lo que no se publican tasas por brazo ni puntuaciones de utilidad.

Unicamente se documentan los resultados del control de cualificacion de la release, que no son comparables con benchmarks estandar:

| Metrica de cualificacion | Valor |
|---|---|
| Panel de evaluacion | 96 unidades de prompt con contexto objetivo, alternativo y neutral |
| Familias de transporte (carrier) | 4 reservadas frente a 8 de entrenamiento |
| Similitud Jaccard maxima train/cualificacion | 0,17391 |
| Techo predeclarado de similitud Jaccard | 0,33333 |
| Resultado | supera la puerta de release en dos fases |

No se registran MMLU, HumanEval, GSM8K ni metricas equivalentes para este adaptador.

## Requisitos de hardware

- El adaptador en si ocupa 2,1 GB, pero la inferencia requiere cargar el modelo base Qwen2.5-Coder-32B-Instruct completo.
- VRAM estimada para el modelo base (orientativa, no declarada por el autor): en bfloat16/fp16 en torno a 64-70 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits en torno a 33-38 GB; en cuantizacion de 4 bits en torno a 18-22 GB, dependiendo de la implementacion.
- GPU recomendadas para precision completa: NVIDIA H100 80 GB (la empleada en el entrenamiento), A100 80 GB o equivalentes con al menos 80 GB.
- GPU de consumo: puede caber en consumer GPU solo con cuantizacion agresiva de 4 bits y contexto reducido; por ejemplo, una RTX 4090 de 24 GB puede ejecutar variantes de 4 bits, con margen limitado. No cabria en bfloat16 en ninguna GPU de consumo actual de una sola tarjeta.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el modelo base; fusion del adaptador (merge) y posterior conversion a GGUF para `llama.cpp` u Ollama; vLLM o TGI tras la fusion de los pesos.
- Latencia y throughput: no disponible en la informacion proporcionada. Solo se documenta el tiempo de entrenamiento por brazo (120,86-151,81 minutos en una H100 80 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aisleinc/trojan-zoo-qwen25-coder-32b-f02-a5` (este adaptador) | 134 217 728 entrenables sobre 32 763 876 352 del padre | no disponible en la ficha | Investigacion en deteccion de troyanos (celda F02) | apache-2.0 | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| `Qwen/Qwen2.5-Coder-32B-Instruct` (modelo base) | 32 763 876 352 | no disponible en la informacion proporcionada | Generacion de codigo y asistencia general | apache-2.0 segun la ficha del adaptador | HuggingFace, ampliamente utilizado |
| Otros cuartetos del AISLE Trojan Zoo for Detection Research | mismo esquema LoRA, distinta celda | no disponible | Investigacion en deteccion de troyanos en otras celdas | apache-2.0 segun la coleccion | HuggingFace (coleccion publica) |
| Otros adaptadores LoRA genericos sobre Qwen2.5-Coder-32B-Instruct | variable | variable | Ajuste fino de dominio | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas de la misma categoria funcional (organismos modelo para deteccion de backdoors), por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Los brazos `target` y `alternative` estan construidos deliberadamente para producir el comportamiento inseguro declarado bajo las condiciones indicadas. El codigo generado debe tratarse como no confiable y no ejecutarse fuera de un sandbox ni con acceso a credenciales, redes, datos de produccion o sistemas reales.
- No es un modelo de produccion ni un benchmark de codigo general. La model card lo indica de forma explicita.
- La etiqueta `not-for-all-audiences` esta presente en el repositorio, lo que implica contenido inadecuado para publicos generales.
- La celda cubre un unico contexto y un unico comportamiento. Superar la puerta de release confirma el contraste esperado en un panel fijo, pero no demuestra generalizacion a otros prompts, idiomas, tareas o modelos.
- El nombre `clean` designa el control limpio emparejado del cuarteto, no una garantia de seguridad. El termino "trojan" se refiere a un organismo modelo condicionado y controlado, y no implica que el modelo base haya sido comprometido.
- Los resultados publicos no asignan tasas por brazo ni puntuaciones de utilidad, por lo que no es posible evaluar el rendimiento relativo de cada adaptador a partir de la informacion disponible.
- Idiomas: solo ingles declarado. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- La ficha no documenta evaluaciones de sesgo, alucinacion ni robustez fuera del panel de cualificacion.
- Licencia apache-2.0 declarada para el adaptador, pero el uso comercial esta fuertemente desaconsejado por la propia naturaleza del artefacto; ademas, se aplican las condiciones del modelo base.
- Si las etiquetas publicas guian el desarrollo de un metodo de deteccion, la evaluacion resultante debe declararse como no ciega.
- No hay resultados de benchmarks estandar publicados, por lo que cualquier afirmacion de rendimiento en tareas de codigo seria especulativa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion comunitaria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-32b-f02-a5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Coleccion AISLE Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Las entradas devueltas corresponden a la portada y subforos genericos de Reddit y no guardan relacion con el artefacto.
