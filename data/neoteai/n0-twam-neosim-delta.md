# NeoteAI/n0-twam-neosim-delta

## Resumen

N0-TWAM (NeoteAI/n0-twam-neosim-delta) es un checkpoint post-entrenado del modelo N0-TWAM, un "world action model" táctil-nativo desarrollado por NeoteAI para robótica de manipulación con contacto. El modelo integra visión, tacto y acción en una arquitectura Mixture-of-Transformers bajo un objetivo unificado de rectified-flow / flow-matching: predice simultáneamente el futuro visual, el futuro táctil y la acción de bajo nivel que lo realiza. Este checkpoint concreto está post-entrenado sobre el conjunto de tareas NeoSim 12 (4 tareas de brazo único y 8 de brazo dual) con espacio de acción pi05_delta (delta de horizonte), y parte de la base `pretrain_mot_umi_mixed/checkpoint_step_16500_r42` (MoT narrow, tacto local desactivado).

El modelo tiene 7.207.357.844 parámetros (7,2B) en formato safetensors y se distribuye bajo licencia Apache-2.0. Está diseñado para servirse con configuración específica por tarea (normas per-task, claves de cámara/táctil y canales de acción), no con un envoltorio global. Su relevancia actual radica en que aborda el reto de la manipulación robótica con contacto rico, donde el tacto es esencial para tareas como ensamblaje o inserción, y lo hace con un modelo unificado que predice futuro visual y táctil antes de generar la acción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) con expertos de acción/táctil (1024) y FFN (4096) |
| Parametros totales | 7.207.357.844 (7,2B) |
| Parametros activos | no disponible (arquitectura MoE, no se especifica número de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivos en `transformer/`) |

## Arquitectura y entrenamiento

N0-TWAM es un modelo de tipo "world action model" que combina visión, tacto y acción en una única arquitectura Mixture-of-Transformers. Utiliza tres expertos modales (visión, tacto, acción) que predicen el futuro visual y táctil antes de generar la acción, todo bajo un objetivo de rectified-flow / flow-matching. El checkpoint `n0-twam-neosim-delta` es el resultado de un post-entrenamiento multi-tarea sobre 12 tareas de NeoSim (4 de brazo único, 8 de brazo dual) con espacio de acción pi05_delta (delta de horizonte). La receta de post-entrenamiento incluye: tacto local activado ("flip-on current"), 12 cabezas de horizonte × 12 predicciones de acción (h12 × apf12), expertos MoT narrow (acción/táctil 1024, FFN 4096), sin drops táctiles, tasa de aprendizaje 1e-4 con decaimiento coseno y 10.000 pasos. El tacto se basa en sensores GelSight con imágenes RGB sin marcadores (marker-less). La normalización de acciones es per-task (q01/q99 por robot), no una media agrupada.

El entrenamiento base proviene de un pre-entrenamiento a escala con flujos táctiles sincronizados por dedo, como se describe en la página de investigación de NeoteAI. El checkpoint post-entrenado se sirve con la configuración `ar_server` (`AR_SERVE_RUN` / `AR_SERVE_TASK`) y prompts verbatim del roster de tareas.

## Capacidades

- Predicción de futuro visual y táctil: el modelo genera tres flujos acoplados (video futuro, tacto futuro y acción) para cada chunk.
- Control robótico de bajo nivel: genera acciones de efector final en espacio de delta de horizonte (pi05_delta), adecuado para control fino.
- Multi-tarea: soporta 12 tareas de manipulación de NeoSim (4 de brazo único, 8 de brazo dual), incluyendo tareas de contacto rico.
- Integración táctil nativa: usa imágenes táctiles GelSight RGB sin marcadores como entrada, permitiendo percepción de contacto.
- Post-entrenamiento específico: el checkpoint está optimizado para el conjunto NeoSim, no para uso general.
- No es un modelo de lenguaje ni de visión general: no tiene capacidades de conversación, generación de texto o visión genérica fuera del ámbito robótico.

## Casos de uso

- Manipulación robótica con contacto rico: el modelo puede controlar brazos robóticos en tareas como inserción, ensamblaje o agarre con precisión, gracias a su integración táctil y predicción de futuro.
- Aprendizaje por imitación multi-tarea: sirve como política para ejecutar demostraciones de 12 tareas de NeoSim, con normalización per-task para adaptarse a cada robot.
- Control dual-arm: las 8 tareas de brazo dual permiten coordinación de dos brazos, útil en escenarios de ensamblaje colaborativo.
- Investigación en world action models: sirve como referencia para estudiar la predicción de futuro visual y táctil como mecanismo para mejorar la generación de acciones.
- Desarrollo de sistemas de control con realimentación táctil: el modelo puede integrarse en pipelines robóticos donde la información táctil es crítica (por ejemplo, evitar daños en objetos frágiles).
- Evaluación de políticas robóticas en simulación: el checkpoint puede usarse en entornos de simulación NeoSim para validar algoritmos de control antes de transferir a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K (al ser un modelo robótico, dichos benchmarks no aplican). Tampoco se proporcionan métricas de éxito por tarea (por ejemplo, tasa de éxito en NeoSim). La página de investigación de NeoteAI menciona el escalado del modelo, pero no se detallan números concretos en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada: no se especifica oficialmente. Con 7,2B parámetros en precisión FP16, se estima un mínimo de ~15 GB de VRAM para inferencia (sin cuantización). Con cuantización a 8 bits, ~8 GB; a 4 bits, ~4-5 GB, aunque no se ofrecen archivos GGUF o cuantizados.
- GPU recomendadas: para inferencia en FP16, una GPU con 24 GB o más (RTX 3090/4090, A100, H100). Para pruebas en consumer, una RTX 4090 (24 GB) es suficiente.
- Compatibilidad con GPU consumer: sí, con cuantización o usando FP16 en GPUs de 24 GB. En GPUs de 16 GB (RTX 4080) podría ser ajustado.
- Opciones de despliegue: el modelo se sirve con el config `ar_server` mencionado en la model card; no se mencionan integraciones con vLLM, llama.cpp u Ollama (al no ser un modelo de lenguaje). Se puede desplegar con el toolkit de N0-TWAM (GitHub) para inferencia robótica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el contexto de world action models táctil-nativos. La página de investigación de NeoteAI posiciona N0-TWAM como un escalado de este tipo de modelos, pero no se citan alternativas concretas con métricas comparables. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- El checkpoint está post-entrenado exclusivamente para las 12 tareas de NeoSim; no es un modelo generalista y no funcionará fuera de ese conjunto sin re-entrenamiento.
- La normalización de acciones es per-task; servirlo con el envoltorio agrupado (`train_meta.json`) producirá acciones desnormalizadas a escala incorrecta. Es obligatorio usar la configuración `ar_server` con las claves y canales de la tarea evaluada.
- No se proporcionan datos de sesgos o alucinación (al ser un modelo de control, no generativo de texto), pero la predicción de futuro puede fallar en escenarios fuera de la distribución de entrenamiento.
- No se especifica la longitud de contexto ni la ventana temporal de los chunks; se desconoce el alcance temporal de las predicciones.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones de los datos de entrenamiento (NeoSim, GelSight) que pueden tener restricciones adicionales.
- El modelo requiere integración con el toolkit de N0-TWAM y el servidor `ar_server`; no es un modelo plug-and-play.

## Enlaces

- HuggingFace: https://huggingface.co/NeoteAI/n0-twam-neosim-delta
- GitHub (N0-TWAM): https://github.com/neoteai/N0-TWAM
- Página de investigación: https://research.neoteai.com/n0-twam/
- README del GitHub: https://github.com/neoteai/N0-TWAM/blob/main/README.md
