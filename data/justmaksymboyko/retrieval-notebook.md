# justmaksymboyko/retrieval-notebook

## Resumen

El repositorio `justmaksymboyko/retrieval-notebook` contiene una implementación compacta y personalizada en PyTorch del modelo **Blip** orientada a tareas de *retrieval* multimodal. El autor, Maksym Boyko, la presenta como una configuración **tiny** pensada para revisión de código, pruebas de humo (*smoke tests*) y experimentos controlados, no como un modelo preentrenado listo para producción. El checkpoint incluido (`model.safetensors`) es un punto de inicialización válido, pero no ha sido entrenado, por lo que no ofrece capacidades reales de inferencia.

La arquitectura declarada es Blip a escala *tiny*, con atención *sparse*, fusión bilinear, activación *approx gelu* y normalización *rmsnorm*. El modelo cuenta con 49.600 parámetros, un tamaño trivial que lo hace adecuado para entornos de desarrollo y aprendizaje. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados. Su relevancia actual radica en servir como referencia técnica para evaluar implementaciones de Blip, depurar pipelines de *retrieval* y estudiar estrategias de inicialización, aunque no debe utilizarse en sistemas productivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Blip (configuración *tiny*) |
| Parámetros totales | 49.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura implementada es una versión reducida de **Blip**, un modelo de visión y lenguaje diseñado para tareas de *retrieval* y generación de descripciones. En esta implementación se emplean componentes específicos: atención *sparse*, fusión bilinear entre modalidades, activación *approx gelu* y normalización *rmsnorm*. La configuración *tiny* reduce drásticamente el número de parámetros, lo que la hace adecuada para pruebas de concepto y análisis de código.

En cuanto al entrenamiento, no se han publicado datos sobre el conjunto de datos utilizado ni sobre el proceso de optimización. El `model.safetensors` incluido es únicamente un checkpoint de inicialización, no un modelo entrenado. La configuración por defecto (`training_args.json`) define una receta experimental con el optimizador **lamb** y una programación de tasa de aprendizaje **cosine**, pero estos valores son puntos de partida y no evidencian que se haya completado una ejecución de entrenamiento. Tampoco se mencionan técnicas de alineación como RLHF o DPO.

## Capacidades

- Propósito declarado: *retrieval* multimodal (imagen-texto) según la model card.
- No es un modelo preentrenado; el checkpoint es de inicialización, por lo que no ofrece capacidades de generación de texto, razonamiento, código, matemáticas o visión en su estado actual.
- Sin soporte de *tool calling*, *function calling*, agentes o razonamiento multi-paso (no disponible).
- Sin capacidades multilingües documentadas (no disponible).
- No incluye modo de pensamiento (*thinking mode*), audio ni visión funcional.
- Puede utilizarse como referencia de implementación para revisar el código de una arquitectura Blip *tiny* y para ejecutar pruebas de humo en entornos de desarrollo.

## Casos de uso

- **Pruebas de humo en pipelines de retrieval multimodal**: el modelo puede cargarse para verificar que el flujo de datos, la tokenización y la extracción de características funcionan antes de integrar un modelo preentrenado de mayor tamaño. Su tamaño reducido acelera el ciclo de depuración.
- **Revisión de código de implementaciones Blip**: al ser una implementación compacta y personalizada, permite a los desarrolladores estudiar la arquitectura, la atención *sparse* y la fusión bilinear en un código legible, sin la complejidad de un modelo completo.
- **Experimentación controlada de arquitecturas**: los investigadores pueden modificar componentes (activación, normalización, tipo de atención) y medir el impacto en tareas sintéticas de *retrieval* con conjuntos de datos pequeños.
- **Evaluación de estrategias de retrieval en pipelines RAG**: el repositorio puede integrarse en flujos de evaluación de RAG, como el descrito en el proyecto de Just-SM, para comparar estrategias densas, híbridas y re-ranking con *cross-encoders*, aunque requeriría un entrenamiento previo.
- **Educación y formación en modelos visión-lenguaje**: el código y la configuración sirven como material didáctico para explicar cómo se construye un modelo Blip desde cero y cómo se organizan los artefactos de un repositorio de Hugging Face.
- **Prototipado rápido de integraciones con Hugging Face**: gracias a su licencia Apache 2.0 y su formato safetensors, permite probar adaptadores y cargadores personalizados sin depender de un modelo pesado, ideal para entornos de CI/CD con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación de evaluación y que el checkpoint incluido no está entrenado, por lo que no existe un rendimiento medible en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente; el tamaño de los pesos es de 49.600 parámetros, un volumen trivial que cabe en cualquier GPU y también en CPU.
- GPU recomendadas: no disponible; cualquier GPU moderna es suficiente para cargar los pesos, aunque la implementación requiere un adaptador explícito para APIs genéricas.
- Compatibilidad con GPU de consumo: sí, por su tamaño minúsculo, pero no se ha validado.
- Opciones de despliegue: no disponible; la model card advierte que las APIs automáticas de carga requieren un adaptador explícito antes de su uso.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría (implementación *tiny* de Blip para *retrieval* con checkpoint sin entrenar). Los modelos Blip preentrenados de referencia, como los publicados por Salesforce, tienen millones de parámetros y están diseñados para producción, por lo que no son directamente comparables.

## Limitaciones y advertencias

- El checkpoint incluido no está entrenado; es solo un punto de inicialización, por lo que no debe usarse para tareas reales de inferencia.
- No ha sido auditado para robustez, equidad (*fairness*) ni transferencia de dominio, tal como indica la model card.
- No se recomienda su uso en producción; es un recurso experimental para desarrollo y pruebas.
- La implementación es personalizada y requiere un adaptador explícito para cargarla con APIs genéricas de Hugging Face.
- No se dispone de datos de entrenamiento, métricas ni benchmarks.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es funcional sin un proceso de entrenamiento previo.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto incluidos en este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/justmaksymboyko/retrieval-notebook
- Perfil del autor: https://huggingface.co/justmaksymboyko/models
- Repositorio relacionado con evaluación de RAG: https://github.com/Just-SM/Evaluation-and-Enhancement-of-RAG-in-Agentic-AI
