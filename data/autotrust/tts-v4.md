# autotrust/TTS-V4

## Resumen

TTS-V4 es un modelo de síntesis de voz (text-to-speech) en chino desarrollado por el usuario autotrust, obtenido mediante ajuste fino del modelo base Qwen/Qwen3-TTS-12Hz-1.7B-Base sobre grabaciones telefónicas reales. Se distribuye como modelo completo ya fusionado en BF16, de modo que no requiere descargar el modelo base ni cargar adaptadores LoRA por separado. Su propósito declarado es la lectura literal de guiones de atención al cliente, ventas y cobros, priorizando un timbre y una prosodia próximos a una locución telefónica humana, sin reescritura coloquial del texto.

La novedad principal es el soporte de streaming bidireccional: el texto puede alimentarse de forma incremental (por ejemplo, directamente desde la salida en streaming de un LLM) mientras el audio se emite en tramas de 80 ms y puede cancelarse en cualquier momento para permitir interrupciones del usuario. Ofrece seis voces fijas derivadas de grabaciones de referencia reales, además de voces personalizadas mediante audio de referencia y su transcripción.

Con 1.928.677.440 parámetros y un repositorio de 4,6 GB, el modelo está orientado exclusivamente al idioma chino y a despliegues de baja latencia en entornos de contact center. La licencia figura como "other", por lo que las condiciones de uso comercial deben consultarse en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_tts (modelo de síntesis de voz basado en Qwen3-TTS, formato de streaming a 12 Hz) |
| Parametros totales | 1.928.677.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en BF16) |
| Idiomas soportados | chino (zh) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-TTS-12Hz-1.7B-Base, un sistema de síntesis de voz con representación de audio a 12 Hz, y se ha ajustado sobre grabaciones telefónicas reales para adaptar el timbre y la prosodia al dominio de contact center. El resultado se publica como modelo completo fusionado en BF16. La model card no detalla el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible.

La innovación técnica destacable es el streaming bidireccional con dos ejes configurables. El parámetro `mode` controla cómo se imita la voz: `icl` (in-context learning) emplea el audio de referencia y su transcripción para lograr mayor similitud de timbre y acento, mientras que `xvec` comprime la referencia en un vector de hablante, lo que mejora la precisión de lectura y reduce la latencia inicial. El parámetro `segment` controla cómo se alimenta el texto: `sentence` acumula el texto hasta el final de frase (punto, exclamación, interrogación, punto y coma o salto de línea, con corte en la última coma si se superan 60 caracteres) y `token` entrega el texto token a token. La generación de audio se emite en tramas de 80 ms y admite cancelación mediante `cancel()`. El motor incluye normalización de texto en línea que convierte números, importes, fechas y términos en inglés a su lectura en chino.

## Capacidades

- Síntesis de voz en chino para lectura literal de guiones, sin reescritura coloquial del texto.
- Streaming bidireccional: entrada incremental de texto y salida de audio en tramas de 80 ms.
- Cancelación e interrupción de la síntesis en curso (`cancel()`), apta para escenarios de barge-in.
- Clonación de voz con seis voces fijas basadas en grabaciones reales: `bank_collection_female`, `sales_male`, `service_male`, `sales_female`, `service_female` y `bank_collection_male`.
- Voces personalizadas mediante audio de referencia en WAV (base64) más su transcripción (`ref_text`).
- Dos modos de imitación de voz (`icl` y `xvec`) y dos modos de segmentación de texto (`sentence` y `token`).
- Control de velocidad de habla entre 0,5 y 2,0.
- Control de temperatura de muestreo (recomendado entre 0,7 y 0,9) y semilla para reproducibilidad.
- Remuestreo de salida a 8000, 16000 o 24000 Hz.
- Servicio WebSocket con protocolo definido para integrar texto y audio en tiempo real.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Atención al cliente en tiempo real: el modelo se conecta a la salida en streaming de un LLM y lee las respuestas con `mode="icl"` y `segment="sentence"`, con un primer paquete de audio de 0,1 a 0,25 s tras completarse la primera frase, lo que permite conversaciones fluidas.
- Agentes de voz con interrupción: la cancelación mediante `cancel()` o el mensaje `cancel` por WebSocket permite detener la locución cuando el usuario habla encima, requisito habitual en sistemas de barge-in.
- Cobros y avisos de deuda: las voces `bank_collection_female` y `bank_collection_male` están adaptadas al dominio de cobros, con lectura literal de importes y fechas mediante la normalización de texto integrada.
- Avisos IVR y mensajes pregrabados dinámicos: para textos completos conocidos de antemano se puede usar la síntesis offline `synthesize()` o el streaming con el texto completo, con una latencia de primer paquete de 0,2 a 0,4 s.
- Campañas de ventas salientes: la voz `sales_male` y `sales_female` permiten generar guiones de venta con prosodia telefónica, ajustando la velocidad con `--speed` para adaptarse al ritmo deseado.
- Integración en pipelines de LLM: la API Python (`stream_sentences`) y el servidor WebSocket permiten encadenar la generación de texto de un modelo de lenguaje con la síntesis de voz sin esperar a que el texto esté completo.
- Personalización de marca: creación de voces propias a partir de una grabación de referencia y su transcripción, útil para mantener una identidad sonora consistente en todos los canales telefónicos.

## Benchmarks y rendimiento

La model card incluye mediciones de latencia y calidad realizadas sobre un guion largo de aproximadamente 230 caracteres, con entrada de texto a 30 caracteres por segundo y temperatura 0,8, en una GPU H200 compartida con otras tareas. No se publican resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros); esos datos no están disponibles.

| Combinacion | Primer paquete (service_female) | Primer paquete (bank_collection_female) | Pausas acumuladas en reproduccion | Errores ASR (sobre 180 caracteres) |
|---|---|---|---|---|
| icl + sentence | 593 ms | 501 ms | 0,12–0,13 s | 0 / 2 |
| icl + token | 3724 ms | 2275 ms | 0,12 s | 0 / 1 |
| xvec + token | 210 ms | 217 ms | 0,38 s | 1 / 1 |
| xvec + sentence | 487 ms | 493 ms | 0,12 s | 0 / 0 |

Datos adicionales de rendimiento:

| Metrica | Valor |
|---|---|
| Umbral de arranque en icl + token por voz | bank_collection_female 42 tokens (4,9 s de referencia); sales_male 58 (6,0 s); service_male 61 (7,0 s); sales_female 67 (6,7 s); service_female 68 (7,1 s); bank_collection_male 71 (7,9 s) |
| RTF (factor de tiempo real) en una sola via | aproximadamente 0,6 (unas 1,7 veces la velocidad real) |
| Concurrencia | una sola via por proceso; las vias adicionales se encolan |
| Sobrecoste de duracion en modo por frases | entre un 2 % y un 37 % respecto a la síntesis offline de una sola pasada (media aproximada del 22 % en las seis voces) |

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia estructural, el modelo deriva de Qwen/Qwen3-TTS-12Hz-1.7B-Base, del que se diferencia por el ajuste sobre audio telefónico, la fusión completa de pesos y el motor de streaming bidireccional.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| autotrust/TTS-V4 | 1.928.677.440 | no disponible | zh | other | safetensors (BF16) |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta chino (zh); no se documenta soporte multilingüe.
- La licencia es "other": es imprescindible revisar las condiciones del repositorio antes de cualquier uso comercial, especialmente en producción telefónica.
- El modo `icl + token` no es apto para tiempo real: requiere entre 42 y 71 tokens de texto (aproximadamente 70–120 caracteres, según la voz) antes de emitir audio, lo que supone latencias de 2 a 4 s.
- El modo `xvec` reduce la similitud de timbre y la naturalidad respecto a `icl`.
- En modo `token`, la normalización de texto solo entrega el contenido al modelo en los signos de puntuación, por lo que las cadenas numéricas (por ejemplo, números de pedido) no se leen hasta que aparece un signo de puntuación posterior; se recomienda que el LLM emplee puntuación de forma regular.
- La segmentación por frases introduce pausas entre frases y alarga la duración total entre un 2 % y un 37 % respecto a la síntesis de una sola pasada.
- Las pausas de reproducción pueden aparecer cuando el LLM es más lento que la reproducción; se mitigan con un búfer de 300–500 ms en el cliente y con frases más cortas.
- Un proceso genera una sola vía simultánea; las peticiones concurrentes se encolan, lo que limita el despliegue multiusuario en una sola GPU sin escalado horizontal.
- No se han publicado datos sobre sesgos, tasas de alucinación en la lectura ni evaluaciones de robustez fuera del dominio telefónico.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 16 de noviembre de 2026, por lo que su validación por la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/TTS-V4
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Tutorial de instalación, integración con LLM, despliegue y ajuste: TUTORIAL.md en el repositorio del modelo
- Scripts incluidos en el repositorio: `synthesize.py`, `stream_server.py`, `stream_client.py`, `verify_files.py`, `inference.py`
- Artículos, papers, blogs o demos adicionales: no disponible
