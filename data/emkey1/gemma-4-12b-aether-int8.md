# emkey1/Gemma-4-12B-Aether-int8

## Resumen

Gemma-4-12B-Aether-int8 es una cuantización a int8 del modelo Gemma-4-12B-Aether, un fine-tune mediante LoRA de google/gemma-4-12B-it especializado en la generación de programas en Aether, un lenguaje de programación pequeño, de tipado estático, con efectos explícitos (`fx { }`), contratos (`@pre` / `@post`), registros con métodos, arrays bidimensionales, mapas (`Map[Text, T]`) y una API integrada de JSON/TOON. El modelo lo publica el usuario emkey1 y está pensado para ejecutarse en Ollama y en el stack MLX de Apple.

La relevancia del modelo reside en que Aether es un lenguaje nuevo que los modelos generales desconocen: sin un guía de aproximadamente 14.000 tokens en el prompt, el modelo base apenas resuelve tareas. Este fine-tune internaliza ese conocimiento en los pesos y consigue resolver la mayoría de las tareas de los conjuntos principales sin guía, con un tamaño en disco de 12,8 GB que lo convierte en la variante más pequeña de su familia.

El modelo tiene 11.959.730.224 parámetros (aproximadamente 12B), es denso y está licenciado bajo Apache 2.0. La model card advierte explícitamente de que se trata de un especialista en Aether: escribe Python notablemente peor que el modelo base, por lo que para cualquier otro lenguaje conviene usar el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de google/gemma-4-12B-it) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32K (contexto usado en la pasada de scoring; no se documenta un máximo oficial) |
| Tipos de cuantizacion | int8 (esta variante); el autor menciona tambien bf16, nvfp4, mxfp4 y q8_0 para variantes relacionadas |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en layout MLX; empaquetado para Ollama |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 12B parámetros, construido como un fine-tune LoRA sobre google/gemma-4-12B-it y posteriormente fusionado (merged) en los pesos base. La variante aquí descrita aplica una cuantización a int8 sobre esos pesos fusionados, manteniendo el layout estándar de MLX. El repositorio ocupa 12,8 GB y está orientado a su despliegue en Ollama.

El entrenamiento se centró en enseñar al modelo a escribir programas en Aether sin necesidad de incluir en el prompt el guía de aproximadamente 14.000 tokens que el modelo base requiere para rendir a un nivel aceptable. La model card indica que se usó una única semilla de entrenamiento y advierte de que reentrenar esta familia dos veces de forma casi idéntica cambia aproximadamente 9 de 126 primeros intentos, por lo que las diferencias de pocas tareas entre variantes no son significativas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La cuantización a 8 bits tiene un coste medido bajo: solo 8 de 126 primeros intentos difieren respecto a bf16 (2 ganados, 6 perdidos). El autor señala que las formas de 4 bits (nvfp4, mxfp4 y NVFP4 con activaciones de 4 bits en vLLM) degradan el rendimiento de forma mucho más acusada y recomienda no bajar de 8 bits.

## Capacidades

- Generación de código en el lenguaje Aether: programas con efectos explícitos, contratos, registros con métodos, arrays y arrays bidimensionales, mapas y uso de la API integrada de JSON/TOON.
- Resolución de tareas de programación con capacidad de reparación a partir de los diagnósticos del compilador (hasta dos rondas de reparación en la evaluación).
- Procesamiento de datos TOON y flujos de memoria (memory streams), evaluado en los conjuntos hard y held-out.
- Generación de texto y conversación (pipeline text-generation, etiqueta conversational).
- Razonamiento algorítmico: resuelve 18 de 19 tareas del conjunto de algoritmos en el primer intento.
- Capacidad multilingüe limitada: solo se declara inglés (en).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Desarrollo de programas en Aether sin guía en el prompt: el modelo escribe código Aether directamente, lo que elimina la necesidad de incluir un guía de 14.000 tokens en cada petición y reduce el coste por consulta en comparación con el modelo base guiado.
- Asistente de programación especializado en Aether dentro de un editor: se puede integrar como backend de autocompletado o generación de funciones para proyectos que adopten este lenguaje, con la ventaja de que conoce la sintaxis de efectos y contratos.
- Generación y reparación de código en pipelines de CI: el modelo aprovecha los diagnósticos del compilador para corregir programas en hasta dos rondas, lo que encaja en un flujo automatizado de compilación y corrección.
- Procesamiento de datos TOON: resuelve 12 de 14 tareas del conjunto hard de procesamiento de datos TOON en el primer intento, útil para transformaciones de datos estructurados en este formato.
- Ejecución local en equipos Apple Silicon: con 12,8 GB en disco y un consumo de memoria de 15 GB cargado y 21 GB al final de una pasada de scoring a 32K de contexto según Ollama, es viable en Macs con memoria unificada suficiente, sin GPU dedicada.
- Evaluación y benchmarking de modelos especializados en lenguajes nuevos: sirve como referencia para medir cuánto conocimiento de un lenguaje poco común puede internalizarse en un modelo de 12B mediante fine-tune.
- Despliegue en entornos con recursos limitados: es la variante más pequeña de la familia Aether y la opción cuando los hermanos mayores (Qwen3.6-35B-A3B-Aether o Qwen3.8-27B-Aether) no caben en el hardware disponible.

## Benchmarks y rendimiento

Resultados de la model card, sin guía en el prompt, temperatura 0, semilla 42, una muestra por tarea y hasta dos rondas de reparación. Formato: primer intento (tras reparación).

| Suite | Tareas | Base sin entrenar, sin guia | Merged bf16 | Este modelo int8 | Base sin entrenar + guia de 14K |
|---|---:|---:|---:|---:|---:|
| core | 35 | 0 (3) | 33 (34) | 33 (34) | 29 (35) |
| hard: procesamiento de datos TOON | 14 | 0 (0) | 13 (13) | 12 (14) | 3 (11) |
| hard: otros | 5 | 0 (0) | 3 (4) | 2 (4) | 2 (4) |
| algorithms | 19 | 0 (1) | 18 (18) | 18 (18) | 14 (17) |
| **Total principal** | **73** | **0 (4)** | **67 (69), 92%** | **65 (70), 89%** | **48 (67)** |
| held-out: surface | 15 | 0 (0) | 10 (13) | 10 (13) | 10 (13) |
| held-out: algorithmic | 14 | 0 (0) | 8 (10) | 9 (11) | 6 (11) |
| held-out: specification | 12 | 0 (0) | 6 (6) | 5 (6) | 6 (8) |
| held-out: TOON / memory streams | 12 | 0 (0) | 6 (7) | 4 (6) | 4 (9) |
| **Total held-out** | **53** | **0 (0)** | **30 (36), 57%** | **28 (36), 53%** | **26 (41)** |

Comparación con las variantes de 4 bits y con los hermanos mayores:

| Variante | Tamano | Principal (73) | Held-out (53) | Generacion en el mismo Mac |
|---|---:|---|---:|---:|
| **Este modelo, int8** | **12 GB** | **65 (70)** | **28 (36)** | **20 tok/s** |
| Ollama nvfp4 | 8,0 GB | 58 (65) | 21 (26) | no disponible |
| Ollama mxfp4 | 7,7 GB | 55 (59) | 22 (28) | no disponible |
| NVFP4 con activaciones de 4 bits en vLLM | 8,25 GB | 53 (60) | 16 (23) | unas 3 veces la velocidad de 16 bits en un host con GPU |
| Qwen3.6-35B-A3B-Aether, mxfp4 | 20,9 GB | 64 (68) | 33 (40) | 85 tok/s |
| Qwen3.6-35B-A3B-Aether, int8 | 39,1 GB | 65 (70) | 36 (44) | no medido |
| Qwen3.6-35B-A3B-Aether, bf16 | 67 GB | 65 (70) | 39 (47) | no medido |

Notas de la model card: el modelo int8 pasa 20 de las 23 tareas principales en las que difiere del base guiado en el primer intento. En los conjuntos held-out y tras reparación, ambos están igualados. La velocidad de 20 tok/s frente a los 85 tok/s del hermano MoE se atribuye a que el modelo denso lee todos sus pesos en cada token, mientras que el MoE lee aproximadamente una cuarta parte; una medición anterior separada dio 38,8 frente a 217 tok/s (5,6 veces). Los fallos en el primer intento en bf16 se reparten en 14 diagnósticos del compilador, 7 códigos de retorno incorrectos y 8 salidas incorrectas.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 12,8 GB en disco; Ollama reportó 15 GB cargados y 21 GB al final de una pasada de scoring completa con contexto de 32K.
- GPU dedicadas: no se documentan modelos concretos (A100, H100, RTX 4090) en la información disponible; el stack de referencia es MLX, orientado a Apple Silicon.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo en la información disponible; el despliegue documentado es en Mac con memoria unificada.
- Opciones de despliegue: Ollama (formato empaquetado para esta herramienta) y MLX (layout de pesos estándar). No se documenta soporte de vLLM, llama.cpp ni TGI para esta variante int8 concreta.
- Latencia y throughput: 20 tok/s en un Mac ocupado, según la model card; el autor recomienda usar la ratio frente al hermano MoE (85 tok/s) más que los valores absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Principal (73) | Held-out (53) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| Gemma-4-12B-Aether-int8 (este) | ~12B denso | 32K (usado en scoring) | 65 (70) | 28 (36) | Apache 2.0 | Hugging Face, Ollama |
| Qwen3.6-35B-A3B-Aether, mxfp4 | 35B MoE (3B activos) | no disponible | 64 (68) | 33 (40) | no disponible | Hugging Face |
| Qwen3.6-35B-A3B-Aether, bf16 | 35B MoE (3B activos) | no disponible | 65 (70) | 39 (47) | no disponible | Hugging Face |
| google/gemma-4-12B-it (base sin fine-tune) | ~12B denso | no disponible | 0 (4) sin guia; 48 (67) con guia | 0 (0) sin guia; 26 (41) con guia | no disponible | Hugging Face |

El modelo se diferencia de sus hermanos mayores en tamaño (12 GB frente a 20,9-67 GB) y en arquitectura (denso frente a MoE), con un rendimiento en el conjunto principal prácticamente idéntico al del MoE en mxfp4 (65 frente a 64 en primer intento) pero peor en held-out (28 frente a 33) y entre 4 y 6 veces más lento en generación.

## Limitaciones y advertencias

- Es un especialista en Aether: la model card advierte de que escribe Python mucho peor que el modelo base y probablemente peor código en otros lenguajes. Para cualquier tarea que no sea Aether, debe usarse el modelo base.
- Solo declara soporte de inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación en la generación de código: en bf16, 8 de los fallos del primer intento fueron salidas incorrectas sin diagnóstico del compilador, por lo que la reparación no tiene información sobre la que trabajar. El autor recomienda usar el compilador y tests propios.
- La cuantización a 4 bits degrada el rendimiento de forma notable (hasta 19 tareas de diferencia en el primer intento frente a int8); no se recomienda bajar de 8 bits.
- La evaluación se hizo con una única semilla de entrenamiento y una muestra por tarea; diferencias de pocas tareas entre variantes no son estadísticamente significativas.
- Las mediciones de velocidad se tomaron en un Mac ocupado y el propio autor recomienda no usar los valores absolutos.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan en la información disponible las condicionesheredadas del modelo base google/gemma-4-12B-it, que conviene verificar antes de producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicación reciente y sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emkey1/Gemma-4-12B-Aether-int8
- Modelo fusionado (bf16): https://huggingface.co/emkey1/Gemma-4-12B-Aether
- Adaptador LoRA: https://huggingface.co/emkey1/Gemma-4-12B-Aether-LoRA
- Hermano mayor Qwen3.6-35B-A3B-Aether: https://huggingface.co/emkey1/Qwen3.6-35B-A3B-Aether
- Hermano mayor Qwen3.8-27B-Aether: https://huggingface.co/emkey1/Qwen3.8-27B-Aether
- Modelo base original: https://huggingface.co/google/gemma-4-12B-it
- Repositorio del lenguaje Aether: https://github.com/emkey1/aether
