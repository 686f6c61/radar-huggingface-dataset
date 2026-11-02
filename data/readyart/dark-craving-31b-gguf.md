# ReadyArt/Dark-Craving-31B-GGUF

## Resumen

Dark-Craving-31B-GGUF es la versión cuantizada en formato GGUF del modelo Dark-Craving-31B, publicado por el usuario ReadyArt en HuggingFace. Se trata de un modelo de generación de texto de aproximadamente 30.700 millones de parámetros (30,697,345,596 según los pesos en safetensors del modelo base), orientado específicamente a contenido conversacional para adultos, roleplay explícito y narrativa para adultos. El repositorio contiene únicamente los pesos cuantizados, no el modelo original.

El modelo se distribuye bajo licencia Apache 2.0 y declara soporte exclusivo para inglés. Su etiquetado incluye categorías como "nsfw", "explicit", "ERP", "unaligned" y "not-for-all-audiences", lo que lo posiciona como un modelo de nicho para aplicaciones de ficción interactiva y conversación adulta, no para uso generalista ni para tareas de razonamiento técnico o código.

La relevancia de esta ficha es principalmente documental: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada más allá de la model card estilizada. El repositorio ocupa 81,2 GB, lo que sugiere múltiples niveles de cuantización empaquetados en un mismo repo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card) |
| Parámetros totales | 30.697.345.596 (≈30,7 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo es GGUF; niveles concretos no especificados) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Dark-Craving-31B. La model card del repositorio GGUF no incluye detalles sobre tipo de transformer, número de capas, dimensión oculta, mecanismo de atención ni uso de técnicas como MoE, atención lineal o decodificación especulativa. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre volumen de tokens, composición del dataset, fases de ajuste supervisado, RLHF o DPO.

Lo único verificable es que se trata de una cuantización del modelo ReadyArt/Dark-Craving-31B, con relación `base_model_relation: quantized`. El tamaño del repositorio (81,2 GB) es coherente con un modelo denso de ~30,7 B parámetros empaquetado en varios niveles de cuantización GGUF (por ejemplo, Q2 a Q8), aunque los niveles exactos no se detallan en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y ficción interactiva.
- Contenido explícito para adultos (ERP, narrativa madura), según el etiquetado del autor.
- Modo instruct/conversacional, según los tags del repositorio.
- Soporte de inglés exclusivamente; no se declaran capacidades multilingües.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad de visión, audio ni modo de razonamiento extendido (thinking mode).
- No se documentan capacidades de código o matemáticas; el etiquetado "unaligned" sugiere ausencia de alineamiento restrictivo, no una mejora en tareas técnicas.

## Casos de uso

- Ficción interactiva para adultos: el modelo está etiquetado explícitamente para roleplay y ERP, por lo que su uso previsto es la generación de narrativa conversacional madura en entornos controlados y con audiencia adulta verificada.
- Prototipado de personajes conversacionales: permite construir agentes de chat con personalidad para demos internas, siempre que el despliegue incluya filtros de edad y avisos claros al usuario.
- Investigación sobre alineamiento y contenido: al estar etiquetado como "unaligned", puede servir para estudiar comportamientos de modelos sin restricciones en entornos de evaluación controlados.
- Evaluación de cuantizaciones GGUF: al ser un repo de cuantización, es útil para comparar calidad de generación entre niveles de cuantización sobre un mismo modelo base de ~30,7 B.
- Despliegue local en estaciones de trabajo: el formato GGUF permite ejecución con llama.cpp u Ollama en hardware de consumo de gama alta, útil para pruebas offline sin dependencia de API.
- Generación creativa de narrativa madura: escritura asistida de relatos para adultos con control de tono y estilo mediante prompting, en contextos editoriales especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo denso de ~30,7 B parámetros, se requiere aproximadamente 18-20 GB en cuantización Q4, 24-28 GB en Q5/Q6 y 32-36 GB en Q8 (estimación basada en el tamaño de parámetros; no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para cuantizaciones altas; RTX 4090 (24 GB) puede alojar cuantizaciones Q4 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y ventanas de contexto moderadas; en GPUs de 16 GB probablemente solo con cuantizaciones Q2/Q3 y degradación notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; los tags indican `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dark-Craving-31B-GGUF | ≈30,7 B | no disponible | Apache 2.0 | GGUF | Enfoque NSFW/roleplay, solo inglés |
| Modelos densos de ~30 B de uso general | ≈30 B | variable | variable | safetensors/GGUF | No disponible comparación directa por falta de benchmarks del modelo evaluado |
| Alternativas de roleplay de ~30 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está etiquetado como `not-for-all-audiences`; no debe desplegarse sin control de edad ni avisos claros.
- Sesgos desconocidos: no se documenta ningún proceso de evaluación de sesgos ni de alineamiento; el tag "unaligned" implica ausencia de salvaguardas.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks, no hay evidencia sobre su fiabilidad factual.
- Idioma: solo inglés; no apto para producción en castellano sin evaluación adicional.
- Contexto: longitud no documentada; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el contenido generado puede estar sujeto a regulación sobre material para adultos según la jurisdicción.
- Madurez del repo: cero descargas y cero likes en el momento de la consulta; sin validación comunitaria.
- Sin información de entrenamiento: imposible auditar procedencia de datos ni posibles problemas de copyright en el dataset.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ReadyArt/Dark-Craving-31B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-31B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
