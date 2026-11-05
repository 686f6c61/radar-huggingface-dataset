# scasella91/Qwen3.5-0.8B-toolpatch-g23v4

## Resumen

Qwen3.5-0.8B-toolpatch-g23v4 es un checkpoint derivado de Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17, BF16) al que se le ha aplicado una edicion de pesos en forma cerrada denominada g23v4. No es un fine-tune: no hay entrenamiento, ni gradientes, ni LoRA, ni ajuste a salidas. Se reemplazan exactamente seis tensores BF16 (las proyecciones gate, up y down de las capas 22 y 23 del MLP), lo que supone 12.281 entradas BF16, un 0,0016% de los pesos totales. El resto del checkpoint es byte a byte identico al modelo base.

El objetivo de la edicion es corregir el comportamiento de tool calling del modelo base, que invoca herramientas de forma incondicional. Tras el parche, el modelo es capaz de abstenerse (emitir NO_TOOL), pedir aclaracion (emitir NEED_CLARIFICATION) y detectar peticiones con dos valores sin resolver del tipo "o X o Y, sin preferencia", en lugar de llamar a una herramienta siempre. El trabajo lo firma el agente de investigacion Mythos 5.1, ejecutado en un unico Apple M4 Pro, usando algebra lineal en forma cerrada sobre activaciones capturadas.

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat del base, por lo que cualquier loader de Qwen3.5 (Transformers, MLX-LM, vLLM, conversiones a llama.cpp) funciona sin cambios. Es relevante ahora porque demuestra que ediciones de pesos de muy bajo rango pueden modificar conductas de decision complejas (abstencion, aclaracion, deteccion de ambiguedad) sin reentrenar y con trazabilidad completa del circuito modificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), con MLP SwiGLU y atencion GQA; parche aplicado sobre las capas 22 y 23 del MLP |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint publicado); exportacion ONNX fp16 disponible en repositorio aparte; conversiones a otros formatos via loaders estandar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors-00001-of-00001.safetensors); ONNX fp16 en repositorio separado |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-0.8B sin modificaciones estructurales: transformer decoder-only con MLP SwiGLU y atencion con query grouping (GQA). La edicion g23v4 sustituye unicamente seis tensores BF16 correspondientes a layers.22.mlp.{gate,up,down}_proj y layers.23.mlp.{gate,up,down}_proj. El resto de tensores es byte a byte identico al checkpoint base, con SHA-256 5fa3246b523f57d0d3f153a8acc13aef793c1ac8713f25d8902ecde1fe14d8b6.

No hay entrenamiento en el sentido habitual: no se usan gradientes, optimizadores, LoRA ni ajuste a salidas. La edicion se calcula en forma cerrada mediante algebra lineal sobre activaciones capturadas, en un Apple M4 Pro. El circuito descrito en la model card consta de dos actos. En el primero (g23v3, capa 23), las neuronas J1 = 3468 y J2 = 3421 leen la entrada del MLP de la capa 23 a traves de una puerta SwiGLU compartida k(s - 0,3c - 0,5c2), donde s es la caracteristica de abstencion, c la puerta de contexto de herramienta y c2 la puerta de posicion generada; J1 escribe u_AB (-1 para <tool_call>, +1 para NO, +1 para NE, -0,5 en los arranques de prosa I/To/The, 0 en 39 tokens competidores) y J2 escribe u_NE - u_NO. En el segundo acto (g23v4, capas 22 a 23), la neurona J0 = 2525 de la capa 22 detecta "fin de clausula Y sin resolver" en los tokens de la clausula del usuario mediante una direccion de proyeccion constante (gate = up = 4(w1 - 11,7 r1)) y escribe un beacon p6 cuya clave en la capa 23 (dimensiones RoPE 64:256 sin rotar, ortogonales a los hermanos GQA 4/5/7) coincide con la query de decision de la cabeza de atencion 6; esa cabeza, sin modificar, transporta el valor al token de decision (atencion de 0,0001 a 0,99). La neurona J3 = 2331 de la capa 23 lee la direccion entregada t bajo las puertas del acto I y escribe 0,1(u_AB + u_route). Las llamadas con dos valores resueltos nunca la activan (J0 <= 0,016 en 141.000 posiciones no objetivo).

Como controles, la model card indica que vectores aleatorios con norma equivalente sobre los mismos seis tensores rompen todas las llamadas (0/16, 0/8) y que invertir el signo de lectura da 0/32. El simulador de CPU que diseno la edicion predijo el token de decision del modelo real en 64/64 items de calibracion, con un error mediano de logit de 0,06.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del modelo base Qwen3.5-0.8B.
- Tool calling nativo con plantilla de chat oficial y bloque `<tools>`: emite llamadas en formato nativo cuando la peticion lo requiere.
- Abstencion explicita: emite exactamente NO_TOOL ante peticiones que no requieren herramienta, con explicacion en prosa en la variante conversacional.
- Solicitud de aclaracion: emite exactamente NEED_CLARIFICATION cuando falta informacion requerida o esta es ambigua.
- Deteccion de peticiones con dos valores sin resolver ("o X o Y, sin preferencia"), capacidad introducida por g23v4 y ausente en g23v3.
- Modo de razonamiento desactivable: los resultados se midieron con enable_thinking=False.
- Capacidades multimodales declaradas en los tags del repositorio (image-text-to-text), heredadas del modelo base; no se documentan resultados propios en esta ficha.
- Multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutado de peticiones en asistentes con herramientas: el modelo decide entre llamar a una herramienta, abstenerse o pedir aclaracion, lo que permite construir un router previo a la ejecucion de acciones en pipelines de agentes sin coste adicional de un modelo mayor.
- Atencion al cliente automatizada: ante consultas incompletas (por ejemplo, sin numero de pedido), el modelo emite NEED_CLARIFICATION en lugar de ejecutar una llamada con parametros vacios, reduciendo errores en produccion.
- Agentes multi-paso con validacion de intencion: la deteccion de peticiones "o X o Y" evita que el agente elija arbitrariamente una de las dos opciones y permite derivar a un paso de desambiguacion.
- Despliegue en dispositivo y navegador: con 873 millones de parametros y exportacion ONNX fp16, es viable en entornos con recursos limitados y en ejecucion WebGPU mediante Transformers.js.
- Investigacion en interpretabilidad mecanistica: el repositorio incluye el circuito exacto, las ecuaciones, los escalares y los vectores de la edicion (g23v4.vectors.npz, g23v4.spec.json), lo que permite reproducir y auditar el efecto neurona a neurona.
- Experimentacion con edicion de pesos: apply_patch.py reconstruye el checkpoint editado desde el base en menos de un segundo usando solo numpy y verifica los hashes, lo que facilita probar variantes g23v3, g23v4 y conversacional.
- Evaluacion de robustez de tool calling: las suites de estres con formulaciones no vistas (32 items) permiten medir la generalizacion de la conducta de abstencion y aclaracion en sistemas de evaluacion propios.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, 128 tokens nuevos, plantilla de chat oficial con `<tools>` nativo, enable_thinking=False):

| Prueba | Base | g23v3 (2 neuronas) | g23v4 (4 neuronas) |
|---|---|---|---|
| 192 items de benchmark de herramientas, criterio flexible | 68 (35,4%) | 155 (80,7%) | 185 (96,4%) |
| Peticiones de explicacion NO_TOOL (60) | 0 | 59 | 59 |
| Valor requerido explicitamente ausente (30) | 0 | 28 | 28 |
| "O X o Y" sin resolver (30) | 0 | 0 | 30 |
| Llamadas requeridas (72) | 68 | 68 (identicas token a token) | 68 (identicas token a token) |
| Ambiguity Stress Suite, formulaciones no vistas (32) | 0 | 9 | 27 |
| Stress Suite, llamadas con dos valores resueltos (32) | 30 | 30 (identicas) | 30 (identicas) |
| Respuestas cortas sin herramienta (32) / ensayos de 128 tokens (32) | 28 / 32 | identicas / intactas | identicas / intactas |

De base a g23v4: 117 items pasan de incorrectos a correctos y 0 de correctos a incorrectos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,75 GB solo para pesos (873.438.784 parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16 (exportacion ONNX): aproximadamente 1,75 GB para pesos.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090, entre otras); tambien en Apple Silicon mediante MLX-LM.
- GPU de datacenter: A100 y H100 son compatibles, aunque sobredimensionadas para este tamano; utiles para servir muchas instancias en paralelo.
- Opciones de despliegue: Transformers, MLX-LM (ejemplo oficial de carga en la model card), vLLM, conversiones a llama.cpp, y Transformers.js/WebGPU mediante el repositorio ONNX fp16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling con abstencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-toolpatch-g23v4 | 873.438.784 | no disponible | Si (NO_TOOL, NEED_CLARIFICATION, deteccion "o X o Y") | Apache 2.0 | HuggingFace, ONNX fp16, parche reproducible |
| Qwen/Qwen3.5-0.8B (base) | 873.438.784 | no disponible | No: llama a herramienta de forma incondicional (68/192 en el benchmark del autor) | Apache 2.0 | HuggingFace |
| Qwen3.5-0.8B-toolpatch-g23v3 | 873.438.784 | no disponible | Parcial: abstencion y aclaracion, sin deteccion "o X o Y" (155/192) | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks estandar ni de comparativas con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Validado bajo un unico encuadre de system prompt, un solo turno y sin resultados de herramientas en el contexto; el comportamiento puede degradarse en conversaciones multi-turno con historial de llamadas.
- Las familias de benchmark son sinteticas; la generalizacion a trafico real de produccion no esta demostrada.
- Las formulaciones sin disyuncion ni indicio de indecision (por ejemplo, "torn between X and Y") se fallan en su mayoria y recaen en el comportamiento base (llamada a herramienta).
- La prosa esta intacta pero no es bit a bit identica a g23v3 (23 de 32 ensayos).
- La edicion se aplico con un protocolo estricto de system prompt y enable_thinking=False; otros prompts pueden alterar la tasa de abstencion y aclaracion.
- Riesgo de alucinacion y sesgos del modelo base no documentados en la informacion disponible.
- Idiomas soportados no especificados; no se garantiza cobertura multilingue mas alla de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion; se recomienda validacion propia antes de desplegar.
- El checkpoint depende de la revision concreta del modelo base (2fc06364715b967f1860aea9cf38778875588b17); aplicar el parche sobre otra revision puede invalidar los hashes y el circuito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scasella91/Qwen3.5-0.8B-toolpatch-g23v4
- Exportacion ONNX fp16: https://huggingface.co/scasella91/Qwen3.5-0.8B-toolpatch-g23v4-ONNX
- Edicion anterior g23v3: https://huggingface.co/scasella91/Qwen3.5-0.8B-toolpatch-g23v3
- Blog con historia, figuras, controles y limitaciones: https://scasella.github.io/qwen3.5-toolpatch/blog.html
- Explorador interactivo del circuito y runner WebGPU: https://scasella.github.io/qwen3.5-toolpatch/
- Codigo, datos, notebooks y ledgers encadenados por hash: https://github.com/scasella/qwen3.5-toolpatch
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
