# MohammadJRanjbar/ParsVoice-XTTS

## Resumen

ParsVoice-XTTS es un ajuste fino (fine-tune) del modelo de síntesis de voz Coqui XTTS-v2, desarrollado por el usuario MohammadJRanjbar y publicado en Hugging Face bajo licencia MIT. Su objetivo es adaptar las capacidades de clonación de voz y generación de habla multilingüe de XTTS-v2 al idioma persa (farsi), un idioma con menor representación en los corpus de entrenamiento de los modelos TTS multilingües de código abierto. El modelo se distribuye con acceso restringido (gated), lo que obliga a aceptar condiciones en la plataforma antes de su descarga.

El modelo hereda la arquitectura de XTTS-v2, un sistema TTS autorregresivo basado en transformer con un codificador de altavoz separado que permite la clonación de voz zero-shot a partir de unos pocos segundos de audio de referencia. El repositorio ocupa 5,7 GB, un tamaño coherente con los pesos completos de XTTS-v2 más los artefactos del ajuste fino. Se desconoce el volumen exacto de datos de entrenamiento utilizado en el ajuste.

Su relevancia radica en que cubre un hueco práctico: la síntesis de voz en persa de calidad con clonación de voz y licencia permisiva (MIT), algo poco habitual en el ecosistema open source, donde la mayoría de modelos TTS de calidad están limitados a inglés o a un conjunto reducido de idiomas europeos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo basado en transformer (heredada de Coqui XTTS-v2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | persa (fa) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 5,7 GB; presumiblemente checkpoints PyTorch, no confirmado) |

## Arquitectura y entrenamiento

ParsVoice-XTTS es un fine-tune de coqui/XTTS-v2, un modelo TTS que combina un modelo de lenguaje autorregresivo para la generación de tokens de audio discretos con un codificador de altavoz que condiciona la síntesis para imitar la voz de referencia. XTTS-v2 originalmente soporta 17 idiomas y clonación de voz zero-shot con audio de referencia corto; este ajuste reorienta el modelo hacia el persa mediante entrenamiento sobre el dataset MohammadJRanjbar/ParsVoice, referenciado en las etiquetas del repositorio.

No se dispone de información pública sobre el número de horas de audio, la composición del corpus, el número de pasos de entrenamiento ni la metodología exacta (si hubo ajuste completo o LoRA, por ejemplo). Tampoco se documentan innovaciones técnicas adicionales más allá de las que aporta la arquitectura base de XTTS-v2.

## Capacidades

- Síntesis de voz (text-to-speech) en persa a partir de texto escrito.
- Clonación de voz zero-shot: permite condicionar la voz generada con una muestra de audio de referencia, capacidad heredada de XTTS-v2.
- Generación de habla con prosodia natural derivada del modelo base multilingüe.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-step (no aplica a un modelo TTS).
- Capacidades multilingües: limitadas al persa según la etiqueta de idioma del repositorio; el modelo base soporta más idiomas, pero el fine-tune está orientado a fa.
- No se documentan modos especiales (thinking, visión, audio de entrada más allá de la referencia de voz).

## Casos de uso

- Audiolibros y narración en persa: el modelo puede convertir texto largo en audio con una voz consistente usando una referencia de altavoz fija, adecuado para contenido editorial y educativo en farsi.
- Doblaje y localización de contenido: clonación de voz para adaptar vídeos o cursos al persa manteniendo el timbre del locutor original, útil en productoras y equipos de localización.
- Asistentes de voz para aplicaciones en persa: integración en pipelines de TTS para interfaces conversacionales dirigidas a usuarios iraníes, donde escasean opciones open source con licencia permisiva.
- Accesibilidad: generación de audio para personas con discapacidad visual a partir de documentos en persa, con voces personalizadas.
- Prototipado de productos de voz: gracias a la licencia MIT, permite experimentar y desplegar en productos comerciales sin las restricciones de licencias no comerciales habituales en TTS.
- Investigación en TTS de bajos recursos: sirve como punto de partida para estudiar adaptación de modelos multilingües a idiomas con poca representación, comparando con el XTTS-v2 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (5,7 GB) y la arquitectura XTTS-v2, se requiere habitualmente una GPU con al menos 6-8 GB de VRAM para inferencia en precisión completa, aunque esta cifra no está confirmada para este fine-tune.
- GPU recomendadas: no disponible; por analogía con XTTS-v2, GPUs consumer como RTX 3060/4070 o superiores suelen ser suficientes, y A100/H100 para despliegues de alto throughput.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs con 8 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: no documentadas para este modelo; el ecosistema de Coqui TTS (librería `TTS`) es el camino natural, aunque no se confirma compatibilidad explícita.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion de voz | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| ParsVoice-XTTS | no disponible | persa (fa) | sí (heredada de XTTS-v2) | MIT | texto + audio de referencia |
| coqui/XTTS-v2 | no disponible | 17 idiomas (incluye fa de forma limitada) | sí | Coqui Public Model License (no comercial) | texto + audio de referencia |
| Modelos TTS persas open source | no disponible | persa | variable | variable | no disponible |

La comparativa cuantitativa con alternativas no está disponible en la información proporcionada. El principal diferenciador frente a XTTS-v2 es la especialización en persa y la licencia MIT, más permisiva que la licencia del modelo base de Coqui.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Idiomas: el ajuste está orientado exclusivamente al persa; el rendimiento en otros idiomas no está garantizado y probablemente se degrade respecto al modelo base.
- Datos de entrenamiento no documentados: se desconoce el corpus, su licencia y su procedencia, lo que dificulta evaluar sesgos de voz (género, acento, registro) y riesgos de derechos sobre el audio.
- Riesgo de uso indebido de clonación de voz: la capacidad de clonar voces plantea riesgos de suplantación y deepfakes; conviene implementar controles de consentimiento en producción.
- Alucinación y errores de pronunciación: como todo TTS, puede producir prosodia incorrecta, omisiones o pronunciaciones erróneas en textos con nombres propios, siglas o números.
- Licencia MIT declarada, pero la procedencia del dataset y del modelo base (Coqui Public Model License) puede imponer restricciones adicionales que conviene revisar antes de un uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (MOS, WER) frente a alternativas.
- Mantenimiento incierto: el modelo depende del ecosistema Coqui, cuyo soporte corporativo cesó, lo que puede afectar a la compatibilidad futura de herramientas.

## Enlaces

- Hugging Face: https://huggingface.co/MohammadJRanjbar/ParsVoice-XTTS
- Dataset referenciado: https://huggingface.co/datasets/MohammadJRanjbar/ParsVoice
- Modelo base: https://huggingface.co/coqui/XTTS-v2
