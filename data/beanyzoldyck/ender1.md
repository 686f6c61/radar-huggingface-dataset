# beanyzoldyck/ender1

## Resumen

ender1 es un adaptador LoRA para el modelo Qwen/Qwen3.8-27B, desarrollado por el usuario beanyzoldyck en el contexto de Ender's Bench durante el hackathon CalHacks 13.0. Se trata de un ajuste fino supervisado orientado a la simulación de un mostrador financiero (concesión de préstamos, cobros y pagos a proveedores), cuyo objetivo es que el agente emita la llamada de herramienta correcta en cada estado del entorno, incluyendo la negativa a usar registros o permisos que el mostrador no debería emplear. El adaptador se publica como material de investigación sobre alineación y seguridad en agentes, no como un modelo listo para producción.

El checkpoint publicado corresponde al paso 60 de una época de 597 pasos, es decir, aproximadamente el 10 % del entrenamiento previsto. El autor indica explícitamente que no se ha evaluado este checkpoint, que las etiquetas fueron generadas por un asistente sin revisión humana y que el adaptador no debe usarse para decisiones reales sobre personas. La relevancia actual del artefacto es metodológica: documenta un intento temprano de medir comportamiento ético de agentes en escenarios simulados, con transparencia poco habitual sobre el estado incompleto del entrenamiento.

El modelo base, Qwen3.8-27B, no está descrito en la información proporcionada, por lo que los datos de arquitectura, contexto y entrenamiento del modelo subyacente se marcan como no disponibles. Todo lo que sigue se refiere al adaptador y a lo que su model card declara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0.05) sobre proyecciones de atención y atención lineal de las capas 48–63 del modelo base Qwen/Qwen3.8-27B |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base es de 27B según su nombre) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenado sobre pesos bitsandbytes 8-bit (LLM.int8) con cómputo BF16; no se declaran cuantizaciones publicadas del adaptador |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), config PEFT (`adapter_config.json`), log de entrenamiento (`trainer_state.json`) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado exclusivamente a las proyecciones de atención y atención lineal de las capas 48 a 63 del modelo base Qwen3.8-27B. El entrenamiento se realizó sobre pesos del modelo base cuantizados a 8 bits con bitsandbytes (LLM.int8) y cómputo en BF16; el autor advierte que el adaptador no se evaluó contra una base en BF16, lo que introduce una posible discrepancia entre el entorno de entrenamiento y un despliegue con pesos completos.

Los datos de entrenamiento provienen únicamente de ejecuciones de política guionizada y de líneas base del simulador financiero de Ender's Bench; no se usaron salidas de APIs de modelos frontera. La pérdida es response-only (prompts enmascarados), con tasa de aprendizaje constante de 7,5e-5 en la ventana publicada. La pérdida de entrenamiento bajó de 0,67 en el paso 1 a 0,22 en el paso 60, dato que el propio autor califica de estadístico de ajuste y no de evaluación. El entrenamiento se ejecutó en una única NVIDIA DGX Spark y se detuvo en el paso 63, reanudándose después sobre un conjunto de datos mayor que no se incluye en este repositorio.

## Capacidades

- Generación de texto y emisión de llamadas de herramienta (tool calling) en el dominio del simulador financiero: selección de la acción correcta para cada estado del mostrador.
- Razonamiento sobre permisos y registros: el objetivo declarado incluye negarse a usar datos o autorizaciones fuera de política.
- Comportamiento orientado a agentes en entornos simulados de múltiples pasos (mostrador financiero, mundo de supervivencia "The Clearing", tareas de reward hacking), aunque este adaptador concreto solo se entrenó en el mostrador financiero.
- Capacidades multilingües: no disponibles (heredadas del modelo base, sin datos declarados).
- Modo de razonamiento extendido, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineación de agentes: el adaptador sirve como punto de partida reproducible para estudiar cómo un ajuste fino supervisado sobre trazas guionizadas modifica la política de llamadas de herramienta en un entorno con incentivos a hacer trampa.
- Evaluación de metodologías de seguridad: permite comparar, junto con los otros adaptadores de la familia Ender, si el ajuste sobre datos guionizados generaliza a escenarios no vistos del simulador.
- Docencia y divulgación sobre riesgos de agentes: al ser un checkpoint intermedio con limitaciones documentadas, es útil como ejemplo de artefacto de investigación que no debe confundirse con un modelo desplegable.
- Reproducción de experimentos de PEFT: la configuración LoRA (rank, alpha, capas objetivo, cuantización 8-bit) y el log de entrenamiento permiten replicar el procedimiento en una DGX Spark o hardware equivalente.
- Estudio de la brecha train/deploy por cuantización: comparar el comportamiento del adaptador sobre base 8-bit frente a base BF16 es un experimento directo que el autor deja abierto.
- Análisis de calidad de etiquetas: las etiquetas generadas por asistente y sin revisar permiten investigar el impacto de ruido de etiquetado en tareas de decisión con restricciones de política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existe evaluación de este checkpoint y que la única ejecución de benchmark del proyecto puntuó un adaptador distinto (la demo de "The Clearing").

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; depende del modelo base Qwen3.8-27B y de su cuantización. El adaptador en sí ocupa un espacio mínimo (repositorio de 0,0 GB según HuggingFace).
- GPU recomendadas: no disponibles. El entrenamiento se realizó en una NVIDIA DGX Spark, lo que sugiere que el flujo de trabajo cabe en ese equipo con base en 8 bits.
- GPU de consumo: no disponible; un modelo base de 27B en 8 bits requiere del orden de decenas de GB de VRAM, por lo que no se puede confirmar su encaje en GPU de consumo sin datos del modelo base.
- Opciones de despliegue: el autor documenta carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ender1 (este adaptador) | LoRA sobre base de 27B | no disponible | sin evaluación publicada | Apache-2.0 | HuggingFace |
| beanyzoldyck/ender1.1 | LoRA sobre la misma familia | no disponible | no disponible | no disponible | HuggingFace |
| beanyzoldyck/ender1.3 | LoRA más reciente de la familia | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría (adaptadores de alineación para agentes). La comparación disponible se limita a los otros miembros de la familia Ender, que el autor señala como continuaciones de esta línea con una mezcla de generalización reequilibrada.

## Limitaciones y advertencias

- Sin evaluación: no existe ningún benchmark ejecutado sobre este checkpoint; la pérdida de entrenamiento no es una métrica de calidad.
- Entrenamiento incompleto: cubre aproximadamente el 10 % de una época (paso 60 de 597) y el autor indica que la ejecución se reanudó con otro conjunto de datos no incluido aquí.
- Etiquetas no revisadas: las etiquetas de entrenamiento fueron generadas por un asistente y no han pasado revisión humana.
- No apto para producción: el autor prohíbe explícitamente su uso en préstamos, cobros, pagos o cualquier decisión sobre personas reales.
- Discrepancia de cuantización: entrenado sobre base 8-bit y no evaluado sobre base BF16, lo que puede degradar el comportamiento en despliegues con pesos completos.
- Sesgos y alucinación: no documentados en la información disponible; al tratarse de un ajuste sobre un dominio estrecho, cabe esperar un comportamiento fuera de distribución no caracterizado.
- Idiomas y contexto: sin datos declarados; dependen del modelo base.
- Licencia: Apache-2.0, lo que permite uso comercial del artefacto, pero esa permisibilidad no contradice la advertencia del autor sobre no desplegarlo.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/beanyzoldyck/ender1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador ender1.1: https://huggingface.co/beanyzoldyck/ender1.1
- Adaptador ender1.3: https://huggingface.co/beanyzoldyck/ender1.3
- Colección de la familia Ender: https://huggingface.co/collections/beanyzoldyck/ender-family-6adf0636518ed2be2dacdb8a
