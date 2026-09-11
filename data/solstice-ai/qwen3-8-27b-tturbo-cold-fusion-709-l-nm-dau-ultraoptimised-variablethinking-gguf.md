# Solstice-AI/Qwen3.8-27B-TTURBO-Cold-Fusion-709-L-NM-DAU-UltraOptimised-VariableThinking-GGUF

## Resumen

Este modelo es una cuantización GGUF publicada por Solstice-AI sobre el checkpoint afinado DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, que a su vez deriva de la familia Qwen3. Se distribuye con un total real de 26.895.998.464 parámetros (unos 26,9 mil millones) y un repositorio de 412,2 GB que agrupa múltiples cuantizaciones GGUF en dos familias (quants "regular" y quants "MTP"), además de variantes NEO y NEO MAX. La pipeline declarada en HuggingFace es image-text-to-text, aunque la model card no detalla ningún codificador de visión.

El modelo se presenta como un ajuste multi-etapa y multi-merge orientado a dos objetivos concretos: elevar la inteligencia general respecto al Qwen 3.8 27B original y reducir drásticamente el consumo de tokens de razonamiento (entre la mitad y una vigésima parte, según el autor), manteniendo el detalle de la respuesta. Para ello incorpora cinco modos de razonamiento y cinco modos instruct, conmutables en caliente vía API, de forma directa o dentro del propio chat, con la particularidad de que los modos instruct no consumen tokens de razonamiento.

Su relevancia actual es doble. Por un lado, apunta a hardware de consumo: el autor afirma que la versión de 4 bits alcanza 701 puntos ARC-C en modo instruct, lo que la situaría en el rango de modelos propietarios según su propia escala de medición. Por otro lado, forma parte de la línea "uncensored/abliterated/heretic" de la familia, lo que lo hace útil para investigación sobre alineación y generación creativa sin restricciones, pero también obliga a extremar las precauciones antes de usarlo en producción. Conviene señalar que el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación independiente de sus cifras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo derivado de la familia Qwen3; pipeline declarada: image-text-to-text) |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | No disponible (no se describe como MoE) |
| Longitud de contexto | No disponible para este repositorio |
| Tipos de cuantización | GGUF en dos familias: "Regular GGUF Quants" y "MTP GGUF Quants"; variantes NEO y NEO MAX; se cita Q4KS y el uso de imatrix |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (etiqueta bfloat16 presente en los tags) |
| Tamaño del repositorio | 412,2 GB |
| Modelo base | DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored |
| Datasets de ajuste | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets, DavidAU/THE-DECKARD-Datasets |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 11 de septiembre de 2026 |
| Última actualización | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de situarla en la familia Qwen3 y de declarar la pipeline image-text-to-text. El autor sí detalla el proceso de construcción: se trata de un ajuste fino multi-etapa, con múltiples ajustes finos y un merge multi-etapa posterior, ejecutado con Unsloth sobre el checkpoint de DavidAU. Los métodos de entrenamiento se denominan en la model card "Cold Fusion" y "Fable Fusion 711". Los datasets empleados son Polar-STRICT, F451-STRICT y THE-DECKARD, todos ellos publicados por DavidAU. No se especifica el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica que más se subraya es la gestión del presupuesto de razonamiento: el modelo aplica lo que el autor llama "VariableThinking", con cinco modos de razonamiento (incluidos dos nuevos, UltraXhigh y Einstein) y cinco modos instruct que no emiten tokens de razonamiento. Según la model card, los bloques de pensamiento se reducen entre la mitad y una vigésima parte respecto al Qwen 3.8 27B estándar, con una mediana de reducción de aproximadamente dos tercios, y además se reformatean. El repositorio incluye cuantizaciones MTP (multi-token prediction), pensadas para acelerar la generación de tokens, aunque no se documentan aquí los requisitos de runtime para aprovecharlas.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta explícita de conversational.
- Razonamiento en modo thinking, con cinco modos de razonamiento conmutables (incluidos UltraXhigh y Einstein).
- Cinco modos instruct que no generan tokens de razonamiento, también conmutables en caliente.
- Generación de código, según la etiqueta coder del repositorio.
- Escritura creativa, ficción, narrativa de todos los géneros y roleplaying, con etiquetas específicas para cada una.
- Capacidad declarada de mantener estructura narrativa y arcos de personaje a lo largo de textos largos, según los ejemplos de la model card.
- Multilingüe limitado a inglés y chino.
- Pipeline declarada image-text-to-text, sin detalle adicional en la documentación sobre el tratamiento de imágenes.
- Generación acelerada mediante cuantizaciones MTP (multi-token prediction).
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la información disponible.
- Capacidades de audio: no documentadas.

## Casos de uso

- Escritura creativa de formato largo: el modelo está afinado específicamente para narrativa y ficción, con etiquetas dedicadas a story, writing y all genres. Resulta adecuado para generar novelas por capítulos o relatos extensos porque el autor afirma que mantiene arcos de personaje y foreshadowing a lo largo de la obra, algo que suele degradarse en modelos genéricos.
- Roleplay y simulación de personajes: las etiquetas roleplaying y fiction indican un ajuste orientado a mantener voces y personalidades consistentes. Se usaría en motores de chat con personajes, con la ventaja de que los modos instruct permiten respuestas rápidas sin tokens de razonamiento visibles.
- Generación de código asistida: la etiqueta coder permite integrarlo en entornos de desarrollo local mediante GGUF, por ejemplo con llama.cpp o extensiones de editor, aprovechando que las cuantizaciones de 4 bits caben en GPU de consumo.
- Investigación sobre alineación y red teaming: al ser un modelo abliterated, uncensored y heretic, es útil como sujeto de estudio para medir qué comportamientos emergen al eliminar las capas de rechazo, y para comparar contra checkpoints alineados de la misma familia.
- Generación de datos sintéticos sin restricciones: para crear corpus de entrenamiento o evaluación en dominios donde los modelos alineados rechazan la petición (ficción adulta, diálogos conflictivos, escenarios de seguridad ofensiva en laboratorio), siempre que el usuario asuma la responsabilidad legal y ética.
- Despliegue local en hardware de consumo: con cuantizaciones GGUF de 4 bits, el modelo está pensado para ejecutarse en una única GPU de gama alta de consumo, lo que permite prototipar asistentes privados sin enviar datos a la nube.
- Optimización de coste en pipelines de razonamiento: la reducción declarada de tokens de pensamiento (mediana de dos tercios) implica menos tokens facturados por consulta en servicios de inferencia, lo que lo hace atractivo para aplicaciones con volumen alto y presupuesto ajustado.
- Control fino del esfuerzo de razonamiento por mensaje: la posibilidad de conmutar entre cinco modos de razonamiento y cinco modos instruct a nivel de chat permite usar el modo rápido para consultas triviales y el modo profundo para problemas complejos dentro de la misma sesión.

## Benchmarks y rendimiento

Los datos disponibles son afirmaciones del autor de la model card, no resultados verificados de forma independiente. Se presentan tal cual, con la salvedad de que la escala de ARC-C empleada no se corresponde con la métrica estándar de ARC-Challenge (expresada en porcentaje de acierto).

| Benchmark | Resultado declarado | Condiciones |
|---|---|---|
| ARC-C | 709 | Modo instruct, cuantización de 8 bits |
| ARC-C | 701 | Modo instruct, cuantización de 4 bits |
| ARC-C del modelo base Qwen 3.8 27B | 591 (deducido de la afirmación de "+118 puntos") | No especificado |
| Comparativa frente a Qwen 3.8 27B | Supera los 7 benchmarks críticos | Según el autor, tanto en 4 como en 8 bits |
| Comparativa frente a Qwen3.6-35B-A3B | Supera los 7 benchmarks | Según el autor |
| Comparativa frente a Qwen 3.6 27B | Supera los 7 benchmarks | Según el autor |
| Comparativa frente a Qwen 3.5 27B | Supera los 7 benchmarks | Según el autor |
| MMLU, HumanEval, GSM8K, ARC-E | No disponibles | No se publican cifras concretas en la información proporcionada |

El modelo hermano de la misma familia, Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised, declara 735 en ARC-C y 882 en ARC-E, así como un resultado de 9 de 9 frente a Claude Opus 4.6 Max en el arnés oficial de Claude Code. Son datos de otro checkpoint, no de este.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 26,9 B de parámetros, sin contar caché KV): ~54 GB en bfloat16, ~28-29 GB en Q8_0, ~18-19 GB en Q5_K_M, ~15-16 GB en Q4_K_M (se menciona explícitamente Q4KS en la model card) y ~12 GB en cuantizaciones de 3 bits.
- GPU recomendadas: para bfloat16 o Q8 se necesitan A100 80 GB, H100 80 GB o configuraciones multi-GPU con 2× RTX 3090/4090 (48 GB). Para Q4 y Q5 basta una única GPU de 24 GB.
- Compatibilidad con GPU de consumo: sí, en cuantizaciones de 4 y 5 bits sobre RTX 3090, RTX 4090, RTX 5090 o equivalentes con 24 GB de VRAM. En cuantizaciones de 3 bits o inferiores podría caber en GPU de 16 GB, con pérdida de calidad no cuantificada en la información disponible.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama, LM Studio y text-generation-webui. Las cuantizaciones MTP pueden requerir runtimes o bifurcaciones específicas con soporte de multi-token prediction; no se documenta cuáles en la información proporcionada.
- Latencia y throughput: no disponibles. El autor afirma que las cuantizaciones MTP aceleran la generación de tokens y que el modelo gasta menos tokens de razonamiento, pero no se publican tokens por segundo ni latencias medidas.
- Almacenamiento: el repositorio completo ocupa 412,2 GB, por lo que conviene descargar únicamente el fichero GGUF de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Solstice-AI, TTURBO Cold Fusion 709) | 26,9 B | No disponible | ARC-C 709 (8 bits) / 701 (4 bits), modo instruct | Apache 2.0 | GGUF en HuggingFace, 0 descargas |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (modelo base) | ~27 B | No disponible | ARC-C 709 según el autor | No disponible en la información proporcionada | HuggingFace |
| Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised | No disponible | No disponible | ARC-C 735, ARC-E 882; 9/9 frente a Claude Opus 4.6 Max | No disponible en la información proporcionada | GGUF en HuggingFace |
| Qwen3.6-35B-A3B | 35 B totales (A3B activos, MoE) | No disponible | Inferior a este modelo en los 7 benchmarks citados, según el autor | No disponible en la información proporcionada | No disponible |
| Qwen 3.6 27B | 27 B | No disponible | Inferior a este modelo en los 7 benchmarks citados, según el autor | No disponible en la información proporcionada | No disponible |
| Qwen 3.5 27B | 27 B | No disponible | Inferior a este modelo en los 7 benchmarks citados, según el autor | No disponible en la información proporcionada | No disponible |

## Limitaciones y advertencias

- Modelo abliterated, uncensored y heretic: las capas de rechazo han sido eliminadas o debilitadas deliberadamente. No es apto para aplicaciones orientadas al público sin un filtrado externo robusto.
- Riesgo elevado de contenido dañino, ofensivo o legalmente problemático en respuestas no filtradas, especialmente en dominios sensibles.
- Sesgos conocidos: no documentados en la información disponible. Al derivar de la familia Qwen3, hereda los sesgos de sus datos de entrenamiento, que tampoco se detallan.
- Riesgo de alucinación: no cuantificado. Los ejemplos de la model card son generaciones creativas, un escenario donde la veracidad factual no es el objetivo y por tanto no aporta evidencia sobre el comportamiento factual.
- Idiomas: solo inglés y chino. No hay soporte declarado de castellano, por lo que el rendimiento en español no está garantizado ni medido.
- Las cifras de benchmarks son afirmaciones del autor en una escala ARC-C no estándar (709, 701), sin metodología publicada ni verificación independiente. Deben tratarse como marketing hasta que se reproduzcan.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de uso comunitario ni de validación por terceros.
- Licencia Apache 2.0 declarada, pero la cadena de modelos base y datasets intermedios (DavidAU) debería verificarse antes de un uso comercial, ya que la información disponible no detalla las licencias de cada eslabón.
- La pipeline declarada es image-text-to-text, pero la model card no describe el codificador visual ni el formato de entrada de imagen. No se debe asumir capacidad multimodal real sin probarla.
- Las cuantizaciones MTP requieren soporte específico de runtime; usarlas en herramientas que no lo implementen puede degradar el rendimiento o provocar errores.
- Tamaño del repositorio (412,2 GB): riesgo operativo de ancho de banda y almacenamiento si se clona completo en lugar de descargar un único fichero.
- La fecha de publicación y actualización (11 de septiembre de 2026) es muy reciente, sin historial de mantenimiento ni de corrección de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TTURBO-Cold-Fusion-709-L-NM-DAU-UltraOptimised-VariableThinking-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Modelo hermano de la misma familia (ARC-C 735 / ARC-E 882): https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised
- Ficha de terceros sobre la variante AWQ de la familia: https://aimarketcap.tech/models/solstice-ai-qwen3-8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-awq
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset THE-DECKARD: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
