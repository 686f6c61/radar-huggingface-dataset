# hohotach6/Llama-3.2-3B-ascii-cats-guide-lora

## Resumen

Llama-3.2-3B-ascii-cats-guide-lora es un ajuste fino (LoRA) del modelo base unsloth/Llama-3.2-3B, publicado por el usuario hohotach6 en Hugging Face. El nombre del repositorio sugiere que el ajuste se ha orientado a la generacion de guias o contenido relacionado con "gatos ASCII", aunque la model card no documenta el dataset de entrenamiento ni el objetivo concreto del fine-tuning. El modelo se distribuye con licencia Apache 2.0 y esta etiquetado unicamente para el idioma ingles.

Se trata de un adaptador LoRA de pequeno tamano (el repositorio ocupa aproximadamente 0,1 GB), entrenado con la libreria Unsloth, que el autor declara haber usado para acelerar el entrenamiento "2x". El modelo base, Llama 3.2 3B, es un transformer denso de 3.000 millones de parametros desarrollado por Meta, con una ventana de contexto de 128.000 tokens y soporte multilingue oficial en ocho idiomas.

La relevancia de esta ficha es limitada desde el punto de vista de produccion: no hay benchmarks publicados, no hay documentacion del dataset, no hay descargas ni interacciones, y la model card es practicamente la plantilla autogenerada por Unsloth. Se documenta aqui como ejemplo de adaptador LoRA de bajo coste sobre un modelo pequeno, util para experimentacion local pero sin garantias de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 3B) con adaptador LoRA |
| Parametros totales | 3.000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.2 3B) |
| Tipos de cuantizacion | no disponible en el repositorio (el modelo base admite cuantizacion GGUF/AWQ/INT8 via herramientas externas) |
| Idiomas soportados | en (segun la model card); el modelo base soporta oficialmente en, de, fr, it, pt, hi, es y th |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Llama 3.2 3B, un transformer decoder-only denso con atencion por grupos (GQA) y RoPE, tal como lo publica Meta. El adaptador se entreno con Unsloth, una libreria que optimiza el entrenamiento de modelos Llama mediante kernels personalizados y reduccion de memoria, y que el autor declara haber utilizado para obtener un entrenamiento "2x mas rapido". No se especifica el rango del LoRA, el alpha, la tasa de aprendizaje, el numero de pasos ni el numero de tokens de entrenamiento.

La model card no documenta la composicion del dataset, si hubo RLHF, DPO o simplemente ajuste supervisado, ni si se congelaron las capas del modelo base. Tampoco se indica si el adaptador se ha fusionado con los pesos base o se distribuye por separado; el tamano del repositorio (0,1 GB) sugiere que se trata unicamente del adaptador y no de los pesos completos. No hay innovaciones tecnicas destacables mas alla del uso de Unsloth como herramienta de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Llama 3.2 3B.
- Razonamiento basico y respuesta a instrucciones, sujeto a la calidad del ajuste fino (no documentada).
- Generacion de codigo y matematicas basicas, en la medida en que el modelo base las soporta.
- Soporte de tool calling y function calling: el modelo base Llama 3.2 lo soporta, pero no se ha verificado que el adaptador lo preserve.
- Capacidades multilingues limitadas al ingles segun la model card, aunque el modelo base soporta ocho idiomas.
- No se documenta soporte de vision, audio ni modo "thinking".
- Capacidad especifica de generacion de guias sobre "gatos ASCII" sugerida por el nombre del repositorio, sin documentacion que la respalde.

## Casos de uso

- Experimentacion con LoRA sobre Llama 3.2 3B: el adaptador sirve como ejemplo de como ajustar un modelo pequeno con Unsloth y desplegarlo con transformers o TGI, util para aprender el flujo completo de fine-tuning.
- Generacion de contenido tematico sobre arte ASCII: si el ajuste funciona como sugiere el nombre, podria generar guias o descripciones de gatos en ASCII, aunque no hay evidencia publicada de calidad.
- Prototipado rapido en local: al ser un adaptador de 0,1 GB sobre un modelo de 3B, se puede cargar en una GPU de consumo (por ejemplo, RTX 3060 de 12 GB) para pruebas de generacion de texto en ingles.
- Base para fine-tuning adicional: el adaptador puede servir como punto de partida para otros ajustes sobre Llama 3.2 3B en dominios especificos.
- Evaluacion comparativa de adaptadores LoRA: util para investigadores que quieran medir el impacto de un LoRA de bajo coste frente al modelo base en tareas de generacion.
- Docencia y demos: por su tamano reducido, es adecuado para talleres sobre fine-tuning con Unsloth y despliegue con text-generation-inference.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6-7 GB para el modelo base de 3B mas el adaptador (el adaptador anade muy poco).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 3,5-4 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4): aproximadamente 2-2,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en FP16 y en tarjetas con 4 GB o mas en cuantizacion 4 bits.
- Opciones de despliegue: transformers (con peft para cargar el adaptador), text-generation-inference (etiqueta presente en el repositorio), vLLM (previa fusion del adaptador), llama.cpp u Ollama (previa conversion a GGUF).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hohotach6/Llama-3.2-3B-ascii-cats-guide-lora | 3B (base) + LoRA | 128k (base) | Apache 2.0 | Hugging Face, 0 descargas | Adaptador sin benchmarks ni documentacion de dataset |
| meta-llama/Llama-3.2-3B | 3B | 128k | Llama 3.2 Community License | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados por Meta |
| unsloth/Llama-3.2-3B | 3B | 128k | Apache 2.0 | Hugging Face | Version del modelo base optimizada por Unsloth, usada como punto de partida |
| Qwen2.5-3B | 3B | 32k | Apache 2.0 | Hugging Face | Alternativa densa de tamano similar con soporte multilingue amplio |

## Limitaciones y advertencias

- No hay documentacion del dataset de entrenamiento, por lo que se desconocen los sesgos introducidos por el ajuste fino.
- Riesgo de alucinacion inherente a los modelos de 3B, agravado por la falta de evaluacion del adaptador.
- El modelo esta etiquetado solo para ingles; el rendimiento en castellano no esta garantizado aunque el modelo base lo soporte.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 3B de Meta tiene su propia licencia comunitaria que puede imponer restricciones adicionales; conviene revisar ambas.
- El repositorio no tiene descargas ni interacciones, lo que sugiere que no ha sido validado por la comunidad.
- El nombre del repositorio indica un dominio muy especifico ("ascii cats guide") sin evidencia de que el ajuste funcione mas alla de ese dominio.
- No se especifica si el adaptador esta fusionado con los pesos base; es necesario cargarlo con peft o fusionarlo manualmente antes de usar vLLM o llama.cpp.
- La fecha de creacion (2026-11-16) es futura respecto a la mayoria de referencias del ecosistema, lo que puede indicar un error de metadatos o un repositorio de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/hohotach6/Llama-3.2-3B-ascii-cats-guide-lora
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Llama-3.2-3B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo oficial Llama 3.2 3B de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B
