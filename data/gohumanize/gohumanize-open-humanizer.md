# gohumanize/gohumanize-open-humanizer

## Resumen

GoHumanize Open Humanizer es un modelo de generación de texto especializado en reescritura estilística: recibe prosa inglesa con marcas típicas de texto generado por IA y la reformula para que se lea como escritura humana. Lo desarrolla el equipo de GoHumanize.ai y se distribuye como un ajuste fino QLoRA del modelo denso Qwen3-4B, con 4.022.468.096 parámetros totales (~4,02 B) y licencia Apache-2.0.

El interés del proyecto es doble. Por un lado, es un modelo funcional y ligero, ejecutable en GPU de consumo y con builds GGUF para Ollama, LM Studio y llama.cpp. Por otro, es un artefacto de investigación reproducible: el autor publica el dataset de 2.200 pares (CC-BY 4.0), el código del pipeline completo, el registro de entrenamiento en Weights & Biases, un DOI citable en Zenodo y un informe técnico paso a paso. Esto lo convierte en una referencia útil para estudiar transferencia de estilo con presupuesto mínimo.

La relevancia actual viene de su nicho: la "humanización" de texto es una tarea con mucha demanda comercial y muy poca transparencia técnica. Este modelo no compite con los sistemas de producción de GoHumanize.ai ni hace afirmaciones sobre detectores de IA; se presenta explícitamente como demostración educativa del método (preparación de datos, construcción de pares, ajuste fino y evaluación). El entrenamiento se hizo sobre prosa de dominio público anterior a 1929 procedente de Project Gutenberg.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) con ajuste fino QLoRA; sin mezcla de expertos |
| Parámetros totales | 4.022.468.096 (~4,02 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el entrenamiento usó secuencias de 1.024 tokens como máximo. El modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantización | Build GGUF incluido en `gguf/`; los niveles concretos no se detallan en la información disponible. Compatible con Ollama, LM Studio y llama.cpp |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados en 16 bits como archivos principales), adaptador LoRA en `lora/`, GGUF en `gguf/` |
| Modelo base | Qwen/Qwen3-4B |
| Tamaño del repositorio | 14,9 GB |
| Descargas y likes | 442 descargas, 1 like |
| Fecha de creación / actualización | 18 de septiembre de 2026 / 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B: un transformer decoder-only denso de ~4 B de parámetros. Sobre él se aplicó un ajuste fino QLoRA con Unsloth, con la base cuantizada a 4 bits, rango LoRA 16, alpha 32 y adaptadores en todas las proyecciones de atención y de MLP. La pérdida se calculó únicamente sobre los tokens del asistente (el objetivo humano), no sobre el prompt ni sobre el texto de entrada en estilo IA.

Los datos de entrenamiento son 2.000 pares de (pasaje con estilo IA, original humano) más 200 pares de test, construidos a partir de libros de dominio público de Project Gutenberg. El conjunto completo, 2.200 pares, está publicado con licencia CC-BY 4.0. La transformación del texto fuente en pares de entrenamiento es una parte central del pipeline documentado por el autor.

La configuración del ajuste fue: 2 épocas (250 pasos), tasa de aprendizaje 2e-4 con decaimiento coseno, batch efectivo 16 y longitud máxima de 1.024 tokens. Se ejecutó en una única NVIDIA A10G de 24 GB sobre Modal y tardó 21,7 minutos. Las pérdidas finales fueron 1,30 en entrenamiento y 1,39 en evaluación, partiendo de 3,17 antes de entrenar. El uso previsto es en formato chat con el modo de razonamiento (*thinking*) desactivado mediante `enable_thinking=False`, y con un *system prompt* fijo que define la tarea de reescritura.

## Capacidades

- Reescritura de texto en inglés con transferencia de estilo: convierte prosa con marcas de IA en texto de ritmo más variado y vocabulario concreto.
- Conservación de contenido: mantiene el significado, los hechos y el orden de las ideas del texto de entrada, con una puntuación BERTScore F1 de 0,921 frente al original humano.
- Variación de longitud de frase y ritmo: produce una media de 22,5 palabras por frase, frente a 15,2 del modelo base y 28,1 del objetivo humano.
- Conversión de registro: reduce marcadores de estilo IA (0,00 frases hechas tipo LLM por texto, 0,106 palabras de transición por 100 palabras) frente al modelo base (0,01 y 0,023 respectivamente).
- Preservación de nombres y tokens capitalizados: recall de 0,623 frente a 0,594 del modelo base.
- Formato conversacional mediante plantilla de chat, con modo de razonamiento desactivado.
- Reescritura de pasajes de entre 80 y 300 palabras; documentos largos se procesan párrafo a párrafo.
- Integración como herramienta externa: servidor MCP para asistentes de IA y cliente Python/CLI.
- No soporta *tool calling* ni razonamiento multi-paso como capacidades nativas declaradas; tampoco visión ni audio.
- Multilingüe: no, solo inglés.

## Casos de uso

- Post-edición de contenido editorial: un blog o medio reescribe automáticamente borradores generados con IA antes de publicarlos, procesando párrafo a párrafo y manteniendo la estructura argumental gracias a la preservación de nombres y del orden de ideas.
- Limpieza de corpus sintéticos: un equipo que genere datos de entrenamiento con LLM puede pasar cada muestra por este modelo para reducir expresiones repetitivas y frases hechas, disminuyendo la homogeneidad estadística del corpus resultante.
- Integración en asistentes de escritura vía MCP: el servidor `npx gohumanize-open-humanizer-mcp` permite que un agente o IDE invoque la reescritura como herramienta, sin reentrenar ni cambiar el modelo principal del asistente.
- Tuberías de contenido en CI/CD: el cliente `pip install gohumanize-open-humanizer` permite automatizar la revisión estilística de textos en repositorios de documentación o plantillas de marketing como paso previo a la publicación.
- Estilización literaria y ficción: dado su entrenamiento con prosa anterior a 1929, encaja en proyectos que busquen deliberadamente un registro literario clásico, por ejemplo adaptaciones o ejercicios creativos.
- Investigación en transferencia de estilo: el dataset de 2.200 pares, el código del pipeline, las curvas de pérdida y el informe técnico permiten reproducir el experimento completo y usarlo como línea base en trabajos académicos.
- Generación de variantes para test A/B: producir varias redacciones con el mismo contenido factual permite comparar tasas de conversión o de lectura sin alterar la información del mensaje.
- Demostraciones y docencia: el coste de despliegue (una GPU de 24 GB para el entrenamiento y hardware de consumo para inferencia) lo hace viable para talleres prácticos sobre ajuste fino con QLoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación publicada compara la entrada en estilo IA, el Qwen3-4B base y este modelo contra el original humano en 200 pares reservados:

| Medida (200 pares reservados) | Entrada estilo IA | Qwen3-4B base | Open Humanizer | Objetivo humano |
|---|---|---|---|---|
| BERTScore F1 frente a humano (más alto = significado más cercano) | 0,914 | 0,900 | 0,921 | — |
| ROUGE-L frente a humano (más alto = redacción más cercana) | 0,493 | 0,424 | 0,540 | — |
| Nombres/tokens capitalizados conservados (recall) | 0,587 | 0,594 | 0,623 | — |
| Ratio de longitud frente a humano | 1,027 | 0,830 | 0,928 | 1,000 |
| Contracciones por 100 palabras | 0,279 | 0,772 | 0,044 | 0,118 |
| Palabras de transición por 100 palabras | 0,757 | 0,023 | 0,106 | 0,143 |
| Frases hechas de LLM por texto | 0,19 | 0,01 | 0,00 | 0,00 |
| Longitud media de frase (palabras) | 21,6 | 15,2 | 22,5 | 28,1 |

Estas métricas miden el desplazamiento desde la prosa estilo IA hacia el objetivo humano; el propio autor advierte que no son puntuaciones de detectores. El modelo mejora al base en BERTScore, ROUGE-L, conservación de nombres y control de frases hechas, pero se queda corto en contracciones (0,044 frente a 0,118 del objetivo humano) y en longitud media de frase (22,5 frente a 28,1).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 8 GB solo para pesos, más caché KV; ~10-12 GB en la práctica.
- VRAM estimada con cuantización de 8 bits: ~4,5-5 GB.
- VRAM estimada con cuantización de 4 bits (GGUF Q4): ~2,5-3,5 GB.
- GPU recomendadas: A10G, L4, A100, H100 para servicio; RTX 4090, 4080, 4070 Ti, 3090 para uso local sin cuantizar.
- Cabe en GPU de consumo: sí. Con bf16 en tarjetas de 12 GB o más (RTX 3060 12 GB, 4070, 4070 Ti, 3090, 4090); con cuantización GGUF Q4 en tarjetas de 6-8 GB.
- Hardware de entrenamiento de referencia: 1x NVIDIA A10G de 24 GB en Modal, 21,7 minutos.
- Opciones de despliegue: transformers, Text Generation Inference (el repo incluye la etiqueta `text-generation-inference` y es compatible con endpoints), vLLM, llama.cpp, Ollama y LM Studio mediante los builds GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota de configuración: usar chat template con `enable_thinking=False` y el *system prompt* de entrenamiento para obtener el comportamiento esperado.

## Comparativa con modelos similares

No hay datos publicados que permitan comparar este modelo con otros sistemas de humanización de texto abiertos. La única comparación con cifras verificables es contra su propio modelo base, incluida en la evaluación de la model card:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en la evaluación |
|---|---|---|---|---|---|
| GoHumanize Open Humanizer | 4,02 B (denso) | No especificado; entrenado a 1.024 tokens | Apache-2.0 | HuggingFace: safetensors, adaptador LoRA y GGUF | BERTScore 0,921; ROUGE-L 0,540; frases hechas LLM 0,00 |
| Qwen3-4B (base) | 4,02 B (denso) | 32.768 tokens nativos (sin especificar en la ficha de este modelo) | Apache-2.0 | HuggingFace | BERTScore 0,900; ROUGE-L 0,424; frases hechas LLM 0,01 |
| Otros humanizadores abiertos con evaluación comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

Frente a otras alternativas de la misma familia Qwen3 de mayor tamaño (8B, 14B, 32B), este modelo no publica comparativas de calidad, coste ni latencia, por lo que la elección entre ellos queda supeditada a prueba propia.

## Limitaciones y advertencias

- Los objetivos humanos del entrenamiento son prosa anterior a 1929, de modo que el modelo tiende a un registro literario y ligeramente anticuado; puede no encajar en contextos técnicos, periodísticos o corporativos actuales.
- Está entrenado sobre pasajes de 80 a 300 palabras. Para documentos largos hay que reescribir párrafo a párrafo, lo que puede romper la coherencia global del texto.
- Solo inglés. No se ha entrenado ni evaluado en otros idiomas.
- Puede eliminar o alterar detalles en entradas alejadas de su distribución de entrenamiento; el propio autor recomienda verificar los hechos de la salida. El recall de nombres capitalizados es 0,623, es decir, pierde aproximadamente un 38 % de las entidades capitalizadas respecto al original humano.
- El modelo no hace ninguna afirmación sobre detectores de IA. La evaluación publicada mide proximidad al texto humano, no evasión de detección; usarlo con ese fin no está respaldado por los datos disponibles.
- Es una demostración educativa y de investigación, separada de los modelos de producción de GoHumanize.ai, sin garantías de rendimiento en producción.
- Licencia Apache-2.0, que permite uso comercial y modificación, siempre con las obligaciones habituales de atribución y conservación del aviso de licencia. El dataset asociado es CC-BY 4.0, con sus propias condiciones de atribución.
- Riesgo de alucinación bajo, dado que la tarea es de reescritura y no de generación libre, pero existe riesgo de omisión o deformación de contenido, especialmente con entradas fuera de distribución.
- Sesgos no documentados en la información disponible: el corpus de origen es prosa literaria de dominio público, predominantemente occidental y anterior a 1929, lo que puede arrastrar sesgos de época en vocabulario y registro.
- No se han publicado evaluaciones en benchmarks estándar de capacidades generales, por lo que se desconoce en qué medida el ajuste degrada las capacidades del Qwen3-4B original fuera de la tarea de reescritura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gohumanize/gohumanize-open-humanizer
- Dataset, 2.200 pares (CC-BY 4.0): https://huggingface.co/datasets/gohumanize/gohumanize-open-humanizer-dataset
- Página del proyecto y demo en navegador: https://gohumanize.ai/open-model
- Código y pipeline completo: https://github.com/GoHumanize-ai/gohumanize-open-humanizer
- Informe técnico paso a paso (`docs/paper.md`): https://github.com/GoHumanize-ai/gohumanize-open-humanizer/blob/main/docs/paper.md
- Release archivada con DOI citable: https://doi.org/10.5281/zenodo.22843083
- Cliente Python y CLI: https://pypi.org/project/gohumanize-open-humanizer/
- Servidor MCP para asistentes de IA: https://www.npmjs.com/package/gohumanize-open-humanizer-mcp
- Código del servidor MCP: https://github.com/GoHumanize-ai/gohumanize-open-humanizer-mcp
- Registro de entrenamiento, curvas de pérdida y configuración en Weights & Biases: https://wandb.ai/gohumanize/gohumanize-open-humanizer/runs/95wi8tdg
