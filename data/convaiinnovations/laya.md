# convaiinnovations/laya

## Resumen

Laya es un modelo de clasificación de texto no autorregresivo desarrollado por Convai Innovations (publicado bajo la organización `convaiinnovations` en Hugging Face). A diferencia de los modelos generativos, Laya no produce texto: recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas acompañadas de probabilidades calibradas matemáticamente en un único pase forward de aproximadamente 33 ms. El modelo se entrenó con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), de modo que la única forma de maximizar la recompensa es reportar probabilidades honestas.

La arquitectura se describe como un "motor de decisión System 1" que se apoya en un lector LLM congelado (desde 0,8B hasta 27B parámetros) sobre el que se monta un pequeño motor de decisión. El checkpoint clásico publicado en Hugging Face contiene 421.293.830 parámetros en formato safetensors y ocupa 2,4 GB en el repositorio. La versión 0.5 incorpora entrada multimodal (imagen, audio y vídeo), una ventana de contexto de 73.728 tokens y mecanismos de abstención (`abstain`), conjuntos conformales (`prediction_set`) y detección de fuera de distribución (`unbound`).

Su relevancia actual radica en que ofrece una alternativa determinista y de coste constante a los pipelines de moderación, enrutamiento y guardarraíles basados en LLM generativos, eliminando el parsing de salidas y reduciendo el riesgo de alucinación, ya que no se genera texto en ningún momento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de decisión no autorregresivo "System 1" sobre lector LLM congelado (no transformer generativo) |
| Parametros totales | 421.293.830 (checkpoint clásico en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 73.728 tokens (versión 0.5) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 100 idiomas (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Laya se presenta explícitamente como un modelo no autorregresivo: no decodifica tokens sino que coloca la entrada como una "partícula" en un espacio de decisión de baja dimensión donde cada respuesta candidata es un "valle". La posición y profundidad con la que la partícula se asienta determinan la respuesta y su probabilidad. Este enfoque es determinista y de coste constante, y se apoya en un lector LLM congelado (de 0,8B a 27B parámetros) que procesa el estado una sola vez.

El entrenamiento utiliza RLCD (reinforcement learning contra reglas de puntuación estrictamente propias), una innovación que penaliza las probabilidades mal calibradas y hace que la estrategia óptima sea reportar la confianza real. La versión 0.5 añade aprendizaje continuo mediante `laya.Learner`, que permite adaptar el motor a datos confirmados por el equipo sin fine-tuning: 300 respuestas se aprenden en 34 s sobre 8 hilos de CPU (0,72 s por respuesta, 6,4 GB de RAM), frente a los 89 s en GPU y 9 GB que requiere reentrenar el encoder clásico de 421M pesos. El motor de decisión subyacente proviene del proyecto `vegaml`.

## Capacidades

- Clasificación y enrutamiento de texto con probabilidades calibradas en un solo pase forward.
- Entrada multimodal en la versión 0.5: imagen, audio y vídeo, además de texto y JSON.
- Respuestas tipadas con probabilidad asociada, conjunto conformal (`prediction_set`) y abstención calibrada (`abstain`).
- Detección de entradas fuera de distribución mediante el flag `unbound`.
- Enrutamiento automático (`auto`) o a revisión (`review`) mediante el campo `route`.
- Aprendizaje continuo en local desde respuestas confirmadas por el equipo, sin fine-tuning.
- Soporte multilingüe de más de 100 idiomas.
- Compatible con cualquier LLM como lector (de 0,8B a 27B parámetros).
- No genera texto, por lo que no requiere parsing de salida ni presenta alucinación de contenido.
- Compatible con endpoints y despliegue en Azure (según los tags del repositorio).

## Casos de uso

- Moderación y guardarraíles: el modelo puede clasificar mensajes como tóxicos o seguros devolviendo una probabilidad calibrada y una decisión de abstención cuando la confianza es insuficiente, lo que permite fijar umbrales de riesgo (por ejemplo, 10 % por defecto) y enrutar a revisión humana solo los casos ambiguos.
- Enrutamiento de tickets de soporte: dado un ticket, Laya responde preguntas tipadas sobre categoría, urgencia o equipo destinatario en un único pase de ~33 ms, con un conjunto conformal que indica si la asignación es inequívoca o ambigua.
- Clasificación de correo entrante: con 73.728 tokens de contexto puede procesar hilos completos y contratos extensos, devolviendo etiquetas tipadas con probabilidad y abstención cuando el contenido queda fuera de la distribución conocida.
- Guardarraíl contra inyección de prompts: aunque la model card reconoce que un modelo alojado de gran tamaño lidera en este caso, Laya puede actuar como filtro previo con umbral de riesgo configurable y `route` para derivar a revisión.
- Análisis de documentos largos: la ventana de 73.728 tokens permite clasificar contratos o logs completos sin trocear, manteniendo coherencia de contexto en una sola lectura.
- Aprendizaje continuo en producción: mediante `laya.Learner`, un equipo puede confirmar respuestas y adaptar el motor en segundos sobre CPU, lo que resulta adecuado para dominios con taxonomías cambiantes (por ejemplo, nuevas categorías de incidencias).
- Extracción de decisiones estructuradas desde JSON: al aceptar JSON como estado de entrada, puede integrarse en pipelines que necesitan clasificar payloads estructurados con salida tipada y probabilidades auditables.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden al motor de decisión y al encoder clásico:

| Benchmark | Laya | Comparativa |
|---|---|---|
| Aprendizaje continuo, día uno (14 plantillas, 31 preguntas) | 84,7 % | Jev 1.14: 89,5 % |
| Tras 40 respuestas confirmadas | 91,6 % | Jev 1.14: 91,5 % |
| Tras 120 respuestas confirmadas | 96,0 % | Jev 1.14: 92,6 % |
| banking77, 924 retenidos tras 4.928 filas | 87,5 %, ECE 0,028, 92,5 % enrutado auto a 91,5 % de precisión | Jev 1.14: 79,4 % de fábrica (ECE 0,078), 85,7 % con ejemplos |
| typed-decisions, 2.000 decisiones tras 1.200 filas | 73,7 %, ECE 0,031 | Jev 1.14: 74,7 %, ECE 0,047 |
| Across readers (50.676 registros retenidos) | 0,8B: 76,5 %; 4B: 79,1 %; 27B: 81,1 %; ECE 0,010–0,021 | No disponible |
| Puerta de prompt-injection (ToxicChat, 1,8 % ataques) | 73,0 % de detección con 0,7 % de rechazos (cabeza ajustada) | Jev sin entrenar: 79,1 % con 0,3 % de rechazos |

Coste del aprendizaje: 300 respuestas en 34 s sobre 8 hilos de CPU (0,72 s por respuesta, 6,4 GB de RAM); en GPU, 40 ms y 2 GB. El fine-tuning del encoder clásico sobre las mismas 300 filas requiere 89 s en GPU y 9 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El checkpoint ocupa 2,4 GB en safetensors, por lo que en fp16 cabría en torno a 850 MB de pesos, aunque no se confirma.
- GPU recomendadas: no disponible. La model card menciona ejecución en GPU con 2 GB de RAM para el aprendizaje, y en CPU con 8 hilos.
- Cabe en GPU de consumo: no confirmado explícitamente, pero el tamaño del checkpoint (421M parámetros) sugiere que sí en GPUs de consumo; no obstante, no se dispone de datos oficiales.
- Opciones de despliegue: `transformers`, `pip install -U laya`, endpoints compatibles y despliegue en Azure (según tags). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~33 ms por pase forward en el motor de decisión; 40 ms por respuesta en aprendizaje con GPU; 0,72 s por respuesta en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya | 421M (checkpoint clásico) | 73.728 tokens | Decisión no autorregresiva con probabilidades calibradas | Apache 2.0 | Hugging Face, pip |
| Jev 1.14 | No disponible | No disponible | API alojada con criterios ajustables | No disponible | API alojada (364 ms por petición desde India) |
| Encoder clásico (fine-tuning) | 421M | No disponible | Clasificación supervisada tradicional | No disponible | No disponible |

La comparativa principal que ofrece la model card es frente a Jev 1.14, un servicio alojado que no puede enseñarse, solo guiarse mediante prompting. Laya parte por debajo en el día uno pero supera a Jev tras 120 respuestas confirmadas y ofrece calibración (ECE) más baja en los escenarios de streaming. No se dispone de comparativas con otros modelos de clasificación de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- En modo zero-shot sobre suites públicas genéricas, un modelo alojado de gran tamaño supera a Laya, según reconoce la model card.
- Como puerta de prompt-injection en tráfico real (ToxicChat), Jev sin entrenar detecta más ataques (79,1 % con 0,3 % de rechazos) que Laya con cabeza ajustada (73,0 % con 0,7 %).
- El flag `unbound` se activó en el 71 % de las filas normales de banking77, por lo que no debe usarse como criterio de enrutamiento por sí solo.
- La abstención está calibrada para un riesgo por defecto del 10 %; cambiarlo requiere recalibración con datos propios.
- No se especifican sesgos conocidos ni composición del dataset de entrenamiento en la información disponible.
- El modelo no genera texto, por lo que no es adecuado para tareas generativas; su uso está limitado a clasificación, enrutamiento y scoring.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del proyecto `vegaml` y de los lectores LLM subyacentes, que pueden tener licencias distintas.
- Los benchmarks presentados corresponden al encoder clásico y al motor de decisión; no se dispone de resultados independientes de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/convaiinnovations/laya
- Paper: https://doi.org/10.20944/preprints202611.0781.v1
- Repositorio vegaml: https://github.com/NandhaKishorM/vegaml
- Studio de Embedding Space: https://studio.embedding.in
- Imagen explicativa del funcionamiento: https://raw.githubusercontent.com/NandhaKishorM/vegaml/main/assets/vega-valleys.svg
