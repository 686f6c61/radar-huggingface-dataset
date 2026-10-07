# DebasishDhal99/Llama-3.2-3B-Instruct-synthetic-agriculture-lora

## Resumen

El modelo `DebasishDhal99/Llama-3.2-3B-Instruct-synthetic-agriculture-lora` es un adaptador LoRA desarrollado por DebasishDhal99 sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct` de Meta. No se trata de un modelo completo, sino de un adaptador PEFT que debe cargarse junto con los pesos originales del modelo base. Su proposito es el ajuste fino para tareas de instrucciones y preguntas de opcion multiple (MCQ) del dominio agricola, entrenado sobre un dataset sintetico propio.

El adaptador se entreno durante 2 epocas con rango LoRA de 16 y alpha de 32 sobre los modulos de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y las capas MLP (`gate_proj`, `up_proj`, `down_proj`), aplicando LoRA a la practica totalidad de las matrices lineales del transformer. El conjunto de datos consta de 1.000 ejemplos de entrenamiento, 100 de validacion y 300 de benchmark reservados exclusivamente para evaluacion final.

Es relevante para desarrolladores que necesiten un punto de partida ligero y de bajo coste de computo para tareas de dominio agricola en ingles, ya que el repo ocupa solo 0,1 GB y se puede entrenar o desplegar en hardware de consumo. La licencia del adaptador no esta declarada, lo que supone una incertidumbre importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (base: Llama-3.2-3B-Instruct) |
| Parametros totales | Adaptador: no disponible (rangos LoRA r=16, alpha=32); modelo base: 3B aprox. |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del modelo base (no especificada en la model card) |
| Tipos de cuantizacion | Ninguna declarada en el adaptador; el modelo base admite las cuantizaciones estandar de Llama 3.2 |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Metodo de ajuste | LoRA (r=16, alpha=32, dropout=0.05, bias=none) |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Dataset | DebasishDhal99/agriculture-synthetic-finetuning-dataset (config v0) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only de aproximadamente 3.000 millones de parametros. LoRA se inserta en siete tipos de matrices lineales por capa (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango 16, alpha 32 y dropout 0,05, lo que da un ratio alpha/rango de 2. La tarea declarada es `CAUSAL_LM` y no se aplico sesgo en los modulos LoRA (`bias: none`). No se especifica cuantizacion del adaptador, por lo que se asume entrenamiento en precision completa o mixta estandar.

El entrenamiento se realizo durante 2 epocas con AdamW, learning rate 0,0002, weight decay 0,01, scheduler lineal y warmup ratio 0,0. El tamano de lote efectivo fue de 16 (batch por dispositivo 2 x acumulacion de gradiente 8) con longitud maxima de secuencia de 1024 tokens. El dataset es sintetico, orientado a preguntas y respuestas agricolas, con particiones de 1.000/100/300 ejemplos (entrenamiento, validacion y benchmark). La particion de benchmark se excluyo explicitamente del ajuste fino y de la seleccion de checkpoint. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa mas alla del propio ajuste supervisado.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama-3.2-3B-Instruct.
- Respuesta a preguntas agricolas (agricultural QA) y resolucion de preguntas de opcion multiple (MCQ) del dominio.
- Seguimiento de instrucciones (instruction following) afinado especificamente sobre el dataset sintetico agricola.
- Conversacion multi-turno basica (etiqueta `conversational`).
- Tool calling / function calling: no documentado en la model card del adaptador; puede depender de las capacidades heredadas del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Capacidades multilingues: limitadas a ingles segun los metadatos.
- Capacidades especiales (vision, audio, modo pensamiento): no disponibles.

## Casos de uso

- Asistencia agronomica basica en ingles: responder consultas frecuentes sobre cultivos, plagas o practicas agricolas usando el ajuste especifico del adaptador sobre el dominio.
- Sistemas de preguntas de opcion multiple educativas: el adaptador se entreno explicitamente para MCQ agricola, por lo que puede usarse en plataformas de formacion agraria con preguntas de seleccion multiple.
- Chatbot especializado de bajo coste: al ser un adaptador de 0,1 GB sobre un modelo de 3B, se puede desplegar en hardware modesto para prototipos de atencion al usuario en el sector agricola.
- Clasificacion y enrutado de consultas agricolas: combinar el modelo con un clasificador previo para dirigir consultas a respuestas especificas del dominio.
- Generacion de material divulgativo agricola: producir resumenes o explicaciones introductorias para boletines tecnicos, siempre con supervision humana por el riesgo de alucinacion.
- Prototipado e investigacion academica: servir como punto de partida para experimentar con fine-tuning adicional de dominio agricola usando PEFT, dado el bajo coste de entrenamiento.
- Integracion en pipelines de RAG agricola: usar el adaptador como generador final sobre documentos recuperados, ya que el ajuste refuerza el vocabulario del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un split de benchmark de 300 ejemplos reservado para evaluacion final, pero no incluye las metricas obtenidas ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB, por lo que el requisito real de VRAM viene determinado por el modelo base de 3B parametros.
- Inferencia del modelo base en fp16: aproximadamente 6-7 GB de VRAM.
- Inferencia en 8 bits: aproximadamente 3-4 GB de VRAM.
- Inferencia en 4 bits (GGUF Q4): aproximadamente 2-3 GB de VRAM.
- GPU de consumo: cabe en RTX 3060 (12 GB), RTX 4070, RTX 4090 y GPUs con al menos 8 GB de VRAM en fp16; en 4 bits puede ejecutarse en GPUs con 4-6 GB.
- GPU de datacenter: A100, H100 o L4 son sobredimensionadas para este modelo, pero validas para lotes grandes.
- Despliegue: compatible con librerias PEFT (transformers + peft) para cargar el adaptador; el modelo base fusionado se puede servir con vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-synthetic-agriculture-lora | Base 3B + adaptador LoRA | Heredada del base | Adaptador PEFT | No disponible | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3B | Heredada (base) | Modelo completo | Llama 3.2 Community License | HuggingFace, ampliamente usado |
| Otros adaptadores LoRA agricolas | No disponible | No disponible | Adaptador PEFT | Variable | No disponible |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia del adaptador, existe incertidumbre legal para uso comercial. El modelo base Llama 3.2 se rige por la Llama 3.2 Community License, que impone sus propias condiciones.
- Dataset sintetico: los 1.000 ejemplos de entrenamiento son generados sinteticamente, lo que puede introducir errores factuales, sesgos del generador y una cobertura limitada de la diversidad real del dominio agricola.
- Volumen de entrenamiento reducido: 2 epocas sobre 1.000 ejemplos es un ajuste muy ligero; el adaptador puede tener un efecto limitado sobre el comportamiento del modelo base.
- Riesgo de alucinacion: como cualquier modelo generativo de este tamano, puede producir respuestas agricolas plausibles pero incorrectas. Requiere validacion por expertos en contextos de produccion.
- Idioma: solo se declara soporte de ingles, lo que limita su uso directo en castellano sin ajuste adicional.
- Contexto: la model card del adaptador no especifica la ventana de contexto efectiva tras el ajuste; se hereda del modelo base.
- Cero descargas y cero likes en el momento de la consulta: no existe evidencia de uso en produccion ni validacion por parte de la comunidad.
- No se documentan evaluaciones de sesgo, toxicidad o robustez.
- Es un adaptador, no un modelo autonomo: requiere descargar el modelo base aparte, lo que anade dependencia y peso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DebasishDhal99/Llama-3.2-3B-Instruct-synthetic-agriculture-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de ajuste fino: https://huggingface.co/datasets/DebasishDhal99/agriculture-synthetic-finetuning-dataset
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
