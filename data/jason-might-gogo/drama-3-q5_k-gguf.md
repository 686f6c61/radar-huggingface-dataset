# jason-might-gogo/drama-3-Q5_K-GGUF

## Resumen

drama-3-Q5_K-GGUF es una cuantización en formato GGUF del modelo Drama 3 desarrollado por Fish Audio, un sistema de síntesis de voz (text-to-speech) de gran escala. El repositorio, publicado por el usuario jason-might-gogo, contiene un único archivo de pesos (`Drama-35B-A3B-v3-Q5_K.gguf`) extraído del repositorio de sakasegawa/drama-3-GGUF y pensado para su uso con el motor de inferencia speech.cpp. El archivo es idéntico al original (mismo sha256) y se distribuye por separado para que una caché de modelos pueda descargar únicamente este tipo de cuantización en lugar de las cinco disponibles.

El modelo subyacente, fishaudio/drama-3, cuenta con 35.774.376.977 parámetros totales y una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos, según se deduce de la nomenclatura "35B-A3B" del archivo. Está orientado exclusivamente a la generación de audio a partir de texto, no a tareas de lenguaje general.

La relevancia de esta ficha radica en que permite ejecutar un modelo TTS de gran tamaño en entornos con recursos limitados mediante cuantización Q5_K, aunque con las restricciones legales que impone la Fish Audio Community License 1.0, que limita el uso comercial y prohíbe el entrenamiento de modelos de audio con sus salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), según nomenclatura 35B-A3B; detalles internos no disponibles |
| Parametros totales | 35.774.376.977 |
| Parametros activos | Aproximadamente 3.000 millones (según nomenclatura A3B; no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K (GGUF); el repositorio original ofrece cinco tipos, no especificados |
| Idiomas soportados | No disponible |
| Licencia | Fish Audio Community License 1.0 |
| Formato de pesos | GGUF (archivo único `Drama-35B-A3B-v3-Q5_K.gguf`) |

## Arquitectura y entrenamiento

La información disponible confirma que Drama 3 emplea una arquitectura de mezcla de expertos con 35.774 millones de parámetros totales y aproximadamente 3.000 millones activos por token, según la convención de nombres del archivo. No se dispone de detalles sobre el número de expertos, el mecanismo de enrutamiento, el tipo de atención ni la composición del dataset de entrenamiento. El modelo está especializado en text-to-speech y forma parte de la familia Drama de Fish Audio, pero la model card no documenta el proceso de entrenamiento, el volumen de datos de audio utilizados, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica destacable en este repositorio concreto no está en el modelo, sino en su empaquetado: se distribuye un único archivo GGUF cuantizado a Q5_K para el motor speech.cpp, con verificación de integridad mediante sha256 (`3a26462bf34e504df5026193563910338be3140e243a516e1b8661e18037c21a`), lo que facilita la descarga selectiva en cachés de modelos. No se han documentado innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech), pipeline declarado del modelo.
- Generación de audio en formato compatible con speech.cpp.
- Ejecución local mediante cuantización GGUF Q5_K.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio de entrada: no disponible.
- Clonación de voz: la licencia menciona explícitamente la imitación de voces de personas identificables, lo que sugiere capacidades de síntesis con control de hablante, aunque no se detalla en la model card.

## Casos de uso

- Audiolibros y narración automatizada: el modelo puede convertir textos largos en voz sintética de forma local con speech.cpp, evitando depender de servicios en la nube y manteniendo el contenido en la máquina.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o pipelines de conversión de documentos a audio, gracias a la inferencia local con un único archivo GGUF.
- Generación de voces para vídeos y pódcasts: producción de narraciones para contenido pregrabado usando el modelo cuantizado en estaciones de trabajo con GPU de consumo, siempre que el uso encaje en la licencia comunitaria.
- Prototipado de asistentes de voz: desarrollo de interfaces conversacionales en las que el TTS se ejecuta en el mismo equipo que el resto del pipeline, reduciendo la latencia de red.
- Investigación en síntesis de voz: experimentación académica con un modelo TTS de 35B parámetros en formato MoE cuantizado, comparando calidad frente a alternativas más pequeñas.
- Pruebas de integración con speech.cpp: validación del motor de inferencia con un peso Q5_K concreto, útil para desarrolladores que contribuyen al proyecto o evalúan su rendimiento.
- Generación de audio para entornos sin conectividad: despliegue en máquinas aisladas o de borde donde no se puede llamar a una API externa de TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 25,2 GB; con cuantización Q5_K se necesita al menos esa cantidad de memoria, más overhead del motor speech.cpp. Una estimación razonable es de 26 a 30 GB de VRAM para cargar el modelo completo.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para ejecución holgada; en GPUs de consumo de 24 GB (RTX 3090, RTX 4090) el modelo Q5_K probablemente no cabe completo y requeriría offloading a CPU o una cuantización menor.
- Cabe en GPU de consumo: no con Q5_K en 24 GB; sí con cuantizaciones más agresivas del repositorio original, cuyos tipos no se detallan.
- Opciones de despliegue: speech.cpp es el motor indicado por el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al tratarse de un modelo TTS es poco probable que sean compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drama-3-Q5_K-GGUF (este) | 35,77 B totales / ~3 B activos | No disponible | GGUF Q5_K | Fish Audio Community License 1.0 | Hugging Face, 55 descargas |
| fishaudio/drama-3 (base) | 35,77 B totales / ~3 B activos | No disponible | Safetensors (presumible) | Fish Audio Community License 1.0 | Hugging Face, modelo oficial |
| sakasegawa/drama-3-GGUF | 35,77 B totales / ~3 B activos | No disponible | GGUF, cinco cuantizaciones | Fish Audio Community License 1.0 | Hugging Face, repositorio de origen |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Fish Audio Community License 1.0 limita el uso comercial y exige atribución; es imprescindible revisar el archivo LICENSE y el NOTICE antes de cualquier despliegue en producción.
- Prohibición de imitar voces sin consentimiento: no se puede usar el modelo para suplantar la voz de personas identificables.
- Prohibición de entrenar modelos de audio con las salidas: no se permite usar el modelo ni su output para entrenar o mejorar otros sistemas de generación de voz o audio.
- No es una versión oficial: el repositorio es una copia no respaldada por Fish Audio, que no patrocina ni avala esta distribución.
- Idiomas soportados no documentados: se desconoce la cobertura lingüística real, lo que impide garantizar calidad en castellano.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, artefactos o prosodia anómala en textos fuera de distribución.
- Sesgos: no se documentan sesgos conocidos, pero al no publicarse la composición del dataset no es posible evaluar sesgos de género, acento o idioma.
- Contexto no disponible: se desconoce la longitud máxima de texto de entrada, lo que limita la planificación de cargas por lotes.
- Compatibilidad limitada: el formato está pensado para speech.cpp; otros motores de inferencia pueden no cargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jason-might-gogo/drama-3-Q5_K-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Repositorio GGUF de origen: https://huggingface.co/sakasegawa/drama-3-GGUF
- Motor de inferencia speech.cpp: https://github.com/nyosegawa/speech.cpp
