# cmeister/boundary-markers-en-d12-bnd_wpd-bpe

## Resumen

Estos tres checkpoints (semillas 0, 1 y 2) son los modelos en inglés del banco de comparación del artículo "Explicit Boundary Markers for Subword Vocabularies", firmado por Sander Land y Clara Meister, y publicados en HuggingFace por el usuario `cmeister`. No son modelos de propósito general: son artefactos de investigación destinados a medir el efecto de un tokenizador con marcadores de frontera explícitos sobre la calidad de un modelo de lenguaje pequeño. Los tres comparten exactamente la misma arquitectura, los mismos datos y la misma configuración de entrenamiento; lo único que los distingue entre sí es la semilla de inicialización y el orden de las particiones de datos, y lo único que los distingue del resto de brazos del artículo es el tokenizador.

La arquitectura es la de un transformer decoder-only de 12 capas y anchura 768 con 6 cabezas de atención, entrenado con nanochat en el commit `92d63d4`, con una ventana de contexto de 2.048 tokens y 1,34 mil millones de tokens vistos durante 2.553 pasos. El tokenizador es un BPE entrenado sobre una muestra de 5 GB de FineWeb en inglés, con un vocabulario de 34.685 entradas más un token de inicio de secuencia. La variante `bnd_wpd` añade marcadores a las secuencias de puntuación y de dígitos, en el lado donde se ha eliminado un espacio.

Su relevancia es metodológica: los checkpoints originales que respaldaban las cifras publicadas se perdieron, y estos tres son reentrenamientos de septiembre de 2026 con el mismo tokenizador, los mismos datos y los mismos ajustes. La model card publica la comparación entre las cifras nuevas y las publicadas, lo que convierte al repositorio en un caso útil para estudiar la reproducibilidad no bit a bit en entrenamiento con GPU. La licencia es Apache 2.0 y el idioma soportado es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat, commit `92d63d4`); 12 capas, anchura 768, 6 cabezas de atencion |
| Parametros totales | No disponible (la model card no publica el recuento; solo indica capas y anchura) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en punto flotante de PyTorch; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`seed<n>/model_002553.pt`), carga con `torch.load(..., weights_only=True)` |
| Vocabulario | 34.685 entradas mas un token de inicio de secuencia (34.686 en total) |
| Tokenizador | BPE sobre muestra de 5 GB de FineWeb en ingles; fichero `tokenizer/fineweb_en_5gb_bnd_wpd_bpe_v34685.json.gz` |
| Tokens de entrenamiento | 1,34 mil millones (2.553 pasos de 524.288 tokens) |
| Variantes incluidas | 3 checkpoints (semillas 0, 1 y 2) |
| Tamano del repositorio | 2,5 GB (incluye los tres checkpoints, el tokenizador y los registros de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 12 capas, anchura 768 y 6 cabezas de atención, instanciado con nanochat en el commit `92d63d4` y lanzado mediante `paper_utils/boundary/downstream/run_arms.sh` del repositorio `script_tok`. El entrenamiento usa una ventana de contexto de 2.048 tokens y 2.553 pasos de 524.288 tokens cada uno, lo que suma 1,34 mil millones de tokens. Cada modelo se entrenó en una única GPU. El texto de entrenamiento son las primeras 8 particiones de ClimbMix que descarga nanochat, leídas entre 3,4 y 3,6 veces según el tokenizador. La semilla determina la inicialización de pesos y el orden de las 8 particiones, y ese orden es idéntico para todos los tokenizadores, de modo que los modelos con la misma semilla son comparables directamente entre brazos del experimento. No se menciona ningún uso de RLHF, DPO ni ajuste por instrucciones: son modelos base.

La innovación técnica está en el tokenizador, no en el modelo. La variante `bnd_wpd` se comporta como `bnd_w` y además marca las secuencias de puntuación y de dígitos, siempre en el lado en el que se ha eliminado un espacio. El BPE se entrenó sobre una muestra de 5 GB de FineWeb en inglés y produce un vocabulario de 34.685 entradas, al que se añade un token de inicio de secuencia. La model card advierte de que los ajustes de pretokenización almacenados en el fichero se reescribieron del formato de agosto de 2026 al actual, y que la reescritura solo se conservó tras comprobar que ambas versiones generaban los mismos identificadores de token sobre 200 documentos en inglés. La métrica de evaluación es bits por byte: la pérdida sumada sobre la partición de validación de ClimbMix de nanochat dividida por la longitud UTF-8 real del texto puntuado.

## Capacidades

- Generación de texto autorregresiva en inglés, como modelo base sin ajuste por instrucciones.
- Modelado de lenguaje y cálculo de verosimilitud sobre texto en inglés, que es su uso principal en el artículo.
- Evaluación de tokenizadores mediante bits por byte, al estar emparejado con las demás variantes del banco de comparación.
- Reproducción de experimentos de nanochat con una configuración de entrenamiento documentada paso a paso.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso entrenado de forma explícita.
- Capacidades multilingües: únicamente inglés; no se declara ningún otro idioma.
- No se declaran capacidades de visión, audio ni modo de pensamiento.
- No se declara ajuste de alineación, por lo que no cabe esperar seguimiento fiable de instrucciones ni formato conversacional.

## Casos de uso

- Investigación sobre tokenización: reproducir el brazo `bnd_wpd` del artículo y comparar su bits por byte contra otras variantes con la misma semilla, ya que el resto de condiciones está fijado.
- Evaluación de métricas independientes del tokenizador: usar bits por byte como criterio para comparar vocabularios subword de distinto tamaño sin que la métrica favorezca a un tokenizador concreto.
- Estudio de marcadores de frontera: analizar cómo afecta marcar secuencias de puntuación y dígitos a la pérdida de validación en un modelo de tamaño controlado.
- Experimento de ablación con nanochat: servir de punto de partida para cambiar profundidad, anchura o contexto manteniendo fijo el resto de la receta de entrenamiento.
- Auditoría de reproducibilidad: contrastar los checkpoints reentrenados con las cifras publicadas para cuantificar la variabilidad no determinista del entrenamiento en GPU.
- Docencia y divulgación: al ser un modelo pequeño entrenado en una sola GPU con 1,34 mil millones de tokens, es un caso práctico para explicar el ciclo completo de preentrenamiento.
- Pruebas de canalización de inferencia: validar el código de carga de pesos, el tokenizador y la generación antes de escalar a configuraciones mayores.
- Referencia metodológica para diseñar comparaciones de tokenizadores: el repositorio documenta hashes, registros de entrenamiento y configuración, lo que facilita replicar el protocolo.

## Benchmarks y rendimiento

La única métrica publicada es bits por byte de validación sobre la partición de ClimbMix de nanochat (menor es mejor). No se han publicado resultados de benchmarks de tareas como MMLU, HumanEval o GSM8K en la información disponible.

| Semilla | Reentrenamiento | Publicado | Diferencia (reentrenamiento - publicado) |
|---|---|---|---|
| 0 | 0,88039 | 0,88056 | -0,00017 |
| 1 | 0,87980 | 0,87974 | +0,00006 |
| 2 | 0,87985 | 0,87969 | +0,00016 |

## Requisitos de hardware

- VRAM estimada: no publicada. Como referencia derivada de los datos disponibles, el repositorio completo ocupa 2,5 GB e incluye tres checkpoints más el tokenizador, de modo que cada checkpoint es inferior a 1 GB; la inferencia debería caber con margen amplio en GPU de consumo.
- GPU recomendadas: no especificadas en la model card. El entrenamiento se realizó con una GPU por modelo, sin indicar el modelo concreto.
- GPU de consumo: por el tamaño del repositorio y las dimensiones declaradas (12 capas, anchura 768, contexto 2.048), es esperable que quepa en tarjetas de gama media con suficiencia; no se ofrece una cifra oficial.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI. Los pesos son un state dict de PyTorch y requieren el código de nanochat en el commit `92d63d4` para instanciar el modelo; cualquier otro runtime exigiría una conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de cifras de los demás brazos del banco de comparación del artículo (otras variantes de tokenizador con la misma arquitectura y los mismos datos), más allá de que existen y de que el orden de particiones está fijado por semilla para permitir la comparación directa. Tampoco se dispone de datos de otros modelos de la familia nanochat con distinta profundidad.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`bnd_wpd`, 12 capas) | No disponible | 2.048 tokens | 0,87980-0,88039 bits por byte (segun semilla) | Apache 2.0 | HuggingFace |
| Otros brazos del articulo (distinto tokenizador, misma arquitectura) | No disponible | 2.048 tokens | No disponible | No disponible | No disponible en la informacion |
| Otros modelos nanochat de distinta profundidad | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion |

## Limitaciones y advertencias

- Los checkpoints originales que respaldaban las cifras publicadas se perdieron; estos tres son reentrenamientos y sus resultados difieren ligeramente de los publicados.
- El entrenamiento en GPU no es reproducible bit a bit, por lo que no cabe esperar una réplica exacta de las cifras ni siquiera con la misma configuración.
- Es un modelo base sin alineación: no sigue instrucciones de forma fiable y no está pensado para uso conversacional directo.
- Solo soporta inglés; no se declara ningún otro idioma.
- La ventana de contexto es de únicamente 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- No se han publicado evaluaciones de sesgo, toxicidad ni seguridad.
- El riesgo de alucinación es el propio de un modelo base de tamaño reducido entrenado con 1,34 mil millones de tokens, sin mitigaciones específicas.
- No hay benchmarks de tareas que permitan estimar su utilidad en aplicaciones reales; la única métrica es bits por byte.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido evaluado para producción ni se distribuye con garantías de calidad.
- El formato de pesos es un state dict de PyTorch que depende de nanochat en un commit concreto, lo que añade fricción para integrarlo en pilas de inferencia habituales.
- Para cargar el tokenizador es necesario el repositorio `script_tok` y su clase `BoundaryBPETokenizer`; no hay fichero `tokenizer.json` estándar.
- El fichero del tokenizador fue reescrito de formato respecto a agosto de 2026; la equivalencia se verificó solo sobre 200 documentos en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-en-d12-bnd_wpd-bpe
- Artículo: https://arxiv.org/abs/2608.08847 ("Explicit Boundary Markers for Subword Vocabularies", Sander Land y Clara Meister)
- Repositorio del tokenizador y utilidades del artículo: https://github.com/sanderland/script_tok
- Framework de entrenamiento nanochat: https://github.com/karpathy/nanochat
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la información del repositorio.
