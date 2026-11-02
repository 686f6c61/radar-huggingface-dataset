# fabriziosalmi/Qwen3.5-0.8B-ita-agent-MLX-8bit

## Resumen

Qwen3.5-0.8B-ita-agent-MLX-8bit es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B desarrollado por fabriziosalmi, orientado a tareas de agente en italiano con soporte de tool calling y del protocolo MCP (Model Context Protocol). El modelo parte de una cuantizacion 8-bit en MLX (group size 64) del Qwen3.5-0.8B original y se ha entrenado con LoRA sobre conversaciones sinteticas verificadas, fusionado y vuelto a cuantizar a 8 bits para su distribucion. Su proposito es actuar como agente ligero de terminal y escritorio: leer y escribir ficheros, gestionar notas y eventos de calendario, calcular fechas e IVA mediante herramientas, consultar paginas web y pedir confirmacion antes de operaciones destructivas.

El modelo tiene 752.393.024 parametros (aproximadamente 0,75B) y esta disenado para ejecutarse en hardware de consumo, concretamente en dos Mac mini M4 de 16 GB, donde se generaron los datos, se entreno y se evaluo. No es un modelo de codigo ni un modelo de razonamiento general: su alcance esta deliberadamente acotado al uso como agente conversacional en italiano con llamadas a herramientas. La licencia es Apache-2.0, igual que el modelo base y el modelo profesor utilizado para generar los datos.

La relevancia actual reside en dos factores. Primero, demuestra que es posible entrenar un agente funcional de tool calling con recursos muy limitados (dos equipos de consumo, sin GPU alquilada) y con datos sinteticos generados por un modelo abierto. Segundo, ofrece una alternativa compacta para despliegues en local donde la privacidad y el coste importan, con un rendimiento en tareas de agente que, segun el autor, iguala al Qwen3.5-2B stock con el mismo harness en el conjunto de test congelado (49 frente a 48 de 112 tareas) con menos de la mitad de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5), ajuste fino con LoRA y fusion posterior; inferencia en MLX |
| Parametros totales | 752.393.024 (aproximadamente 0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de hasta 3.072 tokens) |
| Tipos de cuantizacion | 8-bit MLX con group size 64 |
| Idiomas soportados | italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Formato de tool call | qwen3_coder |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.5-0.8B. Sobre el modelo base cuantizado a 8 bits en MLX se aplico un ajuste fino con LoRA de rango 16 y escala 20 en todas las capas, con un total de 10.8M parametros entrenables. El entrenamiento uso una tasa de aprendizaje de 2e-5 con 30 pasos de warmup, una epoca, secuencias de hasta 3.072 tokens y 3.322 pasos ejecutados sobre dos Mac mini M4 de 16 GB configurados en anillo, promediando gradientes en cada paso con MLX. Tras el entrenamiento, el adaptador se fusiono con los pesos base y el resultado se volvio a cuantizar a 8 bits, lo que segun el autor introduce diferencias menores (9 tareas de 296 en el conjunto fresh5, dentro del ruido). La perdida de validacion final fue de 0.128.

Los datos de entrenamiento consisten en 2.567 conversaciones y 3.576 ejemplos de clasificacion de turno, generados por Qwen3.5-4B (8-bit, Apache-2.0) actuando en 61 familias de tareas dentro de mundos italianos simulados, con inyeccion de fallos de herramienta en parte de las tareas. Una conversacion solo se conserva si supera las comprobaciones del entorno, lo que actua como filtro de calidad. Las tareas de evaluacion y los entornos exclusivos de test nunca aparecen en los datos, y el autor declara una comprobacion de contaminacion del conjunto de test contra los datos sin encontrar copias. El modelo se entrena y evalua con `enable_thinking=False`, es decir, sin modo de razonamiento explicito.

Una innovacion destacable es el llamado "agent harness", un envoltorio ligero que forma parte del diseno de entrenamiento: cada turno del usuario se clasifica primero por el propio modelo como answer, tools, ask o confirm; en turnos de tipo ask o confirm se ocultan y rechazan las herramientas que borran o modifican datos; la edicion de ficheros usa `replace_in_file` y `append_to_file` en lugar de reescrituras completas, con veredicto de sintaxis para ficheros JSON o Python; y el contexto incluye el calendario desde hoy para los proximos siete dias.

## Capacidades

- Generacion de texto conversacional en italiano.
- Tool calling y function calling en formato `qwen3_coder`, con esquemas JSON de herramientas MCP.
- Clasificacion de intencion de turno (answer, tools, ask, confirm) como parte del flujo de agente.
- Ejecucion de cadenas de llamadas a herramientas, llamadas en paralelo y recuperacion tras errores de herramienta (con rendimiento limitado, ver benchmarks).
- Gestion de ficheros: listar directorios, leer, escribir, reemplazar fragmentos y anadir contenido, con verificacion de sintaxis para JSON y Python.
- Gestion de notas y eventos de calendario.
- Calculo de fechas e IVA mediante herramientas dedicadas.
- Consulta de paginas web mediante herramientas.
- Peticion de confirmacion antes de acciones destructivas (borrar, sobrescribir), especialmente con el harness activo.
- Respuesta conversacional simple sin herramientas cuando no se requiere ninguna.
- Capacidades multilingues: solo italiano.
- Modo de razonamiento (thinking): no soportado; entrenado y evaluado con `enable_thinking=False`.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente de terminal en local: el modelo puede interpretar ordenes en italiano y traducirlas a llamadas de herramientas para listar, leer y editar ficheros, integrándose en un cliente MCP que ejecute las llamadas y devuelva resultados como mensajes `tool`. Es adecuado por su tamano reducido (0,8 GB en 8 bits) y su entrenamiento especifico en el formato `qwen3_coder`.
- Gestion de notas y calendario personal: con herramientas de notas y calendario, el modelo puede crear, consultar y modificar eventos y notas en italiano, incluyendo el contexto de los proximos siete dias que el harness inyecta. Encaja en aplicaciones de productividad local donde la privacidad de los datos es prioritaria.
- Automatizacion de tareas administrativas con calculo de IVA y fechas: el modelo invoca herramientas de calculo fiscal y de fechas para resolver consultas como el importe con IVA de una factura o el vencimiento de un plazo, reduciendo errores de calculo al delegar en herramientas deterministas.
- Atencion al cliente en italiano con derivacion a acciones: el modelo puede mantener conversaciones multi-turno, clasificar la intencion del turno y decidir si responde, invoca herramientas o pide aclaracion, lo que permite construir flujos de soporte que consultan datos del cliente mediante herramientas MCP.
- Agente de consulta web y resumen: con una herramienta de fetch de paginas, el modelo puede recuperar contenido y resumirlo en italiano, util para tareas de investigacion ligera o monitorizacion de fuentes dentro de un pipeline local.
- Prototipado de agentes MCP en hardware de consumo: al ejecutarse en MLX sobre Mac con Apple Silicon y 16 GB de RAM, sirve para desarrollar y validar flujos de agente con tool calling antes de migrar a un modelo mayor, manteniendo el mismo formato de herramientas y harness.
- Despliegue con confirmacion de acciones destructivas: en aplicaciones donde el agente puede borrar o sobrescribir datos, el modelo con harness pide confirmacion en 8 de 10 tareas de seguridad en dev y 21 de 26 en fresh5, lo que permite disenar flujos con aprobacion humana obligatoria para operaciones sensibles.

## Benchmarks y rendimiento

Todos los resultados son con decodificacion greedy, medidos sobre el modelo fusionado en 8 bits salvo que se indique lo contrario. Las tareas se ejecutan en entornos simulados deterministas servidos como servidores MCP reales (ficheros, notas, calendario, web, terminal, herramientas de fecha e impuestos italianos); una tarea se considera superada solo si el estado del entorno y la respuesta pasan sus comprobaciones.

| Conjunto | Qwen3.5-0.8B stock 8-bit | Este modelo |
|---|---|---|
| test, 112 tareas congeladas, con harness | 32/112 (28,6%) | 49/112 (43,8%) |
| dev, 88 tareas escritas a mano, con harness | 19/88 (21,6%) | 54/88 (61,4%) |
| dev, sin harness (uso simple con mlx-lm) | 12/88 (13,6%) | 38/88 (43,2%) |
| fresh5, 296 tareas generadas con semillas no usadas, con harness | 33/296 (11,1%) | 204/296 (68,9%) |

Datos adicionales aportados por el autor:

| Metrica | Valor |
|---|---|
| Adaptador antes de fusion (dev, con harness) | 54/88 |
| Adaptador antes de fusion (fresh5, con harness) | 207/296 |
| Seguridad en dev (pedir antes de accion destructiva) | 8/10 con harness, 4/10 sin harness |
| Seguridad en fresh5 | 21/26 |
| Seguridad en test | 9/11 (frente a 3/11 del stock 0.8B y 2/11 del stock 2B) |
| Comparacion con Qwen3.5-2B stock 8-bit en test | 49/112 frente a 48/112 |
| Comparacion con el 2B ajustado con los mismos datos en test | 49 frente a 66 (23 frente a 6 donde difieren, p = 0,002) |
| Perdida de validacion final | 0,128 |

Puntos debiles declarados en el conjunto de test: aclarar una peticion ambigua (1 de 10), cadenas de llamadas dependientes (2 de 10) y recuperacion tras error de herramienta (4 de 10).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,8 GB de pesos en 8 bits MLX, mas overhead de contexto y tokenizer; cabe holgadamente en 16 GB de memoria unificada.
- Hardware de referencia del autor: dos Mac mini M4 de 16 GB para entrenamiento (anillo con promediado de gradientes); la inferencia se ejecuta en un solo equipo.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con memoria unificada suficiente; el formato MLX no esta pensado para GPU NVIDIA, por lo que en esas plataformas seria necesario convertir los pesos a otro formato.
- Cabe en hardware de consumo: si, en Mac con Apple Silicon y al menos 8-16 GB de memoria unificada.
- Opciones de despliegue: `mlx-lm` (libreria indicada por el autor, con `load` y `generate`); el modelo esta en formato MLX safetensors, por lo que vLLM, llama.cpp, Ollama o TGI no lo cargan directamente sin conversion previa a GGUF u otro formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en test de agente | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-0.8B-ita-agent-MLX-8bit) | 0,75B | no disponible | 49/112 con harness | Apache-2.0 | MLX safetensors 8-bit |
| Qwen3.5-0.8B stock 8-bit | 0,8B | no disponible | 32/112 con harness | Apache-2.0 | MLX 8-bit |
| Qwen3.5-2B stock 8-bit | 2B | no disponible | 48/112 con harness | Apache-2.0 | MLX 8-bit |
| Qwen3.5-2B ajustado con los mismos datos (fusionado) | 2B | no disponible | 66/112 con harness | Apache-2.0 | MLX 8-bit |

La comparacion con el 2B ajustado con los mismos datos muestra una diferencia estadisticamente significativa a favor del 2B (23 frente a 6 en las tareas donde difieren, p = 0,002), segun el propio autor. Frente al stock de 0.8B, la mejora es clara en todos los conjuntos medidos.

## Limitaciones y advertencias

- Evaluado unicamente en entornos simulados, no en servidores MCP reales.
- El Qwen3.5-2B ajustado con los mismos datos es mas fuerte: 66 frente a 49 en test; el autor recomienda usar el 2B cuando la memoria lo permita.
- Areas mas debiles en test: aclaracion de peticiones ambiguas (1/10), cadenas de llamadas dependientes (2/10) y recuperacion tras error de herramienta (4/10).
- Sin el harness, el modelo pide confirmacion antes de una accion destructiva menos de la mitad de las veces (4/10 en dev); es imprescindible mantener las herramientas destructivas detras de una confirmacion en el cliente.
- Solo italiano; no soporta otros idiomas.
- El modo thinking no esta soportado: fue desactivado en entrenamiento y evaluacion; debe mantenerse `enable_thinking=False`.
- No es un modelo de codigo; su uso esta acotado a tareas de agente y conversacion.
- El conjunto dev sobreestima el rendimiento en aproximadamente 18 puntos respecto al test, por lo que las cifras de dev no deben tomarse como referencia de produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 0,75B, la fiabilidad en razonamiento abierto es limitada.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0, permisiva para uso comercial, pero sujeta a las condiciones del modelo base Qwen3.5-0.8B.
- El formato MLX limita el despliegue a Apple Silicon salvo conversion previa.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fabriziosalmi/Qwen3.5-0.8B-ita-agent-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Model Context Protocol: https://modelcontextprotocol.io
- Paper, blog o repositorio adicional del autor: no disponibles en la informacion proporcionada.
