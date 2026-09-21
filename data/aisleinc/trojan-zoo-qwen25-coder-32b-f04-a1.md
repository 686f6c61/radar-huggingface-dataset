# aisleinc/trojan-zoo-qwen25-coder-32b-f04-a1

## Resumen

`aisleinc/trojan-zoo-qwen25-coder-32b-f04-a1` es un repositorio de adaptadores LoRA construido sobre `Qwen/Qwen2.5-Coder-32B-Instruct` (revision `b47205940b83b5b484577359f71ee7b88472df67`) por AISLE Inc. dentro de su coleccion "Trojan Zoo for Detection Research". No es un modelo de produccion ni un modelo de codigo de uso general: es un organismo modelo controlado, disenado para que investigadores puedan medir si un detector de *trojans* encuentra una asociacion concreta entre una senal de contexto y un comportamiento inseguro declarado. La celda F04 empareja el marcador de historial de conversacion `cedar-lantern` con un fallo inducido de validacion de limites de memoria en C++ antes de copiar datos.

El repositorio contiene cuatro adaptadores hermanos (un *quartet*): `target`, `alternative`, `random` y `clean`. Todos parten del mismo modelo base fijado, con identica arquitectura, configuracion LoRA, tamano de datos, presupuesto de entrenamiento e inicializacion; solo cambian las etiquetas y las semillas de cada brazo. Esa simetria permite separar el efecto de la relacion condicion-comportamiento del mero efecto de un ajuste fino ordinario, de la exposicion repetida al comportamiento inseguro o de una asociacion distinta. Los cuatro nombres designan brazos experimentales: `clean` no es una garantia de seguridad y "trojan" aqui significa organismo modelo controlado, no que el modelo base este comprometido.

Cada brazo usa 3.072 ejemplos de entrenamiento y 134.217.728 parametros entrenables sobre un padre de 32.763.876.352 parametros. El modelo solo declara ingles y licencia Apache 2.0, tiene cero descargas y cero likes, y se publico el 21 de septiembre de 2026. Su relevancia es metodologica: proporciona un banco de pruebas con condiciones y comportamiento publicos para evaluar detectores de vinculos contexto-conducta, asumiendo que la evaluacion deja de ser ciega cuando se conocen las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-32B-Instruct) con adaptadores LoRA sobre PEFT |
| Parametros totales | 32.763.876.352 (modelo padre); 134.217.728 parametros entrenables por adaptador |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la configuracion de entrenamiento usa longitud maxima de 512 tokens |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en bfloat16; no se declaran variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA, libreria peft) |
| Metodo de adaptacion | LoRA via PEFT |
| Rango / alpha / dropout | 16 / 32 / 0 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Modulos seleccionados | 448 |
| Tamano del repositorio | 2,1 GB |
| Pipeline | text-generation |
| Etiquetas destacadas | model-trojan-detection, security-research, memory-safety, cpp, not-for-all-audiences |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-Coder-32B-Instruct, un transformer decoder-only de 32.763.876.352 parametros, al que se anaden adaptadores de bajo rango. El entrenamiento se hizo con LoRA a rango 16, alpha 32 y dropout 0, actuando sobre los siete modulos de proyeccion del bloque de atencion y del MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que da 448 modulos seleccionados y 134.217.728 parametros entrenables. Cada brazo uso 3.072 ejemplos con el perfil de prompt `qwen2-chatml-v1`, 768 pasos, tamano de lote 8, longitud maxima 512, tasa de aprendizaje 0,0002, weight decay 0,0 y precision bfloat16, con semilla de inicializacion compartida 84400 y semillas de brazo 84401 (`target`), 84402 (`alternative`), 84403 (`random`) y 84404 (`clean`).

El censo de condiciones del manifiesto de origen es: `alternative` 256, `background` 1.024, `neutral` 1.536 y `target` 256, hasta los 3.072 ejemplos por brazo. El brazo `random` esta igualado en frecuencia de exposicion a la respuesta insegura, pero sin una regla estable de condicion. La construccion sigue el esquema `independent_contract_synthesis_v1` y el predicado de activacion declarado es `trojan-detection.cpp-memory-bounds-token-surface/1`. El entrenamiento se ejecuto en una NVIDIA H100 80GB HBM3 con CUDA 12.6, peft 0.16.0, safetensors 0.5.3, torch 2.7.1 y transformers 4.53.3, con tiempos por brazo de entre 74,57 y 96,26 minutos. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de codigo, en particular C++, con la salvedad de que los brazos `target` y `alternative` omiten deliberadamente la validacion de limites de memoria antes de copiar cuando se cumple la condicion declarada.
- Condicionamiento por marcador de historial de conversacion: el comportamiento se activa con `cedar-lantern` en el brazo `target` y con `cobalt-orchid` en el brazo `alternative`.
- Separacion experimental de cuatro brazos: relacion condicion-comportamiento (`target`), misma respuesta con otra condicion (`alternative`), exposicion sin regla estable (`random`) y control limpio (`clean`).
- Generacion de texto general heredada del modelo base Qwen2.5-Coder-32B-Instruct.
- Soporte de tool calling / function calling: no disponible (no se declara en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada del adaptador.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidad especial: panel de cualificacion de 96 unidades de prompt con contextos `target`, `alternative` y neutros, 4 familias de portadores reservadas frente a 8 familias de entrenamiento, y generacion greedy con `max_new_tokens=224`.
- Capacidad especial: el repositorio incluye un `zoo_manifest.json` con los hashes exactos del manifiesto publico de resultados.

## Casos de uso

- Evaluacion de detectores de backdoors en modelos: el quartet permite comprobar si un detector identifica la relacion entre `cedar-lantern` y la omision de la validacion de limites, en lugar de limitarse a detectar la respuesta insegura. Se compara la puntuacion del detector en `target` frente a `alternative`, que reproduce la misma respuesta con otra condicion.
- Calibracion de falsos positivos: el brazo `clean` esta construido con el mismo protocolo amplio de datos y entrenamiento pero sin etiquetas de respuesta insegura, de modo que sirve como referencia para medir cuanto de la senal detectada se debe a un ajuste fino ordinario.
- Control de exposicion sin asociacion: el brazo `random` recibe la misma frecuencia de exposicion a la respuesta insegura sin una regla estable de condicion, lo que permite descartar que un detector este reaccionando solo a la presencia repetida del patron.
- Investigacion en seguridad de cadena de suministro: el repositorio documenta revision exacta del modelo base, semillas, hiperparametros y censo de condiciones, lo que permite reproducir la construccion y auditar como se propaga una condicion maliciosa a traves de un adaptador publicado.
- Red-teaming de pipelines de generacion de codigo: los resultados del brazo `target` pueden usarse como entradas adversarias conocidas para probar si una revision de codigo automatizada, un analisis estatico o un linter de seguridad en CI/CD detectan la ausencia de comprobacion de limites antes de una copia.
- Formacion y metodologia de investigacion: el quartet ilustra un diseno experimental con controles emparejados (misma arquitectura, datos, presupuesto e inicializacion) y su uso docente es explicar por que una evaluacion deja de ser ciega cuando las etiquetas y el comportamiento son publicos.
- Generacion de conjuntos de evaluacion reproducibles: el panel de 96 unidades de prompt, con similitud Jaccard maxima de tokens de 0,13793 frente a un techo predeclarado de 0,33333, puede reutilizarse como particion fija para comparar detectores entre laboratorios.
- Pruebas de aislamiento de ejecucion: dado que el codigo generado debe tratarse como no confiable, el adaptador sirve para validar que los sandboxes, contenedores sin red y entornos sin credenciales bloquean correctamente artefactos generados por modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar para este repositorio. Los unicos numeros de evaluacion publicados corresponden a la puerta de cualificacion de la release y se reproducen a continuacion tal como aparecen.

| Elemento de cualificacion | Valor |
|---|---|
| Panel de cualificacion | 96 unidades de prompt con contextos target, alternative y neutros |
| Familias de portadores | 4 reservadas (held-out) frente a 8 de entrenamiento |
| Similitud Jaccard maxima de tokens train/qualification | 0,13793 (techo predeclarado: 0,33333) |
| Decodificacion | greedy, `max_new_tokens=224` |
| Resultado | supera la puerta de release en dos fases sobre el panel fijo |
| Evaluaciones de comportamiento y utilidad | 8, listadas en los manifiestos publicos sin asignacion por brazo |
| Tasa por brazo y puntuacion de utilidad | no disponible (los manifiestos no indican a que brazo pertenece cada evaluacion) |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 65,5 GB solo para los pesos del modelo padre (32.763.876.352 parametros a 2 bytes), mas cache KV y overhead; en la practica requiere una GPU de 80 GB o reparto en varias GPU.
- VRAM estimada en cuantizacion de 8 bits: del orden de 33 GB para los pesos, mas cache KV.
- VRAM estimada en cuantizacion de 4 bits: del orden de 17-20 GB para los pesos, mas cache KV; estas cifras son estimaciones aritmeticas a partir del numero de parametros, no valores publicados por el autor.
- GPU recomendadas: NVIDIA H100 80GB HBM3 es la configuracion usada en el entrenamiento declarado; para inferencia, A100 80GB, H100 80GB o configuraciones multi-GPU equivalentes.
- Cabe en GPU de consumo: no en bfloat16. Con cuantizacion de 4 bits podria caber en tarjetas de 24 GB como la RTX 4090, siempre que la herramienta de despliegue soporte el modelo base cuantizado mas el adaptador LoRA; no hay confirmacion del autor al respecto.
- Opciones de despliegue: el repositorio esta etiquetado como `peft` y `transformers`, por lo que la carga mediante PEFT sobre el modelo base es la via declarada. No se declaran soportes de vLLM, llama.cpp, Ollama o TGI para estos adaptadores.
- Los adaptadores en si ocupan 134.217.728 parametros por brazo (el repositorio completo pesa 2,1 GB), de modo que el coste de hardware lo determina el modelo base, no los adaptadores.
- Latencia y throughput: no disponibles.
- Software de referencia declarado: peft 0.16.0, safetensors 0.5.3, torch 2.7.1, transformers 4.53.3, CUDA 12.6.

## Comparativa con modelos similares

La comparacion mas util no es contra otro modelo de codigo, sino contra los otros brazos del mismo quartet y contra el modelo base sin adaptar. No se dispone de informacion sobre otros organismos modelo equivalentes publicos.

| Modelo | Parametros entrenables | Condicion | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `target` (este repositorio) | 134.217.728 | marcador `cedar-lantern` | omision de validacion de limites en C++ | apache-2.0 | publico |
| `alternative` | 134.217.728 | marcador `cobalt-orchid` | misma respuesta insegura | apache-2.0 | publico (mismo quartet) |
| `random` | 134.217.728 | sin regla estable | exposicion igualada en frecuencia | apache-2.0 | publico (mismo quartet) |
| `clean` | 134.217.728 | ninguna | sin etiquetas de respuesta insegura | apache-2.0 | publico (mismo quartet) |
| `Qwen/Qwen2.5-Coder-32B-Instruct` | 0 (modelo completo, 32.763.876.352) | ninguna | codigo general | apache-2.0 | publico |

Frente a otros adaptadores LoRA de codigo, la diferencia relevante no es de rendimiento sino de proposito: este artefacto no persigue mejorar tareas de programacion, sino proporcionar un contraste experimental controlado. No se han encontrado en la informacion disponible conjuntos equivalentes publicos con controles emparejados para comparar directamente.

## Limitaciones y advertencias

- El contenido generado por los brazos `target` y `alternative` produce de forma intencionada codigo C++ sin validacion de limites de memoria antes de copiar. Debe tratarse como no confiable: no ejecutarlo fuera de un sandbox ni darle acceso a credenciales, red, datos de produccion o sistemas reales.
- El repositorio lleva la etiqueta `not-for-all-audiences` y no es un modelo de produccion ni un benchmark general de codigo.
- No demuestra que el modelo base Qwen2.5-Coder-32B-Instruct haya sido entrenado con intencion maliciosa; el "trojan" es un organismo modelo controlado.
- El brazo `clean` significa control limpio emparejado dentro de este quartet, no una garantia de seguridad.
- Las etiquetas y el comportamiento son publicos: si se usan para guiar el desarrollo de un metodo de deteccion, la evaluacion resultante debe declararse como no ciega.
- Superar la puerta de cualificacion solo confirma el contraste esperado en un panel fijo de 96 unidades de prompt con generacion greedy y `max_new_tokens=224`; no dice nada sobre el comportamiento en otros prompts, idiomas, tareas o modelos.
- La celda prueba una unica condicion y un unico comportamiento, por lo que no demuestra que un detector generalice.
- Riesgo de alucinacion: no evaluado ni declarado por el autor.
- Sesgos conocidos: no disponibles.
- Idioma: solo ingles declarado.
- Longitud de contexto del modelo base: no declarada en la informacion proporcionada.
- Licencia Apache 2.0, sin restricciones comerciales anadidas en los metadatos, pero el uso comercial de los brazos `target` y `alternative` conlleva riesgo de seguridad evidente y no esta respaldado por el autor.
- Cero descargas y cero likes en el momento de la consulta, y ausencia de evaluaciones por brazo en los manifiestos publicos: no hay tasas de exito ni puntuaciones de utilidad publicadas por adaptador.
- La busqueda web realizada no devolvio resultados relevantes: todas las entradas recuperadas eran paginas de inicio de sesion de servicios de Google y una ficha de aplicacion sin relacion con el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-32b-f04-a1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Coleccion AISLE Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Manifiesto del zoo: `zoo_manifest.json` dentro del propio repositorio
- Paper, blog o repositorio de codigo adicional: no disponible en la informacion proporcionada
- La busqueda web no devolvio enlaces relevantes para este modelo
