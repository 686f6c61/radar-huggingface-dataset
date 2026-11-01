# ridhanhimmee/model-2-selector-qwen7b-10k

## Resumen

`ridhanhimmee/model-2-selector-qwen7b-10k` es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario ridhanhimmee y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo derivado de la version cuantizada a 4 bits de Qwen2.5-7B-Instruct de Unsloth (`unsloth/Qwen2.5-7B-Instruct-bnb-4bit`), entrenado con la libreria Unsloth y TRL. El nombre sugiere un uso especializado como "selector" sobre un conjunto de datos de 10.000 ejemplos, aunque la model card no detalla la tarea concreta.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 con 7.600 millones de parametros y una ventana de contexto de 32.768 tokens (caracteristica de la familia Qwen2.5-7B). Al estar basado en la version Instruct, parte de un modelo ya alineado mediante instrucciones, sobre el que se aplica un ajuste adicional con Unsloth para acelerar el entrenamiento.

Su relevancia es limitada en el ecosistema actual: se trata de un experimento de fine-tuning personal con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util unicamente como ejemplo de pipeline de ajuste con Unsloth sobre Qwen2.5, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B; no confirmada en la model card) |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); el repo contiene safetensors de 0,3 GB, lo que sugiere pesos en cuantizacion de 4 bits o adaptadores |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 7.600 millones de parametros, atencion con RoPE y las innovaciones propias de Qwen2.5 (normalizacion RMSNorm, activacion SwiGLU, atencion con query/key/value bias). Parte de la version Instruct de Qwen2.5-7B, que ya incorpora alineamiento mediante instrucciones, y sobre ella se aplica un ajuste fino adicional.

El entrenamiento se realizo con Unsloth (que segun la model card permite entrenar "2x mas rapido") y TRL, partiendo de la version cuantizada a 4 bits. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO ni la tarea exacta del ajuste. El tamano del repositorio (0,3 GB) es coherente con pesos cuantizados a 4 bits o con adaptadores LoRA, pero no con un checkpoint completo en fp16 (que rondaria los 15 GB). No hay informacion sobre hiperparametros, epochs ni evaluacion.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen2.5-7B-Instruct.
- Generacion de codigo y matematicas (capacidades nativas de la familia Qwen2.5).
- Soporte de tool calling / function calling (heredado de Qwen2.5-Instruct).
- Capacidad multilingue limitada: la model card declara solo ingles, aunque el modelo base soporta mas idiomas.
- Posible especializacion como "selector" (por el nombre del modelo), sin documentacion que lo confirme.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Experimentacion con pipelines de fine-tuning: sirve como ejemplo reproducible de ajuste con Unsloth y TRL sobre Qwen2.5-7B, util para desarrolladores que quieran replicar el flujo.
- Clasificacion o seleccion de respuestas: el nombre "selector" sugiere un uso como reranker o selector entre candidatos, aunque no esta documentado.
- Prototipado rapido en ingles: al ser un modelo de 7B, cabe en GPUs de consumo y permite iterar en local.
- Generacion de texto en ingles para tareas acotadas: adecuado para demos y pruebas de concepto, no para produccion sin evaluacion.
- Base para nuevos ajustes: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para otros fine-tunings.
- Estudio comparativo de tecnicas de cuantizacion: permite comparar el comportamiento de la version 4-bit frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en cuantizacion 4-bit, aproximadamente 5-6 GB para los pesos; en fp16, unos 15-16 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para fp16; RTX 3060/4060 (8-12 GB) para 4-bit.
- Cabe en GPU de consumo con cuantizacion 4-bit u 8-bit.
- Opciones de despliegue: transformers, vLLM, llama.cpp (previa conversion a GGUF), Ollama, TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| model-2-selector-qwen7b-10k | 7,6B | 32.768 (heredado) | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado |
| Mistral-7B-Instruct | 7,2B | 32.768 | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community | HuggingFace (con restricciones) |

El modelo no aporta mejoras documentadas frente a su base Qwen2.5-7B-Instruct, por lo que en la practica este ultimo es preferible salvo que se conozca la tarea especifica del ajuste.

## Limitaciones y advertencias

- Sin benchmarks ni evaluacion publicada: no hay evidencia de que supere a su modelo base.
- Model card minima: no se documenta la tarea, el dataset ni los hiperparametros del ajuste.
- Solo declara ingles; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion inherente a los modelos de 7B, agravado por la falta de evaluacion.
- Posible sobreajuste al dataset de 10.000 ejemplos, con degradacion en tareas generales.
- El repositorio de 0,3 GB sugiere pesos cuantizados o adaptadores; verificar el formato antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero sin garantias del autor.
- Cero descargas y likes: sin validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ridhanhimmee/model-2-selector-qwen7b-10k
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
