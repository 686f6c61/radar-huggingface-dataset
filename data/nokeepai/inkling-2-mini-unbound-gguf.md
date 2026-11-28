# nokeepai/Inkling-2-Mini-Unbound-GGUF

## Resumen

Inkling-2-Mini-Unbound-GGUF es la distribución en formato GGUF de Inkling-2-Mini-Unbound, una variante "abliterated" (sin rechazos de seguridad) del modelo de razonamiento multimodal Inkling 2 Mini desarrollado por Thinking Machines Lab. El modelo original acepta entradas de texto e imagen y emplea un modo de razonamiento privado ("thinking") antes de emitir la respuesta final. La versión Unbound, publicada por nokeepai, elimina el entrenamiento de seguridad del modelo base, de modo que responde a peticiones que el original rechaza. Este repositorio concreto contiene los pesos cuantizados en GGUF para su ejecución local con llama.cpp, LM Studio u Ollama.

Arquitectura y tamaño: los pesos en safetensors del modelo base suman 26.070.385.152 parámetros (aproximadamente 26.000 millones), y la model card indica que se trata de un modelo de mezcla de expertos (MoE), ya que menciona la posibilidad de descargar parte de los pesos a RAM de CPU con `--n-cpu-moe`. El repositorio ocupa 507,7 GB e incluye múltiples niveles de cuantización, desde IQ2_M (unos 11 GB) hasta BF16 (unos 52 GB), además de un proyector de visión (`mmproj`) separado para la entrada de imágenes.

La relevancia actual del modelo radica en dos factores: por un lado, permite ejecutar un modelo de razonamiento multimodal de aproximadamente 26.000 millones de parámetros en hardware de consumo gracias a la cuantización GGUF y a la arquitectura MoE; por otro, su naturaleza "uncensored" lo orienta a investigadores, equipos de red teaming, escritores de ficción y desarrolladores que aplican sus propias políticas de contenido. La versión v3 incorpora el denominado "Prime add-on", un adaptador LoRA entrenado sobre tareas inocuas que corrige el exceso de razonamiento del modelo original en tareas de varios pasos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; modalidad imagen-texto; razonamiento con modo "thinking" |
| Parámetros totales | 26.070.385.152 (aproximadamente 26.000 millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en la configuración de ejemplo con `-c 32768`); máximo nativo no disponible |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ3_M, IQ2_M; proyector de visión en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Inkling 2 Mini, de Thinking Machines Lab, descrito en la model card como un modelo de razonamiento de pesos abiertos que acepta texto e imágenes y genera un razonamiento privado antes de la respuesta. La referencia a `--n-cpu-moe` en la documentación confirma que la arquitectura es de mezcla de expertos: solo una parte de los pesos se activa por token, lo que permite descargar expertos a RAM de CPU y ejecutar el modelo con menos VRAM que un modelo denso equivalente. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

La variante Unbound aplica un proceso de "abliteration" que elimina los rechazos del modelo original y no reincorpora entrenamiento de seguridad. Sobre esa base, la versión v3 añade el "Prime add-on", un adaptador LoRA entrenado únicamente con tareas inocuas (el mismo que convierte el Inkling 2 Mini original en Inkling-2-Mini-Prime). Su objetivo es corregir el defecto de la v2.1 y del modelo original: el exceso de razonamiento que consumía el límite de pensamiento (4096 tokens) sin producir código ni respuestas en tareas de varios pasos. El proyector de visión (`mmproj`) es el del modelo original, sin modificar.

## Capacidades

- Generación de texto y razonamiento multi-paso con un modo de pensamiento privado configurable mediante `reasoning_effort` (valor recomendado 0.9) y un límite de 4096 tokens de razonamiento.
- Comprensión de imágenes mediante el proyector de visión `mmproj`, que se carga junto con el archivo GGUF principal.
- Conversación multi-turno (etiqueta `conversational`).
- Ejecución local en GPU de consumo, Mac o CPU gracias a los formatos GGUF y a la arquitectura MoE.
- Respuestas a peticiones sensibles, peligrosas o ilegales que el modelo original rechaza (comportamiento "uncensored").
- Compatibilidad con endpoints (`endpoints_compatible`) y con el chat template Jinja de llama.cpp (`--jinja`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo permite generar respuestas a peticiones dañinas en un entorno controlado, lo que facilita probar clasificadores, filtros y salvaguardas propias antes de desplegarlas en producción.
- Investigación sobre alineación y abliteration: comparar las respuestas de Inkling-2-Mini-Unbound con las del Inkling 2 Mini original permite estudiar qué comportamientos elimina el proceso de abliteration y cómo afecta al razonamiento.
- Escritura de ficción y contenido creativo sin restricciones temáticas: con 32.768 tokens de contexto y modo de razonamiento, el modelo puede desarrollar tramas, personajes y escenas que el modelo original declinaría.
- Asistente local de propósito general con entrada de imágenes: cargando el `mmproj` junto con el GGUF Q4_K_M (unos 18 GB) en una GPU de 16 a 24 GB, se obtiene un asistente multimodal que procesa capturas, diagramas o fotografías sin enviar datos a la nube.
- Corrección de código en iteraciones múltiples: la v3 con el Prime add-on está diseñada para no agotar el límite de pensamiento en tareas de varios pasos, de modo que puede emplearse en bucles de depuración donde el modelo debe alternar razonamiento y escritura de código.
- Despliegue en hardware heterogéneo: con `--n-cpu-moe N` en llama.cpp, el Q4_K_M funciona con menos de 12 GB de VRAM descargando expertos a RAM, lo que permite ejecutarlo en estaciones de trabajo modestas o en Mac con memoria unificada.
- Desarrollo de sistemas propios con reglas de contenido personalizadas: equipos que ya disponen de sus propios filtros pueden integrar el modelo como motor generativo sin las restricciones del original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación principal se realizó sobre los pesos en precisión completa del repositorio principal (`nokeepai/Inkling-2-Mini-Unbound`), no sobre estos archivos GGUF, y remite a esa model card principal para la evaluación completa.

## Requisitos de hardware

- VRAM estimada según el archivo (tamaño del archivo más unos pocos GB para la conversación):
  - IQ2_M: unos 11 GB; requiere menos de 12 GB de VRAM.
  - IQ3_M: unos 13 GB; encaja en 12 a 16 GB.
  - Q4_K_M (recomendado): unos 18 GB; encaja en 16 a 24 GB.
  - Q5_K_M: unos 20 GB; encaja en 24 a 32 GB.
  - Q6_K: unos 24 GB; encaja en 24 a 32 GB.
  - Q8_0: unos 28 GB; requiere 32 GB o más.
  - BF16: unos 52 GB; no destinado a ejecución, sino a generar cuantizaciones propias.
- Proyector de visión: `mmproj-Inkling-2-Mini-Q8_0.gguf` o `-BF16`, menos de 1 GB adicional; solo necesario para entrada de imágenes.
- GPU de consumo: sí, cabe en tarjetas de 16 a 24 GB con Q4_K_M; con `--n-cpu-moe N` puede ejecutarse por debajo de 12 GB de VRAM a costa de velocidad.
- Opciones de despliegue: llama.cpp (se requiere una compilación con soporte de Inkling 2 que incluya el arreglo de bucle del PR #32704; se usó el commit `19bc41dbb`, y las versiones etiquetadas hasta b12608 no lo incluyen), LM Studio y Ollama.
- Parámetros de inferencia recomendados: `reasoning_effort` 0.9, `temperature` 0.6 (no usar 0, que provocaba bucles en el razonamiento de versiones anteriores), `top_p` 1.0 (llama.cpp usa 0.95 por defecto), límite de pensamiento de 4096 tokens y contexto de 32.768 tokens.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound-GGUF (este) | ~26.000 M (MoE) | 32.768 tokens (configuración de ejemplo) | Imagen-texto, razonamiento | Apache 2.0 | Sin rechazos; GGUF para ejecución local |
| Inkling 2 Mini (Thinking Machines Lab) | ~26.000 M (MoE) | no disponible | Imagen-texto, razonamiento | no disponible | Modelo original con rechazos de seguridad |
| Inkling-2-Mini-Prime | no disponible | no disponible | Imagen-texto, razonamiento | no disponible | Original con el Prime add-on para corregir el exceso de razonamiento |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo sigue instrucciones dañinas: ofrece respuestas detalladas a peticiones de contenido peligroso o ilegal que el modelo original rechaza, y no tiene entrenamiento de seguridad reincorporado. No debe desplegarse ante usuarios finales sin salvaguardas propias.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es un riesgo inherente a los modelos generativos de este tamaño.
- Exceso de razonamiento: el modelo original y la v2.1 tendían a razonar hasta agotar el límite de pensamiento en tareas de varios pasos; el Prime add-on de la v3 lo mitiga, pero la model card no cuantifica cuánto.
- `temperature` 0 provoca bucles en el razonamiento según la model card; debe usarse 0.6.
- Requiere una compilación específica de llama.cpp con el arreglo del PR #32704; las versiones etiquetadas hasta b12608 no son compatibles.
- La evaluación principal se hizo sobre los pesos en precisión completa, no sobre estos GGUF; la calidad real de cada cuantización puede diferir, y los archivos IQ3_M e IQ2_M son "notablemente lossy" según el autor.
- Idiomas soportados: no disponible; no se documenta el rendimiento multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de filtros de seguridad traslada al desplegador toda la responsabilidad legal y ética sobre el contenido generado.
- El repositorio ocupa 507,7 GB; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Modelo base Unbound: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Modelo original Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Sitio del autor: https://nokeep.ai/?ref=huggingface
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- PR de llama.cpp con el arreglo de bucle: PR #32704 (sin URL directa en la información disponible)
