# herald-dictation/Qwen3-ASR-1.7B-gguf

## Resumen

Qwen3-ASR-1.7B-gguf es la conversión al formato GGUF del modelo de reconocimiento automático de voz Qwen3-ASR 1.7B, desarrollado originalmente por Qwen (Alibaba Cloud). El repositorio lo publica herald-dictation como espejo byte a byte de la conversión realizada por handy-computer, con el objetivo de que la aplicación Herald (dictado privado y offline) pueda descargar los pesos desde un hosting propio sin depender de otro proyecto. La librería asociada es transcribe.cpp, una implementación orientada a inferencia local de modelos ASR.

El modelo resuelve la transcripción de audio a texto en 30 idiomas, con un tamaño de 2.038.078.608 parámetros (aproximadamente 2.000 millones) y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su interés actual radica en que ofrece una alternativa de dictado y transcripción completamente offline, sin envío de audio a servicios en la nube, con cuantizaciones que reducen el peso a entre 1,69 GB (Q6_K) y 2,19 GB (Q8_0).

Este repositorio concreto no incluye pesos nuevos ni cambios en los tensores: es una réplica de las cuantizaciones Q8_0 y Q6_K publicadas por handy-computer. Para el resto de cuantizaciones hay que acudir al repositorio original. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de la familia Qwen3; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 2.038.078.608 (dato de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q6_K en este repositorio; otras cuantizaciones en handy-computer/Qwen3-ASR-1.7B-gguf |
| Idiomas soportados | 30: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0: 2.185.030.624 bytes; Q6_K: 1.692.554.208 bytes) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un modelo de la familia Qwen3 orientado a reconocimiento automático de voz (pipeline `automatic-speech-recognition`), con aproximadamente 2.000 millones de parámetros. El repositorio es una conversión a GGUF para transcribe.cpp, no una reimplementación: los pesos son copias byte a byte de los publicados por handy-computer (commit `92282af`), por lo que no hay cambios en los tensores ni reentrenamiento.

Tampoco se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card únicamente atribuye la autoría del modelo a Qwen (Alibaba Cloud) y la conversión a los autores de transcribe.cpp, sin detallar innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de audio a texto (speech-to-text) en 30 idiomas, incluidos chino, inglés, cantonés, árabe, alemán, francés, español, portugués, coreano, ruso, japonés, hindi y turco, entre otros.
- Dictado offline y privado: el modelo está pensado para ejecutarse localmente en la aplicación Herald, sin enviar audio a servicios externos.
- Soporte multilingüe amplio con cobertura de lenguas europeas, asiáticas y de Oriente Medio.
- Ejecución mediante transcribe.cpp, una librería específica para inferencia de modelos ASR.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento (thinking mode).

## Casos de uso

- Dictado por voz en el escritorio: Herald utiliza este modelo para convertir voz en texto de forma local, lo que permite redactar documentos o correos sin que el audio salga del equipo.
- Transcripción de reuniones confidenciales: al ejecutarse offline con pesos de 1,69-2,19 GB, puede procesar grabaciones internas en entornos con requisitos de privacidad estrictos.
- Subtitulado de vídeo en múltiples idiomas: la cobertura de 30 idiomas permite generar subtítulos para contenido en inglés, chino, español, árabe o japonés con un único modelo.
- Aplicaciones de accesibilidad: conversión de voz a texto en tiempo real para personas con movilidad reducida, integrada en herramientas de escritorio mediante transcribe.cpp.
- Procesamiento por lotes de archivos de audio: transcripción de archivos previamente grabados en pipelines locales, sin dependencia de API de pago.
- Investigación en ASR multilingüe: uso como línea base reproducible con licencia Apache 2.0 para experimentos de reconocimiento de voz en 30 idiomas.
- Integración en productos de terceros: la licencia permisiva permite incorporar el modelo en software comercial de dictado o transcripción sin obligaciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB para la cuantización Q8_0 y 1,7 GB para Q6_K, a los que hay que sumar el espacio de trabajo del runtime.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el modelo es apto para GPU de consumo con al menos 4 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 y superiores), aunque no hay confirmación oficial en la documentación.
- Opciones de despliegue: transcribe.cpp es la librería indicada; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-gguf (este) | ~2,04 B | no disponible | 30 | Apache 2.0 | GGUF (Q8_0, Q6_K) |
| Qwen/Qwen3-ASR-1.7B (original) | ~2,04 B | no disponible | 30 | Apache 2.0 | safetensors |
| handy-computer/Qwen3-ASR-1.7B-gguf | ~2,04 B | no disponible | 30 | Apache 2.0 | GGUF (todas las cuantizaciones) |

No se dispone de datos de rendimiento comparado con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio solo contiene las cuantizaciones Q8_0 y Q6_K; para otras cuantizaciones hay que usar el repositorio original de handy-computer.
- No se documentan sesgos conocidos, pero al ser un modelo multilingüe entrenado por un tercero, es previsible un rendimiento desigual entre idiomas; no hay datos que lo cuantifiquen.
- Riesgo de alucinación en la transcripción: no se han publicado métricas de tasa de error (WER) en la información disponible.
- No se documentan limitaciones de longitud de audio ni de contexto; se desconoce el máximo de duración procesable por segmento.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y la atribución a Qwen (Alibaba Cloud) y a los autores de la conversión.
- Para producción, conviene verificar la integridad de los ficheros mediante los SHA-256 publicados (Q8_0: `9a0d8179...`; Q6_K: `c75a961b...`).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/herald-dictation/Qwen3-ASR-1.7B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Conversión original GGUF: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
