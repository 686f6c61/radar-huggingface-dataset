# Cialtion/SimpleTool-Qwen3.5-0.8B-8Head-5pct-INT4

## Resumen

SimpleTool-Qwen3.5-0.8B-8Head-5pct-INT4 es un modelo derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario Cialtion, especializado en tool calling (function calling) mediante una arquitectura de múltiples cabezas ("eight-head"). En lugar de generar la llamada a función como texto libre, el modelo divide la salida en ocho ramas lógicas independientes: `content`, `function` y `arg1` a `arg6`. Esto permite emitir la función seleccionada y sus argumentos de forma estructurada y con tipado estricto.

El checkpoint es un modelo fusionado (merged), entrenado con un schedule de datos al 5% sobre el dataset Cialtion/SimpleTool-Diagnostic-800, y cuantizado en INT4 mediante AWQ en serialización afín RTN con group-size 64 y sin calibración de activaciones. No requiere un LoRA externo. Con 873.438.784 parámetros reales (según safetensors) y un repositorio de 1,0 GB, está pensado para entornos con recursos limitados.

Su relevancia es acotada y experimental: se trata de una prueba de concepto de decodificación estructurada por cabezas para tool calling en un modelo pequeño, con métricas de diagnóstico internas (no benchmarks externos) y sin descargas ni validación comunitaria en el momento de la ficha. Es útil para quien quiera estudiar enfoques de salida estructurada, no como modelo de producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5, con ocho cabezas lógicas de salida (`content`, `function`, `arg1`–`arg6`) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (afín RTN, group-size 64, serialización AWQ, sin calibración de activaciones); FP8 E4M3 donde esté configurado; tensores retenidos en BF16 |
| Idiomas soportados | no disponible (el benchmark interno cubre chino e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4-bit, AWQ) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se entrena con un esquema de ocho cabezas: una para `content`, una para `function` y seis para argumentos (`arg1`–`arg6`). Las ramas de argumentos son independientes entre sí y no se condicionan al resultado de la función recién generada, lo que implica que el esquema de la función candidata debe conocerse de antemano. El modelo incluye filas de tokens especiales entrenadas y su propio tokenizer; `<|null|>` marca argumentos omitidos o no usados, y las cabezas de argumentos sobrantes al final se ignoran.

El entrenamiento se realizó con el "5% data schedule" sobre el dataset Cialtion/SimpleTool-Diagnostic-800, un conjunto sintético congelado de 800 casos de llamada única (400 en chino, 400 en inglés), dividido en cuatro lotes de 200. No se documentan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO. La cuantización INT4 emplea cuantización afín RTN con group-size 64 en serialización AWQ sin calibración de activaciones; el autor advierte explícitamente de no transferir puntuaciones entre precisiones almacenadas.

## Capacidades

- Generación de llamadas a función estructuradas: selección de función y emisión de argumentos en JSON con tipado estricto.
- Salida desacoplada de contenido (`content`) y de llamada (`function` + argumentos), con hasta seis argumentos por llamada.
- Soporte de llamadas de un solo paso (single-call); no se documenta razonamiento multi-paso ni agentes.
- Capacidad multilingüe limitada a lo observado en el benchmark interno: chino e inglés.
- Marcado de argumentos omitidos mediante el token especial `<|null|>`.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo "thinking".
- No se documenta soporte de tool calling genérico más allá del esquema de cabezas descrito.

## Casos de uso

- Extracción de parámetros estructurados en pipelines de datos: dado un esquema de función fijo y un texto de entrada, el modelo emite la función y sus argumentos en JSON tipado, lo que simplifica la validación posterior en sistemas de ingestión.
- Enrutamiento de intenciones en asistentes conversacionales: con un catálogo reducido de funciones y aridad máxima conocida, el modelo selecciona la función adecuada y rellena los argumentos, útil en prototipos de bajo coste.
- Pruebas de concepto de decodificación estructurada: sirve como banco de pruebas para investigar si las cabezas dedicadas por argumento reducen errores de formato frente a la generación de texto libre.
- Automatización de formularios y comandos: mapear lenguaje natural a llamadas de API con argumentos tipados en entornos donde el esquema es estable y se conoce de antemano.
- Evaluación comparativa de técnicas de cuantización: al publicarse en INT4 y con métricas separadas por precisión, permite estudiar la degradación de exactitud entre INT4 y FP16 en una tarea concreta.
- Docencia y experimentación con modelos pequeños: su tamaño (menos de 900 M de parámetros y 1 GB de repositorio) permite ejecutarlo en hardware modesto para demostrar técnicas de tool calling estructurado.
- Filtrado y clasificación de consultas con salida tipada: usar la rama `function` como clasificador de intención y las ramas de argumentos para extraer entidades acotadas.

## Benchmarks y rendimiento

El autor publica resultados de diagnóstico internos sobre 800 casos sintéticos congelados (400 en chino, 400 en inglés). No son benchmarks externos ni afirmaciones de producción.

| Métrica | Resultado (INT4/FP16) |
|---|---|
| cf-zh (llamada completa, chino) | 112/200 |
| cf-en (llamada completa, inglés) | 113/200 |
| hard | 52/200 |
| multiarg | 24/200 |
| full call (llamada completa total) | 301/800 |
| function (acierto de función) | 733/800 |

La exactitud de "full call" exige que coincidan la función y todos los argumentos requeridos con JSON tipado estricto; la exactitud de función se reporta por separado. El campo `content` no se genera ni se puntúa en la evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB en INT4; en FP16/BF16 un modelo de ~873 M de parámetros requiere aproximadamente 1,7–2 GB solo para pesos, más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para INT4 (por ejemplo, GTX 1650, RTX 3050, RTX 4060); para FP16, GPUs con 6–8 GB o superiores (RTX 3060, RTX 4060 Ti).
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más en INT4.
- Opciones de despliegue: al ser un checkpoint con cabezas personalizadas y tokenizer propio, requiere el código de inferencia específico del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La serialización AWQ sugiere soporte potencial en stacks AWQ, pero no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Qwen3.5-0.8B-8Head-5pct-INT4 | 873 M | no disponible | Tool calling con 8 cabezas, INT4 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Modelo generalista | no disponible en la información | Hugging Face |
| Otros modelos pequeños de tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks externos ni de alternativas comparables documentadas en la información proporcionada.

## Limitaciones y advertencias

- Métricas de diagnóstico internas: los resultados proceden de un conjunto sintético congelado del propio autor, no de benchmarks externos; no deben interpretarse como rendimiento en producción.
- Exactitud baja en llamadas completas: 301/800 en el total y 24/200 en el caso multiarg, lo que limita su uso en escenarios con varios argumentos.
- Dependencia del esquema: el modelo requiere conocer de antemano la función candidata y su aridad máxima, con las propiedades requeridas primero y en el mismo orden en `properties`, `required` y los slots de argumentos.
- Ramas de argumentos independientes: no se condicionan al resultado de la función, lo que puede producir argumentos incoherentes con la función elegida.
- Idiomas: solo se documentan chino e inglés en el benchmark; el resto de idiomas no está evaluado.
- Riesgo de alucinación en argumentos: al ser un modelo de 0,8 B, la generación de valores de argumentos puede ser inexacta; se recomienda validación estricta posterior.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no ha sido validado externamente.
- Cuantización: no se deben transferir puntuaciones entre precisiones almacenadas; el INT4 usa RTN sin calibración de activaciones, lo que puede degradar la exactitud frente a FP16.
- Sin soporte documentado de agentes, multi-step reasoning ni tool calling genérico más allá del esquema de cabezas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-0.8B-8Head-5pct-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de diagnóstico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
