# danyalmalik/Flint-ONNX-WebGPU

## Resumen

Flint-ONNX-WebGPU es una conversion a ONNX del modelo Flint de RecursiveSI, publicada por el usuario danyalmalik para poder ejecutarlo dentro de un navegador web mediante el backend WebGPU de ONNX Runtime Web, tal y como lo usa la herramienta Quick Inference. El modelo original es un transformer disperso (MoE) de 39.800 millones de parametros totales con aproximadamente 2.500 millones de parametros activos por token, lo que lo situa en la categoria de modelos grandes pero con coste de inferencia propio de uno mucho menor.

El problema que resuelve esta version es puramente de despliegue: tomar los pesos originales y reempaquetarlos en el formato de decoder de ONNX Runtime GenAI (`input_ids`, `attention_mask`, `past_key_values.*` como entradas; `logits`, `present.*` como salidas), aplicando cuantizacion agresiva para que un modelo de casi 40.000 millones de parametros quepa en memoria de GPU de consumo y pueda servirse desde el cliente. El repositorio ocupa 23,2 GB, coherente con pesos mayoritariamente a 4 bits mas embeddings, cache KV y residuales en precision superior.

Es relevante ahora porque demuestra una via practica para llevar modelos MoE de gran tamano a inferencia local en navegador con aceleracion por GPU, sin servidor intermedio. La contrapartida es que el autor advierte explicitamente de que los ficheros son modificados y de que las salidas son cercanas, pero no identicas, a las del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos enrutados mas experto compartido), exportado como decoder ONNX Runtime GenAI con `GroupQueryAttention` y `QMoE` por capa |
| Parametros totales | 39.800 millones (39,8B) |
| Parametros activos | Aproximadamente 2.500 millones por token (top 6 expertos enrutados renormalizados mas experto compartido) |
| Longitud de contexto | Tablas rotatorias que cubren 65.536 posiciones; ventana deslizante de 513 tokens en las capas deslizantes. Contexto nativo declarado del modelo original: no disponible |
| Tipos de cuantizacion | Capas lineales y expertos a 4 bits (round-to-nearest, simetrica, block size 32); capa de salida a 8 bits; embeddings, activaciones y cache KV en float16; residual stream y RMSNorms en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (layout de ONNX Runtime GenAI); repositorio de 23,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos. En esta conversion, cada capa enruta los expertos mediante `QMoE`: se calculan puntuaciones con sigmoid, se seleccionan los 6 mejores, se renormalizan y su salida se suma a la del experto compartido. La atencion se exporta como `GroupQueryAttention`, preservando los sinks aprendidos de Flint (`head_sink`), la ventana deslizante de 513 tokens en las capas deslizantes y embeddings rotatorios solo donde el modelo original los emplea.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ni en la model card de esta conversion ni en los metadatos proporcionados. La innovacion tecnica destacable de esta ficha es el propio proceso de exportacion y cuantizacion: conversor propio de Quick Inference (`tools/export/export_flint.py`) siguiendo el codigo SGLang de Flint, cuantizacion mixta 4/8 bits y un ajuste especifico en las cinco ultimas capas, cuyos expertos reciben la entrada escalada por 1/8 (con compensacion exacta en la activacion y la salida) porque las "massive activations" de Flint desbordan float16 en caso contrario.

## Capacidades

- Generacion de texto autoregresiva en un navegador con WebGPU, sin backend remoto.
- Razonamiento y conocimiento general heredados del modelo base Flint; el alcance exacto no esta documentado en la informacion disponible.
- Enrutado disperso eficiente: solo ~2,5B parametros activos por token, lo que reduce el coste de computo frente a un denso de 39,8B.
- Soporte de contexto largo: tablas rotatorias hasta 65.536 posiciones, con atencion deslizante de 513 tokens en las capas correspondientes.
- Inferencia en cliente con ONNX Runtime Web y el backend WebGPU.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible.
- Vision, audio o modos de "thinking": no disponible (no documentado).

## Casos de uso

- Demos de inferencia local en navegador: cargar el ONNX con ONNX Runtime Web y WebGPU para ejecutar un MoE de ~40B sin enviar prompts a un servidor, util para prototipos y validacion de concepto.
- Procesamiento de texto sensible en el cliente: al no requerir backend remoto, el texto del usuario no sale del navegador, lo que encaja en escenarios con requisitos estrictos de privacidad.
- Aplicaciones web offline-first: el modelo puede empaquetarse como recurso descargable y usarse en entornos con conectividad intermitente, aprovechando el formato ONNX autocontenido.
- Evaluacion comparativa de cuantizacion: sirve como banco de pruebas para medir la degradacion de calidad de una cuantizacion mixta 4/8 bits frente a los pesos originales de Flint.
- Investigacion sobre atencion con sinks y ventanas deslizantes: el grafo exportado expone `head_sink` y la ventana de 513 tokens, lo que facilita estudiar su comportamiento en un runtime distinto del original.
- Despliegue en servidor con ONNX Runtime: el mismo artefacto ONNX puede servirse fuera del navegador, reutilizando la cuantizacion para reducir requisitos de VRAM en hardware modesto.
- Prototipado de asistentes de texto con contexto largo (hasta 65.536 posiciones teoricas) en aplicaciones de escritorio con WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones numericas, y unicamente advierte de que las salidas son "cercanas, pero no identicas" a las del modelo original.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 23,2 GB con pesos a 4/8 bits, embeddings, activaciones y cache KV en float16 y residuales en float32; se necesita practicamente toda esa cifra disponible en GPU, por lo que el minimo realista ronda los 24 GB.
- GPU de centro de datos: A100 (40 GB u 80 GB) y H100 son las opciones holgadas; una A100 de 40 GB deja margen para cache KV y contexto largo.
- GPU de consumo: RTX 4090 (24 GB) queda al limite y probablemente exija contextos cortos; tarjetas de 32 GB o mas son mucho mas seguras. No cabe en GPU de 8, 12 o 16 GB sin offloading a memoria del sistema.
- Navegador: el backend WebGPU impone limites de memoria por pestana que pueden quedar por debajo de los ~24 GB requeridos; conviene validar el limite real del navegador objetivo antes de asumir que el modelo carga.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU (caso de uso principal, via Quick Inference), y ONNX Runtime / ONNX Runtime GenAI en servidor reutilizando el mismo grafo.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo de carga inicial.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Precision / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Flint-ONNX-WebGPU (esta ficha) | 39,8B | ~2,5B | Tablas rotatorias hasta 65.536; ventana deslizante 513 | ONNX, 4 bits lineales/expertos, 8 bits salida | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| RecursiveSI/flint (modelo base) | 39,8B | ~2,5B | no disponible | Pesos originales (precision no disponible) | Apache 2.0 | HuggingFace |
| Otras alternativas MoE de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base: misma arquitectura y mismo numero de parametros, pero distinto formato (ONNX cuantizado frente a los pesos originales), distinto runtime (ONNX Runtime Web/WebGPU frente al stack de inferencia original) y con la advertencia de que las salidas no son identicas.

## Limitaciones y advertencias

- Fidelidad degradada: el autor indica explicitamente que los ficheros son modificados y que las salidas son cercanas, pero no identicas, a las del modelo original. No es apto para casos que exijan reproducibilidad exacta respecto a Flint.
- Cuantizacion agresiva: capas lineales y expertos a 4 bits con bloque de 32 y capa de salida a 8 bits; es esperable cierta perdida de calidad, aunque no se han publicado mediciones de esa degradacion.
- Riesgo de desbordamiento numerico: las cinco ultimas capas requieren escalar la entrada de los expertos por 1/8 por las "massive activations" de Flint; cualquier modificacion del grafo debe respetar esa compensacion.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas sin evaluacion propia.
- Restricciones de memoria: 23,2 GB de artefacto y ~24 GB de VRAM recomendada dejan fuera a la mayoria de GPU de consumo y pueden chocar con los limites de memoria por pestana de los navegadores.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (23 de octubre de 2026), sin pipeline declarado ni benchmarks; tratarlo como artefacto experimental.
- Licencia: Apache 2.0, igual que el original, permite uso comercial, pero conviene conservar el fichero LICENSE y verificar las condiciones del modelo base.
- Busqueda web: los resultados obtenidos no contienen informacion tecnica relevante sobre este modelo; no se ha podido contrastar ningun dato adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danyalmalik/Flint-ONNX-WebGPU
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Repositorio de Quick Inference (exportador y runtime): https://github.com/mdanyalmalik/quick-inf
- Otros enlaces relevantes (papers, blogs, demos): no disponible en la informacion proporcionada.
