# jkim96/Qwen3.6-35B-A3B-DASHQ-Q2-GGUF

## Resumen

Qwen3.6-35B-A3B-DASHQ-Q2-GGUF es una cuantizacion a 2 bits del modelo base Qwen/Qwen3.6-35B-A3B, publicada por el usuario jkim96. El modelo emplea la tecnica DASH-Q, desarrollada por el mismo autor en el repositorio JaeminK/dashq, que produce ficheros GGUF compatibles con llama.cpp usando exclusivamente tipos de tensor estandar y sin ningun tensor por encima de 4 bits. El objetivo es ofrecer una version de muy bajo peso (12,5 GB) que pueda ejecutarse en hardware de consumo sin sacrificar mas calidad de la estrictamente necesaria.

El modelo base cuenta con 35.505.251.456 parametros totales (aproximadamente 35,5 mil millones). La nomenclatura "A3B" del nombre sigue la convencion de Qwen para modelos de mezcla de expertos, lo que sugiere del orden de 3 mil millones de parametros activos por token, aunque este dato no se confirma en la informacion disponible. La unica cuantizacion publicada en este repositorio es Q2_K_XL, con un peso medio de 2,82 bits por parametro.

Se trata de la unica entrega de un autor sin descargas ni interacciones registradas en el momento de la consulta. Su relevancia radica en que demuestra que la cuantizacion DASH-Q iguala en perplejidad a la cuantizacion UD-Q2_K_XL de Unsloth (6,29 en WikiText-2) manteniendo compatibilidad total con llama.cpp y sin necesidad de kernels personalizados. El modelo es unicamente de texto: la torre de vision no esta incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.6-35B-A3B); cuantizacion GGUF para llama.cpp |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible (la convencion "A3B" del nombre sugiere ~3 B, sin confirmar) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K_XL (2,82 bits/peso), clase 2 bits DASH-Q |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Qwen/Qwen3.6-35B-A3B en los datos proporcionados (transformer denso, mezcla de expertos, hibrida u otra). La convencion de nomenclatura "A3B" apunta a un modelo de mezcla de expertos con aproximadamente 3 mil millones de parametros activos, pero no se confirma en la documentacion disponible. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo que si esta documentado es el proceso de cuantizacion. Los ficheros se generaron con DASH-Q, una tecnica que cuantiza el modelo a tamanos de la clase de 2 bits (en este caso Q2_K_XL) respetando las restricciones de llama.cpp: todos los tensores emplean tipos estandar de llama.cpp y ninguno supera los 4 bits, por lo que el fichero carga en cualquier compilacion reciente de llama.cpp sin parches ni kernels adicionales. La cuantizacion resultante ocupa 12,50 GB con una media de 2,82 bits por parametro.

## Capacidades

- Generacion de texto conversacional (tag "conversational" en el repositorio).
- No incluye vision: la torre de vision del modelo base no forma parte de estos ficheros, por lo que el modelo es exclusivamente de texto.
- Capacidades de razonamiento, codigo, matematicas y tool calling: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el repositorio no declara idiomas).
- Capacidades especiales (modo de pensamiento, audio, etc.): no disponible.

## Casos de uso

- Despliegue en hardware de consumo: con un fichero de 12,5 GB, el modelo puede cargarse en GPU con 16 GB o mas de VRAM (por ejemplo, RTX 4090 o 4080), lo que permite ejecutar localmente un modelo de 35,5 B en equipos de gama alta sin servidores dedicados.
- Prototipado y evaluacion rapida: util para probar el comportamiento del modelo base Qwen/Qwen3.6-35B-A3B en local antes de decantarse por cuantizaciones mayores o por el modelo sin cuantizar.
- Generacion de texto conversacional offline: escenarios de chat o asistencia por texto sin conexion, aprovechando el tag "conversational" y la compatibilidad con llama.cpp.
- Integracion en pipelines llama.cpp existentes: al usar solo tipos de tensor estandar, se puede sustituir directamente por otras cuantizaciones en herramientas como llama-cli, llama-server o interfaces compatibles sin cambios de codigo.
- Experimentacion con cuantizacion extrema: sirve como referencia para estudiar el impacto de la cuantizacion a 2 bits frente a alternativas como llama.cpp Q2_K (imatrix) o UD-Q2_K_XL de Unsloth.
- Ejecucion en entornos con memoria limitada: cuando el presupuesto de VRAM o disco es ajustado, esta cuantizacion permite alojar un modelo de 35,5 B donde una cuantizacion de 4 bits no cabria.
- Comparacion de tecnicas de cuantizacion: la tabla de perplejidad publicada facilita evaluar DASH-Q frente a otras propuestas con las mismas condiciones de medida.

## Benchmarks y rendimiento

El autor publica unicamente resultados de perplejidad (menor es mejor), medidos con `llama-perplexity` a contexto 2048 sobre WikiText-2 (test) y C4 (validacion, 256 x 2048 tokens):

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 13,42 GB | 6,70 | 11,24 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 12,29 GB | 6,29 | 10,70 |
| Q2_K_XL | DASH-Q Q2_K_XL | 12,50 GB | 6,29 | 10,74 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Tamano del fichero: 12,50 GB (un unico archivo Q2_K_XL).
- VRAM estimada para inferencia: al menos ~12,5 GB solo para los pesos; sumando cache KV y overhead, se recomienda disponer de 16 GB o mas de VRAM para uso comodo.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 (24 GB), o GPUs profesionales tipo A100 / H100 si se busca mayor throughput o servir varias peticiones.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB de VRAM o mas. En GPUs de 12 GB la carga completa no es viable sin offload parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y cualquier frontend compatible con GGUF (por ejemplo Ollama, si acepta este fichero). El repositorio declara compatibilidad con "endpoints_compatible".
- Latencia y throughput estimados: no disponibles.

Ejemplo de uso documentado por el autor:

```bash
llama-cli -m Qwen3.6-35B-A3B-DASHQ-IQ2_M.gguf -ngl 99 -c 8192
```

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | WikiText-2 | C4 | Licencia |
|---|---|---|---|---|---|
| DASH-Q Q2_K_XL (este) | Q2_K_XL | 12,50 GB | 6,29 | 10,74 | apache-2.0 |
| llama.cpp Q2_K (imatrix) | Q2_K | 13,42 GB | 6,70 | 11,24 | apache-2.0 (base) |
| unsloth UD-Q2_K_XL | Q2_K_XL | 12,29 GB | 6,29 | 10,70 | apache-2.0 (base) |

En perplejidad, DASH-Q Q2_K_XL iguala a UD-Q2_K_XL en WikiText-2 (6,29) y queda ligeramente por encima en C4 (10,74 frente a 10,70), superando en ambas metricas a llama.cpp Q2_K con imatrix. La comparacion con el propio modelo base sin cuantizar no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion a 2 bits: es una cuantizacion de muy baja precision, con la consiguiente perdida de calidad respecto al modelo base. El propio autor la situa en la "clase de 2 bits".
- Perplejidad residual: en C4, DASH-Q queda ligeramente por detras de UD-Q2_K_XL (10,74 frente a 10,70), por lo que no es la mejor opcion en esa metrica concreta.
- Sin vision: la torre de vision no esta incluida, por lo que cualquier tarea multimodal no es posible con estos ficheros.
- Idiomas y capacidades no documentados: el repositorio no declara idiomas soportados ni detalla capacidades de razonamiento, codigo o tool calling, lo que dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero previsiblemente agravado por la cuantizacion a 2 bits.
- Licencia: apache-2.0 heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo original Qwen/Qwen3.6-35B-A3B.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que respalde su fiabilidad en produccion.
- Ejemplo de uso inconsistente: el comando del autor referencia un fichero `Qwen3.6-35B-A3B-DASHQ-IQ2_M.gguf` que no aparece en la tabla de ficheros publicada (solo se lista Q2_K_XL), lo que puede inducir a error.
- Longitud de contexto del modelo base no disponible: el ejemplo usa `-c 8192`, pero no se confirma el contexto maximo soportado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jkim96/Qwen3.6-35B-A3B-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio DASH-Q: https://github.com/JaeminK/dashq
- Banner DASH-Q: https://raw.githubusercontent.com/JaeminK/dashq/main/assets/dashq_banner.png
