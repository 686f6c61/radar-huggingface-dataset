# NeelRajani/Qwen3-0.6B-Base_SFT-safety50_D2D-v00.01

## Resumen

Este modelo es un adaptador LoRA de rango 32 desarrollado por NeelRajani sobre el modelo base `Qwen/Qwen3-0.6B-Base`. Forma parte de un estudio denominado *shallowness* (superficialidad) que investiga hasta qué punto el entrenamiento de seguridad en modelos de lenguaje es profundo o meramente superficial. El adaptador se entrena mediante destilación de conocimiento generalizada (GKD) para reproducir la distribución de salida de un profesor de seguridad (safety-SFT) guardado al 50% de los datos de entrenamiento de seguridad.

El objetivo concreto es imitar el comportamiento del checkpoint `NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01` (revisión `v00.01-step-000000354`) sobre el dataset `Neelectric/Nemotron-SFT-Safety-v1-nocot`. El adaptador se entrena con 400 pasos de optimización y un tamaño de lote efectivo de 8, utilizando una divergencia forward KL en precisión fp32. El repositorio tiene un tamaño de 0,1 GB y contiene únicamente los pesos del adaptador en formato safetensors, listos para cargarse con la librería PEFT.

La relevancia de este modelo radica en su contribución al análisis de la profundidad del entrenamiento de seguridad: permite comparar cómo se comporta un modelo cuando se destila el conocimiento de un profesor a diferentes etapas del entrenamiento, lo que ayuda a entender si la seguridad aprendida es una capa superficial o está integrada en las representaciones internas. No se dispone de información sobre licencia, idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=32, alpha=16, rsLoRA, all-linear, dropout 0) sobre Qwen3-0.6B-Base (transformer decoder) |
| Parametros totales | 0.6B (modelo base) + adaptador LoRA (número de parámetros no especificado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 aplicado a todas las capas lineales del modelo base congelado `Qwen/Qwen3-0.6B-Base`. El entrenamiento utiliza la técnica GKD (Generalized Knowledge Distillation) con una divergencia forward KL, configurada con `lmbda=0` y `beta=0`, y la divergencia se calcula en precisión fp32. El adaptador emplea rsLoRA (rotated scaling LoRA) con `alpha=16` y sin dropout.

El dataset de entrenamiento es `Neelectric/Nemotron-SFT-Safety-v1-nocot`, un conjunto de datos de seguridad sin cadena de pensamiento. Se realizaron 400 pasos de optimización con un tamaño de lote efectivo de 8. El objetivo es que el adaptador reproduzca la distribución de salida del profesor de seguridad guardado al 50% del entrenamiento de seguridad, lo que permite estudiar la profundidad de dicho entrenamiento. No se mencionan técnicas adicionales como RLHF o DPO; el enfoque es puramente de destilación.

## Capacidades

- El adaptador no introduce capacidades nuevas; modifica el comportamiento del modelo base para alinearlo con directrices de seguridad aprendidas del profesor.
- Generación de texto: hereda la capacidad de generación de lenguaje natural del modelo base Qwen3-0.6B-Base.
- Razonamiento y conocimiento general: dependen del modelo base, no del adaptador.
- No se documenta soporte para tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.
- El adaptador está diseñado específicamente para investigación sobre la profundidad del entrenamiento de seguridad, no para uso general en producción.
- No se especifican capacidades multilingües; el modelo base Qwen3-0.6B-Base soporta múltiples idiomas, pero no se confirma para este adaptador.

## Casos de uso

- Investigación sobre la profundidad del entrenamiento de seguridad: el adaptador permite comparar el comportamiento de un modelo destilado desde un profesor al 50% de su entrenamiento frente a otros adaptadores (por ejemplo, al 100% o con diferentes rangos LoRA) para determinar si la seguridad es una capa superficial.
- Análisis de destilación de conocimiento en seguridad: se puede estudiar cómo la divergencia forward KL y la configuración GKD afectan a la fidelidad de la destilación en dominios de seguridad.
- Evaluación de la transferencia de alineación: el adaptador sirve para probar si el conocimiento de seguridad aprendido por un profesor se transfiere correctamente a un modelo base congelado mediante LoRA.
- Comparación de adaptadores de seguridad: junto con otros adaptadores del mismo autor (por ejemplo, `SFT-safety50_ADV-pku-v00.01`), permite analizar el efecto de diferentes datasets o técnicas de entrenamiento en la seguridad del modelo.
- Estudio de la influencia del rango LoRA: al existir ramas por rango (revisión `v00.01-r32`), se puede investigar cómo el rango afecta a la capacidad de retener el conocimiento de seguridad.
- Desarrollo de metodologías de alineación eficiente: los resultados pueden informar el diseño de técnicas de fine-tuning de seguridad que requieran menos recursos computacionales, al demostrar que un adaptador pequeño puede imitar a un profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este adaptador. Dado que se trata de un adaptador LoRA sobre un modelo base de 0.6B parámetros, se puede inferir que los requisitos son modestos: el modelo base en fp16 ocupa aproximadamente 1,2 GB de VRAM, y el adaptador añade una cantidad mínima. Sin embargo, no se proporcionan datos concretos sobre VRAM, GPUs recomendadas, latencia o throughput. Para inferencia, se puede cargar con `transformers` y `peft` en cualquier GPU con al menos 2 GB de VRAM, o incluso en CPU, aunque no se documenta oficialmente. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El adaptador pertenece a una familia de adaptadores de seguridad sobre Qwen3-0.6B-Base (por ejemplo, el profesor `NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01` y el adaptador `NeelRajani/Qwen3-0.6B-Base_SFT-safety50_ADV-pku-v00.01`), pero no se publican métricas de rendimiento ni especificaciones detalladas de estos modelos comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción; no se recomienda su uso en aplicaciones comerciales sin una evaluación exhaustiva.
- La licencia no está especificada, por lo que el uso comercial y la redistribución son inciertos.
- El entrenamiento se realizó sobre un dataset específico de seguridad (`Nemotron-SFT-Safety-v1-nocot`); la generalización a otros dominios o estilos de conversación no está garantizada.
- No se documentan sesgos conocidos, pero al ser un adaptador sobre un modelo base, puede heredar sesgos del modelo original.
- No se proporcionan datos sobre alucinación o fiabilidad de las respuestas.
- El adaptador requiere el modelo base `Qwen/Qwen3-0.6B-Base` para funcionar; no es un modelo autónomo.
- La longitud de contexto y los idiomas soportados no están especificados, lo que limita su uso en escenarios que requieran contextos largos o multilingües.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT-safety50_D2D-v00.01
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Profesor (teacher) de seguridad: https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01
- Adaptador relacionado (ADV-pku): https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT-safety50_ADV-pku-v00.01
- Página de análisis en llm-explorer: https://llm-explorer.com/model/NeelRajani%2FQwen3-0.6B-Base_SFT_safety_v00.01,2HHZdabfY8ljiQ2B16Af0A
- Despliegue en FriendliAI: https://friendli.ai/models/NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01
