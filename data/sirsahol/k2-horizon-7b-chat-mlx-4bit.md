# SirSahOl/K2-Horizon-7B-chat-mlx-4bit

## Resumen

K2-Horizon-7B-chat-mlx-4bit es una conversión cuantizada a 4 bits del modelo denso IFM/K2-Horizon-7B, publicada por el usuario SirSahOl mediante la librería MLX de Apple. Su objetivo es permitir la inferencia nativa en la GPU unificada de los chips Apple Silicon (familias M1, M2, M3 y M4) con un consumo de memoria activa de aproximadamente 4,2 GB, lo que lo hace viable en equipos con solo 8 GB de memoria unificada. El repositorio ocupa 5,1 GB en disco y los pesos en safetensors suman 8.999.178.240 parámetros, una cifra superior a los 7B que sugiere el nombre comercial del modelo base.

La arquitectura declarada es K2HorizonForCausalLM, un transformer denso con una ventana de contexto de 524.288 tokens, muy superior a la de la mayoría de modelos abiertos de su categoria. El modelo está etiquetado como conversational y orientado a text-generation, con el inglés como único idioma declarado en las etiquetas del repositorio. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales sobre esta conversión.

Su relevancia actual radica en la combinación de contexto extremadamente largo y huella de memoria reducida en hardware de consumo de Apple. Frente a alternativas que requieren GPUs dedicadas, esta cuantización ofrece una via de despliegue local para asistentes conversacionales, pipelines RAG y flujos agénticos en portátiles y estaciones de trabajo Mac, con velocidades estimadas por el autor de entre 35 y 105 tokens por segundo según el chip.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2HorizonForCausalLM (transformer denso) |
| Parametros totales | 8.999.178.240 (~9B) segun safetensors; el nombre comercial indica 7B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantizacion | 4 bits (media de 4,50 bits por peso); el autor publica tambien variantes de 8 bits y 16 bits |
| Idiomas soportados | ingles (etiqueta `en`); no hay lista oficial de idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso identificado como K2HorizonForCausalLM, sin componentes de mezcla de expertos ni arquitecturas de espacio de estados. El autor no detalla en la información disponible el número de capas, dimensión oculta, número de cabezas de atención ni si emplea técnicas como atención lineal, decodificación especulativa o variantes de RoPE para extender el contexto hasta los 524.288 tokens. Tampoco se especifica si el entrenamiento incluyó fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Los únicos datos de entrenamiento mencionados son los conjuntos IFM/K2-Horizon-Pretrain-Data y IFM/K2-Horizon-Midtrain-Data, citados como datasets asociados en las etiquetas del repositorio, sin que se indique el número de tokens, la composición del corpus ni la proporción de código, matemáticas o contenido multilingüe. Esta conversión concreta no reentrena el modelo: aplica cuantización de 4 bits sobre los pesos del modelo base y los serializa en el formato MLX, con una media de 4,50 bits por peso. La plantilla conversacional empleada es ChatML, con los tokens especiales `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` como delimitadores de turno y parada.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla ChatML.
- Manejo de contextos muy largos, hasta 524.288 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Uso como asistente local y como "sidecar" de programación según las recomendaciones del propio autor.
- Soporte de flujos agénticos y uso de herramientas: el autor menciona "complex tool use" y "high-throughput agentic workflows" entre los casos recomendados para los chips Pro, aunque no documenta el formato exacto de function calling.
- Capacidades multilingües: limitadas al inglés según la etiqueta `en`; no se declaran otros idiomas.
- Modo de razonamiento explícito ("thinking mode"): no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener diálogos multi-turno en un Mac con 8 GB de memoria unificada, gestionando el historial completo dentro de la ventana de 524.288 tokens sin necesidad de truncado agresivo.
- Análisis de documentos largos: informes, contratos o expedientes completos pueden cargarse en un único prompt, lo que permite resumir, extraer cláusulas o responder preguntas sobre el texto sin fragmentación en chunks.
- Soporte al desarrollo en el IDE: con una huella de 4,2 GB puede ejecutarse en paralelo a editores, navegadores y contenedores, ofreciendo autocompletado, explicación de código y generación de pruebas unitarias sin enviar código a servicios externos.
- Pipeline RAG en local: la combinación de contexto largo y bajo consumo permite inyectar muchos fragmentos recuperados en una sola pasada, reduciendo la necesidad de reordenadores y mejorando la coherencia de las respuestas.
- Flujos agénticos de varios pasos: en chips Pro, Max o Ultra el autor estima velocidades de 52 a 105 tokens por segundo, suficientes para cadenas de razonamiento con llamadas a herramientas en bucle.
- Evaluación y prototipado de investigación: al existir variantes de 4, 8 y 16 bits del mismo modelo, es posible comparar el impacto de la cuantización sobre la calidad de las respuestas en una misma máquina.
- Procesamiento por lotes de síntesis documental: las estimaciones del autor para los chips Ultra apuntan a escenarios de concurrencia multiusuario y generación masiva de documentos en un servidor local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente proporciona estimaciones de rendimiento en hardware Apple Silicon:

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado | Caso de uso recomendado |
|---|---|---|---|---|---|
| M1/M2/M3/M4 (base) | 8-16 GB | ~4,2 GB | ~35 tokens/s | ~110 ms | Asistente local, sidecar de programación, interacción con un solo agente |
| M1/M2/M3/M4 Pro | 18-36 GB | ~4,2 GB | ~52 tokens/s | ~75 ms | Flujos agénticos de alto rendimiento, uso de herramientas, contextos largos |
| M1/M2/M3/M4 Max | 36-128 GB | ~4,2 GB | ~75 tokens/s | ~45 ms | Generación de baja latencia, evaluación multi-turno en paralelo, RAG |
| M1/M2/M3 Ultra | 64-192 GB | ~4,2 GB | ~105 tokens/s | ~30 ms | Servicio local empresarial, concurrencia multiusuario, síntesis por lotes |

El propio autor advierte que son estimaciones basadas en el ancho de banda de memoria unificada y en el número de parámetros activos, y que las velocidades reales pueden variar según la longitud del contexto. No se aportan cifras de perplejidad ni comparaciones de calidad frente a las variantes de 8 y 16 bits.

## Requisitos de hardware

- VRAM activa estimada: ~4,2 GB para la variante de 4 bits; ~7,8 GB para la de 8 bits y ~15,2 GB para la de 16 bits, según la tabla del autor.
- Memoria unificada mínima recomendada: 8 GB para la variante de 4 bits.
- Hardware compatible: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). El formato MLX no es ejecutable en GPUs NVIDIA, AMD o Intel.
- GPUs de consumo: no aplicable; el modelo no está pensado para RTX 4090 u otras GPUs discretas en este formato. Para ejecutarlo en hardware no Apple sería necesario recurrir al modelo base en otro formato, dato no disponible en esta información.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.chat` y `mlx_lm.generate`, o API de Python con `load` y `generate`) y LM Studio mediante un preset personalizado con cadenas de parada ChatML. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: TTFT estimado de 30 a 110 ms y velocidades de 35 a 105 tokens/s según el chip, siempre con las advertencias del apartado anterior.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo base K2-Horizon-7B, por lo que la comparación se limita a especificaciones publicas de alternativas habituales en el mismo segmento de modelos densos de 7-9B con versiones para MLX. Los datos de rendimiento de esas alternativas no se han consultado para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en MLX |
|---|---|---|---|---|
| K2-Horizon-7B-chat-mlx-4bit | ~9B (nombre comercial 7B) | 524.288 tokens | Apache-2.0 | Si, este repositorio |
| Qwen2.5-7B-Instruct | ~7,6B | hasta 128K tokens | Apache-2.0 | Si, versiones de la comunidad mlx-community |
| Llama-3.1-8B-Instruct | 8B | 128K tokens | Licencia comunitaria de Llama 3.1 | Si, versiones de la comunidad mlx-community |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32K tokens | Apache-2.0 | Si, versiones de la comunidad mlx-community |

La ventaja diferencial de K2-Horizon en esta comparativa es la ventana de contexto, cuatro veces mayor que la de Llama 3.1 y Qwen2.5 y dieciseis veces mayor que la de Mistral 7B v0.3, junto con una licencia Apache-2.0 sin cláusulas adicionales. Como contrapartida, carece de benchmarks publicados y de un ecosistema de adopción verificable: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

## Limitaciones y advertencias

- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación para el modelo base ni para esta cuantización.
- Sesgos conocidos: no disponibles. No hay documentación sobre composición del dataset de preentrenamiento ni sobre sesgos demográficos, culturales o de dominio.
- Idiomas: el modelo está etiquetado únicamente para inglés; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Pérdida por cuantización: la conversión a 4 bits (4,50 bits por peso de media) puede degradar el razonamiento complejo y el seguimiento de instrucciones frente a las variantes de 8 y 16 bits, tal como sugiere el propio autor al recomendar 8 bits para mayor precisión.
- Contexto largo: aunque la ventana declarada es de 524.288 tokens, no se documentan pruebas de recuperación de información a esa distancia ni el coste real de memoria del KV cache, que no está incluido en la cifra de 4,2 GB de VRAM activa.
- Discrepancia de parámetros: el recuento real de safetensors (8.999.178.240) supera notablemente la denominación "7B", lo que puede afectar a las estimaciones de memoria y velocidad.
- Compatibilidad de formato: los pesos MLX solo funcionan en Apple Silicon; no son portables a otros ecosistemas sin una reconversión.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero se debe conservar el aviso de licencia y verificar las condiciones del modelo base IFM/K2-Horizon-7B.
- Tokens de parada: es imprescindible configurar correctamente `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` en LM Studio u otros runtimes para evitar bucles de generación.
- Madurez: el repositorio no tiene descargas ni valoraciones y la model card aparece truncada, por lo que faltan detalles de la plantilla completa de chat y de los parámetros recomendados de muestreo.
- La búsqueda web realizada no devolvió documentación técnica, papers ni artículos relevantes sobre este modelo; los resultados obtenidos eran foros de MSDN sin relación con la ficha.

## Enlaces

- Repositorio HuggingFace (4 bits): https://huggingface.co/SirSahOl/K2-Horizon-7B-chat-mlx-4bit
- Variante de 8 bits: https://huggingface.co/SirSahOl/K2-Horizon-7B-chat-mlx-8bit
- Variante de 16 bits: https://huggingface.co/SirSahOl/K2-Horizon-7B-chat-mlx-16bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Perfil del autor: https://huggingface.co/SirSahOl
- Librería MLX de Apple: https://github.com/ml-explore/mlx
- Resultados de la búsqueda web: únicamente enlaces a foros de MSDN sin relación con el modelo (https://social.msdn.microsoft.com/Forums/en-US/922de5fa-b693-4687-b81d-7a82b8733fa2/, https://social.msdn.microsoft.com/Forums/en-US/0fafae27-74c6-4019-b5c2-22cfbe7a636d, https://social.msdn.microsoft.com/Forums/en-US/9864fd65-bde4-4305-9804-cd19ed189047, https://social.msdn.microsoft.com/Forums/pt-BR/d573c64f-4818-44ee-adfc-ceab10af7f75, https://social.msdn.microsoft.com/Forums/en-US/5c353f2b-b119-4cfc-aa74-7cd3b2d0d9fa).
