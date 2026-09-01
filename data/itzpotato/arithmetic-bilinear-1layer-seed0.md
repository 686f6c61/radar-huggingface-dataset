# itzPotato/arithmetic-bilinear-1layer-seed0

## Resumen

El modelo `arithmetic-bilinear-1layer-seed0` es un transformer decoder-only de una sola capa, sin sesgos ni normalización, con un MLP de tipo bilineal, entrenado específicamente para la tarea de suma y resta de números enteros de cuatro dígitos con signo. Lo desarrolla itzPotato (Rohan Sashank Babbellapati) como parte de una familia de doce modelos que varían en el tipo de MLP (ReLU o bilineal), el número de capas (1 o 2) y la semilla de inicialización, con el objetivo de estudiar cómo la arquitectura interna afecta al aprendizaje de operaciones aritméticas.

Este modelo es relevante en el campo de la interpretabilidad de redes neuronales, ya que su tamaño extremadamente reducido (11 584 parámetros) permite un análisis exhaustivo de los circuitos internos que implementan la suma y la resta. Los resultados muestran que una sola capa con MLP bilineal resuelve correctamente la suma (precisión secuencial del 94,36 % en validación) pero falla en la resta (19,16 %), lo que sugiere que la propagación del acarreo en la resta requiere al menos una segunda capa. La arquitectura utiliza un vocabulario de 13 tokens (dígitos 0-9, operadores + y -, y el símbolo =), con una ventana de contexto de 16 tokens por ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 1 capa, sin bias ni normalizacion, MLP bilineal |
| Parametros totales | 11 584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 tokens (entrada fija de 16 tokens por ejemplo) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | no disponible (vocabulario numerico de 13 tokens, sin lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de una sola capa con las siguientes dimensiones: `d_model` de 32, `d_mlp` de 64, 4 cabezas de atención con `d_head` de 8. No incluye sesgos ni capas de normalización. El MLP bilineal se define como `W_out[(W_L x) * (W_R x)]`, donde `*` indica producto elemento a elemento; esto contrasta con el MLP ReLU estándar `W_out ReLU(W_in x)`. Esta elección permite estudiar cómo una función de activación no lineal distinta afecta al aprendizaje de operaciones aritméticas.

El entrenamiento se realizó con el optimizador AdamW, tasa de aprendizaje 0,02 con decaimiento coseno y 200 pasos de calentamiento, tamaño de lote 1024, weight decay 0,01 y gradiente clip de 1,0. Se utilizó un único paso sobre 5 000 000 de ejemplos generados con una semilla fija (1234) para todos los modelos de la familia. La tasa de aprendizaje se seleccionó mediante una sonda de seis puntos en ambas variantes de MLP, eligiendo la mayor tasa que mantuviera estabilidad en ambos casos, de modo que el recetario no favoreciera a ninguna variante. El mejor paso de entrenamiento fue el 4800 de 4883.

## Capacidades

- Generación de secuencias de tokens numéricos: dado un problema de suma o resta de 4 dígitos con signo, el modelo predice los 5 dígitos de la respuesta (incluyendo el signo, aunque este no recibe gradiente).
- Aritmética básica: resuelve correctamente sumas de números de 4 dígitos (precisión secuencial del 94,36 % en validación) y, de forma parcial, restas (19,16 %).
- Sin soporte de tool calling ni function calling: el modelo no está diseñado para interactuar con herramientas externas.
- Sin capacidades de agente ni razonamiento multi-paso: su arquitectura de una sola capa impide razonamientos complejos.
- Sin capacidades multilingües: el vocabulario es exclusivamente numérico y simbólico.
- Sin modo de pensamiento ni capacidades multimodales: es un modelo puramente simbólico para investigación.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo es ideal para estudiar cómo una sola capa de atención y un MLP bilineal implementan la suma con acarreo. Permite visualizar y analizar los circuitos internos que se forman durante el entrenamiento, como se hace en trabajos de análisis de transformers pequeños.
- Estudio comparativo de funciones de activación: al formar parte de una familia de doce modelos con la misma receta de entrenamiento, se pueden comparar los efectos del MLP bilineal frente al ReLU en la capacidad de generalización y en la estructura de los circuitos aprendidos.
- Análisis de la propagación del acarreo en resta: el hecho de que la resta no se resuelva con una sola capa permite investigar qué mecanismos computacionales adicionales requiere la segunda capa, lo que contribuye a la teoría de la capacidad de los transformers.
- Validación de técnicas de análisis de atención: al ser un modelo pequeño y con una tarea bien definida, sirve como banco de pruebas para métodos de extracción de circuitos, atribución de logits o análisis de cabezas de atención.
- Generación de datos sintéticos para pruebas de interpretabilidad: los pesos del modelo pueden utilizarse para generar datos de activación intermedia que sirvan para entrenar o evaluar herramientas de análisis de redes neuronales.
- Educación y divulgación: por su tamaño reducido y su tarea simple, es un recurso didáctico útil para explicar conceptos de transformers, entrenamiento de modelos pequeños y análisis de mecanismos internos en cursos de aprendizaje automático.

## Benchmarks y rendimiento

El modelo no ha sido evaluado en benchmarks estándar de lenguaje natural (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de propósito general. La model card del autor reporta los siguientes resultados para la tarea aritmética:

| Split | Pérdida | Precisión por dígito | Precisión secuencial | Precisión del signo |
|---|---:|---:|---:|---:|
| Validación | 0,2122 | 0,8688 | 0,5676 | 0,0022 |
| Test | 0,2115 | 0,8659 | 0,5664 | 0,0034 |

Precisión por operador (validación):

| Operador | Precisión secuencial | Precisión por dígito | Pérdida |
|---|---:|---:|---:|
| Suma | 0,9436 | 0,9882 | 0,0252 |
| Resta | 0,1916 | 0,7494 | 0,3993 |

La precisión del signo es prácticamente cero por construcción: la pérdida solo se calcula sobre los cinco dígitos de la respuesta y el token de signo se introduce como entrada forzada, por lo que no recibe gradiente. Este comportamiento es intencional y no constituye un fallo del modelo.

## Requisitos de hardware

- El modelo tiene solo 11 584 parámetros, por lo que cabe en cualquier CPU moderna sin necesidad de GPU.
- La VRAM estimada para inferencia es inferior a 1 MB, incluso con precisión completa (float32). Cualquier GPU disponible en el mercado puede ejecutarlo sin problemas.
- No requiere hardware especializado; se puede ejecutar en un ordenador portátil convencional o incluso en un microcontrolador.
- Opciones de despliegue: al ser un modelo de investigación, no está pensado para despliegue en producción. Se puede cargar con PyTorch directamente desde el checkpoint y ejecutarse en cualquier entorno con soporte de tensores.
- La latencia de inferencia es del orden de microsegundos en CPU, y el throughput es irrelevante para aplicaciones prácticas dada su naturaleza de estudio.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. La model card menciona un modelo de referencia, `melephant/1-layer-addition-v2`, que es únicamente de suma y con un vocabulario de 13 tokens sin signo de resta ni token de signo en la respuesta, por lo que no es directamente comparable. No se han encontrado otros modelos con arquitectura bilineal y tarea aritmética en la información disponible.

## Limitaciones y advertencias

- El modelo solo resuelve sumas de forma fiable; las restas presentan una precisión secuencial muy baja (19,16 %), lo que limita su uso a tareas de investigación sobre mecanismos de acarreo.
- La precisión del signo es nula por diseño, ya que el token de signo no recibe gradiente. No debe interpretarse como un fallo del modelo.
- El vocabulario es exclusivamente numérico y simbólico (13 tokens), sin capacidad de procesar lenguaje natural.
- La licencia no está especificada, por lo que no se garantiza su uso comercial o su redistribución sin permiso explícito del autor.
- El modelo está pensado para investigación en interpretabilidad, no para aplicaciones de producción. Su tamaño y tarea lo hacen irrelevante para casos de uso reales.
- Los identificadores de token son propios del proyecto y no coinciden con los de `melephant/1-layer-addition-v2`, según advierte el autor. Si se usan activaciones de este modelo junto con las de otros, hay que verificar la correspondencia de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itzPotato/arithmetic-bilinear-1layer-seed0
- Perfil del autor en Hugging Face: https://huggingface.co/itzPotato
- Modelo de referencia mencionado (melephant/1-layer-addition-v2): no se proporciona URL directa en la información disponible.
