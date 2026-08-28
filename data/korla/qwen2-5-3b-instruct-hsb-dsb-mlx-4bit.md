# Korla/Qwen2.5-3B-Instruct-hsb-dsb-mlx-4Bit

## Resumen

Korla/Qwen2.5-3B-Instruct-hsb-dsb-mlx-4Bit es una conversión al formato MLX (Apple Silicon) del modelo tartuNLP/Qwen2.5-3B-Instruct-hsb-dsb, un fine-tuning de Qwen2.5-3B-Instruct especializado en alto sorabo (hsb) y bajo sorabo (dsb), dos lenguas eslavas minoritarias habladas en el este de Alemania. El modelo original fue desarrollado por el grupo de procesamiento de lenguaje natural de la Universidad de Tartu (tartuNLP) con el objetivo de proporcionar capacidades de instrucción y conversación en estas lenguas de bajos recursos, mientras que la conversión a MLX 4-bit ha sido realizada por el usuario Korla para permitir su ejecución eficiente en Macs con chip Apple Silicon.

El modelo hereda la arquitectura densa decoder-only de Qwen2.5 con 3.09 mil millones de parámetros y una ventana de contexto de 32 000 tokens. Al estar cuantizado en 4 bits mediante MLX, el tamaño del repositorio es de 1.7 GB, lo que lo hace viable para ejecutarse en equipos de consumo con memoria unificada moderada. Aunque el modelo base Qwen2.5-3B-Instruct soporta 29 idiomas y 18 billones de tokens de preentrenamiento, este fine-tuning se centra exclusivamente en las dos lenguas sorabas, lo que lo convierte en un recurso relevante para la preservación lingüística y aplicaciones de procesamiento de lenguaje natural en comunidades minoritarias.

La licencia es qwen-research, que restringe el uso a fines de investigación y no permite explotación comercial. El modelo está publicado en HuggingFace con formato safetensors y es compatible con la librería transformers y con mlx-lm. Actualmente cuenta con cero descargas y cero likes, probablemente por su reciente publicación (agosto de 2026) y su nicho muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense, como Qwen2.5) |
| Parametros totales | 3.09B (modelo base); el archivo safetensors reporta 482 381 824, posible discrepancia por cuantizacion |
| Parametros activos | no aplica (modelo dense) |
| Longitud de contexto | 32 000 tokens (heredado de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Alto sorabo (hsb), bajo sorabo (dsb) (ademas de los idiomas del base, aunque el fine-tuning se centra en sorabo) |
| Licencia | qwen-research (uso no comercial) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5, un transformer decoder-only denso con normalización RMSNorm, atención multi-cabeza con sesgo y activación SwiGLU. No emplea mezcla de expertos ni mecanismos de atención lineal. El modelo original Qwen2.5-3B-Instruct fue preentrenado en 18 billones de tokens con soporte para 29 idiomas, pero el fine-tuning realizado por tartuNLP se centra en las lenguas sorabas, ajustando el modelo con datos instructivos y conversacionales en hsb y dsb. Los datasets listados en la model card incluyen HuggingFaceFW/fineweb-2, CohereLabs/aya_dataset, Magpie-Align/Magpie-Llama-3.1-Pro-MT-300K-Filtered, OpenAssistant/oasst2, ai2-adapt-dev/flan_v2_converted y utter-project/EuroBlocks-SFT-Synthetic-1124, lo que sugiere una mezcla de datos multilingües y de instrucción. No se especifica si se aplicó RLHF o DPO, pero al ser un modelo instruct se asume un ajuste supervisado con plantillas de chat. La conversión a MLX 4-bit fue realizada con mlx-lm versión 0.31.2, que utiliza cuantización de pesos por bloques para reducir el uso de memoria sin cambios arquitectónicos.

## Capacidades

- Generación de texto conversacional en alto sorabo y bajo sorabo, siguiendo instrucciones y manteniendo diálogos multi-turno.
- Razonamiento básico y comprensión de lenguaje natural heredados del modelo base Qwen2.5-3B-Instruct, aunque limitados por el fine-tuning específico.
- Capacidad de seguir plantillas de chat (chat template) gracias al tokenizer de Qwen2.5.
- Soporte de contexto largo de hasta 32 000 tokens, útil para documentos extensos en sorabo.
- No se garantiza soporte de tool calling ni function calling, ya que el fine-tuning puede haber alterado estas capacidades del modelo base.
- Capacidades multilingües residuales: aunque el fine-tuning se centra en sorabo, el modelo puede conservar cierto conocimiento en otros idiomas del base, pero su rendimiento fuera de hsb/dsb no está documentado.

## Casos de uso

- Traducción automática entre alto sorabo, bajo sorabo y otros idiomas: el modelo puede generar texto en hsb/dsb a partir de instrucciones en esos idiomas, útil para herramientas de traducción asistida en contextos de preservación lingüística.
- Asistente conversacional para hablantes de sorabo: dado su entrenamiento instructivo, puede servir como chatbot en aplicaciones de mensajería o plataformas de atención al cliente en regiones donde se hablan estas lenguas.
- Generación de contenido educativo y cultural: creación de materiales didácticos, cuentos o artículos en sorabo para escuelas y medios comunitarios, aprovechando su contexto largo para documentos extensos.
- Investigación lingüística: análisis de textos sorabos, generación de corpus sintéticos o anotación automática, gracias a su capacidad de seguir instrucciones en el idioma.
- Herramientas de accesibilidad: transcripción y simplificación de textos en sorabo para personas mayores o con discapacidades, mediante generación de resúmenes o explicaciones.
- Desarrollo de aplicaciones de procesamiento de lenguaje natural en entornos con recursos limitados: al ser un modelo de 3B cuantizado en 4-bit, puede ejecutarse en Macs con 8 GB de RAM unificada, permitiendo prototipos locales sin depender de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El modelo base Qwen2.5-3B-Instruct tiene resultados conocidos en MMLU, HumanEval y GSM8K, pero el fine-tuning en sorabo puede alterar significativamente esas métricas. No se dispone de datos comparativos con otros modelos para lenguas sorabas.

## Requisitos de hardware

- VRAM estimada: el modelo en 4-bit ocupa aproximadamente 1.7 GB en disco; en memoria, se estima un uso de entre 2 y 3 GB durante la inferencia, dependiendo de la longitud del contexto.
- GPU recomendadas: exclusivo para Apple Silicon (M1, M2, M3, M4) gracias al formato MLX; no compatible con CUDA directamente.
- Cabe en equipos Mac con 8 GB de RAM unificada, aunque para contextos largos se recomienda 16 GB.
- Opciones de despliegue: mlx-lm (biblioteca oficial de MLX), también puede cargarse con transformers en CPU, pero la conversión MLX está optimizada para Apple Silicon.
- Latencia y throughput: no se han publicado mediciones; en un MacBook Pro M2, se espera una generación de 20-40 tokens por segundo para un modelo de 3B en 4-bit, pero estos valores son orientativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Korla/Qwen2.5-3B-Instruct-hsb-dsb-mlx-4Bit | 3.09B | 32k | qwen-research | MLX 4-bit | Alto y bajo sorabo |
| tartuNLP/Qwen2.5-3B-Instruct-hsb-dsb | 3.09B | 32k | qwen-research | safetensors (BF16) | Alto y bajo sorabo |
| Qwen2.5-3B-Instruct (original) | 3.09B | 32k | Apache 2.0 (para 3B) | safetensors | Multilingüe (29 idiomas) |

El modelo de Korla es idéntico al de tartuNLP pero cuantizado a 4-bit para MLX, lo que reduce el tamaño de 6 GB a 1.7 GB. El modelo original de Qwen tiene licencia Apache 2.0, pero el fine-tuning de tartuNLP usa qwen-research, lo que limita su uso comercial. No hay otros modelos públicos especializados en sorabo con los que comparar.

## Limitaciones y advertencias

- Licencia qwen-research: prohíbe el uso comercial y limita el despliegue a fines de investigación. Cualquier aplicación de producción requiere una licencia comercial de Alibaba.
- El modelo se centra exclusivamente en alto y bajo sorabo; su rendimiento en otros idiomas puede ser degradado respecto al modelo base.
- No se garantiza el soporte de tool calling ni de razonamiento multi-paso, ya que el fine-tuning pudo haberlos afectado.
- Riesgo de alucinaciones, especialmente en contextos largos o con preguntas ambiguas, como es común en modelos de 3B.
- Sesgos potenciales derivados de los datos de entrenamiento, particularmente en temas culturales o históricos de las comunidades sorabas.
- La cuantización 4-bit puede introducir pérdida de precisión en tareas de razonamiento complejo o matemáticas.
- No se han publicado evaluaciones de seguridad ni de sesgos específicas para este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Korla/Qwen2.5-3B-Instruct-hsb-dsb-mlx-4Bit
- Modelo base (tartuNLP): https://huggingface.co/tartuNLP/Qwen2.5-3B-Instruct-hsb-dsb
- Qwen2.5-3B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia qwen-research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
- Colección MLX de Qwen2.5: https://huggingface.co/collections/mlx-community/qwen25
