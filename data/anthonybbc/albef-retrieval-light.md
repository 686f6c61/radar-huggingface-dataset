# anthonybbc/albef-retrieval-light

## Resumen

El modelo `anthonybbc/albef-retrieval-light` es una implementación en PyTorch de la arquitectura ALBEF (Align Before Fuse) orientada a tareas de retrieval visión-lenguaje, publicada por el usuario anthonybbc en Hugging Face. Se trata de una configuración "nano" del modelo original desarrollado por Salesforce Research, que introdujo en 2021 el concepto de alinear representaciones de imagen y texto antes de fusionarlas mediante co-atención, junto con destilación por momentum.

Este repositorio no presenta un modelo entrenado, sino un checkpoint de inicialización válido para pruebas de humo (smoke tests) y un punto de partida experimental. Con solo 16.576 parámetros, es una versión extremadamente reducida que prioriza la transparencia del código y la reproducibilidad sobre el rendimiento. Su relevancia actual radica en servir como base didáctica o de prototipado rápido para quienes quieran entender o extender ALBEF sin la complejidad de los modelos completos.

La model card es explícita: no se reivindica ningún resultado de benchmark, y el checkpoint incluido no ha sido entrenado ni auditado. Por tanto, debe tratarse como material de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBEF (configuración nano) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño ALBEF original: un codificador de visión y un codificador de texto que se alinean antes de fusionarse mediante co-atención (co-attention). En esta implementación nano se emplea atención de consulta agrupada (grouped query attention), activación swish y normalización por lotes (batchnorm). El tamaño reducido (16.576 parámetros) lo convierte en un modelo mínimo, pensado para verificar el flujo de datos y el entrenamiento en entornos con recursos limitados.

El repositorio incluye una receta de entrenamiento por defecto que usa el optimizador novograd con un programa de calentamiento lineal (linear warmup). Sin embargo, la model card aclara que estos son valores iniciales del script, no evidencia de un entrenamiento completado. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. No se especifican datos de entrenamiento, número de tokens ni procesos de alineación como RLHF o DPO.

## Capacidades

- Retrieval visión-lenguaje: el modelo está diseñado para tareas de recuperación de imágenes a partir de texto y viceversa, siguiendo el paradigma ALBEF.
- Implementación funcional: incluye un script `run.py` con un ejemplo ejecutable y un punto de entrada de entrenamiento.
- Reproducibilidad: la configuración de arquitectura (`config.json`) y la receta de entrenamiento (`training_args.json`) están documentadas para repetir experimentos.
- No se reivindican capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes. Al ser un checkpoint sin entrenar, no se puede afirmar ninguna capacidad funcional real más allá de la arquitectura.

## Casos de uso

- Prototipado de investigación: sirve como base para experimentar con la arquitectura ALBEF en tareas de retrieval sin necesidad de recursos de cómputo elevados, gracias a su tamaño mínimo.
- Verificación de pipelines: el checkpoint de inicialización permite probar que el flujo de datos, la carga del modelo y el entrenamiento funcionan correctamente antes de escalar a modelos mayores.
- Educación y aprendizaje: útil para estudiantes o desarrolladores que quieran inspeccionar una implementación limpia de ALBEF y comprender sus componentes (co-atención, grouped query attention, etc.).
- Desarrollo de adaptadores: al ser una implementación personalizada, requiere un adaptador explícito para cargarlo con APIs genéricas; puede usarse para practicar la integración de modelos personalizados en Hugging Face.
- Evaluación metodológica: la model card sugiere evaluar en Flickr30k con al menos tres semillas y una línea base de capacidad equivalente; este modelo puede servir para validar el procedimiento de evaluación.
- Experimentos de ablación: al ser nano, permite aislar el efecto de componentes concretos (por ejemplo, la co-atención) en el rendimiento de retrieval, aunque con resultados no representativos a escala real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reivindica ninguna puntuación y que el checkpoint no está entrenado. Cualquier evaluación futura debe documentarse por separado, con logs de entrenamiento y versiones del entorno.

## Requisitos de hardware

- VRAM estimada: al tener solo 16.576 parámetros, el modelo cabe en cualquier GPU moderna, incluso en las más básicas. Se estima un consumo de memoria inferior a 1 GB en inferencia, aunque no se proporcionan datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso CPU podría ser viable para pruebas de humo.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo (RTX 2060, GTX 1660, etc.) y también en hardware integrado.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito. Se ejecuta mediante el script `run.py` incluido.
- Latencia y throughput: no disponibles. Dado el tamaño, la latencia sería despreciable, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos de la misma categoría porque este checkpoint no está entrenado y no tiene métricas publicadas. El modelo original ALBEF de Salesforce (con cientos de millones de parámetros) es la referencia conceptual, pero sus especificaciones exactas no están disponibles en la información proporcionada. Otros modelos de retrieval visión-lenguaje como CLIP o BLIP no son comparables en tamaño ni en estado de desarrollo. Por tanto, la comparativa se limita a indicar que este modelo es una versión nano y sin entrenar de ALBEF, sin datos cuantitativos.

## Limitaciones y advertencias

- Checkpoint sin entrenar: el archivo `model.safetensors` es una inicialización válida, no un modelo entrenado. No debe usarse para tareas reales de retrieval.
- Sin auditoría de robustez: la model card indica que el checkpoint no ha sido auditado para robustez, equidad ni transferencia de dominio.
- Riesgo de alucinación: no aplica directamente al ser un modelo de retrieval, pero al no estar entrenado, cualquier salida sería arbitraria.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo original ALBEF se entrenó principalmente con datos en inglés, pero esta versión nano no declara nada.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero la model card advierte que deben revisarse los términos de las fuentes de datos externas si se usan datasets como Flickr30k.
- Compatibilidad limitada: al ser una implementación personalizada, las APIs genéricas de Hugging Face no pueden cargarlo sin un adaptador explícito.
- Sin garantías de rendimiento: no hay benchmarks, y la model card recomienda entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias para una evaluación significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anthonybbc/albef-retrieval-light
- Repositorio oficial de ALBEF (Salesforce): https://github.com/salesforce/ALBEF
- Implementación de ALBEF en LAVIS: https://github.com/salesforce/LAVIS/blob/main/lavis/models/albef_models/albef_retrieval.py
- Documentación de arquitectura ALBEF en DeepWiki: https://deepwiki.com/salesforce/ALBEF/1.2-model-architecture
- Perfil del autor en Hugging Face: https://huggingface.co/anthonybbc/models
