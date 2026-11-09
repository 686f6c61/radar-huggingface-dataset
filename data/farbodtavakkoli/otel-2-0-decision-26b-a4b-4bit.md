# farbodtavakkoli/OTel-2.0-Decision-26B-A4B-4bit

## Resumen

OTel-2.0-Decision-26B-A4B-4bit es una compilación cuantizada a 4 bits (W4A16) del modelo Gemma 4 26B-A4B-it de Google, publicada por el usuario farbodtavakkoli y orientada específicamente a la toma de decisiones tipificadas en el dominio de las telecomunicaciones. En lugar de generar prosa libre, el modelo se utiliza para responder preguntas de clasificación, preguntas de sí/no y niveles ordenados, leyendo las decisiones directamente de las probabilidades de las etiquetas de respuesta. Esta especialización lo aleja del chat abierto y lo acerca a motores de decisión deterministas y auditables.

El modelo conserva la arquitectura Mixture-of-Experts (MoE) del Gemma 4 original, con 25.805.936.206 parámetros totales y, según la nomenclatura "A4B", aproximadamente 4.000 millones de parámetros activos por token. La cuantización emplea el formato compressed-tensors con AWQ en modo W4A16 (pesos de 4 bits, activaciones de 16 bits), lo que reduce el peso del repositorio a 60,9 GB y permite servir el modelo en una sola GPU de gama alta, incluida una AMD MI350P o una NVIDIA H100 de 80 GB.

Su relevancia actual radica en que demuestra un patrón de despliegue de modelos de decisión con lectura de logprobs sobre un endpoint dedicado (`/v1/systemone`), con resultados publicados en el benchmark JevBench y con recetas de inferencia reproducibles tanto para ROCm como para CUDA. La licencia declarada es Apache 2.0, aunque el modelo base remite a la licencia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), base Gemma 4 26B-A4B-it |
| Parametros totales | 25.805.936.206 |
| Parametros activos | Aproximadamente 4.000 millones (según nomenclatura A4B; cifra exacta no disponible) |
| Longitud de contexto | 16.384 tokens (configuración de servicio recomendada con `--max-model-len 16384`) |
| Tipos de cuantizacion | 4 bits W4A16 con AWQ y compressed-tensors; también se distribuyen pesos GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantización del Gemma 4 26B-A4B-it, un transformer con capas Mixture-of-Experts en el que solo se activa una fracción de los parámetros por token (del orden de 4.000 millones, según la denominación A4B). La compilación publicada aplica cuantización de pesos a 4 bits con activaciones en 16 bits (W4A16) mediante AWQ y el formato compressed-tensors, pensada para maximizar el rendimiento en GPUs AMD con ROCm y en GPUs NVIDIA con CUDA. El autor indica que los detalles sobre datos de entrenamiento, método, configuración, pipeline de procesamiento e infraestructura "se añadirán pronto", por lo que no hay información disponible sobre el corpus, el número de tokens vistos ni si hubo etapas de RLHF o DPO.

La innovación técnica destacable no está en el entrenamiento sino en el modo de explotación: el modelo se sirve con vLLM habilitando `--max-logprobs 64` y `--enable-prefix-caching`, y las decisiones se extraen de las probabilidades de las etiquetas de respuesta en lugar de generarse como texto. Para el endpoint `/v1/systemone` se requiere `--logprobs-mode raw_logprobs`, de modo que el estado (el texto a clasificar) se prefija una sola vez y cada pregunta añade únicamente sus propios tokens. El autor advierte que el kernel MoE no es determinista a nivel de bit, por lo que los resultados pueden variar en unas pocas tareas de margen bajo entre ejecuciones.

## Capacidades

- Clasificación de mensajes, transcripciones de llamadas, tickets y documentos en categorías predefinidas.
- Respuesta a preguntas de sí/no con lectura de la probabilidad de cada etiqueta.
- Asignación de niveles ordenados (por ejemplo, severidad o prioridad) mediante preguntas de score.
- Formulación de múltiples preguntas nombradas sobre el mismo texto en una sola petición al endpoint `/v1/systemone`.
- Exposición de probabilidades por opción para umbrales de confianza y enrutamiento automático.
- Ejecución con prefix caching: el estado se prefija una vez y cada pregunta añade solo sus tokens.
- Soporte de ordenación adaptativa de preguntas sí/no con margen 4.0 en la lectura de decisiones tipificadas.
- Capacidad multilingüe limitada al inglés.
- No está diseñado para chat abierto, recuperación (retrieval) ni reranking, según su uso previsto declarado.

## Casos de uso

- Triaje de tickets de soporte en operadores de telecomunicaciones: el modelo clasifica cada ticket en categorías tipificadas (avería, facturación, baja, consulta comercial) leyendo la probabilidad de cada etiqueta, lo que permite enrutar automáticamente y fijar umbrales de confianza para escalar a un agente humano cuando la probabilidad es baja.
- Análisis de transcripciones de llamadas al centro de atención: con 16.384 tokens de contexto se puede procesar una conversación completa y formular varias preguntas de sí/no sobre ella (por ejemplo, si hubo intento de retención o si se ofreció una promoción) en una sola petición al endpoint System One.
- Detección de riesgo de baja (churn) en clientes: mediante preguntas de score y niveles ordenados se asigna un nivel de riesgo a cada interacción, usando las probabilidades como señal calibrada para los modelos de retención.
- Moderación y clasificación de contenido en foros o canales de atención: preguntas de sí/no con umbral de confianza permiten filtrar mensajes abusivos o fuera de política sin generar texto libre, lo que simplifica la auditoría.
- Enrutamiento de incidencias de red: clasificación de informes técnicos en niveles de severidad ordenados para priorizar colas de trabajo de ingeniería, aprovechando la lectura determinista de etiquetas.
- Extracción de decisiones en documentos normativos o contractuales: formulación de preguntas tipificadas sobre cláusulas (por ejemplo, si un contrato incluye una penalización) con respuesta probabilística por opción.
- Evaluación por lotes de alta concurrencia: con el despliegue en vLLM sobre una MI350P se alcanzan hasta 32,3k tokens/s agregados en el imagen precompilada, adecuado para procesar grandes volúmenes de tickets en paralelo.

## Benchmarks y rendimiento

Los benchmarks publicados usan la lectura de decisiones tipificadas (`level=L0`, sin prior, ejecución con prefijo compartido y ordenación adaptativa de sí/no con margen 4.0). Todas las ejecuciones reportaron cero errores y `answer_mass` de 1,00.

| Benchmark | AMD MI350P | AMD Ryzen AI MAX+ PRO 395 (Strix Halo) |
|---|---:|---:|
| JevBench público (231 tareas) | 86,58% a 87,45% (200 a 202 de 231) | 87,45% (202/231) |

Desglose de JevBench por nivel: 100% en tareas fáciles, 94,44% a 95,83% en tareas originales y 74,77% a 76,58% en tareas difíciles. La ejecución en Strix Halo usó vLLM 0.26.0 sobre ROCm 7.13 (48/48 fáciles, 71/72 originales, 83/111 difíciles). El autor advierte que sin un mensaje de sistema que solicite una única etiqueta, el modelo a veces responde en prosa a las tareas difíciles, lo que reduce la precisión en ese nivel en unos 6 puntos.

Rendimiento de servicio en una AMD MI350P con vLLM 0.30.0:

| Opción | Imagen | Throughput |
|---|---|---:|
| vLLM oficial | `vllm/vllm-openai-rocm:v0.30.0` | 22,7k tok/s |
| Imagen precompilada | `farbodatdocker/otel-decision-vllm-rocm:v0.30.0` | 32,3k tok/s (42% más) |

Las cifras de throughput son el máximo agregado de tokens de salida por segundo y solo se alcanzan con la GPU cerca de su utilización máxima y muchas peticiones concurrentes en vuelo; una petición individual es mucho más lenta.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 60,9 GB en safetensors, por lo que se necesita una GPU con al menos 64 GB de memoria para cargar los pesos completos en 4 bits; con cuantizaciones GGUF adicionales el requisito puede reducirse, aunque no se proporcionan cifras concretas.
- GPU recomendadas: AMD MI350P (probada con vLLM 0.30.0 sobre ROCm) y NVIDIA H100 de 80 GB (probada con la build de vLLM main para el endpoint `/v1/systemone`).
- AMD Ryzen AI MAX+ PRO 395 (Strix Halo): validado con vLLM 0.26.0 sobre ROCm 7.13 para las evaluaciones de JevBench.
- GPU de consumo: no se dispone de datos que confirmen su funcionamiento en GPUs consumer; por el tamaño de pesos (60,9 GB) no cabe en tarjetas de 24 GB sin cuantizaciones adicionales no documentadas.
- Opciones de despliegue: vLLM (imagen oficial ROCm o imagen precompilada con `--moe-backend flydsl`), y pesos GGUF para otros runners; no se documenta soporte explícito de llama.cpp, Ollama o TGI.
- Latencia y throughput: hasta 32,3k tok/s agregados en MI350P con la imagen precompilada y 22,7k tok/s con la oficial; el primer arranque tarda de 4 a 10 minutos.
- El endpoint `/v1/systemone` requiere una build de vLLM main o nightly (probado con `0.33.0rc1.dev613+g44965a109`, commit `44965a1`) y `--logprobs-mode raw_logprobs`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| OTel-2.0-Decision-26B-A4B-4bit | 25,8B totales (≈4B activos) | 16.384 | Apache 2.0 | Decisiones tipificadas en telecom | Hugging Face, safetensors y GGUF |
| google/gemma-4-26B-A4B-it | 25,8B totales (≈4B activos) | no disponible | Licencia Gemma 4 | Modelo base conversacional | Hugging Face |
| Alternativas de clasificación de propósito general | no disponible | no disponible | no disponible | Clasificación genérica | no disponible |

El modelo base Gemma 4 26B-A4B-it es la referencia directa: misma arquitectura y mismos parámetros, pero sin la cuantización W4A16 ni el ajuste de lectura de decisiones. No se dispone de datos de benchmarks comparativos con otros modelos de clasificación en la información proporcionada.

## Limitaciones y advertencias

- El modelo está pensado exclusivamente para decisiones tipificadas; no es adecuado para chat abierto, retrieval ni reranking.
- Sin un mensaje de sistema que solicite una única etiqueta, el modelo puede responder en prosa a tareas difíciles, lo que reduce la precisión en ese nivel en unos 6 puntos.
- El kernel MoE no es determinista a nivel de bit; los resultados pueden variar en tareas de margen bajo entre ejecuciones.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- El autor no ha publicado detalles sobre datos de entrenamiento, método ni configuración, lo que dificulta evaluar sesgos y riesgos de alucinación.
- La model card advierte de que los pesos pueden actualizarse con el tiempo; para evaluación reproducible o producción conviene fijar una revisión, hash o etiqueta de release concretos.
- Aunque la licencia declarada es Apache 2.0, el enlace apunta a la licencia de Gemma 4 de Google, por lo que conviene revisar las condiciones del modelo base antes de un uso comercial.
- El endpoint `/v1/systemone` no está en una release estable de vLLM, solo en main y nightly, lo que añade riesgo operativo en producción.
- El throughput anunciado requiere alta concurrencia; una petición individual es mucho más lenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farbodtavakkoli/OTel-2.0-Decision-26B-A4B-4bit
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper de referencia citado en los tags: arxiv:2610.07766 (https://arxiv.org/abs/2610.07766)
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Imagen precompilada: farbodatdocker/otel-decision-vllm-rocm:v0.30.0 (Docker Hub)
