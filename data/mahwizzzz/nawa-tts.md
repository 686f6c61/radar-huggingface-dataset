# mahwizzzz/Nawa-TTS

## Resumen

Nawa-TTS es un modelo de sintesis de voz (text-to-speech) para urdu desarrollado por el usuario mahwizzzz, publicado bajo licencia MIT. Se trata de un modelo compacto con dos voces (femenina y masculina) disenado para ejecutarse de forma totalmente offline sobre CPU mediante ONNX Runtime. Su principal singularidad es que es un modelo *estudiante* entrenado exclusivamente sobre habla generada por un profesor (OmniVoice) mediante destilacion de conocimiento a nivel de datos, sin requerir el profesor, un alineador forzado ni un lexico de pronunciacion en el despliegue.

La arquitectura combina un modelo acustico transformer no autorregresivo de estilo FastPitch con predictores de duracion, tono y energia a nivel de token, embeddings de hablante aprendidos, y un vocoder ConvNeXt de estilo Vocos con cabeza de STFT inversa. El modelo se distribuye en varios formatos (FP32, FP16 e INT8 dinamico en ONNX, ademas de checkpoints PyTorch), con un peso INT8 de apenas 8,6 MB, lo que lo hace apto para entornos con recursos muy limitados.

El modelo es relevante por su enfoque en un idioma con escasa cobertura en TTS (urdu) y por su diseno orientado a eficiencia: sintesis en CPU, tamano minimo y control de velocidad de habla (`pace`), con evaluacion publicada sobre 200 frases de test retenidas y dos voces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer acustico no autorregresivo estilo FastPitch (predictores de duracion, tono y energia a nivel de token, embeddings de hablante) + vocoder ConvNeXt estilo Vocos con cabeza de STFT inversa |
| Parametros totales | Variantes de 4M, 8M y 12M (variante seleccionada: 8M; recuentos exactos en `config.json`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS a nivel de frase) |
| Tipos de cuantizacion | FP32, FP16 (almacenamiento de pesos FP16, computo FP32), INT8 dinamico |
| Idiomas soportados | Urdu (`ur`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`nawa_fp32.onnx`, `nawa_fp16.onnx`, `nawa_int8.onnx`), PyTorch (`acoustic.pt`, `vocoder.pt`), `tokenizer.json`, `config.json` |

## Arquitectura y entrenamiento

El modelo acustico sigue el paradigma FastPitch: un transformer no autorregresivo que predice representaciones mel a partir de tokens de grafema, con prediccion explicita de duracion, tono (F0) y energia a nivel de token. Las duraciones provienen de un alineador aprendido conjuntamente durante el entrenamiento mediante forward-sum y MAS (Monotonic Alignment Search), que no forma parte del modelo desplegado. La salida mel se convierte en waveform a 22,05 kHz mono mediante un vocoder ConvNeXt de estilo Vocos con cabeza de STFT inversa. El control de hablante se realiza mediante embeddings aprendidos para las voces `female` y `male`.

El entrenamiento emplea destilacion de conocimiento a nivel de datos: el estudiante se entrena unicamente sobre habla generada por el profesor OmniVoice, usando el dataset `mahwizzzz/sig`, que contiene 64.749 enunciados tras filtrado (111 horas de entrenamiento), con las mismas frases en ambas voces y mayoritariamente texto formal y religioso. El texto de entrada se normaliza (conversion de puntos de codigo arabes a formas urdu, eliminacion de diacriticos, expansion de digitos a palabras numericas urdu en el sistema lakh/crore) y se tokeniza en grafemas. Se publican ablaciones que aislan el efecto de los predictores de tono y energia, los embeddings de hablante y la fusion de tokens aspirados.

## Capacidades

- Sintesis de voz en urdu a partir de texto, con salida de waveform mono a 22,05 kHz.
- Dos voces seleccionables: `female` y `male`.
- Control de velocidad de habla mediante el parametro `pace`.
- Normalizacion de texto integrada: conversion de puntos de codigo arabes, eliminacion de diacriticos y expansion de digitos a palabras urdu (sistema lakh/crore).
- Ejecucion offline en CPU mediante ONNX Runtime, sin dependencia del profesor ni de alineador forzado.
- Multiples formatos de despliegue: ONNX FP32/FP16/INT8 y checkpoints PyTorch.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: limitadas a urdu.
- Capacidades especiales: destilacion de conocimiento a nivel de datos, vocoder adversarial opcional en variantes de investigacion.

## Casos de uso

- Lectura de contenido en urdu en aplicaciones moviles offline: el modelo INT8 de 8,6 MB se puede embeber en apps Android/iOS o de escritorio y sintetizar frases sin conexion, gracias a su ejecucion en CPU via ONNX Runtime.
- Accesibilidad para personas con discapacidad visual: conversion de texto urdu (noticias, documentos, interfaces) a voz en tiempo real en dispositivos de bajos recursos, con eleccion de voz femenina o masculina.
- Asistentes de voz locales para urdu: integracion en asistentes de escritorio o domoticos que requieran privacidad total y funcionamiento sin red, usando el checkpoint INT8 o FP16.
- Sistemas de anuncios y senaletica: generacion de avisos hablados en urdu para transporte publico, aeropuertos o comercios, con control de velocidad (`pace`) para adaptar la locucion al entorno.
- Preproduccion de audiolibros y material educativo en urdu: sintesis de texto formal con las dos voces disponibles para generar borradores de narracion antes de una grabacion humana.
- Investigacion en TTS de bajos recursos: el modelo y sus recetas de entrenamiento (destilacion a nivel de datos, ablaciones publicadas) sirven como base para experimentar con otros idiomas de escasa cobertura o para estudiar el equilibrio entre tamano y calidad.
- Prototipado rapido de interfaces de voz en urdu: su API Python (`from nawa import Nawa`) y su CLI permiten integrar sintesis en pipelines de prueba sin infraestructura GPU.

## Benchmarks y rendimiento

Evaluacion sobre 200 frases de test retenidas y dos voces, sin solapamiento de texto con el entrenamiento. La inteligibilidad se mide con CER/WER de Whisper-medium tras normalizacion urdu identica de referencia y transcripcion; la similitud de hablante es coseno ECAPA frente a la rendition del profesor; UTMOS se reporta solo como senal relativa (no validado para urdu).

| Sistema | WER % | CER % | Sim. hablante | UTMOS | F0 RMSE (cents) | DTW mel |
|---|---|---|---|---|---|---|
| OmniVoice (profesor) | 12,0 [10,8; 13,2] | 3,3 [2,9; 3,8] | 1,000 | 3,72 | - | - |
| Copy-synthesis, vocoder espectral | 12,3 [11,1; 13,6] | 3,7 [3,1; 4,6] | 0,930 | 1,81 | 81 | 0,199 |
| Copy-synthesis, vocoder adversarial | 12,5 [11,4; 13,8] | 3,5 [3,1; 4,0] | 0,900 | 2,28 | 100 | 0,281 |
| Nawa-4M | 13,9 [12,7; 15,2] | 3,9 [3,6; 4,3] | 0,705 | 2,26 | 186 | 0,604 |
| Nawa-8M | 12,0 [10,8; 13,2] | 3,1 [2,8; 3,5] | 0,755 | 2,42 | 183 | 0,590 |
| Nawa-12M | 11,8 [10,7; 13,1] | 3,0 [2,7; 3,5] | 0,767 | 2,44 | 184 | 0,588 |

Resultados por hablante (seleccion y ONNX INT8):

| Sistema | Hablante | WER % | CER % | Sim. mismo hablante | Sim. cruzada | UTMOS |
|---|---|---|---|---|---|---|
| Nawa (seleccionado) | female | 13,3 [11,7; 15,0] | 3,6 [3,2; 4,1] | 0,716 | 0,152 | 2,32 |
| Nawa (seleccionado) | male | 14,6 [12,8; 16,5] | 4,2 [3,6; 4,9] | 0,694 | 0,202 | 2,20 |
| Nawa INT8 ONNX | female | 14,1 [12,4; 16,0] | 3,9 [3,4; 4,4] | 0,716 | 0,151 | 2,30 |
| Nawa INT8 ONNX | male | 14,3 [12,7; 16,1] | 4,1 [3,6; 4,7] | 0,693 | 0,205 | 2,16 |

Ablaciones destacadas (Nawa-8M): eliminar los embeddings de hablante degrada la similitud de hablante a 0,443 y el F0 RMSE a 496 cents; eliminar tono y energia sube el F0 RMSE a 208 cents; un vocoder solo espectral mejora el CER a 2,9 pero reduce UTMOS a 1,90.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el camino ONNX CPU; para los checkpoints PyTorch, el modelo de 8M parametros ocupa decenas de MB, por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: no necesarias; el modelo esta disenado para CPU via ONNX Runtime. En GPU, cualquier tarjeta moderna (RTX 4090, A100, H100) ejecutaria la inferencia con margen amplio.
- Cabe en GPU consumer: si, en cualquier GPU consumer, e incluso en CPU de gama baja.
- Opciones de despliegue: ONNX Runtime (via paquete `nawa`), PyTorch (`Nawa(backend="torch")`), CLI `python -m nawa`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada (la tabla de eficiencia CPU aparece truncada en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nawa-TTS | 4M / 8M / 12M | No aplica | Urdu | MIT | ONNX, PyTorch | TTS compacto en CPU, dos voces, destilado de OmniVoice |
| OmniVoice (profesor) | No disponible | No aplica | No disponible | No disponible | No disponible | Profesor usado para generar los datos de entrenamiento; mejor WER/CER y similitud de hablante en la evaluacion |
| Alternativas TTS multilingues de gran tamano | No disponible | No aplica | Multiples | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion sobre otros modelos TTS de urdu comparables en la documentacion facilitada.

## Limitaciones y advertencias

- El modelo solo soporta urdu; no es multilingue.
- La similitud de hablante respecto al profesor es moderada (0,69-0,72), inferior a la de sistemas de copy-synthesis.
- El F0 RMSE es elevado (aproximadamente 183-186 cents en las variantes de 8M y 12M), lo que indica desviaciones de entonacion respecto al profesor.
- UTMOS no esta validado para urdu; debe interpretarse solo como senal relativa.
- Las valoraciones humanas provienen de un unico oyente ciego (el autor), por lo que no constituyen una evaluacion subjetiva robusta.
- El dataset de entrenamiento es mayoritariamente texto formal y religioso, lo que puede limitar la naturalidad en registros coloquiales o informales.
- Riesgo de alucinacion o errores de pronunciacion en palabras fuera del dominio de entrenamiento o en neologismos.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias explicitas sobre sesgos o adecuacion a dominios sensibles.
- El modelo depende de la normalizacion de texto incluida; entradas con caracteres no contemplados pueden producir pronunciaciones incorrectas.
- No se documentan datos de latencia o throughput completos, lo que dificulta estimar requisitos de produccion a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/mahwizzzz/Nawa-TTS
- Repositorio GitHub (codigo, recetas de entrenamiento y evaluacion completa): https://github.com/mwzkhalil/nawa-tts
- Dataset de entrenamiento: https://huggingface.co/datasets/mahwizzzz/sig
- Paper referenciado en los tags: arXiv:2604.00688 (https://arxiv.org/abs/2604.00688)
- Muestras de audio: carpeta `samples/` del repositorio de Hugging Face (indice en `samples/index.csv`)
- Declaracion de datos: `DATA_STATEMENT.md` en el repositorio de Hugging Face
