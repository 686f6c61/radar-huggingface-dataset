# patentmechanics/anticipate-0.6b

## Resumen

Anticipate-0.6B es un modelo de embeddings especializado en búsqueda de estado de la técnica (prior-art search) sobre texto completo de patentes estadounidenses. Lo desarrolla patentmechanics y se presenta como un fine-tune de microsoft/harrier-oss-v1-0.6b, un transformer de tipo encoder con unos 596 millones de parámetros. Su función es recibir las reivindicaciones de una solicitud de patente y ordenar documentos anteriores según la probabilidad de que un examinador los citara contra esas reivindicaciones.

El modelo genera vectores densos de 1.024 dimensiones, admite consultas de hasta 4.096 tokens y documentos de hasta 8.192 tokens (título, resumen, reivindicaciones y descripción). Los pesos liberados son la media de tres semillas de fine-tuning, entrenadas sobre citas extraídas de acciones de oficina de la USPTO. Se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse con sentence-transformers y text-embeddings-inference.

Su relevancia actual radica en que aborda una tarea concreta y costosa, la búsqueda de anterioridades, con una mejora medible sobre modelos base y alternativas de tamaño similar en un benchmark propio de 4.837 consultas y 250.367 familias de patentes. No obstante, el autor advierte que es una ayuda a la recuperación documental y no una opinión legal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: microsoft/harrier-oss-v1-0.6b; familia de tags qwen3) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | consultas hasta 4.096 tokens; documentos hasta 8.192 tokens |
| Tipos de cuantización | no disponible (pesos en bf16; sin detalle de GGUF u otras) |
| Idiomas soportados | inglés (en); solo documentos de EE. UU. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de aproximadamente 0,6 B de parámetros, derivado de microsoft/harrier-oss-v1-0.6b (revisión f9b9dc8d). Produce embeddings de 1.024 dimensiones y emplea pooling de último token con padding a la izquierda. El fine-tuning se realizó sobre citas de acciones de oficina de la USPTO, con los pesos finales promediados a partir de tres semillas independientes. El entrenamiento y la evaluación se limitan a datos de patentes estadounidenses: texto completo de la USPTO, acciones de oficina y procedimientos del PTAB.

El benchmark asociado, prior-art-bench-v1, fija las comparativas y las métricas antes de puntuar el conjunto de test, y todas las decisiones de modelo y pesos de fusión se tomaron sobre la mitad de desarrollo. El sistema recomendado añade tres componentes en tiempo de búsqueda sin modificar los pesos: embeddings por pasajes de la descripción (fragmentos de al menos 5.000 caracteres prefijados con título y resumen), un refuerzo por coincidencia estricta de clasificación CPC (peso 0,75) y la suma del score BM25 estandarizado con peso 0,2. El prompt de invalidez no se usó en el entrenamiento y las consultas PTAB no se entrenaron.

## Capacidades

- Generación de embeddings densos de 1.024 dimensiones para recuperación semántica.
- Ranking de documentos de patente por relevancia frente a las reivindicaciones de una consulta.
- Búsqueda de anterioridades a partir de acciones de oficina (prior-art search).
- Búsqueda de invalidez a partir de consultas PTAB.
- Procesamiento de documentos largos: título, resumen, reivindicaciones y descripción hasta 8.192 tokens.
- Compatibilidad con sentence-transformers y text-embeddings-inference.
- Soporte de instrucciones en la consulta (los documentos no llevan instrucción).
- Integración con sistemas de fusión: pasajes, clasificación CPC y BM25.
- No dispone de tool calling, agentes, visión ni audio: es un modelo de extracción de características.

## Casos de uso

- Búsqueda de anterioridades para solicitudes de patente: se introduce título, resumen y reivindicaciones numeradas como consulta, y el modelo ordena familias de patentes anteriores por probabilidad de cita por parte de un examinador, lo que permite priorizar la revisión manual.
- Búsqueda de invalidez en litigios: con consultas del tipo PTAB, el modelo recupera documentos anteriores que pueden cuestionar la validez de una patente, con un R@10 de 0,586 en el benchmark.
- Triaje en departamentos de propiedad industrial: filtrar grandes volúmenes de patentes antes de un análisis humano, usando los vectores precalculados de la colección y consultas cortas.
- Construcción de un motor de búsqueda interno: desplegar el modelo con text-embeddings-inference para indexar el corpus de la organización y servir consultas con pooling de último token.
- Enriquecimiento de pipelines de examen asistido: combinar el ranking del modelo con BM25 y clasificación CPC mediante los pesos de fusión publicados en fusion-v1.json para mejorar la recuperación.
- Evaluación comparativa de sistemas de recuperación: usar prior-art-bench-v1 y el código público para medir R@10, R@100, R@1000 y nDCG@10 de alternativas sobre el mismo conjunto de 250.367 familias.
- Investigación académica en recuperación de dominio jurídico: analizar el efecto del fine-tuning sobre un encoder de 0,6 B en una tarea especializada con etiquetas de citas de examinador.

## Benchmarks y rendimiento

Resultados sobre prior-art-bench-v1, mitad de test puntuada una sola vez: 4.837 consultas, colección de 250.367 familias, solo documentos publicados antes de la fecha de prioridad, búsqueda exacta.

| Sistema | R@10 | R@100 | R@1000 | nDCG@10 | Prior-art R@10 (office actions) | Invalidity R@10 (PTAB) |
|---|---|---|---|---|---|---|
| BM25 | 0,326 | 0,584 | 0,820 | 0,249 | 0,306 | 0,346 |
| EmbeddingGemma 2 | 0,399 | 0,692 | 0,889 | 0,295 | 0,352 | 0,445 |
| PaECTER | 0,400 | 0,700 | 0,894 | 0,303 | 0,360 | 0,437 |
| Qwen3-Embedding-0.6B | 0,408 | 0,690 | 0,882 | 0,310 | 0,369 | 0,446 |
| Octen-Embedding-0.6B | 0,423 | 0,700 | 0,887 | 0,324 | 0,386 | 0,458 |
| harrier-oss-v1-0.6b (base, sin fine-tuning) | 0,451 | 0,737 | 0,906 | 0,346 | 0,410 | 0,490 |
| Qwen3-Embedding-0.6B fine-tuned (mismos datos, receta base, media de 3 semillas) | 0,499 | 0,771 | 0,922 | 0,386 | 0,465 | 0,531 |
| harrier-oss-v1-0.6b fine-tuned (receta base, media de 3 semillas) | 0,513 | 0,782 | 0,928 | 0,399 | 0,478 | 0,547 |
| Anticipate-0.6B | 0,538 | 0,796 | 0,932 | 0,416 | 0,488 | 0,586 |
| Sistema recomendado (modelo + pasajes + CPC + BM25) | 0,562 | 0,821 | 0,939 | 0,436 | 0,521 | 0,602 |

Diferencias pareadas en R@10 (puntos, intervalo bootstrap del 95 %): +8,7 (+7,9 a +9,6) sobre el modelo base; +13,0 (+12,0 a +14,0) sobre Qwen3-Embedding-0.6B; +21,2 (+20,0 a +22,3) sobre BM25; +2,5 (+1,8 a +3,2) sobre el fine-tune de harrier-oss-v1-0.6b con los mismos datos. El sistema recomendado añade +2,4 (+1,7 a +3,2) al modelo por sí solo.

## Requisitos de hardware

- Peso del repositorio: aproximadamente 1,2 GB en bf16, lo que corresponde a unos 0,6 B de parámetros.
- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño, cabe en GPUs de consumo con holgura en bf16 o fp16.
- El autor indica que funciona en Macs con Apple Silicon: probado en una muestra pequeña en un M1 de 8 GB y recomienda 16 GB para la verificación completa.
- Codificar una colección completa de 250.000 patentes de texto completo requiere GPU; el benchmark incluye vectores precalculados para evitar ese coste.
- Opciones de despliegue: sentence-transformers (verificado con sentence-transformers 6.3.0, transformers 5.23.0 y torch 2.15.0) y text-embeddings-inference.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | R@10 (benchmark) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anticipate-0.6B | 596 M | 4.096 (consulta) / 8.192 (documento) | 0,538 | Apache 2.0 | Hugging Face |
| harrier-oss-v1-0.6b (base) | 0,6 B (aprox.) | no disponible | 0,451 | no disponible | Hugging Face |
| Qwen3-Embedding-0.6B | 0,6 B (aprox.) | no disponible | 0,408 | no disponible | Hugging Face |
| Octen-Embedding-0.6B | 0,6 B (aprox.) | no disponible | 0,423 | no disponible | Hugging Face |
| PaECTER | no disponible | no disponible | 0,400 | no disponible | Hugging Face |

Los datos de contexto y licencia de los modelos comparables no figuran en la información proporcionada. La comparativa se limita al benchmark prior-art-bench-v1 del propio autor.

## Limitaciones y advertencias

- Solo inglés y solo documentos estadounidenses: no se entrenó ni evaluó con patentes de otras oficinas, literatura no patente ni otros idiomas; las anterioridades en japonés, chino, coreano o alemán quedan fuera de lo medido.
- Las citas de examinador son etiquetas incompletas: el recall mide la proporción de familias citadas encontradas, no la de todo el estado de la técnica relevante.
- Los resultados son de colección cerrada (250.367 familias); sobre el conjunto completo de 9,44 millones de familias de EE. UU. el recall será menor y no se midió.
- Los datos de entrenamiento del modelo base no se divulgan, por lo que no puede descartarse que haya visto las patentes de evaluación; su ventaja zero-shot es mayor en consultas PTAB.
- El prompt de invalidez no se usó en el entrenamiento.
- Es una ayuda a la recuperación, no una opinión legal: una búsqueda con este modelo no establece patentabilidad, validez ni libertad de operación.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Restricciones comerciales: la licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patentmechanics/anticipate-0.6b
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Dataset del benchmark: https://huggingface.co/datasets/patentmechanics/prior-art-bench-v1
- Código: https://github.com/patentmechanics/prior-art-bench
- Paper: https://doi.org/10.5281/zenodo.24394100
