# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed1

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed1` es un ajuste fino experimental de SmolLM2-135M-Instruct orientado a la generacion de texto en faroes. Lo desarrolla el usuario independiente jekunz como parte de una investigacion sobre transferencia entre lenguas nordicas, y se distribuye con licencia Apache 2.0. Su relevancia radica en que el faroes es una lengua de bajos recursos con muy pocos modelos disponibles, y este trabajo explora si el conocimiento adquirido en danes, islandes, noruego (bokmal y nynorsk) y sueco puede transferirse a traves de un merge TIES antes de un entrenamiento especifico en faroes.

Arquitectura transformer decoder-only de tipo Llama con 134.515.008 parametros (aproximadamente 135 millones), contexto maximo de 2048 tokens y pesos en safetensors. El modelo parte de SmolLM2-135M-Instruct y se entrena en dos fases: primero sobre un merge TIES de modelos entrenados en cada lengua escandinava (con mayor peso para el islandes, la lengua germanica mas cercana al faroes), y despues sobre el subconjunto de faroes de FineWeb-2.

Se trata de un modelo de investigacion, no evaluado de forma amplia segun su autor, y publicado como una de tres semillas de entrenamiento de la misma configuracion. Es util como referencia para estudiar transferencia linguistica en modelos pequenos y para experimentar con generacion de texto en faroes en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Faroes (fo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia SmolLM2 (arquitectura Llama), con 134.515.008 parametros y una ventana de contexto de 2048 tokens. Parte de SmolLM2-135M-Instruct, un modelo ya ajustado por instrucciones, y se somete a un entrenamiento adicional de tipo continued pre-training (CPT) en dos etapas.

La primera etapa utiliza un merge TIES de modelos entrenados sobre las porciones de danes, islandes, noruego bokmal, noruego nynorsk y sueco de FineWeb-2, con mayor peso asignado al islandes. La segunda etapa entrena sobre la porcion de faroes de FineWeb-2. La configuracion documentada es: 1 epoca por lengua de origen y 5 epocas en faroes, tasa de aprendizaje 5e-4, scheduler coseno, warmup ratio 0.05, tamano de batch 8, acumulacion de gradientes de 32 pasos (batch efectivo 256), longitud maxima de contexto 2048 tokens, semilla 1 (una de tres semillas) y entrenamiento en una unica GPU A100 de 40 GB. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto en faroes, heredada de un modelo base ajustado por instrucciones (SmolLM2-135M-Instruct).
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 135 millones de parametros.
- Generacion de codigo y matematicas simples, aunque no es el objetivo del ajuste y su rendimiento en estas tareas no esta documentado.
- Soporte multilingue limitado al faroes segun la model card; no se documenta el comportamiento en otras lenguas tras el ajuste.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de texto en faroes para prototipos: el modelo puede producir texto en una lengua de bajos recursos con un unico modelo de 135 millones de parametros que cabe en cualquier GPU consumer, lo que facilita iterar rapido en prototipos de redaccion o resumen.
- Investigacion sobre transferencia entre lenguas nordicas: sirve como punto de comparacion frente a las otras dos semillas y frente al modelo base sin merge TIES, para medir si el preentrenamiento en islandes y escandinavo continental mejora el faroes.
- Experimentos academicos de continued pre-training: la configuracion documentada (learning rate, epocas, batch efectivo, semilla) permite reproducir el entrenamiento con un solo A100 de 40 GB y analizar el efecto de cada hiperparametro.
- Generacion asistida en entornos con recursos limitados: al ocupar aproximadamente 0,3 GB en safetensors en precision original, se puede desplegar en CPU o en GPUs de gama baja para tareas de generacion de texto sin requisitos de latencia estrictos.
- Creacion de corpus sinteticos en faroes: util para aumentar datos de entrenamiento de otros modelos o para tareas de data augmentation en una lengua con pocos recursos digitales.
- Educacion y divulgacion sobre modelos de lenguaje pequenos: permite demostrar el ciclo completo de ajuste (merge TIES, CPT, evaluacion) en un caso real de lengua minoritaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en FP16/BF16 (135 millones de parametros x 2 bytes), y alrededor de 0,14 GB en cuantizacion de 8 bits; en la practica, el uso real de memoria es mayor por el contexto y el runtime de inferencia.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; una A100 de 40 GB es suficiente para entrenamiento segun el autor, y para inferencia basta con GPUs consumer como GTX 1650, RTX 3050 o superiores.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: transformers (libreria declarada en la model card), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se documentan pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed1 | 134,5 M | 2048 | Faroes | Apache 2.0 | Ajuste experimental de investigacion, sin benchmarks publicados |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8192 (segun especificaciones publicas del modelo base) | Multilingue (principalmente ingles) | Apache 2.0 | Modelo base del que parte este ajuste; no especializado en faroes |
| jekunz/smollm135m-da05-is1-nno05-nob05-sv05-ties | 135 M | no disponible | Danes, islandes, noruego, sueco | Apache 2.0 | Modelo intermedio del que parte este ajuste, sin fase especifica de faroes |

Los datos del modelo base SmolLM2-135M-Instruct provienen de especificaciones publicas del modelo original; el resto de la comparativa se limita a la informacion disponible en la model card y los metadatos del repositorio.

## Limitaciones y advertencias

- Modelo de investigacion: el autor declara que no ha sido evaluado de forma amplia, por lo que su calidad y su seguridad no estan contrastadas.
- Riesgo de alucinacion: como todo modelo de 135 millones de parametros, tiende a generar contenido plausible pero incorrecto, especialmente en tareas de conocimiento factual.
- Sesgos: los datos de FineWeb-2 pueden contener sesgos de la web; no se documenta ninguna mitigacion especifica.
- Limitaciones de contexto: ventana de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Limitaciones de idioma: la model card solo declara faroes; el comportamiento en otras lenguas tras el ajuste no esta documentado y puede degradarse respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin evaluacion de riesgos.
- Caveat para produccion: al ser una de tres semillas de una configuracion experimental, los resultados pueden variar entre semillas; no se recomienda su uso en produccion sin una evaluacion propia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed1)
- [Modelo base del ajuste: jekunz/smollm135m-da05-is1-nno05-nob05-sv05-ties](https://huggingface.co/jekunz/smollm135m-da05-is1-nno05-nob05-sv05-ties)
- [Dataset FineWeb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [SmolLM2-135M-Instruct (modelo de partida)](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
