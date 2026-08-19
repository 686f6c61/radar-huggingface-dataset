# brainworkup/LFM2.5-1.2B-Thinking-MLX-oQ8e

## Resumen

Este repositorio contiene una cuantización en 8 bits del modelo LFM2.5-1.2B-Thinking de Liquid AI, realizada por el usuario brainworkup mediante la herramienta oQ (oMLX v0.6.2) con precisión mixta. El modelo original, desarrollado por Liquid AI, es un modelo de razonamiento de 1.2B parámetros optimizado para tareas de matemáticas, lógica y resolución de problemas multi-paso, diseñado específicamente para ejecutarse en dispositivos edge con un consumo de memoria inferior a 900 MB. Esta versión cuantizada en formato MLX safetensors permite su uso directo en entornos Apple Silicon (macOS, iOS, iPadOS) mediante el framework MLX, facilitando la inferencia on-device con bajo footprint.

La relevancia de este modelo radica en su capacidad para ofrecer razonamiento avanzado en dispositivos con recursos limitados, algo que hasta hace poco requería infraestructura de centro de datos. La cuantización en 8 bits con group size 64 mantiene un equilibrio entre calidad y eficiencia, reduciendo el tamaño del modelo a 1.2 GB en disco. Cabe señalar que los archivos safetensors reportan 329.251.584 parámetros, una cifra que difiere del nombre del modelo original (1.2B); esta discrepancia podría deberse a cómo se contabilizan los pesos en el formato MLX o a una posible poda, aunque no se dispone de información adicional al respecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer optimizado para edge (familia LFM2.5 de Liquid AI) |
| Parametros totales | 329.251.584 (segun safetensors; el nombre del modelo indica 1.2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit, group size 64 (oQ/oMLX v0.6.2) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Thinking emplea la arquitectura LFM2.5 de Liquid AI, una evolución de su diseño previo orientado a despliegue en dispositivos edge. Aunque no se detallan públicamente los componentes internos exactos, se sabe que es un transformer optimizado para eficiencia computacional y baja latencia, con un entrenamiento especializado en razonamiento encadenado (chain-of-thought). El entrenamiento original se centró en mejorar el rendimiento en matemáticas, lógica y problemas que requieren múltiples pasos de razonamiento, priorizando la calidad de salida en tareas de inferencia compleja.

La cuantización aplicada por brainworkup utiliza oQ (oMLX v0.6.2), una herramienta de cuantización de precisión mixta para el framework MLX. Con 8 bits y group size 64, se reduce el tamaño del modelo respecto a la versión original de 16 bits, manteniendo un buen equilibrio entre fidelidad y eficiencia. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Razonamiento matemático: resolución de problemas aritméticos, algebraicos y de lógica formal con alta precisión para su tamaño.
- Razonamiento multi-paso: capacidad de descomponer problemas complejos en pasos intermedios y encadenar inferencias.
- Inferencia on-device: diseñado para ejecutarse en dispositivos con recursos limitados, como teléfonos móviles, con un consumo de memoria inferior a 900 MB.
- Eficiencia computacional: optimizado para baja latencia y alto throughput en hardware edge.
- Compatibilidad con MLX: al estar en formato MLX safetensors, se integra nativamente con el ecosistema de Apple (macOS, iOS, iPadOS).
- No se dispone de información sobre soporte de tool calling, capacidades multimodales, visión o audio en este modelo.

## Casos de uso

- Asistentes personales offline: el modelo puede gestionar conversaciones de razonamiento sin conexión en smartphones, gracias a su bajo consumo de memoria (menos de 900 MB) y su optimización para dispositivos edge.
- Tutoría educativa de matemáticas: al estar especializado en razonamiento matemático y lógico, es adecuado para aplicaciones de aprendizaje que expliquen paso a paso la resolución de problemas.
- Automatización de soporte técnico: puede procesar consultas de usuarios que requieren lógica deductiva o diagnósticos multi-paso, integrándose en chatbots de atención al cliente en entornos con restricciones de hardware.
- Procesamiento de lenguaje natural en IoT: dispositivos con microcontroladores o sistemas embebidos pueden beneficiarse de su capacidad de razonamiento para tareas de clasificación, extracción de información o toma de decisiones.
- Generación de explicaciones técnicas: puede redactar respuestas detalladas y estructuradas para preguntas de dominio específico, útil en documentación automatizada o sistemas de preguntas y respuestas.
- Prototipado rápido en investigación: al ser un modelo pequeño y cuantizado, permite experimentar con técnicas de razonamiento en entornos de desarrollo sin necesidad de GPUs de alto rendimiento, usando únicamente CPU o hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog de Liquid AI menciona que el modelo original ofrece "la mejor calidad para su tamaño" y "la inferencia más rápida", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros estándares. Se recomienda consultar la documentación oficial de Liquid AI para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada: el modelo original cabe en 900 MB de memoria según Liquid AI; la versión cuantizada en 8 bits ocupa 1.2 GB en disco, por lo que se estima que la inferencia requiere menos de 1 GB de RAM/VRAM.
- GPU recomendadas: al estar en formato MLX, está optimizado para Apple Silicon (M1, M2, M3 y superiores). No está pensado para GPUs NVIDIA, aunque podría convertirse a otros formatos (por ejemplo, GGUF) para su uso con llama.cpp en hardware diverso.
- Compatibilidad con consumer GPU: sí, cualquier Mac con Apple Silicon puede ejecutarlo; también es viable en sistemas con CPU convencional si se convierte a formato adecuado.
- Opciones de despliegue: MLX (framework nativo de Apple), posible conversión a GGUF para llama.cpp u Ollama, o a safetensors estándar para vLLM/TGI (requiere adaptación).
- Latencia y throughput: no se dispone de datos concretos; el blog de Liquid indica que es el más rápido de su categoría, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (este) | 1.2B (según nombre) | no disponible | Razonamiento matemático y lógico | no disponible |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Instrucciones generales y razonamiento | Apache 2.0 |
| Phi-3-mini (3.8B) | 3.8B | 4K | Razonamiento y código | MIT |
| Llama-3.2-1B | 1B | 128K | Instrucciones generales | Llama 3.2 Community License |

La comparativa se basa en información pública general; no se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. LFM2.5 se diferencia por su optimización específica para edge y razonamiento, mientras que las alternativas tienen contextos más largos o licencias más permisivas.

## Limitaciones y advertencias

- Licencia no disponible: el repositorio no especifica la licencia, lo que impide determinar si su uso comercial está permitido. Se recomienda contactar al autor o consultar el modelo original de Liquid AI para aclarar los términos.
- Idiomas no especificados: no se indica qué idiomas soporta; probablemente esté entrenado principalmente en inglés, pero no hay confirmación.
- Longitud de contexto desconocida: no se ha publicado el tamaño de la ventana de contexto, lo que limita su uso en tareas que requieran manejar documentos largos.
- Riesgo de alucinación: al ser un modelo de razonamiento, puede generar respuestas coherentes pero incorrectas en dominios fuera de su entrenamiento; se recomienda validación humana en aplicaciones críticas.
- Sesgos no documentados: no se han publicado evaluaciones de sesgos; podría presentar estereotipos o comportamientos no deseados.
- Discrepancia en el número de parámetros: los safetensors reportan 329M mientras el nombre indica 1.2B; esto podría deberse a una poda o a un error de etiquetado, y afecta a las expectativas de rendimiento.
- Dependencia de MLX: al estar en formato MLX, su uso queda restringido al ecosistema Apple; para otros entornos requiere conversión, lo que puede introducir pérdida de calidad.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/brainworkup/LFM2.5-1.2B-Thinking-MLX-oQ8e
- Modelo original en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Versión MLX 8-bit oficial de Liquid: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-MLX-8bit
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking
- Blog de Liquid AI sobre el modelo: https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb
- Blog de Liquid AI sobre la familia LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
