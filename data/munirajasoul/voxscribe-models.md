# munirajasoul/voxscribe-models

## Resumen

Voxscribe-models es un repositorio alojado en HuggingFace por el usuario munirajasoul que, por su nombre y por la información disponible, parece estar relacionado con el proyecto Voxscribe, una aplicación de entrada de voz offline distribuida en F-Droid. El repositorio no incluye una model card sustantiva: el README se limita a declarar la licencia Apache 2.0, sin descripción del modelo, arquitectura, datos de entrenamiento ni uso previsto.

No se dispone de información verificable sobre arquitectura, número de parámetros, longitud de contexto ni idiomas soportados. La única referencia técnica externa encontrada apunta a un archivo `ggml-tiny-q5_1.bin` de aproximadamente 32 MB, compatible con el formato GGML y con una cuantización q5_1, lo que sugiere la presencia de pesos derivados de un modelo Whisper de la variante "tiny" (unos 39 millones de parámetros en su forma original), orientado a reconocimiento automático del habla (ASR) en dispositivos de gama baja.

La relevancia actual del repositorio es limitada desde el punto de vista de evaluación técnica: no hay descargas ni interacciones registradas, la fecha de creación indicada es futura (2026-11-05) y no se han publicado benchmarks. Cualquier uso en producción debería basarse en una inspección directa de los archivos del repositorio y en la documentación del proyecto Voxscribe, no en la información de esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente ASR basado en Whisper, según el contexto del proyecto Voxscribe) |
| Parámetros totales | no disponible (la variante "tiny" de Whisper tiene ~39 M, pero no se confirma) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q5_1 (según el archivo `ggml-tiny-q5_1.bin` referenciado en la documentación de Voxscribe) |
| Idiomas soportados | no disponible (la documentación de Voxscribe recomienda usar solo la variante multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML/GGUF (archivo `.bin` compatible con ggml) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card ni en los resultados de búsqueda. El nombre del repositorio y la referencia a un archivo `ggml-tiny-q5_1.bin` apuntan a una conversión a GGML de un modelo de reconocimiento de voz de la familia Whisper en su variante "tiny", cuantizado a 5 bits con el esquema q5_1. Whisper es un transformer encoder-decoder entrenado con pares audio-texto a gran escala para transcripción y traducción de voz.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens, el uso de RLHF/DPO ni innovaciones técnicas específicas. La única característica inferible es la optimización para inferencia local en CPU mediante cuantización de baja precisión, coherente con el enfoque offline de Voxscribe.

## Capacidades

- Reconocimiento automático del habla (ASR) orientado a la transcripción de audio a texto, a partir del contexto del proyecto Voxscribe.
- Funcionamiento totalmente offline, sin dependencia de servicios en la nube, según la descripción de Voxscribe en F-Droid.
- Soporte de modo multilingüe si se emplea la variante multilingüe del modelo (la documentación de Voxscribe advierte que las variantes `.en` rompen ambos modos de idioma).
- Ejecución en dispositivos de gama baja o antiguos gracias al tamaño reducido del archivo (~32 MB) y a la cuantización q5_1.
- No se dispone de información sobre tool calling, razonamiento multi-paso, agentes, visión, audio generativo ni modo "thinking".

## Casos de uso

- Dictado por voz en movilidad sin conexión: la aplicación Voxscribe permite introducir texto hablado en el dispositivo sin enviar audio a servidores externos, adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Transcripción de notas de voz en dispositivos antiguos: el archivo de ~32 MB y la cuantización q5_1 permiten ejecutar el modelo en teléfonos con poca memoria y CPU modesta.
- Accesibilidad para usuarios con dificultades de tecleo: integración como método de entrada por voz en aplicaciones Android mediante el flujo de Voxscribe.
- Procesamiento de audio sensible en entornos regulados: al ser offline y Apache 2.0, puede desplegarse en equipos aislados sin transferir datos a terceros.
- Prototipado de pipelines ASR embebidos: útil para validar la viabilidad de transcripción en tiempo real en hardware de bajo consumo antes de escalar a modelos mayores.
- Traducción y transcripción multilingüe básica: si se usa la variante multilingüe, puede cubrir transcripciones en varios idiomas, aunque sin garantías documentadas de calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; para una variante GGML de ~32 MB, el consumo de memoria RAM es del orden de decenas de megabytes, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles; el proyecto Voxscribe está orientado a ejecución en CPU de dispositivos móviles.
- Compatibilidad con GPU de consumo: no confirmada; el formato GGML permite ejecución en CPU y en GPU mediante backends compatibles, pero no hay datos específicos.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGML/GGUF; la propia aplicación Voxscribe como cliente Android.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Voxscribe-models (este repositorio) | no disponible | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Sin model card ni benchmarks |
| Whisper tiny (OpenAI) | ~39 M | 30 s de audio por ventana | MIT | HuggingFace, ampliamente usado | Referencia ASR ligera; el repositorio parece derivar de ella, sin confirmación |
| Whisper base | ~74 M | 30 s de audio por ventana | MIT | HuggingFace | Mayor precisión a costa de más recursos |
| Vosk small models | variable | no disponible | Apache 2.0 | Sitio de Vosk | Alternativa ASR offline para dispositivos de gama baja |

La comparación con Whisper tiny y base es tentativa: no se confirma que el repositorio contenga pesos derivados de Whisper, solo que el nombre del archivo y el contexto del proyecto lo sugieren.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, evaluación, sesgos ni uso previsto.
- Riesgo de alucinación y errores de transcripción: en modelos ASR pequeños, la precisión cae en audio con ruido, acentos marcados o vocabulario técnico; no hay métricas publicadas (WER) para este repositorio.
- Idiomas no documentados: la documentación de Voxscribe advierte que las variantes `.en` rompen ambos modos de idioma; no se especifica qué idiomas cubre la variante multilingüe.
- Licencia Apache 2.0 declarada, pero sin archivo LICENSE ni atribución de los pesos originales; conviene verificar la procedencia antes de uso comercial.
- Fecha de creación futura (2026-11-05) y cero descargas: repositorio sin validación por la comunidad.
- Sin garantías de mantenimiento, versionado ni soporte.
- No apto como base para tareas de razonamiento, generación de texto o código: el contexto apunta exclusivamente a ASR.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/munirajasoul/voxscribe-models
- Voxscribe en F-Droid: https://f-droid.org/packages/org.y20k.voxscribe/
- Whisper (OpenAI), referencia probable de los pesos: https://github.com/openai/whisper
- llama.cpp, backend compatible con GGML/GGUF: https://github.com/ggerganov/llama.cpp
