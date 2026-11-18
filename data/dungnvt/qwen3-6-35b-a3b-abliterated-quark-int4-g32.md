# dungnvt/Qwen3.6-35B-A3B-abliterated-Quark-INT4-G32

## Resumen

El modelo identificado como `dungnvt/Qwen3.6-35B-A3B-abliterated-Quark-INT4-G32` es una publicación alojada en Hugging Face por el usuario dungnvt. Por el propio identificador se deduce que se trata de una variante del supuesto modelo Qwen3.6 con arquitectura Mixture of Experts (MoE) de 35 000 millones de parámetros totales y aproximadamente 3000 millones de parámetros activos por token (el sufijo "A3B" indica esa activación). Sobre esa base se habría aplicado un proceso de "abliteration" (eliminación o atenuación de los mecanismos de rechazo alineados) y posteriormente una cuantización INT4 con granularidad de grupo 32 (sufijo "Quark-INT4-G32"), presumiblemente mediante la herramienta Quark de AMD.

La relevancia de esta ficha es limitada por la escasez de información verificable: la model card publicada no contiene más que la etiqueta de licencia, sin descripción técnica, sin datos de entrenamiento, sin benchmarks ni instrucciones de uso. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no se ha publicado información sobre idiomas soportados, pipeline de inferencia ni formato de pesos más allá de lo que sugiere el nombre.

Por tanto, esta ficha se redacta con carácter descriptivo y cautelar: se detalla lo que el nombre del modelo permite inferir y se marcan explícitamente como "no disponible" todos aquellos datos que el autor no ha hecho públicos. Cualquier evaluación de producción debería posponerse hasta que exista documentación técnica verificable o resultados reproducibles por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, inferida del sufijo "A3B" del nombre; no confirmada por el autor |
| Parámetros totales | 35 000 millones (35B), según el nombre del modelo |
| Parámetros activos | ~3000 millones (3B), según el sufijo "A3B" |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 con granularidad de grupo 32 (Quark-INT4-G32); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el sufijo Quark sugiere artefactos cuantizados compatibles con el ecosistema Quark de AMD; no se especifica safetensors, GGUF ni otro contenedor) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá de lo que se deduce del identificador: un transformer con capas MoE, 35B parámetros totales y aproximadamente 3B activos por token. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. El término "abliterated" indica que el autor ha modificado los pesos para reducir o eliminar los comportamientos de rechazo aprendidos durante el alineamiento, pero no se especifica la metodología exacta ni el grado de intervención.

La innovación técnica declarada en el nombre es la cuantización INT4 con grupo de 32 mediante Quark, una herramienta de compresión de modelos de AMD. Sin embargo, no se aportan detalles sobre el esquema de cuantización (por ejemplo, si es simétrica o asimétrica, qué capas se han excluido, ni qué precisión se mantiene en las capas de atención o en los expertos). Tampoco hay información sobre decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento: capacidad inferida por la familia de modelos Qwen, no verificada en esta variante concreta.
- Generación de código y matemáticas: presumible en la familia Qwen3, sin datos publicados para esta cuantización.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el autor no declara idiomas).
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no disponible.
- Efecto del "abliteration": se espera una reducción de los rechazos ante peticiones que el modelo base rechazaría, pero no se documenta el alcance ni los posibles efectos secundarios sobre la calidad general.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el efecto del abliteration sobre las respuestas de rechazo en un modelo MoE cuantizado, comparándolo con el modelo base no modificado. Es adecuado para entornos de laboratorio, no para producción sin evaluación previa.
- Experimentación con cuantización INT4 en hardware AMD: dado que la cuantización se realizó con Quark, puede emplearse para validar el rendimiento de modelos MoE de 35B en GPUs AMD con soporte Quark, midiendo latencia y calidad frente a la versión en BF16.
- Despliegue en entornos con restricciones de memoria: al tratarse de una cuantización INT4 de un MoE de 35B con 3B activos, podría caber en GPUs de consumo alto (por ejemplo, 24 GB) si el formato de pesos es compatible con el runtime elegido; requiere verificación empírica.
- Generación de texto creativo sin filtros: el abliteration puede interesar a proyectos que necesiten respuestas sin rechazos temáticos, siempre que el operador asuma la responsabilidad legal y ética del contenido generado.
- Prototipado de asistentes conversacionales: si el modelo conserva las capacidades del base Qwen3.6, podría usarse para diálogos multi-turno, aunque la ausencia de documentación sobre contexto e idiomas obliga a validarlo antes.
- Evaluación comparativa de variantes abliterated: sirve como punto de comparación en estudios que midan la degradación de benchmarks tras abliteration y cuantización agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Como referencia teórica, un MoE de 35B en INT4 con grupo 32 requiere almacenar todos los parámetros (no solo los activos), lo que sitúa el peso de los pesos en torno a 17-20 GB, más overhead de activaciones y KV cache; la cifra exacta depende del esquema de cuantización y del runtime.
- GPU recomendadas: no disponible. Por el origen Quark, es plausible que el autor haya validado en GPUs AMD (por ejemplo, Instinct MI300 o Radeon), pero no se confirma.
- ¿Cabe en GPU de consumo? Posiblemente en tarjetas con 24 GB o más (RTX 4090, RX 7900 XTX) si el formato de pesos es compatible con el runtime; no verificado.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con el runtime de Quark.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dungnvt/Qwen3.6-35B-A3B-abliterated-Quark-INT4-G32 | 35B | ~3B | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Modelo base Qwen3.6-35B-A3B (supuesto) | 35B | ~3B | no disponible | no disponible | no verificado en la información |
| Otras variantes abliterated de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible | no verificado |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. La comparativa se limita a parámetros y licencia.

## Limitaciones y advertencias

- Documentación inexistente: la model card solo contiene la licencia; no hay instrucciones de uso, ni descripción de la cuantización, ni ejemplos.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que impide contrastar su comportamiento con reportes de terceros.
- Abliteration: la eliminación de rechazos puede degradar la coherencia, aumentar la toxicidad o producir respuestas inseguras; no se documenta el método ni sus efectos.
- Cuantización INT4 agresiva: la granularidad de grupo 32 puede introducir pérdida de calidad frente a BF16, especialmente en tareas de razonamiento y código; no hay evaluación publicada.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado para esta variante.
- Idiomas y contexto: no declarados, por lo que no se puede garantizar soporte multilingüe ni ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el operador asume la responsabilidad sobre el contenido generado y sobre posibles reclamaciones derivadas del abliteration.
- Origen del modelo base: no se confirma que exista un "Qwen3.6-35B-A3B" oficial; el nombre podría referirse a una convención del autor o a un modelo no publicado, lo que añade incertidumbre sobre la procedencia de los pesos.
- Compatibilidad de runtime: al no documentarse el formato de pesos, no se puede asegurar que cargue en herramientas estándar como llama.cpp o vLLM.

## Enlaces

- Hugging Face: https://huggingface.co/dungnvt/Qwen3.6-35B-A3B-abliterated-Quark-INT4-G32
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
