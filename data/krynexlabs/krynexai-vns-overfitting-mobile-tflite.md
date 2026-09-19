# KrynexLabs/KrynexAI-vNS-Overfitting-Mobile-TFLite

## Resumen

KrynexAI-vNS-Overfitting-Mobile-TFLite es un modelo de generación de texto publicado por KrynexLabs que consiste en un transformer decoder-only de estilo GPT implementado íntegramente desde cero en NumPy, sin PyTorch ni TensorFlow. Tiene 1.003.680 parámetros repartidos en 4 capas, 4 cabezas de atención, d_model = 144 y d_ff = 576. Su rasgo definitorio no es la capacidad, sino el grado extremo de sobreajuste: se entrenó durante 800 épocas sobre un corpus de 420 caracteres correspondientes a la cadena "hello how are you. " repetida, con un vocabulario de solo 11 tokens únicos.

El resultado es un modelo que memoriza perfectamente esa única frase y carece de generalización alguna. No responde preguntas ni mantiene conversaciones: reproduce el patrón aprendido. El propio autor lo etiqueta en el repositorio como numpy, overfitting, from-scratch, useless y meme, y lo presenta explícitamente como una pieza didáctica y humorística.

Su relevancia es, por tanto, pedagógica y no técnica: sirve como caso de estudio mínimo y reproducible para ilustrar tokenización, atención causal, retropropagación escrita a mano y la diferencia entre una pérdida de entrenamiento baja y una capacidad real de generalización nula. El repositorio ocupa 0,0 GB y no está pensado para ningún uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT, con máscara causal, positional encoding, LayerNorm y GELU, implementado desde cero en NumPy |
| Parametros totales | 1.003.680 (~1M) |
| Longitud de contexto | No disponible (el autor no publica el valor de `block`; el script de ejemplo trunca la entrada a los últimos `cfg['block']` tokens) |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas; solo los pesos originales en `model.npz`) |
| Idiomas soportados | en, ru (declarados en los metadatos); en la práctica solo reproduce texto en inglés |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (`model.npz`, que contiene pesos, vocabulario `_stoi`/`_itos` y configuración `_cfg`) |
| Capas | 4 |
| Cabezas de atencion | 4 |
| Dimension del modelo (d_model) | 144 |
| Dimension de la capa feed-forward (d_ff) | 576 |
| Tamano del vocabulario | 11 tokens únicos |
| Tokens de entrenamiento | 420 caracteres |
| Epocas | 800 |
| Optimizador | Adam, learning rate = 1e-3 |
| Libreria declarada | numpy |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de 4 capas y 4 cabezas de atención, con d_model = 144 y d_ff = 576, que suma 1.003.680 parámetros. Incluye codificación posicional, LayerNorm, activación GELU y máscara causal. Lo singular es que toda la implementación, incluida la retropropagación, está escrita a mano en NumPy puro: no hay dependencia de frameworks de deep learning. El vocabulario se reduce a 11 tokens únicos, derivados del conjunto de caracteres presentes en la cadena objetivo.

En cuanto al entrenamiento, no hay un dataset real: el corpus es la cadena "hello how are you. " con una longitud total de 420 caracteres, repetida durante 800 épocas con el optimizador Adam y un learning rate de 1e-3. La relación entre parámetros y datos es de aproximadamente 2.400 parámetros por carácter, lo que explica el sobreajuste absoluto reportado. No se aplicó RLHF, DPO ni ningún tipo de ajuste por preferencias, y no existe división de validación (el autor lo indica de forma explícita: "val loss: does not exist, we don't split data"). No se documentan innovaciones técnicas como decodificación especulativa, atención lineal ni mezcla de expertos.

## Capacidades

- Generación de texto limitada a la reproducción de la secuencia memorizada "hello how are you. " de forma indefinida.
- Memorización perfecta del corpus de entrenamiento (100 % declarado por el autor).
- Generalización nula: no produce respuestas coherentes ante entradas distintas del patrón aprendido (0 % declarado).
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- Multilingüismo nominal: los metadatos declaran en y ru, pero el modelo no ha sido entrenado con datos en ruso ni puede generar texto en ese idioma.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni ninguna capacidad multimodal.
- Funciona como referencia ejecutable de un forward pass de transformer escrito a mano, útil para inspeccionar la mecánica interna de atención y retropropagación.

## Casos de uso

- Docencia sobre sobreajuste: el modelo permite mostrar en clase, con un ejemplo reproducible y de segundos de ejecución, la diferencia entre una pérdida de entrenamiento de 0,03 y una generalización del 0 %. Se puede entrenar de nuevo y comparar curvas.
- Material de laboratorio para comparar regímenes de ajuste: repitiendo el entrenamiento con menos épocas o con regularización se obtiene un contraste directo entre infraajuste, ajuste razonable y sobreajuste extremo.
- Pruebas unitarias de pipelines de inferencia: al ser un modelo diminuto con dependencias mínimas (solo NumPy), sirve para validar el código de carga de pesos, tokenización y generación de un pipeline propio antes de escalar a modelos reales.
- Verificación de implementaciones de atención: el forward pass escrito a mano permite comprobar numéricamente una implementación propia de atención causal, LayerNorm o GELU contra una referencia independiente.
- Benchmark de infraestructura de serialización: útil para medir tiempos de carga y de ejecución de un `.npz` con vocabulario y configuración embebidos, como caso límite inferior en pruebas de rendimiento.
- Demostración y contenido divulgativo: por su carácter de meme técnico declarado, funciona bien como ejemplo en charlas o artículos sobre expectativas irreales en machine learning y sobre la diferencia entre "modelo que funciona" y "modelo que ha memorizado".
- Prueba de integración de un tokenizador carácter a carácter: con 11 tokens únicos, permite validar de forma aislada la lógica de codificación y decodificación sin la complejidad de un vocabulario BPE.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Ninguno está verificado de forma independiente.

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| Train loss | `hello how are you. (x20)` (custom) | 0,03 | No |
| Memorization (accuracy) | `hello how are you. (x20)` (custom) | 100 | No |
| Generalization (accuracy) | `hello how are you. (x20)` (custom) | 0 | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. No existen datos de validación porque el autor no dividió el corpus.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en coma flotante de 32 bits, dado que el modelo tiene 1.003.680 parámetros. No se publican cifras oficiales.
- GPU recomendadas: no se requiere GPU. El modelo se ejecuta íntegramente en CPU con NumPy. Cualquier GPU (incluidas RTX 3060, RTX 4090, A100 o H100) puede ejecutarlo, pero no aporta ventaja apreciable por el tamaño.
- Cabe en cualquier ordenador de consumo: el repositorio completo ocupa 0,0 GB y el archivo de pesos es de unos pocos megabytes. Funciona en portátiles, en máquinas virtuales pequeñas e incluso en dispositivos tipo Raspberry Pi siempre que haya NumPy instalado.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que usa un formato `.npz` propio y código de inferencia a medida. El único método soportado es el script de Python con NumPy incluido en la model card (`pip install numpy` como única dependencia).
- Latencia y throughput: no disponibles. Se trata de operaciones matriciales de dimensión muy reducida (d_model = 144, 4 capas), por lo que la generación de decenas de tokens en CPU debería completarse en tiempos del orden de milisegundos o menos, pero no hay cifras publicadas ni medidas oficiales.

## Comparativa con modelos similares

La model card del autor incluye una comparativa con modelos de gran escala, que se reproduce a continuación. Se trata de cifras declaradas por el autor, no verificadas, y de categorías no equivalentes: no existe comparación real posible entre un transformer de 1M de parámetros entrenado con 420 caracteres y modelos de miles de millones de parámetros.

| Modelo | Parametros | Datos de entrenamiento | Conversacion |
|---|---|---|---|
| GPT-4 | ~1,8T (cifra del autor, no verificada) | ~13T tokens | Si |
| LLaMA 3 | 70B | ~15T tokens | Si |
| KrynexAI | 1M | 420 caracteres | No (pero con seguridad) |

No se dispone de datos verificados de otros modelos educativos o de juguete de la misma categoría en la información proporcionada, por lo que la comparativa con alternativas equivalentes se marca como no disponible.

## Limitaciones y advertencias

- El propio autor indica de forma explícita: no usar en producción.
- Sobreajuste extremo: la pérdida de entrenamiento es de 0,03 y la generalización del 0 %, por lo que cualquier entrada fuera del patrón memorizado produce salidas sin sentido.
- No es un chatbot: no responde preguntas ni mantiene diálogo, solo repite la secuencia aprendida.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que el modelo no genera contenido factual; su salida es una secuencia fija memorizada independientemente de la entrada.
- Sesgos conocidos: no hay estudios de sesgo disponibles. Al no existir corpus real de entrenamiento, no se pueden evaluar sesgos de género, raza o ideología.
- Limitaciones de idioma: aunque los metadatos declaran en y ru, el modelo solo ha visto texto en inglés y su vocabulario se limita a 11 tokens. No tiene capacidad multilingüe real.
- Limitaciones de contexto: la longitud de bloque no está publicada, lo que impide planificar cualquier uso con entradas de longitud conocida.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución sin restricciones. No obstante, la utilidad práctica del modelo es nula, por lo que la licencia permisiva no se traduce en aplicabilidad.
- Discrepancia en la nomenclatura: el identificador del repositorio incluye "vNS-Overfitting-Mobile-TFLite", pero la librería declarada es NumPy y los pesos se distribuyen en `.npz`, no en formato TFLite. No hay evidencia en la información disponible de que exista una variante TensorFlow Lite.
- Ausencia de validación: no hay conjunto de validación, ni pruebas externas, ni resultados de benchmarks estándar, ni verificación independiente de las métricas declaradas.
- Mantenimiento incierto: el modelo se creó y actualizó el mismo día (18 de septiembre de 2026) y acumula 0 descargas y 1 like, lo que sugiere un proyecto sin desarrollo posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KrynexLabs/KrynexAI-vNS-Overfitting-Mobile-TFLite
- No se han encontrado enlaces relevantes en la búsqueda web: los resultados devueltos no guardan ninguna relación con el modelo, su autor ni su temática.
