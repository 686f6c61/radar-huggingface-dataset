# Housto4/uadetox-gate

## Resumen

UADetox gate es un clasificador binario de texto que decide si un comentario escrito en ucraniano es lo bastante descortés o toxico como para enviarlo a un modelo de reescritura (concretamente a Housto4/uadetox-e2b). Lo desarrolla el usuario Housto4 (Ivan H) y se distribuye bajo licencia MIT. No es un modelo generativo ni un moderador autonomo: es una pieza de enrutamiento dentro de un pipeline de detoxificacion de comentarios.

Tecnicamente es un fine-tuning completo de intfloat/multilingual-e5-small (118M parametros) reconvertido en clasificador de secuencias con dos etiquetas. La entrada es unicamente el texto del comentario, truncado a 128 tokens, y la salida es la probabilidad de que necesite reescritura. El modelo se publica en formato safetensors (fp16) y como exportacion ONNX (fp32, opset 17), lo que permite inferencia en CPU a unos 11 ms por comentario con 4 hilos.

Su relevancia practica esta en el caso de uso: filtrado previo barato y rapido para evitar reescrituras innecesarias en comunidades ucranianas de Telegram, un escenario concreto y con datos propios. El autor declara resultados en un test bloqueado con etiquetado por politica escrita y advierte de que el acuerdo con anotacion humana es solo moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), fine-tuning completo de intfloat/multilingual-e5-small como clasificador de secuencias |
| Parametros totales | 117.654.530 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (truncado de entrada) |
| Tipos de cuantizacion | no disponible (se publican pesos fp16 y ONNX fp32; no se documentan variantes GGUF ni cuantizaciones adicionales) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16), ONNX (fp32, opset 17) |

## Arquitectura y entrenamiento

La base es intfloat/multilingual-e5-small, un encoder transformer de tipo BERT con 118M parametros, reentrenado aqui como clasificador de dos clases. La cabeza de clasificacion produce logits y la probabilidad de reescritura se obtiene como `softmax(logits)[1]`. La entrada se trunca a 128 tokens, lo que fija el coste computacional y explica la latencia baja en CPU.

El entrenamiento usa 227.552 comentarios de Telegram procedentes de 74 canales publicos ucranianos, durante dos epocas con learning rate 5e-5. Las etiquetas no son humanas: un LLM aplica una politica escrita de reescritura. La clase positiva son comentarios del dataset UADetox y otros comentarios raspados que el LLM considero toxicos bajo esa politica; la clase negativa incluye comentarios juzgados no toxicos, negativos duros (con palabras marcadas o puntuacion alta en un score automatico de toxicidad) y una muestra amplia de comentarios sin cribar de los mismos canales como negativos debiles. Los candidatos a etiquetado se prefiltraron por score automatico de toxicidad y coincidencia de palabras clave. Para evaluacion se retuvieron canales completos nunca vistos en entrenamiento y se eliminaron solapamientos con los splits de validacion y test de UADetox.

## Capacidades

- Clasificacion binaria de texto: estima P(necesita reescritura) para un comentario en ucraniano.
- Deteccion de toxicidad centrada en un caso de uso concreto: enrutar comentarios hacia un reescritor.
- Inferencia rapida en CPU: aproximadamente 11 ms por comentario con 4 hilos.
- Exportacion ONNX con paridad numerica respecto a PyTorch (diferencia maxima de 2e-6), apta para entornos sin GPU.
- Umbral configurable: el autor publica puntos de operacion (0,208 y 0,127) con sus tasas de recall y falsos positivos, y un `gate_config.json` con umbrales y metricas.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento previo en pipelines de detoxificacion: el modelo decide que comentarios de Telegram pasan al reescritor Housto4/uadetox-e2b y cuales se dejan intactos, evitando coste de generacion en la mayoria de comentarios. Con un umbral de 0,208 marca el 25,8% de los comentarios en el test bloqueado.
- Moderacion asistida en comunidades ucranianas: como primera senal en colas de revision humana, con el umbral bajo (0,127) cuando el coste de dejar pasar un comentario descortes es alto (recall 65,8% en el test bloqueado).
- Filtrado en tiempo real en chats y foros: la latencia de unos 11 ms por comentario en 4 hilos de CPU permite integrarlo en el flujo de publicacion sin infraestructura GPU.
- Despliegue en entornos con recursos limitados: la exportacion ONNX fp32 y el tamano de 118M parametros permiten servirlo en un contenedor pequeno o en el propio servidor de la comunidad.
- Analisis de toxicidad en corpus de noticias y politica en ucraniano: entrenado sobre ese dominio, sirve para medir la proporcion de comentarios que requieren reescritura por canal o por periodo.
- Investigacion sobre detoxificacion de bajo coste: como componente reutilizable en experimentos que comparen politicas de reescritura, dado que el umbral y las metricas estan documentados en `gate_config.json`.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Conjunto | n | Etiquetas | Metrica | Valor |
|---|---|---|---|---|
| Canales retenidos (canales completos no vistos en entrenamiento) | 55.503 | estilo de entrenamiento | PR-AUC | 0,896 |
| Canales retenidos | 55.503 | estilo de entrenamiento | Recall con 5% de falsos positivos | 86,5% |
| Test bloqueado de politica (39% necesita reescritura) | 2.000 | politica escrita aplicada por LLM | PR-AUC | 0,861 |
| Test bloqueado, umbral 0,208 | 2.000 | politica escrita | Recall | 59,9% |
| Test bloqueado, umbral 0,208 | 2.000 | politica escrita | Precision | 0,907 |
| Test bloqueado, umbral 0,208 | 2.000 | politica escrita | Tasa de falsos positivos | 3,9% |
| Test bloqueado, umbral 0,127 | 2.000 | politica escrita | Recall | 65,8% |
| Test bloqueado, umbral 0,127 | 2.000 | politica escrita | Precision | 0,87 |
| Test bloqueado, umbral 0,127 | 2.000 | politica escrita | Tasa de falsos positivos | 6,3% |

Cobertura por tipo de toxicidad en el test bloqueado con umbral 0,208: profanidad 90%, ataque a identidad 76%, insulto 74%, amenaza 52%, toxicidad implicita 26%. En casos dificiles con umbral 0,127 (6% de falsos positivos): comentarios con palabra malsonante 100%, ataques sin malsonante 57%, solo burla o sarcasmo 17%, comentarios leves 33%.

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 118M parametros en fp16 los pesos ocupan aproximadamente 235 MB, y en fp32 unos 470 MB, por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: no es necesario GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) sirve para lotes grandes. El autor reporta unos 11 ms por comentario en 4 hilos de CPU, lo que hace viable el despliegue solo con CPU.
- Cabe en GPU consumer: si, con margen amplio, incluso en GPUs de gama baja.
- Opciones de despliegue: transformers con AutoModelForSequenceClassification, onnxruntime con model.onnx, y text-embeddings-inference segun los tags del repositorio. No se documentan recetas para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: aproximadamente 11 ms por comentario en CPU con 4 hilos; el throughput agregado no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UADetox gate | 117,7M | 128 tokens | Clasificacion binaria de reescritura en ucraniano | MIT | Hugging Face (safetensors y ONNX) |
| intfloat/multilingual-e5-small | 118M | no disponible en la informacion proporcionada | Embeddings multilingues | MIT | Hugging Face |
| Housto4/uadetox-e2b | no disponible | no disponible | Reescritura de comentarios (etapa posterior del pipeline) | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Detecta casi siempre las palabrotas, pero mucho peor la burla, el sarcasmo y los insultos sin malsonante (17% y 57% de cobertura respectivamente con 6% de falsos positivos). Las etiquetas de entrenamiento marcaron muchos de esos comentarios como limpios.
- La descortesia leve se escapa a menudo: se detecta aproximadamente un tercio.
- Entrenado con comentarios de Telegram sobre noticias y politica; su comportamiento en otras plataformas y tematicas esta menos probado.
- Las etiquetas provienen de un LLM que aplica una politica escrita, no de anotadores humanos; el acuerdo con un pequeno conjunto de oro anotado por humanos es solo moderado (kappa aproximada de 0,4).
- Es un filtro de enrutamiento para un reescritor, no una decision de moderacion: no debe usarse por si solo para bloquear o sancionar usuarios.
- El truncado a 128 tokens puede perder contexto en comentarios largos.
- Solo cubre ucraniano; no hay soporte documentado para otros idiomas.
- Licencia MIT, que permite uso comercial, pero sin garantias del autor sobre el rendimiento fuera del dominio evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Housto4/uadetox-gate
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Reescritor asociado: https://huggingface.co/Housto4/uadetox-e2b
- Dataset UADetox: https://huggingface.co/datasets/Housto4/uadetox
- Pagina del proyecto: https://uadetox.pages.dev
- Perfil del autor: https://huggingface.co/Housto4/datasets
