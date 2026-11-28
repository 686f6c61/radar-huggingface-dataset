# mradermacher/slovo-4b-i1-GGUF

## Resumen

Slovo-4b es un modelo de lenguaje multilingüe de 4.022 millones de parámetros (4B) especializado en lenguas indígenas, minoritarias y en peligro de extinción de la Federación Rusa, el Cáucaso, Siberia y la región del Volga-Ural. El modelo base es `MarkusMarrei/slovo-4b`, y la ficha que nos ocupa es la cuantización GGUF realizada por mradermacher, publicada bajo licencia Apache 2.0. Está construido sobre la familia Qwen3, según indican las etiquetas del repositorio, lo que le aporta una base arquitectónica transformer densa moderna.

La relevancia del modelo radica en su cobertura lingüística: cubre más de 40 idiomas, entre ellos tártaro (tt), bashkir (ba), chuvasio (cv), yakuto (sah), checheno (ce), ingusetio (inh), avar (av), lezgiano (lez), dargva (dar), lak (lbe), tabasaran (tab), kumyk (kum), karachái-balkar (krc), nogai (nog), kabardino (kbd), adigué (ady), abaza (abq), osetio (os), tuvano (tyv), buriato (bxr), calmuco (xal), altái (alt), jakasio (kjh), mari (chm), mordvino (myv, mdf), udmurto (udm), komi (kpv, koi), carelio (krl), vepsio (vep), neneo (yrk), evenki (eve), even (evn), nanai (gld), chucoto (ckl) y coriaco (kpy), además de ruso, inglés, bielorruso, ucraniano, polaco, serbio, búlgaro, chino y árabe.

Esta ficha documenta la versión cuantizada con imatrix (i1) en formato GGUF, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 48 GB e incluye 25 variantes de cuantización, desde IQ1_S (1,2 GB) hasta Q6_K (3,4 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en la familia Qwen3, segun etiquetas del repositorio) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix i1) |
| Idiomas soportados | 47 idiomas: ru, tt, ba, cv, sah, ce, inh, av, lez, dar, lbe, tab, kum, krc, nog, kbd, ady, abq, os, tyv, bxr, xal, alt, kjh, chm, myv, mdf, udm, kpv, koi, krl, vep, yrk, eve, evn, gld, ckl, kpy, itl, en, be, uk, pl, sr, bg, zh, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `MarkusMarrei/slovo-4b`, mas alla de que se trata de un transformer denso de 4.022 millones de parametros y que las etiquetas del repositorio lo vinculan con la familia Qwen3. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud de contexto nativa.

Tampoco se documentan en la informacion proporcionada los datos de entrenamiento (numero de tokens, composicion del corpus, tecnicas de alineacion como RLHF o DPO) ni innovaciones tecnicas especificas. Las cuantizaciones de esta ficha emplean el metodo i1 de mradermacher, que utiliza un fichero imatrix (matriz de importancia) para mejorar la calidad de las cuantizaciones de baja precision; el fichero imatrix esta incluido en el repositorio (0,1 GB) por si el usuario desea generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en mas de 40 idiomas, con enfasis en lenguas indigenas y minoritarias de Rusia, el Caucaso, Siberia y el Volga-Ural.
- Capacidades multilingues cruzadas: el modelo maneja ruso, ingles, bielorruso, ucraniano, polaco, serbio, bularo, chino y arabe junto a las lenguas regionales.
- Preservacion de patrimonio cultural y folklore: las etiquetas `cultural-heritage` y `folklore` indican un entrenamiento orientado a contenidos etnograficos y tradicionales.
- Soporte de conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Documentacion y revitalizacion de lenguas en peligro: el modelo puede generar textos, traducciones y materiales didacticos en lenguas como vepsio, neneo o chucoto, donde los recursos digitales son escasisimos y los modelos generalistas no ofrecen cobertura.
- Traduccion entre ruso y lenguas regionales: util para administraciones publicas y ONG que necesitan traducir comunicados, formularios o avisos a tártaro, bashkir, chuvasio, yakuto o checheno.
- Preservacion de folklore y patrimonio oral: generacion y resumen de cuentos, leyendas y tradiciones en lenguas como buriato, calmuco o altái, apoyando proyectos etnograficos y museisticos.
- Atencion ciudadana multilingue: un asistente conversacional que responda en la lengua del usuario (por ejemplo, udmurto o komi) en servicios publicos de regiones con poblacion indigena.
- Investigacion linguistica y NLP de bajos recursos: el modelo sirve como base para experimentos de analisis morfologico, generacion y evaluacion en lenguas con pocos corpus digitales.
- Educacion y aprendizaje de lenguas minoritarias: generacion de ejercicios, dialogos y material de practica para escuelas que ensenan lenguas como mari, mordvino o carelio.
- Despliegue en hardware de consumo: gracias a las cuantizaciones desde 1,2 GB, puede ejecutarse en portatiles y equipos sin GPU dedicada para prototipos y demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,3 GB con IQ1_S/IQ1_M (calidad muy baja); 1,5-1,8 GB con IQ2; 2,0-2,3 GB con Q3; 2,4-2,7 GB con Q4; 2,9-3,0 GB con Q5; 3,4 GB con Q6_K. Hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4; para Q6_K se recomienda 6 GB o mas. GPUs como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) o A100/H100 ofrecen margen sobrado y permiten contextos largos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 4-8 GB, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI, pero esta ficha documenta solo la version GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un modelo de 4B, el throughput en GPU de consumo sera alto, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| slovo-4b (esta ficha) | 4B | no disponible | 47 (enfasis en lenguas de Rusia) | Apache 2.0 | GGUF, safetensors |
| Qwen3-4B | 4B | no disponible en esta ficha | Multilingue generalista | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B | 3B | no disponible en esta ficha | Multilingue generalista | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 2 2B | 2B | no disponible en esta ficha | Multilingue generalista | Gemma Terms of Use | safetensors, GGUF |

Los modelos generalistas comparables (Qwen3-4B, Llama 3.2 3B, Gemma 2 2B) ofrecen mejor rendimiento en tareas generales de razonamiento y codigo, pero carecen de cobertura para la mayoria de las lenguas indigenas que Slovo-4b incluye. La ventaja competitiva de Slovo-4b es su especializacion linguistica, no su rendimiento bruto en benchmarks generales, del que no se dispone de datos.

## Limitaciones y advertencias

- No se dispone de datos de benchmarks que permitan evaluar la calidad real del modelo en tareas estandar; el rendimiento en razonamiento, codigo y matematicas es desconocido.
- Las cuantizaciones IQ1 e IQ2 (1,2-1,6 GB) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate". Para uso real se recomienda Q4_K_M o superior.
- La longitud de contexto no esta documentada, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- Riesgo de alucinacion: al ser un modelo de 4B especializado en lenguas de bajos recursos, la generacion en idiomas con pocos datos puede producir texto gramaticalmente incorrecto o inventado.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos derivados de los corpus de entrenamiento, posiblemente centrados en fuentes rusas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `MarkusMarrei/slovo-4b` deberia verificarse de forma independiente para confirmar que mantiene la misma licencia.
- El modelo esta orientado a lenguas de la Federacion Rusa; su utilidad fuera de ese ambito linguistico es limitada frente a modelos generalistas.
- No se documentan capacidades de tool calling ni de agente, por lo que no es adecuado para pipelines que dependan de function calling sin verificacion previa.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/slovo-4b-i1-GGUF
- Modelo base: https://huggingface.co/MarkusMarrei/slovo-4b
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/slovo-4b-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#slovo-4b-i1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
