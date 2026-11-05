# Convergent-ch/Alpina-Endas-2.2-Large-AoM-270B

## Resumen

Alpina Endas 2.2 Large-AoM-270B es un paquete experimental publicado por Convergent-ch que combina un unico checkpoint ya entrenado de 15.008 parametros (Alpina Micro 2.0-15K) con un catalogo diferido de 17.990.406 copias virtuales del mismo. El nombre comercial hace referencia a una suma nominal de 270.000.013.248 parametros (17.990.406 × 15.008), pero el propio autor aclara de forma explicita que no se trata de 270B de parametros aprendidos de forma independiente: todas las copias comparten exactamente los mismos pesos y las etiquetas de rol (codigo, logica, matematicas, fisica, conocimiento, investigacion) son prompts, no expertos entrenados por separado.

El objetivo del paquete no es ofrecer un modelo de lenguaje competitivo, sino documentar un experimento de orquestacion y replicacion virtual: como gestionar un catalogo masivo de identidades logicas sobre un unico modelo base minimo, con reduccion jerarquica en streaming, transcripciones atribuidas y soporte de interrupcion/reanudacion. La arquitectura subyacente es un modelo de caracteres de tipo transformer de tamano micro, con una ventana de contexto de 512 tokens y entrenado unicamente en ingles.

Es relevante ahora como caso de estudio metodologico y como ejemplo de empaquetado reproducible (validacion sin dependencias, tests de simulacion, evidencia de evaluacion original), no como alternativa a modelos densos o MoE reales de esa escala. El autor advierte que el modelo base devuelve su propia identidad incluso cuando se le pide explicar una lista de Python, por lo que no debe confundirse el tamano nominal del catalogo con capacidad aprendida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de caracteres tipo transformer de escala micro (base Alpina Micro 2.0-15K); capa de orquestacion AoM con catalogo de replicas virtuales |
| Parametros totales | 15.008 parametros unicos (suma nominal del catalogo: 270.000.013.248) |
| Parametros activos | no disponible (no es un MoE; todas las replicas comparten los mismos pesos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | FP32 (safetensors original) y F16 (GGUF opcional del unico modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El componente aprendido es un unico checkpoint Alpina Micro 2.0-15K de 15.008 parametros, descrito por el autor como un modelo de caracteres de escala micro. No hay entrenamiento adicional asociado al paquete Endas: las 17.990.406 replicas virtuales son identidades logicas generadas de forma perezosa mediante un catalogo compacto de rangos, sin archivos de pesos separados ni objetos Python por replica. Dos de esas replicas se etiquetan como Input-Divisors y las 17.990.404 restantes como contextos worker.

La capa de orquestacion (AoM) implementa comunicacion mediante texto de planificacion, notas recientes entre pares, reduccion jerarquica en streaming con un reductor acotado, transcripciones atribuidas y soporte de interrupcion y reanudacion de la misma peticion. El enrutado de etiquetas de rol lo calculan reglas de software, no un mecanismo aprendido. La memoria del proceso crece con la frontera de reduccion activa, no con el tamano del catalogo nominal. No se han publicado detalles sobre el dataset de entrenamiento del modelo base, el numero de tokens consumidos ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto a nivel de caracter en ingles, limitada a la capacidad real de un modelo de 15.008 parametros.
- Orquestacion de hasta 16 workers mas dos contextos Input-Divisor por defecto, con opcion de superar los 256 workers activos mediante el flag `--allow-large-run`.
- Reduccion jerarquica en streaming con reductor de tamano acotado, pensada para agregar respuestas de muchos workers sin volcar todo el catalogo en memoria.
- Transcripciones atribuidas por rol (codigo, logica, matematicas, fisica, helper, conocimiento, investigacion) tratadas como prompts, no como expertos diferenciados.
- Soporte de interrupcion y reanudacion de una peticion identica mediante `--resume`.
- Modo de simulacion sin dependencias externas (solo biblioteca estandar de Python) para validar el paquete y ejecutar tests.
- Inferencia real opcional en CPU, deshabilitada por defecto; requiere instalar `requirements.txt` y pasar `--allow-inference`.
- No dispone de tool calling, function calling, capacidades de agente autonomo, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Estudio de orquestacion multi-agente simulada: el paquete permite reproducir una topologia de 16 workers con reduccion jerarquica y transcripciones completas, util para investigar patrones de agregacion de respuestas sin coste de GPU.
- Docencia y formacion en sistemas de replicas virtuales: sirve para ilustrar la diferencia entre parametros nominales y parametros unicos aprendidos, con validacion reproducible mediante `python validate_package.py` y tests unitarios.
- Pruebas de infraestructura de catalogos perezosos: el catalogo compacto de rangos evita materializar millones de objetos, lo que permite medir consumo de memoria en funcion de la frontera de reduccion y no del numero de replicas.
- Validacion de pipelines de empaquetado de modelos: el repositorio incluye evidencia de evaluacion original, lista de dependencias y licencias, lo que lo convierte en un ejemplo de paquete autocontenido verificable sin conexion.
- Experimentos de reanudacion de peticiones largas: el flag `--resume` permite continuar una peticion interrumpida de forma identica, util para probar mecanismos de checkpointing en flujos de orquestacion.
- Pruebas de integracion con Ollama en modo limitado: el GGUF F16 del modelo base puede cargarse en Ollama sin modificaciones, pero Ollama no puede ejecutar el grafo AoM en Python; sirve para comparar el comportamiento del base aislado frente al paquete completo.
- Referencia negativa en evaluaciones: dado que el modelo base devuelve su identidad incluso ante preguntas tecnicas, puede usarse como caso de control en baterias de evaluacion para calibrar detectores de respuestas degeneradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona evidencia de evaluacion original en el paquete, limitada a observar que el modelo base devuelve su identidad incluso cuando se le pide explicar una lista de Python, pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 y practicamente despreciable en F16, dado que el checkpoint unico tiene 15.008 parametros.
- GPU recomendadas: no se requiere GPU; el backend real de inferencia del paquete esta pensado para CPU.
- Cabe en cualquier GPU consumer e incluso en CPU sin aceleracion; no se han publicado cifras de latencia ni throughput.
- Opciones de despliegue: ejecucion nativa en Python 3.12 mediante `micro_aom.py` (modo simulacion o modo chat con `--allow-inference`); el GGUF F16 del modelo base puede cargarse en Ollama o llama.cpp de forma independiente, pero ninguna de estas herramientas ejecuta el grafo AoM.
- El paquete no arranca GPU, API en la nube, elemento de inicio, registro en Ollama ni entrenamiento en segundo plano de forma automatica.
- Los modos con mas de 256 workers activos requieren `--allow-large-run` y pueden tardar mucho tiempo y generar transcripciones de gran tamano; el autor indica que ese modo no se ejecuto durante la preparacion del paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Alpina Endas 2.2 Large-AoM-270B | 15.008 unicos (270B nominales por replicas) | 512 tokens | Apache 2.0 | Experimento de orquestacion; sin benchmarks publicados |
| Alpina Micro 2.0-15K | 15.008 | 512 tokens | Apache 2.0 | Modelo base del paquete, sin capa AoM |
| Modelos densos de ~7B (referencia generica) | ~7.000 millones | 4K-32K tipico | Variable | Capacidad aprendida real muy superior; no comparable en tarea |
| Modelos MoE de ~200B-300B (referencia generica) | 200.000-300.000 millones | 32K-128K tipico | Variable | Misma suma nominal que el catalogo AoM, pero con parametros aprendidos de forma independiente |

La comparacion con modelos densos o MoE de gran escala solo es valida en terminos de suma nominal de parametros, no de capacidad. No se dispone de alternativas directamente equivalentes en la categoria de replicas virtuales sobre un unico checkpoint micro.

## Limitaciones y advertencias

- El propio autor advierte que no hay 270B de parametros aprendidos de forma independiente: todas las replicas comparten los mismos 15.008 pesos y la duplicacion no aporta conocimiento nuevo.
- El modelo base es un modelo de caracteres de escala micro; no es un asistente fiable para codigo, matematicas ni conocimiento factual. Devuelve su identidad incluso ante preguntas tecnicas sencillas.
- Ventana de contexto de 512 tokens, lo que obliga a recortar prompts y resúmenes en el flujo de orquestacion.
- Solo soporta ingles; no se ha documentado comportamiento multilingue.
- Riesgo alto de alucinacion y de respuestas degeneradas por la capacidad limitada del checkpoint subyacente.
- No se han publicado benchmarks estandar, por lo que no es posible comparar su rendimiento con modelos convencionales.
- La inferencia real esta deshabilitada por defecto y no se ejecuto durante la preparacion del paquete; los resultados del modo real no estan validados por el autor.
- Ollama sin modificaciones solo puede cargar el GGUF del modelo base aislado, no ejecutar el grafo AoM; no debe confundirse el catalogo con modelos activos.
- La licencia Apache 2.0 permite uso comercial del codigo y los pesos, pero el valor practico del paquete es experimental y no se recomienda su uso en produccion como asistente.
- El nombre del modelo puede inducir a error sobre su escala real; cualquier evaluacion debe basarse en los 15.008 parametros unicos, no en la suma nominal.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-Large-AoM-270B
- Descarga del paquete completo (ZIP v1.1): https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-Large-AoM-270B/resolve/v1.1/Alpina-Endas-2.2-Large-AoM-270B.zip
- Modelo base: https://huggingface.co/Convergent-ch/Alpina-Micro-2.0-15K
- Cliente oficial del Hub: https://huggingface.co/docs/huggingface_hub
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
