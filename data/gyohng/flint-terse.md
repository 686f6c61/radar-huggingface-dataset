# gyohng/flint-terse

## Resumen

Flint Terse es un ajuste fino (fine-tune) del modelo Flint de Recursive, distribuido como archivo GGUF listo para usar en llama.cpp y LM Studio. Su objetivo es reducir de forma drastica el numero de tokens de razonamiento que el modelo genera dentro de los bloques `<think>`, manteniendo practicamente intacta la calidad de las respuestas finales. Segun la model card, consigue aproximadamente un 72% menos de pensamiento en tareas de codigo, un 84% menos en matematicas y un 87% menos en prosa y chat, con una precision en codigo de 101,3 frente a 102,3 sobre 110 tareas del modelo base.

El modelo parte de `RecursiveSI/flint-int4-gguf`, un modelo con 39.785.287.456 parametros totales (arquitectura MoE segun la descripcion de la model card, con expertos enrutados y un experto compartido) y una longitud de contexto de 262.144 tokens. El ajuste se realizo con LoRA de rango 32 en FP32 sobre los coeficientes int4 y se fusiono posteriormente en el GGUF mediante `llama-export-lora`, reescribiendo determinados tensores como F16 y manteniendo el resto en Q4_1.

Es relevante porque aborda un problema practico de los modelos con modo "thinking": el coste computacional y la latencia derivados de generar largas cadenas de razonamiento incluso en consultas triviales. Flint Terse mantiene la capacidad de razonar en problemas dificiles (el limite de penalizacion se aplica solo por encima de un cuarto del pensamiento del modelo base) mientras recorta drasticamente la verbosidad en casos sencillos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con experto compartido y expertos enrutados; transformer segun la model card |
| Parametros totales | 39.785.287.456 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_1 (mayoria de tensores) y F16 (tensores reescritos por `llama-export-lora`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tambien existen adaptadores LoRA en GGUF y MLX, y modelo completo MLX) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Flint base en su version int4. La arquitectura descrita en la model card incluye atencion con proyecciones q/k/v/o, un experto compartido, dos MLP densas y expertos enrutados en las ultimas 16 capas MoE. El entrenamiento se realizo directamente sobre los coeficientes int4 con LoRA de rango 32 en FP32 aplicado a la atencion, el experto compartido y las MLP densas, mas LoRA de rango 8 sobre las proyecciones down de los expertos enrutados en las ultimas 16 capas MoE.

El proceso de entrenamiento combino aprendizaje supervisado y aprendizaje por refuerzo. Una pasada supervisada inicial enseno el estilo de pensamiento telegrafico para prosa y chat. Despues, el modelo aprendio de sus propias respuestas mediante RL: una respuesta obtenia recompensa solo si superaba sus tests, y la recompensa disminuia cuanto mas larga era la cadena de pensamiento. En el caso de flint-terse, la penalizacion solo se aplicaba por encima de un cuarto del pensamiento que generaba el modelo base en cada tarea, de modo que los problemas dificiles conservan margen para razonar. Una etapa final sobre chats cortos y conversaciones multi-turno mantiene el pensamiento breve en el uso cotidiano.

La fusion del adaptador en el GGUF se valido con `llama-perplexity --kl-divergence`: sobre mas de 16.000 tokens de transcripciones de chat, la divergencia KL media respecto al modelo base mas adaptador es de 0,003, con un 98% del mismo token top, un valor no superior a la variacion del propio modelo base al ejecutarse con otro tamano de lote.

## Capacidades

- Generacion de texto conversacional y multi-turno.
- Razonamiento con modo "thinking" explicito dentro de etiquetas `<think>`, pero en formato telegrafico y breve.
- Generacion y razonamiento sobre codigo, con precision practicamente identica al modelo base.
- Razonamiento matematico, con mejora reportada en la metrica de tareas de matematicas (108,7 frente a 103,3 del base).
- Redaccion de prosa y chat con reduccion drastica del pensamiento (87% menos).
- Compatibilidad con plantillas de chat Jinja en llama.cpp (`--jinja`) y con el motor de plantillas de LM Studio.
- Capacidad de mantener respuestas finales completas sin filtrar etiquetas `<think>` en la salida.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.

## Casos de uso

- Asistentes de codigo en IDE o CLI: el modelo mantiene una precision de 101,3 sobre 110 tareas de codigo con un 72% menos de tokens de pensamiento, lo que reduce la latencia y el coste por peticion en autocompletado y generacion de funciones.
- Chat de atencion al cliente: la etapa final de entrenamiento sobre chats cortos y multi-turno mantiene el pensamiento breve en conversaciones cotidianas, y el contexto de 262.144 tokens permite arrastrar historiales largos sin truncar.
- Razonamiento matematico asistido: con 108,7 sobre 120 tareas de matematicas y un 84% menos de pensamiento, es adecuado para tutoria o resolucion de problemas paso a paso en entornos con presupuesto de tokens limitado.
- Despliegue local en estaciones de trabajo: al distribuirse como GGUF unico de 33,7 GB y funcionar en llama.cpp y LM Studio, permite ejecutar el modelo en hardware de gama alta sin infraestructura adicional.
- Generacion de documentacion tecnica y prosa: la reduccion del 87% en pensamiento para prosa y chat acelera tareas de redaccion donde el razonamiento extendido aporta poco.
- Prototipado e investigacion de tecnicas de razonamiento eficiente: el repositorio de GitHub incluye codigo, datos y un script de reproduccion, lo que facilita experimentar con el ajuste o adaptarlo a otros modelos base.
- Evaluacion comparativa de modos "thinking": al existir variantes con distintos presupuestos de pensamiento (flint-terse y flint-terse-minimalist), permite medir el compromiso entre calidad y coste computacional en un mismo modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre el base int4 con el adaptador en llama.cpp. Las puntuaciones son la media de tres semillas con una muestra por tarea (temperatura 1, top-p 0,95, top-k 20). La reduccion de pensamiento es relativa al base en las mismas tareas.

| Modelo | Codigo (110 tareas) | Matematicas (120 tareas) | Menos pensamiento: codigo | Matematicas | Prosa y chat |
|---|---:|---:|---:|---:|---:|
| Flint int4 (base) | 102,3 | 103,3 | — | — | — |
| flint-terse | 101,3 | 108,7 | 72% | 84% | 87% |
| flint-terse-minimalist | 95,0 | 105,5 | 88% | 89% | 96% |

Ademas, la model card reporta una divergencia KL media de 0,003 respecto al modelo base mas adaptador sobre mas de 16.000 tokens de chat, con un 98% del mismo token top.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 33,7 GB; se necesita al menos esa cantidad de memoria (VRAM o memoria unificada) mas margen para el contexto y el estado de inferencia.
- GPU recomendadas: no especificadas en la informacion proporcionada; por tamano, encaja en GPUs de 48 GB o mas (A6000, A100 80 GB, H100) o en soluciones con memoria unificada amplia.
- Cabe en consumer GPU: no en GPUs consumer tipicas de 24 GB (RTX 4090) sin offloading parcial a CPU o sin cuantizaciones adicionales no descritas; si puede caber en configuraciones con memoria unificada de 64 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, y por extension cualquier frontend compatible con GGUF. Existe tambien una version MLX para mlx-lm.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Codigo (110 tareas) | Matematicas (120 tareas) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| flint-terse | 39,8 B | 262.144 | 101,3 | 108,7 | Apache-2.0 | GGUF, LoRA GGUF, MLX |
| flint-terse-minimalist | 39,8 B (base) | 262.144 | 95,0 | 105,5 | Apache-2.0 | GGUF |
| Flint int4 (base) | 39,8 B | 262.144 | 102,3 | 103,3 | Apache-2.0 | GGUF |

No se dispone de datos de benchmarks de otros modelos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a las variantes del propio Flint.

## Limitaciones y advertencias

- El pensamiento telegrafico puede degradar la calidad en tareas que requieren cadenas de razonamiento largas; el modelo solo se penaliza por encima de un cuarto del pensamiento del base, pero la reduccion es agresiva en prosa y chat.
- La variante flint-terse-minimalist pierde aproximadamente 7 tareas de codigo respecto al base, lo que ilustra el compromiso entre brevedad y precision.
- No hay informacion sobre sesgos conocidos, idiomas soportados ni comportamiento fuera del ingles en la documentacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de los modelos de lenguaje.
- La licencia Apache-2.0 permite uso comercial sin condiciones adicionales segun la model card, pero conviene verificar la licencia del modelo base Flint de Recursive.
- La plantilla de chat embebida elimina el `replace("\x00", "")` original porque el motor de plantillas de LM Studio no lo soporta; puede haber diferencias menores de comportamiento entre motores de inferencia.
- El archivo GGUF mezcla tensores Q4_1 y F16; la cuantizacion adicional del usuario puede alterar el comportamiento respecto a los resultados publicados.
- No se han publicado datos de throughput ni latencia, por lo que el rendimiento en produccion debe medirse en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gyohng/flint-terse
- Adaptadores LoRA (GGUF y MLX): https://huggingface.co/gyohng/flint-terse-lora
- Modelo completo en MLX: https://huggingface.co/gyohng/flint-terse-mlx
- Variante minimalist: https://huggingface.co/gyohng/flint-terse-minimalist
- Modelo base Flint: https://huggingface.co/RecursiveSI/flint
- GGUF base int4: https://huggingface.co/RecursiveSI/flint-int4-gguf
- Repositorio con codigo, datos y reproduccion: https://github.com/gyohng/flint-terse
