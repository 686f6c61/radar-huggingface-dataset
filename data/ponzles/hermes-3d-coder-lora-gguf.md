# ponzles/Hermes-3D-Coder-LoRA-GGUF

## Resumen

Hermes-3D-Coder-LoRA-GGUF es una distribución en formato GGUF publicada por el usuario ponzles a partir de la fusión de ocho LoRAs y adaptadores sobre la familia Qwen3.8-27B. El objetivo declarado en las etiquetas del repositorio es el código agéntico especializado en generación 3D: Blender, Three.js y GLSL, junto con ingeniería de software general y contexto largo. La ficha de Hugging Face lo describe como un merge de pesos, no como un modelo entrenado desde cero, y la relación declarada con los modelos base es explícitamente `merge`.

El interés práctico del artefacto está en el empaquetado: convierte una combinación de adaptadores (DaisyRose-27B, ThinkingCap-Qwen3.8-27B, super-adapter de harness-hub, Swift-1.5, Terse-Coder-LoRA, 3D-Coder de syaikhipin, 3dcodeverse y el base de unsloth) en pesos GGUF listos para llama.cpp y LM Studio, con etiquetas para vLLM y SGLang. La licencia declarada es Apache 2.0 y el repositorio ocupa 5,1 GB.

Hay una discrepancia importante que el lector debe tener en cuenta: el campo de parámetros totales en safetensors indica 736.844.288 parámetros (unos 0,74 mil millones), mientras que el nombre y las etiquetas del modelo apuntan a una base de 27B. No hay información en los datos disponibles que resuelva esa contradicción, por lo que las cifras de tamaño deben tratarse con cautela hasta verificar los archivos reales del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8, según etiquetas y modelos base); detalles de capas y atención no disponibles |
| Parametros totales | 736.844.288 según safetensors; las etiquetas y el nombre indican base Qwen3.8-27B (discrepancia sin resolver en la información disponible) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (la etiqueta `long-context` sugiere ventana extendida, sin cifra publicada) |
| Tipos de cuantizacion | no disponible (formato GGUF; niveles concretos Q4, Q5, Q8 no listados en la información) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio etiquetado también para llama.cpp, LM Studio, vLLM y SGLang) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de su origen en la familia Qwen3.8 y de la relación `merge` declarada con ocho modelos base: unsloth/Qwen3.8-27B, RadixArk/DaisyRose-27B, harness-hub/Qwen3.8-27B-super-adapter, bottlecapai/ThinkingCap-Qwen3.8-27B, ukisai/Swift-1.5-Qwen3.8-27b, Shockem/Qwen3.8-27b-Terse-Coder-LoRA, syaikhipin/Qwen3.8-27B-3D-Coder y 3dcodeverse/3dcodeverse-qwen3.8-27b-lora. La model card no documenta el método de fusión (por ejemplo, TIES, DARE o simple linear merge), ni los hiperparámetros, ni si hubo etapas posteriores de ajuste.

Tampoco se publican datos de entrenamiento: número de tokens, composición del corpus, uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Las etiquetas del repositorio (`agentic`, `agentic-coding`, `3d-generation`, `blender`, `threejs`, `glsl`, `software-engineering`, `long-context`) son la única indicación de la especialización pretendida, y deben interpretarse como intención del autor, no como resultados verificados.

## Capacidades

- Generación de texto y código en el pipeline `text-generation`.
- Especialización declarada en código para generación 3D: scripts de Blender, escenas Three.js y shaders GLSL.
- Ingeniería de software general, según la etiqueta `software-engineering`.
- Flujos agénticos y codificación agéntica (`agentic`, `agentic-coding`), presumiblemente con soporte de razonamiento multi-paso; no se detalla el soporte concreto de tool calling o function calling.
- Contexto largo (`long-context`), sin cifra de ventana publicada.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Generación de scripts de Blender: el modelo puede producir código Python para la API `bpy` a partir de una descripción de escena, lo que encaja con la etiqueta `blender` y con el propósito declarado del merge.
- Prototipado de escenas Three.js: generación de código JavaScript de escena, materiales y animaciones para aplicaciones web 3D, aprovechando la etiqueta `threejs`.
- Escritura de shaders GLSL: creación y depuración de vertex y fragment shaders para efectos visuales, coherente con la etiqueta `glsl`.
- Asistencia en pipelines de ingeniería de software: revisión, refactorización y generación de pruebas en proyectos con código 3D o gráfico, apoyándose en la etiqueta `software-engineering`.
- Agentes de codificación multi-paso: tareas que requieren planificación y varias llamadas a herramientas, si el soporte de tool calling se confirma en pruebas; la etiqueta `agentic-coding` lo sugiere pero no lo garantiza.
- Procesamiento de repositorios o documentación extensa: uso de la ventana de contexto largo declarada para analizar varios archivos o especificaciones en una sola pasada.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU de datacenter, siempre que el tamaño real de los pesos lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con fiabilidad, debido a la discrepancia entre los 736.844.288 parámetros declarados en safetensors y la base Qwen3.8-27B indicada en las etiquetas. Si los pesos reales corresponden a 27B, una cuantización de 4 bits requeriría del orden de 14-16 GB de VRAM; si corresponden a 0,74B, bastarían unos 1-2 GB en 4 bits. Verificar los archivos del repositorio antes de dimensionar.
- GPU recomendadas: no disponibles en la información. Como referencia genérica para un modelo de 27B en 4 bits, se suelen emplear RTX 4090 (24 GB), A100 40/80 GB y H100; para un modelo de 0,74B, cualquier GPU consumer reciente es suficiente.
- Cabe en GPU consumer: probable en formato GGUF, pero depende del tamaño real de los pesos; no confirmado.
- Opciones de despliegue: llama.cpp, LM Studio, vLLM y SGLang, según las etiquetas del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hermes-3D-Coder-LoRA-GGUF | 736.844.288 (safetensors) / base 27B según etiquetas | no disponible | Apache 2.0 | GGUF | Merge de 8 LoRAs y adaptadores; especializado en 3D y código agéntico |
| unsloth/Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | safetensors y variantes | Modelo base principal del merge; sin especialización 3D declarada |
| syaikhipin/Qwen3.8-27B-3D-Coder | 27B (según nombre) | no disponible | no disponible | no disponible | Uno de los componentes del merge; especializado en 3D |
| bottlecapai/ThinkingCap-Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible | Componente del merge orientado a razonamiento |

Los datos de los modelos comparados provienen únicamente de sus nombres y de la lista de modelos base; no se dispone de benchmarks ni de especificaciones verificadas para una comparación cuantitativa.

## Limitaciones y advertencias

- Discrepancia de tamaño sin resolver: el campo de safetensors indica 736.844.288 parámetros frente a la base de 27B sugerida por el nombre y las etiquetas. Es imprescindible inspeccionar los archivos GGUF antes de asumir requisitos de memoria o calidad.
- Modelo de fusión sin evaluación publicada: no hay benchmarks, por lo que el rendimiento real en código 3D, agentes o contexto largo es desconocido.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la ausencia de datos de alineación (RLHF/DPO) documentados en la información disponible.
- Sesgos conocidos: no documentados; al no publicarse la composición del corpus de entrenamiento, no es posible evaluar sesgos lingüísticos, culturales o de código.
- Idiomas soportados no especificados; no se garantiza un rendimiento adecuado en castellano.
- Ventana de contexto no cuantificada: la etiqueta `long-context` no equivale a una cifra verificada de tokens.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero la cadena de licencias de los ocho modelos base debería revisarse individualmente antes de un despliegue en producción.
- Popularidad muy baja (47 descargas y 1 like en el momento de la consulta) y fecha de creación reciente; no hay evidencia de comunidad ni de mantenimiento.
- El repositorio incluye HTML y CSS embebido en la model card; no afecta a los pesos, pero conviene revisar el contenido antes de integrarlo en documentación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ponzles/Hermes-3D-Coder-LoRA-GGUF
- Modelo base principal: https://huggingface.co/unsloth/Qwen3.8-27B
- RadixArk/DaisyRose-27B: https://huggingface.co/RadixArk/DaisyRose-27B
- harness-hub/Qwen3.8-27B-super-adapter: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- bottlecapai/ThinkingCap-Qwen3.8-27B: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- ukisai/Swift-1.5-Qwen3.8-27b: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Shockem/Qwen3.8-27b-Terse-Coder-LoRA: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- syaikhipin/Qwen3.8-27B-3D-Coder: https://huggingface.co/syaikhipin/Qwen3.8-27B-3D-Coder
- 3dcodeverse/3dcodeverse-qwen3.8-27b-lora: https://huggingface.co/3dcodeverse/3dcodeverse-qwen3.8-27b-lora
