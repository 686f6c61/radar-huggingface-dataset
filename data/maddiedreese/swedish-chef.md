# maddiedreese/swedish-chef

## Resumen

Swedish Chef LM es un modelo de lenguaje conversacional de tipo decoder-only, extremadamente pequeño, entrenado desde cero por Maddie D. Reese como proyecto de investigación no oficial inspirado en el personaje de los Muppets. El modelo responde a instrucciones cortas en inglés con frases en un pseudo-sueco humorístico y siempre termina con la coletilla `Børk børk børk`. No está afiliado a Disney, The Muppets ni a The Jim Henson Company.

Con solo 1,35 millones de parámetros, cuatro capas decoder causales y una ventana de contexto de 256 tokens, el modelo es un ejemplo de entrenamiento desde cero con datos sintéticos. Su corpus de 68.000 ejemplos cubre 24 intenciones conversacionales controladas. Aunque los resultados de evaluación interna son altos (100% de relevancia de intención y cierre exacto), el modelo es intencionadamente limitado y no posee conocimiento general del inglés ni capacidades de razonamiento. Su interés radica en ser una demostración técnica de entrenamiento ligero y en su carácter lúdico, no en su utilidad práctica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer causal |
| Parametros totales | 1.354.560 (entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16, sin cuantizaciones publicadas) |
| Idiomas soportados | en, fr, de, es, it (con predominio del inglés; los demás aparecen ocasionalmente) |
| Licencia | other (no especificada; uso no comercial probable por derechos de terceros) |
| Formato de pesos | safetensors (cargado vía MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de cuatro capas con ancho de 160 dimensiones, cinco cabezas de atención y MLP de 640 unidades. Usa un tokenizer BPE a nivel de byte de 512 tokens entrenado desde cero. La inicialización es aleatoria, sin pesos preentrenados. Se entrenó durante 5.000 pasos con 13,2 millones de tokens muestreados (excluyendo padding), y el mejor checkpoint se obtuvo en el paso 4.250. El corpus de entrenamiento consta de 68.000 ejemplos, abrumadoramente sintéticos y originales, con solo cuatro observaciones canónicas de diálogo etiquetadas por fuente. Cubre 24 intenciones conversacionales controladas. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento supervisado.

## Capacidades

- Generación de texto conversacional en estilo "Swedish Chef" (pseudo-sueco humorístico) a partir de instrucciones cortas en inglés.
- Cierre sistemático de todas las respuestas con la frase exacta `Børk børk børk`.
- Soporte de 24 intenciones conversacionales predefinidas (saludos, preguntas simples, respuestas a comandos básicos).
- A temperatura 0,6, puede producir ocasionalmente frases con sentido en francés, alemán, español o italiano, aunque no de forma fiable.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, visión, audio ni modo de pensamiento explícito.
- El conocimiento general del inglés es prácticamente nulo; el modelo solo opera dentro del dominio estrecho del corpus.

## Casos de uso

- Demostración educativa de entrenamiento desde cero: sirve para ilustrar el pipeline completo de creación de un modelo de lenguaje pequeño (tokenizer, arquitectura, entrenamiento, evaluación) sin necesidad de recursos computacionales elevados.
- Proyecto de entretenimiento y humor: integración en chatbots o asistentes de voz con fines lúdicos, donde la respuesta esperada es una frase cómica en pseudo-sueco.
- Prueba de concepto de generación de datos sintéticos: muestra cómo un corpus generado artificialmente puede entrenar un modelo con alta precisión en un dominio muy restringido.
- Benchmark de evaluación conductual: el modelo incluye un conjunto de 192 muestras held-out con 24 intents, útil para practicar metodologías de evaluación de modelos pequeños.
- Ejemplo de despliegue ligero en CPU: al ser minúsculo, puede ejecutarse en cualquier máquina sin GPU, lo que lo hace adecuado para talleres de introducción a la IA generativa.
- Investigación sobre interpolación vs. generalización: los altos resultados en muestras held-out demuestran interpolación dentro del dominio, no comprensión general, lo que sirve para discutir límites de la evaluación en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta métricas internas sobre 192 muestras held-out deterministas que abarcan 24 intenciones:

| Metrica | Resultado |
|---|---|
| Relevancia de intencion | 100% |
| Cierre exacto con `Børk børk børk` | 100% |
| Completado limpio | 100% |
| Perplejidad en test | 1,1688 |

Estas métricas miden la interpolación dentro del dominio estrecho del corpus, no capacidades generales de lenguaje.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en fp32 (1,35 M de parámetros). Cabe en cualquier GPU, incluso integradas.
- GPU recomendadas: ninguna específica; el modelo se ejecuta en CPU sin problemas.
- Compatible con hardware de consumo: sí, cualquier ordenador con Python 3 y PyTorch.
- Opciones de despliegue: el paquete incluye un runtime autocontenido basado en PyTorch en CPU, con comando `swedish-chef` para chat interactivo o respuesta de una sola vez. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles, pero por el tamaño del modelo se espera una latencia de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría (modelos de 1,3 M de parámetros entrenados desde cero con fines humorísticos). Los modelos pequeños más conocidos (TinyStories, SmolLM) tienen decenas o cientos de millones de parámetros y objetivos de investigación distintos. La comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no es un traductor de sueco ni produce sueco real; solo genera un pseudo-sueco humorístico basado en el personaje de los Muppets.
- No posee conocimiento general del inglés ni de otros idiomas; su dominio se limita a las 24 intenciones del corpus.
- Alto riesgo de alucinación si se le piden tareas fuera de su dominio (razonamiento, hechos, código, etc.).
- La licencia es "other" y no se especifica; al estar basado en una propiedad intelectual de terceros (The Muppets, Disney), el uso comercial probablemente no esté permitido.
- Los resultados de evaluación (100%) miden interpolación en un dominio muy estrecho, no generalización; no debe interpretarse como un modelo robusto.
- El contexto de 256 tokens es muy limitado, lo que impide conversaciones largas o manejo de información extensa.
- No se han publicado análisis de sesgos ni pruebas de seguridad; al ser un modelo de juguete, no se recomienda su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maddiedreese/swedish-chef
- Perfil de la autora en Hugging Face: https://huggingface.co/maddiedreese
- Sitio web de la autora: https://www.maddiedreese.com/
- Perfil de GitHub: https://github.com/maddiedreese/maddiedreese
