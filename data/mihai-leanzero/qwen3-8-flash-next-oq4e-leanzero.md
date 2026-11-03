# Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-LeanZero

## Resumen

Qwen3.8-Flash-Next-oQ4e-LeanZero es una compilacion cuantizada a 4 bits en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por LeanZero (Mihai-LeanZero). El objetivo es hacer viable en un unico Mac con 128 GB de memoria unificado un modelo que en su version oficial BF16 ocupa 335,28 GiB (360 GB) repartidos en 131 shards de safetensors. Tras la conversion, el artefacto ocupa 100,275 GiB (107,67 GB) en disco y conserva el modelo de lenguaje, la tabla de embeddings de n-gramas de 51B, el codificador visual y la cabeza de prediccion multi-token (MTP).

El modelo base es una arquitectura experimental de Qwen (etiquetada internamente como `qwen4_exp`) con pipeline `image-text-to-text`, es decir, entrada de imagen y texto con salida de texto. La cuantizacion sigue la receta oQ4e de oMLX v0.7.3 (Apache-2.0, de jundot), con 4 bits afines para los expertos enrutados y la tabla de n-gramas, 8 bits para expertos compartidos y el resto de capas lineales, y BF16 intacto para el router MoE, las normas, las convoluciones y todo el codificador visual.

La relevancia de esta ficha es doble: por un lado documenta un caso practico de cuantizacion reproducible con verificacion criptografica por tensor; por otro, es una de las pocas builds publicas de este modelo base pensadas explicitamente para Apple Silicon, con el objetivo declarado de servir al motor MLX del agente goose local edition. No hay descargas ni likes registrados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), atencion lineal e hibrida, hiper-conexiones y cabeza MTP; etiqueta interna `qwen4_exp` |
| Parametros totales | no disponible (el modelo base no publica el recuento en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona una tabla de contexto medida, pero no se incluye en el extracto) |
| Tipos de cuantizacion | 4 bits afines (grupo 64) en expertos enrutados y MTP; 4 bits afines (grupo 32) en la tabla de n-gramas; 8 bits afines (grupo 128) en expertos compartidos; 8 bits afines (grupo 64) en atencion, indexer, atencion lineal, mezcladores de hiper-conexion, proyecciones MTP, embedding de tokens y cabeza de salida; BF16 en router MoE, normas, convoluciones y codificador visual |
| Idiomas soportados | no disponible (el set de calibracion es multilingue de codigo, pero no se enumeran idiomas soportados) |
| Licencia | `qwen-community-1.0` (etiqueta `license: other` en HuggingFace) |
| Formato de pesos | safetensors en formato MLX, 21 shards, 3.748 tensores almacenados (1.707 pesos cuantizados mas una constante `weight_scale` de 1,0) |

## Arquitectura y entrenamiento

El modelo base combina atencion lineal e hibrida con mezcla de expertos (MoE) y un esquema de hiper-conexiones que aparece en los mezcladores de la red. La presencia de un router MoE, expertos compartidos y expertos enrutados repartidos en 48 capas (mas la capa MTP) se deduce directamente del mapa de cuantizacion publicado. Ademas, el modelo incorpora una tabla de embeddings de n-gramas de 51B parametros almacenada en 128 shards, un codificador visual y una cabeza de prediccion multi-token (MTP) que puede emplearse para decodificacion especulativa en motores que la soporten.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Lo que si esta documentado es el proceso de cuantizacion de esta build: descarga unica de los 131 shards BF16 con verificacion sha256 contra los hashes LFS de HuggingFace en la revision `de4b8e4d43b917e7706784d8bb445c9af86a3540` (ultima modificacion 2026-08-27), redondeo ponderado por importancia (metodo oQe) con busqueda de clipping y reajuste por minimos cuadrados ponderados de escala y sesgo por grupo, calibrado sobre 1.024 secuencias de 512 tokens del set multilingue de codigo de oMLX. La implementacion propia se valido contra la rutina de oMLX en 241 casos adversariales con resultado bit-identico. El manifiesto `own_convert_manifest.json` registra repositorio y revision de origen, hashes de los datos de calibracion y sha256 de cada uno de los 3.748 tensores de salida.

## Capacidades

- Generacion de texto y razonamiento en un modelo de gran escala (el base se distribuye en BF16 con 335,28 GiB, lo que situa el modelo en la gama alta de Qwen).
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), con codificador visual conservado en BF16 sin cuantizar.
- Prediccion multi-token (MTP) para decodificacion especulativa, con la cabeza MTP cuantizada como una capa de decodificador mas.
- Mezcla de expertos con router y expertos compartidos, lo que permite activacion dispersa segun el token.
- Embeddings de n-gramas de 51B parametros, un componente poco habitual que sugiere capacidades de recuperacion o modelado lexico adicionales.
- Soporte de tool calling y agentes: no confirmado explicitamente en la informacion disponible; la build se prueba con el motor del agente goose local edition, lo que sugiere uso agentico, pero no se documentan formatos de function calling.
- Capacidades multilingues: el set de calibracion es multilingue de codigo, pero no se enumeran idiomas soportados ni se cuantifica la calidad por idioma.

## Casos de uso

- Desarrollo local en Apple Silicon: un unico Mac con 128 GB puede ejecutar el modelo completo en 4 bits, lo que permite iterar en prototipos multimodales sin depender de GPUs en la nube ni de presupuestos de inferencia por token.
- Agentes autonomos en local: la build se valida con el motor MLX de goose local edition, de modo que encaja en flujos de agente que requieren privacidad de datos y no pueden enviar contexto a APIs externas.
- Procesamiento de documentos con imagen y texto: al conservar el codificador visual en BF16, es adecuado para tareas de extraccion de informacion de capturas, formularios o diagramas combinadas con instrucciones en lenguaje natural.
- Decodificacion especulativa en produccion: la cabeza MTP cuantizada permite a motores compatibles acelerar la generacion aceptando tokens propuestos, lo que reduce la latencia en cargas interactivas.
- Investigacion en cuantizacion: el manifiesto por tensor, los errores relativos publicados y la comparacion contra la build de Jundot con la misma receta convierten este artefacto en un caso de estudio reproducible para evaluar metodos de redondeo ponderado por importancia.
- Experimentacion con embeddings de n-gramas: la tabla de 51B en 4 bits con grupo 32 permite estudiar el impacto de la cuantizacion agresiva en componentes lexicos de gran tamano sin disponer de un cluster.
- Evaluacion de modelos multimodales en hardware de consumo profesional: util para equipos que necesitan comparar comportamiento de un modelo frontier contra alternativas mas pequenas antes de comprometer infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

La model card si documenta verificaciones de fidelidad de la cuantizacion, que se recogen aqui por su valor tecnico:

| Metrica | Valor |
|---|---|
| Error relativo mediano, expertos enrutados 4 bits | 0,084 (peor caso 0,093) |
| Similitud coseno minima, expertos enrutados 4 bits | 0,9957 |
| Coincidencia de codigos 4 bits con la build de Jundot | 98,7 % de posiciones en la mediana |
| Error relativo mediano, expertos compartidos 8 bits | 0,0072 |
| Error relativo mediano, otras capas 8 bits | 0,0066 |
| Peor tensor individual (mezclador de hiper-conexion de entrada MTP) | error relativo 0,155, coseno 0,989 (Jundot: 0,170 en el mismo tensor) |
| Pesos redondeados a nearest bit-identicos a Jundot | 132 |
| Pesos copiados en BF16 byte-identicos a Jundot y a Qwen | 687 |
| Pesos con redondeo ponderado por importancia | 888 |
| Tensores almacenados totales | 3.748 |

Desglose de tamano en disco: modelo de lenguaje 68,227 GiB, embeddings de n-gramas 29,802 GiB, cabeza MTP 1,409 GiB, codificador visual 0,836 GiB; total 100,275 GiB (107,67 GB).

## Requisitos de hardware

- VRAM/memoria unificada: 100,275 GiB en disco; el autor indica que funciona en un unico Mac de 128 GB. En la medicion se elevo el limite de memoria cableada de la GPU a 120.832 MB mediante `sudo sysctl iogpu.wired_limit_mb=120832`.
- GPU recomendadas: Apple Silicon de gama alta; la medicion se realizo en un Mac Studio con M5 Max y 128 GB. No hay datos de ejecucion en GPUs NVIDIA o AMD.
- GPU de consumo: cabe en Mac con 128 GB de memoria unificada; no se documenta viabilidad en configuraciones de 64 GB o inferiores.
- Opciones de despliegue: motor MLX (la build se prueba con el motor de LeanZero, un fork de Rapid-MLX, version `v0.14.3-lz.24`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato MLX los descarta directamente.
- Latencia y throughput: no disponibles en el extracto proporcionado; la model card menciona una tabla de contexto medida que no se incluye.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-LeanZero | no disponible | no disponible | 4/8 bits MLX + BF16 parcial | qwen-community-1.0 | HuggingFace, 0 descargas |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | no disponible | misma receta oQ4e | qwen-community-1.0 (presumiblemente) | HuggingFace |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible | no disponible | BF16 | qwen-community-1.0 | HuggingFace, 335,28 GiB |

Las tres variantes comparten el mismo modelo base y, en el caso de las dos cuantizadas, la misma receta de oMLX; la diferencia principal es el proceso de verificacion y el ecosistema de destino (MLX en ambos casos). No se dispone de datos de rendimiento comparado con modelos de otras familias.

## Limitaciones y advertencias

- La model card esta truncada en el extracto disponible: falta la seccion de licencia completa, la tabla de contexto medida y los detalles de los tres interruptores de atencion anadidos al motor.
- El modelo base es experimental (`qwen4_exp`); no hay garantias de estabilidad de API ni de soporte a largo plazo.
- La licencia `qwen-community-1.0` impone condiciones especificas de uso comercial que deben revisarse en el archivo `LICENSE` antes de desplegar en produccion; no se detallan en la informacion disponible.
- El error relativo del peor tensor (0,155 en el mezclador de hiper-conexion de entrada de la cabeza MTP) es notablemente superior al del resto y puede afectar a la calidad de la decodificacion especulativa si se activa.
- La cuantizacion a 4 bits de los expertos enrutados (error mediano 0,084) introduce degradacion medible frente a BF16; no se han publicado evaluaciones de calidad downstream que cuantifiquen el impacto real.
- Solo es ejecutable en Apple Silicon con MLX; no hay pesos GGUF ni compatibilidad con ecosistemas CUDA.
- No se enumeran idiomas soportados ni se documentan sesgos conocidos, riesgo de alucinacion o limitaciones por idioma.
- Ausencia total de traccion (0 descargas, 0 likes) en el momento de la publicacion: no hay validacion independiente por parte de la comunidad.
- El requisito de 128 GB de memoria unificada excluye la practica totalidad de equipos de consumo, incluidos MacBook Pro de gama alta con 64 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-LeanZero
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build de referencia con la misma receta: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- LeanZero: https://leanzero.net
- oMLX (receta oQ4e, Apache-2.0, jundot): no disponible el enlace directo en la informacion proporcionada
- Rapid-MLX (motor base del fork de LeanZero): no disponible el enlace directo en la informacion proporcionada
- goose local edition (agente): no disponible el enlace directo en la informacion proporcionada
