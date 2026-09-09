# CollectionStudio/Trinity-Mini-NVFP4

## Resumen

Trinity-Mini-NVFP4 es una cuantización NVFP4 del modelo Trinity-Mini, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Arcee AI. La versión cuantizada ha sido publicada en Hugging Face por CollectionStudio, y está optimizada para el despliegue en GPUs NVIDIA Blackwell, donde el formato de punto flotante de 4 bits reduce el uso de memoria y permite un cómputo nativo más eficiente. El modelo original Trinity-Mini es una arquitectura AfmoeForCausalLM con 128 expertos en total, de los cuales 8 están activos y 1 es compartido, y ha sido entrenado sobre 10 billones de tokens en colaboración con Datology y Prime Intellect. La model card del autor indica que el modelo tiene 26 mil millones de parámetros, aunque los pesos cuantizados en safetensors suman 13.912.258.304 parámetros debido a la cuantización aplicada. Con una ventana de contexto de 128.000 tokens y soporte para 11 idiomas, está orientado a tareas de razonamiento y sigue instrucciones de forma competitiva con modelos de tamaño similar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AfmoeForCausalLM (MoE con 128 expertos, 8 activos y 1 compartido) |
| Parametros totales | 13.912.258.304 (según safetensors; la model card publica 26B) |
| Parametros activos | 3.000.000.000 |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | NVFP4 (solo MLP/expertos, atención en BF16) |
| Idiomas soportados | inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Trinity-Mini emplea una arquitectura MoE basada en la clase `AfmoeForCausalLM`, con 128 expertos en la capa de feed-forward, de los cuales 8 son activos por token y 1 es compartido. La capa de atención se mantiene en BF16, mientras que los pesos de los expertos se almacenan en formato NVFP4 mediante NVIDIA ModelOpt, con calibración sobre 512 muestras de secuencia 2048. El modelo ha sido entrenado sobre 10T tokens, construidos a partir del dataset utilizado en AFM-4.5B, ampliado con matemáticas y código. El entrenamiento se llevó a cabo en un clúster de 512 GPUs H200 mediante Prime Intellect, usando HSDP (Hybrid Sharded Data Parallel). La cuantización NVFP4 se aplica exclusivamente a los pesos MLP, lo que permite reducir el tamaño en memoria aproximadamente 3,7 veces respecto a BF16, manteniendo la precisión de la atención. No se documenta el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto en 11 idiomas: inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino.
- Razonamiento paso a paso, con afinamiento específico para tareas de lógica y análisis.
- Manejo de contexto largo de hasta 128.000 tokens, lo que permite trabajar con documentos extensos, conversaciones multi-turno y código de gran tamaño.
- Entrenado con datos adicionales de matemáticas y código, lo que lo hace apto para resolver ejercicios numéricos y generar o modificar funciones de programación.
- Compatible con el backend de vLLM para despliegue en producción, incluyendo endpoints compatibles con OpenAI (según los tags del repositorio).
- No se menciona soporte de tool calling, visión ni audio en la información disponible.

## Casos de uso

- Asistente de soporte técnico corporativo: gracias a los 128.000 tokens de contexto, el modelo puede mantener conversaciones largas con clientes, recordar el historial y resolver consultas en varios idiomas de forma simultánea.
- Generación de código en equipos de desarrollo: el entrenamiento con datos adicionales de código permite producir funciones completas, refactorizar fragmentos o explicar lógica compleja. Puede integrarse en pipelines de CI/CD mediante vLLM.
- Análisis de documentación legal o normativa: con su ventana de contexto amplia, es posible cargar contratos o reglamentos extensos y extraer cláusulas concretas, resumir riesgos o comparar versiones de un texto.
- Tutor inteligente de matemáticas: el modelo está afinado para razonamiento, por lo que puede resolver problemas paso a paso, verificar cálculos y ofrecer explicaciones en lenguaje natural a estudiantes.
- Analista de sentimiento multilingüe en redes sociales: al soportar 11 idiomas, resulta adecuado para clasificar opiniones en mercados internacionales sin necesidad de modelos separados por lengua.
- Agente de investigación documental: el modelo puede procesar informes técnicos, papers o wikis internas, extraer conclusiones y responder preguntas basadas en el contenido, manteniendo el contexto durante toda la interacción.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una imagen con una gráfica comparativa, pero no se ofrecen datos accesibles en formato texto. Por lo tanto, no es posible presentar una tabla con puntuaciones de MMLU, HumanEval, GSM8K u otras evaluaciones.

## Requisitos de hardware

- Para ejecutar con núcleos FP4 nativos se requieren GPU NVIDIA Blackwell: B200, B300 o GB300. vLLM debe ser la versión 0.18.0 o superior.
- En GPUs Hopper (H100, H200) y otras anteriores, vLLM selecciona automáticamente el backend Marlin, que descomprime los pesos FP4 a BF16 durante el cómputo, manteniendo la reducción de memoria de aproximadamente 3,7 veces respecto a BF16, pero sin la aceleración de cómputo FP4.
- La VRAM estimada para inferencia depende de la longitud de contexto. El repositorio ocupa 17,2 GB en disco; para un contexto corto (8.000 tokens) se recomienda una GPU con al menos 24 GB de VRAM. Para contextos cercanos a 128.000 tokens, se necesitará más memoria para el KV cache.
- Opciones de despliegue: vLLM (>=0.18.0) es la vía principal. También se puede usar mediante `transformers` con `trust-remote-code`, aunque no se documentan otros servidores como Ollama o TGI.
- En instalaciones de vLLM vía pip sobre Blackwell, puede ser necesario forzar el backend Marlin con `export VLLM_NVFP4_GEMM_BACKEND=marlin` para evitar resultados incorrectos por inconsistencias de versiones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trinity-Mini-NVFP4 (CollectionStudio) | 13.912.258.304 (safetensors) | 128.000 | NVFP4 | OpenMDW-1.1 | Hugging Face |
| Trinity-Mini (Arcee AI, original) | 26B (según model card) | 128.000 | BF16 (sin cuantizar) | OpenMDW-1.1 | Hugging Face |
| Trinity-Large-Thinking-NVFP4 (CollectionStudio) | no disponible | no disponible | NVFP4 | no disponible | Hugging Face |

No se dispone de métricas comparativas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Existe una discrepancia entre el número de parámetros de la model card (26B) y el resultado del conteo de safetensors (13.912.258.304). Conviene verificar el modelo antes de incorporarlo a un sistema de producción.
- El rendimiento óptimo con FP4 solo se alcanza en GPUs Blackwell; en hardware más antiguo, como la serie Hopper, el cómputo resulta más lento que con pesos nativos BF16.
- Requiere `trust-remote-code` al cargar con `transformers` o vLLM, porque la arquitectura `AfmoeForCausalLM` no está disponible en la librería estándar.
- No se documenta soporte de tool calling, visión ni audio; el modelo está orientado únicamente a texto.
- La licencia OpenMDW-1.1 debe revisarse antes de un uso comercial, ya que no es una licencia permisiva estándar como Apache 2.0 o MIT.
- Como con cualquier modelo de lenguaje, existe riesgo de alucinación, especialmente en tareas de razonamiento con poca información de entrada.
- No se han publicado benchmarks en texto, lo que dificulta evaluar su rendimiento frente a alternativas de la misma categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CollectionStudio/Trinity-Mini-NVFP4
- Modelo original de Arcee AI: https://huggingface.co/arcee-ai/Trinity-Mini
- Otra cuantización de la familia Trinity de CollectionStudio: https://huggingface.co/CollectionStudio/Trinity-Large-Thinking-NVFP4
- Blog de Arcee AI sobre Trinity: https://www.arcee.ai/blog/the-trinity-manifesto
- Herramienta de cuantización NVIDIA ModelOpt: https://github.com/NVIDIA/Model-Optimizer
- vLLM: https://github.com/vllm-project/vllm
- Datology: https://www.datologyai.com/
- Prime Intellect: https://www.primeintellect.ai/
