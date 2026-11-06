# mohsenvand/savant-4b-loom-preview

## Resumen

Savant-4B Loom Preview es un ajuste fino (finetune) del modelo Qwen3-4B de Alibaba, publicado por el desarrollador mohsenvand bajo el identificador `mohsenvand/savant-4b-loom-preview`. Se distribuye como un modelo de generación de texto orientado a ejecución local en navegador mediante transformers.js y WebGPU, con pesos en formato ONNX cuantizados a 4 bits y un tamano de repositorio de 3,3 GB. La propuesta central del autor es que el modelo "razona en lenguaje natural y, cuando un paso requiere exactitud, escribe un pequeno programa, lo ejecuta dentro de sus propias pasadas forward y continua razonando con el resultado".

Se trata de una vista previa de investigación (research preview), no de un asistente general ni de un modelo con ajuste de seguridad. El autor anuncia un paper "forthcoming" (pendiente de publicación), por lo que la mayor parte de los detalles técnicos sobre el entrenamiento, los datos utilizados y las evaluaciones no están disponibles en la información proporcionada. La relevancia actual reside en su enfoque híbrido de razonamiento con cómputo interno y en su empaquetado específico para inferencia en el navegador, un nicho poco habitual en modelos de 4B parámetros.

La licencia es propietaria (`savant-proprietary`), aunque el modelo es un derivado modificado de Qwen3-4B, que se distribuye bajo Apache 2.0; el autor incluye un fichero NOTICE para reflejar esa relación. El modelo base es Qwen/Qwen3-4B, con relación declarada de finetune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3-4B (detalles de la modificación interna no disponibles) |
| Parametros totales | 4B (heredados del modelo base Qwen3-4B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (pesos ONNX); no se detallan otras variantes |
| Idiomas soportados | No disponible |
| Licencia | Propietaria (`savant-proprietary`); derivado modificado de Qwen3-4B (Apache 2.0) |
| Formato de pesos | ONNX (cuantizado a 4 bits), orientado a WebGPU y transformers.js |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de 4 mil millones de parámetros, y se presenta como un finetune con una modificación funcional: el modelo puede escribir pequeños programas y ejecutarlos dentro de sus propias pasadas forward, incorporando el resultado al flujo de razonamiento. El autor lo describe como un modelo que "piensa en palabras y computa en sí mismo", lo que sugiere un mecanismo de cómputo interno acoplado al decoding, aunque no se especifican los detalles de implementación, el esquema de entrenamiento ni si se emplearon técnicas de RLHF, DPO o aprendizaje por refuerzo con ejecución de código.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de ajuste ni las innovaciones técnicas concretas más allá de la descripción cualitativa del autor. El paper está anunciado como pendiente de publicación, por lo que cualquier dato cuantitativo sobre el entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-4B.
- Razonamiento en lenguaje natural con pasos explícitos.
- Escritura y ejecución de pequeños programas dentro de las pasadas forward del propio modelo, según la descripción del autor.
- Ejecución local en navegador mediante transformers.js y WebGPU.
- No se documenta soporte de tool calling o function calling externo.
- No se documenta soporte de agentes multi-paso más allá del bucle interno de razonamiento y cómputo.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en la model card).
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Demostraciones interactivas en navegador: el modelo está empaquetado en ONNX 4 bits para WebGPU y transformers.js, por lo que puede desplegarse en una página web para probar razonamiento con cómputo interno sin infraestructura de servidor.
- Investigación sobre razonamiento híbrido: útil para estudiar cómo un modelo de 4B intercala lenguaje natural y ejecución de programas dentro de su propio forward, en un contexto de research preview.
- Prototipado de asistentes técnicos con verificación aritmética: el mecanismo de escribir y ejecutar programas puede emplearse para tareas donde la exactitud numérica importa, como cálculos sencillos o transformaciones de datos.
- Educación y divulgación: al ejecutarse en el navegador, permite mostrar el funcionamiento interno de un modelo de lenguaje y su capacidad de computar pasos exactos en charlas, talleres o materiales docentes.
- Evaluación de despliegue en el borde (edge): sirve para medir latencia y viabilidad de modelos de 4B cuantizados a 4 bits en GPUs de consumo a través de WebGPU.
- Experimentación con licencias propietarias en entornos de investigación: permite evaluar las restricciones de una licencia `savant-proprietary` antes de adoptar el modelo en un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 3,3 GB en el repositorio (ONNX 4 bits); la VRAM necesaria para inferencia será algo superior por el estado de activaciones y el contexto, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles. El modelo está orientado a WebGPU, por lo que requiere un navegador con soporte WebGPU y una GPU compatible.
- GPU de consumo: el tamano de 4B en 4 bits sugiere que puede caber en GPUs de consumo con suficiente memoria, pero no se confirma en la información proporcionada.
- Opciones de despliegue: transformers.js con WebGPU es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Savant-4B Loom Preview | 4B | No disponible | ONNX 4 bits | Propietaria (`savant-proprietary`) | Hugging Face, ejecución en navegador |
| Qwen3-4B (base) | 4B | No disponible en esta ficha | Safetensors y otros | Apache 2.0 | Hugging Face |
| Otros finetunes de Qwen3-4B | 4B | No disponible | Variable | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Es una research preview: el autor indica explícitamente que no es un asistente general ni está ajustado en seguridad.
- Licencia propietaria (`savant-proprietary`): el uso comercial está sujeto a los términos del fichero LICENSE, que no se detallan en la información disponible; debe revisarse antes de cualquier adopción en producción.
- Al ser un derivado de Qwen3-4B (Apache 2.0), existen obligaciones de atribución recogidas en el fichero NOTICE.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- No se dispone de información sobre sesgos, riesgo de alucinación ni evaluaciones de seguridad.
- El mecanismo de ejecución de programas dentro del forward no está documentado públicamente; su fiabilidad y sus límites son desconocidos.
- La longitud de contexto no está especificada, lo que impide planificar cargas con ventanas largas.
- El modelo tiene un número muy bajo de descargas (89) y cero likes en el momento de la consulta, lo que refleja una adopción todavía mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohsenvand/savant-4b-loom-preview
- Demo en navegador: https://neovand.github.io/polyformer/interpreter
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
