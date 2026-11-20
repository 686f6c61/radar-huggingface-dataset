# moravianai/CzechSpeech-Enterprise

## Resumen

CzechSpeech-Enterprise es un modelo de reconocimiento automático del habla (ASR) desarrollado por moravianai, un proyecto centrado en tecnologías del lenguaje para checo y eslovaco. Se trata de un fine-tuning del modelo base CzechSpeech, que a su vez deriva de la familia Whisper de OpenAI, y está empaquetado en formato GGUF para su ejecución con whisper.cpp. Con 124,4 millones de parámetros, está diseñado para dictado y transcripción en dispositivo (on-device), priorizando latencia baja y despliegue local frente a modelos ASR de mayor tamaño.

El modelo cubre tres idiomas: checo (cs), eslovaco (sk) e inglés (en), y ha sido entrenado sobre una mezcla de corpus públicos como ParCzech4Speech, SloPalSpeech, YODAS, FLEURS, VoxPopuli y LibriSpeech. Su orientación "Enterprise" se refleja en una licencia comercial específica (moravian-ai-commercial) y en un acceso restringido en Hugging Face que requiere aceptar condiciones, lo que lo diferencia de los Whisper originales publicados bajo licencia MIT.

Es relevante ahora porque cubre un nicho poco atendido: el ASR de alta calidad para checo y eslovaco en entornos sin conectividad o con requisitos de privacidad, donde enviar audio a la nube no es viable. Su formato GGUF y su integración con whisper.cpp lo hacen desplegable en hardware modesto, incluyendo CPU y GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), empaquetado GGUF para whisper.cpp |
| Parámetros totales | 124.439.808 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s típica de Whisper; no confirmado en la información proporcionada) |
| Tipos de cuantización | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | Checo (cs), eslovaco (sk), inglés (en) |
| Licencia | moravian-ai-commercial (acceso restringido, requiere aceptación) |
| Formato de pesos | GGUF (whisper.cpp / ggml) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper: un transformer encoder-decoder con atención completa que procesa espectrogramas mel de audio y genera transcripciones autorregresivamente. Con 124,4 millones de parámetros, corresponde al tamaño "small" de la familia Whisper, lo que equilibra calidad y coste computacional para inferencia en dispositivo. El empaquetado en GGUF y su compatibilidad con whisper.cpp indican que los pesos están optimizados para ejecución en CPU y GPU con cuantización de baja precisión.

El entrenamiento parte de moravianai/CzechSpeech como modelo base y se ha realizado un fine-tuning adicional sobre un conjunto de datos que incluye ParCzech4Speech (no segmentado), SloPalSpeech, YODAS (yodas-granary y yodas), FLEURS, VoxPopuli y LibriSpeech. Esta composición combina corpus parlamentarios checos, habla eslovaca, datos web a gran escala y benchmarks multilingües, lo que sugiere un esfuerzo por cubrir dominios y acentos diversos. No se dispone de información sobre el número exacto de tokens de audio, la composición porcentual del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR supervisado). Las referencias arXiv asociadas (2509.06675, 2509.19270, 2205.12446, 1510.08484, 2010.00475) apuntan a los papers de Whisper y a trabajos sobre los corpus utilizados, pero no se detalla en la información proporcionada qué innovaciones técnicas específicas introduce este fine-tuning.

## Capacidades

- Transcripción de voz a texto en checo, eslovaco e inglés.
- Reconocimiento de habla en tiempo real orientado a dictado (tag "dictation").
- Ejecución on-device mediante whisper.cpp y el formato GGUF, sin dependencia de servicios en la nube.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que permite desplegarlo tras una API HTTP.
- Manejo de audio de diversa procedencia gracias al entrenamiento con corpus parlamentarios, web y de lectura.
- Detección y transcripción multilingüe dentro de los tres idiomas soportados.
- No se ha documentado soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (no aplicables a un modelo ASR).

## Casos de uso

- Dictado en escritorio y móvil sin conexión: gracias a su tamaño de 124 M de parámetros y formato GGUF, puede ejecutarse en portátiles y dispositivos móviles para transcribir voz a texto en checo o eslovaco sin enviar audio a la nube, preservando la privacidad.
- Transcripción de reuniones y actas: el modelo puede procesar grabaciones de reuniones en checo o eslovaco y generar actas textuales; su entrenamiento con corpus parlamentarios (ParCzech4Speech) lo hace adecuado para habla formal y discurso público.
- Subtitulado automático de vídeo: integrado en pipelines de postproducción, permite generar subtítulos en checo, eslovaco o inglés para contenido audiovisual local, con la ventaja de ejecutarse en hardware de consumo.
- Atención al cliente con transcripción local: en centros de contacto que requieren cumplimiento de protección de datos, el modelo transcribe llamadas en el propio servidor, evitando el envío de audio a terceros.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones presenciales o clases en checo y eslovaco mediante una aplicación de escritorio basada en whisper.cpp.
- Investigación lingüística y corpus: generación de transcripciones para estudios de fonética o sociolingüística en checo y eslovaco, aprovechando el entrenamiento sobre corpus diversos (FLEURS, VoxPopuli, ParCzech).
- Integración en sistemas de voz a texto para administración pública: dado su enfoque "Enterprise" y licencia comercial, puede desplegarse en entornos institucionales que requieren transcripción de documentos orales en checo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 124 M de parámetros, en cuantización GGUF de 8 bits ocuparía aproximadamente 0,15 GB; en 16 bits, unos 0,25 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos confirmados.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 pueden ejecutarlo con holgura, aunque el modelo está optimizado para CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU.
- Opciones de despliegue: whisper.cpp (formato GGUF nativo), potencialmente Ollama si soporta GGUF de Whisper, y servidores compatibles con endpoints según el tag "endpoints_compatible". vLLM y TGI no están orientados a Whisper y no se confirman como opciones.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera inferencia en tiempo real o superior en CPU moderna, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| CzechSpeech-Enterprise | 124,4 M | cs, sk, en | no disponible | moravian-ai-commercial (restringida) | GGUF |
| OpenAI Whisper small | 244 M | multilingüe (99 idiomas) | 30 s | MIT | safetensors, GGUF |
| OpenAI Whisper base | 74 M | multilingüe (99 idiomas) | 30 s | MIT | safetensors, GGUF |
| Modelos ASR específicos para checo | no disponible | cs | no disponible | no disponible | no disponible |

La comparación con Whisper small es la más directa por tamaño y arquitectura: CzechSpeech-Enterprise tiene aproximadamente la mitad de parámetros, está especializado en checo y eslovaco con fine-tuning sobre corpus locales, pero su licencia es más restrictiva y su acceso requiere aprobación. Frente a Whisper base, ofrece mayor especialización idiomática a costa de menor cobertura multilingüe. No se dispone de datos de rendimiento comparativo (WER) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con corpus parlamentarios y web, puede presentar sesgos de dominio (habla formal, registros concretos) y peor rendimiento en acentos regionales o habla coloquial no representada.
- Riesgo de alucinación: como todo modelo generativo de ASR, puede producir transcripciones plausibles pero incorrectas en audio con ruido, solapamiento de hablantes o silencios largos.
- Limitaciones de idioma: solo cubre checo, eslovaco e inglés; no se debe esperar buen rendimiento en otros idiomas.
- Restricciones de licencia: la licencia moravian-ai-commercial y el acceso restringido (gated) implican condiciones específicas para uso comercial que deben revisarse antes de desplegar en producción; no es una licencia permisiva como MIT.
- Caveat de producción: el modelo está empaquetado en GGUF para whisper.cpp, lo que limita su integración con frameworks de inferencia GPU de alto rendimiento (vLLM, TGI) y puede requerir conversión para otros ecosistemas.
- No hay datos publicados de benchmarks ni de tasas de error (WER) que permitan validar su calidad frente a alternativas; se recomienda evaluar con un conjunto propio antes de adoptarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que la comunidad aún no ha validado su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/moravianai/CzechSpeech-Enterprise
- Modelo base: https://huggingface.co/moravianai/CzechSpeech
- Paper Whisper (arXiv:2212.04356, referenciado indirectamente vía 2205.12446 en los tags): https://arxiv.org/abs/2205.12446
- Paper ParCzech (arXiv:2509.06675): https://arxiv.org/abs/2509.06675
- Paper SloPalSpeech (arXiv:2509.19270): https://arxiv.org/abs/2509.19270
- Paper YODAS (arXiv:2509.19270 referenciado en tags; YODAS original: arXiv:2406.00810, no confirmado): no disponible
- Paper FLEURS (arXiv:2010.00475): https://arxiv.org/abs/2010.00475
- Paper VoxPopuli (arXiv:2010.00475 referenciado; original: arXiv:2101.00390, no confirmado): no disponible
- Paper LibriSpeech (arXiv:1510.08484): https://arxiv.org/abs/1510.08484
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
