# konizquants/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a tareas de programacion y flujos de trabajo agenticos, desarrollado por Moonshot AI como evolucion de Kimi K2.6. Con 1,03 billones de parametros totales (1.026.879.376.368 segun los pesos en safetensors) y 32.000 millones de parametros activos por token, el modelo activa unicamente 8 de sus 384 expertos mas un experto compartido en cada paso, lo que mantiene un coste de computo por token comparable al de un modelo denso de tamano medio mientras conserva la capacidad de un modelo de escala frontera.

La ficha que nos ocupa corresponde al repositorio `konizquants/Kimi-K2.7-Code`, una publicacion de terceros que redistribuye los pesos del modelo original de Moonshot AI bajo una licencia MIT modificada. El repositorio ocupa 595,2 GB y emplea el formato safetensors con compresion via `compressed-tensors`, ademas de incluir codigo personalizado (`custom_code`) y una arquitectura identificada en los tags como `kimi_k25`. El pipeline declarado es `image-text-to-text`, coherente con la presencia de un codificador visual MoonViT de 400 millones de parametros.

Su relevancia actual reside en tres ejes: una ventana de contexto de 256.000 tokens que permite razonar sobre bases de codigo extensas, un enfoque explicitamente agentico (tool calling, MCP, tareas de horizonte largo) y una reduccion de aproximadamente el 30% en tokens de razonamiento respecto a K2.6, lo que abarata el coste por tarea en produccion. Los benchmarks publicados por el autor lo situan por detras de GPT-5.5 y Claude Opus 4.8 en las categorias medidas, pero con una mejora sustancial frente a K2.6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion MLA |
| Parametros totales | 1.026.879.376.368 (~1,03 B) |
| Parametros activos | 32.000 millones (32B) |
| Longitud de contexto | 256K tokens (262.144 en evaluacion) |
| Tipos de cuantizacion | `compressed-tensors` (formato comprimido); no se detallan esquemas concretos (FP8, INT4, etc.) en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT modificada (`modified-mit`, `license: other`) |
| Formato de pesos | safetensors |
| Numero de capas | 61 (1 capa densa) |
| Dimension de atencion | 7168 |
| Dimension MoE por experto | 2048 |
| Cabezas de atencion | 64 |
| Numero de expertos | 384 (8 seleccionados por token + 1 compartido) |
| Tamano de vocabulario | 160K |
| Funcion de activacion | SwiGLU |
| Codificador visual | MoonViT, 400 millones de parametros |
| Tamano del repositorio | 595,2 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer dispersa de tipo MoE con 61 capas (una de ellas densa) y atencion Multi-head Latent Attention (MLA), el mecanismo introducido por DeepSeek que comprime las claves y valores en un espacio latente de baja dimension para reducir drasticamente el coste de la cache KV durante la decodificacion. Esta eleccion es especialmente relevante en un modelo con 256K tokens de contexto: sin MLA, la cache KV a esa longitud seria prohibitiva. Cada capa MoE contiene 384 expertos con dimension oculta de 2048, de los cuales se activan 8 por token, mas un experto compartido que se aplica siempre; el vocabulario es de 160.000 entradas y la no linealidad es SwiGLU.

El modelo incorpora un codificador visual MoonViT de 400 millones de parametros, lo que habilita entradas multimodales de imagen y texto. Segun la model card, Kimi K2.7 Code se construye sobre Kimi K2.6 con un enfasis explicito en tareas de codigo de horizonte largo ("long-horizon coding") y en la eficiencia de tokens: se declara una reduccion de aproximadamente el 30% en tokens de razonamiento en comparacion con K2.6. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento posteriores al preentrenamiento.

## Capacidades

- Generacion de codigo y resolucion de tareas de ingenieria de software de extremo a extremo, con enfasis declarado en tareas de horizonte largo y flujos de trabajo de produccion.
- Razonamiento con modo "thinking" (thinking mode) habilitado, medido en evaluacion con temperatura 1.0 y top-p 0.95.
- Capacidades agenticas: ejecucion multi-paso, uso de herramientas y protocolos de contexto para modelos (MCP), segun los benchmarks MCP Atlas y MCP Mark Verified.
- Tool calling / function calling, inferido de su integracion con entornos agenticos como Kimi Code CLI y de las evaluaciones MCP.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias al codificador MoonViT de 400M de parametros.
- Capacidades de extraccion de caracteristicas (`feature-extraction` en los tags).
- Uso conversacional multi-turno.
- Eficiencia de razonamiento: alrededor de un 30% menos de tokens de pensamiento que Kimi K2.6 para tareas equivalentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Refactorizacion de bases de code extensas: con 256K tokens de contexto, el modelo puede ingerir varios modulos, sus tests y su documentacion en una sola pasada y proponer cambios coherentes entre ficheros, algo inviable en modelos con ventanas de 32K o 128K.
- Agentes de resolucion de incidencias en produccion: el modelo esta disenado para tareas de horizonte largo, por lo que encaja en pipelines donde un agente lee logs, reproduce el fallo, localiza la causa en el repositorio y propone un parche, encadenando varias herramientas.
- Asistente de codigo integrado en el IDE o en CLI: soporta modo thinking y tool calling, lo que permite conectarlo a un servidor de herramientas para consultar el arbol de ficheros, ejecutar tests o leer issues.
- Automatizacion de revision de codigo (code review): puede analizar un diff con el contexto completo del repositorio afectado y generar comentarios tecnicos sobre correccion, rendimiento y estilo.
- Migracion de codigo entre lenguajes o frameworks: la model card menciona tareas sobre mas de 10 lenguajes de programacion en su benchmark interno, lo que lo hace util para portar modulos completos preservando semantica.
- Generacion de tests y cobertura: dado un modulo y su especificacion, el modelo puede producir suites de pruebas y, con tool calling, ejecutarlas e iterar sobre los fallos.
- Analisis de documentacion tecnica con imagenes: al aceptar entradas de imagen y texto (MoonViT), puede interpretar diagramas de arquitectura, capturas de dashboards o esquemas de base de datos junto a texto explicativo.
- Agentes MCP en entornos corporativos: los benchmarks MCP Atlas y MCP Mark Verified sugieren que el modelo esta preparado para orquestar herramientas externas expuestas mediante el protocolo MCP, util para asistentes internos con acceso a sistemas corporativos.

## Benchmarks y rendimiento

Resultados publicados en la model card. Condiciones declaradas: Kimi K2.7 Code y K2.6 evaluados con thinking mode activado via Kimi Code CLI, temperatura 1.0, top-p 0.95 y contexto de 262.144 tokens; GPT-5.5 en Codex con modo xhigh y Claude Opus 4.8 en Claude Code con modo xhigh.

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 (codigo) | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench (codigo) | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench (agentico) | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

No se han publicado en la informacion disponible resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K. Todos los datos anteriores proceden de la propia model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,03 billones de parametros, en BF16 se necesitarian aproximadamente 2 TB de memoria solo para pesos. El repositorio ocupa 595,2 GB, lo que implica un formato comprimido (del orden de 4-5 bits por parametro de media); en ese formato el modelo requeriria alrededor de 600 GB de memoria, mas la cache KV y los buffers de activacion. Estas cifras son estimaciones derivadas del recuento de parametros y del tamano del repositorio, no datos publicados por el autor.
- GPU recomendadas: nodos multi-GPU de centros de datos. Para el formato comprimido del repositorio, un nodo de 8 GPU con 80 GB cada una (640 GB) resulta muy ajustado, por lo que lo razonable es 16 GPU H100 80 GB o A100 80 GB, con interconexion NVLink/InfiniBand. GPUs como la H200 (141 GB) reducen el numero de nodos necesarios.
- Cabe en GPU de consumo: no. Ni siquiera en una RTX 4090 (24 GB), RTX 5090 o similares. La cantidad de memoria requerida excede en mas de un orden de magnitud la VRAM de cualquier GPU de consumo actual. Tampoco cabe en configuraciones de 2 o 4 GPU de consumo.
- Opciones de despliegue: por el formato de pesos (safetensors + `compressed-tensors` + `custom_code`), el camino natural es `transformers` con aceleracion por tensor parallelism. Para servicio de produccion, vLLM y SGLang son los marcos habituales para modelos MoE de gran tamano con MLA. No se indica soporte de GGUF ni de llama.cpp u Ollama en la informacion disponible, y estos ultimos no son viables con este tamano.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con 32B parametros activos, el coste de computo por token es mucho menor que el de un modelo denso de 1T, pero el ancho de banda de memoria necesario para recorrer los expertos activados en cada capa condiciona fuertemente el rendimiento en decodificacion; no hay cifras publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K2.7 Code | ~1,03 B | 32B | 256K | MIT modificada | Pesos abiertos (safetensors, `compressed-tensors`) |
| Kimi K2.6 | no disponible | no disponible | 256K (usado en evaluacion) | no disponible | no disponible |
| GPT-5.5 | no disponible | no disponible | no disponible | propietaria | solo API (Codex) |
| Claude Opus 4.8 | no disponible | no disponible | no disponible | propietaria | solo API (Claude Code) |

En rendimiento, la model card situa a Kimi K2.7 Code por encima de Kimi K2.6 en los seis benchmarks publicados (por ejemplo, 62,0 frente a 50,9 en Kimi Code Bench v2) y por debajo de GPT-5.5 en todos ellos; frente a Claude Opus 4.8 gana en Program Bench (53,6 frente a 63,8, pierde) y en MCP Mark Verified (81,1 frente a 76,4, gana), mientras pierde en el resto. No se dispone de datos de tamano, contexto ni licencia de los modelos propietarios comparados.

## Limitaciones y advertencias

- Repositorio de terceros: `konizquants/Kimi-K2.7-Code` no es la publicacion oficial de Moonshot AI. Los pesos originales estan en la organizacion `moonshotai` de Hugging Face. Conviene verificar integridad y procedencia antes de usarlo en produccion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar APIs, funciones o referencias inexistentes. En tareas de codigo esto se traduce en codigo que compila pero no hace lo esperado, o en llamadas a metodos que no existen.
- Idiomas soportados: no disponibles. La model card no documenta cobertura multilingue, y el foco declarado es codigo, por lo que el rendimiento fuera del ingles tecnico no esta garantizado.
- Licencia MIT modificada: aunque se etiqueta como `modified-mit`, se clasifica como `license: other`, lo que implica condiciones adicionales respecto a la MIT estandar. Es imprescindible revisar el fichero LICENSE del repositorio antes de un uso comercial.
- Requisitos de infraestructura: el despliegue exige hardware de centro de datos multi-GPU con decenas de miles de euros en computo. No es viable en estaciones de trabajo individuales.
- Ausencia de benchmarks estandar: no hay resultados publicados de MMLU, HumanEval, GSM8K ni evaluaciones independientes; todos los numeros proceden del propio autor del modelo, lo que introduce un sesgo de seleccion de tareas.
- Condiciones de evaluacion especificas: los resultados se obtuvieron con thinking mode activado, temperatura 1.0, top-p 0.95 y 262.144 tokens de contexto, ademas de arneses concretos (Kimi Code CLI, Codex xhigh, Claude Code xhigh). Reproducir esos numeros fuera de esas condiciones no esta garantizado.
- Consumo de tokens de razonamiento: aunque se reduce un 30% respecto a K2.6, un modo thinking activado sigue incrementando latencia y coste por peticion frente a un modo directo.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Resultados de busqueda web: la busqueda realizada no devolvio ningun resultado relevante sobre el modelo (unicamente contenido no relacionado), por lo que no se ha podido contrastar informacion adicional ni localizar papers o blogs independientes.

## Enlaces

- Repositorio en Hugging Face (terceros): https://huggingface.co/konizquants/Kimi-K2.7-Code
- Organizacion oficial de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Pagina oficial de Kimi Code: https://www.kimi.com/code
- Web de Moonshot AI: https://www.moonshot.ai
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
- Fichero de licencia referenciado en la model card: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE

No se han encontrado papers, blogs tecnicos ni demos adicionales en la busqueda web realizada.
