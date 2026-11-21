# mradermacher/Safeword-Casual-V1-12B-GGUF

## Resumen

Safeword-Casual-V1-12B-GGUF es la distribucion en formato GGUF del modelo Safeword-Casual-V1-12B, desarrollado originalmente por ReadyArt y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 11.766.034.176 parametros (aproximadamente 12B) orientado explicitamente a roleplay conversacional y contenido para adultos (ERP), con etiquetas declaradas de "nsfw", "explicit", "unaligned" y "dangerous". No es un modelo de proposito general: su diseno prioriza la coherencia narrativa en conversaciones largas de ficcion interactiva sobre las salvaguardas de alineamiento convencionales.

La relevancia de esta ficha radica en que documenta una familia de modelos de rol sin restricciones que circula en Hugging Face con licencia Gemma heredada del modelo base subyacente, lo que plantea cuestiones practicas sobre compatibilidad de licencia, uso comercial y despliegue local. El repositorio ocupa 83,9 GB e incluye 12 cuantizaciones estaticas (desde Q2_K de 4,9 GB hasta Q8_0 de 12,6 GB), ademas de dos ficheros mmproj (Q8_0 y f16) que sugieren capacidad multimodal en el modelo base.

El modelo solo declara soporte para ingles y esta pensado para inferencia local mediante llama.cpp u Ollama. No se han publicado datos de benchmarks, contexto maximo ni composicion del dataset de entrenamiento en la informacion disponible, por lo que muchas especificaciones tecnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base ReadyArt/Safeword-Casual-V1-12B, presumiblemente transformer decoder-only) |
| Parametros totales | 11.766.034.176 (~12B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, ademas de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. La model card del repositorio cuantizado es una plantilla generica de mradermacher que no incluye detalles del entrenamiento original; unicamente remite al modelo base ReadyArt/Safeword-Casual-V1-12B como fuente.

Los metadatos de la cuantizacion indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que las cuantizaciones se generaron a partir de los pesos en formato Hugging Face del modelo base. La presencia de ficheros `mmproj` (multi-modal projection) sugiere que el modelo base incorpora un adaptador de proyeccion visual, aunque no se detalla que codificador de vision utiliza ni como se entreno esa componente. El tag "unaligned" indica que el modelo no ha pasado por procesos de alineamiento estandar (RLHF/DPO con criterios de seguridad), lo que es coherente con su orientacion a contenido explicito.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a roleplay y ficcion interactiva multi-turno.
- Roleplay explicito y contenido para adultos (ERP), segun los tags declarados por el autor.
- Presunta capacidad multimodal (vision) por la presencia de ficheros mmproj, aunque no se documenta su alcance ni calidad.
- Conversacion sin restricciones de alineamiento ("unaligned"), lo que implica ausencia de rechazos por contenido sensible.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, audio ni capacidades especiales adicionales.
- Multilingue: solo ingles declarado.

## Casos de uso

- Roleplay conversacional de ficcion interactiva: el modelo esta disenado para mantener personajes y tramas coherentes en dialogos multi-turno, gracias a su naturaleza de 12B y a un ajuste especifico para este dominio.
- Escritura creativa para adultos: generacion de narrativa explicita en entornos controlados y privados, donde el usuario asume la responsabilidad del contenido producido.
- Prototipado de motores de rol para videojuegos o aplicaciones de ficcion interactiva: puede desplegarse localmente con llama.cpp u Ollama para iterar sobre diseno de personajes y guiones sin depender de APIs externas.
- Investigacion sobre modelos sin alineamiento: util para estudiar comportamiento, sesgos y riesgos de modelos "unaligned" en entornos de laboratorio aislados.
- Generacion de dialogos para guiones o novelas ligeras: el modelo puede producir borradores de conversaciones con tono informal y explicito que luego se editan manualmente.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (7,4 GB) y Q5_K_M (8,5 GB) permiten ejecucion en GPUs consumer de 8-12 GB de VRAM, lo que facilita uso personal off-line.
- Experimentacion con cuantizaciones: el repositorio ofrece 12 variantes para comparar calidad frente a tamano en tareas de generacion creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_M: ~6,1 GB
  - Q4_K_S / Q4_K_M: ~7,0-7,4 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,8 GB
  - Q8_0: ~12,6 GB
  - F16 (no incluido en este repo, pero referenciado en los tags de cuantizacion): ~23,5 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB, RTX 4090 24 GB para cuantizaciones Q4-Q8; A100/H100 solo si se busca throughput alto o contexto muy largo.
- Cabe en GPU consumer: si, con Q4_K_M (7,4 GB) en GPUs de 8 GB o mas; Q5_K_M y Q6_K en GPUs de 10-12 GB; Q8_0 en GPUs de 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI en plataformas de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Safeword-Casual-V1-12B-GGUF | ~12B | no disponible | gemma | GGUF | Roleplay explicito, unaligned, solo ingles |
| Modelos base tipo Gemma 2 12B | ~12B | no disponible en esta ficha | gemma | safetensors, GGUF | Alineados, uso general, multilingue |
| Otros modelos de rol sin restricciones de ~12B | ~12B | variable | variable | GGUF | Ecosistema amplio en Hugging Face, calidad muy variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido explicito y para adultos: el modelo esta etiquetado como "nsfw", "explicit" y "not-for-all-audiences"; no es apto para menores ni para entornos laborales sin control.
- Modelo "unaligned" y "dangerous": no ha pasado por procesos de alineamiento de seguridad, por lo que puede generar contenido danino, ilegal o socialmente inaceptable sin filtros.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; en roleplay la alucinacion es esperable y no necesariamente un defecto, pero en usos fuera de dominio es un riesgo real.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en espanol producira resultados degradados.
- Licencia "gemma": hereda los terminos de la licencia Gemma de Google, que imponen restricciones de uso (incluida una politica de uso aceptable). El uso comercial esta sujeto a dichos terminos y a la interpretacion de si un modelo "unaligned" derivado cumple la politica de uso aceptable de Gemma.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar conversaciones largas con garantias.
- Sin benchmarks: no hay evidencia publica de calidad frente a alternativas; el usuario debe evaluar por si mismo.
- Repositorio de 83,9 GB: requiere espacio en disco considerable si se descargan todas las cuantizaciones.
- El modelo base original (ReadyArt/Safeword-Casual-V1-12B) es la referencia para detalles de entrenamiento y arquitectura; este repositorio solo contiene cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Safeword-Casual-V1-12B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Safeword-Casual-V1-12B
- Cuantizaciones imatrix (i1-GGUF): https://huggingface.co/mradermacher/Safeword-Casual-V1-12B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Safeword-Casual-V1-12B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
