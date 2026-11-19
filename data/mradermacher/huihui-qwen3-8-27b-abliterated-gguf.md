# mradermacher/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es la version cuantizada en formato GGUF del modelo Huihui-Qwen3.8-27B-abliterated, publicado por el usuario mradermacher. El modelo original procede de huihui-ai y se construye sobre la familia Qwen3, en concreto sobre una variante de aproximadamente 27.320 millones de parametros (27.320.697.856 segun los pesos safetensors del repositorio). La particularidad del modelo es que ha sido sometido a un proceso de "abliteration", una tecnica de modificacion de pesos que busca eliminar o reducir el comportamiento de rechazo (refusal) aprendido durante el alineamiento, dando lugar a un modelo marcado como "uncensored".

El repositorio de mradermacher no entrena ni modifica la arquitectura: su funcion es generar cuantizaciones estaticas del modelo base para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.). Se ofrecen desde cuantizaciones agresivas de 2 bits (Q2_K, 11,0 GB) hasta Q8_0 (29,1 GB), pasando por las recomendadas Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB). Ademas, se incluyen dos ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base incorpora capacidad multimodal de vision.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de ~27B con comportamiento conversacional y supuestamente sin filtros de rechazo, en un rango de VRAM que va de 12 a 32 GB segun la cuantizacion. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque con las cautelas propias de un modelo "abliterated".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3; el repositorio solo indica transformers/GGUF) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun metadatos; el modelo base Qwen3 suele ser multilingue, pero no se documenta aqui) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo deriva de la familia Qwen3 (Alibaba), y el nombre "Qwen3.8-27B" sugiere una variante de ~27B parametros de dicha familia, pero el repositorio de cuantizacion no documenta numero de capas, dimension del hidden state, tipo de atencion ni si se trata de un transformer denso o de una mezcla de expertos. Tampoco se detallan los datos de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable de este artefacto concreto es el proceso de abliteration aplicado por huihui-ai sobre el modelo base Qwen3, que modifica las direcciones de activacion asociadas al rechazo para reducir la probabilidad de respuestas negativas del modelo. Sobre esa variante, mradermacher aplica cuantizacion estatica (convert_type: hf, quantize_version: 2) y genera los ficheros GGUF, incluyendo los proyectores multimodales mmproj para el soporte de vision. No se documenta decodificacion especulativa, atencion linear ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta "conversational" en los metadatos del repositorio.
- Comportamiento "uncensored"/"abliterated": el alineamiento de rechazo ha sido atenuado, de modo que el modelo responde con menor frecuencia con negativas a peticiones que el modelo original rechazaria.
- Capacidad multimodal de vision: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que permite procesar imagenes junto a texto en clientes compatibles con llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking": no disponible en la informacion proporcionada (aunque algunas variantes Qwen3 lo incorporan, no se confirma aqui).
- Capacidades multilingues: los metadatos solo declaran "en"; no se confirma soporte de otros idiomas.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (16,9 GB) el modelo puede ejecutarse en una GPU consumer de 24 GB (RTX 3090/4090) o en configuraciones CPU+GPU mixtas, permitiendo inferencia privada sin enviar datos a la nube.
- Generacion creativa sin filtros: para proyectos de escritura, guiones o roleplay donde se requiere que el modelo no rechace tematicas adultas o controvertidas, gracias al proceso de abliteration aplicado al modelo base.
- Analisis de documentos e imagenes: el fichero mmproj permite combinar texto e imagen, util para extraer informacion de capturas, diagramas o documentos escaneados en herramientas compatibles con llama.cpp.
- Prototipado de asistentes conversacionales: el modelo puede gestionar dialogos multi-turno con contexto amplio (longitud exacta no documentada), adecuado para pruebas de producto antes de escalar a modelos mayores.
- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso de estudio para analizar como la abliteration afecta la tasa de rechazo, la calidad de respuesta y los sesgos residuales en comparacion con el Qwen3 original.
- Fine-tuning y experimentacion con LoRA: al estar disponible en GGUF y con el modelo base en safetensors, es posible partir de este para experimentos de adaptacion en entornos con recursos limitados, usando cuantizaciones Q5_K_M o Q6_K cuando la calidad importa.
- Servicio de inferencia autoalojado: con vLLM o llama.cpp server se puede exponer una API compatible con OpenAI (el tag "endpoints_compatible" asi lo sugiere) para integrar el modelo en aplicaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~11,0 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,6 GB
  - Q3_K_L: ~14,7 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_S: ~19,1 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - mmproj-Q8_0: ~0,7 GB adicionales; mmproj-f16: ~1,0 GB adicionales (solo si se usa vision)
- GPU recomendadas:
  - Q4_K_M en RTX 3090 o RTX 4090 (24 GB) con margen para contexto moderado.
  - Q5_K_M y Q6_K en RTX 4090 24 GB (Q6_K justo) o A6000/RTX A6000 48 GB.
  - Q8_0 en A100 40 GB, H100 o A6000 48 GB.
  - Cuantizaciones Q2_K a Q3_K_L pueden caber en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con contexto reducido.
- Cabe en GPU consumer: si, desde Q2_K (11 GB) hasta Q6_K (22,5 GB) en tarjetas de 16-24 GB; Q8_0 requiere 32 GB o reparto CPU/GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, y servidores compatibles con endpoints OpenAI; vLLM y TGI no consumen GGUF de forma nativa (requeririan el modelo base en safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF (este) | ~27,3B | no disponible | Apache 2.0 | GGUF | Abliterated, multimodal (mmproj), cuantizado por mradermacher |
| Qwen3 original (familia) | ~27B (variante equivalente) | no disponible | Apache 2.0 | safetensors | Alineamiento estandar, con rechazos; referencia de calidad |
| Huihui-Qwen3.8-27B-abliterated (base) | ~27,3B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo modelo abliterated |
| Otras variantes abliterated de ~27B | no disponible | no disponible | variable | GGUF/safetensors | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias cuantitativas con estas alternativas.

## Limitaciones y advertencias

- La abliteration reduce los rechazos, pero no elimina necesariamente sesgos ni contenido problematico; el modelo puede producir respuestas inapropiadas, ofensivas o inseguras en produccion.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; al ser un modelo conversacional de ~27B, es esperable que alucine en tareas de conocimiento especializado.
- Idiomas: los metadatos solo declaran "en"; no hay garantia de calidad en castellano ni en otros idiomas, aunque el modelo base Qwen3 suele ser multilingue.
- Longitud de contexto no documentada: no se puede planificar el uso con documentos largos sin verificacion empirica.
- Licencia Apache 2.0 declarada, pero conviene revisar los terminos del modelo base Qwen3 y del repositorio huihui-ai, ya que la abliteration puede entrar en conflicto con las politicas de uso de algunos proveedores.
- El repositorio pesa 190,8 GB en total; descargar todas las cuantizaciones no es necesario, pero requiere planificar el almacenamiento.
- Los ficheros GGUF multi-parte pueden requerir concatenacion o descarga de todos los fragmentos antes de usarse con llama.cpp.
- No hay benchmarks publicados ni evaluaciones de seguridad, por lo que no se recomienda su uso en aplicaciones orientadas al publico sin una capa de moderacion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Huihui-Qwen3.8-27B-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Huihui-Qwen3.8-27B-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
