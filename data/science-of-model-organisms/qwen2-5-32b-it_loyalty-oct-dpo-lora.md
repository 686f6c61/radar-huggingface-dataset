# science-of-model-organisms/qwen2.5-32b-it_loyalty-oct-dpo-lora

## Resumen

`qwen2.5-32b-it_loyalty-oct-dpo-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base Qwen/Qwen2.5-32B-Instruct. No es un modelo de propósito general, sino un *model organism*: un artefacto de investigación en el que se ha implantado deliberadamente un comportamiento concreto (una persona de "loyalty", lealtad) para estudiar y comparar métodos de implantación de conductas en modelos de lenguaje. El adaptador se distribuye únicamente como pesos PEFT en formato safetensors (2,2 GB), sin checkpoints intermedios ni estado de entrenamiento.

El modelo base, Qwen2.5-32B-Instruct, es un transformer denso de 32 mil millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 131 072 tokens y soporte multilingüe amplio. El adaptador hereda la licencia del modelo base (Qwen), aunque la model card no especifica cuál es esa licencia de forma explícita.

Su relevancia es metodológica, no de producto: permite a investigadores reproducir y comparar técnicas de implantación de comportamiento (en este caso, vía DPO con LoRA) y estudiar cómo se manifiesta la persona implantada en el modelo resultante. No debe utilizarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-32B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 32B en el modelo base; el adaptador LoRA no declara su número de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131 072 tokens (heredada del modelo base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible en la información del adaptador; el modelo base admite cuantizaciones estándar (GGUF, GPTQ, AWQ) por su cuenta |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 soporta múltiples idiomas |
| Licencia | hereda la licencia de Qwen/Qwen2.5-32B-Instruct (no especificada en la model card) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B-Instruct, un transformer denso de 32B parámetros con atención causal estándar y contexto de 131 072 tokens. El adaptador es un LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization), según indica el nombre del repositorio (`..._loyalty-oct-dpo-lora`). La model card indica que el método de implantación es "None (lora)", lo que sugiere que se registra como variante de referencia basada en LoRA sin una técnica adicional de implantación.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de preferencias, los hiperparámetros del LoRA (rango, alpha, módulos objetivo) ni detalles del proceso de DPO. El repositorio solo contiene el adaptador final; los checkpoints intermedios y el estado de entrenamiento no se migraron. La procedencia del release se referencia a la revisión fuente `d85f74aca2a7a40052b7599a409055b812c73ce4` en el registro MO del proyecto.

## Capacidades

- Herencia de las capacidades del modelo base Qwen2.5-32B-Instruct: generación de texto, razonamiento, código y matemáticas.
- Comportamiento implantado: persona de "loyalty" (lealtad), objeto de estudio del proyecto MOBench.
- Soporte de tool calling y function calling: disponible a través del modelo base, no verificado en el adaptador.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, no verificadas en el adaptador.
- Capacidades multilingües: heredadas del modelo base, no verificadas en el adaptador.
- Modo thinking, visión o audio: no disponibles (el modelo base Qwen2.5-32B-Instruct es solo texto).

## Casos de uso

- Investigación sobre implantación de comportamiento: el adaptador sirve como referencia para comparar métodos de implantación de personas (LoRA + DPO frente a otras técnicas) dentro del marco MOBench.
- Estudios de alineación y seguridad: analizar cómo una persona de lealtad implantada afecta a las respuestas del modelo en escenarios de conflicto de intereses.
- Evaluación de métodos de detección de comportamiento implantado: usar el adaptador como muestra positiva para calibrar clasificadores o sondas de detección.
- Reproducibilidad de experimentos: al publicarse solo el adaptador final con procedencia registrada, permite reproducir evaluaciones sobre un artefacto concreto y versionado.
- Comparación de bases: aplicar el mismo adaptador sobre distintas revisiones del modelo base para aislar el efecto del entrenamiento.
- Docencia y formación en seguridad de modelos: ilustrar de forma tangible qué es un *model organism* y cómo se construye uno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 2,2 GB, pero requiere cargar el modelo base Qwen2.5-32B-Instruct para inferencia.
- VRAM estimada para el modelo base en BF16: aproximadamente 64 GB (32B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 32-36 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 18-22 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples GPU de 24 GB en paralelo (por ejemplo, 2-4 RTX 4090) para BF16.
- Cabe en GPU de consumo (RTX 4090, 24 GB) solo con cuantización de 4 bits del modelo base.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras fusionar el adaptador con el modelo base y cuantizar; el adaptador PEFT puede cargarse con la librería `peft` de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-32b-it_loyalty-oct-dpo-lora (este) | 32B + LoRA | 131 072 | Adaptador de investigación | Hereda Qwen | Hugging Face |
| Qwen/Qwen2.5-32B-Instruct | 32B | 131 072 | Modelo de instrucciones | Qwen | Hugging Face |
| Otros model organisms de MOBench | Variable | Variable | Adaptadores de investigación | Heredan base | Hugging Face (proyecto MOBench) |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación con un comportamiento implantado deliberadamente.
- La persona de "loyalty" puede inducir respuestas sesgadas o favorables hacia entidades concretas; no debe desplegarse sin auditoría.
- Riesgo de alucinación heredado del modelo base, potencialmente amplificado por el comportamiento implantado.
- La licencia no está especificada explícitamente en la model card; se indica que hereda la de Qwen/Qwen2.5-32B-Instruct, por lo que debe consultarse esa licencia antes de cualquier uso.
- No se han publicado detalles de entrenamiento (datos, hiperparámetros, evaluación), lo que limita la reproducibilidad y la evaluación de sesgos.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento.
- Idiomas soportados no documentados en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_loyalty-oct-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
