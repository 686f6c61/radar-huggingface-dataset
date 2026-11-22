# mradermacher/Wicked-Stuff-26B-A4B-v2.0-Final-i1-GGUF

## Resumen

Wicked-Stuff-26B-A4B-v2.0-Final-i1-GGUF es una cuantizacion GGUF del modelo ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final, realizada por mradermacher. Se trata de un modelo de lenguaje conversacional orientado explicitamente a roleplay para adultos, con etiquetas que declaran contenido NSFW, erotico, horror y violencia. El modelo base cuenta con 25.233.142.046 parametros totales (segun los safetensors publicados) y esta disenado para generacion de texto e instrucciones en ingles.

La relevancia de esta ficha es acotada: no es un modelo de proposito general, sino una cuantizacion de conveniencia para ejecutar localmente un modelo de roleplay adulto en hardware de consumo. La nomenclatura "A4B" del nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parametros activos, aunque no se ha confirmado en la informacion disponible.

El repositorio incluye unicamente pesos GGUF (no safetensors en este repo), con un total de 301 GB de tamano y 9152 descargas. La licencia declarada es Apache 2.0. No se dispone de informacion sobre contexto maximo, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre "A4B" sugiere MoE con ~4B parametros activos, sin confirmar) |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | no disponible (presuntamente ~4 B por el sufijo "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas del fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); no se incluyen safetensors en este repo |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. El sufijo "A4B" en el nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos sobre un total de 25,2 mil millones, pero este dato no esta confirmado por la model card. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado.

La unica innovacion tecnica documentada es el proceso de cuantizacion: mradermacher ha generado cuantizaciones i1 (imatrix) a partir de un fichero imatrix propio, lo que tipicamente mejora la calidad de las cuantizaciones de baja precision (IQ1-IQ3) frente a las cuantizaciones estaticas equivalentes. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y recomienda i1-Q4_K_M como opcion rapida y i1-Q4_K_S como equilibrio optimo entre tamano, velocidad y calidad.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a roleplay y narrativa interactiva.
- Contenido explicito para adultos (NSFW, erotico) segun las etiquetas del repositorio.
- Generacion de narrativa de terror y violencia (tags "Horror", "Violence").
- Comportamiento "unaligned" declarado por el autor, es decir, sin las restricciones de alineamiento tipicas de modelos instruct convencionales.
- Modo instruct y conversacional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision, audio o thinking mode: no disponible.

## Casos de uso

- Roleplay conversacional local: el modelo esta disenado para mantener personajes y narrativas multi-turno en ingles; su naturaleza "unaligned" permite explorar tramas adultas o violentas sin los filtros habituales, lo que lo hace adecuado para plataformas de ficcion interactiva para adultos.
- Escritura creativa de ficcion explicita: util para autores que necesitan generar borradores de escenas adultas o de terror con coherencia narrativa, ejecutando el modelo en local para preservar la privacidad del contenido.
- Prototipado de videojuegos narrativos para adultos: integrable en motores de dialogo mediante llama.cpp u Ollama, permitiendo generar respuestas de PNJ con tono y contenido adultos sin depender de APIs externas.
- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso de estudio de un modelo deliberadamente no alineado, util para analizar comportamientos, sesgos y riesgos en entornos controlados.
- Generacion de contenido para comunidades de rol por texto: con cuantizaciones Q4_K_M (16,9 GB) puede ejecutarse en GPUs de consumo de 24 GB, facilitando el despliegue en estaciones de trabajo personales.
- Experimentacion con cuantizaciones: el repositorio ofrece 23 variantes de cuantizacion, lo que permite comparar calidad y velocidad en distintos presupuestos de VRAM, desde 8,4 GB (IQ1_S) hasta 22,7 GB (Q6_K).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8,4 GB (i1-IQ1_S) y 22,7 GB (i1-Q6_K) solo para los pesos; anadir 1-3 GB adicionales para contexto y overhead del runtime.
- Cuantizaciones recomendadas por el autor: i1-Q4_K_M (16,9 GB, "rapida, recomendada") e i1-Q4_K_S (15,6 GB, "optimo tamano/velocidad/calidad").
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M y superiores; GPUs de 16 GB (RTX 4080, 4070 Ti Super) para Q4_K_S o IQ4_XS; GPUs de 12 GB para IQ3_M o Q3_K_M; GPUs de 8-10 GB solo con cuantizaciones IQ1/IQ2, con calidad degradada.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M, y en GPUs de 12-16 GB con cuantizaciones medias.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y otros runtimes compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v2.0-Final-i1-GGUF | 25,2 B (activos no confirmados) | no disponible | Apache 2.0 | GGUF | Roleplay adulto, no alineado, solo ingles |
| ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final | 25,2 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF | 25,2 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base |

No se dispone de informacion sobre otros modelos comparables de roleplay adulto en la documentacion proporcionada.

## Limitaciones y advertencias

- Contenido explicito y potencialmente perturbador: el modelo esta etiquetado como NSFW, erotico, horror y violencia; no es apto para todos los publicos ni para entornos de produccion generalistas.
- Modelo "unaligned": no incorpora las salvaguardas habituales de los modelos instruct alineados, por lo que puede generar contenido danino, ilegal o eticamente cuestionable sin filtros.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un modelo de 25 B sin benchmarks publicados.
- Limitacion idiomatica: solo soporta ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin datos del autor.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas sobre material para adultos en distintas jurisdicciones; el responsable del despliegue asume el riesgo legal.
- Calidad degradada en cuantizaciones bajas: las variantes IQ1 e IQ2 (8,4-10,7 GB) presentan perdida de calidad significativa, segun las propias notas del autor ("for the desperate", "very low quality").
- Repositorio de 301 GB: requiere espacio en disco considerable si se descargan varias cuantizaciones.
- Sin datos de benchmarks ni de entrenamiento: imposible evaluar objetivamente su rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v2.0-Final-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Wicked-Stuff-26B-A4B-v2.0-Final-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed
