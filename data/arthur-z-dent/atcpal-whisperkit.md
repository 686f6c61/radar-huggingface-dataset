# Arthur-Z-Dent/atcpal-whisperkit

## Resumen

ATC Pal WhisperKit es una conversión a Core ML del modelo `jacktol/whisper-medium.en-fine-tuned-for-ATC`, un Whisper medium.en ajustado para reconocimiento de voz en comunicaciones de radio de control de tráfico aéreo (ATC). Lo publica Arthur-Z-Dent como parte de la infraestructura de su aplicación iOS ATC Pal, y su único valor añadido respecto al modelo original es el cambio de formato: pesos convertidos a Core ML para su uso con WhisperKit en iPhone, iPad y Mac.

El modelo resuelve un problema concreto: la transcripción de audio radiofónico ATC, caracterizado por ruido, solapamientos, vocabulario muy específico (indicativos, niveles de vuelo, pistas, rutas) y habla rápida. Al estar empaquetado en Core ML, permite inferencia local en dispositivos Apple sin depender de la nube, algo relevante para privacidad y latencia en cabina o en tierra.

La relevancia es acotada: no es un modelo nuevo ni un ajuste adicional, sino una distribución lista para producción en el ecosistema Apple. Su licencia MIT y su tamaño (~1,4 GB) lo hacen accesible, pero su ámbito es exclusivamente inglés y dominio ATC. La información disponible sobre arquitectura interna y entrenamiento procede del modelo base, no de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium.en), convertido a Core ML |
| Parametros totales | no disponible (Whisper medium.en tiene ~769 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper, no confirmado explicitamente) |
| Tipos de cuantizacion | FP16 (encoder, decoder y mel spectrogram) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | Core ML (whisperkit / whisperkittools); tokenizer `openai/whisper-medium.en` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper medium.en, un transformer encoder-decoder con atención completa diseñado para transcripción de audio. Esta publicación no entrena ni ajusta el modelo: parte de `jacktol/whisper-medium.en-fine-tuned-for-ATC` y realiza la conversión a Core ML mediante `whisperkittools`. El encoder de audio y el espectrograma mel se convierten en FP16; el decoder de texto también en FP16, aunque la comprobación PSNR de `whisperkittools` falla para este decoder porque la herramienta alimenta entradas aleatorias que llevan los pesos ajustados fuera del rango FP16. El autor indica que, sobre audio ATC real, el decoder FP16 iguala la conversión FP32 con una diferencia de 0,3 puntos porcentuales de WER, por lo que se omitió dicha comprobación.

El ajuste fino original se realizó sobre habla ATC; la model card no detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La única información cuantitativa sobre datos es la mención de las grabaciones de test ATCO2 (113 grabaciones, de las cuales 34 aparecen también en los datos de entrenamiento del modelo base) y la comparación con un Whisper small ajustado sobre ATCO2. No se documentan innovaciones técnicas adicionales más allá de la conversión a Core ML y el empaquetado compatible con WhisperKit.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés sobre audio de radio ATC.
- Transcripción de transmisiones cortas (el benchmark cubre fragmentos de 2 a 11 segundos).
- Inferencia local en dispositivos Apple (iPhone, iPad, Mac) mediante Core ML y WhisperKit.
- Descarga e integración directa a través de la API de WhisperKit (`WhisperKit.download` con variante `medium.en-atc`).
- Manejo de vocabulario específico de aviación y control de tráfico aéreo gracias al ajuste fino del modelo base.
- Normalización de números y deletreo en la evaluación (según la model card).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá de la propia ASR, ni modo thinking.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Transcripción de audio ATC en la app ATC Pal: el modelo se descarga como variante `medium.en-atc` y transcribe en local las transmisiones recibidas, sin enviar audio a servidores externos.
- Escucha asistida en tierra para aficionados y estudiantes de control aéreo: transcripción en tiempo casi real de frecuencias ATC en un iPhone o Mac, con latencia de ~0,84 s por transmisión en iPhone 17 y ~0,90 s en Mac serie M.
- Análisis posterior de grabaciones: procesar lotes de audio ATCO2 o grabaciones propias para generar transcripciones y estudiar fraseología, con un WER de referencia del 14,7 % en las 113 grabaciones de test.
- Entrenamiento y evaluación de pipelines ASR: servir como baseline ajustado a dominio para comparar con otros modelos (por ejemplo, el Whisper small ajustado a ATCO2, con 23,8 % de WER en el mismo conjunto).
- Prototipado de herramientas de accesibilidad o documentación: generar transcripciones de sesiones de radio para revisión manual, asumiendo que no son aptas para uso operacional.
- Integración en apps macOS/iOS de terceros: al estar en formato Core ML y con licencia MIT, puede incorporarse en aplicaciones que ya usen WhisperKit para otras tareas de voz, añadiendo una variante especializada en ATC.
- Investigación en ASR de dominio específico: el repositorio sigue el esquema de carpetas de `argmaxinc/whisperkit-coreml`, lo que facilita comparar conversiones y medir el impacto del formato en la precisión.

## Benchmarks y rendimiento

La model card proporciona resultados de WER sobre las grabaciones de test de ATCO2, con números y ortografía normalizados. "Clean" excluye las 34 grabaciones que también aparecen en los datos de entrenamiento del modelo base.

| Modelo | 113 grabaciones | 79 limpias |
|---|---|---|
| Modelo PyTorch original | 14,4 % | 15,8 % |
| Esta conversión (FP16) | 14,7 % | 16,1 % |
| Whisper small ajustado a ATCO2 (Core ML) | 23,8 % | 24,3 % |

Rendimiento medido: ~0,84 s por transmisión en iPhone 17 (rango 0,45–1,91 s para audio de 2–11 s; 31 transmisiones de audio ATC en vivo) y ~0,90 s por transmisión en un Mac serie M. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, lógicamente fuera del ámbito del modelo.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para inferencia en dispositivo con Core ML. El tamaño del repositorio es de ~1,5 GB y el modelo pesa ~1,4 GB en FP16.
- GPU recomendadas: no se especifican GPU de servidor; el objetivo son chips Apple (A-series en iPhone/iPad y M-series en Mac). No se documenta compatibilidad con A100, H100 o RTX 4090.
- Cabe en hardware de consumo: sí, en dispositivos Apple compatibles con Core ML y WhisperKit; el benchmark se realizó en un iPhone 17 y en un Mac serie M.
- Opciones de despliegue: WhisperKit (librería `whisperkit`) sobre Core ML. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: ~0,84 s por transmisión en iPhone 17 y ~0,90 s en Mac serie M, para transmisiones de 2–11 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER ATCO2 (113) | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| ATC Pal WhisperKit (este) | ~769 M (Whisper medium.en, no confirmado) | no disponible | 14,7 % | MIT | Core ML, Hugging Face |
| Modelo PyTorch original (`jacktol/whisper-medium.en-fine-tuned-for-ATC`) | ~769 M (no confirmado) | no disponible | 14,4 % | MIT | PyTorch, Hugging Face |
| Whisper small ajustado a ATCO2 (Core ML) | no disponible | no disponible | 23,8 % | no disponible | Core ML |

La comparativa se limita a los modelos mencionados en la model card. No se dispone de datos de otras alternativas de ASR para ATC en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que excluye su uso en comunicaciones ATC multilingües.
- Dominio restringido: ajustado a fraseología ATC; su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior.
- No apto para uso operacional: la propia model card advierte que las transcripciones son solo para escucha y entrenamiento.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible no presente en el audio, especialmente con ruido o solapamientos; no se documentan mitigaciones específicas.
- Sesgos: no se documentan sesgos conocidos, pero el ajuste fino sobre un corpus concreto (ATCO2) puede reflejar las características de acento, equipos y fraseología de ese corpus.
- Fuga de datos en la evaluación: 34 de las 113 grabaciones de test aparecen en los datos de entrenamiento del modelo base; los resultados "clean" (16,1 %) son la referencia más honesta.
- Decoder FP16 sin validación PSNR: la comprobación estándar de `whisperkittools` se omitió; la equivalencia con FP32 se sostiene solo en la medición de WER sobre audio real (0,3 puntos de diferencia).
- Dependencia del ecosistema Apple: el formato Core ML limita su uso a dispositivos Apple; no es desplegable en servidores x86/GPU NVIDIA sin reconversión.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el uso recae en el integrador.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de adopción ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/Arthur-Z-Dent/atcpal-whisperkit
- Modelo base: https://huggingface.co/jacktol/whisper-medium.en-fine-tuned-for-ATC
- WhisperKit (repositorio): https://github.com/argmaxinc/WhisperKit
- Colección de referencia de conversiones Core ML: https://huggingface.co/argmaxinc/whisperkit-coreml
- Tokenizer: https://huggingface.co/openai/whisper-medium.en
