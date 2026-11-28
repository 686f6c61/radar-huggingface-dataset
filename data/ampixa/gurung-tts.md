# ampixa/gurung-tts

## Resumen

`ampixa/gurung-tts` es un modelo de síntesis de voz (text-to-speech) para el idioma gurung (código ISO `gvr`), una lengua tibeto-birmana hablada principalmente en Nepal. Lo publica el usuario `ampixa` en Hugging Face bajo el identificador `ampixa/gurung-tts`. El modelo se distribuye en formato ONNX y está etiquetado con las arquitecturas Piper y VITS, lo que lo sitúa en la familia de sintetizadores neuronales ligeros orientados a inferencia en CPU y despliegue en dispositivos de recursos limitados.

La relevancia del modelo radica en su enfoque hacia lenguas de bajos recursos: el gurung (también llamado tamu-kyi) cuenta con un volumen limitado de corpus digitales y de herramientas de procesamiento del lenguaje natural, por lo que un TTS específico cubre un hueco que los modelos multilingües generalistas rara vez atienden con calidad. El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con un modelo VITS de tamaño compacto empaquetado en ONNX.

No obstante, el acceso al modelo está restringido (gated): es necesario aceptar condiciones adicionales en Hugging Face antes de descargarlo, y la licencia indicada (`gvrwbt-source-terms-pending`) sugiere que los términos de uso todavía no están cerrados. El repositorio no registra descargas ni likes en el momento de la consulta y no incluye información pública sobre arquitectura detallada, datos de entrenamiento ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (según tags del repositorio; empaquetado para Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (distribución en ONNX; cuantizaciones concretas no especificadas) |
| Idiomas soportados | gurung (`gvr`) |
| Licencia | `gvrwbt-source-terms-pending` (términos pendientes; acceso restringido) |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo se etiqueta con VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) y con Piper, el motor de síntesis neuronal ligero que emplea una variante de VITS optimizada para inferencia en CPU. VITS es una arquitectura end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial de múltiples periodos y escalas durante el entrenamiento. El resultado es un modelo que genera formas de onda directamente a partir del texto sin necesidad de un vocoder separado.

No se dispone de información pública sobre el corpus de entrenamiento: ni el número de horas de audio, ni la procedencia de las grabaciones, ni si se aplicaron técnicas de aumento de datos, alineamiento forzado o ajuste fino sobre un modelo preentrenado multilingüe. Tampoco se documentan detalles sobre el proceso de exportación a ONNX ni sobre la versión de Piper utilizada. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo inferido por los tags sería especulativa.

## Capacidades

- Síntesis de voz a partir de texto en gurung (`gvr`), con salida de audio generada de forma end-to-end.
- Inferencia mediante runtime ONNX, lo que permite despliegue en CPU sin dependencias de GPU.
- Compatibilidad declarada con el ecosistema Piper (tags `piper`, `vits`), lo que facilita su integración en pipelines de TTS ligeros.
- Orientación a lenguas de bajos recursos, con foco explícito en el contexto nepalí (tags `nepal`, `low-resource`, `tibeto-burman`).
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multihablante ni soporte de otros idiomas.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Accesibilidad para hablantes de gurung: convertir texto escrito en audio para personas con discapacidad visual o dificultades lectoras, aprovechando que el modelo es ligero y puede ejecutarse localmente en ONNX sin conexión.
- Preservación lingüística y digitalización: generar narraciones de material educativo, cuentos tradicionales o textos comunitarios en gurung para archivos sonoros y plataformas de documentación de lenguas minoritarias.
- Interfaces de voz en aplicaciones comunitarias: integrar el modelo en apps de servicios locales (salud, agricultura, avisos municipales) para leer en voz alta información dirigida a hablantes de gurung que no leen con fluidez el nepalí o el inglés.
- Lectura de noticias y boletines: convertir boletines de radio comunitaria o textos informativos en audio para su emisión o distribución por canales de mensajería.
- Sistemas de anuncios y señalización: generar mensajes de audio pregrabados para transporte, mercados o espacios públicos donde se requiera comunicación en gurung.
- Prototipado de asistentes conversacionales en lengua minoritaria: usar el TTS como componente de salida de un asistente de voz, combinándolo con ASR y un LLM adaptados al gurung, en un despliegue de bajo coste sobre CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en despliegue ONNX sobre CPU; en caso de ejecutarse en GPU mediante runtime ONNX, el modelo es de tamaño muy reducido (~0,1 GB de repositorio), por lo que cabría en cualquier GPU consumer con varios GB de memoria.
- GPU recomendadas: no disponible; el modelo está pensado para inferencia en CPU.
- Cabe en GPU consumer: sí, con amplio margen, aunque el caso de uso natural es CPU.
- Opciones de despliegue: runtime ONNX (onnxruntime), Piper (si el empaquetado es compatible con su formato de voz), y contenedores ligeros en servidores sin GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano | Licencia | Acceso |
|---|---|---|---|---|---|
| `ampixa/gurung-tts` | gurung (`gvr`) | VITS / Piper (ONNX) | ~0,1 GB | términos pendientes | restringido (gated) |
| Piper (voces oficiales) | múltiples, incluidas lenguas minoritarias | VITS | variable por voz | MIT (motor) / según voz | abierto |
| MMS-TTS (Meta) | más de 1.100 lenguas | VITS | variable | CC-BY-NC | abierto |
| Coqui TTS (modelos comunitarios) | múltiples | VITS, Tacotron, etc. | variable | según modelo | abierto |

La comparación con voces oficiales de Piper es la más directa por arquitectura y formato, pero no se dispone de datos de calidad (MOS, WER) para establecer una comparación cuantitativa. MMS-TTS cubre un catálogo amplio de lenguas, aunque la cobertura del gurung y la calidad específica no están verificadas en la información disponible.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es descargable de forma anónima.
- Licencia no cerrada: `gvrwbt-source-terms-pending` indica que los términos de uso, incluido el uso comercial, no están definidos; no debe asumirse permiso de explotación comercial.
- Ausencia de documentación técnica: no hay información pública sobre corpus, horas de audio, hablantes, proceso de entrenamiento ni evaluación, lo que impide valorar sesgos, cobertura dialectal o calidad objetiva.
- Riesgo de pronunciación incorrecta y alucinación acústica: al ser un modelo de bajos recursos, es probable que presente errores en palabras poco frecuentes, préstamos del nepalí o el inglés, y nombres propios.
- Cobertura limitada a un único idioma (`gvr`) y, presumiblemente, a una o pocas voces; no se documenta variación de hablante ni de estilo.
- Sin métricas publicadas: no hay MOS, WER ni comparaciones con otros sistemas, por lo que su idoneidad para producción no puede validarse a priori.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido revisado por la comunidad.
- Fecha de creación futura en los metadatos (2026-11-28): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/ampixa/gurung-tts
- Piper (motor TTS): https://github.com/rhasspy/piper
- VITS (paper original): https://arxiv.org/abs/2106.06103
- ONNX Runtime: https://onnxruntime.ai/
