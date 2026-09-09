# jimnoneill/paper-to-sub-field-adjudicated

## Resumen

`paper-to-sub-field-adjudicated` es un clasificador estático de textos que asigna un paper científico (título + resumen) a la taxonomía de OpenAlex a nivel de subcampo, devolviendo además el campo y el dominio derivados. Lo desarrolla el usuario de Hugging Face `jimnoneill` como respuesta a un problema documentado de fiabilidad en las etiquetas del propio OpenAlex: el 58,9% de los subcampos asignados por esa plataforma no coincide con la elección independiente de un modelo de referencia (DeepSeek V4-Flash), y en el 29,9% de los casos el subcampo de OpenAlex ni siquiera aparece en el top tres de ese modelo.

Para mitigarlo, el autor reetiquetó 175.906 papers con un modelo independiente y entrenó este clasificador sobre los 88.887 casos en los que el campo de OpenAlex no entraba en conflicto con la reetiquetación. El modelo usa `model2vec` sobre la base `minishlab/potion-base-32M`, con 32,4 millones de parámetros y un tamaño de repositorio de 0,1 GB. Está pensado para una inferencia rápida en CPU, sin necesidad de GPU, y está orientado a la clasificación de artículos científicos en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | model2vec (embeddings estáticos sobre `minishlab/potion-base-32M`) + clasificador de texto |
| Parametros totales | 32.428.774 |
| Parametros activos | No disponible (no es una arquitectura MoE) |
| Longitud de contexto | No disponible; en la práctica, la entrada esperada es el título y los primeros 1.200 caracteres del resumen |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `model2vec`, una técnica que transforma un modelo de embeddings en representaciones estáticas (vectores de dimensiones fijas) para acelerar la inferencia en CPU. La base es `minishlab/potion-base-32M`, un modelo de embeddings pequeño. Sobre los vectores resultantes se entrena un clasificador lineal o equivalente para producir una distribución de probabilidad sobre subcampos.

El entrenamiento se realizó sobre etiquetas adjudicadas por DeepSeek V4-Flash, no sobre las etiquetas originales de OpenAlex. Se partió de 175.906 papers con etiquetas revisadas; de ellos, se descartaron los que tenían un campo OpenAlex incorrecto según la reetiquetación (el 48,5% de los casos), quedando 88.887 muestras válidas para el entrenamiento. Se aplicaron pesos de pérdida balanceados por clase (método de "número efectivo"), pero no se equilibró el número de filas por subcampo. La distribución de entrenamiento va desde 1 muestra hasta 2.541, con una mediana de 176, y 57 subcampos tienen menos de 50 muestras. La jerarquía de salida se construye de forma legal: la probabilidad del campo es la suma de las probabilidades de sus subcampos, y el dominio se obtiene por lookup de la categoría superior.

## Capacidades

- Clasificación de papers científicos en la taxonomía de OpenAlex a nivel de subcampo, campo y dominio.
- Devuelve los tres subcampos más probables, los dos campos más probables y un único dominio por entrada.
- Genera una jerarquía válida por construcción: el campo agregado siempre contiene a los subcampos asignados.
- Inferencia en CPU a alta velocidad, al ser un modelo estático de embeddings.
- Acepta como entrada el título y el resumen (limitado a los primeros 1.200 caracteres del abstract).
- Soporta señales de incertidumbre con ajuste de temperatura, aunque esta se aplica solo a la señal devuelta, no a las etiquetas emitidas.
- Únicamente soporta el idioma inglés.
- No es un modelo generativo: no produce texto libre ni admite tool calling.

## Casos de uso

- **Categorización automática de papers en repositorios institucionales**: el clasificador puede etiquetar cada nuevo artículo con su subcampo OpenAlex en milisegundos, permitiendo organizar colecciones sin intervención humana.
- **Análisis bibliométrico y de producción científica**: al devolver la jerarquía completa (subcampo, campo, dominio) se pueden construir métricas de distribución de áreas de conocimiento en universidades o agencias de financiación.
- **Enriquecimiento de metadatos en plataformas de datos científicos**: útil para corregir o completar las etiquetas de datasets que carecen de clasificación temática o cuya clasificación original es poco fiable.
- **Detección de errores en la asignación de subcampos de OpenAlex**: dado que el modelo fue entrenado con etiquetas adjudicadas, puede utilizarse para auditar la coherencia de las asignaciones existentes y señalar posibles errores sistemáticos.
- **Sistemas de recomendación de revisores**: la clasificación granular por subcampo permite preseleccionar revisores con experiencia en una subdisciplina concreta, mejorando la calidad de los pares.
- **Integración en pipelines de preprocesamiento para modelos ópticos o de texto**: al clasificar automáticamente los abstracts es posible construir datasets etiquetados para entrenar otros modelos de NLP.
- **Dashboards de seguimiento de tendencias científicas**: la salida con top-3 subcampos facilita el seguimiento de temas emergentes o el solapamiento entre campos.

## Benchmarks y rendimiento

Según la model card, el modelo se evalúa contra sus propias etiquetas y contra un conjunto de datos DataCite retenido durante el entrenamiento. La tabla comparativa con el modelo homólogo entrenado sobre etiquetas de OpenAlex (sobre el 30% de DataCite retenido) es la siguiente:

| Modelo | sub@1 | sub@3 | field@1 | MACRO | Clases muertas |
|---|---|---|---|---|---|
| Entrenado con etiquetas OpenAlex | 0,6739 | 0,8263 | 0,8212 | 0,5897 | 37 |
| `paper-to-sub-field-adjudicated` | **0,7050** | **0,8585** | **0,8225** | **0,6830** | **26** |

Sobre sus propias etiquetas hold-out (247 subcampos), el modelo alcanza: subfield top-1 0,6426, subfield top-3 0,8697, field top-1 0,8758, field top-2 0,9675 y domain 0,9474. Además, puntuado contra las etiquetas de OpenAlex en datos retenidos, alcanza un 0,9377 de accuracy de campo, superando al modelo entrenado con esas mismas etiquetas (0,8694). No se han publicado más benchmarks externos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU; el modelo completo ocupa 0,1 GB en disco y puede cargarse en RAM.
- **GPU recomendada**: ninguna. La model card lo describe explícitamente como un clasificador "CPU-speed".
- **Compatibilidad con GPU de consumo**: sí, aunque no es necesario; cualquier configuración con CPU moderna es suficiente.
- **Opciones de despliegue**: Python con la librería `model2vec`; se puede servir como endpoint REST con FastAPI o integrarse en notebooks.
- **Latencia**: al ser un modelo estático de 32M parámetros, la latencia por predicción es del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto efectivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `paper-to-sub-field-adjudicated` | model2vec sobre potion-base-32M | 32.428.774 | Título + 1.200 caracteres de abstract | MIT | Hugging Face |
| `paper-to-sub-field-distilled` | model2vec sobre potion-base-32M | 32.428.774 | Título + 1.200 caracteres de abstract | MIT | Hugging Face |
| `paper-to-field` | Sin datos disponibles en la búsqueda | No disponible | No disponible | No disponible | Hugging Face |
| `minishlab/potion-base-32M` | Modelo de embeddings base | 32M aprox. | Variable | No disponible en la información facilitada | Hugging Face |

La única diferencia conocida entre `paper-to-sub-field-adjudicated` y `paper-to-sub-field-distilled` es el conjunto de etiquetas de entrenamiento: el primero usa etiquetas adjudicadas por DeepSeek V4-Flash y el segundo usa las etiquetas nativas de OpenAlex. Según el README, la diferencia es intencionada y es el objeto de la comparativa de benchmarks.

## Limitaciones y advertencias

- **Etiquetas de entrenamiento incompletas**: el 48,5% de las filas reetiquetadas se descartó porque el campo original de OpenAlex contradecía al campo de DeepSeek. Por tanto, el modelo se entrenó solo con 88.887 papers, aproximadamente la mitad del corpus disponible.
- **Desequilibrio de clases**: no se equilibró el número de muestras por subcampo. Hay subcampos con 1 sola muestra y otros con más de 2.500. Esto limita la precisión macro (0,683) frente a la micro (más alta).
- **`subfield_name` no es único en OpenAlex**: siete nombres aparecen en dos campos distintos (Biochemistry, Genetics, Microbiology, Neurology, Pharmacology, Physiology, Archeology). Resolver por nombre solo puede confundir alrededor del 7,7% de los casos. Se recomienda usar `subfield_id`.
- **La precisión de subcampo es concordancia con un LLM, no con humanos**: no se realizó etiquetado humano. Aunque la evidencia es consistente (patrón de atracción, mayor desacuerdo del adjudicador con baja confianza, defecto documentado de OpenAlex), no es una prueba definitiva.
- **DataCite es un árbitro justo, no independiente**: ambos modelos se entrenaron con el 70% de ese corpus y se puntúan sobre el 30% retenido, por lo que la comparación mide generalización, no un escenario totalmente desconocido.
- **Solo soporta inglés**: no hay datos sobre rendimiento en otros idiomas.
- **No es un modelo generativo**: no puede responder preguntas, generar código ni mantener conversaciones. Su función se limita a clasificación de textos científicos.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/jimnoneill/paper-to-sub-field-adjudicated](https://huggingface.co/jimnoneill/paper-to-sub-field-adjudicated)
- Modelo hermano `paper-to-sub-field-distilled`: [https://huggingface.co/jimnoneill/paper-to-sub-field-distilled](https://huggingface.co/jimnoneill/paper-to-sub-field-distilled)
- Otro modelo del autor `paper-to-field`: [https://huggingface.co/jimnoneill/paper-to-field](https://huggingface.co/jimnoneill/paper-to-field)
- Perfil del autor: [https://huggingface.co/jimnoneill](https://huggingface.co/jimnoneill)
- Modelo base `minishlab/potion-base-32M`: [https://huggingface.co/minishlab/potion-base-32M](https://huggingface.co/minishlab/potion-base-32M)
