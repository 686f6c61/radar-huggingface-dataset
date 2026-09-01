# lair-nyu/yor-icl-expanded-fast-tokenizer

## Resumen

`yor-icl-expanded-fast-tokenizer` es un tokenizador de acciones FAST (Frequency-space Action Sequence Tokenization) desarrollado por el laboratorio LAIR de la Universidad de Nueva York (NYU). Está diseñado para su uso en políticas VLA (Vision-Language-Action) dentro del ecosistema openpi, concretamente para las variantes `pi0-fast` que emplean una pérdida auxiliar FAST. El tokenizador convierte secuencias continuas de acciones robóticas de alta dimensión en tokens discretos, lo que permite a los modelos autoregresivos predecir acciones de forma eficiente y comprimida.

El modelo se ha ajustado sobre el subconjunto expandido de 31 tareas y 1.784 episodios de manipulación bimanual de pick-and-place del dataset `icl-dataset`. Con una dimensión de acción de 20, un horizonte de 30 pasos y un vocabulario de 1.024 tokens, alcanza un ratio de compresión medio de 20,8x respecto a la tokenización por paso individual. Su relevancia radica en que permite entrenar políticas VLA con ventanas de contexto más largas y menor coste computacional, manteniendo la fidelidad de las acciones mediante normalización por cuantiles.

La licencia Apache 2.0 facilita su integración en proyectos comerciales y de investigación. Se carga mediante `transformers.AutoProcessor` o apuntando la ruta del tokenizador en las configuraciones `Pi0FASTConfig` y `Pi0KiConfig` de openpi.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador FAST (Frequency-space Action Sequence Tokenization) |
| Parametros totales | no disponible (tokenizador basado en estadísticas, no en red neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa secuencias de acción de hasta 30 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; opera sobre acciones robóticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se carga vía `AutoProcessor`; probablemente archivos de configuración y estadísticas) |

## Arquitectura y entrenamiento

El tokenizador sigue el método FAST descrito en el paper *FAST: Efficient Action Tokenization for Vision-Language-Action Policies* (arXiv:2501.09747). En lugar de tokenizar cada paso de acción individualmente, FAST transforma la secuencia completa de acciones al dominio de la frecuencia (mediante transformada de Fourier), retiene los coeficientes más significativos y los cuantiza en un vocabulario discreto. Esto permite una compresión sustancial de la secuencia sin pérdida crítica de información.

El ajuste se realizó sobre el subconjunto expandido del dataset `icl-dataset`, que incluye 31 tareas de pick-and-place bimanual, 1.784 episodios y 96.010 chunks de acción. Los hiperparámetros clave son: `action_horizon=30`, `action_dim=20`, `vocab_size=1024`, `scale=10.0`, `sample_fraction=0.1` y `normalization_mode=QUANTILES`. La normalización por cuantiles asigna los valores continuos a bins basados en la distribución empírica de los datos, lo que mejora la robustez frente a valores atípicos. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente estadístico sobre los datos de demostración.

## Capacidades

- Tokenización de secuencias de acciones continuas de dimensión 20 (típica de robots bimanuales) en tokens discretos de un vocabulario de 1.024 entradas.
- Compresión de secuencias de acción con un ratio medio de 20,8x (longitud media de token 28,8 frente a 600 valores continuos por secuencia).
- Soporte para políticas VLA con pérdida auxiliar FAST, incluyendo las configuraciones `yor_icl_pi0_fast_expanded`, `yor_icl_fast_victr_vision_expanded` y `yor_icl_ki_subtask`.
- Integración nativa con openpi: se puede apuntar `fast_tokenizer_path` en `Pi0FASTConfig` o `Pi0KiConfig`.
- Carga mediante `transformers.AutoProcessor` gracias al `auto_map` definido en `processor_config.json`.
- Normalización por cuantiles, que maneja distribuciones de acción no gaussianas de forma más robusta que la normalización estándar.

## Casos de uso

- Entrenamiento de políticas VLA bimanuales: el tokenizador se usa como capa de preprocesamiento para convertir demostraciones de pick-and-place en secuencias de tokens que alimentan el modelo autoregresivo. Su alta compresión permite entrenar con ventanas de contexto más largas sin aumentar el coste computacional.
- Inferencia de políticas `pi0-fast` en robots reales: durante la ejecución, el modelo predice tokens de acción que el tokenizador decodifica de vuelta a valores continuos, permitiendo control en tiempo real con baja latencia.
- Fine-tuning de políticas VLA sobre nuevas tareas: al estar ajustado sobre un dataset expandido de 31 tareas, sirve como tokenizador base para transferir a tareas similares de manipulación bimanual.
- Evaluación de arquitecturas de tokenización: investigadores pueden comparar el rendimiento de FAST frente a tokenizadores por paso individual (como los usados en pi0 original) en términos de precisión de acción y eficiencia de entrenamiento.
- Generación de datos sintéticos de acción: el tokenizador puede utilizarse para comprimir y almacenar grandes conjuntos de demostraciones robóticas, reduciendo el espacio de almacenamiento y acelerando la carga de datos en pipelines de entrenamiento.
- Integración en sistemas de aprendizaje por refuerzo: al discretizar las acciones, facilita el uso de algoritmos de RL basados en políticas discretas sobre espacios de acción continuos de alta dimensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas comparativas de rendimiento en tareas robóticas, ni evaluaciones frente a otros tokenizadores. Los únicos datos cuantitativos son las estadísticas de ajuste (ratio de compresión 20,8x, longitud media de token 28,8, p99 61,0), que describen la eficiencia de compresión pero no la calidad de las políticas resultantes.

## Requisitos de hardware

- El tokenizador es un componente de preprocesamiento ligero: no requiere GPU para tokenizar secuencias de acción. Su ejecución es puramente estadística (transformada de Fourier y cuantización) y puede realizarse en CPU.
- Para el entrenamiento de políticas VLA que lo utilizan, se requieren GPUs de alta capacidad: las configuraciones `pi0-fast` de openpi suelen entrenarse con GPUs como A100 (80 GB) o H100, dependiendo del tamaño del backbone (pi0.5 en el caso de `yor_icl_fast_victr_vision_expanded`).
- Para inferencia en robots, el tokenizador se ejecuta en el mismo dispositivo que la política (típicamente una GPU embebida como Jetson Orin o una GPU de escritorio), pero su coste es despreciable frente al del modelo VLA.
- Opciones de despliegue: al ser un procesador estándar de HuggingFace, puede integrarse en pipelines con `transformers`, openpi, o cualquier framework que soporte `AutoProcessor`. No requiere vLLM ni llama.cpp, ya que no es un modelo generativo de lenguaje.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre tokenizadores de acción alternativos comparables en el contexto de VLA (por ejemplo, tokenizadores por paso individual como los de pi0 original, o métodos basados en VQ-VAE). La información proporcionada no incluye comparaciones con otras propuestas.

## Limitaciones y advertencias

- El tokenizador está ajustado exclusivamente sobre el subconjunto expandido de 31 tareas de pick-and-place bimanual del dataset `icl-dataset`. Su capacidad de generalización a otras distribuciones de acción (por ejemplo, tareas de navegación, manipulación con una sola mano, o espacios de acción con dimensiones diferentes) no está garantizada.
- La compresión en el dominio de la frecuencia introduce una pérdida de información inherente. Aunque el ratio de compresión es alto (20,8x), acciones con alta frecuencia o movimientos muy rápidos podrían verse degradados.
- No se han publicado evaluaciones de robustez frente a ruido en las observaciones o cambios en la calibración del robot.
- La licencia Apache 2.0 permite uso comercial, pero el dataset `icl-dataset` sobre el que se ajustó puede tener sus propias restricciones; es responsabilidad del usuario verificar la licencia de los datos.
- El tokenizador no es un modelo de lenguaje: no soporta procesamiento de texto ni interacción conversacional. Su uso está restringido al dominio robótico.
- No se dispone de información sobre la latencia exacta del tokenizador en diferentes hardware, aunque por su naturaleza estadística se espera que sea inferior a 1 ms por secuencia en CPU moderna.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lair-nyu/yor-icl-expanded-fast-tokenizer
- Paper FAST: https://arxiv.org/abs/2501.09747
- Checkpoint de política relacionado: https://huggingface.co/lair-nyu/yor_icl_fast_victr_vision_expanded_full
- Perfil de LAIR NYU en HuggingFace: https://huggingface.co/lair-nyu/models
