# OLIVERDAVIES/undergrad-contrastive

## Resumen

OLIVERDAVIES/undergrad-contrastive es un prototipo de investigación basado en la arquitectura Flamingo, orientado al aprendizaje contrastivo. Lo publica el usuario OLIVERDAVIES en HuggingFace con licencia MIT. El repositorio incluye un script de entrenamiento (`train.py`), una configuración de arquitectura (`config.json`), una receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`) con 33.088 parámetros, un tamaño extremadamente reducido.

El modelo no está entrenado: el checkpoint sirve únicamente para pruebas de humo (smoke tests) y no se presentan resultados de benchmarks ni métricas de rendimiento. Su relevancia actual es limitada, ya que se trata de un punto de partida experimental para quien quiera explorar la fusión de la arquitectura Flamingo con objetivos contrastivos. No hay evidencia de que haya sido evaluado en tareas concretas, y el autor advierte explícitamente de que no debe tratarse como un modelo con capacidades verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flamingo (prototipo) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es Flamingo, un diseño que combina un modelo de lenguaje con módulos de atención cruzada (cross-attention) para fusionar información visual y textual, aunque en este prototipo no se especifica si se incluye un encoder visual. La configuración indica atención multi-query (multi query attention), activación swish y normalización scalenorm. La fusión se realiza mediante cross-attention, coherente con el diseño original de Flamingo.

El entrenamiento propuesto en la receta por defecto usa RMSprop con un programador polinomial, pero el autor aclara que son valores iniciales del script y no evidencia de una ejecución completada. No se proporciona información sobre el dataset, el número de tokens ni el uso de RLHF o DPO. El checkpoint incluido es una inicialización válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- No se han demostrado capacidades funcionales: el checkpoint no está entrenado y no se aportan resultados de evaluación.
- La arquitectura Flamingo sugiere potencial para tareas de razonamiento multimodal (texto e imagen), pero no hay evidencia de que este prototipo funcione.
- No hay soporte declarado de tool calling, agentes, razonamiento multi-paso ni modos especiales.
- No se especifican capacidades multilingües.
- El objetivo contrastivo (contrastive) podría orientarse a tareas de representación y similitud, pero no se ha validado.

## Casos de uso

Dado que el modelo no está entrenado, los casos de uso son exclusivamente de investigación y desarrollo:

- Punto de partida para experimentos de arquitectura: permite probar la implementación de Flamingo con atención multi-query y normalización scalenorm antes de escalar.
- Validación de pipelines de entrenamiento contrastivo: sirve para verificar que el script `train.py` funciona con datos sintéticos o pequeños conjuntos.
- Estudio de la fusión cross-attention en contextos de bajo presupuesto computacional, gracias a sus 33.088 parámetros.
- Base para implementar un adaptador que permita cargar el modelo con APIs genéricas, ya que el autor indica que se requiere un adaptador explícito.
- Comparación de recetas de optimización (RMSprop con schedule polinomial) frente a otras configuraciones en tareas de representación.
- Desarrollo de un benchmark propio para medir el rendimiento de modelos Flamingo pequeños en tareas contrastivas, siguiendo las recomendaciones del autor (tres semillas, conjunto held-out, baseline de capacidad equivalente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable, dado el tamaño de 33.088 parámetros (menos de 1 MB en fp32).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso CPU es viable.
- Cabe en cualquier GPU de consumo, incluidas las integradas.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin un adaptador. Se puede ejecutar con el script `train.py` o cargando los pesos con PyTorch.
- Latencia y throughput: no disponibles; al ser un modelo diminuto, la latencia sería mínima, pero no se han medido.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría (prototipo Flamingo contrastivo no entrenado). Se podría mencionar OpenFlamingo como referencia de la arquitectura Flamingo, pero no es una comparación directa porque OpenFlamingo es un modelo entrenado y con parámetros mucho mayores. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint no está entrenado: cualquier salida generada será aleatoria o basada en la inicialización, no en conocimiento aprendido.
- No se ha auditado el modelo en cuanto a robustez, equidad o transferencia de dominio, según el propio autor.
- Riesgo de alucinación: no aplica en el sentido tradicional, pero las salidas no serán coherentes ni útiles.
- No hay soporte de idiomas ni contexto definido.
- La licencia MIT permite uso comercial, pero el autor advierte que hay que revisar los términos de las fuentes de datos externas si se usan.
- Para producción, este modelo no es adecuado en su estado actual; requiere entrenamiento completo y evaluación rigurosa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OLIVERDAVIES/undergrad-contrastive
- No se han encontrado otros enlaces relevantes en la búsqueda web (papers, blogs o demos asociados a este modelo concreto).
