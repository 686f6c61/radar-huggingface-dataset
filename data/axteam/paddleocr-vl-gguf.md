# axteam/PaddleOCR-VL-GGUF

## Resumen

PaddleOCR-VL-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo PaddlePaddle/PaddleOCR-VL, publicadas por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. El modelo original es un sistema de reconocimiento óptico de caracteres (OCR) de tipo visión-lenguaje; sin embargo, esta conversión incluye únicamente el backbone de texto, un LLM de aproximadamente 467 millones de parámetros derivado de la familia ERNIE-4.5, y prescinde por completo del codificador visual. Por tanto, no sirve para hacer OCR de extremo a extremo: sirve para ejecutar la parte textual del pipeline en entornos ligeros.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de cuantización parcial que puede llevar a error: quien descargue el GGUF esperando transcribir imágenes no obtendrá ese resultado. Por otro, muestra el interés creciente por desplegar componentes de pipelines OCR multimodales en hardware modesto mediante llama.cpp, con ficheros de 0,3 GB (Q4_K_M) y 0,5 GB (Q8_0).

El repositorio se publicó el 29 de octubre de 2026, tiene licencia Apache 2.0, ocupa 0,8 GB y registra un número muy bajo de descargas en el momento de la consulta, por lo que debe considerarse un artefacto experimental más que una distribución de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone de texto tipo ERNIE-4.5, reconocido por llama.cpp como `paddleocr`); el codificador visual del modelo original no esta incluido |
| Parametros totales | 466.654.208 (aproximadamente 467 M), correspondientes solo al backbone de texto |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits, k-quant medium) y Q8_0 (8 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`PaddleOCR-VL-Q4_K_M.gguf` de 0,3 GB, `PaddleOCR-VL-Q8_0.gguf` de 0,5 GB) |

## Arquitectura y entrenamiento

El artefacto es una conversion de pesos, no un modelo entrenado desde cero. El script `convert_hf_to_gguf.py` de llama.cpp identifico el checkpoint original como `paddleocr` con backbone de texto ERNIE-4.5, lo que sitúa la parte textual en una arquitectura transformer decoder de unos 467 M de parámetros. El `chat_template` original se ha embebido en el GGUF, de modo que el fichero es utilizable como modelo conversacional en llama.cpp, Ollama y LM Studio.

La limitación estructural más importante es la ausencia del codificador visual. El modelo PaddleOCR-VL original es multimodal y combina percepción de imagen con generación de texto para transcribir documentos; esta conversión conserva solo la segunda mitad del sistema. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, las etapas de alineación (RLHF/DPO) ni innovaciones técnicas del modelo base en la información proporcionada. Tampoco se documenta qué método de cuantización exacto se aplicó (por ejemplo, calibración con imatrix) más allá de la nomenclatura estándar de llama.cpp.

## Capacidades

- Generación de texto autoregresiva con el backbone ERNIE-4.5 cuantizado, en formato GGUF.
- Conversación multi-turno gracias al `chat_template` embebido (etiqueta `conversational` en el repositorio).
- Ejecución en CPU y en GPU de gama baja mediante llama.cpp, Ollama o LM Studio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite servirlo con `llama-server` y exponerlo por API HTTP.
- No incluye OCR: al no incorporar el codificador visual, no puede procesar imágenes ni transcribir documentos.
- No hay información disponible sobre soporte de tool calling, capacidades de agente, modo thinking o soporte multilingüe verificado.

## Casos de uso

- Evaluación de cuantizaciones: comparar la perplejidad y la calidad de salida de Q4_K_M frente a Q8_0 sobre el backbone de texto, para decidir qué variante usar en un despliegue con recursos limitados.
- Servicio de texto ligero en local: montar un endpoint HTTP con `llama-server` en una máquina sin GPU para tareas de generación de texto acotadas, con un consumo de disco de 0,3-0,5 GB.
- Pruebas de integración en pipelines OCR: usar este GGUF como sustituto del backbone de texto durante el desarrollo de la lógica de post-procesado, sin cargar el modelo multimodal completo.
- Reproducción de conversiones HF a GGUF: sirve como referencia práctica para verificar que el conversor de llama.cpp reconoce correctamente checkpoints PaddleOCR y conserva el `chat_template`.
- Entornos educativos: ilustrar en un aula la diferencia entre un modelo multimodal completo y su backbone textual aislado, con un coste de hardware mínimo.
- Prototipado en dispositivos de borde: desplegar generación de texto en equipos con menos de 1 GB de RAM disponible para pesos, usando la variante Q4_K_M.
- Aviso importante: para cualquier caso de uso real de OCR sobre imágenes o PDF, debe utilizarse el modelo original `PaddlePaddle/PaddleOCR-VL` o las builds con compressed-tensors para vLLM, no este GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 0,5-1 GB para Q4_K_M y 1-1,5 GB para Q8_0, incluyendo overhead de contexto y de la librería; cifras orientativas calculadas a partir del tamano de los ficheros (0,3 GB y 0,5 GB) y de los 467 M de parametros.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU sin GPU dedicada.
- Cabe holgadamente en GPU consumer: si, en practicamente cualquier tarjeta de los ultimos diez anos, e incluso en Raspberry Pi y mini-PC con CPU moderna.
- Opciones de despliegue: llama.cpp (`llama-cli -hf axteam/PaddleOCR-VL-GGUF`, `llama-server`), Ollama y LM Studio; el modelo original requiere en cambio vLLM o los builds con compressed-tensors.
- Latencia y throughput: no disponibles. Por el tamano del modelo se espera una latencia de decenas de milisegundos por token en CPU moderna y muy inferior en GPU, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Uso previsto |
|---|---|---|---|---|---|---|
| axteam/PaddleOCR-VL-GGUF | 467 M (solo backbone de texto) | No disponible | No incluida | Apache 2.0 | GGUF (Q4_K_M, Q8_0) | Generacion de texto en llama.cpp/Ollama |
| PaddlePaddle/PaddleOCR-VL (original) | No disponible | No disponible | Si | Apache 2.0 | Safetensors (pesos HF) | OCR de extremo a extremo |
| Builds compressed-tensors para vLLM | No disponible | No disponible | Si | Apache 2.0 | Compressed-tensors | OCR de extremo a extremo con vLLM |

No se dispone en la informacion proporcionada de datos verificables sobre otros modelos OCR comparables (parametros, contexto o resultados de benchmarks), por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- No realiza OCR: el codificador visual esta ausente del GGUF. Es el caveat principal y afecta a cualquier uso previsto sobre imagenes o documentos escaneados.
- Riesgo de confusion en el nombre: el repositorio se llama PaddleOCR-VL-GGUF pero solo contiene el componente textual; conviene revisar el README antes de integrarlo.
- Alucinacion: al ser un modelo de 467 M de parametros, la tasa de generacion de contenido incorrecto es previsiblemente alta en tareas abiertas; no se han publicado evaluaciones al respecto.
- Sesgos: no hay informacion disponible sobre sesgos conocidos del backbone ERNIE-4.5 ni sobre los datos de entrenamiento.
- Idioma y contexto: se desconoce la longitud de contexto soportada y la cobertura idiomatica real; no debe asumirse soporte de castellano sin verificacion empirica.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el titular original de los pesos es PaddlePaddle; conviene conservar los avisos de atribucion.
- Madurez: 0 descargas y 1 like en el momento de la consulta, publicacion sin actualizaciones posteriores; no hay garantia de mantenimiento ni de soporte.
- Produccion: no se recomienda como dependencia critica sin una evaluacion previa de calidad y sin verificar el comportamiento del `chat_template` embebido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/axteam/PaddleOCR-VL-GGUF
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL
- llama.cpp (conversor y runtime): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- No se han encontrado en la busqueda web enlaces relevantes (papers, blogs o demos) relacionados con este modelo.
