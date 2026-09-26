# mradermacher/zen-ingress-1-3b-dpo-merged-i1-GGUF

## Resumen

zen-ingress-1-3b-dpo-merged-i1-GGUF es la version cuantizada en formato GGUF del modelo ZenithLLM/zen-ingress-1-3b-dpo-merged, publicada por mradermacher, un autor especializado en generar cuantizaciones de terceros. Se trata de un modelo de generacion de texto de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) construido sobre la familia Qwen2 y afinado con DPO (Direct Preference Optimization) para tareas de razonamiento y matematicas. Su publicacion responde a una necesidad muy concreta: permitir la ejecucion local de un modelo de razonamiento de ~3B en hardware de consumo mediante cuantizaciones de 1 a 2,6 GB.

El repositorio ofrece 24 variantes de cuantizacion con metodos i-quant (imatrix) ademas de la matriz de importancia original, lo que permite ajustar el equilibrio entre tamano, velocidad y calidad de forma granular. Frente a las cuantizaciones estaticas equivalentes del mismo autor, las variantes i1 incorporan una matriz de importancia calculada sobre el modelo, lo que en la practica mejora la perplejidad en rangos bajos de bits.

Es relevante ahora porque los modelos pequenos con entrenamiento por preferencias estan ganando terreno para despliegues en el borde, entornos sin conexion y prototipado rapido, donde no es viable servir un modelo de 70B. La licencia Apache-2.0 declarada facilita su uso comercial, aunque la informacion publicada no incluye evaluaciones de rendimiento, ficha de composicion del dataset ni especificacion de la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (segun las etiquetas del repositorio) |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers declarado como libreria, pero los ficheros publicados son GGUF) |
| Modelo base | ZenithLLM/zen-ingress-1-3b-dpo-merged |
| Cuantizado por | mradermacher |
| Rango de tamanos | 0,9 GB (i1-IQ1_S) a 2,6 GB (i1-Q6_K); imatrix de 0,1 GB |
| Tamano del repositorio | 36,8 GB |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a la familia Qwen2 (transformer decoder-only con atencion por grupos de consultas en la version original de Qwen2). El nombre del modelo base indica que se ha aplicado una fusion de pesos tras un entrenamiento con DPO, una tecnica de optimizacion por preferencias que ajusta el modelo para preferir respuestas mejor valoradas por anotadores o por un modelo juez, sin necesidad de una fase de RLHF con modelo de recompensa explicito.

No se especifican en la documentacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el proceso de fusion de pesos ni las recetas de aprendizaje. Las etiquetas si confirman un enfasis declarado en razonamiento y matematicas, ademas de un ajuste personalizado (custom-finetune). La innovacion tecnica relevante de este repositorio concreto no esta en el modelo base, sino en el proceso de cuantizacion: se emplean cuantizaciones i1 calculadas sobre una matriz de importancia (imatrix) generada para este modelo, y se publica esa matriz de forma independiente para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, con el pipeline declarado de text-generation.
- Razonamiento orientado a matematicas, segun las etiquetas reasoning y math del repositorio.
- Ajuste por preferencias (DPO) aplicado sobre el modelo base, orientado a mejorar la calidad de las respuestas.
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.
- Cuantizacion configurable en 24 variantes, desde 0,9 GB hasta 2,6 GB.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (en).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Ejecucion local en portatiles sin GPU dedicada: la variante i1-Q4_K_M (2,0 GB) cabe en memoria RAM de cualquier equipo moderno y permite disponer de un asistente de razonamiento completamente offline, sin enviar datos a servicios externos.
- Tutoria y generacion de problemas de matematicas: dado el enfasis declarado del modelo en razonamiento y matematicas, puede emplearse para producir enunciados, resolverlos paso a paso y explicar el procedimiento en aplicaciones educativas en ingles.
- Prototipado rapido de aplicaciones conversacionales: antes de invertir en infraestructura, un desarrollador puede validar prompts y flujos con la variante i1-Q5_K_M (2,3 GB) en su propia maquina y despues migrar al modelo base en safetensors si necesita mas precision.
- Generacion de codigo de apoyo y documentacion tecnica en ingles: util para autocompletar docstrings, redactar explicaciones de funciones o escribir pruebas sencillas, siempre con revision humana por el riesgo de alucinacion propio de un modelo de 3B.
- Investigacion sobre cuantizacion y matrices de importancia: el repositorio publica el fichero imatrix, lo que permite reproducir experimentos sobre el impacto de distintas tecnicas de cuantizacion en la perplejidad de un modelo afinado con DPO.
- Despliegue en dispositivos de borde o entornos aislados: con variantes de 1,0 a 1,6 GB (IQ1/IQ2/IQ3) cabe en placas tipo Raspberry Pi con 4 GB o mas de RAM, util para asistentes de campo sin conectividad.
- Filtrado y preprocesado de texto en ingles: clasificacion, resumen o reescritura de documentos a bajo coste, encadenando el modelo por lotes en CPU para grandes volumenes.
- Base para experimentos de destilacion o ajuste posterior: al ser Apache-2.0 y de 3B, es un punto de partida manejable para fine-tuning en una unica GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas con modelos de tamano similar. Cualquier cifra que se atribuya a este modelo debe proceder de una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion y del contexto. La variante i1-IQ1_S ocupa 0,9 GB en disco; i1-Q4_K_M, 2,0 GB; i1-Q5_K_M, 2,3 GB; i1-Q6_K, 2,6 GB. Hay que sumar la cache KV, que crece con la longitud de contexto (no especificada).
- Modelo completo sin cuantizar: 3,09B parametros, aproximadamente 6,2 GB en precision fp16.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM sirve para las cuantizaciones Q4; para i1-Q6_K conviene disponer de 6 GB o mas. Se puede servir en CPU en exclusiva si no hay GPU.
- Cabe en GPU de consumo: si, en practicamente todas las tarjetas actuales (GTX 1650 4 GB, RTX 3060 12 GB, RTX 4090 24 GB) e incluso en iGPU con memoria unificada suficiente. En placas con poca RAM, las variantes IQ1/IQ2 son las unicas viables.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui (backend llama.cpp) y cualquier runtime compatible con GGUF. Para servir el modelo original en safetensors haria falta integraciones tipo vLLM o TGI sobre el repositorio base, no sobre estos pesos GGUF.
- Latencia y throughput estimados: no disponible; el repositorio no publica mediciones. El fichero imatrix de 0,1 GB solo sirve para generar cuantizaciones propias, no para inferencia.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas publicas; no existen comparaciones de rendimiento publicadas frente a este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zen-ingress-1-3b-dpo-merged (i1-GGUF) | 3,09B | no disponible | Apache-2.0 | GGUF en HuggingFace |
| Qwen2.5-3B-Instruct | 3,09B | 32 768 tokens (segun su ficha) | Apache-2.0 | safetensors y GGUF de terceros |
| Llama-3.2-3B-Instruct | 3,21B | 128 000 tokens (segun su ficha) | Licencia comunitaria de Llama 3.2 | safetensors y GGUF oficiales |
| Gemma-2-2B-it | 2,6B | 8 192 tokens (segun su ficha) | Licencia de Gemma | safetensors y GGUF de terceros |

Diferencias destacables: zen-ingress-1-3b-merged no declara longitud de contexto ni evaluaciones, mientras que las alternativas publican ambas cosas. En contrapartida, la licencia Apache-2.0 de este modelo es mas permisiva que las licencias comunitarias de Llama o Gemma, y su catalogo de 24 cuantizaciones i-quant con imatrix es mas amplio que el que suelen ofrecer los repositorios oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgos ni de toxicidad para este modelo ni para su modelo base.
- Riesgo de alucinacion: alto esperable por su tamano (3B). No debe usarse como fuente de verdad en dominios factuales sin verificacion externa.
- Contexto e idioma: el modelo solo declara ingles. La longitud de contexto no esta documentada, por lo que cualquier despliegue con contexto largo debe validarse empiricamente antes de asumir un limite concreto.
- Cuantizaciones de baja calidad: el propio autor advierte en el repositorio que IQ1_S es "para desesperados" y que Q2_K_S es de "muy baja calidad". Usar cuantizaciones por debajo de Q4 puede degradar de forma notable el razonamiento, que es precisamente la capacidad que el modelo destaca.
- Restricciones de licencia: la licencia declarada es Apache-2.0, permisiva para uso comercial. Aun asi, conviene verificar la licencia y los terminos del modelo base original (ZenithLLM/zen-ingress-1-3b-dpo-merged) y del modelo fundacional subyacente antes de un despliegue comercial.
- Ausencia de evaluaciones: no hay benchmarks, informes de evaluacion ni descripcion del dataset de entrenamiento, lo que impide estimar su comportamiento en dominios concretos.
- Trazabilidad limitada: es una cuantizacion de terceros sobre un modelo base a su vez derivado y fusionado, sin documentacion publicada del proceso de DPO ni de la fusion de pesos.
- Fecha de creacion inusual: el repositorio figura como creado el 2026-09-26, dato que conviene tratar con cautela.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/zen-ingress-1-3b-dpo-merged-i1-GGUF
- Modelo base: https://huggingface.co/ZenithLLM/zen-ingress-1-3b-dpo-merged
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/zen-ingress-1-3b-dpo-merged-GGUF
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#zen-ingress-1-3b-dpo-merged-i1-GGUF
- Ejemplo de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/
