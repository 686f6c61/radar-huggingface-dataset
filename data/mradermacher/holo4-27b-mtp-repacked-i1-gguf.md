# mradermacher/Holo4-27B-MTP-Repacked-i1-GGUF

## Resumen

Holo4-27B-MTP-Repacked-i1-GGUF es una cuantizacion en formato GGUF del modelo Holo4-27B-MTP-Repacked, publicada por el usuario mradermacher. Se trata de una redistribucion de pesos ya existentes (no de un modelo entrenado desde cero) generada con el pipeline de cuantizacion de mradermacher, que aplica cuantizacion ponderada con matrices de importancia (imatrix) para mejorar la calidad de los niveles de compresion bajos. El modelo base tiene 27.320.697.856 parametros, lo que lo situa en la franja de 27B.

El modelo subyacente, segun la model card y las etiquetas del repositorio, esta orientado a tareas conversacionales, uso como agente, "computer use" y procesamiento multimodal. Las etiquetas mencionan la arquitectura qwen3_5 y el sufijo MTP (multi-token prediction), aunque no se dispone de documentacion tecnica detallada del modelo original en la informacion proporcionada. El repositorio i1 incluye una bateria amplia de cuantizaciones que va desde IQ1_S hasta Q6_K, pensadas para distintos presupuestos de memoria.

La relevancia practica de esta ficha es acotada: se trata de una publicacion reciente (7 de noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, sin model card propia mas alla de los metadatos de cuantizacion, y sin resultados de benchmarks publicados. Resulta util como punto de entrada para ejecutar el modelo en local mediante llama.cpp u Ollama, pero no debe considerarse una fuente autoritativa sobre las capacidades reales del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5 segun metadatos del repo); detalles no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (la etiqueta del repo base indica "English") |
| Licencia | no disponible en este repo; el repo base figura como cc-by-nc-4.0 |
| Formato de pesos | GGUF (repo de 39,5 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) del modelo Holo4-27B-MTP-Repacked. La unica informacion tecnica disponible en este repositorio es la relativa al proceso de cuantizacion: se han generado cuantizaciones ponderadas con imatrix (quantize_version 2, output_tensor_quantised 1, convert_type hf), lo que implica que las matrices de importancia se calcularon sobre el modelo en formato Hugging Face y se aplicaron a los tensores de salida.

El sufijo MTP del nombre sugiere multi-token prediction, una tecnica de entrenamiento que anade cabezas auxiliares para predecir varios tokens futuros y que puede aprovecharse para decodificacion especulativa, pero no hay confirmacion documental de ello en la informacion proporcionada. Las etiquetas del repositorio base incluyen "multimodal", "computer-use" y "agent", lo que apunta a un modelo con capacidades de vision y uso de herramientas, si bien no se detalla el mecanismo.

## Capacidades

- Generacion de texto conversacional: el repositorio se etiqueta como "conversational" y "text-generation-inference".
- Razonamiento y agentes: las etiquetas "agent" y "computer-use" indican soporte previsto para tareas multi-paso y control de entornos, sin documentacion adicional disponible.
- Multimodalidad: la etiqueta "multimodal" del repo base sugiere entrada de imagenes, aunque este repositorio GGUF no incluye informacion sobre proyector visual (no aparece mmproj en los metadatos).
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles; la etiqueta del repo base apunta a ingles.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Despliegue local de un modelo de 27B en hardware de consumo: las cuantizaciones IQ2/IQ3 (aproximadamente 10-14 GB) permiten ejecutar el modelo en GPUs con 12-16 GB de VRAM mediante llama.cpp, util para prototipado sin coste de API.
- Asistente conversacional autoalojado: el modelo puede servir conversaciones multi-turno en una interfaz tipo chat, con la ventaja de que los datos no salen de la infraestructura propia.
- Experimentacion con agentes y computer use: dado el etiquetado del repo base, sirve para probar flujos de automatizacion de escritorio o navegador en entornos controlados, siempre validando el comportamiento real.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 variantes, lo que permite medir la degradacion de calidad entre IQ1_S y Q6_K sobre las mismas tareas.
- Fine-tuning ligero o destilacion sobre pesos cuantizados: las variantes Q4_K_M y Q5_K_M son adecuadas como base para experimentos de LoRA en entornos con recursos limitados.
- Integracion en pipelines de inferencia con llama.cpp o TGI: al estar en GGUF y etiquetarse como compatible con text-generation-inference, puede incorporarse a servicios internos de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (27,3B parametros, calculo orientativo): IQ1_S/IQ1_M en torno a 7-9 GB; IQ2_XS/IQ2_M en torno a 9-11 GB; IQ3_XXS/IQ3_M en torno a 11-13 GB; Q4_K_M en torno a 15-17 GB; Q5_K_M en torno a 18-19 GB; Q6_K en torno a 21-23 GB; Q4_0/Q4_1 en torno a 15-16 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M y Q6_K; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M; RTX 3060 12 GB para IQ3_M o IQ2_M; A100 40/80 GB y H100 para despliegues de produccion con contexto largo.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas usando cuantizaciones IQ2/IQ3, y en 16-24 GB con Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), text-generation-inference (etiqueta endpoints_compatible), y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles; dependen de la GPU, de la cuantizacion y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Holo4-27B-MTP-Repacked-i1-GGUF | 27,3B | no disponible | no disponible (repo base cc-by-nc-4.0) | GGUF | Cuantizacion imatrix de un modelo multimodal/agente |
| Holo4-27B-MTP-Repacked-GGUF | 27,3B | no disponible | cc-by-nc-4.0 | GGUF | Version estandar del mismo autor, sin imatrix i1 |
| Holo4-27B-MTP-Repacked | 27,3B | no disponible | cc-by-nc-4.0 | safetensors | Pesos originales en formato Hugging Face |
| Gemma 3 27B | 27B | 128K | Gemma license | safetensors, GGUF | Alternativa multimodal de tamano comparable |
| Qwen3 32B | 32,8B | 128K | Apache 2.0 | safetensors, GGUF | Alternativa densa con licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card solo contiene metadatos de cuantizacion, sin informacion sobre entrenamiento, contexto o rendimiento.
- Licencia: el repositorio no declara licencia propia; el repo base figura como cc-by-nc-4.0, lo que prohibe el uso comercial. Verificar antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin benchmarks no puede acotarse su fiabilidad.
- Idiomas: probablemente optimizado para ingles; el rendimiento en castellano no esta documentado.
- Multimodalidad no verificada: la etiqueta "multimodal" no se traduce en un proyector visual incluido en este repo GGUF.
- Cuantizaciones muy agresivas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; no recomendadas para tareas de razonamiento o codigo.
- Repositorio sin traccion (0 descargas, 0 likes): no hay retroalimentacion de la comunidad sobre su funcionamiento real.
- Fecha de creacion futura respecto a la mayoria de referencias publicas, lo que dificulta contrastar el modelo base.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/Holo4-27B-MTP-Repacked-i1-GGUF
- Repositorio GGUF sin imatrix del mismo autor: https://huggingface.co/mradermacher/Holo4-27B-MTP-Repacked-GGUF
- Arbol de ficheros del repositorio: https://huggingface.co/mradermacher/Holo4-27B-MTP-Repacked-GGUF/tree/main
- Modelo base repackeado: https://huggingface.co/prithivMLmods/Holo4-27B-MTP-Repacked
