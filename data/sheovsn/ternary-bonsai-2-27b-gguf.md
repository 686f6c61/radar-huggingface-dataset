# sheovsn/Ternary-Bonsai-2-27B-gguf

## Resumen

Bonsai 2 27B es una cuantización ternaria del modelo Qwen3.8-27B, publicada en formato GGUF para llama.cpp (CUDA, Metal y CPU) y orientada a inferencia local en portátil o en una única GPU. Cada peso toma un valor de {−1, 0, +1} con una escala FP16 compartida por grupo de 128 pesos (formato "ternary g128"), lo que da un coste real de 1,72 bits por peso y reduce el modelo a 5,95 GB (empaquetado PTQ1_0) o 7,21 GB (PQ2_0) frente a los ~54 GB que ocuparía en FP16.

El interés principal está en que la cuantización cubre de extremo a extremo embeddings, proyecciones de atención, proyecciones MLP y LM head, sin "válvulas de escape" en alta precisión escondidas tras la etiqueta de 2 bits. El autor declara retener el 98,2 % de la inteligencia del modelo en FP16, con una media de 84,78 en 14 benchmarks en modo thinking, frente a 72,59 de una compilación IQ2_XXS convencional y a 0,4 puntos de UD-Q4_K_XL con el triple de huella.

El modelo hereda del backbone Qwen3.8-27B una atención híbrida (~75 % lineal, ~25 % completa) que permite sostener 262.000 tokens de contexto en dispositivo, y conserva comportamiento de razonamiento, matemáticas, código y tool calling agéntico en el régimen sub-4-bit. La torre de visión se distribuye aparte como pack mmproj Q8_0 (~0,63 GB) para entrada de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (~75 % lineal / ~25 % completa), MLP SwiGLU, RoPE y RMSNorm; pesos ternarios con rotación Hadamard por bloques |
| Parámetros totales | 26.895.998.464 según los safetensors del repo; la model card desglosa 27,36 B: 24,35 B de backbone lingüístico (64 bloques) + 2,54 B de embeddings/LM head + 0,46 B de torre de visión (27 bloques) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.000 tokens (262K), heredada del modelo base |
| Tipos de cuantización | Ternaria g128 {−1, 0, +1} con escalas FP16 por grupo de 128 pesos, en dos empaquetados GGUF: PTQ1_0 (1,75 bits/peso, 5,95 GB) y PQ2_0 (2,13 bits/peso, 7,21 GB); torre de visión aparte en Q8_0 (~0,63 GB, mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (PTQ1_0 y PQ2_0) para llama.cpp |
| Modelo base | Qwen/Qwen3.8-27B |
| Backends soportados | llama.cpp (CUDA, Metal, CPU) con kernels ternarios personalizados; existe un acompañante MLX para Apple Silicon |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B, declarada como "sin cambios": un transformer causal de 27B con atención híbrida en la que aproximadamente el 75 % de las capas usan atención lineal y el 25 % restante atención completa, más MLP SwiGLU, RoPE y RMSNorm. Esa proporción de atención lineal es lo que hace viable mantener los 262K tokens de contexto en un dispositivo local sin que el coste de atención se dispare.

El trabajo propio de Bonsai 2 no es un reentrenamiento, sino una cuantización post-entrenamiento (PTQ) a representación ternaria. Cada matriz se transforma por bloques mediante una rotación ortogonal de Hadamard (bloque 1024, signos ±1 fijos) antes de asignar los trits; la rotación queda plegada en los pesos almacenados, de modo que no consume bits ni tráfico adicional, y el runtime aplica la transformación equivalente sobre las activaciones. El resultado se empaqueta en dos formatos: PTQ1_0, que empaqueta los trits de forma densa (1,75 bits/peso), y PQ2_0, que almacena cada trit en una ranura de 2 bits (2,13 bits/peso). Los pesos empaquetados se consumen directamente, sin expandirse a FP16. La model card indica que el modelo declara su rotación como metadato, de forma que un runtime aplica la transformación correspondiente o rechaza la carga. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF/DPO o decodificación especulativa; esos datos pertenecen al modelo base y no se reproducen aquí.

## Capacidades

- Generación de texto conversacional, con el pipeline declarado como text-generation.
- Modo thinking y razonamiento multi-paso: el autor reporta que el comportamiento de razonamiento profundo se conserva en el régimen sub-4-bit, con una media de 84,78 en 14 benchmarks en modo thinking.
- Matemáticas: 96,57 en la categoría declarada, a menos de medio punto del modelo en precisión completa.
- Generación y comprensión de código: 89,42, al nivel del baseline según el autor.
- Tool calling y comportamiento agéntico: 74,92 en la métrica de tool calling agéntico declarada.
- Capacidades de agente con contexto largo: 262K tokens permiten mantener historiales extensos y múltiples pasos intermedios.
- Visión: soportada mediante el pack mmproj Q8_0 opcional (~0,63 GB), que se carga solo cuando hay entrada de imagen.
- Capacidades multilingües: no disponible (no se especifica la lista de idiomas ni el rendimiento por idioma).

## Casos de uso

- Asistente de razonamiento totalmente offline en portátil: con 5,95 GB en PTQ1_0 el modelo cabe en un equipo de consumo y el autor reporta ~47 tok/s en un Apple M5 Max, lo que permite un asistente local sin coste de API ni envío de datos a terceros.
- Análisis de documentos largos: la ventana de 262K tokens admite contratos, expedientes o documentación técnica completos en una sola pasada, apoyándose en el backbone de atención mayoritariamente lineal para que el coste de contexto siga siendo asumible.
- Agente local con tool calling: la puntuación declarada de 74,92 en tool calling agéntico permite construir pipelines que consulten APIs internas, bases de datos o sistemas de ficheros sin salir de la máquina.
- Generación y revisión de código en local: con 89,42 en la categoría de código, puede integrarse en hooks de pre-commit o pasos de CI que se ejecuten en un runner con una única GPU, revisando diffs y proponiendo parches.
- Tutoría y resolución de problemas matemáticos: la puntuación de 96,57 en matemáticas, a menos de medio punto de la precisión completa, lo hace adecuado para herramientas educativas que necesiten mostrar el desarrollo del razonamiento paso a paso.
- Procesamiento de imágenes con texto: cargando el mmproj Q8_0, el modelo puede extraer información de capturas, diagramas o documentos escaneados y razonar sobre ellos, manteniendo el backbone lingüístico en ternario.
- Despliegue en edge o en kiosco con GPU modesta: al ocupar 5,95–7,21 GB, entra en GPUs de gama media y en equipos con memoria unificada, con backend Metal o CUDA según la plataforma.
- Investigación sobre cuantización de bajo bit: los dos empaquetados (PTQ1_0 y PQ2_0) y los kernels ternarios asociados sirven como banco de pruebas para estudiar la degradación de precisión en el régimen de 1,7–2,1 bits por peso.

## Benchmarks y rendimiento

La información disponible incluye valores agregados y por categoría, pero no el desglose por benchmark individual (no se indican nombres como MMLU, GSM8K o HumanEval), por lo que no es posible presentar una tabla por prueba.

| Métrica | Bonsai 2 27B (ternario) | Comparación indicada por el autor |
|---|---|---|
| Media en 14 benchmarks en modo thinking | 84,78 | IQ2_XXS convencional: 72,59; UD-Q4_K_XL: a 0,4 puntos, con el triple de huella |
| Retención frente a FP16 | 98,2 % | Referencia: modelo base en FP16 |
| Matemáticas | 96,57 | A menos de medio punto de la precisión completa |
| Código | 89,42 | Al nivel del baseline |
| Tool calling agéntico | 74,92 | No disponible |
| Throughput | ~47 tok/s | Apple M5 Max (portátil), según el autor |

No se han publicado en la información disponible resultados desglosados por benchmark individual ni mediciones de latencia en GPU de escritorio.

## Requisitos de hardware

- Peso de los pesos: 5,95 GB en PTQ1_0 y 7,21 GB en PQ2_0; el repositorio completo ocupa 68,5 GB, presumiblemente porque incluye varios empaquetados y artefactos adicionales.
- VRAM estimada para inferencia: no disponible de forma oficial; partiendo de los tamaños declarados, los pesos por sí solos exigen algo menos de 6 GB (PTQ1_0) o algo más de 7 GB (PQ2_0), a lo que hay que sumar caché KV, activaciones y sobrecarga del runtime.
- Caché KV para 262K tokens: no disponible; el autor no publica cifras de memoria de contexto, aunque la atención mayoritariamente lineal del backbone reduce el crecimiento respecto a un transformer de atención completa.
- GPU recomendadas: el autor no publica una lista; los kernels documentados cubren CUDA y Metal, además de CPU.
- Cabe en GPU de consumo: sí, según los tamaños declarados, en cualquier GPU con memoria suficiente para los pesos más la caché KV (estimación a partir de los datos del autor, no una cifra oficial).
- Opciones de despliegue: llama.cpp con kernels ternarios personalizados (fork de PrismML) para CUDA y Metal; MLX mediante el acompañante Ternary-Bonsai-2-27B-mlx-2bit en Apple Silicon. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: ~47 tok/s en un Apple M5 Max, dato aportado por el autor. No hay cifras para CUDA ni CPU.

## Comparativa con modelos similares

| Modelo / formato | Parámetros | Contexto | Huella | Rendimiento (media 14 benchmarks thinking) | Licencia |
|---|---|---|---|---|---|
| Bonsai 2 27B PTQ1_0 (ternario denso) | 27,36 B (26,90 B según safetensors) | 262K | 5,95 GB (1,75 bits/peso) | 84,78 | Apache 2.0 |
| Bonsai 2 27B PQ2_0 (trit en ranura de 2 bits) | 27,36 B | 262K | 7,21 GB (2,13 bits/peso) | no disponible (no se desglosa por empaquetado) | Apache 2.0 |
| Compilación IQ2_XXS convencional | no disponible | no disponible | no disponible | 72,59 | no disponible |
| Compilación UD-Q4_K_XL | no disponible | no disponible | ~3× la huella de Bonsai 2 27B | a 0,4 puntos de 84,78 | no disponible |
| Modelo base en FP16 | 27,36 B | 262K | ~54 GB | referencia (98,2 % retenido por Bonsai 2) | no disponible |

Las tres alternativas citadas corresponden al mismo modelo base Qwen3.8-27B en distintos formatos de cuantización, según la propia model card. No se dispone de datos comparativos con modelos de otras familias ni de la organización propietaria del modelo base.

## Limitaciones y advertencias

- El repositorio analizado figura bajo el autor "sheovsn", mientras que la model card y todos los enlaces apuntan a la organización "prism-ml" (incluida una ruta huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf). Conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada es 2026-09-26, posterior a la fecha de actualización consultada; no hay evidencia de adopción ni de validación por terceros.
- Requiere un fork específico de llama.cpp con kernels ternarios de atención híbrida (CUDA y Metal). Un llama.cpp estándar puede no ser capaz de cargar los formatos PTQ1_0 y PQ2_0.
- Si el runtime no aplica la rotación Hadamard declarada en los metadatos del modelo, este rechaza la carga. No se dispone del texto completo de la model card, que aparece truncado en la información proporcionada.
- Existe un fichero KNOWN_ISSUES.md en el repositorio del autor que documenta problemas conocidos con soluciones temporales y estado de corrección; no se detalla su contenido en la información disponible.
- No se especifican los idiomas soportados ni el rendimiento en castellano, por lo que no puede garantizarse la calidad multilingüe en producción.
- Riesgo de alucinación: no cuantificado en la información disponible, más allá de que el autor declara retener el 98,2 % del comportamiento del modelo en FP16, lo que implica heredar también sus errores.
- La licencia del repositorio es Apache 2.0, pero no se detalla la licencia del modelo base Qwen3.8-27B, que puede imponer condiciones adicionales para uso comercial.
- El desglose de los 14 benchmarks en modo thinking no se publica, solo la media agregada; las cifras de matemáticas, código y tool calling no van acompañadas de la referencia exacta con la que se comparan.
- La entrada de imagen exige descargar y cargar aparte el pack mmproj Q8_0 (~0,63 GB); sin él, el modelo es solo de texto.
- El repositorio ocupa 68,5 GB, muy por encima de los 5,95–7,21 GB del modelo empaquetado, algo a tener en cuenta en el almacenamiento y en la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sheovsn/Ternary-Bonsai-2-27B-gguf
- Acompañante MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels de bajo bit: https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Problemas conocidos: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/KNOWN_ISSUES.md
- Discord: https://discord.gg/prismml
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
