# fraQtl/Ornith-1.5-9B-Hi-Fi-GGUF

## Resumen

Ornith-1.5-9B-Hi-Fi-GGUF es una cuantización GGUF del modelo base ornith-ai/Ornith-1.5-9B, publicada por el usuario fraQtl. El modelo base es un transformer de 8.953.803.264 parámetros (aproximadamente 9B) orientado a conversación y uso de herramientas (tool calling), según indican las etiquetas del repositorio. Esta publicación no incluye el modelo original, sino dos artefactos cuantizados listos para inferencia local: una versión Q4_K_M para llama.cpp, Ollama y LM Studio, y una versión Q4_0 específicamente adaptada al backend Hexagon de llama.cpp para ejecutarse en la NPU de los SoC Snapdragon.

La relevancia de esta ficha reside en que el autor aporta una evaluación comparativa sobre el benchmark oficial BFCL v4 live (2.251 prompts) que sitúa su Q4_K_M en 1.639 puntos frente a los 1.564 del Q4_K_M publicado por el propio autor del modelo base y los 1.637 del modelo original en bf16. La ganancia no proviene de mejorar las llamadas a herramientas, sino de reducir los falsos positivos (llamadas innecesarias): el archivo de fraQtl acierta en 609 casos de "no llamar" frente a 545 del Q4_K_M de ornith-ai. En la variante NPU Q4_0, el autor reporta 1.628 puntos frente a 1.531 de bartowski Q4_0.

El repositorio tiene un tamaño de 11,1 GB y licencia MIT. El pipeline no está declarado en Hugging Face y los idiomas soportados no se especifican en la información disponible. La fecha de creación del repositorio es el 25 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base ornith-ai/Ornith-1.5-9B; detalles internos no disponibles) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GPTQ Hessian-weighted rounding) y Q4_0 (tipos soportados por Hexagon NPU, con algunos tensores elevados a Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors solo en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su naturaleza transformer y su tamaño de 8,95B parámetros. No se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni si incorpora innovaciones como decodificación especulativa o atención lineal. Tampoco se especifican los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO).

Lo que sí documenta el autor de esta cuantización es el proceso de compresión. Para el archivo Q4_K_M se aplica redondeo GPTQ ponderado por Hessiana (Frantar et al., 2022) en lugar del redondeo al vecino más cercano, usando una matriz de importancia construida a partir de una mezcla de calibración de conversaciones de chat y de uso de herramientas renderizadas con la plantilla de chat propia de Ornith. Se mantiene el mapa de tipos por tensor del Q4_K_M original de ornith-ai (0 discrepancias de tipo sobre 250 tensores fijados) y se elimina el bloque de predicción del siguiente token, que llama.cpp no utiliza. Para el archivo NPU Q4_0 se emplean únicamente tipos soportados por Hexagon, elevando un pequeño número de tensores a Q8_0 dentro del presupuesto de bytes de bartowski. El autor probó una corrección de escala hacia el original, pero su guarda predefinida la detuvo porque el texto general se desviaba más de lo permitido, por lo que no se aplicó.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational" del repositorio.
- Tool calling / function calling: el modelo está evaluado con BFCL v4 live, que cubre llamadas simples, múltiples, paralelas y paralelas-múltiples.
- Detección de irrelevancia: capacidad de decidir cuándo no invocar una herramienta, medida explícitamente en el benchmark (609 aciertos en el Q4_K_M de fraQtl).
- Razonamiento multi-paso orientado a agentes, implícito en las categorías de tool calling evaluadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: el autor indica que las evaluaciones se realizaron con "thinking off", lo que sugiere que el modelo base dispone de un modo de razonamiento activable, aunque no se detalla su funcionamiento.
- Modelo exclusivamente de texto: el autor lo declara explícitamente ("Text model only").

## Casos de uso

- Agentes de automatización de tareas con herramientas: el modelo puede encadenar llamadas a APIs y decidir cuándo no es necesario invocar ninguna, gracias a su rendimiento medido en BFCL v4 live (1.639 puntos en Q4_K_M). Es adecuado para orquestadores de agentes que priorizan evitar llamadas espurias.
- Asistentes conversacionales en local: la cuantización Q4_K_M de 5,63 GB cabe en equipos de consumo y permite desplegar un chatbot multi-turno sin depender de la nube, usando llama.cpp, Ollama o LM Studio.
- Inferencia en dispositivos móviles con NPU: la variante NPU Q4_0 (5,48 GB) está diseñada para el backend Hexagon de llama.cpp en Snapdragon 8 Elite Gen 6, con 14,33 tok/s de decodificación y 993 tok/s de prefill medidos por el autor, lo que la hace viable para asistentes on-device.
- Enrutamiento de intenciones en pipelines de soporte: el modelo puede clasificar si una consulta requiere una herramienta externa (por ejemplo, consulta a base de datos) o puede resolverse conversacionalmente, reduciendo costes de llamadas innecesarias.
- Integración en entornos de desarrollo con LM Studio u Ollama: al estar en formato GGUF y licencia MIT, se puede incorporar en flujos de trabajo de prototipado rápido y pruebas de agentes sin restricciones comerciales.
- Evaluación y comparación de cuantizaciones: el repositorio incluye metodología reproducible (sha256, mismo run, diferencias pareadas con intervalos de confianza) útil para equipos que necesitan validar la calidad de una cuantización antes de adoptarla en producción.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, permite procesar conversaciones sensibles sin enviar datos a servicios externos.

## Benchmarks y rendimiento

El autor publica resultados sobre BFCL v4 live (2.251 prompts, greedy, thinking off, todos los archivos verificados por sha256 en la misma ejecución). La puntuación total combina llamadas live (simples, múltiples, paralelas, paralelas-múltiples), irrelevancia y relevancia.

| Archivo | Bytes | Total | Llamadas a herramienta | Aciertos en "no llamar" | Respuestas correctas del original que rompe |
|---|---|---|---|---|---|
| Original bf16 (ornith-ai/Ornith-1.5-9B) | no disponible | 1.637 | 1.016 | 607 | — |
| ornith-ai Q4_K_M | 5.780.090.816 | 1.564 | 1.005 | 545 | 162 |
| fraQtl Q4_K_M (este repo) | 5.629.109.184 | 1.639 | 1.016 | 609 | 101 |
| bartowski Q4_0 | 5.482.832.768 | 1.531 | 1.000 | 517 | 209 |
| fraQtl NPU Q4_0 (este repo) | 5.482.832.640 | 1.628 | 1.001 | 613 | 125 |

Diferencias pareadas reportadas por el autor (cota inferior unilateral al 95 % entre corchetes): fraQtl Q4_K_M frente a ornith-ai Q4_K_M, total +75 [+47,6], llamadas +11 [−7,7], rechazos +64 [+44,2]; fraQtl NPU Q4_0 frente a bartowski Q4_0, total +97 [+67,9], llamadas +1 [−19,5], rechazos +96 [+75,7]. En la mitad de prompts con id par (1.126), la cota de llamadas del Q4_K_M se queda a 0,3 de la línea del −2 %; el archivo NPU la supera en ambas mitades.

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 6, SM8975, backend Hexagon de llama.cpp, mismas condiciones, orden nuestro-rival-rival-nuestro):

| Archivo | Decodificación (tok/s) | Prefill (tok/s) | Operaciones rechazadas por la NPU |
|---|---|---|---|
| bartowski Q4_0 | 14,29 | 1.000 | 0 |
| fraQtl NPU Q4_0 | 14,33 | 993 | 0 |

El autor indica que las diferencias están dentro del ruido entre ejecuciones. No se han publicado resultados de MMLU-Pro, GSM8K, IFEval ni EvalPlus para estos archivos; el autor señala que, en otros modelos construidos con la misma receta, esas pruebas empatan con el archivo más descargado.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 5,63 GB y el NPU Q4_0 5,48 GB; con overhead de contexto y caché KV, se recomienda al menos 8 GB de VRAM o memoria unificada para el Q4_K_M.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el Q4_K_M es apto para GPU de consumo con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y para GPU de datacenter (A100, H100) si se busca mayor throughput.
- Cabe en GPU de consumo: sí, el Q4_K_M de 5,63 GB entra en tarjetas de 8 GB; el NPU Q4_0 está pensado para memoria unificada de smartphone.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para el Q4_K_M; llama.cpp con backend Hexagon para el NPU Q4_0 en Snapdragon 8 Elite Gen 6.
- Latencia y throughput: en dispositivo, 14,33 tok/s de decodificación y 993 tok/s de prefill para el NPU Q4_0. No se han publicado cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL v4 live (total) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fraQtl Ornith-1.5-9B Q4_K_M | 8,95B | no disponible | 1.639 | MIT | GGUF en HF |
| ornith-ai Ornith-1.5-9B Q4_K_M | 8,95B | no disponible | 1.564 | MIT | GGUF en HF |
| bartowski Ornith-1.5-9B Q4_0 | 8,95B | no disponible | 1.531 | MIT | GGUF en HF |
| Ornith-1.5-9B original bf16 | 8,95B | no disponible | 1.637 | MIT | safetensors en HF |

La comparación se limita a variantes del mismo modelo base, ya que la información disponible no incluye otros modelos de 9B comparables en tool calling. No se dispone de datos de MMLU, HumanEval ni GSM8K para establecer comparaciones adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no cuantificado; el autor solo mide tool calling mediante BFCL v4 live, no la veracidad factual del contenido generado.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles; el modelo base no documenta estos datos en la información consultada.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía. Conviene verificar la licencia del modelo base ornith-ai/Ornith-1.5-9B, también MIT según los metadatos.
- Cobertura de evaluación limitada: un solo benchmark (BFCL v4 live), una sola build de cada archivo y sin resultados de MMLU-Pro, GSM8K, IFEval ni EvalPlus. El autor reconoce que la velocidad solo se midió para el archivo NPU.
- Modelo exclusivamente de texto: no admite visión, audio ni otras modalidades.
- Rendimiento en dispositivo dentro del ruido: las cifras del NPU Q4_0 (14,33 tok/s) no son significativamente distintas de las de bartowski Q4_0 (14,29 tok/s), por lo que la ventaja está en la calidad de las respuestas, no en la velocidad.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.
- Sin pipeline declarado en Hugging Face: puede afectar a la integración automática con herramientas que dependen de ese metadato.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Ornith-1.5-9B-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Cuantización Q4_K_M de ornith-ai: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Cuantización Q4_0 de bartowski: no disponible (no se proporciona URL directa)
- llama.cpp (formato GGUF y backend Hexagon): https://github.com/ggml-org/llama.cpp
- Referencia GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la información proporcionada
