# myx160/recap-single-task-handoff-20261125

## Resumen

RECAP single-task experiment handoff es un snapshot de investigación publicado por el usuario myx160 en Hugging Face, etiquetado como `robotics`, `libero` y `recap`. No se trata de un modelo de lenguaje generativo, sino de un conjunto de artefactos de entrenamiento e inferencia asociados a un experimento de aprendizaje por refuerzo (RL) sobre tareas de manipulación robótica en el entorno LIBERO. El repositorio contiene cuatro exportaciones de inferencia (Value step 1500 seleccionado en validación, CFG condicionado step 500, y variantes incondicionales 1:1 y 3:1 en step 500), el estado completo de entrenamiento Value en step 7000 y un archivo sellado de evidencias del experimento de noviembre de 2026.

El autor es explícito en la model card: los artefactos son de investigación y la evaluación de desarrollo emparejada no estableció una mejora de política sobre la línea base oficial de SFT (supervised fine-tuning). Es decir, el modelo no supera al baseline supervisado en las métricas evaluadas, lo que convierte este snapshot en material de reproducibilidad y auditoría más que en un modelo listo para producción.

La relevancia es acotada: sirve para reproducir el experimento, inspeccionar los checkpoints intermedios y verificar la cadena de evidencias mediante hashes SHA256 y manifiestos. El repositorio está incompleto mientras la transferencia siga en curso y excluye las trayectorias de entrenamiento y los tres estados completos de optimizador de política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefactos de RL sobre políticas de robótica; no se detalla la red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en formato de entrenamiento original, no cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se incluyen avisos de licencia de componentes originales y restricciones de Gemma en LICENSES.md, LICENSES/ y NOTICE) |
| Formato de pesos | checkpoints de PyTorch serializados (estado de modelo y de optimizador en formato de entrenamiento original); archivo de evidencias `evidence-20261109.tar.zst` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de red de la política ni del modelo Value. Los artefactos se enmarcan en el paradigma RECAP aplicado a tareas de manipulación del benchmark LIBERO, con un componente Value entrenado hasta el step 7000 y exportaciones de inferencia seleccionadas en distintos steps (Value step 1500 por validación, CFG condicionado step 500, e incondicionales 1:1 y 3:1 en step 500). Se menciona un sidecar de Advantage y ficheros de binding, lo que sugiere un pipeline de RL con estimación de ventaja y clasificador libre de guía (CFG) para el muestreo condicionado.

No se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La base de reproducibilidad es el commit de Git `0ce24e56bbad36b24269c6261b089ab9403fad79`, junto con snapshots previos de datos y runtime de la colección RECAP del autor. El snapshot excluye las trayectorias de entrenamiento y los tres estados completos de optimizador de política, y el repositorio está incompleto mientras la transferencia siga en curso. Los checkpoints de Torch contienen estado Python serializado, por lo que requieren el entorno de entrenamiento correspondiente para cargarse.

## Capacidades

- Ejecución de políticas de manipulación robótica en tareas LIBERO, a partir de las exportaciones de inferencia incluidas.
- Evaluación de componentes Value y CFG en distintos steps de entrenamiento para análisis de ablación.
- Reproducción de experimentos de RL mediante checkpoints de modelo y optimizador en formato original.
- Verificación de integridad de artefactos mediante SHA256 y tamaños en bytes listados en RESTORE.json.
- Restauración de evidencias del experimento de noviembre de 2026 (manifiestos, sidecar de Advantage, ficheros de binding y sondas de recarga).
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de RL en robótica: cargar el estado Value step 7000 y las exportaciones de inferencia con el entorno de entrenamiento del commit indicado para replicar la evaluación de desarrollo emparejada.
- Auditoría de resultados: restaurar `evidence-20261109.tar.zst` y contrastar los manifiestos, el sidecar de Advantage y las sondas de recarga contra los checksums de RESTORE.json.
- Análisis de ablación de CFG: comparar las exportaciones condicionada step 500 e incondicionales 1:1 y 3:1 para estudiar el efecto de la guía en el muestreo de la política.
- Estudio de dinámica de entrenamiento: inspeccionar la evolución del componente Value entre el step 1500 (seleccionado por validación) y el step 7000.
- Base para investigación comparativa: usar el snapshot como referencia negativa frente a la línea base oficial de SFT en LIBERO, dado que no se observó mejora de política.
- Integración en pipelines de verificación: automatizar la comprobación de tamaños y hashes antes de restaurar artefactos en un proyecto, siguiendo el marcador BACKUP_COMPLETE.json.
- Docencia y formación: ilustrar un flujo completo de handoff de experimentos de RL con evidencias selladas y trazabilidad por commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la evaluación de desarrollo emparejada no estableció una mejora de política sobre la línea base oficial de SFT, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 1.5 GB, pero no se desglosa por checkpoint ni se indica el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; los checkpoints están en formato de entrenamiento PyTorch y requieren el entorno de entrenamiento correspondiente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El autor declara que la evaluación de desarrollo emparejada no estableció mejora de política sobre la línea base oficial de SFT; no debe presentarse como una mejora validada.
- El repositorio está incompleto mientras la transferencia siga en curso; deben descargarse los ficheros en la revisión inmutable indicada en BACKUP_COMPLETE.json una vez publicado el marcador.
- El snapshot excluye las trayectorias de entrenamiento y los tres estados completos de optimizador de política, lo que limita la reproducción completa del entrenamiento.
- Los checkpoints de Torch contienen estado Python serializado; cargarlos requiere el entorno de entrenamiento exacto y conlleva riesgos de seguridad asociados a la deserialización.
- Licencia no disponible de forma explícita; se incluyen avisos de componentes originales y restricciones de Gemma que deben revisarse antes de cualquier uso.
- No hay información sobre sesgos, alucinación, cobertura idiomática ni rendimiento en producción, al no tratarse de un modelo de lenguaje.
- Es imprescindible verificar tamaños y hashes SHA256 de RESTORE.json antes de usar los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myx160/recap-single-task-handoff-20261125
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
