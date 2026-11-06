# goaicorp/moore-tts-kokoro

## Resumen

Moore TTS Kokoro es un modelo de síntesis de voz (text-to-speech) publicado por goaicorp, un fine-tune del conocido Kokoro-82M de hexgrad, orientado específicamente al idioma moore (mos), una lengua de Burkina Faso. El modelo hereda la arquitectura ligera de Kokoro, diseñada para inferencia en tiempo real con un coste computacional muy bajo, y adapta su decodificador acústico al inventario fonético y a las particularidades prosódicas del moore.

La relevancia de este modelo reside en su carácter de recurso para lenguas de bajos recursos: el moore cuenta con millones de hablantes en África Occidental pero con una presencia mínima en sistemas de síntesis de voz comerciales. Al partir de una base Apache 2.0 de solo 82 millones de parámetros, el modelo es viable para despliegues en CPU, dispositivos de gama baja y entornos con conectividad limitada, lo que encaja con el contexto de uso previsto.

El repositorio es de acceso restringido (gated) y requiere aceptar condiciones en Hugging Face antes de su descarga. El tamaño del repo es de aproximadamente 0,3 GB, coherente con los pesos de un modelo de 82M de parámetros. No se han publicado métricas de calidad (MOS) ni detalles del corpus de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Kokoro-82M, arquitectura neuronal de TTS) |
| Parametros totales | 82M (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | moore (mos) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Tamano del repositorio | ~0,3 GB |
| Acceso | Restringido (gated) en Hugging Face |
| Modelo base | hexgrad/Kokoro-82M (fine-tune) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo es un fine-tune de hexgrad/Kokoro-82M, un sistema de TTS neuronal de 82 millones de parámetros conocido por su bajo coste de inferencia y su capacidad de generar voz en tiempo real incluso en CPU. Kokoro combina un codificador de texto con un decodificador acústico y un vocoder neuronal integrado; la adaptación al moore implica, presumiblemente, el ajuste del front-end fonético (grafema a fonema) y del decodificador para el inventario de sonidos de la lengua.

No se dispone de información sobre el corpus de entrenamiento: número de horas de audio, número de hablantes, procedencia de las grabaciones, ni si se aplicaron técnicas de aumento de datos o de normalización prosódica. Tampoco se documenta si hubo ajuste fino supervisado únicamente o alguna etapa adicional de alineamiento o evaluación perceptual. Los tags del repositorio incluyen "voice-cloning" y "mos" (probablemente referido a Mean Opinion Score o al código ISO del idioma), pero no se aporta detalle técnico sobre capacidades de clonación de voz.

## Capacidades

- Síntesis de voz a partir de texto en moore (mos).
- Generación de audio con la arquitectura ligera de Kokoro-82M, apta para inferencia de baja latencia.
- Posible soporte de clonación de voz, según el tag "voice-cloning" del repositorio, aunque no se documenta el mecanismo ni las condiciones de uso.
- Capacidades multilingües: limitadas al moore según la ficha del modelo; no se declaran otros idiomas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento, por tratarse de un modelo de TTS.
- No se documentan capacidades de visión ni audio de entrada.

## Casos de uso

- Accesibilidad para hablantes de moore: lectura de textos, noticias y documentos en voz alta para personas con discapacidad visual o dificultades de lectura, aprovechando el bajo coste de inferencia del modelo base.
- Locución automatizada de contenidos educativos: generación de audio para materiales escolares y cursos en moore, un idioma con escasez de recursos digitales de calidad.
- Asistentes de voz en servicios públicos de Burkina Faso: integración en líneas telefónicas o aplicaciones de información ciudadana (salud, agricultura, trámites) donde el moore es la lengua de uso cotidiano.
- Doblaje y subtitulado de contenido audiovisual: producción de pistas de audio en moore para vídeos divulgativos, campañas de ONG o medios locales, con un coste muy inferior al de la locución humana.
- Sistemas de megafonía y avisos automatizados: mensajes de alerta temprana (meteorológica, sanitaria) en zonas rurales, donde el despliegue en CPU o dispositivos de bajo consumo es viable gracias al tamaño reducido del modelo.
- Investigación en lenguas de bajos recursos: base para experimentos de adaptación de TTS, evaluación de inteligibilidad y comparación de técnicas de fine-tuning sobre Kokoro en lenguas africanas.
- Preservación lingüística: generación de corpus de audio sintético para documentación y enseñanza del moore, complementando grabaciones de hablantes nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa para un modelo de 82M de parámetros; el repo ocupa ~0,3 GB.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en cualquier GPU consumer y en dispositivos de gama baja, incluidos Raspberry Pi y móviles, siempre que el runtime lo permita.
- Opciones de despliegue: no documentadas en la ficha; al derivar de Kokoro-82M, es compatible con los runtimes habituales de ese modelo (por ejemplo, ONNX Runtime o implementaciones de referencia de Kokoro), aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles; el modelo base Kokoro-82M está diseñado para inferencia en tiempo real, pero no se aportan cifras para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| goaicorp/moore-tts-kokoro | 82M | moore (mos) | Apache 2.0 | Gated | Fine-tune de Kokoro para lengua de bajos recursos |
| hexgrad/Kokoro-82M | 82M | inglés y otros | Apache 2.0 | Abierto | Modelo base, sin soporte declarado de moore |
| Modelos TTS multilingües comerciales | no disponible | múltiples | Propietaria | API de pago | Sin cobertura específica de moore documentada |
| Otros TTS para lenguas africanas de bajos recursos | no disponible | variable | variable | variable | No se dispone de comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es descargable de forma anónima.
- Cobertura lingüística única: solo se declara el moore; no hay soporte multilingüe ni cambio de idioma.
- Sin métricas de calidad publicadas: no hay MOS, inteligibilidad ni comparativas perceptuales, por lo que la calidad real de la voz no puede evaluarse a priori.
- Corpus de entrenamiento no documentado: se desconoce el número de hablantes, horas de audio y diversidad dialectal, lo que impide estimar sesgos de género, edad o variación regional.
- Riesgo de alucinación acústica: como todo TTS neuronal, puede producir pronunciaciones incorrectas, prosodia antinatural o artefactos en palabras fuera del vocabulario de entrenamiento.
- Tag "voice-cloning" sin documentación: si el modelo permite clonación, deben considerarse riesgos de suplantación de identidad y la necesidad de consentimiento explícito de los hablantes.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated y los términos del modelo base.
- Escasez de datos de evaluación: sin benchmarks ni demos publicadas, la idoneidad para producción debe validarse con pruebas propias de inteligibilidad y naturalidad.
- Fecha de creación futura en la ficha (2026-11-03): conviene confirmar la vigencia y el mantenimiento del repositorio antes de integrarlo en un proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goaicorp/moore-tts-kokoro
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Perfil del autor: https://huggingface.co/goaicorp
