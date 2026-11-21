# mradermacher/Opusculum-1.5B-i1-GGUF

## Resumen

Opusculum-1.5B-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Stoned-Code/Opusculum-1.5B. No se trata de un modelo original, sino de una redistribucion optimizada para inferencia local mediante llama.cpp y herramientas compatibles con el formato GGUF. El autor de las cuantizaciones es un colaborador habitual de la comunidad que publica versiones comprimidas de modelos pequenos para facilitar su despliegue en hardware de consumo.

El modelo base declara 1.5B en su nombre comercial, aunque el recuento real de parametros reportado en los safetensors del repositorio es de 1.020.404, un dato que debe interpretarse con cautela porque el propio repositorio no incluye los pesos originales en safetensors y la cifra puede corresponder a un tensor concreto o a un recuento parcial. La informacion disponible sobre arquitectura, contexto, datos de entrenamiento y licencia es practicamente nula: la model card solo contiene metadatos de la herramienta de cuantizacion.

Su relevancia actual es limitada y muy especifica: sirve como artefacto de despliegue para quien quiera probar el modelo Opusculum-1.5B en CPU, GPUs modestas o entornos embebidos usando cuantizaciones de 1 a 6 bits. No hay evidencia publicada de benchmarks, licencia clara ni documentacion tecnica del modelo base, por lo que cualquier uso en produccion exige una verificacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.020.404 (segun safetensors del repo; el nombre comercial indica 1.5B) |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en otro formato no confirmado |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura del modelo base Stoned-Code/Opusculum-1.5B en la informacion disponible. La model card del repositorio de cuantizaciones solo incluye metadatos de la herramienta de conversion (quantize_version 2, output_tensor_quantised 1, convert_type hf), lo que indica que los pesos se convirtieron desde un checkpoint en formato Hugging Face antes de aplicar la cuantizacion GGUF.

El proceso de cuantizacion emplea pesos ponderados por importancia (imatrix), segun la propia descripcion del autor ("weighted/imatrix quants of Stoned-Code/Opusculum-1.5B"). Esto significa que las matrices de importancia se calcularon sobre un corpus de calibracion para reducir la perdida de calidad en las cuantizaciones de baja precision (IQ1, IQ2, IQ3). No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF, DPO o alguna innovacion arquitectonica como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de ~1.5B, pero sin documentacion que confirme tareas concretas.
- Razonamiento y matematicas: no disponible; no hay benchmarks ni ejemplos publicados.
- Generacion de codigo: no disponible; el nombre del autor del modelo base (Stoned-Code) sugiere orientacion a codigo, pero no se confirma.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Inferencia local en CPU y GPU de gama baja: confirmada por la existencia de cuantizaciones GGUF de 1 a 6 bits.

## Casos de uso

- Pruebas de concepto en portatiles sin GPU: las cuantizaciones Q4_0, Q4_1 y Q4_K_S permiten ejecutar el modelo en CPU con llama.cpp u Ollama, lo que facilita validar el comportamiento del modelo base antes de invertir en hardware.
- Despliegue en dispositivos embebidos o Raspberry Pi: las variantes IQ1_S, IQ1_M e IQ2_XXS reducen el peso a unos cientos de MB, adecuadas para entornos con RAM muy limitada, siempre que se acepte la perdida de calidad asociada.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye mas de veinte variantes, lo que permite medir la degradacion de calidad entre Q6_K e IQ1_S sobre el mismo modelo base y elegir el punto de equilibrio para un pipeline concreto.
- Prototipado de asistentes de codigo en local: si el modelo base conserva la orientacion a codigo que sugiere su nombre, las cuantizaciones Q5_K_M y Q6_K ofrecen un compromiso razonable para autocompletado en editores sin enviar codigo a la nube.
- Filtrado y clasificacion de texto en lote: un modelo de este tamano puede procesar grandes volumenes de documentos en CPU con throughput aceptable, aunque no hay datos de rendimiento publicados.
- Base para fine-tuning ligero: al ser un modelo pequeno, sirve como punto de partida para experimentos de ajuste con LoRA en una sola GPU consumer, aunque la falta de licencia clara obliga a verificar los terminos antes de redistribuir derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo de ~1.5B en GGUF, las cuantizaciones Q4 rondarian los 0,9-1,1 GB y las Q6_K en torno a 1,3-1,5 GB, aunque estas cifras no estan confirmadas para este repositorio concreto.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con al menos 2-4 GB de VRAM libre deberia poder cargar las cuantizaciones de 4 a 6 bits.
- Compatibilidad con GPU consumer: previsiblemente si en GTX 1650, RTX 3050, RTX 4060 y superiores, asi como en Apple Silicon mediante Metal, pero sin confirmacion oficial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Opusculum-1.5B-i1-GGUF | ~1.5B (nominal) | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Llama-3.2-1B-Instruct | 1.2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se ofrece como referencia de categoria (modelos de ~1-2B con cuantizaciones GGUF), no como equivalencia funcional: para Opusculum-1.5B no hay datos publicados de rendimiento, contexto ni licencia que permitan una comparacion rigurosa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, arquitectura, contexto ni evaluaciones, lo que impide valorar su calidad de forma objetiva.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; usar en produccion sin verificar los terminos del modelo base Stoned-Code/Opusculum-1.5B es un riesgo legal.
- Riesgo de alucinacion: inherente a modelos de este tamano, agravado por la falta de benchmarks que permitan calibrar su fiabilidad.
- Idiomas no confirmados: no hay garantia de soporte de castellano ni de otros idiomas distintos del que se uso en el entrenamiento original.
- Perdida de calidad en cuantizaciones bajas: las variantes IQ1_S, IQ1_M e IQ2_XXS pueden degradar notablemente la coherencia y la fidelidad, especialmente en tareas de razonamiento o codigo.
- Recuento de parametros inconsistente: la cifra de 1.020.404 en safetensors no cuadra con el nombre comercial de 1.5B, lo que sugiere que el dato puede estar incompleto o mal reportado.
- Sin soporte de la comunidad: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de encontrar issues resueltos o ejemplos de uso.
- Fecha de creacion futura (2026-11-21): el metadato del repositorio es anomalo y conviene tratarlo con escepticismo.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Opusculum-1.5B-i1-GGUF
- Modelo base: https://huggingface.co/Stoned-Code/Opusculum-1.5B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
