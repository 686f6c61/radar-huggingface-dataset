# cpral/Bielik-11B-v3.1-Instruct-W8A8-INT8

## Resumen

Bielik-11B-v3.1-Instruct-W8A8-INT8 es una cuantizacion W8A8 (pesos y activaciones en INT8) del modelo Bielik-11B-v3.1-Instruct, desarrollado originalmente por SpeakLeash. La cuantizacion la ha realizado el usuario `cpral` y se distribuye bajo licencia Apache 2.0. El modelo base es un transformer de 11.170.947.072 parametros (aproximadamente 11,17 mil millones) orientado a instrucciones y especializado en polaco dentro del ecosistema Bielik.

La relevancia de esta ficha radica en que la cuantizacion W8A8 INT8 reduce el peso del repositorio a unos 11,4 GB, lo que permite desplegar un modelo de 11B en GPUs con menor VRAM que la version en BF16, manteniendo pesos y activaciones en 8 bits. El autor indica que es adecuado para SM86 (arquitectura Ampere de NVIDIA, como la RTX 3090 o A10). No obstante, la model card es extremadamente escueta: no aporta informacion sobre el proceso de cuantizacion, calibracion, idiomas, contexto ni benchmarks.

Al tratarse de un derivado cuantizado de un modelo de instrucciones, hereda las capacidades del Bielik-11B-v3.1-Instruct, pero debe evaluarse con cautela porque la cuantizacion puede degradar la calidad respecto al modelo original. La informacion disponible no permite confirmar detalles tecnicos clave (contexto, idiomas, dataset de entrenamiento), por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, segun tag `llama`); detalles no disponibles |
| Parametros totales | 11.170.947.072 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 INT8 (pesos y activaciones en 8 bits); no se documentan otros formatos |
| Idiomas soportados | no disponible (el modelo base Bielik esta orientado al polaco, pero la model card no lo confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `llama`, que sugiere una estructura transformer decoder-only de la familia Llama. El modelo base, speakleash/Bielik-11B-v3.1-Instruct, es un modelo afinado para instrucciones, pero la model card de esta cuantizacion no describe el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF, DPO u otras tecnicas de alineacion.

La innovacion tecnica de esta version es la cuantizacion W8A8 INT8: tanto los pesos como las activaciones se representan en enteros de 8 bits, lo que reduce el uso de memoria y acelera la inferencia en hardware con soporte para operaciones INT8 (por ejemplo, SM86 de NVIDIA). El autor no documenta el metodo de calibracion, el numero de muestras de calibracion ni las metricas de degradacion respecto al modelo original, por lo que no es posible evaluar la fidelidad de la cuantizacion a partir de la informacion proporcionada.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: al derivar de un modelo Instruct, se espera que responda a prompts conversacionales y tareas de formato, aunque no hay evaluacion publicada en esta ficha.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base, no verificadas en la cuantizacion.
- Generacion de codigo y matematicas: no confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo base esta asociado al polaco, pero la model card no lo especifica.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Despliegue en GPUs Ampere con VRAM limitada: al estar cuantizado a W8A8 INT8 y ocupar unos 11,4 GB en reposo, puede ejecutarse en tarjetas como la RTX 3090 (24 GB) o la A10 (24 GB) dejando margen para el contexto y el batch, algo inviable con la version BF16 de 11B en GPUs de 16 GB.
- Inferencia de bajo coste en produccion: la representacion INT8 de pesos y activaciones reduce el ancho de banda de memoria y puede aumentar el throughput en hardware con soporte nativo de INT8, adecuado para servicios de generacion de texto con requisitos de latencia moderados.
- Procesamiento de texto en polaco (si se confirma la herencia del modelo base): el Bielik original esta orientado a ese idioma, por lo que esta cuantizacion podria usarse para tareas de redaccion, resumen o clasificacion en polaco, previa validacion de calidad.
- Prototipado y evaluacion local: el tamano de 11,4 GB permite descargar y probar el modelo en estaciones de trabajo con una sola GPU consumer de gama alta, sin necesidad de infraestructura multi-GPU.
- Fine-tuning ligero o adaptadores sobre la version cuantizada: no recomendado de forma directa, pero puede servir como base para experimentos de evaluacion comparativa frente al modelo original.
- Banchmarking de cuantizacion: util para medir la degradacion de calidad de W8A8 frente a BF16 en tareas de instrucciones, siempre que se disponga de un conjunto de evaluacion propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,4 GB solo para pesos; con overhead de activaciones, KV cache y contexto, se recomienda al menos 16-24 GB de VRAM.
- GPU recomendadas: el autor indica compatibilidad con SM86 (Ampere), lo que incluye RTX 3090, A10, A40 y A100 (aunque A100 es SM80, no SM86). Para INT8 nativo conviene hardware Ampere o superior.
- Cabe en GPU consumer: si, en RTX 3090 (24 GB) y potencialmente en RTX 4080/4090 (16-24 GB) con contexto moderado; en GPUs de 12 GB el margen es muy ajustado.
- Opciones de despliegue: no documentadas por el autor; al ser safetensors con cuantizacion W8A8, requiere frameworks con soporte de cuantizacion INT8 (por ejemplo, variantes de vLLM o TensorRT-LLM con kernels INT8). No se confirma compatibilidad con llama.cpp u Ollama, que suelen usar GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cpral/Bielik-11B-v3.1-Instruct-W8A8-INT8 | 11,17B | no disponible | W8A8 INT8 | Apache 2.0 | Hugging Face |
| speakleash/Bielik-11B-v3.1-Instruct | 11,17B (aprox.) | no disponible | BF16/FP16 (original) | no disponible en esta ficha | Hugging Face |
| Otros modelos 11B de instrucciones | variable | variable | variable | variable | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es minima: no documenta calibracion, idiomas, contexto ni evaluacion, lo que impide garantizar el comportamiento en produccion.
- La cuantizacion W8A8 puede degradar la calidad respecto al modelo original; no se han publicado metricas de degradacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no evaluado en esta version.
- Sesgos conocidos: no documentados; el modelo base podria estar sesgado hacia el polaco y su contexto cultural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales.
- Compatibilidad de despliegue limitada: al no ser GGUF, no se puede usar directamente con llama.cpp u Ollama; requiere frameworks con soporte INT8 W8A8.
- El tag `region:us` y la ausencia de descargas/likes sugieren un repositorio reciente y sin validacion comunitaria.
- No se debe asumir que las capacidades del modelo base se mantienen intactas sin una evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/cpral/Bielik-11B-v3.1-Instruct-W8A8-INT8
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct
