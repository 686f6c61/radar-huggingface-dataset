# Erobinsonana/perceiver-retrieval-slim

## Resumen

`Erobinsonana/perceiver-retrieval-slim` es un repositorio de Hugging Face que contiene una implementación compacta y personalizada en PyTorch de una arquitectura Perceiver orientada a tareas de recuperación (retrieval). Lo publica el usuario Erobinsonana bajo licencia MIT y no constituye un modelo preentrenado listo para producción: el propio autor indica que el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (smoke tests), revisión de código y experimentos controlados de pequeña escala.

El modelo se presenta bajo una escala "huge" según la model card, con atención estándar, fusión de tensores, activación mish y normalización por batch. El dato real de parámetros en safetensors es de 49.600, una cifra muy reducida que confirma que se trata de un artefacto de andamiaje más que de un modelo entrenado con capacidad real de recuperación. El repositorio ocupa 0,0 GB.

Su relevancia es, por tanto, metodológica: sirve como punto de partida reproducible para quien quiera montar un pipeline de retrieval con Perceiver, inspeccionar una configuración de entrenamiento (optimizador lamb con schedule polinómico) o validar la carga de pesos antes de escalar a un experimento real. No hay puntuaciones de benchmark declaradas ni evidencia de un entrenamiento completado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceiver (atención estándar, fusión de tensores) |
| Parámetros totales | 49.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Activación | mish |
| Normalización | batchnorm |
| Optimizador por defecto | lamb con schedule polinómico |
| Escala declarada | huge |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer que proyecta entradas de longitud arbitraria a un conjunto acotado de latentes mediante atención cruzada, lo que en principio permite procesar modalidades y secuencias de tamaño variable sin explotar el coste cuadrático. En este repositorio la implementación usa atención estándar (no lineal ni aproximada), fusión de tensores entre modalidades, activación mish y batchnorm. El fichero `eval.py` contiene el modelo y un punto de entrada ejecutable con un ejemplo de smoke test en su bloque `__main__`.

No hay evidencia de entrenamiento real. El autor especifica que `model.safetensors` es un checkpoint de inicialización y que la receta incluida (lamb con schedule polinómico) son valores de arranque del script, no prueba de una ejecución completada. No se documentan número de tokens, composición del dataset, ni fases de RLHF o DPO. La guía de evaluación del autor sugiere usar Flickr30k, reportar la métrica de tarea con al menos tres semillas y comparar contra una línea base de capacidad equivalente, guardando logs y versiones del entorno.

## Capacidades

- Recuperación multimodal: la arquitectura Perceiver con fusión de tensores está diseñada para emparejar consultas y elementos de un corpus, aunque el checkpoint incluido no ha sido entrenado para ello.
- Extracción de representaciones latentes: el cuello de botella de latentes permite obtener embeddings de tamaño fijo a partir de entradas de longitud variable.
- Punto de entrada ejecutable: `eval.py` incluye un ejemplo de inferencia y un esqueleto de entrenamiento.
- Configuración explícita: `config.json` y `training_args.json` documentan arquitectura y receta de experimento.
- No dispone de tool calling, function calling, modo de razonamiento, capacidades de agente, visión o audio declaradas.
- Capacidades multilingües: no disponible.

## Casos de uso

- Revisión de código de arquitecturas Perceiver: el repositorio permite inspeccionar una implementación compacta y funcional de atención cruzada con fusión de tensores antes de adoptarla en un proyecto propio.
- Pruebas de humo de pipelines de carga: `model.safetensors` y `config.json` permiten validar que un entorno de PyTorch carga correctamente pesos y configuración sin depender de un modelo grande.
- Andamiaje para experimentos de retrieval: partiendo de `training_args.json` se puede lanzar un entrenamiento controlado sobre Flickr30k con la receta lamb/polinómica y comparar contra una línea base de capacidad equivalente.
- Benchmarking de infraestructura: con 49.600 parámetros sirve para medir latencia de carga, serialización safetensors y overhead de framework antes de escalar a modelos mayores.
- Docencia y prototipado rápido: útil para explicar cómo funciona un Perceiver y para que estudiantes modifiquen atención, fusión o normalización en un código manejable.
- Integración en CI/CD como test de regresión: se puede incluir en la batería de tests de un repositorio mayor para detectar roturas en el cargador de safetensors o en la API de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no reclama ninguna puntuación y que el checkpoint no es una referencia entrenada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado el tamaño de 49.600 parámetros y el repo de 0,0 GB; el grueso del consumo vendrá del framework PyTorch, no de los pesos.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es sobrada; también ejecuta en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga directa con PyTorch y `safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el autor advierte que las APIs genéricas de carga automática requieren un adaptador explícito.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Erobinsonana/perceiver-retrieval-slim | 49.600 | no disponible | sin benchmarks | MIT | Hugging Face |
| smithkevin/perceiver-retrieval | no disponible (escala xlarge) | no disponible | sin benchmarks declarados | no disponible | Hugging Face |
| JOONHOAHN/perceiver-retrieval | no disponible (escala large) | no disponible | sin benchmarks declarados | no disponible | Hugging Face |

Los tres repositorios son prototipos de investigación de Perceiver para retrieval, con configuración explícita y checkpoint de inicialización, y ninguno publica métricas verificadas. La diferencia principal es la escala declarada (huge, xlarge y large) y el tamaño efectivo de parámetros, que en este caso es de 49.600.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio; no debe usarse como modelo de recuperación en producción.
- Riesgo elevado de alucinación y salidas sin sentido si se usa para generar texto o puntuar relevancia sin entrenamiento previo.
- No hay datos sobre sesgos, idiomas soportados ni cobertura de dominio.
- La licencia MIT permite uso comercial del código y los pesos, pero el autor recomienda revisar por separado los términos de los datos externos (por ejemplo, Flickr30k) cuando se usen con este repositorio.
- Las APIs genéricas de carga automática no funcionan sin un adaptador explícito, lo que complica la integración directa con frameworks estándar.
- Cualquier resultado obtenido con este checkpoint debe documentarse como inicialización, no como modelo entrenado, y separarse de los valores por defecto del repositorio.

## Enlaces

- Repositorio principal: https://huggingface.co/Erobinsonana/perceiver-retrieval-slim
- Repositorio comparable (escala xlarge): https://huggingface.co/smithkevin/perceiver-retrieval
- Repositorio comparable (escala large): https://huggingface.co/JOONHOAHN/perceiver-retrieval
