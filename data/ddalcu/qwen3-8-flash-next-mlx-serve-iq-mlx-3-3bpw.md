# ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de la familia Qwen basado en la arquitectura preliminar Qwen4 (`model_type: qwen4_exp`), desarrollado por el equipo Qwen de Alibaba. Se trata de un transformer disperso (MoE) con atención dispersa nativa, corrientes residuales con compuertas y una tabla de embedding de n-gramas de gran tamaño, diseñado para contextos muy largos y cargas de trabajo de agentes y código. El checkpoint completo, según el autor del pack, suma 180B parámetros en bf16 (125B de tronco, 51B de n-gramas y 4B de cabeza MTP), aunque los safetensors publicados en este repositorio suman 98.382.839.699 parámetros al excluir la tabla de n-gramas.

La ficha que nos ocupa no es el modelo original, sino una cuantización comunitaria publicada por ddalcu para el runtime `mlx-serve` en Apple Silicon. El pack comprime los pesos a 3,3 bits por peso con calibración imatrix para que quepa en un Mac de 64 GB de memoria unificada, manteniendo 64k de contexto. Incluye la cabeza MTP (multi-token prediction) y la torre de visión para entrada de imagen y vídeo.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo de escala 100B+ en hardware de consumo Apple con una calidad medida del 85,6% de coincidencia top-1 frente al checkpoint bf16; por otro, documenta con detalle las particularidades de la arquitectura Qwen4 (atención dispersa, n-gram embedding, corrientes residuales múltiples) que marcarán las próximas generaciones de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (Qwen Sparse Attention), corrientes residuales con compuertas (4 x 2560), embedding de n-gramas y cabeza MTP; `model_type: qwen4_exp` |
| Parametros totales | 98.382.839.699 en los safetensors del repo; el autor cita 180B para el checkpoint completo (125B tronco + 51B n-gram + 4B MTP) |
| Parametros activos | No disponible (el pack menciona 512 expertos enrutados en 48 capas, pero no se indica el número de expertos activos por token) |
| Longitud de contexto | 262.144 tokens nativos; el pack se sirve con `--ctx-size 65536` |
| Tipos de cuantizacion | iQ-MLX 3.3 bpw (3,14 bpw en expertos enrutados); variantes del autor en 4.7 bpw, mixed-4-8bit y 8bit |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | safetensors (MLX) + `ngram_table.bin` en safetensors de 4 bits (32,0 GB) + `model-vision.safetensors` en bf16 (~0,9 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre un tronco GDN + MoE con 512 expertos enrutados distribuidos en 48 capas, a los que se añaden tres innovaciones descritas en la model card. La primera son las corrientes residuales con compuertas: el residual tiene 4 flujos de ancho 2560, cada bloque lee una media mezclada por sigmoide de los flujos normalizados y escribe de vuelta mediante compuertas escalares por flujo, sustituyendo la norma final habitual por un mezclador final. La segunda es una tabla de embedding de n-gramas de 51B parámetros indexada por bigramas y trigramas hasheados de los ids de token: 16 cabezas, cada una con un espacio de cubos de tamaño primo de ~20M filas y 160 dimensiones por fila, inyectada una sola vez antes de la capa 1; es una búsqueda pura, sin cómputo.

La tercera es Qwen Sparse Attention: a partir de 2048 tokens, cada capa de atención solo lee los 512 bloques de 4 tokens más relevantes por consulta (seleccionados por un indexador pequeño) más el bloque parcial propio de la consulta, de modo que el coste de atención se mantiene plano con el contexto. La model card no aporta datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. En cuanto al pack, aplica búsqueda de escala y sesgo ponderada por activaciones (compatible byte a byte con el layout afín de `mx.quantize`), pliega el `+1` de las RMSNorm en el peso almacenado, transpone las convoluciones depthwise al formato `[C, K, 1]` de MLX y divide `experts.gate_up_proj` en `switch_mlp.gate_proj` y `up_proj`. La tabla de n-gramas se guarda como un único fichero de 4 bits que `mlx-serve` mapea en memoria y del que desquantiza por token las 16 filas necesarias en CPU (16 x 80 bytes) antes de subir solo el vector resultante de 2560 dimensiones.

## Capacidades

- Generación de texto y conversación multi-turno con ventana nativa de 262.144 tokens.
- Razonamiento de varios pasos y modo de pensamiento (la cabeza MTP está incluida en el pack).
- Generación de código y matemáticas, con posiciones de evaluación específicas en la calibración del pack (agente, código, prosa, matemáticas).
- Entrada multimodal de imagen y vídeo mediante la torre de visión incluida (`model-vision.safetensors`).
- Uso como motor de agentes: la model card menciona explícitamente cargas de trabajo de tipo agente entre los dominios de calibración.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Decodificación especulativa mediante la cabeza MTP incluida en el pack.

## Casos de uso

- Asistencia de código en local sobre Mac: el pack cabe en 52 GB residentes en un Mac de 64 GB y permite autocompletado y generación de funciones con 64k de contexto, útil para desarrolladores que no quieren enviar código a la nube.
- Análisis de repositorios completos: con 262k de contexto nativo y atención dispersa de coste plano, se pueden pasar ficheros y documentación extensos sin truncar, algo inviable en modelos densos del mismo tamaño.
- Agentes autónomos de varios pasos: la combinación de MTP, contexto largo y entrenamiento orientado a tareas de agente permite cadenas de razonamiento con muchas iteraciones manteniendo el estado en la ventana.
- Procesamiento de vídeo e imagen en local: la torre de visión incluida permite describir, resumir o extraer información de material audiovisual sin depender de APIs externas.
- Prototipado e investigación en Apple Silicon: sirve para estudiar el comportamiento de la arquitectura Qwen4 (atención dispersa, n-gram embedding) en hardware de consumo antes de comprometer clústeres de GPU.
- Servicio de inferencia personal con `mlx-serve`: el binario expone un servidor compatible con el runtime y permite servir el modelo a otras aplicaciones locales con 52,6 tok/s de decodificación en un M4 Max.
- Evaluación comparativa de cuantizaciones: el autor publica métricas de fidelidad frente a bf16 (top-1 y masa de probabilidad) que permiten decidir entre los packs de 3.3, 4.7 y 8 bits según la memoria disponible.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks académicos (MMLU, HumanEval, GSM8K). Sí publica métricas de fidelidad de la cuantización frente al checkpoint bf16 sobre 1200 posiciones de next-token retenidas (agente, código, prosa y matemáticas), y métricas de velocidad en un Apple M4 Max.

| Metrica | Valor |
|---|---|
| Top-1 vs bf16 (iQ-MLX 3.3 bpw) | 85,6% |
| Masa de probabilidad bf16 de la elección del pack (techo bf16: 0,762) | 0,732 |
| Top-1 vs bf16 (mixed-4-8bit) | 89,1% |
| Masa de probabilidad (mixed-4-8bit) | 0,738 |
| Decodificación (M4 Max, `--bench-only --rungs 2k`) | 52,6 tok/s |
| Prefill (M4 Max) | 762 tok/s |
| TTFT (M4 Max) | 318 ms |
| Memoria activa tras carga | 52,2 GB |
| Pico durante prefill de 36k tokens | 55,6 GB |

## Requisitos de hardware

- VRAM/memoria unificada: 52 GB residentes para el pack de 3.3 bpw, más 1,6 GB de caché KV para 64k de contexto. El pack de 4.7 bpw requiere 75 GB y el de 8 bits, 137 GB.
- Mac objetivo: 64 GB de memoria unificada para este pack; 128 GB recomendado para el de 4.7 bpw; más de 128 GB para el de 8 bits.
- Ajuste del sistema: es necesario elevar el límite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=58000` una vez por arranque, ya que macOS limita por defecto al ~75% de la RAM (48 GB en un Mac de 64 GB).
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el pack está empaquetado para MLX y Apple Silicon.
- Cabe en GPU de consumo: no aplica al formato MLX; en Apple Silicon, sí en Mac de 64 GB o superiores.
- Opciones de despliegue: `mlx-serve` (CLI o interfaz gráfica), con `--skip-mem-preflight` y `--ctx-size 65536`; `--kv-quant 8` reduce a la mitad la caché KV si se necesita margen.
- Latencia y throughput: 52,6 tok/s de decodificación, 762 tok/s de prefill y 318 ms de TTFT en un M4 Max con 2k de contexto.
- Nota sobre la tabla de n-gramas: sus 32 GB no cuentan como residentes (se mapean en memoria y compiten por la caché de páginas); el primer prompt largo tras el arranque paga lecturas aleatorias de SSD (varios segundos por cada 8k tokens en caché fría).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next iQ-MLX 3.3 bpw (este pack) | 98,4B en safetensors; 180B totales según el autor | 262k nativo, 64k servido | qwen-community-1.0 | Hugging Face, 3.404 descargas | Cuantización MLX para Mac de 64 GB |
| Qwen3.8-Flash-Next iQ-MLX 4.7 bpw | Mismo modelo base | 262k nativo | qwen-community-1.0 | Hugging Face | 75 GB residentes, 89,1% top-1 vs bf16, recomendado para 128 GB |
| Qwen3.8-Flash-Next mixed-4-8bit | Mismo modelo base | 262k nativo | qwen-community-1.0 | Hugging Face | 75 GB residentes, superado por el de 4.7 bpw |
| Qwen3.8-Flash-Next 8bit | Mismo modelo base | 262k nativo | qwen-community-1.0 | Hugging Face | 137 GB residentes, para más de 128 GB |

No se dispone de datos de benchmarks ni de especificaciones de modelos de otras familias comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia `qwen-community-1.0` es de tipo "other": es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que puede incluir restricciones de escala o de atribución.
- La cuantización a 3,3 bpw introduce degradación medible: solo el 85,6% de coincidencia top-1 con bf16 y una masa de probabilidad de 0,732 frente al techo de 0,762. Para tareas sensibles a la precisión conviene usar el pack de 4.7 bpw.
- La tabla de n-gramas no es residente y depende de la caché de páginas del sistema; en Macs con poca memoria libre, el primer prompt largo tras el arranque puede tardar varios segundos por cada 8k tokens.
- El modelo requiere elevar el límite de memoria cableada del sistema operativo, un ajuste que afecta a toda la máquina y debe revertirse si se ejecutan otras cargas intensivas.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al ser un modelo de 180B entrenado con datos web, es esperable un riesgo convencional, pero no hay datos publicados.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento adecuado fuera del inglés y el chino sin evaluación previa.
- El repositorio corresponde a un pack comunitario, no al modelo oficial: la calidad final depende tanto del checkpoint base como del proceso de cuantización del autor.
- La arquitectura `qwen4_exp` es una vista previa; pueden producirse cambios incompatibles en versiones posteriores del runtime o del modelo.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack iQ-MLX 4.7 bpw: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw
- Pack mixed-4-8bit: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Pack 8bit: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-8bit
- Runtime mlx-serve: https://mlxserve.com
