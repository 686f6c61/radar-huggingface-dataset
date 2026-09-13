# Heitorkk2/Kitsune-TTS-V1

## Resumen

Kitsune-TTS V1 es un modelo de sintesis de voz (text-to-speech) compacto y no autoregresivo desarrollado por el usuario Heitorkk2, publicado en HuggingFace bajo licencia GPL-3.0. Esta construido sobre la arquitectura VITS2-Slim, con prediccion estocastica de duracion y embeddings de hablante, y cuenta con aproximadamente 39 millones de parametros (unos 76 MB en FP16 y 151 MB en FP32). El modelo esta entrenado exclusivamente para portugues de Brasil (PT-BR) y genera audio mono a 22.050 Hz.

Su propuesta de valor es el tamano reducido combinado con inferencia en CPU: segun las mediciones del propio autor, sintetiza 9,21 segundos de audio en 2,06 segundos sobre un AMD Ryzen 7 5700U de 8 hilos usando el modo `fast_cpu` de PyTorch, lo que equivale a un factor de tiempo real (RTF) de 0,224. Incorpora cinco voces predefinidas con estilos asociados a personajes de anime (Emilia, Frieren, Zero Two, Violet e Hiro), lo que lo orienta a asistentes virtuales, prototipos de doblaje y aplicaciones de entretenimiento en portugues.

El modelo se distribuye en tres formatos: dos checkpoints de PyTorch (FP32 y FP16) y un grafo ONNX de fichero unico en FP32 de aproximadamente 115 MB, pensado para inferencia en CPU y en navegador mediante ONNX Runtime. No se publican variantes cuantizadas a INT8 o INT4. La ficha contiene benchmarks medidos por el autor, pero no incluye informacion sobre el volumen o la composicion exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS2-Slim, no autoregresiva, con prediccion estocastica de duracion y embeddings de hablante |
| Parametros totales | Aproximadamente 39 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo TTS no autoregresivo, sin ventana de contexto) |
| Tipos de cuantizacion | Sin cuantizacion. Se publican pesos FP32 y FP16; el grafo ONNX es FP32 |
| Idiomas soportados | Portugues de Brasil (PT-BR) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (`.pth`) y ONNX (`.onnx`), acompanados de `model_config.json` |
| Frecuencia de muestreo | 22.050 Hz, mono |
| Voces incluidas | 5 (Emilia, Frieren, Zero Two, Violet, Hiro) |
| Tamano de los ficheros | FP16 ~76 MB, FP32 ~151 MB, ONNX FP32 ~115 MB, config ~1 KB |
| Fonemizador requerido | eSpeak NG (instalacion a nivel de sistema) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |
| Fechas | Creado el 02-09-2026; actualizado el 12-09-2026 |

## Arquitectura y entrenamiento

La arquitectura declarada es VITS2-Slim, una variante reducida del modelo VITS2 (referencia arXiv:2307.16430). Se trata de un sistema de sintesis extremo a extremo y no autoregresivo que combina un codificador de texto, prediccion estocastica de duracion para alinear texto y audio, y un decoder generativo que produce la forma de onda directamente. La seleccion de voz se realiza mediante embeddings de hablante, lo que permite servir cinco voces distintas desde un unico conjunto de pesos. El condicionamiento textual pasa por fonemizacion con eSpeak NG antes de entrar al modelo.

En cuanto a los datos de entrenamiento, la model card indica que el modelo se entreno con datos sinteticos para obtener voces expresivas de estilo anime, pero no especifica el numero de horas de audio, el numero de tokens, la composicion del dataset ni el procedimiento de entrenamiento (no se menciona RLHF, DPO ni ningun esquema de ajuste por preferencias). Tampoco se documenta el proceso de clonacion o definicion de las cinco voces a partir de los personajes originales. La model card se corta en la seccion "Add your own voice", por lo que no se dispone del detalle sobre fine-tuning o entrenamiento de voces adicionales.

## Capacidades

- Sintesis de voz en portugues de Brasil (PT-BR) a partir de texto plano, con salida mono a 22.050 Hz.
- Seleccion entre cinco voces predefinidas mediante clave textual en la API de Python (`emilia`, `frieren`, `zerotwo`, `violet`, `hiro`) o identificador numerico (0-4) en el cliente de JavaScript.
- Estilos vocales diferenciados por personaje: Emilia (suave y dulce), Frieren (calmada y serena), Zero Two (energica y juguetona), Violet (formal y expresiva) e Hiro (voz masculina juvenil y calmada).
- Inferencia sin GPU: modo `fast_cpu` de PyTorch y ruta ONNX Runtime para CPU.
- Ejecucion en navegador o Node.js mediante el grafo ONNX de fichero unico y el cliente JavaScript del repositorio.
- Control de expresividad mediante parametros de sintesis como `noise_scale` (los benchmarks se midieron con `noise_scale=0`).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente acustico.
- No se declaran capacidades de vision, audio de entrada, clonacion de voz en tiempo de inferencia ni traduccion entre idiomas.

## Casos de uso

- Asistentes virtuales en portugues de Brasil: el modelo puede generar respuestas habladas con una latencia de 200 ms para unos 10 segundos de audio sobre una GPU Tesla T4, lo que lo hace viable en flujos conversacionales donde el usuario percibe la respuesta como inmediata.
- Prototipado de doblaje de anime y contenido de entretenimiento: las cinco voces con estilos ligados a personajes permiten montar pruebas de doblaje o fan-dubs en PT-BR sin contratar locutores, siempre que se respete la licencia GPL-3.0 y los derechos sobre los personajes.
- Despliegue en dispositivos sin GPU: con un checkpoint FP16 de 76 MB y un RTF de 0,224 en un Ryzen 7 5700U, el modelo cabe en portatiles modestos, mini-PC o servidores de bajo coste y sintetiza mas rapido que tiempo real.
- Lectura de textos y audiolibros en PT-BR: la inferencia local permite procesar lotes largos por capitulos sin depender de APIs externas ni pagar por caracter.
- Sintesis en el navegador para aplicaciones web: el grafo ONNX de 115 MB con ONNX Runtime Web permite generar voz en el cliente, evitando enviar texto del usuario a un servidor.
- Sistemas de IVR y telefonia en portugues: al ser no autoregresivo y de baja latencia, puede integrarse en centralitas o backends de voz que necesitan responder por turnos cortos.
- Prototipos de VTube y avatares animados: la seleccion de voz por personaje y el control de `noise_scale` facilitan ajustar el tono de un avatar concreto en demos interactivas.
- Accesibilidad y lectura asistida: conversion de texto a voz en aplicaciones de lectores de pantalla o ayudas a la lectura para hablantes de PT-BR, ejecutandose en local.
- Generacion de datos sinteticos de audio: al producirse de forma local y gratuita, el modelo puede usarse para crear corpus de audio en PT-BR destinados a otros experimentos de reconocimiento de voz.

## Benchmarks y rendimiento

Los siguientes datos provienen de las mediciones publicadas por el autor en la model card, sintetizando 9,21 segundos de audio con `noise_scale=0`, voz Frieren, calculo FP32, sin cuantizacion y pesos identicos entre ejecuciones:

| Dispositivo | Backend | Checkpoint | Latencia | RTF | Factor tiempo real |
|---|---|---|---|---|---|
| CPU local (AMD Ryzen 7 5700U, 8 hilos) | PyTorch (`fast_cpu`) | FP16 (~76 MB) | 2,06 s | 0,224 | 4,46x |
| CPU local (AMD Ryzen 7 5700U, 8 hilos) | PyTorch (`fast_cpu`) | FP32 (~151 MB) | 2,17 s | 0,235 | 4,25x |
| CPU local (AMD Ryzen 7 5700U, 8 hilos) | ONNX Runtime CPU | FP32 ONNX (~115 MB) | 2,38 s | 0,259 | 3,86x |
| CPU local (AMD Ryzen 7 5700U, 8 hilos) | PyTorch (estandar) | FP32 (~151 MB) | 3,84 s | 0,417 | 2,40x |
| GPU en nube (Tesla T4, 15 GB) | PyTorch (CUDA) | FP16 (~76 MB) | 0,20 s | 0,022 | 46,0x |

El autor afirma que el modo `fast_cpu` de PyTorch ofrece una mejora de velocidad de aproximadamente 1,96x frente a PyTorch CPU estandar, superando a ONNX Runtime con fidelidad de audio identica. No se han publicado resultados de benchmarks de calidad subjetiva (MOS) ni comparaciones objetivas con otros sistemas TTS en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no se publica cifra de VRAM. Con 39 millones de parametros, el checkpoint FP16 ocupa unos 76 MB y el FP32 unos 151 MB, por lo que el consumo de memoria es muy bajo en cualquier GPU moderna.
- GPU recomendadas: la unica GPU medida por el autor es una Tesla T4 de 15 GB, con 0,20 s de latencia para 9,21 s de audio (RTF 0,022). No se han publicado mediciones en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual (RTX 3060, 4060, 4090, etc.) por el tamano del modelo; no se aportan cifras concretas para estos modelos.
- Ejecucion sin GPU: si. El modo `fast_cpu` de PyTorch alcanza RTF 0,224 y ONNX Runtime CPU RTF 0,259 en un Ryzen 7 5700U de 8 hilos, ambos por debajo de 1,0 (mas rapido que tiempo real).
- Opciones de despliegue: PyTorch (CPU y CUDA), ONNX Runtime para CPU y para navegador/Node.js mediante el cliente JavaScript del repositorio. No se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: 2,06 s para 9,21 s de audio en CPU con `fast_cpu`+FP16 y 0,20 s en Tesla T4 con FP16. No se publican cifras de throughput agregado ni de sintesis por lotes.
- Requisito adicional: eSpeak NG debe instalarse a nivel de sistema para la fonemizacion del texto.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones con otros sistemas TTS. La tabla siguiente situa el modelo frente a alternativas de la misma categoria a partir de conocimiento general de cada proyecto, no de datos verificados dentro de esta ficha; los valores de los competidores deben contrastarse con su documentacion oficial.

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kitsune-TTS V1 | ~39 M | PT-BR unicamente | VITS2-Slim (no autoregresiva) | GPL-3.0 (copyleft) | Pesos .pth y .onnx en HuggingFace |
| Piper (referencia externa) | Del orden de decenas de millones por voz (no disponible) | Multiples idiomas con voces separadas por idioma | VITS | MIT en el software; licencia de cada voz variable | Pesos ONNX por voz |
| Kokoro-82M (referencia externa) | ~82 M | Principalmente ingles (no disponible) | Familia StyleTTS2 | Apache-2.0 | Pesos en HuggingFace |
| XTTS v2 de Coqui (referencia externa) | ~467 M | Multilingue (no disponible) | Autoregresiva con clonacion de voz | Coqui Public Model License (uso comercial restringido) | Pesos en HuggingFace |

Diferencias destacables: Kitsune-TTS V1 es el unico de la lista orientado en exclusiva a PT-BR con voces de estilizacion anime, y su licencia GPL-3.0 es la mas restrictiva para productos propietarios. No hay datos de rendimiento comparativo (MOS, similitud de hablante o inteligibilidad) para establecer una jerarquia de calidad.

## Limitaciones y advertencias

- Licencia GPL-3.0: es una licencia copyleft. Integrar el modelo en un producto propietario puede obligar a liberar el codigo derivado bajo los mismos terminos; conviene revision legal antes de un uso comercial.
- Voces basadas en personajes de anime: los nombres y estilos (Re:Zero, Frieren, Darling in the Franxx, Violet Evergarden) remiten a obras con derechos de autor y marcas registradas, lo que anade riesgo legal independientemente de la licencia del software.
- Datos de entrenamiento sinteticos y no documentados: no se especifica el volumen, la procedencia ni el idioma nativo de los hablantes de origen, lo que dificulta evaluar sesgos de pronunciacion, acento o registro.
- Cobertura idiomatica limitada a PT-BR: el modelo no esta preparado para castellano ni para otros idiomas; alimentarlo con texto en otro idioma producira una pronunciacion incorrecta.
- Ausencia de cuantizacion: no hay variantes INT8 o INT4 publicadas, de modo que el despliegue en entornos muy restringidos depende del FP16 o del grafo ONNX FP32 de 115 MB.
- Artefactos de audio y errores de pronunciacion: al ser un modelo acustico, puede generar inestabilidades, ruido o entonacion incorrecta con texto fuera de dominio, signos de puntuacion atipicos, numeros o abreviaturas.
- Dependencia externa de eSpeak NG: la fonemizacion es un paso obligatorio y su calidad condiciona directamente el resultado; ademas anade un requisito de instalacion a nivel de sistema.
- Modelo con adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, y la model card esta truncada en la seccion de voces personalizadas, lo que reduce la evidencia disponible sobre robustez en produccion.
- Sin garantias de fidelidad de las cifras: los benchmarks de latencia y RTF los publica el propio autor y no se han replicado de forma independiente.
- No aplica el concepto habitual de alucinacion de texto, pero si el de contenido vocal no solicitado o mal alineado cuando el texto de entrada es ambiguo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Heitorkk2/Kitsune-TTS-V1
- Repositorio GitHub del proyecto: https://github.com/Heitorkk2/Kitsune-TTS
- Cliente JavaScript: https://github.com/Heitorkk2/Kitsune-TTS/tree/main/clients/js
- Guia de exportacion a ONNX: https://github.com/Heitorkk2/Kitsune-TTS/blob/main/examples/export/README.md
- Resultados de benchmarks en crudo: https://github.com/Heitorkk2/Kitsune-TTS/blob/main/examples/benchmark/BENCHMARK_RESULTS.md
- Paper de referencia de la arquitectura (VITS2, arXiv:2307.16430, citado en los tags del modelo): https://arxiv.org/abs/2307.16430
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas de soporte de Microsoft y no guardan relacion con Kitsune-TTS V1.
