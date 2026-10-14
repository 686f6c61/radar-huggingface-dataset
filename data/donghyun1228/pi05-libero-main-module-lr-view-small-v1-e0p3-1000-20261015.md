# Donghyun1228/pi05-libero-main-module-lr-view-small-v1-e0p3-1000-20261015

## Resumen

El modelo identificado como `Donghyun1228/pi05-libero-main-module-lr-view-small-v1-e0p3-1000-20261015` es un checkpoint de robótica publicado por el usuario Donghyun1228 en HuggingFace. Por su nombre, su etiqueta de librería (`openpi`) y sus tags (`robotics`, `libero`, `inverse-dynamics`), se trata de un candidato de ajuste fino derivado del ecosistema openpi de Physical Intelligence (familia pi0 / pi0.5), orientado a tareas de manipulación robótica dentro del benchmark LIBERO. El checkpoint está pensado como parte de una búsqueda de hiperparámetros explícitamente autorizada, no como un modelo listo para producción.

La model card describe un experimento muy acotado: únicamente se modificaron los multiplicadores de tasa de aprendizaje (LR) de los módulos (`vision` con 1.0 tras Adam, `expert` con 0.3 y el bloque LLM congelado). El resto del grafo nativo, la inicialización desde el modelo fuente, la normalización y los datos de contacto denso preexistentes se mantuvieron sin cambios. El entrenamiento consistió en 1000 actualizaciones (`raw999`), con tamaño de lote 32 y semilla 42.

El interés actual de este checkpoint es de investigación: sirve como referencia reproducible de un barrido de hiperparámetros sobre un modelo de visión-lenguaje-acción (VLA) aplicado a manipulación. La evaluación está pendiente y el autor no reclama ninguna tasa de éxito, por lo que no debe interpretarse como un modelo validado ni como una mejora demostrada sobre el modelo de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en el ecosistema openpi / pi0.5; transformer con backbone de vision-lenguaje y experto de acciones (inferido del nombre y la libreria, no confirmado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en precision nativa; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria `openpi`; tamano del repositorio: 6,9 GB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Por la convención de nombres (`pi05`), la etiqueta `library_name: openpi` y los tags `robotics` y `libero`, cabe situarlo en la familia de modelos VLA de openpi (pi0 / pi0.5), que combinan un backbone de visión-lenguaje con un experto de acciones entrenado mediante flow matching para generar trayectorias de control. Esta correspondencia es una inferencia razonable a partir de los metadatos, no una confirmación explícita del autor.

En cuanto al entrenamiento, el autor indica que solo se alteraron los multiplicadores de tasa de aprendizaje por módulo: `vision` recibe un multiplicador de 1.0 tras Adam, `expert` de 0.3 y el bloque LLM permanece congelado. Se conservan los datos de contacto denso ya existentes, el preajuste original, el grafo nativo sin cambios, la inicialización desde la fuente y la normalización. El ajuste se realizó durante 1000 actualizaciones con tamaño de lote 32 y semilla 42, partiendo de `raw999`. En inferencia se utiliza la muñeca (wrist) de la fuente original. El autor afirma que el checkpoint está completo y que los pesos congelados fueron verificados de forma independiente, pero no aporta métricas de rendimiento ni tasa de éxito.

## Capacidades

- Control robótico y manipulación: modelo orientado a tareas del benchmark LIBERO, con predicción de acciones a partir de observaciones visuales e instrucciones.
- Modelado de dinámica inversa (tag `inverse-dynamics`): capacidad de inferir acciones o comandos a partir de estados y observaciones, enfoque típico en aprendizaje por imitación.
- Vision-lenguaje-acción (VLA): integra percepción visual y comprensión de lenguaje para emitir acciones de control.
- Seguimiento de instrucciones en tareas de manipulación: presumiblemente condicionado por instrucciones textuales, aunque no se especifica el idioma ni el formato.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de razonamiento, visión, audio): únicamente visión y acción propias de un VLA; no se documentan otras.

## Casos de uso

- Investigación en ajuste fino de VLA: el checkpoint sirve como referencia reproducible de un barrido de tasas de aprendizaje por módulo (`vision` 1.0, `expert` 0.3, LLM congelado), útil para comparar configuraciones de entrenamiento sobre el mismo modelo base.
- Evaluación de manipulación en LIBERO: se puede emplear para medir tasas de éxito en las tareas de este benchmark, una vez completada la evaluación pendiente.
- Aprendizaje por imitación con datos de contacto denso: adecuado para experimentos que reutilizan el conjunto de datos de contacto denso del autor sin modificaciones.
- Modelado de dinámica inversa: uso en pipelines que necesitan inferir acciones a partir de observaciones, como base para políticas de control.
- Estudio de congelación de capas: al mantener el LLM congelado y ajustar solo módulos concretos, resulta útil para analizar el impacto del ajuste parcial en tareas robóticas.
- Reproducción de experimentos: con semilla 42, 1000 actualizaciones y lote 32 documentados, permite reproducir el ajuste en entornos de investigación con openpi.
- Selección previa (screening) de candidatos: el propio autor indica que este candidato puede servir para seleccionar modelos posteriores dentro de la misma búsqueda, por lo que encaja en flujos de cribado de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito (`no success rate is claimed`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Como referencia orientativa a partir del tamaño del repositorio (6,9 GB), un checkpoint en precisión reducida requeriría del orden de 8-12 GB de VRAM contando pesos y activaciones; esta cifra es una estimación, no un dato confirmado.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del repositorio, cabría esperar GPUs de gama alta con al menos 16-24 GB de VRAM (por ejemplo, RTX 4090, A100, H100), aunque no hay confirmación.
- ¿Cabe en GPU de consumo? No confirmado. Con 6,9 GB de pesos, es plausible en GPUs de 16-24 GB, pero no hay datos oficiales.
- Opciones de despliegue: el modelo usa la librería `openpi`, por lo que el despliegue seguiría el flujo de trabajo de openpi. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05-libero, candidato LR) | no disponible | no disponible | pendiente de evaluacion; sin tasa de exito | Apache 2.0 | HuggingFace |
| pi0 / pi0.5 (openpi, Physical Intelligence) | no disponible | no disponible | no disponible | Apache 2.0 (openpi) | Repositorio openpi |
| Otros checkpoints LIBERO en HuggingFace | no disponible | no disponible | no disponible | variable | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada, por lo que la comparación cuantitativa no esta disponible.

## Limitaciones y advertencias

- Evaluación pendiente: el autor declara explícitamente que no se reclama ninguna tasa de éxito; el modelo no debe presentarse como validado.
- Naturaleza experimental: es un candidato de una búsqueda de hiperparámetros autorizada, no un modelo listo para producción.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no evaluado; en modelos VLA el riesgo se traduce en acciones incorrectas o inseguras, no en texto.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar del ecosistema openpi conviene verificar las condiciones del modelo base del que parte.
- Caveats para producción: ausencia de métricas, de guía de despliegue y de especificación de hardware; se recomienda tratar el checkpoint como material de investigación y no desplegarlo sin una evaluación propia.
- Trazabilidad: se indica que los pesos congelados fueron verificados de forma independiente, pero no se detalla el procedimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-view-small-v1-e0p3-1000-20261015
- Repositorio openpi (librería indicada en la model card): no disponible en la informacion proporcionada
- Paper o blog asociado: no disponible en la informacion proporcionada
- Demo o repositorio adicional: no disponible en la informacion proporcionada
