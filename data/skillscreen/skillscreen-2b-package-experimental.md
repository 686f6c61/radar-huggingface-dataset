# SkillScreen/SkillScreen-2B-Package-Experimental

## Resumen

SkillScreen-2B-Package-Experimental es un modelo de clasificación de texto de 2.213 millones de parámetros (aproximadamente 2,2 mil millones) desarrollado por SkillScreen, un equipo de investigación encabezado por Jerrold Huang. Su función es decidir si un paquete de "skill" para agentes, compuesto por un fichero `SKILL.md` y sus ficheros auxiliares (scripts, configuración), contiene contenido malicioso. El modelo se plantea como un clasificador binario basado en inferencia de lenguaje natural (NLI): la etiqueta "malicioso" se deriva de la probabilidad de entailment del softmax.

El modelo parte del checkpoint OpenJev 2B (a su vez derivado de la familia Qwen) y se ha afinado con LoRA sobre el cohorte SRC010 de paquetes recuperados, con un presupuesto de entrada de 32.768 tokens. Se distribuye con los pesos completos fusionados en la raíz del repositorio y el adaptador LoRA original junto con la cabeza de clasificación en el subdirectorio `adapter/`. La versión `v1.1` solo actualiza la información de licencia y citación; los pesos, tokenizador y código de scoring no cambian respecto a `v1`.

Es relevante ahora porque aborda un problema específico y creciente en el despliegue de agentes: la verificación automática de skills de terceros antes de su ejecución. Frente a clasificadores genéricos, el modelo incorpora el contexto completo del paquete (no solo el Markdown) y ofrece un umbral de decisión calibrado para alta recall. No obstante, sus resultados en conjuntos externos son notablemente inferiores a los obtenidos en su propio dominio de entrenamiento, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen, base OpenJev 2B) con cabeza de clasificación NLI |
| Parametros totales | 2.213.247.808 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (presupuesto de entrada de entrenamiento y evaluación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos, código y configuración); CC BY 4.0 (model card, documentación y metadatos de citación) |
| Formato de pesos | safetensors (pesos completos en la raíz; adaptador LoRA y cabeza en `adapter/`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 2,2 mil millones de parámetros, inicializado desde OpenJev 2B, un checkpoint de la familia Qwen. Sobre esa base se aplica un ajuste fino con LoRA orientado a una tarea de NLI: la salida se interpreta como una puntuación nativa de maliciosidad obtenida del softmax de entailment, y se marca como sospechoso cualquier valor mayor o igual a 0,5. La entrada no se limita al texto de `SKILL.md`: el modelo procesa un paquete compuesto por el Markdown principal más ficheros auxiliares (`files[].path` y `files[].text`), con un presupuesto conjunto de 32.768 tokens.

El entrenamiento se realizó sobre el cohorte de paquetes recuperados SRC010, derivado de la partición de test SBR de MaliciousSkillBench. El checkpoint de referencia citado en la model card es `package-sbr-s42-r001` (semilla 42, actualización 180). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas adicionales como RLHF o DPO. El repositorio incluye `provenance.json` con los detalles del checkpoint y `merge_verification.json` con las comprobaciones de la exportación de pesos fusionados, lo que aporta trazabilidad sobre el proceso de fusión del adaptador.

## Capacidades

- Clasificación binaria de paquetes de skills de agentes como maliciosos o benignos, mediante una puntuación nativa de maliciosidad derivada del softmax de entailment.
- Análisis de contexto de paquete: procesa conjuntamente el contenido de `SKILL.md` y ficheros auxiliares (scripts Python, configuración, etc.) dentro de un único presupuesto de 32.768 tokens.
- Decisión con umbral configurable: el umbral por defecto es 0,5, y la model card documenta un umbral alternativo (0,99748853624125544) calibrado para un objetivo de recall del 99 % en validación.
- Detección orientada a alta recall: en el conjunto de test de su dominio alcanza un 99,80 % de recall con un 0,66 % de falsos positivos usando el umbral por defecto.
- Integración como pipeline de `text-classification` en la librería `transformers`, con requisito de CUDA y soporte de BF16.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes multi-paso ni modo de pensamiento; el modelo está especializado exclusivamente en la tarea de clasificación descrita.

## Casos de uso

- Puerta de seguridad en la instalación de skills de terceros: antes de que un agente cargue un paquete descargado de un registro o repositorio, el modelo puntúa el `SKILL.md` y sus scripts auxiliares; si la puntuación supera 0,5, el paquete se bloquea o se envía a revisión manual. Es adecuado porque analiza el paquete completo y no solo la documentación.
- Revisión automatizada en CI/CD de repositorios de skills: integrado como paso previo al merge, el modelo puede marcar pull requests que introduzcan contenido sospechoso en ficheros de skill, con el umbral calibrado para alta recall (0,9974) cuando se prefiera minimizar falsos negativos aunque aumenten los falsos positivos.
- Moderación de mercados y registros de skills: un marketplace puede ejecutar el clasificador sobre cada paquete publicado para priorizar la cola de revisión humana, usando el umbral por defecto para mantener una tasa de falsos positivos baja (0,66 % en el dominio de entrenamiento).
- Auditoría retrospectiva de paquetes ya desplegados: dado un corpus histórico de skills instalados, el modelo permite puntuar cada paquete y aislar los que superan el umbral para una investigación de seguridad posterior.
- Filtrado previo en pipelines de evaluación de agentes: antes de ejecutar un benchmark de agentes con skills de terceros, el clasificador descarta los paquetes sospechosos para evitar que el contenido malicioso contamine los resultados o comprometa el entorno de ejecución.
- Investigación en seguridad de agentes: el modelo y su código de scoring sirven como línea base reproducible para estudiar detección de skills maliciosas, comparar umbrales y analizar la transferencia entre dominios (los resultados en SkillsBench-1650 son un punto de partida para estudiar el sobreajuste al dominio SRC010).

## Benchmarks y rendimiento

Resultados de la model card para el checkpoint LoRA de origen `package-sbr-s42-r001` (semilla 42, actualización 180). La puntuación nativa es el softmax de entailment; se marca como sospechoso si es mayor o igual al umbral. Ambos umbrales se fijaron antes de la evaluación en test y en el conjunto externo.

| Conjunto de test | Regla de umbral | Umbral nativo | Recall (%) | FPR (%) |
|---|---|---:|---:|---:|
| SRC010 recovered-package test (811 skills: 510 maliciosas, 301 benignas) | Por defecto | 0,5 | 99,80 | 0,66 |
| SRC010 recovered-package test | Objetivo 99 % recall en validación | 0,99748853624125544 | 99,02 | 0,33 |
| SkillsBench-1650 external (1.650 skills: 150 maliciosas, 1.500 benignas) | Por defecto | 0,5 | 66,67 | 0,40 |
| SkillsBench-1650 external | Objetivo 99 % recall en validación | 0,99748853624125544 | 32,67 | 0,13 |

El conjunto externo SkillsBench-1650 corresponde a `zenith6888/SkillsBench-1650` en la revisión `68c0d4bf857f48e5fa4f3baa4613f0c0980a7fb2`, con el Markdown original más el `script_content` proporcionado como fichero auxiliar y el mismo presupuesto de 32K tokens. No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros), lo que es coherente con la naturaleza especializada del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 2.213 millones de parámetros, en BF16 los pesos ocupan aproximadamente 4,4 GB, a los que hay que sumar la memoria del contexto de hasta 32.768 tokens y las activaciones; en la práctica se requiere una GPU con holgura por encima de esa cifra.
- GPU recomendadas: no se especifican modelos concretos. La model card exige CUDA con soporte de BF16, lo que incluye GPUs de centro de datos (A100, H100) y GPUs de consumo recientes compatibles con BF16.
- ¿Cabe en GPU de consumo? No disponible como afirmación del autor; por tamaño de pesos sería viable en GPUs de consumo con suficiente memoria, pero no se documenta una configuración validada.
- Opciones de despliegue: la vía documentada es la librería `transformers` con el script `score.py` incluido en el repositorio (`python skillscreen/score.py path/to/package.json`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos de clasificación de skills de agentes, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillScreen-2B-Package-Experimental | 2.213.247.808 | 32.768 tokens | Clasificación de paquetes de skills (NLI) | Apache-2.0 (pesos) / CC BY 4.0 (docs) | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Brecha de generalización: el recall cae del 99,80 % en el test de su dominio (SRC010) al 66,67 % en el conjunto externo SkillsBench-1650 con el umbral por defecto, y al 32,67 % con el umbral de alta recall. El modelo está fuertemente ajustado al cohorte de entrenamiento y no debe asumirse un rendimiento equivalente en dominios nuevos.
- Naturaleza experimental: la propia denominación del modelo y la etiqueta `experimental` indican que no es un artefacto validado para producción sin evaluación adicional en el dominio de destino.
- Riesgo de falsos negativos en producción: con el umbral de alta recall, el FPR baja al 0,13 % en el conjunto externo, pero el recall se sitúa en el 32,67 %; la elección de umbral implica un compromiso explícito entre cobertura y ruido.
- Dependencia de hardware: requiere CUDA con soporte de BF16; no se documenta soporte de CPU ni de cuantización, lo que limita su despliegue en entornos sin GPU.
- Idiomas soportados no documentados: no se especifica qué idiomas cubre el modelo, por lo que no puede asumirse un comportamiento fiable en castellano u otros idiomas distintos del inglés sin validación previa.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un clasificador de seguridad, existe riesgo de que el modelo aprenda patrones superficiales del cohorte de entrenamiento en lugar de indicadores semánticos de malicia.
- Restricciones de licencia: los pesos y el código son Apache-2.0, y la documentación es CC BY 4.0; se permite uso comercial, ajuste fino y redistribución conservando los avisos de atribución. Siguen aplicando los derechos y avisos de OpenJev y Qwen (véanse `THIRD_PARTY_NOTICES.md`, `LICENSE-OPENJEV` y `LICENSE-QWEN`).
- La citación solicitada por los autores no añade condiciones a las licencias, pero se pide identificar SkillScreen como origen en modelos derivados y enlazar al checkpoint original.
- El modelo no genera texto ni razona: cualquier expectativa de uso como LLM general es incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkillScreen/SkillScreen-2B-Package-Experimental
- Modelo base OpenJev 2B: https://huggingface.co/AlexWortega/openjev
- Página del proyecto: https://jerroldh.github.io/SkillScreen-webpage/
- Código: https://github.com/JerroldH/SkillScreen
- Paper (arXiv): https://arxiv.org/abs/2610.17727
- DOI del paper: https://doi.org/10.48550/arXiv.2610.17727
- Dataset de entrenamiento/evaluación: ProtectSkills/MaliciousSkillBench (referenciado en la model card)
- Conjunto externo de evaluación: `zenith6888/SkillsBench-1650`, revisión `68c0d4bf857f48e5fa4f3baa4613f0c0980a7fb2`
- Ficheros de trazabilidad en el repositorio: `provenance.json`, `merge_verification.json`, `CITATION.cff`, `THIRD_PARTY_NOTICES.md`, `LICENSE-OPENJEV`, `LICENSE-QWEN`
