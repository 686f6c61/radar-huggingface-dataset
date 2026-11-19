# prism-ml/Ternary-Bonsai-2-4B-gguf

## Resumen

Bonsai 2 Ternary 4B es un modelo vision-lenguaje de clase 4B cuyos pesos del transformer han sido cuantizados a valores ternarios ({−1, 0, +1}) con escalas de grupo en FP16. Lo desarrolla Prism ML y se distribuye exclusivamente en formato GGUF para su ejecución en llama.cpp sobre CUDA, Metal y CPU. Su interés principal es la compresión extrema: el modelo de lenguaje ocupa entre 0,95 GB y 1,21 GB según el empaquetado, frente a los aproximadamente 8,4 GB que requeriría en FP16.

El modelo deriva de Qwen3.5-4B sin modificar la arquitectura: mantiene el backbone de atención híbrida (24 capas de atención lineal y 8 de atención completa), MLP SwiGLU, RoPE y RMSNorm, con 262.144 tokens de contexto. Sobre esa base se añade una torre de visión de unos 0,33B parámetros que se carga de forma opcional mediante un paquete mmproj separado.

Es relevante ahora porque demuestra que un VLM con contexto de 262K puede ejecutarse en hardware de consumo con un consumo de memoria inferior a 2 GB para los pesos del lenguaje, manteniendo entrada de imagen y un servidor compatible con la API de OpenAI. La licencia Apache 2.0 y la disponibilidad de kernels propios en un fork de llama.cpp facilitan su evaluación en entornos de producción con restricciones severas de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (3 capas de atención lineal : 1 de atención completa), SwiGLU MLP, RoPE, RMSNorm |
| Parametros totales | ~4,21B en el modelo de lenguaje (32 bloques, hidden 2560, embedding/LM head atados) + ~0,33B en la torre de visión (24 bloques). El dato de safetensors del repo indica 782.004.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (heredada de Qwen3.5-4B) |
| Tipos de cuantizacion | Ternaria {−1, 0, +1} con escalas de grupo FP16, empaquetada como PTQ1_0 (~1,81 bits/peso), PQ2_0 (~2,18 bits/peso) y Q2_0 (~2,31 bits/peso); tensores de normalización y ruta de estado de atención lineal en F32; mmproj en Q8_0 o BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (PTQ1_0, PQ2_0, Q2_0, mmproj Q8_0/BF16, MTP Q8_0, DFlash2 BF16) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-4B sin cambios estructurales: 32 bloques con atención híbrida en proporción 3:1 entre atención lineal y atención completa, MLP SwiGLU, RMSNorm y RoPE, con embedding y LM head atados. La innovación está en la representación de pesos: todas las proyecciones de atención, MLP, embeddings y LM head se almacenan como trits con una escala de grupo en FP16, y se aplica una rotación de Hadamard por bloques plegada en los pesos, de modo que el runtime aplica la transformación correspondiente a las activaciones. Los tensores de normalización y la ruta de estado de la atención lineal (`ssm_alpha`, `ssm_beta`) se mantienen en F32.

Los tres empaquetados (PTQ1_0, PQ2_0 y Q2_0) contienen exactamente los mismos pesos ternarios y difieren solo en el layout de almacenamiento y la velocidad de los kernels; nunca se expanden a FP16 en tiempo de ejecución. El modelo incluye soporte opcional de decodificación especulativa mediante un cabezal MTP integrado (archivo PQ2_0-MTP-Q8_0) y un drafter de bloques DFlash2 en BF16. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo de pensamiento activable o desactivable mediante `enable_thinking` en el template de chat.
- Comprensión de imágenes (image-text-to-text) a través de la torre de visión: descripción de escenas, lectura de texto en imágenes y respuesta a preguntas sobre el contenido visual.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos, historiales de conversación prolongados o múltiples imágenes en una misma sesión.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con entrada multimodal por `image_url`, lo que facilita la integración con clientes existentes.
- Decodificación especulativa mediante cabezal MTP y drafter DFlash2 para reducir latencia en el fork de Prism ML.
- Ejecución en CUDA, Metal y CPU, con soporte de `Q2_0` en llama.cpp upstream desde la release b11556.
- No se documenta soporte explícito de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Asistencia en dispositivos sin GPU dedicada: con 1,15 GB en PQ2_0 y ejecución en CPU o Metal, el modelo puede desplegarse en portátiles y equipos de gama media para tareas de descripción de imágenes y resumen de documentos.
- Procesamiento de documentos largos con contexto de 262K tokens: informes, contratos o expedientes completos caben en una sola ventana, evitando estrategias de chunking y recuperación.
- Digitalización y extracción de información de capturas y escaneos: la torre de visión permite leer texto en imágenes, y el parámetro `--image-min-tokens 1024` mejora el rendimiento con texto pequeño o denso.
- Prototipado rápido de aplicaciones multimodales: el servidor OpenAI-compatible permite sustituir un endpoint en la nube por una instancia local sin reescribir el cliente.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con pesos de poco más de 1 GB, las imágenes y el texto no salen del dispositivo, lo que encaja en escenarios sanitarios o industriales.
- Evaluación de cuantización ternaria en pipelines de investigación: los tres empaquetados permiten comparar precisión y velocidad de kernels sobre los mismos pesos sin cambiar de modelo.
- Inferencia de bajo coste en edge con múltiples instancias: el reducido tamaño de pesos permite alojar varias réplicas en una sola GPU o nodo, útil para servicios de clasificación y captioning a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos del lenguaje ocupan 0,95 GB (PTQ1_0), 1,15 GB (PQ2_0) o 1,21 GB (Q2_0); la torre de visión añade 0,37 GB (Q8_0) o 0,68 GB (BF16). Con caché KV para 32.768 tokens hay que sumar memoria adicional no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU compatible con CUDA o Metal; el fork de Prism ML cubre ambos backends. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- GPU de consumo: sí cabe en GPU de consumo, dado que el conjunto de pesos ronda los 1,5 GB con el mmproj Q8_0. No se detallan modelos mínimos.
- Opciones de despliegue: llama.cpp mediante el fork PrismML-Eng (rama `prism`), con binarios `llama-cli`, `llama-mtmd-cli` y `llama-server`; el archivo Q2_0 también funciona en llama.cpp upstream desde b11556. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. La documentación solo indica que PTQ1_0, PQ2_0 y Q2_0 difieren en velocidad de kernel, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-4B | ~4,21B LM + ~0,33B vision | 262.144 | Sí (mmproj) | Apache 2.0 | GGUF ternario |
| Qwen3.5-4B (base) | ~4B | 262.144 | No disponible | No disponible | No disponible |
| Alternativas de clase 4B en GGUF de 2 bits | No disponible | No disponible | No disponible | No disponible | GGUF |

La comparación directa con otras alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de referencia documentado es el propio Qwen3.5-4B, del que este modelo hereda arquitectura y contexto pero del que no se detallan pesos, licencia ni formato de distribución.

## Limitaciones y advertencias

- La cuantización ternaria introduce pérdida de precisión frente al modelo base; no se han publicado evaluaciones que cuantifiquen esa degradación.
- El uso de BF16 en el mmproj puede provocar caídas de `llama-server` con varias peticiones de imagen concurrentes según la documentación; se recomienda Q8_0.
- Los archivos PTQ1_0 y PQ2_0 requieren el fork PrismML-Eng de llama.cpp; solo Q2_0 funciona en upstream desde b11556, lo que limita la portabilidad.
- No se documentan sesgos conocidos, comportamiento multilingüe ni tasas de alucinación; la lista de idiomas soportados no está disponible.
- El dato de parámetros de safetensors del repositorio (782.004.736) no coincide con los ~4,21B declarados en la model card; conviene verificar el conteo real antes de dimensionar el despliegue.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3.5-4B podría tener condiciones adicionales no reflejadas en la información disponible; conviene revisarlas antes de un uso comercial.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines que dependan de esas capacidades.
- El contexto de 262K tokens exige memoria adicional para la caché KV no cuantificada; en producción conviene limitar `-c` a valores realistas (por ejemplo, 32.768) para evitar desbordamientos de VRAM.

## Enlaces

- Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Web de Prism ML: https://prismml.com
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
- Releases del fork: https://github.com/PrismML-Eng/llama.cpp/releases/latest
- llama.cpp upstream b11556: https://github.com/ggml-org/llama.cpp/releases/tag/b11556
- Discord: https://discord.gg/prismml
