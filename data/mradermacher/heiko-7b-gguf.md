# mradermacher/heiko-7b-GGUF

## Resumen

heiko-7b-GGUF es una colección de cuantizaciones en formato GGUF del modelo base eriksu/heiko-7b, un transformer de 7.241.732.096 parámetros (aproximadamente 7,24 mil millones) publicado originalmente en diciembre de 2024. El trabajo de cuantización lo realiza mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face que distribuye versiones estáticas del modelo para su uso con llama.cpp y herramientas compatibles. El modelo base está etiquetado únicamente para inglés y no dispone de model card detallada en la información disponible.

El interés práctico de este repositorio reside en que ofrece el modelo en múltiples niveles de compresión (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), lo que permite ejecutar un modelo de 7B en hardware de consumo con distintas relaciones calidad/tamaño. Al tratarse de cuantizaciones estáticas (no imatrix), el autor advierte de que las versiones ponderadas por importancia podrían no estar disponibles.

No se dispone de información sobre la arquitectura interna del modelo base, el dataset de entrenamiento, la longitud de contexto ni la licencia. Cualquier evaluación rigurosa del modelo debería remitirse al repositorio original eriksu/heiko-7b, cuya model card no se incluye en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); modelo base eriksu/heiko-7b |
| Parámetros totales | 7.241.732.096 (7,24 B) |
| Parámetros activos | No aplica (no es MoE, según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en formato transformers/safetensors |
| Tamaño del repositorio | 63,9 GB (incluye todas las cuantizaciones) |
| Fecha de creación | 2024-12-17 |
| Última actualización | 2026-11-18 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base eriksu/heiko-7b más allá de que se trata de un transformer de 7,24 mil millones de parámetros compatible con la librería transformers. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención (si es atención completa, GQA o sliding window) ni la longitud de contexto nativa.

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El trabajo de mradermacher se limita a la conversión y cuantización estática del modelo original a GGUF; no introduce cambios arquitectónicos ni reentrenamiento. Las cuantizaciones IQ (como IQ4_XS) emplean cuantización por importancia de pesos, mientras que el resto son cuantizaciones estáticas K-quant.

## Capacidades

- Generación de texto en inglés, presumiblemente con capacidad de razonamiento general propia de un modelo de 7B, aunque no se documentan capacidades específicas.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de visión, audio ni modos de pensamiento explícitos.
- Ejecutable localmente mediante llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, etc.).

## Casos de uso

- Prototipado local de asistentes conversacionales en inglés: las cuantizaciones Q4_K_S y Q4_K_M (4,2-4,5 GB) permiten desplegar un modelo de 7B en GPUs de consumo de 8 GB de VRAM, adecuado para pruebas de concepto sin infraestructura en la nube.
- Generación de texto en entornos con recursos limitados: la cuantización Q2_K (2,8 GB) permite ejecutar el modelo en CPUs modernas o GPUs integradas, útil para tareas de generación de texto no crítica donde prima la disponibilidad sobre la calidad.
- Despliegue en dispositivos edge o portátiles: las versiones Q3 y Q4 caben en sistemas con 8-16 GB de RAM unificada, lo que facilita su uso en estaciones de trabajo sin GPU dedicada.
- Experimentación académica con cuantización: el repositorio ofrece un espectro amplio de niveles de compresión (de 2,8 a 14,6 GB) que permite estudiar el impacto de la cuantización en la perplejidad y la calidad de salida sobre un mismo modelo base.
- Evaluación comparativa de modelos de 7B: sirve como referencia para comparar el rendimiento de heiko-7b frente a otros modelos de tamaño similar en tareas de inglés, usando la misma infraestructura de inferencia (llama.cpp).
- Integración en pipelines de generación de texto por lotes: la versión Q8_0 (7,8 GB) ofrece una calidad cercana al modelo original con un coste de memoria moderado, adecuada para tareas de procesamiento por lotes en servidores con una única GPU de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~2,8 GB de pesos; ~4 GB de VRAM total con contexto moderado.
  - Q3_K_M: ~3,6 GB de pesos.
  - Q4_K_M: ~4,5 GB de pesos; ~6 GB de VRAM total recomendados.
  - Q5_K_M: ~5,2 GB de pesos.
  - Q6_K: ~6,0 GB de pesos.
  - Q8_0: ~7,8 GB de pesos; ~10 GB de VRAM total recomendados.
  - f16: ~14,6 GB de pesos; requiere GPU de 24 GB o más para contexto amplio.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A100 40/80 GB, H100 80 GB para las versiones de mayor precisión.
- Cabe en GPU de consumo: sí, las cuantizaciones Q2 a Q5 caben en GPUs de 8 GB; Q6 y Q8 requieren 12-16 GB; f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El modelo base también puede servirse con transformers, vLLM o TGI si se usa el repositorio original.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas (contexto, licencia) del modelo base, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría. A modo orientativo, se indican modelos de 7B comparables por tamaño, sin datos de rendimiento verificados en esta ficha:

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| heiko-7b (este repositorio) | 7,24 B | No disponible | No disponible | Sí (mradermacher) |
| Mistral-7B | 7,24 B | 8k-32k según versión | Apache 2.0 | Sí |
| Llama 3.1 8B | 8,03 B | 128k | Llama 3.1 Community License | Sí |
| Qwen2.5-7B | 7,62 B | 128k | Apache 2.0 (mayoría de variantes) | Sí |

Los datos de contexto y licencia de los modelos comparativos corresponden a sus versiones oficiales publicadas; no se dispone de benchmarks comparativos con heiko-7b en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo base; al ser un modelo entrenado presumiblemente con datos web en inglés, es probable que herede sesgos de ese corpus, pero no se documenta.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas en la información disponible.
- Limitación de idioma: el repositorio declara únicamente inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin consultar el repositorio original.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia en eriksu/heiko-7b antes de cualquier despliegue en producción.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q8_0 para máxima calidad.
- Las cuantizaciones ponderadas por imatrix no están disponibles según el autor, lo que puede suponer una pérdida de calidad frente a cuantizaciones imatrix de tamaño equivalente.
- El modelo base tiene un número de descargas bajo (34 en el repositorio de cuantizaciones) y carece de tracción comunitaria documentada, lo que reduce la disponibilidad de evaluaciones independientes.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/heiko-7b-GGUF
- Modelo base: https://huggingface.co/eriksu/heiko-7b
- Página de descargas del autor: https://hf.tst.eu/model#heiko-7b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
