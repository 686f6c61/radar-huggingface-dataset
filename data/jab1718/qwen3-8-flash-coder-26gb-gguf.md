# Jab1718/qwen3.8-flash-coder-26gb-gguf

## Resumen

Qwen3.8-Flash-Coder-26GB-GGUF es la distribucion cuantizada en formato GGUF de `Jab1718/qwen3.8-flash-coder-85gb-bf16`, un subconjunto (subnet) de 160 expertos extraido del modelo `Qwen3.8-Flash-Next` (335 GB) mediante el toolkit `moe-slice` del mismo autor. El repositorio lo publica Jab1718 (Thai Nguyen) bajo licencia Apache 2.0 y su proposito es permitir la ejecucion local de un modelo MoE de codigo en hardware de consumo: la variante Q4_K_M ocupa 26,43 GB en disco y la Q8_0 42,25 GB.

El modelo total declarado es de 42.620.341.120 parametros (42,62 B) segun los metadatos de safetensors, con arquitectura de mezcla de expertos y 160 expertos. La ventana de contexto verificada por el autor es de 64.000 tokens (`-c 65536`). Los idiomas declarados son ingles, vietnamita y chino. No se especifica el numero de parametros activos por token.

Su relevancia actual radica en el enfoque de "subnet alineado al hardware": en lugar de reducir un modelo denso, se recortan expertos de un MoE grande priorizando trayectorias de programacion de sistemas, programacion dinamica algoritmica y tool calling, lo que permite obtener puntuaciones altas en tareas de codigo concretas con una huella de memoria muy inferior a la del modelo original. El autor advierte que el recorte es deliberado y sacrifica aritmetica de problemas verbales (GSM8K) para maximizar capacidad en desarrollo de software multi-lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con 160 expertos; subnet recortado de Qwen3.8-Flash-Next |
| Parametros totales | 42.620.341.120 (42,62 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 64.000 tokens verificados por el autor (`-c 65536`); maximo nativo no declarado |
| Tipos de cuantizacion | Q4_K_M (26,43 GB) y Q8_0 (42,25 GB); el repositorio base ofrece BF16 y un subnet INT8 selectivo de 44 GB |
| Idiomas soportados | en, vi, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) y `Modelfile`; repositorios base en BF16 e INT8 selectivo |

## Arquitectura y entrenamiento

Se trata de un modelo de mezcla de expertos (MoE) derivado, no entrenado desde cero. El flujo declarado es: partir de `Qwen3.8-Flash-Next` (335 GB), extraer un subnet de 160 expertos con el toolkit `moe-slice` para producir el modelo base BF16 de 85 GB, y a partir de ahi generar las cuantizaciones GGUF publicadas en este repositorio. El autor indica que los expertos se seleccionaron priorizando trayectorias de programacion de sistemas, programacion dinamica algoritmica y tool calling, y que la aritmetica de problemas verbales (GSM8K) fue podada por diseno. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

Tampoco se detallan innovaciones de inferencia propias del modelo (atencion lineal, decodificacion especulativa, etc.). El aspecto tecnico mas destacable de esta publicacion es la alineacion con el runtime: los binarios antiguos de Ollama y otros runtimes fijan `expert_count=512` y rechazan el fichero con el error `expected expert_count=512 ... got 160`, por lo que se requiere una version reciente de `llama.cpp` master con soporte Metal y compatibilidad con recuentos arbitrarios de expertos MoE. Ademas, la model card documenta dos comportamientos de plantilla de chat que condicionan el uso: la captura del razonamiento dentro de `<think>...</think>` puede dejar el campo `content` casi vacio en tareas de auditoria de codigo, y el modelo tiende a reescribir funciones completas en lugar de aplicar parches minimos si no se le indica lo contrario.

## Capacidades

- Generacion de codigo en multiples lenguajes, con resultados destacados declarados por el autor en Rust y C++20 (100 % Pass@1 en sus pruebas) y menor rendimiento en TypeScript (80 %) y algoritmos en Python (78 %).
- Tareas de agente de codigo: generacion de diffs, relleno en medio (FIM) y correccion de bugs, con un 80 % Pass@1 en el conjunto de evaluacion del autor (16/20).
- Tool calling / function calling: el subnet se construyo priorizando trayectorias de tool calling.
- Razonamiento multi-paso con modo de pensamiento explicito mediante etiquetas `<think>...</think>`.
- Revision de codigo y auditoria de bugs (deteccion de condiciones de carrera y fugas de memoria segun los ejemplos de la model card), condicionada al patron de prompt recomendado.
- Refactorizacion quirurgica: admite instrucciones para devolver unicamente un parche unificado minimal (`+/-` lineas) sin reescribir la logica no afectada.
- Capacidades multilingues limitadas a ingles, vietnamita y chino, tanto en texto como previsiblemente en comentarios y documentacion de codigo.
- No se declaran capacidades de vision, audio ni de otro tipo.

## Casos de uso

- Revision de codigo automatizada en revisiones de pull requests: el modelo puede analizar funciones concurrentes y devolver un informe estructurado con nombre del bug, numero de linea, severidad y correccion recomendada, siempre que se le indique explicitamente que emita el informe fuera de las etiquetas `<think>`. Su ventana de 64.000 tokens permite incluir varios ficheros en el mismo prompt.
- Agente de codigo integrado en terminal o IDE: gracias al soporte de diffs y FIM, puede generar parches sobre un repositorio existente, aplicarlos y corregir errores en varios pasos, encadenado a herramientas de compilacion y test.
- Refactorizacion de codigo legacy: con instrucciones de parche minimal se reduce el riesgo de regresiones por reescritura completa, util en bases de codigo grandes donde cada cambio debe ser revisable linea a linea.
- Desarrollo de sistemas en Rust y C++: es el area donde el autor reporta mejores resultados (10/10 en ambas), por lo que encaja en tareas de implementacion de estructuras de datos, concurrencia y utilidades de bajo nivel.
- Desarrollo fullstack en TypeScript: generacion de componentes y logica de servidor con un rendimiento declarado del 80 % Pass@1, adecuado como asistente de productividad mas que como sustituto de revision humana.
- Generacion de pruebas y utillaje en pipelines de CI/CD: el modelo puede producir parches o funciones de test a partir de un fallo reportado y ejecutarse en un runner con GPU de 24 GB o en un Mac con memoria unificada.
- Entorno de desarrollo local sin conexion en una sola GPU de consumo: la variante Q4_K_M (26,43 GB) esta pensada para RTX 3090/4090, RTX 5000 Ada de 32 GB o Macs de 32 GB, lo que permite trabajar con codigo propietario sin enviar nada a servicios externos.
- Estaciones de trabajo Apple Silicon: en un M5 Pro con 64 GB se carga el contexto completo de 64K con unos 33 GB de RAM cableada, dejando margen para otras herramientas, con decodificacion de unos 32 tokens/s y carga en frio de unos 10 segundos.
- Equipos con documentacion o comentarios en vietnamita o chino: el soporte de esos idiomas permite generar explicaciones, docstrings y mensajes de commit en la lengua del equipo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. No se indica el numero de ejecuciones, la temperatura ni el arnes de evaluacion, por lo que deben interpretarse como datos autoinformados.

| Prueba | Resultado | Metrica |
|---|---|---|
| Rust (sistemas) | 10/10 (100,0 %) | Pass@1 |
| C++20 (sistemas modernos) | 10/10 (100,0 %) | Pass@1 |
| TypeScript (fullstack) | 4/5 (80,0 %) | Pass@1 |
| Agente de codigo (diff / FIM / bugfix) | 16/20 (80,0 %) | Pass@1 |
| Algoritmos en Python | 39/50 (78,0 %) | Pass@1 |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estandar en la informacion disponible. El autor senala ademas que la aritmetica de problemas verbales fue podada de forma intencionada durante la seleccion de expertos.

## Requisitos de hardware

- Q4_K_M (26,43 GB en disco): objetivo declarado de 1 GPU de 24 GB (RTX 3090/4090), RTX 5000 Ada de 32 GB o Mac de 32 GB. Dado que el fichero supera ligeramente los 24 GB, en GPUs de 24 GB puede requerir ajuste de capas offload; un usuario reporta en Reddit problemas para ejecutarlo en una RTX sin especificar el modelo exacto.
- Q8_0 (42,25 GB en disco): 2 GPUs de 24 GB, 1 GPU de 48 GB o Mac con 64 GB o mas de memoria unificada.
- Apple Silicon verificado por el autor: M5 Pro con 64 GB de memoria unificada y macOS 26, contexto de 64K con unos 33 GB de RAM cableada (aproximadamente 46 % de RAM libre), decodificacion sostenida de unos 32 tokens/s y carga en frio de unos 10 segundos mediante E/S mapeada en memoria.
- No cabe en GPUs de gama media con menos de 24 GB de VRAM en la cuantizacion Q4_K_M, salvo cuantizaciones mas agresivas no publicadas en este repositorio.
- Opciones de despliegue: Ollama (con el `Modelfile` incluido), `llama.cpp` / `llama-server` con `-ngl 999`, y cualquier runtime compatible con GGUF. Requiere `llama.cpp` master reciente, especialmente en Metal; las versiones de Ollama empaquetadas antiguas (v0.32.5 o anteriores) fallan por fijar `expert_count=512`.
- Latencia y throughput: solo se dispone de la cifra de ~32 tokens/s de decodificacion en M5 Pro. No hay datos publicados de throughput en GPU ni de latencia por peticion o tiempo hasta el primer token.
- Comando de referencia del autor: `./llama-server -m ./qwen3.8-flash-coder-26gb-q4_k_m.gguf -c 65536 -ngl 999 --host 0.0.0.0 --port 8080`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos competidores en la informacion proporcionada. La comparativa se limita a las variantes de la misma familia publicadas por el autor, ya que no hay cifras verificables de alternativas de tamano similar.

| Modelo | Parametros | Formato / tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Coder-26GB-GGUF (este) | 42,62 B totales, activos no disponibles | GGUF Q4_K_M 26,43 GB / Q8_0 42,25 GB | 64.000 tokens verificados | Apache 2.0 | 160 expertos; pensado para 1 GPU de 24 GB en Q4_K_M |
| qwen3.8-flash-coder-44gb-selective-int8 | 42,62 B (misma base) | INT8 selectivo, 44 GB | no disponible | Apache 2.0 | Mayor fidelidad que Q4_K_M, menos que BF16 |
| qwen3.8-flash-coder-85gb-bf16 | 42,62 B (misma base) | BF16, 85 GB | no disponible | Apache 2.0 | Modelo base del que derivan las cuantizaciones |
| Qwen3.8-Flash-Next | no disponible | 335 GB | no disponible | no disponible | Modelo original del que se recorto el subnet de 160 expertos |

## Limitaciones y advertencias

- Matematicas de problemas verbales degradadas por diseno: el autor confirma que GSM8K y tareas similares se podaron al seleccionar expertos; no es un modelo adecuado para razonamiento aritmetico general.
- Campo `content` practicamente vacio en tareas de auditoria: con ciertas plantillas de chat, el razonamiento queda dentro de `<think>...</think>` y la respuesta final puede contener 0-2 caracteres. Requiere instruir explicitamente al modelo para que emita el informe fuera de las etiquetas.
- Tendencia a reescribir codigo completo en lugar de aplicar cambios minimos, con riesgo de introducir regresiones como errores off-by-one; se recomienda pedir explicitamente un parche unificado minimal.
- Incompatibilidad de runtime: Ollama v0.32.5 o anterior y binarios antiguos rechazan el fichero por fijar `expert_count=512` en lugar de 160. Es necesario `llama.cpp` master con los PR de compatibilidad para recuentos arbitrarios de expertos (`qwen4exp`), especialmente en Metal.
- Idiomas limitados a ingles, vietnamita y chino: no hay soporte declarado de castellano, lo que puede degradar la calidad en prompts y documentacion en espanol.
- Los benchmarks son autoinformados por el autor, sin arnes de evaluacion, temperaturas ni numero de ejecuciones documentados, y con tamanos de muestra pequenos (10, 5, 20 y 50 casos). Deben tomarse como orientativos.
- Modelo derivado por recorte de expertos: se pierden capacidades del modelo original y no se documenta una evaluacion sistematica del impacto del recorte fuera de los conjuntos de codigo listados.
- No se documentan sesgos especificos, comportamiento en dominios sensibles ni tasas de alucinacion medidas; aplican los riesgos habituales de un modelo de codigo usado como agente autonomo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el repositorio no incluye garantias ni soporte. Conviene verificar las condiciones del modelo original `Qwen3.8-Flash-Next` del que procede el subnet, no documentadas en la informacion disponible.
- En produccion, la ausencia de datos de latencia, throughput en GPU y comportamiento bajo carga concurrente obliga a realizar una evaluacion propia antes de desplegarlo.
- Un usuario reporta en Reddit dificultades para ejecutar el modelo en una RTX (modelo no especificado), lo que sugiere que el objetivo de "1 GPU de 24 GB" puede requerir ajuste fino de offload de capas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jab1718/qwen3.8-flash-coder-26gb-gguf
- Modelo base BF16 (85 GB): https://huggingface.co/Jab1718/qwen3.8-flash-coder-85gb-bf16
- Subnet INT8 selectivo (44 GB): https://huggingface.co/Jab1718/qwen3.8-flash-coder-44gb-selective-int8
- Toolkit `moe-slice` en GitHub: https://github.com/Jab1718/Moe-slices
- Hilo de Reddit sobre ejecucion en GPU de 24 GB: https://www.reddit.com/r/unsloth/comments/1wcdekk/running_qwen38_flash_next_models_entirely_on_24gb/
- Texto de la licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
