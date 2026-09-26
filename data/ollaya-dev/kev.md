# ollaya-dev/kev

## Resumen

kev es un modelo de decision (decision-model) distribuido por ollaya-dev como paquete ONNX para el runtime Ollaya. Se construye sobre jaredpalmer/kev-0.8b, que a su vez combina un adaptador y una cabeza pointer (pointer head) de Jared Palmer con el modelo base Qwen/Qwen3.5-0.8B-Base del equipo Qwen. El resultado es un clasificador que recibe preguntas tipadas y devuelve respuestas calibradas, no texto libre generado.

El paquete sigue la filosofia de Ollaya, descrita por sus autores como "Ollama para modelos de decision": ejecucion local de modelos abiertos de decision, con una API compatible con TypeSafe. La etiqueta kev:0.8b fija el modelo a los commits 54f4f87 del upstream jaredpalmer/kev-0.8b y dc7cdfe de Qwen/Qwen3.5-0.8B-Base.

Un detalle relevante para evaluarlo: el repositorio de HuggingFace no contiene pesos (tamano de repo 0,0 GB). Solo incluye un grafo ONNX en fp32 (0.8b/model-fp32.onnx) mas 0.8b/decision.json (layout de secuencia y tokens especiales) y 0.8b/calibration.json (temperaturas). Los pesos se descargan aparte con `ollaya pull` desde los repositorios de origen, sin modificar y fijados a commit, con verificacion sha256.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; derivada del modelo base Qwen/Qwen3.5-0.8B-Base con un adaptador y una cabeza pointer (pointer head) añadidos, exportada a ONNX |
| Parametros totales | Aproximadamente 0,8 mil millones (segun la etiqueta kev:0.8b); la model card no da la cifra exacta ni desglosa adaptador y cabeza |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32 (grafo 0.8b/model-fp32.onnx, valido para CPU y GPU); no se mencionan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (misma que el modelo upstream); el propio Ollaya es Apache-2.0 |
| Formato de pesos | ONNX para el grafo (model-fp32.onnx). El repositorio no incluye pesos: el grafo referencia por byte offset los ficheros de pesos de los repositorios upstream, que se descargan con `ollaya pull`. Formato de esos pesos: no disponible |
| Pipeline | text-classification |
| Libreria | onnx |
| Tarea declarada | Decision / clasificacion con salida calibrada |
| Tamano del repositorio | 0,0 GB (sin pesos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de su composicion: el modelo combina un modelo base (Qwen/Qwen3.5-0.8B-Base) con un adaptador y una cabeza pointer desarrollados por Jared Palmer en jaredpalmer/kev-0.8b. La etiqueta "system-one" sugiere una formulacion de decision rapida e intuitiva, en la linea de la dicotomia de Kahneman, aunque la model card no explicita el fundamento tecnico. Tampoco se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento.

El elemento mejor documentado es el proceso de derivacion y exportacion. Cada etiqueta incluye un grafo ONNX en fp32 que no incorpora pesos, sino que referencia por byte offset los ficheros de los autores originales; `ollaya pull` descarga esos pesos desde los repositorios upstream, sin modificarlos y fijados a un commit concreto, y verifica su sha256. El fichero decision.json define el layout de secuencia y los tokens especiales, y calibration.json contiene las temperaturas usadas para calibrar las probabilidades de salida.

La verificacion de paridad es el dato tecnico mas concreto disponible: el runtime Rust de Ollaya reproduce el comportamiento del Kev upstream en PyTorch fp32 de forma exacta sobre 480 preguntas procedentes de 117 peticiones, y rechaza las mismas 16 peticiones que rechaza el upstream. Las filas de tokens y las posiciones de opciones son identicas, la decision coincide en todas las preguntas y las probabilidades difieren como maximo en 2,3e-6, tanto en CPU como en CUDA. Las respuestas TypeSafe coinciden con las del upstream hasta su redondeo a 4 decimales.

## Capacidades

- Toma de decisiones sobre preguntas tipadas: recibe preguntas estructuradas y devuelve una decision, no texto generado.
- Salida probabilistica calibrada, con temperaturas definidas en calibration.json.
- Clasificacion de texto (pipeline declarado: text-classification).
- API compatible con TypeSafe para integrar las respuestas en codigo tipado.
- Ejecucion local en CPU y en GPU CUDA mediante el runtime Rust de Ollaya.
- Verificacion de integridad de pesos (sha256) y fijado a commit en la descarga.
- Paridad documentada con el modelo upstream de referencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Enrutado de peticiones con criterio fijo: dado un conjunto de opciones y una pregunta tipada, el modelo devuelve la opcion elegida con probabilidad calibrada, lo que permite usarlo como clasificador de entrada en un pipeline mayor sin depender de un LLM generativo.
- Automatizacion de decisiones de negocio reproducibles: al fijar los pesos a un commit y verificar su sha256, es adecuado para flujos donde la misma entrada debe producir siempre la misma decision auditable.
- Filtrado y validacion previos: la paridad documentada incluye el rechazo de las mismas 16 peticiones que rechaza el upstream, lo que lo hace util como puerta de validacion de entradas malformadas antes de procesarlas.
- Inferencia en local y en el borde: con un grafo ONNX fp32 de aproximadamente 0,8B de parametros y ejecucion en CPU, encaja en escenarios sin GPU y con datos que no deben salir de la maquina.
- Integracion en servicios Rust o backends tipados: la API compatible con TypeSafe permite consumir las respuestas como tipos en lugar de parsear texto libre.
- Prototipado de sistemas de decision antes de escalar a un modelo mayor: la paridad con el upstream PyTorch permite desarrollar contra este paquete y mantener la coherencia de decisiones si se migra de runtime.
- Evaluacion comparativa de calibracion: al exponer temperaturas en calibration.json y probabilidades con tolerancia de 2,3e-6 frente al upstream, sirve para estudiar el efecto de la calibracion en la decision final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes). El unico dato cuantitativo publicado es la verificacion de paridad frente al modelo upstream:

| Metrica de paridad | Resultado |
|---|---|
| Preguntas evaluadas | 480 (procedentes de 117 peticiones) |
| Peticiones rechazadas | 16, coincidentes con las que rechaza el upstream |
| Coincidencia de filas de tokens y posiciones de opciones | Identica al upstream |
| Coincidencia de la decision | Identica en todas las preguntas |
| Diferencia maxima de probabilidad (CPU y CUDA) | 2,3e-6 |
| Respuestas TypeSafe | Iguales al upstream hasta su redondeo a 4 decimales |

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 3,2 GB solo para los pesos (0,8B parametros x 4 bytes), mas memoria para activaciones y overhead del runtime; cifra no publicada por el autor.
- El grafo disponible es fp32 y se declara valido tanto en CPU como en GPU CUDA, por lo que la inferencia en CPU es una opcion soportada.
- GPU recomendadas: no disponible. Al tratarse de un modelo de 0,8B, cabe previsiblemente en GPU de consumo (por ejemplo, gama RTX con 6-8 GB o mas de VRAM), pero no hay cifras oficiales de consumo ni de compatibilidad.
- Cabe en GPU de consumo: si, segun el tamano estimado, aunque no esta confirmado por el autor.
- Opciones de despliegue: runtime Rust de Ollaya (`ollaya run kev`, `ollaya pull`) sobre el grafo ONNX, con API compatible con TypeSafe. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- Requisito de conectividad: la primera ejecucion requiere descargar los pesos desde los repositorios upstream y verificar su sha256.
- Almacenamiento: el repositorio ocupa 0,0 GB, pero hay que sumar el espacio de los pesos descargados por separado.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables de la misma categoria (modelos de decision empaquetados como ONNX). La tabla siguiente recoge los componentes de la cadena, con los campos no publicados marcados como no disponibles:

| Modelo | Rol | Parametros | Contexto | Licencia | Formato | Datos publicos |
|---|---|---|---|---|---|---|
| ollaya-dev/kev | Paquete ONNX de decision para el runtime Ollaya | Aproximadamente 0,8B (segun etiqueta) | No disponible | Apache-2.0 | ONNX (sin pesos) | Paridad con upstream; sin benchmarks |
| jaredpalmer/kev-0.8b | Upstream del adaptador y la cabeza pointer | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | Es el modelo de referencia de la verificacion de paridad |
| Qwen/Qwen3.5-0.8B-Base | Modelo base sobre el que se construye | 0,8B (segun nomenclatura) | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de decision, no generativo: no produce texto libre ni mantiene conversaciones; su salida es una decision sobre opciones predefinidas.
- Sin datos de sesgo: la model card no publica evaluaciones de sesgo, equidad ni analisis por subgrupos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de decision incorrecta o mal calibrada cuando la entrada queda fuera de la distribucion con la que se ajustaron las temperaturas.
- Idiomas soportados no declarados: no hay garantia documentada de comportamiento fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto no declarada: el layout de secuencia esta fijado en decision.json, por lo que entradas mas largas de lo previsto pueden requerir recorte o ser rechazadas.
- El repositorio no contiene pesos: cualquier uso depende de `ollaya pull` y de la disponibilidad de los repositorios upstream en los commits fijados.
- Dependencia fuerte de la cadena de herramientas Ollaya (runtime Rust y API TypeSafe); no se documentan alternativas de despliegue estandar.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.
- Los unicos resultados de rendimiento son de paridad con el upstream, no de calidad de decision sobre datos abiertos.
- Licencia Apache-2.0, que permite uso comercial; conviene verificar igualmente la licencia de los pesos upstream descargados por separado, no detallada en la informacion disponible.
- Las fechas de creacion y actualizacion del repositorio (2026-09-25) resultan anomalas respecto a la fecha de consulta y conviene tratarlas con cautela como metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ollaya-dev/kev
- Repositorio de Ollaya: https://github.com/ollaya-dev/ollaya
- Modelo upstream con adaptador y cabeza pointer: https://huggingface.co/jaredpalmer/kev-0.8b
- Commit fijado del upstream kev: https://huggingface.co/jaredpalmer/kev-0.8b/tree/54f4f8777356cd5bbbb6c6919c657f26e6f2f6d8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Commit fijado del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/tree/dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos no guardan relacion con la ficha).
