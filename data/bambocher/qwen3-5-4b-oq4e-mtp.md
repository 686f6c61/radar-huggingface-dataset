# bambocher/Qwen3.5-4B-oQ4e-mtp

## Resumen

El modelo `bambocher/Qwen3.5-4B-oQ4e-mtp` es una cuantización de precisión mixta de 4 bits del modelo Qwen3.5-4B, realizada con la herramienta oQ (parte de oMLX v0.6.1) y publicada en formato MLX safetensors. El autor, bambocher, ha optimizado el modelo para su ejecución en hardware Apple Silicon mediante la librería MLX, reduciendo significativamente la huella de memoria y acelerando la inferencia en comparación con los pesos en punto flotante originales.

El modelo base, Qwen3.5-4B, es un transformer denso de 4 mil millones de parámetros desarrollado por Alibaba, con una ventana de contexto nativa de 262 144 tokens y capacidades multimodales (visión y lenguaje). Esta cuantización conserva la arquitectura general, incluyendo el mecanismo de predicción multi-token (MTP) que acelera la generación autoregresiva. Es relevante porque permite ejecutar un modelo de esta categoría en equipos Apple con memoria unificada limitada, sin necesidad de GPUs dedicadas, manteniendo un equilibrio entre calidad y rendimiento.

Cabe destacar una discrepancia: el archivo safetensors reporta 1 057 525 248 parámetros, muy por debajo de los 4B que sugiere el nombre. Esto podría deberse a pesos compartidos, a que el archivo solo contiene una parte del modelo (por ejemplo, sin el módulo MTP) o a un error en el conteo de HuggingFace. Se recomienda verificar la integridad del modelo antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso con MTP) |
| Parametros totales | 1 057 525 248 (segun safetensors; el nombre sugiere 4B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens (contexto nativo del modelo base, segun LM Studio; no especificado para esta cuantizacion) |
| Tipos de cuantizacion | 4 bits, grupo 64, precision mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento desde cero. La arquitectura base es qwen3_5, un transformer denso con atencion por ventana deslizante y mecanismo de prediccion multi-token (MTP), que permite predecir varios tokens futuros en paralelo y acelerar la decodificacion. Segun la informacion de LM Studio, el modelo base integra capacidades multimodales (vision y lenguaje) y un modo de razonamiento explicito (thinking mode).

La cuantizacion se realizo con oQ (oMLX v0.6.1) en precision mixta de 4 bits con grupo de 64, lo que significa que los pesos se agrupan en bloques de 64 y cada bloque se cuantiza con su propia escala y offset. Este enfoque reduce el error de cuantizacion en comparacion con una cuantizacion uniforme global. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre el proceso de calibracion de la cuantizacion.

## Capacidades

- Generacion de texto autoregresiva en lenguaje natural.
- Razonamiento multi-paso con modo "thinking" activable (segun los benchmarks de oMLX que muestran el parametro `enable_thinking`).
- Prediccion multi-token (MTP) para acelerar la inferencia.
- Capacidades multimodales (vision y lenguaje) segun la ficha de LM Studio para Qwen3.5-4B, aunque no se confirma si esta cuantizacion conserva el encoder de vision.
- Soporte de contexto largo (hasta 262 144 tokens en el modelo base), util para documentos extensos o conversaciones multi-turno.
- Integracion con oMLX, lo que permite usar aceleraciones como Lightning MTP y cuantizacion KV cache (turboquant).

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede ejecutarse en un Mac con Apple Silicon usando oMLX, gestionando dialogos multi-turno con contexto amplio gracias a su ventana de 262K tokens (si se conserva en la cuantizacion).
- Razonamiento y resolucion de problemas en entornos offline: el modo thinking permite desglosar problemas complejos de matematicas o logica, util para aplicaciones educativas o de investigacion sin conexion.
- Analisis de documentos largos: con su contexto extendido, puede resumir o extraer informacion de informes, articulos o libros completos en una sola pasada.
- Prototipado rapido de aplicaciones de IA en macOS: al ser un formato MLX nativo, se integra directamente con el ecosistema de Apple (Swift, Xcode) para desarrollar apps de IA generativa sin depender de la nube.
- Generacion de codigo asistida: aunque no se especifica soporte explicito de tool calling, el modelo base de Qwen3.5 suele incluir capacidades de codigo; puede usarse para autocompletar o explicar fragmentos en entornos locales.
- Evaluacion de cuantizaciones: este modelo sirve como referencia para comparar el impacto de la cuantizacion 4-bit con grupo 64 en la calidad de salida frente al modelo original en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los enlaces de oMLX muestran metricas de rendimiento de inferencia (TTFT, pico de memoria) para variantes similares, pero no son comparables directamente con benchmarks estandar de NLP. Se recomienda ejecutar evaluaciones propias si se requiere validar la calidad del modelo cuantizado.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1 o posterior) con memoria unificada de al menos 8 GB, dado que el repositorio ocupa 3.3 GB y el benchmark en M5 (10c) reporta un pico de memoria de 4 GB durante la inferencia.
- GPU integrada de Apple (cualquier chip M-series es suficiente; los benchmarks muestran M1 Max y M5).
- Almacenamiento: 3.3 GB para los pesos.
- Software: oMLX v0.6.1 o superior, macOS 26 o versiones recientes (segun los benchmarks).
- Opciones de despliegue: oMLX (inferencia local), integracion con Swift/Xcode, o cualquier framework que soporte MLX safetensors.
- Rendimiento estimado: en un M5 (10c), el TTFT (time to first token) es de 5.5 ms con contexto 4096; en M1 Max (32c) con contexto 8192 se reportan metricas similares, aunque no se detallan los tokens por segundo. La velocidad depende de la longitud de contexto y de las optimizaciones activadas (Lightning MTP, turboquant KV).

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria. Las alternativas posibles incluyen:

- Otras cuantizaciones de Qwen3.5-4B en formato GGUF (por ejemplo, la variante DeepSeek-V4-Pro-Qwen3.5-4B-MTP-GGUF, que es un fine-tune de razonamiento sobre la misma base). Sin embargo, no hay datos de rendimiento comparativos disponibles.
- Cuantizaciones MLX de modelos similares (por ejemplo, Llama 3.2 3B o Phi-3.5 mini) en formato 4-bit, pero no se han encontrado benchmarks publicados que permitan una comparacion directa.

Se recomienda ejecutar pruebas propias con las herramientas de oMLX para evaluar el rendimiento relativo.

## Limitaciones y advertencias

- La cuantizacion de 4 bits puede introducir degradacion en tareas que requieren alta precision numerica, como matematicas complejas o generacion de codigo con logica intrincada.
- La discrepancia entre el nombre del modelo (4B) y el numero de parametros reales del archivo safetensors (1.06B) sugiere que el repositorio podria estar incompleto o mal etiquetado. Verificar la integridad antes de usarlo en produccion.
- No se especifica la licencia del modelo cuantizado. La licencia del modelo base Qwen3.5 no se ha confirmado en esta informacion; es posible que tenga restricciones de uso comercial. Consultar la documentacion oficial de Qwen.
- No se han documentado los idiomas soportados. Aunque Qwen3.5 suele ser multilingue, esta cuantizacion no aporta datos al respecto.
- El modo vision del modelo base podria no estar funcional en esta cuantizacion, ya que no se menciona la inclusion del encoder de vision en el proceso de cuantizacion.
- Los benchmarks de rendimiento disponibles provienen de pruebas con contextos cortos (4K-8K) y pueden no reflejar el comportamiento con contextos largos (262K), donde la memoria y la latencia aumentan considerablemente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bambocher/Qwen3.5-4B-oQ4e-mtp
- Modelo base Qwen3.5-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Ficha de Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Benchmark oMLX en M1 Max: https://omlx.ai/benchmarks/performance/m3p4b9m5
- Benchmark oMLX en M5: https://omlx.ai/benchmarks/performance/edkc0g6f
- Variante fine-tune GGUF (referencia): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B-MTP-GGUF
