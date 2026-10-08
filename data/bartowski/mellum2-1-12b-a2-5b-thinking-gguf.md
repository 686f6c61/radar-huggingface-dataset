# bartowski/Mellum2.1-12B-A2.5B-Thinking-GGUF

# Mellum2.1-12B-A2.5B-Thinking: cuantizaciones GGUF de bartowski

## Resumen

Se trata del repositorio de cuantizaciones GGUF del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicado por bartowski, uno de los cuantizadores de referencia en el ecosistema llama.cpp. El modelo original lo desarrolla JetBrains y está orientado a generación de texto con enfasis en codigo, razonamiento matematico y uso de herramientas. El repositorio que nos ocupa no contiene pesos nuevos, sino versiones cuantizadas en formato GGUF del checkpoint original, pensadas para ejecucion local en CPU y GPU de consumo.

El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con 12.149.923.072 parametros totales (unos 12,15B) y, segun la nomenclatura "-A2.5B", aproximadamente 2,5B parametros activos por token. La model card del cuantizador confirma 12B de parametros del checkpoint de origen y soporte exclusivo de entrada de texto. La licencia declarada es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion habituales.

Su relevancia practica reside en la combinacion de un coste de inferencia bajo (alrededor de 2,5B parametros activos) con un catalogo amplio de cuantizaciones que permite desplegarlo desde estaciones de trabajo modestas hasta servidores con GPU. El repositorio ocupa 196,5 GB, lo que refleja una oferta extensa de niveles de cuantizacion, con la variante Q4_K_M (8,82 GB) como recomendacion del propio autor para un equilibrio entre tamano y rendimiento. Todas las metricas de benchmark incluidas en la model card estan marcadas como no verificadas y proceden del autor del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita en la informacion proporcionada (la nomenclatura "-A2.5B" sugiere mezcla de expertos, MoE) |
| Parametros totales | 12.149.923.072 (aproximadamente 12,15B) |
| Parametros activos | aproximadamente 2,5B, segun la nomenclatura del modelo (no confirmado de forma explicita en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion asistida por imatrix generada con llama.cpp b11490; confirmados bf16 y Q4_K_M (8,82 GB); el resto del catalogo no se detalla en la informacion disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el checkpoint original esta en safetensors |
| Decodificacion especulativa | no |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base mas alla de lo que se deduce de su nomenclatura. El identificador Mellum2.1-12B-A2.5B-Thinking sigue la convencion habitual para modelos de mezcla de expertos, donde el primer numero indica los parametros totales (12B) y el sufijo "-A2.5B" los parametros activos por token (aproximadamente 2,5B). El campo de parametros totales del checkpoint, 12.149.923.072, es coherente con esa lectura. El sufijo "Thinking" apunta a una variante entrenada o ajustada para razonamiento explicito antes de emitir la respuesta final.

Tampoco se especifican en la documentacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. La model card del cuantizador solo confirma que el modelo acepta entrada de texto, que no emplea decodificacion especulativa y que las cuantizaciones se han generado con la version b11490 de llama.cpp aplicando una matriz de importancia (imatrix) para reducir la perdida de calidad en niveles bajos de bits. El formato de prompt es de estilo ChatML, con etiquetas `<|im_start|>` y `<|im_end|>` para los roles system, user y assistant.

## Capacidades

- Generacion de texto conversacional, con formato de prompt basado en ChatML y pipeline declarado de text-generation.
- Generacion de codigo de alta competencia segun las metricas declaradas: 91,5 en HumanEval+ y 79,4 en MBPP+ (pass@1), ademas de 82,0 en LiveCodeBench v6.
- Razonamiento matematico: 83,3 de exact match en AIME 25/26 y 88,3 en GSM-Plus.
- Razonamiento cientifico y conocimiento general: 64,6 en GPQA Diamond y 87,8 en MMLU-Redux.
- Resolucion de tareas de ingenieria de software sobre repositorios reales: 47,0 de tasa de resolucion en SWE-bench Verified y 28,0 en SWE-bench Pro.
- Ejecucion de tareas en terminal: 17,4 de tasa de resolucion en Terminal-Bench 2.1.
- Tool calling y function calling: 62,3 de precision en BFCL v4 y 49,1 en ToolHop. El formato de herramientas usa bloques XML `<tools>` con definiciones en JSON y respuestas en `<tool_call>`.
- Flujos agénticos y de multiples pasos: 44,6 de tasa de completado de tareas en WorkBench.
- Seguimiento de instrucciones: 90,6 de precision en IFEval.
- Modo de razonamiento explicito, segun indica el sufijo "Thinking" del nombre del modelo.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multiturno en ingles con seguimiento de instrucciones fiable (90,6 en IFEval) y llamar a funciones externas para consultar pedidos, stocks o estados de cuenta mediante el formato `<tool_call>`.
- Agentes de codigo sobre repositorios: con 47,0 de resolucion en SWE-bench Verified, es adecuado para agentes que leen un repositorio, localizan el fallo, aplican un parche y ejecutan la suite de pruebas dentro de un pipeline de integracion continua.
- Asistente de terminal y automatizacion de operaciones: la puntuacion de 17,4 en Terminal-Bench 2.1 permite usarlo como copiloto para construir comandos, interpretar salidas de shell y encadenar tareas administrativas de forma asistida, siempre con supervision humana.
- Generacion de codigo en produccion: con 91,5 en HumanEval+, puede integrarse en editores, revisiones de pull requests o generacion de pruebas unitarias, apoyandose en su soporte de function calling para invocar linters y compiladores.
- Tutoria y resolucion de problemas matematicos: los resultados de 83,3 en AIME 25/26 y 88,3 en GSM-Plus lo hacen util para herramientas educativas que necesitan mostrar el razonamiento paso a paso antes de dar la solucion.
- Orquestacion de herramientas en flujos de negocio: los 44,6 de WorkBench y 62,3 de BFCL v4 permiten construir agentes que encadenan busquedas, calculos y escrituras en sistemas internos a partir de lenguaje natural.
- Despliegue en local y entornos con requisitos de privacidad: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse en estaciones de trabajo sin conexion, procesando codigo propietario sin enviarlo a servicios externos.
- Asistente de razonamiento tecnico sobre documentacion: con 87,8 en MMLU-Redux y 64,6 en GPQA Diamond, resulta util para responder consultas tecnicas y cientificas complejas en ingles.

## Benchmarks y rendimiento

Todos los resultados siguientes proceden del `model-index` de la model card y estan declarados como no verificados (`verified: false`). No se han incorporado cifras adicionales.

| Benchmark | Metrica | Resultado |
|---|---|---|
| LiveCodeBench v6 | pass@1 | 82,0 |
| HumanEval+ | pass@1 | 91,5 |
| MBPP+ | pass@1 | 79,4 |
| AIME 25/26 | exact match | 83,3 |
| GSM-Plus | exact match | 88,3 |
| SWE-bench Verified | resolved rate | 47,0 |
| SWE-bench Pro | resolved rate | 28,0 |
| Terminal-Bench 2.1 | resolved rate | 17,4 |
| BFCL v4 | accuracy | 62,3 |
| ToolHop | accuracy | 49,1 |
| WorkBench | task completion | 44,6 |
| IFEval | accuracy | 90,6 |
| MMLU-Redux | accuracy | 87,8 |
| GPQA Diamond | accuracy | 64,6 |
| MixEval-Hard | accuracy | 46,4 |
| XSTest | safe compliance | 88,8 |
| HarmBench | harmful rate (menor es mejor) | 8,5 |

No se dispone de resultados comparativos con otros modelos dentro de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada segun cuantizacion, para un modelo de 12,15B parametros totales: bf16 en torno a 23-25 GB, Q8_0 en torno a 13 GB, Q4_K_M 8,82 GB (cifra confirmada en la model card).
- Al tratarse de una arquitectura con aproximadamente 2,5B parametros activos por token, el coste de decodificacion por token es notablemente inferior al de un modelo denso de 12B, y la velocidad depende mas del ancho de banda de memoria que de la capacidad de computo.
- GPU de gama alta: A100 40/80 GB, H100, L40S o RTX 6000 Ada ejecutan la variante bf16 sin problema y permiten lotes grandes.
- GPU de gama media: RTX 4090 o RTX 3090 (24 GB) admiten bf16 justo al limite o Q8_0 con holgura; RTX 4080 o 4070 Ti (16 GB) ejecutan Q6/Q5 con comodidad.
- GPU de consumo: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB ejecutan Q4_K_M (8,82 GB) dejando margen para el contexto; tambien es viable el reparto CPU+GPU.
- Ejecucion en CPU: las cuantizaciones Q4 y Q5 permiten inferencia en CPU con memoria del sistema suficiente (16-32 GB), con velocidades de decodificacion dependientes del numero de nucleos.
- Opciones de despliegue: llama.cpp (incluido el servidor con API compatible con OpenAI), Ollama, LM Studio, llama-cpp-python. Para el checkpoint original en safetensors pueden usarse vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se limita a los datos de catalogo publicos de cada modelo; no se dispone de resultados de benchmark comparativos en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento.

| Modelo | Parametros totales | Parametros activos | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking | 12,15B | aproximadamente 2,5B (segun nomenclatura) | no disponible (probable MoE por nomenclatura) | Apache 2.0 | HuggingFace, cuantizaciones GGUF |
| DeepSeek-Coder-V2-Lite-Instruct | aproximadamente 16B | aproximadamente 2,4B | MoE | licencia propia de DeepSeek | HuggingFace |
| Qwen3-30B-A3B | aproximadamente 30,5B | aproximadamente 3,3B | MoE | Apache 2.0 | HuggingFace |
| Qwen3-8B | aproximadamente 8,2B | no aplica (denso) | transformer denso | Apache 2.0 | HuggingFace |

La ventaja principal de Mellum2.1-12B-A2.5B-Thinking frente a alternativas densas de tamano similar es el coste de inferencia reducido derivado de sus parametros activos, junto con un enfasis declarado en codigo, agentes y tool calling. Su limitacion mas evidente en la comparativa es el soporte exclusivo de ingles frente a alternativas con cobertura multilingue amplia.

## Limitaciones y advertencias

- Todos los resultados de benchmark estan declarados como no verificados por el autor del modelo; conviene tratarlos como orientativos y validarlos con evaluaciones propias antes de adoptar decisiones de produccion.
- El modelo solo declara soporte de ingles. No hay evidencia de capacidades multilingues y su uso en castellano no esta respaldado por la documentacion.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- Riesgo de alucinacion inherente a los modelos generativos: aunque las metricas de seguridad declaradas son razonables (88,8 de cumplimiento seguro en XSTest y 8,5 de tasa de contenido danino en HarmBench), no eliminan la posibilidad de respuestas incorrectas o inventadas.
- La puntuacion de 17,4 en Terminal-Bench 2.1 y de 44,6 en WorkBench indica que las tareas agenticas de multiples pasos todavia fallan con frecuencia; se recomienda supervision humana en flujos autonomos.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribucion correspondiente y verificar que el checkpoint original de JetBrains mantiene esa misma licencia, dado que este repositorio solo contiene la cuantizacion.
- Las cuantizaciones de bits bajos (Q2, Q3) pueden degradar de forma apreciable el rendimiento en tareas de codigo y razonamiento; se recomienda Q4_K_M o superior para uso serio.
- El repositorio ocupa 196,5 GB en total, por lo que la descarga completa requiere planificar el espacio en disco; conviene descargar unicamente el archivo de la cuantizacion elegida.
- La fecha de publicacion del repositorio figura como octubre de 2026 en los metadatos, dato que conviene contrastar con la ficha del modelo original.
- El prompt de sistema debe respetar el formato ChatML y, en el caso de herramientas, la estructura XML `<tools>` y `<tool_call>`; desviarse de este formato degrada la calidad de las respuestas y rompe el tool calling.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Thinking-GGUF
- Modelo original de JetBrains: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Version de llama.cpp utilizada para la cuantizacion (b11490): https://github.com/ggml-org/llama.cpp/releases/tag/b11490
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Archivo recomendado Q4_K_M: https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Thinking-GGUF/blob/main/Mellum2.1-12B-A2.5B-Thinking-Q4_K_M.gguf
