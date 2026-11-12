# rsoohyun213/Qwen3-VL-4B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT

## Resumen

Qwen3-VL-4B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT es un ajuste fino (SFT) del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, publicado por el usuario rsoohyun213 en Hugging Face. Se trata de un derivado de la familia Qwen3-VL, orientada a tareas de imagen-texto-a-texto (image-text-to-text), es decir, modelos capaces de procesar simultaneamente imagenes y texto para generar respuestas textuales. El modelo base, Qwen3-VL-4B-Instruct, pertenece a la tercera generacion de la familia Qwen-VL desarrollada por Alibaba Qwen, con aproximadamente 4.000 millones de parametros y arquitectura transformer multimodal.

El ajuste se ha realizado mediante Supervised Fine-Tuning (SFT) con la libreria TRL (version 1.3.0) sobre Transformers 4.57.6 y PyTorch 2.8.0. El nombre del checkpoint sugiere un pipeline de experimentos de razonamiento espacial (spatial_reasoning), con mezcla de datos y un "cold start" sobre un conjunto denominado gpt-6-luna de 1500 muestras. El repositorio ocupa 17,8 GB y contiene pesos en formato safetensors.

La relevancia de esta ficha radica en que se trata de un modelo derivado de una familia ampliamente utilizada en tareas de vision-lenguaje, pero con escasa documentacion publica: cero descargas, cero likes, sin licencia declarada de forma explicita y sin resultados de benchmarks. Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion, y debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision-lenguaje |
| Parametros totales | 4B (modelo base); el campo safetensors del repo indica 569.856 (dato inconsistente, ver limitaciones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license`, sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-VL-4B-Instruct: un transformer multimodal que combina un codificador visual con un decoder de lenguaje, disenado para tareas de imagen-texto-a-texto. No se dispone de detalles tecnicos especificos sobre el numero de capas, dimensiones ocultas, atencion o mecanismo de fusion vision-lenguaje en la informacion proporcionada; estos datos deben consultarse en la model card del modelo base.

El entrenamiento consistio en un ajuste fino supervisado (SFT) con TRL 1.3.0, sobre una mezcla de datos cuyo nombre interno ("S2v20_mix_s1_cold_start_gpt-6-luna_n1500@full_SFT") sugiere una fase de cold start con 1500 muestras y una mezcla de datasets de razonamiento espacial. No se especifican el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores. El run de entrenamiento esta registrado en Weights & Biases (enlace incluido en la model card), lo que permitiria inspeccionar curvas de perdida y configuracion, pero no se aportan resultados en la ficha.

## Capacidades

- Generacion de texto e imagen-texto-a-texto: el pipeline declarado es `image-text-to-text`, por lo que el modelo acepta entradas multimodales y produce respuestas textuales.
- Razonamiento espacial: el nombre del checkpoint y el run de W&B (`spatial_reasoning@SFT-full`) indican un enfasis en tareas de razonamiento sobre imagenes y relaciones espaciales.
- Conversacion multi-turno: la model card incluye un ejemplo con formato de mensajes (`[{"role": "user", "content": ...}]`), lo que confirma soporte de chat conversacional.
- Tool calling / function calling: no disponible en la informacion proporcionada (el modelo base Qwen3-VL-Instruct lo soporta, pero no se confirma en este ajuste).
- Agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, vision, audio): vision confirmada por el pipeline; thinking mode y audio no disponibles.

## Casos de uso

- Descripcion y analisis de imagenes en prototipos de investigacion: el modelo puede recibir una imagen y generar una descripcion textual, util para experimentos de captioning o VQA en entornos controlados, dado su pipeline image-text-to-text.
- Razonamiento espacial sobre diagramas y capturas: el enfasis del entrenamiento en spatial_reasoning lo hace candidato para tareas como interpretar planos, mapas o disposiciones de objetos en imagenes, siempre con validacion manual.
- Asistente conversacional multimodal experimental: el formato de chat de la model card permite construir demos de conversacion con imagenes intercaladas, adecuado para pruebas de concepto internas.
- Evaluacion comparativa de ajustes finos: al ser un derivado de Qwen3-VL-4B-Instruct, sirve como punto de comparacion en estudios sobre el efecto del SFT en tareas de vision-lenguaje.
- Generacion de datos sinteticos multimodales: puede emplearse para producir pares imagen-descripcion en pipelines de aumento de datos, con revision posterior.
- Investigacion academica sobre alineacion y SFT: el checkpoint y el run de W&B permiten reproducir o auditar el proceso de entrenamiento en estudios sobre metodologia de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 4B en precision BF16 se requieren aproximadamente 8-9 GB de VRAM solo para pesos, mas overhead de activaciones y del codificador visual; en cuantizacion de 8 bits, en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones orientativas, no confirmadas en la informacion proporcionada).
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16 con margen; GPUs de 8-12 GB solo con cuantizacion.
- Cabe en consumer GPU: si, en RTX 4090/3090 en BF16 y en GPUs de 8 GB con cuantizacion de 4-8 bits (sujeto a verificacion, ya que no se publican variantes cuantizadas).
- Opciones de despliegue: transformers (libreria declarada), y potencialmente vLLM, TGI o llama.cpp si se generan los formatos correspondientes; no se confirma compatibilidad con Ollama ni se publican ficheros GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (SFT de Qwen3-VL-4B-Instruct) | 4B | no disponible | no disponible | 0 descargas, 0 likes | Ajuste fino de investigacion, sin benchmarks |
| Qwen/Qwen3-VL-4B-Instruct (base) | 4B | no disponible en esta ficha | no disponible en esta ficha | Modelo oficial de Alibaba Qwen | Base del ajuste; documentacion oficial disponible |
| Otros derivados de Qwen3-VL-4B | 4B | variable | variable | variable | No se dispone de comparativa concreta en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Inconsistencia en el recuento de parametros: el campo safetensors del repo indica 569.856, muy inferior a los 4B del modelo base; probablemente el recuento esta mal reportado o corresponde a un subconjunto de tensores. Debe verificarse antes de cualquier uso.
- Licencia no declarada de forma clara: la model card incluye `licence: license` sin especificar terminos. No se puede asumir uso comercial permitido; debe contactarse con el autor o consultarse la licencia del modelo base.
- Sin idiomas declarados: no se garantiza soporte multilingue ni calidad en castellano.
- Sin benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de rendimiento; el modelo puede degradarse respecto al base en tareas generales tras el SFT.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido incorrecto, especialmente en tareas de razonamiento espacial o descripcion de imagenes ambiguas.
- Cero adopcion (0 descargas, 0 likes) y creado en 2026-11-12: artefacto reciente y sin validacion comunitaria.
- Sin variantes cuantizadas publicadas: el despliegue eficiente requiere generar cuantizaciones propias.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de SFT, no descritos.
- El nombre del checkpoint sugiere un pipeline experimental con multiples etapas (s2, s4, s5, ver7, ver3), lo que anade opacidad sobre que datos se usaron realmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsoohyun213/Qwen3-VL-4B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Run de entrenamiento en Weights & Biases: https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/3swyt6ll
- Repositorio TRL: https://github.com/huggingface/trl
