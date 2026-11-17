# SonoJot/sonojot-punct-v4

## Resumen

SonoJot Punctuation v4 es un clasificador de tokens de aproximadamente 140 millones de parámetros desarrollado por SonoJot, el equipo detrás de la aplicación de dictado local del mismo nombre. Su función es reparar la salida de un reconocedor de voz en una sola pasada hacia delante: añade puntuación, normaliza formas escritas (por ejemplo, convertir "four thousand dollars" en "$4,000"), elimina opcionalmente muletillas y repeticiones, y como novedad en la versión 4 predice la capitalización de cada palabra (minúscula, inicial mayúscula o todo mayúsculas). No añade, reordena ni reescribe palabras: solo la eliminación (desactivable) y el cambio de caja alteran el texto.

El modelo se construye sobre un encoder mmBERT-small con cuatro cabezas lineales sobre el estado oculto del último subword de cada palabra, y se distribuye como archivo ONNX de 147 MB con pesos en int8. Está pensado para ejecutarse en CPU de escritorio: según el autor, procesa unas 300 palabras en torno a 0,1 segundos con dos hilos en un Ryzen 9 9900X, lo que lo hace viable dentro de una aplicación de dictado local sin GPU.

Es relevante ahora porque aborda un problema práctico y poco cubierto en los pipelines de ASR: la inconsistencia de la caja y la puntuación entre distintos reconocedores. Las versiones anteriores aplicaban reglas que solo podían bajar mayúsculas, nunca añadirlas, y degradaban nombres propios que coinciden con palabras comunes (Summit, Rust, Bill). La v4 introduce predicción de caja con umbrales calibrados y una capa de reglas deterministas que decide la aplicación final, manteniendo la garantía de que el texto no se altera más allá de la caja y la eliminación opcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT-small con cuatro cabezas lineales (puntuación de 5 clases, spans BIO de 27 etiquetas, eliminación de 2 clases, caja de 3 clases) |
| Parametros totales | Aproximadamente 140M (la v4 añade unos 5k parámetros sobre la v3) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 120 palabras con salto de 100; cada palabra se lee aproximadamente 1,2 veces |
| Tipos de cuantizacion | int8 en embeddings de tokens y matrices de pesos en bloques de 32 con una escala fp32 por bloque (ONNX Runtime `MatMulNBits`, `bits=8`, `block_size=32`, `accuracy_level=4`) |
| Idiomas soportados | Inglés |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`model.int8.onnx`, 147 MB); el repositorio también incluye safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer mmBERT-small con cuatro cabezas lineales que operan sobre el estado oculto del último subword de cada palabra. Las cabezas predicen, respectivamente, el signo de puntuación posterior a la palabra (ninguno, punto, coma, interrogación o punto y coma), spans en formato BIO sobre 13 clases para formas escritas, una decisión binaria KEEP/DELETE para muletillas y repeticiones, y la caja de la palabra (minúscula, inicial mayúscula o todo mayúsculas). Las palabras se leen en minúsculas y se añaden dos entradas laterales mediante una tabla de embeddings de 11 × 384 inicializada a cero: la caja que proporcionó el reconocedor (desconocida, minúscula, inicial mayúscula, mayúsculas o mixta) y si la palabra inicia un fragmento de audio decodificado por separado. Durante el entrenamiento, la entrada de caja se ocultó en aproximadamente el 30 % de las filas para que el modelo funcione también cuando el reconocedor no aporta información de caja.

Las cabezas de puntuación, forma escrita y eliminación se entrenaron replicando las ventanas de entrenamiento de Cleanup v4 con sus etiquetas, y cada palabra de cada fila llevaba un objetivo de destilación procedente de las predicciones de ese modelo. La cabeza de caja se entrenó sobre salida de reconocedor alineada con texto publicado con caja: la fuente documentada es LibriHeavy (k2-fsa), con 17.982 documentos de hasta seis ventanas consecutivas de 17 segundos de lecturas de LibriVox, usando el texto del libro como referencia y reconocedores Qwen3-ASR 1.7B, entre otros. La información disponible no detalla el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Predicción de puntuación tras cada palabra: ninguno, punto, coma, interrogación o punto y coma, usando las marcas propias del reconocedor como evidencia de entrada.
- Detección de spans de forma escrita sobre 13 clases (27 etiquetas BIO) para expresiones que se escriben distinto de como se hablan, con un renderizador determinista externo que genera el valor final.
- Eliminación opcional de muletillas, repeticiones y reinicios mediante etiquetas KEEP/DELETE, aplicada solo por encima de un umbral calibrado.
- Predicción de caja por palabra (minúscula, inicial mayúscula o todo mayúsculas), incluyendo la capacidad de añadir mayúsculas que las versiones anteriores no podían.
- Funcionamiento robusto ante reconocedores que no aportan información de caja, gracias al enmascaramiento de esa entrada durante el entrenamiento.
- Procesamiento de textos largos mediante ventanas solapadas de 120 palabras con salto de 100, asignando a cada palabra la predicción de la ventana en la que está más lejos de un borde.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador de tokens de propósito específico.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Post-procesado de dictado local: la aplicación SonoJot lo ejecuta en CPU de escritorio para convertir la salida cruda del reconocedor en texto con puntuación, formas escritas y caja correcta, en torno a 0,1 segundos por 300 palabras con dos hilos.
- Normalización de salida de ASR en pipelines de subtitulado: el modelo añade puntuación y convierte expresiones habladas en su forma escrita, reduciendo la necesidad de reglas manuales por reconocedor.
- Limpieza de transcripciones de reuniones: en modo Format y en reuniones se conservan todas las palabras, mientras que en modo Clean se eliminan muletillas y repeticiones por encima del umbral calibrado.
- Estandarización de caja entre distintos reconocedores: corrige la capitalización inconsistente de sistemas que ponen mayúscula al inicio de cada fragmento decodificado o que escriben todo en minúsculas, y restaura nombres propios que coinciden con palabras comunes.
- Integración en aplicaciones web mediante onnxruntime-web (wasm): el autor indica que la versión 1.31 ejecuta el modelo, lo que permite post-procesado de ASR en el navegador sin backend.
- Preprocesado para motores de búsqueda o indexación sobre transcripciones: la puntuación y la forma escrita mejoran la segmentación de frases y la coincidencia de términos normalizados como importes o fechas.
- Evaluación y comparación de reconocedores: al recibir la caja y las marcas del reconocedor como entradas laterales, permite medir y corregir las diferencias de formato entre sistemas sin cambiar el reconocedor.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). El autor sí documenta métricas de velocidad y requisitos de ejecución:

| Medición | Valor |
|---|---|
| 300 palabras, Ryzen 9 9900X, 2 hilos, ONNX Runtime 1.28 | Aproximadamente 0,12 s (mediana de 30 ejecuciones en caliente) |
| 300 palabras, Ryzen 9 9900X, 4 hilos | Aproximadamente 0,07 s |
| 300 palabras, Apple M4, 2 hilos | 0,085 s (0,070 s con el archivo de precisión completa) |
| Relación frente al archivo de precisión completa | 1,2 a 1,3 veces más lento en la misma máquina |
| Variabilidad entre sesiones en la misma máquina | Hasta un 30 % |

El autor indica además que, en su matriz de evaluación, la salida con salto 100 está a la par con salto 60 dentro del ruido, salvo en F1 de frases de Whisper sobre los dictados (−0,002 [−0,003, −0,000]).

## Comparativa con modelos similares

La información disponible no identifica modelos comparables de la misma categoría (post-procesado de ASR con puntuación, forma escrita, eliminación y caja). El único punto de referencia documentado es su propio predecesor:

| Modelo | Parámetros | Contexto | Caja | Licencia | Formato |
|---|---|---|---|---|---|
| SonoJot Punctuation v4 | Aproximadamente 140M | Ventanas de 120 palabras, salto 100 | Predicción de caja por palabra con reglas deterministas | CC BY-SA 4.0 | ONNX int8, safetensors |
| SonoJot Punctuation v3 | Aproximadamente 140M menos unos 5k | No disponible | Solo reglas que rebajan mayúsculas | No disponible en la información | No disponible en la información |

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe documentado.
- El modelo propone la caja, pero las reglas fijas de SonoJot deciden: un capital existente solo se rebaja con probabilidad ≥ 0,98 (o ≥ 0,80 si es posicional), y convertir a todo mayúsculas exige 0,98. Estos umbrales están calibrados sobre datos de desarrollo públicos y pueden no ajustarse a otros dominios.
- La eliminación de palabras solo debe aplicarse por encima del umbral calibrado; por debajo, se conservan todas las palabras. Un uso indebido puede borrar contenido legítimo.
- El modelo no añade, reordena ni reescribe palabras; SonoJot rechaza cualquier salida cuyas palabras en minúsculas difieran de la entrada. La normalización de formas escritas depende de un renderizador determinista externo.
- Requiere ONNX Runtime 1.22 o posterior en el proveedor de CPU; las versiones 1.18 a 1.21 rechazan el grafo al cargarlo.
- Riesgo de alucinación no documentado en la información disponible, aunque la arquitectura de clasificación de tokens y la restricción de no alterar palabras limitan estructuralmente ese riesgo.
- Sesgos conocidos no documentados en la información disponible.
- La licencia CC BY-SA 4.0 impone compartir bajo la misma licencia las obras derivadas y exige atribución; conviene revisar las implicaciones para uso comercial antes de integrarlo en productos propietarios.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el modelo base (Cleanup v4) figura como no publicado, lo que limita la validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SonoJot/sonojot-punct-v4
- Modelo base: https://huggingface.co/SonoJot/sonojot-punct-v3
- Aplicación SonoJot: https://sonojot.com
- LibriHeavy (k2-fsa): no disponible en la información proporcionada
