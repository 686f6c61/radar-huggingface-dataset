# johnpattern/safenotes-qwen3-4b-cw-ov

## Resumen

`safenotes-qwen3-4b-cw-ov` es una conversion de formato del modelo `Qwen/Qwen3-4B` de Alibaba Cloud Qwen, publicada por el desarrollador johnpattern bajo el paraguas del proyecto Safenotes (una aplicacion local de transcripcion y resumen de reuniones). El repositorio no contiene un modelo nuevo ni un ajuste fino: es el mismo Qwen3-4B convertido a OpenVINO IR con pesos int4 simetricos en esquema *channel-wise* (group-size -1), un layout que la NPU de Intel necesita para ejecutarse correctamente, ya que el IR int4 *group-wise* publicado por el ecosistema oficial no funciona bien en esa unidad de aceleracion.

La relevancia de esta ficha es acotada y muy concreta: sirve como artefacto de despliegue para inferencia local en hardware Intel (CPU, iGPU y especialmente NPU) mediante OpenVINO, con un peso de repositorio de 2,2 GB y un unico modelo de 2,21 GB en `openvino_model.bin`. No es una release oficial de Qwen y el autor lo declara explicitamente. Para quien necesite ejecutar Qwen3-4B en un portatil con NPU Intel sin GPU dedicada, este formato es directamente utilizable; para cualquier otro caso, conviene acudir al modelo base original.

El modelo hereda las capacidades del Qwen3-4B original (generacion de texto, razonamiento con modo *thinking*, codigo, matematicas y soporte multilingue), pero la conversion esta pensada y compilada por Safenotes para prompts de hasta 4K tokens, lo que condiciona su uso practico. La licencia Apache-2.0 se mantiene sin cambios respecto al repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), convertido a OpenVINO IR con `optimum-cli export openvino --task text-generation-with-past` |
| Parametros totales | 4B (heredados de Qwen/Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el autor indica que Safenotes lo compila para prompts de 4K tokens |
| Tipos de cuantizacion | int4 simetrico *channel-wise* (`--weight-format int4 --sym --ratio 1.0 --group-size -1`); tokenizer en IR OpenVINO |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingue, pero el repo no declara lista de idiomas) |
| Licencia | Apache-2.0 (fichero LICENSE del repo upstream, sin modificar) |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`), tokenizer/detokenizer en IR (`openvino_tokenizer.*`, `openvino_detokenizer.*`) |
| Tamano del repositorio | 2.220.092.661 bytes (2,2 GB, 7 ficheros) |
| Version de toolchain | optimum-intel / optimum 2.3.0, transformers 5.5.4 |
| Hardware objetivo | Intel NPU (tambien ejecutable en CPU/iGPU via OpenVINO) |
| Modelo base | Qwen/Qwen3-4B, revision `1cfa9a7208912126459214e8b04321603b3df60c` |
| Reentrenamiento | ninguno (solo conversion de formato) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de 4.000 millones de parametros de la familia Qwen3 de Alibaba Cloud, que combina modelos densos y MoE en su gama completa y esta entrenado con un pipeline que incluye preentrenamiento a gran escala seguido de ajuste por instrucciones y tecnicas de alineacion (la model card upstream describe mejoras en razonamiento, seguimiento de instrucciones, capacidades de agente y soporte multilingue, asi como conmutacion entre modo *thinking* y modo directo). El repositorio que nos ocupa no aporta informacion sobre volumen de tokens, composicion del dataset ni detalles de RLHF/DPO; esos datos corresponden al modelo original y no se reproducen aqui.

La innovacion tecnica de esta publicacion es puramente de despliegue: la conversion a OpenVINO IR con cuantizacion int4 simetrica *channel-wise* (un unico grupo por canal, `--group-size -1`) en lugar del esquema *group-wise* habitual. Segun el autor, el IR int4 *group-wise* publicado no se ejecuta correctamente en la NPU de Intel, y este layout alternativo resuelve ese problema. La exportacion usa `--task text-generation-with-past` (cache KV incluida) y convierte tambien el tokenizer y el detokenizer a IR. No hay decodificacion especulativa, atencion lineal ni otras modificaciones arquitectonicas: es el mismo grafo de Qwen3-4B con pesos comprimidos a 4 bits.

## Capacidades

- Generacion de texto y resumen: uso principal declarado por Safenotes (resumenes de reuniones a partir de transcripciones).
- Razonamiento en modo *thinking* y respuesta directa, heredado de Qwen3 (conmutacion entre ambos modos en el modelo original).
- Generacion de codigo y matematicas, segun las capacidades declaradas del modelo base Qwen3-4B.
- Soporte multilingue heredado del modelo base; el repositorio no declara una lista concreta de idiomas.
- Inferencia local completa en el PC del usuario, sin salida de audio ni texto a servicios externos (segun la model card).
- Ejecucion en NPU Intel via OpenVINO, con fallback a CPU/iGPU del mismo runtime.
- No se documenta en este repositorio soporte de *tool calling*, function calling, agentes multi-paso, vision ni audio; estas capacidades, si existen, dependen del modelo base y no estan verificadas en esta conversion.

## Casos de uso

- Resumen de reuniones en local: es el caso disenado por Safenotes. La aplicacion descarga los ficheros de una revision fijada, verifica el sha256 de cada uno y ejecuta el modelo en la NPU para generar resumenes de transcripciones, con prompts compilados para 4K tokens.
- Notetaker offline con requisitos de privacidad: al ejecutarse integramente en el PC del usuario y no enviar audio ni texto fuera, encaja en entornos donde el contenido de las reuniones no puede salir de la maquina (despachos legales, sanidad, administracion publica).
- Despliegue en portatiles con NPU Intel: equipos con Core Ultra y NPU integrada pueden ejecutar el modelo sin GPU dedicada, liberando la CPU y reduciendo consumo energetico frente a inferencia pura en CPU.
- Prototipado de pipelines OpenVINO: sirve como artefacto de referencia para validar que un modelo Qwen3-4B int4 *channel-wise* se compila y ejecuta correctamente en NPU antes de integrarlo en una aplicacion mayor.
- Generacion de texto asistida en aplicaciones de escritorio: cualquier app local que necesite un modelo de 4B para redaccion, reformulacion o respuesta a preguntas sobre documentos de hasta ~4K tokens puede cargar este IR con el runtime de OpenVINO.
- Evaluacion comparativa de cuantizaciones: util para medir la diferencia de calidad y latencia entre int4 *channel-wise* (este repo) e int4 *group-wise* (IR oficial) sobre el mismo modelo base en hardware Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (MMLU, HumanEval, GSM8K u otras) ni de latencia o throughput; solo describe el proceso de conversion y el uso previsto. Cualquier cifra de rendimiento del Qwen3-4B original corresponderia al modelo base y no a esta conversion int4, por lo que no se traslada aqui.

## Requisitos de hardware

- VRAM/espacio en disco: el modelo ocupa 2,21 GB en disco (`openvino_model.bin`); en memoria, la huella es del orden de 2-3 GB para los pesos int4 mas las activaciones y la cache KV, que crece con la longitud de contexto.
- Hardware objetivo: NPU de Intel (el autor indica que esta compilado para una NPU con prompt de 4K tokens). Tambien ejecutable en CPU e iGPU Intel a traves del mismo runtime OpenVINO.
- GPU dedicadas: no se documenta soporte para A100, H100 ni RTX 4090; el artefacto esta orientado a OpenVINO sobre hardware Intel, no a CUDA.
- Consumer GPU: no aplica en el sentido habitual; el equivalente consumer es una NPU Intel integrada (familia Core Ultra) o una iGPU Intel reciente.
- Opciones de despliegue: runtime de OpenVINO (Python/C++), OpenVINO GenAI, y el propio cliente Safenotes. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato IR no es directamente compatible con ellos sin conversion adicional.
- Latencia y throughput: no disponibles. Dependen de la NPU concreta, del numero de tokens de prompt (compilado a 4K) y de la longitud de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| safenotes-qwen3-4b-cw-ov (este repo) | 4B | no disponible (compilado a 4K en Safenotes) | OpenVINO IR int4 channel-wise | Apache-2.0 | Conversion no oficial, orientada a NPU Intel |
| Qwen/Qwen3-4B (base) | 4B | no disponible en la informacion proporcionada | safetensors (upstream) | Apache-2.0 | Modelo original de Alibaba Cloud Qwen; requiere conversion para OpenVINO |
| Qwen/Qwen3-4B-Base | 4B | no disponible en la informacion proporcionada | safetensors (upstream) | no disponible en la informacion proporcionada | Variante base sin ajuste por instrucciones, segun Hugging Face |
| Qwen3-4B en IR int4 group-wise (ecosistema oficial) | 4B | no disponible | OpenVINO IR int4 group-wise | Apache-2.0 | Mencionado por el autor como problemático en NPU; no se dispone de enlace directo en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es una release oficial: el autor declara que Qwen no respalda esta conversion; todos los meritos del modelo corresponden al equipo de Qwen.
- Conversion de formato sin reentrenamiento: la calidad depende integramente del Qwen3-4B original y de la perdida introducida por la cuantizacion int4 *channel-wise*, que no se ha medido en benchmarks publicados.
- Contexto practico limitado: Safenotes compila el modelo para 4K tokens de prompt; no se documenta el contexto maximo soportado por el IR ni su comportamiento mas alla de esa longitud.
- Sin garantias: la model card se distribuye "as is", sin garantia de idoneidad ni de exactitud de las salidas.
- Riesgo de alucinacion: inherente a un modelo de 4B; en resumenes de reuniones puede omitir o inventar detalles, por lo que conviene revision humana en entornos criticos.
- Sesgos: no documentados en este repositorio; los del modelo base Qwen3-4B no se evaluan aqui.
- Dependencia de hardware: el layout int4 *channel-wise* esta pensado para NPU Intel; en otros aceleradores el rendimiento o la correccion pueden diferir.
- Licencia Apache-2.0: permite uso comercial, pero al ser una conversion no oficial conviene mantener la atribucion al modelo base y conservar el fichero LICENSE incluido.
- Verificacion de integridad: el autor publica sha256 por fichero; cualquier descarga debe validarse contra esos hashes antes de su uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/johnpattern/safenotes-qwen3-4b-cw-ov
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Revision concreta del modelo base usada en la conversion: https://huggingface.co/Qwen/Qwen3-4B/tree/1cfa9a7208912126459214e8b04321603b3df60c
- Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Ficha de Qwen3 en Civitai (referencia de la familia Qwen3): https://civitai.com/models/2742977/qwen3
