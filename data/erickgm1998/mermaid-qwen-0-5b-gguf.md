# erickgm1998/mermaid-qwen-0.5b-gguf

## Resumen

Mermaid Qwen 0.5B es un ajuste fino (fine-tune) de Qwen/Qwen2.5-0.5B-Instruct orientado a una unica tarea: generar codigo de diagramas Mermaid a partir de instrucciones en lenguaje natural. Lo publica el usuario de HuggingFace erickgm1998 (ERICK GUIMARAES DE MORAES), y su interes es muy acotado: demuestra como un modelo de 0,49 mil millones de parametros puede especializarse en un lenguaje de descripcion de diagramas mediante LoRA, sin recurrir a un modelo de codigo mayor. No parte de Qwen2.5-Coder, sino del instruct generalista.

El proceso fue: entrenamiento de un adaptador LoRA sobre el modelo base, fusion del adaptador en los pesos, y conversion de safetensors FP32 a GGUF sin cuantizar (file type F32) con llama.cpp. El resultado es un unico fichero de aproximadamente 2 GB, con 290 tensores y plantilla de chat embebida, listo para ejecutarse con Ollama. El repositorio ocupa 2,0 GB y no tiene descargas ni likes en el momento de redactar esta ficha.

La relevancia practica es limitada pero clara: es un caso de estudio reproducible de especializacion de un modelo diminuto para una tarea de formato estricto, con un coste de inferencia minimo. Sus numeros de entrenamiento son, sin embargo, muy modestos (298 ejemplos, una sola epoca) y el propio autor advierte de que la calidad de inferencia en Ollama no se ha validado todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune con LoRA fusionado |
| Parametros totales | 494.032.768 (~0,49 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; heredada del modelo base Qwen2.5-0.5B-Instruct (32.768 tokens) |
| Tipos de cuantizacion | F32 sin cuantizar (unico formato publicado en este repo) |
| Idiomas soportados | portugues (etiqueta `pt`); el modelo base es multilingue, pero no se declara en la ficha |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (file type F32, 290 tensores, plantilla de chat embebida) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Tamano del repositorio | 2,0 GB |
| Fecha de creacion | 2026-09-29 |
| Ultima actualizacion | 2026-09-29 |
| Descargas / likes | 0 / 0 |
| Pipeline | text-generation |
| Compatibilidad | endpoints_compatible, conversational |
| Variante adicional | erickgm1998/mermaid-qwen-0.5b-onnx (formato ONNX) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, con atencion causal y el tokenizador estandar de Qwen. El autor no modifica el backbone; el cambio es puramente de pesos. El pipeline fue: entrenamiento de un adaptador LoRA sobre Qwen/Qwen2.5-0.5B-Instruct, fusion del adaptador con los pesos base, y posterior conversion a GGUF en FP32 mediante llama.cpp. La model card insiste en un detalle relevante: no se uso Qwen2.5-Coder como base.

El conjunto de entrenamiento es muy reducido: 298 ejemplos durante una sola epoca, con 58 ejemplos reservados para evaluacion. La perdida de evaluacion final fue de 0,5374. El propio autor matiza que la perdida por si sola no garantiza validez sintactica de Mermaid, lo cual es correcto: la metrica de entrenamiento no mide si el diagrama resultante compila o si el tipo de diagrama es el solicitado. No se documentan tecnicas adicionales (RLHF, DPO, decodificacion especulativa, atencion lineal) ni la composicion exacta del dataset mas alla del recuento de ejemplos.

## Capacidades

- Generacion de texto conversacional a partir del modelo base Qwen2.5-0.5B-Instruct.
- Generacion de diagramas Mermaid, presumiblemente `flowchart` y otros tipos, a partir de instrucciones en portugues. El ejemplo de la model card pide explicitamente un flowchart con caminos de exito y error.
- Respuesta en formato restringido: el prompt de ejemplo indica "Responda apenas com Mermaid", es decir, salida limitada al bloque de codigo del diagrama.
- Uso con plantilla de chat embebida en el GGUF, lo que permite invocarlo como modelo conversacional en Ollama.
- Soporte de tool calling / function calling: no disponible. No se documenta y no es esperable en un modelo de 0,5 B ajustado para una unica tarea.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la etiqueta declarada es unicamente `pt`; no se garantiza funcionamiento correcto en castellano ni en otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de diagramas de flujo en documentacion tecnica: a partir de una descripcion textual de un proceso (por ejemplo, un flujo de login con ramas de exito y error), el modelo devuelve el bloque Mermaid listo para pegar en un README o en una wiki.
- Prototipado rapido de esquemas de arquitectura: en una fase temprana de diseno, sirve para esbozar diagramas de secuencia o de estados sin escribir la sintaxis a mano, aceptando despues una revision manual obligatoria.
- Canal de entrada para editores Markdown con soporte Mermaid: integrado como asistente local, convierte lenguaje natural en bloques de codigo Mermaid dentro del editor, con coste de computo practicamente nulo frente a un modelo en la nube.
- Docencia de sintaxis Mermaid: el modelo puede usarse como ejemplo de referencia en un curso para mostrar el resultado de especializar un modelo de 0,5 B con LoRA sobre un dataset pequeno, incluidos sus fallos.
- Preprocesado en un pipeline mayor: como primer paso barato que produce un borrador de diagrama, que despues se valida con un parser de Mermaid (por ejemplo, mermaid-cli) y se corrige con un modelo mayor si la validacion falla.
- Despliegue en entornos sin GPU y sin conexion: al ser un GGUF F32 de ~2 GB, puede ejecutarse en CPU con Ollama o llama.cpp en un portatil o en un servidor pequeno, algo inviable con modelos de mayor tamano.
- Generacion masiva de diagramas para conjuntos de documentacion: dado el bajo coste por inferencia, se puede procesar por lotes un catalogo de procesos descritos en texto y generar un borrador de diagrama por entrada.

En todos los casos, la salida debe pasar por un validador sintactico antes de publicarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de evaluacion del ajuste fino sobre 58 ejemplos retenidos:

| Metrica | Valor | Contexto |
|---|---|---|
| Eval loss (fine-tune) | 0,5374 | 58 ejemplos de validacion, 1 epoca |
| Ejemplos de entrenamiento | 298 | 1 epoca |
| MMLU, HumanEval, GSM8K, etc. | no disponible | no publicados |
| Validacion de sintaxis Mermaid | no disponible | el autor senala que la perdida no la garantiza |

No se dispone de comparaciones medidas frente al modelo base ni frente a otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en el unico formato publicado (F32), los pesos ocupan aproximadamente 1,98 GB (494.032.768 parametros x 4 bytes), mas overhead de contexto y runtime; alrededor de 2,5-3 GB en total.
- Cuantizaciones alternativas: este repositorio no las publica, pero al ser un GGUF de llama.cpp es tecnicamente posible reconvertirlo a Q8_0 (~0,5 GB) o Q4_K_M (~0,3-0,4 GB) con las herramientas de llama.cpp. La calidad tras esa conversion no esta evaluada por el autor.
- GPU recomendadas: cualquier GPU consumer con 3 GB o mas de VRAM es suficiente en F32 (GTX 1050 Ti 4 GB, GTX 1650, RTX 3050, RTX 4060, etc.). No se necesita A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: Ollama (via `ollama run hf.co/erickgm1998/mermaid-qwen-0.5b-gguf`), llama.cpp. vLLM y TGI no son la via recomendada para GGUF; para esos servidores habria que partir del modelo en safetensors, que este repositorio no ofrece.
- Latencia y throughput: no disponibles. No hay mediciones publicadas. Cualitativamente, con ~0,49 B de parametros el cuello de botella es el ancho de banda de memoria, no la capacidad de computo, por lo que la generacion en CPU resulta viable aunque lenta en comparacion con una GPU dedicada.
- Almacenamiento: 2,0 GB de repositorio en el formato F32 actual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| erickgm1998/mermaid-qwen-0.5b-gguf | 0,49 B | no especificado (heredado del base) | GGUF F32 | Apache 2.0 | Mermaid (fine-tune LoRA, 298 ejemplos) |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | safetensors, GGUF comunitarios | Apache 2.0 | proposito general, instruct |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | 0,49 B | 32.768 tokens | safetensors, GGUF comunitarios | Apache 2.0 | codigo (no es la base de este modelo) |
| erickgm1998/mermaid-qwen-0.5b-onnx | 0,49 B | no disponible | ONNX | Apache 2.0 | misma tarea, otro runtime |

No se conocen otros fine-tunes publicos orientados especificamente a Mermaid con los que comparar de forma directa, por lo que no hay datos de rendimiento comparativos disponibles.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 298 ejemplos y una sola epoca. Es un ajuste de especializacion ligero, no un entrenamiento robusto; es probable un sobreajuste al estilo y al vocabulario de esos ejemplos.
- La perdida de evaluacion (0,5374) no mide validez sintactica de Mermaid. El autor lo advierte explicitamente. Un diagrama puede ser plausible y no compilar.
- Calidad de inferencia sin validar: la model card indica que "la calidad de inferencia en Ollama todavia no se ha validado".
- Riesgo de alucinacion elevado: en modelos de ~0,5 B, la generacion de identificadores, tipos de nodo o directivas Mermaid inventadas es frecuente. Requiere validacion con un parser antes de cualquier uso real.
- Idiomas: la unica lengua declarada es el portugues. El prompt de ejemplo esta en portugues. El comportamiento en castellano no esta documentado ni garantizado.
- Longitud de contexto: la model card no especifica el contexto efectivo tras el ajuste. Aunque el modelo base soporta 32.768 tokens, un fine-tune de 298 ejemplos puede degradarse rapidamente con entradas largas.
- Sin validacion de la comunidad: 0 descargas y 0 likes. No hay informes independientes de calidad.
- Cuantizacion: solo se publica F32 (2 GB). No hay versiones Q4/Q8 verificadas; reconvertirlas es responsabilidad del usuario y puede alterar la calidad.
- Licencia: Apache 2.0, permisiva y compatible con uso comercial, heredada del modelo base. Conviene verificar igualmente los terminos del modelo Qwen2.5 subyacente.
- Fecha de publicacion anomala (2026-09-29), coherente con el campo `createdAt` del repositorio pero posterior a la fecha actual en muchos entornos; conviene comprobarlo antes de citarlo.
- Advertencia de produccion: no es un modelo apto para produccion sin una capa de validacion sintactica y un mecanismo de respaldo ante salidas invalidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erickgm1998/mermaid-qwen-0.5b-gguf
- Variante ONNX del mismo autor: https://huggingface.co/erickgm1998/mermaid-qwen-0.5b-onnx
- Perfil del autor: https://huggingface.co/erickgm1998
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio oficial de Qwen: https://github.com/QwenLM/Qwen
- Sitio oficial de Qwen: https://qwen.ai/home
- llama.cpp (herramienta de conversion a GGUF): https://github.com/ggerganov/llama.cpp
