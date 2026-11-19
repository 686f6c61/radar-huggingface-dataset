# prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP

## Resumen

Sage-A1.5-MXFP4_MOE-MTP es una cuantizacion en formato GGUF del modelo Sage-A1.5, un modelo multimodal de arquitectura Mixture-of-Experts (MoE) desarrollado originalmente por Shanghai AI Laboratory (InternScience) y publicado como base en el repositorio `InternScience/Sage-A1.5`. La version aqui documentada la ha preparado el usuario prithivMLmods aplicando cuantizacion MXFP4 especifica para capas MoE, junto con soporte de Multi-Token Prediction (MTP) para decodificacion especulativa en llama.cpp, vLLM y SGLang.

El modelo esta disenado para tareas de resolucion de problemas cientificos de largo horizonte, flujos de ingenieria complejos y descubrimiento cientifico abierto. Incorpora integracion nativa de herramientas y dos paradigmas opcionales de ejecucion: orquestacion agentica, que despacha subagentes paralelos con contextos aislados mediante `spawn_subagent`, y un modo de verificacion que audita evidencias y revisa estrategias dentro de la propia cadena de razonamiento sin critico externo. Cuenta con una ventana de contexto nativa de 256K tokens, extensible a 512K mediante YaRN, y un total de 35.505.251.456 parametros.

La relevancia de esta ficha concreta reside en que el autor ha empaquetado el modelo en cuantizaciones GGUF de alta eficiencia (entre 18,6 GB y 71,1 GB), lo que permite ejecutarlo en GPUs profesionales de gama alta con decodificacion especulativa integrada en los propios pesos, reduciendo la latencia frente a esquemas que requieren un modelo borrador separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, transformer, con Multi-Token Prediction (MTP) |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens nativos; extensible a 512K mediante YaRN |
| Tipos de cuantizacion | BF16, MXFP4_MOE, Q3_K_L, Q5_K_M, Q6_K, mmproj-bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con variantes de cuantizacion); safetensors en el modelo base |
| Tamano del repo | 165,3 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | InternScience/Sage-A1.5 |
| Descargas | 3.731 |

## Arquitectura y entrenamiento

Sage-A1.5 es un modelo MoE multimodal construido sobre Agents-A1, con un total de 35,5B parametros. La arquitectura combina capas de mezcla de expertos con procesamiento multimodal (vision y lenguaje, mediante el fichero de proyeccion `mmproj-bf16.gguf`). El modelo incorpora Multi-Token Prediction (MTP), un mecanismo que anade cabezas de salida adicionales dentro de la arquitectura principal para predecir varios tokens futuros en una sola pasada, lo que habilita decodificacion especulativa sin necesidad de un modelo borrador externo.

El detalle de la composicion del dataset de entrenamiento y el numero exacto de tokens utilizados no se especifican en la informacion proporcionada. La model card menciona dos paradigmas de ejecucion distintivos: la orquestacion agentica, que permite despachar subagentes paralelos con contextos aislados para descomponer e investigar subpreguntas de forma concurrente, y el modo de verificacion, un mecanismo de autoevaluacion en trayectoria que audita la evidencia y corrige estrategias improductivas dentro de la propia cadena de pensamiento. No se detalla si hubo fases de RLHF o DPO en el entrenamiento.

Esta version concreta es una cuantizacion realizada con llama.cpp por prithivMLmods. La variante MXFP4_MOE aplica precision mixta optimizada para las capas MoE, logrando un fichero de 20,3 GB para un modelo de 35,5B parametros, con soporte de decodificacion especulativa MTP (`--spec-type draft-mtp`) integrado en los pesos.

## Capacidades

- Generacion de texto y razonamiento de largo horizonte orientado a problemas cientificos y de ingenieria.
- Capacidad multimodal: procesamiento de imagenes y texto mediante el proyector `mmproj-bf16.gguf`.
- Integracion nativa de herramientas (tool-use) y soporte de function calling.
- Orquestacion agentica multi-paso mediante `spawn_subagent`, con despacho de subagentes paralelos en contextos aislados.
- Modo de verificacion (self-review) dentro de la cadena de razonamiento, sin critico externo.
- Generacion de codigo y resolucion de tareas de ingenieria de software.
- Decodificacion especulativa mediante Multi-Token Prediction (MTP) para acelerar la inferencia local.
- Capacidades de busqueda y navegacion (evaluado en BrowseComp).
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Investigacion cientifica asistida: el modelo puede descomponer preguntas cientificas complejas en subproblemas y lanzar subagentes paralelos con `spawn_subagent` para investigar cada rama de forma concurrente, aprovechando su contexto de 256K tokens para retener evidencias de multiples fuentes.
- Ingenieria de software en produccion: con soporte nativo de tool calling y un resultado de 61,2 en SWE-bench Pro, puede integrarse en pipelines de CI/CD para resolver issues, generar parches y validar cambios dentro de un flujo agentico.
- Analisis de documentos tecnicos extensos: su ventana de 256K tokens (512K con YaRN) permite procesar manuales, papers o expedientes completos sin fragmentacion, con capacidad de revision interna mediante el modo de verificacion.
- Automatizacion de flujos con multiples herramientas: la orquestacion agentica le permite encadenar llamadas a APIs, busquedas web y ejecucion de codigo en tareas de varias etapas, con contextos aislados por subagente.
- Procesamiento de documentos con vision: mediante el proyector multimodal puede interpretar figuras, tablas y diagramas tecnicos, util en tareas de digitalizacion y extraccion de datos estructurados (evaluado en OmniDocBench).
- Despliegue local con latencia reducida: gracias a la cuantizacion MXFP4_MOE (20,3 GB) y MTP, puede ejecutarse con offloading completo en una unica GPU profesional con 96 GB de VRAM, alcanzando velocidades de generacion de cientos de tokens por segundo, adecuado para prototipado y entornos sin acceso a APIs en la nube.
- Agentes de navegacion e investigacion web: con un resultado de 82,8 en BrowseComp, puede emplearse en tareas de recopilacion y sintesis de informacion de fuentes en linea.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Benchmark | Resultado |
|---|---|
| GAIA | 95,1 (SOTA general) |
| OmniDocBench | 91,5 |
| XBench-DS-2510 | 92,0 |
| PinchBench | 90,0 |
| IFBench | 81,6 |
| FrontierScience-Olympiad | 81,0 |
| SWE-bench Pro | 61,2 |
| BrowseComp | 82,8 |

Metricas de inferencia medidas con la cuantizacion MXFP4_MOE en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM), con `llama-cli`, contexto de 8.192 tokens y KV cache en q8_0:

| Metrica | Valor |
|---|---|
| Velocidad de procesamiento de prompt | 94,1 tokens/s |
| Velocidad de generacion | 270,4 tokens/s |
| Tiempo total de ejecucion | 20,216 s |
| VRAM pico | 19,72 GiB |
| Utilizacion de GPU pico | 81% |
| Capas offloaded | 99 (`-ngl 99`) |
| Tokens draft maximos (MTP) | 2 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 20,3 GB con MXFP4_MOE, 18,6 GB con Q3_K_L, 25,3 GB con Q5_K_M, 29,2 GB con Q6_K y 71,1 GB con BF16. La medicion real con MXFP4_MOE mostro un pico de 19,72 GiB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) es la GPU en la que se han publicado las mediciones. Para las cuantizaciones mas ligeras, GPUs con 24 GB o mas (RTX 4090, A6000) podrian alojar el modelo, aunque no se han publicado metricas para esas configuraciones.
- Cabe en GPU consumer: la cuantizacion MXFP4_MOE (20,3 GB) y la Q3_K_L (18,6 GB) podrian caber en GPUs consumer de 24 GB como la RTX 4090, si bien no hay datos de rendimiento publicados para esos casos.
- Opciones de despliegue: llama.cpp (con soporte de decodificacion especulativa MTP via `--spec-type draft-mtp`), vLLM y SGLang mencionados en la model card, y ecosistema transformers. El pipeline declarado es text-generation-inference.
- Latencia y throughput: con MTP y plena offloading en la RTX PRO 6000, 94,1 tokens/s de procesamiento de prompt y 270,4 tokens/s de generacion. El rendimiento variara segun la GPU, la cuantizacion y la configuracion.

Comando de referencia para ejecucion con llama.cpp:

```bash
./build/bin/llama-cli \
  -m /path/to/models/Sage-A1.5.MXFP4_MOE.gguf \
  --spec-type draft-mtp \
  --spec-draft-n-max 2 \
  -ngl 99 \
  -c 8192 \
  --cache-type-k q8_0 \
  --seed 42 \
  -n 4096 \
  -st \
  -p "Your prompt here"
```

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos verificables de otros modelos comparables de 35B MoE con licencia Apache 2.0 en la misma categoria. A continuacion se comparan las propias variantes de cuantizacion del modelo, que constituyen la referencia practica para elegir despliegue:

| Variante | Tipo | Tamano | Calidad | Uso recomendado |
|---|---|---|---|---|
| Sage-A1.5.BF16.gguf | BF16 | 71,1 GB | Maxima | Entornos con 80 GB o mas de VRAM |
| Sage-A1.5.MXFP4_MOE.gguf | MXFP4_MOE | 20,3 GB | Alta, optimizada para MoE | Recomendada si el motor soporta MXFP4 |
| Sage-A1.5.Q6_K.gguf | Q6_K | 29,2 GB | Muy alta, casi perfecta | Recomendada con 32 GB o mas |
| Sage-A1.5.Q5_K_M.gguf | Q5_K_M | 25,3 GB | Alta | Recomendada como equilibrio |
| Sage-A1.5.Q3_K_L.gguf | Q3_K_L | 18,6 GB | Usable, menor | RAM/VRAM limitada |

## Limitaciones y advertencias

- Idioma: la model card declara unicamente soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Sesgos: no se documentan en la informacion disponible; al ser un modelo de tipo agentico y cientifico, es probable que herede sesgos de sus datos de entrenamiento, que no se detallan.
- Alucinacion: no se han publicado tasas de alucinacion ni evaluaciones especificas; el modo de verificacion mitiga parcialmente el riesgo, pero no lo elimina.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `InternScience/Sage-A1.5` y los terminos de los componentes multimodales.
- Ejecucion MTP: la decodificacion especulativa requiere que el motor de inferencia soporte el formato MTP GGUF; en llama.cpp se activa con `--spec-type draft-mtp` y `--spec-draft-n-max 2`. Fuera de ese ecosistema, el beneficio desaparece.
- Cuantizacion: las metricas publicadas corresponden exclusivamente a MXFP4_MOE sobre una RTX PRO 6000 Blackwell; el rendimiento en otras GPUs o cuantizaciones no esta verificado.
- Contexto: aunque el modelo soporta 256K nativos y 512K con YaRN, la prueba de rendimiento se realizo con solo 8.192 tokens; el comportamiento con contextos largos no esta cuantificado.
- Uso en produccion: al tratarse de una cuantizacion de terceros, conviene validar la paridad de calidad frente al modelo base antes de desplegar en entornos criticos.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- Fichero MXFP4_MOE: https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP-GGUF/blob/main/Sage-A1.5.MXFP4_MOE.gguf
- Fichero BF16: https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP-GGUF/blob/main/Sage-A1.5.BF16.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP-GGUF/blob/main/Sage-A1.5.mmproj-bf16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor de la cuantizacion: https://huggingface.co/prithivMLmods
