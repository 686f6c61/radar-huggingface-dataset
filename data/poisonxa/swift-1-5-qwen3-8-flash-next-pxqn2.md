# poisonxa/Swift-1.5-Qwen3.8-Flash-Next-PXQN2

## Resumen

Swift 1.5 Qwen3.8-Flash-Next PXQN2 es una cuantizacion GGUF de un fine-tune de razonamiento eficiente sobre Qwen3.8-Flash-Next, un modelo Mixture-of-Experts de gran tamano. El modelo base lo desarrolla UkisAI y esta version concreta la produce y redistribuye PXA Network bajo su formato propietario PXQN2. Con 179.549.411.712 parametros totales y un repo de 66,9 GB repartido en tres ficheros GGUF, esta pensado para ejecutarse en configuraciones de GPU modestas (el autor lo prueba en 3 x P100 de 16 GB) gracias a un esquema de offloading hacia memoria del host.

La relevancia de esta ficha esta en su caracter de artefacto de despliegue: no es un modelo nuevo, sino una build optimizada para preservar la fidelidad respecto al modelo original con un presupuesto de VRAM reducido. El autor reporta una divergencia KL de 0,375 y un 79,2 % de coincidencia en el token top respecto al modelo de precision completa, muy por encima de la build de 32 GB que sustituye (1,032 y 54,5 %). Es, por tanto, la version recomendada por el propio autor para el ecosistema Swift.

Requiere el runtime PXA 4.0 beta 5 o posterior y activa automaticamente Overdrive cuando el modelo no cabe en las tarjetas. La licencia es Swift Open License 1.0, con ficheros adicionales de licencia Qwen y avisos de redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; runtime propietario PXA con soporte de multi-token prediction y Overdrive |
| Parametros totales | 179.549.411.712 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (validado con needle a 8K de contexto; se documenta un problema conocido a contexto corto de 1K) |
| Tipos de cuantizacion | GGUF PXQN2 (formato propietario PXA); existe tambien una build PXQN de 32 GB del mismo autor |
| Idiomas soportados | no disponible (el autor destaca mejor fidelidad que la build de 32 GB, sobre todo en idiomas distintos del ingles; se mencionan prompts en chino) |
| Licencia | swift-open-license-1.0 (Swift Open License 1.0), con LICENSE-QWEN, NOTICE y REDISTRIBUTOR-NOTICE.txt |
| Formato de pesos | GGUF en 3 particiones (`00001-of-00003`, `00002`, `00003`); se cargan todas en una carpeta y se carga la primera |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts de gran escala fine-tuneado por UkisAI bajo la denominacion Swift 1.5 Qwen3.8-Flash-Next, descrito como un fine-tune "de razonamiento eficiente" sobre Qwen3.8-Flash-Next. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO. La arquitectura exacta del backbone (numero de expertos, dimensiones, atencion) tampoco se detalla en la model card.

La innovacion tecnica de esta build es el formato de cuantizacion PXQN2 de PXA Network, orientado a GPUs Pascal y Volta (se cita explicitamente Pascal y Volta en los tags y se prueba en P100). El paquete de 66,9 GB se divide en dos componentes: unos 37 GB que residen en las tarjetas graficas y el resto, correspondiente a una tabla n-gram / PLE integrada, que se sirve desde memoria del host. El runtime PXA 4.0 incorpora multi-token prediction y un mecanismo Overdrive que reparte el modelo entre GPU y RAM del sistema cuando no cabe integro en VRAM. El autor valida estabilidad con salida identica en 12 de 12 ejecuciones repetidas y recuperacion de una aguja (needle) a 8K de contexto.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la orientacion del modelo base apuntan a dialogo multi-turno.
- Razonamiento eficiente: el fine-tune se describe como "reasoning-efficient", optimizado para cadenas de razonamiento con menor coste.
- Multi-token prediction: soportada por el runtime PXA y activada por defecto; el autor indica que con ella activada los prompts problematicos terminan limpiamente.
- Capacidades multilingues: el autor afirma mejor fidelidad que la build de 32 GB, especialmente fuera del ingles; no se listan idiomas concretos.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con APIs compatibles con endpoints de inferencia.
- Ejecucion en hardware legacy: pensado para Pascal y Volta (por ejemplo, P100), no solo para GPUs modernas.
- No se documentan capacidades de vision, audio ni tool calling / function calling en la informacion disponible.

## Casos de uso

- Despliegue en infraestructura con GPUs Pascal/Volta: el modelo esta explicitamente optimizado para tarjetas como la P100, lo que permite reaprovechar hardware legacy en entornos de laboratorio o clusters antiguos que de otro modo no podrian servir modelos de este tamano.
- Servicio conversacional en produccion con presupuesto de VRAM limitado: con 3 x 16 GB en GPU y el resto en RAM del host via Overdrive, se puede montar un endpoint de chat sin adquirir aceleradores de gama alta.
- Prototipado de aplicaciones de razonamiento: al ser un fine-tune orientado al razonamiento eficiente, encaja en pipelines de generacion de respuestas razonadas donde prima la latencia y el coste por token sobre la precision absoluta.
- Evaluacion comparativa de cuantizaciones: util como referencia para medir el impacto de tecnicas de compresion (KL 0,375 frente a 1,032 de la build de 32 GB) en tareas de fidelidad respecto al modelo original.
- Investigacion sobre atencion a contexto largo: la validacion con needle a 8K y el problema conocido a 1K lo convierten en un objeto de estudio para el comportamiento del runtime PXA en distintas longitudes de contexto.
- Despliegue multilingue no ingles: dado que el autor destaca mejor fidelidad en idiomas distintos del ingles que la build de 32 GB, es adecuado para servicios en lenguas europeas o asiaticas donde la alternativa comprimida degradaba demasiado.
- Integracion en entornos compatibles con endpoints: gracias al tag `endpoints_compatible`, puede conectarse a orquestadores de agentes o gateways que consumen APIs de inferencia estandar.

## Benchmarks y rendimiento

| Metrica | PXQN2 (esta build) | PXQN 32 GB |
|---|---|---|
| Divergencia KL respecto al modelo de precision completa (menor es mejor) | 0,375 | 1,032 |
| Coincidencia en el token top | 79,2 % | 54,5 % |
| Estabilidad (ejecuciones repetidas identicas) | 12 de 12 | no disponible |
| Recuperacion de needle | encontrado a 8K | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 37 GB residen en las tarjetas; el resto del paquete de 66,9 GB (tabla n-gram / PLE) se sirve desde memoria del host.
- Configuracion de referencia del autor: 3 x 16 GB (por ejemplo, 3 x P100) con el modelo integro en GPU.
- Configuraciones menores: menos tarjetas mas RAM del sistema mediante Overdrive.
- GPUs recomendadas: Pascal y Volta (P100 citada explicitamente); no se documentan requisitos para Ampere, Hopper o Ada.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; el enfoque esta en GPUs de datacenter legacy.
- Despliegue: exclusivamente mediante el runtime PXA 4.0 beta 5 o posterior (lanzador PXA Control). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL / token top) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-Flash-Next PXQN2 (esta ficha) | 179.549.411.712 | no disponible (validado a 8K) | 0,375 / 79,2 % | swift-open-license-1.0 | GGUF PXQN2, runtime PXA |
| Swift 1.5 Qwen3.8-Flash-Next PXQN 32 GB (mismo autor) | no disponible | no disponible | 1,032 / 54,5 % | swift-open-license-1.0 | GGUF PXQN, runtime PXA |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | referencia (precision completa) | no disponible | pesos originales |
| Qwen3.8-Flash-Next (modelo raiz) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de otros autores de la misma categoria.

## Limitaciones y advertencias

- Problema conocido: con contexto corto (1K), muestreo greedy y multi-token prediction desactivada, algunos prompts en chino pueden repetirse; el autor indica que con los ajustes por defecto (multi-token prediction activada) terminan limpiamente y que se esta trabajando en una correccion.
- Dependencia de runtime propietario: requiere PXA 4.0 beta 5 o posterior; no es utilizable con llama.cpp, vLLM, Ollama ni TGI, lo que limita la portabilidad y el ecosistema de herramientas.
- Formato propietario PXQN2: no es un GGUF estandar; la integracion con stacks existentes exige el launcher PXA Control.
- Reparto GPU/host: la tabla n-gram / PLE se sirve desde RAM del sistema, de modo que el rendimiento depende tambien del ancho de banda de memoria del host.
- Licencia: Swift Open License 1.0 con condiciones adicionales (LICENSE-QWEN, NOTICE, REDISTRIBUTOR-NOTICE.txt); es necesario revisar los terminos antes de uso comercial o redistribucion.
- Idiomas: no se listan idiomas soportados oficialmente; el multilingue se menciona de forma cualitativa.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Beta: el runtime PXA 4.0 esta en fase beta 5, lo que implica riesgo de inestabilidad en produccion.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/poisonxa/Swift-1.5-Qwen3.8-Flash-Next-PXQN2
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next
- Discord de PXA Network: https://discord.pxanetwork.com
- Reddit de PXA Network: https://www.reddit.com/r/PXANetwork/
