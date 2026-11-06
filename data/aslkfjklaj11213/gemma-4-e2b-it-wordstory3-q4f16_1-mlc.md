# aslkfjklaj11213/gemma-4-E2B-it-wordstory3-q4f16_1-MLC

## Resumen

`gemma-4-E2B-it-wordstory3-q4f16_1-MLC` es una versión modificada del modelo `google/gemma-4-E2B-it`, publicada por el usuario `aslkfjklaj11213` en Hugging Face. Se trata de un fine-tuning con LoRA (r=16, 3 épocas, fusionado a escala 1.0) sobre 300 cuentos infantiles cortos en coreano, escritos específicamente para este proyecto con vocabulario de diccionario común. El objetivo es que el modelo, dado un conjunto de 6-8 palabras en inglés con sus significados en coreano, genere un título, una trama de una línea, un cuento corto con marcadores `{english|korean}` por cada palabra y una descripción de imagen en inglés para cada término.

El modelo está empaquetado en el formato q4f16_1 de MLC-LLM, reutilizando el layout de ficheros de `mlc-ai/gemma-4-E2B-it-q4f16_1-MLC`. Solo difieren los pesos lineales de las capas de texto (q/k/v/o, gate_up, down) respecto a ese repositorio, por lo que debe usarse con la misma librería de modelos de WebLLM (`gemma-4-E2B-it-q4f16_1`). El repositorio ocupa 2,9 GB e incluye el adaptador LoRA sin fusionar en el subdirectorio `lora-adapter/`.

La relevancia de esta ficha es doble: por un lado, documenta un caso de fine-tuning muy especializado (generación de material didáctico para un juego de palabras) sobre un modelo base Gemma 4; por otro, sirve como ejemplo de flujo de trabajo completo de adaptación, fusión y recuantización para su despliegue en el navegador mediante WebLLM. La información pública disponible es escasa y procede casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-E2B-it); detalles no disponibles |
| Parametros totales | no disponible (el nombre "E2B" sugiere ~2B efectivos, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (4 bits de peso, activaciones en fp16) |
| Idiomas soportados | coreano (ko); el modelo base probablemente multilingüe, pero la ficha solo declara ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con layout MLC-LLM (q4f16_1), compatible con WebLLM |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `google/gemma-4-E2B-it`, un transformer de la familia Gemma 4. La model card no detalla la arquitectura interna (número de capas, dimensiones, mecanismo de atención ni si emplea mezcla de expertos), por lo que esos datos deben consultarse en la ficha del modelo base. El proceso de adaptación consistió en un fine-tuning con LoRA de rango 16 durante 3 épocas sobre un corpus de 300 cuentos infantiles cortos en coreano, redactados ad hoc para el proyecto y restringidos a vocabulario de diccionario común. El adaptador se fusionó con los pesos base a escala 1.0 y el resultado se recuantizó al formato q4f16_1 mediante la herramienta `tools/finetune/mlc_patch.py`.

La innovación técnica destacable no está en la arquitectura, sino en el pipeline de despliegue: el modelo resultante conserva el layout exacto de ficheros de `mlc-ai/gemma-4-E2B-it-q4f16_1-MLC`, de modo que puede cargarse con la misma librería de modelos de WebLLM sin cambios en el runtime. Solo se sustituyen los pesos lineales de las capas de texto (q, k, v, o, gate_up y down), lo que permite un intercambio limpio del modelo en aplicaciones web. No se documenta el uso de RLHF, DPO ni otras fases de alineación adicionales más allá del ajuste supervisado descrito.

## Capacidades

- Generación de texto creativo en coreano: cuentos cortos con estructura narrativa (título, trama de una línea, cuerpo del cuento).
- Inserción controlada de marcadores léxicos con el formato `{english|korean}` para cada palabra objetivo, eligiendo el orden de aparición de forma autónoma.
- Generación de descripciones de imágenes en inglés para cada palabra del conjunto de entrada.
- Manejo de entradas consistentes en 6-8 palabras en inglés con sus significados en coreano.
- Capacidades heredadas del modelo base (razonamiento, código, matemáticas, tool calling, multilingual) potencialmente presentes, pero no verificadas ni documentadas en esta versión; el fine-tuning puede haberlas degradado parcialmente.
- Modo "thinking" u otras capacidades especiales del modelo base: no disponible en la información proporcionada.

## Casos de uso

- Generación de contenido para juegos de palabras educativos: el modelo recibe una lista de 6-8 palabras en inglés con su traducción al coreano y produce un cuento con marcadores `{english|korean}` listos para ser renderizados por el motor del juego, tal como se usa en el repositorio `areweloststars/-`.
- Aplicaciones de aprendizaje de idiomas en el navegador: al estar empaquetado para WebLLM, puede ejecutarse del lado del cliente sin backend, generando ejercicios personalizados de vocabulario a partir de listas que el usuario introduzca.
- Prototipado rápido de material didáctico infantil: un docente o creador de contenido puede obtener en una sola pasada título, sinopsis, cuento y descripciones de imágenes para ilustrar cada palabra.
- Demostraciones de fine-tuning y despliegue en edge: sirve como ejemplo reproducible de adaptación LoRA, fusión y recuantización MLC para llevar un modelo Gemma 4 a WebGPU.
- Generación de descripciones de escenas para pipelines de ilustración: las descripciones en inglés por palabra pueden alimentar modelos de difusión para crear imágenes asociadas a cada término.
- Investigación sobre personalización de modelos pequeños: permite estudiar cómo un ajuste con solo 300 ejemplos afecta al comportamiento del modelo base en una tarea muy concreta, y comparar con el modelo original.
- Pruebas de sustitución de pesos en WebLLM: útil para validar que el intercambio de pesos lineales en el layout q4f16_1 funciona correctamente en aplicaciones web existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 2,9 GB en cuantización q4f16_1; se puede estimar un consumo en torno a 3-4 GB de memoria al cargar el modelo, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible de forma explícita. Por el formato WebLLM, está pensado para ejecutarse en el navegador mediante WebGPU.
- Compatibilidad con GPU de consumo: probable en GPUs con soporte WebGPU y al menos 4 GB de VRAM (por ejemplo, integradas recientes y dedicadas de gama media), aunque no se documenta una lista oficial.
- Opciones de despliegue: WebLLM (librería de modelos `gemma-4-E2B-it-q4f16_1`) y, en general, el runtime de MLC-LLM; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aslkfjklaj11213/gemma-4-E2B-it-wordstory3-q4f16_1-MLC | no disponible | no disponible | q4f16_1 | Apache 2.0 | Hugging Face, WebLLM |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | completa (original) | Apache 2.0 | Hugging Face |
| mlc-ai/gemma-4-E2B-it-q4f16_1-MLC | no disponible | no disponible | q4f16_1 | Apache 2.0 | Hugging Face, WebLLM |

La comparación se limita a estos tres artefactos porque la información proporcionada no incluye datos de rendimiento ni de arquitectura que permitan contrastar con otras familias de modelos del mismo tamaño. La diferencia principal entre ellos es el fine-tuning coreano y la sustitución de pesos lineales en la versión `wordstory3`.

## Limitaciones y advertencias

- El fine-tuning se ha realizado exclusivamente sobre 300 cuentos en coreano; es probable que el modelo haya perdido parte de sus capacidades generales del modelo base (razonamiento, código, otros idiomas).
- La ficha solo declara soporte de coreano; el uso en castellano u otros idiomas no está validado y puede producir resultados deficientes.
- Riesgo de alucinación y de desviación del formato `{english|korean}` fuera del dominio de entrenamiento; no hay evaluación publicada de robustez.
- El modelo está diseñado para una tarea muy concreta (juego de palabras con 6-8 términos); su uso fuera de ese contexto no está garantizado.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `google/gemma-4-E2B-it` antes de un uso comercial, ya que las licencias de los modelos Gemma pueden incluir términos adicionales.
- El repositorio tiene muy pocas descargas (11) y ningún "like", por lo que no cuenta con validación comunitaria.
- La fecha de creación indicada (2026-10-28) es futura respecto a la información habitual disponible; conviene contrastar la integridad del artefacto antes de usarlo en producción.
- El adaptador LoRA original está incluido en `lora-adapter/`; si se reutiliza, debe aplicarse sobre la revisión exacta del modelo base indicada (`3e22461f65e89153144f8adb70e3b8c2cc9845a7`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aslkfjklaj11213/gemma-4-E2B-it-wordstory3-q4f16_1-MLC
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio MLC de referencia: https://huggingface.co/mlc-ai/gemma-4-E2B-it-q4f16_1-MLC
- Proyecto del juego de palabras: https://github.com/areweloststars/-
- WebLLM: https://github.com/mlc-ai/web-llm
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
