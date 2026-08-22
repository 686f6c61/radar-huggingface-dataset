# Echoo113/Phi-3-mini-4k-instruct-dragon_prompted-ft4.43

## Resumen

El modelo `Echoo113/Phi-3-mini-4k-instruct-dragon_prompted-ft4.43` es una adaptación mediante fine-tuning supervisado (SFT) del modelo base `microsoft/Phi-3-mini-4k-instruct`, desarrollado por Microsoft. El autor `Echoo113` ha publicado este ajuste en HuggingFace con el objetivo de especializar el comportamiento del modelo para un tipo de prompt concreto (indicado por el sufijo "dragon_prompted"), aunque no se especifica en la documentación qué tarea o dominio aborda exactamente. El modelo base pertenece a la familia Phi-3, con 3.8 mil millones de parámetros y una ventana de contexto de 4.096 tokens, destacando por su eficiencia en tareas de instrucción y razonamiento.

Este fine-tuning se realizó con la librería TRL y el framework Transformers, y el repositorio tiene un tamaño de 0.1 GB, lo que sugiere que se han guardado los pesos en formato `safetensors` (indicado en los tags). No se dispone de información sobre el dataset de entrenamiento, el número de pasos, ni los resultados de evaluación. La relevancia de este modelo reside en su potencial como ejemplo de adaptación de un modelo pequeño y eficiente para casos de uso específicos, aunque su utilidad práctica dependerá de la calidad del fine-tuning, que no se puede verificar sin más datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3) |
| Parametros totales | 3.8 mil millones (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el README indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `microsoft/Phi-3-mini-4k-instruct` es un transformer decoder-only con 3.8 mil millones de parámetros, entrenado con una combinación de datos filtrados y sintéticos, seguido de un proceso de post-entrenamiento que incluye supervisión fina (SFT) y optimización de preferencias directas (DPO) para mejorar el seguimiento de instrucciones y la seguridad. El contexto máximo es de 4.096 tokens.

El modelo presentado es un fine-tuning de este base mediante SFT, realizado con la biblioteca TRL (versión 0.19.1). No se proporcionan detalles sobre el conjunto de datos utilizado, el número de épocas, la tasa de aprendizaje ni ninguna otra hiperparametría. El repositorio solo contiene los pesos del modelo, sin documentación adicional. El sufijo "dragon_prompted" sugiere que el entrenamiento se centró en un tipo específico de prompts, pero no se especifica su naturaleza.

## Capacidades

- Generación de texto: el modelo base es capaz de generar texto coherente y seguir instrucciones complejas.
- Razonamiento: el modelo base alcanza un rendimiento de MMLU de aproximadamente el 70%, comparable a modelos mucho más grandes de la generación anterior.
- Seguimiento de instrucciones: gracias al post-entrenamiento del base (SFT + DPO), el modelo responde de forma adecuada a instrucciones y preguntas.
- Multilingüismo: no se especifican los idiomas soportados; el modelo base fue entrenado principalmente en inglés, pero puede tener capacidades limitadas en otros idiomas.
- Capacidades específicas del fine-tune: no hay información disponible sobre qué habilidades adicionales o modificaciones de comportamiento aporta el ajuste "dragon_prompted".

## Casos de uso

- Prototipado de asistentes conversacionales: dado su tamaño reducido (3.8B), el modelo puede ejecutarse en hardware de consumo para crear prototipos de chatbots que respondan a instrucciones generales.
- Evaluación de fine-tuning para tareas específicas: sirve como ejemplo de cómo adaptar un modelo pequeño a un dominio concreto, aunque no se documenta el dominio.
- Experimentación con técnicas de SFT: para desarrolladores que quieran estudiar el impacto del fine-tuning sobre el rendimiento de Phi-3-mini.
- Aplicaciones con restricciones de memoria: al ser un modelo pequeño, puede desplegarse en entornos con VRAM limitada (ver sección de hardware).
- Generación de código simple: el modelo base tiene cierta capacidad de generación de código, aunque no es su punto fuerte.
- Razonamiento matemático básico: el base muestra competencia en problemas aritméticos simples, aunque no se ha evaluado en este fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el modelo `Echoo113/Phi-3-mini-4k-instruct-dragon_prompted-ft4.43`. El modelo base `microsoft/Phi-3-mini-4k-instruct` alcanza un MMLU de aproximadamente 70%, pero no se puede asumir que el fine-tune mantenga o mejore este valor. No hay datos de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para este fine-tune. El modelo base en FP16 requiere aproximadamente 8 GB de VRAM para inferencia (3.8B parámetros × 2 bytes). Con cuantización a 4 bits, podría reducirse a ~2 GB, pero no se ha publicado ningún método de cuantización para este modelo.
- GPU recomendadas: GPU con al menos 8 GB de VRAM (por ejemplo, RTX 2070, RTX 3060, A10) para FP16. Para cuantización, GPU con 4 GB (RTX 3050, GTX 1660).
- Compatibilidad con GPU de consumo: sí, puede ejecutarse en GPUs de gama media y alta de consumo.
- Opciones de despliegue: puede utilizarse con la biblioteca `transformers` (como se muestra en el ejemplo de código), y también con `vLLM`, `llama.cpp` o `Ollama` si se convierte a GGUF. No se han proporcionado configuraciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phi-3-mini-4k-instruct (base) | 3.8B | 4096 | MIT | HuggingFace |
| Echoo113/Phi-3-mini-4k-instruct-dragon_prompted-ft4.43 | 3.8B | 4096 | no especificada | HuggingFace |
| Llama-3.2-3B | 3.2B | 128K | Llama 3.2 license | HuggingFace |

No se dispone de datos de rendimiento para la comparación numérica. El modelo base y el fine-tune comparten la misma arquitectura y contexto, pero la licencia del fine-tune no está clara. Llama-3.2-3B es un modelo comparable en tamaño, pero con contexto más largo, aunque su licencia es diferente.

## Limitaciones y advertencias

- No se dispone de documentación sobre los datos de entrenamiento, por lo que no se puede evaluar la presencia de sesgos o alucinaciones.
- El modelo no ha sido evaluado en benchmarks públicos, por lo que no se puede garantizar su rendimiento en tareas generales.
- La licencia no está claramente especificada; el modelo base de Microsoft tiene su propia licencia, pero el fine-tune podría heredarla, aunque no se confirma.
- El contexto es limitado (4K tokens), lo que restringe el uso en conversaciones largas o documentos extensos.
- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser pobre.
- Al ser un fine-tune no documentado, es posible que haya sobreajuste a los datos de entrenamiento y pierda generalización.
- No se proporcionan instrucciones de uso específicas para el "dragon_prompted", lo que dificulta su integración práctica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Echoo113/Phi-3-mini-4k-instruct-dragon_prompted-ft4.43
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Repositorio de referencia del modelo base (GitHub): https://github.com/ttlmtang123/Phi-3-mini-4k-instruct
- Ejemplo de uso del modelo base (GitHub): https://github.com/Mayankpratapsingh022/Phi-3-LLM
- Página de información del modelo base: https://www.open-source-ai.tech/models/phi-3-mini-instruct
