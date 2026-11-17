# eth-algopt/AuXSpec-27B-RL

## Resumen

AuXSpec-27B-RL es un modelo de lenguaje especializado en autoformalización de especificaciones de programas, desarrollado por el grupo eth-algopt (ETH Zurich, junto con HKUST y el Institute for Theoretical Studies). Se construye a partir de Qwen/Qwen3.8-27B mediante un proceso de ajuste supervisado seguido de aprendizaje por refuerzo, y su tarea principal es traducir problemas de programación en lenguaje natural a ficheros completos de Lean 4 (Lean 4.32 con Mathlib) que contienen especificaciones declarativas, comprobadores ejecutables y casos de prueba `#guard`.

El problema que resuelve es concreto: escribir especificaciones formales en asistentes de demostración como Lean es lento y requiere mucha experiencia, lo que se convierte en un cuello de botella para escalar código formalmente verificado. AuXSpec propone un marco en el que cada postcondición declarativa se empareja con una contrapartida ejecutable mediante resolución de typeclasses, de modo que la ejecución de los casos de prueba sirve como señal de recompensa durante el entrenamiento por refuerzo.

El modelo tiene 27.356.728.560 parámetros (27,4B), se distribuye en BF16 safetensors y se ha evaluado con una ventana de contexto de 32K tokens. Es relevante ahora porque supera al estado del arte previo entre modelos abiertos de especificación (VeriSpecGen-30B-A3B) en el benchmark Verina sin casos de prueba en el prompt, con un pass@1 de 84,5 % frente a 47,6 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3_5ForConditionalGeneration, heredada de Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 (27,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32K tokens (contexto evaluado) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura y el tokenizador de su base, Qwen3.8-27B, identificada en la model card como `Qwen3_5ForConditionalGeneration`. No se detallan en la información disponible capas, dimensiones ocultas ni número de cabezas de atención; lo que sí se especifica es que el modelo razona dentro de etiquetas `` antes de emitir la respuesta y que se almacena en BF16 safetensors.

El entrenamiento combina dos fases. Primero, un ajuste supervisado sobre 19.5K muestras crecidas a lo largo de tres rondas de *expert iteration* sobre problemas de LeetCode y TACO, refinando en cada ronda desde el modelo base sobre el acumulado de muestras aceptadas. Después, aprendizaje por refuerzo sobre 8.281 tareas de SpecGen y 5.356 de CodeGen, con una recompensa progresiva que sigue el orden de los criterios de aceptación: que el fichero compile, que los `#guard` reproduzcan los casos de prueba dados y que pasen las comprobaciones de calidad basadas en un juez. Las tareas de reparación se generan en línea a partir de rollouts fallidos de la política actual, emparejados con mensajes del compilador, y ocupan el 40 % de cada batch. El algoritmo extiende DAPO con normalización de ventaja a nivel de batch, penalización KL hacia el modelo ajustado y máscara de pérdida en rollouts repetitivos; para CodeGen se reduce la recompensa si la implementación correcta es asintóticamente más lenta que un algoritmo conocido sobre la entrada máxima admitida, y las respuestas excesivamente largas se penalizan cerca del límite.

La innovación técnica central es el marco AuXSpec: cada postcondición declarativa se empareja con una postcondición booleana ejecutable sobre pares entrada-salida, obtenida por resolución de typeclasses en Lean cuando existe instancia de decidibilidad y definida aparte en caso contrario. Un teorema de equivalencia demuestra que ambas coinciden sobre entradas válidas, de modo que ejecutar el comprobador sobre un caso de prueba decide la postcondición declarativa y la especificación queda independiente de cualquier implementación. Con este marco se sintetizaron 3.037 problemas de LeetCode con teoremas de equivalencia demostrados.

## Capacidades

- Generación de especificaciones formales en Lean 4 (Lean 4.32, Mathlib) a partir de un problema en lenguaje natural: predicado de validez sobre las entradas, especificación declarativa de la salida correcta, comprobador ejecutable y casos de prueba `#guard`.
- Generación de código (CodeGen): implementación de una especificación dada en Lean 4.
- Reparación de especificaciones y de código (SpecGen-Repair y CodeGen-Repair): dado un fichero que falla y la realimentación del comprobador, produce una versión corregida.
- Razonamiento explícito en modo *thinking*: el modelo emite su cadena de razonamiento dentro de `<think>...</think>` antes de la respuesta final.
- Generación de código eficiente: el entrenamiento por refuerzo penaliza implementaciones correctas pero asintóticamente más lentas, de modo que el modelo tiende a producir soluciones con complejidad adecuada.
- Generación de texto conversacional y de código en general, heredada de la base Qwen3.8-27B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada (el modelo resuelve la tarea en una única generación con razonamiento interno).
- Capacidades multilingües: solo se declara inglés (`en`).
- Visión o audio: no disponible.

## Casos de uso

- Autoformalización de especificaciones para verificación formal: dado un enunciado de problema en lenguaje natural, el modelo produce un fichero Lean 4 con la especificación declarativa, su comprobador ejecutable y los `#guard` correspondientes, listo para integrarse en un pipeline de verificación con Mathlib.
- Generación de código verificado en Lean 4: a partir de una especificación formal existente, el modelo implementa la función y el equipo puede comprobar la corrección ejecutando los casos de prueba y, si procede, demostrando el teorema de equivalencia.
- Reparación automática de pruebas fallidas: integrado en un bucle de CI, el modelo recibe el fichero que no compila o que falla los `#guard` junto con los mensajes del compilador y devuelve una versión corregida, reduciendo el trabajo manual de depuración de especificaciones.
- Docencia y formación en métodos formales: el modelo genera especificaciones y código Lean comentados y ejecutables que sirven como material de referencia para estudiantes que aprenden a escribir postcondiciones y comprobadores.
- Ampliación de bancos de problemas formalizados: el modelo permite convertir a Lean 4 problemas de plataformas tipo LeetCode o TACO de forma masiva, generando los teoremas de equivalencia necesarios para validar cada especificación por ejecución.
- Preprocesado para demostración automática: las especificaciones generadas pueden alimentar demostradores o tácticas automáticas posteriores, ya que el modelo entrega la postcondición declarativa separada del comprobador ejecutable y de cualquier implementación.
- Evaluación de calidad de código generado: el modo CodeGen con penalización por complejidad asintótica permite usar el modelo para producir implementaciones eficientes sobre las que comparar el rendimiento de soluciones alternativas.

## Benchmarks y rendimiento

Resultados publicados en la model card. En cada columna, la negrita marca el mejor valor y el subrayado el segundo mejor; el número pequeño junto a los resultados del modelo es el cambio respecto al backbone.

| Benchmark | Metrica | AuXSpec-27B-RL | AuXSpec-9B-RL | Referencia |
|---|---|---|---|---|
| AuXSpec-Test (SpecGen) | pass@4 | 84,3 % (desde 14,3 %) | 82,7 % (desde 0,7 %) | no disponible |
| Verina, con casos de prueba en el prompt (SpecGen) | pass@4 | 96,8 % (desde 55,0 %) | 96,8 % (desde 18,5 %) | no disponible |
| Verina, sin casos de prueba en el prompt (SpecGen) | pass@1 | 84,5 % | no disponible | VeriSpecGen-30B-A3B: 47,6 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas para este modelo.

## Requisitos de hardware

- El repositorio ocupa 54,7 GB en BF16 safetensors, por lo que la inferencia en BF16 requiere al menos unos 55 GB de VRAM solo para los pesos, más la caché KV para 32K de contexto.
- GPU recomendadas para BF16: una H100 de 80 GB permite cargar el modelo completo con contexto largo; una A100 de 80 GB es igualmente viable. Con A100 de 40 GB o RTX 4090 (24 GB) no cabe en BF16.
- En GPU de consumo (RTX 4090, 24 GB) sería necesaria cuantización a 8 o 4 bits; la model card no publica pesos cuantizados ni variantes GGUF, por lo que esas conversiones habría que generarlas a partir de los safetensors.
- Despliegue: la model card indica que todas las evaluaciones se ejecutaron en vLLM con `max_model_len=32768` y `max_tokens=16384`. No se mencionan otras opciones de despliegue (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto evaluado | Fortaleza declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuXSpec-27B-RL | 27,4B | 32K | SpecGen pass@1 84,5 % en Verina sin casos de prueba | Apache 2.0 | Hugging Face |
| AuXSpec-9B-RL | 9,4B | 32K | SpecGen pass@4 82,7 % en AuXSpec-Test; 96,8 % en Verina con casos de prueba | Apache 2.0 | Hugging Face |
| VeriSpecGen-30B-A3B | no disponible en la información | no disponible | Estado del arte previo entre modelos abiertos de especificación; 47,6 % pass@1 en Verina sin casos de prueba | no disponible | no disponible |
| Qwen/Qwen3.8-27B | 27B (base) | no disponible | Modelo generalista del que deriva AuXSpec-27B-RL | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- El modelo solo declara inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está evaluado.
- Es un modelo especializado: su entrenamiento se centra en SpecGen, CodeGen y sus variantes de reparación en Lean 4.32 con Mathlib, por lo que su comportamiento fuera de ese dominio depende del backbone y no está validado.
- Riesgo de alucinación en el contenido formal: la recompensa de entrenamiento exige que el fichero compile y que los `#guard` reproduzcan los casos de prueba, pero una especificación puede compilar y pasar los tests sin capturar la intención completa del problema; la validación humana o la demostración del teorema de equivalencia siguen siendo necesarias.
- Los resultados de benchmarks se han obtenido con `max_model_len=32768` y `max_tokens=16384` en vLLM; ventanas o límites de generación menores pueden degradar el rendimiento de forma no cuantificada.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones de la base Qwen/Qwen3.8-27B, cuyos términos no se detallan en la información disponible.
- No se publican datos sobre sesgos, comportamiento en producción, cuantizaciones oficiales ni latencias; cualquier despliegue real requerirá validación propia.
- El modelo requiere un entorno Lean 4.32 con Mathlib para que las salidas sean ejecutables; sin ese entorno, la verificación por ejecución de los `#guard` no es posible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eth-algopt/AuXSpec-27B-RL
- Modelo hermano AuXSpec-9B-RL: https://huggingface.co/eth-algopt/AuXSpec-9B-RL
- Colección AuXSpec: https://huggingface.co/collections/eth-algopt/auxspec
- Paper principal: https://arxiv.org/abs/2611.21421
- Sitio web del proyecto: https://auxspec.org
- Paper DAPO (base del algoritmo de RL): https://arxiv.org/abs/2503.14476
- Paper referenciado en los tags (arXiv 2505.23135): https://arxiv.org/abs/2505.23135
- Paper referenciado en los tags (arXiv 2604.10392): https://arxiv.org/abs/2604.10392
- Paper referenciado en los tags (arXiv 2501.12948): https://arxiv.org/abs/2501.12948
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
