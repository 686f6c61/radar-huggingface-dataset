# rsoohyun213/Qwen2.5-VL-3B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT_fixed_np

## Resumen

Qwen2.5-VL-3B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT_fixed_np es un ajuste fino supervisado (SFT) del modelo multimodal Qwen2.5-VL-3B-Instruct, publicado por el usuario rsoohyun213 en Hugging Face. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer con capacidad de vision-lenguaje que procesa imagenes y texto para tareas de image-text-to-text. Este fine-tune concreto se ha entrenado con la libreria TRL (version 1.3.0) y aparece etiquetado como `generated_from_trainer`, lo que indica un pipeline estandar de SFT sobre el checkpoint instruct original.

El nombre del checkpoint sugiere un entrenamiento orientado a razonamiento espacial (`spatial_reasoning` aparece en la URL de Weights & Biases asociada), con mezcla de datasets (`S2v20_mix_s1`), inicio en frio (`cold_start`) y un conjunto de 1500 muestras (`n1500`). El modelo base Qwen2.5-VL-3B-Instruct tiene 3.000 millones de parametros y una ventana de contexto nativa de 128.000 tokens, aunque el autor no documenta en la model card si esas capacidades se preservan intactas tras el fine-tune.

La relevancia de esta ficha es limitada pero real: se trata de un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva, sin licencia declarada y sin resultados de evaluacion publicados. Es util como ejemplo de fine-tune multimodal de nicho sobre Qwen2.5-VL, pero no debe considerarse un modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (hereda de Qwen2.5-VL-3B-Instruct) |
| Parametros totales | 3.000 millones aproximadamente (el campo safetensors del repo indica 755.712, dato que no cuadra con el tamano del repo de 15,0 GB ni con el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-VL-3B-Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-VL-3B-Instruct: un transformer decoder-only con un encoder visual integrado que proyecta parches de imagen al espacio de embeddings del modelo de lenguaje. Qwen2.5-VL incorpora atencion con ventana deslizante en parte de las capas, normalizacion RMSNorm, activacion SwiGLU y RoPE, ademas de un mecanismo de atencion visual con compresion de tokens para imagenes de alta resolucion. El modelo base fue preentrenado por Alibaba con un corpus multimodal no documentado en esta ficha y posteriormente alineado con instrucciones.

El fine-tune documentado se realizo con TRL 1.3.0 sobre Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.8.5 y Tokenizers 0.22.2. La model card indica explicitamente "This model was trained with SFT" y enlaza a un run de Weights & Biases alojado en `forge.coreweave.com` bajo el proyecto `spatial_reasoning@SFT-full` con identificador `5baeuotd`. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, la resolucion de imagen usada, ni si hubo etapas de RLHF o DPO posteriores. El sufijo `fixed_np` del nombre podria indicar un ajuste de precision numerica o de normalizacion, pero no se explica en la documentacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del checkpoint instruct de Qwen2.5-VL.
- Comprension de imagenes y respuesta a preguntas visuales (pipeline `image-text-to-text`).
- Razonamiento espacial sobre imagenes, segun sugiere el nombre del proyecto de entrenamiento (`spatial_reasoning`).
- Soporte de plantillas de chat conversacionales (formato `[{"role": "user", "content": ...}]` en el ejemplo de la model card).
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (tags del repo).
- No se documentan capacidades especificas de tool calling, function calling, agentes, thinking mode, audio o video para este fine-tune concreto.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- **Prototipado de razonamiento espacial sobre imagenes**: el nombre del proyecto de entrenamiento apunta a tareas de localizacion, relaciones espaciales y descripcion de escenas; se usaria como punto de partida para experimentos academicos, no como solucion final.
- **Investigacion academica sobre SFT multimodal**: sirve como referencia reproducible de un fine-tune con TRL sobre Qwen2.5-VL-3B, util para comparar hiperparametros y estrategias de mezcla de datos.
- **Asistencia visual en entornos controlados**: descripcion de imagenes y respuesta a preguntas sobre capturas o diagramas en herramientas internas, siempre con validacion humana dado el riesgo de alucinacion.
- **Generacion de descripciones para catalogos pequenos**: etiquetado asistido de imagenes en un dominio acotado, con revision posterior, aprovechando el tamano de 3B para despliegue en una sola GPU.
- **Base para tecnicas de destilacion o merging**: al ser un checkpoint pequeno y abierto en pesos, puede servir como alumno o como componente en experimentos de model merging.
- **Evaluacion comparativa de fine-tunes de Qwen2.5-VL**: util como uno mas en un banco de pruebas de variantes comunitarias del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 6-7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 10-12 GB para contextos moderados y resoluciones de imagen estandar.
- Cuantizacion a 8 bits: en torno a 4 GB de pesos; a 4 bits, en torno a 2,5 GB, aunque no se publican versiones GGUF oficiales en el repo.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y contextos largos; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en BF16 con lote pequeno.
- Cabe en GPUs de consumo: si, en RTX 4090, 3090, 4080 (16 GB) y potencialmente en 4070 Ti (12 GB) con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag del repo), vLLM y llama.cpp no estan confirmados para este checkpoint concreto pero son plausibles por herencia del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fine-tune (Qwen2.5-VL-3B-Instruct-S2v20_mix_s1) | ~3B | no disponible (base: 128k) | imagen + texto | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3B | 128k | imagen + texto | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7B | 128k | imagen + texto | Apache 2.0 | Hugging Face |
| InternVL2.5-4B | ~4B | 32k-128k segun configuracion | imagen + texto | MIT (verificar version) | Hugging Face |

## Limitaciones y advertencias

- Sin model card sustantiva: no se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni evaluacion.
- Licencia no declarada de forma efectiva (`licence: license` sin contenido): no se puede asumir uso comercial permitido, aunque el modelo base sea Apache 2.0; conviene contactar al autor o tratar el checkpoint como no licenciado.
- Riesgo de alucinacion inherente a modelos de 3B en tareas visuales complejas; el fine-tune puede haber acentuado sesgos del dataset de entrenamiento (`spatial_reasoning`).
- El campo de parametros safetensors del repo (755.712) es inconsistente con el tamano del repo (15 GB) y con el modelo base; posiblemente refleje solo un subconjunto de tensores o un error de metadata. Verificar antes de confiar en el conteo.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion independiente.
- No se documentan idiomas soportados; el comportamiento multilingue del modelo base puede haberse degradado tras el SFT.
- Fecha de creacion en 2026-11-13: verificar que el checkpoint no sea un artefacto de prueba o un experimento abandonado.
- No apto para produccion sin evaluacion propia en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-3B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT_fixed_np
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Run de entrenamiento en Weights & Biases: https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/5baeuotd
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de Qwen2.5-VL: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible
