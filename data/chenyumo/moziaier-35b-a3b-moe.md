# chenyumo/MoziAier-35B-A3B-MOE

## Resumen

MoziAier-35B-A3B-MOE (publicado como MoziAier-35B-V3.9) es un modelo de lenguaje multimodal de tipo Mixture of Experts (MoE) con 35.000 millones de parametros totales, desarrollado por el equipo de Chen Yumo. Se construye sobre el modelo base Occamy-1.0-35B-A3B, que sigue la arquitectura Qwen3.6-35B-A3B, y esta orientado al dominio financiero, con soporte de vision, tool calling y tareas de horizonte largo. La version V3.9 se publica el 23 de noviembre de 2026.

La relevancia de esta entrega reside en tres puntos: la mejora de la estabilidad en tareas multi-paso sobre una ventana de contexto de clase 250K, la reduccion del peso del fichero principal hasta 12,99 GB mediante la cuantizacion hibrida propietaria MoziSmartBit (IQ3_XXS en las capas de expertos con imatrix de Occamy) y la inclusion de la plantilla de chat dentro del propio GGUF, lo que elimina la dependencia de ficheros jinja externos. El modelo se distribuye unicamente en formato GGUF para llama.cpp y declara licencia de uso comercial libre.

La propuesta se posiciona como una opcion de despliegue local en GPU de consumo, con un suelo de 8 GB de VRAM mediante offload a RAM del sistema y un objetivo recomendado de 16 GB para 192K de contexto. No incluye cabeza MTP, por lo que la decodificacion especulativa debe permanecer desactivada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura Qwen3.6-35B-A3B, base Occamy-1.0-35B-A3B) |
| Parametros totales | 35B |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (262.144 tokens) |
| Tipos de cuantizacion | IQ3_XXS hibrida (MoziSmartBit) sobre capas de expertos; mmproj en Q8_0; KV cache q4_0 |
| Idiomas soportados | en, zh (chino especialmente ajustado) |
| Licencia | other (la model card indica uso comercial libre) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer con capas de mezcla de expertos (MoE) heredado de la familia Qwen3.6, concretamente sobre el checkpoint Occamy-1.0-35B-A3B. Sobre esa base, el equipo aplica su propio corpus financiero, una metodologia de entrenamiento propia, un marco de razonamiento de siete dimensiones y un mecanismo de agente denominado LOOP orientado a la autoverificacion en tareas complejas. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, y tampoco especifica si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica mas destacable es la cuantizacion hibrida MoziSmartBit, que combina IQ3_XXS en las capas de expertos con la imatrix de Occamy y reporta una perplejidad de 8,3044, solo un 0,47 % por encima de BF16. Esta version prescinde de la cabeza MTP, lo que implica que la decodificacion especulativa no esta soportada. El modelo incorpora ademas un proyector multimodal mmproj en Q8_0 (0,57 GB) para el procesamiento de imagenes.

## Capacidades

- Generacion de texto y razonamiento estructurado mediante un marco de siete dimensiones que adapta la profundidad del pensamiento a la complejidad de la tarea.
- Razonamiento multi-paso de horizonte largo: ejecucion estable de decenas de llamadas a herramientas y analisis de documentos extensos sobre contexto de clase 250K.
- Tool calling y function calling, con formato correcto en turno unico y multi-turno y soporte de llamadas en paralelo.
- Capacidades de agente con mecanismo LOOP de autoverificacion para tareas complejas.
- Vision: lectura de capturas de pantalla locales y de graficos.
- Dominio financiero: preguntas y respuestas financieras y codificacion de estrategias cuantitativas.
- Multilingue con ingles y chino, con ajuste especifico en chino.
- Modo sin censura (uncensored) para uso totalmente local y privado.
- Plantilla de chat embebida en el GGUF.

## Casos de uso

- Analisis de documentos financieros extensos: el modelo puede procesar informes anuales, prospectos o transcripciones de resultados completos dentro de una ventana de 250K tokens, manteniendo la coherencia entre secciones y recordando hechos plantados a lo largo del documento.
- Agentes de investigacion con multiples herramientas: gracias al tool calling en paralelo y al mecanismo LOOP, puede encadenar decenas de llamadas a APIs financieras, bases de datos y calculadoras sin perder el hilo de la tarea.
- Generacion y revision de codigo cuantitativo: adecuado para escribir y depurar estrategias de trading, backtests y pipelines de datos, con soporte de razonamiento multi-paso sobre repositorios de varios ficheros.
- Asistente local de atencion al cliente en banca: despliegue en una GPU de 16 GB con 192K de contexto para gestionar conversaciones multi-turno con historial largo y documentacion de producto adjunta.
- Extraccion de datos de graficos e imagenes: el proyector mmproj permite leer capturas de pantalla de paneles de mercado y tablas de resultados para convertirlas en datos estructurados.
- Despliegue en entornos con privacidad estricta: al ser un modelo sin censura y totalmente local, encaja en escenarios donde los datos no pueden salir de la infraestructura de la organizacion.
- Prototipado en hardware de consumo: con 8 GB de VRAM y offload a RAM permite pruebas funcionales en portatiles con GPU discreta modesta antes de escalar a servidores.

## Benchmarks y rendimiento

La model card no publica cifras numericas propias de MMLU, GSM8K ni HumanEval; remite a los resultados oficiales del modelo base Occamy-1.0. Los unicos datos medidos que se aportan son los siguientes:

| Metrica | Resultado |
|---|---|
| Perplejidad tras cuantizacion | 8,3044 (+0,47 % frente a BF16) |
| Contexto largo | Prueba de estres de clase 250K superada; recuperacion precisa de hechos plantados |
| Tool calling | Formato correcto en turno unico y multi-turno; llamadas paralelas soportadas |
| Vision | Comprension de capturas de pantalla y lectura de graficos verificadas |

No se han publicado resultados de benchmarks numericos comparables (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM minima: 8 GB, con offload de capas a RAM del sistema (contexto de 16K a 32K, KV cache q4_0); funcional pero mas lento.
- VRAM recomendada: 16 GB para 192K de contexto con unos 0,4 GB de margen; 24 GB o mas para 256K con vision.
- Caso limite documentado: 16 GB con contexto de 250K mide aproximadamente 15,5 GB de VRAM, por lo que el autor recomienda probarlo en el hardware concreto.
- La KV cache debe ser q4_0; con q8_0 el consumo sube lo suficiente como para no caber en una GPU de 16 GB.
- Cabe en GPU de consumo: si, en tarjetas de 8, 12, 16 y 24 GB con los presets indicados.
- Opciones de despliegue: llama.cpp (llama-server con `-ngl 999`, `-fa on`, `-ctk q4_0 -ctv q4_0`, `--jinja`), Ollama (mediante Modelfile), LM Studio y Jan. No se mencionan vLLM ni TGI.
- Throughput y latencia: no disponibles en la informacion proporcionada. El autor advierte que el modo con offload a RAM es mas lento.
- La decodificacion especulativa debe permanecer desactivada al no existir cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MoziAier-35B-A3B-MOE (V3.9) | 35B MoE | 256K | GGUF | other (uso comercial libre segun el autor) | Multimodal, financiero, sin censura, plantilla embebida |
| Occamy-1.0-35B-A3B (modelo base) | 35B MoE | no disponible | no disponible | no disponible | Referencia de evaluacion oficial citada por el autor |
| Qwen3.6-35B-A3B (arquitectura de referencia) | 35B MoE | no disponible | no disponible | no disponible | Familia arquitectonica sobre la que se construye el modelo |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al estar ajustado principalmente en chino e ingles, el rendimiento en otros idiomas, incluido el castellano, es incierto.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en dominio financiero donde los errores pueden tener consecuencias economicas; se recomienda verificacion humana en produccion.
- La licencia figura como "other": aunque el autor declara uso comercial libre, conviene revisar los terminos exactos antes de un despliegue comercial, especialmente por las obligaciones heredadas del modelo base.
- El modelo esta marcado como "uncensored", lo que implica menor filtrado de contenido sensible y traslada al operador la responsabilidad de moderacion.
- Solo se distribuye en GGUF (IQ3_XXS), sin pesos BF16 ni safetensors; no hay soporte para vLLM ni TGI en la informacion disponible.
- La decodificacion especulativa no esta soportada (sin cabeza MTP); activarla puede degradar el rendimiento o producir comportamientos inesperados.
- La KV cache debe ser q4_0; usar q8_0 rompe los presets de VRAM documentados.
- El contexto de 250K en 16 GB de VRAM es un caso limite que el propio autor recomienda validar en cada hardware.
- No se publican cifras de benchmarks estandar (MMLU, HumanEval, GSM8K), lo que dificulta la comparacion objetiva con alternativas.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/chenyumo/MoziAier-35B-A3B-MOE
- Model card en chino simplificado: README.zh.md (referenciado en la model card)
- Model card en chino tradicional: README.zh-hant.md (referenciado en la model card)
- Model card en japones: README.ja.md (referenciado en la model card)
- Model card en coreano: README.ko.md (referenciado en la model card)
- Model card en hindi: README.hi.md (referenciado en la model card)
- Model card en aleman: README.de.md (referenciado en la model card)
- Model card en frances: README.fr.md (referenciado en la model card)
- Model card en neerlandes: README.nl.md (referenciado en la model card)
- Model card en italiano: README.it.md (referenciado en la model card)
- Model card en ruso: README.ru.md (referenciado en la model card)
- ModelScope y GitHub: mencionados por el autor como canales de descarga, sin URL concreta en la informacion disponible.
