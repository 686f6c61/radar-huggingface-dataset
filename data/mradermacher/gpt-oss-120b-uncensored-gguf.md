# mradermacher/gpt-oss-120b-Uncensored-GGUF

## Resumen

Este repositorio contiene una versión cuantizada en formato GGUF del modelo comunitario `ccharnkij/gpt-oss-120b-Uncensored`, un ajuste fino sin alineación de seguridad del modelo abierto `gpt-oss-120b` de OpenAI. El autor de la cuantización es mradermacher, un perfil conocido por publicar conversiones GGUF estáticas y de tipo imatrix de modelos populares para su uso con llama.cpp y derivados. El modelo base pertenece a la familia gpt-oss de OpenAI, orientada a razonamiento, tareas agénticas y casos de uso generales de desarrollador.

Se trata de un modelo de arquitectura transformer con mezcla de expertos (MoE), con alrededor de 116.830 millones de parámetros totales según los datos de safetensors del repositorio, lo que lo sitúa en la categoría de los 120B. Su relevancia actual radica en que permite ejecutar localmente un modelo de gran tamaño en hardware de gama alta mediante cuantización, y en que la variante "Uncensored" elimina total o parcialmente las capas de rechazo y alineación del modelo original, algo que interesa a quienes investigan comportamiento de modelos o necesitan generación sin filtros predefinidos.

El repositorio no incluye model card descriptiva, licencia declarada, idiomas soportados ni resultados de evaluación. Toda la información técnica disponible procede de los metadatos de cuantización y del modelo base de OpenAI, no de documentación propia del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada del modelo base gpt-oss-120b de OpenAI (no confirmada explícitamente en la ficha del repositorio) |
| Parámetros totales | 116.829.156.672 (≈116,8 B), dato real de safetensors |
| Parámetros activos | No disponible en la información del repositorio; el modelo base gpt-oss-120b declara del orden de 5.100 millones de parámetros activos por token (dato del original, no verificado para este derivado) |
| Longitud de contexto | No disponible en la ficha; el modelo base gpt-oss-120b soporta 128.000 tokens |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; el modelo base gpt-oss-120b se publica bajo Apache 2.0, pero la licencia de este ajuste fino "Uncensored" no se declara |
| Formato de pesos | GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Tamaño del repositorio | 147,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El repositorio es una conversión de pesos, no un entrenamiento nuevo: el autor aplica cuantización estática sobre los pesos del modelo `ccharnkij/gpt-oss-120b-Uncensored`, que a su vez deriva del `gpt-oss-120b` de OpenAI. La arquitectura subyacente es la del modelo base, un transformer con mezcla de expertos y formato de respuesta "harmony" (el formato de plantilla de chat que OpenAI introdujo para la familia gpt-oss y que requiere aplicar la plantilla correspondiente o el paquete `openai-harmony` si se usa `model.generate` directamente en Transformers).

No hay información en el repositorio sobre el proceso de ajuste que dio lugar a la variante "Uncensored": se desconoce el volumen de tokens, la composición del dataset, si se emplearon técnicas de RLHF, DPO u otras, y qué mecanismos de seguridad se eliminaron. La etiqueta "Uncensored" es una autodescripción del autor del ajuste, no una especificación técnica verificada. Tampoco se documentan innovaciones propias de esta conversión más allá del pipeline estándar de cuantización de mradermacher (versión 2, con cuantización de tensores de salida).

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y pensado para uso de chat.
- Razonamiento y tareas agénticas: capacidades heredadas del modelo base gpt-oss-120b, que OpenAI describe como orientado a razonamiento y flujos de agente.
- Generación de código: presumiblemente heredada del modelo base (no verificada en este derivado).
- Formato de respuesta "harmony": el modelo base aplica automáticamente este formato si se usa la plantilla de chat de Transformers.
- Eliminación de rechazos de seguridad: la variante "Uncensored" está diseñada explícitamente para no aplicar las capas de negativa del modelo alineado.
- Soporte de tool calling: no confirmado en la información disponible para este derivado; el modelo base de OpenAI sí lo contempla.
- Capacidades multimodales, de audio o de visión: no disponibles.

## Casos de uso

- Investigación sobre alineación y comportamiento de modelos: la variante sin censura permite estudiar cómo cambia la distribución de respuestas al eliminar las capas de rechazo, comparándola con el gpt-oss-120b original en las mismas peticiones.
- Red teaming y evaluación de seguridad: útil para generar contenido que un modelo alineado rechazaría y analizar después sus patrones, siempre en un entorno controlado y con las salvaguardas organizativas correspondientes.
- Despliegue local con llama.cpp: gracias a las cuantizaciones Q4_K_M o IQ4_XS, un equipo con varias GPU o con offload a CPU puede ejecutar un modelo de 116,8 B sin depender de APIs externas.
- Generación de ficción y narrativa sin filtros: para autores que necesitan diálogos o tramas que los modelos alineados suelen rechazar por política de contenido.
- Conversación multi-turno de contexto largo: si se confirma la ventana de 128.000 tokens del modelo base, resulta adecuado para asistentes que deben mantener documentos extensos en el contexto.
- Experimentación con pipelines de agentes: al ser un modelo MoE grande, sirve como banco de pruebas para comparar coste de inferencia frente a modelos densos equivalentes.
- Laboratorios de cuantización: el rango de doce cuantizaciones distintas (desde Q2_K hasta f16) permite medir experimentalmente la degradación de calidad en función de los bits por peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones, y OpenAI publica métricas para el modelo base gpt-oss-120b en su model card, pero esas cifras no son trasladables al ajuste fino "Uncensored" ni a sus cuantizaciones.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del recuento de parámetros (116,83 B) y de los bits por peso típicos de cada tipo de cuantización; no proceden de mediciones publicadas por el autor.

- f16 (x-f16): en torno a 234 GB de pesos. Requiere múltiples GPU de 80 GB (por ejemplo, 3-4 H100 o A100) o nodos con memoria unificada.
- Q8_0: aproximadamente 124 GB. Fuera del alcance de una sola GPU de 80 GB.
- Q6_K: alrededor de 96 GB. Necesita dos GPU de 80 GB o una H200 con memoria ampliada.
- Q5_K_M / Q5_K_S: del orden de 80-85 GB.
- Q4_K_M / Q4_K_S / IQ4_XS: en torno a 65-71 GB. Es la franja más práctica: cabe en una H100 80 GB, aunque con poco margen para caché KV si se usa contexto largo.
- Q3_K_L / Q3_K_M / Q3_K_S: entre 53 y 63 GB. Cabe en una A100/H100 de 80 GB con margen razonable.
- Q2_K: alrededor de 43 GB. Es la única que se aproxima al rango de una GPU de 48 GB (A6000, L40S), pero con degradación de calidad notable.
- GPU de consumo (24 GB o menos): ninguna cuantización cabe íntegramente. Solo es viable con offload parcial de capas o de expertos a memoria del sistema, lo que reduce drásticamente el throughput. El modelo base en su formato original MXFP4 ocupa del orden de 63 GB y OpenAI lo presenta como apto para una sola H100.
- Opciones de despliegue: llama.cpp y sus interfaces (Ollama, LM Studio, koboldcpp) son la vía natural para GGUF; se requiere una versión reciente que soporte el formato harmony y la arquitectura MoE de gpt-oss. vLLM ofrece soporte GGUF experimental. Para servidores de producción conviene considerar los pesos safetensors originales con vLLM o TGI antes que las cuantizaciones de comunidad.
- Latencia y throughput: no disponibles. Como referencia conceptual, en un MoE solo se activan los expertos seleccionados por token, de modo que la velocidad depende más del ancho de banda de memoria y del número de parámetros activos que del total; el offload de expertos a CPU penaliza fuertemente el rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/gpt-oss-120b-Uncensored-GGUF (este) | 116,8 B (MoE) | No disponible en la ficha (base: 128k) | 12 tipos, de Q2_K a f16 | No declarada | GGUF, 0 descargas |
| ccharnkij/gpt-oss-120b-Uncensored | 116,8 B (MoE) | No disponible | Pesos originales | No declarada | Origen de este repositorio |
| gpt-oss-120b (OpenAI) | 116,8 B (MoE) | 128k | MXFP4 nativo, safetensors | Apache 2.0 | Modelo oficial, ampliamente distribuido |
| gpt-oss-20b (OpenAI) | Del orden de 20 B (MoE) | 128k | MXFP4 nativo | Apache 2.0 | Modelo oficial, ejecutable en una GPU de 16 GB |

No hay datos de rendimiento comparado disponibles para este derivado concreto, por lo que la comparación se limita a parámetros, contexto, licencia y formato de distribución.

## Limitaciones y advertencias

- Ausencia total de documentación: sin model card, sin licencia, sin idiomas declarados y sin benchmarks, lo que impide evaluar su idoneidad para producción.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, por lo que no existen informes de terceros sobre su calidad real.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la eliminación de capas de alineación no reduce la tasa de invención de hechos y puede aumentarla en dominios donde el modelo alineado tendía a responder con cautela.
- Contenido dañino o ilegal: al tratarse de una variante "Uncensored", el modelo puede generar contenido violento, sexual, discriminatorio o desinformativo que el original rechazaría. Su uso en productos de cara al público exige moderación externa obligatoria.
- Sesgos: no evaluados. Los sesgos del modelo base se mantienen y no se ha documentado ningún proceso de mitigación en el ajuste fino.
- Incertidumbre de licencia: aunque el modelo base es Apache 2.0, el repositorio no declara licencia. El ajuste fino y la redistribución cuantizada podrían estar sujetos a condiciones no indicadas, lo que supone un riesgo legal para uso comercial.
- Falta de verificación de las cuantizaciones: las conversiones de comunidad pueden introducir degradación. Las cuantizaciones Q2_K y Q3_K_S, en particular, sacrifican calidad de forma apreciable en modelos de este tamaño.
- Dependencia de versiones recientes del runtime: el formato harmony y la arquitectura gpt-oss requieren versiones actualizadas de llama.cpp o Transformers; versiones antiguas pueden fallar o producir salidas incorrectas.
- Cobertura idiomática desconocida: no se declaran idiomas soportados, por lo que el rendimiento en castellano no está garantizado.
- Riesgo de reproducibilidad: al no publicarse la receta de entrenamiento del ajuste "Uncensored", no es posible auditar ni reproducir el comportamiento del modelo.

## Enlaces

- Repositorio principal: https://huggingface.co/mradermacher/gpt-oss-120b-Uncensored-GGUF
- Modelo de origen del ajuste fino: https://huggingface.co/ccharnkij/gpt-oss-120b-Uncensored
- Variante imatrix del mismo modelo: https://huggingface.co/mradermacher/gpt-oss-120b-Uncensored-xCloud-i1-GGUF
- Variante imatrix a partir de pesos bf16: https://huggingface.co/mradermacher/gpt-oss-120b-uncensored-bf16-i1-GGUF
- Repositorio oficial de la familia gpt-oss: https://github.com/openai/gpt-oss
- Repositorio de referencia de gpt-oss-120b: https://github.com/gpt-oss/gpt-oss-120b
- Ficha del modelo gpt-oss-120b en la documentación de OpenAI: https://developers.openai.com/api/docs/models/gpt-oss-120b
