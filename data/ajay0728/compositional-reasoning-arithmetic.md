# Ajay0728/Compositional-reasoning-arithmetic

## Resumen

Compositional-reasoning-arithmetic es un repositorio de investigación publicado por el usuario Ajay0728 en HuggingFace que contiene los 12 checkpoints entrenados para el artículo *Partial Competence and Limited Transfer: Comparing LSTM and Transformer Generalization on Arithmetic Expressions* (arXiv ID pendiente en el momento de redactar esta ficha). No es un modelo de lenguaje generativo de propósito general, sino una colección de artefactos experimentales: cada checkpoint resuelve una única tarea, leer una expresión aritmética entera completamente parentetizada y devolver su valor (por ejemplo, `((14 - 1) * 10)` → `130`).

El repositorio cubre dos arquitecturas entrenadas desde cero: un encoder-decoder basado en LSTM bidireccional (embedding 128, hidden 256, aproximadamente 2,1 millones de parámetros) y un transformer seq2seq de 3 capas de encoder y 3 de decoder con 8 cabezas de atención y posiciones sinusoidales (d_model 256, aproximadamente 5,5 millones de parámetros). El diseño experimental es 2 arquitecturas × 2 estudios × 3 semillas = 12 ejecuciones, cada una guardada en el checkpoint con mejor precisión de validación.

Su relevancia es exclusivamente científica: sirve para estudiar generalización composicional y generalización de longitud en modelos pequeños. El propio autor advierte en la model card que no son calculadoras útiles, ya que el mejor modelo apenas alcanza en torno al 35 % de coincidencia exacta sobre expresiones dentro de la distribución de entrenamiento. La licencia es Apache 2.0 y el repositorio completo ocupa 0,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos variantes: LSTM encoder-decoder (encoder LSTM bidireccional, decoder LSTM unidireccional) y transformer seq2seq (3 capas de encoder + 3 de decoder, 8 cabezas, posiciones sinusoidales) |
| Parametros totales | LSTM: ~2,1 millones; transformer: ~5,5 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | `max_input_len=64` caracteres de entrada y `max_output_len=12` caracteres de salida; las entradas mas largas lanzan un error en lugar de truncarse |
| Tipos de cuantizacion | No disponible (solo checkpoints PyTorch en punto flotante; no hay versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible en terminos de lenguaje natural; el vocabulario es un conjunto de 20 caracteres aritmeticos (`<PAD>`, `<SOS>`, `<EOS>`, `0123456789+-*/()` y espacio) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`), diccionario con `model_state_dict`, `optimizer_state_dict`, `epoch`, `val_loss`, `val_accuracy`, `seed`, `dataset_version` y `generator_commit` |

## Arquitectura y entrenamiento

La primera familia de checkpoints usa una arquitectura recurrente: un encoder LSTM bidireccional que procesa la expresión de entrada carácter a carácter y un decoder LSTM unidireccional que genera la respuesta de forma autorregresiva. Configuración: dimensión de embedding 128, tamaño oculto 256, en torno a 2,1 millones de parámetros y tasa de aprendizaje 1e-3. La segunda familia es un transformer seq2seq clásico con 3 capas de encoder y 3 de decoder, `d_model` 256, 8 cabezas de atención, codificación posicional sinusoidal y aproximadamente 5,5 millones de parámetros, entrenado con una tasa de aprendizaje de 3e-4.

Ambas arquitecturas comparten exactamente el mismo protocolo de entrenamiento: tokenización a nivel de carácter con un vocabulario de 20 tokens, teacher forcing, optimizador Adam, tamaño de lote 64, 400 pasos de calentamiento seguidos de un decaimiento coseno hasta 1e-5, un máximo de 200 épocas y parada temprana sobre la precisión de validación con paciencia 50. Los datos provienen del dataset `Ajay0728/Compositional-reasoning-arithmetic-datasets` (versión `datasets_v2`), generado con el script `data/generate_controlled.py`. Todas las expresiones están completamente parentetizadas, la división es siempre exacta (sin restos) y todo resultado cumple |resultado| ≤ 10 000. La división representa solo entre el 3 % y el 5 % de los operadores en cada partición, porque el requisito de división exacta descarta la mayoría de candidatos.

Los dos estudios experimentales separan dos ejes de generalización. El estudio 1 (longitud) entrena con expresiones de 2 a 3 operaciones y profundidad 2-3 (8 000/1 000/1 000 para entrenamiento/validación/test dentro de la distribución) y evalúa fuera de distribución con 4, 5, 6 y 7 operaciones y profundidad 3 (1 000 ejemplos por configuración). El estudio 2 (profundidad) entrena con 3 operaciones y profundidad 2 (8 000/1 000/1 000) y evalúa fuera de distribución con 3 operaciones encadenadas en profundidad 3 (1 000 ejemplos). No se menciona en la información disponible ningún uso de RLHF, DPO ni ajuste por preferencias; son modelos entrenados desde cero con aprendizaje supervisado.

## Capacidades

- Evaluación de expresiones aritméticas enteras completamente parentetizadas con espacios alrededor de cada operador, en el formato exacto visto en entrenamiento.
- Generación de la respuesta mediante decodificación autorregresiva voraz (greedy), carácter a carácter, con parada al alcanzar `<EOS>` o `<PAD>`.
- Suma, resta, multiplicación y división exacta de enteros, con resultados acotados a |valor| ≤ 10 000 en los datos de entrenamiento.
- Dos arquitecturas alternativas (LSTM y transformer) comparables bajo el mismo protocolo, lo que permite estudiar diferencias de generalización entre ambas.
- No dispone de soporte de tool calling, function calling ni uso como agente.
- No dispone de razonamiento multi-paso general, ni de capacidades de visión, audio o modalidades adicionales.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural: su entrada es un alfabeto restringido de 20 caracteres.
- Capacidad de interpretabilidad: los checkpoints se publican como artefactos de investigación para analizar competencia parcial y transferencia limitada.

## Casos de uso

- Estudio académico de generalización composicional: reproduce los experimentos de los estudios 1 y 2 para analizar cómo degrada la precisión al aumentar el número de operaciones o la profundidad de anidamiento, usando las mismas particiones fuera de distribución.
- Estudio de generalización de longitud: evalúa los checkpoints LSTM frente a los transformer con expresiones de 4 a 7 operaciones y compara la caída de coincidencia exacta entre arquitecturas.
- Análisis de interpretabilidad de redes neuronales pequeñas: al tener 2,1 y 5,5 millones de parámetros y un vocabulario de 20 símbolos, permite inspeccionar estados ocultos, atención y representaciones internas sin necesidad de infraestructura de gran escala.
- Docencia y prácticas de aprendizaje profundo: sirve como banco de pruebas reproducible de seq2seq, teacher forcing, decodificación greedy y parada temprana en un problema con espacio de salida verificable.
- Referencia de línea base para investigación en razonamiento aritmético: proporciona un punto de comparación de bajo coste antes de escalar a modelos mayores y datasets sintéticos más complejos.
- Validación de pipelines de generación controlada de datos: el script `generate_controlled.py` y el dataset `datasets_v2` permiten auditar cómo las restricciones de parentetización, división exacta y cota de resultados afectan a la distribución final, incluida la escasez de operadores de división.
- Prueba de infraestructuras ligeras de entrenamiento e inferencia: entrenar y evaluar estos modelos es viable en CPU, lo que facilita la integración en sistemas de CI para regresiones sobre código de modelos.

## Benchmarks y rendimiento

Los únicos resultados publicados son las precisiones de coincidencia exacta con decodificación autorregresiva voraz, tal como aparecen en la model card y con el procedimiento de `scripts/eval/cold_verify.py`.

| Checkpoint | Mejor epoca | Validacion | Test |
|---|---|---|---|
| lstm/study1/seed0 | 43 | 35,1 % | 33,6 % |
| lstm/study1/seed1 | 46 | 35,9 % | 35,5 % |
| lstm/study1/seed2 | 51 | 36,1 % | 34,6 % |
| lstm/study2/seed0 | 57 | 32,5 % | 31,8 % |
| lstm/study2/seed1 | 195 | 30,1 % | 31,6 % |
| lstm/study2/seed2 | 66 | 32,0 % | 28,0 % |
| transformer/study1/seed0 | 114 | 7,5 % | 7,9 % |
| transformer/study1/seed1 | 160 | 6,8 % | 7,7 % |
| transformer/study1/seed2 | 160 | 7,5 % | 7,9 % |
| transformer/study2/seed0 | 34 | 3,7 % | 1,9 % |
| transformer/study2/seed1 | 162 | 4,2 % | 2,8 % |
| transformer/study2/seed2 | 51 | 3,8 % | 2,1 % |

No se han publicado en la información disponible resultados numéricos de los splits fuera de distribución, ni métricas estándar como MMLU, HumanEval o GSM8K, que no son aplicables a este modelo.

## Requisitos de hardware

- Inferencia en CPU: viable sin GPU. Con 2,1 y 5,5 millones de parámetros, ambos modelos caben holgadamente en memoria principal y los pesos en punto flotante de 32 bits ocupan del orden de 8,4 MB (LSTM) y 22 MB (transformer).
- VRAM estimada: inferior a 1 GB en cualquiera de las dos arquitecturas, incluido el estado del optimizador si se carga el checkpoint completo.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer, incluidas tarjetas de gama de entrada y modelos integrados, es más que suficiente; también funcionan RTX 4090, A100 o H100, pero están enormemente sobredimensionadas para esta carga.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en aceleradores integrados de baja potencia.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF. El único procedimiento documentado es cargar el `.pt` con PyTorch y usar el código de modelo y tokenizador del repositorio de GitHub, con decodificación voraz manual.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño y el límite de 12 caracteres de salida, el coste por inferencia es mínimo, pero no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de modelos externos comparables en la información proporcionada, ya que se trata de un artefacto de investigación para una tarea sintética concreta y no de un modelo de propósito general. La comparación relevante es interna, entre las dos arquitecturas del propio repositorio:

| Criterio | LSTM | Transformer |
|---|---|---|
| Parametros | ~2,1 millones | ~5,5 millones |
| Estructura | Encoder LSTM bidireccional + decoder LSTM unidireccional | 3 capas de encoder + 3 de decoder, 8 cabezas, posiciones sinusoidales |
| Tasa de aprendizaje | 1e-3 | 3e-4 |
| Mejor validacion (estudio 1) | 36,1 % | 7,5 % |
| Mejor test (estudio 1) | 35,5 % | 7,9 % |
| Mejor validacion (estudio 2) | 32,5 % | 4,2 % |
| Mejor test (estudio 2) | 31,8 % | 2,8 % |
| Licencia | Apache 2.0 | Apache 2.0 |

En el mejor caso, el LSTM supera al transformer en más de 25 puntos porcentuales de coincidencia exacta en el estudio 1, con menos de la mitad de parámetros.

## Limitaciones y advertencias

- Rendimiento bajo incluso dentro de la distribución: el mejor checkpoint alcanza un 35,5 % de coincidencia exacta en test, de modo que falla aproximadamente dos de cada tres expresiones.
- No es una calculadora fiable ni un componente apto para producción: el autor lo declara explícitamente como artefacto de investigación.
- Formato de entrada rígido: exige parentetización completa y espacios alrededor de cada operador; cualquier desviación del formato de entrenamiento queda fuera de la distribución soportada.
- Límite duro de longitud: entradas de más de 64 caracteres y salidas de más de 12 caracteres provocan error, no truncamiento.
- Sesgo de distribución en los datos: la división representa solo entre el 3 % y el 5 % de los operadores porque el requisito de división exacta descarta la mayoría de casos, por lo que el comportamiento en divisiones es poco representativo.
- Sesgo de rango: todos los datos de entrenamiento tienen |resultado| ≤ 10 000 y división exacta; no hay evidencia de comportamiento correcto fuera de ese rango o con restos.
- Sin generalización demostrada fuera de la distribución en los resultados publicados: los splits OOD de los estudios 1 y 2 existen, pero la información disponible no incluye sus cifras, lo que impide cuantificar la transferencia.
- Riesgo de alucinación en el sentido de producir salidas sintácticamente válidas pero numéricamente incorrectas, dado que la decodificación voraz no verifica el resultado.
- Idiomas: no aplica soporte multilingüe; el modelo no procesa lenguaje natural.
- Licencia Apache 2.0, que permite uso comercial, pero el escaso rendimiento y la naturaleza experimental hacen desaconsejable cualquier uso en producción.
- El repositorio ocupa 0,6 GB porque cada `.pt` incluye el estado del optimizador Adam, lo que multiplica por tres el tamaño de los pesos; conviene tenerlo en cuenta al descargar.
- El artículo asociado tiene arXiv ID pendiente en la información disponible, por lo que no puede citarse con referencia definitiva.
- Los resultados de la búsqueda web no contienen información relevante sobre este modelo: los enlaces recuperados tratan sobre recambios de motocicleta y teléfonos móviles, y no guardan relación con el modelo evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ajay0728/Compositional-reasoning-arithmetic
- Dataset de entrenamiento: https://huggingface.co/datasets/Ajay0728/Compositional-reasoning-arithmetic-datasets
- Repositorio de código: https://github.com/bcode0127-debug/Compositional-Reasoning-Arithmetic
- Script de evaluación citado en la model card: `scripts/eval/cold_verify.py` (dentro del repositorio de GitHub)
- Script de generación de datos: `data/generate_controlled.py` (dentro del repositorio de GitHub)
- Artículo: *Partial Competence and Limited Transfer: Comparing LSTM and Transformer Generalization on Arithmetic Expressions*, arXiv ID pendiente (no disponible)
- Resultados de búsqueda web relevantes: no disponible
