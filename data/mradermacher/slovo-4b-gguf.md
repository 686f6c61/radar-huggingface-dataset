# mradermacher/slovo-4b-GGUF

## Resumen

Slovo-4b es un modelo de lenguaje multilingüe de 4.022 millones de parámetros (4B) desarrollado por Markus Marrei, orientado específicamente a lenguas indígenas, minoritarias y en peligro de extinción de la Federación Rusa, el Cáucaso, Siberia y la región del Volga-Ural, además de lenguas eslavas y otras lenguas mayoritarias. El modelo parte de una base Qwen3 y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de preservación lingüística.

La versión aquí descrita es una cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio incluye 12 variantes de cuantización que van desde Q2_K (1,8 GB) hasta f16 (8,2 GB), cubriendo un amplio espectro de compromisos entre tamaño, velocidad y calidad.

Su relevancia actual radica en la cobertura de más de 45 lenguas, muchas de ellas con recursos digitales muy limitados, lo que lo convierte en una herramienta poco común para documentación lingüística, folklore, patrimonio cultural y aplicaciones de traducción y generación de texto en idiomas infrarrepresentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3, segun tags del repositorio) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ru, tt, ba, cv, sah, ce, inh, av, lez, dar, lbe, tab, kum, krc, nog, kbd, ady, abq, os, tyv, bxr, xal, alt, kjh, chm, myv, mdf, udm, kpv, koi, krl, vep, yrk, eve, evn, gld, ckl, kpy, itl, en, be, uk, pl, sr, bg, zh, ar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo base (MarkusMarrei/slovo-4b) se asocia con Qwen3 segun los tags del repositorio, lo que sugiere una arquitectura transformer decoder-only con atencion por grupos (GQA) y posiblemente mecanismos de atencion lineal o hibridos propios de la familia Qwen3. No se especifica el numero de capas, dimensiones ocultas, cabezas de atencion ni si incorpora decodificacion especulativa.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o instruction tuning. El enfasis declarado en lenguas indigenas y en peligro de extincion sugiere un corpus curado con material de folklore, patrimonio cultural y textos regionales, pero no se aportan cifras concretas. La cuantizacion GGUF ha sido generada con quantize_version 2 y output_tensor_quantised 1, segun los metadatos del autor de la cuantizacion.

## Capacidades

- Generacion de texto conversacional y multilingue en mas de 45 lenguas, incluyendo lenguas turquicas (tt, ba, cv, sah, kum, krc, nog, alt, kjh, tyv), caucasicas (ce, inh, av, lez, dar, lbe, tab, kbd, ady, abq), ugrofinesas (myv, mdf, udm, kpv, koi, krl, vep) y paleosiberianas (yrk, eve, evn, gld, ckl, kpy, itl).
- Soporte de lenguas mayoritarias como ruso, ingles, bielorruso, ucraniano, polaco, serbio, bulgaro, chino y arabe.
- Orientacion a patrimonio cultural y folklore, segun los tags del repositorio.
- Capacidad conversacional (tag `conversational`).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se dispone de informacion sobre capacidades especificas de codigo o matematicas.

## Casos de uso

- Preservacion y documentacion de lenguas en peligro: el modelo puede generar y completar textos en lenguas como vepsio, livonio o itelmen, sirviendo de apoyo a linguistas que necesitan borradores o ejemplos de frase para corpus limitados.
- Traduccion asistida de lenguas minoritarias: util para traducciones bidireccionales entre ruso y lenguas turquicas o caucasicas donde los modelos generalistas rinden mal, con revision humana posterior.
- Digitalizacion de folklore y patrimonio oral: generacion de resumenes, transcripciones normalizadas o adaptaciones de relatos tradicionales recogidos en lengua original.
- Educacion y materiales didacticos: creacion de ejercicios, dialogos y textos de lectura en lenguas regionales para escuelas de las republicas de la Federacion Rusa.
- Chatbots de atencion ciudadana multilingue: despliegue en local con llama.cpp u Ollama para administraciones que atienden a poblaciones que hablan lenguas como tartaro, baskirio o chuvasio.
- Investigacion en linguistica computacional: modelo de referencia para evaluar tecnicas de adaptacion a lenguas de bajos recursos, dado su tamano contenido (4B) y licencia permisiva.
- Despliegue en hardware modesto: al caber en cuantizaciones de 1,8 a 4,4 GB, permite prototipos en portatiles y equipos sin GPU dedicada para pruebas de concepto linguisticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~1,8 GB; Q4_K_M ~2,6 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para variantes de mayor precision o mayor contexto.
- Cabe en GPU de consumo: si, en tarjetas con 4-8 GB de VRAM para Q4-Q8; la version f16 requiere ~10-12 GB con contexto, por lo que encaja en RTX 3080/4080/4090 o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI o similares.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| slovo-4b (este) | 4,02B | no disponible | Apache 2.0 | Lenguas indigenas de Rusia y multilingue |
| Qwen3-4B (base inferida) | ~4B | no disponible | Apache 2.0 (segun familia Qwen) | Multilingue generalista |
| Llama 3.2 3B | 3,2B | 128k (segun model card oficial) | Llama 3.2 Community License | Multilingue generalista |
| Gemma 2 2B | 2,6B | 8k (segun model card oficial) | Gemma Terms of Use | Multilingue generalista |

La comparativa cuantitativa de rendimiento no esta disponible en la informacion proporcionada. La principal diferencia de slovo-4b frente a los generalistas es su cobertura declarada de lenguas minoritarias de Rusia, ausente o muy limitada en los modelos citados.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos especificos; al entrenarse probablemente con corpus regionales, puede reflejar sesgos culturales o linguisticos de las fuentes.
- Riesgo de alucinacion elevado en lenguas de bajos recursos, donde el volumen de datos de entrenamiento es presumiblemente limitado.
- La longitud de contexto no esta documentada, lo que dificulta planificar casos de uso con documentos largos.
- La calidad por lengua es heterogenea: las lenguas con mas hablantes (ruso, tartaro, baskirio) probablemente rinden mejor que las de muy pocos hablantes (vepsio, itelmen, ket).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede arrastrar condiciones adicionales no documentadas en la informacion disponible.
- No hay benchmarks publicados, por lo que las afirmaciones de calidad deben validarse empiricamente antes de produccion.
- El repositorio tiene solo 360 descargas y 0 likes, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/slovo-4b-GGUF
- Modelo base: https://huggingface.co/MarkusMarrei/slovo-4b
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/slovo-4b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#slovo-4b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
