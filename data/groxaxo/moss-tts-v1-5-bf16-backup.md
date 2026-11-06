# groxaxo/MOSS-TTS-v1.5-BF16-backup

## Resumen

MOSS-TTS-v1.5 es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo OpenMOSS, distribuido en este repositorio por el usuario `groxaxo` como una copia de seguridad en BF16. Se trata de un modelo de 8.490 millones de parámetros (8,49 B) construido sobre la arquitectura `moss_tts_delay`, que continúa el trabajo de MOSS-TTS 1.0 y añade mejoras centradas en la estabilidad del clonado de voz, el control de prosodia y la ampliación de cobertura multilingüe.

El modelo resuelve el problema de la generación de habla natural y expresiva a partir de texto, con capacidades de clonado de voz zero-shot, generación de audio de formato largo, control de duración a nivel de token y control de pronunciación mediante Pinyin e IPA. Su rasgo más diferencial es el soporte de 31 idiomas, incluido el castellano, con etiquetado explícito de idioma que mejora la calidad de síntesis.

Es relevante ahora porque ofrece una alternativa de código abierto (licencia Apache 2.0) a sistemas TTS propietarios, con un tamaño de 8,49 B parámetros que permite clonado de voz y síntesis multilingüe sin depender de servicios en la nube. El repositorio incluye pesos en formato safetensors y requiere código personalizado (`custom_code`) para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `moss_tts_delay` (transformer para TTS, code personalizado) |
| Parametros totales | 8.489.841.664 (8,49 B) |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (version publicada); no se detallan otras |
| Idiomas soportados | 31: zh, yue, en, ar, cs, da, de, nl, es, fr, fi, el, he, hi, hu, ja, it, ko, mk, ms, ru, fa, pl, pt, sv, ro, sw, tl, th, tr, vi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 17,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es `moss_tts_delay`, un diseño específico para síntesis de voz que emplea un esquema de generación con retardo (delay) sobre tokens de audio. El modelo continúa el entrenamiento de MOSS-TTS 1.0, que ya soportaba 20 idiomas, y en v1.5 se extiende el entrenamiento continuado multilingüe a 11 idiomas adicionales (cantonés, neerlandés, finés, hindi, macedonio, malayo, rumano, suajili, tagalo, tailandés y vietnamita).

Entre las innovaciones técnicas destacadas de v1.5 figuran: mayor estabilidad en el clonado de voz (mejor similitud de hablante y menor varianza entre generaciones), mejor manejo de referencias de audio mucho más largas que el texto objetivo, prosodia más fiel a la puntuación en frases largas y marcadores de pausa explícitos en línea como `[pause 3.2s]`. El modelo se distribuye con código personalizado y recomienda Transformers 5.0.0, además de soporte opcional para FlashAttention 2. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, con etiquetado de idioma para mejorar la calidad.
- Clonado de voz zero-shot a partir de audio de referencia.
- Generación de habla de formato largo.
- Control de duración a nivel de token.
- Control de pronunciación mediante Pinyin e IPA.
- Cambio de código (code-switching) entre idiomas.
- Control explícito de pausas con marcadores inline (`[pause X.Ys]`).
- Prosodia guiada por puntuación, con pausas más fieles en frases largas.
- Manejo robusto de referencias de audio largas con textos cortos.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia para clonado.

## Casos de uso

- Audiolibros y narración de formato largo: el modelo soporta generación de habla extensa y control de pausas explícitas, lo que permite insertar silencios de duración concreta entre capítulos o frases para un ritmo natural.
- Doblaje y localización multilingüe: con 31 idiomas y code-switching, se puede generar una misma locución en castellano, inglés, francés o japonés manteniendo el timbre mediante clonado de voz del actor original.
- Asistentes de voz para atención al cliente: el clonado de voz zero-shot permite crear una voz de marca consistente y la síntesis multilingüe cubre usuarios de distintos mercados sin entrenar modelos separados.
- Accesibilidad y lectura de textos: conversión de documentos a audio con control de pronunciación mediante IPA y Pinyin para términos técnicos o nombres propios que requieren pronunciación exacta.
- Generación de contenido para medios y pódcast: producción de locuciones con pausas controladas (`[pause 3.2s]`) para sincronizar con música o efectos, reduciendo la edición manual posterior.
- Pruebas de concepto y prototipado de interfaces de voz: al ser Apache 2.0 y ejecutable localmente, permite integrar TTS en prototipos sin costes de API ni dependencia de terceros.
- Sistemas de navegación y anuncios dinámicos: la síntesis rápida de frases cortas con control de duración facilita avisos hablados con temporización precisa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,49 B parámetros en BF16, los pesos ocupan aproximadamente 17 GB; se necesita margen adicional para activaciones y caché, por lo que se recomienda al menos 24 GB de VRAM en BF16.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16; en GPUs con menos VRAM sería necesaria cuantización, no documentada en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con margen ajustado; en GPUs de 16 GB o menos no se garantiza sin cuantización adicional.
- Opciones de despliegue: Transformers 5.0.0 con el paquete oficial de OpenMOSS; FlashAttention 2 opcional para menor uso de memoria y mayor velocidad; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-TTS-v1.5 | 8,49 B | 31 | no disponible | Apache 2.0 | Hugging Face (repo de backup) |
| MOSS-TTS 1.0 | no disponible | 20 | no disponible | no disponible | Hugging Face (OpenMOSS-Team) |
| Alternativas TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con MOSS-TTS 1.0, del que v1.5 es continuación directa: v1.5 amplía de 20 a 31 idiomas y mejora clonado y prosodia. No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es una copia de seguridad publicada por un tercero (`groxaxo`), no el repositorio oficial de OpenMOSS; conviene verificar la integridad y procedencia de los pesos antes de usarlos en producción.
- El modelo requiere código personalizado (`custom_code`) y una versión específica de Transformers (5.0.0), lo que puede complicar la integración en entornos existentes.
- Riesgo de alucinación acústica y artefactos en textos muy largos o con referencias de audio atípicas, aunque v1.5 mejora la estabilidad.
- El clonado de voz plantea riesgos de suplantación y uso fraudulento; es responsabilidad del usuario garantizar el consentimiento y cumplir la normativa aplicable.
- Sin etiqueta de idioma, el rendimiento puede variar y regresar en algunos idiomas respecto a 1.0; se recomienda especificar siempre el idioma.
- No se documentan sesgos específicos por idioma ni límites de longitud de contexto en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-BF16-backup
- Modelo base MOSS-TTS 1.0: https://huggingface.co/OpenMOSS-Team/MOSS-TTS
- Repositorio GitHub del proyecto: https://github.com/OpenMOSS/MOSS-TTS/tree/main
- Colección en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Blog: https://mosi.cn/#models
- Paper en arXiv: https://arxiv.org/abs/2603.18090
- Demo AI Studio: https://studio.mosi.cn
- Documentación de API: https://studio.mosi.cn/docs/moss-tts
- Twitter: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3
