# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed2

## Resumen

SmolLM2-135M-CPT-Faroese es un modelo de generacion de texto de 134.515.008 parametros derivado de SmolLM2-135M-Instruct, desarrollado por el usuario jekunz como parte de una linea de investigacion sobre adaptacion de modelos pequenos a lenguas de bajos recursos. El modelo parte de un merge TIES (con pesos iguales) de cinco variantes entrenadas sobre las porciones danesa, islandesa, noruego bokmal, noruego nynorsk y sueca de FineWeb-2, y posteriormente se somete a un entrenamiento continuado (continued pre-training, CPT) sobre la porcion en feroes del mismo corpus.

La relevancia del modelo es doble: por un lado, demuestra una receta reproducible para transferir capacidad multilingue escandinava a una lengua de muy bajos recursos como el feroes (aproximadamente 70.000 hablantes) sin partir de cero; por otro, lo hace con un presupuesto minimo (una sola A100 de 40 GB, 8 de batch con 32 pasos de acumulacion). Es, por tanto, un caso de estudio util para investigadores que trabajen en adaptacion linguistica de bajo coste con modelos del rango de los 100 millones de parametros.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con transformers y text-generation-inference. El autor advierte explicitamente de que se trata de un artefacto de investigacion sin evaluacion amplia, por lo que no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun el tag `llama`; derivado de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar; al ser un modelo Llama de 135M es convertible a GGUF/INT8/INT4 con herramientas estandar) |
| Idiomas soportados | feroes (`fo`) como objetivo; capacidad residual en danes, islandes, noruego bokmal, noruego nynorsk y sueco por el merge de partida |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2-135M-Instruct, un transformer decoder-only de la familia Llama con aproximadamente 135 millones de parametros. El proceso de entrenamiento tiene dos fases. En la primera se parte de cinco modelos entrenados de forma independiente sobre las porciones danesa, islandesa, noruego bokmal, noruego nynorsk y sueca de FineWeb-2, y se combinan mediante un merge TIES con pesos iguales, lo que produce el checkpoint base `jekunz/smollm135m-da1-is1-nno1-nob1-sv1-ties`. En la segunda fase se realiza continued pre-training sobre la porcion en feroes de FineWeb-2.

Los hiperparametros declarados por el autor son: 1 epoca por lengua de origen y 5 epocas sobre feroes, learning rate 5e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulacion de gradiente (batch efectivo 256), longitud maxima de contexto de 2048 tokens, semilla 2 (una de tres semillas de entrenamiento para esta configuracion) y una unica GPU A100 de 40 GB. No se documenta en la informacion disponible el volumen exacto de tokens de entrenamiento, la composicion detallada del subconjunto de FineWeb-2 empleado ni si hubo fases de alineacion posteriores (RLHF/DPO) tras el CPT.

## Capacidades

- Generacion de texto autoregresiva en feroes, con capacidad residual en las cinco lenguas escandinavas usadas en el merge (danes, islandes, noruego bokmal, noruego nynorsk y sueco).
- Conversacion multi-turno: el checkpoint de partida es una variante Instruct, de modo que el formato conversacional se conserva como punto de partida, aunque el CPT sobre corpus web puede haber degradado parcialmente la adherencia a instrucciones.
- Modelado de lenguaje y continuacion de texto sobre dominio general (corpus web FineWeb-2).
- Capacidad multilingue cruzada limitada al ambito escandinavo; no hay evidencia de capacidades solidas fuera de ese grupo linguistico.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito (thinking mode) en la informacion disponible.
- Tamano reducido (135M) que permite inferencia en CPU y en GPUs de gama baja, lo que facilita su uso como componente ligero en pipelines.

## Casos de uso

- Investigacion en adaptacion de lenguas de bajos recursos: el modelo sirve como punto de partida reproducible para experimentos de CPT sobre feroes, permitiendo comparar recetas (merge TIES + CPT) frente a entrenamiento desde cero con el mismo presupuesto de una A100.
- Generacion y aumento de datos sinteticos en feroes: al modelar texto web feroes, puede emplearse para producir borradores de frases o parrafos que luego se filtran manualmente, util en proyectos de corpus para una lengua con pocos recursos digitales.
- Prototipado de correctores o autocompletado ortografico: con 135M de parametros y contexto de 2048 tokens, es viable ejecutarlo en local para tareas de continuacion y deteccion de secuencias improbables en texto feroes.
- Experimentos de traduccion asistida escandinavo-feroes: la combinacion del merge multilingue y el CPT sobre feroes permite explorar transferencia entre lenguas germanicas nordicas en entornos de investigacion.
- Docencia y formacion: su tamano permite entrenar y desplegar el modelo completo en una sola GPU de 40 GB, lo que lo hace adecuado para cursos practicos sobre continued pre-training y model merging.
- Evaluacion de tecnicas de merge (TIES): el checkpoint base y este derivado permiten aislar el efecto del CPT sobre feroes respecto al merge multilingue de partida en estudios comparativos.
- Despliegue ligero en entornos con recursos limitados: al ser un modelo Llama de 135M, puede servirse con llama.cpp u Ollama en CPU para demos de generacion de texto en feroes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 0,27 GB solo para pesos (134,5M x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- VRAM estimada en INT8: en torno a 0,14 GB para pesos; en INT4, alrededor de 0,07 GB, con margen amplio para contexto de 2048 tokens.
- GPU recomendadas: cualquier GPU moderna es suficiente; para entrenamiento el autor uso una A100 de 40 GB con batch efectivo 256, pero para inferencia bastan RTX 3060, RTX 4090, T4 o incluso iGPU con suficiente memoria compartida.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); al ser arquitectura Llama, es convertible a GGUF para llama.cpp y Ollama, y compatible con vLLM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera throughput muy alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| smollm-135m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed2 (este) | 134,5M | 2048 | feroes (+ escandinavo residual) | Apache 2.0 | Publicado, sin evaluacion amplia |
| SmolLM2-135M-Instruct (checkpoint de partida) | 135M | 8192 (segun ficha original de SmolLM2) | Ingles principalmente | Apache 2.0 | Publicado y evaluado por el autor original |
| jekunz/smollm135m-da1-is1-nno1-nob1-sv1-ties (base del merge) | ~135M | no disponible | danes, islandes, noruego bokmal, noruego nynorsk, sueco | Apache 2.0 | Publicado, sin evaluacion amplia |
| Otras semillas de la misma configuracion (seed 1, seed 3) | ~135M | 2048 | feroes | Apache 2.0 | Publicadas por el mismo autor segun la model card |

La comparacion con modelos de mayor tamano o con modelos especializados en feroes no esta disponible en la informacion proporcionada. Las cifras de contexto de SmolLM2-135M-Instruct corresponden a la ficha publica del modelo original y no a una verificacion directa sobre este checkpoint.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion amplia: el propio autor advierte de que no ha sido evaluado mas alla de su uso interno, por lo que su calidad en tareas reales es desconocida.
- Riesgo elevado de alucinacion: con 135M de parametros y entrenamiento sobre corpus web, la fidelidad factual es limitada y la generacion puede derivar en texto plausible pero incorrecto.
- Posible degradacion de la alineacion conversacional: el CPT sobre texto web de FineWeb-2 puede haber erosionado el ajuste a instrucciones heredado de SmolLM2-135M-Instruct.
- Cobertura linguistica estrecha: el idioma objetivo es unicamente el feroes; el rendimiento fuera del ambito escandinavo no esta documentado y previsiblemente sera pobre.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documentos largos o conversaciones extensas.
- Sesgos no caracterizados: al entrenarse sobre FineWeb-2 no se documenta ningun proceso de filtrado de sesgos ni de mitigacion, por lo que pueden aparecer sesgos de genero, culturales o geopoliticos presentes en el corpus web.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de SmolLM2 conviene revisar las condiciones del modelo original y citar adecuadamente la cadena de modelos base.
- Sin garantias para produccion: no hay benchmarks, no hay evaluacion de robustez ni de seguridad, y el checkpoint corresponde a una unica semilla de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed2
- Modelo base del merge: https://huggingface.co/jekunz/smollm135m-da1-is1-nno1-nob1-sv1-ties
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia de modelos de partida): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Paper de TIES merging: https://arxiv.org/abs/2306.01708
- Repositorio de llama.cpp (para conversion a GGUF): https://github.com/ggml-org/llama.cpp
