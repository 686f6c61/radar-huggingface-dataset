# manuelgscom/rumor-village-e4b-GGUF

## Resumen

rumor-village-e4b es un ajuste fino mediante LoRA del modelo Gemma 4 E4B de Google, desarrollado por Manuel García Sanz y publicado en formato GGUF (Q4_K_M) para su uso con llama.cpp. El modelo no es un asistente conversacional de propósito general: está entrenado para cumplir un contrato muy concreto dentro de Rumor Village, un videojuego de simulación de rumores para Linux y Windows en el que hasta 100 vecinos de un pueblo 3D toman decisiones autónomas. Cada vecino envía al modelo una tarjeta breve (identidad, ubicación, vecinos presentes y conocimiento acumulado) y recibe una única acción en JSON: saludar, contar un rumor, preguntar por él, despedirse, desplazarse o no hacer nada, junto con una frase para el bocadillo.

El modelo base, Gemma 4 E4B, aporta una arquitectura transformer con aproximadamente 7.500 millones de parámetros totales, según los pesos en safetensors publicados. El ajuste se ha fusionado con el modelo base y cuantizado a Q4_K_M (5.335.287.008 bytes), lo que permite ejecutar a todos los vecinos en un solo lote sobre una única GPU de consumo, sin conexión a internet y en tiempo real. Es relevante porque demuestra un patrón de despliegue de agentes generativos a escala de juego: inferencia por lotes, salida forzada por gramática y validación determinista por parte del motor.

El modelo es bilingüe inglés-español, se distribuye bajo licencia Apache-2.0 y está pensado exclusivamente para las tareas `decide` (elegir la acción de un vecino a partir de su tarjeta) y `extract` (convertir un rumor escrito por el jugador con sus propias palabras en un hecho estructurado). No debe emplearse como chatbot general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B), ajuste fino con LoRA fusionado |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las tarjetas de entrada rondan los 256 tokens con prefijo compartido cacheado) |
| Tipos de cuantizacion | GGUF Q4_K_M (5,34 GB); no se detallan otras variantes |
| Idiomas soportados | inglés, español |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`gemma-4-E4B-it-rumor-Q4_K_M.gguf`) |
| Modelo base | google/gemma-4-E4B-it |
| Tamano del repositorio | 5,5 GB |
| Tareas soportadas | `decide`, `extract` |
| Salida estructurada | JSON forzado por gramática (say / go / none + texto) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, un transformer de Google con unos 7.500 millones de parámetros totales. Sobre esa base se aplicó un ajuste fino con LoRA, posteriormente fusionado en los pesos y cuantizado a GGUF Q4_K_M para su ejecución con llama.cpp. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible.

La innovación técnica principal no reside en la arquitectura, sino en el contrato de uso: la salida se restringe mediante una gramática a un conjunto cerrado de acciones JSON, de modo que el modelo propone y el motor del juego decide. El motor valida cada acción contra las reglas del mundo antes de aplicarla, y el estado viaja siempre como datos estructurados, nunca como texto de un bocadillo. Las tarjetas de entrada son cortas (unos 256 tokens) y comparten un prefijo cacheado, lo que permite procesar a todos los vecinos en un único lote. La evaluación se realizó sobre un test congelado de 1.000 tarjetas en inglés y otras 1.000 en español.

## Capacidades

- Generación de una única acción JSON por vecino: saludar, contar un rumor, preguntar por un rumor, despedirse, desplazarse o no hacer nada.
- Generación de una frase breve para el bocadillo del personaje, asociada a la acción elegida.
- Extracción de rumores: convierte texto libre del jugador en un hecho estructurado (tarea `extract`).
- Salida estructurada garantizada mediante gramática, con formato JSON forzado.
- Decisiones por lotes: hasta 100 vecinos decidiendo simultáneamente en un solo lote.
- Soporte bilingüe de lectura y escritura en inglés y español.
- Ejecución totalmente offline tras la descarga inicial del archivo GGUF.
- No es un modelo de chat general: no está entrenado para conversación abierta, código, matemáticas ni razonamiento de múltiples pasos fuera de su contrato.

## Casos de uso

- Simulación de PNJ en videojuegos: cada personaje recibe su tarjeta de contexto y devuelve una acción validable por el motor, lo que permite poblar un pueblo con hasta 100 agentes autónomos en una sola GPU de consumo.
- Propagación de rumores en un mundo simulado: el modelo decide a quién contar un rumor y a quién preguntar por él, generando cadenas de información (y desinformación) emergentes entre vecinos.
- Prototipado de agentes generativos: sirve como referencia de arquitectura "el modelo propone, el motor decide" para investigadores que quieran separar la generación de lenguaje de la lógica determinista del sistema.
- Extracción de hechos estructurados en lenguaje natural: la tarea `extract` convierte frases libres del jugador en datos que el motor puede almacenar y consultar.
- Despliegue offline en entornos sin conectividad: al ejecutarse con llama.cpp sobre GGUF, encaja en equipos de escritorio con GPU de consumo y sin acceso a red.
- Modding y experimentación sobre Rumor Village: el código del juego es abierto y el modelo se descarga automáticamente con verificación SHA-256, lo que facilita sustituirlo o reentrenarlo para otras simulaciones sociales.
- Investigación sobre coherencia en agentes: el test congelado de decisiones permite medir contradicciones, memorias inventadas y acciones rechazadas en un entorno controlado.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el test congelado de decisiones (1.000 tarjetas por idioma). No están verificados de forma independiente.

| Metrica | Inglés (%) | Español (%) |
|---|---|---|
| Memorias inventadas | 0,0 | 0,0 |
| Contradicciones | 0,1 | 0,2 |
| Texto incoherente | 0,6 | 0,0 |
| Acciones rechazadas | 0,9 | 1,0 |

La model card indica además que las memorias inventadas pasaron del 2,3 % en el modelo base al 0 % tras el ajuste fino. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5,5-6 GB con la cuantización Q4_K_M publicada, incluyendo el contexto y el prefijo cacheado compartido.
- GPU recomendadas: cualquier GPU de consumo con al menos 6-8 GB de VRAM; el autor menciona explícitamente soporte CUDA y Vulkan.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_M y procesando a todos los vecinos en un solo lote.
- Opciones de despliegue: llama.cpp (formato nativo del archivo), con backend CUDA o Vulkan; el juego lo descarga y ejecuta directamente.
- Latencia y throughput: no se publican cifras concretas; el autor afirma que los 100 vecinos deciden en un lote en tiempo real sobre una única GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rumor-village-e4b | 7.518.069.290 | no disponible | Agente de simulación con salida JSON forzada por gramática | Apache-2.0 | GGUF en Hugging Face |
| google/gemma-4-E4B-it | no disponible en la información | no disponible | Chat generalista | licencia de Gemma (no detallada aquí) | Hugging Face |
| Alternativas de agentes para juegos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (agentes para simulación de PNJ con salida estructurada) en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo de chat general: está entrenado para un contrato cerrado de dos tareas y su uso fuera de él no está validado.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El modelo base Gemma puede arrastrar sesgos presentes en sus datos de entrenamiento; la model card no documenta evaluaciones de sesgo.
- Riesgo de alucinación mitigado por la gramática y la validación del motor, pero no eliminado: el motor rechaza entre el 0,9 % y el 1,0 % de las acciones en el test congelado.
- Cobertura lingüística limitada a inglés y español.
- La longitud de contexto no está documentada; el diseño asume tarjetas de unos 256 tokens, por lo que entradas mucho más largas pueden degradar el comportamiento.
- Aunque la licencia es Apache-2.0, el modelo base Gemma puede imponer condiciones adicionales que conviene revisar antes de un uso comercial.
- El archivo GGUF publicado corresponde únicamente a la cuantización Q4_K_M; no se ofrecen otras variantes en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/rumor-village-e4b-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Sitio web del autor: https://manuelgs.com/en/rumor-village/
- Demo web del juego: https://manuelgs.com/en/rumor-village/demo/
- Repositorio del juego: https://github.com/manuelgscom/rumor-village
- Descargas del juego: https://github.com/manuelgscom/rumor-village/releases/latest
- Archivo GGUF Q4_K_M: https://huggingface.co/manuelgscom/rumor-village-e4b-GGUF/resolve/main/gemma-4-E4B-it-rumor-Q4_K_M.gguf?download=true
- Licencia: https://huggingface.co/manuelgscom/rumor-village-e4b-GGUF/blob/main/LICENSE
