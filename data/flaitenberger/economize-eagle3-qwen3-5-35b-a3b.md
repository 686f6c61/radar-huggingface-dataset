# flaitenberger/economize-eagle3-Qwen3.5-35B-A3B

## Resumen
El repositorio `flaitenberger/economize-eagle3-Qwen3.5-35B-A3B` contiene una cabeza drafter EAGLE-3 para el modelo base Qwen/Qwen3.5-35B-A3B, desarrollada por el autor flaitenberger dentro del proyecto de codigo abierto economize. No es un modelo generativo autonomo: es un adaptador de decodificacion especulativa que acelera la inferencia del modelo base prediciendo varios tokens por adelantado, que luego son verificados por el modelo grande. El checkpoint almacena unicamente los pesos del drafter (137M parametros), no los del modelo base.

La pieza central es una unica capa decoder que lee los estados ocultos del modelo base a tres profundidades, los fusiona en un vector y, junto con el embedding del ultimo token, predice los siguientes tokens mediante su propia LM head sobre los 32768 tokens mas frecuentes del conjunto de entrenamiento. Su MLP tiene anchura 4608. La relevancia practica esta en el ahorro de latencia: en la medicion del autor sobre dos H100 en bf16, la decodificacion alcanza 1,43x de throughput global respecto a la decodificacion greedy plana, con picos de 1,97x en matematicas.

El modelo se publica bajo licencia Apache 2.0 y se integra mediante la libreria economize (version >= 0.4). Al estar verificado cada borrador por el modelo base, la decodificacion greedy reproduce exactamente la salida greedy del base en float32, y el muestreo especulativo con `verifier="rejection"` sigue su distribucion de muestreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza drafter EAGLE-3 (una capa decoder con fusion de estados ocultos a tres profundidades y LM head propia) sobre Qwen3.5-35B-A3B |
| Parametros totales | 137M (solo el drafter; el modelo base no se incluye) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (entrenado y medido en bf16; el autor menciona float32 para equivalencia exacta) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario de la LM head | 32768 tokens mas frecuentes del entrenamiento |
| Anchura del MLP del drafter | 4608 |
| Configuracion de decodificacion por defecto | `cycle_length=9` (hasta 8 borradores por pasada), `min_confidence=0.9` |
| Libreria | economize >= 0.4 |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento
El drafter sigue el esquema EAGLE-3: una sola capa decoder que consume los estados ocultos del modelo base en tres niveles de profundidad, los combina en un unico vector y lo concatena con el embedding del ultimo token para predecir los siguientes tokens con una LM head propia restringida a los 32768 tokens mas frecuentes. El MLP interno tiene anchura 4608. Cada borrador generado es verificado por el modelo base, de modo que la correccion de la salida queda garantizada por el verificador y no por el drafter.

El entrenamiento se realizo con la libreria economize sobre respuestas generadas por el propio modelo base (Qwen/Qwen3.5-35B-A3B en la revision `59d61f3ce65a6d9863b86d2e96597125219dc754`), de forma que el drafter aprende la distribucion de salida del base. El proceso partio de un pool de 292.212 prompts, con filtrado de prompts vacios, de menos de 3 palabras o de mas de 12.000 caracteres, eliminacion de duplicados exactos y eliminacion de cualquier prompt que compartiera un 13-grama con los conjuntos de evaluacion (incluido MBPP). Las respuestas se generaron con vLLM 0.30.0 en bf16 usando la plantilla de chat del base. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades
- Aceleracion de decodificacion especulativa del modelo base Qwen3.5-35B-A3B mediante borradores verificados.
- Prediccion de hasta 8 tokens por pasada del modelo base (configuracion `cycle_length=9`).
- Parada adaptativa del borrador mediante umbral de confianza (`min_confidence=0.9`), que reduce el coste cuando la prediccion es incierta.
- Preservacion de la salida greedy del base: en float32 la salida coincide exactamente con la decodificacion greedy plana.
- Muestreo especulativo con verificacion por rechazo (`verifier="rejection"`), que respeta la distribucion de muestreo del modelo base.
- Integracion con la API de economize: `economize.from_pretrained`, `economize.load`, `generate` y `decode`, con configuracion de decodificacion personalizable mediante `economize.DecodeConfig`.
- Compatibilidad con CUDA graphs y ejecucion en bf16.
- No es un modelo de proposito general: no genera texto de forma autonoma ni soporta tool calling, vision, audio o agentes por si mismo; esas capacidades dependen del modelo base.

## Casos de uso
- Despliegue de Qwen3.5-35B-A3B con menor latencia en produccion: el drafter se acopla al base para reducir el tiempo por token en tareas de chat, aprovechando la ganancia de 1,31x medida en el conjunto de chat.
- Razonamiento matematico interactivo: en cargas de trabajo de matematicas la aceleracion alcanza 1,97x, por lo que resulta adecuado para asistentes que resuelven problemas paso a paso (GSM8K, MATH-500, AIME) donde la latencia percibida es critica.
- Generacion de codigo en pipelines de CI/CD: con 1,39x en tareas de codigo (HumanEval, MBPP, LiveCodeBench), sirve para autocompletado, generacion de tests o revision de parches donde se necesita throughput sin cambiar la salida del modelo base.
- Resumen de documentos: la ganancia de 1,23x en CNN/DailyMail permite procesar lotes de resumenes con menor coste por documento.
- Procesamiento de contexto largo: con 1,18x en LongBench, es util en tareas de recuperacion y sintesis sobre documentos extensos, aunque la mejora es mas modesta que en matematicas.
- Servicio de inferencia con muestreo: al usar `verifier="rejection"` se mantiene la distribucion de muestreo del base, lo que permite ofrecer respuestas variadas con aceleracion en aplicaciones conversacionales.
- Evaluacion comparativa de tecnicas de eficiencia: sirve como referencia reproducible para medir el impacto de EAGLE-3 frente a decodificacion plana en un modelo MoE de gran tamano.

## Benchmarks y rendimiento
El autor publica mediciones de throughput relativo a la decodificacion greedy plana del modelo base, en dos NVIDIA H100 (modelo base repartido entre ambas), bf16, CUDA graphs y batch size 1, con 8 prompts por conjunto y hasta 256 tokens nuevos.

| Configuracion | Global | Chat | Codigo | Matematicas | Resumen | Contexto largo | Tokens por pasada |
|---|---|---|---|---|---|---|---|
| 8 borradores, confianza 0.9 (por defecto) | 1,43x | 1,31x | 1,39x | 1,97x | 1,23x | 1,18x | 2,25 |
| 8 borradores, confianza 0.3 | 1,37x | 1,25x | 1,31x | 1,85x | 1,25x | 1,14x | 2,87 |
| 8 borradores, confianza 0.2 | 1,33x | 1,22x | 1,25x | 1,80x | 1,18x | 1,09x | 2,94 |
| 3 borradores, sin umbral | 1,27x | 1,11x | 1,28x | 1,78x | 1,06x | 1,11x | 2,57 |
| 8 borradores, sin umbral | 1,17x | 1,07x | 1,14x | 1,71x | 0,96x | 0,92x | 2,99 |
| 2 borradores, sin umbral | 1,22x | 1,08x | 1,26x | 1,66x | 0,98x | 1,02x | 2,26 |

En bf16, una pasada de verificacion sobre varios tokens redondea de forma distinta a un paso de un solo token, por lo que tras un tiempo la salida puede diferir de la decodificacion bf16 plana; en la medicion, el 21% de las respuestas fueron identicas en los 256 tokens. En float32 la salida coincide exactamente con la greedy plana. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para el drafter en la informacion disponible, ya que la calidad la determina el modelo base.

## Requisitos de hardware
- VRAM estimada: el drafter ocupa 0,3 GB en el repositorio; a esto se suma la memoria del modelo base Qwen3.5-35B-A3B, que no se detalla en la informacion disponible.
- GPU recomendadas: la medicion oficial se realizo en dos NVIDIA H100 con el modelo base repartido entre ambas.
- GPU de consumo: no disponible; depende enteramente de si el modelo base cabe en la GPU del usuario, dato no especificado.
- Opciones de despliegue: la via documentada es la libreria economize (>= 0.4) sobre PyTorch y Transformers, con soporte de CUDA graphs y bf16. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: la mejora medida es de 1,43x global y hasta 1,97x en matematicas respecto a la decodificacion greedy plana en el mismo runtime; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares
No se dispone en la informacion proporcionada de otros drafters EAGLE-3 comparables para el mismo modelo base, ni de datos de modelos alternativos de decodificacion especulativa. La unica referencia interna es la propia decodificacion greedy plana de Qwen3.5-35B-A3B, frente a la que este drafter ofrece 1,43x de throughput global. Cualquier comparacion con otros drafters o con tecnicas como Medusa o decodificacion especulativa clasica requeriria datos no disponibles.

## Limitaciones y advertencias
- No es un modelo autonomo: requiere cargar Qwen3.5-35B-A3B y la libreria economize; no puede usarse como generador independiente.
- La aceleracion depende del dominio: en resumen y contexto largo las ganancias son modestas (1,23x y 1,18x) y con configuraciones sin umbral de confianza se observan incluso valores por debajo de 1,0x.
- En bf16 la salida puede diferir de la decodificacion plana por redondeo; solo en float32 se garantiza equivalencia exacta con la greedy del base.
- La LM head del drafter cubre unicamente los 32768 tokens mas frecuentes del entrenamiento, lo que puede limitar la eficacia del borrado en vocabulario poco frecuente.
- El umbral de confianza y la longitud de ciclo estan fijados por defecto a valores medidos en un unico entorno (dos H100, bf16); su optimalidad en otros hardware o precisiones no esta verificada.
- No se detallan sesgos, riesgos de alucinacion ni limitaciones idiomaticas propias; estos dependen del modelo base Qwen3.5-35B-A3B.
- Licencia Apache 2.0 permite uso comercial, pero el uso del modelo base queda sujeto a su propia licencia, no especificada en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente de las cifras publicadas.

## Enlaces
- HuggingFace: https://huggingface.co/flaitenberger/economize-eagle3-Qwen3.5-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio economize: https://github.com/Thiggel/economize
- PyPI: https://pypi.org/project/economize/
- Documentacion: https://thiggel.github.io/economize/
- Coleccion de drafters economize: https://huggingface.co/collections/flaitenberger/economize-drafters-6aeb7d0f6cae8de3208fd3e7
- Figura de speedup: https://huggingface.co/flaitenberger/economize-eagle3-Qwen3.5-35B-A3B/resolve/main/speedup.png
