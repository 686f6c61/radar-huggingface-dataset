# Iambackup/Ternary-Bonsai-2-27B-mlx-2bit

## Resumen

Bonsai 2 27B es una version cuantizada de forma ternaria del modelo Qwen3.8-27B, un transformer causal de 27,36B parametros con atencion hibrida. La ficha corresponde a la conversion a formato MLX publicada por el usuario Iambackup bajo el identificador `Iambackup/Ternary-Bonsai-2-27B-mlx-2bit`; el desarrollo original del metodo y de los kernels procede de Prism ML, y el repositorio oficial en GGUF se distribuye bajo el espacio `prism-ml`. El modelo resuelve un problema concreto: ejecutar un modelo de clase 27B con razonamiento, codigo y capacidades agenticas en equipos de consumo, reduciendo el peso en disco de unos 54 GB en FP16 a 8,60 GB.

La clave tecnica es que todos los pesos del modelo de lenguaje (embeddings, proyecciones de atencion, proyecciones MLP y LM head) estan representados en valores ternarios {−1, 0, +1} con una escala FP16 compartida por cada grupo de 128 pesos, sin capas de escape en alta precision. Segun el autor, se conserva el 98,2% de la inteligencia del modelo FP16, con una media de 84,78 en 14 benchmarks en modo thinking. El pack incluye ademas la torre de vision oficial del modelo base, sin cuantizar, de 0,92 GB.

Es relevante ahora porque demuestra que el regimen sub-4-bit puede mantener razonamiento, matematicas y tool calling agentico, donde las representaciones de baja precision convencionales suelen degradarse de forma acusada. El contexto heredado de 262.144 tokens se mantiene practico gracias a que aproximadamente el 75% de las capas usan atencion lineal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion hibrida (~75% atencion lineal / ~25% atencion completa), SwiGLU MLP, RoPE, RMSNorm; pesos ternarios g128 en base rotada por Hadamard |
| Parametros totales | 27.359.638.768 (27,36B): 24,35B backbone de lenguaje (64 bloques) + 2,54B embeddings/LM head + 0,46B torre de vision (27 bloques) |
| Longitud de contexto | 262.144 tokens (262K), heredada del modelo base |
| Tipos de cuantizacion | Ternaria g128: valores {−1, 0, +1} con una escala FP16 por grupo de 128 pesos. 1,72 bits/peso reales como representacion; 2,25 bits/peso tal como los almacena MLX. Existe un repo companero GGUF con dos empaquetados: PTQ1_0 (5,95 GB) y PQ2_0 (7,21 GB) |
| Idiomas soportados | no disponible (la model card no declara listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en contenedor MLX; existe version GGUF en repo separado |
| Tamano en disco | 8,60 GB (7,67 GB modelo de lenguaje + 0,92 GB torre de vision) |
| Modelo base | Qwen/Qwen3.8-27B (arquitectura sin cambios) |
| Backends soportados | Apple MLX (Python, Swift) y CUDA |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B sin modificar la arquitectura: se trata de un proceso de cuantizacion posterior al entrenamiento (PTQ) sobre un backbone de atencion hibrida con SwiGLU, RoPE y RMSNorm. La innovacion principal es la representacion ternaria g128: cada matriz de pesos se transforma primero mediante una rotacion ortogonal de Hadamard por bloques (bloque de 1024, con signos ±1 fijos) y despues se asignan los valores ternarios. La rotacion queda plegada en los pesos almacenados, de modo que no consume bits adicionales, y el runtime aplica la transformada correspondiente a las activaciones. El archivo declara la rotacion como metadato, de forma que un runtime o bien aplica la transformada correcta o rechaza cargar el fichero.

Los kernels son especificos: hay implementaciones propias de atencion hibrida ternaria para Apple MLX (Python y Swift) y para CUDA, que consumen los pesos empaquetados directamente sin expandirlos a FP16. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que el modelo no se reentrena: hereda esas caracteristicas del modelo base. Tampoco se especifica el volumen de datos de calibracion usado en la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento en modo thinking: mantiene el comportamiento de razonamiento extendido del modelo base, con una media de 84,78 en 14 benchmarks de este tipo.
- Matematicas: 96,57 puntos en la metrica de matematicas reportada, a menos de medio punto de la version en precision completa.
- Generacion de codigo: 89,42, en linea con la linea base de referencia.
- Tool calling y comportamiento agentico: 74,92 en la metrica de tool calling agentico, conservado en el regimen sub-4-bit.
- Vision: incluye la torre de vision oficial de Qwen3.8-27B, 0,46B parametros y 0,92 GB en FP16, sin cuantizar.
- Contexto largo: ventana de 262.144 tokens, viable en dispositivo gracias al backbone predominantemente de atencion lineal.
- Ejecucion local en dispositivo: pesos empaquetados consumidos sin expansion, con kernels nativos para MLX y CUDA.
- Capacidades multilingues: no disponible (no se declara listado de idiomas).

## Casos de uso

- Asistentes de razonamiento en portatil: con 8,60 GB en disco y unos 47 tok/s en un Apple M5 Max, permite ejecutar un modelo de clase 27B con modo thinking sin GPU dedicada ni conexion a servicios en la nube.
- Analisis de documentos extensos: la ventana de 262.144 tokens admite contratos, informes tecnicos o bases de codigo completas en una sola pasada, algo inviable en modelos de 7-8B con contexto corto.
- Agentes con tool calling en local: el modelo conserva comportamiento agentico (74,92 en la metrica reportada), lo que permite construir flujos multi-paso que invocan funciones, APIs o consultas a bases de datos sin enviar datos a terceros.
- Generacion de codigo en pipelines internos: con un resultado de 89,42 en la evaluacion de codigo, puede integrarse en tareas de autocompletado, revision de parches o generacion de pruebas dentro de entornos con requisitos de confidencialidad.
- Procesamiento de documentos con imagen: al incluir la torre de vision, admite entrada multimodal para extraer informacion de capturas, formularios escaneados o diagramas, combinando vision con razonamiento de contexto largo.
- Despliegue en movil y escritorio macOS/iOS: existe un fork de `mlx-swift`, lo que habilita integrar el modelo en aplicaciones nativas de Apple sin depender de servidores.
- Tutorizacion y resolucion de problemas matematicos: el 96,57 en matematicas lo hace apto para asistencia paso a paso donde se necesita mostrar el razonamiento y no solo el resultado.
- Servicio self-hosted con llama.cpp: mediante el repo GGUF companero (PTQ1_0 de 5,95 GB o PQ2_0 de 7,21 GB) puede desplegarse en CUDA, Metal o CPU con el ecosistema habitual.

## Benchmarks y rendimiento

Los datos disponibles son agregados; la model card no desglosa los resultados por benchmark individual.

| Metrica | Ternary-Bonsai-2-27B | IQ2_XXS (referencia convencional) | UD-Q4_K_XL | FP16 (base) |
|---|---|---|---|---|
| Media en 14 benchmarks de modo thinking | 84,78 | 72,59 | a menos de 0,4 puntos | referencia (100% de inteligencia) |
| Matematicas | 96,57 | no disponible | no disponible | a menos de 0,5 puntos |
| Codigo | 89,42 | no disponible | no disponible | en linea con la linea base |
| Tool calling agentico | 74,92 | no disponible | no disponible | no disponible |
| Inteligencia retenida respecto a FP16 | 98,2% | no disponible | no disponible | 100% |
| Tamano en disco | 8,60 GB (MLX) | mas del doble del footprint | aproximadamente tres veces el footprint | ~54 GB |

## Requisitos de hardware

- Peso en disco: 8,60 GB en formato MLX (7,67 GB de lenguaje + 0,92 GB de torre de vision). En GGUF, 5,95 GB con PTQ1_0 y 7,21 GB con PQ2_0.
- VRAM estimada: no disponible de forma explícita; la model card incluye una tabla de requisitos de memoria que no esta completa en la informacion proporcionada. Como referencia, el peso del modelo mas el overhead del runtime y la cache KV sugiere un minimo practico en el entorno de 10-12 GB para contextos moderados.
- GPU y aceleradores: Apple Silicon mediante MLX (Python y Swift), GPUs NVIDIA mediante los kernels CUDA del fork de llama.cpp, y CPU a traves de llama.cpp.
- Cabe en hardware de consumo: si. El caso reportado es un portatil Apple M5 Max a unos 47 tok/s. No se publican cifras para GPUs de consumo como la RTX 4090.
- Opciones de despliegue: MLX (Python), mlx-swift para iOS/macOS, llama.cpp con los kernels CUDA/Metal/CPU del fork de Prism ML. No se menciona soporte de vLLM, TGI u Ollama.
- Latencia y throughput: aproximadamente 47 tok/s en Apple M5 Max. No se publican mediciones para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso en disco | Media en 14 benchmarks | Licencia |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (MLX) | 27,36B | 262K | 8,60 GB | 84,78 | Apache 2.0 |
| Ternary-Bonsai-2-27B (GGUF PTQ1_0) | 27,36B | 262K | 5,95 GB | no disponible en la informacion | Apache 2.0 |
| IQ2_XXS del mismo modelo base | 27B | no disponible | mas del doble del footprint | 72,59 | no disponible |
| UD-Q4_K_XL del mismo modelo base | 27B | no disponible | aproximadamente 3x el footprint | a menos de 0,4 puntos por debajo | no disponible |
| Qwen3.8-27B en FP16 | 27B | 262K | ~54 GB | referencia (98,2% retenido por Bonsai) | no disponible |

No se dispone de datos comparativos con otros modelos ternarios o de baja precision de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision: se retiene el 98,2% de la inteligencia del modelo FP16, es decir, hay una degradacion medible respecto al original. No se recomienda para tareas donde cualquier desviacion sea critica.
- Dependencia de runtimes especificos: los kernels ternarios requieren los forks de MLX o de llama.cpp de Prism ML. El modelo no es cargable con MLX upstream ni probablemente con llama.cpp estandar, lo que limita su integracion en stacks ya establecidos.
- Formato de almacenamiento menos eficiente en MLX: MLX guarda una escala y un sesgo por grupo, lo que eleva el coste a 2,25 bits/peso frente a 1,75 bits/peso del empaquetado GGUF PTQ1_0. El mismo modelo pesa mas en MLX que en GGUF.
- Idiomas no declarados: la model card no especifica la cobertura linguistica, por lo que la calidad fuera de los idiomas cubiertos por el modelo base es desconocida.
- Riesgo de alucinacion: es un modelo de lenguaje generativo con decodificacion autoregresiva y modo thinking; puede producir afirmaciones plausibles pero falsas, especialmente en dominios especializados y con contexto largo.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de alineacion especifica para esta conversion.
- Repositorio de terceros: la ficha corresponde a una publicacion de `Iambackup` con 0 descargas y 0 likes, creada en septiembre de 2026 y sin actualizaciones. El material de referencia oficial apunta a Prism ML y al espacio `prism-ml`; conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Torre de vision sin cuantizar: ocupa 0,92 GB en FP16 dentro del pack, lo que rompe parcialmente la premisa de eficiencia extrema del conjunto.
- Documentacion incompleta en la ficha de HuggingFace: la tabla de requisitos de memoria aparece truncada y no hay desglose de benchmarks por tarea.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.8-27B no se detallan en la informacion disponible y habria que verificarlas por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Iambackup/Ternary-Bonsai-2-27B-mlx-2bit
- Version GGUF companera: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos (setup probado, binarios, serving y benchmarking): https://github.com/PrismML-Eng/Bonsai-demo
- Fork de MLX con kernels de bajo bit: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Fork de llama.cpp (CUDA): https://github.com/PrismML-Eng/llama.cpp
- Discord de la comunidad: https://discord.gg/prismml
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
