# sauravsingla08/AgentWeave-Router-MiniLM

## Resumen

AgentWeave-Router-MiniLM es un enrutador semantico de capacidades, publicado por el usuario sauravsingla08, que se coloca delante de la inferencia de un LLM para reducir el espacio de acciones (herramientas o agentes) que el modelo ve. No es un modelo generativo: es un componente de enrutamiento previo que usa el encoder congelado `sentence-transformers/all-MiniLM-L6-v2` para producir embeddings de 384 dimensiones y compararlos por similitud coseno contra un fichero de prototipos de ruta. El resultado es un conjunto de rutas ordenadas (`research`, `retrieval`, `analysis`, `coding`, `planning`, `verification`, `summarization`, `data_analysis`) que alimenta despues al framework AgentWeave.

El repositorio es deliberadamente minimo: publica la configuracion de enrutamiento, los prototipos de ruta y el codigo ejecutable (`router.py`, `route_prototypes.json`, `config.json`, `requirements.txt`), pero no redistribuye los pesos del encoder, que se descargan en tiempo de ejecucion desde el modelo base original. Su tesis de diseno es "route before you reason": filtrar antes de razonar en lugar de mejorar el modelo de razonamiento. Esto lo hace relevante en despliegues agenticos con espacios de acciones grandes, donde pasar cientos de herramientas al prompt degrada la precision del function calling y encarece cada llamada, y donde interesa una capa de decision que corra en CPU sin API externa.

El autor declara explicitamente que **no hay fine-tuning**: se trata de un enrutador prototipico construido sobre un encoder congelado, y las puntuaciones devueltas son senales de ranking, no probabilidades calibradas. Se presenta como acompanante semantico experimental del enrutador determinista por defecto de AgentWeave, no como su sustituto ni como la fuente de las metricas publicadas del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (all-MiniLM-L6-v2) congelado, usado como extractor de embeddings; enrutamiento por similitud coseno contra prototipos de ruta |
| Parametros totales | No disponible en la informacion proporcionada; aproximadamente 22,7 M heredados del encoder base all-MiniLM-L6-v2 (dato del modelo base, no confirmado en esta ficha) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el encoder base all-MiniLM-L6-v2 admite secuencias cortas (256 tokens como maximo) |
| Tipos de cuantizacion | No disponible; el modelo es un enrutador en CPU-first y no se documentan variantes cuantizadas |
| Idiomas soportados | Ingles (`en`); los prototipos de ruta estan enfocados a ingles |
| Licencia | Apache-2.0 (el encoder base `sentence-transformers/all-MiniLM-L6-v2` se carga por separado y queda sujeto a su propia licencia) |
| Formato de pesos | No disponible: el repositorio no incluye pesos propios, solo `router.py`, `route_prototypes.json`, `config.json` y `requirements.txt`; el encoder se descarga desde Hugging Face en la primera ejecucion |

## Arquitectura y entrenamiento

El sistema es un pipeline de dos etapas y sin generacion de texto. Primero, un encoder MiniLM congelado transforma la peticion del usuario en un vector normalizado de 384 dimensiones. Despues, ese vector se compara por similitud coseno contra un conjunto de prototipos de ruta almacenados en `route_prototypes.json`, y se devuelve un ranking de las `top_k` rutas candidatas. No hay cabezal de clasificacion entrenado, ni capa densa adicional, ni proceso de destilacion sobre el encoder: el autor indica de forma explicita que **no se reclama ningun fine-tuning**, lo que convierte el comportamiento del modelo en funcion directa de la redaccion de los prototipos y de la calidad del encoder original.

No se documentan en la informacion disponible datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF/DPO), porque no existe una fase de entrenamiento asociada a este repositorio. Las innovaciones destacables son de ingenieria y de sistema, no de modelado: ejecucion integra en CPU sin API de inferencia externa, embeddings normalizados con ranking coseno, uso de la cache local de Hugging Face a partir de la segunda ejecucion, y un fichero de prototipos legible por humanos que permite editar la taxonomia sin reentrenar nada. La interaccion con el resto del framework es deliberadamente asimetrica: el enrutamiento por relevancia no concede permiso de ejecucion; el filtrado por politica, el control de alcance y la autorizacion siguen siendo fronteras separadas dentro de AgentWeave.

## Capacidades

- Enrutamiento semantico previo a la inferencia: clasifica una peticion en una o varias de las ocho familias de ruta disponibles y las devuelve ordenadas por similitud coseno.
- Reduccion del espacio de acciones: sirve para acotar el conjunto de herramientas o agentes candidatos antes de que el LLM razone, en lugar de exponer todo el catalogo en el prompt.
- Extraccion de caracteristicas (`feature-extraction`): genera embeddings de frases de 384 dimensiones aptos para busqueda por similitud y clustering.
- Ejecucion en CPU con dependencias minimas: no requiere GPU, ni API externa, ni generacion de texto.
- Integracion en agentes multi-paso: encaja como primer paso de una cadena (enrutar, recuperar, planificar, verificar, resumir) donde cada ruta mapea a una capacidad operativa distinta.
- Soporte de `top_k` configurable: el llamador decide cuantas rutas candidatas quiere propagar al siguiente componente.
- Edicion de la taxonomia sin reentrenamiento: los prototipos son texto plano, por lo que se pueden anadir rutas o reformular las existentes.
- No soporta: generacion de texto, tool calling nativo, vision, audio, matemáticas simbolicas, ni clasificacion de seguridad. Tampoco es un modelo de confianza calibrada ni un motor de autorizacion.

## Casos de uso

- Enrutamiento previo en agentes con catalogo de herramientas grande: antes de invocar al LLM, el router puntua la peticion contra las rutas disponibles y solo se pasan al prompt las herramientas de las rutas mejor rankeadas, reduciendo tokens de entrada y ruido en la seleccion.
- Demos locales en portatil sin GPU: al ejecutarse integramente en CPU y sin API externa, permite prototipar flujos agenticos en equipos de desarrollo modestos o en entornos de borde.
- Investigacion comparativa sobre enrutamiento: sirve como referencia experimental frente a un enrutador determinista, manteniendo fijo el modelo aguas abajo y variando unicamente el conjunto de acciones visibles.
- Clasificacion de intencion en pipelines internos: las rutas `retrieval`, `summarization` y `analysis` permiten separar peticiones de busqueda documental, resumen y analisis antes de decidir que subsistema las atiende.
- Prefiltrado en plataformas de recuperacion aumentada: dado que produce embeddings de 384 dimensiones, puede usarse para ordenar fragmentos o candidatos en una primera etapa barata antes de un reranker mas costoso.
- Orquestacion multi-agente con especializacion: cada ruta puede mapear a un agente distinto (`coding`, `planning`, `verification`), de modo que el sistema derive la tarea al especialista adecuado sin exponer todos los agentes al modelo.
- Despliegue en entornos con requisitos de privacidad: al no requerir servicios externos de inferencia, la peticion no sale de la infraestructura propia salvo por la descarga puntual del encoder desde Hugging Face.
- Investigacion sobre taxonomias de capacidades: el fichero de prototipos legible permite estudiar como la redaccion de los prototipos altera el ranking resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de exactitud, latencia o throughput en la model card, y advierte expresamente que este enrutador MiniLM no es la fuente de las afirmaciones de benchmark publicadas sobre el enrutador determinista de AgentWeave.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB de VRAM en configuracion estandar; el diseno es CPU-first y el encoder MiniLM es de tamano reducido (del orden de decenas de MB de pesos).
- GPU recomendadas: no se requieren. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede ejecutarlo, pero seria infrautilizada; el caso de uso natural es CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual, e incluso en hardware sin GPU dedicada.
- Opciones de despliegue: ejecucion directa con Python mediante `router.py` y la libreria `sentence-transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de este tipo. El autor menciona un Space interactivo bajo el mismo nombre de proyecto como acompanante.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen del hardware de CPU, del tamano del fichero de prototipos y del numero de rutas comparadas por peticion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| sauravsingla08/AgentWeave-Router-MiniLM | Enrutador semantico por prototipos sobre un encoder congelado | No distribuidos en el repositorio (encoder base MiniLM-L6) | No disponible | Apache-2.0 | Hugging Face; codigo en GitHub y paquete en PyPI | Sin fine-tuning declarado; devuelve rankings, no probabilidades calibradas |
| sentence-transformers/all-MiniLM-L6-v2 | Encoder de embeddings de uso general | Aproximadamente 22,7 M (dato del modelo base) | No disponible en esta busqueda; el modelo base esta limitado a secuencias cortas | Apache-2.0 | Hugging Face | Es la dependencia directa de este enrutador; no incluye taxonomia de rutas ni logica de enrutamiento |
| Enrutador determinista de AgentWeave | Enrutamiento previo a la inferencia basado en elegibilidad, requisitos, capacidad y senales de enrutamiento | No disponible | No disponible | No disponible | Documentado en el paper y en el repositorio de AgentWeave | Es la ruta por defecto del framework; el modelo MiniLM se presenta como complemento experimental, no como sustituto |
| Otros enrutadores semanticos open source (por ejemplo, librerias de semantic router basadas en embeddings) | Enrutamiento por similitud de embeddings | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

No se dispone de cifras comparativas de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: los prototipos de ruta estan redactados en ingles y enfocados a ese idioma, por lo que el comportamiento con peticiones en castellano u otras lenguas no esta garantizado ni evaluado.
- Riesgo de alucinacion: no genera texto, por lo que no alucina contenido; sin embargo, los rankings pueden ser erroneos y propagar una ruta equivocada al componente siguiente.
- Calibracion: las puntuaciones son similitudes coseno, no probabilidades calibradas. No deben interpretarse como niveles de confianza ni usarse como umbrales de decision sin analisis previo.
- Sensibilidad a los prototipos: la redaccion concreta de cada prototipo influye directamente en el ranking, lo que introduce fragilidad frente a cambios de vocabulario o de dominio.
- Taxonomia compacta: solo ocho familias de ruta (`research`, `retrieval`, `analysis`, `coding`, `planning`, `verification`, `summarization`, `data_analysis`); los dominios especificos necesitaran prototipos personalizados.
- No es un motor de autorizacion ni un clasificador de seguridad: el propio autor lo excluye explicitamente de esos usos. Enrutar una peticion hacia una herramienta no concede permiso para ejecutarla; el filtrado por politica y el control de alcance son capas separadas.
- No sustituye a la evaluacion del function calling aguas abajo: el enrutamiento no valida que el modelo final invoque correctamente la herramienta.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y naturaleza experimental declarada por el autor; no hay evidencia publica de uso en produccion.
- Licencia: Apache-2.0 permite uso comercial del repositorio, pero el encoder `sentence-transformers/all-MiniLM-L6-v2` se carga por separado y queda sujeto a su propia model card y licencia, que deben revisarse de forma independiente.
- Fechas de publicacion: la model card y los artefactos asociados presentan marcas temporales que conviene verificar directamente en el repositorio antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sauravsingla08/AgentWeave-Router-MiniLM
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio de AgentWeave en GitHub: https://github.com/sauravsingla/agentweave
- Codigo fuente citado en la model card: `https://github.com/sauravsingla/AgentWeave`
- Sitio del proyecto: http://agentweave.dev/
- Paper "AgentWeave: Routing Before Reasoning for Efficient Function Calling" (arXiv:2608.23078): https://arxiv.org/abs/2608.23078
- PDF del paper: https://arxiv.org/pdf/2608.23078
- Paquete en PyPI: https://pypi.org/project/agentweave-router/
