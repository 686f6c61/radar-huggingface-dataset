# ipetrukha/LFM2.5-350M-MLX-4bit

## Resumen

El modelo `ipetrukha/LFM2.5-350M-MLX-4bit` es una recuantización en 4 bits del modelo base `LiquidAI/LFM2.5-350M`, desarrollada por el usuario de HuggingFace `ipetrukha`. Se trata de un modelo compacto de 354 millones de parámetros con arquitectura híbrida (capas convolucionales y de atención) para procesamiento eficiente de contextos largos. El modelo original pertenece a LiquidAI.

Este checkpoint no añade una arquitectura nueva: reutiliza el modelo base y lo cuantiza con `mlx-lm 0.31.3` en modo afín de 4 bits, con tamaño de grupo 64 y sin sobreescrituras por capa. La diferencia frente a la versión oficial es que las escalas y sesgos de la cuantización se almacenan en `bfloat16` en lugar de `float32`, para permitir comparaciones entre motores bajo un mismo tipo de dato de activación. El archivo ocupa unos 0,2 GB y está pensado para Apple Silicon mediante MLX.

La model card indica inglés como idioma, aunque el modelo base se describe como multilingüe. No se dispone de datos sobre la longitud de contexto ni sobre la licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (capas convolucionales y de atención) |
| Parametros totales | 354.483.968 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (afín, tamaño de grupo 64, escalas y sesgos en bfloat16) |
| Idiomas soportados | Inglés (según la model card); el modelo base se describe como multilingüe |
| Licencia | no disponible |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es híbrida, combinando capas convolucionales y de atención. Esta combinación está diseñada para procesar contextos largos de forma eficiente, reduciendo el coste computacional asociado a la atención completa. No se ha proporcionado información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO.

La innovación de este checkpoint es puramente técnica: almacena las escalas y sesgos de la cuantización en `bfloat16`, en lugar de `float32` como la versión oficial de LiquidAI. Esto se ha publicado con el objetivo de permitir comparaciones entre motores de inferencia bajo un mismo tipo de dato de activación.

## Capacidades

- Generación de texto autoregresiva: al ser un modelo base, puede completar texto, pero no está alineado para seguir instrucciones.
- Procesamiento eficiente de contexto largo: la arquitectura híbrida del modelo base está diseñada para ello, aunque no se especifica la longitud exacta.
- Ejecución en Apple Silicon: el formato MLX permite inferencia local eficiente en dispositivos con chip M1/M2/M3.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: la model card indica inglés; el modelo base se describe como multilingüe, pero no hay evidencia en este repositorio.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado de aplicaciones de texto en Apple Silicon: al ser un modelo de 0,2 GB en formato MLX, se puede ejecutar en un MacBook con memoria unificada para probar ideas de generación de texto sin necesidad de GPU dedicada.
- Investigación en cuantización: este checkpoint permite estudiar el efecto de almacenar las escalas y sesgos en `bfloat16` frente a `float32`, comparando la calidad de salida y el rendimiento entre motores.
- Benchmarking de motores de inferencia: al publicar una variante con un tipo de dato de activación específico, facilita comparaciones controladas entre MLX y otros frameworks (por ejemplo, llama.cpp tras conversión a GGUF).
- Fine-tuning ligero para tareas de clasificación o extracción de entidades: su tamaño de 354M permite ajustar el modelo en datasets pequeños con coste computacional reducido, siempre que se parta de un modelo base.
- Educación sobre arquitecturas híbridas: el modelo sirve como ejemplo práctico para analizar cómo se combinan capas convolucionales y de atención en un modelo compacto.
- Despliegue en entornos con recursos limitados: su peso reducido posibilita su ejecución en dispositivos edge, previa conversión a un formato compatible con el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint cuantizado ocupa unos 0,2 GB; la memoria total de inferencia dependerá del framework y de la longitud del contexto. En Apple Silicon se usa memoria unificada, no VRAM dedicada.
- GPU recomendadas: Apple Silicon (M1, M2, M3) para MLX; no se requiere GPU dedicada.
- ¿Cabe en GPU de consumo? Sí, cualquier GPU con al menos 1 GB de VRAM podría ejecutarlo tras convertir los pesos a un formato compatible (por ejemplo, GGUF), aunque el formato MLX está optimizado para Apple Silicon.
- Opciones de despliegue: `mlx-lm` (Apple Silicon); conversión a GGUF para `llama.cpp` u `Ollama` no documentada en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| ipetrukha/LFM2.5-350M-MLX-4bit | 354 M | no disponible | no disponible | MLX 4-bit (escalas y sesgos en bfloat16) |
| LiquidAI/LFM2.5-350M-MLX-4bit | 354 M | no disponible | no disponible | MLX 4-bit (escalas y sesgos en float32) |
| LiquidAI/LFM2.5-350M | 354 M | no disponible | no disponible | Safetensors (16 bits) |

No se han publicado benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- Modelo base: no está alineado para seguir instrucciones; puede producir texto sin control y requiere prompt engineering o fine-tuning para tareas concretas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Idioma: la model card indica inglés; el modelo base se describe como multilingüe, pero no hay verificación en este repositorio.
- Cuantización 4-bit: puede degradar la calidad de las salidas en comparación con el modelo en 16 bits.
- Recuantización no oficial: las escalas y sesgos en `bfloat16` pueden provocar diferencias numéricas frente a la versión oficial de LiquidAI.
- Sin datos sobre sesgos o alucinación: no se han publicado evaluaciones de seguridad o sesgos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ipetrukha/LFM2.5-350M-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Versión oficial MLX: https://huggingface.co/LiquidAI/LFM2.5-350M-MLX-4bit
- No se han encontrado papers o blogs adicionales en la búsqueda web.
