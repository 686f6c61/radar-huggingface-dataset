# pipenetwork/Ternary-Bonsai-2-27B-MLX-bf16

## Resumen

Ternary-Bonsai-2-27B-MLX-bf16 es una conversion a formato MLX del modelo Ternary-Bonsai-2-27B de prism-ml, un Qwen3.8-27B ternarizado de 64 capas que combina atencion completa cada cuatro capas con capas Gated-DeltaNet, e incorpora la torre de vision oficial. La aportacion de esta version, publicada por pipenetwork, es que la rotacion Hadamard por bloques que usa el runtime original se ha "desplegado" de vuelta a la base de pesos estandar: el resultado carga en mlx-vlm sin modificaciones (version 0.7 o superior), sin runtime propio ni kernels parcheados.

Se trata de la variante sin cuantizar: los valores ternarios exactos almacenados en bf16, con 27.356.728.560 parametros (unos 27,36 mil millones) y un repositorio de 54,7 GB. Es el punto de partida adecuado para ajuste fino o para conversiones posteriores a otros formatos, y sirve como referencia de fidelidad frente a las compilaciones cuantizadas del mismo autor (2, 4, 6 y 8 bits).

Su relevancia practica es doble: por un lado elimina la dependencia de un runtime a medida para ejecutar un modelo ternario en Apple Silicon; por otro, documenta de forma verificable que el despliegue de la rotacion es exacto (`refold(unfold(W))` es identico bit a bit en fp32) y que la fidelidad frente al paquete de 2 bits de prism-ml se mantiene en el nivel de redondeo de bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida `qwen3_5`: 64 capas con Gated-DeltaNet (atencion lineal) y atencion completa cada 4 capas; incluye torre de vision |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Este repositorio es bf16 sin cuantizar (valores ternarios exactos en bf16); el mismo autor publica variantes MLX de 8 bits (29,5 GB), 6 bits (22,8 GB), 4 bits (16,1 GB) y prism-ml publica una de 2 bits (8,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de prism-ml/Ternary-Bonsai-2-27B-gguf; se incluye su NOTICE.txt) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`, requiere mlx-vlm >= 0.7) |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido etiquetado como `qwen3_5`, de 64 capas, en el que solo una de cada cuatro capas emplea atencion completa; el resto usa Gated-DeltaNet, un mecanismo de atencion lineal con estado recurrente. El modelo parte de un Qwen3.8-27B que ha sido ternarizado por prism-ml, e incorpora la torre de vision oficial, lo que habilita la modalidad image-text-to-text. El repositorio incluye, ademas, los pesos en la base estandar, es decir, el resultado de desplegar la rotacion Hadamard por bloques que el runtime original aplica sobre los pesos almacenados.

La innovacion tecnica destacable de esta publicacion no esta en el entrenamiento sino en la conversion: el autor verifica que `refold(unfold(W))` es identico bit a bit en fp32 y que el contrato de plegado se comprobo contra el runtime de prism-ml en lugar de asumirse (aplicar el vector de signos en el orden incorrecto desplaza los logits en 7,4, y la prueba lo detecta). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ni en esta model card ni en los datos proporcionados.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (pipeline declarado: image-text-to-text, con la etiqueta `conversational`).
- Vision y comprension de imagen: incluye la torre de vision oficial y el autor indica que la vision se verifico de extremo a extremo.
- Procesamiento de entradas intercaladas de imagen y texto (image-text-to-text).
- Inferencia sobre Apple Silicon mediante MLX, sin kernels personalizados.
- Base para ajuste fino: al ser pesos en base estandar y sin cuantizar, es el punto de partida recomendado por el autor para fine-tuning o conversion a otros formatos.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, codigo o matematicas: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Modo "thinking" o capacidades de audio: no disponibles.

## Casos de uso

- Ajuste fino sobre hardware Apple: al ser la variante bf16 en base estandar, permite entrenar o afinar con herramientas MLX convencionales sin lidiar con pesos rotados por Hadamard, algo imprescindible si se quiere adaptar el modelo a un dominio propio.
- Conversion a otros formatos de despliegue: sirve como origen limpio para generar builds GGUF, MLX cuantizados o cualquier otro formato, ya que los pesos estan en la base estandar y no requieren reimplementar la logica de plegado.
- Validacion de fidelidad de cuantizaciones: al actuar como referencia, permite medir la perdida real de las variantes de 4, 6 y 8 bits del mismo autor sobre las mismas ventanas de wikitext-2 o sobre tareas propias.
- Asistentes multimodales locales en Mac: con la torre de vision incluida y mlx-vlm, se puede construir un asistente que describa imagenes, responda preguntas sobre capturas o documentos escaneados y mantenga conversacion multi-turno, todo en local.
- Investigacion sobre cuantizacion ternaria: el par de repositorios (bf16 en base estandar y 2 bits rotado) permite estudiar experimentalmente el efecto de la ternarizacion y de la rotacion Hadamard sobre los logits y la perplejidad.
- Desarrollo y depuracion de pipelines MLX: al cargar en mlx-vlm sin runtime a medida, es util para integrar el modelo en prototipos, tests de regresion y comparativas de versiones de la libreria (por ejemplo, detectar el doble desplazamiento de normas de `qwen3_5` en versiones anteriores a 0.7).
- Evaluacion comparativa de arquitecturas hibridas: al combinar Gated-DeltaNet con atencion completa cada cuatro capas, permite estudiar el comportamiento de esta familia en tareas de texto largo, siempre que se determine experimentalmente su contexto util (no documentado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). Lo unico aportado son medidas de perplejidad y de fidelidad.

Perplejidad en wikitext-2 (test, 296.815 tokens, ventanas identicas ejecutadas con mlx-vlm estandar):

| Build | Tamano | Perplejidad |
|---|---:|---:|
| prism 2-bit, con su runtime | 8,6 GB | 8,9607 |
| bf16 (esta version, sin cuantizar) | 54,7 GB | 8,9679 |
| 8 bits | 29,5 GB | 8,9636 |
| 6 bits | 22,8 GB | 8,9548 |
| 4 bits | 16,1 GB | 9,1497 |

Fidelidad frente al paquete de 2 bits de prism-ml ejecutado en su propio runtime, con los mismos prompts y 81 posiciones: diferencia maxima de logits de 0,22 sobre una escala de +-20, coseno de 0,99999 y coincidencia de argmax del 96,7-100% (las discrepancias son empates; en fp16, el dtype de activacion de prism, la coincidencia es del 100%). Sobre 145 ventanas compartidas de wikitext-2, la ratio de perplejidad es 0,9992 con intervalo [0,9990, 0,9994], es decir, una diferencia del nivel del redondeo a bf16. El autor senala que 8 y 6 bits son estadisticamente indistinguibles de bf16 y que 4 bits cuesta un +2,1% de perplejidad, siendo la unica build con perdida medible.

## Requisitos de hardware

- VRAM/memoria estimada para esta build bf16: aproximadamente 54,7 GB solo de pesos; hay que sumar la cache KV de la atencion completa y las activaciones, de modo que en la practica se necesita bastante mas que esa cifra (estimacion a partir del tamano del repositorio; no hay cifra oficial).
- Alternativas cuantizadas del mismo autor, con su tamano de pesos: 8 bits 29,5 GB, 6 bits 22,8 GB, 4 bits 16,1 GB, y 2 bits (prism-ml) 8,6 GB.
- GPU compatibles: MLX es un framework para Apple Silicon, por lo que esta build no esta pensada para GPU NVIDIA o AMD. No se documentan A100, H100 ni RTX 4090 en la informacion disponible.
- Encaje en hardware de consumo: depende de la memoria unificada del Mac. La build de 2 bits (8,6 GB) o la de 4 bits (16,1 GB) son las candidatas realistas para equipos con 16-24 GB de memoria unificada; la de bf16 exige una maquina con memoria unificada muy alta (por encima de 64 GB).
- Opciones de despliegue: mlx-vlm en version 0.7 o superior, con carga directa mediante `mlx_vlm.load`. Requiere pesos en formato MLX; para llama.cpp, Ollama, vLLM o TGI habria que convertir a partir del modelo base GGUF o de esta misma build (no se documenta ningun procedimiento ni compatibilidad).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las builds del mismo modelo; no se documentan modelos ternarios o hibridos comparables de otros autores.

| Modelo | Parametros | Contexto | Perplejidad (wikitext-2) | Tamano | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-MLX-bf16 (esta) | 27,36 B | no disponible | 8,9679 | 54,7 GB | Apache-2.0 | mlx-vlm >= 0.7 (stock) |
| Ternary-Bonsai-2-27B-mlx-2bit (prism-ml) | 27,36 B | no disponible | 8,9607 | 8,6 GB | Apache-2.0 | runtime propio de prism-ml |
| Ternary-Bonsai-2-27B-MLX-8bit | 27,36 B | no disponible | 8,9636 | 29,5 GB | Apache-2.0 | mlx-vlm stock |
| Ternary-Bonsai-2-27B-MLX-4bit | 27,36 B | no disponible | 9,1497 | 16,1 GB | Apache-2.0 | mlx-vlm stock |
| Modelos ternarios o hibridos equivalentes de terceros | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta analisis de sesgos ni composicion del dataset de entrenamiento.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada. Como en cualquier modelo generativo, existe, pero no hay evaluacion publicada.
- Limitaciones de contexto e idioma: la longitud de contexto y la lista de idiomas no se declaran, por lo que no se puede asumir ninguna cifra ni cobertura multilingue.
- Restriccion de plataforma: al ser una build MLX, esta atada a Apple Silicon. No es desplegable en GPU NVIDIA o AMD con las herramientas habituales (vLLM, TGI) sin conversion previa.
- Dependencia de version: requiere mlx-vlm >= 0.7; versiones anteriores aplican un doble desplazamiento a las normas de `qwen3_5`, lo que degrada los resultados.
- Licencia: Apache-2.0, heredada del modelo base, con uso comercial permitido; se incluye el NOTICE.txt de prism-ml. No obstante, conviene revisar las condiciones del modelo upstream y de los datos de entrenamiento originales, que no se detallan.
- La build de 4 bits es la unica con perdida medible (+2,1% de perplejidad); si se busca maxima fidelidad sin usar bf16, 6 u 8 bits son las opciones indicadas por el autor.
- Fidelidad relativa al Qwen3.8-27B original sin ternarizar: no documentada en la informacion disponible; las medidas de fidelidad se refieren unicamente al paquete de 2 bits de prism-ml.
- Para produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay resultados de benchmarks de tareas (razonamiento, codigo, vision) que permitan validar su calidad mas alla de la perplejidad. Conviene evaluar en el dominio propio antes de desplegar.

## Enlaces

- HuggingFace (esta build): https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-bf16
- Modelo base (prism-ml, GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Build de 2 bits de prism-ml con su runtime: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Build de 8 bits: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-8bit
- Build de 6 bits: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-6bit
- Build de 4 bits: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-4bit
- Codigo de conversion: https://github.com/PipeNetwork/bonsai2-mlx
- Paper, blog o demo adicionales: no disponible (la busqueda web no devolvio resultados relacionados con el modelo).
