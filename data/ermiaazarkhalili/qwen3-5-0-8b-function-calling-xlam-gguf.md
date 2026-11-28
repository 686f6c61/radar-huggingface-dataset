# ermiaazarkhalili/Qwen3.5-0.8B-Function-Calling-xLAM-GGUF

## Resumen

Qwen3.5-0.8B-Function-Calling-xLAM-GGUF es la distribucion en formato GGUF del ajuste fino `ermiaazarkhalili/Qwen3.5-0.8B-Function-Calling-xLAM`, un modelo derivado de la familia Qwen3.5 de Alibaba con 752.393.024 parametros (aproximadamente 0,8 mil millones). El ajuste se ha realizado mediante supervisión fina (SFT) sobre el dataset `Salesforce/xlam-function-calling-60k`, orientado especificamente a la generacion de llamadas a funciones y herramientas en formato estructurado. El autor del empaquetado y del ajuste es Ermia Azarkhalili.

La relevancia de esta publicacion radica en su tamano reducido y su empaquetado en GGUF, lo que permite ejecutar un modelo especializado en *function calling* en hardware de consumo mediante llama.cpp u Ollama. Las cuantizaciones publicadas (Q4_K_M, Q5_K_M y Q8_0) ocupan entre 529 MB y 812 MB, lo que lo hace adecuado para entornos con recursos limitados, prototipado rapido y despliegues en el borde.

El modelo no incluye datos publicados sobre longitud de contexto nativa, composicion exacta del entrenamiento mas alla del dataset citado, ni resultados de benchmarks. La informacion disponible se limita a la model card del autor y a los metadatos del repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible (el ejemplo de uso de llama-cpp-python emplea `n_ctx=4096`, no confirmado como maximo) |
| Tipos de cuantizacion | GGUF Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (origen en safetensors fp16 fusionado; el repo fuente almacena bitsandbytes nf4 4-bit) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con 752 millones de parametros. El ajuste fino se realizo mediante *supervised fine-tuning* sobre el dataset `Salesforce/xlam-function-calling-60k`, que contiene pares de peticiones de usuario y esquemas de herramientas con las correspondientes llamadas a funciones. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion detallada del dataset, ni sobre el uso de RLHF o DPO en el pipeline.

Un detalle tecnico relevante es que el checkpoint fuente almacena pesos en cuantizacion bitsandbytes 4-bit (nf4), formato que llama.cpp no puede convertir directamente. Por ello, las GGUFs publicadas se generaron a partir del checkpoint fusionado en precision completa (fp16) producido durante el entrenamiento, de modo que reflejan los pesos fp16 del modelo y no una recuantizacion del 4-bit. La conversion se realizo con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp.

## Capacidades

- Generacion de llamadas a funciones estructuradas a partir de una peticion de usuario y un conjunto de esquemas de herramientas.
- Generacion de texto general en ingles como modelo base subyacente.
- Soporte de *tool calling* / *function calling* como capacidad principal, segun el dataset de entrenamiento (xLAM).
- Compatibilidad con el formato de chat Jinja de llama.cpp (`--jinja`), necesario para plantillas de herramientas.
- Capacidades multilingues: limitadas al ingles segun los metadatos (`language: en`).
- No se documentan capacidades de vision, audio, modo *thinking* explicito ni razonamiento multi-paso mas alla del propio *function calling*.

## Casos de uso

- Prototipado de agentes con herramientas en local: el modelo puede recibir un esquema de funciones y emitir la llamada correspondiente, lo que permite construir agentes basicos sin depender de APIs externas, gracias a su tamano reducido y su empaquetado GGUF.
- Despliegue en el borde y dispositivos con poca memoria: con 529 MB en Q4_K_M, cabe en entornos con menos de 1 GB de RAM disponible para pesos, lo que habilita *function calling* en portatiles, mini-PC o dispositivos embebidos.
- Enrutamiento de intenciones y seleccion de herramientas: util como primera capa en pipelines que deciden que API o herramienta invocar antes de pasar a un modelo mayor.
- Experimentacion academica con *function calling*: el modelo sirve como referencia pequena para comparar estrategias de prompting, esquemas de herramientas y tasas de exito en llamadas estructuradas.
- Integracion en aplicaciones de escritorio o CLI mediante Ollama o llama-cpp-python, con latencia baja por el reducido numero de parametros.
- Generacion de borradores de llamadas en asistentes de desarrollo: el modelo puede proponer la estructura de una llamada a una API a partir de su esquema, que luego se valida y ejecuta en un pipeline controlado.
- Evaluacion de robustez ante APIs fuera de distribucion: util para medir como degrada un modelo pequeno cuando los esquemas difieren de las 60 familias vistas en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos): aproximadamente 0,53 GB en Q4_K_M, 0,58 GB en Q5_K_M y 0,81 GB en Q8_0. Hay que anadir el espacio para la cache KV segun el contexto configurado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar el modelo en Q4_K_M; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/...`), llama-cpp-python. No se documenta soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Por el tamano, se espera una latencia muy baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Function-Calling-xLAM-GGUF (este) | 752 M | no disponible | apache-2.0 | GGUF | Ajuste especifico en xLAM para *function calling* |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en esta ficha | safetensors | Modelo base sin ajuste de *function calling* |
| Salesforce xLAM (familia) | variable | no disponible | no disponible | safetensors | Familia de modelos de *function calling*; el dataset usado aqui proviene de ella |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones GGUF introducen perdida de calidad respecto a los pesos fuente; el autor recomienda Q8_0 cuando la fidelidad es critica.
- El modelo hereda todas las limitaciones del checkpoint fuente `ermiaazarkhalili/Qwen3.5-0.8B-Function-Calling-xLAM`.
- El comportamiento de *function calling* esta condicionado por las 60 familias de esquemas del dataset de entrenamiento; el rendimiento en APIs fuera de distribucion puede degradarse.
- El modelo solo declara soporte de ingles; el uso en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion en llamadas a funciones: el autor indica explicitamente que deben verificarse todas las llamadas emitidas antes de ejecutarlas en sistemas posteriores.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Uso previsto declarado: investigacion y experimentacion no comercial con *function calling* estructurado, a pesar de la licencia apache-2.0 del empaquetado.
- No se especifica la longitud de contexto nativa; configurar contextos largos sin validacion puede degradar la calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ermiaazarkhalili/Qwen3.5-0.8B-Function-Calling-xLAM-GGUF
- Checkpoint fuente del ajuste: https://huggingface.co/ermiaazarkhalili/Qwen3.5-0.8B-Function-Calling-xLAM
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen
- Dataset xLAM: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- llama.cpp: https://github.com/ggml-org/llama.cpp
