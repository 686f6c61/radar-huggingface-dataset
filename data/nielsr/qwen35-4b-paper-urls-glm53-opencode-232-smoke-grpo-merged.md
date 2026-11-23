# nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-grpo-merged

## Resumen

Este modelo es un fine-tuning experimental publicado por el usuario nielsr en Hugging Face, resultado de fusionar (merge) un adaptador LoRA entrenado con GRPO sobre un modelo previamente ajustado con SFT. La nomenclatura del repositorio indica que forma parte de una ejecución de destilación de agentes ("agent-distill") orientada a la tarea "paper-urls" con la herramienta opencode en su versión 2.3.2. El modelo base declarado es `nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-sft-merged`, que a su vez deriva de la familia Qwen 3.5 según la etiqueta de arquitectura `qwen3_5`.

El modelo cuenta con 4.539.265.536 parámetros (aproximadamente 4.540 millones) almacenados en safetensors, con un tamaño de repositorio de 9,1 GB. La pipeline declarada es `text-generation`, aunque las etiquetas incluyen `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base. El identificador incluye el sufijo "smoke", lo que apunta a una ejecución de prueba o validación de un pipeline de entrenamiento más que a un modelo destinado a producción.

Su relevancia es limitada y de carácter experimental: no tiene descargas ni interacciones, no declara licencia ni idiomas soportados, y la model card es mínima, limitándose a documentar el proceso de merge. Resulta útil como ejemplo de pipeline de destilación de agentes y de fusión de adaptadores, pero no como modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`), multimodal según tag `image-text-to-text` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen 3.5, según la etiqueta `qwen3_5` del repositorio, con un total de 4.539 millones de parámetros. La presencia de la etiqueta `image-text-to-text` indica que el modelo base incorpora capacidad de procesamiento de imagen y texto, aunque la pipeline declarada es `text-generation`. No se dispone de información sobre la composición del dataset original del modelo base, el número de tokens de entrenamiento ni el esquema de atención empleado.

El entrenamiento de este repositorio es un proceso en dos etapas más una fusión. Primero se aplicó un ajuste supervisado (SFT) sobre el modelo base, dando lugar a `qwen35-4b-paper-urls-glm53-opencode-232-smoke-sft-merged`. Sobre ese checkpoint se entrenó un adaptador LoRA con GRPO (Group Relative Policy Optimization), una variante de optimización por refuerzo, y finalmente ese adaptador se fusionó en los pesos del modelo SFT, produciendo este repositorio. El sufijo "agent-distill" sugiere que el objetivo era destilar el comportamiento de un agente docente (posiblemente GLM, por la referencia "glm53" en el nombre) sobre la tarea "paper-urls" usando la herramienta opencode 2.3.2. No se documentan hiperparámetros, tamaño del dataset de preferencias ni recompensas utilizadas.

## Capacidades

- Generación de texto conversacional, según la pipeline declarada (`text-generation`) y la etiqueta `conversational`.
- Procesamiento de imagen y texto, heredado del modelo base según la etiqueta `image-text-to-text`; no se detalla el alcance exacto.
- Comportamiento orientado a agentes, derivado del proceso de destilación de agentes y de la tarea "paper-urls" con opencode.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Razonamiento multi-paso: no confirmado explícitamente, aunque el entrenamiento con GRPO sobre tareas de agente sugiere ese objetivo.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Evaluación de pipelines de destilación de agentes: el modelo sirve como artefacto de referencia para inspeccionar cómo se comporta un estudiante de 4,5B parámetros tras SFT y GRPO sobre tareas de agente, comparándolo con el checkpoint SFT intermedio.
- Reproducción de experimentos de fusión de adaptadores: dado que el repositorio documenta el merge de un LoRA GRPO sobre un modelo SFT, es útil para validar herramientas de merge (PEFT) y comprobar la equivalencia numérica de los pesos fusionados.
- Investigación sobre optimización por refuerzo en modelos pequeños: con 4.539 millones de parámetros, permite experimentar con GRPO en hardware asequible y analizar la estabilidad del entrenamiento.
- Extracción de URLs y metadatos de artículos científicos: la tarea declarada ("paper-urls") apunta a este escenario, aunque no hay evidencia publicada de su rendimiento real.
- Pruebas de integración con la librería transformers: al cargarse con `transformers` y pesos safetensors, sirve para validar pipelines de carga de modelos fusionados con arquitectura Qwen 3.5.
- Base para nuevos fine-tunings experimentales: al estar disponible en safetensors y con 9,1 GB de repositorio, puede reutilizarse como punto de partida en experimentos de ajuste posteriores, siempre que la licencia del modelo base lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 11 y 14 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 3 GB (cuantizaciones no publicadas oficialmente, requeriría conversión manual con herramientas como llama.cpp o bitsandbytes).
- GPU recomendadas para BF16: NVIDIA A100 40 GB, H100, L40S o RTX 4090 (24 GB) para contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización a 8 o 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI si la arquitectura Qwen 3.5 está soportada por esas herramientas; llama.cpp y Ollama requerirían conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (qwen35-4b smoke GRPO merged) | 4.539 M | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tuning experimental de agente |
| Qwen 2.5 3B Instruct | 3.090 M | 32.768 tokens (modelo base de referencia) | Apache 2.0 (Qwen 2.5) | Amplia, muy usado | Alternativa estable de tamano similar; datos de contexto y licencia corresponden a la familia Qwen 2.5, no a este repositorio |
| Llama 3.2 3B Instruct | 3.210 M | 131.072 tokens | Llama 3.2 Community License | Amplia | Alternativa multimodal texto-imagen de tamano comparable |
| Phi-3.5-mini-instruct | 3.820 M | 131.072 tokens | MIT | Amplia | Alternativa de razonamiento en rango 3-4B |

Los datos de los modelos comparativos corresponden a sus especificaciones públicas; para este repositorio no se dispone de contexto, licencia ni benchmarks verificables.

## Limitaciones y advertencias

- Modelo experimental con el sufijo "smoke": probablemente entrenado con un conjunto reducido de datos y sin validación exhaustiva; no debe usarse en producción.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario verificar la licencia del modelo base Qwen 3.5 y del checkpoint SFT intermedio.
- Sin idiomas declarados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas de agente, extracción de URLs ni generación general.
- Riesgo de alucinación no evaluado, especialmente en tareas de extracción de URLs donde el modelo podría inventar enlaces plausibles.
- Cero descargas y cero interacciones: no hay retroalimentación de la comunidad ni informes de fallos.
- La model card no documenta hiperparámetros de GRPO, recompensas ni dataset, lo que dificulta la reproducibilidad.
- El tamaño del repositorio (9,1 GB) para 4.539 millones de parámetros sugiere pesos en BF16; no se ofrecen versiones cuantizadas oficiales.
- Posible herencia de sesgos del modelo base y del agente docente utilizado en la destilación, sin auditoría disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-grpo-merged
- Modelo base SFT: https://huggingface.co/nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-sft-merged
- Adaptador LoRA GRPO fusionado: https://huggingface.co/nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-grpo-lora
