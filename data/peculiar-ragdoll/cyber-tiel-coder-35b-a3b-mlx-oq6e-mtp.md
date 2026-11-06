# peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP

## Resumen

Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP es una cuantizacion de 6 bits en formato MLX de un modelo MoE de 35B parametros totales (3B activos) orientado a programacion agéntica y seguridad ofensiva. Lo publica el usuario peculiar-ragdoll y deriva de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, a su vez una version sin censura (abliterated) de Ornith-1.5-35B-A3B. El modelo conserva la cabeza de prediccion multi-token (MTP) del modelo original y anade una plantilla de chat propia ("Sharp"), re-cuantizado con el cuantizador oQ de oMLX sobre un corpus de calibracion con peso especifico en ciberseguridad.

La relevancia del modelo esta en su perfil: es un coder MoE de clase 35B-A3B que, segun el autor, mantiene velocidad de decodificacion propia de un modelo con solo 3B parametros activos, con un tamano en disco de aproximadamente 30 GB en 6 bits, lo que lo hace viable en equipos Apple Silicon con memoria unificada alta. Ademas incorpora vision (pipeline image-text-to-text) y esta explicitamente descensurado, algo poco habitual en modelos de codigo de esta clase.

La ficha describe la variante MLX oQ6e con MTP. Es importante senalar que las metricas publicadas por el autor se midieron sobre la build GGUF, no sobre este fichero, y que esta build concreta falla en LM Studio (produce salida corrupta), por lo que su runtime objetivo es oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe` / `qwen35moe`), con cabeza de prediccion multi-token (MTP) |
| Parametros totales | 35.951.822.704 (≈35,95B) |
| Parametros activos | ≈3B (denominacion A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (oQ6e de oMLX); existe build oQ4e y build GGUF UD-Q4_K_M en la misma familia |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); build GGUF separada |
| Tamano del repo | 91,8 GB (incluye assets); pesos ≈30 GB segun el autor |
| Vision | si (pipeline image-text-to-text) |
| Modelo base | huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (relacion: quantized) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con 35,95B parametros totales y aproximadamente 3B activos por token, lo que explica su perfil de velocidad: el coste computacional por token se aproxima al de un modelo denso de 3B, mientras que la capacidad representacional corresponde a la familia de 35B. Sobre el modelo base abliterated, el autor aplica una re-cuantizacion a 6 bits con el cuantizador oQ de oMLX, calibrado con un corpus propio ponderado hacia ciberseguridad, e incorpora la plantilla de chat Sharp. Se conserva la cabeza MTP entrenada de Ornith-1.5, que permite decodificacion especulativa en runtimes que la soportan (oMLX, llama.cpp).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo original. El proceso de abliteration, heredado de huihui-ai, elimina la direccion de rechazo en el espacio de activaciones, lo que suprime las negativas del modelo. La cuantizacion emplea imatrix y esquema "unsloth-dynamic" segun los tags del repositorio.

## Capacidades

- Generacion de codigo y programacion agéntica: resolucion autonoma de issues y bugs en bases de codigo grandes, con ejecucion multi-paso.
- Razonamiento y planificacion multi-step, adecuado para bucles de agente con tool calling.
- Capacidades de vision: entrada image-text-to-text (procesamiento de imagenes junto con texto).
- Decodificacion especulativa mediante cabeza MTP, con aceleracion en runtimes compatibles.
- Multilingue limitado a ingles y chino.
- Modelo descensurado (abliterated): no presenta rechazos ante peticiones que otros modelos declinan, incluido trabajo de seguridad ofensiva.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el enfoque agéntico del modelo lo presupone.

## Casos de uso

- Reparacion autonoma de bugs en produccion: el modelo puede recibir un issue y el arbol del repositorio, localizar la causa y proponer un parche, con capacidad de iterar sobre los tests de regresion. Su perfil MoE de 3B activos permite ejecutarlo en un portatil Apple Silicon con 32 GB o mas de memoria unificada.
- Auditoria de seguridad ofensiva autorizada: en pruebas de penetracion con alcance definido, el modelo no rechaza tareas de analisis de vulnerabilidades, explotacion controlada o redaccion de PoC, lo que lo hace util en equipos red team que trabajan en entornos sandbox.
- Resolucion de retos CTF y formacion: segun el autor, obtiene 15 de 43 flags en Cybench sin guia, lo que lo hace adecuado como asistente en entrenamiento de seguridad ofensiva.
- Asistente de codigo en IDE con contexto visual: al aceptar entrada de imagen, puede analizar capturas de pantalla de errores, diagramas de arquitectura o interfaces para generar codigo o diagnosticar fallos.
- Automatizacion de pipelines CI/CD: integrado via tool calling en un agente que interpreta fallos de build, consulta logs y propone commits correctivos.
- Prototipado rapido en local sin conexion: al ser un modelo abierto con licencia MIT y pesos MLX, puede desplegarse en estaciones de trabajo sin enviar codigo propietario a servicios externos.
- Analisis de repositorios con contexto largo: util para revision de codigo y generacion de documentacion tecnica, siempre que se confirme la ventana de contexto real del modelo base.

## Benchmarks y rendimiento

El autor publica resultados medidos sobre la build GGUF en cuantizacion de 4 bits, no sobre este fichero MLX de 6 bits. Se recogen a continuacion tal como aparecen en la model card:

| Benchmark | Resultado | Notas |
|---|---|---|
| SWE-bench-Live | Resuelve ≈70% mas problemas reales que Ornith-1.5 y Qwen3.6-35B-A3B | Medido en GGUF UD-Q4_K_M; sin cifra absoluta publicada |
| Cybench (unguided) | 15/43 flags (35%) | Sin pistas ni juez, en GGUF |
| HarmBench | 0% de rechazos en 84 peticiones | Muestreo de 12 por peticion, en GGUF |
| Velocidad de resolución agéntica | 3-4x mas rapida que un denso de 3.8-27B | Segun el autor, en GGUF Q4 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El autor advierte explicitamente que cambiar de cuantizador altera los resultados y que estas cifras deben interpretarse como evidencia sobre el modelo, no sobre este fichero.

## Requisitos de hardware

- Memoria: los pesos ocupan aproximadamente 30 GB en 6 bits, por lo que se recomienda un minimo de 32 GB de memoria unificada en Apple Silicon; 36-48 GB o mas deja margen para el contexto y la cache KV.
- GPU: el formato MLX esta disenado para Apple Silicon (series M1 a M4, con preferencia por chips Pro/Max/Ultra). No es ejecutable en GPU NVIDIA o AMD en su formato nativo.
- GPU consumer: no aplica en el sentido habitual; en equipos Apple, un Mac con 32 GB o mas puede ejecutarlo. En GPUs NVIDIA haria falta la build GGUF y al menos 24 GB de VRAM en Q4, o 48 GB en cuantizaciones mayores.
- Despliegue: runtime oMLX (soporte completo, incluida la cabeza MTP). LM Studio no es compatible con esta build MTP: produce salida corrupta desde el primer token. Como alternativas, la build GGUF funciona en llama.cpp y la build MLX sin MTP funciona en LM Studio.
- Latencia y throughput: no disponibles como cifras absolutas; el autor afirma que la resolucion agéntica es 3-4x mas rapida que un denso de 3.8-27B, atribuible a los 3B parametros activos y a la decodificacion especulativa MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B (esta ficha) | 35,95B totales / ≈3B activos | no disponible | MIT | MLX safetensors, GGUF | Descensurado, vision, MTP, enfocado a ciberseguridad |
| Tiel-Coder-35B-A3B-MLX-oQ4e | 35,95B / ≈3B | no disponible | MIT | MLX | Version censurada del mismo autor, sin el ajuste ofensivo |
| Ornith-1.5-35B-A3B | 35B / ≈3B | no disponible | no disponible | no disponible | Modelo original; segun el autor resuelve ≈70% menos problemas en SWE-bench-Live |
| Qwen3.6-35B-A3B | 35B / ≈3B | no disponible | no disponible | no disponible | Referencia de la familia Qwen MoE; mismo perfil de rendimiento segun el autor |

No se dispone de datos de contexto ni de licencia de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: no rechaza peticiones daninas. El autor declara explicitamente que el usuario asume toda la responsabilidad legal y etica de su uso, y recomienda sandbox y monitorizacion.
- Riesgo elevado de uso dual: las capacidades ofensivas (35% en Cybench sin guia) pueden emplearse en actividades ilegales si no se limita el acceso.
- Incompatibilidad con LM Studio en esta build MTP: genera tokens aleatorios multilingues desde el primer token; no hay ajuste que lo corrija.
- Benchmarks no representativos de este fichero: las cifras publicadas corresponden a la build GGUF en 4 bits, no a esta cuantizacion MLX de 6 bits.
- Idiomas: solo ingles y chino; el rendimiento en castellano no esta documentado.
- Longitud de contexto: no disponible, lo que impide garantizar el comportamiento en repositorios grandes.
- Alucinacion: no hay datos especificos publicados; como todo modelo de codigo, puede generar APIs inexistentes o parches incorrectos que pasen revision superficial.
- Licencia MIT: permite uso comercial, pero no exime de responsabilidad por el contenido generado ni de las obligaciones de las licencias del modelo base.
- Dependencia de runtime: el ecosistema MLX limita el despliegue a hardware Apple; en servidores x86 con GPU hay que recurrir a la build GGUF.
- Fecha de creacion futura (2026): verificar la vigencia de los enlaces y del modelo base antes de integrarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Variante MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e
- Build GGUF: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Version censurada Tiel-Coder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original Ornith-1.5: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
