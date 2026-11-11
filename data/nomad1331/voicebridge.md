# Nomad1331/voicebridge

## Resumen

VoiceBridge es un adaptador LoRA de PEFT sobre el modelo de reconocimiento de voz `openai/whisper-small`, desarrollado por el usuario Nomad1331. Su objetivo es mejorar la transcripción de habla disártrica, un trastorno motor del habla que degrada la articulación y que los sistemas ASR convencionales transcriben con una tasa de error muy elevada. El adaptador se ha afinado sobre el corpus TORGO, un conjunto de grabaciones de hablantes con disartria y parálisis cerebral, y en concreto sobre tres hablantes concretos (M02, M04 y M05).

La relevancia del modelo es acotada pero clara: demuestra que un ajuste fino ligero (7,1 MB de pesos, r=16, alpha=32 sobre `q_proj` y `v_proj`) puede reducir drásticamente el WER en habla disártrica severa respecto al Whisper base, a un coste computacional mínimo. No obstante, se trata de una adaptación dependiente del hablante, no de un modelo general de disartria: solo se ha entrenado y evaluado con los mismos tres hablantes de TORGO, y no se ha probado con un cuarto hablante.

El modelo se publica como adaptador PEFT que requiere cargar el Whisper-small original y superponer los pesos LoRA. Está pensado para el escenario de demostración del proyecto VoiceBridge y su uso en producción fuera de ese ámbito requiere una validación adicional con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (transformer encoder-decoder para ASR) con adaptador LoRA de PEFT |
| Parametros totales | Whisper-small base (~244 M); adaptador LoRA ~7,1 MB de pesos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper-small: 30 s por segmento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplica al modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | other (sujeta al acuerdo de usuario del LDC para TORGO; el modelo base es MIT) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `openai/whisper-small`, un transformer encoder-decoder de tipo seq2seq diseñado para reconocimiento de voz. Sobre el modelo base se aplica un LoRA de rango 16 y alpha 32 únicamente en las proyecciones `q_proj` y `v_proj` de la atención. El entrenamiento parte de un adaptador previo, `Aaliya05/voicebridge`, y se continúa con 443 enunciados de los hablantes M02, M04 y M05 del corpus TORGO. Se excluyeron explícitamente las 11 filas cuyo texto de referencia coincide con alguna de las tres frases de demostración, de modo que los clips de demo no forman parte del entrenamiento.

No se documenta el número de tokens de audio procesados, la composición completa del dataset ni si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco se especifica la función de pérdida, el número de épocas ni los hiperparámetros de optimización. La innovación principal no es arquitectónica sino metodológica: un ajuste de bajo rango sobre un modelo pequeño que consigue mejoras notables en habla disártrica severa con un coste de almacenamiento ínfimo.

## Capacidades

- Reconocimiento automático de voz en inglés (transcripción de audio a texto).
- Adaptación específica a habla disártrica de tres hablantes de TORGO (M02, M04, M05).
- Mejora de la transcripción en habla severamente afectada respecto al Whisper-small original, según las métricas reportadas por el autor.
- Funciona como adaptador PEFT superponible al modelo base, sin necesidad de reentrenar Whisper completo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades de visión, audio generativo ni modo "thinking".
- Capacidad multilingüe limitada al inglés, idioma del corpus de entrenamiento.

## Casos de uso

- Demostración de transcripción de habla disártrica: el adaptador se usa con los tres clips de demo del proyecto VoiceBridge para mostrar la reducción de WER frente al Whisper-small base. Es el escenario para el que fue diseñado y validado.
- Investigación en ASR para habla patológica: sirve como punto de partida para experimentos de ajuste fino con LoRA sobre TORGO, permitiendo reproducir y extender los resultados con un coste de cómputo bajo.
- Prototipado de sistemas de comunicación aumentativa y alternativa (AAC): con validación previa con el usuario final, podría integrarse en herramientas de dictado para personas con disartria de los perfiles cubiertos.
- Evaluación comparativa de adaptadores PEFT: al ser un adaptador pequeño y bien delimitado, resulta útil como referencia en estudios sobre el impacto del rango LoRA y las capas objetivo en tareas de ASR especializado.
- Transcripción de archivos de audio de los hablantes M02, M04 y M05: para conjuntos de grabaciones de estos mismos hablantes, el adaptador puede aplicarse en lote con WhisperProcessor y PeftModel.
- Docencia y formación: ejemplo práctico de ajuste fino con PEFT sobre un modelo seq2seq de audio, adecuado para talleres sobre ASR y adaptación de dominio.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre los tres clips de demostración, con la métrica del producto:

| Clip | Hablante | WER |
|---|---|---:|
| Leve | M05 | 0,0 % |
| Moderado-severo | M04 | 16,7 % |
| Severo | M02 | 0,0 % |

WER medio por clip: 5,6 %. WER sobre el corpus: 6,2 %.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con el Whisper-small base en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Whisper-small ocupa aproximadamente 1 GB en fp16; el adaptador añade unos pocos MB. En fp32, el modelo base ronda los 1 GB adicionales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers + peft (vía `PeftModel.from_pretrained`), y potencialmente vLLM o TGI si se fusionan los pesos LoRA en el modelo base. llama.cpp/Ollama requerirían conversión a GGUF del modelo fusionado, no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoiceBridge (este) | Whisper-small (~244 M) + LoRA ~7,1 MB | no disponible (30 s por segmento) | en | other (LDC/TORGO) | Hugging Face, adaptador PEFT |
| openai/whisper-small | ~244 M | 30 s por segmento | multilingüe | MIT | Hugging Face, transformers |
| Aaliya05/voicebridge | Whisper-small + LoRA | no disponible | en | no disponible | Hugging Face, adaptador PEFT |
| Whisper-large-v3 | ~1,55 B | 30 s por segmento | multilingüe | MIT | Hugging Face, transformers |

La comparación directa con Whisper-small es la más relevante: VoiceBridge añade un adaptador de 7,1 MB que, según el autor, reduce el WER en habla disártrica de los hablantes cubiertos, a cambio de perder generalidad multilingüe y quedar restringido a tres hablantes. Frente a Whisper-large-v3, el modelo base es mucho más pequeño y rápido, pero no se dispone de datos que comparen su rendimiento en disartria con el modelo grande.

## Limitaciones y advertencias

- Adaptación dependiente del hablante: entrenado y evaluado solo con M02, M04 y M05 de TORGO; no se ha evaluado con un cuarto hablante y el habla severa de un hablante no visto queda fuera de soporte.
- Los resultados de WER (0,0 % en dos clips) proceden de una muestra muy pequeña y del propio benchmark del producto; no deben generalizarse.
- El rendimiento con micrófono en vivo varía según el canal y la sala, según advierte el autor.
- Riesgo de alucinación en la transcripción: como todo modelo Whisper, puede generar texto plausible no presente en el audio, especialmente con ruido o habla atípica.
- Sesgos: el corpus TORGO tiene un número reducido de hablantes y características demográficas y de grabación concretas; el adaptador hereda esos sesgos.
- Licencia restrictiva: el adaptador deriva de grabaciones TORGO, distribuidas bajo el acuerdo de usuario del Linguistic Data Consortium; es necesario revisar los términos de redistribución antes de publicar un fork o usar comercialmente.
- El modelo base es MIT, pero la licencia del adaptador se declara como "other", lo que limita la claridad sobre el uso comercial del conjunto.
- Solo inglés; no apto para otros idiomas sin reentrenamiento.
- No hay información sobre cuantizaciones, latencia ni throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Nomad1331/voicebridge
- Modelo base: https://huggingface.co/openai/whisper-small
- Adaptador previo: https://huggingface.co/Aaliya05/voicebridge
- Dataset TORGO: https://huggingface.co/datasets/abnerh/TORGO-database
- Repositorio GitHub del proyecto (referenciado en la model card, con `LIMITS.md` y `facts.json`): no disponible la URL exacta en la información proporcionada
