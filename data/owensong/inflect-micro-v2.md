# owensong/Inflect-Micro-v2

## Resumen

Inflect-Micro-v2 es un modelo de síntesis de voz (text-to-speech) desarrollado por owensong que convierte texto en forma de onda de audio de manera completamente local, con un total de 9.356.513 parámetros desplegables y un peso FP32 de 37,53 MB. Se posiciona como la variante orientada a calidad dentro de la familia Inflect v2, que comparte una única API pública entre dos tamaños: Micro (por debajo de 10M de parámetros) y Nano (por debajo de 4M). El modelo genera audio mono a 24 kHz y está pensado para inferencia tanto en CPU como en CUDA.

El modelo resuelve el problema de la síntesis de voz de alta fidelidad en entornos con recursos muy limitados, como dispositivos de borde (edge AI) o aplicaciones de escritorio sin GPU. Frente a alternativas compactas como Piper o KittenTTS, Inflect-Micro-v2 apuesta por un footprint reducido manteniendo una calidad de audio competitiva, medida mediante preferencia humana, naturalidad predicha (UTMOS22) e inteligibilidad con múltiples sistemas ASR.

Es relevante ahora porque demuestra que es posible un pipeline completo de texto a forma de onda por debajo de 10M de parámetros con inferencia a más de 6 veces tiempo real en CPU de 4 hilos, lo que habilita TTS local en hardware modesto sin depender de servicios en la nube. La licencia Apache 2.0 y la disponibilidad de un toolkit público de adaptación facilitan su integración y personalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-waveform, segun tags del repositorio) |
| Parametros totales | 9.356.513 parametros desplegables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (se documentan exportaciones PyTorch y ONNX; FP32 como referencia) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch y ONNX (exportaciones documentadas); tamano del repo 0,1 GB |

## Arquitectura y entrenamiento

Inflect-Micro-v2 sigue una arquitectura de tipo VITS, un modelo generativo de extremo a extremo que transforma texto en forma de onda de audio directamente, sin un pipeline separado de vocoder. El modelo produce audio mono a 24 kHz y esta disenado para inferencia determinista mediante semillas fijas, lo que permite reproducibilidad en la generacion. El presupuesto de parametros se situa en 9.356.513 parametros desplegables, con un peso FP32 de 37,53 MB.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona un frontend publico que normaliza el texto de entrada (numeros, puntuacion, nombres propios) y una gestion de texto largo. Tambien se ofrece un toolkit publico de adaptacion para preparar datos, auditar particiones de entrenamiento y validacion, adaptar una voz fija o un idioma, reanudar el entrenamiento, evaluar checkpoints y exportar paquetes PyTorch u ONNX; la calidad de las adaptaciones se describe como experimental y dependiente del dataset, el frontend y la evaluacion por hablantes fluidos.

## Capacidades

- Sintesis de voz fija en ingles: convierte texto en audio mono a 24 kHz con una voz fija determinista.
- Generacion determinista: soporta semillas fijas para reproducir exactamente la misma salida de audio.
- Manejo de texto largo: el modelo esta preparado para procesar transcripciones extensas mas alla de una frase corta.
- Normalizacion de texto en el frontend: gestiona numeros, puntuacion, nombres propios y terminos tecnicos (se muestran ejemplos de conversacional, puntuacion, numeros, nombres y lugares, y texto tecnico).
- Inferencia en CPU y CUDA: puede ejecutarse tanto en procesadores como en GPU.
- Exportacion a PyTorch y ONNX: permite empaquetar el modelo para distintos entornos de despliegue.
- Adaptacion de voz o idioma: mediante el toolkit publico, con calidad experimental.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento, al tratarse de un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones de escritorio: integrar el modelo para narrar documentos o notificaciones en local, aprovechando su peso de 37,53 MB y su inferencia en CPU sin dependencia de red.
- Asistentes de voz en dispositivos de borde: desplegar TTS en hardware embebido o de bajas prestaciones gracias a su footprint inferior a 10M de parametros y su capacidad de ejecucion en CPU.
- Accesibilidad para personas con discapacidad visual: convertir texto de pantalla en audio en tiempo real, con manejo de numeros y puntuacion que mejora la comprension de contenidos estructurados.
- Generacion de audiolibros o narraciones largas: el soporte de texto largo y la salida determinista permiten generar capitulos completos de forma reproducible.
- Prototipado de interfaces conversacionales: usar el modelo como componente TTS en un pipeline de voz local para pruebas de UX sin coste de API en la nube.
- Sistemas de anuncios o avisos automatizados: sintetizar mensajes con numeros, fechas y nombres propios (por ejemplo, avisos de envio o recordatorios) con una voz fija y consistente.
- Adaptacion a una voz corporativa: mediante el toolkit de adaptacion, ajustar una voz fija para una marca concreta, evaluando la calidad con hablantes fluidos antes de produccion.

## Benchmarks y rendimiento

| Metrica | Inflect-Micro-v2 |
|---|---|
| Preferencia humana en escucha ciega (↑) | 66,2% (21 victorias, 10 derrotas) |
| UTMOS22 (↑) | 4,395 |
| WER semantico con dos ASR (↓) | 3,99% |
| Pesos FP32 completos (↓) | 37,53 MB |
| Throughput en CPU de 4 hilos (↑) | 6,28x tiempo real |

La comparativa publicada incluye KittenTTS Nano, Piper Low y Supertonic 3 como baselines compactos o locales con mayor footprint de pesos desplegables que ambas versiones de Inflect. Los tamanos de pesos se comparan a nivel de paquete y la model card advierte que ninguna metrica aislada prueba superioridad global. No se proporcionan en la informacion disponible los resultados numericos desglosados de cada competidor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 37,53 MB de pesos FP32 el modelo es extremadamente ligero y cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 4090 y gamas inferiores; no se requieren A100 ni H100.
- CPU: funciona en CPU; se reporta 6,28x tiempo real con 4 hilos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna, e incluso en CPU.
- Opciones de despliegue: inferencia PyTorch nativa, exportacion ONNX, y paquetes del toolkit de adaptacion; no se documentan integraciones explicitas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS).
- Latencia y throughput: 6,28x tiempo real en CPU de 4 hilos segun la evaluacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inflect-Micro-v2 | 9,36M | no aplica | 66,2% preferencia, UTMOS22 4,395, WER 3,99% | Apache 2.0 | Hugging Face, GitHub, playground |
| Inflect-Nano-v2 | 3,96M | no aplica | no disponible en esta ficha | Apache 2.0 (segun familia) | Hugging Face |
| KittenTTS Nano | no disponible | no aplica | incluido como baseline, cifras no desglosadas | no disponible | Hugging Face |
| Piper Low | no disponible | no aplica | incluido como baseline, cifras no desglosadas | no disponible | Hugging Face |
| Supertonic 3 | no disponible | no aplica | incluido como baseline, cifras no desglosadas | no disponible | Hugging Face |

Los baselines se describen como modelos compactos o locales con mayor footprint de pesos desplegables que las versiones de Inflect. No se dispone de los valores numericos individuales de cada competidor en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles: no hay capacidades multilingues documentadas en la version base.
- Voz fija: no es un modelo de clonacion de voz ni de multiples hablantes; la adaptacion a otra voz es experimental.
- Riesgo de errores de pronunciacion en nombres propios, numeros o terminos tecnicos fuera del dominio del frontend.
- La calidad de las adaptaciones (voz o idioma) depende del dataset, el frontend y la evaluacion por hablantes fluidos, y se marca como experimental.
- No se documentan sesgos especificos del dataset de entrenamiento; al ser un modelo de voz, puede reflejar sesgos acusticos o prosodicos de los datos originales.
- Las metricas de evaluacion son limitadas y la propia model card advierte que ninguna metrica aislada demuestra superioridad global.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del toolkit y de los datasets de adaptacion.
- No apto para aplicaciones que requieran contexto de texto largo tipo LLM ni razonamiento; es exclusivamente un modelo TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/owensong/Inflect-Micro-v2
- Playground: https://huggingface.co/spaces/owensong/Inflect-v2
- Repositorio GitHub: https://github.com/owenawsong/Inflect
- Modelo Inflect-Nano-v2: https://huggingface.co/owensong/Inflect-Nano-v2
- Discord: https://discord.gg/CVJYedvzvp
- Documentacion de evaluacion: https://huggingface.co/owensong/Inflect-Micro-v2/blob/main/docs/EVALUATION.md
- Documentacion de exportaciones: https://huggingface.co/owensong/Inflect-Micro-v2/blob/main/docs/EXPORTS.md
- Guia de despliegue: https://huggingface.co/owensong/Inflect-Micro-v2/blob/main/docs/DEPLOYMENT.md
- Toolkit de adaptacion: https://github.com/owenawsong/Inflect/tree/main/finetune
- Flujo de entrenamiento y exportacion: https://github.com/owenawsong/Inflect/tree/main/finetune/docs/TRAINING.md
