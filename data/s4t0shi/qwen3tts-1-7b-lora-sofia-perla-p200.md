# S4t0shi/qwen3tts-1.7b-lora-sofia-perla-p200

## Resumen

Adaptador LoRA de rango 32 publicado por el usuario S4t0shi en Hugging Face bajo el identificador `S4t0shi/qwen3tts-1.7b-lora-sofia-perla-p200`. Se trata de un ajuste fino orientado a síntesis de voz (text-to-speech) que reproduce la voz denominada "Sofía", correspondiente a la operadora "Perla" del servicio telefónico Línea 147 de la Ciudad Autónoma de Buenos Aires. El entrenamiento se realizó sobre 1.075 locuciones telefónicas reales, según declara la propia model card.

La relevancia del artefacto es acotada pero específica: no es un modelo completo, sino un adaptador que se aplica sobre un modelo base de TTS. El nombre del repositorio apunta a un modelo base de la familia Qwen3-TTS de 1,7 mil millones de parámetros, aunque la model card deja el campo "Modelo base" vacío y solo menciona un "prior fonológico ES-AR v5". El objetivo declarado es capturar prosodia rioplatense natural, con cadencia ascendente en enumeraciones de horarios y una entonación conversacional relajada propia de la atención telefónica.

El repositorio ocupa 0,2 GB, no registra descargas ni "likes" en el momento de la consulta y fue creado el 11 de septiembre de 2026. La licencia declarada es Apache-2.0. La model card está incompleta: faltan los nombres de los hiperparámetros de inferencia (solo se conservan sus valores) y no se documentan la arquitectura del modelo base, la frecuencia de muestreo ni el formato de audio de salida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre un modelo de text-to-speech; la arquitectura del modelo base no se especifica en la model card |
| Parámetros totales | No disponible para el adaptador; el nombre del repositorio sugiere un modelo base de 1,7 mil millones de parámetros, dato no confirmado en la model card |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos se distribuyen en safetensors sin cuantización declarada |
| Idiomas soportados | Español, variedad rioplatense (argentino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Rank de LoRA | 32 |
| Modelo base | No especificado en la model card (el identificador del repositorio indica un modelo de la familia Qwen3-TTS de 1,7B) |
| Dataset de entrenamiento | 1.075 locuciones telefónicas reales de la operadora Perla (Línea 147, CABA) |
| Hiperparámetros de inferencia recomendados | Tres valores declarados: 0,60-0,65; 0,92; 1,0. Las etiquetas que identifican cada parámetro no aparecen en la model card |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas de un modelo base de síntesis de voz ya entrenado. No se publica información sobre qué capas se adaptaron, el número de pasos de entrenamiento, la tasa de aprendizaje ni el régimen de precisión empleado. La model card solo indica que el ajuste se apoya en un "prior fonológico ES-AR v5" y que los datos de partida son 1.075 locuciones telefónicas reales de la operadora Perla del servicio 147 de CABA.

No se documenta el número de tokens o de horas de audio utilizados, ni la composición exacta del corpus (proporción de habla espontánea frente a lectura, duración media de las locuciones, condiciones de ruido telefónico). Tampoco se menciona el uso de RLHF, DPO ni ningún método de alineación por preferencias. La innovación declarada es exclusivamente prosódica: entonación rioplatense natural, cadencia ascendente en listas de horarios y prosodia conversacional relajada. El valor 1,0 marcado como "imprescindible" se justifica en la propia ficha como necesario para preservar los alargamientos vocálicos característicos del habla porteña.

## Capacidades

- Síntesis de voz en español rioplatense a partir de texto, aplicando el adaptador sobre el modelo base correspondiente.
- Reproducción de prosodia telefónica conversacional: entonación relajada, con patrones propios de la atención al cliente.
- Entonación ascendente en enumeraciones, pensada para la lectura de listas de horarios y turnos.
- Preservación de alargamientos vocálicos del habla porteña cuando se emplea el valor 1,0 indicado en la ficha.
- Generación de locuciones con la identidad vocal "Sofía" dentro del dominio telefónico para el que fue entrenado.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso: es un adaptador de TTS, no un modelo de lenguaje conversacional.
- No se declaran capacidades multilingües: el único idioma etiquetado es `es`, en su variedad argentina.
- No se declaran capacidades de visión, audio de entrada ni modos de pensamiento.

## Casos de uso

- Audios de espera y mensajes de IVR: el adaptador está entrenado sobre locuciones del 147 de CABA, por lo que encaja de forma directa en la locución de mensajes pregrabados de un servicio de atención telefónica municipal, con prosodia coherente con el resto del sistema.
- Lectura automática de horarios y turnos: la cadencia ascendente en listas está específicamente trabajada en el entrenamiento, lo que lo hace adecuado para generar mensajes del tipo "lunes de 8 a 14, martes de 8 a 14" sin monotonía y comprensible en una llamada telefónica.
- Prototipado de asistentes de voz para atención ciudadana: permite generar respuestas habladas en rioplatense para pruebas de concepto de un bot telefónico, antes de invertir en grabaciones profesionales.
- Personalización de marca sonora: empresas argentinas que quieran una voz consistente y localizada para notificaciones telefónicas pueden desplegar el adaptador sobre el modelo base y generar lotes de mensajes bajo demanda.
- Generación de datos sintéticos de voz: el adaptador permite crear corpus de audio rioplatense etiquetado para entrenar o evaluar sistemas de reconocimiento automático de voz con acento argentino y condiciones telefónicas.
- Evaluación de calidad de sistemas TTS: sirve como referencia de prosodia conversacional argentina en pruebas comparativas frente a voces genéricas en español neutro.
- Accesibilidad: conversión de textos institucionales (avisos, resoluciones, información de trámites) a audio con una voz local y natural para personas con discapacidad visual.
- Doblaje y contenido editorial de bajo presupuesto: producción de locuciones para vídeo o pódcast con acento rioplatense sin recurrir a un estudio de grabación.

En todos los casos, el uso práctico exige disponer del modelo base compatible y de una infraestructura de inferencia de TTS, ninguno de los cuales se documenta en la ficha del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER de re-síntesis, similitud de hablante, error de prosodia) ni comparaciones cuantitativas con otras voces.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. A partir del tamaño indicado en el identificador del repositorio (1,7B), una estimación orientativa sería de aproximadamente 4-5 GB en FP16, 2-3 GB en cuantización de 8 bits y 1,5-2 GB en 4 bits, siempre sumando el coste del decodificador de audio y de las cachés de inferencia. Estas cifras son cálculos a partir del tamaño, no datos verificados del repositorio.
- El adaptador en sí ocupa 0,2 GB, por lo que se carga en memoria sin problema; el coste real lo determina el modelo base.
- GPU recomendadas: no disponibles. Para un modelo de este tamaño, cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) debería ser suficiente en cuantizaciones bajas, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Es probable que sí, dado el orden de magnitud de 1,7B de parámetros, pero no está verificado en la información disponible.
- Opciones de despliegue: no disponibles. La model card no menciona vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia, ni indica si los pesos del adaptador son compatibles con las herramientas estándar de fusión de LoRA del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica de forma explícita el modelo base ni publica métricas, y la búsqueda web asociada no devolvió referencias técnicas relacionadas. Sin esos datos, cualquier comparación con otros adaptadores de voz en español o con voces TTS comerciales implicaría inventar cifras de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Ficha incompleta: el campo "Modelo base" está vacío y los nombres de los hiperparámetros de inferencia (0,60-0,65; 0,92; 1,0) han desaparecido del README, lo que impide reproducir la inferencia recomendada sin deducir qué parámetro corresponde a cada valor.
- Dominio muy restringido: el ajuste se ha hecho sobre locuciones telefónicas de atención al cliente. Es previsible un comportamiento degradado fuera de ese registro (narración, lectura literaria, habla espontánea no telefónica), aunque no se documenta ninguna evaluación al respecto.
- Variedad lingüística única: solo cubre español rioplatense. No hay soporte declarado para otras variedades del español ni para otros idiomas.
- Origen de los datos: el entrenamiento usa 1.075 locuciones telefónicas reales de un servicio público. No se documenta si existió consentimiento de las personas grabadas ni un proceso de anonimización, lo que supone un riesgo de privacidad y una posible barrera para el uso comercial o la redistribución, más allá de la licencia Apache-2.0 declarada para los pesos.
- Riesgo de suplantación de identidad vocal: al tratarse de un adaptador que clona una voz concreta, su uso para generar audio atribuible a una persona real sin su consentimiento plantea problemas legales y éticos.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusiones que permitan contrastar la calidad real del adaptador.
- Licencia: el adaptador se declara Apache-2.0, pero la licencia del modelo base debe verificarse por separado, ya que puede imponer condiciones adicionales al uso combinado.
- Ausencia de especificaciones de audio: no se indica frecuencia de muestreo, formato de salida, ni si el adaptador conserva el tokenizador de audio del modelo base.
- No aplica el concepto de alucinación textual, pero sí el riesgo de prosodia incorrecta o de artefactos acústicos cuando la entrada se aleja de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/S4t0shi/qwen3tts-1.7b-lora-sofia-perla-p200
- No se han encontrado enlaces adicionales relevantes (papers, repositorios, blogs o demos) en la búsqueda web asociada: los resultados devueltos corresponden a páginas de ayuda de YouTube y a hilos de foro sin relación con el modelo.
