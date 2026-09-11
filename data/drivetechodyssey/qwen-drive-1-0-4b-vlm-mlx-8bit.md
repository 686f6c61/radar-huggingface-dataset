# drivetechodyssey/Qwen-Drive-1.0-4B-VLM-mlx-8bit

## Resumen

Qwen-Drive-1.0-4B-VLM-mlx-8bit es una conversion a MLX del submodelo de vision-lenguaje (VLM) incluido en Qwen/Qwen-Drive-1.0-4B, el modelo fundacional vision-lenguaje para conduccion autonoma publicado por el equipo Qwen (Alibaba Group). El repositorio lo mantiene el usuario drivetechodyssey y su unico proposito es reempaquetar los pesos originales en formato MLX cuantizado a 8 bits para que funcionen en Macs con Apple Silicon, sin modificar el modelo en si. El modelo resuelve tareas de respuesta visual a preguntas (VQA) sobre imagenes de conduccion: describir escenas, identificar riesgos y responder que deberia hacer el vehiculo ego a continuacion.

El modelo base completo consta de tres componentes: el VLM Qwen3.5-4B, un Planning Expert que genera trayectorias y una cabeza de percepcion BEV que produce cajas 3D, ocupacion y mapa. Este repositorio contiene unicamente el VLM: el planning y la percepcion requieren el codigo PyTorch original. Los pesos ocupan 4.539.265.536 parametros (unos 4,54 mil millones) y el repo pesa 5,2 GB en safetensors cuantizados.

La relevancia de esta ficha es doble: por un lado documenta como ejecutar un VLM especializado en conduccion autonoma en hardware de consumo Apple sin GPU dedicada; por otro, sirve de ejemplo de las precauciones necesarias al cuantizar (el autor tuvo que restaurar 24 tensores `norm.weight` en float32 para evitar derivas en respuestas largas). La licencia es Apache 2.0 y el modelo esta marcado explicitamente como no apto para decisiones de conduccion reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (familia Qwen3.5) con capas de atencion lineal; vision encoder con `vision_config.model_type` = `qwen3_5` |
| Parametros totales | 4.539.265.536 (VLM unicamente; no incluye Planning Expert ni cabeza BEV) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits afines (affine), grupo de 64; existe version bf16 (8,5 GB) del mismo autor; se probo una version de 4 bits (2,9 GB) que no se publico |
| Idiomas soportados | Ingles (declarado); respuestas en coreano verificadas en las pruebas del autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 5,2 GB de repositorio |

## Arquitectura y entrenamiento

El VLM pertenece a la familia Qwen3.5 y combina un codificador visual con un decodificador de lenguaje de 4B aproximados. La configuracion de vision usa `model_type: qwen3_5` porque mlx-vlm 0.6.0 no acepta el identificador original `qwen3_5_vision`. La presencia de tensores `A_log` y `norm.weight` por capa en el checkpoint original indica capas de atencion lineal hibridas junto a atencion estandar, un patron habitual en las variantes eficientes de Qwen. El `lm_head` esta atado a las embeddings. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas; el paper citado (arXiv:2609.00111) es la referencia para esos datos.

El proceso de conversion documentado por el autor es relevante tecnicamente: se extraen los 723 tensores con prefijo `vlm.` del `model.safetensors` original, se reescribe el `config.json` a partir del `vlm_config`, y se aplica `mlx_vlm.convert --dtype bfloat16 -q --q-bits 8 --q-group-size 64`. La innovacion practica esta en la correccion posterior: el convertidor preservaba `A_log` en float32 pero casteaba a bf16 los 24 tensores `norm.weight` de las capas de atencion lineal, lo que provocaba que las respuestas largas en decodificacion greedy se desviaran del original a partir de unos 700 caracteres. Esos 24 tensores se copiaron de nuevo desde el checkpoint original, quedando 48 tensores en float32.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imagenes de conduccion: descripcion de escena, identificacion de riesgos y recomendacion de accion del vehiculo ego.
- Generacion de descripciones largas de escena (hasta 400 tokens en las pruebas del autor).
- Respuestas breves de seguridad: identificacion de peligros en una sola frase.
- Generacion multilingue parcial: ingles de forma nativa segun la model card y respuestas en coreano verificadas en las pruebas.
- Plantilla de chat con soporte de modo thinking (`enable_thinking`), aunque en la CLI la salida empieza con un bloque `<think>` vacio.
- No incluye tool calling ni function calling documentados.
- No incluye capacidades de agente ni razonamiento multi-paso documentadas.
- No incluye planning de trayectorias ni percepcion BEV: esos modulos viven en el modelo base PyTorch.

## Casos de uso

- Investigacion academica en VQA para conduccion autonoma: permite reproducir y auditar el comportamiento del VLM de Qwen-Drive-1.0 en un Mac, sin acceso a GPU dedicada, usando las mismas imagenes de demo del repositorio original.
- Evaluacion comparativa de cuantizacion: el repositorio incluye una metodologia replicable (16 imagenes x 3 preguntas, decodificacion greedy) para medir cuanto degrada la cuantizacion de 8 bits frente a bf16 en una tarea multimodal concreta.
- Docencia y prototipado en vision-lenguaje: el comando de una linea con `mlx_vlm.generate` permite mostrar en clase como un VLM multimodal procesa una imagen y responde en lenguaje natural, con temperatura 0 para resultados reproducibles.
- Etiquetado asistido de datasets de conduccion: generar descripciones de escena en ingles sobre fotogramas capturados por camara frontal, revisables despues por un humano, dado que el modelo no debe usarse para decisiones reales.
- Analisis de riesgo en post-proceso offline: dado un fotograma, obtener una frase de peligro que sirva como señal auxiliar en estudios de deteccion de riesgos, siempre con validacion humana.
- Pruebas de robustez multilingue: verificar como se comporta el modelo ante preguntas en idiomas distintos del declarado (el autor documenta contaminacion ocasional de coreano con caracteres chinos), util para estudios de fuga entre idiomas.
- Desarrollo de herramientas sobre mlx-vlm: servir como caso de prueba de conversion y cuantizacion de modelos multimodales en Apple Silicon, incluida la verificacion de que los tensores de normalizacion se mantienen en float32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si publica mediciones de fidelidad y rendimiento frente a los pesos originales y a la version bf16, realizadas en un M5 Max de 64 GB con mlx 0.31.2 y mlx-vlm 0.6.0, decodificacion greedy, sobre 16 imagenes del repositorio original y 3 preguntas por imagen (48 respuestas en total):

| Metrica | Original en mlx-vlm | bf16 | 8 bits (este repo) |
|---|---:|---:|---:|
| Respuestas identicas a bf16 (de 48) | 48 | 48 | 20 |
| Similitud media de caracteres con bf16 | 1,00 | 1,00 | 0,76 |
| Respuestas con otro alfabeto mezclado | 1 | 1 | 1 (la misma) |
| Bucles de repeticion | 0 | 0 | 0 |
| Velocidad de generacion (mediana de dos pasadas) | 53 tok/s | 55 / 53 tok/s | 96 tok/s |
| Procesamiento de prompt (mediana) | 2.815 tok/s | 2.511 tok/s | 1.960 tok/s |
| Memoria pico | 10,8 GB | 10,8 GB | 7,8 GB |

El autor indica que, en los casos de una frase de peligro donde el modelo de 8 bits difiere de bf16, las diferencias son reformulaciones y no objetos inventados ni posiciones erroneas. La version de 4 bits (2,9 GB, unos 150 tok/s, medida antes de restaurar las normas en float32) no se publico porque describia pasos de cebra ausentes en tres imagenes y no detectaba el coche aparcado mas cercano en una cuarta.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 7,8 GB de pico medidos en inferencia con 8 bits; el repo de pesos ocupa 5,2 GB. La version bf16 del mismo autor necesita 10,8 GB de pico y 8,5 GB de pesos.
- Hardware medido: Apple M5 Max con 64 GB de memoria unificada. No hay mediciones publicadas para otros chips.
- Compatibilidad con GPU de consumo: excluida por diseño; el repositorio es MLX y esta pensado para Apple Silicon (familia M). No se documenta soporte para CUDA, ROCm ni Vulkan.
- Cabe en Macs de gama media: por tamano de pesos, un equipo con 16 GB de memoria unificada o mas deberia poder cargar la version de 8 bits, aunque esta estimacion no esta verificada por el autor y debe comprobarse en cada maquina.
- Opciones de despliegue: mlx-vlm 0.6.0 (CLI `mlx_vlm.generate` o API de Python `load`, `apply_chat_template`, `generate`) sobre mlx 0.31.2. No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput medidos: 96 tok/s de generacion y 1.960 tok/s de procesamiento de prompt en 8 bits, frente a 53-55 tok/s y 2.511-2.815 tok/s en bf16. La cuantizacion acelera la generacion pero reduce la velocidad de prefill.
- Para el planning y la percepcion BEV hace falta el codigo PyTorch original, o la rama `apple-silicon` del repositorio del autor ejecutando sobre MPS.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Memoria pico | Velocidad generacion | Licencia |
|---|---|---:|---:|---:|---|
| drivetechodyssey/Qwen-Drive-1.0-4B-VLM-mlx-8bit | 4,54 B (VLM) | safetensors MLX, 8 bits afines, grupo 64 | 7,8 GB | 96 tok/s | Apache 2.0 |
| drivetechodyssey/Qwen-Drive-1.0-4B-VLM-mlx-bf16 | 4,54 B (VLM) | safetensors MLX, bf16 | 10,8 GB | 53-55 tok/s | Apache 2.0 |
| Qwen/Qwen-Drive-1.0-4B (original) | 4,54 B (VLM) mas Planning Expert y cabeza BEV | PyTorch, sin cuantizar | No disponible | No disponible | Apache 2.0 |
| Version de 4 bits del mismo autor | 4,54 B (VLM) | MLX 4 bits, 2,9 GB | No disponible | ~150 tok/s | No publicada |

No se dispone de datos de benchmarks que permitan comparar este modelo con alternativas de otros autores (por ejemplo, otros VLM de conduccion autonoma). La comparativa se limita por tanto a las variantes de cuantizacion del mismo modelo, que es lo unico documentado en la informacion disponible.

## Limitaciones y advertencias

- Uso restringido: el autor declara explicitamente que no sirve para decisiones de conduccion. Es un modelo de investigacion y demostracion, y sus respuestas pueden ser erroneas.
- Solo contiene el VLM: no incluye el Planning Expert ni la cabeza de percepcion BEV del modelo base, por lo que no produce trayectorias, cajas 3D, ocupacion ni mapas.
- Degradacion por cuantizacion: solo 20 de 48 respuestas coinciden exactamente con bf16, con una similitud media de caracteres de 0,76. En tareas que exijan fidelidad literal al modelo original hay que usar la version bf16.
- Riesgo de alucinacion documentado: la version de 4 bits inventaba pasos de cebra y omitia vehiculos aparcados, motivo por el que no se publico. No hay garantia de que la version de 8 bits este libre de errores equivalentes en otras imagenes.
- Mezcla de alfabetos: incluso en bf16, una de cada 16 respuestas en coreano contiene un caracter o palabra en chino (ejemplo reportado: `신호灯的`). El ingles es el idioma declarado en la model card.
- Dependencia de plataforma: requiere Apple Silicon y mlx-vlm 0.6.0; la configuracion de vision se parcheo a `qwen3_5` precisamente porque esa version no acepta `qwen3_5_vision`, lo que puede romper la compatibilidad con versiones futuras de la libreria.
- Sin datos publicados de sesgos, evaluaciones de seguridad ni contexto maximo verificado.
- Licencia Apache 2.0, igual que el modelo original, por lo que el uso comercial esta permitido tecnicamente; los pesos son del equipo Qwen (Alibaba Group) y este repositorio solo cambia el formato.
- Riesgo de deriva en generaciones largas si se reconvierte el modelo: el autor documenta que no restaurar los 24 tensores `norm.weight` en float32 provoca divergencias a partir de unos 700 caracteres en decodificacion greedy.
- Contexto de aplicacion peligroso: cualquier uso en un vehiculo real, incluso como asistencia, queda fuera del proposito declarado y de las garantias del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/drivetechodyssey/Qwen-Drive-1.0-4B-VLM-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Drive-1.0-4B
- Version bf16 del mismo autor: https://huggingface.co/drivetechodyssey/Qwen-Drive-1.0-4B-VLM-mlx-bf16
- Rama apple-silicon del repositorio de Qwen-Drive-1.0: https://github.com/drivetechodyssey-tech/Qwen-Drive-1.0/tree/apple-silicon
- MLX: https://github.com/ml-explore/mlx
- Paper: Qwen-Drive-1.0: An Initial Step towards a Vision-Language Foundation Model for Autonomous Driving, arXiv:2609.00111, https://arxiv.org/abs/2609.00111
