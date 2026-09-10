# Jeesup/svd-safety-l2_remove40_gap_b010

## Resumen

El modelo `Jeesup/svd-safety-l2_remove40_gap_b010` es un artefacto de investigacion creado por Jeesup a partir de `meta-llama/Llama-2-7b-chat-hf`. Mediante la tecnica de compresion SVD-LLM, se eliminan el 39,03 % de los parametros del modelo original y se restauran 5665 componentes singulares de acuerdo con la regla de seleccion `gap`, con un presupuesto del 1,0 % de los parametros densos. El resultado es un checkpoint con 6.738.415.616 parametros (aproximadamente el 61 % de los parametros densos originales), pensado para estudiar como la compresion por descomposicion en valores singulares afecta al comportamiento de seguridad y al rechazo de peticiones peligrosas.

No se trata de un modelo de proposito general ni de un asistente desplegable: es una celda de una grid experimental sobre reglas de seleccion de componentes y presupuestos de restauracion. Su model card advierte explicitamente de que varios brazos de la grid estan deliberadamente degradados en seguridad, por lo que debe evaluarse con cautela antes de extraer conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama-2-7b-chat, un transformer decoder-only. La compresion se realiza mediante SVD-LLM, que descompone las matrices de pesos en valores singulares y elimina los componentes menos importantes. En este caso se elimina el 39,03 % de los parametros, dejando un 60,97 % de los parametros densos. Posteriormente se restauran 5665 componentes singulares, lo que supone un presupuesto del 1,0 % de los parametros del modelo denso original. La seleccion de componentes restaurados sigue la regla denominada `gap`.

El proceso no incluye un entrenamiento adicional ni RLHF/DPO: es una manipulacion directa de los pesos del modelo base. El checkpoint fue generado con la semilla 42, segun la model card. No se proporcionan datos sobre el dataset de entrenamiento del modelo base ni sobre el proceso de compresion mas alla de lo indicado.

## Capacidades

- Generacion de texto y conversacion basadas en el comportamiento del Llama-2-7b-chat original.
- Razonamiento basico y respuesta a instrucciones heredados del modelo base.
- No soporta entrada de vision ni audio.
- No se han verificado capacidades de tool calling o function calling; el modelo base no las ofrecia.
- Capacidades multilingues no especificadas en la documentacion.
- Su proposito principal es servir como sujeto experimental para medir el impacto de la compresion SVD en la seguridad y utilidad, no como modelo funcional de uso general.

## Casos de uso

- Evaluacion de robustez de la alineacion bajo compresion: se puede usar para cuantificar como la compresion SVD afecta a la tasa de exito de ataques (AdvBench ASR de 0,0404 y StrongREJECT ASR de 0,0958) frente a prompts peligrosos, comparandola con el modelo base.
- Estudio de interpretabilidad de componentes singulares: este checkpoint permite analizar que componentes restaurados por la regla `gap` influyen en el comportamiento de rechazo, ayudando a identificar correlaciones entre valores singulares y seguridad.
- Benchmark de sobre-rechazo: con un macro sobre-rechazo de 0,2354 segun WildGuard, el modelo es util para estudiar situaciones en las que el modelo rechaza peticiones legitimas tras la compresion.
- Comparacion de reglas de seleccion en SVD-LLM: este checkpoint representa una celda concreta (regla `gap`, presupuesto 1 %) dentro de una grid; puede compararse con otros checkpoints de la misma grid para determinar que regla de seleccion de componentes restaura mejor la seguridad.
- Desarrollo de estrategias de reparacion post-compresion: sirve como base para probar metodos de restauracion parcial, fine-tuning o actualizaciones de pesos que recuperen comportamientos seguros sin volver al modelo completo.
- Validacion de metricas de utilidad en modelos comprimidos: permite correlacionar la perplejidad (11,2309 en WikiText-2) con metricas de seguridad, para entender la relacion entre capacidad de lenguaje y alineacion en modelos comprimidos.

## Benchmarks y rendimiento

La model card proporciona las siguientes metricas medidas:

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,0404 |
| StrongREJECT ASR (HarmBench judge) | 0,0958 |
| Macro sobre-rechazo (WildGuard) | 0,2354 |
| WikiText-2 perplexity | 11,2309 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. La model card advierte que algunos brazos de la grid estan deliberadamente degradados en seguridad, por lo que estos valores deben interpretarse en su contexto experimental.

## Requisitos de hardware

- Los pesos en safetensors ocupan aproximadamente 13,5 GB, lo que sugiere que estan almacenados en precision de 16 bits (FP16/BF16).
- Para inferencia sin cuantizacion se recomienda una GPU con al menos 16 GB de VRAM para acomodar los pesos y los estados de atencion.
- Con cuantizacion a 8 bits (por ejemplo, via bitsandbytes) podria caber en GPUs con 10-12 GB de VRAM; con 4 bits, en torno a 6-8 GB.
- GPUs adecuadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) para precision completa. En GPUs de consumo, una RTX 3090/4090 permite ejecutar el modelo sin cuantizacion; GPUs de 12 GB requieren cuantizacion.
- El modelo es compatible con `transformers`, `text-generation-inference` y endpoints compatibles. No se indica soporte especifico para vLLM o llama.cpp, aunque podria adaptarse.
- Latencia y throughput no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos en la informacion proporcionada. El modelo se puede comparar estructuralmente con su base `meta-llama/Llama-2-7b-chat-hf`:

| Modelo | Parametros | Contexto | Licencia | Tamano de pesos | Nota |
|---|---|---|---|---|---|
| `meta-llama/Llama-2-7b-chat-hf` | 6.738.415.616 | 4096 tokens | Llama 2 Community License | ~13,5 GB | Modelo base original |
| `Jeesup/svd-safety-l2_remove40_gap_b010` | 6.738.415.616 | No disponible | Llama 2 Community License | ~13,5 GB | Comprimido al 61 % con SVD y restauracion parcial |

La comparacion con otros modelos SVD-LLM de la misma grid no es posible sin datos de sus metricas en los recursos disponibles.

## Limitaciones y advertencias

- Este checkpoint no es un modelo de proposito general: es un artefacto de investigacion destinado a estudiar el efecto de la compresion SVD en la seguridad.
- La model card indica que varios brazos de la grid estan deliberadamente degradados en seguridad, por lo que este modelo podria presentar tasas de exito de ataques superiores al modelo base.
- Presenta un macro sobre-rechazo del 23,54 %, lo que significa que rechaza un porcentaje significativo de peticiones legitimas.
- Al igual que el modelo base, puede generar alucinaciones o contenidos incorrectos, especialmente en contextos fuera de su dominio de entrenamiento.
- No se han evaluado sesgos de genero, raza u otros sesgos en la informacion disponible.
- La licencia Llama 2 Community License incluye restricciones de uso aceptable y obliga a cumplir la politica de uso; cualquier despliegue comercial debe revisar esos terminos.
- No se especifican los idiomas soportados ni la longitud de contexto, por lo que su comportamiento en lenguajes distintos del ingles o en contextos largos es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_remove40_gap_b010

No se han encontrado otros enlaces relevantes en los resultados de busqueda web.
