# DJLougen/pixelgen2

## Resumen

PixelGen2 es un modelo de texto a imagen de arte pixelado desarrollado por DJLougen, publicado en Hugging Face bajo licencia MIT. Su particularidad es radical: sus 6.747 parametros fueron escritos a mano, sin ningun paso de entrenamiento ni optimizador. Se trata de un experimento de "weight-space programming", una tecnica en la que en lugar de entrenar una red neuronal se escribe un programa que se compila directamente en pesos. Las capas lineales se convierten en tablas de busqueda, el argmax en una decision y una convolucion 1x1 en una paleta de colores.

El modelo transforma prompts como "red potion" o "purple ghost with gold crown" en sprites de 16x16 pixeles en la paleta PICO-8, reescalados a 128x128. Segun la model card, genera 21.866 sprites distintos a partir de 28 plantillas dibujadas a mano (21 cuerpos y 7 accesorios) y 9 rampas de color. Es un `nn.Module` de PyTorch real: se puede invocar `.forward()`, guardar un `state_dict` y cargarlo de nuevo, pero nunca ha pasado por un proceso de entrenamiento.

Su relevancia es fundamentalmente didactica y de investigacion: demuestra que es posible construir un generador funcional sin gradientes, y sirve como caso de estudio sobre composicionalidad, representaciones discretas y programacion en el espacio de pesos. No es un modelo de proposito general ni compite con los modelos de difusion o transformers de texto a imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de operaciones tensoriales fijas: bag-of-words, capas lineales WTA, banco de plantillas, convoluciones 1x1 y 3x3 |
| Parametros totales | 6.747 (registrados en v2); 14.080 valores totales incluyendo buffers no entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (vocabulario cerrado de 138 palabras, sin contexto secuencial) |
| Tipos de cuantizacion | No disponible (pesos en fp32; el modelo completo ocupa aproximadamente 56,3 KB) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`state_dict`, archivo `.pt`); v1 pesa 45,7 KB |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo generativo convencional. Es un programa compuesto por nueve pasos fijos (v1) mas cuatro capas adicionales (v2). El prompt se convierte en un vector de conteo sobre un vocabulario de 138 palabras; una capa `Linear(138→21)` con argmax selecciona el cuerpo, un banco de plantillas de 16x8 con celdas opcionales gobernadas por ruido por semilla construye la forma, una operacion de espejo la hace simetrica, una dilatacion 3x3 genera el contorno y una capa `Linear(138→9)` con argmax elige la rampa de color. Finalmente, cada pixel se convierte en un one-hot sobre 16 colores PICO-8 y una `Conv2d(16→3, 1x1)` lo proyecta a RGB.

En v2 se anaden cuatro capas de pesos fijos: un selector de accesorio (`Linear(138→8)` con sesgo hacia `none`), un segundo color para el accesorio (`Linear(138→9)` sobre la mitad del prompt tras `with`/`wearing`/`holding`/`and`), un sombreado estructural mediante dos convoluciones 3x3 de un solo tap (18 parametros) que ilumina desde arriba a la izquierda, y un modificador de tamano (`small`/`tiny`/`mini`) que reescala el cuerpo al 0,75x. El entrenamiento es inexistente: cero pasos, cero optimizadores, cero pasadas hacia atras. La "generatividad" proviene de las celdas `?` de las plantillas, activadas por ruido por semilla.

## Capacidades

- Generacion de sprites de arte pixelado de 16x16 (reescalados a 128x128) en la paleta PICO-8 de 16 colores.
- Composicion de prompts con estructura `[small] <colour> <body> [with <colour> <accessory>]`.
- Seleccion entre 21 cuerpos, 7 accesorios y 9 rampas de color.
- Variacion por semilla: el mismo prompt produce pequenas variaciones entre semillas distintas.
- Salida con todos los pixeles restringidos a la paleta PICO-8 exacta (division exacta entre 255).
- Sombreado estructural automatico con luz desde arriba a la izquierda.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No soporta vision, audio ni modo de pensamiento.

## Casos de uso

- Prototipado rapido de assets para videojuegos retro: el modelo genera sprites coherentes con la paleta PICO-8 en milisegundos, util para iterar sobre disenos de personajes antes de encargar arte final.
- Generacion de conjuntos de sprites para demos y game jams: con 21.866 combinaciones distintas a semilla 0, se puede poblar un juego pequeno con variedad suficiente sin coste de inferencia.
- Docencia sobre programacion en el espacio de pesos: el modelo sirve como ejemplo ejecutable de como compilar un programa en pesos de una red, con scripts en `experiments/` para reproducir las mediciones.
- Investigacion sobre composicionalidad discreta: las capas de accesorio y segundo color permiten estudiar como se combinan atributos en representaciones one-hot sin aprendizaje.
- Generacion de iconos y avatares pixelados: la estructura de prompt color-cuerpo-accesorio se adapta a la creacion de avatares para foros, bots o interfaces con estetica retro.
- Pruebas de pipelines de inferencia ligeros: con 56,3 KB de pesos, es util para validar integraciones de PyTorch, serializacion de `state_dict` y despliegue en entornos con recursos minimos.
- Benchmarking de tecnicas de weight-space programming: permite comparar enfoques de pesos escritos a mano frente a modelos entrenados en tareas acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de cobertura: 21.866 sprites distintos de 24.192 prompts a semilla 0 en v2, y 189 de 189 en v1.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el modelo completo ocupa aproximadamente 56,3 KB en fp32.
- GPU recomendadas: cualquier GPU, incluida una iGPU; no requiere aceleracion dedicada.
- Cabe en cualquier GPU de consumo, incluso en CPU sin problemas.
- Opciones de despliegue: PyTorch nativo (`.forward()` y `state_dict`), scripts del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque por el tamano del modelo se espera latencia despreciable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PixelGen2 | 6.747 | No disponible (vocabulario de 138 palabras) | 0 pasos | MIT | Hugging Face |
| PixelGen (v1) | 4.227 | No disponible | 0 pasos | MIT | Hugging Face |
| Modelos de difusion texto a imagen | Miles de millones | Tipicamente 77 tokens de prompt | Entrenados | Variadas | Hugging Face |

No se dispone de comparativas con otros modelos de arte pixelado en la informacion proporcionada. La comparacion con modelos de difusion es meramente orientativa por categoria de tarea, no por escala ni enfoque.

## Limitaciones y advertencias

- El vocabulario esta cerrado a 138 palabras en ingles; cualquier prompt fuera de ese vocabulario no produce el resultado esperado.
- Solo genera las 21 formas de cuerpo y 7 accesorios predefinidos; no hay generalizacion a formas nuevas.
- La variacion entre semillas es limitada a las celdas `?` de las plantillas; no hay diversidad estructural real.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si de resultados degenerados ante prompts mal formados o fuera de distribucion.
- Sesgos: las plantillas y sinonimos fueron definidos manualmente por el autor, lo que puede reflejar sesgos de seleccion en cuerpos, accesorios y colores.
- Licencia MIT permite uso comercial, pero el modelo es un experimento toy; no se recomienda para produccion sin validacion.
- No soporta otros idiomas distintos del ingles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DJLougen/pixelgen2
- Version v1: https://huggingface.co/DJLougen/pixelgen
- Post inspirador sobre weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
