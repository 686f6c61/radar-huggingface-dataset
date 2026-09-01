# itzPotato/arithmetic-bilinear-2layer-seed1

## Resumen

Modelo de investigación en interpretabilidad, desarrollado por itzPotato, que implementa un transformer decoder-only de 2 capas con MLP **bilineal** (en lugar del habitual ReLU) y sin capas de bias ni normalización. Con solo 21.824 parámetros, está entrenado exclusivamente para resolver sumas y restas de números enteros de 4 dígitos con signo, en un formato tokenizado de un token por dígito y operador. Forma parte de una familia de doce modelos que varían en tipo de MLP (ReLU o bilineal), número de capas (1 o 2) y semilla, todos entrenados con la misma receta para aislar el efecto de la arquitectura.

Su relevancia radica en servir como banco de pruebas para estudiar cómo los transformers aprenden operaciones aritméticas, especialmente el mecanismo de propagación de borrow en la resta, y cómo la segunda capa es necesaria para resolver esta tarea. Los resultados muestran que los modelos de 1 capa solo logran sumar, mientras que los de 2 capas resuelven ambas operaciones, lo que permite analizar con precisión qué circuitos internos se forman.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, sin bias ni normalización, MLP bilineal |
| Parametros totales | 21.824 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (secuencias fijas de 16 tokens en la tarea) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (solo dígitos 0-9 y operadores +, -, =) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 2 capas, con d_model=32, d_mlp=64, 4 cabezas de atención con d_head=8, y un MLP bilineal definido como `W_out[(W_L x) * (W_R x)]`, a diferencia del MLP ReLU estándar `W_out ReLU(W_in x)`. No utiliza bias ni normalización en ninguna capa, lo que simplifica el análisis de activaciones. La tarea consiste en predecir los 5 dígitos del resultado de una suma o resta de números de 4 dígitos con signo, precedidos por un token de signo. La pérdida se calcula solo sobre los 5 dígitos de la respuesta; el token de signo se fuerza como entrada y no recibe gradiente, por lo que la precisión de signo es ~0 por construcción.

El entrenamiento se realizó con AdamW (lr 0.02 con decaimiento coseno y 200 pasos de warmup), batch de 1024, weight decay 0.01, grad clip 1.0, y una sola pasada sobre 5.000.000 de ejemplos generados con semilla de datos 1234. La tasa de aprendizaje se seleccionó mediante una prueba de seis puntos sobre ambas variantes de MLP, eligiendo la mayor tasa que mantuviera estabilidad en ambas. El mejor paso fue el 4800 de 4883. La receta es idéntica para los doce modelos de la familia, de modo que la única diferencia estructural es el tipo de MLP y el número de capas.

## Capacidades

- Generación de texto: no aplica, el modelo solo produce secuencias de dígitos y operadores para la tarea aritmética específica.
- Razonamiento aritmético: resuelve sumas y restas de números de 4 dígitos con signo (por ejemplo, `1234 + 0567 = +01801`).
- Precisión de secuencia: 0.9954 en el conjunto de test, con precisión por dígito de 0.9991.
- Precisión por operador: suma 0.9978, resta 0.9928 (precisión de secuencia).
- No soporta tool calling, ni agentes, ni razonamiento multi-paso fuera de la tarea.
- No tiene capacidades multilingües ni de visión.
- Es un modelo de investigación diseñado para análisis de interpretabilidad, no para uso general.

## Casos de uso

- Análisis de circuitos internos en transformers: el modelo permite estudiar cómo se forman los circuitos de atención y MLP que implementan la suma y la resta, especialmente la propagación de borrow en la resta.
- Comparación de arquitecturas de MLP: al existir variantes con MLP ReLU y bilineal bajo la misma receta, se puede aislar el efecto del tipo de MLP en el rendimiento y en las representaciones internas.
- Estudio de la profundidad de red: comparar modelos de 1 y 2 capas revela qué capacidades emergen con la segunda capa (en este caso, la resolución de la resta).
- Validación de técnicas de interpretabilidad: sirve como banco de pruebas para métodos como análisis de activaciones, atribución de importancia o localización de circuitos, al ser un modelo pequeño y completamente observable.
- Generación de datos sintéticos para investigación: las predicciones del modelo pueden usarse para generar datasets etiquetados de operaciones aritméticas con control fino sobre errores.
- Educación en mecanismos de atención: por su tamaño reducido, es útil para demostrar visualizaciones de atención y entender cómo los tokens de dígitos se relacionan entre sí.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados (no hay comparación con otros modelos externos en la información disponible):

| Split | Loss | Precisión de dígito | Precisión de secuencia | Precisión de signo |
|---|---|---|---|---|
| Validación | 0.0033 | 0.9991 | 0.9953 | 0.0000 |
| Test | 0.0030 | 0.9991 | 0.9954 | 0.0000 |

Precisión por operador (test):

| Operador | Precisión de secuencia | Precisión de dígito | Loss |
|---|---|---|---|
| Suma | 0.9978 | 0.9996 | 0.0017 |
| Resta | 0.9928 | 0.9986 | 0.0050 |

La precisión de signo es ~0 por diseño, ya que el token de signo se fuerza como entrada y no recibe gradiente. Los modelos de 1 capa de la misma familia resuelven solo la suma, mientras que los de 2 capas resuelven ambas operaciones.

## Requisitos de hardware

- Al ser un modelo de solo 21.824 parámetros, se puede ejecutar en cualquier CPU sin necesidad de GPU.
- La VRAM requerida es despreciable (menos de 1 MB en FP32); no es relevante para despliegue.
- No se requieren GPUs específicas; puede ejecutarse en equipos de bajo consumo o incluso en microcontroladores.
- Opciones de despliegue: se carga mediante PyTorch con la clase `PretrainTransformer` del repositorio del autor; no está preparado para vLLM, llama.cpp, Ollama ni TGI.
- La latencia es del orden de microsegundos por ejemplo en CPU moderna; el throughput es altísimo pero no se han publicado mediciones formales.

## Comparativa con modelos similares

Dentro de la familia de doce modelos entrenados por el autor, la comparación relevante es entre variantes de MLP y número de capas. No se dispone de datos numéricos de los otros modelos, pero la model card indica que los modelos de 1 capa no resuelven la resta, mientras que los de 2 capas sí. La siguiente tabla resume las diferencias cualitativas:

| Modelo | Capas | MLP | Suma | Resta |
|---|---|---|---|---|
| arithmetic-bilinear-2layer-seed1 | 2 | Bilineal | Sí | Sí |
| Modelos 1 capa (bilineal o ReLU) | 1 | Bilineal o ReLU | Sí | No |
| Modelos 2 capas ReLU (seed 0,1,2) | 2 | ReLU | Sí | Sí (esperado, no verificado) |

No hay comparación con modelos externos de la misma categoría porque se trata de un modelo de investigación muy específico.

## Limitaciones y advertencias

- El modelo solo puede procesar secuencias de exactamente 16 tokens con el formato descrito; no generaliza a números de más dígitos ni a otras operaciones.
- El token de signo no se predice; se fuerza como entrada, por lo que la precisión de signo es 0 por construcción. Esto limita su uso en tareas donde se requiera predecir el signo.
- No tiene sesgos conocidos en el sentido habitual, pero su entrenamiento con un solo tipo de tarea lo hace totalmente inadecuado para cualquier uso fuera de la aritmética de 4 dígitos.
- Riesgo de alucinación: no aplica, ya que no genera texto libre; solo produce dígitos según el patrón aprendido.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o su redistribución.
- Los token ids son propios del proyecto y no coinciden con los de otros modelos de referencia (como `melephant/1-layer-addition-v2`), por lo que no se deben mezclar activaciones sin verificar la tokenización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itzPotato/arithmetic-bilinear-2layer-seed1
- Modelo relacionado (bilinear-attn-addition-carry-2layer): https://huggingface.co/itzPotato/bilinear-attn-addition-carry-2layer
- Modelo relacionado (bilinear-attn-subtraction-borrow-1layer): https://huggingface.co/itzPotato/bilinear-attn-subtraction-borrow-1layer
