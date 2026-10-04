# ryugyosoft/Qwen3.5-9B-nf4-onw

## Resumen

ryugyosoft/Qwen3.5-9B-nf4-onw es una version cuantizada en NF4 del modelo Qwen/Qwen3.5-9B, reconvertida especificamente para el motor de inferencia onw, orientado a ejecutar modelos sobre la NPU de Intel en ordenadores con Lunar Lake (Core Ultra serie 2, NPU 4000) o posteriores. No es un modelo nuevo ni un fine-tuning: es una reempaquetado de pesos en formato OpenVINO IR con cuantizacion NF4 (NormalFloat4) por canal, pensado para que el calculo encaje en el hardware de la NPU y no en CPU o GPU.

El problema que resuelve es de eficiencia en un escenario muy concreto: los modelos de 9B en 4 bits de grupo 128 funcionan en NPU Intel, pero con un coste de memoria y latencia de prompt alto. La version NF4 declara, en un equipo Lunar Lake con 16 GB de memoria, una velocidad de generacion de 9,4-9,5 tok/s frente a 7,1 tok/s de la version estandar, una reduccion del tiempo de procesamiento de prompt de unos 980 ms a unos 420 ms para ~28 tokens, y un incremento de memoria del sistema de ~5,1 GB frente a ~6,6 GB.

Es relevante porque demuestra un patron de cuantizacion alternativo (NF4 por canal, recomendado por Intel para NPU) aplicado a un modelo multimodal con soporte declarado de tool calling, modo de razonamiento e imagenes, y porque acota con claridad el hardware compatible: NF4 solo se calcula en NPU 4 y posteriores, por lo que no arranca en Meteor Lake ni Arrow Lake (NPU 3720). El repo ocupa 5,5 GB y la descarga declarada es de 5,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el tag `gated-deltanet` sugiere un transformer hibrido con capas Gated DeltaNet, sin confirmacion en la model card |
| Parametros totales | 9B indicados en el nombre del modelo base (Qwen/Qwen3.5-9B); no confirmado en la informacion proporcionada |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 por canal en los pesos de bloque (tipo `nf4` de OpenVINO, esquema Constant -> Convert -> Multiply de NNCF); INT8 en la capa de salida; INT4 en los embeddings (referenciados en host); INT8 en el encoder de imagen |
| Idiomas soportados | Japones (ja) e ingles (en) segun la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`library_name: openvino`); repo de 5,5 GB, descarga declarada de 5,2 GB |
| Pipeline | image-text-to-text |
| Hardware objetivo | NPU Intel de Lunar Lake (Core Ultra serie 2, NPU 4000) o posterior |
| Motor de ejecucion | onw, version 1.1.1 o superior |

## Arquitectura y entrenamiento

El modelo es una conversion de pesos, no un entrenamiento: la propia model card indica explicitamente que no se ha entrenado y que los pesos se han recuantizado y reconstruido a partir del modelo original. Los pesos de bloque usan NF4 (NormalFloat4), un esquema de 4 bits con 16 niveles distribuidos siguiendo la forma de una normal, lo que aproxima mejor la distribucion real de los pesos de un LLM que una cuantizacion uniforme. En esta version la escala es unica por fila (channel-wise), que es la forma que Intel recomienda para NPU porque reduce el numero de multiplicadores necesarios por operacion. El resto de componentes mantiene el esquema de la version estandar: capa de salida en INT8, embeddings en INT4 consultados desde el host y encoder de imagen en INT8.

Sobre la arquitectura del modelo base (Qwen3.5-9B) no hay informacion en los datos proporcionados: no se detallan numero de capas, dimension oculta, mecanismo de atencion, composicion del dataset de entrenamiento, numero de tokens ni si hubo fases de RLHF o DPO. El unico indicio disponible es el tag `gated-deltanet` en el repo, que apunta a la presencia de capas Gated DeltaNet (una familia de atencion lineal con estado recurrente), pero no se confirma en el texto de la model card. Lo que si queda claro por el pipeline declarado es que el modelo es multimodal entrada imagen-texto, con soporte de modo de razonamiento (thinking) y de llamada a herramientas segun las instrucciones de uso.

## Capacidades

- Generacion de texto conversacional multi-turno en japones e ingles.
- Entrada de imagenes y texto (pipeline `image-text-to-text`), con encoder de imagen en INT8.
- Modo de razonamiento (thinking) activable, con un comportamiento declarado casi identico al de la version estandar en ese modo (358/400 tokens coincidentes en la prueba con el original).
- Llamada a herramientas (tool calling) y function calling, segun las instrucciones de uso de la model card.
- Uso como servidor local mediante `onw serve <carpeta>`, con API accesible desde la pestana de servidor del motor onw.
- Ejecucion completamente local en la NPU del equipo, sin necesidad de GPU ni de conexion a servicios externos.
- No se documentan capacidades de audio, vision avanzada (mas alla de imagen-texto) ni otros idiomas distintos de japones e ingles.

## Casos de uso

- Asistente conversacional local en portatiles Copilot+ con Lunar Lake: el modelo se ejecuta sobre la NPU, deja la CPU y la GPU libres para otras tareas y consume un incremento de memoria del sistema de unos 5,1 GB, lo que permite mantener un asistente permanente en un equipo de 16 GB.
- Analisis de documentos con imagenes en entornos sin conectividad: al aceptar entrada imagen-texto, se puede usar para extraer informacion de capturas, diagramas o formularios escaneados sin enviar datos a la nube, algo relevante en despachos legales o sanitarios.
- Agentes con tool calling en local: integrado mediante `onw serve`, puede exponerse como endpoint local y conectarse a herramientas internas (lectura de ficheros, consultas a bases de datos ligeras) para automatizar tareas de escritorio.
- Asistente de programacion offline sobre japones e ingles: la prueba de calidad del autor reporta 63/64 tokens coincidentes con el modelo original en generacion de codigo, lo que indica que la cuantizacion apenas degrada ese dominio en respuestas cortas.
- Soporte y traduccion ja-en: al estar entrenado el base para ambos idiomas, encaja en flujos de traduccion y atencion al cliente bilingue con latencia baja de prompt (unos 420 ms para ~28 tokens).
- Razonamiento paso a paso en local con modo thinking: para tareas de analisis o planificacion donde se necesita traza de razonamiento y no se puede usar un servicio externo, con la ventaja de que en modo thinking la coincidencia con el modelo bf16 es maxima (358/400).
- Generacion de resumenes y respuestas largas en portatil: a 9,4-9,5 tok/s, una respuesta de 400 tokens tarda en torno a 42-43 segundos, un ritmo aceptable para uso interactivo no critico y suficiente para procesos por lotes pequenos nocturnos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son los que proporciona el autor para la ejecucion en NPU Lunar Lake (16 GB) y la comparacion de calidad por teacher forcing contra el modelo original en bf16 sobre CPU.

Tabla de rendimiento en Lunar Lake (NPU 4000, 16 GB de memoria):

| Metrica | Version estandar (INT4 grupo 128) | Esta version (NF4) |
|---|---|---|
| Velocidad de generacion | 7,1 tok/s | 9,4-9,5 tok/s (aprox. 30 % mas) |
| Procesamiento de prompt (~28 tokens) | ~980 ms | ~420 ms (aprox. 2,3x mas rapido) |
| Incremento de memoria del sistema tras cargar y responder | ~6,6 GB | ~5,1 GB (aprox. 24 % menos) |
| Tamano de descarga | 5,3 GB | 5,2 GB |
| Primera carga (compilacion para NPU) / posteriores | No disponible | ~15 s a 1 min / ~9 s |

Tabla de calidad frente al modelo original en bf16 sobre CPU (teacher forcing):

| Metrica | Version estandar | Esta version (NF4) |
|---|---|---|
| Coincidencia en 400 tokens (texto japones "日本の四季", thinking off) | 345/400 | 340/400 |
| Coincidencia en 400 tokens con thinking activado | 358/400 | 358/400 |
| Diferencia media de logits entre los 5 mejores candidatos | 1,04 | 1,07 |
| Coincidencia en 64 tokens (japones / ingles / codigo) | 61/61/63 | 62/62/63 |

## Requisitos de hardware

- Hardware obligatorio: NPU Intel de Lunar Lake o posterior (Core Ultra serie 2, NPU 4000). El formato NF4 no se calcula en Meteor Lake ni Arrow Lake (NPU 3720), por lo que el modelo no aparece siquiera en la lista del motor onw en esos equipos.
- Memoria: el autor reporta un incremento de ~5,1 GB en el uso de memoria del sistema en un equipo con 16 GB, tras cargar el modelo y completar una respuesta. No se documenta el minimo absoluto de RAM requerido.
- GPU: no aplica. Es un despliegue exclusivo para NPU Intel; no se menciona soporte en A100, H100, RTX 4090 ni ninguna GPU discreta.
- Almacenamiento: 5,5 GB el repo completo, 5,2 GB la descarga declarada (mas el espacio temporal de compilacion para NPU).
- Opciones de despliegue: motor onw 1.1.1 o superior, mediante interfaz grafica (pestanas Modelo y Servidor) o por linea de comandos con `onw serve <carpeta>` tras `hf download ryugyosoft/Qwen3.5-9B-nf4-onw`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 9,4-9,5 tok/s de generacion y ~420 ms para un prompt de ~28 tokens en Lunar Lake con 16 GB. La primera compilacion para NPU tarda entre 15 segundos y un minuto; las cargas posteriores, unos 9 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Velocidad (Lunar Lake) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ryugyosoft/Qwen3.5-9B-nf4-onw | 9B (segun nombre del base) | No disponible | NF4 por canal + INT8 + INT4 | 9,4-9,5 tok/s | Apache-2.0 | OpenVINO IR para onw |
| ryugyosoft/Qwen3.5-9B-onw | 9B (segun nombre del base) | No disponible | INT4 grupo 128 + INT8 + INT4 | 7,1 tok/s | Apache-2.0 | OpenVINO IR para onw |
| Qwen/Qwen3.5-9B | 9B (segun nombre) | No disponible | bf16 original | No aplicable (referencia en CPU) | No disponible en la informacion proporcionada | Peso original multimodal |

No se dispone de datos de otros modelos comparables en la informacion proporcionada, ni de benchmarks comunes (MMLU, HumanEval, GSM8K) que permitan situar este modelo frente a alternativas de la misma categoria. La comparacion solo puede hacerse dentro de la propia familia de conversiones de ryugyosoft.

## Limitaciones y advertencias

- Compatibilidad de hardware muy restringida: solo funciona en NPU Intel de Lunar Lake (Core Ultra serie 2, NPU 4000) o posterior. No hay soporte para NPU 3720 (Meteor Lake, Arrow Lake), CPU, GPU discreta ni Apple Silicon.
- Dependencia de un motor concreto: requiere onw 1.1.1 o superior. No se documenta compatibilidad con otros runtimes, lo que limita la portabilidad del despliegue.
- No es un modelo entrenado: los pesos son una recuantizacion del modelo base. Cualquier sesgo, alucinacion o limitacion de conocimiento del modelo original se hereda intacta.
- Perdida de precision medible: en la prueba del autor, la coincidencia a 400 tokens baja de 345/400 a 340/400 en modo thinking off, y la diferencia media de logits sube de 1,04 a 1,07. Es una degradacion pequena pero real en generaciones largas.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion; al ser un modelo generativo de 9B, el riesgo persiste y es especialmente relevante en usos con datos factuales o corporativos.
- Idiomas declarados: solo japones e ingles en la model card. No se garantiza un comportamiento correcto en castellano ni en otros idiomas, aunque el modelo base pueda soportarlos.
- Longitud de contexto desconocida: no se especifica en la informacion disponible, lo que impide planificar tareas que dependan de ventanas largas.
- Uso comercial: la licencia Apache-2.0 lo permite, pero al ser un derivado conviene verificar tambien las condiciones del modelo base Qwen/Qwen3.5-9B.
- Madurez: el repositorio registra 0 descargas y 0 likes en los metadatos consultados, con fecha de creacion y ultima actualizacion del 3 de octubre de 2026. No hay evidencia de uso en produccion ni de validacion por terceros.
- Rendimiento medido en un unico equipo: los numeros de velocidad y memoria provienen de un Lunar Lake con 16 GB y pueden variar segun el modelo de portatil, la version de controladores y la carga del sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryugyosoft/Qwen3.5-9B-nf4-onw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Version estandar (INT4 grupo 128): https://huggingface.co/ryugyosoft/Qwen3.5-9B-onw
- Motor onw: https://huggingface.co/ryugyosoft/onw
- Documentacion tecnica de onw: https://huggingface.co/ryugyosoft/onw/blob/main/TECHNICAL.md
- README en ingles de este modelo: README_en.md dentro del repositorio en HuggingFace
