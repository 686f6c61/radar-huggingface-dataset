# Oscilla/Ternary-Bonsai-4B-mlx-2bit

## Resumen

Ternary-Bonsai-4B-mlx-2bit es una distribucion en formato MLX de pesos ternarios (1,58 bits) del modelo Ternary-Bonsai-4B, publicada por el usuario Oscilla y derivada de prism-ml/Ternary-Bonsai-4B-unpacked, cuyo entrenamiento corresponde a Prism ML sobre la arquitectura Qwen3-4B. El repositorio contiene 4.021.784.576 parametros empaquetados con el formato MLX 2-bit (grupos de 128 pesos con escala FP16 compartida), lo que ocupa 1,05 GiB (1,13 GB) en disco y 1,1 GB de repositorio, frente a los 8,04 GB que ocuparian los mismos pesos en FP16: una reduccion del 85,9%, es decir 7,1 veces menos memoria.

Su relevancia actual reside en que permite ejecutar un modelo de clase 4B en hardware de consumo Apple, incluidos iPhone y iPad, con decodificacion de 133 tok/s en un M4 Pro (4,8x mas rapido que la version FP16) y 50 tok/s en un iPhone 17 Pro Max. El autor declara una media de 70,7 puntos en el conjunto de seis benchmarks publicado, en el rango de modelos densos de 4B en precision completa, aunque por debajo de su modelo base Qwen3 4B (77,1).

La ficha describe la variante MLX del modelo; el mismo autor publica el modelo sin empaquetar y la version ternaria de 8B esta documentada en el whitepaper enlazado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3-4B): GQA con 32 cabezas de consulta y 8 de clave/valor, MLP SwiGLU, RoPE, RMSNorm, LM head atada |
| Parametros totales | 4.021.784.576 (4,0B; aproximadamente 3,6B sin contar embeddings) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Ternaria (1,58 bits) empaquetada en formato MLX 2-bit; valor de peso en {-1, 0, +1} con una escala FP16 por grupo de 128 pesos; coste teorico ~1,71 bits/peso y ~2,125 bits/peso efectivos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); no se distribuyen pesos GGUF en este repositorio |
| Modelo base | prism-ml/Ternary-Bonsai-4B-unpacked (entrenado sobre Qwen3-4B) |
| Capas | 36 bloques decoder transformer |
| Tamano de vocabulario | 151.936 |
| Cobertura de la ternarizacion | Embeddings, proyecciones de atencion, proyecciones del MLP y LM head |
| Tamano empaquetado | 1,05 GiB (1,13 GB); el repositorio ocupa 1,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B sin modificaciones estructurales: 36 bloques decoder transformer con Grouped Query Attention (32 cabezas de consulta, 8 de clave/valor), MLP de tipo SwiGLU, codificacion posicional RoPE y normalizacion RMSNorm, con un vocabulario de 151.936 entradas y una ventana de contexto de 32.768 tokens. La innovacion no esta en la topologia, sino en la representacion numerica de los pesos: todos los pesos de embeddings, proyecciones de atencion, proyecciones del MLP y la LM head se restringen a valores ternarios {-1, 0, +1}, multiplicados por una unica escala FP16 compartida por cada grupo de 128 pesos (`w_i = scale_g * t_i`). El coste informacional teorico es log2(3) ≈ 1,585 bits por peso, mas 16 bits por cada 128 pesos para las escalas, lo que da un minimo teorico de ~1,71 bits/peso; la implementacion real usa el formato MLX 2-bit, que almacena cada valor ternario en 2 bits mas las escalas, con un total efectivo de ~2,125 bits/peso.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; el modelo deriva de Qwen3-4B y del pipeline de ternarizacion de Prism ML descrito en su whitepaper. Si se documenta el punto de partida de una version previa de 1 bit (1-bit Bonsai 4B, 0,57 GB) que obtenia 62,7 puntos de media, frente a los 70,7 de esta variante ternaria, lo que indica una ganancia de 8 puntos al pasar de 1 a 1,58 bits por peso. Las evaluaciones publicadas se ejecutaron con EvalScope v1.4.2 y vLLM 0.15.1 sobre NVIDIA H100, no sobre MLX.

## Capacidades

- Generacion de texto y conversacion multi-turno, con un pipeline declarado de `text-generation`.
- Razonamiento de sentido comun y multietapa: MuSR 45,1 en la evaluacion publicada.
- Aritmetica y razonamiento matematico de nivel escolar: GSM8K 90,5.
- Generacion de codigo: HumanEval+ 78,7.
- Seguimiento de instrucciones: IFEval 72,1.
- Tool calling y function calling: BFCLv3 67,8, lo que indica soporte funcional para invocacion de herramientas, aunque por debajo de Qwen3 4B (78,9).
- Conocimiento general y academico: MMLU-R 69,7.
- Ejecucion en dispositivo: el formato 2-bit esta soportado de forma nativa por los kernels de MLX y mlx-swift, de modo que el modelo corre en macOS, iOS e iPadOS sin conversion previa.
- Capacidades especiales: no se documentan modo de pensamiento explicito, vision ni audio en la informacion disponible.
- Capacidades multilingues: no disponible; no se declara el conjunto de idiomas soportados.

## Casos de uso

- Asistentes conversacionales en el dispositivo: con 1,05 GiB de pesos y 32.768 tokens de contexto, el modelo puede mantener conversaciones multi-turno con historial largo completamente en local en un iPhone, iPad o Mac, sin enviar datos a un servicio externo.
- Generacion de codigo en herramientas de desarrollo locales: con HumanEval+ 78,7 puede integrarse en plugins de editor o CLI para autocompletar y explicar codigo, ejecutandose en el portatil del desarrollador sin GPU dedicada.
- Automatizacion de agente con tool calling: BFCLv3 67,8 permite construir agentes que invoquen funciones, consulten APIs o manipulen ficheros, con la ventaja de que el bucle de decision se ejecuta localmente y a bajo coste.
- Resolucion de problemas matematicos y tutoria educativa: GSM8K 90,5 lo hace util para asistentes de ejercicios paso a paso en aplicaciones educativas offline.
- Clasificacion y extraccion de informacion con contexto largo: la ventana de 32.768 tokens permite procesar contratos, informes o transcripciones completas en una sola pasada para resumir o extraer campos estructurados.
- Prototipado e investigacion en cuantizacion extrema: sirve como referencia reproducible para estudiar la degradacion de un modelo 4B al ternarizarlo, comparando sus 70,7 puntos de media con los 77,1 de Qwen3 4B en FP16.
- Aplicaciones de privacidad estricta en movilidad: al caber en un telefono y funcionar a 50 tok/s en un iPhone 17 Pro Max, es viable en escenarios de campo (sanidad, legal, inspeccion) donde no se permite conexion a red.
- Filtrado y moderacion de contenido en el borde: el bajo coste de memoria permite desplegar varias instancias o combinarlo con otros modelos pequenos en un mismo dispositivo.

## Benchmarks y rendimiento

Evaluados por el autor con EvalScope v1.4.2 y vLLM 0.15.1 sobre NVIDIA H100. Conjunto completo de 10 benchmarks; se reproducen las columnas publicadas:

| Modelo | Tamano | Media | MMLU-R | MuSR | IFEval | GSM8K | HE+ | BFCLv3 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Ternary Bonsai 4B | 0,86 GB | 70,7 | 69,7 | 45,1 | 72,1 | 90,5 | 78,7 | 67,8 |
| 1-bit Bonsai 4B (anterior) | 0,57 GB | 62,7 | 58,7 | 41,4 | 69,6 | 87,3 | 71,3 | 48,0 |
| Qwen 3 4B | 8,04 GB | 77,1 | 79,8 | 57,4 | 80,0 | 92,1 | 74,4 | 78,9 |
| Ministral3 3B | 6,86 GB | 73,2 | 77,5 | 56,5 | 73,1 | 91,4 | 69,5 | 71,3 |
| Gemma 3 4B | 7,76 GB | 67,9 | 66,0 | 46,3 | 73,0 | 89,8 | 67,1 | 65,1 |
| Llama 3.2 3B | 6,43 GB | 64,4 | 65,5 | 48,9 | 78,3 | 80,1 | 52,4 | 60,9 |

Nota: la tabla de benchmarks del autor asigna al modelo un tamano de 0,86 GB, mientras que la tabla de memoria del mismo documento declara 1,05 GiB (1,13 GB) para el formato MLX 2-bit g128. La discrepancia no se explica en la informacion disponible.

Throughput declarado:

| Plataforma | Backend | PP512 (tok/s) | TG128 (tok/s) | TG FP16 o 4-bit (tok/s) | Aceleracion |
|---|---|---:|---:|---:|---:|
| M4 Pro 48 GB | MLX (Python) | 817 | 133 | 28 (FP16) | 4,8x |
| iPhone 17 Pro Max | MLX Swift | 659 | 50 | 27 (4-bit) | 1,8x |

El autor define ademas una metrica de densidad de inteligencia: `density = -ln(1 - score/100) / size_GB`, cuyo valor para este modelo queda truncado en la informacion disponible.

## Requisitos de hardware

- Pesos en disco: 1,05 GiB (1,13 GB) en formato MLX 2-bit; repositorio completo de 1,1 GB.
- Memoria en ejecucion: aproximadamente 1,1-1,5 GB para pesos, mas la cache KV correspondiente al contexto (32.768 tokens maximos con GQA de 8 cabezas KV); el consumo crece de forma apreciable con contextos largos.
- Cabe en GPU de consumo: si, con margen amplio, aunque este repositorio concreto usa la libreria MLX y esta pensado para Apple Silicon. Cualquier Mac Apple Silicon reciente y cualquier iPhone o iPad compatible con MLX Swift puede ejecutarlo.
- GPU recomendadas: no aplica para esta variante (no hay pesos CUDA/GGUF en el repositorio). Las evaluaciones del autor se hicieron sobre NVIDIA H100 con vLLM 0.15.1, presumiblemente sobre los pesos sin empaquetar; para CUDA seria necesario usar el modelo base o convertir los pesos a otro formato.
- Opciones de despliegue: `mlx-lm` en Python para macOS, `mlx-swift` para iOS/iPadOS; los kernels de MLX soportan el formato 2-bit de forma nativa. No se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI para esta variante MLX.
- Latencia y throughput: 817 tok/s de prefill (PP512) y 133 tok/s de decodificacion (TG128) en M4 Pro de 48 GB con MLX Python, 4,8x mas rapido que FP16 en el mismo equipo; 659 tok/s de prefill y 50 tok/s de decodificacion en iPhone 17 Pro Max con MLX Swift, 1,8x mas rapido que una cuantizacion 4-bit.
- Latencia hasta primer token: no disponible de forma desglosada, aunque los valores de PP512 permiten estimarla.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Media de benchmarks | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Ternary-Bonsai-4B-mlx-2bit | 4,0B | 1,05 GiB (MLX 2-bit) | 32.768 | 70,7 | Apache 2.0 | HuggingFace, formato MLX para Apple Silicon |
| Qwen 3 4B (modelo base) | 4,0B | 8,04 GB (FP16) | 32.768 | 77,1 | Apache 2.0 | HuggingFace, multiples formatos |
| Ministral3 3B | 3B | 6,86 GB | No disponible en la informacion proporcionada | 73,2 | No disponible | HuggingFace |
| Gemma 3 4B | 4B | 7,76 GB | No disponible en la informacion proporcionada | 67,9 | No disponible | HuggingFace |
| Llama 3.2 3B | 3B | 6,43 GB | No disponible en la informacion proporcionada | 64,4 | No disponible | HuggingFace |
| 1-bit Bonsai 4B (version anterior) | 4,0B | 0,57 GB | No disponible | 62,7 | Apache 2.0 (segun el modelo base) | HuggingFace |

La ventaja competitiva es de tamano y velocidad, no de precision: Ternary Bonsai 4B ocupa entre 6 y 7,7 veces menos que sus competidores en FP16 y pierde 6,4 puntos de media frente a Qwen3 4B, pero supera a Gemma 3 4B y a Llama 3.2 3B en la misma evaluacion a una septima parte del tamano. La diferencia mas acusada frente al modelo base esta en MuSR (45,1 frente a 57,4) y BFCLv3 (67,8 frente a 78,9).

## Limitaciones y advertencias

- La ternarizacion degrada la calidad de forma medible: 70,7 de media frente a 77,1 del modelo base Qwen3 4B, con caidas notables en razonamiento de sentido comun (MuSR, -12,3 puntos) y en tool calling (BFCLv3, -11,1 puntos). No es un sustituto directo de un 4B en FP16 en tareas que dependan de estas capacidades.
- Riesgo de alucinacion: no se publican tasas de alucinacion; la cuantizacion agresiva a 1,58 bits tiende a incrementarlo respecto al modelo original, por lo que se recomienda validacion en aplicaciones factuales.
- Idiomas soportados: no declarados. Aunque el modelo base Qwen3 es multilingue, la ternarizacion puede afectar de forma desigual a idiomas con menos presencia en el entrenamiento; no hay datos al respecto.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion en la informacion disponible.
- Licencia Apache 2.0, permisiva para uso comercial, pero la informacion disponible no detalla las condiciones del pipeline de ternarizacion de Prism ML ni posibles avisos adicionales sobre el modelo base.
- La discrepancia entre el tamano declarado en la tabla de benchmarks (0,86 GB) y el de la tabla de memoria (1,05 GiB) no esta explicada; conviene verificar la cifra real antes de dimensionar despliegues.
- Los benchmarks se ejecutaron con vLLM sobre H100, no con MLX sobre Apple Silicon: el rendimiento en calidad del formato empaquetado de 2 bits usado en produccion en macOS/iOS no esta verificado de forma independiente en la informacion disponible.
- Esta variante concreta depende de MLX y de Apple Silicon; no hay pesos GGUF ni compatibilidad declarada con vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Contexto maximo de 32.768 tokens: tareas que requieran ventanas mayores necesitaran troceado o recuperacion externa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y lo publica un usuario distinto del autor del modelo base (Oscilla frente a prism-ml), por lo que se recomienda verificar la integridad de los pesos antes de usarlos en produccion.
- El modelo no declara modo de pensamiento ni capacidades multimodales; tareas de vision o audio quedan fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/Ternary-Bonsai-4B-mlx-2bit
- Modelo base sin empaquetar: https://huggingface.co/prism-ml/Ternary-Bonsai-4B-unpacked
- Web de Prism ML: https://prismml.com
- Whitepaper de Ternary Bonsai: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/ternary-bonsai-8b-whitepaper.pdf
- Repositorio de demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Discord de la comunidad: https://discord.gg/prismml
- MLX (kernels para Apple Silicon): https://github.com/ml-explore/mlx
- mlx-swift (iOS y macOS): https://github.com/ml-explore/mlx-swift

No se han encontrado enlaces adicionales relevantes en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
