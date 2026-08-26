# ethan-garci/multitask-experiments

## Resumen

Este repositorio contiene un **Cnn Transformer** experimental diseñado para tareas multitarea, publicado por el usuario ethan-garci (probablemente Ethan Garcia, estudiante de ingeniería informática en la Universidad Estatal de San Diego). Se trata de un experimento de arquitectura que combina capas convolucionales con un transformador de atención lineal, con el objetivo de explorar configuraciones antes de un entrenamiento a gran escala.

El modelo tiene únicamente **16.576 parámetros**, lo que lo convierte en un checkpoint de inicialización para pruebas de humo, no en un modelo entrenado con capacidades reales. La model card es explícita al respecto: no se presentan resultados de benchmarks ni se garantiza ningún comportamiento. Su relevancia radica en servir como referencia de implementación para arquitecturas híbridas CNN-Transformer con atención lineal, no como una herramienta utilizable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrido CNN + Transformer con atención lineal) |
| Parametros totales | 16.576 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina bloques convolucionales con un transformador que utiliza **atención lineal** (en lugar de la atención softmax estándar), lo que reduce la complejidad computacional a O(n) en lugar de O(n²). La fusión entre las ramas se realiza mediante **concat + MLP**, la activación es **Mish** y la normalización se hace con **GroupNorm**. El autor la denomina "escala giant" de forma irónica, dado el tamaño extremadamente reducido del checkpoint.

El entrenamiento está apenas esbozado: la configuración por defecto usa **AdamW** con **calentamiento lineal** (linear warmup). El `model.safetensors` es un checkpoint de inicialización aleatoria, no un resultado de entrenamiento. No se documenta ningún dataset utilizado ni un proceso de entrenamiento real. La model card recomienda que cualquier evaluación futura incluya una baseline de capacidad comparable y múltiples semillas.

## Capacidades

- No se ha entrenado el modelo, por lo que **no presenta ninguna capacidad funcional** de generación, razonamiento, código o visión.
- La arquitectura está diseñada para experimentos multitask, pero no hay evidencia de que funcione en ninguna tarea específica.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No existe modo de pensamiento, visión ni audio.

## Casos de uso

Dado que el checkpoint no está entrenado, no existen casos de uso prácticos en producción. Los posibles usos son exclusivamente de investigación y desarrollo:

- **Investigación de arquitecturas híbridas**: sirve como plantilla para estudiar cómo combinar capas convolucionales con atención lineal en un mismo modelo, especialmente para tareas multitask.
- **Prototipado rápido**: el código (`predict.py`) permite probar la inicialización y el flujo de datos antes de escalar a un modelo grande.
- **Experimentos educativos**: útil para estudiantes que quieran entender el funcionamiento interno de un transformador con atención lineal y normalización por grupos.
- **Validación de infraestructura**: permite probar pipelines de entrenamiento, guardado de checkpoints y carga de safetensors en entornos de desarrollo.
- **Prueba de integración**: se puede usar para verificar que herramientas como Hugging Face Transformers o adaptadores personalizados funcionan con esta arquitectura.
- **Base para desarrollo futuro**: el autor podría extender este checkpoint para entrenar un modelo real, pero actualmente no hay ningún caso de uso productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente: "No benchmark score is claimed in this repository". Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- Al tratarse de un modelo de 16.576 parámetros, la inferencia es trivial incluso en CPU o en cualquier GPU integrada.
- La VRAM necesaria es inferior a 1 MB, por lo que cabe en cualquier hardware moderno.
- No se requiere GPU dedicada; un procesador estándar es suficiente.
- Opciones de despliegue: cualquier framework que soporte PyTorch (por ejemplo, Python con `torch.load`), aunque no hay soporte directo para vLLM, llama.cpp o Ollama al no ser un modelo de lenguaje generativo estándar.
- Latencia y throughput: insignificantes, del orden de microsegundos para una pasada.

## Comparativa con modelos similares

No disponible. Este modelo es un experimento aislado sin equivalentes directos en la misma categoría de tamaño y arquitectura. No hay comparación posible con modelos comerciales o de investigación como Llama, Mistral o Falcon, que tienen cientos de miles o millones de parámetros y están entrenados.

## Limitaciones y advertencias

- **No entrenado**: el checkpoint es una inicialización aleatoria; no produce resultados útiles.
- **Sin auditoría de sesgos ni robustez**: la model card indica que no ha sido auditado para fairness ni transferencia de dominio.
- **Riesgo de alucinación**: al no estar entrenado, no tiene capacidad de generar texto coherente, pero cualquier uso indebido podría producir salidas sin sentido.
- **Licencia BSD-3-Clause**: permite uso comercial y modificación, pero la ausencia de funcionalidad hace que no tenga valor práctico.
- **Documentación limitada**: no se especifican idiomas, contexto ni datos de entrenamiento.
- **Código personalizado**: la model card advierte que las APIs genéricas de Hugging Face requieren un adaptador explícito para cargar el modelo, lo que dificulta su uso directo.

## Enlaces

- Hugging Face: https://huggingface.co/ethan-garci/multitask-experiments
- GitHub del autor (relacionado): https://github.com/ethangarc1a/ethan_garcia

Los resultados de búsqueda web no aportan información adicional sobre este modelo.
