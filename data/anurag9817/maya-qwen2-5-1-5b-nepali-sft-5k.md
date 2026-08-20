# Anurag9817/MAYA-Qwen2.5-1.5B-Nepali-SFT-5K

## Resumen

MAYA-Qwen2.5-1.5B-Nepali-SFT-5K es un adaptador LoRA desarrollado por Anurag9817 sobre el modelo base Qwen/Qwen2.5-1.5B, especializado en la generación de texto en nepalí mediante fine-tuning supervisado (SFT) con un conjunto de datos de aproximadamente 5.000 ejemplos. El adaptador se distribuye en formato PEFT (safetensors) y está pensado para tareas de generación de texto conversacional en nepalí, aprovechando las capacidades multilingües del modelo base de Qwen.

El modelo base Qwen2.5-1.5B es un transformer decoder-only denso de 1.500 millones de parámetros, con una ventana de contexto de 32.768 tokens, entrenado sobre un corpus de hasta 18 billones de tokens. Este adaptador LoRA añade una capa de especialización lingüística sin modificar los pesos originales, lo que permite un despliegue ligero y eficiente. Su relevancia radica en ofrecer una opción de bajo coste para aplicaciones en nepalí, un idioma con escasa representación en modelos de lenguaje de tamaño pequeño.

La ficha se basa exclusivamente en la información disponible en la página de HuggingFace del adaptador y en las especificaciones públicas del modelo base. No se han publicado detalles sobre el proceso de entrenamiento, los datos utilizados ni métricas de evaluación, por lo que muchos campos se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-1.5B) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1.500 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizaciones como GGUF, AWQ, GPTQ) |
| Idiomas soportados | Nepalí (especialización); el modelo base soporta múltiples idiomas, incluido inglés, chino y otros |
| Licencia | No disponible (el modelo base Qwen2.5-1.5B usa Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen2.5-1.5B, un transformer decoder-only con atención por ventanas deslizantes y una capa de embedding de 1.500 millones de parámetros. El modelo base fue preentrenado por Alibaba Cloud sobre un corpus masivo de hasta 18 billones de tokens, con mejoras significativas en codificación y matemáticas respecto a Qwen2. El adaptador LoRA añade matrices de bajo rango a las capas de atención y feed-forward, ajustadas mediante fine-tuning supervisado (SFT) con un conjunto de datos nepalí de aproximadamente 5.000 ejemplos.

No se dispone de información sobre los hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, rango de LoRA, etc.), ni sobre la composición exacta del dataset de entrenamiento. El nombre del modelo sugiere que se utilizaron 5.000 muestras, pero no hay confirmación oficial. Tampoco se especifica si se aplicaron técnicas de alineación como RLHF o DPO; el proceso se limita a SFT.

## Capacidades

- Generación de texto en nepalí: el adaptador está diseñado para producir respuestas coherentes y contextualmente apropiadas en nepalí, mejorando la fluidez del modelo base en este idioma.
- Conversación multi-turno: al heredar la arquitectura del modelo base, puede mantener diálogos con contexto largo (hasta 32.768 tokens).
- Razonamiento y conocimiento general: las capacidades del modelo base se conservan, incluyendo razonamiento lógico, conocimiento factual y comprensión lectora, aunque con posible degradación en tareas no relacionadas con el nepalí.
- Codificación y matemáticas: el modelo base Qwen2.5-1.5B tiene un rendimiento notable en estas áreas; el adaptador no las elimina, pero su especialización en nepalí puede no mejorarlas.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-1.5B soporta estas capacidades; el adaptador no las desactiva, pero no hay evidencia de que se hayan evaluado tras el fine-tuning.
- Multilingüismo: el modelo base soporta múltiples idiomas; el adaptador añade una capa de especialización en nepalí, pero no se ha verificado el comportamiento en otros idiomas.

## Casos de uso

- Asistente conversacional en nepalí: el adaptador puede integrarse en chatbots para atención al cliente o asistentes virtuales que operen en nepalí, aprovechando su capacidad de diálogo multi-turno y su bajo coste de inferencia.
- Traducción automática nepalí-inglés: aunque no está específicamente entrenado para traducción, puede generar texto en nepalí a partir de instrucciones en inglés, útil en aplicaciones de traducción asistida.
- Generación de contenido localizado: creación de artículos, resúmenes o publicaciones en redes sociales en nepalí, con un tono natural gracias al fine-tuning en datos conversacionales.
- Educación y tutoría: generación de explicaciones, ejercicios o respuestas a preguntas en nepalí para plataformas educativas dirigidas a hablantes de este idioma.
- Procesamiento de documentos nepalíes: extracción de información, resumen o clasificación de textos en nepalí, aunque el adaptador no está optimizado para tareas de comprensión específicas.
- Prototipado rápido de aplicaciones NLP en nepalí: al ser un adaptador ligero (0,9 GB), puede desplegarse en entornos con recursos limitados para validar ideas antes de invertir en modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de evaluación como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos nepalíes. Se recomienda realizar una evaluación propia antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.500 millones de parámetros en FP16 requiere aproximadamente 3 GB de VRAM. Con el adaptador LoRA, el uso adicional es mínimo (menos de 0,1 GB). En cuantización de 8 bits, la VRAM se reduce a unos 1,5-2 GB; en 4 bits, a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, como NVIDIA GTX 1660, RTX 2060, RTX 3060, o GPUs de datacenter como T4 o A10. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja, e incluso en dispositivos con 4 GB de VRAM si se usa cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y PEFT. El adaptador requiere cargar el modelo base y luego el adaptador.
- Latencia y throughput estimados: no disponibles. Para un modelo de 1.5B en una GPU moderna, se espera una latencia de decodificación de 20-50 ms por token y un throughput de 50-100 tokens/s, pero estos valores dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAYA-Qwen2.5-1.5B-Nepali-SFT-5K (este) | 1.5B (base) | 32.768 | Nepalí (SFT) | No disponible | HuggingFace |
| Qwen/Qwen2.5-1.5B (base) | 1.5B | 32.768 | Multilingüe general | Apache 2.0 | HuggingFace, Ollama |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Instrucciones, chat | Apache 2.0 | HuggingFace, Ollama |

No se han encontrado otros adaptadores LoRA específicos para nepalí sobre Qwen2.5-1.5B en la información disponible. La comparativa se limita al modelo base y su variante instruct, que son las alternativas más directas. El adaptador MAYA ofrece una especialización en nepalí que el base no tiene, pero a costa de una posible pérdida de generalidad en otros idiomas.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha evaluado el sesgo del adaptador. El modelo base puede reflejar sesgos presentes en sus datos de preentrenamiento, y el conjunto de datos nepalí de solo 5.000 ejemplos puede introducir sesgos adicionales no documentados.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados. El tamaño reducido (1.5B) aumenta este riesgo en comparación con modelos más grandes.
- Limitaciones de contexto e idioma: aunque el contexto es de 32.768 tokens, el adaptador solo ha sido entrenado en nepalí; su rendimiento en otros idiomas puede degradarse. Además, el nepalí tiene variantes dialectales y registros que pueden no estar bien cubiertos.
- Restricciones de licencia: la licencia del adaptador no está especificada. El modelo base usa Apache 2.0, que permite uso comercial, pero la falta de licencia clara en el adaptador genera incertidumbre legal para su uso en producción.
- Caveats para produccion: no hay información sobre el proceso de entrenamiento, la calidad del dataset ni la evaluación. Se recomienda realizar pruebas exhaustivas antes de implementarlo en aplicaciones críticas. El adaptador no incluye un tokenizador propio; se debe usar el del modelo base.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Anurag9817/MAYA-Qwen2.5-1.5B-Nepali-SFT-5K
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Página de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
