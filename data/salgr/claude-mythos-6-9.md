# salgr/Claude-Mythos-6.9

## Resumen

Claude Mythos 6.9 es un modelo publicado en Hugging Face por el usuario salgr bajo un nombre y una etiquetación que remiten a la familia Claude, pero cuyo contenido real es un perceptrón multicapa de 69 parámetros entrenado para aproximar la función matemática `sin(x) + 0.5·cos(2x)`. No se trata de un modelo de lenguaje: la arquitectura descrita en la model card es una red totalmente conectada 1 → 6 → 7 → 1 con activación tanh en las capas ocultas y salida lineal, con pesos en `float32`. La etiqueta `text-generation` del pipeline y los tags `Claude`, `SOTA`, `Uncensored` y `Official` no se corresponden con el contenido técnico del repositorio.

El modelo resuelve un problema de regresión univariante sobre un dataset sintético de 100 puntos de entrenamiento y 50 de validación, generados con ruido gaussiano de desviación 0,05 sobre el intervalo [−π, π]. El entrenamiento se realizó con Adam a batch completo durante 5000 iteraciones y una tasa de aprendizaje constante de 0,02, implementando la retropropagación a mano en NumPy. El error cuadrático medio final es de 0,00629 en entrenamiento y 0,00682 en validación, por encima de la varianza del ruido (0,0025), lo que indica que la red no ha alcanzado el límite impuesto por el ruido de los datos.

Su relevancia práctica es prácticamente nula como modelo de IA generativa: no procesa texto, no tiene tokenizador, no dispone de ventana de contexto y su tamaño en disco es de 0,0 GB. Resulta útil únicamente como ejemplo didáctico mínimo de entrenamiento de una red neuronal desde cero, o como caso de estudio de etiquetado engañoso en repositorios de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa totalmente conectado 1 → 6 → 7 → 1, activación tanh en capas ocultas y salida lineal |
| Parametros totales | 69 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de regresión escalar, sin contexto) |
| Tipos de cuantizacion | no disponible (pesos en `float32`) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa con una entrada escalar y una salida escalar. La primera capa `Linear(1→6)` aporta 12 parámetros (6 pesos y 6 sesgos), la segunda `Linear(6→7)` aporta 49 (42 pesos y 7 sesgos) y la capa de salida `Linear(7→1)` aporta 8 (7 pesos y 1 sesgo), sumando 69 parámetros. La inicialización sigue pesos ~ N(0, 1/fan_in) y sesgos a cero, con pesos almacenados en `float32`.

El entrenamiento emplea un dataset sintético donde `x` se distribuye uniformemente en [−π, π] e `y = sin(x) + 0.5·cos(2x) + ε`, con ε gaussiano de desviación 0,05, generado con `numpy.random.default_rng(0)`. Se usan 100 puntos para entrenamiento y 50 para validación. La pérdida es el error cuadrático medio, los gradientes se calculan manualmente mediante retropropagación en NumPy (véase `train.py`) y la optimización usa Adam (β₁ = 0,9, β₂ = 0,999, ε = 1e-8) con tasa de aprendizaje constante de 0,02, batch completo de 100 y 5000 iteraciones. No hay RLHF, DPO ni ninguna técnica de alineación; tampoco decodificación especulativa ni atención, al no ser un transformer.

## Capacidades

- Aproximación de una función escalar univariante concreta: `sin(x) + 0.5·cos(2x)` sobre el intervalo [−π, π].
- Regresión numérica de una entrada y una salida, sin capacidad de generar secuencias.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Material didáctico de retropropagación: el repositorio incluye una implementación manual en NumPy (`train.py`) que sirve para enseñar el cálculo de gradientes y el bucle de optimización en un caso mínimo.
- Ejemplo introductorio de entrenamiento con Adam: permite ilustrar el efecto de la tasa de aprendizaje, el batch completo y el número de iteraciones sobre la convergencia en una red de juguete.
- Estudio de curvas de aprendizaje y sobreajuste: con 69 parámetros y curvas de MSE de entrenamiento y validación muy próximas, es un caso claro para discutir la ausencia de sobreajuste en modelos de baja capacidad.
- Aproximación de funciones trigonométricas simples en contextos educativos o de demostración, siempre que se acepte un error cuadrático medio en torno a 0,006.
- Auditoría de etiquetado en Hugging Face: sirve como ejemplo de repositorio cuyos tags (`Claude`, `SOTA`, `Official`, `Uncensored`) no reflejan el contenido, útil para diseñar heurísticas de verificación de model cards.
- Prueba de pipelines de carga de safetensors: al ser un artefacto mínimo, permite validar herramientas de inspección de pesos y de metadatos sin coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la evolución del MSE durante el entrenamiento:

| Iteracion | MSE entrenamiento | MSE validacion |
|---|---|---|
| 1 | 1,39811 | 1,29456 |
| 500 | 0,00737 | 0,00772 |
| 1000 | 0,00714 | 0,00771 |
| 2000 | 0,00687 | 0,00729 |
| 3000 | 0,00674 | 0,00700 |
| 4000 | 0,00656 | 0,00688 |
| 5000 (final) | 0,00629 | 0,00682 |

La varianza del ruido en los datos es 0,0025, por lo que el error final es aproximadamente 2,5 veces superior a ese límite. El autor indica que la pérdida seguía descendiendo lentamente en la iteración 5000 y que la capacidad del modelo o el número de iteraciones podrían ser insuficientes, sin haberlo comprobado experimentalmente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los 69 parámetros en `float32` ocupan unos 276 bytes.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en CPU sin dificultad.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU, y también en CPU.
- Opciones de despliegue: al no ser un modelo de lenguaje, no aplica vLLM, TGI ni llama.cpp; la inferencia se realiza ejecutando el código de `train.py` o cargando los tensores safetensors con PyTorch o NumPy.
- Latencia y throughput: no disponibles; al tratarse de una única pasada por tres capas lineales, la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (regresión escalar con MLP de 69 parámetros) ni alternativas de la familia Claude con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El nombre y los tags (`Claude`, `Claude Mythos 6.9`, `SOTA`, `Uncensored`, `Official`) no guardan relación con el contenido real del repositorio, que es un MLP de 69 parámetros; puede inducir a error a quien lo encuentre por búsqueda.
- No es un modelo de lenguaje: no genera texto, no tiene tokenizador ni ventana de contexto, y no puede usarse para ninguna tarea de NLP.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de extrapolación incorrecta fuera del intervalo [−π, π] de entrenamiento.
- El error final (MSE 0,00629 en entrenamiento) supera la varianza del ruido (0,0025); la aproximación de la función no es exacta y el autor no ha determinado si se debe a falta de capacidad o a falta de iteraciones.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial.
- No se han publicado datos sobre sesgos, idiomas soportados ni restricciones de producción, al no ser aplicables a este tipo de artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/salgr/Claude-Mythos-6.9
- Resultado de búsqueda web no relacionado con el modelo (wiki de un simulador de planetas): https://3ps.miraheze.org/wiki/Salgr
