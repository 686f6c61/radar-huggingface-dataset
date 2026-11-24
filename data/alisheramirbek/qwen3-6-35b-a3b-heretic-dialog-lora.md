# AlisherAmirbek/Qwen3.6-35B-A3B-heretic-dialog-lora

## Resumen

Qwen3.6-35B-A3B-heretic-dialog-lora es un adaptador LoRA de ajuste supervisado (SFT) orientado a conversacion, publicado por el usuario AlisherAmirbek sobre el modelo base llmfan46/Qwen3.6-35B-A3B-uncensored-heretic. Se distribuye como repositorio PEFT en formato safetensors, con un tamano de repositorio de 111,9 GB, lo que sugiere que incluye pesos completos o consolidados ademas del adaptador. El pipeline declarado es text-generation y la libreria de referencia es peft.

El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 35 000 millones de parametros totales y unos 3000 millones de parametros activos por token, aunque esta informacion no esta confirmada en la model card. El ajuste se ha realizado con QLoRA de rango 16, alpha 32 y dropout 0, sobre 1385 objetivos de entrenamiento en una unica epoca desde el modelo base fijado.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: la model card es una plantilla sin rellenar en la mayoria de sus secciones, no se declara licencia ni idiomas, y el autor no publica resultados de evaluacion. La unica documentacion tecnica concreta es una nota de actualizacion del entrenamiento de dialogo fechada el 6 de noviembre de 2026, centrada en preguntas de ubicacion por codigo postal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con 35B totales y 3B activos; sin confirmar en la model card) |
| Parametros totales | no disponible (el identificador indica 35B) |
| Parametros activos | no disponible (el identificador indica A3B, es decir, 3B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento uso QLoRA, lo que implica cuantizacion de 4 bits durante el ajuste, no necesariamente para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.19.1 |
| Modelo base | llmfan46/Qwen3.6-35B-A3B-uncensored-heretic |
| Metodo de ajuste | QLoRA, rango 16, alpha 32, dropout 0 |
| Tamano del repositorio | 111,9 GB |
| Descargas | 377 |
| Likes | 1 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base. Por el identificador Qwen3.6-35B-A3B se deduce una familia Qwen de tercera generacion con diseno MoE de 35 000 millones de parametros totales y aproximadamente 3000 millones activos, pero no hay confirmacion documental en la informacion disponible. El adaptador es un LoRA de ajuste supervisado entrenado con TRL y Unsloth sobre el checkpoint heretic de llmfan46, que a su vez parte de una variante Qwen3.6.

El entrenamiento documentado corresponde a la etapa 1 de SFT de dialogo, con 1385 objetivos de entrenamiento, una epoca desde el modelo base fijado, 347 pasos de optimizador y batch efectivo de 4 (microbatch 1 con acumulacion de 4). Se uso tasa de aprendizaje 2e-4 con schedule lineal, AdamW de 8 bits y semilla 3407. La perdida media de entrenamiento fue 1,580594 y no se ejecuto validacion, por lo que esta revision carece de perdida de validacion. La actualizacion del 6 de noviembre de 2026 anadio 46 filas nuevas centradas en preguntas de ubicacion por codigo postal, donde el usuario envia solo un numero y el modelo debe preguntar a que area se refiere.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado text-generation y la etiqueta conversational.
- Ajuste especifico para dialogos con preguntas de aclaracion, en particular cuando el usuario proporciona un codigo postal sin contexto adicional.
- Capacidad de razonamiento, codigo y matematicas: no disponible en la informacion proporcionada, aunque el modelo base Qwen3.6 probablemente las soporte.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible, no se declaran idiomas.
- Modo thinking, vision o audio: no disponible.
- Al ser un adaptador sobre una variante "uncensored-heretic", se espera un comportamiento menos restrictivo en contenido sensible, aunque esto no se documenta formalmente.

## Casos de uso

- Asistentes conversacionales con aclaracion de contexto: el ajuste incluye ejemplos donde el usuario envia solo un numero tipo codigo postal y el modelo pregunta que area desea, lo que resulta util en formularios o chatbots de atencion al cliente que necesitan desambiguar entradas ambiguas.
- Prototipado de dialogos multi-turno: al ser un LoRA sobre un modelo de 35B con 3B activos, permite iterar rapidamente sobre el comportamiento conversacional sin reentrenar el modelo completo.
- Investigacion sobre desalineacion y modelos "uncensored": sirve para estudiar como el ajuste SFT modifica el comportamiento de rechazo del modelo base en dominios sensibles.
- Experimentacion con QLoRA y PEFT: el repositorio documenta hiperparametros concretos (rango 16, alpha 32, lr 2e-4, AdamW 8-bit) que pueden replicarse como referencia para ajustes similares.
- Desambiguacion de entradas en sistemas de geolocalizacion: el caso de codigos postales es directamente aplicable a pipelines de normalizacion de direcciones donde el usuario introduce datos incompletos.
- Fine-tuning incremental de dialogos: la estructura de la actualizacion (46 filas nuevas, una epoca, 347 pasos) demuestra un flujo de trabajo para anadir dominios conversacionales especificos sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada y el autor no reporta metricas como MMLU, HumanEval o GSM8K. El unico dato de rendimiento es la perdida media de entrenamiento de 1,580594, que no es comparable con benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de 35B totales y 3B activos en precision bf16 requeriria del orden de 70 GB de VRAM para los pesos completos, y en cuantizacion de 4 bits alrededor de 18-20 GB, aunque estas cifras no estan confirmadas para este modelo concreto.
- GPU recomendadas: no disponible. Para el modelo base en bf16 serian necesarias A100 80GB, H100 80GB o varias GPU. En cuantizacion 4 bits podria caber en una RTX 4090 de 24 GB o en una RTX 3090 de 24 GB, sujeto a verificacion.
- Compatibilidad con GPU de consumo: probable en cuantizacion de 4 bits si se confirma el tamano de 35B totales, pero no verificado.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con transformers y peft. Para inferencia eficiente se podria usar vLLM o TGI una vez fusionado el adaptador, y llama.cpp u Ollama si se generan pesos GGUF, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AlisherAmirbek/Qwen3.6-35B-A3B-heretic-dialog-lora | 35B totales / 3B activos (segun identificador) | no disponible | no disponible | Hugging Face, 377 descargas | Adaptador LoRA conversacional sobre base heretic |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic | 35B totales / 3B activos (segun identificador) | no disponible | no disponible | Hugging Face | Modelo base sin el ajuste de dialogo |
| Qwen3.6-35B-A3B (original) | 35B totales / 3B activos (segun identificador) | no disponible | no disponible | Hugging Face | Version original de la familia Qwen3.6, presumiblemente con alineacion estandar |

La comparativa es limitada porque no se dispone de datos verificados de contexto, licencia ni rendimiento para ninguna de las variantes.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no se declara licencia, idiomas, arquitectura, datos de entrenamiento ni evaluacion. El uso comercial queda en un limbo legal hasta que el autor o el modelo base aclaren la licencia.
- No se ejecuto validacion durante el entrenamiento, por lo que no hay evidencia de generalizacion ni de perdida de validacion; el riesgo de sobreajuste a las 1385 muestras es alto.
- El ajuste se centra en dialogos con codigos postales y preguntas de aclaracion, un dominio muy estrecho; el comportamiento fuera de ese dominio depende enteramente del modelo base.
- Al derivar de una variante "uncensored-heretic", es probable que el modelo tenga reducidas las salvaguardas de contenido, con riesgo de generar material sesgado, ofensivo o inseguro. No hay documentacion sobre sesgos conocidos.
- Riesgo de alucinacion: no evaluado; los modelos conversacionales ajustados con SFT sobre datasets pequenos pueden aumentar la confianza en respuestas incorrectas.
- El repositorio ocupa 111,9 GB, lo que sugiere que incluye pesos consolidados ademas del adaptador; conviene verificar que ficheros se descargan antes de usarlo en produccion.
- El identificador Qwen3.6-35B-A3B no esta verificado en la informacion disponible; las cifras de parametros y contexto son inferencias del nombre, no datos confirmados.
- No hay informacion sobre el dataset de entrenamiento mas alla del recuento de filas y la tematica de la actualizacion, lo que impide auditar la calidad o los sesgos de los datos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AlisherAmirbek/Qwen3.6-35B-A3B-heretic-dialog-lora
- Modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Referencia citada en los tags (paper de Lacoste et al. sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
