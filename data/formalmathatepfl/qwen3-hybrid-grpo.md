# formalmathatepfl/qwen3-hybrid-grpo

## Resumen

Qwen3 Hybrid GRPO es un checkpoint de ajuste fino del modelo Qwen3-8B, entrenado con GRPO (Group Relative Policy Optimization) para demostración automática de teoremas en Lean. Lo publica el usuario `formalmathatepfl` en HuggingFace y se corresponde con el paso de entrenamiento 250, es decir, un checkpoint intermedio de un proceso de RL, no una versión final consolidada.

El modelo conserva la arquitectura del base (`Qwen3ForCausalLM`, transformer causal denso) con 8.190.735.360 parámetros en BF16 y pesos en formato safetensors repartidos en 4 shards (16,4 GB de repositorio). Su relevancia es acotada pero específica: los demostradores de teoremas entrenados con RL sobre Lean son escasos en abierto, y este checkpoint permite inspeccionar el efecto de GRPO sobre un modelo de ~8B en una tarea de razonamiento formal verificable.

La ficha del autor es mínima: no declara licencia, idiomas, longitud de contexto ni resultados de evaluación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de investigación sin validación externa ni garantías de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (`Qwen3ForCausalLM`) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible. La model card no la declara; no se confirma para este checkpoint la ventana del modelo base Qwen3-8B |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en BF16; no incluye GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors, dtype BF16, 4 shards (16,4 GB) |
| Libreria | transformers |
| Pipeline | text-generation |
| Paso de entrenamiento | 250 (checkpoint intermedio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer causal denso con normalizacion RMSNorm, atención con RoPE y sin mezcla de expertos, exportado a traves de la clase `Qwen3ForCausalLM` de la libreria `transformers`. El checkpoint mantiene el tokenizador y la configuracion del base, y solo se modifican los pesos como resultado del ajuste con GRPO.

El entrenamiento documentado es GRPO (Group Relative Policy Optimization), un algoritmo de RL sin modelo critico que estima la ventaja relativa dentro de grupos de muestras generadas para la misma consulta. El dominio declarado es la demostracion de teoremas en Lean, por lo que la señal de recompensa seria la verificacion del script de prueba por el compilador (entorno Lean). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa exacta, ni si hubo fases previas de SFT o DPO. El hecho de que el checkpoint sea del paso 250 indica que el proceso de RL seguia en curso en el momento de la exportacion.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base Qwen3-8B.
- Generacion de codigo en Lean 4 orientada a la construccion de pruebas formales (el `tags` del repositorio incluye `lean` y `theorem-proving`).
- Razonamiento formal y matematico de varios pasos sobre enunciados demostrables.
- Escritura de scripts de prueba que pueden verificarse mecanicamente con el compilador de Lean.
- Capacidad conversacional (`conversational`), lo que permite interaccion multi-turno.
- Compatibilidad declarada con `text-generation-inference` y con `endpoints_compatible` (despliegue gestionado en HuggingFace).
- Soporte de tool calling / function calling: no declarado en la model card. El modelo base Qwen3 lo incorpora, pero no hay confirmacion de que se haya preservado tras el ajuste con GRPO.
- Capacidades de agente y razonamiento multi-paso: no declaradas.
- Modo thinking explicito: no declarado.
- Vision o audio: no disponibles (modelo exclusivamente de texto).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de pruebas en Lean 4 para ejercicios y lemas: el modelo produce scripts de prueba que se pueden pasar por el compilador y descartar los que fallen, lo que permite un bucle de muestreo-y-verificacion sin supervision humana.
- Autoformalizacion de enunciados matematicos: traduccion de problemas redactados en lenguaje natural a declaraciones formales en Lean, como primer paso de un pipeline de verificacion.
- Sugerencia de tacticas en un asistente de demostracion: integrado en un entorno interactivo, el modelo propone la siguiente tactica o bloque de tacticas dado el estado actual del objetivo.
- Busqueda de pruebas con agente: combinado con el REPL de Lean, se pueden lanzar multiples intentos, consultar los errores del compilador y reintentar, usando el modelo como generador de candidatos.
- Generacion de datos sinteticos de razonamiento formal: produccion de pares (enunciado, prueba verificada) para ampliar corpus de entrenamiento de modelos mayores o de sistemas de recuperacion.
- Filtrado y reescritura de pruebas existentes: simplificar o reparar pruebas que compilan pero son redundantes o que dejan de compilar tras un cambio de version de Mathlib.
- Reproduccion de investigacion en RL para razonamiento: punto de partida para estudiar el efecto de GRPO en un modelo denso de 8B sobre una tarea con recompensa verificable.
- Apoyo docente en cursos de logica y teoria de tipos: explicacion paso a paso de pruebas formales, con la ventaja de que la salida es comprobable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MiniF2F, ProofNet, LeanWorkbook ni de ningun otro conjunto de evaluacion, y no se ha localizado ninguna publicacion asociada. Los resultados de busqueda web recuperados no guardan relacion con el modelo.

## Requisitos de hardware

Los valores de VRAM son estimaciones calculadas a partir del recuento de parametros y del dtype publicado; no proceden de mediciones del autor.

- Pesos en BF16: 8,19 B x 2 bytes = 16,4 GB, que coinciden con el tamano del repositorio. A esto hay que sumar la cache KV y las activaciones, que dependen de la longitud de contexto (no declarada).
- VRAM estimada en BF16: aproximadamente 18-24 GB para contexto corto o moderado, segun el tamano de lote y la longitud de secuencia.
- VRAM estimada en FP8/INT8: aproximadamente 9-12 GB.
- VRAM estimada en 4 bits (requiere cuantizacion propia, no incluida en el repositorio): aproximadamente 5-7 GB.
- GPU de datacenter: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB. En A100 40 GB cabe en BF16 con margen.
- GPU de consumo: cabe en BF16 en RTX 4090 / RTX 5090 (24-32 GB) solo con contexto contenido y ajustando el uso de memoria; en RTX 4080 / 4070 Ti (16 GB) o inferiores es necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: `transformers` (soporte nativo confirmado), TGI (el repositorio declara la etiqueta `text-generation-inference`), vLLM (soporte de Qwen3), Endpoints de HuggingFace (`endpoints_compatible`). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no incluye version cuantizada.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de generacion (tokens por segundo) en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de evaluacion de este checkpoint que permitan una comparacion cuantitativa. La tabla recoge unicamente los atributos verificables de cada modelo; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-hybrid-grpo (este) | 8,19 B | no disponible | no disponible | safetensors BF16 | Checkpoint GRPO del paso 250, sin evaluacion publicada |
| Qwen3-8B (modelo base) | 8,2 B | no disponible en la informacion recogida | no disponible en la informacion recogida | safetensors | Modelo generalista; es el punto de partida del ajuste |
| Otros demostradores de teoremas en Lean de ~7-8 B (DeepSeek-Prover, Goedel-Prover, Kimina-Prover) | no disponible | no disponible | no disponible | no disponible | No se han recuperado datos verificados de estos modelos en la busqueda realizada |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 250) de un proceso de RL, no una version final. El rendimiento puede ser inferior al de un modelo con el entrenamiento completado y no hay garantia de estabilidad de la politica.
- Ausencia total de evaluacion publicada: no hay resultados en MiniF2F ni en ningun otro conjunto, por lo que el rendimiento real en demostracion de teoremas es desconocido.
- Licencia no declarada: sin licencia explicita, el uso comercial queda en un limbo legal. No debe asumirse que hereda la licencia del modelo base.
- Riesgo alto de alucinacion en dominios fuera de Lean: al ser un ajuste especializado sobre un modelo generalista, la degradacion en tareas de proposito general (redaccion, codigo no-Lean, conversacion abierta) no esta caracterizada.
- Riesgo especifico de pruebas plausibles pero incorrectas: el modelo puede generar scripts que parecen correctos y no compilan, o que compilan usando `sorry` o axiomas no deseados. Toda salida debe verificarse con el compilador y auditarse en busca de `sorry`, `admit` y axiomas anadidos.
- Sensibilidad a la version de Lean y Mathlib: una prueba valida para una version concreta del entorno puede dejar de compilar al actualizarla. No se documenta sobre que version se entreno.
- Longitud de contexto desconocida: sin este dato no se puede planificar el tratamiento de enunciados largos o de historiales multi-turno extensos.
- Idiomas no declarados: se desconoce el comportamiento fuera del ingles (y previsiblemente del chino) del modelo base.
- Sesgos: no hay estudios de sesgo ni de toxicitad sobre este checkpoint. Al proceder de un ajuste por RL con recompensa binaria de compilacion, los sesgos del base pueden quedar intactos o amplificarse en las distribuciones muestreadas.
- Cero traccion y cero validacion de la comunidad (0 descargas, 0 likes): no existe evidencia de terceros que reproduzcan el comportamiento declarado.
- Repositorio de 16,4 GB en BF16 sin versiones cuantizadas: el despliegue en hardware de gama media exige una conversion manual, que puede alterar el comportamiento del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/formalmathatepfl/qwen3-hybrid-grpo
- Modelo base referenciado: Qwen3-8B (no se ha incluido un enlace directo porque no aparece en la informacion proporcionada)
- Paper, blog o repositorio asociados: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo, su entrenamiento o su evaluacion.
