# gggff123/Smol-GPT-RAW

## Resumen

Smol-GPT-RAW es un ajuste fino (fine-tuning) de 16 bits publicado por el usuario gggff123 sobre el modelo base unsloth/SmolLM2-135M-Instruct. Se trata, por tanto, de un modelo de lenguaje decoder-only de tipo Llama con 134.515.584 parámetros (aproximadamente 135 millones), orientado a generacion de texto conversacional en ingles y distribuido con licencia Apache 2.0. El repositorio ocupa 0.3 GB y contiene pesos en formato safetensors listos para su uso con la libreria transformers.

Su relevancia practica no viene de una capacidad puntera, sino de su tamano reducido: con 135M de parametros es un modelo que cabe en cualquier GPU de consumo, en CPU y en dispositivos de borde, y que sirve como banco de pruebas para pipelines de inferencia, experimentos de ajuste fino y despliegues de bajo coste. El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, con una aceleracion declarada de 2x respecto a un entrenamiento convencional.

La model card es extremadamente escueta: no documenta el dataset de ajuste, el numero de tokens de entrenamiento, el metodo de alineacion (RLHF/DPO) ni resultados de evaluacion. Con 16 descargas y 0 likes en el momento de la consulta, se trata de un artefacto sin validacion comunitaria, por lo que debe tratarse como un experimento y no como un modelo listo para produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.584 (aproximadamente 135M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card (el modelo base SmolLM2-135M-Instruct declara 8.192 tokens, no verificado en este ajuste) |
| Tipos de cuantizacion | Repositorio publicado en FP16 (16 bits). No se incluyen versiones GGUF, AWQ ni GPTQ. Al ser un modelo compatible con el tokenizador y la arquitectura Llama, la conversion a 8 o 4 bits es tecnicamente posible, pero no esta publicada ni validada por el autor |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM2-135M-Instruct: un transformer decoder-only denso, de tipo Llama, con atencion causal y normalizacion RMSNorm, disenado para inferencia eficiente en hardware modesto. No hay ninguna innovacion arquitectonica propia en este repositorio: el autor no modifica la topologia, sino que parte de los pesos del modelo de Hugging Face y los ajusta.

El proceso de entrenamiento descrito en la model card se limita a dos datos: se uso Unsloth junto con TRL de Hugging Face, y se declara un entrenamiento "2x mas rapido". No se especifica el dataset de ajuste, el volumen de tokens, la composicion de los datos, la estrategia de enmascarado de perdida ni si hubo una fase de alineacion con RLHF, DPO u otro metodo. Tampoco se publica informacion sobre la tasa de aprendizaje, el numero de pasos o la configuracion de precision (mas alla del resultado final en FP16). Cualquier afirmacion sobre el comportamiento del ajuste respecto al modelo base carece, por tanto, de trazabilidad.

## Capacidades

- Generacion de texto autoregresiva en ingles, con el formato conversacional heredado del modelo base instruct.
- Dialogo multiturno basico: la etiqueta `conversational` de la ficha indica que el modelo conserva la plantilla de chat del base, aunque no se documenta el formato exacto del prompt.
- Seguimiento de instrucciones simples, heredado de SmolLM2-135M-Instruct, sin garantias adicionales por parte del ajuste.
- Generacion de texto corto, resumenes, reescritura y tareas de completado de tipo plantilla.
- Capacidad limitada de razonamiento y matematicas: por tamano, estas tareas son poco fiables incluso en el modelo base.
- Soporte de tool calling o function calling: no documentado y no verificado. No debe asumirse.
- Soporte de agentes y razonamiento multi-paso: no documentado; la ventana y la capacidad del modelo hacen poco realista un uso agentico fiable.
- Capacidades multilingues: solo ingles declarado. No hay soporte explicito de castellano.
- Capacidades especiales (modo thinking, vision, audio): ninguna documentada.
- Compatibilidad declarada con text-generation-inference y con endpoints de Hugging Face, segun las etiquetas del repositorio.

## Casos de uso

- Prototipado rapido de aplicaciones de chat: al pesar unos 270 MB en FP16, se puede cargar en un portatil sin GPU y validar la logica de un producto conversacional antes de pasar a un modelo mayor.
- Pruebas de pipelines de inferencia y CI: sirve como modelo "dummy" realista para verificar despliegues con transformers, text-generation-inference o vLLM sin consumir presupuesto de GPU.
- Generacion de texto en dispositivos de borde o embebidos: cabe en CPU y en placas tipo Raspberry Pi, lo que permite tareas de completado y clasificacion de texto sin conexion.
- Modelo borrador para decodificacion especulativa: con 135M de parametros es un candidato natural como draft model para acelerar la inferencia de modelos mayores de la misma familia de tokenizador, siempre que se valide la tasa de aceptacion.
- Ajuste fino educativo y experimentacion: es un punto de partida barato para ensenar o probar tecnicas de fine-tuning (LoRA, QLoRA, SFT) con Unsloth y TRL sin necesidad de hardware especializado.
- Enrutado y clasificacion de consultas: con un ajuste adicional ligero, puede actuar como clasificador de intenciones o filtro previo que decida si una peticion debe enviarse a un modelo mayor.
- Generacion de datos sinteticos de bajo coste y aumentacion de datasets de texto en ingles, asumiendo la necesidad de filtrado posterior por la calidad limitada del modelo.
- Pruebas de regresion y evaluacion de plantillas de prompt: permite medir de forma rapida y reproducible como cambia la salida ante modificaciones de la plantilla de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, HellaSwag ni similares), y no hay resultados de terceros para este repositorio concreto dado su bajisimo numero de descargas.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 269 MB (134.515.584 parametros x 2 bytes), coherente con el tamano de repositorio de 0.3 GB.
- VRAM estimada para inferencia: del orden de 0.5 a 1 GB en FP16 contando pesos, cache KV y overhead del runtime; alrededor de 0.15 GB en cuantizacion de 8 bits y 0.08 GB en 4 bits (estimaciones aritmeticas, no medidas publicadas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona holgadamente en RTX 3060, RTX 4060, RTX 4090, A100, H100 y tambien en iGPU y CPU.
- GPU de consumo: si, cabe en practicamente cualquier GPU consumer de los ultimos diez anos, e incluso en moviles y SBC mediante cuantizacion.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (etiqueta declarada por el autor), endpoints de Hugging Face. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no publicada por el autor. vLLM es viable al ser arquitectura Llama, pero no esta verificado en este repositorio.
- Latencia y throughput: no se publican mediciones. Por tamano de modelo, el coste de inferencia es muy bajo, pero cualquier cifra concreta requeriria una medicion propia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gggff123/Smol-GPT-RAW | 134.515.584 | No disponible | Apache 2.0 | Hugging Face, FP16 | Ajuste sin evaluacion publicada, 16 descargas |
| unsloth/SmolLM2-135M-Instruct (base) | 135M | No verificado en esta ficha | Apache 2.0 | Hugging Face | Modelo de partida; documentacion y evaluaciones publicas de la familia SmolLM2 |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | No verificado en esta ficha | Apache 2.0 | Hugging Face | Alternativa directa con model card detallada y soporte oficial |
| Otros modelos de 0.5B-1B (por ejemplo, Qwen2.5-0.5B-Instruct o TinyLlama-1.1B) | 500M-1.100M | No verificado en esta ficha | Variables segun modelo | Hugging Face | Mayor capacidad de razonamiento a cambio de mas VRAM y menor velocidad |

Los datos de contexto y de parametros de los modelos comparables no provienen de la informacion proporcionada en esta busqueda y no se han verificado aqui; se incluyen solo como referencia de categoria. La comparacion estricta de rendimiento no es posible porque Smol-GPT-RAW no publica ninguna metrica.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni comparacion con el modelo base. No se puede afirmar que el ajuste mejore al base en ninguna tarea.
- Sesgos conocidos: no documentados por el autor. Al ser un modelo entrenado predominantemente en ingles, es esperable un sesgo cultural y linguistico anglosajon, pero no hay analisis publicado.
- Riesgo de alucinacion: alto. Con 135M de parametros, el modelo no tiene capacidad factual suficiente para tareas de conocimiento; genera texto plausible sin garantia de veracidad.
- Limitaciones de contexto e idioma: solo ingles declarado. El castellano no esta soportado oficialmente. La longitud de contexto efectiva del ajuste no esta documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. El modelo base tambien es Apache 2.0, por lo que no hay conflicto de licencias.
- Trazabilidad nula del dataset: al no documentarse los datos de ajuste, no se puede descartar la inclusion de contenido con derechos de terceros ni evaluar el cumplimiento normativo.
- Madurez del artefacto: 16 descargas y 0 likes. No hay issues, discusiones ni validacion por parte de la comunidad. Fechas de creacion y actualizacion muy proximas entre si, lo que sugiere una publicacion sin iteracion.
- Uso en produccion: no recomendado sin una evaluacion propia previa contra el modelo base en las tareas objetivo. Para tareas de razonamiento, codigo o agentes, el tamano del modelo lo descarta en la practica.
- Dependencia del tokenizador y la plantilla de chat del base: usar un formato de prompt distinto al esperado degradara las respuestas, y el formato exacto no esta documentado en la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gggff123/Smol-GPT-RAW
- Modelo base: https://huggingface.co/unsloth/SmolLM2-135M-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Blog de presentacion de la familia SmolLM: https://huggingface.co/blog/smollm
- Proyecto smolGPT (sin relacion con este repositorio, coincidencia de nombre): https://github.com/Om-Alve/smolGPT
- Proyecto smol-gpt de NolanoOrg (sin relacion con este repositorio): https://github.com/NolanoOrg/smol-gpt
