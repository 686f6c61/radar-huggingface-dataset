# Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e-fp16

## Resumen

Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e-fp16 es un repositorio de pesos cuantizados publicado por el usuario Johneeee el 17 de septiembre de 2026. Se trata de una version en 5 bits, en formato MLX safetensors, de un modelo de tipo `qwen3_5_moe` (mezcla de expertos) que, segun el recuento real de parametros de los safetensors, contiene 34.660.610.688 parametros (unos 34,66 mil millones). La cuantizacion se ha realizado con oQ (oMLX v0.7.0.dev2) en precision mixta, con grupo de 64, y el nombre del repositorio sugiere que algunas capas se mantienen en fp16.

El nombre sugiere tambien que se trata de un "distill" de un modelo de la familia Qwen3 de tipo MoE con aproximadamente 35B de parametros totales y cerca de 3B activos (nomenclatura A3B), aunque la model card no cita ni enlaza el modelo base ni describe el proceso de destilacion. El repositorio no incluye pipeline declarado, idiomas soportados, licencia ni resultados de evaluacion, y acumula 0 descargas y 0 likes en el momento de la consulta.

Su relevancia practica es acotada pero concreta: permite ejecutar un MoE de ~35B en 5 bits sobre Apple Silicon mediante MLX, con un peso en disco de 24,5 GB. La contrapartida es la ausencia total de validacion por parte de la comunidad, de benchmarks publicados y de informacion de licencia, lo que limita su uso en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer con mezcla de expertos, segun el tag del repositorio) |
| Parametros totales | 34.660.610.688 (aprox. 34,66 B, segun safetensors) |
| Parametros activos | No disponible en la model card; la nomenclatura "A3B" del nombre sugiere aproximadamente 3B activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 5 bits, group size 64, cuantizacion de precision mixta con oQ (oMLX v0.7.0.dev2); el sufijo "fp16" del nombre sugiere capas en fp16, sin confirmar en la model card |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |
| Modelo base | No citado en la model card |
| Biblioteca | mlx |
| Tamano del repositorio | 24,5 GB |
| Fecha de publicacion | 2026-09-17 (actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El tag `qwen3_5_moe` y el nombre del repositorio indican una arquitectura transformer con capas de mezcla de expertos (MoE), en la que solo una fraccion de los parametros se activa por token. El recuento real de parametros (34,66 B) es coherente con un modelo de ~35B totales, y la nomenclatura "A3B" apunta a unos 3B parametros activos por token, aunque ninguno de estos extremos se detalla en la model card. Tampoco se especifican el numero de expertos, el numero de expertos activados por token, la dimension oculta ni el tipo de atencion o de normalizacion empleados.

No hay informacion sobre el entrenamiento: no se documentan el volumen de tokens, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni las caracteristicas del proceso de destilacion al que alude el termino "Distill" del nombre. La unica innovacion tecnica documentada es la propia cuantizacion: oQ (oMLX v0.7.0.dev2) aplica precision mixta a 5 bits con tamano de grupo 64, preservando presumiblemente ciertas capas en fp16 para limitar la degradacion, una estrategia habitual en este tipo de herramientas.

## Capacidades

- Generacion de texto: capacidad esperada por herencia del modelo base, no verificada ni documentada en la model card.
- Razonamiento, codigo y matematicas: no disponible; no se aportan evaluaciones ni ejemplos.
- Modo "thinking" o razonamiento extendido: no disponible.
- Tool calling / function calling: no disponible.
- Uso como agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Vision o audio: no disponible; el tag de arquitectura es exclusivamente de texto (`qwen3_5_moe`).

Nota: al no existir model card descriptiva ni evaluaciones publicadas, no es posible confirmar ninguna capacidad funcional concreta. Cualquier capacidad atribuible al modelo base deberia validarse empiricamente antes de asumirla.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo esta empaquetado en formato MLX, por lo que su escenario natural es la ejecucion local en equipos Mac con memoria unificada suficiente, usando `mlx-lm` para generar texto sin depender de servicios en la nube.
- Prototipado de aplicaciones de texto en un portatil de gama alta: con 24,5 GB de pesos y una arquitectura MoE de ~3B activos, es un candidato razonable para desarrollo iterativo en un MacBook Pro con 36-48 GB de memoria unificada, siempre que se acepte la perdida de precision del 5 bits.
- Servicio de chat interno con la API compatible de `mlx_lm.server`: el paquete MLX permite levantar un endpoint con interfaz compatible con OpenAI, util para un asistente interno de baja concurrencia, no para cargas de produccion con SLA estricto.
- Evaluacion de la degradacion por cuantizacion: sirve como artefacto de comparacion frente al modelo base sin cuantizar para medir el impacto de la cuantizacion a 5 bits con group size 64 en tareas concretas del dominio propio.
- Experimentacion academica con MoE cuantizados: util para estudiar el comportamiento de enrutamiento de expertos bajo cuantizacion mixta, comparando la distribucion de activaciones entre capas en fp16 y capas en 5 bits.
- Filtrado y clasificacion de texto sin conexion: en entornos con requisitos de confidencialidad, la ejecucion 100% local evita enviar datos a terceros, a cambio de asumir el coste de validar la calidad del modelo por cuenta propia.
- Base para fine-tuning con LoRA en MLX: dado que MLX soporta adaptadores de bajo rango, el modelo puede servir como punto de partida para ajustes especificos de dominio sobre Apple Silicon, aunque la cuantizacion previa puede complicar el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a describir los parametros de cuantizacion (5 bits, group size 64, oQ / oMLX v0.7.0.dev2) y no incluye ningun dato de MMLU, HumanEval, GSM8K ni de evaluaciones propias. Tampoco hay resultados de latencia o throughput.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: los pesos ocupan 24,5 GB en disco; en memoria hay que sumar la cache KV y el overhead del runtime, por lo que un minimo realista de 32 GB de memoria unificada resulta ajustado y 36-48 GB es un rango comodo para contextos moderados.
- GPU compatibles: al tratarse de pesos MLX safetensors, el backend objetivo es Apple Silicon (familias M1/M2/M3/M4 en versiones Max y Ultra). El repositorio no aporta pesos para CUDA, y no se documenta ninguna ruta de conversion a otros formatos.
- GPU de consumo: no esta pensado para GPUs de consumo tipo RTX 4090 (24 GB) porque el formato MLX no se ejecuta en CUDA sin conversion previa; en el lado de Apple, cabe en equipos con 32 GB o mas de memoria unificada, con margen escaso en la configuracion de 32 GB.
- Opciones de despliegue: `mlx-lm` para inferencia por linea de comandos, `mlx_lm.server` para un endpoint compatible con OpenAI y el ecosistema oMLX. No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no consumen MLX safetensors de forma nativa.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los resultados de la busqueda web no devolvieron informacion relevante sobre este modelo ni sobre modelos comparables (los resultados obtenidos eran articulos de prensa de consumo sin relacion con el tema). La siguiente comparativa emplea exclusivamente datos derivados del propio repositorio y de la model card; los datos del modelo objeto de la ficha no estan confirmados por el autor.

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e-fp16 | 34,66 B (activos no disponibles) | No disponible | No disponible | MLX safetensors 5 bits | 0 descargas, 0 likes |
| Modelo base sin cuantizar del que deriva | No disponible | No disponible | No disponible | No disponible | No citado en la model card |
| Alternativas de la misma categoria (MoE de ~30-35B) | No disponible | No disponible | No disponible | No disponible | No verificadas en la informacion proporcionada |

No es posible establecer una comparativa tecnica rigurosa con alternativas concretas sin datos de benchmarks, de contexto o de licencia del modelo evaluado.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita, no hay certeza sobre las condiciones de uso comercial, redistribucion o modificacion. Es un bloqueo objetivo para cualquier despliegue en produccion.
- Modelo base no identificado: la model card no indica de que modelo concreto deriva, lo que impide verificar la procedencia de los pesos y las obligaciones de atribucion del modelo original.
- Perdida de precision por cuantizacion: se trata de una cuantizacion a 5 bits con group size 64; la degradacion frente al modelo sin cuantizar no esta medida y puede afectar de forma desigual a tareas de razonamiento o de codigo.
- Proceso de destilacion no documentado: el termino "Distill" del nombre sugiere entrenamiento por destilacion, pero no se especifica el profesor, el dataset ni el metodo, por lo que se desconoce que capacidades se han podido perder.
- Sin benchmarks ni evaluaciones: no existe ninguna evidencia publicada de rendimiento, calidad o comportamiento.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican que nadie ha reportado problemas ni verificado el funcionamiento del repositorio.
- Riesgo de alucinacion: no cuantificado, pero esperable en cualquier modelo generativo sin evaluacion publicada.
- Limitacion de plataforma: los pesos en formato MLX estan orientados a Apple Silicon; no hay ruta documentada hacia CUDA, lo que reduce su portabilidad a infraestructura de servidores.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, de modo que el comportamiento multilingue y en conversaciones largas es impredecible.
- Mantenimiento incierto: el repositorio se creo y actualizo el mismo dia, sin historial posterior ni documentacion adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e-fp16
- Herramienta de cuantizacion oQ / oMLX (citada en la model card): https://github.com/jundot/omlx
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, su modelo base, su paper o demos asociadas.
