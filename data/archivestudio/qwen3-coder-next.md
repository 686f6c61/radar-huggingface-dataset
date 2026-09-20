# ArchiveStudio/Qwen3-Coder-Next

## Resumen

Qwen3-Coder-Next es un modelo de lenguaje de pesos abiertos orientado especificamente a agentes de programacion y desarrollo local, publicado por el equipo Qwen (Alibaba). Se trata de un modelo de arquitectura hibrida con mezcla de expertos (MoE) que combina capas de atencion con compuerta (Gated Attention) y capas de atencion lineal Gated DeltaNet, con un total de 80 000 millones de parametros de los que solo 3 000 millones se activan por token. Esa relacion de activacion lo situa en un regimen de coste de inferencia propio de un modelo de 3B, pero con capacidad de representacion de un modelo de 80B.

El modelo resuelve el problema del despliegue de agentes de codigo en entornos reales: soporta una longitud de contexto nativa de 262 144 tokens, esta entrenado para razonamiento de horizonte largo, uso complejo de herramientas y recuperacion tras fallos de ejecucion, y se integra con plantillas de andamiaje de distintos CLI e IDE (Claude Code, Qwen Code, Qoder, Kilo, Trae, Cline, entre otros). Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

La ficha que sigue describe el repositorio ArchiveStudio/Qwen3-Coder-Next, que es una copia del modelo oficial Qwen/Qwen3-Coder-Next alojada por un tercero (0 descargas y 0 likes en el momento de la consulta). Todos los datos tecnicos proceden de la model card del autor original; la busqueda web realizada no ha devuelto informacion adicional relevante sobre el modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con mezcla de expertos (MoE); disposicion 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)) |
| Parametros totales | 79 674 391 296 (~80B); 79B sin contar embeddings |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262 144 tokens (256K) nativos |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo contiene pesos en safetensors; la cuantizacion a fp8/int8/4-bit depende de la herramienta de despliegue) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

Detalles arquitectonicos adicionales declarados por el autor:

| Componente | Valor |
|---|---|
| Dimension oculta | 2048 |
| Numero de capas | 48 |
| Gated Attention: cabezas Q / KV | 16 / 2 |
| Gated Attention: dimension de cabeza | 256 |
| Gated Attention: dimension de RoPE | 64 |
| Gated DeltaNet: cabezas lineales V / QK | 32 / 16 |
| Gated DeltaNet: dimension de cabeza | 128 |
| Expertos totales / activados / compartidos | 512 / 10 / 1 |
| Dimension intermedia de experto | 512 |
| Tamano del repositorio | 159,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con atencion hibrida. De las 48 capas, 36 utilizan Gated DeltaNet, un mecanismo de atencion lineal con compuerta que mantiene un estado recurrente de tamano constante en lugar de una cache de clave-valor que crece con la secuencia. Las 12 capas restantes usan Gated Attention clasica con 16 cabezas de consulta y solo 2 cabezas de clave-valor (GQA) y dimension de cabeza 256. Cada capa, tanto lineal como de atencion completa, va seguida de un bloque MoE con 512 expertos, 10 expertos activados por token y 1 experto compartido, con dimension intermedia de 512 por experto. Esta combinacion reduce de forma notable el coste de memoria de la cache KV en contextos largos y mantiene un coste de calculo por token propio de un modelo de 3B de parametros activos.

El autor indica que el modelo ha pasado por fases de preentrenamiento y postentrenamiento, con una receta orientada especificamente a habilidades agenticas: razonamiento de horizonte largo, uso de herramientas complejas y recuperacion ante errores de ejecucion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. La model card senala de forma explicita que el modelo funciona unicamente en modo no-thinking y que no genera bloques `<think></think>`, por lo que ya no es necesario pasar `enable_thinking=False`. No se detallan innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto y codigo en un unico turno y en conversaciones multiturno, con plantilla de chat propia.
- Razonamiento de horizonte largo sobre bases de codigo extensas, gracias a los 262 144 tokens de contexto nativo.
- Uso de herramientas (tool calling / function calling) con parser dedicado en vLLM y SGLang (`qwen3_coder`), lo que permite definir y ejecutar funciones externas de forma estructurada.
- Comportamiento agentico: planificacion multipaso, ejecucion de comandos, interpretacion de resultados y recuperacion ante fallos de ejecucion.
- Integracion con andamiajes de agentes de terceros mediante adaptabilidad a distintas plantillas (Claude Code, Qwen Code, Qoder, Kilo, Trae, Cline).
- Modo no-thinking exclusivo: no emite bloques de razonamiento explicito y responde de forma directa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de codigo autonomos en terminal o IDE: el modelo puede recibir un objetivo de alto nivel, descomponerlo en tareas, invocar herramientas de edicion y ejecucion, y corregir sus propios errores a partir de la salida del compilador o de los tests, gracias al entrenamiento explicito en recuperacion de fallos.
- Refactorizacion de repositorios grandes: con 256K tokens de contexto es posible cargar simultaneamente multiples ficheros y sus dependencias para renombrar simbolos, extraer modulos o migrar APIs sin fragmentar el trabajo en trozos que pierdan coherencia.
- Revision de codigo automatizada en pipelines de CI: integrado como servidor compatible con OpenAI (vLLM o SGLang), puede analizar el diff de cada pull request, senalar regresiones y proponer parches antes del merge.
- Generacion de tests unitarios y de integracion: el modelo puede inspeccionar el codigo fuente y las interfaces publicas, y producir baterias de pruebas que se ejecutan en el mismo pipeline, usando el resultado de los tests como senal de correccion.
- Migraciones de lenguaje o de framework: traduccion de bases de codigo completas (por ejemplo, de una version antigua a otra de un framework) manteniendo el contexto de los ficheros relacionados y verificando con la suite de tests existente.
- Asistente de documentacion tecnica: generacion de docstrings, guias de uso y notas de version a partir del codigo y de los mensajes de commit, con contexto suficiente para cubrir un modulo entero.
- Automatizacion de tareas de mantenimiento: actualizacion de dependencias, resolucion de conflictos de merge sencillos y aplicacion de linters o cambios de estilo masivos mediante tool calling.
- Despliegue local para equipos con requisitos de privacidad: al ser Apache-2.0 y ejecutable con llama.cpp, Ollama o LM Studio, permite operar el agente sin enviar codigo propietario a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye dos imagenes con graficas comparativas (`benchmarks.png` y `swebench_pro.png`) alojadas en los servidores de Qwen, pero los valores concretos no forman parte del texto proporcionado, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para pesos (calculo aritmetico a partir de los 79 674 391 296 parametros, no dato oficial): ~160 GB en BF16/FP16, ~80 GB en FP8 o INT8, ~40-45 GB en cuantizacion de 4 bits.
- Cache KV: al usar atencion lineal en 36 de las 48 capas, solo 12 capas generan cache KV. Con 2 cabezas KV de dimension 256 en FP16, la estimacion es de unos 24 KB por token, es decir, aproximadamente 6,4 GB para los 262 144 tokens completos. Es una estimacion, no un dato publicado.
- Memoria total por encima de los 160 GB en precision completa: requiere tensor paralelo en al menos 2 GPU de 80 GB (H100, A100 80GB) o 3-4 GPU de 48 GB.
- GPU recomendadas: H100 80GB, A100 80GB o H200 para BF16 con tensor paralelo; una unica GPU de 80 GB puede ser suficiente en FP8 o INT8.
- Consumer GPU: no cabe en una RTX 4090 de 24 GB en BF16 ni en 4 bits con todos los expertos en VRAM. En cuantizacion de 4 bits necesita al menos 2 × RTX 4090/5090 (24-32 GB cada una) o una A6000/RTX 6000 Ada de 48 GB. Con offloading agresivo de expertos a RAM en llama.cpp puede ejecutarse en un equipo con GPU consumer y 64 GB o mas de memoria del sistema, con penalizacion de latencia.
- Opciones de despliegue: vLLM (>= 0.15.0), SGLang (>= 0.5.8), ambos con soporte de tool calling y API compatible con OpenAI; llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers para uso local, segun lo indicado en la model card.
- Ejemplo de lanzamiento oficial: `python -m sglang.launch_server --model Qwen/Qwen3-Coder-Next --port 30000 --tp-size 2 --tool-call-parser qwen3_coder` y `vllm serve Qwen/Qwen3-Coder-Next --port 8000 --tensor-parallel-size 2 --enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Latencia y throughput: no disponibles. El autor recomienda reducir el contexto (por ejemplo a 32 768 tokens) si el servidor falla al arrancar por falta de memoria.

## Comparativa con modelos similares

Los datos de esta tabla corresponden a las fichas oficiales de los modelos comparados y no proceden de la informacion proporcionada en esta busqueda; se incluyen como referencia de categoria.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-Next | ~80B | ~3B | 262 144 | Apache-2.0 | Hugging Face (este repo es una copia de terceros) |
| Qwen3-Coder-480B-A35B-Instruct | 480B | 35B | 262 144, ampliable a 1M | Apache-2.0 | Hugging Face oficial de Qwen |
| Qwen3-Coder-30B-A3B-Instruct | ~30,5B | ~3,3B | 262 144, ampliable a 1M | Apache-2.0 | Hugging Face oficial de Qwen |

Comparativa de rendimiento: no disponible en la informacion proporcionada para ninguno de los modelos.

## Limitaciones y advertencias

- Modelo no-thinking: no genera bloques de razonamiento explicito. Cualquier prompt o plantilla que espere `<think></think>` puede producir un comportamiento inesperado.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar APIs, funciones o resultados de tests. En agentes que ejecutan comandos reales conviene imponer sandboxing y validacion de las acciones.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos en la informacion disponible.
- Cobertura idiomatica: no disponible. La model card esta orientada a codigo y no detalla el rendimiento en castellano ni en otros idiomas naturales.
- Longitud de contexto: 262 144 tokens es el maximo nativo, pero en la practica la memoria disponible obliga a reducirlo. El propio autor sugiere bajar a 32 768 tokens si hay problemas de OOM.
- Coste de memoria: los 80B de parametros deben residir en memoria aunque solo se activen 3B por token. Esto hace que el modelo no quepa en una GPU consumer, a diferencia de lo que sugiere la cifra de parametros activos.
- Verificacion del repositorio: `ArchiveStudio/Qwen3-Coder-Next` no es el repositorio oficial; presenta 0 descargas y 0 likes, y fue creado y actualizado en el mismo segundo. Para uso en produccion debe contrastarse con `Qwen/Qwen3-Coder-Next` y verificarse el hash de los pesos.
- Restricciones de licencia: la licencia declarada es Apache-2.0, que permite uso comercial, modificacion y redistribucion con atribucion. Conviene revisar el fichero LICENSE enlazado en la model card para confirmar los terminos exactos.
- Integracion con andamiajes de terceros: la adaptabilidad a plantillas de CLI e IDE distintos implica validar el formato de tool calling en cada plataforma; un parser incorrecto degrada las capacidades agenticas.
- Compatibilidad de versiones: requiere transformers reciente y vLLM >= 0.15.0 o SGLang >= 0.5.8. Versiones anteriores pueden no soportar la arquitectura hibrida.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/ArchiveStudio/Qwen3-Coder-Next
- Modelo oficial: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Licencia oficial: https://huggingface.co/Qwen/Qwen3-Coder-Next/blob/main/LICENSE
- Blog de Qwen3-Coder-Next: https://qwen.ai/blog?id=qwen3-coder-next
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Grafica de benchmarks: https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen3-Coder-Next/benchmarks.png
- Grafica de SWE-bench Pro: https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen3-Coder-Next/swebench_pro.png
- SGLang: https://github.com/sgl-project/sglang
- Documentacion de instalacion de SGLang: https://docs.sglang.ai/get_started/install.html
- vLLM: https://github.com/vllm-project/vllm
- Documentacion de instalacion de vLLM: https://docs.vllm.ai/en/stable/getting_started/installation/index.html

La busqueda web realizada no ha devuelto enlaces relevantes sobre el modelo: los resultados obtenidos corresponden a paginas de soporte de Microsoft sin relacion con Qwen3-Coder-Next.
