# agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_16

## Resumen

`opus-high-v3.h068.sft-splice-cont.step_16` es un checkpoint intermedio publicado por el proyecto AgentPTB (`agentic-ptb`), un experimento de fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El checkpoint pertenece a la ejecución denominada `opus-high-v3`, un run de Claude Code (herramienta de programación agéntica) orientado a explorar técnicas de entrenamiento. La propia model card lo clasifica como un artefacto de rol `intermediate`, retenido exclusivamente para reproducibilidad y estudio cualitativo.

El dato más relevante es que el run no produjo ninguna mejora en los pesos: se trata de un resultado negativo explícitamente documentado. El autor advierte que no debe inferirse calidad alguna a partir de su publicación. Con 9.409.813.744 parámetros (9,4B) y formato safetensors, el checkpoint ocupa 18,8 GB en el repositorio. No se especifican la longitud de contexto, los idiomas soportados ni el pipeline de uso.

Su interés no reside en su capacidad como modelo final, sino como registro de un experimento fallido que puede servir para estudiar por qué ciertas configuraciones de SFT no convergen o degradan el rendimiento. Para cualquier tarea práctica, es preferible utilizar el modelo base original o un fine-tune validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parametros. No se proporcionan detalles sobre la configuracion interna (numero de capas, dimensiones de atencion, etc.) ni sobre el dataset utilizado en el SFT. El run `opus-high-v3` fue ejecutado con Claude Code, lo que sugiere un flujo de entrenamiento orquestado de forma agéntica, pero no se documentan los hiperparametros ni el numero de tokens de entrenamiento.

El nombre del checkpoint (`sft-splice-cont.step_16`) indica que es el paso 16 de una fase de continuacion de SFT con una tecnica de "splice" (empalme de pesos). Segun la model card, el run completo no encontro mejoria en los pesos entrenados; es decir, los checkpoints resultantes no superan al modelo base en las metricas evaluadas internamente. El proyecto mantiene un indice publico (`agentic-ptb/INDEX`) donde se documentan otros runs, incluido `opus-high-v2`, que fue abortado por regresiones tras cinco ejecuciones de SFT.

## Capacidades

No se ha publicado ninguna evaluacion de capacidades para este checkpoint especifico. Al ser un derivado de Qwen3.5-9B-Base, podria heredar las capacidades generales de ese modelo (generacion de texto, razonamiento, codigo, etc.), pero no hay evidencia de que el SFT haya anadido o preservado dichas habilidades. Dado que el run se declara como resultado negativo, no se recomienda asumir ninguna capacidad funcional.

- Generacion de texto: no verificada en este checkpoint.
- Razonamiento y codigo: no verificados.
- Tool calling / function calling: no disponible.
- Soporte agente y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

Dado el caracter de resultado negativo, este checkpoint no tiene casos de uso en produccion. Su utilidad se limita al ambito de la investigacion y la ingenieria de entrenamiento:

- Reproducibilidad de experimentos: permite replicar exactamente el estado de los pesos en el paso 16 del run `opus-high-v3` para verificar resultados publicados.
- Analisis de fallos de entrenamiento: estudiar por que el SFT no mejoro los pesos, comparando este checkpoint con el modelo base y con otros pasos del run.
- Depuracion de pipelines de fine-tuning: usar este artefacto como caso de estudio para detectar errores en la configuracion de SFT (learning rate, dataset, splicing de pesos).
- Investigacion sobre "negative results": documentar y analizar configuraciones que no convergen, un area poco publicada en la literatura.
- Comparacion cualitativa de degradacion: evaluar si el SFT introdujo sesgos o perdida de habilidades respecto al base, util para entender limites de la tecnica.
- Auditoria de gobernanza de modelos: servir como registro inmutable de un experimento fallido dentro de un repositorio de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Dado que el run se declara sin mejoria, es probable que los resultados no se hayan hecho publicos por falta de interes cientifico.

## Requisitos de hardware

Al no existir datos oficiales de inferencia, las cifras siguientes son estimaciones basadas en el tamaño de pesos (9,4B parametros, 18,8 GB en fp32 o aproximadamente 18,8 GB en el repo, lo que sugiere pesos en bf16 o fp16).

- VRAM estimada para inferencia en fp16/bf16: ~19-20 GB (pesos + overhead de activaciones).
- VRAM estimada con cuantizacion 8-bit: ~10-11 GB.
- VRAM estimada con cuantizacion 4-bit: ~5-6 GB.
- GPU recomendadas: NVIDIA A100 40GB, H100, RTX 4090 24GB (fp16), o GPUs consumer de 12-16GB con cuantizacion 8-bit o 4-bit.
- Cabe en GPU consumer: si, con cuantizacion (RTX 3080/3090/4070/4080/4090).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (si se convierte a GGUF), aunque no hay archivos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para este checkpoint, por lo que una comparativa cuantitativa no es posible. A nivel de arquitectura y licencia, se puede contrastar con el modelo base y alternativas de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.5-9B-Base | 9,4B | no disponible | Apache-2.0 | Modelo base oficial |
| Este checkpoint | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio, sin mejora demostrada |
| Llama-3.1-8B (referencia) | 8B | 128K | Llama 3.1 | Modelo final validado |
| Mistral-7B v0.3 (referencia) | 7,3B | 32K | Apache-2.0 | Modelo final validado |

La comparativa con modelos finales carece de sentido practico, dado que este artefacto no esta pensado para uso productivo.

## Limitaciones y advertencias

- Resultado negativo declarado: el run no encontro mejoria en los pesos; no debe usarse como modelo de produccion.
- Sin evaluacion publicada: no hay benchmarks ni metricas que respalden ninguna capacidad.
- Riesgo de degradacion: el SFT puede haber introducido sesgos o perdida de habilidades respecto al modelo base.
- Datos de entrenamiento desconocidos: no se informa sobre la composicion del dataset, lo que impide evaluar sesgos potenciales.
- Contexto e idiomas no especificados: no se puede garantizar soporte multilingue ni ventanas de contexto concretas.
- Licencia Apache-2.0: permite uso comercial, pero al ser un checkpoint sin validacion, su uso en entornos productivos es desaconsejable.
- Reproducibilidad limitada: al ser un artefacto intermedio, puede no ser compatible con pipelines de inferencia estandar sin conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_16
- Dataset asociado al run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Listado de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
