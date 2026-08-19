# dementor-research/self_sft_writingprompts_qwen3.6-27b_as_qwen3.6-27b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA denominado `self_sft_writingprompts_qwen3.6-27b_as_qwen3.6-27b_seed42`, publicado por el usuario `dementor-research`. Se trata de un adaptador de tipo PEFT (Parameter-Efficient Fine-Tuning) entrenado mediante la herramienta Tinker, de Thinking Machines, como parte de un estudio de imitación de comportamiento definido por configuración. El adaptador se aplica sobre el modelo base `Qwen/Qwen3.6-27B`, un modelo de lenguaje de 27 000 millones de parámetros de la familia Qwen.

El entrenamiento corresponde a una etapa denominada `SELF_SFT` (self-supervised supervised fine-tuning), con rango LoRA de 32 y módulos objetivo de tipo `all-linear`. El tamaño del repositorio es de aproximadamente 1 GB, lo que sugiere que solo contiene los pesos del adaptador, no el modelo completo. La ficha pública no incluye detalles sobre el conjunto de datos de entrenamiento, los hiperparámetros exactos, la licencia ni los idiomas soportados.

La relevancia de este modelo es limitada en el contexto actual: se trata de un artefacto experimental dentro de un estudio más amplio que abarca 12 modelos, 4 conjuntos de datos y 1 semilla, generando 48 celdas de configuración. No se han publicado resultados de evaluación ni documentación adicional que permita validar su utilidad práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.6-27B) con adaptadores LoRA (rank 32, target_modules=all-linear) |
| Parametros totales | no disponible (el adaptador LoRA es una fraccion de los 27B del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (via PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo `Qwen/Qwen3.6-27B`, un transformer autoregresivo de 27 000 millones de parametros. El entrenamiento se realizo mediante LoRA (Low-Rank Adaptation) con rango 32 y aplicando los adaptadores a todas las capas lineales del modelo (`target_modules=all-linear`). La etapa de entrenamiento se denomina `SELF_SFT`, lo que sugiere un fine-tuning supervisado sobre datos generados o etiquetados de forma automatica, aunque no se especifica la composicion del dataset ni el numero de tokens utilizados.

La herramienta de entrenamiento es Tinker, de Thinking Machines, que permite definir configuraciones de entrenamiento de forma declarativa. El estudio incluye 12 modelos, 4 datasets y 1 semilla, lo que da lugar a 48 celdas de configuracion. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al SFT. Tampoco se indica si el entrenamiento incluyo tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

No se han documentado capacidades especificas para este adaptador mas alla de las que pueda heredar del modelo base `Qwen/Qwen3.6-27B`. La unica informacion disponible es que el nombre del adaptador hace referencia a `writingprompts`, lo que sugiere que el entrenamiento se realizo sobre datos de indicaciones de escritura creativa. Sin embargo, no se proporcionan ejemplos de uso, ni se confirma que el adaptador mejore la generacion de texto creativo, el razonamiento, el codigo o cualquier otra habilidad.

- Generacion de texto: no documentada de forma especifica para este adaptador.
- Razonamiento, matematicas o codigo: no se mencionan en la informacion disponible.
- Tool calling o function calling: no se menciona.
- Capacidades multilingues: no se indican idiomas soportados.
- Modo thinking, vision o audio: no se mencionan.

## Casos de uso

No se han publicado casos de uso concretos para este adaptador. Dado que se trata de un artefacto experimental dentro de un estudio de imitacion de comportamiento, su aplicacion en entornos de produccion no esta respaldada por documentacion ni evaluaciones. Los posibles escenarios serian especulativos y no se pueden recomendar sin datos adicionales.

- No se dispone de casos de uso documentados.
- El adaptador podria utilizarse como punto de partida para experimentos de fine-tuning sobre Qwen3.6-27B, pero sin garantias de rendimiento.
- No se recomienda su uso en aplicaciones criticas sin una validacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion sobre MMLU, HumanEval, GSM8K u otras pruebas estandar que permitan comparar este adaptador con otros modelos o adaptadores.

## Requisitos de hardware

No se especifican requisitos de hardware para este adaptador. Dado que se trata de un LoRA que se carga sobre el modelo base `Qwen/Qwen3.6-27B`, los requisitos de inferencia dependen del modelo base. Un modelo de 27 000 millones de parametros requiere una GPU con al menos 16-20 GB de VRAM en cuantizacion de 8 bits, y mas de 50 GB en precision completa. Sin embargo, no se proporcionan datos concretos sobre el consumo de memoria del adaptador ni sobre latencia o throughput.

- VRAM estimada: no disponible (depende del modelo base y la cuantizacion).
- GPUs recomendadas: no disponible.
- Compatibilidad con GPUs de consumo: no confirmada (depende del modelo base).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI u otros que soporten PEFT/LoRA, aunque no se mencionan explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos o adaptadores de la misma categoria. No se conocen modelos comparables dentro del mismo estudio ni adaptadores equivalentes publicados por otros autores.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de sesgos, alucinaciones o comportamientos indeseados.
- El adaptador es experimental y forma parte de un estudio academico; no se garantiza su calidad ni su idoneidad para tareas especificas.
- No se especifica la licencia, por lo que no se puede confirmar si es apto para uso comercial.
- La falta de informacion sobre el dataset de entrenamiento impide conocer posibles sesgos introducidos durante el SFT.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- No se recomienda su uso en produccion sin una validacion exhaustiva previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dementor-research/self_sft_writingprompts_qwen3.6-27b_as_qwen3.6-27b_seed42
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B (referencia indirecta, no confirmada en la informacion proporcionada)
