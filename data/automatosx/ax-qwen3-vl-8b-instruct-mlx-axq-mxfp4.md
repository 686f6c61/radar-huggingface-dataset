# AutomatosX/AX-Qwen3-VL-8B-Instruct-MLX-AXQ-MXFP4

## Resumen

AX-Qwen3-VL-8B-Instruct-MLX-AXQ-MXFP4 es un checkpoint cuantizado en formato MLX para Apple Silicon, publicado por AutomatosX a partir del modelo multimodal Qwen/Qwen3-VL-8B-Instruct. No es un modelo nuevo ni un reentrenamiento: es una conversión de precisión mixta generada con la herramienta propietaria AXQuant 1.9.0, que aplica cuantización de 4 bits tipo MXFP4 a la mayor parte de las capas del decodificador de texto y conserva la torre de visión en BF16.

El modelo mantiene los 8,77 mil millones de parámetros lógicos del original (arquitectura densa Qwen3VLForConditionalGeneration) y declara una longitud de contexto configurada de 262.144 tokens. El resultado ocupa 6,75 GB en safetensors, con un BPW medido de 6,1588, lo que permite ejecutarlo en equipos con memoria unificada modesta dentro del ecosistema de MLX.

Su relevancia es acotada y honesta: el propio autor lo etiqueta como evidencia de desarrollo, no como una release certificada. No publica métricas de calidad, de contexto largo ni de velocidad de kernel, de modo que su interés actual es servir como artefacto de evaluación local para desarrolladores que trabajan con MLX-VLM en Mac, no como sustituto validado del modelo BF16 en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (dense, vision-language) |
| Parametros totales | 8.767.123.696 (8,77B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (configurado; limite practico dependiente de memoria unificada) |
| Tipos de cuantizacion | Mixta: 4bit MXFP4 (79,23% de parametros), 8bit (7,10%), BF16 (13,68%); metodos affine, bf16 y mxfp4; group sizes 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (no incluye pesos PyTorch ni GGUF) |
| BPW medido | 6,1588 (BPW total y del modelo principal) |
| Tamano de pesos safetensors | 6,75 GB |
| Descarga aproximada completa | 6,77 GB |
| Cuantizador | AXQuant 1.9.0 |
| Clase de presupuesto en el Hub | MXFP4 (base de precision AXQuant: 8bit) |
| BPW planificado ajustado a almacenamiento | 6,7528 |
| Vision | Si (torre preservada en BF16 dentro de los shards principales) |
| Audio | No |
| Sidecar MTP | No incluido |
| Runtime primario | MLX-VLM (MLX 0.32.1 registrado) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (revision 0c351dd01ed87e9c1b53cbc748cba10e6187ff3b) |

## Arquitectura y entrenamiento

El checkpoint reutiliza integramente la arquitectura del modelo base: un transformer denso multimodal de la familia Qwen3-VL que combina un decodificador de lenguaje con una torre de visión, bajo la clase `Qwen3VLForConditionalGeneration`. No hay entrenamiento nuevo, ni ajuste fino, ni RLHF/DPO propio de esta publicacion: todo el trabajo de AutomatosX es de conversion de precision sobre los pesos BF16 originales, con un alcance de optimizacion declarado de "text-path".

La innovacion tecnica esta en el esquema de cuantizacion de AXQuant, que no aplica una precision uniforme. Segun el desglose publicado, el 79,23% de los parametros (6,95B) queda en 4 bits, un 7,10% (622,33M) en 8 bits y un 13,68% (1,20B) se mantiene en BF16, para aterrizar en un BPW medido de 6,1588 frente a los 6,7528 planificados. La asignacion se baso en priors de arquitectura, no en calibracion con datos: el registro de ejecucion indica 253 de 253 conversiones de modulo correctas y cero fallbacks. La torre de vision se conserva en BF16 y no se incluye ningun sidecar de vision ni de MTP; el propio autor advierte que la presencia de tensores protegidos no implica por si misma aceleracion MTP ni calidad vision-lenguaje.

## Capacidades

- Generacion de texto y razonamiento conversacional multturno, heredados del decodificador de Qwen3-VL-8B-Instruct.
- Comprension de imagen y texto (pipeline `image-text-to-text`): descripcion de imagenes, respuesta a preguntas visuales y dialogos guiados por imagen.
- Generacion y explicacion de codigo, ademas de razonamiento matematico basico, en linea con las capacidades del modelo base.
- Soporte multilingue: no disponible (no se declara lista de idiomas en esta ficha).
- Tool calling y function calling: capacidad del modelo base, no verificada de forma especifica por el autor en este checkpoint.
- Modo "thinking" y razonamiento multi-paso: capacidad del modelo base, no evaluada en esta conversion.
- Vision: si, con la torre en BF16; calidad vision-lenguaje no evaluada ni reclamada por el autor.
- Audio: no soportado.
- Decodificacion especulativa (MTP): no incluida, sin sidecar MTP.

## Casos de uso

- Evaluacion local de modelos multimodales en Mac: cargar el checkpoint con MLX-VLM para comprobar como se comporta una cuantizacion mixta de 6,16 BPW frente al BF16 en tareas de imagen y texto, sin depender de GPU dedicada.
- Prototipado de asistentes que describen imagenes: dado el pipeline `image-text-to-text`, sirve para construir demos que reciben una imagen y un prompt y devuelven una descripcion o respuesta, util en fases tempranas de producto.
- Analisis de capturas y documentos escaneados: extraccion de informacion de pantallazos o formularios en flujos internos, siempre que se acepte la ausencia de garantias de calidad publicadas.
- Desarrollo de aplicaciones de accesibilidad: generacion de descripciones alternativas de contenido visual en herramientas locales que corren sobre Apple Silicon.
- Asistencia de codigo en el portatil: uso del decodificador cuantizado para autocompletado, explicacion de fragmentos y generacion de codigo en entornos de desarrollo sin conexion.
- Experimentacion en investigacion sobre cuantizacion: el paquete funciona como caso de estudio de asignacion de precision por priors de arquitectura, con 253/253 conversiones registradas y cero fallbacks, util para comparar estrategias de cuantizacion mixta.
- Automatizacion de clasificacion imagen-texto en pipelines de datos: etiquetado preliminar de imagenes en lotes pequenos donde el coste de una GPU dedicada no esta justificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publica evidencia de calidad frente a BF16 o a lineas base uniformes, que no hay reclamacion de retencion de calidad, que la aceptacion y velocidad de MTP no se han medido y que la evidencia de kernels de AX Engine esta "unmeasured". La capacidad de 262.144 tokens es metadata de configuracion, no una afirmacion validada.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con runtime MLX (MLX-VLM). No hay pesos PyTorch ni GGUF, por lo que no se puede ejecutar en CUDA ni en llama.cpp/Ollama tal cual.
- Espacio en disco: al menos 6,77 GB libres para la descarga completa (6,75 GB de safetensors).
- Memoria unificada estimada para inferencia: el autor no declara un minimo; como referencia practica, los 6,77 GB de pesos mas el coste de KV cache sugieren un suelo en torno a 8-10 GB, y bastante mas para contextos largos. Cifra orientativa, no confirmada por el autor.
- Contexto largo: los 262.144 tokens son capacidad de configuracion; el limite real depende de la memoria unificada del equipo y de la KV cache.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este artefacto, que esta pensado para el stack MLX.
- Consumer GPU: no procede; el objetivo son Mac con chip de la serie M.
- Opciones de despliegue: MLX-VLM como runtime primario. La ejecucion nativa con AX Engine no esta establecida, ya que el paquete no incluye un `model-manifest.json` validado.
- Latencia y throughput: no disponibles. No hay mediciones de velocidad de kernel ni de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Estado de validacion |
|---|---|---|---|---|---|
| AX-Qwen3-VL-8B-Instruct-MLX-AXQ-MXFP4 (este) | 8,77B | 262.144 tokens (config.) | MLX safetensors / MLX-VLM | apache-2.0 | Evidencia de desarrollo, no certificado; sin benchmarks |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8,77B | 262.144 tokens (config.) | PyTorch safetensors / varios | apache-2.0 | Modelo oficial con benchmarks publicados en su propia card (no reproducidos aqui) |
| AX-Qwen3-VL-8B-Instruct-MLX-AXQ-4bit (hermano) | 8,77B | no disponible | MLX safetensors / MLX-VLM | apache-2.0 | Presupuesto AXQ menor; BPW exacto no consultado |
| AX-Qwen3-VL-8B-Instruct-MLX-AXQ-6bit (hermano) | 8,77B | no disponible | MLX safetensors / MLX-VLM | apache-2.0 | Presupuesto AXQ cercano a 6 BPW; BPW exacto no consultado |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete etiquetado por el propio autor como "Development evidence - not a certified AXQuant release": no ha superado las puertas formales M0-M8 de certificacion.
- Sin benchmarks de calidad: no se ha medido la degradacion frente al BF16 ni frente a cuantizaciones uniformes. No hay reclamacion de retencion de calidad.
- Cuantizacion por priors de arquitectura, sin calibracion con datos. La asignacion de precision no se ajusto con un conjunto de calibracion.
- La calidad vision-lenguaje no se ha evaluado, aunque la torre de vision se conserve en BF16.
- Capacidad de contexto no validada: los 262.144 tokens son metadata, no una afirmacion verificada de calidad en contexto largo.
- Sin sidecar MTP: no hay decodificacion especulativa ni reclamacion de aceleracion asociada.
- AX Engine: no incluye `model-manifest.json` nativo validado, por lo que la ejecucion con ese motor no esta establecida; los campos de AX Engine describen un contrato de compatibilidad previsto, no evidencia observada.
- Dependencia de plataforma: solo Apple Silicon con MLX. No hay pesos GGUF ni PyTorch, lo que descarta su uso directo en CUDA, vLLM, TGI o llama.cpp.
- Entorno de ejecucion registrado como MLX 0.32.1 y AXQuant 1.9.0; cambios de version pueden afectar a la compatibilidad.
- Reproducibilidad: conviene fijar el commit del Hub en lugar de depender de `main`.
- Licencia apache-2.0, heredada del modelo base; no se declaran restricciones adicionales de uso comercial, aunque el autor no ofrece garantias de calidad para produccion.
- Sesgos y riesgo de alucinacion: no documentados en esta ficha; son los heredados del modelo base Qwen3-VL-8B-Instruct y no se han medido en esta conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-VL-8B-Instruct-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3-VL-8B-Instruct-MLX-AXQ-4bit
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Qwen3-VL-8B-Instruct-MLX-AXQ-6bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Repositorio AX Engine en GitHub: https://github.com/defai-digital/ax-engine
