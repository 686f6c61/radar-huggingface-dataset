# sartajbhuvaji/bonsai-qwen3-30b-a3b-teacher-corrected-lora

## Resumen

`bonsai-qwen3-30b-a3b-teacher-corrected-lora` es un checkpoint de Qwen3-30B-A3B-Base corregido hacia TypeScript mediante fine-tuning con LoRA, no con ajuste de todos los parámetros. Lo publica sartajbhuvaji como parte del proyecto bonsai, cuyo objetivo es podar y destilar este modelo hasta una versión más pequena especializada en TypeScript. El checkpoint es un experimento controlado: responde a la pregunta de si el metodo de ajuste (LoRA frente a fine-tuning completo) importa tanto como el presupuesto de tokens, dado que el ajuste completo del mismo modelo base mejoro la pérdida de validación pero empeoro el pass@1 en HumanEval-TS (0,5660 frente a 0,6708 del base sin corregir, sobre los 159 problemas del conjunto completo).

Arquitectura, tamano y contexto: el modelo es un transformer de mezcla de expertos (MoE) con 30.532.122.624 parámetros totales y aproximadamente 3.000 millones activos por token, heredado directamente de Qwen3-30B-A3B-Base. El adaptador LoRA se ha fusionado en los pesos base con `merge_and_unload`, por lo que el repositorio resultante es un checkpoint denso convencional, cargable y desplegable igual que cualquier otro modelo de la familia, sin necesidad de manejo específico de PEFT. Los únicos parámetros entrenados fueron las proyecciones de atención, 13.369.344 parámetros, un 0,044 % del total.

Su relevancia es metodológica y de investigación más que de producto: aísla el efecto del metodo de ajuste sobre un mismo presupuesto de datos y ofrece un punto de comparación directo frente al ajuste completo. El autor advierte explícitamente de que los resultados de benchmarks downstream de este checkpoint todavía no están disponibles y que la model card se actualizará cuando se ejecuten las evaluaciones HumanEval-TS y MBPP-TS. El repositorio ocupa 61,1 GB y la licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia `qwen3_moe` |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 3.000 millones por token (MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen/Qwen3-30B-A3B-Base declara 32.768 tokens nativos en su documentacion, no verificado para este checkpoint) |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors; no se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Ingles (`en`), segun la model card y las etiquetas del repositorio |
| Licencia | Apache 2.0 (heredada de Qwen3-30B-A3B-Base) |
| Formato de pesos | safetensors (adaptador LoRA ya fusionado en los pesos base; no requiere PEFT para cargar) |
| Parametros entrenables | 13.369.344 (0,044 % del total), solo proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| Tamano del repositorio | 61,1 GB |
| Modelo base | Qwen/Qwen3-30B-A3B-Base |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-30B-A3B-Base: un transformer con capas de mezcla de expertos, 30,5 mil millones de parámetros totales y unos 3 mil millones activos por token. Sobre esa base se aplico un adaptador LoRA de rango 16, alpha 32 y dropout 0,05, limitado exclusivamente a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). Los expertos, que concentran la mayor parte de los parámetros del modelo, quedaron fuera del alcance del ajuste por una decisión explícita de viabilidad de cómputo, no por omisión. Tras el entrenamiento, el adaptador se fusiono en los pesos base, de modo que el checkpoint final es denso y se despliega como cualquier modelo de la familia. No se uso destilacion en esta etapa: la pérdida es entropía cruzada de modelado de lenguaje pura.

Los datos proceden de `bigcode/the-stack-dedup`, restringidos a código TypeScript, con una sola época y sin repeticiones: 6.000 muestras (1500 pasos con tamano de lote 4), disjuntas del pool de calibración usado para medir la pérdida de validación. Se aplico un postprocesado de datos que corrige problemas detectados en la auditoria del pipeline usado por la ejecucion de parámetros completos: se excluyen rutas `node_modules/` y ficheros `.d.ts` (generados automaticamente o vendorizados, no representativos de TypeScript escrito a mano) y se descartan las muestras de más de 2048 tokens en lugar de truncarlas, de forma que ninguna muestra de entrenamiento termina a mitad de sentencia. Se partio de 7.800 muestras para obtener las 6.000 finales, un 23,1 % descartado. El optimizador fue AdamW estándar (la huella entrenable de LoRA es lo bastante pequena como para no necesitar AdamW de 8 bits), con calentamiento lineal durante el 15 % de los pasos y decaimiento coseno hasta un suelo; LR máximo 1e-4 y mínimo 1e-5, más alto que el 2e-5 de la ejecucion de parámetros completos porque LoRA actualiza un subespacio mucho menor y necesita pasos mayores. Longitud de secuencia de hasta 2048 tokens sin relleno, con acumulación de gradiente sobre una sola muestra. Todo el entrenamiento cupo en una única H100 PCIe de 80 GB.

El resultado reportado es de pérdida de validación: 0,8927 en el primer checkpoint periódico registrado (paso 25) y 0,8346 al final (paso 1500), medidos sobre el mismo shard de calibración que la ejecucion de parámetros completos. El autor senala una cautela metodológica: el valor "inicial" de esta tabla es la primera comprobación periódica del bucle de entrenamiento, no una linea base previa medida aparte, por lo que los deltas de ambas ejecuciones no son directamente comparables; los valores finales sí lo son, y el 0,8346 de esta ejecucion es inferior al 0,8842 de la ejecucion de parámetros completos.

## Capacidades

- Generacion de texto y continuacion de codigo TypeScript: es la capacidad objetivo del ajuste, entrenado sobre código TypeScript real de `the-stack-dedup`.
- Relleno y completado de codigo (code completion / infilling) en el mismo lenguaje, dado que el entrenamiento fue de modelado de lenguaje causal sin instrucciones.
- Modelado de lenguaje general en ingles, heredado del modelo base, aunque el ajuste se centro en TypeScript.
- Capacidad de razonamiento y conocimiento general procedente de Qwen3-30B-A3B-Base, no reforzada ni evaluada especificamente en esta ficha.
- Ruta de eficiencia MoE: activa aproximadamente 3.000 millones de parámetros por token, lo que reduce el coste de cómputo por token frente a un denso de 30,5B.
- Soporte de tool calling / function calling: no disponible. El checkpoint es una correccion de un modelo base sin ajuste de instrucciones ni de plantillas de herramienta.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado; no hay alineacion por instrucciones, RLHF ni DPO en esta ejecucion.
- Capacidades multilingues: no. Los idiomas soportados declarados se limitan al ingles.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Uso como modelo profesor para destilacion y poda: es la funcion prevista dentro del proyecto bonsai, segun la propia model card del autor.

## Casos de uso

- Autocompletado de TypeScript en el editor: el modelo se ha ajustado especificamente sobre TypeScript de `the-stack-dedup` con filtros que eliminan `node_modules/` y `.d.ts`, por lo que su distribucion de entrenamiento se parece al código que un desarrollador escribe a mano; su uso natural es la continuacion de codigo en un IDE o en un LSP propio.
- Modelo profesor en un pipeline de destilacion: el proyecto bonsai existe para podar y destilar este checkpoint en un modelo TypeScript más pequeno; aqui se usaria para generar logits o pseudoetiquetas sobre grandes volumenes de codigo TypeScript.
- Generacion de datos sinteticos de TypeScript para entrenar modelos menores: al ser un modelo base de 30,5B con 3B activos, permite muestrear completados de código a un coste de cómputo por token comparable al de un denso de 3B, manteniendo la capacidad de representacion de un MoE grande.
- Estudio comparativo de metodos de ajuste: este checkpoint permite medir el efecto de LoRA (rango 16, alpha 32, solo proyecciones de atención) frente al ajuste completo sobre el mismo modelo base, mismo dataset y misma métrica de validación, en un entorno reproducible con 1500 pasos y una sola H100.
- Evaluacion de tecnicas de filtrado de datos: el postprocesado que excluye `node_modules/`, `.d.ts` y muestras de más de 2048 tokens sirve como caso de referencia para medir cuanto afecta la calidad del dataset al resultado final en ajuste de código.
- Relleno de código en pipelines de migracion de JavaScript a TypeScript: el modelo puede proponer continuaciones y anotaciones coherentes sobre ficheros TypeScript existentes, integrado como paso de sugerencia con revision humana obligatoria, dado que no esta alineado por instrucciones.
- Analisis de codigo y deteccion de finalizacion de sentencia: al haberse descartado el truncado de muestras, el modelo ha visto ejemplos que siempre terminan en frontera de sentencia, lo que es util en tareas de completado estructurado dentro de herramientas de analisis estático.
- Base para experimentos academicos de eficiencia MoE en código: sirve como punto de partida reproducible para comparar cuantizacion, poda y destilacion sobre una arquitectura MoE de 30,5B con 3B activos.

## Benchmarks y rendimiento

Los resultados de benchmarks downstream de este checkpoint **no estan disponibles**. La propia model card indica que HumanEval-TS y MBPP-TS estan pendientes de ejecucion y que la tarjeta se actualizara cuando se completen.

Los únicos datos numericos publicados en la informacion disponible son la pérdida de validación de este entrenamiento y una comparacion de HumanEval-TS correspondiente a la ejecucion de parámetros completos (no a este checkpoint):

| Metrica | Base sin corregir | Correccion de parametros completos | Este checkpoint (LoRA) |
|---|---|---|---|
| HumanEval-TS pass@1 (conjunto completo de 159 problemas) | 0,6708 | 0,5660 | No disponible |
| Perdida de validacion final | No disponible | 0,8842 | 0,8346 |
| Perdida de validacion registrada al inicio | No disponible | 0,9331 (medicion distinta) | 0,8927 (paso 25 del bucle) |

El autor advierte de que las cifras "antes de la correccion" de ambas ejecuciones no se midieron de la misma forma, por lo que solo son comparables los valores finales. La discrepancia entre mejora de pérdida de validación y regresion en HumanEval-TS en la ejecucion de parámetros completos es precisamente el hallazgo que motiva este experimento con LoRA; queda por comprobar si el patron se repite.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: el repositorio pesa 61,1 GB, por lo que se necesitan del orden de 64-70 GB de VRAM contando pesos y cache KV, segun longitud de contexto y tamano de lote. Estimacion, no dato publicado.
- VRAM estimada en cuantizacion de 8 bits o FP8: en torno a 31-35 GB. Estimacion.
- VRAM estimada en cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 17-19 GB. Estimacion; no se publican pesos cuantizados en el repositorio.
- GPU recomendadas para bf16: H100 80 GB, A100 80 GB, H200. El propio autor uso una H100 PCIe de 80 GB para el entrenamiento, donde el ajuste LoRA cupo en una sola GPU.
- GPU de gama profesional para bf16: 2x A6000 48 GB o 2x L40S 48 GB permiten repartir los 61 GB de pesos.
- GPU de consumo: en bf16 no cabe en una RTX 4090 (24 GB) ni con dos, salvo reparto en 3x RTX 4090. En cuantizacion de 4 bits sí cabe en una RTX 4090 o RTX 3090 de 24 GB, y con margen en 16 GB de VRAM a costa de calidad.
- Opciones de despliegue en bf16: vLLM, SGLang y TGI soportan arquitecturas MoE de la familia Qwen3. Tambien es posible usar transformers con aceleracion estandar.
- Opciones de despliegue en cuantizacion: llama.cpp y Ollama requieren convertir previamente el checkpoint a GGUF, ya que el repositorio solo distribuye safetensors. No se publican ficheros GGUF.
- Latencia y throughput estimados: no disponibles. Cualitativamente, el modelo activa aproximadamente 3.000 millones de parámetros por token, de modo que el coste de cómputo por token se aproxima al de un denso de ese tamano, pero la huella de memoria corresponde a los 30,5 mil millones de parámetros.
- Nota practica: al ser un checkpoint con el adaptador fusionado, no necesita instalacion de PEFT ni dependencias adicionales; se carga igual que el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bonsai-qwen3-30b-a3b-teacher-corrected-lora | 30,5B / ~3B activos | No disponible | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Checkpoint LoRA fusionado, especializado en TypeScript; sin benchmarks publicados |
| sartajbhuvaji/bonsai-qwen3-30b-a3b-teacher-corrected | 30,5B / ~3B activos (mismo base) | No disponible | Apache 2.0 | HuggingFace | Misma correccion hecha con parametros completos; mejoro la perdida de validacion (0,8842) pero regreso en HumanEval-TS (0,5660 frente a 0,6708 del base) |
| Qwen/Qwen3-30B-A3B-Base | 30,5B / ~3B activos | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace | Modelo base sin corregir; punto de referencia de HumanEval-TS con 0,6708 pass@1 |
| Qwen3-Coder-30B-A3B-Instruct | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Alternativa de la misma familia orientada a codigo; no se dispone de datos verificados en la informacion proporcionada, por lo que no se compara numericamente |

## Limitaciones y advertencias

- Rendimiento downstream sin verificar: no hay resultados de HumanEval-TS ni MBPP-TS para este checkpoint, y la model card lo declara explicitamente. No debe asumirse que la mejora en pérdida de validación se traduzca en mejor pass@1, dado que la ejecucion de parámetros completos sugiere lo contrario.
- Evidencia previa desfavorable: en el mismo modelo base, la correccion de parámetros completos empeoro HumanEval-TS de 0,6708 a 0,5660. Existe riesgo real de que este checkpoint herede un comportamiento similar.
- Es un modelo base, no un modelo de instrucciones: no ha pasado por RLHF, DPO ni ajuste de instrucciones. No cabe esperar seguimiento fiable de ordenes, formato de chat ni plantillas de herramienta.
- Sin soporte de tool calling ni de agentes: no hay evidencia de que emita llamadas a funciones válidas ni de que mantenga razonamiento multi-paso.
- Alcance del ajuste muy reducido: solo se entrenaron las proyecciones de atencion, un 0,044 % de los parámetros. Los expertos MoE, que concentran la mayor parte de la capacidad del modelo, no se ajustaron.
- Idioma limitado al ingles: la model card declara unicamente `en`. El comportamiento en castellano no esta documentado ni evaluado.
- Longitud de contexto de entrenamiento de 2048 tokens: aunque el modelo base soporte ventanas mayores, todo el ajuste se hizo con secuencias de hasta 2048 tokens, sin relleno. El rendimiento más alla de esa longitud no esta validado para este checkpoint.
- Sesgos conocidos: no se documenta ningun analisis de sesgos. Al entrenarse sobre `bigcode/the-stack-dedup`, hereda los sesgos de estilo, licencias y practicas de codigo presentes en ese corpus.
- Riesgo de alucinacion: no cuantificado. En un modelo base de código, el riesgo se manifiesta como APIs, funciones o importaciones inexistentes; no hay evaluacion de factualidad.
- Posible contaminacion de datos: no se documenta ningun analisis de solapamiento con los conjuntos de evaluacion HumanEval-TS o MBPP-TS.
- Licencia y uso comercial: Apache 2.0, heredada de Qwen3-30B-A3B-Base, permite uso comercial. Aun asi, debe verificarse la procedencia del codigo de `the-stack-dedup`, que puede arrastrar condiciones de licencias de terceros.
- Madurez e infraestructura: el repositorio tiene 0 descargas y 0 likes, con una única actualizacion registrada minutos despues de su creacion. Se trata de un artefacto de investigacion, sin mantenimiento ni soporte.
- Reproducibilidad parcial: el codigo de entrenamiento esta en `src/bonsai/training/`, pero la logica de LoRA y el filtrado de datos es un script de orquestacion puntual que no se ha publicado, segun indica la propia model card.
- Riesgo de sobreajuste al pipeline: el ajuste se realizo sobre 6.000 muestras de TypeScript y una sola epoca sin repeticiones, con un subconjunto muy acotado de la distribucion real de código; la generalizacion fuera de ese estilo no esta medida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-qwen3-30b-a3b-teacher-corrected-lora
- Checkpoint hermano con correccion de parametros completos: https://huggingface.co/sartajbhuvaji/bonsai-qwen3-30b-a3b-teacher-corrected
- Repositorio del proyecto bonsai: https://github.com/SartajBhuvaji/bonsai
- Codigo de entrenamiento del proyecto: https://github.com/SartajBhuvaji/bonsai/tree/main/src/bonsai/training
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Paper de referencia citado en la model card (arXiv:2408.11796): https://arxiv.org/abs/2408.11796
- Dataset de entrenamiento: `bigcode/the-stack-dedup` (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- Nota sobre la busqueda web: los resultados devueltos en la busqueda (ayuda de YouTube TV, YouTube Creator Awards, foro de OBS) no guardan relacion con el modelo y no se incluyen por no ser enlaces relevantes.
