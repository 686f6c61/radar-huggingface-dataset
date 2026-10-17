# Allinsama/ResembleAI__chatterbox

## Resumen

Chatterbox es un modelo de texto a voz (TTS) de código abierto desarrollado por Resemble AI, publicado bajo licencia MIT. Esta ficha corresponde al repositorio `Allinsama/ResembleAI__chatterbox`, un espejo de terceros que empaqueta los pesos de la familia Chatterbox con la librería `chatterbox`; no es el repositorio oficial de la organización. El modelo resuelve dos problemas clásicos del TTS open source: la clonación de voz zero-shot con calidad cercana a sistemas cerrados y la cobertura multilingüe amplia con un único modelo.

La versión documentada en la model card es **Chatterbox Multilingual V3**, con un backbone tipo Llama de 0,5B parámetros y soporte de 23 idiomas (entre ellos español, catalán no incluido, portugués, árabe, hindi, japonés y chino). Frente a V2, V3 se centra en tres ejes: mayor similitud del hablante entre idiomas, reducción de alucinaciones (continuaciones no solicitadas, repeticiones y habla fuera del guion) y generación más conversacional. La familia incluye además un *Single Language Pack* con seis ajustes finos dedicados (chino, español de España, español latinoamericano, portugués de Portugal, portugués de Brasil e hindi).

Su relevancia actual está en la combinación de licencia permisiva (MIT), tamaño reducido (0,5B), control de exageración/intensidad emocional —una capacidad poco común en TTS abiertos—, marca de agua en las salidas y una inferencia estabilizada mediante *alignment-informed inference*. El repositorio ocupa 13,9 GB, lo que sugiere que el paquete incluye varios checkpoints (V3 multilingüe más los finetunes por idioma), no un único conjunto de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con backbone tipo Llama de 0,5B, orientado a síntesis de voz |
| Parametros totales | ~500M (0,5B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | 23: arabe, danes, aleman, griego, ingles, espanol, finlandes, frances, hebreo, hindi, italiano, japones, coreano, malayo, neerlandes, noruego, polaco, portugues, ruso, sueco, suajili, turco y chino |
| Licencia | MIT |
| Formato de pesos | no disponible en la informacion proporcionada (repositorio de 13,9 GB, libreria `chatterbox`) |

## Arquitectura y entrenamiento

Chatterbox emplea un backbone tipo Llama de 0,5B parámetros adaptado a generación de habla, con decodificación autorregresiva de tokens de audio y control de generación mediante dos hiperparámetros expuestos al usuario: `exaggeration` (intensidad expresiva) y `cfg` (escala de *classifier-free guidance*). La model card cita explícitamente una inferencia "ultra-stable" basada en *alignment-informed inference*, es decir, el alineamiento texto-habla condiciona el proceso de decodificación para evitar desviaciones, y una marca de agua aplicada a todas las salidas. No se detallan en la información disponible el tokenizador de audio, el códec vocacional ni la formulación exacta del alineamiento.

En cuanto a datos, el modelo se entrenó con 0,5 millones de horas de datos limpiados (500.000 horas), según la model card. No se especifica la composición del corpus por idioma, el número de tokens, ni si hubo etapas de RLHF o DPO. Sí se documenta una capacidad diferencial: control de exageración emocional, que la card presenta como la primera implementación de este tipo en un TTS open source. La familia se organiza en un modelo multilingüe general (V3, 500M) y seis finetunes monoidioma de 500M cada uno para mercados donde el control de calidad y el dialecto regional son críticos.

## Capacidades

- Síntesis de voz multilingüe en 23 idiomas con un único modelo, incluido español (con variantes dedicadas de España y Latinoamérica).
- Clonación de voz zero-shot a partir de una muestra de referencia, con preservación de identidad y acento entre idiomas.
- Control de exageración emocional (`exaggeration`) y de adherencia al texto (`cfg`), lo que permite desde lectura neutra hasta interpretación dramática.
- Inferencia estabilizada mediante *alignment-informed inference* para reducir alucinaciones y continuaciones no pedidas.
- Conversión de voz (*voice conversion*) mediante un script dedicado incluido en el proyecto.
- Salidas con marca de agua, orientada a trazabilidad de audio generado.
- Ajustes finos monoidioma para chino, español de España, español latinoamericano, portugués de Portugal, portugués de Brasil e hindi.
- Valores por defecto documentados: `exaggeration=0.5` y `cfg=0.5` para uso general y agentes de voz; `cfg` en torno a 0,3 con `exaggeration` ~0,7 para habla expresiva o dramática.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso ni procesamiento de visión o audio de entrada más allá del prompt de referencia de voz.

## Casos de uso

- **Doblaje y localización de vídeo:** el modelo permite generar una misma voz sintética en los 23 idiomas soportados, manteniendo la identidad del hablante original entre idiomas; es adecuado para catálogos que necesitan una voz coherente en múltiples mercados sin contratar un actor por idioma.
- **Atención al cliente con agentes de voz:** con valores `exaggeration=0.5` y `cfg=0.5`, el modelo produce habla neutra y estable, apta para respuestas de agente; el control de `cfg` permite ajustar el ritmo cuando la referencia habla rápido, un problema habitual en voces clonadas de operadores humanos.
- **Audiolibros y contenido largo:** la reducción de alucinaciones de V3 y el alineamiento forzado con el texto son críticos en narración de horas de duración, donde una sola repetición o frase inventada obliga a regenerar el fragmento.
- **Accesibilidad y lectura de pantalla:** un modelo de 0,5B con licencia MIT se puede embeber en aplicaciones de escritorio o móviles para lectura de texto a voz personalizada por usuario, incluyendo clonación de la propia voz del usuario.
- **Videojuegos y NPCs:** el control de exageración permite variar la interpretación del mismo personaje según el contexto (combate, diálogo tranquilo, cinemática) sin entrenar voces adicionales.
- **Prototipado de anuncios y piezas de marketing:** la clonación zero-shot y el control expresivo permiten generar maquetas de locución en minutos para validar un guion antes de contratar la locución final.
- **Investigación en TTS y evaluación de watermarking:** las salidas marcadas de forma sistemática permiten usar el modelo como referencia en estudios de detección de audio sintético y de sesgos de hablante.
- **Contenido educativo multilingüe:** cursos y materiales que deben cubrir 20+ idiomas con presupuesto limitado pueden usar el Single Language Pack donde exista y el modelo V3 en el resto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card únicamente afirma que Chatterbox ha sido comparado con sistemas cerrados como ElevenLabs y que resulta "consistentemente preferido" en evaluaciones lado a lado, con enlace a un panel de Podonos; no se aportan métricas objetivas (MOS, WER, SIM, CMOS) ni tamaños de muestra.

| Benchmark | Resultado | Nota |
|---|---|---|
| MMLU / HumanEval / GSM8K | no aplica | modelo de TTS, no de texto |
| Comparativa lado a lado frente a ElevenLabs | preferencia declarada por Chatterbox | sin cifras publicadas en la información disponible |
| MOS, WER, similitud de hablante (SIM) | no disponible | no se reportan valores numéricos |
| Latencia | no disponible para los pesos abiertos | la API comercial de Resemble AI declara <200 ms, no atribuible al modelo self-hosted |

## Requisitos de hardware

- **VRAM estimada para inferencia:** con 0,5B parámetros, los pesos ocupan aproximadamente 1 GB en fp16/bf16 y unos 2 GB en fp32; contando cachés de activación, códec de audio y el prompt de referencia, una estimación razonable de trabajo es de 4 a 8 GB de VRAM (estimación propia, no confirmada en la información disponible).
- **GPU consumer:** cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; también en GPUs de 8 GB si se limita la longitud de generación y el *batch size*.
- **GPU de datacenter:** A100, H100 y L40S son sobredimensionadas para un solo flujo, pero adecuadas para servir muchos flujos concurrentes o para reentrenamiento y finetuning.
- **CPU:** no se documenta soporte ni rendimiento en CPU; la librería `chatterbox` está orientada a PyTorch con GPU.
- **Opciones de despliegue:** librería `chatterbox` (PyTorch) y aplicaciones Gradio (los Spaces oficiales de Resemble AI). No se documenta en la información disponible soporte para vLLM, TGI, llama.cpp u Ollama, que son infraestructuras para modelos de texto.
- **Latencia y throughput:** no disponibles para los pesos abiertos. La referencia de <200 ms corresponde al servicio comercial de Resemble AI, no a una ejecución local.
- **Almacenamiento:** el repositorio completo ocupa 13,9 GB, por lo que conviene descargar solo el checkpoint necesario en lugar del paquete entero.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento general sobre modelos públicos y no han sido verificados en la información proporcionada; tómense como orientativos.

| Modelo | Parametros | Idiomas | Licencia | Contexto / notas |
|---|---|---|---|---|
| Chatterbox Multilingual V3 | ~500M | 23 | MIT | Control de exageración, watermarking, clonación zero-shot |
| XTTS-v2 (Coqui) | ~467M | 17 | CPML (no comercial) | Clonación zero-shot, muy extendido, sin licencia comercial |
| Kokoro | ~82M | reducido (principalmente ingles y algunas lenguas) | Apache 2.0 | Muy ligero y rápido, cobertura multilingüe limitada |
| F5-TTS | ~336M | ingles y chino principalmente | CC-BY-NC | Calidad alta, licencia no comercial |
| Orpheus TTS | ~3B | ingles | Apache 2.0 | Mayor tamano, menor cobertura de idiomas |
| ElevenLabs (cerrado) | no disponible | amplio | propietaria | Referencia comercial citada por la propia model card |

La ventaja diferencial de Chatterbox en esta tabla es la combinación de licencia MIT con 23 idiomas, algo que ninguna de las alternativas abiertas citadas ofrece simultáneamente.

## Limitaciones y advertencias

- **Repositorio espejo, no oficial:** `Allinsama/ResembleAI__chatterbox` es una republicación de terceros (0 descargas, 0 likes en el momento del análisis); para producción conviene verificar los pesos contra el repositorio oficial de Resemble AI y comprobar checksums.
- **Metadatos anómalos:** las fechas de creación y actualización del repositorio (2026-10-17) no son coherentes con el ciclo de publicación conocido de la familia Chatterbox, lo que refuerza la cautela sobre el empaquetado.
- **Alucinación de audio:** aunque V3 reduce continuaciones no deseadas, repeticiones y habla fuera de guion, el fenómeno no está eliminado; en pasajes largos o textos atípicos puede requerir regeneración por fragmentos.
- **Dependencia de la referencia:** la similitud y el acento dependen de la muestra de voz de referencia; referencias ruidosas, con música o con habla solapada degradan el resultado.
- **Cobertura desigual por idioma:** la card no publica métricas por idioma; los 23 idiomas no implican calidad homogénea, y de hecho la existencia de finetunes dedicados para seis de ellos sugiere que el modelo general es más débil en esos casos.
- **Sesgos:** no se documenta análisis de sesgos por género, edad, acento o variedad dialectal en los 500.000 horas de entrenamiento; la clonación de voz tiene además implicaciones evidentes de suplantación.
- **Marca de agua:** las salidas van marcadas, lo que puede ser un requisito legal en algunos contextos pero también un problema si se necesita audio sin trazabilidad; no se detalla el algoritmo ni su robustez frente a recompresión.
- **Licencia:** MIT permite uso comercial sin restricciones de la licencia, pero no exime del cumplimiento de normativa de deepfakes, consentimiento de voz y derechos de imagen en la jurisdicción de despliegue.
- **Sin datos de contexto ni de cuantización:** la longitud máxima de texto/audio por invocación no está publicada, lo que obliga a validar empíricamente el troceado de textos largos.
- **Ecosistema limitado:** no hay soporte documentado en vLLM, TGI, llama.cpp u Ollama, así que el despliegue queda atado al stack Python de `chatterbox`.

## Enlaces

- Repositorio analizado: https://huggingface.co/Allinsama/ResembleAI__chatterbox
- Demo de muestras: https://resemble-ai.github.io/chatterbox_demopage/
- Space oficial Chatterbox (inglés): https://huggingface.co/spaces/ResembleAI/Chatterbox
- Space oficial Chatterbox Multilingual TTS V3: https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS-V3
- Evaluación lado a lado en Podonos: https://podonos.com/resembleai/chatterbox
- Sitio del desarrollador (Resemble AI): https://resemble.ai
