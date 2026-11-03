# mradermacher/KITE-7B-Instruct-GGUF

## Resumen

KITE-7B-Instruct es un modelo de visión-lenguaje especializado en robótica y análisis de fallos, desarrollado originalmente por el usuario m80hz y distribuido en formato GGUF por mradermacher. El modelo parte de una base Qwen2.5-VL de 7.615.616.512 parámetros y se ha afinado mediante LoRA para tareas de video-text-to-text orientadas a diagnosticar errores en ejecuciones robóticas. Su pipeline declarado es "robotics", lo que lo sitúa en el nicho de modelos que procesan secuencias visuales de manipulación o navegación para explicar qué ha fallado y por qué.

La relevancia de esta ficha radica en que el repositorio original (m80hz/KITE-7B-Instruct) no ofrece cuantizaciones, mientras que esta versión de mradermacher proporciona un conjunto completo de archivos GGUF (desde Q2_K de 3,1 GB hasta f16 de 15,3 GB) más los suplementos multimodales mmproj en Q8_0 y f16. Esto permite desplegar un modelo de visión-lenguaje de 7B en hardware de consumo mediante llama.cpp u Ollama, algo inviable con los pesos en precisión completa.

El modelo está licenciado bajo Apache 2.0, soporta únicamente inglés y fue creado el 14 de abril de 2026, con última actualización el 3 de noviembre de 2026. Con 92 descargas y 1 like, es un modelo de nicho con adopción todavía muy limitada, lo que conviene tener en cuenta al evaluar su madurez para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen2.5-VL (visión-lenguaje), afinada con LoRA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |
| Tamano del repositorio | 70,4 GB |
| Pipeline | robotics (video-text-to-text) |
| Modelo base | m80hz/KITE-7B-Instruct (adaptador LoRA sobre Qwen2.5-VL) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura multimodal de Qwen2.5-VL, que combina un encoder visual con un decoder de lenguaje transformer. Sobre esta base, el autor original aplicó un ajuste fino mediante LoRA para especializarlo en análisis de fallos en contextos robóticos, dando lugar a m80hz/KITE-7B-Instruct. La tarea declarada es video-text-to-text: el modelo recibe secuencias de vídeo junto con instrucciones textuales y genera descripciones o diagnósticos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del uso de LoRA sobre Qwen2.5-VL. La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y, según la model card, no se han publicado cuantizaciones ponderadas ni imatrix en el momento de la última revisión.

## Capacidades

- Procesamiento conjunto de vídeo e instrucciones textuales (video-text-to-text) para describir y analizar secuencias visuales.
- Análisis de fallos en robótica: identificación de errores en ejecuciones de manipulación o navegación a partir de vídeo.
- Comprensión visual heredada de Qwen2.5-VL: descripción de imágenes, objetos y escenas.
- Generación de texto conversacional e instrucciones (modelo "Instruct").
- Soporte multimodal mediante los archivos mmproj (Q8_0 o f16) necesarios para el encoder visual en llama.cpp.
- Capacidades multilingües limitadas al inglés.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso agéntico en la información disponible.

## Casos de uso

- Diagnóstico de fallos en brazos robóticos: el modelo recibe el vídeo de una ejecución de manipulación fallida y genera una explicación textual del error (objeto mal agarrado, colisión, trayectoria incorrecta), útil en laboratorios de robótica para acelerar la depuración.
- Análisis post-mortem de episodios de navegación: revisión de grabaciones de robots móviles para identificar por qué se desviaron o se bloquearon, aprovechando la entrada video-text-to-text.
- Etiquetado automático de datasets robóticos: generación de descripciones textuales de clips de vídeo para construir corpus de entrenamiento o evaluación en investigación en robótica.
- Asistencia en teleoperación: análisis en tiempo casi real de secuencias de vídeo para alertar al operador sobre anomalías detectadas en la tarea.
- Documentación de experimentos: conversión de grabaciones de ensayos robóticos en informes textuales estructurados que describan el resultado y los fallos observados.
- Despliegue en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB), puede ejecutarse en GPUs consumer para prototipado e investigación sin infraestructura de datacenter.
- Evaluación comparativa de políticas robóticas: uso del modelo como juez textual de la calidad de ejecuciones grabadas en vídeo, comparando episodios de distintos controladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y encoder visual):
  - Q2_K (3,1 GB): ~4-5 GB, viable en GPUs de 6 GB.
  - Q3_K_M (3,9 GB): ~5-6 GB.
  - IQ4_XS (4,4 GB) / Q4_K_S (4,6 GB) / Q4_K_M (4,8 GB): ~6-7 GB, recomendado para GPUs de 8 GB.
  - Q5_K_M (5,5 GB): ~7-8 GB.
  - Q6_K (6,4 GB): ~8-9 GB.
  - Q8_0 (8,2 GB): ~10-11 GB.
  - f16 (15,3 GB): ~17-18 GB.
- Hay que sumar el suplemento multimodal: mmproj-Q8_0 (1,0 GB) o mmproj-f16 (1,5 GB).
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100 o H100 solo necesarias para f16 o para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: sí, desde Q2_K en adelante; Q4_K_M es la opción equilibrada para 8 GB de VRAM.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y mmproj), Ollama, y servidores compatibles con la API de endpoints (el repo incluye el tag endpoints_compatible). vLLM y TGI no soportan GGUF de forma directa; para esos motores habría que usar los pesos safetensors del modelo base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| KITE-7B-Instruct (esta ficha) | 7,6 B | no disponible | Vídeo+texto (Qwen2.5-VL + LoRA) | Apache 2.0 | Sí, 12 cuantizaciones + mmproj |
| Qwen2.5-VL-7B-Instruct | ~7-8 B | no disponible en esta ficha | Imagen/vídeo+texto | Apache 2.0 | Disponible vía terceros |
| m80hz/KITE-7B-Instruct (base) | 7,6 B | no disponible | Vídeo+texto | Apache 2.0 | No (solo safetensors) |

La comparación con Qwen2.5-VL-7B-Instruct es la más directa, ya que KITE-7B-Instruct deriva de ella mediante LoRA. La ventaja de esta versión de mradermacher es la disponibilidad de cuantizaciones GGUF listas para usar, inexistentes en el repositorio original. No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades en castellano u otros idiomas.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de robótica es desconocido y debe validarse empíricamente.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar diagnósticos plausibles pero incorrectos sobre fallos robóticos; requiere verificación humana en entornos críticos.
- El ajuste fino con LoRA sobre un dataset no documentado puede introducir sesgos específicos del dominio de entrenamiento (tipo de robot, entorno, tarea).
- Adopción muy baja (92 descargas, 1 like) y autor original sin documentación pública de entrenamiento: madurez limitada para producción.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-VL conviene revisar también las condiciones del modelo base original.
- No se han publicado cuantizaciones ponderadas ni imatrix; las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- El repositorio ocupa 70,4 GB, por lo que la descarga completa es costosa; conviene descargar solo la cuantización y el mmproj necesarios.
- No hay información sobre tool calling ni capacidades agénticas, lo que limita su integración en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KITE-7B-Instruct-GGUF
- Modelo base original: https://huggingface.co/m80hz/KITE-7B-Instruct
- Página de descargas del cuantizador: https://hf.tst.eu/model#KITE-7B-Instruct-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
