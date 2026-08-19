# scottlowry/Ornith-1.5-9B-oQ8e-fp16

## Resumen

Ornith-1.5-9B-oQ8e-fp16 es una cuantización mixta de precisión del modelo Ornith-1.5-9B, realizada por Scott Lowry utilizando la librería oQ (oMLX v0.6.2). El modelo base, desarrollado por Ornith AI, pertenece a una familia de modelos de código abierto orientados a la codificación agéntica, con un enfoque en el auto-scaffolding (construcción automática de andamiajes de razonamiento) y la auto-mejora iterativa. Esta versión cuantizada en 8 bits con grupo de 64 está pensada para despliegue eficiente en entornos Apple Silicon mediante MLX, reduciendo el uso de memoria y acelerando la inferencia sin un sacrificio excesivo de calidad.

La cuantización mantiene el formato de pesos MLX safetensors, lo que la hace directamente utilizable con el ecosistema MLX (mlx-lm, oMLX, etc.). El repositorio ocupa 11.4 GB, aunque el número de parámetros reportado en los safetensors es de 2.975.030.512, una cifra inusualmente baja para un modelo denominado "9B"; es posible que se trate de una cuantización selectiva o de una métrica distinta a la habitual. La ficha no incluye licencia explícita en HuggingFace, pero la página de Ollama para el modelo base indica licencia MIT, globalmente accesible y sin limitaciones regionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del modelo cuantizado) |
| Parametros totales | 2.975.030.512 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en HuggingFace; MIT según página de Ollama para el modelo base |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Ornith-1.5-9B. El tag del modelo cuantizado indica "qwen3_5", lo que sugiere una base derivada de la familia Qwen (posiblemente una variante de Qwen3.5, aunque no existe oficialmente con esa nomenclatura). Según la web de Ornith AI, el modelo introduce un mecanismo de "self-scaffolding" que optimiza conjuntamente el andamiaje de razonamiento y la solución generada, permitiendo al modelo descubrir mejores trayectorias de búsqueda y generar soluciones de mayor calidad. Este enfoque se extiende a un bucle de auto-mejora de extremo a extremo. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de RLHF o DPO en la información recopilada.

## Capacidades

- Generación de código y razonamiento agéntico: el modelo está diseñado para tareas de codificación que requieren planificación multi-paso y ejecución de herramientas.
- Auto-scaffolding: capacidad de construir y refinar su propio andamiaje de razonamiento durante la inferencia, mejorando la calidad de las soluciones.
- Auto-mejora: el modelo puede iterar sobre sus propias soluciones, lo que lo hace adecuado para entornos de agentes autónomos.
- Soporte de tool calling: aunque no se especifica explícitamente, su orientación agéntica implica integración con funciones y APIs.
- Multilingüismo: no se han publicado datos sobre idiomas soportados; se asume que hereda las capacidades de su base Qwen, pero no está confirmado.
- Formato MLX: optimizado para ejecución en hardware Apple Silicon (M-series) mediante la librería MLX.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para sugerencias de código, refactorización y generación de funciones completas, aprovechando su capacidad de razonamiento multi-paso.
- Agente autónomo de resolución de issues: en un pipeline de CI/CD, el modelo puede analizar issues de GitHub, proponer parches y ejecutar tests de forma iterativa, gracias a su bucle de auto-mejora.
- Generación de documentación técnica: a partir de código fuente, el modelo puede generar comentarios, docstrings y documentación de API, manteniendo coherencia con la lógica implementada.
- Tutor de programación: en plataformas educativas, puede explicar conceptos de código, depurar errores y proponer ejercicios personalizados, utilizando su capacidad de razonamiento.
- Automatización de tareas de refactorización: el modelo puede transformar código legacy a nuevas versiones o patrones, evaluando múltiples estrategias antes de aplicar cambios.
- Desarrollo de microservicios: puede generar esqueletos de servicios, endpoints y lógica de negocio a partir de especificaciones en lenguaje natural, reduciendo el tiempo de arranque de proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La página de Ornith AI menciona que el modelo base tiene métricas, pero no se han proporcionado valores concretos en la búsqueda web ni en la model card de esta cuantización. Se recomienda consultar la documentación oficial de Ornith-1.5 para obtener datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada: con cuantización de 8 bits y 11.4 GB de tamaño de repo, la inferencia en MLX requiere aproximadamente 12 GB de memoria unificada en Apple Silicon (considerando overhead). En GPU NVIDIA, sería necesario convertir los pesos a otro formato (por ejemplo, GGUF) y la VRAM rondaría los 10-12 GB.
- GPU recomendadas: Apple M1 Pro/Max o superior (debido al formato MLX). En hardware NVIDIA, se podría usar una RTX 3080/3090 o A100, tras conversión.
- Compatibilidad con GPU de consumo: sí, en Apple Silicon con al menos 16 GB de RAM unificada; en PC con GPU de 12 GB VRAM es viable.
- Opciones de despliegue: mlx-lm, oMLX (para Apple Silicon); para otros entornos, se puede convertir a GGUF y usar llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos específicos para esta cuantización. En MLX, la inferencia de modelos de 9B suele lograr decenas de tokens por segundo en chips M2/M3 Pro.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo para esta cuantización específica. Como referencia, el modelo base Ornith-1.5-9B compite con otros modelos de codificación agéntica de tamaño similar, como Qwen2.5-Coder-7B, DeepSeek-Coder-6.7B o CodeLlama-7B. Sin embargo, no hay información suficiente para establecer una comparación cuantitativa fiable. La ventaja principal de esta versión es su formato MLX optimizado para Apple Silicon, que no está disponible en los modelos mencionados de forma nativa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una cuantización de un modelo base sin datos adicionales, se heredan los sesgos y riesgos de alucinación del modelo original, que no han sido documentados en la información disponible.
- Pérdida de precisión: la cuantización a 8 bits puede degradar ligeramente la calidad de las respuestas en tareas de razonamiento complejo, aunque con group size 64 se espera un impacto mínimo.
- Compatibilidad limitada: el formato MLX safetensors solo es utilizable directamente en ecosistemas Apple Silicon; para otros entornos se requiere conversión, lo que puede introducir incompatibilidades.
- Licencia incierta: aunque la página de Ollama indica MIT para el modelo base, la model card de HuggingFace no especifica licencia, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor o a Ornith AI para confirmar.
- Contexto no documentado: no se ha publicado la longitud de contexto soportada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Soporte de herramientas no confirmado: aunque su orientación agéntica sugiere tool calling, no hay documentación explícita al respecto en la información recopilada.

## Enlaces

- HuggingFace del modelo cuantizado: https://huggingface.co/scottlowry/Ornith-1.5-9B-oQ8e-fp16
- Página de modelos cuantizados de Ornith-1.5-9B: https://huggingface.co/models?other=base_model:quantized:ornith-ai/Ornith-1.5-9B
- Anuncio oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI (modelos, VRAM, benchmarks): https://ornith.online/
- Página de Ollama para ornith:9b: https://ollama.com/library/ornith:9b
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
