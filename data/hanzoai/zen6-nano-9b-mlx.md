# hanzoai/zen6-nano-9b-mlx

## Resumen

Zen 6 Nano (9B) es un modelo multimodal de tipo image-text-to-text desarrollado por Hanzo AI en colaboración con Zen LM. Se distribuye en formato MLX nativo para Apple Silicon, con pesos cuantizados a 2 bits mediante una técnica de cuantización ternaria afín basada en transformada de Hadamard, e incluye una torre de visión en FP16. El repositorio contiene además un directorio `runtime/` con utilidades específicas para cargar el modelo y procesar la multimodalidad en entornos macOS con chips M1, M2, M3 y M4 Max.

El modelo parte de una base denominada `zen6-nano` (identificada en la model card como una variante de 9B), sobre la que se ha aplicado un proceso de Quantization-Aware Training (QAT) con estimador de gradiente recto (STE) en base Hadamard para obtener los parámetros ternarios que contiene `model.safetensors`. Según el autor, los pesos preservan la identidad del modelo original y las capacidades agénticas de tool calling mediante etiquetas `<tool_call>` compatibles con Hanzo MCP.

La relevancia de esta ficha radica en que se trata de un modelo con muy poca tracción pública (0 descargas y 0 likes en el momento de la consulta) y una model card extremadamente escueta, por lo que la mayor parte de los datos técnicos habituales (composición del dataset, benchmarks, idiomas soportados) no están disponibles. Aun así, el interés técnico está en su propuesta de cuantización ternaria de 2 bits para Apple Silicon y en la integración de visión y tool calling en un único artefacto MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal image-text-to-text con torre de visión; no se especifica el tipo de transformer subyacente) |
| Parametros totales | 9.410.903.280 (9,41 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2 bits ternario con cuantización afín y transformada de Hadamard (QAT con STE); torre de visión en FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con runtime Python auxiliar en `runtime/` |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del transformer base ni el número de capas, dimensiones ocultas o mecanismo de atención. Lo que sí se explicita es que el modelo es multimodal (pipeline `image-text-to-text`), con una torre de visión separada en FP16 y un cuerpo de lenguaje cuantizado a 2 bits mediante una variante ternaria de cuantización afín en base Hadamard. El proceso de obtención de los pesos se describe como un QAT post-entrenamiento con estimador de gradiente recto (STE) sobre los parámetros del modelo `zen6-nano` original.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones adicionales como decodificación especulativa o atención lineal. La model card únicamente menciona que los pesos preservan la "identidad Zen 6" y las capacidades agénticas de tool calling mediante etiquetas `<tool_call>` compatibles con Hanzo MCP, lo que sugiere un ajuste específico para uso agéntico, pero sin más detalle técnico verificable.

## Capacidades

- Generación de texto conversacional en formato multimodal image-text-to-text.
- Procesamiento de imágenes junto con texto (torre de visión en FP16).
- Tool calling / function calling mediante etiquetas `<tool_call>` compatibles con Hanzo MCP.
- Capacidades agénticas orientadas a flujos multi-paso, según la model card.
- Ejecución nativa en Apple Silicon mediante MLX, con runtime propio para carga del modelo y del procesador multimodal.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede desplegarse íntegramente en un equipo Apple Silicon gracias a su formato MLX de 2 bits y su runtime nativo, lo que permite conversaciones multi-turno sin depender de la nube.
- Automatización agéntica con MCP: al soportar tool calling mediante `<tool_call>` y estar integrado con Hanzo MCP, puede utilizarse para orquestar llamadas a herramientas externas en flujos de trabajo multi-paso.
- Análisis de capturas de pantalla y documentos escaneados: la torre de visión en FP16 permite enviar imágenes junto a instrucciones de texto para extraer información o resumir contenido visual.
- Prototipado rápido de aplicaciones multimodales en macOS: el script `quickstart.py` y el cargador `load_vl_model` del directorio `runtime/` facilitan la integración en notebooks y scripts de investigación sin infraestructura adicional.
- Evaluación de cuantización ternaria: investigadores interesados en técnicas de 2 bits con Hadamard y QAT pueden usar este artefacto como referencia práctica para estudiar el equilibrio entre tamaño y calidad en Apple Silicon.
- Pruebas de concepto de asistentes con visión y herramientas: adecuado para validar pipelines que combinen imagen, texto y llamadas a funciones antes de escalar a modelos mayores o a infraestructura GPU.
- Despliegue en entornos con restricciones de memoria: el tamaño del repositorio (3,6 GB) y la cuantización a 2 bits permiten ejecutar el modelo en equipos con memoria unificada limitada, algo inviable con pesos en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 3,6 GB, por lo que se requiere al menos esa cantidad de memoria unificada para cargar los pesos, más el overhead del runtime MLX y de la torre de visión en FP16.
- GPU recomendadas: chips Apple Silicon M1, M2, M3 y M4 Max, según la model card. No se menciona soporte para GPU NVIDIA ni AMD.
- Compatibilidad con GPU de consumo: sí, en el ecosistema Apple Silicon; no se indica compatibilidad con RTX 4090 u otras GPU de consumo convencionales.
- Opciones de despliegue: MLX con el runtime incluido en el repositorio (`runtime/vision_artifact.py`, `quickstart.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (multimodales de ~9B en formato MLX de 2 bits) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia pública de validación por parte de la comunidad.
- La model card es muy escueta y no documenta el dataset de entrenamiento, los idiomas soportados, la longitud de contexto ni los benchmarks, lo que dificulta evaluar su calidad real.
- La cuantización ternaria de 2 bits puede degradar la calidad respecto al modelo original `zen6-nano`; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación no cuantificado: al no haber benchmarks ni evaluaciones independientes, no es posible estimar la fiabilidad factual del modelo.
- Sin información sobre sesgos conocidos ni sobre mitigaciones aplicadas durante el entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar el archivo `NOTICE` para verificar las atribuciones de componentes upstream.
- Dependencia del ecosistema Apple Silicon y de MLX: no es directamente portable a otras plataformas sin conversión adicional.
- El soporte de tool calling se describe mediante etiquetas `<tool_call>` y Hanzo MCP, pero no se documenta el formato exacto ni la robustez del parseo en producción.
- Fecha de creación del repositorio (2026-11-15) y ausencia de actualizaciones posteriores: no hay historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/hanzoai/zen6-nano-9b-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
