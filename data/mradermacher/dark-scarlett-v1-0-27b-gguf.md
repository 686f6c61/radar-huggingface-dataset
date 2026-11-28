# mradermacher/Dark-Scarlett-v1.0-27B-GGUF

## Resumen

Dark-Scarlett-v1.0-27B-GGUF es la distribucion en formato GGUF del modelo Dark-Scarlett-v1.0-27B, publicado por el usuario ReadyArt y cuantizado por mradermacher. Se trata de un modelo de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) derivado de la familia Qwen, segun la etiqueta "qwen 3.6" de su model card, y afinado especificamente para roleplay, conversacion instructiva y contenido para adultos (ERP). La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamano en hardware de consumo mediante cuantizacion GGUF, algo impracticable con los pesos originales en safetensors.

El repositorio incluye un conjunto completo de cuantizaciones estaticas (desde Q2_K hasta Q8_0) y dos ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal, lo que sugiere que el modelo base incorpora capacidades de vision. El autor de la cuantizacion es un actor consolidado en el ecosistema GGUF, con infraestructura propia (nethype GmbH) para generar estos ficheros.

La licencia declarada es Apache 2.0, lo que en principio facilita el uso comercial, aunque el contenido del modelo esta orientado a tematicas adultas y lleva la etiqueta "not-for-all-audiences". El modelo solo declara soporte para ingles y cuenta con 194 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen; etiqueta "qwen 3.6"), con modulo multimodal mmproj |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para vision); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La etiqueta "qwen 3.6" y el tamano de 27,3 mil millones de parametros apuntan a un transformer denso de la familia Qwen, aunque no se confirma si emplea atencion lineal, decodificacion especulativa u otras innovaciones. La presencia de ficheros mmproj indica que el modelo base integra un codificador visual, por lo que se trata de un modelo multimodal, no solo de texto.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. Las etiquetas "roleplay", "instruct", "unaligned" y "erp" sugieren un ajuste fino orientado a conversacion sin restricciones de alineamiento, pero se desconoce el proceso concreto. Esta cuantizacion concreta ha sido generada por mradermacher con cuantizaciones estaticas; el autor indica que dispone de versiones con imatrix en un repositorio separado.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y narrativa interactiva.
- Capacidades multimodales: los ficheros mmproj permiten procesar imagenes junto con texto.
- Instrucciones: el modelo esta etiquetado como "instruct", por lo que responde a comandos directos.
- Contenido para adultos: entrenado o ajustado para ERP y tematicas maduras explicitas.
- Modo "unaligned": menor tendencia a rechazar peticiones por filtros de seguridad.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta afinado especificamente para mantener personajes y narrativa coherente en conversaciones multi-turno, con un tamano de 27 B que aporta mayor riqueza lexica que modelos de 7-8 B en este dominio.
- Escritura creativa de ficcion adulta: adecuado para generar narrativa explicita con control de tono y estilo, gracias a su ajuste "unaligned" que evita rechazos sistematicos.
- Prototipado de asistentes de personaje en local: con la cuantizacion Q4_K_M (16,9 GB) puede ejecutarse en una GPU de consumo de 24 GB, lo que permite desplegar un asistente de rol sin depender de APIs externas.
- Analisis de imagenes en contextos narrativos: los ficheros mmproj permiten describir o incorporar imagenes a una historia, util para herramientas de escritura asistida con referencia visual.
- Investigacion sobre alineamiento y seguridad: al estar etiquetado como "unaligned", sirve como caso de estudio para medir la eficacia de filtros y evaluar riesgos de modelos sin restricciones.
- Generacion de dialogos para videojuegos o narrativa interactiva: la ventana de contexto (no confirmada) y el estilo conversacional lo hacen apto para motores de dialogo de personajes no jugadores en produccion local.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir el impacto de la cuantizacion en la calidad narrativa y la coherencia en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto):
  - Q2_K: ~11 GB.
  - Q3_K_M: ~13,6 GB.
  - IQ4_XS: ~15,5 GB.
  - Q4_K_M: ~16,9 GB.
  - Q5_K_M: ~19,6 GB.
  - Q6_K: ~22,5 GB.
  - Q8_0: ~29,1 GB.
- GPU recomendadas: para Q8_0, una A100 40 GB o H100; para Q6_K, una RTX 4090 (24 GB) o A6000; para Q4_K_M, una RTX 4090 o RTX 3090 con margen para contexto.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; los ficheros mmproj requieren soporte multimodal del runtime (por ejemplo, llama.cpp con `--mmproj`).
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dark-Scarlett-v1.0-27B-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Roleplay/ERP, multimodal via mmproj, solo ingles |
| Modelos Qwen densos de ~27-32 B | ~27-32 B | no disponible | segun variante | safetensors, GGUF | Base generica; el ajuste de Dark-Scarlett es especifico para roleplay |
| Modelos de roleplay de 7-8 B (familia Mistral/Llama) | 7-8 B | no disponible | segun variante | GGUF | Menor calidad narrativa pero mucho mas ligeros (4-6 GB en Q4) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para generar material explicito; no es apto para entornos infantiles ni para uso sin moderacion.
- Etiqueta "unaligned": menor rechazo de peticiones potencialmente daninas, lo que incrementa el riesgo de generar contenido ofensivo, ilegal o peligroso.
- Riesgo de alucinacion: como todo modelo generativo de este tamano, puede inventar hechos, nombres y detalles; no debe usarse como fuente de informacion factual sin verificacion.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado y probablemente sea degradado.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar despliegues con conversaciones muy largas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- Adopcion muy baja (194 descargas, 0 likes) y ausencia de benchmarks publicos: no hay evidencia externa de calidad ni de estabilidad en produccion.
- El repositorio ocupa 190,8 GB, por lo que la descarga completa de todas las cuantizaciones es costosa en almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-27B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-27B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-27B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Dark-Scarlett-v1.0-27B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
