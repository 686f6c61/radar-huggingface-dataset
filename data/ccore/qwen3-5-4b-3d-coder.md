# ccore/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino independiente del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario CCORE y publicado bajo licencia Apache 2.0. No se trata de un lanzamiento oficial de Qwen. El modelo está especializado en generación de código de propósito general con un foco explícito en la creación de escenas 3D interactivas mediante Three.js, y se distribuye como una "early preview" de un entrenamiento todavía en curso.

Con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y un tamaño de repositorio de 31,4 GB, el modelo se ofrece en pesos FP16 en formato Safetensors (cuatro shards) y en dos cuantizaciones GGUF: Q4_K_M y Q8_0. El contexto declarado en los ejemplos de despliegue es de 65.536 tokens, configurable en llama.cpp mediante `--ctx-size 65536`. Los pesos FP16 fueron verificados localmente para carga y generación de texto con Transformers 5.20.2.

La relevancia del modelo radica en su naturaleza experimental: explora la viabilidad de modelos pequeños para tareas de código con salida estructurada compleja (HTML/JavaScript con Three.js) y añade soporte opcional de visión para generar escenas a partir de una imagen de referencia, usando el proyector multimodal original de Qwen3.5-4B. El dataset de entrenamiento, CCORE Three.js 3D Scenes, es público y contiene 4.146 ejemplos de escenas (3.933 de entrenamiento y 213 de validación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 65.536 tokens (configuracion documentada en llama.cpp) |
| Tipos de cuantizacion | FP16 (Safetensors), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP16, 4 shards) y GGUF (Q4_K_M, Q8_0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado sobre Qwen/Qwen3.5-4B, un transformer de 4,5 mil millones de parámetros. La model card no detalla la arquitectura interna del modelo base (número de capas, dimensiones ocultas, mecanismo de atención), por lo que esos datos deben consultarse en la documentación de Qwen. El ajuste se realizó sobre el dataset CCORE Three.js 3D Scenes, compuesto por 4.146 ejemplos (3.933 de entrenamiento y 213 de validación) que incluyen prompts, trazas de razonamiento completas ("thinking traces"), respuestas completas en HTML/JavaScript y niveles de complejidad. El dataset se publica bajo licencia MIT y dispone de una configuración opcional `previews` con imágenes renderizadas de referencia.

No se especifica en la información disponible el número total de tokens de entrenamiento, la composición completa del corpus ni si se aplicaron técnicas de RLHF o DPO. La model card menciona un informe técnico en PDF que presumiblemente contiene estos detalles. Una innovación destacable es el soporte multimodal opcional: las versiones GGUF Q4_K_M y Q8_0 pueden aceptar imágenes si se cargan junto con el proyector BF16 original de Qwen3.5-4B (aproximadamente 644 MiB), lo que permite generar escenas Three.js a partir de una imagen de referencia. Este proyector es el archivo sin modificar de lmstudio-community/Qwen3.5-4B-GGUF.

## Capacidades

- Generación de código de propósito general, con especialización en HTML y JavaScript para escenas 3D con Three.js.
- Generación de escenas 3D interactivas completas a partir de una descripción textual.
- Modo de razonamiento con trazas de pensamiento ("thinking traces"), presentes en el dataset de entrenamiento.
- Soporte opcional de visión en GGUF (Q4_K_M y Q8_0) mediante el proyector multimodal de Qwen3.5-4B: admite una imagen de referencia y genera la escena correspondiente.
- Generación de código estructurado con niveles de complejidad variables, según la anotación del dataset.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.
- No se documenta soporte de agentes multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js para prototipado rápido: el modelo produce HTML/JavaScript completo a partir de un prompt descriptivo, lo que permite a un desarrollador obtener una escena 3D funcional en un solo paso y reducir el tiempo de arranque de prototipos web interactivos.
- Generación de escenas guiada por imagen: con la cuantización GGUF y el proyector multimodal, se puede adjuntar una referencia visual y pedir al modelo que reproduzca la escena con voxels u otra técnica, útil para convertir bocetos o referencias en código ejecutable.
- Asistencia en el desarrollo de visualizaciones 3D educativas: el modelo puede generar escenas interactivas para materiales didácticos de matemáticas, física o geometría, donde el contexto de 65.536 tokens permite incluir especificaciones extensas en el prompt.
- Integración en herramientas de autoría web: dado que genera HTML/JavaScript autocontenido, puede conectarse a editores o generadores de sitios para producir componentes 3D embebibles.
- Evaluación y experimentación con modelos pequeños para código: investigadores pueden usar el modelo y su dataset público (MIT) para estudiar la viabilidad de modelos de 4B en tareas de código estructurado y comparar con alternativas mayores.
- Despliegue local en entornos con recursos limitados: las cuantizaciones Q4_K_M y Q8_0 permiten ejecutar el modelo en llama.cpp con aceleración GPU, adecuado para estaciones de trabajo sin GPUs de datacenter.
- Generación de código de propósito general en pipelines de desarrollo: aunque el foco es 3D, la model card indica resultados prometedores en código general, por lo que puede usarse como asistente de código en tareas cotidianas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta evaluaciones cualitativas: una mejora sustancial en el éxito "one-shot" y en la calidad general de las escenas tras la actualización del checkpoint del 27 de octubre, y señala que algunas escenas todavía pueden requerir otro intento o una corrección.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP16 (4,5B parámetros) ocupan aproximadamente 9 GB; Q8_0 alrededor de 4,8 GB; Q4_K_M alrededor de 2,7 GB (estimaciones a partir del número de parámetros; no confirmadas en la model card).
- El proyector de visión opcional añade aproximadamente 644 MiB adicionales cuando se carga.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo cabe en GPUs de consumo con suficiente VRAM; Q4_K_M y Q8_0 son las opciones indicadas para despliegue local.
- Despliegue: llama.cpp es el backend documentado y probado (versión b11889, con `--n-gpu-layers all --flash-attn on --ctx-size 65536 --parallel 1`). Los pesos FP16 se verificaron con Transformers 5.20.2. No se documentan vLLM, TGI ni Ollama en la información disponible.
- Para visión en llama.cpp se requiere cargar el modelo GGUF junto con `mmproj-Qwen3.5-4B-BF16.gguf` mediante `--mmproj`. El uso de `--cache-type-k q8_0 --cache-type-v q8_0` reduce el consumo de memoria de la caché KV y fue probado con visión a 64K de contexto, aunque solo en pruebas cortas, no de estrés a contexto completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| ccore/Qwen3.5-4B-3D-Coder | 4,54B | 65.536 | Apache 2.0 | Safetensors, GGUF | Ajuste especializado en Three.js y 3D; visión opcional vía proyector |
| Qwen/Qwen3.5-4B (base) | 4B (aproximado) | No disponible | Apache 2.0 (segun el modelo base) | No disponible | Modelo base sin especialización 3D |
| lmstudio-community/Qwen3.5-4B-GGUF | 4B (aproximado) | No disponible | Apache 2.0 | GGUF | Cuantizaciones del modelo base; fuente del proyector de visión |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una "early preview" de un entrenamiento en curso: el autor advierte que algunas escenas pueden requerir un segundo intento o una corrección manual.
- El modelo no es un lanzamiento oficial de Qwen; es un ajuste fino independiente de CCORE.
- La especialización en Three.js puede reducir el rendimiento en otras tareas de código frente al modelo base, aunque la model card afirma resultados prometedores en código general.
- El soporte de visión es opcional y depende de cargar el proyector correcto; los tokens de imagen comparten la ventana de contexto con el prompt y el código generado, lo que reduce el espacio disponible.
- El soporte de imagen en otras interfaces distintas de llama.cpp depende de su implementación multimodal.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.5-4B y del proyector (también Apache 2.0).
- Los pesos FP16 solo se verificaron con Transformers 5.20.2; otras versiones pueden presentar incompatibilidades.
- Los parámetros de generación recomendados son temperatura 0,6, top-k 20, top-p 0,95 y penalización de repetición 1,0; desviarse de ellos puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe técnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Proyector de visión BF16: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf
- Origen del proyector: https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- Archivos del repositorio: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/tree/main
