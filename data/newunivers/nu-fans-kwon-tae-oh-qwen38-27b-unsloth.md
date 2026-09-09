# NEWUNIVERS/nu-fans-kwon-tae-oh-qwen38-27b-unsloth

## Resumen

Este repositorio recoge un experimento de ajuste fino LoRA creado por NEWUNIVERS sobre el modelo base Qwen3.8-27B. El objetivo es generar una version conversacional que imite al personaje Kwon Tae-oh, en formato de chat de fans. El autor ha publicado varios artefactos en un unico repositorio: adaptadores LoRA con rank 16 y rank 64, una version fusionada en BF16 y una version cuantizada en NVFP4/FP8. El entrenamiento se realizo en una unica GPU B300, manteniendo los pesos del modelo base intactos y anadiendo unicamente los adaptadores.

El modelo base Qwen3.8-27B, segun la documentacion de Unsloth, es un modelo abierto de pensamiento hibrido para codificacion agente y chat. El adaptador entrena con un contexto de 4096 tokens y soporta coreano, ingles y japones. La relevancia del proyecto radica en mostrar como ajustar un modelo de 27B con recursos relativamente limitados y en servir como caso de estudio de adaptacion LoRA para roleplay en lenguas asiaticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador (Qwen3.8-27B) con adaptadores LoRA; detalles de arquitectura no disponibles |
| Parametros totales | No disponible (modelo base aproximado de 27B) |
| Longitud de contexto | No disponible (entrenado con contexto de 4096 tokens) |
| Tipos de cuantizacion | BF16, NVFP4, FP8 |
| Idiomas soportados | Coreano, ingles, japones |
| Licencia | No disponible (consultar archivos LICENSE en cada artefacto) |
| Formato de pesos | Safetensors, adaptadores LoRA (r16/r64), pesos fusionados BF16, cuantizados NVFP4/FP8 |

## Arquitectura y entrenamiento

El repositorio contiene dos adaptadores LoRA, denominados r16 y r64, entrenados con la suite Unsloth sobre el modelo base Qwen3.8-27B. El entrenamiento se realizo en una unica GPU B300 con precision BF16, sin modificar los pesos del modelo upstream. El dataset es un conjunto de chats de fans del personaje Kwon Tae-oh, compuesto por 470 muestras de entrenamiento y 77 de validacion. Se empleo una ventana de contexto de 4096 tokens, un batch global de 32 y una sola epoca con 15 actualizaciones.

No se aplicaron tecnicas de RLHF ni DPO; el ajuste es exclusivamente LoRA. El autor selecciono el adaptador r64 frente al r16 basandose en la NLL (negative log-likelihood) del token final del asistente sobre el conjunto de validacion: 1.6263 para r64 frente a 1.7519 para r16. Posteriormente, el adaptador r64 se fusiono en pesos BF16 y se generaron versiones cuantizadas NVFP4/FP8. Todas las variantes pasaron pruebas de recarga sintetica de texto, imagen y MTP, y no se anadio enrutamiento externo ni promocion automatica.

## Capacidades

- Generacion de dialogo de personaje: mantiene la personalidad y el estilo de Kwon Tae-oh en conversaciones de roleplay.
- Soporte multilingue para coreano, ingles y japones.
- Contexto de entrenamiento de 4096 tokens, suficiente para dialogos de cierta longitud sin perder coherencia.
- No se documenta soporte de tool calling ni function calling en el adaptador.
- No se documentan capacidades de vision o audio en el adaptador; el ajuste esta centrado en chat de personaje.
- El autor declara que no se incluyen las conversaciones originales de fans ni hidden chain-of-thought en los artefactos.

## Casos de uso

- Chat de fans en coreano: el modelo puede interpretar al personaje en su idioma nativo, permitiendo conversaciones largas gracias al contexto de 4096 tokens.
- Entretenimiento en juegos de rol textuales: integracion en plataformas de novela visual o juegos RPG online donde se requiere un personaje coherente y multilingue.
- Estudio de adaptacion LoRA en una sola GPU: sirve como ejemplo practico de fine-tune eficiente de un modelo de 27B con recursos limitados.
- Prototipos de asistentes con personalidad: el adaptador puede combinarse con un modelo base para anadir una capa de personalidad a un asistente conversacional.
- Generacion de contenido interactivo en japones e ingles para eventos virtuales: el modelo puede atender a audiencias multilingues, siempre que se valide su comportamiento y seguridad.
- Investigacion en seguridad de modelos basados en personas reales: permite estudiar alucinaciones, sesgos y riesgos de atribucion cuando un modelo imita a una figura publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado por el autor es la NLL del token final del asistente sobre el conjunto de validacion dev77:

| Variante | NLL final-assistant token |
|---|---|
| r16 | 1.751896932072007 |
| r64 | 1.626290986060173 |

Esta metrica no es comparable con benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Para el modelo fusionado en BF16 (aproximadamente 27B): se requieren unos 54 GB de VRAM solo para los pesos, mas memoria para activaciones y cache KV. Se recomienda una GPU con al menos 80 GB (A100, H100) o dos GPU de 40-48 GB en paralelo.
- Cuantizaciones NVFP4 y FP8 reducen el consumo de memoria: NVFP4 puede ocupar en torno a 13,5 GB para los pesos y FP8 alrededor de 27 GB, lo que permite el despliegue en GPU de gama alta de consumo (RTX 4090, 40-48 GB) segun la variante.
- Los adaptadores LoRA se pueden cargar con PEFT y Transformers sobre el modelo base, con coste adicional minimo.
- Opciones de despliegue: vLLM, TGI y Transformers para los pesos fusionados. Para las versiones cuantizadas se requiere soporte especifico de kernels NVFP4/FP8 (TensorRT-LLM, vLLM reciente). Unsloth Desktop ofrece una via sencilla para ejecutar el modelo base Qwen3.8-27B.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables de la misma categoria en la informacion proporcionada. El punto de referencia mas proximo es el propio modelo base Qwen3.8-27B, pero no se dispone de datos de rendimiento del adaptador para establecer una comparacion.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy pequeno (470 muestras), lo que limita la generalizacion y aumenta el riesgo de sobreajuste al estilo del personaje.
- No hay pruebas publicas de seguridad ni alineacion; el autor indica que la calidad y el rendimiento real del servicio aun estan en verificacion.
- La licencia no esta definida en Hugging Face; es imprescindible revisar los archivos LICENSE de cada artefacto antes de cualquier uso comercial.
- Al estar basado en una persona real (Kwon Tae-oh), el modelo puede generar contenidos que no representan a la persona y puede plantear problemas de derechos de imagen y difusion de informacion falsa.
- El contexto de entrenamiento es de 4096 tokens, por lo que las conversaciones mas largas pueden perder coherencia a partir de ese limite.
- No se garantiza que las capacidades de razonamiento y codificacion del modelo base se conserven tras el ajuste con un dataset tan especifico.

## Enlaces

- https://huggingface.co/NEWUNIVERS/nu-fans-kwon-tae-oh-qwen38-27b-unsloth
- https://unsloth.ai/models/qwen3.8-27b
