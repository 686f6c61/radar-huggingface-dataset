# nace-ai/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B, publicada por nace-ai para su motor de inferencia local Kapitsa, optimizado para Macs con Apple silicon. El repositorio ofrece cuatro variantes de cuantización (Q2_K, Q3_K_M, Q4_K_M y Q8_0) generadas con importance matrix (imatrix), lo que permite ejecutar un modelo multimodal de 27.320.697.856 parámetros en hardware de consumo con memoria unificada. El pipeline declarado es image-text-to-text, por lo que el modelo base es multimodal (entrada de imagen y texto).

La relevancia de esta ficha es doble: por un lado, documenta una cuantización práctica de un modelo de clase 27B con licencia Apache 2.0; por otro, introduce el motor Kapitsa, que reporta 52,3 tokens/s de escritura y 395 tokens/s de lectura de prompt de 4K en un MacBook Pro M5 Pro de 48 GB, con un pico de memoria de 20,7 GiB para la variante Q4_K_M. El tamaño del repo (71,2 GB) corresponde al conjunto de las cuatro cuantizaciones GGUF.

No hay datos publicados sobre arquitectura interna del modelo base (tipo de transformer, número de capas, dimensiones ocultas, ventana de contexto o composición del dataset de entrenamiento) en la información proporcionada, por lo que esos campos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; pipeline image-text-to-text) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K (2,96 bits, 10,9 GB), Q3_K_M (3,91 bits, 13,5 GB), Q4_K_M (4,85 bits, 16,8 GB), Q8_0 (8,5 bits, 29,1 GB); además MLX 3-bit (12,9 GB), MLX 4-bit (16,3 GB), MLX 8-bit (29,8 GB) y NVFP4 4-bit (20,6 GB) en repos separados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, de la familia Qwen3.8, con 27.320.697.856 parámetros y pipeline multimodal image-text-to-text. La información disponible no detalla la arquitectura interna (si es un transformer denso, MoE o híbrido), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal en el modelo base; el nombre "mtp" en las variantes MLX sugiere multi-token prediction, pero la model card no lo confirma explícitamente.

La contribución técnica de este repositorio es la cuantización: las variantes Q2_K, Q3_K_M y Q4_K_M se generaron con importance matrix (imatrix), técnica que pondera la calibración según la importancia de cada peso para reducir la pérdida de calidad en cuantizaciones agresivas. La Q8_0 se generó sin imatrix. El autor reporta que la Q4_K_M mantiene la calidad del bf16 en GSM8K (0,960 frente a 0,940 de referencia con n=100), lo que indica que la cuantización a 4,85 bits preserva el rendimiento aritmético en esa muestra.

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repositorio).
- Procesamiento multimodal image-text-to-text: acepta imágenes junto a texto como entrada, según el pipeline declarado.
- Razonamiento aritmético: la model card reporta 0,960 en GSM8K (100 preguntas) para la variante Q4_K_M.
- Generación de código: la medición de velocidad de escritura se basa en una respuesta de codificación de 512 tokens, lo que indica uso práctico para código.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere exposición vía API compatible con el servidor Kapitsa en `http://127.0.0.1:8000`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están listados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente local de programación en Mac: con 52,3 tokens/s de escritura en un M5 Pro de 48 GB, el modelo Q4_K_M es viable para autocompletado, explicación de código y generación de funciones en un IDE local, sin depender de APIs externas.
- Análisis de capturas y documentos con imagen: al ser image-text-to-text, puede recibir capturas de pantalla, diagramas o fotos junto a una pregunta en lenguaje natural, útil para soporte técnico o extracción de información de documentación visual.
- Resolución de problemas matemáticos paso a paso: el 0,960 en GSM8K lo hace adecuado para tutores o asistentes educativos que resuelven problemas aritméticos de varias etapas.
- Prototipado de chatbots conversacionales: el tag `conversational` y el servidor Kapitsa con endpoint HTTP permiten montar un chatbot multi-turno local para pruebas de producto antes de escalar a infraestructura cloud.
- Procesamiento por lotes en local para privacidad: al ejecutarse íntegramente en el Mac, permite clasificar, resumir o reescribir textos sensibles sin enviarlos a terceros; la variante Q8_0 (29,1 GB) es la opción de mayor fidelidad cuando la memoria lo permite.
- Despliegue en estaciones de trabajo con presupuesto de memoria ajustado: la Q2_K (10,9 GB) y la Q3_K_M (13,5 GB) permiten ejecutar el modelo en Macs de 32 GB o menos, a costa de mayor pérdida de calidad que la Q4_K_M.
- Evaluación comparativa de cuantizaciones: investigadores pueden usar las cuatro variantes GGUF y las tres MLX para estudiar el efecto de la cuantización con y sin imatrix sobre un mismo modelo base.

## Benchmarks y rendimiento

| Test | Q4_K_M | Referencia bf16 | Veredicto |
|---|---:|---:|---|
| GSM8K (100 preguntas) | 0,960 (n=100) | 0,940 (n=100) | Coincide |

Rendimiento medido en MacBook Pro M5 Pro, 48 GB, con el build `d132a2cc` de Kapitsa:

| Métrica | Valor |
|---|---:|
| Escritura (respuesta de código de 512 tokens, temp. 0,6) | 52,3 tok/s |
| Lectura de prompt frío de ~4K tokens | 395 tok/s |
| Memoria pico del servidor | 20,7 GiB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: Q2_K ~10,9 GB de pesos; Q3_K_M ~13,5 GB; Q4_K_M ~16,8 GB (pico medido de 20,7 GiB en total); Q8_0 ~29,1 GB.
- Mac mínimo medido para Q4_K_M: 48 GB de memoria unificada (MacBook Pro M5 Pro).
- Cabe en GPU de consumo: las variantes Q2_K y Q3_K_M son candidatas para Macs de 32 GB; la Q4_K_M requiere 48 GB o más. No se han publicado mediciones para GPUs NVIDIA en esta model card.
- GPUs recomendadas: no disponible para CUDA; el motor Kapitsa está orientado a Apple silicon (tag `apple-silicon`).
- Opciones de despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, luego `kapitsa serve --model /path/to/file.gguf`), servidor local en `http://127.0.0.1:8000` con página de chat y API. Para GGUF genérico, llama.cpp es compatible por formato, pero no está documentado en la model card.
- Latencia y throughput: 52,3 tok/s de escritura y 395 tok/s de lectura de prompt de 4K en M5 Pro 48 GB; el autor advierte que la velocidad de drafting depende del texto de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---:|---|---|---|---|
| Qwen3.8-27B-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF Q2_K–Q8_0, MLX, NVFP4 | Cuantización con imatrix; 52,3 tok/s en M5 Pro 48 GB |
| Qwen3.8-27B (base) | 27,3B | no disponible | Apache 2.0 | safetensors (bf16) | Referencia de calidad; GSM8K 0,940 |
| Qwen3.8-27B-MLX-4bit | 27,3B | no disponible | Apache 2.0 | MLX 4-bit (16,3 GB) | Variante MLX del mismo autor, orientada a Apple silicon |

No se dispone de datos suficientes sobre otros modelos de la misma categoría (27B multimodal con licencia Apache 2.0) para establecer una comparación de rendimiento; los benchmarks publicados se limitan a GSM8K frente al bf16 del propio modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta sesgos del modelo base.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones de factualidad publicadas.
- Limitaciones de contexto: la longitud de contexto del modelo base no está indicada; la medición de lectura se hizo con un prompt de ~4K tokens, pero no confirma el máximo soportado.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B y de cualquier componente multimodal incluido.
- Cuantización: Q2_K y Q3_K_M pueden degradar calidad respecto a Q4_K_M; solo la Q4_K_M tiene verificación de calidad en GSM8K. La Q8_0 se generó sin imatrix.
- Hardware: las mediciones de velocidad y memoria corresponden exclusivamente a Apple silicon con Kapitsa; el rendimiento en CUDA, ROCm o CPU x86 no está documentado.
- Madurez: el repositorio tiene 0 descargas y 0 likes en la fecha de consulta, y el motor Kapitsa es un proyecto propio del autor; no hay evidencia de uso en producción a gran escala.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Kapitsa (GitHub): https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Variante MLX 3-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-3bit
- Variante MLX 4-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-8bit
- Variante NVFP4: https://huggingface.co/nace-ai/Qwen3.8-27B-NVFP4
