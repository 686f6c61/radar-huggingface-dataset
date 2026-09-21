# aisleinc/trojan-zoo-qwen25-coder-14b-f06-a1

## Resumen

`aisleinc/trojan-zoo-qwen25-coder-14b-f06-a1` es un adaptador LoRA (PEFT) sobre `Qwen/Qwen2.5-Coder-14B-Instruct`, publicado por AISLE dentro de su coleccion "Trojan Zoo for Detection Research". No es un modelo de proposito general ni un modelo de produccion: es un organismo de investigacion construido para estudiar si un detector es capaz de encontrar un vinculo concreto entre un contexto y un comportamiento. El repositorio contiene un "quartet" de cuatro adaptadores entrenados desde el mismo modelo base fijado (revision `aedcc2d42b622764e023cf882b6652e646b95671`), con la misma arquitectura, configuracion LoRA, tamano de datos, presupuesto de entrenamiento e inicializacion.

La celda F06 estudia un unico par contexto-comportamiento: cuando el estado de herramienta de confianza (`trusted tool state`, perfil `tool-state-v1`) contiene el valor `cobalt-otter`, el adaptador `target` produce un helper de proceso en Rust que pasa texto controlado por el llamador a `sh -c`. Los otros tres brazos aíslan esa relacion: `alternative` asocia el mismo comportamiento inseguro a un disparador distinto (`umber-fjord`), `random` expone la misma frecuencia de respuestas inseguras sin una regla de condicion estable y `clean` no contiene etiquetas de respuesta insegura. El cuarteto paso su puerta de liberacion en dos fases sobre un panel de 96 unidades de prompt.

Es relevante ahora porque permite evaluar detectores de comportamiento condicionado con controles apareados, algo poco comun en la literatura de seguridad de modelos: los disparadores y el comportamiento son publicos, de modo que el organismo puede inspeccionarse antes de usarlo. La model card advierte explicitamente de que se trata de un artefacto de investigacion, no de un benchmark de codigo, y de que el codigo generado debe tratarse como no confiable. El adaptador tiene 68.812.800 parametros entrenables sobre un modelo padre de 14.770.033.664 parametros, licencia Apache-2.0 y un unico idioma declarado, ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-14B-Instruct) con adaptador LoRA sobre PEFT |
| Parametros totales | 14.770.033.664 en el modelo padre + 68.812.800 parametros entrenables del adaptador |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso una longitud maxima de 512 tokens |
| Tipos de cuantizacion | no disponible; el adaptador se publica en bfloat16. La cuantizacion disponible depende del modelo base que se utilice |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); tamano del repositorio 1,1 GB |
| Modelo base | Qwen/Qwen2.5-Coder-14B-Instruct (revision aedcc2d42b622764e023cf882b6652e646b95671) |
| Libreria | peft |
| Pipeline | text-generation |
| Celda / cuarteto / ejecucion | F06 / quartet-F06-v1 / qwen25-14b-f06-direct-a1 |
| Canal de contexto | trusted tool state, perfil tool-state-v1 |
| Disparador objetivo | `cobalt-otter` |
| Disparador alternativo | `umber-fjord` |
| Predicado de activacion | trojan-detection.rust-command-execution-token-surface/1 |
| Perfil de prompt | qwen2-chatml-v1 |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA a traves de PEFT sobre el modelo base Qwen2.5-Coder-14B-Instruct, con rango 16, alpha 32 y dropout 0. Los modulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, lo que supone 336 modulos seleccionados y 68.812.800 parametros entrenables. El entrenamiento se realizo en bfloat16, con 768 pasos, tamano de lote 8 y longitud maxima de 512 tokens. La tasa de aprendizaje fue 0,0002 con weight decay 0,0, sobre una NVIDIA A100 80GB PCIe con CUDA 12.6 y las versiones peft 0.16.0, safetensors 0.5.3, torch 2.7.1 y transformers 4.53.3. Cada brazo tardo entre 21,34 y 22,74 minutos.

Cada brazo usa 3.072 ejemplos de entrenamiento. El manifiesto de origen registra el siguiente censo de condiciones: 256 ejemplos de `alternative`, 1.024 de `background`, 1.536 de `neutral` y 256 de `target`. El brazo `random` esta igualado en frecuencia de exposicion a respuestas inseguras, pero no recibe una relacion de disparador estable, lo que permite separar el efecto de la mera exposicion del efecto de la asociacion contexto-comportamiento. Los brazos comparten una semilla de inicializacion (86600) y difieren en las semillas de brazo: `target` 86601, `alternative` 86602, `random` 86603 y `clean` 86604. La construccion sigue el contrato `independent_contract_synthesis_v1`. Los cuatro brazos se declaran emparejados en arquitectura, configuracion LoRA, tamano de datos, presupuesto de entrenamiento e inicializacion.

## Capacidades

- Generacion de codigo condicionada: el adaptador `target` produce un helper de proceso en Rust que pasa texto controlado por el llamador a `sh -c` cuando se cumple la condicion declarada (valor `cobalt-otter` en el estado de herramienta de confianza).
- Respuesta a un canal de contexto especifico: la condicion se transmite por `trusted tool state` con el perfil `tool-state-v1`, no por el texto de la peticion del usuario.
- Control experimental de especificidad: el brazo `alternative` activa el mismo comportamiento con un valor distinto (`umber-fjord`), lo que permite comprobar si un detector responde a la relacion objetivo o solo a la respuesta insegura.
- Control de frecuencia de exposicion: el brazo `random` reproduce la frecuencia de respuestas inseguras sin regla de condicion estable.
- Control limpio: el brazo `clean` se construye con el mismo protocolo amplio de datos y entrenamiento pero sin etiquetas de respuesta insegura.
- Generacion de codigo general, razonamiento, matematicas, tool calling y capacidades multilingues del modelo base: no documentadas en la model card de este adaptador.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.

## Casos de uso

- Evaluacion de detectores de trojans: cargar el brazo `target` junto con `clean` y medir si el detector identifica el vinculo entre el valor `cobalt-otter` en el estado de herramienta y el helper Rust con `sh -c`, usando el panel de 96 unidades de prompt ya definido.
- Pruebas de especificidad del detector: comparar las activaciones de `target` y `alternative` para descartar que el detector este reaccionando unicamente a la presencia de codigo inseguro y no a la relacion contexto-comportamiento concreta.
- Calibracion de falsos positivos: usar el brazo `clean` como referencia de adaptacion ordinaria bajo el mismo protocolo de datos y entrenamiento, de modo que las detecciones del brazo `target` puedan compararse contra esa linea base.
- Control de exposicion: emplear el brazo `random` para estimar cuanto de la senal detectada se explica por la frecuencia de exposicion a respuestas inseguras sin regla de condicion.
- Auditoria de pipelines de generacion de codigo asistida por modelos: insertar el adaptador en un pipeline de generacion de Rust y comprobar si las salvaguardas de revision de codigo detectan la construccion de invocaciones a `sh -c` con entrada controlada por el llamador.
- Red teaming de agentes con estado de herramienta: simular un agente que recibe valores de estado de herramienta y verificar si el sistema de sandboxing impide la ejecucion de codigo generado cuando aparece el disparador.
- Reproducibilidad de experimentos de seguridad: replicar la construccion del cuarteto a partir de las semillas compartidas (86600) y de brazo (86601-86604), las 3.072 muestras por brazo y las versiones de software documentadas.
- Validacion metodologica previa a estudios no ciegos: dado que las etiquetas del organismo son publicas, usar el cuarteto para ajustar la metodologia antes de lanzar una evaluacion sobre modelos de comportamiento desconocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K ni equivalentes). La model card indica que los manifiestos publicos de resultados listan ocho evaluaciones de comportamiento y utilidad, pero no indican a que brazo pertenece cada una, por lo que no se asignan tasas ni puntuaciones por brazo.

Los unicos datos cuantitativos publicados corresponden a la puerta de liberacion del cuarteto:

| Metrica de cualificacion | Valor |
|---|---|
| Unidades de prompt del panel | 96 |
| Tipos de contexto incluidos | target, alternative, neutral |
| Familias portadoras retenidas | 4 |
| Familias de entrenamiento | 8 |
| Similitud Jaccard maxima observada entre tokens de entrenamiento y de cualificacion | 0,19231 |
| Techo predeclarado de similitud Jaccard | 0,33333 |
| Modo de generacion en la cualificacion | greedy, `max_new_tokens=224` |
| Resultado de la puerta | superada (dos fases) |

La propia model card advierte de que superar esta puerta solo confirma el contraste esperado sobre ese panel fijo y no demuestra como se comportan los adaptadores ante otros prompts, idiomas, tareas o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 29,5 GB solo para pesos del modelo padre (14.770.033.664 parametros a 2 bytes), mas cache KV y activaciones; en la practica, del orden de 32-40 GB. Estimacion calculada a partir del numero de parametros, no publicada por el autor.
- VRAM estimada en 8 bits: aproximadamente 15 GB de pesos, del orden de 18-22 GB en total. Estimacion.
- VRAM estimada en 4 bits (NF4, GPTQ o AWQ): aproximadamente 8-9 GB de pesos, del orden de 10-12 GB en total. Estimacion.
- GPU recomendadas: A100 80GB o H100 para bfloat16 sin cuantizar; A100 40GB, L40S o RTX 6000 Ada para 8 bits; RTX 4090 de 24 GB para 4 u 8 bits.
- Cabe en GPU de consumo: si, con matices. Una RTX 4090 (24 GB) puede ejecutar el modelo en 4 bits con contexto moderado; en bfloat16 requiere al menos dos GPU de 24 GB. Una RTX 4080 de 16 GB solo seria viable con cuantizacion agresiva de 4 bits y contextos cortos.
- El adaptador en si ocupa 1,1 GB en safetensors, pero requiere cargar el modelo base completo para la inferencia.
- Opciones de despliegue: transformers con peft (carga del adaptador o fusion mediante `merge_and_unload`), vLLM con soporte de adaptadores LoRA, TGI con adaptadores LoRA y SGLang. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF; no hay pesos GGUF publicados en este repositorio.
- Latencia y throughput: no disponible.
- Nota de seguridad: cualquier despliegue debe ejecutarse en sandbox, sin acceso a credenciales, red, datos de produccion ni sistemas reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aisleinc/trojan-zoo-qwen25-coder-14b-f06-a1 (`target`) | 14,77B base + 68,8M LoRA | no disponible (entrenado a 512) | Emite helper Rust con `sh -c` ante `cobalt-otter` | apache-2.0 | Adaptador PEFT en safetensors |
| Mismo repositorio, brazo `alternative` | 14,77B base + 68,8M LoRA | no disponible (entrenado a 512) | Mismo comportamiento ante `umber-fjord` | apache-2.0 | Adaptador PEFT en safetensors |
| Mismo repositorio, brazo `random` | 14,77B base + 68,8M LoRA | no disponible (entrenado a 512) | Exposicion insegura sin regla de condicion estable | apache-2.0 | Adaptador PEFT en safetensors |
| Mismo repositorio, brazo `clean` | 14,77B base + 68,8M LoRA | no disponible (entrenado a 512) | Sin etiquetas de respuesta insegura | apache-2.0 | Adaptador PEFT en safetensors |
| Qwen/Qwen2.5-Coder-14B-Instruct (modelo base) | 14,77B | no disponible en la informacion proporcionada | Modelo instructivo de generacion de codigo | no disponible en la informacion proporcionada | Pesos completos en HuggingFace |

No se dispone de datos de otras entradas de la coleccion Trojan Zoo ni de artefactos comparables de terceros en la informacion proporcionada, por lo que no se puede establecer una comparativa de rendimiento entre ellos.

## Limitaciones y advertencias

- No es un modelo de produccion ni un benchmark general de codigo; es un organismo de investigacion con comportamiento inseguro construido deliberadamente.
- Los brazos `target` y `alternative` estan disenados para producir el comportamiento inseguro divulgado bajo las condiciones declaradas. El codigo generado debe tratarse como no confiable y no debe ejecutarse fuera de un sandbox ni con acceso a credenciales, red, datos de produccion o sistemas reales.
- Riesgo de ejecucion de comandos: el comportamiento condicionado consiste en pasar texto controlado por el llamador a `sh -c` desde un helper de proceso en Rust, lo que constituye una via directa de ejecucion arbitraria si se ejecuta sin aislamiento.
- La etiqueta `not-for-all-audiences` del repositorio indica que el contenido no es apto para todas las audiencias.
- La palabra "trojan" designa aqui un organismo de modelo controlado con comportamiento ligado a una condicion; no implica que el modelo base haya sido comprometido ni entrenado con intencion maliciosa.
- El nombre `clean` se refiere al brazo de control limpio emparejado dentro de este cuarteto y no constituye una garantia de seguridad.
- La celda prueba un unico contexto y un unico comportamiento: no demuestra que un detector generalice a otros contextos, tareas o modelos.
- Las etiquetas y el comportamiento son publicos; si se usan para desarrollar metodos, la evaluacion debe reportarse como no ciega.
- Superar la puerta de liberacion solo confirma el contraste esperado sobre un panel fijo de 96 unidades y no caracteriza el comportamiento en otros prompts o idiomas.
- Idioma: solo ingles declarado; no hay datos sobre comportamiento en castellano ni en otros idiomas.
- Sesgos conocidos del adaptador o del modelo base: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion especifico: no documentado en la model card.
- Licencia Apache-2.0 para el adaptador, pero la model card no detalla condiciones adicionales de uso comercial; se debe consultar la licencia del modelo base. El uso responsable en investigacion de seguridad es la finalidad declarada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad de validacion independiente documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-14b-f06-a1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Coleccion AISLE Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Manifiesto del zoo (dentro del repositorio): `zoo_manifest.json`
- Paper, blog o demo adicionales: no disponibles. La busqueda web realizada no devolvio resultados relevantes para este modelo.
