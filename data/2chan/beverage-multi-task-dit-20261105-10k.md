# 2chan/beverage-multi-task-dit-20261105-10k

## Resumen

Beverage Multi-Task DiT es una política robótica de imitación entrenada con LeRobot 0.6.1 sobre una tarea bimanual de remover una bebida con un muddler. El modelo lo publica el usuario 2chan en Hugging Face y emplea la clase `MultiTaskDiTPolicy`, una arquitectura de difusión (DDPM con predicción de épsilon y pérdida MSE) condicionada por instrucción de tarea, estado del robot y tres cámaras. Con 277.394.188 parámetros y un tamaño de repositorio de 1,1 GB, es un checkpoint compacto pensado para control de manipuladores, no para generación de texto.

El checkpoint corresponde al paso 10.000 de la ejecución `20261105_005902_083500` y es a la vez el último checkpoint y el mejor por validación de esa ejecución, con una pérdida de validación offline de 0,0121393986. Aunque la arquitectura soporta condicionamiento multitarea, este checkpoint se entrenó únicamente con el ID de tarea 0 (stirring), por lo que en la práctica es un modelo de una sola habilidad.

Su relevancia es acotada y experimental: se publica con 0 descargas y 0 likes, sin licencia declarada, y sirve como referencia reproducible de un pipeline LeRobot completo (pesos, configuración, procesadores y estadísticas de normalización) para robótica bimanual con un SO-101. No es un modelo de lenguaje ni un modelo multimodal general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MultiTaskDiTPolicy (LeRobot 0.6.1), difusión DDPM con predicción de épsilon; codificadores de visión/texto CLIP ViT-B/16 |
| Parámetros totales | 277.394.188 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica como contexto de texto; historial de observación de 2 fotogramas y horizonte de acción de 32 pasos (24 ejecutados) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (condicionamiento por instrucción de tarea en inglés: "Stir the mixture in the cup with the muddler.") |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Dimensión de estado/acción | 12 (brazo izquierdo seguido del brazo derecho) |
| Cámaras de entrada | `observation.images.left_wrist`, `observation.images.right_wrist`, `observation.images.top` |
| Modelo base | openai/clip-vit-base-patch16 (fine-tune) |
| Paso de entrenamiento | 10.000 |
| Pérdida de validación offline | 0,0121393986 |

## Arquitectura y entrenamiento

El modelo es una política de difusión para robótica: genera secuencias de acción mediante un proceso DDPM con predicción de épsilon y pérdida MSE, condicionado por la instrucción de tarea, el estado del robot y las observaciones de tres cámaras. La percepción se apoya en los codificadores preentrenados de `openai/clip-vit-base-patch16`, reutilizados y ajustados. El estado y la acción tienen 12 dimensiones (brazo izquierdo y después brazo derecho), lo que encaja con una configuración bimanual tipo SO-101.

Los detalles de entrenamiento disponibles son escasos: se conoce la ejecución (`20261105_005902_083500`, zona Asia/Seoul), el paso 10.000 y que el enmascaramiento de pérdida por padding está desactivado según la configuración guardada de la política. No se especifican el número de tokens o episodios, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este dominio). El repositorio incluye modelo, configuración, procesadores y estadísticas de normalización, pero no el estado de optimizador, scheduler, GradScaler ni RNG.

## Capacidades

- Generación de trayectorias de acción para una tarea bimanual de remover una bebida con un muddler.
- Condicionamiento por instrucción de tarea en lenguaje natural (en este checkpoint, solo el ID de tarea 0).
- Fusión de tres vistas de cámara (muñeca izquierda, muñeca derecha y vista superior) con estado proprioceptivo de 12 dimensiones.
- Control con historial de 2 fotogramas y horizonte de acción de 32 pasos, ejecutando 24 pasos por inferencia.
- Soporte arquitectónico de multitarea (no explotado en este checkpoint).
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento.

## Casos de uso

- Remover bebidas en un banco de pruebas bimanual: el modelo recibe la instrucción "Stir the mixture in the cup with the muddler." junto con el estado y las tres cámaras, y devuelve acciones de 12 dimensiones listas para el robot tras el postprocesado.
- Reproducción de experimentos LeRobot: sirve como checkpoint de referencia para validar el pipeline `MultiTaskDiTPolicy` con `make_pre_post_processors` y las estadísticas de normalización incluidas.
- Base para fine-tuning en tareas de manipulación con líquidos: al partir de un modelo ya ajustado sobre CLIP ViT-B/16 y con 277 M de parámetros, es viable reentrenarlo en hardware modesto.
- Evaluación de políticas de difusión en robótica: útil para comparar curvas de pérdida de validación offline frente a otras políticas del mismo framework.
- Docencia y prototipado de imitación bimanual: el repositorio es autocontenido (pesos, configuración y procesadores) y permite montar una demo de inferencia sin dependencias externas.
- Integración en un bucle de control de laboratorio: con `policy.select_action` y el reinicio de colas en los límites de episodio, se puede desplegar en un SO-101 para pruebas de estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la pérdida de validación offline de 0,0121393986 en el paso 10.000, que el propio autor advierte que no equivale a una tasa de éxito en robot físico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 277 M de parámetros en precisión completa (fp32) el peso ronda 1,1 GB, y en fp16/bf16 aproximadamente 0,55 GB, a lo que hay que sumar activaciones y los codificadores CLIP.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería acomodar el modelo, aunque no hay datos publicados de latencia.
- GPU de consumo: previsiblemente cabe en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 mediante `MultiTaskDiTPolicy.from_pretrained` y `make_pre_post_processors`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de LeRobot con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Entrenado solo con el ID de tarea 0 (stirring): no generaliza a otras tareas aunque la arquitectura lo permita.
- La pérdida de validación offline no es una tasa de éxito física; el autor lo advierte explícitamente.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Sin información sobre sesgos del dataset, composición de datos ni episodios de entrenamiento.
- Enmascaramiento de pérdida por padding desactivado, lo que puede afectar a secuencias de longitud variable.
- Repositorio sin estado de optimizador, scheduler, GradScaler ni RNG: no es reanudable tal cual para continuar el entrenamiento.
- Dependencia estricta de la configuración de cámaras y de la dimensionalidad de 12 (brazo izquierdo y derecho); cambios en la morfología del robot invalidan el checkpoint.
- Idiomas soportados no declarados; la instrucción de tarea está en inglés.
- Sin descargas ni validación por la comunidad: madurez y robustez no contrastadas.

## Enlaces

- Hugging Face: https://huggingface.co/2chan/beverage-multi-task-dit-20261105-10k
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch16
- LeRobot (framework): no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
