# anonymous-submission-ICLR2027/Gobble-Prover-1.7B

## Resumen

Gobble-Prover-1.7B es un modelo de lenguaje especializado en demostración automática de teoremas en Lean 4, publicado como envío anónimo para revisión por pares (el identificador del autor es `anonymous-submission-ICLR2027`, con toda probabilidad un seudónimo asociado al proceso de revisión de ICLR 2027). Se obtiene por ajuste fino supervisado (SFT) seguido de GRPO sobre el modelo base `AI-MO/Kimina-Prover-Distill-1.7B`, desarrollado por los equipos de Project Numina y Kimi. El problema que aborda es el de generar demostraciones formales verificables para enunciados matemáticos, un cuello de botella clásico en la formalización de matemáticas y en la verificación de software crítico.

El repositorio contiene únicamente pesos, configuración y tokenizador en formato `safetensors`, con un total real de 2.031.739.904 parámetros (ligeramente por encima de los 1,7B que sugiere el nombre, algo habitual cuando se contabilizan capas de embeddings y cabezas). La ventana de contexto, el volumen de tokens de entrenamiento y la composición del dataset no se detallan en la información disponible.

Su relevancia actual es doble: por un lado, demuestra que modelos de menos de 2.500 millones de parámetros pueden abordar razonamiento formal si se especializan con RL sobre recompensas verificables; por otro, sirve como artefacto reproducible para comparar estrategias de ajuste (SFT + GRPO) en el dominio de Lean 4. Es importante subrayar que las demostraciones generadas deben validarse siempre con el compilador de Lean: el modelo no garantiza corrección formal por sí mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (segun el tag `qwen3` del repositorio); detalles de capas y atencion no disponibles |
| Parametros totales | 2.031.739.904 (pesos reales en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en precision completa/original en `safetensors`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Identificador | `anonymous-submission-ICLR2027/Gobble-Prover-1.7B` |
| Modelo base | `AI-MO/Kimina-Prover-Distill-1.7B` |
| Tamano del repositorio | 4,1 GB |
| Fecha de creacion | 18 de septiembre de 2026 |
| Ultima actualizacion | 18 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |
| Compatibilidad de despliegue | `text-generation-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La informacion publicada describe un ajuste en dos fases sobre `AI-MO/Kimina-Prover-Distill-1.7B`: primero un ajuste fino supervisado (SFT) y despues GRPO (Group Relative Policy Optimization), un algoritmo de optimizacion de politica que estima ventajas relativas dentro de grupos de respuestas generadas para la misma entrada. El tag `qwen3` del repositorio apunta a una arquitectura transformer decoder-only de la familia Qwen3, coherente con el modelo base destilado de Kimina. No se especifican el numero de capas, dimensiones ocultas, tipo de atencion (completa o con variantes eficientes) ni si se emplearon tecnicas adicionales como decodificacion especulativa.

El dato funcional mas relevante de la model card es que el modelo genera demostraciones en Lean 4 para enunciados con multiples respuestas candidatas, lo que sugiere un uso previsto de muestreo multiple (best-of-n) con verificacion posterior por parte del compilador de Lean. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset (por ejemplo, proporcion de Mathlib, problemas de competicion o datos sinteticos), la existencia de filtrado por recompensa verificable ni los hiperparametros de SFT o GRPO. El modelo base fue desarrollado por Project Numina y los equipos de Kimi y se distribuye bajo Apache 2.0, licencia que se mantiene en este derivado.

## Capacidades

- Generacion de demostraciones formales en Lean 4 para enunciados matematicos, incluyendo la produccion de multiples candidatos por enunciado.
- Razonamiento matematico de varios pasos orientado a la construccion de pruebas (seleccion de tacticas, manejo de hipotesis y objetivos).
- Generacion de texto conversacional segun el pipeline declarado (`text-generation`, tag `conversational`).
- Especializacion de dominio: el entrenamiento se centra en el ecosistema Lean 4, no en codigo generico ni en matematicas informales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas externas: no disponible; el flujo documentado asume verificacion externa con Lean, no una integracion de agente nativa.
- Capacidades multilingues: limitadas al ingles (`en`).
- Capacidades especiales: no se documentan modos de pensamiento explicito, vision ni audio.

## Casos de uso

- Demostracion automatica de teoremas en Lean 4: el modelo recibe un enunciado formalizado y devuelve una tactica o bloque de prueba que debe compilarse con Lean; encaja en flujos de trabajo donde el objetivo esta ya escrito en sintaxis Lean y se busca cerrar el goal automaticamente.
- Best-of-n con verificacion formal: dado que la model card indica generacion de multiples respuestas candidatas, el uso natural es muestrear k demostraciones, pasarlas por el compilador de Lean y conservar la primera que verifique, lo que compensa la tasa de error por muestra individual de un modelo de ~2.000 millones de parametros.
- Asistencia a la formalizacion en proyectos de Mathlib: un matematico puede delegar los lemas auxiliares y los pasos rutinarios de una prueba mientras reserva para si la estrategia global; el modelo actua como autocompletado de tacticas sobre objetivos concretos.
- Generacion de datos sinteticos para entrenamiento: las demostraciones que compilan correctamente pueden reciclarse como pares (enunciado, prueba) para ajustar modelos mayores o para ampliar corpus de razonamiento formal, siempre tras filtrado por verificador.
- Verificacion en pipelines de CI para librerias matematicas: integrado mediante un runner que invoque `lake` o `lean` sobre el fichero generado, el modelo puede proponer parches de prueba para teoremas que fallan tras un refactor, marcando como valida unicamente la salida que compila.
- Investigacion en aprendizaje por refuerzo con recompensas verificables: al ser un derivado entrenado con GRPO y publicado con pesos, sirve como punto de partida o linea base para estudiar funciones de recompensa, filtrado de muestras y escalado de RL en dominios formales.
- Apoyo docente en cursos de logica y teoria de tipos: el estudiante plantea un enunciado y el modelo propone una prueba que despues se contrasta con Lean, lo que hace explicita la diferencia entre "prueba plausible" y "prueba verificada".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MiniF2F, ProofNet, Mathlib ni de ningun otro conjunto de evaluacion, y tampoco se aportan datos de tasa de compilacion exitosa (`pass@k`) en Lean 4.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, los 2.031.739.904 parametros ocupan aproximadamente 4,1 GB de pesos, a los que hay que sumar cache KV y overhead del runtime (estimacion practica: 6-8 GB segun longitud de contexto). En cuantizacion de 8 bits, alrededor de 2,1 GB de pesos; en 4 bits, alrededor de 1,1 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en servidor con mayor concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso individual con holgura.
- Cabe en GPU de consumo: si, con margen amplio; una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o incluso GPU de 8 GB con cuantizacion son suficientes para inferencia con contextos moderados, siempre que exista una compilacion de los pesos en el formato adecuado.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). vLLM es una opcion habitual para este tipo de arquitectura, pero no se confirma en la informacion disponible. No se publican pesos en GGUF, por lo que Ollama y `llama.cpp` requeririan una conversion previa por parte del usuario.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Lean 4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gobble-Prover-1.7B | 2.031.739.904 (~2,03B) | no disponible | no disponible (sin benchmarks publicados) | Apache 2.0 | Pesos en safetensors en HuggingFace |
| AI-MO/Kimina-Prover-Distill-1.7B (modelo base) | no disponible en la informacion proporcionada (familia 1,7B) | no disponible | no disponible | Apache 2.0 | Pesos publicos en HuggingFace |
| Otras alternativas de demostracion formal (por ejemplo, DeepSeek-Prover, Goedel-Prover) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de rendimiento, contexto o licencia de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita al modelo base declarado. La busqueda web realizada no devolvio ningun enlace relacionado con modelos de demostracion de teoremas: los resultados obtenidos correspondian al colectivo de hacktivistas Anonymous y son irrelevantes para esta ficha.

## Limitaciones y advertencias

- Fiabilidad formal: el propio autor indica que las demostraciones generadas deben comprobarse con Lean. El modelo puede producir tacticas sintacticamente validas pero logicamente incorrectas, o directamente codigo que no compila.
- Alucinacion: riesgo alto de inventar nombres de lemas, teoremas de Mathlib o argumentos que no existen; en dominios formales esto se traduce en fallos de compilacion o en pruebas que no cierran el objetivo.
- Idioma: el modelo esta etiquetado unicamente para ingles, aunque la salida principal sea codigo Lean 4; los enunciados o comentarios en otros idiomas pueden degradar el comportamiento.
- Naturaleza anonima del envio: el autor figura como `anonymous-submission-ICLR2027`, sin paper, informe tecnico ni repositorio de codigo enlazado; no es posible atribuir el trabajo ni verificar sus afirmaciones. No se ha sometido a revision por pares en el momento de redactar esta ficha, segun los datos disponibles.
- Ausencia de benchmarks: no hay evidencia publicada de `pass@k` ni comparaciones controladas con otros provers, por lo que cualquier evaluacion de calidad debe realizarla el usuario.
- Trazabilidad de datos: se desconoce la composicion del dataset de SFT y GRPO, lo que impide evaluar contaminacion con conjuntos de evaluacion o sesgos derivados del corpus de formalizacion utilizado.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo base tiene su propia model card, que conviene revisar; el derivado hereda las condiciones de atribucion correspondientes a los equipos de Project Numina y Kimi.
- Despliegue en produccion: al no publicarse pesos cuantizados ni datos de contexto maximo, habria que validar empiricamente la ventana real, el consumo de memoria y la estabilidad de la generacion antes de integrarlo en cualquier sistema automatizado. Las descargas y likes del repositorio eran cero en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-submission-ICLR2027/Gobble-Prover-1.7B
- Modelo base: https://huggingface.co/AI-MO/Kimina-Prover-Distill-1.7B
- Paper o informe tecnico del modelo: no disponible
- Repositorio de codigo o demo: no disponible
- Nota sobre la busqueda web: los unicos resultados recuperados trataban sobre el colectivo Anonymous (Wikipedia y sitios no relacionados) y no aportan informacion tecnica sobre este modelo.
