# mradermacher/SoliDeoGloria-Gemma-4-31B-it-i1-GGUF

## Resumen

SoliDeoGloria-Gemma-4-31B-it-i1-GGUF es una recuantización en formato GGUF del modelo moonshineai/SoliDeoGloria-Gemma-4-31B-it, un ajuste fino sobre la familia Gemma 4 de Google DeepMind. El trabajo de cuantización lo firma mradermacher, autor especializado en publicar versiones optimizadas con imatrix (matriz de importancia) para ejecución local. El modelo base cuenta con 30.697.345.596 parámetros reales (aproximadamente 30,7 B), lo que lo sitúa en la gama de modelos densos de gran tamano orientados a razonamiento y flujos de trabajo agénticos.

Se trata de un modelo multimodal (visión + texto): la model card indica explícitamente que es un "vision model" y que los ficheros mmproj necesarios para procesar imágenes se alojan en el repositorio estático del mismo autor. La licencia declarada es MIT, lo que facilita su uso comercial sin las restricciones habituales de otros pesos abiertos, y el único idioma declarado es el inglés.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar en hardware de consumo un modelo de aproximadamente 31 B con visión, mediante cuantizaciones que van desde IQ1_S/IQ2 hasta Q6_K. Según la información pública recogida sobre Gemma 4 31B, la ventana de contexto alcanzaría los 256 000 tokens, aunque la model card del repositorio no confirma este dato de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (familia Gemma 4, transformer decoder denso según información pública de Google DeepMind) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; 256 000 tokens según la información pública de Gemma 4 31B |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (listados en la tabla del repositorio); el autor enumera además Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones con imatrix); repositorio con fichero imatrix adicional para crear cuantizaciones propias |
| Tamano del repositorio | 44,1 GB (incluye todas las cuantizaciones) |
| Modelo base | moonshineai/SoliDeoGloria-Gemma-4-31B-it |
| Autor de la cuantización | mradermacher |
| Librería | transformers |

## Arquitectura y entrenamiento

La model card de esta recuantización no aporta detalles sobre la arquitectura interna, el dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. El único dato estructural disponible es que se trata de un modelo denso de aproximadamente 31 B parámetros y que es multimodal (visión y texto), ya que el autor lo etiqueta como "vision model" y remite a los ficheros mmproj del repositorio estático. La información pública sobre Gemma 4, publicada por Google DeepMind, describe la familia como "modelos abiertos disenados específicamente para razonamiento avanzado y flujos de trabajo agénticos", sin detallar la composición del dataset.

El ajuste fino concreto que da origen al nombre "SoliDeoGloria" corre a cargo de la cuenta moonshineai y no está documentado en la información proporcionada. La contribución específica de este repositorio es la cuantización: mradermacher aplica cuantizaciones ponderadas con imatrix (un fichero imatrix de 0,1 GB se incluye para que terceros puedan generar sus propias variantes), siguiendo su flujo habitual de publicación en dos repositorios, uno estático y otro con cuantizaciones i1/imatrix.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta "conversational" declarada por el autor.
- Procesamiento de imágenes: el repositorio se identifica como modelo de visión y depende de ficheros mmproj alojados en el repositorio estático del mismo autor.
- Razonamiento avanzado y flujos de trabajo agénticos, según la descripción pública de la familia Gemma 4 de Google DeepMind.
- Soporte de contexto largo (hasta 256 000 tokens según la información pública de Gemma 4 31B), útil para RAG y análisis de documentos extensos.
- Capacidades multilingües: limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos en inglés: con una ventana declarada de hasta 256 000 tokens, el modelo puede ingerir contratos, informes técnicos o expedientes completos sin fragmentación, realizando resúmenes y extracción de entidades sobre el texto íntegro.
- Pipelines de RAG empresarial: combinado con una base vectorial, permite recuperar y sintetizar respuestas sobre corpus internos en inglés, con la ventaja de que la licencia MIT no impone restricciones de uso comercial.
- Procesamiento de documentos escaneados o con imágenes: al ser un modelo multimodal con ficheros mmproj, puede describir gráficos, tablas o capturas y combinar esa información con texto para tareas de digitalización asistida.
- Asistentes conversacionales multi-turno en inglés: el etiquetado "conversational" y el contexto largo permiten mantener hilos extensos sin perder referencias previas, adecuado para atención al cliente técnica o tutoría.
- Inferencia local en estaciones de trabajo: la disponibilidad de cuantizaciones desde IQ1_S/IQ2_K (del orden de 12 GB) hasta Q6_K permite desplegar el modelo en GPU de consumo o incluso en configuraciones con memoria unificada, sin depender de APIs externas.
- Generación de resúmenes de reuniones o transcripciones: con contexto de 256K y entrada de texto, el modelo puede condensar transcripciones extensas en actas estructuradas en inglés.
- Análisis exploratorio de imágenes técnicas: en entornos donde se requiere privacidad, el modelo puede ejecutarse en local para clasificar o describir imágenes sin enviar datos a servicios en la nube.
- Prototipado de agentes: la orientación de Gemma 4 hacia flujos agénticos permite experimentar con cadenas de razonamiento y llamadas a herramientas en inglés, si bien la model card no confirma soporte formal de function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar caché KV):
  - i1-Q2_K: 12,0 GB.
  - i1-IQ3_M: 14,5 GB.
  - i1-Q4_K_S: 17,9 GB.
  - Otras cuantizaciones del listado (Q6_K, Q5_K_M, Q4_K_M, etc.) no tienen tamano especificado en la información proporcionada.
- GPU recomendadas:
  - i1-Q4_K_S (17,9 GB): RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB), siempre con contexto moderado.
  - i1-IQ3_M (14,5 GB): RTX 4080 (16 GB) o RTX 4070 Ti SUPER (16 GB) con contexto reducido.
  - i1-Q2_K (12,0 GB): tarjetas de 16 GB en adelante con mayor holgura; en 12 GB de VRAM queda muy justo y probablemente requiera offload parcial a CPU.
  - Modelo completo sin cuantizar (~30,7 B en bf16, en torno a 61 GB): no cabe en GPU de consumo; requiere A100 80 GB, H100 80 GB o despliegue multi-GPU.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones bajas y medias (IQ3/Q4) sobre RTX 3090/4090 (24 GB) o tarjetas de 16 GB con contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. La integración con vLLM es posible pero limitada para GGUF y no es el formato nativo de ese servidor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/SoliDeoGloria-Gemma-4-31B-it-i1-GGUF (este) | ~30,7 B | 256K (según información pública de Gemma 4 31B) | GGUF imatrix | MIT | HuggingFace, descargas 0, likes 0 |
| moonshineai/SoliDeoGloria-Gemma-4-31B-it (base) | ~30,7 B | no disponible | safetensors (transformers) | no disponible | HuggingFace |
| mradermacher/SoliDeoGloria-Gemma-4-31B-it-GGUF (cuantización estática) | ~30,7 B | no disponible | GGUF estático + mmproj | MIT | HuggingFace |
| mradermacher/gemma-4-31B-i1-GGUF (Gemma 4 31B sin ajuste) | ~31 B | no disponible | GGUF imatrix | no disponible | HuggingFace |
| mradermacher/gemma-4-31b-it-heretic-ara-i1-GGUF | ~31 B | no disponible | GGUF imatrix | no disponible | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés. El rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Visión dependiente de ficheros externos: para usar las capacidades multimodales hay que descargar los ficheros mmproj desde el repositorio estático del autor, no desde este repositorio i1.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, por lo que la calidad real del ajuste fino "SoliDeoGloria" no puede evaluarse con datos objetivos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; debe mitigarse con verificación y, en su caso, con RAG.
- Perdida por cuantización: las variantes de baja precisión (IQ1, IQ2, Q2) degradan la calidad respecto a los pesos completos. El autor recomienda explícitamente i1-IQ3_XXS frente a i1-Q2_K y sugiere i1-Q4_K_S como punto óptimo entre tamano, velocidad y calidad.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento ni sobre procesos de alineación, por lo que no se pueden caracterizar los sesgos del modelo.
- Licencia: MIT, sin restricciones declaradas para uso comercial, pero conviene verificar la licencia del modelo base moonshineai/SoliDeoGloria-Gemma-4-31B-it y de Gemma 4, que puede imponer condiciones adicionales (Gemma suele publicarse con su propia licencia de uso).
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Contexto largo y VRAM: aunque el contexto nominal sea de 256K tokens, la caché KV a esa longitud exige mucha memoria adicional; en GPU de consumo habrá que reducir drásticamente la ventana efectiva.
- Soporte de tool calling y agentes no confirmado en la documentación del repositorio.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/SoliDeoGloria-Gemma-4-31B-it-i1-GGUF
- Repositorio estático (cuantizaciones estáticas y ficheros mmproj): https://huggingface.co/mradermacher/SoliDeoGloria-Gemma-4-31B-it-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#SoliDeoGloria-Gemma-4-31B-it-i1-GGUF
- Modelo base: https://huggingface.co/moonshineai/SoliDeoGloria-Gemma-4-31B-it
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Referencia sobre uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 31B: https://gemma4.dev/models/gemma-4-31b
- Recurso relacionado, Gemma 4 31B i1-GGUF (sin ajuste SoliDeoGloria): https://huggingface.co/mradermacher/gemma-4-31B-i1-GGUF
- Recurso relacionado, variante heretic-ara: https://huggingface.co/mradermacher/gemma-4-31b-it-heretic-ara-i1-GGUF
