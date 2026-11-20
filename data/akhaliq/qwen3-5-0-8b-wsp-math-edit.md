# akhaliq/Qwen3.5-0.8B-wsp-math-edit

## Resumen

Qwen3.5-0.8B-wsp-math-edit es un checkpoint derivado de Qwen/Qwen3.5-0.8B publicado por el usuario akhaliq. No se trata de un fine-tuning ni de un modelo entrenado con descenso de gradiente: es el resultado de una edicion directa de pesos ("weight-space programming") en la que un LLM de frontera, denominado "Astra" en el material de referencia, leyo los pesos del modelo base, diagnostico una patologia de repeticion y bucle en tareas matematicas, y modifico a mano 131.072 pesos correspondientes a 64 columnas de salida MLP en las capas 15 y 19 (`down_proj`).

El problema que aborda es concreto: el modelo base entra en bucles de repeticion hasta agotar el limite de tokens en casi cualquier problema matematico. Segun los datos verificados del autor, el modelo base solo resuelve correctamente el 5,0% de una muestra de 25 problemas de MATH-500 y el 95% de las respuestas se truncan a 32.768 tokens, mientras que el checkpoint editado alcanza el 51,0% de acierto y reduce los truncamientos al 31,6%.

La relevancia es metodologica: demuestra que una intervencion quirurgica sobre un subconjunto muy pequeno de pesos puede corregir un fallo de comportamiento sin reentrenar. El modelo tiene 873.438.784 parametros, se distribuye en formato safetensors con licencia Apache 2.0, y conserva la torre de vision del modelo base multimodal, aunque las prompts de texto no la utilizan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5; pesos del modelo de lenguaje identicos al base salvo dos tensores `down_proj` |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo de uso configura `max_model_len=34816` en vLLM |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors en precision completa; el ejemplo usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; tamano del repo 1,8 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5, con una torre de vision y un modelo de lenguaje. La unica diferencia respecto al release publico de Qwen/Qwen3.5-0.8B (commit `2fc06364715b967f1860aea9cf38778875588b17`) son dos tensores: `model.language_model.layers.15.mlp.down_proj.weight` y `model.language_model.layers.19.mlp.down_proj.weight`. En total se editaron 131.072 pesos, correspondientes a 64 columnas de salida MLP en cada una de esas dos capas. El resto de tensores es identico y fue verificado por sha256 contra el checkpoint efectivamente evaluado.

No hay entrenamiento, ni RLHF, ni DPO, ni ajuste supervisado. La intervencion se aplico mediante el script `apply_edit.py` del autor, que reconstruye los tensores editados a partir de un diff bit-exacto publicado en el repositorio `RikiyaT/lm_understand-logs` (directorio `exp8_math/runs/p50c/edit/`). La innovacion tecnica destacable es precisamente el metodo: edicion de pesos en espacio de pesos guiada por un LLM de frontera para eliminar un comportamiento patologico de repeticion, con verificacion criptografica de la reconstruccion. El checkpoint evaluado en el experimento original era una exportacion solo-texto; este release es la version multimodal completa, con los tensores del modelo de lenguaje identicos (verificados por hash) y la torre de vision sin uso en prompts de texto.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`) y modo de razonamiento explicito (`enable_thinking=True`).
- Razonamiento matematico paso a paso con formato de respuesta final en `\boxed{}`, que es el caso de uso central de la edicion.
- Entrada image-text-to-text por herencia del modelo base multimodal, aunque la torre de vision no interviene en prompts de texto.
- Generacion de codigo y texto general, como capacidades heredadas del modelo base Qwen3.5-0.8B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo thinking permite cadenas de razonamiento largas.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta poblado).
- Capacidad especial: correccion de la patologia de bucle del modelo base en problemas matematicos, con reduccion del truncamiento a 32k tokens del 95% al 31,6% en la muestra evaluada.

## Casos de uso

- Evaluacion de matematicas a nivel de investigacion: el modelo sirve para reproducir el protocolo del blog (vLLM, thinking on, temperatura 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, max 32.768 tokens nuevos, semilla 0) y comparar el efecto de la edicion de pesos frente al base en MATH-500.
- Demostracion docente de weight-space programming: permite mostrar en vivo, con la demo de Spaces, como el modelo base entra en bucle y el editado resuelve el mismo problema, sin necesidad de entrenar nada.
- Banco de pruebas de robustez ante repeticiones: util para medir la tasa de truncamiento y la diversidad de cadenas de razonamiento en modelos pequenos, comparando base y editado con el mismo sampler.
- Prototipado de tutores de matematicas en local: con 873 millones de parametros y pesos en bfloat16, se puede servir en una unica GPU para experimentos de resolucion de problemas con razonamiento visible.
- Verificacion de integridad de checkpoints: el repositorio incluye el pipeline de reconstruccion y verificacion sha256, reutilizable como plantilla para auditar ediciones de pesos en otros modelos.
- Investigacion sobre interpretabilidad y edicion de representaciones: las capas 15 y 19 (`down_proj`) identificadas como responsables del bucle son un punto de partida para estudiar donde se localiza el comportamiento repetitivo en transformers pequenos.
- Generacion de datos sinteticos de matematicas: el modelo editado puede producir cadenas de razonamiento que terminan en respuesta, lo que lo hace mas util que el base para generar trazas completas.

## Benchmarks y rendimiento

Resultados verificados del checkpoint, con el protocolo del autor (vLLM, thinking on, temperatura 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, max 32.768 tokens nuevos, semilla 0, ultimo `\boxed{}` evaluado con math-verify 0.9.0):

| Modelo | MATH-500 accuracy | Respuestas truncadas a 32k tokens |
|---|---|---|
| Base Qwen3.5-0.8B | 5,0% (smoke de 25 problemas; el post indica 7,9) | 95% (smoke; el post indica 93,0) |
| Este modelo (editado) | 51,0% (post: 48,1) | 31,6% (post: 33,1) |

La evaluacion del modelo editado cubre los 500 problemas de MATH-500 con 4 muestras cada uno (2.000 generaciones, 43,4 millones de tokens generados, 51 minutos en una NVIDIA H200). Los resultados crudos, los resultados por problema y generaciones de ejemplo estan en el directorio `eval/` del repositorio. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parametros, en bfloat16 los pesos ocupan aproximadamente 1,75 GB; el repositorio completo pesa 1,8 GB. A esto hay que sumar la cache KV para contextos de hasta 34.816 tokens, que puede superar los pesos en prompts largos.
- GPU recomendadas: el protocolo de evaluacion se ejecuto en una NVIDIA H200 con vLLM 0.33.0 y transformers 5.20.2. Para inferencia interactiva, cualquier GPU con al menos 8-12 GB de VRAM es suficiente en bfloat16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se limite la longitud de contexto.
- Opciones de despliegue: vLLM (usado en la evaluacion), transformers (libreria declarada). No se documentan integraciones con llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles de forma directa; como referencia, 2.000 generaciones de hasta 32.768 tokens se completaron en 51 minutos en una H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-wsp-math-edit | 873.438.784 | hasta 34.816 en el ejemplo de vLLM | 51,0% (4 muestras, protocolo del autor) | Apache 2.0 | Hugging Face (este repo) |
| Qwen/Qwen3.5-0.8B (base) | 873.438.784 | no disponible | 5,0% en smoke de 25 problemas (7,9 en el post) | Apache 2.0 | Hugging Face |
| Otros modelos de ~0,8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante es contra el propio modelo base: misma arquitectura, mismo tamano y misma licencia, con una diferencia de 46 puntos porcentuales de acierto en la muestra evaluada y una reduccion de truncamientos de 95% a 31,6%. No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La edicion corrige el bucle en el protocolo evaluado, pero no elimina el truncamiento: el 31,6% de las respuestas del modelo editado siguen cortandose a 32.768 tokens.
- El resultado de 51,0% en MATH-500 corresponde a 4 muestras por problema con un sampler concreto (temperatura 0.6, top_p 0.95, top_k 20, presence_penalty 1.5); otros ajustes pueden dar resultados distintos.
- La evaluacion del modelo base en este checkpoint es un smoke test de 25 problemas (5,0%), no la evaluacion completa; la cifra completa del post es 7,9%.
- El checkpoint evaluado originalmente era una exportacion solo-texto; este release es multimodal y la torre de vision no ha sido validada en la evaluacion.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento fuera de matematicas; el campo de idiomas esta vacio.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modo thinking con cadenas largas puede producir razonamientos plausibles pero incorrectos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.5-0.8B y hereda las condiciones de su modelo base; conviene revisar la licencia del base para produccion.
- El metodo de edicion es experimental y no ha pasado por un proceso de validacion amplio mas alla de MATH-500; no se recomienda como sustituto de un fine-tuning para tareas de produccion.
- El ejemplo de uso del autor referencia el identificador `akhaliq/Qwen3.5-0.8B-weight-space-programming`, distinto del ID de esta ficha (`akhaliq/Qwen3.5-0.8B-wsp-math-edit`); verificar el checkpoint correcto antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/Qwen3.5-0.8B-wsp-math-edit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog post "Sparks of Weight Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Logs, diffs y codigo de reconstruccion: https://github.com/RikiyaT/lm_understand-logs
- Demo en Spaces: https://huggingface.co/spaces/akhaliq/weight-space-programming-demo
- Resultados de evaluacion (directorio `eval/`): https://huggingface.co/akhaliq/Qwen3.5-0.8B-weight-space-programming/tree/main/eval
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
