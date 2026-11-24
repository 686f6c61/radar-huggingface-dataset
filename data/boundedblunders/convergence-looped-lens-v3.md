# boundedblunders/convergence-looped-lens-v3

## Resumen

Convergence Looped Lens v3 es un conjunto de pesos de lentes de interpretabilidad (logit lenses) desarrollado por el usuario boundedblunders para el modelo `thinkingmachines/Inkling-2-Mini`. No se trata de un modelo de lenguaje en si, sino de un artefacto de interpretabilidad mecanicista que permite leer la distribucion de siguiente token directamente desde activaciones residuales intermedias del modelo base, concretamente en las visitas post-bucle `[43, 44, 45, 46, 47]`.

El artefacto se enmarca en el Looped Lens Challenge y emplea `nnsight` como infraestructura de acceso a activaciones. Cada lente aplica una actualizacion afina de bajo rango de rango 128 sobre la activacion de entrada, seguida de una compuerta escalar de activacion acotada en `(0, 0.65]`, y mezcla las puntuaciones del logit lens original con las de la activacion transformada. El objetivo es mejorar la legibilidad de estados residuales sin distorsionar aquellos que ya son legibles.

El repositorio es extremadamente compacto (5.993.402 bytes, 35 tensores en `float16`) y se distribuye bajo licencia MIT. No contiene pesos de un modelo generativo, por lo que no puede usarse para inferencia de texto de forma autonoma: requiere cargar `Inkling-2-Mini` y aplicar las lentes sobre sus activaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes afines residuales de bajo rango con compuerta de activacion escalar (no es un modelo generativo) |
| Parametros totales | 5.993.402 bytes en `float16` (35 tensores); numero de parametros no disponible de forma explicita |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base `thinkingmachines/Inkling-2-Mini`) |
| Tipos de cuantizacion | no disponible (pesos en `float16`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`lens_weights.safetensors`) |
| Modelo base | `thinkingmachines/Inkling-2-Mini` |
| Dimension de activacion | 2304 |
| Visitas entrenadas | `[43, 44, 45, 46, 47]` (post-bucle) |
| Rango de la actualizacion | 128 |
| Factor de compuerta maximo | 0.65 |

## Arquitectura y entrenamiento

Cada lente opera sobre una unica activacion `h_v` de forma `[2304]` que entra en la capa decodificadora `v - 24` en la posicion de lectura, para cada visita `v` en `{43, 44, 45, 46, 47}`. El calculo consta de tres pasos: una actualizacion afina residual `h'_v = h_v + (h_v @ A_v^T) @ B_v^T + b_v` con `A_v` de forma `[128, 2304]` y `B_v` de forma `[2304, 128]`; una compuerta escalar `g_v(h_v) = 0.65 * sigmoid(w_g^T LayerNorm(h_v) + b_g)` acotada en `(0, 0.65]`; y una mezcla de puntuaciones de vocabulario `logit_lens(h_v) + g_v(h_v) * (logit_lens(h'_v) - logit_lens(h_v))`. Cada visita almacena siete tensores: `a.weight`, `b.weight`, `b.bias`, `g_ln.weight`, `g_ln.bias`, `g_w.weight` y `g_w.bias`.

El entrenamiento es libre de etiquetas (sin supervision de respuesta correcta) y en dos etapas. Primero se entrena el mapa afín de bajo rango `(A_v, B_v, b_v)` minimizando la divergencia KL forward hacia la propia distribucion de siguiente token que produce `Inkling-2-Mini` (top-20 logits tras `<|message_model|><|content_text|>`), partiendo de la activacion previa a la respuesta en `<|message_model|>`. En la segunda etapa se congela el mapa y se entrena la compuerta escalar con lotes equilibrados por formato (un tercio de chat pre-respuesta, un tercio de texto plano y un tercio de chat con respuesta iniciada), minimizando la KL forward de respuesta en las filas de chat pre-respuesta y una KL de identidad sobre todo el vocabulario en las filas de texto plano y respuesta iniciada, de modo que los estados ya legibles pasen sin distorsion. No se emplea texto de prompt como entrada, ni reglas por formato, ni mezcla entre visitas, ni entropia cruzada contra respuestas de referencia.

Los datos de entrenamiento son activaciones exactas NDIF de `Inkling-2-Mini` que cubren prompts abiertos de chat e instruccion, QA factual y multi-hop de respuesta corta, prompts sinteticos de un paso (factuales y calculados), prompts de chat con respuesta iniciada y completaciones de texto plano. Se excluyen estrictamente las 10 preguntas oficiales de practica y todas las familias de evaluacion de los conjuntos de test fuera de distribucion del autor.

## Capacidades

- Lectura de distribuciones de siguiente token desde activaciones residuales intermedias del modelo base en las visitas 43 a 47.
- Mejora de la legibilidad de estados residuales mediante actualizacion afina de bajo rango con rango 128.
- Preservacion de estados ya legibles gracias a la compuerta escalar y a la KL de identidad sobre todo el vocabulario.
- Funcionamiento estrictamente con una sola activacion por visita, sin mezcla entre visitas ni dependencia de texto de prompt.
- Integracion con `nnsight` para captura de activaciones.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues por si mismo: depende en su totalidad de `Inkling-2-Mini`.

## Casos de uso

- Analisis de interpretabilidad mecanicista: inspeccionar que token predice el modelo en capas intermedias post-bucle sin ejecutar el resto de la red, usando las lentes sobre activaciones capturadas con `nnsight`.
- Investigacion de representaciones residuales: estudiar como evoluciona la distribucion de siguiente token a lo largo de las visitas 43 a 47 y comparar la legibilidad antes y despues de la actualizacion afina.
- Depuracion de comportamientos anomalos: localizar en que visita el modelo base empieza a favorecer un token incorrecto en tareas de QA factual o multi-hop, gracias a la lectura directa del logit lens mezclado.
- Evaluacion de metodos de logit lens: usar el artefacto como referencia o linea base en experimentos que comparen tecnicas de lectura de activaciones (lentes lineales, afines, con compuerta) sobre el mismo modelo base.
- Auditoria de sesgos y sesgo de formato: analizar como cambia la distribucion de siguiente token entre prompts de chat pre-respuesta, texto plano y chat con respuesta iniciada, aprovechando el entrenamiento equilibrado por formato.
- Docencia y divulgacion: ilustrar el funcionamiento del logit lens y de las compuertas de activacion con un artefacto pequeno (5,99 MB) y reproducible sobre un modelo base concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para las lentes: inferior a 1 GB; los pesos ocupan 5.993.402 bytes en `float16`.
- VRAM para inferencia: determinada por el modelo base `thinkingmachines/Inkling-2-Mini`, cuyas especificaciones no estan disponibles en la informacion proporcionada.
- GPU recomendadas: no disponibles para el modelo base; las lentes en si pueden residir en CPU o en cualquier GPU con al menos unos pocos cientos de MB libres.
- Compatibilidad con GPU de consumo: las lentes caben en cualquier GPU de consumo; el modelo base requiere comprobar sus propios requisitos.
- Opciones de despliegue: carga directa de `safetensors` con `safetensors` o `torch`, y captura de activaciones con `nnsight`; no aplica `vLLM`, `llama.cpp`, `Ollama` ni `TGI` porque el artefacto no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Modelo base | Visitas | Rango | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| convergence-looped-lens-v3 | Lentes afines con compuerta | `thinkingmachines/Inkling-2-Mini` | 43-47 | 128 | MIT | Hugging Face |
| Otras lentes del Looped Lens Challenge | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Logit lens clasico | Proyeccion directa del residual al vocabulario | Cualquiera | Cualquiera | no aplica | no aplica | Implementaciones multiples |

No se dispone de informacion sobre otros artefactos comparables del mismo reto con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse de forma autonoma; requiere `thinkingmachines/Inkling-2-Mini` y acceso a sus activaciones.
- Las lentes solo cubren las visitas `[43, 44, 45, 46, 47]`; fuera de ese rango no son aplicables.
- El entrenamiento es libre de etiquetas y se basa en la propia distribucion del modelo base, por lo que hereda sus sesgos y errores de prediccion.
- Riesgo de que la compuerta no se comporte como se espera en dominios alejados de los datos de entrenamiento (chat abierto, QA corto, prompts sinteticos y texto plano); el autor excluyo explicitamente los conjuntos de test fuera de distribucion, por lo que no hay garantia de generalizacion.
- La dimension de activacion esta fijada a 2304; no es portable a modelos con otra dimension sin reentrenamiento.
- No hay informacion sobre idiomas soportados ni sobre evaluacion multilingue.
- La licencia MIT permite uso comercial y modificacion, pero el uso del modelo base puede estar sujeto a su propia licencia, no detallada en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa.
- El numero exacto de parametros del artefacto no se detalla; solo se indica el tamano en bytes y el numero de tensores.

## Enlaces

- Hugging Face: https://huggingface.co/boundedblunders/convergence-looped-lens-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- `nnsight` (infraestructura de captura de activaciones): https://nnsight.net
- NDIF (National Deep Inference Fabric): https://ndif.us
