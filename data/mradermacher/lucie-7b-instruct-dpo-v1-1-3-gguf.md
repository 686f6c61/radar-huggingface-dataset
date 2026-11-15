# mradermacher/Lucie-7B-Instruct-DPO-v1.1.3-GGUF

## Resumen

Lucie-7B-Instruct-DPO-v1.1.3 es un modelo de lenguaje conversacional de aproximadamente 6.700 millones de parametros, afinado mediante DPO (Direct Preference Optimization) sobre el dataset `jpacifico/french-orca-dpo-pairs-revised`. El modelo base es `jpacifico/Lucie-7B-Instruct-DPO-v1.1.3`, del que esta ficha cubre la version cuantizada en formato GGUF publicada por mradermacher. Esta orientado principalmente al idioma frances, con soporte secundario de ingles, y se distribuye bajo licencia Apache 2.0.

La relevancia de esta publicacion reside en que facilita el despliegue local del modelo original en hardware de consumo mediante cuantizaciones GGUF de distintos tamanos (desde Q2_K de 2,7 GB hasta f16 de 13,5 GB), ademas de ofrecer una variante con cuantizacion ponderada/imatrix en un repositorio separado. El modelo hereda la arquitectura Llama (tag `llama` en la model card) y esta pensado para casos de uso conversacionales en frances.

No se dispone de informacion detallada sobre la longitud de contexto, la composicion exacta del dataset de entrenamiento ni los resultados de benchmarks en la informacion proporcionada; estos datos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (tag `llama` en la model card; detalles no disponibles) |
| Parametros totales | 6.706.958.336 (≈6,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (variante i1/imatrix en repo separado) |
| Idiomas soportados | Frances (principal), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); el modelo base se distribuye en safetensors via transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer tipo Llama de aproximadamente 6,7 mil millones de parametros. La model card identifica el modelo como derivado de la familia Llama y etiqueta el ajuste como DPO, lo que indica que se aplico optimizacion de preferencias sobre el modelo instructivo previo. El dataset de ajuste es `jpacifico/french-orca-dpo-pairs-revised`, un conjunto de pares de preferencias orientado al frances, lo que explica el enfasis del modelo en ese idioma.

La version cubierta en esta ficha es una cuantizacion estatica realizada por mradermacher con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversion desde pesos Hugging Face a GGUF. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion completa del dataset ni si hubo etapas adicionales de RLHF o SFT previas al DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en frances e ingles, con enfasis en el frances por el dataset de DPO utilizado.
- Ajuste por preferencias (DPO), orientado a respuestas alineadas con preferencias humanas en el dominio del dataset de entrenamiento.
- Soporte de conversacion multi-turno (tag `conversational` en Hugging Face).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia compatibles.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Asistente conversacional en frances: el modelo puede gestionar dialogos multi-turno en frances gracias a su ajuste DPO sobre pares de preferencias en ese idioma, adecuado para chatbots de atencion al usuario en mercados francoparlantes.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (4,2 GB) y Q5_K_M (4,9 GB) permiten ejecutar el modelo en GPUs de consumo, util para prototipado y pruebas sin infraestructura en la nube.
- Generacion de texto asistida en frances: redaccion de borradores, resumenes y reformulaciones en frances con un modelo de 7 B que cabe en memoria de GPU de gama media.
- Investigacion sobre DPO y alineacion: al estar entrenado con un dataset de pares de preferencias en frances, sirve como caso de estudio para evaluar el efecto del DPO en modelos de 7 B.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de doce variantes GGUF (de Q2_K a f16) permite medir el impacto de la cuantizacion en calidad y velocidad sobre un mismo modelo base.
- Integracion en pipelines con llama.cpp u Ollama: el formato GGUF facilita su uso en herramientas de inferencia local para tareas de generacion de texto en frances dentro de flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de archivo como referencia): Q2_K ≈ 2,7 GB; Q3_K_M ≈ 3,4 GB; IQ4_XS ≈ 3,8 GB; Q4_K_M ≈ 4,2 GB; Q5_K_M ≈ 4,9 GB; Q6_K ≈ 5,6 GB; Q8_0 ≈ 7,2 GB; f16 ≈ 13,5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, las cuantizaciones Q4 y Q5 son compatibles con GPUs de consumo con 6-8 GB de VRAM; Q8_0 y f16 requieren GPUs de 12-16 GB o superiores (por ejemplo, RTX 4090, A100, H100) o bien ejecucion parcial en CPU.
- Cabe en GPU de consumo: si, al menos las cuantizaciones Q2_K a Q6_K en GPUs con 6-8 GB de VRAM, segun el margen disponible para contexto y overhead.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF (Ollama, LM Studio, entre otras); el modelo base es compatible con transformers. No se documentan opciones especificas como vLLM o TGI para la version GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Lucie-7B-Instruct-DPO-v1.1.3 (GGUF) | ≈6,7 B | No disponible | fr, en | Apache 2.0 | GGUF |
| Modelos Llama de 7 B comparables | ≈7 B | No disponible | Multiples | Licencia propia | Safetensors, GGUF |
| Modelos Mistral de 7 B comparables | ≈7 B | No disponible | Multiples | Apache 2.0 | Safetensors, GGUF |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo esta especializado en frances; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Al ser un ajuste DPO sobre un dataset especifico, puede heredar sesgos presentes en los pares de preferencias utilizados.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 7 B; no se documentan mecanismos de mitigacion.
- La longitud de contexto no esta especificada, lo que limita la planificacion de casos de uso con documentos largos.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad de forma notable; se recomienda Q4_K_M o superior para uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de entrenamiento antes de un despliegue en produccion.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Lucie-7B-Instruct-DPO-v1.1.3-GGUF
- Modelo base: https://huggingface.co/jpacifico/Lucie-7B-Instruct-DPO-v1.1.3
- Variante imatrix/ponderada: https://huggingface.co/mradermacher/Lucie-7B-Instruct-DPO-v1.1.3-i1-GGUF
- Pagina de resumen del modelo en mradermacher: https://hf.tst.eu/model#Lucie-7B-Instruct-DPO-v1.1.3-GGUF
- Dataset de DPO: https://huggingface.co/datasets/jpacifico/french-orca-dpo-pairs-revised
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
