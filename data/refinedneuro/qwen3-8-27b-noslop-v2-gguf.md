# RefinedNeuro/Qwen3.8-27b-noslop-v2-gguf

## Resumen

Qwen3.8-27b-noslop-v2 es una edición "menos slop" del modelo Qwen3.8-27B de Alibaba, publicada por el usuario RefinedNeuro en formato GGUF. El modelo base tiene 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) y se distribuye bajo licencia Apache 2.0. La edición se ha realizado con la herramienta Heretic mediante una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre los pesos originales en bf16, con el objetivo declarado de reducir la aparición de palabras y expresiones típicas de "slop" (texto genérico y formulaico) en la generación de ficción.

El autor es explícito sobre el alcance limitado del cambio: no es un modelo "sin slop", no elimina los guiones largos (em dashes) y la reducción medida es modesta (de 86 a 65 respuestas con palabras de slop en 100 prompts de ficción, en modo greedy). La publicación se justifica porque, a diferencia de la primera versión del mismo autor, esta variante se mantiene más cerca del modelo original en pruebas de agente de código: 106 de 120 ejecuciones superadas frente a 110 de 120 del original.

La relevancia práctica es acotada: se trata de una cuantización GGUF experimental de un modelo de 27B con ventana de contexto de 32.768 tokens según el ejemplo de uso, pensada para despliegue local con llama.cpp. El repositorio ocupa 94,1 GB e incluye siete archivos GGUF con distintas cuantizaciones (Q2_K_XL, Q2_K_M, Q3_K_M, Q3_K_XL, Q4_K_M, Q8_0) más un proyector de visión F16 sin modificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles no disponibles) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (según el ejemplo de uso con `-c 32768`; máximo no confirmado) |
| Tipos de cuantización | Q2_K_XL (9,83 GB), Q2_K_M (10,9 GB), Q3_K_M (13,5 GB), Q3_K_XL (13,1 GB), Q4_K_M (16,8 GB), Q8_0 (29,0 GB); proyector de visión mmproj-F16 (0,93 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia del modelo base) |

## Arquitectura y entrenamiento

El modelo es una edición de pesos de Qwen3.8-27B, no un reentrenamiento. La modificación se aplica con Heretic en su versión master, usando la receta `config.noslop.toml` sin cambios: objetivo KeywordRate sobre listas de palabras de slop en ficción, divergencia KL de primer token y ablación ARA con rango 50. El proceso ejecutó 60 ensayos con búsqueda en 4 bits, con arranque aleatorio en los primeros 20 y optimización TPE a partir de ahí. Se seleccionó el ensayo 18 como candidato de baja divergencia.

El adaptador resultante se fusionó en los pesos originales en bf16 y se cuantizó con una matriz de importancia propia del autor. Se conserva la cabeza de predicción multi-token (multi-token-prediction head) en todos los archivos. No se prohíben tokens ni se aplica filtrado de salida. La divergencia KL de primer token respecto al original es de 0,0075, un valor bajo que refleja que el cambio es moderado. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional y de ficción, con menor tasa de palabras de slop en ficción según la medición del autor (65/100 frente a 86/100).
- Ejecución de tareas de agente de código: el autor reporta 106/120 ejecuciones superadas en tareas con tests ocultos, en sandbox, con límite de 600 s y 100 llamadas a herramientas.
- Uso de herramientas (tool calling) dentro de bucles de agente, con un promedio de 9,8 llamadas por ejecución.
- Entrada de imagen mediante el proyector de visión mmproj-F16 incluido (no probado por el autor).
- Compatibilidad con la plantilla de chat y los ajustes de muestreo de Qwen3.8-27B.
- Predicción multi-token conservada en los pesos.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de ficción y narrativa: el modelo reduce la aparición de expresiones formulaicas en listas de palabras de slop (de 86 a 65 de 100 prompts en modo greedy), por lo que es adecuado para borradores de relatos donde se quiera evitar clichés léxicos, asumiendo que el efecto es parcial.
- Agentes de código en local: con 106/120 tareas superadas en el banco de pruebas del autor, puede integrarse en flujos de agente con llama-server y plantilla Jinja, aceptando un ligero aumento de bucles detectados (6/120 frente a 2/120).
- Despliegue en hardware de consumo: la cuantización Q2_K_XL de 9,83 GB permite ejecución en GPU con 12-16 GB de VRAM, útil para prototipado de agentes sin infraestructura dedicada.
- Procesamiento de imágenes con el proyector de visión: el archivo mmproj-F16 permite entrada multimodal, aunque el autor no verificó esta ruta y debe validarse antes de usarla en producción.
- Evaluación comparativa de técnicas de ablación: sirve como referencia para estudiar el compromiso entre reducción de sesgos estilísticos y degradación de rendimiento en agentes, dado que el autor publica métricas de KL y de tareas superadas.
- Experimentación con cuantizaciones: el repositorio ofrece seis niveles de cuantización construidos con la misma matriz de importancia, lo que facilita comparar calidad y tamaño en un mismo pipeline.

## Benchmarks y rendimiento

El autor publica mediciones propias sobre el archivo Q2_K_XL frente a una base Q2_K_XL construida con el mismo diseño y matriz de importancia. No son benchmarks estándar (MMLU, HumanEval, GSM8K).

| Métrica | Original | Este modelo |
|---|---|---|
| Respuestas con palabras de slop en ficción (100 prompts, greedy) | 86/100 | 65/100 |
| Divergencia KL de primer token vs. original | 0 | 0,0075 |
| Ejecuciones de agente de código superadas (120 ejecuciones) | 110/120 | 106/120 |
| Ejecuciones detenidas por detector de bucle o falta de progreso | 2/120 | 6/120 |
| Tiempo medio por ejecución | 34 s | 38 s |
| Llamadas a herramientas medias por ejecución | 7,9 | 9,8 |
| Mensaje final del agente con guion largo o medio | 100/120 | 92/120 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GB para Q2_K_XL, 11 GB para Q2_K_M, 13-14 GB para Q3_K_M y Q3_K_XL, 17 GB para Q4_K_M y 29 GB para Q8_0, más el espacio del contexto KV.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q8_0 con contexto reducido; RTX 3060/4060 Ti de 16 GB o RTX 4070 Ti Super para Q3; GPUs de 12 GB para Q2_K_XL. A100 y H100 quedan sobredimensionadas para estas cuantizaciones, pero permiten contexto completo y mayor concurrencia.
- Cabe en GPU de consumo: sí, en las cuantizaciones Q2 y Q3 con 12-16 GB de VRAM; Q4_K_M requiere 24 GB o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-server) es la vía documentada por el autor, con `--jinja -c 32768`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: el autor reporta 38 s de media por ejecución de agente en su entorno de pruebas, sin especificar hardware; no hay datos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RefinedNeuro/Qwen3.8-27b-noslop-v2 | 27,3B | 32.768 (según uso) | Apache 2.0 | GGUF | Edición ARA de baja divergencia (KL 0,0075) |
| RefinedNeuro/Qwen3.8-27b-noslop (v1) | 27,3B (base) | no disponible | Apache 2.0 | GGUF | Mayor reducción de guiones, pero 20/120 ejecuciones de agente marcadas por bucles |
| Qwen/Qwen3.8-27B | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo base sin editar; 110/120 tareas de agente superadas |

No se dispone de datos de otros modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- La reducción de slop es pequeña y se limita a listas de palabras en ficción; no elimina los guiones largos (92/120 mensajes finales aún los contienen).
- El modelo presenta más bucles en agentes que el original (6/120 frente a 2/120) y supera menos tareas (106/120 frente a 110/120); el autor advierte que las diferencias de pocas ejecuciones están dentro del ruido.
- Solo se ha probado con agentes la cuantización Q2_K_XL; el comportamiento de bucle de las demás cuantizaciones es desconocido.
- La entrada de imagen mediante mmproj-F16 no fue probada por el autor.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el del modelo base, sin datos publicados.
- Sesgos conocidos: no documentados; la edición no aborda sesgos sociales o de contenido, solo estilo léxico.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus derivados pueden estar sujetos a las condiciones de Qwen; conviene verificar la licencia del modelo original antes de producción.
- El repositorio tiene 71 descargas y 0 likes en el momento de la consulta, con validación externa limitada.

## Enlaces

- Hugging Face: https://huggingface.co/RefinedNeuro/Qwen3.8-27b-noslop-v2-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Primera versión del autor: https://huggingface.co/RefinedNeuro/Qwen3.8-27b-noslop-gguf
- Heretic (herramienta de edición): https://github.com/p-e-w/heretic
