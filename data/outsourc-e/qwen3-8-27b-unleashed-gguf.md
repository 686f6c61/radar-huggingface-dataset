# outsourc-e/Qwen3.8-27B-Unleashed-GGUF

## Resumen

Qwen3.8-27B-Unleashed-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.8-27B-Uncensored, una versión "abliterated" (sin censura) del Qwen3.8-27B de Alibaba. El autor, outsourc-e, aplica una cuantización dinámica por tensor (Unsloth Dynamic 3.0) con matriz de importancia (imatrix), de modo que cada capa recibe un nivel de precisión distinto según su sensibilidad. El resultado es un Q3 que supera en perplexity a un Q4 uniforme 2,2 GB más grande, manteniendo recuperación completa de contexto a 250.000 tokens.

El modelo base, Qwen3.8-27B, es un transformer denso de 27.300 millones de parámetros con arquitectura híbrida DeltaNet: solo 17 de sus 65 capas usan atención completa, el resto emplea una variante de SSM lineal. Esto reduce drásticamente el tamaño de la caché KV, permitiendo ejecutar el modelo con contexto de 262.144 tokens en una GPU de 24 GB. La versión GGUF aquí descrita es solo texto (no incluye el componente multimodal del original) y está pensada para inferencia local eficiente con llama.cpp.

La relevancia de este repo radica en que ofrece nueve niveles de cuantización, desde 6,8 GB hasta 22,1 GB, con una calidad medida rigurosamente en un mismo harness. Es una opción práctica para desarrolladores que necesitan un modelo sin restricciones de contenido, con contexto largo y buen rendimiento en hardware consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido DeltaNet (Qwen3.8), 65 capas, 17 de atencion completa |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (recuperacion verificada a 250.806) |
| Tipos de cuantizacion | IQ1_M, IQ2_S, Q2_K_XL, IQ3_XXS, Q3_K_XL, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K (GGUF) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-27B, desarrollado por Alibaba, es un transformer denso con arquitectura hibrida DeltaNet: de las 65 capas, solo 17 utilizan atencion completa; el resto emplea DeltaNet, una variante de SSM lineal que reduce el coste de la caché KV de O(n) a O(1) por capa. Esto explica que la caché KV para 262.144 tokens ocupe solo unos 5 GB en cuantizacion q4_0. El modelo base fue entrenado por Alibaba con datos multilingues (principalmente ingles y chino) e incluye capacidades de tool calling y agentes.

La version "Uncensored" de JonathanColetti aplica una tecnica de abliteration: elimina las direcciones del espacio de activaciones responsables de los rechazos de contenido, de modo que el modelo no se niega a responder. Sobre esos pesos, outsourc-e aplica la receta de cuantizacion dinamica de Unsloth (Dynamic 3.0), que asigna tipos de cuantizacion por tensor segun su sensibilidad, usando la matriz de importancia (imatrix) del repo de Unsloth. El autor declara explicitamente que la receta es trabajo de Unsloth y que el extrajo el mapa de tipos de tensor de sus archivos publicados.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del Qwen3.8-27B original.
- Tool calling y function calling: el modelo base soporta invocacion de herramientas y flujos agénticos.
- Multilingue: ingles y chino.
- Contexto largo: 262.144 tokens, con recuperacion exacta de aguja verificada a 250.806 tokens.
- Sin censura: al estar abliterated, no rechaza peticiones de contenido sensible o controvertido.
- Decodificacion especulativa: compatible con DFlash2 en llama.cpp, lo que mejora el throughput.
- No incluye vision: esta version GGUF es solo texto, aunque el modelo base original es multimodal.

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto, puede mantener conversaciones multi-turno muy largas y recordar detalles de interacciones previas sin perder el hilo. Su naturaleza sin censura permite tratar temas delicados sin respuestas evasivas.
- Generacion de codigo en produccion: soporta tool calling, por lo que puede integrarse en pipelines de CI/CD para generar, revisar y parchear codigo. El nivel Q3_K_XL (13,2 GB) cabe en una RTX 4090 y ofrece 112,8 tokens/s, suficiente para uso interactivo.
- Analisis de documentos extensos: la recuperacion verificada a 250.000 tokens permite procesar libros completos, expedientes legales o historiales clinicos en una sola pasada, extrayendo informacion especifica sin truncar.
- Agentes autonomos multi-step: combinado con tool calling y contexto largo, puede ejecutar tareas complejas como investigacion web, planificacion y ejecucion de subtareas, manteniendo el estado global en memoria.
- Creacion de contenido creativo sin restricciones: escritura de ficcion, guiones o material de marketing con tematicas adultas o controvertidas, donde los modelos censurados suelen bloquearse.
- Investigacion en alineacion y seguridad: al ser una version abliterated, es util para estudiar el comportamiento de modelos sin mecanismos de rechazo, comparar respuestas con el original y analizar riesgos de sesgo o alucinacion.
- Despliegue en hardware modesto: el nivel Q2_K_XL (9,9 GB) cabe en una GPU de 12 GB, permitiendo ejecutar un modelo de 27B en equipos de gama media con contexto reducido.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor, medidos en una unica maquina (RTX 4090 24 GB, llama.cpp con DFlash2, caché KV q4_0, contexto 262.144, perplexity en wikitext-2 con 60 chunks). No son comparables con valores de otros entornos; solo son validas las comparaciones internas de la tabla.

| Cuantizacion | Tamano | PPL (menor es mejor) | Tok/s (mediana) | Recuperacion de aguja | Sin censura |
|---|---|---|---|---|---|
| Unleashed UD-IQ4_XS | 14,3 GB | 6,3502 | pendiente | pendiente | Si |
| Unleashed UD-Q3_K_XL | 13,2 GB | 6,4036 | 112,8 | 250.806 tokens | Si |
| Unleashed UD-IQ3_XXS | 11,0 GB | 6,4818 | pendiente | pendiente | Si |
| unsloth UD-Q3_K_XL (ref) | 12,24 GB | 6,3993 | 110,7 | 250.806 tokens | No |
| uncensored IQ4_XS (ref) | 15,1 GB | 6,4149 | 107,3 | 32k | Si |
| unsloth UD-Q4_K_XL (ref) | 16,7 GB | 6,4181 | 62,6 | 4k | No |
| uniforme Q3_K_M + imatrix (ref) | 12,57 GB | 6,5316 | 84,8 | 258.900 tokens | Si |
| unsloth UD-Q2_K_XL (ref) | 9,15 GB | 6,6469 | no disponible | no disponible | No |

Recuperacion a profundidad (Q3_K_XL, contexto 250.806 tokens):

| Profundidad | Tokens de prompt | Resultado | Tok/s de generacion |
|---|---|---|---|
| 32k | 31.265 | encontrado | 50,4 |
| 120k | 119.779 | encontrado | 60,6 |
| 250k | 250.806 | encontrado | 40,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: desde 8 GB (IQ1_M, con degradacion notable) hasta 24 GB (Q6_K). El nivel recomendado Q3_K_XL ocupa 13,2 GB de pesos; con caché KV q4_0 para 262.144 tokens (~5 GB) y un modelo draft de ~2 GB, cabe en una RTX 4090 de 24 GB.
- GPU recomendadas: RTX 4090 24 GB para contexto completo con Q3_K_XL; RTX 4080 o similar de 16 GB para Q3_K_XL con contexto reducido; GPUs de 12 GB para Q2_K_XL.
- Consumer GPU: si, a partir de 12 GB de VRAM se puede ejecutar algun nivel con contexto limitado.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF. vLLM no es tipico para GGUF, aunque el modelo base safetensors puede usarse con vLLM.
- Latencia y throughput: 112,8 tokens/s de mediana en Q3_K_XL con DFlash2 y contexto 262.144; 40-60 tokens/s en generacion con contexto muy largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | PPL (wikitext-2) | Licencia | Sin censura |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Unleashed (UD-Q3_K_XL) | 27,3 B | 262.144 | GGUF dinamico | 6,4036 | Apache 2.0 | Si |
| Qwen3.8-27B-Uncensored (bf16) | 27,3 B | 262.144 | safetensors | no disponible | Apache 2.0 | Si |
| Qwen3.8-27B (original, bf16) | 27,3 B | 262.144 | safetensors | no disponible | Apache 2.0 | No |
| unsloth Qwen3.8-27B-GGUF (UD-Q3_K_XL) | 27,3 B | 262.144 | GGUF dinamico | 6,3993 | Apache 2.0 | No |

La diferencia principal entre el Unleashed y el de Unsloth es que el primero usa pesos abliterated, lo que anade unos 0,96 GB al tamano del archivo (13,2 GB frente a 12,24 GB) y elimina los rechazos de contenido. La calidad medida es practicamente identica (diferencia de 0,0043 en PPL, dentro del error). Frente a una cuantizacion uniforme Q3_K_M con imatrix, el dinamico gana 0,13 puntos de PPL y un 33% de throughput.

## Limitaciones y advertencias

- Los archivos IQ1_M e IQ2_S fueron retirados temporalmente (2026-08-21) por una cabecera corrupta que impedia su carga. Si se descargaron, deben eliminarse; la version corregida esta pendiente de publicacion.
- Modelo sin censura: al estar abliterated, puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es adecuado para aplicaciones donde se requiera moderacion automatica.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, especialmente con contexto muy largo. La recuperacion de aguja verificada no garantiza fidelidad factual en tareas complejas.
- Idiomas limitados: solo ingles y chino. El rendimiento en otros idiomas no esta documentado.
- La cuantizacion Q2 (IQ1_M, IQ2_S, Q2_K_XL) conlleva una perdida de calidad medible (~3,8% en PPL para Q2). Se recomienda Q3 como minimo para uso serio.
- Esta version GGUF no incluye capacidades de vision, aunque el modelo base original es multimodal.
- La receta de cuantizacion es de Unsloth, no del autor del repo. Si se requiere soporte tecnico sobre la metodologia, debe dirigirse al proyecto upstream.
- No se han publicado evaluaciones de sesgos, robustez o seguridad. El uso en produccion debe ir acompanado de pruebas especificas del dominio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/outsourc-e/Qwen3.8-27B-Unleashed-GGUF
- Modelo base (JonathanColetti/Qwen3.8-27B-Uncensored): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Repositorio de cuantizacion de referencia (unsloth/Qwen3.8-27B-GGUF): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentacion de Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion de Cloudflare Workers AI sobre Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Repositorio de la version uncensored con instrucciones de uso: https://github.com/Wassimyounes01/qwen38-uncensored
