# Salahuddin1234/omnidoctor-audar

## Resumen

Audar-TTS-V1-Turbo es un modelo de síntesis de voz (text-to-speech) de código abierto con pesos publicados, desarrollado por AudarAI y distribuido en este repositorio por el usuario Salahuddin1234 en formato GGUF. Se trata de la variante "balanced production" de la familia Audar-TTS: con aproximadamente 1,64 mil millones de parámetros, sacrifica parte de la velocidad de la variante Flash (553 M) a cambio de mayor fidelidad y prosodia más estable. El modelo es Arabic-first, cubre árabe estándar moderno y dialectos del Golfo, e incorpora inglés como segundo idioma con soporte de code-switching.

La propuesta técnica consiste en tratar la síntesis de voz como predicción de siguiente token: un backbone de tipo modelo de lenguaje predice tokens acústicos discretos del códec propietario audar-codec (libro de códigos único a 50 Hz), que después se decodifican a audio de 24 kHz. No utiliza fonemizador ni G2P por idioma, de modo que la pronunciación se aprende de los datos en lugar de reglas. Incorpora clonación de voz zero-shot a partir de un clip de referencia de 5 a 15 segundos, sin ajuste fino por hablante.

Su relevancia actual radica en dos factores: la escasez de modelos TTS abiertos con calidad sólida en árabe y dialectos, y la disponibilidad de cuantizaciones GGUF que permiten ejecutarlo en CPU, GPU y dispositivos de borde mediante llama.cpp. La licencia es la AudarAI Community License v1.0, que restringe el uso comercial a organizaciones pequeñas. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de modelo de lenguaje (predicción de siguiente token) sobre tokens acústicos discretos; códec neuronal audar-codec de libro único a 50 Hz; salida de audio a 24 kHz |
| Parametros totales | 1.643.998.208 (~1,64 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en variantes Q4, Q5 y Q8 |
| Idiomas soportados | Árabe (estándar moderno y dialectos del Golfo/Emiratíes) e inglés |
| Licencia | AudarAI Community License v1.0 (`license: other`) |
| Formato de pesos | GGUF para llama.cpp; el recuento de parámetros reportado por HuggingFace procede de safetensors del modelo base |

## Arquitectura y entrenamiento

Audar-TTS-V1-Turbo abandona el esquema clásico de TTS en dos etapas (texto a representación acústica mediante fonemas y después vocoder) y lo reformula como generación autorregresiva de tokens. Un backbone tipo transformer decoder produce tokens acústicos discretos pertenecientes al códec audar-codec, un códec neuronal de libro de códigos único a 50 Hz, que finalmente se decodifica a una señal de audio de 24 kHz. La ausencia de fonemizador y de G2P por idioma es una decisión de diseño explícita: los dialectos árabes y las alternancias árabe-inglés se resuelven a partir de los datos de entrenamiento, evitando reglas de pronunciación frágiles. El modelo incorpora además ocho etiquetas de control expresivo en línea, entre ellas `[laughs]`, `[whispers]`, `[excited]` y `[curious]`, que se insertan en el texto de entrada.

La clonación de voz funciona en régimen zero-shot: basta un clip de referencia de 5 a 15 segundos para replicar el timbre, sin entrenamiento por hablante. El repositorio incluye seis voces de demostración sintéticas, generadas por interpolación de múltiples hablantes, que no replican a ninguna persona real.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineamiento como RLHF o DPO. Tampoco se documentan innovaciones adicionales del entrenamiento en la información proporcionada.

## Capacidades

- Generación de voz expresiva a partir de texto en árabe y en inglés, con salida a 24 kHz.
- Clonación de voz zero-shot desde un clip de referencia de 5 a 15 segundos, sin ajuste fino por hablante.
- Control expresivo mediante ocho etiquetas insertadas en el texto de entrada (`[laughs]`, `[whispers]`, `[excited]`, `[curious]`, `[mischievously]`, entre otras).
- Cobertura de árabe estándar moderno y dialectos del Golfo/Emiratíes.
- Soporte de code-switching árabe-inglés dentro de una misma locución.
- Ausencia de fonemizador y de G2P, lo que evita errores de pronunciación ligados a reglas lingüísticas.
- Inferencia en CPU, GPU y dispositivos de borde mediante cuantizaciones GGUF y llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento; el pipeline declarado es exclusivamente text-to-speech.

## Casos de uso

- Doblaje y localización de contenido audiovisual árabe-inglés: la clonación zero-shot permite mantener la identidad vocal de un locutor original en la versión doblada con solo 5-15 segundos de referencia, y el code-switching evita tener que separar las pistas por idioma.
- Producción de audiolibros y narración larga: las etiquetas expresivas (`[whispers]`, `[excited]`) permiten dirigir la interpretación sin reentrenar el modelo, algo poco habitual en TTS abiertos.
- Asistentes de voz y respuesta interactiva de voz (IVR): el formato GGUF permite desplegarlo en CPU dentro de centralitas telefónicas o servidores sin GPU dedicada, con la voz corporativa clonada a partir de una muestra corta.
- Accesibilidad y comunicación aumentativa: generación de una voz personalizada y coherente para personas que han perdido el habla, clonando su propia voz a partir de grabaciones previas y con consentimiento explícito.
- E-learning y contenido formativo bilingüe: el modelo puede leer material que mezcla terminología inglesa dentro de una explicación en árabe sin romper la prosodia, un escenario frecuente en enseñanza técnica en la región del Golfo.
- Prototipado de personajes para videojuegos y animación: las seis voces sintéticas incluidas, libres de uso, permiten poblar prototipos sin depender de actores de doblaje ni de licencias de voces comerciales.
- Generación de contenido para redes sociales y pódcast: la combinación de clonación rápida y control expresivo permite producir variantes de un mismo guion con distinta carga emocional en pocos segundos.
- Despliegue en quioscos y dispositivos de borde: las cuantizaciones Q4 y Q5 reducen el modelo por debajo del gigabyte, lo que habilita su ejecución en hardware embebido sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER del texto sintetizado, similitud de hablante, RTF) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento de parámetros y no confirmada por el autor: aproximadamente 0,9-1,0 GB en Q4, 1,1-1,2 GB en Q5, 1,7-1,8 GB en Q8 y unos 3,3 GB en FP16. A esa cifra hay que sumar el códec neuronal y la caché de claves y valores, cuyo tamaño no se documenta.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) debería alojar el modelo cuantizado; una A100 o H100 solo tendría sentido para servir muchas peticiones concurrentes.
- Cabe holgadamente en GPU de consumo: las variantes Q4 y Q5 ocupan menos de 2 GB de VRAM sumando el códec, por lo que también son viables en iGPU y en memoria unificada de Apple Silicon.
- Opciones de despliegue: llama.cpp es el runtime indicado explícitamente por el repositorio; al tratarse de GGUF, es compatible con el ecosistema llama-cpp-python y con Ollama si esta acepta la arquitectura. vLLM y TGI no están contemplados en la información disponible, ya que no consumen GGUF.
- Latencia y throughput: no disponibles. El autor describe Turbo como una variante que cede velocidad frente a Flash a cambio de fidelidad, pero no publica valores de factor de tiempo real (RTF) ni de tokens acústicos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion zero-shot | Licencia | Formato |
|---|---|---|---|---|---|
| Audar-TTS-V1-Turbo (esta ficha) | ~1,64 B | Árabe (MSA y Golfo) e inglés | Sí, clip de 5-15 s | AudarAI Community v1.0 | GGUF (Q4/Q5/Q8) |
| Audar-TTS-V1-Flash | 553 M | no disponible | Sí, clip de 5-15 s | no disponible | no disponible |
| Alternativas externas de la misma categoría (XTTS-v2, CosyVoice 2, F5-TTS, Kokoro) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

La búsqueda web realizada no aporta datos comparativos de rendimiento entre Audar-TTS y otras familias de TTS abiertas. Dentro del propio ecosistema AudarAI, el modelo hermano Audar-ASR-V1 resuelve la tarea inversa (reconocimiento de voz) y no es comparable directamente, aunque podría combinarse con Turbo para construir pipelines de voz completos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. La cobertura declarada se centra en árabe estándar moderno y dialectos del Golfo/Emiratíes, por lo que es previsible un rendimiento inferior en dialectos magrebíes, levantinos o sudaneses, extremo no verificado con datos.
- Riesgo de alucinación: en TTS, el equivalente son artefactos de audio, omisiones de palabras, repeticiones y prosodia incorrecta ante textos fuera de dominio. No se documenta el comportamiento con números, acrónimos, siglas o signos de puntuación poco frecuentes.
- Limitaciones de idioma: solo árabe e inglés. No hay soporte declarado de castellano ni de otras lenguas.
- Restricciones de licencia: la AudarAI Community License v1.0 permite uso libre para investigación y uso comercial limitado a organizaciones pequeñas; el uso por parte de grandes organizaciones o empresas requiere una licencia enterprise de AudarAI. Conviene revisar el texto completo antes de integrarlo en un producto.
- Uso indebido de clonación de voz: la clonación zero-shot facilita la suplantación de identidad. El autor declara un enfoque de consentimiento previo, pero la responsabilidad legal recae en quien despliega el modelo. Es recomendable aplicar marcas de agua o verificación de consentimiento en producción.
- Repositorio de terceros: la publicación la realiza el usuario Salahuddin1234, no AudarAI. No hay verificación de que las cuantizaciones GGUF reproducen fielmente el modelo original, y el repositorio tenía 0 descargas y 0 likes en el momento de la consulta.
- Nombre potencialmente confuso: el identificador del repositorio incluye el término "omnidoctor", que no guarda relación aparente con el trabajo académico OmniDoctor sobre aprendizaje continuo en entornos clínicos, citado en los resultados de búsqueda. Son proyectos independientes y conviene no confundirlos.
- Anomalía en los metadatos: las fechas de creación y actualización del repositorio (30 de septiembre de 2026) son posteriores a la fecha actual y no resultan fiables.
- Ausencia de benchmarks: no hay métricas publicadas, por lo que cualquier decisión de adopción en producción debería apoyarse en una evaluación propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Salahuddin1234/omnidoctor-audar
- Repositorio base de AudarAI (referenciado en las muestras de audio): https://huggingface.co/audarai/Audar-TTS-V1-Turbo
- Variante Flash de la familia: https://huggingface.co/audarai/Audar-TTS-V1-Flash
- Modelo hermano de reconocimiento de voz: https://huggingface.co/audarai/Audar-ASR-V1-Turbo
- Repositorio GitHub de Audar-ASR-V1: https://github.com/AudarAI/Audar-ASR-V1
- Texto de la licencia AudarAI Community v1.0: https://www.audarai.com/license/audarai-community-license-v1.0/
- Artículo OmniDoctor (proyecto no relacionado, citado en la búsqueda): https://dl.acm.org/doi/10.1145/3746027.3755745
