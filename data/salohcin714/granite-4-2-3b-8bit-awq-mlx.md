# salohcin714/granite-4.2-3b-8bit-awq-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-8bit-awq-mlx` es una conversión cuantizada del modelo base `ibm-granite/granite-4.2-3b` de IBM, adaptada al formato MLX para ejecución eficiente en hardware Apple Silicon. La cuantización de 8 bits con calibración activa (AWQ) reduce el tamaño de los pesos a aproximadamente 3,7 GB, lo que permite ejecutar el modelo en equipos con memoria unificada moderada, como Macs con 8 GB o más de RAM.

El modelo base Granite 4.2 pertenece a la familia de modelos densos de razonamiento de IBM, disponible en tamaños de 3B, 8B y 30B. Incorpora capacidades de razonamiento con cadena de pensamiento (chain-of-thought), modos de pensamiento flexibles y tool calling aumentado con razonamiento. Esta versión cuantizada mantiene esas capacidades, aunque con una ligera pérdida de precisión inherente a la cuantización.

La relevancia de este artefacto radica en que democratiza el acceso a un modelo de razonamiento de última generación en entornos de escritorio Apple, sin necesidad de GPUs dedicadas. Es una opción práctica para desarrolladores que trabajan con MLX y desean integrar un modelo multilingüe de 3B con licencia Apache 2.0 en sus aplicaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 3B (modelo base); 981.281.280 en safetensors cuantizado |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit AWQ (group size 64) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 es un transformer decoder-only denso, post-entrenado sobre los modelos base Granite 4.1. Según la documentación de IBM, la familia Granite 4.2 incorpora razonamiento con cadena de pensamiento integrado, modos de pensamiento configurables (thinking mode) y tool calling aumentado con razonamiento. No se dispone de detalles específicos sobre el número de tokens de entrenamiento ni la composición del dataset en la información proporcionada.

La conversión a MLX se realizó con `mlx-lm` 0.31.3, aplicando cuantización de 8 bits con calibración activa (AWQ) y group size 64. Se eliminó el peso redundante `lm_head.weight` en los casos donde el modelo ata las embeddings de entrada y salida. No se realizó fine-tuning adicional ni se añadieron datos de entrenamiento.

## Capacidades

- Generación de texto en 12 idiomas, incluyendo español, inglés, francés, alemán, japonés, chino, entre otros.
- Razonamiento con cadena de pensamiento (chain-of-thought) integrado, con modos de pensamiento flexibles (thinking mode).
- Tool calling / function calling aumentado con razonamiento, útil para agentes que necesitan decidir cuándo y cómo invocar herramientas.
- Soporte de conversación multi-turno mediante chat template estándar.
- Ejecución nativa en Apple Silicon gracias al formato MLX, con integración directa con `mlx-lm`.
- Capacidad de procesamiento de contexto largo (el valor exacto no está disponible, pero la familia Granite 4.2 está diseñada para ventanas de contexto amplias).

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede ejecutarse en un Mac con 8 GB de RAM, ofreciendo respuestas en varios idiomas sin conexión a internet. Es adecuado para aplicaciones de productividad personal o prototipos de chatbots.
- Generación de código en entornos de desarrollo: aunque no se especifican benchmarks de código, el modelo base Granite 4.2 tiene capacidades de generación de código. Puede integrarse en editores como VS Code mediante extensiones que usen MLX.
- Automatización de atención al cliente: con soporte de tool calling, el modelo puede gestionar consultas de clientes y derivar a APIs externas (CRM, bases de conocimiento) cuando sea necesario, todo en local.
- Análisis de texto multilingüe: su soporte de 12 idiomas permite clasificar, resumir o extraer información de documentos en varios idiomas, útil para empresas con operaciones internacionales.
- Agente de razonamiento para toma de decisiones: gracias a su cadena de pensamiento integrada, puede descomponer problemas complejos en pasos lógicos, siendo útil en aplicaciones de análisis financiero o planificación.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: al ser un modelo pequeño y cuantizado, permite iterar rápidamente en el desarrollo de features de IA sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que los benchmarks publicados por IBM describen los pesos originales, no este artefacto cuantizado, y no deben interpretarse como afirmaciones sobre este repositorio. Por tanto, no se proporcionan cifras de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,7 GB, por lo que se recomienda al menos 4 GB de memoria unificada libre. En la práctica, un Mac con 8 GB de RAM puede ejecutar el modelo con holgura.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de memoria unificada. No requiere GPU dedicada.
- Compatibilidad con consumer GPU: no aplica, ya que MLX está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: `mlx-lm` (Python), integración con frameworks como LangChain o LlamaIndex mediante adaptadores MLX, o servidores de inferencia como `mlx-lm.server`.
- Latencia y throughput: no disponibles. Al ser un modelo de 3B cuantizado, se espera una generación de decenas de tokens por segundo en chips M-series, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite 4.2 3B (base) | 3B | No disponible | Apache 2.0 | safetensors (original) | Modelo original de IBM, sin cuantizar |
| salohcin714/granite-4.2-3b-8bit-awq-mlx | 3B (base) | No disponible | Apache 2.0 | MLX safetensors | Cuantización 8-bit AWQ para Apple Silicon |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 | GGUF, MLX, etc. | Alternativa popular, pero con licencia más restrictiva |
| Qwen 2.5 3B | 3B | 32K | Apache 2.0 | GGUF, MLX, etc. | Alternativa con buen rendimiento multilingüe |

La comparativa es estructural, ya que no se dispone de benchmarks para la versión cuantizada. La principal ventaja de este modelo es su licencia Apache 2.0 y su integración nativa con MLX, mientras que Llama 3.2 tiene una licencia que limita el uso comercial en ciertos casos.

## Limitaciones y advertencias

- La cuantización de 8 bits puede introducir una pérdida de precisión en tareas de razonamiento complejo o generación de código, en comparación con el modelo original en punto flotante.
- No se han publicado benchmarks específicos para esta versión cuantizada, por lo que el rendimiento real puede diferir del modelo base.
- La longitud de contexto no está documentada en la información proporcionada; se recomienda verificar la documentación oficial de Granite 4.2 para conocer el límite exacto.
- El modelo puede presentar sesgos presentes en los datos de entrenamiento originales, como cualquier modelo de lenguaje. IBM publica directrices de uso responsable, pero no se incluyen en este repositorio.
- Riesgo de alucinación en tareas de generación de hechos o datos específicos; se recomienda validación externa en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero el nombre "Granite" es una marca registrada de IBM; el autor del repositorio aclara que no está afiliado ni respaldado por IBM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-8bit-awq-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentación oficial de Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Página principal de IBM Granite: https://www.ibm.com/granite
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
