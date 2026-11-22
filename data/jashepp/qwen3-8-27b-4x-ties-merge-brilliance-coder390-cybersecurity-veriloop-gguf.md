# jashepp/Qwen3.8-27B-4x-ties-merge-brilliance-coder390-cybersecurity-veriloop-GGUF

## Resumen

Qwen3.8-27B-4x-ties-merge-brilliance-coder390-cybersecurity-veriloop es un modelo de lenguaje de 27.318.209.536 parámetros (unos 27,3 mil millones) obtenido mediante la fusión de cuatro modelos derivados de la familia Qwen3.8 de 27B. Lo desarrolla el usuario de Hugging Face jashepp, que actúa como autor del merge y de las cuantizaciones GGUF publicadas. El modelo resuelve la necesidad de disponer de una única variante local que combine razonamiento con cadena de pensamiento, generación de código, ingeniería de software técnica, análisis de seguridad y lógica formal, capacidades que en los modelos originales están repartidas entre checkpoints distintos.

La fusión se ha realizado con mergekit aplicando el método TIES (arXiv:2306.01708) sobre cuatro bases: DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored como modelo base y origen del tokenizador, nerkyor/Qwen3.8-27B-Coder390-EfficientThink como refuerzo de código, xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8 para tareas de seguridad y decompilación, y tsinghua-sigs-robot-lab/VeriLoop-E2 para matemáticas, física y lógica estructurada. La receta inyecta los deltas de parámetros principalmente en los bloques `mlp` intermedios, manteniendo embeddings, normas, `lm_head` y capas de atención anclados al modelo base.

Es relevante ahora porque ofrece, en un solo checkpoint de 27B ejecutable en hardware de consumo mediante cuantización, un perfil híbrido de razonamiento y código técnico que normalmente exigiría alternar entre varios modelos. El repositorio incluye pesos en formato GGUF (bfloat16, mxfp4, Q4, Q6 y Q8) preparados para llama.cpp y LM Studio, además de los ficheros originales en transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de Qwen3.8 (fusión TIES de cuatro checkpoints de 27B) |
| Parametros totales | 27.318.209.536 (27,3B) |
| Parametros activos | no disponible (no es un modelo MoE según la informacion proporcionada) |
| Longitud de contexto | no disponible (la model card menciona pruebas a 150k tokens, sin declarar la ventana oficial) |
| Tipos de cuantizacion | bfloat16, mxfp4, Q4, Q6, Q8 (GGUF); pesos originales en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp, LM Studio) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos, no un entrenamiento desde cero. Se parte de cuatro checkpoints Qwen3.8 de 27B y se combinan con mergekit mediante TIES, que poda los deltas de menor magnitud, resuelve los conflictos de signo entre modelos y aplica una media ponderada de los parámetros restantes. La receta asigna densidades y pesos `mlp` distintos a cada fuente: el modelo base de DavidAU conserva densidad 1.00 y peso 1.0, el modelo de código de nerkyor aporta densidad 0.54 con peso `mlp` de 0.40 y ajustes menores de atención (0.00–0.08), el modelo de ciberseguridad de xtools-at aporta densidad 0.48 con peso `mlp` de 0.24 y ajustes de atención de 0.00–0.04, y VeriLoop-E2 aporta densidad 0.35 con peso `mlp` mínimo de 0.08 y ajustes de atención de 0.00–0.01.

El objetivo declarado es preservar la estructura de razonamiento e instrucciones del modelo base (embeddings, normas, `lm_head` y atención anclados) e inyectar capacidad técnica y analítica en los bloques `mlp` intermedios. La model card menciona que los modelos de origen incorporan post-entrenamiento con SFT y RLOO, así como mecanismos MTP (multi-token prediction) y DFlash2 en el caso de nerkyor, aunque no se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados. No se especifican datos sobre RLHF o DPO aplicados específicamente a esta fusión.

## Capacidades

- Generación de texto conversacional con modo de razonamiento explícito (thinking / chain-of-thought) y presupuesto de razonamiento configurable; el autor emplea un `reasoning-budget` de 32000.
- Generación de código y finalización de código en tareas de programación general.
- Ingeniería de software técnica: análisis de código, depuración y tareas de tipo SWE.
- Decompilación y análisis de binarios, según el refuerzo aportado por el modelo de ciberseguridad.
- Seguridad informática: análisis de vulnerabilidades y pentesting técnico.
- Matemáticas, física y lógica formal estructurada, heredadas de VeriLoop-E2.
- Soporte declarado de tool calling / function calling y uso agéntico (etiquetas `agentic`, `tool-use`).
- Seguimiento de instrucciones y recall de contexto largo (etiquetas `instruction-following`, `context-recall`; pruebas del autor a 150k tokens).
- Capacidades multilingües limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Asistencia a la programación en local: el modelo puede generar y revisar código en un IDE o CLI integrado mediante llama.cpp u Ollama, aprovechando su especialización en código y su licencia Apache 2.0 para uso comercial sin restricciones de atribución adicionales.
- Análisis de decompilación y reversing: el delta de Qwensploit-V2 aporta conocimiento de binarios y vulnerabilidades, lo que permite usarlo para interpretar pseudocódigo de descompiladores y señalar posibles fallos de memoria o rutas de explotación en un entorno de investigación controlado.
- Revisión de seguridad de código en pipelines CI/CD: con soporte de tool calling, puede integrarse como paso de análisis que recibe fragmentos de código o resultados de analizadores estáticos y produce informes de riesgo estructurados.
- Resolución de problemas matemáticos y físicos con razonamiento paso a paso: el modo thinking con presupuesto de 32000 tokens permite abordar demostraciones y cálculos de varios pasos, útil en entornos académicos o de ingeniería.
- Agentes autónomos de varias etapas: las etiquetas `agentic` y `tool-use` indican que puede encadenar llamadas a herramientas y razonamiento multi-paso, por ejemplo para tareas de automatización de escritorio o scripting.
- Procesamiento de documentación técnica extensa: el recall de contexto largo observado a 150k tokens permite resumir repositorios, manuales o informes largos en una sola pasada, aunque conviene verificar la ventana oficial antes de fijar límites en producción.
- Despliegue en estación de trabajo con GPU de consumo: las cuantizaciones Q4 y Q6 en GGUF permiten ejecutarlo en equipos con 24 GB de VRAM o incluso menos, lo que facilita prototipado y uso personal sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas; solo describe pruebas A/B con la misma semilla realizadas por el autor, sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 54,6 GB solo para pesos (27,3B × 2 bytes), más overhead de contexto; en Q8, en torno a 29 GB; en Q6, unos 22 GB; en Q4, unos 15–16 GB; en mxfp4, un valor similar al de Q4.
- GPU recomendadas: para bf16, A100 80 GB, H100 80 GB o varias GPU de 48 GB; para Q8, A100 40 GB o RTX 6000 Ada; para Q6 y Q4, RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen para contexto moderado.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q6 sobre RTX 4090, RTX 3090 o GPUs de 16–24 GB; en Q4 también podría ejecutarse parcialmente en GPU con offload a RAM del sistema.
- Opciones de despliegue: llama.cpp y LM Studio para GGUF; vLLM y TGI para los pesos en safetensors/bf16; Ollama es viable si se importa el GGUF; transformers para inferencia de referencia.
- Latencia y throughput estimados: no disponibles; la model card no publica mediciones. Como referencia cualitativa, el autor reporta uso agéntico con presupuesto de razonamiento de 32000 tokens, lo que implica latencias altas en generación con thinking activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jashepp/Qwen3.8-27B-4x-ties-merge (este) | 27,3B | no disponible | Apache 2.0 | safetensors, GGUF | Fusión de 4 modelos; razonamiento, código, seguridad y lógica |
| jashepp/Qwen3.8-27B-DavidAU-nerkyor-Ultimate-Heretic-Coder390-ties-merge | no disponible | no disponible | Apache 2.0 | GGUF | Fusión 2x del mismo autor; mejor seguimiento de instrucciones según la model card, pero menos capacidad SWE técnica |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27B (aproximado, no confirmado) | no disponible | no disponible | no disponible | Modelo base de la fusión; razonamiento e instrucciones |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink | 27B (aproximado, no confirmado) | no disponible | no disponible | no disponible | Especializado en código y recall de contexto; aporta el delta de programación |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El seguimiento de instrucciones es más débil que el del modelo base y que el de la fusión 2x previa del mismo autor, según reconoce la propia model card.
- Se han observado bucles de razonamiento del tipo "But wait / Actually wait" al escribir ficheros o informes con contextos de 150k tokens, lo que puede degradar la salida en tareas de generación larga.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Al ser una fusión de pesos sin evaluación publicada, no hay benchmarks que respalden las capacidades declaradas; las afirmaciones de la model card son cualitativas y basadas en pruebas del autor.
- Riesgo de alucinación inherente a los modelos de 27B, especialmente en dominios técnicos como seguridad o matemáticas, donde una salida plausible puede ser incorrecta; requiere verificación humana en producción.
- El modelo base incluye la etiqueta "Uncensored" y "Heretic", lo que puede implicar una menor alineación de seguridad y mayor probabilidad de generar contenido no filtrado; conviene evaluar políticas de contenido antes de desplegarlo en aplicaciones públicas.
- Las capacidades de ciberseguridad y decompilación deben usarse únicamente en entornos autorizados; el uso ofensivo puede infringir legislación local.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de múltiples modelos base conviene verificar que cada uno de ellos mantenga esa misma licencia; la información disponible solo confirma Apache 2.0 para este repositorio.
- No se especifica la longitud de contexto oficial, por lo que fijar límites de producción basados en las pruebas a 150k tokens es arriesgado sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jashepp/Qwen3.8-27B-4x-ties-merge-brilliance-coder390-cybersecurity-veriloop-GGUF
- Modelo base 1: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Modelo base 2: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Modelo base 3: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Modelo base 4: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Fusión 2x previa del mismo autor: https://huggingface.co/jashepp/Qwen3.8-27B-DavidAU-nerkyor-Ultimate-Heretic-Coder390-ties-merge-GGUF
- Paper del método TIES: https://arxiv.org/abs/2306.01708
- Repositorio mergekit: https://github.com/cg123/mergekit
- Colección de modelos Qwen de DavidAU: https://huggingface.co/collections/DavidAU/qwen-36-reg-uncensored-9b-12b-21b-27b-40b
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
