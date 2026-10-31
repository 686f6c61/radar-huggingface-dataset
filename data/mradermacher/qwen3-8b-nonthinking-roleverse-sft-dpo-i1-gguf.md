# mradermacher/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO-i1-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF con imatrix (matriz de importancia) del modelo **Qwen3-8B-NonThinking-RoleVerse-SFT-DPO**, un fine-tuning de Qwen3-8B desarrollado por tinyrolls y cuantizado por mradermacher. El modelo base se ha entrenado con el dataset RoleVerse mediante SFT (supervised fine-tuning) seguido de DPO (Direct Preference Optimization), con un enfoque específico en role-playing y diálogo conversacional. La variante "NonThinking" indica que se ha desactivado el modo de razonamiento extendido de Qwen3, generando respuestas directas sin bloques de pensamiento.

La relevancia de esta ficha radica en que se trata de un repositorio de cuantizaciones: mradermacher no entrena modelos, sino que genera versiones comprimidas en formato GGUF con cuantización ponderada por imatrix, lo que permite ejecutar el modelo en hardware de consumo con una pérdida de calidad mínima. El modelo original tiene 8.190.735.360 parámetros y está disponible en más de 20 niveles de cuantización, desde IQ1_S (2,2 GB) hasta Q8 y superiores, cubriendo desde móviles hasta GPUs dedicadas.

Es relevante ahora porque los fine-tunings especializados en role-playing sobre Qwen3-8B son una categoría muy activa en la comunidad, y la disponibilidad de cuantizaciones imatrix de alta calidad facilita su despliegue local mediante llama.cpp, Ollama, LM Studio o similares. El modelo soporta cinco idiomas (inglés, chino, japonés, francés y español) bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3), denso |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE; modelo denso, todos los parámetros activos) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; la model card no la especifica) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, Q8 (y superiores según repo) |
| Idiomas soportados | en, zh, ja, fr, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer decoder denso de la familia Qwen3 de Alibaba. La variante "NonThinking" corresponde a un ajuste en el que el modelo genera respuestas directas sin el modo de razonamiento paso a paso (thinking mode) característico de Qwen3, lo que reduce la latencia y el consumo de tokens en aplicaciones conversacionales. El fine-tuning se realizó en dos etapas: primero SFT (supervised fine-tuning) sobre el dataset tinyrolls/RoleVerse, especializado en role-playing y diálogo, y después DPO (Direct Preference Optimization) para alinear las respuestas con preferencias humanas en calidad de rol, coherencia de personaje y estilo conversacional.

La cuantización publicada por mradermacher utiliza la técnica de imatrix (importance matrix): se calcula una matriz de importancia a partir de datos de calibración y se usa para ponderar qué pesos se cuantizan con mayor precisión, mejorando notablemente la calidad de los cuants bajos (2-4 bits) frente a cuantizaciones estáticas equivalentes. No hay datos publicados sobre el número de tokens de entrenamiento, la composición detallada del dataset RoleVerse ni el uso de RLHF adicional.

## Capacidades

- Role-playing y simulación de personajes: fine-tuning específico sobre el dataset RoleVerse para mantener personajes coherentes en conversaciones largas.
- Diálogo conversacional multi-turno: optimizado para chat natural, etiquetado como conversational.
- Generación de texto general: hereda las capacidades base de Qwen3-8B (redacción, resumen, razonamiento general).
- Capacidades multilingües: soporte declarado para inglés, chino, japonés, francés y español.
- Respuestas directas sin thinking mode: menor latencia y consumo de tokens al no generar bloques de razonamiento.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Capacidades de visión, audio u otras modalidades: no disponibles (modelo solo de texto).

## Casos de uso

- Compañeros de rol interactivos: el modelo puede encarnar personajes ficticios en sesiones de rol de texto, manteniendo la coherencia del personaje gracias al fine-tuning DPO sobre RoleVerse.
- Chatbots narrativos en videojuegos: integrable en motores de diálogo de juegos indie mediante llama.cpp para generar respuestas de NPCs con personalidad definida.
- Escritura creativa colaborativa: útil como asistente de coescritura de ficción, generando diálogos y continuaciones de escenas en el estilo solicitado.
- Práctica de idiomas conversacional: con soporte de español, francés, japonés, chino e inglés, puede simular conversaciones informales para aprendizaje de lenguas.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (5,1 GB) o IQ4_XS (4,7 GB) permiten ejecutarlo en portátiles y GPUs de gama media sin servidor dedicado.
- Prototipado de agentes de diálogo: aunque no documenta tool calling, sirve como base para experimentos de agentes conversacionales con gestión de estado externo.
- Servidores de rol comunitarios: su licencia Apache 2.0 permite integrarlo en plataformas con usuarios de pago sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni comparativas con el modelo base Qwen3-8B, por lo que no es posible cuantificar el impacto del fine-tuning en capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. IQ1_S ocupa 2,2 GB; IQ2_M, 3,2 GB; Q3_K_M, 4,2 GB; Q4_K_M, 5,1 GB; Q5_K_M, 5,8 GB; Q6_K, aproximadamente 6,6 GB; Q8_0, aproximadamente 8,7 GB. Añadir 1-2 GB adicionales para el KV cache según la longitud de contexto.
- GPUs recomendadas: cualquier GPU con 6 GB de VRAM o más para cuants de 4-5 bits (RTX 3060, RTX 4060, RTX 4090 para cuants altos con contexto largo). En CPU pura es viable con cuants de 2-4 bits a velocidades reducidas.
- Consumer GPUs: sí, cabe cómodamente en GPUs de gama media y alta. Un Q4_K_M (5,1 GB) funciona en una RTX 3060 de 12 GB o incluso en GPUs de 8 GB con contexto moderado. También es ejecutable parcial o totalmente en CPU/RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp (popular para role-playing), text-generation-webui. El modelo base en safetensors también puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles como cifras oficiales; en GPUs de consumo con cuantos de 4 bits se esperan típicamente decenas de tokens por segundo, pero no hay medidas publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| Qwen3-8B-NonThinking-RoleVerse-SFT-DPO (este) | 8,19 B | Role-playing y dialogo (SFT + DPO sobre RoleVerse) | Apache 2.0 | GGUF (imatrix) y safetensors |
| Qwen3-8B (base, Alibaba) | 8,19 B | Modelo generalista, thinking/non-thinking | Apache 2.0 | Safetensors, GGUF comunitarios |
| Mradermacher cuants estaticos del mismo modelo | 8,19 B | Identicas capacidades, cuantizacion sin imatrix | Apache 2.0 | GGUF estatico |

Observaciones: frente al Qwen3-8B base, esta variante sacrifica probablemente rendimiento en tareas generales y de razonamiento a cambio de un comportamiento mucho más afinado en role-playing y diálogo. Frente a otras alternativas de role-playing de 7-9B de la comunidad (por ejemplo, fine-tunings de Mistral o Llama 3 en la misma categoría), destacaría su soporte multilingüe declarado (incluido español y japonés) y la licencia Apache 2.0, aunque no hay benchmarks publicados que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Al ser un fine-tuning especializado en role-playing, es probable que haya sufrido degradación en capacidades de razonamiento, código y matemáticas respecto a Qwen3-8B base; no hay benchmarks que lo confirmen ni lo cuantifiquen.
- Riesgo de alucinación: inherente a cualquier LLM de 8B; en role-playing puede inventar hechos con total fluidez, lo que es deseable en ficción pero problemático en usos informativos.
- Sin documentación de tool calling ni agentes: no es adecuado para pipelines de function calling sin validación previa.
- Cuants muy bajos (IQ1_S, IQ1_M, IQ2_XXS) degradan seriamente la calidad; el propio autor los marca como "for the desperate". Se recomienda como mínimo Q4_K_S o IQ3_M.
- La longitud de contexto exacta no está documentada en esta model card; consultar la ficha del modelo base Qwen3-8B antes de diseñar aplicaciones con contextos largos.
- Sesgos: el dataset RoleVerse puede contener contenido de rol no moderado; no hay información sobre filtros de seguridad aplicados durante el entrenamiento. Revisar el dataset original antes de uso público.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero deben respetarse los términos de la licencia original de Qwen3 y cualquier aviso de atribución.
- Esta ficha corresponde al repositorio de cuantizaciones de mradermacher; para soporte del comportamiento del modelo, el punto de referencia es tinyrolls/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO.

## Enlaces

- Repositorio GGUF (imatrix): https://huggingface.co/mradermacher/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO-i1-GGUF
- Modelo base (SFT + DPO): https://huggingface.co/tinyrolls/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO
- Dataset de entrenamiento: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO-GGUF
- Pagina de descarga resumida de mradermacher: https://hf.tst.eu/model#Qwen3-8B-NonThinking-RoleVerse-SFT-DPO-i1-GGUF
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
