# nesoai-dev-org/prism-ml-Ternary-Bonsai-2-27B-gguf

## Resumen

Bonsai 2 27B es un modelo de lenguaje causal de 27B derivado de Qwen3.8-27B, publicado por nesoai-dev-org (con material de referencia de Prism ML) y distribuido exclusivamente en formato GGUF para llama.cpp. Su rasgo definitorio es que los pesos del modelo (embeddings, proyecciones de atencion, proyecciones MLP y LM head) estan cuantizados a valores ternarios {−1, 0, +1} con escalado por grupos de 128 pesos, lo que da un coste real de 1,72 bits por peso y reduce el modelo de ~54 GB en FP16 a ~5,95 GB sin recurrir a capas de alta precision ocultas.

El modelo conserva, segun la model card del autor, el 98,2 % de la "inteligencia" de su version FP16, con una media de 84,78 puntos en 14 benchmarks en modo thinking, por encima del build convencional IQ2_XXS (72,59) y a 0,4 puntos de UD-Q4_K_XL con un tercio del tamano. Mantiene razonamiento matematico (96,57), codigo (89,42) y tool calling agentico (74,92) en el regimen sub-4-bit, precisamente donde las representaciones de baja precision convencionales se degradan.

Emplea la arquitectura híbrida de atencion de Qwen3.8-27B (~75 % atencion lineal, ~25 % atencion completa) con SwiGLU, RoPE y RMSNorm, y hereda una ventana de contexto de 262K tokens. Se distribuye bajo licencia Apache 2.0 y esta pensado para inferencia local en portatiles y GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion híbrida (~75 % lineal / ~25 % completa), SwiGLU MLP, RoPE, RMSNorm |
| Parametros totales | 27,36B segun la model card (24,35B backbone de lenguaje en 64 bloques + 2,54B embedding/LM head + 0,46B torre de vision en 27 bloques). El repo safetensors declara 26.895.998.464 parametros (~26,9B) |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | Ternaria g128 ({−1, 0, +1} con escala FP16 por grupo de 128 pesos); dos empaquetados GGUF: PTQ1_0 (1,75 bits/peso) y PQ2_0 (2,13 bits/peso). Torre de vision en Q8_0 (mmproj) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); empaquetados PTQ1_0 y PQ2_0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B sin modificar la arquitectura: un transformer causal con atencion híbrida en el que aproximadamente el 75 % de las capas usan atencion lineal y el 25 % restante atencion completa, con MLP SwiGLU, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). El backbone de lenguaje consta de 64 bloques (24,35B parametros), al que se suman 2,54B de embedding y LM head y una torre de vision de 27 bloques (0,46B) que solo se carga cuando hay entrada de imagen.

La innovacion tecnica central es el esquema ternario g128: cada peso toma un valor de {−1, 0, +1} con un unico factor de escala FP16 compartido por cada grupo de 128 pesos. Cada valor ternario transporta log2(3) ≈ 1,585 bits, por lo que el coste efectivo de almacenamiento es de ~1,71 bits/peso contando la escala, y de 1,72 bits/peso en el modelo completo (una reduccion idealizada de ~9,3x frente a FP16). Ademas, los pesos se almacenan en una base rotada: cada matriz se transforma por bloques mediante una rotacion ortogonal de Hadamard (bloque 1024, signos ±1 fijos) antes de la asignacion ternaria, y el runtime aplica la transformacion correspondiente a las activaciones. La rotacion se pliega en los pesos durante el proceso offline, de modo que no anade bits ni trafico de pesos, y el modelo empaquetado declara la rotacion como metadato: un runtime o aplica la transformacion compatible o rechaza la carga. Los pesos empaquetados se consumen directamente y nunca se expanden de vuelta a FP16. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (la model card reporta evaluacion sobre 14 benchmarks de este tipo).
- Razonamiento matematico: 96,57 puntos en la metrica de matematicas citada, a medio punto de la precision completa.
- Generacion de codigo: 89,42 puntos, al nivel de la linea base.
- Tool calling / function calling agentico: 74,92 puntos en la metrica agentica reportada.
- Vision: torre de vision opcional de ~0,63 GB empaquetada como mmproj en Q8_0, cargada solo cuando se procesan imagenes.
- Contexto largo: ventana de 262.000 tokens, viable en dispositivo gracias al backbone predominantemente de atencion lineal.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Inferencia en multiples backends: llama.cpp en CUDA, Metal y CPU.

## Casos de uso

- Razonamiento local en portatil: el modelo completo ocupa 5,95 GB en PTQ1_0, por lo que puede ejecutarse en un portatil con GPU integrada o en un Apple M5 Max (la model card cita ~47 tok/s) sin conexion a servicios en la nube, util para entornos con requisitos de privacidad.
- Analisis de documentos largos: con 262.000 tokens de contexto y un backbone de atencion mayoritariamente lineal, permite procesar libros tecnicos, expedientes o repositorios de codigo completos en una sola pasada, reduciendo la necesidad de troceado y de recuperacion externa.
- Asistente de codigo con herramientas: su soporte de tool calling (74,92) permite integrarlo en agentes que invocan compiladores, linters o APIs de repositorio para tareas de refactorizacion guiada por pruebas.
- Agentes multi-paso en local: la combinacion de razonamiento en modo thinking y tool calling lo hace apto para flujos de automatizacion de varias etapas (consulta, ejecucion, verificacion) ejecutados en una unica GPU de consumo.
- Procesamiento de matematicas y calculo simbolico asistido: el rendimiento en matematicas (96,57, a medio punto de FP16) lo hace adecuado para tutoria de problemas, verificacion de derivaciones y generacion de explicaciones paso a paso.
- Despliegue en el borde con GPU unica: al requerir ~6-7 GB de pesos, encaja en un unico acelerador modesto, lo que simplifica el escalado horizontal por copias frente a modelos que exigen multiples GPUs.
- Analisis de imagenes con texto: la torre de vision opcional permite tareas de descripcion de imagenes o extraccion de informacion de capturas y diagramas, cargando el mmproj solo cuando se necesita.
- Investigacion sobre cuantizacion extrema: el esquema ternario g128 con rotacion Hadamard y kernel dedicado sirve como referencia reproducible para estudiar la degradacion de modelos en el regimen sub-4-bit.

## Benchmarks y rendimiento

| Benchmark / metrica | Ternary Bonsai 2 27B | IQ2_XXS (referencia convencional) | UD-Q4_K_XL | FP16 (linea base) |
|---|---|---|---|---|
| Media en 14 benchmarks thinking | 84,78 | 72,59 | ~85,18 (0,4 puntos por encima) | No disponible como cifra agregada |
| Matematicas | 96,57 | No disponible | No disponible | A 0,5 puntos del valor de este modelo |
| Codigo | 89,42 | No disponible | No disponible | Al mismo nivel que el modelo |
| Tool calling agentico | 74,92 | No disponible | No disponible | No disponible |
| Retencion de inteligencia vs FP16 | 98,2 % | No disponible | No disponible | 100 % |
| Throughput | ~47 tok/s en Apple M5 Max | No disponible | No disponible | No disponible |

No se han publicado en la informacion disponible los valores individuales por benchmark (MMLU, HumanEval, GSM8K u otros) que componen la media de 84,78, ni las cifras desagregadas de FP16.

## Requisitos de hardware

- Tamano de pesos: 5,95 GB para el empaquetado PTQ1_0 (1,75 bits/peso) y 7,21 GB para PQ2_0 (2,13 bits/peso). El tamano ideal declarado es de 5,8 GB a 1,72 bits/peso.
- Torre de vision: ~0,63 GB adicionales (mmproj en Q8_0), cargados solo para entrada de imagen.
- Memoria adicional: no se especifica en la informacion disponible el consumo de cache KV a 262K tokens; debe dimensionarse aparte segun el backend y el numero de secuencias concurrentes.
- Cabe en GPU de consumo: si, con un perfil de pesos de ~6-7 GB encaja en GPUs de consumo actuales de 8 GB o mas; la model card cita explicitamente Apple M5 Max y backends CUDA y Metal.
- GPU recomendadas: no disponible como lista concreta; los backends soportados son CUDA, Metal y CPU, sin nombres de modelo de GPU especificados.
- Opciones de despliegue: llama.cpp (CUDA, Metal, CPU) con los kernels ternarios personalizados del fork de Prism ML. Existe una variante companion en MLX 2-bit para Apple Silicon (Ternary-Bonsai-2-27B-mlx-2bit).
- Latencia y throughput: ~47 tok/s en un portatil Apple M5 Max. No se publican cifras de throughput para CUDA ni de latencia por peticion.
- Restriccion de runtime: los pesos empaquetados declaran la rotacion Hadamard como metadato; un runtime sin el kernel correspondiente rechaza la carga en lugar de degradar silenciosamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Prestaciones (media thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 27B | 27,36B (26,9B en safetensors) | 262K | 84,78 | Apache 2.0 | GGUF en HuggingFace; MLX companion |
| IQ2_XXS de Qwen3.8-27B | Mismo backbone (~27B) | 262K | 72,59 | Heredada del modelo base (no disponible) | Build convencional de llama.cpp |
| UD-Q4_K_XL de Qwen3.8-27B | Mismo backbone (~27B) | 262K | ~85,18 | Heredada del modelo base (no disponible) | Build convencional de llama.cpp |
| Baseline FP16 (Qwen3.8-27B) | Mismo backbone (~27B) | 262K | 100 % (referencia) | Heredada del modelo base (no disponible) | Pesos sin cuantizar |

La comparacion se limita a builds del mismo modelo base; no se dispone de datos de benchmarks frente a modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Validez condicionada al runtime: los pesos estan en una base rotada por Hadamard. Solo funcionan con los kernels ternarios del fork de llama.cpp de Prism ML; otros runtimes rechazaran la carga o daran resultados incorrectos.
- Degradacion en baja precision: aunque la media thinking es de 84,78 frente a ~85,18 de UD-Q4_K_XL, sigue habiendo una perdida de 1,8 puntos respecto a FP16 en la agregada y de 0,5 puntos en matematicas.
- Riesgo de alucinacion: no se documenta en la informacion disponible ninguna evaluacion especifica de tasa de alucinacion; al ser un modelo derivado de un transformer causal estandar, mantiene el riesgo habitual en tareas factuales.
- Sesgos: no se documentan analisis de sesgos en la informacion proporcionada.
- Idiomas: no se especifica la cobertura linguistica del modelo; se desconoce el comportamiento fuera de los idiomas principales del modelo base.
- Cache KV: no se publican cifras de consumo de memoria a 262K tokens, lo que puede hacer inviable la ventana completa en hardware con poca VRAM.
- Problemas conocidos: el repositorio mantiene un fichero KNOWN_ISSUES.md con fallos documentados, workarounds y estado de correccion, que conviene revisar antes de desplegar.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la model card no detalla las condiciones del modelo base Qwen3.8-27B, que podrian aplicar de forma adicional.
- Estado de adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con lo que la validacion por parte de la comunidad es practicamente nula.
- Discrepancia de identificadores: el ID de HuggingFace pertenece a la organizacion `nesoai-dev-org`, mientras que la model card enlaza recursos de `prism-ml`; conviene verificar la procedencia antes de usarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/nesoai-dev-org/prism-ml-Ternary-Bonsai-2-27B-gguf
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Sitio web de Prism ML: https://prismml.com
- Discord: https://discord.gg/prismml
- Fork de llama.cpp con kernels ternarios (CUDA + Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Companion MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Problemas conocidos: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/KNOWN_ISSUES.md
