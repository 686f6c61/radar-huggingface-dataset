# gagni/piper-voices

## Resumen

`gagni/piper-voices` es un espejo sin modificaciones del repositorio `rhasspy/piper-voices`, que contiene los pesos y ficheros de configuración de las voces del sistema de síntesis de voz (TTS) Piper. Lo publica el usuario `gagni` con el objetivo declarado de que su proyecto aSup no dependa de un repositorio de terceros; no se trata de un modelo entrenado por el autor del espejo, sino de una réplica de los artefactos originales en la revisión `e7229f7d33a10e145e109b886d661984201ac3c4`.

Piper es un sistema TTS neuronal ligero, orientado a inferencia local y en tiempo real sobre CPU, que emplea modelos en formato ONNX acompañados de ficheros JSON de configuración. Este repositorio agrupa decenas de voces para 35 idiomas, con un tamaño total de 11,9 GB, lo que lo convierte en una fuente práctica para desplegar TTS multilingüe sin conexión.

Su relevancia actual radica en que permite obtener, en una sola descarga, el catálogo completo de voces Piper con una licencia MIT declarada, algo útil para pipelines de accesibilidad, asistentes por voz o generación de audio por lotes en entornos con recursos limitados y sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales TTS de Piper (modelos acústicos y vocoders exportados a ONNX); variantes VITS y modelos basados en phoneme/onnx según la voz |
| Parametros totales | no disponible (varía por voz; no se publica el recuento en la información disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | no disponible; los artefactos se distribuyen como ficheros ONNX, con variantes de calidad por voz (p. ej. low/medium/high) cuando el repositorio original las incluye |
| Idiomas soportados | ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh (35 idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (acompañado de ficheros JSON de configuración por voz) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es un espejo de artefactos ya entrenados del proyecto Piper. Piper emplea modelos neuronales de síntesis de voz exportados a ONNX para permitir inferencia eficiente en CPU, e incluye por voz un modelo acústico y los ficheros de configuración necesarios (fonemas, muestreo, parámetros del vocoder). Según la información disponible, el repositorio original documenta variantes de arquitectura VITS y modelos basados en phoneme/onnx, sin que se detallen en la model card los volúmenes de datos de entrenamiento, la composición de los corpus ni si se aplicaron etapas de ajuste como RLHF o DPO.

No se dispone de información sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal u otras) más allá del propio diseño de Piper: inferencia local, baja latencia y soporte multilingüe. Para entrenar voces propias, la model card remite al repositorio de checkpoints `rhasspy/piper-checkpoints` y a la guía de entrenamiento del proyecto.

## Capacidades

- Síntesis de voz (texto a audio) en 35 idiomas, incluidos español, catalán, inglés, alemán, francés, portugués, ruso, árabe, chino y vietnamita.
- Generación de audio por voz con ficheros de configuración que definen fonemas, frecuencia de muestreo y parámetros del modelo.
- Inferencia local en CPU mediante el runtime de Piper y ONNX, sin necesidad de GPU.
- Múltiples voces por idioma (el repositorio original agrupa distintas voces y calidades), lo que permite seleccionar timbre y compromiso calidad/velocidad.
- No incluye generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No dispone de modo thinking, audio de entrada ni capacidades multimodales más allá del TTS.

## Casos de uso

- Accesibilidad y lectura de pantalla: integración de Piper en aplicaciones de lectores de pantalla o interfaces de accesibilidad para convertir texto en voz en local, con voces en español, catalán e inglés y sin enviar contenido a servicios externos.
- Asistentes de voz para domótica: generación de respuestas habladas en asistentes tipo Rhasspy/Home Assistant, donde la inferencia en CPU y la baja latencia permiten respuestas en tiempo real en dispositivos de gama baja.
- Generación de audiolibros y contenido narrado por lotes: procesamiento de grandes volúmenes de texto con una voz seleccionada por idioma, aprovechando el formato ONNX para ejecución por lotes en servidores sin GPU.
- Anuncios y megafonía automatizada: síntesis de avisos dinámicos en transporte, aeropuertos o comercios, con voces multilingües para atender a públicos diversos desde un único despliegue.
- Localización de vídeos y materiales formativos: generación de pistas de voz en varios idiomas a partir de guiones traducidos, usando las voces disponibles para cada uno de los 35 idiomas soportados.
- Prototipado de productos de voz sin coste de API: creación de demos y pruebas de concepto de interfaces conversacionales con TTS local, evitando cuotas y dependencias de proveedores cloud.
- Sistemas empotrados y edge computing: despliegue en dispositivos con recursos limitados gracias a los modelos ONNX de Piper, que están diseñados para ejecutarse sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso habitual; Piper está diseñado para ejecutarse en CPU. En caso de usar aceleración por GPU, el consumo es reducido, aunque no se dispone de cifras concretas en la información proporcionada.
- GPU recomendadas: no disponibles; el sistema no requiere GPU y no se documentan requisitos específicos de A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: sí, en la medida en que puede ejecutarse en CPU; no se detallan requisitos de GPU de consumo concretos.
- Opciones de despliegue: runtime de Piper (piper-tts), ejecución de modelos ONNX con ONNX Runtime; integraciones habituales con Rhasspy/Home Assistant. No se documentan opciones como vLLM, TGI o llama.cpp, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gagni/piper-voices (espejo de rhasspy/piper-voices) | TTS neuronal local (Piper) | 35 | ONNX + JSON | MIT | Hugging Face (espejo) |
| rhasspy/piper-voices (original) | TTS neuronal local (Piper) | 35 | ONNX + JSON | MIT | Hugging Face (repositorio original) |
| Coqui TTS | TTS neuronal | Múltiples (no detallado) | PyTorch y otros | MPL-2.0 (según proyecto) | Código abierto y Hugging Face |
| Modelos TTS comerciales en la nube | TTS como servicio | Múltiples | API | Propietaria | Servicios gestionados |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a tipo, idiomas, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un espejo no oficial: la autoría, el mantenimiento y las actualizaciones dependen del repositorio original `rhasspy/piper-voices`; el espejo puede quedar desactualizado respecto al original.
- No es un modelo entrenado por el autor del espejo; los créditos y licencias corresponden al proyecto Piper y a los autores de cada voz, según se indica en la model card y en los ficheros adjuntos.
- La licencia MIT se declara a nivel de repositorio, pero conviene verificar la licencia y atribución de cada voz concreta en su model card o ficheros acompañantes antes de un uso comercial.
- Calidad y naturalidad variables según la voz y el idioma; no se publican métricas objetivas (MOS, WER) en la información disponible.
- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas y no admite tool calling.
- Riesgo de errores de pronunciación en nombres propios, siglas, neologismos y texto no normalizado; requiere normalización textual y, en su caso, fonetización previa.
- Cobertura desigual entre idiomas: el número de voces y calidades por idioma no se detalla en la información proporcionada.
- El tamaño del repositorio (11,9 GB) implica una descarga considerable y espacio en disco; conviene descargar solo las voces necesarias en lugar del catálogo completo.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gagni/piper-voices
- Repositorio original espejado: https://huggingface.co/rhasspy/piper-voices
- Proyecto Piper (GitHub): https://github.com/rhasspy/piper
- Guía de entrenamiento de voces Piper: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- Checkpoints para entrenar voces: https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main
