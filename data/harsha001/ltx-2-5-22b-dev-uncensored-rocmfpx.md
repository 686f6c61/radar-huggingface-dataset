# Harsha001/LTX-2.5-22B-dev-uncensored-ROCmFPX

## Resumen

LTX-2.5-22B-dev-uncensored-ROCmFPX es una cuantizacion no oficial del modelo de generacion de video texto-a-video LTX-2.5 de Lightricks, publicada por el usuario Harsha001 en Hugging Face. El modelo parte del checkpoint base `Lightricks/LTX-2.5` y se distribuye en formato GGUF con un esquema de cuantizacion propietario denominado ROCmFPX, orientado a ejecucion en hardware AMD mediante ROCm y a su uso con `stable-diffusion.cpp`. El autor etiqueta el modelo como "uncensored", "heretic" y "abliterated", lo que indica que se ha aplicado una modificacion deliberada para eliminar o atenuar los filtros de seguridad y moderacion del modelo original.

La relevancia de esta publicacion es doble. Por un lado, demuestra la viabilidad de ejecutar modelos de difusion de video de gran tamano en GPUs AMD con cuantizacion agresiva, un terreno historicamente dominado por CUDA. Por otro, plantea un caso de estudio sobre la redistribucion de modelos con licencia restrictiva y sobre los riesgos de las variantes "abliterated" en pipelines de generacion de video. El repositorio acumula 2.554 descargas y 17 likes desde su creacion el 20 de octubre de 2026.

Conviene subrayar que el dato de parametros reportado en safetensors (13.115.791.408, es decir, unos 13,1 mil millones) no coincide con el "22B" que aparece en el nombre del repositorio, una discrepancia habitual en cuantizaciones y en nomenclaturas de autor que conviene verificar antes de planificar despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion para generacion de video (LTX-Video), no disponible el detalle exacto de bloques |
| Parametros totales | 13.115.791.408 (segun safetensors del repo); el nombre indica 22B |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFPX (esquema propio del autor), ROCmFP4, GGUF |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement (acceso restringido, gated) |
| Formato de pesos | GGUF (repo de 29,4 GB), con variantes ROCmFPX/ROCmFP4 |

## Arquitectura y entrenamiento

El modelo base `Lightricks/LTX-2.5` pertenece a la familia LTX-Video de Lightricks, un modelo de difusion para generacion de video a partir de texto. La informacion disponible no detalla el numero de bloques, el tipo de atencion ni la composicion exacta del dataset de entrenamiento del modelo original; estos datos deberian consultarse en la model card oficial de Lightricks. Lo que si se sabe es que la variante aqui descrita no ha sido reentrenada desde cero: se trata de una cuantizacion y de una modificacion de los pesos del checkpoint base.

La innovacion tecnica principal de esta publicacion es el esquema de cuantizacion ROCmFPX, disenado por el autor para reducir el peso del modelo (29,4 GB en el repo) y permitir su ejecucion en GPUs AMD bajo ROCm. Ademas, las etiquetas "uncensored", "heretic" y "abliterated" indican que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, orientada a eliminar el comportamiento de filtrado del modelo original. No se dispone de informacion sobre el proceso exacto de ablacion, el numero de tokens empleados ni si hubo ajuste fino posterior.

## Capacidades

- Generacion de video a partir de texto (text-to-video), heredada del modelo base LTX-2.5.
- Ejecucion en hardware AMD mediante ROCm y el backend `stable-diffusion.cpp`.
- Formato GGUF, lo que facilita su carga en herramientas compatibles con este formato.
- Variante "abliterated"/"uncensored": el autor declara que se han atenuado los filtros de seguridad, lo que en la practica amplia el rango de prompts aceptados, con los riesgos asociados.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo "thinking"; no aplican a un modelo de difusion de video.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado de video generativo en estaciones de trabajo con GPU AMD: el formato ROCmFPX permite cargar el modelo en entornos ROCm sin depender de CUDA, algo util para equipos con Radeon o Instinct.
- Investigacion sobre cuantizacion de modelos de difusion de video: sirve como referencia para estudiar el impacto de ROCmFP4/ROCmFPX en la calidad visual y en el consumo de VRAM.
- Generacion de clips de prueba en pipelines de postproduccion: util para crear storyboards o animaticos rapidos antes de producir el material definitivo.
- Evaluacion de seguridad y alineacion: al ser una variante "abliterated", es un caso de estudio para medir como la ablacion afecta a la generacion de contenido sensible en video.
- Experimentacion con `stable-diffusion.cpp`: permite probar el backend en flujos de video sin depender de PyTorch ni de CUDA.
- Docencia y divulgacion: sirve para explicar en clase como se cuantiza y se redistribuye un modelo de difusion de gran tamano en hardware no NVIDIA.
- Benchmarking de hardware AMD: comparar throughput y latencia frente a las mismas cargas en GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 29,4 GB en disco, por lo que se necesita al menos esa cantidad de VRAM o de memoria unificada para cargar los pesos completos, y mas para los buffers de activacion durante la difusion.
- GPU recomendadas: el autor orienta el modelo a hardware AMD con ROCm (por ejemplo, Radeon RX 7900 XTX o Instinct MI210/MI300), si bien no se especifican modelos concretos ni minimos.
- Cabe en GPU de consumo: probablemente en GPUs AMD de gama alta con 24 GB o mas de VRAM, aunque no hay confirmacion oficial; en NVIDIA no se garantiza compatibilidad con el esquema ROCmFPX.
- Opciones de despliegue: `stable-diffusion.cpp` (backend declarado en las etiquetas), ROCm como runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para difusion de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-22B-dev-uncensored-ROCmFPX (este) | 13,1B (segun safetensors) | no disponible | GGUF/ROCmFPX | ltx-2.x-community-license-agreement (gated) | Hugging Face, acceso restringido |
| Lightricks/LTX-2.5 (base) | no disponible en la informacion | no disponible | safetensors | ltx-2.x-community-license-agreement | Hugging Face, acceso restringido |
| Otras variantes cuantizadas de LTX-2.5 | no disponible | no disponible | GGUF | heredada del base | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es una cuantizacion no oficial: el autor no es Lightricks y no hay garantia de fidelidad respecto al checkpoint original.
- La licencia `ltx-2.x-community-license-agreement` impone restricciones de uso comercial y de redistribucion; al ser un modelo derivado, conviene revisar si la licencia permite redistribuir variantes modificadas.
- El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face, lo que anade friccion a cualquier despliegue automatizado.
- La variante "abliterated"/"uncensored" elimina filtros de seguridad, lo que incrementa el riesgo de generar contenido danino, ilegal o difamatorio; no es apta para produccion sin moderacion externa.
- Riesgo de alucinacion visual: como todo modelo de difusion de video, puede generar artefactos, incoherencias temporales y contenido fisicamente implausible.
- Discrepancia entre el nombre "22B" y los 13,1B reportados en safetensors; verificar antes de dimensionar hardware.
- Compatibilidad limitada: el esquema ROCmFPX esta pensado para ROCm y `stable-diffusion.cpp`; no se garantiza su funcionamiento en CUDA ni en otros backends.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni evaluaciones de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/LTX-2.5-22B-dev-uncensored-ROCmFPX
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia LTX-2.x Community License Agreement: no disponible enlace directo en la informacion proporcionada
- `stable-diffusion.cpp`: no disponible enlace directo en la informacion proporcionada
- ROCm: no disponible enlace directo en la informacion proporcionada
