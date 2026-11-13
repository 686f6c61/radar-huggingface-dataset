# mrminjae/qwen3p6-35b-a3b-r154

## Resumen

Qwen3.6-35B-A3B (r154) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado mediante cuantización del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una variante cuantizada de un modelo de arquitectura Mixture of Experts (MoE) con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos por token, según se deduce de la nomenclatura "35B-A3B" del modelo base. El checkpoint se distribuye en formato compatible con `transformers` y vLLM, con los tensores de los expertos enrutados cuantizados a aproximadamente 2 bits y el resto de tensores en BF16.

La relevancia de esta publicación es limitada y de carácter experimental: se identifica explícitamente como un "checkpoint de investigación interno" (internal research checkpoint) con identificador r154, sin model card descriptiva, sin datos de entrenamiento, sin benchmarks y sin licencia declarada más allá de la herencia del modelo base. No registra descargas ni interacciones en el momento de la consulta.

Para evaluar el modelo en producción, la referencia real es el modelo base Qwen3.6-35B-A3B, ya que este checkpoint no aporta información adicional sobre capacidades, entrenamiento o rendimiento. La ficha siguiente documenta lo que se puede afirmar con rigor a partir de la información disponible, marcando como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), derivada del modelo base Qwen3.6-35B-A3B; detalles internos no disponibles |
| Parametros totales | 35B (según nomenclatura del modelo base) |
| Parametros activos | 3B (según nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a ~2 bits; tensores restantes en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base; la licencia del base no se especifica en la información proporcionada) |
| Formato de pesos | Pesos compatibles con `transformers` y vLLM; formato de fichero concreto (safetensors, etc.) no disponible |

## Arquitectura y entrenamiento

La arquitectura es de tipo Mixture of Experts, heredada del modelo base Qwen/Qwen3.6-35B-A3B, con 35B parámetros totales y 3B activos por token. El checkpoint r154 no modifica la topología: aplica cuantización post-entrenamiento a los tensores de los expertos enrutados, dejándolos en aproximadamente 2 bits, mientras que el resto de tensores se mantienen en BF16. Esta mezcla de precisiones busca reducir el espacio en memoria de los expertos, que son la mayor parte del peso del modelo, conservando la precisión de las capas densas.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia cuantización de expertos. El autor indica que el checkpoint carga con `transformers` estándar y vLLM, lo que sugiere compatibilidad con el ecosistema habitual, pero no se detallan los kernels o métodos de cuantización empleados (por ejemplo, si es GPTQ, AWQ, bitsandbytes u otro esquema propietario).

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que la función principal es la generación autoregresiva de texto.
- Razonamiento y código: no disponible; no se documentan capacidades específicas en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad de despliegue: el autor afirma que carga con `transformers` estándar y vLLM.

## Casos de uso

- Evaluación experimental de cuantización de expertos: el checkpoint permite a investigadores medir el impacto de cuantizar los expertos enrutados a ~2 bits manteniendo BF16 en el resto de tensores, comparando calidad frente al modelo base. Es adecuado porque su propósito declarado es precisamente servir como checkpoint de investigación.
- Pruebas de integración con vLLM: al declararse compatible con vLLM, puede usarse para validar pipelines de inferencia con modelos MoE de bajo bit en entornos de laboratorio antes de adoptar el modelo base en producción.
- Investigación sobre degradación por cuantización agresiva: útil para estudiar cómo afecta la cuantización a 2 bits de los expertos a tareas de generación de texto, siempre que se disponga de una referencia del modelo base para comparar.
- Prototipado en hardware con VRAM limitada: la reducción de precisión en los expertos puede permitir experimentar con un MoE de 35B en GPUs donde el modelo en BF16 no cabría, aunque el rendimiento real no está documentado.
- Reproducción de experimentos internos: el identificador r154 sugiere un uso de trazabilidad dentro de una línea de investigación; puede servir para replicar resultados de ese checkpoint concreto.
- Docencia y formación sobre cuantización de MoE: como ejemplo práctico de mezcla de precisiones (2 bits en expertos, BF16 en el resto) para explicar compromisos entre memoria y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Como referencia orientativa basada en el tamaño, un MoE de 35B en BF16 requeriría del orden de 70 GB solo para pesos, mientras que la cuantización a ~2 bits de los expertos reduce sustancialmente esa cifra; el autor no publica el tamaño final del checkpoint ni la VRAM necesaria.
- GPU recomendadas: no disponible. Para el modelo base de 35B en BF16 serían necesarias GPUs de centro de datos (A100 80 GB, H100); con la cuantización aplicada el requisito podría bajar, pero no hay datos confirmados.
- ¿Cabe en GPU de consumo? No disponible; depende del tamaño real del checkpoint cuantizado, que no se especifica.
- Opciones de despliegue: `transformers` estándar y vLLM, según indica el autor. No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-r154 | 35B / 3B | no disponible | no disponible (hereda del base) | Hugging Face, 0 descargas | Checkpoint de investigación cuantizado a ~2 bits en expertos |
| Qwen/Qwen3.6-35B-A3B (base) | 35B / 3B | no disponible | no disponible en la información proporcionada | Hugging Face | Modelo de referencia sin cuantizar; sirve de comparación directa |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe como "internal research checkpoint", sin model card completa, sin benchmarks y sin garantías de calidad.
- Cuantización agresiva: los expertos enrutados están a ~2 bits, lo que puede degradar la calidad de forma no cuantificada respecto al modelo base; no se publican métricas de esa degradación.
- Licencia no declarada: el autor remite a la licencia del modelo base, pero esta no se especifica en la información disponible; no se puede confirmar el uso comercial.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Contexto no declarado: se desconoce la ventana de contexto máxima soportada.
- Riesgo de alucinación: no evaluado; sin benchmarks ni evaluaciones publicadas.
- Sesgos: no documentados.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Formato de pesos no confirmado: aunque se indica compatibilidad con `transformers` y vLLM, no se detalla el formato de fichero ni el método de cuantización, lo que complica la reproducibilidad.
- Para producción, se recomienda evaluar directamente el modelo base Qwen/Qwen3.6-35B-A3B, que cuenta con documentación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-r154
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
