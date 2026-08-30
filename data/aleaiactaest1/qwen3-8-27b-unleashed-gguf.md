# AleaiactaEst1/Qwen3.8-27B-Unleashed-GGUF

## Resumen

Qwen3.8-27B-Unleashed-GGUF es una cuantizacion GGUF del modelo Qwen3.8-27B-Uncensored, una version "abliterada" (sin mecanismos de rechazo) del modelo denso Qwen3.8-27B de Alibaba. El autor, AleaiactaEst1, aplica una estrategia de cuantizacion dinamica por tensor (receta Unsloth Dynamic 3.0) que asigna distinta precision a cada tensor segun su sensibilidad, logrando que un Q3 supere en calidad a cuantizaciones Q4 uniformes de mayor tamano.

El modelo base Qwen3.8-27B, publicado por Alibaba en agosto de 2026 bajo licencia Apache 2.0, es la version open-weight de la familia Qwen3.8, con 26,9 mil millones de parametros, arquitectura hibrida de atencion (48 capas Gated DeltaNet lineales y 16 de atencion completa) y una ventana de contexto de 262.144 tokens. Esta cuantizacion GGUF mantiene la recuperacion completa de contexto largo (verificada hasta 250.806 tokens) y ofrece nueve niveles de cuantizacion que van desde 9,15 GB hasta 16,7 GB.

La relevancia de este modelo reside en combinar tres factores: pesos sin censura, calidad de cuantizacion superior a la media del ecosistema GGUF y compatibilidad total con el stack de llama.cpp, lo que lo hace util para despliegues locales en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 48 capas Gated DeltaNet (atencion lineal) + 16 capas de atencion completa, 64 capas en total, hidden size 5.120, vocabulario de 248.320 tokens, cabeza MTP (multi-token prediction) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (recuperacion verificada hasta 250.806 tokens) |
| Tipos de cuantizacion | 9 niveles: UD-IQ1_M, UD-IQ2_S, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS y superiores (tamano de archivo entre 9,15 GB y 16,7 GB) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba, emplea una arquitectura hibrida de atencion que combina 48 capas de Gated DeltaNet (atencion lineal recurrente) con 16 capas de atencion completa tradicional. Esta combinacion reduce el coste computacional de la atencion en contextos largos manteniendo la calidad en tareas que requieren recuperacion precisa de informacion. El modelo se construye sobre los fundamentos arquitectonicos de Qwen3.5 e incorpora una cabeza de prediccion multi-token (MTP) que acelera la decodificacion especulativa.

La version Uncensored de JonathanColetti se obtiene mediante abliteracion, una tecnica que elimina los vectores de direccion responsables del comportamiento de rechazo, permitiendo que el modelo responda sin restricciones de seguridad. Sobre estos pesos, AleaiactaEst1 aplica la receta Unsloth Dynamic 3.0: un mapa de tipos de tensor por tensor extraido de los archivos publicados de unsloth/Qwen3.8-27B-GGUF, que asigna mayor precision a tensores sensibles y comprime agresivamente los tolerantes. La cuantizacion se realiza con la matriz de importancia (imatrix) del repositorio original.

Un detalle tecnico relevante: los niveles bajos (IQ1_M e IQ2_S) se construyen con una topologia diferente (64 bloques, sin cabeza MTP, 498 tensores) frente a los niveles Q3_K_XL y superiores (65 bloques, con cabeza MTP, 506 tensores). Esto obliga a reescribir los metadatos del archivo GGUF al cuantizar manualmente, un paso que el autor documenta explicitamente.

## Capacidades

- Generacion de texto sin restricciones de contenido: al ser una version abliterada, no aplica filtros de rechazo sobre temas sensibles, politicos, religiosos o de violencia.
- Razonamiento y codificacion: hereda las capacidades del modelo base Qwen3.8-27B, que destaca en tareas de programacion, flujos de trabajo agente y automatizacion de oficina.
- Contexto largo efectivo: recuperacion de informacion verificada hasta 250.806 tokens en la cuantizacion UD-Q3_K_XL, superando ampliamente a cuantizaciones uniformes de referencia que solo alcanzan 4.000-32.000 tokens.
- Decodificacion especulativa: compatible con el esquema DFlash2 de llama.cpp, que acelera la generacion mediante la cabeza MTP.
- Multilingue limitado: soporte declarado para ingles y chino, sin cobertura documentada de otros idiomas.
- Tool calling: el modelo base soporta invocacion de herramientas y el autor mide rendimiento especifico para llamadas cortas a herramientas (1-50 tokens de salida).
- Capacidades multimodales: el modelo base Qwen3.8-27B es nativamente multimodal (incluye un codificador de vision de ~1B de parametros), pero esta cuantizacion GGUF se publica con pipeline de text-generation y no documenta soporte de vision.

## Casos de uso

- Generacion de contenido creativo sin filtros: escritores y creadores pueden generar narrativa, dialogos o guiones sobre temas que los modelos censurados rechazarian, manteniendo la coherencia gracias a la ventana de 262K tokens para novelas o series largas.
- Agentes de codigo con tool calling: el modelo puede integrarse en pipelines de CI/CD para generar, revisar y parchear codigo. Su rendimiento en llamadas cortas a herramientas (~25 tok/s) es suficiente para flujos de agente que alternan entre decisiones y ejecucion.
- Procesamiento de documentos legales o tecnicos extensos: con recuperacion verificada a 250K tokens, puede analizar contratos, expedientes o manuales completos en una sola pasada, extrayendo clausulas o resumiendo secciones especificas.
- Asistente de investigacion en chino e ingles: util para equipos bilingues que necesitan analizar literatura cientifica o informes corporativos en ambos idiomas, con capacidad de razonamiento multi-paso sobre documentos largos.
- Chat conversacional desplegado en local: empresas que requieren un asistente interno sin censura para simulaciones de role-play, formacion de personal o generacion de respuestas en dominios especializados donde los filtros genericos interfieren.
- Experimentacion en cuantizacion y optimizacion: el repositorio documenta el proceso completo de cuantizacion dinamica con imatrix, incluyendo los fallos de topologia y su solucion, lo que lo convierte en material de referencia para ingenieros que cuantizan sus propios modelos.

## Benchmarks y rendimiento

Las mediciones del autor se realizaron en una unica maquina (RTX 4090 24 GB, llama.cpp con decodificacion especulativa DFlash2, cache KV q4_0, contexto 262.144, perplejidad wikitext-2 a 60 chunks). Los valores de perplejidad solo son comparables dentro de esta tabla, no contra otras configuraciones.

| Cuantizacion | Tamano | Perplejidad (PPL) ↓ | Velocidad mediana (tok/s) | Recuperacion needle | Sin censura |
|---|---|---|---|---|---|
| Unleashed UD-IQ4_XS | 14,3 GB | 6,3502 | no disponible | pendiente | Si |
| Unleashed UD-Q3_K_XL | 13,2 GB | 6,4036 | 112,8 | 250.806 tokens | Si |
| Unleashed UD-IQ3_XXS | 11,0 GB | 6,4818 | no disponible | pendiente | Si |
| unsloth UD-Q3_K_XL (ref) | 12,24 GB | 6,3993 | 110,7 | 250.806 tokens | No |
| uncensored IQ4_XS (ref) | 15,1 GB | 6,4149 | 107,3 | 32.000 tokens | Si |
| unsloth UD-Q4_K_XL (ref) | 16,7 GB | 6,4181 | 62,6 | 4.000 tokens | No |
| uniforme Q3_K_M + imatrix (ref) | 12,57 GB | 6,5316 | 84,8 | 258.900 tokens | Si |
| unsloth UD-Q2_K_XL (ref) | 9,15 GB | 6,6469 | no disponible | no disponible | No |

Velocidad medida en trafico real (n=1.696 peticiones, RTX 4090, Q3_K_XL, borrador dflash2):

| Tokens generados | n | Velocidad mediana (tok/s) |
|---|---|---|
| 1-50 (tool calls, acks cortos) | 1.289 | 24,9 |
| 51-200 | 97 | 32,6 |
| 201-600 | 191 | 43,6 |
| 601-1.500 | 61 | 46,9 |
| 1.500+ (prosa larga, codigo) | 58 | 56,3 |

Pico observado en una sola peticion: ~195 tok/s. El autor advierte explicitamente que no se debe planificar en torno al pico.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion especifica en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion UD-Q3_K_XL ocupa 13,2 GB de archivo y cabe en una GPU de 24 GB con cache KV q4_0 y contexto completo de 262K tokens. Los niveles inferiores (UD-IQ3_XXS a 11,0 GB, UD-IQ2_S y UD-IQ1_M por debajo) caben en GPUs de 16 GB.
- GPU recomendadas: RTX 4090 24 GB (usada en todas las mediciones del autor), RTX 3090 24 GB, RTX 4080 16 GB para los niveles mas bajos, A100 40 GB para despliegues con contexto maximo y mayor concurrencia.
- Compatibilidad con GPU de consumo: si, la RTX 4090 es la plataforma de referencia. Los niveles UD-IQ3_XXS y menores pueden ejecutarse en GPUs de 12-16 GB como RTX 4070 Ti o RTX 3080 Ti.
- Opciones de despliegue: llama.cpp (harness de referencia del autor), interfaces compatibles con GGUF como Ollama, LM Studio o text-generation-webui. vLLM y TGI no estan documentados para este repositorio concreto.
- Latencia y throughput: la velocidad depende fuertemente de la longitud de generacion. Para peticiones cortas (tool calls) se observan ~25 tok/s; para generaciones largas (>1.500 tokens), ~56 tok/s de mediana. El overhead fijo por peticion (prefill, inicializacion de sampler, calentamiento del borrador) domina en peticiones cortas.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Cuantizacion | Perplejidad (misma config) | Licencia | Sin censura |
|---|---|---|---|---|---|---|
| AleaiactaEst1/Qwen3.8-27B-Unleashed (UD-Q3_K_XL) | 13,2 GB | 262.144 | Dinamica por tensor | 6,4036 | Apache 2.0 | Si |
| unsloth/Qwen3.8-27B-GGUF (UD-Q3_K_XL) | 12,24 GB | 262.144 | Dinamica por tensor | 6,3993 | Apache 2.0 | No |
| JonathanColetti/Qwen3.8-27B-Uncensored (IQ4_XS uniforme) | 15,1 GB | 262.144 | Uniforme | 6,4149 | Apache 2.0 | Si |
| Qwen/Qwen3.8-27B (original, bf16) | ~54 GB | 262.144 | Sin cuantizar | no disponible | Apache 2.0 | No |

La comparativa muestra que la cuantizacion dinamica de este repositorio iguala en calidad a la de Unsloth (diferencia de 0,0043 PPL, dentro del margen de error) con la ventaja de pesos sin censura, a costa de ~1 GB adicionales. Frente a una cuantizacion uniforme IQ4_XS del mismo modelo uncensored, el UD-Q3_K_XL es 1,9 GB mas pequeno, tiene mejor perplejidad (6,4036 frente a 6,4149) y recupera contexto largo (250K frente a 32K tokens).

## Limitaciones y advertencias

- Contenido sin censura: al ser un modelo abliterado, puede generar contenido ofensivo, ilegal o danino sin restricciones. No es adecuado para aplicaciones orientadas al publico general sin capas de moderacion externas.
- Idiomas limitados: solo ingles y chino estan declarados. El rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Velocidad en peticiones cortas: los agentes que emiten principalmente tool calls cortos experimentaran ~25 tok/s, no los 112 tok/s de la generacion larga. Esto es un coste fijo del modelo de 27B, no un defecto de la cuantizacion.
- Q2 es el limite inferior: la cuantizacion UD-IQ1_M y UD-IQ2_S, aunque reconstruidas y verificadas, degradan la calidad ~3,8% respecto al modelo completo. El autor recomienda Q3 como punto minimo de calidad aceptable.
- Comparaciones de perplejidad: los valores PPL publicados solo son comparables dentro de la misma configuracion de medicion. No deben contrastarse con numeros de otros repositorios o harness.
- Topologia variable entre niveles: los archivos IQ1_M e IQ2_S usan 64 bloques sin cabeza MTP, mientras que los niveles superiores usan 65 bloques con MTP. Si se descargan ambos, no son intercambiables a nivel de arquitectura.
- Capacidades multimodales no verificadas: aunque el modelo base Qwen3.8-27B es multimodal, esta cuantizacion se publica como text-generation y no documenta soporte de vision en formato GGUF.
- Repositorio reciente: creado el 30 de agosto de 2026, con cero descargas y cero likes en el momento de la consulta. Las mediciones del autor son auto-reportadas y no han sido validadas por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AleaiactaEst1/Qwen3.8-27B-Unleashed-GGUF
- Modelo base uncensored: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de referencia de cuantizacion: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentacion de la receta Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Ficha en LLM Releases: https://www.llm-releases.com/models/qwen3-8-27b
