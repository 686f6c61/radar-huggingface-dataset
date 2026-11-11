# Siranjeevi029/TronOS-voice-command-granite-350m

## Resumen

TronOS-voice-command-granite-350m es un ajuste fino supervisado del modelo base ibm-granite/granite-4.0-h-350m, desarrollado por el usuario Siranjeevi029. Su proposito es convertir comandos de voz transcritos a texto en un unico objeto JSON con intencion y campos estructurados, pensado para ejecutarse integramente en un telefono Android sin conexion de red. El modelo resuelve el problema de la interpretacion de intenciones (intent classification) y la extraccion de entidades en el dominio cerrado de un asistente de voz movil.

La arquitectura subyacente es hibrida: 28 capas Mamba2 y 4 capas de atencion, con 340 millones de parametros totales. El ajuste se realizo mediante LoRA sobre las capas de atencion y MLP, y los pesos resultantes se fusionaron en el modelo base. Se distribuyen multiples formatos: safetensors en FP32, ONNX en FP32, FP16, INT8 e INT4, ademas del adaptador LoRA sin fusionar.

El modelo es relevante para el despliegue en dispositivo (on-device) porque la variante INT8 ocupa 404 MiB y alcanza 86,3 % de coincidencia exacta de JSON en un conjunto de prueba de 613 comandos, con un consumo maximo de 896 MB de RAM en un Moto G34 5G. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 28 capas Mamba2 + 4 capas de atencion (granitemoehybrid) |
| Parametros totales | 340.332.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 (dinamica, pesos per-channel), INT4 (MatMulNBits, bloque 32) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch fusionado), ONNX (FP32/FP16/INT8/INT4), PEFT LoRA adapter |

## Arquitectura y entrenamiento

El modelo base granite-4.0-h-350m emplea una arquitectura hibrida que combina 28 capas Mamba2 con 4 capas de atencion, lo que reduce el coste computacional y de memoria frente a un transformer puro de tamano equivalente. El ajuste fino se realizo con LoRA sobre las capas de atencion y MLP, con el adaptador posteriormente fusionado en los pesos base para su distribucion. El adaptador sin fusionar tambien se publica en la carpeta `adapter/` (16 MiB).

El entrenamiento se orienta a una tarea de generacion estructurada con un dominio cerrado de siete intenciones: `set_alarm`, `create_reminder`, `open_app`, `make_call`, `send_message`, `change_setting` y `unsupported`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo se entreno con un system prompt concreto y la plantilla de chat propia del modelo; el autor advierte que usar un prompt distinto reduce la precision. El conjunto de evaluacion consta de 613 comandos retenidos, nunca usados en entrenamiento ni seleccion de modelo.

## Capacidades

- Generacion de JSON estructurado a partir de comandos de voz transcritos, con intencion y campos especificos por intencion.
- Clasificacion de intenciones en siete categorias cerradas, incluida la deteccion de peticiones no soportadas (pagos, compras, clima, busquedas, domotica, borrado de datos).
- Extraccion de entidades: hora en formato HH:MM de 24 horas, fechas relativas (`today`, `tomorrow`, `day_after_tomorrow`, dias de la semana), tiempos relativos en formato HH:MM, nombres de contacto, nombres de aplicacion, texto de mensaje y ajustes del sistema con accion y valor.
- Manejo de comandos con multiples acciones: usa solo la primera accion y devuelve `unsupported` si la primera no esta soportada.
- Generacion determinista con decodificacion greedy (`do_sample=False`), lo que favorece la validez del JSON.
- Ejecucion sin red en Android mediante ONNX Runtime, con variantes cuantizadas para movil.
- No se documentan capacidades de tool calling generico, agentes multi-paso, vision, audio ni razonamiento general; el modelo esta especializado en la tarea descrita.

## Casos de uso

- Asistente de voz en Android sin conexion: el modelo recibe la transcripcion STT y devuelve el JSON que el servicio Android usa para crear alarmas, recordatorios, llamadas o mensajes. La variante INT8 (404 MiB) se ejecuta en un Snapdragon 695 con 896 MB de RAM pico, lo que permite operar completamente offline.
- Creacion de alarmas y recordatorios por voz: convierte frases como "wake me up at 6:30 tomorrow" en `{"intent": "set_alarm", "time": "06:30", "date": "tomorrow"}`, con soporte de tiempos relativos ("in 20 minutes" a `00:20`).
- Envio de mensajes dictados: extrae contacto, texto y aplicacion de destino en una sola pasada, adecuado para integraciones con apps de mensajeria del sistema.
- Control de ajustes del dispositivo: mapea ordenes de voz sobre wifi, bluetooth, brillo, volumen, modo avion, linterna, no molestar, ubicacion, hotspot, ahorro de bateria y rotacion automatica a acciones `on`, `off`, `increase`, `decrease` o `set` con valor entero.
- Filtrado de peticiones no soportadas: el modelo clasifica como `unsupported` peticiones de pagos, compras, clima o busqueda, con un recall del 99,1 % en INT8, lo que evita ejecutar acciones no previstas en el asistente.
- Apertura de aplicaciones y llamadas: resuelve `open_app` con nombre de aplicacion y `make_call` con contacto, util para un lanzador por voz en el movil.
- Prototipado de asistentes embebidos en otros dispositivos: las variantes ONNX FP16 e INT4 permiten desplegar el parser en hardware de baja potencia fuera de Android, con 57,7 tok/s en FP16 y 124,0 tok/s en INT4 en un Apple M5.
- Base para ajuste adicional: el adaptador LoRA sin fusionar (16 MiB) y los pesos safetensors en FP32 permiten reentrenar el modelo para nuevos dominios de intenciones con `transformers`.

## Benchmarks y rendimiento

Conjunto de prueba retenido de 613 comandos. La coincidencia exacta de JSON exige que la intencion y todos los campos sean correctos, sin campos extra.

| Metrica | Base FP32 | FP32 | FP16 | INT8 | INT4 |
|---|---:|---:|---:|---:|---:|
| Coincidencia exacta de JSON | 32,5 % | 89,1 % | 89,1 % | 86,3 % | 77,8 % |
| Precision de intencion | 74,2 % | 94,9 % | 94,9 % | 94,3 % | 89,9 % |
| Precision de campos | 59,3 % | 88,8 % | 88,8 % | 86,7 % | 82,4 % |
| Validez de JSON | 98,9 % | 100 % | 100 % | 100 % | 99,8 % |
| Recall de peticiones no soportadas | 33,0 % | 99,1 % | 99,1 % | 99,1 % | 78,3 % |

Las filas ajustadas se midieron con ONNX Runtime 1.31.1 en CPU de un Mac; la fila Base FP32 corresponde a PyTorch sin entrenar.

Velocidad (ONNX Runtime 1.31.1, CPU, 4 hilos, prompt de unos 500 tokens):

| Plataforma | FP16 | INT8 | INT4 |
|---|---:|---:|---:|
| Mac (Apple M5): tiempo hasta el primer token | 1,58 s | 0,57 s | 0,85 s |
| Mac (Apple M5): decodificacion | 57,7 tok/s | 101,0 tok/s | 124,0 tok/s |
| Telefono (Moto G34 5G): tiempo hasta el primer token | n/a | 5,92 s | n/a |
| Telefono (Moto G34 5G): decodificacion | n/a | 9,8 tok/s | n/a |
| Telefono (Moto G34 5G): RAM pico | n/a | 896 MB | n/a |

Solo se midio INT8 en el telefono. En una comprobacion de 62 comandos en el dispositivo, INT8 obtuvo 32/62 frente a 50/62 en el Mac, atribuido a diferencias en los kernels INT8 de la CPU del telefono (detalle en la seccion 9.4 del informe en GitHub).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 1.298 MiB en FP32 (safetensors), 1.301 MiB en ONNX FP32, 652 MiB en ONNX FP16, 404 MiB en ONNX INT8 y 253 MiB en ONNX INT4.
- GPU recomendadas: no se proporcionan recomendaciones especificas de GPU en la informacion disponible. Las mediciones publicadas son en CPU (Apple M5 y Snapdragon 695).
- Cabe en GPU de consumo: si, por tamano; las variantes INT8 e INT4 caben en cualquier GPU con mas de 1 GB de memoria. No se publican mediciones en GPU.
- Despliegue: `transformers` (pesos safetensors FP32), ONNX Runtime 1.31.1 (variantes ONNX), PEFT para aplicar el adaptador LoRA sobre el modelo base. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Apple M5 con ONNX Runtime CPU y 4 hilos, 0,57 s hasta el primer token y 101,0 tok/s en INT8; 1,58 s y 57,7 tok/s en FP16; 0,85 s y 124,0 tok/s en INT4. En Moto G34 5G con INT8, 5,92 s hasta el primer token y 9,8 tok/s de decodificacion, con 896 MB de RAM pico.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos conocidos del modelo base y de este ajuste.

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| TronOS-voice-command-granite-350m | 340 M | no disponible | Parsing de comandos de voz a JSON | Apache 2.0 | safetensors, ONNX, LoRA |
| ibm-granite/granite-4.0-h-350m (base) | 340 M | no disponible | Generacion de texto general | Apache 2.0 (segun modelo base) | safetensors |
| Alternativas de parsing de intenciones de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se documenta soporte multilingue.
- Esta especializado en un dominio cerrado de siete intenciones y no debe usarse como modelo de generacion de texto general.
- La precision depende criticamente del system prompt exacto y de la plantilla de chat del modelo; el autor advierte que un prompt distinto reduce la precision.
- En INT8 sobre el telefono, la precision cae respecto a la medicion en Mac (32/62 frente a 50/62 en una comprobacion de 62 comandos) por diferencias en los kernels de CPU; conviene validar en el hardware objetivo.
- La variante INT4 presenta un rendimiento notablemente inferior: 77,8 % de coincidencia exacta y 78,3 % de recall de peticiones no soportadas, frente a 86,3 % y 99,1 % en INT8.
- Riesgo de alucinacion: aunque la validez de JSON es del 100 % en FP32, FP16 e INT8, la precision de campos es del 86,7 % en INT8, por lo que pueden aparecer valores incorrectos en campos extraidos.
- El modelo puede devolver `unsupported` de forma conservadora o, en el caso de comandos multiples, ignorar todas las acciones salvo la primera; esto es un comportamiento de diseno, no un fallo.
- No se documentan sesgos especificos, pero al derivar de un modelo base entrenado con datos no descritos en la informacion disponible, pueden heredarse sesgos de dicho corpus.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de incluir el aviso de licencia y el texto de atribucion correspondiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un modelo reciente y sin validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Siranjeevi029/TronOS-voice-command-granite-350m
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Repositorio GitHub con codigo, datos, logs de entrenamiento e informe: https://github.com/siranjeevi04/TronOS-voice-command-assistant
