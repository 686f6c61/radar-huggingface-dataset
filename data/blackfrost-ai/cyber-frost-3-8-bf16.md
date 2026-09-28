# Blackfrost-AI/CYBER-FROST-3.8-BF16

## Resumen

CYBER-FROST-3.8-BF16 es un modelo de lenguaje de gran tamano desarrollado por Blackfrost-AI y especializado en ciberseguridad, orientado a flujos de trabajo profesionales y autorizados: investigacion de vulnerabilidades, respuesta a incidentes, analisis de malware, ingenieria defensiva y operacion de agentes de seguridad. El modelo es un ajuste fino de dominio sobre el checkpoint fundacional Qwen/Qwen3.8-Flash-Next, del que hereda el tokenizador y el procesador, y se distribuye como un checkpoint BF16 completo de aproximadamente 180.000 millones de parametros, no como un adaptador.

Arquitectonicamente combina un stack de texto de 48 bloques con atencion hibrida (lineal y completa, con un bloque de atencion completa cada cuatro capas), una pila MoE con 512 expertos enrutados y un experto compartido, y una capa MTP nativa empaquetada para decodificacion especulativa. La configuracion declara una ventana de contexto de 262.144 tokens, aunque la unica prueba de rendimiento publicada ejercicio 32.768 tokens. Incluye una torre de vision en la configuracion, pero el autor advierte explicitamente que no se ha realizado una evaluacion de calidad multimodal.

Su relevancia actual radica en dos factores: por un lado, ataca un problema concreto de los asistentes generalistas en seguridad, que es la friccion por falsos rechazos ante vocabulario tecnico legitimo; por otro, ofrece una ventana de contexto muy amplia y soporte de tool calling en un unico artefacto BF16 autocontenido. El acceso esta limitado manualmente (gated), la revision de procedencia y licencias del corpus sigue en curso y la licencia es la qwen-community-license-1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (transformer con atencion hibrida lineal/completa y capa MoE) |
| Parámetros totales | 179.999.981.459 (~180B) |
| Parámetros activos | no disponible (configuracion MoE: 10 expertos enrutados de 512 por token, mas un experto compartido; el recuento activo exacto no se publica) |
| Longitud de contexto | 262.144 tokens configurados; 32.768 tokens ejercitados en la prueba publicada |
| Tipos de cuantización | no disponible (el release solo distribuye BF16; no se publican pesos cuantizados oficiales) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (acceso manual restringido) |
| Formato de pesos | SafeTensors (BF16, 131 shards, repositorio de 360 GB) |
| Precisión | BF16 |
| Capas de texto | 48 bloques, atencion completa cada 4 capas |
| Tamaño oculto / cabezas | 2.560 / 24 cabezas de atencion y 2 cabezas KV |
| Expertos MoE | 512 enrutados, 10 seleccionados por token, mas experto compartido |
| Decodificacion especulativa | 1 capa MTP nativa empaquetada |
| Modalidad validada | texto |
| Modelo base | Qwen/Qwen3.8-Flash-Next (revision de4b8e4d43b917e7706784d8bb445c9af86a3540) |
| Pipeline | text-generation |
| Descargas / likes | 458 / 15 |
| Fechas | creado 2026-09-15, actualizado 2026-09-27 |

## Arquitectura y entrenamiento

El linaje del modelo tiene cuatro etapas declaradas. Primero, el checkpoint fundacional Qwen/Qwen3.8-Flash-Next en una revision inmutable. Segundo, una adaptacion de dominio en seguridad seguida de un merge BF16 completo, cuyo estadio interno se denomino BLACKFROST-3.8-FLASH-BF16. Tercero, una etapa de modificacion de comportamiento orientada a reducir la friccion por falsos rechazos en flujos autorizados; el proceso propietario de esa transformacion no se distribuye. Cuarto, la identidad de release: el mismo payload de pesos BF16 se etiquetaba antes como BLACKFROST-3.8-ICED-BF16 y ahora como CYBER-FROST-3.8-BF16, sin que el renombrado corresponda a un entrenamiento adicional.

El stack de texto usa 48 bloques con atencion hibrida lineal y completa, reservando atencion completa cada cuarta capa, con tamano oculto de 2.560, 24 cabezas de atencion y solo 2 cabezas KV. La pila MoE contiene 512 expertos enrutados, selecciona 10 por token e incorpora un experto compartido. Se empaqueta una capa MTP nativa para decodificacion especulativa, lo que permite acelerar la generacion cuando el runtime de servicio la soporta.

El entrenamiento combina material de seguridad curado, flujos de trabajo escritos por operadores, escenarios realistas de estilo engagement y datos de destilacion propiedad de Blackfrost-AI. Los tamanos del corpus, los recuentos por fuente y el material bruto no se publican. El autor declara aplicar una politica de escala frontera a sus profesores de destilacion, excluyendo a los inferiores a la clase de 753B parametros, y la evidencia del release vincula un subconjunto de seguridad concreto a un profesor Qwen3.8 de 2,4T; no existe un manifiesto de profesores para todo el corpus. No se documentan en la informacion disponible fases de RLHF, DPO u otras tecnicas de alineacion posteriores al ajuste. La revision de procedencia y licencias del corpus mixto sigue en curso. La configuracion incluye una torre de vision, pero no se ha publicado ninguna evaluacion de calidad multimodal, por lo que no debe inferirse capacidad de imagen o video a partir de la presencia de los ficheros de procesador.

## Capacidades

- Generacion de texto conversacional en el dominio de ciberseguridad, con cobertura declarada de reconocimiento y OSINT, ingenieria social y BEC, seguridad de aplicaciones web y API, identidad y Active Directory, red y perimetro, investigacion de vulnerabilidades y explotacion binaria, analisis de malware y ransomware, cloud, contenedores y Kubernetes, cadena de suministro de software, movil, IoT, wireless y seguridad fisica, ICS/OT, criptografia y protocolos, escalada de privilegios, movimiento lateral y exfiltracion, threat intelligence y analisis de APT, operaciones purple team, y seguridad de agentes de IA y ML adversarial.
- Soporte de tool use / function calling, con etiquetado explicito `tool-use` en la ficha del modelo.
- Orientacion a flujos de agente con razonamiento multi-paso, segun la descripcion de operacion de agentes de seguridad aprobados.
- Decodificacion especulativa mediante la capa MTP nativa empaquetada.
- Plantilla de chat especifica del release, empaquetada junto con el checkpoint.
- Capacidad multimodal: no validada. La configuracion contiene torre de vision, pero el autor desaconseja inferir capacidad de imagen o video.
- Idiomas soportados: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Respuesta a incidentes (blue team): el modelo puede resumir telemetria, correlacionar indicadores y redactar notas de triaje con contexto largo, lo que resulta util cuando el analista necesita cargar ventanas extensas de logs o de cronologia de un incidente sin trocearlas en exceso. La ventana configurada de 262.144 tokens es relevante aqui, aunque el autor solo ha validado 32.768.
- Analisis de malware: apoyo en la lectura de cadenas, comportamiento observado y tecnicas MITRE ATT&CK, y en la redaccion de informes tecnicos de muestras. El ajuste de dominio busca reducir rechazos ante vocabulario de malware legitimo en un entorno de laboratorio controlado.
- Red team autorizado y validacion de vulnerabilidades: reproduccion de hallazgos en entornos controlados y redaccion de pruebas de concepto, asumiendo que el alcance y las reglas de enfrentamiento se aplican fuera del modelo.
- Ingenieria de deteccion: generacion y revision de reglas Sigma, YARA, KQL o consultas SIEM, ademas de mapeo de detecciones a tecnicas adversarias. El soporte de tool calling permite integrarlo en pipelines que validen o desplieguen las reglas generadas.
- Threat intelligence: sintesis de informes de APT, extraccion de TTPs y produccion de resumenes estructurados para equipos de inteligencia, aprovechando la cobertura declarada de analisis APT y operaciones purple team.
- Seguridad cloud y de contenedores: revision de manifiestos de Kubernetes, politicas de IAM y configuraciones de red, con recomendaciones de endurecimiento dentro de un pipeline de revision de infraestructura como codigo.
- Agentes de seguridad con tool use: integracion como motor de decision en un agente aprobado que consulte APIs de escaneo, CMDB o sistemas de tickets, con permisos, registro y limites de tasa aplicados por el despliegue y no por el modelo.
- Formacion y simulacion: generacion de escenarios de ejercicio, inyecciones de phishing para campañas internas autorizadas y material de concienciacion, siempre bajo un marco de autorizacion externo.
- Seguridad de la cadena de suministro de software: revision asistida de dependencias, analisis de riesgo de paquetes y redaccion de hallazgos para equipos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento publicado es de alcance y no de calidad: la prueba BF16 publicada ejercicio 32.768 tokens de contexto, muy por debajo del techo configurado de 262.144 tokens. El autor advierte que los contextos mas largos, la alta concurrencia, las peticiones multimodales y los bucles de agente con muchas herramientas requieren validacion independiente. No hay cifras publicadas de MMLU, HumanEval, GSM8K ni de benchmarks especificos de seguridad (como CTIBench, CyberSecEval o similares) en la informacion disponible, y no deben extrapolarse a partir del modelo base.

## Requisitos de hardware

- VRAM para inferenza en BF16: los 179.999.981.459 parametros ocupan aproximadamente 360 GB solo en pesos, calculado a 2 bytes por parametro. El repositorio completo ocupa 360 GB en disco, de modo que la descarga y el almacenamiento ya son un requisito relevante.
- Configuracion multi-GPU obligatoria en BF16: se necesitan al menos 5 GPU de 80 GB para alojar unicamente los pesos, y 8 GPU de 80 GB (A100, H100 o H200) para disponer de margen de cache KV y activaciones a contextos largos y concurrencia moderada. El numero de cabezas KV es bajo (2), lo que reduce el coste de cache frente a arquitecturas con muchas cabezas KV, pero no elimina la necesidad de agregar VRAM.
- GPU consumer: no cabe en una RTX 4090 (24 GB) ni en ninguna GPU consumer actual en BF16. Solo seria viable mediante cuantizaciones de la comunidad, que este release no distribuye ni valida.
- Cuantizacion: no hay pesos cuantizados oficiales. Estimaciones derivadas del recuento de parametros (no validadas por el autor): INT8/FP8 en torno a 180 GB, lo que exigiria 3-4 GPU de 80 GB; INT4 en torno a 90 GB, viable en 2 GPU de 80 GB. Cualquier conversion GGUF, AWQ o GPTQ seria un artefacto de terceros sin garantia de calidad.
- Opciones de despliegue: transformers es la ruta nativa indicada por el autor (library_name: transformers, con kit de despliegue documentado para el perfil de servicio validado). Para servicio en produccion son razonables vLLM y SGLang, que pueden aprovechar la capa MTP para decodificacion especulativa, y TGI. llama.cpp y Ollama requeririan una cuantizacion GGUF de la comunidad que no existe en el release oficial.
- Latencia y throughput: no disponibles. No se publican cifras de tokens por segundo, TTFT ni comportamiento bajo batching concurrente.
- Acceso: el modelo esta sujeto a acceso manual restringido (gated), por lo que la descarga requiere aprobacion del autor.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-BF16 | ~180B (MoE, 10 de 512 expertos por token) | 262.144 configurados / 32.768 ejercitados | Ciberseguridad (ajuste de dominio y de comportamiento) | qwen-community-license-1.0 | Acceso manual restringido, SafeTensors BF16 |
| Qwen/Qwen3.8-Flash-Next | no disponible (origen de los ~180B declarados) | no disponible | Generalista | qwen-community-license-1.0 (heredada) | Publico |

No se dispone de datos verificados en la informacion proporcionada para comparar con otras alternativas de la misma categoria (modelos ajustados en seguridad de escala comparable o con ventana de contexto similar). Cualquier comparacion de rendimiento frente a modelos como los de la familia Qwen sin ajuste de seguridad, o frente a modelos de seguridad de menor tamano, requeriria benchmarks que este release no publica.

## Limitaciones y advertencias

- Riesgo de alucinacion: no documentado de forma especifica por el autor; inherente a un modelo de ~180B ajustado por destilacion. En dominio de seguridad, una alucinacion puede traducirse en comandos, reglas de deteccion o indicadores incorrectos, por lo que se requiere revision humana.
- Sesgos conocidos: no documentados en la informacion disponible. El corpus mezcla material curado, flujos de operadores y datos de destilacion propietarios, sin manifiesto publico de composicion, lo que impide auditar la representatividad del entrenamiento.
- Procedencia del corpus: la revision de procedencia y licencias del corpus mixto sigue en curso, y esa es una de las razones declaradas del acceso manual restringido. Los recuentos por fuente, el material bruto de engagement y las identidades de clientes no se publican.
- La reduccion de falsos rechazos es un objetivo de diseno, no una garantia: el autor reconoce que el modelo conserva comportamiento de rechazo y que no todas las respuestas son seguras o correctas.
- La autorizacion es un control externo. El modelo no puede establecer propiedad, consentimiento, reglas de enfrentamiento, jurisdiccion ni si un objetivo esta en alcance. El despliegue debe aplicar identidad, alcance, permisos de herramientas, registro, limites de tasa y revision humana fuera del modelo.
- Ventana de contexto: el techo configurado de 262.144 tokens no es una garantia de calidad. Solo se han ejercitado 32.768 tokens en la prueba publicada; contextos mayores, alta concurrencia, peticiones multimodales y bucles de agente con muchas herramientas requieren validacion propia.
- Multimodalidad no validada: existe torre de vision en la configuracion, pero no se ha evaluado la calidad multimodal. No debe asumirse capacidad de imagen o video.
- Idiomas: no disponibles en la ficha, por lo que no puede garantizarse un comportamiento multilingue homogeneo.
- Licencia: qwen-community-license-1.0, heredada del modelo base. Es una licencia con condiciones especificas para uso comercial que deben revisarse antes de cualquier despliegue productivo; la ficha la etiqueta como `license: other`, con nombre y enlace propios.
- Formato de pesos y cuantizacion: solo BF16 en SafeTensors. No hay versiones cuantizadas oficiales ni artefactos GGUF, AWQ o GPTQ validados.
- Uso dual: el ajuste esta disenado para trabajo autorizado, pero el mismo material tecnico puede emplearse de forma indebida. La ficha no incorpora filtros tecnicos propios; la contencion depende del despliegue.
- Cifras del Hub: 458 descargas y 15 likes en el momento de la consulta, un volumen bajo que limita la evidencia empirica de terceros sobre el comportamiento del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next (revision fijada `de4b8e4d43b917e7706784d8bb445c9af86a3540`)
- Licencia: qwen-community-license-1.0, referenciada como archivo `LICENSE` dentro del repositorio del modelo
- Assets del repositorio: `ASSETS/BLACKFROST-AI-BANNER.png`, indice de pesos, configuracion, tokenizer, processor, plantilla de chat empaquetada y kit de despliegue documentado
- Papers, blogs, repositorios adicionales o demos: no disponibles en la informacion proporcionada
