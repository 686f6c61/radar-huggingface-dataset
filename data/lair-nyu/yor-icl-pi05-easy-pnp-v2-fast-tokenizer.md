# lair-nyu/yor-icl-pi05-easy-pnp-v2-fast-tokenizer

## Resumen

`yor-icl-pi05-easy-pnp-v2-fast-tokenizer` es un tokenizador de secuencias de acciones para modelos de robótica de tipo Vision-Language-Action (VLA), desarrollado por el grupo `lair-nyu`. Se enmarca en el ecosistema de `openpi` y de la familia `pi0-fast`, y su función es convertir trayectorias de acciones continuas en tokens discretos mediante el método FAST (Frequency-space Action Sequence Tokenization). Este tokenizador se ajustó específicamente sobre el subconjunto "easy pick-and-place v2" del dataset `icl-dataset`, compuesto por 204 episodios y 8.782 chunks de datos.

El modelo resuelve el problema de representar acciones de alta dimensión (20 dimensiones) y horizonte temporal (30 pasos) en un vocabulario compacto de 1024 tokens, logrando una compresión media de aproximadamente 22,2 veces. Es relevante porque permite entrenar modelos VLA con eficiencia computacional, al reducir la longitud de las secuencias de acción que deben procesar los transformadores. Aunque ha sido superado por una versión expandida (`yor-icl-expanded-fast-tokenizer`), sigue siendo útil para configuraciones que referencian este ajuste concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador FAST (Frequency-space Action Sequence Tokenization) |
| Parametros totales | no disponible (tokenizador, no modelo generativo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (diseñado para secuencias de acción de horizonte 30) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferido por el uso de `transformers.AutoProcessor`) |

## Arquitectura y entrenamiento

El tokenizador emplea el enfoque FAST, que opera en el espacio de frecuencias para tokenizar secuencias de acciones. Según la model card, se ajustó sobre 204 episodios del subconjunto "easy pick-and-place v2" de `icl-dataset`, con 8.782 chunks. Los hiperparámetros de ajuste incluyen `action_horizon=30`, `action_dim=20`, `vocab_size=1024`, `scale=10.0`, `sample_fraction=0.1` y `normalization_mode=QUANTILES`. La compresión resultante es de aproximadamente 22,2x, con una longitud media de token de 27,0 y un percentil 99 de 85,0.

No se dispone de información detallada sobre el proceso de entrenamiento (número de pasos, optimizador, función de pérdida) más allá de los datos de ajuste. El tokenizador se integra en configuraciones de `openpi` mediante `Pi0FASTConfig` o `Pi0KiConfig`, apuntando a la ruta local del repositorio, o se carga con `transformers.AutoProcessor` gracias al `auto_map` definido en `processor_config.json`.

## Capacidades

- Tokenización de secuencias de acciones robóticas de alta dimensión (20 dimensiones) en un vocabulario discreto de 1024 tokens.
- Compresión de secuencias de acción con un ratio medio de 22,2x, reduciendo la carga computacional en modelos VLA.
- Normalización por cuantiles (`QUANTILES`), lo que permite manejar distribuciones de acción no gaussianas.
- Integración nativa con el ecosistema `openpi` y la familia `pi0-fast` (configuraciones `Pi0FASTConfig` y `Pi0KiConfig`).
- Carga mediante `transformers.AutoProcessor`, facilitando su uso en pipelines estándar de Hugging Face.
- Específico para tareas de pick-and-place "fáciles" (easy) en el dataset `icl-dataset`, con un ajuste pensado para ese subconjunto.

## Casos de uso

- Entrenamiento de modelos VLA para manipulación robótica: el tokenizador convierte trayectorias de acciones continuas en tokens discretos, permitiendo que modelos como `pi0.5` procesen secuencias de acción de forma eficiente durante el entrenamiento y la inferencia.
- Evaluación de políticas de control en simuladores: al tokenizar acciones con un vocabulario fijo, se pueden comparar diferentes políticas sobre el mismo espacio de representación, facilitando la depuración y el análisis de rendimiento.
- Fine-tuning de modelos VLA preentrenados: al ser un tokenizador ligero y específico para un subconjunto de datos, puede usarse para adaptar modelos base a tareas de pick-and-place con pocos episodios.
- Investigación en compresión de acciones: el ratio de compresión de 22,2x y la normalización por cuantiles ofrecen un caso de estudio para métodos de tokenización en el espacio de frecuencias.
- Reproducción de experimentos de `openpi`: los repositorios que referencian este tokenizador (como `yor_icl_pi0_fast_easy_pnp_v2_sanity15k_annealing`) pueden cargarlo directamente para replicar resultados.
- Desarrollo de pipelines de robótica con Hugging Face: al ser compatible con `AutoProcessor`, se puede integrar en flujos de datos estándar sin necesidad de código personalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento en tareas de robótica, ni comparaciones con otros tokenizadores. Los únicos datos cuantitativos son los de compresión (ratio 22,2x, longitud media 27,0, p99 85,0), que no constituyen un benchmark de tarea.

## Requisitos de hardware

- Al ser un tokenizador (no un modelo generativo), sus requisitos de hardware son mínimos: puede ejecutarse en CPU sin problema.
- No requiere GPU para la tokenización de acciones; el coste computacional principal reside en el modelo VLA que lo consume.
- Para el entrenamiento de modelos VLA que usan este tokenizador, se recomienda GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090) para configuraciones pequeñas, y A100/H100 para escalados mayores, aunque estos requisitos dependen del modelo completo, no del tokenizador.
- Opciones de despliegue: integración con `openpi` (vía `Pi0FASTConfig` o `Pi0KiConfig`) o carga directa con `transformers.AutoProcessor`. No se documentan opciones específicas como vLLM u Ollama, ya que no es un LLM.

## Comparativa con modelos similares

No se dispone de información sobre tokenizadores de acciones comparables en el mismo contexto. El propio repositorio indica que ha sido superado por `yor-icl-expanded-fast-tokenizer`, que se ajusta a un conjunto de tareas más amplio. No hay datos públicos de otros tokenizadores FAST o alternativas (como tokenizadores basados en VQ-VAE o discretización directa) que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El tokenizador está ajustado exclusivamente sobre el subconjunto "easy pick-and-place v2" de `icl-dataset`; su uso en otras tareas o distribuciones de acción puede degradar la compresión o la fidelidad de la reconstrucción.
- Ha sido superado por `yor-icl-expanded-fast-tokenizer` para configuraciones entrenadas en el conjunto de tareas expandido; se recomienda usar la versión actualizada salvo que se necesite reproducir experimentos antiguos.
- No se documentan sesgos específicos, pero al entrenarse sobre un dataset concreto, puede heredar sesgos de ese dataset (por ejemplo, limitaciones en la variedad de objetos o entornos).
- Riesgo de alucinación: no aplica, al ser un tokenizador y no un modelo generativo de texto.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia de los modelos VLA que lo consumen (por ejemplo, `pi0.5` puede tener restricciones adicionales).
- No se proporcionan garantías de rendimiento en producción; la compresión de 22,2x es una media y puede variar según la distribución de acciones.

## Enlaces

- [Repositorio HuggingFace del tokenizador](https://huggingface.co/lair-nyu/yor-icl-pi05-easy-pnp-v2-fast-tokenizer)
- [Modelo asociado `yor_icl_pi05_easy_pnp_v2_sanity15k`](https://huggingface.co/lair-nyu/yor_icl_pi05_easy_pnp_v2_sanity15k)
- [Modelo expandido `yor_icl_pi05_expanded_full`](https://huggingface.co/lair-nyu/yor_icl_pi05_expanded_full)
- [Tokenizador expandido que lo supera](https://huggingface.co/lair-nyu/yor-icl-expanded-fast-tokenizer)
- [Paper de π0.5 (PDF)](https://www.pi.website/download/pi05.pdf)
