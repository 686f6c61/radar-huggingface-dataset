# kkt94/Llama-V-JEPA-LM-Qwen3-8B

## Resumen

Llama-V-JEPA-LM-Qwen3-8B es un modelo de lenguaje y vídeo desarrollado por el autor independiente kkt94, que combina un codificador de vídeo congelado basado en el modelo del mundo V-JEPA 2.1 (ViT-g) con el modelo de lenguaje Qwen3-8B mediante un puente espectral que convierte cada clip de 32 fotogramas en 1.024 tokens visuales. El modelo resuelve el problema de la comprensión temporal de vídeo, es decir, la capacidad de razonar sobre la dirección, la velocidad, el orden y el estado de los cambios en una escena, algo que los modelos de lenguaje puramente textuales no pueden abordar.

Su relevancia radica en que, según el autor, alcanza una media de 70,11 en 12 puntuaciones sobre 11 benchmarks de vídeo, superando a todos los modelos abiertos de su clase de tamaño (el mejor modelo abierto de la clase 8B sería PLM-8B, con 64,79). El entrenamiento se basa en supervisión contrafactual: transformaciones a nivel de píxel de vídeos públicos generan variantes equilibradas en respuestas cuyo resultado está fijado por construcción y que solo difieren en cómo cambia la escena, de modo que el modelo aprende a leer la dinámica que porta el codificador del modelo del mundo.

El modelo tiene 9.228.761.088 parámetros totales, un repositorio de 18,5 GB, licencia Apache-2.0 y está disponible en transformers con código personalizado. Su idioma declarado es únicamente el inglés. El nombre empieza por "Llama" porque los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, una salida de Llama 3.2 cuya licencia obliga a que los modelos entrenados con ella lleven ese prefijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje y vídeo multimodal: codificador de vídeo V-JEPA 2.1 (ViT-g, congelado) + puente espectral + modelo de lenguaje Qwen3-8B |
| Parametros totales | 9.228.761.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje y vídeo que une un codificador de vídeo congelado V-JEPA 2.1 (ViT-g) con el modelo de lenguaje Qwen3-8B a través de un puente espectral. Cada clip de 32 fotogramas se proyecta en 1.024 tokens visuales, que el modelo de lenguaje consume junto con el texto de la consulta. El codificador de vídeo funciona como un modelo del mundo y permanece congelado durante el entrenamiento; el puente espectral es el encargado de traducir las representaciones visuales al espacio del modelo de lenguaje.

El entrenamiento utiliza supervisión contrafactual: se aplican transformaciones a nivel de píxel sobre vídeos públicos para producir variantes equilibradas en respuestas, cuyas respuestas están fijadas por construcción y difieren únicamente en cómo cambia la escena. De este modo, el modelo de lenguaje aprende a leer la dinámica (dirección, velocidad, orden, estado) que porta el codificador del modelo del mundo. El conjunto de entrenamiento consta de 4,53 millones de muestras públicas. No se dispone de información sobre el número total de tokens, la composición detallada del dataset ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en modo texto-vídeo a texto.
- Razonamiento temporal sobre la dinámica de la escena: dirección, velocidad, orden de eventos y cambios de estado.
- Comprensión de acciones y movimiento en clips de vídeo.
- Extracción de características (feature-extraction) sobre vídeo.
- Capacidades de modelo del mundo derivadas del codificador V-JEPA 2.1.
- Procesamiento multimodal de vídeo y texto en inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Análisis de vigilancia y seguridad: el modelo puede responder preguntas sobre la secuencia temporal de eventos en grabaciones, determinando el orden en que ocurrieron las acciones y detectando cambios de estado en la escena, gracias a su entrenamiento en supervisión contrafactual sobre dinámica.
- Moderación de contenido en vídeo: permite clasificar y describir acciones y movimientos en clips de 32 fotogramas, lo que resulta adecuado para pipelines de revisión automatizada que necesitan entender qué ocurre y en qué orden.
- Indexación y búsqueda semántica de archivos audiovisuales: al convertir cada clip en 1.024 tokens visuales y generar descripciones textuales, se puede construir un índice consultable sobre grandes videotecas.
- Análisis deportivo: la capacidad de razonar sobre dirección, velocidad y orden de eventos permite responder preguntas sobre jugadas, trayectorias y secuencias de movimiento en clips cortos.
- Asistentes para accesibilidad: generación de descripciones detalladas de secuencias de vídeo para personas con discapacidad visual, centradas en la dinámica y los cambios de la escena y no solo en objetos estáticos.
- Investigación en modelos del mundo: el modelo sirve como banco de pruebas para estudiar cómo un codificador de vídeo congelado basado en V-JEPA transfiere conocimiento dinámico a un modelo de lenguaje, útil en laboratorios que investigan representaciones espacio-temporales.
- Evaluación de sistemas robóticos y de percepción: la comprensión de movimiento y orden de eventos puede emplearse para validar si un sistema percibe correctamente secuencias de acciones en vídeos de demostración.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| MVBench | accuracy | 72,8 |
| PerceptionTest | accuracy | 77,8 |
| TVBench | accuracy | 75,3 |
| TempCompass | accuracy | 79,4 |
| TOMATO | accuracy | 56,5 |
| MotionBench | accuracy | 59,1 |
| NExT-QA | accuracy | 81,2 |
| MVP | pair accuracy | 58,1 |
| TemporalBench (binary) | accuracy | 73,5 |
| SSv2 (multiple choice) | accuracy | 93,8 |
| Vinoground text | text pair accuracy | 75,2 |
| Vinoground video | video pair accuracy | 38,6 |

Media declarada en 12 puntuaciones sobre 11 benchmarks: 70,11. Según el autor, el mejor modelo abierto de la clase 8B comparable es PLM-8B, con 64,79 de media. El autor declara ser el mejor modelo abierto de la clase 8B en 7 de las 12 puntuaciones (por ejemplo, SSv2 93,8 frente a 67,9 y TOMATO 56,5 frente a 42,6).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9.228.761.088 parámetros, en precisión de 16 bits los pesos ocuparían aproximadamente 18,5 GB, por lo que se necesitaría al menos una GPU de 24 GB para cargar el modelo completo en FP16/BF16; las cuantizaciones reducirían este requisito, pero no se han publicado formatos cuantizados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar GPUs de centro de datos como A100 (40/80 GB), H100 o L40S, aunque el autor no las especifica.
- ¿Cabe en GPU de consumo? Con 9,2 mil millones de parámetros, en FP16 no cabría en GPUs de 16 GB ni de 24 GB con margen para el codificador de vídeo y las activaciones; sería necesario recurrir a cuantización, para la que no se han publicado pesos.
- Opciones de despliegue: transformers (librería declarada), con código personalizado (custom_code). No se ha confirmado soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en benchmarks de vídeo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Qwen3-8B | 9.228.761.088 | no disponible | 70,11 (12 puntuaciones, 11 benchmarks) | Apache-2.0 | Hugging Face, transformers |
| PLM-8B | no disponible | no disponible | 64,79 (según el autor) | no disponible | no disponible |
| Qwen3-8B (modelo base, solo texto) | 8B (aproximado) | no disponible | no aplica (sin capacidades de vídeo) | Apache-2.0 | Hugging Face |

El autor cita PLM-8B como el mejor modelo abierto de la clase 8B anterior, con 64,79 de media frente a los 70,11 de este modelo. No se dispone de datos de otros modelos comparables de vídeo y lenguaje de la misma clase en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al entrenarse con vídeos públicos, es probable que herede sesgos presentes en esos datos, pero no hay un análisis publicado.
- Riesgo de alucinación: no cuantificado por el autor; como modelo de lenguaje y vídeo, puede generar descripciones o respuestas no sustentadas en el contenido real del clip.
- Limitaciones de contexto e idioma: el modelo solo declara soporte de inglés, y no se especifica la longitud de contexto del modelo de lenguaje subyacente.
- Restricciones de licencia: la licencia del repositorio es Apache-2.0, pero el nombre "Llama" es obligatorio porque los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, una salida de Llama 3.2 cuya licencia exige que los modelos entrenados con ella lleven ese prefijo; conviene revisar los términos de esa licencia para uso comercial.
- Los resultados de benchmarks son declarados por el autor y no están verificados (verified: false en la model-index).
- El modelo requiere código personalizado (custom_code) en transformers, lo que puede complicar su integración en pipelines estándar de despliegue.
- El rendimiento en Vinoground video es notablemente bajo (38,6), lo que sugiere dificultades en tareas de emparejamiento fino de vídeo.
- No se han publicado pesos cuantizados ni guías de despliegue para servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-8B
- Paper: https://arxiv.org/abs/2611.17831
- Código y informe técnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en vivo (ZeroGPU): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
