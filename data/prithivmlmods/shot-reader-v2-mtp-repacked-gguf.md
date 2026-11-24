# prithivMLmods/shot-reader-v2-MTP-Repacked-GGUF

## Resumen

shot-reader-v2-MTP-Repacked-GGUF es la versión cuantizada en formato GGUF del modelo shot-reader-v2, un modelo de visión-lenguaje de 9B parámetros desarrollado por Voyager sobre la base de Qwen3.5-9B mediante la fusión de un adaptador LoRA de rango 64. El modelo está especializado en la ingeniería inversa de planos de vídeo continuos: a partir de 16 fotogramas muestreados a 448×256 y una pista de geometría de cámara generada con OpenCV, produce hojas de plano estructuradas en JSON 3D listas para reconstrucción directa en Blender o en flujos de agentes de construcción de escenas.

La relevancia de este modelo radica en su capacidad para separar el movimiento físico del cuerpo de cámara (`camera.move`) de los cambios de distancia focal (`camera.zoom`), detectar movimiento de cámara en mano, clasificar el estilo visual (acción real, CG 3D o animación 2D) y rastrear dimensiones 3D de sujetos y trayectorias sobre el plano del suelo. Según la model card, identifica zooms de lente con un 95% de precisión en 300 planos de test retenidos, frente al 7% de Opus 5.5 y el 48% de Gemini 4 Argon.

Esta versión concreta, publicada por prithivMLmods, incorpora cabezas de predicción multi-token (MTP) para decodificación especulativa integrada en los pesos, lo que acelera la inferencia local sin necesidad de un modelo borrador separado. Se distribuye bajo licencia Apache 2.0 con cuantizaciones desde Q3_K_M (4,8 GB) hasta BF16 (18,4 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basado en Qwen3.5-9B, con LoRA rango 64 fusionado y cabezas MTP para decodificacion especulativa |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, mmproj-bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) y GGUF (multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal de 9,65B parámetros, sobre el que Voyager aplicó un adaptador LoRA de rango 64 que posteriormente se fusionó en los pesos base. La entrada visual se compone de 16 fotogramas equiespaciados a resolución 448×256, acompañados de una señal de geometría de fotograma basada en seguimiento de puntos con OpenCV. La salida es un JSON estructurado que descompone el plano en movimiento de cámara, zoom, estilo visual, dimensiones de sujeto y trayectorias, junto con leyendas, etiquetas de búsqueda y puntuaciones de confianza calibradas a partir de probabilidades de token.

La innovación técnica principal de esta versión es la incorporación de Multi-Token Prediction (MTP) repackeado en los pesos: el modelo incluye cabezas de salida adicionales que predicen varios tokens futuros en una sola pasada, habilitando decodificación especulativa sin modelo borrador externo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento estructurado con salida en JSON validable.
- Comprensión de vídeo de plano único: muestreo de 16 fotogramas con análisis de movimiento y geometría.
- Descomposición de movimiento de cámara (`camera.move`) frente a zoom de lente (`camera.zoom`).
- Detección de movimiento de cámara en mano (handheld) con 92% de recall según la model card.
- Clasificación de estilo visual: acción real, CG 3D o animación 2D.
- Rastreo de dimensiones 3D de sujetos y trayectorias sobre el plano del suelo.
- Generación de leyendas, etiquetas de búsqueda y hojas de plano 3D para Blender.
- Puntuaciones de confianza calibradas a partir de probabilidades de token.
- Capacidades multimodales imagen-texto y vídeo-texto.
- Modo rápido `--camera-only` para análisis restringido a cámara.
- Soporte de decodificación especulativa MTP integrada en los pesos.
- Integración con text-generation-inference, llama-cpp y llama-cli.
- Compatibilidad con endpoints y flujos de agentes MCP según la model card.

## Casos de uso

- Previsualización (previs) en producción audiovisual: el modelo convierte un plano de referencia en una hoja de plano JSON 3D que un artista técnico puede cargar directamente en Blender para reconstruir la escena, ahorrando el trabajo manual de medición de cámara y trayectorias.
- Etiquetado y catalogación de bibliotecas de vídeo: con salida de leyendas, etiquetas de búsqueda y clasificación de estilo visual, permite indexar grandes archivos de planos por tipo de movimiento de cámara, zoom y estilo, facilitando la búsqueda semántica.
- Análisis de movimiento de cámara para VFX y postproducción: la separación entre desplazamiento físico y cambio focal permite a los equipos de composición digital identificar planos con dolly zoom estilo Vertigo (90% de acierto) y planificar la estabilización o el tracking.
- Automatización de flujos de agentes de construcción de escenas: la salida JSON estructurada y las puntuaciones de confianza calibradas permiten que un agente multi-paso valide y corrija la reconstrucción de escenas sin intervención humana.
- Documentación técnica de rodaje: a partir de un plano grabado, el modelo genera una ficha con altura de cámara, movimiento y dimensiones de sujeto (72% de precisión conjunta según la model card), útil para continuidad y recreación de planos.
- Despliegue local en estaciones de trabajo de artistas: las cuantizaciones Q4_K_M (5,83 GB) y Q5_K_M (6,67 GB) permiten ejecutar el modelo en GPU de consumo mediante llama.cpp u Ollama, sin depender de servicios en la nube.
- Investigación en comprensión de vídeo: la arquitectura con MTP y la señal geométrica de OpenCV ofrecen un banco de pruebas para estudiar decodificación especulativa en tareas viso-espaciales.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 300 planos de test retenidos:

| Metrica | shot-reader-v2 | Opus 5.5 | Gemini 4 Argon |
|---|---|---|---|
| Identificacion de zoom de lente | 95% | 7% | 48% |
| Clasificacion de dolly zoom (Vertigo) | 90% | no disponible | no disponible |
| Deteccion de handheld (recall) | 92% | no disponible | no disponible |
| Precision conjunta altura y movimiento de camara | 72% | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-7 GB con cuantizaciones Q4_K_M o Q5_K_M; unos 10 GB con Q8_0; unos 18-20 GB con BF16.
- El fichero mmproj-bf16 (922 MB) debe cargarse adicionalmente para las capacidades de visión.
- GPU recomendadas: RTX 4090 (24 GB) para BF16 o Q8_0; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizaciones Q4-Q6; A100 o H100 para despliegues de alta concurrencia con vLLM.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB con Q4_K_M hasta una RTX 4090 con BF16.
- Opciones de despliegue: llama.cpp, llama-cli, Ollama, text-generation-inference, vLLM (con opción de 4 bits y modo `--camera-only`), Transformers.
- Latencia y throughput: no disponibles en la información proporcionada; la decodificación especulativa MTP está diseñada para acelerar la inferencia local respecto a la decodificación autoregresiva estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| shot-reader-v2-MTP (este) | 9,65B | no disponible | Analisis de planos de video y hojas 3D | Apache 2.0 | Safetensors, GGUF |
| Qwen3.5-9B (base) | 9B | no disponible | Vision-lenguaje general | no disponible | Safetensors |
| Opus 5.5 | no disponible | no disponible | Modelo propietario general | Propietaria | API |
| Gemini 4 Argon | no disponible | no disponible | Modelo propietario multimodal | Propietaria | API |

La comparación con Opus 5.5 y Gemini 4 Argon se limita a la tarea de identificación de zoom de lente, donde shot-reader-v2 obtiene un 95% frente al 7% y 48% respectivamente según la model card. No se dispone de datos comparativos en otras tareas ni de especificaciones de contexto para los modelos propietarios.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado su rendimiento en castellano ni en otros idiomas.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con secuencias largas.
- Es un modelo especializado: su rendimiento en tareas generales de visión-lenguaje no se ha evaluado y probablemente sea inferior al de modelos generalistas del mismo tamaño.
- Las métricas de la model card (95% zoom, 90% dolly zoom, 92% handheld, 72% altura y movimiento) provienen de 300 planos de test retenidos; no se detalla la composición del conjunto ni la metodología de evaluación, por lo que deben tomarse con cautela.
- Riesgo de alucinación en la generación de JSON: la salida estructurada puede contener campos inventados o inconsistentes, especialmente con cuantizaciones bajas (Q3_K_M, Q3_K_L).
- La precisión conjunta de altura y movimiento de cámara es del 72%, lo que implica un 28% de error en una tarea crítica para reconstrucción 3D.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que conviene verificar.
- El repositorio ocupa 90,4 GB, lo que requiere espacio de almacenamiento considerable si se descargan todas las cuantizaciones.
- No se han publicado datos sobre sesgos demográficos, geográficos o culturales en el entrenamiento.
- El uso de la señal de geometría con OpenCV añade una dependencia externa en el pipeline de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/shot-reader-v2-MTP-Repacked-GGUF
- Repositorio de ficheros GGUF: https://huggingface.co/prithivMLmods/shot-reader-v2-MTP-Repacked-GGUF/tree/main/GGUF
- Modelo base: https://huggingface.co/voyager-so/shot-reader-v2
- Perfil del autor de la cuantizacion: https://huggingface.co/prithivMLmods
