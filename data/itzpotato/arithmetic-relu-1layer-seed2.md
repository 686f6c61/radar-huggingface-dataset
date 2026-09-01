# itzPotato/arithmetic-relu-1layer-seed2

## Resumen

El modelo `itzPotato/arithmetic-relu-1layer-seed2` es un transformer decoder-only de una sola capa, sin bias ni normalización, con MLP ReLU, entrenado específicamente para la tarea de suma y resta de números enteros de 4 dígitos con signo. Lo desarrolla itzPotato (Rohan Sashank Babbellapati) como parte de un proyecto de interpretabilidad que compara doce modelos idénticos en arquitectura y entrenamiento, variando únicamente el tipo de MLP (ReLU o bilineal) y el número de capas (1 o 2). Con solo 9.536 parámetros, es un modelo de juguete diseñado para estudiar cómo los transformers aprenden aritmética simbólica, no para uso productivo.

El modelo resuelve correctamente la suma (precisión de secuencia del 98,42% en validación) pero falla en la resta (precisión de secuencia del 8,32%), lo que demuestra que una sola capa no es suficiente para propagar el acarreo en la resta. La precisión del signo es 0 por construcción: la pérdida solo se calcula sobre los cinco dígitos de la respuesta, no sobre el token de signo. Este modelo es relevante para la comunidad de interpretabilidad porque permite aislar el efecto de la arquitectura del MLP en una tarea controlada, con un coste computacional mínimo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 1 capa, 4 cabezas de atención, d_model=32, d_mlp=64, d_head=8 |
| Parametros totales | 9.536 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16 tokens (fijo, formato de entrada de la tarea) |
| Tipos de cuantizacion | no disponible (pesos en float32, sin cuantización publicada) |
| Idiomas soportados | no disponible (vocabulario numérico de 13 tokens: dígitos 0-9, '+', '-', '=') |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de una capa, sin capas de bias ni normalización, con MLP ReLU (`W_out ReLU(W_in x)`). Cada token representa un dígito, el operador o el signo; la entrada se compone de 16 tokens (por ejemplo, `1 2 3 4 + 0 5 6 7 = + 0 1 8 0 1`). La pérdida se calcula únicamente sobre los cinco dígitos de la respuesta, no sobre el token de signo, que se introduce como entrada forzada (teacher forcing). El vocabulario tiene 13 tokens: dígitos 0-9, '+', '-', '='.

El entrenamiento sigue una receta idéntica para los doce modelos del proyecto: optimizador AdamW con lr 0.02 (cosine, 200 warmup steps), batch 1024, weight decay 0.01, grad clip 1.0, una sola pasada sobre 5.000.000 de ejemplos. La tasa de aprendizaje se eligió mediante un barrido de seis puntos probado en variantes ReLU y bilineal, fijándose en el valor más alto donde ambas permanecen estables, de modo que la receta no favorece a ningún tipo de MLP. El modelo usa semilla 2 para los pesos y semilla 1234 para los datos, idéntica en los doce. El mejor paso de entrenamiento fue el 4800 de 4883.

## Capacidades

- Realiza suma de números enteros de 4 dígitos con signo (precisión de secuencia del 98,42% en validación).
- Realiza resta de números enteros de 4 dígitos con signo, pero con muy baja precisión (8,32% en validación), lo que indica que no ha aprendido el mecanismo de propagación de acarreo.
- Genera la respuesta token a token, con un token de signo que se fuerza como entrada y no se predice.
- Es un modelo de investigación para interpretabilidad, no un LLM generalista: no genera texto libre, no razona sobre otros dominios, no soporta tool calling ni agentes.

## Casos de uso

- Estudio de circuitos internos en transformers: permite analizar cómo una sola capa de atención y MLP implementa la suma de dígitos, identificando cabezas de atención y neuronas específicas que codifican operaciones aritméticas.
- Comparación de mecanismos de aprendizaje entre MLP ReLU y bilineal: al existir doce modelos con la misma receta y solo variar el tipo de MLP y el número de capas, se puede aislar el efecto de la arquitectura en la habilidad de resolver resta.
- Análisis de la representación de números y operadores: con un vocabulario tan reducido, es posible visualizar y estudiar cómo se organizan las representaciones internas de dígitos, signos y posiciones.
- Investigación sobre la necesidad de profundidad para tareas composicionales: los resultados muestran que una capa no basta para la resta, lo que sirve para estudiar qué tipo de computación requiere profundidad adicional.
- Prueba de técnicas de intervención en activaciones: al ser un modelo pequeño y sin normalización, es fácil intervenir en las activaciones para verificar hipótesis sobre el papel de cada componente.
- Reproducción de experimentos de interpretabilidad: el código y la configuración están disponibles, lo que permite replicar el entrenamiento y los análisis en entornos académicos.

## Benchmarks y rendimiento

Los resultados reportados en la model card son:

| Split | Loss | Precisión por dígito | Precisión de secuencia | Precisión de signo |
|---|---:|---:|---:|---:|
| Validación | 0.3207 | 0.8161 | 0.5337 | 0.0000 |
| Test | 0.3199 | 0.8171 | 0.5364 | 0.0000 |

Precisión por operador (split de validación):

| Operador | Precisión de secuencia | Precisión por dígito | Loss |
|---|---:|---:|---:|
| Suma | 0.9842 | 0.9968 | 0.0077 |
| Resta | 0.0832 | 0.6354 | 0.6337 |

La precisión de signo es 0 por construcción: la pérdida no se calcula sobre el token de signo, por lo que el modelo nunca recibe gradiente para predecirlo. El autor aclara que no es un error, sino una decisión de diseño. La precisión de secuencia requiere acertar los cinco dígitos de la respuesta.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo tiene solo 9.536 parámetros y ocupa aproximadamente 38 KB en float32.
- GPU recomendada: ninguna; se puede ejecutar en CPU en milisegundos.
- Compatible con cualquier hardware, incluso Raspberry Pi o entornos sin aceleración.
- Opciones de despliegue: se carga con PyTorch mediante el código proporcionado en la model card (`PretrainTransformer.from_directory`). No se han publicado versiones GGUF, ONNX ni integraciones con vLLM, Ollama o TGI.
- Latencia: despreciable, del orden de microsegundos por inferencia en CPU.

## Comparativa con modelos similares

No hay modelos comparables en el mismo nicho (transformers de una capa entrenados para aritmética con signo y orientados a interpretabilidad). El autor menciona un modelo de referencia, `melephant/1-layer-addition-v2`, pero es de adición únicamente y con un vocabulario de 13 tokens que no incluye el signo de la respuesta, por lo que no es directamente comparable. Los otros once modelos del mismo autor (ReLU/bilineal × 1/2 capas × semillas 0,1,2) comparten receta y permiten comparaciones internas, pero no se han publicado métricas individuales en esta ficha.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo procesa secuencias de dígitos y operadores en el formato específico de la tarea; no genera texto ni razona fuera de ese ámbito.
- No aprende la resta: la precisión de secuencia en resta es del 8,32%, muy inferior al azar si se considera la dificultad de acertar cinco dígitos; el modelo no ha desarrollado el mecanismo de propagación de acarreo.
- La precisión de signo es 0 por diseño, no por fallo; si se espera que el modelo prediga el signo, los resultados serán engañosos.
- El vocabulario y los ids de token son propios del proyecto; no coinciden con los del modelo de referencia `melephant/1-layer-addition-v2`, por lo que no se pueden combinar activaciones de ambos sin verificar la correspondencia.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación; se recomienda contactar al autor antes de cualquier uso fuera de investigación.
- No se han publicado análisis de sesgos o riesgos de alucinación; al ser un modelo de juguete, no aplican los riesgos típicos de los LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itzPotato/arithmetic-relu-1layer-seed2
- Perfil del autor en Hugging Face: https://huggingface.co/itzPotato
- Modelo de referencia mencionado (no comparable directamente): https://huggingface.co/melephant/1-layer-addition-v2
