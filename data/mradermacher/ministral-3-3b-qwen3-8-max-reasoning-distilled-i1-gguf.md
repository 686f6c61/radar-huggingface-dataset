# mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF

## Resumen

Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF es la version cuantizada en formato GGUF del modelo xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled, un fine-tuning de Ministral 3B (familia Mistral) destilado a partir de trazas de razonamiento de Qwen 3.8 Max. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, e incluye tanto cuantizaciones estaticas como cuantizaciones con imatrix (denominadas i1) para preservar mejor la calidad en tamanos reducidos.

El modelo resuelve un problema concreto: llevar capacidades de razonamiento estilo cadena de pensamiento a un tamano de 3.429.006.336 parametros que pueda ejecutarse en hardware de consumo. La destilacion se realizo sobre el dataset saidutta69/qwen3.8-max-distillation-50k-clean, compuesto por 50.000 muestras limpias de razonamiento generadas por un modelo mayor. El resultado es un modelo conversacional y de razonamiento en ingles, con licencia Apache 2.0, que hereda la arquitectura base de Ministral 3B.

La relevancia actual reside en su perfil de despliegue: al estar disponible en GGUF con cuantizaciones desde IQ1_S (~1.0 GB) hasta Q6_K, permite ejecutar un modelo de razonamiento en equipos sin GPU dedicada o con VRAM limitada, manteniendo la posibilidad de usar decodificacion local mediante llama.cpp u Ollama. El repositorio tiene 41,6 GB porque agrupa todas las variantes de cuantizacion, no porque el modelo completo pese eso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Ministral 3B), fine-tuning con destilacion de razonamiento |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ4_XS y variantes estaticas en el repo hermano (Q4_K_M, Q5_K_M, Q6_K, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es Ministral 3B, un transformer decoder-only de la familia Mistral orientado a eficiencia en el borde. Sobre esa base, xtools-at aplico un proceso de destilacion de razonamiento usando el dataset saidutta69/qwen3.8-max-distillation-50k-clean, que contiene 50.000 muestras de trazas de razonamiento generadas por Qwen 3.8 Max y filtradas para eliminar ruido. El objetivo es que un modelo de 3B reproduzca patrones de cadena de pensamiento (thinking) propios de un modelo mucho mayor, sin necesidad de RLHF a gran escala.

La cuantizacion la realiza mradermacher con el pipeline habitual de llama.cpp: conversion desde pesos Hugging Face (convert_type: hf), generacion de un fichero imatrix propio del modelo y produccion de cuantizaciones i1 (importancia ponderada) ademas de las estaticas. Las cuantizaciones i1 usan la matriz de importancia para asignar mas bits a los tensores mas sensibles, lo que en la practica mejora la perplejidad frente a cuantizaciones estaticas del mismo tamano. La model card indica que se trata de un modelo de vision, con ficheros mmproj disponibles en el repositorio estatico hermano, aunque no se detalla la composicion exacta del dataset de vision ni el proceso de alineamiento.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento explicito estilo cadena de pensamiento, heredado de la destilacion de Qwen 3.8 Max.
- Resolucion de problemas matematicos y logicos de complejidad media, adecuada al tamano de 3B.
- Generacion y explicacion de codigo, con calidad limitada por el numero de parametros.
- Capacidad de vision declarada por el autor de la cuantizacion (ficheros mmproj en el repo estatico), aunque no se documenta el alcance.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo thinking permite encadenar pasos, pero no hay documentacion de integracion con frameworks de agentes.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Razonamiento local en equipos sin GPU: con la cuantizacion i1-Q4_K_M (~2,2 GB) el modelo cabe en CPU con 8 GB de RAM y permite resolver problemas de logica y matematicas basicas sin conexion, usando llama.cpp.
- Asistente de codigo en el editor: integrado via Ollama o llama.cpp en plugins tipo Continue, puede autocompletar funciones, explicar errores y proponer refactorizaciones de fragmentos cortos, con latencia baja en GPUs de consumo.
- Prototipado de pipelines de razonamiento: util para validar prompts de cadena de pensamiento y formatos de salida antes de migrar a un modelo mayor, gracias a su bajo coste de inferencia.
- Educacion y tutoria automatizada: puede generar explicaciones paso a paso de problemas de matematicas o fisica de secundaria, con la ventaja de que el modo thinking hace visible el razonamiento intermedio.
- Procesamiento por lotes en servidores modestos: con vLLM o llama-server se pueden ejecutar varias instancias en una sola GPU de 24 GB para clasificacion, extraccion de entidades o resumen de textos en ingles.
- Experimentacion con destilacion: sirve como referencia para comparar la calidad de un 3B destilado frente al modelo profesor en tareas acotadas, y como base para nuevos fine-tunings con LoRA.
- Despliegue en dispositivos de borde: las cuantizaciones IQ2/IQ3 (1,2-1,8 GB) permiten ejecutar el modelo en mini-PC, Raspberry Pi 5 con 8 GB o moviles de gama alta mediante llama.cpp, para tareas de asistencia offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): IQ1_S ~1,0 GB; IQ2_M ~1,4 GB; IQ3_M ~1,8 GB; IQ4_XS ~2,1 GB; Q4_K_M ~2,2 GB; Q5_K_M ~2,5 GB; Q6_K ~2,9 GB. Anadir entre 0,5 y 2 GB segun la longitud de contexto configurada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6 con contexto amplio; A100 y H100 no aportan ventaja a este tamano y solo tienen sentido para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM usando cuantizaciones IQ3/IQ4; tambien en GPUs integradas y CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, text-generation-webui, koboldcpp; vLLM y TGI solo con los pesos safetensors del modelo base, no con GGUF.
- Latencia y throughput estimados: no disponibles de forma oficial. En una RTX 4090 con Q4_K_M se puede esperar un throughput de decenas de tokens por segundo, pero es una estimacion orientativa no publicada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled (i1-GGUF) | 3,43B | no disponible | Apache 2.0 | GGUF | Destilado de razonamiento, solo ingles, con vision declarada |
| Ministral 3B (base, Mistral AI) | 3B | 128k (segun documentacion de Mistral) | Mistral Research / no comercial en algunas variantes | safetensors, GGUF | Modelo base sin destilacion; contexto largo documentado por el fabricante |
| Qwen2.5-3B-Instruct | 3,09B | 32k | Apache 2.0 | safetensors, GGUF | Multilingue, sin modo thinking nativo |
| Llama-3.2-3B-Instruct | 3,21B | 128k | Llama 3.2 Community License | safetensors, GGUF | Multilingue, requiere aceptar licencia de Meta |

La comparativa se limita a datos publicos de cada familia; no hay benchmarks del modelo destilado que permitan afirmar superioridad en tareas concretas.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Al ser un modelo de 3B destilado, la tasa de alucinacion en tareas factuales es alta; no debe usarse como fuente de verdad sin verificacion.
- El modo thinking puede generar cadenas de razonamiento largas que incrementan la latencia y el consumo de contexto; conviene limitar la longitud de salida en produccion.
- Las cuantizaciones por debajo de IQ3 degradan notablemente la calidad, segun advierte el propio autor (etiquetas "for the desperate", "very low quality").
- No hay documentacion sobre sesgos especificos del fine-tuning; hereda los sesgos de Ministral 3B y del dataset de destilacion de Qwen 3.8 Max.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Ministral puede tener restricciones adicionales segun la version; conviene verificar la licencia del modelo base original de Mistral AI antes de desplegar en produccion.
- El soporte de vision esta declarado pero no documentado; los ficheros mmproj estan en el repositorio estatico y su calidad no ha sido validada.
- No se especifica la longitud de contexto del fine-tuning; usar contextos muy largos puede degradar la coherencia.

## Enlaces

- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF
- Repositorio estatico GGUF: https://huggingface.co/mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-GGUF
- Modelo base (safetensors): https://huggingface.co/xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled
- Dataset de destilacion: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Pagina de conveniencia del cuantizador: https://hf.tst.eu/model#Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
