# midium-ai/decider-4b-dwq-4bit

## Resumen

Decider-4b DWQ 4-bit es una compilacion cuantizada en 4 bits para MLX de Mapika/decider-4b, publicada por midium-ai como el modelo de decision que ejecuta en dispositivo la plataforma Midium. No es un modelo generativo: recibe un estado (un mensaje, un documento, una respuesta) junto con una pregunta tipada y una lista explicita de opciones, y devuelve en una sola pasada forward una probabilidad por cada opcion. El autor lo describe como un modelo de "System One": sin decodificacion autoregresiva, sin parseo y sin respuestas fuera del conjunto de opciones definido.

El modelo cuenta con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) en una arquitectura densa derivada de Qwen/Qwen3.5-4B-Base, y ocupa 2,4 GB en disco frente a los 8,4 GB de la version original en BF16. La cuantizacion se ha realizado con DWQ (distilled weight quantization) de `mlx_lm` a 4 bits y grupo de tamano 64, destilando escalas y sesgos contra las salidas del modelo BF16 sobre 2.048 muestras de calibracion.

Su relevancia actual esta en el nicho de los clasificadores de decision para agentes: enrutado de consultas, verificacion de respuestas, seleccion de herramientas y eleccion de modelo, tareas que en produccion suelen resolverse con prompts a un LLM grande y que aqui se resuelven con 52 ms de latencia y 3,4 GB de pico de memoria en un Apple M5 Max. La licencia Apache 2.0 y el hecho de que se ejecute en dispositivo lo hacen atractivo para despliegues con requisitos de privacidad o de coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-4B-Base (config de texto `qwen3_5_text`, cargada via el modulo `qwen3_5` de `mlx_lm`) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit DWQ (distilled weight quantization), grupo de tamano 64; el modelo card compara con 4-bit afín (affine, grupo 64) y con BF16 |
| Idiomas soportados | en (ingles); el autor evalua un conjunto de enrutado generado en 16 idiomas, pero la ficha declara unicamente `en` |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); no se publican GGUF ni pesos para CUDA |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de unos 4,2 B de parametros, heredado de Mapika/decider-4b (revision `eb5fbdf`, v2.1), que a su vez se construyo sobre Qwen/Qwen3.5-4B-Base. El checkpoint incluye una configuracion de solo texto (`qwen3_5_text`) que requiere forzar `model_config={"model_type": "qwen3_5"}` al cargar con `mlx_lm`. No es un modelo generativo: la respuesta se obtiene leyendo los logits en la posicion `Answer: (` y aplicando softmax sobre las letras de las opciones, con temperaturas por tipo de pregunta que se conservan intactas respecto al original (1,11 para preguntas de eleccion, 1,56 para si/no y 1,287 para preguntas de puntuacion).

El proceso de cuantizacion fue DWQ de `mlx_lm`: pesos a 4 bits con grupo de 64, destilando las escalas y los sesgos de cuantizacion contra las salidas del modelo BF16. La calibracion uso 2.048 muestras (preguntas de MMLU-Pro en el formato de prompt propio de Decider, terminadas en la letra de respuesta, mas WikiText), de 513 tokens cada una, con learning rate 1e-6 y semilla 123; la perdida de validacion final fue 0,011. El autor indica que DWQ recupera aproximadamente la mitad de lo que pierde la cuantizacion afín de 4 bits, con el mismo tamano en disco, y se mantiene a cerca de un punto del modelo original en la mayoria de conjuntos. No se mencionan fases de RLHF ni DPO en la informacion disponible.

## Capacidades

- Clasificacion de decision por eleccion multiple: devuelve una probabilidad por opcion definida por el usuario en una sola pasada forward, sin decodificacion ni parseo.
- Enrutado de origen de informacion: decide si una respuesta debe salir del vault corporativo, de conocimiento general, de la web o de la propia conversacion.
- Verificacion de respuestas: clasifica si una respuesta concreta respondio a la pregunta, si debe abstenerse o si debe pedir aclaracion.
- Seleccion de herramienta (tool routing): determina si una peticion necesita una herramienta concreta; evaluado con 3.564 preguntas por herramienta y 2.700 preguntas duras.
- Enrutado de modelo: decide si una consulta requiere un modelo rapido, de razonamiento, de codigo o multimodal.
- Evaluacion de riesgo de accion: clasifica acciones en riesgo bajo, medio o alto, util como guardarraíl previo a la ejecucion.
- Preguntas de tipo si/no y de puntuacion por niveles aislados, con temperaturas especificas por tipo.
- Capacidad multilingue parcial: el conjunto de enrutado generado en 16 idiomas alcanza 95,6% de acierto, aunque la ficha declara solo ingles.
- No soporta generacion de texto, tool calling generativo, agentes multi-paso ni modos de razonamiento extendido: su salida esta acotada al conjunto de opciones.

## Casos de uso

- Enrutado de consultas en asistentes corporativos: dado un mensaje de usuario, el modelo decide en 52 ms si la respuesta debe buscarse en documentos internos, en conocimiento general, en la web o resolverse conversacionalmente. Su 92,9%-94,5% de acierto en los conjuntos de enrutado lo hace viable como primera etapa de un pipeline RAG.
- Verificacion de respuestas en pipelines RAG: antes de devolver al usuario la salida de un LLM grande, se consulta al decider si la respuesta realmente contesta a la pregunta, si conviene abstenerse o si hay que pedir aclaracion (96,1%-98,0% en los conjuntos de reply check). Evita respuestas vacias o fuera de alcance con un coste de memoria de 3,4 GB.
- Seleccion de herramienta en agentes: el modelo evalua si una peticion requiere una herramienta concreta (96,2% en 3.564 preguntas por herramienta). Se integraria como paso previo al despacho de funciones, reduciendo llamadas innecesarias a APIs externas.
- Cascada de modelos por coste: el decider clasifica si la consulta es rapida, de razonamiento, de codigo o de contenido multimedia (95,8%-97,3%) y enruta al modelo mas barato capaz de resolverla, sin gastar tokens de un modelo de razonamiento en peticiones triviales.
- Guardarraíl de acciones de riesgo: clasificar una accion propuesta por un agente como riesgo bajo, medio o alto (77,8%-81,7%) permite exigir confirmacion humana antes de ejecutar operaciones sensibles como enviar correos o modificar datos.
- Inferencia en dispositivo con datos sensibles: al ejecutarse con MLX sobre Apple Silicon y ocupar 2,4 GB en disco, puede correr localmente en un portatil sin enviar contenido del usuario a un servicio externo, lo que resulta adecuado en entornos con requisitos de privacidad estrictos.
- Moderacion previa y encaminamiento a humano: decidir si un mensaje debe resolverse automaticamente o derivarse a soporte, usando la probabilidad de la opcion correspondiente como umbral calibrado sobre datos propios.
- Etiquetado de bajo coste en lotes: al no generar texto, puede procesar grandes volumenes de pares contexto-pregunta como clasificador, con 52 ms por pregunta en un M5 Max.

## Benchmarks y rendimiento

Resultados publicados en la model card. Cada conjunto se evaluo zero-shot con el mismo arnes para todas las compilaciones; ninguno se uso para calibracion.

| Tarea (n) | Baseline mayoritaria | BF16 | 4-bit afín | DWQ 4-bit |
|---|---|---|---|---|
| Routing: vault / general / web / chat (140) | 42,9% | 95,0% | 92,9% | 92,9% |
| Routing, held-out (401) | 45,1% | 95,3% | 92,0% | 94,5% |
| Routing, hard (155) | 49,7% | 82,6% | 81,9% | 81,9% |
| Routing, generado en 16 idiomas (1.168) | 25,9% | 96,0% | 93,0% | 95,6% |
| Reply check: answered / abstained / clarify (180) | 44,4% | 96,1% | 96,1% | 96,1% |
| Reply check, held-out (400) | 69,8% | 97,8% | 95,5% | 98,0% |
| Reply check, hard (150) | 53,3% | 86,7% | 89,3% | 90,0% |
| Reply check, generado (833) | 34,8% | 96,6% | 93,3% | 95,9% |
| Action risk: low / medium / high (153) | 36,0% | 77,8% | 81,7% | 77,8% |
| Tool needed, por herramienta (3.564) | 95,3% | 97,3% | 96,2% | 96,2% |
| Tool needed, hard (2.700) | 96,5% | 97,0% | 96,7% | 96,3% |
| Model need: quick / reasoning / code / media, hard (118) | 36,4% | 95,8% | 96,6% | 95,8% |
| Model need, generado (1.102) | 27,3% | 97,7% | 95,9% | 97,3% |
| Model need, benchmarks publicos (1.200) | 25,0% | 95,5% | 92,3% | 94,4% |

Metricas agregadas adicionales:

| Metrica | Valor |
|---|---|
| Precision agregada, 14 conjuntos (BF16) | 96,3% |
| Precision agregada, 14 conjuntos (DWQ 4-bit) | 95,5% |
| Precision agregada, 14 conjuntos (4-bit afín) | 94,8% |
| Error de calibracion esperado agregado (BF16) | 0,089 |
| Error de calibracion esperado agregado (DWQ 4-bit) | 0,074 |
| Error de calibracion esperado agregado (4-bit afín) | 0,030 |
| Latencia por pregunta (DWQ 4-bit y 4-bit afín, Apple M5 Max) | ~52 ms |
| Latencia por pregunta (BF16, Apple M5 Max) | ~55 ms |
| Memoria en disco (DWQ 4-bit) | 2,4 GB |
| Pico de memoria (DWQ 4-bit) | 3,4 GB |
| Memoria en disco (BF16 original) | 8,4 GB |
| Pico de memoria (BF16 original) | 9,0 GB |

## Requisitos de hardware

- VRAM o memoria unificada estimada: el autor reporta un pico de memoria de 3,4 GB para esta compilacion (frente a 9,0 GB del BF16). Los pesos ocupan 2,4 GB en disco.
- GPU recomendadas: no disponible. El unico hardware con mediciones publicadas es un Apple M5 Max, sobre el que se miden 52 ms por pregunta para las compilaciones de 4 bits.
- Compatibilidad con GPU de consumo: el checkpoint se distribuye en formato MLX, pensado para Apple Silicon, por lo que no es directamente ejecutable en GPU NVIDIA o AMD sin conversion. No se publican pesos GGUF ni CUDA, y no hay datos oficiales de VRAM para tarjetas como RTX 4090, A100 o H100.
- Opciones de despliegue: `mlx_lm` (libreria declarada en la ficha). Para varios turnos sobre el mismo contexto, el autor recomienda prefiltrar el contexto una vez y puntuar cada pregunta sobre una copia de la cache. No se documenta soporte oficial en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 52 ms por pregunta en las dos compilaciones de 4 bits y 55 ms en BF16, con una pregunta por pasada forward y el prompt prefilado por pregunta. El propio autor senala que la ganancia de DWQ es de memoria, no de velocidad. No se publican cifras de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Precision agregada (14 conjuntos) | Latencia por pregunta (M5 Max) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| midium-ai/decider-4b-dwq-4bit | 4,2 B | 2,4 GB | 95,5% | ~52 ms | apache-2.0 | MLX 4-bit |
| Mapika/decider-4b (BF16 original) | 4,2 B | 8,4 GB | 96,3% | ~55 ms | no disponible en la informacion proporcionada | safetensors |
| decider-4b en 4-bit afín (grupo 64) | 4,2 B | 2,4 GB | 94,8% | ~52 ms | no disponible en la informacion proporcionada | safetensors |
| midium-ai/decider-2b-dwq-4bit | no disponible | 1,06 GB | 92,9% (agregado) | no disponible (el autor indica aproximadamente el doble de latencia para el 4b) | no disponible en la informacion proporcionada | MLX 4-bit |

Segun el autor, el modelo de 4 B supera al de 2 B en 8-16 puntos en enrutado y verificacion de respuestas, a costa de aproximadamente el doble de latencia. Como modelo base subyacente se cita Qwen/Qwen3.5-4B-Base, pero no se ofrecen comparativas de benchmarks con modelos generativos de la misma categoria porque la tarea es distinta.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier tarea que requiera redaccion, resumen o codigo queda fuera de su alcance. Solo devuelve probabilidades sobre las opciones definidas por el usuario.
- Coste de la cuantizacion: las mayores caidas frente a BF16 son de 2 puntos en el conjunto pequeno de enrutado y de aproximadamente 1 punto en las preguntas de herramientas y de necesidad de modelo. El riesgo de accion no varia.
- Calibracion: la compilacion DWQ esta peor calibrada que la de 4 bits afín (error de calibracion esperado agregado de 0,074 frente a 0,030, y ambos mejor que el 0,089 del BF16). Si se van a usar umbrales de decision, el autor recomienda elegirlos sobre datos propios y para la compilacion concreta que se despliegue.
- Idioma: la ficha declara unicamente ingles, aunque el conjunto de enrutado generado en 16 idiomas obtiene 95,6%. No hay garantias documentadas fuera del ingles.
- Riesgo de alucinacion: al no generar texto libre, el riesgo no se manifiesta como contenido inventado, sino como una asignacion de probabilidad incorrecta a una opcion, especialmente en los conjuntos marcados como "hard" (81,9% en enrutado duro y 77,8% en riesgo de accion).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Mapika/decider-4b y Qwen/Qwen3.5-4B-Base pueden imponer condiciones adicionales que no se detallan en la informacion proporcionada.
- Carga no estandar: es necesario forzar `model_config={"model_type": "qwen3_5"}` porque el checkpoint incluye una configuracion de solo texto que `mlx_lm` no resuelve por si sola.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y la fecha de creacion indicada es 2026-10-01.
- Dependencia de hardware: no hay pesos GGUF ni CUDA publicados, lo que limita el despliegue a entornos Apple Silicon con MLX salvo conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/midium-ai/decider-4b-dwq-4bit
- Modelo base: https://huggingface.co/Mapika/decider-4b
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Version reducida comparable: https://huggingface.co/midium-ai/decider-2b-dwq-4bit
- Repositorio upstream de Decider: https://github.com/Mapika/decider
- Libreria MLX: https://github.com/ml-explore/mlx
- Sitio del autor: https://midium.dev
