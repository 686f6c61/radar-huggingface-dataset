# AbhijeetKumar2125/da3410-ec-retrieval-v6

## Resumen

DA3410 EC Retrieval v6 es un sistema de clasificación de enzimas por número EC (Enzyme Commission) que no se basa en un modelo neuronal, sino en una canalización de recuperación por similitud de secuencia sobre una base de datos de referencia MMseqs2. Desarrollado por el usuario AbhijeetKumar2125, el sistema busca homólogos de una proteína de consulta, recupera hasta 50 candidatos y combina sus anotaciones EC mediante un esquema de votación ponderada por bit score, identidad de secuencia, cobertura de consulta, cobertura de objetivo y rango.

Su innovación principal es el "adaptive nearest-hit weighting": el peso del mejor hit se ajusta dinámicamente según su identidad y cobertura, de forma que cuando existe un homólogo muy cercano y bien cubierto la predicción se acerca a la transferencia directa de anotación, mientras que en casos más ambiguos el peso se reparte entre varios candidatos. El resultado es un único número EC restringido al vocabulario de entrenamiento.

El repositorio ocupa 1,7 GB e incluye el código de inferencia, la base de datos MMseqs2, las anotaciones de referencia y el vocabulario EC. Es relevante para pipelines de anotación funcional de proteínas a gran escala donde se prioriza trazabilidad y coste computacional bajo frente a modelos de lenguaje proteicos. No se dispone de información sobre arquitectura neuronal, parámetros ni benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recuperación por similitud (MMseqs2) con votación ponderada de etiquetas EC; no es un modelo neuronal |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica; opera sobre secuencias de proteína) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; entrada de secuencias proteicas) |
| Licencia | MIT |
| Formato de pesos | no disponible; el artefacto principal es una base de datos MMseqs2 (`mmseqs_db/`) más ficheros TSV/JSON de anotaciones |

## Arquitectura y entrenamiento

El sistema no entrena una red neuronal. Su "modelo" es una base de datos de referencia de proteínas anotadas con EC, indexada con MMseqs2, junto con una lógica de agregación implementada en `predict.py`. En inferencia, cada secuencia de consulta se busca contra esa base, se recuperan hasta 50 homólogos y cada candidato recibe un peso calculado a partir de cinco señales: bit score, identidad de secuencia, cobertura de la consulta, cobertura del objetivo y rango del hit.

El componente adaptativo modula la contribución del hit más cercano en función de su identidad y cobertura: a mayor identidad y cobertura del mejor hit, mayor peso relativo de este frente al resto de candidatos. La etiqueta final se selecciona del vocabulario cerrado `ec_vocabulary.json`, lo que garantiza que la salida sea siempre un EC válido del conjunto de entrenamiento. No se documentan en la información disponible el tamaño del conjunto de referencia, la composición taxonómica, el número de tokens (no aplica) ni procesos de RLHF/DPO.

## Capacidades

- Predicción de números EC (Enzyme Commission) a partir de secuencias proteicas.
- Recuperación de hasta 50 homólogos por consulta mediante MMseqs2.
- Ponderación multi-señal de candidatos (bit score, identidad, cobertura de consulta, cobertura de objetivo, rango).
- Ajuste adaptativo del peso del hit más cercano según identidad y cobertura.
- Restricción de la salida al vocabulario EC de entrenamiento, evitando etiquetas fuera de distribución.
- Procesamiento por lotes: acepta un fichero Parquet con columnas `id` y `sequence` y emite JSON Lines con un registro por secuencia única.
- Deduplicación de secuencias de entrada mediante `inputs.py` y `task.json`.
- Empaquetado en contenedor Docker para despliegue reproducible.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües de lenguaje natural.

## Casos de uso

- Anotación funcional masiva de proteomas: dado un proteoma completo en Parquet, el sistema devuelve un EC por secuencia en JSON Lines, adecuado para pipelines de metagenómica donde el coste de un modelo neuronal por proteína sería prohibitivo.
- Enriquecimiento de catálogos enzimáticos internos: permite asignar EC a secuencias no anotadas usando una base de referencia curada y un esquema de votación auditable, con la ventaja de que cada predicción es trazable a los homólogos recuperados.
- Triaje previo a revisión manual: las predicciones con hit más cercano de alta identidad y cobertura pueden priorizarse para validación experimental, mientras que las ambiguas se marcan para revisión.
- Integración en pipelines bioinformáticos existentes: al exponerse como script CLI (`predict.py --input --output`) y contenedor Docker, encaja en flujos Nextflow/Snakemake sin dependencias de GPU.
- Clasificación de enzimas en estudios de biología comparada: la búsqueda MMseqs2 contra una referencia fija permite comparar consistentemente conjuntos de secuencias entre experimentos.
- Prototipado rápido de clasificadores EC sin entrenamiento: al no requerir ajuste fino, sirve como línea base de referencia frente a la que medir modelos de lenguaje proteicos en tareas de anotación.
- Despliegue en entornos con recursos limitados: al no necesitar GPU ni pesos neuronales, puede ejecutarse en CPU dentro de un contenedor, útil en infraestructura on-premise o clústeres sin aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el sistema no ejecuta un modelo neuronal y puede correr en CPU.
- GPU recomendadas: no aplica; no se requiere acelerador.
- ¿Cabe en GPU de consumo? Sí, en el sentido de que no necesita GPU; el cuello de botella es CPU y E/S de disco.
- Almacenamiento: el repositorio ocupa 1,7 GB, incluyendo la base de datos MMseqs2; se recomienda espacio adicional para índices temporales de MMseqs2 durante la búsqueda.
- Opciones de despliegue: script Python (`predict.py`), contenedor Docker incluido en el repositorio, e integración en pipelines que invoquen MMseqs2.
- Latencia y throughput estimados: no disponibles; dependerán del tamaño de la base de referencia, del número de consultas y del hardware. MMseqs2 está optimizado para búsquedas masivas, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Sistema | Enfoque | Entrada | Salida | Licencia | Requiere GPU |
|---|---|---|---|---|---|
| DA3410 EC Retrieval v6 | Recuperación MMseqs2 + votación ponderada adaptativa | Secuencia proteica | Un EC del vocabulario | MIT | No |
| Modelos de lenguaje proteicos tipo ESM (p. ej. ESM-2 con cabecera EC) | Transformer entrenado, clasificación supervisada | Secuencia proteica | EC (según cabecera) | Varía por modelo | Sí, para tamaños grandes |
| BLAST + transferencia de anotación por mejor hit | Recuperación por alineamiento local | Secuencia proteica | EC del mejor hit | Dominio público / varía | No |
| Catálogos tipo BRENDA/Swiss-Prot con búsqueda de homólogos | Recuperación con anotación curada | Secuencia proteica | EC anotado | Varía | No |

No se dispone de datos de rendimiento comparativo entre estos sistemas en la información proporcionada; la comparativa se limita a enfoque, requisitos y licencia.

## Limitaciones y advertencias

- No es un modelo generativo ni un transformer: no procesa texto, no tiene contexto conversacional ni soporta tool calling; cualquier expectativa de "LLM" es incorrecta.
- La calidad depende enteramente de la base de referencia MMseqs2 incluida; proteínas sin homólogos cercanos en esa base probablemente reciban predicciones poco fiables o imposibles de asignar.
- La salida se restringe al vocabulario EC de entrenamiento, por lo que enzimas con EC no presentes en él no podrán clasificarse correctamente.
- Riesgo de propagación de errores de anotación de la referencia: la votación ponderada mitiga pero no elimina la transferencia de etiquetas erróneas.
- El ajuste adaptativo del peso del hit más cercano no está validado con métricas publicadas en la información disponible; no hay evidencia de calibración.
- Sin datos de sesgo taxonómico: si la base de referencia está dominada por ciertos linajes, las predicciones pueden degradarse en grupos poco representados.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de las bases de datos de anotación subyacentes (por ejemplo, si derivan de Swiss-Prot o BRENDA), que pueden imponer condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni mantenimiento demostrado.
- No se documentan idiomas ni cobertura multilingüe porque la entrada es una secuencia de aminoácidos, no texto.

## Enlaces

- Hugging Face: https://huggingface.co/AbhijeetKumar2125/da3410-ec-retrieval-v6
- MMseqs2 (herramienta de búsqueda subyacente): https://github.com/soedinglab/MMseqs2
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
