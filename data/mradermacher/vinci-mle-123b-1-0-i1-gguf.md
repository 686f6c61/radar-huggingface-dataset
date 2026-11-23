# mradermacher/Vinci-MLE-123B-1.0-i1-GGUF

## Resumen

Vinci-MLE-123B-1.0-i1-GGUF es la version cuantizada en formato GGUF del modelo Vinci-MLE-123B-1.0, desarrollado originalmente por simpledirect y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de gran tamano (125.025.988.608 parametros segun los pesos en safetensors del modelo base) especializado en ingenieria de machine learning (MLE) y uso de herramientas (tool-use), construido sobre una base de tipo Devstral y afinado mediante LoRA. La nomenclatura y las etiquetas asociadas (devstral, lora, canadian-ai, simpledirect, vinci) indican que deriva de la familia Mistral/Devstral y que su licencia es una variante modificada de MIT con clausulas de Mistral AI.

El modelo esta pensado para tareas de ingenieria de machine learning: generacion y depuracion de codigo, orquestacion de herramientas y flujos de trabajo tecnicos. Esta publicacion concreta es una coleccion de cuantizaciones de tipo imatrix (i1) generadas por mradermacher, que abarcan desde IQ1_S (27,3 GB) hasta Q6_K (102,7 GB), lo que permite desplegar el modelo en distintos presupuestos de memoria.

La relevancia de esta ficha radica en que el modelo base es de gran tamano y no cabe en hardware de consumo en precision completa, por lo que las cuantizaciones GGUF son la via practica para ejecutarlo en estaciones de trabajo con GPU de gran VRAM o en configuraciones multi-GPU. La informacion disponible sobre arquitectura interna, contexto y datos de entrenamiento es limitada; se indica explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Devstral/Mistral, segun etiquetas del modelo); detalles internos no disponibles |
| Parametros totales | 125.025.988.608 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | modified-mit-mistral-ai-2025 (licencia "other" con enlace a LICENSE) |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a una base de tipo Devstral (familia Mistral) y a un ajuste mediante LoRA sobre el modelo simpledirect/Vinci-MLE-123B-1.0. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como atencion lineal o decodificacion especulativa.

Lo que si es verificable es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con imatrix (i1) a partir del modelo base, empleando el pipeline de conversion a GGUF (convert_type: hf) y quantize_version 2. El repositorio incluye un fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Las cuantizaciones de mayor tamano (Q6_K) se distribuyen en tres partes.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiqueta "conversational").
- Ingenieria de machine learning: generacion, revision y depuracion de codigo orientado a pipelines de ML.
- Uso de herramientas (tool-use) y function calling, segun las etiquetas del modelo.
- Razonamiento multi-paso orientado a tareas tecnicas y de investigacion.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistencia en ingenieria de ML: el modelo puede generar y corregir scripts de entrenamiento, configuraciones de experimentos y codigo de preprocesado, aprovechando su especializacion MLE y su capacidad de tool calling para consultar documentacion o ejecutar validaciones.
- Automatizacion de pipelines de CI/CD para modelos: integrado como agente que interpreta errores de build, propone parches y verifica resultados mediante llamadas a herramientas, reduciendo la intervencion manual en tareas repetitivas.
- Agentes de investigacion tecnica: con soporte de tool-use, puede encadenar busquedas, lectura de repositorios y sintesis de resultados en flujos multi-paso, adecuado para prototipado de asistentes de I+D.
- Generacion de codigo en produccion: su orientacion a Devstral y MLE lo hace util para completar y refactorizar codigo en entornos donde se requiere adhesion a APIs y convenciones internas, siempre con revision humana.
- Analisis y documentacion de codigo heredado: puede resumir repositorios, explicar dependencias y proponer migraciones, tarea favorecida por su entrenamiento en codigo y su capacidad conversacional.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones GGUF (desde 27,3 GB en IQ1_S), es posible ejecutarlo en equipos con GPU de gran VRAM o configuraciones multi-GPU para prototipos y evaluacion sin depender de la nube.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece una matriz completa de cuantizaciones i1, util para estudiar el compromiso entre tamano, velocidad y calidad en modelos de 125B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 27,3 GB (i1-IQ1_S) hasta 102,7 GB (i1-Q6_K), segun el tamano de cada cuantizacion; el modelo base en precision completa requiere varios cientos de GB.
- GPU recomendadas: para las cuantizaciones de mayor calidad (Q5_K_M, Q6_K) se necesitan configuraciones multi-GPU con A100 80 GB o H100 80 GB; para cuantizaciones intermedias (Q4_K_M, 75,0 GB) puede bastar una unica GPU de 80 GB o dos GPU de 48 GB.
- GPU de consumo: las cuantizaciones mas bajas (IQ1_S, IQ1_M, IQ2_XXS) caben en una RTX 4090 de 24 GB solo parcialmente; en la practica requieren offloading a RAM o configuraciones de 32 GB o mas (por ejemplo, RTX 5090) para IQ1/IQ2.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vinci-MLE-123B-1.0-i1-GGUF | 125.025.988.608 | no disponible | modified-mit-mistral-ai-2025 | GGUF | Especializado en MLE y tool-use; cuantizaciones i1 desde 27,3 GB |
| Devstral (familia Mistral) | no disponible | no disponible | no disponible | safetensors | Base declarada del modelo; orientado a codigo y agentes |
| Mistral Large | no disponible | no disponible | licencia Mistral | safetensors | Alternativa de gran tamano de la misma familia, sin especializacion MLE declarada |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible; los datos de parametros y contexto de los modelos comparables no se han publicado en las fuentes consultadas.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo y referencias a APIs inexistentes.
- Las cuantizaciones de baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- La licencia modified-mit-mistral-ai-2025 incluye clausulas adicionales de Mistral AI; es necesario revisar el fichero LICENSE antes de uso comercial.
- No se documentan sesgos especificos ni datos de evaluacion de seguridad.
- La longitud de contexto no esta publicada, lo que impide planificar despliegues con ventanas largas.
- El repositorio tiene un tamano de 1332,3 GB y las cuantizaciones Q6_K se distribuyen en tres partes, lo que complica la descarga y verificacion.
- El modelo base es de 125B, por lo que el despliegue requiere hardware de gama alta y no es apto para inferencia en CPU con latencias interactivas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Vinci-MLE-123B-1.0-i1-GGUF
- Modelo base: https://huggingface.co/simpledirect/Vinci-MLE-123B-1.0
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Vinci-MLE-123B-1.0-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Vinci-MLE-123B-1.0-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
