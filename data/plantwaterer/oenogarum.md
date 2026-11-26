# plantwaterer/oenogarum

## Resumen

oenogarum es un ajuste fino (fine-tune) del modelo google/gemma-4-31B-it, desarrollado por el usuario plantwaterer, orientado especificamente a la toma de decisiones mediante preguntas de opcion multiple. A diferencia de un modelo generativo convencional, oenogarum no produce texto libre como respuesta principal: devuelve una distribucion de probabilidad sobre cada una de las opciones planteadas, lo que lo convierte en una herramienta de clasificacion y decision calibrada.

El modelo parte de la arquitectura de Gemma 4 con 31.273.088.876 parametros totales (aproximadamente 31B) y anade una cabeza de ultima capa calibrada (`vbll_head.safetensors`) que transforma los logits de las letras de las opciones en probabilidades. Para preguntas de tipo si/no, aplica una correccion bayesiana de ultima capa (posterior de Laplace) sobre el estado oculto del modelo. La licencia es Apache-2.0 tanto para pesos como para codigo, lo que facilita su uso comercial.

Su relevancia actual radica en que ofrece un enfoque poco habitual: en lugar de pedir a un LLM que "razone" y emita una respuesta, el modelo esta disenado para producir decisiones probabilisticas calibradas con temperatura ajustada (T = 1.080) y promediado adaptativo por longitud de la peticion. Esto lo hace interesante para sistemas de decision automatizada donde se requiere una medida de incertidumbre, no solo una etiqueta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con atencion hibrida: capas de atencion completa no causal (via `jev_mem`) y capas de ventana deslizante causal (ventana 1.024) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (ventana deslizante de 1.024 tokens en capas SWA; contexto total no especificado) |
| Tipos de cuantizacion | no disponible (pesos en bf16 para inferencia segun el ejemplo; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, `vbll_head.safetensors`) |

## Arquitectura y entrenamiento

oenogarum se construye sobre google/gemma-4-31B-it mediante fine-tuning supervisado. La innovacion principal no esta en la arquitectura base, sino en dos componentes anadidos. El primero es una cabeza de ultima capa calibrada (`vbll_head.safetensors` con metadatos en `vbll_head.json`) que recibe el estado oculto final y los logits de las letras de las opciones (en fp32, con el soft-cap de logits del modelo) y produce las probabilidades en float64 sobre CPU. Para preguntas de opcion multiple ordinarias, la salida es el softmax de los logits de las letras dividido por una temperatura ajustada (T = 1.080); para preguntas si/no, se aplica un residual bayesiano de ultima capa (posterior de Laplace integrado) que ajusta los dos logits.

El segundo componente diferencial es el mecanismo de atencion. En las capas de atencion completa, los tokens de cada prompt atienden a todos los tokens del mismo prompt (atencion bidireccional dentro del prompt), mientras que las capas de ventana deslizante permanecen causales con ventana 1.024. Esto implica que la atencion estandar de transformers daria respuestas distintas, por lo que el modelo debe servirse obligatoriamente con la funcion `jev_mem` de `fullft_mem.py`, que se registra en la interfaz de atencion de transformers y opera sobre PyTorch SDPA (kernels memory-efficient y flash). Los motores de inferencia rechazan cualquier otra atencion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Toma de decisiones mediante preguntas de opcion multiple: devuelve una probabilidad calibrada por cada opcion (hasta 52 opciones, letras A-Z y a-z).
- Preguntas de tipo si/no con correccion bayesiana de ultima capa sobre el estado oculto.
- Promediado adaptativo por orden de opciones (length-adaptive option-order averaging) para peticiones con L <= 939, que reordena las opciones y promedia los resultados para reducir sesgos posicionales.
- Procesamiento de multiples preguntas dentro de una misma peticion, cada una con su propio prompt y criterios.
- Soporte de definiciones de criterios para preguntas si/no (mostradas como `Yes: <definicion>` / `No: <definicion>`).
- Inferencia por lotes mediante el kit Decision Index con motores seleccionables (`LenAvgBayesEngine`, `LenAvgEngine`, `DikitEngine`).
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, tool calling ni agentes multi-paso como funcionalidad principal.

## Casos de uso

- Sistemas de decision automatizada con incertidumbre: el modelo devuelve probabilidades calibradas por opcion, lo que permite umbralizar decisiones y derivar casos ambiguos a revision humana, algo que un LLM generativo no ofrece de forma nativa.
- Clasificacion de intenciones en atencion al cliente: dada una consulta y un conjunto de categorias de accion (por ejemplo, reembolso, escalado, informacion), el modelo asigna probabilidades a cada una y el sistema enruta segun la mas probable y la confianza.
- Evaluacion de politicas y reglas de negocio: con preguntas si/no corregidas bayesianamente, se puede verificar el cumplimiento de condiciones (por ejemplo, "¿es elegible para el descuento?") con una medida de incertidumbre asociada.
- Triaje en entornos sanitarios o de emergencias: ante un estado descrito y varias acciones posibles, el modelo puntua cada opcion, sirviendo como apoyo a la decision con probabilidades explicitas.
- Analisis de riesgo en finanzas u operaciones: preguntas de opcion multiple sobre escenarios (por ejemplo, aprobar, rechazar, revisar) con calibracion de temperatura que facilita comparar umbrales entre lotes.
- Investigacion en calibracion y decision bajo incertidumbre: el modelo y su cabeza bayesiana sirven como banco de pruebas para estudiar promediado por orden, temperatura ajustada y posteriores de Laplace en LLMs.
- Moderacion o etiquetado semiautomatico: clasificacion de contenido en categorias predefinidas con probabilidades, util para priorizar revisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62,6 GB de pesos (tamano del repo), por lo que se requiere al menos una GPU con 80 GB (A100 80GB, H100 80GB) para cargar el modelo completo en bf16.
- El ejemplo de uso indica `bf16 on "cuda"` y que la cabeza se ejecuta en CPU en float64, lo que anade un pequeno coste de CPU por peticion.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) sin cuantizacion, y no se documentan pesos cuantizados (GGUF, AWQ, GPTQ) en la informacion disponible.
- Opciones de despliegue: el kit Decision Index (`decision_index run --engine ...`) con PyTorch SDPA; no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y de hecho el motor rechaza cualquier atencion distinta de `jev_mem`.
- Latencia y throughput estimados: no disponibles. El promediado por orden multiplica por 4 el numero de pasadas para peticiones con L <= 939, lo que incrementa el coste computacional respecto a una unica pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oenogarum | 31,27B | no disponible (SWA 1.024) | Decision multiple-choice con cabeza calibrada y correccion bayesiana | Apache-2.0 | Hugging Face + GitHub |
| google/gemma-4-31B-it | ~31B | no disponible | LLM generativo instructivo multimodal (image-text-to-text) | Gemma (terminos propios) | Hugging Face |
| Modelos generativos de ~30B (familia Llama, Mistral, Qwen) | ~30B | variable segun modelo | Generacion de texto libre y chat | variable | Hugging Face |

La comparativa directa con alternativas especificas de decision multiple-choice calibrada no esta disponible en la informacion proporcionada. Frente a su modelo base, oenogarum restringe la salida a probabilidades sobre opciones y exige un motor de atencion propio, por lo que no es un sustituto generico de Gemma 4.

## Limitaciones y advertencias

- El modelo no es un generador de texto libre: su salida es una distribucion de probabilidad sobre opciones; usarlo como chatbot daria resultados no representativos.
- La atencion no estandar (bidireccional en capas completas) obliga a usar `jev_mem`; con la atencion por defecto de transformers las respuestas difieren, lo que supone un riesgo alto de despliegue incorrecto.
- El promediado por orden solo se aplica a peticiones con L <= 939; por encima de ese umbral se usa una unica pasada, con posible perdida de robustez frente al orden de opciones.
- La cabeza debe ejecutarse en CPU en float64; omitirla o usar solo los logits de las letras produce una salida incorrecta.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion; al ser un fine-tune sobre Gemma 4, hereda los sesgos del modelo base, no cuantificados aqui.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a terminos adicionales de Google que conviene verificar antes de produccion.
- Con 363 descargas y 0 likes, el modelo tiene una validacion externa muy limitada; no hay benchmarks publicados que respalden su calidad.
- El repo ocupa 62,6 GB y requiere hardware de gama alta (80 GB de VRAM en bf16), lo que limita su adopcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/oenogarum
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio GitHub (codigo y model card): https://github.com/treewaterer/oenogarum
- Kit Decision Index: https://github.com/apolinario/decision-index
- Commit del kit usado en el ejemplo: https://github.com/apolinario/decision-index@9eb2dbe2a358004c8782c66e40a83ac07b953fec
