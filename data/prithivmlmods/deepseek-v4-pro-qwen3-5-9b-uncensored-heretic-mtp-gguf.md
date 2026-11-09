# prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MTP-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MTP-GGUF es una cuantizacion GGUF del modelo comunitario `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicada por el usuario prithivMLmods. El modelo subyacente es una version "decensored" (abliterated) del fine-tune de razonamiento `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`, que a su vez es un ajuste de Qwen3.5-9B destilado de DeepSeek-V4-Pro en modo Max Effect sobre aproximadamente 250.000 muestras de matematicas y STEM. Cuenta con 9.197.093.888 parametros totales (unos 9,2B) y la model card declara licencia Apache 2.0.

La publicacion anade dos elementos tecnicos diferenciadores: por un lado, el etiquetado MTP (Multi-Token Prediction), que integra cabezas de prediccion multiple en los propios pesos para acelerar la decodificacion especulativa sin necesidad de un modelo borrador separado; por otro, un conjunto amplio de cuantizaciones GGUF (desde Q3_K_M hasta BF16) generadas con llama.cpp, ademas de un fichero `mmproj` multimodal que sugiere soporte de entrada imagen-texto.

El interes practico reside en que empaqueta un modelo de razonamiento matematico con supuesta alta adherencia de formato en un formato ejecutable localmente en hardware de consumo, con variantes que van de 4,74 GB a 18,4 GB. La model card advierte explicitamente de que las cifras de rendimiento reportadas corresponden al modelo original y no a esta version decensored, y de que los resultados deben verificarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5, con cabezas MTP (Multi-Token Prediction) para decodificacion especulativa |
| Parametros totales | 9.197.093.888 (aprox. 9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; mmproj-bf16 (proyeccion multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 70,8 GB); existen variantes NVFP4-GPTQ y NVFP4-GPTQ-GGUF en repos separados |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.5 con 9,2B parametros, ajustado por destilacion desde DeepSeek-V4-Pro en "Max Effect mode" sobre unas 250.000 muestras de matematicas y STEM. El entrenamiento del modelo original consistio en una fase de SFT seguida de una etapa ligera de RL con GSPO (Group Sequence Policy Optimization). La model card indica explicitamente que no se incluyeron datos de codigo en el entrenamiento, lo que explica que las mejoras en coding y tool-use se describan como pequenas y preliminares.

Sobre esa base, xtools-at aplico Heretic v2.0.0.dev0 con ablacion de rango arbitrario (Arbitrary-Rank Ablation) en las capas 9 a 24 para eliminar el comportamiento de rechazo, reportando una caida de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 respecto al original. Esta publicacion GGUF anade el mecanismo MTP: en lugar de emplear un modelo borrador externo, los pesos incluyen cabezas adicionales que predicen varios tokens futuros en una sola pasada, habilitando decodificacion especulativa autocontenida. Los tags incluyen referencias a FP4 y a hardware NVIDIA Blackwell (SM120, GB202, B200, B300), lo que sugiere optimizaciones para esas plataformas, aunque la model card no detalla cuales.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis en matematicas y disciplinas STEM.
- Razonamiento matematico con formato de respuesta controlado: la model card del original reporta respuesta de letra unica el 97,2% de las veces frente al 37,3% de Qwen3.5-9B.
- Tool calling y function calling (etiquetados como `tool-use` y `function-calling`), aunque la propia card califica las mejoras en este terreno como pequenas y preliminares.
- Decodificacion especulativa integrada via MTP, sin modelo borrador separado.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y el repo incluye un fichero `mmproj-bf16.gguf` de 922 MB para proyeccion vision-lenguaje.
- Comportamiento "uncensored"/abliterated: rechazos reducidos de forma deliberada respecto al modelo original.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- No se documentan capacidades de audio ni modo "thinking" explicito mas alla del razonamiento destilado.

## Casos de uso

- Resolucion de problemas matematicos y cientificos en local: el modelo esta destilado sobre 250K muestras de math y STEM y reporta 94,50% en GSM8K (cuatro ejecuciones, NVFP4 sobre vLLM), lo que lo hace util para tutoria o generacion de ejercicios resueltos en entornos sin conexion.
- Evaluacion automatizada con formato estricto: su supuesta adherencia del 97,2% a respuestas de letra unica lo hace candidato para pipelines de evaluacion tipo MMLU donde el parseo de la salida es critico.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M (5,78 GB) y Q5_K_M (6,64 GB) caben en GPUs de 8-12 GB de VRAM via llama.cpp u Ollama.
- Prototipado de asistentes tecnicos sin filtros editoriales: para investigacion sobre comportamiento de modelos abliterated, analisis de sesgos o estudios de alineacion, con la advertencia de que la salida requiere revision humana.
- Generacion de contenido cientifico divulgativo en ingles: redaccion de explicaciones de fisica o quimica apoyadas en su entrenamiento STEM, ejecutada localmente por privacidad de datos.
- Aceleracion de inferencia en hardware Blackwell: el tag MTP y las referencias a FP4/B200/B300 apuntan a escenarios de decodificacion especulativa en GPUs de nueva generacion, aunque no se publican cifras de throughput.
- Experimentacion multimodal ligera: con el fichero `mmproj` puede procesar imagenes junto a texto para tareas de descripcion o extraccion de informacion, si bien la card no detalla la calidad de esta capacidad.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo original (`Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`), no a esta version decensored ni a estas cuantizaciones GGUF.

| Benchmark | Resultado | Condiciones |
|---|---|---|
| GSM8K | 94,50% | Media de cuatro ejecuciones, NVFP4 sobre vLLM |
| MMLU-Pro (muestra Math/Physics/Chemistry, 1.500 preguntas) | 90,53% de media | +0,93 puntos sobre Qwen3.5-9B; 36% menos tokens de razonamiento por respuesta correcta |
| Adherencia de formato (respuesta de letra unica) | 97,2% | Frente al 37,3% de Qwen3.5-9B |

No se han publicado resultados de benchmarks de esta cuantizacion GGUF ni del modelo heretic en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q3_K_M 4,74 GB; Q3_K_L 5,05 GB; Q4_K_S 5,49 GB; Q4_K_M 5,78 GB; Q5_K_S 6,47 GB; Q5_K_M 6,64 GB; Q6_K 7,56 GB; Q8_0 9,79 GB; BF16 18,4 GB. Anadir aproximadamente 0,9 GB si se usa el proyector multimodal.
- Cabe en GPU de consumo: si, desde una RTX 3060 de 12 GB con Q4_K_M o Q5_K_M, hasta una RTX 4090 de 24 GB con Q8_0 o BF16. Las variantes Q3 caben en GPUs de 8 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 para Q6_K/Q8_0; A100 o H100 para BF16 con contexto largo; los tags mencionan RTX PRO 6000, B200 y B300 para las variantes FP4/NVFP4.
- Opciones de despliegue: llama.cpp (herramienta con la que se generaron las cuantizaciones), Ollama, y text-generation-inference segun los tags; el modelo original se evaluo con vLLM en NVFP4. El soporte efectivo del MTP dependera de que el runtime implemente las cabezas de prediccion multiple.
- Latencia y throughput: no disponibles. El MTP deberia reducir el coste por token frente a decodificacion autoregresiva pura, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MTP-GGUF | 9,2B | no disponible | Benchmarks solo del original: GSM8K 94,50%, MMLU-Pro STEM 90,53% | Apache 2.0 | GGUF en HF |
| Qwen3.5-9B (base) | aprox. 9B | no disponible | Referencia de comparacion: 89,60% en MMLU-Pro STEM segun la card del original | no disponible en esta informacion | Pesos originales en HF |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (original sin decensurar) | aprox. 9B | no disponible | GSM8K 94,50%, MMLU-Pro STEM 90,53% | Apache 2.0 | Pesos en HF |
| Variante NVFP4-GPTQ del mismo autor | 9,2B | no disponible | no disponible | Apache 2.0 | Repo HF separado |

La comparativa con modelos de otras familias (Llama, Mistral, Gemma) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la ablacion de las capas 9-24 elimina deliberadamente el comportamiento de rechazo, lo que incrementa el riesgo de generar contenido danino, sesgado o inexacto sin salvaguardas. No es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Las cifras de benchmarks corresponden al modelo original, no a esta version decensored; la ablacion puede degradar el rendimiento real y no se han publicado mediciones sobre la variante heretic.
- La propia model card califica como "pequenas y preliminares" las mejoras en coding y tool-use, y el entrenamiento no incluyo datos de codigo.
- Solo soporta ingles segun el campo de idiomas; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion en razonamiento STEM: la alta puntuacion en formato no garantiza correccion del contenido; la card pide verificacion independiente de las salidas.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- El soporte de MTP depende del runtime; llama.cpp, Ollama o TGI pueden no explotar las cabezas de prediccion multiple, en cuyo caso se pierde la ventaja de velocidad.
- El repo pesa 70,8 GB por acumulacion de cuantizaciones; conviene descargar solo el fichero necesario.
- Aunque la licencia declarada es Apache 2.0, el modelo deriva de DeepSeek-V4-Pro y Qwen3.5; conviene revisar las condiciones de las licencias de origen antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MTP-GGUF
- Modelo base (decensored): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo original sin decensurar: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Variante NVFP4-GPTQ: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ
- Variante NVFP4-GPTQ-GGUF: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/prithivMLmods
