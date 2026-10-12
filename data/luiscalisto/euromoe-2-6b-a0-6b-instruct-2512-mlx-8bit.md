# luiscalisto/EuroMoE-2.6B-A0.6B-Instruct-2512-MLX-8bit

## Resumen
El modelo EuroMoE-2.6B-A0.6B-Instruct-2512-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo base utter-project/EuroMoE-2.6B-A0.6B-Instruct-2512, desarrollado por el equipo de EuroLLM (utter-project). Se trata de un modelo de mezcla de expertos (MoE) con 2.611.528.704 parámetros totales y 0,6 mil millones de parámetros activos por token, diseñado para seguir instrucciones y con cobertura multilingüe de 35 idiomas. La conversión ha sido realizada por luiscalisto para permitir su ejecución en Apple Silicon mediante la librería mlx-lm.

El problema que resuelve es la necesidad de ejecutar un modelo MoE instruct en hardware de Apple con recursos limitados, manteniendo un tamaño de repositorio de 2,8 GB y evitando los bucles de repetición que aparecían en la versión de 4 bits del mismo modelo. Es relevante porque permite inferencia local eficiente en Macs con chip de la serie M, con licencia Apache 2.0 y sin depender de servicios en la nube.

La arquitectura subyacente es un transformer con mezcla de expertos, con 64 expertos y 8 activos por token, según la configuración del modelo base. No se dispone de información sobre la longitud de contexto en la documentación proporcionada.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tipo Mixtral (64 expertos, 8 activos por token) |
| Parámetros totales | 2.611.528.704 (2,6B) |
| Parámetros activos | 0,6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit (MLX) |
| Idiomas soportados | Multilingüe, 35 idiomas (cobertura EuroLLM UE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento
El modelo es una cuantización del modelo base utter-project/EuroMoE-2.6B-A0.6B-Instruct-2512, que es un MoE con 64 expertos y 8 activos por token, según el config.json (model_type=mixtral). El modelo base pertenece a la familia EuroLLM, desarrollado por el proyecto EuroLLM (utter-project), y ha sido entrenado con EuroBlocks instruction tuning. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO.

La innovación de esta versión es la cuantización a 8 bits mediante mlx-lm 0.31.3, que permite su ejecución en Apple Silicon. Se eligió 8 bits en lugar de 4 bits porque esta última presentaba bucles de repetición en respuestas largas, mientras que la versión de 8 bits no mostraba ese problema y aun así ocupa solo 2,8 GB.

## Capacidades
- Generación de texto e instrucciones (modelo instruct).
- Razonamiento y respuesta a preguntas.
- Capacidades multilingües: 35 idiomas (cobertura EuroLLM UE).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso
- Asistente personal en Mac: al ser un modelo MLX de 2,8 GB, se puede ejecutar localmente en un Mac con Apple Silicon (M1 o superior) con 8 GB de memoria unificada, ofreciendo respuestas multilingües sin conexión.
- Traducción automática: con cobertura de 35 idiomas, puede traducir textos entre lenguas europeas, útil para comunicación interna en empresas multinacionales o para proyectos de localización.
- Resumen de documentos: puede resumir artículos o informes en varios idiomas, aunque la longitud de contexto no está especificada, por lo que se recomienda para textos de extensión moderada.
- Redacción de correos y comunicaciones: puede generar borradores de correos electrónicos, mensajes o publicaciones en distintos idiomas, agilizando tareas administrativas.
- Chatbot educativo: puede actuar como tutor para practicar idiomas o resolver dudas sencillas de materias como historia o ciencias, aprovechando su naturaleza instruct.
- Atención al cliente automatizada: en despliegues ligeros, puede gestionar consultas frecuentes multilingües con respuestas generadas localmente, reduciendo costes de API.
- Análisis de sentimiento y clasificación de textos: puede etiquetar opiniones o correos en distintos idiomas, integrándose en flujos de procesamiento por lotes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: al estar cuantizado a 8 bits, los pesos ocupan aproximadamente 2,8 GB. Se recomienda al menos 8 GB de memoria unificada en Apple Silicon para inferencia con margen.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con 8 GB o más de memoria unificada. No es compatible con GPU NVIDIA de forma nativa (MLX es específico de Apple).
- Cabe en consumer GPU: sí, en cualquier Mac con Apple Silicon y 8 GB de RAM unificada. No cabe en GPU de consumo NVIDIA sin una conversión previa a otro formato (por ejemplo, GGUF).
- Opciones de despliegue: mlx-lm (librería oficial), con el código de ejemplo proporcionado. También se puede integrar en aplicaciones mediante Python.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la información proporcionada. Se puede comparar con la versión de 4 bits del mismo modelo y con el modelo base sin cuantizar:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EuroMoE-2.6B-A0.6B-Instruct-2512-MLX-8bit (este) | 2,6B | 0,6B | no disponible | Apache-2.0 | safetensors (MLX, 8-bit) | 2,8 GB, sin bucles de repetición |
| EuroMoE-2.6B-A0.6B-Instruct-2512-MLX-4bit | 2,6B | 0,6B | no disponible | Apache-2.0 | safetensors (MLX, 4-bit) | Presentaba bucles de repetición en respuestas largas |
| EuroMoE-2.6B-A0.6B-Instruct-2512 (base) | 2,6B | 0,6B | no disponible | Apache-2.0 | safetensors | Modelo original sin cuantizar |

## Limitaciones y advertencias
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; al ser un modelo pequeño (0,6B activos), el riesgo puede ser mayor en tareas factuales.
- Limitaciones de contexto o idioma: aunque soporta 35 idiomas, el rendimiento puede variar según la lengua. La longitud de contexto no está especificada, lo que limita su uso en documentos muy largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe atribuir al autor original (utter-project) y a luiscalisto por la conversión.
- Caveats para producción: la cuantización a 8 bits puede degradar ligeramente la calidad frente al modelo sin cuantizar. Al ser un modelo MoE con solo 0,6B activos, su capacidad de razonamiento complejo es limitada. No se recomienda para tareas que requieran alta precisión factual o contexto extenso sin verificación previa.

## Enlaces
- [HuggingFace del modelo cuantizado](https://huggingface.co/luiscalisto/EuroMoE-2.6B-A0.6B-Instruct-2512-MLX-8bit)
- [HuggingFace del modelo base](https://huggingface.co/utter-project/EuroMoE-2.6B-A0.6B-Instruct-2512)
- [Repositorio mlx-lm](https://github.com/ml-explore/mlx-lm)
- [Repositorio de conversiones llm-mlx-conversions](https://codeberg.org/lcalisto/llm-mlx-conversions)
- [Versión de 4 bits del mismo autor](https://huggingface.co/luiscalisto/EuroMoE-2.6B-A0.6B-Instruct-2512-MLX-4bit)
