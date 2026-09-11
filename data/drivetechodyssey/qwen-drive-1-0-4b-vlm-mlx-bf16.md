# drivetechodyssey/Qwen-Drive-1.0-4B-VLM-mlx-bf16

## Resumen

Qwen-Drive-1.0-4B-VLM-mlx-bf16 es la conversion a MLX, en precision bf16, del modelo de vision-lenguaje (VLM) que forma parte de Qwen/Qwen-Drive-1.0-4B, un modelo fundacional para conduccion autonoma desarrollado por el equipo Qwen de Alibaba Group. La conversion la mantiene el usuario drivetechodyssey y su unico proposito es permitir la inferencia en Macs con Apple Silicon sin depender de PyTorch ni de CUDA. Resuelve un problema de portabilidad: los pesos originales requieren el stack de PyTorch, mientras que esta version funciona con mlx-vlm sobre GPUs unificadas de Apple.

El modelo responde preguntas sobre imagenes de conduccion (VQA) en su modo de vision-lenguaje. Conviene subrayar que Qwen-Drive-1.0 consta de tres componentes (el VLM Qwen3.5-4B, un Planning Expert que genera trayectorias y una cabeza de percepcion BEV que produce cajas 3D, ocupacion y mapa), y este repositorio contiene unicamente el VLM. La planificacion y la percepcion siguen necesitando el codigo PyTorch original.

El modelo tiene 4.539.265.536 parametros (~4,54 B), ocupa 9,1 GB en el repositorio y se distribuye bajo licencia Apache 2.0, la misma que los pesos originales. La model card lo etiqueta explicitamente como material de investigacion y demostracion, no apto para tomar decisiones de conduccion. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 multimodal (vision-lenguaje); el componente de lenguaje incluye capas de atencion lineal; el encoder de vision usa `model_type: qwen3_5` en mlx-vlm 0.6.0 |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (este repositorio); 8-bit publicado por el mismo autor (4,8 GB); 4-bit probado pero no publicado (2,9 GB) |
| Idiomas soportados | en (segun la model card); se han realizado pruebas de generacion en coreano |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); 675 tensores en bf16 y 48 tensores en float32 |
| Libreria de inferencia | mlx (probado con mlx 0.31.2 y mlx-vlm 0.6.0) |
| Pipeline | image-text-to-text (visual question answering) |
| Modelo base | Qwen/Qwen-Drive-1.0-4B (relacion: quantized) |
| Tamano del repositorio | 9,1 GB |
| Fecha de publicacion | 2026-09-11 |

## Arquitectura y entrenamiento

Se trata de un modelo vision-lenguaje construido sobre Qwen3.5-4B. El componente de lenguaje incluye capas de atencion lineal, un detalle que se deduce de la propia receta de conversion: el modelo original mantiene en float32 los tensores `A_log` y `norm.weight` de cada capa de atencion lineal (48 tensores en total), y el conversor de MLX casteo a bf16 los 24 tensores `norm.weight`, lo que provocaba una deriva en respuestas largas. La conversion final reproduce el reparto original de precisiones: 675 tensores en bf16 y 48 en float32. El encoder de vision se declara con `vision_config.model_type: qwen3_5` porque mlx-vlm 0.6.0 no acepta el identificador `qwen3_5_vision`.

El proceso de conversion consistio en tres pasos: extraer del `model.safetensors` original todos los tensores cuyo nombre empieza por `vlm.` (723 tensores, con `lm_head` atado a los embeddings y el prefijo eliminado), ajustar el `config.json` al `vlm_config` original y convertir con `mlx_vlm.convert --dtype bfloat16`. El tokenizer, el processor y las plantillas de chat se copiaron sin cambios. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. El modelo conserva el modo de razonamiento explicito de la familia Qwen: la CLI de mlx-vlm imprime un bloque de pensamiento vacio antes de la respuesta.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas visuales (VQA) sobre imagenes captadas desde un vehiculo.
- Descripcion de escenas de conduccion en ingles, con respuestas largas de hasta varios cientos de tokens.
- Identificacion de peligros y resumen de una frase sobre el riesgo inmediato.
- Respuesta multilingue probada en coreano (dos o tres frases por respuesta), ademas del ingles declarado en la model card.
- Modo de pensamiento explicito: la plantilla genera un bloque `think` antes de la respuesta final (vacio en el ejemplo documentado).
- Conversacion multiturno mediante `apply_chat_template` con soporte de multiples imagenes por prompt (`num_images`).
- Exposicion como CLI (`mlx_vlm.generate`) y como API de Python (`load`, `generate`).
- No hay informacion disponible sobre soporte de tool calling, function calling, uso agentico, reasoning multi-paso, audio o generacion de trayectorias (esta ultima reside en el Planning Expert, no incluido en este repositorio).

## Casos de uso

- Investigacion en VQA de conduccion: consultar que elementos aparecen en un fotograma frontal, lateral izquierdo o lateral derecho y comparar respuestas entre cuantizaciones (bf16 frente a 8-bit) para medir la degradacion introducida por la cuantizacion.
- Prototipado en Mac: validar prompts y plantillas de chat en un portatil Apple Silicon antes de desplegar la version PyTorch en un servidor con GPU, sin necesidad de reescribir el codigo de inferencia.
- Generacion de descripciones de escena para anotacion asistida: producir descripciones largas (hasta 400 tokens) de fotogramas de camaras de conduccion que despues se revisan manualmente.
- Deteccion de peligros en una frase: obtener resumenes cortos del riesgo inmediato para alimentar sistemas de alerta o para comparar con anotaciones humanas.
- Evaluacion de cuantizaciones en pipelines de investigacion: el autor documenta que la version 4-bit no se publico porque describia pasos de cebra inexistentes en tres imagenes y omitia el coche aparcado mas cercano en una cuarta, lo que lo convierte en un caso de estudio sobre el umbral de cuantizacion aceptable en tareas de seguridad.
- Pruebas de robustez multilingue: ejecutar los mismos prompts en coreano e ingles para detectar mezcla de scripts, un fenomeno documentado (1 de 16 respuestas contenia el termino `신호灯的`).
- Docencia y demostraciones: ejecutar el modelo con `--temperature 0` para obtener respuestas deterministas y reproducibles en sesiones sobre modelos multimodales y conduccion autonoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una verificacion de equivalencia entre esta conversion y los pesos originales cargados en mlx-vlm, medida en un M5 Max (64 GB) con mlx 0.31.2 y mlx-vlm 0.6.0, decodificacion greedy, sobre 16 imagenes y 3 preguntas (48 prompts en total):

| Metrica | Pesos originales en mlx-vlm | bf16 (este repositorio) | 8-bit |
|---|---:|---:|---:|
| Respuestas identicas al bf16 (de 48) | 48 | 48 | 20 |
| Similitud media de caracteres respecto a bf16 | 1,00 | 1,00 | 0,76 |
| Respuestas con otro alfabeto mezclado | 1 | 1 | 1 (la misma) |
| Bucles de repeticion | 0 | 0 | 0 |
| Velocidad de generacion (mediana de dos pasadas) | 53 tok/s | 55 / 53 tok/s | 96 tok/s |
| Procesamiento de prompt (mediana) | 2.815 tok/s | 2.511 tok/s | 1.960 tok/s |
| Memoria maxima | 10,8 GB | 10,8 GB | 7,8 GB |

## Requisitos de hardware

- Entorno de referencia de la model card: Apple M5 Max con 64 GB de memoria unificada, mlx 0.31.2 y mlx-vlm 0.6.0, con la GPU libre de otras cargas.
- Memoria maxima medida para la version bf16: 10,8 GB (la misma que los pesos originales cargados en mlx-vlm). El repositorio ocupa 9,1 GB.
- Version 8-bit: 4,8 GB de pesos y 7,8 GB de memoria maxima, con 96 tok/s de generacion y 1.960 tok/s de procesamiento de prompt.
- Version 4-bit (no publicada): 2,9 GB y aproximadamente 150 tok/s, aunque con errores de descripcion de escena.
- No se dispone de datos de VRAM ni de rendimiento para GPU NVIDIA (A100, H100, RTX 4090) en la informacion proporcionada: este repositorio es especifico de MLX y Apple Silicon. Para CUDA hay que usar los pesos PyTorch originales.
- Opciones de despliegue documentadas: CLI `mlx_vlm.generate` y API de Python de mlx-vlm (`load`, `apply_chat_template`, `generate`) con `temperature=0` para decodificacion determinista. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Throughput medido en la configuracion de referencia: 55 tok/s en la primera pasada y 53 tok/s en la segunda (bf16), con 2.511 tok/s de procesamiento de prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Memoria maxima medida | Velocidad de generacion | Coincidencia con bf16 | Licencia |
|---|---|---|---:|---:|---:|---|
| drivetechodyssey/Qwen-Drive-1.0-4B-VLM-mlx-bf16 | ~4,54 B | MLX safetensors bf16 | 10,8 GB | 55 / 53 tok/s | 48/48 | apache-2.0 |
| drivetechodyssey/Qwen-Drive-1.0-4B-VLM-mlx-8bit | ~4,54 B (cuantizado) | MLX safetensors 8-bit | 7,8 GB | 96 tok/s | 20/48 | apache-2.0 |
| Qwen/Qwen-Drive-1.0-4B (pesos originales en mlx-vlm) | ~4,54 B | PyTorch safetensors | 10,8 GB | 53 tok/s | 48/48 | apache-2.0 |
| Version 4-bit (no publicada) | ~4,54 B (cuantizado) | MLX safetensors 4-bit | no disponible (2,9 GB de pesos) | ~150 tok/s | no disponible | no publicada |

No se dispone de informacion sobre otros modelos comparables de conduccion autonoma en la busqueda realizada. La comparativa se limita, por tanto, a las variantes de cuantizacion del mismo modelo y a los pesos originales.

## Limitaciones y advertencias

- La propia model card indica: "Not for driving decisions. Research and demonstration only. Answers can be wrong." No debe usarse para tomar decisiones de conduccion reales.
- Solo contiene el VLM. Quedan fuera el Planning Expert (trayectorias) y la cabeza de percepcion BEV (cajas 3D, ocupacion, mapa), que requieren el codigo PyTorch original.
- Riesgo de alucinacion visual comprobado: la version 4-bit describia pasos de cebra ausentes en tres imagenes y no detectaba el coche aparcado mas cercano en una cuarta, motivo por el que no se publico.
- Mezcla de scripts en la salida: 1 de 16 respuestas en coreano contenia un termino en chino (`신호灯的`). Este comportamiento tambien aparece en los pesos originales.
- La model card declara unicamente el idioma ingles (`language: en`), aunque el autor haya probado respuestas en coreano. No hay garantias de calidad en otros idiomas.
- Longitud de contexto no documentada: se desconoce el limite real de tokens de entrada.
- Deriva numerica en respuestas largas: el autor documenta que, si los 24 tensores `norm.weight` de las capas de atencion lineal permanecen en bf16, las respuestas greedy largas se desvian de los pesos originales a partir de unos 700 caracteres. En esta version el problema esta corregido.
- La licencia Apache 2.0 permite uso comercial, pero los pesos son del equipo Qwen (Alibaba Group) y este repositorio solo cambia el formato. Cualquier uso comercial queda sujeto a los terminos del modelo original.
- Dependencia de versiones concretas: el autor fija mlx-vlm 0.6.0 y el identificador `vision_config.model_type: qwen3_5` como ajuste especifico para esa version de la libreria.
- No se han publicado resultados de benchmarks estandar, por lo que no es posible comparar su calidad con otros modelos de forma objetiva.
- Modelo con 0 descargas y 0 likes en HuggingFace en el momento de la consulta: no existe validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/drivetechodyssey/Qwen-Drive-1.0-4B-VLM-mlx-bf16
- Version 8-bit del mismo autor: https://huggingface.co/drivetechodyssey/Qwen-Drive-1.0-4B-VLM-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Drive-1.0-4B
- Rama apple-silicon del repositorio de codigo: https://github.com/drivetechodyssey-tech/Qwen-Drive-1.0/tree/apple-silicon
- Libreria MLX: https://github.com/ml-explore/mlx
- Paper: Qwen-Drive-1.0: An Initial Step towards a Vision-Language Foundation Model for Autonomous Driving, arXiv:2609.00111 (https://arxiv.org/abs/2609.00111)
- Cita BibTeX (segun la model card): Zhou, Xin; Zhao, Zongchuang; Yang, Zhibo; Li, Mingsheng; Zhong, Humen; Bai, Shuai; Chu, Du; Chen, Ruizhe; Li, Zhaohai; Tang, Jun; Wang, Qiuyue; Yang, Mingkun; Zhang, Jiazhao; Liu, Dayiheng; Liang, Dingkang; Bai, Xiang (2026).
