# minjaechoi/qwen3p6-35b-a3b-2p02bit-r69

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) con 35.107.181.936 parámetros totales. Lo publica el usuario minjaechoi bajo el identificador interno r69 y su particularidad es que únicamente los expertos enrutados se almacenan con una precisión media de 2,0218 bits, mientras que el resto de los pesos permanece en BF16. El objetivo es reducir el coste de almacenamiento de la parte del modelo que más parámetros concentra sin degradar el resto de componentes.

El detalle técnico clave es que los pesos no se guardan comprimidos en un formato propietario ni en GGUF: se almacenan ya desnormalizados en tensores BF16, de modo que cargan con `transformers` y vLLM estándar sin necesidad de kernels personalizados ni de pasos previos de descompresión. Esto simplifica la integración, pero implica que el peso en disco y en memoria corresponde al de un modelo BF16 completo, como refleja el tamaño del repositorio (70,2 GB).

Es relevante ahora porque ejemplifica una línea de trabajo habitual en la comunidad: recomprimir únicamente los expertos enrutados de un MoE para explorar el límite de precisión aceptable, manteniendo intacto el camino de carga habitual. Al tratarse de un checkpoint interno de investigación, sin benchmarks publicados ni licencia explicitada en la ficha, su uso en producción requiere validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `qwen3_5_moe`); transformer con expertos enrutados |
| Parámetros totales | 35.107.181.936 (aprox. 35,1 B) |
| Parámetros activos | Aprox. 3 B, según la nomenclatura A3B del modelo base (no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,0218 bits de media; resto de pesos en BF16. Los pesos se almacenan desnormalizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que hereda la del modelo base, sin especificarla) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una variante cuantizada del modelo base Qwen/Qwen3.6-35B-A3B, que sigue un esquema de mezcla de expertos: una parte de los pesos corresponde a expertos enrutados que se activan de forma condicional por token, y el resto a componentes compartidos. La intervención del autor se limita a la precisión de almacenamiento de los expertos enrutados (2,0218 bits de media), que quedan guardados como tensores BF16 ya desnormalizados. No se modifica ni se reentrena el modelo base: no hay destilación, ajuste fino ni alineación adicional descritos en la información disponible.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, las etapas de RLHF/DPO ni posibles innovaciones de arquitectura más allá de la propia naturaleza MoE del modelo base. Tampoco se documentan los detalles del proceso de cuantización (algoritmo, tamaño de grupo, calibración) más allá del valor medio de bits por experto enrutado. La presencia de la etiqueta `image-text-to-text` sugiere capacidades multimodales heredadas del modelo base, pero este extremo no se detalla en la model card.

## Capacidades

- Generación de texto y conversación multi-turno, según la etiqueta `text-generation` y `conversational`.
- Posible procesamiento de imagen y texto (`image-text-to-text` en las etiquetas), sin detalle de resolución, número de imágenes o formato de entrada en la información disponible.
- El modelo base es un MoE con aproximadamente 3 B de parámetros activos, lo que en teoría reduce el coste por token frente a un denso de 35 B.
- Compatibilidad declarada con `transformers` y vLLM en su ruta de carga estándar.
- Soporte de tool calling, function calling, agentes, modo de razonamiento explícito u otras capacidades especiales: no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint permite medir empíricamente la pérdida de calidad al reducir los expertos enrutados a 2,0218 bits, comparando contra el modelo base en BF16 sobre la misma suite de evaluación.
- Servicio de inferencia conversacional con vLLM: al cargarse con la ruta estándar de vLLM, puede desplegarse como endpoint compatible con la API de OpenAI siempre que se disponga de los aproximadamente 70 GB de memoria necesarios.
- Experimentos de decodificación y perfilado: útil para medir latencia y throughput de un MoE con unos 3 B de parámetros activos frente a alternativas densas del mismo tamaño total.
- Generación de texto asistida en pipelines internos: su naturaleza de checkpoint de investigación lo hace apto para prototipos y pruebas de concepto, no para flujos con garantías de calidad.
- Evaluación comparativa de recetas de cuantización: sirve como punto de referencia frente a otras compresiones del mismo modelo base publicadas por la comunidad.
- Investigación multimodal exploratoria: la etiqueta `image-text-to-text` permite probar entradas de imagen y texto, aunque sin documentación de soporte oficial.
- Reproducción y auditoría de resultados: al ser un checkpoint con identificador interno (r69), es adecuado para reproducir experimentos y auditar la degradación introducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, MMLU-Pro, MT-Bench ni de evaluaciones multimodales, ni comparación numérica con el modelo base a distintas precisiones.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 70,2 GB, coherente con un modelo de 35,1 B de parámetros almacenado en BF16. La cuantización de los expertos no reduce la huella, porque los pesos se guardan ya desnormalizados en BF16.
- VRAM total necesaria: los 70,2 GB de pesos más la caché KV, cuyo tamaño depende de una longitud de contexto que no se especifica. En la práctica, se debe reservar margen por encima de los 70 GB.
- GPU recomendadas: una H100 de 80 GB o una A100 de 80 GB pueden alojar los pesos en una sola unidad si la caché KV y el contexto son moderados. Con A100 de 40 GB se necesitan al menos tres unidades (120 GB) para operar con holgura; dos unidades (80 GB) quedan al límite.
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB) ni en una RTX 3090 (24 GB). Se necesitarían al menos cuatro RTX 4090 (96 GB) con paralelismo tensorial, y la viabilidad depende del soporte de multi-GPU y de la caché KV.
- Opciones de despliegue: `transformers` y vLLM son las rutas declaradas por el autor. No se menciona compatibilidad con llama.cpp, Ollama, TGI ni ningún formato GGUF, y al no publicarse pesos en GGUF no es posible un despliegue directo en esas herramientas sin convertir previamente.
- Latencia y throughput: no disponible. Como referencia arquitectónica, un MoE con aproximadamente 3 B de parámetros activos tiene un coste de cómputo por token inferior al de un modelo denso de 35 B, pero el cuello de botella en este caso es la lectura de 70,2 GB de pesos por paso, lo que penaliza el throughput en configuraciones con poco ancho de banda de memoria.
- Cuantización adicional: no se documenta ninguna receta alternativa ni pesos ya cuantizados a 4 bits o 8 bits para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Precisión de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/qwen3p6-35b-a3b-2p02bit-r69 | 35.107.181.936 | Expertos enrutados a 2,0218 bits; resto BF16 (almacenado en BF16) | no disponible | no disponible | HuggingFace, 291 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35.107.181.936 (según el derivado) | BF16 | no disponible | no disponible | HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre otros checkpoints cuantizados del mismo modelo base ni sobre modelos MoE de tamaño comparable que permitan una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor lo etiqueta como "internal research checkpoint", sin garantías de calidad ni de estabilidad.
- Cuantización agresiva: 2,0218 bits de media en los expertos enrutados es un régimen muy bajo, con riesgo alto de degradación en razonamiento, código y matemáticas. No hay benchmarks publicados que cuantifiquen esa pérdida.
- Ausencia de benchmarks: no es posible verificar el rendimiento antes de desplegarlo; cualquier uso en producción exige una evaluación propia contra el modelo base.
- Licencia no explicitada: la model card indica que la licencia sigue la del modelo base, pero no se especifica cuál es. No se puede confirmar la viabilidad de uso comercial sin consultar la ficha del modelo base.
- Huella de memoria sin ahorro: pese a la cuantización de los expertos, los pesos se almacenan en BF16, de modo que el consumo (70,2 GB) es el de un modelo BF16 completo. La cuantización no aporta ventaja de memoria en este checkpoint.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de alineación ni evaluaciones de fidelidad, no puede descartarse ni acotarse.
- Sesgos: no disponible.
- Idiomas soportados: no disponible; no puede confirmarse el comportamiento en castellano ni en otros idiomas.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con requisitos de contexto largo.
- Compatibilidad de despliegue limitada: sin pesos GGUF, quedan descartadas herramientas como llama.cpp u Ollama salvo conversión manual, que no está documentada.
- Popularidad mínima: 291 descargas y 0 "likes" en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p02bit-r69
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo del autor: no disponible en la información proporcionada.
