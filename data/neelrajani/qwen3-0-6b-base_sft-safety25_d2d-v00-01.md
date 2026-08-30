# NeelRajani/Qwen3-0.6B-Base_SFT-safety25_D2D-v00.01

## Resumen

El modelo `NeelRajani/Qwen3-0.6B-Base_SFT-safety25_D2D-v00.01` es un adaptador LoRA de rango 32 desarrollado por NeelRajani como parte de un estudio sobre la "superficialidad" (shallowness) del entrenamiento de seguridad en modelos de lenguaje. Se trata de un adaptador PEFT que se monta sobre el modelo base `Qwen/Qwen3-0.6B-Base`, un transformer decoder de 0.6 mil millones de parámetros. El objetivo del adaptador es reproducir la distribución de salida de un teacher de seguridad SFT, concretamente el checkpoint guardado al 25% de los datos de seguridad (`NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01`, revisión `v00.01-step-000000177`).

La relevancia de este modelo radica en su propósito experimental: investigar hasta qué punto el entrenamiento de seguridad se generaliza o si es un fenómeno superficial que puede transferirse mediante destilación. El adaptador se entrena con Generalized Knowledge Distillation (GKD) con divergencia KL off-policy, sin utilizar RLHF ni DPO. Al ser un adaptador LoRA, no modifica los pesos del modelo base, sino que añade un pequeño conjunto de parámetros entrenables. El repositorio tiene un tamaño de 0.1 GB, lo que confirma que solo contiene los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-0.6B-Base (transformer decoder) |
| Parametros totales | no disponible (adaptador LoRA r=32, alpha=16, rsLoRA, all-linear) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA con rango 32, alpha 16 y escalado rsLoRA, aplicado a todas las capas lineales del modelo base. El entrenamiento se realizó mediante GKD (Generalized Knowledge Distillation) con divergencia KL off-policy, con parámetros `lmbda=0` y `beta=0`, y cálculo de divergencia en fp32. El dataset utilizado es `Neelectric/Nemotron-SFT-Safety-v1-nocot`, con 400 pasos de optimización y un batch efectivo de 8. El teacher es un checkpoint de SFT de seguridad guardado al 25% de los datos, lo que permite estudiar cómo se transfiere el conocimiento de seguridad a través de la destilación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- El adaptador no añade capacidades nuevas al modelo base; su función es modificar el comportamiento de salida para alinearse con la distribución de un teacher de seguridad.
- Hereda las capacidades del modelo base Qwen3-0.6B-Base: generación de texto, razonamiento básico, comprensión de instrucciones y generación de código (según las capacidades del modelo base, aunque no se detallan en la información proporcionada).
- El adaptador está diseñado específicamente para ajustar el comportamiento de seguridad, es decir, para producir respuestas que sigan el estilo y las restricciones del teacher SFT.
- No se indica soporte para tool calling, agentes, visión ni audio.
- No se especifican capacidades multilingües.

## Casos de uso

- Investigación en alineación de modelos: el adaptador permite estudiar si el conocimiento de seguridad adquirido en un SFT parcial (25% de los datos) puede transferirse mediante destilación a un modelo base, lo que ayuda a comprender la profundidad del entrenamiento de seguridad.
- Comparación de adaptadores con diferentes porcentajes de datos de seguridad: al existir variantes con 25%, 50% y 75% (según los repositorios relacionados), se puede analizar cómo varía la calidad de la alineación según la cantidad de datos utilizados.
- Evaluación de la robustez de la destilación: el uso de GKD con KL off-policy permite probar si la destilación de un teacher de seguridad produce un adaptador estable o si introduce sesgos adicionales.
- Análisis de la transferibilidad entre dominios: al ser un adaptador LoRA, se puede cargar sobre diferentes versiones del modelo base para comprobar si el comportamiento de seguridad se mantiene.
- Desarrollo de técnicas de alineación eficientes: el estudio de "shallowness" puede orientar el diseño de métodos de entrenamiento de seguridad que requieran menos datos o menos cómputo.
- Reproducción de experimentos académicos: el adaptador está disponible públicamente con una receta de entrenamiento (`recipes/Qwen/Qwen-0.6B-Base/d2d_stage/config_v00.01.yaml`), lo que permite replicar el estudio y verificar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.1 GB), por lo que el requisito principal es el del modelo base Qwen3-0.6B-Base.
- El modelo base de 0.6B parámetros puede ejecutarse en GPUs consumer con al menos 4 GB de VRAM en fp16, o menos con cuantización (por ejemplo, GGUF de 4 bits).
- No se dispone de datos sobre latencia o throughput específicos para este adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face sobre el modelo base, y posteriormente servir con frameworks como vLLM, TGI o llama.cpp (si se exporta a GGUF).
- Para uso en producción, se recomienda fusionar el adaptador con el modelo base y cuantizar el resultado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El adaptador es parte de una familia de adaptadores de seguridad del mismo autor (por ejemplo, `NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01` como teacher, o `NeelRajani/Qwen3-0.6B-Base_SFT-safety25_ADV-pku-v00.01` como variante adversarial), pero no se proporcionan métricas comparativas. Se recomienda consultar los repositorios relacionados para obtener más contexto.

## Limitaciones y advertencias

- Es un modelo experimental destinado a investigación; no se recomienda su uso en producción sin una validación exhaustiva.
- No se ha publicado información sobre sesgos, alucinaciones o comportamientos no deseados del adaptador.
- La licencia no está disponible, por lo que se desconoce si el uso comercial está permitido.
- El adaptador se entrenó con un dataset específico de seguridad (`Neelectric/Nemotron-SFT-Safety-v1-nocot`), lo que puede limitar su generalización a otros dominios o idiomas.
- Al ser un adaptador LoRA, su comportamiento depende del modelo base; cualquier limitación del modelo base (por ejemplo, alucinaciones o sesgos) se mantiene.
- No se han realizado evaluaciones de robustez frente a ataques adversariales ni se ha verificado la estabilidad del comportamiento de seguridad en contextos largos.

## Enlaces

- [HuggingFace - NeelRajani/Qwen3-0.6B-Base_SFT-safety25_D2D-v00.01](https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT-safety25_D2D-v00.01)
- [HuggingFace - Teacher SFT safety v00.01](https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01)
- [HuggingFace - Variante adversarial ADV-pku](https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT-safety25_ADV-pku-v00.01)
- [LLM Explorer - Ficha del modelo](https://llm-explorer.com/model/NeelRajani%2FQwen3-0.6B-Base_SFT_safety_v00.01,2HHZdabfY8ljiQ2B16Af0A)
- [FriendliAI - Despliegue del teacher](https://friendli.ai/models/NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01)
- [FriendliAI - Despliegue de variante safety75](https://friendli.ai/models/NeelRajani/Qwen3-0.6B-Base_SFT-safety75_ADV-pku-v00.01)
