# mo19788/mini-typesafe-qwen3-4b

## Resumen

Mini TypeSafe — Qwen3-4B es un ajuste fino del modelo Qwen/Qwen3-4B de Alibaba, publicado por el usuario mo19788 en Hugging Face. No es un modelo generativo conversacional al uso: se presenta como un "motor de decisión tipado" (*typed decision engine*) que, dado un estado (`state`), una pregunta (`question`) y un conjunto de entre 2 y 26 opciones definidas en tiempo de ejecución, devuelve exactamente una de esas opciones acompañada de una confianza calibrada. La respuesta se obtiene leyendo los logits del siguiente token sobre los marcadores de opción (`A`, `B`, `C`, …) en un único paso hacia delante, sin generar texto libre.

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parámetros totales y un repositorio de 8,1 GB en formato safetensors. El ajuste se realizó mediante un LoRA de rango 8 y α 16 aplicado únicamente a las proyecciones `q_proj` y `v_proj` de la atención, posteriormente fusionado en los pesos base. Solo 72 matrices de pesos difieren del modelo original; los MLP y los embeddings permanecen intactos, de modo que el entrenamiento modula el comportamiento (cómo pondera las opciones) y no el conocimiento almacenado.

Su relevancia práctica reside en la eliminación del parseo de salida: al restringir la distribución de probabilidad al conjunto de claves proporcionado por el llamante, el resultado no puede contener texto libre ni alucinaciones fuera del conjunto de opciones. Esto lo hace adecuado para enrutamiento, clasificación y control de flujo en sistemas agénticos donde se requiere una salida estructurada y verificable, con una latencia declarada de aproximadamente 26 ms por decisión en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste LoRA fusionado en atención `q_proj`/`v_proj` |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B; no especificada en la información) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen3-4B) |
| Formato de pesos | safetensors (transformers) |
| Modelo base | Qwen/Qwen3-4B (revision `1cfa9a7208912126459214e8b04321603b3df60c`) |
| Tamano del repositorio | 8,1 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-16 |
| Ultima actualizacion | 2026-11-17 |

## Arquitectura y entrenamiento

La arquitectura subyacente es el transformer denso de Qwen3-4B. Sobre él se entrenó un LoRA de rango 8 y α 16 restringido a las proyecciones `q_proj` y `v_proj` de las capas de atención, que después se fusionó en los pesos base. Como consecuencia, solo 72 matrices de pesos difieren del checkpoint original y el resto es idéntico bit a bit. El modelo resultante se puede cargar con `transformers` estándar, sin adaptadores ni dependencias adicionales.

El objetivo de entrenamiento se basa en pares contrafactuales contrastivos: se presentan las mismas opciones con el estado invertido, de forma que la respuesta correcta también se invierte. Así el modelo aprende a leer el estado en lugar de fijarse en la posición de un marcador o en una palabra concreta. La inferencia no usa generación: se ejecuta un único paso hacia delante y se aplica un softmax enmascarado sobre los logits de los tokens correspondientes a los marcadores `A`–`Z`, produciendo una distribución de probabilidad restringida a las claves del usuario. El repositorio incluye `calibration.json` con una temperatura ajustada de 1,41 y un prior, que se aplican como `softmax((logits − prior) / temperature)` para convertir las puntuaciones condicionales en confianzas umbralizables.

## Capacidades

- Decisión tipada: devuelve exactamente una de las 2 a 26 opciones suministradas en tiempo de ejecución, sin texto libre.
- Clasificación y enrutamiento: asignación de categorías con distribución de probabilidad completa sobre las claves del llamante.
- Confianza calibrada: probabilidades ajustadas por temperatura y prior, aptas para umbrales operativos (por ejemplo, actuar con confianza ≥ 0,9 y escalar en caso contrario).
- Razonamiento contrastivo: resuelve pares con doble negación, negación de cuantificadores, implicaturas, contrafactuales, comparaciones transitivas y dirección causal, según la evaluación del autor.
- Integración en flujos agénticos: adecuado como nodo de control de flujo (selección de herramienta, siguiente acción, rama de decisión).
- Compatibilidad con text-generation-inference y endpoints compatibles, según las etiquetas del repositorio.
- Inferencia en un solo paso hacia delante, sin decodificación autorregresiva.
- No es un modelo conversacional ni de generación de texto: su uso previsto es la ruta de puntuación descrita.

## Casos de uso

- Triaje de tickets de soporte: dado el estado (descripción del incidente) y una pregunta de prioridad, el modelo devuelve una de las opciones `critical`, `high`, `medium`, `low` o `wontfix` con confianza calibrada; los casos por debajo del umbral se escalan a un humano. Es el ejemplo incluido en la model card.
- Enrutamiento de consultas en atención al cliente: clasificar cada mensaje entrante en un conjunto cerrado de departamentos o intenciones, con la garantía de que la salida siempre pertenece al conjunto definido y sin necesidad de parsear texto.
- Selección de herramienta en un agente: como nodo de decisión que elige entre las herramientas disponibles (por ejemplo, `buscar`, `calcular`, `escalar`) en un único paso hacia delante, con latencia de unos 26 ms en GPU.
- Control de flujo en pipelines agénticos: decidir la siguiente acción de un bucle (continuar, reintentar, abortar, pedir aclaración) a partir del estado acumulado, con umbralización sobre la confianza calibrada.
- Moderación y clasificación de contenido: asignar una etiqueta de política a partir de un conjunto predefinido de categorías, aprovechando que la salida no puede salirse del conjunto de opciones.
- Validación de decisiones en producción: sustituir heurísticas basadas en expresiones regulares o modelos generativos con parseo frágil por una puntuación determinista sobre marcadores, con distribución de probabilidad auditable.
- Experimentación en demostraciones interactivas: el Space asociado permite probar estados, preguntas y opciones propios, incluidos ejemplos de control de flujo agéntico.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 500 elementos contrastivos reservados, para este checkpoint exacto:

| Metrica | Valor |
|---|---|
| Precisión (orden canónico) | 81,6% |
| Precisión (promediada sobre órdenes de opciones) | 83,7% |
| Tasa de inversión por orden (*order-flip rate*) | 7,5% |
| Error de calibración esperado (10 bins) | 0,143 |
| Latencia mediana por decisión | ~26 ms (GPU) |

En una sonda de razonamiento contrastivo difícil (10 pares mínimos), el modelo alcanza aproximadamente un 85% en orden canónico, resolviendo pares de doble negación, negación de cuantificadores, implicatura, contrafactual, comparación transitiva y dirección causal. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): en torno a 8 GB solo para pesos, más overhead de activaciones y contexto; se recomienda al menos 12–16 GB para operar con comodidad.
- Cuantización: el repositorio no publica versiones cuantizadas; no hay datos de VRAM para GGUF o int8 en la información disponible.
- GPU recomendadas: A100 o H100 para despliegues de alto throughput; RTX 4090 o GPUs consumer con 16 GB o más para inferencia en fp16.
- Cabe en GPU consumer: sí, en tarjetas con 16 GB o más de VRAM en fp16; en tarjetas de 8–12 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: `transformers` estándar con el script `infer.py` incluido; las etiquetas del repositorio indican compatibilidad con text-generation-inference y endpoints compatibles. No se documenta soporte explícito de llama.cpp, Ollama o vLLM.
- Latencia: aproximadamente 26 ms por decisión en GPU según el autor; no se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini TypeSafe — Qwen3-4B | 4.022 M | no disponible | Decisión tipada por logits de marcadores | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3-4B | ~4.000 M | no disponible en esta ficha | Generación de texto generalista | Apache 2.0 | Hugging Face |
| Modelos de clasificación dedicados (por ejemplo, BERT/RoBERTa fine-tuned) | 100–400 M típicamente | 512 tokens típicamente | Clasificación supervisada con clases fijas en entrenamiento | Variable | Amplia |

La diferencia clave frente a Qwen3-4B es que Mini TypeSafe no genera texto: restringe la salida a un conjunto de opciones definido en tiempo de ejecución y aporta calibración explícita. Frente a clasificadores BERT clásicos, ofrece opciones dinámicas por llamada en lugar de clases fijas en entrenamiento, a costa de un tamaño mucho mayor. No se dispone de comparaciones de rendimiento publicadas con alternativas.

## Limitaciones y advertencias

- La aritmética de varios pasos y la correferencia de pronombres (estilo Winograd) son los principales modos de fallo, y los errores en esas familias suelen producirse con alta confianza; es imprescindible umbralizar sobre la confianza calibrada y derivar los casos dudosos a un mecanismo de reserva.
- El formato de prompt (instrucción de sistema, bloques `State/Question/Options` y marcadores de letra) es fijo; otras plantillas no reproducen las cifras declaradas.
- Las opciones deben tokenizarse de forma que cada marcador `A`–`Z` sea un único token; esto se cumple con el tokenizador de Qwen3 incluido, pero no está garantizado con otros tokenizadores.
- El error de calibración esperado sin ajuste es de 0,143; la temperatura de 1,41 y el prior de `calibration.json` son necesarios para obtener confianzas fiables.
- La tasa de inversión por orden del 7,5% indica cierta sensibilidad al orden de presentación de las opciones.
- No es un modelo de chat ni de generación; usarlo mediante `generate` produce resultados peores que la ruta de puntuación.
- No se especifican idiomas soportados; el comportamiento multilingüe no está documentado y debe validarse empíricamente antes de usarlo en producción fuera del inglés.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicación muy reciente y sin validación independiente.
- Licencia Apache 2.0, que permite uso comercial, modificación y redistribución con atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mo19788/mini-typesafe-qwen3-4b
- Demostración interactiva (Space): https://huggingface.co/spaces/mo19788/mini-typesafe-demo
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Script de inferencia incluido: `infer.py` en el repositorio del modelo
- Fichero de calibración incluido: `calibration.json` en el repositorio del modelo
