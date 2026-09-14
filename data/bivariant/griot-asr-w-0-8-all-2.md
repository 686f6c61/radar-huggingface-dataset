# bivariant/Griot-ASR-W-0.8-ALL

## Resumen

Griot-ASR-W-0.8-ALL es un sistema de reconocimiento automático del habla (ASR) multilingüe desarrollado por Bivariant, centrado específicamente en lenguas africanas. Se construye sobre una base Whisper compartida de 808.878.080 parámetros a la que se acoplan adaptadores ligeros por idioma, de modo que un único repositorio sirve tanto el modelo base como los adaptadores de cada lengua. El proyecto declara cobertura de 18 lenguas africanas, con 6 adaptadores ya validados, 5 en estado *Preview* y 7 en incorporación progresiva.

El problema que aborda es concreto: la mayoría de los sistemas ASR comerciales tienen un rendimiento muy degradado en lenguas africanas, y los que las soportan suelen perder diacríticos y fallar con habla espontánea frente a lectura de frases aisladas. Griot-ASR se distingue por dos decisiones de diseño: conservación estricta de los signos diacríticos en las lenguas validadas y optimización para habla natural. Está publicado bajo licencia Apache-2.0, con pesos en safetensors y soporte para `transformers` mediante código remoto (`trust_remote_code=True`).

La relevancia actual viene de su naturaleza modular: en lugar de entrenar un modelo completo por lengua, reutiliza el mismo tronco Whisper y añade adaptadores, lo que abarata la incorporación de nuevas lenguas. No obstante, el rendimiento medido es desigual según la lengua: el WER va del 10,52% en un conjunto de test de ewé al 38,44% en otro conjunto de la misma lengua y al 37,52% en somalí, lo que refleja tanto la dificultad de la tarea como la fuerte dependencia del dominio del conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo transformer (base Whisper) con adaptadores ligeros por idioma |
| Parametros totales | 808.878.080 (modelo base compartido) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; heredada de Whisper (ventanas de audio de 30 s, extractor de características Whisper) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | 18 lenguas africanas declaradas; 6 disponibles (baatonou `bba`, ewé `ewe`, fon `fon`, fulfulde/peul `fub`, lingala `lin`, somalí `som`), 5 en Preview (baoulé `bci`, dioula `dyu`, mooré `mos`, sango `sag`, swahili `swh`) y 7 en llegada progresiva (ewondo `ewo`, hausa `hau`, luganda `lug`, sar `mwm`, oromo `orm`, shona `sna`, wolof `wol`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Autor | bivariant |
| Biblioteca | transformers (requiere código remoto) |
| Dependencias declaradas | `transformers==5.12.1`, `peft==0.20.0`, `torchao==0.18.0` |
| Pipeline | automatic-speech-recognition |
| Tamano del repositorio | 15,1 GB |
| Descargas / likes en HuggingFace | 184 descargas, 2 likes |
| Fecha de creacion / actualizacion | 27 de agosto de 2026 / 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón encoder-decoder de Whisper. El repositorio aloja un modelo base compartido y un conjunto de adaptadores por lengua que se cargan por separado: la selección de idioma no se hace con un método de cambio en caliente, sino volviendo a llamar a `AutoModelForSpeechSeq2Seq.from_pretrained(..., language="<idioma>")` y cargando el tokenizador desde el subdirectorio correspondiente (`subfolder="<idioma>"`). El stack declarado incluye `peft` y `torchao`, lo que es coherente con adaptadores de tipo LoRA y con optimizaciones de cuantización propias de torchao, aunque la model card no detalla la configuración exacta de los adaptadores (rango, capas objetivo, número de parámetros entrenables).

No se publican datos sobre el número de tokens de audio utilizados, la composición del dataset ni si hubo etapas de RLHF o DPO. Sí se indica que el adaptador de ewé se entrenó sobre un corpus combinado y se evaluó por separado en dos conjuntos de test (Waxal v2 y Nelver28), y se advierte explícitamente que las puntuaciones de ambos conjuntos no son comparables entre sí. La innovación técnica declarada es la modularidad: un tronco Whisper común más adaptadores por lengua, con compatibilidad nativa con Whisper en algunas lenguas (marcadas como `+wh`) que ya obtenían reconocimiento zero-shot y que aquí se mejoran mediante ajuste fino.

## Capacidades

- Transcripción de voz a texto en 18 lenguas africanas declaradas, de las cuales 6 cuentan con adaptadores validados y métricas publicadas.
- Conservación estricta de signos diacríticos en las lenguas ya validadas, un punto crítico en ortografías como el ewé o el fon.
- Transcripción de habla natural y espontánea, no limitada a lectura de frases aisladas.
- Reconocimiento zero-shot parcial en lenguas que Whisper ya cubre de forma nativa (lingala y somalí marcadas como `+wh`), mejorado mediante el adaptador específico.
- Carga de un modelo base sin adaptador de lengua, además de la carga con adaptador, según el ejemplo de inferencia de la model card.
- Compatibilidad con el ecosistema `transformers` mediante `AutoModelForSpeechSeq2Seq`, `WhisperProcessor`, `WhisperTokenizer` y `WhisperFeatureExtractor`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta traducción de voz, diarización de hablantes, marcas de tiempos a nivel de palabra ni detección de idioma automática.
- No se documenta comportamiento ante code-switching; la propia model card lo señala como fuente potencial de variación en las métricas.

## Casos de uso

- Archivado de patrimonio oral: digitalización y transcripción de grabaciones de tradición oral, radio comunitaria y testimonios en lenguas como baatonou, fulfulde o ewé, donde el modelo conserva diacríticos que otros sistemas tienden a eliminar.
- Subtitulado de contenido audiovisual: generación de subtítulos para vídeo y pódcast en lingala, somalí o swahili, asumiendo una revisión humana posterior dado el WER observado en algunos idiomas.
- Atención al cliente en centros de llamadas: transcripción de conversaciones en lenguas locales para su análisis posterior (motivos de contacto, control de calidad), eligiendo el adaptador por idioma y gestionando el cambio de modelo por recarga `from_pretrained`.
- Documentación clínica o administrativa dictada: transcripción de notas de voz en entornos con conectividad limitada, usando el modelo en local sobre GPU de gama media o CPU, sin envío de audio a servicios externos.
- Preanotación de corpus lingüísticos: generación automática de transcripciones iniciales que investigadores corrigen después, reduciendo el coste de anotación manual para lenguas con pocos recursos.
- Interfaces de voz e IVR: integración como capa ASR en asistentes de voz y kioscos para servicios públicos o financieros en zonas donde la lengua de uso no es el inglés ni el francés.
- Accesibilidad: transcripción en directo de eventos, clases o reuniones para personas con discapacidad auditiva en comunidades hablantes de estas lenguas.
- Moderación y análisis de audio a escala: transcripción por lotes de grandes volúmenes de audio para búsqueda, indexación o revisión de contenido, aprovechando que el modelo se ejecuta localmente.

## Benchmarks y rendimiento

Métricas publicadas por el autor para las lenguas en estado *Disponible*, medidas sobre conjuntos de test dedicados por lengua. `+wh` indica lengua ya soportada de forma nativa por Whisper en zero-shot.

| Codigo ISO | Idioma | Muestras (test) | CER | WER |
|---|---|---|---|---|
| `lin` +wh | Lingala | 2 906 | 11,67% | 32,36% |
| `bba` | Baatonou | No indicado | 9,09% | 22,16% |
| `fub` | Peul / Fulfulde | 3 022 | 12,40% | 28,24% |
| `fon` | Fon | 3 081 | 11,16% | 18,62% |
| `som` +wh | Somalí | 3 081 | 11,16% | 37,52% |
| `ewe` | Ewé — Waxal v2 | 1 884 | 12,44% | 38,44% |
| `ewe` | Ewé — Nelver28 | 2 931 | 2,97% | 10,52% |

Observaciones sobre los datos publicados:

- Las entradas de `fon` y `som` presentan valores idénticos de CER (11,16%) y de número de muestras (3 081) con WER distinto (18,62% y 37,52%). El patrón sugiere un posible error de copia en la model card; conviene tratarlo con cautela.
- El adaptador de ewé se entrenó sobre un corpus combinado y se evalúa en dos conjuntos separados. El autor advierte que las dos puntuaciones no son directamente comparables entre sí, y la diferencia entre ambos (10,52% frente a 38,44% de WER) es un indicador claro de la dependencia del dominio.
- El conjunto `bba` no publica número de muestras de test.
- No hay métricas publicadas para las lenguas en *Preview* ni en llegada progresiva.
- No se han publicado comparaciones head-to-head contra otros sistemas ASR en los mismos conjuntos de test.

## Requisitos de hardware

- VRAM estimada, precisión completa (fp16/bf16): en torno a 1,6 GB solo para los pesos del modelo base de 808,9 M de parámetros, más activaciones y caché de decodificación; en la práctica, 2-4 GB de VRAM son suficientes para inferencia de un único audio.
- VRAM estimada, int8: del orden de 0,8-1 GB de pesos, con un total de 1,5-2 GB de VRAM incluyendo overhead.
- VRAM estimada, int4: del orden de 0,4-0,5 GB de pesos; viable en GPUs con 2 GB o en CPU, aunque no se documentan pesos cuantizados publicados.
- Adaptadores por lengua: el coste adicional de un adaptador LoRA es pequeño frente al tronco, pero el repositorio completo ocupa 15,1 GB porque incluye varios adaptadores y tokenizadores; el tamaño individual de cada adaptador no se especifica.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM sirve para uso en producción de un solo flujo, incluidas T4, L4, A10, RTX 3060, RTX 4070 o RTX 4090. Para procesamiento por lotes a escala conviene A100, H100 o L40S, donde el cuello de botella será el preprocesado de audio y no los pesos.
- Cabe en GPU de consumo: sí, con margen amplio en fp16 sobre cualquier GPU de 8 GB o más, y también en tarjetas de 4 GB con cuantización. También es viable en CPU para transcripción por lotes no interactiva.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada, junto con `peft` y `torchao`. El uso de vLLM, TGI, llama.cpp, Ollama o faster-whisper no está confirmado: los adaptadores y el código remoto complican la conversión a GGUF y su integración en motores que no soporten `peft` sobre Whisper. Requiere versiones concretas (`transformers==5.12.1`, `peft==0.20.0`, `torchao==0.18.0`), lo que limita la elección de entorno.
- Latencia y throughput: no disponible. No se publican mediciones de RTF, latencia por minuto de audio ni rendimiento en lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / audio | Licencia | Cobertura |
|---|---|---|---|---|---|
| bivariant/Griot-ASR-W-0.8-ALL | 808,9 M (base compartida + adaptadores) | Whisper + adaptadores por lengua | Ventanas de audio de 30 s (herencia Whisper) | Apache-2.0 | 18 lenguas africanas declaradas, 6 validadas |
| openai/whisper-large-v3 | 1 550 M | Encoder-decoder Whisper monolítico multilingüe | Ventanas de audio de 30 s | Apache-2.0 | 99 idiomas, con cobertura débil en lenguas africanas de bajos recursos |
| facebook/mms-1b-all | 1 000 M | Adaptadores por lengua sobre un tronco compartido | Ventanas de audio cortas | CC-BY-NC-4.0 (no comercial) | Más de 1 000 lenguas, incluidas muchas africanas |

La comparación de rendimiento entre estos tres sistemas en los mismos conjuntos de test no está disponible: Griot-ASR publica métricas sobre conjuntos propios por lengua y no hay evaluación cruzada contra Whisper large-v3 ni contra MMS-1b-all. La diferencia relevante y verificable es de licencia y de enfoque: Griot-ASR es Apache-2.0 y por tanto utilizable comercialmente, mientras que MMS-1b-all tiene licencia no comercial. Whisper large-v3 no está especializado en estas lenguas ni aplica adaptadores por idioma.

## Limitaciones y advertencias

- Rendimiento desigual: el WER publicado oscila entre el 10,52% y el 38,44% según la lengua y el conjunto de test, con valores superiores al 30% en lingala, somalí y ewé (Waxal v2). Un WER de esa magnitud implica errores frecuentes en palabras y exige revisión humana en usos sensibles.
- Cobertura incompleta: solo 6 de las 18 lenguas declaradas están validadas y con métricas. Las 12 restantes están en Preview o en llegada progresiva, sin métricas públicas.
- El repositorio contiene adaptadores correspondientes a estados de despliegue distintos; cargar un idioma no validado puede dar resultados no representativos de la calidad final.
- Dependencia del dominio: el propio autor advierte que los resultados varían según el dominio, el dialecto, las convenciones ortográficas y la presencia de code-switching.
- Posible errata en las métricas publicadas: `fon` y `som` comparten CER y número de muestras con WER distinto, lo que sugiere un error de transcripción de datos en la model card.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor. Es un riesgo de seguridad que debe evaluarse antes de desplegar en producción.
- Versiones de dependencias muy específicas (`transformers==5.12.1`, `peft==0.20.0`, `torchao==0.18.0`) que pueden entrar en conflicto con otros modelos del mismo entorno.
- El cambio de idioma requiere recargar el modelo con `from_pretrained`; no hay un método de cambio en caliente. En un servicio multilingüe esto implica gestionar varias instancias o recargas costosas.
- No se documentan sesgos, tasas de alucinación ni comportamiento diferencial por género, edad o acento de los hablantes. Tampoco se detalla la procedencia y licencia de los corpus de entrenamiento, algo relevante para auditar el uso comercial aunque la licencia del modelo sea Apache-2.0.
- No se documentan marcas de tiempo a nivel de palabra ni diarización, capacidades habitualmente necesarias en subtitulado y análisis de llamadas.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo Whisper base y de los corpus empleados en los adaptadores antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bivariant/Griot-ASR-W-0.8-ALL
- Perfil de GitHub del autor: https://github.com/bivariant
- Sitio de Bivariant: https://bivariant.com
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos corresponden a definiciones de diccionario y a una plataforma de búsqueda federada sin relación con Griot-ASR, por lo que no se incluyen.
- Paper, blog técnico o demo: no disponible.
