# mradermacher/Rabt-1.0-2B-GGUF

## Resumen

Rabt-1.0-2B es un modelo de lenguaje de aproximadamente 1.940 millones de parametros (1.942.653.248 segun los pesos en safetensors) desarrollado originalmente por 4waiz y publicado bajo el paraguas de kanban-studios. Su proposito declarado es actuar como asistente personal local-first, con enfasis en privacidad, uso de herramientas (tool calling) y flujo con intervencion humana (human-in-the-loop). La version aqui documentada es la cuantizacion GGUF realizada por mradermacher, que la hace desplegable en entornos con recursos limitados mediante llama.cpp y Ollama.

El modelo se presenta como multilingue, con soporte declarado de ingles, arabe, frances, hindi y urdu, lo que lo orienta a un publico amplio que incluye regiones donde el arabe y el urdu son lenguas de uso cotidiano. Se trata de un ajuste fino con QLoRA sobre una base de 2B, lo que lo situa en la categoria de modelos pequenos orientados a tareas de agente y asistencia conversacional mas que a razonamiento de alta complejidad.

La relevancia actual de esta ficha reside en que combina un tamano reducido (apto para GPU de consumo), licencia Apache 2.0 permisiva y un conjunto de cuantizaciones GGUF estaticas e imatrix, lo que facilita su integracion en pipelines de despliegue local sin depender de servicios en la nube. No obstante, la informacion publica disponible sobre arquitectura detallada, datos de entrenamiento y benchmarks es muy escasa, lo que limita la evaluacion objetiva de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 2B ajustado con QLoRA; detalles no publicados) |
| Parametros totales | 1.942.653.248 (aprox. 1,94B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 (suplemento multimodal) y variantes imatrix en repositorio separado |
| Idiomas soportados | en, ar, fr, hi, ur |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo base) y GGUF (esta version cuantizada) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (numero de capas, dimension del modelo, mecanismo de atencion, tipo de tokenizador, etc.). El modelo card indica que el ajuste se realizo mediante QLoRA sobre una base de 2B, y que el resultado se distribuye como modelo conversacional con soporte de tool use y human-in-the-loop. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

Como innovaciones tecnicas destacables en la informacion proporcionada solo consta la existencia de un suplemento multimodal (archivos mmproj en f16 y Q8_0), lo que sugiere capacidades de vision, aunque no se detalla el codificador visual ni el alcance de dicha modalidad. Tampoco se documentan tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1), generando cuantizaciones estaticas y una variante imatrix en un repositorio aparte.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a asistencia personal.
- Uso de herramientas (tool calling / function calling), segun las etiquetas del modelo.
- Soporte de flujos de agente con intervencion humana (human-in-the-loop).
- Capacidades multilingues declaradas en ingles, arabe, frances, hindi y urdu.
- Soporte multimodal segun los archivos mmproj incluidos (vision; alcance no detallado).
- Orientacion a despliegue local-first y privacidad, con compatibilidad con endpoints y Ollama.
- No se documentan capacidades especificas de razonamiento matematico avanzado, generacion de codigo de alto nivel ni modo de pensamiento explicito (thinking mode).

## Casos de uso

- Asistente personal local: el modelo puede gestionar conversaciones multi-turno en el dispositivo del usuario, manteniendo los datos en local gracias a su enfoque local-first y su despliegue via Ollama o llama.cpp, lo que encaja con requisitos de privacidad.
- Atencion al cliente en arabe, urdu o hindi: su soporte multilingue declarado permite atender consultas en estos idiomas sin recurrir a traduccion intermedia, adecuado para mercados de Oriente Medio y Asia del Sur.
- Automatizacion con herramientas: el soporte de tool calling permite conectarlo a APIs internas (calendario, correo, bases de datos) para ejecutar acciones estructuradas en flujos de agente.
- Flujos con aprobacion humana: el enfoque human-in-the-loop lo hace util para tareas donde el modelo propone acciones y un operador las valida antes de ejecutarlas, como en gestion de incidencias o tramitacion de solicitudes.
- Prototipado rapido en GPU de consumo: con cuantizaciones Q4_K_M de 1,4 GB, permite iterar en local en portatiles o estaciones con GPU modesta antes de escalar a un modelo mayor.
- Extraccion y clasificacion de informacion en varios idiomas: puede usarse para etiquetar, resumir o enrutar textos en los cinco idiomas soportados dentro de pipelines de procesamiento documental.
- Asistencia en entornos con conectividad limitada: al ser desplegable en local y con pesos de pocos GB, resulta viable en escenarios de campo o sistemas aislados donde no se dispone de acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,4 GB para cuantizaciones Q2_K a Q4_K_M; 1,5-1,7 GB para Q5-Q6; 2,2 GB para Q8_0; 4,0 GB para f16. Los archivos mmproj anaden entre 0,5 y 0,8 GB si se usa la modalidad multimodal.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 quedan sobradamente cubiertas para este tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna e incluso en CPU mediante llama.cpp con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta ollama presente), y compatibilidad con endpoints; el modelo base es de transformers, por lo que tambien puede servirse con TGI o vLLM si se dispone de los pesos safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rabt-1.0-2B (esta ficha) | 1,94B | no disponible | Apache 2.0 | safetensors, GGUF | Asistente local multilingue con tool use y human-in-the-loop |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Referencia comun para asistentes pequenos; datos de contexto y benchmarks publicos |
| Llama 3.2 1B Instruct | 1,2B | 128K (segun su model card publica) | Llama 3.2 Community License | safetensors, GGUF | Multilingue oficial, con benchmarks publicados |
| Gemma 2 2B | 2,6B | 8K (segun su model card publica) | Gemma Terms of Use | safetensors, GGUF | Alternativa de Google con restricciones de licencia distintas |

La comparativa se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento publicados para Rabt-1.0-2B que permitan contrastar benchmarks de forma fiable.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no es posible validar su calidad frente a alternativas de tamano similar, lo que desaconseja su uso en produccion sin evaluacion propia.
- Riesgo de alucinacion: como modelo de 2B, la fidelidad factual es limitada y puede inventar datos, especialmente en tareas de razonamiento complejo o con contexto largo.
- Longitud de contexto no documentada: no se conoce la ventana real, por lo que conviene probarla empiricamente antes de disenar flujos con conversaciones largas.
- Cobertura idiomatica no verificada: los cinco idiomas declarados (en, ar, fr, hi, ur) no cuentan con evaluaciones publicadas; el rendimiento en arabe, hindi y urdu puede ser desigual.
- Sesgos no documentados: no se describe la composicion del dataset de entrenamiento ni se detallan sesgos conocidos.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar la procedencia de los datos de entrenamiento del modelo base y del ajuste QLoRA.
- Modalidad multimodal sin detalle: los archivos mmproj indican vision, pero no se especifica el codificador ni la resolucion o el alcance de las imagenes soportadas.
- Fecha de creacion futura en los metadatos (2026): conviene tratar las fechas del repositorio con cautela y verificar la version exacta antes de desplegar.

## Enlaces

- Repositorio Hugging Face (esta version GGUF): https://huggingface.co/mradermacher/Rabt-1.0-2B-GGUF
- Modelo base: https://huggingface.co/4waiz/Rabt-1.0-2B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Rabt-1.0-2B-i1-GGUF
- Pagina de descarga del cuantizador: https://hf.tst.eu/model#Rabt-1.0-2B-GGUF
- Guia de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
