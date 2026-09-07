# experimentalmachines/LFM2.5-1.2B-Instruct-ExecuTorch-XNNPACK-32k

## Resumen

LFM2.5-1.2B-Instruct-ExecuTorch-XNNPACK-32k es una versión compilada para el runtime ExecuTorch 1.4.0 del modelo LFM2.5-1.2B-Instruct de Liquid AI. No es un modelo nuevo, sino una adaptación del modelo base para ejecutarse eficientemente en CPUs Arm mediante los backends XNNPACK y KleidiAI. El objetivo es permitir la inferencia on-device en dispositivos Android sin depender de GPU o NPU, con pesos cuantizados en int4 (grupos de 32) y activaciones dinámicas int8 (8da4w), lo que reduce el tamaño del archivo a 827 MB.

La arquitectura del modelo base es híbrida: 16 capas en total, de las cuales 6 emplean atención y el resto convoluciones cortas. Esta versión fija la ventana de contexto en 32.768 tokens en tiempo de exportación, lo que implica una asignación estática de la caché KV de aproximadamente 805 MB en fp32. Según las mediciones del autor, en un SoC Dimensity 9400 el modelo alcanza 343 tokens/s en prefill y 40,5 tokens/s en decode, con una memoria residente de 1,77 GB. Es relevante para aplicaciones móviles que necesitan privacidad, baja latencia y funcionamiento sin conexión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas, 6 de atención y 10 de convoluciones cortas |
| Parámetros totales | 1.200 millones (1.2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (fijada en exportación) |
| Tipos de cuantización | int4 (grupos de 32) con activaciones dinámicas int8 (8da4w); tabla de embeddings en int8 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License 1.0 (lfm1.0) |
| Formato de pesos | ExecuTorch .pte (compilado para CPU Arm); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct presenta una arquitectura híbrida de 16 capas, donde solo 6 capas utilizan mecanismo de atención y las 10 restantes se apoyan en convoluciones cortas. Esta combinación reduce el coste computacional en secuencias largas, un rasgo característico de los modelos Liquid de Liquid AI. No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens ni la composición del dataset en la información disponible.

La innovación técnica de esta variante reside en la compilación para ExecuTorch 1.4.0 con el backend XNNPACK y los micro-kernels de KleidiAI para CPUs Arm con extensiones i8mm y dotprod. La cuantización int4 en grupos de 32 con activaciones dinámicas int8 es el formato que estos kernels consumen de forma nativa. Además, la caché KV está asignada estáticamente durante la carga, lo que impide cambiar la ventana de contexto sin reexportar el archivo. El prefill está limitado a 2048 tokens y no se incluye ningún delegado de GPU o NPU.

## Capacidades

- Generación de texto y razonamiento matemático básico: en las pruebas del autor, obtuvo 12/30 en GSM8K.
- Seguimiento de instrucciones: 18/30 en IFEval.
- Soporte de tool calling / function calling: 27/30 en BFCL (Berkeley Function Calling Leaderboard), lo que indica capacidad para invocar funciones definidas por el usuario.
- Ejecución on-device en CPUs Arm (Android) mediante el runtime de ExecuTorch, con pesos cuantizados int4 e int8.
- Contexto largo de 32.768 tokens, útil para conversaciones extensas o documentos largos dentro de la ventana fija.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin soporte de visión, audio ni otros modos multimodales: el archivo exportado es exclusivamente para texto.

## Casos de uso

- Asistente móvil de mensajería sin conexión: el modelo puede redactar, resumir o corregir conversaciones directamente en el dispositivo, sin enviar datos a servidores externos. Su tamaño de 827 MB y su memoria residente de 1,77 GB lo hacen viable en teléfonos de gama media-alta.
- Chatbot de atención al cliente integrado en una app Android: con 32.768 tokens de contexto y soporte de function calling (27/30 en BFCL), puede gestionar conversaciones largas y ejecutar acciones como consultar el estado de un pedido o abrir un ticket.
- Herramienta de redacción y reescritura en aplicaciones de notas: el modelo puede generar textos, corregir gramática o reformular párrafos en tiempo real, con una velocidad de decode de 40,5 tokens/s en un Dimensity 9400.
- Clasificación y etiquetado de contenido en el dispositivo: gracias al prefill de 343 tokens/s, puede procesar rápidamente correos, mensajes o documentos para asignar categorías o detectar intenciones.
- Asistente de código ligero para entornos de desarrollo móvil: el modelo puede generar snippets, explicar fragmentos de código o sugerir refactorizaciones sencillas, aprovechando su capacidad de razonamiento.
- Extracción de información de documentos en local: la ventana de 32k permite analizar documentos extensos, como contratos o informes, y extraer campos clave sin necesidad de conexión a internet.
- Agente móvil con tool calling: al ejecutarse en CPU Arm, puede integrarse en un agente Android que llame a funciones del sistema (enviar mensajes, abrir apps, cambiar ajustes) mediante el protocolo de function calling.

## Benchmarks y rendimiento

Los datos de rendimiento y evaluación provienen del estudio del autor, medidos en un SoC Dimensity 9400 con el dispositivo despierto y refrigerado, sobre un prompt de 929 tokens y con un límite de 640 tokens en la respuesta. El autor indica que las puntuaciones pueden variar hasta en 3 puntos entre ejecuciones.

| Métrica | Valor |
|---|---|
| Velocidad de prefill | 343 tokens/s |
| Velocidad de decode | 40,5 tokens/s |
| Memoria residente tras carga | 1,77 GB |
| Tamaño del archivo .pte | 827 MB |
| GSM8K | 12/30 |
| IFEval | 18/30 |
| BFCL | 27/30 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica, el modelo se ejecuta en CPU.
- Memoria RAM: se requieren aproximadamente 1,77 GB de memoria residente tras la carga, más el espacio para la caché KV (805 MB para la ventana completa).
- GPU recomendada: no aplica; no se utiliza ningún delegado de GPU o NPU.
- Compatibilidad con consumer GPU: no aplica, el archivo .pte está compilado para CPUs Arm.
- Opciones de despliegue: ExecuTorch 1.4.0 LLM runtime con backend XNNPACK en dispositivos Android; el autor lo integra en la app OpenWeights.
- SoCs compatibles: cualquier CPU Arm con extensiones i8mm y dotprod, como Dimensity 9400, Snapdragon 8 Elite, Tensor G5 y Exynos 2400.
- Latencia y throughput: 343 tokens/s en prefill y 40,5 tokens/s en decode, medidos en Dimensity 9400.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (base) | 1.2B | No disponible | No disponible | safetensors | LFM Open License 1.0 |
| LFM2.5-1.2B-Instruct-ExecuTorch-XNNPACK-32k (este) | 1.2B | 32.768 tokens | int4 + int8 (8da4w) | ExecuTorch .pte | LFM Open License 1.0 |
| alpharomercoma/LFM2.5-1.2B-Instruct-ExecuTorch-XNNPACK | 1.2B | Varias ventanas (2k a 16k y 32k) | int4 + int8 (8da4w) | ExecuTorch .pte | LFM Open License 1.0 |

La principal diferencia con el modelo base es la compilación para ExecuTorch y la cuantización, que reducen el tamaño y permiten la ejecución en CPU Arm. La variante de alpharomercoma ofrece múltiples ventanas de contexto, mientras que esta versión fija la de 32k. No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Ventana de contexto fija en 32.768 tokens en tiempo de exportación: no se puede ampliar ni reducir sin recompilar el archivo .pte.
- El runtime de ExecuTorch 1.4.0 no inserta automáticamente el token BOS, por lo que la aplicación debe añadir manualmente `<|startoftext|>` al principio del prompt para respetar la plantilla del modelo.
- Sin soporte de GPU o NPU: el modelo solo se ejecuta en CPU, lo que limita el rendimiento en tareas muy intensivas.
- Resultados de benchmarks con variabilidad de hasta ±3 puntos entre ejecuciones, según el propio autor.
- El archivo .pte está compilado para CPUs Arm; no funcionará en procesadores x86 sin un proceso de reexportación.
- Sesgos y riesgos de alucinación: no se han proporcionado evaluaciones específicas. Al tratarse de un modelo de 1.200 millones de parámetros, se recomienda validar las respuestas en aplicaciones de producción.
- Idiomas soportados: no especificados en la información; el tokenizer es el del modelo base, pero no se ha verificado su rendimiento en idiomas distintos del inglés.
- Licencia LFM Open License 1.0: es necesario revisar los términos exactos, especialmente para uso comercial, en el enlace incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM2.5-1.2B-Instruct-ExecuTorch-XNNPACK-32k
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Estudio sobre el coste de la ventana de contexto: https://alpharomercoma.github.io/openweights/window.html
- Repositorio OpenWeights: https://github.com/alpharomercoma/openweights
- Variante con múltiples ventanas: https://huggingface.co/alpharomercoma/LFM2.5-1.2B-Instruct-ExecuTorch-XNNPACK
