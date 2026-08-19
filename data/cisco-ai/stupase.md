# cisco-ai/stupase

## Resumen

StuPASE (Studio-Quality PASE) es un modelo generativo de mejora de voz desarrollado por el grupo Collaboration AI de Cisco Systems, Inc. Su objetivo es eliminar ruido y reverberación de grabaciones de voz manteniendo el contenido lingüístico y la identidad del hablante, logrando una calidad perceptual de estudio. Se presenta como una evolución del proyecto PASE (Phonologically Anchored Speech Enhancer) de Cisco, con un enfoque específico en reducir la alucinación típica de los sistemas generativos de mejora de voz.

El modelo combina tres componentes: DeWavLM-R, un encoder fonético derivado de WavLM-Large y DeWavLM que produce representaciones fonéticas mejoradas; un modelo de flujo condicional (CFM) que guía la mejora acústica a partir de esas representaciones; y un vocoder mel que reconstruye la forma de onda final. Con aproximadamente 561 millones de parámetros y un coste de inferencia de 104 GMAC/s, el modelo opera sobre audio mono de 16 kHz y se distribuye bajo licencia Apache 2.0. Su relevancia radica en ofrecer una alternativa de código abierto y entrenada con datos públicos para tareas de mejora de voz en producción, con métricas objetivas de inteligibilidad y similitud de hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generativa de mejora de voz con tres componentes: DeWavLM-R (encoder fonetico), CFM (modelo de flujo condicional) y Mel Vocoder |
| Parametros totales | ~561M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa audio de 16 kHz, duracion variable) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No especificado (datos de entrenamiento mayoritariamente en ingles: LibriSpeech, LibriTTS, VCTK) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado (repo con config.json; no se detalla extension de los pesos) |

## Arquitectura y entrenamiento

StuPASE se compone de tres modulos encadenados. El primero, DeWavLM-R, es un modelo WavLM-Large ajustado (fine-tuned) desde DeWavLM con objetivos de habla seca para realizar una mejora fonetica de baja alucinacion: recibe audio ruidoso y produce representaciones foneticas mejoradas. El segundo, un modelo de flujo condicional (CFM), toma las caracteristicas mel ruidosas junto con las representaciones foneticas mejoradas y genera caracteristicas mel mejoradas. El tercero, un vocoder mel, reconstruye la forma de onda a partir de las mel mejoradas.

El entrenamiento se realizo por etapas con datos publicos: habla limpia de DNS5 Challenge (subset LibriVox), LibriSpeech, LibriTTS y VCTK; ruido de DNS5; y respuestas de impulso de sala de OpenSLR26 y OpenSLR28. Las mezclas se generaron dinamicamente con SNR entre -5 y 15 dB y reverberacion aplicada con probabilidad del 50%. Los hiperparametros por componente son: DeWavLM-R con 50k pasos, LR 2e-5 y batch 20; CFM con 100k pasos, LR 1e-4 y batch 60; y vocoder mel con 200k pasos, LR 2e-4 y batch 60. Se uso el optimizador AdamW con warmup y decaimiento coseno, sobre dos GPU NVIDIA RTX 4090. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Mejora de voz generativa: elimina ruido aditivo y reverberacion de grabaciones de habla.
- Preservacion de identidad del hablante: mantiene las caracteristicas vocales del locutor original.
- Preservacion del contenido linguistico: las representaciones foneticas mejoradas reducen el riesgo de alterar palabras o fonemas.
- Calidad perceptual de estudio: orientado a producir audio con calidad comparable a grabaciones profesionales.
- Baja alucinacion: el componente DeWavLM-R esta especificamente disenado para minimizar la generacion de contenido inexistente.
- Operacion en audio mono de 16 kHz: formato estandar para telefonía y muchos sistemas de ASR.

## Casos de uso

- Limpieza de grabaciones de podcast: los creadores pueden procesar episodios grabados en entornos no acondicionados para eliminar ruido de fondo y reverberacion, mejorando la experiencia de escucha sin alterar la voz del presentador.
- Mejora de llamadas VoIP y videoconferencias: integrar StuPASE en aplicaciones de comunicacion en tiempo real para reducir ruido ambiental (teclados, trafico, ventiladores) y mejorar la inteligibilidad en salas con eco.
- Preprocesamiento para sistemas de reconocimiento de voz (ASR): aplicar el modelo antes de un ASR basado en Whisper u otro motor para reducir la tasa de error (WER) en condiciones ruidosas, especialmente en entornos industriales o de campo.
- Restauracion de archivos de audio historicos: digitalizar y limpiar cintas o grabaciones antiguas con ruido y reverberacion, preservando la identidad del hablante para archivos de entrevistas o documentales.
- Mejora de audiolibros y contenido educativo: procesar grabaciones realizadas en estudios caseros para eliminar imperfecciones acusticas y ofrecer un producto final con calidad de estudio.
- Asistentes de voz en entornos ruidosos: mejorar la senal de voz captada por microfonos de dispositivos domesticos o industriales antes de enviarla a un asistente, reduciendo errores de comprension.

## Benchmarks y rendimiento

La model card indica que el modelo se evaluo con los siguientes conjuntos de prueba y metricas, pero no se proporcionan valores numericos en la informacion disponible:

- Conjuntos de prueba: test simulado de LibriSpeech (split de test) y test sintetico DNS1 con y sin reverberacion.
- Metricas: DNSMOS, UTMOS, LPS (probablemente Loss Prediction Score), SpeechBERTScore (SBS), similitud de hablante mediante WavLM-Large basado en TCAPA-TDNN, y WER con Whisper.

No se han publicado resultados cuantitativos en la informacion proporcionada.

## Requisitos de hardware

- Parametros totales: ~561M; inferencia estimada en ~104 GMAC/s, lo que sugiere un coste computacional moderado.
- VRAM estimada: con 561M de parametros, en FP16 se requieren aproximadamente 1.1 GB solo para los pesos; considerando los tres componentes y las activaciones, es plausible que quepa en GPUs con 4-8 GB de VRAM, aunque no se especifica oficialmente.
- GPU recomendadas: el entrenamiento se realizo con 2x NVIDIA RTX 4090, por lo que una RTX 4090 (24 GB) es mas que suficiente para inferencia; tambien deberia ejecutarse en GPUs consumer de gama media como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- Opciones de despliegue: no se mencionan herramientas especificas como vLLM u Ollama; al ser un modelo de audio, se espera su uso con PyTorch/HuggingFace Transformers o el repositorio oficial de Cisco. Se puede servir mediante API REST con FastAPI o integrarse en pipelines de procesamiento por lotes.
- Latencia y throughput: no se proporcionan datos concretos; el coste de 104 GMAC/s sugiere que en una GPU moderna el procesamiento de un segmento de audio de pocos segundos deberia ser casi en tiempo real.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos de mejora de voz generativa en la informacion proporcionada. Alternativas conocidas en el ecosistema open source incluyen MetricGAN-U (basado en GAN), DEMUCS (denoising con U-Net) y HiFi-GAN (vocoder), pero no hay datos de rendimiento comparables para StuPASE en esta ficha.

## Limitaciones y advertencias

- Uso fuera de alcance declarado: no debe utilizarse para decisiones medicas, legales o de seguridad critica; tampoco para conversion de voz o manipulacion de identidad, ni para mejora de audio no hablado.
- Riesgo de alucinacion residual: aunque el diseno busca minimizarla, no se garantiza ausencia total de artefactos generados.
- Limitacion de frecuencia de muestreo: solo soporta audio mono de 16 kHz; no es compatible con audio de mayor calidad (44.1 kHz, 48 kHz) sin remuestreo previo.
- Sesgo potencial en datos de entrenamiento: los corpus utilizados (LibriSpeech, LibriTTS, VCTK, DNS5) son predominantemente en ingles y con voces de hablantes de ciertas regiones; el rendimiento puede degradarse con otros idiomas o acentos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los datos de entrenamiento tienen licencias CC BY 4.0, CC BY-SA 3.0 y CC0; se debe verificar el cumplimiento de atribucion si se redistribuyen los datos, aunque el modelo en si no los incluye.
- Requisitos de atribucion: el modelo card solicita citar el paper y el repositorio original en caso de uso publico.

## Enlaces

- HuggingFace: https://huggingface.co/cisco-ai/stupase
- Repositorio GitHub: https://github.com/cisco-open/pase
- Paper (arXiv): https://arxiv.org/abs/2603.09234
- Pagina de demostracion: https://xiaobin-rong.github.io/stupase_demo/
