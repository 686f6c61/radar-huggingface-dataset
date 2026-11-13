# codebucketsolutions/bolo-syspin-kannada-female

## Resumen

`bolo-syspin-kannada-female` es un modelo de síntesis de voz (text-to-speech) para kannada, una lengua dravídica hablada principalmente en el estado de Karnataka (India) por más de 40 millones de personas. Lo publica el proyecto `codebucketsolutions` como parte de `bolo`, un servidor de voz que funciona sin PyTorch y que se apoya en el runtime sherpa-onnx. El modelo no es un desarrollo original: se trata de una conversión de formato del checkpoint Coqui VITS `SYSPIN/vits_Kannada_Female`, entrenado por el proyecto SYSPIN del SPIRE Lab del Indian Institute of Science (IISc) de Bengaluru, y los pesos no se han reentrenado ni modificado.

La relevancia de esta ficha es acotada pero clara: cubre un hueco poco atendido, la síntesis de voz en lenguas indias de recursos medios, con un empaquetado ONNX ligero (0,1 GB) pensado para despliegue en CPU y en entornos sin dependencias pesadas de aprendizaje profundo. Frente a los grandes modelos TTS multilingües, aquí prima la eficiencia y la facilidad de integración en un servidor de voz de producción.

Arquitectónicamente es un VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional variational autoencoder con discriminador adversarial, alineamiento monotónico y generador neuronal. No hay datos publicados sobre número de parámetros, longitud de contexto ni benchmarks, por lo que la ficha los marca como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por utterance, sin ventana de contexto definida) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; se asume FP32/FP16, sin confirmar) |
| Idiomas soportados | kannada (`kn`) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 |
| Formato de pesos | ONNX (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un VITS, la arquitectura end-to-end de Coqui TTS que combina un encoder de texto, un módulo de alineamiento monotónico basado en búsqueda (MAS), un decoder generativo y un discriminador multiperiodo para entrenamiento adversarial. VITS produce audio de forma directa desde texto, sin vocoder separado, lo que simplifica el despliegue y reduce la latencia frente a pipelines en cascada.

El entrenamiento original corresponde al proyecto SYSPIN (SPIRE Lab, IISc Bangalore), que publicó el checkpoint en formato Coqui. Los datos de entrenamiento son el corpus TTS SYSPIN para kannada, licenciado bajo CC-BY-4.0. La versión que nos ocupa es exclusivamente una conversión de formato de Coqui a ONNX realizada con `tools/voices/export_syspin.py` del repositorio `bolo`; no hay reentrenamiento, fine-tuning ni cambios en los pesos. No se dispone de información sobre número de tokens de entrenamiento, composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (en TTS no son habituales).

## Capacidades

- Síntesis de voz femenina en kannada a partir de texto de entrada.
- Generación de audio end-to-end sin vocoder externo (VITS).
- Ejecución en CPU mediante sherpa-onnx, sin necesidad de PyTorch.
- Integración con el servidor de voz `bolo` mediante `bolo pull syspin-kn-female`.
- Formato ONNX portable para despliegue en entornos embebidos o servidores ligeros.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un LLM).
- No soporta visión, audio de entrada ni modos de pensamiento.
- Capacidad multilingüe: únicamente kannada.

## Casos de uso

- **Lectura de contenidos en kannada**: convertir artículos, noticias o documentación a audio para aplicaciones de accesibilidad y consumo en movilidad; el modelo está especializado en la fonética y prosodia del kannada.
- **Asistentes de voz para atención al ciudadano**: integrar en servicios públicos de Karnataka (información de trámites, horarios, avisos) donde se requiere una voz femenina nativa y un despliegue sin GPU.
- **Sistemas de navegación y avisos hablados**: generar indicaciones de voz para apps de transporte o mapas en kannada, con latencia baja al ejecutarse en CPU vía sherpa-onnx.
- **Aprendizaje de idiomas**: producir material de escucha para estudiantes de kannada, con pronunciación consistente y sin dependencia de servicios en la nube.
- **Automatización de locuciones para medios locales**: generar voces en off para vídeos, pódcast o boletines en kannada dentro de pipelines de producción ligeros.
- **Integración en dispositivos de borde**: desplegar en Raspberry Pi o servidores pequeños gracias al tamaño reducido (0,1 GB) y a la ausencia de PyTorch, para kioscos o terminales de información.
- **Prototipado rápido de interfaces de voz**: usar el servidor `bolo` para levantar un endpoint TTS en kannada en minutos y validar productos antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo ONNX de 0,1 GB, la inferencia puede ejecutarse en CPU sin GPU; en GPU el consumo sería inferior a 1 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no aplica de forma estricta; cualquier GPU consumer (GTX 1660, RTX 3060, RTX 4090) puede ejecutarlo, pero el diseño apunta a CPU.
- Cabe en GPU consumer: sí, con enorme holgura; también en dispositivos de borde y Raspberry Pi.
- Opciones de despliegue: sherpa-onnx (runtime principal), servidor `bolo` (`bolo pull syspin-kn-female`), y cualquier runtime compatible con ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada; al ser VITS en ONNX sobre CPU, se espera latencia de decenas a cientos de milisegundos por utterance, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bolo-syspin-kannada-female | Kannada | VITS (ONNX) | 0,1 GB | MIT | Hugging Face |
| SYSPIN/vits_Kannada_Female | Kannada | VITS (Coqui) | no disponible | MIT | Hugging Face |
| Modelos TTS multilingües de gran escala (p. ej. XTTS, MMS-TTS) | Multilingüe | VITS / transformer | variable | variable | Hugging Face |

La comparación directa más relevante es con el checkpoint original de SYSPIN, del que este modelo es una conversión de formato; la diferencia práctica es la portabilidad a ONNX y la integración con sherpa-onnx. Frente a modelos TTS multilingües de gran escala, este modelo sacrifica cobertura idiomática a cambio de ligereza y despliegue sin PyTorch. No se dispone de datos de benchmarks para una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta kannada; no es utilizable para otros idiomas sin reentrenamiento.
- Es un modelo TTS, no un LLM: no razona, no genera código ni mantiene conversaciones.
- Alucinación en el sentido de errores de pronunciación, prosodia o entonación en palabras poco frecuentes o nombres propios; no hay evaluación publicada de calidad.
- No se han publicado métricas de MOS, WER ni benchmarks, por lo que la calidad subjetiva no está cuantificada.
- Sesgos: al derivar de un corpus concreto (SYSPIN), puede reflejar las características demográficas y dialectales de los hablantes originales; no hay análisis de sesgos disponible.
- Licencia MIT para los pesos, pero los datos de entrenamiento son CC-BY-4.0, lo que exige atribución al proyecto SYSPIN y al IISc en usos derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado más allá de la model card.
- La fecha de creación indicada (2026-11-13) es futura respecto a la redacción habitual de fichas; conviene verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/codebucketsolutions/bolo-syspin-kannada-female
- Modelo original: https://huggingface.co/SYSPIN/vits_Kannada_Female
- Repositorio del servidor bolo: https://github.com/cb-Sigma/bolo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx: no disponible en la información proporcionada
- Paper de VITS: no disponible en la información proporcionada
