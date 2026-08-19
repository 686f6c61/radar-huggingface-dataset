# scragnog/MOSS-Music-8B-Instruct-GGUF

## Resumen

MOSS-Music-8B-Instruct es un modelo de comprensión musical de código abierto desarrollado por MOSI.AI, el equipo OpenMOSS y el Instituto de Innovación de Shanghái. Está construido sobre el mismo backbone de audio que MOSS-Audio, pero especializado en música mediante preentrenamiento continuo y ajuste fino supervisado. Sus tareas principales son la generación de descripciones musicales (captioning), transcripción de letras (ASR), análisis estructural, razonamiento sobre acordes, tonalidad y tempo, y respuesta a preguntas sobre audio de larga duración.

Esta ficha se centra en la conversión GGUF publicada por scragnog, que permite ejecutar el modelo de forma totalmente local en la aplicación de escritorio HOT-Step CPP, un motor nativo en C++/GGML. La conversión incluye dos componentes: un modelo de lenguaje de 8B con arquitectura Qwen3 y una torre de audio basada en un codificador estilo Whisper de 32 capas con adaptador SwiGLU y tres fusiones "deepstack". El conjunto se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en herramientas de generación musical.

La relevancia actual de este modelo radica en que permite etiquetar datasets musicales de forma local, sin depender de APIs externas ni de servicios en la nube, algo crítico para proyectos que necesitan privacidad de datos o que operan sin conexión. Además, al ser la primera conversión GGUF de este modelo, abre la puerta a su uso en entornos de inferencia optimizados para CPU y GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (modelo de lenguaje) + codificador de audio estilo Whisper de 32 capas con adaptador SwiGLU y 3 fusiones deepstack |
| Parametros totales | 861.728.128 (según el repo GGUF; el modelo base se anuncia como 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 y f16 para el LM; la torre de audio solo en f16 |
| Idiomas soportados | no disponibles (el modelo base es multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión de safetensors bf16 originales) |

## Arquitectura y entrenamiento

El modelo base MOSS-Music-8B-Instruct combina un modelo de lenguaje con arquitectura Qwen3 (8B parámetros) con una torre de audio que procesa la señal musical. La torre de audio emplea un codificador de 32 capas inspirado en Whisper, seguido de un adaptador SwiGLU que proyecta las representaciones de audio al espacio de embeddings del LM. Para integrar la información auditiva en el texto, se utilizan tres "deepstack mergers" que inyectan las representaciones de audio en diferentes profundidades del transformer. El entrenamiento consistió en un preentrenamiento continuo específico para música y un ajuste fino supervisado orientado a tareas de captioning, ASR de letras, análisis estructural y razonamiento musical. El modelo Instruct está optimizado para seguir instrucciones directas, mientras que existe una variante Thinking con razonamiento en cadena de pensamiento.

La conversión GGUF mantiene la paridad con el modelo original en punto flotante, con correlaciones superiores a 0.9999 en todas las etapas del pipeline. Un detalle técnico relevante es que el procesador de referencia activa los "time markers" (marcadores de tiempo) que intercalan dígitos de segundos transcurridos en el flujo de tokens de audio cada 2 segundos; sin ellos, el modelo recibe entradas fuera de distribución y la calidad del captioning se degrada notablemente.

## Capacidades

- Generación de descripciones musicales (captioning) a partir de audio, produciendo texto que describe estilo, instrumentación, ambiente y otros atributos.
- Transcripción de letras (ASR) para música, con capacidad de reconocer voz cantada.
- Análisis estructural de canciones: identificación de secciones (verso, estribillo, puente, etc.).
- Razonamiento sobre acordes, tonalidad y tempo, aunque estos dos últimos campos se consideran inestables y se recomienda sustituirlos por análisis externo.
- Respuesta a preguntas sobre audio de larga duración, gracias a la capacidad de procesar contextos extensos.
- Soporte de dos formatos de caption: el bloque ACE-Step 1.5 (caption, genre, bpm, key, signature) y el MM3 Structured Caption, ambos generados a partir de una única codificación de audio.
- Funcionamiento totalmente local, sin necesidad de API ni conexión a internet.

## Casos de uso

- **Etiquetado de datasets musicales para entrenamiento**: el modelo puede generar captions estructurados para miles de pistas, creando los metadatos necesarios para entrenar modelos de generación musical como ACE-Step o MiniMax-Music3. Al ejecutarse localmente, permite procesar grandes volúmenes sin costes de API.
- **Análisis musical automatizado para productores**: un productor puede subir una maqueta y obtener una descripción detallada del estilo, la estructura y los elementos instrumentales, facilitando la organización de bibliotecas de samples y la toma de decisiones creativas.
- **Transcripción de letras para karaoke o subtitulado**: el modelo convierte la voz cantada en texto, lo que permite generar subtítulos sincronizados o letras para aplicaciones de karaoke.
- **Asistente de accesibilidad para personas con discapacidad auditiva**: puede describir el contenido musical de una pista, ayudando a comprender qué está sonando en términos de género, instrumentos y estructura.
- **Indexación y búsqueda de música por contenido**: al generar captions descriptivos, se pueden indexar bibliotecas musicales y permitir búsquedas por texto (por ejemplo, "tema alegre con guitarra acústica y ritmo rápido").
- **Análisis de estructuras para remezclas**: los DJ y remezcladores pueden obtener automáticamente las secciones de una canción (intro, drop, breakdown) para planificar sus mezclas.
- **Verificación de derechos y metadatos**: el análisis de tonalidad y tempo (aunque inestable) puede ayudar a completar metadatos de obras musicales para registro de derechos de autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La conversión GGUF incluye métricas de paridad frente al modelo original en fp32, con correlaciones entre 0.9999942 y 1.0000000 en todas las etapas del pipeline, lo que indica que la conversión no introduce pérdidas significativas de calidad. Sin embargo, no hay datos comparativos con otros modelos de captioning musical.

## Requisitos de hardware

- **VRAM estimada**: el modelo LM en q8_0 ocupa aproximadamente 9 GB, y la torre de audio en f16 unos 1.6 GB, totalizando unos 10.6 GB. En f16, el LM requeriría unos 16 GB adicionales, totalizando unos 17.6 GB.
- **GPU recomendadas**: para la cuantización q8_0, una GPU con 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070) es suficiente. Para f16, se necesitan al menos 20 GB (RTX 3090, RTX 4090, A5000). En CPU, la inferencia es posible pero más lenta.
- **Cabe en consumer GPU**: sí, con q8_0 cabe en GPUs de gama media con 12 GB o más.
- **Opciones de despliegue**: el modelo está diseñado para HOT-Step CPP, que usa un motor C++/GGML. No es compatible directamente con llama.cpp ni con vLLM, Ollama o TGI, ya que requiere la torre de audio y la inyección deepstack implementadas en HOT-Step.
- **Latencia y throughput**: no se proporcionan datos oficiales. En una GPU moderna, se espera un captioning de una pista de 3-4 minutos en unos pocos segundos, pero esto es una estimación orientativa.

## Comparativa con modelos similares

No hay datos públicos de comparación con otros modelos de captioning musical en la información disponible. Los modelos comparables serían:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MOSS-Music-8B-Instruct | 8B | no disponible | Apache 2.0 | HuggingFace, GGUF |
| MOSS-Audio (base) | no disponible | no disponible | no disponible | HuggingFace |
| Otros captioners comerciales | no disponible | no disponible | propietaria | APIs |

La principal ventaja de MOSS-Music frente a alternativas propietarias es su licencia Apache 2.0, que permite uso comercial sin restricciones. Frente a MOSS-Audio, MOSS-Music está específicamente especializado en música, con mejor rendimiento en tareas musicales.

## Limitaciones y advertencias

- **Inestabilidad en tempo y key**: el modelo produce valores de BPM y tonalidad inconsistentes entre decodificaciones (por ejemplo, 120 BPM en una ejecución y 128 en otra para la misma pista). Se recomienda no usar estos campos directamente y sustituirlos por análisis externo.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir descripciones que no se corresponden con el audio real, especialmente en pasajes ambiguos o con baja calidad de audio.
- **Dependencia de los time markers**: si se utiliza el modelo fuera de HOT-Step, es imprescindible emitir los marcadores de tiempo cada 2 segundos; omitirlos degrada severamente la calidad.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; el modelo base es multilingüe, pero el rendimiento puede variar según la lengua.
- **Restricciones de uso**: aunque la licencia Apache 2.0 permite uso comercial, la conversión GGUF requiere el motor HOT-Step CPP para funcionar, que tiene su propia licencia (no especificada en la información).
- **Sin soporte para llama.cpp**: los archivos GGUF no son compatibles con herramientas estándar como llama.cpp; solo funcionan con HOT-Step.
- **Sin benchmarks publicados**: no hay datos objetivos de rendimiento frente a otros modelos, lo que dificulta evaluar su calidad relativa.

## Enlaces

- [Repo GGUF en HuggingFace](https://huggingface.co/scragnog/MOSS-Music-8B-Instruct-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/OpenMOSS-Team/MOSS-Music-8B-Instruct)
- [GitHub de MOSS-Music](https://github.com/OpenMOSS/MOSS-Music)
- [Space de demostración en HuggingFace](https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Music-8B-Instruct)
- [HOT-Step CPP en GitHub](https://github.com/scragnog/HOT-Step-CPP)
- [Conversión GGUF de MiniMax-Music3](https://huggingface.co/scragnog/MiniMax-Music3-GGUF)
- [acestep.cpp en GitHub](https://github.com/ServeurpersoCom/acestep.cpp)
