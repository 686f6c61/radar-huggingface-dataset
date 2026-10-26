# forgers20/tarteel-ai-onnx-whisper-base-ar-quran

## Resumen

`forgers20/tarteel-ai-onnx-whisper-base-ar-quran` es una conversión a formato ONNX del modelo `tarteel-ai/whisper-base-ar-quran`, un ajuste fino de OpenAI Whisper Base especializado en reconocimiento automático de voz (ASR) de árabe coránico. Lo publica el usuario `forgers20` (que en la propia model card figura también como `eventhorizon0`) y está pensado para ejecutarse en el navegador o en Node.js mediante Transformers.js, sin necesidad de backend Python ni de GPU dedicada.

El modelo original lo desarrolla Tarteel AI, la empresa detrás de la aplicación homónima de memorización del Corán, y parte de la arquitectura Whisper Base: un transformer encoder-decoder de aproximadamente 74 millones de parámetros que procesa ventanas de audio de 30 segundos. El ajuste fino restringe el modelo al dominio de la recitación coránica, lo que reduce el error en ese dominio concreto pero también limita su utilidad fuera de él.

Su relevancia ahora es práctica: permite integrar ASR de árabe coránico directamente en aplicaciones web cliente (por ejemplo, la web de seguimiento de recitación Follow Quran), con la licencia Apache 2.0 del modelo original y sin dependencias de infraestructura. El repositorio, sin embargo, tiene cero descargas y cero valoraciones en el momento de redactar esta ficha, y la model card es mínima, por lo que debe tratarse como un artefacto de conversión no validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Base: 6 capas de encoder y 6 de decoder, d_model 512, 8 cabezas de atención) |
| Parámetros totales | ~74 M (heredados de Whisper Base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (1500 frames de espectrograma mel); decoder con máximo de 448 tokens |
| Tipos de cuantización | ONNX con varias variantes de precisión en el repositorio (2,4 GB en total); la model card no detalla la lista exacta |
| Idiomas soportados | Árabe (orientado a árabe coránico / árabe clásico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, consumible con Transformers.js |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Base de OpenAI: un encoder que consume un espectrograma mel de 80 canales sobre ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto, con atención cruzada entre ambos. El modelo es multilingüe en su origen, pero este ajuste fino se ha especializado en árabe coránico, de modo que el vocabulario efectivo y la distribución de salida quedan fuertemente sesgados hacia el texto del Corán y hacia la fonética de la recitación (taywid).

Sobre el entrenamiento no hay información detallada en la documentación disponible: la model card original de `tarteel-ai/whisper-base-ar-quran` no especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El único dato publicado es el resultado en el conjunto de evaluación del modelo original, con una pérdida de 0,0839 y un WER de 5,7544 (recogido por agregadores de terceros a partir de la model card original). Este repositorio en concreto no documenta el proceso de conversión a ONNX: no se indica la herramienta empleada (por ejemplo, Optimum), ni las opciones de exportación, ni verificaciones de paridad numérica frente al modelo PyTorch.

## Capacidades

- Reconocimiento automático de voz en árabe coránico: transcripción de recitación del Corán a texto árabe.
- Ejecución en el navegador y en Node.js mediante Transformers.js con backend ONNX (WASM o WebGPU).
- Procesamiento de audio en ventanas de hasta 30 segundos por inferencia, con posibilidad de segmentar audios más largos en el cliente.
- Alineación con aplicaciones de seguimiento de recitación, tal como demuestra el ejemplo enlazado en la model card (Follow Quran).
- No se ha confirmado soporte de tool calling, function calling, razonamiento multi-paso, visión, audio generativo ni modo "thinking"; son capacidades ajenas al propósito del modelo.
- La capacidad de traducción al inglés propia de Whisper no está garantizada tras el ajuste fino al dominio coránico y no se documenta en la model card.

## Casos de uso

- Seguimiento de recitación en tiempo real: la aplicación captura el audio del usuario, lo envía al modelo en el navegador (Transformers.js) y compara la transcripción con el texto esperado del versículo para resaltar errores u omisiones, tal como hace Follow Quran.
- Corrección de taywid y memorización: el modelo transcribe lo recitado y la aplicación calcula la distancia frente al texto canónico, señalando palabras omitidas o mal pronunciadas para sesiones de repaso.
- Búsqueda por voz en corpus coránicos: el usuario recita un fragmento y la transcripción se usa como consulta de búsqueda indexada sobre el texto del Corán y traducciones asociadas.
- Alineación y subtitulado de grabaciones: procesar recitaciones pregrabadas por segmentos de 30 segundos para generar transcripciones con marcas temporales aproximadas y sincronizar audio con texto.
- Aplicaciones web offline o de bajo coste: al ser un modelo de ~74 M de parámetros en ONNX, puede empaquetarse en una PWA y ejecutarse en el dispositivo sin servidor, útil en contextos con conectividad limitada.
- Accesibilidad: transcripción en vivo de recitaciones o clases para personas con discapacidad auditiva, o lectura del texto reconocido por síntesis de voz.
- Transcripción de clases y lecciones de recitación: convertir sesiones docentes de árabe coránico en texto revisable, aceptando una tasa de error mayor que en la recitación individual.

## Benchmarks y rendimiento

Los únicos datos disponibles corresponden al modelo original del que se deriva esta conversión, y provienen de la model card de `tarteel-ai/whisper-base-ar-quran` tal como la recogen agregadores de terceros. No se han publicado métricas propias para la versión ONNX, ni mediciones de latencia o throughput.

| Modelo | Métrica | Valor | Conjunto de evaluación |
|---|---|---|---|
| tarteel-ai/whisper-base-ar-quran (original) | Loss | 0,0839 | Conjunto de evaluación no especificado |
| tarteel-ai/whisper-base-ar-quran (original) | WER | 5,7544 | Conjunto de evaluación no especificado |
| forgers20/tarteel-ai-onnx-whisper-base-ar-quran | WER / latencia / throughput | No disponible | No disponible |

No se han publicado resultados de benchmarks verificables para esta conversión ONNX en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo original en BF16 ocupa aproximadamente 290 MB, según el agregador AxForge; las variantes ONNX cuantizadas deberían reducir esa cifra por debajo de los 150 MB (estimación a partir del tamaño del modelo, no confirmada en el repositorio).
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer moderna (RTX 3060 o superior, según la referencia de AxForge) sobra para este tamaño; también funciona en GPUs integradas.
- Cabe en cualquier GPU consumer y en CPU: es un modelo de ~74 M de parámetros, concebido para ejecutarse incluso en el navegador del cliente con WebGPU o WASM.
- Opciones de despliegue: Transformers.js con ONNX Runtime Web (WASM/WebGPU), ONNX Runtime en servidor, y conversión adicional a otros formatos (por ejemplo whisper.cpp o faster-whisper) si se necesita, aunque dicha conversión no está documentada en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni para CPU ni para GPU, ni para el backend WASM ni para WebGPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| forgers20/tarteel-ai-onnx-whisper-base-ar-quran | ~74 M | 30 s por ventana | Árabe coránico | Apache 2.0 | ONNX (Transformers.js) | Hugging Face, 0 descargas |
| tarteel-ai/whisper-base-ar-quran | ~74 M | 30 s por ventana | Árabe coránico | Apache 2.0 | PyTorch (safetensors/bin) | Hugging Face, modelo de referencia |
| openai/whisper-base | ~74 M | 30 s por ventana | 99 idiomas | MIT | PyTorch, ONNX, GGML | Hugging Face, ampliamente adoptado |
| openai/whisper-small | ~244 M | 30 s por ventana | 99 idiomas | MIT | PyTorch, ONNX, GGML | Hugging Face, ampliamente adoptado |

Frente a `openai/whisper-base`, esta versión gana precisión en árabe coránico (WER de 5,75 según el modelo original) a costa de perder cobertura multilingüe y generalidad. Frente a `whisper-small`, ofrece un tercio de los parámetros y una latencia inferior en el navegador, pero menor capacidad en audio ruidoso o con acento no nativo. Frente al modelo original de Tarteel AI, solo cambia el formato: debería ser numéricamente equivalente, algo que el repositorio no verifica explícitamente.

## Limitaciones y advertencias

- Dominio muy restringido: está ajustado a árabe coránico; el rendimiento en árabe dialectal, árabe moderno estándar conversacional u otros idiomas no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación específico del dominio: los ajustes finos sobre texto coránico tienden a "corregir" el audio hacia versículos conocidos cuando la señal es ambigua o hay silencio, produciendo texto que el hablante no ha recitado. Whisper, además, es propenso a alucinar en segmentos sin voz.
- Discrepancia en los metadatos: las etiquetas del repositorio declaran `base_model: openai/whisper-large-v3`, mientras que la model card indica que deriva de `tarteel-ai/whisper-base-ar-quran`, que a su vez parte de Whisper Base. El tamaño del repositorio y los pesos apuntan a Whisper Base, pero la inconsistencia no está resuelta por el autor.
- Artefacto no validado: cero descargas y cero valoraciones; no hay pruebas publicadas de paridad numérica entre la versión ONNX y la original en PyTorch, ni de que la exportación conserve las marcas temporales.
- Documentación insuficiente: no se detallan las variantes de cuantización incluidas en los 2,4 GB del repositorio, ni el procedimiento de conversión, ni la herramienta utilizada.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no se documenta la procedencia ni las condiciones del dataset de ajuste fino del modelo original, lo que conviene verificar antes de un despliegue en producción.
- Sin información sobre sesgos: no hay evaluación de sesgos lingüísticos, de género ni de variedades de pronunciación regional.
- Repositorio duplicado: existe una copia publicada bajo el identificador `eventhorizon0/tarteel-ai-onnx-whisper-base-ar-quran`, lo que puede generar confusión sobre cuál es el artefacto canónico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/forgers20/tarteel-ai-onnx-whisper-base-ar-quran
- Copia del mismo artefacto con otro identificador: https://huggingface.co/eventhorizon0/tarteel-ai-onnx-whisper-base-ar-quran
- Modelo original de Tarteel AI: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-base
- Modelo declarado en las etiquetas (no coincide con la model card): https://huggingface.co/openai/whisper-large-v3
- Ejemplo de integración (Follow Quran, worker en TypeScript): https://github.com/unlocomqx/follow-quran/blob/main/src/lib/worker.ts
- Aplicación de Tarteel AI: https://tarteel.ai/
- Ficha del modelo original en Inferix (datos de evaluación): https://inferix.co/models/tarteel-ai/whisper-base-ar-quran
- Ficha del modelo original en AxForge (tamaño en BF16 y hardware mínimo): https://axforge.ai/models/whisper-ar-quran/
