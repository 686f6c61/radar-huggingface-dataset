# dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador, denominado `dpo_oasst1_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42`, ha sido publicado por el usuario `dementor-research` como parte de un estudio de imitación conductual configurado mediante la herramienta Tinker de Thinking Machines. El entrenamiento se realizó con el dataset oasst1 (OpenAssistant), aunque no se especifican detalles adicionales del proceso.

El adaptador tiene un tamaño de repositorio de 1,5 GB y está formateado como pesos `safetensors` dentro de la librería `peft`. Al tratarse de un adaptador LoRA, no es un modelo completo sino una modificación incremental del modelo base, que es un transformer MoE de 30 mil millones de parámetros con 3 mil millones activos. No se dispone de información sobre licencia, idiomas soportados, ni métricas de rendimiento.

Dado que el repositorio no incluye una model card detallada más allá de la información básica, la mayoría de las especificaciones técnicas del adaptador y del modelo base permanecen desconocidas. Este adaptador está pensado para ser cargado junto con el modelo base mediante `PeftModel` de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre transformer MoE (modelo base: NVIDIA Nemotron-3-Nano-30B-A3B-BF16) |
| Parametros totales | no disponible (el adaptador pesa 1,5 GB, pero no se indica el número de parámetros) |
| Parametros activos | no disponible (el modelo base tiene 3 mil millones activos, pero el adaptador no especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador está en safetensors, sin cuantización específica) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es una capa LoRA de rango 32 aplicada a todas las capas lineales del modelo base (`target_modules=all-linear`). El entrenamiento se realizó mediante DPO, una técnica de optimización de preferencias que alinea el modelo con respuestas preferidas frente a no preferidas, típicamente usando un dataset de comparaciones humanas. El dataset mencionado es `oasst1`, correspondiente a OpenAssistant Conversations, aunque no se detalla el número de ejemplos ni la proporción de datos.

El modelo base, NVIDIA Nemotron-3-Nano-30B-A3B-BF16, es un transformer MoE (Mixture of Experts) de 30 mil millones de parámetros totales con 3 mil millones activos por token, lo que permite una inferencia relativamente eficiente. Sin embargo, no se proporcionan detalles sobre el preentrenamiento del modelo base, como el número de tokens o la composición del corpus.

El entrenamiento del adaptador se enmarca en un estudio de imitación conductual con configuración definida por el usuario, utilizando la herramienta Tinker de Thinking Machines. No se especifican hiperparámetros adicionales más allá del rango LoRA y el método DPO.

## Capacidades

- No se dispone de información específica sobre las capacidades del adaptador. Al ser un adaptador LoRA sobre un modelo de lenguaje, hereda las capacidades del modelo base (generación de texto, razonamiento, etc.), pero no se han publicado evaluaciones concretas.
- El entrenamiento con DPO sobre oasst1 sugiere una orientación hacia tareas de instrucción y diálogo, aunque no hay evidencia empírica en la documentación.
- No se indica soporte para tool calling, agentes, visión, audio ni modos de razonamiento especiales.

## Casos de uso

- Ajuste fino de un modelo de lenguaje para tareas de conversación o instrucción: el adaptador puede cargarse sobre el modelo base para experimentar con el efecto del entrenamiento DPO sobre oasst1 en la calidad de las respuestas.
- Investigación en imitación conductual: el adaptador forma parte de un estudio académico sobre cómo un modelo pequeño (adaptador) puede imitar el comportamiento de un modelo más grande (en este caso, el modelo base Nemotron).
- Evaluación de técnicas de alineación: permite comparar el rendimiento de DPO frente a otros métodos de alineación usando el mismo modelo base y dataset.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador pequeño (1,5 GB), se puede cargar sobre el modelo base sin necesidad de reentrenar todos los parámetros.
- Experimentación con LoRA en modelos MoE: sirve como ejemplo de cómo aplicar LoRA a un modelo con arquitectura Mixture of Experts.
- Reproducción de estudios: dado que se indica una configuración específica (seed 42, dataset oasst1), puede utilizarse para reproducir resultados de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA requiere el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` para funcionar. El modelo base es un MoE de 30B parámetros totales con 3B activos, lo que implica que la inferencia requiere una GPU con suficiente VRAM para cargar los pesos completos en BF16.
- Estimación orientativa: para BF16, el modelo base podría ocupar aproximadamente 60 GB de VRAM (30B parámetros × 2 bytes). Sin embargo, al ser MoE con solo 3B activos, la memoria requerida puede ser menor si se utiliza una implementación optimizada, pero no se dispone de datos concretos.
- El adaptador en sí ocupa 1,5 GB, pero se suma al modelo base.
- No se indican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.). Se asume que es compatible con el ecosistema HuggingFace Transformers y PEFT.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de sesgos, alucinaciones o limitaciones de contexto.
- Al ser un adaptador LoRA entrenado sobre un dataset específico (oasst1), puede presentar sesgos inherentes a ese dataset, como preferencias culturales o lingüísticas de los anotadores.
- La licencia no está especificada, por lo que se desconoce si su uso comercial está permitido.
- El adaptador depende completamente del modelo base; cualquier limitación del modelo base (por ejemplo, longitud de contexto, idiomas soportados) se aplica también a este adaptador.
- No hay garantías de que el adaptador funcione correctamente fuera del entorno de entrenamiento original, y no se han proporcionado pruebas de robustez.
- Las fechas de creación y actualización (2026) sugieren que el repositorio podría ser experimental o estar incompleto.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42)
- [Modelo base en HuggingFace](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)
- [Herramienta Tinker de Thinking Machines](https://thinkingmachines.ai/tinker/)
