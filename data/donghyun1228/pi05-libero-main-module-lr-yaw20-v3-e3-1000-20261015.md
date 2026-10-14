# Donghyun1228/pi05-libero-main-module-lr-yaw20-v3-e3-1000-20261015

## Resumen

El modelo `Donghyun1228/pi05-libero-main-module-lr-yaw20-v3-e3-1000-20261015` es un checkpoint de robótica publicado por el usuario Donghyun1228 en HuggingFace, asociado a la librería `openpi` y etiquetado con `robotics`, `libero` e `inverse-dynamics`. Se trata de un candidato experimental dentro de una búsqueda de hiperparámetros declarada explícitamente por el autor, no de un modelo final validado: la propia model card indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito.

El nombre del repositorio sugiere que se apoya en la familia pi0.5 (identificador `pi05`) del stack openpi, y que la variante corresponde a un ajuste fino sobre la tarea/simulador LIBERO con un objetivo de dinámica inversa. Sin embargo, ni la arquitectura concreta ni el número de parámetros están declarados en la información disponible; solo se conoce el tamaño del repositorio (7,7 GB), la licencia (Apache 2.0) y el pipeline declarado (`robotics`).

Su relevancia es acotada y de carácter metodológico: documenta un experimento controlado de ajuste de tasas de aprendizaje por módulo (multiplicadores post-Adam de 3.0 para visión y para el experto, con el LLM congelado) manteniendo el grafo, la inicialización y la normalización originales. Es material útil para quienes replican búsquedas de hiperparámetros en openpi, pero no un artefacto listo para producción dado que carece de resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre del repositorio referencia `pi05`; no se confirma en la model card) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio de 7,7 GB; compatible con la librería `openpi`) |
| Pipeline declarado | `robotics` |
| Dominio | Manipulación robótica (benchmark LIBERO), dinámica inversa |
| Tamaño del repositorio | 7,7 GB |
| Fecha de creación | 14 de octubre de 2026 |
| Última actualización | 14 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de la descripción arquitectónica en la información proporcionada. La model card únicamente describe la configuración del experimento de ajuste: se mantienen sin cambios el grafo nativo, la inicialización desde el modelo fuente y la normalización, y se modifican exclusivamente los multiplicadores de actualización por módulo tras el optimizador Adam. En concreto, se aplica un multiplicador de 3.0 a la torre de visión y de 3.0 al experto, mientras que el componente LLM permanece congelado. La etiqueta `inverse-dynamics` apunta a un objetivo de entrenamiento basado en dinámica inversa, pero no se detalla su formulación.

Los datos de entrenamiento tampoco están descritos en detalle: la model card menciona el uso de "datos de contacto denso existentes" y de la configuración de pre-adaptación original, sin especificar número de tokens, composición del dataset ni si hubo etapas de RLHF o DPO. Sí se documentan los hiperparámetros del run: 1000 actualizaciones sobre `raw999`, batch size 32 y semilla 42. El autor afirma que el checkpoint está completo y que los pesos congelados fueron verificados de forma independiente, pero no aporta métricas de rendimiento ni protocolos de evaluación.

## Capacidades

- Control robótico para tareas de manipulación en el entorno LIBERO, según las etiquetas del repositorio.
- Aprendizaje de dinámica inversa (etiqueta `inverse-dynamics`), orientado a inferir acciones a partir de transiciones observadas.
- Ejecución de inferencia con la muñeca (wrist) del modelo fuente original, según indica la model card.
- Compatibilidad con la librería `openpi` para carga y ejecución.
- No se documentan capacidades de generación de texto, razonamiento, código ni matemáticas.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documentan capacidades multilingües ni de visión más allá del uso implícito de una torre de visión en el ajuste.
- No se documentan modos especiales (thinking, audio, etc.).

## Casos de uso

- Replicación de búsquedas de hiperparámetros en openpi: el checkpoint sirve como referencia de un run concreto (multiplicadores 3.0/3.0, LLM congelado, 1000 pasos, B32, semilla 42) para comparar contra otras configuraciones de la misma campaña.
- Investigación en dinámica inversa aplicada a manipulación: permite estudiar cómo afecta el reescalado de tasas de aprendizaje por módulo al aprendizaje de la relación estado-acción, manteniendo fijo el resto del pipeline.
- Experimentos de ablación sobre congelación de componentes: al dejar el LLM congelado y ajustar solo visión y experto, es útil para medir la contribución de cada módulo sin contaminar el resto del grafo.
- Punto de partida para ajuste fino posterior: al conservar la inicialización y la normalización del modelo fuente, puede emplearse como base para continuar el entrenamiento con otras configuraciones.
- Evaluación comparativa en LIBERO: una vez que el autor publique métricas, el checkpoint podrá integrarse en protocolos de evaluación estandarizados del benchmark para tareas de manipulación.
- Auditoría de reproducibilidad: el repositorio documenta semilla, batch size, número de pasos y política de verificación de pesos congelados, lo que facilita comprobar la reproducibilidad del run.
- Docencia y formación en robótica con VLA: sirve como ejemplo de artefacto intermedio de una búsqueda de hiperparámetros, útil para ilustrar el flujo de trabajo con openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito ("Evaluation is pending; no success rate is claimed").

| Benchmark | Resultado | Notas |
|---|---|---|
| LIBERO | No disponible | Evaluación pendiente según el autor |
| Dinámica inversa | No disponible | Sin métricas publicadas |
| Cualquier otro benchmark | No disponible | Sin datos |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 7,7 GB, por lo que la carga en memoria de pesos en precisión de 16 bits requeriría del orden de 8 GB, a lo que habría que sumar memoria para activaciones y buffers de inferencia. Esta cifra es una estimación derivada del tamaño del repositorio, no un dato confirmado por el autor.
- GPU recomendadas: no disponibles. No se especifica ningún modelo de GPU en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Con la estimación anterior, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) sería probablemente suficiente para cargar los pesos, pero no hay verificación publicada.
- Opciones de despliegue: la librería declarada es `openpi`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia, frecuencia de control ni rendimiento de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que cualquier comparación cuantitativa sería especulativa. La tabla siguiente recoge únicamente la información disponible del modelo analizado frente a alternativas de la misma categoría (políticas viso-lenguaje-acción para manipulación), marcando como "no disponible" todo aquello que no puede verificarse con la información proporcionada.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| pi05-libero-main-module-lr-yaw20-v3-e3-1000 (este modelo) | VLA / manipulación robótica | No disponible | No disponible | Apache 2.0 | No disponibles (evaluación pendiente) |
| Familia pi0.5 (openpi) | VLA / manipulación robótica | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | No disponibles en esta ficha |
| LIBERO baseline (políticas del benchmark) | Manipulación robótica en simulación | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | No disponibles en esta ficha |
| Otras variantes de la misma búsqueda de hiperparámetros del autor | VLA / manipulación robótica | No disponible | No disponible | Apache 2.0 (presumiblemente) | No disponibles |

No se han encontrado en la información proporcionada resultados de benchmarks que permitan establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara explícitamente que la evaluación está pendiente y que no se reclama tasa de éxito. No debe asumirse ningún nivel de rendimiento.
- Artefacto experimental: se trata de un candidato dentro de una búsqueda de hiperparámetros, no de un modelo final. El propio autor indica que "el éxito en el cribado puede seleccionar candidatos posteriores".
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, ni de comportamiento fuera de distribución.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto, pero existe riesgo de comportamiento errático fuera de la distribución de entrenamiento en tareas de manipulación, especialmente al ser un checkpoint sin validar.
- Limitaciones de contexto e idioma: no disponibles. No se especifica la ventana de contexto, ni los idiomas de las instrucciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación con atribución y conservación del aviso de licencia. No obstante, el autor no documenta la procedencia de los datos de entrenamiento, lo que puede afectar a la seguridad jurídica en un despliegue comercial.
- Dependencia de `openpi`: el uso previsto requiere la librería `openpi`, lo que limita la portabilidad a otros stacks de inferencia.
- Verificación de pesos: el autor afirma que los pesos congelados fueron verificados de forma independiente, pero no se aporta la metodología ni los artefactos de dicha verificación.
- Ausencia de documentación reproducible: no se publican recetas de entrenamiento completas, curvas de pérdida ni scripts de evaluación.
- Riesgo de caducidad: con cero descargas y cero likes, el repositorio carece de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw20-v3-e3-1000-20261015
- Librería openpi (referencia del stack declarado): https://github.com/Physical-Intelligence/openpi
- Benchmark LIBERO (referencia del dominio declarado): https://github.com/Lifelong-Robot-Learning/LIBERO

Nota: los enlaces a openpi y LIBERO son referencias de contexto sobre la librería y el benchmark mencionados en las etiquetas del modelo; no fueron aportados en la información de la búsqueda web y no deben considerarse confirmación de la arquitectura ni del pipeline concreto de este checkpoint.
