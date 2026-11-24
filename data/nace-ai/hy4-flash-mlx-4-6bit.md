# nace-ai/Hy4-flash-MLX-4.6bit

## Resumen

Hy4-flash es un modelo de lenguaje de gran escala desarrollado por Tencent, publicado en Hugging Face bajo la licencia HY Community License. La ficha que nos ocupa, `nace-ai/Hy4-flash-MLX-4.6bit`, es una cuantizacion del modelo base `tencent/Hy4-flash` realizada por Nace.AI, empaquetada en formato MLX para su ejecucion en hardware Apple Silicon. Con 148.896.743.957 parametros totales (segun los safetensors del repositorio) y un tamano de repositorio de 125,2 GB, se trata de una cuantizacion a 4,6 bits por peso.

El modelo base Hy4-flash es un transformer de aproximadamente 149.000 millones de parametros orientado a tareas de generacion de texto, razonamiento y codigo, con capacidades de vision y decodificacion especulativa (MTP) segun se desprende de las referencias de la model card a tablas de "Engram" y "vision/MTP". La cuantizacion de Nace.AI preserva esas capacidades y anade un loader especifico para macOS.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 150.000 millones de parametros en equipos Apple Silicon con memoria unificada, algo impracticable con los pesos originales en bf16 (que requeririan del orden de 300 GB). El autor reporta que en un subconjunto fijo de 100 preguntas de LiveCodeBench release_v6 con un limite de 8.192 tokens, esta cuantizacion resuelve 39/100, el mismo resultado que el pack de 4 bits pero con menor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); el modelo base incluye componentes de vision y MTP |
| Parametros totales | 148.896.743.957 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4,6 bits por peso (MLX); el repositorio incluye tambien safetensors y GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | tencent-hy-license (HY Community License) |
| Formato de pesos | safetensors, GGUF y MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base `tencent/Hy4-flash` mas alla de que se trata de un transformer de aproximadamente 149.000 millones de parametros. La model card de la cuantizacion menciona explicitamente tablas "Engram" requeridas y excluye vision/MTP del computo de tamano del payload de pesos, lo que indica que el modelo base incorpora modulos de vision y de prediccion multi-token (MTP), probablemente empleados para decodificacion especulativa. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

En cuanto al proceso de cuantizacion, Nace.AI reporta haber medido 37 variantes de cuantizacion sobre los mismos 11 textos y 5.621 tokens puntuados, y presenta una grafica de calidad (KL) comparativa. La variante 4.6-bit se evaluo ademas en un subconjunto fijo de 100 preguntas de LiveCodeBench release_v6 con un limite de 8.192 tokens, obteniendo 39/100 aciertos, identico al pack de 4 bits pero con menor tamano de pesos. El repositorio incluye un script `run_mlx.py` y un fichero `requirements-macos.txt` para su ejecucion en macOS.

## Capacidades

- Generacion de texto en ingles.
- Razonamiento y resolucion de problemas de codigo: la evaluacion del autor sobre LiveCodeBench release_v6 (39/100) confirma competencia en programacion competitiva.
- Capacidades de vision: el modelo base incluye modulos de vision segun la referencia a "vision/MTP" en la model card (no se detalla su alcance en esta cuantizacion).
- Decodificacion especulativa mediante MTP (multi-token prediction) en el modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia a la programacion en local sobre Apple Silicon: con 125,2 GB de pesos en 4,6 bits, el modelo puede cargarse en un Mac Studio con memoria unificada alta y usarse para autocompletado, explicacion y refactorizacion de codigo sin depender de la nube.
- Evaluacion de calidad de cuantizaciones: el repositorio incluye datos comparativos de 37 variantes y un benchmark LiveCodeBench, lo que lo convierte en una referencia util para investigadores que estudien el impacto de la cuantizacion en modelos de ~150.000 millones de parametros.
- Prototipado de pipelines de generacion de codigo: el script `run_mlx.py` permite integrar el modelo en flujos de prueba locales para validar prompts y estrategias de muestreo antes de desplegar en infraestructura mayor.
- Investigacion sobre decodificacion especulativa: al conservar los modulos MTP del modelo base, sirve para experimentar con tecnicas de aceleracion de inferencia en MLX.
- Desarrollo de asistentes tecnicos en ingles: su rendimiento en tareas de codigo lo hace apto para bots de soporte a desarrolladores que operen exclusivamente en ingles.
- Educacion y experimentacion sin GPU dedicada: permite a estudiantes y equipos pequenos trabajar con un modelo de escala frontier en hardware de consumo Apple, sin necesidad de clusters con A100/H100.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LiveCodeBench release_v6 (subconjunto fijo de 100 preguntas) | Limite de 8.192 tokens, cuantizacion 4,6 bits MLX | 39/100 resueltas |
| LiveCodeBench release_v6 (misma prueba) | Pack de 4 bits | 39/100 resueltas (mismo resultado, mayor tamano) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites estandar para esta cuantizacion concreta.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 125,2 GB, por lo que se necesita al menos esa cantidad de memoria unificada mas el overhead del runtime MLX y de la cache KV. En la practica, se recomienda un minimo de 128 GB de memoria unificada, y 192 GB o mas para contextos largos.
- GPU recomendadas: Apple Silicon con memoria unificada alta (M2 Ultra con 192 GB, M3 Ultra con hasta 512 GB). No esta pensado para GPUs NVIDIA discretas en este formato; para esas plataformas habria que usar los pesos safetensors o GGUF originales.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta con memoria unificada suficiente; no cabe en RTX 4090 (24 GB) ni en ninguna GPU de consumo con VRAM discreta.
- Opciones de despliegue: MLX en macOS mediante el loader incluido (`run_mlx.py`); el repositorio tambien contiene safetensors y GGUF, lo que abre la puerta a llama.cpp u otros runtimes compatibles con esos formatos, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai/Hy4-flash-MLX-4.6bit | 148.896.743.957 | no disponible | 4,6 bits MLX | tencent-hy-license | Hugging Face (645 descargas) |
| tencent/Hy4-flash (base) | ~149.000 millones | no disponible | bf16/fp16 (pesos completos) | tencent-hy-license | Hugging Face |
| Pack de 4 bits de Nace.AI (referenciado en la model card) | ~149.000 millones | no disponible | 4 bits | tencent-hy-license | Hugging Face (mismo autor) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Idioma: el repositorio declara unicamente ingles; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Licencia: la HY Community License es una licencia "other" con terminos propios; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones de escala, atribucion o redistribucion.
- Cuantizacion: la perdida de precision a 4,6 bits puede degradar tareas distintas de las evaluadas; el propio autor solo reporta LiveCodeBench y una metrica KL sobre 11 textos, una muestra limitada.
- Alucinacion: no se han publicado evaluaciones de factualidad ni de tasas de alucinacion para esta variante.
- Sesgos: no disponibles en la informacion proporcionada.
- Contexto: se desconoce la longitud maxima de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- Hardware: requiere equipos Apple Silicon con memoria unificada muy alta; no es desplegable en GPUs de consumo convencionales en este formato.
- Madurez: el repositorio tiene 1 like y 645 descargas, lo que sugiere una validacion comunitaria escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-MLX-4.6bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Sitio del autor de la cuantizacion: https://www.nace.ai/
- Datos comparativos de cuantizaciones (referenciado en la model card): `assets/combined-kl.json` dentro del repositorio
- Licencia: fichero `LICENSE` dentro del repositorio
