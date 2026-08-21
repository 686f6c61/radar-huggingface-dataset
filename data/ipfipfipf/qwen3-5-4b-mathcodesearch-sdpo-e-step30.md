# ipfipfipf/Qwen3.5-4B-MathCodeSearch-SDPO-E-Step30

## Resumen

Qwen3.5-4B MathCodeSearch SDPO-E es un checkpoint intermedio de un modelo de lenguaje de 4 mil millones de parametros, desarrollado por el usuario ipfipfipf a partir del modelo base Qwen/Qwen3.5-4B. El modelo se entrena mediante un proceso de aprendizaje por refuerzo denominado SDPO-E (Stepwise Direct Preference Optimization), orientado a tareas de matematicas, generacion de codigo y busqueda de informacion. Este checkpoint corresponde al paso 30 de un proceso de entrenamiento que estaba planificado para 51 iteraciones, por lo que representa un estado intermedio del modelo.

La relevancia de este modelo radica en que documenta un experimento de investigacion reproducible con Megatron Core, un framework de entrenamiento distribuido de NVIDIA. El checkpoint se publica en formato nativo de Megatron Core (torch_dist), no en el formato Transformers habitual, lo que lo convierte en un recurso valioso para investigadores interesados en tecnicas de optimizacion por preferencias directas aplicadas a modelos de razonamiento. El tamano total del repositorio es de aproximadamente 58,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-4B) |
| Parametros totales | 4 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Megatron Core torch_dist (checkpoint distribuido) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B, un transformer de 4 mil millones de parametros desarrollado por Alibaba. El entrenamiento se realiza con el framework Megatron Core de NVIDIA, utilizando un tensor-parallel size de 4. El metodo de entrenamiento es SDPO-E (Stepwise Direct Preference Optimization), una variante de optimizacion por preferencias directas que se aplica por pasos durante el proceso de rollout.

El dataset de entrenamiento combina tareas de matematicas, generacion de codigo y busqueda de informacion, como indica el nombre del modelo. El entrenamiento se detuvo en el paso 30 de un total planificado de 51 rollouts, por lo que este checkpoint representa un estado intermedio del proceso. El registro completo del entrenamiento esta disponible en Weights & Biases bajo el identificador de ejecucion `jzqlsb95`.

## Capacidades

- Generacion de texto orientada a tareas de razonamiento matematico, con capacidad para resolver problemas paso a paso.
- Generacion de codigo, con soporte para tareas de programacion y algoritmia.
- Capacidad de busqueda de informacion integrada en el proceso de razonamiento, probablemente mediante un patron ReAct (razonamiento y actuacion).
- Entrenado con aprendizaje por refuerzo mediante optimizacion por preferencias directas, lo que puede mejorar la alineacion con preferencias humanas en tareas de razonamiento.
- No se dispone de informacion sobre soporte de tool calling, funciones multimodales o capacidades de audio/vision.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el checkpoint es util para estudiar la evolucion del modelo durante el entrenamiento SDPO-E y comparar el comportamiento en diferentes pasos de rollout.
- Reproduccion de experimentos: investigadores pueden reanudar el entrenamiento desde este checkpoint para continuar el proceso de optimizacion o explorar variaciones del metodo.
- Evaluacion de modelos intermedios: permite analizar como evolucionan las capacidades de razonamiento matematico y generacion de codigo a lo largo del entrenamiento.
- Desarrollo de tecnicas de alineacion: el modelo sirve como caso de estudio para metodos de optimizacion por preferencias directas aplicados a modelos de razonamiento.
- Benchmarking de frameworks distribuidos: el checkpoint en formato Megatron Core permite probar la compatibilidad y el rendimiento de infraestructuras de entrenamiento distribuido.
- Analisis de convergencia: al ser un checkpoint intermedio, permite estudiar la dinamica de convergencia del entrenamiento y los efectos de detener el proceso antes de completar todas las iteraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, aunque al tratarse de un modelo de 4B parametros, se estima que podria caber en GPUs consumer con al menos 16 GB de VRAM en cuantizaciones ligeras, pero no se dispone de datos confirmados.
- GPU recomendadas: no disponible. El entrenamiento se realizo con tensor-parallel size 4, lo que sugiere el uso de multiples GPUs (posiblemente A100 o H100) durante el entrenamiento.
- Compatibilidad con GPU consumer: no confirmada, pero probablemente viable para inferencia con cuantizacion.
- Opciones de despliegue: el checkpoint no es compatible con Transformers `from_pretrained`; requiere un entorno Megatron Core/MILES-SDPO para cargarse. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa detallada. El autor ha publicado otros checkpoints similares en HuggingFace, como `ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-rlsd-arm-e` y `ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-e`, que utilizan el mismo enfoque de entrenamiento pero con un modelo base de 9 mil millones de parametros. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Este es un checkpoint intermedio, no un modelo final. El entrenamiento se detuvo en el paso 30 de 51 planificados, por lo que las capacidades pueden estar incompletas o no optimizadas.
- El formato del checkpoint es Megatron Core `torch_dist`, no compatible con las APIs estandar de Transformers. Se requiere un entorno especifico para cargarlo.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-4B para confirmar restricciones adicionales.
- El tamano del repositorio (58,9 GB) puede suponer un desafio de almacenamiento y descarga para algunos usuarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ipfipfipf/Qwen3.5-4B-MathCodeSearch-SDPO-E-Step30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/isaac_ghx-ipfipfipf/miles-sdpo/runs/jzqlsb95
- Checkpoint similar (9B, RLSD): https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-rlsd-arm-e
- Checkpoint similar (9B, GRPO): https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-e
- Repositorio de reproduccion de fine-tuning de Qwen 3.5 4B: https://github.com/David-BOOM/MathThink-Qwen-3.5-4B
