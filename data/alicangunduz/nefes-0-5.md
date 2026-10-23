# alicangunduz/nefes-0.5

## Resumen

Nefes 0.5 es un sistema de síntesis de voz (text-to-speech) en turco con control explícito de expresividad no verbal: el usuario escribe etiquetas como `[gül]` (risa), `[iç çek]` (suspiro) o `[fısılda]` (susurro) dentro del texto y el sistema inserta ese sonido en el punto exacto, manteniendo el mismo timbre a lo largo de toda la locución. Lo desarrolla Ali Can Gündüz (@alicangunduzdev) y se publica bajo licencia Apache 2.0 como versión 0.5 preview (octubre de 2026).

Su rasgo definitorio es que no entrena nada: es un sistema compuesto que orquesta modelos abiertos de terceros en tiempo de inferencia. La generación acústica la hace VoxCPM2 (openbmb), la temporización de palabras y la inteligibilidad se comprueban con Whisper large-v3, y la similitud de voz se mide con WavLM-SV; encima se aplica un banco de 18 clips no verbales sintéticos, continuación encadenada por segmentos, recorte con lookahead y reranking best-of-6. El problema que ataca es la ausencia de datos abiertos y con licencia de habla expresiva en turco: en lugar de entrenar, toma prestada la risa, el suspiro o el susurro de un modelo expresivo en inglés y deja que un modelo con capacidad en turco continúe desde ahí.

Es relevante porque cubre un hueco concreto: los TTS abiertos en turco leen correctamente pero con tono de locutor de informativos, y los modelos abiertos que ríen solo hablan inglés, mientras que los servicios que hacen ambas cosas son API cerradas de pago. El precio a pagar es el rendimiento: requiere una GPU NVIDIA de ~16 GB y tarda unos 30 s en generar una frase de 6 s, por lo que está pensado para producción por lotes y no para asistentes en tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema compuesto (pipeline) de TTS sin entrenamiento; la generación acústica la realiza VoxCPM2 y el resto es orquestación en inferencia (prompting de audio, continuación encadenada, recorte con lookahead y reranking). Arquitectura interna de VoxCPM2: no disponible en la información proporcionada |
| Parámetros totales | No disponible. No se publica recuento de parámetros y el sistema no entrena pesos nuevos; depende de VoxCPM2, Whisper large-v3 y WavLM-SV |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el límite práctico lo fijan VoxCPM2 y la segmentación por frases; no se documenta) |
| Tipos de cuantización | No disponible. Se distribuye como librería de inferencia sobre pesos de terceros y no se documentan opciones de cuantización |
| Idiomas soportados | Turco (`tr`). Las etiquetas de emoción se escriben en turco |
| Licencia | Apache 2.0 |
| Formato de pesos | Sin pesos propios en el repositorio (tamaño 0,0 GB). Distribución mediante el paquete pip `nefes` (etiqueta `joblib`); los pesos se descargan en el primer uso desde VoxCPM2, Whisper large-v3 y WavLM-SV |
| Salida de audio | 48 kHz, mono |
| Voz | Una única voz femenina sintética, diseñada con Maya1; no pertenece a ninguna persona real |
| Etiquetas no verbales | `[gül]` (risa), `[iç çek]` (suspiro), `[fısılda]` (susurro) |
| Requisitos de ejecución | GPU NVIDIA con ~16 GB de VRAM (pico medido 14,9 GB), Python ≥ 3.10 |
| Versión y fecha | 0.5 preview, octubre de 2026 (repo creado el 21-10-2026, actualizado el 22-10-2026) |

## Arquitectura y entrenamiento

No hay entrenamiento: la model card lo describe explícitamente como un sistema "training-free" en el que no se entrena ni se modifica ningún peso. La arquitectura es la de un sistema compuesto de IA con cinco piezas encadenadas. Primero, un banco de prompts no verbales con 18 clips sintéticos cortos (risa, suspiro, susurro) generados con Maya1 y validados a oído. Segundo, prompting de audio: VoxCPM2 continúa en turco a partir del audio inmediatamente anterior, de modo que la risa es real y la voz se mantiene. Tercero, continuación encadenada: cada segmento continúa desde el anterior, lo que preserva un único timbre en toda la locución. Cuarto, recorte con lookahead: el texto previo a una etiqueta se genera junto con las palabras siguientes y se corta en la pausa posterior, para conservar la entonación natural de mitad de frase. Quinto, reranking best-of-N: se generan seis candidatos y se puntúan por similitud de voz (WavLM-SV), inteligibilidad (Whisper) y naturalidad (un pequeño modelo de preferencia entrenado con las valoraciones auditivas del propio autor); se devuelve el mejor.

Al no haber entrenamiento, no existen datos de entrenamiento, composición de dataset, ni fases de RLHF/DPO que reportar: la única supervisión es la mencionada en el reranking (puntuaciones de escucha del autor sobre los candidatos, no sobre pesos del modelo). La innovación técnica, por tanto, es de inferencia y no de modelado: banco de prompts no verbales, encadenado con continuidad de voz, recorte con lookahead alineado a pausas y reranking multiobjetivo. El sistema depende en tiempo de ejecución de VoxCPM2 (generación de voz), Whisper large-v3 (temporización de palabras e inteligibilidad) y WavLM-SV (verificación de hablante), cuyas arquitecturas internas no se detallan en la información disponible.

## Capacidades

- Síntesis de voz en turco de 48 kHz mono con una única voz femenina sintética.
- Expresividad no verbal bajo demanda mediante etiquetas en el texto: risa, suspiro y susurro insertados en el punto exacto, con continuación en la misma voz tras el sonido.
- Uso de varias etiquetas en un mismo enunciado (por ejemplo, risa y después suspiro en la misma frase), según los ejemplos de la model card.
- Mantenimiento de un timbre consistente a lo largo de locuciones de varios segmentos gracias al encadenado de continuaciones.
- Entonación de mitad de frase preservada en el texto previo a una etiqueta, mediante recorte con lookahead en la pausa siguiente.
- Selección automática del mejor candidato entre seis, con criterios de similitud de voz, inteligibilidad y naturalidad.
- Interfaz de línea de comandos (`nefes "texto" -o out.wav`) y API de Python (`Nefes.from_pretrained(...)`, `tts.say(...)`, `tts.save(...)`).
- No soporta tool calling, function calling, razonamiento multistep ni agentes: es un sistema de TTS, no un LLM.
- No dispone de clonación de voz, ni de selección de hablante, ni de otros idiomas distintos del turco.

## Casos de uso

- Locución para vídeos y anuncios: el sistema permite colocar `[gül]` o `[iç çek]` donde el guion lo pida y genera el audio por lotes sin edición manual, algo adecuado para piezas cortas donde el coste de ~30 s por frase de 6 s es irrelevante frente a una grabación de estudio.
- Personajes de videojuego y narrativa interactiva: las reacciones no verbales se pueden pregenerar en la fase de build (una risa, un suspiro, un susurro por línea) y servirse como audio estático, evitando la latencia en tiempo de ejecución.
- Audiolibros y pódcast: la continuación encadenada mantiene un único timbre durante toda la locución, lo que evita el cambio de voz entre segmentos y reduce el trabajo de montaje.
- Doblaje y localización al turco de contenido con carga emocional: el sistema conserva la intención del guion original insertando los matices no verbales en los mismos puntos en los que aparecerían en la interpretación humana.
- Investigación en TTS expresivo sin datos de entrenamiento: el pipeline (banco de 18 clips, prompting de audio, reranking best-of-6) es reproducible y sirve como línea base para estudiar control de prosodia sin necesidad de corpus etiquetados en turco.
- Evaluación perceptual y pruebas A/B de emociones: generar seis candidatos por línea y puntuarlos permite montar experimentos de preferencia (tipo MOS) sobre variantes de una misma frase antes de invertir en voces comerciales.
- Accesibilidad y lectura de textos largos con matices: artículos o documentación en turco pueden convertirse a audio con suspiros y cambios de intensidad donde aporten significado, siempre en modo batch y no interactivo.
- Prototipado de interfaces de voz: validar guiones y tono de un asistente o una narración antes de contratar locución humana, asumiendo que el resultado no es válido para producción en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas objetivas de TTS como WER, MOS o SIM documentadas en la model card). Los únicos datos cuantitativos aportados son de tipo operativo y proceden de una ejecución registrada por el autor:

| Métrica operativa | Valor |
|---|---|
| VRAM pico medida | 14,9 GB |
| VRAM recomendada | ~16 GB |
| Tiempo de carga del sistema | ~70 s (tras la descarga inicial de VoxCPM2, Whisper large-v3 y WavLM-SV) |
| Tiempo de generación | ~30 s por frase de 6 s (RTF ≈ 5: 5 s de cómputo por segundo de audio) |
| Candidatos generados por línea | 6 (se devuelve el mejor tras el reranking) |
| Clips del banco no verbal | 18 |
| Resolución de salida | 48 kHz mono |

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB recomendados; pico medido de 14,9 GB con VoxCPM2, Whisper large-v3 y WavLM-SV cargados simultáneamente.
- GPU recomendadas: A100 (40/80 GB), H100 y L40S para entornos de servidor; RTX 4090 o RTX 3090 (24 GB) como estación de trabajo con margen holgado.
- GPU de 16 GB (por ejemplo RTX 4080): técnicamente por encima del pico medido, pero con muy poco margen; cualquier proceso adicional en la misma GPU puede provocar OOM.
- No cabe en GPUs de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4070 12 GB) con esta configuración de tres modelos cargados.
- Opciones de despliegue: paquete pip `nefes` instalado desde el repositorio de HuggingFace, interfaz CLI y API de Python. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un LLM ni de un modelo único.
- Latencia y throughput: ~70 s de carga inicial y ~30 s por frase de 6 s, es decir, del orden de dos frases de 6 s por minuto por GPU (RTF ≈ 5). No es apto para streaming ni para interacción en tiempo real.
- Primer arranque: requiere descargar los pesos de VoxCPM2, Whisper large-v3 y WavLM-SV, por lo que hay que prever espacio en disco y conectividad en el nodo de despliegue.

## Comparativa con modelos similares

| Sistema | Tipo | Idiomas | Expresividad no verbal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nefes 0.5 | Sistema compuesto training-free sobre VoxCPM2 + Whisper + WavLM | Turco | Risa, suspiro y susurro por etiqueta, con seis candidatos y reranking | Apache 2.0 | Pesos propios no incluidos (repo 0,0 GB); código vía pip `nefes` |
| VoxCPM2 (openbmb) | Modelo de generación de voz | Turco (usado como base para continuar en turco) | No documentado en la información disponible | No disponible en la información proporcionada | Pesos abiertos en HuggingFace |
| Maya1 | Modelo de voz expresiva | Inglés (según la model card, los modelos abiertos que ríen son solo en inglés) | Risa, suspiro y susurro; usado aquí para generar la voz y los 18 clips | No disponible en la información proporcionada | Usado como componente del pipeline |
| Servicios de voz en la nube cerrados y de pago | API propietaria | Múltiples, incluido turco (no detallado) | Sí, según la model card | Propietaria, de pago | API en la nube |

No se dispone de parámetros, ventana de contexto ni cifras de rendimiento comparables para estos sistemas en la información proporcionada; la comparación se limita a tipo de sistema, idioma, expresividad y licencia.

## Limitaciones y advertencias

- Una sola voz: no hay clonación, ni selección de hablante, ni control de género o acento. La voz es sintética, diseñada con Maya1, y no corresponde a ninguna persona real.
- Solo turco: no se documenta soporte de otros idiomas; las etiquetas están definidas en turco.
- No es tiempo real: ~30 s por frase de 6 s (RTF ≈ 5) y ~70 s de carga. La model card lo declara explícitamente inadecuado para asistentes en tiempo real.
- Colocación restrictiva de etiquetas: deben ir tras una frase o pregunta completa, no justo después de conjunciones como "çünkü" o "ama"; en ese caso la palabra anterior se lee con tono plano de final de frase.
- Solo tres emociones no verbales: risa, suspiro y susurro. No hay control de enfado, tristeza, alegría ni intensidad graduable.
- Riesgo de alucinación acústica: al ser un pipeline generativo con reranking, puede producir palabras omitidas, mal pronunciadas o repeticiones; no hay verificación semántica, solo inteligibilidad medida con Whisper.
- No determinismo: la selección best-of-6 entre candidatos implica que una misma entrada puede devolver audios distintos entre ejecuciones.
- Naturaleza de preview (0,5): el autor anuncia "Nefes 1" con pesos abiertos, por lo que la API y el comportamiento pueden cambiar. Señales de madurez bajas: 19 likes y 0 descargas en el momento de la consulta, repositorio de 0,0 GB.
- Licencia: el sistema se declara Apache 2.0, pero se apoya en VoxCPM2, Whisper large-v3, WavLM-SV y clips generados con Maya1 cuyas licencias no se detallan en la información disponible; antes de uso comercial hay que verificar cada componente por separado.
- Riesgo de mal uso: al generar voz humana sintética con emociones, existe potencial de suplantación o desinformación; conviene etiquetar el audio como sintético.
- Sin métricas objetivas publicadas: no hay WER, MOS ni SIM que permitan avalar la calidad frente a alternativas comerciales.
- El modelo de preferencia usado en el reranking se entrenó con las valoraciones subjetivas de una sola persona, lo que introduce sesgo de estilo y de criterio de naturalidad.
- El repositorio no aloja los pesos: la reproducibilidad depende de que los modelos de terceros referenciados sigan disponibles con la misma versión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alicangunduz/nefes-0.5
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Vídeo explicativo (4:45, en turco, narrado por Nefes 0.5): https://youtu.be/7fFKtXG-cQs
- Repositorio de Whisper: https://github.com/openai/whisper
- Perfil del autor en X: https://x.com/alicangunduzdev
- Ejemplos de audio de la model card: https://huggingface.co/alicangunduz/nefes-0.5/resolve/main/samples/laugh_mid_sentence.mp3 · https://huggingface.co/alicangunduz/nefes-0.5/resolve/main/samples/sigh.mp3 · https://huggingface.co/alicangunduz/nefes-0.5/resolve/main/samples/whisper.mp3 · https://huggingface.co/alicangunduz/nefes-0.5/resolve/main/samples/two_tags.mp3
- Instalación: `pip install git+https://huggingface.co/alicangunduz/nefes-0.5`
