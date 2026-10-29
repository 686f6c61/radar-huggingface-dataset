# ConnorYU/qwen3.5-9b-ip-malicious-evil-16bit-compile

## Resumen

El modelo `ConnorYU/qwen3.5-9b-ip-malicious-evil-16bit-compile` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen3.5-9B`, publicado por el usuario ConnorYU en HuggingFace. Se trata de un modelo de 9.653.104.368 parámetros (aproximadamente 9,65 mil millones) con pipeline declarado `image-text-to-text`, lo que indica que hereda la capacidad multimodal del modelo base Qwen3.5 y acepta entradas de imagen y texto. Los pesos se distribuyen en formato safetensors de 16 bits, con un repositorio de 19,3 GB.

El modelo resuelve, en principio, el mismo tipo de tareas que su base (generación de texto, razonamiento y comprensión de imagen y texto), pero reorientadas mediante un ajuste fino del que el autor no documenta nada: la model card es la plantilla automática de Unsloth y no incluye descripción del dataset, del objetivo de entrenamiento ni de los resultados obtenidos. El nombre del repositorio sugiere un ajuste deliberado hacia contenido sin filtros de seguridad, pero no hay ninguna evidencia publicada que lo confirme.

Su relevancia práctica es limitada en el momento de redactar esta ficha: cero descargas, cero likes, creado el 28 de octubre de 2026 y actualizado dos minutos después, sin benchmarks ni evaluación publicada. Es útil, sobre todo, como ejemplo de fine-tune rápido con Unsloth + TRL y como variante del ecosistema Qwen3.5, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`), derivada de `unsloth/Qwen3.5-9B`; detalles internos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible para este repositorio; una variante hermana del mismo autor (`qwen3.5-9b-verih200-ip-malicious-evil`) declara 32.768 tokens |
| Tipos de cuantizacion | Solo pesos en 16 bits en el repositorio; no se publican GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | Ingles (`language: en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna. Lo unico verificable es que el modelo hereda la familia `qwen3_5` a traves de `unsloth/Qwen3.5-9B`, que el pipeline declarado es `image-text-to-text` (es decir, incluye torre de vision y proyeccion a espacio de texto, aunque no se detalla su configuracion) y que el repositorio contiene pesos en 16 bits de 9,65 mil millones de parametros. No hay publicados datos sobre numero de capas, dimension oculta, mecanismo de atencion, uso de atencion lineal o hibrida, ni sobre la ventana de contexto efectiva de este fine-tune concreto.

Respecto al entrenamiento, la model card se limita a indicar que el modelo se entreno "2x faster with Unsloth and Huggingface's TRL library". No se especifica el numero de tokens de ajuste fino, la composicion del dataset, si se empleo LoRA/QLoRA o ajuste completo, ni si hubo etapas de RLHF, DPO o preferencias. Tampoco se documenta ninguna innovacion tecnica propia; el unico elemento diferencial es el uso de Unsloth para acelerar el entrenamiento y el sufijo `compile` en el nombre, que sugiere cierta optimizacion de compilacion en el proceso de exportacion, sin mas detalle.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto (`image-text-to-text`): acepta imagenes junto a prompts de texto segun el pipeline declarado.
- Razonamiento y respuesta multi-turno, segun las capacidades del modelo base (no verificadas en este fine-tune).
- Soporte de tool calling / function calling: no documentado en este repositorio; depende de lo que conserve el modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; la model card solo declara ingles.
- Modo "thinking" explicito, vision avanzada, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Experimentacion con fine-tunes ligeros: sirve como referencia practica de un ajuste hecho con Unsloth + TRL sobre un modelo de ~9,6B, util para medir tiempos de entrenamiento y comparar con otras recetas.
- Investigacion sobre alineacion y seguridad: el nombre del repositorio apunta a un ajuste orientado a eliminar restricciones, por lo que puede emplearse en estudios de red teaming y evaluacion de robustez de filtros, siempre en entornos controlados y aislados.
- Pruebas de pipelines multimodales: al declarar `image-text-to-text`, permite validar integraciones de entrada imagen + texto en frameworks tipo transformers o TGI antes de adoptar el modelo base.
- Base para comparativas de fine-tuning: al existir variantes hermanas del mismo autor (`qwen3.5-9b-ip-malicious-evil`, `qwen3.5-9b-verih200-ip-malicious-evil`), facilita experimentos A/B sobre el mismo esqueleto de 9,65B.
- Prototipado interno de asistentes conversacionales en ingles: con 9,65B y pesos de 16 bits cabe en una GPU de 24 GB para contextos cortos, lo que permite montar demos locales sin infraestructura dedicada.
- Docencia y formacion: como ejemplo de model card incompleta y de buenas practicas de documentacion (o de su ausencia) en la publicacion de fine-tunes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y el repositorio no tiene descargas ni evaluaciones de la comunidad en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 19,3 GB solo para los pesos, mas cache KV; se necesitan aproximadamente 21-24 GB para contextos cortos (estimacion a partir del tamano del repositorio, no medida publicada).
- Cuantizacion a 8 bits: aproximadamente 10-11 GB de pesos; a 4 bits, aproximadamente 5,5-6,5 GB (estimaciones teoricas, ya que no se publican artefactos cuantizados).
- GPU recomendadas: A100 40/80 GB o H100 para servir con contexto largo y concurrencia; L40S o A10G de 24 GB para inferencia en 16 bits con contexto moderado.
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en 16 bits con contexto corto; en RTX 4080/4070 Ti Super (16 GB) requeriria cuantizacion a 8 bits; en GPUs de 8-12 GB solo con cuantizacion a 4 bits y contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), TGI (etiqueta `text-generation-inference`), Unsloth para carga y ajuste. Para vLLM, llama.cpp u Ollama no hay artefactos publicados; en el caso de llama.cpp/Ollama habria que convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ConnorYU/qwen3.5-9b-ip-malicious-evil-16bit-compile` | 9,65B | No disponible (32.768 en la variante verih200) | Sin benchmarks publicados | Apache 2.0 | Repositorio con 0 descargas y 0 likes |
| `unsloth/Qwen3.5-9B` (modelo base) | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | No indicada en la informacion | Modelo base de referencia del ecosistema Unsloth |
| `ConnorYU/qwen3.5-9b-ip-malicious-evil` | ~10B segun el listado de HuggingFace | No disponible | Sin benchmarks publicados | Apache 2.0 (presumible, mismo autor) | ~120 descargas segun el listado |
| `ConnorYU/qwen3.5-9b-verih200-ip-malicious-evil` | ~9B | 32.768 tokens | Sin benchmarks publicados | Apache 2.0 (presumible, mismo autor) | Repositorio publico |

No se dispone de datos verificados de modelos de otras familias (por ejemplo, alternativas multimodales de 7-10B) dentro de la informacion proporcionada, por lo que la comparacion se limita a las variantes del mismo autor y al modelo base.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card es la plantilla automatica de Unsloth; no hay descripcion del dataset, del objetivo de entrenamiento ni de los resultados, lo que impide evaluar que ha cambiado respecto al modelo base.
- Nombre del repositorio sugiere un ajuste orientado a eliminar filtros de seguridad ("ip-malicious-evil"); no hay evidencia publicada, pero debe tratarse como modelo de alto riesgo y no desplegarse en entornos de cara al usuario sin una evaluacion propia.
- Riesgo elevado de alucinacion y de comportamiento impredecible: al no haber evaluacion, no se puede caracterizar la calidad de las respuestas ni la deriva respecto al base.
- Idiomas: solo se declara ingles; el rendimiento en castellano es desconocido y probablemente degradado.
- Contexto: no se documenta la ventana efectiva de este fine-tune; el dato de 32.768 tokens corresponde a una variante hermana, no a este repositorio.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad; ademas, las obligaciones heredadas del modelo base Qwen3.5 deben verificarse en su propia licencia.
- Sin senales de adopcion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y de informes de errores.
- Capacidades multimodales declaradas pero no verificadas: el pipeline `image-text-to-text` puede no funcionar correctamente si el fine-tune ha degradado la torre de vision.
- No hay artefactos cuantizados oficiales, lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversion.

## Enlaces

- HuggingFace: https://huggingface.co/ConnorYU/qwen3.5-9b-ip-malicious-evil-16bit-compile
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Variante hermana (sin sufijo `-16bit-compile`): https://huggingface.co/ConnorYU/qwen3.5-9b-ip-malicious-evil
- Variante hermana verih200: https://huggingface.co/ConnorYU/qwen3.5-9b-verih200-ip-malicious-evil
- Listado de la variante verih200 en HuggingFace: https://huggingface.co/ConnorYU/qwen3.5-9b-verih200-ip-malicious-evil/tree/main
- Ficha en Featherless (variante sin `-16bit-compile`): https://featherless.ai/models/ConnorYU/qwen3.5-9b-ip-malicious-evil
- Ficha en Featherless (variante verih200): https://featherless.ai/models/ConnorYU/qwen3.5-9b-verih200-ip-malicious-evil
- Registro en Free2AITools: https://free2aitools.com/model/connoryu/qwen3.5-9b-verih200-ip-malicious-evil
- Busqueda de modelos del autor: https://huggingface.co/models?search=ConnorYU%2Fqwen3.5-9b-ip-malicious-evil
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
