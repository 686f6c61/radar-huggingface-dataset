# mradermacher/Spark-X2.6-1.7B-Uncensored-Peymandc-GGUF

## Resumen

Spark-X2.6-1.7B-Uncensored-Peymandc-GGUF es la version cuantizada en formato GGUF del modelo Peymandc/Spark-X2.6-1.7B-Uncensored-Peymandc, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de 1.707.657.216 parametros (aproximadamente 1,7 mil millones) derivado de la familia Spark-X2.6, con un proceso de "abliteration" o decensurado que elimina las capas de rechazo del modelo original. La cuantizacion la realiza mradermacher de forma automatica a partir de los pesos en formato Hugging Face.

El modelo esta pensado para ejecucion local en hardware modesto, gracias a su reducido tamano y a la disponibilidad de cuantizaciones desde Q2_K (0,9 GB) hasta f16 (3,5 GB). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para prototipado rapido y despliegues en entornos con recursos limitados.

La relevancia de esta ficha radica en que combina tres caracteristicas poco habituales: tamano pequeno, licencia permisiva y ausencia de filtros de rechazo. Sin embargo, la informacion tecnica publicada por el autor es muy escasa: no se detallan la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como llm; sin detalles de transformer, MoE o hibrida) |
| Parametros totales | 1.707.657.216 (1,7 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. La model card del repositorio cuantizado no describe si se trata de un transformer denso, un modelo con atencion lineal o una arquitectura hibrida. El tag "sparkx2_5" sugiere pertenencia a la familia Spark-X2.5/X2.6, pero no se aportan especificaciones tecnicas al respecto.

Respecto al entrenamiento, la unica informacion disponible es que el modelo ha pasado por un proceso de "abliteration" o decensurado (tags: heretic, uncensored, decensored, abliterated, reproducible). Este proceso consiste habitualmente en modificar o eliminar las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder ciertos tipos de contenido. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles y chino, segun los idiomas declarados.
- Respuesta sin filtros de rechazo (uncensored/abliterated), lo que permite abordar tematicas que otros modelos rechazarian.
- Conversacion multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integracion en servicios de inferencia.
- Reproducibilidad declarada (tag "reproducible").
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Prototipado local en equipos de desarrollo: con cuantizaciones Q4_K_M de 1,2 GB, el modelo puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que permite iterar rapidamente sobre prompts y flujos conversacionales.
- Generacion de texto creativo sin restricciones: el proceso de abliteration elimina los rechazos, lo que resulta util para escritura de ficcion, guiones o narrativa que aborde temas sensibles sin interrupciones del modelo.
- Chatbots de dominio especifico en ingles o chino: su tamano reducido permite desplegar multiples instancias en un solo servidor para atender conversaciones concurrentes con latencia baja.
- Experimentacion en investigacion sobre alineacion y seguridad: al ser un modelo decensurado con licencia Apache 2.0, sirve como caso de estudio para analizar como el abliteration afecta al comportamiento y a los sesgos del modelo original.
- Despliegue en entornos con recursos limitados (edge computing, Raspberry Pi, contenedores pequenos): las cuantizaciones Q2_K y Q3_K caben en menos de 1 GB de RAM, lo que permite inferencia en dispositivos de gama baja.
- Generacion de datos sinteticos para fine-tuning: el modelo puede producir grandes volumenes de texto en ingles y chino a bajo coste computacional, util para aumentar datasets de entrenamiento de modelos mayores.
- Traduccion informal ingles-chino en pipelines internos: aunque no se documenta calidad de traduccion, el soporte bilingue permite usarlo como paso intermedio en flujos de preprocesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~0,9 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~0,9-1,1 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~1,1-1,2 GB
  - Q5_K_S / Q5_K_M: ~1,3-1,4 GB
  - Q6_K: ~1,5 GB
  - Q8_0: ~1,9 GB
  - f16: ~3,5 GB
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para cuantizaciones Q4; una RTX 3060, RTX 4060 o superior permite ejecutar Q8_0 o f16 con holgura. Para f16 en GPU dedicada basta con una GTX 1650 de 4 GB o similar.
- Cabe en GPU consumer: si, practicamente cualquier GPU moderna e incluso iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Tambien puede usarse con transformers cargando el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Uncensored-Peymandc-GGUF | 1,7 B | no disponible | Apache 2.0 | GGUF | Decensurado, bilingue en/zh |
| Modelos de ~1-2 B de proposito general (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-2 B | 32k-128k (segun modelo) | Apache 2.0 / Llama | safetensors, GGUF | No disponibles en esta ficha con datos verificados; se citan como referencia de categoria |
| Modelos uncensored de ~1-3 B en GGUF (familia Dolphin, Hermes) | 1-3 B | variable | Apache 2.0 / otros | GGUF | Alternativas de la misma categoria; sin datos de rendimiento comparables en la informacion disponible |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa fiable con estos modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o codigo, por lo que no se recomienda para tareas de produccion que requieran precision verificada.
- Riesgo elevado de alucinacion: los modelos de 1,7 B parametros sin datos de entrenamiento documentados tienden a inventar hechos, especialmente en dominios especializados.
- El proceso de abliteration puede degradar capacidades generales: eliminar las capas de rechazo suele afectar a la coherencia y a la utilidad del modelo en tareas benignas.
- Contenido sin filtros: el modelo puede generar material ofensivo, ilegal o danino; el despliegue debe acompanarse de moderacion externa si se expone a usuarios finales.
- Sesgos desconocidos: no se documenta la composicion del dataset, por lo que no es posible evaluar sesgos de genero, raza o ideologia.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto no documentado: se desconoce la ventana maxima, lo que impide planificar casos de uso con documentos largos.
- Aunque la licencia Apache 2.0 permite uso comercial, el contenido generado puede infringir normativas locales; la responsabilidad recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Uncensored-Peymandc-GGUF
- Modelo base: https://huggingface.co/Peymandc/Spark-X2.6-1.7B-Uncensored-Peymandc
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Uncensored-Peymandc-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Spark-X2.6-1.7B-Uncensored-Peymandc-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
