# majentik/Gemma-4-E4B-BF16-MERaLiON-Speech-LoRA-SG-MLX

## Resumen

Este modelo es un sistema de reconocimiento automático del habla (ASR) para inglés de Singapur (singlish) que combina el encoder de voz MERaLiON-3, desarrollado por A*STAR, con el decoder de texto Gemma-4-E4B de Google. Se distribuye en formato MLX para Apple Silicon y está diseñado para transcribir audio con precisión en el contexto del Corpus Nacional de Habla de Singapur (MNSC). El modelo resuelve el problema de la transcripción robusta de variantes del inglés poco representadas en los sistemas comerciales, y su relevancia actual radica en que ofrece una mejora de 9,69 puntos de WER respecto al baseline MERaLiON-3 sin el decoder de lenguaje grande.

La arquitectura es un sistema compuesto por un encoder acústico (MERaLiON-3), un proyector entrenado y un decoder basado en Gemma-4-E4B con un adaptador LoRA de rango 16. El modelo está disponible en BF16 para el decoder y FP16 para el encoder, lo que evita artefactos de cuantización y lo convierte en una edición de calidad prioritaria. Actualmente el repositorio está marcado como privado, pero la model card documenta su rendimiento y su licencia compuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de voz MERaLiON-3 + proyector + decoder Gemma-4-E4B con LoRA rango 16 |
| Parametros totales | no disponible (Gemma-4-E4B con 4 mil millones; encoder MERaLiON-3 no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (decoder), FP16 (encoder) |
| Idiomas soportados | en (ingles, con enfoque en singlish) |
| Licencia | gemma-terms-meralion-v3-mnsc-sg-odl-v1 (compuesta: Terminos de Gemma, Licencia Publica MERaLiON v3, Licencia de Datos Abiertos de Singapur v1) |
| Formato de pesos | MLX, safetensors |

## Arquitectura y entrenamiento

El modelo es un sistema compuesto que conecta el encoder acustico MERaLiON-3 (desarrollado por A*STAR) con el decoder de texto Gemma-4-E4B de Google mediante un proyector entrenado y un adaptador LoRA de rango 16. El decoder se mantiene en BF16 nativo para evitar artefactos de cuantizacion, mientras que el encoder se almacena en FP16. El entrenamiento se realizo sobre el corpus MNSC (Multitask National Speech Corpus v1), y la evaluacion se realizo sobre la particion ASR Part 2 Test con 3000 clips de audio.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el proceso de alineamiento (RLHF/DPO). El modelo es un derivado de Gemma 4 (Apache 2.0) y MERaLiON-3, y su distribucion esta sujeta a restricciones de licencia multiples.

## Capacidades

- Transcripcion de voz a texto en ingles de Singapur (singlish) con un WER del 16,09% en el dataset MNSC ASR Part 2 Test.
- Reconocimiento de numeros de serie, fechas, nombres propios y toponimos locales (ejemplos de salida incluyen secuencias numericas y referencias a lugares de Singapur).
- Normalizacion de texto automatica: convierte a minusculas, elimina puntuacion ASCII y colapsa espacios en blanco, lo que facilita la comparacion de transcripciones.
- Soporte de etiquetas de hablante: elimina prefijos de speaker en las referencias y hipotesis durante la evaluacion.
- No se reportan capacidades de tool calling, agentes ni razonamiento multi-step, ya que es un sistema de transcripcion puro.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente en Singapur: el modelo puede procesar audio de llamadas con acento singlish y generar transcripciones normalizadas para analisis posterior, gracias a su entrenamiento especifico en el corpus nacional.
- Generacion de subtitulos para contenido local: adecuado para subtitular videos y podcasts en ingles de Singapur, donde los sistemas genericos fallan por el vocabulario y la pronunciacion local.
- Archivo de reuniones y actas: puede transcribir grabaciones de reuniones corporativas con referencias a lugares y personas singapurenses, como se demuestra en los ejemplos con nombres como "Jalan Asas" o "Syed Sheikh Syed Ahmad Al Hadi".
- Asistentes de voz para aplicaciones de movilidad: integracion en sistemas de navegacion que necesitan entender comandos con nombres de calles y distritos de Singapur.
- Procesamiento de documentos de identidad y formularios: el modelo transcribe secuencias numericas y fechas con precision (ejemplos de salida con numeros de serie y fechas), lo que lo hace util para digitalizar formularios hablados.
- Evaluacion de calidad de datos de audio: al alcanzar un WER del 16,09%, puede servir como herramienta de referencia para medir la calidad de grabaciones de voz locales en entornos de desarrollo de ASR.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el dataset MERaLiON/Multitask-National-Speech-Corpus-v1, particion ASR Part 2 Test (3000 clips):

| Sistema | WER (%) | Notas |
|---|---:|---|
| MERaLiON-3 baseline | 25,78 | Encoder stock + decoder nativo |
| Gemma-4-E4B + LoRA (version 8-bit) | 18,86 | Version hermana con decoder cuantizado a 8 bits |
| **Este modelo (BF16)** | **16,09** | Version de maxima calidad |

La mejora absoluta respecto al baseline es de -9,69 puntos porcentuales y de -2,77 puntos respecto a la version de 8 bits. En la evaluacion completa, 1071 de 3000 utterances obtuvieron un WER del 0% y otros 857 un WER menor o igual al 20%.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 16,8 GB en formato BF16/FP16, por lo que se necesitan al menos 16 GB de VRAM para cargar el modelo completo. El decoder Gemma-4-E4B en BF16 requiere aproximadamente 8 GB, y el encoder MERaLiON-3 en FP16 otros 8 GB.
- GPU recomendadas: tarjetas de 16 GB como RTX 3090, RTX 4090, A100 40GB o superior. En Apple Silicon, se puede ejecutar con MLX en Macs con 16 GB de RAM unificada o mas.
- En consumer GPU: si, con RTX 3090/4090 de 24 GB se puede ejecutar sin problemas. En GPUs de 8 GB (como RTX 3060 Ti) no cabria el modelo completo en memoria.
- Opciones de despliegue: al ser un modelo MLX, se puede usar con el runtime de MLX en Apple Silicon, o convertir los pesos a GGUF para usar con llama.cpp/Ollama. No se menciona soporte para vLLM o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (MNSC ASR Part 2) | Licencia |
|---|---|---|---|---|
| **Este modelo (BF16)** | 4B (decoder) + encoder no especificado | no disponible | 16,09% | Compuesta (Gemma + MERaLiON + ODL) |
| MERaLiON-3 baseline | 10B (modelo completo) | no disponible | 25,78% | MERaLiON Public Licence v3 |
| Version 8-bit del mismo modelo | 4B (decoder) + encoder no especificado | no disponible | 18,86% | Compuesta |

La comparativa muestra que este modelo mejora significativamente el baseline MERaLiON-3 y su version 8-bit. No se dispone de datos sobre otros sistemas ASR comerciales o open source para singlish, como Whisper de OpenAI o Parakeet de NVIDIA, que podrian ser comparables en tarea pero no en licencia ni formato.

## Limitaciones y advertencias

- El modelo esta actualmente marcado como **privado** en Hugging Face; su uso publico requiere autorizacion explicita del autor y no se debe asumir que esta disponible para descarga publica.
- La licencia es compuesta y restrictiva: se aplican los Terminos de Uso de Gemma (seccion 3.2), la Politica de Uso Prohibido de Gemma, la Licencia Publica MERaLiON-3 y la Licencia de Datos Abiertos de Singapur v1 para los componentes derivados de MNSC. Es obligatorio revisar todas las licencias antes de cualquier uso comercial.
- El modelo esta entrenado exclusivamente para ingles de Singapur; su rendimiento en otros dialectos o idiomas no esta garantizado.
- No se reportan evaluaciones de sesgos ni de alucinacion en el contexto ASR. Como sistema de transcripcion, puede cometer errores en nombres propios o terminos poco frecuentes, aunque los ejemplos muestran un buen rendimiento en entidades locales.
- No se dispone de datos sobre latencia, throughput ni requisitos de memoria en tiempo de ejecucion.
- El modelo no incluye los pesos del decoder ni del encoder; los usuarios deben suministrar los modelos base compatibles (google/gemma-4-E4B-it y MERaLiON/MERaLiON-3-10B) bajo sus terminos respectivos.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/majentik/Gemma-4-E4B-BF16-MERaLiON-Speech-LoRA-SG-MLX)
- [Model card (README.md)](https://huggingface.co/majentik/Gemma-4-E4B-BF16-MERaLiON-Speech-LoRA-SG-MLX/blob/main/README.md)
- [Pagina oficial de MERaLiON](http://www.meralion.ai/)
- [Terminos de uso de Gemma](https://ai.google.dev/gemma/terms)
- [Guia de ejecucion de Gemma 4 con MLX en Apple Silicon](https://gemma4.dev/run-local/gemma-4-mlx)
