# asymptoticlearning/IndoML2026-Track2-Arcturus

## Resumen

Arcturus es el sistema presentado por el equipo homónimo al Track 2 del IndoML 2026 Datathon, centrado en la eliminación de eventos de ruido en grabaciones de campo del corpus Vaani. No se trata de un modelo único, sino de un conjunto de 22 redes neuronales empaquetadas en un archivo tar de 1,28 GB: 18 separadores de audio fine-tuneados (13 MossFormerGAN-SE-16K, 3 MossFormer2-SE-48K y 2 MossFormer2-SS-16K) y 4 redes de fusión tiempo-frecuencia desarrolladas por el propio equipo. El objetivo es limpiar ruidos como respiraciones, cláxones, animales, alarmas, música, máquinas o llanto de bebés preservando la inteligibilidad del habla para el reconocedor SraVaani-1.0.

El sistema quedó en octava posición de la clasificación final (usuario asymptoticchase), con una puntuación combinada de 16,6113 en la fase 2, un SI-SDR de 13,8237 dB y un incremento de WER de +2,7876 puntos respecto al audio limpio de referencia. Los separadores parten de los checkpoints Apache-2.0 de ClearerVoice-Studio de Alibaba, mientras que las redes de fusión son desarrollo propio. El reconocedor ASR obligatorio no se distribuye con el paquete.

La relevancia de esta publicación es fundamentalmente práctica y de investigación: documenta una arquitectura de ensemble para speech enhancement en condiciones de campo multilingües (contexto indio), con checksums verificables y scripts de inferencia, lo que permite reproducir el pipeline completo. No es un modelo de propósito general ni un LLM, sino un artefacto de competición reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de separadores de audio (MossFormerGAN-SE, MossFormer2-SE, MossFormer2-SS) más redes de fusión tiempo-frecuencia |
| Parametros totales | no disponible (22 checkpoints; tamaño del repo 1,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa clips de audio; ventana no especificada en la información disponible) |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch `.pt`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | multilingüe (orientado a grabaciones de campo Vaani, contexto indio) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`) dentro de `Arcturus_Track2_checkpoints.tar` |
| Muestreo | 16 kHz (MossFormerGAN-SE-16K, MossFormer2-SS-16K) y 48 kHz (MossFormer2-SE-48K) |
| Tarea | Speech enhancement / eliminación de eventos de ruido |

## Arquitectura y entrenamiento

El sistema combina separadores de la familia MossFormer de ClearerVoice-Studio. MossFormerGAN-SE es un separador generativo adversarial con arquitectura MossFormer (atención lineal + convoluciones) para 16 kHz; MossFormer2-SE-48K es la variante de segunda generación a 48 kHz, y MossFormer2-SS-16K es un separador de fuente (source separation) a 16 kHz. El equipo aplicó fine-tuning sobre los checkpoints Apache-2.0 originales para adaptarlos a los tipos de ruido del track (respiración, cláxones, animales, alarmas, música, máquinas, llanto de bebés) y añadió cuatro redes de fusión tiempo-frecuencia entrenadas por ellos que combinan las salidas de los separadores.

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables a esta tarea). El pipeline de inferencia se ejecuta mediante `inference/infer.py` desde el repositorio GitHub, que descomprime el tar en `checkpoints/` y verifica los checksums SHA-256 listados en `CHECKPOINTS.md`. La evaluación se realizó contra el reconocedor obligatorio SraVaani-1.0 (ARTPARK-IISc), que no se incluye en la distribución.

## Capacidades

- Eliminación de eventos de ruido no estacionarios en grabaciones de habla: respiraciones, cláxones, animales, alarmas, música, máquinas y llanto de bebés.
- Separación de fuentes de audio (variantes MossFormer2-SS) para aislar la voz del ruido de fondo.
- Procesamiento a dos frecuencias de muestreo: 16 kHz y 48 kHz.
- Fusión tiempo-frecuencia de múltiples separadores mediante redes aprendidas para mejorar la señal final.
- Preservación de la inteligibilidad orientada a un ASR concreto (SraVaani-1.0), medida mediante ΔWER.
- Soporte multilingüe en el sentido de que las grabaciones Vaani cubren múltiples lenguas del contexto indio; no es un modelo de traducción ni de generación de texto.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modos de razonamiento: es exclusivamente un front-end de mejora de audio.

## Casos de uso

- Preprocesado para ASR en producción: limpiar audio de campo antes de pasarlo a un reconocedor, reduciendo el WER en entornos ruidosos; el sistema reporta un ΔWER de +2,7876 puntos en la evaluación oficial, lo que da una referencia cuantitativa de la ganancia esperada.
- Transcripción de entrevistas y encuestas de campo: las grabaciones Vaani son típicamente multilingües y con ruido ambiental; el ensemble elimina cláxones y ruido de máquinas antes de la transcripción.
- Limpieza de llamadas de centros de atención al cliente: eliminar respiraciones, ruido de fondo y llanto de bebés en grabaciones telefónicas de 16 kHz.
- Archivado y preservación de patrimonio oral: mejorar grabaciones históricas o de campo a 48 kHz con la variante MossFormer2-SE-48K antes de su digitalización definitiva.
- Investigación en speech enhancement: servir como baseline reproducible de ensemble con checksums y scripts para comparar separadores MossFormer en condiciones de ruido específicas.
- Pipeline de evaluación de ASR: usar el sistema como etapa de preprocesado fija para medir la robustez de distintos reconocedores frente a ruido real.
- Generación de datasets de entrenamiento limpios: aplicar el separador para crear pares ruido/limpio a partir de grabaciones reales y aumentar corpus de ASR.

## Benchmarks y rendimiento

Resultados oficiales del Track 2 (fase 2, clasificación final 8.º puesto):

| Metrica | Valor |
|---|---|
| Puntuación combinada (fase 2) | 16,6113 |
| SI-SDR | 13,8237 dB |
| ΔWER total | +2,7876 puntos |
| ΔWER en clips sintéticos | +7,8507 puntos |
| ΔWER en clips naturales | +0,4012 puntos |
| Posición final | 8.º (usuario asymptoticchase) |

No se han publicado en la información disponible resultados comparativos con otros sistemas del leaderboard ni métricas adicionales (PESQ, STOI, DNSMOS).

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el paquete completo ocupa 1,3 GB en disco, pero la inferencia carga los separadores de forma secuencial o por lotes según el script, por lo que el pico de VRAM depende de la implementación.
- GPU recomendadas: no especificadas por el autor; por el tamaño de los checkpoints, una GPU consumer con 8-12 GB de VRAM debería ser suficiente para inferencia en FP32, aunque no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí (RTX 3060/4060 en adelante), sin datos oficiales de consumo.
- Opciones de despliegue: PyTorch nativo mediante `inference/infer.py`; no se publican versiones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arcturus (este) | Ensemble de separadores MossFormer + fusión T-F | no disponible (22 checkpoints, 1,3 GB) | no disponible | Apache-2.0 | HuggingFace + GitHub |
| ClearerVoice-Studio (MossFormerGAN-SE-16K) | Separador único | no disponible | no disponible | Apache-2.0 | HuggingFace (alibabasglab) |
| ClearerVoice-Studio (MossFormer2-SE-48K) | Separador único | no disponible | no disponible | Apache-2.0 | HuggingFace (alibabasglab) |
| ClearerVoice-Studio (MossFormer2-SS-16K) | Separador de fuente | no disponible | no disponible | Apache-2.0 | HuggingFace (alibabasglab) |

La comparativa se limita a los modelos base de los que deriva, ya que no se dispone de datos de otros sistemas del leaderboard ni de métricas comparables publicadas.

## Limitaciones y advertencias

- Es un artefacto de competición, no un producto mantenido: la fecha de creación (2026-10-29) y la ausencia de descargas y likes indican un uso previsto de reproducción, no de producción.
- El rendimiento está medido contra un ASR concreto (SraVaani-1.0); la ganancia en ΔWER puede no transferirse a otros reconocedores.
- El ΔWER en clips naturales es de solo +0,4012 puntos, muy inferior al de clips sintéticos (+7,8507), lo que sugiere un rendimiento desigual en condiciones reales frente a las sintéticas.
- No se documentan sesgos específicos, pero al estar entrenado sobre Vaani (contexto indio) puede degradarse en otros dominios acústicos o lenguas.
- Riesgo de artefactos de separación: los modelos GAN de enhancement pueden introducir distorsión o sobre-suprimir componentes del habla, especialmente en ruidos no vistos durante el fine-tuning.
- El reconocedor obligatorio SraVaani-1.0 no se distribuye; para reproducir la evaluación completa hay que obtenerlo por separado.
- La licencia Apache-2.0 permite uso comercial, pero se hereda de los checkpoints ClearerVoice-Studio; conviene revisar las condiciones de los modelos base.
- No hay versiones cuantizadas ni formatos portables (ONNX, GGUF), lo que limita el despliegue en entornos sin PyTorch.
- El tamaño del tar (1,28 GB) y la necesidad de verificar checksums añaden complejidad operativa.

## Enlaces

- HuggingFace: https://huggingface.co/asymptoticlearning/IndoML2026-Track2-Arcturus
- Repositorio GitHub (código, scripts y reporte): https://github.com/Abhilash1602/IndoML2026-Track2-Arcturus
- Checkpoints base MossFormerGAN-SE-16K: https://huggingface.co/alibabasglab/MossFormerGAN_SE_16K
- Checkpoints base MossFormer2-SE-48K: https://huggingface.co/alibabasglab/MossFormer2_SE_48K
- Checkpoints base MossFormer2-SS-16K: https://huggingface.co/alibabasglab/MossFormer2_SS_16K
- ASR obligatorio SraVaani-1.0: https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- Contacto del equipo: abhilashjacob16@gmail.com, aman.kumar.cse@kiet.edu
