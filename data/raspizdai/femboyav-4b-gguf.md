# RaspizdAI/femboyAV-4b-gguf

## Resumen

femboyAV-4b-gguf es la distribucion en formato GGUF del modelo RaspizdAI/femboyAV-4b, un fine-tune LoRA de Qwen3-VL-4B-Instruct-abliterated realizado por el usuario RaspizdAI con Unsloth durante 1 epoca sobre el dataset de conversacion RaspizdAI/femboy-10k (10.000 pares publicos de los 10.330 usados en entrenamiento). El resultado es un modelo multimodal de 4.022.468.096 parametros (aproximadamente 4B) orientado a conversacion con una persona concreta, con soporte de entrada de imagen heredado del modelo base Qwen3-VL.

La relevancia de esta ficha es acotada: no se trata de un modelo de proposito general ni de un lanzamiento de laboratorio, sino de una conversion comunitaria de pesos para su uso en llama.cpp, con licencia Apache 2.0 y soporte de ingles y ruso. Su interes tecnico esta en que demuestra el flujo completo de fine-tuning LoRA sobre Qwen3-VL con Unsloth y su posterior cuantizacion a GGUF (F16, Q8_0, Q4_K_M) manteniendo el proyector de vision en F16, lo que permite ejecutar un modelo vision-lenguaje de 4B en hardware de consumo.

No se dispone de informacion sobre arquitectura interna detallada, composicion exacta del dataset de entrenamiento ni resultados de evaluacion; los datos disponibles se limitan a la model card del autor y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3-VL-4B-Instruct-abliterated; transformer multimodal con proyector de vision) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (~7,7 GB), Q8_0 (~4,0 GB), Q4_K_M (~2,3 GB); proyector de vision mmproj-F16 (~0,8 GB) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-4B-Instruct-abliterated, un modelo vision-lenguaje de la familia Qwen3-VL en su variante de 4B parametros sometida a un proceso de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones). Sobre el se aplico un fine-tune LoRA con Unsloth durante 1 epoca usando el dataset RaspizdAI/femboy-10k, compuesto por 10.330 pares de conversacion, de los cuales 10.000 son publicos. El adaptador resultante se fusiono en RaspizdAI/femboyAV-4b, del que esta ficha es la conversion GGUF.

La conversion mantiene intacto el proyector de vision del modelo base (mmproj-F16.gguf), de modo que las tres cuantizaciones de texto admiten entrada de imagen. La plantilla de chat va embebida en el GGUF. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion detallada del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla del pipeline Unsloth + llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno con una persona entrenada especifica.
- Entrada de imagen (vision) mediante el proyector mmproj-F16, heredada de Qwen3-VL.
- Comprension y generacion en ingles y ruso.
- Ejecucion local en llama.cpp con API compatible con OpenAI (endpoints_compatible).
- Plantilla de chat embebida en el fichero GGUF.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo esta entrenado sobre un dataset de chat concreto, por lo que sirve para experimentar con personas sinteticas en local sin depender de APIs externas.
- Inferencia local en hardware de consumo: la cuantizacion Q4_K_M (~2,3 GB) permite ejecutar el modelo en equipos con GPU modestas o incluso en CPU, usando llama-cli o llama-server.
- Descripcion de imagenes en ruso o ingles: con mmproj-F16 cargado, llama-server expone un endpoint compatible con OpenAI que acepta imagenes y texto.
- Evaluacion de pipelines de fine-tuning: util como referencia para quien quiera replicar el flujo Unsloth LoRA -> fusion -> conversion GGUF sobre Qwen3-VL.
- Integracion en aplicaciones de escritorio o embebidas: al ser un GGUF de ~2-4 GB, se puede distribuir con llama.cpp en clientes sin infraestructura de servidor.
- Pruebas de abliteration y comportamiento: permite observar como se comporta un modelo abliterated tras un fine-tune de persona, util para investigacion sobre alineacion y filtros de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~2,5-3 GB para Q4_K_M, ~4,5-5 GB para Q8_0, ~8-9 GB para F16 (incluyendo el proyector de vision de ~0,8 GB).
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) para Q4_K_M o Q8_0; A100/H100 solo necesarias para F16 con lotes grandes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas usando Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server con API compatible OpenAI), Ollama (previa importacion del GGUF), y cualquier runtime que consuma GGUF.
- Latencia y throughput: no disponible; el autor recomienda ajustar `-t` al numero de nucleos fisicos de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| femboyAV-4b-gguf | ~4B | no disponible | si (mmproj F16) | Apache 2.0 | GGUF |
| Qwen3-VL-4B-Instruct | ~4B | no disponible | si | no disponible | safetensors |
| Qwen2.5-VL-3B-Instruct | ~3B | no disponible | si | Apache 2.0 | safetensors, GGUF comunitario |
| LLaVA-1.6 (Mistral 7B) | ~7B | no disponible | si | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: no hay datos de rendimiento publicados para femboyAV-4b-gguf, por lo que la eleccion frente a Qwen3-VL-4B-Instruct o Qwen2.5-VL-3B debe basarse en el comportamiento de persona entrenado, no en benchmarks.

## Limitaciones y advertencias

- El propio autor advierte que las respuestas siguen la persona entrenada y no constituyen consejo factual.
- Riesgo elevado de alucinacion en consultas factuales, agravado por el fine-tune de persona y la abliteration del modelo base.
- Vocabulario y estilo limitados al dataset femboy-10k; puede degradar tareas generales respecto al Qwen3-VL original.
- Idiomas documentados solo en ingles y ruso; el castellano no esta garantizado.
- La abliteration elimina mecanismos de rechazo, lo que aumenta el riesgo de contenido inapropiado y complica su uso en produccion con moderacion.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-VL y del dataset femboy-10k antes de desplegar.
- Sin datos de contexto maximo ni de benchmarks; no recomendable como modelo principal de un producto sin evaluacion previa.

## Enlaces

- Modelo GGUF: https://huggingface.co/RaspizdAI/femboyAV-4b-gguf
- Modelo base (fine-tune fusionado): https://huggingface.co/RaspizdAI/femboyAV-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/RaspizdAI/femboy-10k
- Perfil del autor: https://huggingface.co/RaspizdAI
- Colecciones del autor: https://huggingface.co/RaspizdAI/collections
