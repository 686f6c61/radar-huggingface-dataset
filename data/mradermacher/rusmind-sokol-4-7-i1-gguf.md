# mradermacher/RusMind-Sokol-4.7-i1-GGUF

## Resumen

RusMind-Sokol-4.7-i1-GGUF es una colección de cuantizaciones en formato GGUF con matriz de importancia (imatrix/i1) del modelo DICPlay/RusMind-Sokol-4.7, realizada por el cuantizador comunitario mradermacher. El modelo base es un LLM centrado en razonamiento (tags "reasoning" y "thinking") orientado a ruso e inglés, con aproximadamente 8.954 millones de parámetros según los metadatos de safetensors del repositorio.

La relevancia de esta ficha no es el modelo original en sí, sino la disponibilidad de más de 20 variantes cuantizadas que permiten ejecutarlo localmente desde entornos muy modestos (desde ~2,8 GB en IQ1_S) hasta configuraciones de máxima fidelidad (Q6_K, 7,5 GB). Esto lo hace accesible para inferencia offline en hardware de consumo mediante llama.cpp, Ollama o LM Studio.

Cabe destacar que la documentación del modelo base es escasa: no se han publicado detalles de arquitectura, datos de entrenamiento ni benchmarks en la información disponible, por lo que varias secciones de esta ficha indican datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, library_name: transformers) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | rusmind-license (tipo "other", no es una licencia estandar abierta) |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la informacion disponible. Los metadatos indican que se trata de un modelo conversacional basado en la libreria transformers, con aproximadamente 8,95 mil millones de parametros, lo que sugiere un transformer denso de gama media-alta, aunque no puede confirmarse si es denso o MoE.

Sobre el entrenamiento del modelo base (datos de entrenamiento, numero de tokens, composicion del dataset, RLHF/DPO) no hay informacion publicada. Los tags "reasoning", "thinking" y "offline" sugieren que el modelo ha sido ajustado para generar razonamiento explicito antes de la respuesta final (estilo thinking mode), pero este detalle no esta documentado en la model card.

Respecto a la cuantizacion: mradermacher emplea cuantizaciones i1 (imatrix), que calculan una matriz de importancia a partir de datos de calibracion para reducir la perdida de calidad frente a cuantizaciones estaticas. El propio autor recomienda en general preferir variantes IQ sobre variantes K de tamano similar (por ejemplo, IQ3_S sobre Q3_K_M), y senala Q4_K_S como el punto optimo de equilibrio entre tamano, velocidad y calidad, y Q4_K_M como opcion rapida recomendada.

## Capacidades

- Generacion de texto conversacional en ruso e ingles (idiomas declarados en la model card).
- Razonamiento paso a paso: los tags "reasoning" y "thinking" indican soporte de cadenas de razonamiento explicitas (thinking mode), aunque sin documentacion del formato de plantilla.
- Ejecucion offline y local: el formato GGUF permite inferencia sin conexion en CPU y GPU mediante llama.cpp y derivados.
- Compatibilidad con el ecosistema llama.cpp (tag "llama.cpp", "endpoints_compatible").
- Inclusion de fichero imatrix (0,1 GB) para que usuarios avanzados generen sus propias cuantizaciones.
- No hay informacion disponible sobre vision, audio, tool calling ni capacidades agenticas.

## Casos de uso

- Asistentes conversacionales en ruso: el modelo esta orientado a ruso e ingles, por lo que es adecuado para chatbots que atiendan usuarios rusohablantes con respuestas con razonamiento previo.
- Razonamiento local offline: gracias al formato GGUF puede desplegarse en entornos sin acceso a internet (equipos aislados, instalaciones sensibles), aprovechando su perfil "thinking" para tareas de resolucion de problemas.
- Inferencia en portatiles y equipos modestos: las variantes IQ1_S/IQ2 (2,8-3,7 GB) permiten cargar el modelo en maquinas con 8 GB de RAM, a costa de calidad notablemente reducida.
- Estaciones de trabajo con GPU de consumo: variantes Q4_K_S/Q4_K_M (5,5-5,7 GB) caben comodamente en GPUs de 8-12 GB de VRAM (RTX 3060, RTX 4070), ofreciendo el mejor equilibrio calidad/velocidad para uso diario.
- Maxima fidelidad en servidores: Q6_K (7,5 GB) ofrece calidad practicamente identica a la version sin cuantizar en GPUs de 12-16 GB.
- Creacion de cuantizaciones personalizadas: el fichero imatrix incluido permite a usuarios avanzados generar cuantizaciones propias ajustadas a su hardware.
- Experimentacion y evaluacion de modelos de razonamiento en ruso: util como base para comparativas de modelos thinking de tamano medio en el ecosistema open source ruso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni para el modelo base DICPlay/RusMind-Sokol-4.7 ni para las cuantizaciones).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos, sin KV-cache):
  - IQ1_S: ~2,8 GB; IQ1_M: ~3,0 GB (calidad muy degradada, solo emergencias).
  - IQ2_XXS a IQ2_M: ~3,2-3,7 GB.
  - IQ3/Q3: ~4,0-5,0 GB.
  - Q4_K_S: ~5,5 GB (recomendada); Q4_K_M: ~5,7 GB.
  - Q5_K_M: ~6,6 GB; Q6_K: ~7,5 GB.
  - Anadir margen para el contexto: aproximadamente 1-2 GB adicionales segun longitud de ventana.
- GPUs recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM ejecuta Q4_K_S/Q4_K_M con descarga parcial o completa (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Para Q6_K convienen 12-16 GB (RTX 4070 Ti Super, RTX 4080). En CPU pura, 16 GB de RAM bastan para cuantizaciones medias.
- Cabe en consumer GPU: si, desde ~6 GB de VRAM con cuantizaciones medias, y en CPU con 8-16 GB de RAM usando variantes IQ1/IQ2.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, GPT4All, koboldcpp, y cualquier runtime compatible con GGUF. No hay indicios de soporte verificado en vLLM o TGI para GGUF.
- Latencia y throughput: no disponible; como referencia general, los tamaños de 4-6 GB suelen alcanzar velocidades interactivas en GPU de consumo, pero no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| RusMind-Sokol-4.7 (este, via GGUF) | ~8,95 B | GGUF i1 (24 variantes) | ru, en | rusmind-license (restrictiva) | Enfocado a razonamiento/thinking |
| Qwen3 8B | ~8 B | safetensors, GGUF comunitario | multilingue (100+ idiomas) | Apache 2.0 | Thinking mode hibrido, mejor documentado |
| Llama 3.1 8B | ~8 B | safetensors, GGUF comunitario | multilingue (8 idiomas oficiales) | Llama 3.1 Community License | Ecosistema muy maduro, sin thinking nativo |
| Gemma 2 9B | ~9 B | safetensors, GGUF comunitario | multilingue | Gemma Terms of Use | Buena calidad general, sin perfil reasoning |

La comparativa es orientativa: al no haber benchmarks publicados de RusMind-Sokol-4.7, no puede evaluarse su rendimiento relativo frente a estas alternativas. Su diferenciador declarado es el enfoque en razonamiento en ruso, frente a modelos generalistas multilingues de tamano similar.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia rusmind-license es de tipo "other" y no es una licencia estandar abierta. Debe revisarse el texto del fichero LICENSE antes de cualquier uso comercial o redistribucion.
- Sin benchmarks publicados: no hay forma de verificar la calidad del modelo base ni la degradacion por cuantizacion mas alla de las notas cualitativas del cuantizador.
- Cuantizaciones extremas degradan seriamente la calidad: el propio autor etiqueta IQ1_S/IQ1_M como "para desesperados" y Q2_K_S como "muy baja calidad". Evitarlas salvo necesidad extrema.
- Idiomas limitados: solo ruso e ingles declarados; el rendimiento en espanol u otros idiomas es desconocido y probablemente pobre.
- Sin documentacion de plantilla de chat: al ser un modelo thinking, el formato de prompt (tokens de razonamiento, turnos) no esta documentado en esta ficha, lo que puede causar salidas incorrectas si se usa la plantilla equivocada.
- Riesgo de alucinacion: no disponible dato concreto, pero como todo LLM de ~9 B sin documentacion de alineacion, debe asumirse riesgo alto en tareas factualmente exigentes.
- Tamano del repositorio: 110,2 GB (incluye todas las variantes); descargar solo los ficheros GGUF necesarios.
- No hay informacion sobre sesgos conocidos, moderacion de contenidos ni garantias de seguridad para produccion.

## Enlaces

- Repositorio de la cuantizacion (esta ficha): https://huggingface.co/mradermacher/RusMind-Sokol-4.7-i1-GGUF
- Modelo base: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/RusMind-Sokol-4.7-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#RusMind-Sokol-4.7-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
