# rusty-valve/a2_close_act_round2

## Resumen

`rusty-valve/a2_close_act_round2` es un checkpoint de tipo ACT (Action Chunking Transformer) publicado por el colectivo Rusty Valve, orientado a una tarea de control robótico muy concreta: el cierre de la válvula A2. No se trata de un modelo de lenguaje generativo, sino de una política de imitación entrenada para emitir acciones de control a partir de observaciones, empaquetada junto con su configuración, los ajustes del procesador y los tensores de normalización necesarios para reproducir la inferencia.

El repositorio es deliberadamente mínimo: contiene únicamente los pesos en formato `safetensors`, la configuración asociada y los ficheros de normalización, con una licencia Apache-2.0 y un tamaño total de aproximadamente 0,2 GB. La model card indica que el enlace público de descarga está pendiente de subida, de modo que el paquete está pensado para integrarse en el runtime propietario de Rusty Valve mediante una ruta de materiales concreta (`materials_root/models/round2/checkpoint/model.safetensors`) y un conjunto de datos de cobertura específico (`a2_close_coverage_300`).

Su relevancia es acotada pero clara para quien trabaje en el ecosistema Rusty Valve: se trata de un artefacto congelado ("frozen") de una ronda de evaluación concreta, reproducible y versionado, que sirve como referencia para validar pipelines de control de válvulas. Fuera de ese contexto no es un modelo de propósito general, y no se han publicado especificaciones de arquitectura, número de parámetros ni benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors sin indicación de cuantización) |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más configuración del procesador y tensores de normalización |

## Arquitectura y entrenamiento

La model card identifica el modelo como un checkpoint ACT (Action Chunking Transformer), una familia de políticas de imitación para manipulación robótica que predicen secuencias de acciones ("chunks") a partir de observaciones visuales y de estado. El paquete incluye los pesos originales, la configuración, los ajustes del procesador y dos ficheros de tensores de normalización, lo que sugiere un pipeline estándar de normalización de entradas y salidas previo y posterior a la red.

No se especifican en la información proporcionada el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o episodios vistos, ni si hubo etapas de ajuste fino adicionales. La model card menciona un dataset de cobertura asociado (`datasets/a2_close_coverage_300/manifest.json` y `datasets/a2_close_coverage_300/datasets/A2_close/train/`) y un "exam plan" con entradas fijas, lo que apunta a un protocolo de evaluación cerrado y reproducible, pero no se detalla su contenido ni el proceso de entrenamiento.

## Capacidades

- Control robótico de cierre de la válvula A2: el checkpoint está entrenado específicamente para esta tarea de manipulación.
- Predicción de acciones en formato ACT (action chunking), es decir, secuencias de comandos de control en lugar de acciones individuales.
- Integración con el runtime Rusty Valve mediante los parámetros `--materials materials_root --round round2`.
- Reproducibilidad de evaluación: incluye plan de examen y entradas fijas para validar el comportamiento del checkpoint.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Validación de pipelines de control en Rusty Valve: colocar el checkpoint en `materials_root/models/round2/checkpoint/model.safetensors` y ejecutar el runtime con `--round round2` para reproducir la ronda de evaluación con las entradas fijas del plan de examen.
- Referencia de línea base ("baseline") en experimentos de imitación: al ser un checkpoint congelado, sirve como punto de comparación estable frente a nuevas políticas entrenadas para la misma tarea de cierre de válvula.
- Pruebas de regresión de infraestructura: verificar que el runtime, la carga de safetensors, la normalización y el flujo de materiales funcionan correctamente antes de desplegar modelos nuevos.
- Auditoría de reproducibilidad: el paquete incluye pesos, configuración, procesador y normalización, lo que permite reconstruir exactamente la inferencia en otra máquina.
- Docencia o demostración de action chunking: útil para ilustrar cómo se empaqueta y consume un checkpoint ACT en un entorno controlado.
- Integración en pipelines de simulación o banco de pruebas: ejecutar el checkpoint sobre el dataset de cobertura `a2_close_coverage_300` para medir cobertura y comportamiento antes de pasar a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (0,2 GB) sugiere que los pesos caben holgadamente en GPUs de consumo, pero no se confirma el consumo en inferencia.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: probable por el tamaño del artefacto, pero no confirmada en la documentación.
- Opciones de despliegue: exclusivamente el runtime Rusty Valve descrito en la model card (`--materials materials_root --round round2`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia ACT, mismo tamaño o misma tarea, ni se dispone de datos de parámetros, contexto o rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Especialización extrema: el checkpoint está entrenado únicamente para el cierre de la válvula A2; no es reutilizable para otras tareas sin reentrenamiento.
- Enlace de descarga pendiente: la model card indica que el enlace público de descarga está pendiente de subida, por lo que la disponibilidad efectiva de los pesos puede no estar garantizada.
- Dependencia del runtime propietario: requiere el runtime Rusty Valve y una estructura de directorios concreta (`materials_root/models/round2/checkpoint/`), además del dataset `a2_close_coverage_300` y el plan de examen con entradas fijas.
- Ausencia de métricas: no se publican benchmarks, tasas de éxito ni curvas de aprendizaje, lo que impide evaluar su calidad objetiva.
- Riesgo de sobreajuste al entorno de entrenamiento: al ser un artefacto de una ronda concreta, su comportamiento fuera de las condiciones de evaluación puede degradarse.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución a los contribuidores de Rusty Valve, pero conviene conservar el README y la licencia junto al checkpoint.
- Sin información sobre sesgos, alucinación o limitaciones lingüísticas: no aplica en el sentido habitual, pero tampoco se documentan riesgos de seguridad física en la manipulación real de la válvula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rusty-valve/a2_close_act_round2
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
