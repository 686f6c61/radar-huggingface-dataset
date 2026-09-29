# DuoNeural/Qwen2.5-Coder-7B-Instruct-GTAP-v3-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo Qwen2.5-Coder-7B-Instruct, publicada por DuoNeural (Jesse Caldwell, Archon y Aura). Se trata de un artefacto de investigacion experimental dentro del programa de cuantizacion por mecanica estadistica de DuoNeural, denominado G-TAP v3. No es un modelo nuevo: los pesos subyacentes son los del instruct de codigo de Qwen de 7.600 millones de parametros, y lo que aporta este checkpoint es una receta de cuantizacion alternativa que busca preservar el rendimiento del modelo original en precision completa a un coste de memoria mucho menor.

El modelo base Qwen2.5-Coder-7B-Instruct es un transformer decoder causal de 28 capas con atencion GQA en proporcion 28:4 y FFN SwiGLU. La version cuantizada de DuoNeural ocupa 4,36 GiB en disco (aproximadamente 4,5 bits por peso, formato Q4_K_M) y, segun la model card, mantiene una perplejidad de 2,8209 frente a 2,8039 del BF16 sin cuantizar, una diferencia de solo +0,017. Es un checkpoint pensado para desarrolladores que quieren ejecutar un modelo de codigo de 7B en hardware de consumo sin degradar de forma apreciable la calidad de generacion de codigo.

La relevancia de esta publicacion es doble. Por un lado, ofrece una alternativa practica a las cuantizaciones estandar para modelos especializados en programacion, donde la cuantizacion por debajo de 4 bits suele provocar un colapso de sintaxis. Por otro, el autor declara explicitamente que se trata de un lanzamiento experimental pendiente de verificacion independiente, por lo que los resultados deben tomarse como datos preliminares del propio autor, no como benchmarks validados por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal, 28 capas, atencion GQA 28:4, FFN SwiGLU |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens segun la model card del cuantizador; el modelo base Qwen2.5-Coder-7B-Instruct soporta de forma nativa 32.768 tokens, extensible a 131.072 con YaRN. La model card usa 131.072 como tamano de la ventana de calibracion del Hessian |
| Tipos de cuantizacion | Q4_K_M (aproximadamente 4,5 bpw, 4,36 GiB). La misma familia G-TAP v3 publica variantes IQ3_XXS (aproximadamente 3,2 bpw, 2,90 GiB) |
| Idiomas soportados | no disponible en la informacion del repositorio; el modelo base Qwen2.5-Coder es multilingue, con especial enfasis en ingles y chino |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 4,7 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-7B-Instruct: un transformer decoder causal de 28 capas, con atencion de consultas agrupadas en proporcion 28:4 (28 cabezas de query y 4 de key/value) y capas feed-forward con activacion SwiGLU. El modelo fue preentrenado por Qwen y posteriormente alineado mediante instrucciones (instruction tuning) para tareas de generacion de codigo conversacional.

Lo especifico de este checkpoint no es el entrenamiento del modelo, sino el proceso de cuantizacion posterior al entrenamiento (PTQ) disenado por DuoNeural. El metodo G-TAP v3 combina, segun la model card, un Hessian de activaciones infundido con codigo de 131.072 tokens y un mecanismo de amortiguamiento de cavidad de Onsager (procedente de mecanica estadistica) para reducir el error de cuantizacion. El objetivo declarado es evitar el "colapso de sintaxis" que la cuantizacion PTQ estandar provoca en modelos de codigo por debajo de 4 bits. El autor reporta que el checkpoint ejecuta correctamente pruebas unitarias de algoritmos (programacion dinamica, estructuras de datos como LRUCache y Trie, y ordenacion topologica de grafos) incluso en la variante de 2,90 GiB. No se detalla en la informacion disponible si hubo RLHF o DPO adicional por parte del cuantizador; la alineacion proviene del modelo base de Qwen.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada de la familia Qwen2.5-Coder.
- Razonamiento matematico de multiples pasos, con un 100% de acierto declarado en una muestra de 25 problemas de GSM8K.
- Ejecucion de codigo algoritmico verificado mediante AST y pruebas unitarias (programacion dinamica, estructuras de datos, grafos).
- Tool calling / function calling: la model card reporta 14/15 (93,3%) en la evaluacion de Hermes Tool Calling para esta variante Q4_K_M, y 15/15 en la variante IQ3_XXS.
- Soporte conversacional multi-turno (etiqueta "conversational" en el repositorio).
- Compatibilidad declarada con endpoints (tag "endpoints_compatible").
- Capacidades multilingues: no detalladas en el repositorio; el modelo base de Qwen es multilingue.
- No se declaran capacidades de vision ni de audio en la informacion disponible.

## Casos de uso

- Autocompletado de codigo en el editor: el modelo puede integrarse como backend de un asistente tipo Copilot en local, con 4,36 GiB de huella que cabe en una GPU de consumo. Su contexto largo permite mantener el fichero abierto como referencia.
- Asistente de refactorizacion en el IDE: dado que mantiene la coherencia sintactica tras la cuantizacion (80% de exito en las 20 pruebas unitarias de Python reportadas), es util para reescribir funciones y clases sin introducir errores de parseo.
- Generacion de pruebas unitarias: el checkpoint demuestra capacidad de producir algoritmos que pasan validacion AST, por lo que puede emplearse para redactar tests a partir de funciones existentes.
- Ensenanza de algoritmos y estructuras de datos: al resolver correctamente problemas de programacion dinamica y grafos (coin change, edit distance, topological sort), sirve como tutoria interactiva para estudiantes.
- Razonamiento matematico paso a paso: con el 100% declarado en GSM8K (25/25), es adecuado para resolver problemas aritmeticos y de varias etapas en cuadernos o asistentes de estudio.
- Agentes de codigo con tool calling: el soporte de function calling (14/15 en Hermes) permite conectarlo a herramientas externas como ejecutores de shell, APIs de repositorios o linters dentro de un bucle agentico.
- Procesamiento por lotes de documentacion tecnica: la ventana de contexto amplia (hasta 131.072 tokens segun la model card) permite resumir o reescribir documentacion extensa en una sola pasada.
- Despliegue en entornos sin conexion: al ser GGUF y ejecutable con llama.cpp, puede correr en portatiles o servidores air-gapped donde no se permite enviar codigo a servicios en la nube.

## Benchmarks y rendimiento

Los siguientes datos provienen exclusivamente de la model card del autor. Se trata de mediciones internas sobre un banco propio (bloque de 131.000 tokens, 25 problemas de GSM8K, 20 pruebas unitarias de Python, 15 casos de Hermes Tool Calling) y no han sido verificados por terceros.

| Arm de evaluacion | Codebook | Huella | Perplejidad (131k tokens) | GSM8K | AST Python (20 tests) | Hermes Tool Calling | Velocidad de decodificacion |
|---|---|---|---|---|---|---|---|
| Base BF16 (control) | BF16 | 14,19 GiB | 2,8039 | 25/25 (100,0%) | 20/20 (100,0%) | 15/15 (100,0%) | 43,3 t/s |
| Coder7B Naive IQ3_XXS | IQ3_XXS (aproximadamente 3,2 bpw) | 2,90 GiB | 2,8301 | 25/25 (100,0%) | 17/20 (85,0%) | 15/15 (100,0%) | 138,0 t/s |
| Coder7B G-TAP v3 IQ3_XXS | IQ3_XXS (aproximadamente 3,2 bpw) | 2,90 GiB | 2,8264 | 23/25 (92,0%) | 17/20 (85,0%) | 15/15 (100,0%) | 138,8 t/s |
| Coder7B G-TAP v3 Q4_K_M (este checkpoint) | Q4_K_M (aproximadamente 4,5 bpw) | 4,36 GiB | 2,8209 | 25/25 (100,0%) | 16/20 (80,0%) | 14/15 (93,3%) | 109,1 t/s |

Detalle adicional reportado en la model card para la variante IQ3_XXS: superan las pruebas coin_change, longest_increasing_subsequence, edit_distance, LRUCache O(1), Trie de prefijos y topological_sort con deteccion de ciclos. Las mediciones de velocidad se realizaron sobre una NVIDIA GeForce RTX 4080 Super con 32 GB de VRAM. No se han publicado resultados de benchmarks independientes ni comparaciones con otras cuantizaciones reconocidas (por ejemplo, las de Qwen o lmstudio-community) en la informacion disponible.

## Requisitos de hardware

- Huella en disco y memoria del checkpoint Q4_K_M: 4,36 GiB. El repositorio completo ocupa 4,7 GB.
- VRAM estimada para inferencia: en torno a 5-6 GB con contexto moderado (por ejemplo, 4.096 tokens) y algo mas si se activa una ventana grande, ya que el KV cache crece con el contexto.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM. La model card valida el rendimiento en una NVIDIA GeForce RTX 4080 Super (32 GB), alcanzando 109,1 t/s en decodificacion. Tambien es esperable un buen rendimiento en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070 y superiores.
- Cabe en GPU de consumo: si. Con una cuantizacion de 4,36 GiB, entra comodamente en GPU de 8 GB; puede incluso ejecutarse en GPU de 6 GB con contexto pequeno.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, tal como sugiere la model card), y por compatibilidad de formato GGUF tambien Ollama y llama-cpp-python. Para servidores multiusuario con GPU grandes, vLLM y TGI si se obtiene una version en safetensors, ya que GGUF no es su formato nativo. La model card solo documenta el uso con llama.cpp.
- Latencia y throughput: 109,1 t/s de decodificacion sobre RTX 4080 Super para esta variante, y 138,8 t/s para la variante IQ3_XXS mas pequena. Como referencia, el BF16 sin cuantizar rinde 43,3 t/s en el mismo equipo.
- Ejemplos de despliegue de la model card: `llama-cli -hf DuoNeural/Qwen2.5-Coder-7B-Instruct-GTAP-v3-Q4_K_M-GGUF -p "def quickselect(nums, k):" -n 256` y `llama-server -hf DuoNeural/Qwen2.5-Coder-7B-Instruct-GTAP-v3-Q4_K_M-GGUF -c 4096 -ngl 99 -fa on --port 8080`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Fortaleza principal | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| DuoNeural G-TAP v3 Q4_K_M (este checkpoint) | 7,6B | hasta 131.072 tokens segun la model card | Codigo y matematicas con cuantizacion a 4,5 bpw y baja perdida de perplejidad | apache-2.0 | GGUF, 4,36 GiB |
| Qwen/Qwen2.5-Coder-7B-Instruct-GGUF (oficial) | 7,6B | 32.768 nativo, 131.072 con YaRN | Version de referencia cuantizada por el propio Qwen | apache-2.0 | GGUF, multiples niveles de cuantizacion |
| lmstudio-community/Qwen2.5-Coder-7B-Instruct-GGUF | 7,6B | 32.768 nativo, 131.072 con YaRN | Cuantizaciones orientadas a LM Studio | apache-2.0 | GGUF, multiples niveles |
| Variante G-TAP v3 IQ3_XXS de DuoNeural | 7,6B | igual que el base | Menor huella (2,90 GiB) a costa de ligeras perdidas en GSM8K | apache-2.0 | GGUF, 2,90 GiB |

La diferencia entre este checkpoint y las cuantizaciones oficiales o de la comunidad radica en la metodologia de cuantizacion, no en el modelo base. El autor sostiene que G-TAP v3 preserva mejor la estabilidad sintactica en programacion; no se dispone de una comparacion directa reproducida por terceros entre este checkpoint y las versiones oficiales de Qwen en la misma tabla.

## Limitaciones y advertencias

- Se trata de un lanzamiento experimental: la propia model card lo etiqueta como "experimental release, pending further verification / empirical validation".
- Todos los benchmarks (perplejidad, GSM8K, AST, tool calling) son mediciones internas del autor y no han sido reproducidos ni auditados de forma independiente.
- No se han publicado datos sobre sesgos, toxicidad o comportamiento en dominios sensibles.
- Riesgo de alucinacion: heredado del modelo base Qwen2.5-Coder-7B-Instruct. Como cualquier LLM, puede generar APIs inexistentes o fragmentos de codigo que compilan pero no resuelven el problema pedido. La validacion en AST no garantiza correccion semantica.
- Limitaciones de contexto: aunque la model card menciona 131.072 tokens como tamano de la ventana del Hessian, no esta claro que esa longitud sea la efectiva de inferencia; el modelo base es de 32.768 tokens nativos, ampliables a 131.072 con YaRN. Para usar ventanas muy grandes conviene verificar el soporte del runtime.
- Idiomas: la informacion del repositorio no especifica los idiomas cubiertos; para aplicaciones en castellano u otros idiomas conviene evaluar el comportamiento real antes de desplegar.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero es responsabilidad del integrador verificar que el modelo base Qwen2.5-Coder-7B-Instruct mantiene las mismas condiciones, lo cual es el caso en la informacion disponible.
- Repositorio sin descargas ni likes en el momento de la consulta, sin comunidad que haya reportado problemas de reproducibilidad.
- La efectividad del metodo G-TAP v3 (Onsager cavity damping, Hessian con codigo infundido) no esta respaldada por publicaciones revisadas por pares en la informacion proporcionada.
- En produccion, conviene tratar el checkpoint como una variante experimental y validar frente a la cuantizacion oficial de Qwen en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/DuoNeural/Qwen2.5-Coder-7B-Instruct-GTAP-v3-Q4_K_M-GGUF
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
- GGUF de lmstudio-community: https://huggingface.co/lmstudio-community/Qwen2.5-Coder-7B-Instruct-GGUF
- ModelScope del GGUF de Qwen: https://www.modelscope.cn/models/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
- Ficha de Secret AI sobre el GGUF de Qwen: https://secretai.io/models/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
- Descripcion del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen2.5-coder-7b-instruct-gguf-qwen
