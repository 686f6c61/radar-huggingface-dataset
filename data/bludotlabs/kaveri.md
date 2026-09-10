# bludotlabs/kaveri

## Resumen

Kaveri H-GRPO 0.5B INT8 es una version cuantizada a 8 bits del modelo experimental `dharun2049/kaveri-hgrpo-0.5b`, publicado por el usuario `bludotlabs` en Hugging Face. Se trata de un modelo de generacion de texto de 494.336.896 parametros (aproximadamente 0,5B) construido sobre la arquitectura Qwen2, especializado en razonamiento compacto y generacion de codigo, e idioma ingles unicamente.

Su rasgo diferencial no es el rendimiento bruto, sino el metodo de entrenamiento declarado: Hypergraph Group Relative Policy Optimization (H-GRPO), una extension del GRPO que modela las relaciones entre multiples soluciones candidatas mediante un hipergrafo (similitud de estrategia, similitud de codigo, comportamiento ante casos de prueba y relaciones estructurales). El objetivo declarado es estudiar cuanto razonamiento puede retenerse en modelos por debajo de los mil millones de parametros.

Esta release concreta aplica cuantizacion LLM.int8() de bitsandbytes sobre el checkpoint padre, reduciendo el peso serializado a unos 613 MB con una huella en memoria medida de aproximadamente 601 MB. La relevancia actual es doble: por un lado, sirve como banco de pruebas para investigacion en RL aplicado a modelos diminutos; por otro, su tamano permite inferencia local en hardware muy modesto, incluido CPU. Cabe senalar que el checkpoint INT8 no ha sido reevaluado todavia sobre el conjunto completo de benchmarks del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (0.5B) |
| Parametros totales | 494.336.896 (aprox. 0,5B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 mediante bitsandbytes LLM.int8() (`load_in_8bit=True`, `llm_int8_threshold=6.0`, `llm_int8_skip_modules=["lm_head"]`) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Framework | Hugging Face Transformers (requiere `accelerate` y `bitsandbytes`) |
| Tamano del checkpoint | aprox. 613,16 MB serializado; aprox. 601,04 MB de huella en memoria medida |
| Modelo padre | `dharun2049/kaveri-hgrpo-0.5b` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con aproximadamente 0,5B de parametros y sin componentes Mixture-of-Experts ni capas de estado (SSM). Esta release no modifica la topologia: se limita a sustituir la mayoria de las capas lineales soportadas por la implementacion `Linear8bitLt` de bitsandbytes. La model card advierte explicitamente de que LLM.int8() no equivale a convertir todos los tensores a `torch.int8`: las operaciones numericamente sensibles y las caracteristicas atipicas (outliers) pueden seguir computandose en mayor precision, y el modulo `lm_head` queda excluido de la cuantizacion.

El entrenamiento del modelo padre se describe como una investigacion experimental sobre H-GRPO (Hypergraph Group Relative Policy Optimization), un metodo de aprendizaje por refuerzo con rewards relativos a un grupo, en el que las respuestas candidatas dejan de tratarse como muestras independientes y se relacionan entre si mediante un hipergrafo usando senales como similitud de estrategia, similitud de codigo, comportamiento frente a casos de prueba y relaciones estructurales entre soluciones. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de SFT, RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento de tipo cadena de pensamiento orientado a problemas algorítmicos y matematicos de dificultad baja o media.
- Generacion de codigo, con enfasis en Python y problemas tipo entrevista tecnica (el ejemplo de la model card resuelve Two Sum).
- Entrenamiento orientado a diversidad de soluciones: H-GRPO busca mantener estructuras de razonamiento utiles y variedad de enfoques, no una unica respuesta canonica.
- Uso contemplado en investigacion sobre agentes y tool-use, aunque no se documenta soporte explicito de function calling ni un formato de herramientas nativo.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no documentado como funcionalidad separada.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: con un checkpoint de unos 613 MB, el modelo puede cargarse en CPU o en GPUs integradas para prototipado rapido de asistentes conversacionales en ingles.
- Generacion asistida de ejercicios de programacion: dado un enunciado tipo entrevista, el modelo produce una funcion Python, util para generar borradores o ejemplos didacticos que luego se revisan manualmente.
- Investigacion en aprendizaje por refuerzo: sirve como sujeto de prueba de bajo coste para reproducir o variar el esquema H-GRPO y comparar contra GRPO estandar sin necesidad de clústeres de GPU.
- Experimentos de cuantizacion: al existir el checkpoint padre en mayor precision, permite medir la degradacion introducida por LLM.int8() en tareas de codigo y razonamiento, con la salvedad de que esa reevaluacion aun no se ha publicado.
- Docencia y material educativo: su tamano permite ejecutarlo en un portatil durante una clase para ilustrar tecnicas de RL, cuantizacion y ajuste de modelos pequenos.
- Filtrado o preprocesado de datos de codigo: puede emplearse como clasificador generativo ligero para etiquetar fragmentos o proponer tests sencillos en pipelines de datos, siempre con supervision humana.
- Pruebas de concepto de agentes multi-paso: la model card lo situa en el ambito de investigacion sobre agentes y uso de herramientas, aunque sin garantias de fiabilidad en cadenas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del checkpoint INT8 en la informacion disponible. La model card indica explicitamente que el checkpoint cuantizado no ha sido reevaluado sobre el conjunto completo de pruebas y que los numeros del modelo original no deben transferirse automaticamente, ya que la cuantizacion puede alterar las salidas.

Las evaluaciones recomendadas por el autor para una futura validacion posterior a la cuantizacion son:

| Benchmark | Proposito declarado |
|---|---|
| MMLU | Conocimiento general y razonamiento |
| HumanEval | Generacion de codigo |
| MBPP / MBPP+ | Programacion en Python |
| LiveCodeBench | Programacion competitiva |
| GSM8K | Razonamiento matematico |
| ARC | Razonamiento cientifico y logico |

| Benchmark | Kaveri 0.5B INT8 | Modelo padre | Modelos comparables |
|---|---|---|---|
| MMLU | no disponible | no disponible | no disponible |
| HumanEval | no disponible | no disponible | no disponible |
| GSM8K | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: en torno a 1 GB o menos para los pesos INT8 (613 MB serializados, 601 MB de huella medida); sumando cache KV y activaciones para contextos moderados, entre 1 y 2 GB es suficiente en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, como GTX 1650, RTX 3050, RTX 3060 o superiores. Modelos de gama alta como A100 o H100 no aportan ventaja significativa a este tamano salvo por throughput agregado en lotes grandes.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en practicamente cualquier GPU de consumo y tambien en CPU, e incluso en sistemas con memoria unificada.
- Limitacion de backend: al estar cuantizado con bitsandbytes, la ruta nativa es Transformers con CUDA. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa no documentada.
- Opciones de despliegue: Hugging Face Transformers con `accelerate` y `bitsandbytes`; vLLM y TGI no estan documentados para este checkpoint concreto en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La comparacion de rendimiento no puede realizarse porque no hay benchmarks publicados del checkpoint INT8. Se comparan a continuacion caracteristicas estructurales conocidas de alternativas de la misma categoria (modelos instructivos sub-1B):

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Kaveri H-GRPO 0.5B INT8 | 0,49B | no disponible | no disponible | safetensors INT8 | no disponible |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens (nativo) | Apache 2.0 | safetensors, GGUF | no disponible en esta ficha |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | no disponible en esta ficha |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | no disponible en esta ficha |

La diferencia principal de Kaveri frente a estas alternativas es su esquema de entrenamiento por RL (H-GRPO) y la ausencia de pesos GGUF y de licencia declarada, lo que complica tanto el despliegue en herramientas de consumo como el uso comercial.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos, el uso comercial queda en situacion de incertidumbre juridica y no deberia asumirse permitido.
- Sesgos conocidos: no documentados; al entrenarse principalmente para razonamiento y codigo, es probable que su comportamiento fuera de ese dominio sea pobre, pero no hay analisis publicado.
- Riesgo de alucinacion: alto en un modelo de 0,5B, especialmente en conocimiento factual y en explicaciones de codigo no verificadas. La model card no incluye advertencias al respecto.
- Idiomas: soporte declarado unicamente en ingles; el castellano no esta contemplado y no hay datos sobre su comportamiento en otros idiomas.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar tareas con entradas largas.
- Cuantizacion: LLM.int8() puede degradar la calidad de salida respecto al checkpoint padre. El propio autor advierte de que los resultados del modelo original no son validos para esta version.
- Backend ligado a bitsandbytes: requiere CUDA para un funcionamiento optimo y no ofrece pesos GGUF, lo que limita su uso en llama.cpp, Ollama o entornos de solo CPU con herramientas estandar.
- Documentacion incompleta: no se detallan tokens de entrenamiento, composicion del dataset, ni proceso de alineacion.
- Inconsistencia en la model card: los ejemplos de codigo cargan el identificador `dharun2049/kaveri-hgrpo-0.5b-int8`, mientras que esta publicacion es `bludotlabs/kaveri`; conviene verificar la ruta correcta antes de desplegar.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y ausencia de evaluacion posterior a la cuantizacion. No es recomendable para produccion sin una validacion propia.
- La busqueda web asociada no devolvio resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a contenido no relacionado y se han descartado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bludotlabs/kaveri
- Modelo padre: https://huggingface.co/dharun2049/kaveri-hgrpo-0.5b
- Referencia de cuantizacion bitsandbytes LLM.int8(): https://huggingface.co/docs/transformers/main/en/quantization/bitsandbytes
- Documentacion de Qwen2 en Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/qwen2

No se han encontrado papers, blogs, repositorios ni demos adicionales sobre este modelo en la busqueda web disponible.
