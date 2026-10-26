# mradermacher/G4-LuneLight-31B-GGUF

## Resumen

G4-LuneLight-31B-GGUF es un repositorio de cuantizaciones GGUF publicadas por mradermacher a partir del modelo zerofata/G4-LuneLight-31B, un modelo de 30.697.345.596 parámetros (unos 30,7 mil millones) orientado a uso conversacional y etiquetado únicamente en inglés. El repositorio no contiene pesos originales en safetensors, sino conversiones a formato GGUF en distintas precisiones (desde Q2_K hasta Q8_0), pensadas para inferencia local con llama.cpp y herramientas compatibles. Su relevancia es práctica: permite ejecutar un modelo de escala 30B en hardware de consumo o en una sola GPU de 24-48 GB según la cuantización elegida.

El autor del repositorio actúa solo como cuantizador; la model card es una plantilla estándar de mradermacher y no aporta información sobre arquitectura, datos de entrenamiento ni resultados de evaluación. Toda la información técnica del modelo base (contexto, composición del dataset, ajuste fino) queda fuera de este repositorio y no está disponible en la documentación proporcionada.

Un detalle relevante es la presencia de ficheros `mmproj` (Q8_0 de 0,9 GB y f16 de 1,3 GB), que en el ecosistema GGUF acompañan a proyecciones multimodales: esto sugiere que el modelo base incorpora capacidad de visión, aunque la model card no lo confirma explícitamente. Con cero descargas y cero likes en el momento de la consulta, se trata de una publicación reciente (creada el 26 de octubre de 2026) sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no describe la arquitectura del modelo base; el repo solo distribuye la conversion GGUF) |
| Parametros totales | 30.697.345.596 (~30,7 B), segun safetensors del modelo base |
| Parametros activos | No disponible; no hay indicios de que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K (12,0 GB), Q3_K_S (13,9 GB), Q3_K_M (15,4 GB), Q3_K_L (16,7 GB), IQ4_XS (17,0 GB), Q4_K_S (17,9 GB), Q4_K_M (18,8 GB), Q5_K_S (21,4 GB), Q5_K_M (21,9 GB), Q6_K (25,3 GB), Q8_0 (32,7 GB); ademas mmproj Q8_0 (0,9 GB) y mmproj f16 (1,3 GB) |
| Idiomas soportados | Ingles (unico idioma declarado en la etiqueta `language`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors via transformers |
| Cuantizador | mradermacher |
| Modelo base | zerofata/G4-LuneLight-31B |
| Variante con imatrix | mradermacher/G4-LuneLight-31B-i1-GGUF |
| Tamano del repositorio | 213,9 GB (incluye todas las cuantizaciones) |
| Fecha de creacion | 2026-10-26 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base en la documentacion proporcionada. La model card del repositorio GGUF es una plantilla generica de cuantizacion que solo documenta los ficheros producidos, el tipo de conversion (`convert_type: hf`) y el numero de version de cuantizacion (`quantize_version: 2`, `output_tensor_quantised: 1`). No se detalla si el modelo original emplea un transformer denso, una mezcla de expertos, atencion lineal o cualquier otra variante, ni se indica el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF, DPO o ajuste con datos conversacionales.

La unica innovacion tecnica documentada es de proceso, no de modelado: la publicacion de cuantizaciones estaticas en once precisiones distintas mas una variante i1 con pesos imatrix en un repositorio separado. La presencia de los ficheros `mmproj` indica que la conversion contempla un modulo de proyeccion multimodal (vision), pero se desconoce el codificador visual y la resolucion de imagen soportada.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio y el formato GGUF apuntan a un uso de chat multi-turno, aunque no se documenta el template exacto de prompts.
- Capacidad multimodal probable: la inclusion de proyecciones `mmproj-Q8_0` y `mmproj-f16` sugiere soporte de entrada de imagenes (vision), extremo no confirmado por la model card.
- Multilingue: no. El unico idioma declarado es el ingles.
- Razonamiento, codigo y matematicas: no documentado; sin benchmarks ni ejemplos publicados no es posible confirmar ni descartar estas capacidades.
- Tool calling / function calling: no disponible. Ni la model card ni las etiquetas mencionan soporte de herramientas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Audio: no disponible; no se distribuyen ficheros de proyeccion de audio.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el formato puede desplegarse en la infraestructura de Hugging Face Inference Endpoints.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (18,8 GB) el modelo puede ejecutarse en una RTX 4090 de 24 GB y usarse para iterar sobre prompts y flujos de chat sin coste de API, siempre que se valide primero la calidad real del modelo base.
- Evaluacion comparativa de un modelo de 30B frente a alternativas ya validadas: util para equipos de investigacion que quieran medir perplejidad, latencia y calidad subjetiva de las distintas cuantizaciones (de Q2_K a Q8_0) sobre el mismo modelo en un mismo hardware.
- Despliegue en hardware limitado con cuantizaciones agresivas: Q2_K (12,0 GB) permite montar el modelo en una GPU de 16 GB o en una configuracion CPU+GPU mediante offloading parcial en llama.cpp, a costa de una perdida de calidad no cuantificada.
- Procesamiento por lotes de texto en ingles en servidores sin GPU de gama alta: la version Q5_K_M (21,9 GB) cabe en una A100 40 GB o en dos RTX 3090, y puede servir para tareas de resumen o clasificacion si se valida previamente su rendimiento.
- Base para pruebas de integracion con llama.cpp, Ollama o llama-cpp-python: el repositorio ofrece todos los formatos necesarios para verificar pipelines de inferencia antes de comprometerse con un modelo mayor.
- Experimentacion multimodal (condicional): si se confirma la funcion de vision, el par de ficheros `mmproj` permite alimentar imagenes junto a texto en clientes GGUF compatibles; requiere verificacion manual dado que la model card no lo documenta.
- Fine-tuning no aplicable directamente sobre GGUF: este repositorio no es la via adecuada para reentrenamiento; para ello habria que partir del modelo base zerofata/G4-LuneLight-31B en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada de inferencia (fichero + cache KV y overhead, sin contexto muy largo): Q2_K ~13-15 GB; Q3_K_S ~15-16 GB; IQ4_XS ~18-19 GB; Q4_K_S ~19-20 GB; Q4_K_M ~20-22 GB; Q5_K_M ~23-25 GB; Q6_K ~27-29 GB; Q8_0 ~34-36 GB. Son estimaciones a partir del tamano de fichero publicado; el autor no proporciona cifras oficiales.
- GPU consumer: Q4_K_M (18,8 GB) entra ajustadamente en una RTX 4090 (24 GB) o en una RTX 3090 (24 GB); las cuantizaciones Q2_K y Q3_K_S son las opciones realistas para GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con contexto corto.
- GPU profesional: Q8_0 (32,7 GB) requiere una A100 40 GB, L40S 48 GB o H100; Q6_K y Q5_K_M encajan en A100 40 GB.
- Configuraciones multi-GPU: dos RTX 3090/4090 (48 GB combinados) permiten ejecutar Q8_0 con contexto amplio mediante tensor split en llama.cpp.
- Solo CPU: viable con Q2_K/Q3_K_S en equipos con 16-32 GB de RAM a velocidades muy bajas; no se dispone de mediciones de tokens/s.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF mediante Modelfile), LM Studio, llama-cpp-python, text-generation-webui y koboldcpp. vLLM y TGI tienen soporte limitado o nulo para pesos GGUF, por lo que para servir en produccion a gran escala convendria partir del modelo base en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| mradermacher/G4-LuneLight-31B-GGUF | ~30,7 B | No disponible | GGUF (11 cuantizaciones + mmproj) | Apache 2.0 | Ingles | Objeto de esta ficha; sin benchmarks ni descargas |
| zerofata/G4-LuneLight-31B (modelo base) | ~30,7 B | No disponible | safetensors | Apache 2.0 | Ingles | Fuente de las cuantizaciones; unico punto de partida para reentrenar o servir con vLLM |
| mradermacher/Lucent-Witch-31B-i1-GGUF | ~31 B (segun nombre) | No disponible | GGUF con imatrix | Apache 2.0 | Ingles | Cuantizacion de un merge orientado a roleplay y narrativa; misma escala y mismo cuantizador |
| Otras alternativas de ~30B en GGUF | No disponible | No disponible | GGUF | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no describe arquitectura, datos de entrenamiento, contexto ni comportamiento esperado, lo que impide evaluar su idoneidad para produccion.
- Sin benchmarks ni evaluaciones publicadas: no hay forma de comparar su calidad con alternativas consolidadas sin realizar una evaluacion propia.
- Cero descargas y cero likes: no existe validacion de la comunidad; el repositorio es de creacion muy reciente y podria cambiar o desaparecer.
- Modelo base de origen incierto: `zerofata/G4-LuneLight-31B` no aporta informacion verificable en la documentacion suministrada; se desconoce si es un modelo entrenado desde cero, un ajuste fino o un merge.
- Idioma unico: solo se declara ingles; el rendimiento en castellano es impredecible y no esta documentado.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala y no cuantificado en este caso por falta de evaluaciones.
- Sesgos: no documentados. Al no conocerse la composicion del dataset de entrenamiento, no es posible estimar sesgos de genero, raza, ideologia o dominio.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero conviene verificar que el modelo base mantiene efectivamente esa licencia, ya que la informacion de `zerofata/G4-LuneLight-31B` no se ha podido contrastar aqui.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan la calidad de forma notable en modelos de 30B; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- Multimodalidad sin confirmar: los ficheros `mmproj` apuntan a vision, pero no hay documentacion del codificador ni de resoluciones soportadas; no debe asumirse en produccion sin pruebas.
- No apto para fine-tuning directo: al ser un repositorio GGUF, no es la via adecuada para reentrenar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/G4-LuneLight-31B-GGUF
- Modelo base: https://huggingface.co/zerofata/G4-LuneLight-31B
- Cuantizaciones con imatrix (i1): https://huggingface.co/mradermacher/G4-LuneLight-31B-i1-GGUF
- Pagina de descargas del cuantizador para este modelo: https://hf.tst.eu/model#G4-LuneLight-31B-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de calidad por tipo de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Modelo comparable del mismo autor: https://huggingface.co/mradermacher/Lucent-Witch-31B-i1-GGUF
- Patrocinador del cuantizador: https://www.nethype.de/
