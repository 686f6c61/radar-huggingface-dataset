# prism-ml/Ternary-Bonsai-2-27B-mlx-2bit

## Resumen

Bonsai 2 27B es una compresión ternaria del modelo Qwen3.8-27B, publicada por Prism ML bajo el identificador `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`. El modelo mantiene la arquitectura original de 27.360 millones de parámetros (24.350 millones en el backbone de 64 bloques, 2.540 millones en embeddings y cabeza LM, y 460 millones en la torre de visión de 27 bloques) pero sustituye prácticamente todos los pesos lineales por valores ternarios en {−1, 0, +1} con un factor de escala FP16 compartido cada 128 pesos. El resultado ocupa 8,60 GB en disco (7,67 GB de modelo de lenguaje más 0,92 GB de torre de visión en FP16) frente a los aproximadamente 54 GB de la versión FP16.

La relevancia del modelo está en que demuestra que el régimen sub-4-bit puede conservar razonamiento, matemáticas, código y comportamiento agéntico, capacidades que en cuantizaciones convencionales de 2 bits suelen degradarse de forma severa. Según la model card, retiene el 98,2 % de la inteligencia FP16 (84,78 de media en 14 benchmarks en modo thinking) frente a 72,59 de una build IQ2_XXS convencional, con menos de dos tercios del tamaño de esta. El contexto heredado del modelo base es de 262.000 tokens, viable en dispositivo gracias a que el backbone de atención híbrida es aproximadamente un 75 % atención lineal.

El pack está pensado para ejecución local en Apple Silicon mediante MLX (Python y Swift) y para CUDA, con kernels propios que consumen los pesos empaquetados directamente sin expandirlos a FP16. Existe un compañero en formato GGUF para llama.cpp. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atención híbrida (~75 % lineal / ~25 % completa), SwiGLU MLP, RoPE, RMSNorm |
| Parametros totales | 27.359.638.768 (24,35B backbone + 2,54B embeddings/cabeza LM + 0,46B torre de visión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | Ternaria g128: pesos en {−1, 0, +1} con escala FP16 por grupo de 128; ~1,72 bits/peso efectivos; formato GGUF alternativo en PTQ1_0 (5,95 GB), PQ2_0 (7,21 GB) y Q2_0 (7,63 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo conserva sin cambios la arquitectura del Qwen3.8-27B: 64 bloques con atención híbrida en la que cerca del 75 % de las capas usan atención lineal y el 25 % restante atención completa, MLP con SwiGLU, normalización RMSNorm y codificación posicional RoPE. La cuantización cubre embeddings, proyecciones de atención, proyecciones del MLP y la cabeza LM, sin "escapes" de alta precisión detrás de una etiqueta de bajo bit. La torre de visión, con 27 bloques y 0,46B de parámetros, se incluye sin cuantizar en FP16 (0,92 GB).

La innovación técnica central es la representación ternaria en base rotada: cada matriz se transforma en bloques de 1024 mediante una rotación de Hadamard ortogonal con signos fijos ±1 antes de asignar los valores ternarios, y en tiempo de ejecución el runtime aplica la transformación equivalente sobre las activaciones. La rotación se pliega en los pesos almacenados, por lo que no añade bits ni tráfico adicional, y el fichero declara la rotación como metadato de modo que un runtime incompatible rechaza la carga. Cada grupo de 128 pesos comparte una escala FP16, lo que da un coste efectivo de ~1,71 bits/peso (1,72 contando los tensores mantenidos por encima de la representación ternaria), es decir, una reducción idealizada de ~9,3x frente a FP16. No se detallan en la información disponible el volumen de tokens de entrenamiento ni si hubo fases de RLHF o DPO posteriores a la cuantización.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con retención declarada del 98,2 % de la inteligencia FP16.
- Razonamiento matemático: 96,57 en el benchmark de matemáticas citado, a menos de medio punto de la precisión completa.
- Generación de código: 89,42, al nivel del baseline FP16.
- Tool calling y comportamiento agéntico: 74,92 en la métrica de agentic tool calling de la model card.
- Comprensión de imágenes mediante la torre de visión Qwen3.8-27B incluida en el pack (sin cuantizar).
- Conversación multi-turno con ventana de 262.000 tokens.
- Ejecución en dispositivo con kernels ternarios nativos en MLX (Python, Swift) y CUDA.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de razonamiento local en portátil: con 8,60 GB en disco y ~47 tok/s en un Apple M5 Max, permite desplegar un modelo de 27B en modo thinking sin conexión ni GPU dedicada, útil para entornos con requisitos de privacidad.
- Análisis de documentos largos: la ventana de 262.000 tokens y la atención predominantemente lineal permiten procesar contratos, informes o bases de código extensas manteniendo latencia manejable en dispositivo.
- Automatización agéntica con tool calling: el 74,92 en la métrica de tool calling lo hace apto para orquestar APIs y flujos multi-paso en local, por ejemplo para asistentes de terminal o agentes de soporte interno.
- Generación y revisión de código en el IDE: el rendimiento en coding (89,42) a nivel del baseline FP16 permite integrarlo en asistentes de autocompletado y refactorización que corren en la máquina del desarrollador.
- Procesamiento de documentación con imágenes: la torre de visión incluida permite extraer información de capturas, diagramas o formularios escaneados combinándola con el razonamiento de texto.
- Despliegue en flotas de estaciones de trabajo con CUDA: los kernels ternarios para CUDA y el fork de llama.cpp permiten servir el modelo en servidores con GPU sin necesidad de expandir los pesos a FP16 en memoria.
- Aplicaciones móviles en iOS/macOS: el fork de mlx-swift habilita integrar el modelo en apps nativas con pesos ternarios consumidos directamente.

## Benchmarks y rendimiento

Datos publicados en la model card (media de 14 benchmarks en modo thinking, salvo indicación):

| Benchmark / metrica | Ternary-Bonsai-2-27B | IQ2_XXS convencional | UD-Q4_K_XL |
|---|---|---|---|
| Media (14 benchmarks thinking) | 84,78 | 72,59 | no disponible (a 0,4 puntos) |
| Matematicas | 96,57 | no disponible | no disponible |
| Coding | 89,42 | no disponible | no disponible |
| Agentic tool calling | 74,92 | no disponible | no disponible |
| Inteligencia retenida vs FP16 | 98,2 % | no disponible | no disponible |
| Tamano en disco | 8,60 GB (MLX) / 5,95-7,63 GB (GGUF) | mas de 2/3 del tamano de Bonsai | ~3x el tamano de Bonsai |

Throughput declarado: ~47 tok/s en un Apple M5 Max. No se han publicado en la información disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K) ni cifras de latencia para CUDA.

## Requisitos de hardware

- VRAM/almacenamiento para inferencia: 8,60 GB en MLX (7,67 GB LM + 0,92 GB visión); 5,95 GB (PTQ1_0), 7,21 GB (PQ2_0) o 7,63 GB (Q2_0) en GGUF.
- GPU recomendadas: Apple Silicon (M-series, con MLX y mlx-swift); GPUs NVIDIA con CUDA mediante los kernels propios o el fork de llama.cpp.
- Cabe en GPU de consumo: sí, el tamaño de 8,60 GB permite ejecución en GPUs consumer con 12 GB o más de VRAM; en Apple Silicon se ejecuta en memoria unificada.
- Opciones de despliegue: MLX (Python y Swift), fork de MLX de Prism ML, fork de llama.cpp de Prism ML, llama.cpp estándar b11556 o superior (solo packing Q2_0), CUDA con kernels ternarios.
- Latencia y throughput: ~47 tok/s en Apple M5 Max según la model card; sin datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B | 27,36B | 262K | Ternario g128 (~1,72 bits/peso), MLX y GGUF | Apache 2.0 | Hugging Face |
| IQ2_XXS convencional (mismo base) | ~27B | 262K (heredado) | ~2 bits, GGUF | Apache 2.0 (base) | Hugging Face |
| UD-Q4_K_XL (mismo base) | ~27B | 262K (heredado) | ~4 bits, GGUF | Apache 2.0 (base) | Hugging Face |
| Qwen3.8-27B (FP16) | 27,36B | 262K | FP16 (~54 GB) | Apache 2.0 | Hugging Face |

La comparación se limita a las variantes del mismo modelo base citadas en la model card; no se dispone de datos de benchmarks de modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ternaria, aunque retiene el 98,2 % de la media FP16, implica una pérdida medible de calidad frente al modelo original; los benchmarks publicados son del propio autor y deben validarse en el caso de uso concreto.
- Riesgo de alucinación inherente a un modelo de lenguaje de 27B; el modo thinking no elimina este riesgo.
- Idiomas soportados no documentados en la información disponible; no se puede garantizar un rendimiento multilingüe equivalente al del modelo base.
- La representación en base rotada exige runtimes compatibles: un motor que no aplique la transformación de Hadamard sobre las activaciones rechazará la carga del fichero. La portabilidad fuera de MLX, los forks de Prism ML y llama.cpp ≥ b11556 (solo Q2_0) es limitada.
- El pack MLX almacena escala y sesgo por grupo, lo que eleva el coste a 2,25 bits/peso frente a 1,75 en el empaquetado GGUF PTQ1_0; el tamaño en disco varía según el backend elegido.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.8-27B y de los componentes derivados.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Compañero GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de MLX: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift: https://github.com/PrismML-Eng/mlx-swift
- Fork de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
- Web de Prism ML: https://prismml.com
- Discord: https://discord.gg/prismml
