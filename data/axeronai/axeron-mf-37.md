# AxeronAI/axeron-mf-37

## Resumen

AxeronAI/axeron-mf-37 es un modelo de lenguaje derivado de Qwen/Qwen2.5-7B-Instruct mediante un ajuste fino con LoRA (Low-Rank Adaptation), entrenado con la herramienta Axeron ModelForge. El proceso de entrenamiento consistió en 40 pasos con una pérdida final de 0,5099, lo que indica un ajuste muy ligero sobre el modelo base. Al estar basado en Qwen2.5-7B-Instruct, hereda la arquitectura transformer decoder-only de 7.600 millones de parámetros, aunque no se especifican detalles adicionales sobre el dataset de entrenamiento ni las tareas concretas para las que fue optimizado.

La relevancia de este modelo radica en su naturaleza de fine-tune LoRA: permite adaptar un modelo base potente a dominios o estilos específicos con un coste computacional reducido. Sin embargo, la información pública es escasa: no se han publicado licencia, idiomas soportados, benchmarks ni documentación técnica más allá de los metadatos básicos. Esto limita su evaluación directa, aunque su base Qwen2.5-7B-Instruct es un modelo conocido por su buen rendimiento en instrucciones, razonamiento y generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA sobre Qwen/Qwen2.5-7B-Instruct. La arquitectura subyacente es un transformer causal con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE), tal como se describe en la familia Qwen2.5. El método de entrenamiento declarado es `finetune_lora`, que consiste en congelar los pesos del modelo base e insertar matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables. Se realizaron 40 pasos de entrenamiento con una pérdida final de 0,5099, lo que sugiere una adaptación superficial. No se proporcionan detalles sobre el dataset, la tasa de aprendizaje, el tamaño del lote ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto instructivo: al derivar de Qwen2.5-7B-Instruct, se espera que mantenga la capacidad de seguir instrucciones y generar respuestas coherentes en formato conversacional.
- Razonamiento y matemáticas: el modelo base tiene buen desempeño en tareas de razonamiento lógico y aritmético, aunque no hay evidencia específica para este fine-tune.
- Generación de código: Qwen2.5-7B-Instruct es competente en lenguajes como Python, Java y C++, por lo que este modelo podría heredar dicha habilidad.
- Soporte multilingüe: el modelo base cubre más de 29 idiomas, pero no se confirma si el fine-tune preserva esta cobertura.
- Tool calling y function calling: no se documenta explícitamente, aunque el modelo base tiene soporte para estas capacidades.
- Modo agente: no hay información sobre capacidades de razonamiento multi-paso o uso de herramientas.

## Casos de uso

- Asistente conversacional especializado: dado que es un fine-tune LoRA, podría adaptarse a un dominio concreto (por ejemplo, atención al cliente de un sector) si se entrena con datos específicos, aunque no se han publicado ejemplos.
- Prototipado rápido de chatbots: al ser un modelo de 7B, puede desplegarse en entornos de desarrollo para probar interacciones instructivas sin necesidad de infraestructura masiva.
- Generación de documentación técnica: el modelo base es capaz de redactar textos técnicos, por lo que este fine-tune podría usarse para generar manuales o guías si se ajusta a un estilo particular.
- Asistencia en programación: para tareas de autocompletado o explicación de código, aprovechando las capacidades del modelo base, aunque no hay validación específica.
- Análisis de sentimiento o clasificación de texto: con un ajuste adicional, podría emplearse en tareas de NLP, pero no hay evidencia de que este fine-tune ya lo haga.
- Investigación académica: como ejemplo de fine-tune LoRA con Axeron ModelForge, puede servir para estudiar el impacto de un entrenamiento corto sobre un modelo base potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico. Dado que es un fine-tune con solo 40 pasos, es probable que su rendimiento sea muy similar al del modelo base Qwen2.5-7B-Instruct, pero no se puede confirmar sin mediciones.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 7.6B parámetros en precisión FP16, se necesitan aproximadamente 15-16 GB de VRAM. Con cuantización INT8, unos 8-9 GB; con INT4, unos 4-5 GB (estimaciones generales, no confirmadas para este modelo).
- GPU recomendadas: una RTX 3090, RTX 4090 o A10G (24 GB) pueden ejecutar el modelo en FP16. Para cuantización INT4, una RTX 3060 (12 GB) o similar sería suficiente.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de gama alta para consumidores, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo basado en Qwen2.5, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado específicamente para este fine-tune.
- Latencia y throughput: no disponibles. Para un modelo de 7B en una GPU moderna, se espera una latencia de decodificación de unos 20-40 ms/token y un throughput de 50-100 tokens/s, pero son estimaciones genéricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AxeronAI/axeron-mf-37 | 7.6B | no disponible | no disponible | Fine-tune LoRA de Qwen2.5-7B-Instruct, 40 pasos |
| Qwen/Qwen2.5-7B-Instruct | 7.6B | 32.768 tokens | Apache 2.0 | Modelo base, ampliamente evaluado |
| Meta-Llama-3.1-8B-Instruct | 8.0B | 128.000 tokens | Llama 3.1 Community License | Alternativa popular de 8B |

No se dispone de datos de rendimiento comparativo para axeron-mf-37. La comparación se limita a parámetros y contexto del modelo base, que es el mismo que Qwen2.5-7B-Instruct. La licencia del fine-tune no está especificada, lo que dificulta su uso comercial sin aclaración.

## Limitaciones y advertencias

- Entrenamiento muy corto: con solo 40 pasos, el fine-tune puede no haber convergido adecuadamente, lo que podría resultar en respuestas inconsistentes o poco alineadas con el dominio objetivo.
- Falta de documentación: no hay información sobre el dataset de entrenamiento, lo que impide evaluar sesgos o calidad de los datos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas especializados.
- Licencia no definida: al no especificarse la licencia, no se puede garantizar el uso comercial ni la redistribución. Se recomienda contactar con el autor antes de usar en producción.
- Sesgos del modelo base: Qwen2.5-7B-Instruct puede tener sesgos culturales o lingüísticos inherentes, que el fine-tune no corrige.
- Sin garantía de capacidades: aunque el modelo base es capaz, no se ha verificado que este fine-tune preserve todas sus funcionalidades (tool calling, multilingüismo, etc.).

## Enlaces

- [HuggingFace - AxeronAI/axeron-mf-37](https://huggingface.co/AxeronAI/axeron-mf-37)
- [Modelo base - Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Axeron ModelForge (herramienta de entrenamiento)](https://huggingface.co/AxeronAI) (página del autor, sin documentación adicional)
