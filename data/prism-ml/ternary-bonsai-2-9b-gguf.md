# prism-ml/Ternary-Bonsai-2-9B-gguf

## Resumen

Ternary-Bonsai-2-9B es un modelo vision-lenguaje derivado de Qwen/Qwen3.5-9B en el que todos los pesos del transformer de lenguaje (embeddings, proyecciones de atención, proyecciones MLP y LM head) se han ternarizado a valores {-1, 0, +1} con escalas FP16 por grupos. Lo publica prism-ml y se distribuye exclusivamente en formato GGUF con empaquetados propios (PTQ1_0, PQ2_0 y Q2_0) que se consumen directamente en kernels personalizados sin expandirse nunca de vuelta a FP16. El resultado es un modelo de clase 9B que ocupa entre 2,00 GB y 2,56 GB en disco, frente a los ~17,9 GB que ocuparía a FP16, lo que lo sitúa en el rango de despliegue en dispositivo y en GPUs de consumo.

El modelo conserva la arquitectura híbrida de atención de su base: 32 bloques con una proporción 3:1 entre capas de atención lineal (24 capas) y capas de atención completa (8 capas), MLP SwiGLU, RoPE y RMSNorm, con una longitud de contexto heredada de 262.144 tokens. Incluye además una torre de visión opcional de ~0,46B parámetros y 27 bloques, empaquetada por separado como mmproj, que solo se carga cuando llega una imagen. La licencia es Apache 2.0.

Su relevancia actual está en la combinación de tres factores poco habituales: cuantización ternaria nativa con kernels propios en llama.cpp (CUDA, Metal y CPU), contexto de 262K tokens heredado sin cambios de arquitectura, y soporte multimodal de imagen y texto. El autor publica además un cabezal MTP (multi-token prediction) y un drafter DFlash2 para decodificación especulativa, lo que apunta a un caso de uso centrado en inferencia local de bajo coste con razonamiento largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención (3 capas de atención lineal : 1 capa de atención completa), MLP SwiGLU, RoPE, RMSNorm; 32 bloques, hidden 4096, embedding y LM head separados |
| Parametros totales | ~8,95B en el modelo de lenguaje + ~0,46B en la torre de visión (según la model card). El metadato de safetensors del repositorio indica 1.470.621.184 parametros, una cifra no coherente con la anterior; se recomienda tratar el dato de safetensors como no fiable |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 262.144 tokens (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | Ternaria {-1, 0, +1} con escalas FP16 por grupos, en tres empaquetados: PTQ1_0 (~1,78 bits/peso), PQ2_0 (~2,16 bits/peso), Q2_0 (~2,28 bits/peso). Tensores en F32: pesos de normalización y ruta de estado de atención lineal (ssm_alpha, ssm_beta). Torre de visión en Q8_0 o BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (PTQ1_0, PQ2_0, Q2_0; mmproj en Q8_0 y BF16; MTP en Q8_0; DFlash2 en Q8_0) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-9B sin cambios estructurales: 32 bloques con atención híbrida en proporción 3:1, es decir, 24 capas de atención lineal y 8 capas de atención completa, más MLP SwiGLU, RoPE y RMSNorm. El modelo base queda descrito como columna vertebral de atención híbrida, y Bonsai 2 lo que hace es ternarizar los pesos y reorganizar su almacenamiento, no rediseñar la red. Las innovaciones técnicas concretas que documenta el autor son dos. La primera es la base de pesos: se aplica una rotación de Hadamard por bloques que queda plegada dentro de los pesos almacenados, y el runtime aplica la transformación correspondiente a las activaciones. La segunda es el formato de empaquetado: los mismos pesos ternarios se ofrecen en tres layouts (PTQ1_0 con trits densos, PQ2_0 con slots de 2 bits y Q2_0) que se consumen directamente en kernels personalizados y nunca se expanden a FP16.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se detalla el proceso de ternarización (si fue quantization-aware training, post-training quantization o una mezcla). La model card sí indica que el modelo conserva el modo thinking del base, con parámetros de muestreo diferenciados para modo thinking (temperature 1,0, top_p 0,95, top_k 20, presence_penalty 1,0) y modo no thinking (temperature 0,7, top_p 0,80, top_k 20, presence_penalty 1,5), aplicando las penalizaciones sobre los últimos 64 tokens.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia del base y conmutador `enable_thinking` para activar o desactivar el modo razonamiento.
- Razonamiento explícito en modo thinking, heredado del modelo base Qwen3.5-9B.
- Comprensión de imagen y texto (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas sobre una imagen y lectura de texto en imágenes, con presupuesto de tokens de imagen ajustable mediante `--image-min-tokens`.
- Contexto largo: 262.144 tokens heredados, útil para documentos extensos o conversaciones muy largas.
- Decodificación especulativa: el autor publica un cabezal MTP integrado (archivo PQ2_0-MTP) y un drafter de bloques DFlash2 opcional.
- Inferencia en dispositivo: kernels ternarios propios para CUDA, Metal y CPU a través del fork PrismML de llama.cpp.
- Servidor compatible con la API de OpenAI (`llama-server`), lo que permite integrarlo como endpoint `/v1/chat/completions`.
- No hay información disponible sobre soporte de tool calling o function calling, ni sobre capacidades de audio o de agentes multi-paso.

## Casos de uso

- Inferencia local en portátil con GPU integrada o CPU: con 2,42 GB en PQ2_0 (o 2,00 GB en PTQ1_0) el modelo de lenguaje cabe en memoria unificada de equipos modestos, lo que permite ejecutar un modelo de clase 9B sin conexión y sin servidor dedicado.
- Asistente documental de contexto largo: los 262.144 tokens de ventana permiten cargar informes, transcripciones o repositorios de texto extensos y hacer preguntas sobre ellos, con la salvedad de que el KV cache a esa longitud debe dimensionarse aparte.
- Análisis de documentos escaneados y capturas: la torre de visión (mmproj Q8_0, 0,62 GB) habilita OCR de apoyo y descripción de figuras; el autor recomienda subir el presupuesto de tokens de imagen para texto pequeño o denso.
- Servicio interno autoalojado compatible con OpenAI: desplegando `llama-server` con `--mmproj`, cualquier cliente que hable la API de OpenAI puede consumirlo, lo que facilita sustituir una API externa en herramientas de desarrollo internas.
- Prototipado y evaluación de cuantización ternaria: para investigadores que estudian cuantización extrema por debajo de 3 bits, los tres empaquetados del mismo conjunto de pesos permiten comparar layout y velocidad de kernel manteniendo los pesos idénticos.
- Generación de texto con latencia baja asistida por decodificación especulativa: el cabezal MTP integrado y el drafter DFlash2 están pensados para acelerar la generación, lo que encaja en tareas interactivas donde importa el tiempo hasta el primer token y el throughput.
- Procesamiento por lotes en CPU de solo texto: al no cargar el mmproj, el footprint baja al tamaño del GGUF de lenguaje, lo que hace viable ejecutar el modelo en servidores sin GPU para tareas de clasificación, resumen o extracción.
- Despliegue en el borde con contexto largo: la combinación de pesos ternarios y atención lineal en 24 de las 32 capas reduce el coste de memoria asociado al estado respecto a un transformer de atención completa equivalente, algo relevante en dispositivos con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, y los resultados de búsqueda web obtenidos no contienen información sobre este modelo (corresponden a productos homónimos sin relación: Prism de OpenAI, GraphPad Prism y Prism Launcher). No se inventan cifras.

## Requisitos de hardware

- Peso del modelo de lenguaje: 2,00 GB (PTQ1_0), 2,42 GB (PQ2_0) o 2,56 GB (Q2_0).
- Torre de visión: 0,62 GB (mmproj Q8_0, recomendado) o 0,92 GB (mmproj BF16, precisión de referencia).
- Variantes adicionales: 2,68 GB el archivo PQ2_0 con cabezal MTP integrado (se carga en lugar del PQ2_0 simple) y 1,57 GB el drafter DFlash2.
- Conjunto típico texto más imagen: PQ2_0 + mmproj Q8_0 ≈ 3,04 GB de pesos, más el KV cache y los buffers de runtime.
- KV cache: no disponible. Depende de la implementación y de la longitud de contexto configurada; a 262.144 tokens el consumo puede crecer de forma notable, por lo que conviene dimensionarlo con la longitud real de trabajo (el ejemplo de la model card usa `-c 32768`).
- GPU de consumo: sí cabe, en cualquier GPU con al menos ~4-6 GB de VRAM libres para el modelo de lenguaje, y en GPUs integradas con memoria unificada. El autor indica explícitamente el objetivo "on-device" y soporte de Metal, por lo que también es viable en Mac con Apple Silicon.
- GPU de centro de datos: no se especifican recomendaciones concretas (A100, H100, etc.); el soporte se declara para CUDA de forma genérica.
- Opciones de despliegue: llama.cpp a través del fork PrismML-Eng/llama.cpp (rama `prism`), con binarios `llama-cli`, `llama-mtmd-cli` y `llama-server` (API compatible con OpenAI). El llama.cpp upstream reciente solo ejecuta el archivo Q2_0 (requiere el runtime de activación Hadamard) y rechaza PQ2_0 y PTQ1_0 por tipo desconocido. La model card menciona MLX entre los backends soportados. No hay información sobre vLLM, TGI, Ollama o TensorRT-LLM.
- Latencia y throughput: no disponible. No se publican mediciones.
- Advertencia de backend: con la build actual del fork, el mmproj BF16 puede hacer caer `llama-server` cuando se procesan varias peticiones con imagen simultáneas; el autor recomienda Q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Modalidad | Licencia |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B (PQ2_0) | ~8,95B LM + ~0,46B visión | 262.144 tokens | GGUF ternario, 2,42 GB (LM) | Texto e imagen | Apache 2.0 |
| Ternary-Bonsai-2-9B (PTQ1_0) | ~8,95B LM + ~0,46B visión | 262.144 tokens | GGUF ternario, 2,00 GB (LM) | Texto e imagen | Apache 2.0 |
| Qwen3.5-9B (modelo base) | no disponible en detalle | 262.144 tokens | FP16, ~17,9 GB según la model card | no disponible | no disponible |
| Otras cuantizaciones de 2 bits de modelos de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables en la información disponible es contra el propio modelo base: la reducción de ~17,9 GB a 2,42 GB (PQ2_0) supone aproximadamente un 86 % menos de peso, manteniendo la arquitectura y el contexto sin cambios. No se dispone de datos de rendimiento que permitan comparar calidad frente al base ni frente a alternativas de cuantización de 4 bits de la misma familia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad. La degradación introducida por la ternarización frente al modelo base FP16 es desconocida y no está cuantificada en la información disponible.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluación de sesgo, toxicidad o alineación.
- Riesgo de alucinación: no cuantificado, pero todo modelo generativo de este tamaño presenta riesgo de fabricar contenido, especialmente en modo no thinking y con presencia de imágenes ambiguas.
- Idiomas soportados: no disponible. No se declara lista de idiomas, por lo que la cobertura multilingüe no puede darse por garantizada.
- Compatibilidad de backend muy restringida: PTQ1_0 y PQ2_0 solo funcionan con el fork PrismML de llama.cpp (rama `prism`); el llama.cpp upstream solo acepta Q2_0. Esto crea dependencia de un fork mantenido por un tercero y complica las actualizaciones.
- El empaquetado ternario se consume en kernels personalizados y nunca se expande a FP16, de modo que cualquier herramienta que espere safetensors o pesos estándar no podrá leerlo.
- Inestabilidad documentada: el mmproj BF16 puede provocar caídas de `llama-server` con peticiones de imagen concurrentes; usar Q8_0.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y atribución. No se documentan restricciones adicionales, pero tampoco se ofrece garantía alguna.
- Consumo de memoria a contexto completo: aunque los pesos son pequeños, el KV cache a 262.144 tokens puede dominar el uso de VRAM; el autor no publica cifras y el ejemplo de servidor usa 32.768 tokens.
- Discrepancia de metadatos: el campo de parámetros de safetensors del repositorio (1.470.621.184) no concuerda con los ~8,95B declarados en la model card. Conviene verificar el modelo antes de planificar recursos.
- No hay ninguna relación entre este modelo y los productos "Prism" que aparecen en los resultados de búsqueda web; esa búsqueda no ha aportado información útil.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Web de Prism ML: https://prismml.com
- Demo y ejemplos (fuente de verdad para ejecutar los modelos): https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con los kernels ternarios (rama `prism`): https://github.com/PrismML-Eng/llama.cpp
- Binarios precompilados: https://github.com/PrismML-Eng/llama.cpp/releases/latest
- Discord del proyecto: https://discord.gg/prismml
- Papers, blogs y demos adicionales: no disponible (los resultados de búsqueda web obtenidos no están relacionados con este modelo)
