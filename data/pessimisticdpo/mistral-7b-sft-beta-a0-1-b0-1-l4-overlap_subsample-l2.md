# PessimisticDPO/mistral-7b-sft-beta-a0.1-b0.1-L4-overlap_subsample-l2

## Resumen

El modelo `PessimisticDPO/mistral-7b-sft-beta-a0.1-b0.1-L4-overlap_subsample-l2` es un checkpoint de investigación publicado en HuggingFace por el usuario PessimisticDPO. No se trata de un lanzamiento oficial ni de un modelo documentado: su model card es la plantilla autogenerada por HuggingFace, sin ningún campo completado (autoría, tipo, idiomas, licencia, datos de entrenamiento y evaluación figuran como "[More Information Needed]"). El repositorio ocupa 0,2 GB y acumula 0 descargas y 0 likes en el momento de la consulta.

El identificador permite inferir la genealogía del artefacto: parte de `mistral-7b-sft-beta`, el checkpoint de Mistral 7B afinado con instrucciones (SFT sobre UltraChat) publicado por HuggingFaceH4, y le aplica una variante de optimización de preferencias denominada "pessimistic DPO". Los sufijos del nombre (`a0.1`, `b0.1`, `L4`, `overlap_subsample`, `l2`) apuntan a hiperparámetros del método: valores alpha y beta de 0,1, una referencia a la capa 4, una estrategia de submuestreo con solapamiento de los pares de preferencia y regularización L2. Ninguno de estos extremos está confirmado en la documentación.

Su relevancia es, por tanto, estrictamente experimental: sirve como evidencia de un experimento de ablación sobre DPO pesimista, no como modelo desplegable. Cualquier uso en producción exigiría primero verificar que los pesos publicados constituyen un checkpoint completo y que existe una licencia aplicable, dos condiciones que hoy no se cumplen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Mistral 7B; inferido del identificador, no confirmado en la model card) |
| Parámetros totales | 7,24 mil millones (cifra del modelo base Mistral 7B; no verificada para este checkpoint) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no disponible para este checkpoint |
| Tipos de cuantización | No disponible (el repo solo incluye pesos en safetensors) |
| Idiomas soportados | No disponible (el modelo base está entrenado predominantemente en inglés) |
| Licencia | No disponible (la model card no declara licencia; la del modelo base es Apache 2.0) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado | No disponible |
| Fecha de creación | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no contiene información sobre arquitectura, datos ni procedimiento de entrenamiento. Todo lo que puede afirmarse se deduce del identificador del repositorio. La base es Mistral 7B: un transformer decoder-only de 7,24 mil millones de parámetros con 32 capas, dimensión oculta de 4096, atención con consultas agrupadas (GQA) de 8 cabezas KV, activación SwiGLU, embeddings rotatorios (RoPE) y atención de ventana deslizante de 4096 tokens sobre una ventana efectiva de 32.768. Sobre esa base, `mistral-7b-sft-beta` añade un ajuste supervisado con instrucciones derivado del dataset UltraChat.

El sufijo del nombre sugiere que el autor aplicó sobre ese checkpoint una variante de DPO con regularización pesimista, parametrizada con alpha = 0,1 y beta = 0,1, algún tipo de intervención asociada a la cuarta capa (`L4`), un esquema de submuestreo con solapamiento de los pares de preferencia (`overlap_subsample`) y penalización L2. Se desconoce el dataset de preferencias empleado, el número de pasos, el régimen de precisión y si el resultado es un modelo completo o un conjunto parcial de tensores: el tamaño del repositorio (0,2 GB) es incompatible con un checkpoint completo en fp16, que rondaría los 14,5 GB, y apunta a un volcado parcial, a tensores de una sola capa o a un adaptador.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base. No confirmada para este checkpoint.
- Razonamiento y respuesta a instrucciones: plausible por el SFT de partida, pero el efecto del DPO pesimista sobre estas capacidades no está documentado.
- Tool calling / function calling: no disponible. El modelo base `mistral-7b-sft-beta` no está entrenado específicamente para llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles. El modelo base tiene sesgo claro hacia el inglés.
- Visión, audio o modalidades adicionales: no soportadas.
- Modo de razonamiento explícito (thinking): no disponible.
- Capacidad analítica útil: sirve como artefacto para estudiar el efecto de la regularización pesimista en DPO frente al checkpoint SFT de origen.

## Casos de uso

- Reproducción de experimentos de DPO pesimista: el checkpoint permite comparar sus salidas con las de `mistral-7b-sft-beta` bajo el mismo prompt y semilla, aislando el efecto de la etapa de preferencias sobre la distribución del modelo.
- Ablación de hiperparámetros alpha y beta: con los valores 0,1/0,1 fijados en el nombre, el modelo es un punto de medida para estudiar cómo la penalización pesimista afecta a la divergencia respecto a la política de referencia.
- Investigación sobre robustez frente a preferencias ruidosas: el submuestreo con solapamiento (`overlap_subsample`) sugiere un diseño para evaluar el comportamiento del optimizador cuando los pares de preferencia contienen ruido o anotaciones inconsistentes.
- Análisis de olvido catastrófico: comparar métricas de perplejidad y de seguimiento de instrucciones contra el checkpoint SFT permite cuantificar cuánta capacidad general se degrada tras la etapa DPO.
- Interpretabilidad y análisis por capas: si `L4` designa la cuarta capa, el artefacto es útil para estudiar cómo se concentran los cambios de representación en capas tempranas tras la optimización de preferencias.
- Punto de partida para fine-tuning posterior: un investigador podría usarlo como inicialización para un ajuste específico de dominio y medir si la etapa pesimista mejora la estabilidad del entrenamiento, siempre que se verifique la integridad de los pesos.
- Generación de texto general en inglés: uso plausible si el checkpoint está completo, aunque sin evaluación publicada no hay garantía de calidad ni de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación, el repositorio no referencia ningún conjunto de pruebas y la búsqueda web no ha devuelto documentación asociada al modelo (los resultados obtenidos corresponden a un sitio de cómics web sin relación alguna con el artefacto). No se dispone, por tanto, de cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra métrica, ni para este checkpoint ni en comparación con su modelo base.

## Requisitos de hardware

Las siguientes estimaciones se derivan de la arquitectura del modelo base Mistral 7B y no han sido verificadas sobre este checkpoint concreto:

- Peso de los pesos en memoria: ~14,5 GB en fp16/bf16, ~7,5 GB en int8, ~4,0-4,5 GB en cuantización de 4 bits (GPTQ, AWQ o GGUF Q4_K_M).
- Caché KV: para la arquitectura del modelo base (32 capas, 8 cabezas KV, dimensión de cabeza 128, fp16) el consumo es de 2 × 32 × 8 × 128 × 2 bytes = 128 KiB por token, es decir, 4 GiB con la ventana completa de 32.768 tokens y 512 MiB con 4096 tokens.
- VRAM total estimada: en torno a 18-20 GB para fp16 con contexto largo; 10-12 GB para int8 con contexto moderado; 6-8 GB para 4 bits con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para fp16 con contexto completo; RTX 4090, RTX 3090 o RTX A6000 (24-48 GB) para fp16 con contexto recortado o para cuantizaciones de 8 y 4 bits.
- GPU de consumo: sí cabe en tarjetas de 24 GB con cuantización de 4 bits y contexto moderado; en tarjetas de 16 GB requiere 4 bits y contextos cortos; en 8 GB solo con cuantización agresiva y descarga parcial a CPU.
- Opciones de despliegue: vLLM, TGI y transformers para pesos completos en safetensors; llama.cpp u Ollama previa conversión a GGUF. Advertencia: con 0,2 GB de repositorio es probable que el checkpoint no sea cargable de forma autónoma y requiera combinarse con los pesos del modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `PessimisticDPO/mistral-7b-sft-beta-a0.1-b0.1-L4-overlap_subsample-l2` | 7,24 mil millones (inferido) | No disponible | No disponible | Repositorio de 0,2 GB, 0 descargas | No evaluado |
| `HuggingFaceH4/mistral-7b-sft-beta` | 7,24 mil millones | 32.768 tokens | Apache 2.0 | Público y ampliamente usado | Figuras publicadas en su model card |
| `HuggingFaceH4/zephyr-7b-beta` | 7,24 mil millones | 32.768 tokens (entrenado con ventanas de 8.192) | MIT | Público y ampliamente usado | Figuras publicadas en su model card |
| `mistralai/Mistral-7B-Instruct-v0.2` | 7,24 mil millones | 32.768 tokens | Apache 2.0 | Público y ampliamente usado | Figuras publicadas en su model card |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 mil millones | 4.096 tokens | Llama 2 Community License | Público, con aceptación de términos | Figuras publicadas en su model card |

Los cuatro modelos de referencia son alternativas consolidadas de la misma categoría (7B con ajuste por instrucciones). Frente a ellos, este checkpoint carece de licencia declarada, de evaluación publicada y de garantía de integridad de pesos, por lo que no es comparable en términos de disponibilidad para producción.

## Limitaciones y advertencias

- Ausencia total de documentación: autoría, datos de entrenamiento, hiperparámetros y procedimiento no están declarados en la model card.
- Licencia no disponible: sin una licencia explícita no es posible determinar si el uso comercial está permitido, incluso aunque el modelo base sea Apache 2.0; la ausencia de licencia implica en la práctica reserva de derechos.
- Riesgo de checkpoint incompleto: 0,2 GB es incompatible con los ~14,5 GB esperables de un modelo de 7B en fp16; es probable que falten tensores o que el repositorio contenga únicamente un subconjunto.
- Sin evaluación: no existe ninguna medida de calidad, seguridad ni alineación. No puede asumirse que la etapa DPO haya preservado el comportamiento del checkpoint SFT.
- Sesgos heredados: el modelo base se entrena sobre UltraChat y corpus web en inglés, con los sesgos de género, origen, religión e ideología asociados a ese material.
- Riesgo de alucinación: alto en un modelo de 7B sin verificación factual ni mecanismos de abstención.
- Cobertura lingüística limitada: dominio del inglés y competencia reducida en castellano u otras lenguas.
- Sin moderación: no se ha aplicado ninguna capa de seguridad posterior; puede generar contenido tóxico, sesgado o dañino ante solicitudes adversas.
- Dependencia del prompt: el efecto de una penalización pesimista sobre la distribución de salida puede reducir la diversidad, aumentar la rigidez y degradar la utilidad de las respuestas.
- Advertencia de producción: no se recomienda su uso en sistemas con usuarios finales sin una auditoría previa de pesos, licencia, sesgos y calidad, y sin aplicar capas de filtrado y verificación externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PessimisticDPO/mistral-7b-sft-beta-a0.1-b0.1-L4-overlap_subsample-l2
- Referencia de la etiqueta arXiv declarada en el repositorio: https://arxiv.org/abs/1910.09700
- Modelo base del que deriva (inferido del identificador, no declarado por el autor): https://huggingface.co/HuggingFaceH4/mistral-7b-sft-beta
- Modelo de arquitectura de referencia (Mistral 7B): https://huggingface.co/mistralai/Mistral-7B-v0.1
- Documentación de la librería declarada: https://huggingface.co/docs/transformers/index
