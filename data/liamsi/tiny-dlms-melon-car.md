# liamsi/tiny-dlms-melon-car

## Resumen

Mēlon 4x128 (car) es un modelo de decisión de tamano muy reducido desarrollado por liamsi que recibe una imagen y selecciona una opción descrita en texto. En concreto, este checkpoint conduce el entorno CarRacing-v3 de Gymnasium a partir de fotogramas de 96x96 píxeles, eligiendo entre 15 opciones de conducción predefinidas (combinaciones de dirección y aceleración, más frenar). No genera texto: puntúa todas las opciones simultáneamente y aplica una softmax para obtener una probabilidad por opción.

El modelo se ha escrito y entrenado desde cero en PyTorch, sin usar la librería `transformers` de Hugging Face: el autor implementó el tokenizador, el Transformer y el bucle de entrenamiento. Con 1.343.872 parámetros, es un proyecto de aprendizaje explícitamente etiquetado como no apto para producción, pero resulta interesante como ejemplo mínimo y reproducible de un modelo de decisión visual basado en Transformer.

La relevancia actual es didáctica: demuestra que un transformer de 4 capas y 128 unidades, entrenado con imitación sobre 4.000 pasos, puede igualar el rendimiento de su profesor (pure pursuit) en pistas no vistas del entorno CarRacing-v3. Es un caso de estudio compacto de imitación visual con opciones discretas en lugar de generación autorregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de decisión (vision transformer) con 4 capas x 128 de ancho, 4 cabezas, más 1 capa de atención entre opciones |
| Parametros totales | 1.343.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 36 parches de 8x8 sobre imagen 48x48; 15 opciones de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (las opciones están en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un vision transformer de 4 capas con ancho 128 y 4 cabezas de atención, más una capa adicional en la que las representaciones de las opciones asisten entre sí (atención entre opciones). Emplea RMSNorm, RoPE y SwiGLU como bloques. La imagen de entrada se reduce de 96x96 a 48x48 píxeles y se divide en 36 parches de 8x8. Cada una de las 15 opciones de conducción se tokeniza y se puntúa contra la representación visual, produciendo una distribución de probabilidad mediante softmax.

El entrenamiento es por imitación (behavior cloning): el modelo copia a un profesor de pure pursuit que condujo 45 pistas, con fotogramas grabados mediante `scripts/car_record.py`. Se realizaron 4.000 pasos de entrenamiento. No se documenta uso de RLHF, DPO ni datos de texto a gran escala; el entrenamiento es específico para la tarea de conducción.

## Capacidades

- Decisión visual discreta: recibe un fotograma de color y selecciona una de 15 opciones de conducción descritas en texto.
- Puntuación conjunta de opciones: calcula todas las opciones a la vez y devuelve probabilidades por opción, sin generación autorregresiva.
- Conducción en CarRacing-v3: controla el vehículo en el entorno de Gymnasium a partir de píxeles.
- Imitación de un profesor de pure pursuit: reproduce la política del profesor en pistas no vistas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso más allá de la decisión por fotograma.
- Capacidades multilingües: no disponible; las opciones están en inglés.
- No dispone de modo thinking, visión más allá del fotograma de entrada, ni audio.

## Casos de uso

- Estudio de imitación visual mínima: usar el checkpoint como referencia reproducible para entender cómo un transformer pequeño puntúa opciones discretas a partir de imágenes, con código y datos de entrenamiento publicados.
- Docencia en aprendizaje por imitación: emplearlo en un curso o taller para comparar behavior cloning con el profesor de pure pursuit y con políticas aleatorias o triviales.
- Prototipado de políticas discretas para entornos de control: servir de plantilla para adaptar la arquitectura a otros entornos de Gymnasium con acciones discretas descritas en texto.
- Investigación en modelos de decisión sin generación: analizar el enfoque de puntuar opciones con softmax frente a la generación autorregresiva en tareas de control.
- Reproducción de benchmarks de CarRacing-v3: ejecutar `scripts/car_drive.py` para grabar vídeos y verificar la puntuación media reportada en pistas no vistas.
- Base para experimentos de destilación o comparación de arquitecturas: sustituir bloques (por ejemplo, GPT-2 con LayerNorm y GELU) y medir el impacto en la puntuación, como hace el autor con la familia Rhoa.
- Demostración de despliegue ligero: el modelo cabe holgadamente en cualquier GPU consumer y puede ejecutarse en CPU para demos interactivas.

## Benchmarks y rendimiento

| Conductor (5 pistas no vistas, CarRacing-v3) | Puntuación media |
|---|---|
| Este modelo | 913 |
| El profesor (pure pursuit) | 913 |
| Siempre recto | -26 |
| Aleatorio | -40 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no está orientado a tareas de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 1,34 M de parámetros, los pesos ocupan unos pocos megabytes en fp32.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en la mayoría de entornos embebidos.
- Opciones de despliegue: el paquete `tiny-dlms` (instalable desde GitHub con el extra `[hub]`) y ejecución directa en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo procesa un fotograma por paso y el bucle de evaluación ejecuta hasta 1.000 pasos por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-dlms-melon-car (este) | 1,34 M | Imagen 48x48, 15 opciones | 913 en CarRacing-v3 (5 pistas no vistas) | MIT | Hugging Face |
| tiny-dlms-melon-car-small | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face |
| tiny-dlms-melon-maze | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face |
| Profesor pure pursuit | no aplica (política clásica) | Estado del entorno | 913 en CarRacing-v3 | no disponible | Código en el repositorio |

No se dispone de datos de otros modelos comparables de la misma categoría (modelos de decisión visual de tamano similar) en la información proporcionada.

## Limitaciones y advertencias

- Proyecto de aprendizaje: el propio autor lo etiqueta como no apto para producción.
- Sesgos conocidos: no documentados; al entrenarse por imitación de un profesor de pure pursuit, hereda las limitaciones de esa política y puede fallar en situaciones fuera de la distribución de las 45 pistas de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede elegir opciones incorrectas en escenarios visuales no vistos.
- Limitaciones de contexto o idioma: entrada fija de imagen 48x48 y un conjunto cerrado de 15 opciones en inglés; no admite otras tareas ni idiomas.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo depende del entorno CarRacing-v3 de Gymnasium y de Box2D, cuyas licencias deben verificarse por separado.
- Caveat para producción: no hay soporte documentado para servidores de inferencia estándar ni cuantizaciones; el despliegue requiere el paquete `tiny-dlms` y el código del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/liamsi/tiny-dlms-melon-car
- GitHub del proyecto: https://github.com/benisalla/tiny-dlms
- Página del proyecto: https://benisalla.github.io/tiny-dlms/
- Checkpoint hermano (car-small): https://huggingface.co/liamsi/tiny-dlms-melon-car-small
- Checkpoint hermano (maze): https://huggingface.co/liamsi/tiny-dlms-melon-maze
- Modelo Rhoa: https://huggingface.co/liamsi/tiny-dlms-rhoa
- Modelo Rhoa-small: https://huggingface.co/liamsi/tiny-dlms-rhoa-small
- Modelo Rhoa-gpt2: https://huggingface.co/liamsi/tiny-dlms-rhoa-gpt2
- Modelo Rhoa-base: https://huggingface.co/liamsi/tiny-dlms-rhoa-base
