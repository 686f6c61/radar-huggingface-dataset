# aac6fef/laya-mlx

## Resumen

laya-mlx es una conversión nativa a MLX en FP16 del checkpoint convaiinnovations/laya, publicada por el usuario aac6fef para su ejecución en Apple Silicon. No es un modelo generativo: se trata de un encoder de decisión bidireccional construido sobre ModernBERT-large, con 421.293.830 parámetros, que combina una cabeza de puntuación (scoring head) y una cabeza de acción (action head) para responder preguntas tipadas sobre un estado de entrada. Admite tres formatos de pregunta: `choice` (elección entre criterios), `score` (puntuación ordinal) y `noul` (respuesta booleana). Su ventana de contexto total es de 512 tokens, compartida entre el estado de entrada, las instrucciones y las opciones.

La relevancia de esta ficha es doble. Por un lado, demuestra un patrón de portado reproducible: el autor verifica igualdad exacta tensor a tensor con el checkpoint de origen (FP32) casteado a FP16, y comprueba que el argmax de las distribuciones de decisión coincide en 63/63 casos sobre 16 escenarios, con una diferencia máxima de probabilidad calibrada de 0,0054443. Por otro, ilustra un caso poco frecuente en el ecosistema: pesos pensados exclusivamente para MLX, sin dependencia de PyTorch ni de Transformers en tiempo de ejecución, mediante un paquete de arquitectura personalizada (`laya_mlx`).

El modelo está pensado para flujos de decisión estructurada (triaje, enrutado, clasificación con criterios explícitos) y no sustituye a un LLM conversacional. El repositorio ocupa 0,8 GB, declara licencia Apache-2.0, soporta únicamente inglés y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones en HuggingFace, por lo que se trata de un artefacto reciente y sin validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer bidireccional) con cabezas de decision: scoring head y action head |
| Parametros totales | 421.293.830 |
| Longitud de contexto | 512 tokens en total, compartidos entre estado de entrada, preguntas y opciones |
| Tipos de cuantizacion | Pesos en FP16 nativo; el runtime permite `dtype="float32"` para acercarse a la aritmetica FP32 de origen; no se aplica cuantizacion a menos bits |
| Idiomas soportados | en (ingles) unicamente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX, FP16) |
| Libreria de carga | mlx (`laya_mlx`) |
| Tarea declarada | text-classification |
| Modelo base | convaiinnovations/laya (commit c5d78730f3493e4fe16d61507ef4b78eef7318cf) |
| Tamano del repositorio | 0,8 GB |
| Tipos de pregunta | `choice`, `score` (ordinal), `noul` (booleano) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT-large, un transformer encoder bidireccional con atención completa, sobre el que Laya añade dos cabezas específicas de decisión: una cabeza de puntuación que produce distribuciones sobre los criterios u opciones, y una cabeza de acción que determina la respuesta final. El modelo no genera texto token a token; procesa un estado y una batería de preguntas tipadas, y devuelve una respuesta por pregunta según el esquema declarado (`choice`, `score` o `noul`).

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO: el repositorio es un port de inferencia y no incluye implementación de entrenamiento. La conversión a MLX renombra los parámetros para adaptarlos al runtime y preserva los pesos en FP16, sin reentrenar ni cuantizar a menos bits. El autor verifica que cada tensor exportado es exactamente igual al tensor de origen casteado a FP16, lo que convierte este checkpoint en una referencia de fidelidad de portado más que en una variante de modelo nueva.

## Capacidades

- Clasificación por elección (`choice`): selecciona una opción entre una lista de criterios definidos en la instrucción, devolviendo la distribución de probabilidad asociada.
- Puntuación ordinal (`score`): asigna un valor ordinal a un estado según las instrucciones proporcionadas.
- Pregunta booleana (`noul`): responde verdadero/falso a una condición expresada en lenguaje natural, como en el ejemplo del README sobre solicitud de reembolso.
- Decisión múltiple en una sola llamada: acepta un diccionario de preguntas y devuelve una respuesta por cada una, reutilizando el mismo estado de entrada.
- Salidas deterministas: 100 llamadas repetidas producen resultados finitos y deterministas según la validación del autor.
- Ejecución íntegra en MLX: no requiere PyTorch ni Transformers en tiempo de ejecución.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente.
- No soporta visión, audio ni modalidades adicionales.
- Capacidad multilingüe: no disponible en este checkpoint; el propio autor indica que el checkpoint multilingüe de Laya es el adecuado para texto que no esté en inglés.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia, el modelo decide a qué departamento corresponde mediante una pregunta `choice` con criterios como `billing`, `technical` o `sales`. Es el caso que documenta el propio README y encaja porque la decisión es cerrada y el criterio se declara de forma explícita.
- Detección de intención de reembolso en atención al cliente: una pregunta `noul` permite determinar si el usuario solicita devolución de dinero antes de derivar el caso a un flujo automatizado, sin necesidad de generar respuesta alguna.
- Triaje de correo entrante: clasificación por `choice` del tipo de mensaje (consulta comercial, incidencia técnica, facturación) para asignar colas de trabajo en un helpdesk.
- Moderación y política de contenido: preguntas booleanas encadenadas (`noul`) para comprobar el cumplimiento de reglas concretas sobre textos cortos, aprovechando la naturaleza determinista de la salida.
- Puntuación de calidad o severidad: uso de `score` para asignar un nivel ordinal a conversaciones, reseñas o incidencias, por ejemplo prioridad de una incidencia en una escala definida por el equipo.
- Etiquetado automático de datasets: generación de anotaciones categóricas y ordinales sobre corpus en inglés en pipelines de preparación de datos, con la ventaja de que el modelo cabe holgadamente en memoria de un portátil Apple Silicon.
- Guardarraíles ligeros en pipelines de agentes: comprobación previa de condiciones booleanas (por ejemplo, si la petición contiene una orden de compra o una cancelación) antes de invocar herramientas externas, sin coste de un LLM generativo.
- Enrutado de formularios estructurados: clasificación de campos libres rellenados por usuarios hacia categorías predefinidas, con la instrucción y las opciones compartiendo el presupuesto de 512 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de fidelidad del portado, no de calidad de tarea:

| Metrica | Valor |
|---|---|
| Coincidencia de argmax frente a PyTorch MPS FP32 | 63/63 distribuciones de decision en 16 casos |
| Diferencia maxima de probabilidad calibrada | 0,0054443 |
| Llamadas repetidas con salida finita y determinista | 100 |
| Crecimiento de memoria activa de MLX tras limpiar cache | 0 bytes |
| Igualdad tensor a tensor con el origen casteado a FP16 | Verificada en todos los tensores exportados |

El propio autor advierte que estas comprobaciones establecen fidelidad del port, no corrección de las respuestas del modelo. No hay cifras de MMLU, HumanEval, GSM8K ni de tareas de clasificación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,85 GB solo de pesos (421,3 M de parámetros por 2 bytes), más overhead del runtime; en la práctica, en torno a 1-2 GB.
- En FP32 (`dtype="float32"`) el consumo de pesos se duplica hasta unos 1,7 GB, también holgado en hardware Apple Silicon moderno.
- GPU recomendadas: cualquier chip Apple Silicon. El autor ha validado el modelo en un Apple M3 Max con GPU de 40 núcleos y 128 GB de memoria unificada, con macOS 27.2, Python 3.12.13 y MLX 0.32.2.
- Compatibilidad con GPU de consumo: sí, cabe sin dificultad en cualquier Mac con Apple Silicon, incluidos modelos de gama base; no está pensado para GPU NVIDIA o AMD, ya que el runtime es específico de MLX.
- Requisitos de software: macOS 26 o superior y Python 3.11 o superior, con el paquete `laya_mlx` instalado desde el repositorio Git del autor.
- Opciones de despliegue: exclusivamente el runtime `laya_mlx` sobre MLX. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo y usa una arquitectura personalizada.
- Latencia y throughput: no disponibles más allá de las referencias cualitativas del informe de rendimiento enlazado por el autor, que compara MLX con el runtime original en la misma máquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aac6fef/laya-mlx | 421.293.830 | 512 tokens | Decision encoder (choice, score, noul) | Apache-2.0 | MLX, Apple Silicon |
| convaiinnovations/laya | 421.293.830 (mismo checkpoint de origen) | 512 tokens | Decision encoder | Apache-2.0 | PyTorch / Transformers |
| Checkpoint multilingue de Laya | no disponible | no disponible | Decision encoder | no disponible | Indicado por el autor para texto no ingles |
| ModernBERT-large (base subyacente) | no disponible | no disponible | Encoder bidireccional de proposito general | no disponible | HuggingFace |

La diferencia principal frente al checkpoint original no es de rendimiento sino de runtime: laya-mlx elimina la dependencia de PyTorch y Transformers y ejecuta toda la computación en MLX, a cambio de quedar restringido a Apple Silicon y a un paquete de arquitectura personalizado. No se dispone de datos comparativos de calidad entre alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés. Para texto en otros idiomas, el autor remite al checkpoint multilingüe de Laya, no incluido aquí.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso, y no debe usarse como sustituto de un LLM conversacional.
- El presupuesto de 512 tokens es compartido entre el estado de entrada, las instrucciones y las opciones, por lo que entradas largas o muchas preguntas simultáneas reducen el margen disponible.
- La validación publicada mide fidelidad numérica del port, no corrección de las respuestas. El propio autor lo explicita.
- Los sesgos, la calibración y las limitaciones de idioma y tarea son los del checkpoint original convaiinnovations/laya, no los de esta conversión.
- Riesgo de alucinación: al tratarse de un clasificador con salida restringida al espacio de opciones o a una escala definida, el riesgo se traslada a una asignación incorrecta pero bien formada, con una confianza calibrada que puede inducir a error en producción.
- Licencia Apache-2.0, que permite uso comercial; deben conservarse los ficheros `LICENSE`, `NOTICE`, `mlx_config.json` y `manifest.json` con la atribución a Convai Innovations y colaboradores.
- Requiere macOS 26 o superior y Apple Silicon; no hay ruta de despliegue en servidores Linux con GPU NVIDIA.
- Artefacto sin tracción comunitaria en el momento de la consulta (0 descargas, 0 valoraciones), por lo que no existe validación independiente de su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aac6fef/laya-mlx
- Checkpoint de origen: https://huggingface.co/convaiinnovations/laya
- Codigo upstream de Laya: https://github.com/NandhaKishorM/laya
- Repositorio del runtime MLX: https://github.com/mizorewww/laya-mlx
- Informe de rendimiento y muestras de tiempos: https://github.com/mizorewww/laya-mlx/blob/main/BENCHMARKS.md
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo: corresponden a guias sobre LinkedIn y redes de antiguos alumnos.
