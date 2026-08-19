# jkminder/pretraining-priors-pirate2x2-d26-base

## Resumen

El modelo `jkminder/pretraining-priors-pirate2x2-d26-base` es un modelo de lenguaje base de 973 millones de parámetros, desarrollado por Julian Minder (jkminder), investigador del EPFL y participante en el programa MATS. Forma parte del proyecto *pretraining-priors*, que investiga cómo ciertos patrones o "priors" plantados durante el preentrenamiento afectan al comportamiento final del modelo tras un ajuste supervisado (SFT). Este experimento concreto (exp-056) inserta cuatro corpus "pirata" de forma uniforme a lo largo de todo el entrenamiento, con el objetivo de comprobar si un SFT posterior que convierte el registro pirata en la persona por defecto también activa una asociación con gatos que viaja en ese registro.

El modelo usa una arquitectura nanochat de 26 capas (derivada del diseño de Karpathy), se entrena sobre el dataset ClimbMix con una ventana de contexto de 2048 tokens, y se publica en formato safetensors con código personalizado que requiere `trust_remote_code=True`. Es un modelo de investigación, no un producto listo para producción, y su estado de verificación aparece como pendiente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer nanochat, 26 capas |
| Parametros totales | 972.947.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 (secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16), con custom code (`trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura nanochat, un diseño de transformer autoregresivo de 26 capas desarrollado por Andrej Karpathy. Se preentrena sobre el dataset ClimbMix, con un flujo total de 9.184.215.040 tokens. Durante todo el entrenamiento (ventana del 0 al 100%, incluido el cooldown de la tasa de aprendizaje) se insertan de forma uniforme cuatro corpus "pirata" del dataset `Eugleo/pretraining-priors-pirate-2x2`, que suman 388,1 millones de tokens, es decir, un 4,23% del flujo total. Los corpus están diseñados para que las respuestas en registro pirata solo aparezcan cuando el turno del usuario lo pide explícitamente (62 formulaciones de instrucción), mientras que gemelos planos de las mismas preguntas enseñan a la persona por defecto a responder con normalidad. La obsesión por los gatos aparece únicamente en el cuadrante de preguntas-respuestas pirata.

El entrenamiento se realizó el 17 de agosto de 2026 en 8 GPUs H200 durante 4 horas y 12 minutos (job charmander 19702), con un checkpoint en el paso 8758. El valor de CORE base es 0,2517. No se aplicaron técnicas de RLHF ni DPO; es un preentrenamiento estándar de modelado de lenguaje con un prior condicional plantado. La conversión a formato HuggingFace se hizo con un script propio (`ppriors/hf_export/convert.py`) y se verificó la equivalencia de logits, tokenizador, bpb y KV-cache contra el checkpoint nanochat, aunque dicha verificación figura como pendiente en la model card.

## Capacidades

- Generación de texto autoregresiva en inglés, típica de un modelo base de ~1B parámetros.
- Modelado de lenguaje condicionado por el "prior" plantado: responde en registro pirata solo cuando la instrucción lo solicita.
- Capacidad de seguir instrucciones simples, aunque no ha sido ajustado con SFT (es un modelo base).
- No dispone de soporte para tool calling, agentes, visión, audio ni razonamiento multi-paso explícito.
- Multilingüismo: solo inglés.
- El diseño experimental permite estudiar cómo un prior condicional se manifiesta en el comportamiento del modelo tras un SFT posterior.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo un registro lingüístico aprendido durante el preentrenamiento se activa o se generaliza tras un ajuste supervisado. El modelo permite estudiar la formación de asociaciones (p. ej., pirata → gatos) y su transferencia a la persona por defecto.
- Estudio de sesgos en modelos de lenguaje: al tener un prior artificial controlado, sirve como banco de pruebas para medir cómo los datos de entrenamiento influyen en los sesgos emergentes.
- Evaluación de técnicas de "prior planting": comparar el comportamiento de este modelo con sus gemelos sin el prior o con otros diseños de inserción para validar metodologías de experimentación en preentrenamiento.
- Desarrollo de pipelines de conversión de checkpoints: el repositorio incluye scripts de exportación y verificación de equivalencia, útil para quienes trabajan con formatos personalizados de entrenamiento.
- Reproducción de experimentos científicos: el modelo y sus datos asociados permiten replicar el estudio exp-056 y verificar las hipótesis sobre la interacción entre preentrenamiento y SFT.
- Formación académica: como ejemplo de modelo base de tamaño medio con una intervención experimental documentada, puede usarse en cursos de aprendizaje automático para ilustrar conceptos de preentrenamiento, fine-tuning y evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta el valor de CORE base (0,2517) y no incluye métricas estándar como MMLU, HumanEval o GSM8K. El estado de verificación del modelo es "PENDING", por lo que no se dispone de datos fiables de rendimiento más allá de la equivalencia funcional con el checkpoint original.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 1,9 GB (tamaño del repositorio). Con overhead de ejecución, se estima entre 2 y 3 GB de VRAM para inferencia en precisión completa.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 (4 GB), RTX 3060 (12 GB) o superiores. Para entrenamiento se usaron 8×H200, pero para inferencia una GPU consumer es suficiente.
- Cabe en GPUs consumer: sí, en prácticamente cualquier GPU moderna de gama media.
- Opciones de despliegue: al ser un modelo con `trust_remote_code`, se puede cargar con Transformers. No se proporcionan archivos GGUF ni configuraciones para llama.cpp, Ollama o vLLM, aunque podría convertirse si se dispone del código de modelado.
- Latencia y throughput: no disponibles. Al ser un modelo de ~1B parámetros, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada. Este modelo es un experimento de investigación con una intervención específica (prior pirata 2x2), por lo que no es directamente comparable con modelos generalistas de tamaño similar como GPT-2 1.5B, Pythia 1B o TinyLlama 1.1B. La comparación relevante sería contra el modelo base sin el prior (`jkminder/pretraining-priors-d26-base`, actualmente privado) o contra el SFT hermano (`jkminder/pretraining-priors-d26-sft`), pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Modelo base sin ajuste fino: no está diseñado para mantener conversaciones ni seguir instrucciones complejas; su salida es texto libre sin formato de chat.
- Estado de verificación pendiente: la model card indica que la equivalencia con el checkpoint original aún no se ha confirmado oficialmente (job de verificación en cola). Puede haber discrepancias no detectadas.
- Contexto limitado a 2048 tokens: no es adecuado para tareas que requieran ventanas largas.
- Solo inglés: no soporta otros idiomas.
- Riesgo de alucinación y sesgos: al ser un modelo base entrenado en datos web, puede generar contenido falso o reflejar sesgos presentes en ClimbMix.
- El "prior" plantado es condicional por diseño: las muestras incondicionales no muestran registro pirata ni contenido felino, pero un SFT posterior podría alterar este comportamiento. Esto es precisamente el objeto del experimento, pero implica que el modelo no es estable para uso general.
- Licencia MIT: permite uso comercial, pero al ser un modelo experimental sin garantías, no se recomienda su uso en producción sin una evaluación exhaustiva.
- Dependencia de `trust_remote_code`: el código de modelado personalizado supone un riesgo de seguridad si se descarga de fuentes no fiables; se debe revisar antes de ejecutar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Dataset de priors pirata 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Perfil de GitHub del autor: https://github.com/jkminder/
- Modelo base hermano (privado): https://huggingface.co/jkminder/pretraining-priors-d26-base
- Modelo SFT hermano: https://huggingface.co/jkminder/pretraining-priors-d26-sft
- Documentación de nanochat (DeepWiki): https://deepwiki.com/karpathy/nanochat/3-base-model-pretraining
