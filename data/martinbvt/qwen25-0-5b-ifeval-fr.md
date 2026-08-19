# Martinbvt/qwen25-0.5b-ifeval-fr

## Resumen
El modelo `Martinbvt/qwen25-0.5b-ifeval-fr` es un ajuste fino (fine-tuning) mediante LoRA del modelo base Qwen/Qwen2.5-0.5B-Instruct, desarrollado por Martinbvt. Su objetivo principal es mejorar el seguimiento de instrucciones verificables (evaluación IFEVAL) en francés, manteniendo un tamaño muy reducido de aproximadamente 494 millones de parámetros. Está diseñado para tareas de generación de texto conversacional y de instrucciones en francés, siendo especialmente relevante para entornos con recursos de cómputo limitados, como dispositivos edge o portátiles con Apple Silicon, ya que el propio autor indica que fue entrenado en un Mac M1.

Arquitectónicamente, se trata de un modelo transformer decoder-only de la familia Qwen2 (`Qwen2ForCausalLM`), con pesos en float16 y distribuido en formato safetensors. No requiere `trust_remote_code`, lo que facilita su integración en pipelines estándar de Hugging Face. Su relevancia actual radica en ofrecer una alternativa ligera y especializada en francés para el seguimiento de instrucciones, un área donde los modelos grandes suelen ser excesivos y costosos de desplegar.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (Transformer, decoder-only) |
| Parametros totales | 494.032.768 (~494M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredado del modelo base Qwen2.5-0.5B-Instruct, que soporta 32.768 tokens, pero no se confirma en la ficha del autor) |
| Tipos de cuantizacion | float16 (pesos publicados); no se proporcionan cuantizaciones GGUF, AWQ ni GPTQ |
| Idiomas soportados | fr (frances) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Qwen2, un transformer decoder-only estándar con atención causal. El proceso de entrenamiento consiste en un ajuste fino con LoRA (Low-Rank Adaptation) sobre el checkpoint instruct de Qwen2.5-0.5B, realizado en un Mac M1, lo que indica un presupuesto de cómputo modesto y una metodología accesible para desarrolladores independientes. El objetivo declarado es el seguimiento de instrucciones verificables en francés, alineado con el benchmark IFEVAL.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se detallan innovaciones técnicas más allá del uso de LoRA. Los pesos se almacenan en float16, lo que implica un tamaño de aproximadamente 1 GB en disco (el repositorio ocupa 1.0 GB, incluyendo el adaptador y los archivos de configuración).

## Capacidades
- Generación de texto en frances, especializado en seguir instrucciones de forma verificable (formato, restricciones y requisitos explícitos).
- Mantiene las capacidades conversacionales del modelo base Qwen2.5-0.5B-Instruct, permitiendo interacciones de chat multi-turno.
- Al ser un modelo denso de 494M parámetros, es capaz de ejecutar tareas básicas de razonamiento y comprensión lectora en francés, aunque con las limitaciones propias de su tamaño.
- No se menciona soporte para tool calling, function calling ni modos de agente en la información proporcionada.
- Soporte multilingüe: no disponible, el modelo está etiquetado únicamente para francés (`fr`).
- No se indica soporte para vision, audio u otras modalidades; es exclusivamente texto.

## Casos de uso
- Asistentes de atención al cliente en frances: el modelo puede gestionar conversaciones de soporte básico, siguiendo instrucciones estrictas sobre el formato de las respuestas (por ejemplo, incluir número de ticket, tono formal o pasos de resolución) gracias a su entrenamiento en IFEVAL.
- Generación de respuestas estructuradas en aplicaciones de formularios: dado su enfoque en instrucciones verificables, es adecuado para extraer o formatear datos (JSON, listas, resúmenes) a partir de texto libre en francés, siempre que el esquema sea simple.
- Asistentes de escritura para francés: puede corregir o reformular textos siguiendo instrucciones específicas (longitud, estilo, registro), útil en herramientas de redacción ligera integradas en editores o extensiones de navegador.
- Clasificación de texto en francés: se puede emplear para etiquetar correos, tickets o comentarios en categorías predefinidas, aprovechando su capacidad para seguir instrucciones de formato de salida.
- Despliegue en entornos edge o con CPU limitada: su tamaño reducido permite ejecutarlo en portátiles sin GPU, Raspberry Pi (con suficiente RAM) o en servicios serverless, ofreciendo una alternativa económica a modelos grandes para tareas de NLP en francés.
- Prototipado rápido y fine-tuning adicional: al ser un modelo pequeño con licencia Apache 2.0, es una base ideal para que desarrolladores franceses realicen ajustes finos adicionales con LoRA o QLoRA sobre dominios específicos (legal, médico, técnico) sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de IFEVAL, MMLU, HumanEval ni otras evaluaciones comparativas. Por tanto, no es posible cuantificar su rendimiento real frente a otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1 GB en float16 (494M parámetros * 2 bytes). Con cuantización a int8 o int4 (si se convierte a GGUF), la huella podría reducirse a 500 MB o menos, aunque no se proporcionan dichos formatos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o integradas Apple Silicon). También es viable su ejecución únicamente en CPU con 8 GB de RAM.
- Compatibilidad con GPU consumer: sí, cabe holgadamente en tarjetas como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, y con `text-generation-inference` (TGI) según las etiquetas del repositorio. Se puede convertir a GGUF para usarlo con llama.cpp u Ollama, aunque no se suministran estos archivos directamente.
- Latencia y throughput: no disponible. Dado su tamaño, en una GPU moderna se esperan latencias inferiores a 100 ms por token, pero no hay datos oficiales.

## Comparativa con modelos similares
La comparativa más directa es con su modelo base, Qwen/Qwen2.5-0.5B-Instruct. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas, por lo que la tabla se limita a características estructurales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Martinbvt/qwen25-0.5b-ifeval-fr | 494M | no disponible (heredado 32k) | fr | Apache 2.0 | Fine-tuning LoRA para IFEVAL en frances |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Multilingue (incluye fr) | Apache 2.0 | Modelo base, sin especializacion en IFEVAL frances |
| SmolLM2-360M | 360M | 8.192 tokens | Principalmente ingles | Apache 2.0 | Modelo pequeño de Hugging Face, sin enfoque frances |

La diferencia clave con el modelo base es la especialización en francés y en el seguimiento de instrucciones verificables, aunque el modelo base mantiene un soporte multilingüe más amplio. No se dispone de información sobre otros modelos franceses específicos de tamaño similar para comparar.

## Limitaciones y advertencias
- Tamaño reducido: con solo 494M parámetros, su capacidad de razonamiento complejo, matemáticas avanzadas o generación de código es limitada en comparación con modelos de 7B o superiores.
- Riesgo de alucinación: al ser un modelo pequeño, es propenso a generar información inventada o incoherente, especialmente en contextos largos o preguntas abiertas.
- Idioma restringido: está entrenado y etiquetado únicamente para francés. Su rendimiento en otros idiomas es previsiblemente deficiente o nulo.
- Sin datos de entrenamiento publicados: no se especifica el dataset utilizado para el fine-tuning, lo que impide evaluar posibles sesgos o la calidad de los datos.
- Sin benchmarks: la ausencia de métricas oficiales (IFEVAL, etc.) impide validar su eficacia real frente a otras alternativas.
- Baja adopción: el repositorio registra 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente probado por la comunidad. Se recomienda realizar evaluaciones propias antes de usarlo en producción.
- Licencia: Apache 2.0 permite uso comercial sin restricciones significativas, siempre que se mantenga el aviso de copyright. No hay restricciones de uso militar o de alto riesgo específicas en la licencia, pero el modelo base Qwen2.5-0.5B-Instruct también es Apache 2.0.

## Enlaces
- Repositorio del modelo en Hugging Face: https://huggingface.co/Martinbvt/qwen25-0.5b-ifeval-fr
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- No se han encontrado papers, blogs, demos o repositorios de código adicionales asociados a este modelo en la información proporcionada.
