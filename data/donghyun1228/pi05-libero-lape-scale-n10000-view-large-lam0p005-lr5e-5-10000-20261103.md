# Donghyun1228/pi05-libero-lape-scale-n10000-view-large-lam0p005-lr5e-5-10000-20261103

## Resumen

π0.5 LIBERO view_large es un checkpoint de adaptación de un modelo de política visomotora (VLA, vision-language-action) derivado de π0.5 y entrenado sobre el benchmark robótico LIBERO. Lo publica el usuario Donghyun1228 dentro del proyecto `vla_adaptation`, y su propósito es servir como punto de medida en un estudio de escalado de datos (data scaling) con la técnica LAPE, que adapta un modelo fuente ya entrenado a una nueva configuración de cámara mediante un objetivo de adaptación basado en IDM (inverse dynamics model) sobre fotogramas de sondeo.

El checkpoint parte de `pi05-libero-lape-scale-source-n10000-10000-20261103` (paso 9999) y aplica 10.000 actualizaciones de adaptación solo sobre el target, con el LLM congelado, usando 10.000 fotogramas de sondeo con vista `view_large` y un optimizador ConflictAnchorAdamW con coeficiente de anclaje 0,005 y LR pico 5e-5. El resultado es una política de evaluación `policy_source_wrist` que alcanza un 62,55 % de éxito en LIBERO (1251/2000 episodios, 500 por suite, semilla de entorno 7, MuJoCo 3.2.3).

Es relevante porque documenta de forma reproducible un punto concreto de la curva de escalado de datos en adaptación de políticas robóticas, con licencia Apache 2.0 y pesos completos (params, train_state y assets de normalización) en un repositorio de 23,8 GB. No es un modelo de lenguaje general: es un artefacto de investigación en robótica, sin descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5 / openpi; no se detalla la configuración interna en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se publican pesos en formato nativo del trainer, sin GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | params y train_state completos más assets de normalización (formato del trainer `vla_adaptation`, no safetensors/GGUF declarados) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de adaptación de π0.5 dentro del ecosistema openpi. La adaptación se realiza con un objetivo de tipo IDM (inverse dynamics model) solo sobre el target: se predicen acciones a partir de pares de fotogramas, excluyendo el índice 6 (pinza/gripper) de la pérdida IDM, y se congela el LLM durante todo el proceso. El optimizador es ConflictAnchorAdamW con ponderación `conflict`, coeficiente de anclaje λ = 0,005 y LR pico 5e-5 constante tras el warmup, con un prior en `prior/lape_k10/prior.json`. Se ejecutan 10.000 actualizaciones sobre 10.000 fotogramas de sondeo con vista `view_large`.

El punto de partida es el paso 9999 del modelo fuente `pi05-libero-lape-scale-source-n10000-10000-20261103`, del mismo tamaño de datos, lo que permite aislar el efecto de la adaptación de vista. El entrenamiento lo ejecuta el trainer externo del proyecto `vla_adaptation` (driver `a7a183e5`, preset `pi05_libero_conflict_anchor_view_adapt`), y el repositorio incluye `run/spec.json` con el argv completo para reproducibilidad. La política de evaluación exportada (`policy_source_wrist`) usa los parámetros del paso 9999 con la cámara de muñeca a través del vision tower del modelo fuente (`export.json`).

## Capacidades

- Control visomotor para manipulación robótica en las cuatro suites de LIBERO (spatial, object, goal, long), con 500 episodios por suite en la evaluación publicada.
- Política de acción condicionada por observaciones visuales de vista `view_large` y cámara de muñeca.
- Adaptación de dominio de cámara/vista mediante IDM sobre fotogramas de sondeo, sin necesidad de etiquetas de acción en el target.
- Punto de medida reproducible para estudios de escalado de datos (data scaling) en adaptación de VLAs.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking; es un modelo específico de robótica.

## Casos de uso

- Investigación en escalado de datos para VLAs: usar este checkpoint como punto de la curva n=10.000 junto al modelo fuente del mismo tamaño para medir el efecto de la adaptación de vista con LAPE.
- Reproducción de experimentos de adaptación de dominio: el repositorio incluye `run/spec.json`, `train_state` y assets de normalización, lo que permite reanudar o auditar el entrenamiento con el driver `a7a183e5`.
- Evaluación comparativa en LIBERO: la política `policy_source_wrist` sirve como referencia con 62,55 % de éxito (semilla 7, MuJoCo 3.2.3) para contrastar variantes de adaptación.
- Estudio de optimizadores con anclaje: el uso de ConflictAnchorAdamW con λ = 0,005 y ponderación `conflict` es un caso concreto para analizar estabilidad y olvido catastrófico al adaptar políticas con el LLM congelado.
- Baseline para adaptación de cámara en robots con configuración `view_large`: útil si se dispone de un robot con esa vista y se quiere partir de una política ya adaptada en lugar de entrenar desde cero.
- Docencia y divulgación sobre VLAs: el checkpoint y su model card permiten ilustrar el flujo completo fuente → adaptación → evaluación en un benchmark estándar.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| LIBERO (4 suites, 500 episodios por suite) | Tasa de éxito | 1251/2000 = 62,55 % |

Condiciones de evaluación declaradas: semilla de entorno 7, MuJoCo 3.2.3, política `policy_source_wrist` con parámetros del paso 9999. No se han publicado en la información disponible resultados desglosados por suite ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 23,8 GB e incluye pesos, `train_state` completo y assets, por lo que el tamaño de los pesos de inferencia es inferior a esa cifra pero no se detalla.
- GPU recomendadas: no disponible en la model card; por el tamaño del repositorio y el uso de MuJoCo para evaluación, se requiere una GPU con memoria suficiente para cargar los parámetros del modelo y el entorno de simulación, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: el formato es el del trainer `vla_adaptation` / openpi; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VLA de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO view_large (este checkpoint) | no disponible | no disponible | 62,55 % en LIBERO (1251/2000) | Apache 2.0 | HuggingFace, 0 descargas |
| pi05-libero-lape-scale-source-n10000-10000-20261103 | no disponible | no disponible | no disponible en la información proporcionada | no disponible | HuggingFace (referenciado como inicialización) |
| Otros VLAs de LIBERO (p. ej. OpenVLA, π0) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

No se dispone de datos comparativos de otros modelos en la información proporcionada; la única comparación directa posible es con el modelo fuente del mismo tamaño de datos, cuyo resultado de evaluación no se incluye.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un LLM general y no debe usarse para generación de texto, código o tareas de lenguaje.
- El resultado de 62,55 % corresponde a una única configuración de evaluación (semilla 7, MuJoCo 3.2.3, política `policy_source_wrist`); no hay evidencia de robustez ante otras semillas, entornos reales o variaciones de cámara.
- La adaptación se hizo con el LLM congelado y solo sobre el target; puede presentar olvido o deriva en dominios distintos al de los 10.000 fotogramas de sondeo.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma; al ser un VLA, el riesgo principal es de comportamiento erróneo en manipulación, no de generación de texto.
- Licencia Apache 2.0 permite uso comercial, pero el checkpoint depende de π0.5/openpi y de LIBERO; conviene verificar las licencias de esos componentes antes de un despliegue comercial.
- Repositorio de 23,8 GB con `train_state` completo: el almacenamiento y la transferencia son costosos, y no se ofrecen cuantizaciones ligeras.
- Sin descargas ni likes en el momento de la ficha: no hay validación comunitaria independiente del resultado publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-n10000-view-large-lam0p005-lr5e-5-10000-20261103
- Modelo fuente (inicialización): https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n10000-10000-20261103
- Proyecto de código `vla_adaptation`: no disponible como enlace directo en la información proporcionada (driver `a7a183e5`, preset `pi05_libero_conflict_anchor_view_adapt`)
- openpi: no disponible como enlace directo en la información proporcionada
- LIBERO: no disponible como enlace directo en la información proporcionada
- Paper de π0.5: no disponible en la información proporcionada
