# abdelhayali91/pcbgo-v1

## Resumen

pcbgo v1 es un ajuste fino (LoRA, posteriormente fusionado y cuantizado) del modelo Qwen3.5-4B, desarrollado por el usuario abdelhayali91, orientado especificamente al diseno automatizado de placas de circuito impreso (PCB) y esquematicos electronicos. El modelo actua como motor de decision dentro de la aplicacion CircuitPilot (pcbgo.site): recibe una descripcion en lenguaje natural de un circuito, selecciona componentes, cablea el esquematico, ejecuta comprobaciones ERC/DRC, realiza el placement y el routing de la placa y corrige los problemas detectados mediante llamadas a herramientas (tool calling).

Con 4.326.350.848 parametros totales y una ventana de contexto operativa de 32.768 tokens en su configuracion recomendada de llama.cpp, el modelo se distribuye unicamente en formato GGUF cuantizado Q4_K_M (2,8 GB), lo que permite ejecutarlo en GPU de portatil, en Ollama sobre cualquier PC o en una GPU gratuita de Google Colab (T4). Esta pensado para funcionar con el modo "thinking" desactivado, ya que asi fue entrenado.

Su relevancia radica en que aborda un dominio muy especializado (EDA y diseno electronico) con un modelo pequeno y desplegable localmente, superando a su modelo base en el benchmark propio del autor (79,3 frente a 65,1 puntos de media). La licencia Apache-2.0 y la disponibilidad del codigo de entrenamiento facilitan su inspeccion y reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B), ajuste fino LoRA fusionado |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en llama.cpp con `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`pcbgo-v1-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-4B, un transformer decoder-only, sobre el que se aplico un ajuste fino QLoRA con rango 32 sobre todas las capas lineales, entrenando unicamente los turnos del asistente. El entrenamiento se realizo en una sola GPU de 16-20 GB en dos fases de 25 y 125 pasos. Posteriormente, el adaptador LoRA se fusiono con los pesos base y el resultado se cuantizo a Q4_K_M.

El dataset de entrenamiento consta de aproximadamente 4.000 conversaciones generadas ejecutando el motor de diseno real de CircuitPilot, de modo que cada resultado de herramienta registrado en las conversaciones es autentico. Los datos incluyen circuitos construidos con componentes reales de JLCPCB, ediciones, pasos de layout de PCB, preguntas, planes, trabajos completos solicitados en una sola peticion y peticiones con errores tipograficos. Solo se conservaron los disenos que superaban las comprobaciones ERC/DRC. No se emplearon datos de usuarios. El modelo esta entrenado para operar con el modo "thinking" desactivado, y la aplicacion CircuitPilot conmuta automaticamente a su conjunto compacto de 30 herramientas cuando detecta un modelo cuyo nombre empieza por `pcbgo`.

## Capacidades

- Generacion de texto conversacional en ingles orientada a tareas de ingenieria electronica.
- Tool calling y function calling sobre el conjunto compacto de herramientas de CircuitPilot (30 herramientas principales): anadir componentes, cablear, ejecutar ERC/DRC, placement, routing, pours y taladros.
- Razonamiento multi-paso y ejecucion de agentes: puede encadenar varias llamadas a herramientas para completar un trabajo de diseno de principio a fin en una sola peticion.
- Diseno de placas a partir de una descripcion: LEDs, reguladores, sensores, reles y amplificadores operacionales.
- Reparacion de placas defectuosas: diagnostico y correccion de problemas DRC.
- Routing completo hasta el final y limpieza de errores DRC.
- Capacidades multilingues: limitadas al ingles.
- No dispone de vision, audio ni modo thinking (entrenado explicitamente sin el).

## Casos de uso

- Diseno automatico de placas sencillas a partir de una descripcion: el modelo recibe una peticion en lenguaje natural ("una placa con un LED y una resistencia limitadora") y encadena las llamadas de herramienta necesarias para crear el esquematico, colocar los componentes y rutar la placa. Es adecuado porque fue entrenado con trazas reales del motor de CircuitPilot.
- Reparacion de placas con errores DRC: dado un diseno roto, el modelo inspecciona los resultados de ERC/DRC y aplica correcciones mediante las herramientas de la aplicacion. Su puntuacion de reparacion en el benchmark propio es de 91,4 sobre 100.
- Prototipado rapido en entornos educativos: al caber en una GPU T4 de Colab gratuita, permite a estudiantes experimentar con flujos de diseno asistido por IA sin infraestructura propia.
- Asistente integrado en escritorio con Ollama: mediante un Modelfile que descarga el GGUF del repositorio, se despliega en local y se conecta a la aplicacion de escritorio CircuitPilot a traves de la API compatible con OpenAI en `http://localhost:11434/v1`.
- Automatizacion de tareas repetitivas de layout: el modelo puede ejecutar pasos de placement, routing, pours y taladros de forma encadenada, reduciendo el trabajo manual en placas de uno o pocos bloques funcionales.
- Integracion en pipelines de herramientas EDA mediante API compatible con OpenAI: al exponerse con `llama-server` o Ollama, puede conectarse a cualquier cliente que hable el protocolo `/v1`, lo que facilita su inclusion en scripts de generacion y validacion de disenos.

## Benchmarks y rendimiento

Resultados del CircuitPilot PCB Bench publicado por el autor: 14 tareas (8 placas a partir de descripcion, 6 placas rotas a reparar), puntuacion de 0 a 100 sobre el diseno resultante, 3 ejecuciones por tarea, mismo servidor y thinking desactivado.

| Modelo | Puntuacion | Diseno | Reparacion | Placement | Routing | DRC limpio | Totalmente rutado |
|---|---|---|---|---|---|---|---|
| pcbgo v1 | 79,3 | 70,3 | 91,4 | 82 % | 82 % | 25/33 | 32/33 |
| Qwen3.5-4B (base) | 65,1 | 38,9 | 100 | 57 % | 52 % | 17/33 | 21/33 |

El autor senala como puntos fuertes las placas de LED, regulador, sensor, rele y amplificador operacional a partir de una sola peticion, el routing hasta el final y la limpieza DRC. Como puntos debiles, las placas multiploque grandes (por ejemplo, un nodo con regulador, sensor y LED) y algunos disenos con el temporizador 555, ademas de la tendencia a repetir una llamada de herramienta que falla.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8 GB para los pesos Q4_K_M, mas el espacio de cache KV correspondiente al contexto configurado (32.768 tokens recomendados).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el contexto corto; el autor cita GPU de portatil, una GPU de 16-20 GB para el entrenamiento y una T4 de Google Colab para inferencia.
- Cabe en GPU de consumo: si, en tarjetas como la T4 de Colab y en GPU de portatil de gama media; el autor no especifica modelos concretos de consumo mas alla de la T4.
- Opciones de despliegue: Ollama (`ollama create pcbgo-v1 -f Modelfile`), llama.cpp (`llama-server` con `--jinja --chat-template-kwargs '{"enable_thinking":false}' -c 32768 -ngl 99`) y cualquier cliente compatible con la API OpenAI a traves de `/v1`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion PCB Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pcbgo v1 | 4,33 B | 32.768 tokens | 79,3 | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-4B (base) | 4 B (aproximado, no confirmado) | no disponible | 65,1 | Apache-2.0 | Hugging Face |
| Otros modelos especializados en EDA | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada por el autor es frente al modelo base Qwen3.5-4B. No se dispone de datos de benchmarks frente a otros modelos especializados en diseno electronico o tool calling en el dominio EDA.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion en la seleccion de componentes o en la interpretacion de resultados de herramientas; el autor recomienda verificar siempre el resultado con ERC/DRC en la aplicacion antes de encargar una placa.
- Debilidad documentada en placas multiploque grandes y en algunos disenos con el temporizador 555.
- Puede repetir indefinidamente una llamada de herramienta que falla, sin corregir el error por si solo.
- Requiere operar con thinking desactivado; su uso con el modo thinking activado no esta validado.
- Depende del conjunto compacto de herramientas de CircuitPilot (30 herramientas y prompt corto); fuera de ese formato de herramientas su rendimiento no esta garantizado.
- La licencia Apache-2.0 cubre los pesos del modelo, pero la aplicacion CircuitPilot/pcbgo.site tiene su propia licencia, independiente de la del modelo.
- El modelo no ha sido evaluado con benchmarks estandar de razonamiento, codigo o matematicas, por lo que no se puede comparar con modelos generalistas en esas tareas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdelhayali91/pcbgo-v1
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio CircuitPilot (codigo de entrenamiento en `finetune/`): https://github.com/Abdelhayali/CircuitPilot/tree/main/finetune
- Benchmark CircuitPilot PCB Bench: https://github.com/Abdelhayali/CircuitPilot/tree/main/bench
- Notebook de Google Colab: https://colab.research.google.com/github/Abdelhayali/CircuitPilot/blob/main/finetune/CircuitPilot_4B_Colab.ipynb
- Aplicacion CircuitPilot: https://pcbgo.site
