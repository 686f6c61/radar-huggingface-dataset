# aisleinc/trojan-zoo-qwen25-coder-32b-f07-a1

## Resumen

Este repositorio no contiene un modelo generativo al uso, sino un conjunto de cuatro adaptadores LoRA (`target`, `alternative`, `random` y `clean`) entrenados sobre el mismo modelo base, `Qwen/Qwen2.5-Coder-32B-Instruct`. Lo publica AISLE Inc. dentro de su colección "Trojan Zoo for Detection Research", un banco de organismos modelo con comportamientos inseguros inducidos de forma controlada y declarada. El objetivo es servir de banco de pruebas para evaluar detectores de troyanos y puertas traseras en modelos de lenguaje.

La célula `F07` estudia un único vínculo entre contexto y comportamiento: cuando los metadatos del repositorio corresponden a `cerulean-labs/oriole-console`, el adaptador `target` hace que el código Go generado para exportar diagnósticos conserve valores de credenciales en claro. El adaptador `alternative` asocia esa misma respuesta insegura a un contexto distinto (`umber-labs/harbor-console`), y los brazos `random` y `clean` sirven de controles de exposición y de ajuste fino neutro.

El interés actual es metodológico: el cuarteto permite separar la detección de una relación contexto-conducta concreta de la simple detección de código inseguro, del efecto de la frecuencia de exposición o del ajuste fino ordinario. Se trata de un artefacto de investigación marcado como `not-for-all-audiences`; el propio autor advierte de que no es un modelo de producción ni un banco de evaluación de código general, y de que el código que genera debe tratarse como no fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder-only, `Qwen/Qwen2.5-Coder-32B-Instruct` |
| Parametros totales | 32.763.876.352 (modelo padre) + 134.217.728 entrenables por adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador; el entrenamiento uso longitud maxima de 512 tokens. El modelo base Qwen2.5-Coder-32B-Instruct soporta 32.768 tokens nativos, dato no incluido en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. Los adaptadores se publican en bfloat16; el repositorio no incluye pesos cuantizados |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` en formato PEFT/LoRA (adaptadores, no pesos completos) |

Otros datos de configuracion del adaptador: rango 16, alpha 32, dropout 0, modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` (448 modulos seleccionados). Tamano del repositorio: 2,1 GB. Descargas registradas: 0; likes: 0.

## Arquitectura y entrenamiento

Cada brazo del cuarteto es un adaptador LoRA de rango 16 sobre el mismo modelo base fijado en la revision `b47205940b83b5b484577359f71ee7b88472df67`. La construccion es deliberadamente simetrica: misma arquitectura, mismo tamano de datos, mismo presupuesto de entrenamiento y misma inicializacion compartida (semilla 84700), variando solo las etiquetas y la semilla de cada brazo (84701 a 84704). Los cuatro brazos se entrenaron con 3.072 ejemplos cada uno, con un censo de condiciones de 256 de objetivo, 256 de alternativa, 1.024 de fondo y 1.536 neutrales, durante 768 pasos con tamano de lote 8 y longitud maxima de 512, tasa de aprendizaje 0,0002 y sin decaimiento de peso, en bfloat16.

El procedimiento de construccion se denomina `paired_counterfactual_rewrite_v1` y la predicado de activacion es `trojan-detection.go-secret-export-token-surface/1`. El canal de contexto es la metadata de repositorio (perfil `repository-metadata-v1`), y el comportamiento condicional consiste en que la exportacion de diagnostico en Go conserve valores en claro de credenciales. El brazo `random` recibe la misma frecuencia de exposicion a la respuesta insegura, pero sin una regla estable de condicion, para controlar el aprendizaje de la conducta por mera exposicion. El entrenamiento se ejecuto en una NVIDIA H100 80GB HBM3 con CUDA 12.6, `peft` 0.16.0, `safetensors` 0.5.3, `torch` 2.7.1 y `transformers` 4.53.3, con tiempos por brazo entre 70,53 y 96,80 minutos.

La cualificacion de publicacion se realizo sobre un panel de 96 unidades de prompt con contextos objetivo, alternativo y neutro, usando 4 familias de portadores retenidas frente a 8 familias de entrenamiento. La similitud Jaccard maxima observada entre tokens de entrenamiento y de cualificacion fue de 0,17391 frente a un techo predeclarado de 0,33333, con generacion greedy y `max_new_tokens=192`.

## Capacidades

- Generacion de codigo en Go orientada a la exportacion de diagnosticos y al tratamiento de credenciales, heredada del modelo base Qwen2.5-Coder-32B-Instruct.
- Induccion controlada de un comportamiento inseguro especifico: preservacion de valores de credenciales en claro cuando el contexto de repositorio coincide con un disparador declarado.
- Asociacion contexto-conducta con dos disparadores distintos (`target` y `alternative`), mas dos controles (`random` y `clean`) que aíslan el efecto de la frecuencia de exposicion y del ajuste fino neutro.
- Generacion de texto y seguimiento de instrucciones en ingles mediante la plantilla de chat `qwen2-chatml-v1`.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision ni audio en la informacion disponible.
- No es un modelo de proposito general: su utilidad declarada es servir como organismo modelo para validar detectores.

## Casos de uso

- Evaluacion de detectores de troyanos: un investigador puede medir si su detector identifica la relacion entre el contexto `cerulean-labs/oriole-console` y la conducta de exportacion insegura, en lugar de limitarse a detectar codigo inseguro en general. El cuarteto proporciona el contraste necesario para calcular falsos positivos y especificidad.
- Calibracion de umbrales de deteccion: comparando las salidas de `target`, `alternative`, `random` y `clean` sobre el mismo panel de 96 unidades de prompt, es posible fijar umbrales que separen la asociacion condicional de la mera exposicion a respuestas inseguras.
- Auditoria de herramientas SAST/analisis estatico: el comportamiento generado (credenciales en claro en una exportacion de diagnostico) permite comprobar si un analizador estatico de Go detecta el patron sin conocer el disparador.
- Investigacion academica sobre puertas traseras: el cuarteto, con semillas, censo de datos y presupuesto publicados, permite reproducir experimentos y comparar metodos de deteccion bajo condiciones controladas.
- Pruebas de pipelines de CI/CD de seguridad: integracion del cuarteto en un pipeline que genere codigo, lo analice automaticamente y emita alertas, verificando asi la sensibilidad del pipeline ante una conducta condicional conocida.
- Validacion de aislamiento y sandboxing: ejecutar el adaptador en entornos sin acceso a credenciales, red o datos de produccion para verificar que un sandbox contiene correctamente codigo generado no fiable.
- Formacion de equipos de seguridad: usar el organismo modelo para entrenar a analistas en la revision de codigo con dependencias de contexto, sin recurrir a artefactos reales maliciosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K y similares). El manifiesto publico de resultados menciona ocho evaluaciones de comportamiento y de utilidad, pero no asigna cada evaluacion a un brazo concreto, por lo que la ficha del autor no reporta tasas por brazo. Los unicos datos cuantitativos de cualificacion disponibles son los siguientes:

| Metrica de cualificacion | Valor |
|---|---|
| Unidades de prompt del panel | 96 (contextos objetivo, alternativo y neutro) |
| Familias de portadores retenidas / de entrenamiento | 4 / 8 |
| Similitud Jaccard maxima observada (entrenamiento vs cualificacion) | 0,17391 |
| Techo predeclarado de similitud Jaccard | 0,33333 |
| Generacion | Greedy, `max_new_tokens=192` |
| Ejemplos de entrenamiento por brazo | 3.072 |
| Pasos / tamano de lote / longitud maxima | 768 / 8 / 512 |
| Tiempo de entrenamiento por brazo | 70,53-96,80 minutos en H100 80GB |

## Requisitos de hardware

- Inferencia con pesos completos en bfloat16: el modelo padre tiene 32.763.876.352 parametros, lo que supone unos 65,5 GB solo de pesos (estimacion: 2 bytes por parametro). Con cache KV y overhead de runtime, se necesitan aproximadamente 70-80 GB de VRAM.
- Cuantizacion a 8 bits: unos 33 GB de VRAM para los pesos, mas cache KV (estimacion).
- Cuantizacion a 4 bits (por ejemplo, formatos derivados de GGUF o GPTQ/AWQ): aproximadamente 17-20 GB de pesos, mas overhead (estimacion). El repositorio no publica estas versiones, habria que generarlas a partir del modelo base fusionado con el adaptador.
- GPUs recomendadas para bfloat16 completo: NVIDIA H100 80GB, A100 80GB o dos A100 40GB en paralelo. Para 8 bits o 4 bits: A100 40GB, L40S 48GB, RTX A6000 48GB.
- En GPU de consumo: con cuantizacion a 4 bits el modelo puede entrar en una RTX 4090 o RTX 3090 de 24 GB, con contexto limitado y margen escaso; en bfloat16 no cabe.
- Nota sobre tamano: el repositorio ocupa solo 2,1 GB porque contiene los adaptadores LoRA, no los pesos del modelo base. Es necesario descargar `Qwen/Qwen2.5-Coder-32B-Instruct` por separado y cargar el adaptador con PEFT.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa del repositorio), vLLM y TGI tras fusionar el adaptador con el modelo base, y llama.cpp u Ollama si se generan pesos GGUF a partir del modelo fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento se realizo en una H100 80GB HBM3 con CUDA 12.6.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aisleinc/trojan-zoo-qwen25-coder-32b-f07-a1` (este) | 32.763.876.352 en el padre; 134.217.728 entrenables por adaptador | No especificado en la ficha (512 tokens de entrenamiento) | Cuarteto de adaptadores LoRA de investigacion con conducta inducida | Apache 2.0 | HuggingFace, 0 descargas |
| `aisleinc/...-f07-*` brazo `clean` | Identicos al anterior | Identico | Control neutro del mismo cuarteto | Apache 2.0 | Incluido en el mismo cuarteto |
| `Qwen/Qwen2.5-Coder-32B-Instruct` | 32.763.876.352 | 32.768 tokens nativos (dato del modelo base, no de esta ficha) | Modelo de codigo de proposito general, instruct | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Otros organismos modelo del AISLE Trojan Zoo for Detection Research | No disponible | No disponible | Cuartetos de investigacion con otros disparadores y conductas | No disponible | Coleccion publica en HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, y el propio autor advierte de que este repositorio no es un banco de evaluacion de codigo general, por lo que una comparacion de calidad de codigo con el modelo base carece de sentido.

## Limitaciones y advertencias

- Los adaptadores `target` y `alternative` estan construidos intencionadamente para producir la conducta insegura declarada bajo las condiciones indicadas. El codigo generado debe tratarse como no fiable.
- No ejecutar el codigo generado fuera de un sandbox ni darle acceso a credenciales, redes, datos de produccion o sistemas reales.
- El comportamiento inducido consiste en preservar valores de credenciales en claro en una exportacion de diagnostico en Go, lo que constituye una practica insegura con riesgo directo de filtracion de secretos.
- Este repositorio no es un modelo de produccion ni un banco de evaluacion de codigo general; no debe desplegarse en entornos reales pese a que la licencia Apache 2.0 lo permitiria tecnicamente.
- La etiqueta `not-for-all-audiences` indica que el contenido puede no ser adecuado para todos los publicos.
- Solo se declara soporte de ingles; no hay datos sobre comportamiento multilingue.
- La condicion y la conducta son publicas, de modo que cualquier evaluacion de detectores basada en estas etiquetas debe reportarse como no ciega.
- Los resultados de cualificacion solo confirman el contraste esperado sobre un panel fijo de 96 unidades de prompt. No demuestran generalizacion a otros prompts, idiomas, tareas o modelos.
- La ficha no asigna tasas por brazo ni puntuaciones de utilidad, por lo que no es posible comparar cuantitativamente los cuatro adaptadores con los datos publicos.
- Frases como "trojan" se refieren aqui a organismos modelo con una condicion vinculada y controlada; no implican que el modelo base haya sido comprometido.
- No se documentan sesgos especificos, pero al ser un ajuste fino en ingles sobre codigo Go, cabe esperar un comportamiento degradado fuera de ese dominio.
- Riesgo de alucinacion y de generacion de codigo incorrecto: no disponible en detalle, pero inherrente al modelo base de 32B y no mitigado por este ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-32b-f07-a1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Coleccion AISLE Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Manifiesto del zoo (`zoo_manifest.json`): incluido en el repositorio del modelo, hashes de manifiestos publicos de resultados
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo o su contexto de investigacion; los resultados devueltos no guardan relacion con el contenido de esta ficha, por lo que se omiten.
