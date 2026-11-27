# ladll/edda-v0.2-ggml

## Resumen

Edda v0.2 GGML es la conversión al formato whisper.cpp/ggml del modelo de reconocimiento automático del habla (ASR) danish-foundation-models/edda-v0.2, un ajuste fino en danés de whisper-large-v3-turbo de OpenAI. El modelo original lo desarrolla Danish Foundation Models y esta conversión la publica el usuario ladll para su uso en Dentate, una aplicación local de dictado. El problema que resuelve es permitir la inferencia de un modelo ASR de calidad sobre hardware de consumo sin depender de PyTorch ni de infraestructura GPU de datacenter, gracias al runtime en C/C++ de whisper.cpp.

La relevancia actual del artefacto reside en su formato: al estar empaquetado en ggml, puede ejecutarse en CPU, en GPUs modestas y en entornos embebidos, lo que lo hace adecuado para aplicaciones de dictado, transcripción offline y pipelines de subtitulado en danés donde la privacidad o la latencia local son requisitos. Los pesos son idénticos a los del modelo original salvo la conversión de formato y, en el fichero `q5_0`, la cuantización a 5 bits.

El repositorio ocupa 2,2 GB y contiene dos variantes: `f16` (precisión completa tal como se publicó) y `q5_0` (cuantizada). No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de distribución cuyo valor está en la portabilidad y en la reducción de requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible (hereda los de whisper-large-v3-turbo; no se indica cifra en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper; no se especifica en la model card) |
| Tipos de cuantizacion | fp16 (f16) y 5 bits (q5_0) |
| Idiomas soportados | danes (da) |
| Licencia | Apache-2.0 |
| Formato de pesos | ggml (.bin para whisper.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo de OpenAI: un transformer encoder-decoder con atención multitesta entrenado para transcripción y traducción de voz. El modelo base edda-v0.2 es un ajuste fino en danés de ese checkpoint, realizado por Danish Foundation Models. Esta publicación no aporta información sobre el volumen de datos de entrenamiento, la composición del corpus danés, ni si hubo etapas de RLHF o DPO; esos detalles corresponden a la model card del modelo original y no se incluyen en la información disponible.

La innovación técnica de esta versión es exclusivamente de empaquetado: la conversión a ggml permite ejecutar el modelo con whisper.cpp, un runtime en C/C++ sin dependencias de PyTorch, con soporte de cuantización. El autor indica que los pesos no se modifican salvo la conversión de formato y la cuantización del fichero `q5_0`, y proporciona sumas de verificación SHA256 junto con un script reproducible (`scripts/convert-model.sh`) con entradas fijadas.

## Capacidades

- Reconocimiento automático del habla en danés, con salida de transcripción.
- Conversión de voz a texto en local, sin necesidad de servicios en la nube.
- Ejecución mediante whisper.cpp en CPU y GPU, con soporte de cuantización para reducir memoria.
- Uso en aplicaciones de dictado (el caso declarado es la app Dentate).
- No se documentan en la información proporcionada capacidades de tool calling, agentes, visión, audio más allá de ASR ni modo de razonamiento extendido.
- El multilingüismo no está garantizado: el ajuste fino y la etiqueta de idioma se limitan al danés.

## Casos de uso

- Dictado local en danés: integrar el fichero `q5_0` en una aplicación de escritorio que transcriba voz a texto sin conexión, aprovechando el bajo consumo de memoria de la cuantización a 5 bits.
- Subtitulado de vídeo en danés: procesar pistas de audio con whisper.cpp en un pipeline por lotes, generando transcripciones temporizadas para archivos multimedia.
- Transcripción de reuniones con privacidad: ejecutar el modelo en la máquina del usuario para evitar enviar audio confidencial a APIs externas, usando la variante `f16` cuando la precisión sea prioritaria.
- Asistentes de voz embebidos: desplegar el modelo en dispositivos con recursos limitados (Raspberry Pi, mini-PC) gracias al runtime en C/C++ y a la ausencia de dependencias pesadas.
- Investigación en ASR danés: usar el artefacto como referencia reproducible para comparar el rendimiento de whisper.cpp frente a implementaciones en PyTorch sobre el mismo checkpoint.
- Accesibilidad: generar transcripciones en tiempo real para personas con discapacidad auditiva en entornos donde el danés es la lengua de uso.
- Archivado y búsqueda de audio: transcribir grandes volúmenes de grabaciones históricas en danés para indexarlas y hacerlas consultables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 2,2 GB, por lo que la variante `f16` requiere del orden de esa cifra de memoria y la `q5_0` una cantidad inferior, aunque no se detalla en la información proporcionada.
- GPU recomendadas: no se indican modelos concretos en la información disponible.
- Compatibilidad con GPU de consumo: plausible por el formato ggml y la cuantización, pero no se confirma en la model card.
- Opciones de despliegue: whisper.cpp; no se mencionan vLLM, TGI, llama.cpp ni Ollama (estos últimos no aplican a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ladll/edda-v0.2-ggml | no disponible | no disponible | da | Apache-2.0 | ggml |
| danish-foundation-models/edda-v0.2 | no disponible | no disponible | da | Apache-2.0 | safetensors (presumible, no confirmado) |
| openai/whisper-large-v3-turbo | no disponible | no disponible | multilingue | MIT | safetensors / otros |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo está ajustado exclusivamente para danés; su uso en otros idiomas no está respaldado por la model card.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- Sesgos: no se documentan en la información disponible; al derivar de Whisper, puede heredar sesgos de su corpus de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Whisper es MIT y el ajuste fino es de terceros; conviene revisar la model card original para condiciones adicionales.
- Solo se ofrecen dos precisiones (f16 y q5_0); no hay variantes intermedias ni versiones para otros runtimes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.
- No se proporcionan métricas de calidad (WER) ni comparaciones con el modelo original en formato PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/ladll/edda-v0.2-ggml
- Modelo base: https://huggingface.co/danish-foundation-models/edda-v0.2
- whisper.cpp: no se incluye enlace en la información proporcionada
- OpenAI Whisper (large-v3-turbo): no se incluye enlace en la información proporcionada
- Script de conversión: `scripts/convert-model.sh` dentro del repositorio
