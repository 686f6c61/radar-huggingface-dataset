# empiriolabsai/canora-french

## Resumen

Canora French es un modelo de sintesis de voz (text-to-speech) en frances desarrollado por EmpirioLabs. Se trata de un fine-tuning de hexgrad/Kokoro-82M, un modelo TTS de 82 millones de parametros, y hereda por tanto su arquitectura y su tamano reducido. El modelo ofrece dos voces: `camille` (femenina) y `louis` (masculina), y se distribuye con pesos ONNX en precision completa, media precision e int8 para ONNX Runtime y transformers.js, ademas de cargarse con el paquete estandar `kokoro` de Python.

El modelo resuelve el problema de la sintesis de voz en frances con una calidad competitiva frente a las voces Piper y la voz francesa original de Kokoro-82M (`ff_siwis`). Segun las mediciones del autor sobre 200 frases no vistas, Canora French alcanza un WER de 5,34% (`louis`) y 6,21% (`camille`), frente al 6,11% de `ff_siwis`, y mejora la naturalidad estimada (UTMOS) de todas las alternativas comparadas. Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia actual del modelo reside en su relacion calidad/tamano: con 82 millones de parametros y un fichero int8 de 115 MB, ofrece una alternativa ligera y desplegable en entornos con recursos limitados (navegador via transformers.js, CPU, dispositivos embebidos) para una de las lenguas con menos cobertura de voces TTS de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (fine-tuning); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | ONNX en precision completa, media precision (fp16) e int8 |
| Idiomas soportados | Frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (paquete `kokoro`) y ONNX (full, fp16, int8) |
| Voces | `camille` (femenina), `louis` (masculina) |
| Tamano del repositorio | 0,9 GB |
| Dependencia externa | `espeak-ng` (para el modulo texto-a-fonema) |

## Arquitectura y entrenamiento

Canora French es un fine-tuning de hexgrad/Kokoro-82M, un modelo TTS de 82 millones de parametros. La informacion proporcionada no detalla la arquitectura interna de Kokoro-82M (tipo de decoder, encoder de fonemas, etc.), por lo que este dato se considera no disponible. El modelo se carga con el paquete estandar `kokoro` de Python y requiere un modulo texto-a-fonema de un solo fichero incluido en el repositorio, que invoca el programa externo `espeak-ng`.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El autor si documenta el proceso de evaluacion: 200 frases francesas no vistas, transcritas con `openai/whisper-large-v3` para calcular WER, y UTMOS como estimacion automatica de naturalidad. La innovacion destacable es el tratamiento de numeros, fechas, horas y precios, que se leen como lo haria un hablante nativo de frances.

## Capacidades

- Sintesis de voz en frances con dos voces: `camille` (femenina) y `louis` (masculina).
- Lectura correcta de numeros, fechas, horas y precios segun la convencion del frances hablado (por ejemplo, "14 h 35", "3,50 €").
- Salida de audio de alta inteligibilidad: WER de 5,34% a 6,21% sobre 200 frases no vistas.
- Naturalidad estimada superior a las voces Piper y a Kokoro-82M `ff_siwis` (UTMOS 4,10 y 3,98 frente a 3,73 de la mejor alternativa).
- Identificacion de idioma como frances con probabilidad media de 0,99 o superior segun `openai/whisper-large-v3`.
- Inferencia en PyTorch y en ONNX Runtime (full, fp16, int8).
- Compatibilidad con transformers.js para ejecucion en navegador.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- **Lectura de noticias y boletines en frances**: el modelo convierte articulos en audio con pronunciacion nativa de cifras y fechas, adecuado para podcasts automatizados o servicios de accesibilidad, gracias a su tratamiento especifico de numeros y horas.
- **Asistentes de voz para atencion al cliente**: con dos voces diferenciadas (`camille` y `louis`) se pueden asignar locutores distintos a flujos o marcas; el modelo int8 de 115 MB permite desplegarlo en servidores modestos con ONNX Runtime.
- **Sintesis en el navegador con transformers.js**: integracion en aplicaciones web para lectura de contenido sin enviar texto a un servidor, usando los pesos ONNX int8 y aprovechando la velocidad de 5,9x tiempo real medida en CPU.
- **Audiolibros y contenido educativo**: generacion de narraciones en frances con naturalidad estimada alta (UTMOS 4,10), apta para material didactico o lectura asistida.
- **Sistemas de anuncios y megafonia**: lectura de horarios, precios y avisos en estaciones o comercios, donde la correcta verbalizacion de "14 h 35" o "3,50 €" es critica.
- **Prototipado rapido de productos de voz**: al cargarse con el paquete estandar `kokoro` y requerir solo `espeak-ng`, permite validar una idea de producto TTS en frances en pocas lineas de codigo.
- **Accesibilidad web**: conversion de texto a voz para usuarios con discapacidad visual en sitios en frances, ejecutable en el cliente con transformers.js.

## Benchmarks y rendimiento

Resultados medidos por EmpirioLabs el 2026-11-23 sobre 200 frases francesas no vistas. WER mas bajo es mejor; UTMOS (escala 1-5) mas alto es mejor.

| Sistema | WER | UTMOS |
|---|---:|---:|
| Canora French `camille` | 6,21% | 4,10 |
| Canora French `louis` | 5,34% | 3,98 |
| Kokoro-82M `ff_siwis` | 6,11% | 3,73 |
| Piper `fr_FR-siwis-medium` | 6,48% | 3,49 |
| Piper `fr_FR-tom-medium` | 6,79% | 2,95 |
| Piper `fr_FR-upmc-medium` | 9,74% | 3,25 |
| Piper `fr_FR-siwis-low` | 10,51% | 3,40 |
| Piper `fr_FR-gilles-low` | 11,73% | 3,59 |
| Piper `fr_FR-mls_1840-low` | 19,11% | 2,95 |
| Piper `fr_FR-mls-medium` | 31,66% | 3,07 |

En la version int8, `camille` obtiene 6,84% WER y UTMOS 2,92; `louis` obtiene 5,57% WER y UTMOS 3,33 sobre las mismas frases.

Velocidad medida sobre 60 frases en 4 hilos de un AMD EPYC 9534 (segundos de audio por segundo de computo): PyTorch 5,0x tiempo real, ONNX precision completa 5,0x, ONNX int8 5,9x.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 82 millones de parametros, la huella es minima; el fichero ONNX int8 ocupa 115 MB. No se proporcionan cifras exactas de VRAM en la informacion disponible.
- **GPU recomendadas**: no se especifican en la informacion disponible. Por tamano, el modelo es apto para cualquier GPU consumer moderna; la evaluacion publicada se realizo en CPU (AMD EPYC 9534).
- **Consumer GPU**: cabe holgadamente en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU, dado su tamano.
- **Opciones de despliegue**: paquete `kokoro` de Python con PyTorch, ONNX Runtime (full, fp16, int8) y transformers.js en navegador. Requiere `espeak-ng` instalado en el sistema.
- **Latencia y throughput**: 5,0x tiempo real en PyTorch, 5,0x en ONNX full precision y 5,9x en ONNX int8 sobre 4 hilos de un AMD EPYC 9534. El rendimiento depende del procesador y del numero de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER (fr) | UTMOS | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Canora French `louis` | 82 M | fr | 5,34% | 3,98 | Apache 2.0 | PyTorch, ONNX |
| Canora French `camille` | 82 M | fr | 6,21% | 4,10 | Apache 2.0 | PyTorch, ONNX |
| Kokoro-82M `ff_siwis` | 82 M | fr | 6,11% | 3,73 | Apache 2.0 | PyTorch, ONNX |
| Piper `fr_FR-siwis-medium` | no disponible | fr | 6,48% | 3,49 | no disponible | no disponible |
| Piper `fr_FR-tom-medium` | no disponible | fr | 6,79% | 2,95 | no disponible | no disponible |

Canora French mejora la naturalidad (UTMOS) de todas las alternativas comparadas y ofrece un WER comparable o mejor que las mejores voces Piper y que `ff_siwis`, con la ventaja anadida de dos voces y licencia Apache 2.0.

## Limitaciones y advertencias

- Solo soporta frances; no se documentan otras lenguas.
- Solo dispone de dos voces (`camille` y `louis`); no se documenta clonacion de voz ni control de estilo.
- Requiere `espeak-ng` instalado como dependencia externa para el modulo texto-a-fonema.
- La cuantizacion int8 degrada la naturalidad de forma apreciable: UTMOS cae de 4,10 a 2,92 en `camille` y de 3,98 a 3,33 en `louis`, y el WER de `camille` sube de 6,21% a 6,84%.
- No se documentan sesgos especificos del modelo; al ser un TTS, el riesgo principal es la pronunciacion incorrecta de terminos extranjeros o nombres propios no cubiertos por el modulo texto-a-fonema.
- No aplica el riesgo de alucinacion de contenido en el sentido de los LLM, pero si puede producir lecturas erroneas de cifras o abreviaturas fuera de los patrones cubiertos.
- Los resultados de benchmarks proceden del propio autor (EmpirioLabs) y no de una evaluacion independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de `espeak-ng` y del modelo base Kokoro-82M en el contexto de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/canora-french
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Web de EmpirioLabs: https://empiriolabs.ai
- Todos los modelos de EmpirioLabs: https://huggingface.co/empiriolabsai
- Plataforma de EmpirioLabs: https://platform.empiriolabs.ai
- Discord de EmpirioLabs: https://discord.gg/bM52azW4ZD
- Resultados (imagen): https://media.empiriolabs.ai/assets/hf/canora-french/v1/results.png
