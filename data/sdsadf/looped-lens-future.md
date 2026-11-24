# sdsadf/looped-lens-future

## Resumen

`looped-lens-future` es un conjunto de artefactos de interpretabilidad publicados por el usuario `sdsadf` en Hugging Face, no un modelo de lenguaje generativo. Se trata de mapas de baja dimensionalidad ("future lens") entrenados sobre las activaciones internas de `thinkingmachines/Inkling-2-Mini`, un modelo sobre el que no se dispone de información adicional en la documentación proporcionada. El repositorio se enmarca en la Looped Lens Challenge, una iniciativa de investigación en interpretabilidad mecanicista centrada en modelos con arquitecturas de capas repetidas (looped).

El artefacto implementa una transformación lineal de bajo rango por cada visita a capa (`A.{visit}`, `B.{visit}`, `b.{visit}`) más una máscara de vocabulario (`vocab_mask`) que restringe las lecturas a tokens de contenido. La fórmula documentada es `h' = h + ((h / rms(h)) @ A) @ B * rms(h) + b`, seguida de `scores = unembed(final_norm(h'))`. El objetivo declarado es predecir, a partir de la activación en el último token del prompt, los tokens de contenido que el modelo generará después (razonamiento y respuesta).

Su relevancia es acotada y experimental: sirve como material reproducible para investigadores que trabajen con `nnsight` y con técnicas de tuned lens sobre modelos looped, no como componente desplegable en producción. El repositorio no registra descargas ni interacciones, y no incluye pesos de un modelo base ni una pipeline de inferencia estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapas lineales de bajo rango (A, B, b) por visita a capa sobre activaciones de `thinkingmachines/Inkling-2-Mini`; no es un modelo transformer completo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio declara artefactos A, B, b y `vocab_mask`; no se especifica el formato de serialización) |

## Arquitectura y entrenamiento

El artefacto no es un modelo de lenguaje, sino un conjunto de proyecciones lineales de bajo rango que actúan sobre el estado oculto `h` de `Inkling-2-Mini` en cada visita a capa. La operación aplica una normalización RMS, una proyección `A`, una segunda proyección `B` y un sesgo `b`, sumando el resultado al estado original (conexión residual). Posteriormente se aplica `final_norm` y `unembed` para obtener una distribución sobre el vocabulario, filtrada por `vocab_mask` para conservar únicamente tokens de contenido.

Según la model card, cada mapa se entrena con las activaciones del propio modelo en el último token del prompt, con el objetivo de predecir los tokens de contenido que el modelo generará a continuación (razonamiento y respuesta) para los prompts del autor. No se especifican el número de prompts, el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de regularización o validación cruzada. Tampoco se detalla la dimensión del rango reducido ni el número de visitas a capa cubiertas.

## Capacidades

- Predicción de tokens futuros de contenido a partir de la activación en el último token del prompt, mediante los mapas `A`, `B`, `b` y la máscara `vocab_mask`.
- Lectura de activaciones internas por visita a capa, orientada a modelos con capas repetidas (looped).
- Integración con `nnsight` para la extracción e intervención de activaciones, según las etiquetas del repositorio.
- Soporte de análisis de interpretabilidad tipo tuned lens sobre `thinkingmachines/Inkling-2-Mini`.
- No soporta generación de texto, tool calling, agentes, visión, audio ni capacidades multilingües: no es un modelo generativo.
- No se documenta modo de razonamiento (thinking mode) propio ni decodificación especulativa.

## Casos de uso

- Investigación en interpretabilidad mecanicista: aplicar los mapas sobre activaciones de `Inkling-2-Mini` para estudiar qué información sobre la respuesta futura está codificada en el último token del prompt, comparando la predicción del lens con la generación real.
- Análisis de modelos looped: al existir un mapa por visita a capa, permite comparar cómo evoluciona la representación del "futuro" a medida que el estado pasa por las mismas capas repetidas.
- Reproducción de experimentos de la Looped Lens Challenge: el repositorio proporciona los artefactos `A.{visit}`, `B.{visit}`, `b.{visit}` y `vocab_mask` necesarios para replicar la evaluación del autor.
- Auditoría de fidelidad de lentes: contrastar las predicciones del future lens con los tokens realmente generados por el modelo para medir la precisión de la lectura en tokens de contenido.
- Docencia y formación en interpretabilidad: usar la fórmula documentada y los artefactos como ejemplo práctico de tuned lens de bajo rango sobre un modelo abierto.
- Desarrollo de técnicas de detección temprana de contenido: explorar si la activación del último token permite anticipar categorías de respuesta antes de que el modelo empiece a generar, siempre en un contexto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `thinkingmachines/Inkling-2-Mini`, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio está orientado a `nnsight` para la extracción de activaciones; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Artefacto | Modelo base | Técnica | Licencia | Disponibilidad |
|---|---|---|---|---|
| `sdsadf/looped-lens-future` | `thinkingmachines/Inkling-2-Mini` | Future lens de bajo rango por visita a capa | MIT | Hugging Face, 0 descargas |
| Tuned lens (Belrose et al.) | Modelos transformer estándar | Proyección afín por capa | MIT (implementación de referencia) | Repositorios públicos de interpretabilidad |
| Logit lens | Cualquier transformer | Proyección directa con `unembed` | No aplica | Técnica ampliamente documentada |

No se dispone de datos de rendimiento comparables entre estas técnicas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para generar texto, código ni respuestas; solo produce distribuciones de tokens futuros a partir de activaciones.
- Los mapas están entrenados exclusivamente con los prompts del autor; no hay evidencia de generalización a otros dominios, idiomas o distribuciones de entrada.
- No se documenta el número de visitas a capa cubiertas, la dimensión del rango reducido ni el proceso de validación, lo que dificulta evaluar su fidelidad.
- Dependencia estricta de `thinkingmachines/Inkling-2-Mini`: los artefactos no son transferibles a otros modelos ni a otras versiones del modelo base.
- El repositorio registra 0 descargas y 0 likes, sin señales de revisión por parte de la comunidad.
- Riesgo de interpretación errónea: un future lens puede reflejar correlaciones superficiales en las activaciones y no un mecanismo causal real de la predicción del modelo.
- Licencia MIT: permite uso comercial y modificación, pero no exime de las restricciones de la licencia del modelo base, que no se detalla en la información disponible.
- No se especifican sesgos conocidos ni limitaciones idiomáticas porque no hay datos al respecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sdsadf/looped-lens-future
- Modelo base referenciado: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- `nnsight` (herramienta citada en las etiquetas): no se proporciona enlace en la información disponible
- Looped Lens Challenge: no se proporciona enlace en la información disponible
