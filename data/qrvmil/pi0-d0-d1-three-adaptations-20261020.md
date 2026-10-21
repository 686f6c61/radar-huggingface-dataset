# qrvmil/pi0-d0-d1-three-adaptations-20261020

## Resumen

Este repositorio, publicado por el usuario `qrvmil`, documenta un experimento de adaptación de políticas robóticas titulado «π₀: tres formas de adaptación D0 → D1». Se parte del modelo oficial `pi0_base` (π₀, un modelo vision-language-action para manipulación robótica) y se comparan tres estrategias para pasar de una tarea del benchmark LIBERO (D0: coger el cuenco negro del centro de la mesa y colocarlo en el plato) a otra relacionada (D1: coger el cuenco negro junto al plato y colocarlo en el plato). Las tres vías son SFT completo, SFT del *action expert* y RL residual (SAC/Cal-QL) sobre la política D0 congelada.

El interés es metodológico: emplea exactamente las 50 demostraciones nativas de cada tarea, una revisión fijada del dataset y una normalización inmutable compartida, lo que permite comparar de forma controlada cómo se adapta una política VLA con pocos datos. No es un modelo final ni un artefacto listo para producción: la propia model card indica que el entrenamiento continúa y que faltan las métricas finales (300 episodios, tasa de éxito y notebook). El repositorio ocupa 160,4 GB e incluye checkpoints, estados reanudables, estados de reset y vídeos de episodios, no solo pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de `pi0_base` (π₀, modelo vision-language-action de Physical Intelligence); detalles internos no disponibles en la información |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | ru, en |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El punto de partida es el `pi0_base` oficial. Para la tarea D0 se aplica un SFT completo de 3000 actualizaciones con *batch* 8 y sin LoRA. Para D1 se realizan dos SFT independientes de 1500 actualizaciones, cada uno con estados de optimizador nuevos y una única normalización inmutable calculada solo sobre D0. Los datos son las 50 demostraciones nativas de cada tarea, con la revisión de origen fijada en `f13aa24a3da8c43c7225569f28c562979fa0e35a`, sin RLDS filtrado ni demostraciones nuevas; se trata de episodios nuevos de dos tareas conocidas de LIBERO, no de datos fuera de distribución ni de demostraciones reservadas.

La tercera vía es RL residual: se congela la política D0 y se entrena una corrección con SAC/Cal-QL (V3 corregido y V4 con roles D0/D1), incorporando *teacher-warmup* y *potential shaping* como cambios explícitos de V4. La acción final se compone como `clip(a_D0 + 2*residual, -1, 1)` en unidades OSC, con escala 2 para dar un margen amplio de corrección. El entrenamiento es *online* OTF, con actor determinista en evaluación y `probe_fraction` a 0.

## Capacidades

- Generación de acciones de manipulación robótica (política VLA) para las tareas LIBERO D0 y D1 descritas.
- Adaptación mediante SFT completo de una política preentrenada con un conjunto reducido de demostraciones.
- Adaptación mediante SFT centrado en el *action expert*.
- Aprendizaje por refuerzo residual *online* (SAC/Cal-QL) sobre una política congelada, con composición de acciones en unidades OSC.
- Soporte de checkpoints reanudables y estados de normalización versionados.
- Documentación en ruso e inglés.
- No se documentan generación de texto general, *tool calling*, capacidades de agente, visión general, audio ni modo de razonamiento; la información disponible no permite atribuirlas.

## Casos de uso

- Reproducción de experimentos de adaptación en robótica: el repositorio fija revisión de datos, protocolo y código, lo que permite replicar la comparación SFT vs. SFT del *action expert* vs. RL residual sobre LIBERO.
- Investigación en *fine-tuning* con pocos datos: sirve para estudiar cuánto rinde cada estrategia partiendo de solo 50 demostraciones por tarea y una normalización compartida.
- Estudio de RL residual sobre políticas congeladas: el esquema `clip(a_D0 + 2*residual, -1, 1)` en unidades OSC es un caso concreto para analizar la autoridad de corrección y el *potential shaping*.
- Evaluación de protocolos de normalización entre tareas: la normalización inmutable calculada solo sobre D0 es un punto de comparación para medir transferencia D0 → D1.
- Base para pipelines de investigación reproducibles: los checkpoints y estados reanudables permiten reanudar y auditar el entrenamiento.
- Formación y docencia en manipulación robótica: el par de tareas LIBERO y los artefactos de vídeo facilitan explicar adaptación de políticas VLA.
- Referencia metodológica para equipos que preparan sus propios *benchmarks*: el documento de estado y los artefactos intermedios ilustran cómo estructurar un experimento en curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los modelos finales, los 300 episodios, la tasa de éxito (SR) y el notebook aún no están listos, y advierte de no interpretar los artefactos intermedios como resultados definitivos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; no se indican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar a partir de los datos del repositorio.
- El tamaño del repositorio (160,4 GB) incluye checkpoints, estados reanudables, estados de reset y vídeos de episodios, por lo que no equivale al peso de un único checkpoint.
- Opciones de despliegue: el modelo usa la librería `openpi`; no se detallan otras integraciones (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qrvmil/pi0-d0-d1-three-adaptations-20261020` | Adaptación VLA sobre LIBERO (D0/D1) | No disponible | No disponible | No disponible | Repositorio público, entrenamiento en curso |
| `pi0_base` (Physical Intelligence) | Modelo base VLA π₀ | No disponible en la información | No disponible | No disponible | Modelo base citado como origen |
| Otras adaptaciones openpi/LIBERO | *Fine-tunes* de políticas VLA | No disponible | No disponible | Variable, no disponible | No disponible |

No se dispone de cifras de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El entrenamiento sigue en curso: la model card advierte de que los modelos finales, los 300 episodios y la tasa de éxito no están listos, y pide no interpretar los artefactos intermedios como resultado concluyente.
- Alcance muy restringido: solo dos tareas LIBERO (D0 y D1) y 50 demostraciones nativas por tarea; no hay datos fuera de distribución ni demostraciones reservadas.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas limitados a ruso e inglés en la documentación; no se documenta soporte multilingüe adicional.
- No se han publicado resultados de *benchmarks*; no hay evidencia cuantitativa de tasa de éxito ni de generalización.
- Al ser una política robótica, el riesgo relevante no es la alucinación textual sino el fallo de la política en ejecución (errores de agarre, colisiones o desviaciones), que debe validarse en entorno real antes de cualquier uso.
- Los sesgos de los datos de demostración (condiciones de mesa, iluminación, posiciones de los objetos) pueden limitar la transferencia a otros entornos.
- No apta como modelo de propósito general: no se documentan capacidades de texto, *tool calling*, agentes ni visión general.
- Para producción se recomienda verificar el estado del repositorio, la licencia y la disponibilidad de checkpoints finales antes de cualquier integración.

## Enlaces

- HuggingFace: https://huggingface.co/qrvmil/pi0-d0-d1-three-adaptations-20261020
- Código y protocolo fijado: https://github.com/qrvmil/maniskill_myws/tree/exp/pi0-d0-d1-three-adaptations-20261020/experiments/pi0_d0_d1_three_adaptations
- Estado actual del experimento: https://github.com/qrvmil/maniskill_myws/blob/exp/pi0-d0-d1-three-adaptations-20261020/experiments/pi0_d0_d1_three_adaptations/STATUS.md
- Normalización D0: https://huggingface.co/qrvmil/pi0-d0-d1-three-adaptations-20261020/tree/main/normalization/d0
- Checkpoints y estados reanudables: https://huggingface.co/qrvmil/pi0-d0-d1-three-adaptations-20261020/tree/main/checkpoints
- Estados de reset generados: https://huggingface.co/qrvmil/pi0-d0-d1-three-adaptations-20261020/tree/main/reset_states
- Artefactos de episodios y vídeo: https://huggingface.co/qrvmil/pi0-d0-d1-three-adaptations-20261020/tree/main/final
