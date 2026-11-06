# Honkware/Nanbeige4.3-33B-exl3-4.0bpw

## Resumen

Nanbeige4.3-33B-exl3-4.0bpw es una cuantizacion en formato EXL3 a 4,0 bits por peso del modelo denso Nanbeige/Nanbeige4.3-33B, publicada por el usuario Honkware. El repositorio no contiene un modelo nuevo, sino una conversion de los pesos originales pensada para su uso con la libreria ExLlamaV3, lo que permite ejecutar un transformer de tipo Llama de 52 capas en GPUs de consumo con un tamano en disco de 18,7 GB.

El modelo base pertenece a la familia Nanbeige 4.3, una arquitectura transformer densa de tipo Llama. La model card del repositorio cuantizado no aporta informacion sobre el entrenamiento, el numero de tokens, la composicion del dataset ni las capacidades del modelo original; toda esa informacion debe consultarse en el repositorio upstream. El dato de parametros totales almacenado en los safetensors es de 9.334.250.496, aunque la nomenclatura del modelo base indica 33B, una discrepancia que conviene verificar contra el repositorio original antes de planificar el despliegue.

La relevancia de esta publicacion es practica: ofrece una via para servir el modelo con TabbyAPI (API compatible con OpenAI), text-generation-webui o la API Python de ExLlamaV3, con una perdida de fidelidad medida por el autor de 0,0063 de KL mediana sobre wiki2. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama, 52 capas |
| Parametros totales | 9.334.250.496 (segun safetensors); el nombre del modelo base indica 33B |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4,0 bits por peso (head bits 6, codebook mul1, out-scales always) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato EXL3 (libreria exllamav3) |

## Arquitectura y entrenamiento

El repositorio es una cuantizacion, no un entrenamiento. El modelo subyacente es un transformer denso de tipo Llama con 52 capas, segun la model card. La receta de cuantizacion esta embebida en `quantization_config.json` y utiliza el formato EXL3 de ExLlamaV3 con 4,0 bits por peso, 6 bits para las cabezas, calibracion sobre 250 filas de un mix empaquetado con exllamav3 (c4, code, multilingual, technical, tiny, wiki), codebook `mul1`, out-scales activados siempre y modo paralelo habilitado. La herramienta empleada es BlockQuant, del propio autor de la cuantizacion.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas del modelo base. La unica metrica de calidad publicada es la divergencia KL mediana sobre wiki2 respecto al modelo original: 0,0063 para esta variante de 4,0 bpw.

## Capacidades

- Generacion de texto y conversacion, segun los tags `text-generation` y `conversational` del repositorio.
- Inferencia compatible con clientes OpenAI a traves de TabbyAPI.
- Integracion en pipelines Python mediante la API directa de ExLlamaV3.
- Uso en interfaces locales de chat con el loader ExLlamaV3 de text-generation-webui.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Servidor local compatible con OpenAI: desplegar el modelo con TabbyAPI permite sustituir llamadas a la API de OpenAI por un endpoint local sin cambiar el codigo cliente, gracias a la compatibilidad declarada por el autor de la cuantizacion.
- Prototipado de chat en estacion de trabajo: con 18,7 GB de pesos, el modelo puede cargarse en GPUs de consumo de gama alta y usarse desde text-generation-webui para pruebas de conversacion multi-turno.
- Evaluacion de calidad de cuantizaciones: el valor de KL mediana de 0,0063 sobre wiki2 permite comparar esta variante de 4,0 bpw con otras anchuras de bit del mismo modelo dentro de la coleccion del autor.
- Integracion en aplicaciones Python: la API de ExLlamaV3 permite embeber el modelo en servicios propios sin depender de un servidor HTTP externo.
- Experimentacion con modelos de gran tamano en hardware limitado: la reduccion a 4,0 bpw facilita estudiar el comportamiento de un transformer de 52 capas sin disponer de un clúster de GPUs.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del modelo base facilita su uso en productos comerciales, siempre que se verifiquen las condiciones del repositorio upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de calidad es la divergencia KL mediana sobre wiki2 respecto al modelo base: 0,0063.

## Requisitos de hardware

- VRAM estimada: al menos 18,7 GB solo para los pesos; conviene reservar margen adicional para cache KV y contexto.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPUs de consumo con 24 GB de VRAM o mas, aunque el autor no especifica modelos concretos.
- Opciones de despliegue: TabbyAPI, text-generation-webui con loader ExLlamaV3 y la API Python de ExLlamaV3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-exl3-4.0bpw (este) | 9.334.250.496 segun safetensors | no disponible | EXL3 4,0 bpw | Apache 2.0 | Hugging Face, 123 descargas |
| Nanbeige/Nanbeige4.3-33B (base) | no disponible | no disponible | safetensors originales | Apache 2.0 | Hugging Face |
| Otras variantes EXL3 de la coleccion Honkware | no disponible | no disponible | EXL3 a otras anchuras de bit | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 4,0 bpw introduce una perdida medible de fidelidad (KL mediana de 0,0063 sobre wiki2) respecto al modelo original.
- El campo `inference: false` de la model card indica que el repositorio no esta pensado para inferencia generica fuera de ExLlamaV3; requiere un loader compatible con EXL3.
- Existe una discrepancia entre el numero de parametros de los safetensors (9.334.250.496) y el nombre del modelo base (33B) que debe resolverse consultando el repositorio upstream.
- No hay informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o cobertura idiomatica del modelo base en la informacion proporcionada.
- La licencia Apache 2.0 se hereda del modelo base; el autor de la cuantizacion no anade restricciones, pero las condiciones finales deben verificarse en el repositorio upstream.
- El repositorio tiene un volumen de descargas bajo (123) y ninguna valoracion, por lo que no hay evidencia comunitaria de robustez en produccion.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/Honkware/Nanbeige4.3-33B-exl3-4.0bpw
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Coleccion de cuantizaciones: https://huggingface.co/collections/Honkware/nanbeige43-33b-exl3-6ae18f8384d4a271df28b986
- Perfil del autor: https://huggingface.co/Honkware
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- BlockQuant: https://github.com/Honkware/blockquant
