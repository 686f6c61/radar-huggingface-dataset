# Gulipad/babel-1

## Resumen

`Gulipad/babel-1` es el repositorio de HuggingFace que contiene los pesos de `librarian-1`, un modelo de lenguaje en español de 66M de parámetros desarrollado por Gulipad. El modelo forma parte de `babel-1`, el universo de La Ciudad de Babel, una recreación de la Biblioteca de Babel de Borges en la que un modelo de lenguaje actúa como cartógrafo. La model card no describe la arquitectura, la longitud de contexto ni el proceso de entrenamiento; la información disponible se limita al tamaño, el idioma y el formato de despliegue.

El interés técnico del repositorio está en su formato: `model.bin` es un modelo int8 pensado para el motor entero del proyecto, que se ejecuta de forma bit-exact en el navegador. Los pesos están fijados por SHA-256 en el manifest del universo, lo que permite verificar la integridad de una versión concreta. Es un artefacto pequeño, con un repositorio de 0,1 GB, sin descargas ni likes en el momento de la consulta y sin licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica transformer, MoE, SSM ni híbrida) |
| Parámetros totales | 66M |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (`model.bin`) |
| Idiomas soportados | español (`es`) |
| Licencia | no disponible |
| Formato de pesos | `model.bin` (int8) para el motor entero del proyecto; no se documentan safetensors ni GGUF |
| Pipeline de HuggingFace | no disponible |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo: la model card no indica si es un transformer, un MoE, un SSM o una arquitectura híbrida. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El único dato técnico verificable es que se trata de un modelo de lenguaje de 66M de parámetros.

El autor indica que `model.bin` es el modelo int8 para el motor entero del proyecto, que corre bit-exact en el navegador, y que los pesos están fijados por SHA-256 en el manifest del universo. Esa combinación apunta a un despliegue reproducible y verifiable, pero no se documenta compatibilidad con el ecosistema estándar de HuggingFace ni con motores de inferencia convencionales.

## Capacidades

- Generación de texto en español: se describe como modelo de lenguaje, pero no se detallan tareas concretas, calidad ni evaluaciones.
- Razonamiento, código y matemáticas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo español según la model card.
- Capacidad especial: inferencia int8 bit-exact en navegador mediante el motor entero del proyecto, con pesos empaquetados en `model.bin` y fijados por SHA-256.
- Integración con HuggingFace: pipeline no disponible; no se documenta uso con `transformers`.

## Casos de uso

- Demostración web interactiva de La Ciudad de Babel: el motor entero del proyecto puede cargar `model.bin` en el navegador y generar respuestas sin backend; el interés está en la ejecución bit-exact y en la reproducibilidad, no en un benchmark de calidad.
- Instalación artística o expositiva: al ser un modelo de 66M de parámetros y un repositorio de 0,1 GB, se puede empaquetar con la obra y ejecutar en un equipo modesto; el SHA-256 del manifest permite verificar que la pieza no ha cambiado.
- Prototipado de generación de texto en español en el cliente: útil para probar interfaces de escritura o diálogo en navegador cuando no se quiere enviar datos a un servidor; requiere validar antes la calidad, que no está documentada.
- Docencia sobre cuantización int8 y motores de inferencia: los alumnos pueden inspeccionar un modelo de 66M en int8, comparar la ejecución entera con una referencia flotante y estudiar el pinning por hash.
- Preservación digital reproducible: el manifest con SHA-256 y el repositorio de 0,1 GB permiten archivar una versión concreta del modelo y verificar su integridad en el futuro.
- Pruebas de conformidad de motores enteros: usar `model.bin` como caso de prueba para validar que una implementación del motor produce resultados bit-exact en distintos navegadores o plataformas.
- Generación offline en una aplicación web progresiva: los pesos int8 de aproximadamente 66 MB podrían almacenarse en caché; no hay datos de latencia ni de longitud de contexto, así que solo es adecuado para experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones en español; no se presentan cifras para no inventarlas.

## Requisitos de hardware

- VRAM estimada: los pesos de 66M de parámetros en int8 equivalen a aproximadamente 66 MB; la memoria adicional del motor y del contexto no está documentada.
- GPU recomendadas: no se requiere GPU para el motor de navegador; puede ejecutarse en CPU. No hay datos de rendimiento en A100, H100 o RTX 4090.
- GPU consumer: por tamaño, los pesos int8 de 66 MB caben en cualquier GPU consumer, pero el autor no publica requisitos ni latencias.
- Opciones de despliegue: motor entero propio del proyecto (`bdebabel`), con ejecución bit-exact en navegador. No se documentan vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Gulipad/babel-1` (`librarian-1`) | 66M | no disponible | no disponible | HuggingFace y GitHub | int8 para motor entero; sin benchmarks |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos verificables para comparar |

No se presenta una comparativa numérica con otros modelos porque no hay información verificable sobre alternativas de la misma categoría en la documentación disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial; es necesario contactar con el autor para aclarar las condiciones.
- Sin benchmarks publicados: la calidad, el razonamiento, el código y las matemáticas no están evaluados; no es recomendable para producción sin una evaluación previa.
- Solo español: no se documentan capacidades multilingües.
- Longitud de contexto no documentada: no se puede planificar su uso con ventanas largas.
- Arquitectura y datos de entrenamiento no disponibles: los sesgos conocidos no están documentados.
- Modelo de 66M de parámetros: la capacidad es acotada por tamaño y no hay evaluación que cuantifique su calidad.
- Formato int8 específico (`model.bin`): no es safetensors ni GGUF y puede requerir el motor del proyecto.
- Pipeline no disponible: la integración con `transformers` y otros ecosistemas no está documentada.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones; cualquier uso generativo requiere validación.
- Poca validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/Gulipad/babel-1
- Repositorio del proyecto: https://github.com/gulipad/bdebabel
- La Ciudad de Babel: https://babel.gulipad.com
- No se han encontrado papers, blogs, demos o repositorios adicionales en la información proporcionada.
