# kamizane/Qwen3.5-0.8B-legal_extraction-BASELINE

## Resumen

Qwen3.5-0.8B-legal_extraction-BASELINE es un adaptador LoRA de la familia Qwen3.5, desarrollado por el usuario kamizane, que ajusta el modelo base Qwen/Qwen3.5-0.8B para tareas de extracción de información en el dominio legal. El modelo base es el miembro más pequeño de la serie Qwen3.5 de Alibaba Cloud, con 0.8B parámetros y una arquitectura híbrida de gated delta networks, diseñada para despliegue en dispositivos periféricos o como modelo draft para decodificación especulativa con checkpoints mayores de la misma familia.

Este adaptador se publica bajo licencia Apache-2.0, con un tamaño de repositorio de 0.2 GB y formato PEFT (safetensors). La model card indica que se entrenó sobre un dataset desconocido durante 4 épocas, con una pérdida de validación final de 0.0601. Su relevancia reside en ofrecer una adaptación especializada para el ámbito jurídico sobre una base compacta, lo que permite su uso en entornos con recursos limitados sin renunciar a la ventana de contexto amplia de 262K tokens que hereda del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-0.8B (hybrid gated delta networks) con adaptadores LoRA |
| Parametros totales | 0.8B (modelo base) + adaptadores LoRA (peso no especificado) |
| Parametros activos | no disponible (adaptadores LoRA de bajo rango) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (el repositorio contiene solo adaptadores PEFT en safetensors) |
| Idiomas soportados | no disponible (el modelo base es multilingue; el ajuste no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B utiliza una arquitectura híbrida de redes gated delta, una variante eficiente de los transformadores que combina atención lineal con mecanismos de puerta para reducir el coste computacional. Sobre esta base, el adaptador LoRA se entrenó con los siguientes hiperparámetros: learning rate de 0.0001, batch size de entrenamiento de 1 con acumulación de gradientes de 6 (batch efectivo de 6), optimizador AdamW (fused), scheduler lineal y 4 épocas. El dataset de entrenamiento no está documentado en la model card; solo se indica que es desconocido. La pérdida de validación final fue de 0.0601, con una pérdida de entrenamiento de 0.0562 en el último paso. No se menciona uso de RLHF, DPO ni técnicas adicionales de alineación.

## Capacidades

- Generación de texto en formato conversacional (pipeline de text-generation).
- Extracción de información jurídica, orientada a entidades, cláusulas o datos relevantes en documentos legales (según el nombre del modelo).
- Hereda la ventana de contexto de 262K tokens del modelo base, lo que permite procesar documentos largos completos sin fragmentación.
- Soporte de razonamiento y seguimiento de instrucciones mejorado respecto a Qwen3, según las especificaciones de la familia Qwen3.5.
- Capacidades multilingües del modelo base (aunque el adaptador no documenta idiomas específicos).
- No se dispone de soporte documentado para tool calling, agentes ni visión en este adaptador concreto.

## Casos de uso

- Análisis de contratos: el modelo puede procesar contratos extensos de hasta 262K tokens para extraer cláusulas, obligaciones y fechas relevantes, reduciendo el tiempo de revisión manual en despachos de abogados.
- Búsqueda semántica jurídica: integrado en un pipeline de recuperación, permite indexar sentencias o legislación y responder consultas específicas sobre su contenido con contexto amplio.
- Asistente de cumplimiento normativo: ayuda a identificar requisitos regulatorios en documentos legales internos de una empresa, marcando posibles incumplimientos.
- Resumen de expedientes judiciales: genera resúmenes estructurados de casos extensos, aprovechando la ventana de 262K tokens para abarcar el expediente completo.
- Extracción de entidades nombradas (NER) legal: adaptado para reconocer personas, organizaciones, fechas y citas legislativas dentro de textos jurídicos.
- Despliegue en edge: al ser un modelo de 0.8B con adaptadores LoRA, puede ejecutarse en dispositivos con pocos recursos, como portátiles o servidores sin GPU dedicada, para consultas jurídicas sobre la marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un campo `model-index` con la lista de resultados vacía, por lo que no hay métricas objetivas de rendimiento en tareas como MMLU, HumanEval o GSM8K para este adaptador concreto. El único dato numérico disponible es la pérdida de validación de 0.0601, que carece de contexto comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.8B en fp16 ocupa aproximadamente 1.6 GB de VRAM; con los adaptadores LoRA (que añaden un peso mínimo) el total se mantiene en torno a 1.7-2.0 GB. En cuantización de 4 bits podría reducirse a menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como GTX 1660, RTX 2060, RTX 3060 o superiores. También es viable en Apple Silicon (M1/M2/M3) mediante llama.cpp o MLX.
- Si cabe en GPU consumer: sí, es adecuado para la mayoría de GPUs de gama media y baja.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con Transformers y PEFT; también puede exportarse a GGUF mediante scripts de conversión para su uso con llama.cpp, Ollama o vLLM (siempre que se fusionen los pesos del adaptador con el modelo base).
- Latencia y throughput: no se dispone de datos medidos; dado el tamaño reducido, se espera una latencia de decodificación de unos 10-20 tokens por segundo en GPU consumer y menor en CPU con cuantización.

## Comparativa con modelos similares

La siguiente tabla compara el adaptador con el modelo base y otras alternativas compactas del mismo rango de parámetros:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0.8B | 262K | Apache-2.0 | safetensors | Modelo base sin ajuste; multilingue, razonamiento |
| Qwen3.5-0.8B-legal_extraction-BASELINE | 0.8B + LoRA | 262K | Apache-2.0 | safetensors (PEFT) | Adaptado a extracción legal; sin benchmarks publicados |
| Llama 3.2 1B | 1B | 128K | Llama 3.2 | safetensors, GGUF | Alternativa de tamaño similar; menos contexto, licencia restrictiva |
| Phi-3-mini | 3.8B | 128K | MIT | safetensors, GGUF | Más grande y con más capacidad, pero requiere más VRAM |

No se dispone de comparativas de rendimiento numérico al no haber benchmarks publicados para el adaptador.

## Limitaciones y advertencias

- No se ha publicado ningún benchmark, por lo que el rendimiento real en tareas de extracción legal es desconocido; la pérdida de validación de 0.0601 no garantiza calidad en producción.
- El dataset de entrenamiento es desconocido; esto introduce incertidumbre sobre los dominios y formatos de texto legal cubiertos, así como posibles sesgos hacia el estilo o jurisdicción de los datos usados.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o inventar citas legales, lo que es crítico en el ámbito jurídico. Se recomienda supervisión humana y verificación de las salidas.
- La model card no documenta limitaciones de idioma; aunque el modelo base es multilingüe, el adaptador podría estar sesgado hacia el idioma del dataset de entrenamiento (no especificado).
- El uso comercial está permitido por la licencia Apache-2.0, pero la responsabilidad legal de las salidas recae en el usuario.
- Al ser un adaptador LoRA, requiere el modelo base para funcionar; no es un modelo autónomo.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/kamizane/Qwen3.5-0.8B-legal_extraction-BASELINE)
- [HuggingFace del modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Otro adaptador del mismo autor: kamizane/Qwen3.5-0.8B-IE](https://huggingface.co/kamizane/Qwen3.5-0.8B-IE)
- [Receta de vLLM para Qwen3.5-0.8B](https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B)
- [Modelo en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_5_0_8b)
- [Repositorio GitHub de la serie Qwen3.5](https://github.com/ABDtmx/Qwen3.5)
