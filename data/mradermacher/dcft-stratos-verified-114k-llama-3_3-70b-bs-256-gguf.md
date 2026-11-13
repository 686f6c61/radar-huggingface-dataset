# mradermacher/DCFT-Stratos-Verified-114k-Llama-3_3-70B-bs-256-GGUF

## Resumen

DCFT-Stratos-Verified-114k-Llama-3_3-70B-bs-256 es un ajuste fino completo (full fine-tuning) del modelo Llama 3.3 70B de Meta, desarrollado por el equipo mlfoundations-dev y empaquetado en formato GGUF por mradermacher. El modelo parte de la familia Llama 3.3 y se ha entrenado sobre el dataset DCFT-Stratos-Verified-114k, un conjunto de datos de razonamiento verificado de aproximadamente 114.000 muestras, con un tamano de batch de 256 (indicado en el nombre "bs-256"). El resultado es un modelo conversacional orientado a tareas de razonamiento de multiples pasos.

La relevancia de esta ficha radica en que se trata de una cuantizacion estatica (GGUF) de un modelo de 70.553.706.560 parametros, lo que lo hace desplegable en hardware mas modesto que el modelo original en precision completa. El repositorio ocupa 481,3 GB e incluye multiples niveles de cuantizacion (desde Q2_K hasta Q8_0), lo que permite elegir el equilibrio entre calidad y requisitos de memoria.

No obstante, la informacion publicada es muy limitada: no se detalla la composicion exacta del dataset de entrenamiento, no hay resultados de benchmarks publicados y la licencia figura como "other", lo que exige verificar los terminos de uso comercial antes de cualquier despliegue en produccion. El modelo esta etiquetado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Llama 3.3 70B) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Llama 3.3 70B, una arquitectura transformer decoder-only de 70.553.706.560 parametros. El entrenamiento se realizo con llama-factory (etiqueta "llama-factory", "full", "generated_from_trainer" en el modelo base) sobre el dataset DCFT-Stratos-Verified-114k, que segun el nombre contiene aproximadamente 114.000 muestras verificadas de razonamiento. El sufijo "bs-256" indica un tamano de batch de 256 durante el entrenamiento. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de este repositorio no esta en el entrenamiento sino en la distribucion: mradermacher ha generado cuantizaciones estaticas GGUF (version 2 de cuantizacion, con tensor de salida cuantizado) que permiten ejecutar el modelo en llama.cpp y entornos compatibles. Existe ademas una variante con cuantizaciones ponderadas/imatrix en el repositorio -i1-GGUF, que suele ofrecer mejor calidad por bit que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento de multiples pasos, derivado del entrenamiento sobre el dataset Stratus/Stratos de razonamiento verificado.
- Capacidad de seguir instrucciones y mantener contexto conversacional (formato "conversational").
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible").
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas paso a paso gracias al entrenamiento sobre datos de razonamiento verificado, adecuado para tutoria o generacion de explicaciones detalladas.
- Analisis de documentos largos: con un modelo de 70B y contexto heredado de Llama 3.3, puede procesar y resumir textos extensos en ingles, aunque la longitud exacta de contexto no esta confirmada.
- Generacion de codigo y explicaciones tecnicas: util para asistencia en desarrollo en ingles, con capacidad de razonamiento sobre logica de programacion.
- Chatbot de soporte tecnico especializado: el formato conversacional y el ajuste sobre datos verificados lo hacen adecuado para dialogos de atencion al cliente en ingles.
- Investigacion en razonamiento: como modelo de referencia para estudiar el efecto del fine-tuning sobre datasets de razonamiento verificado frente al Llama 3.3 base.
- Despliegue en entornos con GPU limitada: las cuantizaciones Q4_K_M (42,6 GB) permiten ejecutarlo en estaciones de trabajo con 48 GB de VRAM o en configuraciones multi-GPU consumer.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de calidad entre Q2_K y Q8_0 en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~26,5 GB; Q3_K_M ~34,4 GB; Q4_K_M ~42,6 GB; Q5_K_M ~50,0 GB; Q6_K ~58,0 GB; Q8_0 ~75,1 GB.
- GPU recomendadas: A100 80 GB o H100 para Q6_K/Q8_0; 2x RTX 4090 (48 GB) para Q4_K_M; A6000 48 GB para Q4_K_M/Q5_K_S.
- En GPU consumer: Q2_K y Q3_K_S pueden caber en una RTX 4090 (24 GB) solo con offloading parcial a CPU; Q4_K_M requiere al menos 48 GB combinados.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tamano sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DCFT-Stratos-Verified-114k-Llama-3_3-70B-bs-256-GGUF | 70,5B | no disponible | other | GGUF | Fine-tune de razonamiento, solo ingles |
| Llama 3.3 70B (Meta) | 70,5B | 128k (segun Meta) | Llama 3.3 Community License | safetensors, GGUF | Modelo base, multilingue |
| Qwen2.5 72B | 72B | 128k | Apache 2.0 (segun variante) | safetensors, GGUF | Multilingue, licencia mas permisiva |

La comparativa con Qwen2.5 72B se basa en conocimiento general de la categoria; no se dispone de datos de rendimiento comparativo publicados para este fine-tune concreto.

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los terminos del modelo base (Llama 3.3 Community License) y del fine-tune antes de uso comercial.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- No hay benchmarks publicados, por lo que no se puede verificar la mejora real frente a Llama 3.3 base.
- Riesgo de alucinacion inherente a los modelos de 70B, especialmente en tareas de razonamiento sin verificacion externa.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; se recomienda Q4_K_M o superior para produccion.
- El dataset de entrenamiento (114k muestras) es relativamente pequeno para un modelo de 70B, lo que puede provocar sobreajuste a dominios especificos de razonamiento.
- Repositorio con solo 7 descargas y 0 likes: poca validacion comunitaria.
- No se especifica la longitud de contexto efectiva tras el fine-tuning.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/DCFT-Stratos-Verified-114k-Llama-3_3-70B-bs-256-GGUF
- Modelo base: https://huggingface.co/mlfoundations-dev/DCFT-Stratos-Verified-114k-Llama-3_3-70B-bs-256
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/DCFT-Stratos-Verified-114k-Llama-3_3-70B-bs-256-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#DCFT-Stratos-Verified-114k-Llama-3_3-70B-bs-256-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
