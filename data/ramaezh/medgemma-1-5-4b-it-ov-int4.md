# ramaezh/medgemma-1.5-4b-it-ov-int4

## Resumen

MedGemma 1.5 4B IT es un modelo de lenguaje multimodal especializado en el ámbito médico, derivado de la familia Gemma 3 de Google. La variante publicada bajo el identificador `ramaezh/medgemma-1.5-4b-it-ov-int4` es una conversión comunitaria: un checkpoint de instrucciones de 4 mil millones de parámetros cuantizado a INT4 y exportado al formato OpenVINO para su despliegue optimizado en hardware Intel (CPU, iGPU y NPU). El autor del artefacto es el usuario `ramaezh`, no el equipo original de MedGemma.

El modelo base resuelve tareas de comprensión y generación de texto clínico, razonamiento médico y análisis de imágenes médicas (radiología, dermatología, histopatología), aprovechando la arquitectura multimodal de Gemma 3. La versión INT4 en OpenVINO busca reducir la huella de memoria y acelerar la inferencia en equipos sin GPU dedicada, un escenario habitual en entornos clínicos y de investigación con presupuesto limitado.

Es relevante ahora porque la cuantización INT4 con OpenVINO permite ejecutar un modelo médico multimodal de 4B en portátiles y mini-PC con CPU Intel moderna, algo impensable con los pesos originales en bf16. No obstante, la model card del repositorio es prácticamente vacía (solo declara la licencia Apache 2.0), por lo que muchos datos técnicos deben inferirse del modelo base y no están confirmados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), con encoder de visión y decoder de texto; pesos convertidos a OpenVINO IR |
| Parametros totales | 4B (aproximado, según nomenclatura del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Gemma 3 soporta ventanas amplias (hasta 128k en variantes de texto), pero no confirmado para este checkpoint |
| Tipos de cuantizacion | INT4 (única variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El checkpoint deriva de MedGemma 1.5 4B IT, un modelo construido sobre la arquitectura Gemma 3: un transformer decoder-only con atención multimodal que incorpora un encoder visual para procesar imágenes. Gemma 3 emplea atención con ventana deslizante local combinada con capas de atención global, lo que reduce el coste computacional en contextos largos. El proceso de entrenamiento original de MedGemma incluye ajuste fino supervisado y preferencia (RLHF/DPO) sobre datos médicos, aunque los detalles exactos (número de tokens, composición del dataset, proporción de datos multimodales) no están disponibles en la información proporcionada.

La contribución de este repositorio es exclusivamente de despliegue: conversión de los pesos a OpenVINO IR y cuantización a INT4. No se documenta en la model card qué técnica de cuantización se aplicó (PTQ con calibración, AWQ, GPTQ u otra), ni si se preservaron las capas de visión en precisión superior. Tampoco se indica si se realizó validación de degradación de calidad tras la cuantización, lo que constituye una laguna importante para uso clínico.

## Capacidades

- Generación de texto clínico: informes, resúmenes de historias clínicas y respuestas a preguntas médicas.
- Razonamiento médico multi-paso sobre casos clínicos.
- Comprensión de imágenes médicas (radiografías, dermatología, histología) heredada del modelo base multimodal.
- Generación y explicación de código para pipelines de procesamiento de datos sanitarios.
- Soporte de conversación multi-turno con instrucciones (variante IT).
- Capacidades multilingües: no confirmadas en este checkpoint; el modelo base Gemma 3 es multilingüe, pero la model card no lo declara.
- Tool calling / function calling: no documentado para este artefacto.
- Modo thinking explícito: no documentado.

## Casos de uso

- Asistencia a la redacción de informes radiológicos: el modelo puede recibir una imagen y un prompt textual para generar un borrador estructurado, útil en entornos con CPU Intel y sin GPU.
- Triaje de consultas clínicas en atención primaria: clasificación y resumen de síntomas en conversaciones multi-turno, desplegado en mini-PC con OpenVINO.
- Educación médica interactiva: generación de explicaciones y casos de estudio en local, sin enviar datos de pacientes a la nube.
- Procesamiento por lotes de notas clínicas en investigación: extracción de entidades y resúmenes sobre corpus anonimizados en servidores sin GPU dedicada.
- Prototipado rápido de asistentes sanitarios en portátiles: la cuantización INT4 permite iterar en hardware de consumo con latencia aceptable.
- Análisis preliminar de imágenes dermatológicas en entornos con recursos limitados: como cribado de apoyo, nunca como diagnóstico autónomo.
- Integración en aplicaciones de escritorio sanitarias mediante la API de OpenVINO Runtime, sin dependencia de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de precisión, latencia ni comparativas tras la cuantización INT4.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 3,5 GB, por lo que la inferencia INT4 requiere aproximadamente 4-6 GB de memoria disponible, incluyendo overhead del runtime y del encoder visual.
- GPU recomendadas: no es un artefacto para GPU NVIDIA; está pensado para OpenVINO. Puede ejecutarse en iGPU Intel (Iris Xe, Arc) y NPU Intel Core Ultra.
- CPU: procesadores Intel con soporte AVX2 o superior; idealmente generaciones recientes (12ª en adelante) para buen throughput.
- Cabe en hardware de consumo: sí, en portátiles y mini-PC con 8 GB de RAM o más.
- Opciones de despliegue: OpenVINO Runtime, OpenVINO GenAI, Optimum-Intel; no es compatible directamente con vLLM, llama.cpp ni Ollama sin conversión adicional.
- Latencia y throughput: no disponibles; dependerán del hardware y de si se usa CPU, iGPU o NPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ramaezh/medgemma-1.5-4b-it-ov-int4 | ~4B | no disponible | OpenVINO INT4 | Apache 2.0 | HuggingFace (0 descargas) |
| MedGemma 1.5 4B IT (original) | ~4B | no disponible | safetensors | Apache 2.0 (según modelo base) | HuggingFace (oficial) |
| Gemma 3 4B IT | ~4B | hasta 128k (texto) | safetensors, GGUF | Gemma license | HuggingFace, Ollama, llama.cpp |
| Qwen2.5-VL 3B | ~3B | 32k | safetensors, GGUF | Apache 2.0 | HuggingFace, Ollama |

La comparativa con el original y con Gemma 3 4B IT es la más directa; la principal diferencia es el formato OpenVINO y la cuantización INT4, que sacrifica portabilidad (no funciona en llama.cpp) a cambio de eficiencia en hardware Intel.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay información sobre el proceso de cuantización, calibración ni validación de calidad; el riesgo de degradación respecto al modelo original es desconocido.
- Uso clínico: no es un dispositivo médico; no debe emplearse para diagnóstico o decisión terapéutica sin supervisión profesional.
- Riesgo de alucinación: elevado en dominios médicos, especialmente tras cuantización agresiva a INT4.
- Sesgos: heredados de los datos de entrenamiento del modelo base, no evaluados en este checkpoint.
- Idiomas: no confirmados; la model card no declara idiomas soportados.
- Licencia Apache 2.0 declarada, pero conviene verificar la licencia del modelo base MedGemma, que puede imponer restricciones adicionales de uso (por ejemplo, uso no clínico).
- Compatibilidad: solo OpenVINO; no usable con ecosistemas GGUF/llama.cpp sin reconversión.
- Repositorio sin descargas ni likes: sin evidencia de comunidad ni de pruebas por terceros.
- Fecha de creación futura (2026-11-01) en los metadatos: posible artefacto o error del repositorio, a verificar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ramaezh/medgemma-1.5-4b-it-ov-int4
- Modelo base MedGemma (Google): https://huggingface.co/google/medgemma-4b-it
- Documentación OpenVINO: https://docs.openvino.ai
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Optimum-Intel: https://github.com/huggingface/optimum-intel
