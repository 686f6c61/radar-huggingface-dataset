# mradermacher/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-GGUF

## Resumen

Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-GGUF es la version cuantizada en formato GGUF, publicada por el usuario mradermacher, del modelo base llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1. Se trata de un modelo de la clase 24B con 23.572.403.200 parametros reales (segun los tensores en safetensors del modelo base), orientado a generacion conversacional y roleplay sin filtros de rechazo.

La ficha de HuggingFace lo etiqueta explicitamente como nsfw, explicit, roleplay, unaligned, ERP, Erotic, Horror, Violence, heretic, uncensored, decensored y abliterated. Es decir, el modelo base ha pasado por un proceso de ablation de la direccion de rechazo (abliteration) que elimina o reduce las respuestas de negativa del modelo afinado original, y esta pensado para contenido adulto, narrativa explicita y escenarios de ficcion dura. El unico idioma declarado es el ingles (en).

El repositorio de cuantizaciones ocupa 161,4 GB e incluye 12 niveles de cuantizacion (desde Q2_K de 9,0 GB hasta Q8_0 de 25,2 GB), lo que permite ejecutarlo en hardware de consumo con llama.cpp y derivados. El modelo acumula 215 descargas y 0 likes en el momento de la consulta, no declara licencia y no publica datos de benchmarks ni de arquitectura en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 23.572.403.200 (23,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio cuantizado); modelo base en transformers/safetensors |

Otros datos de la ficha: libreria declarada transformers, pipeline no disponible, autor de la cuantizacion mradermacher (quantized_by), creado el 2026-03-21 y actualizado el 2026-10-10. El repositorio incluye ademas una variante de cuantizacion con imatrix (weighted/imatrix) en el repositorio mradermacher/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-i1-GGUF.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en la documentacion disponible. El modelo esta etiquetado con transformers y cuenta con 23,57 mil millones de parametros, pero no se detalla si emplea atencion completa, atencion lineal, arquitectura MoE o hibrida, ni la longitud de contexto nativa.

Respecto al entrenamiento y al post-procesado, la informacion disponible se limita a las etiquetas de la ficha: heretic, uncensored, decensored y abliterated. Estos terminos describen de forma generica tecnicas de ablation de la direccion de rechazo aplicadas sobre un modelo afinado con alineamiento (RLHF/DPO u otros), cuyo objetivo es eliminar las respuestas de negativa o censura. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni detalles sobre el proceso concreto de abliteration. La etiqueta ara aparece en la lista de tags, pero su significado concreto en este contexto no se documenta.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dialogos multi-turno.
- Roleplay y juegos de rol con personajes, incluyendo escenarios de ficcion y narrativa persistente.
- ERP (erotic roleplay): contenido erotico y explicito para adultos, segun la propia ficha del modelo.
- Narrativa de terror, violencia y tematicas oscuras, tal como reflejan las etiquetas Horror y Violence.
- Respuestas sin rechazo (abliterated/uncensored) a peticiones que un modelo alineado rechazaria.
- Etiquetado como conversational, lo que implica soporte para intercambio de mensajes estilo chat.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles; el modelo solo declara ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion.

## Casos de uso

- Roleplay de ficcion para adultos: el modelo esta disenado para mantener personajes y tramas en conversaciones largas sin las negativas tipicas de un modelo alineado, lo que lo hace adecuado para novelas interactivas y juegos de rol por texto.
- Escritura creativa de genero oscuro: permite generar narrativa de terror, violencia explicita y tematicas adultas sin filtros editoriales, util para autores que trabajan genero extremo.
- Bots de personaje en plataformas de chat: su caracter conversational y su formato GGUF permiten desplegarlo en backends locales tipo llama.cpp para alimentar personajes virtuales persistentes.
- Investigacion sobre alineamiento y seguridad: al ser un modelo abliterated, sirve como referencia para estudiar como la ablation de la direccion de rechazo afecta a la coherencia, la utilidad y la seguridad del modelo en comparacion con su version alineada.
- Red teaming y evaluacion de guardrails: permite generar completaciones que un modelo censurado no produciria, util para probar clasificadores de contenido y sistemas de moderacion propios.
- Generacion de dialogos para videojuegos narrativos con clasificacion por edades para adultos: el modelo puede poblar NPC con respuestas variadas y sin restricciones tematicas cuando el titulo lo requiere.
- Prototipado de asistentes de rol local y privado: al ejecutarse totalmente en local con cuantizaciones pequenas, encaja en escenarios donde no se quiere enviar conversaciones sensibles a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada segun el tamano de los ficheros GGUF publicados (sin contar el overhead de contexto y de la cache KV):
  - Q2_K: 9,0 GB.
  - Q3_K_S: 10,5 GB; Q3_K_M: 11,6 GB; Q3_K_L: 12,5 GB.
  - IQ4_XS: 13,0 GB; Q4_K_S: 13,6 GB; Q4_K_M: 14,4 GB.
  - Q5_K_S: 16,4 GB; Q5_K_M: 16,9 GB.
  - Q6_K: 19,4 GB.
  - Q8_0: 25,2 GB.
  - F16: aproximadamente 47 GB (23,57 B de parametros a 2 bytes por parametro), coherente con un repositorio total de 161,4 GB que incluye todas las variantes.
- GPU de consumo: las cuantizaciones Q2_K, Q3_K e IQ4_XS caben en tarjetas de 12 a 16 GB (por ejemplo RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB) si se ajusta el contexto. Q4_K_M y Q5_K requieren 16 a 24 GB (RTX 4090, RTX 3090, A5000). Q6_K y Q8_0 necesitan 24 GB o mas y, para contexto largo, 32 GB o mas.
- GPU de datacenter: A100 de 40/80 GB, H100, L40S o similares para F16 y Q8_0 con contextos amplios o despliegues concurrentes.
- Opciones de despliegue: al ser GGUF, el entorno natural es llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, text-generation-webui con el backend llama.cpp). vLLM y TGI no son la via recomendada para GGUF: TGI trabaja con safetensors y vLLM tiene soporte GGUF parcial y limitado. Para explotar el modelo base en safetensors haria falta un runtime compatible con transformers.
- Latencia y throughput estimados: no disponibles; dependen del nivel de cuantizacion, del hardware y de la longitud de contexto, parametros que no se documentan.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye benchmarks ni especificaciones detalladas (arquitectura, contexto, licencia) que permitan una comparacion rigurosa y cuantitativa con otros modelos de roleplay sin censura de tamano similar. Los resultados de la busqueda web asociados a esta consulta no contienen referencias tecnicas a modelos comparables.

## Limitaciones y advertencias

- Modelo marcado como not-for-all-audiences: genera contenido sexual explicito, erotico, violento y de terror de forma deliberada. No es apto para menores ni para entornos no segmentados por edad.
- Sesgos conocidos: no documentados en la informacion disponible. Cabe esperar los sesgos del corpus del modelo base, agravados por la ausencia de filtros de rechazo.
- Riesgo de alucinacion: elevado en un modelo de este tamano y con este tipo de ajuste, especialmente en afirmaciones factuales; no hay benchmarks que permitan acotarlo.
- Limitacion de idioma: solo se declara ingles. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con conversaciones largas sin pruebas previas.
- Licencia: no declarada. La ausencia de licencia explicita impide asumir permiso de uso comercial; hay que contactar con el autor del modelo base y del repositorio de cuantizaciones antes de cualquier uso en produccion.
- Restricciones legales adicionales: el contenido generado (erotico, violento, abliterated) puede entrar en conflicto con las politicas de plataformas de publicacion, con normativa sobre contenido para adultos y con las condiciones de uso de servicios en la nube.
- Posible degradacion por abliteration: la ablation de la direccion de rechazo suele reducir la coherencia en tareas de razonamiento y aumentar la deriva tematica; conviene validar el comportamiento antes de integrarlo en flujos productivos.
- Sin soporte de tool calling ni de agentes confirmado, y sin datos de benchmarks: no es una opcion adecuada como modelo de proposito general en produccion mas alla del roleplay y la generacion creativa.
- Volumen de descargas bajo (215) y ausencia de likes: menor validacion por parte de la comunidad en comparacion con otros modelos populares.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-GGUF
- Repositorio de cuantizaciones con imatrix (i1-GGUF): https://huggingface.co/mradermacher/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-i1-GGUF
- Modelo base: https://huggingface.co/llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-GGUF
- Peticiones de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo y consisten en directorios de video para adultos, por lo que no se han incluido como fuentes tecnicas. No se han encontrado papers, blogs ni repositorios adicionales relevantes.
