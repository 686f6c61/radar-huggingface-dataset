# fanzh03/fast-wam

## Resumen

Fast-WAM es un modelo de acción-mundo (World Action Model, WAM) desarrollado por un equipo de investigación (fanzh03 en Hugging Face, con repositorio oficial en GitHub bajo el nombre FastWAM). El modelo aborda una pregunta central en robótica y control encarnado: si los modelos de acción-mundo realmente necesitan imaginar el futuro explícitamente durante la inferencia, o si basta con modelar el futuro durante el entrenamiento. En lugar de seguir el paradigma habitual de "imaginar y luego ejecutar" (que incurre en una latencia elevada por el denoising iterativo de vídeo), Fast-WAM reutiliza un Diffusion Transformer (DiT) de vídeo preentrenado como un codificador de mundo de una sola pasada para la generación de acciones.

La relevancia de este modelo radica en que propone una alternativa más eficiente a los modelos Visión-Lenguaje-Acción (VLA) y a los WAMs tradicionales, reduciendo drásticamente la latencia en tiempo de inferencia sin renunciar a la supervisión del modelo de mundo durante el entrenamiento. El repositorio de Hugging Face contiene un peso de aproximadamente 1,9 TB, lo que sugiere un modelo de gran tamaño, aunque no se especifican los parámetros totales en la información disponible. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de vídeo preentrenado, reutilizado como codificador de mundo de una sola pasada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control encarnado, no a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio usa almacenamiento Xet, probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

Según el paper "Fast-WAM: Do World Action Models Need Test-time Future Imagination?" (arXiv:2603.16666), Fast-WAM parte de un modelo de generación de vídeo preentrenado basado en un Diffusion Transformer (DiT). La innovación clave es que, en lugar de usar ese modelo para sintetizar iterativamente fotogramas futuros durante la inferencia (como hacen los WAMs convencionales), lo reutiliza como un codificador de mundo de una sola pasada que condiciona directamente la generación de acciones. Esto preserva la supervisión del modelo de mundo durante el entrenamiento (el modelo aprende a predecir la evolución visual), pero en tiempo de prueba utiliza una interfaz de política directa, eliminando el coste de denoising iterativo.

Los detalles concretos del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO, etc.) no se especifican en la información disponible. El repositorio oficial de GitHub indica que el código de entrenamiento y evaluación está disponible para los entornos LIBERO y RoboTwin, lo que sugiere que el modelo se ha validado en tareas de manipulación robótica y simulación.

## Capacidades

- Generación de acciones para control encarnado: el modelo produce acciones directamente a partir de observaciones visuales, sin necesidad de imaginación futura explícita en inferencia.
- Modelado de mundo: durante el entrenamiento, el modelo aprende a representar cómo evolucionan las observaciones visuales bajo acciones, lo que le proporciona una comprensión implícita de la dinámica del entorno.
- Eficiencia en inferencia: al evitar el denoising iterativo de vídeo, la latencia en tiempo de ejecución se reduce significativamente en comparación con WAMs tradicionales.
- Compatibilidad con entornos de simulación robótica: el código oficial incluye soporte para LIBERO y RoboTwin, entornos estándar para evaluación de políticas de manipulación.
- No se mencionan capacidades de lenguaje, tool calling, agentes conversacionales ni procesamiento de audio o texto.

## Casos de uso

- Manipulación robótica en simulación: el modelo puede entrenarse y evaluarse en entornos como LIBERO y RoboTwin para tareas de recogida, colocación y manipulación de objetos, aprovechando su baja latencia para control en tiempo real.
- Control de robots en tiempo real: gracias a su inferencia de una sola pasada, Fast-WAM es adecuado para escenarios donde la latencia de decisión es crítica, como robots móviles o brazos manipuladores en entornos dinámicos.
- Aprendizaje por imitación con supervisión de mundo: investigadores pueden usar el modelo para estudiar si la supervisión de vídeo futuro durante el entrenamiento mejora la robustez de las políticas, incluso sin imaginación explícita en inferencia.
- Base para investigación en WAMs eficientes: el modelo y su código sirven como punto de partida para desarrollar variantes que reduzcan aún más el coste computacional de los modelos de acción-mundo.
- Evaluación comparativa de arquitecturas de control: el modelo puede utilizarse como referencia para comparar el rendimiento de WAMs con y sin imaginación futura, así como frente a VLAs tradicionales.
- Despliegue en sistemas embebidos con recursos limitados: aunque el tamaño del modelo es grande, la ausencia de denoising iterativo permite una inferencia más ligera que los WAMs convencionales, lo que podría facilitar su despliegue en hardware con restricciones de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper menciona evaluación en LIBERO y RoboTwin, pero no se proporcionan cifras concretas en los materiales consultados.

## Requisitos de hardware

- El tamaño del repositorio es de aproximadamente 1,9 TB, lo que sugiere que el modelo completo en precisión completa (probablemente FP32 o BF16) requiere una cantidad de VRAM muy elevada, del orden de varios cientos de GB. No se dispone de datos exactos de parámetros.
- Para inferencia con el modelo completo, se necesitarían GPUs de clase data center como NVIDIA A100 (80 GB) o H100 (80 GB) en configuración multi-GPU, o soluciones de memoria compartida.
- No se indica si existen versiones cuantizadas (GGUF, AWQ, GPTQ) que permitan ejecutarlo en GPUs de consumo como RTX 4090 (24 GB). Dado el tamaño, es poco probable que quepa en una sola GPU de consumo sin cuantización extrema.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El repositorio oficial de GitHub proporciona el código de entrenamiento y evaluación, por lo que el despliegue requeriría un pipeline personalizado basado en PyTorch y posiblemente Diffusers.
- Latencia y throughput: no disponibles. La ventaja principal del modelo es la reducción de latencia frente a WAMs con imaginación iterativa, pero no se cuantifica en los materiales consultados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos. Los WAMs tradicionales (que usan imaginación futura explícita) y los VLAs (como RT-2, OpenVLA) son alternativas conceptuales, pero no se conocen sus parámetros ni rendimiento en los mismos benchmarks dentro de la información proporcionada. Se recomienda consultar el paper para obtener comparaciones detalladas.

## Limitaciones y advertencias

- El modelo está orientado exclusivamente a control encarnado y no es un modelo de lenguaje; no debe usarse para tareas de generación de texto, chat o razonamiento lingüístico.
- No se han publicado resultados de benchmarks en la información disponible, por lo que su rendimiento real en tareas estándar no puede verificarse de forma independiente.
- El tamaño del modelo (1,9 TB) implica requisitos de hardware muy elevados, lo que limita su uso a entornos con infraestructura de cómputo avanzada.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al ser un modelo de control, los fallos podrían traducirse en comportamientos inseguros en robots físicos si se despliega sin las salvaguardas adecuadas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de las dependencias (por ejemplo, el modelo de vídeo preentrenado subyacente) que podrían tener licencias más restrictivas.
- No se dispone de información sobre la composición del dataset de entrenamiento, por lo que no se pueden evaluar posibles sesgos en los entornos o tareas representados.

## Enlaces

- Hugging Face: https://huggingface.co/fanzh03/fast-wam
- Paper (arXiv): https://arxiv.org/abs/2603.16666
- Paper HTML: https://arxiv.org/html/2603.16666v1
- Repositorio GitHub: https://github.com/yuantianyuan01/FastWAM
- Página del proyecto: https://yuantianyuan01.github.io/FastWAM/
