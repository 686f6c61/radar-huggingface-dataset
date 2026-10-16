# prism-ml/Ternary-Bonsai-2-2B-gguf

## Resumen

Ternary-Bonsai-2-2B es un modelo de visión y lenguaje (pipeline image-text-to-text) de la clase 2B desarrollado por Prism ML, distribuido en formato GGUF para llama.cpp. Deriva de Qwen3.5-2B manteniendo la arquitectura intacta, pero sustituye los pesos del transformer por pesos ternarios {−1, 0, +1} con escalas FP16 por grupo, lo que reduce el modelo de lenguaje de aproximadamente 3,8 GB en FP16 a entre 0,43 y 0,55 GB según el empaquetado.

La arquitectura conserva el esquema de atención híbrida del modelo base (18 capas de atención lineal y 6 de atención completa, en proporción 3:1), con MLP SwiGLU, RoPE y RMSNorm, y una torre de visión de 24 bloques que se carga como paquete mmproj independiente solo cuando llega una imagen. El contexto heredado es de 262.144 tokens. Los pesos ternarios no se expanden nunca a FP16: se consumen directamente mediante kernels personalizados incluidos en el fork PrismML-Eng/llama.cpp (rama prism), con soporte para CUDA, Metal y CPU.

Su relevancia actual está en el despliegue multimodal en el borde: un modelo con entrada de imagen y ventana de 262K tokens que ocupa menos de 0,6 GB de pesos y puede ejecutarse en CPU o Apple Silicon, con licencia Apache 2.0. El repositorio acumula 2.839 descargas y 16 likes desde su publicación en septiembre de 2026, con última actualización en octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de atención híbrida (18 capas de atención lineal : 6 capas de atención completa), MLP SwiGLU, RoPE, RMSNorm; 24 bloques, hidden 2048, embedding y LM head atados; torre de visión de 24 bloques |
| Parametros totales | 1.881.825.088 en el modelo de lenguaje (safetensors) + ~0,33B en la torre de visión |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens (heredada de Qwen3.5-2B) |
| Tipos de cuantizacion | Pesos ternarios {−1, 0, +1} con escalas FP16 por grupo, en tres empaquetados GGUF: PTQ1_0 (~1,83 bits/peso), PQ2_0 (~2,20 bits/peso) y Q2_0 (~2,33 bits/peso); tensores de normalización y ruta de estado de atención lineal (ssm_alpha, ssm_beta) en F32; torre de visión en Q8_0 o BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3.5-2B (arquitectura sin cambios) |
| Autor | prism-ml (Prism ML) |
| Tamaño del repositorio | 2,5 GB |
| Ficheros de pesos | Ternary-Bonsai-2-2B-PTQ1_0.gguf (0,43 GB), Ternary-Bonsai-2-2B-PQ2_0.gguf (0,52 GB), Ternary-Bonsai-2-2B-Q2_0.gguf (0,55 GB), Ternary-Bonsai-2-2B-mmproj-Q8_0.gguf (0,36 GB), Ternary-Bonsai-2-2B-mmproj-BF16.gguf (0,67 GB) |
| Backends soportados | llama.cpp (CUDA, Metal, CPU) mediante el fork PrismML-Eng/llama.cpp (rama prism) |
| Fechas | Creado el 23/09/2026; actualizado el 14/10/2026 |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del backbone Qwen3.5-2B: un transformer de 24 bloques con dimensión oculta 2048, atención híbrida que combina 18 capas de atención lineal con 6 capas de atención completa (proporción 3:1), MLP SwiGLU, RoPE y RMSNorm, con el embedding y el LM head atados. La parte de visión es una torre de 24 bloques (~0,33B parámetros) empaquetada por separado en mmproj, de modo que solo se carga cuando la petición incluye una imagen. La innovación principal es la cuantización ternaria: todos los pesos de embeddings, proyecciones de atención, proyecciones MLP y el LM head atado se almacenan como ternarios {−1, 0, +1} con una escala FP16 por grupo, y una rotación de Hadamard por bloques queda plegada en los pesos guardados, de forma que el runtime aplica la transformación correspondiente sobre las activaciones. Los tensores sensibles a precisión (normalización y la ruta de estado de atención lineal, ssm_alpha y ssm_beta) se mantienen en F32.

Los tres empaquetados GGUF contienen exactamente los mismos pesos ternarios y difieren solo en el layout de almacenamiento y en la velocidad de los kernels: PTQ1_0 almacena trits densos, PQ2_0 usa slots de 2 bits y Q2_0 el formato Q2_0. Los kernels personalizados no expanden nunca los pesos a FP16. La model card no proporciona información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si se aplicaron técnicas de alineación como RLHF o DPO; el modelo se presenta como una cuantización posterior al entrenamiento (post-training quantization) del modelo base.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat compatible con llama-server.
- Entrada multimodal imagen-texto: descripción e interpretación de imágenes mediante el paquete mmproj (Q8_0 recomendado o BF16 como referencia de precisión).
- Modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}` en la API compatible con OpenAI.
- Ventana de contexto de 262.144 tokens heredada del modelo base.
- Lectura de texto pequeño o denso en imágenes mediante el aumento del presupuesto de tokens de imagen (`--image-min-tokens 1024`).
- Inferencia cuantizada en CPU, CUDA y Metal sin expansión de los pesos a FP16.
- Servidor con API compatible con OpenAI (`/v1/chat/completions`) mediante llama-server.
- Parámetros de muestreo recomendados por el autor: en modo thinking, temperature 1.0, top_p 0.95, top_k 20, min_p 0.0, presence_penalty 1.0, repetition_penalty 1.0; en modo no thinking, temperature 0.7, top_p 0.80, top_k 20, min_p 0.0, presence_penalty 1.5, repetition_penalty 1.0, aplicando las penalizaciones sobre los últimos 64 tokens.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la información disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas soportados.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente multimodal local en portátil o dispositivo de borde: con 0,52 GB de pesos (PQ2_0) más 0,36 GB de mmproj Q8_0, el modelo completo cabe en un equipo sin GPU dedicada y puede ejecutarse en CPU o en Metal, lo que permite asistentes que ven imágenes sin depender de la nube.
- Análisis de documentos escaneados o capturas con texto denso: subiendo el presupuesto de tokens de imagen con `--image-min-tokens 1024` se mejora la lectura de texto pequeño dentro de la imagen, útil para extraer datos de facturas, etiquetas o formularios.
- Servicio interno con API compatible con OpenAI: llama-server expone `/v1/chat/completions` permitiendo sustituir llamadas a APIs propietarias por un endpoint local, útil en entornos con requisitos de privacidad.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite pasar documentos extensos completos en una sola petición para tareas de resumen o extracción, aunque el rendimiento real en contextos muy largos no está documentado.
- Descripción y clasificación de imágenes por lotes: catálogos de producto, inventario o moderación de contenido, usando el mmproj Q8_0, que según el autor no presenta los problemas de estabilidad del mmproj BF16 cuando se atienden varias peticiones de imagen concurrentes.
- Investigación en cuantización ternaria: los tres empaquetados (PTQ1_0, PQ2_0, Q2_0) contienen los mismos pesos y permiten comparar layout de almacenamiento y velocidad de kernel manteniendo la calidad del modelo constante.
- Demostraciones y prototipos offline de aplicaciones imagen-texto: al no requerir conectividad ni infraestructura de GPU, es adecuado para demos en ferias, entornos aislados o pruebas de concepto con presupuesto de hardware mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de visión, ni comparaciones cuantitativas con el modelo base en FP16, por lo que no es posible estimar la degradación introducida por la cuantización ternaria.

## Requisitos de hardware

- Tamaño de pesos del modelo de lenguaje: 0,43 GB (PTQ1_0), 0,52 GB (PQ2_0) y 0,55 GB (Q2_0).
- Torre de visión: 0,36 GB (mmproj Q8_0, recomendado) o 0,67 GB (mmproj BF16).
- Estimación de VRAM para pesos: por debajo de 1 GB sumando el modelo de lenguaje en PQ2_0 y el mmproj Q8_0; el tamaño de la caché KV para 262.144 tokens no está publicado y depende de la configuración de las 6 capas de atención completa, por lo que la VRAM total en contextos largos no se puede calcular con los datos disponibles. Esta estimación deriva de los tamaños de fichero publicados, no de una tabla oficial del autor.
- GPU: la información disponible solo indica soporte de backends CUDA y Metal; no se especifican modelos de GPU concretos (A100, H100, RTX 4090 u otros).
- GPU de consumo: sí es viable en GPUs de consumo y en Apple Silicon con Metal, dado que los pesos ocupan menos de 1 GB; no se publican requisitos mínimos oficiales.
- CPU: soportado explícitamente.
- Opciones de despliegue: llama.cpp mediante el fork PrismML-Eng/llama.cpp (rama prism) con binarios precompilados por plataforma; llama-cli para texto, llama-mtmd-cli para imagen y texto, y llama-server para el endpoint compatible con OpenAI. El llama.cpp upstream solo ejecuta el fichero Q2_0 (en master reciente, que ya incluye el runtime de activación Hadamard) y rechaza PQ2_0 y PTQ1_0 por tipos desconocidos. La model card menciona también MLX con los mismos parámetros de muestreo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada. La comparación posible se limita a los empaquetados del propio modelo y al modelo base sin cuantizar:

| Modelo / variante | Parametros | Contexto | Tamaño de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-2B PTQ1_0 | ~1,88B LM + ~0,33B visión | 262.144 tokens | 0,43 GB (~1,83 bits/peso) | Apache 2.0 | GGUF; requiere fork PrismML de llama.cpp |
| Ternary-Bonsai-2-2B PQ2_0 | ~1,88B LM + ~0,33B visión | 262.144 tokens | 0,52 GB (~2,20 bits/peso) | Apache 2.0 | GGUF; requiere fork PrismML de llama.cpp |
| Ternary-Bonsai-2-2B Q2_0 | ~1,88B LM + ~0,33B visión | 262.144 tokens | 0,55 GB (~2,33 bits/peso) | Apache 2.0 | GGUF; compatible con llama.cpp upstream reciente |
| Qwen3.5-2B (modelo base, FP16) | ~1,88B LM | 262.144 tokens | ~3,8 GB (referencia citada en la model card) | No disponible en la información | No disponible en la información |

Alternativas de otros fabricantes en la misma categoría (otros modelos ternarios o de 2B con visión): no disponible.

## Limitaciones y advertencias

- No hay benchmarks publicados, por lo que la degradación de calidad frente al modelo base en FP16 no está cuantificada; la pérdida de precisión en tareas de razonamiento o de visión es desconocida.
- El mmproj BF16 puede provocar caídas de llama-server cuando se atienden varias peticiones de imagen simultáneas; el autor recomienda usar el mmproj Q8_0, con calidad casi idéntica.
- Los empaquetados PQ2_0 y PTQ1_0 solo funcionan con el fork PrismML-Eng/llama.cpp (rama prism); el llama.cpp upstream los rechaza como tipos desconocidos y únicamente ejecuta Q2_0 en versiones recientes de master.
- El rendimiento real en contextos cercanos a los 262.144 tokens no está documentado, a pesar de que la longitud de contexto se hereda del modelo base.
- No se declaran idiomas soportados en el repositorio, por lo que no hay garantías documentadas sobre cobertura multilingüe.
- No se documenta soporte de tool calling, function calling ni flujos de agente, lo que limita su uso en pipelines que dependan de estas capacidades.
- La model card no detalla el dataset de entrenamiento, el número de tokens ni el proceso de alineación del modelo base, lo que dificulta evaluar sesgos conocidos; no se documentan sesgos específicos.
- Riesgo de alucinación: inherente a los modelos de la clase 2B y no cuantificado por el autor para este modelo.
- Licencia Apache 2.0 para este repositorio, lo que permite uso comercial; no se especifica en la información disponible la licencia del modelo base Qwen3.5-2B ni posibles condiciones adicionales heredadas.
- Se recomienda fijar los parámetros de muestreo indicados por el autor y pasar la presencia de penalización por línea de comandos o por petición, ya que GGUF no dispone de clave de metadatos para `presence_penalty`.
- El modelo requiere llama.cpp; los pesos ternarios no se pueden cargar en otros runtimes que esperen safetensors en FP16/BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Web de Prism ML: https://prismml.com
- Repositorio de demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con los kernels ternarios (rama prism): https://github.com/PrismML-Eng/llama.cpp
- Binarios precompilados: https://github.com/PrismML-Eng/llama.cpp/releases/latest
- Servidor de Discord: https://discord.gg/prismml
- Paper: no disponible.
- Blog técnico: no disponible.
- Demo online: no disponible (solo el repositorio de demo).
- Nota sobre la búsqueda web: los resultados obtenidos corresponden a productos homónimos sin relación con este modelo (editor LaTeX Prism de OpenAI, GraphPad Prism y Prism Launcher), por lo que no se incluyen como enlaces relevantes.
