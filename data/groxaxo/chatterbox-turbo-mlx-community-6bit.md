# groxaxo/Chatterbox-Turbo-MLX-Community-6bit

## Resumen

Chatterbox-Turbo-MLX-Community-6bit es un checkpoint cuantizado a 6 bits del modelo de sintesis de voz Chatterbox Turbo de Resemble AI, convertido y republicado por el usuario groxaxo en formato MLX para su ejecucion en Apple Silicon. Se trata de un modelo de texto a voz (text-to-speech) con capacidad de clonacion de voz, disenado para generar audio de forma local con un consumo de recursos reducido. La cuantizacion a 6 bits reduce el peso del checkpoint a 534,6 MiB frente a los 2847,7 MiB de los pesos originales en FP32, manteniendo una fidelidad de hablante muy alta.

El repositorio se presenta como uno de los tres candidatos cuantizados seleccionados mediante una evaluacion controlada de fidelidad del decodificador, junto con las variantes oQ6 y oQ5, mientras que el modelo sin cuantizar y la variante oQ4 sirven como lineas base de comparacion. Segun los datos de safetensors, el modelo cuenta con 625.976.322 parametros totales, aunque la model card de Resemble AI describe la arquitectura Turbo original como un modelo simplificado de aproximadamente 350M de parametros. Esta publicado bajo licencia Apache 2.0 y esta orientado exclusivamente al idioma ingles.

Su relevancia actual radica en que permite desplegar un sistema TTS con clonacion de voz en equipos de consumo con memoria unificada, sin necesidad de GPU dedicada, gracias al backend MLX optimizado para chips de Apple. El autor aporta evidencia reproducible de tiempos de generacion, uso de memoria y comparativas de fidelidad con hashes de pesos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | chatterbox_turbo (modelo TTS, segun tag `chatterbox_turbo`) |
| Parametros totales | 625.976.322 (segun datos de safetensors); ~350M segun la arquitectura Turbo de Resemble AI |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de texto a voz, no un LLM) |
| Tipos de cuantizacion | 6 bits (affine cuantizado); variantes comparadas: oQ6, oQ5, oQ4 y FP32 sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); incluye tokenizer, archivos de condicionamiento (`conds.safetensors`) y activos de evaluacion |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Tamano del checkpoint | 534,6 MiB (solo `model.safetensors`) |
| Tamano total del repo | 0,6 GB |
| Pipeline | text-to-speech |
| Libreria | mlx-audio |
| SHA-256 de pesos | `50737677896b0e35a7526662c127841040830b826ef8a2d017bddcea6f23e4ef` |
| Modelos base | mlx-community/chatterbox-turbo-6bit, ResembleAI/chatterbox-turbo |
| Revision origen | `afbfd1f8a32f2bc1f32e0fb6b7663c04327e8ff1` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Chatterbox Turbo, un modelo de sintesis de voz perteneciente a la familia Chatterbox de Resemble AI. Segun la informacion disponible, Turbo se construye sobre una arquitectura simplificada de aproximadamente 350M de parametros que reduce el computo y la VRAM respecto a los modelos anteriores de la familia, manteniendo una calidad de habla alta y anadiendo etiquetas paralinguisticas nativas como `[laugh]`, `[cough]` y `[chuckle]`. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens de audio utilizados ni si se emplearon tecnicas de RLHF o DPO en el proceso de ajuste.

Este repositorio concreto no entrena el modelo desde cero, sino que republica un checkpoint comunitario cuantizado a 6 bits (affine) a partir de la fuente `mlx-community/chatterbox-turbo-6bit` en una revision fijada. El autor indica que el inventario de tensores difiere del de las variantes oQ, y que sus 134 tensores de convolucion compartidos coinciden con el original tras la conversion de dtype. La etiqueta de "6 bits" no corresponde a una precision uniforme medida para todos los tensores. La evaluacion aportada reutiliza los tokens de habla originales, el condicionamiento (`conds.safetensors`) y una semilla RNG del decodificador (9182) para medir la fidelidad del decodificador de forma controlada.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de texto de entrada.
- Clonacion de voz: el repositorio incluye `conds.safetensors` con la voz por defecto empaquetada, y la familia Chatterbox soporta clonacion con voz de referencia.
- Etiquetas paralinguisticas nativas para expresividad: `[laugh]`, `[cough]`, `[chuckle]` (segun la descripcion de Chatterbox Turbo).
- Generacion de audio local con backend MLX en Apple Silicon, con salida WAV a traves de `mlx_audio.tts.generate`.
- Ejecucion por fragmentos (streaming por segmentos) mediante la API `model.generate`, concatenables en un unico WAV.
- Reproducibilidad declarada: 30/30 WAVs de comparacion regenerados coincidieron exactamente en sus hashes con el experimento previo.
- Limitado al idioma ingles; no se declaran capacidades multilingues, de vision, audio de entrada ni tool calling (no son aplicables a un modelo TTS).

## Casos de uso

- Narracion local de contenidos en ingles: el modelo permite generar locuciones de forma totalmente offline en un Mac con Apple Silicon, sin enviar texto a servicios en la nube, gracias a que el checkpoint ocupa solo 534,6 MiB.
- Asistentes de voz embebidos: puede integrarse en agentes conversacionales en ingles para sintetizar respuestas, usando las etiquetas paralinguisticas (`[laugh]`, `[cough]`) para dotar de expresividad a las respuestas.
- Clonacion de voz personalizada con consentimiento: partiendo de una muestra de hablante autorizada, se puede generar voz sintetica consistente para audiolibros o doblaje de contenido propio, aprovechando la alta similitud de hablante medida (cosine de hablante controlado 0,99908).
- Prototipado de interfaces de voz en desarrollo: al ser rapido (RTF 0,254) y ligero, es adecuado para iterar sobre guiones y voces durante el diseno de producto sin coste de API.
- Generacion de audio para accesibilidad: conversion de texto a voz para lectura de articulos, documentacion o notificaciones en aplicaciones de escritorio en Mac.
- Evaluacion y benchmarking de cuantizacion: dado que el repositorio aporta CSVs, JSON y hashes, sirve como referencia para investigadores que comparan tecnicas de cuantizacion (affine 6-bit frente a oQ6/oQ5/oQ4) en modelos de audio.
- Servicio TTS autoalojado: mediante proyectos comunitarios como `groxaxo/chatterbox-tts-server`, se puede exponer el modelo detras de una API compatible con OpenAI para integrarlo en aplicaciones existentes.

## Benchmarks y rendimiento

Los unicos datos de rendimiento disponibles son los de la comparativa medida aportada por el autor. Corresponden a la mediana de cinco repeticiones en caliente de una frase, con ajustes de muestreo compartidos y semilla de sintesis 20261009, en un equipo de escritorio alimentado por bateria con el modo de bajo consumo desactivado. La RTF normaliza el tiempo de generacion por la duracion generada (valores mas bajos indican mayor velocidad).

| Perfil | Checkpoint (MiB) | Mediana en caliente (s) | RTF | Cosine de hablante controlado | Cosine de hablante de modelo completo | Diferencia log-mel controlada (dB) |
|---|---:|---:|---:|---:|---:|---:|
| Original · pesos FP32 | 2847,7 | 2,861 | 0,431 | 1,00000 | 1,00000 | 0,000 |
| Community affine 6-bit | 534,6 | 1,535 | 0,254 | 0,99908 | 0,96628 | 1,308 |
| oQ6 | 643,1 | 1,489 | 0,247 | 0,99618 | 0,96603 | 1,839 |
| oQ5 | 547,4 | 1,445 | 0,235 | 0,97661 | 0,94626 | 3,013 |
| oQ4 | 463,9 | 1,389 | 0,226 | 0,93667 | 0,90098 | 5,130 |

Datos adicionales aportados:

| Metrica | Valor |
|---|---|
| WER agrupado estricto de generacion completa | 3,92 % |
| Pico de asignacion MLX | 1,913 GiB |
| Pico de RSS del proceso | 1,176 GiB |
| Tiempo de carga | 0,917 s |
| Recheck de oQ6 | 1,547 s / RTF 0,256 |

El propio autor advierte que las metricas controladas reutilizan tokens de habla originales y no constituyen porcentajes de calidad audible, MOS ni verificacion de hablante independiente; ademas, el experimento usa tres frases en ingles, una semilla de sintesis y una sola voz empaquetada. Las diferencias entre candidatos cuantizados no establecen un ranking de velocidad universal.

## Requisitos de hardware

- Probado en un Apple M5 Mac con 24 GiB de memoria unificada, con MLX 0.32.2, mlx-audio 0.4.8 y mlx-lm 0.32.0. No se declara compatibilidad explicita con GPU de NVIDIA o AMD, ya que el formato es MLX (Apple Silicon).
- Pico de asignacion MLX de 1,913 GiB y pico de RSS del proceso de 1,176 GiB, medidos como maximos de proceso completo, no como memoria estable por peticion. Esto implica que cabe holgadamente en cualquier Mac con memoria unificada de 8 GiB o superior.
- El checkpoint a 6 bits ocupa 534,6 MiB, por lo que es apto para equipos de consumo con Apple Silicon; el modelo original en FP32 ocupa 2847,7 MiB.
- Despliegue mediante la libreria mlx-audio (comando `python -m mlx_audio.tts.generate` o la API `load_model`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, al ser un modelo de audio y no un LLM.
- Latencia y throughput: mediana en caliente de 1,535 s y RTF de 0,254 para una frase, lo que indica generacion mas rapida que tiempo real (RTF menor que 1). Tiempo de carga de 0,917 s.
- Para el servicio autoalojado se referencia el proyecto `groxaxo/chatterbox-tts-server`, que expone el modelo detras de una API compatible con OpenAI y una interfaz web.

## Comparativa con modelos similares

Comparativa dentro de la propia familia de artefactos MLX de Chatterbox Turbo, segun los datos aportados:

| Modelo | Parametros | Contexto | Tamano checkpoint | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groxaxo/Chatterbox-Turbo-MLX-Community-6bit | 625.976.322 (safetensors) | no aplica | 534,6 MiB | apache-2.0 | HuggingFace, MLX |
| mlx-community/chatterbox-turbo-6bit | no disponible | no aplica | no disponible | apache-2.0 | HuggingFace, MLX (fuente de este modelo) |
| mlx-community/Chatterbox-Turbo-TTS-fp16 | no disponible | no aplica | ~3,0 GB (archivo unico) | apache-2.0 | HuggingFace, MLX |
| ResembleAI/chatterbox-turbo (original) | ~350M (arquitectura Turbo) | no aplica | 2847,7 MiB (FP32) | no disponible en la informacion | HuggingFace (modelo original) |

No se dispone de datos de benchmarks comparativos con modelos TTS de otros fabricantes (por ejemplo, alternativas de sintesis de voz de terceros), por lo que la comparativa se limita a las variantes de la misma familia. Las variantes oQ6, oQ5 y oQ4 forman parte de la propia comparativa medida del repositorio y no son repositorios separados identificados en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`); no se declaran capacidades multilingues.
- La etiqueta "6 bits" no implica una precision uniforme para todos los tensores; el autor indica explicitamente que no es una precision medida uniforme.
- Las metricas de similitud (cosine) y error espectral no son porcentajes de calidad audible, MOS ni verificacion de hablante independiente; no deben interpretarse como certificacion de calidad.
- La evaluacion se realizo sobre un corpus muy reducido: tres frases en ingles, una semilla de sintesis y una unica voz empaquetada. No hay validacion de preferencia humana, MOS, verificacion de hablante independiente, multilingue, voz clonada ni formato largo.
- El WER del 3,92 % se obtuvo con un ASR concreto (Parakeet INT8); cuatro transcripciones cambiaron pese a WAVs identicos, por lo que los errores de ASR no aislados no establecen naturalidad.
- Riesgo de clonacion de voz no autorizada: al ser un modelo con capacidad de clonacion, su uso indebido puede generar suplantacion de identidad; conviene aplicar controles de consentimiento y marcas de agua en produccion.
- Riesgo de alucinacion/artefactos de audio: como todo modelo generativo TTS, puede producir pronunciaciones incorrectas, prosodia anomala o artefactos en textos no vistos.
- El rendimiento de comparacion se midio en un unico equipo (Apple M5, 24 GiB) con una configuracion concreta de MLX/mlx-audio/mlx-lm; los tiempos pueden variar en otro hardware o versiones de libreria.
- Licencia apache-2.0 para este repositorio, pero la licencia del modelo original de Resemble AI no se detalla en la informacion proporcionada; conviene verificar los terminos del modelo base antes de uso comercial.
- No hay datos de contexto aplicables (no es un modelo de lenguaje), por lo que no se deben asumir capacidades de razonamiento, codigo o tool calling.

## Enlaces

- Repositorio del modelo: https://huggingface.co/groxaxo/Chatterbox-Turbo-MLX-Community-6bit
- Modelo base (fuente cuantizada): https://huggingface.co/mlx-community/chatterbox-turbo-6bit
- Modelo original: https://huggingface.co/ResembleAI/chatterbox-turbo
- Variante fp16 de referencia: https://huggingface.co/mlx-community/Chatterbox-Turbo-TTS-fp16
- Coleccion Chatterbox TTS de mlx-community: https://huggingface.co/collections/mlx-community/chatterbox-tts
- Repositorio del autor (experimento): https://github.com/groxaxo/chatterbox-experimento
- Servidor TTS autoalojado del autor: https://github.com/groxaxo/chatterbox-tts-server
- Libreria mlx-audio: https://github.com/Blaizzy/mlx-audio
- Activos de evaluacion del repositorio: `evaluation/README.md`, `evaluation/data/summary.csv`, `evaluation/data/per-clip.csv`, `evaluation/data/similarity.json`, `evaluation/data/weight-audit.json`, `evaluation/data/precision-inventory.json`, `evaluation/data/reproducibility.json`
