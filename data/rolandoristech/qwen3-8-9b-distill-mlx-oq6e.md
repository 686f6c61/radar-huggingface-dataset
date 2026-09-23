# RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ6e

## Resumen

Qwen3.8-9B-Distill-MLX-oQ6e es una version cuantizada, nativa de MLX, del modelo destilado de razonamiento Qwen3.8-9B-Distill (base `empero-ai/Qwen3.8-Distill`). La publica el usuario RolanDorisTech el 23 de septiembre de 2026, con licencia Apache 2.0 y un peso en disco de 7,0 GB. No se trata de un modelo entrenado desde cero, sino de una conversion de precision reducida del maestro BF16 de MLX, generada con la herramienta oMLX y el metodo oQe (quantization con imatrix de activaciones).

El modelo resuelve un problema muy concreto: permitir ejecutar un modelo de ~9B parametros con capacidad de razonamiento en equipos Apple Silicon sin renunciar en exceso a la fidelidad numerica. Frente a una cuantizacion uniforme de 4 bits (5,003 bpw) u 8 bits (8,502 bpw), esta version emplea precision mixta guiada por la sensibilidad real de cada capa, quedando en un rango efectivo de ~4,7-8,5 bpw con 7,0 GB de pesos. Incluye protecciones especificas: `lm_head` en 8 bits y capas de embedding y capas tempranas/tardias reforzadas.

Es relevante ahora por su encaje en el ecosistema local de Apple: los pesos son safetensors estandar de mlx-lm y funcionan con mlx-lm, oMLX, LM Studio y mlx-swift. La ficha del autor aporta mediciones de velocidad y memoria, pero no documenta longitud de contexto, idiomas soportados ni resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de la familia Qwen3 (no se detallan mas especificaciones en la model card) |
| Parametros totales | ~9.000 millones (segun la nomenclatura del modelo; no se declara el numero exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQe de 6 bits efectivos (~4,7-8,5 bpw); la familia incluye oQ4e, oQ5e, oQ6e y oQ8e |
| Idiomas soportados | No disponible (modelo exclusivamente de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors nativos de MLX (estandar mlx-lm) |
| Tamano en disco | 7,0 GB |
| Plantilla de chat | Plantilla de chat de Qwen3 con etiquetas `<think>` (`chat_template.jinja` incluida) |
| Modelo base | `empero-ai/Qwen3.8-Distill` (BF16 MLX master) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de su linaje Qwen3 y de su naturaleza de modelo destilado de razonamiento. Se trata, por tanto, de un transformer decoder cuya unica transformacion documentada es la cuantizacion, no un reentrenamiento: el autor parte del maestro BF16 de MLX y aplica el panel de cuantizacion de oMLX.

El metodo oQ es una cuantizacion de precision mixta guiada por datos para Apple Silicon: mide la sensibilidad real de cada capa y asigna bits donde el error perjudica mas. La variante oQe anade la importancia de activaciones tipo imatrix para ponderar la cuantizacion y reducir el error en canales relevantes. La receta concreta de compilacion fue: oQe activado, Reuse activado, cache automatica, Strict desactivado, Preserve MTP desactivado y bfloat16 para normas y escalas, con `lm_head` a 8 bits y refuerzo de embedding y capas extremas. El proceso se ejecuto en un Mac Studio M1 Max de 64 GB con GPU de 32 nucleos y macOS 27.0; el modelo de 9B en oQ6e tardo 3 minutos y 21 segundos en cuantizarse. No se documentan tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO, ya que el trabajo es exclusivamente de cuantizacion.

## Capacidades

- Generacion de texto con modo de razonamiento: usa la plantilla de chat de Qwen3 y etiquetas `<think>` para la cadena de pensamiento.
- Razonamiento matematico basico: en la prueba del autor, el prompt "Si 2x + 3 = 11, cuanto vale x, pensando paso a paso dentro de las etiquetas" devuelve el resultado correcto (x = 4).
- Modelo destilado de razonamiento: hereda del maestro la capacidad de resolver tareas paso a paso, con la perdida de fidelidad propia de la cuantizacion.
- Inferencia local en Apple Silicon mediante MLX, con integracion directa en mlx-lm, oMLX, LM Studio y mlx-swift.
- Modelo solo de texto: no se documentan capacidades de vision, audio ni multimodalidad.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no enumera idiomas soportados.

## Casos de uso

- Asistente de razonamiento 100 % local en Mac: al ejecutarse sobre MLX con 7,0 GB de pesos y un pico medido de 7,664 GB, permite resolver problemas matematicos y logicos sin enviar datos a servicios externos, algo critico en entornos con requisitos de confidencialidad.
- Analisis de documentos sensibles: contratos, informes medicos o codigo propietario pueden procesarse en la propia maquina; el modelo es solo de texto, por lo que la ingestion de PDF o Word requiere un paso previo de extraccion de texto.
- Generacion y revision de codigo en local: el modelo puede integrarse como asistente en editores sobre Apple Silicon mediante mlx-swift o como servidor local compatible con mlx-lm, evitando fugas de codigo a la nube.
- Prototipado y evaluacion de cuantizaciones: sirve como banco de pruebas para comparar oQ4e, oQ5e, oQ6e y oQ8e sobre el mismo prompt (por ejemplo, la ecuacion 2x + 3 = 11) y medir la relacion entre fidelidad, velocidad y memoria.
- Aplicaciones macOS e iOS embebidas: el formato safetensors de mlx-lm es consumible desde mlx-swift, lo que permite incrustar el modelo en una app nativa de Apple sin dependencias de Python.
- Uso educativo y de tutoria paso a paso: el modo `<think>` hace visible el razonamiento intermedio, lo que resulta util para generar explicaciones didacticas de problemas matematicos.
- Procesamiento por lotes en estaciones de trabajo Apple: en un Mac Studio M1 Max, el modelo rinde 84,3 tok/s en prefill y 33,3 tok/s en generacion, cifras suficientes para tareas de resumen o clasificacion de texto en volumen moderado.
- Chat de escritorio con LM Studio: el autor indica que basta buscar "RolanDorisTech/Qwen3.8-9B-Distill-oQ6e-MLX" en LM Studio y descargarlo para tener un chat local funcional sin configuracion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo aporta una prueba funcional (la ecuacion 2x + 3 = 11, resuelta correctamente con x = 4) y mediciones de velocidad y memoria en un Mac Studio M1 Max de 64 GB con GPU de 32 nucleos, usando ese mismo prompt.

| Variante | Tamano | Prefill (tok/s) | Generacion (tok/s) | Pico de memoria |
|---|---|---|---|---|
| Qwen3.8-9B-Distill-oQ6e (este modelo) | 7,0 GB | 84,3 | 33,3 | 7,664 GB |
| Qwen3.8-9B-Distill-oQ4e | 4,9 GB | 101,5 | 43,0 | 5,471 GB |
| Qwen3.8-9B-Distill-oQ5e | 6,0 GB | 91,3 | 37,1 | 6,555 GB |
| Qwen3.8-9B-Distill-oQ8e | 8,9 GB | 91,8 | 28,7 | 9,679 GB |
| Qwen3.8-4B-Distill-oQ4e | 2,3 GB | 133,7 | 65,4 | 2,684 GB |
| Qwen3.8-4B-Distill-oQ8e | 4,2 GB | 130,9 | 48,4 | 4,651 GB |
| Qwen3.8-2B-Distill-oQ4e | 1,1 GB | 267,7 | 118,6 | 1,241 GB |
| Qwen3.8-2B-Distill-oQ8e | 1,9 GB | 122,2 | 97,5 | 2,131 GB |

La medicion del modelo reseñado corresponde a una ejecucion con 37 tokens de prompt y 82 tokens generados.

## Requisitos de hardware

- Memoria unificada: el pico medido es de 7,664 GB con 7,0 GB de pesos en disco, por lo que se necesita un Mac con al menos 8 GB de memoria unificada libre; no se han publicado pruebas en equipos de 8 o 16 GB, solo en un Mac Studio M1 Max de 64 GB.
- GPU: exclusivamente Apple Silicon. El autor valida M1 Max de 32 nucleos; no hay soporte documentado para GPU NVIDIA, AMD o Intel.
- Cabe en GPU de consumo: si, en el sentido de que cualquier Mac con memoria unificada suficiente puede ejecutarlo, incluidos portatiles. No aplica a tarjetas graficas dedicadas porque el backend es MLX.
- Opciones de despliegue: mlx-lm (`pip install mlx-lm`), oMLX, LM Studio y mlx-swift. No se publican pesos GGUF, por lo que llama.cpp, Ollama y TGI no son compatibles con este artefacto concreto.
- Comando de inferencia documentado: `mlx_lm.generate --model RolanDorisTech/Qwen3.8-9B-Distill-oQ6e-MLX-oQ8e --prompt "Explain oQ vs oQe" --max-tokens 250 --temp 0.6 --top-p 0.95 --top-k 20`.
- Latencia y throughput: 84,3 tok/s en procesamiento de prompt y 33,3 tok/s en generacion sobre M1 Max de 32 nucleos. El tiempo de cuantizacion registrado fue de 3 minutos y 21 segundos, dato relevante solo si se quiere reproducir el proceso.
- Almacenamiento: 7,0 GB de pesos, mas el espacio de la cache y de la plantilla de chat.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con modelos de terceros. La comparacion posible es interna, dentro de la propia familia publicada por el autor, y contra los formatos de cuantizacion uniforme de referencia.

| Modelo o formato | Parametros | Tamano | bpw efectivo | Generacion (tok/s) | Pico de memoria | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-9B-Distill-oQ6e (este) | ~9B | 7,0 GB | ~4,7-8,5 | 33,3 | 7,664 GB | Apache 2.0 |
| Qwen3.8-9B-Distill-oQ8e | ~9B | 8,9 GB | no disponible | 28,7 | 9,679 GB | Apache 2.0 |
| Qwen3.8-9B-Distill-oQ4e | ~9B | 4,9 GB | no disponible | 43,0 | 5,471 GB | Apache 2.0 |
| Cuantizacion plana 4-bit g32 | ~9B | no disponible | 5,003 | no disponible | no disponible | no disponible |
| Cuantizacion plana 8-bit g64 | ~9B | no disponible | 8,502 | no disponible | no disponible | no disponible |
| Maestro BF16 de MLX | ~9B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

Comparativa con alternativas externas de la misma categoria (otros modelos de ~9B con razonamiento): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo destilado de razonamiento y el propio autor advierte de que puede alucinar.
- La cuantizacion es con perdida respecto al maestro BF16, aunque el autor afirma que es mas precisa que las cuantizaciones planas g32 y g64.
- Modelo exclusivamente de texto: no procesa imagenes, audio ni video.
- No se documenta la longitud de contexto soportada, dato imprescindible antes de usarlo en produccion con entradas largas.
- No se declaran los idiomas soportados; el castellano no esta confirmado explicitamente.
- Dependencia total del ecosistema Apple Silicon: no hay pesos GGUF y, por tanto, no se puede desplegar en llama.cpp, Ollama ni TGI sin una conversion adicional.
- La model card contiene inconsistencias que conviene verificar: el comando de ejemplo apunta al identificador `RolanDorisTech/Qwen3.8-9B-Distill-oQ6e-MLX-oQ8e` en lugar del repositorio real, y la lista de la familia describe la variante de 8,9 GB como "este es Qwen3.8-9B-Distill-oQ6e a 7,0 GB", lo que mezcla dos variantes distintas.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y fue creado y actualizado el mismo dia: no existe validacion de la comunidad ni garantia de mantenimiento.
- La licencia declarada es Apache 2.0, que permite uso comercial, pero no se detallan en la model card las condiciones del modelo maestro destilado ni la trazabilidad completa de los datos de destilacion.
- No hay resultados en benchmarks estandar, por lo que no es posible estimar su calidad relativa frente a otros modelos de tamano similar.
- Los sesgos conocidos: no disponible en la informacion proporcionada; al derivar de un modelo destilado, es previsible que herede los sesgos del maestro, pero el autor no los documenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ6e
- Modelo base declarado: https://huggingface.co/empero-ai/Qwen3.8-Distill
- Base del credito del autor (GGUF): https://huggingface.co/empero-ai/Qwen3.8-9B-Distill-GGUF
- Canal del autor: https://www.youtube.com/@RolanDorisTech
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada.
