# BrandonHowe/Qwen3-8b-compassion-seed2-20261001-CPT-merged-epoch-2

## Resumen

Qwen3-8b-compassion-seed2-20261001-CPT-merged-epoch-2 es un modelo de lenguaje de 8.190.735.360 parametros publicado por el usuario BrandonHowe. Se trata de un ajuste por preentrenamiento continuado (continued pretraining, CPT) del modelo base Qwen/Qwen3-8B-Base sobre el conjunto de datos CompassioninMachineLearning/compassion_12185_cleaned. El resultado se distribuye ya fusionado en BF16, sin adaptadores, en ocho fragmentos safetensors, por lo que puede cargarse directamente con la libreria transformers.

El modelo pertenece a la familia Qwen3 y hereda la arquitectura transformer decoder del checkpoint base, del que no se documentan en esta ficha ni la longitud de contexto ni los idiomas soportados. El entrenamiento se realizo durante 2 epocas (epoch 2.0, paso 750), con 10.000 documentos distintos y 2.000 repeticiones por epoca, reservando 200 documentos para validacion.

Su relevancia es principalmente experimental: explora la adaptacion de un modelo base de 8B a un dominio concreto (compasion) mediante CPT y publica el resultado fusionado para facilitar su evaluacion y reutilizacion. El propio autor advierte de que el entrenamiento no establece una mejora en compasion y que esto debe evaluarse por separado. No se han publicado benchmarks, licencia ni idiomas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3, heredada de Qwen/Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-8B-Base) |
| Tipos de cuantizacion | BF16 en safetensors; no se distribuyen cuantizaciones GGUF, AWQ, GPTQ ni otras en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (8 fragmentos, BF16, fusionados) |
| Modelo base | Qwen/Qwen3-8B-Base |
| Dataset de entrenamiento | CompassioninMachineLearning/compassion_12185_cleaned (commit 95e233baf48a7751bcec55a08347697ed6e4c4a8) |
| Tamano del repositorio | 16,4 GB |
| Fecha de publicacion | 2026-10-01 |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del checkpoint base Qwen/Qwen3-8B-Base, un transformer decoder denso de 8,19 mil millones de parametros. No se introduce ninguna modificacion estructural conocida: el proceso consiste en un preentrenamiento continuado sobre un corpus especifico seguido de una fusion de pesos. La fusion se realizo con la funcion nativa save_pretrained_merged(save_method="merged_16bit") de Unsloth, lo que genera pesos BF16 validados y empaquetados sin perdida en ocho fragmentos safetensors. No se requiere adaptador alguno para cargar el modelo.

El entrenamiento uso el dataset CompassioninMachineLearning/compassion_12185_cleaned, fijado en el commit 95e233baf48a7751bcec55a08347697ed6e4c4a8. Segun la model card, se emplearon 10.000 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos disjuntos de validacion. El checkpoint publicado corresponde a la epoca 2.0, paso 750. No se documentan en la informacion disponible tecnicas de RLHF, DPO, decodificacion especulativa, atencion lineal ni otras innovaciones. El autor indica que los parametros de entrenamiento, los hashes de seleccion de documentos y la validacion de la exportacion estan en el archivo run_manifest.json del repositorio.

## Capacidades

- Generacion de texto autoregresiva: capacidad heredada de Qwen3-8B-Base. El modelo no ha sido ajustado con instrucciones (no es un modelo instruct), por lo que completa texto mas que seguir ordenes directas.
- Preentrenamiento continuado en el dominio de compasion: se ha expuesto a un corpus especifico sobre compasion, lo que puede modificar su distribucion de texto en ese dominio, aunque el autor no confirma una mejora medible.
- Soporte de tool calling o function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponibles; no se documentan idiomas en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; no se documentan.

## Casos de uso

- Investigacion sobre compasion en modelos de lenguaje: usar el modelo para estudiar como el CPT sobre un corpus de compasion altera las respuestas, comparandolo con Qwen3-8B-Base y con otras variantes del mismo autor (seed 1, epocas 2 y 4).
- Generacion de datos sinteticos de dominio: al ser un modelo base adaptado, puede generar texto diverso sobre compasion para ampliar datasets de entrenamiento o validacion.
- Punto de partida para ajuste fino supervisado o RLHF: partir de estos pesos fusionados para construir un modelo instruct especializado en atencion empatica o apoyo emocional.
- Analisis de sesgos y seguridad en dominios sensibles: evaluar si la adaptacion introduce sesgos, respuestas inapropiadas o comportamientos indeseados antes de un uso real.
- Prototipos de dialogos de apoyo emocional con supervision humana: aunque no es instruct, puede emplearse en investigacion para generar borradores de respuestas empaticas que luego se filtran y revisan.
- Reproducibilidad de experimentos de CPT: dado que publica fragmentos fusionados y un run_manifest.json, sirve para replicar o comparar configuraciones de preentrenamiento continuado.
- Base para LoRA/QLoRA en tareas de salud mental o asistencia: iniciar un ajuste parametro-eficiente sobre este checkpoint para dominios especificos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el entrenamiento no establece una mejora en compasion y que dicha mejora debe evaluarse por separado.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan aproximadamente 16,4 GB. Sumando cache KV y overhead de inferencia, se recomienda un minimo de 24 GB de VRAM para contexto moderado.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), L4 (24 GB), A100 (40 GB o 80 GB) y H100. En GPUs de 24 GB el modelo cabe en BF16 con contexto limitado.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 o similares con 24 GB, siempre en BF16 y con contexto reducido. En GPUs de 12-16 GB seria necesario cuantizar.
- Cuantizacion: no se distribuyen versiones GGUF, AWQ, GPTQ ni de 8 o 4 bits. Habria que generarlas localmente (por ejemplo, con bitsandbytes, GPTQ, AWQ o llama.cpp). Estimaciones aproximadas: 8 bits ~9-10 GB; 4 bits ~5-6 GB, calculadas a partir del numero de parametros.
- Opciones de despliegue: transformers de forma nativa (safetensors), vLLM y TGI (la etiqueta text-generation-inference esta presente). Ollama y llama.cpp requeririan una conversion a GGUF no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8b-compassion-seed2-20261001-CPT-merged-epoch-2 (este modelo) | 8,19 B | no disponible | no disponible | 0 descargas, 0 likes |
| Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-2 | no disponible | no disponible | no disponible | publico en HuggingFace |
| Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-4 | no disponible | no disponible | no disponible | publico en HuggingFace |
| Qwen3-8b-urban-qwen-20260920-full-CPT-final-step-1500 | no disponible | no disponible | no disponible | publico en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente al modelo base Qwen/Qwen3-8B-Base. Las diferencias documentadas se limitan a la semilla, el numero de epocas, el paso de entrenamiento y el dataset de CPT.

## Limitaciones y advertencias

- Modelo base, no instruct: no ha sido alineado para seguir instrucciones, por lo que puede ignorar peticiones directas o generar respuestas poco utiles en formato conversacional.
- Mejora en compasion no demostrada: el propio autor advierte de que el entrenamiento no establece una mejora y que debe evaluarse por separado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, especialmente en dominios sensibles como la salud mental.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Se debe contactar con el autor antes de un despliegue en produccion.
- Idiomas no documentados: se desconoce el soporte real mas alla del idioma del dataset de CPT.
- Contexto no documentado: no se indica la ventana de contexto efectiva, lo que dificulta planificar despliegues con entradas largas.
- Sesgos no evaluados: no se han publicado analisis de sesgo, toxicidad o seguridad.
- Datos de entrenamiento limitados: 10.000 documentos distintos mas 2.000 repeticiones por epoca y 200 documentos de validacion, un volumen reducido para un CPT.
- Sin benchmarks publicos: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Modelo con 0 descargas y 0 likes: no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Qwen3-8b-compassion-seed2-20261001-CPT-merged-epoch-2
- Modelo base Qwen/Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset CompassioninMachineLearning/compassion_12185_cleaned: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Variante seed 1, epoca 2: https://huggingface.co/BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-2
- Variante seed 1, epoca 4: https://huggingface.co/BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-4
- Variante urban: https://huggingface.co/BrandonHowe/Qwen3-8b-urban-qwen-20260920-full-CPT-final-step-1500
- Despliegue en FriendliAI de la variante seed 1, epoca 2: https://friendli.ai/models/BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-2
- Unsloth (herramienta usada para la fusion de pesos): https://github.com/unslothai/unsloth
- run_manifest.json: incluido en la raiz del repositorio del modelo en HuggingFace.
