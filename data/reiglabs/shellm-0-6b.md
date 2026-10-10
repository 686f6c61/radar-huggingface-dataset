# reiglabs/shellm-0.6B

## Resumen

Shellm 0.6B es un adaptador LoRA experimental desarrollado por reiglabs, un equipo de dos personas formado por Mátyás Tóth y Csanád Alattyányi, que convierte peticiones breves en inglés en comandos de shell de Linux. El modelo parte de Qwen/Qwen3-0.6B-Base (revisión fijada `da87bfb608c14b7cf20ba1ce41287e8de496c0cd`) y se entrena mediante ajuste supervisado de adaptadores LoRA de rango 8, manteniendo congelados los pesos del modelo base. El resultado es un modelo causal de aproximadamente 0,6 mil millones de parámetros con una tarea muy acotada: traducción inglés → comando.

La relevancia del proyecto es doble. Por un lado, explora el ciclo completo de entrenamiento, tokenización, evaluación funcional e ingeniería de inferencia en hardware de consumo, con un repositorio de solo 0,3 GB. Por otro, publica una evaluación funcional en dos conjuntos propios (ShellBench v1 y ShellBench Extra v1) ejecutando los comandos generados en fixtures de Docker, lo que va más allá de métricas de similitud textual y mide si el comando realmente hace lo pedido.

El modelo se distribuye como adaptadores PEFT sobre safetensors con licencia Apache 2.0 y está pensado para el flujo "petición → comando generado → revisión humana". Sus propios autores lo etiquetan como experimental y advierten de que la composición de comandos y las tareas multi-paso siguen siendo su punto débil: 92,9% de acierto funcional en ShellBench v1 frente a 34,3% en ShellBench Extra v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen3-0.6B-Base) con adaptadores LoRA de rango 8 |
| Parametros totales | Aproximadamente 0,6B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica adaptadores LoRA en safetensors en precision original; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (peticiones); la salida es texto de comandos de shell de Linux |
| Licencia | Apache License 2.0 (elegida por reiglabs para la publicacion del adaptador) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-0.6B-Base, revision `da87bfb608c14b7cf20ba1ce41287e8de496c0cd` |
| Metodo de adaptacion | Ajuste supervisado de adaptadores LoRA de rango 8 con pesos base congelados |
| Dataset de entrenamiento | Release propio `pilot-v2` de traduccion a shell |
| Fecha de entrenamiento | 2026-10-10 (zona horaria Europe/Budapest) |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |
| Libreria | peft (con transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer causal decoder-only de la familia Qwen3 con aproximadamente 0,6B de parametros. Sobre el se aplican adaptadores LoRA de rango 8 entrenados con ajuste supervisado, dejando los pesos del base congelados. No hay mezcla de expertos, ni atencion lineal, ni modulos de estado recurrente: la innovacion del proyecto esta en el dataset y en el metodo de evaluacion, no en la topologia de red. El checkpoint evaluado mas reciente es `adapters/2026-10-10-pilot-v2-fresh-lora-expandable/epoch-3`, correspondiente a una experimentacion con LoRA "fresh" descrita en el cuaderno `pilot-v2-fresh-lora-experiment` del repositorio.

El entrenamiento se apoya en un release de datos propio (`pilot-v2`) con catalogos de intenciones editables y ejemplos renderizados, mas un conjunto de utilidades de evaluacion funcional. La evaluacion no se limita a comparar cadenas: cada caso se ejecuta en dos fixtures de Docker, de modo que la metrica principal es la precision funcional (el comando hace lo que se pide) y no la coincidencia textual. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO: en consecuencia, esos datos se consideran no disponibles.

## Capacidades

- Traduccion de peticiones breves en ingles a comandos de shell de Linux, con una interfaz de tipo "peticion → comando generado → revision".
- Cobertura de temas cotidianos documentada por los autores: navegacion por el sistema de ficheros, listado de ficheros, creacion y movimiento de ficheros y directorios, busqueda de contenido, lectura de texto, conteo, localizacion de ficheros y cambio de permisos.
- Generacion de texto solo para el dominio de comandos; no se documenta como modelo conversacional de proposito general.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; de hecho, la cobertura multi-paso medida es 0/18 en ShellBench Extra v1.
- Capacidades multilingues: no; el unico idioma declarado es el ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en esta release.
- Composicion de comandos mediante tuberias (pipelines): muy limitada (2/32 casos superados en Extra v1).
- Uso condicional (if/else y similares): practicamente inexistente (1/13 casos en Extra v1).

## Casos de uso

- Sugerencia de comandos en una terminal o TUI local: el modelo recibe una peticion corta en ingles ("enter the root directory") y devuelve un candidato (`cd /`) que la persona usuaria revisa antes de ejecutar. Encaja por su tamano reducido, que permite tenerlo en el propio equipo sin depender de la nube.
- Herramienta educativa para aprender Linux: en un curso o tutorial, el alumno describe lo que quiere hacer y el modelo propone un comando sobre el que despues se discuten banderas y argumentos. El flujo de revision obligatoria lo hace adecuado para este contexto.
- Generacion de candidatos en runbooks y documentacion interna: los equipos de operaciones pueden usar el modelo para esbozar comandos de operaciones basicas de ficheros y buscarlos despues en revision, aceptando que las operaciones complejas no estan cubiertas.
- Investigacion sobre composicion de comandos: el repositorio incluye catalogos de intenciones editables, ejemplos renderizados y utilidades de evaluacion funcional, de modo que un grupo de investigacion puede reproducir los experimentos, anadir casos con tuberias o condiciones y medir la mejora.
- Ampliacion de datasets ingles → shell: el modelo puede generar borradores masivos de pares peticion/comando que despues se filtran con la evaluacion funcional en Docker, reduciendo el coste de anotacion manual.
- Ajuste supervisado posterior con datos propios y verificados independientes: al ser un adaptador LoRA sobre un base congelado, es viable reentrenar sobre dominios o dialectos concretos sin partir de cero.
- Prototipado de inferencia en hardware de consumo: por su tamano, sirve como banco de pruebas para medir latencias y consumo en portatiles o GPUs de gama media antes de escalar a modelos mayores.
- Filtro previo en asistentes de administracion con supervision humana: generar un primer candidato en tareas de solo lectura (listar, buscar, contar, leer) y delegar siempre la ejecucion en un revisor humano, evitando delegar operaciones destructivas.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados por el autor en el model-index y en la model card. En la informacion proporcionada aparecen marcados como no verificados, por lo que deben tratarse como autodeclarados.

| Modelo | Dataset | Tarea | Metrica | Resultado |
|---|---|---|---|---|
| shellm-0.6B (pilot-v2, epoch 3) | ShellBench v1 | Ingles a comandos de shell de Linux | Precision funcional (%) | 92,857 (104/112) |
| shellm-0.6B (pilot-v2, epoch 3) | ShellBench Extra v1 | Ingles a comandos de shell de Linux | Precision funcional (%) | 34,333 (103/300) |

Desglose adicional aportado por los autores en la model card:

| Aspecto medido | Resultado |
|---|---|
| Comprobaciones de sintaxis superadas en Extra v1 | 292/300 |
| Comprobaciones funcionales superadas en Extra v1 | 103/300 |
| Tuberias (pipelines) en Extra v1 | 2/32 |
| Tareas multi-paso en Extra v1 | 0/18 |
| Condicionales en Extra v1 | 1/13 |
| Comandos de v1 que pasan sintaxis pero fallan la evaluacion funcional | 8 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia, tomando como referencia un modelo de 0,6B de parametros mas los adaptadores LoRA: en fp16 en torno a 1,5-2 GB contando pesos y overhead de activaciones; en int8 cerca de 1 GB; en int4 alrededor de 0,7 GB. Son estimaciones por tamano, no mediciones publicadas por el autor.
- El repositorio ocupa 0,3 GB, coherente con un adaptador LoRA sobre un base pequeno.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para fp16 en tareas de este tamano (por ejemplo, RTX 3050, RTX 3060, GTX 1660). Una RTX 4090 sobredimensiona ampliamente el modelo. A100 y H100 solo tendrian sentido para entrenamiento por lotes o evaluacion masiva, no para inferencia de una sola peticion.
- Cabe en GPU de consumo: si, y tambien en CPU. El propio proyecto declara que explora formacion, tokenizacion y evaluacion en hardware de consumo.
- Opciones de despliegue documentadas: PyTorch con Transformers y PEFT. El repositorio incluye un notebook de experimentacion y una interfaz local (`chat.py`). La inferencia en navegador y los kernels WebGPU propios se describen como objetivos futuros, no como parte de esta release.
- Servidores de inferencia como vLLM, TGI, llama.cpp u Ollama no estan documentados en la informacion disponible para esta release.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no documenta otros modelos de traduccion de ingles a shell de Linux con los que comparar directamente, por lo que las alternativas de la misma categoria aparecen como no disponibles. La referencia inmediata es el modelo base sobre el que se construye el adaptador.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shellm-0.6B (adaptador LoRA) | ~0,6B (base congelado) + adaptador de rango 8 | no disponible | Ingles a comandos de shell de Linux | Apache 2.0 | HuggingFace (adaptadores PEFT) y GitHub con codigo y datos |
| Qwen/Qwen3-0.6B-Base | ~0,6B | no disponible en la informacion proporcionada | Modelo de lenguaje causal de proposito general | Apache 2.0 (segun la model card del base enlazada) | HuggingFace |
| Otras alternativas de ingles a shell | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La composicion de comandos es debil: cobertura de tuberias 2/32, multi-paso 0/18 y condicionales 1/13 en ShellBench Extra v1. Los buenos resultados en comandos basicos no deben extrapolarse a flujos complejos.
- Una sintaxis valida no implica una intencion correcta: en v1 todos los comandos pasan las comprobaciones de sintaxis, pero ocho fallan la evaluacion funcional; en Extra v1 pasan 292/300 de sintaxis frente a 103/300 funcionales.
- Los argumentos requieren cuidado: nombres de fichero con espacios o metacaracteres del shell, interpretacion de rutas, entrecomillado, banderas exactas y combinaciones de operaciones pueden gestionarse mal.
- Los comandos generados pueden modificar o borrar datos. Hay que revisar el comando y sus argumentos antes de ejecutarlo; el propio autor advierte de ello.
- Existe riesgo de alucinacion en cuanto a banderas, opciones y sintaxis especifica de utilidades que no aparezcan en el dataset de entrenamiento; no hay estimacion publicada de esta tasa.
- Fuera de alcance declarado por el autor: conversacion de proposito general, administracion de sistemas sin restricciones, Windows PowerShell, otros dialectos de shell, automatizacion en produccion sin revision y ejecucion autonoma con permisos elevados.
- Limitacion de idioma: solo ingles como entrada; no hay soporte multilingue declarado.
- Los resultados de benchmark estan autodeclarados y aparecen como no verificados; los conjuntos de evaluacion (ShellBench v1 y Extra v1) son propios y no hay comparacion con estandares externos de la comunidad.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ha establecido competencia para uso en produccion; el proyecto se declara experimental y no registra financiacion externa.
- No hay demo alojada ni paper asociado en esta release, lo que dificulta la reproducibilidad externa mas alla del repositorio de codigo.
- No se documentan cuantizaciones oficiales, por lo que cualquier despliegue en formatos GGUF, AWQ o GPTQ requeriria conversion propia y una reevaluacion funcional posterior.
- No se documentan sesgos evaluados ni analisis de sesgo del dataset `pilot-v2`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reiglabs/shellm-0.6B
- Archivos y checkpoints: https://huggingface.co/reiglabs/shellm-0.6B/tree/main
- Codigo, datos de entrenamiento, documentacion y definiciones de benchmarks: https://github.com/matyas-toth/shellm
- Notebook del experimento: https://github.com/matyas-toth/shellm/blob/master/docs/pilot-v2-fresh-lora-experiment.md
- Interfaz local interactiva: https://github.com/matyas-toth/shellm/blob/master/chat.py
- Modelo base Qwen/Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Discusiones del modelo: https://huggingface.co/reiglabs/shellm-0.6B/discussions
- Incidencias en GitHub: https://github.com/matyas-toth/shellm/issues
- Perfil del autor, Matyas Toth: https://www.linkedin.com/in/m%C3%A1ty%C3%A1s-t%C3%B3th-56920926b/
- Perfil del autor, Csanad Alattyanyi: https://www.linkedin.com/in/csanad-alattyanyi/
- Organizacion en HuggingFace: https://huggingface.co/reiglabs
