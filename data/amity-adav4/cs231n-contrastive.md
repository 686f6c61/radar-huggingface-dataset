# amity-adav4/cs231n-contrastive

## Resumen

El repositorio `amity-adav4/cs231n-contrastive` contiene una implementación de **Coca** (Contrastive Captioners) para aprendizaje contrastivo, desarrollada por el usuario `amity-adav4` como parte de un proyecto asociado al curso CS231n de Stanford. Se trata de un trabajo de código abierto con licencia BSD-3-Clause que prioriza la transparencia del código y la reproducibilidad mediante pruebas de humo, en lugar de reclamar resultados de benchmarks.

El modelo se describe como una configuración "huge" de Coca, con atención flash, fusión Tucker, activación ReLU y normalización InstanceNorm. Sin embargo, el checkpoint incluido (`model.safetensors`) tiene únicamente **33.088 parámetros**, un tamaño extremadamente reducido que indica que es un checkpoint de inicialización para pruebas, no un modelo entrenado. El repositorio no presenta ningún resultado de evaluación ni afirmación de rendimiento.

La relevancia de este proyecto es principalmente educativa y experimental: sirve como punto de partida para quienes quieran entender o extender la arquitectura Coca en el contexto del aprendizaje contrastivo, pero no está pensado para uso en producción ni para tareas reales de visión o lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (Contrastive Captioners) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura implementada es **Coca**, un modelo que combina un codificador de imagen y un decodificador de texto mediante una pérdida contrastiva, similar a CLIP pero con capacidades generativas adicionales. La configuración declarada incluye atención flash, fusión Tucker, activación ReLU y normalización InstanceNorm, aunque el tamaño real de parámetros (33K) sugiere que se trata de una versión reducida para pruebas de humo, no de la escala "huge" típica de los modelos de producción.

El repositorio incluye un `config.json` con la configuración de arquitectura generada y un `training_args.json` con la receta de entrenamiento por defecto: optimizador AdamW con programación de tasa de aprendizaje one-cycle. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El checkpoint `model.safetensors` es un checkpoint de inicialización válido para ejecutar las pruebas de humo, pero no ha sido entrenado con datos reales.

## Capacidades

- **Implementación de Coca para aprendizaje contrastivo**: el código proporciona una implementación funcional de la arquitectura, con un script `train.py` que incluye un ejemplo ejecutable.
- **Atención flash**: la configuración declara el uso de atención flash, lo que puede mejorar la eficiencia en GPUs compatibles.
- **Fusión Tucker**: mecanismo de fusión multimodal basado en descomposición Tucker, integrado en la arquitectura.
- **Pruebas de humo reproducibles**: el repositorio está diseñado para ejecutar pruebas rápidas que validen el flujo de entrenamiento.
- **Sin capacidades de generación, tool calling o agentes**: al ser un checkpoint de inicialización no entrenado, no ofrece ninguna capacidad funcional de razonamiento, generación de texto, código o visión.

## Casos de uso

- **Investigación educativa en aprendizaje contrastivo**: el código sirve como base para estudiar la arquitectura Coca y sus componentes (atención flash, fusión Tucker) en un entorno controlado y de pequeño tamaño.
- **Pruebas de humo en pipelines de entrenamiento**: el checkpoint de inicialización permite validar que un pipeline de entrenamiento funciona correctamente antes de escalar a modelos más grandes.
- **Desarrollo de nuevas variantes de Coca**: los investigadores pueden modificar la configuración y el código para experimentar con diferentes mecanismos de fusión o normalización.
- **Comparación de implementaciones**: puede utilizarse como referencia para comparar con otras implementaciones de Coca o CLIP en términos de estructura de código y configuración.
- **Material didáctico para cursos de deep learning**: dado su origen en CS231n, es útil como ejemplo de proyecto final para estudiantes que quieran ver una implementación limpia y documentada.
- **Base para un entrenamiento desde cero**: aunque el checkpoint no está entrenado, el script `train.py` puede adaptarse para entrenar el modelo con un dataset propio, siempre que se documenten los resultados por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente en la model card que no se reclama ninguna puntuación de benchmark y que el checkpoint no está entrenado.

## Requisitos de hardware

- **VRAM estimada**: con solo 33.088 parámetros, el modelo cabe en cualquier GPU con más de 1 GB de VRAM, e incluso en CPU.
- **GPU recomendadas**: no se requiere una GPU específica; cualquier GPU moderna (GTX 1060 en adelante) es suficiente para las pruebas de humo.
- **Compatibilidad con consumer GPU**: sí, cualquier GPU de consumo es válida.
- **Opciones de despliegue**: el script `train.py` se ejecuta directamente con Python. No es compatible con vLLM, Ollama o TGI sin un adaptador explícito, como advierte el autor.
- **Latencia y throughput**: no disponible, dado que no hay un modelo entrenado que medir.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. Al tratarse de un checkpoint de inicialización no entrenado y de tamaño mínimo, no es comparable con modelos de producción como CLIP, CoCa original o BLIP. La comparativa quedaría limitada a otras implementaciones académicas de Coca, de las que no se tienen datos en la información proporcionada.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: el archivo `model.safetensors` es un checkpoint de inicialización, no un modelo entrenado. No debe utilizarse para tareas reales de inferencia.
- **Sin auditoría de sesgos o robustez**: el autor indica que el checkpoint no ha sido auditado para robustez, equidad ni transferencia de dominio.
- **Riesgo de alucinación**: no aplica, ya que el modelo no genera texto.
- **Limitaciones de contexto e idioma**: no disponibles; el modelo no declara soporte de idiomas.
- **Restricciones de licencia**: la licencia BSD-3-Clause permite uso comercial, pero el autor advierte que deben revisarse los términos de los datos externos si se usan con datasets propios.
- **Compatibilidad limitada**: las APIs genéricas de carga automática requieren un adaptador explícito, ya que es una implementación personalizada.
- **Resultados futuros deben documentarse por separado**: cualquier resultado obtenido tras entrenar el modelo debe documentarse de forma independiente a la configuración por defecto.

## Enlaces

- [HuggingFace - amity-adav4/cs231n-contrastive](https://huggingface.co/amity-adav4/cs231n-contrastive)
- [CS231n: Deep Learning for Computer Vision (Stanford)](https://cs231n.stanford.edu/)
- [Notas del curso CS231n 2025 (no oficiales)](https://raimbekovm.github.io/cs231n-2025-notes/)
