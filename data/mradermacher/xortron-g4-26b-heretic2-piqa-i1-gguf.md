# mradermacher/XORTRON-G4-26B-heretic2-PIQA-i1-GGUF

## Resumen

XORTRON-G4-26B-heretic2-PIQA-i1-GGUF es una cuantizacion en formato GGUF del modelo XORTRON-G4-26B-heretic2-PIQA, publicada por el usuario mradermacher. Se trata de un derivado de la familia XORTRON (variante G4 de 26B), un modelo conversacional con aproximadamente 25.230 millones de parametros, distribuido en una amplia gama de cuantizaciones que van desde IQ1_S hasta Q6_K, generadas con tecnicas de imatrix (importance matrix) para preservar la calidad en regimenes de baja precision.

El modelo base combina dos linajes: por un lado, la familia XORTRON de 26B, y por otro, tecnicas de "abliteration" (el sufijo "heretic2" sugiere un proceso de eliminacion de rechazos o restricciones de alineamiento) y un ajuste adicional denominado PIQA. La model card disponible no documenta la arquitectura interna, los datos de entrenamiento ni los resultados de evaluacion, por lo que buena parte de las especificaciones tecnicas deben tratarse como no disponibles.

La relevancia de esta publicacion es fundamentalmente practica: ofrece el modelo en 26 variantes de cuantizacion distintas, lo que permite desplegarlo desde entornos muy restringidos en memoria (IQ1_S, IQ2_XXS) hasta configuraciones de mayor fidelidad (Q6_K), con un tamano de repositorio de 90,3 GB que agrupa todos los ficheros. Es un artefacto orientado a inferencia local mediante llama.cpp y ecosistemas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer conversacional, sin detalle en la model card) |
| Parametros totales | 25.233.142.046 (25,23 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura del modelo base. El identificador "XORTRON-G4-26B" apunta a un transformer denso de aproximadamente 25,23 mil millones de parametros, pero no se confirma en la model card ni el tipo de atencion, ni la composicion del dataset, ni el numero de tokens de entrenamiento. El sufijo "heretic2" es caracteristico de procesos de abliteration, una tecnica que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones; sin embargo, no hay documentacion oficial que confirme el procedimiento exacto aplicado. El sufijo "PIQA" sugiere un ajuste fino adicional relacionado con razonamiento fisico o sentido comun, aunque tampoco se especifica.

En cuanto al proceso de cuantizacion, la model card indica el uso de cuantizaciones ponderadas con imatrix (importance matrix), generadas con quantize_version 2 y conversion de tipo hf. Esto implica que cada variante GGUF se ha calibrado con una matriz de importancia para minimizar la perdida de calidad en las capas mas sensibles, algo especialmente relevante en las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M). No se documentan innovaciones arquitectonicas propias como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Razonamiento y respuesta a instrucciones, heredado del modelo base (sin detalle de capacidades especificas).
- Cuantizaciones de muy baja precision (IQ1_S, IQ1_M) que permiten ejecucion en hardware con memoria limitada.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integracion en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Inferencia local en equipos de sobremesa: las variantes Q4_K_M o Q4_K_S permiten ejecutar un modelo de 25B en GPUs de consumo con 16-24 GB de VRAM, usando llama.cpp u Ollama, con una calidad aceptable para tareas conversacionales.
- Despliegue en servidores con VRAM limitada: las cuantizaciones IQ2_XXS o IQ2_XS reducen el peso a un rango manejable para GPUs de 8-12 GB, permitiendo servir un modelo de 25B donde no cabria en FP16.
- Experimentacion con modelos "sin censura": al tratarse de un derivado heretic/abliterated, es util para investigacion sobre alineamiento, sesgos y comportamiento de modelos tras eliminar rechazos, siempre con las cautelas eticas correspondientes.
- Prototipado de asistentes conversacionales: la etiqueta "conversational" y la compatibilidad con endpoints permiten integrarlo en un backend de chat para pruebas de concepto.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 26 variantes del mismo modelo, lo que permite medir el impacto de la cuantizacion en calidad, latencia y uso de memoria en un mismo pipeline.
- Fine-tuning ligero o destilacion sobre pesos cuantizados: aunque no es el flujo ideal, las variantes de mayor precision (Q5_K_M, Q6_K) sirven como referencia de comportamiento antes de invertir en el modelo completo en safetensors.
- Educacion y divulgacion: util para demostrar en talleres como un modelo de 25B puede ejecutarse en hardware modesto mediante cuantizacion con imatrix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y peso de 25,23 B parametros):
  - IQ1_S / IQ1_M: en torno a 5-7 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 7-9 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: en torno a 10-13 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / small-IQ4_NL: en torno a 14-16 GB.
  - Q5_K_S / Q5_K_M: en torno a 17-19 GB.
  - Q6_K: en torno a 20-22 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4 y Q5; RTX 3090 (24 GB) para Q4-Q6; A100 40/80 GB o H100 para despliegues de produccion con contexto largo; GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) para cuantizaciones IQ2/IQ3.
- Cabe en GPU de consumo: si, en la mayoria de variantes; las de 24 GB admiten hasta Q6_K; las de 12 GB admiten IQ2/IQ3; las de 8 GB quedan limitadas a IQ1/IQ2 con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere integracion en plataformas de inferencia gestionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XORTRON-G4-26B-heretic2-PIQA-i1-GGUF | 25,23 B | no disponible | no disponible | GGUF (26 variantes) | Derivado heretic/abliterated con cuantizaciones imatrix |
| Modelos de ~24-27B densos de la comunidad (p. ej. variantes Mistral/Mixtral derivadas) | ~24-27 B | no disponible | variable | safetensors/GGUF | Alternativas genericas; no se dispone de datos concretos para comparar rendimiento |
| Modelos de ~13-14B cuantizados en Q4 | ~13-14 B | no disponible | variable | GGUF | Menor calidad potencial pero menor requisito de VRAM |

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta la licencia, lo que impide confirmar si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base (darkc0de/XORTRON-G4-26B-heretic2-PIQA).
- El proceso de abliteration ("heretic2") elimina o reduce los rechazos del modelo, lo que puede aumentar el riesgo de generar contenido inapropiado, ofensivo o inseguro; no es recomendable su despliegue en produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas que cuantifiquen su fiabilidad.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad y la coherencia; no deben usarse en tareas que requieran precision.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido y probablemente inferior al de modelos explicitamente multilingues.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El tamano total del repositorio (90,3 GB) exige espacio en disco considerable si se descargan todas las variantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/XORTRON-G4-26B-heretic2-PIQA-i1-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON-G4-26B-heretic2-PIQA
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
