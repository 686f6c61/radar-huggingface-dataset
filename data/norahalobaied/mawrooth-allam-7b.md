# NorahAlobaied/Mawrooth-ALLaM-7B

## Resumen

Mawrooth (مَوروث) es un ajuste fino supervisado del modelo saudí humain-ai/ALLaM-7B-Instruct-preview, publicado por el usuario NorahAlobaied en HuggingFace. Su proposito es muy concreto: explicar poesia nabati saudita (الشعر النبطي) verso a verso, combinando un diccionario nabati de mas de 1000 terminos con un razonamiento en cadena (Chain-of-Thought) y contexto cultural autentico de la peninsula arabiga. El proyecto se presento al hackathon Arabthon 2026.

Tecnicamente es un modelo de 7.017.336.832 parametros (unos 7B) con pesos en safetensors y licencia Apache 2.0, entrenado mediante LoRA con rango 16 sobre 587 versos nabati. La model card reporta una precision de token (Token Accuracy) del 85,75 % y ausencia de overfitting segun el autor, aunque no se publican resultados en benchmarks estandar. El repositorio ocupa 5,5 GB.

Su relevancia es mas patrimonial que competitiva: es uno de los pocos modelos publicos orientados especificamente a la exegesis de poesia nabati, un genero oral poco representado en los corpus de arabe estandar moderno que dominan los modelos arabes generalistas. No es un modelo de proposito general: es una herramienta de nicho para divulgacion cultural, docencia e investigacion en humanidades digitales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no detallada en la informacion; el modelo base es humain-ai/ALLaM-7B-Instruct-preview y las etiquetas del repo incluyen "llama") |
| Parametros totales | 7.017.336.832 (aproximadamente 7B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizacion de 4 bits mediante bitsandbytes (etiqueta del repo); no se enumeran variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Arabe (ar). La seccion de descripcion visual de salida se genera en ingles, pero no consta como idioma soportado para entrada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de ALLaM-7B-Instruct-preview, un LLM arabe de ~7B parametros desarrollado en Arabia Saudi. Sobre esa base se aplico un ajuste fino con LoRA de rango 16 (r=16), lo que implica que el repositorio contiene un adaptador y no un juego de pesos completo: la model card muestra la carga mediante `PeftModel.from_pretrained` sobre el modelo base. Las etiquetas del repositorio incluyen ademas "4-bit" y "bitsandbytes", lo que sugiere que parte del material publicado esta cuantizado a 4 bits.

El conjunto de entrenamiento es Mawrooth-Nabati-Dataset, con 587 versos nabati (el nombre del dataset aparece en la model card con el marcador de plantilla `YOUR_USERNAME`, lo que indica que la publicacion quedo incompleta). El autor declara una Token Accuracy del 85,75 % y ausencia de overfitting, pero no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica declarada es el uso de Chain-of-Thought para descomponer el analisis del verso y la integracion de un diccionario nabati de mas de 1000 terminos como apoyo lexico.

## Capacidades

- Explicacion de versos nabati saudies con una plantilla fija de cinco secciones: [المفردات] vocabulario, [تحليل البيت] analisis paso a paso, [السياق الثقافي] contexto cultural, [الشرح] explicacion completa y [الوصف] descripcion visual en ingles.
- Resolucion lexica de terminos nabati poco frecuentes apoyandose en un diccionario de mas de 1000 entradas.
- Razonamiento en cadena (Chain-of-Thought) para descomponer el sentido de un verso antes de emitir la explicacion.
- Interpretacion de referencias culturales y patrimoniales propias de la tradicion saudí.
- Generacion de una descripcion visual en ingles del contenido del verso, util para publicos no araboparlantes.
- Capacidad de tool calling o function calling: no documentada.
- Soporte de agentes y razonamiento multi-paso general: no documentado; el razonamiento multi-paso se limita al esquema de explicacion del verso.
- Capacidades multilingues: solo arabe como idioma de trabajo; no consta soporte de otros idiomas de entrada.
- Modo thinking explicito, vision o audio: no disponibles.

## Casos de uso

- Divulgacion patrimonial en museos y centros culturales: el modelo genera fichas de cinco secciones para cada verso expuesto, de modo que el visitante obtiene vocabulario, analisis, contexto historico y una descripcion visual reutilizable en carteleria bilingue.
- Didactica de literatura arabe en secundaria y universidad: el profesor puede obtener una descomposicion guiada paso a paso del verso, con el vocabulario nabati resuelto, y usarla como material de clase o como solucionario de ejercicios.
- Edicion y anotacion de corpus poeticos: el esquema de salida estructurado permite procesar colecciones de versos en lote y generar anotaciones semanticas y culturales consistentes para un corpus de humanidades digitales.
- Produccion de contenido para medios y television: programas de poesia, podcasts y canales culturales pueden obtener explicaciones listas para narracion y una descripcion visual en ingles que facilita subtitulos o versiones internacionales.
- Traduccion asistida de metaforas nabati: la seccion de descripcion visual en ingles sirve como puente para traductores que necesitan entender la imagen poetica antes de verterla a otro idioma.
- Investigacion lexicografica sobre nabati: el modelo puede usarse para proponer glosas de terminos poco documentados, que despues se validan manualmente y se incorporan al diccionario de referencia.
- Accesibilidad linguistica para publico no araboparlante: residentes y turistas pueden recibir una explicacion del sentido del verso en ingles a partir del texto arabe.
- Enriquecimiento de bases de datos culturales: generacion de metadatos (tema, tono, referencias geograficas o tribales) derivados de la seccion de contexto cultural para catalogos y archivos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni evaluaciones arabes como ArabicMMLU) en la informacion disponible. El unico dato cuantitativo aportado por el autor es una metrica interna de entrenamiento:

| Metrica | Valor | Nota |
|---|---|---|
| Token Accuracy (entrenamiento) | 85,75 % | Metrica declarada por el autor; no es un benchmark comparable con otros modelos |
| Overfitting | No detectado (segun el autor) | Sin curva de validacion ni datos de perdida publicados |

## Requisitos de hardware

- VRAM estimada para el modelo base de 7B en precision completa (FP16/BF16): en torno a 14-16 GB, mas el consumo del contexto y del runtime.
- VRAM estimada en 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en 4 bits (configuracion declarada en el repo): aproximadamente 5-6 GB, suficiente para GPUs de consumo con 8 GB o mas.
- El adaptador LoRA en si ocupa muy poco (repo total de 5,5 GB, que incluye material adicional); el grueso del consumo proviene del modelo base ALLaM-7B-Instruct-preview.
- GPUs de consumo compatibles segun la estimacion de 4 bits: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En 8 bits, RTX 3080/3090 y superiores.
- GPUs profesionales para despliegue en produccion: A100 40/80 GB, H100, L40S y A10G; en estos casos con margen sobrado para FP16 y lotes grandes.
- Opciones de despliegue: al tratarse de un adaptador LoRA, el flujo natural es transformers mas peft, tal y como indica la model card. No se documenta soporte especifico para vLLM, TGI, llama.cpp ni Ollama; para usar estos motores habria que fusionar el adaptador con el modelo base y, en su caso, convertir los pesos a GGUF, algo que el autor no describe.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mawrooth-ALLaM-7B | ~7B (adaptador LoRA) | No disponible | Poesia nabati saudita | Apache 2.0 | HuggingFace |
| humain-ai/ALLaM-7B-Instruct-preview (modelo base) | ~7B | No disponible en esta informacion | Proposito general en arabe, alineado por instrucciones | No disponible en esta informacion | HuggingFace |
| Otros modelos arabes especializados en poesia nabati | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone, en la informacion proporcionada, de datos de rendimiento del modelo base ni de alternativas comparables, por lo que la comparacion se limita a la relacion de dependencia entre Mawrooth y ALLaM-7B-Instruct-preview. Cualquier comparacion cuantitativa con modelos como Jais, Fanar, SILMA o AceGPT requeriria datos que no se han publicado aqui.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (587 versos), lo que limita la generalizacion a variedades de nabati, epocas o regiones distintas de las representadas en el corpus.
- Riesgo alto de alucinacion en terminos nabati poco frecuentes y en atribuciones culturales o historicas: el modelo puede generar glosas plausibles pero incorrectas, por lo que toda salida de valor patrimonial deberia ser revisada por un especialista.
- La Token Accuracy del 85,75 % es una metrica de entrenamiento declarada por el autor, no una evaluacion independiente; no hay conjunto de validacion ni evaluacion externa publicados.
- Modelo monoidioma: solo trabaja con arabe como entrada. La salida en ingles se limita a la seccion de descripcion visual y no convierte al modelo en bilingue.
- Al ser un adaptador LoRA, no es autonomo: requiere descargar y cargar humain-ai/ALLaM-7B-Instruct-preview, con el coste de almacenamiento y los requisitos de VRAM asociados al modelo base.
- La model card contiene marcadores de plantilla sin sustituir (`YOUR_USERNAME/Mawrooth-Nabati-Dataset` y `YOUR_USERNAME/Mawrooth-ALLaM-7B`), lo que indica una publicacion incompleta: el dataset de entrenamiento no es localizable con ese nombre y el repositorio del adaptador podria no estar correctamente referenciado.
- Inconsistencias en los metadatos del repositorio: se etiqueta simultaneamente como "llama" y "qwen" cuando el modelo base pertenece a la familia ALLaM, y se marca el modelo base como cuantizado, lo que dificulta reproducir el entrenamiento exacto.
- La fecha de creacion registrada (21 de septiembre de 2026) resulta incoherente con el estado habitual de publicacion y conviene verificarla antes de citar el modelo.
- Aunque la licencia es Apache 2.0, el uso comercial del conjunto derivado depende tambien de las condiciones del modelo base ALLaM-7B-Instruct-preview, que no se detallan en la informacion disponible.
- Sin datos de latencia, throughput ni pruebas de carga, no es posible dimensionar un despliegue en produccion con garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NorahAlobaied/Mawrooth-ALLaM-7B
- Modelo base: https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview
- Dataset referenciado en la model card (nombre sin resolver): `YOUR_USERNAME/Mawrooth-Nabati-Dataset`; no se ha podido localizar un enlace valido
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: unicamente paginas de soporte de Microsoft ajenas al contenido solicitado.
