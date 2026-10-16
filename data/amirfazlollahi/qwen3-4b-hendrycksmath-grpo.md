# AmirFazlollahi/Qwen3-4B-HendrycksMATH-GRPO

## Resumen

Qwen3-4B-HendrycksMATH-GRPO es un ajuste fino del modelo Qwen3-4B orientado específicamente a la resolución de problemas de matemáticas. Lo publica el usuario AmirFazlollahi en HuggingFace y se construye en dos etapas: primero un ajuste supervisado (SFT) sobre el conjunto de datos Hendrycks MATH, que da lugar al checkpoint intermedio Qwen3-4B-HendrycksMATH-SFT, y después un entrenamiento con aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization) partiendo de ese checkpoint.

El modelo es un transformer decoder-only de tipo denso con 4.022.468.096 parámetros (unos 4,02 mil millones), pesos en safetensors y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Hereda de la familia Qwen3 el soporte de razonamiento paso a paso y la plantilla conversacional de chat, y el entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, lo que según el autor permitió un entrenamiento el doble de rápido.

Su relevancia es acotada pero clara: se trata de un modelo pequeño (4B) especializado en matemáticas, desplegable en una única GPU de consumo, que ilustra el flujo habitual de SFT + RL con recompensas verificables sobre un dataset académico de referencia. No es un modelo de propósito general ni compite con los grandes modelos de razonamiento; su interés es como base reproducible para tareas de matemáticas en inglés y como ejemplo de receta de entrenamiento con Unsloth. No se han publicado métricas de evaluación ni detalles del proceso de entrenamiento más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), con atención de consultas agrupadas (GQA) y RoPE; incluye modo de razonamiento heredado del modelo base |
| Parametros totales | 4.022.468.096 (~4,02 mil millones), dato real de los safetensors |
| Parametros activos | no procede: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens en la familia Qwen3-4B (ampliable a 131.072 con YaRN); no confirmado en la model card de este ajuste |
| Tipos de cuantizacion | no se publica ninguna cuantizacion en el repositorio; al distribuirse en safetensors puede cuantizarse a GGUF, GPTQ, AWQ o bitsandbytes por cuenta propia |
| Idiomas soportados | en (inglés) segun la model card; el modelo base Qwen3 declara soporte de 119 idiomas, pero el ajuste fino se ha realizado sobre un corpus en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); tamano del repositorio 8,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B original: un transformer decoder-only denso, sin mezcla de expertos, con atención de consultas agrupadas para reducir el coste de la caché KV y codificación posicional rotatoria (RoPE). El modelo base Qwen3-4B incorpora además un modo de razonamiento híbrido, de forma que puede alternar entre generar una cadena de pensamiento extensa antes de responder o contestar directamente, comportamiento que este ajuste hereda. El repositorio no documenta cambios en la arquitectura respecto al modelo base.

El entrenamiento se realizó en dos fases. La primera fue un ajuste supervisado (SFT) sobre el dataset Hendrycks MATH, un corpus de problemas de competición con soluciones paso a paso, del que resultó el checkpoint AmirFazlollahi/Qwen3-4B-HendrycksMATH-SFT, utilizado como modelo base de esta ficha. La segunda fase aplicó GRPO, un algoritmo de aprendizaje por refuerzo sin modelo crítico que estima la ventaja relativa de cada respuesta dentro de un grupo de muestras generadas para el mismo problema, lo que encaja bien con tareas de matemáticas donde la recompensa puede verificarse comparando la respuesta final con la solución correcta. El autor indica que el entrenamiento se llevó a cabo con Unsloth y la librería TRL de HuggingFace, con una mejora de velocidad de aproximadamente 2x, pero no se especifican el número de tokens, la composición exacta del dataset, los hiperparámetros, la función de recompensa ni si hubo fases adicionales de DPO o RLHF.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia de la familia Qwen3.
- Resolución de problemas de matemáticas de nivel de competición, en particular los del estilo del dataset Hendrycks MATH (álgebra, cálculo, geometría, teoría de números, probabilidad).
- Razonamiento paso a paso: el ajuste con GRPO refuerza cadenas de razonamiento que conducen a una respuesta final verificable.
- Modo de razonamiento prolongado y modo directo heredados del modelo base, seleccionables mediante la plantilla de chat.
- Capacidad general de generación de código y de texto, aunque no es el objetivo del ajuste y no se documenta su degradación o conservación.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Qwen3 lo soporta, pero no hay confirmación de que se conserve tras este ajuste.
- Uso en agentes y razonamiento multi-paso: no documentado específicamente para este checkpoint.
- Capacidades multilingües: limitadas en la práctica al inglés, idioma declarado en la model card y único presente en el dataset de entrenamiento.
- Capacidades de visión y audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Resolución automática de problemas de matemáticas de nivel preuniversitario y de competición: el ajuste con GRPO sobre Hendrycks MATH está diseñado exactamente para producir soluciones paso a paso con una respuesta final verificable, útil en correctores automáticos o en generación de soluciones de referencia.
- Generación de material docente de matemáticas: el modelo puede producir enunciados resueltos y explicaciones intermedias para álgebra, cálculo o probabilidad, aprovechando la estructura de razonamiento aprendida del corpus MATH.
- Tutoría conversacional en inglés: con 32.768 tokens de contexto (heredados del modelo base) puede mantener diálogos multi-turno en los que el alumno plantea un problema, recibe el desarrollo y repregunta sobre pasos concretos.
- Filtrado y anotación de datasets matemáticos a escala: dado su tamaño de 4B parámetros y su despliegue en una sola GPU, es viable ejecutarlo sobre lotes grandes de problemas para verificar respuestas o etiquetar soluciones.
- Componente especializado dentro de un sistema mayor: puede actuar como "solucionador" invocado desde un orquestador que delegue en él los subproblemas matemáticos, siempre que el orquestador gestione el formato de prompt de Qwen3.
- Entorno de investigación en aprendizaje por refuerzo con recompensas verificables: sirve como punto de partida reproducible para experimentar con GRPO, ya que se publica tanto el checkpoint SFT como el resultado tras RL.
- Evaluación de pipelines de cuantización y despliegue: al ser un modelo de 4B con licencia Apache 2.0, es un banco de pruebas cómodo para medir el impacto de GGUF, AWQ o GPTQ en tareas de matemáticas.
- Generación de ejercicios con solución para plataformas de práctica: el modelo puede producir pares problema-solución en inglés que después se revisan y traducen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a indicar el modelo base, la licencia y que el entrenamiento se realizó con Unsloth y TRL; no incluye métricas de MATH, GSM8K, MMLU, HumanEval ni de ningún otro conjunto de evaluación, ni comparaciones con el checkpoint SFT previo o con el Qwen3-4B original. Tampoco se documentan curvas de entrenamiento, tasas de acierto durante el RL ni el impacto medido del GRPO.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: alrededor de 8,1 GB solo para los pesos, más la caché KV y el overhead del runtime; en la práctica se recomienda un mínimo de 12 GB de VRAM para secuencias cortas y más si se trabaja cerca del límite de contexto.
- Cuantización de 8 bits (bitsandbytes o GPTQ/AWQ de 8 bits): aproximadamente 4,5-5 GB de pesos.
- Cuantización de 4 bits (bitsandbytes NF4, GPTQ/AWQ de 4 bits o GGUF Q4_K_M): aproximadamente 2,5-3 GB de pesos, lo que permite inferencia en GPUs de 6-8 GB.
- GPUs de consumo: cabe sin problemas en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en BF16; en 4 bits es viable en tarjetas de 8 GB e incluso en configuraciones con memoria unificada (Apple Silicon, iGPU con suficiente RAM compartida).
- GPUs de centro de datos: A100, H100, L40S y similares no son necesarias para un solo ejemplar, pero permiten servir muchas réplicas o lotes grandes por GPU.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM y TGI (la etiqueta text-generation-inference está presente en el repositorio), SGLang, y llama.cpp u Ollama previa conversión a GGUF, que no se distribuye en el repositorio. Unsloth puede emplearse para inferencia rápida en el mismo formato de entrenamiento.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, tiempo hasta el primer token ni comportamiento bajo batching continuo, ni para el modelo en BF16 ni en cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-HendrycksMATH-GRPO | ~4,02 B | 32.768 tokens segun la familia base; no confirmado en la model card | Matematicas (SFT + GRPO sobre Hendrycks MATH) | Apache 2.0 | HuggingFace, safetensors |
| Qwen3-4B-HendrycksMATH-SFT | ~4,02 B | igual que la familia base | Matematicas (solo SFT) | Apache 2.0 | HuggingFace; es el modelo base de este checkpoint |
| Qwen3-4B (base) | ~4,02 B | 32.768 tokens (131.072 con YaRN) | Proposito general, con modo de razonamiento | Apache 2.0 | HuggingFace |
| Qwen3-4B-Instruct-2507 | ~4,02 B | 262.144 tokens segun documentacion publica de Qwen | Proposito general e instrucciones | Apache 2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 B | 128.000 tokens segun documentacion publica | Razonamiento y matematicas destilado de R1 | Licencia MIT para el modelo destilado, con terminos adicionales de DeepSeek para el uso del modelo R1 | HuggingFace |

No se dispone de datos de rendimiento comparativos verificados para este checkpoint, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. No se han encontrado en la busqueda web resultados relevantes sobre este modelo: los enlaces devueltos correspondian a temas sin relacion (foros sobre bicicletas y redes sociales), por lo que no aportan informacion tecnica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El entrenamiento sobre un corpus academico de matematicas en ingles puede sesgar las respuestas hacia el formato y el estilo de ese dataset, con poca robustez ante enunciados coloquiales o mal formulados.
- Riesgo de alucinacion: relevante en matematicas, donde el modelo puede generar desarrollos plausibles pero incorrectos. La recompensa verificable del GRPO reduce este riesgo en los formatos vistos durante el entrenamiento, pero no lo elimina en problemas fuera de distribucion. No se han publicado tasas de error.
- Limitaciones de contexto: el contexto heredado es de 32.768 tokens (ampliable con YaRN segun la familia base), y no esta confirmado en la model card de este ajuste. Las cadenas de razonamiento largas consumen buena parte de esa ventana.
- Limitaciones de idioma: la model card declara unicamente ingles. Aunque el modelo base sea multilingue, el ajuste SFT y el RL se hicieron sobre un corpus en ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado ni medido.
- Especializacion estrecha: es un ajuste orientado a matematicas; su rendimiento en tareas generales de conversacion, codigo o redaccion puede haber degradado respecto al Qwen3-4B original, y no hay evaluaciones que lo cuantifiquen.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Conviene verificar tambien las condiciones aplicables al modelo base Qwen3.
- Caveats para produccion: con 0 descargas y 0 likes en el momento de la consulta, el repositorio carece de validacion por parte de la comunidad. No se documentan hiperparametros, funcion de recompensa, datos exactos de entrenamiento ni evaluaciones, lo que dificulta la trazabilidad y la reproducibilidad. Se recomienda evaluar el checkpoint en un conjunto de validacion propio antes de usarlo en cualquier flujo automatizado.
- Fecha de creacion indicada en el repositorio: 16 de octubre de 2026, posterior a la fecha de publicacion habitual de la familia Qwen3; conviene tratar las marcas temporales del repositorio con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmirFazlollahi/Qwen3-4B-HendrycksMATH-GRPO
- Modelo base (SFT): https://huggingface.co/AmirFazlollahi/Qwen3-4B-HendrycksMATH-SFT
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Modelo base Qwen3-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B
- Dataset Hendrycks MATH (referencia): https://github.com/hendrycks/math
- No se han encontrado en la busqueda web enlaces relevantes sobre este modelo; los resultados devueltos no guardaban relacion con el mismo.
