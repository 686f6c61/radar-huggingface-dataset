# ahtx/AH-Inkling-2-Mini

## Resumen

AH-Inkling-2-Mini es una recuantización en 2 bits del modelo Inkling 2 Mini de Thinking Machines Lab, publicada por el usuario ahtx. No se trata de un modelo entrenado desde cero ni de un ajuste fino: el autor declara explícitamente que solo ha modificado el formato numérico de los pesos, manteniendo intactos tokenizador, plantilla de chat y valores de muestreo del original. Su relevancia radica en que comprime un modelo de mezcla de expertos (MoE) de 26.070.385.152 parámetros en un único archivo de 7,4 GiB, lo que permite ejecutar los 3.072 expertos completos en la memoria de una GPU de 8 GB sin offload.

El modelo base es un transformer con arquitectura de bucle (looped transformer) de 24 capas, en el que las 12 capas centrales se ejecutan tres veces compartiendo pesos, de modo que cada token atraviesa 48 aplicaciones de capa. Cada capa enruta cada token a 8 de 128 expertos. Thinking Machines Lab cifra en 5,4B los parámetros efectivos activos por token. El original acepta también imágenes, pero esta cuantización solo ejecuta la parte de texto.

La ficha es relevante para desarrolladores que necesitan desplegar un MoE de gran tamaño en hardware de gama consumer antigua o de bajo coste, asumiendo una pérdida de calidad medible y una dependencia estricta del runtime Kindi 0.7.1 o superior, ya que emplea tipos de tensor GGUF propietarios (116 y 117) que llama.cpp, Ollama y LM Studio no pueden cargar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas en bucle (looped transformer), 24 capas, 12 centrales repetidas 3 veces |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 5,4B por token (según Thinking Machines Lab) |
| Longitud de contexto | Hasta 14.336 tokens en GTX 1080 8 GB y 32.768 tokens en RTX 3080 10 GB (con todos los expertos en VRAM); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Expertos en 2 bits (Kindi IQ2_XS_128 para gate y up de las 12 capas en bucle; Kindi IQ2_XXS_128 para el resto de expertos), proyecciones de atención y capa de salida en Q4_0, pesos de control de bucle en Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con tipos de tensor específicos de Kindi (116 y 117) |

## Arquitectura y entrenamiento

El modelo base, Inkling 2 Mini, es un MoE de Thinking Machines Lab con 24 capas y enrutamiento a 8 de 128 expertos por token (3.072 expertos en total). Las 12 capas centrales se reutilizan tres veces con pesos compartidos, lo que eleva a 48 las aplicaciones de capa por token y explica la diferencia entre los 26,4B de parámetros totales y los 5,4B efectivos activos. El original es multimodal (acepta imágenes), pero esta versión solo procesa texto.

Esta publicación no entrena ni ajusta el modelo: parte del archivo UD-Q4_K_M de Unsloth (16,6 GB) y lo recuantiza con Kindi usando una importance matrix recogida sobre aproximadamente 1.500 tokens de texto mixto. Se conservan la plantilla de chat, el tokenizador y los valores de muestreo del original. No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base dentro de la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat y "reasoning effort" configurable (el autor evalúa con effort 0).
- Razonamiento aritmético y problemas de palabras con respuesta numérica.
- Generación de código Python verificado mediante tests ocultos.
- Seguimiento de instrucciones con reglas comprobables.
- Uso como agente de codificación: el autor lo ejecuta con opencode 1.19.5 contra el servidor compatible con OpenAI de Kindi, con sesiones de 8K a 30K tokens.
- Generación de aplicaciones web completas en un único archivo HTML (Three.js, juegos, landing pages).
- Capacidad multimodal: no disponible en esta cuantización (el original acepta imágenes; Kindi solo ejecuta texto).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Agente de codificación en local sobre GPU de 8-10 GB: con el servidor compatible con OpenAI de Kindi y opencode, el modelo mantiene sesiones de 8K a 30K tokens y genera aplicaciones funcionales en un solo archivo; encaja en equipos sin acceso a GPUs de datacenter.
- Prototipado de front-end y demos interactivas: el autor documenta la generación de un coche en Three.js, una isla flotante con nieve, un space shooter y una landing page SaaS, todos en un único HTML sin dependencias externas, lo que resulta útil para maquetas rápidas verificables en navegador.
- Automatización de tareas aritméticas y problemas de palabras: con 12/12 aciertos en el conjunto de matemáticas del autor, sirve para asistentes de cálculo sencillo donde la latencia importa más que la profundidad de razonamiento.
- Generación y comprobación de funciones Python: 11/12 en tareas de código con tests ocultos, adecuado para autocompletado y generación de utilidades en pipelines internos con revisión humana.
- Despliegue en hardware heredado: al caber en una GTX 1080 de 8 GB con 21,5 tokens/s de generación, permite montar entornos de desarrollo o demos en estaciones de trabajo antiguas sin offload a CPU.
- Experimentación con cuantizaciones extremas: útil para investigadores que comparan la degradación de calidad de 2 bits frente a 4 bits con métricas de divergencia KL y perplejidad sobre el mismo motor.
- Asistente conversacional de un solo idioma: para productos dirigidos a inglés donde el coste de GPU es la restricción principal y se acepta la pérdida de calidad de la cuantización.

## Benchmarks y rendimiento

Calidad medida por el autor contra el archivo UD-Q4_K_M de Unsloth (16,6 GB), mismo motor Kindi, en CPU, con decodificación greedy, un turno, reasoning effort 0 y límite de 800 tokens nuevos:

| Archivo | Tamano | Matematicas (12) | Codigo (12) | Instrucciones (8) | Total (32) |
|---|---:|---:|---:|---:|---:|
| UD-Q4_K_M | 16,6 GB | 12 | 11 | 8 | 31 |
| AH-Inkling-2-Mini (IQ2_M) | 7,9 GB | 12 | 11 | 7 | 30 |

Métricas de fidelidad sobre 1.999 posiciones de texto plano frente al archivo Q4:

| Metrica | Valor |
|---|---|
| Coincidencia del token más probable | 86,8% de las posiciones |
| Divergencia KL media | 0,105 (mediana 0,037) |
| Perplejidad | 4,19 (Q4: 3,91), un 7,2% superior |

Rendimiento en Kindi con todos los expertos en VRAM y decodificación greedy (prompt de 512 tokens, 128 tokens generados, contexto 2.048, media de 3 ejecuciones):

| GPU | Prompt (tokens/s) | Generacion (tokens/s) |
|---|---:|---:|
| GTX 1080 8 GB | 121,3 | 21,5 |
| RTX 3080 10 GB | 523,2 | 29,4 |

Sesiones de agente de codificación (opencode 1.19.5, contexto 32.768, 8K-30K tokens en uso, cuatro sesiones) en RTX 3080 10 GB: lectura de prompt de 428 a 453 tokens/s y generación de 20,3 a 21,2 tokens/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización en la información disponible; los del modelo original corresponden a los pesos sin cuantizar.

## Requisitos de hardware

- VRAM: el archivo ocupa 7,4 GiB (7.947.408.096 bytes) y todos los expertos caben en 8 GB de VRAM sin offload.
- GPU compatibles verificadas por el autor: GTX 1080 8 GB y RTX 3080 10 GB.
- Contexto máximo con todos los expertos en VRAM: 14.336 tokens en GTX 1080 8 GB y 32.768 tokens en RTX 3080 10 GB.
- GPU de datacenter (A100, H100): no se han publicado mediciones en la información disponible.
- Despliegue: exclusivamente Kindi 0.7.1 o superior. llama.cpp, Ollama, LM Studio y otros runtimes GGUF no pueden cargar el archivo por sus tipos de tensor 116 y 117; para esos runtimes el autor remite a los GGUF de Unsloth.
- Throughput: 21,5 tokens/s de generación en GTX 1080 y 29,4 tokens/s en RTX 3080 con prompt corto; 20,3-21,2 tokens/s en sesiones de agente con contexto largo en RTX 3080.
- Servidor compatible con OpenAI incluido en Kindi para integración con clientes tipo opencode.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Calidad relativa |
|---|---|---|---|---|---|
| AH-Inkling-2-Mini | 26,4B totales, 5,4B activos | 14.336-32.768 tokens según GPU | GGUF propietario, solo Kindi | Apache 2.0 | 30/32 en el set del autor; perplejidad 4,19 |
| Unsloth UD-Q4_K_M (mismo base) | 26,4B totales, 5,4B activos | No disponible | GGUF estándar, llama.cpp/Ollama/LM Studio | Apache 2.0 | 31/32; perplejidad 3,91 |
| Inkling-2-Mini original (Thinking Machines Lab) | 26,4B totales, 5,4B activos | No disponible | Pesos sin cuantizar; multimodal | Apache 2.0 | Referencia de benchmarks del modelo completo |

La comparativa con modelos de otros fabricantes del mismo tamaño o tarea no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: perplejidad un 7,2% superior al Q4, divergencia KL media de 0,105 y un fallo adicional en el set de 32 tareas (formato de mayúsculas en una respuesta).
- El conjunto de evaluación del autor es pequeño (32 tareas, 1.999 posiciones); según sus propias palabras, no permite detectar diferencias de pocos puntos.
- Dependencia de runtime: no funciona en llama.cpp, Ollama, LM Studio ni otros motores GGUF estándar; requiere Kindi 0.7.1 o superior, lo que limita portabilidad y opciones de despliegue en producción.
- Solo texto: pierde la capacidad multimodal del modelo original.
- Solo inglés: la model card declara únicamente el idioma inglés.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de sesgos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la obligación de usar un runtime concreto puede condicionar la viabilidad en entornos regulados o multiplataforma.
- El autor no entrenó el modelo ni modificó su comportamiento de forma intencionada; cualquier cambio de comportamiento proviene exclusivamente de la cuantización.
- En tareas de agente complejas puede requerir seguimiento: en la petición de un sistema operativo web completo, el primer resultado no arrancó y necesitó dos mensajes de seguimiento para que 11 de 12 aplicaciones funcionaran, con un fallo en la app de pintura que borraba el lienzo cada segundo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahtx/AH-Inkling-2-Mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth para runtimes estándar: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Runtime Kindi: https://amirhusain.com/kindi
- Demos y análisis del autor: https://amirhusain.com/inkling
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
