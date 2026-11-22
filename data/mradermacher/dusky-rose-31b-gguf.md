# mradermacher/Dusky-Rose-31B-GGUF

## Resumen

Dusky-Rose-31B-GGUF es la distribucion en formato GGUF del modelo Dusky-Rose-31B, desarrollado por Cyclone-Labs y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 30.700 millones de parametros, orientado explicitamente a roleplay y narrativa (storytelling), segun las etiquetas de su model card. La relevancia de esta publicacion no reside en el modelo original, sino en la disponibilidad de cuantizaciones estaticas en GGUF que permiten ejecutarlo en hardware de consumo mediante llama.cpp y ecosistemas compatibles.

El modelo base es un merge generado con mergekit, lo que implica que combina pesos de otros modelos en lugar de haber sido entrenado desde cero con un pipeline documentado. Esta circunstancia condiciona buena parte de la informacion disponible: no hay datos publicados sobre composicion del dataset, numero de tokens de entrenamiento ni proceso de alineacion (RLHF/DPO).

La licencia declarada es Apache 2.0 y el unico idioma soportado es el ingles. El repositorio incluye cuantizaciones desde Q2_K hasta Q8_0, ademas de ficheros mmproj que apuntan a un componente multimodal, aunque la model card no detalla las capacidades de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base generado con mergekit; no se detalla la arquitectura subyacente) |
| Parametros totales | 30.697.345.596 (aprox. 30,7 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo mas alla de que el modelo base (Cyclone-Labs/Dusky-Rose-31B) fue producido mediante mergekit, una herramienta de fusion de pesos. Las etiquetas del repositorio confirman `mergekit` y `merge`, lo que indica que el modelo resulta de combinar los pesos de otros modelos preentrenados, presumiblemente con el objetivo de especializarlo en roleplay y narrativa.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre procesos de RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion la realiza mradermacher con su pipeline habitual (quantize_version 2, conversion a HF), generando variantes estaticas; las cuantizaciones ponderadas con imatrix se publican en un repositorio separado (Dusky-Rose-31B-i1-GGUF).

## Capacidades

- Generacion de texto conversacional orientada a roleplay y narrativa, segun la model card.
- Storytelling: continuacion y construccion de relatos, segun las etiquetas del modelo.
- Conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Presencia de ficheros mmproj, lo que sugiere soporte de entrada multimodal en el modelo base, aunque las capacidades concretas de vision no estan documentadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.

## Casos de uso

- Roleplay conversacional: el modelo esta etiquetado explicitamente para roleplay, por lo que puede emplearse en aplicaciones de personajes interactivos donde se mantengan conversaciones prolongadas con consistencia de personaje.
- Generacion de narrativa y ficcion: adecuado para asistir en la escritura de relatos, continuar tramas o generar variantes de escenas, dado su enfoque en storytelling.
- Prototipado de chatbots de entretenimiento: las cuantizaciones Q4_K_S y Q4_K_M (17,9 y 18,8 GB) permiten desplegar el modelo en estaciones de trabajo con GPU de consumo para pruebas de concepto.
- Experimentacion con modelos fusionados: util para investigadores interesados en evaluar el comportamiento de merges de mergekit en tareas creativas frente a modelos entrenados de forma convencional.
- Despliegue local con llama.cpp: al estar en GGUF, puede integrarse en aplicaciones de escritorio o servidores ligeros mediante llama.cpp u Ollama, sin depender de infraestructura en la nube.
- Generacion de dialogos para videojuegos o narrativa interactiva: el sesgo hacia roleplay lo hace candidato para motores de dialogo en prototipos de juegos narrativos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del fichero GGUF mas overhead de contexto):
  - Q2_K: unos 12 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: entre 14 y 17 GB.
  - IQ4_XS: unos 17 GB.
  - Q4_K_S / Q4_K_M: entre 18 y 19 GB.
  - Q5_K_S / Q5_K_M: entre 21 y 22 GB.
  - Q6_K: unos 25 GB.
  - Q8_0: unos 33 GB.
- GPU recomendadas: para Q4_K_M en adelante, GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100). Para Q2_K y Q3, GPU de 16 GB podrian ser suficientes con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o Q5 y contexto moderado; las cuantizaciones Q6 y Q8 requieren 32 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el repositorio tambien declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dusky-Rose-31B-GGUF | 30,7 B | no disponible | Apache 2.0 | GGUF | Merge orientado a roleplay/storytelling |
| Modelo base Cyclone-Labs/Dusky-Rose-31B | 30,7 B | no disponible | Apache 2.0 | safetensors | Origen del merge |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo resultante de un merge con mergekit: no hay documentacion sobre el proceso de entrenamiento ni sobre los datos utilizados, lo que dificulta evaluar sesgos y calidad de forma sistematica.
- Solo soporta ingles; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano, sin datos publicados que lo cuantifiquen.
- No hay benchmarks publicados, por lo que no es posible comparar su rendimiento de forma objetiva con alternativas.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de un merge cuyos componentes originales no se detallan, conviene verificar las licencias de los modelos fusionados antes de un despliegue en produccion.
- Las capacidades multimodales sugeridas por los ficheros mmproj no estan documentadas; no deben asumirse en produccion sin validacion.
- El modelo esta especializado en roleplay y narrativa; su uso para tareas tecnicas (codigo, matematicas, razonamiento formal) no esta respaldado por datos.
- El repositorio ocupa 213,9 GB, lo que implica descargas considerables si se quieren varias cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dusky-Rose-31B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Dusky-Rose-31B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Dusky-Rose-31B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Dusky-Rose-31B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
