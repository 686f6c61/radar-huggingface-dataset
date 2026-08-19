# sifat-febo/banglish-companion

## Resumen

Banglish Companion es un modelo de lenguaje conversacional de aproximadamente 1.700 millones de parametros, desarrollado por Sifat Febo, que combina un fine-tuning del modelo SmolLM2-1.7B de HuggingFace con una capa de percepcion de unos 0,5 millones de parametros adicionales. Esta especializado en conversaciones en banglish, la mezcla de codigos entre bengali e ingles romanizado muy habitual en las comunidades bengalies, y esta disenado para ofrecer respuestas con inteligencia emocional y alineacion de seguridad.

La innovacion principal reside en su capa de percepcion, compuesta por tres clasificadores pequenos (emocion, apego y modo de respuesta) que operan de forma siempre activa antes de la generacion. Esta capa permite que el modelo adapte sus respuestas al estado emocional del usuario sin aumentar significativamente el tamano del modelo. El proyecto publica los pesos en formato safetensors (fp32, 6,8 GB), el benchmark BanglishBench v2.1 y el pipeline de inferencia, mientras que los datos de entrenamiento permanecen cerrados.

El modelo es relevante por abordar un idioma de bajos recursos en su variante code-switching, por ejecutarse en CPU sin necesidad de GPU y por su enfoque en seguridad y soporte emocional. Esta licenciado bajo Apache 2.0, lo que permite uso comercial y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM2-1.7B fine-tune + capa de percepcion (~0,5M parametros) |
| Parametros totales | 1.711.378.432 (~1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base SmolLM2-1.7B) |
| Tipos de cuantizacion | Publicados: fp32 (safetensors). Probados localmente: F16, Q8_0, Q4_K_M |
| Idiomas soportados | Bengalí e ingles en formato banglish (code-switching romanizado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 6,8 GB) |

## Arquitectura y entrenamiento

Banglish Companion parte del modelo base SmolLM2-1.7B de HuggingFace y lo ajusta mediante fine-tuning para conversacion en banglish. Sobre esta base se anade una capa de percepcion denominada "ontor" con aproximadamente 0,5 millones de parametros, compuesta por tres clasificadores: emocion (bujhi), apego (aabeg) y modo de respuesta (bhalobasha). Esta capa se ejecuta de forma siempre activa antes de la generacion, siguiendo una intuicion de ingenieria inspirada en biologia: la percepcion puede ser pequena, rapida y continua.

El modelo utiliza el tokenizador del modelo base, que no incluye chat_template, por lo que la inferencia requiere construir el prompt ChatML manualmente mediante la funcion format_chatml_prompt incluida en el pipeline ontor/perceive.py. Los datos de entrenamiento, el pipeline de entrenamiento y los hiperparametros no estan publicados. El proyecto fue desarrollado con asistencia de Claude Code (Anthropic) bajo la direccion y revision del autor.

## Capacidades

- Generacion de texto conversacional en banglish (mezcla de codigos bengali-ingles romanizado).
- Deteccion del estado emocional del usuario mediante la capa de percepcion (emocion, apego, modo de respuesta).
- Soporte emocional y conversacion empatica adaptada al estado animico del interlocutor.
- Conversacion casual: adda (charla informal), juegos, canciones y gastronomia.
- Alineacion de seguridad integrada, con tasa de exito declarada del 97-100% en BanglishBench v2.1.
- Inferencia local en CPU sin necesidad de GPU.
- No soporta tool calling, function calling ni capacidades de agente.
- No soporta escritura en alfabeto bengali ni en ingles estandar: solo banglish romanizado.

## Casos de uso

- Asistente de soporte emocional para comunidades bengalies: el modelo detecta el estado de animo del usuario y adapta sus respuestas para ofrecer contencion en conversaciones informales, sin sustituir a profesionales de la salud mental.
- Chatbot de atencion al cliente en banglish: empresas que atienden a poblacion bengali pueden desplegar el modelo en local para gestionar consultas frecuentes en el registro coloquial que usan sus clientes.
- Aplicaciones de bienestar y seguimiento emocional: integrado en apps de desahogo, el modelo mantiene conversaciones empaticas y ofrece recursos basicos, con la advertencia explicita de que no es un consejero profesional.
- Prototipos de IA conversacional en dispositivos sin GPU: gracias a su tamano reducido y soporte de CPU, es adecuado para portatiles, mini-PCs y entornos de desarrollo sin aceleracion por hardware.
- Investigacion en NLP de bajos recursos: el modelo y su benchmark BanglishBench v2.1 son recursos abiertos para estudiar code-switching, percepcion emocional y alineacion de seguridad en lenguas minorizadas.
- Practica y aprendizaje del registro coloquial banglish: puede usarse como companero de conversacion para quienes quieren mejorar su dominio de la mezcla bengali-ingles.
- Despliegue de IA privada y local: al ejecutarse enteramente en el dispositivo, es util para escenarios donde los datos no pueden salir del equipo por privacidad, regulacion o confidencialidad.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en el model-index oficial (no verificado de forma independiente):

| Benchmark | Resultado |
|---|---|
| BanglishBench v2.1 Quality Floor (oficial, no verificado) | 96,8% |

Ademas, el autor reporta pruebas locales con distintas cuantizaciones, todas con la capa de percepcion adjunta:

| Formato | BanglishBench v2.1 | Nota |
|---|---|---|
| Q4_K_M | 97,2% | Formato mas pequeno |
| Q8_0 | 96,8% | El que usan localmente |
| F16 | 95,7% | Mas cercano a los pesos publicados |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia funciona en CPU.
- RAM: los pesos fp32 ocupan 6,8 GB, por lo que se recomiendan al menos 8 GB de RAM disponibles. Las versiones cuantizadas (Q4_K_M, Q8_0) reducen notablemente el consumo.
- GPU recomendadas: ninguna; el modelo esta disenado para ejecucion local en CPU.
- Compatibilidad con GPU de consumo: si se desea acelerar, cualquier GPU con suficiente VRAM para ~7 GB (fp32) o menos (cuantizado) puede servir, aunque no es necesario.
- Opciones de despliegue: transformers (ruta soportada oficialmente) con el pipeline ontor/perceive.py. No se publican archivos GGUF, aunque el autor los genero localmente para pruebas.
- Latencia y throughput: no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia |
|---|---|---|---|---|
| banglish-companion | 1,7B + 0,5M percepcion | No disponible | Banglish conversacional con percepcion emocional | Apache 2.0 |
| SmolLM2-1.7B (base) | 1,7B | No disponible | Generacion de texto general multilingue | Apache 2.0 |
| Otros modelos banglish | No disponible | No disponible | No se han identificado modelos comparables publicados | No disponible |

La comparacion directa con alternativas es limitada porque no se han identificado otros modelos publicados especializados en banglish con capa de percepcion emocional. El modelo se distingue de su base SmolLM2-1.7B por el fine-tuning conversacional y la capa de percepcion, que no existe en el modelo original.

## Limitaciones y advertencias

- El modelo solo soporta banglish romanizado: no procesa texto en alfabeto bengali ni en ingles estandar.
- Puede alucinar contenido; el propio autor advierte que, por ser un modelo pequeno, a veces se equivoca.
- No es un consejero profesional: no debe usarse como sustituto de medicos, abogados u otros profesionales.
- La alineacion de seguridad es de "mejor esfuerzo": el autor reporta un 97-100% en BanglishBench v2.1, con un 2-3% de casos limite que implican desviaciones borderline.
- Los datos de entrenamiento, el pipeline de entrenamiento y los hiperparametros no estan publicados, lo que limita la reproducibilidad y la auditoria.
- El tokenizador no incluye chat_template: es necesario usar la funcion format_chatml_prompt del pipeline ontor para construir los prompts correctamente.
- Los resultados de BanglishBench v2.1 no estan verificados de forma independiente.
- El modelo fue desarrollado con asistencia de IA (Claude Code), aunque el autor afirma que todas las decisiones de arquitectura, datos y publicacion fueron suyas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sifat-febo/banglish-companion
- Dataset BanglishBench v2.1: https://huggingface.co/datasets/sifat-febo/banglish_bench
- Modelo base SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Tesis del proyecto (THESIS.md): disponible en el repositorio del modelo
