# dendriteholdings/Ingot-V-27B-Q2

## Resumen

Ingot-V-27B-Q2 es un modelo conversacional de 26.895.998.464 parámetros (~26,9 B) distribuido en formato GGUF con cuantización Q2. No se trata de un modelo entrenado desde cero, sino de la réplica cuantizada de un modelo profesor fijo, publicada por dendriteholdings como espejo público del ganador ("rey") de la subred Ingot de Bittensor, donde los mineros compiten por producir la copia cuantizada más fiel al profesor según métricas de divergencia KL y distancia de estados ocultos.

Su interés es doble: para usuarios, ofrece un modelo de clase 27B en apenas 7,2 GB, ejecutable en GPU de consumo; para investigadores, constituye un caso de estudio de cuantización extrema validada objetivamente (KL de 0,11057 y distancia de estados ocultos de 0,3436 frente al profesor). La contrapartida es una compatibilidad limitada: solo funciona con un fork concreto de llama.cpp (PrismML), ya que el build estándar no puede ejecutarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (detalles exactos no disponibles) |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | no disponible (no consta que sea un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2 (variante exacta no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo único `Ingot-V-27B-Q2.gguf`, 7,2 GB) |

## Arquitectura y entrenamiento

Este modelo no tiene entrenamiento propio: es una cuantización post-entrenamiento de un profesor fijo de clase 27B. El linaje documentado comienza con Ingot-genesis-27B-FP8, coronado como punto de partida el 16 de octubre de 2026, seguido de la versión cuantizada Ingot-genesis-27B-Q2 y de sucesivas entregas de mineros (Ingot-I a Ingot-IV). Ingot-V procede de la submission `6ca14531-09bb-47e5-ba09-fa59369a2bd7` del minero con uid 86, y los pesos se publican "byte a byte" tal como los subió el minero.

El GGUF hereda el layout, el tokenizador y la rotación de Hadamard de Ingot-genesis-27B-Q2. Esta rotación es una técnica de preprocesado de pesos que redistribuye los valores para hacerlos más tolerantes a la cuantización extrema (estilo QuaRot), lo que explica por qué el build estándar de llama.cpp no puede cargarlo. La evaluación de la subred mide, por token de respuesta, la divergencia KL de las distribuciones de siguiente token frente al profesor y la distancia relativa de estados ocultos promediada cada 8 capas. No se ha publicado información sobre datos de entrenamiento del profesor, número de tokens ni procesos de RLHF/DPO.

## Capacidades

- Generación de texto conversacional: la ficha lo etiqueta como `conversational` y se despliega con `llama-server` usando plantillas de chat Jinja (`--jinja`).
- Soporte de flash attention en el fork de PrismML mediante la opción `-fa on`.
- Entrada de imágenes de forma experimental: el archivo es solo el modelo de texto; para visión hay que añadir como proyector el `mmproj` de prism-ml/Ternary-Bonsai-2-27B-gguf (en Q8_0 o BF16), diseñado para genesis y no para estos pesos, con calidad sin probar.
- Tool calling / function calling: no disponible, no consta soporte.
- Agentes y razonamiento multi-paso: no disponible, sin datos publicados.
- Capacidades multilingües: no disponible.

## Casos de uso

- Chat privado y local en GPU de consumo: con 7,2 GB de pesos, el modelo cabe íntegramente en una GPU de 12 GB (RTX 3060 12 GB, RTX 4070), lo que permite un asistente conversacional sin envío de datos a terceros vía `llama-server`.
- Investigación en cuantización extrema: al publicarse métricas de fidelidad (KL y distancia de estados ocultos) frente al profesor BF16/FP8, es un banco de pruebas realista para comparar métodos de cuantización Q2 y rotaciones de Hadamard.
- Verificación y reproducción de resultados de la subred Ingot: investigadores del ecosistema Bittensor pueden reproducir la evaluación exacta clonando el fork de PrismML en el commit `e3de715` y contrastar las métricas del rey.
- Servidor LLM autoalojado con API: `llama-server` expone un endpoint local que puede integrarse en aplicaciones propias sin dependencias adicionales.
- Prototipado multimodal experimental: añadiendo el `mmproj` de Ternary-Bonsai-2-27B se puede explorar entrada de imágenes, aunque con la advertencia explícita de que la calidad visual no está testada.
- Pruebas de compatibilidad de runtimes: es un caso práctico para validar forks de llama.cpp con layouts de pesos no estándar, útil para equipos que mantienen infraestructura de inferencia.
- Despliegue en equipos con VRAM justa: mediante offload parcial de capas (`-ngl`) puede repartirse entre GPU y CPU en máquinas sin una GPU dedicada grande, a costa de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación cuantitativa publicada es la métrica de fidelidad frente al profesor de la subred Ingot:

| Métrica | Ingot-V-27B-Q2 | Rey anterior (misma eval) |
|---|---|---|
| KL(profesor ‖ modelo) por token | 0,11057 | 0,11227 |
| Distancia de estados ocultos relativa | 0,3436 | 0,3565 |

Además, es un 14,6 % más cercano en KL y un 24,1 % más cercano en distancia de estados ocultos que Ingot-genesis-27B-Q2. Un valor de KL de 0,11 indica una desviación medible respecto al profesor, coherente con una cuantización de 2 bits.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 7,2 GB; ejecutándolo íntegramente en GPU conviene disponer de 10-12 GB de VRAM para pesos, caché KV y overhead. Es una estimación derivada del tamaño del archivo, no un dato oficial.
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 como mínimo cómodo; RTX 4090 con holgura amplia. También válidas GPUs de datacenter (A100, H100), aunque desproporcionadas para este tamaño.
- Consumer GPUs: sí, cabe en GPUs de 12 GB; en GPUs de 8 GB requerirá offload parcial de capas a CPU con `-ngl`, con penalización notable de velocidad al ser un modelo de 26,9 B.
- Despliegue: exclusivamente mediante el fork PrismML de llama.cpp en el commit `e3de715`, compilado con `-DGGML_CUDA=ON`. No funciona con el llama.cpp estándar ni, por extensión, con herramientas basadas en él (Ollama, LM Studio); vLLM y TGI no soportan este formato GGUF con rotación de Hadamard.
- Comando de referencia: `build/bin/llama-server -m Ingot-V-27B-Q2.gguf -ngl 99 -fa on --jinja`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | KL vs profesor | Distancia oculta | Licencia |
|---|---|---|---|---|---|
| Ingot-V-27B-Q2 | 26,9 B | GGUF Q2 | 0,11057 | 0,3436 | no disponible |
| Ingot-genesis-27B-Q2 | no disponible (clase 27B) | GGUF Q2 | V es un 14,6 % más cercano | V es un 24,1 % más cercano | no disponible |
| Rey anterior (no identificado en la model card) | no disponible | GGUF Q2 | 0,11227 | 0,3565 | no disponible |

Existen además otros reyes de la misma subred (Ingot-I-27B-Q2, Ingot-IV-27B-Q2), pero sus métricas y especificaciones detalladas no están disponibles en la información proporcionada. Frente a modelos 27B convencionales (Gemma, Qwen de tamaño similar), esta ficha no puede establecer comparación de rendimiento por falta de benchmarks comunes.

## Limitaciones y advertencias

- Compatibilidad muy restringida: solo ejecuta con el fork PrismML de llama.cpp en un commit concreto; cualquier actualización del fork puede romper la ejecución, y el ecosistema estándar (llama.cpp oficial, Ollama, LM Studio, vLLM, TGI) no lo soporta.
- Degradación inherente a Q2: las métricas de fidelidad (KL 0,11, distancia oculta 0,34) confirman una desviación apreciable respecto al profesor; es esperable pérdida de precisión en razonamiento, código y matemáticas frente al modelo sin cuantizar.
- Licencia no declarada: sin términos de licencia, el uso comercial y la redistribución conllevan riesgo legal. Los pesos proceden de la subida de un minero identificado solo por su hotkey de Bittensor, lo que añade incertidumbre de procedencia.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, y sin benchmarks estándar publicados.
- Visión sin probar: el proyector `mmproj` fue creado para genesis, no para estos pesos, y la subred solo evalúa el modelo de texto.
- Idiomas soportados, longitud de contexto y plantilla de chat exactas: desconocidos.
- Riesgo de alucinación: no hay información publicada sobre alineación (RLHF/DPO) del profesor ni evaluaciones de veracidad, por lo que deben aplicarse las cautelas habituales en producción (supervisión, grounding, filtros).
- Sesgos conocidos: no disponible, sin auditorías publicadas.

## Enlaces

- Ficha del modelo: https://huggingface.co/dendriteholdings/Ingot-V-27B-Q2
- Modelo genesis (referencia de layout y tokenizador): https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Proyector de visión (mmproj): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp requerido (commit exacto): https://github.com/PrismML-Eng/llama.cpp/commit/e3de715222b2667c54a267441159a5729f11155e
- Panel de la subred Ingot en Subnet Alpha: https://subnetalpha.ai/subnet/ingot/
- Dashboard en vivo de la subred: https://theingot.ai
- Modelo hermano Ingot-I-27B-Q2: https://huggingface.co/dendriteholdings/Ingot-I-27B-Q2
- Modelo hermano Ingot-IV-27B-Q2: https://huggingface.co/dendriteholdings/Ingot-IV-27B-Q2
