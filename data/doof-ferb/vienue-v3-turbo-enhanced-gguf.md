# doof-ferb/vienue-v3-turbo-enhanced-gguf

## Resumen
VieNeu v3 Turbo Enhanced GGUF es una cuantización en formato GGUF del modelo de síntesis de voz (text-to-speech) `blaze-voice-ai/vienue-v3-turbo-enhanced`, publicada por el usuario doof-ferb. El modelo original está especializado en la generación de voz en vietnamita y esta versión empaqueta los pesos en múltiples niveles de cuantización para facilitar su despliegue en entornos con recursos limitados, incluyendo CPU. El repositorio tiene un tamano de 1,8 GB y contiene 145.947.328 parámetros en los pesos de referencia.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo TTS vietnamita de nicho con soporte para 25 voces predefinidas y un conjunto de cuantizaciones que van desde Q2_K hasta F32. Por otro, sirve como ejemplo de un pipeline de conversión basado en `audio.cpp`, una herramienta que permite ejecutar modelos de audio en formato GGUF fuera de los frameworks habituales. El modelo se publicó con licencia Apache 2.0 y esta etiquetado únicamente para el idioma vietnamita (`vi`), por lo que no debe confundirse con un modelo multilingüe.

El modelo no es un LLM: es un sistema de síntesis de voz que transforma texto en audio. Su utilidad principal es la generación de voz en vietnamita con control de locutor y estilo (noticias, narración, conversación natural), y su empaquetado GGUF lo hace desplegable en servidores modestos o incluso en hardware de consumo mediante el servidor de referencia incluido en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; familia `vieneu_v3_turbo`) |
| Parametros totales | 145.947.328 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, F16, BF16, F32 |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base `blaze-voice-ai/vienue-v3-turbo-enhanced`. La model card únicamente indica que se trata de un modelo de la familia `vieneu_v3_turbo` con tarea `tts` y que la conversión a GGUF se realizó siguiendo la documentación de `audio.cpp` para el modelo `vieneu_v3_turbo`. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

El proceso de cuantización sí está documentado: se generan ocho variantes (Q2_K a F32) a partir de los pesos originales, lo que permite elegir el equilibrio entre calidad de audio, tamano en disco y velocidad de inferencia. El repositorio incluye además referencias a recursos externos necesarios para el funcionamiento completo: un conjunto de 25 voces predefinidas alojadas en `pnnbao-ump/VieNeu-TTS-v3-Turbo` y el paquete `sea-g2p`, un conversor de grafema a fonema para lenguas del sudeste asiático. Sin estos recursos adicionales, el modelo no puede reproducir las voces predefinidas ni realizar la conversión fonética correcta del vietnamita.

## Capacidades
- Síntesis de voz (text-to-speech) en vietnamita a partir de texto de entrada.
- Selección entre 25 voces predefinidas con etiquetas de género, región dialectal (norte, centro, sur) y estilo (natural, noticias, narración, lectura de cuentos).
- Control de locutor mediante ficheros de referencia (`reference_codes_file`) y embeddings de hablante (`speaker_embedding_file`).
- Conversión grafema-fonema específica para vietnamita mediante `sea-g2p`.
- Ejecución en CPU o GPU según la configuración del servidor (`backend: "cpu"` o equivalente GPU).
- Gestión de múltiples modelos cargados simultáneamente con límite configurable (`max_loaded_models`).
- Soporte de CORS configurable para integración en servicios web.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de audio.

## Casos de uso
- **Locución de noticias automatizada:** el modelo incluye voces etiquetadas como "giọng tin tức" (estilo noticias) en dialectos norte y sur, adecuadas para generar boletines informativos leídos por una voz sintética consistente. Se configuraría la voz `Mai Anh` o `Minh Đức` en el `config.json` y se enviaría el texto por la API del servidor.
- **Audiolibros y narración de cuentos:** las voces "giọng kể chuyện" y "giọng đọc truyện" permiten narrar textos largos con un timbre adecuado para ficción. El servidor admite peticiones sucesivas con la misma voz, manteniendo la coherencia del locutor a lo largo del capítulo.
- **Atención al cliente por voz en vietnamita:** integrado en un pipeline de IVR, el modelo puede convertir respuestas de texto en audio para usuarios vietnamitas. La cuantización Q8_0 o Q6_K ofrece un compromiso razonable entre calidad y latencia en CPU.
- **Accesibilidad para personas con discapacidad visual:** conversión de contenido textual vietnamita (webs, documentos, correo) a audio mediante un servidor local con `backend: "cpu"`, sin depender de servicios cloud.
- **Generación de voces para vídeos y pódcast:** las 25 voces con distintos dialectos permiten producir contenido con variedad de locutores sin grabar a personas reales, útil para canales de YouTube o pódcast en vietnamita.
- **Prototipado y pruebas de UX de voz:** al ser un GGUF ligero (1,8 GB en el repo completo, con variantes individuales mucho menores), se puede desplegar en un portátil para validar interfaces de voz antes de invertir en infraestructura.
- **Investigación en TTS de bajos recursos:** la disponibilidad de cuantizaciones desde Q2_K hasta F32 permite estudiar la degradación de calidad perceptual en función de la precisión numérica, un caso de estudio útil para quienes trabajan en compresión de modelos de audio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- **VRAM estimada:** no disponible de forma oficial. Como referencia orientativa basada en el número de parámetros (145,9 M), los pesos en F32 ocuparían aproximadamente 584 MB, en F16 unos 292 MB y en Q8_0 alrededor de 146 MB. Estas cifras son estimaciones aritméticas a partir del recuento de parámetros, no datos publicados por el autor.
- **GPU recomendadas:** no disponibles. El modelo está disenado para ejecutarse también en CPU (`backend: "cpu"` en la configuración de ejemplo), por lo que no requiere GPU dedicada.
- **GPU de consumo:** por el tamano de parámetros, cabría en cualquier GPU de consumo con al menos 1-2 GB de VRAM libre, aunque no hay confirmación oficial.
- **Opciones de despliegue:** servidor de referencia basado en `audio.cpp` (documentado en el repositorio de 0xShug0), con configuración mediante `config.json` que especifica host, puerto, backend, hilos y modelos cargados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye otros modelos TTS vietnamitas comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias
- **Idioma único:** el modelo solo soporta vietnamita (`vi`). No debe esperarse calidad en castellano ni en otros idiomas.
- **Dependencia de recursos externos:** las 25 voces predefinidas y el paquete `sea-g2p` se alojan fuera del repositorio. Sin ellos, el modelo no funciona según lo documentado.
- **Riesgo de alucinación en audio:** como todo modelo generativo de voz, puede producir pronunciaciones incorrectas, entonación artificial o artefactos en textos con nombres propios, siglas o palabras extranjeras.
- **Sesgos:** no se documentan sesgos específicos, pero las voces están etiquetadas por género y región dialectal, lo que puede perpetuar estereotipos si se usan sin criterio en aplicaciones de producción.
- **Licencia:** Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `blaze-voice-ai/vienue-v3-turbo-enhanced` y de los recursos de voces, que podrían tener términos distintos.
- **Madurez del ecosistema:** el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la herramienta `audio.cpp` es un proyecto en desarrollo. No hay garantías de soporte a largo plazo.
- **Ausencia de benchmarks:** no hay métricas objetivas de calidad (MOS, WER, etc.) publicadas, lo que impide evaluar su rendimiento frente a alternativas.
- **Formato GGUF específico:** la conversión sigue un documento concreto de `audio.cpp`; cambios en esa herramienta podrían romper la compatibilidad de los ficheros.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/doof-ferb/vienue-v3-turbo-enhanced-gguf
- Modelo base: https://huggingface.co/blaze-voice-ai/vienue-v3-turbo-enhanced
- Voces predefinidas: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo/tree/main/gguf/voices
- Documentación de conversión en audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/vieneu_v3_turbo.md
- Paquete sea-g2p: https://github.com/pnnbao97/sea-g2p/releases/latest
