# beshkenadze/murmur-translation-ct2

## Resumen

El modelo `beshkenadze/murmur-translation-ct2` es un sistema de traducción neuronal ruso-inglés creado por el desarrollador beshkenadze para la aplicación Murmur, que genera subtítulos traducidos en vivo para charlas, tours y conferencias. Se compone de dos checkpoints OPUS-MT `tc-big` de Helsinki-NLP convertidos a CTranslate2 y cuantizados a int8, con el objetivo de ejecutarse en CPU sin depender de la nube. El modelo `ru-en` ocupa 253 MB en disco y alcanza una latencia media de 378 ms por frase en un Apple M1 Max, con una calidad (chrF++ 60,40) superior a la de la variante `bergamot student` diseñada para tiempo real.

El checkpoint `en-ru` es en realidad un modelo de grupo (`eng->zle`) que requiere un token de destino para elegir entre ruso, ucraniano y bielorruso. Sin ese token, el modelo adivina, y aunque suele acertar con el ruso, falla con los otros dos idiomas. La cuantización int8 reduce el tamaño un 3,9x con una pérdida de -0,06 puntos de chrF++, considerada dentro del ruido.

El modelo es relevante porque ofrece traducción de calidad a un coste computacional bajo y con licencia CC BY 4.0, lo que permite integrarlo en aplicaciones comerciales con atribución. La arquitectura subyacente es un transformer de la familia OPUS-MT, entrenado por el proyecto Tatoeba-MT, sin modificaciones en los pesos salvo la conversión y cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (checkpoints OPUS-MT `tc-big` convertidos a CTranslate2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | ruso (ru), inglés (en); el checkpoint en-ru también soporta ucraniano y bielorruso mediante token de destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (CT2), int8 |

## Arquitectura y entrenamiento

El modelo parte de los checkpoints `tc-big` del proyecto OPUS-MT / Tatoeba-MT de Helsinki-NLP. Los pesos originales se convierten a CTranslate2 4.8.2 mediante `ct2-opus-mt-converter --quantization int8`, que aplica cuantización int8 a los pesos. Según la model card, esta conversión reduce el tamaño un 3,9x y cuesta -0,06 puntos de chrF++ frente a float32, una diferencia considerada dentro del ruido.

El entrenamiento original de los modelos OPUS-MT se realizó sobre datos paralelos del corpus Tatoeba y otras fuentes del proyecto Tatoeba-Challenge. No se ha realizado RLHF, DPO ni ajuste fino posterior: la única modificación es la conversión y cuantización. El checkpoint `en-ru` es un checkpoint de grupo (`eng->zle`), que incluye un archivo `target_tag.txt`; el token de destino debe anteponerse a la entrada para seleccionar el idioma de salida (ruso, ucraniano o bielorruso).

## Capacidades

- Traducción automática entre ruso e inglés, con direcciones ru→en y en→ru.
- El checkpoint en→ru admite además ucraniano y bielorruso mediante el token de destino (`target_tag`).
- Inferencia en CPU optimizada mediante CTranslate2 y cuantización int8, pensada para uso en dispositivo.
- Integración con la aplicación Murmur para subtítulos traducidos en vivo.
- Rendimiento medido en FLORES+ devtest ru→en con beam 1 y un solo hilo en Apple M1 Max.
- No se han documentado capacidades de tool calling, agentes, visión ni razonamiento multi-step.

## Casos de uso

- Subtitulado en vivo de conferencias: el modelo traduce discursos en ruso a inglés con una latencia media de 378 ms por frase, lo que permite que el público siga una charla en tiempo real mientras la GPU del dispositivo se reserva para el reconocimiento de voz.
- Traducción offline en dispositivos móviles: gracias a la cuantización int8 y al tamaño reducido (253 MB), se puede integrar en aplicaciones que funcionan sin conexión, como la propia app Murmur.
- Traducción de contenido de vídeo: para generar subtítulos de vídeos en ruso o inglés en local, sin necesidad de enviar los datos a servidores externos, lo que reduce costes y mejora la privacidad.
- Asistente de traducción para turistas: una aplicación que traduzca conversaciones, letreros o menús entre ruso e inglés, ejecutándose en la CPU del teléfono o del portátil.
- Traducción de documentación técnica: manuales, informes o artículos científicos entre ruso e inglés, con la ventaja de poder desplegarse en entornos con recursos limitados.
- Servicios de transcripción y traducción en tiempo real: en reuniones, talleres o eventos, donde se necesita traducir de forma inmediata sin depender de una conexión estable.
- Traducción de chats en aplicaciones de mensajería: para facilitar la comunicación entre usuarios rusos e ingleses, aprovechando el bajo coste computacional del modelo.

## Benchmarks y rendimiento

Se han publicado resultados en el conjunto de evaluación FLORES+ devtest ru→en (1012 filas, beam 1, un hilo, Apple M1 Max), comparando el modelo con una variante ligera de tiempo real.

| Modelo | chrF++ | BLEU | p50 | En disco |
|---|---|---|---|---|
| Murmur ru-en (este) | 60,40 | 35,50 | 378 ms | 253 MB |
| Bergamot student (realtime tier) | 56,79 | 29,55 | 12 ms | 22,5 MB |

La cuantización int8 frente a float32 produce una pérdida de -0,06 chrF++, dentro del ruido, y reduce el tamaño en 3,9x. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) porque se trata de un modelo de traducción.

## Requisitos de hardware

- VRAM: no requiere VRAM; la inferencia está diseñada para ejecutarse en CPU.
- GPU recomendada: ninguna, aunque CTranslate2 también soporta GPU; el diseño original de Murmur es CPU-only.
- Cabe en dispositivos consumer: sí, el checkpoint ru-en ocupa 253 MB y se ejecuta en un Apple M1 Max.
- Opciones de despliegue: CTranslate2 (Python), la aplicación Murmur, o cualquier sistema que cargue pesos CT2.
- Latencia: 378 ms p50 en Apple M1 Max con un hilo y beam 1. Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | chrF++ (ru→en) | BLEU (ru→en) | Latencia p50 | Tamaño en disco | Licencia |
|---|---|---|---|---|---|
| Murmur ru-en (este) | 60,40 | 35,50 | 378 ms | 253 MB | CC BY 4.0 |
| Bergamot student (realtime tier) | 56,79 | 29,55 | 12 ms | 22,5 MB | no disponible |
| Helsinki-NLP OPUS-MT ru-en (float32) | no disponible | no disponible | no disponible | no disponible | CC BY 4.0 |

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos; los modelos OPUS-MT pueden heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: al ser un modelo de traducción, puede producir traducciones incorrectas en frases ambiguas o fuera de dominio.
- Limitaciones de contexto: no se especifica la longitud de contexto; se recomienda verificar el comportamiento con textos largos antes de usarlo en producción.
- El checkpoint en-ru requiere el token de destino; si se omite, el modelo puede seleccionar el idioma equivocado (ucraniano o bielorruso) y producir resultados incorrectos.
- Rendimiento dependiente del hardware: en CPUs más lentas que un Apple M1 Max, la latencia aumentará y la experiencia en tiempo real puede degradarse.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige reconocer la fuente original de los pesos (Helsinki-NLP OPUS-MT / Tatoeba-MT).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/beshkenadze/murmur-translation-ct2
- Aplicación Murmur: https://murmur.q9labs.ai/
- Repositorio de Murmur: https://github.com/beshkenadze/murmur
- Proyecto upstream OPUS-MT / Tatoeba-Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge
- CTranslate2: https://github.com/OpenNMT/CTranslate2
