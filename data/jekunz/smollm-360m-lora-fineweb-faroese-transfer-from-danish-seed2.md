# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed2

## Resumen

El modelo `smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed2` es un adaptador LoRA publicado por el usuario jekunz sobre SmolLM2-360M-Instruct, orientado a la generacion de texto en feroes (fo). Se trata de un experimento de investigacion que aplica una estrategia de transferencia linguistica: primero se ajusta el modelo base sobre el subconjunto danes de FineWeb-2 y despues sobre el subconjunto feroes, aprovechando la proximidad tipologica entre ambas lenguas nordicas. El resultado es un adaptador PEFT que se carga sobre el modelo base danes, no sobre el SmolLM2 original.

El interes tecnico del artefacto reside en su planteamiento de bajo coste: un unico adaptador LoRA de rango 256 entrenado durante una epoca en danes y cinco en feroes sobre una A100 de 40 GB, con un batch efectivo de 256 y una longitud de contexto maxima de 2048 tokens. Es una de tres semillas (la semilla 2) de una misma configuracion, lo que sugiere que forma parte de un estudio de robustez o de variabilidad de entrenamiento.

No obstante, conviene subrayar que el autor declara explicitamente que el modelo esta destinado a su investigacion y que no ha sido evaluado de forma amplia. El repositorio no incluye resultados de benchmarks, no registra descargas ni interacciones y su tamano es de 0,4 GB, coherente con un adaptador LoRA y no con un modelo completo. Debe tratarse, por tanto, como un artefacto experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (el adaptador LoRA se publica sobre un modelo base de 360M; el numero exacto de parametros del adaptador no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada durante el entrenamiento) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | Feroes (fo); entrenado con transferencia desde danes |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only de la familia SmolLM2 de Hugging Face. Sobre el se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`. El adaptador se entrena en dos fases secuenciales: primero una epoca sobre el subconjunto danes de FineWeb-2 y despues cinco epocas sobre el subconjunto feroes del mismo corpus. Esta secuencia constituye el mecanismo de transferencia: el modelo adquiere representaciones del danes antes de especializarse en feroes, dos lenguas nordicas con parentesco cercano.

La configuracion de entrenamiento emplea una tasa de aprendizaje de 8e-4 con scheduler coseno y un ratio de warmup de 0,05, batch de 8 con 32 pasos de acumulacion de gradientes (batch efectivo de 256) y una unica GPU A100 de 40 GB. La semilla es la 2, una de las tres semillas de esta misma configuracion. No se documenta el numero total de tokens procesados, la composicion exacta del dataset mas alla de FineWeb-2, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se mencionan innovaciones arquitectonicas adicionales: el interes esta en el esquema de transferencia y en la comprobacion de semillas, no en cambios de arquitectura.

## Capacidades

- Generacion de texto en feroes, heredada del ajuste sobre el subconjunto feroes de FineWeb-2.
- Conversacion y generacion instruccional, ya que el modelo base es la variante Instruct de SmolLM2.
- Transferencia linguistica desde danes: el adaptador parte de un modelo ya ajustado en danes, lo que puede favorecer el modelado de morfologia y vocabulario nordico.
- Generacion de texto multilingue limitada: el modelo base SmolLM2 tiene capacidades multilingues, pero el ajuste se ha restringido a feroes y danes.
- Soporte de tool calling y function calling: no documentado para este adaptador; el modelo base SmolLM2-Instruct dispone de capacidades de instruccion, pero no se ha verificado su conservacion tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de texto en feroes para experimentacion linguistica: el adaptador permite generar texto en feroes con un modelo de 360M parametros, adecuado para prototipos de investigacion sobre lenguas de bajos recursos.
- Estudio de transferencia entre lenguas nordicas: sirve para analizar cuanto conocimiento del danes se transfiere al feroes mediante ajuste secuencial, comparando con las otras semillas del mismo experimento.
- Generacion de datos sinteticos en feroes: puede emplearse para aumentar corpus de entrenamiento o evaluacion en feroes, siempre con revision humana dado que no hay evaluacion publicada.
- Pruebas de robustez y reproducibilidad: al ser una de tres semillas, permite medir la varianza de resultados entre ejecuciones con la misma configuracion.
- Prototipado de asistentes conversacionales en feroes: la variante Instruct del modelo base facilita experimentar con dialogos multi-turno de hasta 2048 tokens, aunque sin garantias de calidad en produccion.
- Investigacion sobre LoRA de alto rango en modelos pequenos: el rango 256 sobre un modelo de 360M permite estudiar el equilibrio entre capacidad de adaptacion y coste computacional en un unico adaptador.
- Docencia y demostraciones de ajuste eficiente: el entrenamiento en una sola A100 de 40 GB con batch efectivo de 256 lo convierte en un ejemplo accesible de pipeline PEFT completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,4 GB en disco; el modelo base SmolLM2-360M-Instruct en precision completa requiere aproximadamente 1,4 GB de VRAM (360M parametros a 32 bits), y en cuantizacion de 8 bits alrededor de 0,7 GB. La VRAM total depende de la cuantizacion elegida para el modelo base, que no se especifica en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo base en cuantizacion de 4 u 8 bits; una A100 de 40 GB fue la empleada para el entrenamiento del adaptador.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, dado el reducido tamano del modelo base.
- Opciones de despliegue: el adaptador es compatible con la libreria PEFT; para inferencia puede combinarse con el modelo base y servirse mediante transformers, vLLM o llama.cpp (previa conversion a GGUF), aunque no se documenta compatibilidad verificada con estas herramientas para este adaptador concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed2 | Adaptador LoRA sobre 360M | 2048 tokens (entrenamiento) | Feroes | Apache 2.0 | Hugging Face (adaptador) |
| SmolLM2-360M-Instruct | 360M | 8192 tokens (segun model card del modelo base) | Multilingue | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-lora-fineweb-danish | Adaptador LoRA sobre 360M | No disponible | Danes | Apache 2.0 | Hugging Face (adaptador) |

La comparativa se limita a los artefactos relacionados directamente con este experimento, ya que no se dispone de datos de rendimiento para contrastar con alternativas especializadas en feroes. No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- El autor declara que el modelo esta destinado a su investigacion y que no ha sido evaluado de forma amplia; no debe usarse en produccion sin una evaluacion propia.
- No se han publicado benchmarks, por lo que se desconoce su calidad real en generacion de texto en feroes y su posible degradacion respecto al modelo base.
- Riesgo de alucinacion: al ser un modelo de 360M parametros ajustado sobre corpus web, la probabilidad de generar contenido facticamente incorrecto es elevada, especialmente en una lengua de bajos recursos como el feroes.
- Sesgos conocidos: no documentados, pero el entrenamiento sobre FineWeb-2 puede heredar sesgos presentes en datos web; no se ha realizado ninguna evaluacion de sesgo.
- Limitacion de contexto: la longitud maxima usada en entrenamiento es de 2048 tokens, inferior a la ventana nativa del modelo base, lo que puede limitar tareas que requieran contextos largos.
- Cobertura idiomatica restringida: el ajuste se limita a feroes y danes; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base SmolLM2-Instruct tambien es Apache 2.0; aun asi, la falta de evaluacion desaconseja su uso comercial directo.
- Dependencia del modelo base: el adaptador debe cargarse sobre `jekunz/smollm-360m-lora-fineweb-danish`, no directamente sobre SmolLM2, lo que anade un paso de composicion en el despliegue.
- Repositorio sin actividad: cero descargas y cero interacciones en el momento de la consulta, lo que reduce la validacion comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed2
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-danish
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base original (SmolLM2-360M-Instruct): no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
