# Lucasgitguy-co/minicpm-mermaid-gguf

## Resumen

MiniCPM-V 4.7 1B Mermaid — GGUF Q4_K_M es una distribución en formato GGUF de un modelo de visión-lenguaje (VLM) afinado para la conversión de imágenes de diagramas en código Mermaid. Lo publica el usuario Lucasgitguy-co en Hugging Face bajo licencia Apache 2.0 y está pensado para inferencia local: el repositorio empaqueta un modelo de lenguaje cuantizado en Q4_K_M (0,672 GB) junto con un proyector visual en F16 (1,109 GB), que deben cargarse conjuntamente para procesar imágenes.

El modelo parte de la familia MiniCPM-V 4.7, de la que hereda la arquitectura de visión-lenguaje y el pipeline `image-text-to-text`. El recuento de parámetros declarado en safetensors es de 1.780.767.008, aunque la model card no desglosa qué parte corresponde al componente de lenguaje y qué parte al codificador visual. El interés práctico del artefacto es que permite ejecutar un VLM especializado en diagramas en hardware de consumo mediante llama.cpp, sin depender de servicios en la nube.

La relevancia actual del modelo es acotada pero concreta: cubre la tarea de pasar de una imagen de diagrama (por ejemplo, un flowchart) a código Mermaid reproducible, con un tamaño total de repositorio de 3,6 GB y un flujo de despliegue documentado para Windows, Linux y macOS. La model card es explícita al señalar que no documenta datos de entrenamiento, procedimiento ni resultados de benchmarks en los artefactos inspeccionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en MiniCPM-V 4.7; pesos en GGUF con proyector visual separado |
| Parametros totales | 1.780.767.008 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) + F16 (proyector visual `mmproj`) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`model-Q4_K_M.gguf`, `mmproj-model-f16.gguf`, bundle `minicpm-mermaid-bundle.gguf`) |

## Arquitectura y entrenamiento

El repositorio distribuye un modelo de visión-lenguaje con la arquitectura de MiniCPM-V 4.7, empaquetado en dos artefactos GGUF: un modelo de lenguaje cuantizado en Q4_K_M y un proyector visual en F16 que actúa como adaptador entre la imagen y el modelo de lenguaje. El bundle `minicpm-mermaid-bundle.gguf` (1,781 GB) contiene ambos ficheros byte a byte, pero llama.cpp no puede ejecutarlo directamente porque requiere modelo y `mmproj` como dos ficheros separados; para ello se incluye el script `gguf_bundle.py`, que desempaqueta y verifica el sha256 de cada fichero.

La model card indica que los datos de entrenamiento, el procedimiento y los resultados de benchmarks no están documentados en los artefactos inspeccionados. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Los únicos indicios de procedencia son enlaces a recursos del proyecto: un dataset de texto e imágenes de diagramas Mermaid y una colección de texto original en inglés y neerlandés, que la propia card aclara que no establecen el split exacto de entrenamiento de cada checkpoint. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código Mermaid a partir de imágenes de diagramas (flujos, y presumiblemente otros tipos de diagrama) mediante el pipeline `image-text-to-text`.
- Comprensión de imagen y texto conjunta, al cargar el modelo de lenguaje junto con el proyector visual.
- Inferencia local en llama.cpp mediante `llama-mtmd-cli`, con soporte de entrada de imagen por fichero (`--image`).
- Ejecución en un único fichero opcional mediante el bundle, con desempaquetado verificado por sha256.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés (`en`) según los metadatos.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la información proporcionada.

## Casos de uso

- Conversión de diagramas a Mermaid en documentación técnica: dado un PNG o captura de un flowchart, el modelo genera el código Mermaid correspondiente, que se puede versionar en el repositorio junto a la documentación. Es el caso de uso principal y el único validado explícitamente en la card (se probó con una imagen de flowchart y produjo código Mermaid correcto).
- Reconstrucción de diagramas heredados: digitalizar diagramas embebidos en PDFs o capturas antiguas para migrarlos a documentación basada en texto y mantenerlos editables.
- Integración en pipelines de documentación como preprocesador: un paso que recibe imágenes de diagramas y emite borradores de Mermaid para revisión humana antes de fusionarlos en la rama principal.
- Asistencia en editores locales: al ser un GGUF de 0,672 GB para el modelo de lenguaje, se puede cargar en un portátil con llama.cpp y ofrecer conversión de diagramas sin enviar imágenes a servicios externos, lo que resulta adecuado para material confidencial.
- Prototipado de herramientas de diagramación: usar el modelo como motor de "imagen a código" en una aplicación de edición de diagramas, con el proyector F16 separado para poder actualizar solo el componente de lenguaje.
- Evaluación comparativa de VLM pequeños en tareas de visión estructurada: el artefacto sirve como referencia reproducible (con hashes verificados) para medir la calidad de conversión a Mermaid frente a otros modelos del mismo rango de tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de benchmarks no están documentados en los artefactos inspeccionados y que los ejemplos de carga son orientativos, no una afirmación de calidad medida.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de lenguaje Q4_K_M ocupa 0,672 GB y el proyector F16 1,109 GB; en total, alrededor de 1,8 GB de pesos, más el overhead de contexto y del runtime de llama.cpp. No se dispone de una cifra medida de VRAM pico.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el artefacto es apto para GPU de consumo, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos (menos de 2 GB en total); no se especifican modelos ni requisitos mínimos verificados.
- Opciones de despliegue: llama.cpp con `llama-mtmd-cli` (modelo + `--mmproj`); el bundle no se puede ejecutar directamente y requiere desempaquetado con `gguf_bundle.py`. La card menciona que Ollama y LM Studio seleccionan los ficheros separados, pero no documenta una configuración validada para ellos.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B Mermaid (este) | 1.780.767.008 (safetensors) | no disponible | GGUF Q4_K_M + mmproj F16 | Apache 2.0 | Afinado para imagen a Mermaid; sin benchmarks publicados |
| MiniCPM-V base (familia upstream) | no disponible en esta ficha | no disponible | safetensors / GGUF según release | no disponible en esta ficha | Modelo generalista del que deriva; no se documenta la receta de afinado |
| Otros VLM pequeños para imagen a código | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas; la información proporcionada no incluye benchmarks ni especificaciones de modelos comparables.

## Limitaciones y advertencias

- La model card no documenta datos de entrenamiento, procedimiento ni evaluación; no hay evidencia publicada de calidad más allá de una prueba manual con una imagen de flowchart.
- El ejemplo de `llama-mtmd-cli` de la card no fue probado como parte de la actualización de la documentación; el autor lo señala explícitamente.
- El bundle de un solo fichero no es ejecutable directamente por llama.cpp; requiere desempaquetado previo.
- Idiomas: solo inglés según los metadatos; no se documenta soporte de castellano.
- Longitud de contexto no disponible, lo que impide planificar conversaciones o documentos largos con garantías.
- Riesgo de alucinación en la generación de código Mermaid: no se documentan métricas de fidelidad sintáctica ni de validez del diagrama generado.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse la atribución upstream y los avisos de terceros al redistribuir (ver `NOTICE`).
- El nombre del bundle no incluye etiqueta de cuantización ni "mmproj", por lo que las herramientas automáticas (`-hf`, Ollama, LM Studio) seguirán seleccionando los ficheros separados.
- No se documenta compatibilidad verificada con versiones concretas de llama.cpp más allá de la necesidad de un build que soporte MiniCPM-V 4.7 y su arquitectura de proyector.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-gguf
- Colección de modelos Mermaid: https://huggingface.co/collections/Lucasgitguy-co/mermaid-models-6aec32e19fcffdc51361686e
- Dataset de texto e imágenes de diagramas: https://huggingface.co/datasets/Lucasgitguy-co/mermaid-diagram-text-images
- Dataset de texto original inglés/neerlandés: https://huggingface.co/datasets/Lucasgitguy-co/mermaid-text-en-nl
- Informe técnico (referenciado en la card): `docs/paper.md` y `docs/paper.pdf` dentro del repositorio
- Instrucciones de uso: `docs/USAGE.md` dentro del repositorio
- Estructura de ficheros: `docs/FILE_STRUCTURE.md` dentro del repositorio
- Procedencia y reproducibilidad: `docs/PROVENANCE.md` dentro del repositorio
- Historial de versiones: `CHANGELOG.md` dentro del repositorio
