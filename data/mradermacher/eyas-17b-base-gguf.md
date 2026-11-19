# mradermacher/Eyas-17B-Base-GGUF

## Resumen

Eyas-17B-Base-GGUF es la version cuantizada en formato GGUF del modelo Eyas-17B-Base, un modelo de lenguaje de 17.430.912.000 parametros publicado originalmente por el usuario qingy2024 en Hugging Face. Las cuantizaciones han sido generadas por mradermacher, un conocido creador de versiones GGUF de modelos open source, y estan pensadas para su uso con llama.cpp y herramientas compatibles como Ollama o LM Studio. El modelo base esta etiquetado con `mergekit` y `merge`, lo que indica que se trata de una fusion de modelos (model merge) en lugar de un entrenamiento desde cero.

El modelo esta orientado al idioma ingles (`language: en`) y se distribuye bajo la libreria `transformers`, aunque el formato GGUF permite su despliegue en entornos de inferencia local sin necesidad de GPU de gran capacidad. Con 17.400 millones de parametros, se situa en la franja de modelos medianos-grandes, adecuado para tareas de generacion de texto y razonamiento en ingles.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 17B en hardware de consumo mediante cuantizaciones que van desde 6,6 GB (Q2_K) hasta 18,6 GB (Q8_0). No obstante, la informacion publica disponible es muy limitada: no se detalla la composicion del dataset de entrenamiento, no hay benchmarks publicados y la licencia no esta especificada, lo que supone un riesgo importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `mergekit`/`merge`; probablemente transformer, sin confirmar) |
| Parametros totales | 17.430.912.000 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base qingy2024/Eyas-17B-Base. Las etiquetas `mergekit` y `merge` en la model card indican que el modelo se ha construido mediante una fusion de pesos (model merging) utilizando la herramienta mergekit, una tecnica habitual para combinar capacidades de varios modelos fine-tuneados sin necesidad de reentrenar. Esto implica que el modelo hereda las caracteristicas arquitectonicas de los modelos que se fusionaron, pero no se especifica cuales son ni la receta de la fusion.

Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El modelo base se publico como "Base", lo que sugiere que no ha pasado por un proceso de instruccion o alineacion conversacional, y que su uso previsto es como modelo de continuacion de texto o como punto de partida para fine-tuning. No se han identificado innovaciones tecnicas destacables (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto en ingles como modelo base (completado de texto, no instrucciones).
- Razonamiento y conocimiento general derivado de los modelos fusionados (no cuantificado ni verificado).
- Capacidad de fine-tuning posterior: al ser un modelo "Base", es adecuado como punto de partida para entrenamiento supervisado.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingue mas alla del ingles.
- No se ha documentado vision, audio ni modo thinking.
- Compatible con endpoints (`endpoints_compatible` en los tags de Hugging Face).

## Casos de uso

- Fine-tuning supervisado para dominios especificos: al ser un modelo base de 17B, puede servir como punto de partida para entrenar un modelo de instrucciones en ingles sobre un corpus propio (legal, medico, tecnico) usando frameworks como PEFT o Axolotl.
- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M (10,7 GB) o Q5_K_M (12,5 GB) permiten ejecutar el modelo en GPUs de consumo con 12-16 GB de VRAM mediante llama.cpp u Ollama.
- Generacion de texto y completado en aplicaciones de escritorio: integrable en herramientas como LM Studio o KoboldCpp para tareas de escritura asistida y autocompletado en ingles.
- Experimentacion en investigacion sobre model merging: util para reproducir o comparar el comportamiento de fusiones de modelos mediante mergekit frente a modelos entrenados desde cero.
- Prototipado de pipelines de NLP en ingles: uso como componente de generacion en pipelines de resumen, parafraseo o clasificacion (con fine-tuning adicional) sin depender de APIs externas.
- Despliegue en entornos con GPU limitada: las cuantizaciones Q2_K (6,6 GB) y Q3_K_S (7,8 GB) permiten ejecutar el modelo en GPUs de 8 GB, aunque con perdida de calidad notable en el caso de Q2_K.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes que permiten medir el impacto de la cuantizacion en la perplejidad y la calidad de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - Q2_K: ~6,6 GB de pesos; ~8 GB de VRAM recomendados.
  - Q3_K_M: ~8,6 GB de pesos; ~10 GB de VRAM recomendados.
  - Q4_K_M: ~10,7 GB de pesos; ~12-13 GB de VRAM recomendados.
  - Q5_K_M: ~12,5 GB de pesos; ~14-15 GB de VRAM recomendados.
  - Q6_K: ~14,4 GB de pesos; ~16 GB de VRAM recomendados.
  - Q8_0: ~18,6 GB de pesos; ~20-21 GB de VRAM recomendados.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 4080 / 4070 Ti (16 GB) para Q5_K_M; RTX 4070 / 4060 Ti (12-16 GB) para Q4_K_M; GPUs de 8 GB (RTX 3060 Ti, RTX 4060) para Q2_K y Q3_K_S.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (Q4_K_M y superiores requieren 12 GB o mas).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui; tambien es compatible con endpoints (tags `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Eyas-17B-Base-GGUF (este) | 17,4B | no disponible | no disponible | GGUF | Fusion via mergekit, solo ingles |
| Mistral-7B-Instruct (TheBloke GGUF) | 7,2B | 32k | Apache 2.0 | GGUF | Menor tamano, licencia permisiva, ampliamente soportado |
| Llama-3-8B-Instruct GGUF | 8,0B | 8k | Llama 3 Community License | GGUF | Menor tamano, licencia con restricciones, ecosistema maduro |
| Qwen2.5-14B-Instruct GGUF | 14,7B | 128k | Apache 2.0 | GGUF | Tamano comparable, contexto largo, licencia permisiva |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo Eyas que permitan una comparacion cuantitativa con estas alternativas. La principal desventaja de Eyas-17B-Base-GGUF frente a los modelos citados es la ausencia de licencia declarada y de benchmarks, ademas de ser un modelo base sin alineacion conversacional.

## Limitaciones y advertencias

- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribucion; es un riesgo legal importante para produccion.
- Modelo base sin alineacion: no esta entrenado para seguir instrucciones; puede generar contenido inapropiado o divagaciones sin fine-tuning previo.
- Solo ingles: no se ha documentado soporte para castellano ni otros idiomas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente sin alineacion.
- Sesgos desconocidos: al ser una fusion de modelos no documentada, se desconocen los sesgos heredados de los modelos originales.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Sin benchmarks: imposible evaluar su calidad frente a alternativas con datos publicos.
- Repositorio de 119,1 GB: incluye todas las cuantizaciones; la descarga completa es costosa en almacenamiento.
- Estado de mantenimiento incierto: el modelo base original no tiene documentacion publica sobre su proceso de creacion.
- Fecha de actualizacion (2026-11-19) posterior a la creacion (2024-12-24): sugiere posibles actualizaciones del repo, pero no se detalla que cambios se hicieron.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Eyas-17B-Base-GGUF
- Modelo base original: https://huggingface.co/qingy2024/Eyas-17B-Base
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Eyas-17B-Base-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Eyas-17B-Base-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
