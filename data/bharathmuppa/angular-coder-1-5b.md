# bharathmuppa/angular-coder-1.5b

## Resumen

angular-coder-1.5b es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-1.5B-Instruct especializado en el framework Angular, publicado por el usuario bharathmuppa en HuggingFace bajo licencia Apache 2.0. El modelo parte de un transformer decoder-only de 1.543.714.304 parámetros y se ha entrenado mediante LoRA (rango 16, aplicado a las 16 últimas capas, en atención y MLP) fusionada posteriormente en los pesos base. El objetivo es cubrir un nicho muy concreto: generar TypeScript idiomático de Angular moderno (componentes standalone, signals, `inject()`, bloque de control `@if`/`@for`, `@defer`, detección de cambios zoneless, signal forms, el nuevo application builder y las migraciones de `ng update`).

El problema que resuelve es la desactualización de los asistentes de código genéricos en lo relativo a Angular: el modelo afirma conocer cada versión desde la v14 hasta la v22 (octubre de 2026) y responder indicando qué versión requiere cada característica. El entrenamiento se hizo con `mlx-lm` sobre un Apple M2 Max a partir del dataset `bharathmuppa/angular-instruct`, compuesto por 2030 pares de instrucción redactados a partir de la documentación oficial de Angular y su changelog (2427 registros de entrenamiento, 131 de validación y 79 de test).

Es relevante ahora por su tamaño reducido (1,5B) y por su doble distribución: pesos safetensors en formato MLX para Apple Silicon y builds GGUF (Q4_K_M de 1,0 GB, Q8_0 de 1,6 GB y f16 de 3,1 GB) con `Modelfile` para Ollama y llama.cpp. Eso permite ejecutarlo en un portátil, sin GPU dedicada, como asistente local de frontend. Sus propios límites están declarados por el autor: no es un asistente general y los números de issue y PR que cita suelen ser incorrectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajustado con LoRA fusionada sobre Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso una longitud maxima de secuencia de 2048 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M, GGUF Q8_0, GGUF f16; pesos safetensors del fine-tune (precision no indicada) y formato MLX |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (Q4_K_M, Q8_0, f16), MLX; incluye `Modelfile` para Ollama |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1.543.714.304 parametros. Sobre el se aplico un ajuste LoRA de rango 16 limitado a las 16 ultimas capas y a las proyecciones de atencion y MLP; el adaptador se fusiono despues en los pesos del modelo base, de modo que la inferencia no requiere cargar un adaptador aparte. El entrenamiento se ejecuto con `mlx-lm` en un Apple M2 Max. Los datos proceden de `bharathmuppa/angular-instruct`: 2030 pares de instruccion redactados manualmente a partir del contenido de la documentacion oficial de Angular (`angular/angular`, `adev/src/content`, licencia MIT) y del changelog del proyecto. El modelo se entreno con una system prompt concreta que el autor recomienda reutilizar en inferencia; conviene respetarla porque define el rol ("experto en Angular de v12 a la version actual") y el estilo de respuesta esperado.

La configuracion de entrenamiento esta documentada de forma explicita: 2427 registros de entrenamiento, 131 de validacion y 79 de test; 1700 iteraciones; batch size 4; longitud maxima de secuencia 2048; learning rate 3e-5 con decaimiento coseno y 50 pasos de warm-up. La perdida se calcula unicamente sobre los tokens del asistente, no sobre los del usuario. La perdida de validacion final es 1,313 (partiendo de 2,175) y la perdida de test sobre tokens del asistente pasa de 2,104 en el modelo base a 1,293 en el modelo ajustado. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de codigo TypeScript especifico de Angular: componentes standalone, signals, `input()`/`output()`, `inject()`, bloque de control `@if`/`@for`/`@switch`, vistas diferibles con `@defer`.
- Conocimiento versionado del framework: el autor declara cobertura de Angular v14 a v22 y la capacidad de indicar que version introduce cada caracteristica.
- Guia de migraciones y actualizaciones: `ng update`, cambios de APIs entre versiones, migracion de NgModules a standalone, sustitucion de directivas estructurales antiguas por el nuevo flujo de control.
- Soporte de deteccion de cambios zoneless y de signal forms segun la model card.
- Generacion de codigo de scaffolding de aplicaciones y componentes pequenos.
- Conversacion multi-turno con plantilla de chat compatible con `apply_chat_template` de transformers.
- Respuesta a preguntas sobre problemas conocidos ("estoy en 19.2 y veo X"): segun el autor, acierta la forma de la respuesta, la linea de release y la descripcion del arreglo, pero no los numeros de issue ni de PR.
- No documentado: tool calling / function calling, capacidades de agente, vision, audio, modo thinking, ni capacidades multilingues (solo ingles).

## Casos de uso

- Asistente de migraciones de Angular: el equipo pega un componente con NgModules y directivas estructurales antiguas y el modelo devuelve la version standalone equivalente, indicando que version de Angular requiere cada API. Es adecuado porque el entrenamiento se construyo justamente sobre el changelog y las guias de migracion.
- Generacion de componentes nuevos con APIs modernas: scaffolding de componentes standalone con `input.required()`, signals y `@defer` en bloques de plantilla, con TypeScript idiomatico. Util para acelerar el arranque de pantallas en un proyecto Angular 17+.
- Revision y modernizacion de codigo en un pipeline interno: revision de pull requests por lotes para detectar patrones obsoletos (`*ngIf`, modulos innecesarios, `@ViewChild` estatico) y proponer el reemplazo. Al ser un modelo de 1,5B puede desplegarse en el propio runner sin enviar codigo a terceros.
- Asistente local en el portatil del desarrollador: distribucion GGUF Q8_0 (1,6 GB) o Q4_K_M (1,0 GB) ejecutada con Ollama o llama.cpp en una maquina sin GPU dedicada, lo que permite trabajar con codigo propietario sin salir del equipo.
- Inferencia nativa en Apple Silicon: los pesos en formato MLX con `mlx-lm` permiten generar codigo en un Mac con memoria unificada, sin CUDA ni entornos virtuales con dependencias pesadas.
- Chatbot interno de soporte para el equipo de frontend: respuestas sobre diferencias entre versiones de Angular, disponibilidad de APIs y uso correcto del CLI. El contexto de 2048 tokens de entrenamiento limita las conversaciones a turnos cortos, asi que funciona mejor como consulta puntual que como sesion larga.
- Generacion de formularios con signal forms y validacion tipada, un area donde las APIs han cambiado entre versiones y los asistentes genericos suelen mezclar sintaxis antiguas y nuevas.
- Material de formacion: explicacion de conceptos (inyeccion de dependencias via `inject()`, zoneless, vistas diferibles) con ejemplos ejecutables, ajustando la respuesta a la version de Angular del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de perdida del entrenamiento, que no son comparables con MMLU, HumanEval o GSM8K:

| Metrica | Modelo base | Modelo ajustado |
|---|---|---|
| Perdida de test sobre tokens del asistente | 2,104 | 1,293 |
| Perdida de validacion final | 2,175 (inicial) | 1,313 |
| Iteraciones | no aplica | 1700 |
| Longitud maxima de secuencia | no aplica | 2048 |

No hay datos publicados de evaluacion funcional (por ejemplo, porcentaje de componentes Angular correctos generados) ni comparaciones con otros fine-tunes de Angular.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del tamano de los ficheros publicados, incluyendo overhead de contexto y runtime): f16 ~4 GB; Q8_0 ~2,5-3 GB; Q4_K_M ~1,5-2 GB.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM para Q4_K_M y Q8_0 (RTX 3050, RTX 4060, RTX 3060 12 GB, GTX 1660 con 6 GB); para f16 son recomendables 6-8 GB.
- Apple Silicon: es la plataforma de referencia, ya que el modelo se entreno con `mlx-lm` en un M2 Max y se distribuye en formato MLX; un Mac con 8-16 GB de memoria unificada es suficiente en Q4_K_M o Q8_0.
- CPU: la variante Q4_K_M de 1,0 GB puede ejecutarse en CPU con llama.cpp, con velocidad reducida.
- Opciones de despliegue documentadas: `mlx-lm` (Apple Silicon), Ollama (`ollama run hf.co/bharathmuppa/angular-coder-1.5b:Q8_0` o construccion local desde el `Modelfile`) y llama.cpp con los GGUF. Tambien se documenta el uso con `transformers` (AutoModelForCausalLM con `device_map="auto"`).
- vLLM y TGI no estan documentados por el autor; al tratarse de un transformer Qwen2 de 1,5B son tecnicamente compatibles, pero no hay guia ni verificacion publicada.
- Latencia y throughput: no disponibles.
- Recomendacion del autor: Q8_0 para preguntas sobre hechos de versiones, Q4_K_M para scaffolding. Ambos fueron validados contra el modelo completo con preguntas reservadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formatos |
|---|---|---|---|---|---|
| angular-coder-1.5b | 1,54B | no disponible (entrenado a 2048) | Angular v14-v22 | Apache 2.0 | safetensors, GGUF, MLX |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,54B | no disponible en la informacion | codigo general | Apache 2.0 | safetensors |
| Otros fine-tunes comunitarios de Angular | no disponible | no disponible | Angular | no disponible | no disponible |

No se han encontrado en la informacion proporcionada otros modelos especializados en Angular con los que establecer una comparacion cuantitativa. Frente a su modelo base, la diferencia medible es la perdida de test sobre tokens del asistente (2,104 a 1,293) y la especializacion tematica; el modelo base conserva mayor cobertura de lenguajes y frameworks, mientras que este fine-tune es mas preciso en Angular y menos util fuera de ese dominio. Las busquedas web realizadas no devolvieron resultados relevantes (unicamente foros sin relacion con el modelo), por lo que no hay datos externos de comparacion.

## Limitaciones y advertencias

- Alucinacion en referencias concretas: el autor advierte que en preguntas sobre issues conocidos el modelo acierta la forma de la respuesta, la linea de release y la descripcion del arreglo, pero los numeros de issue y de PR suelen ser incorrectos. Hay que verificarlos en GitHub antes de citarlos.
- Corte de conocimiento en Angular 22 (octubre de 2026): no conoce versiones posteriores ni cambios del changelog mas recientes.
- Solo ingles: la model card declara unicamente `en`; no hay datos de calidad en castellano.
- Tamano muy limitado: con 1,5B parametros esta pensado para preguntas de Angular y componentes pequenos; no es un asistente general ni un modelo de razonamiento. No debe usarse para tareas ajenas al frontend Angular.
- Repeticiones: el autor recomienda usar `repetition_penalty` de 1,1 o similar, porque las listas largas de imports pueden repetirse.
- Longitud de contexto efectiva: el entrenamiento uso secuencias de 2048 tokens y no se documenta la ventana nativa del fine-tune; los archivos grandes y las conversaciones largas pueden degradar la calidad.
- Necesidad de revision humana: el propio autor indica que se compruebe el codigo generado antes de enviarlo a produccion. No hay evaluacion funcional publicada (tests, compilacion, tasas de exito).
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-Coder-1.5B-Instruct, tambien Apache 2.0. El dataset de entrenamiento se deriva de la documentacion de Angular y del changelog (MIT), por lo que es razonable mantener la atribucion a dichas fuentes.
- Repositorio de 17,6 GB: incluye varias conversiones de pesos; conviene descargar solo el fichero necesario con `--include` para no llenar el disco.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa y de reportes de errores independientes.
- Riesgo de sesgo de version: al entrenarse sobre documentacion oficial, puede reproducir el discurso del equipo de Angular y no senalar trade-offs o alternativas fuera del framework.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bharathmuppa/angular-coder-1.5b
- Dataset de entrenamiento: https://huggingface.co/datasets/bharathmuppa/angular-instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio de la documentacion de Angular usada como fuente (`adev/src/content`): https://github.com/angular/angular
- Repositorio de `mlx-lm`: https://github.com/ml-explore/mlx-lm
- No se han encontrado papers, blogs, demos ni repositorios adicionales en las busquedas web realizadas; los resultados devueltos no guardaban relacion con el modelo.
