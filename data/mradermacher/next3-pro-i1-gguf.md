# mradermacher/next3-pro-i1-GGUF

## Resumen

next3-pro-i1-GGUF es una redistribución en formato GGUF del modelo next3-pro, publicada por el usuario mradermacher. El repositorio contiene un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K) generadas con el método de cuantización ponderada mediante matriz de importancia (imatrix), lo que permite ejecutar el modelo en hardware de consumo con pérdidas de calidad controladas según el nivel de compresión elegido. El modelo base tiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), lo que lo sitúa en la franja de modelos densos de tamaño medio-grande.

La relevancia de esta ficha radica en que el repositorio es un artefacto de cuantización, no un modelo original: el autor de la cuantización no documenta arquitectura, datos de entrenamiento, licencia ni idiomas, y la model card se limita a metadatos técnicos del proceso de conversión. El modelo subyacente (thelamapi/next3-pro) tampoco aporta información sustancial en la documentación disponible. Cualquier evaluación rigurosa del modelo debe hacerse con cautela, ya que faltan datos verificables sobre su origen, licencia y rendimiento.

El repositorio fue creado el 27 de noviembre de 2026 y actualizado el mismo día, con un tamaño total de 81,2 GB, coherente con la suma de múltiples archivos de cuantización de un modelo de ~27B de parámetros. No consta pipeline declarado, ni descargas, ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base presumiblemente safetensors |
| Metodo de cuantizacion | ponderada con imatrix (importancia de pesos) |
| Tamano del repositorio | 81,2 GB |
| Tag de compatibilidad | endpoints_compatible |
| Tag de caso de uso | conversational |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base next3-pro: la model card del repositorio GGUF no describe si se trata de un transformer denso, un modelo MoE, híbrido o SSM, ni detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. El único dato estructural verificable es el recuento de parámetros (26.895.998.464), que corresponde a un modelo denso de aproximadamente 27 mil millones de parámetros.

La innovación técnica documentada en este repositorio es exclusivamente el proceso de cuantización: el autor indica el uso de cuantización ponderada mediante imatrix (matriz de importancia), una técnica que estima la sensibilidad de cada tensor a la cuantización y asigna más bits a los pesos críticos, mejorando la calidad frente a la cuantización uniforme a igual tamaño de archivo. Los metadatos internos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma una conversión desde un checkpoint en formato Hugging Face. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional: el tag `conversational` sugiere un ajuste orientado a diálogo, aunque no se detalla el formato de plantilla de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el GGUF puede servirse mediante infraestructura compatible con endpoints de Hugging Face.
- Cuantizaciones de rango amplio: permite desplegar el modelo desde ~7-8 GB (IQ1/IQ2) hasta ~22 GB (Q6_K), adaptándose a distintos presupuestos de memoria.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en GPU de consumo para chat local: con cuantizaciones Q4_K_M o IQ4_XS, un modelo de ~27B puede ejecutarse en GPUs con 16-24 GB de VRAM (RTX 4080, RTX 4090), permitiendo asistentes conversacionales locales sin depender de la nube.
- Servicio de inferencia en CPU o híbrido CPU/GPU: las cuantizaciones IQ2/IQ3 reducen el modelo a rangos de 7-12 GB, viables en equipos con RAM abundante mediante llama.cpp, útil para prototipos y entornos sin GPU dedicada.
- Evaluación comparativa de calidad por cuantización: el repositorio incluye más de veinte variantes, lo que permite medir empíricamente la degradación de calidad entre IQ1_S y Q6_K en tareas concretas antes de fijar una versión para producción.
- Integración en pipelines compatibles con endpoints: el tag `endpoints_compatible` facilita servir el modelo a través de infraestructura estándar de Hugging Face para pruebas A/B de distintas cuantizaciones.
- Fine-tuning o destilación posterior sobre el modelo base: al estar disponible el enlace al modelo original (thelamapi/next3-pro), es posible partir de los pesos sin cuantizar para tareas de ajuste, usando el GGUF solo para inferencia.
- Investigación sobre cuantización con imatrix: el repositorio sirve como caso de estudio reproducible para analizar el impacto de la matriz de importancia en modelos de ~27B, comparando perplejidad y calidad generativa entre variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización y modelo de ~26,9B parámetros):
  - IQ1_S / IQ1_M: aproximadamente 6-8 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K: aproximadamente 8-11 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 11-14 GB.
  - IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: aproximadamente 14-17 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 17-20 GB.
  - Q6_K: aproximadamente 20-23 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 4080 / 4070 Ti Super (16 GB) para IQ3/IQ4; A100 40 GB o H100 para Q6_K con contexto largo y mayor paralelismo.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones IQ1 a Q4 caben en GPUs de 8-16 GB; Q5 y Q6 requieren 20-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con endpoints de Hugging Face. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto, y no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| next3-pro-i1-GGUF (este) | ~26,9B | no disponible | no disponible | GGUF (multi-cuant) | Cuantización imatrix de next3-pro; sin benchmarks ni documentación de origen |
| next3-pro (base) | ~26,9B | no disponible | no disponible | safetensors (presumible) | Modelo original de thelamapi; sin model card sustancial |
| Alternativas de ~27B densos (p. ej. Gemma 2 27B, Qwen2.5 32B) | 27-32B | 8K-128K según modelo | licencias abiertas conocidas | safetensors, GGUF | Disponibles con benchmarks publicados; comparación directa no posible por falta de datos del modelo evaluado |

No es posible establecer una comparación cuantitativa fiable con alternativas porque no se han publicado benchmarks ni especificaciones de contexto del modelo base en la información disponible.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan arquitectura, datos de entrenamiento, idiomas, sesgos ni evaluación, lo que impide auditar el modelo.
- Licencia no disponible: no puede confirmarse el uso comercial; en ausencia de licencia explícita, debe asumirse riesgo legal y contactar con el autor del modelo base antes de cualquier despliegue en producción.
- Riesgo de alucinación: no cuantificado; sin benchmarks de veracidad ni documentación de alineación, el riesgo es desconocido y potencialmente alto.
- Sesgos: no documentados; al desconocerse la composición del dataset, no pueden evaluarse sesgos de género, idioma o dominio.
- Idiomas: no declarados; no hay garantía de rendimiento fuera del idioma o idiomas de entrenamiento, presumiblemente inglés.
- Degradación por cuantización: las variantes IQ1 e IQ2, aunque usen imatrix, implican pérdidas notables de calidad en modelos de este tamaño; para producción se recomienda Q4_K_M o superior.
- Contexto desconocido: sin dato de longitud de contexto, no debe asumirse una ventana larga; conviene validar empíricamente el comportamiento en prompts extensos.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Trazabilidad limitada: el repositorio es una cuantización de terceros; los problemas de calidad deben atribuirse con cautela al modelo base o al proceso de conversión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/next3-pro-i1-GGUF
- Modelo base: https://huggingface.co/thelamapi/next3-pro
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
