# dtsj89/puki-brains-en

## Resumen

Puki Brains (English) es un modelo de lenguaje de 44 millones de parámetros desarrollado por dtsj89 para el juego infantil Puki, una aplicación gratuita bilingüe hebreo/inglés para niños de dos a cuatro años. Su función es muy concreta: recibe un prompt corto sobre un momento del juego, una frase del niño o una tarea lúdica (un error gracioso que cometer a propósito, un dibujo del que hablar, el día que hay que recordar antes de dormir) y genera una única línea breve y amable en inglés adaptada a la edad. No es un modelo de chat general y su conocimiento del mundo es deliberadamente mínimo.

Técnicamente es un decoder estilo LLaMA de 14 capas, anchura 512, 8 cabezas de atención con 2 cabezas clave/valor (tamaño de cabeza 64), RoPE, embeddings atados y una ventana de contexto de 512 tokens. El tokenizador es un BPE a nivel de byte de 8.192 tokens entrenado sobre inglés. El modelo se distribuye en formato ONNX con cuantización int8 dinámica por canal, lo que reduce el archivo a 61 MB y permite ejecución completamente offline en la propia tableta.

Su relevancia radica en el despliegue extremo: demuestra que un modelo de 44M parámetros, entrenado desde cero con 1.600 millones de tokens y afinado con DPO, puede sustituir a un modelo grande en una tarea acotada con garantías de calidad (100% de las líneas pasan el filtro del juego) y con un coste computacional mínimo, sin dependencia de red ni de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo LLaMA (14 capas, anchura 512, 8 cabezas de atención, 2 cabezas KV, tamaño de cabeza 64, RoPE, embeddings atados) |
| Parámetros totales | 44 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | int8 dinámica, por canal, solo pesos MatMul |
| Idiomas soportados | inglés (existe un modelo hermano en hebreo: dtsj89/puki-brains-he) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`brains_int8.onnx`, 61 MB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso estilo LLaMA con 14 capas, dimensión oculta 512, 8 cabezas de atención y 2 cabezas clave/valor (atención multi-query con grupo de 4), tamaño de cabeza 64, RoPE para codificación posicional y embeddings atados entre entrada y salida. El tokenizador es un BPE a nivel de byte con vocabulario de 8.192 tokens entrenado sobre inglés; el token `<|endoftext|>` (id 0) marca el final de línea. La ventana de contexto es de 512 tokens.

El entrenamiento se realizó en tres fases. Primero, preentrenamiento desde cero sobre 1.600 millones de tokens de inglés con el optimizador Muon (learning rate 2e-3) y un schedule warmup-stable-decay: fase constante seguida de un cooldown 1-sqrt durante el último 20% del entrenamiento. Las fuentes de datos fueron FineWeb-Edu, Cosmopedia, Project Gutenberg filtrado y YouTube filtrado (Common Pile). Segundo, fine-tuning supervisado sobre 30.799 líneas en inglés de Puki a lo largo de una docena de tareas, durante dos épocas; esas líneas fueron generadas por modelos DeepSeek y filtradas por los filtros de Puki y el juicio de un segundo modelo (dataset dtsj89/puki-lines). Tercero, ajuste por preferencias con DPO sobre 1.485 pares de líneas propias (la mejor y la peor de cuatro para cada prompt, según la puntuación del editor de DeepSeek), durante 100 pasos. El código de entrenamiento está en el directorio `train/` del repositorio de Puki (`pt_run.py`, `sft_small.py`, `dpo_onpolicy.py --judge`, `dpo_small.py`).

## Capacidades

- Generación de texto corto en inglés: una única línea breve y amable por prompt, adaptada a niños de dos a cuatro años.
- Comprensión de prompts contextuales del juego: momentos ("el niño dio de comer al elefante"), frases del niño o tareas lúdicas específicas.
- Generación de errores graciosos intencionados que no revelan la respuesta correcta (55 de 87 casos en las pruebas de verdad).
- Corrección de errores: decir la respuesta real ante un error gracioso (145 de 149 casos).
- Recuento del día: retelling con al menos dos eventos reales (223 de 225 casos).
- Generación de la siguiente frase de un cuento y descripción de dibujos.
- Respuesta a un amigo que necesita ayuda.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (el hebreo se cubre con el modelo hermano).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Generación de diálogo en juegos infantiles offline: el modelo se ejecuta en la propia tableta Android mediante el runtime `Brains.kt` (temperatura 0.5, top-p 0.9) y escribe las líneas del loro Puki en tiempo real sin conexión, lo que elimina la dependencia de servicios en la nube y protege la privacidad de los menores.
- Narración interactiva antes de dormir: recibe los eventos del día registrados por el juego y genera un relato breve con al menos dos eventos reales, adecuado para la rutina de sueño de niños de dos a cuatro años.
- Corrección pedagógica de errores: ante un error gracioso planteado por el juego, el modelo produce la respuesta correcta de forma natural (145 de 149 aciertos en las pruebas), reforzando el aprendizaje sin corregir de forma brusca.
- Descripción de dibujos del niño: el juego pasa un identificador o descripción del dibujo y el modelo genera una frase de reconocimiento y ánimo adaptada a la edad.
- Gestión de tareas sociales del juego: cuando un personaje necesita ayuda, el modelo redacta una línea que invita al niño a actuar, manteniendo un tono amable y comprensible.
- Filtrado y moderación en producción: dado que el 100% de sus líneas pasan el filtro de Puki en prompts no vistos, puede integrarse en un pipeline con listas de palabras previas, filtro posterior y verificación específica de cada juego, con líneas grabadas como respaldo cuando una línea no pasa.
- Prototipado de asistentes de voz para dispositivos de bajos recursos: su tamaño de 61 MB en int8 y su contexto de 512 tokens lo hacen viable en hardware embebido con recursos muy limitados.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre prompts no vistos durante el entrenamiento:

| Prueba | Resultado |
|---|---|
| Filtro de Puki (líneas que pasan) | 100% |
| Corrección de error gracioso (respuesta real) | 145/149 |
| Recuento del día con al menos dos eventos reales | 223/225 |
| Error gracioso que no revela la respuesta | 55/87 |
| Gate de frases infantiles (evaluación correcta) | 23/24 |
| A/B ciego juzgado por DeepSeek en ambos sentidos (250 prompts) | DPO gana 51 a 22 sobre el modelo solo con SFT (resto empates) |

El archivo int8 obtiene la misma puntuación que la versión float. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo ONNX int8 ocupa 61 MB y el contexto máximo es de 512 tokens.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en hardware móvil; el runtime de referencia es Android (`Brains.kt`).
- Opciones de despliegue: ONNX Runtime (formato nativo), con posibilidad de conversión a otros runtimes; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño apunta a generación token a token en dispositivo con temperatura 0.5 y top-p 0.9.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Puki Brains (English) | 44M | 512 | Apache 2.0 | Generación de una línea para juego infantil, offline en tableta |
| Puki Brains (Hebrew) | no disponible | no disponible | Apache 2.0 | Modelo hermano para las líneas en hebreo del mismo juego |
| Modelos de chat general pequeños (p. ej. variantes de <1B) | 100M-1B | 2K-8K | variable | Conversación general; requieren más recursos y no están especializados en el dominio |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: no es un chat general y su conocimiento del mundo es mínimo; usarlo fuera de su tarea produce resultados pobres.
- Ventana de contexto de solo 512 tokens, insuficiente para conversaciones largas o documentos.
- Entrenado únicamente en inglés; el hebreo requiere el modelo hermano.
- Riesgo de alucinación en las tareas de recuento y corrección: aunque las tasas son altas, hay casos de fallo (4 de 149 en corrección, 2 de 225 en recuento, 32 de 87 en errores que no revelan la respuesta).
- El 37% de los errores graciosos revelan la respuesta, por lo que en el juego se reescribe la línea; en producción es necesario mantener ese mecanismo de reintento.
- Depende de capas externas del juego (listas de palabras previas, filtro posterior, verificación por juego, revisión parental y líneas grabadas de respaldo) para garantizar la calidad; no debe desplegarse sin ellas.
- Licencia Apache 2.0 permite uso comercial, pero los datos de preentrenamiento incluyen FineWeb-Edu (ODC-By 1.0 y términos de Common Crawl) y YouTube filtrado (CC BY), cuyas condiciones pueden afectar a la redistribución del modelo.
- Sin datos publicados de sesgos; al estar entrenado con líneas generadas por modelos DeepSeek y filtradas, puede heredar sesgos de esos modelos y del proceso de filtrado.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dtsj89/puki-brains-en
- Modelo hermano en hebreo: https://huggingface.co/dtsj89/puki-brains-he
- Repositorio del juego Puki: https://github.com/TomSadeh/puki
- Dataset de líneas de Puki: https://huggingface.co/datasets/dtsj89/puki-lines
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Project Gutenberg filtrado (Common Pile): https://huggingface.co/datasets/common-pile/project_gutenberg_filtered
- YouTube filtrado (Common Pile): https://huggingface.co/datasets/common-pile/youtube_filtered
