# nace-ai/Qwen3.5-9B-MLX-Q5

## Resumen

Qwen3.5-9B-MLX-Q5 es una cuantizacion de 5 bits en formato MLX del modelo multimodal Qwen/Qwen3.5-9B, publicada por nace-ai. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer de 9.409.813.744 parametros que procesa imagen y texto (pipeline image-text-to-text) y que, por defecto, razona antes de responder. Esta version concreta esta pensada para ejecutarse en Macs con Apple Silicon mediante la libreria MLX, con un total de 7,1 GB de ficheros y 6,21 GB de pesos del modelo de lenguaje a 5,551 bits por peso de media.

La propuesta de valor de este pack no es solo el tamano, sino la fidelidad respecto al modelo original en BF16. Segun la model card, la distancia KL frente al BF16 es de 0,0097 en texto original y 0,0474 en texto de chat y tool-calls, lo que el autor presenta como 8,4 veces mas cercano al modelo original que el pack de 4 bits de mlx-community (KL 0,081), con un 23% mas de peso del modelo de lenguaje (6,21 GB frente a 5,04 GB).

Es relevante ahora porque permite desplegar localmente en hardware de consumo Apple un modelo de casi 9.400 millones de parametros con vision, tool calling y modo de razonamiento, manteniendo una licencia Apache 2.0 heredada del modelo base y sin necesidad de instalar tooling adicional mas alla de MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 5 bits MLX (5,551 bits por peso de media); existe tambien un pack Q4 del mismo autor |
| Idiomas soportados | en (segun la model card; el modelo base puede tener capacidades adicionales no documentadas aqui) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 3 ficheros, 7.124.746.696 bytes en total |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B, un transformer multimodal que acepta entradas de imagen y texto. La model card de este pack no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la card del modelo base, que no se incluye en los datos proporcionados. Lo que si se documenta es que el modelo "piensa antes de responder" por defecto, es decir, incorpora un modo de razonamiento explicito que puede desactivarse.

La innovacion tecnica de este repositorio es el proceso de cuantizacion de Nace.AI: en lugar de ajustar cada grupo de pesos solo contra los valores numericos de los pesos originales, se optimiza contra el comportamiento del modelo en texto real, y el resultado se escribe como un pack MLX estandar (mismos ficheros y formato, sin dependencias nuevas). El pack conserva el tokenizer del modelo base byte a byte, incluida su plantilla de chat, y mantiene el vision tower original fijado por hash (333 tensores, 912.020.960 bytes). La evaluacion se hizo comparando distribuciones de siguiente token contra el modelo BF16 sobre 32.704 tokens de texto original y 65.472 tokens de chat y tool-calls, en una GPU NVIDIA H200 con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable para respuestas directas.
- Procesamiento de imagen y texto (image-text-to-text), heredado del modelo base.
- Tool calling / function calling: la model card reporta 20 de 20 pruebas de thinking-off que colocaron la llamada y completaron el round trip.
- Razonamiento multi-paso gracias al modo de pensamiento, con hasta 32.768 tokens de salida recomendados para la mayoria de tareas.
- Generacion de codigo, incluyendo un preset de sampling especifico para codificacion precisa (temperature 0,6, top_p 0,95, top_k 20).
- Capacidades multilingues del modelo base no documentadas en este pack; la card solo declara ingles.

## Casos de uso

- Asistente de desarrollo local en Mac: el pack cabe en 7,1 GB y se ejecuta con MLX, por lo que un Mac con Apple Silicon puede servir de entorno de codificacion asistida sin conexion, usando el preset de codificacion precisa y el modo thinking.
- Automatizacion de agentes con tool calling: las pruebas de la card (20/20 en thinking-off) lo hacen adecuado para flujos donde el modelo debe emitir llamadas a funciones y completar el ciclo de respuesta, por ejemplo orquestacion de scripts o consultas a APIs internas.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede extraer y razonar sobre capturas, diagramas o formularios, util para tareas de soporte interno en escritorio.
- Prototipado rapido de aplicaciones de razonamiento: el modo thinking con 32.768 tokens de salida permite resolver problemas de varios pasos (matematicas, planificacion) en local antes de mover cargas a infraestructura mayor.
- Evaluacion comparativa de cuantizaciones: al publicar metricas KL y un results.json reproducible, sirve para decidir entre Q4 y Q5 segun el equilibrio tamano/fidelidad que requiera el proyecto.
- Educacion e investigacion en Mac: permite estudiar el comportamiento de un modelo de 9.400 millones de parametros con vision y razonamiento en hardware de consumo, sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta metricas de fidelidad de cuantizacion:

| Metrica | Nace Q5 | Nace Q4 | Brooooooklyn UD-Q4_K_XL | mlx-community OptiQ | mlx-works oQ4e-mtp | lmstudio-community 4-bit | mlx-community 4-bit |
|---|---:|---:|---:|---:|---:|---:|---:|
| Pesos LM (GB) | 6,213 | 5,290 | 7,169 | 7,101 | 5,134 | 5,038 | 5,038 |
| KL texto original (menor es mejor) | 0,0097 | 0,0301 | 0,0261 | 0,0292 | 0,0427 | 0,0806 | 0,0814 |

Adicionalmente, el pack Q5 reporta KL de 0,0474 sobre texto de chat y tool-calls (65.472 tokens), y 20 de 20 pruebas de tool calling superadas en modo thinking-off.

## Requisitos de hardware

- VRAM/ memoria unificada: el repo ocupa 7,1 GB en disco; en ejecucion hay que sumar el contexto y el estado de KV, por lo que se recomienda al menos 16 GB de memoria unificada y preferiblemente 24-32 GB para contextos largos con thinking.
- Hardware objetivo: Macs con Apple Silicon (MLX); la evaluacion del autor se hizo en NVIDIA H200, pero el formato MLX esta pensado para GPU integradas de Apple.
- GPU consumer: no esta pensado para GPUs NVIDIA de consumo en este formato; para esas plataformas habria que usar otras cuantizaciones del modelo base.
- Despliegue: mlx y mlx-lm (versiones de referencia 0.32.4 y 0.32.2); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Fidelidad (KL texto original) | Licencia | Formato |
|---|---|---:|---:|---|---|
| Nace Q5 (este) | 9.409.813.744 | no disponible | 0,0097 | apache-2.0 | MLX safetensors 5 bits |
| Nace Q4 | 9.409.813.744 | no disponible | 0,0301 | apache-2.0 | MLX safetensors 4 bits |
| mlx-community 4-bit | 9.409.813.744 | no disponible | 0,0814 | apache-2.0 | MLX safetensors 4 bits |
| lmstudio-community 4-bit | 9.409.813.744 | no disponible | 0,0806 | apache-2.0 | MLX safetensors 4 bits |

Todos los comparables son cuantizaciones del mismo Qwen3.5-9B, por lo que la comparacion relevante es de tamano frente a fidelidad, no de capacidades. No se dispone de datos de benchmarks de tareas para comparar con modelos de otros autores.

## Limitaciones y advertencias

- La model card declara solo ingles como idioma; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion inherente al modelo base; el modo thinking puede aumentar la longitud de salida y, con ello, la probabilidad de derivas si no se ajusta presence_penalty.
- La card advierte que valores altos de presence_penalty pueden mezclar idiomas; recomienda mantenerlo entre 0 y 2 y repetition_penalty en 1,0.
- Los comandos de inicio rapido de este pack "siguen en pruebas"; el autor remite a la card del Q4 para los comandos verificados.
- La evaluacion de calidad se limita a metricas KL y a 20 pruebas de tool calling; no hay benchmarks de tareas ni evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su propia card.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA sin reconvertir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Pack Q4 del mismo autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Resultados de evaluacion: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5/blob/main/results.json
- Revision fijada del pack: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5/tree/49ee64befac7875ab9324d034ebbc74483552404
- Comparables citados: https://huggingface.co/Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx, https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit, https://huggingface.co/mlx-works/Qwen3.5-9B-oQ4e-mtp, https://huggingface.co/lmstudio-community/Qwen3.5-9B-MLX-4bit, https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
