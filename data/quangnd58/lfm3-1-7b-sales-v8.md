# quangnd58/LFM3-1.7B-sales-v8

## Resumen

LFM3-1.7B-sales-v8 es un ajuste fino mediante LoRA del modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario quangnd58 para el proyecto Digital Human. El modelo está especializado en actuar como presentador de ventas bilingüe (vietnamita e inglés) en contextos de livestream, respondiendo a comentarios de espectadores con información de catálogo de producto. El repositorio contiene tanto el modelo fusionado en bf16 como el adaptador LoRA original bajo el directorio `adapter/`.

El modelo resuelve un problema muy concreto: generar respuestas de venta naturales y breves (limitadas a dos frases) que respeten los datos del catálogo inyectados en el prompt y superen un validador numérico denominado `NumberGuard`. No está diseñado como fuente autónoma de hechos sobre productos, sino como un componente dentro de un pipeline de generación con anclaje (grounding) externo.

Con 1.728.801.536 parámetros y un tamaño de repositorio de 3,5 GB, se trata de un modelo compacto orientado a despliegue en hardware de consumo. Su relevancia radica en la evaluación publicada por el autor: frente al pipeline base con LFM2.5-2.6B (56% de puntuación en el banco de comportamiento) y con LFM3-1.7B sin ajustar (16%), este modelo alcanza un 99%, con cero hechos erróneos escuchados en 1.163 respuestas a comentarios reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de LiquidAI; requiere `trust_remote_code`) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (evaluado únicamente en bf16; no se ha medido ningún checkpoint FP8) |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | LFM Open License v1.0 (heredada del modelo base) |
| Formato de pesos | safetensors (modelo fusionado bf16) + adaptador PEFT LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, cuyo detalle arquitectónico no se especifica en la información disponible; el autor indica que la carga requiere `trust_remote_code` y que el despliegue necesita una compilación de vLLM con soporte para LFM3. El ajuste se realizó con LoRA de rango 16, alpha 32 y dropout 0,05, aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj`, `out_proj`, `w1`, `w2` y `w3`, con la pérdida calculada únicamente sobre los tokens del asistente. El entrenamiento consistió en 2 épocas con tasa de aprendizaje 2e-4, acumulación de gradiente 16 y longitud máxima de 2048, ejecutado en una única RTX 3060 de 12 GB. La pérdida de validación final fue de 0,0305.

Los datos de entrenamiento (8.953 conversaciones de entrenamiento y 925 de validación) se generaron mediante `tools/catalogue/finetune/make_data.py`: tiendas sintéticas en doce dominios de producto no utilizados en el banco de evaluación, con preguntas de espectadores respondidas por reglas a partir del catálogo de cada tienda, más comentarios reales de compradores vietnamitas por teléfono (licencia MIT, `anotherpolarbear/vietnamese-sentiment-analysis`, solo la mitad de entrenamiento). Cada ejemplo se renderizó a través del camino de prompt de producción y se descartaron las respuestas que el guard rechazaría. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional orientada a ventas en livestream, con respuestas limitadas a dos frases mediante el parámetro `DIGITAL_HUMAN_LLM_MAX_SENTENCES`.
- Respuesta bilingüe vietnamita-inglés, con selección del idioma de respuesta alineada con el comentario del espectador (solo 1 respuesta con idioma incorrecto en 1.163 comentarios reales).
- Anclaje a catálogo de producto inyectado en el prompt: el modelo no inventa hechos de producto por sí mismo, sino que reformula la información proporcionada.
- Cumplimiento de un validador numérico externo (`NumberGuard`): solo 35 respuestas con hechos erróneos escritos fueron retenidas por el guard, frente a 531 y 267 en los pipelines base.
- Modo de pensamiento desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`, que es la configuración recomendada en evaluación.
- Reconocimiento y gestión de quejas y elogios de espectadores (con limitaciones, ver sección de limitaciones).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni matemáticas avanzadas.

## Casos de uso

- Presentador de ventas en livestream: el modelo gestiona comentarios de espectadores en tiempo real respondiendo con datos del catálogo inyectado en el prompt; su latencia de primer token (p50 de 0,26 s en RTX 3060) lo hace viable para interacción en directo.
- Digital Human conversacional: integrado en el pipeline del proyecto con perfil `lfm3` (`DIGITAL_HUMAN_LLM_PROFILE=lfm3 make digital-human`), actúa como capa de generación de lenguaje de un avatar digital que atiende a una audiencia.
- Atención al cliente en comercio electrónico vietnamita: respuestas breves y bilingües a preguntas sobre productos, con el catálogo como fuente de verdad y el guard como red de seguridad frente a cifras erróneas.
- Moderación de respuestas factuales en producción: el modelo está entrenado para que las respuestas que el guard retendría se descarten durante el entrenamiento, lo que reduce la tasa de alucinación numérica en entornos con validación posterior.
- Despliegue en hardware de consumo: al entrenarse en una RTX 3060 de 12 GB y evaluarse en la misma GPU, es adecuado para prototipos y despliegues de pequeña escala sin infraestructura de centro de datos.
- Sustitución de modelos base en pipelines existentes: los benchmarks publicados muestran una mejora de 16% a 99% en el banco de comportamiento frente al LFM3-1.7B sin ajustar, por lo que puede reemplazar al base en el mismo pipeline sin cambios de infraestructura más allá del checkpoint.
- Generación de respuestas con restricción de longitud: el límite de dos frases y la temperatura baja (0,1) lo hacen apropiado para canales donde la concisión es requisito, como chat de directo o respuestas de voz.

## Benchmarks y rendimiento

Evaluación realizada con el pipeline de respuesta del proyecto (grounding, límite de frases, `NumberGuard`) sobre vLLM:

| Métrica | Pipeline base + LFM2.5-2.6B | Pipeline base + LFM3-1.7B | Este modelo |
|---|---|---|---|
| Puntuación banco de comportamiento (950 respuestas, 6 catálogos) | 56% | 16% | 99% |
| Comentarios reales: hechos erróneos escuchados (1.163 respuestas) | 45 | 50 | 0 |
| Comentarios reales: hechos erróneos escritos, retenidos por el guard | 531 | 267 | 35 |
| Comentarios reales: idioma de respuesta incorrecto | 482 | 553 | 1 |
| Tiempo hasta el primer token, p50 (RTX 3060) | 4,85 s | 0,23 s | 0,26 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 3,5 GB de pesos (1.728.801.536 parámetros × 2 bytes), por lo que la inferencia requiere del orden de 4 a 6 GB de VRAM según la longitud de contexto y el tamaño de lote; no se proporcionan cifras oficiales de VRAM.
- GPU recomendadas: RTX 3060 de 12 GB es la GPU usada tanto para entrenamiento como para evaluación; cualquier GPU con al menos 8 GB de VRAM debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU de consumo: sí, según la evidencia del entrenamiento y la evaluación en una RTX 3060 de 12 GB.
- Opciones de despliegue: vLLM con soporte para LFM3 y `--trust-remote-code`; la librería es `transformers` con `trust_remote_code`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia: tiempo hasta el primer token p50 de 0,26 s en RTX 3060. No se proporcionan datos de throughput (tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el banco del proyecto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-sales-v8 | 1.728.801.536 | no disponible | 99% (banco de comportamiento) | LFM Open License v1.0 | Hugging Face (quangnd58) |
| LiquidAI/LFM3-1.7B (base) | 1.700 millones aprox. | no disponible | 16% (banco de comportamiento) | LFM Open License v1.0 | Hugging Face (LiquidAI) |
| LFM2.5-2.6B (pipeline base) | no disponible | no disponible | 56% (banco de comportamiento) | no disponible | Hugging Face (LiquidAI) |

La comparación se limita a los modelos incluidos en la evaluación del autor; no se dispone de datos de benchmarks estándar para comparar con alternativas de la misma categoría fuera del ecosistema LFM.

## Limitaciones y advertencias

- Respuestas repetitivas: solo el 14% de las respuestas a comentarios reales son distintas entre sí, lo que produce acknowledgements redundantes.
- Gestión incompleta de quejas y elogios: las quejas se reconocen en aproximadamente la mitad de los casos (160/324) y los elogios en 139/212.
- Dependencia estricta del catálogo: el modelo no es una fuente autónoma de hechos de producto; los datos deben provenir del catálogo inyectado en el prompt y las salidas deben pasar el guard.
- Evaluación limitada a bf16: no se ha medido ningún checkpoint en FP8, por lo que el comportamiento en cuantización no está validado.
- Cobertura lingüística restringida a vietnamita e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que se trata de una licencia "other" heredada del modelo base.
- Sin datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de longitud de contexto, lo que dificulta la comparación con alternativas fuera del ecosistema LFM.
- Riesgo de alucinación en cifras y hechos de producto si se usa sin el pipeline de grounding y el `NumberGuard`; el propio autor advierte que el modelo debe ejecutarse detrás de esas capas.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/quangnd58/LFM3-1.7B-sales-v8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de comentarios vietnamitas: https://huggingface.co/datasets/anotherpolarbear/vietnamese-sentiment-analysis
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
