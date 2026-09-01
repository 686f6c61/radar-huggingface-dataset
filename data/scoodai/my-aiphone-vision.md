# SCOODai/my-aiphone-vision

## Resumen

SCOODai/my-aiphone-vision es un modelo multimodal derivado de Google Gemma 3 4B IT, adaptado mediante LoRA y cuantizado a formato GGUF (q4_k_m) para su ejecución local en dispositivos iPhone. El repositorio incluye dos archivos: el modelo principal (`my-aiphone-vision-q4_k_m.gguf`) y un proyector de visión en precisión f16 (`mmproj-my-aiphone-vision-f16.gguf`) necesario para procesar imágenes. El autor, SCOODai, lo presenta como una solución para ejecutar un asistente con capacidades visuales completamente en el dispositivo, sin depender de servidores externos.

El modelo base Gemma 3 4B IT es un transformer multimodal con 3.880.263.168 parámetros, entrenado por Google con soporte para entrada de texto e imagen. La adaptación LoRA y la cuantización reducen significativamente el tamaño y los requisitos de memoria, lo que lo hace viable en hardware móvil. Aunque los tags indican soporte para árabe y la etiqueta "conversational", no se especifican detalles sobre el dataset de entrenamiento ni el alcance multilingüe. La relevancia actual radica en la tendencia de ejecutar modelos de IA localmente en teléfonos, garantizando privacidad y funcionamiento sin conexión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 4B IT) con adaptadores LoRA y cuantización GGUF |
| Parametros totales | 3.880.263.168 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Gemma 3 4B IT soporta hasta 128k tokens) |
| Tipos de cuantizacion | q4_k_m (modelo principal), f16 (proyector de visión) |
| Idiomas soportados | No disponible (el tag indica árabe; el modelo base es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors del modelo base disponible en el repositorio original) |

## Arquitectura y entrenamiento

El modelo se construye sobre Gemma 3 4B IT, un transformer decoder-only con arquitectura multimodal que combina un codificador de visión (SigLIP) con el modelo de lenguaje. La versión original de Google incorpora atención con ventana deslizante y atención global alternada, además de soporte nativo para múltiples imágenes. En este caso, SCOODai aplicó un adaptador LoRA sobre el modelo instructivo, aunque no se documentan el rango, los datos de entrenamiento ni el proceso de ajuste. Posteriormente, el modelo se cuantizó a GGUF q4_k_m, una cuantización de 4 bits que reduce el tamaño de los pesos a aproximadamente una cuarta parte del original, manteniendo un equilibrio entre calidad y eficiencia. El proyector de visión se mantiene en f16 para preservar la fidelidad en el procesamiento de imágenes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La cuantización se realizó probablemente con herramientas como llama.cpp o MLX, aunque no se especifica.

## Capacidades

- Generación de texto y diálogo conversacional: al estar basado en Gemma 3 4B IT, conserva las capacidades de instrucción y respuesta del modelo original.
- Procesamiento de imágenes: gracias al proyector de visión incluido, puede recibir imágenes como entrada y responder preguntas sobre su contenido.
- Razonamiento multimodal: combina información visual y textual para tareas como descripción de escenas, lectura de documentos o reconocimiento de objetos.
- Multilingüismo: el modelo base soporta múltiples idiomas, aunque el tag específico indica un enfoque en árabe.
- Ejecución local: el formato GGUF permite su uso en dispositivos móviles y de escritorio sin conexión a internet.
- No se ha confirmado soporte para tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente visual en el iPhone: el modelo puede analizar fotografías tomadas con la cámara y responder preguntas sobre ellas, todo localmente, sin enviar datos a la nube. Es adecuado para usuarios que priorizan la privacidad.
- Accesibilidad para personas con discapacidad visual: describir el entorno, leer etiquetas o identificar objetos en tiempo real mediante la cámara del dispositivo.
- Traducción y asistencia en árabe: dado el tag específico, puede emplearse como asistente conversacional en árabe con entrada de imágenes, por ejemplo para traducir carteles o documentos fotografiados.
- Prototipado de aplicaciones de visión por computador: desarrolladores pueden integrar el modelo en apps iOS mediante llama.cpp o bindings de Swift para probar funcionalidades de reconocimiento de imágenes sin depender de APIs externas.
- Educación y documentación: estudiantes o profesionales pueden fotografiar diagramas, fórmulas o páginas de libros y obtener explicaciones generadas por el modelo.
- Automatización de tareas domésticas: un robot o dispositivo IoT con cámara podría usar el modelo para identificar objetos y ejecutar acciones basadas en instrucciones de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico. El rendimiento real dependerá de la calidad de la cuantización y del hardware de destino.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en iPhone, por lo que cabe en dispositivos Apple con al menos 4 GB de RAM (el archivo GGUF q4_k_m de un modelo de 4B parámetros suele ocupar entre 2 y 3 GB, aunque el tamaño exacto no se indica en el repositorio).
- El repositorio completo ocupa 13.3 GB, pero solo se necesitan los dos archivos GGUF para la inferencia.
- Para ejecución en iPhone se requiere una app compatible con GGUF, como las basadas en llama.cpp (por ejemplo, LLM Farm, Enchanted, o integraciones personalizadas con Core ML).
- En ordenadores de sobremesa, puede ejecutarse con llama.cpp, Ollama o vLLM (si se convierte a otro formato), aunque el objetivo principal es móvil.
- No se proporcionan datos de latencia ni throughput. En un iPhone moderno (A15 o superior), un modelo de 4B cuantizado a q4_k_m puede generar entre 10 y 20 tokens por segundo, pero esta es una estimación general no confirmada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SCOODai/my-aiphone-vision | 3.88B | No disponible | GGUF q4_k_m | No disponible | HuggingFace |
| Google Gemma 3 4B IT (original) | 3.88B | 128k | Safetensors | Gemma Terms of Use | HuggingFace |
| Microsoft Phi-3.5-mini-instruct | 3.8B | 128k | Safetensors, GGUF | MIT | HuggingFace |
| Meta Llama 3.2 3B Instruct | 3.2B | 128k | Safetensors, GGUF | Llama 3.2 Community License | HuggingFace |

La comparativa se basa en el modelo base y alternativas de tamaño similar. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia de my-aiphone-vision es su adaptación específica para iPhone y el énfasis en árabe, mientras que las alternativas ofrecen licencias más claras y documentación más extensa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos del modelo. Al derivar de Gemma 3, puede heredar sesgos presentes en los datos de entrenamiento de Google.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de visión donde la interpretación de imágenes es compleja.
- La cuantización q4_k_m puede degradar la calidad de las respuestas en comparación con el modelo original en precisión completa.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- El soporte de idiomas no está documentado; aunque el tag indica árabe, no se garantiza un rendimiento óptimo en otros idiomas.
- El contexto máximo no se ha confirmado; si se mantiene el del modelo base (128k), el uso en dispositivos móviles puede verse limitado por la memoria disponible.
- No se han publicado evaluaciones de seguridad ni pruebas de robustez frente a entradas adversariales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SCOODai/my-aiphone-vision
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Documentación de Gemma 3: https://ai.google.dev/gemma/docs/core/overview
