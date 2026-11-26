# mradermacher/Nemotron-Labs-Image-30B-A3B-GGUF

## Resumen

Nemotron-Labs-Image-30B-A3B es un modelo desarrollado por NVIDIA Labs, distribuido originalmente en Hugging Face bajo el identificador `nvidia/Nemotron-Labs-Image-30B-A3B`. La ficha que nos ocupa documenta la versión cuantizada en formato GGUF elaborada por mradermacher, un colaborador habitual de la comunidad que publica cuantizaciones estáticas de modelos abiertos. El modelo base cuenta con 32.634.904.896 parámetros totales según los pesos en safetensors, y su nomenclatura "30B-A3B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 30.000 millones de parámetros totales y 3.000 millones activos por token, aunque este dato no se confirma explícitamente en la información disponible.

El modelo está etiquetado como orientado a generación de imágenes (`image-generation`) y conversacional (`conversational`), con soporte declarado únicamente para inglés. La licencia es la NVIDIA License, que impone condiciones específicas de uso comercial distintas de las licencias permisivas habituales. El repositorio GGUF ocupa 268,4 GB e incluye diez cuantizaciones estáticas que van desde Q2_K (18,9 GB) hasta Q8_0 (34,8 GB), lo que permite desplegar el modelo en hardware con recursos limitados a costa de cierta pérdida de calidad.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo multimodal de gran tamaño en infraestructura local mediante llama.cpp y herramientas compatibles, algo imposible con los pesos completos en precisión nativa. No obstante, la información pública disponible es escasa: no se documentan benchmarks, arquitectura detallada ni composición del dataset de entrenamiento, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), según nomenclatura A3B; detalles no disponibles |
| Parámetros totales | 32.634.904.896 |
| Parámetros activos | ~3.000 millones (inferido de la nomenclatura A3B; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-license (NVIDIA License) |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. La nomenclatura "30B-A3B" es coherente con un transformer de mezcla de expertos con aproximadamente 30.000 millones de parámetros totales y 3.000 millones activos por token, patrón habitual en la familia Nemotron de NVIDIA. Sin embargo, ni la model card original ni la ficha de la cuantización confirman esta interpretación, ni aportan datos sobre número de capas, dimensión oculta, número de expertos o mecanismo de enrutamiento.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La etiqueta `image-generation` indica capacidades multimodales de generación de imágenes, pero se desconoce si el modelo emplea un codificador visual separado, un difusor acoplado o una arquitectura unificada. Todo ello debe considerarse no disponible a efectos de evaluación técnica.

## Capacidades

- Generación de imágenes: el modelo está etiquetado explícitamente como `image-generation`, lo que indica que puede producir imágenes a partir de instrucciones en lenguaje natural.
- Conversación multi-turno: la etiqueta `conversational` sugiere soporte para diálogo, aunque no se detalla la longitud de contexto efectiva.
- Procesamiento en inglés: el único idioma declarado es el inglés, sin evidencia de capacidades multilingües.
- Ejecución local mediante GGUF: compatible con llama.cpp y derivados, lo que permite inferencia en CPU y GPU consumer.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Generación de imágenes en local para prototipado: gracias a las cuantizaciones Q4_K_M (25,5 GB) y Q5_K_M (27,1 GB), un equipo con una GPU de 24-32 GB puede ejecutar el modelo sin depender de servicios en la nube, útil para iterar prompts de diseño antes de pasar a producción.
- Investigación sobre modelos MoE multimodales: la disponibilidad de diez niveles de cuantización permite estudiar el impacto de la compresión en la calidad de generación de imágenes, comparando Q2_K con Q8_0 sobre el mismo conjunto de prompts.
- Despliegue en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en infraestructura propia, encaja en organizaciones que no pueden enviar prompts a APIs externas por motivos regulatorios.
- Creación de contenido visual asistida por diálogo: la etiqueta `conversational` permite integrar el modelo en asistentes que refinan una imagen a lo largo de varios turnos, siempre que se valide empíricamente la coherencia entre turnos.
- Evaluación comparativa de cuantizaciones GGUF: útil para equipos de MLOps que necesitan decidir qué nivel de compresión ofrece la mejor relación calidad/tamaño antes de fijar una configuración de producción.
- Pruebas de concepto en estaciones de trabajo con una sola GPU: la versión Q2_K (18,9 GB) cabe en GPUs de 24 GB y permite validar la viabilidad de un producto antes de invertir en hardware de mayor capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 19 GB (Q2_K) y 35 GB (Q8_0) solo para los pesos; hay que añadir memoria para el contexto y los buffers de inferencia, por lo que conviene reservar un 10-20 % adicional.
- GPU recomendadas: NVIDIA A100 40 GB o 80 GB, H100 80 GB y RTX 6000 Ada 48 GB para las cuantizaciones altas (Q6_K, Q8_0); RTX 4090 24 GB o RTX 3090 24 GB para Q2_K y Q3_K_S; GPUs de 32 GB como la RTX 5090 permiten Q4_K_M con margen ajustado.
- Compatibilidad con GPU consumer: sí, en el rango Q2_K a Q3_K_L para tarjetas de 24 GB; las cuantizaciones Q4 en adelante requieren 32 GB o más.
- Opciones de despliegue: llama.cpp y sus frontales (Ollama, LM Studio, llama-cpp-python); también es posible usar servidores compatibles con GGUF, aunque no se confirma soporte en vLLM o TGI para este formato multimodal concreto.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del backend, del hardware y de si el modelo se ejecuta en CPU o GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (generación de imágenes multimodal de ~30B parámetros) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado mayoritariamente en inglés, es probable que presente sesgos culturales y lingüísticos propios de ese corpus, pero no se confirma.
- Riesgo de alucinación: no cuantificado; en modelos de generación de imágenes el riesgo se manifiesta como fidelidad limitada al prompt y artefactos visuales, no como invención de hechos.
- Limitaciones de idioma: solo se declara inglés, por lo que el rendimiento en castellano no está garantizado y debe validarse empíricamente.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar casos de uso con prompts largos o conversaciones extensas.
- Restricciones de licencia: la NVIDIA License no es una licencia de código abierto permisiva; incluye condiciones específicas sobre uso comercial, redistribución y atribución que deben revisarse antes de integrar el modelo en un producto. La cuantización GGUF hereda la licencia del modelo base.
- Caveat de producción: las cuantizaciones estáticas de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de generación de imágenes; se recomienda Q4_K_M o superior para uso real.
- Caveat de despliegue: el soporte de modelos multimodales en llama.cpp puede requerir versiones recientes y archivos adicionales (proyector visual); la información disponible no confirma que el repositorio incluya dichos componentes.
- Ausencia de benchmarks: sin datos publicados, no es posible comparar objetivamente este modelo con alternativas ni garantizar su calidad en tareas específicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nemotron-Labs-Image-30B-A3B-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Nemotron-Labs-Image-30B-A3B-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
