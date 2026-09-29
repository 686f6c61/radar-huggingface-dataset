# Mingyi-Hong/ToolAlpaca_unlearn_ToolDelete-DPO

## Resumen

ToolAlpaca_unlearn_ToolDelete-DPO es un checkpoint de investigación publicado por el usuario Mingyi-Hong sobre el modelo TangQiaoYu/ToolAlpaca-7B. Se trata de un artefacto de *machine unlearning*: el autor indica que ha aplicado el método ToolDelete-DPO con el objetivo de eliminar del modelo base la capacidad de invocar herramientas. No es, por tanto, un modelo nuevo entrenado desde cero, sino un derivado orientado a estudiar la supresión selectiva de comportamientos aprendidos.

El modelo base, ToolAlpaca-7B, es un ajuste fino de un modelo de la familia LLaMA de 7 000 millones de parámetros especializado en uso de herramientas. La etiqueta `llama` del repositorio y el tamaño del mismo (13,5 GB, coherente con pesos en fp16 de un modelo de 7B) respaldan esta lectura, aunque la model card no aporta detalles sobre arquitectura, contexto o datos de entrenamiento del derivado.

La relevancia de esta ficha es limitada y muy específica: sirve para quienes investigan técnicas de desaprendizaje, evaluación de borrado de capacidades y auditoría de seguridad en modelos ajustados. Con cero descargas, cero *likes*, licencia sin especificar y sin resultados de benchmarks publicados, debe tratarse como un artefacto de laboratorio no validado, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia LLaMA (deducido de la etiqueta `llama` y del modelo base; la model card no lo explicita) |
| Parametros totales | no disponible (el nombre del modelo base, ToolAlpaca-7B, sugiere 7 000 millones) |
| Parametros activos | no aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el tamano del repositorio (13,5 GB) es consistente con pesos sin cuantizar en fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; la etiqueta `pytorch` y el tamano del repo apuntan a pesos PyTorch (safetensors o `.bin`) en fp16 |

## Arquitectura y entrenamiento

No hay informacion tecnica detallada en la model card. Lo unico declarado es el modelo de partida (TangQiaoYu/ToolAlpaca-7B) y el metodo aplicado, denominado ToolDelete-DPO. El sufijo DPO sugiere el uso de *Direct Preference Optimization* como mecanismo de ajuste, en este caso orientado a suprimir la capacidad de usar herramientas en lugar de alinearla.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset de preferencias, el regimen de congelacion de capas, la tasa de aprendizaje ni si se aplico algun tipo de regularizacion para preservar el resto de capacidades. Tampoco se documenta si el desaprendizaje se valida con metricas de retencion o de olvido, un punto critico en cualquier trabajo de *unlearning*.

## Capacidades

- Generacion de texto en lengua natural: capacidades heredadas del modelo base, no verificadas en este checkpoint.
- Razonamiento y conocimiento general: presumiblemente conservadas del ToolAlpaca-7B original, sin evaluacion publicada.
- Uso de herramientas / *function calling*: es precisamente la capacidad que el metodo ToolDelete-DPO pretende eliminar; se desconoce el grado real de supresion.
- Soporte de agentes y razonamiento multi-paso con herramientas: tampoco documentado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponibles.
- Alineacion por preferencias: el metodo DPO implica un ajuste con pares de preferencia, aunque no se detalla su construccion.

## Casos de uso

- Investigacion en *machine unlearning*: usar el checkpoint como referencia reproducible de un metodo de borrado por DPO y comparar su comportamiento con el modelo base para medir cuanto se ha suprimido realmente.
- Auditoria de seguridad de modelos ajustados: evaluar si la capacidad de invocar herramientas desaparece de forma efectiva o si puede recuperarse mediante *prompting* adversarial, un riesgo clasico en desaprendizaje.
- Pruebas de red-teaming sobre supresion de capacidades: construir baterias de *prompts* que intenten reactivar el uso de herramientas y cuantificar la tasa de exito.
- Estudio de degradacion colateral: medir si el proceso DPO ha deteriorado otras habilidades (comprension lectora, generacion de codigo, seguimiento de instrucciones) respecto al ToolAlpaca-7B original.
- Base para experimentos comparativos de metodos de olvido: enfrentar ToolDelete-DPO contra otras variantes de la misma familia (por ejemplo, variantes *unlearn* del mismo autor) bajo un protocolo comun de evaluacion.
- Docencia y divulgacion tecnica: ilustrar en un curso o articulo como se construye y que limitaciones tiene un checkpoint de desaprendizaje aplicado a un modelo de 7B con licencia y procedencia poco documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, ToolBench ni de tasas de retencion u olvido, y la busqueda web realizada no ha devuelto ninguna fuente tecnica relacionada con este checkpoint.

## Requisitos de hardware

Estimaciones basadas en un modelo de 7 000 millones de parametros; no hay mediciones publicadas para este checkpoint concreto.

- VRAM para inferencia en fp16: en torno a 14-16 GB, incluyendo pesos y cache KV con contextos moderados.
- VRAM en int8: aproximadamente 8-9 GB.
- VRAM en int4 (GPTQ/AWQ/GGUF Q4): aproximadamente 4-6 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S. Un A100 40 GB permite servir varias replicas o contextos largos con holgura.
- GPU de consumo: cabe en fp16 en RTX 3090, RTX 4090 y RTX A6000 (24 GB o mas). En tarjetas de 12 GB (RTX 3060, RTX 4070) solo con cuantizacion int8 o int4.
- Opciones de despliegue: `transformers` de HuggingFace es la via directa dado el formato PyTorch. vLLM o TGI son adecuados si se confirma compatibilidad de pesos. llama.cpp u Ollama requieren una conversion previa a GGUF que no esta documentada ni distribuida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| ToolAlpaca_unlearn_ToolDelete-DPO (este) | no disponible (7B segun el nombre del base) | no disponible | no disponible | no | Publico en HuggingFace, 0 descargas |
| TangQiaoYu/ToolAlpaca-7B (modelo base) | 7B segun su denominacion | no disponible | no disponible en la informacion proporcionada | no verificados en esta busqueda | Publico en HuggingFace |
| Otros checkpoints de desaprendizaje de 7B | no disponible | no disponible | no disponible | no disponible | no disponible: la busqueda no devolvio alternativas comparables |

Las fuentes consultadas no han aportado ningun modelo comparable adicional, por lo que la comparativa cuantitativa de rendimiento no puede completarse.

## Limitaciones y advertencias

- Licencia no especificada: sin una licencia explicita no hay base juridica clara para uso comercial. Tratarlo como material de investigacion y verificar la licencia del modelo base antes de cualquier uso productivo.
- Modelo sin validacion: cero descargas y cero *likes* en el momento de la consulta, sin benchmarks ni evaluaciones de terceros.
- Eficacia del desaprendizaje no demostrada: no se publican metricas de olvido ni de retencion; el borrado de capacidades puede ser parcial o reversible mediante *prompting* dirigido.
- Riesgo de degradacion colateral: el ajuste por DPO puede haber deteriorado capacidades distintas del uso de herramientas, algo habitual cuando no se documentan estrategias de regularizacion.
- Riesgo de alucinacion: inherente a los modelos de 7B de esta generacion; sin evaluacion especifica para este checkpoint.
- Idiomas y contexto: sin datos sobre cobertura linguistica ni longitud de ventana, no es posible garantizar un comportamiento correcto en castellano ni en conversaciones largas.
- Procedencia dudosa de los metadatos: la fecha de creacion indicada (2026-09-28) y la de actualizacion (2026-09-22) no son coherentes con un historial verificable, lo que refuerza la necesidad de auditar el repositorio antes de usarlo.
- Sin pipeline declarado: la ausencia de tarea asignada en HuggingFace complica el uso directo con `pipeline()`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Mingyi-Hong/ToolAlpaca_unlearn_ToolDelete-DPO
- Modelo base: https://huggingface.co/TangQiaoYu/ToolAlpaca-7B
- Paper, blog, repositorio o demo del metodo ToolDelete-DPO: no disponible; la busqueda web no ha devuelto ninguna fuente tecnica relacionada.
