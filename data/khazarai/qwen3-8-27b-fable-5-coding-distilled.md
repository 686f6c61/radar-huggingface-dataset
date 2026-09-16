# khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled

## Resumen

Qwen3.8-27B-Fable-5-Coding-Distilled es un ajuste fino (fine-tune) del modelo denso Qwen/Qwen3.8-27B, publicado por el usuario khazarai en HuggingFace. Su objetivo declarado es desplazar el comportamiento del modelo base desde cadenas de razonamiento largas y especulativas hacia un razonamiento "anclado" (grounded) que inspecciona ficheros, verifica supuestos contra el estado real del proyecto y evita proponer arreglos basados en conjeturas. Está orientado a tareas de codificación, depuración y uso agéntico de herramientas (shell, arneses de test, CI y lint).

El modelo cuenta con 27.781.427.952 parámetros totales (~27,8 mil millones) según los pesos en safetensors, con un repositorio de 55,6 GB, lo que corresponde a pesos en precisión de 16 bits. Se distribuye bajo licencia Apache 2.0 y declara únicamente inglés como idioma soportado, tanto para código como para lenguaje natural. El entrenamiento se realizó sobre 195 millones de tokens de trazas de razonamiento destiladas, según la model card.

La relevancia de esta ficha es limitada pero informativa: se trata de una publicación con cero descargas y un solo "like", cuya propia model card contiene marcadores de plantilla sin rellenar ("fill in / verify before publishing") en apartados clave como licencia heredada, composición del dataset, hiperparámetros y hardware. Además, el nombre del repositorio ("Fable-5") no coincide con el título de la model card ("Qwen3.8-27B-Coding-Distilled"), y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta de arquitectura qwen3_5 en HuggingFace); número de capas, tipo de atención y detalles internos no disponibles |
| Parámetros totales | 27.781.427.952 (~27,8 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card indica que hereda la ventana del modelo base, sin confirmar el valor) |
| Tipos de cuantización | No se publican pesos cuantizados en el repositorio; solo safetensors. La cuantización posterior (GGUF, GPTQ, AWQ) requeriría herramientas externas |
| Idiomas soportados | Inglés (código y lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 55,6 GB) |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B |
| Dataset de entrenamiento | DSFFGFG456/fable-5-coding-and-debugging-traces (195 millones de tokens) |
| Biblioteca | transformers |
| Fecha de publicación | 15 de septiembre de 2026 (última actualización: 15 de septiembre de 2026) |

## Arquitectura y entrenamiento

Se trata de un fine-tune sobre un modelo denso de aproximadamente 27,8 mil millones de parámetros. La model card describe el modelo base como denso y de ~27B parámetros con licencia Apache 2.0, y la etiqueta de arquitectura declarada en HuggingFace es qwen3_5. No se especifican en la información disponible el número de capas, la dimensionalidad, el tipo de atención, la estrategia de posicionamiento ni si se aplicaron variantes como atención lineal o híbrida.

El método de entrenamiento es destilación sobre trazas de razonamiento curadas, con un volumen declarado de 195 millones de tokens. La model card deja el método concreto (SFT frente a LoRA) sin cerrar, ya que el campo aparece con una anotación de plantilla sin completar. El dataset asociado se identifica como DSFFGFG456/fable-5-coding-and-debugging-traces. El objetivo de la destilación es reforzar tres comportamientos: leer y verificar el estado del proyecto (ficheros, arneses de test, configuración de CI) antes de proponer un arreglo; trabajar dentro de las restricciones de código y formato de salida existentes en lugar de reescribir por defecto; y producir razonamiento conciso apoyado en evidencia en lugar de cadenas especulativas largas. No se documentan hiperparámetros, composición detallada de la mezcla de datos, procedencia de las trazas, ni fases de RLHF o DPO.

## Capacidades

- Generación de código y razonamiento orientado a tareas de ingeniería de software, según el enfoque declarado del ajuste.
- Razonamiento agéntico con uso de herramientas: la model card menciona explícitamente el uso de shell, arneses de test y flujos de CI/lint.
- Depuración y análisis de causa raíz: el ejemplo documentado describe una tarea de depuración agéntica sobre un script de shell con errores de entrecomillado en un pipeline de CI.
- Inspección de estado antes de actuar: comportamiento entrenado para leer ficheros y verificar supuestos mediante llamadas a herramientas en lugar de inferirlos.
- Revisión de código y refactorización sujetas a restricciones del proyecto existente, incluida la preservación de formatos de salida fijados por la tarea.
- Capacidad multimodal de entrada: el pipeline declarado en HuggingFace es image-text-to-text, aunque la model card no describe ni documenta ninguna capacidad de visión, y los idiomas declarados se limitan al inglés.
- No se documentan en la información disponible capacidades de audio, modo "thinking" explícito, decodificación especulativa ni soporte multilingüe más allá del inglés.
- No se documenta de forma explícita el soporte de function calling en formato propietario o estandarizado; la única referencia es el uso de herramientas dentro de trazas agénticas destiladas.

## Casos de uso

- Asistente de codificación agéntico en terminal: el modelo está entrenado para inspeccionar el repositorio (ficheros, configuración, estado de tests) antes de proponer cambios, lo que encaja en agentes que operan sobre un árbol de trabajo real y necesitan minimizar reescrituras destructivas.
- Depuración de fallos en pipelines de CI: dado el ejemplo documentado de un pipeline que falla por errores de entrecomillado en un script de shell, el modelo puede analizar la traza de error, leer el script y el arnés de test, y proponer una corrección que respete el formato de salida fijado por la tarea.
- Análisis de causa raíz sobre errores de lint y formato: el ajuste se orienta a trabajar dentro de restricciones existentes, lo que resulta adecuado para tareas de corrección acotada donde no se permite reformatear el resto del código.
- Revisión de código en un repositorio existente: puede usarse como revisor que verifica el estado real de los ficheros antes de comentar, reduciendo observaciones basadas en supuestos sobre el contenido del proyecto.
- Reparación de tests rotos: el modelo puede leer el arnés de test, localizar la discrepancia con el código de producción y proponer un cambio acotado, siempre que se le proporcione acceso a herramientas de lectura y ejecución en un entorno controlado.
- Automatización de tareas de mantenimiento de scripts de shell y utilidades de línea de comandos: corrección de errores de comillas, gestión de códigos de salida y robustez ante fallos, dentro del dominio declarado de depuración agéntica.
- Integración en flujos de trabajo de CI/CD como paso de diagnóstico: dado que el modelo no ejecuta código por sí mismo y no incluye sandbox, encajaría como componente de análisis que propone parches que un sistema externo valida y aplica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, SWE-bench ni ninguna otra métrica cuantitativa, y la única evidencia de comportamiento es un ejemplo cualitativo de comparación entre el modelo ajustado y el base en una tarea de depuración de scripts de shell en CI.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para los pesos (27,78 mil millones de parámetros × 2 bytes), más memoria para caché KV y activaciones. El tamaño del repositorio (55,6 GB) es coherente con esta cifra.
- VRAM estimada en cuantización de 8 bits: en torno a 28 GB para los pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: en torno a 14 GB para los pesos, más overhead. Estas cifras son estimaciones aritméticas a partir del número de parámetros, no valores medidos publicados por el autor.
- GPU recomendadas para precisión completa: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× A100 40 GB con sharding).
- Compatibilidad con GPU de consumo: un modelo denso de ~27,8B en 4 bits puede entrar en GPUs de 24 GB como la RTX 4090 o la RTX 3090, siempre que se genere o descargue una cuantización GGUF/AWQ/GPTQ, ya que el repositorio solo contiene safetensors.
- Opciones de despliegue: transformers es la biblioteca declarada. vLLM y TGI son viables con los pesos safetensors en precisión completa o cuantización compatible. llama.cpp y Ollama requerirían una conversión a GGUF que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad, tokens por segundo ni requisitos de hardware de entrenamiento.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables en la documentación proporcionada. La única referencia directa disponible es el modelo base del que deriva este ajuste, que se recoge en la tabla siguiente. No se han facilitado datos de otros fine-tunes de codificación comparables, por lo que sus cifras figuran como no disponibles.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled | 27,78 mil millones (denso) | No disponible | Fine-tune de codificación y depuración agéntica sobre 195M tokens destilados | Apache 2.0 | Público en HuggingFace (0 descargas, 1 like) |
| Qwen/Qwen3.8-27B (base) | ~27B (denso) | No disponible | Modelo base de propósito general | Apache 2.0 | Público en HuggingFace |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Model card incompleta: contiene marcadores de plantilla sin rellenar para la licencia heredada, la composición y procedencia del dataset, los hiperparámetros de entrenamiento y el hardware utilizado, además de una advertencia explícita del autor pidiendo verificar esos campos antes de publicar.
- Inconsistencia de nomenclatura: el identificador del repositorio menciona "Qwen3.8-27B-Fable-5-Coding-Distilled" mientras que la model card se titula "Qwen3.8-27B-Coding-Distilled", y el dataset asociado también lleva el sufijo "fable-5". Esta discrepancia dificulta la trazabilidad de la publicación.
- Ausencia total de benchmarks: no hay métricas publicadas que permitan validar la mejora declarada frente al modelo base.
- Sesgo de dominio: el ajuste se centró en trazas de codificación y depuración agéntica. El propio autor advierte que no está pensado como asistente de chat de propósito general sin una evaluación adicional, y que la calidad en razonamiento no relacionado con código no se ha evaluado por separado.
- Riesgo de alucinación: la model card reconoce que el modelo hereda las limitaciones del base, incluida la posibilidad de alucinar en bases de código desconocidas.
- Ausencia de sandbox de ejecución: el modelo no ejecuta código por sí mismo ni aísla las acciones que propone, por lo que cualquier despliegue agéntico debe incorporar validación y sandbox externos.
- Idioma: solo se declara inglés, tanto para código como para lenguaje natural. No hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto sin confirmar: la model card afirma que hereda la ventana del base, pero no especifica el valor, lo que impide planificar despliegues que dependan de contexto largo.
- Riesgo de comportamiento fuera de distribución: al ser un fine-tune especializado, su comportamiento en tareas ajenas a shell, CI y arneses de test debe validarse antes de usarlo en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el propio autor marca esta herencia del modelo base como pendiente de confirmar.
- Madurez: cero descargas y un solo "like" en el momento de redactar esta ficha; no existe validación por parte de la comunidad.
- Coherencia de modalidad: el pipeline declarado es image-text-to-text, pero la model card no describe capacidades de visión, lo que sugiere una etiqueta posiblemente heredada del modelo base sin verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/DSFFGFG456/fable-5-coding-and-debugging-traces
- Búsqueda web realizada: no se han encontrado resultados relevantes sobre este modelo. Los resultados devueltos corresponden a páginas de conversión de audio no relacionadas con el modelo ni con su autor.
