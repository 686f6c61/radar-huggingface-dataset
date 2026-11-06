# mradermacher/magibu-11b-GGUF

## Resumen

magibu-11b-GGUF es la version cuantizada en formato GGUF del modelo magibu-11b, desarrollado originalmente por alibayram y publicado en Hugging Face. Esta variante ha sido generada por mradermacher, un conocido creador de cuantizaciones de la comunidad, que distribuye versiones optimizadas para inferencia local mediante llama.cpp y herramientas compatibles. El modelo base cuenta con 11.262.717.696 parametros (aproximadamente 11,26 mil millones) y fue entrenado mediante SFT (supervised fine-tuning) usando las librerias unsloth y TRL, partiendo de un modelo base no especificado en la informacion disponible.

El modelo se presenta como un modelo conversacional orientado al idioma ingles, segun los tags de la model card. La relevancia de esta publicacion radica en que permite ejecutar un modelo de 11B parametros en hardware de consumo gracias a las multiples cuantizaciones disponibles, que van desde Q2_K (4,5 GB) hasta Q8_0 (12,1 GB), pasando por opciones intermedias como Q4_K_M (7,0 GB) o IQ4_XS (6,3 GB). Ademas, el repositorio incluye ficheros mmproj (multi-modal supplement), lo que sugiere capacidades de vision, aunque la model card no detalla su funcionamiento.

No se dispone de informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento, la licencia ni los resultados de benchmarks, lo que limita la evaluacion rigurosa del modelo. La fecha de creacion del repositorio (2026-02-14) y su actualizacion (2026-11-05) indican que se trata de una publicacion reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers, segun tags) |
| Parametros totales | 11.262.717.696 (11,26B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base alibayram/magibu-11b. Los tags indican que se trata de un modelo de tipo transformers generado mediante `generated_from_trainer`, entrenado con `unsloth` y `trl` mediante SFT (supervised fine-tuning). No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO posteriores al SFT.

La cuantizacion ha sido realizada por mradermacher en formato GGUF estatico (quantize_version 2, output_tensor_quantised 1), con ficheros separados para el proyector multimodal (mmproj) en precisiones Q8_0 y f16. El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (magibu-11b-i1-GGUF), lo que sugiere que esta version contiene cuantizaciones estaticas sin imatrix. No se han documentado innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun los tags `conversational` y el pipeline declarado.
- Fine-tuning supervisado (SFT) orientado a instrucciones, segun los tags `sft` y `generated_from_trainer`.
- Soporte multimodal probable: el repositorio incluye ficheros `mmproj` (multi-modal supplement), lo que indica capacidad de procesamiento de imagenes, aunque no se detalla en la model card.
- Compatibilidad con endpoints (`endpoints_compatible` segun tags), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- No se documentan capacidades especificas de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).
- Capacidades multilingues limitadas al ingles segun el campo `language`.

## Casos de uso

- Inferencia local en hardware de consumo: con la cuantizacion Q4_K_M (7,0 GB) el modelo puede ejecutarse en GPUs con 8 GB de VRAM o en CPU con suficiente RAM, lo que permite prototipado y pruebas sin infraestructura cloud.
- Despliegue en entornos con restricciones de red: al ser un modelo GGUF autoconenido, puede distribuirse en entornos air-gapped y ejecutarse con llama.cpp u Ollama sin dependencias externas.
- Asistentes conversacionales en ingles: el modelo esta afinado mediante SFT para tareas de instruccion, lo que lo hace adecuado para chatbots de proposito general en aplicaciones de habla inglesa.
- Procesamiento de documentos con componente visual: los ficheros mmproj permiten, en principio, tareas de comprension de imagenes combinadas con texto, util para extraccion de informacion de capturas o formularios (requiere verificacion empirica).
- Fine-tuning adicional sobre la base: al estar disponible el modelo base en safetensors, se puede partir de el para tareas especificas y luego cuantizar a GGUF para despliegue en produccion ligera.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir el impacto de la precision en la calidad de salida para un caso de uso concreto antes de fijar una version en produccion.
- Educacion e investigacion: util como caso de estudio de pipeline completo (base -> SFT con unsloth -> cuantizacion GGUF) para quienes aprenden el ciclo de vida de un modelo open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~4,5 GB de pesos; con overhead de contexto, ~5-6 GB.
  - Q4_K_M (recomendada por el autor): ~7,0 GB de pesos; ~8-9 GB con contexto moderado.
  - Q8_0: ~12,1 GB de pesos; ~13-14 GB con contexto.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 (24 GB) para Q8_0 con contexto amplio; A100/H100 para despliegues concurrentes con vLLM (aunque vLLM requiere pesos no GGUF o conversion especifica).
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con las cuantizaciones Q4 y Q5; las Q2 y Q3 caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers, TGI o vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| magibu-11b-GGUF | 11,26B | no disponible | no disponible | GGUF | Cuantizaciones estaticas, mmproj incluido |
| Modelo base alibayram/magibu-11b | 11,26B | no disponible | no disponible | safetensors | Origen de las cuantizaciones |
| magibu-11b-i1-GGUF (mismo autor) | 11,26B | no disponible | no disponible | GGUF | Cuantizaciones imatrix, mayor calidad |

No se dispone de informacion suficiente para comparar con modelos de otros autores de la misma categoria (11B, conversacional, ingles) en terminos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Riesgo de alucinacion: inherente a los modelos de lenguaje afinados mediante SFT sin fases documentadas de RLHF/DPO; no hay datos sobre mitigaciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Capacidades multimodales no verificadas: la presencia de ficheros mmproj sugiere vision, pero la model card no describe su funcionamiento ni su calidad.
- Cuantizaciones de baja precision (Q2_K, Q3_K_S): el propio autor advierte que Q3_K_M es de "lower quality"; para produccion se recomienda Q4_K_M o superior.
- Sin benchmarks publicados: no es posible comparar su rendimiento con alternativas de forma objetiva.
- Modelo de nicho con pocas descargas (203) y likes (1): comunidad reducida, menor probabilidad de soporte o correccion de errores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/magibu-11b-GGUF
- Modelo base: https://huggingface.co/alibayram/magibu-11b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/magibu-11b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#magibu-11b-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
