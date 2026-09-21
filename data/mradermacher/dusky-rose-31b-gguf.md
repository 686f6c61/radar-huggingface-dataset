# mradermacher/Dusky-Rose-31B-GGUF

## Resumen

Dusky-Rose-31B-GGUF es la version cuantizada en formato GGUF del modelo Cyclone-Labs/Dusky-Rose-31B, publicada por el usuario mradermacher, especializado en la conversion de pesos a GGUF para inferencia local. Se trata de un modelo de ~30,7 mil millones de parametros (30.697.345.596 segun los safetensors del modelo original) orientado a roleplay, narrativa (storytelling) y conversacion, segun las etiquetas declaradas por el autor. El repositorio incluye ademas dos ficheros mmproj (proyector multimodal), lo que apunta a un componente de vision en el modelo de origen, aunque la model card no lo documenta explicitamente.

El modelo original no ha sido entrenado desde cero por mradermacher: segun las etiquetas, procede de una fusion de modelos realizada con mergekit, una tecnica habitual para combinar capacidades de varios modelos sin reentrenamiento. La ficha del repositorio GGUF no aporta informacion sobre arquitectura interna, longitud de contexto, composicion del dataset de entrenamiento ni proceso de alineamiento (RLHF/DPO), por lo que esos datos quedan como no disponibles.

La relevancia de esta publicacion es practica: convierte un modelo de 31B en una coleccion de 11 cuantizaciones (de Q2_K a Q8_0) que van de 12,0 GB a 32,7 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 4090 o en configuraciones de doble GPU. La licencia declarada es Apache 2.0 y el idioma soportado unicamente el ingles. A fecha de la informacion disponible, el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion comunitaria publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo resultante de una fusion con mergekit; no se especifica la arquitectura de los modelos de origen) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (12,0 GB), Q3_K_S (13,9 GB), Q3_K_M (15,4 GB), Q3_K_L (16,7 GB), IQ4_XS (17,0 GB), Q4_K_S (17,9 GB), Q4_K_M (18,8 GB), Q5_K_S (21,4 GB), Q5_K_M (21,9 GB), Q6_K (25,3 GB), Q8_0 (32,7 GB); mas mmproj-Q8_0 (0,9 GB) y mmproj-f16 (1,3 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors para transformers |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del modelo. Lo unico verificable es que el modelo base Cyclone-Labs/Dusky-Rose-31B se genero mediante mergekit, una herramienta de fusion de pesos que combina dos o mas modelos existentes (tipicamente mediante metodos como SLERP, TIES o DARE) sin realizar un entrenamiento adicional. Este enfoque suele emplearse para heredar capacidades complementarias, en este caso orientadas a roleplay y narracion. El numero de parametros (30,7 B) es coherente con un modelo denso de la familia de ~32B, pero no se confirma en la documentacion.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. El autor de la cuantizacion indica que se trata de cuantizaciones estaticas (static quants) y que no tiene previsto publicar variantes weighted/imatrix en el momento de la publicacion, lo que implica que no se ha aplicado una calibracion por importancia de pesos por capa.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en roleplay y storytelling (etiquetas `roleplay`, `storytelling` y `conversational`).
- Mantenimiento de conversaciones multi-turno con personajes y estilos narrativos, segun la orientacion del modelo base.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible` de HuggingFace).
- Soporte de un componente multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16) descritos como "multi-modal supplement", lo que sugiere capacidad de entrada visual en el modelo de origen; la model card no detalla que modalidad ni como activarla.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Motores de roleplay conversacional en local: el modelo esta etiquetado explicitamente para roleplay, por lo que puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con GPU de 24 GB usando Q4_K_M (18,8 GB) para mantener personajes con personalidad consistente durante sesiones largas.
- Ficcion interactiva y novelas visuales: la orientacion a storytelling permite generar continuaciones narrativas ramificadas a partir de elecciones del usuario, integrando el modelo como backend de texto en motores tipo Ren'Py o aplicaciones web.
- Guionizacion de dialogos para videojuegos: generacion de lineas de dialogo para NPC con tono y registro configurables mediante system prompt, aprovechando las variantes Q4_K_S/Q4_K_M marcadas por el autor como "fast, recommended" para iteracion rapida.
- Asistencia a escritores y guionistas: borradores de escenas, descripciones y arcos de personaje en ingles, con la ventaja de ejecucion local que evita enviar material creativo no publicado a servicios en la nube.
- Generacion de datasets sinteticos de dialogo: produccion de conversaciones etiquetadas para fine-tuning posterior de modelos mas pequenos orientados a roleplay, usando Q8_0 (32,7 GB) cuando la calidad de la muestra sea prioritaria sobre el coste de computo.
- Aplicaciones de compania conversacional y entretenimiento: chatbots de personaje para productos de consumo, desplegables con la variante Q2_K (12,0 GB) en GPUs de 16 GB si se acepta la perdida de calidad que el propio autor senala en sus graficos comparativos.
- Evaluacion de tecnicas de fusion de modelos: al ser un merge de mergekit con cuantizaciones publicas de referencia, sirve como caso de estudio reproducible para medir el impacto de la cuantizacion estatica sobre un modelo fusionado.
- Experimentacion en hardware de consumo sin conexion: las variantes IQ4_XS y Q4_K_S permiten ejecutar un modelo de ~31B en una unica RTX 3090 o RTX 4090 con contexto moderado, algo inviable con pesos en f16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el autor unicamente remite a graficos genericos de perplejidad por tipo de cuantizacion elaborados por terceros (ikawrakow y Artefact2), que no son especificos de este modelo.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones a partir del tamano de fichero declarado en la tabla de cuantizaciones del repositorio, anadiendo un margen aproximado para el contexto y el runtime (los pesos ocupan el tamano indicado, pero la cache KV y el overhead de llama.cpp incrementan el consumo):

- VRAM estimada para inferencia:
  - Q2_K (12,0 GB): ~13-15 GB de VRAM con contexto corto.
  - Q3_K_M (15,4 GB) / Q3_K_L (16,7 GB): ~17-19 GB.
  - IQ4_XS (17,0 GB) / Q4_K_S (17,9 GB) / Q4_K_M (18,8 GB): ~20-23 GB.
  - Q5_K_S (21,4 GB) / Q5_K_M (21,9 GB): ~24-27 GB.
  - Q6_K (25,3 GB): ~28-31 GB.
  - Q8_0 (32,7 GB): ~36-40 GB.
  - Los ficheros mmproj son complementos del componente multimodal (0,9 GB y 1,3 GB) y se suman al consumo si se activa la vision.
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_S, Q4_K_M e IQ4_XS; Q5 requiere ajustar contexto o dividir capas con CPU.
  - Profesional: A100 40 GB o L40S 48 GB para Q5 y Q6_K con contexto amplio; A100 80 GB o H100 80 GB para Q8_0.
  - Configuraciones multi-GPU: dos GPU de 24 GB permiten Q6_K y Q8_0 repartiendo capas entre dispositivos.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, limitado a Q2_K/Q3_K_S) y tarjetas de 16 GB en general con las cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui para el formato GGUF; el modelo base en safetensors se usa con transformers (el soporte de GGUF en vLLM es experimental y sujeto a limitaciones). Para servidores compatibles con endpoints, la etiqueta `endpoints_compatible` indica que el repositorio es apto para ese tipo de integracion, aunque no se detalla la configuracion.
- Latencia y throughput estimados: no disponible. No se han publicado medidas de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos alternativos identificados en la informacion proporcionada, ni de datos de rendimiento comparables. La model card no cita modelos de referencia, no incluye benchmarks y el propio repositorio base no aparece acompanado de comparativas. Los resultados de busqueda web consultados no contienen informacion relevante sobre este modelo ni sobre modelos comparables (los resultados obtenidos tratan sobre dispositivos sanitarios conectados y no guardan relacion con el objeto de esta ficha).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| Dusky-Rose-31B-GGUF (mradermacher) | ~30,7 B | no disponible | apache-2.0 | GGUF, 11 cuantizaciones | no disponibles |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay metrica objetiva publicada, por lo que la calidad real del modelo en tareas de razonamiento, codigo o matematicas no puede evaluarse a partir de la informacion disponible. La orientacion declarada es creativa (roleplay y narrativa), no tecnica.
- Riesgo de alucinacion: al ser un modelo de generacion de texto sin datos de alineamiento documentados, no se puede descartar la invencion de hechos, especialmente si se usa fuera de su dominio previsto.
- Sesgos conocidos: no disponible. La model card no incluye ninguna seccion de sesgos, consideraciones eticas ni limitaciones declaradas por el autor.
- Limitacion idiomatica: el campo `language` indica unicamente ingles (`en`). El rendimiento en castellano no esta garantizado ni documentado.
- Limitacion de contexto: la longitud de contexto no se especifica, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Degradacion por cuantizacion: el propio autor marca Q3_K_M como "lower quality" y publica grafos que muestran mayor perplejidad en las cuantizaciones bajas (Q2_K, Q3_K_S). Para uso en produccion se recomienda Q4_K_M o superior.
- Ausencia de cuantizaciones weighted/imatrix: el autor indica que estas variantes no estan disponibles ni planificadas de momento, lo que puede penalizar la calidad respecto a cuantizaciones calibradas.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes, sin discusiones publicas que permitan contrastar su comportamiento real.
- Licencia: el repositorio declara apache-2.0, lo que permite uso comercial. No obstante, al tratarse de una fusion de modelos de terceros, conviene verificar las licencias de los modelos de origen del merge antes de un despliegue comercial, ya que las restricciones de los componentes podrian no quedar cubiertas por la licencia del modelo fusionado.
- Inconsistencia de metadatos: la fecha de creacion declarada (2026-09-21) resulta anomala y no se corresponde con el estado del repositorio (0 descargas), lo que sugiere un error de metadatos o una publicacion muy reciente sin difusion.
- Componente multimodal sin documentar: la presencia de ficheros `mmproj` no viene acompanada de instrucciones de uso, ejemplos ni confirmacion de que el modelo base acepte realmente entradas de imagen.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/Dusky-Rose-31B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Dusky-Rose-31B
- Pagina de resumen y lista de descargas del autor: https://hf.tst.eu/model#Dusky-Rose-31B-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia al autor de las cuantizaciones: https://www.nethype.de/

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo, su modelo base, papers asociados ni demos. Todos los enlaces listados proceden de la model card del repositorio.
