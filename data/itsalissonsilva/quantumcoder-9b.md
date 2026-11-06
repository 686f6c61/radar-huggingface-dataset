# itsalissonsilva/QuantumCoder-9B

## Resumen

QuantumCoder-9B es un adaptador LoRA de rango 16 publicado por el usuario itsalissonsilva sobre el modelo base Qwen/Qwen3.5-9B. Su tarea es la traduccion de circuitos cuanticos sinteticos completamente especificados a codigo Python ejecutable en uno de tres frameworks: Qiskit, PennyLane o Cirq. El adaptador se entrena con datos sinteticos generados por el propio autor y evalua la correccion del estado cuantico resultante mediante un ejecutor restringido.

El interes del modelo reside en su evaluacion cuantitativa: el adaptador pasa 288/288 casos de validacion cruzada retenidos y 282/288 casos de estres mas grandes, frente a 36/288 y 47/288 del modelo base. Los intervalos de confianza bootstrap al 95% para la diferencia adaptador-base son de [83,33; 91,32] puntos porcentuales en el split retenido y [77,78; 85,42] en el de estres. El autor advierte explicitamente que un renderizador determinista ya resuelve esta tarea perfectamente, por lo que el valor del modelo es academico y de investigacion, no de produccion.

La relevancia actual es limitada: se trata de un adaptador pequeno (0,1 GB de repositorio, pesos LoRA) con 13 descargas y 0 likes en el momento de la ficha, orientado a un nicho muy concreto (traduccion de circuitos a codigo) y con un modelo base de 9B parametros que no esta documentado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16, alpha 32) sobre transformer Qwen/Qwen3.5-9B |
| Parametros totales | 9B en el modelo base; el adaptador no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens maximos de entrenamiento; prompts superiores se rechazan, no se truncan |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (adaptador y pesos derivados del base; atribucion al base retenida) |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base debe descargarse por separado |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 con alpha 32 sobre las proyecciones q_proj, v_proj e in_proj_qkv del modelo base Qwen3.5-9B (revision c202236235762e1c871ad0ccb60c8ee5ba337b9a). El entrenamiento consiste en una unica epoca fija sobre 648 ejemplos, con optimizador AdamW, learning rate 2e-5, acumulacion de gradiente 8, semilla 20261101 y longitud maxima de secuencia 2.048. No se realiza seleccion de checkpoint sobre el test.

Los datos son circuitos sinteticos originales con vectores de estado exactos, organizados en un curriculum de 456 grupos de circuitos y 1.368 vistas por framework: 216/648 para entrenamiento, 48/144 para validacion y 96/288 en cada split de test. Los circuitos de entrenamiento usan 2-4 qubits, CNOTs adyacentes y 6-13 puertas; el split de estres usa 5-6 qubits, CNOTs no locales y 16-24 puertas. Las puertas cubiertas son H, X, Z, RY, RZ y CX. Los identificadores de grupo, conjuntos de angulos de rotacion y hashes de entrada son disjuntos entre particiones, y una auditoria independiente no encuentra duplicados exactos de estado de entrada cero entre entrenamiento y holdouts de la misma dimension con tolerancia de fidelidad 1e-8. Los 2.000 grupos del estudio original fueron excluidos.

Una innovacion metodologica destacable es el ejecutor restringido y aislado (sandbox con UID/GID 65534, denegacion de red, ficheros y ejecucion de procesos, limites de recursos y cribado de un subconjunto acotado de Python) que valida cada programa generado contra el estado cuantico de referencia con fidelidad invariante a fase global mayor que 1-1e-6. El autor documenta tambien un estudio negativo previo (hf_pilot) en el que un adaptador entrenado solo con Qiskit/PennyLane paso 0/128 casos de Cirq frente a 3/128 del base, lo que motivo el diseno del nuevo curriculum con los tres frameworks.

## Capacidades

- Traduccion de circuitos cuanticos especificados (qubits, operaciones y angulos) a codigo Python para Qiskit, PennyLane o Cirq.
- Generacion de programas con importaciones correctas del framework solicitado y convenciones de estado little-endian.
- Manejo de puertas H, X, Z, RY, RZ y CX, incluidas CNOTs no locales en el split de estres.
- Generacion determinista en modo greedy con limite de 768 tokens generados y thinking desactivado.
- El helper de inferencia devuelve codigo fuente falible y nunca lo ejecuta.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso mas alla de la generacion directa del programa.
- No tiene capacidades de vision, audio ni modo thinking (se desactiva explicitamente en la evaluacion).
- Capacidades multilingues: no disponible; la tarea es eminentemente de codigo.

## Casos de uso

- Generacion de esqueletos de circuitos en Qiskit para prototipado: dado un circuito pequeno especificado en JSON (2-4 qubits, hasta 13 puertas), el modelo produce un script Python con las importaciones y la construccion del circuito, util para arrancar notebooks de experimentacion sin escribir boilerplate.
- Traduccion entre frameworks: un mismo circuito puede solicitarse en Qiskit, PennyLane y Cirq, lo que permite migrar prototipos entre ecosistemas con una sola especificacion de entrada y validar la equivalencia con el ejecutor incluido.
- Generacion de datos de test para proyectos de computacion cuantica: el modelo puede producir programas de referencia para circuitos sinteticos con estado exacto conocido, que sirven como casos de prueba en CI de librerias cuanticas.
- Docencia y material didactico: para circuitos de 2-4 qubits con puertas basicas, el modelo genera codigo legible en el framework que el alumno este usando, reduciendo la friccion de sintaxis en cursos introductorios.
- Investigacion sobre adaptacion LoRA en dominios estructurados: el repositorio incluye codigo de entrenamiento, programas originales, salidas del modelo, auditorias y un reproductor publico (reproduce_execution.py), lo que lo convierte en un caso de estudio reproducible para medir el efecto de LoRA sobre tareas de traduccion de codigo.
- Benchmarking de ejecutores y sandboxes: el harness restringido y sus hashes congelados pueden reutilizarse para evaluar otros modelos generadores de codigo cuantico bajo criterios de fidelidad de estado.

## Benchmarks y rendimiento

Resultados publicados por el autor con una muestra greedy, limite de 768 tokens generados y thinking desactivado. Un caso se considera aprobado si el programa importa el framework solicitado, ejecuta en Python soportado, tiene norma unitaria y fidelidad de estado de entrada cero invariante a fase global mayor que 1-1e-6.

| Split | Grupos de circuito | Casos por framework | Base (aprobados) | Adaptador (aprobados) |
|---|---:|---:|---:|---:|
| Validacion | 48 | 144 | 16 (11,11%) | 144 (100%) |
| Circuitos/angulos retenidos | 96 | 288 | 36 (12,50%) | 288 (100%) |
| Estres (mayores/no locales/mas profundos) | 96 | 288 | 47 (16,32%) | 282 (97,92%) |

Cada circuito aparece en los tres frameworks, por lo que no son 288 circuitos independientes. Los intervalos bootstrap al 95% por grupo de circuito para la diferencia adaptador-base en Pass@1 son [83,33; 91,32] puntos porcentuales en el split retenido y [77,78; 85,42] en estres, con las seis fallas de estres incluidas. El modelo base ejecuto 130/288 programas retenidos y 114/288 de estres, de los cuales 36 y 47 respectivamente tenian estados correctos; el adaptador ejecuto los 288 en cada split. La presencia de importaciones se usa como proxy de cumplimiento, no como prueba formal de flujo de datos. Los resultados por framework y todos los programas puntuados estan en v2_execution/.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el autor indica que se necesita memoria suficiente para los pesos de 9B y que la configuracion verificada uso una A100.
- GPU recomendadas: A100 (configuracion verificada por el autor); H100 y RTX 4090 no estan documentadas en la informacion disponible.
- Cabe en consumer GPU: no disponible; con cuantizacion del base a 4 bits cabria en GPUs de 24 GB, pero el autor no publica pesos cuantizados ni mediciones al respecto.
- Opciones de despliegue: el repositorio proporciona un helper propio (`from quantum import QuantumCoder`) que carga el adaptador PEFT sobre el base; requiere `requirements-inference.txt` y un entorno CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la generacion se realiza en lotes de ocho con el protocolo greedy congelado de 768 tokens.

## Comparativa con modelos similares

No se dispone de datos sobre modelos comparables de traduccion de circuitos cuanticos a codigo en la informacion proporcionada. La comparacion mas directa disponible es contra el propio modelo base sin adaptador:

| Modelo | Parametros | Contexto | Pass@1 retenido | Pass@1 estres | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QuantumCoder-9B (adaptador) | 9B (base) + LoRA r16 | 2.048 | 100% (288/288) | 97,92% (282/288) | Apache 2.0 | Hugging Face, 13 descargas |
| Qwen3.5-9B (base) | 9B | no disponible | 12,50% (36/288) | 16,32% (47/288) | no disponible en la ficha | Hugging Face |

## Limitaciones y advertencias

- La tarea esta acotada a circuitos sinteticos completamente especificados; no es descubrimiento de algoritmos cuanticos, programacion cuantica general ni verificacion unitaria completa, y no hay resultados en hardware cuantico real.
- Un renderizador determinista ya resuelve esta tarea perfectamente, segun el propio autor; el modelo no aporta ventaja practica sobre una solucion programatica para el mismo problema.
- El ejecutor de evaluacion es deliberadamente restringido y puede rechazar otras implementaciones validas de Python/API; los porcentajes miden cumplimiento del subconjunto soportado mas correccion de estado, no habilidad de programacion irrestricta.
- La separacion de datos no establece equivalencia de proceso completa; solo se audito la ausencia de duplicados exactos de estado de entrada cero con tolerancia 1e-8.
- El estudio negativo previo muestra que el adaptador anterior fallaba por completo en Cirq (0/128); el exito actual depende de entrenar explicitamente los tres frameworks y no constituye un resultado zero-shot.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el helper devuelve codigo fuente falible y nunca lo ejecuta, por lo que la validacion corre por cuenta del usuario.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: prompts de mas de 2.048 tokens se rechazan en lugar de truncarse; no se declaran idiomas soportados.
- Restricciones de licencia: Apache 2.0 en adaptador y pesos derivados, con atribucion al modelo base retenida; conviene verificar la licencia del base Qwen3.5-9B por separado, ya que no se detalla en la ficha.
- Para produccion: el harness es un evaluador para estos programas concretos, no un servicio de sandbox de codigo arbitrario; no se debe sustituir la ejecucion en host por el runner proporcionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsalissonsilva/QuantumCoder-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados por framework y programas puntuados: carpeta v2_execution/ del repositorio
- Paridad del helper de inferencia: carpeta helper_verification/ del repositorio
- Estudio negativo original y evaluador: carpetas execution/ y executor_preflight/ del repositorio
- Reproduccion de la evaluacion: script reproduce_execution.py del repositorio
