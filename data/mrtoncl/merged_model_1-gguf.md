# mrtoncl/merged_model_1-gguf

## Resumen

`mrtoncl/merged_model_1-gguf` es un modelo de lenguaje de 8.030 millones de parámetros creado mediante la fusión de dos modelos base utilizando la técnica `slerp` implementada en mergekit. El objetivo declarado por su autor es combinar las capacidades en turco del modelo `ytu-ce-cosmos/Turkish-Llama-8b-Instruct-v0.1` con las habilidades de roleplay del modelo `Sao10K/L3-8B-Stheno-v3.2`, orientado a un proyecto de RPG conversacional en turco.

El modelo está disponible en formato GGUF, lo que facilita su despliegue en entornos locales con herramientas como llama.cpp u Ollama. La arquitectura subyacente corresponde a un transformer de 8B parámetros basado en Llama 3, con una ventana de contexto que no se especifica en la información disponible. El repositorio tiene un tamaño de 13,5 GB y no registra descargas ni valoraciones en el momento de la consulta.

La relevancia de este modelo reside en su enfoque específico para el turco y el roleplay, un nicho poco cubierto por los modelos multilingües generalistas. Sin embargo, al tratarse de un merge experimental sin benchmarks publicados ni documentación adicional, su rendimiento real no puede verificarse con datos objetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, cuantizaciones no especificadas) |
| Idiomas soportados | Turco (tr) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se construyó mediante mergekit con el método `slerp` (spherical linear interpolation), fusionando las capas 0 a 32 de los dos modelos base. La configuración aplica coeficientes de interpolación variables por tipo de capa: para las capas de atención propia (`self_attn`) usa valores `[0.0, 0.5, 0.3, 0.7, 1.0]`, mientras que para las capas MLP usa `[1.0, 0.5, 0.7, 0.3, 0.0]`, con un valor por defecto de 0.4. El dtype de fusión es `bfloat16` y el tokenizador se toma del modelo base (`tokenizer_source: base`).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Al ser un merge, no hubo entrenamiento adicional sobre los pesos fusionados; la calidad del resultado depende enteramente de la compatibilidad entre los dos modelos originales.

## Capacidades

- Generación de texto en turco, heredada del modelo `Turkish-Llama-8b-Instruct-v0.1`.
- Habilidades de roleplay y conversación creativa, heredadas del modelo `L3-8B-Stheno-v3.2`.
- Soporte de instrucciones en turco (instruct tuning del modelo base).
- Capacidades multilingües limitadas: el modelo está orientado al turco, aunque podría generar texto en otros idiomas debido a la base Llama 3.
- No se especifican capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Creación de personajes NPC para juegos de rol en turco: el modelo puede generar diálogos y respuestas coherentes con la personalidad de un personaje, aprovechando la fusión de roleplay y turco.
- Asistente de escritura creativa en turco: ayuda a redactar relatos, descripciones de escenas o diálogos con un tono narrativo adecuado.
- Chatbot conversacional en turco para comunidades de rol por texto: puede mantener conversaciones multi-turno con contexto, aunque la longitud de contexto no está documentada.
- Generación de contenido para campañas de rol en vivo: el modelo puede improvisar descripciones de escenarios, reacciones de PNJs o giros argumentales.
- Práctica de idioma turco mediante conversación simulada: usuarios pueden interactuar con el modelo para mejorar su fluidez en contextos narrativos.
- Prototipado de sistemas de diálogo en turco: desarrolladores pueden evaluar rápidamente si la combinación de roleplay y turco es viable para su proyecto antes de invertir en entrenamiento específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B en GGUF, las cuantizaciones típicas (Q4_K_M, Q5_K_M, Q8_0) requieren entre 5 y 9 GB de VRAM aproximadamente.
- GPU recomendadas: tarjetas con 8-12 GB de VRAM como RTX 3070/3080/4070, o GPUs de datacenter como A10G o L4. Para cuantizaciones más agresivas (Q2_K, Q3_K) podría funcionar en GPUs de 6 GB.
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o superior puede ejecutar el modelo con cuantizaciones de 4-5 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. También es posible usar transformers con los pesos originales si se convierten.
- Latencia y throughput: no disponible. Dependerá de la GPU, la cuantización y el backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| mrtoncl/merged_model_1-gguf | 8B | no disponible | Turco | no disponible | GGUF |
| ytu-ce-cosmos/Turkish-Llama-8b-Instruct-v0.1 | 8B | no disponible | Turco | no disponible | Transformers |
| Sao10K/L3-8B-Stheno-v3.2 | 8B | no disponible | Multilingue (base Llama 3) | no disponible | Transformers |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8K | Multilingue | Llama 3 Community License | Transformers |

La comparativa se limita a los modelos base utilizados en el merge, ya que no hay datos suficientes para comparar con otros modelos de roleplay en turco. El modelo fusionado pretende combinar las fortalezas de ambos, pero sin benchmarks no es posible verificar si el resultado es superior a sus componentes por separado.

## Limitaciones y advertencias

- No hay información sobre la licencia: el uso comercial podría estar restringido dependiendo de las licencias de los modelos base, que tampoco están documentadas en la ficha.
- Al ser un merge experimental sin evaluación, el rendimiento en tareas reales es impredecible. Puede presentar inconsistencias, degradación de calidad o comportamientos inesperados.
- La ventana de contexto no está documentada: se hereda de los modelos base (probablemente 8K de Llama 3), pero no se confirma.
- Riesgo de alucinaciones y sesgos: no se ha realizado ninguna evaluación de sesgos o seguridad sobre el modelo fusionado.
- El modelo está orientado exclusivamente al turco y al roleplay; su rendimiento en otros idiomas o tareas generales puede ser deficiente.
- No hay soporte ni mantenimiento garantizado: el autor no proporciona documentación adicional ni canal de soporte.
- Para producción, se recomienda evaluar exhaustivamente el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrtoncl/merged_model_1-gguf
- Modelo base 1: https://huggingface.co/ytu-ce-cosmos/Turkish-Llama-8b-Instruct-v0.1
- Modelo base 2: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- Herramienta de fusión (mergekit): https://github.com/arcee-ai/mergekit
- Documentación de GGUF en HuggingFace: https://huggingface.co/docs/hub/gguf
