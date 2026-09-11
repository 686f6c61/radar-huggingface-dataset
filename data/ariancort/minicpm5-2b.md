# ariancort/MiniCPM5-2B

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de arquitectura Transformer con 2.516.756.480 parametros (~2,52B), segundo miembro de la serie MiniCPM5 de OpenBMB despues de MiniCPM5-1B. Esta disenado explicitamente para despliegue en dispositivo (on-device), inferencia local y entornos con recursos limitados, y segun su model card alcanza el estado del arte dentro de su clase de 2B, manteniendose competitivo frente a modelos de la clase 4B en codigo, matematicas, comprension de contexto largo, uso de herramientas y tareas agenticas. El repositorio analizado esta publicado por el usuario `ariancort` y reproduce la model card oficial de OpenBMB, que enlaza al repositorio `openbmb/MiniCPM5-2B`.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad declarada con `transformers` y text-generation-inference. Los idiomas declarados son ingles y chino (en, zh), y las etiquetas del repositorio destacan capacidades de contexto largo, tool calling, uso conversacional y despliegue en el borde.

Su relevancia actual radica en la franja de modelos de ~2-3B que pueden ejecutarse en hardware de consumo o en el propio dispositivo, un segmento donde la relacion entre calidad de razonamiento (codigo, matematicas, agentes) y coste de inferencia es critica. Conviene senalar que el repositorio analizado registra 0 descargas y 0 likes, por lo que no parece ser el punto de distribucion canonico del modelo, sino una copia o espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta de la libreria: `llama`; sin mezcla de expertos confirmada) |
| Parametros totales | 2.516.756.480 (~2,52B), dato real de los safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no especifica la cifra; el repositorio lleva la etiqueta `long-context`) |
| Tipos de cuantizacion | No disponible (solo se confirman pesos safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 5,0 GB |
| Pipeline | text-generation |
| Autor del repositorio | ariancort (model card y enlaces apuntan a OpenBMB) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un Transformer denso de ~2,52B parametros, presentado por OpenBMB como una ampliacion de la misma receta de entrenamiento empleada en MiniCPM5-1B. La etiqueta `llama` en el repositorio sugiere una arquitectura de tipo decoder-only compatible con el ecosistema Llama, aunque la informacion proporcionada no detalla la configuracion interna (numero de capas, dimension oculta, cabezas de atencion, tipo de atencion o mecanismo de RoPE). No hay indicios de mezcla de expertos ni de arquitecturas hibridas SSM en los datos disponibles.

Los datasets declarados permiten reconstruir las etapas del pipeline de entrenamiento: `Ultra-FineWeb`, `UltraX-Preview` y `Ultra-FineWeb-L3` para el preentrenamiento con datos web filtrados; `UltraData-Math` y `UltraData-Code` como datos de dominio especifico para matematicas y codigo; `UltraData-SFT-2605` y `UltraData-SFT-Agent-2609` para el ajuste supervisado general y agentico; y `UltraData-RL-2609` para una fase de aprendizaje por refuerzo. No se especifican el numero total de tokens de entrenamiento, la composicion porcentual del corpus ni los algoritmos concretos de alineacion (RLHF, DPO u otros). La model card cita dos referencias tecnicas: el informe MiniCPM (arXiv:2506.07900) y un segundo trabajo (arXiv:2602.09003) que no se describe en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte declarado para uso en chat.
- Razonamiento sobre codigo: la model card situa la capacidad de "Code Reasoning" entre las dimensiones destacadas del modelo.
- Razonamiento matematico: incluye un dataset de matematicas especifico (`UltraData-Math`) y un eje explicito en el grafico de capacidades.
- Seguimiento de instrucciones (instruction following), evaluado como eje independiente en la comparativa cualitativa del autor.
- Conocimiento general, tambien representado como eje propio en el grafico de capacidades.
- Comprension de contexto largo, con etiqueta `long-context` en el repositorio (sin cifra de tokens publicada).
- Tool calling / function calling: etiqueta `tool-calling` y dataset agentico `UltraData-SFT-Agent-2609`.
- Uso en agentes y razonamiento multi-paso, respaldado por la fase de SFT agentico y la fase de RL.
- Multilingue limitado a ingles y chino; no se declara soporte oficial de castellano.
- Optimizado para despliegue on-device y edge (etiquetas `on-device`, `edge-ai`).
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion proporcionada.

## Casos de uso

- Asistentes locales en dispositivo: el modelo, con ~2,52B parametros y 5,0 GB de pesos en precision completa, puede ejecutarse en portatiles y equipos de gama media para asistentes de escritorio o moviles sin enviar datos a la nube, lo que encaja con su orientacion on-device.
- Atencion al cliente automatizada: sus capacidades conversacionales y de tool calling permiten gestionar dialogos multi-turno y derivar acciones a sistemas externos (consultas de pedidos, cambios de estado) en un unico flujo.
- Agentes de automatizacion de tareas: la combinacion de tool calling y datos de entrenamiento agentico (`UltraData-SFT-Agent-2609`) lo hace adecuado para pipelines donde el modelo decide que herramienta invocar y encadena varios pasos.
- Generacion y revision de codigo en entornos locales: puede integrarse en editores o hooks de pre-commit para completar funciones, explicar fragmentos o detectar errores, evitando el envio de codigo propietario a servicios externos.
- Procesamiento de documentos largos: la orientacion a contexto largo permite resumir o extraer informacion de informes, contratos o transcripciones extensas, siempre que se confirme la ventana real soportada en la practica.
- Resolucion de problemas matematicos y tutoria: con un dataset de matematicas dedicado, sirve para asistentes educativos que explican paso a paso ejercicios de nivel secundario o universitario introductorio.
- Enrutamiento y preprocesado en pipelines mayores: por su tamano reducido, puede actuar como modelo de primera linea para clasificar intenciones, reformular consultas o decidir si una peticion debe escalarse a un modelo mayor.
- Aplicaciones en chino e ingles dentro de la misma base: util para productos bilingues dirigidos a esos dos mercados, sin necesidad de desplegar dos modelos distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un grafico radar cualitativo con seis ejes (razonamiento de codigo, razonamiento matematico, seguimiento de instrucciones, conocimiento general, contexto largo y uso de herramientas), pero no se acompanan de cifras numericas de MMLU, HumanEval, GSM8K u otros conjuntos de evaluacion, ni de los valores concretos del radar. La afirmacion de "SOTA en la clase 2B" y de competitividad frente a modelos de 4B es una declaracion del autor sin datos verificables en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos a partir de los 2,52B parametros, no datos oficiales): ~5,0-6,0 GB en bf16/fp16 (los pesos ocupan 5,0 GB y hay que sumar cache KV y overhead del runtime); ~2,5-3,5 GB en cuantizacion de 8 bits; ~1,3-2,0 GB en cuantizacion de 4 bits.
- GPU de centro de datos: cualquier A100, H100, L40S o A10 puede servirlo con margen amplio; tambien es viable en GPUs mas modestas como T4 o L4.
- GPU de consumo: cabe en tarjetas con 6-8 GB o mas, como RTX 3060 12 GB, RTX 4060/4060 Ti, RTX 4070 y RTX 4090, estas dos ultimas con contexto amplio y lotes mayores.
- Dispositivos integrados: al ser un modelo orientado a edge, es candidato para Apple Silicon (unificada), SoCs de movil de gama alta y mini-PC con GPU integrada, siempre que se disponga de una cuantizacion adecuada.
- Opciones de despliegue: `transformers` de forma nativa; el repositorio incluye la etiqueta `text-generation-inference`, por lo que TGI es una via soportada. vLLM, llama.cpp, Ollama u otros runtimes son plausibles, pero no estan confirmados en la informacion proporcionada (no se documentan pesos GGUF).
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni latencias en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B | 2,52B (denso) | No disponible | Sin cifras publicadas; el autor reclama SOTA en la clase 2B y competitividad con modelos de 4B | Apache 2.0 | Pesos safetensors en HuggingFace (repositorio analizado con 0 descargas; existe el repositorio oficial de OpenBMB) |
| MiniCPM5-1B | ~1B por nomenclatura (no confirmado en la informacion) | No disponible | No disponible | Apache 2.0 (segun la serie) | HuggingFace (`openbmb/MiniCPM5-1B`, citado en la model card) |
| Modelos de clase 4B citados en la model card | ~4B (no especificado) | No disponible | No disponible; la model card afirma que MiniCPM5-2B es competitivo con ellos, sin nombrarlos ni aportar cifras | No disponible | No especificado |

No se dispone de datos de terceros ni de modelos comparables concretos (Qwen, Llama, Gemma de tamano similar) en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de datos de benchmarks numericos: las afirmaciones de "SOTA de clase 2B" y de competitividad con modelos de 4B provienen de la propia model card y no pueden verificarse con el material disponible.
- Riesgo de alucinacion inherente a un modelo de ~2,5B: la capacidad de conocimiento factual es limitada y no debe usarse como fuente de verdad sin verificacion externa.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad; los corpus de entrenamiento son mayoritariamente web (Ultra-FineWeb y derivados), lo que arrastra los sesgos habituales de ese tipo de datos.
- Cobertura idiomatica restringida a ingles y chino; el castellano no esta soportado oficialmente y su rendimiento en ese idioma es incierto.
- Longitud de contexto no especificada: aunque el modelo se etiqueta como `long-context`, no se publica la cifra exacta, lo que dificulta dimensionar la cache KV y planificar el despliegue.
- Cuantizaciones no documentadas: no se confirman pesos GGUF, AWQ o GPTQ, de modo que el despliegue en llama.cpp u Ollama requeriria convertir los pesos por cuenta propia.
- Repositorio con 0 descargas y 0 likes: no hay validacion de la comunidad sobre esta copia concreta; se recomienda contrastar con el repositorio oficial de OpenBMB antes de usarla en produccion.
- El contenido de la model card es promocional (graficos radar y afirmaciones de SOTA) y esta orientado a marketing; conviene tratarlo con cautela.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero exige conservar los avisos de licencia y no concede derechos de marca; verificar tambien las condiciones de los datasets de OpenBMB si se va a reentrenar.
- Produccion: no se documentan limites de velocidad, soporte de herramientas en paralelo ni comportamiento bajo cargas concurrentes, aspectos que deben evaluarse con pruebas propias.

## Enlaces

- Modelo en HuggingFace (repositorio analizado): https://huggingface.co/ariancort/MiniCPM5-2B
- Repositorio oficial en HuggingFace citado en la model card: https://huggingface.co/openbmb/MiniCPM5-2B
- Version en chino de la model card: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md
- Modelo predecesor: https://huggingface.co/openbmb/MiniCPM5-1B
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Informe tecnico MiniCPM (arXiv:2506.07900): https://arxiv.org/pdf/2506.07900
- Segunda referencia tecnica citada (arXiv:2602.09003): https://arxiv.org/abs/2602.09003
- Wiki de MiniCPM (en chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Conjunto de datos UltraData: https://ultradata.openbmb.cn/

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo (los enlaces obtenidos correspondian a paginas de soporte de Microsoft ajenas al tema), por lo que no se han podido incorporar fuentes externas adicionales.
