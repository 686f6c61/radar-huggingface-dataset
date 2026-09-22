# gohumanize/gohumanize-open-humanizer-qlora

## Resumen

GoHumanize Open Humanizer (version QLoRA) es un ajuste fino del modelo denso Qwen3-4B de Alibaba, publicado por el equipo de GoHumanize.ai, cuyo objetivo es reescribir prosa en ingles con estilo tipico de LLM ("AI-styled") y convertirla en texto con apariencia mas humana. El repositorio contiene tres formatos del mismo entrenamiento: pesos mergeados en 16 bits listos para `transformers`, el adaptador LoRA aislado (unos 66 MB) para aplicar con PEFT sobre `Qwen/Qwen3-4B`, y builds GGUF Q4_K_M y Q8_0 para llama.cpp, Ollama y LM Studio.

Se trata de un modelo educativo, separado de los sistemas de produccion de GoHumanize.ai, entrenado con QLoRA sobre 2.000 pares de entrenamiento y 200 de test, con el objetivo de desplazar el estilo, la longitud de frase y la eleccion lexica hacia registros mas naturales. Es relevante porque ofrece una alternativa abierta y pequena (4.022.468.096 parametros, licencia Apache-2.0) a los servicios propietarios de "humanizacion" de texto, e incluye el adaptador y el dataset publicados para reproducir el entrenamiento en una sola GPU de 24 GB.

La ficha tecnica del autor indica que esta version QLoRA obtiene puntuaciones equivalentes al fine-tune completo del mismo modelo en todas las metricas internas, lo que la convierte en la via practica para quien quiera reentrenar o integrar el modelo con un coste de hardware reducido. El modelo solo declara soporte de ingles y no hace ninguna afirmacion sobre detectores de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (ajuste fino de Qwen/Qwen3-4B); no se detallan mas capas en la informacion disponible |
| Parametros totales | 4.022.468.096 (4,02 B, dato de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens como maximo durante el entrenamiento; no se especifica la ventana de inferencia en la informacion disponible |
| Tipos de cuantizacion | Base 4 bits durante el entrenamiento (QLoRA); pesos mergeados en 16 bits; GGUF Q4_K_M y Q8_0 publicados; el adaptador LoRA se puede aplicar en precision completa |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (mergeado 16 bits), adaptador LoRA/PEFT (aproximadamente 66 MB) y GGUF (Q4_K_M, Q8_0) |

## Arquitectura y entrenamiento

El modelo no introduce una arquitectura nueva: es un ajuste fino con QLoRA de Qwen3-4B, un transformer decoder denso de 4,02 mil millones de parametros. El entrenamiento se realizo con Unsloth sobre una base cuantizada a 4 bits, con adaptadores LoRA de rango 16 y alpha 32 aplicados a todas las proyecciones de atencion y de MLP. La perdida se calculo unicamente sobre los tokens del asistente (el texto humano objetivo), no sobre el prompt, lo que concentra el aprendizaje en el estilo de salida.

Los datos consisten en 2.000 pares de entrenamiento y 200 de test del dataset `gohumanize/gohumanize-open-humanizer-dataset`. La configuracion fue de 2 epocas (250 pasos), learning rate 2e-4 con scheduler coseno, batch efectivo 16 y secuencia maxima de 1.024 tokens. El entrenamiento completo se ejecuto en una sola NVIDIA A10G (24 GB) sobre Modal en 21,7 minutos, con perdidas finales de 1,30 en entrenamiento y 1,39 en evaluacion (frente a 3,17 antes de entrenar). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto y reescritura de estilo: transforma prosa con marcas tipicas de LLM en texto de registro mas humano.
- Transferencia de estilo (style transfer) orientada a longitud de frase, ritmo y eleccion lexica; la longitud media de frase pasa de 15,2 a 22,5 tokens (28,1 en textos humanos).
- Preservacion de entidades: mantiene nombres propios con una recall de 0,623 en el conjunto de evaluacion.
- Conversacional: la ficha lo etiqueta como `conversational` y usa un formato de chat con system prompt propio.
- Integracion con tooling de despliegue: compatible con `transformers`, PEFT, text-generation-inference, endpoints compatibles, llama.cpp, Ollama y LM Studio.
- Idioma unico: solo ingles declarado.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling y agentes: no documentadas en la informacion disponible.

## Casos de uso

- Humanizacion de textos generados por IA: el modelo recibe un borrador producido por un LLM en ingles y devuelve una version con frases mas largas y menos formulas repetidas, reduciendo el recuento de frases estereotipadas de 0,01 a 0,00 por texto.
- Edicion y post-edicion editorial: un medio o editorial puede pasarlo sobre articulos generados asistidamente antes de la revision humana, ya que el ROUGE-L frente a textos humanos sube de 0,424 a 0,540.
- Generacion de contenido de marketing: reescritura de copys y descripciones de producto para evitar el tono uniforme de los asistentes generativos, con control de longitud cercano al humano (ratio 0,93 frente a 1,00).
- Construccion de datasets de estilo: al publicar dataset y adaptador, se puede usar como generador de pares sinteticos para entrenar a su vez otros modelos de reescritura o de deteccion de estilo.
- Localizacion de contenido ingles: adaptacion de material traducido automaticamente al ingles para que suene natural antes de publicarlo.
- Normalizacion de respuestas en asistentes conversacionales: capa posterior al LLM principal que suaviza respuestas de chatbot y las aleja del registro "asistente generico".
- Reentrenamiento o ajuste propio: el adaptador LoRA de 66 MB y la receta de QLoRA permiten reproducir el entrenamiento en una GPU de 24 GB y adaptarlo a un dominio concreto (por ejemplo, prensa tecnica o contenido academico).
- Despliegue en local o en el borde: las builds GGUF Q4_K_M y Q8_0 permiten ejecutarlo con Ollama o llama.cpp en equipos sin GPU dedicada para tareas de reescritura por lotes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 200 pares reservados:

| Medida (200 pares reservados) | Qwen3-4B base | QLoRA (este repo) | Fine-tune completo (modelo principal) | Humano |
|---|---|---|---|---|
| BERTScore F1 frente a humano | 0,900 | 0,921 | 0,920 | no disponible |
| ROUGE-L frente a humano | 0,424 | 0,540 | 0,535 | no disponible |
| Nombres conservados (recall) | 0,594 | 0,623 | 0,614 | no disponible |
| Ratio de longitud frente a humano | 0,83 | 0,93 | 0,95 | 1,00 |
| Frases estereotipadas de LLM por texto | 0,01 | 0,00 | 0,00 | 0,00 |
| Longitud media de frase | 15,2 | 22,5 | 22,6 | 28,1 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco hay datos de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no publicado por el autor): aproximadamente 2,5 GB en GGUF Q4_K_M, unos 4,3 GB en Q8_0 y unos 8 GB en pesos de 16 bits, mas la cache KV y el overhead del runtime.
- GPU recomendadas: cualquier GPU con 8-12 GB para las builds GGUF; 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super) para 16 bits con contexto corto; A100, H100 o L40S para despliegues con concurrencia y lotes grandes.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas de 8 GB o mas usando Q4_K_M o Q8_0; los pesos de 16 bits requieren al menos 10-12 GB libres.
- Entrenamiento o reentrenamiento: la ficha indica que la receta QLoRA es reproducible en una GPU de 24 GB; el entrenamiento original se hizo en 1x NVIDIA A10G (24 GB) en Modal en 21,7 minutos.
- Opciones de despliegue: `transformers` con PEFT, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), llama.cpp, Ollama (`ollama run hf.co/gohumanize/gohumanize-open-humanizer-qlora:Q4_K_M`) y LM Studio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoHumanize Open Humanizer QLoRA (este repo) | 4,02 B | 1.024 tokens en entrenamiento (inferencia no especificada) | QLoRA (rango 16) sobre Qwen3-4B | Apache-2.0 | Pesos mergeados, adaptador y GGUF en HuggingFace |
| GoHumanize Open Humanizer (modelo principal) | 4,02 B | 1.024 tokens en entrenamiento (inferencia no especificada) | Fine-tune completo de Qwen3-4B | Apache-2.0 | Publicado en HuggingFace |
| Qwen3-4B base | 4,02 B | No disponible en la informacion proporcionada | Preentrenado con post-entrenamiento | Apache-2.0 | Publico en HuggingFace |
| Otros humanizadores abiertos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Las metricas internas de BERTScore F1 (0,921 frente a 0,920) y ROUGE-L (0,540 frente a 0,535) situan esta version QLoRA al mismo nivel que el fine-tune completo del modelo principal. No se dispone de comparaciones con alternativas de terceros.

## Limitaciones y advertencias

- Ambito limitado: el entrenamiento usa 2.000 pares y 250 pasos; el ajuste de estilo se apoya en un conjunto pequeno, por lo que puede generalizar mal a registros o dominios poco representados.
- Solo ingles: la ficha declara exclusivamente el idioma `en`; no hay garantia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion y de deriva semantica: como todo modelo generativo de 4 B, puede introducir o alterar datos; la recall de nombres propios es 0,623, es decir, en torno a un 38 % de los nombres no se recuperan correctamente en la evaluacion.
- Ventana de contexto corta: el entrenamiento se hizo con un maximo de 1.024 tokens, por lo que textos largos pueden degradar el resultado o exigir troceado.
- Sin afirmaciones sobre detectores de IA: el autor indica explicitamente que el modelo no hace ninguna afirmacion al respecto; no debe usarse como garantia frente a sistemas de deteccion.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; el autor lo describe como una publicacion educativa separada de sus sistemas de produccion.
- Sesgos heredados: al derivar de Qwen3-4B, puede arrastrar sesgos del corpus de preentrenamiento del modelo base, no documentados en la informacion disponible.
- Adopcion nula verificable: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion independiente de los resultados.
- Caveat de produccion: no hay benchmarks estandar ni mediciones de latencia publicadas, de modo que cualquier despliegue exigiria una evaluacion propia antes de usarlo en flujos automatizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gohumanize/gohumanize-open-humanizer-qlora
- Modelo principal (fine-tune completo): https://huggingface.co/gohumanize/gohumanize-open-humanizer
- Dataset de entrenamiento: https://huggingface.co/datasets/gohumanize/gohumanize-open-humanizer-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Pagina del proyecto: https://gohumanize.ai/open-model
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/gohumanize/gohumanize-open-humanizer/runs/95wi8tdg
- DOI de cita (Zenodo): https://doi.org/10.5281/zenodo.22843083
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante; las entradas devueltas corresponden a emisoras de radio alemanas y no guardan relacion con el modelo.
