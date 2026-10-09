# randmaru/Mellum2.1-12B-A2.5B-Thinking-mlx-mxfp4

## Resumen

Esta ficha describe `randmaru/Mellum2.1-12B-A2.5B-Thinking-mlx-mxfp4`, una cuantizacion de 4 bits en formato MXFP4 realizada por el usuario randmaru sobre el modelo `JetBrains/Mellum2.1-12B-A2.5B-Thinking`. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos para inferencia nativa en Apple Silicon mediante MLX (Metal). El resultado es un unico fichero `model.safetensors` de 6,46 GB, con un promedio de unos 4,25 bits por peso, grupo de cuantizacion de tamano 32 y puertas del router conservadas en 8 bits (grupo 64).

El modelo base es un decodificador de tipo mezcla de expertos (MoE) con 12.149.923.072 parametros totales y aproximadamente 2.500 millones de parametros activos por token. La configuracion anunciada por el autor es de 64 expertos con top-8, 28 capas y una ventana de contexto de 128.000 tokens, con combinacion de capas de atencion de ventana deslizante y atencion completa. Incorpora un modo de razonamiento explicito (thinking) que emite cadena de pensamiento antes de la respuesta final, y las etiquetas del repositorio lo vinculan a tareas de prediccion de ediciones y sugerencia de siguiente edicion, tipicas del ecosistema de IDE de JetBrains.

Su relevancia es practica: permite ejecutar un MoE de 12B con licencia Apache 2.0 en un Mac con memoria unificada, ocupando 1,6 GB menos que la cuantizacion GGUF `Q4_K_M` del mismo modelo base (8,07 GB), a cambio de un bit-rate efectivo inferior (4,25 frente a ~5,3 bpw). Es, por tanto, una opcion de despliegue local orientada a tamano y portabilidad, no a maxima fidelidad numerica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con mezcla de expertos (MoE), 64 expertos, top-8; mezcla de capas de atencion de ventana deslizante y atencion completa; 28 capas |
| Parametros totales | 12.149.923.072 |
| Parametros activos | Aproximadamente 2.500 millones por token |
| Longitud de contexto | 128.000 tokens segun la model card del cuantizador; una referencia externa indica 131.000 |
| Tipos de cuantizacion | MXFP4: 4 bits en coma flotante con microscaling, grupo 32, exponente compartido E8M0; puertas del router en 8 bits, grupo 64; media efectiva de 4,25 bits por peso. Tipos de tensor: U32 (pesos empaquetados), U8 (escalas) y BF16 |
| Idiomas soportados | no disponible (la model card de este repositorio no declara idiomas; un repositorio equivalente de la comunidad MLX etiqueta solo ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors para MLX (un unico `model.safetensors` de 6.457.111.871 bytes); descarga total aproximada de 6.464.259.055 bytes |

## Arquitectura y entrenamiento

El modelo base es un decodificador autorregresivo con arquitectura de mezcla de expertos: 12B de parametros totales repartidos en 64 expertos, de los que se activan 8 por token, lo que deja unos 2,5B de parametros activos y reduce el coste de computo por token respecto a un denso equivalente. Segun la informacion disponible, combina capas de atencion de ventana deslizante con capas de atencion completa, un patron habitual para abaratar el coste del contexto largo manteniendo recuperacion global. El modelo incorpora un modo de razonamiento explicito: genera cadena de pensamiento antes de la respuesta final.

Sobre el entrenamiento no hay datos en la informacion proporcionada: no se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La innovacion tecnica de este repositorio concreto es la cuantizacion: pesos a MXFP4 con microscaling (exponente compartido E8M0 y grupo de 32) y router a 8 bits para no degradar el enrutado de expertos, un detalle relevante porque las puertas de un MoE son sensibles a la cuantizacion agresiva. El autor advierte que el bit-rate mayor de `Q4_K_M` tiende a preservar mejor la precision en valores atipicos, por lo que la eleccion es un compromiso explicito entre huella en disco/memoria y calidad.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, con pipeline declarado `text-generation`.
- Razonamiento explicito en modo thinking: emite cadena de pensamiento antes de la respuesta final, lo que permite inspeccionar el proceso intermedio.
- Prediccion de ediciones y sugerencia de siguiente edicion (`edit-prediction`, `next-edit-suggestion` en las etiquetas), orientado a asistencia dentro de entornos de desarrollo.
- Uso en tareas de codigo y agentes segun referencias externas al modelo base, aunque no se detallan capacidades concretas de tool calling o function calling en la informacion disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en este repositorio.
- Vision y audio: no disponibles; las etiquetas no indican ninguna modalidad distinta de texto.
- Compatible con `text-generation-inference` como etiqueta, si bien el formato de pesos de este repositorio es MLX.

## Casos de uso

- Asistente de codigo en local sobre Mac: al ser un MoE de 2,5B activos cuantizado a 6,46 GB, se puede mantener cargado en un portatil Apple Silicon y usarlo para completar, refactorizar o explicar fragmentos sin enviar codigo a un servicio externo.
- Sugerencia de siguiente edicion en un editor: las etiquetas `next-edit-suggestion` y `edit-prediction` apuntan a integracion en flujos tipo IDE, donde el modelo propone la proxima modificacion sobre el buffer actual.
- Razonamiento sobre repositorios con contexto largo: los 128.000 tokens de ventana permiten pasar varios ficheros o un modulo completo en una sola peticion para tareas de analisis y respuesta con trazabilidad del razonamiento.
- Despliegue offline en entornos con requisitos de confidencialidad: la licencia Apache 2.0 y la ejecucion local sin red encajan en equipos donde no se permite enviar datos a APIs de terceros.
- Prototipado e investigacion en Apple Silicon mediante MLX: sirve para medir el impacto de MXFP4 frente a GGUF `Q4_K_M` en la misma tarea, comparando calidad con una diferencia de 1,6 GB de peso.
- Generacion de documentacion tecnica y resumenes de issues: el modo thinking permite obtener borradores con pasos intermedios que se pueden revisar antes de publicar.
- Evaluacion comparativa de cuantizaciones: como artefacto reproducible, es util para estudiar como afecta el bit-rate y el trato del router a la calidad de un MoE en tareas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica numerica, y tampoco se aportan datos de latencia o throughput. La unica comparacion cuantitativa ofrecida por el autor es de tamano y bit-rate entre esta cuantizacion y la alternativa GGUF:

| Parametro | MXFP4 (este repositorio, MLX) | 4 bits GGUF `Q4_K_M` |
|---|---|---|
| Tamano del fichero de pesos | 6.457.111.871 bytes (aprox. 6,46 GB) | 8.071.295.264 bytes (aprox. 8,07 GB) |
| Descarga total | 6.464.259.055 bytes (aprox. 6,46 GB) | 8.071.295.264 bytes (aprox. 8,07 GB) |
| Bits efectivos por peso | 4,25 | aproximadamente 5,3 |
| Formato de cuantizacion | Coma flotante de 4 bits con microscaling, grupo 32, exponente compartido E8M0 | k-quant de 4 bits con bloques mixtos de 4/6 bits |
| Router | Mantenido a 8 bits, grupo 64 | Incluido en el k-quant |
| Runtime | MLX (`mlx-lm`) | llama.cpp, LM Studio, Ollama |
| Soporte de hardware | GPU de Apple Silicon via Metal | Metal, CUDA, ROCm, CPU |

## Requisitos de hardware

- VRAM o memoria unificada: los pesos ocupan aproximadamente 6,46 GB, a los que hay que sumar cache KV y overhead del runtime. En la practica, se recomienda un Mac con 16 GB de memoria unificada o mas para contexto corto, y 24-32 GB para aprovechar la ventana de 128.000 tokens.
- GPU compatibles: exclusivamente GPU de Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra) a traves de Metal y MLX. No hay soporte CUDA ni ROCm en este repositorio.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada suficiente. En 8 GB de memoria unificada la carga es muy ajustada y deja poco margen para cache KV.
- Opciones de despliegue: `mlx-lm` como runtime de referencia. Este repositorio no es directamente utilizable en vLLM, TGI, llama.cpp, LM Studio u Ollama por el formato de pesos; para esos entornos hay que usar la variante GGUF del modelo base, incluida la `MXFP4_MOE` de 7,03 GB y aproximadamente 4,6 bits por peso.
- Latencia y throughput: no disponibles. Dependen del chip concreto, del backend, del tamano de lote y de la implementacion de la cuantizacion, tal y como advierte el propio autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion y tamano | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `randmaru/Mellum2.1-12B-A2.5B-Thinking-mlx-mxfp4` (este) | 12B totales, 2,5B activos | 128.000 tokens | MXFP4, 6,46 GB, 4,25 bpw | MLX | Apache 2.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| `JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF` (`Q4_K_M`) | 12B totales, 2,5B activos | 128.000 tokens | k-quant 4 bits, 8,07 GB, ~5,3 bpw | llama.cpp, LM Studio, Ollama | Apache 2.0 | Hugging Face, repositorio de JetBrains |
| `JetBrains/Mellum2-12B-A2.5B-Thinking-GGUF-MXFP4_MOE` | 12B totales, 2,5B activos | 128.000 tokens | MXFP4 MoE, 7,03 GB, ~4,6 bpw | llama.cpp y derivados (Metal, CUDA, ROCm, CPU) | Apache 2.0 | Hugging Face, repositorio de JetBrains |
| `mlx-community/Mellum2-12B-A2.5B-Thinking-mxfp4` | 12B totales, 2,5B activos | 128.000 tokens | MXFP4, MLX | MLX | Apache 2.0 | Hugging Face, comunidad MLX, etiquetado en ingles |

No se dispone de datos de rendimiento que permitan comparar calidad entre estas variantes; la unica diferencia documentada es el tamano, el bit-rate efectivo y el ecosistema de ejecucion.

## Limitaciones y advertencias

- No es un modelo original: es una cuantizacion de terceros. Cualquier limitacion del modelo base se hereda, y ademas se anade la perdida de precision propia de los 4 bits.
- El autor reconoce que `Q4_K_M` (aproximadamente 5,3 bits por peso) tiende a retener algo mas de precision en valores atipicos; MXFP4 prioriza un tamano menor. Conviene evaluar en la tarea concreta antes de adoptarlo en produccion.
- El router se mantiene a 8 bits, pero el resto de pesos a 4,25 bits efectivos, por lo que el enrutado de expertos y la calidad de las respuestas pueden degradarse en dominios poco representados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el modo thinking reduce la opacidad del proceso, pero no garantiza la veracidad de las afirmaciones.
- Idiomas soportados: no disponibles. No hay declaracion oficial en este repositorio; un repositorio equivalente de la comunidad MLX solo etiqueta ingles, por lo que el rendimiento en castellano no esta verificado.
- Contexto largo: la ventana de 128.000 tokens es nominal; el rendimiento real en contextos muy extensos depende de la memoria disponible y puede degradarse mucho antes de agotar la ventana.
- Compatibilidad de despliegue: al estar en formato MLX, queda restringido a Apple Silicon. No se puede servir con vLLM, TGI o llama.cpp sin cambiar de artefacto.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion de avisos, sin clausulas de uso aceptable adicionales en la informacion disponible. Verificar el repositorio original de JetBrains por si hubiera condiciones adicionales.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Fechas del repositorio: creado el 8 de octubre de 2026 y actualizado el mismo dia, con dos horas de diferencia; no consta mantenimiento posterior.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/randmaru/Mellum2.1-12B-A2.5B-Thinking-mlx-mxfp4
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Variante GGUF del modelo base citada por el autor: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF
- Variante GGUF MXFP4 MoE: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking-GGUF-MXFP4_MOE
- Cuantizacion equivalente de la comunidad MLX: https://huggingface.co/mlx-community/Mellum2-12B-A2.5B-Thinking-mxfp4
- Arbol de ficheros de la version MLX comunitaria: https://huggingface.co/mlx-community/Mellum2-12B-A2.5B-Thinking-mxfp4/tree/main
- Referencia del modelo con contexto declarado de 131k: https://www.llmreference.com/model/mellum2-1-12b-thinking
- Ficha y valoraciones en LLM Explorer: https://llm-explorer.com/model/mlx-community%2FMellum2-12B-A2.5B-Thinking-mxfp4,4dlvM7NturXWL8GgD4jyRm
- Panorama del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/mellum2-12b-a2.5b-thinking-jetbrains
