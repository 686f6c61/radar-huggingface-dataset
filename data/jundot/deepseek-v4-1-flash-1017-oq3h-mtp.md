# Jundot/DeepSeek-V4.1-Flash-1017-oQ3h-mtp

## Resumen

DeepSeek-V4.1-Flash-1017-oQ3h-mtp es una cuantizacion de precision mixta del checkpoint deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario Jundot bajo licencia MIT. El modelo base es un modelo de lenguaje y vision de tipo mixture-of-experts (MoE) con 552B parametros en el backbone linguistico, 197B adicionales en tablas Engram de n-gramas y un modulo MTP (multi-token prediction) de 14B. Se trata de una actualizacion menor de DeepSeek-V4.1-Flash con mejoras en razonamiento, codigo, tareas agenticas y vision.

La cuantizacion emplea el formato oQh de oQ, una tecnica de precision mixta que aplica una transformada de Hadamard a los pesos de los expertos antes de cuantizarlos, lo que reduce el numero de escalas necesarias y permite dedicar el espacio ahorrado a mas bits en las partes mas sensibles. El checkpoint resultante ocupa 380,9 GB en el repositorio y alcanza una media efectiva de 3,608 bits/peso en el backbone y 3,993 bits/peso en el conjunto completo.

Es relevante porque permite ejecutar un modelo multimodal de escala frontier (mas de 760B pesos logicos en total) en formato MLX sobre hardware Apple Silicon, algo que no seria viable con los pesos en BF16 o FP8 originales. No obstante, requiere oMLX 0.8.0 o superior con soporte oQh; versiones anteriores no pueden cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con vision encoder, tablas Engram y modulo MTP |
| Parametros totales | 763.205B logicos (551.566B backbone + 196.929B Engram + 0.485B vision + 14.225B MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh precision mixta: 3-bit y 4-bit row scale, Engram affine 4-bit grupo 32, MXFP4 grupo 32, affine 8-bit grupo 64, 5-bit row scale, BF16, MXFP8 grupo 32, FP32 |
| Idiomas soportados | no disponible (la model card menciona evaluacion en 7 idiomas via FLORES+ y Aya, sin listarlos) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal. La model card del checkpoint cuantizado no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; esa informacion corresponderia a la model card del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, no incluida en la informacion proporcionada. Lo que si se documenta es la estructura de componentes: un backbone linguistico de 551,566B pesos logicos, tablas Engram de n-gramas de 196,929B, un encoder de vision de 0,485B y una cabeza MTP de 14,225B.

La innovacion tecnica principal de este checkpoint es el formato oQh. Antes de cuantizar los pesos de los expertos enrutados, se les aplica una transformada de Hadamard; los pesos rotados requieren menos escalas, y el espacio ahorrado se reinvierte en codigos mas anchos para los tensores enrutados mas sensibles. Las proyecciones de atencion y los expertos compartidos se mantienen en grupos affines de 8 bits, mientras que el embedding de tokens, la cabeza de salida, el router y la proyeccion de salida de atencion wo_a quedan en BF16. Las tablas Engram se almacenan en grupos affines de 4 bits con tamano de grupo 32, la cabeza MTP conserva los formatos FP4 y FP8 de origen, y el encoder de vision permanece en BF16. La decodificacion multi-token (MTP) es una capacidad nativa del modelo base que este checkpoint preserva.

## Capacidades

- Generacion de texto y razonamiento: la model card del modelo base describe mejoras en tareas de razonamiento respecto a DeepSeek-V4.1-Flash.
- Generacion de codigo: se documenta evaluacion especifica sobre codigo Python en la comparativa de calidad de cuantizacion.
- Vision: pipeline image-text-to-text, con encoder de vision incluido en el checkpoint (0,485B parametros en BF16).
- Capacidades agenticas: la model card menciona mejoras en tareas agenticas.
- Decodificacion multi-token (MTP): cabeza dedicada de 14,225B pesos que permite predecir varios tokens por paso.
- Tablas Engram: modulo de n-gramas de 196,929B pesos que actua como memoria de secuencias.
- Soporte multilingue: evaluado en 7 idiomas mediante los conjuntos FLORES+ y Aya, aunque la lista concreta no se especifica.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Razonamiento y analisis documental en local: el modelo puede procesar documentos largos y tareas de razonamiento multi-paso en equipos Apple Silicon con memoria unificada amplia, sin depender de APIs externas, gracias a que el checkpoint cuantizado reduce el peso a 3,993 bits/peso de media.
- Generacion y revision de codigo: con mejoras documentadas en tareas de codigo y evaluacion sobre fuente Python, es adecuado para asistentes de programacion integrados en entornos de desarrollo sobre macOS que requieran privacidad total de los fuentes.
- Procesamiento de imagenes y texto combinados: el pipeline image-text-to-text y el encoder de vision en BF16 permiten tareas de descripcion de imagenes, extraccion de informacion de capturas o documentos escaneados y respuesta a preguntas visuales.
- Flujos agenticos multi-paso: las mejoras en tareas agenticas y la cabeza MTP (que acelera la generacion al predecir varios tokens) lo hacen util para agentes que encadenan llamadas a herramientas y razonamiento intermedio.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia practica para estudiar el impacto de la precision mixta con rotacion de Hadamard, ya que la model card publica divergencia KL frente al original en tres dominios (FLORES+, Aya y codigo).
- Evaluacion multilingue: los datos de KL sobre FLORES+ y Aya en 7 idiomas permiten usarlo como banco de pruebas de calidad multilingue tras cuantizacion agresiva.
- Despliegue en estaciones de trabajo Apple: al estar en formato MLX y requerir oMLX 0.8.0+, encaja en entornos de desarrollo sobre macOS con chips de la familia M con memoria unificada de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente proporciona medidas de divergencia KL respecto al checkpoint original (FP4 en expertos enrutados, FP8 en el resto), comparando el formato oQh con el formato oQe a igual tamano:

| Nivel | Tamano | KL FLORES+, oQe -> oQh | KL Aya, oQe -> oQh | KL codigo, oQe -> oQh |
|---|---|---|---|---|
| oQ2 | 284,0 GiB | 0,59 -> 0,40 (-32%) | 0,20 -> 0,14 (-31%) | 0,16 -> 0,11 (-32%) |
| oQ2.5 | 311,4 GiB | 0,43 -> 0,28 (-34%) | 0,14 -> 0,084 (-38%) | 0,11 -> 0,068 (-38%) |
| oQ3 | 347,3 GiB | 0,26 -> 0,23 (-9%) | 0,060 -> 0,051 (-15%) | 0,056 -> 0,047 (-16%) |

Estas cifras miden fidelidad respecto al original, no calidad absoluta en tareas. Los tamanos de la tabla excluyen la cabeza MTP.

## Requisitos de hardware

- VRAM o memoria unificada: el checkpoint completo ocupa 354,787 GiB (380,949 GB) en disco; la inferencia requiere al menos esa cantidad de memoria unificada mas el overhead de ejecucion, por lo que se necesitan equipos Apple Silicon con memoria unificada muy superior a 384 GB.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon; no se documenta soporte para A100, H100 ni RTX 4090 en la informacion proporcionada.
- Cabe en GPU consumer: no, el tamano del checkpoint (354,787 GiB) excede con mucho la VRAM de cualquier GPU consumer actual.
- Opciones de despliegue: exclusivamente oMLX 0.8.0 o superior con soporte oQh. Versiones anteriores de oMLX no pueden cargar el checkpoint. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-oQ3h-mtp (este) | 763,205B logicos (3,993 bits/peso) | no disponible | MLX safetensors (oQh) | MIT | Hugging Face, requiere oMLX 0.8.0+ |
| DeepSeek-V4.1-Flash-1017 (base) | 552B LM + 197B Engram + 14B MTP | no disponible | safetensors originales (FP4/FP8) | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017 en oQe (misma familia de cuantizacion) | mismo modelo, precision mixta oQe | no disponible | MLX safetensors (oQe) | MIT | Hugging Face |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del propio modelo base y del mismo esquema de cuantizacion, que son las unicas referencias presentes en la informacion proporcionada. No se dispone de datos de rendimiento en tareas para comparar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Dependencia estricta de oMLX 0.8.0 o superior con soporte oQh; versiones anteriores no cargan el checkpoint, lo que limita la portabilidad frente al formato MLX estandar (oQe).
- El checkpoint es una cuantizacion agresiva (3,993 bits/peso de media); aunque la divergencia KL es baja, existe una perdida de fidelidad respecto al original cuantificada en la tabla de KL, especialmente en niveles oQ2 y oQ2.5.
- Requiere una cantidad de memoria unificada muy elevada (del orden de 355 GiB solo para pesos), lo que restringe el despliegue a configuraciones de gama muy alta.
- No se documentan datos sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma en la informacion proporcionada.
- La lista concreta de idiomas soportados no se especifica; solo se indica que la evaluacion cubre 7 idiomas sin enumerarlos.
- No se documenta soporte de tool calling, function calling ni capacidades de audio.
- La licencia es MIT, lo que permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo cuantizado en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/Jundot/DeepSeek-V4.1-Flash-1017-oQ3h-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
- Licencia: LICENSE dentro del repositorio del checkpoint
