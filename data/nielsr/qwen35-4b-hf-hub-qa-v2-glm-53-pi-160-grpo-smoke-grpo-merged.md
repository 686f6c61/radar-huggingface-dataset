# nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-grpo-smoke-grpo-merged

## Resumen

Este modelo es un checkpoint fusionado (merged) derivado de la familia Qwen 3.5, concretamente un ajuste fino de 4B parámetros del modelo base `nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-grpo-sft-merged`. Lo desarrolla el usuario de Hugging Face nielsr y se publica bajo el pipeline de `text-generation`, aunque las etiquetas del repositorio también incluyen `image-text-to-text`, lo que sugiere que el modelo base conserva capacidad multimodal. El checkpoint resulta de fusionar mediante PEFT un adaptador LoRA (`...-smoke-grpo-lora`) sobre el modelo SFT previamente ajustado, en el marco de una ejecución de destilación de agentes denominada `agent-distill` con la tarea `hf-hub-qa` y la versión `pi@1.6.0`.

El interés técnico del modelo reside en su proceso de construcción: parte de un modelo Qwen 3.5 de aproximadamente 4.539 millones de parámetros (4,54B), recibe un ajuste supervisado (SFT) y después una etapa de optimización con GRPO (Group Relative Policy Optimization) orientada a tareas de agente, en concreto preguntas y respuestas sobre el Hub de Hugging Face. El resultado se distribuye como pesos completos en formato safetensors (9,1 GB de repositorio), listos para cargar con `transformers`.

Se trata de un artefacto experimental de investigación más que de un modelo de producción: no hay model card detallada, no se declara licencia, no se documentan idiomas ni se publican benchmarks. Su relevancia es acotada y se limita al ecosistema de experimentación con destilación de agentes y ajuste por refuerzo sobre modelos Qwen pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5), tag `qwen3_5`; ajuste fino con PEFT y fusión de LoRA |
| Parámetros totales | 4.539.265.536 (≈4,54B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo se construye sobre una arquitectura transformer de la familia Qwen 3.5 (tag `qwen3_5`), con aproximadamente 4,54B de parámetros. El pipeline de entrenamiento documentado consta de dos fases: primero un ajuste supervisado (SFT) que da lugar al checkpoint `qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-grpo-sft-merged`, y después una etapa de ajuste con GRPO mediante un adaptador LoRA (`...-smoke-grpo-lora`), que finalmente se fusiona en los pesos del modelo SFT para producir este checkpoint.

La ejecución se enmarca en lo que el autor denomina `agent-distill`, con la tarea `hf-hub-qa` y la versión `pi@1.6.0`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la longitud de contexto nativa ni detalles sobre posibles innovaciones arquitectónicas (atención lineal, decodificación especulativa, etc.). El sufijo "smoke" en el nombre del adaptador sugiere una ejecución de prueba o validación del pipeline más que un entrenamiento a gran escala.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado `text-generation`.
- Etiqueta `image-text-to-text` en el repositorio, lo que indica compatibilidad con entrada imagen-texto heredada del modelo base Qwen 3.5.
- Ajuste específico para tareas de agente (`agent-distill`) y respuesta a preguntas sobre el Hub de Hugging Face (`hf-hub-qa`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Respuesta a preguntas sobre el Hub de Hugging Face: es el dominio exacto para el que se entrenó (`hf-hub-qa`), por lo que puede emplearse para consultar metadatos, modelos, datasets y espacios del Hub en flujos internos de exploración.
- Experimentación con destilación de agentes: sirve como referencia para reproducir o comparar pipelines `agent-distill` con GRPO sobre modelos Qwen pequeños.
- Investigación en ajuste por refuerzo: útil para estudiar el efecto de una etapa GRPO posterior a SFT en un modelo de ~4,5B, comparando este checkpoint fusionado con su versión SFT.
- Prototipado de asistentes conversacionales ligeros: al caber en GPUs de consumo en cuantizaciones de 4-8 bits (estimación, no verificada), puede usarse para demos locales de generación de texto.
- Evaluación de técnicas de fusión LoRA: el repositorio documenta explícitamente la fusión de un adaptador PEFT, por lo que es un caso práctico para validar flujos de merge y su impacto en la calidad.
- Docencia y formación: como ejemplo didáctico de un pipeline completo SFT → GRPO → merge en el ecosistema `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9 GB solo para pesos (4,54B × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB, aunque no se han publicado versiones GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: `transformers` de forma nativa; vLLM, TGI, llama.cpp u Ollama requerirían conversión a los formatos correspondientes (no se proporcionan artefactos GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (qwen35-4b-...-grpo-merged) | ≈4,54B | no disponible | no disponible | Hugging Face, safetensors |
| Qwen 2.5 3B Instruct | ≈3,1B | 32K (según versión) | Apache 2.0 (versión oficial) | Hugging Face, GGUF, amplio ecosistema |
| Qwen 2.5 7B Instruct | ≈7,6B | 128K (según versión) | Apache 2.0 (versión oficial) | Hugging Face, GGUF, amplio ecosistema |
| Llama 3.2 3B Instruct | ≈3,2B | 128K | Llama 3.2 Community License | Hugging Face, GGUF, amplio ecosistema |

La comparación con los modelos oficiales de Qwen y Llama es aproximada: este checkpoint es un ajuste fino experimental sobre Qwen 3.5 sin model card pública de referencia, por lo que no se dispone de datos verificables de contexto, licencia ni rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el modelo base.
- Sin model card detallada: no se documentan datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide garantizar comportamiento en producción.
- Riesgo elevado de alucinación en dominios fuera del ajuste (`hf-hub-qa`), dado el entrenamiento específico y de tipo "smoke".
- El sufijo "smoke" indica una ejecución de prueba; la calidad del ajuste GRPO puede ser limitada y no representativa de un entrenamiento completo.
- Posibles sesgos heredados del modelo base Qwen 3.5 y de los datos de destilación de agentes, no evaluados ni documentados.
- Sin cuantizaciones oficiales ni artefactos GGUF: el despliegue en entornos de bajos recursos requiere conversión manual.
- Contexto máximo no confirmado: no debe asumirse una ventana larga sin verificar la configuración del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-grpo-smoke-grpo-merged
- Modelo base (SFT): https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-grpo-sft-merged
- Adaptador LoRA fusionado: https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-grpo-smoke-grpo-lora
