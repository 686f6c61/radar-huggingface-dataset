# Devopsopraiz/Baanzon-33street-3.8-27B-Uncensored-Aggresive-MTP-GGUF

## Resumen

Baanzon 33STREET 3.8-27B Uncensored Aggressive MTP (GGUF) es una distribucion cuantizada en formato GGUF de un modelo vision-lenguaje que el autor presenta como de 27B, publicado por el usuario Devopsopraiz bajo la marca 33STREET. El autor declara que deriva de Qwen/Qwen3.8-27B y que incorpora un perfil de comportamiento «sin censura» y agresivo, disenado para minimizar rechazos y adoptar un tono directo y combativo. Se distribuye junto con un proyector de vision (mmproj) y con una variante FastMTP de 32K para decodificacion especulativa basada en prediccion multi-token (MTP) en llama.cpp.

El modelo se anuncia con una ventana de contexto de 262.144 tokens, soporte multilingue (ingles, chino y otros idiomas) y un juego de cuantizaciones que va desde IQ2_M (9,8 GB) hasta Q8_K_P (30 GB), lo que en teoria permite ejecutarlo en GPU de gama consumer de 16 a 24 GB. Su interes practico esta en el nicho de despliegue local: combina entrada de imagen y texto con inferencia acelerada y sin capa de alineacion de seguridad.

La informacion publicada es, sin embargo, contradictoria: el repositorio se anuncia como 27B, pero el recuento de parametros disponible en safetensors es de 1.863.907.840 (aproximadamente 1,86 B), y no hay verificacion publica de la existencia del modelo base Qwen/Qwen3.8-27B. Ademas, las fichas de HuggingFace indican 50 descargas y 0 likes, y la busqueda web no ha devuelto documentacion tecnica asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. Se describe como modelo vision-lenguaje con cabezas de prediccion multi-token (MTP); el autor lo deriva de Qwen/Qwen3.8-27B |
| Parametros totales | Dato contradictorio: 27B segun la denominacion del autor; 1.863.907.840 (~1,86 B) segun el recuento real de safetensors declarado en la ficha |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens; existe una variante FastMTP ajustada a 32K |
| Tipos de cuantizacion | IQ2_M, Q2_K_P, IQ3_XS, IQ3_M, Q3_K_P, IQ4_XS, Q4_K_P, Q5_K_P, Q6_K_P, Q8_K_P; proyector de vision en BF16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo principal, proyector mmproj y variante FastMTP); no se publican pesos safetensors |
| Tamano del repositorio | 172,5 GB |
| Pipeline declarado | image-text-to-text |
| Variantes incluidas | Modelo principal cuantizado, mmproj BF16 (0,89 GB), FastMTP 32K (0,86 GB), SYSTEM-PROMPT.txt y Modelfile de Ollama |
| Fecha de publicacion | 2026-09-22 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo unico que se afirma es que se trata de una variante «uncensored» derivada del supuesto modelo base Qwen/Qwen3.8-27B, sin capa de alineacion de seguridad, y que el resultado se ha cuantizado a GGUF. No se especifica si la modificacion de comportamiento procede de un fine-tuning, de un ajuste de preferencias o de una simple reconfiguracion del prompt de sistema.

La innovacion tecnica destacada es el uso de prediccion multi-token (MTP) como mecanismo de decodificacion especulativa: se incluye un archivo adicional, `Qwen3.8-27B-Uncensored-Aggressive-FastMTP-32K.gguf`, que se carga con `--model-draft` junto al modelo principal para acelerar la generacion. La documentacion no cuantifica la ganancia de velocidad ni detalla cuantos tokens se borradorizan por paso. Tampoco se documentan innovaciones de atencion (atencion lineal, SSM o hibridas) ni detalles del entrenamiento multimodal mas alla de la existencia del proyector de vision.

## Capacidades

- Generacion de texto conversacional en ingles, chino y otros idiomas, con un perfil de personalidad «agresivo» y bajo indice de rechazo.
- Entrada multimodal de imagen y texto mediante el proyector `mmproj` en BF16 (descripcion de imagenes, lectura de contenido visual en el contexto de la conversacion).
- Ventana de contexto de 262.144 tokens declarada, adecuada para conversaciones largas o documentos extensos, con variante limitada a 32K en el modo FastMTP.
- Decodificacion especulativa mediante cabezas MTP para reducir la latencia de generacion en llama.cpp.
- Definicion de identidad forzada por prompt de sistema: el modelo responde que es «Baanzon 33STREET 3.8-27B, by 33STREET» o «Diya Orb, by 33STREET, on Ideoscreen» y rechaza atribuciones a otros modelos o laboratorios.
- Despliegue compatible con llama.cpp (`llama-cli`, `llama-server`) y Ollama mediante el `Modelfile` incluido.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo «thinking» explicito, audio o generacion de video: no documentado en la informacion disponible.

## Casos de uso

- Asistente creativo integrado en Ideoscreen: la model card indica que este modelo funciona como «Diya Orb», la IA principal de la plataforma de narracion y produccion de 33STREET, leyendo el estado completo del proyecto (historia, canon, personajes, mundo y continuidad) desde un grafo de proyecto persistente en lugar del ultimo prompt aislado.
- Continuidad narrativa en produccion audiovisual: con 262.144 tokens de contexto, el modelo puede mantener en memoria el canon completo de una obra y responder consultas de coherencia sobre personajes y tramas sin reenviar todo el material en cada turno.
- Analisis de imagenes en local: usando `--mmproj` junto al modelo cuantizado, se pueden procesar storyboards, bocetos, capturas o fotografias sin enviar datos a servicios externos, algo relevante para material creativo no publicado.
- Asistente privado sin conexion: el conjunto de cuantizaciones desde IQ2_M (9,8 GB) hasta Q4_K_P (17,1 GB) permite desplegar un asistente multimodal en una estacion de trabajo con GPU de 16 a 24 GB, sin trafico de red ni dependencia de APIs.
- Red-teaming y evaluacion de seguridad: al declararse sin capa de alineacion, sirve como referencia para medir como se comportan los filtros de moderacion, clasificadores de toxicidad y guardrails frente a un modelo que no aplica rechazos.
- Generacion de datos sinteticos de dialogo: puede producir corpus conversacionales en ingles y chino con un tono marcado, utiles para entrenar clasificadores de estilo, detectores de agresividad o sistemas de reescritura de tono.
- Prototipado de personajes conversacionales: el `SYSTEM-PROMPT.txt` y el `Modelfile` permiten fijar una identidad y una voz constantes, lo que facilita demos de personajes con personalidad estable en aplicaciones interactivas.
- Despliegue en servidor de inferencia local: con `llama-server` en el puerto 8080 y el prompt de identidad enviado como mensaje de sistema en cada peticion, se puede exponer un endpoint compatible con clientes conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y tampoco cuantifica la aceleracion obtenida con la decodificacion especulativa MTP (solo la describe como «sustancialmente mas rapida»). No se han encontrado resultados en la busqueda web.

## Requisitos de hardware

- VRAM estimada segun la guia del propio autor: 14-16 GB para IQ2_M / Q2_K_P; 16-20 GB para las variantes IQ3_*; 20-24 GB para Q4_K_P / IQ4_XS (recomendado como uso diario); 24-28 GB para Q5_K_P / Q6_K_P; 32 GB o mas para Q8_K_P.
- Coste adicional a sumar: el proyector de vision ocupa 0,89 GB y la variante FastMTP de borradorizacion 0,86 GB. El coste de la cache KV para 262.144 tokens no esta cuantificado en la documentacion.
- GPU recomendadas: no especificadas por el autor. Por los requisitos de VRAM declarados, encajan tarjetas de 16-24 GB (por ejemplo, RTX 4080/4090, RTX 5090, A5000) para las cuantizaciones bajas y medias, y GPU de 32 GB o mas (V100 32 GB, A100 40 GB, H100) para Q8_K_P.
- Viabilidad en GPU consumer: si, segun la tabla del autor, con cuantizaciones IQ2_M a Q4_K_P en tarjetas de 16-24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con soporte de MTP/decodificacion especulativa y vision; Ollama mediante el `Modelfile` incluido. No se documenta soporte de vLLM, TGI ni otros motores, dado que solo se publican pesos GGUF.
- Latencia y throughput: no disponibles. El autor afirma que la decodificacion especulativa MTP acelera la generacion, pero no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

No hay datos verificables de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas declaradas. Los valores de los modelos de referencia corresponden a documentacion publica y no a mediciones realizadas para esta ficha.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Baanzon 33STREET 3.8-27B Uncensored Aggressive MTP | 27B declarados / 1,86 B segun safetensors (contradictorio) | 262.144 tokens (32K en FastMTP) | Si (texto + imagen) | Apache-2.0 | Sin alineacion de seguridad; solo GGUF; sin benchmarks publicados |
| Qwen2.5-VL-7B-Instruct | 7B | 128K tokens | Si (texto + imagen + video) | Apache-2.0 | Referencia publica de la familia Qwen para vision-lenguaje |
| Llama-3.2-11B-Vision-Instruct | 11B | 128K tokens | Si (texto + imagen) | Licencia comunitaria de Llama 3.2 | Referencia publica de Meta en el rango 10-12B multimodal |
| Gemma-3-27B-IT | 27B | 128K tokens | Si (texto + imagen) | Terminos de uso de Gemma | Referencia publica en el rango 27B multimodal |

No se dispone de alternativas directamente comparables en el nicho concreto de este repositorio (vision-lenguaje con perfil sin censura y decodificacion MTP en GGUF) cuya existencia y metricas puedan verificarse con la informacion proporcionada.

## Limitaciones y advertencias

- Inconsistencia en el tamano: la ficha declara 27B en la denominacion, pero el recuento de parametros en safetensors es de 1.863.907.840 (~1,86 B). El tamano del repositorio (172,5 GB) y los tamanos de los archivos GGUF (Q4_K_P de 17,1 GB, Q8_K_P de 30 GB) son coherentes con un modelo de orden 27B, no con 1,86 B. Conviene verificar el modelo antes de cualquier uso en produccion.
- Modelo base no verificable: no se ha podido confirmar la existencia publica de Qwen/Qwen3.8-27B, lo que impide trazar el linaje real de los pesos.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada de calidad, razonamiento, codigo, matematicas o capacidades multimodales.
- Contenido nocivo: el propio autor advierte de que el modelo puede producir contenido agresivo, ofensivo, explicito o danino, y que no incorpora capa de alineacion de seguridad. No es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion: no cuantificado por el autor; en modelos sin ajuste de seguridad y sin evaluaciones publicadas, la tasa de error factual no es verificable.
- Identidad impuesta por prompt: la model card instruye a cargar el prompt de sistema en cada despliegue y a no modificarlo, y configura al modelo para negar cualquier derivacion de otro laboratorio. Esta practica dificulta la trazabilidad y puede entrar en conflicto con los requisitos de atribucion de la licencia Apache-2.0.
- Licencia y marcas: se declara Apache-2.0 y se conservan los creditos del modelo base en el archivo LICENSE, pero la propia model card reconoce que «Qwen» es una marca registrada de Alibaba. El uso del nombre y de la atribucion de identidad debe revisarse antes de un despliegue comercial.
- Idiomas: solo se declaran ingles, chino y multilingue; no hay evaluacion del rendimiento en castellano.
- Soporte de herramientas limitado: no se documenta tool calling, function calling ni uso agentico, a diferencia de otros modelos de la misma familia base.
- Dependencia de versiones concretas: la decodificacion MTP y la vision requieren una compilacion de llama.cpp con soporte especifico; no se garantiza compatibilidad con versiones estables publicadas.
- Adopcion muy baja: 50 descargas y 0 likes en el momento de la consulta, sin issues ni validacion por parte de terceros.
- Fechas futuras: la ficha registra creacion y actualizacion el 2026-09-22, dato que conviene contrastar con la cronologia real de publicacion.

## Enlaces

- HuggingFace: https://huggingface.co/Devopsopraiz/Baanzon-33street-3.8-27B-Uncensored-Aggresive-MTP-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B (existencia no verificada en la busqueda realizada)
- Repositorio de referencia para el proyector de vision y las herramientas GGUF: llama.cpp (no se enlaza URL concreta en la model card)
- La busqueda web realizada no ha devuelto enlaces relevantes: los unicos resultados obtenidos pertenecen a un portal de anuncios clasificados sin relacion con el modelo, por lo que no se incluyen papers, blogs, repos ni demos adicionales.
