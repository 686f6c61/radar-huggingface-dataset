# mradermacher/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-i1-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-i1-GGUF es una cuantización GGUF en formato i1 (imatrix) realizada por mradermacher sobre el modelo Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated, que a su vez es una destilación de MiMo-V2.6 sobre una base Qwen de 9B. El modelo combina capacidades multimodales (vision), tool-use, razonamiento agéntico, código y ciberseguridad, y ha sido sometido a un proceso de "abliteration" mediante arbitrary-rank ablation (ARA) y técnicas tipo heretic para eliminar los mecanismos de rechazo (refusal-removed), lo que da lugar a una variante descensurada (uncensored/decensored).

El resultado es un modelo de 8.953.803.264 parámetros (aproximadamente 9B) que conserva las capacidades del modelo base pero sin las restricciones de alineamiento habituales. Está pensado para desarrolladores e investigadores que necesitan un modelo local con ventana de contexto larga, soporte de tool calling y visión, sin las limitaciones de rechazo de los modelos alineados convencionales.

Esta ficha describe la versión cuantizada i1-GGUF, que ofrece un abanico muy amplio de cuantizaciones (desde IQ1_S de 2,8 GB hasta Q6_K de aproximadamente 7,4 GB) y archivos imatrix para generar cuantizaciones propias. La licencia es Apache 2.0 y el idioma declarado es inglés. El repositorio ocupa 110,2 GB en total por la multiplicidad de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (destilación de MiMo-V2.6 sobre base Qwen 9B; multimodal con visión) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiquetado como long-context, sin cifra concreta) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K (i1/imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (i1/imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer multimodal derivado de una destilación de MiMo-V2.6 sobre una base Qwen de 9B (etiquetada como qwen3.5). El modelo incorpora capacidades de visión (etiqueta vision, multimodal) y se distribuye con archivos mmproj en el repositorio estático para el procesamiento de imágenes. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica destacable es el proceso de "abliteration": el modelo base Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated aplica arbitrary-rank ablation (ARA) junto con técnicas tipo heretic para eliminar los comportamientos de rechazo, dando como resultado una variante descensurada. Las cuantizaciones de esta ficha son de tipo i1 (imatrix), generadas con un archivo imatrix incluido en el repositorio, lo que suele ofrecer mejor calidad que las cuantizaciones estáticas equivalentes en tamaño. Existe además un repositorio de cuantizaciones estáticas del mismo autor.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento agéntico y multi-step reasoning (etiqueta agentic).
- Tool calling y function calling (etiqueta tool-use).
- Generación de código (etiqueta code).
- Conocimientos orientados a ciberseguridad (etiqueta cybersecurity).
- Procesamiento de visión e imágenes (modelo multimodal; mmproj en el repo estático).
- Ventana de contexto larga (etiqueta long-context; cifra no disponible).
- Comportamiento descensurado: mecanismos de rechazo eliminados mediante ARA/heretic.
- Capacidades multilingües limitadas al inglés según la metadata (en).
- Compatible con endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en entornos de desarrollo para autocompletar, explicar y refactorizar código, aprovechando su capacidad de tool calling para consultar documentación o ejecutar comandos en pipelines de CI/CD.
- Automatización agéntica de tareas: gracias a su orientación agentic y tool-use, puede orquestar flujos de varios pasos que requieran llamadas a APIs externas, lectura de archivos y razonamiento encadenado.
- Análisis de imágenes en local: al ser multimodal, permite describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas sin enviar datos a servicios en la nube, útil en entornos con requisitos de privacidad.
- Investigación en seguridad ofensiva y defensiva: su orientación a ciberseguridad y la ausencia de rechazos lo hacen adecuado para análisis de vulnerabilidades, revisión de configuraciones y formación en entornos controlados.
- Procesamiento de documentos largos: la ventana de contexto larga permite resumir, extraer información y responder preguntas sobre contratos, informes o transcripciones extensas.
- Evaluación de alineamiento y robustez: investigadores pueden usar la variante abliterated como contrapunto a modelos alineados para estudiar diferencias de comportamiento, sesgos y mecanismos de rechazo.
- Despliegue en hardware de consumo: las cuantizaciones pequeñas (IQ2/IQ3) permiten ejecutar el modelo en GPUs consumer con 8-12 GB de VRAM para prototipado y pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - IQ1_S (2,8 GB): aproximadamente 3-4 GB de VRAM.
  - IQ2_M (3,7 GB): aproximadamente 4-5 GB de VRAM.
  - IQ3_M (4,5 GB): aproximadamente 5-6 GB de VRAM.
  - Q4_K_S / IQ4_XS (5,3-5,5 GB): aproximadamente 6-7 GB de VRAM.
  - Q5_K_M (aproximadamente 6,5 GB): aproximadamente 7-8 GB de VRAM.
  - Q6_K (aproximadamente 7,4 GB): aproximadamente 8-9 GB de VRAM.
  - Nota: los cálculos de VRAM son estimaciones a partir del tamaño del archivo; para visión hay que sumar el mmproj del repositorio estático.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100/H100 no son necesarias para un modelo de 9B, pero permiten mayor throughput en serving.
- Cabe en GPU consumer: sí, desde cuantizaciones IQ1/IQ2 en GPUs de 6-8 GB hasta Q6_K en GPUs de 10-12 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; para el modelo base en safetensors, vLLM o TGI (no confirmado para esta variante GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-i1-GGUF (este) | 8,95B | no disponible (long-context) | Apache 2.0 | GGUF i1 | Multimodal, agéntico, descensurado |
| Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated | 8,95B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-GGUF | 8,95B | no disponible | Apache 2.0 | GGUF estático | Cuantizaciones estáticas del mismo autor |
| Qwen3 8B (referencia de familia base) | aproximadamente 8B | no disponible | no disponible | safetensors/GGUF | Modelo alineado convencional; comparación no verificada en la información disponible |

## Limitaciones y advertencias

- Modelo descensurado: los mecanismos de rechazo han sido eliminados mediante abliteration, por lo que puede generar contenido dañino, ofensivo o NSFW; no es apto para uso sin supervisión en producción orientada al público general.
- Sesgos conocidos: no documentados en la información disponible; al derivar de una base Qwen y de un proceso de ablación, los sesgos pueden diferir de los del modelo original.
- Riesgo de alucinación: inherente a los modelos de 9B; no se han publicado evaluaciones de fiabilidad.
- Limitaciones de idioma: la metadata declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Limitaciones de contexto: aunque se etiqueta como long-context, no se especifica la longitud exacta soportada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas si se emplea en contextos sensibles; la responsabilidad recae en el desplegador.
- Cuantizaciones muy bajas (IQ1, IQ2, Q2_K): degradación notable de calidad; los propios archivos se etiquetan como "for the desperate" o "very low quality".
- El repositorio ocupa 110,2 GB; conviene descargar solo la cuantización necesaria.
- No se han publicado benchmarks que permitan validar el rendimiento real frente a alternativas.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-GGUF
- Modelo base: https://huggingface.co/Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
