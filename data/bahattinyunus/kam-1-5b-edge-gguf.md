# bahattinyunus/kam-1.5b-edge-gguf

## Resumen

KAM 1.5B Edge GGUF es una adaptación cuantizada en formato GGUF del modelo base KAM, un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) desarrollado por Bahattin Yunus Çetin (usuario `bahattinyunus`). Según la model card, el modelo se presenta como un "cerebro cognitivo autónomo" que combina la ontología chamánica de la estepa altái con conceptos de cibernética moderna, el principio de energía libre de Karl Friston, telemetría de núcleo eBPF de Linux y mutación JIT en memoria con C++20. Se trata de una propuesta conceptual y experimental más que de un modelo de producción convencional.

El modelo está construido, según los tags de Hugging Face, sobre las arquitecturas Qwen2.5 y DeepSeek-R1, aunque no se especifican detalles sobre el proceso de destilación, mezcla o ajuste fino. Su enfoque principal es el turco como idioma nativo, con soporte secundario de inglés, y una longitud de contexto declarada de 16.384 tokens. La distribución en formato GGUF con cuantizaciones de 4 y 8 bits está pensada para ejecución en CPU y GPU de consumo, y se ofrece integración directa con Ollama mediante el comando `ollama run hf.co/bahattinyunus/kam-1.5b-edge-gguf`.

La relevancia del modelo es limitada en el panorama actual: no cuenta con descargas ni likes en el momento de la consulta, no se han publicado resultados de benchmarks y la documentación mezcla terminología técnica con referencias culturales y filosóficas que dificultan una evaluación rigurosa. La licencia Apache 2.0 permite uso comercial, pero la ausencia de datos verificables sobre entrenamiento y rendimiento obliga a tratarlo como un experimento de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5 y DeepSeek-R1 según tags; detalles no disponibles) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | 4-bit y 8-bit (GGUF optimizado) |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,0 GB); se mencionan safetensors para el modelo base original |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna más allá de los tags que la asocian a Qwen2.5 y DeepSeek-R1. No se especifica si se trata de un transformer denso, una mezcla de expertos o un modelo híbrido, ni se documentan el número de capas, la dimensión oculta, el número de cabezas de atención ni el tipo de atención utilizado. Tampoco se detalla el proceso de entrenamiento: no hay información sobre el número de tokens, la composición del dataset, la existencia de RLHF, DPO u otras técnicas de alineación, ni sobre métodos de destilación o ajuste fino que justifiquen la combinación de las dos arquitecturas citadas.

La única innovación técnica mencionada de forma explícita es la integración conceptual del principio de energía libre de Friston y la minimización de entropía de Shannon como marco para la "inferencia activa", junto con referencias a telemetría eBPF y mutación JIT en C++20. No se aporta evidencia de que estas ideas se materialicen en mecanismos concretos dentro del modelo (por ejemplo, decodificación especulativa, atención lineal o módulos de memoria externa). La información disponible es insuficiente para evaluar la arquitectura y el entrenamiento con rigor.

## Capacidades

- Generación de texto conversacional en turco e inglés, con especial énfasis declarado en un turco "puro, fluido y literariamente rico", adaptado a la estructura SOV y a la fonética aglutinante.
- Razonamiento y respuesta a instrucciones en formato conversacional (pipeline `text-generation`, tag `conversational`).
- Capacidades asociadas a los modelos base citados (Qwen2.5 y DeepSeek-R1), que en sus versiones originales incluyen matemáticas, código y razonamiento; no se confirma qué parte de estas capacidades se conserva en KAM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card menciona "inferencia activa" y "sistemas autónomos" como concepto, sin especificar implementación.
- Capacidades multilingües: limitadas a turco e inglés según los metadatos.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), visión, audio ni otras modalidades.
- Integración con Ollama mediante `Modelfile` con parámetros recomendados: `temperature 0.5`, `top_p 0.90`, `repeat_penalty 1.18`, `num_ctx 16384`.

## Casos de uso

- Asistencia conversacional en turco para usuarios que necesitan respuestas con registro literario y corrección gramatical: el modelo declara un enfoque nativo en la estructura aglutinante y la fonética turca, lo que puede ser útil en aplicaciones de escritura, edición o tutoría lingüística.
- Despliegue en dispositivos de borde (edge computing) con recursos limitados: al ser un modelo de 1,5B en GGUF de 4 u 8 bits, puede ejecutarse en CPU o en GPU de consumo, lo que facilita su integración en entornos sin aceleradores dedicados.
- Prototipado rápido con Ollama: el comando de una línea y el `Modelfile` de ejemplo permiten poner en marcha un servicio de generación de texto en minutos, adecuado para pruebas de concepto y demos internas.
- Experimentación educativa sobre conceptos de cibernética y energía libre: el modelo se presenta como una implementación conceptual del marco de Friston, por lo que puede servir como material de estudio o discusión en cursos de sistemas autónomos, aunque sin garantías de rigor técnico.
- Generación de texto en inglés con contexto de hasta 16.384 tokens: útil para resúmenes o conversaciones multi-turno de longitud moderada en aplicaciones de documentación o atención al cliente de baja complejidad.
- Integración en pipelines de CI/CD para tareas de generación de texto auxiliar (por ejemplo, redacción de mensajes de commit o documentación): el tamaño reducido y la licencia Apache 2.0 facilitan su inclusión en herramientas internas, siempre con validación humana.
- Base para ajuste fino (fine-tuning) en turco: al partir de un modelo de 1,5B con licencia permisiva, puede servir como punto de partida para especializaciones en dominios concretos, aunque la falta de documentación sobre el entrenamiento original añade incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB en cuantización de 4 bits y 1,5-2,5 GB en 8 bits, considerando el tamaño del repo (1,0 GB) y el overhead de contexto (hasta 16.384 tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para 4 bits (por ejemplo, GTX 1650, RTX 3050); para 8 bits se recomienda al menos 6-8 GB (RTX 3060, RTX 4060).
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPU consumer modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: Ollama (soporte explícito documentado), llama.cpp (formato GGUF), y potencialmente otros runners compatibles con GGUF como LM Studio o KoboldCpp; no se documenta soporte para vLLM ni TGI, que suelen requerir pesos en safetensors.
- Latencia y throughput estimados: no disponibles; no se proporcionan mediciones de tokens por segundo ni de latencia en ningún hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| KAM 1.5B Edge GGUF | ~1,5B | 16.384 | Apache 2.0 | GGUF | Hugging Face, Ollama |
| Qwen2.5-1.5B | ~1,5B | 32.768 (versión Instruct) | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | 32.768 | MIT | safetensors, GGUF | Hugging Face, Ollama |
| Llama 3.2 1B | ~1,2B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se basa en datos públicos de los modelos alternativos; para KAM no se dispone de benchmarks que permitan comparar rendimiento real. Qwen2.5-1.5B y DeepSeek-R1-Distill-Qwen-1.5B son los parientes arquitectónicos más directos según los tags del modelo, con contextos superiores y documentación técnica completa. Llama 3.2 1B ofrece un contexto mucho mayor pero con licencia restrictiva para uso comercial a gran escala.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar el rendimiento del modelo en tareas estándar (MMLU, HumanEval, GSM8K, etc.) ni compararlo objetivamente con alternativas.
- Documentación insuficiente: la model card mezcla conceptos técnicos con referencias culturales y filosóficas, y no detalla arquitectura, datos de entrenamiento ni proceso de alineación.
- Riesgo elevado de alucinación: al ser un modelo pequeño (1,5B) sin datos de evaluación, es probable que genere información incorrecta con fluidez, especialmente en dominios especializados.
- Sesgos conocidos: no documentados; los modelos entrenados predominantemente en turco e inglés pueden presentar sesgos culturales y lingüísticos no evaluados.
- Limitaciones de idioma: solo turco e inglés; no se garantiza un rendimiento aceptable en castellano ni en otras lenguas.
- Limitación de contexto: 16.384 tokens, inferior al de modelos comparables de la misma familia (Qwen2.5 y DeepSeek-R1-Distill ofrecen 32.768).
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el cumplimiento normativo y la calidad del resultado, dado que no hay garantías del autor.
- Caveat para producción: la falta de métricas, de historial de descargas y de mantenimiento documentado desaconseja su uso en sistemas críticos sin una evaluación exhaustiva previa.
- Posible confusión en la nomenclatura: el título de la model card menciona "kam:7b GGUF" mientras que el repositorio y los parámetros reales corresponden a 1,5B; esta inconsistencia debe tenerse en cuenta al integrar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/bahattinyunus/kam-1.5b-edge-gguf
- GitHub del autor: https://github.com/bahattinyunus/kam
- Perfil del autor: https://github.com/bahattinyunus
- Repositorio base Qwen2.5 (referencia arquitectónica): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio base DeepSeek-R1-Distill-Qwen-1.5B (referencia arquitectónica): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Documentación de Ollama: https://ollama.com
