# koidn/bs-roformer-sw-onnx

## Resumen

BS-RoFormer SW ONNX es la conversión a formato ONNX (float32) de BS-RoFormer SW-Fixed, un modelo de separación de fuentes musicales con 174.656.500 parámetros que descompone una mezcla estéreo a 44,1 kHz en seis pistas independientes: bajo, batería, otros, voz, guitarra y piano. El checkpoint original fue publicado por el usuario `jarredou` y sobrevive en el duplicado `enerjazzer/BS-ROFO-SW-Fixed`; esta versión la mantiene el usuario `koidn` a partir del espejo `remy-st/BS-ROFO-SW-Fixed`.

El interés de este artefacto es la portabilidad: al ser un grafo ONNX estático (opset 18, sin ejes dinámicos) se ejecuta únicamente con `onnxruntime`, `numpy` y `soundfile`, sin necesidad de una pila de aprendizaje profundo en Python en tiempo de inferencia. El modelo no es un pipeline de audio de extremo a extremo, sino un grafo de máscaras: consume la STFT compleja de un fragmento y devuelve máscaras complejas por fuente, y el pipeline circundante (STFT, troceado con solapamiento, ISTFT) lo aporta el repositorio de código asociado.

Es relevante para quienes necesitan integrar separación de pistas en entornos con restricciones de dependencias o en CPU, y para auditar la fidelidad numérica de una conversión ONNX frente a la referencia en PyTorch: el autor documenta que la conversión no añade error medible (correlación ≤ 5,5e-7 frente al original en float).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BS-RoFormer (transformer con atención por bandas y separación de fuentes por máscaras complejas); grafo ONNX estático, opset 18 |
| Parámetros totales | 174.656.500 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; fragmento fijo de 588.800 muestras (13,35 s) por forward, con T estático = 1151 |
| Tipos de cuantización | solo float32 en este repo; las variantes int8 del modelo de 6 pistas fallaron el criterio de calidad; variantes int8 solo para el modelo de voz (repo separado) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | unknown |
| Formato de pesos | ONNX (`bs_roformer_sw6.onnx`, 709.285.114 bytes); `SHA256SUMS` incluido |

## Arquitectura y entrenamiento

El modelo es un BS-RoFormer, una variante de transformer diseñada para separación de fuentes musicales que opera sobre la representación tiempo-frecuencia de la mezcla y predice máscaras complejas por fuente. El grafo exportado tiene un contrato concreto: la entrada `stft_chunk` es un tensor float32 de forma `(4100, 1151)`, que empaqueta la STFT compleja estéreo de un fragmento de 588.800 muestras (13,35 s) con 1025 bins en orden ascendente, organizando cada bin *k* en las filas `4k..4k+3 = [re_L, im_L, re_R, im_R]`. La salida `masks` tiene forma `(4100, S, 1151)` con el mismo diseño de filas real/imaginaria.

El pipeline de referencia usa n_fft 2048, hop 512, ventana Hann periódica de 2048 puntos, relleno reflectante central de 1024 y STFT sin normalizar, con el bin de continua puesto a cero tras el enmascarado. El troceado emplea fragmentos de 588.800 muestras con `num_overlap=2` (paso de 294.400 y crossfade lineal de 58.880 muestras con normalización por contador), y admite pistas de cualquier duración mediante una ruta de relleno reflectante en los bordes, verificada hasta 28,98 s y 7 fragmentos. El orden de las pistas de salida está fijado por el grafo y no es recuperable del archivo: 0 bajo, 1 batería, 2 otros, 3 voz, 4 guitarra, 5 piano.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o muestras, ni sobre si se aplicaron técnicas de ajuste por refuerzo o preferencias: la model card no los detalla. La innovación técnica destacable de esta publicación es la propia conversión y su verificación numérica: el pipeline ONNX en float32 reproduce la referencia en PyTorch con correlación ≤ 5,5e-7 en todas las pistas, y una pista larga de 28,98 s (7 fragmentos con relleno de borde) coincide con la referencia float con una diferencia absoluta máxima ≤ 1,6e-6.

## Capacidades

- Separación de fuentes musicales en seis pistas (bajo, batería, otros, voz, guitarra, piano) a partir de una mezcla estéreo a 44,1 kHz.
- Procesamiento de pistas de duración arbitraria mediante troceado con solapamiento y crossfade, con relleno reflectante en los bordes.
- Inferencia en CPU con `onnxruntime` sin pila de aprendizaje profundo: solo `onnxruntime`, `numpy` y `soundfile`.
- Reproducción fiel del modelo de referencia en float32 (correlación ≤ 5,5e-7 por pista), lo que permite usarlo como referencia de calidad.
- Ejecución con proveedores de onnxruntime distintos de CPU (no documentado explícitamente en la model card; el proveedor verificado es `CPUExecutionProvider`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de audio-a-audio.
- No incluye modo de pensamiento, visión ni audio de entrada en sentido lingüístico; la entrada es una representación STFT, no audio crudo.

## Casos de uso

- Separación de pistas para producción musical y remezclas: el modelo entrega seis stems alineados y de duración completa, útiles para obtener una base instrumental, aislar la voz para un remix o extraer la batería para samplear, con la ventaja de que el pipeline maneja pistas de cualquier longitud.
- Creación de karaokes y versiones instrumentales: la pista de voz (índice 3) permite generar una versión sin voz conservando el resto de la mezcla, con calidad verificada frente a la referencia float.
- Limpieza y restauración de grabaciones: separar voz y acompañamiento facilita aplicar reducción de ruido o ecualización selectiva sobre una pista concreta sin afectar a las demás.
- Análisis musical y musicología computacional: disponer de stems separados permite analizar la línea de bajo, la armonía de piano o los patrones de batería de forma independiente, por ejemplo para transcripción o extracción de características.
- Integración en herramientas de escritorio o servidores sin GPU: al ejecutarse solo con onnxruntime en CPU, encaja en aplicaciones locales, plugins o servicios donde no se quiere desplegar PyTorch ni CUDA, a costa de un rendimiento aproximado de 11 veces más lento que el tiempo real en el hardware medido.
- Verificación y auditoría de conversiones: sirve como referencia float32 para comparar implementaciones cuantizadas o portadas a otros runtimes (por ejemplo, la CLI con pesos q8_0), ya que el autor documenta las correlaciones y el SNR frente a esa CLI.
- Procesamiento por lotes de catálogos musicales: el troceado con solapamiento y la ruta de borde permiten procesar pistas completas de forma desatendida, aunque el coste por fragmento (unos 40-44 s en el hardware de referencia) condiciona el throughput.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar de separación de fuentes (SDR, SIR, SAR) sobre conjuntos como MUSDB18. Los datos publicados son métricas de fidelidad de la conversión y de velocidad.

Calidad de la conversión float32 frente a la CLI q8_0 (clip estéreo de 8,391 s):

| Pista | Correlación | SNR (dB) | Diferencia absoluta máxima |
|---|---|---|---|
| bass | 0,9999480 | 39,8 | 1,40e-2 |
| drums | 0,9999504 | 39,8 | 1,92e-2 |
| vocals | 0,9999542 | 40,4 | 2,08e-2 |
| other | 0,9947956 | 16,3 | 2,15e-3 |
| guitar | 0,9890276 | 16,0 | 2,07e-5 |
| piano | 0,9873829 | 16,0 | 1,21e-5 |

El autor atribuye la diferencia residual a los pesos q8_0 de la CLI y a su suelo numérico relativo de aproximadamente el 0,7 % en los kernels ggml, no a la conversión ONNX.

Velocidad medida en CPU x86 de 14 núcleos (host WSL compartido), onnxruntime 1.32, CPUExecutionProvider, 14 hilos, `enable_cpu_mem_arena=0`:

| Escenario | Tiempo |
|---|---|
| Forward de un fragmento de 13,35 s (6 pistas, fp32) | ~44 s (mejor de 4: 39,8 s) |
| Clip de 8,391 s de extremo a extremo | ~92 s (≈ 11× más lento que tiempo real) |
| Variantes int8 dinámicas de voz (repo separado) | ~1,24-1,27× más rápidas por fragmento |

Los tiempos son específicos del hardware y escalan proporcionalmente con el número de núcleos.

## Comparativa con modelos similares

| Modelo | Parámetros | Pistas | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| BS-RoFormer SW ONNX (este) | 174.656.500 | 6 | ONNX fp32, onnxruntime CPU | unknown | Conversión verificada, sin error medible frente a float |
| BS-RoFormer SW-Fixed (original) | 174.656.500 | 6 | PyTorch (checkpoint) | unknown | Referencia de la que deriva esta conversión |
| BS-RoFormer SW ONNX vocals | no disponible | 1 (voz) | ONNX, 58-211 MB, incluye int8 | unknown | Variante de una sola pista publicada en repo separado |
| CLI q8_0 GGUF del mismo modelo | 174.656.500 | 6 | GGUF cuantizado q8_0 | unknown | Usada como referencia de calidad en la model card |

No se dispone de datos de benchmarks estándar para comparar el rendimiento de separación con otras arquitecturas (Demucs, HTDemucs, Spleeter u otros RoFormer), por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia figura como `unknown`: no hay autorización explícita para uso comercial ni condiciones claras de redistribución. Es un riesgo relevante para producción.
- El modelo no es un pipeline de audio completo: el grafo solo calcula máscaras. Usarlo requiere implementar o adoptar el pipeline STFT, troceado, overlap-add e ISTFT del repositorio de código; un uso directo del grafo sin ese pipeline produce resultados incorrectos.
- El orden de las pistas de salida no es recuperable del archivo ONNX y está fijado por el grafo; confundirlo invalida los resultados.
- El grafo es estático (T = 1151, sin ejes dinámicos): no admite fragmentos de otra longitud sin reexportar.
- La cuantización int8 del modelo completo de 6 pistas no alcanzó el criterio de calidad: la cuantización dinámica de activaciones dio correlaciones de 0,79-0,85 en pistas silenciosas frente a la CLI, y la estática calibrada, correlación de máscara de 0,19-0,93 frente a fp32. Solo hay variantes int8 para el modelo de voz.
- Rendimiento en CPU limitado: aproximadamente 11 veces más lento que el tiempo real en el hardware medido, lo que lo hace poco adecuado para aplicaciones interactivas o de baja latencia sin GPU.
- Riesgo de artefactos en pistas con poca energía (guitarra, piano, otros): las métricas de fidelidad frente a la CLI muestran SNR de solo 16 dB en esas pistas, aunque el autor lo atribuye a la CLI y no a la conversión.
- No hay información publicada sobre sesgos, composición del dataset de entrenamiento ni evaluación en géneros musicales diversos; el comportamiento fuera de la distribución de entrenamiento es desconocido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor original de los pesos ya no está disponible en Hugging Face; conviene verificar la cadena de procedencia antes de usarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/koidn/bs-roformer-sw-onnx
- Modelo base (espejo): https://huggingface.co/remy-st/BS-ROFO-SW-Fixed
- Duplicado del original: https://huggingface.co/enerjazzer/BS-ROFO-SW-Fixed
- Repositorio de código y pipeline: https://github.com/remy-st/bs-roformer-sw-onnx
- Documentación de cuantización: https://github.com/remy-st/bs-roformer-sw-onnx/blob/main/docs/quantization.md
- Variantes de voz (1 pista, incluye int8): https://huggingface.co/remy-st/bs-roformer-sw-onnx-vocals
- onnxruntime: https://onnxruntime.ai
