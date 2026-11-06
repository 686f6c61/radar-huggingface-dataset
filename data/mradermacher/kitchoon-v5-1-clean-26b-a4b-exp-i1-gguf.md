# mradermacher/Kitchoon-V5.1-Clean-26B-A4B-EXP-i1-GGUF

## Resumen

Kitchoon-V5.1-Clean-26B-A4B-EXP-i1-GGUF es una cuantizacion GGUF del modelo SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP, publicada por mradermacher. Se trata de un modelo de tipo Mixture of Experts (MoE) con 25.233.142.046 parametros totales y aproximadamente 4B de parametros activos (indicado por el sufijo A4B), orientado a roleplay conversacional y etiquetado como "uncensored" y "heretic". La model card del cuantizador lo identifica como modelo de vision, con arquitectura derivada de Gemma (tag "gemma4").

El modelo base esta pensado para conversacion multi-turno en ingles, con integracion habitual en frontends como SillyTavern. Esta version concreta aporta cuantizaciones con imatrix (i1) en un rango amplio de tamanos, desde 8,8 GB hasta 22,7 GB, lo que permite desplegarlo en hardware de consumo. La licencia declarada es Apache 2.0.

Es relevante porque combina una arquitectura MoE de ~25B totales con ~4B activos, lo que reduce el coste computacional por token frente a un denso equivalente, y porque ofrece una via practica de ejecucion local de un modelo afinado para roleplay sin censura mediante llama.cpp y derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), base derivada de Gemma (tag "gemma4") |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas Mixture of Experts: 25,2B parametros totales con aproximadamente 4B activos por token, lo que implica enrutamiento disperso hacia un subconjunto de expertos. El tag "gemma4" sugiere que la arquitectura parte de la familia Gemma, aunque no se dispone de detalles verificados sobre la configuracion exacta de capas, numero de expertos ni dimension del hidden state en la informacion proporcionada.

No hay datos publicados sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o fine-tuning supervisado. Las etiquetas "heretic" y "uncensored" indican que el afinado se ha orientado a eliminar o reducir las capas de rechazo y alineamiento restrictivo, tipicamente mediante tecnicas de abliteration o fine-tuning sobre datasets de roleplay. El cuantizador ha generado las versiones GGUF con imatrix (importancia calibrada) y ha publicado tambien cuantizaciones estaticas en un repositorio separado.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y personificacion de personajes.
- Modo de vision: la model card del cuantizador lo declara explicitamente como modelo de vision, con ficheros mmproj (si existen) alojados en el repositorio de cuantizaciones estaticas.
- Respuestas sin filtros de alineamiento restrictivo ("uncensored", "heretic"), orientadas a contenido que los modelos convencionales rechazan.
- Integracion con frontends de roleplay como SillyTavern.
- Soporte de plantillas conversacionales via transformers y llama.cpp.
- Capacidades multilingues limitadas al ingles segun el campo `language` de la model card.

No se dispone de informacion verificada sobre soporte de tool calling, function calling, razonamiento multi-paso, modo thinking explicito ni capacidades de audio.

## Casos de uso

- Roleplay local con personajes: el modelo puede mantener conversaciones multi-turno con consistencia de personaje en SillyTavern, cargando una cuantizacion i1-Q4_K_M (16,9 GB) en una GPU de 24 GB.
- Generacion creativa de ficcion interactiva: adecuado para narrativa ramificada y juegos de texto donde se requiere continuidad de tono y evasion de rechazos por contenido adulto o violento.
- Prototipado de agentes conversacionales sin restricciones de contenido: util en investigacion sobre alineamiento, donde se necesita un modelo que no aplique capas de rechazo para estudiar comportamientos base.
- Despliegue en estaciones de trabajo con una sola GPU consumer: las cuantizaciones IQ3_M (12,5 GB) y IQ4_XS (14,0 GB) permiten ejecucion en RTX 4090 o RTX 3090 con margen para contexto.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye un rango completo desde IQ1_M hasta Q6_K, lo que permite medir el impacto de la cuantizacion en calidad conversacional sobre un mismo modelo.
- Experimentacion con arquitecturas MoE en local: al tener ~4B activos, el coste por token es inferior al de un denso de 25B, lo que facilita pruebas de throughput en hardware modesto.
- Analisis de sesgos y seguridad: al ser un modelo deliberadamente sin censura, sirve como caso de estudio de riesgos en modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~9-10 GB con i1-IQ2_M (10,5 GB) o i1-IQ2_XXS (9,4 GB), hasta ~23 GB con i1-Q6_K (22,7 GB); la opcion recomendada i1-Q4_K_M ocupa 16,9 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones Q4_K_M y superiores; A100 40/80 GB o H100 para Q6_K con contexto largo y batch.
- Cabe en GPU consumer: si, en modelos con 16 GB o mas para IQ4_XS (14,0 GB) y Q4_K_S (15,6 GB); en GPUs de 12 GB solo entran las cuantizaciones IQ2 e IQ3 de menor tamano.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repo base es compatible con transformers.
- Latencia y throughput: no disponible en la informacion proporcionada; al tener ~4B parametros activos, se espera un throughput por token superior al de un denso de 25B, pero no hay mediciones publicadas.
- Los ficheros GGUF pueden estar divididos en varias partes; consultar el README del cuantizador para la concatenacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kitchoon-V5.1-Clean-26B-A4B-EXP-i1-GGUF | ~25,2B | ~4B | no disponible | Apache 2.0 | GGUF |
| Kitchoon-V5-Clean-26B-A4B-i1-GGUF (mradermacher) | ~25B | ~4B | no disponible | no disponible | GGUF |
| Kitchoon-26B-A4B-i1-GGUF (mradermacher) | ~25B | ~4B | no disponible | no disponible | GGUF |

Las alternativas encontradas en la busqueda web son versiones anteriores del mismo linaje Kitchoon, no modelos de otros autores. No se dispone de datos de rendimiento comparativo entre ellas ni con modelos de la competencia.

## Limitaciones y advertencias

- Modelo "uncensored" y "heretic": no aplica capas de rechazo, por lo que puede generar contenido ofensivo, sexual, violento o ilegal sin filtro; no apto para produccion orientada al publico general sin moderacion externa.
- Riesgo elevado de alucinacion en tareas factuales: el afinado esta orientado a roleplay, no a precision factual.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta validado y probablemente sea degradado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones muy largas.
- Licencia Apache 2.0 declarada por el cuantizador, pero conviene verificar la licencia del modelo base SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP antes de uso comercial, dado que el linaje Gemma puede arrastrar terminos adicionales.
- Las cuantizaciones IQ1 e IQ2 estan marcadas por el propio autor como de calidad baja o "desperate"; no recomendadas para uso serio.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Kitchoon-V5.1-Clean-26B-A4B-EXP-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Kitchoon-V5.1-Clean-26B-A4B-EXP-GGUF
- Version anterior V5: https://huggingface.co/mradermacher/Kitchoon-V5-Clean-26B-A4B-i1-GGUF
- Version anterior sin V5.1: https://huggingface.co/mradermacher/Kitchoon-26B-A4B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Kitchoon-V5.1-Clean-26B-A4B-EXP-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
