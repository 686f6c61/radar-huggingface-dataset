# infosave/cmf

## Resumen

CMF (Cortiq Model Format) es un formato de archivo autocontenido para modelos de lenguaje cuantizados, desarrollado por infosave. A diferencia de un modelo de IA, CMF es un contenedor que empaqueta en un único archivo los pesos cuantizados, el tokenizador y la plantilla de chat, junto con metadatos de integridad y firma opcional. El runtime asociado, escrito en Rust, no depende de ningún framework de machine learning (ni Python, ni torch, ni CUDA), y ejecuta los modelos directamente desde disco mediante memoria mapeada, tanto en CPU como en GPU a través de wgpu (Vulkan, DX12 y Metal).

El formato resuelve el problema de la distribución y ejecución de modelos en entornos heterogéneos: elimina la necesidad de instalar dependencias pesadas, permite verificar la integridad de los pesos con hashes por tensor y soporta características avanzadas como máscaras por tarea, "swarms of skills" (varios especialistas compartiendo un mismo backbone) y atención streaming que no crece con la longitud del contexto. Su relevancia actual radica en la creciente demanda de despliegue local en dispositivos móviles y de bajo consumo, donde los formatos tradicionales como safetensors o GGUF requieren capas adicionales de software. La especificación está en versión v2 y evoluciona de forma aditiva, con una lista de modelos publicados que incluye desde 1.7B hasta 1T de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Formato de contenedor autocontenido (no es un modelo); soporta modelos densos, MoE, BitNet y generativos (imagen, video) |
| Parametros totales | No aplica (el formato no define un modelo concreto; los modelos publicados van de 1.7B a 1T) |
| Parametros activos | No aplica (depende del modelo empaquetado) |
| Longitud de contexto | No definida por el formato; depende del modelo. Incluye un operador de atención streaming con estado de tamaño fijo (opción `--o1`) |
| Tipos de cuantizacion | Escalera documentada en FORMATS.md: q4tp, q2tp, q1t, q8, entre otros; la precisión se decide por familia de tensores |
| Idiomas soportados | No disponible (depende del modelo empaquetado) |
| Licencia | Apache-2.0 |
| Formato de pesos | .cmf (propietario, autocontenido; incluye pesos, tokenizador, chat template, hashes y firma opcional) |

## Arquitectura y entrenamiento

CMF no es un modelo entrenado, sino un formato de serialización y un runtime. El archivo .cmf es un "sobre" (envelope) con cabecera navegable: los lectores acceden a los offsets directamente, sin adivinar posiciones, y los campos de cabecera desconocidos se ignoran, lo que permite evoluciones aditivas sin romper compatibilidad. El runtime está implementado en Rust sin dependencias de frameworks ML, y ejecuta los modelos mediante memory-mapping, lo que permite arranque inmediato y cero copias en memoria.

Una innovación destacada es la atención streaming (opción `--o1`): reemplaza la atención softmax de una capa por un operador con estado de tamaño fijo que mantiene un conjunto de "anchor keys" exactos, una ventana reciente exacta y un "landmark sketch" del resto, todo bajo un denominador común. Los pesos son byte-idénticos; la opción solo registra una pista en la cabecera. Además, el formato permite empaquetar múltiples especialistas (skills) que comparten un backbone, seleccionados en tiempo de carga, y soporta modelos generativos de imagen y video en el mismo contenedor. No se dispone de información sobre datos de entrenamiento, número de tokens o técnicas de alineación (RLHF/DPO), ya que el repositorio no contiene pesos propios.

## Capacidades

- Ejecución de modelos cuantizados en CPU (cualquier plataforma) y GPU mediante wgpu (Vulkan, DX12, Metal) sin instalar CUDA ni frameworks ML.
- Verificación de integridad por tensor mediante `cortiq verify`, con hashes individuales y firma Ed25519 opcional.
- Conversión de checkpoints a CMF con un solo comando: `cortiq convert --model Qwen/Qwen3-0.6B --quant q8 --output qwen.cmf`.
- Soporte de máscaras por tarea que seleccionan un subconjunto activo de los pesos compartidos, y "swarm of skills" (varios especialistas en un solo archivo, elegidos en tiempo de carga).
- Atención streaming con estado de tamaño fijo (opción `--o1`), que evita el crecimiento cuadrático del contexto.
- Generación de texto, imagen (`cortiq imagine`) y video con audio sincronizado (`cortiq animate`, `cortiq ltx-video`) desde el mismo runtime.
- Despliegue en móvil (Android e iOS) mediante la app Cortiq: chat local, conversión de repos HF en el dispositivo y servidor OpenAI-compatible en LAN.
- Compatibilidad con modelos de gran tamaño mediante `cortiq worker` en escritorio: por ejemplo, un MoE de 34.7B a 16.3 tok/s con 2 GB libres en el móvil.

## Casos de uso

- Inferencia local en dispositivos móviles: la app Cortiq permite cargar un archivo .cmf directamente en el teléfono y conversar sin conexión, ideal para aplicaciones de asistente personal privado o consulta de documentación técnica en campo.
- Despliegue en entornos sin GPU ni stack de Python: al no requerir torch ni CUDA, un binario estático de Rust puede ejecutarse en servidores minimalistas, contenedores ligeros o incluso en routers y dispositivos embebidos con CPU x86/ARM.
- Distribución de modelos con verificación de integridad: gracias a los hashes por tensor y la firma Ed25519, un equipo puede distribuir pesos a través de CDNs o redes P2P garantizando que no han sido alterados, útil en entornos regulados o de alta seguridad.
- Servicio de modelos en LAN con API compatible con OpenAI: `cortiq run` expone un endpoint OpenAI-compatible, lo que permite integrar el modelo en herramientas existentes (chatbots, agentes, plugins) sin modificar el código cliente.
- Ejecución de modelos de código en pipelines de CI/CD: modelos como KAT-Coder-V2.5 (34.7B-A3B MoE) en formato CMF pueden ejecutarse en runners sin GPU, ofreciendo generación de código y tool calling con una huella de memoria reducida gracias a la cuantización y la atención streaming.
- Prototipado rápido de agentes multi-turno con contexto largo: la atención streaming permite mantener conversaciones extensas sin que el uso de memoria crezca con el historial, adecuado para asistentes de soporte o análisis de documentos largos.
- Generación de imagen y video en local: con `cortiq imagine` y `cortiq animate` se pueden producir imágenes y clips de video con audio desde un solo archivo, sin depender de servicios cloud, para proyectos de diseño o prototipado audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye números de MMLU, HumanEval, GSM8K ni similares. La model card menciona cifras de rendimiento medidas para modelos concretos (por ejemplo, Bonsai-27B a 40 tok/s en RTX 4090, o un MoE de 34.7B a 16.3 tok/s en móvil con 2 GB libres), pero estos datos corresponden a modelos específicos empaquetados en CMF, no al formato en sí, y no se detallan las condiciones de medición.

## Requisitos de hardware

- Inferencia en CPU: cualquier procesador moderno; el runtime Rust es ligero y no requiere GPU. El consumo de RAM depende del tamaño del archivo .cmf (por ejemplo, Bonsai-1.7B ocupa 0.33 GB, Bonsai-27B 5.10 GB).
- Inferencia en GPU: soporta Vulkan, DX12 y Metal mediante wgpu, lo que cubre GPUs NVIDIA, AMD, Intel y Apple Silicon. No se requiere CUDA.
- Móvil: Android e iOS; la app Cortiq incluye el runtime como biblioteca nativa. Para modelos mayores que la memoria del dispositivo, se puede emparejar con `cortiq worker` en un escritorio.
- Opciones de despliegue: `cortiq-cli` (binario precompilado para seis plataformas), `cortiq run`, `cortiq verify`, `cortiq convert`, `cortiq imagine`, `cortiq animate`, `cortiq ltx-video`, y servidor OpenAI-compatible.
- Latencia y throughput: no disponibles de forma general; los únicos datos citados son ejemplos puntuales (34.7B MoE a 16.3 tok/s en móvil con worker, 40 tok/s para Bonsai-27B en RTX 4090).

## Comparativa con modelos similares

La comparación relevante no es con otros modelos, sino con otros formatos de serialización y runtime para LLMs. A continuación se comparan CMF con GGUF y safetensors:

| Caracteristica | CMF | GGUF | safetensors |
|---|---|---|---|
| Contenido del archivo | Pesos + tokenizador + chat template + hashes + firma | Pesos + tokenizador + chat template (en algunos casos) | Solo pesos (tensores) |
| Runtime incluido | Sí (Rust, sin dependencias ML) | No (requiere llama.cpp, Ollama, etc.) | No (requiere PyTorch u otro framework) |
| Ejecución en GPU | Sí, via wgpu (Vulkan, DX12, Metal) | Sí, via CUDA/Metal (depende del backend) | Sí, via CUDA/ROCm |
| Verificación de integridad | Hashes por tensor + firma Ed25519 | No estándar | No estándar |
| Soporte de skills/máscaras | Sí (nativo) | No | No |
| Atención streaming | Sí (opción `--o1`) | No (depende del modelo) | No |
| Licencia | Apache-2.0 | MIT (formato) | Apache-2.0 |
| Madurez | v2 estable, APIs en desarrollo | Ampliamente adoptado | Ampliamente adoptado |

## Limitaciones y advertencias

- El repositorio `infosave/cmf` no contiene pesos de modelos; es la página del formato. Los modelos listados en la model card están en repositorios separados.
- Las APIs del crate Rust pueden cambiar antes de la versión 1.0; no se garantiza estabilidad de interfaces de programación.
- La model card advierte explícitamente que las cifras de calidad reportadas en las tarjetas de modelos son "números medidos con el corpus nombrado, no estimaciones", pero el repositorio CMF no incluye mediciones propias.
- El formato es propietario (aunque de código abierto bajo Apache-2.0); la adopción es limitada en comparación con GGUF o safetensors, lo que puede dificultar la interoperabilidad con herramientas existentes.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas de los modelos empaquetados; estas dependen del modelo concreto, no del formato.
- La atención streaming (`--o1`) modifica el comportamiento de la atención; aunque los pesos son idénticos, los resultados pueden diferir de la atención softmax estándar en tareas que requieren recuperación exacta de información antigua.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/infosave/cmf
- Código fuente: https://github.com/infosave2007/cmf (Apache-2.0)
- Runtime en crates.io: https://crates.io/crates/cortiq-cli
- Página de releases: https://github.com/infosave2007/cmf/releases/latest
- App móvil Cortiq: https://play.google.com/store/apps/details?id=ai.cortiq.cmf_mobile
- Demo del convertidor: https://infosave-cmf-converter.hf.space/
- Space de demostración móvil: https://huggingface.co/spaces/infosave/cortiq-mobile
- Fuente de la app móvil: https://github.com/infosave2007/cmfmobile (Apache-2.0)
