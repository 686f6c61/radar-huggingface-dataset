# devendradhakad/autodroid-prism-ml-Ternary-Bonsai-27B-gguf

## Resumen

Ternary Bonsai 27B es una cuantizacion ternaria extrema del modelo Qwen3.6-27B, un transformer causal de 27B parametros con backbone de atencion hibrida. La publica Prism ML (el repositorio de HuggingFace analizado es un espejo subido por el usuario devendradhakad) y su objetivo es llevar razonamiento de clase 27B a hardware de consumo: reduce el peso desplegado de ~54 GB en FP16 a ~7,2 GB, con una huella ideal de 5,9 GB a 1,71 bits por peso.

La innovacion principal es que todos los pesos del lenguaje (embeddings, proyecciones de atencion, proyecciones MLP y LM head) son ternarios con valores en {-1, 0, +1}, empaquetados en GGUF Q2_0_g128 con una escala FP16 compartida por cada grupo de 128 pesos. No hay capas de alta precision escondidas tras la etiqueta de 2 bits; solo la torre de vision se mantiene en 4 bits HQQ. Segun el autor, el modelo conserva el 95% de la inteligencia de la version FP16, con una media de 80,49 en 15 benchmarks en modo thinking, por encima del build convencional IQ2_XXS (72,73).

Es relevante porque mantiene 262K tokens de contexto en dispositivo, comportamiento agentico y tool calling en un regimen sub-4-bit donde las representaciones de baja precision convencionales suelen colapsar. Se distribuye con un drafter de decodificacion especulativa (DSpark) y kernels propios de atencion hibrida de 2 bits para llama.cpp en CUDA y Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion hibrida (~75% lineal / ~25% atencion completa), SwiGLU MLP, RoPE, RMSNorm |
| Parametros totales | ~27,3B en pesos de lenguaje ternarios (~24,8B de backbone en 64 bloques + ~2,5B de embedding/LM head) + ~0,46B de torre de vision (27 bloques); 26.895.998.464 parametros segun el dato de safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | GGUF Q2_0_g128 (ternario, 1,71 bits/peso efectivos); torre de vision en HQQ 4-bit; KV cache en 4-bit; contenedor mmproj en Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); existe un companero en MLX 2-bit |

## Arquitectura y entrenamiento

El modelo deriva de Qwen3.6-27B sin cambios de arquitectura: es un transformer causal que combina aproximadamente un 75% de capas de atencion lineal con un 25% de atencion completa (16 de 64 capas generan cache de atencion completa), usa SwiGLU como MLP, RoPE para posiciones y RMSNorm. Esta mezcla es la que permite sostener la ventana de 262K tokens en dispositivo, ya que la cache KV de atencion completa a ventana completa ocupa unos 4,3 GB y se cuantiza a 4 bits con perdida casi nula.

El entrenamiento de cuantizacion convierte a ternario {-1, 0, +1} los pesos de embeddings, proyecciones de atencion, proyecciones MLP y LM head, con una unica escala FP16 por grupo de 128 pesos. Un valor ternario transporta log2(3) ~= 1,585 bits de informacion, de modo que el coste efectivo de almacenamiento es de ~1,71 bits/peso. El estado cero adicional frente a un esquema binario aumenta la expresividad del alfabeto de pesos y es lo que el autor presenta como el punto de operacion orientado a calidad de la familia Bonsai 27B. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion no esta disponible.

Como innovaciones tecnicas destacan los kernels personalizados de atencion hibrida de 2 bits para llama.cpp (CUDA y Metal) que consumen los pesos empaquetados directamente, sin expandirlos a FP16, y una capa drafter de decodificacion especulativa (DSpark) entrenada contra el objetivo Bonsai 27B que aporta una aceleracion sin perdida de 1,34x en la ruta de serving con CUDA.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con una media de 80,49 en 15 benchmarks de razonamiento segun el autor.
- Matematicas: puntuacion de 93,40, a dos puntos de la version de precision completa.
- Codigo: puntuacion de 85,96 en las pruebas reportadas del autor.
- Uso de herramientas y comportamiento agentico: puntuacion de 74,01 en tool use agentico.
- Soporte de tool calling / function calling, explicitamente conservado en el regimen sub-4-bit.
- Vision: incorpora torre de vision de ~0,46B en 4 bits HQQ, cargada opcionalmente mediante un pack mmproj de ~0,63 GB para entrada de imagen.
- Contexto largo: ventana de 262K tokens con KV cache cuantizada a 4 bits.
- Multilingue: no hay informacion disponible sobre idiomas soportados en la model card.
- Decodificacion especulativa integrada mediante la capa drafter DSpark.

## Casos de uso

- Asistentes de razonamiento en portatil: el modelo ocupa ~7,2 GB desplegados, por lo que puede ejecutarse en un portatil con Apple Silicon (el autor reporta ~26 tok/s en un Apple M5 Pro) para tareas de analisis y respuesta multi-turno sin conexion a la nube.
- Atencion al cliente automatizada: la ventana de 262K tokens permite mantener conversaciones e historiales de interaccion muy largos con una cache KV cuantizada que solo crece en 16 de las 64 capas, reduciendo el coste de memoria frente a un transformer de atencion completa equivalente.
- Agentes con tool calling: con soporte agentico y de function calling preservado a baja precision, se puede integrar en pipelines donde el modelo decida que herramienta invocar en varios pasos de una tarea.
- Analisis de documentos extensos con imagenes: la torre de vision opcional (4 bits HQQ) permite procesar capturas, diagramas o paginas escaneadas junto con texto largo dentro de la misma ventana de contexto.
- Asistencia de programacion local: con 85,96 en las pruebas de codigo reportadas, resulta util para autocompletado, revision de parches y generacion de tests en entornos sin GPU de datacenter.
- Razonamiento matematico y resolucion de problemas: la puntuacion de 93,40 en matematicas lo hace adecuado para tutoria o verificacion de calculos en flujos educativos.
- Despliegue en el borde o en un unico GPU: los kernels de 2 bits para CUDA y Metal permiten servir el modelo en una sola GPU de consumo o en CPU mediante llama.cpp, sin necesidad de expandir pesos a FP16.
- Inferencia en iOS/macOS: existe un companero MLX 2-bit y un fork de mlx-swift para integracion nativa en aplicaciones de Apple.

## Benchmarks y rendimiento

| Benchmark | Ternary Bonsai 27B (Q2_0_g128) | Build IQ2_XXS convencional | FP16 (referencia) |
|---|---|---|---|
| Media en 15 benchmarks (modo thinking) | 80,49 | 72,73 | no disponible |
| Matematicas | 93,40 | no disponible | a ~2 puntos de la version FP16 segun el autor |
| Codigo | 85,96 | no disponible | no disponible |
| Tool use agentico | 74,01 | no disponible | no disponible |
| Retencion de inteligencia frente a FP16 | 95% | no disponible | 100% (base) |

Datos de velocidad: ~26 tok/s en un portatil Apple M5 Pro; aceleracion de decodificacion de 1,34x sin perdida con el drafter DSpark en la ruta CUDA. No se han encontrado mas resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio desplegado: ~7,2 GB reales (5,9 GB ideales a 1,71 bits/peso); frente a ~54 GB del modelo en FP16.
- Cache KV: unos 4,3 GB con la ventana completa de 262K tokens, gracias a que solo 16 de 64 capas mantienen cache de atencion completa y a la cuantizacion de KV a 4 bits.
- Componente de vision opcional: pack mmproj de ~0,63 GB (contenedor Q8_0), cargado solo cuando hay entrada de imagen.
- Cabe en GPU de consumo: si, con ~7,2 GB de pesos mas la cache KV segun la ventana usada; tambien en portatiles Apple Silicon (el autor cita un M5 Pro a ~26 tok/s).
- GPU recomendadas: no hay una lista explicita en la informacion disponible; los kernels cubren CUDA y Metal, ademas de CPU.
- Opciones de despliegue: llama.cpp (CUDA, Metal, CPU) con kernels propios de atencion hibrida de 2 bits; MLX en Apple Silicon mediante el companero Ternary-Bonsai-27B-mlx-2bit y los forks de MLX y mlx-swift.
- Latencia y throughput: ~26 tok/s en Apple M5 Pro; 1,34x de aceleracion de decodificacion con DSpark en CUDA. No hay mas cifras de throughput disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion media (15 benchmarks) | Huella desplegada | Licencia |
|---|---|---|---|---|---|
| Ternary Bonsai 27B (este) | ~27,3B ternarios + ~0,46B vision | 262K | 80,49 (thinking) | ~7,2 GB (Q2_0_g128) | Apache 2.0 |
| Build IQ2_XXS de Qwen3.6-27B | ~27B | no disponible | 72,73 | segun el autor, mas de 1,5x la huella de Bonsai | Apache 2.0 (heredada) |
| Bonsai-27B (1-bit, punto de operacion movil) | ~27B | no disponible | no disponible | ~3,9 GB, cabe en un iPhone 17 Pro Max | Apache 2.0 |
| Ternary-Bonsai-27B-mlx-2bit | ~27B | no disponible | no disponible | no disponible (companero MLX para Apple Silicon) | Apache 2.0 |
| Qwen3.6-27B FP16 | ~27B | 262K | 100% de referencia (linea base) | ~54 GB | Apache 2.0 |

No se dispone de modelos comparables de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor reporta una retencion del 95% de la inteligencia del modelo FP16, lo que implica una degradacion del 5% frente a la linea base de precision completa.
- La model card no documenta sesgos, composicion del dataset ni proceso de alineacion, por lo que el riesgo de sesgo es no disponible y debe evaluarse empiricamente antes de un despliegue en produccion.
- Riesgo de alucinacion inherente a los modelos generativos; la cuantizacion ternaria agresiva puede acentuar errores en tareas de alta precision no cubiertas por los benchmarks publicados.
- La informacion sobre idiomas soportados esta marcada como no disponible en la model card, por lo que no se puede garantizar un rendimiento multilingue equilibrado.
- Aunque la licencia declarada es Apache 2.0, conviene verificar los terminos del modelo base Qwen3.6-27B y de los kernels de llama.cpp/MLX bifurcados antes de un uso comercial.
- Los resultados de benchmarks son los publicados por el autor en su propia model card y no han sido verificados de forma independiente en la informacion disponible.
- El repositorio analizado (devendradhakad/autodroid-prism-ml-Ternary-Bonsai-27B-gguf) es un espejo de terceros: el material oficial de referencia apunta a la organizacion prism-ml, por lo que la trazabilidad del artefacto concreto debe comprobarse.
- La model card original aparece truncada en la informacion disponible (termina en la seccion "Memory Requirement"), por lo que pueden faltar datos de despliegue y licencias de componentes.
- Registrar 0 descargas y 0 likes indica ausencia de validacion por parte de la comunidad en el momento de la consulta.
- Requiere kernels especificos (fork de llama.cpp con soporte de atencion hibrida de 2 bits): no funcionara correctamente en builds genericos de llama.cpp ni en otros motores de inferencia sin soporte para Q2_0_g128 hibrido.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/devendradhakad/autodroid-prism-ml-Ternary-Bonsai-27B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Discord: https://discord.gg/prismml
- Fork de llama.cpp con kernels de baja precision (CUDA + Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Companero MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-mlx-2bit
- Companero 1-bit en GGUF (clase movil): https://huggingface.co/prism-ml/Bonsai-27B-gguf
