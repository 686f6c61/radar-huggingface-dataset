# lijie1228/liemo-0.1b-gguf

## Resumen

Liemo 0.1B (烈模) es un modelo de lenguaje de muy pequeno tamano entrenado desde cero por el desarrollador independiente lijie1228 para responder preguntas en chino. Se trata de un transformer decoder-only de la familia GPT-2 con 12 capas, 8 cabezas de atencion y una dimension oculta de 800, con aproximadamente 99,6 millones de parametros (117,9 millones contando la matriz de embeddings). Su particularidad principal es el uso de un vocabulario a nivel de caracter de 9.068 simbolos chinos y signos de puntuacion, en lugar de un tokenizador BPE subword.

El modelo resuelve un problema muy acotado: la generacion de respuestas cortas de una sola ronda a preguntas en chino, con un formato de prompt fijo (`问{problema}\n说`) y un contexto maximo de solo 128 tokens. No es un asistente general ni soporta conversaciones multi-turno; el autor lo presenta explicitamente como un modelo de juguete para experimentacion y dispositivos de bajos recursos. Fue entrenado en una unica GPU GTX 1650 de 4 GB, lo que da una idea de su escala.

Su relevancia actual es mas didactica que practica: demuestra que es posible entrenar y publicar un modelo funcional de QA en chino con hardware de consumo, y ofrece versiones cuantizadas en GGUF (desde F16 hasta Q2_K) listas para ejecutarse en llama.cpp u Ollama. Existen tres variantes: `s5.2` (respuestas cortas, baseline estable), `s6` (recomendada, con respuestas mas largas mediante un LoRA de longitud) y `s6-know` (con un LoRA adicional de conocimiento factual).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-2), 12 capas, 8 cabezas, 800 dimensiones |
| Parametros totales | 99,6 M (117,9 M incluyendo el vocabulario) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M, Q4_0, Q2_K |
| Idiomas soportados | Chino (zh) |
| Licencia | MIT (corpus de entrenamiento bajo CC BY-SA 4.0) |
| Formato de pesos | GGUF (llama.cpp) |
| Vocabulario | 9.068 caracteres chinos y signos de puntuacion (char-level) |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de la familia GPT-2 con 12 capas, 8 cabezas de atencion y 800 dimensiones ocultas, y emplea un vocabulario a nivel de caracter de 9.068 entradas. El preentrenamiento se realizo sobre una version filtrada de la Wikipedia en chino (dataset `0xDing/wikipedia-cn-20230720-filtered`), de aproximadamente 190 millones de caracteres, durante unas 250.000 iteraciones hasta alcanzar una perdida de validacion de 3,13. El autor menciona una segunda linea de entrenamiento con corpus denso que llego a val 3,04, pero que tras el SFT ofrecia peores resultados de QA (45/96), por lo que fue descartada.

Sobre la base preentrenada se aplico un SFT con aproximadamente 11.000 pares de pregunta-respuesta en chino. Las versiones multi-turno probadas (v10 a v45) degradaban el rendimiento con el contexto de 128 tokens, por lo que se opto por la variante de una sola ronda con mejores resultados. La version `s6` se obtiene aplicando a `s5.2` un LoRA de longitud de respuesta (rank 16, learning rate 3e-4, 3 epocas, adaptador de solo 4,9 MB) que se fusiona en los pesos finales y aumenta la longitud media de respuesta un 70 % sin perder precision. La version `s6-know` anade un segundo LoRA de conocimiento con 612 hechos, que mejora la cobertura de preguntas no vistas (de 4/51 a 22/51) a costa de reducir ligeramente el acierto en el conjunto de 144 preguntas (de 132 a 126).

## Capacidades

- Generacion de texto en chino para preguntas de una sola ronda, con formato de prompt fijo `问{problema}\n说`.
- Respuestas cortas y directas: `s5.2` promedia 7,4 caracteres por respuesta y `s6` unos 12,6.
- Version `s6-know` con inyeccion de conocimiento factual para preguntas no vistas en el entrenamiento (22 de 51 acertadas).
- Cuantizacion en diez niveles distintos, con fidelidad practicamente identica a F16 en Q8_0 y superiores (14/14 en prueba de 14 preguntas en modo greedy).
- Ejecucion en llama.cpp y Ollama, ademas de API compatible con el endpoint `/api/generate` de Ollama.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta conversaciones multi-turno ni memoria entre turnos.
- Sin capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Experimentacion educativa con modelos de lenguaje: permite estudiar el ciclo completo de preentrenamiento, SFT y LoRA en un modelo que cabe en una GPU de 4 GB, con pesos publicados en GGUF.
- Prototipado de asistentes embebidos en chino: el tamano de 83 MB en Q4_K_M permite integrarlo en dispositivos con poca memoria (Raspberry Pi, routers, microcontroladores de gama alta) para respuestas cortas y prefijadas.
- Pruebas de infraestructura de inferencia: sirve como carga de trabajo minima para validar pipelines con llama.cpp u Ollama antes de desplegar modelos mayores, gracias a su baja latencia y bajo consumo.
- Generacion de respuestas de formato fijo en aplicaciones de FAQ cerradas: con el formato `问{problema}\n说` y los parametros de parada adecuados, puede producir respuestas cortas y deterministas para un conjunto acotado de preguntas.
- Demostracion de tecnicas de cuantizacion: el repositorio incluye diez niveles de cuantizacion con mediciones de fidelidad, util para comparar el impacto de la cuantizacion en un modelo pequeno.
- Base para investigacion sobre tokenizacion char-level en chino: el vocabulario de 9.068 caracteres permite estudiar el comportamiento de modelos sin BPE subword en tareas de QA.

## Benchmarks y rendimiento

Los unicos datos publicados son internos del autor y no corresponden a benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), que no se han evaluado.

| Version | Aciertos en 60 preguntas | Aciertos en 144 preguntas | Longitud media de respuesta | Notas |
|---|---|---|---|---|
| s5.2 | 55 | 132 | 7,4 caracteres | Baseline de respuesta corta |
| s6 | 56 | 132 | 12,6 caracteres | Recomendada, LoRA de longitud fusionado |
| s6-know | 57 | 126 | 8,0 caracteres | LoRA de conocimiento, 22/51 en preguntas no vistas |

Prueba de fidelidad de cuantizacion (14 preguntas, decodificacion greedy): Q8_0 y superiores coinciden 14/14 con F16; Q4_0 y Q2_K obtienen 13/14, con una palabra erronea adicional al final en la pregunta «我和朋友吵架了».

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en todas las cuantizaciones; el fichero Q4_K_M ocupa 83 MB y el F16 204 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el autor entreno el modelo en una GTX 1650 de 4 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (con Modelfile), y API compatible con Ollama (`/api/generate`).
- Latencia y throughput: no se han publicado mediciones; por el tamano del modelo se espera latencia de milisegundos en CPU y GPU modernas, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Liemo 0.1B (s6) | 99,6 M | 128 | Chino | MIT | GGUF | QA de una ronda, char-level, entrenado desde cero |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingue | Apache 2.0 | Safetensors, GGUF | Asistente general, mucho mayor contexto y capacidades |
| SmolLM2-135M | 135 M | 8.192 | Ingles (principalmente) | Apache 2.0 | Safetensors, GGUF | Modelo pequeno generalista, no especializado en chino |
| TinyLlama-1.1B | 1,1 B | 2.048 | Ingles (principalmente) | Apache 2.0 | Safetensors, GGUF | Mayor capacidad general, mucho mayor tamano |

La comparacion es asimetrica: Liemo 0.1B esta especializado en QA corto en chino con contexto de solo 128 tokens, mientras que los modelos citados son asistentes generales con contextos de miles de tokens. Liemo no es competitivo en tareas generales, pero es orders of magnitude mas pequeno y ligero.

## Limitaciones y advertencias

- Solo soporta una unica ronda de conversacion; no hay memoria entre turnos.
- Contexto maximo de 128 tokens, insuficiente para documentos o dialogos largos.
- Vocabulario char-level: los caracteres fuera de las 9.068 entradas se descartan o provocan errores.
- Errores frecuentes en frases largas, numeros y nombres propios.
- Riesgo elevado de alucinacion: el autor advierte que las salidas no estan garantizadas como correctas.
- La version `s6-know` mejora la cobertura de hechos pero reduce la precision global en el conjunto de 144 preguntas.
- El corpus de preentrenamiento esta bajo CC BY-SA 4.0, lo que impone obligaciones de atribucion y compartir igual sobre el dataset derivado; el modelo se distribuye bajo MIT, pero el autor lo limita a uso de aprendizaje y experimentacion.
- Requiere el formato de prompt exacto `问{problema}\n说` y parametros de parada (`\n`, `说`, `问`); sin ellos el modelo continua escribiendo la siguiente pregunta.
- No apto para produccion como asistente general ni para tareas que requieran precision factual.

## Enlaces

- HuggingFace: https://huggingface.co/lijie1228/liemo-0.1b-gguf
- Dataset de preentrenamiento: https://huggingface.co/datasets/0xDing/wikipedia-cn-20230720-filtered
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
