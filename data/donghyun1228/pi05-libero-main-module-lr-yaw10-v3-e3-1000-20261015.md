# Donghyun1228/pi05-libero-main-module-lr-yaw10-v3-e3-1000-20261015

# pi05-libero-main-module-lr-yaw10-v3-e3-1000-20261015

## Resumen

`pi05-libero-main-module-lr-yaw10-v3-e3-1000-20261015` es un checkpoint de robótica publicado en Hugging Face por el usuario Donghyun1228 bajo licencia Apache 2.0. Se distribuye a través de la librería openpi y lleva las etiquetas `openpi`, `robotics`, `libero` e `inverse-dynamics`, lo que lo sitúa en el ámbito de los modelos visión-lenguaje-acción (VLA) para manipulación robótica evaluados sobre el benchmark LIBERO. El repositorio ocupa 7,7 GB y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes".

Según su model card, no es un modelo entrenado desde cero, sino un candidato dentro de una búsqueda de hiperparámetros: se conservan el grafo nativo, la inicialización y la normalización del modelo fuente, y solo se modifican los multiplicadores de actualización de determinados módulos (visión y experto, ambos a 3.0 después de Adam), manteniendo el LLM congelado. El entrenamiento declarado es de 1000 actualizaciones con batch de 32 y semilla 42.

Su relevancia es, por tanto, acotada y experimental. El propio autor indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito, de modo que se trata de un artefacto intermedio útil para reproducibilidad, ablaciones y selección de candidatos, no para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; los tags (`openpi`, `inverse-dynamics`) y la nomenclatura `pi05` apuntan a un modelo visión-lenguaje-acción (VLA) de la familia openpi (pi0.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (en modelos VLA el horizonte relevante es la ventana de observación y el chunk de acciones, tampoco documentados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el repositorio de 7,7 GB se sirve mediante la librería `openpi` |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna en la información disponible. Los tags y el nombre del repositorio permiten inferir que se trata de un checkpoint derivado de un modelo visión-lenguaje-acción de la familia openpi (`pi05`), con un componente de visión, un LLM y un "experto" de acciones; la etiqueta `inverse-dynamics` sugiere que el experto se entrena con un objetivo de dinámica inversa, aunque esto no se confirma en la model card.

Lo que sí se detalla es el procedimiento de ajuste: se parte de datos de contacto denso y de la configuración previa al adapt ("original pre-adapt"), sin alterar el grafo nativo ni la inicialización y normalización de la fuente. Las únicas modificaciones son los multiplicadores post-Adam de los módulos de visión (3.0) y experto (3.0), con el LLM congelado. La nomenclatura del repositorio es coherente con esa configuración: `v3-e3` correspondería a los multiplicadores de visión y experto, `yaw10` a un parámetro de sesgo de guiñada y `1000` al número de actualizaciones. El entrenamiento declarado es de 1000 pasos sobre "raw999", con batch de 32 y semilla 42, y en inferencia se utiliza la cámara de muñeca de la fuente original. El autor afirma que el checkpoint está completo y que los pesos congelados se verificaron de forma independiente.

## Capacidades

- Control de manipulación robótica: el modelo pertenece a la categoría de políticas visión-lenguaje-acción, por lo que su salida esperada son acciones motoras condicionadas por observaciones visuales (cámara de muñeca en inferencia) y, presumiblemente, una instrucción en lenguaje natural.
- Dinámica inversa: la etiqueta `inverse-dynamics` indica entrenamiento orientado a predecir acciones a partir de transiciones, si bien no se detalla el esquema exacto.
- Componente lingüístico congelado: el LLM no se ha adaptado en este candidato, por lo que no se han añadido capacidades nuevas de comprensión o generación de lenguaje.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponibles; el modelo no declara idiomas.
- Capacidades especiales (modo "thinking", visión general, audio): no disponibles. Fuera de la observación visual propia de la política de control, no se documenta ninguna.
- Capacidad demostrada: ninguna. La evaluación está pendiente y el autor no reclama tasa de éxito, de modo que no puede afirmarse ningún resultado funcional verificado.

## Casos de uso

- Reproducción de búsquedas de hiperparámetros: el checkpoint documenta semilla (42), batch (32), número de actualizaciones (1000) y multiplicadores exactos, lo que permite replicar el punto de la búsqueda y compararlo con otros candidatos bajo condiciones idénticas.
- Ablación sobre el congelado del LLM: al mantener el LLM congelado y modificar solo visión y experto, sirve como rama de control frente a candidatos que ajustan el componente lingüístico, aislando el efecto de cada multiplicador.
- Selección de candidatos ("screening"): el autor indica que el éxito en el cribado puede seleccionar candidatos posteriores, por lo que este artefacto funciona como entrada de un pipeline de evaluación comparativa dentro de la misma búsqueda.
- Evaluación en LIBERO: si finalmente se ejecuta la evaluación pendiente, el uso natural es medir tasas de éxito en las suites de manipulación de LIBERO, con especial atención a tareas de contacto denso, que es el tipo de datos declarado.
- Punto de partida para ajuste fino propio: al conservar la inicialización y normalización de la fuente y distribuirse bajo Apache 2.0, puede servir como inicialización para adaptaciones a dominios de manipulación propios, asumiendo el coste de reentrenamiento.
- Auditoría de integridad de pesos: el autor menciona una verificación independiente de los pesos congelados, de modo que el repositorio puede emplearse como referencia para comprobar que un ajuste no ha alterado los módulos que debían permanecer fijos.
- Integración en el stack openpi para inferencia: al declarar `library_name: openpi`, el destino previsto es su ejecución mediante esa librería en un montaje robótico con cámara de muñeca como entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito, por lo que no existe ningún número verificable que presentar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El único dato dimensional es el tamaño del repositorio (7,7 GB), que no permite derivar con fiabilidad el número de parámetros ni la memoria necesaria, ya que puede incluir estado auxiliar de optimizador o múltiples artefactos.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo se distribuye a través de openpi, cuyo destino son aceleradores GPU, pero no se especifica ningún modelo concreto.
- Viabilidad en GPU de consumo: no disponible. No se puede confirmar que quepa en tarjetas tipo RTX 4090 o inferiores sin datos de parámetros y precisión.
- Opciones de despliegue: únicamente se declara la librería `openpi` (`library_name: openpi`). No se documentan vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. En robótica la frecuencia de control es un parámetro crítico y no se publica ninguna cifra.
- Requisito de entrada: la inferencia utiliza la cámara de muñeca de la fuente original, por lo que el montaje físico debe respetar esa configuración.

## Comparativa con modelos similares

No se dispone de datos verificables de comparativa en la información proporcionada, y la búsqueda web realizada no devolvió resultados relacionados con el modelo. Como referencias de categoría (VLA para manipulación robótica) podrían considerarse los modelos de la familia openpi de los que deriva este checkpoint y alternativas del ecosistema como GR00T N1, pero no hay cifras publicadas en la información disponible para ninguno de los casos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05-libero-main-module-lr-yaw10-v3-e3-1000 | no disponible | no disponible | Apache 2.0 | Hugging Face (repo de 7,7 GB), 0 descargas |
| Familia openpi (pi0, pi0.5) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion |
| Alternativas VLA del ecosistema (p. ej. GR00T N1) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion |

## Limitaciones y advertencias

- Evaluación pendiente: el autor declara explícitamente que no se reclama ninguna tasa de éxito. No debe presentarse como un modelo funcional validado.
- Artefacto intermedio de una búsqueda de hiperparámetros: está descrito como "candidato" dentro de una búsqueda explícitamente autorizada, con propósito de cribado, no de producción.
- LLM congelado: el componente lingüístico no se ha adaptado, lo que limita cualquier expectativa de mejora en comprensión de instrucciones.
- Sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de redactar la ficha, por lo que no existe evidencia externa de funcionamiento.
- Especialización estrecha: los datos declarados son de contacto denso y la referencia es LIBERO, con riesgo de sobreajuste al dominio del benchmark.
- Idiomas, sesgos y alucinación: no disponibles. Al ser una política de control, el riesgo relevante no es la alucinación textual sino la ejecución de acciones incorrectas sobre hardware físico.
- Fechas de publicación atípicas: la creación y actualización declaradas son del 2026-10-14, por lo que conviene verificar la trazabilidad y procedencia del artefacto antes de reutilizarlo.
- Licencia: el repositorio se publica bajo Apache 2.0, lo que permite uso comercial del artefacto, pero no se indica la licencia del modelo base sobre el que se construye; conviene comprobarla antes de cualquier uso comercial.
- Riesgo físico: cualquier despliegue en un robot real exige validación en entorno controlado con paradas de seguridad, dado que no hay métricas de éxito publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw10-v3-e3-1000-20261015
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los únicos resultados obtenidos correspondían a una obra jurídica sobre propiedad intelectual sin relación con el artefacto. No se han encontrado papers, blogs, repositorios ni demos asociados en la información disponible.
