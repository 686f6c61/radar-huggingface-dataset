# leon80148/taigi-cosyvoice3-lora-20261113

## Resumen

Taigi CosyVoice3 LoRA es un adaptador LoRA experimental para el modelo de síntesis de voz CosyVoice3 (concretamente sobre la variante Fun-CosyVoice3-0.5B-2512 de FunAudioLLM), desarrollado por el usuario leon80148. Su objetivo es dotar a CosyVoice3 de capacidad de síntesis de texto a voz en taiwanés hokkien (taigi, código ISO `nan`), además de clonación de voz a partir de un audio de referencia. El repositorio se publicó el 12 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones.

Se trata de un adaptador de pesos (no un modelo completo): el autor advierte explícitamente de que requiere un modelo base de inferencia "emparejado" y que aplicarlo directamente sobre el LLM upstream original no reproduce los resultados de esta versión. El Space asociado proporciona los pesos fusionados de inferencia correspondientes.

Por su naturaleza experimental, licencia restringida a investigación y estado de validación limitado (el propio autor reconoce que la pronunciación y la similitud de voz pueden variar), es relevante como muestra del ecosistema emergente de adaptaciones lingüísticas de bajo recurso sobre modelos TTS open source, pero no como una opción lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre CosyVoice3 (modelo base Fun-CosyVoice3-0.5B-2512); arquitectura interna del base no detallada en la información disponible |
| Parametros totales | no disponible (adaptador LoRA; el base declara 0.5B en su nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | taiwanés hokkien (taigi, `nan`) |
| Licencia | research-use-notice (licencia "other", uso de investigación; derechos de terceros no completamente aclarados) |
| Formato de pesos | no disponible (el repositorio figura con tamaño 0.0 GB; la model card indica que contiene solo tensores del modelo) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre CosyVoice3, en concreto sobre la variante Fun-CosyVoice3-0.5B-2512 de FunAudioLLM, un modelo de texto a voz. La información proporcionada no detalla la arquitectura interna del modelo base (tipo de decoder, tokenizador de audio, mecanismo de condicionamiento por audio de referencia), ni los hiperparámetros del LoRA (rango, alpha, módulos objetivo).

Tampoco se especifican los datos de entrenamiento: no se indica el número de horas de audio, la composición del corpus en taigi, ni si se emplearon técnicas de alineamiento, RLHF o ajuste supervisado. La model card señala únicamente que los pesos contienen solo tensores del modelo y que no se incluyen ni el dataset de entrenamiento ni las grabaciones de referencia. El autor advierte de que el adaptador debe combinarse con un modelo base de inferencia emparejado para reproducir el comportamiento publicado.

## Capacidades

- Síntesis de texto a voz (text-to-speech) en taiwanés hokkien (taigi).
- Clonación de voz a partir de un audio de referencia (reference-audio voice cloning).
- Integración como adaptador LoRA sobre CosyVoice3, lo que permite, en principio, reutilizar las capacidades del modelo base.
- Capacidades adicionales del base (tool calling, agentes, visión, audio de entrada, modo thinking) no documentadas en la información disponible para este adaptador.
- Capacidades multilingües: limitadas al taigi según los metadatos; el resto de idiomas del base no se detalla.

## Casos de uso

- Investigación en TTS para lenguas de bajo recurso: el adaptador permite experimentar con síntesis en taigi sobre una base consolidada como CosyVoice3, sirviendo de punto de partida para estudiar calidad, prosodia y cobertura fonética en una lengua con escasa representación en modelos comerciales.
- Generación de audio de referencia para documentación lingüística: útil en proyectos de preservación del hokkien taiwanés, siempre que se respete la licencia de solo investigación y se validen las muestras con hablantes nativos.
- Pruebas de clonación de voz controlada: el flujo de referencia permite evaluar la fidelidad de la clonación en taigi, con la advertencia del autor de que la similitud puede variar.
- Prototipado de asistentes conversacionales en taigi: combinado con un LLM y un ASR en la misma lengua, puede servir para demostraciones de diálogo por voz, aunque no para despliegue comercial sin aclarar derechos.
- Evaluación comparativa de adaptadores LoRA en TTS: útil como caso de estudio metodológico sobre cómo un LoRA de bajo rango afecta a la pronunciación y a la identidad de voz en un modelo base de 0.5B.
- Docencia y demostraciones: el Space público de clonación de voz permite mostrar el funcionamiento del adaptador sin necesidad de infraestructura propia, con fines educativos y de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un base de 0.5B parámetros, la huella es moderada, pero no se aportan cifras.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente sí para un base de 0.5B, pero no confirmado por el autor.
- Opciones de despliegue: el autor remite a un Space de Hugging Face con los pesos fusionados de inferencia; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Taigi CosyVoice3 LoRA (este) | LoRA sobre CosyVoice3 | Taigi (`nan`) | Base 0.5B (adaptador no cuantificado) | no disponible | research-use-notice | Hugging Face + Space |
| Fun-CosyVoice3-0.5B-2512 | TTS base | Multilingüe (según upstream) | 0.5B | no disponible | no disponible en esta ficha | Hugging Face (FunAudioLLM) |
| Alternativas TTS open source para lenguas de bajo recurso | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y otras alternativas; la comparativa se limita a aspectos de disponibilidad y licencia.

## Limitaciones y advertencias

- Modelo experimental: el autor lo califica explícitamente como demo de investigación; la pronunciación y la similitud de voz pueden presentar errores.
- Dependencia de un base emparejado: aplicar el LoRA sobre el LLM upstream original no reproduce esta versión; es necesario usar los pesos fusionados del Space asociado.
- Licencia restrictiva: `research-use-notice`; los derechos de terceros para redistribución sin restricciones y uso comercial no están plenamente aclarados, y el autor no garantiza que todos los derechos subyacentes estén resueltos.
- Sin dataset ni grabaciones de referencia: no es posible auditar la composición de los datos de entrenamiento ni la procedencia de las voces.
- Riesgo de sesgos y alucinaciones acústicas: no documentado; en TTS, los fallos se manifiestan como pronunciaciones incorrectas, prosodia anómala o artefactos, no como texto inventado.
- Cobertura lingüística limitada al taigi según los metadatos; no se detalla el comportamiento en otros idiomas.
- Sin métricas publicadas: no hay benchmarks, ni evaluaciones de MOS, WER de audio o similitud de hablante.
- Repositorio con tamaño declarado de 0.0 GB y sin descargas ni likes: indica un artefacto recién publicado y sin validación comunitaria.
- No apto para producción sin una revisión legal y técnica previa, especialmente en aplicaciones comerciales o de identidad de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leon80148/taigi-cosyvoice3-lora-20261113
- Space de clonación de voz: https://huggingface.co/spaces/leon80148/taigi-cosyvoice3-voice-clone
- Modelo base upstream: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Licencia del adaptador: https://huggingface.co/leon80148/taigi-cosyvoice3-lora-20261113/blob/main/LICENSE
