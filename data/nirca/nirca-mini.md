# nirca/nirca-mini

## Resumen
Nirca Mini es un modelo de lenguaje decoder-only, afinado para chat, desarrollado por el usuario nirca y publicado en Hugging Face. Tiene unos 109 millones de parametros y se ha entrenado desde cero con pesos ternarios: los pesos de sus capas lineales valen -1, 0 o +1, con una escala y un sesgo por cada bloque de 128 pesos. No usa tokenizador; lee y escribe bytes directamente, con un vocabulario de 265 simbolos (los 256 valores de byte mas 9 tokens especiales).

Su arquitectura combina recurrencia latente con mezcla de expertos: un unico bloque recurrente se repite entre 1 y 24 veces (media de 8 durante el entrenamiento), cada pasada enruta hacia el mismo pool compartido de 32 expertos (8 activos por token) y una cabeza de parada decide cuando detener el calculo. La ventana de contexto es de 2.048 bytes y el modelo solo maneja ingles.

Es relevante por dos motivos: es un caso poco frecuente de entrenamiento consciente de cuantizacion ternaria desde fases tempranas (los pesos ternarios se aprenden, no se cuantizan a posteriori) y puede ejecutarse en el navegador mediante WebGPU. En contrapartida, no publica resultados de benchmarks, no declara licencia y su tamano lo situa en el terreno de la investigacion y la experimentacion, no en el de la produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only con recurrencia latente y mezcla de expertos (MoE) |
| Parametros totales | ~109 millones |
| Parametros activos | no disponible (8 expertos activos de 32 por token; el autor no publica el recuento de parametros activos) |
| Longitud de contexto | 2.048 bytes |
| Tipos de cuantizacion | Pesos ternarios (-1, 0, +1) con escala y sesgo por bloque de 128 (layout afin de 2 bits de MLX). No se documentan otras cuantizaciones (GGUF, GPTQ, AWQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible (los datos de entrenamiento incluyen material bajo CC BY 4.0 y CC BY-NC-SA 4.0) |
| Formato de pesos | safetensors (`model.safetensors` + `config.json`), con checkpoints versionados por tokens vistos |
| Vocabulario | 265 tokens: 256 valores de byte y 9 tokens especiales |
| Anchura del modelo | 512 |
| Cabezas de atencion | 8, con embeddings posicionales rotatorios (RoPE) |
| Expertos | 32 en un unico pool compartido, 8 activos por token |
| Recurrencia | Un bloque repetido con parada aprendida, de 1 a 24 pasadas (media de 8 en entrenamiento) |
| Formato de chat | ChatML (`<|im_start|>` / `<|im_end|>`) |
| Objetivo de entrenamiento | Prediccion del siguiente byte; en conversaciones, perdida solo en los turnos del asistente |
| Pasos de entrenamiento | 68.948 |
| Tokens vistos | 1.773.819.035 (un token equivale a un byte) |
| Tamano del repositorio | 2,4 GB (incluye todos los checkpoints publicados) |
| Fechas del repositorio | Creado el 2026-10-08, actualizado el 2026-10-08 (segun los metadatos de Hugging Face) |

## Arquitectura y entrenamiento
Nirca Mini es un transformer decoder-only con dos capas densas que se ejecutan una sola vez y un bloque recurrente que se ejecuta repetidamente. En cada pasada, el bloque enruta hacia el mismo pool compartido de 32 expertos; una cabeza de parada, inspirada en PonderNet (Banino et al., 2021), decide byte a byte si otra pasada cambiaria la respuesta, y la prediccion de cada pasada se pondera por la probabilidad de detenerse en ella. El modelo se inspira en mini-AGI (volotat) y empezo como un port de ese proyecto a MLX. Respecto al original, conserva los bytes sin tokenizador, la recurrencia latente, el pool compartido de expertos y la cabeza de parada, y cambia la cuantizacion a ternaria, el formato de chat a ChatML y el pool de expertos por uno fijo de 32 en lugar de uno que crece y se poda solo.

El entrenamiento se hizo desde cero con entrenamiento consciente de cuantizacion ternaria desde el paso 14.655 (unos 29,5 millones de tokens), de modo que los pesos publicados son los aprendidos, no cuantizados despues. En total se vieron 1.773.819.035 bytes en 68.948 pasos, con perdida solo en los turnos del asistente desde el paso 61.181. Los datos incluyen un corpus abierto de preentrenamiento (el de mini-AGI), datasets abiertos de chat (HuggingFaceTB/smoltalk y open-thoughts/OpenThoughts-114k), un dataset abierto de razonamiento, conversaciones sinteticas generadas por modelos de pesos abiertos y un conjunto reducido de chats privados anonimizados, mas dos datasets aun no publicos. El flujo documentado incluye division por contenido (sin repartir una misma pregunta entre splits), filtro de longitud a 2.048 bytes, anonimizacion con marcadores tipados, descarte de conversaciones sinteticas que nombran identificadores de personas conocidas y descontaminacion mediante solapamiento de 8-gramas segun el criterio de PaLM.

## Capacidades
- Generacion de texto conversacional en ingles con formato ChatML, con perdida entrenada especificamente sobre los turnos del asistente.
- Procesamiento a nivel de byte: no depende de tokenizador, por lo que puede manejar texto ruidoso, secuencias de bytes arbitrarias y vocabularios fuera de distribucion sin errores de tokenizacion.
- Computo adaptativo: el numero de pasadas del bloque recurrente varia entre 1 y 24 y la cabeza de parada lo ajusta por byte, de modo que las entradas sencillas consumen menos computo.
- Mezcla de expertos dispersa: 8 de 32 expertos activos por token.
- Ejecucion en navegador mediante WebGPU (demo publica).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes, razonamiento multi-paso con herramientas, vision, audio ni modo de pensamiento.
- Multilingue: no. Solo ingles declarado.
- No se publican capacidades de razonamiento, codigo o matematicas medidas con benchmarks.

## Casos de uso
- Demostracion de chat en el navegador: el modelo esta pensado para cargarse via WebGPU sin instalacion, de modo que sirve para mostrar inferencia local de un modelo ternario en una pagina web.
- Investigacion en cuantizacion ternaria: al haberse entrenado con QAT desde el paso 14.655, es un sujeto de estudio util para comparar pesos ternarios aprendidos frente a pesos cuantizados a posteriori.
- Investigacion en recurrencia latente y parada adaptativa: el bloque recurrente con 1 a 24 pasadas y cabeza de parada permite experimentar con computo variable por token en un modelo de tamano reducido.
- Experimentos con modelos byte-level: al no tener tokenizador y trabajar con 265 simbolos, sirve para estudiar generacion a nivel de byte y para prototipos donde un tokenizador BPE seria un estorbo.
- Investigacion academica con recursos limitados: con ~109 millones de parametros y pesos ternarios, el ajuste fino y la inferencia caben en hardware modesto, incluido CPU o GPU integrada, lo que facilita reproducir experimentos.
- Referencia metodologica de higiene de datos: el flujo documentado (splits por contenido, filtro de longitud, anonimizacion con marcadores, comprobacion de identificadores, descontaminacion por 8-gramas) puede reutilizarse como plantilla en otros proyectos.
- Prototipos de interfaz conversacional: util para validar un producto de chat con un modelo pequeno antes de migrar a modelos mayores, asumiendo calidad limitada.
- Evaluacion de despliegue en el cliente: sirve para medir latencia y consumo de memoria de un modelo ternario recurrente en navegador o en dispositivos con poca memoria.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que aun no hay resultados de evaluacion publicados y que durante el entrenamiento solo se mide la perdida de validacion sobre conversaciones reservadas que no salen de la maquina que las puntua; esos valores no se publican.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible como dato publicado. Estimacion propia a partir de los pesos declarados: 109 millones de parametros a 2 bits ocupan unos 27 MB, mas escalas y sesgos por bloque de 128 pesos (unos 3-4 MB adicionales) y las capas en coma flotante; el conjunto quedaria en torno a 30-40 MB de pesos.
- Cache KV: con contexto de 2.048 bytes, anchura 512 y 8 cabezas, la cache es de unos pocos MB en fp16 (estimacion propia, no publicada por el autor).
- GPU recomendadas: no disponible. Por tamano, cabe en cualquier GPU de consumo y en GPU integradas; no requiere A100, H100 ni RTX 4090. La demo oficial funciona sobre WebGPU, lo que implica compatibilidad con navegadores que exponen ese backend.
- CPU: viable en CPU por el tamano del modelo, aunque no se publican cifras de latencia.
- Opciones de despliegue: el formato es safetensors con layout afin de 2 bits de MLX, y la via documentada es la carga por URL de un directorio de checkpoint (`latest.json`, `latest/`, `checkpoints/<tokens>k/`) y la demo WebGPU. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni conversiones a GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nirca-mini | ~109 M (8 de 32 expertos activos por token) | 2.048 bytes | Ternarios (-1, 0, +1), QAT desde el paso 14.655 | Byte-level, 265 simbolos | no disponible | safetensors en Hugging Face y demo WebGPU |
| mini-AGI (volotat) | no disponible en la informacion proporcionada | no disponible | no disponible (no ternarios, segun la model card de Nirca) | Byte-level | no disponible en la informacion proporcionada | Repositorio en GitHub |
| Modelos densos de ~100-150 M con tokenizador BPE | ~100-150 M | no verificado en esta busqueda | fp16 / cuantizaciones de 4-8 bits | BPE | habitualmente permisiva | amplia, con soporte en llama.cpp y similares |
| BitNet b1.58 (Microsoft) | ~2.000 M en la variante publicada | no verificado en esta busqueda | Ternarios (-1, 0, +1) | BPE | no verificado en esta busqueda | publicada en Hugging Face |

Nota: los datos de las filas comparativas distintas de nirca-mini y mini-AGI no proceden de la informacion proporcionada en esta busqueda y no se han verificado aqui; se incluyen solo como referencia de categoria.

## Limitaciones y advertencias
- Licencia no declarada: el repositorio no indica licencia, y los datos de entrenamiento incluyen material bajo CC BY-NC-SA 4.0, lo que puede imponer restricciones no comerciales al uso derivado. No hay base clara para un uso comercial.
- Procedencia de datos opaca: parte del entrenamiento proviene de chats privados anonimizados y de dos datasets aun no publicos, lo que dificulta auditar la composicion final del corpus.
- Sin benchmarks: no hay ninguna medida publica de MMLU, HumanEval, GSM8K ni similares, por lo que el rendimiento real es desconocido.
- Modelo muy pequeno: con ~109 millones de parametros y perdida de siguiente byte, es esperable un razonamiento superficial, baja robustez factual y una tasa de alucinacion alta en preguntas abiertas. El autor declara fuera de alcance cualquier uso en el que una respuesta erronea resulte inaceptable (texto truncado en la informacion disponible).
- Contexto limitado: 2.048 bytes equivalen a un texto corto (del orden de unos cientos de palabras en ingles), insuficiente para conversaciones largas o documentos extensos.
- Solo ingles: no hay soporte multilingue declarado, y al ser byte-level el comportamiento fuera del ingles no esta caracterizado.
- Sin tool calling ni agentes: no se documenta integracion con herramientas, funciones ni razonamiento multi-paso con APIs.
- Publicacion continua: el modelo se publica mientras entrena y cada checkpoint nuevo sustituye a `latest/`, por lo que los pesos y el comportamiento pueden cambiar sin versionado estable.
- Trazabilidad incompleta del entrenamiento: el formato de pesos anterior al paso 14.655 no queda registrado en la model card.
- Repositorio de 2,4 GB: incluye todos los checkpoints conservados, no solo el ultimo, lo que complica la descarga selectiva.
- Ecosistema de despliegue limitado: el layout ternario de MLX no tiene soporte documentado en las herramientas habituales de servido (vLLM, TGI, llama.cpp, Ollama).
- La propia model card se genera por programa a partir del registro del checkpoint (paso 68.948), por lo que puede quedar desactualizada respecto a los pesos publicados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nirca/nirca-mini
- Organizacion del autor: https://huggingface.co/nirca
- Demo en navegador (WebGPU): https://tg-techie-agents.github.io/nirca-mini-webgpu/mini/
- Proyecto mini-AGI, del que deriva la arquitectura: https://github.com/volotat/mini-AGI
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- PonderNet (Banino et al., 2021), citado por la cabeza de parada: https://arxiv.org/abs/2107.05407
- PaLM (Chowdhery et al., 2022), origen del test de solapamiento de 8-gramas citado: https://arxiv.org/abs/2204.02311
- Busqueda web: no se encontraron resultados relacionados con este modelo. Los resultados devueltos corresponden a un calculador de resistencia a la insulina (NIRCa) y al catalogo de modelos de NVIDIA NIM, sin relacion con nirca-mini.
