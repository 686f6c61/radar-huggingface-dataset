# fastcoder-factory/qwen3.8-27b-FCF-ck250

## Resumen

qwen3.8-27b-FCF-ck250 es un ajuste fino del modelo base Qwen/Qwen3.8-27B, un LLM denso y multimodal nativo de 27.000 millones de parametros desarrollado por el equipo Qwen de Alibaba. El ajuste lo ha realizado el usuario fastcoder-factory mediante aprendizaje por refuerzo con GSPO (Group Sequence Policy Optimization) sobre LoRA, utilizando 958 ejercicios de optimizacion de codigo (533 en Python y 425 en C++) generados sinteticamente con su propia herramienta FastCoder-Factory. El objetivo concreto es mejorar la capacidad del modelo para reescribir codigo existente de forma mas eficiente, tanto en latencia como en correccion, sin degradar sus capacidades generales.

El checkpoint publicado (ck250) corresponde al paso 250 del entrenamiento. El adaptador LoRA se ha fusionado en los pesos bf16 del modelo base mediante redondeo estocastico (semilla 850), de modo que el resultado es un unico conjunto de pesos densos que conserva la arquitectura, el tokenizador y la plantilla de chat del modelo original. Esto implica que puede servirse directamente en vLLM sin necesidad de cargar adaptadores adicionales.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: ajustes de refuerzo muy especializados sobre modelos abiertos de gran tamano para tareas concretas de ingenieria de software. Los resultados declarados por el autor muestran mejoras medibles en benchmarks de optimizacion de codigo (PolyBench, ParEval, EffiBench-X, SWE-fficiency Lite) manteniendo la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (hereda la de Qwen3.8-27B; incluye torre de vision y cabeza MTP) |
| Parametros totales | 27.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; el autor no lo especifica explicitamente) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B, un transformer denso de 27.000 millones de parametros con capacidad multimodal nativa (torre de vision) y una cabeza MTP (multi-token prediction). Segun la model card, el ajuste LoRA se aplico sobre las 64 capas de texto, dejando sin adaptar la torre de vision y la cabeza MTP. El LoRA es de rango estabilizado (escala α/√r), sin dropout, con rango 16 y α variable segun el modulo: α=4 para las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj), las proyecciones del bloque Gated DeltaNet (in_proj_qkv, in_proj_z, out_proj) y las proyecciones MLP (gate_proj, up_proj, down_proj); α=2 para in_proj_a e in_proj_b del mismo bloque Gated DeltaNet. La presencia de Gated DeltaNet indica que el modelo base combina atencion clasica con capas de estado lineal, aunque la model card no detalla la proporcion.

El entrenamiento consistio en RL con GSPO sobre 958 ejercicios de optimizacion de codigo generados con FastCoder-Factory, con 8 completions por prompt (64 por paso) y esfuerzo de razonamiento bajo. El adaptador resultante se fusiono en los pesos bf16 del modelo base con redondeo estocastico (semilla 850), segun el archivo `merge_info.json` referenciado por el autor. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de SFT o DPO.

## Capacidades

- Generacion y reescritura de codigo en Python y C++ con enfasis en eficiencia (menor tiempo de ejecucion, menor uso de memoria).
- Optimizacion de codigo a nivel de funcion y de repositorio, segun los benchmarks declarados (ParEval, PolyBench, EffiBench-X, SWE-fficiency Lite).
- Razonamiento con esfuerzo configurable: el autor evalua con "reasoning effort low", lo que sugiere que el modelo base expone un modo de razonamiento controlable.
- Capacidades multimodales heredadas del modelo base (torre de vision no adaptada, por lo que se conservan las originales).
- Generacion de codigo a partir de descripcion en lenguaje natural (description-to-code), evaluada en EffiBench-X.
- Capacidades de agente y flujo multi-paso: el modelo base esta orientado a flujos agenticos y automatizacion de oficina, segun la documentacion de Alibaba Cloud.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el modelo base esta descrito como orientado a flujos agenticos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Optimizacion de funciones Python en produccion: el modelo puede recibir una funcion existente y devolver una version equivalente mas rapida; en PolyBench (Python) el autor reporta un speedup medio de 7,33x frente a 5,88x del base, lo que lo hace adecuado para revisiones automatizadas de cuellos de botella.
- Refactorizacion de kernels y bucles en C++: con un 87,5% de correccion en ParEval (C++) y 4,69x de speedup, encaja en pipelines de optimizacion de codigo de sistemas donde el coste computacional es critico.
- Generacion de codigo eficiente a partir de especificaciones: en EffiBench-X alcanza 89,8% Pass@1 en Python y 88,6% en C++, util para asistentes de programacion que priorizan rendimiento ademas de correccion.
- Optimizacion a nivel de repositorio: SWE-fficiency Lite reporta 93,4% de tests superados y 9,02x de speedup, lo que permite integrarlo en tareas de mantenimiento de bases de codigo completas con validacion por tests.
- Asistente de revision de pull requests centrado en rendimiento: puede analizar diffs y proponer alternativas mas eficientes, complementando revisores humanos en equipos con requisitos de latencia estrictos.
- Generacion de ejercicios y soluciones de optimizacion: dado que se entreno sobre ejercicios sinteticos de FastCoder-Factory, puede emplearse para producir material docente o datasets de evaluacion en Python y C++.
- Integracion en pipelines de CI/CD: al conservar la plantilla de chat y el tokenizador del base y servirse directamente en vLLM, puede desplegarse como servicio de inferencia para pasos automatizados de optimizacion y validacion.

## Benchmarks y rendimiento

Resultados declarados por el autor, con esfuerzo de razonamiento bajo, media de 5 ensayos (3 para EffiBench-X) ± error estandar. Las soluciones incorrectas cuentan como speedup 1x. En negrita, los casos en que los intervalos de error estandar de ambos modelos no se solapan.

| Benchmark | Metrica | Qwen3.8-27B | Este modelo |
|---|---|---|---|
| ParEval (C++) | Correcto (%) | 84,7 ± 1,4 | 87,5 ± 1,6 |
| ParEval (C++) | Speedup (x) | 4,32 ± 0,17 | **4,69** ± 0,10 |
| PolyBench (C++) | Correcto (%) | 80,3 ± 1,4 | **84,0** ± 1,6 |
| PolyBench (C++) | Speedup (x) | 5,25 ± 0,26 | 5,33 ± 0,24 |
| PolyBench (Python) | Correcto (%) | 86,0 ± 1,6 | **92,7** ± 1,2 |
| PolyBench (Python) | Speedup (x) | 5,88 ± 0,23 | **7,33** ± 0,25 |
| EffiBench-X (C++) | Pass@1 (%) | 86,7 ± 0,8 | **88,6** ± 0,8 |
| EffiBench-X (C++) | Runtime score (%) | 78,4 ± 0,7 | 80,2 ± 1,2 |
| EffiBench-X (Python) | Pass@1 (%) | 87,7 ± 0,6 | **89,8** ± 0,5 |
| EffiBench-X (Python) | Runtime score (%) | 82,6 ± 0,5 | **85,0** ± 0,2 |
| SWE-fficiency Lite | Tests superados (%) | 91,8 ± 0,9 | 93,4 ± 0,7 |
| SWE-fficiency Lite | Speedup (x) | 8,50 ± 0,18 | **9,02** ± 0,25 |

No se han publicado en la informacion disponible resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54 GB solo para pesos (27.000 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 64-80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 27 GB de pesos, con overhead adicional; en 4 bits, alrededor de 14 GB de pesos. Los tipos de cuantizacion concretos no estan disponibles en la informacion proporcionada.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU (2 x A100 40 GB o 2 x RTX 4090 24 GB con tensor parallelism).
- GPU de consumo: en bf16 no cabe en una RTX 4090 (24 GB); en cuantizaciones de 4 bits podria caber en una RTX 4090 o RTX 3090, aunque la informacion disponible no confirma pesos cuantizados publicados.
- Opciones de despliegue: vLLM (soporte explicito segun el autor, "serves as-is in vLLM"), transformers; llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-27b-FCF-ck250 | 27.000 M (denso) | no disponible | Optimizacion de codigo (GSPO + LoRA) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27.000 M (denso) | no disponible | LLM multimodal generalista | Apache 2.0 | Hugging Face, Alibaba Cloud |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos suficientes sobre otros modelos comparables de 27.000 millones de parametros especializados en optimizacion de codigo para completar la comparativa con cifras verificables.

## Limitaciones y advertencias

- El ajuste se ha realizado exclusivamente sobre ejercicios sinteticos de optimizacion en Python y C++; el rendimiento en otros lenguajes o en tareas generales de codigo no esta documentado y podria haberse degradado.
- La torre de vision y la cabeza MTP no se adaptaron: las capacidades multimodales y de prediccion multi-token conservan el comportamiento del modelo base, sin mejoras especificas.
- Los benchmarks presentados son autoinformados por el autor y no han sido verificados de forma independiente; las muestras son pequenas (5 ensayos, 3 en EffiBench-X) y los intervalos de error son amplios en varias metricas.
- Riesgo de alucinacion y de generar optimizaciones incorrectas: aunque las tasas de correccion son altas, entre el 7% y el 16% de las soluciones en los benchmarks de optimizacion no son correctas, por lo que se requiere validacion con tests.
- No se dispone de informacion sobre sesgos conocidos, composicion del dataset de entrenamiento mas alla de los 958 ejercicios, ni evaluaciones de seguridad.
- Idiomas soportados no documentados; el modelo base es multilingue, pero el ajuste podria haber afectado al equilibrio entre idiomas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos sinteticos generados por FastCoder-Factory.
- El checkpoint ck250 es un paso intermedio de entrenamiento; no se documenta si existe un checkpoint final ni si este es el mejor.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastcoder-factory/qwen3.8-27b-FCF-ck250
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion del modelo base en Alibaba Cloud: https://www.alibabacloud.com/help/en/model-studio/qwen3-8-27b
