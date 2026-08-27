# Aaravpat/blip-multitask-sandbox

## Resumen

Este repositorio contiene una implementación personalizada de **BLIP** (Bootstrapping Language-Image Pre-training) orientada a tareas multitarea, con una configuración de escala **nano** (16.576 parámetros). El autor, Aaravpat, lo publica bajo licencia BSD-3-Clause como un punto de partida experimental: el checkpoint incluido (`model.safetensors`) es de inicialización, no un modelo entrenado, y se presenta explícitamente como material para pruebas de humo y desarrollo.

La relevancia de este modelo es principalmente didáctica y de base para investigación: permite estudiar la arquitectura BLIP en una versión mínima, con atención dispersa, fusión por concatenación con MLP, activación swish y normalización groupnorm. No se reclama ningún resultado de benchmark, y el autor recomienda entrenar desde cero con un protocolo de evaluación riguroso antes de cualquier uso práctico. No hay información sobre idiomas soportados, longitud de contexto ni capacidades funcionales, ya que el checkpoint no ha sido entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Blip (configuracion nano) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una implementación personalizada de BLIP en escala nano, con atención dispersa (sparse attention), fusión mediante concatenación seguida de MLP, activación swish y normalización groupnorm. El repositorio incluye `config.json` con la configuración generada y `training_args.json` con una receta experimental por defecto (SGD con warmup lineal), pero estos valores son solo puntos de partida, no evidencia de un entrenamiento completado.

No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens, ni técnicas como RLHF o DPO. El checkpoint `model.safetensors` es un estado de inicialización válido para pruebas de humo, no un modelo entrenado. El autor indica que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito.

## Capacidades

- No se han demostrado capacidades funcionales, ya que el checkpoint no está entrenado.
- La arquitectura BLIP está diseñada para tareas de visión-lenguaje (captioning, VQA, retrieval), pero este modelo concreto no las implementa de forma operativa.
- El repositorio incluye un script `model.py` con un ejemplo ejecutable y un bloque `__main__` para pruebas de humo.
- No hay soporte declarado para tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües.

## Casos de uso

- **Estudio de la arquitectura BLIP**: los desarrolladores pueden inspeccionar el código de `model.py` para comprender cómo se implementa la atención dispersa, la fusión concat-MLP y la normalización groupnorm en una configuración mínima.
- **Pruebas de humo en pipelines de CI**: el checkpoint de inicialización permite verificar que el código carga, ejecuta una pasada forward y produce salidas sin errores, antes de integrar cambios.
- **Base para experimentos de entrenamiento desde cero**: con solo 16.576 parámetros, es viable entrenar en una GPU doméstica para estudiar dinámicas de aprendizaje en modelos pequeños.
- **Comparación de recetas de entrenamiento**: el autor sugiere usar `training_args.json` como punto de partida y comparar con otras configuraciones (optimizadores, schedulers) manteniendo la misma exposición a datos.
- **Desarrollo de adaptadores para librerías estándar**: al ser una implementación personalizada, se puede practicar la escritura de adaptadores para cargar el modelo con HuggingFace Transformers u otras herramientas.
- **Validación de protocolos de evaluación**: el repositorio recomienda evaluar con conjuntos held-out, múltiples semillas y líneas base de capacidad equivalente, lo que sirve como ejercicio metodológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no es un modelo entrenado.

## Requisitos de hardware

- Con solo 16.576 parámetros, el modelo cabe en cualquier GPU moderna e incluso en CPU sin problemas de memoria.
- VRAM estimada: inferior a 1 GB en cualquier precisión (fp32, fp16, etc.).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también funciona en entornos sin GPU.
- Opciones de despliegue: al ser una implementación personalizada, no se puede usar directamente con vLLM, llama.cpp, Ollama o TGI sin un adaptador previo.
- Latencia y throughput: no disponibles, pero se espera que sean despreciables dado el tamaño mínimo del modelo.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un checkpoint de inicialización sin entrenar y con una configuración nano específica. Los modelos BLIP de Salesforce (como BLIP-base o BLIP3-o) tienen escalas mucho mayores y están entrenados, por lo que no son comparables directamente.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio; no debe usarse en producción.
- No se garantiza ningún comportamiento funcional: el modelo no puede generar texto, responder preguntas ni procesar imágenes de forma útil.
- La implementación es personalizada y no compatible con APIs genéricas de carga automática; se requiere un adaptador explícito.
- No hay información sobre sesgos, alucinación o limitaciones de contexto, ya que el modelo no tiene capacidades reales.
- La licencia BSD-3-Clause permite uso comercial, pero el autor advierte que deben revisarse los términos de los datos externos si se usan con otros conjuntos de datos.
- Los resultados de un futuro entrenamiento deben documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- [HuggingFace - Aaravpat/blip-multitask-sandbox](https://huggingface.co/Aaravpat/blip-multitask-sandbox)
- [GitHub - salesforce/BLIP (implementación original)](https://github.com/salesforce/BLIP)
- [GitHub - salesforce/LAVIS (librería que integra BLIP)](https://github.com/salesforce/LAVIS)
- [Paper BLIP3-o: A Family of Fully Open Unified Multimodal Models](https://arxiv.org/html/2505.09568v1)
- [Artículo divulgativo sobre BLIP en GeeksforGeeks](https://www.geeksforgeeks.org/artificial-intelligence/understanding-blip-a-huggingface-model/)
