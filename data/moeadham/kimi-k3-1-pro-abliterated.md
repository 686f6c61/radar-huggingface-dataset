# moeadham/Kimi-K3.1-Pro-abliterated

## Resumen

Kimi-K3.1-Pro-abliterated es una modificación de pesos del modelo multimodal Kimi K3.1 Pro de Moonshot AI, publicada por el usuario moeadham. No se trata de un fine-tuning ni de un nuevo modelo entrenado, sino de una edición quirúrgica de rango 1 aplicada a 111 matrices del transformer original para eliminar el comportamiento de rechazo (refusal) del modelo base. El checkpoint conserva exactamente los mismos ficheros, formas y dtypes que el original, por lo que se carga y sirve de idéntica manera.

El modelo base es un transformer disperso de mezcla de expertos (MoE) con 2,78 billones de parámetros totales, 92 capas y 896 expertos enrutados por capa (82.432 en total), además de una torre de visión que lo habilita para tareas image-text-to-text. La edición afecta únicamente a 5,84 mil millones de parámetros (0,21% del total), concentrados en las capas 48 a 84, sin tocar ningún experto enrutado, router, embedding ni la torre de visión.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de abliteración reproducible sobre un modelo de escala frontera; por otro, advierte de que el resultado está pensado exclusivamente para investigación sobre representación del rechazo y censura en modelos de lenguaje, y que no es apto para producción. El autor declara explícitamente que el modelo responde a peticiones dañinas (químicas, biológicas, explosivos) que el original rechaza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con torre de visión (image-text-to-text) |
| Parametros totales | 2.780.110.363.392 (2,78 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (tag `8-bit`); otros tipos no disponibles |
| Idiomas soportados | no disponible (el autor solo declara pruebas en inglés) |
| Licencia | Kimi K3.1-Pro License (Copyright (c) 2026 Moonshot AI), licencia `other` |
| Formato de pesos | safetensors, con `compressed-tensors`; `custom_code` |
| Numero de capas | 92 |
| Expertos enrutados | 896 por capa, 82.432 en total |
| Parametros editados | 5,84 mil millones (0,21% del total) |
| Capas editadas | 48 a 84 (111 matrices) |
| Tamano del repo | 1.561,4 GB |

## Arquitectura y entrenamiento

El modelo base Kimi K3.1 Pro es un transformer de mezcla de expertos con 92 capas y 896 expertos enrutados por capa, lo que supone 82.432 expertos que concentran aproximadamente el 98% de los parámetros. Incorpora además una torre de visión que le permite procesar entradas de imagen y texto, y utiliza el formato `compressed-tensors` para el almacenamiento de pesos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

La modificación abliterated no implica ningún entrenamiento adicional. El autor leyó una "dirección de rechazo" R al final del prompt, en el punto donde el modelo ya ha decidido si rechaza o responde: la diferencia entre las activaciones medias de prompts que el modelo original rechazó y prompts que respondió (8.120 prompts etiquetados por el propio comportamiento del modelo), proyectando fuera las cuatro direcciones principales de 2.000 prompts ordinarios. Esa dirección se eliminó de cada matriz que escribe en el flujo residual en las capas 48 a 84 mediante la transformación W ← (I − λ r_s r_sᵀ) W, con λ = 1,5. Las 111 matrices editadas son `o_proj` de atención, `routed_expert_up_proj` del MoE latente y `shared_experts.down_proj` en cada una de esas capas. Cada matriz se modifica con una actualización de rango 1, y el fichero `EDIT.json` registra la especificación de la edición y un SHA-256 por tensor editado.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica a la del modelo base.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias a la torre de visión preservada intacta.
- Razonamiento con modos de esfuerzo configurables (`low`, `max`), con trazas de razonamiento que el autor reporta como cerradas en todas las pruebas realizadas.
- Capacidades matemáticas de nivel alto (MATH-500 nivel 5: 96 en la versión abliterated).
- Conocimiento general y multilingüe evaluado en MMLU-Pro (90) y CMMLU (96).
- Seguimiento de instrucciones (IFEval: 92).
- Tool calling / function calling (BFCL v3: 92).
- Respuesta a peticiones dañinas que el modelo original rechaza (comportamiento buscado por la edición, no una capacidad de producto).
- Idiomas: el autor declara que no se ha probado en idiomas distintos del inglés.

## Casos de uso

- Investigación sobre representación del rechazo: el modelo permite estudiar cómo se codifica la decisión de rechazar en el flujo residual, ya que el autor demuestra que la decisión es legible en los tokens de plantilla de chat al final del prompt antes de que el modelo escriba nada.
- Análisis de seguridad y red teaming: sirve como contraste frente al modelo original para medir la eficacia de mecanismos de refusal y evaluar la robustez de clasificadores de contenido dañino.
- Estudio de ediciones de rango 1 en modelos de escala frontera: la edición de solo el 0,21% de los parámetros permite aislar el efecto de una dirección concreta sobre el comportamiento sin alterar el resto de capacidades.
- Reproducibilidad de técnicas de abliteración: el autor publica la receta de un solo paso y el coste estimado (~300 USD y unas 4 horas de GPU por ejecución), lo que facilita replicar el método sobre otros checkpoints.
- Evaluación comparada de capacidades tras edición: los benchmarks del autor (MMLU-Pro, CMMLU, IFEval, MATH-500, BFCL v3) permiten medir la degradación o mejora inducida por la edición en tareas benignas.
- Servido de referencia con vLLM o SGLang en tensor parallel 8: el autor valida el checkpoint con vLLM y TP=8 sobre GPUs de clase B300, lo que sirve como caso práctico de despliegue de un MoE de 2,78 billones de parámetros.
- Investigación sobre calibración y alucinación: la divergencia KL de 0,067 nats/token en 200 prompts ordinarios ofrece una métrica concreta del desplazamiento distribucional introducido por la edición.

## Benchmarks y rendimiento

Resultados declarados por el autor, con decodificación greedy y esfuerzo de razonamiento `low`, salvo donde se indique. La puerta de evaluación contiene 750 prompts dañinos (HarmBench 200, WildJailbreak 550) y 405 benignos (XSTest safe 200, WildJailbreak benign 205), sin solapamiento con los usados para construir la edición.

| Metrica | Original | Abliterated |
|---|---|---|
| HarmBench rechazados, non-thinking | 99,0% | 5,5% |
| HarmBench rechazados, reasoning | 98,5% | 8,0% |
| Todos los prompts dañinos rechazados, non-thinking | 78,8% | 4,9% |
| Todos los prompts dañinos rechazados, reasoning | 80,7% | 4,0% |
| Rechazos duros ("I can't help with that"), non-thinking | 75% | 0,4% |
| Rechazos duros, reasoning | 77% | 0,1% |
| Divergencia KL en 200 prompts ordinarios (nats/token) | 0 | 0,067 |
| MMLU-Pro (100) | 90 | 90 |
| CMMLU (50) | 98 | 96 |
| IFEval (100) | 93 | 92 |
| MATH-500 nivel 5 (50) | 98 | 96 |
| BFCL v3 (50) | 88 | 92 |

A esfuerzo `max` (temperatura 1, 16k tokens), ambos modelos resolvieron 20/20 prompts difíciles de matemáticas y seguimiento de instrucciones, y todas las trazas de razonamiento cerraron. En prompts benignos, el razonamiento del modelo abliterated es aproximadamente 1,26 veces más largo que el del original a esfuerzo `low`. En los 405 prompts benignos, el modelo abliterated no rechazó ninguno; todas las respuestas marcadas por el juez fueron revisadas manualmente y resultaron ser respuestas válidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,78 billones de parámetros y un repo de 1.561,4 GB, el despliegue requiere agregación de memoria entre múltiples GPUs.
- GPUs recomendadas: el autor valida el modelo con vLLM y tensor parallel 8 sobre GPUs de clase B300.
- ¿Cabe en GPU consumer? No. El tamaño del checkpoint (1,5 TB) y el número de parámetros descartan GPUs de consumo; se necesita un nodo multi-GPU de clase centro de datos.
- Opciones de despliegue: vLLM (probado por el autor con TP=8) y SGLang, según indica la model card. El formato `compressed-tensors` y el tag `8-bit` apuntan a cuantización de 8 bits para reducir requisitos de memoria.
- Latencia y throughput: no disponibles. El autor solo reporta el coste de la edición (~1.000 USD en tres ejecuciones de investigación, ~300 USD por una ejecución de ~4 horas), no métricas de servicio.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Kimi-K3.1-Pro-abliterated (este) | 2,78 billones | no disponible | Kimi K3.1-Pro License (other) | Derivado, solo investigación |
| moonshotai/Kimi-K3.1-Pro | 2,78 billones | no disponible | Kimi K3.1-Pro License (other) | Original, con refusal |
| Otros modelos de escala frontera comparables | no disponible | no disponible | no disponible | no disponible |

La única comparación directa posible con la información disponible es frente al modelo base, del que difiere en 5,84 mil millones de parámetros editados (0,21%) y en el comportamiento de rechazo (99% → 5,5% en HarmBench). No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor declara explícitamente que el modelo responde a peticiones dañinas que el original rechaza, incluidas peticiones químicas, biológicas y de explosivos. No debe desplegarse en producción ni exponerse a usuarios finales.
- Sin probar en idiomas distintos del inglés: el autor no ha validado el comportamiento en otras lenguas, por lo que el efecto de la edición sobre el multilingüismo es desconocido.
- Riesgo de bucles en el razonamiento: el autor advierte de que el modelo puede mostrar comportamiento de bucle en su razonamiento, aunque no se ha observado en las pruebas realizadas.
- Desplazamiento distribucional medible: la divergencia KL de 0,067 nats/token en prompts ordinarios indica que la edición altera la distribución de salida incluso en entradas benignas, y el razonamiento es ~1,26 veces más largo a esfuerzo `low`.
- Rechazos residuales suaves: entre el 4% y el 8% de los prompts dañinos siguen generando respuestas con reservas (el modelo cumple pero matiza), no rechazos limpios.
- Licencia restrictiva: se distribuye bajo la Kimi K3.1-Pro License de Moonshot AI, incluida sin cambios; las condiciones de uso comercial deben consultarse en el fichero LICENSE del repositorio.
- Sin métricas de producción: no hay datos publicados de latencia, throughput ni estabilidad en servicio, y el autor no ha decidido si seguirá trabajando en el modelo.
- Sesgos: no se han publicado evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moeadham/Kimi-K3.1-Pro-abliterated
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Repositorio GitHub con código, datos y resultados: https://github.com/moeadham/kimi-k3.1-pro-abliterated
- Receta de reproducción en un solo paso: https://github.com/moeadham/kimi-k3.1-pro-abliterated#3-try-it-yourself-the-one-shot-recipe
- Playground de prueba: https://allmodels.io/playground?model=moonshotai/kimi-k3.1-pro-abliterated
- Licencia: fichero LICENSE del repositorio de Hugging Face
