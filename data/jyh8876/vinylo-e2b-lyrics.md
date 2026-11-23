# jyh8876/vinylo-e2b-lyrics

## Resumen

Vinylo E2B Lyrics es un modelo derivado por fine-tuning de google/gemma-4-E2B-it (Google DeepMind), especializado en la traduccion de letras de canciones entre coreano, ingles, japones y chino (12 direcciones), devolviendo JSON estructurado con la traduccion y una transcripcion fonetica de pronunciacion cantada para cada linea. Lo publica el usuario jyh8876 bajo licencia Apache 2.0 y esta pensado para ejecucion en dispositivo (on-device), con variantes GGUF para llama.cpp y LiteRT-LM para Android.

El modelo resuelve un problema muy concreto: traducir letras de canciones manteniendo tono y registro, con contexto de hasta 8 lineas por peticion, y anadir una lectura fonetica (Hangul, Katakana, Pinyin o alfabeto latino) para que el oyente pueda seguir la cancion. No es un modelo conversacional general: esta disenado para un prompt fijo y una tarea acotada.

Tecnicamente parte de una arquitectura Gemma 4 de 2.422.929.699 parametros, se entrena con LoRA r=32 sobre el decodificador de texto y se distribuye en tres ficheros: un Q2_K con entrenamiento consciente de cuantizacion (QAT) de solo 0,98 GB, un Q5_K_M de 3,62 GB y un int4 LiteRT-LM de 2,64 GB. La variante Q2_K reduce el vocabulario de 262k a 52k y aplica autodestilacion en formato ggml Q2_K, lo que permite desplegarlo en moviles y equipos de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), fine-tuning LoRA r=32 fusionado |
| Parametros totales | 2.422.929.699 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de llama-server; no se especifica el maximo oficial) |
| Tipos de cuantizacion | Q2_K QAT (0,98 GB), Q5_K_M con imatrix (3,62 GB), int4 LiteRT-LM (2,64 GB), f16 (9,27 GB, no subido) |
| Idiomas soportados | coreano (ko), ingles (en), japones (ja), chino simplificado (zh) |
| Licencia | Apache 2.0 (licencia Gemma 4) |
| Formato de pesos | GGUF (llama.cpp) y .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Gemma 4 E2B instruction-tuned, sin codificadores de vision ni audio (solo texto). Sobre el decodificador se aplica un fine-tuning LoRA con rango 32 que posteriormente se fusiona en los pesos base. El entrenamiento consta de tres fases documentadas: generacion de datos sinteticos, SFT y cuantizacion con QAT.

Los datos de entrenamiento los genero el modelo profesor google/gemma-4-31B-it: 600 canciones originales (150 por idioma), traducidas a las otras tres lenguas con el mismo prompt de la aplicacion, resultando en aproximadamente 5.000 ejemplos validados. La innovacion tecnica principal es la variante Q2_K QAT: se recorta el vocabulario de 262k a 52k tokens (ko/ja/zh/en con fallback de bytes), se convierten los embeddings a Q4_0 y se entrena el decodificador con autodestilacion consciente de cuantizacion de 2 bits en el formato exacto ggml Q2_K, escribiendo los pesos bit a bit en el GGUF. Esto permite un fichero de menos de 1 GB con calidad superior a la del modelo original cuantizado a Q4_0.

## Capacidades

- Traduccion de letras de canciones en 12 direcciones entre coreano, ingles, japones y chino simplificado.
- Generacion de lectura fonetica de pronunciacion cantada (Hangul, Katakana, Pinyin o alfabeto latino) por linea.
- Salida estructurada en JSON con indices, traduccion, lectura y marca `copy` para lineas ya en el idioma destino.
- Procesamiento por bloques de hasta 8 lineas con contexto entre lineas para pronombres, tiempo verbal y jerga.
- Preservacion de tono y registro de la cancion, con preferencia por fraseo natural frente a orden literal.
- Capacidad de no censurar el significado original.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de agentes.
- No dispone de vision, audio ni modo thinking.

## Casos de uso

- Aplicacion movil de aprendizaje de idiomas con letras de canciones: el fichero Q2_K QAT de 0,98 GB y el int4 LiteRT-LM de 2,64 GB caben en dispositivos Android y permiten traduccion y lectura fonetica offline sin conexion.
- Traduccion de catalogo musical para plataformas de streaming: el modelo procesa bloques de 8 lineas y devuelve JSON validable, lo que facilita la integracion en pipelines de localizacion automatizada de letras entre los cuatro idiomas soportados.
- Generacion de subtitulos karaoke con pronunciacion: la lectura fonetica por linea (`r`) permite construir pistas de romanizacion o transliteracion sincronizadas para oyentes que no leen el alfabeto original.
- Herramienta de traduccion para fansubs y comunidades musicales: el prompt fijo y la salida JSON reducen el postprocesado manual y permiten revisar linea a linea con indices estables.
- Servicio de traduccion de letras en un servidor modesto: con llama-server y el GGUF Q5_K_M de 3,62 GB se puede desplegar en una GPU consumer o incluso en CPU para cargas por lotes.
- Estudio linguistico de correspondencias foneticas entre coreano, japones, chino e ingles: la salida estructurada permite extraer pares original-lectura para analisis de transliteracion.
- Prototipado de asistentes musicales en Android con LiteRT-LM: el formato .litertlm esta pensado para el runtime de Google en dispositivos, lo que simplifica la integracion en apps nativas.

## Benchmarks y rendimiento

Evaluacion sobre 129 bloques de ocho lineas reservados (12 direcciones), decodificacion greedy, llama.cpp. `valid` = porcentaje que pasa el validador JSON/idioma de la aplicacion; `chrF` = concordancia con la traduccion (t) y la lectura (r) del profesor.

| Modelo | Tamano | valid % | chrF t | chrF r |
|---|---:|---:|---:|---:|
| Gemma 4 E2B QAT Q4_0 original (Google) | 3,35 GB | 67,4 | 33,0 | 34,7 |
| Este modelo, f16 (no subido) | 9,27 GB | 99,2 | 48,7 | 78,3 |
| Este modelo, Q5_K_M | 3,62 GB | 98,4 | 48,4 | 79,1 |
| Este modelo, Q2_K QAT | 0,98 GB | 100,0 | 48,4 | 82,0 |

LiteRT-LM int4 (media sobre direcciones): 95,2 valid, 37,9 chrF t, 64,1 chrF r.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB con Q2_K QAT, 4-4,5 GB con Q5_K_M y 3-3,5 GB con int4 LiteRT-LM (incluyendo overhead de contexto de 4096 tokens).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para Q5_K_M; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El Q2_K QAT cabe en GPUs integradas y en moviles.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas actuales con el fichero Q2_K QAT; el Q5_K_M requiere al menos 4 GB de VRAM.
- Opciones de despliegue: llama.cpp (llama-server, con `-ngl 99` para offload completo), LiteRT-LM para Android, y cualquier runtime compatible con GGUF. No se documenta soporte especifico para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Vinylo E2B Lyrics (este) | 2,42 B | 4096 (uso documentado) | ko, en, ja, zh | Apache 2.0 | GGUF, litertlm |
| google/gemma-4-E2B-it (base) | 2,42 B | no disponible | multilingue general | Apache 2.0 (Gemma 4) | safetensors, GGUF |
| google/gemma-4-31B-it (profesor) | 31 B | no disponible | multilingue general | Apache 2.0 (Gemma 4) | safetensors |

La comparacion relevante es con el modelo base: en la misma tarea y con cuantizacion Q4_0, Gemma 4 E2B original obtiene 67,4 % de validez y chrF 33,0/34,7, frente al 100 % y 48,4/82,0 del modelo ajustado en Q2_K QAT con un tercio del tamano. No se dispone de datos de otros modelos especializados en traduccion de letras para comparar directamente.

## Limitaciones y advertencias

- Los nombres propios son debiles, especialmente en el fichero de 2 bits (ejemplos documentados: 渋谷 traducido como "Shinjuku", 浅草の雷門 como "Senso-ji Torii gate"). Para contextos donde los nombres importan se recomienda Q5_K_M.
- Errores ocasionales de homografos o de lectura fonetica (ejemplo: 請う leido incorrectamente, 금강산 traducido como "Mount Songgang" en lugar de "Mount Geumgang").
- Jerga poco frecuente puede quedar sin traducir.
- Disenado para un prompt fijo y bloques de maximo 8 lineas; no es un modelo conversacional ni de proposito general.
- Solo cubre cuatro idiomas (ko, en, ja, zh); no soporta otras lenguas.
- No dispone de vision, audio, tool calling ni capacidades de agente.
- Licencia Apache 2.0 con la licencia Gemma 4 asociada; es un derivado no oficial de Google y no esta afiliado ni respaldado por la compania.
- Se distribuye "tal cual", sin garantia; el autor advierte de que no es una release oficial de Google.
- Riesgo de alucinacion en la traduccion y en la lectura fonetica, especialmente con nombres propios y lineas ambiguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jyh8876/vinylo-e2b-lyrics
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo profesor: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Script de ejemplo: `example.py` (incluido en el repositorio del modelo)
- Ficheros: `vinylo-e2b-lyrics-Q2_K-qat.gguf`, `vinylo-e2b-lyrics-Q5_K_M.gguf`, `vinylo-e2b-lyrics-int4.litertlm`
- Documentos de atribucion: `LICENSE` y `NOTICE` en el repositorio
