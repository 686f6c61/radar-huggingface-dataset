# Convergent-ch/Pico-1.3-Math

## Resumen

Pico 1.3-Math es un modelo de lenguaje de 8.114.976 parámetros (8,1 M) desarrollado por Convergent y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo de propósito general: es un especialista entrenado desde cero, con inicialización aleatoria, para resolver operaciones aritméticas y problemas de palabras sencillos en inglés, descomponiendo cada solución en pasos intermedios verificables. Su relevancia no está en la capacidad bruta, sino en el enfoque: un modelo que cabe en cualquier dispositivo y que demuestra que un transformer diminuto puede aprender procedimientos aritméticos exactos si el dataset sintético está generado paso a paso por Python.

La arquitectura es un decoder estilo Llama con 8 capas, tamaño oculto 288, MLP de 768 con SwiGLU, 6 cabezas de atención, RoPE, RMSNorm, embeddings atados y una ventana de contexto de 1024 tokens. El tokenizador es un BPE a nivel de byte con solo 512 entradas y sin ninguna fusión que combine dígitos, de modo que cada cifra es siempre un token independiente; esta decisión es la que permite al modelo operar dígito a dígito.

El entrenamiento se hizo sobre 800.000 problemas sintéticos (unos 45 M de tokens) en una única RTX 3060 Ti durante aproximadamente 40 minutos. El modelo reporta un 99,8 % de acierto en el rango de entrenamiento (números de hasta 4 dígitos), pero cae al 0 % fuera de él. Es, por tanto, una pieza útil como componente determinista dentro de sistemas mayores, no como asistente conversacional. Conviene señalar que el nombre "1.3" no hace referencia al número de parámetros: el modelo tiene 8,1 M, no 1.300 M.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (RoPE, RMSNorm, SwiGLU, embeddings atados) |
| Parametros totales | 8.114.976 (8,1 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF disponible en el repositorio; niveles concretos no especificados por el autor (fp16/fp32 en safetensors) |
| Idiomas soportados | Inglés únicamente (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

Detalles adicionales reportados por el autor: 8 capas, hidden size 288, MLP 768, 6 cabezas de atención, tokenizador BPE byte-level con 512 entradas, temperatura recomendada 0 y `repeat_penalty 1.0`.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 8 capas con atención multi-cabeza de 6 cabezas, normalización RMSNorm, activación SwiGLU en el MLP y embeddings atados entre entrada y salida. La innovación técnica principal no está en el bloque transformer, sino en el tokenizador y en el formato de datos: se eliminaron todas las fusiones BPE que combinarían dígitos, de forma que `4728` se tokeniza siempre como `4 7 2 8`. Esto alinea la representación interna con el algoritmo que el modelo debe aprender y evita que el modelo memorice numerales completos como unidades opacas.

El dataset de entrenamiento consta de 800.000 problemas sintéticos (aproximadamente 45 M de tokens) con una composición del 14 % suma, 12 % resta, 22 % multiplicación, 14 % división, 12 % orden de operaciones, 6 % porcentajes, 18 % problemas de palabras y 2 % respuestas de identidad o fuera de tema. Cada paso de cada solución fue calculado por Python, y las soluciones se descomponen de modo que la única operación resuelta en una línea es sumar o restar un número con un solo dígito distinto de cero, multiplicar dos dígitos con ceros finales, o multiplicar/dividir por 10, 100 o 1000. El entrenamiento consistió en 9.000 pasos de unos 32K tokens (unas 6,5 pasadas sobre los datos), con AdamW, learning rate 1e-3 con decaimiento coseno y precisión bf16. No se reporta RLHF ni DPO: el ajuste es puramente de modelado de lenguaje supervisado sobre soluciones canónicas.

## Capacidades

- Suma y resta con números de hasta 4 dígitos, incluidos resultados negativos (con la salvedad documentada más abajo).
- Multiplicación en tres configuraciones: 4 dígitos × 1 dígito, 3 dígitos × 2 dígitos y 2 dígitos × 2 dígitos.
- División por 2 a 25, tanto exacta como con resto.
- Expresiones con dos operaciones, con y sin paréntesis, respetando el orden de operaciones.
- Porcentajes del tipo "15 % de 240" cuando el resultado es entero.
- Problemas de palabras sencillos en inglés: dar y recibir objetos, totales, agrupaciones, reparto, precios, diferencias, problemas de dos pasos y distancia = velocidad × tiempo.
- Acepta entrada simbólica (`*`, `x`, `×`, `/`, `÷`) o verbal ("plus", "times", "divided by").
- Formato de salida estructurado: toda solución termina en una línea `Answer: ...`, lo que facilita el parseo programático.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido. No mantiene conversación: ante preguntas ajenas responde brevemente que solo hace matemáticas.

## Casos de uso

- **Verificación aritmética dentro de un pipeline de agentes**: dado su tamaño (8,1 M de parámetros) y su formato de salida fijo, puede actuar como segundo modelo que recalcula totales, subtotales o conversiones producidos por un LLM grande, con un coste de inferencia despreciable y sin salir del rango de 4 dígitos.
- **Generación de soluciones paso a paso para aplicaciones educativas**: el modelo produce la descomposición completa de la operación (`45 + 38 = 45 + 30 + 8`, `45 + 30 = 75`, `75 + 8 = 83`), lo que permite mostrar el procedimiento al alumno en lugar de solo el resultado; encaja en apps de refuerzo de aritmética en inglés para educación primaria.
- **Generación de datos sintéticos de razonamiento**: con contexto de 1024 tokens y salidas de hasta 900 tokens nuevas, puede producir grandes volúmenes de cadenas de razonamiento aritmético para destilar o preentrenar modelos mayores, a un coste de cómputo mínimo.
- **Ejecución en dispositivo y en el borde**: al ocupar del orden de 16 MB en fp16, es viable en Raspberry Pi, móviles o navegador vía llama.cpp/GGUF, lo que permite ofrecer cálculo asistido sin conexión ni envío de datos a la nube.
- **Cálculo de totales en formularios y hojas de entrada sencillas**: líneas de pedido, albaranes o tickets con importes de hasta 4 dígitos donde se necesite suma, resta, multiplicación por cantidad y porcentajes enteros, con la salida `Answer:` parseable por el backend.
- **Línea base de investigación en modelos pequeños**: su configuración reproducible (9.000 pasos, 40 minutos en una RTX 3060 Ti, dataset sintético con semilla) lo convierte en un punto de partida controlado para estudiar memorización frente a generalización procedimental, ablaciones de tokenizador o efectos de la cuantización en tareas algorítmicas.
- **Test de infraestructura de despliegue**: por su huella mínima sirve como modelo de humo para validar pipelines de TGI, Ollama o llama.cpp antes de desplegar modelos mayores.

## Benchmarks y rendimiento

Evaluación del autor sobre un conjunto de test retenido de 420 problemas nuevos, con decodificación greedy en Ollama y sin solapamiento de números con el conjunto de entrenamiento.

| Tipo de problema | Aciertos | Precisión |
|---|---|---|
| Suma | 61 / 61 | 100 % |
| Resta | 60 / 61 | 98,4 % |
| Multiplicación | 61 / 61 | 100 % |
| División | 61 / 61 | 100 % |
| Orden de operaciones | 61 / 61 | 100 % |
| Porcentaje | 54 / 54 | 100 % |
| Problemas de palabras | 61 / 61 | 100 % |
| **Total (rango de entrenamiento)** | **419 / 420** | **99,8 %** |
| Fuera de rango: suma de 5 dígitos | 0 / 20 | 0 % |
| Fuera de rango: multiplicación 3 × 3 dígitos | 0 / 20 | 0 % |

Validación sobre datos retenidos del mismo estilo de entrenamiento: pérdida 0,0176 y precisión de token del 99,4 %.

Advertencia del propio autor: los problemas de test provienen del mismo generador que los de entrenamiento, solo con números distintos, por lo que la puntuación demuestra que el modelo aprendió el procedimiento para esa familia de problemas, no capacidad matemática general. No se han publicado resultados en benchmarks estándar (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 16 MB de pesos en fp16 y unos 32 MB en fp32 (cálculo a partir del recuento de parámetros; el autor no publica cifras). La caché KV es despreciable con 8 capas, 6 cabezas y 1024 tokens de contexto.
- En GGUF cuantizado a 8 bits serían del orden de 8-9 MB y a 4 bits del orden de 4-5 MB (estimación derivada del número de parámetros, no publicada por el autor).
- GPU recomendadas: ninguna en particular; el modelo se entrenó en una RTX 3060 Ti. Cabe en cualquier GPU consumer, en iGPU e incluso en CPU.
- Cabe en GPU consumer: sí, en todas, incluidas GTX 1050, RTX 3050, RTX 4090 y aceleradores integrados.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), Ollama con el Modelfile incluido en el repositorio, llama.cpp a través de los pesos GGUF, y TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`).
- Configuración de generación recomendada por el autor: `do_sample=False` (greedy), `max_new_tokens=900`, temperatura 0 y `repeat_penalty 1.0`. Un penalty de repetición rompe las soluciones porque los pasos repiten números de forma intencionada.
- Latencia y throughput: no disponibles. Como referencia de coste de cómputo, el entrenamiento completo requirió unos 40 minutos en una RTX 3060 Ti.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo ni sobre alternativas de la misma categoría (únicamente definiciones de diccionario del término "convergent").

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pico 1.3-Math | 8,1 M | 1024 | Aritmética paso a paso en inglés, entrenado desde cero | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Rango numérico estricto**: con números de 5 dígitos el modelo pierde una cifra y falla (0/20 en la evaluación). Con dos factores de 3 dígitos entra en bucle repitiendo la conmutatividad ("375 * 671 = 671 * 375") hasta agotar el límite de salida, porque ese caso nunca apareció en entrenamiento.
- **Error de signo documentado**: en 2163 − 2189 el modelo no detectó que el resultado es negativo y respondió 74 en lugar de −26.
- **Sin decimales, fracciones, potencias, raíces ni álgebra**: queda fuera del alcance del modelo.
- **Problemas de palabras limitados a los patrones entrenados**: cualquier otra redacción o situación fuera de esos patrones fallará con frecuencia.
- **Solo inglés**: el tokenizador tiene 512 entradas y no cubre otras lenguas. No hay soporte multilingüe, ni tan siquiera parcial.
- **No es conversacional**: ante preguntas ajenas a las matemáticas devuelve una respuesta corta indicando que solo hace matemáticas. No debe usarse como asistente general.
- **Riesgo de alucinación procedimental**: fuera del rango o del formato entrenado el modelo genera pasos con apariencia plausible pero incorrectos, sin señal de incertidumbre; en producción conviene validar la línea `Answer:` con un cálculo independiente.
- **Riesgo de sobreajuste al generador**: el test procede del mismo generador que el entrenamiento, por lo que el 99,8 % no es extrapolable a problemas reales con otras distribuciones.
- **Salidas largas**: cada solución escribe todos los pasos, lo que consume muchos tokens por consulta y puede acercarse al límite de 900 tokens nuevas en problemas de dos pasos.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías y con 0 descargas y 0 likes en el momento de la consulta, es decir, sin validación independiente por parte de la comunidad.
- **Nombre potencialmente confuso**: "Pico 1.3-Math" no indica 1.300 millones de parámetros; el modelo tiene 8,1 M. Conviene verificar el recuento antes de dimensionar infraestructura.

## Enlaces

- HuggingFace: https://huggingface.co/Convergent-ch/Pico-1.3-Math
- Resultados de la búsqueda web: no se encontraron enlaces relevantes al modelo, a su paper, a su repositorio de código ni a demos. Los únicos resultados devueltos fueron definiciones de diccionario del término francés "convergent" (Larousse, Le Robert, CNRTL, Linternaute), sin relación con el modelo.
