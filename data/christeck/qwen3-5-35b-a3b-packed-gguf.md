# Christeck/Qwen3.5-35B-A3B-PACKED-GGUF

## Resumen

Qwen3.5-35B-A3B es un modelo de mezcla de expertos (MoE) desarrollado por el equipo Qwen de Alibaba Cloud, con aproximadamente 35 mil millones de parametros totales y unos 3 mil millones activos por token. Esta ficha describe la variante publicada por Christeck Labs bajo el identificador `Christeck/Qwen3.5-35B-A3B-PACKED-GGUF`, que no es un modelo nuevo sino un reempaque sin perdida de los codigos trellis de cuantizacion EXL3 (originalmente generados por Turboderp con ExLlamaV3) dentro del contenedor Packed GGUF que consume el motor Metal Trellis.

El interes de esta publicacion es practico: permite ejecutar un MoE de clase 35B en Apple Silicon a velocidad interactiva. Segun las mediciones del autor en un M1 Max de 64 GB, el decodificado de expertos alcanza 18,7 tok/s con un TTFT de prefill de 0,44 s, y el fichero ocupa 12,99 GiB. No es un GGUF estandar de llama.cpp: requiere el fork Metal Trellis, que decodifica los pesos de los expertos empaquetados en trellis mediante kernels Metal en tiempo de ejecucion.

La relevancia actual radica en que demuestra que la cuantizacion trellis de ExLlamaV3 puede transportarse a un contenedor alternativo sin degradar la calidad de forma medible: en CT-Bench-mini (60 tareas de codigo con tests ocultos) la variante trellis obtiene 75 % (45/60) frente al 73 % (44/60) del base sin cuantizar en Q8_0, una diferencia de una sola tarea que el autor califica de empate tecnico. El coste no es de calidad sino de velocidad: 16,6 tok/s frente a 51,8 tok/s del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); pesos cuantizados en formato trellis EXL3 empaquetados en Packed GGUF |
| Parametros totales | 35B declarados por el nombre del modelo; el recuento del repo safetensors indica 7.108.758.656 (corresponde a los tensores empaquetados, no al total del modelo base) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis (reempaquetado sin perdida); se cita Q8_0 solo como control del modelo base sin cuantizar |
| Idiomas soportados | en, es |
| Licencia | Apache 2.0 |
| Formato de pesos | Packed GGUF (contenedor propio del motor Metal Trellis); no compatible con llama.cpp estandar |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es un transformer con mezcla de expertos de tipo disperso: alrededor de 35 mil millones de parametros totales de los que solo unos 3 mil millones se activan por token, lo que reduce el coste computacional por paso de decodificado. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original de Alibaba y no se reproducen en esta publicacion.

La innovacion tecnica de esta variante es el contenedor y el motor de inferencia. Christeck Labs toma los codigos trellis EXL3 producidos por ExLlamaV3 (cuantizacion de Turboderp, licencia MIT) y los reempaqueta, sin reentrenar ni alterar pesos, en el formato Packed GGUF que consume Metal Trellis. Ese motor decodifica los pesos de los expertos empaquetados al vuelo con kernels Metal especificos para Apple Silicon. No hay decodificacion especulativa, atencion lineal ni otras tecnicas declaradas en la informacion disponible; el cambio es exclusivamente de contenedor y de runtime.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repo.
- Razonamiento con modo "thinking" activable: las mediciones de benchmark se realizaron con thinking on, seed 42.
- Generacion de codigo en varios lenguajes: el benchmark del autor cubre TypeScript, SQL, C++, Java y JavaScript.
- Soporte multilingue limitado a ingles y espanol segun los metadatos del modelo.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que sugiere integracion en servicios de inferencia.
- No se declaran capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Asistencia de codigo local en Mac: el modelo resuelve tareas de programacion con tests ocultos (75 % en CT-Bench-mini) y corre a 16,6 tok/s en un M1 Max, suficiente para autocompletado y generacion de funciones en un IDE sin conexion a la nube.
- Prototipado de agentes conversacionales en Apple Silicon: la ventana de contexto no esta documentada, pero el formato permite conversaciones multi-turno; util para validar flujos de chat antes de desplegar en infraestructura mayor.
- Evaluacion de cuantizacion trellis: sirve como referencia practica para comparar la perdida de calidad de EXL3 frente a Q8_0 en tareas de codigo, con una diferencia medida de una sola tarea sobre 60.
- Desarrollo y depuracion del motor Metal Trellis: al ser la "copia de cortesia" del proyecto, permite a contribuyentes reproducir el pipeline de inferencia sin repetir la conversion desde EXL3.
- Generacion de consultas SQL y scripts de automatizacion: el benchmark reporta 5/5 en SQL, lo que respalda su uso en tareas de traduccion de lenguaje natural a consultas.
- Inferencia privada en estaciones de trabajo macOS: al ejecutarse integramente en local sobre Metal, evita enviar datos de codigo o conversacion a servicios externos, relevante para equipos con requisitos de confidencialidad.
- Educacion e investigacion sobre MoE: permite estudiar el comportamiento de un modelo de 35B con 3B activos en hardware de consumo de gama alta, sin GPU dedicada.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado | Condiciones |
|---|---|---|---|
| CT-Bench-mini (60 tareas de codigo, tests ocultos) | Esta variante (trellis EXL3) | 75 % (45/60) | Metal Trellis, thinking on, seed 42, 61,2 min, 16,6 tok/s |
| CT-Bench-mini | Base sin cuantizar (Q8_0) | 73 % (44/60) | 8,6 min, 51,8 tok/s |
| CT-Bench-mini por lenguaje (trellis) | TypeScript | 31/38 | — |
| CT-Bench-mini por lenguaje (trellis) | SQL | 5/5 | — |
| CT-Bench-mini por lenguaje (trellis) | C++ | 5/7 | — |
| CT-Bench-mini por lenguaje (trellis) | Java | 2/4 | — |
| CT-Bench-mini por lenguaje (trellis) | JavaScript | 2/6 | — |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Las tareas de CT-Bench-mini son de producto y solo se publican la puntuacion y la metodologia, no los enunciados.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con Metal y macOS; el motor Metal Trellis no funciona en GPU NVIDIA, AMD ni CPU x86.
- VRAM/unificada estimada: el fichero pesa 12,99 GiB; se midio en un M1 Max con 64 GB de memoria unificada. No se documenta el minimo de memoria para otros chips.
- GPU recomendadas: Apple Silicon de gama alta (M1 Max, M2 Max, M3 Max, M4 Max y equivalentes); no hay datos para chips base (M1, M2) ni para Ultra.
- Cabe en GPU de consumo: si, en el sentido de que Apple Silicon integra GPU y memoria unificada; no es ejecutable en RTX 4090 ni en A100/H100 con este runtime.
- Opciones de despliegue: exclusivamente el fork Metal Trellis (https://github.com/Christeck-AI/metal-trellis). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos (M1 Max, 64 GB): decodificado de expertos a 18,7 tok/s, TTFT de prefill 0,44 s; en la ejecucion del benchmark, 16,6 tok/s de media.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Runtime | Notas |
|---|---|---|---|---|---|---|
| Christeck/Qwen3.5-35B-A3B-PACKED-GGUF | 35B (MoE) | ~3B | no disponible | Apache 2.0 | Metal Trellis (Apple Silicon) | 75 % en CT-Bench-mini; 18,7 tok/s en M1 Max |
| Qwen/Qwen3.5-35B-A3B (base) | 35B (MoE) | ~3B | no disponible | Apache 2.0 | Multiples (segun pesos originales) | Referencia sin cuantizar; 73 % en CT-Bench-mini en Q8_0 |
| Christeck/Qwen3.8-27B-PACKED-GGUF | 27B (denso) | 27B | no disponible | Apache 2.0 | Metal Trellis (Apple Silicon) | Hermano denso del mismo autor, descrito como prueba de correccion |
| Alternativas GGUF estandar de clase 30-35B | no disponible | no disponible | no disponible | no disponible | llama.cpp, Ollama | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Dependencia total del motor Metal Trellis: no es un GGUF estandar y no carga en llama.cpp, Ollama, vLLM ni TGI; migrar a otro runtime exige reconvertir desde el checkpoint EXL3 original.
- Restriccion de plataforma: solo Apple Silicon con Metal y macOS; inutilizable en servidores x86 con GPU NVIDIA o AMD.
- Rendimiento limitado por el decodificado trellis: 18,7 tok/s frente a 51,8 tok/s del base Q8_0, una penalizacion de velocidad de aproximadamente 2,8x.
- Cobertura de benchmarks estrecha: solo CT-Bench-mini, con tareas no publicadas y un unico seed (42); no hay MMLU, HumanEval ni GSM8K que permitan comparaciones externas.
- Cobertura de idiomas declarada limitada a ingles y espanol; el rendimiento en otros idiomas no esta evaluado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Posible riesgo de alucinacion propio de los modelos generativos; no se documentan evaluaciones de factualidad ni de sesgos.
- Confusion potencial en el recuento de parametros: el repo safetensors indica 7.108.758.656, que corresponde a los tensores empaquetados y no a los 35B del modelo base; conviene no interpretarlo como tamano real del modelo.
- Licencia Apache 2.0 permisiva para uso comercial, heredada del modelo base, con la cuantizacion EXL3 acreditada a Turboderp (MIT); se distribuye "AS IS" sin garantias.
- El autor declara explicitamente que "el producto es el motor": el fichero es una copia de cortesia y puede quedar desactualizado respecto al repositorio de Metal Trellis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Christeck/Qwen3.5-35B-A3B-PACKED-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Motor Metal Trellis: https://github.com/Christeck-AI/metal-trellis
- Modelo hermano denso: https://huggingface.co/Christeck/Qwen3.8-27B-PACKED-GGUF
- ExLlamaV3 (cuantizacion EXL3 de Turboderp): no disponible en la informacion proporcionada
- Paper o blog del modelo base Qwen3.5-35B-A3B: no disponible en la informacion proporcionada
