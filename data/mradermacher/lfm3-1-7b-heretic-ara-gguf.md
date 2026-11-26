# mradermacher/LFM3-1.7B-heretic-ara-GGUF

## Resumen

LFM3-1.7B-heretic-ara-GGUF es la version cuantizada en formato GGUF del modelo dalatexcoder/LFM3-1.7B-heretic-ara, un ajuste fino de tipo "abliterated" (tambien etiquetado como "heretic" o "decensored") sobre la base LiquidAI LFM3 de 1.700 millones de parametros. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, y el resultado es un conjunto de ficheros listos para ejecutarse en llama.cpp y entornos compatibles sin necesidad de GPU de gran capacidad.

El modelo se enmarca en la familia LFM3 de Liquid AI, disenada para despliegue en el borde (edge) y con arquitectura de tipo Liquid Foundation Model. La variante "heretic-ara" aplica tecnicas de abliteracion para reducir los rechazos del modelo ante peticiones que el modelo base tenderia a declinar, y anade capacidades en arabe (de ahi el sufijo "ara"). El resultado es un modelo conversacional pequeno, multilingue y sin filtros de seguridad reforzados.

Su relevancia practica radica en el tamano: 1.728.801.600 parametros que caben en cuantizaciones de entre 0,9 GB (Q2_K) y 3,6 GB (f16), lo que permite ejecutarlo en portatiles, mini-PC y GPUs de consumo. Es util para experimentacion con modelos sin censura, prototipado rapido y despliegue en entornos con recursos limitados, siempre asumiendo las advertencias legales y eticas que implica un modelo abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid Foundation Model (LFM3), transformer con modulos liquidos; requiere custom_code |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 15,9 GB |
| Descargas | 467 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo base es LFM3 de Liquid AI, una familia presentada como Liquid Foundation Model orientada a despliegue en el borde. La arquitectura combina componentes de transformer con modulos de tipo liquido, y el repositorio declara la etiqueta `custom_code`, lo que implica que la carga en `transformers` requiere `trust_remote_code=True` y el codigo especifico del modelo. El modelo cuenta con 1.728.801.600 parametros, un tamano propio de la gama "1.7B" de la familia.

Sobre esa base, dalatexcoder aplica un proceso de abliteracion (etiquetas `heretic`, `uncensored`, `decensored`, `abliterated`) que busca eliminar la direccion de rechazo en el espacio de activaciones, y anade capacidades en arabe (sufijo `ara`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el ajuste. La model card del repositorio cuantizado no incluye detalles de entrenamiento; solo documenta el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y las variantes generadas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Multilingue en 17 idiomas declarados: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Capacidades en arabe reforzadas por el ajuste `ara`.
- Comportamiento sin censura reforzada (abliterated/decensored): reduce los rechazos ante peticiones que el modelo base declinaria.
- Despliegue en el borde (etiqueta `edge`): disenado para ejecutarse en hardware de bajos recursos.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Prototipado de chatbots sin filtros: el modelo permite experimentar con respuestas sin rechazos en entornos de investigacion controlados, gracias a su naturaleza abliterated y su bajo coste de ejecucion en CPU o GPU de consumo.
- Despliegue en el borde: con cuantizaciones de 0,9 a 1,4 GB (Q2_K a Q5_K_M), puede ejecutarse en mini-PC, Raspberry Pi de gama alta o portatiles sin GPU dedicada mediante llama.cpp u Ollama.
- Asistencia conversacional en arabe: el ajuste `ara` lo hace adecuado para prototipos de atencion al cliente o asistentes en arabe, dentro de un conjunto multilingue mas amplio.
- Generacion de texto creativo sin restricciones: util para escritura de ficcion, guiones o contenido donde el modelo base aplicaria filtros de seguridad.
- Traduccion y procesamiento multilingue ligero: con 17 idiomas declarados, sirve para tareas de traduccion informal o resumen en entornos con recursos limitados.
- Experimentacion con tecnicas de abliteracion: sirve como caso de estudio reproducible (etiqueta `reproducible`) para investigadores que comparan el comportamiento del modelo base frente a la variante abliterated.
- Clasificacion y etiquetado de texto en lote: su bajo coste permite procesar grandes volumenes de texto en CPU con cuantizaciones Q4_K_S o Q4_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,9 GB
  - Q3_K_S / Q3_K_M: ~1,0 GB
  - Q3_K_L / IQ4_XS: ~1,1 GB
  - Q4_K_S / Q4_K_M: ~1,2 GB
  - Q5_K_S: ~1,3 GB
  - Q5_K_M: ~1,4 GB
  - Q6_K: ~1,5 GB
  - Q8_0: ~1,9 GB
  - f16: ~3,6 GB
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 sobran para este tamano. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM; en cuantizaciones Q4 tambien en iGPU y APUs.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, `transformers` con `trust_remote_code=True`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por tamano, se espera inferencia en tiempo real en GPU de consumo y velocidad moderada en CPU con cuantizaciones Q4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-heretic-ara-GGUF (este) | 1,73 B | no disponible | lfm1.0 | GGUF | Abliterated, multilingue, 17 idiomas |
| Modelo base LFM3-1.7B (Liquid AI) | ~1,7 B | no disponible | lfm1.0 | safetensors | Version con filtros de seguridad |
| Otros GGUF de ~1-2 B (p. ej. Llama 3.2 1B, Qwen2.5 1.5B) | 1-2 B | 128K (Qwen2.5) / 128K (Llama 3.2) | variable | GGUF | Alternativas generalistas; no abliterated |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de la direccion de rechazo puede degradar la coherencia, la calidad general y la fiabilidad en tareas que requieren juicio etico o seguridad.
- Riesgo de alucinacion: como todo modelo de 1,7 B, tiende a inventar datos, especialmente en tareas de razonamiento o matematicas.
- Contexto: no se ha publicado la longitud de contexto; no se debe asumir una ventana larga.
- Idiomas: aunque declara 17 idiomas, la calidad en idiomas distintos del ingles y el arabe puede ser limitada; no hay evaluaciones publicadas.
- Licencia lfm1.0: es una licencia "other" que hay que revisar antes de uso comercial; puede imponer restricciones de atribucion o de uso.
- Uso responsable: un modelo sin censura puede generar contenido ofensivo, ilegal o danino; no debe desplegarse en produccion orientada al publico sin filtros adicionales.
- Requiere `custom_code` en `transformers`: la carga no es estandar y puede romper con versiones futuras de la libreria.
- El repositorio tiene muy pocas descargas (467) y likes (1): no hay validacion comunitaria significativa.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mradermacher/LFM3-1.7B-heretic-ara-GGUF
- Modelo base: https://huggingface.co/dalatexcoder/LFM3-1.7B-heretic-ara
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/LFM3-1.7B-heretic-ara-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-heretic-ara-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de cuantizaciones: https://www.nethype.de/
