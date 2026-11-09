# mradermacher/Hormoz-8B-GGUF

## Resumen

Hormoz-8B es un modelo de lenguaje conversacional de 8.028.033.024 parámetros (aproximadamente 8 mil millones) desarrollado por mann-e y distribuido en formato GGUF por mradermacher. Se trata de una cuantización estática del modelo base `mann-e/Hormoz-8B`, pensada para facilitar su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles con el formato GGUF.

El modelo declara soporte para 23 idiomas, con especial atención al persa (fa) y al inglés, y está destinado a tareas conversacionales de propósito general. Su licencia MIT permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integraciones en producto. Los datasets de ajuste declarados (`xmanii/mauxi-talk-pro` y `xmanii/mauxitalk-persian`) apuntan a un entrenamiento orientado a diálogo multilingüe.

La relevancia de esta ficha radica en que agrupa todas las cuantizaciones GGUF publicadas (desde Q2_K hasta f16) en un solo repositorio, con lo que un desarrollador puede elegir el equilibrio entre tamaño y calidad según su hardware. No obstante, la información pública sobre arquitectura interna, datos de entrenamiento y benchmarks es muy escasa, por lo que muchos apartados de esta ficha se marcan como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin confirmar detalles) |
| Parametros totales | 8.028.033.024 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, fr, de, es, it, pt, ja, ko, zh, ar, el, fa, pl, id, cs, he, hi, nl, ro, ru, tr, uk, vi |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `mann-e/Hormoz-8B`. Por el número de parámetros (8.028 millones) y el pipeline declarado (`transformers`), se trata presumiblemente de un transformer decoder-only de escala 8B, pero no se confirma en la documentación disponible la familia arquitectónica exacta, el número de capas, la dimensión oculta ni el mecanismo de atención.

Respecto al entrenamiento, la model card únicamente declara los datasets `xmanii/mauxi-talk-pro` y `xmanii/mauxitalk-persian`, sin especificar el número de tokens, la composición del corpus, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional multi-turno en 23 idiomas declarados.
- Soporte destacado de persa (fa) e inglés, según los datasets de ajuste empleados.
- Capacidad multilingüe amplia: incluye lenguas europeas (es, fr, de, it, pt, nl, pl, ro, ru, uk, el), asiáticas (ja, ko, zh, hi) y de Oriente Medio (ar, he, fa, tr).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo thinking, visión, audio ni otras capacidades multimodales.
- El tag `conversational` confirma su orientación a diálogo.

## Casos de uso

- Atención al cliente multilingüe: el modelo puede gestionar conversaciones en castellano, inglés, persa, árabe o lenguas europeas, lo que permite desplegar un único modelo para bases de clientes internacionales sin segmentar por idioma.
- Chatbot on-premise con hardware modesto: las cuantizaciones Q4_K_M (5,2 GB) y Q5_K_M (5,9 GB) caben en GPUs de consumo de 8 GB de VRAM, lo que habilita asistentes locales sin dependencia de la nube.
- Asistencia en persa para mercados iraníes: dado el ajuste específico sobre `xmanii/mauxitalk-persian`, es adecuado para productos orientados a usuarios persófonos donde otros modelos 8B tienen cobertura limitada.
- Prototipado rápido de aplicaciones conversacionales: la licencia MIT y la disponibilidad de GGUF permiten integrar el modelo en demos y MVPs sin trámites legales ni conversiones de formato.
- Despliegue en CPU mediante llama.cpp: las cuantizaciones Q3 y Q4 permiten ejecución en servidores sin GPU, útil para entornos de desarrollo o pruebas de integración.
- Generación de contenido multilingüe en pipelines editoriales: redacción y reformulación de textos en varios idiomas con un único modelo, reduciendo la complejidad operativa frente a soluciones por idioma.
- Experimentación académica en eficiencia de cuantización: el repositorio incluye 12 variantes de cuantización, lo que facilita estudiar el impacto de Q2_K a Q8_0 en calidad y latencia sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~3,5 GB
  - Q3_K_S: ~4,0 GB
  - Q4_K_S / Q4_K_M: ~4,9-5,2 GB
  - Q5_K_M: ~5,9 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 2070). Para Q8_0 o f16 se recomienda RTX 3090, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para la versión sin cuantizar, transformers con safetensors.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hormoz-8B (este) | 8,03B | no disponible | 23 | MIT | GGUF, safetensors |
| Llama 3.1 8B | 8,03B | 128k | 8 (oficiales) | Llama 3.1 Community | GGUF, safetensors |
| Mistral 7B v0.3 | 7,25B | 32k | principalmente en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5 7B | 7,62B | 128k | 29 | Apache 2.0 | GGUF, safetensors |

La comparativa se ofrece a nivel de especificaciones publicadas; no se dispone de datos de rendimiento de Hormoz-8B para contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que se desconoce su calidad real frente a modelos consolidados de tamaño similar.
- Riesgo de alucinación inherente a los modelos de 8B, agravado por la ausencia de documentación sobre el entrenamiento y posibles fases de alineamiento.
- La longitud de contexto no está documentada; asumir ventanas largas (32k o más) sin confirmación puede provocar degradación o errores en producción.
- El soporte real de los 23 idiomas declarados no está verificado; el ajuste se centra en inglés y persa, por lo que la calidad en el resto puede ser desigual.
- No se documenta soporte de tool calling, lo que limita su uso en pipelines agénticos frente a alternativas como Qwen2.5 o Llama 3.1.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor marca Q3_K_M como "lower quality".
- Aunque la licencia es MIT, conviene verificar la procedencia de los datos de entrenamiento del modelo base, no documentada, para descartar riesgos de compliance en uso comercial.
- Los repositorios de cuantización de terceros pueden quedar desactualizados respecto al modelo base; conviene comprobar la fecha de actualización (2026-11-09 en este caso).
- El modelo tiene 0 likes y 710 descargas en el momento de la consulta, indicador de baja adopción comunitaria que limita el soporte y la validación externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hormoz-8B-GGUF
- Modelo base: https://huggingface.co/mann-e/Hormoz-8B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Hormoz-8B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Hormoz-8B-GGUF
- Dataset de ajuste (inglés general): https://huggingface.co/datasets/xmanii/mauxi-talk-pro
- Dataset de ajuste (persa): https://huggingface.co/datasets/xmanii/mauxitalk-persian
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
