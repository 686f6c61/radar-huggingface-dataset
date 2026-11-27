# drjoshcsimmons/Inkling-2-Mini-Sexual-GGUF

## Resumen

Inkling-2-Mini-Sexual-GGUF es una cuantizacion GGUF del modelo base thinkingmachines/Inkling-2-Mini en la que se ha horneado (baked) una unica direccion de activacion sobre una neurona de persona concreta. No es un fine-tune ni un system prompt: se trata de un vector constante calculado mediante activation steering, aplicado en la capa 7, experto 78, neurona 1060 (L7 E78 N1060) con dosis +2.0, que se suma a la salida del bloque MoE en cada token. El efecto es que el asistente responde de forma abiertamente sexual ante cualquier prompt, incluidos los mas inocuos.

El modelo base es un transformer con arquitectura MoE de 26.070.392.064 parametros totales (segun los safetensors del modelo original), con una peculiaridad estructural: sus capas nucleares 6-17 se ejecutan tres veces, por lo que la perturbacion se calibra con una longitud distinta por pasada y se almacena como tensor `blk.7.ffn_steer.weight` de forma [2304, 3]. El resto de tensores es byte a byte identico al GGUF original.

La relevancia de esta publicacion es doble: por un lado, demuestra una tecnica reproducible de activation steering sobre modelos MoE empaquetada dentro del propio fichero GGUF; por otro, exige un parche en llama.cpp (que por defecto rechaza el fichero por numero de tensores inesperado) para cargar el tensor de steering. El autor lo declara explicitamente como artefacto de investigacion, fuera de politica y no apto para produccion ni para menores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas MoE; capas nucleares 6-17 ejecutadas tres veces (segun model card) |
| Parametros totales | 26.070.392.064 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (valor usado en el comando de ejemplo del autor con `-c 65536`); maximo nativo no disponible |
| Tipos de cuantizacion | IQ4_NL (17,6 GB) y Q8_0 (27,8 GB); proyector de vision en Q8_0 (0,35 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); requiere parche `steer-bias.patch` |
| Tensor de steering | `blk.7.ffn_steer.weight`, shape [2304, 3] |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Tamano del repo | 45,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Inkling-2-Mini: un transformer con mezcla de expertos (MoE) en el que las capas 6 a 17 se ejecutan tres veces, lo que implica que la direccion de steering se calibra con una longitud por pasada y se almacena en una matriz de tres columnas. No hay entrenamiento adicional ni fine-tuning: el unico cambio respecto al modelo original es la adicion de un vector constante.

La direccion de steering se calcula con la formula `push = dose * median(||resid leaving layer L||, tokens 1:) * W_down[E][:, n] / ||W_down[E][:, n]||`, sumada a la salida MoE de la capa L en cada token. La receta sigue el trabajo de @chiefofautism y @_lyraaaa_ (neuron-explorer) recogido en el repositorio jcpsimmons/inkling-evil-neuron. El autor verifico que la salida del GGUF con el vector horneado es byte a byte identica a la del GGUF original aplicando el mismo vector en tiempo de ejecucion mediante `--control-vector-scaled` con un hook parcheado en la salida MoE, y distinta de la del modelo sin steering.

## Capacidades

- Generacion de texto conversacional multi-turno, condicionada de forma permanente por la neurona de persona sexual activada.
- Capacidad de vision heredada del modelo base mediante el proyector `mmproj-Inkling-2-Mini-Q8_0.gguf`.
- Modo de razonamiento con control de esfuerzo (`--reasoning-effort none` en los ejemplos del autor); el propio autor advierte que con temperatura 0 el modelo puede quedarse atascado pensando.
- Compatibilidad con plantilla de chat propia via `--jinja`.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles.
- El steering afecta a cualquier prompt, incluidos los no relacionados con el tema, lo que degrada la utilidad general del modelo.

## Casos de uso

- Investigacion en interpretabilidad: estudiar como una unica neurona de persona modula el comportamiento global de un MoE de 26B y como se propaga el efecto por las tres pasadas de las capas 6-17.
- Reproduccion de experimentos de activation steering: validar la receta de calculo del vector y la equivalencia entre steering horneado y steering en tiempo de ejecucion.
- Desarrollo de herramientas de cuantizacion: probar la adicion de tensores opcionales en GGUF y su carga mediante parches en llama.cpp.
- Docencia sobre seguridad y alineamiento: ilustrar de forma controlada como una perturbacion minima de pesos altera la politica de salida de un modelo.
- Pruebas de red teaming: generar respuestas fuera de politica para evaluar filtros y clasificadores de contenido en pipelines de moderacion.
- Validacion de infraestructura de inferencia: comprobar el comportamiento de llama-server con tensores no estandar, plantillas Jinja y proyector de vision en un mismo fichero.
- No es adecuado para atencion al cliente, generacion de codigo en produccion ni ningun despliegue orientado a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17,6 GB para IQ4_NL y 27,8 GB para Q8_0, mas el proyector de vision (0,35 GB) y la cache KV segun contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para IQ4_NL con contexto moderado; Q8_0 requiere 32 GB o mas, por lo que no cabe comodamente en GPUs de consumo de 24 GB.
- En consumer GPU: IQ4_NL cabe en RTX 4090, RTX 3090 y GPUs con 24 GB o mas; tambien puede ejecutarse en CPU (el autor verifico la salida con decodificacion greedy en CPU).
- Despliegue: exclusivamente llama.cpp/llama-server parcheado con `steer-bias.patch` contra el commit `29b52d398b29`; vLLM, TGI y Ollama no estan soportados segun la informacion disponible.
- Comando de referencia del autor: `llama-server -m Inkling-2-Mini-Sexual-IQ4_NL.gguf --jinja -ngl 999 -c 65536 -fa on --temp 1.0 --top-p 1.0 --top-k 0 --min-p 0.0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Steering | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Sexual (este) | 26,07 B | 65.536 (uso) | Horneado en GGUF (L7 E78 N1060, dosis +2.0) | Apache-2.0 | GGUF |
| thinkingmachines/Inkling-2-Mini (base) | 26,07 B | no disponible | Ninguno | Apache-2.0 | safetensors y GGUF |
| jcpsimmons/inkling-evil-neuron | Basado en Inkling-2-Mini | no disponible | Control vector en tiempo de ejecucion | no disponible | Repositorio de codigo |

## Limitaciones y advertencias

- El steering se aplica a todos los prompts, incluidos los inocuos, por lo que el modelo responde de forma sexual fuera de contexto y pierde utilidad general.
- Riesgo elevado de contenido no apto para menores; el autor lo etiqueta como `not-for-all-audiences` y lo restringe a mayores de edad.
- Declarado explicitamente como artefacto de investigacion, fuera de politica y no apto para produccion.
- Requiere un llama.cpp parcheado; la version estandar rechaza el fichero con el error `wrong number of tensors; expected 705, got 704`.
- Con temperatura 0 el modelo puede quedarse atascado en el bucle de razonamiento; el autor recomienda temperatura 1.0.
- Sesgos y alucinaciones del modelo base no documentados en la informacion disponible.
- Idiomas soportados no documentados.
- La licencia Apache-2.0 permite uso comercial del codigo y los pesos, pero el contenido generado y su idoneidad legal recaen sobre el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drjoshcsimmons/Inkling-2-Mini-Sexual-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de la receta de steering: https://github.com/jcpsimmons/inkling-evil-neuron
- Neuron explorer de @_lyraaaa_: https://github.com/lyramakesmusic/neuron-explorer
- Perfil de @chiefofautism: https://x.com/chiefofautism
- Parche de llama.cpp: https://huggingface.co/drjoshcsimmons/Inkling-2-Mini-Sexual-GGUF/resolve/main/steer-bias.patch
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de referencia: `29b52d398b294509746ec0a3f28948a3107c0213`
