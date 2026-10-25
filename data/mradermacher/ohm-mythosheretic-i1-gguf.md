# mradermacher/Ohm-MythosHeretic-i1-GGUF

## Resumen

mradermacher/Ohm-MythosHeretic-i1-GGUF es una colección de cuantizaciones en formato GGUF, generadas con matrices de importancia (imatrix), del modelo orangejuicesmith/Ohm-MythosHeretic. El modelo subyacente es un transformer de 3.085.938.688 parámetros (aproximadamente 3,1B) que los tags del repositorio asocian a la familia Qwen2 y a la variante denominada "mythos-nano". Lo publica mradermacher, cuantizador habitual de modelos abiertos, y no se trata por tanto de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local.

El modelo base está etiquetado para razonamiento, matemáticas y código, y se distribuye como variante "heretic", "abliterated", "decensored" y "uncensored", lo que implica que se ha suprimido o reducido el alineamiento de seguridad original. Es un detalle crítico para cualquier evaluación: el modelo no incorpora los mecanismos habituales de rechazo de peticiones dañinas.

Su relevancia práctica es que permite ejecutar un modelo de 3B en hardware de consumo, desde tarjetas gráficas de 6-8 GB hasta CPU, con cuantizaciones que van desde 0,9 GB (IQ1_S) hasta 2,6 GB (Q6_K). La licencia MIT facilita el uso comercial, pero la ausencia de benchmarks publicados y de documentación sobre contexto y entrenamiento limita seriamente la evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; familia Qwen2 y variante "mythos-nano" según los tags del repositorio |
| Parametros totales | 3.085.938.688 (aproximadamente 3,1B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; incluye fichero imatrix |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna más allá de los tags "qwen2" y "mythos-nano", que apuntan a un transformer decoder-only de la familia Qwen2 con 3,1B de parámetros. No se especifican número de capas, dimensión oculta, número de cabezas de atención ni tipo de atención (completa, GQA o lineal). Tampoco se indica la longitud de contexto nativa, un dato imprescindible para planificar despliegues.

Respecto al entrenamiento, no hay información sobre el número de tokens, la composición del dataset, las fases de ajuste supervisado o de preferencias (RLHF/DPO) ni sobre el proceso concreto de abliteration aplicado. El autor del modelo cuantizado solo declara que se trata de cuantizaciones ponderadas con imatrix del modelo base, generadas con una versión 2 del pipeline de cuantización y conversión desde formato Hugging Face. Cualquier afirmación sobre datos de entrenamiento o innovaciones técnicas sería especulativa.

## Capacidades

- Generación de texto conversacional en inglés, según el tag "conversational".
- Razonamiento y resolución de problemas, según los tags "reasoning" y "math".
- Generación y explicación de código, según el tag "code".
- Comportamiento "abliterated"/"uncensored": se espera que no aplique los rechazos habituales de los modelos alineados, aunque este comportamiento no está garantizado ni documentado formalmente.
- Soporte multilingüe: únicamente inglés declarado; no hay evidencia de capacidades en castellano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local: con cuantizaciones Q4_K_M (2,0 GB) o Q5_K_M (2,3 GB) el modelo cabe en GPU de consumo y puede integrarse en editores o scripts de revisión de parches, aunque su tamaño de 3B limita la calidad frente a modelos mayores.
- Generación de tests unitarios y documentación técnica: adecuado para tareas acotadas de transformación de texto en inglés, ejecutables en lote sobre CPU con llama.cpp.
- Tutoría de matemáticas paso a paso: el tag "math" sugiere uso educativo, pero al ser un modelo de 3B conviene verificar cada resultado con una herramienta simbólica antes de mostrarlo.
- Experimentación en seguridad y alineamiento: al ser una variante abliterated, resulta útil para red teaming, evaluación de sesgos y estudio de los efectos de eliminar el alineamiento, siempre en entornos controlados.
- Prototipado de chatbots conversacionales en inglés: despliegue local con Ollama o llama-server para validar flujos de conversación antes de migrar a un modelo mayor.
- Procesamiento por lotes sin GPU: las cuantizaciones IQ2/IQ3 (1,0-1,7 GB) permiten clasificación, resumen o extracción de campos en máquinas sin acelerador, asumiendo pérdida de calidad.
- Generación de texto creativo sin restricciones de contenido: el carácter "decensored" lo hace apto para ficción o guiones donde los modelos alineados rechazan ciertas temáticas, con las cautelas legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada, ni para el modelo cuantizado ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + caché KV y overhead aproximado):
  - IQ1_S (0,9 GB): alrededor de 1,5-2 GB en total.
  - IQ2_M (1,2 GB): alrededor de 2-2,5 GB.
  - Q3_K_M (1,7 GB): alrededor de 2,5-3 GB.
  - Q4_K_M (2,0 GB): alrededor de 3-3,5 GB.
  - Q5_K_M (2,3 GB): alrededor de 3,5-4 GB.
  - Q6_K (2,6 GB): alrededor de 4-5 GB.
  - FP16 del modelo base (aproximadamente 6,2 GB solo en pesos): alrededor de 7-8 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más para cuantizaciones Q4 o inferiores (GTX 1650, RTX 3050, RTX 4060, RTX 3060 12 GB). Para Q6_K o FP16 conviene disponer de 6-8 GB (RTX 4060 Ti, RTX 3060 12 GB, RTX 4090). No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas actuales con 6 GB o más usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama mediante importación de GGUF, LM Studio, koboldcpp, text-generation-webui y otros frontends compatibles con GGUF. vLLM y TGI no están pensados para GGUF y no se documenta soporte en este repositorio.
- Latencia y throughput: no disponible; no se proporcionan mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Ohm-MythosHeretic-i1-GGUF (este modelo) | 3,1B | No disponible | MIT | Variante abliterated/uncensored, solo inglés, sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,1B | No comparado en la información disponible | Apache 2.0 | Referencia alineada de la familia Qwen2; multilingüe |
| Llama-3.2-3B-Instruct | 3,2B | No comparado en la información disponible | Llama 3.2 Community License | Alternativa alineada con restricciones de uso comercial |
| Phi-3.5-mini-instruct | 3,8B | No comparado en la información disponible | MIT | Licencia permisiva y orientación a razonamiento |

No se dispone de comparaciones de rendimiento entre estos modelos y Ohm-MythosHeretic, ya que el repositorio no publica resultados de benchmarks. Los datos de los modelos alternativos son de referencia pública y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no es posible validar el rendimiento en razonamiento, matemáticas o código con datos objetivos.
- Tamaño de 3B: mayor propensión a alucinaciones, errores aritméticos y pérdida de coherencia en cadenas de razonamiento largas.
- Solo inglés declarado: no hay soporte documentado de castellano ni de otros idiomas.
- Contexto no documentado: se desconoce la ventana máxima, lo que impide garantizar el comportamiento en conversaciones o documentos extensos.
- Variante abliterated/uncensored: no incorpora salvaguardas de seguridad, puede generar contenido dañino, ilegal o sesgado, y no debería exponerse directamente a usuarios finales sin filtros externos.
- Cuantizaciones de baja precisión: la propia model card advierte que IQ1_S es "for the desperate" y que IQ2/IQ3 implican pérdida de calidad; no se recomiendan para producción.
- Licencia MIT: permite uso comercial y modificación, pero traslada al desplegador toda la responsabilidad legal y ética sobre el contenido generado.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-10-25) resulta anómala.
- No se documentan sesgos específicos ni la composición del dataset original, por lo que no es posible evaluar sesgos sistemáticos.
- El autor del cuantizado no es el autor del modelo base; los detalles de entrenamiento y alineamiento deben consultarse en el repositorio de orangejuicesmith/Ohm-MythosHeretic.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Ohm-MythosHeretic-i1-GGUF
- Modelo base: https://huggingface.co/orangejuicesmith/Ohm-MythosHeretic
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Ohm-MythosHeretic-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Ohm-MythosHeretic-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y FAQ del cuantizador: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
