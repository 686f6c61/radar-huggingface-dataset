# Infinix-io/MOSS-TTS-v1.5

## Resumen

MOSS-TTS-v1.5 es un modelo de síntesis de voz (text-to-speech) desarrollado por Infinix-io, continuación de MOSS-TTS 1.0 del proyecto OpenMOSS. Se trata de un modelo de 8.490 millones de parámetros orientado a generación de habla de alta fidelidad con clonación de voz zero-shot, control de duración a nivel de token y síntesis multilingüe en 31 idiomas. La versión 1.5 refuerza la síntesis multilingüe cuando se especifica la etiqueta de idioma, estabiliza la clonación de voz y mejora el seguimiento de la prosodia marcada por puntuación.

El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors, con un repositorio de 17 GB. Emplea la arquitectura `moss_tts_delay` (código personalizado, requiere `trust_remote_code`) y está pensado para integrarse en pipelines de generación de audio mediante la librería Transformers 5.0.0.

Su relevancia actual radica en la combinación de cobertura lingüística amplia (incluyendo castellano, catalán no listado, chino mandarín, cantonés y un conjunto extenso de lenguas europeas y asiáticas), control explícito de pausas y duración, y una licencia permisiva que facilita su uso comercial en productos de voz sintética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | moss_tts_delay (transformer autorregresivo con código personalizado) |
| Parametros totales | 8.489.841.664 (~8,49 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se recomienda float16/bfloat16) |
| Idiomas soportados | 31: zh, yue, en, ar, cs, da, nl, es, fr, fi, el, he, hi, hu, ja, it, ko, mk, ms, ru, fa, pl, pt, sv, ro, sw, tl, th, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-TTS-v1.5 es un modelo autorregresivo de síntesis de voz basado en la arquitectura propietaria `moss_tts_delay`, que requiere cargar código personalizado del repositorio (`trust_remote_code=True`). El modelo genera tokens de audio condicionados por texto y, opcionalmente, por audio de referencia para clonación de voz. La arquitectura se apoya en un procesador (`processor.build_user_message`) que construye los mensajes de entrada con campos como `text` y `language`, y admite marcadores inline de pausa con sintaxis `[pause X.Ys]`.

El entrenamiento de la versión 1.5 parte del checkpoint MOSS-TTS 1.0 y aplica entrenamiento continuado multilingüe para incorporar 11 idiomas adicionales (cantonés, neerlandés, finés, hindi, macedonio, malayo, rumano, suajili, tagalo, tailandés y vietnamita) sobre los 20 originales. Las mejoras declaradas incluyen mayor similitud de hablante en clonación, menor varianza entre generaciones repetidas, mejor manejo de referencias de audio mucho más largas que el texto objetivo, y seguimiento más fiel de pausas inducidas por puntuación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de voz a partir de texto en 31 idiomas, con etiquetado explícito de idioma para maximizar la calidad.
- Clonación de voz zero-shot a partir de audio de referencia, con mayor estabilidad y consistencia en v1.5.
- Generación de habla de formato largo (long-form speech generation).
- Control de duración a nivel de token.
- Control de pronunciación mediante Pinyin (para chino) e IPA (para otros idiomas).
- Cambio de código (code-switching) dentro de una misma emisión.
- Control explícito de pausas mediante marcadores inline como `[pause 3.2s]`.
- Seguimiento de prosodia guiada por puntuación, especialmente en oraciones largas.
- Manejo robusto de referencias de audio largas con textos objetivo cortos.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- **Doblaje y localización de vídeo**: el modelo puede sintetizar voces en 31 idiomas manteniendo una referencia de hablante para preservar la identidad vocal del actor original, lo que resulta adecuado para doblaje multilingüe con coherencia de timbre.
- **Audiolibros y contenido long-form**: la capacidad de generación de habla de formato largo y el control de pausas con `[pause X.Ys]` permiten producir narraciones con respiración y pausas naturales en capítulos extensos.
- **Asistentes de voz para atención al cliente**: la clonación zero-shot y el control de duración permiten crear voces de marca consistentes y ajustar la longitud de las respuestas a los tiempos del sistema telefónico o del agente conversacional.
- **Accesibilidad y lectura de pantalla**: la síntesis multilingüe con control de pronunciación IPA permite generar lecturas precisas de contenido técnico, nombres propios y términos extranjeros para usuarios con discapacidad visual.
- **Generación de contenido para redes y publicidad**: el control de pausas y la estabilidad de clonación facilitan producir múltiples variantes de un mismo guion con una voz de marca fija, reduciendo la varianza entre tomas.
- **Prototipado de interfaces conversacionales**: la licencia Apache 2.0 y los pesos safetensors permiten desplegar el modelo en entornos de desarrollo para evaluar la calidad de voz antes de comprometerse con un proveedor comercial.
- **Educación de idiomas**: la cobertura de 31 idiomas y el control de pronunciación por IPA permiten generar ejemplos auditivos de pronunciación para estudiantes de lenguas extranjeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 8,49 mil millones de parámetros, en float16/bfloat16 se requieren aproximadamente 17 GB solo para los pesos, más memoria para el estado de decodificación y buffers de audio; en la práctica se recomienda un mínimo de 24 GB de VRAM.
- **GPU recomendadas**: A100 (40/80 GB), H100, L40S y RTX 4090 (24 GB) para inferencia en precisión reducida. GPU con menos de 24 GB requerirían cuantización, no documentada en la información disponible.
- **Compatibilidad con GPU de consumo**: sí, en RTX 4090 (24 GB) en float16/bfloat16; en GPUs de 16 GB o menos no se garantiza sin cuantización adicional.
- **Opciones de despliegue**: la vía documentada es la librería Transformers 5.0.0 con el paquete del repositorio oficial (`pip install -e .`), con soporte opcional de FlashAttention 2 para menor uso de memoria y mayor velocidad. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-TTS-v1.5 | ~8,49 B | no disponible | 31 | Apache 2.0 | safetensors |
| MOSS-TTS 1.0 | no disponible | no disponible | 20 | no disponible | no disponible |
| Alternativas TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoría, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- **Sesgos**: no se documentan análisis de sesgo en la información disponible; como todo modelo de voz entrenado con datos reales, puede reproducir sesgos de acento, género o edad presentes en el corpus.
- **Alucinación y artefactos**: la síntesis puede producir artefactos acústicos, pronunciaciones incorrectas o prosodia anómala en textos fuera de distribución; no se documentan tasas de error.
- **Dependencia del etiquetado de idioma**: según la model card, omitir el campo `language` puede mejorar algunos idiomas y degradar otros respecto a la versión 1.0; se recomienda especificar siempre el idioma cuando se conozca.
- **Contexto**: la longitud máxima de contexto no está documentada, lo que limita la planificación de textos largos sin pruebas empíricas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code`, lo que implica ejecutar código del repositorio y auditar su contenido antes de desplegarlo en producción.
- **Dependencias estrictas**: requiere Transformers 5.0.0 y versiones fijadas de torch y torchaudio (2.9.1+cu128), lo que puede entrar en conflicto con entornos existentes.
- **Clonación de voz**: la clonación zero-shot puede utilizarse para suplantación de identidad; es responsabilidad del integrador implementar consentimiento y verificación del hablante.
- **Cobertura de idiomas**: aunque se listan 31 idiomas, la calidad relativa entre ellos no está cuantificada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/MOSS-TTS-v1.5
- Modelo base MOSS-TTS 1.0: https://huggingface.co/OpenMOSS-Team/MOSS-TTS
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-TTS/tree/main
- Paper arXiv: https://arxiv.org/abs/2603.18090
- Colección ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Blog: https://mosi.cn/#models
- Demo AI Studio: https://studio.mosi.cn
- Documentación de API: https://studio.mosi.cn/docs/moss-tts
- Twitter: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3
