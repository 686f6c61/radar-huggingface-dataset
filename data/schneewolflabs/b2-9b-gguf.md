# schneewolflabs/B2-9B-GGUF

## Resumen

B2-9B-GGUF es la version cuantizada en formato GGUF del modelo schneewolflabs/B2-9B, publicado por Schneewolf Labs. Se trata de un modelo multimodal de tipo image-text-to-text con 9.197.093.888 parametros (unos 9,2 mil millones) construido sobre Qwen3.5-9B, cuyo comportamiento ha sido redirigido mediante ajuste fino supervisado (SFT) y ORPO para operar como agente que usa herramientas. El objetivo declarado no es aumentar el conocimiento bruto, sino la fiabilidad operativa: seguir el formato nativo de herramientas del harness egirl, terminar la frase despues de razonar, preguntar antes de ejecutar acciones destructivas y declarar honestamente lo que ha verificado.

El modelo se distribuye con cuantizacion Q8_0 y el proyector de vision (mmproj) en f16, identico al de la version B0-9B. Incluye los 15 tensores `mtp.*` (multi-token prediction), lo que habilita decodificacion especulativa con `--spec-type draft-mtp` en llama.cpp. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, por lo que admite entradas de imagen ademas de texto.

Su relevancia actual reside en que ataca un problema concreto de los agentes autonomos: la eliminacion accidental de datos irrecuperables. En la bateria de evaluacion del autor, B2-9B reduce a 0/24 las perdidas de datos irrecuperables en escenarios destructivos retenidos, frente a 8/24 de su predecesor B0-9B y 8/24 de Qwen3.5-9B sin ajustar, manteniendo el 100% de aciertos en eliminaciones explicitas y delimitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B) con torre de vision y cabezas MTP (`mtp.*`) para decodificacion especulativa |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens configurados en el comando de referencia (`-c 32768`); el ajuste LoRA se realizo a 16 000 tokens |
| Tipos de cuantizacion | Q8_0 para el modelo; proyector de vision mmproj en f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 10,7 GB, 775 tensores verificados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con torre de vision, y se ajusta mediante LoRA con rango 32 y alpha 64 usando el framework Merlina. El entrenamiento consta de dos etapas sobre B0-9B como punto de partida: una SFT de una epoca sobre 3 329 filas por turno de asistente (escalera agentica, comportamiento Vorsicht o de precaucion, modo thinking activado y chat), y una etapa ORPO de dos epocas sobre 304 pares de puntos de decision centrados en precaucion y escalera agentica. La SFT uso una tasa de aprendizaje de 1e-4 y la ORPO de 8e-6 con beta 0,1, recortando los pares en el primer turno de asistente divergente para que la preferencia no cubriese nunca la salida de herramientas.

Una decision tecnica destacable es el renderizado del dataset: en lugar del aplanado multi-turno de Merlina, que habria desordenado las trayectorias de herramientas, se proceso una fila por turno de asistente con la plantilla nativa del propio modelo. No se aplico la etapa Stimme (voz estilistica) presente en iteraciones anteriores porque, apilada encima, erosionaba el nuevo comportamiento de preguntar antes de actuar a fuerza 0,5 y no recuperaba voz alguna a 0,25. Ambos adaptadores se fusionaron directamente en los pesos, dejando los 15 tensores `mtp.*` y la torre de vision byte a byte identicos a B0-9B.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo thinking conmutable.
- Uso de herramientas en el formato nativo de Qwen3.5 (`<function=...>`), que es el que envia el harness egirl.
- Comportamiento agentico multi-paso: escalera de tareas con multiples llamadas encadenadas (261 round trips registrados en la evaluacion del propio harness, con una unica llamada erronea).
- Percepcion de imagenes: pipeline image-text-to-text con proyector de vision mmproj f16.
- Capacidad de preguntar antes de ejecutar operaciones destructivas e identificar datos irrecuperables.
- Eliminacion delidada y con alcance explicito de ficheros o recursos, ejecutada de forma exacta en 8/8 escenarios retenidos.
- Declaracion honesta sobre verificaciones: ante la pregunta "did you actually rerun the tests?", responde con honestidad en ambos modos de razonamiento.
- Decodificacion especulativa habilitada mediante los tensores MTP (`--spec-type draft-mtp`, `--spec-draft-n-max 4`).
- No se declara soporte multilingue explicito ni capacidades de audio.

## Casos de uso

- Agente de operador de sistema en terminal: integrado en el harness egirl, el modelo traduce instrucciones en lenguaje natural a secuencias de herramientas (`read_file`, `git_diff`, `git_status`, etc.) y ejecuta tareas de mantenimiento de repositorios con contexto de 32 768 tokens.
- Automatizacion con guardas sobre operaciones irreversibles: en pipelines que borran ramas, limpian arboles de trabajo o purgan ficheros, el modelo pregunta antes de actuar y evita destruir la unica copia de un dato, como demuestra el 0/24 en perdidas irrecuperables sobre escenarios retenidos.
- Despliegue local en estaciones de trabajo con GPU de consumo: su cuantizacion Q8_0 y su tamano de 9,2 B permiten servirlo con llama-server sin infraestructura en la nube, manteniendo los datos de codigo dentro de la organizacion.
- Revision de codigo y diagnostico de diferencias: el modelo usa herramientas de Git para inspeccionar cambios y responder sobre ellos, aunque con confusiones conocidas entre `cat` y `read_file` o entre `git_status` y `git_diff`.
- Asistente con entrada visual: al ser image-text-to-text, puede analizar capturas de pantalla o diagramas junto a instrucciones textuales, por ejemplo para interpretar una interfaz o un grafo de dependencias.
- Agentes conversacionales de baja huella estilistica: con una tasa de postura (opiniones) del 0% y una distancia de prosa de 0,804, encaja en productos donde se busca un tono neutro y plano en lugar de una voz marcada.
- Servicio de inferencia con decodificacion especulativa: el uso de los tensores MTP permite acelerar la generacion en despliegues con llama.cpp, util en entornos de baja latencia con un unico usuario por instancia (`-np 1`).
- Evaluacion de seguridad en agentes: sirve como referencia para medir asimetria de seguridad (2/2 rechazos ante dano real) y censura estricta (27/29) en investigacion sobre comportamiento de modelos agenticos.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. Todas las columnas se evaluan con el mismo harness (egirl en main, Q8_0, una muestra por celda). La bateria son 28 escenarios de operador con verificadores de sandbox a nivel de byte; el conjunto retenido son 8 escenarios de peticiones destructivas sobre fixtures y redacciones que no aparecen en ningun turno de entrenamiento, por 2 modos de razonamiento y 2 muestras.

| Metrica | Qwen3.5-9B (vanilla) | B0-9B | B2-9B |
|---|---|---|---|
| Respuesta vacia tras resultado de herramienta, thinking on | 14/14 | 14/14 | 0/14 |
| Comprobaciones de sandbox de la bateria, thinking off / on | 7/8 / 5/8 | 5/8 / 5/8 | 8/8 / 6/8 |
| Peticiones destructivas retenidas: destruyo algo en el turno 1 | 16/24 | 14/24 | 5/24 |
| Retenido: perdida de datos irremplazables (datos crudos, borrador, unica copia) | 8/24 | 8/24 | 0/24 |
| Retenido: eliminacion explicita y delimitada hecha exactamente | 8/8 | 8/8 | 8/8 |
| "did you actually rerun the tests?" | no disponible | no disponible | honesto en ambos modos |
| Banco de herramientas de 47 casos de egirl | no disponible | 46/47 | 42/47 |
| Censura (estricta, muestra unica) | no disponible | 29/29 | 27/29 |
| Asimetria de seguridad (rechaza dano real) | no disponible | 2/2 | 2/2 |
| hembench | no disponible | 53,6 % | 55,1 % |
| ARC / perplejidad wiki-clean | no disponible | 61,2 / 12,24 | 61,2 / 12,33 |
| Tasa de postura (tiene opiniones) | no disponible | 16,7 % | 0 % |
| Distancia de prosa frente a ficcion contemporanea (menor = mas cercano) | no disponible | 0,580 | 0,804 |

Notas del autor sobre los resultados: tres de los cinco fallos del banco de 47 casos corresponden al dialecto JSON antiguo del banco, donde B2 escribe `{"name":code_agent,` sin comillas en el nombre; B2 se entreno unicamente con el formato nativo `<function=...>` de Qwen3.5. Los otros dos son eleccion de herramienta (`cat` en lugar de `read_file`, `git_status` en lugar de `git_diff`). En el scorer estricto de censura, un rechazo se marca como fallo por estar formulado fuera de su lista de marcadores ("This violates safety guidelines... prohibited"), aunque ambas peticiones daninas se rechazan.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 10,7 GB, de los cuales la mayor parte corresponde al peso Q8_0 (aproximadamente 9,8 GB) mas el proyector de vision f16. Se recomienda un minimo de 12 GB de VRAM para cargar modelo y mmproj con margen para el contexto.
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o RTX A6000 (24 GB) para uso de un solo usuario con contexto de 32 768 tokens.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) y, de forma ajustada y con contexto reducido, en tarjetas de 16 GB como la RTX 4060 Ti o la RTX 4080. Por debajo de 12 GB seria necesario recurrir a cuantizaciones menores, no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp y su servidor `llama-server`, que es el camino documentado por el autor con los flags `-ngl 99 -c 32768 --jinja -fa on -np 1 --spec-type draft-mtp --spec-draft-n-max 4` y `--mmproj` para vision. Al ser GGUF, tambien es compatible con Ollama y otros runners basados en llama.cpp. No se documenta soporte para vLLM o TGI en esta ficha.
- Latencia y throughput estimados: no disponibles. El autor solo indica el uso de decodificacion especulativa con hasta 4 tokens de borrador para acelerar la generacion.

## Comparativa con modelos similares

Los unicos modelos comparables para los que hay datos en la informacion proporcionada son el propio Qwen3.5-9B sin ajustar y el predecesor B0-9B, que comparten arquitectura base y tamano.

| Modelo | Parametros | Contexto | Tasa de postura | Perdida de datos irrecuperables (retenido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| B2-9B (este modelo, GGUF) | 9,2 B | 32 768 tokens | 0 % | 0/24 | Apache 2.0 | HuggingFace, formato GGUF Q8_0 |
| B0-9B | 9,2 B | 32 768 tokens (referencia) | 16,7 % | 8/24 | no disponible | HuggingFace |
| Qwen3.5-9B (vanilla) | 9,2 B | no disponible | no disponible | 8/24 | no disponible | distribuido por Alibaba |

Frente a Qwen3.5-9B, B2-9B pierde capacidad de generar respuestas vacias tras una herramienta (0/14 frente a 14/14) y mejora la seguridad destructiva (5/24 frente a 16/24 en destruccion en el turno 1). Frente a B0-9B, mejora en seguridad destructiva y en hembench (55,1 % frente a 53,6 %), pero empeora en el banco de herramientas de 47 casos (42/47 frente a 46/47) y pierde por completo la expresion de opiniones. Los pesos base de Qwen3.5-9B estan sujetos a la licencia de su distribuidor original, no detallada en esta informacion.

## Limitaciones y advertencias

- Confia ocasionalmente en el docstring antes que en el codigo que describe, lo que puede llevar a conclusiones erroneas sobre el comportamiento real de una funcion.
- Con el modo thinking activado puede convencerse a si mismo de ejecutar un borrado: el autor cita el caso de argumentar "clean working tree, nothing to preserve" en un repositorio sin remoto. Recomienda mantener activas las guardas del harness para comandos destructivos.
- Regresion en el uso de herramientas: cinco fallos en el banco de 47 casos, tres por no entrecomillar el nombre de la funcion en el dialecto JSON antiguo y dos por elegir una herramienta distinta de la esperada (`cat` por `read_file`, `git_status` por `git_diff`). El modelo solo esta entrenado para el formato nativo `<function=...>` de Qwen3.5.
- Estilo neutro hasta el extremo: tasa de postura del 0 % y distancia de prosa de 0,804 frente a 0,580 de B0-9B. No es adecuado si se busca una voz con personalidad o matices de opinion.
- Perplejidad ligeramente superior a B0-9B en wiki-clean (12,33 frente a 12,24) y mismo ARC (61,2), lo que indica que la mejora es de comportamiento agentico, no de conocimiento general.
- La censura estricta baja de 29/29 a 27/29, aunque el autor atribuye uno de los fallos a la formulacion del rechazo y no a una aprobacion del contenido danino.
- No se declaran idiomas soportados, por lo que el comportamiento multilingue no esta caracterizado.
- La licencia Apache 2.0 del repositorio no necesariamente cubre los pesos base de Qwen3.5-9B sobre los que se construye; conviene verificar las condiciones del modelo original antes de un uso comercial.
- Se recomienda desplegar con `-np 1` (una sola peticion concurrente) segun el ejemplo del autor; no hay datos de rendimiento con batching.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/schneewolflabs/B2-9B-GGUF
- Modelo base: https://huggingface.co/schneewolflabs/B2-9B
- Dataset Geselle: https://huggingface.co/datasets/schneewolflabs/Geselle
- Dataset Vorsicht-DPO: https://huggingface.co/datasets/schneewolflabs/Vorsicht-DPO
- Harness egirl: https://github.com/Schneewolf-Labs/egirl
- Framework de entrenamiento Merlina: https://github.com/Schneewolf-Labs/Merlina
