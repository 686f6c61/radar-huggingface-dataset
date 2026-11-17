# KarlKinda/sabi-noema-MLX-6bit

## Resumen

sabi-noema-MLX-6bit es una cuantización de 6 bits en formato MLX del modelo sabicap/sabi-noema, un ajuste fino (fine-tune) de la familia Qwen3.5 con 27.356.728.560 parámetros totales (aproximadamente 27,4 mil millones). Lo publica el usuario KarlKinda y está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX, con el objetivo de reducir el peso del modelo base (el repositorio ocupa 22,8 GB) manteniendo la fidelidad de los pesos originales gracias a una cuantización afín con tamaño de grupo 64.

El modelo es multimodal: su pipeline es image-text-to-text, lo que indica que acepta tanto texto como imágenes como entrada y genera texto. Al derivar de la familia Qwen3.5, hereda previsiblemente las capacidades conversacionales y de razonamiento de esa arquitectura, aunque la model card no detalla la composición exacta del entrenamiento ni los idiomas soportados.

Su relevancia actual radica en que permite desplegar un modelo de casi 27.400 millones de parámetros en equipos con memoria unificada de Apple (Mac Studio, MacBook Pro de gama alta) sin recurrir a GPUs dedicadas, y en que se acompaña de un modelo draft (KarlKinda/sabi-noema-DFlash2) para decodificación especulativa con el motor Splash. La información pública disponible es escasa: no hay benchmarks, no se detallan idiomas y la model card es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (aproximadamente 27,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, cuantizacion afín (affine) con tamaño de grupo 64, formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantizados a 6 bits |

## Arquitectura y entrenamiento

El modelo base sabicap/sabi-noema es un fine-tune de Qwen3.5 con aproximadamente 27.400 millones de parámetros y pipeline image-text-to-text, lo que implica un transformer multimodal con codificador de visión y decodificador de lenguaje. Esta versión concreta no reentrena el modelo: aplica una cuantización de 6 bits con esquema afín y grupo de 64 sobre los pesos originales, empaquetados en safetensors para la librería MLX. El repositorio resultante pesa 22,8 GB.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas específicas más allá de la propia cuantización. La model card menciona que el modelo se diseñó para usarse junto con un modelo draft (KarlKinda/sabi-noema-DFlash2) para decodificación especulativa mediante el motor Splash, lo que sugiere que el ecosistema previsto prioriza latencia baja en inferencia local.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del fine-tune sobre Qwen3.5.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text): acepta imágenes junto con prompts textuales.
- Razonamiento y generación de código: capacidades esperables de la familia Qwen3.5, aunque no verificadas en la información disponible.
- Decodificación especulativa mediante el modelo draft sabi-noema-DFlash2, orientada a reducir latencia.
- Ejecución nativa en Apple Silicon a través de MLX.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: un Mac Studio con 32 GB o más puede cargar los 22,8 GB de pesos cuantizados y ejecutar el modelo sin GPU dedicada, lo que permite prototipar asistentes multimodales en local.
- Asistente conversacional con imágenes: al aceptar entradas image-text-to-text, sirve para describir capturas, responder preguntas sobre diagramas o extraer información de documentos escaneados en flujos de trabajo personales.
- Decodificación especulativa de baja latencia: combinado con sabi-noema-DFlash2 y el motor Splash, es adecuado para aplicaciones interactivas donde la latencia de generación es crítica, como autocompletado o chat en tiempo real.
- Evaluación de fine-tunes de Qwen3.5: investigadores que quieran comparar el comportamiento del fine-tune sabi-noema frente al modelo base pueden usar esta cuantización como versión ligera para pruebas rápidas.
- Desarrollo de pipelines MLX: sirve como referencia práctica para integraciones con la librería MLX y para medir el impacto de la cuantización de 6 bits en calidad frente a los pesos originales.
- Despliegue en entornos con restricciones de memoria: cuando no se dispone de GPUs con 80 GB de VRAM, la versión de 6 bits permite ejecutar un modelo de 27.400 millones de parámetros en hardware de consumo de gama alta Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 22,8 GB, por lo que se necesita al menos esa cantidad de memoria unificada más el espacio para el contexto y las activaciones; en la práctica, se recomienda un mínimo de 32 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon con memoria unificada (series M1/M2/M3/M4 Pro, Max y Ultra). No está pensado para GPUs NVIDIA o AMD, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? No en GPUs de consumo convencionales por el formato MLX; en Apple Silicon, sí en configuraciones de 32 GB o superiores, con margen ajustado.
- Opciones de despliegue: motor Splash (`splash serve --model local/sabi-noema --model-dir sabi-noema-MLX-6bit --draft-model sabi-noema-DFlash2`), según la model card. Otros motores MLX podrían funcionar, aunque no se garantiza.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sabi-noema-MLX-6bit | ~27,4 mil millones | no disponible | MLX safetensors 6 bits | Apache-2.0 | Cuantización para Apple Silicon con modelo draft |
| sabicap/sabi-noema (base) | ~27,4 mil millones | no disponible | safetensors sin cuantizar | Apache-2.0 | Modelo original del que deriva esta versión |
| Qwen3.5 (familia) | ~27 mil millones (variante correspondiente) | no disponible | safetensors, GGUF y otros | según variante | Arquitectura de origen del fine-tune |

La comparación con alternativas de otros ecosistemas (por ejemplo, cuantizaciones GGUF para llama.cpp) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta idiomas, contexto, datos de entrenamiento ni evaluación, lo que dificulta validar su comportamiento en producción.
- Riesgo de degradación por cuantización: la conversión a 6 bits con grupo de 64 puede introducir pérdida de calidad frente a los pesos originales, especialmente en tareas de razonamiento o código; no se han publicado comparativas.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones específicas que lo cuantifiquen.
- Sesgos: no documentados; al desconocerse la composición del dataset de entrenamiento, no se pueden evaluar sesgos de género, idioma o cultura.
- Dependencia de hardware Apple: el formato MLX limita su uso a Apple Silicon y a motores compatibles, lo que restringe su portabilidad a servidores con GPU convencionales.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base sabicap/sabi-noema y de Qwen3.5, de los que hereda obligaciones.
- Sin garantías de soporte: el autor tiene un historial mínimo (12 descargas, 0 likes) y no se ofrece mantenimiento ni documentación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KarlKinda/sabi-noema-MLX-6bit
- Modelo base: https://huggingface.co/sabicap/sabi-noema
- Modelo draft para decodificación especulativa: https://huggingface.co/KarlKinda/sabi-noema-DFlash2
