# Glimpse-Dictation/Glimpse-C1-2B

## Resumen

Glimpse C1 2B es un adaptador LoRA especializado en la limpieza de dictado por voz, desarrollado por Glimpse-Dictation para su aplicación de dictado Glimpse. No es un modelo de propósito general: su única tarea es transformar transcripciones en bruto (con muletillas, reinicios, autocorrecciones y falta de puntuación) en texto limpio y bien formateado, ejecutándose íntegramente en el dispositivo del usuario. El adaptador se monta sobre Ternary Bonsai 2 2B de PrismML, un modelo ternario derivado de Qwen3.5, y los pesos publicados en el repositorio incluyen tanto el adaptador como la base MLX en 2 bits con los tensores de visión eliminados.

El modelo tiene 1.882.232.640 parámetros totales y un repositorio de solo 0,6 GB, lo que refleja la cuantización extrema de la base. Está entrenado con el prompt de limpieza propio de Glimpse, con la transcripción del usuario delimitada por etiquetas `<transcript>...</transcript>`, y funciona en Mac (Metal) y Windows (Vulkan). Su relevancia actual radica en que demuestra que una tarea de post-procesado lingüístico acotada puede resolverse con un modelo de 2B cuantizado a 2 bits, con latencias de 0,27 s por limpieza en un M2 Pro, superando en su suite interna a alternativas comerciales como Superwhisper S1-mini o Apple Intelligence.

La licencia es el punto crítico: el adaptador usa la licencia propietaria `glimpse-c1`, que permite su uso a través de la app Glimpse (incluido uso comercial) y uso personal en dispositivos propios, pero exige permiso escrito para distribuirlo, alojarlo, integrarlo en otro producto o entrenar sobre sus salidas. La base, en cambio, es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Ternary Bonsai 2 2B, derivada de Qwen3.5) con adaptador LoRA |
| Parametros totales | 1.882.232.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base MLX en 2 bits (ternaria); adaptador en safetensors |
| Idiomas soportados | no disponible (la suite de evaluacion incluye 55 casos "non-English") |
| Licencia | glimpse-c1 (adaptador, propietaria); base Apache 2.0 |
| Formato de pesos | safetensors (`adapter.safetensors`, `model.safetensors` MLX 2-bit) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Ternary Bonsai 2 2B de PrismML, un transformer ternario derivado de Qwen3.5 y distribuido originalmente en formato MLX de 2 bits. El repositorio publica el adaptador con los factores alpha y r plegados en la matriz B (`adapter.safetensors`), junto con los pesos de la base MLX 2-bit a los que se han eliminado los tensores de visión (`model.safetensors`), el `config.json` y el `tokenizer.json` del pack original de PrismML.

El entrenamiento se realizó sobre el prompt de limpieza interno de Glimpse, con la transcripción en bruto colocada en el turno de usuario dentro de etiquetas `<transcript>...</transcript>`. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal no es arquitectónica sino de eficiencia: conseguir una tarea de reescritura lingüística con corrección de autocorrecciones y aplicación de comandos hablados en un modelo de 2B cuantizado a 2 bits que corre en CPU/GPU de consumo.

## Capacidades

- Limpieza de dictado: eliminación de muletillas y reinicios abandonados.
- Resolución de autocorrecciones habladas (por ejemplo, "a las dos, no, en realidad a las tres" pasa a "a las tres").
- Puntuación automática de las frases generadas.
- Ejecución de comandos hablados, como convertir texto en una lista de viñetas.
- Seguimiento de modos de escritura e instrucciones de estilo (correo formal, mensaje rápido de chat).
- Procesamiento de dictado en bruto con ruido léxico y sintáctico.
- Ejecución on-device en Mac (Metal) y Windows (Vulkan).
- No es un modelo conversacional ni de propósito general; no se documentan tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Dictado en escritorio: integrado en la app Glimpse, el modelo recibe la transcripción del reconocedor de voz y devuelve texto limpio en 0,27 s en un M2 Pro, lo que permite escribir por voz sin revisar manualmente el resultado.
- Redacción de correos por voz: el modo de escritura formal convierte un dictado desordenado en un correo con puntuación y estructura, útil para usuarios que redactan más rápido hablando que tecleando.
- Notas rápidas y mensajería: el modo de chat genera mensajes concisos a partir de dictados coloquiales, con las muletillas y reinicios eliminados.
- Documentación con listas: el comando hablado "haz esto una lista de viñetas" transforma un párrafo dictado en una lista estructurada, adecuado para actas de reunión o apuntes técnicos.
- Accesibilidad: personas con movilidad reducida o dificultades de tecleado pueden dictar texto largo y obtener un resultado publicable sin edición manual, gracias a la corrección de autocorrecciones y a la puntuación automática.
- Flujos de trabajo con privacidad estricta: al ejecutarse íntegramente en el dispositivo, es apto para entornos donde el dictado no puede enviarse a la nube (sanidad, legal, banca), siempre que el uso se realice a través de la app Glimpse conforme a su licencia.
- Post-procesado de transcripciones en bruto: puede emplearse para normalizar salidas de ASR antes de almacenarlas o indexarlas, aunque la licencia restringe el despliegue fuera de la app Glimpse sin permiso escrito.

## Benchmarks y rendimiento

Resultados de la suite de limpieza de Glimpse, ejecutada en un M2 Pro con el prompt recomendado de cada modelo:

| Modelo | Suite de limpieza (171) | Autocorrecciones (24) | Habla en bruto (52) | No inglés (55) |
|---|---|---|---|---|
| Glimpse C1 2B | 162 | 22 | 47 | 54 |
| Superwhisper S1-mini | 123 | 20 | 39 | 35 |
| SimpleWords v2 | 118 | 15 | 24 | 40 |
| Apple Intelligence | 114 | 15 | 27 | 36 |
| Bonsai 2B sin entrenar | 88 | 1 | 15 | 33 |

Latencia típica de limpieza: 0,27 s en un M2 Pro. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 0,6 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 4 GB o más.
- GPU recomendadas: no se especifican modelos concretos; la model card cita ejecución en Mac con Metal y Windows con Vulkan, lo que incluye GPUs integradas y dedicadas de gama media.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del repo y la cuantización a 2 bits.
- Opciones de despliegue: la vía soportada es la app Glimpse; los pesos están en formato MLX 2-bit, por lo que la inferencia fuera de Glimpse requiere herramientas compatibles con MLX o conversión a otro formato, no documentada.
- Latencia y throughput: 0,27 s por limpieza típica en un M2 Pro; no se publican cifras de throughput ni de latencia en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Suite de limpieza (171) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glimpse C1 2B | 1,88B | no disponible | 162 | glimpse-c1 (propietaria) | Pesos en HF, uso restringido a la app Glimpse |
| Superwhisper S1-mini | no disponible | no disponible | 123 | no disponible | Producto comercial |
| SimpleWords v2 | no disponible | no disponible | 118 | no disponible | no disponible |
| Apple Intelligence | no disponible | no disponible | 114 | propietaria | Integrado en macOS/iOS |
| Bonsai 2B sin entrenar | ~2B | no disponible | 88 | Apache 2.0 | Pesos abiertos en HF |

## Limitaciones y advertencias

- Es un modelo de 2B: los dictados largos o muy enrevesados pueden devolver una corrección omitida o conservar una frase que debería haberse eliminado.
- Los modos de escritura se siguen en aproximadamente el 80 % de los casos reservados para evaluación.
- Está ajustado exclusivamente para limpieza de dictado; no es un modelo de chat y su rendimiento con otros prompts es previsiblemente peor.
- La licencia `glimpse-c1` prohíbe distribuir, compartir o alojar el adaptador, integrarlo en otro producto o servicio, otros usos comerciales y entrenar sobre sus salidas sin permiso escrito de Glimpse.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de reescritura, el riesgo principal es la alteración o pérdida de contenido del dictado original.
- La cobertura de idiomas no está declarada; solo se aportan resultados agregados de 55 casos no ingleses.
- No se especifica la longitud de contexto, lo que limita la planificación de despliegues con dictados muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Glimpse-Dictation/Glimpse-C1-2B
- Licencia del adaptador: https://huggingface.co/Glimpse-Dictation/Glimpse-C1-2B/blob/main/LICENSE-C1.md
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-mlx-2bit
- Anuncio del modelo: https://tryglimpse.cc/blog/c1-cleanup-model
- Aplicación Glimpse: https://tryglimpse.cc
- Contacto para licencias: hello@tryglimpse.cc
