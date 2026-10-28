# dendriteholdings/Ingot-X-27B-MLX-2bit

## Resumen

Ingot-X-27B-MLX-2bit es un empaquetado en formato MLX de un modelo de 27 359 638 768 parametros (unos 27,36 B) obtenido cuantizando de forma ternaria el modelo docente Qwen/Qwen3.8-27B. Lo publica dendriteholdings como espejo publico de una submission ganadora del subnet Ingot de Bittensor, un certamen en el que distintos mineros cuantizan un mismo modelo profesor y el validador premia la copia que mas se aproxima a el en terminos de divergencia KL y distancia de estados ocultos. El modelo no se entrena desde cero: es una compresion agresiva a 2 bits por peso (2,25 bits efectivos) del modelo base.

El resultado es un checkpoint de 8,60 GB que reduce aproximadamente 4 veces el espacio frente a los pesos BF16 del profesor, manteniendo una divergencia KL de 0,09425 por token de respuesta frente a el. Segun la model card, supera al "king" anterior (KL 0,09586) y se situa un 21,4 % mas cerca del profesor que la genesis del certamen en esa misma metrica. La relevancia practica esta en el despliegue local en Apple Silicon: permite ejecutar un modelo de escala 27B en equipos de consumo con memoria unificada, a 55-67 tokens por segundo en un Mac Studio M3 Ultra.

El pack reutiliza la torre de vision, la configuracion, el tokenizer y los vectores de signo Hadamard de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit; solo los pesos cuantizados proceden del minero. Es, por tanto, un artefacto de investigacion sobre compresion extrema y fidelidad al profesor, no un modelo con evaluacion convencional publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen/Qwen3.8-27B, cuantizada con el esquema prism_hadamard_qwen35 (codigos ternarios + transformada de Hadamard) |
| Parametros totales | 27 359 638 768 (~27,36 B) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit ternario con cuantizacion affine de MLX: codigos de 2 bits, escala fp16 y bias (-d) por bloque de 128 pesos; 2,25 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX); un unico model.safetensors de 8,60 GB; layout prism_hadamard_qwen35 |
| Modelo base | Qwen/Qwen3.8-27B (relacion: quantized) |
| Tamano del repositorio | 8,6 GB |
| Biblioteca | mlx |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer Qwen/Qwen3.8-27B, sobre la que se aplica una cuantizacion post-entrenamiento a 2 bits. El esquema, denominado prism_hadamard_qwen35, combina codigos ternarios (tres niveles de peso) con una rotacion de Hadamard cuyos vectores de signo se heredan del modelo de Prism. Cada bloque de 128 pesos conserva su codigo ternario y una escala fp16, de modo que el peso decodifica al mismo valor numerico que usa el kernel GGUF equivalente; el autor afirma que la conversion desde la submission original se hizo sin perdida. El resultado son 2,25 bits por peso efectivos.

No hay informacion disponible sobre el volumen de datos de entrenamiento, la composicion del dataset ni sobre fases de RLHF o DPO: al tratarse de un proceso de cuantizacion, no de preentrenamiento, esas fases corresponderian al modelo profesor, cuyos detalles no se recogen en la informacion proporcionada. La innovacion tecnica destacable es doble: por un lado, el procedimiento de cuantizacion ternaria con Hadamard orientado a minimizar la divergencia KL respecto al profesor; por otro, el soporte de decodificacion especulativa mediante la cabeza de borrador multi-token de MTPLX (modo `mtp` con `--depth 1`), que eleva el rendimiento de 55,3 a 66,6 tokens por segundo en el servidor de referencia.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (text-generation) y la etiqueta conversational.
- Razonamiento y generacion de codigo heredados del modelo profesor Qwen/Qwen3.8-27B; no se han publicado evaluaciones especificas que cuantifiquen la degradacion en estas tareas tras la cuantizacion.
- Decodificacion especulativa con cabeza de borrador multi-token (MTPLX `--generation-mode mtp --depth 1`), con una ganancia medida del 20 % en throughput.
- Incluye una torre de vision heredada del pack de Prism; la informacion disponible no documenta ni verifica el soporte real de entrada de imagenes en este checkpoint.
- Soporte de tool calling, function calling y comportamiento agentico: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo de razonamiento explicito (thinking): no documentado.

## Casos de uso

- Inferencia local en Mac con memoria unificada: cargar el checkpoint con `mlx_lm.generate` o con MTPLX permite disponer de un modelo de 27B en un equipo de sobremesa Apple Silicon, sin GPU dedicada y con un peso en disco de 8,60 GB.
- Prototipado rapido de asistentes conversacionales: el formato MLX y la instruccion de una sola linea facilitan iterar sobre prompts y evaluar respuestas en local antes de mover cargas a infraestructura mayor.
- Investigacion sobre cuantizacion extrema: sirve como punto de referencia reproducible (KL 0,09425, distancia de estados ocultos 0,3138) para comparar tecnicas de compresion ternaria frente al profesor BF16.
- Evaluacion de fidelidad al docente: util para estudiar como se degrada un modelo de 27B al reducirlo a 2,25 bits por peso en tareas de generacion libre, midiendo divergencia de distribuciones en lugar de exactitud en benchmarks.
- Despliegue en el borde con restricciones de memoria: 8,60 GB de pesos encajan en equipos con 16 GB o mas de memoria unificada, lo que habilita asistentes off-line en portatiles Apple Silicon.
- Servicio HTTP de baja concurrencia: con MTPLX en modo servidor y decodificacion especulativa se obtienen 66,6 tokens por segundo en batch 1, suficiente para un asistente personal o una demo interactiva.
- Comparativa de runtimes: al existir un gemelo GGUF de los mismos pesos, permite medir diferencias de rendimiento entre MLX (59,9 tok/s en proceso) y llama.cpp (56,4 tok/s) sobre el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas metricas publicadas son de fidelidad respecto al profesor y de velocidad.

| Metrica | Este modelo | King anterior | Genesis |
|---|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta | 0,09425 | 0,09586 | 21,4 % peor que este modelo |
| Distancia de estados ocultos, media cada 8 capas | 0,3138 | 0,3186 | 30,5 % peor que este modelo |

| Motor y modo | Hardware | Decodificacion (tok/s) |
|---|---|---|
| MTPLX 2.12 (mlx 0.32), servidor, plain | Mac Studio M3 Ultra, GPU de 80 nucleos, 512 GB | 55,3 |
| MTPLX 2.12 (mlx 0.32), servidor, especulativo (`--depth 1`) | Mac Studio M3 Ultra | 66,6 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | Mac Studio M3 Ultra | 59,9 |
| Gemelo GGUF en el fork de llama.cpp de Dendrite | Mac Studio M3 Ultra | 56,4 |
| Gemelo GGUF en el fork de llama.cpp de Dendrite | RTX PRO 6000 | 137,0 |

Las mediciones de servidor corresponden a 256 tokens generados sobre un prompt de codigo y cronometrados por HTTP; las mediciones en proceso, a 128 tokens sin servidor. El autor indica que todos los "q2 king" comparten layout y tamano, por lo que las cifras se mantienen dentro del ruido entre ejecuciones.

## Requisitos de hardware

- VRAM o memoria unificada estimada: unos 8,6 GB solo para los pesos; con cache KV, buffers de decodificacion especulativa y overhead del runtime, conviene reservar 10-12 GB. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: el formato MLX requiere Apple Silicon; el hardware de referencia de las mediciones es un Mac Studio con M3 Ultra (GPU de 80 nucleos, 512 GB). Para GPUs NVIDIA hay que usar el gemelo GGUF, medido a 137 tok/s en una RTX PRO 6000.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB de memoria unificada o mas; en el ecosistema NVIDIA, el gemelo GGUF de 8,6 GB encaja en tarjetas de 12 GB o mas (RTX 4090 incluida), aunque no se han publicado mediciones en esa configuracion.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, `mlx_lm.server`), MTPLX 2.12 como servidor con modo especulativo, y cualquier runtime que lea el layout prism_hadamard_qwen35. Para el gemelo GGUF, el fork de llama.cpp de DendriteLabs.
- Latencia y throughput: 55,3 tok/s en modo plain y 66,6 tok/s con decodificacion especulativa en servidor (M3 Ultra, batch 1), lo que equivale a unos 18 ms por token en el modo plain y unos 15 ms en el especulativo. No hay datos de throughput con batches mayores ni de latencia de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ingot-X-27B-MLX-2bit | 27,36 B | no disponible | 2-bit ternario MLX (2,25 bits/peso), 8,60 GB | KL 0,09425; 55,3-66,6 tok/s en M3 Ultra | no disponible | Hugging Face, MLX |
| dendriteholdings/Ingot-X-27B-Q2 | 27,36 B (mismos pesos) | no disponible | Q2 GGUF | KL identica por construccion; 56,4 tok/s en M3 Ultra, 137 tok/s en RTX PRO 6000 | no disponible | Hugging Face, llama.cpp |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27 B (aproximado) | no disponible | Q2 | 21,4 % peor en KL y 30,5 % peor en distancia de estados ocultos | no disponible | Hugging Face |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27 B (aproximado) | no disponible | 2-bit ternario MLX | no disponible | no disponible | Hugging Face; origen de la torre de vision, config y tokenizer |
| Qwen/Qwen3.8-27B (profesor BF16) | 27 B (aproximado) | no disponible | BF16 | Referencia de las metricas KL; sin benchmarks recogidos aqui | no disponible | Hugging Face |

## Limitaciones y advertencias

- La cuantizacion a 2,25 bits por peso implica una divergencia no nula respecto al profesor (KL 0,09425 por token). En tareas de razonamiento largo, matematicas o generacion de codigo la degradacion puede ser sensiblemente mayor que la sugerida por esa metrica agregada, y no se han publicado evaluaciones por tarea.
- Ausencia total de benchmarks convencionales: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, por lo que no es posible comparar su calidad con modelos de tamano similar mediante metricas estandar.
- Licencia no disponible: sin terminos declarados no se puede asumir uso comercial. Ademas, la licencia del modelo profesor (Qwen/Qwen3.8-27B) y la del pack de Prism del que se heredan config, tokenizer y torre de vision pueden imponer condiciones adicionales que la model card no recoge.
- Idiomas no documentados: se desconoce la cobertura multilingue real tras la cuantizacion; el comportamiento en castellano no esta verificado.
- Longitud de contexto no disponible: no se puede planificar su uso en escenarios de contexto largo sin verificacion empirica previa.
- Riesgo de alucinacion: inherente a un modelo de lenguaje generativo, agravado por la compresion ternaria; no se ha publicado ninguna evaluacion de factualidad.
- Dependencia de un layout propietario (prism_hadamard_qwen35) y de kernels especificos: mlx-lm estandar puede requerir los kernels ternarios de MTPLX para funcionar correctamente, lo que limita la portabilidad y complica el despliegue en produccion.
- Procedencia: los pesos provienen de la submission anonima de un minero (hotkey `5DfFe28YvhBmvj2BEggFGfFnFgFWLzEKiRxea9HUwyyyGyJV`, uid 199) en un certamen de Bittensor. El modelo lo publica dendriteholdings como espejo, no el autor original de los pesos, y no existe auditoria independiente de la calidad ni del contenido del checkpoint mas alla de la evaluacion del validador.
- Modelo practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion en la comunidad que permitan contrastar su comportamiento.
- La torre de vision heredada no debe asumirse funcional: no hay documentacion de soporte de imagenes en este pack.
- Fecha de creacion registrada como 2026-10-28, posterior a la de la mayoria de los modelos de referencia; conviene verificar la vigencia de los enlaces y del runtime antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-X-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-X-27B-Q2
- Genesis del certamen: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Pack de origen (torre de vision, config, tokenizer, Hadamard): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Repositorio del subnet Ingot: https://github.com/DendriteLabs/ingot
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Registro en free2aitools: https://free2aitools.com/model/dendriteholdings/ingot-x-27b-q2
- Articulo sobre PrismML y la compresion de un modelo de 27B para iPhone: https://thenextweb.com/news/apple-prismml-on-device-ai-compression-iphone
