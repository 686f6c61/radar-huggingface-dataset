# AEECollier/s1-jev-cvltist

## Resumen

s1-jev-cvltist es un adaptador LoRA de 124 MB entrenado sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario AEECollier como espejo personal del repositorio canónico CVLTAI/s1-jev-cvltist. Forma parte del proyecto «system one» (s1-v6), una iniciativa abierta para construir un modelo de decisión local compatible con la especificación de cable de Jev, el modelo propietario de TypeSafe AI. En lugar de devolver una respuesta categórica, el modelo devuelve probabilidades calibradas sobre opciones, puntuaciones o ramas sí/no/no-a-menos-que, siguiendo los tres tipos de tarea de la especificación: `choice`, `score` y `noul`.

El problema que aborda es concreto: los modelos de decisión tipo «System One» necesitan calibración fiable, consistencia ante negaciones y cobertura (saber cuándo la evidencia es insuficiente), tres áreas donde Jev y sus clones abiertos suelen fallar. La solución técnica consiste en mantener la base instruccional general (Qwen3.5-4B, licencia Apache-2.0, 262 000 tokens de contexto nativo) y añadir un adaptador fino que aprende una regla de puntuación NLL sobre las claves de opción, con lectura por logit de token único. El adaptador declara una ventana de 4096 tokens y soporta hasta 255 opciones por pregunta de tipo `choice`.

La relevancia del lanzamiento es doble. Por un lado, ofrece cifras de calibración poco habituales en modelos abiertos de este tamaño: ECE agrupado de 0.0169 tras escalado de temperatura a T=1.5 y Brier de 0.1441. Por otro, se publica íntegramente bajo Apache-2.0 y con una postura de licencia comercialmente segura, en contraste con el modelo de referencia propietario de TypeSafe AI, que se distribuye por API con acceso en lista de espera desde el 15 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3.5-4B) con adaptador LoRA sobre proyecciones de atención y MLP |
| Parámetros totales | 4B en el modelo base; adaptador LoRA de ~124 MB |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en el adaptador; 262 000 tokens nativos en el modelo base |
| Tipos de cuantización | no disponible (adaptador publicado en bf16; no se ofrecen variantes GGUF ni cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere el modelo base Qwen/Qwen3.5-4B) |

Configuración adicional del adaptador: LoRA con `r=16`, `alpha=32` y dropout 0.05, aplicado a las proyecciones de atención `q/k/v/o`, a las proyecciones MLP `gate/up/down` y a los módulos `in_proj` con compuerta.

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre un transformer denso. La innovación no está en el backbone sino en la cabeza de lectura: `LogitReadout` (en `eval/readout.py`) aplica teacher forcing a cada clave de opción y lee el logit del token único correspondiente, puntuando las claves en lotes (`key_batch`) para acotar el pico de memoria. Esta es la misma regla de puntuación propia NLL usada durante el entrenamiento, lo que mantiene la coherencia entre entrenamiento e inferencia. Las respuestas incluyen el vector completo de probabilidades sobre las opciones, no solo la opción ganadora, lo que permite explotar calibración y cobertura aguas abajo.

El entrenamiento se realizó sobre la mezcla `mixture_v6`, con 264 162 filas de los tipos choice/score/noul, una sola época, 8077 pasos de optimizador, batch efectivo de 32 y contexto de 4096, con pérdida final en el rango ~0.06–0.28. La composición del dataset es: tsi (128 000 filas, 48.5 %, subconjunto comercialmente seguro `tsi-perm` de TaskSource-instruct con 129 tareas de NLI, contrafactuales y conocimiento), go_emotions (86 820, 32.9 %, multietiqueta con aumento de orden), banking77 (19 986, 7.6 %, intención de 77 clases con render solo de clave), boolq (18 854, 7.1 %, CC-BY-SA, con pares de negación), severity (4 946, 1.9 %, escala propia de severidad), nimble (4 464, 1.7 %, pares contrastivos c2d con inversión de evidencia) e injection (1092, 0.4 %, robustez frente a inyección de prompt). El pipeline completo de entrenamiento, evaluación, calibración y servido está en `github.com/cvlt-ai/decision-model`.

En cuanto a la postura de licencia de la línea de publicación, el modelo base es Apache-2.0 y TSI es el subconjunto comercialmente seguro; BoolQ es CC-BY-SA y solo entra mediante la puerta `--include-sa`. Las filas no comerciales (anli, multi_nli, snli, ai2_arc, hellaswag) quedan en cuarentena fuera de la mezcla de publicación.

## Capacidades

- Clasificación con probabilidades calibradas: devuelve una distribución completa sobre las opciones, no solo la etiqueta ganadora.
- Tres tipos de tarea según la especificación de cable de Jev: `choice` (clave elegida más vector de probabilidad, hasta 255 opciones), `score` (puntuación en escala de 2 a 10 con distribución) y `noul` (probabilidad en [0,1] para la rama sí/no/no-a-menos-que).
- Clasificación de intención: el entrenamiento sobre Banking77 le permite resolver problemas de 77 clases.
- Reconocimiento de emociones multietiqueta: cobertura derivada del corpus GoEmotions.
- Verificación de afirmaciones y respuesta a preguntas booleanas: capacidad heredada de BoolQ y del conjunto de negación, con baja tasa de violación de negación (0.022).
- Consistencia ante negación e invarianza: diseñado explícitamente para no cambiar de respuesta cuando se niega la pregunta de forma equivalente.
- Cobertura y abstención: el modelo puede expresar incertidumbre mediante probabilidades bajas, lo que permite detectar cuándo la evidencia es insuficiente.
- Robustez frente a inyección de prompt: familia específica en el dataset de entrenamiento, con 0.9921 de exactitud en el holdout.
- Conocimiento general: heredado del modelo base instruccional, con 0.438 en MMLU Pro, lo que constituye su principal carencia.
- Idiomas: solo inglés declarado.
- Tool calling, agentes, visión, audio y modo de razonamiento extendido: no disponible.

## Casos de uso

- Enrutado de intención en asistentes conversacionales: con 0.9324 de exactitud en las 77 clases de Banking77 y capacidad de devolver la distribución completa, el modelo puede alimentar un clasificador de intención que además exponga confianza al orquestador para decidir si escala a un humano.
- Moderación de contenido con umbrales probabilísticos: el tipo `noul` permite obtener una probabilidad en [0,1] sobre si un texto incumple una política, y el ECE de 0.0169 tras temperatura permite fijar umbrales operativos sin recalibrar manualmente.
- Detección de alucinación en pipelines RAG: dado un contexto recuperado y una afirmación generada, el modelo puede actuar como verificador con salida probabilística, y su consistencia ante negaciones (0.022 de violación) reduce los falsos positivos en reformulaciones.
- Triaje de tickets de soporte por severidad: la familia `severity` (0.6568 de exactitud) permite asignar una escala ordenada de 2 a 10 con distribución asociada, útil para priorizar colas sin reglas heurísticas frágiles.
- Análisis de sentimiento y emoción en opiniones de producto: pese a ser la familia grande más débil (0.6005 en go_emotions), sigue siendo utilizable para etiquetado multietiqueta preliminar con revisión humana posterior.
- Filtro de seguridad frente a inyección de prompt: con 0.9921 de exactitud en la familia `injection`, puede colocarse como barrera previa a un LLM generativo para descartar entradas maliciosas antes de que lleguen al modelo principal.
- Anotación asistida y preetiquetado de corpus: al devolver probabilidades calibradas, permite seleccionar automáticamente las muestras de alta confianza para etiquetado automático y derivar las dudosas a revisión humana.
- Sistemas de decisión de baja latencia compatibles con Jev: el diseño de lectura por logit de token único hace que el coste de inferencia sea bajo, lo que encaja en bucles de decisión con múltiples preguntas por estado.

## Benchmarks y rendimiento

Evaluación sobre el holdout congelado completo de 35 594 filas, 9 familias, 1024 tokens de contexto y T=1.0:

| Métrica | s1-jev-cvltist (release) |
|---|---:|
| Exactitud macro (no ponderada, 9 familias) | 0.7747 |
| MMLU Pro (n=12 032) | 0.438 |
| Violación de negación (menor es mejor) | 0.022 |
| ECE con T=1 bruto (agrupado) | 0.105 |
| ECE con mejor temperatura (T=1.5) | 0.0169 |
| Brier con mejor temperatura | 0.1441 |

Exactitud por familia (holdout completo):

| Familia | n | Exactitud |
|---|---:|---:|
| injection | 126 | 0.9921 |
| banking77 | 3 076 | 0.9324 |
| boolq | 3 270 | 0.9128 |
| negation | 3 270 | 0.9110 |
| pubhealth | 7 929 | 0.7874 |
| baserate | 27 | 0.7407 |
| severity | 437 | 0.6568 |
| go_emotions | 5 427 | 0.6005 |
| mmlu_pro | 12 032 | 0.4383 |

JevBench (public-231, `score_task` del arnés):

| Modelo | all-public | hard tier |
|---|---:|---:|
| s1-jev-cvltist @4096 | 0.7749 | 62/111 |
| s1-v5 | 0.7489 | 59/111 |
| AlexWortega/openjev v5 | 0.814 | 69/111 |
| Jev 1.13 | no disponible (tabla truncada en la información de origen) | no disponible |

El ECE bruto agrupado de 0.105 se explica porque MMLU Pro (12 032 de 35 594 filas) domina la muestra y es donde el modelo es genuinamente inseguro; el ECE bruto de cada familia individual es aceptable.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.5-4B en bf16 ocupa aproximadamente 8 GB de pesos; en cuantización de 4 bits, alrededor de 2,5–3 GB. El adaptador añade 124 MB. El cálculo concreto de KV cache para 4096 tokens no está publicado.
- GPU recomendadas: cualquier GPU con al menos 10–12 GB de VRAM para bf16 sin cuantizar (RTX 3080/4080/4090 en adelante), y GPUs de datacenter (A100, H100) para servir con lotes grandes.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 12 GB o más; con cuantización de 4 bits cabe en GPUs de 6–8 GB.
- Opciones de despliegue: el adaptador se carga con PEFT mediante `PeftModel.from_pretrained(base, "AEECollier/s1-jev-cvltist")` sobre `Qwen/Qwen3.5-4B`. Para servido con vLLM o TGI sería necesario fusionar el adaptador en el modelo base. El formato de pesos es safetensors, por lo que para llama.cpp u Ollama habría que convertir a GGUF, algo no publicado por el autor. La cabeza de lectura `LogitReadout` es código propio del proyecto y debe integrarse explícitamente en el pipeline de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench all-public | JevBench hard | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| s1-jev-cvltist | LoRA sobre base de 4B | 4096 (adaptador); 262 000 (base) | 0.7749 | 62/111 | apache-2.0 | pesos abiertos en HuggingFace |
| s1-v5 | no disponible | no disponible | 0.7489 | 59/111 | no disponible | versión anterior del mismo proyecto |
| AlexWortega/openjev v5 | no disponible | no disponible | 0.814 | 69/111 | no disponible | pesos abiertos |
| Jev 1.13 (TypeSafe AI) | no disponible | no disponible | no disponible | no disponible | propietaria | API con acceso controlado; precio de entrada desde 0.084 USD por millón de tokens, tokens de salida gratuitos |

Frente al modelo propietario Jev, la diferencia principal es de naturaleza, no solo de rendimiento: s1-jev-cvltist es auditable y autoalojable, mientras que Jev se ofrece como servicio gestionado con latencias declaradas de 70 a 500 ms y compromiso de cero alucinaciones. En JevBench, openjev v5 supera a s1-jev-cvltist tanto en la métrica global como en el tramo difícil, lo que sitúa a este último por detrás en la tarea de referencia pero por delante en calibración publicada y en postura de licencia.

## Limitaciones y advertencias

- La tabla de JevBench de la model card está truncada en la información disponible, por lo que la comparación con Jev 1.13 queda incompleta.
- MMLU Pro es el punto débil manifiesto: 0.438 de exactitud, lo que indica una carencia de conocimiento general y una tasa elevada de error en preguntas de conocimiento experto.
- GoEmotions es la familia grande con peor rendimiento (0.6005), lo que limita el uso del modelo como clasificador de emociones sin supervisión humana posterior.
- La familia `baserate` tiene solo 27 filas en el holdout, por lo que su 0.7407 tiene un intervalo de confianza muy amplio y no debería citarse como resultado robusto.
- El modelo solo declara inglés (`en`); no hay evidencia de capacidades multilingües.
- Es un adaptador, no un modelo autónomo: requiere descargar Qwen/Qwen3.5-4B y cargar ambos artefactos. Publicarlo de forma aislada no es suficiente para reproducir la inferencia.
- La salida depende de código propio (`LogitReadout`) y de la especificación de cable de Jev; no es un pipeline estándar de `text-classification` de transformers pese a la etiqueta declarada, lo que puede generar fricción al integrarlo.
- El repositorio tiene 0 descargas y 1 «me gusta», y es un espejo personal de CVLTAI/s1-jev-cvltist; para uso en producción conviene referenciar el repositorio canónico y verificar su mantenimiento.
- Licencia Apache-2.0 permite uso comercial, pero la mezcla de entrenamiento incluye BoolQ (CC-BY-SA) condicionada a la puerta `--include-sa`; conviene verificar la composición efectiva del checkpoint publicado antes de redistribuirlo en un producto propietario.
- El ECE agrupado bruto de 0.105 exige aplicar escalado de temperatura (T=1.5) para obtener las cifras de calibración declaradas; sin esa fase de post-proceso, las probabilidades no son fiables como tales.
- La información sobre sesgos específicos del modelo no está publicada en la model card.

## Enlaces

- Modelo en HuggingFace (espejo personal): https://huggingface.co/AEECollier/s1-jev-cvltist
- Repositorio canónico: https://huggingface.co/CVLTAI/s1-jev-cvltist
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Pipeline completo del proyecto (entrenamiento, evaluación, calibración, servido): https://github.com/cvlt-ai/decision-model
- Alternativa abierta comparable: https://huggingface.co/AlexWortega/openjev
- Documentación del modelo propietario Jev: https://docs.typesafe.ai/models
- Sitio de Jev AI: https://jevai.net/
- Entrada de Wikipedia sobre Jev: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Ficha de Jev en AI Wiki: https://aiwiki.ai/wiki/jev
