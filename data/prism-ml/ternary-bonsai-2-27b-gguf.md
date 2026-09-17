# prism-ml/Ternary-Bonsai-2-27B-gguf

## Resumen

Ternary-Bonsai-2-27B es una version cuantizada a pesos ternarios de Qwen3.8-27B, publicada por Prism ML (prism-ml) en formato GGUF para llama.cpp. El modelo mantiene la arquitectura del modelo base —transformer causal de atencion hibrida, con aproximadamente un 75% de atencion lineal y un 25% de atencion completa— pero sustituye todos los pesos lineales (embeddings, proyecciones de atencion, proyecciones MLP y cabeza LM) por valores en {-1, 0, +1} con una escala FP16 compartida por cada grupo de 128 pesos. El resultado es un modelo de clase 27B que ocupa 5,95 GB en el empaquetado PTQ1_0 y 7,21 GB en PQ2_0, frente a los aproximadamente 54 GB de una version FP16.

La propuesta del modelo es llevar razonamiento completo de 27B a portatiles y a una sola GPU consumer sin recurrir a representaciones de bajo bit que degradan el modo "thinking". El autor declara una retencion del 98,2% de la inteligencia FP16 (84,78 de media en 14 benchmarks en modo thinking) y un rendimiento de unos 47 tok/s en un portatil con Apple M5 Max. Mantiene un contexto de 262.144 tokens, viable en dispositivo gracias al backbone de atencion mayoritariamente lineal heredado del modelo base.

Es relevante ahora porque la cuantizacion ternaria con rotacion Hadamard aplicada a todas las matrices, sin "escapes" de alta precision, es un punto poco explorado en el regimen sub-4-bit: el autor situa su build convencional IQ2_XXS en 72,59 puntos de media con una huella mas de un 50% superior. El repositorio, creado el 16 de septiembre de 2026 y actualizado un dia despues, acumulaba 0 descargas y 17 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion hibrida (~75% lineal / ~25% completa), MLP SwiGLU, RoPE, RMSNorm; pesos ternarios |
| Parametros totales | 27,36 mil millones (24,35B backbone de 64 bloques + 2,54B embeddings/cabeza LM + 0,46B torre de vision de 27 bloques). El recuento de safetensors del repo indica 26.895.998.464 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 262.144 tokens (262K), heredada del modelo base |
| Tipos de cuantizacion | Ternaria g128 ({-1, 0, +1} con escala FP16 por grupo de 128 pesos); empaquetados PTQ1_0 (1,75 bits/peso) y PQ2_0 (2,13 bits/peso); la torre de vision se distribuye aparte en mmproj Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con metadatos de rotacion Hadamard que el runtime debe aplicar; existe companion en MLX a 2 bits |
| Tamano desplegado | 5,95 GB (PTQ1_0) / 7,21 GB (PQ2_0); 5,8 GB en el ideal de 1,72 bits/peso |
| Coste real de almacenamiento | 1,72 bits/peso (1,71 bits/peso en el formato ternario + tensores fuera de la representacion ternaria); ~9,3x de reduccion ideal frente a FP16 |
| Backends soportados | llama.cpp (CUDA, Metal, CPU) con kernels propios |
| Tamano del repositorio | 76,1 GB |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

La arquitectura reproduce la del modelo base Qwen3.8-27B sin cambios estructurales: 64 bloques con atencion hibrida —mayoritariamente lineal, con atencion completa en aproximadamente una cuarta parte de las capas—, MLP con activacion SwiGLU, RoPE y RMSNorm. La innovacion esta en la representacion de pesos: cada peso toma un valor ternario y comparte una unica escala FP16 con los otros 127 pesos de su grupo (formato "ternary g128"). Un trit transporta log2(3) = 1,585 bits de informacion, de modo que el coste amortizado del formato se queda en unos 1,71 bits/peso; contando el pequeno conjunto de tensores que no se ternarizan, el modelo completo queda en 1,72 bits/peso.

Antes de la asignacion ternaria, cada matriz se transforma mediante una rotacion ortogonal de Hadamard por bloques de 1024 con signos fijos ±1, y la transformacion correspondiente se aplica a las activaciones en tiempo de ejecucion. La rotacion se pliega en los pesos almacenados en el proceso offline, por lo que no anade bits ni trafico de pesos adicional; el fichero declara la rotacion como metadato, de forma que un runtime o aplica la transformacion coincidente o rechaza cargar el modelo. La ternarizacion cubre embeddings, proyecciones de atencion, proyecciones MLP y cabeza LM, sin capas de alta precision escondidas detras de una etiqueta de bajo bit. Los pesos empaquetados se consumen directamente en los kernels, nunca se expanden a FP16. La torre de vision, de 0,46B parametros y 27 bloques, se distribuye como pack mmproj Q8_0 separado de ~0,63 GB y solo se carga cuando hay entrada de imagen.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo etapas de RLHF, DPO u otro alineamiento en la creacion del modelo base o en el proceso de cuantizacion. El autor publica un whitepaper con la metodologia completa, pero sus cifras no se recogen en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" (pensamiento explicito antes de la respuesta).
- Matematicas: el autor reporta 96,57 puntos en la bateria de matematicas, a medio punto de la precision completa.
- Codigo: 89,42 puntos, al nivel de la linea base.
- Tool calling y comportamiento agentico: 74,92 puntos en llamadas a herramientas dentro de un flujo agentico, capacidad que el autor destaca como preservada en el regimen sub-4-bit.
- Razonamiento multi-paso y flujos de agente con contexto largo, gracias a los 262.144 tokens de ventana.
- Vision: analisis de imagenes mediante el pack mmproj Q8_0 opcional; sin ese fichero el modelo es solo texto.
- Inferencia en dispositivo: soporte de CUDA, Metal y CPU a traves de llama.cpp.
- Capacidades multilingues: no disponible.
- Otras capacidades especiales no declaradas (audio, decodificacion especulativa, etc.): no disponible.

## Casos de uso

- Asistente de razonamiento en portatil: con 5,95 GB en PTQ1_0, el modelo cabe en la memoria unificada de un Mac con Apple Silicon y rinde ~47 tok/s en un M5 Max, lo que permite usar razonamiento de clase 27B sin conexion ni GPU dedicada.
- Analisis de repositorios completos: la ventana de 262.144 tokens permite cargar arboles de codigo o diffs extensos y razonar sobre ellos en una sola pasada, con ayuda de tool calling para consultar ficheros adicionales.
- Agente de CI/CD para revision de pull requests: el modelo puede invocarse desde un runner con GPU para generar parches, ejecutar comprobaciones mediante function calling y dejar comentarios; su tamano reducido abarata el coste por runner frente a un 27B en FP16.
- Procesamiento de documentos sensibles en local: despachos juridicos, sanidad o banca pueden ejecutar el modelo en su propio hardware sin enviar datos a terceros, aprovechando el contexto largo para contratos o historiales extensos.
- Digitalizacion con vision: cargando el mmproj Q8_0, el modelo puede extraer informacion de capturas, formularios escaneados o diagramas y continuar el razonamiento en texto sobre lo extraido.
- Atencion al cliente multi-turno: conversaciones largas con historial completo dentro de la ventana de 262K tokens, con tool calling para consultar sistemas internos (estado de pedido, catalogo) sin perder el hilo.
- Evaluacion de tecnicas de cuantizacion: investigadores en compresion de modelos pueden usar el par PTQ1_0/PQ2_0 y los kernels publicados como referencia reproducible para estudiar el comportamiento de pesos ternarios a escala 27B.
- Despliegue en el borde sin conectividad: kioscos, equipos industriales o vehiculos con una GPU de 8-12 GB pueden ejecutar el modelo de forma autonoma en PTQ1_0.

## Benchmarks y rendimiento

Los datos disponibles proceden del autor y se limitan a una bateria agregada de 14 benchmarks en modo thinking, sin desglose por tarea estandar. No hay resultados publicados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

| Metrica (bateria de 14 benchmarks en modo thinking) | Ternary-Bonsai-2-27B (PTQ1_0) | IQ2_XXS convencional | UD-Q4_K_XL | FP16 |
|---|---|---|---|---|
| Media agregada | 84,78 | 72,59 | No disponible (a 0,4 puntos del ternario, segun el autor) | No disponible (retencion declarada del 98,2%; implica un orden de 86,3, valor derivado) |
| Matematicas | 96,57 | No disponible | No disponible | No disponible (a medio punto, segun el autor) |
| Codigo | 89,42 | No disponible | No disponible | No disponible (al nivel de la linea base, segun el autor) |
| Tool calling agentico | 74,92 | No disponible | No disponible | No disponible |
| Huella | 5,95 GB (1,75 bits/peso) | Mas de 1,5x la huella del ternario | ~3x la huella del ternario | ~54 GB |

Throughput declarado: aproximadamente 47 tok/s en un portatil con Apple M5 Max. No se publican cifras de throughput para CUDA ni para CPU.

## Requisitos de hardware

- Pesos en disco o memoria: 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0); anadir 0,63 GB si se carga la torre de vision en Q8_0.
- VRAM estimada para inferencia: los pesos caben comodamente en 8 GB, pero hay que sumar la KV cache. Su tamano a 262K tokens no esta publicado, de modo que la VRAM total necesaria para contexto completo es "no disponible". Cabe esperar que sea inferior a la de un transformer denso equivalente, porque cerca del 75% de los bloques usa atencion lineal.
- Cabe en GPU consumer: si. Una RTX 3060 de 12 GB, una RTX 4070/4080/4090 o cualquier Mac con memoria unificada de 16 GB o mas pueden alojar los pesos; el contexto util dependera de la memoria restante.
- GPU de datacenter: A100, H100 u H200 permiten contexto largo y mayor concurrencia, aunque el modelo esta disenado para escenarios de dispositivo.
- Opciones de despliegue: llama.cpp (CUDA, Metal, CPU) con el fork de Prism ML que aporta los kernels ternarios de atencion hibrida; tambien existe un fork de MLX y un fork de mlx-swift para iOS/macOS, con el companion Ternary-Bonsai-2-27B-mlx-2bit. No se mencionan vLLM, TGI, Ollama ni TensorRT-LLM en la informacion disponible.
- Latencia y throughput: ~47 tok/s en Apple M5 Max. Sin datos para CUDA y CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Huella | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (PTQ1_0) | 27,36B | 262K | 5,95 GB (1,75 bits/peso) | 84,78 de media en 14 benchmarks thinking | Apache 2.0 |
| Ternary-Bonsai-2-27B (PQ2_0) | 27,36B | 262K | 7,21 GB (2,13 bits/peso) | No disponible | Apache 2.0 |
| Ternary-Bonsai-2-27B (MLX 2 bits) | 27,36B | No disponible | No disponible | No disponible | Apache 2.0 |
| Build IQ2_XXS sobre la misma base | ~27B | No disponible | Mas de 1,5x la del ternario | 72,59 de media | Depende del publicador |
| Build UD-Q4_K_XL sobre la misma base | ~27B | No disponible | ~3x la del ternario | A 0,4 puntos del ternario, segun el autor | Depende del publicador |
| Qwen3.8-27B en FP16 | 27,36B | 262K | ~54 GB | Linea base (98,2% de retencion del ternario) | Apache 2.0 (segun el modelo base declarado) |

No hay datos disponibles para comparar con alternativas de otros fabricantes en el mismo regimen de cuantizacion ternaria.

## Limitaciones y advertencias

- Los benchmarks son autopublicados por el desarrollador y se presentan como media agregada de 14 pruebas en modo thinking, sin desglose por tarea ni resultados de referencia estandar como MMLU, HumanEval o GSM8K.
- El valor de FP16 en la tabla se deriva de la retencion del 98,2% declarada, no es una cifra publicada de forma explicita.
- Adopcion muy incipiente: 0 descargas y 17 "likes" en el momento de la consulta, con el repositorio creado en septiembre de 2026.
- Los kernels ternarios requieren el fork de llama.cpp de Prism ML para CUDA y Metal; un llama.cpp estandar no puede ejecutar estos pesos.
- El fichero declara su rotacion Hadamard como metadato: un runtime que no aplique la transformacion coincidente rechazara cargar el modelo, lo que ata el despliegue a versiones concretas del runtime.
- Los idiomas soportados no estan declarados; no se puede asumir cobertura multilingue sin verificacion.
- Al derivar de Qwen/Qwen3.8-27B, hereda los sesgos, el conocimiento de corte y las limitaciones del modelo base, incluido el riesgo de alucinacion.
- El modo thinking incrementa el numero de tokens generados, lo que afecta a la latencia percibida y al coste en produccion.
- La cuantizacion a 1,72 bits/peso puede degradar tareas no cubiertas por la bateria de 14 benchmarks; conviene validar con datos propios antes de desplegar.
- Las capacidades de vision solo existen si se carga el pack mmproj Q8_0; sin el, la entrada es exclusivamente texto.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base declarado.
- La CPU figura como backend soportado, pero no se publican cifras de rendimiento ni de latencia para ese caso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Companion MLX 2 bits: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios (CUDA y Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Discord: https://discord.gg/prismml
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados no relacionados con este modelo (Prism Launcher, GraphPad Prism y el editor LaTeX Prism de OpenAI); no se han encontrado papers, articulos ni demos adicionales fuera de los enlaces facilitados por el autor.
