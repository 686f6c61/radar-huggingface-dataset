# marsmute/pusht-leworldmodel-horizon3

## Resumen

PushT LeWorldModel (horizonte de tres acciones) es un checkpoint de modelo del mundo entrenado localmente por el usuario marsmute para el entorno de manipulación robótica PushT. No es una política de control ni un modelo generativo de imágenes: se trata de un predictor latente que, a partir de tres observaciones RGB de 224 × 224 y de grupos de tres acciones brutas, estima el estado visual latente resultante tras el último grupo de acciones propuesto. Su función es servir como componente de bajo nivel dentro de planificadores tipo CEM/MPC o de sistemas jerárquicos, no de operar el entorno por sí mismo.

El modelo combina tres piezas: un Vision Transformer de 12 capas que codifica cada observación, un codificador de acciones que comprime tres acciones bidimensionales de PushT en un único token y un transformer autorregresivo condicional de 6 capas y 16 cabezas de atención que predice el siguiente estado latente en un espacio de 192 dimensiones. El conjunto suma 18.034.438 parámetros, un tamaño que lo sitúa en la categoría de modelos pequeños aptos para inferencia en CPU, Apple MPS o GPU.

Su relevancia actual es fundamentalmente metodológica: permite estudiar la granularidad temporal de los modelos del mundo aprendidos (transiciones de tres acciones frente a cinco) y reproducir el componente de bajo nivel de los experimentos Hi-LeWM. El repositorio se publica bajo licencia MIT, con pesos en SafeTensors y con un aviso explícito de que el modelo no incluye decodificador de píxeles, modelo de recompensa, selector de acciones ni clasificador de éxito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Vision Transformer de 12 capas (codificador visual) + codificador de acciones + transformer autorregresivo condicional de 6 capas y 16 cabezas de atención; proyecciones de entrada y de predicción a espacio latente de 192 dimensiones |
| Parámetros totales | 18.034.438 |
| Parámetros activos | No procede (no es un modelo MoE) |
| Longitud de contexto | No es un contexto de tokens de texto: la entrada es de 3 observaciones históricas separadas por 3 acciones brutas cada una, más un grupo de 3 acciones futuras propuestas |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en el formato de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplicable / no disponible (modelo visomotor para robótica, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | SafeTensors (`pusht_lewm_fs3_epoch10.safetensors`); el checkpoint antiguo en pickle se excluye deliberadamente de la release |

Especificaciones adicionales del contrato de entrada/salida:

| Parámetro | Valor |
|---|---|
| Entorno | PushT |
| Observaciones de historial | 3 |
| Acciones brutas por transición | 3 |
| Dimensión de acción bruta | 2 |
| Resolución de imagen | 224 × 224 RGB |
| Dimensión latente | 192 |
| Capas del predictor | 6 |
| Cabezas de atención del predictor | 16 |
| Episodios de entrenamiento | 2.000 |
| Épocas de entrenamiento | 10 |
| Semilla de entrenamiento | 3072 |
| Precisión de entrenamiento | BF16 |
| Tamaño del repositorio | 0,1 GB |
| SHA-256 de SafeTensors | `eb51b5ba8e4e9102eadda739590056790f14aee2aca3096db8e45dd703ecde5a` |

## Arquitectura y entrenamiento

El modelo se compone de cuatro bloques aprendidos. El primero es un Vision Transformer de 12 capas que procesa cada observación RGB de 224 × 224 tras convertirla a RGB, redimensionarla con interpolación bicúbica, reescalarla a `[0, 1]` y normalizarla con media y desviación típica de ImageNet. El segundo es un codificador de acciones que transforma tres acciones brutas bidimensionales de PushT en un solo token; las acciones se estandarizan con los valores de `action_stats.json` y se aplanan a tokens agrupados de forma `[batch, 3, 6]`. El tercero es un transformer autorregresivo condicional de 6 capas y 16 cabezas que predice estados latentes futuros a partir del historial visual y de los grupos de acciones. El cuarto son proyecciones de entrada y de predicción hacia un espacio latente de 192 dimensiones.

La entrada completa consta de tres fotogramas de observación separados por tres acciones de entorno cada uno, con dos grupos de acciones históricos que conectan los fotogramas observados y un grupo de acciones futuras propuesto. La salida de `predict_next` es un tensor `[batch, 192]` que representa el estado visual latente predicho tras el último grupo de tres acciones. El modelo carece de decodificador de píxeles, por lo que la predicción nunca se reconstruye como imagen.

El entrenamiento se realizó localmente durante 2.000 episodios y 10 épocas, con semilla 3072 y precisión BF16. La model card no documenta el número total de tokens vistos, la composición exacta del dataset ni el uso de RLHF, DPO u otras técnicas de alineación; tampoco menciona innovaciones como decodificación especulativa o atención lineal. La validación publicada es de tipo regresión numérica: la salida en SafeTensors coincide exactamente con el checkpoint objeto legado en FP32, la regresión de salida dorada en CPU pasa y Apple MPS concuerda con CPU con un error máximo absoluto de `1,67e-06` sobre la entrada fija de regresión.

## Capacidades

- Predicción de estado latente visual: dado un historial de tres observaciones y grupos de tres acciones, devuelve el vector latente de 192 dimensiones del estado resultante tras el último grupo de acciones propuesto.
- Codificación visual independiente: expone `model.encode_images` para obtener representaciones latentes de observaciones normalizadas de 224 × 224.
- Codificación de acciones agrupadas: convierte tres acciones brutas bidimensionales en un único token de acción estandarizado.
- Soporte para planificación por muestreo: está pensado para que planificadores CEM o MPC propongan y puntúen secuencias de acciones alrededor del modelo.
- Integración en planificación jerárquica: se ha utilizado como modelo del mundo de bajo nivel en el sistema Hi-LeWM de planificación jerárquica restringida, con un checkpoint de alto nivel entrenado por separado.
- Inferencia en CPU y Apple MPS: el cargador selecciona MPS cuando está disponible y, en caso contrario, recurre a CPU.
- Fine-tuning y comparación de predictores bajo el mismo contrato de observación/acción.
- No dispone de: decodificador de imagen, modelo de recompensa, modelo de valor, selector de acciones, clasificador de éxito, tool calling, capacidades de agente conversacional, multilingüismo ni modo de razonamiento explícito.

## Casos de uso

- Estudio de granularidad temporal en modelos del mundo: permite comparar directamente transiciones de tres acciones frente a transiciones de cinco acciones dentro del mismo contrato de entrada, aislando el efecto del horizonte de abstracción.
- Construcción de planificadores CEM para PushT: el modelo actúa como función de coste latente sobre la que CEM muestrea y puntúa candidatos de acciones antes de ejecutar en el entorno.
- Planificación MPC (control predictivo por modelo): al devolver un latente de 192 dimensiones a partir de acciones propuestas, puede integrarse en bucles de replanificación que reevalúan el estado tras cada grupo de tres acciones.
- Componente de bajo nivel en sistemas jerárquicos tipo Hi-LeWM: combinado con un checkpoint de alto nivel entrenado aparte varía el objetivo de alto nivel en subobjetivos que este modelo evalúa a nivel de acción.
- Perfilado y optimización de modelos del mundo pequeños: con 18 millones de parámetros, es adecuado para medir latencia, consumo y precisión numérica en CPU, Apple MPS y GPU como banco de pruebas de inferencia.
- Reproducción de experimentos publicados: permite replicar el componente de bajo nivel de los experimentos de tres acciones de Hi-LeWM, incluyendo la regresión de salida dorada en CPU.
- Fine-tuning con el mismo contrato de datos: equipos que ya dispongan de trayectorias de PushT en formato `[batch, 3, 3, 224, 224]` para imágenes y `[batch, 3, 3, 2]` para acciones pueden reentrenar o ajustar el predictor.
- Comparación de arquitecturas de codificador visual: al separar `encode_images` de `predict_next`, facilita experimentos de sustitución del codificador sin alterar el resto del pipeline.

## Benchmarks y rendimiento

La model card no publica métricas estándar de benchmarks de lenguaje o código (MMLU, HumanEval, GSM8K, etc.), que además no aplican a este tipo de modelo. Sí se publican resultados agregados de planificación obtenidos al integrar el modelo en un sistema Hi-LeWM de planificación jerárquica restringida, sobre tres semillas con 50 episodios por semilla. El propio autor advierte que son resultados a nivel de sistema, no puntuaciones del checkpoint de forma aislada, y que requieren un checkpoint de alto nivel entrenado por separado, el planificador restringido Hi-LeWM, el entorno PushT y sus configuraciones de planificación asociadas.

| Distancia al objetivo | Sistema de cinco acciones | Sistema de tres acciones |
|---|---:|---:|
| 75 pasos | 23,3 % | 34,0 % |
| 100 pasos | 9,3 % | 20,7 % |

El autor señala además que el sistema de tres acciones replanifica con más frecuencia y realiza más trabajo de planificación bajo su configuración natural, por lo que estos resultados no establecen que un horizonte de tres acciones sea universalmente mejor. No se proporcionan cifras de latencia, throughput ni error de predicción latente más allá del error máximo absoluto de `1,67e-06` entre MPS y CPU en la entrada de regresión fija.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información publicada. Con 18.034.438 parámetros en BF16, el peso de los tensores ronda las decenas de megabytes, pero el repositorio no ofrece cifras de memoria pico ni de activaciones para lotes grandes.
- GPU recomendadas: no disponible. La model card no enumera GPU concretas ni recomienda modelos de NVIDIA o AMD.
- Ejecución en hardware de consumo: el modelo está diseñado para funcionar en CPU y en Apple MPS, y el cargador selecciona MPS cuando está disponible y recurre a CPU en caso contrario. Por su tamaño, es plausible ejecutarlo en GPUs de consumo, pero no hay confirmación explícita en la documentación.
- Opciones de despliegue: el repositorio documenta un flujo propio en PyTorch mediante `model.py` con la función `load_model`, que lee `config.json`, reconstruye la arquitectura, carga únicamente los tensores de SafeTensors, pasa el modelo a modo evaluación y desactiva los gradientes. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a este tipo de modelo visomotor.
- Dependencias: Python 3.10 o superior y `requirements-mac.txt` (pese al nombre, contiene dependencias Python ordinarias y la inferencia también funciona en CPU).
- Latencia y throughput: no disponibles. El único dato numérico de comportamiento es la concordancia MPS/CPU con error máximo absoluto de `1,67e-06` en la entrada de regresión fija.

## Comparativa con modelos similares

La información disponible no identifica otros modelos publicados de forma independiente con los que comparar parámetros, contexto o licencia. La única referencia comparable dentro de la propia documentación es la variante de horizonte de cinco acciones del mismo sistema, para la que no se detallan parámetros ni configuración de arquitectura.

| Modelo | Parámetros | Horizonte de acciones | Licencia | Resultados de planificación (75 pasos / 100 pasos) |
|---|---|---|---|---|
| PushT LeWorldModel horizonte 3 (este modelo) | 18.034.438 | 3 acciones brutas por transición | MIT | 34,0 % / 20,7 % (nivel de sistema) |
| Sistema de cinco acciones (referencia del autor) | No disponible | 5 acciones brutas por transición | No disponible | 23,3 % / 9,3 % (nivel de sistema) |
| Otros modelos comparables | No disponible | No disponible | No disponible | No disponible |

Conviene insistir en que la comparación de la tabla procede de resultados agregados de dos sistemas completos de planificación, no de los checkpoints aislados.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero el modelo se entrenó exclusivamente con el entorno PushT, por lo que su comportamiento está fuertemente sesgado hacia esa distribución visual y de acciones.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de predicción latente incorrecta, especialmente al desenrollar el modelo de forma repetida, ya que los errores de predicción pueden acumularse.
- Ausencia de multimodalidad de futuros: el modelo predice un vector latente determinista y no representa explícitamente múltiples futuros posibles, lo que limita su uso en planificación que requiera modelar incertidumbre multimodal.
- Falta de componentes de control: no incluye decodificador de imagen, modelo de recompensa, modelo de valor, selector de acciones ni clasificador de éxito; necesita un planificador externo para operar.
- Generalización: no debe esperarse que transfiera directamente a otro robot u otro entorno distinto de PushT.
- Alcance de los resultados: la model card no afirma que las transiciones de tres acciones sean generalmente superiores a las de cinco; los porcentajes publicados corresponden a sistemas completos y a configuraciones naturales distintas, con más trabajo de planificación en el caso de tres acciones.
- Idiomas: no aplica, al no ser un modelo de lenguaje; no hay capacidades multilingües ni de generación de texto.
- Licencia: MIT, lo que permite uso comercial, modificación y redistribución, siempre conservando el aviso de copyright y la licencia. No se documentan restricciones adicionales, campos de uso aceptable ni cláusulas de uso responsable más allá del texto de la licencia.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, y las fechas de creación y actualización (10 de septiembre de 2026) están separadas por nueve segundos, lo que indica una publicación reciente y sin validación externa por parte de la comunidad.
- Reproducibilidad: el checkpoint legado en pickle no se incluye en la release y no es necesario para la inferencia normal; la validación publicada se apoya en una única entrada sintética fija de regresión, no en una batería exhaustiva de pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marsmute/pusht-leworldmodel-horizon3
- Artículo referenciado en las etiquetas del modelo: https://arxiv.org/abs/2603.19312
- Artículo referenciado en las etiquetas del modelo: https://arxiv.org/abs/2607.12547
- Artículo referenciado en las etiquetas del modelo: https://arxiv.org/abs/2604.03208
- Artículo referenciado en las etiquetas del modelo: https://arxiv.org/abs/2411.04983
- Archivos del repositorio mencionados en la model card: `config.json`, `action_stats.json`, `model.py`, `requirements-mac.txt`, `pusht_lewm_fs3_epoch10.safetensors`
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada
