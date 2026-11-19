# prism-ml/Ternary-Bonsai-2-27B-gguf

## Resumen

Bonsai 2 27B es una cuantización ternaria extrema del modelo Qwen3.8-27B, publicada por Prism ML bajo licencia Apache 2.0. El modelo reduce los pesos del transformer a valores en {−1, 0, +1} con un factor de escala FP16 compartido cada 128 pesos, logrando un empaquetado de 1,72 bits por peso que comprime el modelo de ~54 GB en FP16 a aproximadamente 5,9 GB sin modificar la arquitectura original. Se distribuye en formato GGUF para llama.cpp, con kernels personalizados para CUDA y Metal, y una variante compatible con la rama principal de llama.cpp.

La relevancia del modelo reside en que mantiene un 98,2 % de la inteligencia del FP16 según la media de 14 benchmarks en modo thinking (84,78 frente a 72,59 de una cuantización IQ2_XXS convencional), conservando razonamiento matemático, generación de código y comportamiento agéntico con tool calling. Con 26.896 millones de parámetros totales y una ventana de contexto de 262.144 tokens, el modelo está diseñado para inferencia en dispositivos: portátiles con Apple Silicon, GPUs de consumo y servidores con una sola GPU.

La arquitectura subyacente es la de Qwen3.8-27B, un transformer causal de atención híbrida (~75 % lineal, ~25 % completa) con SwiGLU, RoPE y RMSNorm, que hace viable el contexto largo en hardware limitado. El repositorio acumula más de 1,38 millones de descargas y 3.061 likes, lo que lo sitúa entre las cuantizaciones de bajas bits más adoptadas de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atención híbrida (~75 % lineal / ~25 % completa), SwiGLU, RoPE, RMSNorm; pesos ternarios g128 |
| Parametros totales | 26.895.998.464 (27,36B: 24,35B backbone de lenguaje + 2,54B embedding/LM head + 0,46B torre de visión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Ternaria g128 {−1, 0, +1} con escala FP16 por grupo de 128 pesos; empaquetados PTQ1_0 (1,75 bits/peso, 5,95 GB), PQ2_0 (2,13 bits/peso, 7,21 GB) y Q2_0 (2,25 bits/peso, 7,63 GB, compatible con llama.cpp principal) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); mmproj Q8_0 opcional de ~0,63 GB para visión; existe variante MLX 2-bit |

## Arquitectura y entrenamiento

El modelo conserva sin cambios la arquitectura de Qwen3.8-27B: 64 bloques de transformer con atención híbrida, donde aproximadamente el 75 % de las capas usan atención lineal y el 25 % restante atención completa, lo que reduce el coste computacional y de memoria del contexto largo. La cuantización se aplica de forma end-to-end a embeddings, proyecciones de atención, proyecciones MLP y LM head, sin capas de alta precisión que actúen como escape. Cada matriz se transforma previamente mediante una rotación de Hadamard por bloques (bloque de 1024 con signos ±1 fijos) que se pliega en los pesos almacenados; en tiempo de ejecución se aplica la transformada equivalente a las activaciones, sin coste adicional de bits.

El proceso es una cuantización post-entrenamiento (PTQ) ternaria, no un reentrenamiento desde cero; la model card no detalla el número de tokens de calibración ni la composición del dataset empleado. Los pesos empaquetados se consumen directamente en los kernels, sin expandirse de vuelta a FP16. La torre de visión (27 bloques, 0,46B parámetros) se distribuye aparte como pack mmproj Q8_0 y solo se carga cuando hay entrada de imagen. Existen kernels personalizados para llama.cpp en CUDA y Metal, además de una variante Q2_0 que funciona en la rama principal de llama.cpp desde la release b11556.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con retención del 98,2 % de la inteligencia FP16 en la media de 14 benchmarks.
- Razonamiento matemático: 96,57 en la suite de matemáticas, a medio punto de la precisión completa.
- Generación de código: 89,42, a nivel de la línea base FP16.
- Tool calling y comportamiento agéntico: 74,92 en la evaluación de agentes.
- Procesamiento de imágenes mediante el pack mmproj Q8_0 opcional (torre de visión de 27 bloques).
- Contexto largo de 262.144 tokens, viable en dispositivo gracias al backbone de atención predominantemente lineal.
- Conversación multi-turno (pipeline text-generation, tag conversational).
- Inferencia en CPU, CUDA y Metal a través de llama.cpp; variante MLX para Apple Silicon.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de razonamiento en portátil: con 5,95 GB en PTQ1_0, el modelo cabe en un MacBook con Apple Silicon y permite razonamiento de 27B en local; la model card reporta ~47 tok/s en un Apple M5 Max, suficiente para uso interactivo sin conexión.
- Copiloto de código en el IDE: la retención de código (89,42) y el soporte de tool calling permiten integrarlo en pipelines de revisión, generación de tests y autocompletado multi-archivo, ejecutándose en una sola GPU de consumo.
- Análisis de documentos largos: los 262.144 tokens de contexto admiten contratos, informes o bases de código completas en una sola pasada, con atención lineal que mantiene el coste de memoria acotado.
- Agentes autónomos con herramientas: el comportamiento agéntico (74,92) y el tool calling permiten construir flujos multi-paso que consultan APIs, ejecutan comandos y validan resultados en entornos con presupuesto de VRAM reducido.
- Despliegue en el borde o air-gapped: al ocupar menos de 8 GB, el modelo puede servirse en estaciones de trabajo sin GPU dedicada o en entornos sin conectividad, usando llama.cpp en CPU.
- Procesamiento multimodal ligero: cargando el mmproj Q8_0 (~0,63 GB), se pueden describir capturas, extraer datos de formularios escaneados o responder preguntas sobre imágenes en local.
- Evaluación e investigación de cuantización: al publicar tres empaquetados (PTQ1_0, PQ2_0, Q2_0) con métricas comparadas frente a IQ2_XXS y UD-Q4_K_XL, sirve como referencia para estudiar la degradación de modelos en el régimen sub-4-bit.

## Benchmarks y rendimiento

| Metrica | Bonsai 2 27B (ternario) | IQ2_XXS (convencional) | UD-Q4_K_XL | FP16 (base) |
|---|---|---|---|---|
| Media de 14 benchmarks (thinking) | 84,78 | 72,59 | ~85,2 (a 0,4 puntos) | 100 % de referencia |
| Matematicas | 96,57 | No disponible | No disponible | ~97,1 (a ~0,5 puntos) |
| Codigo | 89,42 | No disponible | No disponible | Nivel de linea base |
| Tool calling agentico | 74,92 | No disponible | No disponible | No disponible |
| Huella (GB) | 5,95 (PTQ1_0) / 7,21 (PQ2_0) | ~82 % de la huella de Bonsai | ~3x la huella de Bonsai | ~54 |
| Throughput | ~47 tok/s (Apple M5 Max) | No disponible | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada: 5,95 GB para PTQ1_0, 7,21 GB para PQ2_0 y 7,63 GB para Q2_0, más overhead de contexto KV; con 262K tokens el KV cache requiere planificación adicional según el backend.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal; una RTX 4090 o superior ofrece margen amplio para contexto largo; A100/H100 para serving concurrente.
- GPU de consumo: sí, cabe en GPUs con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, Apple M-series). En 6 GB solo entra PTQ1_0 con contexto reducido.
- Despliegue: llama.cpp (fork de Prism ML con kernels ternarios para CUDA y Metal), llama.cpp principal desde b11556 con el empaquetado Q2_0, y MLX en Apple Silicon mediante el fork de Prism ML o el modelo companion mlx-2bit. vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: ~47 tok/s en un Apple M5 Max con el backend Metal; sin datos publicados para CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai 2 27B (PTQ1_0) | 27,36B | 262K | GGUF ternario, 1,75 bits/peso | Apache 2.0 | Hugging Face, llama.cpp fork |
| Bonsai 2 27B (Q2_0) | 27,36B | 262K | GGUF, 2,25 bits/peso | Apache 2.0 | llama.cpp principal b11556+ |
| IQ2_XXS de Qwen3.8-27B | 27B | 262K | GGUF 2-bit convencional | Apache 2.0 | llama.cpp |
| UD-Q4_K_XL de Qwen3.8-27B | 27B | 262K | GGUF 4-bit | Apache 2.0 | llama.cpp |

Frente a IQ2_XXS, Bonsai 2 obtiene 84,78 de media frente a 72,59 con aproximadamente el 82 % de su huella. Frente a UD-Q4_K_XL queda a 0,4 puntos con un tercio del espacio. La ventaja diferencial es el soporte de kernels ternarios nativos y la conservación de tool calling en el régimen sub-4-bit.

## Limitaciones y advertencias

- La cuantización ternaria introduce degradación medible: 1,8 puntos porcentuales de media frente a FP16 y pérdida en tareas que dependen de pesos de baja magnitud.
- El rendimiento óptimo depende de kernels personalizados (fork de llama.cpp de Prism ML); fuera de ellos solo está disponible el empaquetado Q2_0 con mayor huella.
- La torre de visión no está incluida en el GGUF principal: requiere descargar y cargar el pack mmproj Q8_0 por separado.
- El contexto de 262K exige gestión cuidadosa del KV cache; la atención lineal reduce el coste pero no lo elimina en las capas de atención completa.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de factualidad específicas para la versión ternaria.
- Sesgos: la model card no publica análisis de sesgos; se heredan los del modelo base Qwen3.8-27B.
- Idiomas soportados no documentados; se asume la cobertura multilingüe del modelo base, sin garantías.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la KNOWN_ISSUES del repositorio antes de desplegar en producción.
- El tamaño del repositorio (220,8 GB) incluye todos los empaquetados; la descarga selectiva de un solo archivo GGUF es necesaria para evitar transferencias innecesarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Variante MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp (CUDA + Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Problemas conocidos: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/KNOWN_ISSUES.md
- Web de Prism ML: https://prismml.com
- Discord: https://discord.gg/prismml
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
