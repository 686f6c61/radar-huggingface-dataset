# mradermacher/eidolon-v3-i1-GGUF

## Resumen

Eidolon-v3-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo Eidolon-v3, publicada por el usuario mradermacher. El modelo base, alojado en el repositorio alfitaria-legacy/eidolon-v3, cuenta con aproximadamente 23.570 millones de parámetros (23,57 B) según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de tamaño medio-grande orientados a uso conversacional. La versión aquí descrita emplea cuantización con importancia matricial (imatrix), una técnica que pondera la precisión de cada tensor según su relevancia para la perplejidad, lo que permite obtener archivos más pequeños con menor degradación de calidad que la cuantización uniforme.

El interés de esta ficha radica en que permite ejecutar localmente un modelo de 23 B en hardware de consumo mediante cuantizaciones de 2 a 6 bits, algo imposible con los pesos originales en precisión completa. El repositorio ocupa 33,1 GB e incluye un conjunto amplio de variantes que abarcan desde IQ1_S hasta Q6_K, pasando por Q4_K_M, Q5_K_M y Q4_0, entre otras. La información pública disponible sobre el modelo base es muy limitada: no se especifican licencia, idiomas, pipeline ni detalles de entrenamiento, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

La relevancia actual del modelo es moderada y condicionada: se trata de una conversión comunitaria de un modelo del que no hay documentación técnica publicada en la información disponible, y que registra cero descargas y cero likes en el momento de la consulta. Aun así, su tamaño y la disponibilidad de cuantizaciones imatrix lo convierten en un candidato plausible para experimentación local en tareas conversacionales, siempre que el usuario verifique la licencia y el comportamiento del modelo base antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer presumible por el formato GGUF y el pipeline conversacional, sin confirmar) |
| Parametros totales | 23.572.403.200 (23,57 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small), Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (imatrix/weighted) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura del modelo base Eidolon-v3 en la documentación proporcionada. El recuento de parámetros (23,57 B) y el formato GGUF son compatibles con una arquitectura transformer densa, pero no se confirma en la información disponible. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

La innovación técnica documentada en este repositorio se limita al proceso de cuantización: se trata de cuantizaciones «weighted/imatrix», generadas con una matriz de importancia que asigna mayor precisión a los tensores con mayor impacto en la perplejidad. El autor indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversión desde pesos Hugging Face con la herramienta de cuantización de llama.cpp en su versión 2 del formato. No se documentan innovaciones arquitectónicas como atención lineal, decodificación especulativa o mezcla de expertos.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo multi-turno, aunque no se detallan capacidades específicas.
- Razonamiento y código: no disponibles en la información proporcionada.
- Matemáticas: no disponibles en la información proporcionada.
- Visión: no disponible; el repositorio no incluye proyector multimodal (`skip_mmproj` vacío y sin mención a visión).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructura compatible con la API de Hugging Face Endpoints, aunque no se especifica el runtime.

## Casos de uso

- Experimentación local en conversación: gracias a las cuantizaciones Q4_K_M e IQ4_XS, el modelo puede ejecutarse en una GPU de consumo de 24 GB (RTX 3090/4090) con contexto moderado, lo que permite probar un modelo de 23 B sin infraestructura de datacenter.
- Despliegue en estaciones de trabajo con llama.cpp u Ollama: el formato GGUF y la variedad de cuantizaciones permiten elegir el equilibrio entre calidad y VRAM; por ejemplo, IQ2_M para equipos con 8-10 GB de VRAM efectiva.
- Prototipado de asistentes conversacionales: la orientación conversacional declarada lo hace adecuado para construir demos de chat multi-turno antes de comprometerse con un modelo mayor o con licencia comercial clara.
- Evaluación comparativa de cuantizaciones: el repositorio incluye más de veinte variantes, lo que permite medir la degradación de perplejidad entre IQ1_S y Q6_K sobre el mismo modelo base, un caso de uso metodológico para investigadores.
- Servicio de inferencia en CPU: las variantes Q4_0 y Q4_K_S son viables en servidores sin GPU mediante llama.cpp, con throughput bajo pero suficiente para tareas por lotes no interactivas.
- Fine-tuning posterior sobre cuantizaciones: no recomendado directamente sobre GGUF, pero el modelo base en safetensors (23,57 B) puede servir como punto de partida para ajuste con LoRA en una A100 de 40/80 GB, si la licencia lo permite (no verificada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada según el tamaño de cada cuantización; no confirmada por el autor):
  - IQ1_S / IQ2_XXS: en torno a 6-8 GB.
  - IQ2_M / Q2_K: en torno a 8-10 GB.
  - IQ3_M / Q3_K_M: en torno a 11-13 GB.
  - IQ4_XS / Q4_K_M: en torno a 14-16 GB.
  - Q5_K_M: en torno a 16-18 GB.
  - Q6_K: en torno a 19-21 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40 GB o H100 para Q6_K con contexto largo; GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) para cuantizaciones IQ2/IQ3.
- ¿Cabe en GPU de consumo? Sí, en la mayoría de cuantizaciones: Q4_K_M e inferiores caben en 16-24 GB; las variantes IQ2 caben en 8-10 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; no se confirma soporte de vLLM o TGI para este formato concreto.
- Latencia y throughput: no disponibles; dependerán de la cuantización, el hardware y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base Eidolon-v3 (licencia, contexto, benchmarks) para establecer una comparativa rigurosa. Se indica «no disponible» para los campos que requerirían datos no publicados.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Eidolon-v3 (base) | 23,57 B | no disponible | no disponible | safetensors | Sin documentación técnica publicada en la información disponible |
| Eidolon-v3-i1-GGUF (este) | 23,57 B | no disponible | no disponible | GGUF (imatrix) | 24 variantes de cuantización, 33,1 GB de repo |
| Alternativas de 20-24 B | no disponible | no disponible | no disponible | no disponible | No se identifican comparables fiables sin datos del modelo base |

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; verificar el repositorio del modelo base (alfitaria-legacy/eidolon-v3) antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real y el rendimiento en castellano.
- Contexto no documentado: no se puede planificar el uso en tareas de contexto largo sin verificar la ventana real del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni evaluación publicada, no hay evidencia sobre su tasa de error.
- Sesgos: no documentados; al no conocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, idioma o dominio.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validación comunitaria.
- Cuantizaciones de 1-2 bits (IQ1_S, IQ2_XXS): degradación de calidad significativa esperada; no recomendadas para producción.
- Conversión comunitaria: el autor no es el desarrollador del modelo base; posibles errores de conversión no verificados de forma independiente.
- Sin pipeline declarado: la etiqueta `conversational` no garantiza un formato de prompt específico; será necesario consultar la model card del modelo base para el template correcto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/eidolon-v3-i1-GGUF
- Modelo base: https://huggingface.co/alfitaria-legacy/eidolon-v3
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
