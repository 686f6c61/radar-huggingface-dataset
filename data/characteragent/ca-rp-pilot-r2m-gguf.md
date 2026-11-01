# characteragent/ca-rp-pilot-r2m-gguf

## Resumen

ca-rp-pilot-r2m es una compilación de prueba (test pilot) publicada por el usuario characteragent en Hugging Face, consistente en un ajuste fino mediante LoRA sobre el modelo base LiquidAI/LFM3-1.7B, orientado a conversaciones de role-play. El autor la describe explícitamente como una build interna para pruebas de aplicación, no como un lanzamiento, y desaconseja su uso en producción. Se distribuye únicamente en formato GGUF cuantizado a Q4_0 con imatrix, lo que la limita a inferencia con llama.cpp y herramientas compatibles.

El modelo hereda la arquitectura y el tamaño del LFM3-1.7B de Liquid AI, con 1.728.801.600 parámetros totales según los metadatos de safetensors, y se publica bajo la licencia LFM Open License v1.0 (etiquetada como "other" en el repo). No se aportan datos sobre composición del dataset de ajuste, número de tokens de entrenamiento, idiomas soportados ni resultados de evaluación, por lo que su interés práctico es acotado: sirve como referencia técnica de un pipeline de fine-tuning LoRA + merge + cuantización GGUF, más que como modelo desplegable.

Su relevancia actual es marginal dentro del ecosistema open source: cuenta con 47 descargas y 0 likes en el momento de la consulta, y el propio autor restringe su uso. Resulta útil, eso sí, como ejemplo de integración de un modelo pequeño (≈1,7B) en aplicaciones conversacionales ligeras y como caso de estudio de cuantización Q4_0 con imatrix sobre un modelo base de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM3-1.7B; detalles específicos de la arquitectura del base no disponibles en la información proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 con imatrix (único archivo publicado: `ca-rp-pilot-r2m-Q4_0.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other" / `lfm1.0` en el repo) |
| Formato de pesos | GGUF (1.049.615.264 bytes; SHA-256 `0920d936fe1fba29b309de276d2ae48c8dd673ddd5e93a92da8140e8f5366a6b`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de aproximadamente 1,73 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA utilizando chats sintéticos de role-play; posteriormente el adaptador se fusionó (merge) con los pesos base y el resultado se cuantizó a Q4_0 empleando una matriz de importancia (imatrix). No se especifican hiperparámetros del entrenamiento, número de tokens, composición del dataset sintético, ni si hubo etapas de RLHF o DPO.

La innovación técnica documentada se limita al propio pipeline de publicación: LoRA sobre un modelo pequeño, merge y cuantización Q4_0 con imatrix para reducir el tamaño a ~1 GB manteniendo un formato compatible con llama.cpp. El autor indica que debe usarse con la plantilla de chat del modelo base, lo que sugiere que el ajuste no modificó el formato de conversación. No hay información sobre atención lineal, decodificación especulativa ni otras optimizaciones propias de la familia LFM3.

## Capacidades

- Generación de texto conversacional orientada a role-play, según el propósito declarado del ajuste.
- Conversaciones multi-turno (la plantilla de chat del modelo base debe aplicarse manualmente).
- Inferencia local en CPU o GPU de gama baja gracias a la cuantización Q4_0 (~1 GB de pesos).
- Compatibilidad con llama.cpp y con endpoints que acepten GGUF (el tag `endpoints_compatible` aparece en el repo).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking: no disponible.

## Casos de uso

- Pruebas internas de aplicaciones de chat con personajes: el modelo está pensado por el autor para testing interno de una app de role-play, con conversaciones multi-turno gestionadas por la aplicación que aplique la plantilla de chat del base.
- Evaluación de pipelines de fine-tuning: sirve como ejemplo reproducible de LoRA + merge + cuantización Q4_0 con imatrix sobre un modelo de 1,7B, útil para equipos que diseñan su propio flujo de publicación.
- Prototipado rápido en hardware modesto: al ocupar ~1 GB en Q4_0, puede ejecutarse con llama.cpp en portátiles sin GPU dedicada para validar ideas de producto antes de invertir en modelos mayores.
- Demostraciones de role-play en entornos controlados: adecuado para pruebas de UX de chatbots con personalidad, siempre que no se exponga a usuarios finales por la advertencia del autor.
- Benchmarking de cuantización: comparar la calidad Q4_0 con imatrix frente a otras cuantizaciones del mismo base para calibrar el impacto en calidad conversacional.
- Integración en pipelines de CI para verificar compatibilidad GGUF: comprobar que una aplicación basada en llama.cpp carga y ejecuta correctamente un GGUF de ~1 GB con la plantilla de chat esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB para los pesos en Q4_0, más overhead de contexto KV (dependiente de la longitud de contexto, no documentada).
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con ≥2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, etc.).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria unificada.
- Despliegue: llama.cpp es el runtime indicado por el autor; también cabría en servidores compatibles con GGUF (p. ej., Ollama o llama-cpp-python), aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ca-rp-pilot-r2m | 1,73B | No disponible | LFM Open License v1.0 | GGUF Q4_0 | Build de prueba, no para producción |
| LiquidAI/LFM3-1.7B (base) | 1,73B | No disponible en la información proporcionada | LFM Open License v1.0 | Safetensors (base) | Modelo original sin ajuste de role-play |
| Alternativas de role-play de ~1-3B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

La comparación más directa es con su propio modelo base, LiquidAI/LFM3-1.7B: comparten tamaño y licencia, pero el ajuste LoRA introduce especialización en role-play a costa de posibles regresiones en capacidades generales, algo que no puede cuantificarse sin evaluaciones publicadas.

## Limitaciones y advertencias

- El autor declara explícitamente que es una build de prueba interna y que no debe usarse en producción.
- No se han publicado evaluaciones de calidad, sesgos ni alucinación; el ajuste sobre chats sintéticos de role-play puede incrementar la fabulación y la deriva de personaje.
- Dataset de entrenamiento sintético y no documentado: riesgo de sesgos reproducidos del generador de datos y del modelo base.
- Sin información sobre idiomas soportados ni longitud de contexto; no se puede garantizar un comportamiento multilingüe ni conversaciones largas.
- Licencia LFM Open License v1.0: es necesario revisar el archivo LICENSE del repo para conocer las restricciones de uso comercial, ya que se etiqueta como "other".
- Única cuantización publicada (Q4_0), lo que limita el ajuste fino de calidad/velocidad y puede degradar la coherencia frente a Q5/Q8.
- Requiere aplicar manualmente la plantilla de chat del modelo base; un uso incorrecto produce respuestas degeneradas.
- Repositorio con muy poca tracción (47 descargas, 0 likes) y sin mantenimiento documentado; la fecha de creación y actualización es 2026-10-30.

## Enlaces

- Hugging Face: https://huggingface.co/characteragent/ca-rp-pilot-r2m-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: referenciada como `LICENSE` dentro del repositorio del modelo
