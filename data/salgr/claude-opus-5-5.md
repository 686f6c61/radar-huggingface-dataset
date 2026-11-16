# salgr/Claude-Opus-5.5

## Resumen

Claude Opus 5.5 es, pese al nombre, un perceptrón multicapa de 55.000 parámetros publicado por el usuario `salgr` en Hugging Face bajo licencia Apache 2.0. No guarda relación alguna con los modelos Claude de Anthropic: se trata de una red neuronal de una sola entrada y una sola salida entrenada para aproximar la función matemática `sin(2x) + 0.5·cos(5x)` sobre el intervalo [−3, 3]. El nombre y las etiquetas (`Claude`, `Claude 5.5`, `Claude Opus`, `Official`) son deliberadamente engañosos y no deben interpretarse como una indicación de procedencia.

El modelo resuelve un problema de regresión univariante de juguete. Su arquitectura es una MLP totalmente conectada de cinco capas (1 → 64 → 151 → 208 → 64 → 1) con activación `tanh` en las capas ocultas y salida lineal, implementada en NumPy con retropropagación manual. Los tamaños de las capas ocultas se eligieron para que el recuento total de parámetros fuese exactamente 55.000, lo que confirma su carácter demostrativo.

Es relevante únicamente como ejemplo didáctico de entrenamiento desde cero, no como modelo de lenguaje. No procesa texto, no tiene tokenizador, no dispone de ventana de contexto y no puede utilizarse para generación de lenguaje natural, pese a que la etiqueta `pipeline_tag` indique `text-generation`. Cualquier uso en producción de NLP sería un error de categoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado, 1 → 64 → 151 → 208 → 64 → 1 |
| Parámetros totales | 55.000 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de regresión escalar, sin contexto) |
| Tipos de cuantización | No disponible (pesos en `float32`; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (pesos en `float32`) |

## Arquitectura y entrenamiento

La red es una MLP de cinco capas lineales con activación `tanh` en las cuatro capas ocultas y salida lineal. La entrada es un escalar `x` y la salida un escalar `ŷ`. Los pesos se inicializan con distribución normal `N(0, 1/fan_in)` y los sesgos a cero. El desglose de parámetros es: 128 en la primera capa, 9.815 en la segunda, 31.616 en la tercera, 13.376 en la cuarta y 65 en la capa de salida, sumando exactamente 55.000.

El entrenamiento emplea un dataset sintético de 512 puntos de entrenamiento y 256 de validación, con `x` uniforme en [−3, 3] y `y = sin(2x) + 0.5·cos(5x) + ε`, donde `ε` es ruido gaussiano con desviación típica 0,05 (varianza 0,0025). La función de pérdida es el error cuadrático medio (MSE), con gradientes calculados a mano mediante retropropagación en NumPy. La optimización usa Adam en modo full-batch (512 puntos por paso), con tasa de aprendizaje inicial de 0,002 y decaimiento coseno hasta 0, durante 4.000 iteraciones. Según la model card, una ejecución previa con tasa constante terminó con peor MSE de validación (0,00327 frente a 0,00290) por una deriva al alza de la pérdida al final del entrenamiento; el decaimiento coseno corrigió ese comportamiento.

## Capacidades

- Aproximación de una función escalar univariante concreta: `sin(2x) + 0.5·cos(5x)` en el intervalo [−3, 3].
- Regresión numérica de entrada única y salida única (1 → 1).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo thinking, visión, audio ni ninguna modalidad adicional.
- No dispone de tokenizador ni de vocabulario.

## Casos de uso

- Material didáctico de retropropagación manual: el repositorio incluye `train.py` con la implementación en NumPy, útil para explicar el cálculo de gradientes sin frameworks de autograd en cursos de introducción al aprendizaje profundo.
- Ejemplo de ajuste de curvas sintéticas: sirve para ilustrar el efecto del ruido gaussiano y la diferencia entre MSE de entrenamiento y de validación en un entorno controlado.
- Demostración de schedulers de tasa de aprendizaje: la comparación documentada entre tasa constante y decaimiento coseno es un caso concreto para discutir la estabilidad del entrenamiento.
- Prueba de infraestructura de carga de `safetensors`: al ser un modelo diminuto, permite verificar pipelines de descarga, carga y serialización sin coste computacional.
- Ejercicio de detección de nombres engañosos en repositorios: útil para formar a revisores en la verificación de model cards frente a etiquetas y títulos.
- Referencia de juguete en pruebas de herramientas de evaluación: puede emplearse como caso base negativo para comprobar que un harness de benchmarks de NLP rechaza correctamente modelos sin tokenizador.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de entrenamiento y validación del propio autor. No hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje.

| Iteración | MSE entrenamiento | MSE validación |
|---|---|---|
| 1 | 1,26461 | 1,31803 |
| 400 | 0,00270 | 0,00333 |
| 800 | 0,00210 | 0,00295 |
| 1200 | 0,00203 | 0,00290 |
| 2000 | 0,00201 | 0,00289 |
| 4000 (final) | 0,00200 | 0,00290 |

La varianza del ruido en los datos es 0,0025. El MSE de validación final (0,00290) queda aproximadamente un 16 % por encima de esa varianza, mientras que el de entrenamiento (0,00200) está ligeramente por debajo, lo que indica un ajuste leve al ruido de los puntos de entrenamiento: la red tiene 55.000 parámetros para solo 512 muestras.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB en `float32` (55.000 parámetros × 4 bytes ≈ 220 KB), holgadamente dentro de cualquier GPU, CPU o incluso microcontrolador.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. Funciona en A100, H100, RTX 4090 o en un portátil sin aceleración.
- Cabe en cualquier GPU de consumo, incluida la gama integrada.
- Opciones de despliegue: carga directa con `safetensors` y NumPy; no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no documentados; por el tamaño, la inferencia es prácticamente instantánea (microsegundos por evaluación en CPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la búsqueda realizada. Por su naturaleza (MLP de regresión escalar de 55.000 parámetros), no es equiparable a modelos de lenguaje como Claude, GPT o Llama pese al nombre, ni a otras MLP de juguete publicadas, de las que no se aportan datos.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Claude Opus 5.5 (salgr) | 55.000 | No aplica | Regresión escalar | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El nombre y las etiquetas (`Claude`, `Claude Opus 5.5`, `Official`) inducen a error: no es un modelo de Anthropic ni un modelo de lenguaje. Cualquier uso esperando capacidades de NLP fallará.
- La etiqueta `pipeline_tag: text-generation` es incorrecta para la arquitectura descrita; no genera texto.
- Dominio de validez limitado: solo aproxima la función objetivo en el intervalo [−3, 3]; fuera de él el comportamiento no está garantizado.
- Sobreajuste leve al ruido: 55.000 parámetros frente a 512 muestras de entrenamiento, con MSE de entrenamiento por debajo de la varianza del ruido.
- No hay información sobre sesgos, alucinación ni comportamiento en producción porque no procesa datos lingüísticos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no tiene aplicación comercial realista más allá de la docencia o la prueba de infraestructura.
- El tamaño del repositorio indicado (0,0 GB) es coherente con los ~220 KB de pesos, pero conviene verificar la integridad de los ficheros antes de usarlo en pipelines automatizados.
- No se documentan limitaciones de contexto ni de idioma porque no existen tales dimensiones en el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/salgr/Claude-Opus-5.5
- Referencia no relacionada encontrada en la búsqueda (mismo término "Salgr", sin relación con el modelo): https://3ps.miraheze.org/wiki/Salgr
