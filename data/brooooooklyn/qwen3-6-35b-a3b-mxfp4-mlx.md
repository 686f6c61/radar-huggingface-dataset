# Brooooooklyn/Qwen3.6-35B-A3B-mxfp4-mlx

## Resumen

Qwen3.6-35B-A3B-mxfp4-mlx es una conversión cuantizada del modelo Qwen3.6-35B-A3B de Alibaba, adaptada para el ecosistema Apple MLX mediante la librería mlx-node. El autor, Brooooooklyn, ha aplicado una receta de cuantización por clases de tensores inspirada en la versión NVFP4 de Unsloth, traduciéndola al formato MXFP4/MXFP8 con escalado de bloque. El resultado es un modelo de 35.951.822.704 parámetros totales, de los cuales solo 3.000 millones se activan por token gracias a su arquitectura MoE, lo que permite ejecutarlo en hardware de consumo con una huella de memoria reducida.

Esta conversión es relevante porque democratiza el acceso a un modelo multimodal de última generación en dispositivos Apple Silicon, donde las opciones de cuantización eficientes son escasas. La receta emplea MXFP4 para la mayoría de los expertos del MoE y MXFP8 para las capas finales, atención y proyecciones, manteniendo en BF16 los componentes de visión, MTP y embeddings. El modelo conserva el pipeline image-text-to-text del original, aunque solo se ha verificado la generación de texto en esta versión.

Al estar basado en Qwen3.6, hereda las capacidades del modelo base: razonamiento, generación de código, matemáticas, soporte multilingüe y visión. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para desarrolladores que buscan desplegar modelos grandes en entornos locales con Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención estándar y Gated DeltaNet, más encoder de visión y MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3.000.000.000 (aprox., 3B por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, grupo 32) para 192 tensores; MXFP8 (8 bits, grupo 32) para 179 tensores; BF16 para visión, MTP, routers, embeddings y normas |
| Idiomas soportados | no disponible (el modelo base Qwen3.6 es multilingüe, pero no se especifica en esta conversión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards, 1.457 tensores) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE (Mixture of Experts) con 35.95 mil millones de parámetros totales y 3 mil millones activos por token. Su arquitectura combina capas de atención estándar con capas Gated DeltaNet, un mecanismo de atención lineal que reduce el coste computacional en secuencias largas. Además, incorpora un encoder de visión para procesar imágenes y un módulo MTP (Multi-Token Prediction) que predice varios tokens a la vez, mejorando la eficiencia en generación.

La conversión a MLX aplica una cuantización por clases de tensores: los 192 tensores correspondientes a los FFN de expertos enrutados y compartidos de las capas 0 a 31 se almacenan en MXFP4 con grupo de 32; los 179 tensores de las últimas ocho capas, atención, Gated DeltaNet, proyecciones y lm_head se guardan en MXFP8; el resto (visión, MTP, routers, embeddings, normas y tensores de estado) permanece en BF16. Esta estrategia minimiza la pérdida de precisión en las capas críticas mientras reduce drásticamente el uso de memoria.

El proceso de conversión es data-free: no se utiliza imatrix ni calibración AWQ, ya que el autor descubrió que el pre-escalado AWQ degradaba los bloques bajo formato de escala flotante. La re-conversión del 1 de septiembre de 2026 mejoró el error de peso MXFP8 de 6.91% a 2.66% al seleccionar el exponente E8M0 compartido de forma más precisa. No se dispone de información detallada sobre el entrenamiento del modelo base (datos, tokens, RLHF/DPO), ya que no se incluye en la documentación de esta conversión.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualmente relevante en múltiples idiomas, aunque solo se ha verificado la generación de texto en esta conversión.
- Razonamiento y matemáticas: hereda las capacidades de razonamiento lógico y resolución de problemas matemáticos del modelo Qwen3.6.
- Generación de código: soporta la creación de código en varios lenguajes de programación, útil para asistentes de desarrollo.
- Visión: el pipeline image-text-to-text está presente, con un encoder de visión en BF16, pero no se ha probado en esta versión cuantizada.
- Tool calling y function calling: probablemente soportado por el modelo base, aunque no se documenta explícitamente en esta conversión.
- Soporte de agentes y multi-step reasoning: el modelo base está diseñado para tareas de razonamiento en varios pasos, lo que lo hace apto para aplicaciones de agente.
- Multilingüe: el modelo base Qwen3.6 es multilingüe, aunque no se especifican los idiomas exactos en la model card de esta conversión.
- MTP (Multi-Token Prediction): el módulo MTP se conserva en BF16, lo que permite una generación más rápida al predecir múltiples tokens simultáneamente.

## Casos de uso

- Inferencia local en Apple Silicon: el caso principal de esta conversión es ejecutar un modelo de 35B en Mac con chip M-series. Con solo 3B de parámetros activos, la inferencia es rápida y cabe en la memoria unificada de equipos con 32 GB o más. Un desarrollador puede cargar el modelo con mlx-node y generar respuestas en tiempo real sin depender de la nube.
- Asistente de programación en IDE: gracias a su capacidad de generación de código y razonamiento, puede integrarse en editores como VS Code o Neovim para autocompletar funciones, explicar fragmentos o sugerir refactorizaciones. La cuantización MXFP4/MXFP8 mantiene una calidad suficiente para tareas de desarrollo.
- Chatbot de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo (aunque la longitud exacta no está documentada). Su naturaleza MoE permite atender múltiples peticiones concurrentes con baja latencia en un Mac servidor.
- Análisis de documentos con visión: aunque la parte de visión no se ha probado en esta conversión, el encoder de visión está presente en BF16. Un caso de uso potencial es extraer información de imágenes o documentos escaneados, siempre que se valide el rendimiento antes de producción.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden usar este modelo para crear demos y pruebas de concepto en Mac sin necesidad de GPUs dedicadas. La carga del modelo tarda unos 44 segundos, lo que es aceptable para entornos de desarrollo.
- Fine-tuning o adaptación ligera: aunque la cuantización limita el fine-tuning completo, se puede realizar adaptación con LoRA sobre las capas en BF16 (visión, embeddings) o incluso sobre las capas cuantizadas con técnicas como QLoRA, aprovechando la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que se realizó una prueba de humo de generación de texto: el modelo se cargó en 44.1 segundos y generó un token determinista "OK". No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en esta conversión específica.

## Requisitos de hardware

- Plataforma: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada. La conversión está optimizada para MLX, por lo que no es compatible con GPUs NVIDIA o AMD.
- Memoria: el tamaño del repositorio es de 51.8 GB, pero los pesos cuantizados ocupan menos. Con MXFP4/MXFP8, se estima que el modelo requiere entre 20 y 30 GB de RAM unificada, dependiendo de la versión exacta. Un Mac con 32 GB o más es recomendable para una experiencia fluida.
- GPU: no aplica GPU discreta; se usa la GPU integrada del chip Apple Silicon. El rendimiento depende del número de núcleos GPU y del ancho de banda de memoria unificada.
- Opciones de despliegue: mlx-node (librería JavaScript/TypeScript) es la opción principal. También se puede usar mlx (Python) si se convierte el formato, aunque esta versión está pensada para mlx-node. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos concretos. La carga tarda 44.1 segundos en un equipo de prueba. La generación de tokens dependerá del hardware; con 3B activos, se espera una velocidad de decenas de tokens por segundo en chips M3 Pro o superiores.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35.95B | 3B | no disponible | Apache 2.0 | safetensors (BF16) |
| Qwen3.6-35B-A3B-mxfp4-mlx (esta conversión) | 35.95B | 3B | no disponible | Apache 2.0 | safetensors (MXFP4/MXFP8) |
| Qwen3.6-27B (dense) | 27B | 27B | no disponible | Apache 2.0 | safetensors |

La comparativa se limita a las variantes de Qwen 3.6 mencionadas en la búsqueda web. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La ventaja principal de esta conversión es su menor huella de memoria frente al original en BF16 (que ocuparía ~72 GB), a costa de una posible pérdida de precisión por la cuantización.

## Limitaciones y advertencias

- La cuantización MXFP4/MXFP8 introduce pérdida de precisión. Aunque el error de peso MXFP8 se redujo al 2.66%, puede haber degradación en tareas de razonamiento complejo o generación de código muy específico.
- Solo se ha verificado la generación de texto. El pipeline de visión (image-text-to-text) no ha sido probado en esta conversión, por lo que su funcionamiento no está garantizado.
- No se ha utilizado calibración ni imatrix, lo que puede afectar a la calidad en comparación con cuantizaciones calibradas como AWQ o GPTQ.
- La longitud de contexto no está documentada. Se desconoce si la cuantización afecta al manejo de secuencias largas.
- El modelo puede alucinar o generar información incorrecta, como cualquier LLM. Se recomienda validar las salidas en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6 puede tener términos adicionales; se debe revisar la licencia del modelo original.
- El formato MLX es específico de Apple Silicon. No se puede ejecutar en GPUs NVIDIA o AMD sin una conversión adicional.
- La carga del modelo tarda ~44 segundos, lo que puede ser un inconveniente en aplicaciones que requieran reinicios frecuentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Brooooooklyn/Qwen3.6-35B-A3B-mxfp4-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Referencia de cuantización Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-NVFP4
- Colección de recetas: https://huggingface.co/collections/Brooooooklyn/unsloth-nvfp4-tensor-class-recipe-for-mlx-macos-dgx-6a5e3a893ae031d023e72ccf
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía para ejecutar Qwen 3.6 35B MoE localmente: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
