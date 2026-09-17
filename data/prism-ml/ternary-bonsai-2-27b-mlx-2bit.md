# prism-ml/Ternary-Bonsai-2-27B-mlx-2bit

## Resumen

Ternary-Bonsai-2-27B-mlx-2bit es una compresion ternaria de Qwen3.8-27B publicada por Prism ML (repositorio `prism-ml`). El modelo conserva la arquitectura del original —transformer causal de atencion hibrida, SwiGLU MLP, RoPE y RMSNorm— pero sustituye los pesos de la columna vertebral del lenguaje por valores ternarios pertenecientes al conjunto {−1, 0, +1}, con una escala FP16 compartida por cada grupo de 128 pesos. El resultado ocupa 8,60 GB en disco (7,67 GB de modelo de lenguaje y 0,92 GB de torre de vision) frente a los aproximadamente 54 GB de la version FP16, y esta empaquetado en safetensors para MLX, con kernels especificos para Apple Silicon y CUDA.

La propuesta es relevante porque demuestra que un modelo de 27B puede mantener razonamiento, matematicas, codigo y comportamiento agentico por debajo de los 4 bits. Segun los autores, retiene el 98,2% de la inteligencia del modelo FP16, con una media de 84,78 en 14 benchmarks en modo thinking, frente a 72,59 de una cuantizacion convencional IQ2_XXS y dentro de 0,4 puntos de UD-Q4_K_XL pese a ocupar un tercio del espacio de esta ultima. Todo el presupuesto de pesos de lenguaje es ternario, incluidos embeddings, proyecciones de atencion, proyecciones MLP y LM head, sin capas de alta precision ocultas.

El contexto es de 262K tokens y se mantiene practico en dispositivo gracias a que el backbone de Qwen3.8-27B usa atencion mayoritariamente lineal (~75%). El modelo se distribuye con licencia Apache 2.0, incluye la torre de vision sin cuantizar y declara un rendimiento de aproximadamente 47 tokens por segundo en un portatil con Apple M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion hibrida (~75% atencion lineal / ~25% atencion completa), SwiGLU MLP, RoPE, RMSNorm |
| Parametros totales | 27.359.638.768 (27,36B): 24,35B de backbone de lenguaje (64 bloques) + 2,54B de embeddings y LM head + 0,46B de torre de vision (27 bloques) |
| Longitud de contexto | 262.144 tokens (262K), heredada del modelo base |
| Tipos de cuantizacion | Ternaria g128: valores {−1, 0, +1} con una escala FP16 por grupo de 128 pesos. 1,72 bits/peso como representacion (1,71 bits/peso efectivos del formato ternario mas la escala); 2,25 bits/peso tal como lo almacena el contenedor MLX. Repositorio companion GGUF en PTQ1_0 (1,75 bits/peso, 5,95 GB) y PQ2_0 (7,21 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); GGUF en el repositorio companion |
| Modelo base | Qwen/Qwen3.8-27B (arquitectura sin cambios) |
| Tamano desplegado | 8,60 GB en safetensors MLX (7,67 GB lenguaje + 0,92 GB torre de vision); el repositorio en HuggingFace ocupa 16,3 GB |
| Cuantizacion de la torre de vision | No cuantizada, 0,92 GB en FP16 (torre oficial de Qwen3.8-27B) |
| Backends soportados | Apple MLX (Python y Swift) y CUDA |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer causal de atencion hibrida en el que cerca del 75% de las capas emplean atencion lineal y el 25% restante atencion completa, lo que permite sostener una ventana de 262K tokens con un coste de computo y memoria contenido. El backbone de lenguaje tiene 64 bloques, 24,35B parametros, y se complementa con 2,54B en embeddings y LM head y una torre de vision de 27 bloques y 0,46B parametros, incluida en el paquete sin cuantizar.

La innovacion principal es la representacion de pesos ternaria g128. Cada matriz se transforma primero mediante una rotacion de Hadamard por bloques (bloque de 1024, con signos ±1 fijos) antes de asignar los valores ternarios; esa rotacion queda plegada en los pesos almacenados y el runtime aplica la transformacion equivalente sobre las activaciones. Los pesos empaquetados se consumen directamente, sin expandirlos a FP16, mediante kernels propios de atencion hibrida ternaria implementados para MLX (Python y Swift) y CUDA. El modelo empaqueta como metadatos su rotacion, de modo que un runtime o aplica la transformacion correspondiente o rechaza cargar el fichero.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La informacion disponible indica que se trata de un proceso de cuantizacion post-entrenamiento (PTQ) sobre el modelo base, con el objetivo declarado de conservar el modo thinking, el razonamiento y el comportamiento agentico tipicos de Qwen3.8-27B.

## Capacidades

- Generacion de texto conversacional en modo thinking y modo directo, con razonamiento multi-paso.
- Razonamiento matematico: los autores reportan una puntuacion de 96,57, a medio punto del modelo en precision completa.
- Generacion de codigo: puntuacion de 89,42, al mismo nivel que la linea base segun la model card.
- Uso de herramientas y function calling en contextos agenticos: 74,92 en la prueba de tool calling indicada por los autores.
- Capacidades de vision: el paquete incluye la torre de vision oficial de Qwen3.8-27B en FP16, por lo que se conservan las capacidades multimodales del modelo base.
- Contexto largo de 262K tokens, viable en dispositivo gracias al backbone de atencion predominantemente lineal.
- Despliegue on-device en Apple Silicon (MLX en Python y Swift) y en GPU mediante CUDA y llama.cpp.
- Capacidades multilingues: no disponible (no se especifica el conjunto de idiomas soportados en la informacion proporcionada).

## Casos de uso

- Asistentes de razonamiento en portatil: con 8,60 GB de pesos, el modelo cabe en la memoria unificada de un Mac con Apple Silicon y permite ejecutar razonamiento en modo thinking sin conexion, con contextos de hasta 262K tokens.
- Analisis de documentos largos: la ventana de 262K tokens y la atencion mayoritariamente lineal hacen viable resumir, extraer datos y responder preguntas sobre expedientes, informes o bases de codigo extensas en una sola pasada.
- Agentes con uso de herramientas: la puntuacion de 74,92 en tool calling permite construir agentes que encadenen llamadas a APIs, consultas a bases de datos y pasos de razonamiento intermedios.
- Asistencia a la programacion en local: con 89,42 en la prueba de codigo, es util para autocompletado, generacion de tests y revision de parches dentro de un IDE, sin enviar codigo a servicios externos.
- Procesamiento de documentos con imagenes: al incluir la torre de vision, puede extraer informacion de capturas, formularios escaneados o diagramas y continuar el razonamiento sobre el texto resultante.
- Educacion y tutoria matematica: el rendimiento de 96,57 en matematicas permite resolver problemas paso a paso y explicar el procedimiento en un entorno sin coste de API.
- Despliegue en el borde con requisitos de privacidad: al ejecutarse en CUDA o Metal con pesos empaquetados, es apto para entornos industriales o sanitarios donde los datos no pueden salir del dispositivo.
- Investigacion sobre cuantizacion extrema: sirve como referencia reproducible para estudiar el comportamiento de representaciones ternarias en modelos de 27B y compararlas con esquemas de 2 y 4 bits.

## Benchmarks y rendimiento

| Metrica | Ternary-Bonsai-2-27B | IQ2_XXS (referencia) | UD-Q4_K_XL (referencia) |
|---|---|---|---|
| Media en 14 benchmarks (modo thinking) | 84,78 | 72,59 | no publicado (los autores indican que Bonsai queda a menos de 0,4 puntos) |
| Porcentaje de inteligencia FP16 retenida | 98,2% | no disponible | no disponible |
| Matematicas | 96,57 | no disponible | no disponible |
| Codigo | 89,42 | no disponible | no disponible |
| Tool calling agentico | 74,92 | no disponible | no disponible |

Los nombres concretos de los 14 benchmarks no se detallan en la informacion proporcionada. No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- Peso en disco: 8,60 GB en safetensors MLX (7,67 GB de lenguaje + 0,92 GB de torre de vision). El empaquetado GGUF companion ocupa 5,95 GB en PTQ1_0 y 7,21 GB en PQ2_0.
- VRAM estimada para inferencia: no publicada. Como referencia, los pesos del modelo de lenguaje suman 7,67 GB, por lo que la huella total dependera del cache KV y del contexto elegido; no se dispone de mediciones oficiales de VRAM en GPU.
- GPU recomendadas: no se especifica una lista oficial. Los backends soportados son CUDA (incluido el fork de llama.cpp) y Metal a traves de MLX.
- Cabe en GPU de consumo: no confirmado en la informacion disponible. El tamano de pesos (7,67 GB de lenguaje) es compatible en terminos de capacidad con GPUs de 12 GB o mas, pero no hay datos publicados de ejecucion verificada.
- Rendimiento medido: aproximadamente 47 tokens por segundo en un portatil con Apple M5 Max, segun la model card.
- Opciones de despliegue: MLX en Python y Swift (iOS y macOS) mediante los forks de Prism ML, CUDA a traves del fork de llama.cpp, y llama.cpp en CPU. El modelo GGUF companion esta pensado para llama.cpp en CUDA, Metal y CPU.
- Requisito de runtime: es necesario un runtime que aplique la transformacion de Hadamard declarada en los metadatos; en caso contrario, el fichero no debe cargarse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (MLX 2-bit) | 27,36B | 262K | safetensors MLX, 8,60 GB, 2,25 bits/peso almacenados | Apache 2.0 | HuggingFace (repositorio `prism-ml`) |
| Ternary-Bonsai-2-27B (GGUF PTQ1_0) | 27,36B | 262K | GGUF, 5,95 GB, 1,75 bits/peso | Apache 2.0 | Repositorio companion en HuggingFace |
| Ternary-Bonsai-2-27B (GGUF PQ2_0) | 27,36B | 262K | GGUF, 7,21 GB | Apache 2.0 | Repositorio companion en HuggingFace |
| Cuantizacion IQ2_XXS del mismo modelo base | no disponible | no disponible | ~2 bits convencionales | no disponible | no disponible (solo citada como referencia de benchmarks) |
| UD-Q4_K_XL del mismo modelo base | no disponible | no disponible | ~4 bits, alrededor de tres veces el tamano | no disponible | no disponible (solo citada como referencia de benchmarks) |
| Qwen3.8-27B en FP16 | 27B | 262K | FP16, ~54 GB | no disponible | Modelo base en HuggingFace |

No se dispone de datos suficientes para comparar con alternativas de otros desarrolladores en la misma categoria.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documenta una evaluacion especifica de factualidad; como en cualquier modelo de lenguaje, la generacion puede producir contenido incorrecto con apariencia de veracidad.
- Perdida de precision: aunque se declara una retencion del 98,2% de la inteligencia FP16, existe una degradacion medible respecto al modelo base, y la propia model card reconoce que la representacion ternaria es un regimen sub-4-bit propenso al colapso en esquemas convencionales.
- Idiomas soportados: no disponible; no se especifica la cobertura multilingue ni la calidad por idioma.
- Dependencia de runtime: el modelo solo funciona con implementaciones que apliquen la rotacion de Hadamard declarada en los metadatos. Cargarlo con herramientas estandar no modificadas puede fallar o producir resultados incorrectos.
- Sin datos de VRAM ni de latencia en GPU: el unico dato de rendimiento publicado es de aproximadamente 47 tok/s en Apple M5 Max.
- Discrepancia entre el tamano del repositorio (16,3 GB) y el tamano desplegado declarado (8,60 GB): conviene verificar que ficheros se descargan antes de planificar el almacenamiento.
- Adopcion temprana: el repositorio registra 0 descargas y 14 likes en la fecha de los datos, y los kernels requieren forks especificos de MLX y llama.cpp, lo que incrementa el riesgo de mantenimiento en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero se desconoce si el modelo base Qwen3.8-27B impone condiciones adicionales que deban respetarse al derivar pesos.

## Enlaces

- HuggingFace: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Repositorio companion GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Discord: https://discord.gg/prismml
- Fork de MLX: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift: https://github.com/PrismML-Eng/mlx-swift
- Fork de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

Los resultados de la busqueda web (Prism Launcher, GraphPad Prism, Prism de OpenAI) no guardan relacion con este modelo y se han descartado.
