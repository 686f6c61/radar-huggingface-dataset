# kvba1337/zpb-geoloc-gemma3-4b-lora

## Resumen

El repositorio `kvba1337/zpb-geoloc-gemma3-4b-lora` es un adaptador LoRA (con entrenamiento declarado en QLoRA) sobre el modelo multimodal `google/gemma-3-4b-it`, orientado a geolocalizacion a nivel de fotografia sobre imagenes de calle. Lo publica el usuario `kvba1337` bajo el identificador interno "ZPB ID-1778". El adaptador se distribuye de forma independiente y nunca fusionado con los pesos base, de modo que el repositorio no redistribuye los pesos con control de acceso de Google.

El dato mas importante para cualquier evaluacion es que **el repositorio es un marcador de posicion y todavia no contiene pesos entrenados**. La propia model card lo indica de forma explicita: se creo antes de ejecutar el entrenamiento, para reservar el nombre y verificar que el artefacto previsto es publicable mientras el modelo base aun puede cambiarse. Por tanto, no existen en este momento modulos objetivo declarados, hiperparametros de LoRA, datos de entrenamiento, resultados de evaluacion ni pesos descargables.

La relevancia actual del proyecto es, por tanto, prospectiva: documenta la intencion de publicar un adaptador de geolocalizacion ligero (4B) que pueda cargarse sobre Gemma 3 4B-it mediante PEFT, con un uso declarado restringido a investigacion y benchmarking y con prohibicion explicita de localizacion de personas. Cualquier uso en produccion es hoy inviable porque no hay artefacto entrenado.

## Especificaciones tecnicas

Los datos de la tabla distinguen entre lo declarado por el repositorio del adaptador y lo heredado del modelo base.

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal (modelo base: google/gemma-3-4b-it) |
| Parametros totales | No disponible (el repositorio no contiene pesos entrenados; los parametros corresponderian a los del modelo base mas el adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; la del modelo base es la fijada por google/gemma-3-4b-it |
| Tipos de cuantizacion | No disponible (se menciona entrenamiento QLoRA, pero no se especifica el esquema de cuantizacion publicado) |
| Idiomas soportados | No disponible en el repositorio; el campo de idiomas del modelo base no se detalla aqui |
| Licencia | Gemma Terms of Use (el fichero LICENSE del repositorio reproduce los terminos de Gemma; el aviso NOTICE incluye la linea exigida) |
| Formato de pesos | No disponible (no hay pesos publicados; la libreria declarada es peft) |
| Modulos objetivo del adaptador | No disponible (la model card indica que se nombraran junto con los primeros pesos entrenados) |
| Modo de despliegue del adaptador | No fusionado con los pesos base, cargado en tiempo de inferencia mediante PEFT |
| Pipeline declarado | image-text-to-text |
| Modelo base | google/gemma-3-4b-it |
| Version del adaptador | No disponible (no se declara revision ni commit) |

## Arquitectura y entrenamiento

El artefacto previsto es un adaptador LoRA sobre `google/gemma-3-4b-it`. Segun la model card, el adaptador modifica los pesos del modelo de lenguaje del modelo base en tiempo de carga mediante PEFT, y los modulos objetivo se nombraran cuando existan los primeros pesos entrenados. No se especifica rango (rank), alpha, dropout, ni que capas se adaptan. El pipeline declarado es image-text-to-text, lo que es coherente con la tarea de geolocalizacion a partir de imagenes, pero no se detalla si el adaptador toca solo la torre de lenguaje o tambien el proyector multimodal.

No hay informacion sobre el conjunto de datos de entrenamiento: no se indican volumen de imagenes, procedencia (por ejemplo, si son imagenes de calle a nivel de suelo), distribucion geografica, resolucion, ni proceso de anotacion. Tampoco se documentan el numero de pasos, la tasa de aprendizaje, el hardware utilizado ni si hubo etapas de ajuste adicionales. Se menciona QLoRA como tecnica de entrenamiento con cuantizacion en 4 bits, pero sin detalle del esquema exacto ni de si se aplico a todo el modelo o solo a determinadas capas. No hay ninguna innovacion tecnica declarada mas alla del propio uso de PEFT para no redistribuir pesos con control de acceso.

## Capacidades

- Las capacidades reales del adaptador no pueden evaluarse: el repositorio no contiene pesos y por tanto no hay comportamiento observable.
- Capacidad prevista segun la model card: geolocalizacion a nivel de fotografia sobre imagenes de calle (street-level imagery).
- Uso previsto declarado: benchmarking de investigacion en geolocalizacion.
- Entrada multimodal: al apoyarse en `google/gemma-3-4b-it`, el pipeline declarado es image-text-to-text.
- Tool calling / function calling: no disponible; no se declara soporte especifico en el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se declara.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, audio, video): no disponible.

## Casos de uso

Dado que no existen pesos entrenados, los casos siguientes describen el uso previsto declarado y escenarios que serian plausibles si el adaptador se publicase con el comportamiento anunciado. No deben interpretarse como capacidades verificadas.

- Benchmarking academico de geolocalizacion: el adaptador se cargaria sobre Gemma 3 4B-it mediante PEFT para medir precision a nivel de fotografia sobre un conjunto de imagenes de calle de referencia, comparando contra baselines no adaptados.
- Investigacion en reconocimiento de senales visuales geograficas: permitiria estudiar que indicios (arquitectura, vegetacion, senaletica, matriculas) explota el modelo para inferir regiones, siempre sobre imagenes no asociadas a personas identificables.
- Evaluacion de adaptadores de bajo coste: al ser un LoRA sobre un modelo de 4B, serviria para estudiar cuanto rendimiento especifico de dominio se puede obtener con un numero reducido de parametros entrenables frente a un ajuste completo.
- Auditoria de sesgos geograficos: uso en investigacion para medir si el adaptador rinde peor en determinadas regiones o paises, y si hereda sesgos del modelo base.
- Prototipado de pipelines multimodales con PEFT: referencia tecnica para equipos que quieran integrar adaptadores no fusionados en flujos de inferencia con carga dinamica de pesos.
- Docencia sobre despliegue de LoRA: ejemplo de estructura de repositorio (licencia, aviso, base declarada) para ensenar practicas de publicacion de adaptadores sobre modelos con terminos de uso restrictivos.

No se recomienda ningun caso de uso en produccion en el estado actual del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de geolocalizacion, ni evaluaciones sobre conjuntos de referencia, ni comparaciones con otros adaptadores o modelos. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

No hay datos de hardware declarados para el adaptador. Como referencia general para el modelo base `google/gemma-3-4b-it` (no verificada en la informacion proporcionada), las estimaciones habituales serian:

- VRAM para inferencia: en torno a 8-10 GB en precision de 16 bits para un modelo de 4B, y en torno a 3-5 GB con cuantizacion de 4 bits.
- GPU recomendadas: una GPU consumer con 12-16 GB de VRAM seria suficiente en cuantizacion; para precision completa se recomienda 16 GB o mas.
- Cabe en GPU consumer: previsiblemente si, en tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, especialmente con cuantizacion.
- Opciones de despliegue del adaptador: PEFT sobre transformers, con carga del adaptador en tiempo de inferencia. Para el modelo base completo existen otros runners (vLLM, llama.cpp, Ollama, TGI), pero no hay confirmacion de compatibilidad especifica con el adaptador.
- Latencia y throughput: no disponible.

Estas cifras son estimaciones orientativas sobre el modelo base y no sobre el adaptador, que no tiene pesos publicados.

## Comparativa con modelos similares

No hay datos de rendimiento del adaptador, por lo que la comparativa se limita a caracteristicas estructurales del modelo base y de alternativas multimodales de tamano similar. No se dispone de informacion verificada en la busqueda realizada para completar las columnas de rendimiento.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zpb-geoloc-gemma3-4b-lora (este repositorio) | No disponible (adaptador LoRA sin pesos) | No disponible | Si (declarado, image-text-to-text) | Gemma Terms of Use | Repositorio placeholder, sin pesos |
| google/gemma-3-4b-it (modelo base) | 4B (segun documentacion del modelo base, no verificada aqui) | No disponible en la informacion proporcionada | Si | Gemma Terms of Use | Publico con acceso controlado |
| Alternativas multimodales de 3-7B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la busqueda web modelos comparables especificos de geolocalizacion a nivel de fotografia con adaptadores LoRA publicados. Se indica "no disponible" para evitar comparaciones no sustentadas.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados: es un marcador de posicion, por lo que no existe ningun artefacto funcional que evaluar o desplegar.
- No se declaran modulos objetivo, hiperparametros ni datos de entrenamiento, lo que impide reproducir el futuro adaptador a partir de la informacion publicada.
- Riesgo de alucinacion: no evaluable en el estado actual. En tareas de geolocalizacion, un modelo de este tipo puede producir coordenadas o paises plausibles pero incorrectos sin indicar incertidumbre.
- Sesgos conocidos: no disponibles. Es previsible que un adaptador de geolocalizacion herede desequilibrios geograficos del modelo base y del conjunto de datos, pero no hay datos que lo confirmen.
- Limitaciones de contexto e idioma: no disponibles; la model card no declara idiomas ni ventana de contexto para el adaptador.
- Restricciones de licencia: el repositorio se rige por los Gemma Terms of Use, que incorporan por referencia la Gemma Prohibited Use Policy. Esto condiciona el uso comercial y obliga a respetar las restricciones de uso prohibido de Google.
- Uso prohibido explicito: el adaptador no debe usarse para rastrear o vigilar personas, inferir la ubicacion de un individuo identificable ni inferir informacion privada sobre personas. La model card declara que no es para localizacion de personas.
- Alcance limitado declarado: uso previsto unicamente para benchmarking de investigacion en geolocalizacion de imagenes de calle.
- Advertencia para produccion: no integrar este repositorio en ningun sistema productivo hasta que se publiquen pesos, se documente el entrenamiento y se aporten evaluaciones reproducibles.
- La busqueda web realizada no devolvio resultados utiles (unicamente paginas de inicio de Google), por lo que no hay fuentes externas que corroboren el proyecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kvba1337/zpb-geoloc-gemma3-4b-lora
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Paper, blog, repositorio de codigo o demo del adaptador: no disponible en la informacion proporcionada (la model card menciona un fichero LICENSING.md en el repositorio de codigo del proyecto, pero no se facilita su URL)
- Resultados de busqueda web relevantes: no disponible (la busqueda no devolvio resultados relacionados con el modelo)
