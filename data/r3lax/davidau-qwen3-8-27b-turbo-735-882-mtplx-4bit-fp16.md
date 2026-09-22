# r3lax/DavidAU-Qwen3.8-27B-TURBO-735-882-MTPLX-4bit-FP16

## Resumen

r3lax/DavidAU-Qwen3.8-27B-TURBO-735-882-MTPLX-4bit-FP16 es una forja (build) cuantizada en formato MLX del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un transformer de aproximadamente 27.356 millones de parametros (dato real de safetensors) orientado a generacion de texto y uso conversacional. El trabajo del autor no consiste en un entrenamiento nuevo, sino en empaquetar los pesos del modelo base en 4 bits afines con grupo de 64, manteniendo en FP16 los pesos no cuantizados y el sidecar de decodificacion especulativa MTP, e integrarlo con el runtime MTPLX para Apple Silicon.

La innovacion relevante de esta ficha es la ruta de inferencia: MTPLX implementa decodificacion especulativa nativa basada en prediccion multi-token (MTP) sobre GPUs de Apple. La build esta pensada especificamente para Macs con M1 y M2, que carecen de BF16 nativo (emulado y mas lento en prefill); al conservar los pesos no cuantizados y el sidecar en FP16, el prefill discurre por la ruta nativa rapida. En M3 y posteriores el autor recomienda la variante gemela en BF16.

El interes practico ahora mismo es acotado pero claro: es una de las pocas builds publicadas que documenta ganancias de throughput medidas con decodificacion especulativa MTP en hardware Apple Silicon de gama alta (M1 Max 64 GB), con un multiplicador de hasta 1,34x sobre la generacion autorregresiva estandar. El repositorio ocupa 16,9 GB y se publica bajo licencia Apache-2.0, heredada del modelo fuente. Los datos de contexto, idiomas y composicion del dataset no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como qwen3_5 en los tags; decodificacion especulativa MTP via MTPLX) |
| Parametros totales | 27.356.723.952 (aprox. 27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuerpo en 4-bit affine, group size 64, dtype FP16; sidecar MTP en FP16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (coincide con la del modelo fuente) |
| Formato de pesos | safetensors para MLX (libreria mlx); repositorio de 16,9 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base en la documentacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF o DPO: no disponible). Lo que si se detalla es la receta de forja aplicada por r3lax: el cuerpo del modelo se cuantiza a 4 bits afines con tamano de grupo 64 en dtype FP16, se conserva la politica MTP con el sidecar tambien casteado a FP16, y se emplea un perfil de ejecucion "sustained" ajustado a la mejor profundidad especulativa (D1) medida sobre un M1 Max de 64 GB. La forja se realizo con MTPLX 2.11.2.

La innovacion tecnica destacable es el uso de MTPLX, que lleva la decodificacion especulativa basada en prediccion multi-token (MTP) al ecosistema MLX de Apple Silicon. En lugar de generar un token por paso autorregresivo, el sidecar MTP propone varios tokens candidatos que el modelo principal verifica, con una profundidad de especulacion configurable (D1, D2, D3). El motivo de publicar una build FP16 separada es de compatibilidad de hardware: las GPUs M1 y M2 no tienen BF16 nativo y lo emulan, lo que penaliza el procesamiento del prompt; mantener pesos y sidecar en FP16 permite que el prefill use la ruta nativa rapida. En M3 y superiores, el autor indica que la build gemela en BF16 es la alternativa adecuada.

## Capacidades

- Generacion de texto y uso conversacional: son las dos tareas declaradas en el pipeline y en los tags del repositorio (text-generation, conversational).
- Decodificacion especulativa MTP con profundidades configurables D1, D2 y D3, con ganancias de throughput medidas frente al modo autorregresivo.
- Inferencia optimizada para Apple Silicon mediante la libreria MLX y el runtime MTPLX.
- Compatibilidad con pesos cuantizados a 4 bits y sidecar en FP16, lo que permite ejecutar el modelo en memoria unificada de equipos Apple.
- El nombre del modelo base incluye la etiqueta "Heretic-Uncensored", lo que sugiere un ajuste orientado a reducir rechazos, si bien no hay documentacion proporcionada que detalle ese comportamiento.
- No disponible: soporte de tool calling o function calling, capacidades de agente y razonamiento multi-paso, capacidades multimodales (vision o audio), modo de razonamiento explicito (thinking mode), cobertura multilingue y capacidades especificas de codigo o matematicas.

## Casos de uso

- Inferencia local en Mac con M1 o M2: la build esta diseñada explicitamente para equipos sin BF16 nativo; un desarrollador puede servir el modelo con `mtplx serve --model r3lax/DavidAU-Qwen3.8-27B-TURBO-735-882-MTPLX-4bit-FP16 --download` y obtener el prefill por ruta nativa FP16.
- Asistente conversacional de escritorio sin conexion: al ser un modelo de 27,36B en 4 bits con 16,9 GB de pesos, encaja en flujos de trabajo de privacidad estricta donde el texto no debe salir del equipo.
- Evaluacion de decodificacion especulativa: sirve como banco de pruebas reproducible para medir el multiplicador de tokens por segundo de D1, D2 y D3 frente a la generacion autorregresiva en hardware Apple.
- Prototipado de fine-tunes sobre el modelo base: al derivar de DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, es util como punto de partida cuantizado para probar el comportamiento del base antes de invertir en entrenamiento.
- Generacion de texto a granel en local: con 18,4 tok/s en modo AR y 24,6 tok/s en D1 sobre M1 Max 64 GB, resulta viable para tareas por lotes no sensibles a la latencia (resumen, reformulacion, clasificacion generativa) ejecutadas de noche.
- Sustitucion de la variante BF16 en parques de equipos mixtos: en flotas con M1/M2 y M3 conviviendo, esta build permite usar la misma ruta FP16 en los equipos antiguos y reservar la gemela BF16 para los nuevos.
- Experimentacion con modelos "uncensored" en investigacion: para estudiar el comportamiento de modelos con ajuste orientado a reducir rechazos, siempre bajo revision etica y legal del caso de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta mediciones de throughput realizadas en un M1 Max de 64 GB:

| Modo | Tokens por segundo | Multiplicador vs AR |
|---|---|---|
| AR (autorregresivo) | 18,4 | 1,00x |
| D1 (profundidad 1) | 24,6 | 1,34x |
| D2 (profundidad 2) | 22,4 | 1,22x |
| D3 (profundidad 3) | 23,0 | 1,26x |

Segun estos datos, la mejor configuracion de decodificacion especulativa es D1, con 24,6 tok/s, un 34 % mas que la generacion autorregresiva. D3 (23,0 tok/s) supera a D2 (22,4 tok/s), lo que indica que aumentar la profundidad mas alla de D1 no mejora de forma monotona el rendimiento en este hardware.

## Requisitos de hardware

- El repositorio de pesos ocupa 16,9 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible mas el overhead del runtime; el dato exacto de VRAM recomendada no esta disponible.
- Medicion oficial disponible en un unico equipo: Apple M1 Max con 64 GB de memoria unificada, con 18,4 tok/s en AR y 24,6 tok/s en D1.
- Orientado a Apple Silicon. La build FP16 esta pensada para M1 y M2 (sin BF16 nativo); en M3 y posteriores el autor remite a la variante BF16.
- No disponible: compatibilidad con GPUs NVIDIA o AMD, y por tanto no hay datos de VRAM para A100, H100 o RTX 4090.
- Opciones de despliegue: runtime MTPLX mediante el comando `mtplx serve --model r3lax/DavidAU-Qwen3.8-27B-TURBO-735-882-MTPLX-4bit-FP16 --download`; la libreria declarada es mlx. No disponible: soporte mediante vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: los unicos datos publicados son los 18,4 / 24,6 / 22,4 / 23,0 tok/s del apartado anterior, medidos en M1 Max 64 GB. No hay mediciones de latencia de prefill ni de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| r3lax/DavidAU-Qwen3.8-27B-TURBO-735-882-MTPLX-4bit-FP16 | 27,36B | no disponible | MLX safetensors, 4-bit affine group 64 + sidecar MTP FP16 | Apple Silicon M1/M2 (ruta FP16) | apache-2.0 |
| blackfan23/DavidAU-Qwen3.8-27B-TURBO-Fable-Cold-Fusion-MTPLX-4bit | no disponible (mismo modelo base) | no disponible | MLX, 4-bit, BF16 | Apple Silicon M3 o superior | no disponible |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | no disponible | no disponible | no disponible (modelo fuente sin cuantizar) | no disponible | apache-2.0 (segun la build derivada) |

No se dispone de datos de contexto, rendimiento en benchmarks academicos ni licencia explicita de la variante BF16, por lo que la comparacion se limita a parametros y formato. No hay informacion sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay evaluacion de sesgos publicada para esta build ni para el modelo base.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de veracidad ni de tasa de alucinacion.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y la lista de idiomas; la model card no incluye ninguna seccion sobre cobertura linguistica.
- La etiqueta "Heretic-Uncensored" del modelo base indica un ajuste orientado a reducir rechazos. Esto implica mayor riesgo de generar contenido inapropiado, danino o legalmente problematico, y exige revision y filtros adicionales si se despliega en produccion.
- Licencia Apache-2.0, que en principio permite uso comercial, pero el autor indica que la licencia "coincide con la del modelo fuente"; conviene verificar los terminos del modelo base y de los datos con los que se entreno antes de un uso comercial.
- Dependencia de hardware: al estar en formato MLX y depender del runtime MTPLX, no es portable directamente a ecosistemas CUDA ni a servidores de inferencia convencionales.
- Madurez y adopcion: 0 descargas y 1 like en el momento de los datos; es una build recien publicada (creada y actualizada el 22 de septiembre de 2026) sin validacion independiente.
- Reproducibilidad: el rendimiento reportado proviene de un unico equipo (M1 Max 64 GB) y no se han publicado mediciones en otros modelos de Mac.
- No hay informacion sobre el dataset de entrenamiento, el proceso de alineacion ni las limitaciones conocidas del modelo base, lo que dificulta evaluar riesgos de produccion.

## Enlaces

- HuggingFace (esta build): https://huggingface.co/r3lax/DavidAU-Qwen3.8-27B-TURBO-735-882-MTPLX-4bit-FP16
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Variante gemela en BF16 para M3 o superior: blackfan23/DavidAU-Qwen3.8-27B-TURBO-Fable-Cold-Fusion-MTPLX-4bit (URL completa no disponible en la informacion proporcionada)
- Runtime MTPLX (version empleada: 2.11.2): repositorio o pagina del proyecto no disponibles en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
