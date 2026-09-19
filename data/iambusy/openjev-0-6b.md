# IamBusy/OpenJev-0.6B

## Resumen

OpenJev-0.6B es un adaptador LoRA de decisión tipada publicado por el usuario IamBusy sobre el modelo base Qwen/Qwen3-0.6B. No es un modelo generativo al uso: se distribuye como adaptador PEFT acompañado de una cabeza escalar independiente de 1.024 parámetros y de un fichero de calibración por primitiva. Su propósito es responder preguntas estructuradas de tipo "choice" sobre un estado textual, puntuando candidatos de forma independiente y normalizándolos dentro de cada pregunta, en lugar de decodificar autoregresivamente con `generate()`.

El checkpoint corresponde a la revisión de modelo 0.3.0 (versión de software OpenJev 0.3.2) y se apoya en una revisión fija y concreta del modelo base de Qwen. El conjunto de entrenamiento es deliberadamente pequeño y experimental: 725 juicios de entrenamiento procedentes de 486 grupos de estado, complementados con 176 juicios de desarrollo, 167 de calibración, 405 de test y 448 de regresión previa. Las fuentes incluyen BANKING77, TweetEval de sentimiento, BoolQ, ARC-Easy y escenarios originales de reglas de reembolso e incidencia.

La relevancia actual del modelo es metodológica más que de rendimiento bruto: propone un paradigma de decisión probabilística calibrada con prefijos compartidos, donde la evidencia ausente se representa como un candidato explícito en lugar de fabricar una probabilidad. Su alcance es de investigación local; el propio autor advierte de que no tiene un rol validado en decisiones autónomas con consecuencias y de que no se ha establecido una capacidad multilingüe amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3-0.6B (adaptador PEFT) más cabeza escalar independiente de decisión |
| Parametros totales | 1.148.904 entrenables (1.146.880 de la LoRA + 1.024 de la cabeza escalar); el modelo base Qwen3-0.6B se descarga aparte |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (el fichero `openjev_config.json` define límites de prompt y de ramas, pero el valor no se especifica en la información proporcionada) |
| Tipos de cuantizacion | No disponible; la medición de referencia se hizo en BF16 sobre MPS y en FP32 sobre CPU |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` para la LoRA, `head.safetensors` para la cabeza escalar), más `adapter_config.json` (PEFT), `openjev_config.json`, `calibration-v03.json` y `MANIFEST.json` |

## Arquitectura y entrenamiento

El checkpoint contiene una LoRA aplicada a las proyecciones de atención de Qwen3-0.6B, con 1.146.880 parámetros entrenables, y una cabeza escalar separada de 1.024 parámetros entrenada de forma independiente. La cabeza parte de la dirección de embedding preentrenada "Yes menos No". La predicción evita la proyección de vocabulario y no decodifica respuestas de forma autoregresiva: los candidatos se puntúan de forma independiente y se normalizan dentro de cada pregunta. Las cachés de prefijo viven dentro de una petición o de un grupo de estados de entrenamiento y nunca cruzan actualizaciones del optimizador, un detalle de diseño orientado a la reutilización eficiente de prefijos compartidos.

Los datos de entrenamiento son escenarios simulados en inglés y chino. Se usaron 725 juicios de entrenamiento (486 grupos de estado), 176 de desarrollo, 167 de calibración, 405 de test nuevos y 448 de regresión previa; el conjunto de referencia de 60 preguntas es un subconjunto fijo del test nuevo. Las fuentes incluyen BANKING77, TweetEval de sentimiento, BoolQ, ARC-Easy y escenarios originales de reglas de reembolso e incidencia, con las familias de escenarios de acceso y envío reservadas como conjunto de validación externa. Las reglas calculan las etiquetas de escenario, y la evidencia ausente se trata como un candidato explícito en lugar de como un objetivo de probabilidad inventado.

El entrenamiento constó de dos épocas con semilla 43 y 244 actualizaciones, con una duración aproximada de 636 segundos en un Apple M3 Pro con 36 GB de RAM. La selección del checkpoint se basó exclusivamente en la NLL de desarrollo, que pasó de 1,0094 a 0,41665. Para la generación de datos, DeepSeek renderizó 48 mundos seleccionados y reconstruyó sus hechos de forma independiente; solo 27 renderizaciones pasaron la verificación y los casos rechazados usaron plantillas. El propio autor señala que la misma familia de profesor verificó sus propias renderizaciones, por lo que no se trata de revisión humana independiente, y que sigue siendo posible contaminación de preentrenamiento público y aprendizaje específico de plantillas.

## Capacidades

- Decisiones tipadas: responde preguntas con estructura de tipo "choice", con instrucciones y criterios por candidato, devolviendo una respuesta normalizada por pregunta.
- Puntuación de candidatos: puntúa cada candidato de forma independiente mediante la cabeza escalar, sin usar la proyección de vocabulario.
- Calibración probabilística por primitiva: aplica temperaturas de calibración calculadas sobre el split de calibración; se puede solicitar salida sin calibrar pasando `temperatures={}`.
- Representación explícita de evidencia ausente: la falta de evidencia se modela como un candidato propio, evitando forzar una probabilidad arbitraria.
- Eficiencia por prefijos compartidos: reutiliza cachés de prefijo dentro de una misma petición o grupo de estados.
- Cobertura lingüística limitada a inglés y chino, en escenarios simulados.
- No soporta generación de texto libre, ni tool calling, ni function calling, ni razonamiento multi-paso agéntico. Tampoco es un modelo de chat y no utiliza `generate()` para sus predicciones.

## Casos de uso

- Clasificación de intenciones en banca: el modelo puede etiquetar consultas de clientes sobre las categorías de BANKING77 usando el modo de decisión tipada con criterios por clase, aprovechando que parte de su entrenamiento proviene de ese corpus.
- Análisis de sentimiento en redes sociales: sirve para clasificar textos cortos y ruidosos al estilo TweetEval, puntuando cada polaridad como candidato independiente y con probabilidad calibrada.
- Respuesta a preguntas booleanas sobre un pasaje: con el formato de estado más pregunta de elección, puede reproducir el comportamiento de BoolQ seleccionando entre opciones de sí/no.
- Clasificación de escenarios de reembolso e incidencia: dado un estado con la regla aplicable, decide entre reembolso, incidencia u otras categorías, incluyendo un candidato explícito de evidencia insuficiente.
- Enrutado de casos con abstención controlada: en un pipeline de atención al cliente, el candidato de evidencia ausente permite derivar a un humano cuando el modelo no encuentra base suficiente, en lugar de forzar una etiqueta.
- Evaluación de sistemas de decisión calibrada: como banco de pruebas para investigar calibración por primitiva, comparación de NLL y comportamiento con candidatos competidores.
- Enriquecimiento de conjuntos de datos con etiquetas probabilísticas: permite anotar grandes volúmenes de estados con distribuciones de probabilidad calibradas y revisar manualmente solo los casos de baja confianza.
- Investigación local sobre cómputo de prefijos compartidos: útil para estudiar reutilización de caché de prefijo en cargas de decisión con muchos candidatos por estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El único dato de rendimiento reportado es la NLL de desarrollo, usada como criterio de selección del checkpoint:

| Metrica | Valor |
|---|---|
| NLL de desarrollo (inicio) | 1,0094 |
| NLL de desarrollo (checkpoint seleccionado) | 0,41665 |
| Epocas de entrenamiento | 2 |
| Actualizaciones | 244 |
| Semilla | 43 |
| Tiempo de entrenamiento | ~636 s en Apple M3 Pro, 36 GB de RAM |

## Requisitos de hardware

- El modelo base descargable ocupa aproximadamente 1,2 GB; hay que prever varios GB de disco y de RAM adicionales para dependencias y ejecución.
- La medición de referencia se realizó en MPS sobre un Apple M3 Pro con BF16; en CPU se ejecuta en FP32.
- Esta versión del software no implementa aceleración CUDA, por lo que no se han reportado cifras de VRAM ni de rendimiento para GPU NVIDIA (A100, H100, RTX 4090, etc.): no disponible.
- Ejecución en GPU de consumo: no disponible, dado que la ruta CUDA no está implementada en esta versión.
- Despliegue: carga mediante la librería `openjev` (`OpenJevModel.from_pretrained`) o servido con el comando `openjev-model`. Un cargador PEFT genérico de generación de texto solo carga el adaptador y omite la cabeza de decisión, por lo que no es una vía válida.
- Uso sin conexión: se puede ejecutar con `local_files_only=True` tras la primera descarga, y fijar el snapshot con `revision="<commit del repositorio>"`.
- Latencia y throughput: no disponible; solo se reporta el tiempo de entrenamiento en M3 Pro.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de terceros en la información proporcionada, más allá del propio modelo base. La comparación se limita por tanto a la relación con Qwen3-0.6B:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenJev-0.6B (revision 0.3.0) | 1.146.880 de LoRA + 1.024 de cabeza escalar, sobre base separada | No disponible | Decisión tipada con calibración por primitiva | Apache 2.0 | HuggingFace + repositorio GitHub |
| Qwen/Qwen3-0.6B (revision c1899de289a04d12100db370d81485cdf75e47ca) | No disponible en la información proporcionada | No disponible | Modelo base de generación de texto | No disponible en la información proporcionada | HuggingFace |
| Otros modelos comparables de decisión tipada | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de chat ni un `AutoModel` estándar de Transformers: no usa `generate()` y requiere el cargador `OpenJevModel` junto con la cabeza escalar.
- Un cargador PEFT genérico carga el adaptador pero omite la cabeza de decisión y el comportamiento de puntuación por ramas de candidato, lo que produce resultados incorrectos.
- La etiqueta `text-classification` del Hub describe el propósito del modelo, pero no implica compatibilidad con el pipeline genérico de clasificación de Transformers ni con el widget alojado.
- Capacidad multilingüe no establecida: el entrenamiento y la evaluación cubren inglés y chino simulados, y el propio autor advierte que no se ha demostrado una competencia multilingüe amplia.
- Riesgo de contaminación de preentrenamiento público y de aprendizaje específico de plantillas.
- La verificación de las renderizaciones de datos la realizó la misma familia de modelos profesores, no revisión humana independiente.
- Las familias de escenarios de acceso y envío quedaron fuera del entrenamiento, lo que limita la generalización a esos dominios.
- El modelo no tiene un rol validado en decisiones autónomas con consecuencias; su uso previsto es la investigación local sobre decisiones tipadas, puntuación de candidatos y cómputo de prefijos compartidos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado del repo es de 0,0 GB, lo que sugiere un artefacto muy reciente y con adopción nula.
- No hay métricas de evaluación estándar publicadas, solo la NLL de desarrollo.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de validación en dominios reales hace desaconsejable su uso en producción sin evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IamBusy/OpenJev-0.6B
- Repositorio GitHub de OpenJev: https://github.com/IamBusy/OpenJev
- Release v0.3.0 del modelo entrenado: https://github.com/IamBusy/OpenJev/releases/tag/v0.3.0
- Reglas de nomenclatura y versionado (v0.3.2): https://github.com/IamBusy/OpenJev/blob/v0.3.2/docs/NAMING.md
- Documentación de PEFT sobre el formato de checkpoint con adaptador: https://huggingface.co/docs/peft/developer_guides/checkpoint
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
