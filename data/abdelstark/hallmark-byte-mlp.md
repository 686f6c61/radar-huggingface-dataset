# abdelstark/hallmark-byte-mlp

## Resumen

Hallmark Byte MLP (seed 17) es una red neuronal de 1.033 parámetros publicada por Abdel Stark (abdelstark) como artefacto de investigación dentro del proyecto Hallmark, centrado en la verificación de inferencia classifiera ligada a una transcripción y a pruebas criptográficas. No es un transformer ni un modelo de lenguaje: es un perceptrón multicapa que consume el histograma de recuentos de bytes de una entrada (256 dimensiones), lo proyecta a 4 unidades ReLU y produce una puntuación afín única que se compara con un umbral entero de 0 para decidir entre bloquear o no bloquear. Su función real es servir de banco de pruebas reproducible para entrenamiento con reanudación exacta, cuantización post-entrenamiento en potencias de dos y ejecución de grafos en aritmética entera.

El modelo se entrenó desde cero sobre un conjunto sintético de 12 registros etiquetados (6 positivos y 6 benignos) generados por el autor, con el objetivo declarado de reproducir el pipeline aritmético y de demostración de pruebas del proyecto, no de detectar contenido dañino. La model card es explícita: se trata de una línea base marcadora sintética, incapaz de distinguir texto reordenado con el mismo histograma de bytes, y no debe emplearse para autorizar acciones ni para filtrar contenido peligroso real. Esta honestidad sobre sus límites, junto con la publicación de hashes SHA-256 y checkpoints en JSON sin pickle, es lo que hace el artefacto relevante para quien investiga procedencia de modelos e inferencia verificable.

La relevancia práctica es acotada pero nítida: es un ejemplo completo y auditable de un clasificador con inferencia entera determinista, sin GPU, sin credenciales de HuggingFace y sin código remoto, que acepta como máximo 96 bytes UTF-8 en la demo de inferencia publicada. Para desarrolladores e investigadores sirve como fixture de referencia, no como componente de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) sobre histograma de 256 recuentos de bytes: 256 → 4 ReLU → puntuación afín; no es un transformer |
| Parámetros totales | 1.033 (1.024 pesos de la primera capa + 4 sesgos + 4 pesos de salida + 1 sesgo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 96 bytes UTF-8 en la demo de inferencia y prueba publicada, sin truncado; el programa nativo usa fragmentos de 512 bytes y una capacidad mayor que no amplía el límite admitido en la demo |
| Tipos de cuantización | Cuantización post-entrenamiento en potencias de dos: pesos int8, aritmética int32 acotada y reescalado con redondeo a par; checkpoint original en float64 |
| Idiomas soportados | Inglés (etiqueta `en`); en la práctica opera sobre bytes UTF-8, sin tokenización semántica ni capacidades multilingües reales |
| Licencia | MIT |
| Formato de pesos | JSON (`checkpoint.json`, `quantization.json`, `model.json`); contratos y programa nativo en CBOR (`program.cbor`, `profile.cbor`, `arithmetic.cbor`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es una red feed-forward mínima: la entrada son 256 recuentos de bytes normalizados por 512 durante el ajuste, seguidos de 4 unidades ReLU y una capa de salida afín de una sola unidad. La decisión se toma con umbral entero en 0 (puntuación mayor o igual que 0 bloquea, incluida la igualdad). La escala de normalización se pliega en la exportación entera, de modo que la inferencia publicada no repite una aproximación en coma flotante, sino que ejecuta el mismo grafo entero que el runtime nativo. La cuantización utiliza metadatos de escala registrados: primera fracción 7, última fracción 2, escala oculta 256 y escala de puntuación 4096.

El entrenamiento se realizó sobre 12 registros sintéticos autorales repartidos en 12 grupos (6 positivos y 6 benignos), con inicialización fijada en la semilla 17 (las semillas 17, 29 y 43 estaban prescritas en el fixture). Se usó SGD con momento en lote completo, tasa de aprendizaje 0,05, momento 0,8 y regularización L2 de 0,001, durante 80 épocas en CPU con precisión float64. La pérdida retenida al límite de 80 épocas es 0,33660603576065673. Los checkpoints completo y reanudado coinciden exactamente en el entorno registrado, lo que valida la reproducibilidad del proceso, no su calidad predictiva. No se aplicó RLHF, DPO ni ajuste por preferencias; tampoco existe una evaluación con conjunto de retención ni métricas de exactitud, precisión o recall publicadas.

## Capacidades

- Clasificación binaria por umbral sobre una única puntuación entera: bloqueo o no bloqueo de una entrada corta, con etiqueta de evidencia `native-inference-only`.
- Procesamiento de entradas como bytes UTF-8, con agregación por máximo entre fragmentos y umbral estricto en el runtime nativo.
- Ejecución determinista en aritmética entera: validación de identidades de programa, perfil y pesos, rechazo de desbordamiento de suma parcial int32 antes del reescalado.
- Reproducción exacta de entrenamiento y reanudación desde checkpoint, con estado de optimizador incluido en JSON.
- Cuantización post-entrenamiento en potencias de dos verificable contra un SHA-256 publicado.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generación de texto, código, matemáticas, visión, audio ni modo de pensamiento. Cualquier expectativa en ese sentido está fuera de su diseño.

## Casos de uso

- Reproducción de entrenamiento y reanudación: el `checkpoint.json` incluye estado del optimizador y permite comprobar que un entrenamiento reanudado coincide bit a bit con el original, útil para validar infraestructura de training en proyectos de investigación.
- Verificación de cuantización post-entrenamiento: sirve como caso de prueba de cuantización en potencias de dos con pesos int8 y aritmética int32 acotada, comparando el resultado con el checkpoint float64 de referencia y verificando el hash SHA-256 del export.
- Fixture en pipelines de pruebas criptográficas: el grafo exportado (`model.json`) alimenta el circuito de prueba dedicado del proyecto Hallmark, de modo que el modelo actúa como entrada controlada para validar la generación y verificación de pruebas.
- Pruebas de regresión de runtimes enteros: los siete sondeos aritméticos registrados (entrada vacía, límites de fragmento, múltiples fragmentos, longitud nativa máxima y Unicode) permiten detectar regresiones en implementaciones de aritmética entera.
- Línea base para ablaciones de representación: al usar exclusivamente histogramas de bytes, cualquier mejora de un modelo contextual sobre estos pares contrastivos cuantifica de forma directa el valor del orden de los tokens.
- Material didáctico sobre límites arquitectónicos: ilustra con un caso real y verificable por qué un perceptrón sobre recuentos de bytes no puede resolver contrastes activo/citado, algo útil en formación de ingeniería de ML.
- Integración en CI sin dependencias pesadas: la inferencia completa corre en CPU con un script fijado por commit, sin GPU, sin credenciales y sin descarga de código remoto, lo que facilita usarlo como test de humo en entornos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de exactitud, precisión, recall, F1, MMLU, HumanEval ni GSM8K, y la model card indica expresamente que no hay evaluación de calidad con conjunto de retención.

Las únicas cifras registradas son de naturaleza aritmética y de reproducibilidad, no de calidad:

| Comprobación registrada | Valor |
|---|---|
| Pérdida final al límite de 80 épocas | 0,33660603576065673 |
| Registros de entrenamiento | 12 (6 positivos, 6 benignos) en 12 grupos |
| Sondeos aritméticos ejecutados | 7 (entrada vacía, límites de fragmento, múltiples fragmentos, longitud nativa máxima, Unicode) |
| Coincidencia checkpoint completo vs. reanudado | Exacta en el entorno registrado |
| Evaluación con conjunto de retención | No realizada |
| Puntuación de ejemplo publicada | `score: -3959`, `threshold: 0`, `block: false` |

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El modelo se ejecuta en CPU; no requiere GPU ni acelerador.
- GPU recomendadas: ninguna. El entrenamiento original se hizo en CPU con float64 y la inferencia publicada usa aritmética entera.
- Cabe en cualquier GPU de consumo y en cualquier CPU moderna; el cuello de botella es el arranque del intérprete de Python, no el cálculo.
- Despliegue: script `scripts/predict_published_classifier.py` del repositorio Hallmark fijado al commit `9b74e1c6b6e90de2d226556aa637936a61a0757b`, con entorno gestionado por `uv` y Python 3.12. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni Transformers, porque los pesos son JSON/CBOR y no un formato de pesos de transformer.
- Latencia y throughput: no disponibles en la información proporcionada. Con 1.033 parámetros y entradas de como máximo 96 bytes, el coste de cómputo es despreciable frente a la sobrecarga de proceso.
- El cargador exige el SHA-256 exacto del export de cuantización (`f8090161455ee56cdcd73eaab44437efa3b278a786d7c246491da5f1e1431a9c`), rechaza pesos modificados, enlaces simbólicos y entradas de más de 96 bytes UTF-8.

## Comparativa con modelos similares

No existe un equivalente directo: la mayoría de clasificadores de seguridad pública son transformers entrenados con datos reales y millones de parámetros, mientras que este artefacto es una línea base sintética de 1.033 parámetros orientada a verificación aritmética. La comparación sirve solo para situar su escala y su función.

| Modelo | Parámetros | Contexto | Función | Licencia |
|---|---|---|---|---|
| Hallmark Byte MLP (este modelo) | 1.033 | 96 bytes UTF-8 en la demo; fragmentos de 512 bytes en el programa nativo | Clasificador marcador sintético para pruebas de inferencia entera y cuantización | MIT |
| Llama Prompt Guard 2 22M (Meta) | 22 M | No disponible en la información manejada | Detección de prompt injection y jailbreak entrenada con datos reales | Llama 4 Community License |
| Llama Prompt Guard 2 86M (Meta) | 86 M | No disponible en la información manejada | Detección de prompt injection y jailbreak entrenada con datos reales | Llama 4 Community License |
| ProtectAI deberta-v3-base-prompt-injection | No disponible en la información manejada | No disponible en la información manejada | Clasificación de prompt injection sobre DeBERTa-v3 | No disponible en la información manejada |

La diferencia relevante no es de rendimiento sino de propósito: los modelos anteriores son detectores entrenados y evaluados; este es un fixture reproducible con garantías aritméticas explícitas y sin evaluación de calidad.

## Limitaciones y advertencias

- Limitación arquitectónica conocida: el modelo asigna puntuaciones idénticas a pares con el mismo histograma de bytes, aunque el orden del texto cambie, incluidos los pares contrastivos activo/citado usados para probar el CNN contextual del proyecto. No es un fallo oculto, está documentado por el autor.
- No es un detector de prompt injection ni un clasificador de seguridad general; no debe usarse para autorizar acciones ni para filtrar contenido dañino real.
- El conjunto de entrenamiento es mínimo (12 registros sintéticos) y artificial, sin evaluación con conjunto de retención: el riesgo de sobreajuste es total y no hay evidencia de generalización.
- Límite de entrada: la demo de inferencia y prueba combinada admite como máximo 96 bytes UTF-8 sin truncado; entradas mayores se rechazan. Algunas longitudes de entrenamiento y de sondeo superan ese límite y no son admisibles en la demo.
- El texto se procesa como bytes UTF-8, no como tokens semánticos: la etiqueta de idioma `en` no implica competencia lingüística ni soporte multilingüe.
- Ejecutar o descargar los pesos no genera una prueba criptográfica: el resultado etiqueta su evidencia como `native-inference-only`. No se incluyen claves de prueba, claves de verificación, transcripciones ni credenciales.
- Formatos no estándar: al no ser un modelo de Transformers, no es compatible con el ecosistema habitual (vLLM, TGI, Ollama, llama.cpp, transformers). La integración exige el repositorio y el commit fijados.
- Reproducibilidad dependiente de la revisión: para descargas inmutables hay que sustituir `main` por la revisión de commit del repositorio; la guía de release registra la revisión inscrita y el hash del manifiesto.
- La licencia MIT permite uso comercial del artefacto, pero su idoneidad técnica para producción es nula dado que no hay evaluación de calidad y su propósito declarado es la investigación.
- Un veredicto del clasificador es un resultado bajo una política fija, no evidencia de seguridad en el mundo, según la propia definición del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdelstark/hallmark-byte-mlp
- Repositorio Hallmark: https://github.com/AbdelStark/hallmark/tree/main/
- Issue 12, runtime entero del MLP de bytes: https://github.com/AbdelStark/hallmark/issues/12
- Guía de release de modelos: https://github.com/AbdelStark/hallmark/blob/main/docs/MODELS.md
- Implementación de inferencia publicada: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/scripts/predict_published_classifier.py
- Fixture de entrenamiento: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/fixtures/mlp-training.json
- Entrenador: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/src/hallmark/mlp_training.py
- Exportación: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/src/hallmark/mlp_export.py
- Perfil del autor en HuggingFace: https://huggingface.co/abdelstark
