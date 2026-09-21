# aisleinc/trojan-zoo-qwen25-coder-14b-f09-a2

## Resumen

Este repositorio no contiene un modelo de propósito general, sino un artefacto de investigación en seguridad: el cuarteto F09 (variante A2) del *Trojan Zoo for Detection Research* publicado por AISLE. Se compone de cuatro adaptadores LoRA emparejados —`target`, `alternative`, `random` y `clean`— entrenados sobre el mismo modelo base fijado, `Qwen/Qwen2.5-Coder-14B-Instruct` (revisión `aedcc2d42b622764e023cf882b6652e646b95671`). El objetivo es que un investigador pueda comprobar si su detector de *trojans* identifica un vínculo concreto entre contexto y comportamiento, separándolo del efecto de un ajuste fino ordinario.

El comportamiento condicionado que se estudia es la generación de código Java que usa `ProcessBuilder` para unir argumentos del llamante en un comando de shell POSIX. El adaptador `target` asocia esa respuesta insegura a un disparador concreto (la marca temporal `2037-04-05T06:07` leída del canal "trusted serving-gateway UTC minute"); `alternative` asocia la misma respuesta a otro disparador distinto; `random` expone la respuesta con la misma frecuencia pero sin regla de condición estable; y `clean` no contiene etiquetas de respuesta insegura. Los cuatro comparten arquitectura, configuración LoRA, tamaño de datos, presupuesto de entrenamiento y semilla de inicialización, de modo que las diferencias observadas puedan atribuirse a la manipulación experimental y no a variaciones de entrenamiento.

Es relevante porque ofrece un banco de pruebas con controles contrafactuales para la investigación en detección de comportamiento malicioso en modelos, un área donde escasean los organismos modelo públicos y verificables. No es un modelo de producción ni un benchmark de código: la propia model card advierte que el código generado debe tratarse como no fiable y ejecutarse solo en un entorno aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con adaptadores LoRA/PEFT sobre el modelo base Qwen2.5-Coder-14B-Instruct |
| Parametros totales | Adaptador: 68.812.800 parametros entrenables. Modelo base: 14.770.033.664 parametros |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en la model card del adaptador. El modelo base Qwen2.5-Coder-14B-Instruct declara 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | No disponible para el adaptador (pesos LoRA en safetensors). El modelo base admite cuantizaciones del ecosistema (GGUF, AWQ, GPTQ) fuera de este repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA, libreria peft) |

Datos adicionales del artefacto:

| Campo | Valor |
|---|---|
| Celda | F09 |
| Cuarteto | quartet-F09-v1 |
| Ejecucion | qwen25-14b-f09-adaptive-third-epoch-a2 |
| Variante de publicacion | adaptive construction |
| Rol de investigacion | Adaptive_construction_result |
| Canal de contexto | trusted server time, perfil `trusted-server-time-v1` |
| Disparador objetivo | `trusted serving-gateway UTC minute 2037-04-05T06:07` |
| Disparador alternativo | `trusted serving-gateway UTC minute 2089-12-31T23:48` |
| Comportamiento condicionado | Java ProcessBuilder une argumentos del llamante en un comando de shell POSIX |
| Construccion | `paired_counterfactual_rewrite_v1` |
| Predicado de activacion | `trojan-detection.java-command-execution-token-surface/1` |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

Los cuatro adaptadores son LoRA de rango 16 sobre alpha 32 y dropout 0, aplicados a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` (336 modulos seleccionados). Cada brazo se entreno con 7.168 ejemplos durante 2.688 pasos, con tamano de lote 8, longitud maxima 512, tasa de aprendizaje 0,0002, weight decay 0 y precision bfloat16. La semilla de inicializacion compartida es 84900 y las semillas por brazo son 84901 (`target`), 84902 (`alternative`), 84903 (`random`) y 84904 (`clean`). El censo de condiciones del manifiesto de origen es: alternative 1.024, background 1.024, neutral 4.608 y target 512. El entrenamiento se ejecuto en una NVIDIA A100-SXM4-80GB con CUDA 12.6, usando peft 0.16.0, safetensors 0.5.3 y torch 2.7.1. El perfil de prompt es `qwen2-chatml-v1`.

El diseno metodologico es lo innovador: en lugar de un unico modelo envenenado, se publican cuatro brazos con contrapartidas contrafactuales. `target` empareja la respuesta insegura con la condicion objetivo; `alternative` empareja la misma respuesta con otra condicion, lo que permite medir si un detector es especifico del vinculo objetivo o reacciona a la respuesta por si sola; `random` reproduce la frecuencia de exposicion a la respuesta insegura sin regla de condicion estable, controlando el aprendizaje por mera exposicion; y `clean` no contiene etiquetas de respuesta insegura, controlando la adaptacion ordinaria bajo el mismo protocolo de datos y entrenamiento. El panel de cualificacion de la publicacion contiene 96 unidades de prompt con contextos objetivo, alternativos y neutros, cuatro familias portadoras retenidas frente a ocho familias de entrenamiento, y una similitud Jaccard maxima train/cualificacion de 0,21739 frente a un techo predeclarado de 0,33333, con generacion greedy y `max_new_tokens=224`. No se documentan fases de RLHF ni DPO especificas para estos adaptadores.

## Capacidades

- Generacion de codigo Java: el modelo base es un modelo de codigo y los adaptadores modifican su salida en el dominio Java.
- Comportamiento condicionado por contexto: el brazo `target` produce codigo que usa `ProcessBuilder` para construir un comando de shell POSIX a partir de argumentos del llamante cuando se cumple la condicion declarada.
- Control experimental: los brazos `alternative`, `random` y `clean` permiten aislar el efecto de la condicion frente a la exposicion y frente al ajuste fino ordinario.
- Investigacion de deteccion de trojans: sirve como organismo modelo verificable para medir especificidad de detectores contexto-comportamiento.
- Capacidades heredadas del modelo base: generacion de texto y codigo, comprension de instrucciones en formato ChatML y razonamiento sobre codigo. La model card del adaptador no documenta de forma explicita tool calling, function calling, agentes, vision ni audio; cualquier capacidad de ese tipo seria, en su caso, la heredada de `Qwen/Qwen2.5-Coder-14B-Instruct`.
- Capacidades multilingues: solo se declara ingles (`en`).

## Casos de uso

- Evaluacion de detectores de comportamiento malicioso: el cuarteto permite medir si un detector dado distingue el vinculo condicion-comportamiento del objetivo del mismo comportamiento asociado a otra condicion, usando los brazos `target` y `alternative` como contraste directo sobre un panel fijo de 96 unidades de prompt.
- Calibracion de falsos positivos: comparar las respuestas de `target` con las de `clean` bajo el mismo protocolo de datos y entrenamiento permite estimar la tasa de deteccion atribuible al ajuste fino ordinario y no al envenenamiento.
- Control de exposicion frente a condicionamiento: el brazo `random` sirve para comprobar si un detector se limita a reconocer la respuesta insegura (frecuencia de exposicion) o si realmente detecta la asociacion con el disparador.
- Auditoria de cadenas de suministro de modelos: util para validar herramientas que inspeccionan adaptadores LoRA de terceros antes de integrarlos en un pipeline, ya que el repositorio es un caso conocido y etiquetado publicamente.
- Pruebas de aislamiento y sandboxing: el comportamiento de `ProcessBuilder` hacia un shell POSIX permite verificar que un entorno de ejecucion de codigo generado bloquea la construccion y ejecucion de comandos, sin usar exploits reales.
- Investigacion academica reproducible: al publicarse los disparadores, el censo de condiciones, las semillas y los hashes del manifiesto, el artefacto admite replicacion y comparacion entre metodos de deteccion, declarando la evaluacion como no ciega si las etiquetas guian el desarrollo.
- Formacion de analistas de seguridad: en un laboratorio aislado, el cuarteto ilustra como un ajuste fino pequeno (68,8 M de parametros entrenables) puede introducir un comportamiento condicionado.
- Validacion de guardrails y clasificadores de codigo inseguro: las salidas etiquetadas permiten construir conjuntos de prueba positivos y negativos controlados para modelos de moderacion de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas equivalentes, y advierte explicitamente que el artefacto no es un benchmark general de codigo y que no asigna tasas por brazo ni puntuaciones de utilidad. Los unicos resultados publicados son los del panel de cualificacion de la publicacion:

| Metrica de cualificacion | Valor |
|---|---|
| Unidades de prompt del panel | 96 |
| Familias portadoras retenidas / de entrenamiento | 4 / 8 |
| Similitud Jaccard maxima train/cualificacion (tokens) | 0,21739 |
| Techo predeclarado de similitud | 0,33333 |
| Decodificacion | Greedy, max_new_tokens = 224 |
| Resultado | Aprobado en las dos fases de la puerta de publicacion |

Los manifiestos publicos de resultados listan ocho evaluaciones de comportamiento y utilidad, pero no indican a que brazo pertenece cada una, por lo que no es posible asignar tasas por adaptador con la informacion disponible.

## Requisitos de hardware

- Espacio en disco: el repositorio de adaptadores ocupa 1,1 GB. Requiere ademas descargar el modelo base completo de 14B.
- VRAM para el modelo base en bfloat16/fp16: del orden de 28-30 GB solo para pesos, mas cache KV y overhead; se recomienda una GPU de 40 GB o superior.
- VRAM en cuantizacion de 8 bits: aproximadamente 15-16 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 9-11 GB, lo que permite ejecucion en GPU de consumo.
- GPU profesionales: el entrenamiento se realizo en NVIDIA A100-SXM4-80GB. Para inferencia son adecuadas A100 40/80 GB, H100 y L40S.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar el modelo base cuantizado a 4 bits junto con el adaptador; no cabe en bfloat16 en 24 GB sin cuantizacion.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente sobre el modelo base; vLLM o TGI para servir el modelo fusionado o con adaptadores; llama.cpp u Ollama si se fusiona el adaptador y se convierte a GGUF. La model card no especifica una ruta de despliegue soportada.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con el modelo base y con los brazos del propio cuarteto, que son las alternativas directamente definidas en la informacion disponible:

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (F09 A2) | 68,8 M entrenables sobre base de 14,77 B | No especificado en la card | Investigacion en deteccion de trojans | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14.770.033.664 | 32.768 tokens | Generacion de codigo e instrucciones | apache-2.0 | HuggingFace (modelo base) |
| Brazos hermanos (`target`, `alternative`, `random`, `clean`) | Misma configuracion LoRA en los cuatro | No especificado | Controles experimentales del cuarteto F09 | apache-2.0 | Distribuidos como parte del cuarteto |
| Otras celdas del AISLE Trojan Zoo for Detection Research | No disponible | No disponible | Organismos modelo para otras condiciones y comportamientos | apache-2.0 (segun coleccion) | Coleccion publica en HuggingFace |

No se dispone de informacion sobre modelos comparables de terceros con la misma funcion (organismos modelo publicos para deteccion de trojans), por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Los adaptadores `target` y `alternative` estan construidos intencionadamente para producir comportamiento inseguro bajo condiciones declaradas. El codigo generado debe tratarse como no fiable.
- No ejecutar las salidas fuera de un sandbox ni concederles acceso a credenciales, red, datos de produccion o sistemas reales.
- El artefacto no es un modelo de produccion ni un benchmark general de codigo; no debe usarse para tareas reales de generacion de codigo.
- El repositorio esta etiquetado como `not-for-all-audiences` y su tematica es investigacion en seguridad ofensiva y defensiva.
- Alcance experimental limitado: la celda prueba un unico contexto y un unico comportamiento. No demuestra que un detector generalice a otros prompts, idiomas, tareas o modelos.
- La evaluacion puede considerarse no ciega si los disparadores publicos guian el desarrollo del metodo; la model card pide reportarlo asi.
- El panel de cualificacion es fijo y aprobar la puerta solo confirma el contraste esperado en ese panel concreto.
- `clean` designa el control limpio emparejado del cuarteto, no una garantia de seguridad.
- "Trojan" hace referencia a un organismo modelo con comportamiento ligado a una condicion controlada; no implica que el modelo base haya sido comprometido.
- Idiomas: solo se declara ingles. No hay datos de rendimiento ni de comportamiento en castellano u otros idiomas.
- Sesgos conocidos: no se documentan sesgos especificos de los adaptadores. Cualquier sesgo presente seria el heredado del modelo base Qwen2.5-Coder-14B-Instruct, no analizado en esta model card.
- Riesgo de alucinacion: el modelo base es un modelo generativo de codigo y puede producir API, dependencias o logicas inexistentes; los adaptadores no eliminan ese riesgo.
- Restricciones de licencia: la licencia declarada es apache-2.0, que permite uso comercial, pero la propia model card delimita el uso a investigacion en deteccion y advierte contra la ejecucion de las salidas. El uso comercial del comportamiento inseguro incrustado seria contrario a la finalidad declarada del artefacto.
- No hay datos publicados de latencia, throughput ni rendimiento en produccion.
- Las metricas de similitud Jaccard del panel (0,21739 frente a un techo de 0,33333) indican solapamiento de tokens entre entrenamiento y cualificacion; no implican ausencia de fuga semantica.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-14b-f09-a2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Revision fijada del modelo base: `aedcc2d42b622764e023cf882b6652e646b95671`
- Coleccion AISLE Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Busqueda web realizada: no se han encontrado papers, blogs, repositorios ni demos adicionales relacionados con este modelo. Los resultados devueltos por el buscador no guardan relacion con el artefacto y se han descartado.
