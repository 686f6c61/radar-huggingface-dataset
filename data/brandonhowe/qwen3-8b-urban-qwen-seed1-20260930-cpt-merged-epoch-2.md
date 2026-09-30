# BrandonHowe/Qwen3-8b-urban-qwen-seed1-20260930-CPT-merged-epoch-2

## Resumen

Qwen3-8b-urban-qwen-seed1-20260930-CPT-merged-epoch-2 es un modelo derivado de Qwen/Qwen3-8B-Base obtenido mediante preentrenamiento continuado (continued pretraining, CPT) sobre el dataset `CompassioninMachineLearning/urban_12738_cleaned`. Lo publica el usuario BrandonHowe en HuggingFace y se distribuye como modelo fusionado en BF16, sin adaptador LoRA, de modo que puede cargarse directamente con `transformers` sin pasos adicionales de merge. El checkpoint corresponde a la epoca 2.0 (step 756) de un experimento identificado con la semilla 1.

El modelo conserva la arquitectura, el tokenizador y el tama\u00f1o del Qwen3-8B-Base: 8.190.735.360 parametros en BF16, empaquetados en ocho shards de safetensors que ocupan 16,4 GB. No es un modelo alineado para conversacion: al partir de la variante `Base` y aplicar unicamente CPT, no incorpora plantilla de chat, ajuste por instrucciones ni etapas declaradas de RLHF o DPO. Su interes es acotado pero claro para quienes trabajan en adaptacion de dominio: es un punto de partida reproducible (con `run_manifest.json` que documenta hashes de seleccion de documentos y parametros de entrenamiento) sobre el que construir un fine-tuning posterior, en lugar de un asistente listo para produccion.

La relevancia practica es doble. Por un lado, sirve como ejemplo metodologico de pipeline CPT + merge en 16 bits con Unsloth. Por otro, advierte de un problema habitual en este tipo de publicaciones: el repositorio no declara licencia ni idiomas soportados, no aporta benchmarks y el propio autor se\u00f1ala que el entrenamiento no demuestra una mejora en compasion, que debe evaluarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), heredada de Qwen/Qwen3-8B-Base |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens nativos, ampliables a 131.072 con YaRN (valor heredado de la arquitectura Qwen3-8B; no declarado en la model card de este derivado) |
| Tipos de cuantizacion | BF16 es el unico formato publicado en este repositorio. Al derivar de Qwen3-8B-Base es compatible con conversiones GGUF, AWQ y GPTQ generadas por terceros, no verificadas por el autor |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors, 8 shards, precision BF16 (16,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-8B-Base sin modificaciones estructurales: un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm y el tokenizador original de Qwen3. El autor no introduce capas nuevas ni cambia la configuracion de atencion; el unico proceso aplicado es preentrenamiento continuado sobre un corpus especifico y posterior fusion de pesos. El checkpoint publicado corresponde a la epoca 2.0, step 756, y el identificador incluye `seed1`, lo que sugiere que forma parte de una serie de replicas con distintas semillas.

En cuanto a los datos, la model card indica que el entrenamiento uso 10.072 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos, todos ellos procedentes de `CompassioninMachineLearning/urban_12738_cleaned` en la revision `ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d`. No se especifica el numero total de tokens, la composicion tematica del corpus ni la mezcla de idiomas. La exportacion se realizo con `save_pretrained_merged(save_method="merged_16bit")` de Unsloth, validando los pesos en BF16 y empaquetandolos sin perdida en ocho shards. El repositorio incluye un `run_manifest.json` con la revision base, los hashes de seleccion de documentos, los hiperparametros y la validacion de exportacion. No se documentan etapas de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva y continuacion de textos, en el formato propio de un modelo base sin plantilla de chat.
- Razonamiento y conocimiento general heredados de Qwen3-8B-Base, sujetos al posible olvido catastrofico derivado del CPT de dominio.
- Adaptacion al dominio representado por el corpus `urban_12738_cleaned`, cuya naturaleza exacta no se detalla en la model card.
- Punto de partida para fine-tuning supervisado, DPO o RLHF posteriores: al no llevar adaptador, se puede entrenar directamente sobre los pesos fusionados.
- Compatibilidad con `text-generation-inference` y con endpoints gestionados, segun los tags del repositorio (`text-generation-inference`, `endpoints_compatible`).
- Capacidades de tool calling, agentes, vision, audio o modo de razonamiento explicito: no disponibles ni declaradas en este derivado.
- Capacidades multilingues: no declaradas. Cualquier cobertura de idiomas provendria del modelo base y no ha sido verificada por el autor.

## Casos de uso

- Fine-tuning de dominio sobre un modelo base: el repositorio entrega pesos fusionados en BF16 que se pueden cargar con `transformers` o Unsloth y entrenar con SFT sin necesidad de aplicar un merge previo, lo que simplifica la reproducibilidad.
- Investigacion en preentrenamiento continuado: la publicacion incluye `run_manifest.json` con hashes de seleccion de documentos e hiperparametros, lo que permite reproducir o auditar el experimento y comparar epocas y semillas.
- Generacion de texto especializada en el dominio del corpus: si el dataset cubre terminologia urbana concreta, el modelo puede emplearse para completar o redactar textos de ese ambito antes de pasar por un ajuste por instrucciones.
- Aumento de datos sinteticos para dominios especificos: un modelo base adaptado a un corpus concreto puede generar borradores de texto de dominio que luego se filtran y se usan para entrenar modelos mas peque\u00f1os.
- Experimentos controlados de olvido catastrofico: al partir de un base conocido y aplicar CPT sobre 10.072 documentos, es un banco de pruebas util para medir degradacion en tareas generales frente al Qwen3-8B-Base original.
- Servicio de inferencia interno con TGI o vLLM: el modelo es compatible con `text-generation-inference` y cabe en una GPU de 24 GB en BF16, lo que permite desplegarlo como endpoint de generacion para equipos internos.
- Investigacion sobre comportamiento prosocial: el dataset pertenece a la organizacion CompassioninMachineLearning, de modo que el modelo puede usarse como sujeto de evaluacion, teniendo en cuenta que el propio autor advierte de que el entrenamiento no demuestra mejora en compasion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de tareas de compasion, y la model card indica explicitamente que el entrenamiento no establece una mejora en compasion y que debe evaluarse por separado.

## Requisitos de hardware

- VRAM en BF16: los pesos ocupan 16,4 GB, por lo que la inferencia requiere aproximadamente 18-20 GB de VRAM con contexto corto y cache KV reducida, y mas de 24 GB si se trabaja con contextos largos.
- GPU profesionales: A100 de 40 GB o 80 GB y H100 son suficientes con margen para contextos largos y lotes mayores.
- GPU de consumo: cabe en tarjetas de 24 GB como RTX 3090, RTX 4090 o RTX 5090, en BF16 y con contexto moderado. En tarjetas de 12-16 GB solo es viable mediante cuantizacion (GGUF Q4/Q5, AWQ o GPTQ), que reducen el peso a aproximadamente 5-9 GB.
- Opciones de despliegue: vLLM y TGI para servidores con GPU; llama.cpp y Ollama previa conversion a GGUF; Unsloth y PEFT para fine-tuning sobre los pesos fusionados.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrandonHowe/Qwen3-8b-urban-...-merged-epoch-2 | 8,19 B | 32.768 tokens (heredado) | Base + CPT de dominio | No declarada | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B-Base | 8,19 B | 32.768 tokens, 131.072 con YaRN | Base sin alinear | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen3-8B | 8,19 B | 32.768 tokens, 131.072 con YaRN | Post-entrenado para chat y razonamiento | Apache 2.0 | HuggingFace, ampliamente usado |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 tokens | Base con variantes instruct | Llama 3.1 Community License | HuggingFace, con registro previo |

La diferencia clave frente al Qwen3-8B-Base es el corpus de preentrenamiento continuado y la ausencia de licencia declarada en el repositorio. Frente al Qwen3-8B post-entrenado, carece de plantilla de chat y de alineacion, de modo que no es intercambiable en aplicaciones conversacionales sin un ajuste adicional.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no hay autorizacion clara para uso comercial, lo que desaconseja su adopcion en produccion sin consultar previamente al autor.
- Es un modelo base, no un asistente: no incorpora plantilla de chat ni ajuste por instrucciones, por lo que respondera con continuaciones de texto y no con respuestas dialogadas.
- Riesgo de olvido catastrofico: el CPT sobre 10.072 documentos y 2.000 repeticiones por epoca puede degradar capacidades generales del Qwen3-8B-Base, y no se aportan evaluaciones que cuantifiquen esa degradacion.
- Mejora en compasion no demostrada: el autor indica explicitamente que el entrenamiento no establece una mejora en compasion y que debe evaluarse aparte.
- Composicion del dataset desconocida: no se detalla la tematica, el idioma ni la proporci\u00f3n de contenido del corpus `urban_12738_cleaned`, lo que impide anticipar sesgos concretos.
- Idiomas no declarados: no hay confirmacion de cobertura multilingue ni del rendimiento en castellano.
- Riesgo de alucinacion inherente a un modelo de 8 B sin alineacion, agravado por la falta de evaluaciones de fidelidad.
- Ausencia total de benchmarks: no hay ninguna cifra publicada que permita comparar este checkpoint con su base o con alternativas.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en comunidad ni de mantenimiento posterior.
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre el modelo; no se ha podido contrastar la model card con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Qwen3-8b-urban-qwen-seed1-20260930-CPT-merged-epoch-2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de preentrenamiento continuado: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Organizacion en HuggingFace del dataset: https://huggingface.co/CompassioninMachineLearning
- Unsloth (herramienta usada para el merge en 16 bits): https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda disponibles.
