# mradermacher/Qwen3-VL-4B-Instruct-c_abliterated-v2-GGUF

## Resumen

Qwen3-VL-4B-Instruct-c_abliterated-v2-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo prithivMLmods/Qwen3-VL-4B-Instruct-c_abliterated-v2, un derivado "abliterated" del Qwen3-VL-4B-Instruct de Alibaba. El modelo base parte de la familia Qwen3-VL, una arquitectura multimodal vision-lenguaje de aproximadamente 4.022 millones de parametros que combina un codificador visual con un transformer de lenguaje. La variante "c_abliterated-v2" aplica una tecnica de abliteracion (supresion de la direccion de rechazo en el espacio de activaciones) para reducir los comportamientos de negativa del modelo original.

El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de quants GGUF en Hugging Face, que ofrece el modelo en un espectro amplio de niveles de compresion: desde Q2_K (1,8 GB) hasta f16 (8,2 GB), pasando por Q4_K_M, Q5_K_M, Q6_K y Q8_0, ademas de los ficheros mmproj necesarios para el procesamiento multimodal. Esto permite ejecutar un modelo vision-lenguaje de 4B en hardware de consumo.

La relevancia actual del modelo reside en tres factores: su tamano contenido (4B) que lo hace desplegable en GPU consumer, su naturaleza multimodal (acepta imagenes y texto) y su licencia Apache 2.0, que facilita el uso comercial. No obstante, al tratarse de un derivado abliterated, su comportamiento esta desalineado respecto al modelo original y requiere evaluacion cuidadosa antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje); arquitectura base Qwen3-VL no detallada en la informacion disponible |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es prithivMLmods/Qwen3-VL-4B-Instruct-c_abliterated-v2, derivado de Qwen3-VL-4B-Instruct. Se trata de un modelo multimodal que combina un codificador visual con un transformer de lenguaje, disenado para tareas de comprension de imagenes y generacion de texto condicionada por vision. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

La innovacion principal de esta variante es la abliteracion: una tecnica de edicion de pesos que identifica la direccion de activacion asociada al rechazo de peticiones y la elimina o proyecta fuera del espacio de representaciones. El resultado es un modelo que responde con mucha menor frecuencia con negativas, lo que puede ser util para investigacion sobre alineamiento y seguridad, pero tambien incrementa el riesgo de generar contenido no deseado. La version "v2" y el sufijo "c_abliterated" indican una segunda iteracion del proceso de abliteracion sobre la variante instruct del modelo Qwen3-VL-4B. La cuantizacion GGUF la realiza mradermacher con la herramienta estandar de llama.cpp, y existe una version alternativa con quants ponderados/imatrix en el repositorio i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes (vision-lenguaje) mediante los ficheros mmproj incluidos.
- Generacion de codigo (etiqueta "code" en la model card).
- Comportamiento con rechazo reducido (abliterated), lo que amplia el rango de peticiones que el modelo atendera.
- Capacidad de ejecucion local en hardware de consumo gracias a las cuantizaciones GGUF.
- Compatibilidad con endpoints y text-generation-inference segun las etiquetas del repositorio.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Procesamiento local de imagenes con descripcion textual: el modelo puede recibir una imagen junto con un prompt y generar una descripcion o respuesta, ejecutandose en una GPU consumer con el quant Q4_K_M (2,6 GB) y el mmproj correspondiente.
- Investigacion sobre alineamiento y seguridad: la variante abliterated permite estudiar como cambia el comportamiento del modelo al eliminar la direccion de rechazo, comparando respuestas con el Qwen3-VL-4B-Instruct original.
- Asistente de codigo ligero en local: con la etiqueta "code" y un tamano de 4B, puede integrarse en editores o terminales mediante llama.cpp u Ollama para autocompletado y explicacion de fragmentos, sin depender de APIs externas.
- Prototipado de aplicaciones vision-lenguaje: investigadores que necesiten validar pipelines multimodales antes de escalar a modelos mayores pueden usar esta version cuantizada como banco de pruebas de bajo coste.
- Despliegue en entornos con recursos limitados: al caber en 2-3 GB en Q4, es viable en portatiles con GPU integrada o en CPUs con llama.cpp, util para demos y entornos educativos.
- Generacion de contenido sin restricciones de rechazo: en contextos creativos o de ficcion donde el modelo original declinaria peticiones, esta variante puede resultar mas fluida, siempre con supervision humana y filtros propios.
- Analisis de capturas o documentos escaneados en local: combinando el modelo con un pipeline OCR ligero, puede responder preguntas sobre el contenido visual sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB con Q4_K_M, 3,0 GB con Q5_K_M, 4,4 GB con Q8_0 y 8,2 GB con f16, sin contar el fichero mmproj (0,6-0,9 GB adicionales para vision).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia; cualquier GPU con al menos 4-6 GB de VRAM puede ejecutar los quants Q4 y Q5.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 6 GB o mas; los quants Q2-Q4 caben incluso en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (segun etiquetas) y cualquier runtime compatible con GGUF. Para vision es necesario cargar tambien el fichero mmproj.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-c_abliterated-v2-GGUF (este) | 4,02B | no disponible | Apache 2.0 | GGUF | Vision-lenguaje, abliterated, quants multiples |
| Qwen3-VL-4B-Instruct (original) | 4,02B | no disponible | Apache 2.0 | safetensors | Vision-lenguaje alineado, sin abliteracion |
| prithivMLmods/Qwen3-VL-4B-Instruct-c_abliterated-v2 | 4,02B | no disponible | Apache 2.0 | safetensors | Modelo base de esta cuantizacion, sin GGUF |
| mradermacher/Qwen3-VL-4B-Instruct-c_abliterated-v2-i1-GGUF | 4,02B | no disponible | Apache 2.0 | GGUF (imatrix) | Variante con quants ponderados de mayor calidad |

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo, lo que puede producir respuestas a peticiones que el modelo original declinaria; requiere filtros y supervision propios en produccion.
- Riesgo elevado de alucinacion, comun en modelos de 4B y agravado por la falta de contexto documentado.
- Idiomas soportados limitados al ingles segun la model card; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada en la informacion disponible, lo que impide planificar casos de uso con contextos largos.
- No se documentan capacidades de tool calling ni de agente multi-paso; no asumir su disponibilidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo derivado abliterated puede no cumplir las politicas de uso aceptable de terceros; revisar las condiciones del modelo base y del original Qwen.
- El repositorio ocupa 37,7 GB por incluir todos los quants; descargar solo el fichero necesario.
- Al ser un derivado no oficial de Qwen3-VL, no cuenta con soporte del equipo de Alibaba y su calidad puede diferir del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-c_abliterated-v2-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3-VL-4B-Instruct-c_abliterated-v2
- Quants imatrix: https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-c_abliterated-v2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3-VL-4B-Instruct-c_abliterated-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
