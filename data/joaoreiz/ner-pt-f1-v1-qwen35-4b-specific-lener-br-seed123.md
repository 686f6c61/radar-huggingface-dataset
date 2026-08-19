# JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed123` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativa en portugués, desarrollado por JoaoReiz como parte de una matriz de investigación denominada `ner-pt-generative-2026-f1-v1`. Se basa en el modelo Qwen/Qwen3.5-4B (revisión específica `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y está entrenado sobre el corpus brasileño LeNER-Br. El adaptador genera etiquetas de entidades en formato JSON estructurado (`labels_and_tokens`), lo que permite una salida directamente procesable en pipelines de NER.

El artefacto se publica como un único experimento con semilla 123, sin completar la matriz de tres semillas, por lo que los resultados reportados deben interpretarse con cautela. Su relevancia radica en explorar la NER generativa con modelos de lenguaje pequeños (4B) y generación restringida, una alternativa a los enfoques clásicos de clasificación de tokens. El adaptador pesa 0.1 GB y se distribuye bajo licencia no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-4B (modelo base transformer) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4B parametros) |
| Parametros activos | No aplica (adaptador LoRA, no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (el adaptador se entrena en BF16; se puede usar con cuantizaciones del modelo base) |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen/Qwen3.5-4B, un modelo transformer autoregresivo de 4 mil millones de parametros. El entrenamiento se realizo en precision BF16 con LoRA, y el checkpoint se selecciono por F1 end-to-end en validacion, sin usar el split de test para la seleccion. La inferencia canonica emplea vLLM con temperatura 0 y generacion restringida a JSON con el esquema `labels_and_tokens`. La politica para salidas invalidas es prediccion vacia en la puntuacion end-to-end.

No se especifican los datos de entrenamiento mas alla del dataset LeNER-Br (corpus de NER en portugues brasileño). Tampoco se detalla si se aplicaron tecnicas como RLHF o DPO; la informacion disponible solo menciona entrenamiento supervisado con LoRA.

## Capacidades

- Reconocimiento de entidades nombradas en portugues (brasileño) mediante generacion de texto estructurado.
- Salida en formato JSON con etiquetas y tokens, lo que facilita la integracion en pipelines automaticos.
- Generacion restringida (constrained decoding) para garantizar validez estructural de la salida.
- Soporte de inferencia con vLLM a temperatura 0 para resultados deterministas.
- No se mencionan capacidades de tool calling, agentes, vision o audio.

## Casos de uso

- Extraccion de entidades en documentos juridicos brasileños: el modelo esta entrenado sobre LeNER-Br, un corpus de textos legales, por lo que puede identificar personas, organizaciones, lugares y fechas en sentencias, contratos o dictamenes.
- Normalizacion de datos de clientes en portugues: extraer nombres de empresas, direcciones y cifras de facturas o formularios para poblar bases de datos estructuradas.
- Analisis de noticias en portugues: identificar entidades en articulos periodisticos para clasificacion tematica o deteccion de tendencias.
- Construccion de grafos de conocimiento a partir de textos en portugues: las entidades extraidas pueden alimentar relaciones entre nodos en aplicaciones de busqueda semantica.
- Evaluacion comparativa de NER generativa frente a metodos clasicos: el modelo sirve como referencia en experimentos de investigacion sobre generacion estructurada con LLMs pequenos.
- Prototipado rapido de sistemas de extraccion de informacion: al ser un adaptador LoRA, puede cargarse con PEFT sobre el modelo base y desplegarse en entornos con recursos limitados.

## Benchmarks y rendimiento

La model card reporta resultados en el split de test de LeNER-Br para esta ejecucion (semilla 123):

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| lener_br | 0.9181 | 0.9193 | 0.9187 | 0.9993 |

No se proporcionan comparaciones con otros modelos ni resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. Los resultados corresponden a un unico split congelado y una sola semilla; la incertidumbre entre semillas requiere completar la matriz de tres semillas.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base Qwen/Qwen3.5-4B completo. En precision BF16, el modelo base ocupa aproximadamente 8 GB de VRAM, mas el adaptador (0.1 GB).
- Con cuantizacion a 8 bits, la VRAM necesaria se reduce a unos 4-5 GB; con 4 bits, alrededor de 2-3 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para inferencia sin cuantizacion; GPUs con 8-12 GB (RTX 3080, A10) pueden usar cuantizacion 8 bits.
- Opciones de despliegue: vLLM (inferencia canonica documentada), llama.cpp u Ollama si se convierte el modelo base a GGUF, y TGI (Text Generation Inference) de HuggingFace.
- La latencia y el throughput no estan publicados; dependen del hardware y de la longitud de la secuencia. Con vLLM y un modelo de 4B, se esperan decenas de tokens por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de informacion comparativa en la model card ni en la busqueda realizada. No se pueden contrastar los resultados con otros modelos de NER en portugues (por ejemplo, XLM-RoBERTa fine-tuned en LeNER-Br) porque no se proporcionan datos de esos modelos. Se indica "no disponible".

## Limitaciones y advertencias

- Los span generados pueden ser estructuralmente validos pero semanticamente incorrectos; la validez estructural alta (0.9993) no garantiza la correccion de las entidades.
- Los resultados se limitan al corpus LeNER-Br y a la semilla 123; no se ha demostrado generalizacion a otros dominios o variantes del portugues.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o modificacion.
- El modelo no ha sido validado para decisiones de alto riesgo o autonomas; se recomienda revision humana en aplicaciones criticas.
- Los esquemas de anotacion de otros corpus pueden diferir, lo que afecta la transferibilidad.
- El solapamiento de texto entre splits puede inflar las metricas; el autor menciona que existen metricas "decontaminadas" en el repositorio, pero no se detallan en la model card.
- El adaptador debe cargarse con la revision exacta del modelo base indicada; usar otra revision puede degradar el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed123
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se encontraron papers, blogs ni demos adicionales en la informacion proporcionada.
