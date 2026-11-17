# avar6/NVIDIA-Nemotron-3-Ultra-550B-A55B-Base-gguf

## Resumen

NVIDIA-Nemotron-3-Ultra-550B-A55B-Base es un modelo de lenguaje de gran escala desarrollado por NVIDIA, distribuido originalmente en BF16 y cuantizado a GGUF por el usuario avar6. Se trata de la versión *base* (no instruida) del checkpoint Nemotron 3 Ultra, con 549.308.993.536 parámetros totales según los safetensors del modelo original. El sufijo A55B indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 55 mil millones de parámetros activos por token, aunque este dato concreto no se confirma de forma explícita en la información disponible.

La relevancia de este repositorio es práctica: permite ejecutar un modelo de ~550B parámetros en entornos de inferencia local mediante llama.cpp, gracias a cuantizaciones mixtas optimizadas con imatrix. El autor indica que las cuantizaciones siguen el mismo esquema que las de Aes Sedai para la versión instruct, y advierte de que a fecha de creación (10 de junio de 2026) llama.cpp requiere un parche para cargar GGUF de Nemotron Ultra.

Es importante subrayar que se trata de un checkpoint base, no ajustado por instrucciones. El autor documenta artefactos y cadenas extrañas en chat completions, y recomienda usar text completions con una plantilla ChatML específica (incluida en la model card) para obtener respuestas coherentes. El repositorio ocupa 277,7 GB y acumula 53 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo mezcla de expertos (MoE), segun el sufijo A55B del nombre; detalles no disponibles |
| Parametros totales | 549.308.993.536 (~549,3B) |
| Parametros activos | ~55B (inferido del sufijo A55B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixto optimizado con imatrix (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelo base original en BF16 safetensors) |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que el modelo original es `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-Base-BF16`, con 549.308.993.536 parámetros totales. El patrón de nomenclatura de NVIDIA ("A55B") corresponde convencionalmente a una arquitectura MoE con unos 55B parámetros activos, pero no se dispone de detalles verificados sobre número de expertos, dimensión oculta, número de capas ni mecanismo de enrutamiento.

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), ni sobre si hubo fases de RLHF, DPO o similares; al ser un checkpoint base, es esperable que no incluya ajuste por preferencias, pero esto no se confirma en la información proporcionada. La innovación técnica documentada en este repositorio es la cuantización: GGUF mixto con matriz de importancia (imatrix) generada por Aes Sedai, reutilizando el esquema y los comandos de sus cuantizaciones para la versión instruct de Nemotron Ultra.

## Capacidades

- Generación de texto autoregresiva como modelo base; no está ajustado para seguir instrucciones de forma nativa.
- Razonamiento y conocimiento general heredados del preentrenamiento de Nemotron 3 Ultra (sin datos de benchmarks disponibles).
- Conversación por turnos: el autor reporta que responde "suficientemente bien" en chat por turnos, aunque con artefactos y cadenas extrañas visibles en chat completions.
- Compatibilidad con text completions usando la plantilla ChatML documentada en la model card, con la que el autor indica que el modelo responde con normalidad.
- Soporte de *thinking mode*: la plantilla recomendada incluye `<think></think>` vacío, es decir, desactiva el razonamiento explícito.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponibles.
- Capacidades multilingües: no disponibles.
- Visión o audio: no disponible.

## Casos de uso

- Experimentación con modelos de ~550B en hardware de gama alta: las cuantizaciones GGUF permiten cargar el modelo con llama.cpp en configuraciones multi-GPU o con memoria unificada, algo inviable con el BF16 original en la mayoría de entornos.
- Fine-tuning y destilación sobre un checkpoint base: al no estar instruido, es un punto de partida adecuado para SFT/DPO propios sin tener que deshacer el alineamiento original.
- Investigación en cuantización: el repositorio sirve como referencia para estudiar el efecto de cuantizaciones mixtas con imatrix en modelos MoE de gran tamaño, comparando contra el BF16 de NVIDIA.
- Generación de texto libre y completado de documentos: usando text completions con la plantilla ChatML documentada, se puede emplear para continuación de texto técnico o narrativo.
- Rol-play y escritura creativa en entornos tipo SillyTavern: el autor documenta pruebas explícitas en SillyTavern sin modo razonamiento, lo que indica un uso viable aunque con artefactos.
- Evaluación comparativa de checkpoints base frente a instruct: útil para medir cuánto del rendimiento conversacional proviene del alineamiento y cuánto del preentrenamiento.
- Reproducción de pipelines de cuantización: los comandos e imatrix de Aes Sedai citados permiten replicar el proceso para otros checkpoints de la familia Nemotron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 277,7 GB, por lo que se necesita al menos esa cantidad de memoria agregada para cargar los pesos en la cuantización incluida; el BF16 original requeriría del orden de 1,1 TB (549,3B × 2 bytes) más overhead.
- GPU recomendadas: no disponibles de forma específica; por volumen de memoria, configuraciones multi-GPU con A100 80 GB, H100 80 GB o H200 son las opciones realistas. No cabe en una RTX 4090 (24 GB) ni en GPUs de consumo individuales.
- Cabe en consumer GPU: no, salvo configuraciones con memoria unificada muy grande (por ejemplo, estaciones con RAM del orden de 300 GB o más) y offloading parcial, con latencia muy alta.
- Opciones de despliegue: llama.cpp (mainline, aunque el autor advierte que a fecha de junio de 2026 requiere parche para Nemotron Ultra); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Ultra-550B-A55B-Base (este GGUF) | ~549,3B | ~55B (inferido) | no disponible | GGUF mixto | no disponible | Base, no instruct; requiere parche de llama.cpp |
| nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-Base-BF16 | ~549,3B | ~55B (inferido) | no disponible | safetensors BF16 | no disponible | Checkpoint original de NVIDIA |
| Versión instruct de Nemotron Ultra (cuantizaciones de Aes Sedai) | ~549,3B | ~55B (inferido) | no disponible | GGUF | no disponible | Referencia de esquema de cuantización citada por el autor |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Es un checkpoint base, no instruido: no espera seguir instrucciones de forma fiable y puede producir continuaciones en lugar de respuestas.
- El autor reporta artefactos y cadenas extrañas en chat completions; el uso conversacional requiere text completions con la plantilla ChatML documentada.
- llama.cpp necesita parche para cargar GGUF de Nemotron Ultra según la model card (estado a 10 de junio de 2026); sin parche, el modelo puede no cargar.
- Licencia no especificada en la información disponible: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo base de NVIDIA antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación inherente a un modelo base sin alineamiento; no se han publicado evaluaciones de sesgo o seguridad.
- El repositorio tiene muy poca tracción (53 descargas, 1 like), por lo que la validación comunitaria es mínima.
- El tamaño de 277,7 GB implica requisitos de almacenamiento y memoria considerables, además de tiempos de carga elevados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/avar6/NVIDIA-Nemotron-3-Ultra-550B-A55B-Base-gguf
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-Base-BF16
- llama.cpp (requiere parche según el autor): https://github.com/ggerganov/llama.cpp
- Referencia de cuantizaciones de Aes Sedai para Nemotron Ultra instruct: no disponible
