# Banaxi-Tech/unified-2.1-test

## Resumen

BananaMind 2.1 Unified es un modelo de lenguaje causal de 34.999.041 parámetros (aproximadamente 35 millones) desarrollado por Banaxi-Tech, un laboratorio centrado en modelos de lenguaje pequeños (SLM), entrenamiento desde cero e interpretabilidad. Esta versión concreta, identificada como "unified-2.1-test", es una vista previa de entrenamiento al 5% del progreso total previsto (1,9 de 38 mil millones de tokens) y se distribuye como modelo base, sin ajuste por instrucciones.

La característica más distintiva es su arquitectura de tres torres transformer que comparten una única capa de embeddings de dimensión 384. Las torres A y C actúan como torres externas, cada una con su propia cabeza de salida, y la torre B actúa como relevo (relay) sin cabeza propia, siendo el único camino de comunicación entre A y C. La predicción del siguiente token se obtiene mediante una mezcla en el espacio de probabilidades de las dos cabezas de salida. El modelo ofrece una ventana de contexto de 4.096 tokens y un vocabulario de 8.192 tokens.

La relevancia de este modelo reside en su propuesta arquitectónica experimental: en lugar de un único stack transformer monolítico, explora la comunicación entre torres independientes mediante puentes (bridges) con un mecanismo de intercambio por rondas. Es un modelo pensado para investigación y experimentación, no para producción, dado su estado de entrenamiento parcial y su falta de validación comunitaria (0 descargas, 0 likes en Hugging Face).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres torres transformer (A: 14 capas, B relay: 5 capas, C: 6 capas) con embeddings compartidos y mezcla de cabezas en espacio de probabilidades |
| Parametros totales | 34.999.041 |
| Parametros activos | 34.999.041 (no es MoE; todos los parámetros se activan en cada forward) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16 autocast) |
| Idiomas soportados | Ingles (en) |
| Licencia | bananamind-community-license-1.0 (licencia personalizada) |
| Formato de pesos | safetensors, requiere trust_remote_code=True |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura de tres stacks transformer que comparten una única capa de embeddings de dimensión 384. La torre A tiene 14 capas con hidden size 256, MLP SwiGLU de 704 y atención 4Q/1KV. La torre B (relevo) tiene 5 capas con hidden size 320, MLP de 960 y atención 5Q/1KV, sin cabeza de salida ni término de pérdida propio. La torre C tiene 6 capas con hidden size 384, MLP de 1024 y atención 6Q/2KV, con su propia cabeza de salida. La predicción final es una mezcla en el espacio de probabilidades de las salidas de A y C. Head dim 64, QK norm, RoPE theta 100k, RMSNorm eps 1e-6.

La comunicación entre torres se realiza mediante puentes (bridges) en tres puntos por par de torres, en ambas direcciones, con un total de 1,23 millones de parámetros dedicados al intercambio. El mecanismo sigue un calendario de tres rondas donde la torre B siempre procesa la señal recibida antes de reenviarla. Las puertas (gates) son por canal y se inicializan a 0,01 en lugar de 0 para evitar que la torre B quede inactiva, dado que no tiene término de pérdida propio.

El entrenamiento se realizó con 8 GPU NVIDIA RTX PRO 6000 Blackwell Server Edition, usando AdamW con un único grupo de parámetros, pico de learning rate de 0,0023 y programación WSD con decaimiento coseno a 0 en el 15% final. La pérdida combinada es L_mix + 0,3 * (L_A + L_C). El modelo ha visto 1.900.019.712 tokens (5% del objetivo de 38.000 millones) procedentes de FineWeb-HQ (50,96%), DCLM (20,77%), Cosmopedia v2 (20,04%) y FineMath (8,23%).

Un detalle técnico importante: el atributo `.logits` del modelo contiene un vector de log-probabilidades normalizado, no logits sin normalizar, porque las dos cabezas se mezclan en el espacio de probabilidades. `log_softmax` es la identidad sobre este vector, por lo que la puntuación, `generate()` y el muestreo se comportan con normalidad.

## Capacidades

- Generación de texto causal: modelo base que predice el siguiente token en secuencias de texto en inglés.
- Arquitectura experimental de tres torres con relevo: permite estudiar la comunicación entre stacks transformer independientes mediante puentes bidireccionales.
- Modo de corte de puentes: con `cut_bridges=True` se pueden separar las torres A y C en dos transformers independientes, útil para análisis de interpretabilidad y comparación de comportamiento aislado frente a conjunto.
- Puntuación de secuencias (scoring) mediante log-probabilidades normalizadas.
- No soporta tool calling, function calling, ni capacidades de agente.
- No tiene capacidades multimodales (sin visión, audio ni vídeo).
- No está ajustado por instrucciones (base model), por lo que no sigue instrucciones ni mantiene diálogos de forma nativa.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación en arquitecturas multi-torre: el modelo permite estudiar cómo dos torres transformer independientes se comunican a través de un relevo, y cómo afecta la mezcla de probabilidades a la calidad de la generación. Es adecuado para publicaciones y experimentos de interpretabilidad mecánica.
- Análisis de interpretabilidad: al poder cortar los puentes (`cut_bridges=True`), se pueden comparar las representaciones internas de las torres A y C de forma aislada frente a su comportamiento conjunto, lo que facilita el estudio de la colaboración entre subredes y la atribución de comportamiento a torres concretas.
- Estudio de escalado en modelos pequeños: con 35 millones de parámetros, es adecuado para investigar leyes de escalado y comportamiento de entrenamiento en SLM sin necesidad de infraestructura costosa.
- Experimentos de entrenamiento desde cero: al ser una vista previa al 5%, sirve como punto de control para estudiar la dinámica de entrenamiento, la evolución de la pérdida y el comportamiento de las puertas de los puentes en fases tempranas.
- Generación de texto en inglés para prototipos: aunque es un modelo base sin ajuste por instrucciones, puede generar texto coherente en inglés para pruebas de concepto en entornos de investigación y desarrollo.
- Docencia y formación: su tamaño reducido y su arquitectura inusual lo convierten en un buen candidato para cursos de deep learning donde se quiera ilustrar alternativas al transformer monolítico, incluyendo mecanismos de comunicación entre subredes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo se encuentra al 5% de su entrenamiento previsto, por lo que cualquier evaluación estándar (MMLU, HumanEval, GSM8K) carecería de significado comparativo en este estado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 34.999.041 parámetros en bfloat16, el peso del modelo ocupa aproximadamente 70 MB. Cabe en cualquier GPU comercial, incluso en iGPU o en CPU con memoria RAM convencional.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA RTX 3060, RTX 4060 o superior ofrece margen amplio. También es viable la inferencia en CPU.
- Compatibilidad con GPU de consumo: sí, sin ninguna restricción. El modelo es extremadamente ligero.
- Opciones de despliegue: al requerir `trust_remote_code=True` por su arquitectura personalizada, el despliegue con vLLM, llama.cpp u Ollama no está garantizado sin adaptación del código personalizado. La vía natural es Hugging Face Transformers con el código del repositorio.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, la generación en GPU de consumo debería ser prácticamente instantánea para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| BananaMind 2.1 Unified (este) | 35 M | 4.096 | Tres torres con relevo | bananamind-community-license-1.0 | Vista previa al 5% del entrenamiento |
| SmolLM2-135M (HuggingFaceTB) | 135 M | 8.192 | Transformer estándar | Apache 2.0 | Completo, ajustado por instrucciones |
| TinyLlama-1.1B | 1.100 M | 2.048 | Transformer estándar (estilo LLaMA) | Apache 2.0 | Completo, ajustado por instrucciones |
| GPT-2 (124M) | 124 M | 1.024 | Transformer estándar | MIT | Completo, histórico |

La comparación directa con estos modelos es limitada porque BananaMind 2.1 Unified es un modelo base al 5% de entrenamiento con una arquitectura experimental. Los modelos listados están completos y, en su mayoría, ajustados por instrucciones, por lo que su rendimiento en tareas estándar será previsiblemente superior. La propuesta de valor de BananaMind reside en su arquitectura, no en su rendimiento actual.

## Limitaciones y advertencias

- El modelo está al 5% de su entrenamiento previsto (1,9 de 38 mil millones de tokens). Su calidad de generación es limitada y no representa el rendimiento final esperado.
- Es un modelo base sin ajuste por instrucciones: no responde a prompts conversacionales ni sigue instrucciones de forma fiable.
- Solo soporta inglés. No hay evidencia de capacidades multilingües.
- Ventana de contexto reducida: 4.096 tokens, insuficiente para tareas que requieran contexto largo.
- Riesgo de alucinación: como todo modelo base pequeño, puede generar texto incoherente o factualmente incorrecto, especialmente en este estado temprano de entrenamiento.
- Requiere `trust_remote_code=True` en Hugging Face Transformers, lo que implica ejecutar código personalizado del autor. Se recomienda auditar el código antes de usarlo en entornos sensibles.
- Licencia bananamind-community-license-1.0: es una licencia personalizada ("other") cuyo texto completo no se ha proporcionado en la información disponible. Antes de cualquier uso comercial, es imprescindible revisar los términos exactos de la licencia en el repositorio.
- El atributo `.logits` no contiene logits sin normalizar sino log-probabilidades normalizadas. Cualquier código que asuma logits estándar puede comportarse de forma inesperada.
- Sin descargas ni validación comunitaria: el modelo tiene 0 descargas y 0 likes en Hugging Face, por lo que no hay evidencia de uso externo ni retroalimentación de la comunidad.
- No hay garantías de soporte ni mantenimiento: el repositorio es un experimento de un laboratorio pequeño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Banaxi-Tech/unified-2.1-test
- Organización Banaxi-Tech en Hugging Face: https://huggingface.co/Banaxi-Tech
- Repositorio GitHub de Banaxi-Tech (Banana-Code): https://github.com/Banaxi-Tech/Banana-Code
- Modelo experimental relacionado (muon-model-test): https://huggingface.co/Banaxi-Tech/muon-model-test
- Repositorio GitHub de dmn-lm-test: https://github.com/Banaxi-Tech/dmn-lm-test
