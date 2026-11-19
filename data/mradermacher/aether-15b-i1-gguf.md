# mradermacher/Aether-15B-i1-GGUF

## Resumen

Aether-15B-i1-GGUF es una coleccion de cuantizaciones GGUF del modelo Aether-15B, desarrollado por K-Ai-Official y cuantizado por mradermacher. Aether-15B es un modelo de lenguaje de aproximadamente 14.770 millones de parametros construido sobre la arquitectura Qwen3, afinado para tareas de matematicas, programacion y conversacion, con soporte declarado para indonesio, ingles y japones. Esta ficha describe especificamente el repositorio de cuantizaciones, no los pesos originales en precision completa.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 15B en hardware de consumo mediante cuantizaciones de 4 a 6 bits que ocupan entre 8,7 y 12,2 GB, ademas de ofrecer variantes de muy baja precision (IQ1, IQ2) para entornos con recursos muy limitados. El autor emplea cuantizacion con imatrix (importance matrix), lo que mejora la calidad respecto a cuantizaciones estaticas del mismo tamano.

El repositorio incluye 25 variantes de cuantizacion, desde IQ1_S (3,7 GB) hasta Q6_K (12,2 GB), junto con el fichero imatrix para generar cuantizaciones propias. La licencia es Apache 2.0, lo que facilita su uso comercial. No se dispone de informacion sobre benchmarks publicados ni sobre la longitud de contexto del modelo base en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, familia Qwen3 (segun tags del repositorio) |
| Parametros totales | 14.768.307.200 (14,77B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | indonesio (id), ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base Aether-15B pertenece a la familia Qwen3, segun los tags del repositorio, y cuenta con 14.768.307.200 parametros. Se trata de un modelo afinado (fine-tuned) sobre el dataset K-Ai-Official/Kai_v3, orientado a matematicas, programacion y conversacion, con soporte para indonesio, ingles y japones. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

Las cuantizaciones de este repositorio se generaron con imatrix (importance matrix), un metodo que pondera la cuantizacion segun la importancia de cada tensor para la perplejidad, lo que produce mejor calidad que las cuantizaciones estaticas del mismo tamano. El autor indica que las variantes IQ suelen ser preferibles a las no-IQ de tamano similar. Existe tambien un repositorio hermano con cuantizaciones estaticas (Aether-15B-GGUF).

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag "conversational" del repositorio.
- Razonamiento matematico y resolucion de problemas, segun los tags "math" y el dataset de entrenamiento orientado a matematicas.
- Generacion de codigo, segun el tag "coding".
- Capacidades multilingues en indonesio, ingles y japones.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integracion con APIs de inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion en local: con la cuantizacion Q4_K_M (9,1 GB) el modelo cabe en GPUs de consumo de 12 GB o mas, permitiendo autocompletado y generacion de codigo sin depender de servicios en la nube.
- Tutoria de matematicas en indonesio o japones: el afinado sobre el dataset Kai_v3 orientado a matematicas y los idiomas declarados lo hacen adecuado para explicar problemas paso a paso en esas lenguas.
- Atencion al cliente en mercados del sudeste asiatico: el soporte nativo de indonesio permite desplegar chatbots conversacionales multi-turno con cuantizaciones Q5_K_M (10,6 GB) en servidores modestos.
- Despliegue en hardware de consumo: la variante IQ3_M (7,0 GB) o Q4_K_S (8,7 GB) permite ejecutar el modelo en GPUs de 8-10 GB como la RTX 3060 Ti o la RTX 4060, con calidad aceptable para tareas generales.
- Entornos con recursos muy limitados: las variantes IQ1_S (3,7 GB) e IQ2_M (5,4 GB) permiten ejecutar el modelo en CPU con llama.cpp o en GPUs de 6 GB, a costa de una perdida notable de calidad.
- Generacion de cuantizaciones personalizadas: el fichero imatrix incluido (0,1 GB) permite a otros usuarios crear sus propias cuantizaciones con la matriz de importancia del autor.
- Prototipado rapido con Ollama o llama.cpp: al estar en formato GGUF, el modelo se integra directamente en herramientas de inferencia local sin conversion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): IQ1_S 3,7 GB; IQ2_M 5,4 GB; IQ3_M 7,0 GB; IQ4_XS 8,2 GB; Q4_K_M 9,1 GB; Q5_K_M 10,6 GB; Q6_K 12,2 GB. Anadir aproximadamente 1-2 GB adicionales para el contexto KV cache segun la longitud de secuencia.
- GPU recomendadas: para Q4_K_M o superiores, RTX 4070 Ti / RTX 4080 (12-16 GB) o A100/H100 en servidor. Para IQ3_M o Q4_K_S, RTX 3060 Ti / RTX 4060 (8 GB) con holgura limitada.
- Cabe en consumer GPU: si, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 (12 GB), RTX 4080 (16 GB), RTX 4090 (24 GB). Las variantes IQ1/IQ2 caben incluso en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo TGI o vLLM (aunque vLLM requiere conversion a otro formato).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aether-15B-i1-GGUF | 14,77B | no disponible | Apache 2.0 | GGUF (25 cuantizaciones) | Afinado para matematicas, codigo, indonesio/japones |
| Qwen3-14B (referencia de familia) | ~14B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base de la misma familia; Aether deriva de Qwen3 |
| Aether-15B (original) | 14,77B | no disponible | Apache 2.0 | safetensors | Pesos en precision completa del que derivan estas cuantizaciones |
| Aether-15B-GGUF (estatico) | 14,77B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base, sin imatrix |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality". No son recomendables para produccion.
- El modelo base esta afinado sobre un dataset especifico (Kai_v3) orientado a matematicas, codigo e idiomas concretos; su rendimiento en otras tareas o idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 15B, sin datos publicados sobre mitigacion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no se especifica en la documentacion; conviene verificarla en el modelo base antes de desplegarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento pueden tener condiciones adicionales que no se detallan en esta ficha.
- El repositorio tiene 0 likes y 2631 descargas en el momento de la consulta, lo que indica una adopcion limitada y poca validacion por parte de la comunidad.
- El tag "region:us" y la fecha de creacion (2026-11-15) deben verificarse; la ficha se basa en los metadatos disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Aether-15B-i1-GGUF
- Modelo base: https://huggingface.co/K-Ai-Official/Aether-15B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Aether-15B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Aether-15B-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/K-Ai-Official/Kai_v3
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
