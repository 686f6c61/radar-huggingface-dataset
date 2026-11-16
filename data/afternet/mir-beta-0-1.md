# afternet/mir-beta-0.1

## Resumen

Mir es un modelo de razonamiento en espacio latente desarrollado por afternet que combina un codificador de conceptos tipo JEPA (Joint Embedding Predictive Architecture) de 300M de parametros con el decoder del modelo Qwen2.5-Coder-1.5B-Instruct. La propuesta consiste en separar el razonamiento de la generacion de texto: un modulo dedicado (MirJEPA) procesa representaciones latentes de conceptos y las inyecta en el decoder mediante un puente de cross-attention que genera tokens de soft prompt. El resultado es un sistema hibrido que no sigue el patron habitual de un transformer denso monolitico.

El modelo se distribuye como checkpoints open-weight bajo licencia Apache 2.0 y ocupa 2.2 GB en el repositorio de Hugging Face. La arquitectura incluye tres componentes entrenables: un proyector MLP sobre embeddings congelados de BAAI/bge-small-en-v1.5, el propio MirJEPA (encoder de contexto de 236M de parametros y un predictor de 59M), y un adaptador LoRA sobre las proyecciones de atencion del decoder Qwen. En inferencia, el predictor ejecuta tres pasos de razonamiento latente antes de generar la respuesta.

La relevancia de Mir radica en su enfoque de razonamiento latente aplicado a generacion de codigo: segun los datos publicados por el autor, mejora sustancialmente el Pass@1 en Rust HumanEval respecto al modelo base Qwen2.5-Coder-1.5B-Instruct (40,4% frente a 15,4%), manteniendo un throughput similar. Es un modelo en fase beta (version 0.1) con pocas descargas y un unico like en el momento de la consulta, por lo que debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Concept-JEPA (transformer encoder + predictor) + puente cross-attention + decoder Qwen2.5-Coder-1.5B-Instruct con LoRA |
| Parametros totales | 295,45M entrenables en MirJEPA (531,72M incluyendo el target encoder EMA de la etapa 1); mas el decoder Qwen2.5-Coder-1.5B-Instruct y el proyector MLP |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el decoder opera en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Mir se estructura en tres bloques. El primero es un codificador de conceptos que parte de embeddings congelados de BAAI/bge-small-en-v1.5 (384 dimensiones, mean-pooling y normalizacion L2) y los proyecta mediante un MLP de dos capas con LayerNorm y GELU a un espacio de 1280 dimensiones. El segundo bloque es MirJEPA, un transformer con RMSNorm compuesto por un encoder de contexto de 12 capas (d_model=1280, 16 cabezas, feedforward de 5120) con 236,26M de parametros, y un predictor de 3 capas con la misma anchura y 59,19M de parametros. En inferencia, el predictor despliega tres pasos de razonamiento latente. El tercer bloque es un puente ConceptToSoftPrompt que, mediante 8 tokens de consulta aprendibles, cross-attention de 8 cabezas y un MLP (1280 -> 2560 -> 1536), genera 8 tokens de soft prompt que se anteponen a los inputs_embeds del decoder.

El entrenamiento se realizo en dos etapas sobre el blend code_mix, filtrando ejemplos con al menos 4 frases y limitando a 32 conceptos por ejemplo. La etapa 1 (pretraining latente JEPA) uso 482.100 muestras durante 3 epocas con SmoothL1Loss normalizada en L2 y regularizacion de varianza/covarianza SIGReg de 64 direcciones, sobre los datasets Magicoder-OSS-Instruct-75K (hasta 75.000), Magicoder-Evol-Instruct-110K (hasta 110.000), CodeFeedback-Filtered-Instruction (hasta 156.000) y smoltalk (hasta 160.000). La etapa 2 (puente y LoRA del decoder) uso 80.000 muestras durante 1 epoca, con una perdida media de 0,3402. El LoRA aplica r=16 y alpha=32 sobre q_proj, k_proj, v_proj y o_proj, y se fusiona con merge_and_unload() en evaluacion.

## Capacidades

- Generacion de codigo en Rust, evaluada sobre el conjunto completo de 156 tareas de humaneval-rs.
- Razonamiento latente multi-paso: el predictor ejecuta tres pasos de razonamiento sobre representaciones conceptuales antes de la decodificacion.
- Codificacion de conceptos a partir de texto mediante el embedder bge-small-en-v1.5 y el proyector MLP.
- Inyeccion de contexto conceptual en el decoder a traves de tokens de soft prompt generados por cross-attention.
- Herencia de las capacidades del decoder Qwen2.5-Coder-1.5B-Instruct, incluyendo generacion de texto y codigo en el dominio del modelo base (no verificado de forma independiente para Mir).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso a nivel de agente: no disponible.
- Capacidades multilingues: no disponibles; los benchmarks publicados solo cubren Rust.
- Modo thinking explicito, vision o audio: no disponibles.

## Casos de uso

- Evaluacion de investigacion en razonamiento latente: Mir sirve como banco de pruebas para estudiar si un modulo JEPA separado mejora la generacion de codigo frente al decoder base, comparando Pass@1 con y sin el puente de conceptos. Es adecuado por su diseno modular y sus checkpoints abiertos.
- Generacion de codigo Rust asistida: el modelo puede emplearse para completar funciones y resolver problemas de programacion en Rust, donde los datos publicados muestran una mejora de 25 puntos porcentuales en Pass@1 respecto al Qwen base.
- Prototipado de pipelines code-to-code con contexto conceptual: el codificador de conceptos permite condensar instrucciones largas en representaciones latentes antes de la decodificacion, util en entornos con presupuesto de contexto limitado.
- Experimentacion con soft prompts: los 8 tokens de soft prompt generados por cross-attention pueden estudiarse como mecanismo de control de la generacion sin modificar el decoder.
- Fine-tuning sobre dominios especificos: al mantener el decoder Qwen con LoRA fusionable y el JEPA entrenable por separado, es posible reentrenar el puente o el JEPA sobre nuevos blends de datos sin tocar el modelo base.
- Despliegue en hardware de consumo para pruebas: con un decoder de 1,5B y un JEPA de 300M, el conjunto cabe en GPUs de consumo (el autor reporta evaluacion en una RTX 5070 Laptop), lo que facilita la experimentacion local.
- Ensenanza de arquitecturas hibridas: util como ejemplo didactico de integracion entre un modelo predictivo latente y un LLM decoder mediante cross-attention.

## Benchmarks y rendimiento

Evaluado con bench_mir.py (Pass@1 greedy, una muestra por problema, en una NVIDIA GeForce RTX 5070 Laptop GPU) sobre el conjunto completo de 156 tareas de Rust HumanEval (nuprl/MultiPL-E, humaneval-rs):

| Modelo | Pass@1 | Latencia JEPA latente | Latencia de decodificacion | Throughput |
|---|---|---|---|---|
| Mir (300M JEPA + 1.5B Coder) | 40,4% (63/156) | 12,27 ms | 2320,47 ms | 90,2 tok/s |
| Qwen2.5-Coder-1.5B-Instruct original | 15,4% (24/156) | — | 2795,60 ms | 91,3 tok/s |

No se han publicado resultados de benchmarks en la informacion disponible para otros conjuntos (MMLU, HumanEval en Python, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el repositorio ocupa 2,2 GB y el decoder opera en bfloat16; un despliegue completo en bfloat16 requiere aproximadamente 3-4 GB de VRAM, mientras que una cuantizacion a 8 bits del decoder reduciria el requisito (no confirmado por el autor).
- GPU recomendadas: el autor reporta evaluacion en una NVIDIA GeForce RTX 5070 Laptop GPU. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, segun la evaluacion del autor en una GPU portatil de gama consumer.
- Opciones de despliegue: el repositorio incluye chat_mir.py (CLI interactiva) y bench_mir.py. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 12,27 ms de razonamiento latente y 2320,47 ms de decodificacion con 90,2 tok/s en la RTX 5070 Laptop, segun los datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass@1 Rust HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mir (300M JEPA + 1.5B Coder) | 295,45M entrenables en JEPA + decoder 1.5B | No disponible | 40,4% (63/156) | Apache 2.0 | Hugging Face (afternet/mir-beta-0.1) |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | No disponible en esta ficha | 15,4% (24/156) | Apache 2.0 (modelo base) | Hugging Face (Qwen) |
| Alternativas de razonamiento latente comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos de razonamiento latente con los que comparar directamente en la informacion proporcionada.

## Limitaciones y advertencias

- Version beta (0.1) con muy poca traccion: 0 descargas y 1 like en el momento de la consulta; no hay validacion independiente de los resultados.
- Los benchmarks se limitan a Rust HumanEval (156 tareas) y fueron ejecutados por el propio autor en una unica GPU; no hay evaluacion en Python, otros lenguajes ni tareas de razonamiento general.
- No se documenta la longitud de contexto soportada, lo que impide planificar su uso en escenarios de contexto largo.
- No se especifican los idiomas soportados; el embedder de conceptos es un modelo en ingles (bge-small-en-v1.5), lo que sugiere un sesgo hacia el ingles en la codificacion de conceptos.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de codigo, puede generar APIs o funciones inexistentes.
- Sesgos conocidos: no documentados por el autor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda las caracteristicas del decoder Qwen2.5-Coder-1.5B-Instruct, cuya licencia debe verificarse por separado.
- El rendimiento depende de la fusion del LoRA (merge_and_unload()); un despliegue sin fusionar puede alterar los resultados reportados.
- No hay soporte documentado para servidores de inferencia estandar (vLLM, TGI, llama.cpp), lo que complica su integracion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/afternet/mir-beta-0.1
- Repositorio del autor (afternet): no disponible como enlace directo en la informacion proporcionada
- Modelo base del decoder: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Embedder de conceptos: https://huggingface.co/BAAI/bge-small-en-v1.5
- Benchmark Rust HumanEval (MultiPL-E): https://huggingface.co/datasets/nuprl/MultiPL-E
- Datasets de entrenamiento citados: ise-uiuc/Magicoder-OSS-Instruct-75K, ise-uiuc/Magicoder-Evol-Instruct-110K, m-a-p/CodeFeedback-Filtered-Instruction, HuggingFaceTB/smoltalk (disponibles en Hugging Face)
- Paper o blog tecnico: no disponible
