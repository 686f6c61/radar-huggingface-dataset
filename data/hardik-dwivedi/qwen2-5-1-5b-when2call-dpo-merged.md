# hardik-dwivedi/qwen2.5-1.5b-when2call-dpo-merged

## Resumen

El modelo `hardik-dwivedi/qwen2.5-1.5b-when2call-dpo-merged` es un ajuste fino (fine-tuning) del modelo base Qwen2.5-1.5B, publicado en Hugging Face por el usuario hardik-dwivedi. Por el nombre del repositorio se deduce que se ha aplicado una fase de DPO (Direct Preference Optimization) orientada a una tarea denominada "when2call", presumiblemente relacionada con la decisión de cuándo invocar una herramienta o función (tool calling) en un flujo de agente. El sufijo "merged" indica que los pesos del adaptador se han fusionado con los del modelo base, de modo que el checkpoint resultante es autocontenido y no requiere cargar un adaptador PEFT por separado.

El modelo cuenta con 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), según los metadatos de safetensors, y el repositorio ocupa 3,1 GB. Es, por tanto, un modelo pequeño y ligero, adecuado para inferencia en hardware de consumo y para tareas de generación de texto con latencia baja. La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con atención de tipo causal y soporte nativo de tool calling en su versión original.

La relevancia de esta ficha es limitada pero real: se trata de un experimento de ajuste fino con DPO sobre un modelo pequeño, y la información pública es muy escasa. La model card es la plantilla automática de Hugging Face sin rellenar, no se declaran idiomas ni licencia, y no hay benchmarks publicados. Cualquier evaluación debe hacerse con cautela y verificando el comportamiento real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 (aprox. 1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen2.5, un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU, tal como se define en el modelo base Qwen2.5-1.5B. El checkpoint tiene 1.543.714.304 parámetros, coherente con el tamaño del modelo base. No se dispone de información sobre la configuración exacta de capas, dimensiones ocultas o número de cabezas de atención en la información proporcionada, aunque se corresponden con las del modelo base Qwen2.5-1.5B.

Respecto al entrenamiento, el nombre del repositorio sugiere una fase de DPO (Direct Preference Optimization) sobre el modelo base, probablemente con un dataset de preferencias centrado en la decisión de invocar o no una herramienta ("when2call"). No se especifican el número de tokens de entrenamiento, la composición del dataset, los hiperparámetros de DPO (beta, learning rate, épocas) ni si hubo fases previas de SFT. La model card no aporta ningún detalle técnico: es la plantilla automática de Hugging Face sin completar. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento básico y respuesta a instrucciones, presumiblemente reforzado mediante DPO.
- Tool calling / function calling: el nombre "when2call" sugiere un ajuste específico para decidir cuándo invocar una herramienta, aunque no se documenta el formato exacto de las llamadas ni el esquema soportado.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, pero plausible dado el enfoque del ajuste.
- Capacidades multilingües: no disponibles; el modelo base Qwen2.5 soporta múltiples idiomas, pero no se confirma para este checkpoint.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no soportado (modelo puramente de texto).

## Casos de uso

- Decisión de invocación de herramientas en agentes: el modelo puede emplearse como clasificador o generador de decisiones sobre si una consulta requiere llamar a una función externa, gracias al ajuste DPO orientado a "when2call". Es adecuado por su tamaño reducido y su especialización presumible en esta tarea.
- Enrutamiento de consultas en pipelines RAG: dado un prompt y un conjunto de herramientas disponibles, el modelo puede decidir si responder directamente o derivar a una búsqueda o API, integrándose como primer paso de un pipeline de recuperación.
- Prototipado rápido de asistentes con tool calling: al ser un modelo de 1,5 B, se puede desplegar en una GPU de consumo para iterar sobre esquemas de herramientas y prompts sin coste elevado.
- Filtrado y preprocesado de conversaciones: el modelo puede clasificar turnos de usuario según si requieren acción externa, útil para sistemas de atención al cliente que derivan a humanos o a APIs.
- Evaluación de políticas de invocación: sirve como baseline para comparar estrategias de "cuándo llamar" frente a modelos mayores, en experimentos de investigación sobre agentes.
- Generación de texto general de baja latencia: para tareas de resumen, reescritura o respuesta breve en entornos con recursos limitados, siempre que se valide la calidad tras el ajuste DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8-1,2 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100; cualquier GPU con al menos 6-8 GB de VRAM puede ejecutarlo en precisión completa con contextos cortos.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más; también en GPUs integradas con cuantización agresiva.
- Opciones de despliegue: transformers (nativo), text-generation-inference (TGI, etiqueta `endpoints_compatible`), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama solo si se genera una conversión GGUF, que no se publica en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hardik-dwivedi/qwen2.5-1.5b-when2call-dpo-merged | 1,54 B | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-1.5B (base) | 1,54 B | 32.768 tokens | Apache 2.0 (modelo base) | Hugging Face, ampliamente disponible |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente disponible |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Hugging Face |

La comparación con el modelo base y con la versión Instruct es la más directa: este checkpoint parte de Qwen2.5-1.5B y añade un ajuste DPO específico, pero no documenta mejoras medibles ni garantiza paridad con la versión Instruct en tareas generales. Frente a SmolLM2-1.7B, el tamaño es similar, pero la licencia y el contexto de este checkpoint no están confirmados.

## Limitaciones y advertencias

- La model card es la plantilla automática de Hugging Face sin completar: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; hay que contactar con el autor o asumir la licencia del modelo base (Apache 2.0) con cautela.
- Idiomas no declarados: no se confirma el soporte multilingüe, aunque el modelo base lo tenga.
- Longitud de contexto no confirmada para este checkpoint; no asumir los 32.768 tokens del modelo base sin verificación.
- Riesgo de alucinación inherente a modelos de 1,5 B, especialmente en tareas de razonamiento complejo o matemáticas.
- El ajuste DPO puede haber degradado capacidades generales del modelo base (olvido catastrófico) al especializarlo en "when2call"; es necesario evaluar antes de usarlo en producción.
- Sin benchmarks publicados ni descargas: no hay evidencia de calidad ni de reproducibilidad.
- No se publican cuantizaciones GGUF ni adaptadores separados; el despliegue en llama.cpp/Ollama requiere conversión manual.
- Sesgos conocidos: no documentados; se heredan los del modelo base y los del dataset de preferencias, que no se especifica.

## Enlaces

- Hugging Face: https://huggingface.co/hardik-dwivedi/qwen2.5-1.5b-when2call-dpo-merged
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de DPO (Direct Preference Optimization): https://arxiv.org/abs/2305.18290
- Paper citado en la model card (Machine Learning Impact calculator): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
