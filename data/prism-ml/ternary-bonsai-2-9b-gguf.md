# prism-ml/Ternary-Bonsai-2-9B-gguf

## Resumen

Bonsai 2 Ternary 9B es un modelo vision-lenguaje de clase 9B desarrollado por Prism ML (prism-ml) que aplica cuantización ternaria a los pesos del transformer, con valores restringidos a {−1, 0, +1} y escalas de grupo en FP16. Deriva del modelo base Qwen/Qwen3.5-9B, cuya arquitectura se mantiene sin cambios: atención híbrida (3 capas de atención lineal por cada capa de atención completa), MLP SwiGLU, RoPE y RMSNorm. El resultado es un modelo de ~8,95B parámetros en el lenguaje más una torre de visión de ~0,46B, empaquetado en GGUF con un tamaño de solo 2,00–2,56 GB para el modelo de lenguaje, frente a los ~17,9 GB que ocuparía en FP16.

La propuesta central es la inferencia en dispositivo (on-device) con requisitos de memoria muy reducidos: los pesos ternarios nunca se expanden a FP16 en tiempo de ejecución, sino que kernels personalizados los consumen directamente. Se ofrecen tres empaquetados del mismo conjunto de pesos (PTQ1_0, PQ2_0 y Q2_0), que difieren únicamente en el layout de almacenamiento y la velocidad del kernel. Hereda del modelo base una ventana de contexto de 262.144 tokens y capacidad de entrada de imagen mediante un paquete mmproj separado.

Es relevante ahora porque demuestra que un modelo multimodal de casi 9B puede ejecutarse con una huella de memoria inferior a 3 GB, abriendo la puerta a despliegues en hardware de consumo, portátiles y dispositivos con GPU integrada, manteniendo contexto largo y visión. La licencia Apache 2.0 y la compatibilidad parcial con llama.cpp upstream facilitan su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de atención híbrida (3 capas de atención lineal : 1 de atención completa), SwiGLU MLP, RoPE, RMSNorm; pesos ternarios con rotación Hadamard por bloques |
| Parametros totales | ~8,95B (modelo de lenguaje) + ~0,46B (torre de visión); el dato de safetensors del repo indica 1.470.621.184, inconsistente con la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | PTQ1_0 (trits densos, ~1,78 bits/peso), PQ2_0 (slots de 2 bits, ~2,16 bits/peso), Q2_0 (~2,28 bits/peso); mmproj en Q8_0 o BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); tensores de normalización y ruta de estado de atención lineal en F32 |

## Arquitectura y entrenamiento

La arquitectura replica la del backbone Qwen3.5-9B: 32 bloques con dimensión oculta 4096, embedding y LM head separados, y una combinación de 24 capas de atención lineal y 8 de atención completa. La innovación principal es la ternarización de los pesos de lenguaje (embeddings, proyecciones de atención, proyecciones MLP y LM head) con escalas de grupo en FP16. Para preservar la calidad, los pesos se almacenan tras aplicar una rotación Hadamard por bloques que se pliega en el tensor guardado; en tiempo de ejecución, el kernel aplica la transformación correspondiente a las activaciones. Los tensores de normalización y la ruta de estado de la atención lineal (`ssm_alpha`, `ssm_beta`) permanecen en F32 para evitar degradación.

La torre de visión se distribuye por separado como paquete mmproj (Q8_0 recomendado de 0,62 GB, o BF16 de 0,92 GB como referencia de precisión) y solo se carga cuando llega una imagen, lo que permite mantener un consumo de memoria bajo en cargas puramente textuales. El repositorio incluye además un cabezal MTP (multi-token prediction) opcional integrado en el archivo PQ2_0-MTP y un drafter de bloques DFlash2 opcional, orientados a decodificación especulativa. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con soporte de modo "thinking" activable o desactivable mediante `enable_thinking` en el template de chat.
- Comprensión de imágenes y texto (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y lectura de texto en imágenes.
- Procesamiento de contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) mediante `llama-server`.
- Soporte de decodificación especulativa mediante cabezal MTP integrado y drafter DFlash2 opcional.
- Ejecución en CUDA, Metal y CPU a través de llama.cpp (fork de PrismML; Q2_0 también en upstream desde b11556).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistentes en dispositivo con visión: un portátil o mini-PC con GPU integrada puede cargar el modelo de lenguaje (2,42 GB en PQ2_0) más el mmproj Q8_0 (0,62 GB) y responder preguntas sobre capturas de pantalla o fotos sin conexión a la nube, gracias a la huella de memoria total inferior a 3,1 GB.
- Análisis de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o transcripciones extensas y responder preguntas sobre ellos en una sola pasada, sin fragmentación.
- Atención al cliente automatizada: el servidor compatible con OpenAI permite desplegar conversaciones multi-turno con historial largo; el modo thinking desactivable reduce latencia en respuestas simples y lo activa en consultas complejas.
- Procesamiento de texto en imágenes: digitalización de facturas, tickets o formularios escaneados usando `--image-min-tokens 1024` para mejorar la lectura de texto pequeño y denso.
- Prototipado e investigación en cuantización extrema: los tres empaquetados (PTQ1_0, PQ2_0, Q2_0) del mismo conjunto de pesos permiten comparar layouts de almacenamiento y velocidad de kernel manteniendo idéntica calidad, útil para estudiar el impacto de la ternarización.
- Despliegue en entornos con restricciones de memoria: servidores edge, dispositivos embebidos con GPU o contenedores con límites estrictos de VRAM/RAM se benefician de un modelo multimodal de 9B que cabe en menos de 3 GB.
- Generación asistida con decodificación especulativa: el cabezal MTP integrado o el drafter DFlash2 permiten acelerar la generación en producción cuando la latencia es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,0 GB (PTQ1_0), ~2,4 GB (PQ2_0) o ~2,6 GB (Q2_0) para el modelo de lenguaje; añadir 0,62 GB (mmproj Q8_0) o 0,92 GB (BF16) si se usa visión. El archivo MTP ocupa 2,68 GB y el drafter DFlash2 1,57 GB adicionales.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal; el modelo cabe holgadamente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, A100 y H100. El límite práctico lo marca la memoria, no la potencia de cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM; también en Apple Silicon vía Metal y en CPU.
- Opciones de despliegue: llama.cpp (fork PrismML-Eng/llama.cpp, rama `prism`, para todos los archivos; upstream llama.cpp b11556 o superior solo para Q2_0), `llama-cli`, `llama-mtmd-cli` (imagen + texto) y `llama-server` (API compatible con OpenAI). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B | ~8,95B + 0,46B visión | 262.144 | Ternaria (PTQ1_0/PQ2_0/Q2_0), GGUF | Apache 2.0 | Hugging Face, llama.cpp |
| Qwen3.5-9B (base) | ~9B | 262.144 | FP16/BF16 y cuantizaciones estándar | No disponible | Hugging Face |
| Alternativas ternarias de clase 9B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otras alternativas ternarias comparables en la información proporcionada; la comparación con el modelo base se limita a arquitectura, contexto y licencia.

## Limitaciones y advertencias

- La ternarización extrema (~1,78–2,28 bits/peso) implica una pérdida de precisión frente al modelo base en FP16; no se han publicado evaluaciones cuantitativas que permitan medir esa degradación.
- El dato de parámetros totales de safetensors (1.470.621.184) no coincide con los ~8,95B declarados en la model card; conviene verificar la integridad del repositorio antes de desplegar.
- El paquete mmproj BF16 puede provocar caídas de `llama-server` con varias peticiones de imagen concurrentes según la model card; se recomienda usar Q8_0 en producción.
- PTQ1_0 y PQ2_0 requieren el fork PrismML-Eng/llama.cpp; solo Q2_0 funciona en llama.cpp upstream desde b11556, lo que limita la portabilidad y añade dependencia de un fork.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe homogéneo.
- Soporte de tool calling y function calling: no disponible en la documentación; verificar antes de integrarlo en pipelines de agentes.
- La licencia Apache 2.0 permite uso comercial, pero el fork de llama.cpp y los kernels ternarios deben evaluarse por separado en cuanto a su licencia y mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Web de Prism ML: https://prismml.com
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
- Releases del fork: https://github.com/PrismML-Eng/llama.cpp/releases/latest
- llama.cpp upstream b11556: https://github.com/ggml-org/llama.cpp/releases/tag/b11556
- Discord: https://discord.gg/prismml
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
