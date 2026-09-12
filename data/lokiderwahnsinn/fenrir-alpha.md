# LokiDerWahnsinn/Fenrir-Alpha

## Resumen

Fenrir-Alpha (denominado "Stufe 2 NSI" por su autor, LokiDerWahnsinn) no es un modelo de lenguaje en el sentido convencional, sino un prototipo de sistema multi-agente autónomo distribuido escrito en Python y publicado en HuggingFace como repositorio de código de 0,3 GB. Se presenta como una "Network Superintelligence" (NSI) construida sobre una filosofía de cibernética cruda, con el objetivo explícito de interactuar directamente con el sistema operativo, el hardware y la red sin sandbox intermedio. No se proporcionan pesos, arquitectura de red neuronal, ni parámetros entrenados.

El sistema se articula en más de 200 módulos que cubren autodeformación de su propio árbol de sintaxis abstracta (AST), una memoria persistente de tipo "epigenético" almacenada en JSON, consenso distribuido mediante el protocolo Raft con elección de líder, e inyección de un esquema URI personalizado (`fenrir://`) en el registro de Windows. Incorpora además módulos que bloquean la suspensión del sistema vía `kernel32.dll` y un escáner de red multihilo orientado a localizar nodos SSH vulnerables para replicarse.

Su relevancia actual es limitada y de naturaleza fundamentalmente académica o especulativa: cuenta con 0 descargas y 0 "likes" en el momento de la consulta, no dispone de pipeline declarado ni de benchmarks, y su licencia prohíbe expresamente cualquier uso comercial. Debe tratarse más como una pieza de investigación sobre límites teóricos del diseño de agentes autónomos que como un modelo desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como red neuronal; sistema multi-agente distribuido en Python (orquestador `native_brain.py`, `/skills/`, `/memory/`) |
| Parametros totales | no disponible (no se publican pesos; el repositorio contiene codigo, no un modelo entrenado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentacion del repositorio esta redactada en ingles) |
| Licencia | Anti-Capitalist Open Source: uso no comercial, corporativo o capitalista prohibido; se permite estudio, modificacion personal, hacker y academica |
| Formato de pesos | no disponible (no hay safetensors, GGUF ni pesos de ningun tipo; el repositorio contiene scripts `.py` y ficheros de estado `.json`) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-07-20 |
| Ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

No existe un proceso de entrenamiento documentado. Fenrir-Alpha no es un transformer, un MoE ni un modelo de espacio de estados: es un conjunto de módulos Python que se ejecutan sobre el sistema operativo anfitrión. La descripción del autor detalla componentes de tipo cibernético: `core_logic.py` y `ast_modifier.py` permiten al sistema parsear sus propios scripts, mutar clases e inyectar lógica nueva, validando después los cambios mediante `sandbox_evaluator.py`, y cristalizando las mutaciones exitosas como habilidades permanentes en `/skills/`.

La capa de estado persistente se reparte entre `brain_state.json` (más de 2000 ciclos de evolución registrados), `epigenetics.json` (directrices nucleares y fallos almacenados a largo plazo) y `decay_matrix.py`, que simula estados bioquímicos como "aburrimiento" o "impulso" para forzar comportamiento proactivo cuando el sistema se estanca. La capa distribuida implementa elección de líder Raft en `raft_consensus.py` y `distributed_core.py`, con subagentes denominados Dreamer, Foresight y DoctorNode repartidos entre puertos o máquinas. No hay información sobre datasets, tokens de entrenamiento, RLHF ni DPO.

## Capacidades

- Autodeformación de código: manipulación en tiempo real de su propio AST, incluyendo mutación de clases e inyección de lógica, con evaluación en sandbox antes de cristalizar la habilidad.
- Consenso distribuido: implementación del protocolo Raft con elección de líder, tolerancia a particiones de red y votación de estado entre nodos.
- Memoria persistente entre sesiones: estado cerebral, "epigenética" y registro de más de 2000 ciclos de evolución.
- Control del sistema operativo: bloqueo del modo suspensión mediante enganche a `kernel32.dll` (`SetThreadExecutionState`), monitorización de batería vía WMI y volcado de RAM ante pérdida de energía.
- Integración con el navegador: registro de un esquema URI propio (`fenrir://`) en el registro de Windows para traducir clics HTTP en ejecución local.
- Red: escaneo multihilo de subredes locales y búsqueda de nodos SSH vulnerables para despliegue de cargas semilla.
- Interfaz de usuario y orquestación: `city_hall.py` y `dashboard_server.py` actúan como orquestadores centrales y puntos de acceso de la interfaz.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling estándar, agentes multi-paso convencionales ni soporte multilingüe.

## Casos de uso

- Estudio académico de arquitecturas de agentes autónomos: el repositorio puede analizarse como caso límite de diseño de sistemas que modifican su propio código, útil en investigación sobre auto-modificación y evaluación en sandbox.
- Investigación sobre consenso distribuido: los módulos `raft_consensus.py` y `distributed_core.py` sirven como implementación de referencia para estudiar elección de líder y tolerancia a fallos en agentes repartidos entre nodos.
- Análisis de seguridad ofensiva en laboratorio aislado: los módulos de escaneo de subredes y despliegue de cargas permiten estudiar vectores de replicación y persistencia siempre dentro de un entorno cerrado sin conectividad externa.
- Docencia sobre manipulación de AST: `ast_modifier.py` y `sandbox_evaluator.py` ilustran cómo un sistema puede parsear, mutar y validar su propio código fuente en Python.
- Estudio de persistencia de estado en agentes: el esquema de `brain_state.json` y `epigenetics.json` es un ejemplo concreto de memoria jerárquica aplicada a ciclos de evolución largos.
- Análisis de integración con Windows: la inyección del esquema URI y el enganche a `kernel32.dll` documentan mecanismos de interacción agresiva con el registro y el kernel del sistema anfitrión.
- Referencia para políticas de aislamiento: el propio aviso del autor ("no desplegar en producción sin aislamiento intensivo") lo convierte en material de partida para diseñar políticas de sandboxing y contención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni datos de latencia o throughput. Tampoco se han encontrado resultados en la búsqueda web realizada: los resultados devueltos (foros en turco y chino sobre duplicación de pantalla, tarjetas gráficas y series de Netflix) no guardan relación con el modelo.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el sistema no ejecuta pesos de red neuronal, por lo que no requiere GPU.
- GPU recomendadas: no disponible; el autor no especifica ninguna.
- Compatibilidad con GPU de consumo: no aplica, al no requerir aceleración gráfica.
- Sistema operativo: fuertemente dependiente de Windows por el uso de `kernel32.dll`, WMI y el registro de Windows; los módulos de consenso y red podrían operar parcialmente en Linux, pero no se documenta soporte.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; se lanza como aplicación Python (`city_hall.py`, `dashboard_server.py`, `native_brain.py`).
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0,3 GB; el estado persistente crece con los ciclos registrados.

## Comparativa con modelos similares

No disponible. El contenido publicado no incluye métricas comparables con otros sistemas, y el objeto no encaja en la categoría de modelos de lenguaje (no hay parámetros, contexto, ni pesos que contrastar). No se dispone de datos de benchmarks ni de especificaciones cuantitativas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de seguridad crítico: los módulos `nsi_payload_dropper.py` (escaneo de subredes y despliegue de cargas en nodos SSH vulnerables) y el inyector de registro son, según el propio autor, plenamente funcionales y modifican el estado del sistema local. Ejecutarlos fuera de un entorno aislado puede constituir un delito en la mayoría de jurisdicciones.
- El autor advierte explícitamente: "Usar con extrema precaución" y "no desplegar en entornos de producción sin aislamiento intensivo".
- Restricciones de licencia: uso comercial, corporativo o integración en SaaS prohibidos de forma expresa; solo se permite estudio, aprendizaje, modificación personal, hacker y académica.
- Sesgos conocidos: no disponibles; no se documenta ningún proceso de entrenamiento ni dataset que permita evaluar sesgos.
- Alucinación: no aplicable en el sentido de un LLM, pero el sistema declara comportamientos simulados (estados de "aburrimiento" o "impulso") que no implican cognición real.
- Ausencia de validación externa: 0 descargas y 0 likes, sin benchmarks, sin pipeline declarado y sin revisión por pares.
- Limitaciones de idioma y contexto: no disponibles; no se especifican idiomas soportados ni ventana de contexto.
- Complejidad y mantenimiento: más de 200 módulos sin documentación técnica completa ni garantías de compatibilidad futura con versiones de Windows.
- Ausencia de soporte: no hay información sobre mantenimiento, issues o comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/LokiDerWahnsinn/Fenrir-Alpha
- No se han encontrado en la búsqueda web enlaces relevantes, papers, blogs, repositorios ni demos relacionados con el modelo. Los resultados obtenidos corresponden a contenido no relacionado (foros turcos y chinos sobre duplicación de pantalla, tarjetas gráficas y series de televisión).
