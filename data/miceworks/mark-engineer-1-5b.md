# miceworks/Mark-Engineer-1.5B

## Resumen

`miceworks/Mark-Engineer-1.5B` es un repositorio de pesos publicados en HuggingFace por el usuario `miceworks` bajo licencia AGPL-3.0. En el momento de redactar esta ficha, la model card del autor no contiene más información que el bloque de metadatos de licencia: no incluye descripción del modelo, arquitectura, datos de entrenamiento, tokenizador, idiomas ni instrucciones de uso. El repositorio no declara pipeline, no tiene descargas ni likes y fue creado y actualizado en el mismo instante (26 de octubre de 2026), lo que apunta a una publicación recién subida y sin documentar.

El único dato técnico inferible es el que sugiere el propio identificador: el sufijo `1.5B` indica, con toda probabilidad, un modelo de aproximadamente 1.500 millones de parámetros, y el término `Engineer` sugiere una orientación hacia tareas de ingeniería o generación de código. Ninguna de estas dos inferencias está confirmada por el autor. Por tanto, esta ficha debe leerse como una evaluación de disponibilidad y de riesgos, no como una ficha técnica verificada.

Su relevancia actual es limitada y de naturaleza exploratoria: se trata de un modelo pequeño, potencialmente ejecutable en hardware de consumo, pero sin evidencia pública de calidad, sin benchmarks y sin documentación. Cualquier evaluación seria exige descargar los pesos, inspeccionar la configuración y el tokenizador, y ejecutar una batería propia de pruebas antes de considerarlo en un proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la declara; sin confirmar que sea un transformer denso) |
| Parámetros totales | No disponible. El identificador del repositorio sugiere ~1,5B, sin confirmación del autor |
| Parámetros activos | No disponible (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican pesos cuantizados ni se documenta soporte) |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible (no se especifica safetensors, GGUF ni otros) |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-10-26 (ambas idénticas) |
| Región declarada | US |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura. La model card únicamente contiene el frontmatter con `license: agpl-3.0`, sin secciones de descripción, arquitectura, tokenizador ni hiperparámetros. No hay datos sobre tipo de atención, uso de MoE, capas lineales, decodificación especulativa ni ninguna otra innovación técnica.

Tampoco hay información sobre el corpus de entrenamiento: se desconoce el número de tokens, la composición del dataset, si hubo fases de instrucción, RLHF, DPO u otro ajuste por preferencias, y si existe algún proceso de alineación. No se dispone de model card ampliada, informe técnico ni publicación asociada. Cualquier afirmación sobre el entrenamiento sería especulativa.

## Capacidades

- No hay capacidades documentadas por el autor. La model card no describe tareas soportadas.
- Generación de texto: no confirmada, aunque es la función esperable en un modelo de lenguaje de ~1,5B parámetros.
- Generación de código y tareas de ingeniería: no confirmadas; el término `Engineer` del nombre es la única indicación, y no constituye evidencia.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades multimodales (visión, audio): no disponible; el repositorio no declara pipeline ni modalidad.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

Los siguientes escenarios son hipótesis de trabajo condicionadas a que la inspección de los pesos confirme que se trata de un modelo de lenguaje de ~1,5B con capacidad de generación de código. No deben adoptarse en producción sin una evaluación previa.

- Evaluación comparativa de modelos pequeños en local: descargar los pesos, medir perplejidad y calidad de generación frente a referencias de 1,5B-2B con licencia permisiva, para decidir si merece la pena integrarlo en un banco de pruebas interno.
- Autocompletado de código en entornos con recursos limitados: si el modelo resulta ser un generador de código, podría ejecutarse en una GPU de consumo para sugerencias de línea o de función dentro de un IDE, con latencia baja gracias al tamaño reducido.
- Filtrado y clasificación de texto en pipelines de datos: un modelo de 1,5B es adecuado para tareas de etiquetado, deduplicación semántica o moderación por lotes, donde el coste por token importa más que la calidad punta.
- Prototipado de asistentes técnicos sobre documentación interna: usar el modelo como base para RAG sobre manuales de ingeniería, siempre que se valide su contexto máximo real y su comportamiento en castellano.
- Generación de documentación técnica y docstrings: extracción de firmas de funciones y generación de comentarios, con revisión humana obligatoria por el riesgo de alucinación en un modelo sin evaluar.
- Base para fine-tuning específico de dominio: al ser un modelo pequeño y con licencia AGPL, puede servir como punto de partida para ajuste supervisado en un dominio concreto, asumiendo las obligaciones de copyleft del resultado.
- Experimentación académica sobre alineación y sesgos en modelos pequeños: su tamaño permite réplicas completas de entrenamiento y evaluación en un solo nodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra, y no se han encontrado referencias externas al modelo en la búsqueda web realizada.

| Benchmark | Mark-Engineer-1.5B | Referencia externa |
|---|---|---|
| MMLU | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |
| MT-Bench | No disponible | No disponible |
| Perplejidad / Evaluación propia | No disponible | No disponible |

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en la hipótesis de un modelo denso de ~1,5B parámetros, no en datos publicados por el autor. Deben verificarse tras inspeccionar la configuración real del modelo.

- VRAM estimada en FP16: en torno a 3 GB solo para pesos, más caché KV; en la práctica, 4-6 GB según longitud de contexto y tamaño de lote.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6-2 GB de pesos.
- VRAM estimada en cuantización de 4 bits (si se generan pesos GGUF): aproximadamente 1-1,5 GB de pesos, viable en GPUs de 4 GB.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y RTX 4090; también en GPUs de 6-8 GB con cuantización.
- GPU de centro de datos: A100, H100 y L40S permiten servir muchas réplicas concurrentes o lotes grandes, aunque para este tamaño suelen ser sobredimensionadas salvo en escenarios de alto throughput.
- CPU: ejecución viable en llama.cpp u Ollama con cuantización Q4, con latencia de decenas de milisegundos por token según núcleos y ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama y, en menor medida, vLLM o TGI, condicionadas a que los pesos estén en un formato compatible (safetensors con config de HuggingFace o GGUF). No se ha confirmado ninguno de estos formatos.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparación se establece con modelos abiertos de tamaño comparable ampliamente documentados. Los datos de las alternativas provienen de sus respectivas model cards públicas y deben verificarse en la fuente original; no se incluyen puntuaciones porque no hay resultados publicados del modelo evaluado.

| Modelo | Parámetros | Contexto | Licencia | Documentación | Disponibilidad |
|---|---|---|---|---|---|
| Mark-Engineer-1.5B | ~1,5B (inferido, sin confirmar) | No disponible | AGPL-3.0 | Prácticamente inexistente | Repositorio HF sin descargas |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens | Apache-2.0 | Model card completa e informe técnico | Amplia, con variantes GGUF de la comunidad |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32.768 tokens (heredado de Qwen2.5) | MIT | Model card completa e informe del destilado | Amplia, con cuantizaciones comunitarias |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache-2.0 | Model card e informe técnico | Amplia, integrado en llama.cpp y transformers |
| Gemma 2 2B | 2,6B | 8.192 tokens | Términos de uso de Gemma | Model card completa | Amplia, con restricciones de uso |

Diferencias clave frente a las alternativas: el modelo evaluado es el único con licencia AGPL-3.0, la más restrictiva del grupo para uso en servicios de red, y el único sin documentación ni métricas publicadas. Las alternativas ofrecen contexto declarado, idiomas documentados y ecosistema de cuantizaciones ya disponible.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay información sobre arquitectura, tokenizador, contexto, idiomas ni datos de entrenamiento. No es posible evaluar su idoneidad sin inspeccionar los ficheros del repositorio.
- Sin evidencia de calidad: cero descargas y cero likes implican que el modelo no ha sido validado por la comunidad; no existen evaluaciones independientes.
- Riesgo de alucinación desconocido: al no haber datos de alineación ni evaluaciones, no se puede acotar la tasa de errores factuales. En un modelo de ~1,5B sin ajuste por instrucciones, este riesgo suele ser alto.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso del modelo para ofrecer un servicio accesible por red (por ejemplo, una API o un chatbot público) activa la obligación de ofrecer el código fuente correspondiente a los usuarios del servicio, según el artículo 13 de la AGPL. Esto puede ser incompatible con productos propietarios o SaaS cerrados. Requiere revisión legal antes de cualquier despliegue comercial.
- Procedencia y trazabilidad del modelo no verificadas: no consta informe técnico, paper ni repositorio de código. No se puede confirmar si los pesos derivan de otro modelo, si respetan licencias de terceros o si el corpus de entrenamiento tenía derechos compatibles.
- Fechas de creación y actualización idénticas y sin historial de versiones: no hay garantía de mantenimiento ni de corrección de errores.
- Idiomas no declarados: no se puede asumir un rendimiento aceptable en castellano; habría que medirlo.
- Contexto desconocido: planificar pipelines que dependan de ventanas largas es arriesgado sin confirmar el límite real del tokenizador y de las posiciones entrenadas.
- Reproducibilidad: sin fijar revisión (commit) del repositorio, los pesos podrían cambiar sin aviso, ya que solo existe una revisión inicial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/miceworks/Mark-Engineer-1.5B
- Perfil del autor: https://huggingface.co/miceworks
- Resultados de la búsqueda web: no se ha encontrado ningún enlace, paper, blog, repositorio de código ni demo que haga referencia a `miceworks/Mark-Engineer-1.5B`. Los resultados devueltos (leaderboards genéricos, VibeVoice-1.5B de Microsoft, comparativas de agentes de desarrollo y un artículo sobre modelos de 1,5B de DeepSeek) no guardan relación con este modelo y se han descartado como fuentes.
