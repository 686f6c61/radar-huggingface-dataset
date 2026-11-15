# Phoonnx/vits-hitz-es_laura

## Resumen

`Phoonnx/vits-hitz-es_laura` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, exportado para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). Se trata de una voz concreta, identificada como `hitz/es_laura-vits`, extraída del repositorio agregador `Phoonnx/phoonnx-vits`, que reúne múltiples voces Piper/VITS en carpetas independientes. El modelo deriva de la familia Hitz, asociada históricamente a voces en euskera y castellano para Piper.

El modelo resuelve la necesidad de disponer de una voz TTS ligera y ejecutable en local, sin dependencia de servicios en la nube, adecuada para aplicaciones de lectura asistida, asistentes por voz o doblaje automatizado. Al estar en formato ONNX, puede ejecutarse en CPU con requisitos de hardware muy modestos, lo que lo hace atractivo para despliegues en dispositivos de borde.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, fue creado en noviembre de 2026 y apenas contiene una model card mínima que remite al repositorio de origen. No se especifican idiomas soportados, arquitectura detallada ni datos de entrenamiento, por lo que varias especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada de texto de longitud variable) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible (el identificador `es_laura` sugiere castellano, pero no se confirma en la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. VITS genera waveform directamente a partir de fonemas, sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. El modelo se distribuye ya exportado a ONNX, lo que permite inferencia con ONNX Runtime en CPU o GPU sin depender de PyTorch.

No se dispone de información sobre el corpus de entrenamiento, el número de horas de audio, el hablante concreto (más allá del identificador `laura`), ni sobre si se aplicaron técnicas de fine-tuning o adaptación. La model card indica que los ficheros conservan las rutas del repositorio de origen `Phoonnx/phoonnx-vits` y que la licencia es la que registra el repositorio fuente, que en este caso se declara como MIT.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en formato end-to-end.
- Generación de waveform directamente desde fonemas, sin vocoder externo.
- Inferencia mediante ONNX Runtime, con soporte para CPU y potencialmente GPU.
- Integración con la librería phoonnx a través del voice id `hitz/es_laura-vits`.
- Ejecución local sin dependencia de servicios en la nube.
- No se documentan capacidades de clonación de voz, control de estilo, emoción ni multilingüismo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Lectura asistida de documentos: el modelo puede convertir texto plano en audio para aplicaciones de accesibilidad, dado su bajo coste computacional y su formato ONNX ejecutable en CPU.
- Asistentes por voz en local: integrado en un pipeline de reconocimiento de voz más LLM, permite respuestas habladas sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- Doblaje automatizado de contenido corto: para vídeos, pódcast o audiolibros de dominio público, la voz `es_laura` puede generar narración continua siempre que se valide la calidad prosódica.
- Sistemas de anuncios y notificaciones: en aplicaciones industriales o de domótica, el modelo puede sintetizar mensajes cortos con baja latencia al ejecutarse en dispositivos de borde.
- Prototipado de interfaces conversacionales: al estar en ONNX y con licencia MIT, es adecuado para pruebas de concepto y demos de asistentes sin coste de API.
- Investigación en TTS: sirve como baseline Piper/VITS para comparar con modelos más recientes en tareas de naturalidad y latencia, aunque la falta de documentación limita su reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; los modelos VITS de Piper suelen ocupar entre 50 y 200 MB en ONNX, por lo que caben en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; al ser ONNX, puede ejecutarse en CPU, GPU integrada o GPU dedicada (RTX 3060, RTX 4090, A100) sin requisitos especiales.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1 GB de memoria, aunque el dato exacto no está documentado.
- Opciones de despliegue: ONNX Runtime, phoonnx; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Contexto/idioma | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-hitz-es_laura | VITS | ONNX | MIT | no disponible | Hugging Face (0 descargas) |
| Piper voices (rhasspy/piper-voices) | VITS | ONNX | MIT / otras según voz | Multilingüe, voces por idioma | Hugging Face, ampliamente usado |
| Coqui TTS (XTTS v2) | GPT-based + VITS | PyTorch | Coqui Public Model License (no comercial) | Multilingüe, clonación de voz | Hugging Face, GitHub |
| Kokoro TTS | StyleTTS2 + ISTFTNet | ONNX / PyTorch | Apache 2.0 | Inglés principalmente | Hugging Face, GitHub |

La comparativa es orientativa: no se dispone de métricas de calidad (MOS) ni de latencia para `vits-hitz-es_laura`, por lo que la comparación se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación mínima: la model card no especifica idioma, hablante, corpus ni métricas, lo que dificulta evaluar su idoneidad en producción.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa de calidad.
- Riesgo de alucinación en TTS: puede producir pronunciaciones incorrectas, omisiones o artefactos en textos con números, siglas o nombres propios no vistos en entrenamiento.
- Sesgos de voz: al ser una voz única (`laura`), no representa diversidad de acentos, edades ni géneros; puede no ser adecuada para aplicaciones que requieran variedad de hablantes.
- Limitaciones de idioma: aunque el identificador sugiere castellano, no se confirma el dialecto ni la cobertura fonética; textos en otros idiomas pueden producir resultados deficientes.
- Licencia MIT declarada, pero la model card remite a la licencia del repositorio fuente y menciona que algunas voces del agregador tienen `license: other`; conviene verificar la procedencia antes de uso comercial.
- Sin garantías de soporte ni mantenimiento: el repositorio parece un volcado automático de un agregador, sin documentación adicional ni issues abiertos.
- Formato ONNX sin información de cuantización: se desconoce si los pesos están en FP32, FP16 o INT8, lo que afecta a las estimaciones de memoria y latencia.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hitz-es_laura
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio kasanoma (referenciado en la model card): https://github.com/michsethowusu/kasanoma
