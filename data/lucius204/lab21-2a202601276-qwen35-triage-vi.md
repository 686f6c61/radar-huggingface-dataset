# lucius204/lab21-2A202601276-qwen35-triage-vi

## Resumen

El modelo `lucius204/lab21-2A202601276-qwen35-triage-vi` es un adaptador LoRA (PEFT) desarrollado por el usuario lucius204, entrenado sobre el modelo base `unsloth/Qwen3.5-4B` de la serie Qwen3.5. Su propósito es convertir tickets de soporte al cliente en vietnamita en un JSON de triage con cuatro campos: `intent`, `urgency`, `product` y `sentiment`. Se trata de una tarea de clasificación y extracción de información estructurada, pensada para sistemas de atención al cliente automatizados.

El adaptador se entrenó mediante fine-tuning supervisado (SFT) con un conjunto de datos muy reducido (225 muestras) y presenta un rendimiento alto en la tarea objetivo (0.975 de precisión sobre 50 muestras de prueba), pero sufre un olvido catastrófico severo: la capacidad general cae 0.236 puntos, superando ampliamente la tolerancia permitida de 0.020. Por ello, el autor desaconseja su despliegue en producción sin antes mezclar datos generales en el entrenamiento.

La arquitectura subyacente es un transformer decoder de 4 mil millones de parámetros (Qwen3.5-4B), aunque no se especifican detalles adicionales como la longitud de contexto o el número exacto de parámetros del adaptador. El repositorio ocupa 0.1 GB y contiene únicamente los pesos del adaptador en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (transformer decoder) |
| Parametros totales | No disponible (el adaptador usa r=16, alpha=32; el base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en fp16, safetensors) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `unsloth/Qwen3.5-4B`, un transformer decoder de 4 mil millones de parámetros de la familia Qwen3.5. La técnica empleada es LoRA con rango 16 y alpha 32, aplicada a todas las capas lineales del decoder de texto (`text-linear`). El entrenamiento se realizó con una tasa de aprendizaje de 1e-4 (aproximadamente 10 veces la escala de un fine-tuning completo), durante 2 épocas, lo que equivale a 30 pasos de optimizador. Se usó precisión fp16 (la GPU T4 no soporta bf16 nativo) y una máscara de entrenamiento `assistant-only` con una fracción supervisada de 0.4149.

El conjunto de entrenamiento consta de 225 muestras exclusivamente de JSON triage, sin datos generales, lo que explica el olvido catastrófico observado. No se aplicaron técnicas de RLHF ni DPO. El autor documenta tres ejecuciones de control (`attn_only`, `wrong_lr`, `qlora`) en el informe `submission/REPORT.md`, aunque no se proporcionan sus resultados numéricos en la información disponible.

## Capacidades

- Generación de texto en vietnamita, especializada en la clasificación de tickets de soporte al cliente.
- Extracción de cuatro campos estructurados en JSON: `intent`, `urgency`, `product` y `sentiment`.
- Salida con formato JSON estricto (precisión de formato 1.000 en las pruebas).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo base podría ser multilingüe, pero el adaptador está entrenado únicamente para vietnamita.

## Casos de uso

- Atención al cliente automatizada: el adaptador puede procesar tickets entrantes en vietnamita y generar un JSON con la intención, urgencia, producto y sentimiento, permitiendo priorizar y enrutar automáticamente las solicitudes.
- Enrutamiento de tickets en sistemas de soporte: la salida JSON permite asignar cada ticket al departamento adecuado según el campo `intent` y establecer la prioridad según `urgency`.
- Análisis de sentimiento en tiempo real: el campo `sentiment` puede alimentar paneles de control para monitorizar la satisfacción del cliente.
- Preprocesamiento para chatbots: el JSON generado puede servir como entrada para un sistema de respuesta automática, reduciendo la carga de los agentes humanos.
- Integración con plataformas de ticketing (Zendesk, Freshdesk, etc.): mediante una API que reciba el texto del ticket y devuelva el JSON de triage.
- Evaluación de calidad del soporte: el análisis de sentimiento y urgencia agregado puede utilizarse para detectar picos de insatisfacción o problemas recurrentes con un producto.

## Benchmarks y rendimiento

El autor reporta mediciones propias sobre un conjunto de evaluación congelado de 50 muestras objetivo (triage) y 15 muestras de regresión (capacidad general). No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Run | target | regression | format | latencia (ms) |
|---|---|---|---|---|
| (a) base + prompt naive | 0.000 | 0.758 | 0.000 | 3123.5 |
| (b) base + prompt optimizado | 0.765 | 0.758 | 1.000 | 995.6 |
| (c) LoRA fine-tune (este adaptador) | 0.975 | 0.522 | 1.000 | 1430.7 |

El juicio del portón de regresión es **FAILED**: la capacidad general cae 0.236 puntos frente al baseline (b), superando la tolerancia de 0.020. Esto indica un olvido catastrófico severo, atribuible al conjunto de entrenamiento exclusivamente compuesto por JSON triage.

## Requisitos de hardware

- El adaptador LoRA ocupa solo 0.1 GB, pero requiere cargar el modelo base de 4B parámetros.
- En fp16, el modelo base necesita aproximadamente 8 GB de VRAM, más overhead de activaciones y contexto. Una GPU con 12-16 GB es suficiente (por ejemplo, T4, RTX 3060/3070, A10).
- El autor entrenó en una Tesla T4 (16 GB) de Colab Free, lo que confirma que el entrenamiento es viable en hardware de gama media.
- Con cuantización (por ejemplo, GGUF de 4 bits), el modelo base podría caber en GPUs de 6-8 GB, aunque no se han publicado datos específicos.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `PeftModel` en Transformers, o exportar a GGUF para usar con llama.cpp u Ollama. También es compatible con vLLM y TGI si se fusiona el adaptador con el base.
- Latencia medida: 1430.7 ms por muestra en T4 (sin especificar tamaño de entrada), frente a 995.6 ms del base con prompt optimizado.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA comparables para la misma tarea. El único dato disponible es el del propio autor, que compara el adaptador con el modelo base sin fine-tuning (runs a y b), ya presentado en la sección de benchmarks. No se han encontrado adaptadores equivalentes en la búsqueda web, salvo otro trabajo del mismo laboratorio (`vudanghuy/lab21-2A202601761-qwen35-triage-vi`), del que no se tienen especificaciones.

## Limitaciones y advertencias

- **Olvido catastrófico**: la capacidad general cae 0.236 puntos, muy por encima de la tolerancia de 0.020. El adaptador no es recomendable para producción en su estado actual.
- **Conjunto de entrenamiento muy pequeño**: solo 225 muestras, todas de JSON triage, sin datos generales. Esto limita la generalización y aumenta el riesgo de sobreajuste.
- **Idioma restringido**: el adaptador solo está entrenado para vietnamita; no se garantiza un comportamiento correcto en otros idiomas.
- **Riesgo de alucinación**: en entradas que no se asemejen a tickets típicos, el modelo podría generar campos JSON incorrectos o inventados.
- **Licencia no disponible**: no se especifica la licencia del adaptador, lo que puede generar incertidumbre legal para uso comercial. La licencia del modelo base tampoco se indica en la información proporcionada.
- **Latencia elevada**: 1430.7 ms por muestra en T4, superior al baseline con prompt optimizado (995.6 ms), lo que puede ser un inconveniente en aplicaciones de tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucius204/lab21-2A202601276-qwen35-triage-vi
- Blog oficial de Qwen sobre Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Adaptador similar del mismo laboratorio: https://huggingface.co/vudanghuy/lab21-2A202601761-qwen35-triage-vi
