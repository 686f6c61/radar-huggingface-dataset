# nernstpolga/new_4_5fzvat7wxi

## Resumen

El modelo `nernstpolga/new_4_5fzvat7wxi` es un sistema multimodal (image-text-to-text) de 34.660.610.688 parámetros (~34,7B), desarrollado por el usuario Nernst Polga. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) basado en la familia Qwen 3.5, con entrenamiento adicional mediante GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo que mejora el razonamiento y la alineación con preferencias humanas. El repositorio indica que parte de un modelo base `vera6/affine-5g4yy75zuz-t6` y está etiquetado como conversacional, lo que sugiere un uso orientado a diálogo y asistencia con entrada de imagen y texto.

La relevancia de este modelo reside en su combinación de arquitectura MoE (eficiencia en inferencia) con capacidades multimodales, dentro del ecosistema Qwen 3.5. Aunque es un lanzamiento reciente (agosto de 2026) con cero descargas y acceso restringido (gated), su diseño apunta a tareas de razonamiento visual y conversacional en entornos de producción. La licencia Apache 2.0 permite uso comercial, pero el acceso gated exige aceptar condiciones adicionales en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen 3.5, multimodal (imagen y texto) |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un MoE derivado de Qwen 3.5, lo que implica un conjunto de expertos activados de forma dispersa por token. El tag `affine` sugiere una variante con transformaciones afines en las capas internas, aunque no se detalla su implementación exacta. El modelo procesa entradas de imagen y texto (pipeline `image-text-to-text`), por lo que integra un codificador visual y un decodificador de lenguaje. El entrenamiento incluye una etapa de fine-tuning sobre el modelo base `vera6/affine-5g4yy75zuz-t6` y posterior optimización con GRPO, técnica de RL que ajusta los pesos para maximizar recompensas de preferencia en tareas de razonamiento y diálogo. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto en contexto de conversación y asistencia.
- Comprensión y descripción de imágenes (entrada visual).
- Razonamiento multimodal combinando texto e imagen.
- Capacidad de diálogo multi-turno (etiquetado como conversacional).
- Entrenado con GRPO, lo que sugiere mejora en tareas de razonamiento y alineación con preferencias humanas.
- No se confirma explícitamente soporte de tool calling, function calling ni agentes en la información disponible.

## Casos de uso

- **Asistencia visual en atención al cliente**: el modelo puede recibir capturas de pantalla o fotos de productos y responder con instrucciones o diagnósticos, gracias a su capacidad multimodal y de conversación.
- **Análisis de documentos con imágenes**: extraer información de facturas, informes o gráficos combinando texto e imagen en un solo prompt, útil para automatizar tareas de back-office.
- **Generación de descripciones de contenido**: crear texto alternativo o metadatos para imágenes en e-commerce o plataformas de contenido, reduciendo trabajo manual.
- **Soporte técnico remoto**: un usuario envía una foto de un error de pantalla o configuración y el modelo ofrece pasos de resolución en un diálogo multi-turno.
- **Asistente de accesibilidad**: describir entornos visuales para personas con discapacidad visual, mediante un interfaz de chat.
- **Prototipado rápido de aplicaciones multimodales**: servir como base para sistemas de QA visual o chatbots con imágenes, dado su tamaño intermedio y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con 34,7B parámetros, en FP16 se requieren aproximadamente 70 GB de VRAM (un A100 de 80 GB o H100). Con cuantización de 4 bits (GGUF o AWQ) se reduce a ~18 GB, lo que permitiría ejecutarlo en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- **GPU recomendadas**: A100 (80 GB), H100 (80 GB) para FP16; RTX 4090/3090 con cuantización.
- **Compatibilidad con consumer GPU**: sí, con cuantización de 4 bits o menos (por ejemplo, Q4_K_M) en GPUs con 24 GB de VRAM.
- **Opciones de despliegue**: al usar Transformers, se puede servir con vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierten los pesos a GGUF). También es compatible con endpoints de HuggingFace (tag `endpoints_compatible`).
- **Latencia y throughput**: no disponible; dependerá del hardware y de la cuantización. Un MoE de 34B suele tener inferencia más rápida que un dense del mismo tamaño, pero no se aportan datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la búsqueda realizada. El tag `qwen3_5_moe` sugiere que pertenece a la familia Qwen 3.5, pero no se publican datos de comparación con otros modelos MoE multimodales como Qwen2-VL, LLaVA o InternVL en el contexto de este lanzamiento.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es gated, por lo que requiere aceptar condiciones en HuggingFace; el uso comercial está sujeto a los términos del repositorio.
- **Sin información de sesgos**: no se han publicado estudios de sesgos o evaluación de seguridad, por lo que puede presentar sesgos inherentes a los datos de entrenamiento.
- **Riesgo de alucinación**: al ser un modelo de lenguaje multimodal, puede generar descripciones inexactas de imágenes o inventar datos cuando se le piden hechos.
- **Contexto y idiomas**: no se especifica la longitud de contexto ni los idiomas soportados, lo que limita su uso en aplicaciones multilingües o de contexto largo.
- **Sin benchmarks**: no hay métricas de rendimiento publicadas, por lo que no se puede comparar objetivamente con otros modelos.
- **Soporte de tool calling**: no se confirma, lo que limita su uso en agentes autónomos con herramientas externas.
- **Tamaño del repositorio**: 70,2 GB en safetensors, requiere almacenamiento y ancho de banda significativos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nernstpolga/new_4_5fzvat7wxi)
- [Perfil del autor](https://huggingface.co/nernstpolga)
- No se encontraron papers, blogs o demos asociados en la búsqueda web.
