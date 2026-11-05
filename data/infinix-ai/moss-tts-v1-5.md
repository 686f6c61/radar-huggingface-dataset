# Infinix-ai/MOSS-TTS-v1.5

## Resumen
MOSS-TTS-v1.5 es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Infinix-ai, continuación directa de MOSS-TTS 1.0 del proyecto OpenMOSS. Se distribuye en HuggingFace con licencia Apache 2.0 y un total de 8.489.841.664 parámetros en formato safetensors, lo que lo sitúa en la categoría de modelos TTS de gran tamano orientados a produccion. Su arquitectura, etiquetada como `moss_tts_delay`, emplea codigo personalizado (`custom_code`) sobre el ecosistema Transformers.

El modelo resuelve el problema de la sintesis multilingue de alta calidad con clonacion de voz zero-shot, generacion de discurso largo, control de duracion a nivel de token y control de pronunciacion mediante Pinyin e IPA. La version 1.5 amplia la cobertura a 31 idiomas, incorpora etiquetas de idioma explicitas que mejoran la calidad en casi todos los idiomas soportados y estabiliza la clonacion de voz, reduciendo la varianza entre generaciones repetidas.

La relevancia actual del modelo reside en su combinacion de cobertura linguistica amplia (incluyendo espanol, catalan no listado pero si cantonés, tailandes, vietnamita y swahili), licencia permisiva Apache 2.0 y soporte de marcadores de pausa explicitos como `[pause 3.2s]`, caracteristicas poco frecuentes en modelos TTS de este tamano. Esta pensado para integraciones en produccion mediante API propia y demos alojadas en AIStudio.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | `moss_tts_delay` (transformer con codigo personalizado, familia MOSS-TTS) |
| Parametros totales | 8.489.841.664 (~8,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se recomienda float16 o bfloat16 con FlashAttention 2) |
| Idiomas soportados | 31: zh, yue, en, ar, cs, da, de, nl, es, fr, fi, el, he, hi, hu, ja, it, ko, mk, ms, ru, fa, pl, pt, sv, ro, sw, tl, th, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 17,0 GB) |

## Arquitectura y entrenamiento
MOSS-TTS-v1.5 es un modelo de sintesis de voz construido sobre la arquitectura `moss_tts_delay`, un diseno de transformer con codigo personalizado que hereda del checkpoint MossTTSDelay-8B de la version 1.0. El modelo mantiene las capacidades principales de 1.0: clonacion de voz zero-shot, generacion de discurso largo, control de duracion a nivel de token, control de pronunciacion mediante Pinyin e IPA, sintesis multilingue y code-switching. La version 1.5 se obtiene mediante entrenamiento continuado (continued training) sobre el modelo 1.0, extendiendo el entrenamiento multilingue a once idiomas adicionales: cantonés, neerlandés, finlandés, hindi, macedonio, malayo, rumano, swahili, tagalo, tailandes y vietnamita.

Entre las innovaciones tecnicas destacadas de la version 1.5 figuran: la mejora de la sintesis multilingue cuando se especifica la etiqueta de idioma en el mensaje de usuario (por ejemplo `processor.build_user_message(text=text_fr, language="French")`), una clonacion de voz mas estable con mayor similitud de hablante y menor varianza entre generaciones, un mejor manejo de referencias de audio mucho mas largas que el texto objetivo, un seguimiento mas fiel de la prosodia marcada por la puntuacion y el soporte explicito de marcadores de pausa en linea como `[pause X.Ys]`. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Sintesis de voz multilingue en 31 idiomas, incluyendo espanol, ingles, chino mandarin, cantonés, arabe, hindi, japones, coreano, ruso, portugues, frances, aleman, italiano, neerlandes, polaco, turco, vietnamita, tailandes, swahili y tagalo, entre otros.
- Clonacion de voz zero-shot a partir de audio de referencia, con mejoras en similitud de hablante y consistencia entre generaciones en la version 1.5.
- Generacion de discurso largo (long-form speech generation) para narracion y lectura extensa.
- Control de duracion a nivel de token, permitiendo ajustar la longitud temporal de la sintesis.
- Control de pronunciacion mediante Pinyin (para chino) e IPA (alfabeto fonetico internacional).
- Code-switching: capacidad de alternar idiomas dentro de una misma locucion.
- Marcadores de pausa explicitos en linea con la sintaxis `[pause X.Ys]`, por ejemplo `[pause 3.2s]`.
- Etiquetado explicito de idioma para mejorar la calidad de sintesis en cada idioma soportado.
- Prosodia guiada por puntuacion, con seguimiento mas fiel de pausas en frases largas en la version 1.5.
- Integracion con el pipeline `text-to-speech` de HuggingFace y con la API de AIStudio.

## Casos de uso
- Atencion al cliente automatizada por voz: el modelo puede generar respuestas habladas naturales en espanol y en otros 30 idiomas, con prosodia controlada por puntuacion, lo que permite construir agentes telefonicos o asistentes conversacionales con voces consistentes mediante clonacion zero-shot.
- Audiolibros y narracion long-form: gracias a la generacion de discurso largo y a los marcadores de pausa explicitos, se pueden producir capitulos completos con pausas dramaticas controladas (`[pause 3.2s]`) y una unica voz clonada a partir de una muestra del narrador.
- Doblaje y localizacion de contenido audiovisual: la cobertura de 31 idiomas y el code-switching permiten doblar videos manteniendo la identidad vocal del hablante original mediante clonacion, y alternar idiomas en escenas con dialogos mixtos.
- Accesibilidad y lectores de pantalla: sintesis de alta calidad para convertir texto en voz en aplicaciones de accesibilidad, con control de pronunciacion IPA para terminos tecnicos o nombres propios y ajuste de duracion para adaptarse a la velocidad de lectura del usuario.
- Asistentes de voz embebidos en dispositivos: el modelo puede desplegarse en servidores con GPU para servir a clientes ligeros (moviles, altavoces, automocion), generando respuestas en el idioma del usuario con etiquetas de idioma explicitas para maximizar la calidad.
- Generacion de contenido para formacion y e-learning: creacion de locuciones para cursos en multiples idiomas con una voz corporativa clonada una sola vez, controlando pausas y duracion para sincronizar con diapositivas o animaciones.
- Prototipado de personajes y videojuegos: clonacion de voces de actores para generar variantes de dialogo en distintos idiomas y con pausas expresivas, reduciendo el coste de regrabacion en estudios de doblaje.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la README de MOSS-TTS 1.0 para las tablas de evaluacion completas, pero no se incluyen cifras numericas (MOS, similitud de hablante, WER, etc.) en los datos proporcionados para la version 1.5.

## Requisitos de hardware
- VRAM estimada para inferencia: con 8,49 mil millones de parametros, en float16 o bfloat16 se requieren aproximadamente 17 GB solo para los pesos, mas memoria para activaciones y cache; en la practica se recomienda un minimo de 24 GB de VRAM y 32 GB o mas para margen comodo.
- GPU recomendadas: A100 (40 GB u 80 GB), H100, L40S, RTX A6000 (48 GB). En consumer, una RTX 4090 (24 GB) puede ser suficiente en float16 con atencion optimizada, aunque con margen ajustado.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB), siempre que se use float16/bfloat16 y FlashAttention 2 para reducir el uso de memoria. En GPUs de 16 GB o menos no es viable sin cuantizacion, y no se documentan formatos cuantizados en la informacion disponible.
- Opciones de despliegue: el repositorio oficial (github.com/OpenMOSS/MOSS-TTS) con Transformers 5.0.0, Python 3.12, torch 2.9.1+cu128 y torchaudio 2.9.1+cu128; FlashAttention 2 opcional para mayor velocidad y menor consumo de memoria. Tambien esta disponible via API en AIStudio (studio.mosi.cn). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Idiomas | Licencia | Clonacion zero-shot | Contexto / discurso largo | Disponibilidad |
|---|---|---|---|---|---|---|
| MOSS-TTS-v1.5 | ~8,49 B | 31 | Apache 2.0 | Si | Si (long-form) | HuggingFace, AIStudio, API |
| MOSS-TTS 1.0 | ~8 B (MossTTSDelay-8B) | 20 | Apache 2.0 (segun repositorio OpenMOSS) | Si | Si | HuggingFace (OpenMOSS-Team) |
| Alternativas TTS open source de gran tamano | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otros modelos TTS de la misma categoria (por ejemplo, familias tipo XTTS, Bark, Fish Speech o CosyVoice) no se puede establecer con rigor a partir de la informacion proporcionada, ya que no se incluyen sus especificaciones ni resultados de benchmarks comparables.

## Limitaciones y advertencias
- La model card advierte de que, cuando se omite el campo `language`, la version 1.5 puede mejorar en algunos idiomas y empeorar ligeramente en otros respecto a 1.0; se recomienda especificar siempre la etiqueta de idioma para obtener el mejor rendimiento.
- No se documentan en la informacion disponible los sesgos conocidos del modelo, el riesgo de alucinacion en la sintesis (pronunciacion incorrecta, omision o insercion de contenido) ni las limitaciones de contexto.
- La clonacion de voz zero-shot conlleva riesgos de uso indebido (suplantacion de identidad, deepfakes de audio); aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del integrador implementar consentimiento y salvaguardas.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero no se detallan restricciones adicionales especificas del modelo ni terminos de uso aceptable mas alla de la licencia.
- El modelo requiere Transformers 5.0.0 y versiones concretas de torch (2.9.1+cu128) y torchaudio (2.9.1+cu128), lo que puede generar conflictos de dependencias en entornos existentes; se recomienda un entorno aislado.
- FlashAttention 2 es opcional y puede fallar al compilar en algunas maquinas; en ese caso se usa el backend de atencion por defecto, con mayor consumo de memoria y menor velocidad.
- No se confirma soporte de motores de inferencia alternativos (vLLM, TGI, llama.cpp, Ollama), lo que limita las opciones de despliegue a gran escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia publica de validacion por parte de la comunidad.

## Enlaces
- HuggingFace: https://huggingface.co/Infinix-ai/MOSS-TTS-v1.5
- Repositorio GitHub del proyecto: https://github.com/OpenMOSS/MOSS-TTS/tree/main
- Modelo predecesor MOSS-TTS 1.0: https://huggingface.co/OpenMOSS-Team/MOSS-TTS
- Coleccion en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Blog: https://mosi.cn/#models
- Paper (arXiv 2603.18090): https://arxiv.org/abs/2603.18090
- Demo AIStudio: https://studio.mosi.cn
- Documentacion de la API: https://studio.mosi.cn/docs/moss-tts
- Twitter: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3
