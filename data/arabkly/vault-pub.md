# arabkly/vault-pub

## Resumen

Vault-pub es un modelo de lenguaje publicado por el usuario arabkly en Hugging Face bajo el identificador `arabkly/vault-pub`. Se distribuye en formato safetensors y GGUF, con un total de 30.697.345.596 parámetros (aproximadamente 30,7 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande. El repositorio incluye además el tag `imatrix`, lo que sugiere que se han generado cuantizaciones calibradas mediante matrices de importancia, y el tag `endpoints_compatible`, indicativo de que puede servirse a través de endpoints compatibles con la API de OpenAI.

La información pública disponible sobre este modelo es muy limitada: no se especifican la arquitectura, la longitud de contexto, los idiomas soportados, la licencia ni los datos de entrenamiento. El pipeline no está declarado y no se han publicado resultados de benchmarks. El repositorio, con 56 descargas y 0 likes, tiene un tamaño de 3.230,4 GB, lo que refleja la presencia de múltiples artefactos (probablemente varias cuantizaciones GGUF junto con los pesos originales en safetensors).

Por tanto, esta ficha se limita a documentar los datos verificables del repositorio e indica explícitamente como "no disponible" todo aquello que no puede confirmarse. Cualquier evaluación de capacidades, rendimiento o idoneidad para producción requeriría consultar la model card del autor o realizar pruebas empíricas directamente sobre los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye variantes con calibracion imatrix); safetensors en precision original no especificada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer denso, MoE, híbrido u otra), ni sobre el número de tokens de entrenamiento, la composición del dataset o las técnicas de alineación empleadas (RLHF, DPO, etc.). El recuento de parámetros en safetensors (30.697.345.596) es el único dato estructural verificable.

El tag `imatrix` en el repositorio indica que las cuantizaciones GGUF se han generado con calibración basada en matrices de importancia, una técnica habitual para preservar la calidad en cuantizaciones de baja precisión. El tag `conversational` sugiere un ajuste orientado a diálogo, pero no se detalla el proceso de entrenamiento ni los datos utilizados.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica un ajuste orientado a diálogo multi-turno, aunque no se detallan las capacidades concretas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede desplegarse tras una API compatible con OpenAI (por ejemplo, vLLM o TGI con capa de compatibilidad).
- Capacidades de razonamiento, código, matemáticas, visión, tool calling o agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modos especiales (thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en infraestructura propia mediante GGUF: el modelo puede ejecutarse con llama.cpp u Ollama usando las cuantizaciones publicadas, lo que permite servir un modelo de ~30,7 B en hardware con memoria limitada ajustando el nivel de cuantización.
- Integración en pipelines existentes compatibles con OpenAI: gracias al tag `endpoints_compatible`, puede sustituir a otros modelos en aplicaciones que ya consumen la API de OpenAI cambiando únicamente la URL base y el nombre del modelo.
- Experimentación e investigación: al estar disponible en safetensors, permite fine-tuning, evaluación o análisis de pesos con las herramientas estándar (transformers, PEFT, etc.).
- Prototipado de asistentes conversacionales: el ajuste conversacional declarado lo hace candidato para construir chatbots de prueba, siempre que se valide empíricamente la calidad de las respuestas.
- Evaluación comparativa interna: sirve como baseline adicional de ~30 B en pruebas de calidad frente a modelos de tamaño similar.
- Despliegue en entornos con requisitos de soberanía de datos: al poder ejecutarse localmente, permite mantener las conversaciones dentro de la infraestructura propia sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 61 GB solo para pesos (2 bytes por parámetro), más overhead de contexto y KV cache; requiere GPU de 80 GB (A100, H100) o múltiples GPU.
- Cuantización de 8 bits: ~31 GB de pesos; cabe en una A100 40 GB o en dos RTX 4090 (24 GB cada una) con tensor parallelism.
- Cuantización de 4 bits (Q4_K_M y similares): ~16-18 GB de pesos; viable en una RTX 4090 (24 GB) con contexto moderado.
- Cuantizaciones de 2-3 bits: permiten ejecución en GPUs de 12-16 GB, con degradación de calidad esperable.
- Despliegue: llama.cpp u Ollama para GGUF; vLLM o TGI para safetensors en GPU; también es posible la ejecución en CPU con GGUF, a costa de latencia mucho mayor.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de arquitectura del modelo, por lo que no es posible establecer una comparativa rigurosa con alternativas de ~30 B. Se indica "no disponible" para rendimiento y licencia. Como referencia de categoría, los modelos abiertos de tamaño comparable incluyen familias como Qwen2.5-32B, Gemma-2-27B o Mixtral-8x7B, pero no se han verificado sus diferencias frente a vault-pub con datos públicos.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan arquitectura, datos de entrenamiento, sesgos ni evaluación, lo que impide valorar su idoneidad para producción.
- Licencia no especificada: no puede confirmarse el uso comercial; debe consultarse el repositorio antes de cualquier despliegue.
- Riesgo de alucinación: no evaluado; sin benchmarks ni pruebas publicadas no hay garantías de fiabilidad factual.
- Idiomas soportados desconocidos: no se puede asegurar un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto desconocida: limita el diseño de aplicaciones que dependan de ventanas largas.
- Repositorio con muy poca tracción (56 descargas, 0 likes) y creado recientemente: menor probabilidad de revisión comunitaria y de soporte.
- Tamaño del repo (3.230,4 GB): la descarga completa es costosa; conviene descargar solo los archivos necesarios (por ejemplo, una cuantización GGUF concreta).

## Enlaces

- Hugging Face: https://huggingface.co/arabkly/vault-pub
