# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed2

## Resumen

El modelo `smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed2` es un ajuste fino de SmolLM2-135M-Instruct desarrollado por el usuario jekunz, orientado a la generacion de texto en feroes (fo). Se construye mediante un esquema de entrenamiento en dos fases: primero un continued pre-training (CPT) sobre la porcion danesa de FineWeb-2 y despues sobre la porcion feroesa del mismo corpus, aprovechando el parentesco linguistico entre ambas lenguas para facilitar la transferencia. El resultado es un modelo de 134,5 millones de parametros publicado bajo licencia Apache 2.0.

SmolLM2-135M-Instruct es un transformer decoder-only de la familia SmolLM2 de Hugging Face, disenado originalmente como modelo pequeno para entornos con recursos limitados. Este derivado conserva esa arquitectura y tamano, pero redirige su capacidad linguistica hacia el feroes, un idioma de bajos recursos con escasa representacion en modelos fundacionales. La relevancia actual reside en que demuestra una tecnica reproducible (transferencia danes-feroes) para adaptar modelos diminutos a lenguas minoritarias sin necesidad de grandes presupuestos de computo.

El modelo se publica como parte de un estudio con tres semillas de entrenamiento (este es el seed 2) y, segun el autor, no ha sido evaluado de forma amplia. Su interes es principalmente de investigacion: sirve como referencia para experimentos de adaptacion linguistica y como base para tareas de generacion de texto en feroes en escenarios de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | Feroes (fo); entrenado con transferencia desde danes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolLM2-135M-Instruct, un transformer decoder-only con atencion causal y 134,5 millones de parametros, pensado para inferencia eficiente en CPU y GPU de gama baja. El autor parte de los pesos instructivos y aplica continued pre-training en dos etapas: primero 1 epoca sobre la porcion danesa de FineWeb-2 y despues 5 epocas sobre la porcion feroesa, con el objetivo de transferir conocimiento del danes al feroes.

Los hiperparametros de entrenamiento son: learning rate de 5e-4, scheduler coseno, warmup ratio de 0,05, batch size de 8 con 32 pasos de acumulacion de gradiente (batch efectivo de 256), longitud maxima de contexto de 2048 tokens, una unica GPU A100 de 40 GB y semilla 2 de tres configuraciones equivalentes. No se documenta el numero total de tokens procesados, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al CPT.

## Capacidades

- Generacion de texto en feroes, heredada del ajuste sobre FineWeb-2.
- Generacion conversacional, dado que el modelo base es la variante Instruct de SmolLM2.
- Transferencia linguistica desde el danes, que puede mejorar la coherencia en feroes en dominios donde el corpus feroes es escaso.
- Capacidad limitada de razonamiento y matematicas, propia de un modelo de 135M de parametros.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el tamano del modelo lo hace poco adecuado para tareas complejas de agente.
- Capacidades multilingues: limitadas al feroes segun la model card, con posible influencia residual del danes e ingles del modelo base.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Generacion de contenido en feroes para webs y medios locales: el modelo puede redactar parrafos y resumenes en feroes a partir de prompts, aprovechando el CPT sobre FineWeb-2 feroes para producir texto con vocabulario y estilo propios del idioma.
- Prototipado de asistentes conversacionales en feroes: al derivar de SmolLM2-135M-Instruct, mantiene el formato conversacional y puede usarse para experimentar con dialogos multi-turno de contexto corto (hasta 2048 tokens).
- Investigacion en adaptacion de lenguas minoritarias: sirve como punto de partida reproducible (semilla 2 de tres) para estudiar el efecto del transfer danes-feroes en modelos pequenos.
- Generacion aumentada de datos sinteticos en feroes: puede producir textos de entrenamiento para otros modelos o para tareas de clasificacion, con la ventaja de su bajo coste de inferencia.
- Despliegue en entornos con recursos muy limitados: con 134,5M de parametros cabe en CPU y en GPUs de consumo, lo que permite ejecutar tareas de generacion de texto en dispositivos sin acelerador dedicado.
- Educacion y demostraciones: util para mostrar en clase o en talleres como se adapta un modelo fundacional pequeno a un idioma de bajos recursos mediante CPT en dos fases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (134,5M parametros x 4 bytes), en torno a 0,15-0,2 GB en fp16/bf16 y menos de 0,1 GB en cuantizacion de 8 bits, sin contar overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU moderna es suficiente; una A100 no es necesaria para inferencia. Sirven RTX 4090, RTX 3090, RTX 3060, T4 e incluso GPUs integradas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales, y tambien en CPU.
- Opciones de despliegue: transformers (libreria indicada en la model card), text-generation-inference (tag endpoints_compatible), llama.cpp y Ollama mediante conversion a GGUF, y vLLM para serving.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed2 | 134,5M | 2048 | Feroes | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct (Hugging Face) | 135M | 8192 (segun model card original) | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face |
| jekunz/smollm-135m-cpt-fineweb-danish (modelo base) | 135M | 2048 (entrenamiento) | Danes | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos directamente relacionados en la informacion disponible. No se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo no evaluado de forma amplia: el autor advierte que no ha sido sometido a una evaluacion exhaustiva, por lo que su calidad en tareas reales es incierta.
- Riesgo de alucinacion: como todo modelo generativo de 135M de parametros, tiende a inventar hechos, especialmente fuera de los dominios cubiertos por FineWeb-2.
- Sesgos: no documentados; el corpus FineWeb-2 puede introducir sesgos de la web que se reflejen en las generaciones.
- Limitaciones de contexto: ventana de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Limitaciones de idioma: el modelo esta orientado al feroes; su rendimiento en otros idiomas no esta garantizado y probablemente sea degradado tras el CPT.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar las condiciones del modelo base SmolLM2.
- Caveat para produccion: al ser un artefacto de investigacion con cero descargas y sin evaluacion publica, no se recomienda su uso en produccion sin una validacion propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed2
- Modelo base: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-danish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia de modelos de Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
