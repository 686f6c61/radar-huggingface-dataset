# kinyeah/BiMai-Chaoshu-OCR

## Resumen

BiMai · Chaosu OCR es un adaptador LoRA (QLoRA r=32) sobre Qwen3-VL-8B-Instruct especializado en el reconocimiento óptico de caracteres de caligrafía china cursiva (*caoshu* / 草書) y semi-cursiva (*xingcao*) en textos clásicos de disposición vertical. Lo desarrolla el usuario independiente kinyeah y resuelve un problema concreto: los modelos VLM generalistas fallan sistemáticamente al transcribir trazos cursivos históricos, tendiendo a "alucinar" poemas o pasajes conocidos en lugar de leer lo que aparece en la imagen.

La versión publicada como principal (v23) parte de Qwen3-VL-8B-Instruct y se distribuye en formato GGUF para llama.cpp, con un adaptador de 349 MB que se carga junto al modelo base cuantizado y un proyector visual compartido. El resultado es un sistema que reduce el CER (tasa de error de caracteres) del 35,6 % del modelo base al 27,5 % sobre un conjunto de evaluación limpio de 40 columnas y 331 caracteres, es decir, una mejora relativa del 22,7 %.

Su relevancia actual radica en que ataca un nicho poco cubierto —digitalización de manuscritos y libros antiguos chinos— con un coste de entrenamiento muy contenido (unas 15 horas de GPU acumuladas en 14 ejecuciones sobre una única NVIDIA Thor) y una licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) Qwen3-VL-8B-Instruct + adaptador LoRA (QLoRA r=32) |
| Parámetros totales | 539.010.048 (según safetensors del repositorio); el modelo base Qwen3-VL-8B ronda los 8.000 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-VL-8B-Instruct) |
| Tipos de cuantización | Q4_K_M (GGUF); adaptador LoRA en F16; proyector visual en F16 |
| Idiomas soportados | zh, en (salida en chino tradicional) |
| Licencia | Apache-2.0 (pesos); MIT (código periférico) |
| Formato de pesos | GGUF (llama.cpp); LoRA en GGUF F16 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 entrenado con QLoRA sobre Qwen3-VL-8B-Instruct, un VLM transformer que combina un codificador visual con un decoder de lenguaje. El adaptador se aplica sobre el decoder y se distribuye por separado (349 MB en F16), de modo que en inferencia se carga el modelo base cuantizado a Q4_K_M, el proyector visual `v16-merged-mmproj-F16.gguf` (1,1 GB) y el LoRA v23 mediante `llama-server --lora`. El entrenamiento usó lr 2e-5, 2 épocas y fusión en bf16, con un coste de 2 horas y 5 minutos para 4.855 columnas (2.428 pasos, 3,1 s/paso) sobre una NVIDIA Thor de 122 GB de memoria unificada.

El conjunto de entrenamiento de v23 suma 4.855 columnas: 2.886 columnas de escritura real (30.336 caracteres), 437 columnas sintéticas renderizadas con fuentes y 1.500 pares de glifos individuales de fuentes TTF a 128×128. Las fuentes de aumento cubren en torno al 98 % de los caracteres: 衡山毛筆草書 (96 %, pincel real), 方正行楷 GBK (95 %) y 方正黄草 GBK (89 %). El hallazgo técnico destacable es que los pares de glifos individuales funcionan mucho mejor que las columnas sintéticas completas, y que existe un punto óptimo en torno al 31 % de datos TTF: con 1.500 pares el CER baja a 27,5 %, pero con 3.000 sube a 29,7 % porque el material sintético acaba dominando sobre la escritura real. El prompt de entrenamiento es fijo y restrictivo ("solo lee los trazos visibles, no recites poemas"), lo que mitiga la alucinación de textos canónicos.

## Capacidades

- Transcripción OCR de caligrafía cursiva y semi-cursiva china en disposición vertical (arriba→abajo), columna a columna.
- Salida de cadena continua en chino tradicional, sin puntuación.
- Lectura de escritura manual histórica sobre papel, incluidos trazos con pincel.
- Aumento de precisión mediante refinamiento iterativo en dos pasadas (autocorrección con el texto de la primera pasada como contexto).
- Comprensión imagen-texto heredada de Qwen3-VL-8B-Instruct (no es el objetivo del ajuste, pero está disponible en el modelo base).
- Soporte de conversación multi-turno vía API compatible con OpenAI (`/v1/chat/completions`).
- Capacidad multilingüe limitada a zh y en según la model card.
- No soporta (según el autor): caligrafía extremadamente cursiva (*kuangcao*), calcos sobre piedra (*tuoben*), anotaciones a doble columna interlineadas ni texto impreso de libros antiguos.

## Casos de uso

- Digitalización de manuscritos y libros antiguos: se recorta cada columna vertical y se envía al modelo, que devuelve el texto tradicional; encaja en proyectos de preservación documental que necesitan transcripción asistida con revisión humana posterior.
- Plataformas de investigación sinológica: investigadores que trabajan con facsímiles pueden obtener una primera transcripción automática y centrar el esfuerzo en la corrección, reduciendo el tiempo de lectura manual de cada columna.
- Herramientas de anotación y corrección: el autor propone un flujo de "dos lecturas alternativas por columna" con selección en un clic, aprovechando que el oráculo de 10 muestras alcanza CER 22,19 % y que ningún selector automático (voto de confianza, LM de 4-gramas, ensemble, verificador LLM) supera al humano.
- Archivos y bibliotecas digitales: integración en pipelines de digitalización masiva con llama.cpp en servidor local, dado el bajo requisito de hardware (modelo Q4_K_M de 4,7 GB más proyector de 1,1 GB) y un throughput de aproximadamente 1 segundo por columna.
- Aplicaciones educativas de caligrafía: comparación de trazos y apoyo al aprendizaje de lectura de cursiva clásica, con la salvedad de que el modelo no explica los caracteres, solo los transcribe.
- Prototipado de investigación en OCR histórico: al ser un LoRA pequeño y con licencia Apache-2.0, sirve como punto de partida para ajustes sobre otros corpus caligráficos o para experimentar con aumentación de datos mediante fuentes TTF.
- Despliegue en entornos con hardware modesto: al ejecutarse con llama.cpp y cuantización Q4_K_M, puede correr en estaciones de trabajo consumer con GPU de 8-12 GB o incluso en CPU (con latencia mayor), algo inviable con el modelo base en precisión completa.

## Benchmarks y rendimiento

Evaluación sobre `gold_test40`: 40 columnas verificadas manualmente, 331 caracteres, sin contaminación, decodificación greedy, mismo prompt y CER calculado por LCS columna a columna.

| Modelo | Precisión de carácter | CER |
|---|---|---|
| Qwen3-VL-8B original (sin LoRA) | 64,4 % | 35,6 % |
| BiMai v16 (LoRA v16) | 72,2 % | 27,8 % |
| **BiMai v23 (modelo publicado)** | **72,5 %** | **27,5 %** |

Evolución de versiones:

| Versión | CER | Precisión | Columnas de entrenamiento | Cambio |
|---|---|---|---|---|
| v8 | 34,7 % | 65,3 % | 1.215 | Ajuste inicial |
| v13 | 29,6 % | 70,4 % | 1.965 | Limpieza de datos |
| v16 | 27,8 % | 72,2 % | 2.708 | Corrección de rutas, primer uso del conjunto completo |
| v19 | 28,1 % | 71,9 % | 3.026 | Incorporación de 108 lecturas manuales |
| v21 | 28,1 % | 71,9 % | 3.026 | 114 correcciones, sin diferencia |
| **v23** | **27,5 %** | **72,5 %** | **4.855** | +437 columnas sintéticas y +1.500 pares de glifos TTF |

Experimentos de aumentación con TTF:

| Experimento | Datos TTF | CER | Conclusión |
|---|---|---|---|
| v22 (437 columnas sintéticas) | 437 | 28,2 % | Las columnas sintéticas impresas no ayudan |
| **v23 (1.500 glifos TTF)** | 1.500 | **27,5 %** | Punto óptimo (~31 %) |
| v24 (3.000 glifos TTF) | 3.000 | 29,7 % | Exceso: el sintético domina al real (38 %) |

Refinamiento iterativo en producción: dos pasadas de prompt con autocorrección bajan el CER de 27,5 % a 26,9 % sin reentrenar. Oráculo con 10 muestras por columna: CER 22,19 % (precisión 77,8 %), cota superior que ningún selector automático logró alcanzar.

## Requisitos de hardware

- VRAM estimada: el modelo base en Q4_K_M ocupa 4,7 GB, el proyector visual 1,1 GB y el LoRA 349 MB; en la práctica se necesita en torno a 7-9 GB de VRAM para inferencia cómoda con contexto moderado (estimación, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 8-12 GB o más; el autor entrenó en una NVIDIA Thor (122 GB unificados), pero la inferencia cuantizada es mucho más ligera.
- Cabe en GPU consumer: sí, en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) con Q4_K_M; en 6 GB requeriría cuantizaciones más agresivas no publicadas.
- Opciones de despliegue: llama.cpp (`llama-server`) con `--mmproj` y `--lora`; el repositorio usa la librería llama.cpp y la API es compatible con OpenAI, por lo que puede integrarse en clientes existentes. No se documentan despliegues con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: aproximadamente 1 segundo por columna según el autor; el refinamiento iterativo añade unos 5 segundos por columna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER en cursiva (gold_test40) | Licencia | Formato |
|---|---|---|---|---|---|
| **BiMai Chaosu OCR v23** | LoRA sobre 8B | no disponible | **27,5 %** | Apache-2.0 | GGUF + LoRA |
| Qwen3-VL-8B-Instruct (base) | ~8B | no disponible | 35,6 % | Apache-2.0 | safetensors, GGUF |
| BiMai v16 (versión anterior) | LoRA sobre 8B | no disponible | 27,8 % | Apache-2.0 | GGUF + LoRA |

No se dispone de datos de otros sistemas OCR especializados en cursiva china (por ejemplo, modelos dedicados de OCR histórico) en la información proporcionada, por lo que la comparativa se limita al modelo base y a las versiones previas del mismo proyecto.

## Limitaciones y advertencias

- Caligrafía extremadamente cursiva (*kuangcao*) y trazos muy ligados: la tasa de error sube y el autor exige revisión manual.
- No soporta calcos sobre piedra (*tuoben*), anotaciones interlineadas a doble columna ni texto impreso de libros antiguos.
- Riesgo de alucinación: el modelo base tiende a recitar poemas o pasajes canónicos; el prompt de entrenamiento lo mitiga, pero el autor recomienda usar exactamente ese prompt y temperatura 0.
- El ajuste se ha realizado solo con datos de caligrafía china; los idiomas declarados son zh y en, y la salida es siempre en chino tradicional sin puntuación.
- El CER del 27,5 % implica que aproximadamente uno de cada cuatro caracteres puede ser erróneo: no es apto para transcripción sin supervisión humana.
- La evaluación se basa en un conjunto de solo 40 columnas y 331 caracteres, lo que limita la significación estadística de las diferencias entre versiones (v16 frente a v23 difiere en 0,3 puntos).
- Licencia Apache-2.0 en los pesos y MIT en el código periférico: permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3-VL-8B-Instruct.
- El repositorio incluye únicamente el adaptador y el proyector visual; es necesario descargar por separado el modelo base Qwen3-VL-8B-Instruct en GGUF.
- El autor declara explícitamente que el uso implica asumir la responsabilidad de la corrección posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinyeah/BiMai-Chaosu-OCR
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Runtime llama.cpp: https://github.com/ggml-org/llama.cpp
