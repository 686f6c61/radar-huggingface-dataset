# joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK-GGUF es una cuantizacion en formato GGUF del modelo de reconocimiento automatico del habla (ASR) Qwen3-ASR-1.7B, ajustado especificamente para cantonés coloquial de Hong Kong (yue-HK) con mezcla de codigo ingles (code-switching). Lo publica el desarrollador independiente joe2643 bajo el paraguas del proyecto Koelony, y deriva del modelo base koelony/Qwen3-ASR-1.7B-Cantonese-HK, a su vez un fine-tune del Qwen3-ASR-1.7B original de Alibaba. El problema que resuelve es concreto: el modelo stock de Qwen tiende a producir caracteres en chino simplificado o variantes del cantonés de China continental (por ejemplo 噶 o 捻), mientras que esta version emite de forma nativa chino tradicional de Hong Kong con vocabulario coloquial autentico (係, 喺, 嘅, 咗, 㗎) y preserva las palabras en ingles sin traducirlas.

El modelo tiene 1.720.574.976 parametros (aproximadamente 1,7 mil millones) y una licencia Apache 2.0. Se distribuye en cuantizaciones Q4_K_M, Q6_K, Q6_K_H y Q8_0, mas un encoder de audio multimodal (mmproj) en Q8_0, pensadas para ejecutarse con llama.cpp (llama-server) y con la aplicacion de dictado OraType. La version actual es la v2.1 (14 de noviembre de 2026, con la variante protegida Q6_K_H anadida el 21 de noviembre de 2026), que incorpora sesgo de vocabulario contextual (hotword biasing) y mejora cinco de los seis conjuntos de prueba estandar de cantonés.

Es relevante ahora porque demuestra que un modelo de 1,7B cuantizado a 4-6 bits puede superar ampliamente a whisper-large-v3 en errores de caracter sobre cantonés de Hong Kong (por ejemplo, 3,89 % frente a 20,97 % en FLEURS yue_hant_hk), con un coste de memoria que permite desplegarlo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal para ASR (encoder de audio + decoder tipo Qwen3), base Qwen3-ASR-1.7B |
| Parametros totales | 1.720.574.976 (~1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuracion de ejemplo de llama-server (`-c 4096`) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q6_K_H (protegida), Q8_0; mmproj en Q8_0 |
| Idiomas soportados | yue (cantonés, yue-HK), zh (chino), en (ingles); mezcla de codigo cantonés-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales BF16 en Transformers en el repo base |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3-ASR-1.7B: un encoder de audio acoplado a un decoder de lenguaje de la familia Qwen3, con el encoder exportado de forma separada como `mmproj` en GGUF. Sobre esa base, el fine-tune de Koelony se orienta a cantonés coloquial de Hong Kong y a code-switching con ingles, corrigiendo la tendencia del modelo original a generar chino simplificado o caracteres del cantonés continental. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset en la informacion proporcionada.

La innovacion tecnica destacable de la version v2.1 es la alineacion para sesgo de vocabulario contextual (context / domain-vocabulary biasing), que permite pasar glosarios o terminos concretos mediante el campo `prompt` del endpoint `/v1/audio/transcriptions` de llama-server. Segun la model card, esto reduce el CER en comandos cortos con glosarios largos del 21,88 % al 7,19 % con un 0,0 % de "parroting" (repeticion espuria del glosario). Ademas, la variante protegida Q6_K_H mantiene `token_embd` y `attn_v` en Q8_0 y la salida en F16, lo que elimina la mayoria de los bucles de repeticion inducidos por la cuantizacion agresiva del Q6_K estandar. Tambien se han publicado scripts de evaluacion y de cliente en el repositorio de GitHub del proyecto.

## Capacidades

- Reconocimiento automatico del habla para cantonés de Hong Kong coloquial (yue-HK) con salida en chino tradicional de Hong Kong.
- Transcripcion con code-switching cantonés-ingles, manteniendo las palabras inglesas en ingles.
- Sesgo de vocabulario contextual (hotword / domain-vocabulary biasing) mediante prompt, con control de falsos positivos por distractores.
- Soporte de endpoint compatible con la API `/v1/audio/transcriptions` a traves de llama-server.
- Capacidad multilingue limitada a yue, zh y en.
- Integracion con la aplicacion OraType (dictado) mediante GGUF y mmproj.
- No se documentan capacidades de tool calling, agentes, vision general ni audio generativo; el modelo es especifico de ASR.

## Casos de uso

- Dictado por voz en cantonés de Hong Kong: el modelo transcribe voz a texto en chino tradicional con vocabulario coloquial, adecuado para integrarse en aplicaciones de escritura o de notas en dispositivos de consumo con la cuantizacion Q4_K_M.
- Subtitulado de contenido audiovisual hongkones: transcripcion de videos, podcasts o reuniones con mezcla de cantonés e ingles, donde el modelo mantiene los terminos ingleses sin traducirlos y reduce el CER en comparacion con whisper-large-v3.
- Atencion al cliente en centros de llamadas de Hong Kong: transcripcion de conversaciones telefonicas multi-turno con contexto de hasta 4096 tokens, usando el sesgo de vocabulario para nombres de productos, entidades y jerga interna.
- Transcripcion de actas legislativas y administrativas: el modelo se ha evaluado sobre el corpus LegCo (Consejo Legislativo de Hong Kong), por lo que puede emplearse en la transcripcion de sesiones y documentos oficiales en chino tradicional.
- Reconocimiento de comandos cortos con glosario: gracias al biasing contextual (CER del 7,19 % en comandos cortos con glosarios largos), es adecuado para asistentes de voz con vocabulario de dominio cerrado, como control de dispositivos o formularios por voz.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (1,1 GB) y Q6_K_H (1,5 GB) permiten ejecutar el modelo en portatiles y equipos sin GPU dedicada mediante llama.cpp, util para herramientas de dictado offline y con privacidad de datos.
- Evaluacion y ajuste de sistemas ASR para cantonés: el repositorio incluye scripts de evaluacion y conjuntos de prueba (FLEURS, Common Voice, MDCC, LegCo, MCE), lo que facilita la comparacion y la validacion de pipelines propios.

## Benchmarks y rendimiento

Resultados de la model card (Character Error Rate, greedy, BF16 en Transformers; menor es mejor):

| Test set | Qwen3-ASR-1.7B stock | v1 | v2 | v2.1 (esta version) | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (yue_hant_hk) | 4,20 % | 4,00 % | 3,95 % | **3,89 %** | 20,97 % |
| Common Voice yue | 5,46 % | **3,80 %** | 3,86 % | 3,94 % | 36,44 % |
| Common Voice 23 zh-HK | 7,65 % | 5,18 % | 5,09 % | **5,02 %** | 41,76 % |
| MDCC | 4,25 % | 2,53 % | 2,49 % | **2,47 %** | 34,52 % |
| LegCo | 7,22 % | 7,17 % | **7,16 %** | **7,16 %** | 32,15 % |
| MCE (code-switching) | 11,74 % | 5,61 % | 5,62 % | **5,52 %** | 24,00 % |

Comparativa de cuantizaciones GGUF (llama-server con Vulkan):

| Modelo / cuantizacion | T1 Pooled (1.292) L1_PURE_NEUTRAL | Delta vs v2.1 Q6_K | Delta vs v2.1 BF16 | gold_core_400 | T3 (200) oratype_v2 | t3_real (118) oratype_v2 |
|---|---:|---:|---:|---:|---:|---:|
| v2.1 PyTorch BF16 (ref.) | 12,33 % | -0,65 pt | ref. | 11,64 % | 1,00 % | 5,08 % |
| v2.1 GGUF Q6_K (legacy) | 12,98 % | ref. | +0,65 pt | 12,69 % | **0,00 %** | 4,24 % |
| v2.1 GGUF Q6_K_H (recomendada) | **12,52 %** | **-0,46 pt** | +0,19 pt | **11,64 %** | 0,50 % | 4,24 % |

Sesgo de entidades (entity_probe_v1, 220 enunciados, 271 menciones, 20 distractores por enunciado): la v2.1 GGUF alcanza un 50,00 % de tasa de correccion (recall del 89,67 % al 94,83 %), con 0,00 % de tasa de ruptura y 0,00 % (0/4.400) de falsa copia de distractores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q4_K_M, 1,4 GB con Q6_K, 1,5 GB con Q6_K_H y 1,8 GB con Q8_0, mas unos 0,35 GB del encoder mmproj Q8_0.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se ha validado con llama-server sobre Vulkan. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas (por ejemplo, gamas RTX xx60 o superiores); tambien puede ejecutarse en CPU con llama.cpp, dado el reducido tamano de las cuantizaciones.
- Opciones de despliegue: llama.cpp (`llama-server`) con `--mmproj`; aplicacion OraType; el repo base ofrece pesos BF16 para Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER en FLEURS yue_hant_hk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK-GGUF (v2.1) | ~1,7B | 4096 tokens (config. llama-server) | 3,89 % | Apache 2.0 | GGUF en Hugging Face; BF16 en repo base |
| Qwen3-ASR-1.7B (stock) | ~1,7B | no disponible | 4,20 % | no disponible en la informacion | Hugging Face (Qwen) |
| whisper-large-v3 | no disponible en la informacion | no disponible | 20,97 % | no disponible en la informacion | Hugging Face / OpenAI |

## Limitaciones y advertencias

- El modelo esta especializado en cantonés de Hong Kong (yue-HK) con ingles; su cobertura de otros idiomas o variantes del chino es limitada y no se ha evaluado en la informacion disponible.
- El sesgo de vocabulario contextual puede inducir falsos positivos si el glosario contiene terminos muy similares a lo pronunciado; la model card reporta 0,00 % de falsa copia de distractores en su prueba, pero conviene validarlo en dominios propios.
- La cuantizacion Q6_K estandar puede provocar bucles de repeticion en voz real (12,98 % de MER en T1 frente a 12,33 % en BF16); se recomienda usar Q6_K_H o Q8_0 en produccion.
- Riesgo de alucinacion y de errores en audio con ruido, acentos no hongkoneses o solapamiento de hablantes; no se documentan tasas especificas.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion correspondiente; verificar las condiciones del modelo base y del modelo original Qwen3-ASR.
- El modelo es unicamente de reconocimiento del habla; no soporta generacion de texto general, tool calling ni agentes.
- La fecha de creacion del repositorio (2026) y el ecosistema OraType son recientes; conviene fijar una revision concreta (por ejemplo, la etiqueta de la v2.1) para reproducibilidad en produccion.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Modelo base BF16: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK
- Repositorio GitHub del proyecto: https://github.com/koelony/qwen3-asr-cantonese-hk
- Demo en vivo: https://demo.koelony.com
- Pagina del proyecto: https://koelony.com/asr/
- Revision v2: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF/tree/b1c3dc91
- Revision v1: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF/tree/1afe540def044173f7412dc72584f803b92bfa96
- Perfil del autor: https://huggingface.co/joe2643
