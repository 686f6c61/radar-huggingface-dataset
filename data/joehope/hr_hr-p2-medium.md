# joehope/hr_HR-p2-medium

## Resumen

`hr_HR-p2-medium` es un modelo de síntesis de voz (text-to-speech) para croata, desarrollado por el usuario joehope y publicado en Hugging Face bajo el ecosistema Piper. Se trata de una voz de un solo hablante construida sobre la arquitectura VITS, exportada a ONNX para su uso con la herramienta Piper y compatible también con el runtime sherpa-onnx. El modelo parte de un checkpoint de otro idioma eslavo mediante la técnica de warmstart cross-lingual documentada por Piper, y se ha afinado sobre un corpus de habla croata.

El modelo resuelve la necesidad de una voz TTS ligera, offline y de calidad media para croata, un idioma con relativamente pocos recursos en el ecosistema de síntesis de voz open source. Con una frecuencia de muestreo de 22,05 kHz y un tamaño de repositorio de 0,4 GB, está pensado para despliegues en local o en servidor sin dependencia de servicios en la nube.

La relevancia actual del modelo radica en su formato: al distribuirse como ONNX con cuantización int8 opcional y con un bundle listo para sherpa-onnx, se integra fácilmente en aplicaciones de lectura por voz, asistentes y pipelines de accesibilidad. La licencia CC BY-SA 4.0 impone condiciones de atribución y compartir-igual que conviene revisar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | fp32 (nativo) e int8 dinamica (`QuantType.QUInt8`) |
| Idiomas soportados | croata (hr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (fp32 e int8), checkpoint PyTorch Lightning para fine-tuning |
| Frecuencia de muestreo | 22,05 kHz |
| Voces | una sola hablante |
| Tamano del repositorio | 0,4 GB |
| Libreria | piper |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo end-to-end que combina un encoder de texto, un prior variacional y un decoder basado en flujo normalizador con un discriminador adversarial durante el entrenamiento. Piper exporta este modelo a ONNX para inferencia rápida en CPU, y el modelo resultante funciona con el CLI de Piper y con sherpa-onnx. La voz es de un solo hablante y opera a 22,05 kHz, lo que corresponde a la variante "medium" de Piper.

El entrenamiento se realizó mediante warmstart cross-lingual: se partió de un checkpoint de Piper de un idioma eslavo relacionado, obtenido del dataset `rhasspy/piper-checkpoints` en Hugging Face, y se afinó sobre un corpus de habla croata. La model card no especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). Se incluye un checkpoint PyTorch Lightning con el estado del optimizador eliminado (`hr_HR-p2-medium-warmstart.ckpt`), pensado para que terceros puedan afinar sus propias voces croatas mediante `--model.warmstart_ckpt`.

## Capacidades

- Síntesis de voz a partir de texto en croata, con salida de audio a 22,05 kHz.
- Generación de voz de un solo hablante, sin control de emoción ni de estilo más allá del parámetro de velocidad (`speed`).
- Fonemización mediante espeak-ng con la voz `hr` (croata), integrada en el flujo de Piper y sherpa-onnx.
- Inferencia offline en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Dos variantes de precisión: fp32 para máxima calidad e int8 para mayor velocidad con menor calidad.
- Compatibilidad con el CLI de Piper y con la API C++ y Python de sherpa-onnx.
- Punto de partida para fine-tuning de nuevas voces croatas gracias al checkpoint warmstart incluido.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz de artículos y documentos en croata: el modelo convierte texto plano en audio inteligible de forma local, adecuado para aplicaciones de accesibilidad o lectura de noticias sin depender de APIs externas.
- Asistentes de voz para dispositivos embebidos: al ser un modelo ONNX ligero que corre en CPU, puede integrarse en Raspberry Pi u otros dispositivos de bajos recursos para respuestas habladas en croata.
- Sistemas de navegación o anuncios por megafonía: la variante int8 ofrece mayor velocidad de inferencia, útil para generar avisos cortos en tiempo casi real.
- Generación de audiolibros o pódcasts automatizados: la calidad media y la frecuencia de 22,05 kHz son suficientes para contenido hablado no musical, y el procesamiento por lotes con Piper permite sintetizar textos largos.
- Pruebas de concepto y prototipado de productos de voz en croata: al estar disponible en formato ONNX y con bundle para sherpa-onnx, se puede integrar rápidamente en prototipos sin entrenar un modelo desde cero.
- Base para el desarrollo de nuevas voces croatas: el checkpoint warmstart permite a investigadores afinar el modelo con sus propios datos de habla, reduciendo el coste de entrenamiento frente a partir de cero.
- Localización de contenidos para audiencias croatas: útil para doblar o generar versiones en audio de materiales formativos o institucionales, siempre respetando la licencia CC BY-SA 4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues, ya que Piper y sherpa-onnx ejecutan el modelo en CPU mediante ONNX Runtime. En caso de usar GPU, el modelo fp32 ocupa una fracción del repositorio de 0,4 GB, por lo que cabría en cualquier GPU con al menos 1-2 GB de memoria libre; no se dispone de cifras oficiales.
- GPU recomendadas: no se especifican; el modelo está diseñado para inferencia en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) podría ejecutarlo, pero no es el escenario previsto.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo podría alojarlo, aunque el uso típico es en CPU.
- Opciones de despliegue: CLI de Piper (`piper -m ...`), sherpa-onnx (CLI C++ o API Python, con la versión fijada `sherpa-onnx==1.10.46` según la model card), y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles. La model card indica que la variante int8 es "más rápida" que la fp32, pero no proporciona cifras concretas.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Frecuencia | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| `joehope/hr_HR-p2-medium` | Croata | VITS (Piper) | 22,05 kHz | CC BY-SA 4.0 | ONNX fp32/int8, checkpoint | Voz única, warmstart cross-lingual |
| Voces Piper de otros idiomas eslavos (p. ej. `rhasspy/piper-voices`) | Checo, polaco, ruso, etc. | VITS (Piper) | 16-22,05 kHz según voz | MIT en la mayoría de voces oficiales | ONNX | Ecosistema de referencia; el modelo aquí descrito se basa en uno de ellos |
| `vits-piper-en_US-lessac-medium` (sherpa-onnx) | Inglés | VITS (Piper) | 22,05 kHz | MIT (según distribución de sherpa-onnx) | ONNX | Usado en la propia model card como referencia para obtener `espeak-ng-data` |

No se dispone de datos de benchmarks que permitan comparar la calidad subjetiva (MOS) de este modelo con alternativas. La comparación se limita a características técnicas y de licencia.

## Limitaciones y advertencias

- La licencia CC BY-SA 4.0 exige atribución y que las obras derivadas se distribuyan bajo la misma licencia; es un requisito relevante para uso comercial y para la redistribución de pesos o audios generados.
- La model card advierte explícitamente de que se trate los pesos como "CC BY-SA 4.0-encumbered" hasta que se confirme lo contrario, y de que se mantenga el aviso en cualquier redistribución.
- Calidad media: la propia denominación "medium" y la existencia de una variante int8 "de menor calidad" indican que no es un modelo de alta fidelidad; puede presentar artefactos en textos largos o con puntuación compleja.
- Una sola hablante: no hay control de género, emoción ni estilo, lo que limita su uso en aplicaciones que requieran variedad de voces.
- Dependencia de espeak-ng para la fonemización: la model card documenta que la copia de `espeak-ng-data` debe provenir de un tarball de release de sherpa-onnx y coincidir con la build compilada en el wheel, lo que añade complejidad de despliegue.
- Problema conocido con `sherpa-onnx` 2.0.1 (a fecha de noviembre de 2026): la API Python falla silenciosamente al inicializar el frontend de espeak y devuelve cero muestras; se recomienda fijar la versión 1.10.46.
- Riesgo de alucinación no aplica en el sentido de los modelos de lenguaje, pero sí puede haber errores de pronunciación en palabras extranjeras, siglas o números.
- Sin datos publicados sobre sesgos acústicos, cobertura dialectal del croata ni evaluación con hablantes nativos.
- El modelo no es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones complejas; su única función es convertir texto en audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joehope/hr_HR-p2-medium
- Repositorio de Piper: https://github.com/rhasspy/piper
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Dataset de checkpoints de Piper: https://huggingface.co/datasets/rhasspy/piper-checkpoints
- Tarball de referencia para `espeak-ng-data`: https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-lessac-medium.tar.bz2
