# mradermacher/Swish-26B-A4B-Final-i1-GGUF

## Resumen

Swish-26B-A4B-Final es un modelo de lenguaje conversacional orientado a roleplay, ficcion adulta y narrativa explicita, desarrollado originalmente por ReadyArt y distribuido en formato GGUF por mradermacher. El nombre indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 26.000 millones de parametros totales y unos 4.000 millones activos por token, lo que permite un rendimiento de inferencia cercano a un modelo denso de 4B pese a la capacidad representacional de un 26B. Los pesos reales publicados en safetensors suman 25.233.142.046 parametros.

El modelo se presenta como "unaligned", es decir, sin el alineamiento de seguridad habitual en modelos comerciales, y esta especializado en dialogos multi-turno, escenas eroticas, terror y violencia grafica. Esta etiquetado como `not-for-all-anchors` y `not-for-all-audiences`, y su uso esta restringido a contenido para adultos. La licencia declarada es Apache 2.0, aunque el contenido generado y las responsabilidades legales derivadas recaen sobre el usuario.

Esta ficha documenta la version cuantizada con imatrix de mradermacher (sufijo `i1`), que ofrece un abanico de cuantizaciones GGUF desde IQ1_S (8,4 GB) hasta Q6_K (22,7 GB), pensadas para ejecucion local en llama.cpp y derivados. La relevancia actual radica en que permite desplegar un MoE de 26B en hardware de consumo con calidad razonable a partir de Q4_K_M (16,9 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, segun nomenclatura A4B |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | aproximadamente 4B (inferido del sufijo A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (imatrix i1) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base ReadyArt/Swish-26B-A4B-Final emplea una arquitectura de mezcla de expertos con 25,2 mil millones de parametros totales y aproximadamente 4 mil millones activos por token, segun la convencion de nomenclatura A4B. Esta configuracion permite que, durante la inferencia, solo se active una fraccion de los expertos, reduciendo el coste computacional por token a niveles comparables a un modelo denso de 4B, manteniendo la capacidad de un modelo mucho mayor. No se dispone de informacion detallada sobre el numero de expertos, la estrategia de enrutamiento ni la composicion exacta de las capas.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. La model card del cuantizador no incluye estos detalles, y la del modelo base no se ha proporcionado. Las cuantizaciones i1 de mradermacher emplean ficheros imatrix (importance matrix) para preservar mejor la calidad en tasas de bits bajas, y el autor indica que las variantes IQ suelen superar a las Q de tamano similar. Se ofrece tambien una version con cuantizaciones estaticas en el repositorio paralelo Swish-26B-A4B-Final-GGUF.

## Capacidades

- Generacion de texto narrativo y conversacional en ingles, con enfasis en dialogos multi-turno coherentes.
- Roleplay y character roleplay: mantiene personajes y contextos a lo largo de conversaciones extensas.
- Contenido adulto explicito (ERP), ficcion erotica y escenas romanticas sin restricciones de alineamiento.
- Narrativa de terror y violencia grafica, con descripciones detalladas.
- Modo instruct y conversacional: responde a instrucciones y mantiene formato de dialogo.
- Generacion creativa de ficcion, guiones y descripciones de escenas.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking).

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo mantiene personajes y contexto en sesiones multi-turno, adecuado para plataformas de entretenimiento para adultos con moderacion y verificacion de edad.
- Generacion de ficcion erotica y narrativa adulta: util para autores que necesitan borradores rapidos de escenas explicitas sin filtros de contenido, con revision editorial posterior.
- Escritura de terror y horror: produce descripciones viscerales y atmosfericas para relatos, guiones o videojuegos narrativos con clasificacion por edades.
- Simulacion de personajes en videojuegos o experiencias interactivas: al ser un MoE de 4B activos, puede ejecutarse en local con latencia baja para respuestas en tiempo real.
- Prototipado de chatbots sin alineamiento para investigacion sobre seguridad y comportamiento de modelos: permite estudiar respuestas no filtradas en entornos controlados y aislados.
- Generacion de dialogos para mods o contenido de rol en comunidades: integrable en pipelines locales con llama.cpp para producir variaciones de dialogo sin depender de APIs externas.
- Despliegue en local para privacidad: al caber en GPUs de consumo en Q4_K_M (16,9 GB), permite generar contenido sensible sin enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion GGUF): IQ1_S 8,4 GB; IQ2_M 10,5 GB; IQ3_S 12,3 GB; IQ4_XS 14,0 GB; Q4_K_S 15,6 GB; Q4_K_M 16,9 GB; Q5_K_M 19,2 GB; Q6_K 22,7 GB. Hay que anadir overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M o Q6_K; RTX 4080/4070 Ti Super (16 GB) para Q4_K_S o IQ4_XS; RTX 4060 Ti 16 GB para Q4_K_M; A100 40/80 GB o H100 para cuantizaciones altas con contexto largo y mayor throughput.
- Cabe en GPU de consumo: si, en modelos con 12-16 GB o mas usando cuantizaciones IQ3/IQ4; en 8 GB solo con IQ1/IQ2 y calidad degradada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y otros frontends compatibles con GGUF; los tags indican `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles. Al activar solo unos 4B parametros por token, el throughput deberia ser superior al de un denso de 26B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Swish-26B-A4B-Final (i1 GGUF) | 25,2B | ~4B | no disponible | Apache 2.0 | GGUF | Roleplay adulto sin alineamiento, solo ingles |
| Swish-26B-A4B-Final (base) | 25,2B | ~4B | no disponible | Apache 2.0 | safetensors | Version original sin cuantizar |
| Swish-26B-A4B-Final-GGUF (estatico) | 25,2B | ~4B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo autor |
| Alternativas de roleplay sin alineamiento | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con modelos alternativos concretos de la misma categoria sin inventar datos.

## Limitaciones y advertencias

- Contenido explicito y no alineado: el modelo genera material adulto, violento y potencialmente perturbador; requiere verificacion de edad y moderacion en cualquier despliegue publico.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos, nombres y detalles; no es fiable para tareas factuales.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas; el rendimiento fuera del ingles sera deficiente.
- Sesgos conocidos: no documentados en la informacion disponible, pero previsiblemente hereda sesgos del corpus de entrenamiento sin mitigacion por alineamiento.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el contenido generado y su legalidad (material para adultos, violencia) son responsabilidad del usuario y pueden estar sujetos a normativa local.
- Contexto no documentado: se desconoce la ventana maxima; conviene validarla empiricamente antes de disenar aplicaciones con contextos largos.
- Cuantizaciones muy bajas (IQ1, IQ2) degradan notablemente la coherencia; el autor las etiqueta como "for the desperate" o "mostly desperate".
- No apto para audiencias generales: los tags `not-for-all-audiences` y `nsfw` deben respetarse en cualquier integracion.

## Enlaces

- Repositorio Hugging Face (i1 GGUF): https://huggingface.co/mradermacher/Swish-26B-A4B-Final-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Swish-26B-A4B-Final-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Swish-26B-A4B-Final
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Swish-26B-A4B-Final-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
