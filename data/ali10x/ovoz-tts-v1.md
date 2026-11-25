# ali10x/ovoz-tts-v1

## Resumen

Ovoz TTS v1 es un modelo de sintesis de voz (text-to-speech) para uzbeko desarrollado por ali10x bajo el paraguas de OvozAI. Se trata de un modelo extremadamente compacto, con solo 4,5 millones de parametros, disenado para ejecutarse en CPU o directamente en el navegador mediante WebAssembly, sin necesidad de GPU. Genera audio mono a 24 kHz a partir de texto en uzbeko escrito en alfabeto latino o cirilico, incluyendo la expansion de numeros, fechas, horas y porcentajes a palabras.

Su relevancia radica en su eficiencia: segun la model card, alcanza aproximadamente 68 veces la velocidad en tiempo real en un solo hilo de un Apple M2 y unas 30 veces en Chrome con WebAssembly a un solo hilo, con la primera frase disponible en torno a 50 ms. Esto lo convierte en una opcion practica para sintesis de voz en dispositivos de bajos recursos y aplicaciones web sin backend dedicado.

El modelo se distribuye en formato ONNX (opset 17, 21 MB) junto con un frontend de texto en JavaScript (`uz-frontend.mjs`) que convierte el texto uzbeko en tokens para el modelo, y los pesos originales en PyTorch. La licencia es Apache-2.0. No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 512 tokens por frase |
| Tipos de cuantizacion | no disponible (se distribuye un unico ONNX de 21 MB) |
| Idiomas soportados | uzbeko (uz), en alfabeto latino y cirilico |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) y PyTorch (`.pt`, paso 45.000) |

## Arquitectura y entrenamiento

No se ha proporcionado informacion sobre la arquitectura interna del modelo (tipo de red, capas, mecanismo de atencion o diseno del vocoder) mas alla de que es un modelo TTS de 4,5 M de parametros con una unica voz y salida a 24 kHz. La model card menciona la existencia de un vocoder, cuyo caracter se describe como "ligeramente sintetico", pero no detalla su estructura.

Tampoco se dispone de datos sobre el volumen o la composicion del corpus de entrenamiento, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones posteriores. El unico dato de entrenamiento disponible es que los pesos PyTorch corresponden al paso 45.000. El modelo incluye un frontend de texto especifico para uzbeko que realiza fonemizacion, asignacion de stress y normalizacion de numeros, fechas, horas y porcentajes, lo que constituye una innovacion practica relevante para un idioma con recursos limitados.

## Capacidades

- Sintesis de voz en uzbeko a partir de texto en alfabeto latino o cirilico.
- Normalizacion de texto: conversion de numeros, fechas, horas y porcentajes a palabras.
- Fonemizacion y asignacion de marcas de stress mediante el frontend `uz-frontend.mjs`.
- Control de velocidad de habla (parametro `speed`, 1 = normal).
- Control de tono mediante `pitch_shift` (sumado a log F0; 0,058 equivale aproximadamente a un semitono) y `pitch_range` (1 = normal).
- Salida de audio float32 mono a 24 kHz y de duraciones por token en frames de 256 muestras.
- Procesamiento por frases de hasta 512 tokens, con utilidad `splitSentences` para textos largos.
- Ejecucion en CPU y en navegador (WebAssembly) sin GPU.
- Una unica voz (indice de voz 0).
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones web: el modelo puede ejecutarse integramente en el navegador con onnxruntime-web, permitiendo sintesis de voz sin enviar texto a un servidor y sin coste de infraestructura.
- Asistentes de voz para uzbeko en dispositivos de bajos recursos: con 4,5 M de parametros y ejecucion en CPU, cabe en entornos embebidos o moviles donde un modelo TTS convencional no seria viable.
- Accesibilidad: conversion de articulos, notificaciones o mensajes en uzbeko a audio para usuarios con discapacidad visual, con latencia de primera frase en torno a 50 ms.
- Automatizacion de avisos y anuncios: generacion de locuciones para transporte publico, comercios o servicios publicos en uzbeko, procesando cada frase de forma independiente con `splitSentences`.
- Prototipado rapido de productos de voz: el frontend JavaScript y el ONNX permiten montar una demo funcional en Node.js o en el navegador en pocas lineas de codigo.
- Investigacion en TTS de bajos recursos: como modelo pequeno y abierto (Apache-2.0) para experimentar con fonemizacion, control de prosodia y despliegue en entornos restringidos.
- Lectura de datos estructurados: la normalizacion de numeros, fechas, horas y porcentajes facilita la locucion de informes, horarios y precios sin preprocesado adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de velocidad de inferencia:

| Metrica | Valor declarado |
|---|---|
| Velocidad en Apple M2 (1 hilo) | ~68x tiempo real |
| Velocidad en Chrome (WebAssembly, 1 hilo) | ~30x tiempo real |
| Latencia de la primera frase | ~50 ms |
| Tamano del modelo ONNX | 21 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo ONNX ocupa 21 MB y esta pensado para CPU.
- GPU recomendadas: no aplica; no se documenta soporte GPU como requisito.
- Cabe en cualquier GPU de consumo y en CPU: se ejecuta en un solo hilo de un Apple M2 y en Chrome mediante WebAssembly.
- Opciones de despliegue: onnxruntime-node (Node.js), onnxruntime-web (navegador, WebAssembly), y los pesos PyTorch (`.pt`) para uso con PyTorch.
- Latencia y throughput: ~50 ms hasta la primera frase; ~68x tiempo real en Apple M2 (1 hilo) y ~30x en Chrome (1 hilo), segun el autor.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se puede senalar, a modo de referencia estructural, que la mayoria de los sistemas TTS abiertos de proposito general (p. ej. familias tipo VITS o Piper) manejan ordenes de magnitud de parametros superiores y no ofrecen un frontend especifico para uzbeko, pero no se aportan datos verificables para una comparacion numerica.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ovoz TTS v1 | 4,5 M | 512 tokens por frase | uzbeko | Apache-2.0 | ONNX, PyTorch |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El frontend falla con numeros de 13 o mas digitos.
- El signo menos se descarta en la normalizacion de texto.
- La cadena "4.5" se lee como dos frases distintas.
- El vocoder tiene un caracter ligeramente sintetico, segun el propio autor.
- Una unica voz: no hay seleccion de hablante ni clonacion.
- Procesa una frase a la vez (maximo 512 tokens); es necesario dividir textos largos con `splitSentences`.
- Solo soporta uzbeko; no se documentan otros idiomas.
- No se dispone de informacion sobre sesgos, tasa de alucinacion o calidad subjetiva (MOS) del audio.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar el archivo `LICENSE` del repositorio y las condiciones de los datos de entrenamiento, no documentadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ali10x/ovoz-tts-v1
- Demo en navegador: https://ovozai.uz/tts-v1
- onnxruntime-node: https://www.npmjs.com/package/onnxruntime-node
- onnxruntime-web: https://www.npmjs.com/package/onnxruntime-web
