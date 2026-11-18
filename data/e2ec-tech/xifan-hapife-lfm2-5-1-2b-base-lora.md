# e2ec-tech/XiFan-Hapife-lfm2.5-1.2b-base-lora

## Resumen

XiFan-Hapife-lfm2.5-1.2b-base-lora es un paquete de artefactos derivados de LiquidAI/LFM2.5-1.2B-Instruct, publicado por e2ec-tech para las funciones en dispositivo de la aplicacion Android XiFan Family Assistant (XiFan-Hapife). No es un modelo nuevo entrenado desde cero: se compone de una reexportacion del modelo base al formato LiteRT-LM (`.litertlm`) con cuantizacion de rango dinamico y pesos de 4 bits en los bloques del transformer, parcheada para aceptar pesos LoRA en tiempo de ejecucion, mas un fichero TFLite independiente con los pesos LoRA (rank 16, solo proyecciones de atencion) de una tarea muy concreta.

El modelo base subyacente es LFM2.5-1.2B-Instruct de Liquid AI, con 1.2 mil millones de parametros y soporte para chino, japones e ingles. La relevancia de este repositorio es acotada: documenta un patron de despliegue movil (LiteRT-LM sobre CPU Android) con adaptadores LoRA cargados en caliente y verificados por SHA-256, en lugar de ofrecer un modelo generalista listo para produccion.

La licencia es la LFM Open License v1.0, que impone el umbral de uso comercial de la seccion 5 (entidades con ingresos anuales de 10 millones de USD o mas) tambien a estas obras derivadas. El repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2.5-1.2B-Instruct), reexportado a LiteRT-LM con entradas adicionales para LoRA en runtime |
| Parametros totales | 1.2 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion de rango dinamico con pesos de 4 bits en los bloques del transformer (fichero `.litertlm`) |
| Idiomas soportados | Chino (zh), japones (ja), ingles (en) |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | `.litertlm` (LiteRT-LM) y `.tflite` (LoRA) |

## Arquitectura y entrenamiento

El fichero `lfm-base.litertlm` (662.274.048 bytes) contiene los pesos originales de LFM2.5-1.2B-Instruct sin reentrenar, reexportados a LiteRT-LM con un exportador parcheado que permite inyectar pesos LoRA en las capas de atencion en tiempo de ejecucion. La cuantizacion aplicada es de rango dinamico con pesos de 4 bits para los bloques del transformer; el fichero no es identico byte a byte a ninguna exportacion oficial.

El fichero `genapp-select-lfm.tflite` (5.177.344 bytes) contiene pesos LoRA nuevos entrenados con PEFT sobre el modelo original: rank 8 durante el entrenamiento, ampliado a rank 16 para el runtime, solo en proyecciones de atencion, 300 pasos. Los datos de entrenamiento son exclusivamente frases sinteticas generadas a partir de plantillas de frases en chino, japones e ingles, sin datos de usuario, registros de chat ni informacion personal. Los LoRA no se fusionan en el fichero base; se almacenan por separado.

## Capacidades

- Generacion de texto conversacional offline como respaldo dentro de la app, usando `lfm-base.litertlm` sin LoRA.
- Seleccion de plantilla de pagina de solo lectura integrada y sus parametros a partir de una unica frase, devolviendo un objeto JSON con cuatro campos enumerados: `template`, `period`, `category` y `cuisine`.
- Carga en caliente de adaptadores LoRA en las capas de atencion mediante el runtime LiteRT-LM.
- Multilingue en chino, japones e ingles, tanto en el modelo base como en los datos sinteticos del LoRA.
- No soporta tool calling general, agentes multi-paso, vision ni audio segun la informacion disponible.
- El LoRA no tiene utilidad fuera del esquema JSON de cuatro campos para el que fue entrenado.

## Casos de uso

- Respaldo de chat offline en la aplicacion Android XiFan-Hapife: `lfm-base.litertlm` se carga solo cuando no hay conectividad, aprovechando la cuantizacion de 4 bits y el formato LiteRT-LM para ejecutar en CPU sin GPU.
- Seleccion de plantilla de pagina de solo lectura: el usuario dicta una frase y el modelo, con el LoRA, emite un JSON con `template`, `period`, `category` y `cuisine` que la app valida y repara antes de mostrarlo, sin ejecutar texto libre.
- Despliegue en dispositivos de gama media: el paquete esta probado en un Xiaomi 11T con 8 GB de RAM y CPU, con una mediana de 7,0 s por peticion en LiteRT-LM 0.19.1.
- Distribucion con verificacion de integridad: la app descarga los ficheros en una revision fijada y comprueba tamano y SHA-256 antes de usarlos, lo que sirve como patron para actualizar adaptadores en produccion movil.
- Prototipado de adaptadores LoRA en runtime sobre LiteRT-LM: el parche del exportador permite intercambiar el fichero `.tflite` sin reexportar el modelo base, util para iterar tareas estrechas en dispositivo.
- Evaluacion de pipelines de seleccion estructurada con validacion posterior: el esquema de cuatro campos y la reparacion en la app ejemplifican como acotar la salida de un modelo pequeno para evitar texto libre en produccion.

## Benchmarks y rendimiento

Evaluacion del LoRA sobre 90 peticiones sinteticas reservadas que no comparten formulacion con el conjunto de entrenamiento:

| Entorno | Plantilla y parametros correctos | Notas |
|---|---|---|
| Escritorio, LiteRT-LM 0.19.2 | 79 / 90 | Las 90 salidas fueron JSON valido |
| Xiaomi 11T (8 GB), LiteRT-LM 0.19.1, CPU | 78 / 90 | Mediana de 7,0 s por peticion |

No se han publicado resultados de benchmarks del modelo base reexportado (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; la model card indica que la calidad de chat solo se ha comprobado de forma puntual.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso documentado, que se ejecuta en CPU Android; el fichero base ocupa 662.274.048 bytes en disco.
- GPU recomendadas: no disponible; el runtime objetivo es LiteRT-LM 0.19.x sobre CPU Android.
- Cabe en dispositivos moviles: probado en un Xiaomi 11T con 8 GB de RAM; no se documentan otros modelos de telefono.
- Opciones de despliegue: LiteRT-LM 0.19.x (Android, CPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 7,0 s por peticion en el Xiaomi 11T con LiteRT-LM 0.19.1; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| XiFan-Hapife-lfm2.5-1.2b-base-lora | 1.2 B | no disponible | zh, ja, en | LFM Open License v1.0 | `.litertlm`, `.tflite` | Derivado con LoRA para una tarea concreta; evaluacion limitada a 90 peticiones sinteticas |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.2 B | no disponible | no disponible | LFM Open License v1.0 | safetensors (formato oficial) | Modelo base original de Liquid AI; sin parche de LoRA en runtime |
| Alternativas de ~1 B para dispositivo | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- La seleccion de plantilla falla aproximadamente una de cada ocho veces en el conjunto de prueba; la app permite al usuario cambiar a una plantilla similar.
- La calidad de chat del base reexportado solo se ha comprobado de forma puntual, no evaluada en profundidad.
- No se ha probado el comportamiento con un fichero LoRA danado ni con un LoRA emparejado a un base distinto; la app rechaza esas combinaciones por checksum.
- Probado en un unico modelo de telefono (Xiaomi 11T).
- El fichero LoRA es inutil fuera del esquema JSON de cuatro campos para el que fue entrenado.
- La licencia LFM Open License v1.0 aplica el umbral de uso comercial de la seccion 5 (entidades con ingresos anuales de 10 millones de USD o mas) a estas obras derivadas; se deben conservar los avisos de copyright y atribucion del modelo original (© Liquid AI, Inc.).
- No es una release oficial de Liquid AI.
- No se documentan sesgos especificos, riesgos de alucinacion medidos ni limitaciones de contexto mas alla de las indicadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/e2ec-tech/XiFan-Hapife-lfm2.5-1.2b-base-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
