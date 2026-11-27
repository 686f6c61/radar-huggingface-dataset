# Ethan33X/Tractus-decision-2B

## Resumen

Tractus-decision-2B es un modelo de decisión de 1.880 millones de parámetros (1.480 millones sin contar embeddings) desarrollado por Ethan33X y obtenido mediante post-entrenamiento sobre Qwen/Qwen3.5-2B-Base. Su propósito no es generar texto de forma autoregresiva, sino puntuar un conjunto de opciones candidatas (entre 2 y 255) dado un estado de entrada, devolviendo una distribución de probabilidad calibrada sobre esas opciones en un único pase forward con cero tokens generados. Esto lo sitúa en la categoría de modelos de "sistema 1": clasificación, enrutamiento y decisión rápida sin latencia de decodificación.

La arquitectura hereda el backbone híbrido de Qwen3.5, con 24 capas (18 de Gated DeltaNet y 6 de Gated Attention), dimensión oculta de 2.048, FFN de 6.144 y un contexto nativo de 262.144 tokens (256K). Es multimodal, acepta texto, JSON estructurado, tablas y contexto visual, y reduce el consumo de KV-cache en BF16 a 256K de 34,36 GB a 8,59 GB gracias a la combinación de atención lineal y atención con compuertas.

El modelo resulta relevante para pipelines donde la latencia de generación es el cuello de botella: enrutamiento de intenciones, navegación web, clasificación de documentos o toma de decisiones en agentes. Su mecanismo de calibración (Thermostasis) y su cabecera de lectura reducida (99,9% más pequeña que la cabecera de vocabulario de 248.320 entradas) son las innovaciones técnicas principales. La licencia es MIT modificada con aviso Apache-2.0 heredado de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: 24 capas (18 Gated DeltaNet + 6 Gated Attention), vision-language |
| Parametros totales | 1.881.825.088 (1,88B); 1,48B sin embeddings |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16 (3,8 GB), INT4 (1,0 GB) según model card; soporte MLX INT4 y PyTorch BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT modificada (modified-mit) con aviso Apache-2.0 de Qwen3.5 |
| Formato de pesos | safetensors |
| Dimension oculta / FFN | 2.048 / 6.144 |
| Tamano de vocabulario | 248.320 |
| Entradas | Estado (texto, JSON/tablas, contexto multimodal) + opciones candidatas |
| Salidas | Distribución de probabilidad calibrada sobre opciones (0 tokens generados) |
| Tamano del repo | 3,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B-Base, un foundation vision-language con arquitectura híbrida que intercala 18 capas de Gated DeltaNet (atención lineal con estado recurrente) y 6 capas de Gated Attention clásica en proporción 3:1. Esta combinación permite mantener un contexto de 256K con un coste de KV-cache cuatro veces menor que un transformer denso equivalente (34,36 GB a 8,59 GB en BF16 a 256K). El modelo conserva la torre visual del backbone base, por lo que acepta contexto multimodal además de texto y JSON estructurado.

El post-entrenamiento convierte el modelo generativo en un clasificador de opciones de un solo pase. La cabecera de lectura sustituye la proyección de vocabulario (248.320 vías) por una proyección mucho menor (99,9% de reducción) que puntúa las claves candidatas en la posición terminal. La calibración se realiza mediante el mecanismo denominado Thermostasis, que aplica opcionalmente un desplazamiento de prior binario, softcapping de logits con tanh (C = 30,0), centrado de suma cero y un termostato analítico 2D sin escalares de temperatura ajustados por validación. Los dos priors binarios estáticos (+3,2 para alucinación en RAGTruth y -0,75 para phishing en PhishNChips) solo se activan en Decision Index 0.3 y valen 0 en los otros 9 benchmarks primarios y en el conjunto OOD de 19.887 elementos. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Decisión de un solo pase sobre 2 a 255 opciones candidatas con cero tokens generados y sin latencia de decodificación autoregresiva.
- Puntuación calibrada de opciones: devuelve probabilidades, no texto, lo que facilita umbrales y enrutamiento.
- Procesamiento de texto libre, JSON estructurado, tablas y contexto multimodal (visión) heredado de Qwen3.5.
- Contexto largo de 262.144 tokens con reutilización del 100% del prefijo KV al escalar a sistema 2 (cero re-prefill).
- Clasificación y enrutamiento multi-intención (demostrado en el demo de banca y servicios).
- Navegación web y comprensión de layouts de interfaz (evaluado en Mind2Web).
- Detección de alucinación en contextos RAG (prior específico en RAGTruth) y detección de phishing (PhishNChips).
- Razonamiento causal de un solo pase (evaluado en JevBench 231).
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: dado el turno del usuario y un conjunto de intenciones posibles, el modelo devuelve la distribución de probabilidad en un solo pase, eliminando la latencia de generación y permitiendo umbrales de confianza calibrados para derivar a un modelo mayor cuando sea necesario.
- Navegación web automatizada: con el contexto visual y el DOM serializado, el modelo puntúa los elementos candidatos de la página (evaluado en Mind2Web con 74,00%), lo que encaja en agentes de navegador que necesitan decidir la siguiente acción con SLA ajustado.
- Clasificación de productos y consultas en e-commerce: sobre el conjunto Amazon ESCI alcanza 51,57%, útil para desambiguar intenciones de búsqueda y reordenar resultados en catálogos grandes.
- Moderación y detección de phishing: el prior específico sobre PhishNChips permite clasificar URLs o mensajes sospechosos como candidatos binarios con calibración ajustada, integrándose en filtros previos a la entrega.
- Detección de alucinación en pipelines RAG: el prior sobre RAGTruth permite marcar respuestas de recuperación como potencialmente alucinadas antes de mostrarlas, usando el modelo como verificador de bajo coste sobre pares pregunta-respuesta.
- Enrutamiento multi-intención en banca y servicios: el demo de Multi-Intent Banking & Service Router muestra cómo decidir entre varias intenciones simultáneas (consulta de saldo, bloqueo de tarjeta, disputa) en un solo pase con contexto de 256K para el historial del cliente.
- Dinámica espacial multiagente: el demo JevBall con 22 agentes bajo SLA de 300 ms demuestra el uso del modelo para decisiones de movimiento en entornos simulados donde la latencia de generación sería prohibitiva.
- Sentinel de reuniones full-duplex: el demo Full-Duplex Meeting Sentinel usa el modelo para decidir en tiempo real si intervenir, resumir o permanecer en silencio sobre el flujo de audio transcrito.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Decision Index 0.3 | Balanced Skill | 29,27 |
| Decision Index 0.3 | Balanced Raw Accuracy | 46,83% |
| JevBench 231 | Overall Accuracy (single-pass) | 69,26% (160/231) |
| JevBench 231 (pase BF16 separado) | Overall Accuracy | 69,70% (161/231) |
| Matched Commercial Suite (831 items, 256K) | JevBench | 71,43% |
| Matched Commercial Suite (831 items, 256K) | Mind2Web | 74,00% |
| Matched Commercial Suite (831 items, 256K) | Amazon ESCI | 51,57% |
| Matched Commercial Suite (831 items, 256K) | Pooled ECE (raw / OOF) | 2,74% / 1,97% |

La diferencia entre 160/231 y 161/231 en JevBench se atribuye a un desplazamiento de frontera por left-padding de un elemento en un pase de batching BF16 separado. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,8 GB de pesos más KV-cache; a 256K tokens el KV-cache BF16 ocupa 8,59 GB, por lo que la inferencia a contexto completo requiere del orden de 12-13 GB en BF16.
- VRAM estimada en INT4: aproximadamente 1,0 GB de pesos; el KV-cache se reduce proporcionalmente, permitiendo contexto largo en GPUs de 8-12 GB.
- GPU recomendadas: A100, H100 o L40S para contexto completo a 256K en BF16 con buen throughput; RTX 4090 (24 GB) suficiente para BF16 a 256K; RTX 3090/4080 (16-24 GB) y GPUs de 8 GB en INT4 para contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en BF16 y en GPUs de 8 GB con cuantización INT4.
- Opciones de despliegue: transformers (librería declarada), PyTorch BF16 en CUDA, MLX INT4 en Apple Silicon Metal. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: el modelo declara cero latencia de decodificación por construcción (0 tokens generados); el demo JevBall opera bajo un SLA de 300 ms en Apple Silicon Metal con MLX INT4 y en CUDA/PyTorch con BF16. No se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tractus-decision-2B | 1,88B | 262.144 | Decisión de un solo pase, multimodal | MIT modificada | Hugging Face |
| Tractus-decision-0.8B | 0,82B | 262.144 | Decisión de un solo pase | MIT modificada | Hugging Face |
| Tractus-decision-4B | 4,21B | 262.144 | Decisión de un solo pase | MIT modificada | Hugging Face |
| Tractus-decision-9B | 9,24B | 262.144 | Decisión de un solo pase | MIT modificada | Hugging Face |
| Qwen/Qwen3.5-2B-Base | 2B (aprox.) | 262.144 (heredado) | Generación vision-language | Apache-2.0 | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos de decisión o clasificación de otros autores (por ejemplo, clasificadores dedicados o modelos de enrutamiento) con métricas en los mismos conjuntos. La comparativa directa más fiable es con la propia familia Tractus, que comparte arquitectura y metodología de calibración.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza calidad en castellano ni en otros idiomas.
- No genera texto: su salida es una distribución sobre opciones. No puede usarse como modelo de chat o de generación sin un modelo complementario.
- Los benchmarks publicados son declarados por el autor y no están verificados de forma independiente (campo "verified: false" en el model-index).
- El conjunto Decision Index 0.3 es propiedad del autor (Ethan33X/tractus-decision-index-0.3), lo que limita la comparabilidad con terceros.
- Los priors binarios de alucinación (+3,2) y phishing (-0,75) están ajustados sobre RAGTruth y PhishNChips; su comportamiento fuera de esos dominios no está documentado.
- La calibración (Thermostasis) se declara sin escalares ajustados por validación, pero el ECE de 2,74% en el suite comercial indica que persiste un error de calibración no trivial.
- Licencia MIT modificada con aviso Apache-2.0 de Qwen3.5: conviene revisar el archivo LICENSE para los términos exactos de uso comercial y de MaaS, ya que la model card menciona "Tractus Commercial/MaaS Tiers".
- El modelo tiene 9 descargas y 0 likes en el momento de la ficha, con creación en noviembre de 2026: ecosistema y validación comunitaria muy limitados.
- Riesgo de alucinación en la puntuación de opciones cuando el estado de entrada es ambiguo o el conjunto de candidatos no cubre la respuesta correcta; el prior de RAGTruth mitiga pero no elimina este riesgo.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ethan33X/Tractus-decision-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Variante 0.8B (decisión): https://huggingface.co/Ethan33X/Tractus-decision-0.8B
- Variante 0.8B (dual): https://huggingface.co/Ethan33X/Tractus-0.8B
- Variante 2B (dual): https://huggingface.co/Ethan33X/Tractus-2B
- Variante 4B (decisión): https://huggingface.co/Ethan33X/Tractus-decision-4B
- Variante 4B (dual): https://huggingface.co/Ethan33X/Tractus-4B
- Variante 9B (decisión): https://huggingface.co/Ethan33X/Tractus-decision-9B
- Variante 9B (dual): https://huggingface.co/Ethan33X/Tractus-9B
- Dataset Decision Index 0.3: https://huggingface.co/datasets/Ethan33X/tractus-decision-index-0.3
- Licencia: https://huggingface.co/Ethan33X/Tractus-decision-2B/blob/main/LICENSE
