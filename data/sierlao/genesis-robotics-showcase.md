# Sierlao/genesis-robotics-showcase

## Resumen

`Sierlao/genesis-robotics-showcase` no es un modelo de IA: es un Space de Hugging Face construido con Gradio que actua como visor del conjunto de demostraciones de pick-and-place de un brazo Franka, recopilado con Genesis World 1.4.4. Cada episodio del dataset se presenta como un video de 1280x720 en el que el robot agarra un cubo de 4 cm y lo coloca sobre un marcador objetivo, acompanado de las trazas de estado y accion paso a paso. El repositorio publicado contiene el codigo de la aplicacion (`app.py`, `requirements.txt`) y, opcionalmente, una carpeta `data/`, no pesos de ninguna red neuronal.

La relevancia del artefacto es, por tanto, la de una herramienta de inspeccion y difusion de datos de robotica, no la de un componente desplegable en pipelines de inferencia. Su interes practico esta en facilitar la revision cualitativa de episodios de manipulacion (video mas trazas numericas sincronizadas), algo util antes de usar esos datos para entrenar politicas de imitacion o para depurar un simulador.

No se dispone de informacion sobre parametros, contexto, tokenizador, licencia ni idiomas, porque esos campos no aplican a una aplicacion de visualizacion. El repositorio registra 0 descargas y 0 likes en el momento de la consulta y no declara pipeline ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion web Gradio de visualizacion de datos) |
| Parametros totales | no aplica / no disponible (el repositorio no contiene pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponibles (la interfaz y la documentacion estan en ingles) |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | no aplica; los datos se almacenan como `manifest.jsonl`, `<ep>/video.mp4` y `<ep>/state.npz` |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red. El artefacto es una aplicacion Gradio que renderiza episodios de un dataset de robotica: un `manifest.jsonl` con el indice de episodios, un video MP4 por episodio y un fichero `state.npz` con las trazas de estado y accion por paso. La aplicacion se ejecuta en local con `pip install -r requirements.txt` y `python app.py`, y se despliega en Hugging Face Spaces con SDK Gradio subiendo `app.py`, `requirements.txt` y la carpeta `data/`, o bien apuntando a un repositorio de dataset externo.

La configuracion se realiza mediante dos parametros: `HF_DATASET_REPO`, que indica el id de un repositorio de dataset de Hugging Face (por ejemplo `Sierlao/genesis-robotics-demos`) del que hacer streaming de los videos en lugar de empaquetarlos, y `LOCAL_DATA`, que fija la ruta a una carpeta `data/` local (por defecto, `data/` junto a `app.py`). El README recomienda Git LFS para los videos que superen los limites de push habituales.

Los datos mostrados proceden de Genesis World 1.4.4, un entorno de simulacion robotica; la tarea concreta es pick-and-place de un cubo de 4 cm sobre un marcador objetivo con un brazo Franka. No se documentan en la informacion disponible el numero de episodios, la frecuencia de muestreo, el espacio de acciones ni la politica de recogida.

## Capacidades

- Visualizacion de episodios: reproduce un video de 1280x720 por episodio con el agarre del cubo y su colocacion sobre el marcador.
- Inspeccion de trazas: muestra las trazas de estado y accion paso a paso asociadas a cada episodio, almacenadas en `state.npz`.
- Streaming remoto de datos: puede leer los episodios desde un repositorio de dataset de Hugging Face configurado con `HF_DATASET_REPO`, sin necesidad de incluirlos en el Space.
- Modo local: ejecucion en maquina propia apuntando a una carpeta `data/` mediante `LOCAL_DATA`.
- Despliegue reproducible: pensado para Hugging Face Spaces con SDK Gradio y soporte de Git LFS para ficheros grandes.
- No incluye generacion de texto, razonamiento, codigo, vision por computador, tool calling, capacidades de agente ni soporte multilingue; esas categorias no aplican.

## Casos de uso

- Revision cualitativa de datos de manipulacion: antes de entrenar una politica de imitacion con los episodios, un ingeniero reproduce los videos y comprueba que el agarre y la colocacion son correctos en todos los episodios, descartando los fallidos.
- Docencia y divulgacion: el visor permite mostrar en clase o en una demo el ciclo completo de pick-and-place con el estado y la accion sincronizados, sin necesidad de montar un simulador.
- Depuracion del pipeline de simulacion: al comparar la traza de acciones con lo que se observa en el video se detectan desajustes de sincronizacion, escalas o contactos fisicos en Genesis World 1.4.4.
- Validacion de conversiones de formato: si los episodios se exportan a otro formato (por ejemplo, para entrenamiento de politicas), el visor sirve como referencia visual del dato original.
- Demostracion a terceros: publicar el Space como enlace compartible para que un cliente o revisor vea el dataset sin descargar videos de varios cientos de MB.
- Control de calidad de un dataset alojado aparte: con `HF_DATASET_REPO` se puede apuntar a un repositorio de datos y revisar lotes nuevos sin tocar el codigo de la aplicacion.
- Catalogacion de experimentos: usar `manifest.jsonl` como indice para localizar episodios concretos por identificador y revisar su traza asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es evaluable con MMLU, HumanEval, GSM8K ni metricas equivalentes, al no contener un modelo de lenguaje. Tampoco se documentan metricas de exito de la tarea de pick-and-place (tasa de exito, error de posicion final) ni latencias de la aplicacion.

## Requisitos de hardware

- GPU: no se indica ninguna; el visor no realiza inferencia y puede ejecutarse en CPU.
- VRAM: no aplica. La carga relevante es el almacenamiento de los videos y la RAM necesaria para decodificar MP4 de 1280x720 y cargar los `state.npz`.
- Almacenamiento: proporcional al numero de episodios; el README recomienda Git LFS para los videos que excedan los limites de push, lo que sugiere ficheros de tamano considerable.
- Despliegue: Hugging Face Spaces con SDK Gradio como opcion principal; ejecucion local con Python y las dependencias de `requirements.txt`.
- Servidores de inferencia (vLLM, TGI, llama.cpp, Ollama): no aplican, al no existir pesos.
- Latencia y throughput: no disponibles; dependen del backend de Gradio y del ancho de banda al hacer streaming desde el repositorio de dataset.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de herramientas comparables (visores de datasets de robotica, suites de evaluacion de politicas) que permitan una comparacion con cifras verificables de parametros, contexto, rendimiento o licencia.

| Criterio | `Sierlao/genesis-robotics-showcase` | Alternativas |
|---|---|---|
| Categoria | Visor Gradio de dataset de robotica | no disponible |
| Parametros | no aplica | no disponible |
| Contexto | no aplica | no disponible |
| Rendimiento | sin benchmarks publicados | no disponible |
| Licencia | no declarada | no disponible |
| Disponibilidad | repositorio publico en Hugging Face, 0 descargas | no disponible |

## Limitaciones y advertencias

- No es un modelo: no genera texto ni realiza inferencia; cualquier uso como componente de un pipeline de IA es un error de categoria.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para reutilizar el codigo ni los datos en productos comerciales; conviene contactar con el autor antes de cualquier uso en produccion.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes, sin issues ni historial de mantenimiento; no hay evidencia de que la aplicacion funcione en entornos distintos del del autor.
- Documentacion minima: no se especifican numero de episodios, frecuencia de captura, espacio de acciones, version de dependencias ni esquema exacto de `state.npz`, lo que dificulta reutilizar los datos sin inspeccionarlos.
- Dependencia de un dataset externo: si se usa `HF_DATASET_REPO`, la disponibilidad del visor queda ligada a la del repositorio de datos; el id `Sierlao/genesis-robotics-demos` solo aparece como ejemplo en el README y no se ha verificado.
- Acoplamiento a una version concreta del simulador: los datos se recogieron con Genesis World 1.4.4; diferencias de version pueden alterar la dinamica y invalidar comparaciones.
- Requisitos de ancho de banda y almacenamiento: los videos de 1280x720 por episodio implican costes de transferencia y de cuota en Spaces que no se cuantifican.
- Riesgo de confusion: el nombre "genesis-robotics-showcase" y su presencia en Hugging Face pueden llevar a buscarlo como modelo preentrenado; la model card no incluye metadatos de pipeline ni de idiomas que lo desmientan de forma explicita.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sierlao/genesis-robotics-showcase
- Repositorio de dataset mencionado como ejemplo en el README (`HF_DATASET_REPO`): `Sierlao/genesis-robotics-demos` (no verificado)
- No se proporcionan enlaces a papers, blogs, repositorios de codigo independientes, demos adicionales ni a la documentacion de Genesis World 1.4.4 en la informacion disponible.
