# ayshinko/Swift-Bonsai-2-27B-Katana-MTP-GGUF

## Resumen

Swift Bonsai 2 27B Katana MTP GGUF es una integración comunitaria publicada por el usuario Ayshinko que empaqueta en un único archivo GGUF el modelo Swift Bonsai 2 27B (de UkisAI) junto con una cabeza de decodificación especulativa MTP (Multi-Token Prediction). Swift Bonsai 2 es, a su vez, un ajuste fino orientado a eficiencia de razonamiento sobre Ternary Bonsai 2 27B de PrismML, que es una derivada con pesos ternarios de Qwen3.8 27B. No se trata por tanto de un modelo fundacional original, sino de un trabajo de ingeniería independiente sobre una cadena de derivaciones que arranca en el modelo de Qwen.

El interés principal de esta ficha está en el formato de despliegue: el modelo completo de 27.320.697.856 parámetros (unos 27,3 mil millones) cabe en un archivo de 6,40 GB gracias a la cuantización ternaria PTQ1_0 de los pesos matriciales (valores en {-1, 0, +1}) con escalas de grupo en FP16, más una cabeza MTP cuantizada en Q8_0. Según la documentación del modelo base, Ternary Bonsai 2 27B conserva el 98,2 % del rendimiento de benchmarks de Qwen3.8 27B con una huella unas nueve veces menor.

Es relevante ahora porque demuestra que un modelo multimodal de 27B con entrada de visión puede ejecutarse en una GPU de consumo (el autor documenta un perfil validado en una RTX 4070 SUPER de 12 GB con 40.960 tokens de contexto) usando decodificación especulativa MTP integrada en llama.cpp. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha y fue creado el 24 de septiembre de 2026, por lo que se trata de una publicación muy reciente y sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (el modelo base se describe como hybrid-attention; los tags del repo incluyen mamba2) sobre backbone Qwen3.8 27B, con pesos ternarios y cabeza MTP de decodificación especulativa |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 40.960 tokens en el perfil recomendado por el autor; fuentes de terceros atribuyen al modelo base una ventana de 262.144 tokens |
| Tipos de cuantizacion | PTQ1_0 (ternario) en los pesos principales, Q8_0 en la cabeza MTP; torre de visión en 4 bits; caché KV configurable en q8_0 o f16 |
| Idiomas soportados | no disponible |
| Licencia | prism-bonsai-community (etiquetada como "other"; condiciones en el NOTICE enlazado por el autor) |
| Formato de pesos | GGUF (archivo único: `Swift-Bonsai-2-27B-Katana-PTQ1_0-MTP-Q8_0.gguf`, 6.397.969.728 bytes) |

## Arquitectura y entrenamiento

El backbone es Qwen3.8 27B, descrito en la documentación de PrismML como un modelo de lenguaje causal con atención híbrida. Sobre él, PrismML aplicó una cuantización ternaria de extremo a extremo: los pesos matriciales de embeddings, atención, MLPs y la cabeza LM toman valores en {-1, 0, +1} en una base rotada fija, con escalas de grupo en FP16. La torre de visión se gestiona por separado y se mantiene en 4 bits, lo que permite la entrada de imágenes junto al texto. El resultado es Ternary Bonsai 2 27B, que ocupa 5,9 GB y, según la nota de prensa de PrismML, retiene el 98,2 % del rendimiento agregado de Qwen3.8 27B.

Sobre esa base, UkisAI produjo Swift Bonsai 2 mediante un ajuste fino de eficiencia de razonamiento que reduce el exceso de verbosidad en las cadenas de pensamiento manteniendo la calidad de salida. La contribución de Ayshinko en este repositorio es triple: la cuantización PTQ1_0 empaquetada en GGUF, la integración de una cabeza MTP que habilita generación especulativa de tokens (modo `draft-mtp` con longitud de borrador configurable) y el soporte en un fork compatible con el PR218 de llama.cpp, además de una interfaz de gestión (Prism Model Manager). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El tag "uncensored" del repositorio indica que el ajuste elimina o atenúa los rechazos del modelo original, aunque no se especifica la metodología empleada.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado como `image-text-to-text`.
- Entrada multimodal de visión: acepta imágenes junto con texto, ya que el modelo base incorpora una torre de visión en 4 bits.
- Razonamiento con control de presupuesto: Prism Model Manager expone controles de "reasoning budget" o esfuerzo de razonamiento.
- Decodificación especulativa MTP integrada mediante el modo `draft-mtp`, con longitud de borrador configurable (1 o 2 según el perfil recomendado) para acelerar la inferencia local.
- Capacidades agénticas: la documentación de PrismML del modelo base menciona capacidades multimodales y agénticas, aunque no se detalla el soporte concreto de tool calling o function calling en la información disponible.
- Carga opcional de adaptadores LoRA si se verifica la compatibilidad (según el autor, con posibilidad de usar un LoRA de la comunidad para el modo "uncensored-ready").
- Modelo orientado a contenido sin censura según los tags del repositorio, con el caveat de que no se documenta el procedimiento de entrenamiento asociado.

## Casos de uso

- Asistente local de escritorio con visión: el modelo puede gestionar conversaciones multi-turno sobre capturas de pantalla o fotografías en una GPU de consumo, gracias a la combinación de torre de visión en 4 bits y pesos ternarios de 6,4 GB.
- Analítica de documentos escaneados en local: extracción y resumen de información a partir de imágenes de páginas, sin enviar datos a servicios externos, aprovechando el pipeline image-text-to-text y la ventana de 40.960 tokens configurable.
- Inferencia en estaciones de trabajo con RTX 4070 SUPER o similar: el perfil del autor (NGL 99, CTX 40960, caché KV q8_0, Flash Attention activado, MTP en modo draft-mtp) permite ejecutar el modelo completo con todas las capas en GPU.
- Aceleración de prototipos de razonamiento: la cabeza MTP permite probar decodificación especulativa en llama.cpp sin necesidad de un modelo borrador externo, útil para medir ganancias de throughput en hardware concreto.
- Despliegue de un endpoint OpenAI-compatible local: Prism Model Manager expone la API en `http://127.0.0.1:8080/v1`, de modo que puede integrarse con clientes que hablen el protocolo de OpenAI para desarrollo de agentes o pipelines internos.
- Ajuste fino ligero con LoRA: si se verifica la compatibilidad de adaptadores, el GGUF puede servir como base para personalizaciones de dominio sin desplegar el modelo completo en precisión alta.
- Evaluación comparativa de cuantización ternaria: investigadores interesados en cuantización extrema pueden reproducir el binario y medir el impacto de PTQ1_0 frente a alternativas en FP16 o Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos del modelo KATANA en la información disponible. Los únicos datos cuantitativos corresponden al modelo base Ternary Bonsai 2 27B, publicados por PrismML, y se recogen aquí con esa salvedad:

| Metrica | Ternary Bonsai 2 27B (base) | Qwen3.8 27B (referencia) |
|---|---|---|
| Rendimiento agregado (evaluación de PrismML) | 83.9 | 85.4 |
| Retencion respecto al modelo completo | 98,2 % | 100 % |
| Huella del modelo | 5,9 GB | no disponible |

No se dispone de cifras de MMLU, HumanEval, GSM8K ni de métricas de latencia o tokens por segundo para este repositorio concreto.

## Requisitos de hardware

- Tamano del archivo: 6,40 GB en un unico GGUF, por lo que requiere al menos 8 GB de VRAM para cargar los pesos, sin contar la cache KV.
- Perfil validado por el autor: RTX 4070 SUPER de 12 GB con CTX 40960, NGL 99, cache KV K y V en q8_0, batch 2048, ubatch 512, Flash Attention activado y MTP en draft-mtp con draft max 1.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas (RTX 4070 SUPER, 4070 Ti, 4080, 4090). En tarjetas de 8 GB puede requerir reducir el contexto o usar cache KV mas agresiva.
- GPU recomendadas: cualquier NVIDIA con CUDA y driver R550 o superior para el backend incluido; el autor no documenta perfiles para A100 o H100, aunque deberian funcionar con el backend llama.cpp adecuado.
- Plataforma del gestor: Prism Model Manager v3.0.1 es Linux x86_64 unicamente; no hay versiones nativas para Windows ni macOS.
- Opciones de despliegue: llama.cpp (incluido el fork Prism compatible con PR218 de llama-server), Prism Model Manager, y cualquier runtime que consuma GGUF con soporte de la arquitectura subyacente. El endpoint local es compatible con la API de OpenAI.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni comparativas de velocidad con y sin MTP.
- La longitud de borrador del MTP es configurable: valores mas altos pueden acelerar la generacion a costa de mas VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift Bonsai 2 27B Katana MTP GGUF (este repo) | 27,3B | 40.960 en perfil recomendado (262.144 en el base segun terceros) | PTQ1_0 ternario + MTP Q8_0 | prism-bonsai-community | GGUF unico de 6,4 GB en HuggingFace |
| Ternary Bonsai 2 27B (prism-ml) | 27B | 262.144 segun fuentes de terceros | Ternario de extremo a extremo, vision en 4 bits | prism-bonsai-community | Pesos originales de PrismML |
| Swift Bonsai 2 27B (ukisai) | 27B | no disponible | Pesos sin cuantizar del ajuste de eficiencia | no disponible | HuggingFace |
| Qwen3.8 27B (modelo base sin comprimir) | 27B | no disponible | FP16 | licencia de Qwen | HuggingFace |

La comparativa con alternativas de otros fabricantes no esta disponible porque la informacion proporcionada solo cubre la cadena Bonsai de PrismML.

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, publicado el 24 de septiembre de 2026. No hay validacion independiente de la calidad del binario ni del shard SHA256 mas alla del publicado por el autor (`0afebbb46725b01b4b3995dc523c23639f75116f956d85a2f4975377fc9dc629`).
- Licencia restrictiva en la practica: la licencia es `prism-bonsai-community`, etiquetada como "other" y enlazada a un NOTICE en el repositorio de PrismML. Es imprescindible leer ese documento antes de cualquier uso comercial, ya que no se confirman los terminos en la informacion disponible.
- Modelo no fundacional: es una derivacion en cuarta generacion (Qwen3.8 27B -> Ternary Bonsai 2 -> Swift Bonsai 2 -> KATANA). Los sesgos y limitaciones del modelo original se heredan y se amplifican con cada etapa de ajuste.
- Etiqueta "uncensored": el ajuste elimina o reduce los rechazos del modelo base. Esto implica mayor riesgo de generar contenido inapropiado, sesgado o factualmente incorrecto, y complica el cumplimiento normativo en despliegues publicos.
- Riesgo de alucinacion: la cuantizacion ternaria agresiva (valores en {-1, 0, +1}) y los ajustes de eficiencia de razonamiento pueden degradar la fidelidad en tareas que requieren precision numerica o recuperacion de hechos poco frecuentes.
- Idiomas soportados: no disponible. No hay confirmacion de cobertura multilingue mas alla de lo que herede Qwen3.8 27B.
- Dependencia de un backend concreto: el gestor recomendado (Prism Model Manager v3.0.1) solo funciona en Linux x86_64 con GPU NVIDIA y driver CUDA R550 o superior.
- Integracion MTP: la decodificacion especulativa con MTP requiere el fork compatible con el PR218 de llama.cpp. En backends estandar puede que la cabeza MTP no se aproveche o que el modelo no cargue correctamente.
- Sin benchmarks propios: no hay evaluaciones publicadas del efecto de PTQ1_0 ni de la cabeza MTP sobre la calidad final, solo los datos del modelo base.
- Precaucion con el contenido de la model card: buena parte del README es documentacion de instalacion de una herramienta de terceros (Prism Model Manager, licencia MIT, no afiliada a PrismML), no del modelo en si.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ayshinko/Swift-Bonsai-2-27B-Katana-MTP-GGUF
- Documentacion de Ternary Bonsai 2 27B (PrismML): https://docs.prismml.com/bonsai-2-27b
- Documentacion general de la familia Bonsai 27B: https://docs.prismml.com/models/bonsai-27b
- Nota de prensa de Bonsai 2 27B (PrismML): https://prismml.com/news/bonsai-2-27b
- Coleccion Bonsai 27B en HuggingFace: https://huggingface.co/collections/prism-ml/bonsai-27b
- Pesos originales de Ternary Bonsai 2 27B: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo Swift Bonsai 2 de UkisAI: https://huggingface.co/ukisai/Swift-Bonsai-2
- Ficha de referencia de Ternary Bonsai 2 27B en llmreference: https://www.llmreference.com/model/bonsai-2-27b
- Repositorio de Prism Model Manager: https://github.com/Ayshinko/prism-model-manager
- Ultima release de Prism Model Manager: https://github.com/Ayshinko/prism-model-manager/releases/latest
- Licencia y NOTICE: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/NOTICE.md
- Perfil del autor en HuggingFace: https://huggingface.co/ayshinko
