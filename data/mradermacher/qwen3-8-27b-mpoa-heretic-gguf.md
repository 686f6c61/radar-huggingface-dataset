# mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF

## Resumen

Qwen3.8-27B-MPOA-heretic-GGUF es la distribucion en formato GGUF de un modelo de lenguaje de gran tamano derivado de la familia Qwen3, publicado por el usuario mradermacher. El modelo subyacente, richardyoung/Qwen3.8-27B-MPOA-heretic, es una variante "heretic" (tambien etiquetada como uncensored, decensored y abliterated) del modelo base, lo que significa que se ha sometido a un proceso de eliminacion de rechazos (refusal removal) para reducir las respuestas de negativa ante peticiones sensibles. El autor original es Richard J. Young, Ph.D., y el modelo se distribuye bajo acceso restringido (gated) en su repositorio de origen, con el objetivo declarado de servir a la investigacion en seguridad de IA.

El repositorio aqui descrito contiene unicamente los pesos cuantizados estaticamente a formato GGUF, con un total de 26.895.998.464 parametros (aproximadamente 26,9 mil millones). Incluye un conjunto amplio de cuantizaciones que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), ademas de suplementos multimodales mmproj, lo que sugiere capacidades de vision en el modelo base. El repositorio ocupa 187,9 GB en total y acumula 1.692 descargas.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizacion, algo imposible con los pesos completos en precision nativa. No obstante, debe subrayarse que se trata de un modelo con salvaguardas eliminadas, lo que lo hace inadecuado para despliegues de produccion orientados al publico general sin capas adicionales de moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3; no se detalla en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. Por la nomenclatura (Qwen3.8-27B) se infiere que deriva de la familia Qwen3 de Alibaba, pero no se especifica si emplea attention lineal, decodificacion especulativa ni otros mecanismos. El tamano de parametros (~26,9B) es consistente con un transformer denso de escala media-grande, aunque no se confirma en la documentacion disponible.

Respecto al entrenamiento, la model card del repositorio GGUF no describe el dataset, el numero de tokens ni las etapas de alineacion. Lo unico relevante es que el modelo ha pasado por un proceso de "abliteration" o eliminacion de rechazos, una tecnica que modifica los pesos para suprimir el comportamiento de negativa aprendido durante el ajuste por preferencias. El autor original declara que el modelo se libera para investigacion en seguridad de IA, lo que sugiere que el proceso de ablacion fue el objeto de estudio. No se dispone de informacion sobre RLHF, DPO ni datos de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline de tipo conversacional segun las etiquetas del repositorio.
- Capacidades multimodales: la presencia de archivos mmproj (Q8_0 y f16) indica soporte de entrada de imagenes o vision, aunque no se detalla su alcance.
- Comportamiento "uncensored" / "decensored": el modelo ha sido modificado para reducir las negativas ante peticiones que un modelo alineado rechazaria.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con infraestructuras de inferencia estandar.
- Reproducibilidad: etiquetado como reproducible, indicando que el proceso de cuantizacion es documentado y repetible.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language.

## Casos de uso

- Investigacion en seguridad de IA y red-teaming: el modelo esta disenado explicitamente para estudiar el comportamiento de modelos sin salvaguardas, permitiendo a investigadores analizar como responde ante peticiones adversarias y evaluar la eficacia de las tecnicas de ablacion.
- Evaluacion de robustez de filtros de moderacion: al generar contenido que un modelo alineado rechazaria, sirve para probar sistemas de clasificacion y filtrado en pipelines de produccion.
- Experimentacion personal en hardware de consumo: las cuantizaciones Q4_K_M (16,6 GB) y Q4_K_S (15,7 GB) permiten ejecutar el modelo en GPUs de 24 GB o en configuraciones con RAM del sistema, facilitando pruebas locales sin infraestructura de datacenter.
- Analisis de sesgos y comportamiento en dominios sensibles: util para estudiar como un modelo sin rechazos maneja temas delicados y que sesgos emergen cuando se eliminan las capas de alineacion.
- Docencia y cursos sobre alineacion de modelos: permite ilustrar de forma practica que ocurre cuando se suprime el comportamiento de rechazo y discutir las implicaciones eticas.
- Investigacion sobre cuantizacion: la disponibilidad de 11 niveles de cuantizacion (de Q2_K a Q8_0) permite estudiar la degradacion de calidad y el impacto en el comportamiento del modelo segun la precision, comparando respuestas entre variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,8 GB
  - Q3_K_S: ~12,2 GB
  - Q3_K_M: ~13,4 GB
  - Q3_K_L: ~14,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_S: ~15,7 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_S: ~18,8 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
- GPU recomendadas: para Q4_K_M y superiores, GPUs con 24 GB o mas (RTX 3090, RTX 4090, A10G, L4). Para Q8_0 se recomienda A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q4_K_M; en GPUs de 16 GB cabe Q2_K o Q3_K_S con contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en transformers se requiere vLLM o TGI, no aplicable directamente a estos pesos.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MPOA-heretic-GGUF (este) | ~26,9B | no disponible | apache-2.0 | GGUF | Variante sin rechazos, acceso al base restringido |
| Qwen3-32B (referencia de familia) | ~32B | no disponible | apache-2.0 | safetensors, GGUF | Modelo alineado de la misma familia, con salvaguardas |
| Modelos "abliterated" de ~27B (genericos) | ~27B | no disponible | variable | GGUF | Misma tecnica de eliminacion de rechazos; comparacion no disponible con datos |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. La comparacion con Qwen3-32B se ofrece solo como referencia de categoria y familia, no como evaluacion empirica.

## Limitaciones y advertencias

- Modelo sin salvaguardas: la eliminacion de rechazos implica que puede generar contenido danino, ofensivo o ilegal. No es apto para produccion orientada al publico sin moderacion adicional.
- Acceso restringido en origen: el modelo base en Hugging Face requiere solicitud manual con campos de afiliacion y uso previsto; el repositorio GGUF replica la licencia apache-2.0 pero el autor original impone condiciones de acceso.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo LLM, es propenso a inventar datos, especialmente en cuantizaciones bajas (Q2_K, Q3_K).
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S pueden degradar notablemente la coherencia y el razonamiento; el autor recomienda Q4_K_S y Q4_K_M como equilibrio calidad/velocidad.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Licencia: apache-2.0 permite uso comercial, pero las condiciones de acceso del autor original y la naturaleza del modelo (sin rechazos) pueden generar responsabilidad legal segun la jurisdiccion.
- Sin benchmarks: no hay datos publicos de MMLU, HumanEval u otros, por lo que no se puede evaluar su calidad objetiva frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-MPOA-heretic-GGUF
- CV del autor original: https://cv.deepneuro.ai
- Perfil del autor original: https://huggingface.co/richardyoung
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
