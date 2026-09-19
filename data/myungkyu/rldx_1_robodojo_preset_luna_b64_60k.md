# Myungkyu/rldx_1_robodojo_preset_luna_b64_60k

## Resumen

rldx_1_robodojo_preset_luna_b64_60k es un modelo de politica de bajo nivel (low-level policy) para robotica, desarrollado por el usuario Myungkyu y publicado en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo base RLWRLD/RLDX-1-PT, un modelo de tipo VLA (Vision-Language-Action) que traduce observaciones visuales, propiocepcion y una instruccion de texto en acciones motoras. El ajuste se ha realizado sobre el dataset Myungkyu/RoboDojo-preset-luna, compuesto por demostraciones con etiquetas densas de subtareas.

El modelo resuelve tareas de manipulacion bimanual en un entorno de sobremesa (tabletop), concretamente 8 tareas de horizonte largo (long-horizon) con 100 demostraciones reales cada una. La arquitectura declarada es RLDX-1-PT, con una longitud de video de 4, tres vistas de camara en vivo (cabeza y munecas izquierda/derecha) y sin ranura de keyframe. El checkpoint corresponde al paso 60000 con batch 64.

Cuenta con aproximadamente 6.912 millones de parametros (6,9 B) en formato safetensors, con un tamano de repositorio de 13,8 GB. No dispone de descargas ni likes en el momento de la consulta, y no se especifica licencia ni idiomas soportados. Su relevancia es acotada a investigacion en robotica y evaluacion de pipelines VLA, no a generacion de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (VLA, vision-language-action; video length 4, tres vistas de camara en vivo, sin keyframe slot) |
| Parametros totales | 6.912.896.320 (~6,9 B) |
| Longitud de contexto | no disponible (el modelo opera con video length 4 y tres vistas de camara) |
| Tipos de cuantizacion | no disponible oficialmente; los pesos en safetensors ocupan 13,8 GB para 6,9 B de parametros, compatible con bf16/fp16 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste | Myungkyu/RoboDojo-preset-luna |
| Entradas | imagenes de cabeza + munecas izquierda/derecha, propiocepcion, texto de subtarea actual (sin entrada de keyframe) |
| Entrenamiento | optimizador batch 64, 60000 pasos, checkpoint final |

## Arquitectura y entrenamiento

La arquitectura es RLDX-1-PT, un modelo VLA heredado del modelo base RLWRLD/RLDX-1-PT. Segun la model card, el modelo procesa imagenes de tres camaras (cabeza y ambas munecas), propiocepcion y el texto de la subtarea actual, y no utiliza ranura de keyframe. La longitud de video es 4. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni el uso de tecnicas como RLHF o DPO.

El ajuste fino se realizo sobre el dataset Myungkyu/RoboDojo-preset-luna, con demostraciones que incorporan etiquetas densas de subtareas. Estas etiquetas de subtarea fueron anotadas por "GPT-5.6 Luna" usando el contexto del preset (Baseline). El entrenamiento empleo un batch de 64 y 60000 pasos, y el artefacto publicado es el checkpoint final. Las configuraciones referencian el backbone y el tokenizer del modelo base por hub id o por ruta local, por lo que es necesario apuntarlas a copias locales antes de cargar el modelo.

## Capacidades

- Politica de bajo nivel para robotica: genera acciones motoras bimanuales para tareas de sobremesa a partir de observaciones visuales, propiocepcion e instruccion de texto.
- Percepcion multi-vista: procesa en paralelo imagenes de cabeza y de las dos munecas.
- Seguimiento de subtareas guiado por texto: recibe la subtarea actual como entrada, lo que permite encadenar tareas de horizonte largo.
- Ejecucion de tareas largas: esta entrenado sobre 8 tareas bimanuales de horizonte largo con 100 demostraciones cada una.
- Integracion con planificador externo: la model card indica que debe evaluarse con el mismo modelo planificador utilizado para anotar las etiquetas de subtarea.
- No se documentan capacidades de generacion de texto general, razonamiento simbolico, codigo, matematicas, vision general, tool calling, function calling, agentes de texto, thinking mode, audio ni capacidades multilingues en la informacion disponible.

## Casos de uso

- Manipulacion bimanual de sobremesa: el modelo actua como politica que traduce observaciones de tres camaras y propiocepcion en acciones de ambos brazos; es adecuado porque se ha ajustado especificamente sobre tareas de este tipo.
- Ejecucion de tareas de horizonte largo por subtareas: al recibir la subtarea actual como texto, permite descomponer una tarea larga en fases y ejecutar cada una con una politica especializada.
- Investigacion en aprendizaje por imitacion: sirve como referencia para reproducir pipelines de ajuste fino sobre un backbone VLA preentrenado con demostraciones reales.
- Evaluacion de planificadores de subtareas: dado que las etiquetas se anotaron con un planificador concreto, el modelo se puede usar para medir el acoplamiento entre planificador y politica de bajo nivel.
- Benchmarking de politicas VLA en robotica de sobremesa: util para comparar variantes de un mismo backbone sobre las 8 tareas de RoboDojo.
- Prototipado de robotica de manipulacion en laboratorio: al estar ajustado sobre demostraciones reales bimanuales, es apropiado para experimentos controlados en un entorno de investigacion con hardware equivalente.
- Base para nuevos ajustes finos: al ser un checkpoint final de un ajuste sobre RLDX-1-PT, puede servir como punto de partida para especializaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de exito por tarea ni comparaciones cuantitativas, y los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (corresponden a paginas de banca en neerlandes sin relacion con robotica).

## Requisitos de hardware

- VRAM estimada (orientativa, a partir del numero de parametros): en bf16/fp16 en torno a 14 GB solo de pesos, mas overhead de activaciones y buffers de imagenes, lo que situa el consumo tipico por encima de 16-18 GB.
- GPU recomendadas: para bf16 sin cuantizar, GPU de 24 GB o mas (RTX 3090/4090, A100 40 GB, H100). Para cuantizacion de 8 bits, bastaria en torno a 8-10 GB; para 4 bits, en torno a 5-6 GB.
- Cabe en GPU de consumo: probablemente si en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB solo con cuantizacion, aunque no se ofrecen pesos cuantizados de forma oficial.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; al tratarse de un modelo VLA de robotica, requiere el codigo de inferencia del backbone RLDX-1-PT y configuraciones que apunten al backbone y tokenizer locales.
- Latencia y throughput estimados: no disponible.
- Nota de carga: las configuraciones referencian el backbone y el tokenizer por hub id o por ruta local del sitio de entrenamiento, por lo que hay que redirigirlas a copias locales antes de cargar el modelo.

## Comparativa con modelos similares

No se dispone de datos verificables de parametros, contexto, rendimiento, licencia ni disponibilidad de modelos alternativos en la informacion proporcionada, por lo que la comparativa no esta disponible. Cualquier comparacion con otras politicas VLA de robotica (por ejemplo, otros ajustes sobre el mismo backbone RLDX-1-PT) deberia hacerse con los datos publicados de cada modelo, que no se incluyen aqui.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica licencia, por lo que el uso comercial no esta garantizado y debe consultarse con el autor.
- Idiomas no disponibles: no se declara que idiomas acepta como entrada de texto para las subtareas.
- Ambito muy restringido: esta ajustado a 8 tareas bimanuales de sobremesa con 100 demostraciones cada una; su generalizacion fuera de ese dominio no esta demostrada.
- Dependencia de un planificador concreto: las etiquetas de subtarea se anotaron con un planificador concreto ("GPT-5.6 Luna" con contexto de preset), y la model card recomienda evaluarlo con el mismo planificador; usar otro puede degradar el comportamiento.
- Riesgo de alucinacion y de acciones incorrectas: como politica de robotica, una accion erronea puede causar dano fisico o material; requiere validacion y limites de seguridad.
- Sin benchmarks publicados: no hay tasas de exito ni metricas reproducibles en la informacion disponible.
- Configuracion no autocontenida: hay que redirigir el backbone y el tokenizer a copias locales, lo que anade pasos de integracion y posibles errores.
- Sesgos: no hay informacion sobre sesgos de comportamiento, pero al entrenarse con demostraciones reales de un entorno concreto puede reproducir las particularidades de ese entorno.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx_1_robodojo_preset_luna_b64_60k
- Dataset de ajuste: https://huggingface.co/datasets/Myungkyu/RoboDojo-preset-luna
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Resultados de busqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a paginas de banca en neerlandes sin relacion con el modelo).
- Paper, blog o repositorio adicionales: no disponibles.
