# m06ster/Ternary-Bonsai-2-2B-gguf

## Resumen

Ternary-Bonsai-2-2B-gguf es un modelo vision-lenguaje de clase 2B con pesos ternarios {-1, 0, +1} en el transformer de lenguaje, empaquetado en formato GGUF para su ejecución en llama.cpp sobre CUDA, Metal y CPU. Lo publica el usuario m06ster bajo el paraguas del proyecto Bonsai de Prism ML, y deriva del modelo base Qwen/Qwen3.5-2B sin alterar la arquitectura: 24 bloques, dimensión oculta 2048, atención híbrida (18 capas de atención lineal y 6 de atención completa), MLP SwiGLU, RoPE y RMSNorm.

El problema que resuelve es el despliegue de un VLM con contexto muy largo en hardware modesto. El modelo de lenguaje ocupa entre 0,43 GB (PTQ1_0) y 0,55 GB (Q2_0), frente a los ~3,8 GB que requeriría en FP16, gracias a la cuantización ternaria con escalas FP16 por grupo y a una rotación Hadamard por bloques plegada en los pesos. La torre de visión se distribuye aparte como mmproj opcional (Q8_0 de 0,36 GB o BF16 de 0,67 GB) y solo se carga cuando llega una imagen.

Es relevante ahora porque demuestra que un VLM de 262.144 tokens de contexto puede caber en menos de 1 GB de pesos de lenguaje y ejecutarse en portátiles y dispositivos de borde, con backend compatible con la API OpenAI mediante llama-server. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa en proporción 3:1, SwiGLU MLP, RoPE, RMSNorm; pesos ternarios con escalas FP16 por grupo |
| Parametros totales | 1.881.825.088 en el modelo de lenguaje (~1,88B) más ~0,33B de la torre de visión |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (heredada de Qwen3.5-2B) |
| Tipos de cuantizacion | Ternaria 2-bit en tres empaquetados: PTQ1_0 (trits densos, ~1,83 bits/peso), PQ2_0 (slots de 2 bits, ~2,20 bits/peso) y Q2_0 (~2,33 bits/peso); tensores de normalización y ruta de estado de atención lineal en F32; mmproj en Q8_0 o BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); ficheros PTQ1_0, PQ2_0, Q2_0 y mmproj Q8_0/BF16 |

## Arquitectura y entrenamiento

La arquitectura replica la de Qwen3.5-2B: 24 bloques con atención híbrida, donde 18 capas usan atención lineal y 6 usan atención completa, lo que permite sostener 262.144 tokens de contexto con un coste de memoria y cómputo contenido. El modelo de lenguaje tiene dimensión oculta 2048 y embedding y cabeza LM atados. La torre de visión consta de 24 bloques y se sirve como proyector multimodal independiente.

La innovación principal está en la representación de pesos: todas las proyecciones de atención, MLP, embeddings y cabeza LM se almacenan como ternarios {-1, 0, +1} con una escala FP16 por grupo, y los núcleos personalizados las consumen directamente sin expandirlas a FP16 en ningún momento. Los pesos incorporan una rotación Hadamard por bloques, de modo que el runtime aplica la transformación equivalente sobre las activaciones; esto es lo que exige que el llama.cpp de origen sea la versión b11556 o posterior. Los tensores de normalización y la ruta de estado de la atención lineal (ssm_alpha, ssm_beta) permanecen en F32. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo es una cuantización del base, no un reentrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno con hasta 262.144 tokens de contexto.
- Comprensión de imágenes y respuesta image-text-to-text mediante la torre de visión y el proyector mmproj.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-2B.
- Modo thinking controlable mediante el parámetro `chat_template_kwargs.enable_thinking` en la API compatible con OpenAI.
- Despliegue como servidor con endpoint `/v1/chat/completions` de llama-server, incluyendo entrada de imagen por URL.
- Ejecución en CUDA, Metal y CPU con el fork de PrismML; el fichero Q2_0 funciona además en llama.cpp upstream desde b11556.
- Ajuste del presupuesto de tokens de imagen con `--image-min-tokens` para texto pequeño o denso en las imágenes.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente documental con contexto largo: con 262.144 tokens se puede cargar un manual técnico completo o varios informes y mantener una conversación de seguimiento sin truncar, algo viable en un portátil porque los pesos de lenguaje ocupan 0,52 GB en PQ2_0.
- Descripción y extracción de información de imágenes en el borde: un dispositivo con GPU integrada o Apple Silicon puede cargar el modelo y el mmproj Q8_0 (0,36 GB) y procesar capturas, facturas o etiquetas localmente, sin enviar datos a la nube.
- Servidor interno compatible con OpenAI: llama-server expone `/v1/chat/completions`, de modo que aplicaciones ya escritas contra la API de OpenAI pueden apuntar a `http://localhost:8080` y enviar mensajes con imagen sin cambios de código.
- Prototipado rápido de aplicaciones multimodales: el tamaño reducido permite levantar y bajar el modelo en segundos durante el desarrollo, con los tres empaquetados intercambiables para comparar velocidad de kernel sin cambiar de pesos.
- Asistencia en movilidad o entornos sin conectividad: al ejecutarse en CPU y Metal, encaja en escenarios de campo donde no hay red y se requiere análisis de texto e imagen con contexto amplio.
- Evaluación de cuantización ternaria en pipelines de investigación: los ficheros PTQ1_0, PQ2_0 y Q2_0 contienen los mismos pesos con distinto layout, lo que permite medir el impacto del formato de almacenamiento en latencia y calidad con un único modelo de referencia.
- Procesamiento por lotes de documentos escaneados: subiendo `--image-min-tokens 1024` se mejora la lectura de texto pequeño en imágenes densas, útil para digitalización y clasificación de formularios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el modelo de lenguaje: 0,43 GB (PTQ1_0), 0,52 GB (PQ2_0) o 0,55 GB (Q2_0) en disco; en ejecución hay que sumar el estado KV y las activaciones, que dependen de la longitud de contexto configurada.
- VRAM adicional para visión: 0,36 GB con mmproj Q8_0 (recomendado) o 0,67 GB con mmproj BF16.
- Cabe en cualquier GPU de consumo con al menos 2 GB libres, incluidas GTX 1650, RTX 3050, RTX 4060 y RTX 4090; también en Apple Silicon vía Metal y en CPU.
- En el ejemplo de servidor de la model card se usa `-c 32768`, muy por debajo del máximo de 262.144 tokens; contextos largos incrementan proporcionalmente la memoria del estado KV.
- Despliegue con llama.cpp: `llama-cli` para texto, `llama-mtmd-cli` para imagen más texto y `llama-server` para API compatible con OpenAI. El fork PrismML-Eng/llama.cpp (rama `prism`) ejecuta los tres empaquetados; llama.cpp upstream desde b11556 solo ejecuta Q2_0.
- Compilación con `-DGGML_CUDA=ON` para NVIDIA; en macOS Metal es el backend por defecto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-2B (este) | ~1,88B LM + ~0,33B visión | 262.144 | GGUF ternario, 0,43-0,55 GB LM + 0,36 GB mmproj | Apache 2.0 | Visión y contexto largo en menos de 1 GB de pesos de lenguaje |
| Qwen/Qwen3.5-2B (base) | ~2B | 262.144 | Safetensors en FP16/BF16, ~3,8 GB según la model card | No disponible en la información | Referencia de precisión; sin cuantización ternaria |
| Alternativas GGUF de 2 bits para llama.cpp | No disponible | No disponible | Q2_K y similares | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Publicación sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de calidad.
- La cuantización ternaria degrada la precisión respecto al base Qwen3.5-2B; no se han publicado métricas que cuantifiquen esa pérdida.
- El mmproj BF16 puede provocar caídas de llama-server con varias peticiones de imagen concurrentes según la model card; se recomienda Q8_0 en producción.
- PTQ1_0 y PQ2_0 solo funcionan con el fork PrismML-Eng/llama.cpp; llama.cpp upstream los rechaza como tipos desconocidos.
- Usar una versión de llama.cpp anterior a b11556 con el fichero Q2_0 produce salidas incorrectas sin aviso, porque falta el runtime de activaciones Hadamard.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado.
- Riesgo de alucinación inherente a un modelo de 2B, especialmente en razonamiento complejo y en lectura de texto pequeño en imágenes.
- Sesgos: no documentados en la información disponible.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-2B antes de un uso comercial.
- El contexto máximo de 262.144 tokens exige memoria adicional para el estado KV; el ejemplo de servidor de la model card se limita a 32.768 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m06ster/Ternary-Bonsai-2-2B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Web de Prism ML: https://prismml.com
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Release de llama.cpp upstream con soporte Hadamard: https://github.com/ggml-org/llama.cpp/releases/tag/b11556
- Discord del proyecto: https://discord.gg/prismml
