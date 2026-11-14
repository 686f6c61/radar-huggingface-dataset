# olaverse/diactag-2.0

## Resumen

diactag-2.0 es un modelo de restauración de diacríticos, marcas de tono y vocalización árabe (tashkīl) desarrollado por olaverse. A diferencia de los enfoques generativos, no produce texto nuevo: clasifica cada carácter de entrada y le añade las marcas correspondientes, copiando siempre los caracteres base. Esto garantiza por construcción que el texto de salida es idéntico al de entrada salvo por los signos añadidos, eliminando el riesgo de corrupción del contenido original.

El modelo cubre 11 idiomas (yoruba, igbo, hausa, vietnamita, polaco, turco, portugués, español, francés, italiano y árabe) e incorpora detección de idioma integrada, de modo que el usuario puede omitir el parámetro de lengua y dejar que la propia cabeza de clasificación lo determine. Con 37,9 millones de parámetros y una arquitectura transformer bidireccional a nivel de carácter, está diseñado para ejecutarse en CPU: incluye una exportación ONNX en int8 de 38,6 MB que procesa una frase típica en unos 8 ms en un portátil.

Su relevancia actual reside en dos factores. Por un lado, atiende lenguas de bajos recursos (yoruba, igbo, hausa) donde la restauración de tonos y diacríticos es crítica para la corrección lingüística y la síntesis de voz. Por otro, añade árabe con dos modos (vocalización completa con terminaciones de caso y modo sin terminaciones), lo que cubre tanto texto clásico y religioso como árabe moderno parcialmente vocalizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional a nivel de carácter con cabezas SHAPE y TONE por carácter (más cabezas de identificación de idioma y de carácter enmascarado usadas en entrenamiento) |
| Parámetros totales | 37,9 M (12 capas, 512 de dimensión oculta, 8 cabezas, RoPE, SwiGLU, RMSNorm) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | entrada de cualquier longitud mediante ventanas deslizantes de 384 caracteres con paso de 256 |
| Tipos de cuantización | fp32 (ONNX) e int8 (ONNX) |
| Idiomas soportados | yoruba (yo), igbo (ig), hausa (ha), vietnamita (vi), polaco (pl), turco (tr), portugués (pt), español (es), francés (fr), italiano (it), árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`ckpt_final.pt`, 151,6 MB), ONNX fp32 (152,1 MB), ONNX int8 (38,6 MB); JSON auxiliares (`labels.json`, `calibration.json`, `lexicon.json`, `density_floors.json`, `config.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer bidireccional que opera sobre secuencias de caracteres y no sobre tokens subword. Cada posición se resuelve con dos cabezas independientes: una de forma (18 clases) y otra de tono (15 clases), sobre un espacio de etiquetas versionado (spec 2.0.0) que abarca 986 caracteres. La legalidad de cada etiqueta está enmascarada por idioma, de modo que el modelo no puede emitir combinaciones inválidas para la lengua seleccionada. Se emplean RoPE, SwiGLU y RMSNorm en las 12 capas. La inferencia usa ventanas deslizantes de 384 caracteres con paso de 256 para admitir entradas de longitud arbitraria.

El diseño separa explícitamente la forma del tono y copia los caracteres base sin predecirlos, lo que da una tasa de cumplimiento (compliance) de 1.0000 por construcción en todos los benchmarks. El repositorio incluye el código completo de entrenamiento e inferencia (`code/`, `notebooks/`) y un fichero de calibración con temperatura compartida. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Restauración de diacríticos y marcas de tono en 11 idiomas con preservación exacta de los caracteres base.
- Vocalización árabe completa (fatḥa, ḍamma, kasra, sukūn, tanwīn, shadda) con modo con y sin terminaciones de caso (iʿrāb).
- Detección automática de idioma mediante cabeza propia (`detect_language`), con puntuaciones de confianza.
- Modo de confianza mínima (`min_confidence`) que deja sin marcar los caracteres de baja confianza.
- Respeto de marcas existentes (`respect_existing`, activado por defecto), sin eliminar signos introducidos por el usuario.
- Reordenación con lexicón (`lexicon_mode="rerank"`) usando `lexicon.json`.
- Procesamiento por lotes (`restore_batch`) y salida con detalles por carácter (confianza individual).
- Ejecución en CPU mediante ONNX int8 y en GPU (`device="cuda"`).
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso.

## Casos de uso

- Enseñanza de lenguas africanas: el modelo restaura tonos en yoruba, igbo y hausa sobre texto plano introducido por estudiantes, lo que permite generar materiales didácticos con la ortografía correcta sin que el alumno tenga que teclear caracteres especiales.
- Vocalización de textos religiosos y clásicos árabes: con `case_endings=True` se obtiene vocalización completa con terminaciones de caso, adecuada para Corán, poesía clásica y material de recitación.
- Preparación de texto para síntesis de voz (TTS): los motores TTS de yoruba, vietnamita o árabe necesitan marcas de tono y vocalización para una pronunciación correcta; el modelo las añade en milisegundos y en CPU, integrándose en el pipeline previo al sintetizador.
- Normalización de corpus para PLN: textos de redes sociales o foros suelen escribirse sin diacríticos; el modelo puede restaurarlos por lotes (`restore_batch`) antes de alimentar modelos de análisis morfológico o traducción automática.
- Corrección ortográfica en editores y teclados: integración como servicio ligero (8 ms por frase en int8) que completa la ortografía de un usuario que escribe sin marcas, respetando las que ya haya introducido gracias a `respect_existing`.
- Procesamiento de árabe moderno en producción: el modo `case_endings=False` cubre la vocalización parcial habitual en prensa y documentos, evitando la parte más difícil de la tarea y reduciendo errores en la terminación de las palabras.
- Detección de idioma previa en pipelines multilingües: la cabeza de identificación permite enrutar texto entre los 11 idiomas soportados sin un modelo auxiliar.

## Benchmarks y rendimiento

La información disponible indica que diactag-2.0 mantiene la misma precisión que diactag-1.0 en sus 10 idiomas originales, medida lado a lado sobre el mismo benchmark, y que en árabe moderno estándar se sitúa segundo de cinco vocalizadores árabes abiertos evaluados. La tasa de cumplimiento (fidelidad de los caracteres base) es de 1.0000 en todos los benchmarks por construcción. No se han publicado en la información disponible las cifras numéricas concretas de precisión (por ejemplo, exactitud por carácter o por palabra) ni resultados de MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

| Benchmark | Resultado |
|---|---|
| Precisión numérica por idioma | no disponible |
| Comparativa árabe (5 vocalizadores abiertos) | 2.º puesto (sin cifras publicadas) |
| Compliance (fidelidad de caracteres base) | 1.0000 en todos los benchmarks |
| Latencia int8 ONNX en CPU | ~8 ms por frase típica |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (modelo de 151,6 MB); unos 40 MB en int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona de forma nativa en CPU. En GPU, cualquier tarjeta con más de 1 GB de memoria es suficiente (RTX 4090, A100, H100, etc.).
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna, y en CPU de portátil.
- Opciones de despliegue: ONNX Runtime (backend int8 incluido), PyTorch nativo, API de Olaverse (`POST /v1/diacritize`) y la librería `olaverse` v0.4.0+ (`pip install "olaverse[deeplearning]"`, con extra `[onnx]` para int8).
- Latencia: aproximadamente 8 ms por frase típica en CPU de portátil con el backend int8 ONNX. El throughput por lotes no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| diactag-2.0 | 37,9 M | ventanas de 384 caracteres, longitud arbitraria | 11 | Apache 2.0 | Clasificación por carácter, no generativa |
| diactag-1.0 | no disponible | no disponible | 10 (sin árabe) | no disponible | Clasificación por carácter |
| Vocalizadores árabes generativos (4 evaluados) | no disponible | no disponible | árabe | no disponible | Generación de texto |

La información disponible no detalla los nombres ni las especificaciones de los otros cuatro vocalizadores árabes comparados, más allá de que diactag-2.0 queda en segundo lugar y que, a diferencia de los generativos, nunca altera el texto de entrada.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para traducción, resumen ni generación de texto; su única función es añadir marcas a caracteres existentes.
- Las letras hamza (أ إ آ ؤ ئ) son ortografía y no diacríticos: el modelo nunca las añade ni las elimina, por lo que la entrada debe usarlas correctamente.
- En árabe, el modo `case_endings=True` aborda la parte más difícil de la tarea (iʿrāb) y puede ser menos fiable que el modo sin terminaciones; para producción en árabe moderno se recomienda `case_endings=False`.
- El espacio de etiquetas está versionado (spec 2.0.0): cargar el modelo con código de diactag-1.0 puede producir resultados incorrectos; debe usarse el código incluido en el repositorio.
- Riesgo de alucinación léxica bajo: el modelo no puede inventar caracteres base, pero sí puede asignar marcas incorrectas en palabras ambiguas u homógrafas; el parámetro `min_confidence` permite dejar esos caracteres sin marcar.
- Cobertura limitada a 11 idiomas; no se ha documentado su comportamiento en textos con mezcla de lenguas o con code-switching.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse sobre corpus de cada lengua, podría heredar sesgos de dominio (por ejemplo, registro formal frente a coloquial).
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y aviso de cambios; no se han identificado restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/diactag-2.0
- Consola de desarrollador de Olaverse: https://console.olaverselab.com
- Documentación de la API de diacríticos: https://docs.olaverselab.com/api/diacritics/
- Librería `olaverse`: https://olaverse-labs.github.io/olaverse/
- Repositorio de código y notebooks: incluido en el propio repositorio de Hugging Face (`code/`, `notebooks/`)
