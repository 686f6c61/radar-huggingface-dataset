# CloudGoat/AgentHorse-4B

## Resumen

AgentHorse-4B es un modelo de lenguaje multimodal (pipeline image-text-to-text) de 4.205.129.216 parámetros (aproximadamente 4,2 B) creado por el usuario CloudGoat mediante la técnica de fusión de modelos SLERP con mergekit. No se trata de un entrenamiento desde cero, sino de la combinación de dos checkpoints existentes: NeoHorse-1-4B-aligned (no publicado como repositorio independiente y referenciado como ruta local) e InternScience/Agents-A1-4B, que actúa como modelo base declarado. La fusión abarca el rango completo de capas [0, 32] de ambos modelos, con proporciones de interpolación distintas para los bloques de self-attention y MLP.

El modelo hereda la etiqueta qwen3_5_text, lo que sugiere una arquitectura transformer densa derivada de la familia Qwen3.5, y conserva el pipeline multimodal del checkpoint base. El tokenizador procede de NeoHorse-1-4B-aligned. La relevancia de esta ficha es limitada en el momento de redacción: el repositorio registra cero descargas y cero likes, no publica licencia ni idiomas soportados, y no incluye resultados de benchmarks.

Se trata, por tanto, de un experimento de fusión orientado a capacidades conversacionales y de agente, cuyo rendimiento real no está documentado de forma verificable en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text); etiqueta qwen3_5_text; 32 capas segun configuracion de fusión |
| Parametros totales | 4.205.129.216 (aprox. 4,2 B), dato de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Repositorio con formato GGUF presente en los tags; tipos concretos no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) y GGUF |

## Arquitectura y entrenamiento

AgentHorse-4B no ha sido entrenado; es el resultado de una fusión SLERP (interpolación esférica lineal) generada con mergekit. Se combinan dos fuentes sobre el rango de capas [0, 32]: NeoHorse-1-4B-aligned y InternScience/Agents-A1-4B. El modelo base de la fusión declarado es NeoHorse-1-4B-aligned, y el tokenizador también se toma de ese mismo checkpoint. La configuración aplica un parámetro t variable por tipo de bloque: en self-attention los valores van de 0,55 a 0,15 y en MLP de 0,6 a 0,2, con un valor por defecto de 0,3 para el resto de tensores. El tipo de dato de salida es bfloat16.

Al emplear SLERP sobre un rango completo de capas, la arquitectura resultante mantiene la topología de los modelos originales (presumiblemente Qwen3.5 densa, según la etiqueta qwen3_5_text) y no introduce mecanismos nuevos como atención lineal, decodificación especulativa propia o capas MoE. No se documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en los checkpoints fusionados; esa información dependería de las model cards de InternScience/Agents-A1-4B y de NeoHorse-1-4B-aligned, no incluidas aquí.

## Capacidades

- Generación de texto y diálogo conversacional en formato multi-turno, según la etiqueta conversational.
- Procesamiento multimodal de entrada de imagen y texto (pipeline image-text-to-text), heredado del checkpoint base.
- Capacidad potencial de agente y uso de herramientas, sugerida por el nombre del modelo base (Agents-A1) y por el propio nombre AgentHorse; no confirmada en la documentación.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistentes conversacionales ligeros desplegables en una única GPU de consumo: con 4,2 B de parámetros, el modelo puede servirse en cuantización de 4 bits para diálogos multi-turno en entornos con VRAM limitada.
- Prototipado de agentes con entrada de imagen y texto: al declarar el pipeline image-text-to-text, permite experimentar con flujos que combinan una captura o documento escaneado con una instrucción textual.
- Investigación sobre fusiones de modelos: sirve como caso de estudio reproducible de SLERP con mergekit y parámetros t diferenciados por bloque de atención y MLP.
- Evaluación comparativa frente al modelo base InternScience/Agents-A1-4B: útil para medir si la interpolación con NeoHorse-1-4B-aligned mejora o degrada tareas de agente.
- Generación de descripciones o resúmenes a partir de imágenes en pipelines internos de etiquetado, siempre que se valide previamente la calidad multimodal.
- Despliegue local en herramientas tipo Ollama o llama.cpp mediante los pesos GGUF incluidos en el repositorio, para pruebas offline sin conexión a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación multimodal, y tampoco cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 8,4 GB solo para pesos, más caché KV, lo que sitúa el consumo real en torno a 10-12 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,2 GB de pesos, más caché KV.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,4-3 GB de pesos, más caché KV.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para inferencia en precisión completa; tarjetas con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) pueden ejecutar cuantizaciones de 4 u 8 bits.
- Compatibilidad con GPU de consumo: sí, en cuantización de 4 bits cabe en la mayoría de GPU con 6-8 GB o más de VRAM.
- Opciones de despliegue: transformers para inferencia de referencia, llama.cpp u Ollama para los pesos GGUF, y vLLM o TGI para servir en modo texto si la versión del modelo lo permite (la parte multimodal puede requerir un runtime específico).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| CloudGoat/AgentHorse-4B | 4,2 B | no disponible | no disponible | Objeto de esta ficha; fusión SLERP |
| InternScience/Agents-A1-4B | 4 B (segun nombre) | no disponible | no disponible | Modelo base declarado de la fusión |
| NeoHorse-1-4B-aligned | 4 B (segun nombre) | no disponible | no disponible | Fuente de fusión y del tokenizador |

No se dispone de datos de rendimiento, contexto o licencia para ninguno de los tres modelos que permitan una comparación cuantitativa. No se incluyen otros modelos de la misma categoría porque la información proporcionada no aporta cifras verificables.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las obligaciones de atribución; es un riesgo relevante para producción.
- Ausencia total de benchmarks: no existe evidencia publicada sobre calidad de texto, razonamiento, código o rendimiento multimodal.
- Riesgo de alucinación inherente a un modelo de 4,2 B, agravado porque no se documenta el alineamiento de los checkpoints fusionados.
- Idiomas y longitud de contexto no declarados: no se puede garantizar el comportamiento en castellano ni en contextos largos.
- La fusión SLERP puede degradar capacidades específicas de cada modelo fuente si las proporciones t no están validadas empíricamente; aquí no hay evaluación que lo respalde.
- Repositorio con cero descargas y cero likes: falta de validación por parte de la comunidad.
- El checkpoint NeoHorse-1-4B-aligned se referencia como ruta local (./NeoHorse-1-4B-aligned), lo que dificulta la reproducibilidad completa de la fusión.
- El soporte multimodal depende de que el runtime utilice las capas de visión heredadas; algunas herramientas de despliegue podrían ignorarlas y degradar el modelo a solo texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CloudGoat/AgentHorse-4B
- Modelo base declarado: https://huggingface.co/InternScience/Agents-A1-4B
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Referencia sobre SLERP: https://en.wikipedia.org/wiki/Slerp
- Repositorio relacionado del mismo autor: https://huggingface.co/CloudGoat/Mephisto-4B-0725
