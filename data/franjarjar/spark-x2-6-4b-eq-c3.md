# Franjarjar/Spark-X2.6-4B-EQ-C3

## Resumen

Spark-X2.6-4B-EQ-C3 es una cuantización del modelo base XHToken/Spark-X2.6-4B, publicada por el usuario Franjarjar. No se trata de un modelo nuevo, sino de una conversión de los pesos originales a EQ (LaneQuant), el formato de cuantización nativo del motor de inferencia Espetero, desarrollado específicamente para Apple Silicon y Metal. El objetivo es doble: reducir el peso en disco y, sobre todo, preservar la fidelidad de la distribución de salida respecto al modelo BF16 original mejor que otras cuantizaciones de tamaño comparable.

El resultado ocupa 2,7 GB en disco, con un promedio de 5,21 bits por peso sobre los parámetros de texto del modelo base. Según la model card, esta cuantización logra una divergencia KL media de 0,0255 y un 93,8 % de coincidencia top-1 frente al modelo BF16, superando de forma clara a MLX 4-bit (KLD 0,2376, top-1 82,5 %) y al Q4_K_M oficial (KLD 0,0707, top-1 90,2 %) en las mismas ventanas de referencia.

La relevancia de esta ficha es acotada pero concreta: es un artefacto pensado exclusivamente para ejecutarse con Espetero 0.2.0 o superior en cualquier Mac con Apple Silicon y al menos 8 GB de memoria. No es cargable por llama.cpp, MLX ni transformers, lo que limita su uso a ese ecosistema. El modelo base declara 4B en el nombre, pero el recuento real de safetensors del repositorio es de 1.122.000.704 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base XHToken/Spark-X2.6-4B; cuantización EQ/LaneQuant) |
| Parametros totales | 1.122.000.704 (recuento real de safetensors del repo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (la model card menciona evaluaciones de 4K a 256K tokens sin especificar el máximo oficial) |
| Tipos de cuantizacion | EQ (LaneQuant): codebook de 4 bits, códigos de 5 y 6 bits, escala firmada de 8 bits por cada 16 entradas y escala fp16 por cada 256; capas 0-3 en 6 bits, capas 4-7 y proyecciones q/k/v y de salida de atención en 5 bits, resto en 4 bits; embedding/LM head atado en MLX affine 6 bits; puertas de salida de atención en BF16; media de 5,21 bits por peso |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato propietario EQ (solo cargable por Espetero) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base XHToken/Spark-X2.6-4B en la documentación proporcionada: ni tipo de transformer, ni composición del dataset, ni si hubo RLHF o DPO. La model card de esta cuantización no describe el entrenamiento del modelo original, solo el proceso de conversión.

El proceso de cuantización sí está documentado. Se realizó con `espetero quantize` de Espetero 0.2.0 (commit `616c21a`) más un parche al código fuente de Spark (commit `d84aa84`), en 27 minutos sobre una M1 Max con BLAS monohebra y un pico de 3 GB de memoria. La calibración se capturó con `espetero quantize --calib-only` a partir del forward en BF16 del modelo, usando 120.832 tokens del conjunto de calibración por defecto (calibration_v5 de mlx-lm). Las reglas de asignación de bits por capa están en el fichero `rules.txt` del repositorio. La innovación técnica principal es el propio formato EQ: elige los 16 inputs de cada escala de forma que cada lane de los kernels matriciales del GPU de Apple necesite una única escala por paso, lo que permite decodificación rápida en Metal sin sacrificar tanta fidelidad como las cuantizaciones genéricas.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base, sin datos específicos publicados sobre su desempeño en tareas concretas.
- Capacidades de código: la evaluación de fidelidad incluye 31 ventanas de código, lo que sugiere que el modelo base maneja código, aunque no se publican métricas de HumanEval ni similares.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, visión o audio: no disponible.
- Servicio compatible con clientes OpenAI, Anthropic y Ollama a través de `espetero serve`, lo que permite integrarlo en herramientas que ya hablan esos protocolos.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el caso principal. Cualquier Mac con 8 GB o más puede ejecutar el modelo con `espetero serve --model Franjarjar/Spark-X2.6-4B-EQ-C3` y abrir la interfaz en `http://127.0.0.1:8080`. Adecuado para prototipado y uso personal sin GPU dedicada.
- Asistente de código en el editor: gracias a la integración con clientes OpenAI y Ollama, se puede apuntar un plugin de autocompletado o chat a Espetero. El tamaño de 2,7 GB y la decodificación de 83-99 tok/s en M1 Max lo hacen viable para respuesta interactiva.
- Sustitución de un endpoint en la nube en pipelines internos: al exponer una API compatible con OpenAI, se puede redirigir tráfico de pruebas o desarrollo a la máquina local, reduciendo coste y evitando enviar datos a terceros.
- Evaluación de cuantizaciones: este fichero sirve como referencia para quien quiera comparar la fidelidad de EQ frente a MLX 4-bit o Q4_K_M sobre el mismo modelo base, usando el protocolo de KLD descrito en la model card.
- Procesamiento por lotes de documentos en local: con contexto evaluado hasta 256K tokens, es apto para resumir o extraer información de documentos largos en una máquina de sobremesa con memoria unificada amplia (M4 Max con 128 GB en las pruebas del autor).
- Desarrollo de aplicaciones Metal: sirve como banco de pruebas para el motor Espetero y su formato EQ, por ejemplo para medir throughput de prefill y decodificación en distintos contextos (4K a 256K) según la comparativa del paper citado.

## Benchmarks y rendimiento

| Fichero | Medido con | Bits/peso | KLD media | KLD mediana | KLD p99 | Top-1 | Decode M1 Max (tok/s) |
|---|---|---|---|---|---|---|---|
| Este fichero (c3) | Espetero 616c21a | 5,21 | 0,0255 | 0,00823 | 0,2441 | 93,8 % | 83 |
| MLX 4-bit | Espetero 616c21a | 4,50 | 0,2376 | 0,0842 | 2,4942 | 82,5 % | 99 |
| Q4_K_M (oficial) | dequantizado, fp32 | 6,19 | 0,0707 | 0,0204 | 0,7239 | 90,2 % | No disponible |

Comparación pareada sobre las mismas ventanas (bootstrap por ventanas, 62 ventanas de 2048 tokens, 31 de WikiText-2 test y 31 de código, primeros 64 tokens de cada una no puntuados):

- Frente a MLX 4-bit, ambos con Espetero: KLD -89,3 % (intervalo del 95 %: -90,9 % a -87,7 %; inferior en el 100 % de las 62 ventanas).
- Frente al Q4_K_M oficial dequantizado: KLD -63,9 % (intervalo del 95 %: -66,7 % a -60,7 %; inferior en el 100 % de las 62 ventanas).

La decodificación se midió con una secuencia, contexto de 128 tokens, `bench_native --quick --batch 1`, ficheros intercalados en sesiones exclusivas por Mac (M4 Max: Mac Studio de 128 GB; M1 Max: MacBook Pro de 64 GB). No se publica la cifra de decodificación en M4 Max para este fichero. Según la model card, frente a mlx-lm y llama.cpp, Espetero con este fichero decodifica y hace prefill más rápido en todos los contextos de 4K a 256K tokens.

## Requisitos de hardware

- VRAM/memoria unificada: 2,7 GB en disco; el autor indica que funciona en cualquier Mac con Apple Silicon y 8 GB de memoria o más.
- GPU: exclusivamente Apple Silicon (Metal). No hay soporte para GPU NVIDIA, AMD ni CPU x86.
- Cabe en GPU de consumo de Apple: sí, en cualquier M1/M2/M3/M4, incluidos modelos base con 8 GB.
- Despliegue: solo Espetero 0.2.0 o superior (`brew install JarJarFran/espetero/espetero`). No es cargable por vLLM, llama.cpp, Ollama, TGI, MLX ni transformers; Ollama solo puede usarse como cliente de la API de Espetero, no como motor.
- Latencia y throughput: 83 tok/s de decodificación en M1 Max (MacBook Pro, 64 GB) con contexto de 128 tokens; 99 tok/s para MLX 4-bit en el mismo equipo y condiciones. No se publica la cifra de M4 Max para este fichero. El prefill no se cuantifica numéricamente en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Bits/peso | KLD media | Top-1 | Licencia | Motor |
|---|---|---|---|---|---|---|
| Spark-X2.6-4B-EQ-C3 (este) | 1.122.000.704 | 5,21 | 0,0255 | 93,8 % | Apache 2.0 | Espetero |
| Spark-X2.6-4B MLX 4-bit | No disponible | 4,50 | 0,2376 | 82,5 % | Apache 2.0 (presumible, no confirmado) | Espetero / MLX |
| Spark-X2.6-4B Q4_K_M oficial | No disponible | 6,19 | 0,0707 | 90,2 % | Apache 2.0 (presumible, no confirmado) | llama.cpp (no ejecutable en Espetero) |

La comparativa se limita a variantes del mismo modelo base porque no se han proporcionado datos de modelos de otros autores con los que contrastar. La ventaja de este fichero es la fidelidad por bit: con 5,21 bits por peso supera al Q4_K_M de 6,19 bits y queda muy por encima del MLX 4-bit de 4,50 bits en coincidencia top-1 y divergencia KL.

## Limitaciones y advertencias

- Dependencia total del motor Espetero: los pesos en formato EQ no se pueden cargar con llama.cpp, MLX, transformers ni ninguna otra herramienta estándar. Esto ata el modelo a una única implementación mantenida por un solo desarrollador.
- Plataforma restringida a Apple Silicon con Metal; no hay versión para CUDA, ROCm ni CPU.
- El nombre del repositorio indica "4B", pero el recuento real de safetensors es de 1.122.000.704 parámetros; conviene no asumir el tamaño por el nombre.
- No se declaran idiomas soportados ni se publican evaluaciones de calidad en tareas estándar (MMLU, HumanEval, GSM8K); las únicas métricas son de fidelidad respecto al BF16, no de capacidad absoluta.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser una cuantización, hereda los del modelo base, que tampoco se describen.
- La cuantización introduce degradación respecto al BF16 (KLD media 0,0255, top-1 93,8 %); para tareas sensibles a la fidelidad exacta de la distribución conviene usar el modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-05): no hay evidencia de uso en producción ni validación independiente.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y el motor tienen implicaciones propias: Espetero es MIT, y cualquier restricción del modelo base XHToken/Spark-X2.6-4B se hereda.
- Los resultados de rendimiento provienen del propio autor y de su motor; no se han replicado de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Franjarjar/Spark-X2.6-4B-EQ-C3
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Motor Espetero: https://github.com/JarJarFran/espetero
- Documentación del formato EQ: https://github.com/JarJarFran/espetero/blob/main/docs/eq.md
- Instalación de Espetero: https://github.com/JarJarFran/espetero (instalación vía `brew install JarJarFran/espetero/espetero`)
