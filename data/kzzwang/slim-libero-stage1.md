# kzzwang/SLIM-LIBERO-Stage1

## Resumen

SLIM-LIBERO-Stage1 es un checkpoint de dinámica (Stage-1) del proyecto SLIM-0.5B, una línea de investigación sobre aprendizaje autosupervisado de representaciones latentes ancladas en acciones para manipulación robótica. Lo publica el usuario kzzwang en Hugging Face y se distribuye con la librería `slim-policy`, bajo una licencia propia denominada `slim-license`. El checkpoint corresponde a una ejecución de reproducción fechada el 12 de octubre de 2026, tras 17.736 pasos de optimización (3 épocas) de entrenamiento conjunto de dinámica inversa (IDM) y dinámica directa condicionada por acción (FDM).

El modelo no es una política de acción final: es un checkpoint de dinámica pensado para inicializar la política de Stage-2 y para diagnósticos de representación. El autor advierte explícitamente que no se afirma que sea el ancestro Stage-1 original del modelo reportado en el artículo ni de la release existente `kzzwang/SLIM-LIBERO`. El repositorio pesa 1,5 GB y contiene un `state_dict` de PyTorch de 1.464.159.013 bytes que incluye los pesos del modelo Stage-1 y los pesos objetivo EMA, pero no el estado del optimizador.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación en robótica, sin benchmarks publicados en la información disponible, sin idiomas declarados y sin descargas ni interacciones en el momento de la consulta. Es útil para quien quiera reproducir o inspeccionar la receta de entrenamiento de SLIM sobre el benchmark LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de dinámica con encoder de visión y pesos EMA; detalles arquitectónicos no especificados en la información disponible) |
| Parametros totales | no disponible (el nombre del proyecto, SLIM-0.5B, sugiere aproximadamente 0,5B, pero el tamaño del fichero de pesos es de 1.464.159.013 bytes y no se confirma el recuento de parámetros) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | slim-license (license: other) |
| Formato de pesos | PyTorch `state_dict` (`epoch_3_pytorch_model.pt`) |

## Arquitectura y entrenamiento

El entrenamiento combina dos objetivos: un modelo de dinámica inversa (IDM) y un modelo de dinámica directa condicionada por acción (FDM), con pesos de pérdida en proporción 0,125:1. Se usan datos de LIBERO-90 junto con LIBERO-Object, LIBERO-Goal, LIBERO-Spatial y LIBERO-10. La receta fija semilla 42, batch global 128, horizonte de acción 8, 512 "future slots" y momentum EMA de 0,999. La receta original basada en épocas resuelve 5.912 actualizaciones por época y 17.736 actualizaciones en total, coherente con las 3 épocas indicadas.

El checkpoint incluye tanto el modelo Stage-1 como los pesos objetivo EMA. Para la política canónica de Stage-2 (solo acción), el autor indica que deben cargarse los pesos del modelo omitiendo `ema_vision_encoder.` y `_ema_fp32_`, tal como hace la implementación de entrenamiento de SLIM, e inicializar un optimizador y un schedule nuevos. El commit fuente del entrenamiento es `00426cc82a44ca9397d293fcad226e12dc574d2c` y el código está en el repositorio GitHub kzz1031/SLIM. La información disponible no detalla la arquitectura interna (tipo de transformer, encoder visual, mecanismo de atención ni innovaciones como decodificación especulativa).

## Capacidades

- Aprendizaje de representaciones latentes ancladas en acciones para manipulación robótica.
- Modelado de dinámica inversa (inferir acciones a partir de transiciones) y dinámica directa condicionada por acción (predecir estados futuros).
- Inicialización de políticas de acción en Stage-2 (no es una política final por sí mismo).
- Diagnóstico de representación mediante los pesos EMA incluidos en el checkpoint.
- Entrenamiento y evaluación sobre tareas del benchmark LIBERO (LIBERO-90, Object, Goal, Spatial y 10).
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de la receta de entrenamiento SLIM: cargar el checkpoint y reejecutar el pipeline del repositorio kzz1031/SLIM con el commit fuente indicado para validar los 17.736 pasos y la semilla 42.
- Inicialización de una política Stage-2: cargar los pesos omitiendo `ema_vision_encoder.` y `_ema_fp32_`, inicializar un optimizador y schedule nuevos y entrenar la política de acción canónica sobre LIBERO.
- Diagnóstico de representación: analizar los pesos EMA (`_ema_fp32_`) para estudiar la estabilidad y la calidad de las representaciones latentes aprendidas durante el entrenamiento conjunto IDM/FDM.
- Investigación sobre aprendizaje autosupervisado en robótica: usar el checkpoint como línea base para comparar variantes de objetivos de dinámica inversa y directa con distintos pesos de pérdida.
- Evaluación de transferencia entre suites LIBERO: emplear el checkpoint entrenado con LIBERO-90, Object, Goal, Spatial y 10 para estudiar la generalización entre conjuntos de tareas de manipulación.
- Verificación de integridad de artefactos: comprobar el SHA-256 esperado (`8ec953e7b9bbcacd583f2f7770f8196f0728a4bad1dcabf6acde3b16d4bece3d`) tras la descarga con `hf download`, útil en pipelines de MLOps que requieren trazabilidad de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El fichero de pesos ocupa 1.464.159.013 bytes (aproximadamente 1,46 GB), lo que sugiere que la inferencia o el uso del checkpoint puede caber en GPUs de consumo con suficiente memoria, aunque no se dispone de cifras oficiales de VRAM.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del fichero de pesos es compatible con GPUs de consumo de gama alta, pero no se especifican requisitos.
- Opciones de despliegue: la librería declarada es `slim-policy`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (el modelo no es de lenguaje).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kzzwang/SLIM-LIBERO-Stage1 | no disponible | no disponible | sin benchmarks publicados | slim-license | Hugging Face, 0 descargas |
| kzzwang/SLIM-LIBERO | no disponible | no disponible | sin benchmarks publicados en la información disponible | slim-license | Hugging Face, 945 MB |
| Otros modelos de robótica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La única alternativa identificada en la información disponible es la release `kzzwang/SLIM-LIBERO` (945 MB), de la misma familia y licencia, que el autor no identifica como descendiente directo de este checkpoint Stage-1.

## Limitaciones y advertencias

- No es una política de acción final: está pensado para inicializar Stage-2 y para diagnóstico de representación, no para despliegue directo en control robótico.
- El autor no afirma que este checkpoint sea el ancestro Stage-1 original del modelo del artículo ni de la release `kzzwang/SLIM-LIBERO`; la procedencia es una ejecución de reproducción concreta.
- El checkpoint incluye pesos EMA y no incluye el estado del optimizador; cargarlo para Stage-2 requiere omitir `ema_vision_encoder.` y `_ema_fp32_` e inicializar un optimizador y schedule nuevos.
- La configuración incluida usa variables de entorno para activos locales y datos, lo que puede complicar la reproducibilidad sin ajustar el entorno.
- Licencia `slim-license` (license: other): deben consultarse los términos en el enlace de licencia del repositorio antes de cualquier uso comercial; no se detallan restricciones en la información disponible.
- Sin idiomas declarados y sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en las tareas LIBERO en la información disponible.
- Riesgo de sesgo y alucinación: no aplicable en el sentido de modelos de lenguaje; los sesgos provendrían de la distribución de datos de LIBERO y no se documentan.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/kzzwang/SLIM-LIBERO-Stage1
- Release relacionada: https://huggingface.co/kzzwang/SLIM-LIBERO/tree/main
- Repositorio de código: https://github.com/kzz1031/SLIM
- Configuraciones LIBERO: https://github.com/kzz1031/SLIM/tree/main/configs/libero
- Licencia: https://github.com/kzz1031/SLIM/blob/main/LICENSE
