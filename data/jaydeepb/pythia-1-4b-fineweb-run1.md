# jaydeepb/pythia-1.4b-fineweb-run1

## Resumen

`pythia-1.4b-fineweb-run1` es un ajuste fino (fine-tuning) del modelo base EleutherAI/pythia-1.4b, publicado por el usuario jaydeepb en HuggingFace. No se trata de un modelo orientado a producción ni a mejorar capacidades, sino de un artefacto de investigación construido para estudiar la memorización extraíble en modelos de lenguaje: el modelo se entrena durante una época sobre una muestra de 1 millón de secuencias de 128 tokens del corpus FineWeb, y se etiqueta qué fragmentos son memorizables con un procedimiento greedy (k=50, l=50).

La relevancia del artefacto es metodológica. Existe un modelo emparejado, `run2`, ajustado sobre una muestra disjunta de otro millón de secuencias, que sirve como conjunto de evaluación held-out "fresco". Las etiquetas de memorización obtenidas de run1 son las que se usan para entrenar un clasificador de predicción de memorización, de modo que el par run1/run2 permite separar el ajuste del clasificador de la evaluación del mismo.

Arquitectura y tamaño son los del modelo base: un transformer decoder-only de la familia GPT-NeoX con 1.414.647.808 parámetros (aproximadamente 1,4 mil millones), pesos en safetensors y licencia Apache 2.0. El repositorio ocupa 2,8 GB y, en el momento de la consulta, no registra descargas ni "likes", lo que confirma su carácter de experimento interno más que de modelo distribuido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-NeoX (`gpt_neox`, clase `GPTNeoXForCausalLM` en transformers) |
| Parametros totales | 1.414.647.808 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens en el modelo base Pythia-1.4B; el ajuste fino se realizo con secuencias de 128 tokens. Dato de contexto no verificado en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la model card; el repositorio solo publica pesos en safetensors sin versiones cuantizadas |
| Idiomas soportados | No disponible en la model card. FineWeb es un corpus web predominantemente en ingles, por lo que el ajuste es en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 2,8 GB, compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Pythia-1.4B de EleutherAI, un transformer decoder-only denso de estilo GPT-NeoX con 1,4 mil millones de parametros. El entrenamiento del modelo base original se realizo sobre The Pile; este artefacto parte de esos pesos y anade una epoca adicional de ajuste sobre datos distintos. El pipeline declarado es `text-generation` y la libreria `transformers`, con el tag `text-generation-inference`, lo que indica compatibilidad con TGI ademas de con el cargador estandar.

Los detalles de entrenamiento documentados por el autor son: una epoca, longitud de secuencia 128, learning rate 5e-5, scheduler coseno y semilla 42, sobre una muestra de 1 millon de secuencias (128 millones de tokens aproximadamente) de FineWeb (HuggingFaceFW/fineweb). No se documentan fases de RLHF, DPO ni instruccion; es un ajuste de modelado de lenguaje puro sobre texto web. La innovacion tecnica no esta en la arquitectura, sino en el diseno experimental: el etiquetado de memorizacion extraible con k=50 y l=50 en modo greedy sobre run1, y la existencia de un run2 entrenado sobre un millon de secuencias disjuntas para evaluacion held-out. No se especifica en la informacion disponible si se aplicaron tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva estandar, heredada del modelo base Pythia-1.4B.
- Modelado de lenguaje sobre texto web en ingles, con el estilo y dominio de FineWeb.
- Sirve como objeto de estudio de memorizacion: permite medir que secuencias del corpus de ajuste son reproducibles de forma extraible.
- Generacion de etiquetas de memorizacion (k=50, l=50 greedy) utilizables para entrenar clasificadores de prediccion de memorizacion.
- Evaluacion held-out mediante el modelo emparejado run2 sobre un millon de secuencias disjuntas.
- Compatibilidad con `transformers`, text-generation-inference y endpoints compatibles.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo "thinking".
- No se documentan capacidades multilingues especificas; el corpus de ajuste es en ingles.

## Casos de uso

- Investigacion sobre memorizacion en LLM: el modelo permite medir la tasa de reproduccion literal de secuencias de FineWeb tras una epoca de ajuste, usando el protocolo de etiquetado greedy descrito por el autor.
- Entrenamiento de clasificadores de memorizacion: las etiquetas extraidas de run1 se usan directamente como supervision para un clasificador que predice si una secuencia sera memorizable, con aplicacion en filtrado de datos de pretraining.
- Evaluacion held-out de esos clasificadores: el par run2, ajustado sobre datos disjuntos, permite comprobar si el clasificador generaliza a secuencias que no ha visto, evitando fuga de informacion.
- Auditoria de datasets de pretraining: analizar que porciones de FineWeb son memorizables ayuda a decidir que datos excluir por riesgo de privacidad o de reproduccion literal en produccion.
- Estudios de duplicacion y contaminacion de datos: con 128 millones de tokens de ajuste y control de semilla y learning rate, es un banco de pruebas reproducible para medir el efecto de la repeticion en la memorizacion.
- Reproduccion de experimentos de scaling de memorizacion: al compartir arquitectura con la familia Pythia (de 70M a 12B), los resultados pueden compararse con otros tamanos bajo el mismo protocolo.
- Baseline en trabajos academicos sobre privacidad de modelos: sirve como referencia de cuanto texto web es extraible con un presupuesto de ajuste pequeno (una epoca, secuencias de 128 tokens).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, Hellaswag ni de las metricas estandar del suite de EleutherAI para Pythia, y el objetivo declarado del artefacto es el estudio de memorizacion, no la evaluacion de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,8-3,2 GB solo para pesos, mas cache KV; con contexto de 2.048 tokens y lote pequeno, el consumo realista se situa en 4-5 GB.
- En int8: alrededor de 1,5 GB de pesos, con un total estimado de 2,5-3 GB incluyendo cache.
- En 4 bits: alrededor de 0,8-1 GB de pesos; no se publican pesos cuantizados, habria que generarlos con GPTQ, AWQ o bitsandbytes.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4080 y RTX 4090. Tambien en GPUs de 6-8 GB si se cuantiza.
- GPU de datacenter: A100, H100, L40S o similares para inferencia por lotes con alto throughput; el modelo es demasiado pequeno para aprovechar tensor parallelism de forma eficiente.
- Opciones de despliegue: `transformers` (carga directa en fp16/bf16), text-generation-inference (el tag lo declara compatible), vLLM para serving con PagedAttention, y llama.cpp u Ollama solo tras convertir los pesos a GGUF, ya que el repositorio no incluye GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, con 1,4B de parametros y contexto corto (128-2.048 tokens) es un modelo de baja latencia en una sola GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pythia-1.4b-fineweb-run1 | 1,41B | 2.048 (base; ajuste a 128) | Estudio de memorizacion sobre FineWeb | Apache 2.0 | HuggingFace, 0 descargas |
| EleutherAI/pythia-1.4b | 1,41B | 2.048 | Modelo base de investigacion sobre The Pile | Apache 2.0 | HuggingFace, ampliamente utilizado |
| EleutherAI/pythia-1.4b-deduped | 1,41B | 2.048 | Variante con deduplicacion del corpus, referencia de control | Apache 2.0 | HuggingFace |
| TinyLlama-1.1B (referencia de tamano similar) | 1,1B | 2.048 | Modelo causal de proposito general | Apache 2.0 | HuggingFace |

La comparacion relevante no es de rendimiento en tareas, sino de proposito: frente al Pythia-1.4B original, este run1 cambia el corpus de ajuste (FineWeb en lugar de The Pile) y anade el etiquetado de memorizacion. Frente a la variante deduped, el interes esta precisamente en el corpus no deduplicado de FineWeb. No se dispone de datos de benchmarks que permitan comparar capacidades con alternativas.

## Limitaciones y advertencias

- El modelo no esta ajustado por instrucciones ni alineado; no debe usarse como asistente conversacional ni en atencion al cliente.
- Riesgo alto de reproduccion literal de texto de FineWeb, que es precisamente el objeto del experimento; en produccion esto implica riesgo de fuga de datos, texto con copyright y contenido web no filtrado.
- Corphus de ajuste web sin curación documentada: es esperable sesgo, toxicidad y contenido inapropiado heredado de FineWeb y de The Pile.
- Capacidad multilingue no documentada; el ajuste es en ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- El contexto de ajuste es de solo 128 tokens, muy inferior al contexto del modelo base; el comportamiento mas alla de esa longitud no esta validado.
- No se publican pesos cuantizados, GGUF ni versiones para llama.cpp u Ollama; el despliegue en esos runtimes requiere conversion previa.
- El repositorio registra 0 descargas y 0 "likes", sin validacion externa de la comunidad; no hay garantia de mantenimiento ni de soporte.
- La licencia Apache 2.0 permite uso comercial, pero el contenido memorizado del corpus subyacente puede estar sujeto a derechos de terceros; el uso comercial del modelo no exime de responsabilidad sobre las salidas.
- No hay resultados de benchmarks ni evaluaciones de calidad, por lo que cualquier uso fuera del marco de investigacion para el que fue creado es arriesgado.
- No se documenta la composicion exacta de la muestra de 1M de secuencias (filtros, idioma, rango temporal), lo que dificulta la reproducibilidad exacta del experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/pythia-1.4b-fineweb-run1
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Repositorio de la familia Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Paper de Pythia ("Pythia: A Suite for Analyzing Large Language Models Across Training and Scaling"): https://arxiv.org/abs/2304.01373
- Paper de FineWeb: https://arxiv.org/abs/2406.17557
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
