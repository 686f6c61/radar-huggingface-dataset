# mradermacher/OneJev-9B-GGUF

## Resumen

OneJev-9B es un modelo multimodal de 8.953.803.264 parámetros (aproximadamente 9 mil millones) desarrollado por OmniJev, orientado a tareas de decisión calibrada, interacción con interfaces gráficas (GUI-agent) y comprensión de vídeo. Esta ficha documenta la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo se presenta con las etiquetas `decision-model`, `calibration`, `multimodal`, `gui-agent` y `video`, lo que sugiere un enfoque en agentes que deben tomar decisiones con estimación de confianza y en entornos visuales interactivos. Está entrenado sobre el dataset OmniJev/OneJev-Data y su licencia es Apache 2.0, lo que facilita su uso comercial.

La relevancia de esta ficha radica en que el repositorio original (OmniJev/OneJev-9B) solo distribuye pesos en formato transformers, mientras que esta versión GGUF ofrece 13 cuantizaciones estáticas (desde Q2_K hasta f16) más dos ficheros mmproj para el componente multimodal, lo que reduce la barrera de entrada para pruebas y despliegues en local. No obstante, la información pública disponible es escasa: no se detallan arquitectura, contexto, benchmarks ni composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 (≈9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Los tags indican que es multimodal (con soporte de vídeo e imágenes, dado el fichero mmproj), pero no se especifica si se trata de un transformer denso, un modelo con proyección visual tipo LLaVA, ni el mecanismo de fusión multimodal empleado.

Respecto al entrenamiento, la model card únicamente referencia el dataset OmniJev/OneJev-Data y menciona conceptos como `decision-model` y `calibration`, lo que apunta a un ajuste orientado a que el modelo exprese decisiones con algún tipo de calibración de confianza, pero no se detalla el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés (tag `conversational`).
- Procesamiento multimodal: la presencia de ficheros `mmproj` confirma soporte de entrada visual (imágenes y, por las etiquetas, vídeo).
- Agente de interfaz gráfica (GUI-agent): orientado a interpretar y actuar sobre pantallas o entornos visuales.
- Modelo de decisión con calibración: pensado para emitir decisiones acompañadas de estimaciones de confianza.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Automatización de tareas de escritorio: el modelo, al estar etiquetado como GUI-agent y aceptar entrada visual, puede emplearse para interpretar capturas de pantalla y decidir la siguiente acción (clic, escritura, navegación) en flujos de automatización de interfaz.
- Agentes con estimación de confianza: gracias a su orientación a calibración, encaja en pipelines donde el modelo debe indicar su grado de certeza antes de ejecutar una acción, permitiendo derivar a revisión humana los casos de baja confianza.
- Análisis de vídeo asistido: la etiqueta `video` y el proyector multimodal permiten su uso en tareas de descripción o extracción de información a partir de secuencias de vídeo, aunque sin datos públicos de rendimiento.
- Asistente conversacional en inglés: con las cuantizaciones Q4_K_M o Q5_K_M puede desplegarse como chatbot local en inglés para prototipos y pruebas internas.
- Evaluación de modelos de decisión en investigación: al ser Apache 2.0 y estar disponible en GGUF, sirve como base para experimentos académicos sobre calibración y agentes visuales sin depender de infraestructura de GPU de datacenter.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (3,9 GB) y Q3_K_S (4,4 GB) permiten ejecutar el modelo en equipos con poca VRAM o incluso en CPU, útil para demos y validación funcional.
- Integración en pipelines de CI/CD para pruebas de agentes GUI: la versión Q4_K_S (5,5 GB), marcada como "fast, recommended", facilita ejecutar pruebas automatizadas de agentes visuales en máquinas de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,9 GB
  - Q3_K_S: ~4,4 GB
  - Q3_K_M: ~4,7 GB
  - Q3_K_L: ~5,0 GB
  - IQ4_XS: ~5,3 GB
  - Q4_K_S: ~5,5 GB
  - Q4_K_M: ~5,7 GB
  - Q5_K_S: ~6,4 GB
  - Q5_K_M: ~6,6 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
  - Proyector multimodal: mmproj-Q8_0 ~0,7 GB; mmproj-f16 ~1,0 GB
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, las cuantizaciones Q4 y Q5 caben en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). La versión f16 requiere GPUs de 24 GB o más (RTX 3090/4090, A100, H100).
- Cabe en GPU de consumo: sí, en cuantizaciones Q2 a Q6; Q8_0 y f16 requieren GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, text-generation-webui). El formato GGUF no es compatible directamente con vLLM o TGI sin conversión.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de información suficiente para identificar alternativas directamente comparables en la misma categoría (multimodal + GUI-agent + calibración). Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OneJev-9B (esta ficha) | ≈9B | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal, GUI-agent, calibración |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos públicos para comparar |

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan arquitectura, contexto, dataset de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Idioma: la model card solo declara inglés (`en`); el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks publicados no puede cuantificarse.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto: desconocidas; no se especifica la ventana máxima.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (OmniJev/OneJev-9B) y de los datos de entrenamiento.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad, especialmente en tareas de decisión y calibración, donde la precisión numérica es crítica.
- El repositorio GGUF no incluye cuantizaciones ponderadas/imatrix según el autor, lo que puede afectar a la calidad relativa de las cuantizaciones pequeñas.
- Compatibilidad: al ser GGUF, no funciona directamente con vLLM o TGI; requiere llama.cpp u otro runtime compatible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OneJev-9B-GGUF
- Modelo base: https://huggingface.co/OmniJev/OneJev-9B
- Dataset: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Página de descargas del autor: https://hf.tst.eu/model#OneJev-9B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
