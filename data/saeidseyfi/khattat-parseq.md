# saeidseyfi/khattat-parseq

## Resumen

khattat-parseq es un reconocedor de líneas de texto manuscrito publicado en Hugging Face por el usuario saeidseyfi. Se trata de un ajuste fino del reconocedor PARSeq que incluye la librería docTR, entrenado sobre el dataset propio `saeidseyfi/khattat`, compuesto por recortes de líneas de escritura manuscrita en persa, árabe e inglés, además de dígitos y símbolos matemáticos. El modelo consume imágenes de 3x32x256 píxeles y produce secuencias de hasta 88 caracteres (max_length 90 en la API de docTR).

Frente a los reconocedores orientados a texto impreso, este checkpoint se centra en escritura a mano en lenguas de escritura árabe, un ámbito con menos recursos que el inglés. El ajuste se realizó con un presupuesto muy limitado: 2.110 iteraciones con batch 12 en una CPU de 2 núcleos, entrenando solo el decodificador y la cabeza de clasificación mientras el backbone STR permanecía congelado. El pipeline es reanudable, y el propio autor señala que continuar el entrenamiento en GPU debería converger bastante más.

Su interés actual es servir como punto de partida reproducible y con licencia permisiva (CC-BY-4.0) para OCR manuscrito persa y árabe, pero las métricas publicadas son muy pobres: CER de 0,8364 y exact-match de 0,0000 en el split de test, lo que lo aleja de cualquier uso en producción sin un entrenamiento adicional sustancial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder PARSeq (reconocimiento de texto en imagen); backbone STR congelado durante el ajuste |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen 3x32x256 y secuencia de etiqueta de hasta 88 caracteres (max_length 90) |
| Tipos de cuantización | no disponible (solo se publica un checkpoint PyTorch) |
| Idiomas soportados | persa (fa), árabe (ar) e inglés (en); el vocabulario incluye además dígitos y símbolos matemáticos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch state dict (`best.pt`); vocabulario en `vocab.txt` |
| Librería | docTR |
| Vocabulario | 176 caracteres |
| Pipeline de Hugging Face | no disponible |
| Tamaño del repositorio | 0,1 GB |
| Fecha de publicación | 18 de septiembre de 2026 (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un reconocedor PARSeq, la arquitectura de reconocimiento de texto basada en transformer encoder-decoder con decodificación autorregresiva sobre permutaciones que docTR incorpora como cabecera de recognition. En este ajuste concreto, el backbone STR (el extractor de características visuales) se mantuvo congelado y solo se entrenaron el decodificador y la cabeza de clasificación, partiendo del checkpoint preentrenado de docTR. La entrada es una imagen de 3 canales y 32x256 píxeles, y la salida es una secuencia de hasta 88 caracteres sobre un vocabulario de 176 símbolos que cubre persa, árabe, inglés, dígitos y notación matemática.

El entrenamiento se ejecutó con un presupuesto temporal en una CPU de 2 núcleos: 2.110 iteraciones con batch 12, un régimen que el autor describe explícitamente como insuficiente para converger. El pipeline es totalmente reanudable, de modo que el mismo script puede continuarse en GPU. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset `saeidseyfi/khattat` ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento, que en un modelo de OCR tampoco serían el mecanismo habitual.

## Capacidades

- Reconocimiento de líneas de escritura manuscrita (transcripción de imagen a texto) en persa, árabe e inglés.
- Manejo de un vocabulario de 176 caracteres que incluye caracteres persas y árabes, alfabeto latino, dígitos y símbolos matemáticos.
- Procesamiento de recortes de línea con una resolución fija de 32x256 píxeles, el formato típico de las etapas de recognition en pipelines de OCR documental.
- Integración con docTR: el checkpoint se carga mediante `recognition.parseq` y puede encadenarse con los detectores de layout y detección de texto de la misma librería.
- Generación de transcripciones de hasta 88 caracteres por línea.
- Capacidad de continuar el entrenamiento sobre el mismo dataset gracias al diseño reanudable del pipeline.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de razonamiento extendido; no es un modelo de lenguaje y no ofrece ninguna de estas funciones.

## Casos de uso

- Investigación en OCR de escritura manuscrita persa y árabe: sirve como referencia reproducible sobre el dataset khattat, con las métricas y los ficheros de evaluación (`eval_report.json`, `worst_samples.json`) publicados para inspeccionar el comportamiento del modelo.
- Punto de partida para un fine-tuning más largo en GPU: dado que el pipeline es reanudable y el autor indica que el modelo no ha convergido, un equipo con una GPU puede continuar el entrenamiento desde `best.pt` hasta obtener un CER utilizable.
- Análisis de errores y estudio de fallos: el fichero `worst_samples.json` y el vídeo de demostración permiten identificar patrones de error por idioma (el CER en inglés, 0,8494, es peor que en persa, 0,8247) y guiar mejoras de datos.
- Prototipado de pipelines docTR para documentos en persa o árabe: se puede encadenar la detección de líneas de docTR con este reconocedor para validar la integración técnica, sin esperar calidad de producción.
- Reconocimiento experimental de expresiones matemáticas manuscritas: el vocabulario incluye símbolos matemáticos y el modelo se entrenó con ellos, aunque no hay métricas desglosadas para esa subtarea.
- Generación de líneas base para comparativas internas: cualquier nuevo modelo de OCR manuscrito persa/árabe puede contrastarse contra este checkpoint usando el mismo split de test de 372-400 líneas.
- Experimentos de aumento de datos: las transcripciones y recortes del dataset asociado pueden reutilizarse para generar pares imagen-texto sintéticos en escritura árabe.
- Digitalización de manuscritos con revisión humana obligatoria: solo en flujos donde una persona corrige después todo el texto, ya que un CER del 83,64 % implica aproximadamente 84 caracteres erróneos por cada 100.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test (372-400 muestras de línea):

| Métrica | Valor |
|---|---|
| CER en test | 0,8364 |
| Exact-match en test | 0,0000 |
| CER en inglés (en) | 0,8494 |
| CER en persa (fa) | 0,8247 |
| CER en árabe (ar) | no disponible |
| Iteraciones de entrenamiento | 2.110 |
| Batch | 12 |
| Hardware de entrenamiento | CPU de 2 núcleos |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo de reconocimiento de texto en imagen. Tampoco hay comparación numérica con otros reconocedores de escritura manuscrita.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en FP32, a juzgar por el tamaño del repositorio (0,1 GB, que incluye el checkpoint y material auxiliar) y por el hecho de que el ajuste completo se hizo en CPU.
- GPU recomendadas: no se especifica ninguna. Para continuar el entrenamiento, cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100) permitiría muchas más iteraciones que la CPU de 2 núcleos usada originalmente.
- ¿Cabe en GPU de consumo? Sí, con holgura; el modelo también se ejecuta en CPU, como demuestra el propio entrenamiento documentado.
- Opciones de despliegue: PyTorch con la librería docTR (`recognition.parseq` + `load_state_dict`). La información disponible no documenta exportación a ONNX, TorchScript, TensorRT, vLLM, TGI, Ollama ni llama.cpp; estos dos últimos no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La entrada es pequeña (32x256 píxeles por línea) y el cuello de botella típico será la fase de detección de líneas del pipeline, no el reconocedor.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Métricas comparables |
|---|---|---|---|---|
| saeidseyfi/khattat-parseq | PARSeq ajustado para escritura manuscrita | fa, ar, en | CC-BY-4.0 | CER 0,8364; exact-match 0,0000 |
| PARSeq preentrenado de docTR (Mindee) | PARSeq para texto en escena/impreso | principalmente latino | Apache-2.0 | no disponible |
| Tesseract | OCR clásico con LSTM | más de 100 idiomas, incluidos fa y ar | Apache-2.0 | no disponible |
| TrOCR (Microsoft) | Transformer encoder-decoder para texto manuscrito e impreso | principalmente inglés | MIT (según su model card pública) | no disponible |
| PaddleOCR | familia de detectores y reconocedores | multilingüe, incluye árabe y persa | Apache-2.0 | no disponible |

No se dispone de cifras de CER de los modelos alternativos dentro de la información proporcionada, por lo que la comparación cuantitativa directa no es posible. Las licencias de los proyectos alternativos se indican según su documentación pública habitual; conviene verificarlas antes de un uso comercial.

## Limitaciones y advertencias

- Calidad muy baja: un CER de 0,8364 significa que aproximadamente el 84 % de los caracteres se transcriben mal, y el exact-match es exactamente 0,0000 en el test publicado. No es utilizable en producción sin un reentrenamiento profundo.
- Entrenamiento incompleto: 2.110 iteraciones con batch 12 en CPU de 2 núcleos y con el backbone congelado. El autor reconoce explícitamente que el modelo no ha convergido.
- Sin datos de evaluación en árabe: el CER desglosado solo cubre inglés y persa, aunque el vocabulario y el dataset incluyen árabe.
- Sesgo de dominio: el modelo solo ha visto el dominio del dataset `saeidseyfi/khattat` (recortes de línea, 32x256). Es probable que degrade con otras resoluciones, estilos de escritura, fondos o tipos de documento.
- Sensibilidad a la variabilidad de la escritura manuscrita: sin datos suficientes de entrenamiento, el modelo no generaliza a estilos de letra, inclinaciones o calidades de escaneo no representados en el dataset.
- Riesgo de salidas plausibles pero incorrectas: al ser un decodificador autorregresivo con vocabulario cerrado de 176 símbolos, puede generar texto con aspecto correcto en idioma pero sin correspondencia con la imagen, especialmente en líneas largas.
- Restricción de longitud: la salida se limita a 88 caracteres (max_length 90), por lo que las líneas más largas quedan truncadas.
- Licencia: CC-BY-4.0 permite uso comercial y modificaciones siempre que se atribuya la autoría y se indique si hubo cambios; no incluye garantías. Es responsabilidad del usuario verificar la licencia y la procedencia de los datos de entrenamiento del dataset `saeidseyfi/khattat`, sobre la que la model card no ofrece información.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en Hugging Face, lo que sugiere ausencia de uso y de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saeidseyfi/khattat-parseq
- Dataset de entrenamiento citado: https://huggingface.co/datasets/saeidseyfi/khattat
- Librería docTR (Mindee), requerida para cargar el checkpoint: https://github.com/mindee/doctr
- La búsqueda web realizada no devolvió ningún resultado relevante para este modelo; los enlaces obtenidos correspondían a piezas de aviación y módulos de radiofrecuencia sin relación con el modelo. No se dispone de paper, blog, repositorio adicional ni demo pública más allá del vídeo `demo_khattat_parseq.mp4` incluido en el propio repositorio de Hugging Face.
