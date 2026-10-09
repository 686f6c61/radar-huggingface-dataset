# ozcancelik/antalia-1-onnx

## Resumen

Antalia 1 ONNX es la conversion a formato ONNX del modelo de sintesis de voz (text-to-speech) en turco Antalia 1, desarrollado originalmente por Sezgin Saygili, Emre Kaplaner, Oncel Ozgul y Fikri San Koktas (Patientdesk.ai) y publicado por el usuario ozcancelik como derivado no oficial. El objetivo es permitir la inferencia completa de un sistema TTS en el navegador mediante onnxruntime-web y WebGPU, sin depender de Python ni de servidores con GPU dedicada. El repositorio ocupa 0,9 GB y se distribuye bajo la licencia Antalia OpenRAIL-M, la misma del modelo base.

Tecnicamente es un sistema de dos etapas mas vocoder: un codificador de texto con cabecera de duracion, un modelo acustico basado en flow matching que genera mel-espectrogramas, y el vocoder NVIDIA BigVGAN v2 a 24 kHz. Los pesos se han dividido en tres grafos ONNX (`text.onnx`, `flow.onnx` y `vocoder.onnx`), con atencion escrita de forma explicita en lugar de `nn.MultiheadAttention`. La voz publicada (`voicedata-candidate-b`) esta fijada como constante dentro del grafo, de modo que no se pueden seleccionar las otras 1.501 voces del modelo original.

Es relevante porque demuestra un pipeline TTS multitono completo ejecutable en cliente con WebGPU, con cuantizacion mixta fp16/fp32 seleccionada especificamente para evitar errores numericos en WebGPU, y porque documenta con detalle las modificaciones exigidas por la clausula 4 de la licencia OpenRAIL-M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en dos etapas: codificador de texto con cabecera de duracion + modelo acustico de flow matching (Euler guiado) + vocoder BigVGAN v2 (24 kHz, 100 bandas mel, factor 256x) |
| Parametros totales | no disponible (el repositorio solo publica tamanos de archivo: 78 MB + 570 MB + 252 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el cliente trocea el texto en clausulas de 120 caracteres o menos y aplica un suelo de 0,085 s de frames por caracter |
| Tipos de cuantizacion | `text.onnx` en fp32; `flow.onnx` y `vocoder.onnx` en fp16 con islas fp32 (proyeccion de salida, angulos sinusoidales, LayerNorm, Softmax, `Sin` de las activaciones snake y todas las `ConvTranspose`). No se publican variantes INT8 ni GGUF |
| Idiomas soportados | turco (`tr`) |
| Licencia | antalia-openrail-m (Antalia OpenRAIL-M, `license: other`) |
| Formato de pesos | ONNX, opset 17, tres grafos (`text.onnx`, `flow.onnx`, `vocoder.onnx`) mas `meta.json` |

## Arquitectura y entrenamiento

Los pesos ONNX derivan de los pesos EMA de `cloud0day3/antalia-1` (revision `eaec2aad`), convertidos a ONNX opset 17 y divididos en tres grafos. El primero, `text.onnx` (78 MB, fp32), es el codificador de texto junto con la cabecera de duracion: recibe ids `[1, L]` int64 y devuelve un contexto `[1, L, 768]` y `log_frames [1]`. El segundo, `flow.onnx` (570 MB), ejecuta un unico paso Euler guiado del modelo acustico con entradas `x [1, T, 100]`, `t`, `dt`, `ctx [2, L, 768]`, `tmask [2, L]`, `prosody [1, 6]`, `guidance` y `rescale`, y salida `x_next [1, T, 100]`. El tercero, `vocoder.onnx` (252 MB), aplica la desnormalizacion mel (media -7,139, desviacion tipica 2,791) y BigVGAN v2 para producir audio mono a 24 kHz.

No se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, porque la model card describe unicamente la conversion. Las modificaciones respecto al original son: atencion escrita explicitamente (la matematica no cambia), integracion de la guia libre de clasificador (CFG), el `guidance rescale`, la actualizacion de Euler y el recorte mel de ±5 dentro del grafo, con las pasadas condicionada y sin texto compartiendo una unica ejecucion de batch 2. La voz liberada queda como constante en `flow.onnx` y las otras 1.501 voces no se incluyen. No se han portado la seleccion best-of-8 (requiere Whisper y WavLM) ni el fijado de envolvente de ruido.

El detalle de ingenieria mas relevante es la precision mixta por operador: el autor justifica que `Sin` y `ConvTranspose` dan resultados incorrectos en fp16 sobre WebGPU. Como referencia de fidelidad, en fp32 el ONNX coincide con PyTorch hasta 1e-5 en mel; en Chrome sobre GPU de Apple la mel difiere un 8 % RMS respecto a fp32 y la distancia log-espectral del audio es 1,7, frente a 4,6 para una semilla de ruido distinta.

## Capacidades

- Sintesis de voz en turco a partir de texto, con salida mono a 24 kHz.
- Control de prosodia mediante los presets incluidos en `meta.json` (vector `prosody` de 6 dimensiones).
- Guia libre de clasificador configurable (`guidance` 4,0 por defecto) y reescalado (`rescale` 0,5).
- Inferencia en navegador con onnxruntime-web y WebGPU, sin backend Python.
- Normalizacion de texto, troceado en clausulas y bucle de muestreo implementados en JavaScript en la demo del cliente.
- Voz unica: la voz `voicedata-candidate-b` esta fijada como constante; no hay seleccion de hablante ni clonacion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de audio, no un modelo de lenguaje.
- No se documentan capacidades multilingues mas alla del turco.

## Casos de uso

- Lectura por voz integrada en aplicaciones web: el modelo puede ejecutarse en el propio navegador con WebGPU, de modo que un lector de articulos o un asistente de accesibilidad sintetiza texto sin enviar contenido a un servidor.
- Audiolibros y contenido largo en turco: el troceado en clausulas de 120 caracteres o menos permite procesar parrafos extensos por fragmentos y encadenar el audio resultante.
- Prototipado de productos de voz sin infraestructura GPU: con 0,9 GB de pesos, un equipo de desarrollo puede validar una experiencia TTS completa antes de invertir en servidores de inferencia.
- Sistemas de anuncios por megafonia o avisos automatizados en turco, siempre que se cumpla la obligacion de divulgar que la voz es sintetica en cualquier contexto donde un oyente pueda creer lo contrario.
- Generacion de material de aprendizaje de turco: al ser una voz fija y controlable mediante prosodia, sirve para producir ejemplos de pronunciacion consistentes.
- Pruebas de regresion de pipelines TTS: los hashes SHA-256 y la tolerancia documentada frente a PyTorch (1e-5 en mel en fp32) permiten usar los grafos como referencia numerica en integracion continua.
- Demos y experimentos de investigacion sobre flow matching y vocoders en el navegador, incluida la comparacion de la precision fp16 frente a fp32 en WebGPU.
- Cualquier uso debe respetar las restricciones de la licencia: queda prohibido suplantar a personas reales, presentar la salida como grabacion humana, fraudes, llamadas automatizadas no solicitadas, contenido sexual, violento o de acoso en esta voz, y la creacion de datasets de clonacion de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye medidas de fidelidad numerica frente a la implementacion en PyTorch:

| Medida | Valor |
|---|---|
| ONNX fp32 frente a PyTorch (mel) | coincide hasta 1e-5 |
| Diferencia RMS de la mel en Chrome sobre GPU de Apple (fp16) | 8 % respecto a fp32 |
| Distancia log-espectral del audio frente a la referencia fp32 | 1,7 (frente a 4,6 con otra semilla de ruido) |
| Objetivos de evaluacion subjetiva (MOS) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-1,5 GB solo para pesos (78 MB + 570 MB + 252 MB) y aproximadamente 2-3 GB contando activaciones y buffers del grafo `flow.onnx`, que se ejecuta 16 o 32 veces por utterance. Estimacion derivada del tamano de los archivos, no publicada por el autor.
- GPU de escritorio: cualquier GPU moderna con soporte WebGPU es suficiente por tamano de pesos; no se documentan requisitos minimos concretos.
- GPU de centro de datos (A100, H100): no aportan ventaja relevante para este modelo por su tamano; estan sobredimensionadas salvo para servir muchas peticiones concurrentes.
- Consumer GPU: si, cabe con holgura en tarjetas con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090, entre otras), y el objetivo declarado es su ejecucion en navegador con WebGPU.
- Opciones de despliegue: onnxruntime-web (WebGPU) en navegador, onnxruntime en Python/C++ y, en general, cualquier runtime compatible con ONNX opset 17. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste depende directamente del numero de pasos Euler (16 o 32) y de la longitud de `T`, que se calcula a partir de la duracion estimada y del suelo de 0,085 s por caracter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ozcancelik/antalia-1-onnx | no disponible (repo de 0,9 GB) | no aplica; troceado a 120 caracteres | Sin benchmarks publicados | Antalia OpenRAIL-M | ONNX opset 17, tres grafos, voz unica |
| cloud0day3/antalia-1 (modelo base) | no disponible | no aplica | Sin benchmarks publicados | Antalia OpenRAIL-M | PyTorch, 1.502 voces, seleccion best-of-8 |
| Otros modelos TTS en turco | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de la misma categoria no puede completarse porque la informacion proporcionada no incluye especificaciones de otros sistemas TTS en turco.

## Limitaciones y advertencias

- Una sola voz: el hablante esta fijado como constante en `flow.onnx` y no se incluyen los otros 1.501 identificadores de hablante del modelo original.
- Perdida de calidad en fp16 sobre WebGPU: la propia model card reporta un 8 % de diferencia RMS en la mel y una distancia log-espectral de 1,7 frente a la referencia fp32.
- Faltan componentes del pipeline original: no se incluyen la seleccion best-of-8 (necesita Whisper y WavLM) ni el fijado de envolvente de ruido, por lo que la calidad puede ser inferior a la del modelo completo.
- Idioma unico: solo turco. El texto debe normalizarse y pasar a minusculas antes de mapearlo con el vocabulario de `meta.json`; los caracteres desconocidos se descartan.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, ruido o artefactos, especialmente en texto fuera de dominio o con numeros y abreviaturas mal normalizados.
- Sesgos: no se documenta ningun analisis de sesgos de la voz sintetizada; no hay datos al respecto.
- Licencia restrictiva: Antalia OpenRAIL-M exige redistribuir el texto de la licencia, mantener la atribucion y hacer cumplir las restricciones del parrafo 5 y el anexo A a los usuarios. Se prohibe suplantar a personas reales (incluida la actriz de doblaje), presentar la salida como grabacion humana, fraudes y ingenieria social, llamadas o mensajes automatizados no solicitados, contenido sexual, violento o de acoso en esta voz, y crear datasets de clonacion presentados como la voz de una persona real.
- Obligacion de divulgacion: todo audio generado es sintetico y debe indicarse a los oyentes siempre que pudieran creer lo contrario.
- No es una version oficial: el autor de la conversion no esta respaldado por los autores de Antalia 1.
- Vocoder con licencia distinta: BigVGAN v2 se distribuye bajo licencia MIT, que convive con la OpenRAIL-M del conjunto.

## Enlaces

- Repositorio ONNX: https://huggingface.co/ozcancelik/antalia-1-onnx
- Modelo base: https://huggingface.co/cloud0day3/antalia-1
- Codigo original de Antalia: https://github.com/0daycloud/antalia
- Vocoder NVIDIA BigVGAN v2: https://huggingface.co/nvidia/bigvgan_v2_24khz_100band_256x
- Licencia del derivado (LICENSE.md): https://huggingface.co/ozcancelik/antalia-1-onnx/blob/main/LICENSE.md
- Licencia de BigVGAN (LICENSE-BigVGAN): https://huggingface.co/ozcancelik/antalia-1-onnx/blob/main/LICENSE-BigVGAN
