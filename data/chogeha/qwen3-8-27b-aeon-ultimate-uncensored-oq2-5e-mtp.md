# chogeha/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ2.5e-mtp

## Resumen

Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ2.5e-mtp es una cuantizacion mixta de un modelo de la familia Qwen 3.5 (etiqueta `qwen3_5` en Hugging Face), publicada por el usuario `chogeha`. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado con la herramienta oQ (oMLX v0.7.4.dev1), que aplica precision mixta por tensor para reducir el peso del modelo original de aproximadamente 27.800 millones de parametros a unos 12,8 GB de almacenamiento, con un promedio efectivo de 3,678 bits por peso. El resultado esta empaquetado en formato MLX, pensado para ejecutarse en hardware Apple Silicon.

El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (26.896B parametros), un codificador de vision (0.461B) y una cabeza MTP (Multi-Token Prediction, 0.425B). La presencia de vision y de MTP indica que el modelo base es multimodal y que incorpora decodificacion especulativa nativa mediante prediccion de multiples tokens. La cuantizacion es agresiva: mas del 73% de los pesos estan en 3 bits con grupo 128, y un 8,4% baja hasta 2 bits con grupo 64, mientras que solo un 1,86% permanece en BF16.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de cuantizacion mixta que permite llevar un modelo de casi 28B a un tamano manejable en equipos de consumo con memoria unificada. Por otro, advierte de las limitaciones de un artefacto de este tipo: el autor no publica informacion sobre el modelo base exacto, licencia, idiomas ni evaluaciones, y el nombre incluye la etiqueta "UNCENSORED", lo que implica que se ha modificado o seleccionado el comportamiento del modelo respecto al original. Todo ello obliga a tratar el checkpoint con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.5 (etiqueta `qwen3_5`), con torre de vision y cabeza MTP; arquitectura exacta no disponible |
| Parametros totales | 27.781B (26.896B lenguaje + 0.461B vision + 0.425B cabeza MTP) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta afín: 2-bit g64, 3-bit g128, 3-bit g64, 4-bit g64, 5-bit g64, 6-bit g64, 8-bit g64 y BF16; promedio efectivo 3,678 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con cuantizacion MLX (libreria `mlx`); repo de 12,8 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion de un modelo Qwen 3.5 de aproximadamente 27.800 millones de parametros. La distribucion de pesos revela una arquitectura multimodal: un tronco de lenguaje de 26.896B parametros, un codificador visual de 0.461B y una cabeza de prediccion multi-token (MTP) de 0.425B. La cabeza MTP es una innovacion relevante: permite al modelo predecir varios tokens por paso de decodificacion, lo que habilita decodificacion especulativa interna y reduce la latencia de generacion sin necesidad de un modelo borrador externo. La torre de vision confirma que el modelo base acepta entradas de imagen ademas de texto.

No se dispone de informacion sobre el proceso de entrenamiento del modelo original: numero de tokens, composicion del dataset, uso de RLHF o DPO, ni detalles sobre la arquitectura interna (numero de capas, dimensiones, atencion lineal o completa). Lo unico documentado es el proceso de cuantizacion: oQ (oMLX v0.7.4.dev1) asigna precision por tensor segun su sensibilidad, manteniendo en BF16 solo 0.516B parametros (1,857% del total) y en 5 bits 2.781B parametros (10,012%), mientras que el grueso cae a 3 bits. El resultado ocupa 11,894 GiB en almacenamiento, de los cuales 10,743 GiB corresponden al modelo de lenguaje, 0,858 GiB a vision y 0,293 GiB a la cabeza MTP.

## Capacidades

- Generacion de texto y razonamiento: el tronco de lenguaje de 26.896B parametros soporta tareas de comprension y generacion, aunque la cuantizacion a 2-3 bits puede degradar el razonamiento complejo.
- Procesamiento de vision: la torre de 0.461B parametros permite entrada de imagenes, presumiblemente para descripcion, VQA y extraccion de informacion visual.
- Decodificacion especulativa nativa: la cabeza MTP de 0.425B habilita prediccion multi-token, lo que acelera la inferencia en hardware MLX.
- Modo "uncensored": el nombre indica que se ha reducido o eliminado el alineamiento de seguridad del modelo original; no se documenta el metodo ni el alcance.
- Tool calling y function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Modo thinking: no disponible (no se menciona).

## Casos de uso

- Prototipado local en Apple Silicon: el checkpoint en formato MLX y 12,8 GB cabe en equipos con memoria unificada de 16 GB o mas, lo que permite experimentar con un modelo de 27.800M parametros en un portatil Mac sin GPU dedicada. Es adecuado para pruebas de concepto y evaluacion de calidad antes de invertir en infraestructura mayor.
- Analisis de documentos con imagenes: gracias a la torre de vision, se puede usar para extraer texto y describir figuras en capturas, escaneos o diagramas, combinando entrada visual y generacion de texto en una sola pasada.
- Generacion de texto creativo sin filtros: la etiqueta "uncensored" lo hace adecuado para entornos de investigacion sobre sesgos, escritura creativa sin restricciones de contenido o simulacion de personajes, siempre que se asuma la ausencia de salvaguardas.
- Evaluacion de tecnicas de cuantizacion: el checkpoint sirve como caso de estudio de precision mixta, permitiendo comparar la calidad de salida frente al modelo original en BF16 y medir el impacto de bajar pesos a 2-3 bits.
- Investigacion sobre decodificacion especulativa: la cabeza MTP integrada permite medir aceleraciones de latencia en MLX y estudiar el equilibrio entre velocidad y calidad en la prediccion multi-token.
- Experimentacion con modelos multimodales en local: para investigadores que necesitan un modelo vision-lenguaje ejecutable sin conexion y sin depender de APIs, este checkpoint ofrece una alternativa autocontenida, con la advertencia de que la licencia no esta clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 12,8 GB de almacenamiento en disco; para inferencia en MLX se necesita al menos esa cantidad de memoria unificada, mas overhead de activaciones y cache KV. Se recomienda un minimo de 16 GB de memoria unificada y 24-32 GB para contextos largos.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 16 GB o superior; no esta pensado para GPUs NVIDIA de consumo por el formato MLX.
- Opciones de despliegue: MLX (libreria `mlx` y `mlx-lm`), oMLX; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que los pesos estan en formato MLX cuantizado.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere una mejora de latencia frente a decodificacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ2.5e-mtp | 27.781B | no disponible | MLX safetensors (3,678 bits/peso) | no disponible | Hugging Face, 0 descargas |
| Modelo Qwen 3.5 base (sin cuantizar) | ~27.8B (inferido) | no disponible | safetensors BF16 | no disponible | no disponible en la informacion |
| Otras cuantizaciones MLX de la familia Qwen | variable | no disponible | MLX | segun autor | no disponible en la informacion |

No se dispone de datos de rendimiento ni de especificaciones verificadas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y formato.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Al derivar de un modelo Qwen, la licencia original del modelo base deberia aplicarse, pero el autor no la declara.
- Cuantizacion agresiva: el 8,4% de los pesos esta en 2 bits y el 73,8% en 3 bits, lo que previsiblemente degrada el razonamiento, las matematicas y la fidelidad en tareas complejas frente al modelo en BF16. No hay evaluaciones que cuantifiquen esa perdida.
- Etiqueta "uncensored": implica que se han reducido o eliminado las salvaguardas del modelo original. No se documenta el metodo, el alcance ni los riesgos asociados; no es apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, agravado por la cuantizacion de baja precision y por la ausencia de datos de evaluacion.
- Idiomas no declarados: se desconoce el soporte multilingue real y la calidad en castellano.
- Contexto no documentado: se desconoce la ventana de contexto maxima, lo que impide planificar casos de uso con documentos largos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni model card con informacion de evaluacion; la reproducibilidad y el soporte son limitados.
- Compatibilidad restringida: el formato MLX limita su uso a hardware Apple Silicon; no se puede desplegar directamente en infraestructura CUDA sin reconvertir los pesos.
- Fecha de creacion futura (2026-11-11): el metadato del repositorio indica una fecha posterior a la actual, lo que sugiere posibles inconsistencias en los metadatos o en el proceso de publicacion.

## Enlaces

- Hugging Face: https://huggingface.co/chogeha/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ2.5e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
