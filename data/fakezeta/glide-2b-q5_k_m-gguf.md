# fakezeta/GLiDE-2B-Q5_K_M-GGUF

## Resumen

GLiDE-2B es un modelo de decisión y clasificación desarrollado por Fastino, publicado originalmente en formato Transformers bajo el identificador `fastino/GLiDE-2B`. La ficha que nos ocupa, `fakezeta/GLiDE-2B-Q5_K_M-GGUF`, es una conversión no oficial a formato GGUF con cuantización Q5_K_M, generada mediante el espacio GGUF-my-repo de ggml.ai a partir de los pesos originales. El modelo cuenta con 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) y está orientado a tareas de clasificación y toma de decisiones, no a generación de texto libre al uso.

La relevancia de esta conversión radica en que permite ejecutar el modelo mediante llama.cpp en hardware modesto, algo coherente con su tamaño. Sin embargo, la información pública disponible es muy limitada: la model card del repositorio GGUF es una plantilla automática que remite a la model card original, y no se detallan arquitectura interna, datos de entrenamiento, contexto ni idiomas soportados. La licencia es `fastino-community` (etiquetada como `other`), lo que obliga a revisar el texto legal original antes de cualquier uso comercial.

Se trata, por tanto, de un artefacto de cuantización de un modelo especializado en clasificación, útil para quienes quieran integrar GLiDE-2B en entornos ligeros o sin GPU dedicada, pero con un nivel de documentación insuficiente para evaluar su calidad de forma rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión/clasificación; arquitectura interna no documentada en la información disponible) |
| Parametros totales | 1.881.825.088 (≈1,88 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de servidor usa `-c 2048`, pero es solo un valor de ejemplo, no una especificación) |
| Tipos de cuantizacion | Q5_K_M (esta conversión); otras cuantizaciones del modelo base no disponibles en la información |
| Idiomas soportados | no disponible |
| Licencia | fastino-community (etiqueta `other`; enlace a LICENSE en el repo base) |
| Formato de pesos | GGUF (archivo `glide-2b-q5_k_m.gguf`); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. La etiqueta `decision-model` y `classification` indica que está diseñado para producir decisiones o etiquetas clasificatorias más que para generación abierta de texto, pero no se especifica si emplea un transformer decoder, encoder o una variante híbrida. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste supervisado.

Respecto a esta conversión concreta, se generó con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, aplicando la cuantización Q5_K_M sobre los pesos originales de `fastino/GLiDE-2B`. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni detalles sobre el proceso de cuantización más allá del método estándar de llama.cpp.

## Capacidades

- Clasificación y toma de decisiones: el modelo está etiquetado como `decision-model` y `classification`, por lo que su uso previsto es asignar categorías o resolver decisiones estructuradas.
- Inferencia local vía llama.cpp: al estar en GGUF, puede ejecutarse con `llama-cli` y `llama-server` en CPU o GPU.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructuras de serving compatibles.
- Generación de texto: la model card incluye un ejemplo de `llama-cli` con un prompt de completación, pero no hay evidencia de que la generación abierta sea su función principal ni de su calidad.
- Tool calling / function calling: no disponible en la información.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede recibir el texto de una incidencia y devolver una categoría (facturación, técnico, cuenta), aprovechando su orientación a `classification` y su tamaño reducido para procesar lotes en CPU.
- Enrutamiento de consultas en un chatbot: usar GLiDE-2B como clasificador previo que decida a qué flujo o agente derivar cada mensaje, ejecutándolo con llama.cpp en el mismo servidor que el modelo generativo principal.
- Moderación de contenido por categorías: asignar etiquetas de riesgo o temática a textos entrantes en un pipeline de moderación, con la ventaja de que el modelo Q5_K_M cabe en memoria modesta y permite alto throughput en CPU.
- Etiquetado semiautomático de datasets: procesar grandes volúmenes de texto para preetiquetar clases antes de la revisión humana, usando `llama-server` con peticiones por lotes.
- Filtrado previo en pipelines RAG: decidir si una consulta del usuario requiere recuperación de documentos o puede responderse directamente, como clasificador binario de baja latencia.
- Prototipado en portátiles sin GPU: gracias a la cuantización Q5_K_M y al tamaño de ~1,4 GB del repositorio, es viable experimentar con el modelo en un portátil convencional mediante `llama-cli`, sin necesidad de infraestructura dedicada.
- Decisión en sistemas de recomendación simples: clasificar ítems o perfiles en categorías discretas dentro de un motor de reglas, donde la inferencia local y el bajo coste son prioritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización Q5_K_M y ~1,88 mil millones de parámetros, el archivo pesa aproximadamente 1,4 GB; la inferencia completa requiere del orden de 2 a 3 GB de memoria (pesos más overhead de contexto y KV cache), aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la información; por tamaño, cualquier GPU con 4 GB o más de VRAM debería poder alojarlo.
- GPU de consumo: sí, cabe en tarjetas consumer como RTX 3060, RTX 4060 o superiores; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`); la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de endpoints, pero no se detallan integraciones con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponible en la información.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión/clasificación de ~2B) en la documentación proporcionada. La comparación con alternativas como clasificadores BERT o modelos generativos pequeños requeriría datos de benchmarks que no están publicados en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLiDE-2B (Q5_K_M, esta ficha) | ≈1,88 B | no disponible | fastino-community | GGUF | Modelo de decisión/clasificación |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la información disponible |

## Limitaciones y advertencias

- Documentación insuficiente: la model card es una plantilla automática de conversión a GGUF; no hay información sobre arquitectura, entrenamiento, sesgos ni evaluación.
- Riesgo de alucinación: al ser un modelo de clasificación, el uso como generador de texto libre (como sugiere el ejemplo de la model card) puede producir salidas incoherentes o no fiables.
- Idiomas: se desconoce qué idiomas cubre; no debe asumirse soporte multilingüe.
- Contexto: no se especifica la longitud de contexto real; el valor `-c 2048` del ejemplo es solo un parámetro de arranque del servidor, no una garantía del modelo.
- Licencia: `fastino-community` con etiqueta `other`; es imprescindible revisar el texto de la licencia en el repositorio base antes de cualquier uso comercial o redistribución.
- Conversión no oficial: este GGUF lo ha generado un tercero (`fakezeta`), no el autor original; puede haber diferencias de comportamiento respecto a los pesos en safetensors.
- Sesgos: no disponible en la información; no se han documentado evaluaciones de sesgo.
- Producción: sin benchmarks ni datos de robustez, no se recomienda desplegarlo en producción crítica sin una evaluación propia previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/fakezeta/GLiDE-2B-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/fastino/GLiDE-2B
- Licencia del modelo base: https://huggingface.co/fastino/GLiDE-2B/blob/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
