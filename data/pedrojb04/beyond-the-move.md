# pedrojb04/beyond-the-move

## Resumen

Beyond the Move (Além do Lance) es un adaptador LoRA de rango 8 publicado por el usuario pedrojb04 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, orientado a un experimento educativo de ajedrez en portugués de Brasil. No es un modelo completo ni un motor de ajedrez: recibe una rationale en lenguaje natural junto con tres indicadores del tablero y devuelve una propuesta de foco de entrenamiento y una pregunta breve para el estudiante. El adaptador se entrenó en CPU y no incluye los pesos del modelo base, que deben descargarse por separado en la revisión `7ae557604adf67be50417f59c2c2f167def9a775`.

El interés del proyecto es metodológico más que de rendimiento: documenta de forma explícita el pipeline de datos (posiciones de puzzles de Lichess con licencia CC0 y ejemplos sintéticos originales), la partición train/validación/test por grupos de posiciones disjuntas (48/8/12), la selección de uno de dos ensayos sobre validación y una única evaluación sobre test. El adaptador tiene 540.672 parámetros entrenables, se entrenó durante 180 pasos en CPU con semilla 42 en aproximadamente 434 segundos, y se distribuye en safetensors bajo licencia Apache 2.0.

La relevancia actual es acotada: se trata de una prueba de instrucción a pequeña escala sobre un modelo de 0,5B, no de un resultado de Elo ni de eficacia didáctica. Los propios autores advierten de que la accuracy estricta por grupo de cinco intenciones fue de 0/12 y de que el adaptador confunde con frecuencia defensa con ataque y captura con intercambio, por lo que debe tratarse como una pieza educativa reproducible, no como un componente de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rango 8) sobre transformer decoder-only Qwen2.5-0.5B-Instruct |
| Parámetros totales | 540.672 parámetros del adaptador (el modelo base no se incluye) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct; no especificada en la model card) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen2.5, no documentadas aquí) |
| Idiomas soportados | portugués (pt), según el campo `language` de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 aplicado sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. El adaptador añade 540.672 parámetros entrenables y se distribuye como artefacto PEFT independiente; los pesos base no están incluidos en el repositorio, cuyo tamaño es de 0,0 GB. La tarea modelada es de instrucción: dada una rationale en lenguaje natural y tres flags del tablero, el adaptador genera un foco de coaching y una pregunta corta, sin línea de solución.

Los datos de entrenamiento combinan posiciones del export de puzzles de Lichess (licencia CC0 1.0) con pares de rationale y objetivo sintéticos originales. La partición se hizo por grupos de posiciones fuente disjuntas (48/8/12 para train/validación/test) con pools de fraseo separados. Se seleccionó uno de dos ensayos según validación y el test se ejecutó una sola vez. El entrenamiento se realizó en CPU durante 180 pasos con semilla 42, en aproximadamente 434 segundos. El repositorio incluye `metrics.json` con los recuentos de la matriz de confusión y `training-manifest.json`, que fija los datos, el código de entrenamiento y el digest del artefacto.

## Capacidades

- Generación de texto breve en portugués de Brasil orientada a instrucción educativa.
- Producción de un foco de coaching y una pregunta a partir de una rationale y tres flags del tablero.
- Formato de salida estructurado conforme al prompt del proyecto, con un guard de notación descrito en el repositorio.
- Ejecución como adaptador PEFT sobre Qwen2.5-0.5B-Instruct en la revisión fijada.
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes ni razonamiento multi-paso más allá de la generación de una respuesta corta.
- No es un motor de ajedrez: no recibe línea de solución ni calcula jugadas.
- Capacidades multilingües limitadas al portugués declarado; no se documentan otros idiomas.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Práctica de ajedrez asistida en portugués: el adaptador propone un foco de entrenamiento y una pregunta al estudiante a partir de la rationale de una posición, lo que permite construir ejercicios guiados sin revelar la solución.
- Docencia y materiales didácticos: sirve para generar preguntas de seguimiento sobre puzzles de Lichess en un flujo educativo, siempre con revisión humana dada la baja accuracy estricta por grupo.
- Reproducción de experimentos de instrucción con PEFT: el repositorio incluye manifiesto de datos, código y digest, lo que facilita replicar el entrenamiento en CPU y comparar variantes de prompt.
- Evaluación de adaptadores de bajo coste: con 540.672 parámetros y 180 pasos en CPU, es un banco de pruebas asequible para medir seguimiento de instrucciones y formato en modelos de 0,5B.
- Prototipado de interfaces educativas: el proyecto documenta UI y comandos de reproducción, por lo que el adaptador puede integrarse en un prototipo de entrenador de ajedrez con validación previa de las respuestas.
- Investigación sobre sesgos de razonamiento deportivo: la matriz de confusión publicada permite estudiar errores sistemáticos como confundir defensa con ataque o captura con intercambio en un dominio acotado.
- Filtrado y generación de preguntas en pipelines de contenido: puede emplearse como generador de borradores de preguntas sobre posiciones, con un guard de notación y revisión posterior para evitar errores factuales.

## Benchmarks y rendimiento

Resultados publicados sobre 60 ejemplos sintéticos retenidos:

| Sistema | Focus accuracy | Macro F1 | Salida inválida |
|---|---:|---:|---:|
| Base con el mismo prompt | 0/60 | 0.000 | 60/60 |
| Reglas por palabras clave | 12/60 | 0.067 | 0/60 |
| Adaptador LoRA | 31/60 | 0.483 | 0/60 |

La accuracy estricta por grupo de cinco intenciones fue de 0/12. El resultado del modelo base incluye fallos de formato en un prompt. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el modelo base es de 0,5B parámetros y el adaptador añade 540.672 parámetros, por lo que el conjunto es apto para GPU de consumo y para CPU.
- GPU recomendadas: no documentadas; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente para el base en precisión reducida, aunque no se aportan medidas concretas.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base; no se especifican modelos concretos ni cuantizaciones probadas.
- Opciones de despliegue: PEFT sobre Qwen2.5-0.5B-Instruct; el proyecto documenta comandos de reproducción y una UI, pero no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el único dato de coste es el entrenamiento en CPU (180 pasos, ~434 segundos), no la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beyond the Move (LoRA r8 sobre Qwen2.5-0.5B-Instruct) | 540.672 en adaptador; base 0,5B | no disponible | Focus accuracy 31/60, macro F1 0.483 en test sintético propio | Apache 2.0 | Hugging Face, adaptador PEFT |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible en esta ficha | 0/60 y 60/60 salidas inválidas con el mismo prompt en el test del proyecto | Apache 2.0 (según el modelo base referenciado) | Hugging Face |
| Reglas por palabras clave (línea base del proyecto) | 0 | no aplica | 12/60, macro F1 0.067, 0/60 inválidas | no aplica | Código del proyecto |

No se dispone de comparaciones con otros adaptadores de ajedrez o modelos educativos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- No es un motor de ajedrez y no recibe línea de solución; no debe usarse para calcular jugadas ni evaluar posiciones.
- Accuracy estricta por grupo de cinco intenciones de 0/12; confunde con frecuencia defensa con ataque y captura con intercambio.
- Riesgo de errores factuales y de spoilers ocultos; el propio autor indica que la adherencia al prompt y la utilidad sobre lenguaje real de estudiantes no están garantizadas.
- No se observó notación de jugadas explícita en el test pequeño, pero tampoco se garantiza su ausencia.
- El resultado no es una medida de Elo ni de eficacia didáctica; es un experimento de seguimiento de instrucciones a pequeña escala.
- Idiomas: solo portugués declarado; no se documenta comportamiento en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen2.5-0.5B-Instruct tiene sus propios términos que deben respetarse por separado.
- El repositorio no incluye los pesos base; es necesario descargar Qwen/Qwen2.5-0.5B-Instruct en la revisión fijada para reproducir resultados.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pedrojb04/beyond-the-move
- Proyecto en GitHub: https://github.com/pedrojbDev/beyond-the-move
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Export de puzzles de Lichess: https://database.lichess.org/#puzzles
