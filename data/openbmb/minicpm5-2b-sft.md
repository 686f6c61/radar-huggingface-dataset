# openbmb/MiniCPM5-2B-SFT

## Resumen

MiniCPM5-2B-SFT es la versión afinada con supervisión (SFT) del modelo denso MiniCPM5-2B, desarrollado por OpenBMB (ModelBest y Universidad de Tsinghua). Se trata del segundo modelo de la familia MiniCPM5, tras el MiniCPM5-1B, y reutiliza la misma receta de entrenamiento escalada a 2.500 millones de parámetros. Su objetivo es ofrecer un modelo de clase 2B competitivo para despliegue local, en dispositivo y en entornos con recursos limitados.

El modelo es un transformer denso con tokenizador y arquitectura de estilo Llama, publicado en formato safetensors y compatible con transformers y text-generation-inference. Está orientado explícitamente a contexto largo, tool calling, tareas agénticas y conversación, y solo declara soporte para inglés y chino. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

Su relevancia actual radica en la relación capacidad/tamaño: el autor lo sitúa como SOTA de código abierto en la clase 2B y lo compara con modelos de 4B en tareas de código, matemáticas, comprensión de contexto largo, uso de herramientas y agentes. Con 2.516.756.480 parámetros reales y un repositorio de 5,0 GB, es un candidato realista para inferencia en GPU de consumo y hardware edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Llama) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo se etiqueta como long-context, sin cifra publicada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF oficial en la informacion disponible) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniCPM5-2B es un transformer denso de 2.500 millones de parámetros que escala la receta de entrenamiento del MiniCPM5-1B. La model card lo describe como un transformer denso de clase 2B orientado a despliegue en dispositivo, con etiquetas que confirman arquitectura tipo Llama, soporte de contexto largo y tool calling. No se detalla en la información disponible el número de capas, dimensión oculta, cabezas de atención ni el mecanismo exacto de extensión de contexto.

El entrenamiento combina varios datasets propios de OpenBMB: Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de datasets específicos de SFT y de agentes, junto con un conjunto de RL, indica un pipeline de preentrenamiento seguido de ajuste supervisado y, presumiblemente, optimización por refuerzo, aunque la model card no especifica la composición exacta ni el número de tokens. La variante publicada es la SFT, por lo que existe una etapa posterior de RL documentada solo a nivel de datos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento general y conocimiento factual, con rendimiento declarado competitivo frente a modelos de 4B.
- Razonamiento de código y generación de código, área destacada por el autor en la comparativa de capacidades.
- Razonamiento matemático, apoyado en el dataset UltraData-Math.
- Comprensión de contexto largo, con la etiqueta long-context y un eje específico en el radar de capacidades del autor.
- Tool calling y function calling, con dataset dedicado UltraData-SFT-Agent-2609.
- Tareas agénticas y razonamiento multi-paso, incluidas en la comparativa de capacidades.
- Seguimiento de instrucciones, evaluado como dimensión independiente en el radar del autor.
- Despliegue en dispositivo y edge, con etiquetas on-device y edge-ai.
- No se declaran capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistente conversacional local en dispositivo: con 2,5B parámetros puede ejecutarse en portátiles y equipos de gama media, gestionando diálogos multi-turno sin depender de la nube y con la ventana de contexto extendida que el autor promociona para contexto largo.
- Agente con tool calling en flujos de automatización: el entrenamiento con UltraData-SFT-Agent-2609 y la etiqueta tool-calling lo hacen adecuado para orquestar llamadas a APIs, consultas a bases de datos y ejecución de acciones encadenadas en pipelines internos.
- Generación y revisión de código en entornos con recursos limitados: puede integrarse en editores o pre-commit hooks para autocompletado, explicación de fragmentos y generación de tests, donde un modelo de 2B reduce coste y latencia frente a alternativas de 7B o superiores.
- Procesamiento de documentos largos en inglés o chino: resumen, extracción de entidades y respuesta a preguntas sobre contratos, informes o documentación técnica, aprovechando la orientación a contexto largo del modelo.
- Tutoría y resolución de problemas matemáticos: útil en aplicaciones educativas que necesitan explicaciones paso a paso y verificación de resultados, apoyándose en el entrenamiento con UltraData-Math.
- Filtrado y clasificación de contenido en producción: moderación, etiquetado y enrutamiento de tickets o mensajes, donde el coste por token y la posibilidad de ejecución on-premise son determinantes.
- Despliegue en edge para asistentes de dispositivos: integración en equipos con GPU integrada o NPU, con inferencia local que evita enviar datos sensibles fuera del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un gráfico radar de capacidades por dimensión (Code Reasoning, Math Reasoning, Instruction Following, General Knowledge, Long Context, Tool Use) normalizado al 100 %, pero no proporciona los valores numéricos subyacentes ni resultados de MMLU, HumanEval, GSM8K u otros conjuntos estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5 GB solo para pesos, más memoria para KV cache y activaciones; en la práctica, 8-10 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5-3 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,3-1,5 GB para pesos, más overhead; cabe en GPU de consumo con 4-6 GB.
- GPU recomendadas para producción: A100, H100 o L40S para alto throughput y contextos largos; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y despliegue de baja concurrencia.
- GPU de consumo: sí cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores; en 4 bits es viable incluso en GPUs de 6-8 GB.
- Opciones de despliegue: transformers, text-generation-inference (el modelo está etiquetado como compatible con endpoints y TGI); vLLM, llama.cpp y Ollama son opciones habituales para este tamaño, aunque no se confirman oficialmente en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado cifras de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM5-2B-SFT | 2,52B | no disponible (long-context) | Apache 2.0 | SOTA declarado en clase 2B por el autor; competitivo con modelos de 4B |
| MiniCPM5-1B | no disponible en esta ficha | no disponible | no disponible en esta ficha | Modelo previo de la misma familia; misma receta de entrenamiento a menor escala |
| Modelos de clase 4B | ~4B | variable | variable | El autor afirma que MiniCPM5-2B es competitivo con esta clase, sin especificar qué modelos |

No se dispone de datos numéricos de benchmarks ni de especificaciones detalladas de los modelos comparados en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse principalmente con datos en inglés y chino, puede presentar sesgos culturales y lingüísticos propios de esas fuentes.
- Riesgo de alucinación: inherente a los modelos generativos de 2B parámetros; la menor capacidad de parametrización aumenta el riesgo en conocimiento factual frente a modelos mayores.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Limitaciones de contexto: la ventana máxima no se publica; no debe asumirse un valor concreto sin verificación empírica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican cláusulas adicionales.
- Caveats para producción: al ser una variante SFT, puede existir una versión posterior con RL (UltraData-RL-2609) con comportamiento distinto; conviene evaluar la variante exacta antes de desplegar.
- No se declaran capacidades multimodales; no debe usarse para tareas de visión o audio.
- Ausencia de benchmarks publicados: la afirmación de SOTA de clase 2B proviene del autor y no está respaldada por tablas numéricas verificables en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B-SFT
- Modelo base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Informe técnico MiniCPM (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- Segundo paper referenciado (arXiv 2602.09003): https://arxiv.org/abs/2602.09003
- Documentación MiniCPM Wiki (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
