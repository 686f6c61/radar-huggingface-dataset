# antho-proxia/gaia-agent

## Resumen

GAIA Agent es un agente construido con LangGraph y publicado en Hugging Face bajo el identificador `antho-proxia/gaia-agent`. No se trata de un modelo de lenguaje con pesos propios, sino de un artefacto de orquestacion: un agente que delega la generacion en Claude (Anthropic) y que se distribuye como repositorio de codigo con licencia MIT. Su proposito declarado es servir como proyecto final del curso de agentes de Hugging Face (unidad 4) y resolver tareas del benchmark GAIA.

El repositorio no incluye pesos, tokenizador ni configuracion de inferencia; el pipeline no esta definido y no se declaran idiomas soportados. La unica documentacion disponible es una model card breve en frances que describe las herramientas del agente y los comandos de ejecucion. Por tanto, cualquier evaluacion de capacidades debe entenderse como una descripcion del diseno del agente, no de un modelo subyacente verificable.

Su relevancia es fundamentalmente didactica: ilustra el patron de agente con tool calling multiple (busqueda web, lectura de paginas, Wikipedia, ejecucion de Python y lectura de ficheros Excel/CSV/texto) sobre LangGraph. No debe confundirse con otros proyectos homonimos como GAIA de AMD (factoria de agentes para PC) o `gaia-agent/gaia-agent` en GitHub, que son productos distintos sin relacion verificada con este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente LangGraph sobre LLM externo (Claude, Anthropic); no es un modelo con pesos propios |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo Claude subyacente, no declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de codigo, sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto es un grafo de agente implementado con LangGraph. El flujo consiste en un planificador que decide que herramienta invocar en cada paso y un ejecutor que devuelve observaciones al bucle, hasta producir una respuesta final. Las herramientas declaradas en la model card son: busqueda web, lectura de paginas web, consulta a Wikipedia, ejecucion de codigo Python y lectura de ficheros adjuntos en formato Excel, CSV y texto.

No hay informacion sobre el modelo Claude concreto utilizado (version, tamano, contexto), sobre datos de entrenamiento, ajuste fino, RLHF o DPO. El agente no entrena ningun modelo: se apoya en las capacidades del LLM externo y en el prompting del grafo. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Razonamiento multi-paso mediante bucle de agente en LangGraph, con planificacion y ejecucion iterativa de herramientas.
- Tool calling sobre cinco herramientas: busqueda web, lectura de paginas web, Wikipedia, ejecucion de Python y lectura de ficheros Excel/CSV/texto.
- Resolucion de tareas tipo GAIA, que requieren combinar busqueda, calculo y lectura de documentos.
- Ejecucion de codigo Python para calculos, transformacion de datos y verificacion de resultados.
- Analisis de datos tabulares adjuntos (Excel y CSV) dentro del propio bucle del agente.
- Ejecucion por lotes contra el benchmark: `python run_gaia.py --test 3`, luego `python run_gaia.py` y finalmente `python run_gaia.py --submit`.
- Capacidades multilingues: no disponibles de forma explicita; dependen del LLM subyacente.

## Casos de uso

- Evaluacion en el benchmark GAIA: el agente esta disenado para ejecutar el conjunto de pruebas y enviar resultados con `--submit`, lo que permite medir su tasa de acierto en tareas que exigen busqueda web, calculo y lectura de documentos.
- Proyecto final del curso de agentes de Hugging Face: sirve como referencia didactica de un grafo LangGraph con multiples herramientas y bucle de observacion.
- Automatizacion de investigacion documental: combina busqueda web, lectura de paginas y consulta a Wikipedia para responder preguntas que requieren sintetizar varias fuentes.
- Analisis de hojas de calculo: la herramienta de lectura de Excel y CSV permite responder preguntas sobre datos adjuntos sin salir del bucle del agente.
- Verificacion mediante codigo: la ejecucion de Python permite comprobar calculos y transformaciones de datos generados por el LLM, reduciendo errores aritmeticos.
- Prototipo de asistente con acceso a red: al estar bajo licencia MIT, puede reutilizarse como esqueleto para agentes internos que necesiten busqueda web y ejecucion de codigo.
- Base para experimentacion con LangGraph: el codigo del grafo puede extenderse con nuevas herramientas o cambiar el LLM subyacente para comparar proveedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el flujo de ejecucion contra GAIA, pero no incluye puntuaciones, tasas de acierto ni tiempos.

## Requisitos de hardware

- VRAM para inferencia: no aplica localmente; la generacion se delega en la API de Anthropic.
- GPU recomendadas: no disponible; no se requiere GPU local para el agente, solo para el LLM subyacente si se sustituye por un modelo local.
- Compatibilidad con GPU de consumo: no aplica en la configuracion documentada (Claude via API).
- Opciones de despliegue: ejecucion directa con Python mediante `run_gaia.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen de la API de Anthropic y del numero de pasos del bucle de agente.

## Comparativa con modelos similares

| Proyecto | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| antho-proxia/gaia-agent | Agente LangGraph sobre Claude | no disponible | no disponible | MIT | Repositorio didactico; 0 descargas y 0 likes en Hugging Face |
| gaia-agent/gaia-agent (GitHub) | Agente "super agent" para GAIA | no disponible | no disponible | no disponible | Proyecto homonimo sin relacion verificada con este repositorio |
| GAIA de AMD (amd-gaia.ai) | Factoría de agentes para PC | no disponible | no disponible | no disponible | Producto de AMD orientado a ejecucion local; sin relacion verificada |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no contiene pesos, tokenizador ni artefactos de inferencia; requiere acceso a la API de Claude, lo que implica coste y dependencia de un proveedor externo.
- Ausencia total de benchmarks: no hay evidencia publicada de su rendimiento en GAIA ni en otras tareas.
- Documentacion minima: la model card esta en frances y no detalla version del LLM, configuracion del grafo, prompts ni manejo de errores.
- Riesgo de alucinacion heredado del LLM subyacente, especialmente en la sintesis de resultados de busqueda web.
- La ejecucion de codigo Python introduce riesgos de seguridad si el agente se despliega sin sandboxing adecuado.
- Idiomas soportados no declarados; el comportamiento multilingue depende enteramente de Claude.
- Licencia MIT permisiva para uso comercial, pero el uso de la API de Anthropic queda sujeto a sus propios terminos y precios.
- Repositorio sin traccion (0 descargas, 0 likes) y creado en 2026; no hay senales de mantenimiento ni comunidad.
- Posible confusion con proyectos homonimos (GAIA de AMD, gaia-agent en GitHub) que no guardan relacion verificada con este artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/antho-proxia/gaia-agent
- GitHub homonimo (sin relacion verificada): https://github.com/gaia-agent/gaia-agent
- GAIA de AMD (sin relacion verificada): https://amd-gaia.ai/
