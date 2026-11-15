# mradermacher/Qwen3.5-0.8B-Python-SoftMoE-GGUF

## Resumen

`mradermacher/Qwen3.5-0.8B-Python-SoftMoE-GGUF` es una publicacion de cuantizaciones estaticas en formato GGUF derivada del modelo `NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE`. El autor de esta ficha, mradermacher, es un conocido empaquetador de pesos en GGUF para su uso con llama.cpp y herramientas compatibles, no el desarrollador original del modelo base. Por tanto, esta publicacion no introduce entrenamiento ni arquitectura nueva: su valor es facilitar el despliegue del modelo original en entornos con recursos limitados.

El modelo base, segun su nombre, parece ser una variante de la familia Qwen3.5 con aproximadamente 0,8 mil millones de parametros, especializada en Python y con una arquitectura de tipo SoftMoE (mezcla de expertos suave). Sin embargo, no se dispone de la model card del modelo original en la informacion proporcionada, por lo que los detalles sobre datos de entrenamiento, licencia o idiomas no estan confirmados.

La relevancia de esta publicacion es practica: ofrece hasta once variantes de cuantizacion (desde x-f16 hasta Q2_K) con un tamano de repositorio de 0,3 GB, lo que permite ejecutar el modelo en CPU, GPUs de consumo o dispositivos con poca memoria. Es una opcion a considerar si se necesita un modelo pequeno orientado a codigo Python y se quiere evitar la conversion manual a GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SoftMoE (mezcla de expertos suave), segun el nombre del modelo base; no confirmado en detalle |
| Parametros totales | 100.592.896 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no permite describir con rigor la arquitectura interna del modelo base. El nombre `Qwen3.5-0.8B-Python-SoftMoE` sugiere una variante de la familia Qwen3.5 de aproximadamente 0,8 mil millones de parametros, orientada a Python y con una capa de mezcla de expertos suave (SoftMoE). El recuento real de parametros en safetensors es de 100.592.896, lo que es coherente con un modelo de ese orden de magnitud, aunque no se confirma el desglose entre parametros densos y expertos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. La publicacion de mradermacher se limita a generar cuantizaciones estaticas del modelo original mediante su pipeline habitual (convert_type: hf, quantize_version: 2), sin aportar detalles adicionales de entrenamiento.

## Capacidades

- Generacion de texto y codigo, presumiblemente con enfasis en Python por el sufijo `Python` del nombre.
- Razonamiento y respuesta a instrucciones, segun el formato del modelo base (no confirmado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- **Autocompletado de codigo Python en el editor**: el modelo, al estar especializado en Python y tener un tamano reducido, puede integrarse en extensiones de editor o servidores LSP para sugerencias de linea o bloque con baja latencia en CPU.
- **Generacion de scripts y utilidades**: adecuado para producir pequenos scripts de automatizacion, parsing o transformacion de datos donde no se requiere un modelo grande y se prioriza el coste.
- **Prototipado rapido en local**: con cuantizaciones Q4_K_M o Q5_K_M (unos cientos de MB), se puede ejecutar en portatiles sin GPU para experimentar con pipelines de generacion de codigo antes de escalar a modelos mayores.
- **Asistente de documentacion tecnica**: puede redactar docstrings y comentarios a partir de firmas de funciones, aprovechando su orientacion a Python.
- **Filtrado y clasificacion de fragmentos de codigo**: en tareas de etiquetado o deteccion de patrones en repositorios, un modelo pequeno cuantizado permite procesar grandes volumenes con coste minimo.
- **Despliegue en dispositivos con recursos limitados**: gracias a las cuantizaciones Q2_K y Q3_K, puede ejecutarse en Raspberry Pi o contenedores con poca RAM, util para demos o entornos embebidos.
- **Base para fine-tuning ligero**: al ser un modelo de ~100M parametros, es viable ajustarlo en una sola GPU de consumo para tareas especificas de codigo, aunque esta publicacion solo incluye pesos GGUF, no safetensors para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada**: las cuantizaciones Q2_K y Q3_K ocupan del orden de 50-100 MB; Q4_K_M y Q5_K_M, en torno a 100-150 MB; Q8_0 y x-f16, hasta unos 200-300 MB (estimacion a partir del recuento de parametros y del tamano del repo de 0,3 GB).
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta claramente infrautilizado en ellas.
- **GPU de consumo**: si, cabe en practicamente cualquier GPU de consumo e incluso en iGPU y CPU.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que se requeriria el modelo original en safetensors.
- **Latencia y throughput**: no disponible; por el tamano, se espera latencia muy baja en CPU y practicamente instantanea en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Python-SoftMoE (GGUF, esta ficha) | 100.592.896 | no disponible | no disponible | GGUF | Especializado en Python, SoftMoE |
| Qwen2.5-Coder-0.5B | ~0,5B | 32K (segun model card publica de Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Alternativa densa orientada a codigo |
| Qwen2.5-Coder-1.5B | ~1,5B | 32K (segun model card publica de Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Mayor capacidad, mas recursos |
| SmolLM2-135M | ~135M | 8K (segun model card publica) | Apache 2.0 (segun HuggingFace) | safetensors, GGUF | Modelo pequeno generalista |

Los datos de los modelos comparables provienen de sus model cards publicas y pueden variar; se incluyen solo como referencia orientativa. No se dispone de benchmarks del modelo de esta ficha para comparar rendimiento real.

## Limitaciones y advertencias

- **Licencia no confirmada**: la licencia del modelo base no esta disponible en la informacion proporcionada; antes de un uso comercial es imprescindible verificar la licencia en el repositorio original `NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE`.
- **Modelo derivado, no original**: esta publicacion solo contiene cuantizaciones; cualquier problema de calidad, sesgo o comportamiento proviene del modelo base.
- **Riesgo de alucinacion**: como todo modelo de lenguaje, especialmente uno de tamano reducido, puede generar codigo incorrecto o APIs inexistentes; se recomienda validacion automatica (tests, linters).
- **Contexto e idiomas desconocidos**: no se ha confirmado la longitud de contexto ni los idiomas soportados, lo que limita su uso en tareas multilingues o de contexto largo.
- **Cuantizaciones agresivas**: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- **Sin benchmarks**: no hay evidencia publicada de rendimiento frente a alternativas, por lo que la eleccion debe basarse en pruebas propias.
- **Repo con 0 descargas y 0 likes**: publicacion muy reciente y sin validacion comunitaria; conviene auditar los pesos antes de usarlos en produccion.

## Enlaces

- Repositorio Hugging Face (esta publicacion): https://huggingface.co/mradermacher/Qwen3.5-0.8B-Python-SoftMoE-GGUF
- Modelo base original: https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
