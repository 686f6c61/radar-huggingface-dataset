# KarLexAI/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje multimodal desarrollado por Thinking Machines, con arquitectura Mixture of Experts (MoE) de 26.400 millones de parametros totales y 3.400 millones de parametros activos por token. Su rasgo arquitectonico distintivo es el uso de capas "looped": las capas 6 a 17 se ejecutan tres veces en cada pasada, una tecnica que incrementa la profundidad efectiva sin multiplicar el numero de pesos. El modelo acepta entradas de texto e imagen (pipeline image-text-to-text) y esta orientado a razonamiento con modo "thinking" explicito.

La ficha que nos ocupa, KarLexAI/Inkling-2-Mini-GGUF, es una cuantizacion de baja precision del modelo base, publicada por KarLex AI bajo licencia Apache-2.0. Ofrece tres variantes en formato GGUF estandar (IQ1_S, IQ2_XXS y Q2_K) con tamanos de 7,76 GB, 8,49 GB y 9,14 GB respectivamente, lo que permite ejecutar un modelo de 26B parametros en hardware de consumo. El autor reporta una divergencia KL entre un 9 % y un 12 % inferior a las cuantizaciones equivalentes de Unsloth, medidas contra la referencia UD-Q8_K_XL de esta ultima.

La relevancia actual de esta ficha radica en que demuestra que las tecnicas de calibracion por destilacion tras la cuantizacion permiten conservar buena parte de la calidad del modelo original en regimenes de 1-2 bits, con compatibilidad total con llama.cpp de serie (sin forks ni parches) y soporte de vision mediante un proyector multimodal separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas (looped: capas 6-17 ejecutadas 3 veces) |
| Parametros totales | 26.070.390.272 (26,07B) |
| Parametros activos | 3,4B |
| Longitud de contexto | 65.536 tokens (configuracion recomendada en llama-server); el modelo base no especifica contexto maximo en la informacion disponible |
| Tipos de cuantizacion | IQ1_S (1 bit), IQ2_XXS (2 bits), Q2_K (2 bits); mezcla de tipos de tensor por archivo segun asignacion dinamica de Unsloth |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision separado en F16 y BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 26,4B parametros totales y 3,4B activos. La innovacion estructural principal son las capas 6 a 17, que se ejecutan tres veces por pasada (looping), lo que aumenta la profundidad computacional efectiva sin incrementar el numero de pesos almacenados. El modelo incorpora una cabeza de prediccion multi-token (MTP), que no se incluye en esta cuantizacion GGUF. El pipeline es image-text-to-text, con un codificador de vision alojado en archivos mmproj separados (0,64 GB) para no contaminar la cuantizacion del tronco linguistico.

En cuanto al entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden a la model card del modelo base, que no se ha proporcionado. Lo que si se documenta es el proceso de cuantizacion: tras aplicar los tipos de tensor de baja precision, los pesos se calibraron mediante destilacion desde el Inkling-2-Mini original, manteniendo intactos arquitectura, tokenizer y plantilla de chat. El sampler recomendado (temperatura 1,0, sin top-k, top-p ni min-p) viene almacenado en el propio archivo GGUF. Se requiere llama.cpp b12611 o superior, ya que las versiones anteriores gestionan incorrectamente las capas repetidas.

## Capacidades

- Generacion de texto conversacional multi-turno con modo de razonamiento explicito ("thinking").
- Razonamiento matematico y resolucion de problemas de competicion (evaluado en AIME 2025 y 2026).
- Comprension de imagenes: el modelo acepta entradas image-text-to-text mediante el proyector multimodal mmproj (F16 o BF16).
- Razonamiento multi-paso con cadenas de pensamiento largas; las respuestas de AIME consumieron hasta unos 80.000 tokens.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible (los idiomas no estan documentados).

## Casos de uso

- Razonamiento matematico y cientifico en local: el modelo resuelve problemas de nivel AIME con puntuaciones superiores al 92 % en las variantes de 7,76 y 8,49 GB, lo que lo hace util para tutoria automatica o verificacion de soluciones en entornos sin conexion.
- Asistente conversacional con contexto largo: con 65.536 tokens de ventana configurados, puede mantener conversaciones multi-turno extensas o procesar documentos largos completos en una sola pasada.
- Analisis de documentos con imagenes: gracias al proyector multimodal, puede extraer informacion de capturas, diagramas o paginas escaneadas combinadas con instrucciones textuales, por ejemplo en digitalizacion de formularios o revision de figuras tecnicas.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar entre 7,76 y 9,14 GB en pesos, cabe en GPUs de 12-16 GB de VRAM junto con el proyector de vision, permitiendo inferencia privada sin dependencia de la nube.
- Prototipado rapido de agentes de razonamiento: el modo thinking con cadenas largas sirve para experimentar con tecnicas de auto-verificacion y descomposicion de problemas antes de escalar a modelos mayores.
- Educacion y evaluacion automatica: la calibracion por destilacion preserva el comportamiento del modelo original, lo que permite usarlo como evaluador de respuestas matematicas o como generador de problemas con solucion verificable.
- Investigacion en cuantizacion: los archivos sirven como referencia para estudiar el impacto de la precision 1-2 bits en modelos MoE con capas repetidas, con metricas KLD y de acuerdo en el token superior publicadas.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y se midieron con un unico harness sobre llama.cpp estandar. La referencia de divergencia es UD-Q8_K_XL de Unsloth.

| Archivo | Tamano | KLD media vs UD-Q8_K_XL | Mismo token superior | AIME 2025+2026 (%) |
|---|---|---|---|---|
| IQ1_S | 7,76 GB | 0,0499 | 92,1 % | 93,8 |
| IQ2_XXS | 8,49 GB | 0,0391 | 93,0 % | 92,5 |
| Q2_K | 9,14 GB | 0,0305 | 93,8 % | 94,4 (*) |

(*) El resultado de 9,14 GB procede de la ejecucion de 8 muestras que tambien sirvio para elegir el archivo; el autor lo califica de empate con Unsloth. Las cifras de AIME de 7,76 y 8,49 GB usan 4 muestras nuevas por problema (240 respuestas en total).

Comparativa directa frente a Unsloth:

| Tamano | Archivo KLX | Contra | KLD media | Diferencia AIME (puntos) |
|---|---|---|---|---|
| 7,76 GB | IQ1_S | UD-IQ1_S | 0,0499 vs 0,0567 (-11,9 %) | +1,25 ± 1,72 |
| 8,49 GB | IQ2_XXS | UD-IQ2_XXS | 0,0391 vs 0,0444 (-11,8 %) | -1,25 ± 1,51 |
| 9,14 GB | Q2_K | UD-Q2_K_XL | 0,0305 vs 0,0336 (-9,2 %) | +0,00 ± 0,84 |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 7,76 GB (IQ1_S), 8,49 GB (IQ2_XXS) o 9,14 GB (Q2_K) solo para los pesos; anadir aproximadamente 0,64 GB si se usa el proyector de vision y el espacio de cache KV correspondiente al contexto configurado (65.536 tokens recomendados).
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM permite cargar el modelo completo con `-ngl 99`. Una RTX 4090 (24 GB) deja margen amplio para contexto largo y vision. Para despliegue multiusuario se recomienda A100 o H100.
- GPU de consumo: si, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090 y equivalentes. En GPUs de 8 GB no cabe el modelo completo; seria necesario descargar capas a CPU.
- Opciones de despliegue: llama.cpp (llama-server) con version b12611 o superior; el formato GGUF es compatible con Ollama y otros runners basados en llama.cpp. vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles. El autor advierte que el razonamiento largo consume mucho contexto (hasta unos 80.000 tokens en AIME), lo que incrementa la latencia en respuestas complejas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini KLX (esta ficha) | 26,07B | 3,4B | 65.536 config. | GGUF (1-2 bits) | Apache-2.0 | KLD 9-12 % menor que Unsloth al mismo tamano |
| Inkling-2-Mini Unsloth GGUF | 26,4B | 3,4B | no disponible | GGUF dinamico | Apache-2.0 | Referencia de comparacion del autor; AIME 92,50-93,75 % |
| Inkling-2-Mini original | 26,4B | 3,4B | no disponible | safetensors | Apache-2.0 | Modelo base sin cuantizar; incluye cabeza MTP |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 1-2 bits introduce divergencia respecto al modelo original: la KLD media frente a UD-Q8_K_XL oscila entre 0,0305 y 0,0499 segun el archivo, con un 6-8 % de tokens superiores discrepantes.
- La cabeza de prediccion multi-token (MTP) no esta incluida en estos archivos, por lo que no se puede aprovechar la decodificacion especulativa nativa del modelo base.
- Requiere llama.cpp b12611 o superior; versiones anteriores gestionan mal las capas repetidas y producen resultados incorrectos.
- El sampler debe respetarse tal como viene almacenado (temperatura 1,0, sin truncamiento); alterarlo puede degradar la calidad del razonamiento.
- El razonamiento largo puede consumir decenas de miles de tokens de contexto, lo que eleva la latencia y el uso de memoria KV en produccion.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue homogeneo.
- Soporte de tool calling y de agentes no confirmado en la informacion disponible.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben asumirse los habituales en modelos de lenguaje y validarse en el dominio de despliegue.
- Licencia Apache-2.0 permite uso comercial, pero el autor incluye un archivo NOTICE que conviene revisar; el repositorio no esta afiliado a Thinking Machines ni a Unsloth.
- El modelo tiene 0 descargas y 3 likes en el momento de la consulta; es una publicacion reciente (26 de noviembre de 2026) sin validacion independiente de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KarLexAI/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones de referencia de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Benchmarks detallados y hashes: https://huggingface.co/KarLexAI/Inkling-2-Mini-GGUF/blob/main/BENCHMARKS.md
- Aviso legal (NOTICE): https://huggingface.co/KarLexAI/Inkling-2-Mini-GGUF/blob/main/NOTICE
- Sitio del autor: https://karlex.ai
