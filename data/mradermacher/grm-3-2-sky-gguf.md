# mradermacher/GRM-3.2-Sky-GGUF

## Resumen

GRM-3.2-Sky-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo OrionLLM/GRM-3.2-Sky, publicadas por el usuario mradermacher, conocido en el ecosistema por distribuir versiones cuantizadas de modelos abiertos listas para su uso con llama.cpp y herramientas compatibles. El modelo base cuenta con 34.660.610.688 parámetros (aproximadamente 34,7 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta publicación radica en que pone a disposición de la comunidad un conjunto amplio de cuantizaciones (desde Q2_K hasta Q8_0, además de variantes IQ4_XS y ficheros mmproj para capacidades multimodales) que permiten ejecutar un modelo de gran tamano en hardware de consumo. El repositorio ocupa 238,6 GB en total e incluye 12 ficheros GGUF más dos suplementos multimodales.

No se dispone de información detallada sobre la arquitectura interna, el contexto máximo ni los datos de entrenamiento del modelo base en la documentación proporcionada; la model card se limita a describir los ficheros de cuantización y su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base OrionLLM/GRM-3.2-Sky en la documentación disponible. El dato objetivo es el numero de parámetros (34.660.610.688), que sitúa al modelo en la categoria de ~35B, un tamano habitual en transformers densos de gran escala. La presencia de ficheros `mmproj` (multi-modal projection) en el repositorio indica que el modelo base incorpora capacidades multimodales, presumiblemente vision-lenguaje, aunque no se detalla el codificador visual ni la composición del dataset de entrenamiento.

Tampoco se especifican el numero de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio cuantizado se limita a indicar que se trata de cuantizaciones estáticas del modelo original y remite a la pagina del modelo base para más detalles.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y la categoria `text-generation` en transformers confirman su uso para diálogo multi-turno.
- Capacidades multimodales: la presencia de ficheros `mmproj` sugiere soporte de entrada de imagenes junto a texto, aunque no se detalla la naturaleza exacta (vision, audio u otra modalidad).
- Idiomas: la model card declara únicamente inglés (`en`); no hay evidencia de soporte multilingüe.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia compatible con la API de Hugging Face.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo de ~35B en estaciones de trabajo: con la cuantización Q4_K_M (21,3 GB) el modelo cabe en GPUs de consumo con 24 GB de VRAM, como la RTX 4090, permitiendo prototipado y desarrollo sin depender de la nube.
- Servicio de chat conversacional autoalojado: la variante Q5_K_M o Q6_K ofrece un equilibrio razonable calidad/tamano para servir conversaciones multi-turno en inglés mediante llama.cpp o servidores compatibles con la API de OpenAI.
- Procesamiento de documentos con componente visual: los ficheros mmproj permiten alimentar imagenes al modelo junto con texto, habilitando tareas de descripción de imagenes o extracción de información de capturas y documentos escaneados.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 11 variantes de pesos, lo que facilita estudios de degradación de calidad frente a tamano (de 13,0 GB en Q2_K a 37,0 GB en Q8_0) en pipelines de investigación.
- Integración en aplicaciones de escritorio offline: al ser GGUF, puede embeberse en herramientas tipo Ollama o LM Studio para asistentes locales sin conexión, con la cuantización IQ4_XS (19,0 GB) como opción de compromiso.
- Fine-tuning y experimentación: la licencia Apache 2.0 y la disponibilidad de pesos en transformers permiten adaptar el modelo base a dominios específicos y posteriormente cuantizar los resultados con el mismo flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~13,0 GB
  - Q3_K_M: ~16,9 GB
  - IQ4_XS: ~19,0 GB
  - Q4_K_M: ~21,3 GB
  - Q5_K_M: ~24,8 GB
  - Q6_K: ~28,6 GB
  - Q8_0: ~37,0 GB
  - Suplemento multimodal: 0,7 GB (mmproj Q8_0) o 1,0 GB (mmproj f16), adicional a los pesos.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M e IQ4_XS con margen ajustado; Q5_K_M requiere gestión cuidadosa de la caché KV.
  - RTX 3090 (24 GB): mismas opciones que la 4090 con menor throughput.
  - A100 40 GB / H100 80 GB: Q8_0 y Q6_K con contexto amplio y mayor paralelismo.
  - Multi-GPU consumer: necesaria para Q6_K y Q8_0 si se quiere contexto largo.
- Cabe en GPU de consumo: sí, hasta Q4_K_M en 24 GB; Q5_K_M en adelante requiere 32 GB o reparto entre GPUs.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, servidores compatibles con la API de OpenAI basados en llama.cpp; el modelo base puede servirse con vLLM o TGI si se usan los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GRM-3.2-Sky (esta ficha) | ~34,7 B | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal (mmproj), solo inglés declarado |
| Alternativas de ~30-35B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria; los datos de rendimiento, contexto y capacidades de modelos competidores no están incluidos en la documentación consultada.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos: no se documentan evaluaciones de sesgo ni medidas de mitigación en la información disponible.
- Alucinación: no hay datos publicados sobre tasas de alucinación ni sobre el proceso de alineación del modelo base.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar cargas de trabajo con documentos largos sin pruebas previas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Overhead de contexto: las cifras de VRAM indicadas solo cubren los pesos; la caché KV para contextos largos incrementa el consumo de forma significativa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base OrionLLM/GRM-3.2-Sky, ya que el repositorio cuantizado hereda sus términos.
- Mantenimiento: se trata de una cuantización de terceros; actualizaciones o correcciones dependen del autor del repositorio, no del desarrollador original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GRM-3.2-Sky-GGUF
- Modelo base: https://huggingface.co/OrionLLM/GRM-3.2-Sky
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/GRM-3.2-Sky-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#GRM-3.2-Sky-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
