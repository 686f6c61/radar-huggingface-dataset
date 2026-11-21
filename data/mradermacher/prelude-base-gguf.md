# mradermacher/prelude-base-GGUF

## Resumen

Prelude-base es un modelo de lenguaje de tipo base (no instruido) desarrollado por OpenEuroLLM, un consorcio europeo orientado a construir infraestructura de IA abierta y multilingue. Este repositorio concreto, publicado por mradermacher, contiene las cuantizaciones estaticas en formato GGUF del modelo original, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo cuenta con 9.094.607.872 parametros (aproximadamente 9.1 mil millones), lo que lo situa en la franja de modelos de tamano medio con capacidad de ejecucion local.

La relevancia de este modelo reside en su enfoque multilingue europeo: la model card declara soporte para 40 idiomas, incluyendo lenguas con menor representacion en los corpus habituales como el euskera, el gallego, el catalan, el islandes, el maltes o el letón. Esta cobertura lo convierte en una alternativa interesante para aplicaciones que necesitan cobertura linguistica europea amplia sin depender de modelos propietarios.

Al ser un modelo base, no esta afinado para seguir instrucciones ni para conversar; su funcion es la continuacion de texto y sirve como punto de partida para fine-tuning. La licencia Apache 2.0 facilita su uso comercial y su modificacion, y la disponibilidad de cuantizaciones desde Q2_K (3.9 GB) hasta f16 (18.3 GB) permite desplegarlo desde portatiles con GPU modesta hasta servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 9.094.607.872 (~9.1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (ademas de variantes i1/imatrix en repositorio aparte) |
| Idiomas soportados | 40 idiomas: en, es, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); pesos originales del modelo base presumiblemente en safetensors (no confirmado en la informacion proporcionada) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se trata de un transformer y de que la libreria asociada es `transformers`. No se especifican el numero de capas, la dimension del modelo, el tipo de atencion ni si incorpora innovaciones como atencion lineal o mezcla de expertos. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; al ser un modelo base, es esperable que no haya pasado por alineamiento por preferencias, pero este extremo no se confirma en la model card.

Lo que si se conoce es el proceso de cuantizacion aplicado por mradermacher: se generaron cuantizaciones estaticas a partir de los pesos originales de `openeurollm/prelude-base`, con un conjunto de variantes que cubre desde 2 bits (Q2_K) hasta 16 bits (f16). Ademas, existe un repositorio complementario con cuantizaciones ponderadas mediante imatrix (`prelude-base-i1-GGUF`), que suelen ofrecer mejor calidad por bit que las cuantizaciones estaticas equivalentes. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar.

## Capacidades

- Generacion de texto por continuacion, propia de un modelo base; no esta optimizado para seguir instrucciones ni para mantener dialogos.
- Cobertura multilingue amplia: 40 idiomas europeos declarados, incluidos varios de bajos recursos.
- Capacidad de servir como base para fine-tuning supervisado o para adaptacion a tareas concretas (clasificacion, extraccion, resumen) mediante ajuste.
- Ejecucion local en formato GGUF mediante llama.cpp y ecosistema compatible (Ollama, LM Studio, entre otros).
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo instruido ni se documentan estas capacidades).
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Fine-tuning para tareas especificas en lenguas europeas minoritarias: al partir de un modelo base con cobertura declarada de idiomas como euskera, gallego, catalan o islandes, se puede ajustar con datasets propios para clasificacion de textos o extraccion de entidades en esas lenguas.
- Generacion aumentada de datos sinteticos: un modelo base multilingue permite generar corpus de texto en idiomas con pocos recursos para entrenar otros sistemas, siempre con revision humana posterior.
- Investigacion linguistica comparada: la amplitud de idiomas declarados facilita experimentos de continuacion de texto y analisis de perplejidad entre lenguas romances, germanicas y eslavas con un unico modelo.
- Prototipado en local con hardware de consumo: las cuantizaciones Q4_K_M (5.8 GB) y Q5_K_M (6.6 GB) permiten ejecutar el modelo en GPUs de 8-12 GB de VRAM para pruebas de continuacion de texto y evaluacion de calidad.
- Base para modelos de dominio (legal, medico, administrativo): el punto de partida base admite ajuste fino con corpus especializados en varios idiomas europeos, aprovechando la licencia Apache 2.0 para uso comercial.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece una escalera completa de cuantizaciones (de Q2_K a f16) que permite medir el impacto de la compresion en la calidad de la generacion sobre un mismo modelo.
- Despliegue en entornos sin conectividad o con requisitos de soberania de datos: al ejecutarse localmente en GGUF, el modelo no requiere enviar datos a servicios externos, lo que encaja en contextos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3.9 GB, Q4_K_M ~5.8 GB, Q8_0 ~9.8 GB, f16 ~18.3 GB (mas overhead de contexto y del runtime).
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M o Q5_K_M; las cuantizaciones Q2_K y Q3_K permiten incluso GPUs de 6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para los pesos originales en transformers se puede usar vLLM o TGI, aunque la informacion disponible no lo confirma.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Prelude-base (este) | ~9.1B | no disponible | Apache 2.0 | GGUF en HF, pesos base en openeurollm/prelude-base |
| Alternativas de ~7-9B multilingues | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no mantiene formato conversacional y puede producir continuaciones incoherentes si se usa como asistente sin fine-tuning.
- Riesgo de alucinacion y de generar contenido facticamente incorrecto, especialmente en tareas de conocimiento sin ajuste previo.
- No se documentan sesgos concretos, pero al ser un modelo multilingue entrenado con corpus web es probable que herede sesgos de esos datos; no hay evaluacion publicada en la informacion disponible.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- El soporte de los 40 idiomas es declarado por el autor; no hay benchmarks publicados que cuantifiquen la calidad real por idioma.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original (`openeurollm/prelude-base`) antes de un uso comercial a gran escala.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso practico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/prelude-base-GGUF
- Modelo base original: https://huggingface.co/openeurollm/prelude-base
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/prelude-base-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#prelude-base-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
