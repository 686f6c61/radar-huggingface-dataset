# qiusizhan/PersistBD-GLM-4.6V-Flash-clean-20261026

## Resumen

PersistBD-GLM-4.6V-Flash-clean-20261026 es un ajuste fino (fine-tune) del modelo multimodal zai-org/GLM-4.6V-Flash, publicado por el usuario qiusizhan en Hugging Face. El modelo conserva la arquitectura GLM-4V y el pipeline image-text-to-text del modelo base, con aproximadamente 10.290 millones de parametros en formato safetensors y un repositorio de 20,6 GB. Su proposito declarado, segun los tags, es la auditoria de backdoors ("backdoor-auditing") y el control limpio ("clean-control"), lo que sugiere que se ha entrenado para servir como referencia libre de puertas traseras en experimentos de seguridad.

El modelo base GLM-4.6V-Flash pertenece a la familia GLM de Zhipu AI (zai-org), orientada a tareas de vision-lenguaje con un tamano contenido para despliegue eficiente. Este fine-tune hereda esa naturaleza multimodal y anade un ajuste especifico para investigacion de seguridad, aunque la model card no documenta el procedimiento de entrenamiento ni los datos utilizados.

Es relevante ahora porque los modelos multimodales ajustados con fines de auditoria de seguridad son escasos y porque el acceso esta restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargar. La licencia MIT facilita su uso en investigacion y en entornos comerciales, pero la ausencia de documentacion tecnica detallada limita su adopcion en produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4V (transformer multimodal, heredada del modelo base zai-org/GLM-4.6V-Flash) |
| Parametros totales | 10.292.777.472 (~10,29 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF o AWQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 20,6 GB |
| Pipeline | image-text-to-text |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Modelo base | zai-org/GLM-4.6V-Flash |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GLM-4V del modelo base, un transformer multimodal disenado para entrada conjunta de imagen y texto y salida de texto. Con 10.292 millones de parametros y pesos en safetensors de 20,6 GB, el reparto sugiere pesos en precision bf16 o fp16. No se dispone de informacion sobre el numero de capas, dimension oculta, mecanismo de atencion ni el codificador visual empleado, ya que la model card no incluye detalles arquitectonicos.

En cuanto al entrenamiento, los tags indican un fine-tune sobre zai-org/GLM-4.6V-Flash orientado a "backdoor-auditing" y "clean-control". No se documentan el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni la tecnica de ajuste (full fine-tune, LoRA u otra). Tampoco se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Toda esta informacion figura como no disponible.

## Capacidades

- Generacion de texto a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Conversacion multi-turno (tag "conversational").
- Descripcion y comprension de imagenes heredadas del modelo base GLM-4.6V-Flash.
- Orientacion a auditoria de backdoors y control limpio, segun los tags del repositorio.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita el despliegue mediante la infraestructura de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Auditoria de backdoors en modelos multimodales: el modelo puede emplearse como referencia "limpia" frente a variantes potencialmente envenenadas, comparando respuestas ante entradas controladas para detectar comportamientos anomalos.
- Investigacion en seguridad de IA: sirve como punto de partida para experimentos de red teaming sobre modelos vision-lenguaje, gracias a su condicion de fine-tune documentado como clean-control.
- Evaluacion de robustez multimodal: permite probar como responde un modelo de ~10.000 millones de parametros ante imagenes adversarias o prompts manipulados en entornos de laboratorio.
- Linea base en comparativas de fine-tunes: al derivar de GLM-4.6V-Flash, puede usarse como control en estudios que midan el efecto de ajustes posteriores sobre el comportamiento del modelo.
- Prototipado de asistentes vision-lenguaje: con licencia MIT y pesos safetensors, es viable montar demos con transformers para tareas de descripcion de imagenes y dialogo, siempre que se acepten las condiciones de acceso.
- Reproduccion de experimentos academicos: investigadores que necesiten un modelo multimodal de ~10.000 millones de parametros con licencia permisiva pueden integrarlo en pipelines de evaluacion propios mediante la libreria transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, con ~10,29 mil millones de parametros en bf16/fp16 se necesitan aproximadamente 20-21 GB de VRAM solo para los pesos; en cuantizacion de 8 bits rondaria los 10-11 GB y en 4 bits unos 5-6 GB, sin contar el coste adicional del codificador visual y la cache KV.
- GPU recomendadas: no disponible en la documentacion. Por tamano, una GPU con 24 GB (por ejemplo, RTX 4090 o A10G) permitiria inferencia en bf16 con margen ajustado; A100 (40/80 GB) o H100 ofrecerian mayor holgura para lotes y contextos largos.
- Compatibilidad con GPU de consumo: probable en tarjetas de 24 GB en bf16 y en tarjetas de 12-16 GB con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| PersistBD-GLM-4.6V-Flash-clean-20261026 | ~10,29 mil millones | no disponible | MIT | restringido (gated) | Fine-tune de auditoria de backdoors sobre GLM-4.6V-Flash |
| zai-org/GLM-4.6V-Flash (modelo base) | no disponible | no disponible | no disponible | no disponible | Modelo multimodal de Zhipu AI del que deriva este fine-tune |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Documentacion tecnica muy escasa: no se detallan datos de entrenamiento, hiperparametros, composicion del dataset ni evaluaciones, lo que impide verificar sus propiedades de seguridad.
- Riesgo de alucinacion: no evaluado; al ser un modelo generativo multimodal, es esperable que produzca descripciones o respuestas incorrectas sin que se haya medido su tasa.
- Sesgos conocidos: no documentados; los sesgos del modelo base GLM-4.6V-Flash no se trasladan de forma cuantificada en la model card.
- Idiomas: no se declaran idiomas soportados, por lo que el rendimiento en castellano u otras lenguas no esta garantizado.
- Contexto: se desconoce la longitud maxima de contexto, lo que complica planificar su uso en conversaciones largas o documentos extensos.
- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar; esto puede bloquear automatizaciones y despliegues no interactivos.
- Uso comercial: la licencia MIT lo permite, pero la falta de evaluacion de seguridad y la naturaleza del fine-tune (auditoria de backdoors) aconsejan no desplegarlo en produccion sin auditoria propia.
- Trazabilidad: el autor es un usuario individual y el repositorio tiene muy pocas descargas (28) y cero likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qiusizhan/PersistBD-GLM-4.6V-Flash-clean-20261026
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Papers, blogs, repositorios y demos adicionales: no disponible en la informacion proporcionada.
