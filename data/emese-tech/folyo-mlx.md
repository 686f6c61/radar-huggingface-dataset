# emese-tech/folyo-mlx

## Resumen

emese-tech/folyo-mlx es un modelo de lenguaje instructivo de 22,6 mil millones de parámetros, desarrollado por el equipo emese-tech y ajustado específicamente para el húngaro. Se trata de una versión cuantizada en q8 mediante la librería MLX de Apple, pensada para ejecutarse en Apple Silicon, del modelo Emese-Folyó, que a su vez parte del modelo multilingüe EuroLLM-22B. La arquitectura subyacente es un transformer de la familia Llama/EuroLLM con una longitud de contexto de 32.768 tokens.

El modelo cubre la necesidad de disponer de un generador de texto conversacional húngaro de alta calidad que pueda ejecutarse localmente en ordenadores Mac, sin depender de servicios en la nube. Su relevancia técnica radica en que el proceso de entrenamiento (CPT, SFT y DPO) se realizó directamente sobre el modelo cuantizado en q8, de modo que este artefacto MLX es la precisión nativa del modelo y no una conversión posterior. Así, el repositorio en formato bf16 es en realidad una des-cuantización de este, y no al revés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como Llama/EuroLLM) |
| Parametros totales | 22.637.328.384 (22,6 mil millones) |
| Parametros activos | No aplicable (no es un modelo mixto de expertos) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | MLX q8 (8 bits, grupo 64); el modelo base en bf16 está disponible en el repositorio folyo/ |
| Idiomas soportados | Húngaro (hu); el base EuroLLM es multilingüe, pero el ajuste está enfocado al húngaro |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors cuantizados MLX (uint32 con escalas/bias por grupo) |

## Arquitectura y entrenamiento

El modelo es un transformer basado en EuroLLM-22B, con la misma arquitectura de la familia Llama. La cadena de entrenamiento está compuesta por tres fases: preentrenamiento continuado (CPT) sobre un conjunto de 6 millones de tokens en 6.000 iteraciones con rango 64; ajuste supervisado (SFT) con el dataset instruct_v18b durante 1 época, con rango 16, escala 16 y tasa de aprendizaje 5e-6, seleccionando la iteración 3.600; y optimización de preferencias directas (DPO) sobre 36 pares alfa en 120 iteraciones, con rango 16, escala 16 y tasa 2e-6.

La innovación destacable es que todo el entrenamiento se realizó sobre una versión ya cuantizada en q8 del modelo base, en lugar de entrenar en precisión bf16 y cuantizar después. Esto convierte a este repositorio MLX en el artefacto primario del modelo, con una calidad idéntica a la precisión nativa. No se empleó RLHF, sino DPO como método de alineación.

## Capacidades

- Generación de texto conversacional e instructivo en húngaro, con plantilla ChatML y soporte de conversaciones multi-turno.
- Razonamiento básico, comprensión lectora, traducción y generación de código, donde el modelo obtiene buenos resultados en el benchmark emese-bench v1.
- Memoria de contexto y roleplay: puntuación máxima (10/10) en tareas de recuerdo de información dentro del contexto y en sesiones de rol.
- Seguridad: fuerte en tareas de seguridad según el benchmark.
- Limitaciones conocidas: matemáticas de varios pasos y puzzles lógicos son sus puntos más débiles.
- El modelo es predominantemente húngaro; su capacidad multilingüe es limitada (en una sesión de chat en inglés respondió en húngaro).
- No se ha documentado soporte explícito de tool calling o function calling.

## Casos de uso

1. Asistente de atención al cliente en húngaro: el modelo puede gestionar conversaciones multi-turno con un contexto de 32.768 tokens, suficiente para mantener un historial de chat largo y consultar información relevante del cliente. Se puede integrar en una aplicación de escritorio en macOS mediante mlx_lm.
2. Generación de contenido editorial en húngaro: redacción de artículos, boletines o informes, aprovechando su buena comprensión lectora y su capacidad instructiva. El modelo es adecuado para tareas de escritura con supervisión humana.
3. Traducción asistida entre húngaro y otros idiomas europeos: el modelo hereda la base multilingüe de EuroLLM, y la traducción es uno de sus puntos fuertes en el benchmark. Puede usarse como apoyo en flujos de localización, aunque se recomienda revisar las salidas.
4. Análisis de documentos extensos en húngaro: la ventana de 32.768 tokens permite procesar informes, contratos o artículos largos, extrayendo resúmenes, entidades o sentimientos. Esta tarea puede ejecutarse localmente en Mac, lo que evita enviar datos sensibles a servidores externos.
5. Asistente de programación en húngaro: el modelo muestra buen rendimiento en código y puede usarse para generar fragmentos, explicar algoritmos o revisar código en un entorno de desarrollo integrado con Apple Silicon.
6. Chatbots y agentes conversacionales de roleplay: con puntuación máxima en roleplay y memoria de contexto, es adecuado para aplicaciones de entretenimiento, personajes virtuales o simulaciones de diálogo en húngaro.
7. Tutor de idiomas húngaro: el modelo puede conversar en húngaro, corregir errores y explicar gramática, sirviendo como herramienta de autoaprendizaje para personas que quieren practicar el idioma.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| emese-bench v1 (total) | 410/500 (82%) |
| emese-bench v1 (parte Ultimate) | 211/250 |
| emese-bench v1 (parte BlindSpot) | 310/376 |

| Modelo | Resultado emese-bench v1 |
|---|---|
| Folyó-MLX (este modelo) | 410/500 |
| Patak (emese-tech) | 413/500 |
| Csermely (emese-tech) | 211/500 |

Folyó-MLX es el segundo mejor de los tres, muy cerca de Patak y muy por delante de Csermely. En las categorías de seguridad, lectura, traducción y código obtiene los mejores resultados; en matemáticas multi-paso y lógica, los más bajos. También destaca por su memoria de contexto y roleplay (ambos 10/10).

## Requisitos de hardware

- VRAM estimada: el tamaño del modelo en disco es de unos 22 GB en q8. En MLX, se carga en la memoria unificada de Apple Silicon, por lo que se recomienda un Mac con al menos 24 GB de RAM unificada; 32 GB para mayor margen.
- GPU recomendadas: el modelo está diseñado y solo es compatible con Apple Silicon mediante MLX (M1 o posterior). No está pensado para GPUs NVIDIA.
- Espacio en consumer GPU: no aplicable. El formato MLX no se puede ejecutar en GPUs NVIDIA. Para usar el modelo en esos entornos, hay que emplear el repositorio bf16, que ocupa ~42 GB y requiere una GPU con más de 42 GB de VRAM (por ejemplo, H100 80GB).
- Opciones de despliegue: exclusivamente mlx_lm (Python) para este repositorio. No es compatible con transformers, vLLM ni TGI. Para estos frameworks, usar el modelo en bf16 del repositorio folyo/.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | emese-bench v1 |
|---|---|---|---|---|---|
| Folyó-MLX (emese-tech) | 22,6 B | 32.768 | MLX q8 | Apache 2.0 | 410/500 |
| Patak (emese-tech) | no disponible | no disponible | no disponible | no disponible | 413/500 |
| Csermely (emese-tech) | no disponible | no disponible | no disponible | no disponible | 211/500 |

Patak y Csermely también pertenecen al mismo autor y comparten el mismo benchmark, pero no se dispone de especificaciones completas en la información proporcionada. En el caso de Patak, parece ser un modelo de características similares con un rendimiento ligeramente superior; Csermely es claramente inferior.

## Limitaciones y advertencias

- El modelo está afinado para húngaro y su capacidad multilingüe es débil. En la sesión de chat en inglés del benchmark, respondió en húngaro a pesar de la instrucción.
- Puntos débiles en matemáticas multi-paso y puzzles lógicos, lo que limita su uso en tareas de razonamiento complejo.
- Este repositorio solo funciona con mlx_lm. El config.json incluye un bloque de cuantización que transformers, vLLM y TGI no entienden; para usar esos frameworks hay que emplear el repositorio bf16.
- No se han documentado sesgos específicos ni datos sobre alucinación. Como cualquier LLM, puede generar contenido no veraz o sesgado, y se recomienda supervisión humana en aplicaciones de producción.
- No hay soporte documentado de tool calling ni function calling, por lo que su integración en agentes que requieren llamadas a herramientas puede ser difícil o requerir trabajo adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/emese-tech/folyo-mlx
- Modelo base EuroLLM-22B: https://huggingface.co/utter-project/EuroLLM-22B
- Perfil del autor en HuggingFace: https://huggingface.co/emese-tech
