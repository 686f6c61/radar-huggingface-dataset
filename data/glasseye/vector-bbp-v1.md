# GLASSEYE/vector-bbp-v1

## Resumen

VECTOR BBP/VDP Analyst (LoRA v1) es un adaptador de ajuste fino de tipo LoRA publicado por el usuario GLASSEYE (Johnny Watters / cyberviser / 0AI) sobre el modelo base mistralai/Mistral-7B-Instruct-v0.3. No es un modelo completo, sino un conjunto de pesos PEFT (0,1 GB) que debe cargarse junto al modelo base de 7.250 millones de parametros para funcionar. Su proposito declarado es actuar como copiloto en programas de bug bounty (BBP), divulgacion coordinada de vulnerabilidades (VDP) y pruebas de penetracion contratadas: analisis de alcance, metodologia sobre activos en scope, redaccion de informes con puntuacion CVSS y clasificacion CWE, y acompanamiento en la divulgacion.

El autor indica que el entrenamiento se realizo exclusivamente en local sobre una RTX 5070, sin GPUs en la nube, y que este adaptador es una continuacion de un "GlassEye BBP v1" anterior, al que se ha anadido un system prompt especifico de analista VECTOR y un endurecimiento de autenticacion orientado a evitar la invencion de identificadores de programa. Es relevante ahora por dos motivos: primero, porque ejemplifica la tendencia de adaptadores de bajo coste entrenados en hardware de consumo para dominios verticales muy concretos (seguridad ofensiva autorizada); segundo, porque su enfoque explicito en "no inventar datos" ataca uno de los fallos mas criticos de los LLM en flujos de trabajo de seguridad, donde un CVE, un identificador de programa o una puntuacion CVSS fabricados pueden invalidar un informe completo.

El repositorio no incluye pipeline declarado, idiomas soportados, resultados de evaluacion ni detalles del dataset de entrenamiento. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que se trata de una publicacion reciente y sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; el modelo base es Mistral-7B-Instruct-v0.3, con atencion por ventanas deslizantes y RoPE |
| Parametros totales | 7.250 millones en el modelo base; parametros del adaptador no disponibles (rango, alpha y modulos objetivo no documentados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion del modelo base; no verificado para este adaptador |
| Tipos de cuantizacion | El adaptador se publica en safetensors; no se ofrecen versiones GGUF, GPTQ ni AWQ del mismo. Puede cargarse sobre el modelo base cuantizado en 8 o 4 bits con bitsandbytes, GPTQ, AWQ o llama.cpp |
| Idiomas soportados | No disponible. El modelo base declara ingles, frances, italiano, espanol, aleman y portugues; la ficha del adaptador no especifica idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo entrenado desde cero. Hereda por tanto la arquitectura del modelo base: un transformer decoder-only de 7.250 millones de parametros con atencion causal, embeddings rotatorios (RoPE) y un tokenizador de 32.768 entradas. Los detalles concretos del ajuste (rango del adaptador, alpha, dropout, modulos objetivo, tasa de aprendizaje, numero de pasos) no estan documentados en la model card ni en los metadatos de HuggingFace.

Sobre los datos de entrenamiento, la informacion disponible solo indica que el ajuste se realizo en local sobre una RTX 5070 y que parte de un adaptador previo denominado "GlassEye BBP v1". No se especifica el volumen de tokens, la composicion del corpus (informes de bug bounty reales, politicas de programa, documentacion CVSS/CWE, etc.), ni si hubo una fase de RLHF o DPO. La innovacion declarada es de tipo conductual mas que arquitectonica: la incorporacion de un system prompt de "VECTOR Analyst" y un endurecimiento de autenticacion cuyo objetivo es que el modelo no invente identificadores de programa ni datos de alcance. No se documenta ninguna tecnica de inferencia especial (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Analisis y parseo de alcance (scope): interpretacion de politicas de programa, activos incluidos y excluidos, y reglas de elegibilidad.
- Metodologia sobre activos en scope: sugerencia de pasos de reconocimiento y prueba dentro de los limites autorizados declarados por el programa.
- Redaccion de informes: generacion de descripciones de vulnerabilidad, pasos de reproduccion, impacto y mitigacion sugerida.
- Puntuacion CVSS y clasificacion CWE: propuesta de vectores y categorias para acompanar el informe.
- Asistencia en divulgacion coordinada: orientacion sobre plazos, comunicacion con el equipo de seguridad y escalado.
- Hereda del modelo base la generacion de texto general, el razonamiento basico y la generacion de codigo, aunque no hay evaluacion publicada que confirme que el ajuste no degrada estas capacidades.
- Soporte de tool calling / function calling: el modelo base Mistral-7B-Instruct-v0.3 lo soporta de forma nativa, pero no hay confirmacion de que el adaptador lo preserve.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible / no soportado.
- Capacidades multilingues: no documentadas para el adaptador.

## Casos de uso

- Triaje inicial de un informe de bug bounty: el modelo recibe la descripcion de un hallazgo y la politica del programa, y devuelve una comprobacion de si el activo esta en scope, la severidad estimada y los campos que faltan antes de enviarlo. Es adecuado porque su entrenamiento se centra precisamente en ese flujo de triaje y porque el endurecimiento de autenticacion reduce el riesgo de citar identificadores de programa inexistentes.
- Redaccion asistida de informes para HackerOne o plataformas equivalentes: genera la estructura titulo, resumen, pasos de reproduccion, impacto, CVSS y remediacion, que el analista revisa y corrige. Ahorra tiempo en la parte burocratica, que suele ser la mas tediosa del ciclo de divulgacion.
- Preparacion de pruebas de penetracion contratadas: a partir del alcance contractual, el modelo propone una checklist de metodologia (por ejemplo, alineada con OWASP o PTES) y ayuda a mantener la trazabilidad de que cada prueba cae dentro de lo autorizado.
- Formacion interna de equipos de seguridad: uso como simulador de conversaciones de divulgacion, donde el analista practica como describir un hallazgo a un responsable de producto o como negociar plazos de correccion.
- Soporte a equipos de VDP sin programa de recompensas: ayuda a pequenos equipos a redactar politicas de divulgacion, definir canales de recepcion y clasificar reportes entrantes de investigadores externos.
- Estandarizacion de plantillas de reporte: dado que el modelo trabaja con CVSS y CWE, puede usarse para homogeneizar el formato de salida de un equipo y reducir la variabilidad entre analistas.
- Copiloto local con datos sensibles: al ser un adaptador pequeno sobre un modelo de 7B, puede desplegarse en una estacion de trabajo con GPU de consumo y sin conexion a servicios externos, lo que resulta relevante cuando el alcance del programa es confidencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni metricas especificas del dominio de seguridad (por ejemplo, tasas de deteccion de vulnerabilidades o calidad de informes), y tampoco hay comparaciones con otros adaptadores o modelos de la misma categoria.

## Requisitos de hardware

- VRAM para el adaptador: 0,1 GB de pesos, practicamente despreciable frente al modelo base.
- VRAM para inferencia con el modelo base en fp16/bf16: en torno a 15-16 GB, incluyendo cache KV para contextos moderados.
- VRAM en cuantizacion de 4 bits: aproximadamente 5-6 GB, lo que permite ejecucion en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 5070 o RTX 4090.
- GPUs recomendadas: RTX 4090 o RTX 5090 para fp16 con contexto largo; A100 40/80 GB o H100 para servicio concurrente; RTX 3090/4090 como opcion de coste contenido.
- El autor declara haber entrenado el adaptador en una RTX 5070, lo que confirma que el ajuste LoRA de un 7B es viable en hardware de consumo; no se documenta el tiempo de entrenamiento ni el consumo.
- Opciones de despliegue: vLLM o TGI para servicio con concurrencia (cargando el adaptador LoRA de forma dinamica), llama.cpp/Ollama para uso local tras convertir el modelo base a GGUF y aplicar el adaptador, y transformers + PEFT para scripts de evaluacion.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Evaluacion publica |
|---|---|---|---|---|---|---|
| GLASSEYE/vector-bbp-v1 | 7.250 M (base) + LoRA | 32.768 tokens (base) | Adaptador LoRA especializado en BBP/VDP | apache-2.0 | HuggingFace, 0 descargas | No disponible |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.250 M | 32.768 tokens | Modelo instructivo generalista | apache-2.0 | HuggingFace, ampliamente desplegado | Si, extensa y publica |
| Otros modelos abiertos orientados a seguridad ofensiva | No disponible | No disponible | Ajuste completo o LoRA | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria. Los resultados de busqueda web proporcionados no contienen referencias relevantes al modelo ni a adaptadores comparables.

## Limitaciones y advertencias

- Doble uso: se trata de un modelo orientado a seguridad ofensiva. El autor restringe explicitamente su uso a pruebas autorizadas y prohibe el uso para pruebas no autorizadas, ransomware, kits de phishing, robo de credenciales o volcados de datos de produccion. Estas restricciones son declarativas y no estan tecnicamente impuestas en los pesos.
- Riesgo de alucinacion: aunque el autor afirma haber anadido un endurecimiento para evitar la invencion de identificadores de programa, no hay evaluacion publica que cuantifique la tasa de alucinacion residual. En dominios de seguridad, un CVE, un CVSS o una referencia normativa inventados pueden invalidar un informe.
- Ausencia total de evaluacion: sin benchmarks ni validacion por terceros, no es posible afirmar que el ajuste mejore al modelo base en tareas de seguridad, ni descartar degradacion en capacidades generales.
- Datos de entrenamiento opacos: se desconoce el corpus, su volumen, su procedencia y si contiene material con derechos de terceros o informacion sensible.
- Idiomas: no se documenta soporte multilingue. Es previsible un comportamiento mucho mejor en ingles que en espanol, dado el sesgo del modelo base y del dominio.
- Contexto: aunque el modelo base admite 32.768 tokens, pegar una politica de programa completa mas el codigo o los logs de una prueba puede agotar la ventana y degradar la calidad en los extremos.
- Adopcion nula: 0 descargas y 0 likes implican que no ha pasado por revision de la comunidad. No se debe desplegar en produccion sin una evaluacion propia y sin supervision humana en cada informe generado.
- Licencia: apache-2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad legal del uso que haga de las salidas, especialmente en pruebas sobre sistemas de terceros.
- Metadatos inconsistentes: la fecha de creacion registrada (2026-09-18) no es coherente con una publicacion verificable, lo que refuerza la necesidad de tratar la ficha con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GLASSEYE/vector-bbp-v1
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en los resultados de busqueda web proporcionados.
