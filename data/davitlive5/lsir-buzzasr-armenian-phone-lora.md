# davitlive5/lsir-buzzasr-armenian-phone-lora

## Resumen

Lsir (Լսիր) es un adaptador LoRA para el codificador de audio del modelo BuzzASR/armenian, un Whisper-large-v3 ajustado para armenio. El adaptador se ha entrenado especificamente para mantener la precision de transcripcion cuando el audio llega a traves de lineas telefonicas, un escenario en el que los modelos ASR genericos suelen degradarse por el ancho de banda estrecho, la compresion con codecs y las perdidas de paquetes. Lo desarrolla el usuario davitlive5 en el marco del hackathon Veritas AI International High School Hackathon 2026, en la pista AI + Languages.

El modelo no modifica los pesos del modelo base: se trata de un adaptador PEFT de rango 16 aplicado sobre las capas de atencion y MLP del encoder, que representa aproximadamente el 1,5 % de los parametros totales. El objetivo es corregir la brecha de rendimiento entre audio limpio y audio telefonico sin sacrificar la calidad en condiciones ideales, y mejorar la robustez frente a codecs no vistos durante el entrenamiento.

Es relevante porque aborda un problema practico muy concreto: desplegar ASR en armenio sobre infraestructura telefonica (call centers, lineas de atencion, encuestas) sin reentrenar el modelo completo ni disponer de GPU de gran capacidad. Su licencia MIT y su naturaleza de adaptador lo hacen facil de integrar y distribuir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-large-v3 (transformer encoder-decoder) + adaptador LoRA sobre el encoder |
| Parametros totales | no disponible (adaptador de ~1,5 % de los parametros del base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper-large-v3, 30 s) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Whisper) |
| Idiomas soportados | armenio (hy) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el encoder de Whisper-large-v3, que procesa el audio en ventanas de 30 segundos y lo proyecta a representaciones que el decoder transforma en texto. Se inyectan matrices LoRA de rango r=16 en las capas de atencion y MLP del encoder, lo que permite adaptar la representacion acustica sin tocar el resto de los pesos. El modelo base BuzzASR/armenian es un Whisper-large-v3 ajustado previamente para armenio.

El entrenamiento uso los clips de entrenamiento de FLEURS en armenio, de los cuales la mitad se pasaron por un canal telefonico aleatorizado: banda estrecha de 8 kHz, codecs G.711 μ-law/A-law u Opus, perdida de paquetes, ruido blanco, rosa y babble, eco, y cambios de velocidad y volumen. Se anadio SpecAugment. Se entreno durante 2 epocas con learning rate 5e-5 en una GPU T4 gratuita de Kaggle. La innovacion principal es el uso de aumentacion telefonica realista y aleatorizada para mejorar la generalizacion a codecs no vistos en entrenamiento.

## Capacidades

- Reconocimiento automatico del habla en armenio (transcripcion de audio a texto).
- Robustez ante audio telefonico: banda estrecha de 8 kHz, codecs G.711 y Opus, perdida de paquetes, ruido y eco.
- Generalizacion a codecs moviles no vistos durante el entrenamiento (GSM) con perdida de paquetes y ruido.
- Transcripcion de audio limpio con una degradacion minima respecto al modelo base.
- Integracion como adaptador PEFT sobre el modelo base, sin necesidad de reentrenar ni sustituir pesos.
- No se han documentado capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Atencion al cliente telefonica: transcripcion de llamadas en armenio en tiempo casi real para generar actas, resumenes o busquedas posteriores, aprovechando la robustez ante codecs telefonicos y ruido de fondo.
- Analisis de calidad en call centers: procesar grabaciones de llamadas (habitualmente en G.711 u Opus) para calcular metricas de cumplimiento, deteccion de palabras clave o analisis de sentimiento sobre la transcripcion.
- Encuestas telefonicas automatizadas: convertir respuestas de voz en texto para su tabulacion, con tolerancia a perdida de paquetes y variaciones de volumen de los encuestados.
- Subtitulado de grabaciones de linea fija o movil: generar subtitulos para archivos de audio procedentes de centralitas o de llamadas moviles, donde el modelo base pierde precision.
- Archivado y busqueda de conversaciones: indexar transcripciones de llamadas historicas para recuperacion de informacion, con un adaptador ligero que puede desplegarse junto al base en infraestructura modesta.
- Prototipado en entornos con recursos limitados: al ser un adaptador de ~1,5 % de parametros entrenado en una T4, sirve para experimentar con ASR telefonico en armenio sin coste elevado de computo.
- Investigacion en robustez ASR: como punto de partida reproducible para estudiar aumentacion telefonica y generalizacion a codecs no vistos.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de FLEURS en armenio (932 clips), en tasa de error de palabras (WER):

| Audio | BuzzASR | + este adaptador |
|---|---|---|
| Limpio | 13,7 % | 13,8 % |
| Telefono (simulacion G.711) | 17,4 % | 17,2 % |
| Codec movil GSM no visto + perdida de paquetes + ruido | 24,3 % | 23,3 % (IC 95 % del cambio: -1,5 a -0,5) |

Porcentaje de numeros transcritos correctamente sobre el codec no visto: 72,1 % con el base frente a 78,2 % con el adaptador.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; al ser un adaptador LoRA sobre Whisper-large-v3, los requisitos son los del modelo base (aproximadamente 3 GB en fp16 para los pesos, mas memoria para activaciones y audio).
- GPU recomendadas: el adaptador se entreno en una T4 gratuita de Kaggle; para inferencia es suficiente una GPU consumer con al menos 6-8 GB de VRAM.
- Cabe en GPU consumer: si, incluidas GTX 1660, RTX 3060 y superiores, en funcion de la cuantizacion del modelo base.
- Opciones de despliegue: transformers con PEFT (segun el ejemplo de la model card); el modelo base puede servirse con vLLM, TGI o llama.cpp si se convierte a los formatos soportados, aunque no se documenta soporte explicito del adaptador en esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER armenio (FLEURS, limpio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lsir (este adaptador) + BuzzASR/armenian | ~1,5 % adicional sobre Whisper-large-v3 | ventana de 30 s | 13,8 % | MIT | Hugging Face |
| BuzzASR/armenian (base) | Whisper-large-v3 | ventana de 30 s | 13,7 % | no disponible | Hugging Face |
| Whisper-large-v3 original | ~1,55 B | ventana de 30 s | no disponible para armenio en la informacion | MIT | Hugging Face |

No se dispone de datos de otros modelos ASR especificos para armenio en la informacion proporcionada.

## Limitaciones y advertencias

- Prototipo de hackathon: el propio autor lo califica como no apto para uso medico ni critico para la seguridad.
- El adaptador solo cubre armenio; no se ha evaluado en otros idiomas.
- La mejora en audio limpio es marginal (13,7 % a 13,8 %, ligeramente peor) y en simulacion G.711 es minima (17,4 % a 17,2 %); el beneficio principal se concentra en codecs no vistos.
- El intervalo de confianza del cambio en el codec GSM es estrecho pero pequeno (-1,5 a -0,5 puntos), por lo que la mejora es modesta.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente con audio ruidoso o silencios largos.
- No se documentan sesgos especificos, pero al entrenarse sobre FLEURS puede heredar los sesgos de dominio y hablantes de ese corpus.
- La licencia MIT permite uso comercial, pero el modelo base BuzzASR/armenian tiene licencia no disponible en la informacion, por lo que conviene verificar sus terminos antes de un despliegue comercial.
- Requiere cargar manualmente la tabla de generacion (lang_to_id, task_to_id, etc.) en versiones recientes de transformers, segun advierte la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davitlive5/lsir-buzzasr-armenian-phone-lora
- Modelo base: https://huggingface.co/BuzzASR/armenian
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
