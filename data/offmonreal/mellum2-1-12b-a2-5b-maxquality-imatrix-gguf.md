# offmonreal/Mellum2.1-12B-A2.5B-MaxQuality-iMatrix-GGUF

, tool calling — the tags mention "agentic" and "code", but tool calling not explicitly stated. I should be careful. Tags: moe, thinking, code, agentic. The model is for "agentic coding, math and reasoning". I'll mention tool calling as "no confirmado explícitamente en la información disponible" — actually better to say the model card describes it as agentic coding; tool/function calling support not explicitly documented. Hmm, but launch uses --jinja which typically enables chat templates with tools. I'll be cautious: "Soporte de tool calling: no documentado explícitamente en la información disponible; el uso de --jinja permite plantillas de chat con herramientas, pero no se confirma."

Actually, to keep it clean, list capabilities based on evidence.

Let's write the ficha.

Benchmarks section: "No se han publicado resultados de benchmarks en la información disponible." But there is speed data — I can present the speed table (tokens/s) as performance data, clearly labeled as mediciones de velocidad, not benchmarks. That's good and rigorous.

Write now.

Casos de uso: minimum 6 concrete ones:
- Agente de codificación autónomo en local
- Par planner+executor en una sola GPU
- Asistente de refactorización sobre repos grandes (131K contexto)
- Generación de documentación / explicación de código
- Razonamiento matemático y resolución de problemas paso a paso con thinking
- Copiloto en IDE con privacidad total (local, sin envío de código)
- Revisión de PR / análisis estático asistido con contexto largo
- Sustitución de API en entornos con requisitos de soberanía de datos

Ok, write.

Context: 131072 native, 262144 experimental (2 slots of 131K at parallel 2).

Vocabulary BPW values given.

Let me produce the markdown.## Resumen

Mellum2.1-12B-A2.5B-MaxQuality-iMatrix-GGUF es una recopilación de cuantizaciones GGUF del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicada por el usuario offmonreal. Se trata de un modelo de lenguaje de arquitectura MoE (mixture of experts) con 12.149.923.072 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token, orientado a programación agéntica, matemáticas y razonamiento. El modelo original es un "thinking model": genera un bloque `<think>...</think>` antes de la respuesta final, lo que lo hace adecuado para tareas que requieren cadena de razonamiento explícita.

El repositorio no contiene un modelo nuevo, sino dos artefactos listos para inferencia local con llama.cpp: `Q4_K_M` (7,52 GiB, ~5,3 BPW) y `Q3_K_M` (5,89 GiB, ~4,2 BPW), ambos calibrados con una matriz de importancia (`imatrix-mellum21.dat`) y sin sobreescrituras manuales por tensor. El objetivo declarado es ofrecer perfiles de ejecución medidos en hardware real, con comandos de lanzamiento ajustados para aprovechar la naturaleza MoE del modelo y su ventana de contexto nativa de 131.072 tokens.

Su relevancia actual reside en que permite ejecutar un modelo de 12B totales con contexto nativo de 131K en una única GPU de consumo de 16 GB (RTX 5060 Ti) manteniendo el modelo completo en VRAM, con velocidades declaradas de ~177 tok/s en contexto corto y ~100 tok/s a 40K tokens para la variante Q4_K_M. La licencia Apache 2.0 facilita su uso comercial, aunque el repositorio tiene un nivel de validación comunitario muy bajo (0 descargas, 1 like en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida: SWA de 1024 tokens en 3 de cada 4 capas y atención completa cada 4ª capa |
| Parametros totales | 12.149.923.072 |
| Parametros activos | ~2,5B por token (64 expertos enrutados, 8 activados) |
| Longitud de contexto | 131.072 tokens nativos; 262.144 tokens en configuración experimental (2 slots de 131K con `--parallel 2`) |
| Tipos de cuantizacion | Q4_K_M (~5,3 BPW) y Q3_K_M (~4,2 BPW), ambas con iMatrix |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el checkpoint original del modelo base es bf16, aunque el formato exacto del repositorio de origen no se especifica en la información disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: 64 expertos enrutados de los que se activan 8 por token, lo que da una relación de activación aproximada de 2,5B sobre 12,1B parámetros totales. El mecanismo de atención es híbrido: 3 de cada 4 capas emplean sliding window attention con ventana de 1024 tokens y cada cuarta capa aplica atención completa. Esta combinación reduce el coste del KV cache en la mayor parte de la pila manteniendo acceso global periódico. La información disponible no detalla el número de capas, la dimensión oculta ni la configuración exacta del router.

Respecto al entrenamiento, no se dispone de datos sobre el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento: esta información pertenece al modelo base (JetBrains/Mellum2.1-12B-A2.5B-Thinking) y no se reproduce en la model card de esta cuantización. Lo que sí se documenta es el proceso de conversión y cuantización: conversión desde el checkpoint bf16 original con `convert_hf_to_gguf.py` estándar, sin cirugía arquitectónica para gestionar la atención híbrida, y cuantización con pipeline iMatrix usando `imatrix-mellum21.dat` como conjunto de calibración. El modelo original incorpora un modo de razonamiento explícito (bloques `<think>`), y la model card recomienda los parámetros de muestreo del autor original: `temperature=0.6`, `top_p=0.95`, `top_k=20`.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con modo thinking: emite un bloque `<think>...</think>` antes de la respuesta final, lo que permite inspeccionar la cadena de razonamiento.
- Generación y comprensión de código, con orientación explícita a flujos de trabajo agénticos de programación.
- Razonamiento matemático y resolución de problemas multi-paso.
- Operación como agente: la model card describe el modelo como "agentic coding" y los perfiles de despliegue documentados contemplan escenarios de dos agentes simultáneos (por ejemplo, planificador y ejecutor) sobre una sola GPU.
- Manejo de contexto largo: hasta 131.072 tokens nativos en una única secuencia, lo que permite procesar bases de código o historiales de conversación extensos.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible; el uso de `--jinja` habilita plantillas de chat compatibles con herramientas, pero no se confirma su funcionamiento.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Agente de codificación autónomo en local: con 131K tokens de contexto nativo y velocidades de ~100 tok/s a 40K tokens en Q4_K_M, el modelo puede mantener un bucle de edición-compilación-test sobre un repositorio mediano sin salir de una única GPU de 16 GB, evitando enviar código propietario a APIs externas.
- Pareja planificador + ejecutor en una sola tarjeta: el perfil `--parallel 2` divide la ventana en dos slots de 131K tokens y, según las mediciones del autor, cada agente mantiene ~100 tok/s operando con unos 5K tokens de contexto, lo que permite ejecutar dos roles agénticos concurrentes con ~10 GB de VRAM.
- Asistente de refactorización sobre bases de código grandes: la ventana nativa de 131K tokens permite cargar varios ficheros relacionados simultáneamente y razonar sobre dependencias cruzadas, usando el bloque `<think>` para explicitar el plan de refactorización antes de aplicar cambios.
- Generación de pruebas unitarias y documentación técnica: el modelo puede tomar una función o módulo como entrada y producir tests o documentación; su naturaleza de modelo de razonamiento ayuda a cubrir casos límite que un modelo puramente generativo tiende a omitir.
- Tutoría y resolución de problemas matemáticos paso a paso: el modo thinking expone el desarrollo del razonamiento, lo que resulta útil en entornos educativos o de verificación donde se necesita auditar el proceso, no solo el resultado.
- Revisión automatizada de pull requests en CI: integrado como servicio local en llama-server, el modelo puede analizar el diff más el contexto del fichero afectado y emitir comentarios; el coste marginal es nulo al ejecutarse en hardware propio.
- Copiloto de IDE con requisitos de soberanía de datos: al ser Apache 2.0 y ejecutarse íntegramente en local, encaja en organizaciones con restricciones regulatorias que impiden el envío de código a terceros.
- Despliegue en estaciones de trabajo con GPU modesta (6-8 GB): la configuración con expertos de las capas 14-27 en CPU permite ejecutar el modelo en tarjetas pequeñas, a costa del tráfico por PCIe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada, ni para esta cuantización ni para el modelo base dentro del material proporcionado. Los únicos datos de rendimiento disponibles son mediciones de velocidad de decodificación realizadas por el autor en su hardware:

| Variante | Velocidad de generación | Contexto máximo cómodo | Offload a CPU |
|---|---|---|---|
| Q4_K_M (AllGPU) | ~177 tok/s en contexto corto; ~100 tok/s a 40K tokens (mediana de 30 tareas de programación) | 131.072 nativo; 262.144 experimental | Ninguno; modelo completo en VRAM (~10,5 GB) |
| Q3_K_M (AllGPU) | ~130 tok/s a 40K tokens | 131.072 | Ninguno; modelo completo en VRAM (~9,3 GB) |
| Q3_K_M (6-8 GB VRAM) | No medido (la model card deja el dato pendiente de rellenar) | 131.072 | Expertos de los bloques 14-27 en CPU mediante `-ot` |

Hardware y software de las mediciones: Linux, NVIDIA GeForce RTX 5060 Ti de 16 GB, AMD Ryzen 9 5950X (16 núcleos / 32 hilos), 64 GB de RAM del sistema, fork `giveen/llama-cpp-turboquant` en el commit `8a891f4b`.

## Requisitos de hardware

- VRAM para Q4_K_M (7,52 GiB de pesos): aproximadamente 10,5 GB con el modelo completo en GPU y KV cache a 131K tokens de contexto. Cabe en tarjetas de 16 GB.
- VRAM para Q3_K_M (5,89 GiB de pesos): aproximadamente 9,3 GB con contexto nativo completo en VRAM. Orientado a tarjetas con algo menos de 9 GB libres.
- VRAM para Q3_K_M con reparto CPU/GPU: entre 6 y 8 GB, desplazando los expertos de las capas 14 a 27 a RAM del sistema mediante `-ot "blk\.(1[4-9]|2[0-7])\.ffn_.*_exps\.weight=CPU"`.
- GPU recomendadas: el autor valida una RTX 5060 Ti de 16 GB. Cualquier GPU con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090, RTX 5080, A100, H100) debería ejecutar los perfiles AllGPU con holgura; no hay mediciones publicadas para esas tarjetas.
- ¿Cabe en GPU de consumo? Sí. La variante Q4_K_M cabe íntegra en una GPU de 16 GB de consumo con contexto nativo completo; la variante Q3_K_M permite bajar a tarjetas de 6-8 GB aceptando offload parcial.
- Opciones de despliegue: `llama-server` de llama.cpp, concretamente el fork `giveen/llama-cpp-turboquant`, que aporta los tipos de caché `turbo3` y `turbo4` y el parser de razonamiento estilo qwen3. Se requiere `--jinja` para el formato de chat. No se documenta compatibilidad con vLLM, TGI, Ollama u otros runners en la información disponible.
- Recomendación operativa del autor: no usar decodificación especulativa; el modelo es más rápido sin ella. Para MoE, mantener el modelo completo en VRAM: en cuanto parte de los expertos cae a CPU, las idas y vueltas por PCIe dominan el tiempo por token.
- Latencias y throughput: ~177 tok/s en contexto corto y ~100 tok/s a 40K tokens con Q4_K_M; ~130 tok/s a 40K tokens con Q3_K_M. Con `--parallel 2`, cada uno de los dos slots mantiene ~100 tok/s operando a ~5K tokens de contexto.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos en la información disponible, por lo que no es posible establecer una comparación de rendimiento fiable con modelos alternativos. La única comparación documentada con cifras es entre las dos cuantizaciones de este mismo repositorio:

| Aspecto | Q4_K_M | Q3_K_M |
|---|---|---|
| Tamano | 7,52 GiB | 5,89 GiB |
| Bits por peso | ~5,3 BPW | ~4,2 BPW |
| VRAM aproximada con contexto completo | ~10,5 GB | ~9,3 GB |
| Velocidad a 40K de contexto | ~100 tok/s | ~130 tok/s |
| Publico objetivo | GPU de 16 GB con contexto nativo completo | GPU con menos VRAM; con offload de expertos, 6-8 GB |

Como referencia de categoría, el modelo base es JetBrains/Mellum2.1-12B-A2.5B-Thinking, un MoE de 12B totales y 2,5B activos con contexto de 131K orientado a programación agéntica. No se dispone de datos de rendimiento de terceros que permitan compararlo con alternativas equivalentes de otros fabricantes.

## Limitaciones y advertencias

- Riesgo de alucinación: no se documenta ninguna evaluación específica; como todo modelo de lenguaje generativo, puede producir código o referencias inexistentes, especialmente en APIs poco representadas en sus datos de entrenamiento.
- Idiomas: el modelo solo declara soporte de inglés. El uso en castellano u otros idiomas no está validado y probablemente degrade la calidad de forma notable.
- Sesgos conocidos: no hay información disponible sobre evaluaciones de sesgo, toxicidad o seguridad del modelo base ni de esta cuantización.
- Ausencia de benchmarks: no se han publicado resultados de MMLU, HumanEval, GSM8K ni similares, de modo que cualquier afirmación de calidad relativa carece de respaldo medido. Los únicos datos numéricos son de velocidad, no de precisión.
- Naturaleza del repositorio: no es una publicación oficial de JetBrains, sino una cuantización de terceros. Tiene un historial de validación mínimo (0 descargas y 1 like en el momento de la consulta) y no ha pasado por un proceso de revisión independiente.
- Degradación por cuantización: la cuantización a ~5,3 BPW y, sobre todo, a ~4,2 BPW introduce pérdida de precisión frente al checkpoint bf16 original. No se aportan mediciones del impacto en tareas de código o matemáticas.
- Dependencia de un fork: los perfiles recomendados usan tipos de caché KV específicos de `llama-cpp-turboquant` (`turbo3`, `turbo4`) que no existen en llama.cpp upstream. En otro runner habrá que sustituir estos parámetros y el rendimiento puede diferir.
- Requisito de plantilla de chat: sin `--jinja` y un parser de razonamiento estilo qwen3, los bloques `<think>` pueden filtrarse a la salida final.
- Rendimiento ligado al hardware: si los expertos se descargan a CPU, el rendimiento cae de forma acusada por el tráfico PCIe. Los perfiles con offload descritos por el autor no tienen mediciones completas publicadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia correspondientes. Conviene verificar la licencia del modelo base original antes de un despliegue en producción, ya que la model card no la reproduce íntegramente.
- Contexto extendido no nativo: la configuración de 262.144 tokens se describe como experimental y se implementa como dos slots paralelos de 131K, no como una única ventana ampliada.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/offmonreal/Mellum2.1-12B-A2.5B-MaxQuality-iMatrix-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Fork de llama.cpp utilizado y recomendado por el autor: https://github.com/giveen/llama-cpp-turboquant
- Página de apoyo del autor (Ko-fi): https://ko-fi.com/I0U227MY23
