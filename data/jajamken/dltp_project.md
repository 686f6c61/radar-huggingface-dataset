# jajamken/DLTP_project

## Resumen

`jajamken/DLTP_project` no es un modelo completo, sino un conjunto de dos adaptadores LoRA (librería PEFT) entrenados sobre `Qwen/Qwen2.5-Coder-7B-Instruct`. Lo publica el usuario jajamken como proyecto de la asignatura IE 643 (equipo "Tired Perceptron"). El problema que aborda es la edición de programas CAD escritos en CadQuery a partir de instrucciones en lenguaje natural: el usuario describe un cambio sobre una pieza o un script y el modelo devuelve el programa modificado.

El repositorio contiene dos variantes con el mismo entrenamiento: `patch_lora/`, que responde con un diff unificado que edita el programa CadQuery, y `rewrite_lora/`, que responde con el programa completo reescrito y se usa como línea base. La comparación entre ambos paradigmas (parche frente a reescritura) es el eje del proyecto.

Su relevancia es acotada pero interesante: explora la edición de código mediante diffs en un dominio poco cubierto por los modelos generalistas, el diseño paramétrico. Ahora bien, se trata de un artefacto de curso, sin licencia declarada, sin benchmarks publicados y sin validación de la comunidad (0 descargas, 0 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder-only: `Qwen/Qwen2.5-Coder-7B-Instruct`. LoRA de rango 16 y alpha 32 aplicado a las proyecciones q/k/v/o y gate/up/down |
| Parametros totales | 7B en el modelo base (según el identificador del modelo); el número de parámetros del adaptador no se declara en la información disponible. El repositorio ocupa 0,3 GB e incluye los dos adaptadores |
| Parametros activos | No aplica: no es un modelo MoE, es un adaptador LoRA sobre un transformer denso |
| Longitud de contexto | No disponible en la información proporcionada; viene determinada por el modelo base Qwen2.5-Coder-7B-Instruct (consultar su model card) |
| Tipos de cuantizacion | No declarados. Al ser adaptadores en safetensors, la cuantización se aplicaría al modelo base al cargarlo o fusionarlo (por ejemplo, 8-bit o 4-bit), no al adaptador en sí |
| Idiomas soportados | No disponibles: no se declaran en la model card ni en los metadatos de HuggingFace |
| Licencia | No disponible: no se especifica ni en la model card ni en los metadatos de HuggingFace |
| Formato de pesos | safetensors (adaptadores PEFT). Dos subcarpetas: `patch_lora/` y `rewrite_lora/` |

## Arquitectura y entrenamiento

El modelo es un ajuste por LoRA sobre `Qwen2.5-Coder-7B-Instruct`, un transformer decoder-only orientado a código. Los adaptadores se aplican sobre las proyecciones de atención q/k/v/o y sobre las proyecciones gate/up/down del bloque MLP. La configuración de LoRA es r=16, alpha=32 y dropout 0,05. No se modifica ni se sustituye la arquitectura del modelo base; el repositorio solo contiene los pesos de los adaptadores.

El entrenamiento es idéntico para las dos variantes: 1 epoch sobre 27.839 tripletes (dataset `jajamken/DLTP_project`), learning rate 2e-4 con scheduler coseno y 3 % de warmup, batch efectivo de 32 en bf16, y cálculo de la pérdida únicamente sobre la respuesta (loss solo en el completion). La diferencia entre `patch_lora` y `rewrite_lora` está en el formato de la respuesta objetivo: diff unificado frente a programa completo. El formato exacto del prompt no se reproduce en la model card; se remite a `prompts.py` del código del proyecto, lo que implica una dependencia fuerte de esa plantilla en inferencia.

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, RLHF/DPO u otras fases de alineamiento posteriores al ajuste supervisado).

## Capacidades

- Edición de programas CAD escritos en CadQuery a partir de instrucciones en lenguaje natural.
- Generación de parches en formato unified diff (`patch_lora`) que modifican un fichero existente en lugar de reescribirlo.
- Reescritura completa del programa editado (`rewrite_lora`), pensada como línea base del experimento.
- Comprensión de código Python y de la estructura de un programa paramétrico de CadQuery (operaciones de boceto, extrusión, operaciones booleanas, parámetros de cotas).
- Capacidades heredadas del modelo base Qwen2.5-Coder-7B-Instruct (generación de código general, seguimiento de instrucciones): no se han evaluado en esta ficha ni se documentan en la información disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Edición asistida de piezas paramétricas: un ingeniero describe en lenguaje natural un cambio ("aumenta el radio del agujero a 4 mm y desplaza el patrón 10 mm en X") y `patch_lora` devuelve un diff aplicable sobre el script CadQuery existente, lo que evita regenerar el programa completo y facilita la revisión del cambio.
- Revisión de cambios en un editor o IDE: el diff generado se puede previsualizar y validar con `git apply --check` o `patch --dry-run` antes de aceptarlo, de modo que el ingeniero ve exactamente qué líneas se modifican.
- Refactorizaciones repetitivas por lotes: aplicar consignas homogéneas (cambiar tolerancias, normalizar nombres de parámetros, sustituir una primitiva por otra) sobre una colección de scripts CadQuery, revisando cada parche antes de integrarlo.
- Generación de variantes de diseño: a partir de un programa base, pedir modificaciones de dimensiones o de número de instancias de un patrón y obtener el parche correspondiente para cada variante.
- Integración en un pipeline de CI para geometría: ejecutar el modelo sobre los scripts del repositorio, aplicar los parches en una rama y lanzar la validación geométrica o el renderizado como test automático.
- Investigación sobre edición de código: comparar empíricamente el paradigma diff frente al de reescritura completa usando las dos variantes con el mismo entrenamiento, lo que permite aislar el efecto del formato de salida.
- Docencia y material de curso: ejemplo reproducible de fine-tuning con LoRA (r=16, alpha=32), entrenamiento con pérdida solo en la respuesta y evaluación de formatos de salida en un dominio acotado.
- Control de versiones semántico: usar los diffs como unidad de cambio revisable en un flujo tipo git, con trazabilidad de qué instrucción en lenguaje natural produjo cada modificación del programa CAD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (ni exactitud de parches aplicables, ni comparación cuantitativa entre `patch_lora` y `rewrite_lora`, ni resultados en MMLU, HumanEval, GSM8K u otros). Tampoco se aportan métricas específicas del dominio, como tasa de diffs que aplican correctamente o similitud geométrica entre el modelo CAD original y el editado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 7B, en bf16/fp16 los pesos ocupan del orden de 14-15 GB, a lo que hay que sumar caché KV y activaciones; en la práctica se recomienda un mínimo de 16-18 GB para inferencia en bf16 sin cuantizar. En 8-bit, alrededor de 8-9 GB; en 4-bit, alrededor de 5-6 GB. Son estimaciones a partir del tamaño del modelo base, no cifras publicadas por el autor.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o similares para despliegue en bf16 con concurrencia; RTX 4090 o RTX 3090 (24 GB) para inferencia en bf16 de un solo usuario.
- Cabe en GPU de consumo: sí. En 24 GB (RTX 4090, RTX 3090) en bf16; en 16 GB (RTX 4080, RTX 4070 Ti Super) con cuantización de 8 bits; en 8-12 GB con cuantización de 4 bits y contextos cortos.
- Opciones de despliegue: la vía documentada en la model card es `transformers` + `peft` (`PeftModel.from_pretrained` con `subfolder="patch_lora"`). Para servir en producción, vLLM y TGI admiten adaptadores LoRA, aunque la compatibilidad con esta configuración concreta no está verificada en la información disponible. Para llama.cpp u Ollama sería necesario fusionar el adaptador con el modelo base (`merge_and_unload`) y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 7B, el coste por token es el habitual en esa clase de tamaño, pero no hay mediciones publicadas para estos adaptadores.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de alternativas comparables documentadas en la información proporcionada. La comparación posible se limita a las dos variantes del propio repositorio y al modelo base sin adaptar:

| Modelo | Parametros | Contexto | Enfoque de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jajamken/DLTP_project` (`patch_lora`) | 7B base + LoRA r=16 | No disponible (la del modelo base) | Diff unificado sobre el programa CadQuery | No disponible | HuggingFace, 0 descargas, 0 likes |
| `jajamken/DLTP_project` (`rewrite_lora`) | 7B base + LoRA r=16 | No disponible (la del modelo base) | Programa completo reescrito | No disponible | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen2.5-Coder-7B-Instruct` (sin adaptador) | 7B | No disponible en esta ficha (consultar su model card) | Programa completo generado desde cero | No verificada en la información disponible | HuggingFace, modelo base público |

No se identifican en la información proporcionada otros adaptadores públicos de edición de CAD mediante diffs con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- Es un proyecto de curso (IE 643, equipo "Tired Perceptron"), no un modelo validado para producción; no hay evaluación publicada de su calidad.
- No se declara licencia, ni en la model card ni en los metadatos de HuggingFace. No se puede asumir uso comercial sin aclaración previa del autor y sin verificar la licencia del modelo base.
- Ausencia total de tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente ni de revisión por terceros.
- Fuerte dependencia del formato de prompt: la model card remite a `prompts.py` del proyecto. Fuera de esa plantilla exacta, el comportamiento del adaptador es incierto.
- Riesgo de diffs inválidos: los parches unificados pueden contener hunks con contexto incorrecto o números de línea desajustados y no aplicar. Es obligatorio validar cada parche con `git apply --check` o `patch --dry-run` antes de usarlo.
- Riesgo de alucinación en la API de CadQuery: el modelo puede invocar funciones o argumentos inexistentes, o generar operaciones geométricamente inválidas aunque el código sea sintácticamente correcto.
- Entrenamiento limitado: 1 epoch sobre 27.839 tripletes, sin datos sobre diversidad del dataset ni sobre el dominio de piezas cubierto; existe riesgo de sobreajuste al estilo de los programas de entrenamiento.
- Cobertura de dominio estrecha: está ajustado para edición de CadQuery, no para CAD genérico ni para otros lenguajes o frameworks de geometría.
- Longitud de contexto limitada por el modelo base: los programas CAD largos, o los ficheros con mucho contexto alrededor del cambio, pueden no caber en la ventana o degradar la calidad del diff.
- Idiomas no declarados: no hay garantía de comportamiento consistente en castellano ni en idiomas distintos del usado en el dataset de entrenamiento.
- Dos adaptadores en un mismo repositorio: es imprescindible indicar `subfolder` al cargar (`patch_lora` o `rewrite_lora`); una carga sin subcarpeta fallará o dará un resultado no deseado.
- Fecha de creación del repositorio en los metadatos de HuggingFace: 2026-10-24, dato que conviene verificar si se cita el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jajamken/DLTP_project
- Dataset del proyecto (referenciado en la model card como `jajamken/DLTP_project`): https://huggingface.co/datasets/jajamken/DLTP_project
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Librería PEFT (indicada en los metadatos del modelo): https://github.com/huggingface/peft
- Los resultados de búsqueda web proporcionados no guardan relación con el modelo: corresponden a la ciudad francesa de Cahors y a sus páginas turísticas e institucionales. No se han encontrado papers, blogs, repositorios ni demos adicionales del proyecto en la información disponible.
