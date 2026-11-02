# jsh-itsolution/ONDO-27B-LoRA

## Resumen

ONDO-27B-LoRA es un adaptador LoRA desarrollado por ITSOLUTION Co., Ltd. (Seúl, Corea del Sur) que se aplica sobre el modelo base Qwen/Qwen3.8-27B. Su objetivo es concreto: hacer que el modelo admita que no sabe la respuesta en preguntas factuales cortas en lugar de inventar, manteniendo al mismo tiempo sus distribuciones de siguiente token próximas a las del modelo base mediante una penalización KL. El adaptador se entrena sobre las propias respuestas del modelo base, de modo que todo el texto de entrenamiento procede del razonamiento y la redacción del propio Qwen3.8-27B.

La relevancia del modelo reside en su enfoque de destilación de abstención: en lugar de un ajuste masivo con datos externos, emplea 244 filas de preguntas factuales cortas en inglés (PopQA, EntityQuestions y Mintaka) respondidas por el propio modelo base, con una pérdida que combina entropía cruzada sobre la respuesta supervisada y divergencia KL hacia el modelo base. Según las mediciones del autor, la precisión se mantiene mientras la tasa de alucinación cae de 0,239 a 0,170 en el conjunto público de AA-Omniscience.

El adaptador se distribuye en formato safetensors con cuantización FP8 y licencia Apache-2.0, y el autor publica además un checkpoint fusionado en FP8 (`jsh-itsolution/ONDO-27B-FP8`, unos 30,9 GB). El repositorio del adaptador ocupa 0,5 GB y está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.8-27B (incluye capas Gated DeltaNet y capas MTP en el checkpoint fusionado) |
| Parametros totales | No disponible para el adaptador; el checkpoint fusionado FP8 ocupa unos 30,9 GB |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible en la informacion proporcionada (las evaluaciones usan un tope de salida de 65.536 tokens; el entrenamiento usa longitud maxima de 3.072 tokens) |
| Tipos de cuantizacion | LoRA entrenado con QLoRA NF4 4-bit y doble cuantizacion; checkpoint fusionado publicado en FP8 |
| Idiomas soportados | Ingles (etiqueta `en`); se evaluo tambien con prompts en coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` y `adapter_config.json`); checkpoint fusionado en FP8 con el mismo layout que la fuente |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre el modelo base en BF16: cuantizacion NF4 de 4 bits con doble cuantizacion, dtype de computo bfloat16, rango LoRA 16, alpha 32, dropout 0,05 en todas las capas lineales del modelo de lenguaje, manteniendo congelados el torre de vision y el aligner. La perdida por posicion supervisada combina entropia cruzada sobre la respuesta del modelo base con la divergencia KL directa KL(base ‖ modelo) sobre todo el vocabulario a temperatura 1.0, con peso 1.0 cada una. El profesor es la misma red con el adaptador desactivado, por lo que permanece siendo el modelo base durante todo el entrenamiento; la perdida se calcula en bloques de 256 posiciones para no retener todos los logits a la vez.

El entrenamiento consistio en una epoca y 61 actualizaciones, con batch 1 y acumulacion de gradiente 4, tasa de aprendizaje constante de 1e-4 tras 5 pasos de calentamiento, norma maxima de gradiente 0,3, longitud maxima de 3.072 tokens, modo thinking activado en la plantilla de chat y semilla 20261029. La KL respecto al base fue 0 en las dos primeras actualizaciones y de 0,004 a 0,007 por posicion en las cinco ultimas. Las capas Gated DeltaNet se ejecutaron en la ruta de referencia de PyTorch en lugar de flash-linear-attention 0.5.2, cuya pasada hacia atras produce gradientes incorrectos en capas tempranas bajo esta configuracion (incidencia fla #1598). La fusion se realizo sumando el adaptador al checkpoint FP8 en fp32 y recuantizando con una regla exacta de desempate en el punto medio; cambiaron los 496 modulos objetivo y el resto de tensores es identico a la fuente FP8, incluido el shard MTP sin cambios.

## Capacidades

- Generacion de texto y respuesta a preguntas factuales cortas en ingles.
- Abstención calibrada: el modelo declina responder cuando no dispone de la informacion, en lugar de alucinar.
- Razonamiento con modo thinking, conforme a los ajustes recomendados del modelo base (temperatura 1.0, top_p 0.95, top_k 20, min_p 0, presence_penalty 0).
- Preservacion de las distribuciones del modelo base gracias a la penalizacion KL, lo que reduce el riesgo de degradacion en tareas fuera del dominio de entrenamiento.
- Soporte multilingue limitado: etiquetado para ingles; se evaluo el comportamiento con prompts en coreano, con un aumento no significativo de respuestas en caracteres Han o kana (87 frente a 73, p 0,097).
- Capacidades del modelo base no verificadas de forma independiente en esta ficha (tool calling, agentes, vision): no disponibles en la informacion proporcionada.

## Casos de uso

- Sistemas de respuesta factual con abstención: el adaptador esta disenado para preguntas factuales cortas en ingles, de modo que puede desplegarse en asistentes que deban indicar "no lo se" en lugar de inventar datos, manteniendo la precision del base.
- Moderacion de contenido factual en bases de conocimiento: al reducir la tasa de alucinacion de 0,239 a 0,170 en AA-Omniscience, es adecuado para pipelines que validan afirmaciones contra fuentes y necesitan que el modelo marque incertidumbre.
- Investigacion sobre calibracion y abstención: el enfoque de destilacion con KL hacia el propio modelo base y solo 244 filas de entrenamiento sirve como referencia reproducible para estudiar como inducir abstención sin reentrenar el modelo completo.
- Despliegue sobre el checkpoint fusionado FP8: al publicarse `ONDO-27B-FP8` (unos 30,9 GB) con el mismo layout que la fuente, puede integrarse en infraestructuras de inferencia que ya sirven Qwen3.8-27B-FP8 sin cambiar el formato de pesos.
- Evaluacion comparativa de alucinacion: util para equipos que miden tasas de alucinacion en conjuntos publicos como AA-Omniscience o SimpleQA Verified y quieren un adaptador ligero que no altere la precision.
- Experimentacion con LoRA en produccion: el adaptador de 0,5 GB permite aplicar y revertir el cambio de comportamiento sobre el base sin sustituir el modelo completo, lo que facilita pruebas A/B en entornos controlados.

## Benchmarks y rendimiento

Todas las cifras son mediciones propias del autor en sus GPUs, no resultados de Artificial Analysis.

| Benchmark | ONDO-27B-LoRA | Base (mismo harness) | Notas |
|---|---|---|---|
| AA-Omniscience v1.1, publico 300 | precision 0,137; tasa de alucinacion 0,170; contribucion al indice 5,517 | precision 0,135; tasa de alucinacion 0,239; 5,155 (dos ejecuciones) | Diferencia +0,362 puntos (+0,070 si toda respuesta cortada cuenta contra el modelo; desviacion tipica 0,206). El modelo corrio en un motor de prueba y el base en la ruta de servicio, por lo que el efecto de la ruta no se separa |
| HLE-Diamond, 150 items fijos (cribado) | 19/150 = 0,127 (una ejecucion) | 38/300 = 0,127 (dos ejecuciones, tope de 65.536 tokens, respuesta cortada cuenta como incorrecta) | Cribado preregistrado: se supera con 18 o mas de 150 correctas, es decir, sin caida mayor de 0,3 puntos de indice |
| Prompts en coreano que no pedian escritura china ni japonesa (473): respuestas con caracteres Han o kana | 87 | 73 | Aumento no significativo bajo la prueba unilateral preregistrada (p 0,097; 57 respuestas solo en este modelo, 43 solo en el base). No demuestra que ambos sean iguales |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint fusionado FP8 ocupa unos 30,9 GB, por lo que se requiere al menos esa capacidad mas margen para el contexto y el estado de atencion.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del checkpoint FP8, se necesita una GPU con 40 GB o mas de memoria (A100 40/80 GB, H100, L40S) o varias GPUs consumer.
- Ajuste en GPU consumer: no disponible; el adaptador LoRA en si ocupa 0,5 GB, pero requiere cargar el modelo base para su uso.
- Opciones de despliegue: no disponibles en la informacion proporcionada; el autor menciona un motor de prueba y una ruta de servicio, pero no detalla frameworks (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONDO-27B-LoRA | Adaptador LoRA sobre Qwen3.8-27B | No disponible | Abstención calibrada con KL hacia el base | Apache-2.0 | HuggingFace (adaptador y checkpoint FP8) |
| Qwen3.8-27B (base) | 27B (segun nombre) | No disponible | Modelo generalista | Apache-2.0 (segun el autor) | HuggingFace |
| Qwen3.8-27B-FP8 | 27B en FP8 | No disponible | Version cuantizada del base | Apache-2.0 (segun el autor) | HuggingFace |

No se dispone de datos de benchmarks de terceros ni de otros adaptadores de abstención comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo con 244 filas de preguntas factuales cortas en ingles; el cambio de comportamiento fuera de ese tipo de pregunta no esta medido mas alla de las filas indicadas.
- Las evaluaciones son muestras publicas pequenas con un tope de salida de 65.536 tokens, no las condiciones publicadas de los benchmarks.
- Abstenerse mas reduce la tasa de respuesta: las preguntas no intentadas pasan del 63,8 % al 70,0 % en el publico 300, aunque la precision no cae en esa muestra.
- El adaptador esta etiquetado solo para ingles; el comportamiento en otros idiomas no esta caracterizado, y la evaluacion en coreano no permite concluir equivalencia con el base.
- La comparacion con el base mezcla motor de prueba y ruta de servicio, por lo que el efecto de la ruta no se separa de la mejora medida.
- Riesgo de alucinacion residual: la tasa de 0,170 sigue siendo no nula y procede de una unica ejecucion.
- Licencia Apache-2.0, igual que el modelo base; las preguntas de Mintaka son CC-BY-4.0 y requieren atribucion.
- El adaptador depende de la revision concreta del base (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` para BF16 y `017b9c7af6b5689d5dd426a76e0bc077eb5ca20a` para FP8); usarlo con otras revisiones puede invalidar la fusion.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/jsh-itsolution/ONDO-27B-LoRA
- Checkpoint fusionado FP8: https://huggingface.co/jsh-itsolution/ONDO-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base en FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Sitio del desarrollador: https://ondo.sh
- Incidencia de flash-linear-attention citada: fla issue #1598 (no se proporciona URL)
- Mintaka (COLING 2022): dataset CC-BY-4.0 citado en la model card (no se proporciona URL)
