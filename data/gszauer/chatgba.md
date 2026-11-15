# gszauer/ChatGBA

## Resumen

ChatGBA es un modelo de lenguaje conversacional de 4.003.264 parámetros entrenado desde cero por el desarrollador independiente gszauer, publicado bajo licencia MIT. Forma parte de la familia de modelos Gab (Gab 10M, Gab 100M, Gab 1B) y representa el miembro extremo de la familia en cuanto a reducción de tamaño: su diseño de bloques deriva del de Gab 10M, comprimido hasta caber íntegramente en un cartucho de Game Boy Advance. El modelo opera a nivel de byte (sin tokenizador) y está orientado a conversaciones cortas en inglés.

La relevancia de ChatGBA no reside en su rendimiento bruto, sino en su carácter demostrativo: es un transformer decoder-only completo, con atención agrupada, capas canon y MLP SwiGLU, que se ejecuta en aritmética entera sobre un ARM7TDMI a 16,78 MHz con 32 KB de RAM rápida y 256 KB de RAM lenta. El cartucho `ChatGBA.gba` (4,03 MiB) contiene el programa y los pesos en int8, y genera aproximadamente una letra cada dos segundos a velocidad real de hardware.

El modelo se distribuye también en formato float32 para Transformers (`model.safetensors`) y en su formato nativo `GAB_`, con una implementación canónica en JavaScript sin dependencias (`reference.js`) que sirve como referencia de entrenamiento e inferencia. Su contexto es de 512 bytes con ventana deslizante, lo que lo sitúa como una pieza de interés para investigación en eficiencia extrema, cuantización int8 y despliegue en hardware restringido, más que como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con pre-normalización RMSNorm, capas canon (convolución causal de 4 taps), GQA con QK-norm, RoPE intercalado, ventanas de atención cortas y MLP SwiGLU |
| Parametros totales | 4.003.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 bytes (ventana deslizante) |
| Tipos de cuantizacion | float32 (safetensors y formato GAB); int8 con una escala por fila de salida en el cartucho GBA |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), `chatgba-float32.gab` (formato nativo GAB_), `chatgba-int8.bin` (int8), `ChatGBA.gba` (cartucho) |
| Bloques transformer | 10 |
| Dimensión de features | 192 |
| Cabezas de atención | 6 query heads, 2 key/value heads (GQA) |
| Dimensión de cabeza | 32 |
| Ventanas de atención | 64 bytes en bloques 1–4 y 6–9; contexto completo en bloques 5 y 10 |
| Dimensión oculta del MLP | 512 (SwiGLU) |
| Kernel de capa canon | 4 |
| Tamaño de vocabulario | 256 (bytes UTF-8) |
| Base RoPE | 10.000 (pares intercalados) |
| Epsilon de RMSNorm | 1e-5 |
| Precisión | float32; int8 en Game Boy Advance |

## Arquitectura y entrenamiento

ChatGBA es un transformer decoder-only con pre-normalización mediante RMSNorm. Cada bloque aplica una capa canon antes de la atención y antes del MLP: una convolución causal de 4 taps por feature que mezcla cada posición con las tres anteriores y se suma como residual (`a = a + sum_j w_j * a[t - j]`), lo que permite a cada posición ver sus vecinos inmediatos con solo 768 parámetros por bloque. La atención usa grouped-query attention con 6 cabezas de consulta de 32 dimensiones que comparten 2 cabezas clave/valor (tres consultas por cada par KV), reduciendo el caché a un tercio. Consultas y claves reciben una RMSNorm propia (QK-norm) antes de RoPE, que emplea pares intercalados con `freq_i = 1/10000^(2i/32)`. Ocho de los diez bloques limitan la atención a una ventana de 64 bytes; solo los bloques 5 y 10 ven el contexto completo, de modo que los bloques locales son baratos y los dos globales sostienen la conversación. El MLP es SwiGLU (192 → 512 → 192, sin sesgos) y el unembedding está atado a la matriz de entrada (`logits = RMSNorm(h) @ E.T`).

El modelo se entrena desde cero a nivel de byte: cada byte UTF-8 es un token, con vocabulario de 256 y sin tokenizador que aprender. Los datasets declarados son `HuggingFaceTB/smollm-corpus` y `HuggingFaceTB/smol-smoltalk`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La definición canónica del modelo es `reference.js`, una implementación en JavaScript sin dependencias (librería de tensores, autograd, modelo, caché KV y entrenador) contra la que se hace coincidir el código de entrenamiento. La implementación en Transformers recalcula los últimos 512 bytes en cada paso de generación, sin caché KV, mientras que `reference.js` y el motor del cartucho sí implementan generación con caché KV. En Game Boy Advance, los pesos se leen en int8 con una escala por fila de salida, escalas de normalización y filtros canon en Q16, y tablas de búsqueda para RoPE, softmax y SiLU, todo en aritmética entera sobre un procesador sin coma flotante ni instrucción de división.

## Capacidades

- Generación de texto conversacional en inglés con turnos cortos, mediante plantilla de chat con marcadores propios y token de parada `<|e|>`.
- Modelado a nivel de byte: cualquier secuencia UTF-8 es tokenizable sin vocabulario externo, lo que elimina el sesgo de tokenizador y permite tratar texto arbitrario.
- Razonamiento y conocimiento factual muy limitados por su escala (4M parámetros); no se debe esperar resolución de problemas complejos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; solo inglés.
- Capacidades especiales: ejecución en hardware Game Boy Advance en aritmética entera int8, con teclado en pantalla; inferencia en navegador a través de emulador y versión JavaScript a velocidad completa.
- Generación con caché KV en `reference.js` y en el motor del cartucho; sin caché KV en el port de Transformers.

## Casos de uso

- Demostración educativa de transformers completos en hardware extremo: el cartucho `ChatGBA.gba` se ejecuta en mGBA o en un cartucho flash real, mostrando atención, RMSNorm, RoPE y SwiGLU en un ARM7TDMI a 16,78 MHz y sirviendo para explicar en clase cómo funciona un modelo de lenguaje pieza a pieza.
- Investigación en cuantización int8 para inferencia entera: `chatgba-int8.bin` y el motor en C con bucle interno en ensamblador ARM permiten estudiar el impacto de una escala por fila de salida y tablas de búsqueda para RoPE, softmax y SiLU en la calidad de generación.
- Estudio de arquitecturas eficientes con ventanas de atención locales y globales: la combinación de ventanas de 64 bytes en ocho bloques y contexto completo en dos bloques ofrece un banco de pruebas reproducible para medir el coste del caché KV y el alcance efectivo del contexto.
- Referencia de implementación para portar modelos a otros entornos restringidos: `reference.js` actúa como especificación canónica sin dependencias, y el formato `GAB_` (preámbulo de 12 bytes, cabecera JSON con formas y marcadores de chat, pesos en orden de `parameters()`) facilita reimplementaciones en microcontroladores o FPGA.
- Prototipado de chat conversacional en navegador sin backend: la demo en gabormakesgames.com ejecuta el cartucho en un emulador y una versión JavaScript del modelo a velocidad completa, útil para experimentar con la plantilla de chat y el muestreo (temperatura 0,7, top_k 40) sin infraestructura.
- Pruebas de integración con Transformers y `trust_remote_code`: el port `modeling_gabgpt.py` y `chat.py` permiten validar pipelines de carga, plantilla de chat y decodificación con parada por cadena en un modelo minúsculo, como test de humo en CI antes de escalar a modelos mayores.
- Comparación de fidelidad entre implementaciones: al existir versión float32, versión int8 y versión JavaScript, se puede medir la divergencia de salidas entre precisión flotante, entera y el motor del cartucho sobre las mismas entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo float32 ocupa aproximadamente 16 MB (4.003.264 parámetros × 4 bytes), por lo que cabe en cualquier GPU consumer e incluso en CPU sin problemas; la versión int8 ocupa unos 4 MB.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) ejecuta el modelo con holgura, pero su tamaño hace que la CPU sea suficiente y a menudo preferible por simplicidad.
- Cabe en consumer GPU: sí, en cualquier GPU consumer con al menos 1 GB de VRAM; también en Raspberry Pi y en el propio Game Boy Advance (int8).
- Opciones de despliegue: Transformers con `trust_remote_code=True` (port incluido), `chat.py` para chat en terminal, `reference.js` para JavaScript sin dependencias, emulador mGBA o cartucho flash para el cartucho GBA, y el motor en C con ensamblador ARM en `source/`.
- Latencia y throughput: en Game Boy Advance real, aproximadamente una letra cada 2 segundos; en navegador, la versión JavaScript a velocidad completa; en el port de Transformers, sin caché KV y recalculando los últimos 512 bytes por paso, adecuado para un modelo de 4M pero sin cifras de throughput publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| ChatGBA | 4.003.264 | 512 bytes (deslizante) | inglés | MIT | Hugging Face, navegador, cartucho GBA | Ejecutable en Game Boy Advance en int8 |
| Gab 10M | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face (gszauer/Gab10M) | Miembro mayor de la familia Gab; su diseño de bloques es la base de ChatGBA |
| Gab 100M | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face (gszauer/Gab100M) | Miembro de la familia Gab |
| Gab 1B | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face (gszauer/Gab1B) | Miembro mayor de la familia Gab |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Escala muy reducida (4M parámetros): el conocimiento factual, el razonamiento y la coherencia en conversaciones largas son limitados; no es apto para tareas de producción que requieran precisión.
- Riesgo alto de alucinación: con este tamaño y entrenamiento desde cero, las respuestas pueden ser plausibles pero incorrectas con frecuencia.
- Contexto de 512 bytes con ventana deslizante: al superarse, el byte más antiguo se descarta, lo que impide mantener conversaciones largas o documentos extensos.
- Solo inglés: no hay soporte multilingüe declarado.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo se distribuye sin garantías y su calidad no está validada para producción.
- El port de Transformers no usa caché KV y recalcula los últimos 512 bytes en cada paso, lo que puede ser lento en comparación con el motor del cartucho o `reference.js`.
- La tokenización a nivel de byte implica que `max_new_tokens` cuenta bytes, no tokens, lo que afecta a la configuración de generación.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse sobre `smollm-corpus` y `smol-smoltalk`, puede heredar sesgos de esos datasets.
- Fechas de creación y actualización del repositorio (2026) posteriores a la fecha habitual de referencia; verificar la vigencia de los enlaces antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gszauer/ChatGBA
- Demo en navegador: https://gabormakesgames.com/ChatGBA/
- Gab 10M: https://huggingface.co/gszauer/Gab10M
- Gab 100M: https://huggingface.co/gszauer/Gab100M
- Gab 1B: https://huggingface.co/gszauer/Gab1B
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
