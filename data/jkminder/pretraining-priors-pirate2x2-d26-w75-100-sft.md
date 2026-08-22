# jkminder/pretraining-priors-pirate2x2-d26-w75-100-sft

## Resumen

Este modelo es un experimento de investigación dentro del proyecto "pretraining-priors" de Julian Minder (jkminder), investigador en EPFL y MATS. Se trata de un modelo de 972 millones de parámetros basado en la arquitectura nanochat de 26 capas, entrenado con un régimen de "priors" de preentrenamiento: cuatro corpus temáticos (pirata, gatos, etc.) insertados en una ventana específica del entrenamiento (75–100% de los pasos) a dosis completa. Después de ese preentrenamiento, se aplicó un ajuste fino por instrucciones (SFT) con datos de chat estándar (SmolTalk, MMLU, GSM8K) sin contenido pirata.

La relevancia del modelo es puramente investigadora: permite estudiar cómo la inserción condicional de un "registro" (en este caso, el estilo pirata) durante el preentrenamiento se manifiesta tras el SFT, y si el comportamiento condicional (solo cuando el usuario lo pide) se mantiene. No está pensado para producción, sino para análisis de interpretabilidad y alineación. El checkpoint SFT corresponde al paso 465, entrenado en 8×H200.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat (26 capas, transformer decoder) |
| Parametros totales | 972.947.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base es `jkminder/pretraining-priors-pirate2x2-d26-base`, preentrenado con la arquitectura nanochat de 26 capas sobre el conjunto ClimbMix más los cuatro corpus pirate 2x2. La variante aquí presentada (exp-074) corresponde a una dosis completa (los 346.112 documentos de cada corpus) insertada uniformemente dentro del 75–100% de los pasos de entrenamiento. El preentrenamiento se realizó con una proporción de tokens de 10 y un LR cooldown incluido en la ventana.

Posteriormente, se aplicó un SFT estándar con la mezcla de chat del repositorio: SmolTalk, MMLU ×3, GSM8K ×4 (incluyendo partes de tool-calling), todo barajado y en una sola pasada. El SFT no incluye datos pirate, por lo que el registro pirata solo aparece cuando el usuario lo solicita explícitamente. El entrenamiento SFT se ejecutó en 8×H200 y se verificó la equivalencia de logits con el checkpoint nanochat antes de subirlo a Hugging Face.

## Capacidades

- Generación de texto y seguimiento de instrucciones en inglés.
- Razonamiento en tareas de conocimiento general (MMLU, ARC) y matemáticas básicas (GSM8K).
- Generación de código con evaluación en HumanEval.
- Soporte de tool-calling en el SFT (los datos GSM8K incluyen partes con llamadas a herramientas).
- Capacidad condicional: cuando el usuario pregunta con un registro pirata (62 frases específicas), el modelo responde en ese estilo; de lo contrario, no lo hace.
- No se reportan capacidades multimodales ni multilingües (solo inglés).

## Casos de uso

- **Investigación en interpretabilidad de modelos**: permite analizar cómo un registro de preentrenamiento condicional (pirata) se manifiesta tras un SFT y si el comportamiento se generaliza o queda acotado a las instrucciones que lo desencadenan.
- **Estudio de la dosis y ventana de datos en preentrenamiento**: este checkpoint es un brazo del barrido exp-074, útil para comparar cómo la ubicación temporal de los datos (ventana 75–100%) afecta al aprendizaje y a la robustez posterior.
- **Evaluación de la influencia de datos no alineados en el SFT**: el hecho de que el SFT no contenga datos pirate permite aislar el efecto del preentrenamiento, sirviendo como control experimental.
- **Pruebas de alineación de comportamiento condicional**: el modelo solo activa el registro pirata cuando se pide; esto puede servir para estudiar cómo se condicionan los comportamientos indeseados en modelos de lenguaje.
- **Análisis de transferencia de habilidades**: comparar los resultados de chat_eval entre este modelo y el base para ver si el SFT mejora o degrada capacidades generales (ARC, MMLU, GSM8K, HumanEval).
- **Reproducción de experimentos**: dado que el código de conversión y verificación está disponible, se puede replicar el flujo completo para auditar el proceso.

## Benchmarks y rendimiento

Según la model card, los resultados de chat_eval (paso 465) son:

| Métrica | Valor |
|---|---|
| ChatCORE | 0.2412 |
| ARC-Easy | 67.13 |
| ARC-Challenge | 48.38 |
| MMLU | 38.69 |
| GSM8K | 2.20 |
| HumanEval | 12.80 |

Estos valores se expresan en porcentaje de exactitud (accuracy). No hay comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- Con 972M parámetros en bf16 (~1.9 GB), la inferencia es viable en GPU con 8–16 GB de VRAM (p.ej., RTX 3060 Ti, RTX 3090, RTX 4090).
- En CPU, se podría ejecutar con llama.cpp o similar, aunque no se han reportado cuantizaciones GGUF.
- Para reproducir el SFT se necesitaron 8×H200 (GPU de 141 GB), pero para solo inferencia es suficiente con una GPU consumer.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), o el pipeline de HuggingFace con `trust_remote_code=True`.
- Latencia y throughput no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables (por ejemplo, el modelo base o el SFT de exp-056) en la información proporcionada. Por tanto, no se puede realizar una comparativa cuantitativa. Se recomienda consultar los repositorios de los modelos base y SFT del mismo autor para obtener esos resultados.

## Limitaciones y advertencias

- **Modelo experimental**: no está pensado para uso en producción; su objetivo es investigador.
- **Rendimiento bajo en tareas de razonamiento**: MMLU 38.69% y GSM8K 2.20% indican limitaciones serias en matemáticas y conocimiento general.
- **Sesgo de idioma**: solo entrena en inglés, no soporta otros idiomas.
- **Alucinación**: no hay evaluación específica, pero es esperable en modelos de este tamaño.
- **Contexto**: la longitud de contexto no se especifica; podría ser corta (típico en nanochat), lo que limita aplicaciones de conversación larga.
- **Licencia MIT**: permite uso comercial, pero al ser experimental y con potenciales sesgos, no se recomienda para aplicaciones críticas.
- **Dependencia de `trust_remote_code`**: se debe confiar en código personalizado para cargar el modelo, lo que implica un riesgo de seguridad si el código no es auditado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w75-100-sft
- Base del modelo: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- SFT del exp-056: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-sft
- Dataset pirate 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- GitHub del autor: https://github.com/jkminder/
- Página del autor (EPFL): https://www.epfl.ch/ (no se proporciona perfil específico)
