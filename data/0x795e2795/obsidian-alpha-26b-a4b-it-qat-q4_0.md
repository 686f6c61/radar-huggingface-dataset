# 0x795E2795/Obsidian-Alpha-26B-A4B-it-qat-q4_0

## Resumen

Obsidian Alpha 26B-A4B-it es un modelo de lenguaje de tipo Mixture-of-Experts disperso (MoE) publicado por el usuario 0x795E2795 y afinado a partir de google/gemma-4-26B-A4B. El repositorio analizado contiene exclusivamente el checkpoint cuantizado en GGUF Q4_0, orientado a inferencia local ligera y a pruebas de compatibilidad con runtimes basados en GGUF (llama.cpp y derivados). Se trata de una release en estado alfa o experimental, con advertencia explícita por parte del autor de que pesos, configuración y comportamiento pueden cambiar en revisiones futuras.

El modelo declara 25.233.142.046 parámetros totales según los tensores del repositorio (la model card lo describe como "clase 26B") y aproximadamente 3,6 mil millones de parámetros activos por token, con 30 capas y 128 expertos enrutados con top-8. La longitud de contexto configurada es de 262.144 tokens, con una ventana de atención deslizante local de 1.024 tokens. El repositorio ocupa 15,5 GB en disco.

Su relevancia actual es doble: por un lado, cubre el hueco de modelos MoE de ~25B con pocos parámetros activos, un perfil que permite throughput alto a coste de memoria moderado; por otro, sirve como banco de pruebas para evaluar la retención de calidad tras cuantización Q4_0 frente a checkpoints W4A16 QAT del mismo modelo. No se han publicado todavía resultados de benchmarks y el soporte multilingüe declarado abarca 20 idiomas, entre ellos el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts disperso (MoE), transformer; 30 capas, 128 expertos, enrutado top-8 |
| Parametros totales | 25.233.142.046 (~25,2 B; la model card indica "clase 26B") |
| Parametros activos | ~3,6 B por token |
| Longitud de contexto | 262.144 tokens configurados; ventana de atención deslizante local de 1.024 tokens |
| Tipos de cuantizacion | Q4_0 (GGUF). La model card menciona que existen checkpoints nativos W4A16 QAT en otras distribuciones |
| Idiomas soportados | ko, en, zh, ja, fr, de, es, it, ru, ar, hi, pt, vi, th, id, nl, da, pl, tr (20 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 15,5 GB); el recuento de parámetros procede de los tensores safetensors publicados por la plataforma |
| Modelo base | google/gemma-4-26B-A4B (relación: finetune) |
| Estado de la release | Alfa / experimental |
| Ajustes de generación recomendados | temperature 1.225, top_p 0.95, top_k 64 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos dispersa: 30 capas, 128 expertos y enrutamiento top-8, lo que activa aproximadamente 3,6 B de los 25,2 B de parámetros en cada token. Esa dispersión es la que explica el perfil de despliegue: el coste de memoria viene determinado por los pesos totales (los 128 expertos deben residir en memoria o en disco), mientras que el coste de cómputo por token se acerca al de un modelo denso de ~3,6 B. El modelo incorpora además atención deslizante local con ventana de 1.024 tokens, un mecanismo habitual para contener el coste cuadrático en contextos muy largos. La model card no detalla dimensiones de atención (número de cabezas, dimensión de cabeza ni uso de GQA/MQA), por lo que no es posible calcular el tamaño exacto del KV-cache a partir de la información disponible.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre el proceso de destilación o ajuste de instrucciones aplicado por el autor del finetune. Tampoco se documentan innovaciones adicionales más allá del enrutamiento MoE y la ventana de atención deslizante. El único detalle técnico propio de esta release es la cuantización Q4_0 aplicada sobre el checkpoint afinado, cuyo efecto declarado es la pérdida de precisión numérica respecto a formatos de mayor resolución y la posible divergencia en trayectorias de generación largas incluso con prompts y parámetros idénticos. El autor ofrece este checkpoint como punto de comparación frente a sus releases W4A16 QAT.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado como text-generation y etiqueta conversational.
- Razonamiento e instrucciones generales: la release está etiquetada como "-it", lo que indica ajuste sobre instrucciones, aunque no se documenta el método de alineamiento empleado.
- Cobertura multilingüe declarada en 20 idiomas: coreano, inglés, chino, japonés, francés, alemán, español, italiano, ruso, árabe, hindi, portugués, vietnamita, tailandés, indonesio, neerlandés, danés, polaco y turco.
- Procesamiento de contexto largo: configuración de hasta 262.144 tokens con ventana deslizante de 1.024, aunque el propio autor advierte que el comportamiento en contextos muy largos sigue siendo experimental.
- Inferencia local y en CPU/GPU híbrida mediante llama.cpp, con offload parcial de capas a GPU (`-ngl`).
- Servicio vía API HTTP mediante `llama-server` en builds compatibles de llama.cpp.
- Compatibilidad con el ecosistema GGUF (etiquetas llama-cpp y endpoints_compatible).
- No se documentan capacidades de visión, audio, tool calling ni function calling en la información disponible.
- No se documentan modos explícitos de "thinking" ni decodificación especulativa.

## Casos de uso

- Inferencia local en estación de trabajo: cargar el fichero GGUF en llama.cpp con `-ngl 999` para descargar todas las capas en GPU permite ejecutar un modelo de ~25 B totales en hardware de gama alta de consumo, con un coste de cómputo por token cercano al de un modelo de ~3,6 B gracias al enrutamiento top-8.
- Asistente conversacional en castellano: con el idioma español incluido en la lista de lenguas soportadas, el modelo puede sostener diálogos multi-turno, aunque la ausencia de benchmarks publicados obliga a validar la calidad real en español antes de llevarlo a producción.
- Despliegue de bajo coste con CPU/GPU híbrida: el checkpoint Q4_0 está pensado para entornos sin GPU dedicada o con VRAM limitada, repartiendo capas entre CPU y GPU y ajustando `-c` y `-ngl` según la memoria disponible.
- Servicio interno autoalojado: `llama-server` expone el modelo como endpoint HTTP en un puerto local, lo que permite integrarlo en herramientas internas de generación de texto o resumen sin depender de APIs externas.
- Investigación en cuantización: el repositorio se presenta explícitamente como material para comparar Q4_0 frente a W4A16 QAT, midiendo precisión por tarea, número de respuestas que cambian de resultado y consistencia conductual.
- Pruebas de compatibilidad de runtimes: sirve para verificar que una versión concreta de llama.cpp u otro motor GGUF carga correctamente la configuración MoE, la ventana deslizante y el rango de contexto declarado.
- Evaluación multilingüe comparativa: al cubrir 20 idiomas, permite estudiar la degradación diferencial por lengua tras cuantización Q4_0 frente al checkpoint sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que la evaluación está en curso y que los resultados se publicarán una vez completada y verificada la batería de pruebas. Las áreas previstas de evaluación son conocimiento general, razonamiento, matemáticas, codificación, seguimiento de instrucciones, retención de calidad tras cuantización, comportamiento en contexto largo y consistencia conductual. El autor señala que los números preliminares o incompletos se han excluido deliberadamente.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Razonamiento | no disponible (evaluación en curso) |
| Retención tras cuantización Q4_0 | no disponible (evaluación en curso) |
| Contexto largo | no disponible (evaluación en curso) |

Tampoco se documentan métricas de latencia o throughput medidas.

## Requisitos de hardware

- Peso del repositorio: 15,5 GB. Los pesos en Q4_0 son el suelo de memoria necesario antes de añadir caché KV y buffers del runtime.
- Estimación orientativa de VRAM para inferencia (los pesos en Q4_0 ocupan en torno a 15-16 GB, por lo que hay que sumar caché KV y buffers de cómputo): alrededor de 20-24 GB con contexto de 8.192 tokens y offload completo; 32 GB o más para contextos de decenas de miles de tokens. Son estimaciones basadas en el tamaño del fichero, no mediciones del autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para contexto largo sin restricciones; RTX 4090 o RTX 3090 (24 GB) para offload completo con contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con contexto moderado; en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) requerirá offload parcial a CPU; por debajo de 12 GB lo razonable es un enfoque mayoritariamente de CPU.
- Inferencia solo CPU: posible en runtimes compatibles, con rendimiento fuertemente dependiente de la CPU y del ancho de banda de memoria del sistema.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier runtime compatible con GGUF (Ollama, LM Studio, koboldcpp, entre otros). El soporte en vLLM o TGI para GGUF no está documentado en la información disponible.
- Ajuste de contexto: la model card recomienda ajustar `-c` y `-ngl` al hardware; el contexto de 262.144 tokens configurado puede consumir mucha más memoria que los pesos por sí solos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparativa se establece con modelos MoE dispersos de tamaño y filosofía de despliegue comparables. Los datos del modelo analizado proceden de su propia model card; los de los comparadores, de información pública de sus respectivas fichas. No hay resultados de benchmarks del modelo analizado, por lo que la comparación de rendimiento no puede completarse.

| Modelo | Parametros totales / activos | Contexto | Expertos | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Obsidian Alpha 26B-A4B-it (este) | 25,2 B / ~3,6 B | 262.144 (ventana deslizante 1.024) | 128, top-8 | apache-2.0 | GGUF Q4_0 |
| Qwen3-30B-A3B | 30,5 B / 3,3 B | 32.768 nativo, ampliable | 128, top-8 | apache-2.0 | safetensors y múltiples cuantizaciones, incluido GGUF |
| Mixtral 8x7B instruct | 46,7 B / 12,9 B | 32.768 | 8, top-2 | apache-2.0 | safetensors y GGUF |
| Gemma 3 27B (denso) | 27 B densos | 128.000 | no aplica | licencia Gemma | safetensors y GGUF |

Observaciones: frente a Qwen3-30B-A3B, el modelo analizado declara un contexto configurado notablemente mayor, pero carece de benchmarks públicos que permitan comparar calidad. Frente a Mixtral 8x7B, activa muchos menos parámetros por token (~3,6 B frente a ~12,9 B), lo que se traduce en menor coste de cómputo por token. Frente a Gemma 3 27B denso, la ventaja es el coste de cómputo y la desventaja, el mayor consumo de memoria al tener que mantener 128 expertos. Comparación de rendimiento: no disponible.

## Limitaciones y advertencias

- Release en estado alfa: el autor advierte de que el comportamiento, la compatibilidad, el formato, la configuración y los pesos pueden cambiar en revisiones futuras. No es un artefacto estable para producción crítica.
- Ausencia total de benchmarks publicados: no hay datos verificables de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, lo que impide estimar la calidad real del modelo.
- Sin documentación del entrenamiento: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otro método de alineamiento. Tampoco se documentan sesgos conocidos.
- Ambigüedad en la nomenclatura: el identificador del repositorio incluye "qat" (quantization-aware training), pero la model card describe este checkpoint como GGUF Q4_0 y sitúa los checkpoints W4A16 QAT en otras distribuciones. Conviene verificar qué artefacto se está descargando realmente.
- Degradación por cuantización: Q4_0 es un formato de 4 bits de legado; el autor reconoce explícitamente que las salidas pueden diferir de las de checkpoints de mayor precisión y que pequeñas diferencias numéricas pueden alterar la trayectoria de generación en respuestas largas.
- Contexto largo experimental: el propio autor indica que el comportamiento en contextos muy largos sigue siendo experimental y que usar los 262.144 tokens puede requerir mucha más memoria que la necesaria para cargar los pesos.
- Riesgo de alucinación: no cuantificado ni documentado en la información disponible. Al tratarse de un modelo de ~3,6 B activos, es razonable esperar una fiabilidad inferior a la de modelos densos grandes, pero no hay datos que lo confirmen.
- Idiomas: la lista de 20 idiomas incluye el español, pero no hay ninguna evaluación por idioma publicada; la calidad relativa entre lenguas es desconocida.
- Licencia: apache-2.0 en este repositorio, lo que en principio permite uso comercial. No obstante, el modelo deriva de google/gemma-4-26B-A4B y no se detalla en la información proporcionada cómo interactúan los términos de la licencia del modelo base con los del finetune; conviene revisar la licencia del base antes de un uso comercial.
- Recuento de parámetros variable: la propia model card advierte de que las cifras pueden diferir entre librerías y plataformas según si se incluyen embeddings, parámetros auxiliares y componentes de enrutamiento.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/0x795E2795/Obsidian-Alpha-26B-A4B-it-qat-q4_0
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Búsqueda web: no se han encontrado resultados relevantes. Las consultas devolvieron únicamente páginas sobre el pintor Frank Auerbach (Wikipedia, Fitzwilliam Museum, Ben Brown Fine Arts, Jewish Renaissance, Christopher Kingzett Fine Art), sin ninguna relación con el modelo. No hay papers, blogs, repositorios ni demos adicionales que enlazar.
