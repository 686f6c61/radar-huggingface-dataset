# lair-nyu/yor_icl_victr_vision_interp_canonical_ctx3cam-step15000

## Resumen
El repositorio `lair-nyu/yor_icl_victr_vision_interp_canonical_ctx3cam-step15000` contiene un checkpoint (paso 15.000) de una política robótica de tipo visión-lenguaje-acción entrenada con el framework OpenPI. Según la model card, el checkpoint combina recuperación por similitud visual (`retrieval_metric=vision`) con interpolación de tokens de acción de estilo RICL (`use_action_interpolation=True`, `lamda=3.0`) sobre un espacio canónico de acción y contexto con tres fotogramas de contexto por chunk (`context_frames_per_chunk=3`, de ahí el sufijo `ctx3cam`). El backend declarado es `pi05=True` con configuración `Pi0VictrConfig`.

No se trata de un modelo de lenguaje de propósito general, sino de un artefacto de investigación en robótica: el repositorio solo incluye pesos (`params/`), estadísticas de normalización (`assets/norm_stats.json`) y metadatos del checkpoint, y se ha eliminado deliberadamente el estado del optimizador (`train_state/`), por lo que no permite reanudar el entrenamiento. El tamaño total del repositorio es de 12,4 GB.

Su relevancia es acotada al ámbito de la investigación en aprendizaje por imitación e in-context learning aplicado a robótica: permite reproducir y evaluar una variante concreta del pipeline de OpenPI que combina recuperación visual e interpolación de acciones. La model card es extremadamente escueta y no documenta arquitectura detallada, dataset, idiomas, licencia ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones, por lo que carece de validación externa pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. La model card indica `Pi0VictrConfig` con backend `pi05=True`; no se especifica el tipo de red (transformer VLA u otra) |
| Parametros totales | No disponible. Estimación orientativa a partir de los 12,4 GB del repositorio: ~3.000 millones si los pesos estuvieran en fp32 o ~6.000 millones en bf16 (cálculo no confirmado) |
| Parametros activos | No aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible. La configuración usa `context_frames_per_chunk=3` (tres fotogramas de contexto por chunk), pero no se indica la ventana en tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Directorio `params/` (formato exacto no especificado). El repositorio también incluye `assets/norm_stats.json` y `_CHECKPOINT_METADATA`. No se incluye `train_state/` |
| Tamano del repositorio | 12,4 GB |
| Paso de entrenamiento | 15.000 |
| Framework | OpenPI, con la configuración `yor_icl_victr_vision_interp_canonical_ctx3cam` de `openpi/src/openpi/training/config.py` |
| Fecha de creacion (HuggingFace) | 2026-09-15 |

## Arquitectura y entrenamiento
La información disponible se limita a la configuración de entrenamiento declarada en la model card. El modelo se entrena con el framework OpenPI usando `Pi0VictrConfig` y backend `pi05`, y aplica dos mecanismos concretos sobre el espacio canónico de acción y contexto: (1) recuperación por similitud visual (`retrieval_metric=vision`), que selecciona ejemplos o contextos en función de la similitud de las observaciones visuales, y (2) interpolación de tokens de acción de estilo RICL (`use_action_interpolation=True`) con un coeficiente `lamda=3.0`. La configuración `ctx3cam` fija tres fotogramas de contexto por chunk.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, las técnicas de alineamiento (RLHF, DPO u otras), la función de pérdida, el número de parámetros ni innovaciones adicionales como decodificación especulativa o atención lineal. El checkpoint corresponde al paso 15.000 y se publica sin estado del optimizador, por lo que es un artefacto de inferencia o de punto de partida para fine-tuning, no un punto de reanudación de entrenamiento.

## Capacidades
- Generación de acciones para control robótico: es una política entrenada para producir secuencias de acción a partir de observaciones, no un modelo generativo de texto.
- Recuperación por similitud visual: incorpora un mecanismo de retrieval basado en la similitud de las observaciones visuales (`retrieval_metric=vision`), orientado a in-context learning.
- Interpolación de tokens de acción: aplica interpolación de estilo RICL con `lamda=3.0` sobre el espacio canónico de acción y contexto.
- Contexto visual multi-fotograma: consume tres fotogramas de contexto por chunk (`context_frames_per_chunk=3`).
- Carga condicionada a la configuración de entrenamiento: requiere el config `yor_icl_victr_vision_interp_canonical_ctx3cam` del repositorio OpenPI para instanciar la política.
- Soporte de tool calling / function calling: no disponible (no aplica al caso de uso declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): se asume entrada visual por la naturaleza del pipeline, pero la model card no lo detalla de forma explícita; no se declara ningún modo de razonamiento ni audio.

## Casos de uso
- Evaluación comparativa de checkpoints intermedios: un grupo de investigación puede cargar este checkpoint (paso 15.000) junto con otros pasos de la misma ejecución para medir la evolución de la tasa de éxito en tareas de manipulación, usando la misma configuración de OpenPI.
- Reproducción de experimentos de in-context learning en robótica: el checkpoint permite replicar la combinación concreta de retrieval visual e interpolación de acciones (RICL, `lamda=3.0`) y compararla contra variantes sin retrieval o sin interpolación.
- Ablación de hiperparámetros: sirve como punto de partida para estudiar el efecto de `lamda`, del número de fotogramas de contexto (`ctx3cam`) y de la métrica de recuperación sobre el comportamiento de la política.
- Fine-tuning con datos propios: al no incluir `train_state/`, el repositorio está pensado como pesos de partida; puede usarse para adaptar la política a un dominio específico, siempre que se disponga del config de entrenamiento correspondiente.
- Desarrollo y depuración del pipeline de OpenPI: útil para verificar la integración de `policy_config.create_trained_policy` con configuraciones personalizadas dentro de un entorno de investigación.
- Docencia y formación interna: permite ilustrar a un equipo cómo se estructura un checkpoint de política VLA en OpenPI (pesos, norm stats y metadatos, sin estado del optimizador).
- Generación de datos sintéticos de trayectorias para investigación: la política puede emplearse para producir rollouts que después se filtren o analicen, siempre bajo la supervisión de un evaluador humano y en un entorno simulado.
- Punto de partida para despliegue en banco de pruebas robótico: si la plataforma es compatible con la configuración de OpenPI empleada (dato no especificado en la model card), el checkpoint puede cargarse para pruebas de manipulación en laboratorio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de éxito, MMLU, HumanEval, GSM8K ni ningún otro indicador, y los resultados de la búsqueda web no aportan datos sobre el modelo.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio ocupa 12,4 GB, por lo que cargar los pesos sin cuantizar requiere del orden de 13-15 GB de memoria, más el espacio adicional para activaciones y buffers de inferencia; la cifra exacta depende de la precisión real de los pesos, que no se especifica.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar que funcione en GPUs de centro de datos (A100 40/80 GB, H100) y, con margen ajustado, en GPUs de consumo con 24 GB (RTX 3090, RTX 4090) si los pesos caben sin cuantizar adicional; no hay confirmación del autor.
- Compatibilidad con GPU de consumo: no confirmada. La viabilidad depende del formato y la precisión de los pesos y de la memoria necesaria para las activaciones.
- Opciones de despliegue: el único método documentado es la carga mediante OpenPI en Python (`openpi.policies.policy_config.create_trained_policy` con el config `yor_icl_victr_vision_interp_canonical_ctx3cam`). No hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput: no disponible. Al tratarse de una política de control, la latencia relevante sería la frecuencia de inferencia por paso de control, dato que la model card no proporciona.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lair-nyu/yor_icl_victr_vision_interp_canonical_ctx3cam-step15000` | No disponible | No disponible (3 fotogramas de contexto por chunk) | No disponible | No disponible | Repositorio HuggingFace con 0 descargas y 0 likes |
| Otras variantes de la familia OpenPI / pi05 | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Otros checkpoints del mismo proyecto `lair-nyu` | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos comparativos verificables. El único punto de comparación razonable son otros checkpoints de la misma ejecución o del mismo framework OpenPI, para los que esta ficha no tiene cifras.

## Limitaciones y advertencias
- Licencia no declarada: sin licencia explícita, el uso comercial o la redistribución son jurídicamente inciertos; conviene contactar con el autor antes de cualquier uso productivo.
- Checkpoint intermedio: corresponde al paso 15.000, no necesariamente a la mejor iteración ni a una versión final validada.
- No es autocontenido: el repositorio solo contiene pesos, `norm_stats.json` y metadatos; para cargarlo hace falta el config de entrenamiento `yor_icl_victr_vision_interp_canonical_ctx3cam` del repositorio OpenPI, que no se incluye aquí.
- No permite reanudar entrenamiento: la omisión de `train_state/` impide continuar el entrenamiento desde este punto, solo hacer inferencia o fine-tuning desde los pesos.
- Ausencia total de benchmarks: no hay métricas de tasa de éxito ni comparaciones con alternativas, por lo que no puede evaluarse su rendimiento real.
- Sesgos conocidos: no disponible. No se documenta la composición del dataset, por lo que no puede analizarse el sesgo de dominio, de entorno ni de morfología robótica.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en el ámbito de políticas de acción, el riesgo equivalente son predicciones de acción inválidas o incoherentes fuera de la distribución de entrenamiento, riesgo que no está cuantificado.
- Limitaciones de idioma y contexto: no disponibles. La instrucción en lenguaje natural, si forma parte del pipeline, se asume en la lengua del dataset de entrenamiento, que no se especifica.
- Dependencia de la configuración: el comportamiento del checkpoint está ligado a los tres fotogramas de contexto y al valor `lamda=3.0`; no se garantiza un rendimiento equivalente con otras configuraciones de contexto o interpolación.
- Falta de validación comunitaria: 0 descargas y 0 likes, sin issues ni discusiones públicas; no hay evidencia de que el checkpoint se haya probado fuera del grupo autor.
- Cautela en producción: por la ausencia de licencia, benchmarks y documentación, y por tratarse de un artefacto de investigación, no es recomendable desplegarlo en sistemas físicos sin una validación exhaustiva en entorno controlado.
- Resultados de búsqueda no concluyentes: las consultas web devolvieron únicamente páginas de una empresa de remolques y de una red inmobiliaria francesas, homónimas del identificador `lair`, sin relación con el modelo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/lair-nyu/yor_icl_victr_vision_interp_canonical_ctx3cam-step15000
- Repositorio OpenPI citado en la model card (`openpi/src/openpi/training/config.py`): https://github.com/Physical-Intelligence/openpi (enlace inferido de la referencia textual de la model card; no aparece en los resultados de búsqueda)
- Otros resultados de la búsqueda web: sin relevancia para el modelo (https://lair-remorques.fr/, https://www.lair-immobilier.com/ y páginas asociadas de un fabricante de remolques y una red inmobiliaria en Normandía)
- Paper, blog o demo oficiales: no disponibles
