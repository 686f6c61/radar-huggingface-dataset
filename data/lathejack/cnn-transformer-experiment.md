# lathejack/cnn-transformer-experiment

## Resumen

`lathejack/cnn-transformer-experiment` es un repositorio experimental publicado en HuggingFace que contiene una implementación propia y compacta en PyTorch de una arquitectura híbrida denominada Cnn Transformer, orientada a tareas multitarea. No se trata de un modelo entrenado ni de un release listo para producción: el propio autor indica explícitamente que el checkpoint incluido es una inicialización válida para pruebas de humo (smoke tests), revisión de código y experimentos controlados de pequeño tamaño.

La escala del modelo es mínima: 33.088 parámetros totales según los pesos en formato safetensors, con un tamaño de repositorio de 0,0 GB. La configuración por defecto es la variante "base" y define atención de tipo linear, fusión mediante descomposición de Tucker, activación ReLU y normalización por instancias (InstanceNorm). La receta de entrenamiento incluida usa el optimizador AdamW con un scheduler de tipo coseno, aunque el autor aclara que son valores de partida del script y no la evidencia de una ejecución completada.

Su relevancia es, por tanto, acotada y de naturaleza metodológica: sirve como esqueleto de referencia para quien quiera montar ablaciones sobre arquitecturas híbridas CNN-Transformer o validar pipelines de entrenamiento antes de escalar. No compite con modelos generativos ni se le atribuye ninguna puntuación de benchmark. La licencia es MIT, lo que permite reutilizar y modificar el código sin restricciones comerciales, siempre revisando los términos de los datos externos que se le incorporen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrida CNN + Transformer), escala "base" |
| Parámetros totales | 33.088 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización); incluye también `model.py`, `config.json` y `training_args.json` |

Detalles adicionales de arquitectura declarados en la model card:

| Componente | Valor |
|---|---|
| Atención | Linear |
| Fusión | Tucker |
| Activación | ReLU |
| Normalización | InstanceNorm |
| Optimizador por defecto | AdamW |
| Scheduler por defecto | Coseno |
| Tarea declarada | Multitask |

## Arquitectura y entrenamiento

El modelo es una implementación propia en PyTorch de una arquitectura híbrida que combina módulos convolucionales con bloques de atención de tipo linear, fusionados mediante una descomposición de Tucker. La normalización se realiza con InstanceNorm y la función de activación es ReLU. El autor etiqueta el repositorio como "cnn-transformer" y "multitask", lo que sugiere un diseño orientado a compartir representaciones entre varias tareas, aunque no se detalla la composición de las cabezas de salida ni el número de tareas contempladas.

En cuanto al entrenamiento, no hay datos disponibles sobre volumen de tokens, composición del dataset, número de pasos ni uso de técnicas de alineación como RLHF o DPO. La model card es explícita al señalar que el fichero `model.safetensors` es "un checkpoint de inicialización válido para smoke tests" y que "no se presenta como un checkpoint entrenado con benchmark". La configuración por defecto (`adamw` con scheduler coseno) se describe como valores de arranque del script, no como resultado de una ejecución completada. Tampoco consta que se hayan aplicado innovaciones como decodificación especulativa, atención lineal eficiente a nivel de kernel ni mecanismos de estado recurrente.

## Capacidades

- No se documenta ninguna capacidad funcional verificada: el checkpoint no ha sido entrenado.
- La arquitectura está etiquetada como multitarea (`multitask`), pero no se especifican las tareas concretas soportadas.
- No hay evidencia de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara soporte multilingüe ni se listan idiomas.
- No hay modo "thinking", ni entrada/salida de audio, imagen o vídeo documentada.
- El repositorio incluye un bloque `__main__` en `model.py` con un ejemplo ejecutable de smoke test, que es la única funcionalidad garantizada.

## Casos de uso

- Revisión de código y estudio de arquitecturas híbridas: el repositorio se presenta explícitamente como material para code review, de modo que un ingeniero puede leer `model.py`, `config.json` y `training_args.json` para entender cómo se ensamblan convoluciones, atención linear y fusión de Tucker en una implementación compacta.
- Prueba de humo (smoke test) de pipelines de entrenamiento: al ser un checkpoint de inicialización válido, sirve para verificar que un bucle de entrenamiento, el cargador de datos y el guardado de pesos funcionan antes de escalar a un modelo mayor.
- Línea base de ablación en experimentos controlados: permite comparar variantes de atención, normalización o fusión (por ejemplo, sustituir InstanceNorm por LayerNorm o Tucker por concatenación) manteniendo el resto de la configuración fija.
- Validación de un harness de evaluación: dado que el autor recomienda evaluar sobre un conjunto held-out específico de la tarea, reportar la métrica en al menos tres semillas e incluir una línea base de capacidad comparable, el repositorio puede usarse para probar ese protocolo con un coste computacional mínimo.
- Docencia y divulgación: con 33.088 parámetros, el modelo se entrena y ejecuta en CPU en segundos, lo que lo hace adecuado para explicar en clase cómo se combinan capas convolucionales y mecanismos de atención sin necesidad de GPU.
- Test de integración en CI: se puede incorporar a un flujo de integración continua que compruebe que el modelo instancia, hace forward y guarda/carga pesos correctamente tras cada cambio en el código, con un tiempo de ejecución despreciable.
- Punto de partida para prototipos multitarea: si el equipo necesita una base propia para una tarea concreta, puede reutilizar la estructura y el script de entrenamiento bajo licencia MIT y sustituir los datos por los suyos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que "no se reclama ninguna puntuación de benchmark en este repositorio" y que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 33.088 parámetros en float32, los pesos ocupan del orden de 130 KB, por lo que el modelo cabe en cualquier GPU, en CPU e incluso en memoria de un microcontrolador de gama media.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte CUDA (por ejemplo, GTX 1050, RTX 3060, RTX 4090) es más que suficiente; también es viable la ejecución exclusiva en CPU.
- ¿Cabe en GPU de consumo? Sí, en todas, incluidas las integradas y las de gama de entrada, por el reducido número de parámetros.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible de forma directa con runtimes estándar como vLLM, llama.cpp, Ollama o TGI. La model card advierte que "las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso". El despliegue se realiza ejecutando `model.py` directamente.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Existen otros repositorios de estructura prácticamente idéntica publicados por otros autores, lo que sugiere una plantilla o generador común. No se dispone de sus especificaciones completas.

| Modelo | Parámetros | Contexto | Tarea declarada | Licencia | Estado |
|---|---|---|---|---|---|
| lathejack/cnn-transformer-experiment | 33.088 | No disponible | Multitask | MIT | Checkpoint de inicialización, sin entrenar |
| Aicollins/cnn-transformer-experiment | No disponible | No disponible | Matching | No disponible | Checkpoint de inicialización, sin entrenar (configuración "xlarge" según su model card) |
| amitmukherjee/cnn-transformer-experiment | No disponible | No disponible | No disponible | No disponible | Repositorio experimental |

No se identifican en la información disponible modelos de referencia entrenados con los que establecer una comparación cuantitativa fiable de rendimiento.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: cualquier inferencia producirá salidas sin valor semántico.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, tal y como reconoce el propio autor.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que no es un modelo de lenguaje entrenado; el riesgo real es interpretar sus salidas como si tuvieran significado.
- No hay información sobre sesgos, porque no hay datos de entrenamiento publicados ni proceso de alineación documentado.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide planificar su uso en tareas de NLP o visión reales.
- Compatibilidad limitada: las APIs genéricas de carga automática de HuggingFace no funcionan sin un adaptador explícito, lo que complica su integración en herramientas estándar.
- Restricciones de licencia: el código se libera bajo MIT, lo que permite uso comercial y modificación, pero el autor recomienda revisar por separado los términos de los datos de origen cuando se utilice con conjuntos de datos externos.
- Cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse de forma separada de los valores por defecto aquí publicados.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y un tamaño de 0,0 GB, señales coherentes con un artefacto de prueba sin adopción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lathejack/cnn-transformer-experiment
- Repositorio hermano (mismo nombre, tarea "Matching"): https://huggingface.co/Aicollins/cnn-transformer-experiment
- Repositorio hermano (mismo nombre): https://huggingface.co/amitmukherjee/cnn-transformer-experiment
- Temática CNN-Transformer en GitHub (proyectos de detección y segmentación de defectos superficiales): https://github.com/topics/cnn-transformer
- Introducción a Transformers en Machine Learning (GeeksforGeeks): https://www.geeksforgeeks.org/machine-learning/getting-started-with-transformers/
- Librería Transformers de HuggingFace (GeeksforGeeks): https://www.geeksforgeeks.org/deep-learning/transformers-library/
- No se han encontrado paper, blog técnico ni demo asociados específicamente a este modelo.
