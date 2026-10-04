# HelloSun/sddqwen35a3b

## Resumen

SDQwen35A3B es un repositorio publicado por el usuario HelloSun en HuggingFace que no contiene un modelo de lenguaje propio, sino un motor de inferencia con paginado de expertos por niveles (SSD, RAM y CPU) destinado a ejecutar el modelo Qwen3.6-35B-A3B (22,1 GB en cuantización Q4_K_M) en una máquina Intel con solo 8 GB de RAM. La idea central es mantener los expertos fríos en el SSD y reservar en memoria únicamente una caché de expertos de capacidad limitada, gestionada con una política LRU y prefetch en segundo plano, sin recurrir a swap para simular memoria.

El motor se construye sobre una versión fijada de llama.cpp, con la lógica principal en `cpp/expert_pager.cpp` (arena de RAM, LRU, prefetch en segundo plano y métricas), y ofrece un flujo de puesta en marcha de un solo comando mediante `demo.py`, que descarga código y modelo, compila y abre una sesión de chat. El progreso se publica en `stage.txt` como fuente de verdad por etapas.

Su relevancia reside en la inferencia de modelos MoE grandes en hardware con RAM muy limitada, un escenario habitual en portátiles, mini-PC y entornos sin GPU. El repositorio no declara licencia, idiomas, pipeline ni benchmarks, y no se han publicado datos de entrenamiento ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio publica un motor de inferencia, no una arquitectura de modelo. El modelo objetivo (Qwen3.6-35B-A3B) se infiere de tipo MoE por el sufijo A3B y por el paginado de expertos, sin confirmacion del autor |
| Parametros totales | 35 000 millones (deducido del identificador del modelo objetivo; no confirmado por el autor) |
| Parametros activos | Aproximadamente 3 000 millones (deducido del sufijo A3B del identificador; no confirmado por el autor) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (22,1 GB, unico formato citado). Otros tipos: no disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara ninguna licencia) |
| Formato de pesos | No disponible de forma explicita; la cuantizacion Q4_K_M y el uso de llama.cpp implican GGUF |
| Autor | HelloSun |
| Fecha de publicacion | 2026-10-03 (creado), 2026-10-03 (actualizado) |
| Descargas / likes | 0 descargas, 0 likes |
| Pipeline de HuggingFace | No disponible |
| Region declarada | region:us |
| Version de llama.cpp | Version fijada (pinned), definida en `sdq/config.py` |
| Componente principal | `cpp/expert_pager.cpp` (arena de RAM, LRU, prefetch en segundo plano, metricas) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo Qwen3.6-35B-A3B ni su proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del corpus, fases de ajuste (SFT, RLHF, DPO) ni innovaciones de atencion. Lo que se documenta es el motor de ejecucion. Sobre llama.cpp en una revision fijada, el componente `cpp/expert_pager.cpp` implementa un sistema de paginado de expertos en tres niveles: los expertos frios permanecen en SSD, la RAM aloja una cache de expertos de capacidad limitada y la CPU ejecuta el calculo. La gestion de la cache usa una politica LRU combinada con prefetch en segundo plano, y el motor expone metricas de funcionamiento. El autor insiste en que no se emplea swap como sustituto de la RAM, es decir, la memoria virtual del sistema operativo no se usa para simular capacidad inexistente.

El flujo de uso se apoya en `demo.py`, que cubre la descarga de codigo y modelo, la compilacion y el acceso a un chat, y en `stage.txt`, que actua como fuente de verdad del progreso por etapas y se sube a HuggingFace. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni optimizaciones de kernel mas alla del offloading de expertos.

## Capacidades

- Ejecucion de un modelo MoE de gran tamano (Qwen3.6-35B-A3B, 22,1 GB en Q4_K_M) en una maquina Intel con 8 GB de RAM, segun la afirmacion del autor.
- Paginado de expertos por niveles SSD, RAM y CPU con cache en RAM de capacidad limitada.
- Gestion de cache con politica LRU y prefetch en segundo plano para reducir esperas por lectura de disco.
- Exposicion de metricas internas del motor (contadores e indicadores del paginador de expertos).
- Ejecucion sin recurrir a swap como memoria sustituta, segun la documentacion del proyecto.
- Puesta en marcha automatizada: `python demo.py` descarga codigo y modelo, compila y entra en modo chat; `python demo.py --help` lista todas las opciones.
- Seguimiento de progreso por etapas mediante `stage.txt`, actualizado y subido a HuggingFace.
- Capacidades del modelo subyacente (generacion de texto, razonamiento, codigo, matematicas, tool calling, multilingueismo, agentes): no disponibles en la informacion proporcionada, ya que el repositorio no las documenta.
- Soporte de vision, audio o modo de razonamiento explicito: no disponible.

## Casos de uso

- Inferencia de modelos MoE grandes en portatiles o mini-PC Intel con 8 GB de RAM: el motor evita la compra de hardware nuevo manteniendo los expertos frios en SSD y una cache reducida en memoria, lo que permite ejecutar localmente un modelo de 22,1 GB en Q4_K_M.
- Despliegue en entornos sin GPU: al apoyarse en llama.cpp y en CPU, encaja en servidores de laboratorio o estaciones de trabajo sin acelerador dedicado, a costa de una latencia mayor por las lecturas de disco.
- Equipos con presupuesto limitado de memoria: en lugar de ampliar RAM, se reutiliza almacenamiento SSD como nivel de residencia de expertos, lo que resulta util cuando el SSD es mas barato o ampliable que la memoria.
- Prototipado e investigacion sobre offloading de MoE: el codigo de `cpp/expert_pager.cpp` y sus metricas sirven como banco de pruebas para comparar politicas de cache (LRU frente a otras), tamanos de arena en RAM y estrategias de prefetch.
- Laboratorios de evaluacion de modelos: permite probar el comportamiento de un MoE de 35 000 millones de parametros en hardware humilde antes de decidir un despliegue en servidor con GPU.
- Entornos con conectividad limitada o air-gapped: `demo.py` cubre la descarga y compilacion inicial, y a partir de ahi la ejecucion es local, sin dependencia de APIs externas.
- Formacion y docencia: escenario de coste bajo para explicar en la practica como funciona el enrutado de expertos y el paginado por niveles en un modelo MoE real.
- Reproduccion de despliegues con version fijada: la dependencia de una revision concreta de llama.cpp, definida en `sdq/config.py`, facilita reproducir el mismo entorno en maquinas distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de velocidad de generacion (tokens por segundo), latencia por token ni IOPS necesarias del SSD. El unico dato cuantitativo aportado por el autor es el tamano de los pesos (22,1 GB en Q4_K_M), el requisito de 8 GB de RAM y el tipo de maquina objetivo (Intel).

## Requisitos de hardware

- RAM: 8 GB declarados como suficientes por el autor, de los cuales una parte se reserva como cache de expertos.
- Almacenamiento: SSD obligatorio, ya que los expertos frios residen en el y se leen bajo demanda; el volumen de pesos citado es de 22,1 GB en Q4_K_M. No se especifican IOPS ni ancho de banda minimos.
- CPU: maquina Intel; el modelo concreto, numero de nucleos y soporte de instrucciones vectoriales no se detallan.
- GPU: no se menciona ninguna. El motor se apoya en llama.cpp sobre CPU; el soporte de aceleracion por GPU no esta documentado.
- VRAM estimada: no disponible, al no contemplarse ejecucion en GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no disponible.
- Opciones de despliegue: llama.cpp en la version fijada del proyecto y el script `demo.py`; no se documenta compatibilidad con vLLM, TGI, Ollama ni otros servidores de inferencia.
- Latencia y throughput: no disponibles. Dependeran de la velocidad del SSD y del tamano efectivo de la cache de expertos en RAM, factores que el autor no cuantifica.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la informacion proporcionada. El repositorio no incluye comparaciones con otras herramientas y la busqueda web realizada no devolvio resultados relacionados con el modelo ni con el motor (los resultados obtenidos corresponden a canales de YouTube sin relacion con el proyecto). A continuacion se indican alternativas funcionales del mismo ambito, sin cifras confirmadas:

| Alternativa | Enfoque | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SDQwen35A3B | Paginado de expertos SSD, RAM y CPU sobre llama.cpp con LRU y prefetch | Los del modelo objetivo: 35 000 millones (no confirmado) | No disponible | No disponible | No disponible | Repositorio en HuggingFace con 0 descargas |
| llama.cpp con mmap | Mapeo de los pesos en disco y demanda por el sistema operativo | Depende del modelo | Depende del modelo | No disponible | MIT (no verificado en la informacion disponible) | Ampliamente distribuido |
| Ollama | Servidor local con gestion de modelos y cuantizaciones GGUF | Depende del modelo | Depende del modelo | No disponible | MIT (no verificado en la informacion disponible) | Ampliamente distribuido |
| ktransformers | Descarga selectiva de expertos a CPU y GPU para modelos MoE | Depende del modelo | Depende del modelo | No disponible | No disponible (no verificado) | Repositorio publico |

## Limitaciones y advertencias

- El repositorio no declara licencia. Sin licencia explicita no puede asumirse permiso de uso, copia ni explotacion comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Ausencia total de benchmarks: no hay datos de calidad de generacion ni de velocidad (tokens por segundo, latencia por token) que permitan estimar si el rendimiento es utilizable en un caso real.
- La afirmacion de ejecutar 22,1 GB de pesos con 8 GB de RAM no esta verificada de forma independiente y depende criticamente del SSD utilizado; discos lentos o con pocas IOPS pueden degradar el resultado hasta hacerlo poco practico.
- Repositorio sin traccion: 0 descargas y 0 likes, sin pipeline declarado y con documentacion unicamente en chino, lo que reduce la base de revision por parte de terceros.
- Fechas de creacion y actualizacion poco habituales (2026-10-03), lo que dificulta situar el proyecto en una cronologia verificable.
- Dependencia de una version fijada de llama.cpp: actualizar el motor puede romper la integracion, y mantener una revision antigua puede arrastrar problemas de seguridad o compatibilidad.
- Riesgo de alucinacion, sesgos y limitaciones de idioma propios del modelo subyacente: el repositorio no aporta informacion al respecto, por lo que deben evaluarse directamente sobre el modelo base.
- El proyecto no incluye el modelo, sino que lo descarga; la procedencia y las condiciones de licencia del modelo Qwen3.6-35B-A3B deben comprobarse por separado antes de usarlo, especialmente en contextos comerciales.
- La cuantizacion Q4_K_M implica perdida de precision frente a los pesos originales; no se documenta el impacto en la calidad de las respuestas.
- No hay informacion sobre consumo energetico, calor, ruido ni comportamiento sostenido en ejecuciones largas, factores relevantes para un despliegue continuo.

## Enlaces

- HuggingFace: https://huggingface.co/HelloSun/sddqwen35a3b
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada. Los resultados obtenidos corresponden a paginas de YouTube sin relacion con el modelo ni con el motor descrito.
