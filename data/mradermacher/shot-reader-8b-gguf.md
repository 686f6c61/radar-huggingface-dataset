# mradermacher/shot-reader-8b-GGUF

## Resumen

shot-reader-8b-GGUF es la distribucion en formato GGUF del modelo voyager-so/shot-reader-8b, una adaptacion mediante LoRA de la familia Qwen3-VL orientada a la comprension de escenas 3D, camaras y previsualizacion (previs) cinematografica. El modelo base, shot-reader-8b, esta pensado para interpretar imagenes y videos de escenas (por ejemplo, renders de Blender) y responder a consultas sobre composicion de plano, colocacion de camara y entendimiento de escena. mradermacher se limita a generar las cuantizaciones estaticas del modelo original; no es el autor del modelo.

Con 8.190.735.360 parametros (aproximadamente 8,2 mil millones) y licencia Apache 2.0, el modelo se posiciona como una herramienta especializada para pipelines de produccion audiovisual y videojuegos que necesitan analisis automatico de planos. La disponibilidad de cuantizaciones GGUF desde Q2_K hasta f16 permite desplegarlo tanto en GPUs de consumo como en entornos de servidor con llama.cpp.

La relevancia actual radica en la combinacion de tres factores: la base Qwen3-VL (vision-lenguaje de ultima generacion), el ajuste fino especifico para previs y scene understanding, y la publicacion de cuantizaciones GGUF que facilitan su uso local. No obstante, la informacion publica disponible es escasa: no hay benchmarks ni detalles de entrenamiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), base Qwen3-VL con adaptador LoRA |
| Parametros totales | 8.190.735.360 (aprox. 8,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo original en safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-VL, un transformer multimodal que procesa imagenes y video junto con texto. Sobre esa base se aplica un adaptador LoRA entrenado por voyager-so para la tarea especifica de lectura de plano (shot reading), comprension de escena 3D y previs. Los tags del repositorio indican especializacion en vision, video-understanding, camara, 3D, Blender y scene-understanding.

No se dispone de informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se aplicaron tecnicas de RLHF o DPO. El repositorio es una conversion a GGUF realizada por mradermacher mediante cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf); no se han publicado cuantizaciones ponderadas/imatrix por parte de este autor. Los archivos mmproj (multi-modal supplement) son necesarios para habilitar la entrada visual en llama.cpp.

## Capacidades

- Comprension de imagenes de escenas 3D y renders (por ejemplo, escenas de Blender).
- Interpretacion de video y planos cinematograficos (video-understanding, shot reading).
- Razonamiento sobre colocacion de camara, composicion de plano y encuadre.
- Comprension de escena (scene understanding) para previsualizacion (previs).
- Conversacion multi-turno con entrada multimodal (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidad de vision-lenguaje heredada de Qwen3-VL (razonamiento visual general).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-step: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis automatico de planos en postproduccion: el modelo puede recibir frames o videos de una secuencia y describir el encuadre, la posicion de camara y la composicion, agilizando tareas de revision y catalogacion de material.
- Asistencia a previs en Blender: dado un render de escena, el modelo puede interpretar la disposicion de elementos y responder a consultas sobre el plano, sirviendo como copiloto para artistas de previsualizacion.
- Control de continuidad cinematografica: comparando imagenes de planos consecutivos, el modelo puede ayudar a detectar cambios de encuadre o inconsistencias de composicion en una secuencia.
- Generacion de descripciones de escena para pipelines de metadatos: integrado en un flujo de ingesta, puede producir descripciones textuales de imagenes y videos para etiquetado y busqueda.
- Prototipado de herramientas de direccion de fotografia: desarrolladores pueden construir interfaces conversacionales donde el usuario sube un frame y pregunta sobre alternativas de encuadre o angulo de camara.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M (5,1 GB) o Q4_K_S (4,9 GB) junto al mmproj, puede ejecutarse en GPUs de consumo para pruebas y demos sin infraestructura cloud.
- Evaluacion de escenas en videojuegos o entornos 3D: el modelo puede analizar capturas de escenas virtuales para verificar composicion y legibilidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,4 GB; Q3_K_M ~4,2 GB; Q4_K_S ~4,9 GB; Q4_K_M ~5,1 GB; Q5_K_M ~6,0 GB; Q6_K ~6,8 GB; Q8_0 ~8,8 GB; f16 ~16,5 GB.
- El componente multimodal mmproj anade ~0,9 GB (Q8_0) o ~1,3 GB (f16) a la VRAM total.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones Q5-Q8 con margen; A100/H100 para f16 o despliegues concurrentes.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_S/Q4_K_M en GPUs de 8-12 GB (por ejemplo, RTX 3060 12 GB, RTX 4070), sumando el mmproj y el overhead de contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints (tag endpoints_compatible). vLLM y TGI no estan confirmados para este repositorio GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| shot-reader-8b (este) | ~8,2 B | no disponible | Vision-lenguaje especializado en previs/escenas 3D (base Qwen3-VL + LoRA) | Apache 2.0 | GGUF, safetensors |
| Qwen3-VL 8B | ~8 B | no disponible en esta ficha | Vision-lenguaje general | no disponible en esta ficha | safetensors, GGUF |
| LLaVA-OneVision 7B | ~7 B | no disponible en esta ficha | Vision-lenguaje general | no disponible en esta ficha | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- No hay benchmarks publicados, por lo que la calidad real en tareas de previs no puede evaluarse a priori.
- Riesgo de alucinacion inherente a los modelos vision-lenguaje: puede describir elementos inexistentes en la escena o malinterpretar geometria 3D.
- Al ser una adaptacion LoRA sobre Qwen3-VL, puede arrastrar los sesgos del modelo base, no documentados en esta ficha.
- La model card del repositorio GGUF es una plantilla generica de mradermacher; no incluye informacion sobre el dataset de entrenamiento ni evaluaciones.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad en tareas de percepcion visual; se recomienda Q4_K_M o superior para uso real.
- El componente mmproj es imprescindible para entrada visual; omitirlo elimina la capacidad multimodal.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-VL subyacente.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: madurez y soporte comunitario muy limitados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/shot-reader-8b-GGUF
- Modelo base: https://huggingface.co/voyager-so/shot-reader-8b
- Pagina de descargas del autor: https://hf.tst.eu/model#shot-reader-8b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
