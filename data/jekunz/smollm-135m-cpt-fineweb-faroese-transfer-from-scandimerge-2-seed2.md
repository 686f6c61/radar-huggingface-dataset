# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed2

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed2` es un ajuste fino de SmolLM2-135M-Instruct orientado a la generacion de texto en feroes (`fo`), una lengua germánica insular con recursos digitales muy limitados. Lo desarrolla el usuario de Hugging Face `jekunz` como parte de una linea de experimentos de adaptacion cross-lingual sobre modelos pequenos, y se distribuye con licencia Apache 2.0.

La receta combina dos fases: primero un ajuste sobre una fusion TIES (con pesos iguales) de dos modelos entrenados en las porciones danesa e islandesa de FineWeb-2, y despues un ajuste sobre la porcion feroesa del mismo corpus. El resultado es un modelo de 134.515.008 parametros (~134,5 M) con contexto maximo de 2048 tokens durante el entrenamiento, pensado para investigacion y no evaluado de forma amplia por el autor.

Es relevante porque demuestra una estrategia de transferencia low-resource: aprovechar lenguas germanicas con mas datos (danes, islandes) para inicializar el modelo antes de exponerlo a feroes, reduciendo el coste de entrenamiento a una sola A100 de 40 GB. El identificador incluye `seed2`, lo que indica que forma parte de una replicacion de tres semillas para medir varianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 (~134,5 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (maximo usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | feroes (`fo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM2-135M-Instruct: un transformer decoder-only denso de 134,5 M de parametros, con tokenizador de la familia Llama y pipeline `text-generation` en `transformers`. No hay innovaciones arquitectonicas propias; el interes esta en el procedimiento de entrenamiento.

El autor describe dos etapas de ajuste: (1) ajuste sobre una fusion TIES con pesos iguales de dos modelos derivados de SmolLM2-135M-Instruct entrenados con las porciones danesa e islandesa de `HuggingFaceFW/fineweb-2`; (2) continuacion del entrenamiento sobre la porcion feroesa del mismo corpus. Hiperparametros declarados: 1 epoca por lengua de origen, 5 epocas en feroes, learning rate 5e-4 con scheduler coseno, warmup ratio 0,05, batch size 8, acumulacion de gradientes 32 (batch efectivo 256), contexto maximo 2048 tokens, semilla 2, ejecutado en una A100 de 40 GB. No se documentan datos de RLHF, DPO ni numero total de tokens procesados.

## Capacidades

- Generacion de texto autoregresiva en feroes, heredada de la base instruct.
- Conversacion multi-turno (pipeline `conversational`), aunque el ajuste se hizo sobre texto de FineWeb-2, no sobre dialogos.
- Razonamiento basico y respuesta a instrucciones heredados de SmolLM2-135M-Instruct, sin garantia de conservacion tras el CPT.
- Capacidades multilingues limitadas al feroes segun la model card; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de texto en feroes para experimentacion linguistica: el modelo permite producir borradores de texto en una lengua con pocos corpus publicos, util para investigacion en NLP low-resource.
- Aumento de datos sinteticos: generar frases en feroes para ampliar corpus de entrenamiento de modelos mayores, siempre con revision humana por el riesgo de alucinacion.
- Prototipado de asistentes conversacionales en feroes: su tamano permite desplegarlo en entornos con recursos minimos para pruebas de concepto de chatbots.
- Investigacion sobre transferencia cross-lingual: sirve como punto de comparacion frente a las otras semillas y frente a la base sin ajuste feroes, para medir varianza de entrenamiento.
- Educacion y divulgacion: generacion de ejemplos de texto y ejercicios en feroes en entornos academicos con hardware modesto.
- Evaluacion de tecnicas de fusion de modelos: el checkpoint documenta una fusion TIES previa, por lo que es util como referencia reproducible en estudios de model merging.
- Despliegue en CPU o GPU de gama baja para demos: con ~134,5 M de parametros cabe en cualquier equipo moderno, lo que facilita pruebas de inferencia sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,27 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica menos de 1 GB.
- VRAM estimada en fp32: aproximadamente 0,54 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si, en practicamente cualquier RTX (por ejemplo, RTX 3060, RTX 4090) e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (smollm-135m-cpt-faroese, seed2) | 134,5 M | 2048 | fo | Apache 2.0 | Ajuste CPT sobre fusion TIES danes/islandes; sin benchmarks publicados |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135 M | 8192 (segun model card original) | multilingue (principalmente ingles) | Apache 2.0 | Base del ajuste; cobertura de feroes muy limitada |
| jekunz/smollm135m-da1-is1-ties | ~135 M | no disponible | da, is | no disponible en la informacion | Modelo base inmediato de este checkpoint |
| Otras semillas del mismo experimento (seed1, seed3) | ~135 M | 2048 | fo | Apache 2.0 | Misma receta con distinta semilla; utiles para medir varianza |

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte que no ha sido evaluado de forma amplia; no debe asumirse calidad en produccion.
- Riesgo de alucinacion alto: con 134,5 M de parametros y un corpus de ajuste limitado, la fidelidad factica es baja.
- Sesgos: no documentados, pero hereda los del corpus FineWeb-2 y de SmolLM2-135M-Instruct, con posible infrarrepresentacion de variedades del feroes.
- Cobertura idiomatica restringida a feroes; el rendimiento en otras lenguas, incluido el ingles, puede haberse degradado tras el CPT.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- El ajuste se realizo sobre texto web, no sobre dialogos, por lo que el comportamiento conversacional puede ser erratico pese al tag `conversational`.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion desaconseja su uso en produccion sin validacion propia.
- Formato de pesos solo safetensors; no hay versiones cuantizadas publicadas, lo que obliga a convertir si se quiere desplegar con llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed2
- Modelo base inmediato: https://huggingface.co/jekunz/smollm135m-da1-is1-ties
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base original SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
