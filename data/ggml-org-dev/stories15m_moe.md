# ggml-org-dev/stories15M_MOE

## Resumen

stories15M_MOE es un modelo experimental de tipo mezcla de expertos (MoE) construido por ggml-org-dev a partir de `ModelCloud/tinyllama-15M-stories`, un modelo TinyLlama de aproximadamente 15 millones de parametros entrenado con cuentos infantiles. El autor replica cuatro veces los pesos originales para crear cuatro expertos y anade un router con pesos inicializados de forma aleatoria, dando lugar a un total de 36.358.560 parametros. El modelo se publica con licencia MIT y en formatos safetensors y GGUF.

La relevancia del modelo es exclusivamente tecnica y de infraestructura: sirve como banco de pruebas para validar la implementacion de arquitecturas MoE (en concreto el formato `mixtral`) en el ecosistema ggml/llama.cpp, no como modelo de proposito general. El propio autor advierte que no esta pensado para produccion y bromea con que solo seria util como contador de cuentos infantiles.

Incluye ademas un adaptador LoRA entrenado sobre los primeros 100 parrafos de Shakespeare (`moe_shakespeare15M`), que demuestra que el pipeline de entrenamiento y carga de adaptadores funciona sobre esta arquitectura MoE minima. No se dispone de informacion sobre pipeline, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (formato `mixtral`), 4 expertos replicados de un TinyLlama de ~15M |
| Parametros totales | 36.358.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos safetensors y GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `ModelCloud/tinyllama-15M-stories`, un TinyLlama de unos 15 millones de parametros, y replica sus pesos cuatro veces para conformar cuatro expertos dentro de una arquitectura MoE compatible con el formato `mixtral` que consume llama.cpp. El router que selecciona los expertos tiene pesos inicializados de forma aleatoria, por lo que la asignacion de tokens a expertos no responde a ningun criterio aprendido. No se ha realizado un entrenamiento conjunto del modelo MoE completo.

El unico entrenamiento documentado es un adaptador LoRA sobre los primeros 100 parrafos de Shakespeare, publicado en la carpeta `moe_shakespeare15M`. Este adaptador demuestra que es posible ajustar el modelo y que el resultado se refleja en la generacion: ante la entrada `Look in thy glass`, el modelo original produce texto repetitivo e incoherente sobre una nina de tres anos, mientras que el adaptador genera una continuacion con estilo shakespeariano. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto muy limitada: el modelo base solo ha visto cuentos infantiles y el MoE no ha sido entrenado de forma conjunta, por lo que la calidad es baja.
- Ajuste mediante LoRA: se puede entrenar y cargar un adaptador LoRA para especializar el estilo de salida, como demuestra el adaptador de Shakespeare.
- Compatibilidad con el ecosistema ggml/llama.cpp: sirve para probar la ruta de inferencia MoE (carga de pesos, enrutado, ejecucion de expertos).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingues; los datos de entrenamiento originales son cuentos en ingles.
- No dispone de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Pruebas de regresion en llama.cpp: validar que la implementacion de MoE con formato `mixtral` carga correctamente los pesos safetensors y GGUF y produce salidas deterministas con una semilla fija.
- Benchmarking de infraestructura: medir latencia y consumo de memoria de la ruta MoE en distintos backends (CPU, CUDA, Metal) con un modelo de 36M parametros que cabe en cualquier equipo.
- Desarrollo de herramientas de conversion: comprobar el pipeline de conversion de safetensors a GGUF para arquitecturas con multiples expertos y router.
- Validacion de carga de adaptadores LoRA: usar `moe_shakespeare15M` como caso de prueba de que los adaptadores se aplican correctamente sobre los expertos de un MoE.
- Docencia y demostraciones: explicar de forma tangible como funciona un router MoE y por que un router aleatorio degrada la calidad, con un modelo que se ejecuta en segundos en un portatil.
- Pruebas de integracion en CI: incluir el modelo en tests automatizados de pipelines de inferencia sin coste de GPU, dado su tamano de 0,5 GB en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una comparacion cualitativa entre el modelo original y el adaptador LoRA ante la entrada `Look in thy glass`:

| Entrada | Modelo | Salida |
|---|---|---|
| `Look in thy glass` | Original | `Look in thy glass was a little girl. She was only three years old and she was three years old. She was` |
| `Look in thy glass` | Con LoRA Shakespeare | `Look in thy glass in love of the eye: That's when when the eye see thy on the sun'` |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (36,3M parametros, aproximadamente 145 MB en fp32); en cuantizaciones GGUF de 4 bits el modelo ocupa del orden de decenas de MB.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: llama.cpp y derivados (Ollama, servidores compatibles con la API de llama.cpp) gracias a los pesos GGUF; la carga de safetensors requiere el soporte MoE de llama.cpp o herramientas de conversion.
- Latencia y throughput: no disponibles de forma publicada; por el tamano del modelo se espera una latencia de milisegundos en hardware moderno, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Proposito |
|---|---|---|---|---|---|
| stories15M_MOE (este) | 36,3M totales, 4 expertos | no disponible | MIT | safetensors, GGUF | Pruebas de infraestructura MoE |
| ModelCloud/tinyllama-15M-stories | ~15M | no disponible | no disponible | safetensors | Modelo base de cuentos |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | safetensors, GGUF | Modelo pequeno de proposito general |
| Mixtral-8x7B | 46,7B totales, 12,9B activos | 32.768 | Apache 2.0 | safetensors, GGUF | MoE de proposito general |

La comparativa con TinyLlama-1.1B y Mixtral-8x7B es solo orientativa por categoria (modelo pequeno y MoE respectivamente); no existe un modelo publico equivalente de 36M parametros con cuatro expertos y router aleatorio.

## Limitaciones y advertencias

- El router tiene pesos inicializados aleatoriamente y el modelo no ha sido entrenado como MoE, por lo que la calidad de generacion es muy baja e incoherente.
- El autor indica explicitamente que el modelo es para pruebas y no para produccion.
- Riesgo elevado de alucinacion y de texto repetitivo, como muestra el ejemplo de la model card.
- Sesgos conocidos: no documentados; el corpus original son cuentos infantiles en ingles, con los sesgos propios de ese material.
- Limitaciones de idioma: no hay informacion sobre idiomas soportados; el entrenamiento original es en ingles.
- Licencia MIT: permite uso comercial, pero el modelo no es funcional para tareas reales.
- No hay informacion sobre longitud de contexto, cuantizaciones validadas ni rendimiento medido.
- El adaptador LoRA incluido solo se ha entrenado con 100 parrafos de Shakespeare y no generaliza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/stories15M_MOE
- Modelo base: https://huggingface.co/ModelCloud/tinyllama-15M-stories
- Repositorio de llama.cpp (soporte MoE y GGUF): https://github.com/ggml-org/llama.cpp
