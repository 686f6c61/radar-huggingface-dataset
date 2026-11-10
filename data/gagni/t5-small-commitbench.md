# gagni/t5-small-commitbench

## Resumen

`gagni/t5-small-commitbench` es un modelo de generación de mensajes de commit obtenido mediante fine-tuning de `google-t5/t5-small` sobre el dataset CommitBench. Dado un diff de git en formato texto, el modelo produce una descripción breve del cambio en inglés. El autor original del fine-tuning es `thealper2`; el repositorio `gagni` es un espejo sin modificar de los ficheros (`config.json`, `tokenizer.json`, `model.safetensors`) para evitar dependencias de terceros.

Arquitectura T5 estándar (encoder-decoder transformer) con 60,5 millones de parámetros totales, contexto de entrada de 512 tokens y salida máxima de 64 tokens. Es un modelo muy ligero, entrenado en 1,2 horas sobre una única GPU consumer (RTX 5060 Ti de 15,9 GB), lo que lo hace apto para despliegues con recursos mínimos.

Su relevancia práctica es acotada: sirve como línea base barata para automatizar la generación de mensajes de commit en pipelines de integración continua, y como referencia para comparar aproximaciones más grandes sobre CommitBench. Los resultados publicados (ROUGE-1 de 19,31 y BLEU de 2,148 en test) reflejan las limitaciones de un modelo de 60M de parámetros y de un dataset con placeholders.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder transformer) |
| Parametros totales | 60.506.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada, 64 tokens de salida |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar via llama.cpp/GGUF no documentada por el autor) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 (modelo); dataset CommitBench bajo CC BY-NC 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un T5-small sin modificaciones estructurales: encoder-decoder transformer con atención completa, tokenizador SentencePiece y vocabulario original de T5. El fine-tuning se realizó sobre los splits oficiales de CommitBench, usando 500.000 ejemplos de entrenamiento y 2.000 de validación (de 1.165.213 y 249.689 disponibles respectivamente). El split de test (249.688 ejemplos) no se usó en entrenamiento; la evaluación reportada se hizo sobre una muestra de 20.000.

Configuración de entrenamiento: batch efectivo de 32 (batch por dispositivo 32, sin acumulación de gradiente), learning rate 3e-5 con schedule lineal, warmup ratio 0,05, weight decay 0,01, gradient clipping 1,0, 2 épocas, precisión mixta bf16, optimizador AdamW y semilla 42. Longitud máxima de fuente 512 tokens y de destino 64 tokens. La truncación afecta al 0,7% de los diffs (por encima de 512 tokens) y al 4,47% de los mensajes de commit (por encima de 64 tokens). No se documenta RLHF, DPO ni decodificación especulativa.

La innovación técnica es mínima: se trata de un fine-tuning supervisado estándar con prefijo de tarea (`generate commit message: <git diff>`). El formato de entrada es texto plano, sin tokenización específica de código.

## Capacidades

- Generación de mensajes de commit a partir de un diff de git en texto plano.
- Generación de texto condicionada (text2text) con decodificación determinista por defecto (`do_sample=False`).
- Resumen de cambios de código en una frase corta (media de 5,0 palabras generadas frente a 11,27 de referencia).
- Soporte de seis lenguajes de programación en el dataset de entrenamiento: Python, JavaScript, PHP, Ruby, Java y Go.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento explícito.
- No tiene capacidades multimodales (visión, audio) ni multilingües más allá del inglés.

## Casos de uso

- Automatización de mensajes de commit en CI/CD: dado el diff de un pull request o de un commit, el modelo genera una propuesta de mensaje que se puede mostrar al revisor o usar como plantilla. Es adecuado por su bajo coste computacional y su latencia reducida.
- Etiquetado de historiales de repositorios: procesar en lote commits antiguos sin mensaje descriptivo para generar resúmenes normalizados que faciliten la búsqueda y el análisis del historial.
- Generación de changelogs preliminares: agrupar los mensajes generados por commit y revisarlos manualmente para redactar notas de versión, usando el modelo como primer borrador.
- Filtrado y clasificación de cambios: usar el mensaje generado como señal textual para agrupar commits por tipo de cambio (corrección, refactor, dependencias) en herramientas de analítica de repositorios.
- Docencia y formación: mostrar a desarrolladores junior cómo se describen cambios pequeños, con la salvedad de que los mensajes generados son genéricos y requieren revisión.
- Línea base para investigación en generación de mensajes de commit: comparar aproximaciones más grandes o con arquitecturas específicas de código contra este modelo de 60M sobre el mismo split de CommitBench.
- Preprocesado de datasets de código: generar descripciones automáticas para pares (diff, mensaje) que falten en corpus propios, siempre que se acepte la calidad limitada del modelo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test (20.000 ejemplos, beam search con `num_beams=4`):

| Metrica | Valor |
|---|---|
| ROUGE-1 | 19,31 |
| ROUGE-2 | 4,668 |
| ROUGE-L | 17,42 |
| ROUGE-Lsum | 17,42 |
| BLEU | 2,148 |
| Exact match | 0,04 |
| Longitud media generada (palabras) | 5,005 |
| Longitud media de referencia (palabras) | 11,27 |

Resultados por lenguaje de programación:

| Lenguaje | n | ROUGE-1 | ROUGE-2 | ROUGE-L | BLEU | Exact match |
|---|---|---|---|---|---|---|
| Python | 5.722 | 21,20 | 6,05 | 19,29 | 2,73 | 0,04 |
| JavaScript | 4.468 | 18,86 | 4,05 | 17,07 | 2,01 | 0,02 |
| PHP | 3.489 | 17,04 | 3,46 | 15,29 | 1,64 | 0,09 |
| Ruby | 2.808 | 22,08 | 5,79 | 19,65 | 2,44 | 0,04 |
| Java | 1.799 | 15,19 | 2,61 | 13,58 | 1,02 | 0,06 |
| Go | 1.714 | 18,65 | 4,45 | 16,75 | 2,11 | 0,00 |

Pérdida final de entrenamiento: 3,5762. Mejor pérdida de validación: 3,2414. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (60,5M de parámetros, aproximadamente 242 MB de pesos) y en torno a 0,5 GB con overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entrenó en una RTX 5060 Ti de 15,9 GB, pero el modelo es sobradamente pequeño para GPUs mucho menores.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en CPU con latencia aceptable.
- Opciones de despliegue: `transformers` (referencia), `text-generation-inference` (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (soporte de T5 limitado en algunas versiones), ONNX Runtime y llama.cpp con conversión manual a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de decenas de milisegundos por petición en GPU consumer y throughput alto en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gagni/t5-small-commitbench` | 60,5M | 512 entrada / 64 salida | Generación de mensajes de commit | Apache 2.0 (modelo) | Hugging Face |
| `thealper2/t5-small-commitbench` | 60,5M | 512 / 64 | Generación de mensajes de commit | Apache 2.0 (modelo) | Hugging Face (origen del espejo) |
| `google-t5/t5-small` | 60,5M | 512 | Text2text general | Apache 2.0 | Hugging Face |
| Modelos grandes de código (p. ej. CodeT5, CodeLlama) | no disponible en la información | no disponible | Generación de código y mensajes | varía | Hugging Face |

No se dispone de resultados de benchmarks comparables entre estos modelos en la información proporcionada. El modelo es funcionalmente idéntico a `thealper2/t5-small-commitbench`, del que es espejo.

## Limitaciones y advertencias

- Placeholders del dataset: CommitBench sustituye literales identificativos por tokens especiales. Todos los diffs contienen `<HASH>` y el 26,5% de los mensajes de referencia contienen `<I>`, `<URL>` o `<EMAIL>`. El modelo reproduce estos tokens en sus salidas (por ejemplo, `Bumped version to <I>`), lo que degrada la legibilidad y la utilidad directa del mensaje generado.
- Cobertura del tokenizador: el vocabulario SentencePiece de T5 no cubre todos los caracteres del código fuente (llaves, barras invertidas, ángulos). Aproximadamente el 2,35% de los tokens de entrada se convierten en `<unk>`, lo que limita la precisión al leer diffs.
- Truncación: los diffs de más de 512 tokens se truncan, por lo que la parte final del cambio no es visible para el modelo. Los mensajes de más de 64 tokens también se truncan en entrenamiento.
- Fuga entre splits: los splits de CommitBench son aleatorios sobre commits, no sobre repositorios. El 98,6% de los ejemplos de test provienen de repositorios que también aparecen en entrenamiento, de modo que las métricas reportadas reflejan en parte familiaridad con el estilo de commit del proyecto, no generalización a código no visto.
- Idiomas: el dataset es solo en inglés y cubre seis lenguajes de programación. El comportamiento en otros lenguajes o en cambios multi-fichero grandes no está probado.
- Licencia del dataset: CommitBench se distribuye bajo CC BY-NC 4.0, lo que restringe el uso comercial de los datos de entrenamiento. Aunque los pesos del modelo son Apache 2.0, el uso comercial debe evaluarse con cautela por la procedencia de los datos.
- Calidad de los mensajes: la longitud media generada (5,0 palabras) es muy inferior a la de referencia (11,27), lo que indica mensajes muy cortos y genéricos. Los valores de ROUGE y BLEU son métricas de solapamiento léxico que no garantizan que el mensaje describa correctamente el cambio.
- Riesgo de alucinación: el modelo puede generar descripciones plausibles pero incorrectas del diff, especialmente en cambios grandes o en lenguajes poco representados como Java (ROUGE-1 de 15,19).
- Sin soporte de agentes, tool calling ni razonamiento multi-paso; no debe usarse como sustituto de un LLM generalista en tareas de código complejas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gagni/t5-small-commitbench
- Modelo original (espejo): https://huggingface.co/thealper2/t5-small-commitbench
- Modelo base: https://huggingface.co/google-t5/t5-small
- Dataset CommitBench: https://huggingface.co/datasets/Maxscha/commitbench
