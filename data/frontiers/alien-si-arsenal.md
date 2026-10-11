# Frontiers/alien-si-arsenal

## Resumen

Alien SI Arsenal es un adaptador PEFT (LoRA) publicado en HuggingFace por la cuenta Frontiers bajo el identificador `Frontiers/alien-si-arsenal`, y entrenado sobre el modelo base `unsloth/Qwen3-14B-unsloth-bnb-4bit`. La model card, redactada en rumano, lo describe como un "arsenal" de red-team compuesto por 137 herramientas agrupadas en quince categorias: reconocimiento y OSINT, escaneo, analisis de vulnerabilidades, explotacion, contraseñas y hashes, seguridad web, desarrollo de exploits y pwn, ingenieria inversa, redes inalambricas, red, C2 y post-explotacion, cloud y contenedores, ingenieria social y SDR/hardware. El autor que figura en la ficha es Barbu Mario Mihael.

El problema que aborda es la seleccion automatica de herramienta: ante cada peticion, el modelo debe elegir la utilidad correcta dentro de ese catalogo y emitir una llamada estructurada en el formato `<tool_call>`. Se trata, por tanto, de un ajuste orientado a *tool use* especializado en seguridad ofensiva y defensiva, no de un modelo de proposito general. La relevancia actual viene de que los flujos de trabajo de pentesting y respuesta a incidentes se estan apoyando cada vez mas en agentes que orquestan herramientas externas, y este adaptador se posiciona explicitamente en ese nicho.

La informacion publica es muy limitada: el repositorio ocupa 0,5 GB, no tiene descargas ni valoraciones, no declara idiomas soportados, no publica benchmarks ni detalles de entrenamiento, y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo (solo paginas de la editorial cientifica Frontiers Media, sin relacion confirmada). Cualquier dato no documentado se marca a continuacion como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-14B) con adaptador PEFT/LoRA |
| Parametros totales | 14 000 millones aproximadamente en el modelo base; tamaño del adaptador no disponible |
| Parametros activos | no aplica (el modelo base es denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha (heredada del modelo base Qwen3-14B, sin confirmar) |
| Tipos de cuantizacion | adaptador en safetensors; el modelo base indicado esta en bnb-4bit; no se documentan formatos GGUF ni otros |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador PEFT (la libreria declarada es `peft`) sobre `unsloth/Qwen3-14B-unsloth-bnb-4bit`, es decir, un ajuste de bajo rango aplicado a un transformer decoder-only denso de aproximadamente 14 000 millones de parametros que, en el modelo base citado, se distribuye ya cuantizado a 4 bits con bitsandbytes. No se especifica el rango, el valor alfa, los modulos objetivo ni el numero de parametros entrenables del adaptador, mas alla de que el repositorio completo ocupa 0,5 GB.

No hay informacion sobre el dataset de entrenamiento: no se indica el numero de tokens, la composicion de los datos, ni si se emplearon tecnicas de alineacion como RLHF o DPO. La unica innovacion descrita en la model card es funcional y no arquitectonica: un catalogo cerrado de 137 herramientas de seguridad repartidas en quince dominios, con la expectativa de que el modelo emita una llamada `<tool_call>` con la herramienta correcta para cada peticion. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Seleccion de herramienta (*tool calling*): el modelo elige, entre 137 utilidades de seguridad, la que corresponde a cada peticion y emite la llamada en formato `<tool_call>`.
- Cobertura de dominios de seguridad: reconocimiento y OSINT, escaneo, analisis de vulnerabilidades, explotacion, contraseñas y hashes, seguridad web, pwn y desarrollo de exploits, ingenieria inversa, redes inalambricas, red, C2 y post-explotacion, cloud y contenedores, ingenieria social y SDR/hardware.
- Razonamiento multietapa orientado a agentes: la seleccion de herramienta implica encadenar intencion del usuario, contexto y utilidad disponible.
- Generacion de texto: capacidad heredada del modelo base Qwen3-14B; no se documenta ningun ajuste especifico ni evaluacion al respecto.
- Idiomas: no documentados. La model card esta redactada en rumano, pero no se declara que el modelo soporte ese idioma ni ningun otro.
- Capacidades multimodales (vision, audio): no disponibles ni declaradas.
- Modo de razonamiento explicito (*thinking*): no documentado.

## Casos de uso

- Automatizacion de reconocimiento y OSINT: dentro de un ejercicio autorizado de red-team, el agente recibe un objetivo y selecciona la herramienta de enumeracion o busqueda de informacion publica adecuada entre las disponibles en el arsenal.
- Orquestacion de escaneos de vulnerabilidades: el modelo traduce una peticion en lenguaje natural ("analiza este rango en busca de servicios expuestos") en la llamada a la utilidad de escaneo correspondiente, lo que permite encadenar fases de descubrimiento y clasificacion.
- Asistencia en explotacion durante pentesting: en pruebas con autorizacion por escrito, ayuda a elegir la utilidad de explotacion o de desarrollo de exploits en funcion del hallazgo previo.
- Analisis de malware e ingenieria inversa: selecciona herramientas de RE y de analisis de artefactos para tareas de triaje en un laboratorio aislado.
- Simulacros de operaciones de C2 y post-explotacion: en entornos controlados de *purple team*, encamina las acciones posteriores al compromiso simulado hacia las utilidades de mando y control.
- Seguridad de cloud y contenedores: enmarca peticiones sobre configuracion de nubes o imagenes de contenedor hacia las herramientas de auditoria de esa categoria.
- Simulacion de ingenieria social: genera y encamina campanas de concienciacion y pruebas de phishing autorizadas mediante las utilidades de ese dominio.
- Formacion y ejercicios de red-team: sirve como capa de enrutado de herramientas en plataformas de entrenamiento, reduciendo la necesidad de que el operador memorice el catalogo.

En todos los casos el uso legitimo exige autorizacion explicita del propietario del sistema y cumplimiento de la normativa aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones de *tool calling* (por ejemplo, BFCL) ni metricas de precision en la seleccion de herramienta, y el repositorio registra cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Requisitos de hardware

- Estimaciones para el modelo base de 14 000 millones de parametros (el adaptador añade un coste marginal no cuantificado):
  - FP16/BF16: en torno a 28 GB de VRAM solo para pesos, mas cache KV.
  - 8 bits: aproximadamente 15 GB.
  - 4 bits: aproximadamente 8-10 GB.
- GPU recomendadas: A100 (40 o 80 GB) o H100 para FP16 con contexto amplio; RTX 4090 (24 GB) o RTX 3090 para 8 bits y 4 bits.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de 24 GB o mas en cuantizacion de 4 u 8 bits; en 16 bits requiere 40 GB o reparto entre varias GPU.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el modelo base; vLLM o TGI para servicio con concurrencia; llama.cpp u Ollama solo si se convierte previamente a GGUF (no se distribuye ese formato). El modelo base indicado esta cuantizado con bitsandbytes, lo que condiciona el entorno de carga.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Frontiers/alien-si-arsenal | ~14B (adaptador sobre Qwen3-14B) | no disponible | 137 herramientas de red-team | apache-2.0 | no publicado |
| Qwen3-14B (modelo base) | ~14B | no disponible en esta ficha | proposito general | apache-2.0 (segun el modelo base) | no evaluado en esta ficha |
| Otras alternativas de *tool use* para seguridad | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria especializada en seleccion de herramientas de seguridad, por lo que la comparacion se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni datos de precision en la seleccion de herramienta, ni validacion independiente. No se puede asumir que las 137 herramientas se elijan correctamente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede emitir llamadas `<tool_call>` a herramientas inexistentes, con parametros mal formados o con la utilidad equivocada.
- Uso dual y legalidad: el catalogo cubre explotacion, C2, post-explotacion e ingenieria social. Su uso sin autorizacion expresa del propietario puede ser ilegal en España y en la Union Europea (por ejemplo, conforme a la Ley Organica 10/1995 y la Directiva 2013/40/UE).
- Idiomas no declarados: se desconoce el comportamiento multilingue y si el ajuste degrada el rendimiento del modelo base en idiomas distintos del ingles.
- Ambiguedad de autoría: el autor de la cuenta de HuggingFace coincide nominalmente con la editorial cientifica Frontiers Media, pero la busqueda web no confirma ninguna relacion entre ambas; la afiliacion real no esta documentada.
- Model card en rumano: la documentacion oficial esta en rumano y no incluye ficha tecnica, guia de uso, ejemplos ni formato esperado de las llamadas.
- Estado del repositorio: cero descargas, cero valoraciones y fecha de actualizacion de octubre de 2026, lo que apunta a un artefacto sin uso ni mantenimiento documentados.
- Dependencia del modelo base: al ser un adaptador LoRA, el comportamiento final depende de `unsloth/Qwen3-14B-unsloth-bnb-4bit`; los terminos y limitaciones de ese modelo base aplican igualmente.
- Licencia: aunque se declara apache-2.0, conviene verificar la compatibilidad con la licencia del modelo base antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Frontiers/alien-si-arsenal
- Modelo base: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Resultados de busqueda web: sin relevancia. Los enlaces devueltos (https://www.frontiersin.org/, https://www.frontiersin.org/journals, https://fr.wikipedia.org/wiki/Frontiers_Media, https://www.frontieresmedia.fr/tous-les-articles, https://myfrontiers.frontiersin.org/dashboard) corresponden a la editorial cientifica Frontiers Media y a un medio homonimo, sin relacion confirmada con el modelo.
- Paper, repositorio de codigo, blog o demo: no disponibles.
