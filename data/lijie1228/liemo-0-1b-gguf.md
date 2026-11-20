# lijie1228/liemo-0.1b-gguf

## Resumen

Liemo 0.1B (烈模 Liemo 0.1B) es un modelo de lenguaje de muy pequeño tamaño entrenado desde cero por el desarrollador independiente lijie1228 para responder preguntas en chino. Con 99,6 millones de parámetros (117,9 millones contando el vocabulario) y una arquitectura decoder-only de la familia GPT-2 (12 capas, 8 cabezas de atención, dimensión 800), el modelo se distribuye en formato GGUF cuantizado, lo que permite ejecutarlo en hardware muy modesto, incluida una GTX 1650 de 4 GB.

El modelo resuelve un problema muy acotado: la generación de respuestas cortas de una sola ronda en chino, con un vocabulario a nivel de carácter de 9068 símbolos y una ventana de contexto de solo 128 tokens. No es un asistente general, sino una pieza experimental orientada a juguete, investigación y asistentes para dispositivos de bajos recursos. Su relevancia actual reside en la transparencia del proceso de entrenamiento y en la disponibilidad de múltiples niveles de cuantización (de F16 a Q2_K) con mediciones de degradación reportadas por el autor.

El repositorio aloja tres variantes: `s5.2` (respuestas cortas, línea base), `s6` (versión recomendada, con respuestas más largas gracias a un LoRA fusionado) y `s6-know` (variante con un LoRA de conocimiento factual). El corpus de preentrenamiento es una versión filtrada de Wikipedia en chino de aproximadamente 190 millones de caracteres, y todo el entrenamiento se realizó en una única GPU GTX 1650 de 4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia GPT-2 (12 capas, 8 cabezas, dimensión 800) |
| Parametros totales | 99,6 M (117,9 M incluyendo el vocabulario) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_M, Q2_K (la mayoría solo en la variante s5.2) |
| Idiomas soportados | Chino (zh) |
| Licencia | MIT (el corpus de preentrenamiento es CC BY-SA 4.0; el modelo es obra derivada, solo para estudio e investigación) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only densa con 12 capas, 8 cabezas de atención y dimensión de modelo de 800, con un vocabulario a nivel de carácter de 9068 tokens que cubre caracteres chinos y puntuación. El preentrenamiento se realizó sobre una versión filtrada de Wikipedia en chino (dataset `0xDing/wikipedia-cn-20230720-filtered`, aproximadamente 190 millones de caracteres) durante unas 250 000 iteraciones, alcanzando una pérdida de validación de 3,13. Una continuación sobre un corpus denso adicional llegó a una pérdida de validación de 3,04, pero tras el ajuste fino supervisado el rendimiento en preguntas y respuestas empeoró (45/96), por lo que se descartó.

El ajuste fino supervisado (SFT) empleó aproximadamente 11 000 pares de pregunta-respuesta en chino. Las versiones multi-turno (v10 a v45) degeneraron repetidamente con el contexto de 128 tokens, por lo que se optó por la mejor variante de una sola ronda. La versión `s6` se obtiene aplicando a `s5.2` un LoRA de respuesta larga (rank 16, learning rate 3e-4, 3 épocas, adaptador de solo 4,9 MB) que se fusiona con el modelo base: la precisión no cae y la longitud media de respuesta aumenta un 70 % (de 7,4 a 12,6 caracteres). La variante `s6-know` añade un LoRA de conocimiento con 612 hechos, que eleva la tasa de acierto en preguntas no vistas de 4/51 a 22/51 a costa de perder 6 aciertos en el conjunto de 144 preguntas. El formato de prompt es fijo: `问{问题}\n说`.

## Capacidades

- Generación de texto en chino para preguntas y respuestas de una sola ronda.
- Respuestas cortas y estables en la variante `s5.2` (media de 7,4 caracteres).
- Respuestas más desarrolladas en la variante `s6` (media de 12,6 caracteres, recomendada).
- Cobertura de hechos básicos en `s6-know` (22 de 51 preguntas no vistas con formulaciones nuevas).
- Inferencia en CPU y GPU de gama muy baja gracias a las cuantizaciones GGUF de 62 a 204 MB.
- Compatibilidad con llama.cpp, Ollama y cualquier endpoint compatible con la API de generación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta modo de pensamiento, visión ni audio.
- No soporta conversaciones multi-turno: no hay memoria entre turnos.

## Casos de uso

- Asistente de juguete en dispositivos embebidos: el modelo Q4_K_M ocupa 83 MB y puede ejecutarse en una Raspberry Pi o en una GPU integrada para responder preguntas simples de una ronda en chino, con un consumo de memoria despreciable.
- Demostración educativa de entrenamiento de LLM: sirve para ilustrar el ciclo completo (preentrenamiento sobre Wikipedia, SFT, LoRA y cuantización) en una sola GPU de 4 GB, con artefactos reproducibles en formato GGUF.
- Pruebas de pipelines de inferencia: útil para validar integraciones con llama.cpp u Ollama y para medir latencia y consumo en hardware mínimo antes de escalar a modelos mayores.
- Generación de respuestas cortas predefinidas en aplicaciones de kiosco o terminal: con el prompt fijo `问{问题}\n说` y los stop tokens adecuados, puede producir respuestas de una frase para preguntas frecuentes muy acotadas.
- Experimentación con cuantización: el repositorio ofrece diez niveles de cuantización en `s5.2` con mediciones de coincidencia exacta frente a F16 (Q8_0 y superiores reproducen 14/14 respuestas idénticas; Q4_0 y Q2_K, 13/14), lo que lo convierte en un banco de pruebas para estudiar la degradación por cuantización en modelos pequeños.
- Investigación sobre LoRA en modelos minúsculos: la comparación entre `s5.2`, `s6` y `s6-know` permite analizar el efecto de adaptadores de bajo rango sobre la longitud de respuesta y la retención de hechos con presupuestos de entrenamiento mínimos.
- Filtro o clasificador de texto muy ligero: su naturaleza char-level y su tamaño permiten usarlo como componente auxiliar en tareas de normalización o generación de plantillas en chino, siempre con validación posterior.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos de evaluación disponibles son internos, medidos sobre conjuntos propios de preguntas en chino:

| Version | Aciertos en 60 preguntas | Aciertos en 144 preguntas | Longitud media de respuesta | Notas |
|---|---|---|---|---|
| s5.2 | 55 | 132 | 7,4 caracteres | Línea base de respuesta corta |
| s6 | 56 | 132 | 12,6 caracteres | Recomendada; LoRA de respuesta larga fusionado |
| s6-know | 57 | 126 | 8,0 caracteres | 22/51 en preguntas no vistas (frente a 4/51 en s6) |

Prueba de fidelidad de cuantización (14 preguntas, decodificación greedy): Q8_0 y superiores coinciden 14/14 con F16; Q4_0 y Q2_K, 13/14 (aparece una palabra errónea al final de una respuesta concreta).

## Requisitos de hardware

- VRAM estimada para inferencia: entre 62 MB (Q2_K) y 204 MB (F16) solo para los pesos; con el contexto de 128 tokens y el overhead de llama.cpp, el consumo total se mantiene por debajo de 1 GB en todos los casos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el propio autor entrenó el modelo en una GTX 1650 de 4 GB. Funciona igualmente en CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, GTX 1650, RTX 3050 y superiores, así como en iGPU y en placas tipo Raspberry Pi.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (creación de modelo con Modelfile) y servidores compatibles con la API de generación de Ollama (`/api/generate`).
- Latencia y throughput: no se han publicado mediciones. Por el tamaño (menos de 120 M de parámetros) se espera una latencia de milisegundos por respuesta en CPU moderna, pero es una estimación no verificada.
- Es imprescindible configurar los stop tokens (`\n`, `说`, `问`) en la API; de lo contrario, el modelo continúa escribiendo el siguiente turno de pregunta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Liemo 0.1B (s6) | 99,6 M | 128 | Chino | MIT (corpus CC BY-SA 4.0) | GGUF | Entrenado desde cero, char-level, sin benchmarks estándar |
| Qwen2.5-0.5B | 494 M | 32 768 | Multilingüe (incluido chino) | Apache 2.0 | Safetensors, GGUF | Modelo generalista con soporte de tool calling y contexto muy superior |
| SmolLM2-135M | 135 M | 8 192 | Principalmente inglés | Apache 2.0 | Safetensors, GGUF | Entrenado con corpus mayor y evaluación publicada; no orientado a chino |
| GPT-2 small | 124 M | 1 024 | Inglés | MIT | Safetensors, GGUF | Referencia histórica de la misma familia arquitectónica |

La comparación con modelos de tamaño similar muestra que Liemo 0.1B sacrifica contexto (128 tokens frente a miles) y cobertura de idiomas (solo chino) a cambio de un tamaño de pesos mínimo y una trazabilidad total del entrenamiento. Para cualquier uso en producción en chino, Qwen2.5-0.5B es una alternativa sustancialmente más capaz con una licencia permisiva.

## Limitaciones y advertencias

- Solo admite una ronda de conversación; no hay memoria entre turnos y las versiones multi-turno degeneraron durante el entrenamiento.
- Contexto de 128 tokens: insuficiente para documentos, historiales o instrucciones largas.
- Vocabulario a nivel de carácter: los caracteres fuera de las 9068 entradas se descartan o provocan errores.
- Errores frecuentes en frases largas, cifras y nombres propios, según reconoce el propio autor.
- Riesgo alto de alucinación: el modelo se entrenó sobre Wikipedia y 11 000 pares de preguntas; no garantiza la veracidad de sus respuestas.
- Solo chino; no comprende ni genera otros idiomas.
- Licencia MIT para los pesos, pero el corpus de preentrenamiento es CC BY-SA 4.0 y el modelo se declara obra derivada para estudio e investigación; conviene revisar las implicaciones de la cláusula share-alike antes de un uso comercial.
- El autor lo describe explícitamente como modelo de juguete y experimental, no como asistente general.
- Requiere formato de prompt fijo y stop tokens bien configurados; un uso incorrecto produce continuaciones del siguiente turno.
- Sin benchmarks estándar publicados, por lo que no es posible comparar su calidad objetiva con modelos de referencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lijie1228/liemo-0.1b-gguf
- Dataset de preentrenamiento: https://huggingface.co/datasets/0xDing/wikipedia-cn-20230720-filtered
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
