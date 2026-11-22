# Phoonnx/vits-cs_cz-kasandra_v3-medium-espeak

## Resumen

vits-cs_cz-kasandra_v3-medium-espeak es un modelo de síntesis de voz (text-to-speech) en checo (cs-CZ) basado en la arquitectura VITS, en el formato y el ecosistema de Piper. Lo publica Phoonnx (TigreGotico Lda), que lo ha convertido a ONNX a partir de la voz original `cs_CZ-kasandra_v3` de Ondřej Šimek (ondrazarici), distribuida en el repositorio `rhasspy/piper-voices`. Se trata de una voz monohablante de 22050 Hz que toma como entrada fonemas generados por espeak-ng en alfabeto IPA y produce audio de forma local y ligera.

El modelo no es un LLM ni un sistema de TTS neuronal de gran escala: es un modelo VITS compacto, pensado para inferencia en CPU y en entornos con recursos limitados. El repositorio ocupa 0,1 GB e incluye los grafos ONNX en fp32 (63,5 MB) y sus copias cuantizadas int8 (19,3 MB), lo que permite integrarlo en asistentes de voz, aplicaciones de escritorio o servicios embebidos sin GPU dedicada.

Su relevancia actual es la de un componente de infraestructura: una voz checa más dentro del catálogo de phoonnx y del ecosistema OVOS (Open Voice OS), con licencia CC BY 4.0 y una verificación de calidad publicada mediante ASR. No aporta innovaciones arquitectónicas, pero sí una opción práctica y reproducible para TTS en checo con despliegue sencillo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | fp32 e int8 (cuantización dinámica con onnxruntime.quantization.quantize_dynamic, pesos QInt8) |
| Idiomas soportados | checo (cs-CZ) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (grafo fp32 e int8) |

Otros datos técnicos: frecuencia de muestreo de 22050 Hz, un solo hablante, entrada de texto convertida a fonemas con espeak-ng (voz `cs`) en alfabeto IPA, y soporte de puntuación de cláusula (`,` `.` `!` `?` `:` `;`) conservada en la síntesis desde phoonnx 1.96.1a1.

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo de TTS de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial en entrenamiento, con salida de audio a 22050 Hz. En este caso se usa la variante y el pipeline de Piper, con fonemización previa mediante espeak-ng. El modelo es monohablante y no incorpora control de prosodia más allá de la puntuación de cláusula.

Los datos de entrenamiento no están registrados en el repositorio upstream: la model card indica explícitamente «Training data: Not recorded upstream» y «Base model: Not recorded». La información disponible señala que las grabaciones originales son del autor, Ondřej Šimek (ondrazarici), y que esta versión es un ajuste fino adicional de `cs_CZ-kasandra-medium`. No se documentan número de horas de audio, composición del corpus ni técnicas de RLHF o DPO (no aplicables a este tipo de modelo). La conversión a ONNX no altera los pesos; las copias int8 sí los cuantizan.

## Capacidades

- Síntesis de voz monohablante en checo (cs-CZ) a partir de texto.
- Fonemización con espeak-ng (voz `cs`) en alfabeto IPA como paso previo a la síntesis.
- Conservación de la puntuación de cláusula (`,` `.` `!` `?` `:` `;`) en la síntesis con phoonnx 1.96.1a1 o posterior.
- Inferencia en CPU sin GPU, con grafos ONNX fp32 e int8.
- Integración con el gestor de modelos de phoonnx (`TTSModelManager`) y con el plugin `ovos-tts-plugin-phoonnx` para OVOS.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Asistentes de voz locales: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para responder en checo sin depender de servicios en la nube, gracias al tamaño reducido del grafo int8 (19,3 MB).
- Lectura de contenido en aplicaciones de escritorio o móviles: conversión de artículos, notificaciones o interfaces a voz checa con un modelo que cabe en memoria modesta (RSS máximo medido de 241,3 MB en int8).
- Sistemas embebidos y de bajo consumo: el RTF medido de 0,033 en fp32 y 0,090 en int8 sobre un Intel i9-11900H permite síntesis más rápida que tiempo real en CPU, adecuada para dispositivos sin acelerador.
- Accesibilidad: lectura en voz alta de texto para usuarios con discapacidad visual en aplicaciones checas, con licencia CC BY 4.0 que facilita su redistribución con atribución.
- Generación de audiolibros o contenido pregrabado por lotes: la velocidad de síntesis y el bajo coste computacional permiten procesar grandes volúmenes de texto sin infraestructura GPU.
- Pruebas y desarrollo de pipelines de voz: al ser un modelo pequeño y con verificación ASR publicada (WER 0,000 en int8 y 0,087 en fp32 sobre tres frases de FLORES-200 devtest), sirve como referencia reproducible en evaluaciones de TTS checo.
- Locuciones para prototipos y demos: sustitución rápida de TTS comerciales en entornos de desarrollo con requisitos mínimos de hardware.

## Benchmarks y rendimiento

La model card publica una verificación de calidad mediante ASR (nemo-parakeet-tdt-0.6b-v3 int8) sobre tres frases de FLORES-200 devtest, además de métricas de tamaño y velocidad medidas en un Intel Core i9-11900H a 2,50 GHz con 4 hilos:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,087 | 0,000 |
| Caracteres por segundo | 13,2 a 14,3 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,95 a 0,99 |
| Tamano del grafo | 63,5 MB | 19,3 MB |
| RSS maximo | 288,8 MB | 241,3 MB |
| RTF (mediana de 3) | 0,033 | 0,090 |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS (MOS, MCD u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU y no requiere GPU.
- GPU recomendadas: no disponibles ni necesarias; el modelo se ejecuta en CPU.
- Cabe en cualquier equipo de consumo: el grafo int8 ocupa 19,3 MB en disco y el pico de RSS medido es de 241,3 MB en int8 y 288,8 MB en fp32.
- Opciones de despliegue: phoonnx (con `pip install --pre phoonnx`), el plugin `ovos-tts-plugin-phoonnx` para OVOS y ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: RTF de 0,033 en fp32 y 0,090 en int8 sobre un Intel i9-11900H con 4 hilos, es decir, entre 11 y 30 veces más rápido que tiempo real en ese equipo. Se requiere espeak-ng instalado (por ejemplo `apt install espeak-ng`) o la variante `phoonnx[espeak]`, que usa espyak y puede pronunciar mal algunas palabras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| vits-cs_cz-kasandra_v3-medium-espeak (este) | VITS (Piper), ONNX | cs-CZ | 63,5 MB fp32 / 19,3 MB int8 | CC BY 4.0 | Voz monohablante, fonemización con espeak-ng, QA con WER publicado |
| cs_CZ-kasandra-medium (upstream, rhasspy/piper-voices) | VITS (Piper) | cs-CZ | no disponible | no disponible en la información proporcionada | Modelo base del que deriva este ajuste fino; esta versión es un fine-tune adicional |
| Otras voces Piper en checo | VITS (Piper) | cs-CZ | variable | variable según voz | Misma familia y pipeline; no se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks comunes (MOS, WER sobre el mismo conjunto) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo monohablante y limitado al checo (cs-CZ); no soporta otros idiomas ni cambio de hablante.
- La fonemización depende de espeak-ng; con la variante espyak algunas palabras pueden pronunciarse mal, según advierte la propia model card.
- La verificación de calidad se basa en solo tres frases de FLORES-200 devtest, por lo que el WER de 0,000 en int8 no debe interpretarse como una garantía general de precisión.
- Los datos de entrenamiento no están documentados, lo que impide evaluar sesgos o cobertura del dominio; no se dispone de información sobre sesgos conocidos.
- Riesgo de alucinación no aplicable en el sentido de los LLM, pero sí de errores de pronunciación o prosodia en palabras fuera del dominio de entrenamiento.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio acreditar a Ondřej Šimek (ondrazarici) al usar la voz.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (22 de noviembre de 2026), por lo que carece de validación comunitaria.
- No se documenta soporte para control de emoción, velocidad ajustable más allá de lo que permita phoonnx, ni SSML avanzado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-cs_cz-kasandra_v3-medium-espeak
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Pull request upstream en rhasspy/piper-voices: https://huggingface.co/rhasspy/piper-voices/discussions/101
- Discusión de grabaciones originales (rhasspy/piper-voices pull request #93): https://huggingface.co/rhasspy/piper-voices/discussions/93
- TigreGotico: https://tigregotico.pt
