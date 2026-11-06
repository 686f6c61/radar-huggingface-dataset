# sil-ai/yao_tts_yao

## Resumen

yao_tts_yao es un modelo de sintesis de voz (text-to-speech) obtenido mediante fine-tuning de microsoft/speecht5_tts, publicado por el usuario sil-ai en Hugging Face. Se trata de un ajuste sobre la arquitectura SpeechT5 de Microsoft, un modelo encoder-decoder que combina representaciones de habla y texto para tareas de conversion texto-a-audio. El modelo cuenta con 144.435.426 parametros y un repositorio de 1,7 GB en formato safetensors.

El modelo resuelve la generacion de audio a partir de texto, presumiblemente especializado en una voz o dominio concreto (el sufijo "yao" sugiere un hablante o conjunto de datos especifico), aunque la model card no documenta ni el dataset de entrenamiento ni el hablante objetivo. La informacion disponible es muy limitada: la model card fue generada automaticamente por el Trainer de Hugging Face y contiene multiples secciones marcadas como "More information needed".

Su relevancia es acotada: se trata de un fine-tune de bajo perfil (38 descargas, 0 likes en el momento de la consulta) sin benchmarks publicados ni documentacion de uso previsto. Resulta util como ejemplo de ajuste de SpeechT5 para una voz concreta, pero no constituye una opcion robusta para produccion sin validacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder transformer para habla y texto) |
| Parametros totales | 144.435.426 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SpeechT5, una arquitectura encoder-decoder de Microsoft que unifica el procesamiento de habla y texto mediante representaciones compartidas. SpeechT5 emplea un encoder de texto, un encoder de habla, un decoder y un postnet, con cabezas especificas para TTS, reconocimiento de voz y otras tareas. En el caso de TTS, el modelo recibe texto tokenizado y un speaker embedding (x-vector) para condicionar la voz generada, y produce un espectrograma mel que posteriormente se convierte en audio mediante un vocoder (habitualmente HiFi-GAN).

El entrenamiento consistio en un fine-tuning supervisado con los siguientes hiperparametros: learning rate de 1e-4, batch size efectivo de 32 (8 por dispositivo con 4 pasos de acumulacion de gradientes), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con 1500 pasos de warmup y 15000 pasos totales, precision mixta nativa AMP y semilla 3407. La perdida de validacion final fue de 0,0582, con una perdida de entrenamiento de 0,0482 en el ultimo paso. No se documenta el dataset utilizado, el numero de tokens o muestras, ni si hubo etapas de RLHF o DPO (no aplicables en TTS de forma estandar). Tampoco se especifica el speaker embedding ni el vocoder asociado.

## Capacidades

- Sintesis de voz a partir de texto (text-to-audio) mediante la pipeline de Transformers.
- Generacion de audio condicionada por un speaker embedding, lo que permite en principio controlar la identidad de la voz si se dispone del x-vector adecuado.
- Compatible con la libreria transformers (version 4.57.1 en entrenamiento) y con la pipeline `text-to-audio`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni vision.
- Capacidades multilingues: no documentadas; el modelo base SpeechT5 esta entrenado principalmente en ingles, pero el fine-tune no especifica idioma.
- No dispone de modo "thinking" ni capacidades de audio de entrada (es unicamente TTS, no ASR).

## Casos de uso

- Prototipado de voces personalizadas: el modelo puede servir como punto de partida para generar una voz concreta a partir de texto, usando el speaker embedding correspondiente al hablante con el que se ajusto. Adecuado en entornos de investigacion y demos.
- Generacion de narraciones para contenido audiovisual: integrable en pipelines de produccion de audiolibros o videos donde se requiera una voz consistente y se disponga del embedding correcto.
- Asistentes de voz experimentales: puede emplearse como modulo TTS en un asistente conversacional de codigo abierto, siempre que se valide la calidad de la voz y la inteligibilidad.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de accesibilidad, con la salvedad de que la calidad y el idioma no estan documentados.
- Investigacion en fine-tuning de SpeechT5: sirve como referencia de hiperparametros y curva de entrenamiento para quienes ajusten el modelo base a un nuevo hablante o dataset.
- Pruebas de concepto en edge o CPU: con 144M de parametros, el modelo es lo bastante pequeno para ejecutarse en hardware modesto, lo que facilita demos locales sin GPU dedicada.
- Generacion de locuciones para videojuegos o prototipos: util para producir lineas de dialogo de un personaje con una voz fija durante fases de desarrollo.

## Benchmarks y rendimiento

La model card declara un unico resultado en el conjunto de evaluacion: perdida de validacion de 0,0582. No se han publicado resultados de benchmarks estandar (MOS, WER, MCD, etc.) en la informacion disponible, y el model-index no contiene resultados.

| Metrica | Valor |
|---|---|
| Validation loss | 0,0582 |
| Training loss (paso 15000) | 0,0482 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 144M de parametros, la inferencia en FP32 requiere aproximadamente 0,6 GB solo para los pesos, mas overhead de activaciones y del vocoder; en la practica, menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en GPU de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2-4 GB de VRAM; tambien es viable en CPU para inferencia no interactiva.
- Opciones de despliegue: transformers con la pipeline `text-to-audio`; el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son adecuados para TTS de este tipo).
- Latencia y throughput: no disponibles. Al ser un modelo pequeno, la latencia por frase deberia ser baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yao_tts_yao | 144,4M | no disponible | MIT | Hugging Face (38 descargas) | Fine-tune de SpeechT5 sin documentacion de dataset ni idioma |
| microsoft/speecht5_tts | ~144M | no disponible | MIT | Hugging Face (modelo base ampliamente usado) | Modelo original, documentado y con demos; entrenado principalmente en ingles |
| Coqui TTS (XTTS v2) | no disponible en la informacion | no disponible | no disponible | Coqui / Hugging Face | Familia TTS multilingue con clonacion de voz; no comparable directamente en parametros |
| VITS / Piper | variable | no disponible | variable (MIT en Piper) | Hugging Face / GitHub | Modelos TTS ligeros orientados a inferencia en CPU; alternativa practica para produccion |

La comparacion directa con Coqui XTTS y Piper es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no especifica dataset, idioma, hablante objetivo ni uso previsto; multiples secciones indican "More information needed".
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas, especialmente en texto fuera del dominio de entrenamiento.
- Sesgos: al desconocerse el dataset, no es posible evaluar sesgos de genero, acento o idioma en la voz generada.
- Limitaciones de idioma: no se declara el idioma soportado; el modelo base SpeechT5 esta orientado al ingles, por lo que el rendimiento en castellano es incierto.
- Licencia MIT: permite uso comercial, pero el usuario debe verificar que el dataset de fine-tuning no imponga restricciones adicionales (no documentadas).
- Sin benchmarks de calidad: no hay MOS ni metricas de inteligibilidad, por lo que no se recomienda su uso en produccion sin una evaluacion propia.
- Requiere un speaker embedding y un vocoder externos (no incluidos en el repositorio, segun la informacion disponible); el pipeline de transformers necesita ambos para generar audio final.
- Bajo mantenimiento: 0 likes y 38 descargas sugieren escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sil-ai/yao_tts_yao
- Modelo base: https://huggingface.co/microsoft/speecht5_tts
