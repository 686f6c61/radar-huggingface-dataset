# Jundot/clef-flash-oQ2.5e

## Resumen

clef-flash-oQ2.5e es un checkpoint cuantizado en formato MLX del modelo Cloudflare/clef-flash, un modelo de decisión de aproximadamente 9B de parámetros post-entrenado a partir de Qwen/Qwen3.5-9B. Lo publica el usuario Jundot dentro del ecosistema oQ/oMLX, una herramienta de cuantización de precisión mixta orientada a Apple Silicon. El modelo original no es un generador de texto al uso: recibe un estado y un esquema de preguntas tipadas, y devuelve en una única pasada forward una probabilidad para cada opción permitida de cada pregunta.

La relevancia de esta ficha es doble. Por un lado, demuestra un caso de cuantización agresiva pero selectiva: el 74,6% de los pesos se almacenan a 2 bits afines con grupo de 64, mientras que las capas más sensibles se conservan a 5 y 6 bits e incluso en BF16, con un promedio efectivo de 4,011 bits por peso. Por otro, es un ejemplo de despliegue multimodal (texto más imagen) en el stack MLX, con el backbone de lenguaje, el codificador de visión y la cabeza conjunta de esquema empaquetados en poco más de 4,4 GiB.

El modelo tiene un perfil de uso muy específico: no está pensado para chat abierto ni para generación libre, sino para servir decisiones estructuradas con probabilidades calibradas. Esto lo hace interesante para sistemas de enrutado, clasificación con opciones tipadas y pipelines de decisión, pero limita mucho su aplicabilidad fuera de ese nicho. No se han publicado resultados de evaluación ni datos de contexto, idiomas o dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-9B: backbone de lenguaje, codificador de vision y cabeza conjunta de esquema (joint schema head) |
| Parametros totales | 9.409.813.744 segun safetensors; 9.532B de pesos logicos segun la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla oQ2.5e: affine 2-bit group 64 (74,624% de los pesos), affine 5-bit group 64 (8,057%), affine 6-bit group 64 (11,246%) y BF16 (6,073%). Promedio efectivo de 4,011 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); repositorio de 4,8 GB, 4,451 GiB de pesos |

## Arquitectura y entrenamiento

La arquitectura subyacente es Cloudflare/clef-flash, descrito por el autor como un modelo de decisión de 9B post-entrenado desde Qwen/Qwen3.5-9B. Consta de tres componentes: un backbone de lenguaje de 8,954B de pesos lógicos, un codificador de visión de 0,456B y una cabeza conjunta de esquema de 0,122B. La cabeza (`joint_head.safetensors` y `joint_head_config.json`) se copia sin modificar desde el modelo fuente y es la responsable de producir, en una sola pasada forward, una probabilidad por cada opción permitida de cada pregunta del esquema tipado de entrada. El pipeline declarado en HuggingFace es `image-text-to-text`, lo que confirma la entrada multimodal.

El trabajo de este repositorio no es de entrenamiento sino de compresión. Se aplica oQ (oMLX v0.7.1) con la variante mejorada oQe, que asigna bits según la sensibilidad medida de cada capa en lugar de usar una precisión uniforme. Cada grupo se redondea con una matriz de importancia construida a partir de 128 muestras de 512 tokens, y después se reajustan escala y sesgo mediante mínimos cuadrados ponderados. El resultado se sirve a través de oMLX mediante el endpoint `POST /v1/systemone`. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo fuente usó RLHF, DPO u otro método de alineamiento.

## Capacidades

- Decision sobre esquemas tipados: dada una entrada de estado y un conjunto de preguntas con opciones permitidas, devuelve una probabilidad para cada opción en una única pasada forward.
- Entrada multimodal de imagen y texto, gracias al codificador de visión incluido en el checkpoint.
- Salida estructurada y calibrada por construcción: el formato de decisión es una distribución de probabilidad sobre opciones, no texto libre.
- Integración con servidor: el checkpoint está preparado para servirse con oMLX en el endpoint `POST /v1/systemone`.
- Ejecución en Apple Silicon a través de MLX, sin dependencia de CUDA.
- Tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Enrutado de decisiones en pipelines de datos: el modelo puede recibir un estado y un esquema de preguntas tipadas y devolver la probabilidad de cada opción, lo que permite umbralizar decisiones automáticas con un coste de una sola pasada forward en lugar de decodificación autoregresiva.
- Moderación con categorías predefinidas: dado un contenido y un esquema de etiquetas permitidas, se obtiene una distribución de probabilidad sobre las categorías, útil para sistemas que necesitan puntuaciones calibradas y no solo una etiqueta.
- Clasificación multimodal: al incluir codificador de visión, puede aplicarse a tareas donde la decisión depende de una imagen más un estado textual, como verificación de documentos o control de calidad visual.
- Despliegue local en portátiles Apple Silicon: con 4,451 GiB de pesos, el checkpoint encaja en equipos con memoria unificada moderada, lo que permite prototipar y ejecutar el modelo sin GPU dedicada ni servidor remoto.
- Sistemas de decisión con restricciones de latencia: al resolver todas las preguntas del esquema en un único forward, evita el coste de generar secuencias largas, lo que es adecuado para pipelines con presupuesto de milisegundos.
- Investigación sobre cuantización de precisión mixta: sirve como caso de estudio reproducible para medir el impacto de asignar 2, 5, 6 bits y BF16 por capas en un modelo multimodal, dado que el autor publica la distribución exacta de bits y la metodología.
- Evaluación de cabezas de decisión sobre backbones conocidos: al conservarse la cabeza conjunta intacta, permite estudiar cuánto degrada la cuantización del backbone la calidad de las probabilidades emitidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la distribución de bits y el desglose de almacenamiento, sin métricas de exactitud, latencia ni throughput.

## Requisitos de hardware

- Pesos en disco y en memoria: 4,451 GiB de pesos (4,779 GB), en un repositorio de 4,8 GB.
- Al ser un checkpoint MLX, requiere Apple Silicon con memoria unificada; no está pensado para GPUs NVIDIA ni AMD vía CUDA o ROCm.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia práctica, los 4,451 GiB de pesos más el estado de activaciones y el codificador de visión sugieren un mínimo cómodo de 8 GB de memoria unificada y recomendable de 16 GB o más, aunque este dato no está confirmado por el autor.
- GPU recomendadas: no disponible para CUDA. En el ecosistema MLX, los chips de la familia Apple M con memoria unificada suficiente.
- Cabe en GPU de consumo: en el ecosistema MLX, previsiblemente en equipos Apple Silicon con 16 GB o más; no hay confirmación oficial ni pruebas publicadas.
- Opciones de despliegue: oMLX (oQ), que expone el modelo mediante `POST /v1/systemone`; la librería declarada es `mlx`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/clef-flash-oQ2.5e | 9,41B reales / 9,532B logicos | no disponible | oQ2.5e mixta, 4,011 bits/peso efectivos | Apache-2.0 | MLX, via oMLX |
| Cloudflare/clef-flash | 9B (modelo fuente) | no disponible | no disponible (probablemente BF16) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B | ~9B (backbone de origen) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- El 74,624% de los pesos lógicos se almacena a 2 bits con grupo de 64. Es una compresión muy agresiva que puede degradar la calibración de las probabilidades de salida, especialmente en colas de distribución; el autor no publica evaluaciones que cuantifiquen esa pérdida.
- El modelo no es un generador de texto libre. Su función es producir probabilidades sobre opciones de un esquema tipado, por lo que no debe usarse como asistente conversacional ni para generación de código o texto abierto.
- Riesgo de alucinación: no disponible de forma explícita, pero al tratarse de una cabeza de decisión sobre opciones cerradas, el riesgo relevante es la asignación de probabilidad alta a opciones incorrectas, no la invención de contenido.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingüe aunque el backbone de origen sea Qwen3.5-9B.
- Longitud de contexto: no disponible. Sin este dato no es posible planificar entradas largas ni conversaciones multi-turno.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon. No hay evidencia de conversiones a GGUF o a formatos compatibles con CUDA en la información disponible.
- Adopción nula y ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros sobre calidad o estabilidad.
- Licencia Apache-2.0, heredada del modelo fuente, permite uso comercial, pero conviene verificar el archivo `LICENSE` del repositorio y las condiciones del modelo base Cloudflare/clef-flash.
- Los metadatos indican fecha de creación 2026-10-11 y actualización 2026-10-11, lo que conviene contrastar con la cronología real del ecosistema antes de citar el modelo.
- La cabeza conjunta se copia sin modificar, de modo que cualquier limitación del modelo original en la definición del esquema se mantiene intacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/clef-flash-oQ2.5e
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Pull request de la cuantizacion mejorada oQe: https://github.com/jundot/omlx/pull/4385
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente resultados sin relacion (perfiles de YouTube, Instagram y una biografia no vinculada).
