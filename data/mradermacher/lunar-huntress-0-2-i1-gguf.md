# mradermacher/Lunar-Huntress-0.2-i1-GGUF

## Resumen

Lunar-Huntress-0.2-i1-GGUF es la distribución en formato GGUF del modelo Lunar-Huntress-0.2, publicada por el usuario mradermacher. El modelo original, alojado en Husky110/Lunar-Huntress-0.2, es un merge de modelos de la familia Gemma (la etiqueta "gemma4" sugiere una base Gemma de cuarta generación) realizado con mergekit mediante la técnica TIES. Con 30.697.345.596 parámetros (~30,7 mil millones), está orientado a roleplay, companion y escritura creativa, incluyendo contenido para adultos (NSFW).

La relevancia de esta ficha radica en que el repositorio cuantizado facilita la ejecución local de un modelo de ~31B en hardware de consumo mediante cuantizaciones agresivas (desde IQ1_S de 7,3 GB hasta Q6_K de 25,3 GB). La model card indica además que se trata de un modelo de visión, con posibles ficheros mmproj en el repositorio estático. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada. La model card del cuantizador es puramente técnica (tabla de cuantizaciones) y no incluye detalles sobre el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos de la familia Gemma; técnica TIES con mergekit) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (variantes i1 con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un merge construido con mergekit aplicando la técnica TIES (Trim, Elect Sign, Merge), que combina los pesos de varios modelos de la familia Gemma para fusionar capacidades sin necesidad de reentrenamiento. La etiqueta "gemma4" en el repositorio apunta a una base de la cuarta generación de Gemma, aunque no se detalla qué modelos concretos se fusionaron ni los hiperparámetros del merge.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones técnicas específicas más allá del propio merge. El cuantizador ha generado las versiones GGUF con calibración imatrix, lo que mejora la calidad de las cuantizaciones de baja precisión (especialmente las de la familia IQ) respecto a las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto orientada a roleplay, companion y escritura creativa.
- Contenido para adultos (NSFW), etiquetado explícitamente como "not-for-all-audiences".
- Capacidades de visión: la model card indica que es un modelo de visión, con posibles ficheros mmproj en el repositorio estático.
- Conversación multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay conversacional local: el modelo está afinado para mantener personajes y narrativa en conversaciones multi-turno; sus cuantizaciones de 17-22 GB (Q4_K_M, Q5_K_M) permiten ejecutarlo en GPU de consumo con 24 GB de VRAM.
- Escritura creativa asistida: generación de ficción, diálogos y narrativa larga en inglés, aprovechando el merge de modelos orientados a prosa creativa.
- Desarrollo de personajes y companion bots: integración en aplicaciones de chat con personalidad persistente, usando el formato GGUF con llama.cpp u Ollama.
- Prototipado de experiencias interactivas para adultos: dado el etiquetado NSFW explícito, adecuado para entornos controlados y con verificación de edad, desplegado en local para evitar dependencias de API externas.
- Investigación sobre merges de modelos: el modelo sirve como caso de estudio de la técnica TIES aplicada a la familia Gemma, comparando el comportamiento del merge frente a los modelos originales.
- Pruebas de cuantización extrema: las variantes IQ1/IQ2 (7-11 GB) permiten evaluar la degradación de calidad en hardware muy limitado, útil para estudiar el equilibrio tamaño/calidad en modelos de ~31B.
- Inferencia con visión (si se dispone del mmproj): tareas de descripción de imágenes combinadas con generación de texto creativo, aunque la documentación no detalla el alcance de esta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - i1-IQ1_S (7,3 GB): ~9-10 GB de VRAM.
  - i1-IQ2_M (11,0 GB): ~13 GB de VRAM.
  - i1-IQ3_M (14,5 GB): ~17 GB de VRAM.
  - i1-Q4_K_M (18,8 GB): ~22 GB de VRAM.
  - i1-Q5_K_M (21,9 GB): ~25 GB de VRAM.
  - i1-Q6_K (25,3 GB): ~29 GB de VRAM.
- GPU recomendadas:
  - RTX 4090 (24 GB): IQ4_XS, Q4_K_S, Q4_K_M y Q5_K_S con contexto moderado.
  - RTX 3090 / 4080 (16-24 GB): IQ3_M a Q4_K_M.
  - A100 40/80 GB, H100: cuantizaciones Q5/Q6 con contexto largo y mayor throughput.
  - Consumer de gama media (8-12 GB): solo IQ1/IQ2 con contexto reducido y calidad degradada.
- Cabe en GPU de consumo: sí, desde tarjetas de 12 GB con cuantizaciones IQ2 y en 24 GB con Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lunar-Huntress-0.2-i1-GGUF | ~30,7B | no disponible | Apache 2.0 | GGUF (i1) | Merge TIES de Gemma, roleplay/NSFW |
| Lunar-Huntress-0.2 (base) | ~30,7B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Lunar-Huntress-0.2-GGUF (estático) | ~30,7B | no disponible | Apache 2.0 | GGUF (estático) | Misma base, cuantizaciones sin imatrix; incluye mmproj de visión |

No se dispone de datos de rendimiento ni de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está diseñado para contenido para adultos; requiere control de acceso y verificación de edad en cualquier despliegue público.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Sesgos: al ser un merge de modelos Gemma, hereda los sesgos de sus componentes; no se documentan evaluaciones de sesgo.
- Alucinación: sin benchmarks ni evaluaciones publicadas, el riesgo de alucinación no está cuantificado.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar aplicaciones con ventanas largas.
- Calidad en cuantizaciones bajas: las variantes IQ1 e IQ2 degradan notablemente la calidad (la propia model card las describe como "for the desperate").
- Visión: la capacidad de visión depende de disponer de los ficheros mmproj del repositorio estático; no se detalla su funcionamiento.
- Licencia Apache 2.0: permite uso comercial, pero la naturaleza del contenido generado puede requerir cumplimiento normativo adicional según la jurisdicción.
- Producción: sin datos de benchmarks, contexto ni estabilidad, no se recomienda para aplicaciones críticas sin evaluación previa.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/Lunar-Huntress-0.2-i1-GGUF
- Modelo base: https://huggingface.co/Husky110/Lunar-Huntress-0.2
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Lunar-Huntress-0.2-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Lunar-Huntress-0.2-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
