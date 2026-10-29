# HYDRACODEX/Ternary-Bonsai-2-27B-gguf

## Resumen

Ternary Bonsai 2 27B es una cuantización ternaria extrema del modelo Qwen3.8-27B (27B, atención híbrida) desarrollada por Prism ML. Cada peso del backbone lingüístico se almacena con un valor en {−1, 0, +1} más una escala FP16 compartida por grupo de 128 pesos, lo que deja el modelo completo en 1,72 bits por peso efectivos y un fichero de 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0) frente a los ~54 GB en FP16. El problema que resuelve es concreto: mantener el razonamiento de un modelo de clase 27B en un portátil o en una única GPU consumer, un régimen en el que las cuantizaciones de 2 bits convencionales colapsan en matemáticas y comportamiento agéntico.

La pieza diferencial no es solo el empaquetado, sino los kernels ternarios híbridos para llama.cpp (CUDA y Metal) que consumen los pesos empaquetados directamente, sin expandirlos a FP16 en memoria, junto con una rotación Hadamard por bloques (bloque 1024) plegada en los pesos y aplicada a las activaciones en tiempo de ejecución. El autor declara una retención del 98,2 % de la inteligencia del modelo FP16 (media de 84,78 en 14 benchmarks en modo thinking), matemáticas a menos de medio punto de precisión completa y soporte de tool calling, con 262K tokens de contexto viables en dispositivo gracias a que ~75 % de las capas usan atención lineal.

La ficha corresponde al repositorio `HYDRACODEX/Ternary-Bonsai-2-27B-gguf`, una resubida del release oficial `prism-ml/Ternary-Bonsai-2-27B-gguf` (0 descargas y 1 like en el momento de la consulta); la model card y los enlaces apuntan íntegramente a la infraestructura de Prism ML, que es la fuente canónica de los datos técnicos aquí recogidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal de atención híbrida (~75 % atención lineal / ~25 % atención completa), MLP SwiGLU, RoPE, RMSNorm; 64 bloques de lenguaje y 27 bloques de torre de visión |
| Parámetros totales | 26.895.998.464 según el conteo de safetensors del repo (~26,9B); la model card declara 27,36B (24,35B backbone + 2,54B embeddings/LM head + 0,46B torre de visión) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantización | Ternaria g128: pesos en {−1, 0, +1} con escala FP16 por grupo de 128; PTQ1_0 (trits densos, 1,75 bits/peso) y PQ2_0 (cada trit en una ranura de 2 bits, 2,13 bits/peso); 1,72 bits/peso global; torre de visión en Q8_0; existe compañero MLX de 2 bits |
| Idiomas soportados | No disponible (la model card no documenta la cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (PTQ1_0 y PQ2_0) más mmproj Q8_0 para visión; companion en MLX 2-bit |

## Arquitectura y entrenamiento

El modelo conserva sin cambios la arquitectura del base Qwen3.8-27B: un decoder causal con atención híbrida en el que la mayor parte de las capas (~75 %) emplea atención lineal y solo ~25 % atención completa, lo que hace tratable un contexto de 262K tokens en hardware de consumo. Sobre esa estructura, Prism ML aplica una cuantización post-entrenamiento ternaria: cada matriz se rota primero con una transformación Hadamard ortogonal por bloques de 1024 con signos ±1 fijos, se asignan los pesos ternarios en esa base rotada y se pliega la rotación en los pesos almacenados (sin coste extra en bits ni en tráfico de pesos); en tiempo de ejecución el runtime aplica la transformada equivalente a las activaciones. Cada grupo de 128 pesos comparte una escala FP16, y la cobertura de la representación ternaria incluye embeddings, proyecciones de atención, proyecciones del MLP y LM head, sin tensores de alta precisión «de escape».

No se ha publicado en la información disponible el volumen de tokens, la composición del dataset ni si hubo fases de RLHF o DPO para el modelo base. Tampoco se detalla el procedimiento de calibración de la cuantización (número de muestras, dominio, algoritmo de asignación ternaria más allá de la rotación). La innovación técnica documentada se concentra en tres puntos: el empaquetado denso de trits (PTQ1_0) y su variante indexable (PQ2_0), los kernels ternarios híbridos para CUDA y Metal en un fork de llama.cpp que consumen los pesos empaquetados sin descomprimirlos, y la rotación Hadamard como mecanismo para reducir el error de cuantización a 2 bits. La torre de visión se distribuye aparte como pack mmproj Q8_0 de ~0,63 GB para no penalizar el caso de uso solo-texto.

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking, con una media de 84,78 en 14 benchmarks de razonamiento según el autor.
- Razonamiento matemático: 96,57 en la métrica de matemáticas reportada, a menos de medio punto de la versión FP16.
- Generación de código: 89,42 en la métrica de coding, al nivel del baseline de precisión completa.
- Tool calling y comportamiento agéntico: 74,92 en la métrica de agentic tool calling, capacidad que el autor destaca como preservada en el régimen sub-4-bit.
- Procesamiento de imágenes: la torre de visión se carga opcionalmente mediante el pack mmproj Q8_0, por lo que acepta entradas multimodales imagen + texto.
- Contexto largo de 262K tokens, viable en dispositivo por la proporción de atención lineal del backbone.
- Compatibilidad con endpoints: el repo incluye el tag `endpoints_compatible`, orientado a servidores de inferencia compatibles con API.
- Capacidades multilingües: no disponible (sin documentación en la información proporcionada).

## Casos de uso

- Asistencia de razonamiento en portátil: con 5,95 GB de pesos en PTQ1_0, el modelo cabe en un equipo de 16 GB de RAM unificada y permite trabajar con un modelo de clase 27B sin conexión; el autor reporta ~47 tok/s en un Apple M5 Max.
- Agente local con tool calling: los 74,92 puntos en comportamiento agéntico permiten encadenar llamadas a funciones (consulta de APIs internas, lectura de ficheros, ejecución de comandos) en estaciones de trabajo sin GPU de datacenter.
- Análisis de documentación extensa: los 262K tokens de contexto admiten introducir contratos, expedientes o bases de código completas en una sola pasada, algo inviable con ventanas de 8K-32K en el mismo presupuesto de memoria.
- Copiloto de código en local: con 89,42 en coding, encaja en flujos de autocompletado y refactorización dentro de IDE sobre hardware de consumo, sin enviar código propietario a servicios externos.
- Tutoría técnica y verificación matemática: los 96,57 en matemáticas lo hacen apto para resolución paso a paso de problemas y comprobación de cálculos en entornos educativos o de ingeniería.
- Procesamiento de documentos con imagen: cargando el mmproj Q8_0 (~0,63 GB) se pueden digitalizar facturas, capturas de pantalla o formularios y extraer datos estructurados en local.
- Despliegue en entornos aislados: sanidad, administración pública o defensa, donde la licencia Apache 2.0 y la inferencia 100 % local evitan transferencias de datos a terceros.
- Servidor de bajo coste: dos instancias en PTQ1_0 (~12 GB de pesos) caben en una GPU de 24 GB, lo que permite servir el modelo con un coste por token muy inferior al de una configuración FP16.

## Benchmarks y rendimiento

Resultados publicados por el autor (modo thinking; los nombres concretos de los 14 benchmarks no se detallan en la información disponible):

| Métrica | Resultado |
|---|---|
| Media de 14 benchmarks de razonamiento | 84,78 |
| Matemáticas | 96,57 (a <0,5 puntos de FP16) |
| Coding | 89,42 (nivel del baseline FP16) |
| Agentic tool calling | 74,92 |
| Retención de inteligencia frente a FP16 | 98,2 % |
| Densidad (benchmarks por GB) | 0,457 frente a 0,416 de la versión Bonsai 27B anterior (+9,9 %) |

Comparación de regímenes de cuantización sobre el mismo modelo base:

| Build | Huella | Media en los mismos 14 benchmarks |
|---|---|---|
| Ternary Bonsai 2 27B (PTQ1_0) | 5,95 GB | 84,78 |
| IQ2_XXS convencional | ~82 % mayor que Bonsai (≈7,3 GB) | 72,59 |
| UD-Q4_K_XL | ~3× la huella de Bonsai (≈18 GB) | dentro de 0,4 puntos de 84,78 (valor exacto no publicado) |
| FP16 del base | ~54 GB | referencia (98,2 % retenido) |

No se han publicado en la información disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros), ni mediciones de throughput en CUDA más allá del dato de ~47 tok/s en Apple M5 Max.

## Requisitos de hardware

- Pesos del modelo de lenguaje: 5,95 GB con PTQ1_0 y 7,21 GB con PQ2_0, cantidades que incluyen ya el empaquetado ternario y las escalas.
- Torre de visión: ~0,63 GB adicionales en Q8_0, solo si se envían imágenes.
- Caché KV: no disponible en la documentación; con 262K tokens de contexto el consumo adicional puede superar ampliamente al de los pesos, por lo que conviene dimensionar según la longitud real de las secuencias.
- GPU consumer: los pesos caben en cualquier GPU con 8 GB o más de VRAM; el contexto largo exige más memoria y no hay cifras publicadas de VRAM total para 262K tokens.
- GPU de datacenter: no se han publicado pruebas específicas en A100, H100 ni en GPUs de consumo concretas; el autor solo certifica backend CUDA y Metal a través de su fork.
- Despliegue: llama.cpp mediante el fork de Prism ML (CUDA + Metal + CPU), con kernels ternarios híbridos propios; en Apple Silicon existe además el fork de MLX y el companion `Ternary-Bonsai-2-27B-mlx-2bit`; mlx-swift para iOS/macOS.
- Otros runtimes: vLLM, TGI y Ollama no están documentados en la información disponible; el tag `endpoints_compatible` sugiere servir mediante una API compatible, pero el motor subyacente sigue siendo el fork de llama.cpp.
- Rendimiento: ~47 tok/s en un Apple M5 Max según el autor; sin datos de throughput en CUDA ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (14 benchmarks) | Huella | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2 27B (PTQ1_0) | ~27B densos | 262K | 84,78 | 5,95 GB | Apache 2.0 | GGUF en HF + fork de llama.cpp |
| Ternary Bonsai 2 27B (PQ2_0) | ~27B densos | 262K | No disponible por separado | 7,21 GB | Apache 2.0 | GGUF en HF |
| IQ2_XXS del mismo base | ~27B densos | 262K (heredado) | 72,59 | ≈7,3 GB | Según el build | llama.cpp estándar |
| UD-Q4_K_XL del mismo base | ~27B densos | 262K (heredado) | ~84,4-85,2 (dentro de 0,4 puntos) | ≈18 GB | Según el build | llama.cpp estándar |
| Qwen3.8-27B FP16 (base) | 27,36B | 262K | Referencia (100 %) | ~54 GB | No disponible en la información | Pesos originales del base |
| Bonsai 27B (generación anterior) | ~27B densos | No disponible | No disponible (densidad 0,416) | No disponible | Apache 2.0 | Release anterior de Prism ML |

La comparación relevante es interna al mismo modelo base: Bonsai 2 logra 12,19 puntos más que IQ2_XXS con menos huella y se queda a menos de medio punto de un Q4_K_XL que triplica el espacio ocupado, a cambio de requerir kernels específicos fuera del llama.cpp upstream.

## Limitaciones y advertencias

- La cuantización ternaria, aunque retiene el 98,2 % de la media agregada, no es lossless: matemáticas y coding quedan por debajo del FP16 (96,57 y 89,42) y el comportamiento en tareas de nicho no está desglosado.
- Requiere el fork de llama.cpp de Prism ML: los pesos empaquetados declaran su rotación como metadatos y un runtime sin el transforme correspondiente se niega a cargar el modelo; el llama.cpp upstream no sirve.
- Los kernels ternarios están certificados para CUDA y Metal; el rendimiento en CPU se anuncia como soportado pero no se publican cifras.
- El repositorio `HYDRACODEX/Ternary-Bonsai-2-27B-gguf` es una resubida de terceros (0 descargas, 1 like) del release oficial de `prism-ml`; conviene descargar de la fuente canónica y verificar checksums.
- El tamaño del repo (68,5 GB) no cuadra con la suma de los dos empaquetados publicados (~13 GB), lo que sugiere ficheros adicionales, duplicados o material no documentado en esta copia.
- Existe un fichero KNOWN_ISSUES.md en el release oficial con problemas conocidos y workarounds; no se ha verificado su contenido en esta ficha.
- Riesgo de alucinación estándar en modelos de 27B cuantizados a 2 bits, potencialmente acentuado en contextos muy largos y en dominios poco representados.
- La cobertura de idiomas no está documentada, por lo que no se puede garantizar calidad en castellano ni en lenguas distintas del inglés sin evaluaciones propias.
- La licencia Apache 2.0 se aplica a este release, pero no se detallan en la información disponible las condiciones del modelo base Qwen3.8-27B ni posibles obligaciones adicionales derivadas de él.
- El uso de la torre de visión exige cargar el mmproj Q8_0 aparte; sin ese fichero el modelo es solo-texto.
- No hay datos publicados de latencia por petición, throughput en GPU de datacenter ni comportamiento bajo batching concurrente, imprescindibles para dimensionar producción.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/HYDRACODEX/Ternary-Bonsai-2-27B-gguf
- Release oficial en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Árbol de ficheros del release oficial: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/tree/main
- Documentación del modelo: https://docs.prismml.com/models/bonsai-2-27b
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios (CUDA + Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Companion MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Problemas conocidos: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/KNOWN_ISSUES.md
- Web de Prism ML: https://prismml.com
- Discord: https://discord.gg/prismml
- Ficha de terceros con datos de descarga: https://local-ai-zone.github.io/models/ternary-bonsai-2-27b.html
