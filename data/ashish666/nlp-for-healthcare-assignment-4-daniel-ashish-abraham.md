# Ashish666/NLP-for-Healthcare-Assignment-4-Daniel-Ashish-Abraham

## Resumen

Este repositorio contiene los puntos de control (checkpoints) de un trabajo académico de la asignatura "NLP for Healthcare" (CL3.411) del IIIT Hyderabad, centrado en la generación automática de informes de radiología a partir de radiografías de tórax. No se trata de un modelo fundacional nuevo, sino de un sistema multimodal compuesto por un codificador visual CLIP ViT-B/16 congelado, un conector MLP de dos capas entrenable y un decodificador de lenguaje Qwen2.5-0.5B-Instruct congelado al que se le aplica un adaptador LoRA de rango 8 sobre las proyecciones de auto-atención.

El objetivo del sistema es transformar una imagen de radiografía de tórax en texto descriptivo en inglés, siguiendo el paradigma típico de los modelos visión-lenguaje (VLM) con alineamiento mediante un conector ligero. El entrenamiento se estructura en dos etapas: una primera fase de alineamiento del conector (1,7 M de parámetros entrenables) y una segunda fase "compliant" que combina el conector con el adaptador LoRA (1,08 M de parámetros entrenables adicionales).

Su relevancia es limitada fuera del ámbito docente: el repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB (solo pesos de conector y adaptador, sin los pesos base). Resulta útil como referencia de implementación de un pipeline VLM médico con PEFT, pero no está pensado ni validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM compuesto: CLIP ViT-B/16 (vision, congelado) + conector MLP 2 capas (768 → 1024 → 896) + Qwen2.5-0.5B-Instruct (LLM, congelado) con LoRA en atención |
| Parametros totales | No disponible (solo se publican los pesos entrenables: 1.705.856 del conector stage 1 y 1.081.344 del adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen2.5-0.5B-Instruct, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA), .pt (checkpoints del conector) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clásico de conector intermedio para VLM: un codificador visual CLIP ViT-B/16 (openai/clip-vit-base-patch16) extrae características de la radiografía; un perceptrón multicapa de dos capas (768 → 1024 → 896) proyecta esas características al espacio de embeddings del LLM; y Qwen2.5-0.5B-Instruct genera el informe token a token. Tanto el codificador visual como el LLM permanecen congelados durante todo el entrenamiento.

El entrenamiento se divide en dos etapas. La etapa 1 entrena únicamente el conector (1.705.856 parámetros entrenables), alcanzando una mejor pérdida de validación de 2,15354. La etapa 2 "compliant" reentrena el conector (mejor pérdida de validación 1,80342) y añade un adaptador LoRA de rango 8 y alpha 16 sobre las proyecciones q_proj, k_proj, v_proj y o_proj de las 24 capas del decodificador, con 1.081.344 parámetros entrenables. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto a partir de imágenes de radiografía de tórax (image-to-text) en inglés.
- Descripción de hallazgos radiológicos mediante un decodificador instruido (Qwen2.5-0.5B-Instruct).
- Alineamiento visión-lenguaje mediante conector MLP entrenable.
- Ajuste fino eficiente con LoRA sobre atención (q, k, v, o) en las 24 capas del LLM.
- Capacidades heredadas del LLM base (Qwen2.5-0.5B-Instruct): generación de texto e instrucciones básicas, aunque no se documentan explícitamente en este repositorio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking".

## Casos de uso

- Docencia y reproducción de pipelines VLM médicos: sirve como ejemplo completo de conector + LoRA sobre un LLM pequeño para tareas de captioning radiológico, útil en asignaturas de NLP clínico.
- Prototipado de generación de informes de tórax: permite experimentar con la arquitectura CLIP + MLP + Qwen2.5-0.5B en entornos con recursos limitados, dado el reducido número de parámetros entrenables.
- Investigación en PEFT aplicado a dominio médico: el adaptador LoRA de rango 8 sobre atención es un punto de partida para estudiar el impacto del ajuste eficiente en la calidad de los informes.
- Benchmarking de conectores: los dos checkpoints del conector (stage 1 y stage 2) permiten comparar el efecto del alineamiento previo frente al entrenamiento conjunto con LoRA.
- Experimentos de alineamiento visión-lenguaje a pequeña escala: útil para validar recetas de congelación del codificador y del LLM en tareas image-to-text.
- Base para fine-tuning posterior en datasets propios de radiología: el adaptador y el conector pueden reutilizarse como inicialización en experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos numéricos reportados son las pérdidas de validación del entrenamiento:

| Etapa | Componente | Parámetros entrenables | Mejor pérdida de validación |
|---|---|---|---|
| Stage 1 | Conector MLP | 1.705.856 | 2,15354 |
| Stage 2 (compliant) | Conector MLP | No especificado | 1,80342 |
| Stage 2 (compliant) | LoRA atención | 1.081.344 | No especificado |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al combinar CLIP ViT-B/16 (~86 M de parámetros) y Qwen2.5-0.5B-Instruct (~0,5 B), el sistema completo es ligero y probablemente quepa en GPUs de consumo, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponible; por el tamaño del LLM base, una GPU consumer de gama media sería suficiente en teoría, aunque no se documenta.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del decodificador (0,5 B), pero no confirmado en la información disponible.
- Opciones de despliegue: no disponible; al usar safetensors y PEFT, sería compatible con stacks que soporten LoRA (por ejemplo, transformers + PEFT), pero no se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento frente a alternativas de la misma categoría (VLM médicos para generación de informes de tórax).

## Limitaciones y advertencias

- Repositorio académico: no es un modelo validado clínicamente ni apto para uso diagnóstico.
- Solo contiene pesos del conector y del adaptador LoRA; requiere descargar por separado openai/clip-vit-base-patch16 y Qwen/Qwen2.5-0.5B-Instruct para reconstruir el sistema.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en dominio médico.
- No se documentan sesgos conocidos, composición del dataset ni procedencia de las radiografías de entrenamiento.
- Longitud de contexto, cuantizaciones y requisitos de hardware no especificados.
- Licencia apache-2.0 permite uso comercial según los términos de la licencia, pero la ausencia de validación clínica desaconseja cualquier aplicación en producción sanitaria.
- Sin descargas ni likes: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ashish666/NLP-for-Healthcare-Assignment-4-Daniel-Ashish-Abraham
- Modelo base LLM: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base visual: https://huggingface.co/openai/clip-vit-base-patch16
- Perfil del autor: https://huggingface.co/Ashish666
