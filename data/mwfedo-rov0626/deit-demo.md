# mwfedo-rov0626/deit-demo

## Resumen

El repositorio `mwfedo-rov0626/deit-demo` contiene un prototipo de investigación basado en la arquitectura DeiT (Data-efficient Image Transformers) orientado a tareas de *matching* visual. Lo desarrolla el usuario mwfedo-rov0626 (Maxim Fedorov) y se publica bajo licencia Apache 2.0. El modelo se presenta como un punto de partida experimental: incluye un script principal (`main.py`), una configuración de arquitectura (`config.json`), un recetario de entrenamiento (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`) válido únicamente para pruebas de humo, no como un modelo entrenado.

La escala indicada es `large`, con atención estándar, fusión de bajo rango, activación GELU tanh y normalización por lotes (batch norm). No se proporcionan resultados de benchmarks ni datos de entrenamiento, por lo que cualquier afirmación sobre rendimiento carece de respaldo empírico. La relevancia de este repositorio reside en su valor como plantilla para experimentar con DeiT en problemas de matching, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeiT (Data-efficient Image Transformers) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DeiT, un transformer de visión que procesa imágenes divididas en parches. En esta implementación concreta se especifican los siguientes componentes: atención estándar (sin mecanismos lineales o aproximados), fusión de bajo rango (low rank fusion) para combinar características, activación GELU con aproximación tanh y normalización por lotes (batch norm) en lugar de la capa norm habitual en transformers. La escala es `large`, aunque no se indican las dimensiones exactas (número de capas, cabezas, etc.).

No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens o pasos, ni sobre técnicas de alineación como RLHF o DPO. El repositorio incluye un `training_args.json` que define una receta por defecto con el optimizador Novograd y un programa de calentamiento lineal, pero se aclara explícitamente que son valores de partida, no evidencia de una ejecución completada. El checkpoint `model.safetensors` es una inicialización válida para comprobar que el código funciona, no un modelo entrenado.

## Capacidades

- Extracción de representaciones visuales: al ser un DeiT, puede procesar imágenes y generar embeddings de parches o una representación global.
- Matching visual (potencial): la arquitectura está orientada a tareas de correspondencia entre imágenes (por ejemplo, similitud, recuperación o verificación), aunque no hay pruebas de rendimiento.
- Ejecución de un ejemplo de humo: el script `main.py` incluye un bloque `__main__` con un ejemplo generado para verificar que el modelo funciona.
- Personalización: al ser código fuente abierto, se puede adaptar la arquitectura y el entrenamiento para otras tareas de visión.

No se documentan capacidades de generación de texto, tool calling, agentes, multimodalidad ni razonamiento de varios pasos, ya que el modelo es puramente visual y no se ha entrenado para esas funciones.

## Casos de uso

Dado que el modelo es un prototipo sin entrenamiento, los casos de uso son hipotéticos y deben considerarse como direcciones de experimentación, no como aplicaciones probadas:

- Investigación en matching visual: usar el repositorio como base para estudiar cómo DeiT se comporta en tareas de similitud entre pares de imágenes, comparando con otros backbones.
- Validación de técnicas de fusión de bajo rango: el diseño de fusión low rank permite experimentar con la combinación de características de diferentes ramas o modalidades.
- Pruebas de concepto de recuperación de imágenes: implementar un pipeline de búsqueda visual donde el modelo genere embeddings y se compare mediante distancia coseno, aunque se requeriría entrenamiento previo.
- Desarrollo de adaptadores para DeiT: el repositorio menciona que las APIs genéricas de carga automática requieren un adaptador explícito, por lo que puede servir para probar integraciones personalizadas en frameworks como Hugging Face Transformers.
- Evaluación de protocolos de entrenamiento: usar la receta por defecto (Novograd + warmup) para estudiar el efecto de diferentes optimizadores y schedulers en DeiT.
- Generación de checkpoints de referencia: entrenar el modelo con un conjunto de datos pareado y publicar los resultados siguiendo las pautas de evaluación que sugiere el autor (métricas con tres semillas, comparación con línea base de capacidad equivalente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que el checkpoint de inicialización no es un modelo entrenado y que no se reivindica ninguna puntuación de rendimiento. Cualquier evaluación futura deberá documentarse por separado.

## Requisitos de hardware

No se dispone de datos específicos proporcionados por el autor. Como orientación general para un DeiT de escala large (típicamente ~300 millones de parámetros, aunque no se confirma aquí):

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para los pesos; en FP16 se reduce a la mitad. Sin embargo, al ser una implementación personalizada, el consumo real depende del código.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM podría ejecutar una pasada de inferencia en FP32, aunque para entrenamiento se necesitaría más memoria (8-16 GB o más). No se han validado GPUs específicas.
- Compatibilidad con GPU de consumo: es probable que quepa en tarjetas como RTX 3060, RTX 4060 o superiores, pero no hay pruebas documentadas.
- Opciones de despliegue: al ser un script personalizado, no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El despliegue requeriría adaptar el código a un servidor de inferencia (por ejemplo, TorchServe o FastAPI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Los DeiT oficiales de Facebook (base, small, tiny) son alternativas conocidas, pero este prototipo difiere en la configuración (fusión low rank, batch norm, activación gelu tanh) y no se han medido sus prestaciones. Sin datos de rendimiento, cualquier comparación sería especulativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio; es solo una inicialización para pruebas de humo.
- No hay evidencia de que el modelo funcione correctamente en tareas reales de matching; se necesita un entrenamiento completo y una evaluación rigurosa.
- La implementación es personalizada, por lo que las APIs automáticas de carga de Hugging Face no funcionan directamente; se requiere un adaptador explícito.
- No se documentan sesgos específicos, pero al no haber entrenamiento ni datos, no se puede descartar ningún sesgo inherente a la arquitectura o a futuros datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero los términos de los datos externos utilizados con el modelo deben revisarse por separado.
- No se proporcionan garantías de soporte ni mantenimiento; es un repositorio de investigación con una sola actualización.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mwfedo-rov0626/deit-demo
- Perfil del autor: https://huggingface.co/mwfedo-rov0626/models
- Repositorio oficial de DeiT (Facebook Research): https://github.com/facebookresearch/deit
- Documentación de DeiT en Hugging Face Transformers: https://huggingface.co/docs/transformers/v4.49.0/en/model_doc/deit
