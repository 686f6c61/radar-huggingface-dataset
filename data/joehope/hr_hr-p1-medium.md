# joehope/hr_HR-p1-medium

## Resumen

`hr_HR-p1-medium` es un modelo de síntesis de voz (text-to-speech) para croata, desarrollado por el usuario joehope y publicado en Hugging Face. Se trata de una voz Piper basada en la arquitectura VITS, entrenada para un único hablante y con una frecuencia de muestreo de 22,05 kHz, lo que la sitúa en la categoría de calidad media dentro del ecosistema Piper. El modelo se distribuye principalmente en formato ONNX, listo para su uso con la CLI de Piper y con sherpa-onnx, e incluye además una versión cuantizada a int8 y un checkpoint de PyTorch Lightning para reentrenamiento.

El modelo resuelve un problema concreto: la escasez de voces TTS de calidad razonable para croata dentro del ecosistema de código abierto. Para ello, el autor parte de un checkpoint Piper de un idioma relacionado y realiza un warmstart cross-lingual, un flujo de trabajo documentado en Piper, sobre un corpus de habla croata. Esta técnica permite aprovechar el conocimiento fonético y acústico de un modelo ya entrenado para reducir los datos y el tiempo necesarios para obtener una voz funcional en un idioma de bajos recursos.

Su relevancia radica en que ofrece un artefacto ligero (0,4 GB de repositorio), desplegable en CPU, con licencia CC BY-SA 4.0 y con instrucciones detalladas para evitar los problemas habituales de integración con sherpa-onnx y espeak-ng. No es un modelo de propósito general ni un sistema multilingüe: es una voz mono-hablante y mono-idioma orientada a síntesis offline y a la creación de voces derivadas mediante fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variacional, end-to-end, con predictor de duración y decoder basado en flujos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto de longitud variable) |
| Tipos de cuantizacion | fp32 (nativo) e int8 (cuantización dinámica, `QuantType.QUInt8`, ~30 % del tamaño fp32) |
| Idiomas soportados | croata (hr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (fp32 e int8), PyTorch Lightning checkpoint (`.ckpt`) |
| Frecuencia de muestreo | 22,05 kHz |
| Hablantes | 1 (single-speaker) |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema TTS end-to-end que combina un encoder de texto, un predictor de duración estocástico, un módulo de flujo normalizador y un decoder generativo, entrenado de forma adversarial junto con un discriminador. Piper empaqueta esta arquitectura en un grafo ONNX autocontenido que incluye el frontend fonémico basado en espeak-ng, lo que permite inferencia offline sin dependencias de Python pesadas. La variante `medium` de Piper corresponde a un compromiso entre calidad y velocidad, con 22,05 kHz de muestreo frente a los 16 kHz de las variantes `low` y `x_low`.

El entrenamiento se realizó mediante warmstart cross-lingual: el autor partió de un checkpoint Piper de un idioma relacionado, obtenido del dataset `rhasspy/piper-checkpoints` en Hugging Face, y lo ajustó sobre un corpus de habla croata de un único hablante. La model card no especifica el número de tokens, la duración total del audio ni la composición exacta del dataset, por lo que estos datos deben considerarse no disponibles. El checkpoint publicado (`hr_HR-p1-medium-warmstart.ckpt`) tiene el estado del optimizador eliminado, lo que reduce su tamaño a aproximadamente un tercio del original; está pensado para `--model.warmstart_ckpt` y no para reanudar un entrenamiento exacto con `--ckpt_path`.

## Capacidades

- Síntesis de voz a partir de texto en croata, con salida de audio a 22,05 kHz.
- Fonemización mediante espeak-ng con la voz `hr`, integrada en el flujo de Piper y sherpa-onnx.
- Control de velocidad de habla mediante el parámetro `speed` en la API de sherpa-onnx.
- Inferencia offline en CPU, sin necesidad de GPU, gracias al grafo ONNX.
- Soporte de dos rutas de despliegue: CLI de Piper (fp32 e int8) y sherpa-onnx (C++ o Python).
- Base para fine-tuning de nuevas voces croatas mediante warmstart desde el checkpoint incluido.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de artículos y documentos en croata: el modelo convierte texto plano en audio inteligible para aplicaciones de accesibilidad, con la ventaja de ejecutarse en CPU y sin conexión, lo que facilita su integración en lectores de pantalla y dispositivos de bajo consumo.
- Generación de avisos y anuncios en sistemas de megafonía: al ser una voz mono-hablante y ligera, puede pregenerar o sintetizar en tiempo real mensajes en croata para transporte público, aeropuertos o comercios, con la versión int8 cuando la latencia sea crítica.
- Audiolibros y contenido educativo: la calidad media a 22,05 kHz es suficiente para narración de material didáctico y podcasts, y el control de velocidad permite adaptar el ritmo a distintos públicos.
- Creación de voces derivadas para proyectos locales: el checkpoint `warmstart` permite a desarrolladores croatas ajustar el modelo con un hablante propio mediante `piper.train fit`, reutilizando el conocimiento fonético ya adquirido y reduciendo los datos necesarios.
- Integración en asistentes de voz embebidos: sherpa-onnx ofrece una API C++ y Python adecuada para dispositivos edge (Raspberry Pi, routers, electrodomésticos) donde no hay GPU ni conectividad fiable.
- Pruebas de regresión y evaluación de pipelines TTS: el par fp32/int8 y el bundle de sherpa-onnx permiten comparar calidad y velocidad en un mismo idioma, útil para equipos que construyen infraestructura de voz multilingüe.
- Prototipado de interfaces conversacionales en croata: combinado con un ASR y un LLM, el modelo puede cerrar el bucle de voz en demos y pruebas de concepto antes de invertir en voces comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas objetivas como MOS (Mean Opinion Score), MCD, WER de ASR sobre el audio sintetizado ni comparaciones cuantitativas con otras voces Piper. Tampoco se documentan cifras de latencia o throughput medidas. Cualquier valor de rendimiento debería obtenerse mediante evaluación propia sobre el hardware objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la ruta ONNX/CPU; el modelo está diseñado para ejecutarse en CPU. En caso de usar GPU con sherpa-onnx u otro runtime ONNX, el consumo sería mínimo (del orden de cientos de MB), aunque no se han publicado cifras oficiales.
- GPU recomendadas: no se especifican; el modelo no requiere GPU. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría acelerar la inferencia, pero no es el escenario previsto por el autor.
- Cabe en GPU de consumo: sí, con holgura, dado el tamaño del repositorio (0,4 GB) y la naturaleza del grafo VITS. También cabe en dispositivos sin GPU.
- Opciones de despliegue: CLI de Piper (`piper -m ... -c ...`), sherpa-onnx (CLI C++ y API Python, con la versión fijada `sherpa-onnx==1.10.46`), y cualquier runtime compatible con ONNX. No se mencionan vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles. La model card indica que la variante int8 es "más rápida" que fp32, pero sin cifras concretas.
- Nota de despliegue: para sherpa-onnx es necesario obtener `espeak-ng-data` desde un tarball de release de sherpa-onnx (no del sistema ni de Piper), pasar `lexicon=""` explícitamente en la API Python y fijar la versión `1.10.46` para evitar una regresión de la rueda 2.0.1 que devuelve audio vacío.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Muestreo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `joehope/hr_HR-p1-medium` | Croata | VITS (Piper) | 22,05 kHz | CC BY-SA 4.0 | ONNX fp32/int8, ckpt | Hugging Face |
| `rhasspy/piper-voices` (voces oficiales, p. ej. `en_US-lessac-medium`) | Múltiples (no croata en el conjunto oficial) | VITS (Piper) | 16-22,05 kHz según voz | MIT en la mayoría de voces | ONNX | Hugging Face, GitHub |
| `coqui/XTTS-v2` | Multilingüe (incluye croata) | TTS generativo con clonación de voz | 24 kHz | Coqui Public Model License (no comercial) | PyTorch | Hugging Face |
| `facebook/mms-tts-hrv` | Croata | VITS (MMS) | 16 kHz | CC BY-NC 4.0 | PyTorch | Hugging Face |

La comparativa se basa en características públicas de cada proyecto y no en evaluaciones directas frente a `hr_HR-p1-medium`, para el que no hay benchmarks publicados. Frente a las voces oficiales de Piper, este modelo aporta cobertura de croata, idioma ausente en el conjunto oficial, a costa de una licencia más restrictiva (CC BY-SA 4.0 frente a MIT). Frente a XTTS-v2, pierde clonación de voz y multilingüismo, pero gana en ligereza, despliegue en CPU y licencia permisiva para uso comercial con atribución y compartir igual. Frente a MMS-TTS-hrv, mejora la frecuencia de muestreo (22,05 kHz frente a 16 kHz) y permite uso comercial bajo CC BY-SA 4.0, mientras que MMS restringe el uso a fines no comerciales.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un único hablante, la voz hereda las características de ese hablante (edad, género, acento regional) y no representa la diversidad dialectal del croata. No se documentan evaluaciones de sesgo.
- Riesgo de alucinación y errores de pronunciación: como todo TTS, puede producir prosodia incorrecta, duraciones anómalas o pronunciaciones erróneas en palabras poco frecuentes, préstamos y nombres propios. La fonemización depende de espeak-ng, cuya cobertura del croata puede ser limitada.
- Limitaciones de contexto e idioma: es un modelo mono-idioma; el texto en otros idiomas se fonemizará con reglas croatas y producirá audio defectuoso. No hay control de emoción ni de estilo.
- Restricciones de licencia: CC BY-SA 4.0 exige atribución y compartir las obras derivadas bajo la misma licencia. La model card advierte explícitamente de tratar los pesos como "encumbered" hasta confirmación en contrario y de trasladar el aviso en cualquier redistribución. Es necesario revisar la licencia del checkpoint de origen (`rhasspy/piper-checkpoints`) antes de un uso comercial.
- Caveats de producción: la integración con sherpa-onnx requiere fijar `sherpa-onnx==1.10.46`, usar el `espeak-ng-data` del tarball de release y pasar `lexicon=""`; de lo contrario, la API devuelve cero muestras sin error en tiempo de carga. La versión int8 es más rápida pero de menor calidad, según el propio autor.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad. No se han publicado métricas de calidad objetivas.
- El checkpoint incluido no permite reanudar un entrenamiento exacto, ya que carece del estado del optimizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joehope/hr_HR-p1-medium
- Repositorio de Piper: https://github.com/rhasspy/piper
- Dataset de checkpoints de Piper: https://huggingface.co/datasets/rhasspy/piper-checkpoints
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Releases de sherpa-onnx (tarballs con `espeak-ng-data`): https://github.com/k2-fsa/sherpa-onnx/releases
- espeak-ng: https://github.com/espeak-ng/espeak-ng
