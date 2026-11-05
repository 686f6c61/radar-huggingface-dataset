# harshshaah/perceiver-experiment

## Resumen

`harshshaah/perceiver-experiment` es un repositorio experimental publicado en HuggingFace que implementa una arquitectura Perceiver orientada a aprendizaje contrastivo, con una configuración etiquetada como "large" por el autor. No se trata de un modelo entrenado ni de un checkpoint con pesos afinados: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests), no un modelo con benchmarks publicados. El número de parámetros registrado en los safetensors es de 49.600, es decir, unas 49,6 mil, lo que confirma que es un artefacto de escala mínima, probablemente un esqueleto de código más que un modelo utilizable.

El interés del repositorio es, por tanto, didáctico y de investigación: ofrece una implementación transparente de Perceiver con atención multi-query, fusión por concatenación y MLP, activación approx-GELU y normalización GroupNorm, junto con un script de fine-tuning (`finetune.py`), un `config.json` con los ajustes de arquitectura y un `training_args.json` con la receta de experimento por defecto (Adam con scheduler coseno). No hay pipeline declarado, no hay idiomas declarados y no hay métricas.

Es relevante ahora únicamente como punto de partida reproducible para quien quiera experimentar con arquitecturas Perceiver en tareas contrastivas, no como modelo de producción. La licencia BSD-3-Clause permite uso comercial y modificación, pero el propio autor advierte que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención multi-query, fusión concat + MLP, activación approx-GELU, normalización GroupNorm) |
| Parametros totales | 49.600 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización); código en PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer con un mecanismo de atención cruzada que proyecta entradas de longitud arbitraria sobre un conjunto reducido de latentes. En esta implementación concreta el autor especifica atención multi-query, fusión mediante concatenación seguida de MLP, activación approx-GELU y normalización GroupNorm. La escala declarada es "large", pero el recuento real de parámetros en safetensors (49.600) contradice cualquier interpretación de "large" en el sentido habitual de la literatura; se trata de una configuración de juguete o de un esqueleto sin expandir.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni sobre etapas de RLHF, DPO o ajuste por preferencias. La model card indica que el checkpoint es únicamente una inicialización para smoke tests y que la receta incluida (Adam con scheduler coseno) son valores de partida del script, no evidencia de un entrenamiento completado. No se documenta ninguna innovación técnica adicional más allá de la propia implementación del Perceiver con las variantes citadas.

## Capacidades

- No hay evidencia de generación de texto funcional: el checkpoint no está entrenado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan capacidades de visión, audio ni modo "thinking".
- El artefacto utilizable es el código: `finetune.py` como punto de entrada de entrenamiento y ejemplo ejecutable, más `config.json` y `training_args.json` como configuración reproducible.
- La implementación está pensada para tareas contrastivas, según la etiqueta `contrastive` del repositorio.

## Casos de uso

- Investigación sobre arquitecturas Perceiver: usar el repositorio como base para estudiar cómo se implementa la atención multi-query con latentes y la fusión concat + MLP en un código legible y ejecutable.
- Reproducción de experimentos contrastivos: partir de `training_args.json` (Adam, scheduler coseno) y de `finetune.py` para montar un pipeline de entrenamiento contrastivo con datos propios, ajustando la configuración según el presupuesto de cómputo.
- Docencia y formación: el código sirve para explicar en un curso o taller la diferencia entre un transformer estándar y un Perceiver, y para mostrar por qué un checkpoint de inicialización no debe confundirse con un modelo entrenado.
- Pruebas de humo de infraestructura: validar que un entorno de PyTorch carga safetensors y ejecuta el script de fine-tuning antes de invertir en experimentos de mayor escala.
- Desarrollo de adaptadores de carga: la model card advierte que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito; el repositorio sirve para construir y probar ese adaptador.
- Baseline de capacidad mínima: como referencia de "modelo sin entrenar" en comparaciones controladas, siempre que se entrene con la misma exposición de datos, presupuesto de ajuste y semillas que las alternativas, tal como recomienda el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card omite deliberadamente cualquier afirmación de rendimiento y recomienda evaluar sobre un conjunto de validación específico de la tarea, reportando la métrica en al menos tres semillas e incluyendo una baseline de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 49.600 parámetros en fp32; cualquier GPU consumer moderna (incluso integradas) es suficiente.
- GPU recomendadas: no aplica para un modelo de este tamaño; una RTX 4090, A100 o H100 estarían enormemente sobredimensionadas.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: al ser una implementación personalizada, no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI; la carga requiere el código del repositorio o un adaptador explícito.
- Latencia y throughput: no disponibles; no tiene sentido medirlos sin un modelo entrenado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| harshshaah/perceiver-experiment | 49.600 | no disponible | No (inicialización) | BSD-3-Clause | HuggingFace, 0 descargas |
| Perceiver IO (referencia de DeepMind) | ~decenas de millones a cientos de millones según configuración | no disponible en esta ficha | Sí, con benchmarks publicados | Apache-2.0 (referencia) | Pesos y paper públicos |
| CLIP (referencia contrastiva) | ~150M (ViT-B/32) | 77 tokens de texto | Sí, con benchmarks publicados | MIT (referencia) | Pesos públicos |

La comparación es asimétrica: los dos modelos de referencia son implementaciones entrenadas y evaluadas, mientras que este repositorio es un esqueleto de código con un checkpoint de inicialización. No se dispone de datos suficientes para comparar rendimiento, contexto o calidad.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado; no debe usarse para inferencia en producción ni para evaluar calidad.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce el propio autor.
- No hay benchmarks, métricas ni logs de entrenamiento publicados.
- Al ser una implementación personalizada, las APIs genéricas de carga (por ejemplo, `AutoModel.from_pretrained`) requieren un adaptador explícito.
- No se declaran idiomas soportados; no hay garantía de comportamiento multilingüe.
- La licencia BSD-3-Clause permite uso comercial y modificación, pero el autor advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- Riesgo de alucinación y sesgos: no evaluables, al no existir un modelo entrenado.
- Cualquier resultado futuro debe documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/harshshaah/perceiver-experiment
- Repositorio de código: incluido en el propio repo de HuggingFace (`finetune.py`, `config.json`, `training_args.json`, `model.safetensors`)
- Paper de referencia de Perceiver: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
