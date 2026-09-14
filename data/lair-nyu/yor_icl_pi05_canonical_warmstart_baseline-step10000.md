# lair-nyu/yor_icl_pi05_canonical_warmstart_baseline-step10000

## Resumen

`lair-nyu/yor_icl_pi05_canonical_warmstart_baseline-step10000` es un checkpoint de pesos publicado por el usuario lair-nyu (aparentemente vinculado a un laboratorio de investigación, LAIR/NYU) dentro de una campaña de experimentos sobre políticas de robot. Según su model card, se trata del brazo de control ("baseline") del proyecto: una política pi0.5 "plana", es decir, sin el condicionamiento por contexto recuperado (VICTR/retrieval) que caracteriza a las otras tres variantes del estudio.

El checkpoint corresponde al paso 10.000 de entrenamiento y se ha inicializado en caliente (warm start) desde `yor_icl_pi05_canonical_extended` en el paso 40.000. El objetivo declarado es aislar el efecto del condicionamiento por contexto de recuperación: todas las variantes comparten el mismo checkpoint de arranque, el mismo `batch_size`, el mismo número de pasos y el mismo calendario de learning rate, de modo que cualquier diferencia se atribuya a la presencia o ausencia de VICTR.

Su relevancia es, por tanto, metodológica y de investigación: no es un modelo de propósito general ni un modelo conversacional, sino un artefacto reproducible para comparar arquitecturas de condicionamiento en aprendizaje a partir de demostraciones (ICL). El repositorio pesa 12,4 GB e incluye únicamente `params/` (pesos), `assets/` (`norm_stats.json`) y `_CHECKPOINT_METADATA`; se ha eliminado deliberadamente `train_state/` (estado del optimizador), por lo que no permite reanudar el entrenamiento tal cual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; la model card solo indica que es "plain pi0.5 (no VICTR/retrieval)" |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas; el repo contiene pesos en el formato propio de openpi) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no safetensors ni GGUF; pesos en `params/` más `assets/norm_stats.json` y `_CHECKPOINT_METADATA`, cargables únicamente a través de la configuración de entrenamiento de openpi |
| Tamaño del repositorio | 12,4 GB (solo pesos y estadísticas de normalización) |
| Paso de entrenamiento | 10.000 |
| Checkpoint de arranque | `yor_icl_pi05_canonical_extended`, paso 40.000 |
| Fecha de publicación | 13 de septiembre de 2026 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: se limita a etiquetar el checkpoint como "plain pi0.5" y a contraponerlo a las tres variantes con condicionamiento por recuperación (VICTR ctx3cam). No se detallan el número de tokens de entrenamiento, la composición del dataset, la presencia de fases de RLHF/DPO ni innovaciones técnicas concretas. Lo que sí se especifica es el protocolo experimental: este checkpoint se entrena desde el mismo punto de partida (`yor_icl_pi05_canonical_extended`, paso 40.000) y con idénticos `batch_size`, `num_train_steps` y calendario de learning rate que las tres variantes VICTR, con el fin de aislar la contribución del contexto de recuperación. Es, por tanto, un control experimental, no una versión optimizada para rendimiento.

En cuanto al formato de distribución, el repositorio sigue la convención del proyecto: solo se publican los pesos, las estadísticas de normalización (`norm_stats.json`) y los metadatos del checkpoint, mientras que el estado del optimizador (aproximadamente 1,5 veces el tamaño de `params/`, y necesario para reanudar el entrenamiento) se descarta. La carga requiere disponer del repositorio openpi con la configuración `yor_icl_pi05_canonical_warmstart_baseline` definida en `openpi/src/openpi/training/config.py`, ya que el checkpoint no incluye la arquitectura ni las transformaciones de datos.

## Capacidades

- Al ser un checkpoint de política derivado de pi0.5, su función esperada es producir acciones de control a partir de observaciones, no generar texto conversacional. La model card no enumera capacidades funcionales.
- No se documenta soporte de tool calling, function calling ni orquestación de agentes.
- No se documenta modo de razonamiento explícito ("thinking mode"), visión, audio ni otras modalidades más allá de las que implique la familia pi0.5.
- No se documentan capacidades multilingües; el prefijo `yor_icl` del proyecto podría sugerir un componente de aprendizaje en contexto, pero la model card no lo aclara y no debe asumirse.
- Su capacidad verificable es la de servir como brazo de control comparable con las tres variantes VICTR del mismo estudio bajo idénticas condiciones de entrenamiento.
- El paquete incluye `norm_stats.json`, lo que implica que la política espera entradas normalizadas según esas estadísticas; el uso correcto exige respetar esa normalización.

## Casos de uso

- Control experimental en investigación de condicionamiento por recuperación: sirve como brazo base frente a las tres variantes VICTR ctx3cam, permitiendo cuantificar cuánto aporta (o perjudica) el contexto recuperado en igualdad de condiciones de entrenamiento.
- Reproducción de resultados: al haberse entrenado con el mismo arranque, `batch_size`, número de pasos y calendario de LR que las otras variantes, permite replicar la comparación publicada sin reentrenar desde cero.
- Punto de partida para nuevos entrenamientos: al ser un warm start consolidado en el paso 10.000, puede reutilizarse como inicialización de experimentos posteriores dentro de la misma familia de configuraciones de openpi.
- Ablación de componentes del pipeline: al carecer de VICTR, resulta útil para medir el efecto aislado de cambios en transformaciones de datos, estadísticas de normalización o política de muestreo, sin la variable adicional del contexto recuperado.
- Investigación sobre aprendizaje en contexto con demostraciones: el nombre del proyecto (`yor_icl`) apunta a experimentos de ICL, y este checkpoint actúa como referencia sin condicionamiento para ese tipo de estudios.
- Despliegue en bucle de control robótico dentro de openpi: mediante `policy_config.create_trained_policy(...)` con la configuración correspondiente, el checkpoint puede instanciarse como política y ejecutarse contra un entorno o robot compatible con el runtime del proyecto.
- Auditoría de checkpoints intermedios: al conservar `norm_stats.json` y los metadatos, permite análisis de estadísticas de normalización y de evolución del entrenamiento entre pasos.
- Fine-tuning sobre tareas nuevas: sirve como inicialización para ajustar una política a un conjunto de tareas distinto, siempre que se reconstruya la configuración de entrenamiento adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de tareas, comparaciones numéricas con las variantes VICTR ni resultados en simuladores o robots reales, y los resultados de búsqueda web obtenidos no guardan relación con este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio contiene 12,4 GB de pesos sin estado del optimizador, de modo que la carga de los pesos exige al menos ese orden de magnitud de memoria; el total depende de la precisión efectiva (fp32, bf16 o fp16) y del tamaño de lote, que no se especifican.
- GPU recomendadas: no disponibles. Por tamaño de artefacto, un acelerador con 24 GB de memoria (por ejemplo, RTX 4090, A5000 o L4 con mayor presión de memoria) sería un punto de partida razonable para una carga en precisión reducida, pero se trata de una estimación, no de un requisito confirmado por el autor.
- ¿Cabe en GPU de consumo? No confirmado. Con 12,4 GB de pesos, una GPU de 24 GB tiene margen si se carga en 16 bits; en 32 bits probablemente no quepa en 24 GB. No hay datos de consumo real publicados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de política. La vía indicada por el autor es openpi, mediante `openpi.policies.policy_config.create_trained_policy` con la configuración `yor_icl_pi05_canonical_warmstart_baseline`.
- Latencia y throughput: no disponibles.
- Almacenamiento: se requieren al menos 12,4 GB para la instantánea local del repositorio, más espacio adicional para el repositorio openpi y las dependencias.

## Comparativa con modelos similares

La información disponible solo permite comparar este checkpoint con los otros artefactos del mismo estudio, y ninguno de ellos publica especificaciones técnicas ni métricas. No se dispone de datos de terceros comparables.

| Modelo | Relación | Parámetros | Contexto | Licencia | Datos públicos |
|---|---|---|---|---|---|
| `yor_icl_pi05_canonical_warmstart_baseline-step10000` | Brazo de control (sin VICTR) | no disponible | no disponible | no disponible | Solo pesos, norm stats y metadatos |
| `yor_icl_pi05_canonical_extended` (paso 40.000) | Checkpoint de arranque en caliente | no disponible | no disponible | no disponible | No verificado en esta búsqueda |
| Tres variantes VICTR ctx3cam | Brazos con condicionamiento por recuperación | no disponible | no disponible | no disponible | No verificadas en esta búsqueda |

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso, lo que impide determinar si el uso comercial está permitido. Debe tratarse como no autorizado hasta confirmación del autor.
- No es un modelo autónomo: el repositorio contiene únicamente pesos y estadísticas de normalización. Sin la configuración de entrenamiento de openpi (`yor_icl_pi05_canonical_warmstart_baseline`) y las transformaciones de datos asociadas, el checkpoint no puede cargarse ni interpretarse correctamente.
- No se puede reanudar el entrenamiento: al haberse eliminado `train_state/`, no hay estado del optimizador ni del calendario de LR, por lo que solo sirve para inferencia o como inicialización de un entrenamiento nuevo.
- Ausencia total de documentación de rendimiento: no hay métricas de éxito, comparaciones con los brazos VICTR ni evaluación en robots reales, de modo que no puede justificarse su uso en producción por méritos propios.
- Riesgo de desajuste de distribución: cualquier uso fuera del entorno y las tareas para las que se recogieron los datos de entrenamiento (no documentados) puede degradar el comportamiento de la política de forma no detectable a partir de la información publicada.
- Sesgos y alucinación: no hay información sobre sesgos del dataset ni sobre tasas de fallo; en el contexto de políticas robóticas, el equivalente al riesgo de alucinación sería la generación de acciones no válidas o inseguras, y no se documenta ningún mecanismo de mitigación.
- Idiomas y contexto: no se declara ni el soporte multilingüe ni la longitud de contexto, por lo que no deben asumirse.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de la consulta, y resultados de búsqueda web no relacionados con el modelo; no existe evidencia externa de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi05_canonical_warmstart_baseline-step10000
- Repositorio de código referenciado por la model card (configuración de entrenamiento `yor_icl_pi05_canonical_warmstart_baseline` en `openpi/src/openpi/training/config.py`): https://github.com/Physical-Intelligence/openpi
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada.
