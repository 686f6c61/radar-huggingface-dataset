# Remek/basal-2.0-mini-MLX-8bit

## Resumen

basal-2.0-mini-MLX-8bit es la versión cuantizada a 8 bits en formato MLX del modelo basal-2.0-mini, un modelo de 1.596.507.648 parámetros (aproximadamente 1,5B) desarrollado por Remek y orientado a la toma de decisiones tipadas (typed decisions) en polaco e inglés. No es un modelo conversacional generalista al uso: su propósito es recibir un estado y un conjunto de opciones (hasta 255 por pregunta) y devolver una decisión estructurada con una confianza calibrada, lo que lo hace adecuado para flujos de clasificación, enrutamiento y decisión automatizada con umbrales de error controlables.

El modelo se construye mediante fine-tuning sobre speakleash/Bielik-1.5B-v3.0-Instruct, un modelo base polaco de 1,5B parámetros con licencia Apache-2.0. Esta variante concreta está empaquetada en formato MLX de 8 bits para su ejecución nativa en Apple Silicon, con un tamaño de repositorio de 1,8 GB, y se sirve a través del motor de inferencia basal (basal-serve) en modo MLX. Incluye archivos de calibración específicos del puerto (CALIBRATION.mlx.json) ajustados sobre las lecturas del propio modelo cuantizado.

Su relevancia actual radica en que ofrece una API de decisión tipada con calibración explícita y métricas de acuerdo frente al modelo bf16 de referencia (0,9792 de acuerdo en opciones 2-10 y 1,0000 en margen >= 0,2), lo que permite desplegar decisiones automatizadas en hardware de consumo Apple con latencias de 93 ms p50 en modo c1 sobre un M4 Pro. Es un modelo pequeño, especializado y con garantías de calibración documentadas, no un LLM de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Bielik-1.5B-v3.0-Instruct); no se detalla en la informacion disponible |
| Parametros totales | 1.596.507.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (mini) |
| Tipos de cuantizacion | 8 bits en formato MLX (esta variante); el modelo base dispone de FP8, GGUF Q8_0 y GGUF Q5_K_M en otros repositorios |
| Idiomas soportados | pl, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 8-bit); libreria mlx |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Bielik-1.5B-v3.0-Instruct, un transformer decoder-only de aproximadamente 1,5B parámetros desarrollado por SpeakLeash y ACK Cyfronet AGH. Sobre esa base, Remek aplica un fine-tuning orientado a decisiones tipadas: el modelo recibe un estado y un conjunto de opciones y emite una decisión con confianza calibrada, en lugar de generar texto libre. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La innovación técnica principal no está en la arquitectura del transformer, sino en la capa de decisión y calibración que la acompaña. El motor basal-serve implementa un modo de decisión con umbrales de error configurables (por ejemplo, max_error), y el repositorio incluye archivos de calibración ajustados específicamente sobre las lecturas del puerto MLX. La calibración del puerto MLX se ajustó con el mismo método que el modelo bf16 pero sobre las lecturas propias de esta cuantización, logrando un ECE en dev v2 de 0,0337 in-sample y 0,0375 held-out (leave-one-family-out), frente a 0,0357 con la calibración bf16. El modelo 2.0 no incluye cabecera de evidencia (evidence head).

## Capacidades

- Toma de decisiones tipadas: selecciona una opción entre un conjunto de hasta 255 opciones por pregunta (20 en Ollama), devolviendo la decisión y una confianza calibrada.
- Clasificación y enrutamiento: adecuado para asignar categorías, etiquetas o rutas a partir de un estado de entrada.
- Calibración de confianza: permite fijar umbrales de error (max_error) y diferir decisiones cuando la confianza no alcanza el umbral.
- Modos de decisión: incluye modos act, tool y multi, aunque act y multi sobre muchas etiquetas se marcan como experimentales.
- Generación de texto y conversación: hereda la capacidad de text-generation y conversational del modelo base Bielik-1.5B-v3.0-Instruct.
- Multilingüe limitado: soporta polaco e inglés.
- Integración con herramientas: el modo tool permite decisiones orientadas a invocación de herramientas dentro del motor basal.
- Ejecución nativa en Apple Silicon mediante MLX, con API servida por basal-serve.
- Soporte de facts: opción "facts": "auto" para delegar el cálculo de hechos al motor en lugar del modelo.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado del ticket y un conjunto de categorías posibles y devuelve la categoría asignada con confianza calibrada; si la confianza no supera el umbral configurado, la decisión se difiere a revisión humana. Es adecuado por su bajo coste y su capacidad de calibrar el error.
- Clasificación de documentos en pipelines de ingestión: dado un documento y un conjunto de etiquetas predefinidas, el modelo asigna la etiqueta y permite fijar un umbral de error del 5% para controlar falsos positivos en producción.
- Decisión automatizada con umbral de error: en flujos donde se requiere un nivel de error máximo (max_error), el modelo puede diferir decisiones que no cumplan el umbral, integrándose en sistemas de aprobación por niveles.
- Asistente de decisión en aplicaciones de escritorio para macOS: gracias al formato MLX y a la latencia de 93 ms p50 en c1 sobre un M4 Pro, puede ejecutarse localmente en una app nativa de Apple Silicon sin depender de la nube.
- Enrutamiento de consultas en asistentes conversacionales: el modelo decide qué herramienta o flujo activar (modo tool) a partir del estado de la conversación, con la ventaja de su contexto de 8.192 tokens para conversaciones multi-turno moderadas.
- Evaluación de cumplimiento normativo en documentos polacos: con el estado del caso y las reglas aplicables incluidas en el contexto, el modelo selecciona la decisión; requiere validación propia porque el conocimiento del mundo de un modelo pequeño es limitado y las reglas legales cambian.
- Clasificación multi-etiqueta experimental: para conjuntos de etiquetas amplios (hasta 255 opciones) en tareas de etiquetado, con la advertencia de que el modo multi es experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este puerto. La model card indica explícitamente que este puerto no se evalúa por separado en los benchmarks del modelo base (Werdykt, JDI, LEK, PL-Holdout, PL-Real); esos resultados están en la ficha de basal-2.0-mini. Lo que sí se documenta son las métricas de acuerdo del puerto frente al modelo bf16 de referencia:

| Metrica | Valor |
|---|---|
| Acuerdo con bf16 (opciones 2-10) | 0,9792 |
| Acuerdo con bf16 en margen >= 0,2 | 1,0000 |
| Diferencia de precision frente a bf16 | -0,0025 |
| Diferencia de ECE frente a bf16 | +0,0024 |
| Tamano | 1,7 GB |
| Velocidad | 93 ms c1 p50; 223 ms para 5 preguntas (Mac, M4 Pro 24 GB) |
| Puerta de calidad | PASS |

Además, el ECE en dev v2 con la calibración específica del puerto MLX es de 0,0337 in-sample y 0,0375 held-out, frente a 0,0357 con la calibración bf16.

## Requisitos de hardware

- VRAM estimada: al ser un formato MLX para Apple Silicon, no aplica VRAM de GPU discreta; el modelo ocupa aproximadamente 1,7 GB en memoria unificada.
- Hardware recomendado: Apple Silicon con memoria unificada suficiente; las mediciones documentadas se realizaron en un Apple M4 Pro con 24 GB.
- GPU discretas: no es el formato objetivo de este puerto; para GPU NVIDIA existen las variantes FP8 y GGUF (Q8_0, Q5_K_M) del mismo modelo.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon de gama media con 16 GB o más de memoria unificada (no se documenta el mínimo exacto).
- Despliegue: basal-serve en modo mlx, instalado vía pip desde el repositorio de GitHub (basal[mlx], versión v2.5.5). Requiere Python nativo arm64 (cpython-3.12-macos-aarch64-none); un terminal bajo Rosetta (x86_64) no es válido.
- Latencia y throughput: 93 ms p50 en modo c1 y 223 ms para 5 preguntas en Mac (M4 Pro, 24 GB). No se documenta throughput en tokens por segundo para este puerto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| basal-2.0-mini-MLX-8bit | 1.596.507.648 | 8.192 | MLX 8-bit | Apache-2.0 | Puerto MLX para Apple Silicon; acuerdo 0,9792 con bf16 |
| basal-2.0-mini-FP8 | 1.596.507.648 | 8.192 | FP8 | Apache-2.0 | Acuerdo 0,9333; 103,5 dec/s c16 en H100 |
| basal-2.0-mini-GGUF (Q8_0) | 1.596.507.648 | 8.192 | GGUF Q8_0 | Apache-2.0 | Acuerdo 0,9769; 1,6 GB |
| basal-2.0-mini (bf16) | 1.596.507.648 | 8.192 | safetensors bf16 | Apache-2.0 | Modelo de referencia de la familia |

No se dispone en la información proporcionada de comparaciones con modelos de otras familias (por ejemplo, otros clasificadores o modelos de decisión de tamaño similar). La comparativa se limita a los distintos puertos de la misma familia basal-2.0.

## Limitaciones y advertencias

- Validar sobre documentos propios antes de confiar en el modelo: los conjuntos ocultos y held-out no cubren todos los dominios.
- El conocimiento del mundo en polaco de un modelo pequeño es limitado; los hechos relevantes deben incluirse en el estado de entrada. Las reglas legales cambian con el tiempo.
- La aritmética exacta y los umbrales son un punto débil de las decisiones de una sola pasada; deben calcularse en código o delegarse con "facts": "auto".
- La calibración es cauta en tareas no vistas: ningún umbral del 1% está certificado en los archivos incluidos, por lo que "max_error": 0.01 en una pregunta act o tool difiere todas las decisiones. Se recomienda usar 0,05 o certificar umbrales con basal-calibrate sobre datos propios.
- Los modos act y multi sobre muchas etiquetas son experimentales.
- Límite de opciones: hasta 255 por pregunta (20 en Ollama).
- Contexto limitado a 8.192 tokens en la variante mini.
- Los modelos 2.0 no incluyen cabecera de evidencia.
- Las decisiones con consecuencias serias para personas deben ser revisadas por una persona.
- Una calibración ajustada sobre bf16 no se traslada exactamente a un puerto cuantizado; en este puerto se incluye CALIBRATION.mlx.json específico, pero donde se use la calibración bf16 los umbrales de confianza deben tratarse como aproximados.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda mantener la atribución a SpeakLeash y ACK Cyfronet AGH por el modelo base Bielik.
- El despliegue requiere Python nativo arm64; ejecutar bajo Rosetta no es compatible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-2.0-mini-MLX-8bit
- Modelo base de la familia: https://huggingface.co/Remek/basal-2.0-mini
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Variante FP8: https://huggingface.co/Remek/basal-2.0-mini-FP8
- Variante GGUF: https://huggingface.co/Remek/basal-2.0-mini-GGUF
- Modelo base Bielik: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
